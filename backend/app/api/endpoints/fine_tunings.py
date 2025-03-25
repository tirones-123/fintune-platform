from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.celery_app import celery_app

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.project import Project
from app.models.dataset import Dataset
from app.models.fine_tuning import FineTuning
from app.schemas.fine_tuning import (
    FineTuningCreate, FineTuningResponse, FineTuningUpdate, FineTuningCancel
)

router = APIRouter()

@router.get("", response_model=List[FineTuningResponse])
def get_fine_tunings(
    dataset_id: Optional[int] = None,
    project_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all fine-tunings for the current user, optionally filtered by dataset or project.
    """
    query = db.query(FineTuning).join(Dataset).join(Project).filter(Project.user_id == current_user.id)
    
    if dataset_id:
        query = query.filter(FineTuning.dataset_id == dataset_id)
    
    if project_id:
        query = query.filter(Dataset.project_id == project_id)
    
    fine_tunings = query.all()
    return fine_tunings

@router.post("", response_model=FineTuningResponse, status_code=status.HTTP_201_CREATED)
def create_fine_tuning(
    fine_tuning_in: FineTuningCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new fine-tuning job.
    """
    # Verify dataset belongs to user
    dataset = db.query(Dataset).join(Project).filter(
        Dataset.id == fine_tuning_in.dataset_id,
        Project.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found or not owned by user"
        )
    
    # Check if dataset is ready
    if dataset.status != "ready":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dataset is not ready for fine-tuning"
        )
    
    # Create fine-tuning
    db_fine_tuning = FineTuning(
        name=fine_tuning_in.name,
        description=fine_tuning_in.description,
        model=fine_tuning_in.model,
        provider=fine_tuning_in.provider,
        hyperparameters=fine_tuning_in.hyperparameters,
        status="queued",
        dataset_id=fine_tuning_in.dataset_id
    )
    
    db.add(db_fine_tuning)
    db.commit()
    db.refresh(db_fine_tuning)
    
    # TODO: Trigger async processing task
    celery_app.send_task("app.tasks.fine_tuning.start_fine_tuning", args=[db_fine_tuning.id])
    
    return db_fine_tuning

@router.get("/{fine_tuning_id}", response_model=FineTuningResponse)
def get_fine_tuning(
    fine_tuning_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific fine-tuning by ID.
    """
    fine_tuning = db.query(FineTuning).join(Dataset).join(Project).filter(
        FineTuning.id == fine_tuning_id,
        Project.user_id == current_user.id
    ).first()
    
    if not fine_tuning:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fine-tuning not found"
        )
    
    return fine_tuning

@router.put("/{fine_tuning_id}", response_model=FineTuningResponse)
def update_fine_tuning(
    fine_tuning_id: int,
    fine_tuning_in: FineTuningUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a specific fine-tuning.
    """
    fine_tuning = db.query(FineTuning).join(Dataset).join(Project).filter(
        FineTuning.id == fine_tuning_id,
        Project.user_id == current_user.id
    ).first()
    
    if not fine_tuning:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fine-tuning not found"
        )
    
    # Update fine-tuning fields
    for field, value in fine_tuning_in.dict(exclude_unset=True).items():
        setattr(fine_tuning, field, value)
    
    db.commit()
    db.refresh(fine_tuning)
    
    return fine_tuning

@router.delete("/{fine_tuning_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fine_tuning(
    fine_tuning_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a specific fine-tuning.
    """
    fine_tuning = db.query(FineTuning).join(Dataset).join(Project).filter(
        FineTuning.id == fine_tuning_id,
        Project.user_id == current_user.id
    ).first()
    
    if not fine_tuning:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fine-tuning not found"
        )
    
    db.delete(fine_tuning)
    db.commit()
    
    return None

@router.post("/{fine_tuning_id}/cancel", response_model=FineTuningResponse)
def cancel_fine_tuning(
    fine_tuning_id: int,
    cancel_in: FineTuningCancel,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel a fine-tuning job.
    """
    fine_tuning = db.query(FineTuning).join(Dataset).join(Project).filter(
        FineTuning.id == fine_tuning_id,
        Project.user_id == current_user.id
    ).first()
    
    if not fine_tuning:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fine-tuning not found"
        )
    
    # Check if fine-tuning can be cancelled
    if fine_tuning.status not in ["queued", "training"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fine-tuning with status '{fine_tuning.status}' cannot be cancelled"
        )
    
    # Update status
    fine_tuning.status = "cancelled"
    fine_tuning.error_message = cancel_in.reason
    db.commit()
    db.refresh(fine_tuning)
    
    # TODO: Trigger async cancellation task
    # celery_app.send_task("app.tasks.fine_tuning.cancel_fine_tuning", args=[fine_tuning.id])
    
    return fine_tuning 