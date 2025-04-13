from fastapi import APIRouter, HTTPException
import re
import os
import tempfile
import asyncio
import requests
from pydantic import BaseModel
import json
import logging
import time
import importlib
import sys
import traceback
from yt_dlp import YoutubeDL

# Configurer le logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Importer youtube_transcript_api pour extraire des sous-titres
try:
    from youtube_transcript_api import YouTubeTranscriptApi
except ImportError:
    raise ImportError("youtube_transcript_api n'est pas installé. Veuillez l'installer.")

# Vérifier quelle version de Whisper est disponible
WHISPER_TYPE = None

# Vérifier si OpenAI Whisper est installé
try:
    import whisper
    # Vérifier si c'est OpenAI Whisper ou une autre implémentation
    if hasattr(whisper, 'load_model'):
        WHISPER_TYPE = "openai"
        logger.info("Utilisation d'OpenAI Whisper")
    elif hasattr(whisper, 'Whisper'):
        WHISPER_TYPE = "whisper_custom"
        logger.info("Utilisation d'une implémentation custom de Whisper")
    else:
        logger.info("Module whisper trouvé mais sans méthode load_model reconnue")
        WHISPER_TYPE = "unknown"
except ImportError:
    logger.warning("OpenAI Whisper n'est pas installé, vérification d'autres implémentations")

# Vérifier si Faster Whisper est installé
if not WHISPER_TYPE or WHISPER_TYPE == "unknown":
    try:
        from faster_whisper import WhisperModel
        WHISPER_TYPE = "faster"
        logger.info("Utilisation de Faster Whisper")
    except ImportError:
        logger.warning("Faster Whisper n'est pas installé")

# Si aucune implémentation valide n'est trouvée
if not WHISPER_TYPE or WHISPER_TYPE == "unknown":
    logger.error("Aucune implémentation valide de Whisper n'a été trouvée")
    # Ne pas lever d'exception ici pour permettre au service de démarrer

# Ajouter l'import de pytube pour les métadonnées YouTube
try:
    from pytube import YouTube
except ImportError:
    logging.warning("pytube n'est pas installé. Certaines fonctionnalités d'extraction de métadonnées YouTube ne seront pas disponibles.")

router = APIRouter()

class VideoTranscriptRequest(BaseModel):
    video_url: str
    async_process: bool = False  # Option pour traitement asynchrone


def extract_youtube_id(url: str) -> str:
    """Extrait l'ID de la vidéo à partir d'une URL YouTube"""
    pattern = r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"
    match = re.search(pattern, url)
    if match:
        return match.group(1)
    else:
        raise ValueError("URL YouTube invalide")

async def transcribe_with_whisper(file_path: str) -> str:
    """Transcrit un fichier audio avec Whisper selon l'implémentation disponible"""
    if not WHISPER_TYPE or WHISPER_TYPE == "unknown":
        raise Exception("Aucune implémentation de Whisper n'est disponible")
    
    logger.info(f"Transcription avec {WHISPER_TYPE} Whisper")
    
    if WHISPER_TYPE == "openai":
        # OpenAI Whisper original
        model = await asyncio.to_thread(whisper.load_model, "base")
        result = await asyncio.to_thread(model.transcribe, file_path)
        return result.get("text", "")
    
    elif WHISPER_TYPE == "faster":
        # Faster Whisper (optimisé avec CTranslate2)
        model = WhisperModel("base", device="cpu", compute_type="int8")
        segments, info = await asyncio.to_thread(model.transcribe, file_path, beam_size=5)
        transcript = ""
        async for segment in segments:
            transcript += segment.text + " "
        return transcript
    
    elif WHISPER_TYPE == "whisper_custom":
        # Pour d'autres implémentations avec une interface différente
        model = whisper.Whisper()
        result = await asyncio.to_thread(model.transcribe, file_path)
        if isinstance(result, dict) and "text" in result:
            return result["text"]
        elif isinstance(result, str):
            return result
        else:
            return str(result)
    
    else:
        raise Exception(f"Type de Whisper non pris en charge: {WHISPER_TYPE}")

@router.post("/video-transcript", tags=["helpers"])
async def get_video_transcript(payload: VideoTranscriptRequest):
    video_url = payload.video_url
    use_async = payload.async_process
    
    logger.info(f"Tentative de transcription pour l'URL: {video_url} (mode asynchrone: {use_async})")

    # Vérifier si l'URL est valide
    if not video_url or not isinstance(video_url, str):
        raise HTTPException(status_code=400, detail="URL de vidéo invalide ou manquante")
    
    # Si l'URL ne contient pas youtube, vérifier si elle est supportée
    if "youtube.com" not in video_url and "youtu.be" not in video_url:
        # Option à ajouter pour d'autres plateformes dans le futur
        raise HTTPException(status_code=400, detail="Seules les URL YouTube sont prises en charge pour le moment")

    # Si le traitement asynchrone est demandé, utiliser Celery
    if use_async:
        from celery_app import celery_app
        from app.tasks.content_processing import transcribe_youtube_video
        
        # Lancer la tâche asynchrone
        logger.info(f"Lancement de la tâche asynchrone pour {video_url}")
        task = transcribe_youtube_video.delay(video_url)
        
        # Retourner l'ID de tâche qui pourra être utilisé pour vérifier l'état
        return {
            "task_id": task.id,
            "status": "processing",
            "message": "La transcription a été lancée en arrière-plan",
            "check_endpoint": f"/api/helpers/transcript-status/{task.id}"
        }

    # Sinon, continuer avec le traitement synchrone
    transcript_error = None
    file_path = None
    
    # Première tentative : extraire les sous-titres existants
    try:
        video_id = extract_youtube_id(video_url)
        logger.info(f"ID de la vidéo YouTube: {video_id}")
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['fr', 'en'])
        transcript = "\n".join(item["text"] for item in transcript_list)
        logger.info(f"Sous-titres extraits avec succès via youtube_transcript_api")
        return {"transcript": transcript, "source": "youtube_transcript_api"}
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
        response = requests.get(rapidapi_url, headers=headers, params=params, timeout=10)
        
        if response.status_code != 200:
            logger.error(f"Erreur RapidAPI: HTTP {response.status_code}")
            logger.error(f"Détails: {response.text}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Erreur lors de l'appel à RapidAPI: {response.text}"
            )
        
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
                retry_response = requests.get(rapidapi_url, headers=headers, params=params, timeout=10)
                
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
                        raise Exception(f"Échec de conversion: {retry_data.get('msg', 'Erreur inconnue')}")
                else:
                    logger.error(f"Erreur lors de la tentative {retry+1}: HTTP {retry_response.status_code}")
            
            # Si aucun URL n'a été obtenu après toutes les tentatives
            if not mp3_url:
                logger.error("Impossible d'obtenir le lien de téléchargement après plusieurs tentatives")
                raise Exception("Délai d'attente dépassé pour la conversion YouTube en MP3")
        else:
            # Format de réponse non reconnu
            logger.error(f"Format de réponse non reconnu: {response_data}")
            raise Exception(f"Format de réponse non reconnu: {response_data}")
        
        # Si nous sommes arrivés ici, nous avons un MP3 URL valide
        if not mp3_url:
            raise Exception("Aucun lien de téléchargement n'a été obtenu")
        
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
                        new_link_response = requests.get(rapidapi_url, headers=headers, params=params, timeout=10)
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
                head_response = requests.head(mp3_url, headers=download_headers, timeout=5)
                
                if head_response.status_code != 200:
                    logger.warning(f"Le lien n'est pas accessible: HTTP {head_response.status_code}")
                    continue
                
                # Si la vérification HEAD est bonne, télécharger le fichier
                mp3_response = requests.get(mp3_url, headers=download_headers, stream=True, timeout=30)
                
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
            raise HTTPException(status_code=400, detail={
                "error": error_msg,
                "details": "Le lien généré par RapidAPI n'est pas accessible ou a expiré",
                "solutions": [
                    "Réessayer ultérieurement",
                    "Vérifier que votre abonnement RapidAPI est actif",
                    "Essayer avec une autre URL YouTube"
                ]
            })
        
        # Transcription avec Whisper
        try:
            file_size = os.path.getsize(file_path)
            logger.info(f"Taille du fichier audio: {file_size} octets")
            
            # Transcription avec la fonction adaptative
            logger.info("Début de la transcription...")
            transcript = await transcribe_with_whisper(file_path)
            
            if not transcript:
                raise Exception("La transcription n'a pas produit de résultat")
                
            logger.info("Transcription audio terminée avec succès")
            
            return {"transcript": transcript, "source": "whisper"}
            
        except Exception as e:
            logger.error(f"Erreur lors de la transcription audio: {str(e)}")
            # Afficher plus de détails sur l'erreur pour le débogage
            logger.error(f"Détails de l'erreur: {traceback.format_exc()}")
            
            raise HTTPException(status_code=500, detail={
                "error": "Erreur lors de la transcription audio",
                "details": str(e),
                "trace": traceback.format_exc(),
                "solutions": [
                    "Vérifier l'installation de Whisper (pip install openai-whisper ou pip install faster-whisper)",
                    "Vérifier que les dépendances de Whisper sont installées (PyTorch, FFmpeg)"
                ]
            })
            
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Erreur lors du téléchargement via RapidAPI: {error_msg}")
        detailed_error = {
            "error": "Erreur lors du téléchargement de l'audio via RapidAPI",
            "details": error_msg,
            "transcript_error": transcript_error
        }
        raise HTTPException(status_code=400, detail=detailed_error)
    finally:
        # Nettoyer le fichier temporaire si existant
        if file_path and os.path.exists(file_path):
            logger.info(f"Suppression du fichier audio temporaire: {file_path}")
            os.remove(file_path)

@router.get("/youtube-metadata", tags=["helpers"])
async def get_youtube_metadata(video_id: str = None, video_url: str = None):
    logger.info(f"Récupération des métadonnées YouTube pour ID: {video_id} ou URL: {video_url}")
    
    # Vérifier qu'au moins un des paramètres est fourni
    if not video_id and video_url:
        try:
            video_id = extract_youtube_id(video_url)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    if not video_id:
        raise HTTPException(status_code=400, detail="L'ID ou l'URL de la vidéo YouTube doit être fourni")
    
    try:
        # Utiliser yt-dlp pour extraire les informations de la vidéo
        ydl_opts = {"quiet": True, "skip_download": True}
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
        
        metadata = {
            "video_id": video_id,
            "title": info.get("title"),
            "duration_seconds": info.get("duration"),
            "author": info.get("uploader")
        }
        logger.info(f"Métadonnées récupérées avec succès pour {video_id}: durée = {metadata['duration_seconds']} secondes")
        return metadata
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des métadonnées YouTube: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Erreur lors de la récupération des métadonnées: {str(e)}")

@router.get("/transcript-status/{task_id}", tags=["helpers"])
async def get_transcript_status(task_id: str):
    """
    Récupère l'état d'une tâche de transcription asynchrone.
    
    Args:
        task_id: ID de la tâche Celery
        
    Returns:
        Un objet contenant l'état de la tâche et éventuellement le résultat
    """
    from celery_app import celery_app
    from celery.result import AsyncResult
    
    logger.info(f"Vérification de l'état de la tâche {task_id}")
    
    # Récupérer le résultat de la tâche
    task_result = AsyncResult(task_id, app=celery_app)
    
    # Vérifier l'état
    if task_result.state == "PENDING":
        # La tâche est en attente ou n'existe pas
        response = {
            "task_id": task_id,
            "status": "pending",
            "message": "La tâche est en attente ou n'existe pas"
        }
    elif task_result.state == "STARTED" or task_result.state == "PROGRESS":
        # La tâche est en cours d'exécution
        response = {
            "task_id": task_id,
            "status": "processing",
            "message": "La transcription est en cours"
        }
    elif task_result.state == "SUCCESS":
        # La tâche est terminée
        result = task_result.get()
        
        # Vérifier si le résultat est un succès ou une erreur
        if result.get("status") == "success":
            response = {
                "task_id": task_id,
                "status": "completed",
                "transcript": result.get("transcript", ""),
                "source": result.get("source", "unknown")
            }
        else:
            response = {
                "task_id": task_id,
                "status": "error",
                "message": result.get("error", "Une erreur inconnue s'est produite"),
                "details": result.get("details", "")
            }
    elif task_result.state == "FAILURE":
        # La tâche a échoué
        response = {
            "task_id": task_id,
            "status": "error",
            "message": "La tâche a échoué",
            "details": str(task_result.result) if task_result.result else "Pas de détails disponibles"
        }
    else:
        # Autres états (REVOKED, RETRY, etc.)
        response = {
            "task_id": task_id,
            "status": task_result.state.lower(),
            "message": f"La tâche est dans l'état {task_result.state}"
        }
    
    logger.info(f"État de la tâche {task_id}: {response['status']}")
    return response 