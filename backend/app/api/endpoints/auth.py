from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from authlib.integrations.starlette_client import OAuth
import uuid

from app.core.security import create_access_token, create_refresh_token, get_password_hash, verify_password, get_current_user, validate_refresh_token
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token, RefreshTokenRequest

router = APIRouter()

# Configuration Authlib pour Google OAuth
oauth = OAuth()
oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url=settings.GOOGLE_DISCOVERY_URL,
    client_kwargs={
        'scope': 'openid email profile'
    }
)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    """
    # Check if user already exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        name=user_in.name,
        is_active=True,
        has_completed_onboarding=False
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    # Authenticate user
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create access and refresh tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/refresh-token", response_model=Token)
def refresh_access_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Refresh access token.
    """
    # Validate refresh token and get user
    user = validate_refresh_token(request.refresh_token, db)
    
    # Create new access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    new_refresh_token = create_refresh_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/logout")
def logout(response: Response):
    """
    Logout user (client-side only, invalidate tokens on client).
    """
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"detail": "Successfully logged out"}

# --- Endpoints Google OAuth --- 

@router.get("/google/login")
async def login_via_google(request: Request):
    """Redirects the user to Google for authentication."""
    # Force l'URL de callback en HTTPS et avec le bon domaine API
    # Ne plus se fier à request.base_url
    # Note: request.url_for génère le chemin relatif, ex: /api/auth/google/callback
    callback_path = request.url_for('auth_google_callback')
    
    # Construire l'URL absolue correcte pour la production
    # S'assurer que settings.FRONTEND_URL est bien l'URL de base où l'API est accessible
    # Si l'API est sur api.finetuner.io, il faut une variable dédiée
    # Pour l'instant, on hardcode pour api.finetuner.io
    # TODO: Utiliser une variable de config settings.API_BASE_URL si possible
    api_base_url = "https://api.finetuner.io" # A METTRE EN CONFIG IDEALEMENT
    redirect_uri = f"{api_base_url}{callback_path}"
    
    print(f"Redirect URI sent to Google: {redirect_uri}") # Pour le debug

    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def auth_google_callback(request: Request, db: Session = Depends(get_db)):
    """Handles the callback from Google after user authorization."""
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as e:
        # Log l'erreur et rediriger vers une page d'erreur ou de connexion
        # logger.error(f"Error authorizing Google access token: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials from Google")

    user_info = token.get('userinfo')
    if not user_info:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not fetch user info from Google")

    google_email = user_info.get('email')
    google_name = user_info.get('name')
    google_sub = user_info.get('sub') # ID Google unique

    if not google_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email not provided by Google")

    # Vérifier si l'utilisateur existe déjà
    db_user = db.query(User).filter(User.email == google_email).first()

    if db_user:
        # L'utilisateur existe, le connecter
        pass # On génère les tokens plus bas
    else:
        # L'utilisateur n'existe pas, le créer
        # Générer un mot de passe aléatoire (non utilisable)
        random_password = str(uuid.uuid4())
        hashed_password = get_password_hash(random_password)
        
        db_user = User(
            email=google_email,
            name=google_name or google_email.split('@')[0], # Utiliser le nom ou déduire de l'email
            hashed_password=hashed_password,
            is_active=True, # Activer directement
            # Potentiellement ajouter google_id=google_sub si vous ajoutez ce champ au modèle User
            has_received_free_credits=False, # Nouvel utilisateur
            has_completed_onboarding=False
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        # Potentiellement, lancer le projet par défaut ici aussi?
        # Ou laisser l'utilisateur arriver sur une page post-inscription?

    # Générer les tokens JWT pour notre application
    access_token = create_access_token(data={"sub": db_user.email})
    refresh_token = create_refresh_token(data={"sub": db_user.email})

    # Rediriger vers le frontend avec les tokens (via cookies HttpOnly recommandés)
    # Pour l'instant, redirection simple vers le dashboard
    # Le frontend devra gérer la récupération des infos utilisateur si nécessaire
    redirect_url = f"{settings.FRONTEND_URL}/dashboard" 
    response = Response(status_code=307) # Temporary Redirect
    response.headers['Location'] = redirect_url
    
    # Ajouter les tokens dans des cookies HttpOnly sécurisés
    response.set_cookie(
        key="access_token", 
        value=access_token, 
        httponly=True, 
        secure= not settings.DEBUG, # True en production (HTTPS)
        samesite="lax", # ou 'strict'
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    response.set_cookie(
        key="refresh_token", 
        value=refresh_token, 
        httponly=True, 
        secure= not settings.DEBUG,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )
    
    return response

# --- Fin Endpoints Google OAuth --- 