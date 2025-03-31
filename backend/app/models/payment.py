from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base

class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = {"extend_existing": True}
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, nullable=False, default="USD")
    status = Column(String, nullable=False)  # succeeded, pending, failed
    payment_method = Column(String, nullable=True)
    payment_intent_id = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="payments")

# La classe Subscription a été déplacée vers app/models/subscription.py
    
class CharacterTransaction(Base):
    __tablename__ = "character_transactions"
    __table_args__ = {"extend_existing": True}
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)  # Nombre de caractères (positif pour achat, négatif pour consommation)
    description = Column(Text, nullable=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)  # Si lié à un dataset spécifique
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=True)  # Si lié à un paiement
    price_per_character = Column(Float, nullable=True)  # Prix par caractère si applicable
    total_price = Column(Float, nullable=True)  # Prix total si applicable
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="character_transactions")
    dataset = relationship("Dataset", back_populates="character_transactions")
    payment = relationship("Payment", backref="character_transactions") 