from celery import shared_task
from loguru import logger
from sqlalchemy.orm import Session
import time
import os
import json
from datetime import datetime
import re

from app.db.session import SessionLocal
from app.models.fine_tuning import FineTuning
from app.models.dataset import Dataset, DatasetPair
from app.services.ai_providers import get_ai_provider
from app.services.storage import storage_service
from app.core.config import settings
from app.models.project import Project
from app.api.endpoints.notifications import create_notification

@shared_task(name="start_fine_tuning")
def start_fine_tuning(fine_tuning_id: int):
    """
    Start a fine-tuning job with the actual API provider.
    """
    logger.info(f"Starting fine-tuning {fine_tuning_id}")
    
    # Create a new database session
    db = SessionLocal()
    
    try:
        # Get the fine-tuning from the database
        fine_tuning = db.query(FineTuning).filter(FineTuning.id == fine_tuning_id).first()
        
        if not fine_tuning:
            logger.error(f"Fine-tuning {fine_tuning_id} not found")
            return {"status": "error", "message": "Fine-tuning not found"}
        
        # Get the dataset
        dataset = db.query(Dataset).filter(Dataset.id == fine_tuning.dataset_id).first()
        
        if not dataset:
            logger.error(f"Dataset {fine_tuning.dataset_id} not found")
            fine_tuning.status = "error"
            fine_tuning.error_message = "Dataset not found"
            db.commit()
            # --- Ajout Notification --- 
            user_id = fine_tuning.dataset.project.user_id
            create_notification(
                db=db,
                user_id=user_id,
                message=f"Échec du lancement du fine-tuning '{fine_tuning.name}': Dataset non trouvé.",
                type='error',
                related_id=fine_tuning_id,
                related_type='fine_tuning'
            )
            # --- Fin Notification ---
            return {"status": "error", "message": "Dataset not found"}
        
        # Update fine-tuning status to preparing
        fine_tuning.status = "preparing"
        fine_tuning.progress = 0
        db.commit()
        
        # Récupérer la clé API depuis le User via le projet
        project = db.query(Project).filter(Project.id == dataset.project_id).first()
        
        user_api_key = None
        if project and project.user and project.user.api_keys:
            for api in project.user.api_keys:
                if api.provider.lower() == fine_tuning.provider.lower():
                    user_api_key = api.key
                    break
        
        # Préparer un suffixe pour le modèle fine-tuné (en minuscules, sans espaces, sans caractères spéciaux)
        model_suffix = None
        if project and project.name:
            # Convertir en format compatible (lettres, chiffres, tirets seulement)
            model_suffix = re.sub(r'[^a-z0-9-]', '-', project.name.lower())
            model_suffix = re.sub(r'-+', '-', model_suffix)  # Éviter les tirets multiples
            logger.info(f"Using project name as model suffix: {model_suffix}")
        
        # Utiliser la clé récupérée pour initialiser le provider
        provider_service = get_ai_provider(fine_tuning.provider, user_api_key)
        
        # Fetch all dataset pairs
        dataset_pairs = db.query(DatasetPair).filter(DatasetPair.dataset_id == dataset.id).all()
        
        if not dataset_pairs:
            logger.error(f"No pairs found for dataset {dataset.id}")
            fine_tuning.status = "error"
            fine_tuning.error_message = "No pairs found in dataset"
            db.commit()
            # --- Ajout Notification --- 
            user_id = fine_tuning.dataset.project.user_id
            create_notification(
                db=db,
                user_id=user_id,
                message=f"Échec du lancement du fine-tuning '{fine_tuning.name}': Aucun couple Q/A trouvé dans le dataset.",
                type='error',
                related_id=fine_tuning_id,
                related_type='fine_tuning'
            )
            # --- Fin Notification ---
            return {"status": "error", "message": "Dataset is empty"}
        
        # Récupérer le system_content du dataset (ou utiliser une valeur par défaut si vide)
        system_content = dataset.system_content
        if not system_content or system_content.strip() == "":
            logger.warning(f"System content is empty for dataset {dataset.id}, using default")
            system_content = "You are a helpful assistant."
        else:
            logger.info(f"Using system content from dataset: {system_content}")
            
        # Prepare the training data with the system_content
        qa_pairs = [
            {
                "question": pair.question, 
                "answer": pair.answer, 
                "system_content": system_content  # Utiliser le system_content du dataset
            } 
            for pair in dataset_pairs
        ]
        
        # Log pour vérifier les données
        logger.info(f"Prepared {len(qa_pairs)} QA pairs with system content: {system_content}")
        
        # Create temp directory for training file
        temp_dir = os.path.join(settings.UPLOAD_DIR, "fine_tuning", str(fine_tuning_id))
        os.makedirs(temp_dir, exist_ok=True)
        
        # Create and save the training file
        training_file_path = os.path.join(temp_dir, f"training_data_{fine_tuning_id}.jsonl")
        
        # Utiliser le system_content lors de la préparation du fichier d'entraînement
        # Modification de l'appel pour inclure explicitement le system_content
        training_file_path = provider_service.prepare_training_file(qa_pairs, training_file_path, system_content)
        
        # Upload training file to the provider
        file_id = provider_service.upload_training_file(training_file_path)
        
        # Save file ID for reference
        fine_tuning.file_id = file_id
        db.commit()
        
        # Wait for file processing (may be necessary for some providers)
        time.sleep(5)
        
        # Prepare hyperparameters
        hyperparameters = {}
        if fine_tuning.hyperparameters:
            hyperparameters = fine_tuning.hyperparameters
        
        # Start the fine-tuning job
        response = provider_service.start_fine_tuning(
            dataset_path=file_id,
            model=fine_tuning.model,
            hyperparameters=hyperparameters,
            suffix=model_suffix
        )
        
        # Update fine-tuning with job ID
        fine_tuning.status = "training"
        fine_tuning.external_id = response.get("job_id")
        fine_tuning.started_at = datetime.now().isoformat()
        db.commit()
        
        # --- Ajout Notification --- 
        user_id = fine_tuning.dataset.project.user_id
        create_notification(
            db=db,
            user_id=user_id,
            message=f"Le fine-tuning '{fine_tuning.name}' a été lancé avec succès.",
            type='info',
            related_id=fine_tuning_id,
            related_type='fine_tuning'
        )
        # --- Fin Notification ---
        
        # Schedule periodic status check
        check_fine_tuning_status.apply_async(
            args=[fine_tuning_id],
            countdown=60  # Check after 1 minute
        )
        
        logger.info(f"Fine-tuning {fine_tuning_id} started successfully with job ID {response.get('job_id')}")
        return {"status": "success", "fine_tuning_id": fine_tuning_id, "job_id": response.get("job_id")}
    
    except Exception as e:
        logger.error(f"Error starting fine-tuning {fine_tuning_id}: {str(e)}")
        
        # Update fine-tuning status to error
        fine_tuning = db.query(FineTuning).filter(FineTuning.id == fine_tuning_id).first()
        if fine_tuning:
            fine_tuning.status = "error"
            fine_tuning.error_message = str(e)
            db.commit()
        
        # --- Ajout Notification --- 
        try: # Try/except au cas où fine_tuning ou user_id n'est pas accessible
            user_id = fine_tuning.dataset.project.user_id
            create_notification(
                db=db,
                user_id=user_id,
                message=f"Erreur lors du lancement du fine-tuning '{fine_tuning.name}': {str(e)}",
                type='error',
                related_id=fine_tuning_id,
                related_type='fine_tuning'
            )
        except Exception as notify_err:
             logger.error(f"Failed to create error notification for starting fine-tuning {fine_tuning_id}: {notify_err}")
        # --- Fin Notification ---
        
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()

@shared_task(name="check_fine_tuning_status")
def check_fine_tuning_status(fine_tuning_id: int):
    """
    Check the status of a fine-tuning job with the provider's API.
    """
    logger.info(f"Checking fine-tuning status for {fine_tuning_id}")
    
    # Create a new database session
    db = SessionLocal()
    
    try:
        # Get the fine-tuning from the database
        fine_tuning = db.query(FineTuning).filter(FineTuning.id == fine_tuning_id).first()
        
        if not fine_tuning:
            logger.error(f"Fine-tuning {fine_tuning_id} not found")
            return {"status": "error", "message": "Fine-tuning not found"}
        
        # If fine-tuning is not in training status, don't update
        if fine_tuning.status != "training":
            logger.info(f"Fine-tuning {fine_tuning_id} is not in training status, skipping update")
            return {"status": "skipped", "message": "Fine-tuning is not in training status"}
        
        # --- CORRECTION: Récupérer la clé API de l'utilisateur associé ---
        user_api_key = None
        if fine_tuning.dataset and fine_tuning.dataset.project and fine_tuning.dataset.project.user:
            user = fine_tuning.dataset.project.user
            for api_key in user.api_keys:
                if api_key.provider.lower() == fine_tuning.provider.lower():
                    user_api_key = api_key.key
                    break
        
        if not user_api_key:
            error_msg = f"Could not find API key for provider {fine_tuning.provider} for user {fine_tuning.dataset.project.user_id}"
            logger.error(error_msg)
            fine_tuning.status = "error"
            fine_tuning.error_message = error_msg
            db.commit()
            return {"status": "error", "message": error_msg}
        # --- FIN CORRECTION ---
        
        # Get provider service avec la clé récupérée
        provider_service = get_ai_provider(fine_tuning.provider, user_api_key)
        
        # Get status from provider
        status_response = provider_service.get_fine_tuning_status(fine_tuning.external_id)
        
        # Update fine-tuning status
        fine_tuning.progress = status_response.get("progress", 0)
        provider_status = status_response.get("status", "")
        
        # Map provider status to our app status
        if provider_status in ["succeeded", "completed"]:
            fine_tuning.status = "completed"
            fine_tuning.progress = 100
            fine_tuning.completed_at = datetime.now().isoformat()
            fine_tuning.metrics = status_response.get("details", {})
            fine_tuning.fine_tuned_model = status_response.get("fine_tuned_model", "")
            logger.info(f"Fine-tuning {fine_tuning_id} completed")
            
        elif provider_status in ["failed", "error"]:
            fine_tuning.status = "error"
            fine_tuning.error_message = status_response.get("details", {}).get("error", "Unknown error")
            logger.error(f"Fine-tuning {fine_tuning_id} failed: {fine_tuning.error_message}")
            
        elif provider_status in ["cancelled", "canceled"]:
            fine_tuning.status = "cancelled"
            fine_tuning.completed_at = datetime.now().isoformat()
            logger.info(f"Fine-tuning {fine_tuning_id} was cancelled")
            
        else:
            # Still in progress, schedule next check
            fine_tuning.status = "training"
            check_delay = 300  # 5 minutes by default
            
            # Adjust check frequency based on progress
            if fine_tuning.progress < 30:
                check_delay = 180  # 3 minutes for early progress
            elif fine_tuning.progress > 80:
                check_delay = 120  # 2 minutes for almost done
                
            check_fine_tuning_status.apply_async(
                args=[fine_tuning_id],
                countdown=check_delay
            )
            logger.info(f"Fine-tuning {fine_tuning_id} in progress ({fine_tuning.progress}%), checking again in {check_delay} seconds")
        
        # --- Ajout Notifications si statut final atteint --- 
        notification_message = None
        notification_type = None

        previous_status = fine_tuning.status 
        user_id = fine_tuning.dataset.project.user_id # Récupérer user_id tôt
        
        if fine_tuning.status == "completed" and previous_status != "completed":
            notification_message = f"Le fine-tuning '{fine_tuning.name}' est terminé avec succès ! Modèle prêt: {fine_tuning.fine_tuned_model}"
            notification_type = 'success'
        elif fine_tuning.status == "error" and previous_status != "error":
            notification_message = f"Échec du fine-tuning '{fine_tuning.name}'. Raison: {fine_tuning.error_message}"
            notification_type = 'error'
        elif fine_tuning.status == "cancelled" and previous_status != "cancelled":
            notification_message = f"Le fine-tuning '{fine_tuning.name}' a été annulé."
            notification_type = 'warning'
        
        if notification_message and notification_type:
             create_notification(
                 db=db,
                 user_id=user_id,
                 message=notification_message,
                 type=notification_type,
                 related_id=fine_tuning_id,
                 related_type='fine_tuning'
             )
        # --- Fin Notifications ---
        
        db.commit()
        
        return {
            "status": "success",
            "fine_tuning_id": fine_tuning_id,
            "progress": fine_tuning.progress,
            "state": fine_tuning.status
        }
    
    except Exception as e:
        logger.error(f"Error checking fine-tuning status {fine_tuning_id}: {str(e)}")
        # --- Ajout Notification --- 
        try: # Essayer de notifier même si le check échoue
            user_id = fine_tuning.dataset.project.user_id
            create_notification(
                 db=db,
                 user_id=user_id,
                 message=f"Erreur lors de la vérification du statut du fine-tuning '{fine_tuning.name}'.",
                 type='error',
                 related_id=fine_tuning_id,
                 related_type='fine_tuning'
             )
        except Exception as notify_err:
             logger.error(f"Failed to create error notification for checking fine-tuning {fine_tuning_id}: {notify_err}")
        # --- Fin Notification ---
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()

@shared_task(name="cancel_fine_tuning")
def cancel_fine_tuning(fine_tuning_id: int):
    """
    Cancel a fine-tuning job using the provider's API.
    """
    logger.info(f"Cancelling fine-tuning {fine_tuning_id}")
    
    # Create a new database session
    db = SessionLocal()
    
    try:
        # Get the fine-tuning from the database
        fine_tuning = db.query(FineTuning).filter(FineTuning.id == fine_tuning_id).first()
        
        if not fine_tuning:
            logger.error(f"Fine-tuning {fine_tuning_id} not found")
            return {"status": "error", "message": "Fine-tuning not found"}
        
        # If fine-tuning is already completed or cancelled, don't update
        if fine_tuning.status in ["completed", "cancelled", "error"]:
            logger.info(f"Fine-tuning {fine_tuning_id} is already in {fine_tuning.status} status, skipping cancellation")
            return {"status": "skipped", "message": f"Fine-tuning is already in {fine_tuning.status} status"}
        
        # Get provider service
        provider_service = get_ai_provider(fine_tuning.provider, fine_tuning.api_key or None)
        
        # Cancel job with provider
        if fine_tuning.external_id:
            response = provider_service.cancel_fine_tuning(fine_tuning.external_id)
            logger.info(f"Provider response for cancellation: {response}")
        
        # Update fine-tuning status to cancelled
        fine_tuning.status = "cancelled"
        fine_tuning.completed_at = datetime.now().isoformat()
        db.commit()
        
        # --- Ajout Notification --- 
        user_id = fine_tuning.dataset.project.user_id
        create_notification(
            db=db,
            user_id=user_id,
            message=f"Le fine-tuning '{fine_tuning.name}' a été annulé manuellement.",
            type='warning',
            related_id=fine_tuning_id,
            related_type='fine_tuning'
        )
        # --- Fin Notification ---
        
        logger.info(f"Fine-tuning {fine_tuning_id} cancelled successfully")
        return {"status": "success", "fine_tuning_id": fine_tuning_id}
    
    except Exception as e:
        logger.error(f"Error cancelling fine-tuning {fine_tuning_id}: {str(e)}")
        # --- Ajout Notification --- 
        try:
            user_id = fine_tuning.dataset.project.user_id
            create_notification(
                 db=db,
                 user_id=user_id,
                 message=f"Erreur lors de l'annulation du fine-tuning '{fine_tuning.name}': {str(e)}",
                 type='error',
                 related_id=fine_tuning_id,
                 related_type='fine_tuning'
             )
        except Exception as notify_err:
            logger.error(f"Failed to create error notification for cancelling fine-tuning {fine_tuning_id}: {notify_err}")
        # --- Fin Notification ---
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close() 