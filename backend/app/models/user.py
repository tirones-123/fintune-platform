from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    has_completed_onboarding = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relation originale uniquement
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    # Supprimez ces lignes si elles n'existaient pas dans le code original
    # subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    # api_keys = relationship("ApiKey", back_populates="user", cascade="all, delete-orphan") 