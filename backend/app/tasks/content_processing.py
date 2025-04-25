from celery import shared_task
from loguru import logger
from sqlalchemy.orm import Session
import os
import time
import PyPDF2
import docx
import sys
import tempfile
import yt_dlp
import re
from datetime import datetime
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
import json
import logging
import requests
from bs4 import BeautifulSoup
from readability import Document
from celery import shared_task, Task
from typing import Optional, List, Dict, Any, Union
from sqlalchemy.orm.attributes import flag_modified

from app.db.session import SessionLocal
from app.models.content import Content
from app.models.dataset import Dataset
from app.models.fine_tuning import FineTuning
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
        
        # Compter les caractères - méthode exacte
        character_count = len(extracted_text)
        logger.info(f"PDF content {content_id} has {character_count} characters")
        
        # --- CORRECTION: Sauvegarder le texte extrait dans la base de données ---
        content.content_text = extracted_text
        # --- FIN CORRECTION ---
        
        # Mettre à jour les métadonnées
        if not content.content_metadata:
            content.content_metadata = {}
        
        content.content_metadata["character_count"] = character_count
        content.content_metadata["is_exact_count"] = True  # Indiquer que ce comptage est exact
        content.content_metadata["page_count"] = len(pdf_reader.pages)
        
        # Update content status to processed
        content.status = "completed"
        
        # --- AJOUT : Marquer explicitement les métadonnées comme modifiées ---
        flag_modified(content, "content_metadata")
        # --- FIN AJOUT ---
        
        db.commit()
        logger.info(f"PDF content {content_id} status updated to 'completed'")
        
        # Vérifier que le statut a bien été mis à jour
        updated_content = db.query(Content).filter(Content.id == content_id).first()
        logger.info(f"PDF content {content_id} final status: {updated_content.status}")
        logger.info(f"PDF content {content_id} processed successfully with {character_count} characters")
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
        
        # --- CORRECTION: Sauvegarder le texte extrait dans la base de données ---
        content.content_text = extracted_text
        # --- FIN CORRECTION ---
        
        # Compter les caractères - méthode exacte
        character_count = len(extracted_text)
        logger.info(f"Text content {content_id} has {character_count} characters")
        
        # Mettre à jour les métadonnées
        if not content.content_metadata:
            content.content_metadata = {}
        
        content.content_metadata["character_count"] = character_count
        content.content_metadata["is_exact_count"] = True  # Indiquer que ce comptage est exact
        
        # --- RETABLISSEMENT : Commiter directement depuis le worker ---
        content.status = "completed"
        
        # --- AJOUT : Marquer explicitement les métadonnées comme modifiées ---
        flag_modified(content, "content_metadata")
        # --- FIN AJOUT ---
        
        db.commit()
        logger.info(f"Text content {content_id} status updated to 'completed'")
        
        # --- AJOUT LOG DEBUG : Vérifier les métadonnées juste après commit ---
        try:
            # Créer une nouvelle session pour éviter les problèmes de cache de session
            with SessionLocal() as post_commit_db:
                content_after_commit = post_commit_db.query(Content).filter(Content.id == content_id).first()
                if content_after_commit:
                     logger.info(f"WORKER - Content {content_id} metadata APRES commit: {content_after_commit.content_metadata}")
                else:
                    logger.warning(f"WORKER - Impossible de relire le contenu {content_id} après commit.")
        except Exception as log_err:
            logger.error(f"WORKER - Erreur lors de la relecture post-commit pour {content_id}: {log_err}")
        # --- FIN AJOUT LOG DEBUG ---
        
        # Vérifier que le statut a bien été mis à jour (optionnel mais utile pour debug)
        updated_content = db.query(Content).filter(Content.id == content_id).first()
        logger.info(f"Text content {content_id} final status: {updated_content.status}")
        logger.info(f"Text content {content_id} processed successfully with {character_count} characters")
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

@shared_task(name="process_docx_content")
def process_docx_content(content_id: int):
    logger.info(f"Processing DOCX content {content_id}")
    db = SessionLocal()
    try:
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            logger.error(f"Content {content_id} not found")
            return {"status": "error", "message": "Content not found"}
        content.status = "processing"
        db.commit()
        file_path = content.file_path
        extracted_text = ""
        try:
            document = docx.Document(file_path)
            for para in document.paragraphs:
                extracted_text += para.text + "\n"
        except Exception as file_error:
            logger.error(f"Error processing DOCX file {file_path}: {file_error}")
            content.status = "error"
            content.error_message = str(file_error)
            db.commit()
            return {"status": "error", "message": str(file_error)}
            
        # --- CORRECTION: Sauvegarder le texte extrait dans la base de données ---
        content.content_text = extracted_text
        # --- FIN CORRECTION ---
        
        character_count = len(extracted_text)
        logger.info(f"DOCX content {content_id} has {character_count} characters")
        if not content.content_metadata:
            content.content_metadata = {}
        content.content_metadata["character_count"] = character_count
        content.content_metadata["is_exact_count"] = True  # Indiquer que ce comptage est exact
        content.status = "completed"
        
        # --- AJOUT : Marquer explicitement les métadonnées comme modifiées ---
        flag_modified(content, "content_metadata")
        # --- FIN AJOUT ---
        
        db.commit()
        logger.info(f"DOCX content {content_id} status updated to 'completed'")
        
        # Vérifier que le statut a bien été mis à jour
        updated_content = db.query(Content).filter(Content.id == content_id).first()
        logger.info(f"DOCX content {content_id} final status: {updated_content.status}")
        logger.info(f"DOCX content {content_id} processed successfully with {character_count} characters")
        return {"status": "success", "content_id": content_id, "character_count": character_count}
    except Exception as e:
        logger.error(f"Error processing DOCX content {content_id}: {str(e)}")
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
    Process YouTube content by extracting transcript and metadata.
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
        
        # Extraire la transcription et les métadonnées YouTube
        youtube_url = content.url
        # Utiliser la fonction corrigée qui retourne le texte et la source
        transcript, metadata = content_processor.process_youtube_content(youtube_url)
        
        if transcript is None:
            error_msg = f"Could not extract transcript from YouTube video {youtube_url}"
            logger.error(error_msg)
            content.status = "error"
            content.error_message = error_msg
            db.commit()
            return {"status": "error", "message": error_msg}
        
        # --- CORRECTION : Sauvegarder le texte extrait ici --- 
        content.content_text = transcript
        # --- FIN CORRECTION ---
        
        # Compter les caractères
        character_count = len(transcript)
        logger.info(f"YouTube content {content_id} has {character_count} characters")
        
        # Mettre à jour les métadonnées
        if not content.content_metadata:
            content.content_metadata = {}
        content.content_metadata["character_count"] = character_count
        if metadata:
            for key, value in metadata.items():
                content.content_metadata[key] = value
            if "duration_seconds" in metadata:
                duration_min = metadata["duration_seconds"] / 60
                estimated_chars = round(duration_min * 900)
                logger.info(f"YouTube video duration: {duration_min:.1f} min, estimated chars at 900/min: {estimated_chars} vs actual: {character_count}")
        
        # Update content status to completed
        content.status = "completed"
        # Ajouter l'objet à la session avant commit
        db.add(content)
        
        # --- AJOUT : Marquer explicitement les métadonnées comme modifiées ---
        flag_modified(content, "content_metadata")
        # --- FIN AJOUT ---
        
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
        file_extension = os.path.splitext(content.file_path)[1].lower() if content.file_path else None
        
        logger.info(f"Routing content type: '{content_type}', extension: '{file_extension}'")
        
        # Traitement standard basé sur le type de contenu
        if content_type == 'pdf':
            return process_pdf_content(content_id)
        elif content_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' or file_extension == '.docx':
            return process_docx_content(content_id)
        # --- AJOUT : Rejeter explicitement .doc --- 
        elif content_type == 'application/msword' or file_extension == '.doc':
            error_msg = "Le format .doc n'est pas supporté. Veuillez convertir en .docx ou .pdf."
            logger.error(f"Contenu {content_id}: {error_msg}")
            content.status = "error"
            content.error_message = error_msg
            db.commit()
            return {"status": "error", "message": error_msg}
        # --- FIN AJOUT ---
        elif content_type in ['text', 'txt', 'md', 'markdown']:
            # Vérifier à nouveau .docx au cas où le type serait incorrect
            if file_extension == '.docx':
                return process_docx_content(content_id)
            else:
                return process_text_content(content_id)
        elif content_type == 'youtube':
            return process_youtube_content(content_id)
        elif content_type == 'website':
            # Website content should already have text stored.
            text = content.content_text or content.description or ""
            char_count = len(text)
            if char_count == 0:
                error_msg = "Website content has no text to process"
                logger.error(error_msg)
                content.status = "error"
                content.error_message = error_msg
                db.commit()
                return {"status": "error", "message": error_msg}

            # Update metadata
            if not content.content_metadata:
                content.content_metadata = {}
            content.content_metadata["character_count"] = char_count
            content.content_metadata["is_exact_count"] = True
            content.status = "completed"
            flag_modified(content, "content_metadata")
            db.commit()
            logger.info(f"Website content {content_id} marked completed with {char_count} characters")
            return {"status": "success", "content_id": content_id, "character_count": char_count}

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

@shared_task(name="transcribe_youtube_video", bind=True, max_retries=3)
def transcribe_youtube_video(self, content_id: int):
    """
    Transcrit une vidéo YouTube en utilisant UNIQUEMENT le service RapidAPI Speech-to-Text.
    
    Args:
        content_id (int): L'ID du contenu dans la base de données
    """
    logger.info(f"Début de la transcription de la vidéo YouTube (ID: {content_id}) via RapidAPI Speech-to-Text")
    
    # Create a new database session
    db = SessionLocal()
    transcript_text = "" # Initialiser la variable
    
    try:
        # Get the content from the database
        content = db.query(Content).filter(Content.id == content_id).first()
        
        if not content:
            logger.error(f"Contenu {content_id} non trouvé dans la base de données")
            return {"status": "error", "message": "Content not found"}
        
        # Mettre à jour le statut
        content.status = "processing"
        db.commit()
        
        # Extraire l'URL YouTube
        youtube_url = content.url
        if not youtube_url:
             logger.error(f"L'URL YouTube est manquante pour le contenu {content_id}")
             content.status = "error"
             content.error_message = "URL YouTube manquante"
             db.commit()
             return {"status": "error", "message": "Missing YouTube URL"}

        # --- Utilisation directe de RapidAPI Speech-to-Text ---
        try:
            import requests
            
            rapidapi_url = "https://speech-to-text-ai.p.rapidapi.com/transcribe"
            # Utiliser la langue détectée ou fallback vers 'fr' ou 'en' si nécessaire
            querystring = {"url": youtube_url, "lang": "fr", "task": "transcribe"} 
            headers = {
                "x-rapidapi-key": "9144fffaabmsh319ba65e73a3d86p164f35jsn097fa4509ee8",
                "x-rapidapi-host": "speech-to-text-ai.p.rapidapi.com",
                "Content-Type": "application/x-www-form-urlencoded"
            }
            
            logger.info(f"Appel à RapidAPI Speech-to-Text pour {youtube_url}")
            # Augmenter le timeout pour les vidéos longues
            response = requests.post(rapidapi_url, headers=headers, params=querystring, data={}, timeout=180) 
            
            if response.status_code == 200:
                data = response.json()
                if "text" in data and data["text"]:
                    transcript_text = data["text"]
                    logger.info(f"Transcription réussie via RapidAPI: {len(transcript_text)} caractères")
                    if not content.content_metadata:
                        content.content_metadata = {}
                    content.content_metadata["transcription_source"] = "rapidapi_speech_to_text"
                    
                    # Essayer d'extraire la durée des chunks si disponible
                    if "chunks" in data and data["chunks"]:
                        total_duration = sum(chunk.get("duration", 0) for chunk in data["chunks"])
                        if total_duration > 0:
                            content.content_metadata["duration_seconds"] = total_duration
                            logger.info(f"Durée extraite des chunks: {total_duration} secondes")
                else:
                    logger.warning(f"RapidAPI n'a pas retourné de transcription: {data}")
                    raise Exception("RapidAPI n'a pas retourné de transcription.")
        except Exception as rapidapi_error:
            logger.error(f"Échec de la transcription via RapidAPI: {str(rapidapi_error)}")
            content.status = "error"
            content.error_message = f"Échec de transcription RapidAPI: {str(rapidapi_error)}"
            db.commit()
            # Essayer de relancer la tâche si possible (jusqu'à max_retries)
            try:
                self.retry(exc=rapidapi_error, countdown=60) # Réessayer après 60 secondes
            except self.MaxRetriesExceededError:
                logger.error(f"Nombre maximal de tentatives atteint pour la tâche {self.request.id}")
                return {"status": "error", "message": f"Échec final de la transcription RapidAPI après plusieurs tentatives: {str(rapidapi_error)}"}

        # --- Fin Utilisation directe de RapidAPI ---

        # Enregistrer la transcription si obtenue
        if transcript_text:
            # Sauvegarder le texte extrait
            content.content_text = transcript_text 
            # Mettre à jour le statut et la date
            content.status = "completed"
            content.processed_at = datetime.utcnow()
            
            # Compter et stocker les caractères
            character_count = len(transcript_text)
            # Décommenter si vous avez un champ direct content.character_count
            # content.character_count = character_count 
            
            # Mettre à jour les métadonnées
            if not content.content_metadata:
                content.content_metadata = {}
            content.content_metadata["character_count"] = character_count
            content.content_metadata["is_exact_count"] = True 
            
            # Ajouter à la session et commiter
            db.add(content) 
            # --- AJOUT IMPORTANT : Marquer les métadonnées comme modifiées --- 
            flag_modified(content, "content_metadata")
            # --- FIN AJOUT ---
            db.commit()
            logger.info(f"Transcription terminée et enregistrée pour le contenu {content_id} ({character_count} caractères)")
            # Retourner le résultat
            return {
                "status": "success", 
                "content_id": content_id, 
                "character_count": character_count,
                "transcript": transcript_text, # Optionnel : renvoyer le texte
                "source": content.content_metadata.get("transcription_source", "unknown")
            }
        else:
            # Ce bloc est atteint si une erreur non récupérable s'est produite
            # ou si la tâche a dépassé le nombre max de tentatives
            # ... (code existant pour gérer l'erreur de transcription vide) ...
            if content.status != "error": 
                content.status = "error"
                content.error_message = "Transcription vide après tentative RapidAPI"
                db.commit()
            logger.error(f"Transcription vide pour le contenu {content_id} après tentative RapidAPI")
            return {"status": "error", "message": "Empty transcription after RapidAPI attempt"}
            
    except Exception as e:
        logger.error(f"Erreur inattendue lors de la transcription YouTube: {str(e)}")
        # Assurer la mise à jour du statut en cas d'erreur imprévue
        try:
            if 'content' in locals() and content: # Vérifier si 'content' est défini
                content.status = "error"
                content.error_message = f"Erreur inattendue: {str(e)}"
                db.commit()
        except Exception as db_error:
            logger.error(f"Impossible de mettre à jour le statut du contenu après erreur: {str(db_error)}")
        
        return {"status": "error", "message": f"Unexpected error: {str(e)}"}
    
    finally:
        db.close()

# --- NE PAS OUBLIER DE SUPPRIMER LA FONCTION extract_youtube_video_id SI ELLE N'EST PLUS UTILISÉE AILLEURS ---
# def extract_youtube_video_id(url: str) -> Optional[str] :
#     ... 
