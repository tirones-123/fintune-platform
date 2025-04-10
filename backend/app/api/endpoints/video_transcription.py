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
        # Première tentative avec youtube-mp36
        rapidapi_key = "9144ffaabmsh319ba65e73a3d86p164f35jsn097fa4509ee8"
        rapidapi_host = "youtube-mp36.p.rapidapi.com"
        rapidapi_url = f"https://{rapidapi_host}/dl"
        
        # Configuration de la requête RapidAPI
        headers = {
            "X-RapidAPI-Key": rapidapi_key,
            "X-RapidAPI-Host": rapidapi_host
        }
        
        # Utilise les noms de paramètres corrects conformément à la documentation de l'API
        params = {
            "id": video_id
        }
        
        logger.info(f"Tentative 1: Envoi de la requête à {rapidapi_host} pour l'ID vidéo: {video_id}")
        logger.info(f"URL de l'API: {rapidapi_url}")
        logger.info(f"Headers: {headers}")
        logger.info(f"Paramètres: {params}")
        
        # Première tentative avec youtube-mp36
        response = None
        try:
            response = requests.get(rapidapi_url, headers=headers, params=params, timeout=10)
            
            if response.status_code == 200:
                response_data = response.json()
                logger.info(f"Réponse RapidAPI reçue: {response_data}")
                
                # Vérifier que la réponse contient un lien de téléchargement
                if "link" in response_data and response_data.get("status") == "ok":
                    mp3_url = response_data["link"]
                    logger.info(f"Lien de téléchargement trouvé: {mp3_url}")
                else:
                    logger.error(f"Format de réponse incorrect: {response_data}")
                    raise Exception("Format de réponse incorrect")
            else:
                logger.error(f"Erreur API 1: HTTP {response.status_code}")
                logger.error(f"Détails: {response.text}")
                raise Exception(f"Erreur HTTP: {response.status_code}")
                
        except Exception as e1:
            logger.error(f"Échec de la première API: {str(e1)}")
            
            # Deuxième tentative avec une autre API
            logger.info("Tentative avec une autre API RapidAPI...")
            rapidapi_host2 = "youtube-mp3-downloader-highest-quality.p.rapidapi.com"
            rapidapi_url2 = f"https://{rapidapi_host2}/mp3"
            headers2 = {
                "X-RapidAPI-Key": rapidapi_key,
                "X-RapidAPI-Host": rapidapi_host2
            }
            params2 = {
                "url": f"https://www.youtube.com/watch?v={video_id}"
            }
            
            logger.info(f"Tentative 2: Envoi de la requête à {rapidapi_host2}")
            logger.info(f"URL: {rapidapi_url2}")
            logger.info(f"Paramètres: {params2}")
            
            try:
                response = requests.get(rapidapi_url2, headers=headers2, params=params2, timeout=10)
                
                if response.status_code == 200:
                    response_data = response.json()
                    logger.info(f"Réponse de la deuxième API reçue: {response_data}")
                    
                    # Adapter la structure de la réponse du second service
                    if "link" in response_data:
                        mp3_url = response_data["link"]
                        logger.info(f"Lien de téléchargement trouvé (API 2): {mp3_url}")
                    else:
                        logger.error(f"Format de réponse incorrect (API 2): {response_data}")
                        raise Exception("Format de réponse incorrect (API 2)")
                else:
                    logger.error(f"Erreur API 2: HTTP {response.status_code}")
                    logger.error(f"Détails (API 2): {response.text}")
                    raise Exception(f"Erreur HTTP (API 2): {response.status_code}")
                    
            except Exception as e2:
                logger.error(f"Échec de la deuxième API: {str(e2)}")
                
                # Toutes les tentatives ont échoué, renvoyer une erreur
                raise HTTPException(
                    status_code=503,
                    detail={
                        "error": "Échec de toutes les tentatives d'API RapidAPI",
                        "details": f"API 1: {str(e1)}, API 2: {str(e2)}",
                        "solutions": [
                            "Vérifier l'abonnement et les quotas des services RapidAPI",
                            "Essayer ultérieurement",
                            "Configurer d'autres API alternatives"
                        ]
                    }
                )
        
        # Télécharger le fichier MP3
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