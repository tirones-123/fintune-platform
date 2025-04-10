from celery import shared_task
from loguru import logger
from sqlalchemy.orm import Session
import os
import time
import PyPDF2
import docx
import sys

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

@shared_task(name="transcribe_youtube_video", time_limit=18000, soft_time_limit=16200)
def transcribe_youtube_video(video_url: str):
    """
    Tâche asynchrone pour transcrire une vidéo YouTube.
    Cette tâche peut être exécutée en dehors du contexte d'une requête HTTP,
    ce qui permet des délais de traitement plus longs.
    
    Args:
        video_url: URL de la vidéo YouTube à transcrire
        
    Returns:
        Dict avec la transcription et des détails sur la méthode utilisée
    """
    from app.api.endpoints.video_transcription import extract_youtube_id, transcribe_with_whisper
    import asyncio
    import tempfile
    import os
    import requests
    import time
    from youtube_transcript_api import YouTubeTranscriptApi
    
    logger.info(f"Démarrage de la transcription asynchrone pour l'URL: {video_url}")
    
    transcript_error = None
    file_path = None
    
    # Première tentative : extraire les sous-titres existants
    try:
        video_id = extract_youtube_id(video_url)
        logger.info(f"ID de la vidéo YouTube: {video_id}")
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['fr', 'en'])
        transcript = "\n".join(item["text"] for item in transcript_list)
        logger.info(f"Sous-titres extraits avec succès via youtube_transcript_api")
        return {"transcript": transcript, "source": "youtube_transcript_api", "status": "success"}
    except Exception as e:
        # Journaliser l'erreur et passer à la méthode de fallback
        error_msg = str(e)
        transcript_error = error_msg
        logger.warning(f"Extraction des sous-titres échouée: {error_msg}")

    # Fallback : utiliser RapidAPI pour télécharger l'audio et le transcrire avec Whisper
    logger.info(f"Tentative de téléchargement avec RapidAPI et transcription avec Whisper")
    temp_dir = tempfile.gettempdir()
    
    try:
        # Configuration RapidAPI
        rapidapi_key = "9144fffaabmsh319ba65e73a3d86p164f35jsn097fa4509ee8"
        rapidapi_host = "youtube-mp36.p.rapidapi.com"
        rapidapi_url = f"https://{rapidapi_host}/dl"
        
        # Configuration de la requête RapidAPI
        headers = {
            "X-RapidAPI-Key": rapidapi_key,
            "X-RapidAPI-Host": rapidapi_host
        }
        
        params = {
            "id": video_id
        }
        
        logger.info(f"Envoi de la requête à {rapidapi_host} pour l'ID vidéo: {video_id}")
        
        # Paramètres pour la gestion des retries
        max_retries = 5
        retry_delay = 5  # secondes
        mp3_url = None
        
        # Première requête pour initialiser la conversion
        response = requests.get(rapidapi_url, headers=headers, params=params, timeout=20)
        
        if response.status_code != 200:
            logger.error(f"Erreur RapidAPI: HTTP {response.status_code}")
            logger.error(f"Détails: {response.text}")
            return {"status": "error", "error": f"Erreur lors de l'appel à RapidAPI: {response.text}"}
        
        # Parse la réponse initiale
        response_data = response.json()
        logger.info(f"Réponse initiale: {response_data}")
        
        # Si le statut est "ok" et un lien est fourni immédiatement
        if "status" in response_data and response_data["status"] == "ok" and response_data.get("link"):
            mp3_url = response_data["link"]
            logger.info(f"Lien de téléchargement obtenu immédiatement: {mp3_url}")
        
        # Si la vidéo est en cours de traitement, attendre et réessayer
        elif "status" in response_data and response_data["status"] == "processing":
            logger.info("La vidéo est en cours de traitement par RapidAPI, attente...")
            
            for retry in range(max_retries):
                logger.info(f"Attente de {retry_delay} secondes avant nouvel essai ({retry+1}/{max_retries})...")
                time.sleep(retry_delay)
                
                # Réessayer la requête
                retry_response = requests.get(rapidapi_url, headers=headers, params=params, timeout=20)
                
                if retry_response.status_code == 200:
                    retry_data = retry_response.json()
                    logger.info(f"Réponse après attente ({retry+1}): {retry_data}")
                    
                    # Vérifier si la conversion est terminée
                    if retry_data.get("status") == "ok" and retry_data.get("link"):
                        mp3_url = retry_data["link"]
                        logger.info(f"Lien de téléchargement obtenu après {retry+1} tentatives: {mp3_url}")
                        break
                    elif retry_data.get("status") == "fail":
                        logger.error(f"Échec de conversion: {retry_data}")
                        return {"status": "error", "error": f"Échec de conversion: {retry_data.get('msg', 'Erreur inconnue')}"}
                else:
                    logger.error(f"Erreur lors de la tentative {retry+1}: HTTP {retry_response.status_code}")
            
            # Si aucun URL n'a été obtenu après toutes les tentatives
            if not mp3_url:
                logger.error("Impossible d'obtenir le lien de téléchargement après plusieurs tentatives")
                return {"status": "error", "error": "Délai d'attente dépassé pour la conversion YouTube en MP3"}
        else:
            # Format de réponse non reconnu
            logger.error(f"Format de réponse non reconnu: {response_data}")
            return {"status": "error", "error": f"Format de réponse non reconnu: {response_data}"}
        
        # Si nous sommes arrivés ici, nous avons un MP3 URL valide
        if not mp3_url:
            return {"status": "error", "error": "Aucun lien de téléchargement n'a été obtenu"}
        
        # Télécharger le fichier MP3
        file_path = os.path.join(temp_dir, f"{video_id}.mp3")
        
        logger.info(f"Téléchargement du MP3 depuis: {mp3_url}")
        
        # Ajouter des en-têtes spécifiques pour le téléchargement
        download_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Referer": "https://youtube-mp36.p.rapidapi.com/"
        }
        
        # Essayer de télécharger le fichier avec plusieurs tentatives
        download_success = False
        max_download_retries = 3
        
        for download_attempt in range(max_download_retries):
            try:
                logger.info(f"Tentative de téléchargement {download_attempt+1}/{max_download_retries}")
                
                # Si ce n'est pas la première tentative et que nous avons des erreurs, 
                # refaire l'appel API pour obtenir un nouveau lien
                if download_attempt > 0:
                    logger.info("Obtention d'un nouveau lien de téléchargement...")
                    try:
                        new_link_response = requests.get(rapidapi_url, headers=headers, params=params, timeout=20)
                        if new_link_response.status_code == 200:
                            new_link_data = new_link_response.json()
                            if new_link_data.get("status") == "ok" and new_link_data.get("link"):
                                mp3_url = new_link_data["link"]
                                logger.info(f"Nouveau lien obtenu: {mp3_url}")
                            else:
                                logger.warning(f"Impossible d'obtenir un nouveau lien valide: {new_link_data}")
                        else:
                            logger.warning(f"Erreur lors de l'obtention d'un nouveau lien: HTTP {new_link_response.status_code}")
                    except Exception as e:
                        logger.warning(f"Erreur lors de la tentative d'obtention d'un nouveau lien: {str(e)}")
                
                # Faire une requête HEAD d'abord pour vérifier si l'URL est accessible
                logger.info("Vérification de l'accessibilité du lien...")
                head_response = requests.head(mp3_url, headers=download_headers, timeout=10)
                
                if head_response.status_code != 200:
                    logger.warning(f"Le lien n'est pas accessible: HTTP {head_response.status_code}")
                    continue
                
                # Si la vérification HEAD est bonne, télécharger le fichier
                mp3_response = requests.get(mp3_url, headers=download_headers, stream=True, timeout=60)
                
                if mp3_response.status_code == 200:
                    with open(file_path, 'wb') as f:
                        for chunk in mp3_response.iter_content(chunk_size=8192):
                            if chunk:
                                f.write(chunk)
                    
                    # Vérifier que le fichier a bien été téléchargé
                    if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
                        logger.info(f"Fichier MP3 téléchargé avec succès: {file_path} ({os.path.getsize(file_path)} octets)")
                        download_success = True
                        break
                    else:
                        logger.warning("Le fichier téléchargé est vide ou n'existe pas")
                else:
                    logger.warning(f"Erreur lors du téléchargement: HTTP {mp3_response.status_code}")
            
            except Exception as download_error:
                logger.warning(f"Erreur pendant le téléchargement: {str(download_error)}")
                # Continuer avec la prochaine tentative
        
        # Vérifier si le téléchargement a réussi après toutes les tentatives
        if not download_success:
            error_msg = "Impossible de télécharger le fichier MP3 après plusieurs tentatives"
            logger.error(error_msg)
            return {
                "status": "error", 
                "error": error_msg,
                "details": "Le lien généré par RapidAPI n'est pas accessible ou a expiré"
            }
        
        # Transcription avec Whisper
        try:
            file_size = os.path.getsize(file_path)
            logger.info(f"Taille du fichier audio: {file_size} octets")
            
            # Transcription avec la fonction adaptative
            logger.info("Début de la transcription...")
            # Créer une boucle asyncio pour appeler la fonction async
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            transcript = loop.run_until_complete(transcribe_with_whisper(file_path))
            loop.close()
            
            if not transcript:
                return {"status": "error", "error": "La transcription n'a pas produit de résultat"}
                
            logger.info("Transcription audio terminée avec succès")
            
            return {"transcript": transcript, "source": "whisper", "status": "success"}
            
        except Exception as e:
            logger.error(f"Erreur lors de la transcription audio: {str(e)}")
            import traceback
            logger.error(f"Détails de l'erreur: {traceback.format_exc()}")
            
            return {
                "status": "error",
                "error": "Erreur lors de la transcription audio",
                "details": str(e)
            }
            
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Erreur lors du téléchargement via RapidAPI: {error_msg}")
        return {
            "status": "error",
            "error": "Erreur lors du téléchargement de l'audio via RapidAPI",
            "details": error_msg,
            "transcript_error": transcript_error
        }
    finally:
        # Nettoyer le fichier temporaire si existant
        if file_path and os.path.exists(file_path):
            logger.info(f"Suppression du fichier audio temporaire: {file_path}")
            os.remove(file_path) 