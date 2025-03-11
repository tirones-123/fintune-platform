from celery import shared_task
from loguru import logger
from sqlalchemy.orm import Session
import time
import random
import uuid

from app.db.session import SessionLocal
from app.models.fine_tuning import FineTuning
from app.models.dataset import Dataset
from app.services.ai_providers import get_ai_provider

@shared_task(name="start_fine_tuning")
def start_fine_tuning(fine_tuning_id: int):
    """
    Start a fine-tuning job.
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
            return {"status": "error", "message": "Dataset not found"}
        
        # Update fine-tuning status to training
        fine_tuning.status = "training"
        fine_tuning.progress = 0
        fine_tuning.external_id = str(uuid.uuid4())  # Simulate external ID
        db.commit()
        
        # Get AI provider service
        # provider_service = get_ai_provider(fine_tuning.provider)
        
        # Simulate fine-tuning process
        # In a real implementation, this would call the AI provider's API
        # and then use a callback or periodic task to update the progress
        
        # For demo purposes, we'll simulate progress updates
        update_fine_tuning_progress.delay(fine_tuning_id)
        
        logger.info(f"Fine-tuning {fine_tuning_id} started successfully")
        return {"status": "success", "fine_tuning_id": fine_tuning_id}
    
    except Exception as e:
        logger.error(f"Error starting fine-tuning {fine_tuning_id}: {str(e)}")
        
        # Update fine-tuning status to error
        fine_tuning = db.query(FineTuning).filter(FineTuning.id == fine_tuning_id).first()
        if fine_tuning:
            fine_tuning.status = "error"
            fine_tuning.error_message = str(e)
            db.commit()
        
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()

@shared_task(name="update_fine_tuning_progress")
def update_fine_tuning_progress(fine_tuning_id: int):
    """
    Update the progress of a fine-tuning job.
    """
    logger.info(f"Updating fine-tuning progress for {fine_tuning_id}")
    
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
        
        # Simulate progress update
        current_progress = fine_tuning.progress or 0
        new_progress = min(current_progress + random.uniform(5, 15), 100)
        
        fine_tuning.progress = new_progress
        
        # If progress is 100%, mark as completed
        if new_progress >= 100:
            fine_tuning.status = "completed"
            fine_tuning.progress = 100
            fine_tuning.completed_at = time.strftime('%Y-%m-%d %H:%M:%S')
            fine_tuning.metrics = {
                "training_loss": round(random.uniform(0.01, 0.1), 4),
                "validation_loss": round(random.uniform(0.05, 0.2), 4),
            }
            logger.info(f"Fine-tuning {fine_tuning_id} completed")
        else:
            # Schedule next update in 10-30 seconds
            update_delay = random.randint(10, 30)
            update_fine_tuning_progress.apply_async(
                args=[fine_tuning_id],
                countdown=update_delay
            )
            logger.info(f"Scheduled next update for fine-tuning {fine_tuning_id} in {update_delay} seconds")
        
        db.commit()
        
        return {
            "status": "success",
            "fine_tuning_id": fine_tuning_id,
            "progress": new_progress,
            "is_completed": new_progress >= 100
        }
    
    except Exception as e:
        logger.error(f"Error updating fine-tuning progress {fine_tuning_id}: {str(e)}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()

@shared_task(name="cancel_fine_tuning")
def cancel_fine_tuning(fine_tuning_id: int):
    """
    Cancel a fine-tuning job.
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
        
        # Update fine-tuning status to cancelled
        fine_tuning.status = "cancelled"
        db.commit()
        
        logger.info(f"Fine-tuning {fine_tuning_id} cancelled successfully")
        return {"status": "success", "fine_tuning_id": fine_tuning_id}
    
    except Exception as e:
        logger.error(f"Error cancelling fine-tuning {fine_tuning_id}: {str(e)}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close() 