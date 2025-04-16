from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse, NotificationUpdate

router = APIRouter()

@router.get("/notifications", response_model=List[NotificationResponse])
def get_user_notifications(
    skip: int = 0,
    limit: int = 20, # Limiter le nombre de notifications retournées par défaut
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Récupère les notifications de l'utilisateur actuel."""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    return notifications

@router.put("/notifications/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marque une notification spécifique comme lue."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification non trouvée")
        
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification

@router.put("/notifications/read-all", status_code=status.HTTP_204_NO_CONTENT)
def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marque toutes les notifications de l'utilisateur comme lues."""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({Notification.is_read: True}, synchronize_session=False)
    db.commit()
    return None

# --- Fonctions utilitaires pour créer des notifications (à appeler depuis les tâches Celery) --- 
# Ceci n'est pas un endpoint, mais une fonction helper
def create_notification(
    db: Session, 
    user_id: int, 
    message: str, 
    type: Optional[str] = None, 
    related_id: Optional[int] = None,
    related_type: Optional[str] = None
):
    """Crée une notification pour un utilisateur."""
    try:
        notification = Notification(
            user_id=user_id,
            message=message,
            type=type,
            related_id=related_id,
            related_type=related_type
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        # logger.info(f"Notification créée pour user {user_id}: {message}")
        return notification
    except Exception as e:
        # logger.error(f"Erreur création notification pour user {user_id}: {e}")
        db.rollback()
        return None 