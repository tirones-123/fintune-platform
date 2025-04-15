from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.core.security import get_current_user, verify_password, get_password_hash
from app.db.session import get_db
from app.models.user import User
from app.models.api_key import ApiKey
from app.models.payment import CharacterTransaction, Payment
from app.models.project import Project
from app.models.content import Content
from app.models.dataset import Dataset, DatasetContent, DatasetPair
from app.models.fine_tuning import FineTuning
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.api_key import ApiKeyResponse, ApiKeyCreate
from app.schemas.subscription import SubscriptionResponse

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current user information.
    """
    return current_user

@router.put("/me", response_model=UserResponse)
def update_user(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user information.
    """
    # Update user fields
    for field, value in user_in.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.get("/me/subscription", response_model=SubscriptionResponse)
def get_user_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user subscription.
    """
    subscription = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    return subscription

@router.get("/me/api-keys", response_model=List[ApiKeyResponse])
def get_user_api_keys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user API keys.
    """
    api_keys = db.query(ApiKey).filter(ApiKey.user_id == current_user.id).all()
    return api_keys

@router.post("/me/api-keys", response_model=ApiKeyResponse, status_code=status.HTTP_201_CREATED)
def add_api_key(
    api_key_in: ApiKeyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a new API key for the current user.
    """
    # Check if API key for this provider already exists
    existing_key = db.query(ApiKey).filter(
        ApiKey.user_id == current_user.id,
        ApiKey.provider == api_key_in.provider
    ).first()
    
    if existing_key:
        # Update existing key
        existing_key.key = api_key_in.key
        db.commit()
        db.refresh(existing_key)
        return existing_key
    
    # Create new API key
    db_api_key = ApiKey(
        user_id=current_user.id,
        provider=api_key_in.provider,
        key=api_key_in.key
    )
    
    db.add(db_api_key)
    db.commit()
    db.refresh(db_api_key)
    
    return db_api_key

@router.delete("/me/api-keys/{provider}", status_code=status.HTTP_204_NO_CONTENT)
def delete_api_key(
    provider: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an API key for the current user.
    """
    api_key = db.query(ApiKey).filter(
        ApiKey.user_id == current_user.id,
        ApiKey.provider == provider
    ).first()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"API key for provider {provider} not found"
        )
    
    db.delete(api_key)
    db.commit()
    
    return None

# --- Schéma pour le changement de mot de passe ---
class PasswordChange(BaseModel):
    current_password: str
    new_password: str

@router.put("/me/password", response_model=UserResponse)
def change_password(
    passwords: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change current user password.
    """
    # Vérifier le mot de passe actuel
    if not verify_password(passwords.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mot de passe actuel incorrect"
        )
    
    # Mettre à jour avec le nouveau mot de passe hashé
    current_user.hashed_password = get_password_hash(passwords.new_password)
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete the current user and all associated data.
    THIS IS IRREVERSIBLE.
    """
    user_id = current_user.id
    logger.warning(f"Initiating deletion for user {user_id}")
    
    try:
        # Delete in order to respect foreign key constraints
        
        # 1. Fine-tunings (belong to datasets)
        dataset_ids = [d.id for d in db.query(Dataset.id).join(Project).filter(Project.user_id == user_id).all()]
        if dataset_ids:
            db.query(FineTuning).filter(FineTuning.dataset_id.in_(dataset_ids)).delete(synchronize_session=False)
            logger.info(f"Deleted fine-tunings for user {user_id}")
            
        # 2. Dataset Pairs (belong to datasets)
        if dataset_ids:
            db.query(DatasetPair).filter(DatasetPair.dataset_id.in_(dataset_ids)).delete(synchronize_session=False)
            logger.info(f"Deleted dataset pairs for user {user_id}")

        # 3. Dataset Content links (belong to datasets)
        if dataset_ids:
            db.query(DatasetContent).filter(DatasetContent.dataset_id.in_(dataset_ids)).delete(synchronize_session=False)
            logger.info(f"Deleted dataset content links for user {user_id}")

        # 4. Datasets (belong to projects)
        project_ids = [p.id for p in db.query(Project.id).filter(Project.user_id == user_id).all()]
        if project_ids:
            db.query(Dataset).filter(Dataset.project_id.in_(project_ids)).delete(synchronize_session=False)
            logger.info(f"Deleted datasets for user {user_id}")
            
        # 5. Contents (belong to projects)
        # TODO: Add logic to delete associated files from storage if necessary
        if project_ids:
            db.query(Content).filter(Content.project_id.in_(project_ids)).delete(synchronize_session=False)
            logger.info(f"Deleted contents for user {user_id}")
        
        # 6. Projects (belong to user)
        db.query(Project).filter(Project.user_id == user_id).delete(synchronize_session=False)
        logger.info(f"Deleted projects for user {user_id}")
        
        # 7. API Keys (belong to user)
        db.query(ApiKey).filter(ApiKey.user_id == user_id).delete(synchronize_session=False)
        logger.info(f"Deleted API keys for user {user_id}")
        
        # 8. Character Transactions (belong to user)
        db.query(CharacterTransaction).filter(CharacterTransaction.user_id == user_id).delete(synchronize_session=False)
        logger.info(f"Deleted character transactions for user {user_id}")
        
        # 9. Payments (belong to user)
        db.query(Payment).filter(Payment.user_id == user_id).delete(synchronize_session=False)
        logger.info(f"Deleted payments for user {user_id}")
        
        # 10. Finally, delete the user
        db.delete(current_user)
        db.commit()
        logger.info(f"Deleted user {user_id} successfully.")
        
        return None # 204 No Content
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting user {user_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression du compte: {e}"
        ) 