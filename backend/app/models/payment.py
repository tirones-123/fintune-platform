from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base

class Payment(Base):
    __tablename__ = "payments"
    
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

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    stripe_subscription_id = Column(String, nullable=True)
    stripe_customer_id = Column(String, nullable=True)
    status = Column(String, nullable=False)  # active, canceled, past_due, etc.
    plan = Column(String, nullable=False)  # starter, pro, enterprise
    current_period_start = Column(DateTime(timezone=True), nullable=True)
    current_period_end = Column(DateTime(timezone=True), nullable=True)
    cancel_at_period_end = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="subscription")
    
class CharacterTransaction(Base):
    __tablename__ = "character_transactions"
    
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