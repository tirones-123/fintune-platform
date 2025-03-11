from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

# Shared properties
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

# Properties to receive via API on creation
class ProjectCreate(ProjectBase):
    pass

# Properties to receive via API on update
class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

# Properties to return via API
class ProjectResponse(ProjectBase):
    id: int
    status: str
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    content_count: Optional[int] = 0
    dataset_count: Optional[int] = 0
    
    class Config:
        orm_mode = True 