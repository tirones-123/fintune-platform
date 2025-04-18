from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from decimal import Decimal

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.payment import CharacterTransaction, Payment
from app.schemas.payment import (
    CharacterTransactionResponse, CharacterUsageStats, 
    PurchaseCharacterCreditsRequest, CharacterPricingInfo,
    QualityAssessment
)
from app.services.character_service import character_service
from app.services.stripe_service import stripe_service

router = APIRouter()

@router.get("/usage-stats", response_model=CharacterUsageStats)
def get_character_usage_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Récupérer les statistiques d'utilisation des caractères pour l'utilisateur actuel.
    """
    # Calculer le total des caractères achetés (somme des transactions positives)
    total_purchased = db.query(
        func.sum(CharacterTransaction.amount)
    ).filter(
        CharacterTransaction.user_id == current_user.id,
        CharacterTransaction.amount > 0
    ).scalar() or 0
    
    return {
        "free_characters_remaining": current_user.free_characters_remaining,
        "total_characters_used": current_user.total_characters_used,
        "total_characters_purchased": total_purchased
    }

@router.get("/pricing", response_model=CharacterPricingInfo)
def get_character_pricing_info():
    """
    Récupérer les informations de tarification des caractères.
    """
    return {
        "price_per_character": character_service.PRICE_PER_CHARACTER,
        "free_characters": character_service.FREE_CHARACTERS
    }

@router.get("/transactions", response_model=List[CharacterTransactionResponse])
def get_character_transactions(
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Récupérer l'historique des transactions de caractères pour l'utilisateur actuel.
    """
    transactions = db.query(CharacterTransaction).filter(
        CharacterTransaction.user_id == current_user.id
    ).order_by(
        CharacterTransaction.created_at.desc()
    ).offset(offset).limit(limit).all()
    
    return transactions

@router.post("/purchase", response_model=CharacterTransactionResponse)
async def purchase_character_credits(
    request: PurchaseCharacterCreditsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Acheter des crédits de caractères.
    """
    character_count = request.character_count
    
    if character_count <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le nombre de caractères doit être supérieur à zéro"
        )
    
    # Calculer le prix
    price = character_service.calculate_price(character_count)
    
    # Arrondir le prix au cent le plus proche
    rounded_price = round(price, 2)
    
    # Vérifier que le montant est d'au moins 0.50$ (minimum pour Stripe)
    if rounded_price < 0.50:
        # Ajuster le prix au minimum requis
        rounded_price = 0.50
        logger.info(f"Prix ajusté au minimum requis par Stripe: ${rounded_price} pour {character_count} caractères")
    
    # Créer un paiement
    payment = Payment(
        user_id=current_user.id,
        amount=rounded_price, # Utiliser le prix arrondi
        status="pending",
        description=f"Achat de {character_count} caractères"
    )
    
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    try:
        # Créer une session de paiement Stripe
        checkout_session = await stripe_service.create_checkout_session(
            amount=int(rounded_price * 100),  # Conversion en cents entiers pour Stripe
            user_id=current_user.id,
            metadata={
                "character_count": character_count,
                "payment_id": str(payment.id)
            }
        )
        
        # Mettre à jour le paiement avec l'URL de checkout
        payment.payment_url = checkout_session
        db.commit()
        
        # Créer une transaction provisoire (sera confirmée après paiement)
        transaction = CharacterTransaction(
            user_id=current_user.id,
            amount=character_count,
            description=f"Achat en attente de {character_count} caractères",
            payment_id=payment.id,
            price_per_character=character_service.PRICE_PER_CHARACTER,
            total_price=rounded_price  # Utiliser le prix arrondi
        )
        
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        
        return {
            "id": transaction.id,
            "user_id": transaction.user_id,
            "amount": transaction.amount,
            "description": transaction.description,
            "created_at": transaction.created_at,
            "payment_id": transaction.payment_id,
            "price_per_character": transaction.price_per_character,
            "total_price": transaction.total_price,
            "checkout_url": checkout_session  # Ajouter l'URL de checkout
        }
        
    except Exception as e:
        # En cas d'erreur, marquer le paiement comme échoué
        payment.status = "failed"
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de la session de paiement: {str(e)}"
        )

@router.post("/quality-assessment", response_model=QualityAssessment)
def assess_data_quality(
    character_count: int,
    usage_type: str,
    current_user: User = Depends(get_current_user)
):
    """
    Évaluer la qualité des données en fonction du nombre de caractères et du type d'usage.
    """
    score = character_service.get_usage_quality_score(character_count, usage_type)
    suggestions = character_service.get_improvement_suggestions(character_count, usage_type)
    
    return {
        "character_count": character_count,
        "usage_type": usage_type,
        "score": score,
        "suggestions": suggestions
    } 