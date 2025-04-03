from fastapi import APIRouter, HTTPException
import re
import os
import tempfile
import asyncio
from pydantic import BaseModel
import json
import logging

# Configurer le logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Importer youtube_transcript_api pour extraire des sous-titres
try:
    from youtube_transcript_api import YouTubeTranscriptApi
except ImportError:
    raise ImportError("youtube_transcript_api n'est pas installé. Veuillez l'installer.")

# Importer yt_dlp pour télécharger l'audio
try:
    import yt_dlp
except ImportError:
    raise ImportError("yt_dlp n'est pas installé. Veuillez l'installer.")

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
        logger.warning(f"Extraction des sous-titres échouée: {str(e)}")

    # Fallback : télécharger l'audio et transcrire avec Whisper
    logger.info(f"Tentative de téléchargement et transcription avec Whisper")
    temp_dir = tempfile.gettempdir()
    
    # Configurez les options de yt-dlp avec des en-têtes de navigateur et autres options
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(temp_dir, '%(id)s.%(ext)s'),
        'quiet': False,  # Afficher les logs pour le débogage
        'no_warnings': False,
        'ignoreerrors': True,
        'noplaylist': True,
        'extract_flat': False,
        'nocheckcertificate': True,
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Origin': 'https://www.youtube.com',
            'Referer': 'https://www.youtube.com/'
        }
    }
    
    # Chemin pour le fichier de cookies (vous devrez créer et remplir ce fichier)
    cookies_file = os.path.join(os.path.dirname(__file__), 'youtube_cookies.txt')
    if os.path.exists(cookies_file):
        logger.info(f"Utilisation du fichier de cookies: {cookies_file}")
        ydl_opts['cookiefile'] = cookies_file
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            logger.info("Début de l'extraction des informations vidéo")
            info = ydl.extract_info(video_url, download=True)
            if not info:
                raise HTTPException(status_code=400, detail="Impossible d'extraire les informations de la vidéo")
            
            file_path = os.path.join(temp_dir, f"{info['id']}.{info['ext']}")
            logger.info(f"Fichier audio téléchargé: {file_path}")
            
            if not os.path.exists(file_path):
                raise HTTPException(status_code=404, detail="Le fichier audio n'a pas été téléchargé correctement")
    except Exception as e:
        logger.error(f"Erreur lors du téléchargement de l'audio: {str(e)}")
        # Vérifier si l'erreur concerne une vérification anti-bot
        if "Sign in to confirm you're not a bot" in str(e):
            raise HTTPException(status_code=403, detail="YouTube requiert une authentification pour accéder à cette vidéo. Veuillez utiliser une autre vidéo ou configurer un fichier de cookies.")
        else:
            raise HTTPException(status_code=400, detail=f"Erreur lors du téléchargement de l'audio: {str(e)}")

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