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
import whisper
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
        
        # Mettre à jour les métadonnées
        if not content.content_metadata:
            content.content_metadata = {}
        
        content.content_metadata["character_count"] = character_count
        content.content_metadata["is_exact_count"] = True  # Indiquer que ce comptage est exact
        content.content_metadata["page_count"] = len(pdf_reader.pages)
        
        # Update content status to processed
        content.status = "completed"
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
        
        # Compter les caractères - méthode exacte
        character_count = len(extracted_text)
        logger.info(f"Text content {content_id} has {character_count} characters")
        
        # Mettre à jour les métadonnées
        if not content.content_metadata:
            content.content_metadata = {}
        
        content.content_metadata["character_count"] = character_count
        content.content_metadata["is_exact_count"] = True  # Indiquer que ce comptage est exact
        
        # Update content status to completed
        content.status = "completed"
        db.commit()
        logger.info(f"Text content {content_id} status updated to 'completed'")
        
        # Vérifier que le statut a bien été mis à jour
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
        character_count = len(extracted_text)
        logger.info(f"DOCX content {content_id} has {character_count} characters")
        if not content.content_metadata:
            content.content_metadata = {}
        content.content_metadata["character_count"] = character_count
        content.content_metadata["is_exact_count"] = True  # Indiquer que ce comptage est exact
        content.status = "completed"
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
        transcript, metadata = content_processor.process_youtube_content(youtube_url)
        
        if transcript is None:
            error_msg = f"Could not extract transcript from YouTube video {youtube_url}"
            logger.error(error_msg)
            content.status = "error"
            content.error_message = error_msg
            db.commit()
            return {"status": "error", "message": error_msg}
        
        # Compter les caractères
        character_count = len(transcript)
        logger.info(f"YouTube content {content_id} has {character_count} characters")
        
        # Mettre à jour les métadonnées
        if not content.content_metadata:
            content.content_metadata = {}
        
        # Ajouter le comptage de caractères aux métadonnées
        content.content_metadata["character_count"] = character_count
        
        # Ajouter les métadonnées de la vidéo
        if metadata:
            # Fusionner les métadonnées avec les métadonnées existantes
            for key, value in metadata.items():
                content.content_metadata[key] = value
                
            # Log des informations de durée
            if "duration_seconds" in metadata:
                duration_min = metadata["duration_seconds"] / 60
                estimated_chars = round(duration_min * 900)
                logger.info(f"YouTube video duration: {duration_min:.1f} min, estimated chars at 900/min: {estimated_chars} vs actual: {character_count}")
        
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
        
        # Traitement standard basé sur le type de contenu
        if content_type == 'pdf':
            return process_pdf_content(content_id)
        elif content_type in ['doc', 'docx']:
            return process_docx_content(content_id)
        elif content_type in ['text', 'txt', 'md', 'markdown']:
            if content.file_path and content.file_path.lower().endswith('.docx'):
                return process_docx_content(content_id)
            else:
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

@shared_task(name="transcribe_youtube_video", bind=True, max_retries=3)
def transcribe_youtube_video(self, content_id: int):
    """
    Transcrit une vidéo YouTube en utilisant d'abord l'API YouTube Transcript,
    et si cela échoue, utilise Whisper pour transcrire l'audio de la vidéo.
    
    Args:
        content_id (int): L'ID du contenu dans la base de données
    """
    logger.info(f"Début de la transcription de la vidéo YouTube (ID: {content_id})")
    
    # Create a new database session
    db = SessionLocal()
    
    try:
        # Get the content from the database
        content = db.query(Content).filter(Content.id == content_id).first()
        
        if not content:
            logger.error(f"Contenu {content_id} non trouvé dans la base de données")
            return {"status": "error", "message": "Content not found"}
        
        # Mettre à jour le statut
        content.status = "processing"
        db.commit()
        
        # Extraire l'ID de la vidéo YouTube
        youtube_url = content.url
        video_id = extract_youtube_video_id(youtube_url)
        if not video_id:
            logger.error(f"Impossible d'extraire l'ID de la vidéo YouTube à partir de l'URL: {youtube_url}")
            content.status = "error"
            content.error_message = "URL YouTube invalide"
            db.commit()
            return {"status": "error", "message": "Invalid YouTube URL"}
        
        logger.info(f"ID vidéo YouTube extrait: {video_id}")
        transcript_text = ""
        
        # Tentative d'obtention des sous-titres via l'API YouTube
        try:
            logger.info(f"Tentative d'obtention des sous-titres via l'API YouTube pour {video_id}")
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            transcript = None
            
            # Essayer d'abord de trouver les sous-titres en français
            try:
                transcript = transcript_list.find_transcript(['fr']) 
                logger.info("Sous-titres français trouvés")
            except:
                # Si pas de sous-titres en français, essayer l'anglais
                try:
                    transcript = transcript_list.find_transcript(['en'])
                    logger.info("Sous-titres anglais trouvés")
                except:
                    # Sinon prendre un transcript généré automatiquement
                    try:
                        transcript = transcript_list.find_generated_transcript()
                        logger.info("Sous-titres générés automatiquement trouvés")
                    except:
                        # Utiliser les transcripts disponibles
                        available_transcripts = list(transcript_list._transcripts.values())
                        if available_transcripts:
                            transcript = available_transcripts[0]
                            logger.info(f"Utilisation des sous-titres disponibles en {transcript.language}")
            
            if transcript:
                transcript_data = transcript.fetch()
                transcript_text = " ".join([item['text'] for item in transcript_data])
                logger.info(f"Transcription YouTube obtenue avec succès ({len(transcript_text)} caractères)")
            else:
                raise NoTranscriptFound(video_id)
                
        except (TranscriptsDisabled, NoTranscriptFound) as e:
            logger.info(f"Pas de sous-titres disponibles via l'API YouTube: {str(e)}. Fallback vers Whisper.")
            # Fallback vers Whisper
            try:
                # Télécharger l'audio de la vidéo avec yt-dlp
                logger.info(f"Téléchargement de l'audio pour la vidéo {video_id}")
                with tempfile.TemporaryDirectory() as temp_dir:
                    audio_path = os.path.join(temp_dir, f"{video_id}.mp3")
                    
                    ydl_opts = {
                        'format': 'bestaudio/best',
                        'outtmpl': audio_path,
                        'postprocessors': [{
                            'key': 'FFmpegExtractAudio',
                            'preferredcodec': 'mp3',
                            'preferredquality': '192',
                        }],
                        'quiet': True
                    }
                    
                    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                        ydl.download([f"https://www.youtube.com/watch?v={video_id}"])
                    
                    logger.info(f"Audio téléchargé, transcription avec Whisper...")
                    
                    # Charger le modèle Whisper (utiliser 'base' pour un bon équilibre entre précision et vitesse)
                    model = whisper.load_model("base")
                    
                    # Transcription avec Whisper
                    result = model.transcribe(audio_path)
                    transcript_text = result["text"]
                    
                    logger.info(f"Transcription Whisper terminée ({len(transcript_text)} caractères)")
            
            except Exception as whisper_error:
                logger.error(f"Erreur lors de la transcription avec Whisper: {str(whisper_error)}")
                content.status = "error"
                content.error_message = f"Échec de transcription: {str(whisper_error)}"
                db.commit()
                return {"status": "error", "message": f"Whisper transcription failed: {str(whisper_error)}"}
        
        except Exception as e:
            logger.error(f"Erreur lors de la transcription YouTube: {str(e)}")
            content.status = "error"
            content.error_message = f"Erreur de transcription: {str(e)}"
            db.commit()
            return {"status": "error", "message": f"Transcription error: {str(e)}"}
        
        # Enregistrer la transcription
        if transcript_text:
            content.content = transcript_text
            content.status = "completed"
            content.processed_at = datetime.utcnow()
            
            # Compter les caractères
            character_count = len(transcript_text)
            content.character_count = character_count
            
            # Mettre à jour les métadonnées
            if not content.content_metadata:
                content.content_metadata = {}
            content.content_metadata["character_count"] = character_count
            content.content_metadata["is_exact_count"] = True
            content.content_metadata["transcription_source"] = "youtube_api" if "API YouTube" in logger.records[-10:] else "whisper"
            
            db.commit()
            logger.info(f"Transcription terminée et enregistrée pour le contenu {content_id} ({character_count} caractères)")
            return {
                "status": "success", 
                "content_id": content_id, 
                "character_count": character_count,
                "transcript": transcript_text
            }
        else:
            content.status = "error"
            content.error_message = "Transcription vide"
            db.commit()
            logger.error(f"Transcription vide pour le contenu {content_id}")
            return {"status": "error", "message": "Empty transcription"}
            
    except Exception as e:
        logger.error(f"Erreur inattendue lors de la transcription YouTube: {str(e)}")
        try:
            # Get the content from the database if not already retrieved
            if 'content' not in locals():
                content = db.query(Content).filter(Content.id == content_id).first()
            
            if content:
                content.status = "error"
                content.error_message = f"Erreur inattendue: {str(e)}"
                db.commit()
        except Exception as db_error:
            logger.error(f"Impossible de mettre à jour le statut du contenu après erreur: {str(db_error)}")
        
        return {"status": "error", "message": f"Unexpected error: {str(e)}"}
    
    finally:
        db.close()

def extract_youtube_video_id(url: str) -> Optional[str]:
    """
    Extrait l'ID d'une vidéo YouTube à partir de différents formats d'URL.
    
    Args:
        url (str): L'URL de la vidéo YouTube
        
    Returns:
        Optional[str]: L'ID de la vidéo YouTube ou None si l'extraction échoue
    """
    # Regex pour extraire l'ID de vidéo YouTube
    pattern = r'(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})'
    match = re.search(pattern, url)
    
    if match:
        return match.group(1)
    return None 