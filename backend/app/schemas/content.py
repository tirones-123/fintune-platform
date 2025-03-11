from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Base model for Content
class ContentBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: str  # pdf, text, youtube, etc.
    url: Optional[str] = None

# Model for creating a new Content
class ContentCreate(ContentBase):
    project_id: int

# Model for updating an existing Content
class ContentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

# Model for Content response
class ContentResponse(ContentBase):
    id: int
    status: str
    file_path: Optional[str] = None
    size: Optional[int] = None
    error_message: Optional[str] = None
    project_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Model for file upload
class FileUpload(BaseModel):
    project_id: int
    name: str
    description: Optional[str] = None
    file_type: str = Field(..., description="Type of the file (pdf, text, etc.)")

# Model for URL content
class URLContent(BaseModel):
    project_id: int
    name: str
    description: Optional[str] = None
    url: str
    type: str = Field(..., description="Type of the content (youtube, webpage, etc.)") 