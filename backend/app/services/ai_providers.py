from loguru import logger
from typing import Dict, Any, Optional, List
import os
import json
from openai import OpenAI
import anthropic
import requests

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
            # Make a low-cost API call to verify the key
            self.client.models.list(limit=1)
            return True
        except Exception as e:
            logger.error(f"Error validating OpenAI API key: {str(e)}")
            return False
    
    def start_fine_tuning(self, dataset_path: str, model: str, hyperparameters: Dict[str, Any]) -> Dict[str, Any]:
        """Start a fine-tuning job with OpenAI."""
        try:
            # Create a fine-tuning job
            response = self.client.fine_tuning.jobs.create(
                training_file=dataset_path,
                model=model,
                hyperparameters=hyperparameters
            )
            
            logger.info(f"Started OpenAI fine-tuning job: {response.id}")
            
            return {
                "status": "success",
                "job_id": response.id,
                "model": model,
                "details": {
                    "created_at": response.created_at,
                    "status": response.status
                }
            }
            
        except Exception as e:
            logger.error(f"Error starting OpenAI fine-tuning: {str(e)}")
            raise e
    
    def get_fine_tuning_status(self, job_id: str) -> Dict[str, Any]:
        """Get the status of an OpenAI fine-tuning job."""
        try:
            # Retrieve the fine-tuning job
            response = self.client.fine_tuning.jobs.retrieve(job_id)
            
            progress = 0
            if response.status == "succeeded":
                progress = 100
            elif response.status == "running" and response.training_metrics:
                # Calculate approximate progress from training metrics
                if "step" in response.training_metrics and "total_steps" in response.training_metrics:
                    progress = min(99, int((response.training_metrics["step"] / response.training_metrics["total_steps"]) * 100))
            
            return {
                "status": response.status,
                "progress": progress,
                "details": {
                    "created_at": response.created_at,
                    "finished_at": response.finished_at,
                    "training_metrics": response.training_metrics
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting OpenAI fine-tuning status: {str(e)}")
            raise e
    
    def cancel_fine_tuning(self, job_id: str) -> Dict[str, Any]:
        """Cancel an OpenAI fine-tuning job."""
        try:
            # Cancel the fine-tuning job
            response = self.client.fine_tuning.jobs.cancel(job_id)
            
            return {
                "status": response.status,
                "details": {
                    "created_at": response.created_at,
                    "finished_at": response.finished_at
                }
            }
            
        except Exception as e:
            logger.error(f"Error cancelling OpenAI fine-tuning: {str(e)}")
            raise e
    
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
                "Create 5 question-answer pairs from the following text chunk. "
                "The questions should be diverse and cover different aspects of the text. "
                "The answers should be comprehensive and accurate based on the information provided. "
                "Format your response as a JSON array with objects containing 'question' and 'answer' fields.\n\n"
                f"Text chunk: {chunk_text}"
            )
            
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are an expert in creating high-quality training data for fine-tuning language models."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            # Parse JSON from response
            content = response.choices[0].message.content
            data = json.loads(content)
            
            # Ensure data has the expected format
            if "pairs" in data:
                return data["pairs"]
            elif isinstance(data, list):
                return data
            elif isinstance(data, dict) and all(k in data for k in ["question", "answer"]):
                return [data]
            else:
                # Try to extract qa_pairs or similar key
                for key in data:
                    if isinstance(data[key], list) and len(data[key]) > 0:
                        return data[key]
                
                # Fallback to empty list if no valid data
                logger.warning(f"Unexpected response format: {data}")
                return []
                
        except Exception as e:
            logger.error(f"Error generating QA pairs with OpenAI: {str(e)}")
            logger.error(f"Chunk text (truncated): {chunk_text[:100]}...")
            return []
            
    def upload_training_file(self, file_path: str) -> str:
        """
        Upload a training file to OpenAI and return the file ID.
        """
        try:
            with open(file_path, 'rb') as file:
                response = self.client.files.create(
                    file=file,
                    purpose="fine-tune"
                )
                
            return response.id
            
        except Exception as e:
            logger.error(f"Error uploading training file to OpenAI: {str(e)}")
            raise e
            
    def prepare_training_file(self, qa_pairs: List[Dict], output_path: str) -> str:
        """
        Prepare a JSONL training file for OpenAI fine-tuning.
        """
        try:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, 'w') as f:
                for pair in qa_pairs:
                    # Format as per OpenAI's fine-tuning format
                    training_example = {
                        "messages": [
                            {"role": "system", "content": "You are a helpful assistant."},
                            {"role": "user", "content": pair["question"]},
                            {"role": "assistant", "content": pair["answer"]}
                        ]
                    }
                    f.write(json.dumps(training_example) + '\n')
                    
            return output_path
            
        except Exception as e:
            logger.error(f"Error preparing training file: {str(e)}")
            raise e

class AnthropicProvider(AIProviderBase):
    """Anthropic provider implementation."""
    
    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.client = anthropic.Anthropic(api_key=api_key)
    
    def validate_key(self) -> bool:
        """Validate the Anthropic API key."""
        try:
            # Make a minimal API call to validate the key
            self.client.models.list()
            return True
        except Exception as e:
            logger.error(f"Error validating Anthropic API key: {str(e)}")
            return False
    
    def start_fine_tuning(self, dataset_path: str, model: str, hyperparameters: Dict[str, Any]) -> Dict[str, Any]:
        """Start a fine-tuning job with Anthropic."""
        try:
            # Create a fine-tuning job
            response = self.client.fine_tuning.create(
                model=model,
                training_file=dataset_path,
                hyperparameters=hyperparameters
            )
            
            logger.info(f"Started Anthropic fine-tuning job: {response.id}")
            
            return {
                "status": "success",
                "job_id": response.id,
                "model": model,
                "details": {
                    "created_at": response.created_at,
                    "status": response.status
                }
            }
            
        except Exception as e:
            logger.error(f"Error starting Anthropic fine-tuning: {str(e)}")
            raise e
    
    def get_fine_tuning_status(self, job_id: str) -> Dict[str, Any]:
        """Get the status of an Anthropic fine-tuning job."""
        try:
            # Retrieve the fine-tuning job
            response = self.client.fine_tuning.retrieve(job_id)
            
            # Map Anthropic status to general status
            status_map = {
                "created": "preparing",
                "running": "running",
                "succeeded": "succeeded",
                "failed": "failed",
                "cancelled": "cancelled"
            }
            
            # Calculate progress based on status
            progress = 0
            if response.status == "succeeded":
                progress = 100
            elif response.status == "running" and hasattr(response, "completion_percentage"):
                progress = response.completion_percentage
            elif response.status == "running":
                progress = 50  # Default progress if no specific indicator
            
            return {
                "status": status_map.get(response.status, response.status),
                "progress": progress,
                "details": {
                    "created_at": response.created_at,
                    "finished_at": response.finished_at if hasattr(response, "finished_at") else None,
                    "training_metrics": response.train_loss if hasattr(response, "train_loss") else None,
                    "error": response.failure_reason if hasattr(response, "failure_reason") else None
                },
                "fine_tuned_model": response.fine_tuned_model if hasattr(response, "fine_tuned_model") else None
            }
            
        except Exception as e:
            logger.error(f"Error getting Anthropic fine-tuning status: {str(e)}")
            raise e
    
    def cancel_fine_tuning(self, job_id: str) -> Dict[str, Any]:
        """Cancel an Anthropic fine-tuning job."""
        try:
            # Cancel the fine-tuning job
            response = self.client.fine_tuning.cancel(job_id)
            
            return {
                "status": "cancelled",
                "details": {
                    "created_at": response.created_at if hasattr(response, "created_at") else None,
                    "finished_at": response.finished_at if hasattr(response, "finished_at") else None
                }
            }
            
        except Exception as e:
            logger.error(f"Error cancelling Anthropic fine-tuning: {str(e)}")
            raise e
    
    def generate_completion(self, prompt: str, model: str = "claude-3-sonnet-20240229") -> str:
        """Generate a completion for a prompt using Anthropic."""
        try:
            response = self.client.messages.create(
                model=model,
                max_tokens=1024,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
            )
            return response.content[0].text
        except Exception as e:
            logger.error(f"Error generating completion with Anthropic: {str(e)}")
            raise e
    
    def generate_qa_pairs(self, chunk_text: str, model: str = "claude-3-sonnet-20240229") -> List[Dict]:
        """
        Generates question-answer pairs from a text chunk using Anthropic.
        """
        try:
            prompt = (
                "Create 5 question-answer pairs from the following text chunk. "
                "The questions should be diverse and cover different aspects of the text. "
                "The answers should be comprehensive and accurate based on the information provided. "
                "Format your response as a JSON array with objects containing 'question' and 'answer' fields.\n\n"
                f"Text chunk: {chunk_text}"
            )
            
            response = self.client.messages.create(
                model=model,
                max_tokens=1500,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
            )
            
            # Parse JSON from response
            content = response.content[0].text
            
            # Extract JSON from the response
            try:
                # Try to find JSON object in the response
                json_start = content.find('[')
                json_end = content.rfind(']') + 1
                
                if json_start >= 0 and json_end > json_start:
                    json_str = content[json_start:json_end]
                    data = json.loads(json_str)
                    return data
                else:
                    # If not found, try parsing the entire response
                    data = json.loads(content)
                    
                    # Handle different response formats
                    if isinstance(data, list):
                        return data
                    elif isinstance(data, dict) and "pairs" in data:
                        return data["pairs"]
                    else:
                        logger.warning(f"Unexpected response format: {data}")
                        return []
            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON from Anthropic response")
                return []
                
        except Exception as e:
            logger.error(f"Error generating QA pairs with Anthropic: {str(e)}")
            return []
            
    def upload_training_file(self, file_path: str) -> str:
        """
        Upload a training file to Anthropic and return the file ID.
        Note: Anthropic may have a different file upload mechanism.
        """
        try:
            with open(file_path, 'rb') as file:
                response = self.client.files.create(
                    file=file,
                    purpose="fine-tune"
                )
                
            return response.id
            
        except Exception as e:
            logger.error(f"Error uploading training file to Anthropic: {str(e)}")
            raise e
            
    def prepare_training_file(self, qa_pairs: List[Dict], output_path: str) -> str:
        """
        Prepare a JSONL training file for Anthropic fine-tuning.
        """
        try:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, 'w') as f:
                for pair in qa_pairs:
                    # Format as per Anthropic's fine-tuning format
                    training_example = {
                        "messages": [
                            {"role": "user", "content": pair["question"]},
                            {"role": "assistant", "content": pair["answer"]}
                        ]
                    }
                    f.write(json.dumps(training_example) + '\n')
                    
            return output_path
            
        except Exception as e:
            logger.error(f"Error preparing training file for Anthropic: {str(e)}")
            raise e

class MistralProvider(AIProviderBase):
    """Mistral AI provider implementation."""
    
    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.base_url = "https://api.mistral.ai/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def validate_key(self) -> bool:
        """Validate the Mistral API key."""
        try:
            # Make a test API call
            response = requests.get(
                f"{self.base_url}/models",
                headers=self.headers
            )
            response.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"Error validating Mistral API key: {str(e)}")
            return False
    
    def start_fine_tuning(self, dataset_path: str, model: str, hyperparameters: Dict[str, Any]) -> Dict[str, Any]:
        """Start a fine-tuning job with Mistral."""
        try:
            # Create a fine-tuning job
            payload = {
                "training_file": dataset_path,
                "model": model,
                **hyperparameters
            }
            
            response = requests.post(
                f"{self.base_url}/fine-tuning",
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            response_data = response.json()
            
            job_id = response_data.get("id")
            logger.info(f"Started Mistral fine-tuning job: {job_id}")
            
            return {
                "status": "success",
                "job_id": job_id,
                "model": model,
                "details": response_data
            }
            
        except Exception as e:
            logger.error(f"Error starting Mistral fine-tuning: {str(e)}")
            raise e
    
    def get_fine_tuning_status(self, job_id: str) -> Dict[str, Any]:
        """Get the status of a Mistral fine-tuning job."""
        try:
            # Retrieve the fine-tuning job
            response = requests.get(
                f"{self.base_url}/fine-tuning/{job_id}",
                headers=self.headers
            )
            response.raise_for_status()
            response_data = response.json()
            
            status = response_data.get("status", "")
            
            # Calculate progress
            progress = 0
            if status == "finished":
                progress = 100
            elif status == "running":
                # Try to get progress details if available
                if "progress" in response_data:
                    progress = response_data["progress"]
                else:
                    progress = 50  # Default if no specific value
            
            return {
                "status": status,
                "progress": progress,
                "details": response_data,
                "fine_tuned_model": response_data.get("fine_tuned_model", "")
            }
            
        except Exception as e:
            logger.error(f"Error getting Mistral fine-tuning status: {str(e)}")
            raise e
    
    def cancel_fine_tuning(self, job_id: str) -> Dict[str, Any]:
        """Cancel a Mistral fine-tuning job."""
        try:
            # Cancel the fine-tuning job
            response = requests.post(
                f"{self.base_url}/fine-tuning/{job_id}/cancel",
                headers=self.headers
            )
            response.raise_for_status()
            response_data = response.json()
            
            return {
                "status": "cancelled",
                "details": response_data
            }
            
        except Exception as e:
            logger.error(f"Error cancelling Mistral fine-tuning: {str(e)}")
            raise e
    
    def generate_completion(self, prompt: str, model: str = "mistral-large-latest") -> str:
        """Generate a completion for a prompt using Mistral."""
        try:
            payload = {
                "model": model,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            response_data = response.json()
            
            return response_data["choices"][0]["message"]["content"]
            
        except Exception as e:
            logger.error(f"Error generating completion with Mistral: {str(e)}")
            raise e
    
    def generate_qa_pairs(self, chunk_text: str, model: str = "mistral-large-latest") -> List[Dict]:
        """
        Generates question-answer pairs from a text chunk using Mistral.
        """
        try:
            prompt = (
                "Create 5 question-answer pairs from the following text chunk. "
                "The questions should be diverse and cover different aspects of the text. "
                "The answers should be comprehensive and accurate based on the information provided. "
                "Format your response as a JSON array with objects containing 'question' and 'answer' fields.\n\n"
                f"Text chunk: {chunk_text}"
            )
            
            payload = {
                "model": model,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "response_format": {"type": "json_object"}
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            response_data = response.json()
            
            # Parse JSON from response
            content = response_data["choices"][0]["message"]["content"]
            
            try:
                data = json.loads(content)
                
                # Handle different response formats
                if "pairs" in data:
                    return data["pairs"]
                elif isinstance(data, list):
                    return data
                elif all(k in data for k in ["question", "answer"]):
                    return [data]
                else:
                    # Try to find any array in the response
                    for key in data:
                        if isinstance(data[key], list) and len(data[key]) > 0:
                            return data[key]
                    
                    logger.warning(f"Unexpected response format: {data}")
                    return []
                    
            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON from Mistral response")
                return []
                
        except Exception as e:
            logger.error(f"Error generating QA pairs with Mistral: {str(e)}")
            return []
            
    def upload_training_file(self, file_path: str) -> str:
        """
        Upload a training file to Mistral and return the file ID.
        """
        try:
            with open(file_path, 'rb') as file:
                files = {
                    'file': file,
                    'purpose': (None, 'fine-tune')
                }
                
                response = requests.post(
                    f"{self.base_url}/files",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    files=files
                )
                response.raise_for_status()
                response_data = response.json()
                
            return response_data["id"]
            
        except Exception as e:
            logger.error(f"Error uploading training file to Mistral: {str(e)}")
            raise e
            
    def prepare_training_file(self, qa_pairs: List[Dict], output_path: str) -> str:
        """
        Prepare a JSONL training file for Mistral fine-tuning.
        """
        try:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, 'w') as f:
                for pair in qa_pairs:
                    # Format as per Mistral's fine-tuning format
                    training_example = {
                        "messages": [
                            {"role": "user", "content": pair["question"]},
                            {"role": "assistant", "content": pair["answer"]}
                        ]
                    }
                    f.write(json.dumps(training_example) + '\n')
                    
            return output_path
            
        except Exception as e:
            logger.error(f"Error preparing training file for Mistral: {str(e)}")
            raise e

def get_ai_provider(provider_name: str, api_key: str = None) -> AIProviderBase:
    """
    Get an AI provider implementation based on the provider name.
    
    Args:
        provider_name: Name of the provider (openai, anthropic, mistral)
        api_key: Optional API key to use (if not provided, the key from settings will be used)
        
    Returns:
        An AIProviderBase implementation
    """
    if provider_name == "openai":
        return OpenAIProvider(api_key or settings.OPENAI_API_KEY)
    elif provider_name == "anthropic":
        return AnthropicProvider(api_key or settings.ANTHROPIC_API_KEY)
    elif provider_name == "mistral":
        return MistralProvider(api_key or settings.MISTRAL_API_KEY)
    else:
        raise ValueError(f"Unsupported AI provider: {provider_name}") 