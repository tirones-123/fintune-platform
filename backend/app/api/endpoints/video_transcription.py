from fastapi import APIRouter, HTTPException
import re
import os
import tempfile
import asyncio
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

# Importer pytube pour une alternative de téléchargement
try:
    from pytube import YouTube
except ImportError:
    raise ImportError("pytube n'est pas installé. Veuillez l'installer.")

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
        
        # Cas particulier: si les sous-titres sont désactivés, on le note pour ne pas afficher cette erreur
        # si nous réussissons à télécharger l'audio plus tard
        subtitles_disabled = "Subtitles are disabled for this video" in error_msg

    # Fallback : télécharger l'audio et transcrire avec Whisper
    logger.info(f"Tentative de téléchargement et transcription avec Whisper")
    temp_dir = tempfile.gettempdir()
    
    # Configuration améliorée pour yt-dlp avec plus d'options pour contourner les protections
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(temp_dir, '%(id)s.%(ext)s'),
        'quiet': False,
        'no_warnings': False,
        'ignoreerrors': True,
        'noplaylist': True,
        'extract_flat': False,
        'nocheckcertificate': True,
        'geo_bypass': True,
        'geo_bypass_country': 'US',
        'socket_timeout': 30,
        'source_address': '0.0.0.0',
        'sleep_interval': 2,  # Attendre entre les requêtes pour éviter la détection de bot
        'max_sleep_interval': 5,
        'sleep_interval_requests': 1,
        'extractor_retries': 5,
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Origin': 'https://www.youtube.com',
            'Referer': 'https://www.youtube.com/',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'sec-ch-ua': '"Chromium";v="118", "Google Chrome";v="118"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive'
        }
    }
    
    # Chemin pour le fichier de cookies (vous devrez créer et remplir ce fichier)
    cookies_file = os.path.join(os.path.dirname(__file__), 'youtube_cookies.txt')
    cookie_error = None
    # Vérifier si le fichier de cookies existe et a une taille non nulle
    if os.path.exists(cookies_file) and os.path.getsize(cookies_file) > 0:
        try:
            # On essaie de vérifier si le fichier est bien formaté
            with open(cookies_file, 'r') as f:
                content = f.read().strip()
                if content and (content.startswith("# Netscape HTTP Cookie File") or content.startswith("# HTTP Cookie File")):
                    logger.info(f"Utilisation du fichier de cookies: {cookies_file}")
                    ydl_opts['cookiefile'] = cookies_file
                else:
                    cookie_error = f"Le fichier {cookies_file} ne semble pas être un fichier de cookies valide au format Netscape"
                    logger.warning(cookie_error)
        except Exception as e:
            cookie_error = f"Erreur lors de la lecture du fichier de cookies: {str(e)}"
            logger.warning(cookie_error)
    else:
        cookie_error = f"Fichier de cookies inexistant ou vide: {cookies_file}"
        logger.warning(cookie_error)
    
    download_error = None
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            logger.info("Début de l'extraction des informations vidéo")
            info = ydl.extract_info(video_url, download=True)
            if not info:
                download_error = "Impossible d'extraire les informations de la vidéo"
                raise HTTPException(status_code=400, detail=download_error)
            
            file_path = os.path.join(temp_dir, f"{info['id']}.{info['ext']}")
            logger.info(f"Fichier audio téléchargé: {file_path}")
            
            if not os.path.exists(file_path):
                download_error = "Le fichier audio n'a pas été téléchargé correctement"
                raise HTTPException(status_code=404, detail=download_error)
    except Exception as e:
        error_msg = str(e)
        download_error = error_msg
        logger.error(f"Erreur lors du téléchargement de l'audio: {error_msg}")
        # Si l'erreur indique un blocage anti-bot, tenter une alternative via pytube
        if "Sign in to confirm you're not a bot" in error_msg or "Precondition check failed" in error_msg:
            logger.info("============== TENTATIVE AVEC PYTUBE ==============")
            try:
                logger.info("Tentative de téléchargement de l'audio via pytube")
                
                # Configuration des headers pour pytube (contournement anti-bot)
                try:
                    from pytube.innertube import InnerTube
                    from pytube import YouTube
                    logger.info("Modules pytube importés avec succès")
                except ImportError as import_error:
                    logger.error(f"Erreur lors de l'import de pytube: {str(import_error)}")
                    raise Exception(f"Erreur d'import pytube: {str(import_error)}")
                
                # Modification des en-têtes par défaut d'InnerTube
                try:
                    custom_headers = {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
                        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                        'Origin': 'https://www.youtube.com',
                        'Referer': 'https://www.youtube.com/',
                        'Sec-Fetch-Dest': 'document',
                        'Sec-Fetch-Mode': 'navigate',
                        'Sec-Fetch-Site': 'same-origin'
                    }
                    
                    # Remplacer les en-têtes par défaut
                    InnerTube._default_clients['WEB']['headers'] = custom_headers
                    InnerTube._default_clients['ANDROID']['headers'] = custom_headers
                    InnerTube._default_clients['ANDROID_MUSIC']['headers'] = custom_headers
                    InnerTube._default_clients['ANDROID_CREATOR']['headers'] = custom_headers
                    logger.info("Headers pytube configurés avec succès")
                except Exception as header_error:
                    logger.error(f"Erreur lors de la configuration des headers pytube: {str(header_error)}")
                    raise Exception(f"Erreur headers pytube: {str(header_error)}")
                
                # Utiliser une approche progressive avec des tentatives multiples
                
                # Première tentative: mode normal
                try:
                    logger.info(f"Première tentative pytube pour URL: {video_url}")
                    yt_obj = YouTube(video_url)
                    logger.info(f"Informations vidéo récupérées: {yt_obj.title}")
                except Exception as e1:
                    logger.info(f"Première tentative pytube échouée: {str(e1)}")
                    # Deuxième tentative: Attendre et réessayer avec d'autres paramètres
                    time.sleep(2)
                    try:
                        logger.info("Deuxième tentative pytube avec paramètres alternatifs")
                        yt_obj = YouTube(
                            url=video_url,
                            use_oauth=False,
                            allow_oauth_cache=True
                        )
                        logger.info(f"Informations vidéo récupérées (2ème tentative): {yt_obj.title}")
                    except Exception as e2:
                        # En cas d'échec, lever l'exception
                        logger.error(f"Toutes les tentatives pytube ont échoué: {str(e1)} | {str(e2)}")
                        raise Exception(f"Tentatives pytube échouées: {str(e1)} | {str(e2)}")
                
                # Récupérer le flux audio
                logger.info("Recherche du flux audio via pytube")
                audio_stream = yt_obj.streams.filter(only_audio=True).first()
                if not audio_stream:
                    logger.error("Aucun flux audio trouvé")
                    raise Exception("Aucun flux audio trouvé avec pytube")
                
                logger.info(f"Flux audio trouvé, téléchargement en cours vers {temp_dir}")
                file_path = audio_stream.download(output_path=temp_dir, filename=f"{yt_obj.video_id}.mp4")
                logger.info(f"Fichier audio téléchargé via pytube: {file_path}")
            except Exception as pe:
                pytube_error = str(pe)
                logger.error(f"Erreur lors du téléchargement de l'audio via pytube: {pytube_error}")
                
                # Essayer une troisième méthode avec requests directement
                logger.info("============== TENTATIVE AVEC REQUESTS ==============")
                try:
                    logger.info("Tentative de détection du format audio direct")
                    try:
                        import requests
                        from bs4 import BeautifulSoup
                        logger.info("Modules requests et bs4 importés avec succès")
                    except ImportError as import_error:
                        logger.error(f"Erreur lors de l'import de requests/bs4: {str(import_error)}")
                        raise Exception(f"Erreur d'import requests: {str(import_error)}")
                    
                    headers = {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
                        'Accept-Language': 'en-US,en;q=0.9',
                    }
                    
                    # Obtenir la page YouTube
                    video_id = extract_youtube_id(video_url)
                    logger.info(f"Tentative d'accès direct à https://www.youtube.com/watch?v={video_id}")
                    response = requests.get(f"https://www.youtube.com/watch?v={video_id}", headers=headers)
                    
                    logger.info(f"Réponse HTTP: {response.status_code}")
                    if response.status_code == 200:
                        html_content = response.text
                        soup = BeautifulSoup(html_content, 'html.parser')
                        
                        # Récupérer le titre pour le logging
                        title = soup.find('title').text if soup.find('title') else "Titre inconnu"
                        logger.info(f"Page YouTube récupérée: {title}")
                        
                        # Vérifier si nous sommes face à une page de vérification anti-bot
                        if "confirm you're not a bot" in html_content or "robot check" in html_content.lower():
                            logger.error("Page de vérification anti-bot détectée")
                            raise Exception("Page de vérification anti-bot détectée")
                            
                        # Si nous arrivons ici, c'est que nous avons échoué avec toutes les méthodes
                        logger.error("Impossible d'extraire le lien audio/vidéo direct")
                        raise Exception("Impossible d'extraire le lien audio/vidéo direct")
                    else:
                        logger.error(f"Échec d'accès à la page YouTube: HTTP {response.status_code}")
                        raise Exception(f"Impossible d'accéder à la page YouTube: HTTP {response.status_code}")
                        
                except Exception as req_error:
                    logger.error(f"Erreur avec la méthode requests directe: {str(req_error)}")
                    
                    # Message d'erreur détaillé final avec toutes les tentatives
                    logger.error("============== ÉCHEC DE TOUTES LES MÉTHODES ==============")
                    
                    # Essayons une dernière tentative avec youtube-dl
                    logger.info("============== TENTATIVE AVEC YOUTUBE-DL ==============")
                    try:
                        import youtube_dl
                        logger.info("Module youtube_dl importé avec succès")
                        
                        # Configuration différente de yt-dlp
                        ytdl_opts = {
                            'format': 'bestaudio/best',
                            'outtmpl': os.path.join(temp_dir, '%(id)s.%(ext)s'),
                            'quiet': False,
                            'no_warnings': False,
                            'nocheckcertificate': True,
                            'ignoreerrors': True,
                            'postprocessors': [{
                                'key': 'FFmpegExtractAudio',
                                'preferredcodec': 'mp3',
                                'preferredquality': '192',
                            }],
                            'prefer_insecure': True,
                            'cachedir': False,
                            'prefer_ffmpeg': True
                        }
                        
                        logger.info(f"Téléchargement avec youtube-dl pour {video_url}")
                        with youtube_dl.YoutubeDL(ytdl_opts) as ydl:
                            info = ydl.extract_info(video_url, download=True)
                            if not info:
                                raise Exception("Impossible d'extraire les informations de la vidéo")
                                
                            # Déterminer le chemin du fichier téléchargé
                            if 'id' in info and 'ext' in info:
                                file_path = os.path.join(temp_dir, f"{info['id']}.mp3")
                            else:
                                # Fallback si l'ID ou l'extension n'est pas disponible
                                file_path = os.path.join(temp_dir, f"audio_{int(time.time())}.mp3")
                                
                            logger.info(f"Fichier audio téléchargé via youtube-dl: {file_path}")
                            
                            if not os.path.exists(file_path):
                                raise Exception("Le fichier n'a pas été téléchargé correctement")
                                
                            # Continuer le processus avec le fichier téléchargé
                            logger.info("Téléchargement youtube-dl réussi, poursuite du traitement")
                            
                    except Exception as ydl_error:
                        ydl_error_msg = str(ydl_error)
                        logger.error(f"Échec de téléchargement avec youtube-dl: {ydl_error_msg}")
                        
                        detailed_error = {
                            "error": "YouTube bloque le téléchargement automatisé de cette vidéo",
                            "details": "Toutes les méthodes de contournement ont échoué (yt-dlp, pytube, requests, youtube-dl).",
                            "solutions": [
                                "Utilisez une autre source de contenu comme un site web d'article ou une documentation",
                                "Essayez de copier-coller manuellement la transcription depuis YouTube (si disponible)",
                                "Utilisez une vidéo hébergée sur une autre plateforme comme Vimeo ou un serveur de fichiers",
                                "Hébergez votre vidéo sur un service de stockage et fournissez un lien direct"
                            ],
                            "transcript_error": transcript_error,
                            "cookie_error": cookie_error,
                            "download_error": download_error + " | pytube: " + pytube_error + " | requests: " + str(req_error) + " | youtube-dl: " + ydl_error_msg
                        }
                        raise HTTPException(status_code=403, detail=detailed_error)
        else:
            detailed_error = {
                "error": "Erreur lors du téléchargement de l'audio",
                "details": error_msg,
                "transcript_error": transcript_error,
                "cookie_error": cookie_error,
                "download_error": download_error
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