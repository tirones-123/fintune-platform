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
            success_url=f"{settings.FRONTEND_URL}/dashboard?success=true",
            cancel_url=f"{settings.FRONTEND_URL}/pricing?canceled=true",
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

        # Récupération des informations essentielles
        subscription_id = session.get("subscription")
        logger.info(f"Subscription ID from session: {subscription_id}")

        # Mettre à jour la souscription correspondante sans utiliser les champs non définis
        if subscription_id:
            subscription = db.query(Subscription).filter(
                Subscription.stripe_subscription_id == subscription_id
            ).first()
            if subscription:
                subscription.status = "active"
                subscription.stripe_customer_id = session.get("customer")
                # On supprime l'utilisation de current_period_start, current_period_end, max_projects et max_fine_tunings
                db.commit()
                logger.info("Subscription updated successfully without extra fields.")
            else:
                # Si aucun record n'est trouvé, on peut utiliser metadata pour créer un nouvel enregistrement
                user_id = session.get("metadata", {}).get("user_id")
                if user_id:
                    subscription = Subscription(
                        user_id=int(user_id),
                        plan="starter",  # ou selon le plan choisi
                        status="active",
                        stripe_customer_id=session.get("customer"),
                        stripe_subscription_id=subscription_id
                    )
                    db.add(subscription)
                    db.commit()
                    logger.info("Nouvelle souscription créée via webhook.")
                else:
                    logger.error("Aucun user_id trouvé dans les métadonnées du webhook.")
        else:
            logger.error("No subscription ID provided in session.")
    
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