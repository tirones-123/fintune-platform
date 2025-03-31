from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
import stripe
from datetime import datetime
import logging

from app.core.security import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.models.subscription import Subscription
from app.services.stripe_service import stripe_service

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter()

logger = logging.getLogger(__name__)

@router.post("/create-checkout-session")
async def create_checkout_session(
    current_user: User = Depends(get_current_user)
):
    """
    Créer une session de paiement pour un abonnement.
    """
    try:
        # Créer une session de paiement avec Stripe
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price": settings.STRIPE_PRICE_ID,
                    "quantity": 1,
                },
            ],
            mode="payment",  # Paiement unique au lieu d'abonnement
            success_url=f"{settings.FRONTEND_URL}/dashboard?payment_success=true",
            cancel_url=f"{settings.FRONTEND_URL}/dashboard?payment_cancel=true",
            client_reference_id=str(current_user.id),
            metadata={"payment_type": "character_credits", "user_id": str(current_user.id)}
        )
        
        return {"checkout_url": checkout_session.url}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de la session de paiement: {str(e)}"
        )

@router.post("/create-checkout-session/{plan_id}")
async def create_plan_checkout_session(
    plan_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Créer une session de paiement pour un plan d'abonnement spécifique (compatibilité)
    ou rediriger vers le nouvel achat à l'usage
    """
    try:
        # Mapper l'ancien système d'abonnement au nouveau système à l'usage
        # Dans la nouvelle version, tous les plans redirigent vers l'achat de caractères
        
        # Déterminer le nombre de caractères offerts en fonction du plan
        character_credit_mapping = {
            "starter": 100000,  # 100k caractères = 36.5$
            "pro": 500000,      # 500k caractères = 182.5$
            "enterprise": 2000000  # 2M caractères = 730$
        }
        
        # Si plan inconnu, utiliser starter par défaut
        character_count = character_credit_mapping.get(plan_id.lower(), 100000)
        
        # Créer une session de paiement pour l'achat de caractères
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price": settings.STRIPE_PRICE_ID,
                    "quantity": 1,
                },
            ],
            mode="payment",
            success_url=f"{settings.FRONTEND_URL}/dashboard?payment_success=true",
            cancel_url=f"{settings.FRONTEND_URL}/dashboard?payment_cancel=true",
            client_reference_id=str(current_user.id),
            metadata={
                "payment_type": "character_credits", 
                "user_id": str(current_user.id),
                "original_plan": plan_id,
                "character_count": str(character_count)
            }
        )
        
        return {"checkout_url": checkout_session.url}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de la session de paiement: {str(e)}"
        )

@router.post("/customer-portal")
async def customer_portal(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Rediriger l'utilisateur vers le portail client Stripe.
    """
    try:
        # Récupérer le customer_id Stripe de l'utilisateur depuis la base de données
        stripe_customer_id = None
        
        # Si l'utilisateur a un abonnement
        if current_user.subscription and current_user.subscription.stripe_customer_id:
            stripe_customer_id = current_user.subscription.stripe_customer_id
        
        if not stripe_customer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="L'utilisateur n'a pas d'identifiant client Stripe"
            )
        
        # Créer une session pour le portail client
        session = stripe.billing_portal.Session.create(
            customer=stripe_customer_id,
            return_url=f"{settings.FRONTEND_URL}/dashboard",
        )
        
        return {"url": session.url}
    
    except HTTPException as e:
        raise e
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de la session du portail client: {str(e)}"
        )

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Webhook pour gérer les événements de Stripe.
    """
    # Récupérer le corps de la requête
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        # Vérifier la signature de Stripe
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
        
        # Gérer l'événement
        if event["type"] == "checkout.session.completed":
            # Paiement réussi
            session = event["data"]["object"]
            
            # Vérifier si c'est un achat de caractères
            metadata = session.get("metadata", {})
            if metadata.get("payment_type") == "character_credits":
                # Traiter l'achat de caractères
                await stripe_service.handle_payment_success(event)
            else:
                # Traiter l'abonnement (ancien système)
                await handle_subscription_payment(session)
        
        # Répondre avec un statut 200 pour indiquer que l'événement a été reçu
        return {"status": "success"}
    
    except Exception as e:
        # En cas d'erreur, journaliser l'erreur et renvoyer un statut 400
        logging.error(f"Erreur lors du traitement du webhook Stripe: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erreur lors du traitement du webhook: {str(e)}"
        )

async def handle_subscription_payment(session: Dict[str, Any]):
    """
    Gérer un paiement d'abonnement réussi.
    """
    # Implémentation existante pour gérer les abonnements
    # À adapter en fonction des besoins spécifiques
    pass 