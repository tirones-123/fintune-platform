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
        # Paramètres RapidAPI
        rapidapi_key = "9144ffaabmsh319ba65e73a3d86p164f35jsn097fa4509ee8"
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
        
        logger.info(f"Envoi de la requête à RapidAPI pour l'ID vidéo: {video_id}")
        response = requests.get(rapidapi_url, headers=headers, params=params)
        
        if response.status_code != 200:
            logger.error(f"Erreur RapidAPI: HTTP {response.status_code}")
            raise HTTPException(status_code=response.status_code, 
                                detail=f"Erreur lors de l'appel à l'API RapidAPI: {response.text}")
        
        response_data = response.json()
        logger.info(f"Réponse RapidAPI reçue: {response_data}")
        
        # Vérifier que la réponse contient un lien de téléchargement
        if "link" not in response_data or response_data.get("status") != "ok":
            error_msg = f"RapidAPI n'a pas fourni de lien de téléchargement: {response_data}"
            logger.error(error_msg)
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Télécharger le fichier MP3
        mp3_url = response_data["link"]
        file_path = os.path.join(temp_dir, f"{video_id}.mp3")
        
        logger.info(f"Téléchargement du MP3 depuis: {mp3_url}")
        mp3_response = requests.get(mp3_url, stream=True)
        
        if mp3_response.status_code != 200:
            error_msg = f"Erreur lors du téléchargement du MP3: HTTP {mp3_response.status_code}"
            logger.error(error_msg)
            raise HTTPException(status_code=mp3_response.status_code, detail=error_msg)
        
        # Écrire le fichier MP3
        with open(file_path, 'wb') as f:
            for chunk in mp3_response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        logger.info(f"Fichier MP3 téléchargé: {file_path}")
        
        if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
            error_msg = "Le fichier MP3 n'a pas été téléchargé correctement ou est vide"
            logger.error(error_msg)
            raise HTTPException(status_code=400, detail=error_msg)
        
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