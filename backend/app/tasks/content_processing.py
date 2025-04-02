from celery import shared_task
from loguru import logger
from sqlalchemy.orm import Session
import os
import time
import PyPDF2

from app.db.session import SessionLocal
from app.models.content import Content
from app.services.content_processor import content_processor
from app.services.storage import storage_service

@shared_task(name="process_pdf_content")
def process_pdf_content(content_id: int):
    """
    Process a PDF content file.
    """
    logger.info(f"Processing PDF content {content_id}")
    
    # Create a new database session
    db = SessionLocal()
    
    try:
        # Get the content from the database
        content = db.query(Content).filter(Content.id == content_id).first()
        
        if not content:
            logger.error(f"Content {content_id} not found")
            return {"status": "error", "message": "Content not found"}
        
        # Update content status to processing
        content.status = "processing"
        db.commit()
        
        # Extraire le texte du PDF
        file_path = content.file_path
        extracted_text = ""
        
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    extracted_text += page.extract_text() + "\n"
        except Exception as extract_error:
            logger.error(f"Error extracting text from PDF {file_path}: {str(extract_error)}")
            content.status = "error"
            content.error_message = f"Error extracting text: {str(extract_error)}"
            db.commit()
            return {"status": "error", "message": str(extract_error)}
        
        # Compter les caractères
        character_count = len(extracted_text)
        logger.info(f"PDF content {content_id} has {character_count} characters")
        
        # Mettre à jour les métadonnées
        if not content.metadata:
            content.metadata = {}
        
        content.metadata["character_count"] = character_count
        content.metadata["page_count"] = len(pdf_reader.pages)
        
        # Update content status to processed
        content.status = "completed"
        db.commit()
        
        logger.info(f"PDF content {content_id} processed successfully")
        return {"status": "success", "content_id": content_id, "character_count": character_count}
    
    except Exception as e:
        logger.error(f"Error processing PDF content {content_id}: {str(e)}")
        
        # Update content status to error
        content = db.query(Content).filter(Content.id == content_id).first()
        if content:
            content.status = "error"
            content.error_message = str(e)
            db.commit()
        
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()

@shared_task(name="process_text_content")
def process_text_content(content_id: int):
    """
    Process a text content file.
    """
    logger.info(f"Processing text content {content_id}")
    
    # Create a new database session
    db = SessionLocal()
    
    try:
        # Get the content from the database
        content = db.query(Content).filter(Content.id == content_id).first()
        
        if not content:
            logger.error(f"Content {content_id} not found")
            return {"status": "error", "message": "Content not found"}
        
        # Update content status to processing
        content.status = "processing"
        db.commit()
        
        # Lire le contenu du fichier
        file_path = content.file_path
        extracted_text = storage_service.get_file_content(file_path)
        
        if extracted_text is None:
            error_msg = f"Could not read the content of file {file_path}"
            logger.error(error_msg)
            content.status = "error"
            content.error_message = error_msg
            db.commit()
            return {"status": "error", "message": error_msg}
        
        # Compter les caractères
        character_count = len(extracted_text)
        logger.info(f"Text content {content_id} has {character_count} characters")
        
        # Mettre à jour les métadonnées
        if not content.metadata:
            content.metadata = {}
        
        content.metadata["character_count"] = character_count
        
        # Update content status to completed
        content.status = "completed"
        db.commit()
        
        logger.info(f"Text content {content_id} processed successfully")
        return {"status": "success", "content_id": content_id, "character_count": character_count}
    
    except Exception as e:
        logger.error(f"Error processing text content {content_id}: {str(e)}")
        
        # Update content status to error
        content = db.query(Content).filter(Content.id == content_id).first()
        if content:
            content.status = "error"
            content.error_message = str(e)
            db.commit()
        
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()

@shared_task(name="process_youtube_content")
def process_youtube_content(content_id: int):
    """
    Process a YouTube content.
    """
    logger.info(f"Processing YouTube content {content_id}")
    
    # Create a new database session
    db = SessionLocal()
    
    try:
        # Get the content from the database
        content = db.query(Content).filter(Content.id == content_id).first()
        
        if not content:
            logger.error(f"Content {content_id} not found")
            return {"status": "error", "message": "Content not found"}
        
        # Update content status to processing
        content.status = "processing"
        db.commit()
        
        # Extraire la transcription YouTube
        youtube_url = content.url
        extracted_text = content_processor.extract_text_from_youtube(youtube_url)
        
        if extracted_text is None:
            error_msg = f"Could not extract transcript from YouTube video {youtube_url}"
            logger.error(error_msg)
            content.status = "error"
            content.error_message = error_msg
            db.commit()
            return {"status": "error", "message": error_msg}
        
        # Compter les caractères
        character_count = len(extracted_text)
        logger.info(f"YouTube content {content_id} has {character_count} characters")
        
        # Mettre à jour les métadonnées
        if not content.metadata:
            content.metadata = {}
        
        content.metadata["character_count"] = character_count
        
        # Update content status to completed
        content.status = "completed"
        db.commit()
        
        logger.info(f"YouTube content {content_id} processed successfully")
        return {"status": "success", "content_id": content_id, "character_count": character_count}
    
    except Exception as e:
        logger.error(f"Error processing YouTube content {content_id}: {str(e)}")
        
        # Update content status to error
        content = db.query(Content).filter(Content.id == content_id).first()
        if content:
            content.status = "error"
            content.error_message = str(e)
            db.commit()
        
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()

@shared_task(name="process_content")
def process_content(content_id: int):
    """
    Process content based on its type.
    """
    logger.info(f"Processing content {content_id}")
    
    # Create a new database session
    db = SessionLocal()
    
    try:
        # Get the content from the database
        content = db.query(Content).filter(Content.id == content_id).first()
        
        if not content:
            logger.error(f"Content {content_id} not found")
            return {"status": "error", "message": "Content not found"}
        
        # Route to the appropriate processing function based on content type
        content_type = content.type.lower()
        
        if content_type == 'pdf':
            return process_pdf_content(content_id)
        elif content_type in ['text', 'txt', 'md', 'markdown']:
            return process_text_content(content_id)
        elif content_type == 'youtube':
            return process_youtube_content(content_id)
        else:
            error_msg = f"Unsupported content type: {content_type}"
            logger.error(error_msg)
            content.status = "error"
            content.error_message = error_msg
            db.commit()
            return {"status": "error", "message": error_msg}
    
    except Exception as e:
        logger.error(f"Error determining content type for {content_id}: {str(e)}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close() 