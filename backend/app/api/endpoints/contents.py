from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import os
import shutil
from pathlib import Path
import logging
from fastapi.responses import FileResponse

from app.core.security import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.models.project import Project
from app.models.content import Content
from app.schemas.content import ContentCreate, ContentResponse, ContentUpdate, URLContent
from app.tasks.content_processing import process_content

router = APIRouter()

logger = logging.getLogger(__name__)

@router.get("", response_model=List[ContentResponse])
def get_contents(
    project_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all contents for the current user, optionally filtered by project.
    """
    query = db.query(Content).join(Project).filter(Project.user_id == current_user.id)
    
    if project_id:
        query = query.filter(Content.project_id == project_id)
    
    contents = query.all()
    return contents

@router.post("", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
def create_content(
    content_in: ContentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new content entry (for URL-based content).
    """
    # Verify project belongs to user
    project = db.query(Project).filter(
        Project.id == content_in.project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not owned by user"
        )
    
    # Create content
    db_content = Content(
        name=content_in.name,
        description=content_in.description,
        type=content_in.type,
        url=content_in.url,
        status="processing",
        project_id=content_in.project_id
    )
    
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    
    # TODO: Trigger async processing task
    # celery_app.send_task("app.tasks.content_processing.process_content", args=[db_content.id])
    
    return db_content

@router.post("/upload", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    project_id: int = Form(...),
    name: str = Form(...),
    description: Optional[str] = Form(None),
    file_type: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a file and create a new content entry.
    """
    # Verify project belongs to user
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not owned by user"
        )
    
    # Check file size
    file_size = 0
    for chunk in file.file:
        file_size += len(chunk)
        if file_size > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB"
            )
    
    # Reset file position
    await file.seek(0)
    
    # Create upload directory if it doesn't exist
    upload_dir = Path(settings.UPLOAD_DIR) / str(current_user.id) / str(project_id)
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Save file
    file_path = upload_dir / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create content
    db_content = Content(
        name=name,
        description=description,
        type=file_type,
        file_path=str(file_path),
        status="processing",
        size=file_size,
        project_id=project_id,
        content_metadata={"original_name": file.filename}  # Initialiser les métadonnées
    )
    
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    
    # Déclencher la tâche de traitement de contenu
    process_content.delay(db_content.id)
    
    return db_content

@router.post("/url", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
def add_url_content(
    content_in: URLContent,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a URL-based content (YouTube, webpage, etc.).
    For 'website' type, the description should contain the scraped text.
    """
    # Verify project belongs to user
    project = db.query(Project).filter(
        Project.id == content_in.project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not owned by user"
        )
    
    # Create content
    db_content = Content(
        name=content_in.name,
        description=content_in.description if content_in.type != 'website' else None, # Clear description for website type if text is in content_text
        type=content_in.type,
        url=content_in.url,
        status="processing", # Default status
        project_id=content_in.project_id,
        content_metadata={"original_url": content_in.url}
    )
    
    # Special handling for website type: text is already scraped by frontend
    if content_in.type == 'website':
        db_content.content_text = content_in.description # Store scraped text here
        db_content.status = "completed" # Mark as completed immediately
        # Calculate character count
        character_count = len(content_in.description or "")
        if not db_content.content_metadata:
             db_content.content_metadata = {}
        db_content.content_metadata["character_count"] = character_count
        db_content.content_metadata["is_exact_count"] = True
    
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    
    # Trigger processing only if not already completed (i.e., not website type)
    if db_content.status != "completed":
        process_content.delay(db_content.id)
    
    return db_content

@router.get("/{content_id}", response_model=ContentResponse)
def get_content(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific content by ID.
    """
    content = db.query(Content).join(Project).filter(
        Content.id == content_id,
        Project.user_id == current_user.id
    ).first()
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Rafraîchir l'objet depuis la base de données pour obtenir l'état le plus récent
    db.refresh(content)
    
    # --- AJOUT LOG DEBUG : Vérifier les métadonnées avant retour API ---
    logger.info(f"API GET - Content {content_id} metadata avant retour: {content.content_metadata}")
    # --- FIN AJOUT LOG DEBUG ---
    
    return content

@router.put("/{content_id}", response_model=ContentResponse)
def update_content(
    content_id: int,
    content_in: ContentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a specific content.
    """
    content = db.query(Content).join(Project).filter(
        Content.id == content_id,
        Project.user_id == current_user.id
    ).first()
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Update content fields
    for field, value in content_in.dict(exclude_unset=True).items():
        setattr(content, field, value)
    
    db.commit()
    db.refresh(content)
    
    return content

@router.put("/{content_id}/metadata", response_model=ContentResponse)
def update_content_metadata(
    content_id: int,
    metadata: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a content's metadata, particularly the character count
    """
    content = db.query(Content).join(Project).filter(
        Content.id == content_id,
        Project.user_id == current_user.id
    ).first()
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Si le contenu n'a pas encore de métadonnées, initialiser un dictionnaire vide
    if not content.content_metadata:
        content.content_metadata = {}
    
    # Mettre à jour les métadonnées existantes avec les nouvelles
    content.content_metadata.update(metadata)
    
    db.commit()
    db.refresh(content)
    
    return content

@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_content(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a specific content.
    """
    content = db.query(Content).join(Project).filter(
        Content.id == content_id,
        Project.user_id == current_user.id
    ).first()
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Delete file if exists
    if content.file_path and os.path.exists(content.file_path):
        os.remove(content.file_path)
    
    db.delete(content)
    db.commit()
    
    return None

@router.get("/{content_id}/download")
async def download_content_file(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Downloads the file associated with a specific content ID.
    """
    content = db.query(Content).join(Project).filter(
        Content.id == content_id,
        Project.user_id == current_user.id
    ).first()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found or not authorized."
        )

    if not content.file_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This content does not have an associated file (e.g., URL-based content)."
        )

    file_path = Path(content.file_path)
    if not file_path.is_file():
        logger.error(f"File not found for content {content_id} at path: {file_path}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File associated with content {content_id} not found on server."
        )

    # Utiliser le nom original si disponible, sinon le nom de fichier sur le disque
    original_name = content.content_metadata.get("original_name") if content.content_metadata else None
    download_filename = original_name or file_path.name

    return FileResponse(path=file_path, filename=download_filename, media_type='application/octet-stream') 