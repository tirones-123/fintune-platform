import os
import shutil
from fastapi import UploadFile
from loguru import logger
import uuid
from typing import Optional

from app.core.config import settings

class StorageService:
    """Service for handling file storage.""" 
    
    def __init__(self, upload_dir: str = settings.UPLOAD_DIR):
        """
        Initialize the storage service.
        
        Args:
            upload_dir: The directory where files will be stored.
        """
        self.upload_dir = upload_dir
        os.makedirs(upload_dir, exist_ok=True)
    
    async def save_file(self, file: UploadFile, project_id: int) -> str:
        """
        Save a file to storage.
        
        Args:
            file: The file to save.
            project_id: The ID of the project the file belongs to.
        
        Returns:
            The path where the file was saved.
        """
        # Create project directory if it doesn't exist
        project_dir = os.path.join(self.upload_dir, str(project_id))
        os.makedirs(project_dir, exist_ok=True)
        
        # Generate a unique filename
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(project_dir, unique_filename)
        
        # Save the file
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            logger.info(f"File saved to {file_path}")
            return file_path
        
        except Exception as e:
            logger.error(f"Error saving file: {str(e)}")
            raise e
        
        finally:
            file.file.close()
    
    def delete_file(self, file_path: str) -> bool:
        """
        Delete a file from storage.
        
        Args:
            file_path: The path of the file to delete.
        
        Returns:
            True if the file was deleted, False otherwise.
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"File deleted: {file_path}")
                return True
            else:
                logger.warning(f"File not found: {file_path}")
                return False
        
        except Exception as e:
            logger.error(f"Error deleting file: {str(e)}")
            return False
    
    def get_file_size(self, file_path: str) -> Optional[int]:
        """
        Get the size of a file in bytes.
        
        Args:
            file_path: The path of the file.
        
        Returns:
            The size of the file in bytes, or None if the file doesn't exist.
        """
        try:
            if os.path.exists(file_path):
                return os.path.getsize(file_path)
            else:
                logger.warning(f"File not found: {file_path}")
                return None
        
        except Exception as e:
            logger.error(f"Error getting file size: {str(e)}")
            return None
    
    def get_file_content(self, file_path: str) -> Optional[str]:
        """
        Read and return the content of a file.
        
        Args:
            file_path: The path of the file.
        
        Returns:
            The content of the file as a string, or None if there was an error.
        """
        try:
            if not os.path.exists(file_path):
                logger.warning(f"File not found: {file_path}")
                return None
                
            # Pour les fichiers texte, utiliser la méthode standard
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
                
        except Exception as e:
            logger.error(f"Error reading file {file_path}: {str(e)}")
            return None

# Create a singleton instance
storage_service = StorageService() 