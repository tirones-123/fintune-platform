from celery import shared_task, Task
from loguru import logger
from sqlalchemy.orm import Session
import os
import time
import traceback
import json
from datetime import datetime
from typing import Optional

from app.db.session import SessionLocal
from app.models.dataset import Dataset, DatasetPair, DatasetContent
from app.models.content import Content
from app.services.ai_providers import get_ai_provider
from app.services.content_processor import content_processor
from app.services.character_service import character_service
from app.core.config import settings
from app.models.fine_tuning import FineTuning
from app.models.api_key import ApiKey

# Taille de chunk fixée à 3000 caractères (non configurable)
CHUNK_SIZE = 3000
# Modèle à utiliser (peut être paramétré)
DEFAULT_MODEL = settings.DEFAULT_AI_MODEL

def split_text_into_chunks(text, chunk_size=CHUNK_SIZE):
    """
    Découpe le texte en chunks d'une taille fixe de 3000 caractères.
    """
    if not text:
        return []
    return [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]

@shared_task(name="generate_dataset", bind=True, max_retries=5, default_retry_delay=60)
def generate_dataset(self: Task, dataset_id: int):
    """
    Generate a dataset from selected contents.
    Aggregates text from all completed contents, chunks the combined text,
    and generates QA pairs from those chunks.
    """
    logger.info(f"Tâche generate_dataset reçue pour dataset ID: {dataset_id}")
    db: Optional[Session] = None # Initialiser à None
    dataset: Optional[Dataset] = None

    try:
        # --- CORRECTED RETRY MECHANISM WITH NEW SESSION PER TRY ---
        try:
            db = SessionLocal() # Nouvelle session pour cette tentative
            dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
            if not dataset:
                logger.warning(f"Dataset {dataset_id} not found, will retry...")
                # Lever une exception spécifique ou une exception générique pour déclencher le retry
                raise ValueError("Dataset not found yet, retry") 
            logger.info(f"Dataset {dataset_id} found.")
        except Exception as e:
            if db: # Fermer la session si elle a été ouverte
                db.close()
            logger.error(f"Error fetching dataset {dataset_id} or dataset not found, retrying task (attempt {self.request.retries + 1}/{self.max_retries}): {e}")
            # Utiliser le mécanisme de retry de Celery avec backoff exponentiel
            # countdown = 2 ** self.request.retries # Exponential backoff (2s, 4s, 8s...)
            countdown = 30 # Ou un délai fixe plus long (ex: 30 secondes)
            raise self.retry(exc=e, countdown=countdown, max_retries=5) # Retry 5 fois max
        # --- END CORRECTED RETRY MECHANISM ---
        
        # Si on arrive ici, dataset est trouvé et db est ouvert
        # (La session db reste ouverte depuis la tentative réussie)

        # --- Vérifier si les contenus sont prêts ---
        # (Vérification importante AVANT de changer le statut du dataset)
        dataset_contents_assoc = db.query(DatasetContent).filter(DatasetContent.dataset_id == dataset_id).all()
        content_ids = [dc.content_id for dc in dataset_contents_assoc]
        if not content_ids:
            logger.error(f"No contents associated with dataset {dataset_id}. Aborting.")
            dataset.status = "error"
            dataset.error_message = "No contents linked to this dataset."
            db.commit()
            return {"status": "error", "message": "No contents linked to dataset"}
            
        contents = db.query(Content).filter(Content.id.in_(content_ids)).all()
        pending_contents = [c for c in contents if c.status not in ['completed', 'error']]
        if pending_contents:
            pending_ids = [c.id for c in pending_contents]
            logger.warning(f"Dataset {dataset_id}: Contents {pending_ids} still processing. Retrying task...")
            # Il faut aussi un retry ici si les contenus ne sont pas prêts
            raise self.retry(countdown=30, max_retries=10) # Retry plus longtemps pour le traitement du contenu

        logger.info(f"All contents for dataset {dataset_id} are ready.")
        # --- Fin Vérification Contenus ---

        # Mettre à jour le statut du dataset à processing SEULEMENT si tout est prêt
        if dataset.status != "processing":
            dataset.status = "processing"
            db.commit() # Commit status change
            db.refresh(dataset) # Refresh pour avoir le nouveau statut

        # Récupérer provider et clé API (reste inchangé)
        provider_name = getattr(dataset, "provider", "openai")

        # -------------------------------------------------------------
        # Admin-key override : on utilise la clé définie dans settings
        # (OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.) pour générer le dataset.
        # Si elle est absente on retombe sur la clé utilisateur.
        # -------------------------------------------------------------
        admin_key_map = {
            "openai": settings.OPENAI_API_KEY,
            "anthropic": settings.ANTHROPIC_API_KEY,
            "mistral": settings.MISTRAL_API_KEY,
        }

        admin_key = admin_key_map.get(provider_name)

        if admin_key:
            logger.info(
                f"Using admin {provider_name} key for dataset generation (dataset {dataset_id})."
            )
            api_key_value = admin_key
        else:
            # Fallback : clé utilisateur comme avant
            if not dataset.project or not dataset.project.user_id:
                logger.error(
                    f"Dataset {dataset_id} is not associated with a project or user."
                )
                raise ValueError(
                    f"Dataset {dataset_id} has no valid project/user association."
                )

            api_key_record = (
                db.query(ApiKey)
                .filter(
                    ApiKey.user_id == dataset.project.user_id,
                    ApiKey.provider == provider_name,
                )
                .first()
            )

            if not api_key_record:
                error_msg = (
                    f"API Key for provider {provider_name} not found for user {dataset.project.user_id}"
                )
                logger.error(error_msg)
                dataset.status = "error"
                dataset.error_message = error_msg
                db.commit()
                return {"status": "error", "message": error_msg}

            api_key_value = api_key_record.key

        provider = get_ai_provider(provider_name, api_key_value)
        model = dataset.model or DEFAULT_MODEL

        # --- Logique d'agrégation, chunking, génération QA (reste inchangée) ---
        aggregated_text = ""
        processed_content_ids = []
        for content in contents:
            if content.status == 'error':
                logger.warning(f"Skipping content {content.id} due to previous error: {content.error_message}")
                continue
            
            text = content.content_text
            if text:
                aggregated_text += f"\n\n--- Contenu {content.id}: {content.name} ---\n\n" + text 
                processed_content_ids.append(content.id)
            else:
                logger.warning(f"No text found in content {content.id} (status: {content.status}) despite being 'completed'.")
        
        if not aggregated_text:
            dataset.status = "error"
            dataset.error_message = "No text could be extracted from any of the selected contents."
            db.commit()
            logger.error(f"No text aggregated for dataset {dataset_id} from contents {processed_content_ids}.")
            return {"status": "error", "message": "No text found in contents"}

        logger.info(f"Aggregated text from {len(processed_content_ids)} contents for dataset {dataset_id}. Total length: {len(aggregated_text)}")
        chunks = split_text_into_chunks(aggregated_text)
        logger.info(f"Split aggregated text into {len(chunks)} chunks for dataset {dataset_id}")

        total_pairs = 0
        all_pairs = []
        dataset_system_content = dataset.system_content or "No specific training goal provided for the dataset." # Get system content

        for i, chunk in enumerate(chunks):
            logger.info(f"Processing aggregated chunk {i+1}/{len(chunks)} for dataset {dataset_id}")
            try:
                # Pass system_content to generate_qa_pairs
                qa_pairs = provider.generate_qa_pairs(chunk, model, system_content=dataset_system_content)
                
                if qa_pairs:
                    valid_pairs_in_chunk = []
                    for pair in qa_pairs:
                         if isinstance(pair, dict) and "question" in pair and "answer" in pair:
                             valid_pairs_in_chunk.append(pair)
                         else:
                             logger.warning(f"Invalid QA pair format skipped: {pair}")
                    
                    if valid_pairs_in_chunk:
                        all_pairs.extend(valid_pairs_in_chunk) 
                        total_pairs += len(valid_pairs_in_chunk)
                        logger.info(f"Generated {len(valid_pairs_in_chunk)} pairs for chunk {i+1}.")
                    else:
                        logger.warning(f"No valid QA pairs generated for chunk {i+1}.")
                else:
                     logger.warning(f"No QA pairs generated for chunk {i+1}.")
                time.sleep(1)
            except Exception as e:
                logger.error(f"Error processing aggregated chunk {i+1}: {str(e)}")
                logger.error(traceback.format_exc())
        
        if total_pairs == 0:
            dataset.status = "error"
            dataset.error_message = "No QA pairs could be generated from the aggregated content."
            db.commit()
            logger.error(f"No pairs generated for dataset {dataset_id} from aggregated chunks.")
            return {"status": "error", "message": "No pairs could be generated"}

        logger.info(f"Adding {total_pairs} generated pairs to dataset {dataset_id}...")
        for idx, pair_data in enumerate(all_pairs):
             db_pair = DatasetPair(
                 question=pair_data["question"],
                 answer=pair_data["answer"],
                 dataset_id=dataset_id,
                 metadata={"aggregated_chunk_index": idx // (len(qa_pairs)/len(chunks)) if len(chunks)>0 and len(qa_pairs)>0 else 0} 
             )
             db.add(db_pair)
        db.commit()
        logger.info(f"Successfully added {total_pairs} pairs to the database.")

        total_characters = 0
        for pair in db.query(DatasetPair).filter(DatasetPair.dataset_id == dataset_id).all():
            total_characters += len(pair.question) + len(pair.answer)
        system_content = dataset.system_content or ""
        total_characters += len(system_content) * total_pairs
        logger.info(f"Dataset {dataset_id} final character count: {total_characters}")

        # -------------------------------------------------------------
        # Ancien : Décompte des caractères (déplacé)
        # -------------------------------------------------------------
        # Remplacer par la logique de process_dataset_characters si besoin d'infos
        # sans modifier le solde.

        dataset.status = "ready"
        dataset.pairs_count = total_pairs
        dataset.character_count = total_characters
        dataset.size = total_pairs * 1024
        dataset.completed_at = datetime.now().isoformat()
        db.commit()
        logger.info(f"Dataset {dataset_id} generation completed successfully.")
        
        # --- Déclenchement Fine-Tuning (reste inchangé) ---
        if dataset.status == "ready":
            try:
                from celery_app import celery_app
                existing_fine_tuning = db.query(FineTuning).filter(
                    FineTuning.dataset_id == dataset_id,
                    FineTuning.status == "pending"
                ).first()
                if existing_fine_tuning:
                    api_key = db.query(ApiKey).filter(
                        ApiKey.user_id == dataset.project.user_id,
                        ApiKey.provider == existing_fine_tuning.provider
                    ).first()
                    if api_key:
                        logger.info(f"Triggering pending fine-tuning {existing_fine_tuning.id}")
                        existing_fine_tuning.status = "queued"
                        db.commit()
                        celery_app.send_task("start_fine_tuning", args=[existing_fine_tuning.id], queue='fine_tuning')
                    else:
                        logger.warning(f"Cannot start fine-tuning {existing_fine_tuning.id}: User missing API key...")
                        existing_fine_tuning.status = "error"
                        existing_fine_tuning.error_message = f"User missing API key for provider {existing_fine_tuning.provider}"
                        db.commit()
                else:
                     logger.info(f"No pending fine-tuning found for dataset {dataset_id}.")
            except Exception as e:
                logger.error(f"Error auto-triggering fine-tuning for dataset {dataset_id}: {str(e)}", exc_info=True)

        return {"status": "success", "dataset_id": dataset_id, "pairs_count": total_pairs}

    except self.MaxRetriesExceededError as e:
        logger.error(f"Dataset {dataset_id} generation failed after max retries: {e}")
        # Marquer le dataset comme échoué DANS UNE NOUVELLE SESSION
        try:
            with SessionLocal() as error_db:
                 dataset_to_fail = error_db.query(Dataset).filter(Dataset.id == dataset_id).first()
                 if dataset_to_fail and dataset_to_fail.status != 'error':
                     dataset_to_fail.status = "error"
                     dataset_to_fail.error_message = f"Task failed after max retries: {str(e)[:200]}"
                     error_db.commit()
        except Exception as db_err:
            logger.error(f"Failed to mark dataset {dataset_id} as error after retries: {db_err}")
        return {"status": "error", "message": f"Task failed after max retries: {e}"}
        
    except Exception as e:
        logger.error(f"Unhandled error generating dataset {dataset_id}: {str(e)}")
        logger.error(traceback.format_exc())
        # Marquer le dataset comme échoué DANS UNE NOUVELLE SESSION
        try:
            with SessionLocal() as error_db:
                 dataset_to_fail = error_db.query(Dataset).filter(Dataset.id == dataset_id).first()
                 if dataset_to_fail and dataset_to_fail.status != 'error':
                     dataset_to_fail.status = "error"
                     dataset_to_fail.error_message = f"Internal error: {str(e)[:200]}"
                     error_db.commit()
        except Exception as db_err:
            logger.error(f"Failed to mark dataset {dataset_id} as error after unhandled exception: {db_err}")
        return {"status": "error", "message": str(e)}
    
    finally:
        if db: # Fermer la session si elle a été ouverte et assignée
            db.close() 