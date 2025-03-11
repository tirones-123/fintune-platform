from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base

class FineTuning(Base):
    __tablename__ = "fine_tunings"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="queued")  # queued, training, completed, cancelled, error
    model = Column(String, nullable=False)  # Base model (e.g., gpt-3.5-turbo)
    provider = Column(String, nullable=False)  # AI provider (e.g., openai, anthropic)
    progress = Column(Float, nullable=True)  # Progress percentage (0-100)
    hyperparameters = Column(JSON, nullable=True)  # Training hyperparameters
    metrics = Column(JSON, nullable=True)  # Training metrics
    error_message = Column(Text, nullable=True)
    external_id = Column(String, nullable=True)  # ID from the provider
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    dataset = relationship("Dataset", back_populates="fine_tunings") 