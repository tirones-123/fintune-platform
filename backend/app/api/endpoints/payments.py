from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
import stripe
from datetime import datetime
import logging
from pydantic import BaseModel
import json
import time

from app.core.security import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.models.project import Project
from app.models.content import Content
from app.models.dataset import Dataset, DatasetContent
from app.models.fine_tuning import FineTuning
from app.models.api_key import ApiKey
from app.services.character_service import CharacterService
from app.api.endpoints.fine_tuning_jobs import FineTuningJobConfig
from app.tasks.content_processing import transcribe_youtube_video
from celery_app import celery_app
from app.models.payment import Payment, CharacterTransaction
from app.services.stripe_service import StripeService

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

# Importer get_db pour le webhook
from app.db.session import get_db

# Importer Payment pour le webhook
from app.models.payment import Payment

router = APIRouter()

logger = logging.getLogger(__name__)

# Modèle pour la requête d'onboarding
class OnboardingCheckoutRequest(BaseModel):
    character_count: int
    content_ids: List[int]
    dataset_name: str
    system_content: str
    provider: str
    model: str

@router.post("/create-onboarding-session")
async def create_onboarding_session(
    request: OnboardingCheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Créer une session de paiement pour la fin de l'onboarding avec un nombre spécifique de caractères.
    """
    try:
        # Récupérer les données de la requête
        character_count = request.character_count
        content_ids = request.content_ids

        logger.info(f"Demande de session pour l'onboarding avec {character_count} caractères et {len(content_ids)} contenus (IDs: {content_ids})")

        # Vérifier si l'utilisateur est éligible aux crédits gratuits
        eligible_for_free_credits = (character_count <= 10000 and not current_user.has_received_free_credits)
        already_received_free_credits = (character_count <= 10000 and current_user.has_received_free_credits)

        # Cas 1: Éligible aux crédits gratuits (première fois <= 10k)
        if eligible_for_free_credits:
            logger.info(f"Utilisateur {current_user.id} éligible aux crédits gratuits ({character_count} caractères).")
            try:
                # Déduire le quota gratuit initial (ignorer les utilisations antérieures pour onboarding)
                from app.services.character_service import CharacterService
                initial_quota = CharacterService.FREE_CHARACTERS
                used_chars = min(character_count, initial_quota)
                current_user.free_characters_remaining = initial_quota - used_chars
                current_user.total_characters_used += used_chars
                current_user.has_received_free_credits = True
                db.add(current_user)
                # Enregistrer la transaction de caractères gratuits pour onboarding
                from app.models.payment import CharacterTransaction
                free_tx = CharacterTransaction(
                    user_id=current_user.id,
                    amount=-used_chars,
                    description=f"Utilisation du quota gratuit onboarding ({used_chars} caractères)",
                    price_per_character=0.0,
                    total_price=0.0
                )
                db.add(free_tx)
                db.commit()
                db.refresh(current_user)

                # Récupérer les contenus et lancer les transcriptions si nécessaire
                contents = db.query(Content).filter(Content.id.in_(content_ids)).all()
                pending_transcription_ids = [c.id for c in contents if c.type == 'youtube' and c.status != 'completed']

                if pending_transcription_ids:
                     logger.info(f"Traitement de {len(pending_transcription_ids)} transcriptions en attente (gratuit)")
                     for content_id in pending_transcription_ids:
                         content = db.query(Content).get(content_id)
                         if content and content.type == 'youtube' and content.url:
                             content.status = 'processing'
                             db.commit() # Commit status change before task launch
                             try:
                                 task = transcribe_youtube_video.delay(content_id=content_id)
                                 content.task_id = task.id
                                 db.commit()
                                 logger.info(f"Tâche de transcription lancée pour contenu {content_id}, tâche ID: {task.id}")
                             except Exception as task_error:
                                 logger.error(f"Erreur lancement transcription pour {content_id}: {task_error}")
                                 content.status = 'error' # Mark as error if task fails
                                 db.commit()
                         else:
                              logger.warning(f"Contenu YouTube {content_id} non trouvé ou invalide.")

                # Création Dataset/FineTuning
                project = db.query(Project).filter(Project.user_id == current_user.id).order_by(Project.created_at.desc()).first()
                if project:
                    # Utiliser les contenus récupérés plus haut
                    if contents:
                        dataset_name = request.dataset_name if hasattr(request, 'dataset_name') else "Dataset d'onboarding"
                        system_content = request.system_content if hasattr(request, 'system_content') else "You are a helpful assistant."
                        provider = request.provider if hasattr(request, 'provider') else "openai"
                        model = request.model if hasattr(request, 'model') else "gpt-3.5-turbo"
                        new_dataset = Dataset(
                            name=dataset_name,
                            project_id=project.id,
                            description="Dataset généré automatiquement après l'onboarding gratuit",
                            model=model,
                            status="pending",
                            system_content=system_content
                        )
                        db.add(new_dataset)
                        db.flush() # Get ID before adding associations
                        logger.info(f"Webhook onboarding gratuit: Dataset {new_dataset.id} créé pour user {current_user.id}.")
                        for content_item in contents: # Utiliser les 'contents' récupérés
                             dataset_content = DatasetContent(
                                 dataset_id=new_dataset.id,
                                 content_id=content_item.id
                             )
                             db.add(dataset_content)
                        db.commit() # Commit dataset and associations

                        try:
                            from celery_app import celery_app
                            logger.info(f"Lancement de la tâche de génération pour le dataset {new_dataset.id}")
                            celery_app.send_task(
                                "generate_dataset",
                                args=[new_dataset.id],
                                queue='dataset_generation'
                            )
                            time.sleep(1) # Attendre 1 seconde avant de continuer
                            api_key = db.query(ApiKey).filter(
                                ApiKey.user_id == current_user.id,
                                ApiKey.provider == provider
                            ).first()
                            if api_key:
                                fine_tuning = FineTuning(
                                    dataset_id=new_dataset.id,
                                    name=f"Fine-tuning de {dataset_name}",
                                    description="Fine-tuning généré automatiquement après l'onboarding gratuit",
                                    model=model,
                                    provider=provider,
                                    status="pending",
                                    hyperparameters={"n_epochs": 3}
                                )
                                db.add(fine_tuning)
                                db.commit() # Commit fine-tuning separately
                                logger.info(f"Fine-tuning {fine_tuning.id} créé en attente pour le dataset {new_dataset.id}")
                            else:
                                logger.warning(f"L'utilisateur {current_user.id} n'a pas de clé API pour le provider {provider}, fine-tuning non créé.")
                        except Exception as task_error:
                            logger.error(f"Erreur lors du lancement de la tâche de génération ou création fine-tuning: {str(task_error)}")
                    else:
                         logger.warning(f"Aucun contenu pertinent trouvé pour créer le dataset pour le projet {project.id} après onboarding gratuit.")
                else:
                     logger.warning(f"Aucun projet trouvé pour l'utilisateur {current_user.id} pour créer le dataset/fine-tuning post-onboarding.")

                return {
                    "status": "success",
                    "free_processing": True,
                    "redirect_url": f"{settings.FRONTEND_URL}/dashboard?onboarding_completed=true"
                }
            except Exception as e:
                logger.error(f"Erreur lors de l'ajout gratuit de caractères ou lancement tâches: {str(e)}", exc_info=True)
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Erreur interne lors du traitement gratuit: {str(e)}"
                )

        # Cas 2: <= 10k mais crédits gratuits déjà reçus
        elif already_received_free_credits:
            logger.warning(f"Utilisateur {current_user.id} a déjà reçu les crédits gratuits. Traitement standard en cours ({character_count} caractères).")
            try:
                 # Récupérer les contenus et lancer les transcriptions si nécessaire
                 contents = db.query(Content).filter(Content.id.in_(content_ids)).all()
                 pending_transcription_ids = [c.id for c in contents if c.type == 'youtube' and c.status != 'completed']

                 if pending_transcription_ids:
                      logger.info(f"Traitement de {len(pending_transcription_ids)} transcriptions en attente (crédits déjà reçus)")
                      for content_id in pending_transcription_ids:
                          content = db.query(Content).get(content_id)
                          if content and content.type == 'youtube' and content.url:
                              content.status = 'processing'
                              db.commit()
                              try:
                                  task = transcribe_youtube_video.delay(content_id=content_id)
                                  content.task_id = task.id
                                  db.commit()
                                  logger.info(f"Tâche de transcription lancée pour contenu {content_id}, tâche ID: {task.id}")
                              except Exception as task_error:
                                  logger.error(f"Erreur lancement transcription pour {content_id}: {task_error}")
                                  content.status = 'error'
                                  db.commit()
                          else:
                               logger.warning(f"Contenu YouTube {content_id} non trouvé ou invalide.")

                 project = db.query(Project).filter(Project.user_id == current_user.id).order_by(Project.created_at.desc()).first()
                 if project:
                     if contents:
                         dataset_name = request.dataset_name if hasattr(request, 'dataset_name') else "Dataset d'onboarding"
                         system_content = request.system_content if hasattr(request, 'system_content') else "You are a helpful assistant."
                         provider = request.provider if hasattr(request, 'provider') else "openai"
                         model = request.model if hasattr(request, 'model') else "gpt-3.5-turbo"
                         new_dataset = Dataset(
                             name=dataset_name,
                             project_id=project.id,
                             description="Dataset généré lors de l'onboarding (crédits gratuits déjà utilisés)",
                             model=model,
                             status="pending",
                             system_content=system_content
                         )
                         db.add(new_dataset)
                         db.flush() # Get ID
                         logger.info(f"Webhook onboarding (crédits déjà reçus): Dataset {new_dataset.id} créé.")
                         for content_item in contents:
                              dataset_content = DatasetContent(
                                  dataset_id=new_dataset.id,
                                  content_id=content_item.id
                              )
                              db.add(dataset_content)
                         db.commit() # Commit dataset and associations

                         try:
                             from celery_app import celery_app
                             logger.info(f"Lancement de la tâche de génération pour le dataset {new_dataset.id}")
                             celery_app.send_task(
                                 "generate_dataset",
                                 args=[new_dataset.id],
                                 queue='dataset_generation'
                             )
                             time.sleep(1) # Attendre 1 seconde avant de continuer
                             api_key = db.query(ApiKey).filter(
                                 ApiKey.user_id == current_user.id,
                                 ApiKey.provider == provider
                             ).first()
                             if api_key:
                                 fine_tuning = FineTuning(
                                     dataset_id=new_dataset.id,
                                     name=f"Fine-tuning de {dataset_name}",
                                     description="Fine-tuning d'onboarding (crédits gratuits déjà utilisés)",
                                     model=model,
                                     provider=provider,
                                     status="pending",
                                     hyperparameters={"n_epochs": 3}
                                 )
                                 db.add(fine_tuning)
                                 db.commit() # Commit fine-tuning
                                 logger.info(f"Fine-tuning {fine_tuning.id} créé en attente pour le dataset {new_dataset.id}")
                             else:
                                 logger.warning(f"L'utilisateur {current_user.id} n'a pas de clé API pour le provider {provider}, fine-tuning non créé.")
                         except Exception as task_error:
                             logger.error(f"Erreur lors du lancement de la tâche de génération ou création fine-tuning: {str(task_error)}")
                     else:
                          logger.warning(f"Aucun contenu pertinent trouvé pour créer le dataset pour le projet {project.id} (crédits déjà reçus).")
                 else:
                     logger.warning(f"Aucun projet trouvé pour l'utilisateur {current_user.id} (crédits déjà reçus).")

                 return {"status": "success", "free_processing": False, "redirect_url": f"{settings.FRONTEND_URL}/dashboard?onboarding_completed=true"}
            except Exception as e:
                logger.error(f"Erreur lors du traitement standard (crédits déjà reçus): {str(e)}", exc_info=True)
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Erreur interne lors du traitement standard: {str(e)}"
                )

        # Cas 3: > 10k caractères (payant)
        else:
            logger.info(f"Nombre de caractères ({character_count}) supérieur au quota gratuit. Redirection vers Stripe.")
            billable_characters = max(0, character_count - 10000)
            amount_in_cents = max(60, round(billable_characters * 0.000365 * 100))
            logger.info(f"Facturation de {billable_characters} caractères pour ${amount_in_cents/100:.2f}")

            # Récupérer project_id
            db_temp = next(get_db())
            try:
                project = db_temp.query(Project).filter(Project.user_id == current_user.id).order_by(Project.created_at.desc()).first()
                if not project:
                    project = Project(name="Projet Onboarding", user_id=current_user.id)
                    db_temp.add(project)
                    db_temp.commit()
                    db_temp.refresh(project)
                    logger.info(f"Projet Onboarding créé (ID: {project.id}) pour user {current_user.id}")
                project_id = project.id
            finally:
                db_temp.close()

        # Préparer metadata
        metadata = {
            "payment_type": "onboarding_characters", 
            "user_id": str(current_user.id),
            "character_count": str(character_count),
            "free_characters": "10000",
            "billable_characters": str(billable_characters),
            "dataset_name": request.dataset_name, 
            "system_content": request.system_content,
            "provider": request.provider,
            "model": request.model,
            "project_id": str(project_id), 
            "hyperparameters": json.dumps({"n_epochs": 3}),
            "content_ids": json.dumps(content_ids)
        }

        # --- MODIFICATION : Utiliser le service Stripe --- 
        try:
            stripe_service = StripeService()
            checkout_url = await stripe_service.create_checkout_session(
                amount=amount_in_cents,
                user_id=current_user.id,
                db=db, # Passer la session db au service
                line_item_name=f"FineTuner Onboarding - {character_count} caractères",
                line_item_description=f"{billable_characters} billable characters (10k free)",
                metadata=metadata
            )
            return {"checkout_url": checkout_url}
        except stripe.error.StripeError as e:
            logger.error(f"Erreur Stripe: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur communication Stripe: {str(e)}"
            )
    
    except Exception as e:
        logger.error(f"Erreur inattendue endpoint: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne inattendue: {str(e)}"
        )

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Webhook pour gérer les événements de Stripe.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    event = None
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        logger.error(f"Webhook error: Invalid payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Webhook error: Invalid signature: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception as e:
        logger.error(f"Webhook error on construction: {e}")
        raise HTTPException(status_code=400, detail="Webhook construction error")

    # Gérer l'événement checkout.session.completed
    if event['type'] == 'checkout.session.completed':
        session_data = event['data']['object']
        metadata = session_data.get("metadata", {})
        payment_type = metadata.get("payment_type")
        
        logger.info(f"Webhook: checkout.session.completed reçu pour type: {payment_type}")

        # Utiliser get_db pour gérer la session
        db: Session = next(get_db())
        try:
            if payment_type == "fine_tuning_job":
                logger.info("Webhook: Traitement paiement pour fine_tuning_job")
                await handle_fine_tuning_job_payment(db, event) # Passer db ici

            elif payment_type == "character_credits":
                logger.info("Webhook: Traitement paiement pour character_credits")
                await _handle_character_purchase_success(db, session_data)
            
            elif payment_type == "onboarding_characters":
                 logger.info("Webhook: Traitement paiement pour onboarding_characters")
                 await _handle_onboarding_payment_success(db, session_data)
            
            else:
                logger.warning(f"Webhook: Type de paiement non géré: {payment_type}")

        except Exception as e:
            logger.error(f"Webhook: Erreur interne lors du traitement de {payment_type}: {e}", exc_info=True)
            # Important: Ne pas lever d'exception ici pour que Stripe reçoive un 200 OK
            # et ne réessaie pas indéfiniment une tâche qui échoue.
            # L'erreur est logguée pour investigation manuelle.
        finally:
            db.close()
            
    elif event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        logger.info(f"Webhook: PaymentIntent {payment_intent['id']} succeeded.")
        
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        logger.warning(f"Webhook: PaymentIntent {payment_intent['id']} failed.")

    else:
        logger.info(f"Webhook: Événement non géré reçu: {event['type']}")

    # Toujours retourner 200 OK à Stripe si la signature est valide,
    # même si notre traitement interne échoue, pour éviter les rejeux constants.
        return {"status": "success"}
    
# --- Fonctions Helper pour le Webhook ---

async def _handle_onboarding_payment_success(db: Session, stripe_session: Dict[str, Any]):
    """Logique à exécuter après un paiement réussi pour l'onboarding."""
    metadata = stripe_session.get("metadata", {})
    user_id = metadata.get("user_id")
    character_count = metadata.get("character_count")
    billable_characters = metadata.get("billable_characters")
    payment_intent_id = stripe_session.get("payment_intent")
    content_ids_json = metadata.get("content_ids")
    # Récupérer les infos ajoutées aux metadata
    dataset_name = metadata.get("dataset_name")
    system_content = metadata.get("system_content")
    provider = metadata.get("provider")
    model = metadata.get("model")
    project_id = metadata.get("project_id")
    hyperparameters_json = metadata.get("hyperparameters")

    if not all([user_id, dataset_name, system_content, provider, model, project_id, content_ids_json]):
        logger.error(f"Webhook onboarding: Données essentielles manquantes dans metadata pour user {user_id}. Metadata: {metadata}")
        return

    try:
        user_id = int(user_id)
        project_id = int(project_id)
        try: character_count = int(character_count) if character_count else 0
        except (ValueError, TypeError): character_count = 0
        try: billable_characters = int(billable_characters) if billable_characters else 0
        except (ValueError, TypeError): billable_characters = 0
        
        hyperparameters = {"n_epochs": 3} # Défaut
        if hyperparameters_json:
            try: hyperparameters = json.loads(hyperparameters_json)
            except json.JSONDecodeError: logger.warning(f"Webhook onboarding: Erreur parsing hyperparameters JSON: {hyperparameters_json}")

        content_ids_to_process = []
        if content_ids_json:
            try:
                content_ids_to_process = json.loads(content_ids_json)
                if not isinstance(content_ids_to_process, list):
                     logger.error(f"Webhook onboarding: content_ids n'est pas une liste: {content_ids_to_process}")
                     content_ids_to_process = []
                # Ensure IDs are integers
                content_ids_to_process = [int(id_val) for id_val in content_ids_to_process if isinstance(id_val, (int, str)) and str(id_val).isdigit()]
            except (json.JSONDecodeError, ValueError) as e:
                logger.error(f"Webhook onboarding: Erreur parsing content_ids JSON '{content_ids_json}': {e}")
                content_ids_to_process = []

        logger.info(f"Webhook onboarding: Traitement pour user {user_id}, projet {project_id}, {character_count} total chars, {billable_characters} facturés, contenu IDs: {content_ids_to_process}.")

        # ------------------------------------------------------------------
        # 1. Mettre à jour le solde de caractères de l'utilisateur et créer
        #    les transactions correspondantes (gratuites et payées)
        # ------------------------------------------------------------------
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.error(f"Webhook onboarding: utilisateur {user_id} inexistant.")
            return

        free_quota = CharacterService.FREE_CHARACTERS

        # Déterminer combien de caractères gratuits doivent être appliqués
        # MODIFICATION ICI: Pour l'onboarding payant, on déduit toujours les caractères gratuits
        # quel que soit l'état de has_received_free_credits
        free_chars_to_use = min(free_quota, character_count)

        # Transactions gratuites
        if free_chars_to_use > 0:
            # Si c'est la première utilisation des crédits gratuits, déduire du quota
            if not user.has_received_free_credits:
                user.free_characters_remaining = max(0, free_quota - free_chars_to_use)
            else:
                # Sinon, déduire du solde restant
                user.free_characters_remaining = max(0, user.free_characters_remaining - free_chars_to_use)
            
            user.total_characters_used += free_chars_to_use
            free_tx = CharacterTransaction(
                user_id=user.id,
                amount=-free_chars_to_use,
                description=f"Utilisation quota gratuit onboarding ({free_chars_to_use} caractères)",
                price_per_character=0.0,
                total_price=0.0,
                payment_id=None  # Ne pas utiliser d'ID de paiement ici
            )
            db.add(free_tx)

        # Transactions payantes
        if billable_characters and billable_characters > 0:
            price_per_char = CharacterService.PRICE_PER_CHARACTER
            total_price = price_per_char * billable_characters
            # CORRECTION ICI : Ne pas stocker l'ID Stripe directement dans payment_id (qui est un INTEGER)
            paid_tx = CharacterTransaction(
                user_id=user.id,
                amount=-billable_characters,
                description=f"Caractères facturés onboarding ({billable_characters}) - Ref: {payment_intent_id}",
                price_per_character=price_per_char,
                total_price=total_price,
                payment_id=None  # Mettre à None au lieu de payment_intent_id
            )
            db.add(paid_tx)
            user.total_characters_used += billable_characters

        # S'assurer que has_received_free_credits est vrai après onboarding
        if not user.has_received_free_credits:
            user.has_received_free_credits = True

        # Commit modifications utilisateur & transactions
        db.commit()
        db.refresh(user)
        logger.info(f"Webhook onboarding: Mise à jour du solde caractères pour user {user.id}. Restant: {user.free_characters_remaining}. Gratuits utilisés: {free_chars_to_use}, Payants: {billable_characters}")

        # 2. Créer Dataset et FineTuning
        project = db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()
        if not project:
            logger.error(f"Webhook onboarding: Projet {project_id} non trouvé pour user {user_id}.")
            return

        new_dataset = Dataset(
            name=dataset_name,
            project_id=project.id,
            description="Dataset généré automatiquement après l'onboarding",
            model=model,
            status="pending",
            system_content=system_content
        )
        db.add(new_dataset)
        db.flush() # Obtenir l'ID
        logger.info(f"Webhook onboarding: Dataset {new_dataset.id} créé pour user {user_id}.")

        # Associer les contenus au dataset
        contents_to_associate = db.query(Content).filter(Content.id.in_(content_ids_to_process)).all()
        if len(contents_to_associate) != len(content_ids_to_process):
             logger.warning(f"Webhook onboarding: Certains content IDs {content_ids_to_process} n'ont pas été trouvés.")
        
        for content_item in contents_to_associate:
            dataset_content = DatasetContent(
                dataset_id=new_dataset.id,
                content_id=content_item.id
            )
            db.add(dataset_content)
        
        # Créer l'enregistrement FineTuning
        new_fine_tuning = FineTuning(
            dataset_id=new_dataset.id,
            name=f"Fine-tuning de {dataset_name}",
            description="Fine-tuning généré automatiquement après l'onboarding",
            model=model,
            provider=provider,
            status="pending",
            hyperparameters=hyperparameters
        )
        db.add(new_fine_tuning)
        db.commit() # Commit de tout (User, Dataset, Associations, FineTuning)
        db.refresh(new_dataset)
        db.refresh(new_fine_tuning)
        logger.info(f"Webhook onboarding: FineTuning {new_fine_tuning.id} créé pour user {user_id}.")

        # 3. Lancer les tâches Celery de traitement de contenu
        logger.info(f"Webhook onboarding: Lancement du traitement pour {len(contents_to_associate)} contenus...")
        for content in contents_to_associate:
             if content.type == 'youtube' and content.status == 'awaiting_transcription':
                 logger.info(f" -> Lancement transcription YouTube pour content {content.id}")
                 try:
                     from app.tasks.content_processing import transcribe_youtube_video
                     task = transcribe_youtube_video.delay(content_id=content.id)
                     content.task_id = task.id
                     content.status = 'processing' # Mettre à jour le statut
                     db.commit() # Commiter le changement de statut
                 except Exception as e:
                     logger.error(f" -> Erreur lancement transcription YouTube pour content {content.id}: {e}")
             elif content.status not in ['error', 'completed']:
                 logger.info(f" -> Lancement process_content pour content {content.id} (type: {content.type}, status: {content.status}) ")
                 try:
                     from app.tasks.content_processing import process_content
                     task = process_content.delay(content_id=content.id)
                     if content.status not in ['processing', 'completed']:
                         content.status = 'processing'
                         db.commit()
                 except Exception as e:
                     logger.error(f" -> Erreur lancement process_content pour content {content.id}: {e}")
        
        # 4. Lancer la génération du dataset (qui dépendra de la fin des tâches précédentes)
        logger.info(f"Webhook onboarding: Lancement de la génération pour dataset {new_dataset.id}.")
        celery_app.send_task("generate_dataset", args=[new_dataset.id], queue='dataset_generation')

        logger.info(f"Webhook onboarding: Traitement terminé avec succès pour user {user_id}.")

    except Exception as e:
        logger.error(f"Webhook onboarding: Erreur BDD ou Celery: {e}", exc_info=True)
        db.rollback() # Annuler les changements en cas d'erreur ici

async def _handle_character_purchase_success(db: Session, stripe_session: Dict[str, Any]):
    """Logique à exécuter après un achat de crédits réussi."""
    metadata = stripe_session.get("metadata", {})
    user_id = metadata.get("user_id")
    character_count = metadata.get("character_count") # Nombre de caractères achetés
    payment_intent_id = stripe_session.get("payment_intent")

    if not user_id or not character_count:
        logger.error(f"Webhook achat crédits: Données manquantes dans metadata: user={user_id}, count={character_count}")
        return

    try:
        user_id = int(user_id)
        character_count = int(character_count)
    except ValueError:
        logger.error(f"Webhook achat crédits: user_id ou character_count invalide dans metadata")
        return

    logger.info(f"Webhook achat crédits: Traitement pour user {user_id}, achat de {character_count} caractères.")
    
    # Enregistrer le paiement 
    # TODO: Ajouter la logique pour créer une entrée dans la table Payment
    # payment_record = Payment(user_id=user_id, amount=stripe_session.get('amount_total', 0)/100, status='succeeded', ...) 
    # db.add(payment_record)
    # db.flush() # pour obtenir payment_record.id
    payment_db_id = None # Remplacer par l'ID réel si enregistré

    # Ajouter les crédits achetés via CharacterService
    character_service = CharacterService()
    success = character_service.add_character_credits(
        db=db, # Laisser add_character_credits gérer son commit/rollback
        user_id=user_id,
        character_count=character_count,
        payment_id=None, # Ne pas utiliser payment_intent_id directement
        description=f"Achat de {character_count} crédits via Stripe - Ref: {payment_intent_id}"
    )
    
    if success:
        logger.info(f"Webhook achat crédits: {character_count} crédits ajoutés pour user {user_id}.")
    else:
        logger.error(f"Webhook achat crédits: Échec de l'ajout de {character_count} crédits pour user {user_id}.")

# --- Fonction handle_fine_tuning_job_payment (Déjà définie) --- 
# S'assurer qu'elle utilise bien la session `db` passée en argument
async def handle_fine_tuning_job_payment(db: Session, event: Dict[str, Any]):
    """
    Gère un paiement réussi pour un fine-tuning job spécifique.
    Crée le Dataset, le FineTuning, lance les transcriptions et la génération.
    """
    session = event["data"]["object"]
    metadata = session.get("metadata", {})
    user_id = metadata.get("user_id")
    project_id = metadata.get("project_id")
    content_ids_json = metadata.get("content_ids", "[]")
    config_json = metadata.get("config", "{}")
    payment_intent_id = session.get("payment_intent")
    amount_received = session.get("amount_total", 0) # Montant en cents

    # Vérifications initiales
    if not all([user_id, project_id, content_ids_json, config_json]):
        logger.error(f"Webhook FT Job: Métadonnées manquantes. User: {user_id}, Project: {project_id}")
        return
    try:
        user_id = int(user_id)
        project_id = int(project_id)
        content_ids = json.loads(content_ids_json)
        config_dict = json.loads(config_json)
        config = FineTuningJobConfig(**config_dict) 
    except (json.JSONDecodeError, TypeError, ValueError) as e:
        logger.error(f"Webhook FT Job: Erreur parsing métadonnées JSON/int: {e}")
        return

    logger.info(f"Webhook FT Job: Traitement paiement pour User {user_id}, Projet {project_id}, Contenus: {content_ids}")

    try:
        # 1. Récupérer l'utilisateur et le nombre total de caractères bruts
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.error(f"Webhook FT Job: Utilisateur {user_id} non trouvé.")
            return
            
        try:
            total_characters_raw = int(metadata.get("total_characters", "0"))
        except (ValueError, TypeError):
            logger.error(f"Webhook FT Job: total_characters invalide dans metadata: {metadata.get('total_characters')}")
            total_characters_raw = 0 # Fallback prudent
            
        # 2. Déduire les crédits utilisés (gratuits puis payants)
        from app.models.payment import CharacterTransaction
        
        free_chars_to_use = min(user.free_characters_remaining, total_characters_raw)
        paid_chars = total_characters_raw - free_chars_to_use
        
        logger.info(f"Webhook FT Job: Décompte pour {total_characters_raw} caractères bruts: {free_chars_to_use} gratuits, {paid_chars} payants.")
        
        if free_chars_to_use > 0:
            user.free_characters_remaining -= free_chars_to_use
            free_tx = CharacterTransaction(
                user_id=user_id,
                amount=-free_chars_to_use,
                description=f"Utilisation de {free_chars_to_use} crédits gratuits pour FT Job (payé)",
                price_per_character=0.0, 
                total_price=0.0,
                payment_id=None  # CORRECTION: Ne pas utiliser d'ID de paiement ici
            )
            db.add(free_tx)
            
        if paid_chars > 0:
            # Créer une transaction négative pour l'utilisation payante
            # Le prix/coût est géré par Stripe, ici on enregistre juste l'utilisation
            paid_tx = CharacterTransaction(
                user_id=user_id,
                amount=-paid_chars,
                description=f"Utilisation de {paid_chars} crédits payants pour FT Job - Ref: {payment_intent_id}",
                payment_id=None,  # CORRECTION: Mettre à None au lieu de payment_intent_id
                price_per_character=CharacterService.PRICE_PER_CHARACTER, # Utiliser le prix standard
                total_price=CharacterService().calculate_price(paid_chars)
            )
            db.add(paid_tx)
            
        # Mettre à jour le total utilisé basé sur les caractères bruts
        user.total_characters_used += total_characters_raw
        db.add(user)
        
        # Commiter les changements sur l'utilisateur et les transactions
        db.commit()
        db.refresh(user)

        # 3. Créer Dataset & FineTuning
        project = db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()
        if not project:
            logger.error(f"Webhook FT Job: Projet {project_id} non trouvé pour user {user_id}")
            return

        dataset_name = config.dataset_name or f"Dataset_{project.name.replace(' ','_')}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        job_name = config.job_name or f"FineTune_{project.name.replace(' ','_')}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Récupérer les contenus et identifier ceux à transcrire
        contents = db.query(Content).filter(Content.id.in_(content_ids)).all()
        if len(contents) != len(content_ids):
             logger.warning(f"Webhook FT Job: Certains contenus ({content_ids}) n'ont pas été trouvés.")
             # Décider si on continue avec les contenus trouvés ou si on arrête
             # Pour l'instant, on continue avec les contenus trouvés
             content_ids = [c.id for c in contents] # Utiliser les IDs réels trouvés
             if not content_ids:
                 logger.error(f"Webhook FT Job: Aucun contenu valide trouvé pour {content_ids_json}.")
                 return

        pending_transcriptions = [c.id for c in contents if c.type == 'youtube' and c.status != 'completed']
        
        # Créer le dataset
        new_dataset = Dataset(
            name=dataset_name,
            project_id=project.id,
            description=f"Dataset pour fine-tuning job payé ({job_name})",
            model=config.model,
            status="pending",
            system_content=config.system_prompt
            # character_count pourrait être ajouté si calculé
        )
        db.add(new_dataset)
        db.flush()
        logger.info(f"Webhook FT Job: Dataset {new_dataset.id} créé.")

        # Associer les contenus
        for content_id in content_ids: # Utiliser les IDs validés
            db.add(DatasetContent(dataset_id=new_dataset.id, content_id=content_id))
        
        # Créer le fine-tuning
        new_fine_tuning = FineTuning(
            dataset_id=new_dataset.id,
            name=job_name,
            description=f"Job paid ({payment_intent_id})",
            model=config.model,
            provider=config.provider,
            status="pending",
            hyperparameters=config.hyperparameters
        )
        db.add(new_fine_tuning)
        db.flush()
        logger.info(f"Webhook FT Job: FineTuning {new_fine_tuning.id} créé.")

        # 4. Lancer les tâches
        if pending_transcriptions:
            logger.info(f"Webhook FT Job: Lancement de {len(pending_transcriptions)} transcriptions YouTube.")
            for content_id in pending_transcriptions:
                try:
                    task = transcribe_youtube_video.delay(content_id=content_id)
                    content_obj = db.query(Content).get(content_id)
                    if content_obj: 
                         content_obj.task_id = task.id
                         content_obj.status = 'processing' 
                except Exception as e:
                    logger.error(f"Webhook FT Job: Erreur lancement transcription pour content {content_id}: {e}")
        
        # Log avant commit final FT Job
        logger.info(f"Webhook FT Job: Prêt à commiter Dataset {new_dataset.id}, FineTuning {new_fine_tuning.id} et associations.")
        db.flush() # Assurer que les IDs sont générés avant le commit final
        db.commit() # Commit final après toutes les opérations DB (User, Transactions, Dataset, FT, Contents...)
        logger.info(f"Webhook FT Job: Commit final terminé.")
        
        # --- AJOUT DELAI ---
        time.sleep(1) # Attendre 1 seconde avant de lancer la tâche
        # --- FIN AJOUT DELAI ---
        
        # Lancer la tâche après le délai
        celery_app.send_task("generate_dataset", args=[new_dataset.id], queue='dataset_generation')
        # --- FIN MODIFICATION ---
        
        logger.info(f"Webhook FT Job: Traitement du paiement terminé avec succès pour user {user_id}, projet {project_id}.")

    except Exception as e:
        logger.error(f"Webhook FT Job: Erreur lors du traitement: {e}", exc_info=True)
        db.rollback() # Rollback en cas d'erreur pendant le traitement 