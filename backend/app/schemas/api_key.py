from typing import Optional
from pydantic import BaseModel
from datetime import datetime

# Shared properties
class ApiKeyBase(BaseModel):
    provider: str
    key: str

# Properties to receive via API on creation
class ApiKeyCreate(ApiKeyBase):
    pass

# Properties to return via API
class ApiKeyResponse(ApiKeyBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True 