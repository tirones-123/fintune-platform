"""
EXEMPLE D'UTILISATION DU RATE LIMITING DANS LES ROUTERS

Ce fichier est fourni à titre d'exemple pour montrer comment intégrer les
limiteurs de taux aux différents points d'accès de l'API.
Il n'est pas destiné à être importé directement dans l'application.
"""

from fastapi import APIRouter, Depends, Request
from app.core.limiter import limiter, DEFAULT_LIMITS

# Exemple pour un router d'authentification
auth_router = APIRouter()

# Appliquer une limite de taux au niveau de l'endpoint (10 par minute)
@auth_router.post("/login")
@limiter.limit(DEFAULT_LIMITS["auth"])
async def login(request: Request):
    # Le limiteur est appliqué avant que cette fonction ne soit exécutée
    return {"message": "Login endpoint"}

@auth_router.post("/register")
@limiter.limit(DEFAULT_LIMITS["auth"])
async def register(request: Request):
    return {"message": "Register endpoint"}


# Exemple pour un router de contenu
content_router = APIRouter()

# Limite standard pour les opérations de contenu (20 par minute)
@content_router.get("/contents")
@limiter.limit(DEFAULT_LIMITS["content_ops"])
async def get_contents(request: Request):
    return {"message": "List contents endpoint"}

# Limite plus stricte pour les opérations IA intensives (5 par minute)
@content_router.post("/contents/process")
@limiter.limit(DEFAULT_LIMITS["ai_ops"])
async def process_content(request: Request):
    return {"message": "Process content endpoint"}


# Exemple pour un router public avec des limites plus élevées
public_router = APIRouter()

@public_router.get("/public/info")
@limiter.limit(DEFAULT_LIMITS["public"])
async def public_info(request: Request):
    return {"message": "Public info endpoint"}


"""
EXEMPLE D'APPLICATION DE LIMITEURS DIFFÉRENTS BASÉS SUR L'UTILISATEUR OU LE TOKEN

Ce code montre comment définir des limites différentes 
selon que l'utilisateur est authentifié ou non,
ou selon son niveau d'abonnement.
"""

from fastapi import Header, Depends
from typing import Optional
from app.core.deps import get_current_user  # Supposé exister

# Fonction pour déterminer la clé de limitation en fonction de l'utilisateur ou de l'IP
def get_limit_key(request: Request, authorization: Optional[str] = Header(None)):
    if authorization:
        # Si l'utilisateur est authentifié, utiliser son token comme clé
        # Cela permet différentes limites par utilisateur plutôt que par IP
        return authorization
    # Sinon, utiliser l'adresse IP
    return request.client.host

# Fonction pour déterminer la limite en fonction du niveau d'abonnement de l'utilisateur
def get_user_limit(request: Request, user = Depends(get_current_user)):
    if user and user.subscription_tier == "premium":
        return "50/minute"  # Plus de requêtes pour les utilisateurs premium
    elif user and user.subscription_tier == "basic":
        return "20/minute"  # Limite standard pour les utilisateurs basic
    else:
        return "5/minute"   # Limite basse pour les utilisateurs non authentifiés

# Exemple d'endpoint utilisant une limite dynamique basée sur l'utilisateur
@content_router.post("/premium/generate")
@limiter.limit(get_user_limit)
async def generate_premium_content(request: Request, user = Depends(get_current_user)):
    return {"message": "Premium content generation"} 