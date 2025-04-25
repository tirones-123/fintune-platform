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
from app.models.payment import CharacterTransaction

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
    logger.debug(f"Contenu IDs demandés: {request.content_ids}")
    logger.debug(f"Configuration demandée: {request.config}")
    
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
            estimated_chars = content.content_metadata.get('estimated_characters', 4000) # Fallback à ~10min
            total_characters += estimated_chars
            pending_transcriptions.append(content.id)
        elif content.status == 'completed' and content.content_metadata and content.content_metadata.get('character_count'):
            # Cas idéal : Contenu traité avec comptage exact
            total_characters += content.content_metadata['character_count']
        elif content.status == 'completed':
            # Cas où le contenu est marqué comme traité, mais le comptage manque (erreur de traitement?)
            # Utiliser l'estimation fallback pour robustesse
            logger.warning(f"Contenu {content.id} (type: {content.type}) est 'completed' mais sans character_count.")
            if content.size and content.size > 0:
                estimated_chars = int(content.size * 0.5)
                total_characters += estimated_chars
                logger.warning(f" -> Estimation basée sur taille: {estimated_chars} caractères.")
            else:
                fallback_chars = 5000
                total_characters += fallback_chars
                logger.warning(f" -> Estimation par défaut: {fallback_chars} caractères.")
        # Ignorer les contenus en erreur ou non-YouTube non traités (déjà filtrés avant)
        # else:
            # logger.info(f"Contenu {content.id} (type: {content.type}, status: {content.status}) ignoré pour le comptage.")

    logger.info(f"Calcul du coût pour {total_characters} caractères et {len(pending_transcriptions)} transcriptions YouTube.")
    
    # --- LOG AVANT APPEL SERVICE COÛT ---
    logger.debug("Appel à character_service.handle_fine_tuning_cost...")
    # --- FIN LOG ---

    # 3. Gérer le paiement / traitement gratuit
    cost_result = await character_service.handle_fine_tuning_cost(
        db=db,
        user=current_user,
        character_count=total_characters
    )

    if cost_result["needs_payment"]:
        logger.info(f"Paiement requis: ${cost_result['amount_usd']:.2f}")
        # --- LOG AVANT APPEL STRIPE ---
        logger.debug("Appel à stripe_service.create_checkout_session...")
        # --- FIN LOG ---
        # Créer la session Stripe
        try:
            # --- AJOUT : Inclure total_characters dans metadata ---
            metadata = {
                "payment_type": "fine_tuning_job",
                "user_id": str(current_user.id),
                "project_id": str(request.project_id),
                "content_ids": json.dumps(request.content_ids),
                "config": request.config.json(),
                "total_characters": str(total_characters) # <--- AJOUT
            }
            # --- FIN AJOUT ---
            
            checkout_url = await stripe_service.create_checkout_session(
                amount=cost_result['amount_cents'],
                user_id=current_user.id,
                db=db,
                line_item_name="Fine-Tuning Job",
                line_item_description=f"Fine-tuning",
                metadata=metadata
            )
            return FineTuningJobResponse(
                status="pending_payment",
                message="Paiement requis pour lancer le fine-tuning.",
                checkout_url=checkout_url
            )
        except Exception as e:
            logger.error(f"Erreur création session Stripe: {e}")
            # --- LOG ERREUR STRIPE ---
            logger.exception("Traceback complet de l'erreur Stripe:") 
            # --- FIN LOG ---
            raise HTTPException(status_code=500, detail="Erreur lors de la création de la session de paiement.")
    
    else:
        # --- LOG TRAITEMENT GRATUIT --- 
        logger.debug(f"Traitement gratuit détecté. Raison: {cost_result.get('reason')}")
        # --- FIN LOG ---
        # Vérifier la raison du traitement gratuit
        if cost_result["reason"] == "first_free_quota" or cost_result["reason"] == "already_used_quota" or cost_result["reason"] == "low_amount":
             logger.info(f"Traitement gratuit (Raison: {cost_result['reason']}). Lancement direct des tâches.")
        else:
             # Sécurité: si la raison est inconnue mais needs_payment est False
             logger.warning(f"Traitement gratuit pour une raison inconnue: {cost_result.get('reason')}. Lancement des tâches par précaution.")

        # 4. Créer Dataset & FineTuning et déduire les crédits
        try:
            # Déduire les caractères gratuits utilisés pour ce job
            apply_first_free_quota = cost_result.get("apply_free_credits", False)
            free_chars_to_use = min(current_user.free_characters_remaining, total_characters)
            
            logger.info(f"Job gratuit : Utilisation de {free_chars_to_use} caractères gratuits sur {current_user.free_characters_remaining} restants.")
            
            if free_chars_to_use > 0:
                # Mettre à jour le solde de l'utilisateur
                current_user.free_characters_remaining -= free_chars_to_use
                current_user.total_characters_used += total_characters # Total utilisé basé sur brut
                
                if apply_first_free_quota:
                    current_user.has_received_free_credits = True
                    logger.info(f"Utilisateur {current_user.id} marqué comme ayant reçu les crédits gratuits (via FT job).")
                
                db.add(current_user)
                
                # Enregistrer la transaction gratuite
                free_tx = CharacterTransaction(
                    user_id=current_user.id,
                    amount=-free_chars_to_use,
                    description=f"Utilisation de {free_chars_to_use} caractères gratuits pour le Fine-Tuning Job",
                    price_per_character=0.0,
                    total_price=0.0
                )
                db.add(free_tx)
                
                # Commiter les changements utilisateur et transaction
                db.commit()
                db.refresh(current_user)
            else:
                # Si aucun crédit gratuit n'est utilisé, on met juste à jour le total brut utilisé
                current_user.total_characters_used += total_characters
                db.add(current_user)
                db.commit()
                db.refresh(current_user)

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
                description=f"Job launched via dashboard for project {project.id}",
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
            logger.info(f"Lancement du traitement pour {len(request.content_ids)} contenus sélectionnés...")
            processed_content_ids = set() # Pour éviter de lancer deux fois

            for content_id in request.content_ids:
                content_obj = db.query(Content).get(content_id)
                if content_obj:
                    if content_obj.type == 'youtube' and content_obj.status == 'awaiting_transcription':
                        # Lancer la transcription spécifique pour YouTube en attente
                        logger.info(f" -> Lancement transcription YouTube pour content {content_id}")
                        try:
                            from app.tasks.content_processing import transcribe_youtube_video
                            task = transcribe_youtube_video.delay(content_id=content_id)
                            content_obj.task_id = task.id
                            content_obj.status = 'processing' # Mettre à jour le statut
                            db.commit()
                            processed_content_ids.add(content_id)
                        except Exception as e:
                            logger.error(f" -> Erreur lancement transcription YouTube pour content {content_id}: {e}")
                    elif content_obj.status != 'error': # Lancer process_content pour les autres (ou ceux déjà completed comme sécurité)
                        logger.info(f" -> Lancement process_content pour content {content_id} (type: {content_obj.type}, status: {content_obj.status})")
                        try:
                             from app.tasks.content_processing import process_content
                             task = process_content.delay(content_id=content_id)
                             # On pourrait aussi mettre à jour task_id ici si nécessaire
                             # Mettre à jour le statut si ce n'était pas déjà 'processing' ou 'completed'
                             if content_obj.status not in ['processing', 'completed']:
                                 content_obj.status = 'processing' 
                                 db.commit()
                             processed_content_ids.add(content_id)
                        except Exception as e:
                            logger.error(f" -> Erreur lancement process_content pour content {content_id}: {e}")
                else:
                    logger.warning(f"Contenu ID {content_id} non trouvé lors du lancement des tâches.")
            
            # Génération du Dataset (qui attendra la fin des process_content)
            logger.info(f"Lancement de la génération pour dataset {new_dataset.id} (attendra {len(processed_content_ids)} tâches de contenu)")
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
