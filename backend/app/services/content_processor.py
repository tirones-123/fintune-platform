import os
import re
import tempfile
import PyPDF2
import logging
from typing import Optional, Dict, Any, Tuple
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from pytube import YouTube

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
        Extract metadata from a YouTube video including duration.
        
        Args:
            video_url: URL of the YouTube video
            
        Returns:
            Dictionary with metadata or empty dict if extraction failed
        """
        try:
            video_id = self._extract_youtube_id(video_url)
            if not video_id:
                logger.error(f"Could not extract YouTube video ID from URL: {video_url}")
                return {}
            
            # Get YouTube video metadata using pytube
            yt = YouTube(video_url)
            
            # Extract the metadata we want
            metadata = {
                "title": yt.title,
                "duration_seconds": yt.length,
                "author": yt.author,
                "publish_date": yt.publish_date.isoformat() if yt.publish_date else None,
                "views": yt.views
            }
            
            logger.info(f"Extracted metadata for YouTube video {video_id}: duration={yt.length}s, title='{yt.title}'")
            return metadata
            
        except Exception as e:
            logger.error(f"Error extracting metadata from YouTube video {video_url}: {str(e)}")
            return {}
    
    def process_youtube_content(self, video_url: str) -> Tuple[Optional[str], Dict[str, Any]]:
        """
        Process a YouTube video by extracting transcript and metadata using RapidAPI.
        """
        # Essayer d'abord avec l'API YouTube standard
        transcript = self.extract_text_from_youtube(video_url)
        metadata = self.get_youtube_metadata(video_url)
        
        # Si l'API YouTube échoue, utiliser RapidAPI
        if transcript is None:
            try:
                video_id = self._extract_youtube_id(video_url)
                if not video_id:
                    logger.error(f"Impossible d'extraire l'ID de la vidéo YouTube: {video_url}")
                    return None, metadata
                
                # Appel à l'API RapidAPI YouTube Transcriptor
                import requests
                
                url = f"https://youtube-transcriptor.p.rapidapi.com/transcript?video_id={video_id}&lang=en"
                
                headers = {
                    "X-RapidAPI-Key": "9144fffaabmsh319ba65e73a3d86p164f35jsn097fa4509ee8",
                    "X-RapidAPI-Host": "youtube-transcriptor.p.rapidapi.com"
                }
                
                logger.info(f"Appel au service RapidAPI YouTube Transcriptor pour la vidéo {video_id}")
                response = requests.get(url, headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Formater la transcription (concaténer tous les segments)
                    if 'transcription' in data[0]:
                        transcript_segments = data[0]['transcription']
                        transcript = " ".join([segment.get('subtitle', '') for segment in transcript_segments])
                        
                        # Enrichir les métadonnées avec les informations de l'API
                        if metadata is None:
                            metadata = {}
                        
                        if 'lengthInSeconds' in data[0]:
                            metadata['duration_seconds'] = int(data[0]['lengthInSeconds'])
                        if 'title' in data[0]:
                            metadata['title'] = data[0]['title']
                        
                        metadata['transcription_source'] = 'rapidapi_youtube_transcriptor'
                        
                        logger.info(f"Transcription réussie via RapidAPI: {len(transcript)} caractères")
                    else:
                        logger.error("Format de réponse RapidAPI inattendu: pas de transcription trouvée")
                else:
                    logger.error(f"Échec de l'appel RapidAPI: {response.status_code} - {response.text}")
                    
            except Exception as e:
                logger.error(f"Erreur lors de l'utilisation du service RapidAPI: {str(e)}")
        
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