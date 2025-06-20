from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse, NotificationUpdate

# Import de la tâche Celery
from app.tasks.email_tasks import send_notification_email_task

router = APIRouter()

@router.get("", response_model=List[NotificationResponse])
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

@router.put("/{notification_id}/read", response_model=NotificationResponse)
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

@router.put("/read-all", status_code=status.HTTP_204_NO_CONTENT)
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
        
        # --- AJOUT : Déclencher la tâche d'envoi d'email --- 
        try:
            # Envoyer la tâche Celery. On passe les arguments nécessaires.
            send_notification_email_task.delay(
                user_id=user_id,
                message=message,
                notification_type=type or "info" # Utiliser le type ou 'info' par défaut
            )
            # logger.info(f"Tâche d'envoi d'email mise en file d'attente pour user {user_id}")
        except Exception as task_error:
            # Logguer l'erreur mais ne pas faire échouer la création de notification
            # logger.error(f"Erreur lors de la mise en file d'attente de la tâche email pour user {user_id}: {task_error}")
            pass # L'envoi d'email est secondaire par rapport à la notification in-app
        # --- FIN AJOUT ---
        
        # logger.info(f"Notification créée pour user {user_id}: {message}")
        return notification
    except Exception as e:
        # logger.error(f"Erreur création notification pour user {user_id}: {e}")
        db.rollback()
        return None 