from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from starlette.responses import JSONResponse

# Création du limiteur utilisant l'adresse IP comme clé
limiter = Limiter(key_func=get_remote_address)

# Définition des limites par défaut pour différents types d'endpoints
# Ces valeurs peuvent être ajustées selon les besoins
DEFAULT_LIMITS = {
    "auth": "10/minute",          # Endpoints d'authentification
    "user_ops": "30/minute",      # Opérations utilisateur standard
    "content_ops": "20/minute",   # Opérations sur les contenus
    "ai_ops": "5/minute",         # Opérations AI intensives
    "file_ops": "10/minute",      # Upload/download de fichiers
    "search": "15/minute",        # Recherches
    "public": "60/minute"         # Endpoints publics
}

# Gestionnaire d'erreur personnalisé pour les dépassements de limites
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Gestionnaire personnalisé pour les erreurs de dépassement de limite de taux."""
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Trop de requêtes. Veuillez réessayer plus tard.",
            "retry_after": exc.retry_after if hasattr(exc, 'retry_after') else None
        },
        headers={"Retry-After": str(exc.retry_after) if hasattr(exc, 'retry_after') else "60"}
    ) 