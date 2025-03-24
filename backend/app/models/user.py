from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column (String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    has_completed_onboarding = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relations - utiliser des chaînes pour éviter les importations circulaires
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    subscription = relationship ("Subscription", back_populates="user", uselist=False, cascade="all, delete-orphan")
    api_keys = relationship ("ApiKey", back_populates="user", cascade="all, delete-orphan")