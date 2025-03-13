import os
from typing import Optional, Dict, Any
from loguru import logger
import PyPDF2
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
import re

from app.services.storage import storage_service


class ContentProcessor:
    """Service for processing different types of content and extracting text."""
    
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
            if content_type == "text":
                return self._extract_text_from_text_file(file_path)
            elif content_type == "pdf":
                return self._extract_text_from_pdf(file_path)
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