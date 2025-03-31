from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services.ai_providers import get_ai_provider

router = APIRouter()

class GenerateSystemContentRequest(BaseModel):
    purpose: str

class GenerateSystemContentResponse(BaseModel):
    system_content: str

@router.post("/generate-system-content", response_model=GenerateSystemContentResponse)
def generate_system_content(
    request: GenerateSystemContentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate an optimized system content from the user's description using OpenAI. 
    This system content will be used in datasets for model fine-tuning.
    """
    if not request.purpose.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La description est requise"
        )
    
    try:
        # Utiliser OpenAI pour générer le system content
        provider = get_ai_provider("openai")
        
        # Construire le prompt
        prompt = f"""
        I’m currently fine-tuning an AI model and need an optimized "system prompt" based on the following description of the assistant I want to create:
        
        "{request.purpose}"
        
        Generate a short, concise "system prompt" that I could use as an instruction for this assistant. 
        The format should be simple, direct, and optimized for fine-tuning. 
        The prompt must start with "You are" and clearly describe the assistant's role.
        
        Exemple de format:
        "You are a helpful energy assistant that provides accurate information about renewable energy technologies."
        "You are a professional HR assistant that answers internal company policy questions clearly and efficiently."
        "You are a friendly cartoon character that guides children through fun and educational activities in a cheerful, playful tone."
        "You are Steve Jobs"
        "You areOprah Winfrey"
        "..."
        Return ONLY the system prompt, without quotation marks or any additional explanation.
        """
        
        # Générer le system content
        system_content = provider.generate_completion(prompt)
        
        # Nettoyer le résultat (retirer les guillemets, les explications éventuelles, etc.)
        system_content = system_content.strip().strip('"').strip()
        
        # Si par hasard il y a plusieurs lignes, ne garder que la première
        if "\n" in system_content:
            system_content = system_content.split("\n")[0].strip()
        
        # Vérifier que le système commence bien par "You are"
        if not system_content.lower().startswith("you are"):
            system_content = "You are " + system_content
        
        return {"system_content": system_content}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la génération du system content: {str(e)}"
        ) 