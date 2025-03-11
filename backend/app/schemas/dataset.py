from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

# Base model for Dataset
class DatasetBase(BaseModel):
    name: str
    description: Optional[str] = None
    model: Optional[str] = None  # Model used for dataset generation

# Model for creating a new Dataset
class DatasetCreate(DatasetBase):
    project_id: int
    content_ids: List[int]

# Model for updating an existing Dataset
class DatasetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

# Model for Dataset Pair
class DatasetPairBase(BaseModel):
    question: str
    answer: str
    metadata: Optional[Dict[str, Any]] = None

# Model for creating a Dataset Pair
class DatasetPairCreate(DatasetPairBase):
    dataset_id: int

# Model for Dataset Pair response
class DatasetPairResponse(DatasetPairBase):
    id: int
    dataset_id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Model for Dataset response
class DatasetResponse(DatasetBase):
    id: int
    status: str
    pairs_count: Optional[int] = None
    size: Optional[int] = None
    error_message: Optional[str] = None
    project_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Model for Dataset with pairs
class DatasetWithPairs(DatasetResponse):
    pairs: List[DatasetPairResponse] = []

    class Config:
        orm_mode = True

# Model for bulk pair upload
class BulkPairUpload(BaseModel):
    pairs: List[DatasetPairBase] 