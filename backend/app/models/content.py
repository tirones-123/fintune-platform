from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, BigInteger
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base

class Content(Base):
    __tablename__ = "contents"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String, nullable=False)  # pdf, text, youtube, etc.
    status = Column(String, nullable=False, default="processing")  # processing, processed, error
    file_path = Column(String, nullable=True)
    url = Column(String, nullable=True)
    size = Column(BigInteger, nullable=True)
    error_message = Column(Text, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="contents")
    dataset_contents = relationship("DatasetContent", back_populates="content", cascade="all, delete-orphan") 