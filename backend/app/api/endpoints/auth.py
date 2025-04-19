from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from authlib.integrations.starlette_client import OAuth, OAuthError
import uuid
import logging
import urllib.parse  # Ajout pour l'encodage d'URL

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

logger = logging.getLogger(__name__)

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
    # Force l'URL de callback complète et correcte
    # TODO: Mettre cette URL dans settings.py (ex: settings.GOOGLE_REDIRECT_URI)
    redirect_uri = "https://api.finetuner.io/api/auth/google/callback"
    
    print(f"Forcing Redirect URI sent to Google: {redirect_uri}") # Pour le debug

    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def auth_google_callback(request: Request, db: Session = Depends(get_db)):
    """Handles the callback from Google after user authorization."""
    try:
        token = await oauth.google.authorize_access_token(request)
    except OAuthError as error:
        logger.error(f"OAuthError during Google token authorization: {error.error} - {error.description}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials from Google: {error.description}"
        )
    except Exception as e:
        logger.error(f"Generic error during Google token authorization: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during Google authentication."
        )

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

    # Générer les tokens JWT pour notre application
    access_token = create_access_token(data={"sub": db_user.email})
    refresh_token = create_refresh_token(data={"sub": db_user.email})

    # CHANGEMENT : Au lieu de stocker les tokens dans des cookies HttpOnly,
    # on les passe en paramètres d'URL pour que le frontend les récupère et les mette dans localStorage
    # Ne pas mettre directement les tokens dans l'URL (risques de sécurité)
    # Utiliser un état temporaire côté frontend qui sera supprimé après utilisation
    
    # Créer un ID unique pour cet état de connexion
    auth_state_id = str(uuid.uuid4())
    
    # Paramètres pour la redirection
    params = {
        'auth_success': 'true',
        'state_id': auth_state_id,
        'user_email': db_user.email,
        'user_name': db_user.name,
        'access_token': access_token,
        'refresh_token': refresh_token
    }
    
    # Destination de redirection (dashboard ou onboarding selon l'état de l'utilisateur)
    destination = "/dashboard" if db_user.has_completed_onboarding else "/onboarding"
    
    # Construire l'URL avec les paramètres
    query_string = urllib.parse.urlencode(params)
    redirect_url = f"{settings.FRONTEND_URL}{destination}?{query_string}"
    
    # Rediriger l'utilisateur
    logger.info(f"Redirecting after Google auth to: {settings.FRONTEND_URL}{destination} (with auth params)")
    response = Response(status_code=307) # Temporary Redirect
    response.headers['Location'] = redirect_url
    
    return response

# --- Fin Endpoints Google OAuth --- 