from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
import requests
from openai import OpenAI

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/verify-api-key", response_model=Dict[str, Any])
async def verify_api_key(
    data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    provider = data.get("provider")
    key = data.get("key")
    
    if not provider or not key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provider and key are required"
        )
    
    if provider == "openai":
        # Vérifier si la clé est valide en premier
        try:
            client = OpenAI(api_key=key)
            client.models.list(limit=1)
            
            # Vérifier le solde du compte
            response = requests.get(
                'https://api.openai.com/v1/dashboard/billing/subscription',
                headers={
                    'Authorization': f'Bearer {key}',
                    'Content-Type': 'application/json'
                }
            )
            
            if response.status_code != 200:
                return {
                    "valid": True,
                    "credits": 1,  # Supposons qu'il a des crédits si on ne peut pas vérifier
                    "message": "Clé API valide, mais impossible de vérifier les crédits"
                }
            
            data = response.json()
            
            # Vérifier si le compte a des crédits disponibles
            has_credits = data.get("hard_limit_usd", 0) > 0 or \
                          data.get("has_payment_method", False) or \
                          data.get("system_hard_limit_usd", 0) > 0
            
            return {
                "valid": True,
                "credits": 1 if has_credits else 0,
                "subscription": data
            }
            
        except Exception as e:
            return {
                "valid": False,
                "message": str(e)
            }
    
    elif provider == "anthropic":
        # Pour Anthropic (à implémenter selon l'API Anthropic)
        # Pour l'instant, supposons que la clé est valide sans vérification
        return {
            "valid": True,
            "credits": 1,
            "message": "Mode test pour Anthropic"
        }
    
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported provider: {provider}"
        )
