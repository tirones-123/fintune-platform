from typing import Optional
from pydantic import BaseModel
from datetime import datetime

# Shared properties
class SubscriptionBase(BaseModel):
    plan: str
    status: str
    is_trial: bool = False

# Properties to return via API
class SubscriptionResponse(SubscriptionBase):
    id: int
    user_id: int
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    trial_end: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True 