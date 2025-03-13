from loguru import logger
from typing import Dict, Any, Optional, List
import os
import json
from openai import OpenAI

from app.core.config import settings

class AIProviderBase:
    """Base class for AI providers."""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    def validate_key(self) -> bool:
        """Validate the API key."""
        raise NotImplementedError
    
    def start_fine_tuning(self, dataset_path: str, model: str, hyperparameters: Dict[str, Any]) -> Dict[str, Any]:
        """Start a fine-tuning job."""
        raise NotImplementedError
    
    def get_fine_tuning_status(self, job_id: str) -> Dict[str, Any]:
        """Get the status of a fine-tuning job."""
        raise NotImplementedError
    
    def cancel_fine_tuning(self, job_id: str) -> Dict[str, Any]:
        """Cancel a fine-tuning job."""
        raise NotImplementedError
    
    def generate_completion(self, prompt: str, model: str) -> str:
        """Generate a completion for a prompt."""
        raise NotImplementedError

class OpenAIProvider(AIProviderBase):
    """OpenAI provider implementation."""
    
    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.client = OpenAI(api_key=api_key)
    
    def validate_key(self) -> bool:
        """Validate the OpenAI API key."""
        try:
            # In a real implementation, this would make a test API call
            return self.api_key.startswith("sk-")
        except Exception as e:
            logger.error(f"Error validating OpenAI API key: {str(e)}")
            return False
    
    def start_fine_tuning(self, dataset_path: str, model: str, hyperparameters: Dict[str, Any]) -> Dict[str, Any]:
        """Start a fine-tuning job with OpenAI."""
        # In a real implementation, this would call the OpenAI API
        logger.info(f"Starting OpenAI fine-tuning for model {model}")
        return {
            "status": "success",
            "job_id": "ft-mock-123456",
            "model": model,
        }
    
    def get_fine_tuning_status(self, job_id: str) -> Dict[str, Any]:
        """Get the status of an OpenAI fine-tuning job."""
        # In a real implementation, this would call the OpenAI API
        logger.info(f"Getting status for OpenAI fine-tuning job {job_id}")
        return {
            "status": "running",
            "progress": 50,
        }
    
    def cancel_fine_tuning(self, job_id: str) -> Dict[str, Any]:
        """Cancel an OpenAI fine-tuning job."""
        # In a real implementation, this would call the OpenAI API
        logger.info(f"Cancelling OpenAI fine-tuning job {job_id}")
        return {
            "status": "cancelled",
        }
    
    def generate_completion(self, prompt: str, model: str = "gpt-4o-mini") -> str:
        """Generate a completion for a prompt using OpenAI."""
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error generating completion with OpenAI: {str(e)}")
            raise e
    
    def generate_qa_pairs(self, chunk_text: str, model: str = "gpt-4o-mini") -> List[Dict]:
        """
        Generates question-answer pairs from a text chunk using OpenAI.
        Returns a list of dictionaries with question and answer keys.
        """
        try:
            prompt = (
                "À partir du texte suivant, génère plusieurs paires de questions-réponses pertinentes "
                "au format JSON pour le fine-tuning. Chaque paire doit être dans un objet JSON distinct. "
                "Les questions doivent être variées et représentatives du contenu, et les réponses doivent "
                "être détaillées et dans le style de l'auteur du texte.\n\n"
                "Format exact à respecter pour chaque objet JSON (un par ligne) :\n\n"
                '{"messages": [\n'
                '  {"role": "system", "content": "Vous êtes un assistant qui génère du contenu dans le style de l\'auteur"},\n'
                '  {"role": "user", "content": "<QUESTION GÉNÉRÉE À PARTIR DU TEXTE>"},\n'
                '  {"role": "assistant", "content": "<RÉPONSE DÉTAILLÉE DANS LE STYLE DE L\'AUTEUR>"}\n'
                "]}\n\n"
                "Texte source :\n\n"
                f"{chunk_text}\n\n"
                "Génère au moins 5 paires de questions-réponses différentes à partir de ce texte. "
                "Assure-toi que les questions sont variées (questions ouvertes, fermées, demandes d'opinion, etc.) "
                "et que les réponses sont détaillées et reflètent le style et les idées du texte source.\n\n"
                "Le résultat doit être plusieurs objets JSON sur plusieurs lignes, sans markdown ni explications."
            )
            
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "Tu es un assistant expert en création de datasets pour le fine-tuning, capable de générer des paires de questions-réponses pertinentes."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
            )
            
            json_str = response.choices[0].message.content.strip()
            # Découpe la chaîne en plusieurs lignes
            json_lines = json_str.split("\n")
            parsed_objects = []
            for line in json_lines:
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                    parsed_objects.append(obj)
                except Exception as parse_e:
                    logger.error(f"Impossible de parser la ligne: {line}")
                    logger.error(f"Erreur de parsing: {parse_e}")
            
            # Transformation au format de notre application
            qa_pairs = []
            for obj in parsed_objects:
                try:
                    messages = obj.get("messages", [])
                    user_message = next((m for m in messages if m.get("role") == "user"), None)
                    assistant_message = next((m for m in messages if m.get("role") == "assistant"), None)
                    
                    if user_message and assistant_message:
                        qa_pairs.append({
                            "question": user_message.get("content", ""),
                            "answer": assistant_message.get("content", "")
                        })
                except Exception as e:
                    logger.error(f"Erreur lors du traitement d'un objet: {str(e)}")
            
            return qa_pairs
        except Exception as e:
            logger.error(f"Error generating QA pairs with OpenAI: {str(e)}")
            raise e

class AnthropicProvider(AIProviderBase):
    """Anthropic provider implementation."""
    
    def validate_key(self) -> bool:
        """Validate the Anthropic API key."""
        try:
            # In a real implementation, this would make a test API call
            return self.api_key.startswith("sk-ant-")
        except Exception as e:
            logger.error(f"Error validating Anthropic API key: {str(e)}")
            return False
    
    def start_fine_tuning(self, dataset_path: str, model: str, hyperparameters: Dict[str, Any]) -> Dict[str, Any]:
        """Start a fine-tuning job with Anthropic."""
        # In a real implementation, this would call the Anthropic API
        logger.info(f"Starting Anthropic fine-tuning for model {model}")
        return {
            "status": "success",
            "job_id": "ft-ant-mock-123456",
            "model": model,
        }
    
    def get_fine_tuning_status(self, job_id: str) -> Dict[str, Any]:
        """Get the status of an Anthropic fine-tuning job."""
        # In a real implementation, this would call the Anthropic API
        logger.info(f"Getting status for Anthropic fine-tuning job {job_id}")
        return {
            "status": "running",
            "progress": 50,
        }
    
    def cancel_fine_tuning(self, job_id: str) -> Dict[str, Any]:
        """Cancel an Anthropic fine-tuning job."""
        # In a real implementation, this would call the Anthropic API
        logger.info(f"Cancelling Anthropic fine-tuning job {job_id}")
        return {
            "status": "cancelled",
        }
    
    def generate_completion(self, prompt: str, model: str) -> str:
        """Generate a completion for a prompt using Anthropic."""
        # In a real implementation, this would call the Anthropic API
        logger.info(f"Generating completion with Anthropic model {model}")
        return f"This is a mock response from Anthropic for prompt: {prompt[:30]}..."

class MistralProvider(AIProviderBase):
    """Mistral provider implementation."""
    
    def validate_key(self) -> bool:
        """Validate the Mistral API key."""
        try:
            # In a real implementation, this would make a test API call
            return len(self.api_key) > 10
        except Exception as e:
            logger.error(f"Error validating Mistral API key: {str(e)}")
            return False
    
    def start_fine_tuning(self, dataset_path: str, model: str, hyperparameters: Dict[str, Any]) -> Dict[str, Any]:
        """Start a fine-tuning job with Mistral."""
        # In a real implementation, this would call the Mistral API
        logger.info(f"Starting Mistral fine-tuning for model {model}")
        return {
            "status": "success",
            "job_id": "ft-mistral-mock-123456",
            "model": model,
        }
    
    def get_fine_tuning_status(self, job_id: str) -> Dict[str, Any]:
        """Get the status of a Mistral fine-tuning job."""
        # In a real implementation, this would call the Mistral API
        logger.info(f"Getting status for Mistral fine-tuning job {job_id}")
        return {
            "status": "running",
            "progress": 50,
        }
    
    def cancel_fine_tuning(self, job_id: str) -> Dict[str, Any]:
        """Cancel a Mistral fine-tuning job."""
        # In a real implementation, this would call the Mistral API
        logger.info(f"Cancelling Mistral fine-tuning job {job_id}")
        return {
            "status": "cancelled",
        }
    
    def generate_completion(self, prompt: str, model: str) -> str:
        """Generate a completion for a prompt using Mistral."""
        # In a real implementation, this would call the Mistral API
        logger.info(f"Generating completion with Mistral model {model}")
        return f"This is a mock response from Mistral for prompt: {prompt[:30]}..."

def get_ai_provider(provider_name: str, api_key: Optional[str] = None) -> AIProviderBase:
    """
    Get an AI provider instance.
    
    Args:
        provider_name: The name of the provider (openai, anthropic, mistral)
        api_key: The API key for the provider. If not provided, it will be loaded from environment variables.
    
    Returns:
        An instance of the AI provider.
    """
    if provider_name == "openai":
        key = api_key or os.getenv("OPENAI_API_KEY", "")
        return OpenAIProvider(key)
    elif provider_name == "anthropic":
        key = api_key or os.getenv("ANTHROPIC_API_KEY", "")
        return AnthropicProvider(key)
    elif provider_name == "mistral":
        key = api_key or os.getenv("MISTRAL_API_KEY", "")
        return MistralProvider(key)
    else:
        raise ValueError(f"Unknown AI provider: {provider_name}") 