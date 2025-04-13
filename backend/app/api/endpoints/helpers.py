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
    fine_tuning_category: str
    min_characters_recommended: int

@router.post("/generate-system-content", response_model=GenerateSystemContentResponse)
def generate_system_content(
    request: GenerateSystemContentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate an optimized system content from the user's description using OpenAI. 
    This system content will be used in datasets for model fine-tuning.
    Also categorizes the type of fine-tuning and recommends minimum character count.
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
        I'm currently fine-tuning an AI model and need an optimized "system prompt" based on the following description of the assistant I want to create:
        
        "{request.purpose}"
        
        Generate a short, concise "system prompt" that I could use as an instruction for this assistant. 
        The format should be simple, direct, and optimized for fine-tuning. 
        The prompt must start with "You are" and clearly describe the assistant's role.
        The prompt must be in the language of the description even the "you are" need to be in the language of the description.
        
        Exemple de format:
        "You are a helpful energy assistant that provides accurate information about renewable energy technologies."
        "You are a professional HR assistant that answers internal company policy questions clearly and efficiently."
        "You are a friendly cartoon character that guides children through fun and educational activities in a cheerful, playful tone."
        "You are Steve Jobs"
        "You are Oprah Winfrey"
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
        
        # Définir le prompt pour catégoriser le type de fine-tuning
        categorization_prompt = f"""
        Based on the following description of an AI assistant, categorize it into ONE of these specific fine-tuning categories:
        
        1. Conversational Style (Character) = Mimic the tone, phrasing, or personality of a known or fictional character or consistent tone or attitude (friendly, concise, humorous, formal, etc.)
        
        2. Task-specific Assistant = Perform a structured task (e.g., travel planning, legal form generation, support)
        
        3. Professional Expertise (lawyer, doctor, etc.) = Respond as a domain expert with accurate terminology and reasoning
        
        4. Translation / Specialized Rewriting = Translate or rewrite with domain-specific terminology or tone
        
        5. Enterprise Chatbot (Internal Knowledge) = Answer questions using internal knowledge (product data, procedures, etc.)
        
        Description of the assistant: "{request.purpose}"
        
        Choose only one category from the list above that best fits this description. Return ONLY the category name, exactly as written above without any additional text, explanation, or quote marks.
        """
        
        # Obtenir la catégorie de fine-tuning
        fine_tuning_category = provider.generate_completion(categorization_prompt)
        fine_tuning_category = fine_tuning_category.strip().strip('"').strip()
        
        # Déterminer le nombre minimum de caractères recommandé basé sur la catégorie
        min_characters_map = {
            "Conversational Style (Character)": 10000,
            "Task-specific Assistant": 20000,
            "Professional Expertise (lawyer, doctor, etc.)": 40000,
            "Translation / Specialized Rewriting": 100000,
            "Enterprise Chatbot (Internal Knowledge)": 10000
        }
        
        min_characters_recommended = min_characters_map.get(fine_tuning_category, 20000)  # Valeur par défaut: 20000
        
        return {
            "system_content": system_content,
            "fine_tuning_category": fine_tuning_category,
            "min_characters_recommended": min_characters_recommended
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la génération du system content: {str(e)}"
        ) 