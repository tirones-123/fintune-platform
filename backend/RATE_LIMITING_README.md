# Implémentation du Rate Limiting dans l'API

Ce document explique l'implémentation du mécanisme de rate limiting (limitation du taux de requêtes) dans l'API FineTune Platform.

## Pourquoi le Rate Limiting ?

Le rate limiting offre plusieurs avantages importants :
- **Sécurité** : Prévient les attaques par force brute et les attaques par déni de service (DoS).
- **Équité** : Garantit un accès équitable aux ressources pour tous les utilisateurs.
- **Stabilité** : Évite la surcharge du serveur en limitant le nombre de requêtes simultanées.
- **Économie** : Réduit les coûts en évitant la surconsommation des services tiers (comme les API OpenAI).

## Implémentation Technique

Nous avons implémenté le rate limiting en utilisant la bibliothèque `slowapi` qui s'intègre parfaitement avec FastAPI.

### Fichiers modifiés/ajoutés

1. **backend/requirements.txt**
   - Ajout de la dépendance `slowapi==0.1.8`

2. **backend/app/core/limiter.py**
   - Définit le limiteur principal et les limites par défaut pour différents types d'endpoints
   - Configure un gestionnaire d'erreurs personnalisé

3. **backend/main.py**
   - Intègre le limiteur au niveau de l'application
   - Configure le middleware SlowAPI

4. **backend/app/api/example_limiter_usage.py** (exemple uniquement)
   - Montre comment utiliser les limiteurs dans les différents routers et endpoints

## Limites par défaut

Nous avons défini plusieurs catégories de limites :

| Type | Limite | Description |
|------|--------|-------------|
| `auth` | 10/minute | Endpoints d'authentification (login, register) |
| `user_ops` | 30/minute | Opérations utilisateur standard |
| `content_ops` | 20/minute | Opérations sur les contenus |
| `ai_ops` | 5/minute | Opérations AI intensives |
| `file_ops` | 10/minute | Upload/download de fichiers |
| `search` | 15/minute | Recherches |
| `public` | 60/minute | Endpoints publics |

## Comment appliquer le Rate Limiting

### 1. Dans les routers existants

Pour appliquer une limite à un endpoint spécifique :

```python
from app.core.limiter import limiter, DEFAULT_LIMITS
from fastapi import Request

@router.post("/endpoint")
@limiter.limit(DEFAULT_LIMITS["auth"])  # Utilise la limite prédéfinie
async def endpoint_function(request: Request):
    # Le code de l'endpoint
    return {"message": "Response"}
```

### 2. Limites dynamiques basées sur l'utilisateur

Pour appliquer des limites différentes selon le type d'utilisateur :

```python
from app.core.deps import get_current_user

def get_user_limit(request: Request, user = Depends(get_current_user)):
    if user and user.is_premium:
        return "50/minute"
    return "10/minute"

@router.post("/premium-endpoint")
@limiter.limit(get_user_limit)
async def premium_endpoint(request: Request, user = Depends(get_current_user)):
    return {"message": "Premium content"}
```

### 3. Endpoints prioritaires

Pour les endpoints critiques où le rate limiting doit être particulièrement strict :

```python
@router.post("/sensitive-endpoint")
@limiter.limit("3/minute")  # Limite explicite, plus stricte que les valeurs par défaut
async def sensitive_endpoint(request: Request):
    return {"message": "Sensitive operation"}
```

## Recommandations pour l'application

1. **Endpoints d'authentification** : Appliquer `auth` à tous les endpoints d'inscription, connexion et réinitialisation de mot de passe.

2. **API Keys et Opérations sensibles** : Appliquer des limites strictes (`5/minute` ou moins) sur les endpoints qui gèrent les clés API des utilisateurs ou les opérations de paiement.

3. **Endpoints Fine-tuning** : Limiter strictement les endpoints qui lancent des opérations coûteuses comme les fine-tunings.

4. **Documentation API** : Les endpoints de documentation (`/api/docs`, `/api/redoc`) n'ont pas besoin de limites.

## Surveillance et Ajustement

Nous recommandons de :
- Surveiller les logs pour identifier les utilisateurs qui atteignent fréquemment les limites
- Ajuster les limites au besoin en fonction de l'utilisation réelle
- Envisager d'implémenter des limites différenciées pour les utilisateurs premium 