from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from celery import current_app as celery_app

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.project import Project
from app.models.dataset import Dataset, DatasetContent, DatasetPair
from app.models.content import Content
from app.models.fine_tuning import FineTuning
from app.schemas.dataset import (
    DatasetCreate, DatasetResponse, DatasetUpdate, 
    DatasetPairCreate, DatasetPairResponse, DatasetWithPairs,
    BulkPairUpload
)
from app.schemas.fine_tuning import FineTuningResponse

router = APIRouter()

@router.get("", response_model=List[DatasetResponse])
def get_datasets(
    project_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all datasets for the current user, optionally filtered by project.
    """
    query = db.query(Dataset).join(Project).filter(Project.user_id == current_user.id)
    
    if project_id:
        query = query.filter(Dataset.project_id == project_id)
    
    datasets = query.all()
    return datasets

@router.post("", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
def create_dataset(
    dataset_in: DatasetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new dataset.
    """
    # Verify project belongs to user
    project = db.query(Project).filter(
        Project.id == dataset_in.project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not owned by user"
        )
    
    # Verify contents belong to the project
    for content_id in dataset_in.content_ids:
        content = db.query(Content).filter(
            Content.id == content_id,
            Content.project_id == dataset_in.project_id
        ).first()
        
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Content with ID {content_id} not found or not part of the project"
            )
    
    # Create dataset
    db_dataset = Dataset(
        name=dataset_in.name,
        description=dataset_in.description,
        model=dataset_in.model,
        status="processing",
        project_id=dataset_in.project_id
    )
    
    db.add(db_dataset)
    db.commit()
    db.refresh(db_dataset)
    
    # Add contents to dataset
    for content_id in dataset_in.content_ids:
        db_dataset_content = DatasetContent(
            dataset_id=db_dataset.id,
            content_id=content_id
        )
        db.add(db_dataset_content)
    
    db.commit()
    
    # Trigger async processing task
    try:
        from loguru import logger
        logger.info(f"Envoi de la tâche pour le dataset {db_dataset.id}")
        # Spécifier explicitement la queue
        celery_app.send_task(
            "generate_dataset", 
            args=[db_dataset.id], 
            queue='dataset_generation'
        )
        logger.info(f"Tâche envoyée avec succès pour le dataset {db_dataset.id}")
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi de la tâche Celery: {str(e)}")
        # Le dataset est créé de toute façon, mais marqué comme en attente
        db_dataset.status = "pending"
        db.commit()
    
    return db_dataset

@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific dataset by ID.
    """
    dataset = db.query(Dataset).join(Project).filter(
        Dataset.id == dataset_id,
        Project.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    return dataset

@router.get("/{dataset_id}/pairs", response_model=DatasetWithPairs)
def get_dataset_with_pairs(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific dataset with its pairs.
    """
    dataset = db.query(Dataset).join(Project).filter(
        Dataset.id == dataset_id,
        Project.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    return dataset

@router.put("/{dataset_id}", response_model=DatasetResponse)
def update_dataset(
    dataset_id: int,
    dataset_in: DatasetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a specific dataset.
    """
    dataset = db.query(Dataset).join(Project).filter(
        Dataset.id == dataset_id,
        Project.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Update dataset fields
    for field, value in dataset_in.dict(exclude_unset=True).items():
        setattr(dataset, field, value)
    
    db.commit()
    db.refresh(dataset)
    
    return dataset

@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dataset(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a specific dataset.
    """
    dataset = db.query(Dataset).join(Project).filter(
        Dataset.id == dataset_id,
        Project.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    db.delete(dataset)
    db.commit()
    
    return None

@router.post("/{dataset_id}/pairs", response_model=DatasetPairResponse, status_code=status.HTTP_201_CREATED)
def add_dataset_pair(
    dataset_id: int,
    pair_in: DatasetPairCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a pair to a dataset.
    """
    # Verify dataset belongs to user
    dataset = db.query(Dataset).join(Project).filter(
        Dataset.id == dataset_id,
        Project.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Create pair
    db_pair = DatasetPair(
        question=pair_in.question,
        answer=pair_in.answer,
        pair_metadata=pair_in.pair_metadata,
        dataset_id=dataset_id
    )
    
    db.add(db_pair)
    db.commit()
    db.refresh(db_pair)
    
    # Update pairs count
    pairs_count = db.query(DatasetPair).filter(DatasetPair.dataset_id == dataset_id).count()
    dataset.pairs_count = pairs_count
    db.commit()
    
    return db_pair

@router.post("/{dataset_id}/pairs/bulk", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
def add_bulk_pairs(
    dataset_id: int,
    pairs_in: BulkPairUpload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add multiple pairs to a dataset in bulk.
    """
    # Verify dataset belongs to user
    dataset = db.query(Dataset).join(Project).filter(
        Dataset.id == dataset_id,
        Project.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Add pairs
    for pair in pairs_in.pairs:
        db_pair = DatasetPair(
            question=pair.question,
            answer=pair.answer,
            pair_metadata=pair.pair_metadata,
            dataset_id=dataset_id
        )
        db.add(db_pair)
    
    db.commit()
    
    # Update pairs count
    pairs_count = db.query(DatasetPair).filter(DatasetPair.dataset_id == dataset_id).count()
    dataset.pairs_count = pairs_count
    db.commit()
    db.refresh(dataset)
    
    return dataset

@router.delete("/{dataset_id}/pairs/{pair_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dataset_pair(
    dataset_id: int,
    pair_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a specific pair from a dataset.
    """
    # Verify dataset belongs to user
    dataset = db.query(Dataset).join(Project).filter(
        Dataset.id == dataset_id,
        Project.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Get pair
    pair = db.query(DatasetPair).filter(
        DatasetPair.id == pair_id,
        DatasetPair.dataset_id == dataset_id
    ).first()
    
    if not pair:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pair not found"
        )
    
    db.delete(pair)
    db.commit()
    
    # Update pairs count
    pairs_count = db.query(DatasetPair).filter(DatasetPair.dataset_id == dataset_id).count()
    dataset.pairs_count = pairs_count
    db.commit()
    
    return None

@router.get("/{dataset_id}/export", response_model=str)
def export_dataset(
    dataset_id: int,
    format: str = "jsonl",
    provider: str = "openai",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export a dataset in the specified format for fine-tuning.
    Currently supports JSONL format for OpenAI and Anthropic.
    """
    # Verify dataset belongs to user
    dataset = db.query(Dataset).join(Project).filter(
        Dataset.id == dataset_id,
        Project.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Get all pairs
    pairs = db.query(DatasetPair).filter(DatasetPair.dataset_id == dataset_id).all()
    
    if not pairs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset has no pairs"
        )
    
    # Format according to provider
    if provider.lower() == "openai":
        from fastapi.responses import StreamingResponse
        import json
        import io
        
        # Create a StringIO object to store the jsonl data
        jsonl_data = io.StringIO()
        
        # Format each pair according to OpenAI's fine-tuning format
        for pair in pairs:
            jsonl_obj = {
                "messages": [
                    {"role": "system", "content": "Vous êtes un assistant qui génère du contenu dans le style de l'auteur"},
                    {"role": "user", "content": pair.question},
                    {"role": "assistant", "content": pair.answer}
                ]
            }
            jsonl_data.write(json.dumps(jsonl_obj, ensure_ascii=False) + "\n")
        
        # Reset the pointer to the beginning of the StringIO object
        jsonl_data.seek(0)
        
        # Create a filename
        filename = f"dataset_{dataset_id}_{dataset.name.replace(' ', '_')}.jsonl"
        
        # Return the file as a streaming response
        return StreamingResponse(
            jsonl_data,
            media_type="application/jsonl",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    
    elif provider.lower() == "anthropic":
        # Similar implementation for Anthropic's format
        from fastapi.responses import StreamingResponse
        import json
        import io
        
        jsonl_data = io.StringIO()
        
        for pair in pairs:
            jsonl_obj = {
                "messages": [
                    {"role": "user", "content": pair.question},
                    {"role": "assistant", "content": pair.answer}
                ]
            }
            jsonl_data.write(json.dumps(jsonl_obj, ensure_ascii=False) + "\n")
        
        jsonl_data.seek(0)
        filename = f"dataset_{dataset_id}_{dataset.name.replace(' ', '_')}.jsonl"
        
        return StreamingResponse(
            jsonl_data,
            media_type="application/jsonl",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported provider: {provider}. Currently supported: openai, anthropic"
        )

@router.get("/{dataset_id}/fine-tunings", response_model=List[FineTuningResponse])
def get_dataset_fine_tunings(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all fine-tunings for a specific dataset.
    """
    # Vérifier que le dataset appartient à l'utilisateur
    dataset = db.query(Dataset).join(Project).filter(
        Dataset.id == dataset_id,
        Project.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    fine_tunings = db.query(FineTuning).filter(FineTuning.dataset_id == dataset_id).all()
    return fine_tunings 