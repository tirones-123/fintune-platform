from celery import shared_task
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
def generate_dataset(self, dataset_id: int):
    """
    Generate a dataset from selected contents.
    Waits for all contents to be 'completed' before proceeding.
    Reads processed text directly from the database.
    """
    logger.info(f"Generating dataset {dataset_id}")
    
    db = SessionLocal()
    
    try:
        # --- MODIFIÉ: Déplacer les imports ici ---
        from app.models.dataset import Dataset, DatasetContent, DatasetPair
        from app.models.content import Content
        from app.models.fine_tuning import FineTuning
        from app.models.api_key import ApiKey
        # --- FIN MODIFICATION ---

        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        
        if not dataset:
            logger.error(f"Dataset {dataset_id} not found")
            return {"status": "error", "message": "Dataset not found"}
        
        # --- NOUVEAU: Vérifier si les contenus sont prêts (maintenant DatasetContent est défini) ---
        dataset_contents_assoc = db.query(DatasetContent).filter(DatasetContent.dataset_id == dataset_id).all()
        content_ids = [dc.content_id for dc in dataset_contents_assoc]
        contents = db.query(Content).filter(Content.id.in_(content_ids)).all()

        pending_contents = [c for c in contents if c.status not in ['completed', 'error']]

        if pending_contents:
            pending_ids = [c.id for c in pending_contents]
            logger.warning(f"Dataset {dataset_id}: Contents {pending_ids} are not yet completed. Retrying in {self.default_retry_delay}s...")
            try:
                # Renvoyer la tâche dans la file d'attente pour réessayer plus tard
                self.retry(countdown=self.default_retry_delay)
            except self.MaxRetriesExceededError:
                 logger.error(f"Max retries exceeded for dataset {dataset_id}. Contents {pending_ids} never completed.")
                 dataset.status = "error"
                 dataset.error_message = f"Contents {pending_ids} did not complete processing."
                 db.commit()
                 return {"status": "error", "message": f"Contents {pending_ids} did not complete processing."}
            # Important: arrêter l'exécution ici pour cette tentative
            return {"status": "waiting", "message": f"Waiting for contents {pending_ids} to complete."}
        # --- FIN NOUVEAU: Vérification des contenus ---

        # Mettre à jour le statut seulement si on commence réellement le traitement
        if dataset.status != "processing":
            dataset.status = "processing"
            dataset.started_at = datetime.now().isoformat()
            db.commit()
        
        # Récupérer le provider et de la clé API :
        provider_name = getattr(dataset, "provider", "openai")
        dataset_api_key = getattr(dataset, "api_key", None) or os.getenv("OPENAI_API_KEY")
        provider = get_ai_provider(provider_name, dataset_api_key)
        
        # Model to use for generation
        model = dataset.model or DEFAULT_MODEL
        
        # Track total pairs generated
        total_pairs = 0
        
        # Process each content (maintenant qu'on sait qu'ils sont 'completed')
        for content in contents:
            # Ignorer les contenus en erreur
            if content.status == 'error':
                logger.warning(f"Skipping content {content.id} due to previous error: {content.error_message}")
                continue

            logger.info(f"Processing content {content.id}: {content.name}")
            
            try:
                # --- MODIFIÉ: Vérifier plusieurs attributs possibles pour le texte ---
                text = content.content_text
                
                if not text:
                    logger.warning(f"No text found in content {content.id} (status: {content.status})")
                    continue
                # --- FIN MODIFICATION ---
                
                # Split text into chunks
                chunks = split_text_into_chunks(text)
                logger.info(f"Split content {content.id} into {len(chunks)} chunks")
                
                # Process each chunk
                for i, chunk in enumerate(chunks):
                    logger.info(f"Processing chunk {i+1}/{len(chunks)} of content {content.id}")
                    
                    try:
                        # Generate QA pairs for this chunk
                        qa_pairs = provider.generate_qa_pairs(chunk, model)
                        
                        if not qa_pairs:
                            logger.warning(f"No QA pairs generated for chunk {i+1} of content {content.id}")
                            continue
                        
                        # Add pairs to database
                        for pair in qa_pairs:
                            # Vérification que les paires contiennent bien question et réponse
                            if not isinstance(pair, dict) or "question" not in pair or "answer" not in pair:
                                logger.warning(f"Invalid QA pair format: {pair}")
                                continue
                                
                            db_pair = DatasetPair(
                                question=pair["question"],
                                answer=pair["answer"],
                                dataset_id=dataset_id,
                                metadata={"source": content.id, "chunk": i}
                            )
                            db.add(db_pair)
                        
                        # Increment count
                        total_pairs += len(qa_pairs)
                        
                        # Commit in batches to avoid large transactions
                        db.commit()
                        
                        # Small delay to avoid API rate limits
                        time.sleep(1)
                        
                    except Exception as e:
                        logger.error(f"Error processing chunk {i} of content {content.id}: {str(e)}")
                        logger.error(traceback.format_exc())
                        # Continue with next chunk
            
            except Exception as e:
                logger.error(f"Error processing content {content.id}: {str(e)}")
                logger.error(traceback.format_exc())
                # Continue with next content
        
        # Check if any pairs were generated
        if total_pairs == 0:
            dataset.status = "error"
            dataset.error_message = "No pairs could be generated from the provided contents"
            db.commit()
            logger.error(f"No pairs generated for dataset {dataset_id}")
            return {"status": "error", "message": "No pairs could be generated"}
        
        # Calculer le nombre total de caractères dans le dataset
        total_characters = 0
        for pair in db.query(DatasetPair).filter(DatasetPair.dataset_id == dataset_id).all():
            # Compter les caractères dans la question et la réponse
            total_characters += len(pair.question) + len(pair.answer)
        
        # Compter les caractères du system_content, multiplié par le nombre de paires
        system_content = dataset.system_content if hasattr(dataset, 'system_content') else ""
        total_characters += len(system_content) * len(db.query(DatasetPair).filter(DatasetPair.dataset_id == dataset_id).all())
        
        logger.info(f"Dataset {dataset_id} contains {total_characters} characters")
        
        # Traiter les caractères avec le CharacterService
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        if dataset:
            user_id = dataset.user_id  # ou dataset.project.user_id si relation
        success, paid_chars, price = character_service.process_dataset_characters(
            db, user_id, dataset_id, total_characters
        )
        
        if not success:
            dataset.status = "error"
            dataset.error_message = "Error processing character usage"
            db.commit()
            logger.error(f"Error processing character usage for dataset {dataset_id}")
            return {"status": "error", "message": "Error processing character usage"}
        
        # Si des caractères doivent être payés, indiquer le prix dans les logs
        if paid_chars > 0:
            logger.info(f"Dataset {dataset_id} requires payment for {paid_chars} characters, price: ${price:.2f}")
        
        # Update dataset
        dataset.status = "ready"
        dataset.pairs_count = total_pairs
        dataset.character_count = total_characters
        dataset.size = total_pairs * 1024  # Approximate size calculation
        dataset.completed_at = datetime.now().isoformat()
        db.commit()
        
        logger.info(f"Dataset {dataset_id} generated successfully with {total_pairs} pairs")
        
        # --- MODIFIÉ: Déclencher le Fine-Tuning ---
        if dataset.status == "ready":
            try:
                from celery_app import celery_app

                existing_fine_tuning = db.query(FineTuning).filter(
                    FineTuning.dataset_id == dataset_id,
                    FineTuning.status == "pending"
                ).first()

                if existing_fine_tuning:
                    api_key = db.query(ApiKey).filter(
                        ApiKey.user_id == dataset.user_id,
                        ApiKey.provider == existing_fine_tuning.provider
                    ).first()

                    if api_key:
                        logger.info(f"Dataset {dataset_id} is ready. Triggering pending fine-tuning {existing_fine_tuning.id}")
                        # Mettre à jour le statut et envoyer la tâche
                        existing_fine_tuning.status = "queued"
                        db.commit()
                        celery_app.send_task("start_fine_tuning", args=[existing_fine_tuning.id], queue='fine_tuning')
                    else:
                         logger.warning(f"Cannot start fine-tuning {existing_fine_tuning.id}: User {dataset.user_id} missing API key for provider {existing_fine_tuning.provider}")
                         existing_fine_tuning.status = "error"
                         existing_fine_tuning.error_message = f"User missing API key for provider {existing_fine_tuning.provider}"
                         db.commit()
                else:
                    logger.info(f"No pending fine-tuning found for dataset {dataset_id}. Skipping auto-start.")
            
            except Exception as e:
                logger.error(f"Error auto-creating fine-tuning for dataset {dataset_id}: {str(e)}")
                logger.error(traceback.format_exc())
                # Continue anyway as the dataset generation succeeded
        
        return {"status": "success", "dataset_id": dataset_id, "pairs_count": total_pairs}
    
    except Exception as e:
        logger.error(f"Error generating dataset {dataset_id}: {str(e)}")
        logger.error(traceback.format_exc())
        
        # Update dataset status to error
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        if dataset:
            dataset.status = "error"
            dataset.error_message = str(e)
            db.commit()
        
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close() 