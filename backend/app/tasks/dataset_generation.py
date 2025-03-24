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
from app.core.config import settings

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
        dataset.started_at = datetime.now().isoformat()
        db.commit()
        
        # Important: Import the model classes here to avoid circular imports
        from app.models.dataset import DatasetContent
        from app.models.content import Content
        
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
        
        # Récupérer le provider et de la clé API :
        provider_name = getattr(dataset, "provider", "openai")
        dataset_api_key = getattr(dataset, "api_key", None) or os.getenv("OPENAI_API_KEY")
        provider = get_ai_provider(provider_name, dataset_api_key)
        
        # Model to use for generation
        model = dataset.model or DEFAULT_MODEL
        
        # Track total pairs generated
        total_pairs = 0
        
        # Process each content
        for content in contents:
            logger.info(f"Processing content {content.id}: {content.name}")
            
            try:
                # Extract text based on content type
                text = None
                if content.type in ["text", "pdf"] and content.file_path:
                    text = content_processor.extract_text_from_file(content.file_path, content.type)
                elif content.type == "youtube" and content.url:
                    text = content_processor.extract_text_from_youtube(content.url)
                else:
                    logger.warning(f"Unsupported content type or missing data: {content.type}")
                    continue
                
                if not text:
                    logger.warning(f"No text extracted from content {content.id}")
                    continue
                
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
        
        # Update dataset
        dataset.status = "ready"
        dataset.pairs_count = total_pairs
        dataset.size = total_pairs * 1024  # Approximate size calculation
        dataset.completed_at = datetime.now().isoformat()
        db.commit()
        
        logger.info(f"Dataset {dataset_id} generated successfully with {total_pairs} pairs")
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