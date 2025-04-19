from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
import json
from datetime import datetime

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.project import Project
from app.models.content import Content
from app.models.dataset import Dataset, DatasetContent
from app.models.fine_tuning import FineTuning
from app.services.character_service import CharacterService
from app.services.stripe_service import stripe_service
from app.core.config import settings
from celery_app import celery_app

router = APIRouter()
logger = logging.getLogger(__name__)

# --- Schémas Pydantic --- 

class FineTuningJobConfig(BaseModel):
    provider: str
    model: str
    hyperparameters: Optional[Dict[str, Any]] = {"n_epochs": 3} # Garder simple pour l'instant
    suffix: Optional[str] = None
    system_prompt: Optional[str] = "You are a helpful assistant."
    job_name: Optional[str] = None
    dataset_name: Optional[str] = None # Nom pour le dataset créé

class CreateFineTuningJobRequest(BaseModel):
    project_id: int
    content_ids: List[int] # IDs des contenus à utiliser pour ce job
    config: FineTuningJobConfig

class FineTuningJobResponse(BaseModel):
    status: str
    message: str
    checkout_url: Optional[str] = None
    redirect_url: Optional[str] = None
    fine_tuning_id: Optional[int] = None
    dataset_id: Optional[int] = None

# --- Endpoint --- 

@router.post("", response_model=FineTuningJobResponse, status_code=status.HTTP_201_CREATED)
async def create_fine_tuning_job(
    request: CreateFineTuningJobRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crée et lance un nouveau job de fine-tuning pour un projet spécifique,
    en utilisant une sélection de contenus.
    Gère le calcul des coûts, le paiement si nécessaire, et le lancement des tâches.
    """
    logger.info(f"Requête de création de Fine-Tuning Job pour projet {request.project_id} par utilisateur {current_user.id}")
    
    # 1. Vérifier le projet et les contenus
    project = db.query(Project).filter(
        Project.id == request.project_id, 
        Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé ou non autorisé.")
        
    contents = db.query(Content).filter(
        Content.project_id == request.project_id,
        Content.id.in_(request.content_ids)
    ).all()
    
    if len(contents) != len(request.content_ids):
        raise HTTPException(status_code=404, detail="Un ou plusieurs contenus non trouvés dans ce projet.")
    
    # Vérifier que tous les contenus sélectionnés sont prêts (sauf YouTube qui sera transcrit)
    pending_contents = [c for c in contents if c.status not in ['completed', 'error'] and c.type != 'youtube']
    if pending_contents:
        raise HTTPException(status_code=400, detail=f"Contenus non prêts: IDs {[c.id for c in pending_contents]}")

    # 2. Calculer le coût total des caractères pour les contenus sélectionnés
    character_service = CharacterService()
    total_characters = 0
    pending_transcriptions = [] # IDs des contenus YouTube à transcrire
    for content in contents:
        if content.type == 'youtube' and content.status != 'completed':
            # Pour YouTube non traité, utiliser une estimation ou valeur par défaut
            # Ici, on suppose que l'estimation a été faite côté frontend ou est dans metadata
            estimated_chars = content.content_metadata.get('estimated_characters', 4000) # Fallback à ~10min
            total_characters += estimated_chars
            pending_transcriptions.append(content.id)
        elif content.content_metadata and content.content_metadata.get('character_count'):
            total_characters += content.content_metadata['character_count']
        else:
             logger.warning(f"Contenu {content.id} (type: {content.type}) sans character_count dans metadata. Estimation à 0.")

    logger.info(f"Calcul du coût pour {total_characters} caractères et {len(pending_transcriptions)} transcriptions YouTube.")

    # 3. Gérer le paiement / traitement gratuit
    cost_result = await character_service.handle_fine_tuning_cost(
        db=db,
        user=current_user,
        character_count=total_characters
    )

    if cost_result["needs_payment"]:
        logger.info(f"Paiement requis: ${cost_result['amount_usd']:.2f}")
        # Créer la session Stripe
        try:
            checkout_url = await stripe_service.create_checkout_session(
                amount=cost_result['amount_cents'],
                user_id=current_user.id,
                description=f"Fine-tuning job pour projet {request.project_id}",
                metadata={
                    "payment_type": "fine_tuning_job",
                    "user_id": str(current_user.id),
                    "project_id": str(request.project_id),
                    "content_ids": json.dumps(request.content_ids), # Sérialiser la liste
                    "config": request.config.json() # Sérialiser la config
                }
            )
            return FineTuningJobResponse(
                status="pending_payment",
                message="Paiement requis pour lancer le fine-tuning.",
                checkout_url=checkout_url
            )
        except Exception as e:
            logger.error(f"Erreur création session Stripe: {e}")
            raise HTTPException(status_code=500, detail="Erreur lors de la création de la session de paiement.")
    
    else:
        # Vérifier la raison du traitement gratuit
        if cost_result["reason"] == "first_free_quota" or cost_result["reason"] == "already_used_quota" or cost_result["reason"] == "low_amount":
             logger.info(f"Traitement gratuit (Raison: {cost_result['reason']}). Lancement direct des tâches.")
        else:
             # Sécurité: si la raison est inconnue mais needs_payment est False
             logger.warning(f"Traitement gratuit pour une raison inconnue: {cost_result.get('reason')}. Lancement des tâches par précaution.")

        # 4. Créer Dataset & FineTuning
        try:
            # Vérifier s'il faut appliquer les crédits gratuits (uniquement la première fois)
            if cost_result.get("apply_free_credits", False):
                 logger.info(f"Application des crédits gratuits pour l'utilisateur {current_user.id}")
                 # Utiliser add_character_credits pour enregistrer la transaction gratuite
                 credit_success = character_service.add_character_credits(
                     db=db, 
                     user_id=current_user.id, 
                     character_count=total_characters, # Le montant total est "gratuit"
                     payment_id=None, # Pas de paiement
                     description=f"Utilisation du quota gratuit ({total_characters} caractères) pour Fine-Tuning Job"
                 )
                 if credit_success:
                     current_user.has_received_free_credits = True
                     db.add(current_user)
                     db.commit()
                     db.refresh(current_user)
                     logger.info(f"Utilisateur {current_user.id} marqué comme ayant reçu les crédits gratuits.")
                 else:
                     # Logique d'erreur si l'ajout de crédits échoue
                     logger.error(f"Échec de l'application des crédits gratuits pour l'utilisateur {current_user.id}")
                     raise HTTPException(status_code=500, detail="Erreur interne lors de l'application des crédits gratuits.")
            
            # La création du Dataset et FineTuning se fait ensuite
            # Générer un nom de dataset par défaut si non fourni
            dataset_name = request.config.dataset_name or f"Dataset_{project.name.replace(' ','_')}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            # Créer le dataset
            new_dataset = Dataset(
                name=dataset_name,
                project_id=project.id,
                description=f"Dataset pour fine-tuning job lancé le {datetime.now().strftime('%Y-%m-%d')}",
                model=request.config.model,
                status="pending",
                system_content=request.config.system_prompt,
                character_count=total_characters # Stocker le compte ici aussi
            )
            db.add(new_dataset)
            db.commit()
            db.refresh(new_dataset)
            logger.info(f"Dataset {new_dataset.id} créé.")

            # Associer les contenus sélectionnés au dataset
            for content_id in request.content_ids:
                db.add(DatasetContent(dataset_id=new_dataset.id, content_id=content_id))
            db.commit()
            logger.info(f"{len(request.content_ids)} contenus associés au dataset {new_dataset.id}.")
            
            # Créer le fine-tuning
            job_name = request.config.job_name or f"FineTune_{project.name.replace(' ','_')}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            new_fine_tuning = FineTuning(
                dataset_id=new_dataset.id,
                name=job_name,
                description=f"Job lancé via dashboard pour projet {project.id}",
                model=request.config.model,
                provider=request.config.provider,
                status="pending", 
                hyperparameters=request.config.hyperparameters
            )
            db.add(new_fine_tuning)
            db.commit()
            db.refresh(new_fine_tuning)
            logger.info(f"FineTuning {new_fine_tuning.id} créé.")

            # 5. Lancer les tâches asynchrones
            # Transcriptions YouTube
            if pending_transcriptions:
                logger.info(f"Lancement de {len(pending_transcriptions)} transcriptions YouTube.")
                for content_id in pending_transcriptions:
                    try:
                        from app.tasks.content_processing import transcribe_youtube_video
                        task = transcribe_youtube_video.delay(content_id=content_id)
                        content_obj = db.query(Content).get(content_id)
                        if content_obj: 
                             content_obj.task_id = task.id
                             content_obj.status = 'processing' 
                             db.commit()
                    except Exception as e:
                        logger.error(f"Erreur lancement transcription pour content {content_id}: {e}")
            
            # Génération du Dataset (qui déclenchera le fine-tuning)
            logger.info(f"Lancement de la génération pour dataset {new_dataset.id}")
            celery_app.send_task("generate_dataset", args=[new_dataset.id], queue='dataset_generation')

            return FineTuningJobResponse(
                status="processing_started",
                message="Le processus de fine-tuning a été lancé.",
                redirect_url=f"{settings.FRONTEND_URL}/dashboard/projects/{project.id}?tab=finetune", # Rediriger vers l'onglet finetune
                fine_tuning_id=new_fine_tuning.id,
                dataset_id=new_dataset.id
            )

        except Exception as e:
            logger.error(f"Erreur lors de la création DB ou lancement tâches: {e}", exc_info=True)
            # Rollback potentiel si l'ajout des crédits a réussi mais la suite échoue?
            # C'est complexe, pour l'instant on lève juste l'erreur.
            raise HTTPException(status_code=500, detail="Erreur interne lors du lancement du processus.")
