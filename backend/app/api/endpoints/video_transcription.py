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

# Configurer le logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Importer youtube_transcript_api pour extraire des sous-titres
try:
    from youtube_transcript_api import YouTubeTranscriptApi
except ImportError:
    raise ImportError("youtube_transcript_api n'est pas installé. Veuillez l'installer.")

# Importer Whisper pour la transcription audio
try:
    import whisper
except ImportError:
    raise ImportError("whisper n'est pas installé. Veuillez l'installer.")

router = APIRouter()

class VideoTranscriptRequest(BaseModel):
    video_url: str


def extract_youtube_id(url: str) -> str:
    """Extrait l'ID de la vidéo à partir d'une URL YouTube"""
    pattern = r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"
    match = re.search(pattern, url)
    if match:
        return match.group(1)
    else:
        raise ValueError("URL YouTube invalide")

@router.post("/video-transcript", tags=["helpers"])
async def get_video_transcript(payload: VideoTranscriptRequest):
    video_url = payload.video_url
    logger.info(f"Tentative de transcription pour l'URL: {video_url}")

    # Vérifier si l'URL est valide
    if not video_url or not isinstance(video_url, str):
        raise HTTPException(status_code=400, detail="URL de vidéo invalide ou manquante")
    
    # Si l'URL ne contient pas youtube, vérifier si elle est supportée
    if "youtube.com" not in video_url and "youtu.be" not in video_url:
        # Option à ajouter pour d'autres plateformes dans le futur
        raise HTTPException(status_code=400, detail="Seules les URL YouTube sont prises en charge pour le moment")

    transcript_error = None
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
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Erreur lors du téléchargement via RapidAPI: {error_msg}")
        detailed_error = {
            "error": "Erreur lors du téléchargement de l'audio via RapidAPI",
            "details": error_msg,
            "transcript_error": transcript_error
        }
        raise HTTPException(status_code=400, detail=detailed_error)

    try:
        max_size_bytes = 25 * 1024 * 1024  # 25MB en octets
        file_size = os.path.getsize(file_path)
        logger.info(f"Taille du fichier audio: {file_size} octets")
        
        # Charger le modèle Whisper (peut être optimisé en cache si besoin)
        logger.info("Chargement du modèle Whisper")
        model = await asyncio.to_thread(whisper.load_model, "base")
        
        if file_size <= max_size_bytes:
            logger.info("Fichier audio sous la limite de taille, transcription directe")
            transcription_result = await asyncio.to_thread(model.transcribe, file_path)
            transcript = transcription_result.get("text", "")
        else:
            logger.info(f"Fichier audio au-dessus de la limite de taille ({file_size} > {max_size_bytes}), découpage en segments")
            # Importer pydub pour découper l'audio en morceaux plus petits
            try:
                from pydub import AudioSegment
            except ImportError:
                raise HTTPException(status_code=500, detail="pydub n'est pas installé. Veuillez l'installer.")

            logger.info("Chargement du fichier audio avec pydub")
            audio = AudioSegment.from_file(file_path)
            total_duration = audio.duration_seconds  # en secondes
            logger.info(f"Durée totale de l'audio: {total_duration} secondes")
            
            # Estimer le débit moyen en octets par seconde
            bps = file_size / total_duration
            # Déterminer la durée maximale par chunk afin que sa taille soit < 25MB
            chunk_duration = int(max_size_bytes / bps)
            if chunk_duration < 1:
                chunk_duration = 1  # au moins 1 seconde
            
            logger.info(f"Durée de chaque segment: {chunk_duration} secondes")
            
            transcript_chunks = []
            for start in range(0, int(total_duration), chunk_duration):
                end = min(start + chunk_duration, int(total_duration))
                logger.info(f"Traitement du segment audio: {start} - {end} secondes")
                
                chunk_audio = audio[start * 1000: end * 1000]  # conversion en ms
                chunk_file = os.path.join(tempfile.gettempdir(), f"chunk_{start}_{end}.mp3")
                chunk_audio.export(chunk_file, format="mp3")
                
                logger.info(f"Transcription du segment: {chunk_file}")
                result = await asyncio.to_thread(model.transcribe, chunk_file)
                transcript_chunks.append(result.get("text", ""))
                
                os.remove(chunk_file)
                logger.info(f"Segment {start}-{end} traité et fichier temporaire supprimé")
            
            transcript = "\n".join(transcript_chunks)
        
        logger.info("Transcription audio terminée avec succès")
    except Exception as e:
        logger.error(f"Erreur lors de la transcription audio: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la transcription audio: {str(e)}")
    finally:
        if os.path.exists(file_path):
            logger.info(f"Suppression du fichier audio temporaire: {file_path}")
            os.remove(file_path)

    return {"transcript": transcript, "source": "whisper"} 