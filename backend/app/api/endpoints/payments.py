from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
import stripe
from datetime import datetime
import logging

from app.core.security import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.models.subscription import Subscription

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter()

logger = logging.getLogger(__name__)

@router.post("/create-checkout-session/{plan_id}")
async def create_checkout_session(
    plan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a Stripe checkout session for subscription.
    """
    # Map plan_id to Stripe price ID
    price_id = None
    if plan_id == "starter":
        price_id = settings.STRIPE_PRICE_STARTER
    elif plan_id == "pro":
        price_id = settings.STRIPE_PRICE_PRO
    elif plan_id == "enterprise":
        price_id = settings.STRIPE_PRICE_ENTERPRISE
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan ID"
        )
    
    # Check if user already has a subscription
    existing_subscription = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    
    try:
        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            customer_email=current_user.email,
            payment_method_types=["card"],
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1,
                },
            ],
            mode="subscription",
            success_url=f"{settings.BACKEND_CORS_ORIGINS[0]}/dashboard?success=true",
            cancel_url=f"{settings.BACKEND_CORS_ORIGINS[0]}/pricing?canceled=true",
            metadata={
                "user_id": str(current_user.id),
                "plan_id": plan_id,
                "is_upgrade": "true" if existing_subscription else "false"
            }
        )
        
        return {"checkout_url": checkout_session.url}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/webhook")
async def stripe_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Handle Stripe webhook events.
    """
    payload = await request.body()
    signature = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, signature, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        logger.error(f"Webhook verification failed: {e}")
        raise HTTPException(status_code=400, detail="Webhook Error")
    
    logger.info(f"Received event type: {event['type']}")

    if event["type"] == "checkout.session.completed":
        logger.info("Handling checkout.session.completed event")
        session = event["data"]["object"]
        logger.info(f"Session object: {session}")

        # Loggez les métadonnées pour vérifier la présence des champs attendus
        metadata = session.get("metadata")
        logger.info(f"Metadata: {metadata}")

        # Loggez l'ID d'abonnement envoyé dans la session
        subscription_id = session.get("subscription")
        logger.info(f"Subscription ID from session: {subscription_id}")

        try:
            # Get user ID from metadata
            user_id = int(metadata.get("user_id", 0))
            if not user_id:
                raise ValueError("user_id missing in metadata")
            plan_id = metadata.get("plan_id")
            is_upgrade = metadata.get("is_upgrade") == "true"
            
            # Get subscription details
            subscription_data = stripe.Subscription.retrieve(subscription_id)
            
            # Create or update subscription in database
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return {"status": "error", "message": "User not found"}
            
            # Determine plan details
            plan_name = plan_id.capitalize()
            if plan_id == "starter":
                max_projects = 3
                max_fine_tunings = 1
            elif plan_id == "pro":
                max_projects = 10
                max_fine_tunings = 5
            elif plan_id == "enterprise":
                max_projects = 100
                max_fine_tunings = 20
            else:
                max_projects = 1
                max_fine_tunings = 0
            
            # Create or update subscription
            existing_subscription = db.query(Subscription).filter(Subscription.user_id == user_id).first()
            
            if existing_subscription:
                # Update existing subscription
                existing_subscription.stripe_subscription_id = subscription_id
                existing_subscription.plan = plan_name
                existing_subscription.status = subscription_data["status"]
                existing_subscription.current_period_end = datetime.fromtimestamp(subscription_data["current_period_end"])
                existing_subscription.max_projects = max_projects
                existing_subscription.max_fine_tunings = max_fine_tunings
            else:
                # Create new subscription
                new_subscription = Subscription(
                    user_id=user_id,
                    stripe_subscription_id=subscription_id,
                    plan=plan_name,
                    status=subscription_data["status"],
                    current_period_end=datetime.fromtimestamp(subscription_data["current_period_end"]),
                    max_projects=max_projects,
                    max_fine_tunings=max_fine_tunings
                )
                db.add(new_subscription)
            
            db.commit()
            
            # TODO: Send confirmation email
            # background_tasks.add_task(send_subscription_email, user.email, plan_name, is_upgrade)
        except Exception as e:
            logger.error(f"Error processing checkout.session.completed event: {e}")
            raise HTTPException(status_code=500, detail="Internal Server Error")
    
    elif event["type"] == "customer.subscription.updated":
        subscription_data = event["data"]["object"]
        subscription_id = subscription_data["id"]
        
        # Update subscription in database
        subscription = db.query(Subscription).filter(Subscription.stripe_subscription_id == subscription_id).first()
        
        if subscription:
            subscription.status = subscription_data["status"]
            subscription.current_period_end = datetime.fromtimestamp(subscription_data["current_period_end"])
            db.commit()
    
    elif event["type"] == "customer.subscription.deleted":
        subscription_data = event["data"]["object"]
        subscription_id = subscription_data["id"]
        
        # Update subscription in database
        subscription = db.query(Subscription).filter(Subscription.stripe_subscription_id == subscription_id).first()
        
        if subscription:
            subscription.status = "canceled"
            db.commit()
    
    return {"status": "success"} 