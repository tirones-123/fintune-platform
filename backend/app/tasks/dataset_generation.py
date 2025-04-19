from celery import shared_task, Task
from loguru import logger
from sqlalchemy.orm import Session
import os
import time
import traceback
import json
from datetime import datetime

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
    logger.info(f"Generating dataset {dataset_id}")
    db = SessionLocal()
    dataset = None

    try:
        from app.models.dataset import Dataset, DatasetContent, DatasetPair
        from app.models.content import Content
        from app.models.fine_tuning import FineTuning
        from app.models.api_key import ApiKey
        
        try:
            dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
            if not dataset:
                logger.warning(f"Dataset {dataset_id} not found yet, possibly due to replication delay. Retrying...")
                raise self.retry(countdown=10)
        except self.MaxRetriesExceededError:
            logger.error(f"Dataset {dataset_id} not found after multiple retries. Aborting task.")
            return {"status": "error", "message": "Dataset not found after retries"}
        except Exception as e:
            logger.error(f"Error fetching dataset {dataset_id} initially: {e}")
            raise self.retry(exc=e)

        # Vérifier si les contenus sont prêts
        dataset_contents_assoc = db.query(DatasetContent).filter(DatasetContent.dataset_id == dataset_id).all()
        content_ids = [dc.content_id for dc in dataset_contents_assoc]
        contents = db.query(Content).filter(Content.id.in_(content_ids)).all()
        pending_contents = [c for c in contents if c.status not in ['completed', 'error']]
        if pending_contents:
            pending_ids = [c.id for c in pending_contents]
            logger.warning(f"Dataset {dataset_id}: Contents {pending_ids} not ready. Retrying...")
            raise self.retry(countdown=self.default_retry_delay)

        # Mettre à jour le statut
        if dataset.status != "processing":
            dataset.status = "processing"
            db.commit()

        # Récupérer provider et clé API
        provider_name = getattr(dataset, "provider", "openai")
        if not dataset.project or not dataset.project.user_id:
             logger.error(f"Dataset {dataset_id} is not associated with a project or user.")
             raise ValueError(f"Dataset {dataset_id} has no valid project/user association.")

        api_key_record = db.query(ApiKey).filter(
            ApiKey.user_id == dataset.project.user_id,
            ApiKey.provider == provider_name
        ).first()
        if not api_key_record:
             error_msg = f"API Key for provider {provider_name} not found for user {dataset.project.user_id}"
             logger.error(error_msg)
             dataset.status = "error"
             dataset.error_message = error_msg
             db.commit()
             return {"status": "error", "message": error_msg}

        provider = get_ai_provider(provider_name, api_key_record.key)
        model = dataset.model or DEFAULT_MODEL

        # --- NOUVELLE LOGIQUE : Agréger tout le texte --- 
        aggregated_text = ""
        processed_content_ids = []
        for content in contents:
            if content.status == 'error':
                logger.warning(f"Skipping content {content.id} due to previous error: {content.error_message}")
                continue
            
            text = content.content_text
            if text:
                # Ajouter un séparateur clair entre les contenus
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

        # --- Découper le texte agrégé en chunks --- 
        chunks = split_text_into_chunks(aggregated_text)
        logger.info(f"Split aggregated text into {len(chunks)} chunks for dataset {dataset_id}")

        # --- Traiter les chunks agrégés --- 
        total_pairs = 0
        all_pairs = [] # Stocker temporairement les paires
        for i, chunk in enumerate(chunks):
            logger.info(f"Processing aggregated chunk {i+1}/{len(chunks)} for dataset {dataset_id}")
            try:
                qa_pairs = provider.generate_qa_pairs(chunk, model)
                if qa_pairs:
                    # Valider et stocker les paires valides
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
                
                # Délai pour éviter rate limit
                time.sleep(1)

            except Exception as e:
                logger.error(f"Error processing aggregated chunk {i+1}: {str(e)}")
                logger.error(traceback.format_exc())
                # Continuer avec le chunk suivant en cas d'erreur sur un chunk

        # Vérifier si des paires ont été générées au total
        if total_pairs == 0:
            dataset.status = "error"
            dataset.error_message = "No QA pairs could be generated from the aggregated content."
            db.commit()
            logger.error(f"No pairs generated for dataset {dataset_id} from aggregated chunks.")
            return {"status": "error", "message": "No pairs could be generated"}

        # Ajouter toutes les paires valides à la base de données en une fois (ou par lots plus petits si nécessaire)
        logger.info(f"Adding {total_pairs} generated pairs to dataset {dataset_id}...")
        for idx, pair_data in enumerate(all_pairs):
             db_pair = DatasetPair(
                 question=pair_data["question"],
                 answer=pair_data["answer"],
                 dataset_id=dataset_id,
                 # Metadata simplifiée: juste l'index du chunk agrégé
                 metadata={"aggregated_chunk_index": idx // (len(qa_pairs)/len(chunks)) if len(chunks)>0 and len(qa_pairs)>0 else 0} 
                 # Alternative: metadata={"info": f"From aggregated chunk {idx}"} 
             )
             db.add(db_pair)
        # Commit après avoir ajouté toutes les paires
        db.commit()
        logger.info(f"Successfully added {total_pairs} pairs to the database.")

        # Calculer le compte total de caractères (comme avant)
        total_characters = 0
        for pair in db.query(DatasetPair).filter(DatasetPair.dataset_id == dataset_id).all():
            total_characters += len(pair.question) + len(pair.answer)
        system_content = dataset.system_content or ""
        total_characters += len(system_content) * total_pairs # Utiliser total_pairs calculé
        logger.info(f"Dataset {dataset_id} final character count: {total_characters}")

        # Mettre à jour le dataset final
        dataset.status = "ready"
        dataset.pairs_count = total_pairs
        dataset.character_count = total_characters
        dataset.size = total_pairs * 1024 # Approximation
        dataset.completed_at = datetime.now().isoformat()
        db.commit()
        logger.info(f"Dataset {dataset_id} generation completed successfully.")

        # Déclencher le Fine-Tuning (logique inchangée)
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
        logger.error(f"Dataset {dataset_id} generation failed after max retries due to pending content: {e}")
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        if dataset and dataset.status != 'error': # Ne pas écraser une erreur antérieure
            dataset.status = "error"
            dataset.error_message = "Timeout waiting for content processing after multiple retries."
            db.commit()
        return {"status": "error", "message": "Timeout waiting for content processing"}
        
    except Exception as e:
        logger.error(f"Unhandled error generating dataset {dataset_id}: {str(e)}")
        logger.error(traceback.format_exc())
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        if dataset and dataset.status != 'error':
            dataset.status = "error"
            dataset.error_message = f"Internal error: {str(e)[:200]}"
            db.commit()
        return {"status": "error", "message": str(e)}
    
    finally:
        if 'db' in locals() and db: # S'assurer que db existe
            db.close() 