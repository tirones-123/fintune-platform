from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import logging

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services.ai_providers import get_ai_provider, ai_provider_service
from app.core.config import settings
from app.models.api_key import ApiKey

router = APIRouter()
logger = logging.getLogger(__name__)

class GenerateSystemContentRequest(BaseModel):
    purpose: str

class GenerateSystemContentResponse(BaseModel):
    system_content: str
    fine_tuning_category: str
    min_characters_recommended: int

class CompletionRequest(BaseModel):
    model_id: str
    prompt: str
    system_message: Optional[str] = None

class CompletionResponse(BaseModel):
    response: str

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

@router.post("/generate-completion", response_model=CompletionResponse)
async def generate_completion_endpoint(
    request_data: CompletionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates a completion using the specified model (standard or fine-tuned).
    """
    logger.info(f"Requête de complétion reçue pour modèle: {request_data.model_id} par user {current_user.id}")
    
    # Déterminer le fournisseur (pour l'instant, on suppose OpenAI si ce n'est pas un ID de fine-tuning numérique)
    # Une logique plus robuste pourrait être nécessaire si on ajoute d'autres providers
    provider = "openai" # Par défaut
    fine_tuning_record = None
    model_to_use = request_data.model_id
    
    # Essayer de voir si model_id est un ID numérique de fine-tuning
    try:
        ft_id = int(request_data.model_id)
        # Si c'est un entier, récupérer le fine-tuning pour obtenir le provider et le vrai model_id
        fine_tuning_record = db.query(FineTuning).join(Dataset).join(Project).filter(
            FineTuning.id == ft_id,
            Project.user_id == current_user.id
        ).first()
        
        if fine_tuning_record:
            if fine_tuning_record.status != 'completed':
                 raise HTTPException(status_code=400, detail="Le modèle fine-tuné sélectionné n'est pas encore complété.")
            if not fine_tuning_record.fine_tuned_model:
                 raise HTTPException(status_code=400, detail="L'ID du modèle fine-tuné (externe) est manquant.")
                 
            provider = fine_tuning_record.provider
            model_to_use = fine_tuning_record.fine_tuned_model # Utiliser l'ID externe du modèle FT
            logger.info(f"Utilisation du modèle fine-tuné: {model_to_use} (Provider: {provider})")
        else:
            # Si l'ID est numérique mais ne correspond à aucun FT de l'utilisateur, c'est une erreur
             raise HTTPException(status_code=404, detail=f"Modèle fine-tuné avec ID {ft_id} non trouvé.")
             
    except ValueError:
        # Si ce n'est pas un entier, on suppose que c'est un ID de modèle standard (ex: 'gpt-4o')
        # Ici, on assume OpenAI par défaut. Pourrait être amélioré.
        provider = "openai"
        model_to_use = request_data.model_id 
        logger.info(f"Utilisation du modèle standard: {model_to_use} (Provider: {provider})")

    # Récupérer la clé API pour le provider déterminé
    api_key_record = db.query(ApiKey).filter(
        ApiKey.user_id == current_user.id,
        ApiKey.provider == provider
    ).first()

    if not api_key_record:
        raise HTTPException(status_code=401, detail=f"Clé API pour {provider} non trouvée.")

    # Appeler le service AI Provider
    try:
        completion = await ai_provider_service.get_completion(
            provider=provider,
            api_key=api_key_record.key,
            model_id=model_to_use,
            prompt=request_data.prompt,
            system_prompt=request_data.system_message
        )
        
        if completion is None:
            raise HTTPException(status_code=500, detail="Échec de l'obtention de la complétion depuis le fournisseur.")
            
        return CompletionResponse(response=completion)

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Erreur API {provider} pour modèle {model_to_use}: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail=f"Erreur communication avec l'API {provider}: {str(e)}") 