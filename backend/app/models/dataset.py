from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, BigInteger, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base

class Dataset(Base):
    __tablename__ = "datasets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="processing")  # processing, ready, error
    model = Column(String, nullable=True)  # Model used for dataset generation
    pairs_count = Column(Integer, nullable=True)
    size = Column(BigInteger, nullable=True)
    error_message = Column(Text, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="datasets")
    dataset_contents = relationship("DatasetContent", back_populates="dataset", cascade="all, delete-orphan")
    pairs = relationship("DatasetPair", back_populates="dataset", cascade="all, delete-orphan")
    fine_tunings = relationship("FineTuning", back_populates="dataset", cascade="all, delete-orphan")

class DatasetContent(Base):
    __tablename__ = "dataset_contents"
    
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)
    content_id = Column(Integer, ForeignKey("contents.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    dataset = relationship("Dataset", back_populates="dataset_contents")
    content = relationship("Content", back_populates="dataset_contents")

class DatasetPair(Base):
    __tablename__ = "dataset_pairs"
    
    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    metadata = Column(JSON, nullable=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    dataset = relationship("Dataset", back_populates="pairs") 