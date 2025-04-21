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
    
    def start_fine_tuning(self, dataset_path: str, model: str, hyperparameters: Dict[str, Any], suffix: str = None) -> Dict[str, Any]:
        """Start a fine-tuning job."""
        raise NotImplementedError
    
    def get_fine_tuning_status(self, job_id: str) -> Dict[str, Any]:
        """Get the status of a fine-tuning job."""
        raise NotImplementedError
    
    def cancel_fine_tuning(self, job_id: str) -> Dict[str, Any]:
        """Cancel a fine-tuning job."""
        raise NotImplementedError
    
    async def generate_completion(self, prompt: str, model: str) -> str:
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
            self.client.models.list()
            return True
        except Exception as e:
            logger.error(f"Error validating OpenAI API key: {str(e)}")
            return False
    
    def start_fine_tuning(self, dataset_path: str, model: str, hyperparameters: Dict[str, Any], suffix: str = None) -> Dict[str, Any]:
        """Start a fine-tuning job with OpenAI."""
        try:
            # Préparer les paramètres de la requête
            request_params = {
                "training_file": dataset_path,
                "model": model,
                "hyperparameters": hyperparameters
            }
            
            # Ajouter le suffixe du modèle s'il est fourni
            if suffix:
                request_params["suffix"] = suffix
                logger.info(f"Using model suffix: {suffix}")
            
            # Create a fine-tuning job
            response = self.client.fine_tuning.jobs.create(**request_params)
            
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
            details = {}
            # Vérifier si le job est terminé et a un ID de fichier de résultats
            if response.result_files and response.status == "succeeded":
                progress = 100
                try:
                    # Essayer de récupérer le contenu du fichier de métriques
                    metrics_file_id = response.result_files[0] # Suppose que le premier est le fichier de métriques
                    metrics_content = self.client.files.content(metrics_file_id).read()
                    # Les métriques sont souvent ligne par ligne JSON, essayons de parser
                    metrics_data = []
                    for line in metrics_content.decode('utf-8').splitlines():
                        if line.strip():
                            metrics_data.append(json.loads(line))
                    details["training_metrics"] = metrics_data
                    # Essayer d'extraire la dernière étape si possible
                    if metrics_data:
                        last_metric = metrics_data[-1]
                        details["last_step_metrics"] = last_metric
                        # Si total_steps est disponible, calculer la progression
                        # Note: OpenAI ne fournit plus total_steps de manière fiable
                        if 'step' in last_metric and response.trained_tokens:
                            # Approximation basée sur les tokens si step seul
                            # Ceci est une heuristique, car total_steps n'est pas fourni
                             pass # Difficile de calculer sans total_steps
                except Exception as metrics_error:
                    logger.warning(f"Could not retrieve or parse metrics file for job {job_id}: {metrics_error}")
                    details["training_metrics"] = "Could not retrieve metrics"

            elif response.status == "running":
                # Approximation de la progression si en cours (difficile sans total_steps)
                progress = 50 # Valeur par défaut arbitraire si running
            elif response.status == "failed":
                details["error"] = response.error.message if response.error else "Unknown error"

            
            return {
                "status": response.status,
                "progress": progress,
                "details": details,
                "fine_tuned_model": response.fine_tuned_model # Le modèle fine-tuné ID
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
    
    async def generate_completion(self, prompt: str, model: str = "gpt-4o-mini", system_prompt: Optional[str] = None) -> str:
        """Generate a completion for a prompt using OpenAI."""
        try:
            effective_system_prompt = system_prompt if system_prompt else "You are a helpful assistant."
            
            # Supprimer `await` car self.client.chat.completions.create est synchrone
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": effective_system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7, 
                # max_tokens=1024 
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error generating completion with OpenAI: {str(e)}")
            raise e
    
    def generate_qa_pairs(self, chunk_text: str, model: str = "gpt-4o-mini", system_content: Optional[str] = None) -> List[Dict]:
        """Generate question-answer pairs from a text chunk using OpenAI."""
        try:
            system_prompt = """You are a training data creation assistant. 
Your task is to read a given text chunk and produce high-quality question-answer pairs that replicate 
the original style, tone, slang, vocabulary, and even spelling quirks. 

Important rules:
1. Do NOT sanitize or correct anything: if the text says "No biggi" or "Gimme a sec", keep it exactly like that.
2. Do NOT introduce any facts not present in the text.
4. If the texte use words that you don't know about, keep it
5. If the texte does not mean anything, keep it
6. If the text uses casual or "incorrect" grammar, keep it. If it uses comedic or childish language, keep it.
7. Return the result strictly as valid JSONl (an array of objects, each with "question" and "answer").
8. Include no extra commentary, explanation, or text outside the JSON.
9. You must produce between 2 and 20 Q&A pairs, no fewer and no more.
10. All the informations from text need to be in the Q&A pairs.
11. Use the language of the text to generate the Q&A pairs.

Each entry MUST follow this exact format:
   {"messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "QUESTION"}, {"role": "assistant", "content": "ANSWER"}]}

Here is an EXAMPLE of the desired style output (fictional sample to illustrate how to preserve style):

EXAMPLE Q&A:

{"messages": [{"role": "system", "content": ""}, {"role": "user", "content": "Yo, did you see that giant robot stomping around the city? "}, {"role": "assistant", "content": "It was crashin' through buildings like a bulldozer on steroids, man! "}]},

Notice how we kept the casual/familiar language exactly as is, with no corrections."""
            
            effective_system_content = system_content or "No specific training goal provided."

            user_prompt = f"""Please read the following text chunk:

{chunk_text}

This text was provided in order to train an AI on this goal: "{effective_system_content}"
Based on this text, generate between 2 and 20 question-answer pairs. 
Each pair should appear as an object with "question" and "answer" fields. 
Each entry MUST follow this exact format: {{"messages": [{{"role": "system", "content": ""}}, {{"role": "user", "content": "QUESTION"}}, {{"role": "assistant", "content": "ANSWER"}}]}} The style, tone, and vocabulary should precisely match the way it appears in the text (including slang, jokes, unusual grammar, unusual words etc.). 
Do not add any information not found in the text. 
Your response must be a valid JSONl array (with no additional text outside of it).
IMPORTANT: Each JSON object must be on its own line, and each line must be a complete, valid JSON object."""
            
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7
            )
            
            # Extraire le contenu de la réponse
            content = response.choices[0].message.content
            
            # Ajouter un log pour voir la réponse brute
            logger.debug(f"Raw response from OpenAI: {content[:500]}...")
            
            # Nettoyer le contenu avant traitement
            # 1. Supprimer les délimiteurs de bloc de code
            if "```json" in content or "```" in content:
                import re
                json_content = re.search(r'```(?:json)?\n([\s\S]*?)\n```', content)
                if json_content:
                    content = json_content.group(1)
                    logger.debug(f"Extracted JSON content: {content[:500]}...")
            
            # 2. Supprimer tout texte explicatif avant/après le JSON
            if content.strip().startswith('[') and ']' in content:
                array_end = content.rindex(']')
                content = content[:array_end+1]
            
            # 3. Essayer plusieurs approches de parsing
            qa_pairs = []
            
            # Approche 1: Parser comme un tableau JSON complet
            if content.strip().startswith('[') and content.strip().endswith(']'):
                try:
                    array_data = json.loads(content)
                    logger.info(f"Successfully parsed content as a JSON array with {len(array_data)} items")
                    
                    for item in array_data:
                        if isinstance(item, dict):
                            if 'messages' in item:
                                # Format ChatML
                                messages = item['messages']
                                user_msg = next((m for m in messages if m['role'] == 'user'), None)
                                assistant_msg = next((m for m in messages if m['role'] == 'assistant'), None)
                                
                                if user_msg and assistant_msg:
                                    qa_pairs.append({
                                        'question': user_msg['content'],
                                        'answer': assistant_msg['content']
                                    })
                            elif 'question' in item and 'answer' in item:
                                # Format direct Q&A
                                qa_pairs.append({
                                    'question': item['question'],
                                    'answer': item['answer']
                                })
                    
                    if qa_pairs:
                        logger.info(f"Successfully extracted {len(qa_pairs)} QA pairs from JSON array")
                        return qa_pairs
                except json.JSONDecodeError as e:
                    logger.warning(f"Failed to parse response as JSON array: {str(e)}")
            
            # Approche 2: Parser ligne par ligne pour JSONL
            lines = [line.strip() for line in content.split('\n') if line.strip() 
                    and not line.strip().startswith('```') 
                    and not line.strip().startswith('#')]
            
            for line in lines:
                # Essayer de trouver un objet JSON valide dans cette ligne
                try:
                    # Rechercher des accolades de début et de fin dans la ligne
                    start_idx = line.find('{')
                    end_idx = line.rfind('}')
                    
                    if start_idx != -1 and end_idx != -1 and start_idx < end_idx:
                        json_obj = line[start_idx:end_idx+1]
                        data = json.loads(json_obj)
                        
                        # Vérifier le format
                        if 'messages' in data:
                            messages = data['messages']
                            user_msg = next((m for m in messages if m['role'] == 'user'), None)
                            assistant_msg = next((m for m in messages if m['role'] == 'assistant'), None)
                            
                            if user_msg and assistant_msg:
                                qa_pairs.append({
                                    'question': user_msg['content'],
                                    'answer': assistant_msg['content']
                                })
                        elif 'question' in data and 'answer' in data:
                            qa_pairs.append({
                                'question': data['question'],
                                'answer': data['answer']
                            })
                except (json.JSONDecodeError, ValueError) as e:
                    # Ignorer les lignes qui ne sont pas du JSON valide
                    logger.debug(f"Failed to parse line as JSON: {line[:50]}...")
                    continue
            
            # Approche 3: Parser en dernier recours avec des expressions régulières
            if not qa_pairs:
                logger.warning("Trying to extract Q&A pairs with regex as last resort")
                import re
                # Rechercher des objets messages avec question/réponse
                message_pattern = r'"messages"\s*:\s*\[\s*{.*?"role"\s*:\s*"user".*?"content"\s*:\s*"(.*?)".*?},\s*{.*?"role"\s*:\s*"assistant".*?"content"\s*:\s*"(.*?)".*?}\s*\]'
                matches = re.finditer(message_pattern, content, re.DOTALL)
                
                for match in matches:
                    question, answer = match.groups()
                    # Nettoyer les caractères d'échappement JSON
                    question = question.replace('\\"', '"').replace('\\\\', '\\')
                    answer = answer.replace('\\"', '"').replace('\\\\', '\\')
                    qa_pairs.append({
                        'question': question,
                        'answer': answer
                    })
            
            if not qa_pairs:
                logger.warning(f"No valid QA pairs found in response despite multiple parsing attempts. Content sample: {content[:200]}...")
            else:
                logger.info(f"Successfully extracted {len(qa_pairs)} QA pairs after multiple parsing attempts")
            
            return qa_pairs
                
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
            
    def prepare_training_file(self, qa_pairs: List[Dict], output_path: str, system_content: str = "You are a helpful assistant.") -> str:
        """
        Prepare a JSONL training file for OpenAI fine-tuning.
        """
        try:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, 'w') as f:
                for pair in qa_pairs:
                    # Format en ChatML pour OpenAI
                    training_example = {
                        "messages": [
                            {"role": "system", "content": system_content},
                            {"role": "user", "content": pair["question"]},
                            {"role": "assistant", "content": pair["answer"]}
                        ]
                    }
                    f.write(json.dumps(training_example, ensure_ascii=False) + '\n')
                    
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
    
    def start_fine_tuning(self, dataset_path: str, model: str, hyperparameters: Dict[str, Any], suffix: str = None) -> Dict[str, Any]:
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
    
    def generate_qa_pairs(self, chunk_text: str, model: str = "claude-3-sonnet-20240229", system_content: Optional[str] = None) -> List[Dict]:
        """
        Generates question-answer pairs from a text chunk using Anthropic.
        """
        try:
            system_prompt = """You are a training data creation assistant. 
Your task is to read a given text chunk and produce high-quality question-answer pairs that replicate 
the original style, tone, slang, vocabulary, and even spelling quirks. 

Important rules:
1. Do NOT sanitize or correct anything: if the text says "No biggi" or "Gimme a sec", keep it exactly like that.
2. Do NOT introduce any facts not present in the text.
4. If the texte use words that you don't know about, keep it
5. If the texte does not mean anything, keep it
6. If the text uses casual or "incorrect" grammar, keep it. If it uses comedic or childish language, keep it.
7. Return the result strictly as valid JSONl (an array of objects, each with "question" and "answer").
8. Include no extra commentary, explanation, or text outside the JSON.
9. You must produce between 2 and 15 Q&A pairs, no fewer and no more.
10. Use the language of the text to generate the Q&A pairs.

Each entry MUST follow this exact format:
   {"messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "QUESTION"}, {"role": "assistant", "content": "ANSWER"}]}

Here is an EXAMPLE of the desired style output (fictional sample to illustrate how to preserve style):

EXAMPLE Q&A:

{"messages": [{"role": "system", "content": ""}, {"role": "user", "content": "Yo, did you see that giant robot stomping around the city? "}, {"role": "assistant", "content": "It was crashin' through buildings like a bulldozer on steroids, man! "}]},

Notice how we kept the casual/familiar language exactly as is, with no corrections."""
            
            effective_system_content = system_content or "No specific training goal provided."

            user_prompt = f"""Please read the following text chunk:

{chunk_text}

This text was provided in order to train an AI on this goal: "{effective_system_content}"
Based on this text, generate between 2 and 15 question-answer pairs. 
Each pair should appear as an object with "question" and "answer" fields. 
Each entry MUST follow this exact format: {{"messages": [{{"role": "system", "content": ""}}, {{"role": "user", "content": "QUESTION"}}, {{"role": "assistant", "content": "ANSWER"}}]}} The style, tone, and vocabulary should precisely match the way it appears in the text (including slang, jokes, unusual grammar, unusual words etc.). 
Do not add any information not found in the text. 
Your response must be a valid JSONl array (with no additional text outside of it).
IMPORTANT: Each JSON object must be on its own line, and each line must be a complete, valid JSON object."""
            
            response = self.client.messages.create(
                model=model,
                max_tokens=1500,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
            )
            
            # Extraire le contenu de la réponse
            content = response.content[0].text
            
            # Ajouter un log pour voir la réponse brute
            logger.debug(f"Raw response from Anthropic: {content[:500]}...")
            
            # Nettoyer le contenu avant traitement
            # 1. Supprimer les délimiteurs de bloc de code
            if "```json" in content or "```" in content:
                import re
                json_content = re.search(r'```(?:json)?\n([\s\S]*?)\n```', content)
                if json_content:
                    content = json_content.group(1)
                    logger.debug(f"Extracted JSON content: {content[:500]}...")
            
            # 2. Supprimer tout texte explicatif avant/après le JSON
            if content.strip().startswith('[') and ']' in content:
                array_end = content.rindex(']')
                content = content[:array_end+1]
            
            # 3. Essayer plusieurs approches de parsing
            qa_pairs = []
            
            # Approche 1: Parser comme un tableau JSON complet
            if content.strip().startswith('[') and content.strip().endswith(']'):
                try:
                    array_data = json.loads(content)
                    logger.info(f"Successfully parsed content as a JSON array with {len(array_data)} items")
                    
                    for item in array_data:
                        if isinstance(item, dict):
                            if 'messages' in item:
                                # Format ChatML
                                messages = item['messages']
                                user_msg = next((m for m in messages if m['role'] == 'user'), None)
                                assistant_msg = next((m for m in messages if m['role'] == 'assistant'), None)
                                
                                if user_msg and assistant_msg:
                                    qa_pairs.append({
                                        'question': user_msg['content'],
                                        'answer': assistant_msg['content']
                                    })
                            elif 'question' in item and 'answer' in item:
                                # Format direct Q&A
                                qa_pairs.append({
                                    'question': item['question'],
                                    'answer': item['answer']
                                })
                    
                    if qa_pairs:
                        logger.info(f"Successfully extracted {len(qa_pairs)} QA pairs from JSON array")
                        return qa_pairs
                except json.JSONDecodeError as e:
                    logger.warning(f"Failed to parse response as JSON array: {str(e)}")
            
            # Approche 2: Parser ligne par ligne pour JSONL
            lines = [line.strip() for line in content.split('\n') if line.strip() 
                    and not line.strip().startswith('```') 
                    and not line.strip().startswith('#')]
            
            for line in lines:
                # Essayer de trouver un objet JSON valide dans cette ligne
                try:
                    # Rechercher des accolades de début et de fin dans la ligne
                    start_idx = line.find('{')
                    end_idx = line.rfind('}')
                    
                    if start_idx != -1 and end_idx != -1 and start_idx < end_idx:
                        json_obj = line[start_idx:end_idx+1]
                        data = json.loads(json_obj)
                        
                        # Vérifier le format
                        if 'messages' in data:
                            messages = data['messages']
                            user_msg = next((m for m in messages if m['role'] == 'user'), None)
                            assistant_msg = next((m for m in messages if m['role'] == 'assistant'), None)
                            
                            if user_msg and assistant_msg:
                                qa_pairs.append({
                                    'question': user_msg['content'],
                                    'answer': assistant_msg['content']
                                })
                        elif 'question' in data and 'answer' in data:
                            qa_pairs.append({
                                'question': data['question'],
                                'answer': data['answer']
                            })
                except (json.JSONDecodeError, ValueError) as e:
                    # Ignorer les lignes qui ne sont pas du JSON valide
                    logger.debug(f"Failed to parse line as JSON: {line[:50]}...")
                    continue
            
            # Approche 3: Parser en dernier recours avec des expressions régulières
            if not qa_pairs:
                logger.warning("Trying to extract Q&A pairs with regex as last resort")
                import re
                # Rechercher des objets messages avec question/réponse
                message_pattern = r'"messages"\s*:\s*\[\s*{.*?"role"\s*:\s*"user".*?"content"\s*:\s*"(.*?)".*?},\s*{.*?"role"\s*:\s*"assistant".*?"content"\s*:\s*"(.*?)".*?}\s*\]'
                matches = re.finditer(message_pattern, content, re.DOTALL)
                
                for match in matches:
                    question, answer = match.groups()
                    # Nettoyer les caractères d'échappement JSON
                    question = question.replace('\\"', '"').replace('\\\\', '\\')
                    answer = answer.replace('\\"', '"').replace('\\\\', '\\')
                    qa_pairs.append({
                        'question': question,
                        'answer': answer
                    })
            
            if not qa_pairs:
                logger.warning(f"No valid QA pairs found in response despite multiple parsing attempts. Content sample: {content[:200]}...")
            else:
                logger.info(f"Successfully extracted {len(qa_pairs)} QA pairs after multiple parsing attempts")
            
            return qa_pairs
                
        except Exception as e:
            logger.error(f"Error generating QA pairs with Anthropic: {str(e)}")
            logger.error(f"Chunk text (truncated): {chunk_text[:100]}...")
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
            
    def prepare_training_file(self, qa_pairs: List[Dict], output_path: str, system_content: str = "You are a helpful assistant.") -> str:
        """
        Prepare a JSONL training file for Anthropic fine-tuning.
        """
        try:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, 'w') as f:
                for pair in qa_pairs:
                    # Format en ChatML
                    training_example = {
                        "messages": [
                            {"role": "system", "content": system_content},
                            {"role": "user", "content": pair["question"]},
                            {"role": "assistant", "content": pair["answer"]}
                        ]
                    }
                    f.write(json.dumps(training_example, ensure_ascii=False) + '\n')
                    
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
    
    def start_fine_tuning(self, dataset_path: str, model: str, hyperparameters: Dict[str, Any], suffix: str = None) -> Dict[str, Any]:
        """Start a fine-tuning job with Mistral."""
        try:
            # Create a fine-tuning job
            payload = {
                "training_file": dataset_path,
                "model": model,
                **hyperparameters
            }
            
            # Ajouter le suffixe du modèle s'il est fourni
            if suffix:
                payload["suffix"] = suffix
                logger.info(f"Using model suffix: {suffix}")
            
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
            
            # Appel synchrone avec requests
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
    
    def generate_qa_pairs(self, chunk_text: str, model: str = "mistral-large-latest", system_content: Optional[str] = None) -> List[Dict]:
        """
        Generates question-answer pairs from a text chunk using Mistral.
        """
        try:
            system_prompt = """You are a training data creation assistant. 
Your task is to read a given text chunk and produce high-quality question-answer pairs that replicate 
the original style, tone, slang, vocabulary, and even spelling quirks. 

Important rules:
1. Do NOT sanitize or correct anything: if the text says "No biggi" or "Gimme a sec", keep it exactly like that.
2. Do NOT introduce any facts not present in the text.
4. If the texte use words that you don't know about, keep it
5. If the texte does not mean anything, keep it
6. If the text uses casual or "incorrect" grammar, keep it. If it uses comedic or childish language, keep it.
7. Return the result strictly as valid JSONl (an array of objects, each with "question" and "answer").
8. Include no extra commentary, explanation, or text outside the JSON.
9. You must produce between 2 and 15 Q&A pairs, no fewer and no more.
10. Use the language of the text to generate the Q&A pairs.

Each entry MUST follow this exact format:
   {"messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "QUESTION"}, {"role": "assistant", "content": "ANSWER"}]}

Here is an EXAMPLE of the desired style output (fictional sample to illustrate how to preserve style):

EXAMPLE Q&A:

{"messages": [{"role": "system", "content": ""}, {"role": "user", "content": "Yo, did you see that giant robot stomping around the city? "}, {"role": "assistant", "content": "It was crashin' through buildings like a bulldozer on steroids, man! "}]},

Notice how we kept the casual/familiar language exactly as is, with no corrections."""
            
            effective_system_content = system_content or "No specific training goal provided."

            user_prompt = f"""Please read the following text chunk:

{chunk_text}

This text was provided in order to train an AI on this goal: "{effective_system_content}"
Based on this text, generate between 2 and 15 question-answer pairs. 
Each pair should appear as an object with "question" and "answer" fields. 
Each entry MUST follow this exact format: {{"messages": [{{"role": "system", "content": ""}}, {{"role": "user", "content": "QUESTION"}}, {{"role": "assistant", "content": "ANSWER"}}]}} The style, tone, and vocabulary should precisely match the way it appears in the text (including slang, jokes, unusual grammar, unusual words etc.). 
Do not add any information not found in the text. 
Your response must be a valid JSONl array (with no additional text outside of it).
IMPORTANT: Each JSON object must be on its own line, and each line must be a complete, valid JSON object."""
            
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.7
            }
            
            # Appel synchrone avec requests
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            response_data = response.json()
            
            # Extraire le contenu de la réponse
            content = response_data["choices"][0]["message"]["content"]
            
            # Ajouter un log pour voir la réponse brute
            logger.debug(f"Raw response from Mistral: {content[:500]}...")
            
            # Nettoyer le contenu avant traitement
            # 1. Supprimer les délimiteurs de bloc de code
            if "```json" in content or "```" in content:
                import re
                json_content = re.search(r'```(?:json)?\n([\s\S]*?)\n```', content)
                if json_content:
                    content = json_content.group(1)
                    logger.debug(f"Extracted JSON content: {content[:500]}...")
            
            # 2. Supprimer tout texte explicatif avant/après le JSON
            if content.strip().startswith('[') and ']' in content:
                array_end = content.rindex(']')
                content = content[:array_end+1]
            
            # 3. Essayer plusieurs approches de parsing
            qa_pairs = []
            
            # Approche 1: Parser comme un tableau JSON complet
            if content.strip().startswith('[') and content.strip().endswith(']'):
                try:
                    array_data = json.loads(content)
                    logger.info(f"Successfully parsed content as a JSON array with {len(array_data)} items")
                    
                    for item in array_data:
                        if isinstance(item, dict):
                            if 'messages' in item:
                                # Format ChatML
                                messages = item['messages']
                                user_msg = next((m for m in messages if m['role'] == 'user'), None)
                                assistant_msg = next((m for m in messages if m['role'] == 'assistant'), None)
                                
                                if user_msg and assistant_msg:
                                    qa_pairs.append({
                                        'question': user_msg['content'],
                                        'answer': assistant_msg['content']
                                    })
                            elif 'question' in item and 'answer' in item:
                                # Format direct Q&A
                                qa_pairs.append({
                                    'question': item['question'],
                                    'answer': item['answer']
                                })
                    
                    if qa_pairs:
                        logger.info(f"Successfully extracted {len(qa_pairs)} QA pairs from JSON array")
                        return qa_pairs
                except json.JSONDecodeError as e:
                    logger.warning(f"Failed to parse response as JSON array: {str(e)}")
            
            # Approche 2: Parser ligne par ligne pour JSONL
            lines = [line.strip() for line in content.split('\n') if line.strip() 
                    and not line.strip().startswith('```') 
                    and not line.strip().startswith('#')]
            
            for line in lines:
                # Essayer de trouver un objet JSON valide dans cette ligne
                try:
                    # Rechercher des accolades de début et de fin dans la ligne
                    start_idx = line.find('{')
                    end_idx = line.rfind('}')
                    
                    if start_idx != -1 and end_idx != -1 and start_idx < end_idx:
                        json_obj = line[start_idx:end_idx+1]
                        data = json.loads(json_obj)
                        
                        # Vérifier le format
                        if 'messages' in data:
                            messages = data['messages']
                            user_msg = next((m for m in messages if m['role'] == 'user'), None)
                            assistant_msg = next((m for m in messages if m['role'] == 'assistant'), None)
                            
                            if user_msg and assistant_msg:
                                qa_pairs.append({
                                    'question': user_msg['content'],
                                    'answer': assistant_msg['content']
                                })
                        elif 'question' in data and 'answer' in data:
                            qa_pairs.append({
                                'question': data['question'],
                                'answer': data['answer']
                            })
                except (json.JSONDecodeError, ValueError) as e:
                    # Ignorer les lignes qui ne sont pas du JSON valide
                    logger.debug(f"Failed to parse line as JSON: {line[:50]}...")
                    continue
            
            # Approche 3: Parser en dernier recours avec des expressions régulières
            if not qa_pairs:
                logger.warning("Trying to extract Q&A pairs with regex as last resort")
                import re
                # Rechercher des objets messages avec question/réponse
                message_pattern = r'"messages"\s*:\s*\[\s*{.*?"role"\s*:\s*"user".*?"content"\s*:\s*"(.*?)".*?},\s*{.*?"role"\s*:\s*"assistant".*?"content"\s*:\s*"(.*?)".*?}\s*\]'
                matches = re.finditer(message_pattern, content, re.DOTALL)
                
                for match in matches:
                    question, answer = match.groups()
                    # Nettoyer les caractères d'échappement JSON
                    question = question.replace('\\"', '"').replace('\\\\', '\\')
                    answer = answer.replace('\\"', '"').replace('\\\\', '\\')
                    qa_pairs.append({
                        'question': question,
                        'answer': answer
                    })
            
            if not qa_pairs:
                logger.warning(f"No valid QA pairs found in response despite multiple parsing attempts. Content sample: {content[:200]}...")
            else:
                logger.info(f"Successfully extracted {len(qa_pairs)} QA pairs after multiple parsing attempts")
            
            return qa_pairs
                
        except Exception as e:
            logger.error(f"Error generating QA pairs with Mistral: {str(e)}")
            logger.error(f"Chunk text (truncated): {chunk_text[:100]}...")
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
            
    def prepare_training_file(self, qa_pairs: List[Dict], output_path: str, system_content: str = "You are a helpful assistant.") -> str:
        """
        Prepare a JSONL training file for Mistral fine-tuning.
        """
        try:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, 'w') as f:
                for pair in qa_pairs:
                    # Format en ChatML
                    training_example = {
                        "messages": [
                            {"role": "system", "content": system_content},
                            {"role": "user", "content": pair["question"]},
                            {"role": "assistant", "content": pair["answer"]}
                        ]
                    }
                    f.write(json.dumps(training_example, ensure_ascii=False) + '\n')
                    
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