import stripe
from typing import Dict, Any
from sqlalchemy.orm import Session
import logging

from app.core.config import settings
from app.db.session import SessionLocal  # Importer SessionLocal au lieu de get_db
from app.models.user import User
from app.models.payment import Payment, CharacterTransaction
from app.services.character_service import CharacterService

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

logger = logging.getLogger(__name__)

class StripeService:
    """Service pour gérer les interactions avec l'API Stripe."""
    
    async def create_checkout_session(self, amount: int, user_id: int, metadata: Dict[str, Any] = None):
        """
        Créer une session de paiement pour l'achat de caractères.
        
        Args:
            amount: Montant en cents (USD)
            user_id: ID de l'utilisateur
            metadata: Métadonnées supplémentaires pour la session
        
        Returns:
            Le lien de la session de paiement
        """
        try:
            # Préparer les métadonnées
            session_metadata = {"user_id": str(user_id), "payment_type": "character_credits"}
            if metadata:
                session_metadata.update(metadata)
            
            # Créer une session de paiement
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[
                    {
                        "price": settings.STRIPE_PRICE_ID,
                        "quantity": 1,
                    },
                ],
                mode="payment",  # Mode paiement unique (pas d'abonnement)
                success_url=f"{settings.FRONTEND_URL}/dashboard?payment_success=true",
                cancel_url=f"{settings.FRONTEND_URL}/dashboard?payment_cancel=true",
                client_reference_id=str(user_id),
                metadata=session_metadata,
            )
            
            return checkout_session.url
        
        except Exception as e:
            logger.error(f"Erreur lors de la création de la session de paiement: {str(e)}")
            raise e
    
    async def handle_payment_success(self, event: Dict[str, Any]):
        """
        Gérer un paiement réussi pour l'achat de caractères.
        
        Args:
            event: Événement Stripe
        """
        try:
            # Extraire les informations de la session
            session = event["data"]["object"]
            user_id = int(session.get("client_reference_id", 0))
            metadata = session.get("metadata", {})
            
            # Vérifier si c'est un paiement pour des caractères
            if metadata.get("payment_type") != "character_credits":
                logger.warning(f"Type de paiement non pris en charge: {metadata.get('payment_type')}")
                return
            
            # Extraire les détails du paiement
            payment_intent_id = session.get("payment_intent")
            amount = session.get("amount_total", 0)
            
            # Obtenir le nombre de caractères acheté
            character_count = metadata.get("character_count", 0)
            if not character_count:
                # Calculer le nombre de caractères basé sur le montant
                # Prix par caractère: 0.000365 $ (multiplier par 100 pour les cents)
                character_count = int(amount / (0.000365 * 100))
            
            # Créer un nouvel enregistrement de paiement en utilisant une session manuelle
            db = SessionLocal()
            try:
                # Enregistrer le paiement
                payment = Payment(
                    user_id=user_id,
                    amount=amount / 100,  # Convertir les cents en dollars
                    currency="USD",
                    status="succeeded",
                    payment_intent_id=payment_intent_id,
                    description=f"Achat de {character_count} caractères"
                )
                db.add(payment)
                db.commit()
                db.refresh(payment)
                
                # Ajouter des caractères au compte de l'utilisateur
                character_service = CharacterService()
                character_service.add_character_credits(
                    db=db,
                    user_id=user_id,
                    character_count=character_count,
                    payment_id=payment.id
                )
                
                logger.info(f"Paiement réussi pour l'utilisateur {user_id}: {character_count} caractères ajoutés")
            finally:
                db.close()
        
        except Exception as e:
            logger.error(f"Erreur lors du traitement du paiement: {str(e)}")
            raise e

# Créer une instance du service pour l'importation
stripe_service = StripeService() 