import os
import json
from typing import List, Optional, Dict, Any
from pydantic import Field, computed_field, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
        env_file_encoding="utf-8",
        env_nested_delimiter="__"
    )

    # API configuration
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "FinTune Platform API"
    
    # CORS configuration
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://finetuner.io",
        "https://www.finetuner.io",
        "https://api.finetuner.io",
        "http://finetuner.io",
        "http://www.finetuner.io",
        "http://api.finetuner.io",
        "https://82.29.173.71:8000"
    ]
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, value):
        if isinstance(value, str):
            value = value.strip()
            # Si la chaîne est un tableau JSON (commence par '['), essayer de le décoder
            if value.startswith("["):
                try:
                    parsed = json.loads(value)
                    if isinstance(parsed, list):
                        return [str(item) for item in parsed]
                except json.JSONDecodeError:
                    # Si le parsing échoue, fallback à une séparation par virgule
                    pass
            # Sinon, se baser sur le split par virgule
            return [i.strip() for i in value.split(",")]
        return value
    
    # Security configuration
    SECRET_KEY: str = Field(default="your_secret_key_here")
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    
    # Database configuration
    POSTGRES_HOST: str = Field(default="localhost")
    POSTGRES_USER: str = Field(default="postgres")
    POSTGRES_PASSWORD: str = Field(default="postgres")
    POSTGRES_DB: str = Field(default="fintune")
    
    @computed_field
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if not all([self.POSTGRES_USER, self.POSTGRES_PASSWORD, self.POSTGRES_HOST, self.POSTGRES_DB]):
            return "postgresql://postgres:postgres@localhost/fintune"
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}/{self.POSTGRES_DB}"
    
    # Stripe configuration
    STRIPE_SECRET_KEY: str = Field(default="")
    STRIPE_PUBLISHABLE_KEY: str = Field(default="")
    STRIPE_WEBHOOK_SECRET: str = Field(default="")
    
    # Stripe price IDs
    STRIPE_PRICE_STARTER: str = Field(default="")
    STRIPE_PRICE_PRO: str = Field(default="")
    STRIPE_PRICE_ENTERPRISE: str = Field(default="")
    
    # File storage configuration
    UPLOAD_DIR: str = Field(default="/tmp/uploads")
    MAX_UPLOAD_SIZE: int = Field(default=10485760)  # 10MB
    
    # Redis configuration
    REDIS_URL: str = Field(default="redis://redis:6379/0")

    # IA settings 
    OPENAI_API_KEY: str = Field(default="")
    ANTHROPIC_API_KEY: str = Field(default="")
    MISTRAL_API_KEY: str = Field(default="")
    
    # Content processing settings
    DEFAULT_AI_MODEL: str = Field(default="gpt-4o-mini")


settings = Settings() 