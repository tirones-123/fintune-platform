from celery import shared_task
from loguru import logger
from sqlalchemy.orm import Session
import time
import random

from app.db.session import SessionLocal
from app.models.dataset import Dataset, DatasetPair, DatasetContent
from app.models.content import Content

@shared_task(name="generate_dataset")
def generate_dataset(dataset_id: int):
    """
    Generate a dataset from selected contents.
    """
    logger.info(f"Generating dataset {dataset_id}")
    
    # Create a new database session
    db = SessionLocal()
    
    try:
        # Get the dataset from the database
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        
        if not dataset:
            logger.error(f"Dataset {dataset_id} not found")
            return {"status": "error", "message": "Dataset not found"}
        
        # Update dataset status to processing
        dataset.status = "processing"
        db.commit()
        
        # Get all contents associated with this dataset
        dataset_contents = db.query(DatasetContent).filter(DatasetContent.dataset_id == dataset_id).all()
        
        if not dataset_contents:
            logger.error(f"No contents found for dataset {dataset_id}")
            dataset.status = "error"
            dataset.error_message = "No contents found for dataset"
            db.commit()
            return {"status": "error", "message": "No contents found for dataset"}
        
        # Get content IDs
        content_ids = [dc.content_id for dc in dataset_contents]
        
        # Get contents
        contents = db.query(Content).filter(Content.id.in_(content_ids)).all()
        
        # Simulate dataset generation
        time.sleep(5)
        
        # Generate random number of pairs (between 50 and 200)
        num_pairs = random.randint(50, 200)
        
        # Create pairs
        for i in range(num_pairs):
            # Simulate pair generation
            question = f"Question {i+1} about {random.choice(contents).name}"
            answer = f"This is the answer to question {i+1}. It contains detailed information from the content."
            
            # Create pair
            pair = DatasetPair(
                question=question,
                answer=answer,
                dataset_id=dataset_id,
                metadata={"source": random.choice(contents).id}
            )
            
            db.add(pair)
        
        # Update dataset
        dataset.status = "ready"
        dataset.pairs_count = num_pairs
        dataset.size = num_pairs * 1024  # Simulate size calculation
        
        db.commit()
        
        logger.info(f"Dataset {dataset_id} generated successfully with {num_pairs} pairs")
        return {"status": "success", "dataset_id": dataset_id, "pairs_count": num_pairs}
    
    except Exception as e:
        logger.error(f"Error generating dataset {dataset_id}: {str(e)}")
        
        # Update dataset status to error
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        if dataset:
            dataset.status = "error"
            dataset.error_message = str(e)
            db.commit()
        
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close() 