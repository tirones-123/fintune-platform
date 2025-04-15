import os
import re
import tempfile
import PyPDF2
import logging
from typing import Optional, Dict, Any, Tuple
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound

from app.services.storage import storage_service

logger = logging.getLogger(__name__)

class ContentProcessor:
    """
    Service for processing different types of content.
    """
    
    def extract_text_from_file(self, file_path: str, content_type: str) -> Optional[str]:
        """
        Extract text from a file based on its type.
        
        Args:
            file_path: Path to the file
            content_type: Type of content (pdf, text, youtube)
            
        Returns:
            Extracted text or None if extraction failed
        """
        try:
            if content_type.lower() == 'pdf':
                return self._extract_text_from_pdf(file_path)
            elif content_type.lower() in ['text', 'txt', 'md', 'markdown']:
                return self._extract_text_from_text_file(file_path)
            else:
                logger.warning(f"Unsupported file content type: {content_type}")
                return None
        except Exception as e:
            logger.error(f"Error extracting text from {content_type} file {file_path}: {str(e)}")
            return None
    
    def extract_text_from_youtube(self, video_url: str) -> Optional[str]:
        """
        Extract transcript from a YouTube video.
        
        Args:
            video_url: URL of the YouTube video
            
        Returns:
            Transcript text or None if extraction failed
        """
        try:
            video_id = self._extract_youtube_id(video_url)
            if not video_id:
                logger.error(f"Could not extract YouTube video ID from URL: {video_url}")
                return None
            
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['fr', 'en'])
            transcript_text = ' '.join([item['text'] for item in transcript_list])
            return transcript_text
        except (TranscriptsDisabled, NoTranscriptFound) as e:
            logger.error(f"No transcript available for video {video_url}: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error extracting transcript from YouTube video {video_url}: {str(e)}")
            return None
    
    def get_youtube_metadata(self, video_url: str) -> Dict[str, Any]:
        """
        Récupère les métadonnées de base pour une vidéo YouTube.
        Nous n'utilisons plus pytube, donc cette méthode retourne un dictionnaire minimal.
        """
        try:
            video_id = self._extract_youtube_id(video_url)
            if not video_id:
                logger.error(f"Could not extract YouTube video ID from URL: {video_url}")
                return {}
            
            # Comme nous n'avons plus pytube, retournons un dictionnaire minimal
            metadata = {
                "video_id": video_id,
                "transcription_source": "rapidapi_speech_to_text"  # Par défaut
            }
            
            return metadata
        except Exception as e:
            logger.error(f"Error extracting metadata from YouTube video {video_url}: {str(e)}")
            return {}
    
    def process_youtube_content(self, video_url: str) -> Tuple[Optional[str], Dict[str, Any]]:
        """
        Process a YouTube video by extracting transcript and metadata.
        Utilise le service Speech-to-Text AI de RapidAPI pour obtenir une transcription directe.
        """
        # Essayer d'abord avec l'API YouTube standard
        transcript = self.extract_text_from_youtube(video_url)
        metadata = self.get_youtube_metadata(video_url)
        
        # Si l'API YouTube échoue, utiliser RapidAPI Speech-to-Text
        if transcript is None:
            try:
                # Extraire l'ID pour les logs
                video_id = self._extract_youtube_id(video_url)
                if not video_id:
                    logger.error(f"Impossible d'extraire l'ID de la vidéo YouTube: {video_url}")
                    return None, metadata
                
                logger.info(f"Utilisation du service RapidAPI Speech-to-Text pour la vidéo {video_id}")
                
                import requests
                import json
                
                # Endpoint pour la transcription directe d'URL
                url = "https://speech-to-text-ai.p.rapidapi.com/transcribe"
                
                # Paramètres de la requête
                querystring = {
                    "url": video_url,
                    "lang": "fr",  # Préférer le français, retombera sur l'anglais si nécessaire
                    "task": "transcribe"
                }
                
                # En-têtes RapidAPI
                headers = {
                    "x-rapidapi-key": "9144fffaabmsh319ba65e73a3d86p164f35jsn097fa4509ee8",
                    "x-rapidapi-host": "speech-to-text-ai.p.rapidapi.com",
                    "Content-Type": "application/x-www-form-urlencoded"
                }
                
                # Effectuer la requête POST
                logger.info(f"Envoi de la requête de transcription pour {video_url}")
                response = requests.post(url, headers=headers, params=querystring, data={})
                
                # Journaliser les détails de la réponse
                logger.info(f"Statut de la réponse: {response.status_code}")
                
                if response.status_code == 200:
                    try:
                        data = response.json()
                        
                        # Extraire le texte transcrit
                        if "text" in data and data["text"]:
                            transcript = data["text"]
                            logger.info(f"Transcription réussie via RapidAPI Speech-to-Text: {len(transcript)} caractères")
                            
                            # Mettre à jour les métadonnées
                            if not metadata:
                                metadata = {}
                            
                            metadata["transcription_source"] = "rapidapi_speech_to_text"
                            
                            # Si disponible, extraire la durée totale des chunks
                            if "chunks" in data and data["chunks"]:
                                total_duration = sum(chunk.get("duration", 0) for chunk in data["chunks"])
                                if total_duration > 0:
                                    metadata["duration_seconds"] = total_duration
                        else:
                            logger.warning(f"Pas de transcription dans la réponse: {data}")
                    
                    except Exception as json_err:
                        logger.error(f"Erreur lors du traitement JSON: {str(json_err)}")
                else:
                    logger.error(f"Erreur HTTP {response.status_code}: {response.text}")
            
            except Exception as e:
                import traceback
                logger.error(f"Exception lors de l'appel RapidAPI Speech-to-Text: {str(e)}")
                logger.error(f"Traceback: {traceback.format_exc()}")
        
        # Si toutes les méthodes ont échoué, créer un transcript minimal
        if transcript is None:
            transcript = f"[Aucune transcription disponible pour cette vidéo YouTube]"
            if not metadata:
                metadata = {}
            metadata["transcription_source"] = "fallback_empty"
        
        return transcript, metadata
    
    def _extract_text_from_text_file(self, file_path: str) -> Optional[str]:
        """Extract text from a text file."""
        return storage_service.get_file_content(file_path)
    
    def _extract_text_from_pdf(self, file_path: str) -> Optional[str]:
        """Extract text from a PDF file."""
        try:
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    text += page.extract_text() + "\n"
            return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF {file_path}: {str(e)}")
            return None
    
    def _extract_youtube_id(self, youtube_url: str) -> Optional[str]:
        """Extract YouTube video ID from URL."""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?]+)',
            r'(?:youtube\.com\/embed\/)([^&\n?]+)',
            r'(?:youtube\.com\/v\/)([^&\n?]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, youtube_url)
            if match:
                return match.group(1)
        
        return None


# Create a singleton instance
content_processor = ContentProcessor() 