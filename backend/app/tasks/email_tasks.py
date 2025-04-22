from celery_app import celery_app
from app.db.session import SessionLocal
from app.models.user import User
from app.services.email_service import send_notification_email
import logging

logger = logging.getLogger(__name__)

@celery_app.task(name="send_notification_email_task", bind=True, max_retries=3)
def send_notification_email_task(self, user_id: int, message: str, notification_type: str = "info"):
    """Celery task to send a notification email to a user."""
    logger.info(f"Task started: Send notification email to user {user_id}. Message: '{message}'")
    db = None # Initialize db to None
    try:
        db = SessionLocal()
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            logger.error(f"User with ID {user_id} not found. Cannot send email.")
            return # No retry if user doesn't exist
            
        if not user.email:
            logger.error(f"User {user_id} does not have an email address. Cannot send email.")
            return # No retry if user has no email

        # Prepare user name (use email prefix if name is not set)
        user_name = user.name if user.name else user.email.split('@')[0]

        # Call the async helper function from email_service
        # Note: Celery tasks are typically synchronous unless specifically designed otherwise.
        # We call our synchronous send_email wrapper for simplicity here.
        # If send_notification_email was truly async, we'd need to manage the event loop.
        success = send_notification_email(
            user_email=user.email,
            user_name=user_name,
            notification_message=message,
            notification_type=notification_type
        )
        
        if not success:
            logger.warning(f"Failed to send email to {user.email}. Retrying...")
            # Retry the task with exponential backoff (default Celery behavior)
            self.retry(countdown=60 * self.request.retries) # Example: retry after 1, 2, 4 minutes
            
        logger.info(f"Email task completed for user {user_id}.")
        return {"status": "success", "user_id": user_id, "email_sent": success}

    except Exception as e:
        logger.error(f"Error in send_notification_email_task for user {user_id}: {e}", exc_info=True)
        # Retry on generic errors as well
        try:
            self.retry(exc=e, countdown=60 * self.request.retries)
        except self.MaxRetriesExceededError:
             logger.error(f"Max retries exceeded for sending email to user {user_id}.")
        return {"status": "error", "user_id": user_id, "error": str(e)}
    finally:
        if db: # Ensure db is closed only if it was successfully opened
            db.close() 