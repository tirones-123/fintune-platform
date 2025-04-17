from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    name: str
    is_active: Optional[bool] = True
    has_completed_onboarding: Optional[bool] = False

# Properties to receive via API on creation
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    name: str

# Properties to receive via API on update
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    has_completed_onboarding: Optional[bool] = None

# Properties to return via API
class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

# Token schema
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserResponse

# Ajouter le schéma manquant pour la requête de refresh token
class RefreshTokenRequest(BaseModel):
    refresh_token: str

class UserCreate(UserBase):
    password: str 