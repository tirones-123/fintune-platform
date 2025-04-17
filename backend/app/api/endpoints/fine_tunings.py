from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from celery_app import celery_app
from pydantic import BaseModel
from app.services.ai_providers import get_ai_provider
from app.models.api_key import ApiKey

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

# --- Schémas pour l'endpoint de test ---
class TestFineTuningRequest(BaseModel):
    prompt: str

class TestFineTuningResponse(BaseModel):
    response: str

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
    celery_app.send_task("start_fine_tuning", args=[db_fine_tuning.id])
    
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

# --- Nouvel Endpoint pour tester le modèle --- 
@router.post("/{fine_tuning_id}/test", response_model=TestFineTuningResponse)
async def test_fine_tuning(
    fine_tuning_id: int,
    request_data: TestFineTuningRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Test a completed fine-tuned model with a prompt.
    """
    # 1. Récupérer le fine-tuning et vérifier l'appartenance et le statut
    fine_tuning = db.query(FineTuning).join(Dataset).join(Project).filter(
        FineTuning.id == fine_tuning_id,
        Project.user_id == current_user.id
    ).first()
    
    if not fine_tuning:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fine-tuning not found or not authorized."
        )
    
    if fine_tuning.status != "completed":
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fine-tuning is not completed (status: {fine_tuning.status})."
        )
        
    if not fine_tuning.fine_tuned_model:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fine-tuned model ID is missing for this record."
        )

    # 2. Récupérer la clé API de l'utilisateur pour ce provider
    api_key_record = db.query(ApiKey).filter(
        ApiKey.user_id == current_user.id,
        ApiKey.provider == fine_tuning.provider
    ).first()
    
    if not api_key_record:
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"API key for provider '{fine_tuning.provider}' not found."
        )

    # 3. Obtenir le provider et appeler sa méthode get_completion
    try:
        # Obtenir l'instance du provider via la factory
        provider_instance = get_ai_provider(
            provider_name=fine_tuning.provider, 
            api_key=api_key_record.key
        )
        
        # Appeler la méthode sur l'instance obtenue
        completion = await provider_instance.generate_completion(
            # Attention : la méthode s'appelle generate_completion, pas get_completion
            model=fine_tuning.fine_tuned_model, 
            prompt=request_data.prompt,
            # system_prompt=fine_tuning.dataset.system_content # Décommenter si generate_completion l'accepte
        )
        
        if completion is None:
             raise HTTPException(
                 status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                 detail="Failed to get completion from the provider, received None."
             )
             
        return TestFineTuningResponse(response=completion)
        
    except ValueError as ve:
         # Erreurs spécifiques du service (ex: provider non supporté)
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        # Gérer les erreurs potentielles de l'API du fournisseur
        error_detail = f"Error communicating with {fine_tuning.provider} API: {str(e)}"
        # Log l'erreur complète pour le débogage
        # logger.error(error_detail, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=error_detail
        ) 