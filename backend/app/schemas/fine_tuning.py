from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

# Base model for FineTuning
class FineTuningBase(BaseModel):
    name: str
    description: Optional[str] = None
    model: str  # Base model (e.g., gpt-3.5-turbo)
    provider: str  # AI provider (e.g., openai, anthropic)
    hyperparameters: Optional[Dict[str, Any]] = None

# Model for creating a new FineTuning
class FineTuningCreate(FineTuningBase):
    dataset_id: int

# Model for updating an existing FineTuning
class FineTuningUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

# Model for FineTuning response
class FineTuningResponse(FineTuningBase):
    id: int
    status: str
    progress: Optional[float] = None
    metrics: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    external_id: Optional[str] = None
    fine_tuned_model: Optional[str] = None
    dataset_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Model for cancelling a FineTuning job
class FineTuningCancel(BaseModel):
    reason: Optional[str] = None 