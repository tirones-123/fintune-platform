import stripe
from loguru import logger
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.models.subscription import Subscription

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

class PaymentService:
    """Service for handling payments with Stripe."""
    
    @staticmethod
    def create_customer(user: User, db: Session) -> str:
        """
        Create a Stripe customer for a user.
        
        Args:
            user: The user to create a customer for.
            db: The database session.
        
        Returns:
            The Stripe customer ID.
        """
        try:
            # Check if user already has a Stripe customer ID
            subscription = db.query(Subscription).filter(Subscription.user_id == user.id).first()
            
            if subscription and subscription.stripe_customer_id:
                logger.info(f"User {user.id} already has a Stripe customer ID: {subscription.stripe_customer_id}")
                return subscription.stripe_customer_id
            
            # Create a new Stripe customer
            customer = stripe.Customer.create(
                email=user.email,
                name=user.name,
                metadata={"user_id": user.id}
            )
            
            logger.info(f"Created Stripe customer for user {user.id}: {customer.id}")
            
            # Create or update subscription record
            if subscription:
                subscription.stripe_customer_id = customer.id
            else:
                subscription = Subscription(
                    user_id=user.id,
                    plan="free",
                    status="active",
                    stripe_customer_id=customer.id
                )
                db.add(subscription)
            
            db.commit()
            
            return customer.id
        
        except Exception as e:
            logger.error(f"Error creating Stripe customer: {str(e)}")
            raise e
    
    @staticmethod
    def create_checkout_session(
        customer_id: str,
        price_id: str,
        success_url: str,
        cancel_url: str
    ) -> Dict[str, Any]:
        """
        Create a Stripe checkout session.
        
        Args:
            customer_id: The Stripe customer ID.
            price_id: The Stripe price ID.
            success_url: The URL to redirect to on successful payment.
            cancel_url: The URL to redirect to on cancelled payment.
        
        Returns:
            The checkout session.
        """
        try:
            session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=["card"],
                line_items=[
                    {
                        "price": price_id,
                        "quantity": 1,
                    },
                ],
                mode="subscription",
                success_url=success_url,
                cancel_url=cancel_url,
            )
            
            logger.info(f"Created Stripe checkout session: {session.id}")
            return session
        
        except Exception as e:
            logger.error(f"Error creating Stripe checkout session: {str(e)}")
            raise e
    
    @staticmethod
    def create_customer_portal_session(
        customer_id: str,
        return_url: str
    ) -> Dict[str, Any]:
        """
        Create a Stripe customer portal session.
        
        Args:
            customer_id: The Stripe customer ID.
            return_url: The URL to return to after the portal session.
        
        Returns:
            The customer portal session.
        """
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url,
            )
            
            logger.info(f"Created Stripe customer portal session: {session.id}")
            return session
        
        except Exception as e:
            logger.error(f"Error creating Stripe customer portal session: {str(e)}")
            raise e
    
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
    
    @staticmethod
    def update_subscription_from_event(event: Dict[str, Any], db: Session) -> Optional[Subscription]:
        """
        Update a subscription from a Stripe webhook event.
        
        Args:
            event: The webhook event.
            db: The database session.
        
        Returns:
            The updated subscription, or None if no subscription was found.
        """
        try:
            # Get the subscription from the event
            stripe_subscription = event.data.object
            
            # Find the subscription in the database
            subscription = db.query(Subscription).filter(
                Subscription.stripe_subscription_id == stripe_subscription.id
            ).first()
            
            if not subscription:
                # Try to find by customer ID
                subscription = db.query(Subscription).filter(
                    Subscription.stripe_customer_id == stripe_subscription.customer
                ).first()
            
            if not subscription:
                logger.warning(f"No subscription found for Stripe subscription {stripe_subscription.id}")
                return None
            
            # Update the subscription
            subscription.stripe_subscription_id = stripe_subscription.id
            subscription.status = stripe_subscription.status
            subscription.current_period_end = stripe_subscription.current_period_end
            subscription.cancel_at_period_end = stripe_subscription.cancel_at_period_end
            
            # Update the plan based on the price ID
            price_id = stripe_subscription.items.data[0].price.id
            if price_id == settings.STRIPE_PRICE_STARTER:
                subscription.plan = "starter"
            elif price_id == settings.STRIPE_PRICE_PRO:
                subscription.plan = "pro"
            elif price_id == settings.STRIPE_PRICE_ENTERPRISE:
                subscription.plan = "enterprise"
            
            db.commit()
            
            logger.info(f"Updated subscription {subscription.id} from Stripe webhook event")
            return subscription
        
        except Exception as e:
            logger.error(f"Error updating subscription from Stripe webhook event: {str(e)}")
            db.rollback()
            raise e

# Create a singleton instance
payment_service = PaymentService() 