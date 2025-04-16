from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    type = Column(String, nullable=True)  # 'info', 'success', 'warning', 'error', 'fine_tuning', etc.
    related_id = Column(Integer, nullable=True) # ID de l'objet lié (projet, finetuning, etc.)
    related_type = Column(String, nullable=True) # Type de l'objet lié ('project', 'finetuning', etc.)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")

# Ajouter la relation inverse dans User (models/user.py)
# notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
