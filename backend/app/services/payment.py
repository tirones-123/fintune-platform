import stripe
from loguru import logger
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

class PaymentService:
    """Service for handling payments with Stripe."""
    
    @staticmethod
    def handle_webhook_event(payload: bytes, signature: str) -> Dict[str, Any]:
        """
        Handle a Stripe webhook event.
        
        Args:
            payload: The webhook payload.
            signature: The webhook signature.
        
        Returns:
            The webhook event.
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, settings.STRIPE_WEBHOOK_SECRET
            )
            
            logger.info(f"Received Stripe webhook event: {event.type}")
            return event
        
        except Exception as e:
            logger.error(f"Error handling Stripe webhook event: {str(e)}")
            raise e

# Create a singleton instance
payment_service = PaymentService() 