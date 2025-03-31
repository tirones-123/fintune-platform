from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

# Base model for Payment
class PaymentBase(BaseModel):
    amount: float
    currency: str = "USD"
    description: Optional[str] = None

# Model for creating a new Payment
class PaymentCreate(PaymentBase):
    payment_method: str
    payment_intent_id: Optional[str] = None

# Model for Payment response
class PaymentResponse(PaymentBase):
    id: int
    user_id: int
    status: str
    payment_method: str
    payment_intent_id: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True

# Model for creating Stripe checkout session
class CheckoutSessionCreate(BaseModel):
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None
    
# Model for Character Transaction
class CharacterTransactionBase(BaseModel):
    amount: int
    description: Optional[str] = None
    
# Model for Character Transaction response
class CharacterTransactionResponse(CharacterTransactionBase):
    id: int
    user_id: int
    dataset_id: Optional[int] = None
    payment_id: Optional[int] = None
    price_per_character: Optional[float] = None
    total_price: Optional[float] = None
    created_at: datetime
    
    class Config:
        orm_mode = True

# Model for Character usage statistics
class CharacterUsageStats(BaseModel):
    free_characters_remaining: int
    total_characters_used: int
    total_characters_purchased: Optional[int] = None
    
# Model for purchasing character credits
class PurchaseCharacterCreditsRequest(BaseModel):
    character_count: int
    
# Model for character pricing information
class CharacterPricingInfo(BaseModel):
    price_per_character: float
    free_characters: int
    
# Model for quality assessment
class QualityAssessment(BaseModel):
    character_count: int
    usage_type: str
    score: float
    suggestions: List[str] 