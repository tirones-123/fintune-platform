from fastapi import APIRouter, HTTPException
import re
import os
import tempfile
import asyncio
from pydantic import BaseModel

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

    # Première tentative : extraire les sous-titres existants
    try:
        video_id = extract_youtube_id(video_url)
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        transcript = "\n".join(item["text"] for item in transcript_list)
        return {"transcript": transcript, "source": "youtube_transcript_api"}
    except Exception as e:
        # Journaliser l'erreur et passer à la méthode de fallback
        print("Extraction des sous-titres échouée:", str(e))

    # Fallback : télécharger l'audio et transcrire avec Whisper
    temp_dir = tempfile.gettempdir()
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(temp_dir, '%(id)s.%(ext)s'),
        'quiet': True
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=True)
            file_path = os.path.join(temp_dir, f"{info['id']}.{info['ext']}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur lors du téléchargement de l'audio: {str(e)}")

    try:
        max_size_bytes = 25 * 1024 * 1024  # 25MB en octets
        file_size = os.path.getsize(file_path)
        # Charger le modèle Whisper (peut être optimisé en cache si besoin)
        model = await asyncio.to_thread(whisper.load_model, "base")
        if file_size <= max_size_bytes:
            transcription_result = await asyncio.to_thread(model.transcribe, file_path)
            transcript = transcription_result.get("text", "")
        else:
            # Importer pydub pour découper l'audio en morceaux plus petits
            try:
                from pydub import AudioSegment
            except ImportError:
                raise HTTPException(status_code=500, detail="pydub n'est pas installé. Veuillez l'installer.")

            audio = AudioSegment.from_file(file_path)
            total_duration = audio.duration_seconds  # en secondes
            # Estimer le débit moyen en octets par seconde
            bps = file_size / total_duration
            # Déterminer la durée maximale par chunk afin que sa taille soit < 25MB
            chunk_duration = int(max_size_bytes / bps)
            if chunk_duration < 1:
                chunk_duration = 1  # au moins 1 seconde

            transcript_chunks = []
            for start in range(0, int(total_duration), chunk_duration):
                end = start + chunk_duration
                chunk_audio = audio[start * 1000: end * 1000]  # conversion en ms
                chunk_file = os.path.join(tempfile.gettempdir(), f"chunk_{start}_{end}.mp3")
                chunk_audio.export(chunk_file, format="mp3")
                result = await asyncio.to_thread(model.transcribe, chunk_file)
                transcript_chunks.append(result.get("text", ""))
                os.remove(chunk_file)
            transcript = "\n".join(transcript_chunks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la transcription audio: {str(e)}")
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

    return {"transcript": transcript, "source": "whisper"} 