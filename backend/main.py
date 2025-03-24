from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import logging
import os
from pathlib import Path
import stripe
from celery_app import celery_app
from loguru import logger

from app.api.router import api_router
from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.db.init_db import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create upload directory if it doesn't exist
upload_dir = Path(settings.UPLOAD_DIR)
upload_dir.mkdir(parents=True, exist_ok=True)

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for the FinTune Platform - A platform for fine-tuning language models",
    version="1.0.0",
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Root endpoint
@app.get("/")
def root():
    return {"message": "Welcome to the FinTune Platform API"}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok"}

# Mock payment endpoint for testing
@app.get("/mock-payment")
def mock_payment():
    return {
        "stripe_key": settings.STRIPE_PUBLISHABLE_KEY,
        "prices": {
            "starter": settings.STRIPE_PRICE_STARTER,
            "pro": settings.STRIPE_PRICE_PRO,
            "enterprise": settings.STRIPE_PRICE_ENTERPRISE,
        }
    }

# Initialize database on startup
@app.on_event("startup")
async def startup_db_client():
    logger.info("Creating database tables")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created")
    
    # Initialize database with test data if in development mode
    if os.getenv("DEBUG", "False").lower() == "true":
        logger.info("Initializing database with test data")
        db = SessionLocal()
        try:
            init_db(db)
        finally:
            db.close()
        logger.info("Database initialized with test data")

    # Vérifier la connexion Celery
    try:
        redis_host = os.getenv("REDIS_HOST", "redis")
        redis_port = os.getenv("REDIS_PORT", "6379")
        logger.info(f"Configuration Celery: redis://{redis_host}:{redis_port}/0")
        
        # Ping Redis via Celery
        celery_app.control.ping()
        logger.info("Connexion Celery testée avec succès")
    except Exception as e:
        logger.error(f"Erreur de connexion Celery: {str(e)}")
        logger.warning("La génération asynchrone de datasets pourrait ne pas fonctionner")

# Run the app
if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    debug = os.getenv("DEBUG", "False").lower() == "true"
    
    uvicorn.run("main:app", host=host, port=port, reload=debug) 