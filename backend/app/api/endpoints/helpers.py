from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import logging

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services.ai_providers import get_ai_provider
from app.core.config import settings
from app.models.api_key import ApiKey
from app.models.fine_tuning import FineTuning
from app.models.dataset import Dataset
from app.models.project import Project

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
async def generate_system_content(
    request: GenerateSystemContentRequest,
    current_user: User = Depends(get_current_user),
    # Pas besoin de db ici si on n'interagit pas avec la DB directement
    # db: Session = Depends(get_db)
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
        # Assumer que la clé API est dans les settings ou gérée par get_ai_provider
        provider = get_ai_provider("openai") 
        
        # Construire le premier prompt (pour générer le system content)
        prompt1 = f"""
        You are a system prompt-designer for AI fine-tuning. Your task is to transform the following plain-language
        description into a short system prompt that starts with "You are…".
        Respond **only** with the final system prompt, no introduction, no apology, no markdown.
        Respond **only** in the language of the description.

        Description:
        \"\"\"{request.purpose}\"\"\"
        """
        
        # Générer le system content (avec await)
        system_content_raw = await provider.generate_completion(prompt1)
        
        # Nettoyer le résultat
        system_content = system_content_raw.strip().strip('"').strip()
        if "\n" in system_content: system_content = system_content.split("\n")[0].strip()
        # Assurer que ça commence par "You are" (ou équivalent localisé si besoin)
        # if not system_content.lower().startswith("you are"): system_content = "You are " + system_content
        # Note: Le prompt demande déjà de commencer par You are, mais la vérif peut être utile
        # Il faudrait adapter si la langue n'est pas l'anglais
        
        # Construire le second prompt (pour la catégorisation)
        prompt2 = f"""
        You are a classification assistant. Your job is to decide which single category from the list below best corresponds to the assistant description that follows.

        Return **only** the full label of the chosen category (copy-paste exactly as written), with no numbering, explanation, or other text.

        Categories:
        1. Conversational Style (Character)
        2. Task-specific Assistant
        3. Professional Expertise (lawyer, doctor, etc.)
        4. Translation / Specialized Rewriting
        5. Enterprise Chatbot (Internal Knowledge)

        Assistant description:
        \"\"\"{request.purpose}\"\"\"
        """
        
        # Obtenir la catégorie (avec await)
        fine_tuning_category_raw = await provider.generate_completion(prompt2)
        fine_tuning_category = fine_tuning_category_raw.strip().strip('"').strip()
        
        # Déterminer le nombre minimum de caractères recommandé
        min_characters_map = {
            "Conversational Style (Character)": 15000,
            "Task-specific Assistant": 20000,
            "Professional Expertise (lawyer, doctor, etc.)": 40000,
            "Translation / Specialized Rewriting": 100000,
            "Enterprise Chatbot (Internal Knowledge)": 15000
        }
        min_characters_recommended = min_characters_map.get(fine_tuning_category, 20000)
        
        return {
            "system_content": system_content,
            "fine_tuning_category": fine_tuning_category,
            "min_characters_recommended": min_characters_recommended
        }
        
    except Exception as e:
        # Log l'erreur pour le débogage
        logger.error(f"Erreur lors de la génération du system content: {e}", exc_info=True)
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
    
    # Déterminer le fournisseur et le modèle à utiliser
    provider = "openai"  # Par défaut
    model_to_use = request_data.model_id
    fine_tuning_record = None
    
    # Vérifier si c'est un ID externe de modèle fine-tuné (commence par "ft:")
    if isinstance(request_data.model_id, str) and request_data.model_id.startswith("ft:"):
        # C'est un ID externe d'OpenAI, on l'utilise directement
        provider = "openai"  # Pour l'instant c'est uniquement OpenAI qui a ce format
        model_to_use = request_data.model_id
        logger.info(f"Utilisation du modèle fine-tuné OpenAI externe: {model_to_use}")
    else:
        # Essayer de voir si model_id est un ID numérique de fine-tuning interne
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
                model_to_use = fine_tuning_record.fine_tuned_model  # Utiliser l'ID externe du modèle FT
                logger.info(f"Utilisation du modèle fine-tuné interne: {model_to_use} (Provider: {provider})")
            else:
                # Si l'ID est numérique mais ne correspond à aucun FT de l'utilisateur, c'est une erreur
                 raise HTTPException(status_code=404, detail=f"Modèle fine-tuné avec ID {ft_id} non trouvé.")
                 
        except ValueError:
            # Si ce n'est pas un entier ni un "ft:", c'est un ID de modèle standard (ex: 'gpt-4o')
            provider = "openai"  # Assume OpenAI par défaut pour les modèles standards
            model_to_use = request_data.model_id 
            logger.info(f"Utilisation du modèle standard: {model_to_use} (Provider: {provider})")

    # Récupérer la clé API pour le provider déterminé
    api_key_record = db.query(ApiKey).filter(
        ApiKey.user_id == current_user.id,
        ApiKey.provider == provider
    ).first()

    if not api_key_record:
        raise HTTPException(status_code=401, detail=f"Clé API pour {provider} non trouvée.")

    # Appeler le service AI Provider via la factory
    try:
        # Obtenir l'instance du provider
        provider_instance = get_ai_provider(
            provider_name=provider, 
            api_key=api_key_record.key
        )
        
        # Appeler la méthode sur l'instance
        completion = await provider_instance.generate_completion(
            model=model_to_use, 
            prompt=request_data.prompt,
            system_prompt=request_data.system_message
        )
        
        if completion is None:
            raise HTTPException(status_code=500, detail="Échec de l'obtention de la complétion.")
            
        return CompletionResponse(response=completion)

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Erreur API {provider} pour modèle {model_to_use}: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail=f"Erreur communication avec l'API {provider}: {str(e)}") 