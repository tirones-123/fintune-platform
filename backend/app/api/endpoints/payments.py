from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
import stripe
from datetime import datetime
import logging
from pydantic import BaseModel
import json

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

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter()

logger = logging.getLogger(__name__)

# Modèle pour la requête d'onboarding
class OnboardingCheckoutRequest(BaseModel):
    character_count: int
    pending_transcriptions: list = []  # Liste des vidéos YouTube en attente de transcription
    dataset_name: str
    system_content: str
    provider: str
    model: str

@router.post("/create-onboarding-session")
async def create_onboarding_session(
    request: OnboardingCheckoutRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Créer une session de paiement pour la fin de l'onboarding avec un nombre spécifique de caractères.
    """
    try:
        # Récupérer le nombre de caractères à facturer
        character_count = request.character_count
        pending_transcriptions = request.pending_transcriptions
        
        logger.info(f"Demande de session pour l'onboarding avec {character_count} caractères et {len(pending_transcriptions)} transcriptions en attente")
        
        # Vérifier si l'utilisateur est éligible aux crédits gratuits
        eligible_for_free_credits = (character_count <= 10000 and not current_user.has_received_free_credits)
        already_received_free_credits = (character_count <= 10000 and current_user.has_received_free_credits)

        # Cas 1: Éligible aux crédits gratuits (première fois <= 10k)
        if eligible_for_free_credits:
            logger.info(f"Utilisateur {current_user.id} éligible aux crédits gratuits ({character_count} caractères).")
            db_session = next(get_db())
            try:
                character_service = CharacterService()
                success = character_service.add_character_credits(
                    db=db_session,
                    user_id=current_user.id,
                    character_count=character_count,
                    payment_id=None
                )
                
                if success:
                    logger.info(f"Ajout gratuit de {character_count} caractères réussi pour user {current_user.id}")
                    # Marquer que l'utilisateur a reçu les crédits
                    current_user.has_received_free_credits = True
                    db_session.add(current_user) # Ajouter l'utilisateur à la session pour sauvegarder le changement
                    db_session.commit()
                    db_session.refresh(current_user)

                    # Lancer les transcriptions et la création du dataset/FT (logique existante)
                    if pending_transcriptions:
                         logger.info(f"Traitement de {len(pending_transcriptions)} transcriptions en attente")
                         for content_id_data in pending_transcriptions:
                             content_id = None
                             if isinstance(content_id_data, dict) and "id" in content_id_data:
                                 content_id = content_id_data["id"]
                             elif isinstance(content_id_data, (int, str)):
                                 try:
                                     item_id = int(content_id_data)
                                 except ValueError:
                                     pass
                             if content_id:
                                 content = db_session.query(Content).filter(Content.id == content_id).first()
                                 if content and content.type == 'youtube' and content.url:
                                     content.status = 'processing'
                                     db_session.commit()
                                     try:
                                         task = transcribe_youtube_video.delay(content_id=content_id)
                                         content.task_id = task.id
                                         db_session.commit()
                                         logger.info(f"Tâche de transcription lancée pour contenu {content_id}, tâche ID: {task.id}")
                                     except Exception as task_error:
                                         logger.error(f"Erreur lancement transcription pour {content_id}: {task_error}")
                                 else:
                                      logger.warning(f"Contenu YouTube {content_id} non trouvé ou invalide.")
                             else:
                                 logger.warning(f"ID de contenu invalide reçu dans pending_transcriptions: {content_id_data}")

                    # Création Dataset/FineTuning (logique existante)
                    project = db_session.query(Project).filter(Project.user_id == current_user.id).order_by(Project.created_at.desc()).first()
                    if project:
                        contents = db_session.query(Content).filter(
                            Content.project_id == project.id,
                            Content.status.in_(["completed", "processing"]) # Statuts pertinents
                        ).all()
                        content_ids_in_this_onboarding = []
                        for item in pending_transcriptions:
                             item_id = None
                             if isinstance(item, dict) and "id" in item:
                                 item_id = item["id"]
                             elif isinstance(item, (int, str)): 
                                 try:
                                     item_id = int(item)
                                 except ValueError: pass
                             if item_id: content_ids_in_this_onboarding.append(item_id)
                        relevant_contents = [c for c in contents if c.id in content_ids_in_this_onboarding or c.type != 'youtube']
                        
                        if relevant_contents:
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
                            db_session.add(new_dataset)
                            db_session.commit()
                            db_session.refresh(new_dataset)
                            for content_item in relevant_contents:
                                 dataset_content = DatasetContent(
                                     dataset_id=new_dataset.id,
                                     content_id=content_item.id
                                 )
                                 db_session.add(dataset_content)
                            db_session.commit()

                            try:
                                from celery_app import celery_app
                                logger.info(f"Lancement de la tâche de génération pour le dataset {new_dataset.id}")
                                celery_app.send_task(
                                    "generate_dataset", 
                                    args=[new_dataset.id], 
                                    queue='dataset_generation'
                                )
                                api_key = db_session.query(ApiKey).filter(
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
                                    db_session.add(fine_tuning)
                                    db_session.commit()
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
                else:
                    logger.error(f"Échec de l'ajout gratuit de {character_count} caractères pour user {current_user.id}")
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Erreur lors de l'attribution des crédits gratuits."
                    )
            except Exception as e:
                logger.error(f"Erreur lors de l'ajout gratuit de caractères ou lancement tâches: {str(e)}", exc_info=True)
                db_session.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Erreur interne lors du traitement gratuit: {str(e)}"
                )
            finally:
                db_session.close()
        
        # Cas 2: <= 10k mais crédits gratuits déjà reçus
        elif already_received_free_credits:
            logger.warning(f"Utilisateur {current_user.id} a déjà reçu les crédits gratuits. Traitement standard en cours ({character_count} caractères).")
            # Pas d'ajout de crédits, mais on lance quand même les tâches
            db_session = next(get_db())
            try:
                if pending_transcriptions:
                    logger.info(f"Traitement de {len(pending_transcriptions)} transcriptions en attente (crédits déjà reçus)")
                    for content_id_data in pending_transcriptions:
                        content_id = None
                        if isinstance(content_id_data, dict) and "id" in content_id_data:
                             content_id = content_id_data["id"]
                        elif isinstance(content_id_data, (int, str)):
                             try:
                                 item_id = int(content_id_data)
                             except ValueError:
                                 pass
                        if content_id:
                             content = db_session.query(Content).filter(Content.id == content_id).first()
                             if content and content.type == 'youtube' and content.url:
                                 content.status = 'processing'
                                 db_session.commit()
                                 try:
                                     task = transcribe_youtube_video.delay(content_id=content_id)
                                     content.task_id = task.id
                                     db_session.commit()
                                     logger.info(f"Tâche de transcription lancée pour contenu {content_id}, tâche ID: {task.id}")
                                 except Exception as task_error:
                                     logger.error(f"Erreur lancement transcription pour {content_id}: {task_error}")
                             else:
                                  logger.warning(f"Contenu YouTube {content_id} non trouvé ou invalide.")
                        else:
                             logger.warning(f"ID de contenu invalide reçu dans pending_transcriptions: {content_id_data}")

                project = db_session.query(Project).filter(Project.user_id == current_user.id).order_by(Project.created_at.desc()).first()
                if project:
                    contents = db_session.query(Content).filter(
                        Content.project_id == project.id,
                        Content.status.in_(["completed", "processing"]) # Statuts pertinents
                    ).all()
                    content_ids_in_this_onboarding = []
                    for item in pending_transcriptions:
                         item_id = None
                         if isinstance(item, dict) and "id" in item:
                             item_id = item["id"]
                         elif isinstance(item, (int, str)): 
                             try:
                                 item_id = int(item)
                             except ValueError: pass
                         if item_id: content_ids_in_this_onboarding.append(item_id)
                    relevant_contents = [c for c in contents if c.id in content_ids_in_this_onboarding or c.type != 'youtube']

                    if relevant_contents:
                        dataset_name = request.dataset_name if hasattr(request, 'dataset_name') else "Dataset d'onboarding"
                        system_content = request.system_content if hasattr(request, 'system_content') else "You are a helpful assistant."
                        provider = request.provider if hasattr(request, 'provider') else "openai"
                        model = request.model if hasattr(request, 'model') else "gpt-3.5-turbo"
                        new_dataset = Dataset(
                            name=dataset_name,
                            project_id=project.id,
                            description="Dataset généré lors de l'onboarding (crédits gratuits déjà utilisés)", # Description ajustée
                            model=model,
                            status="pending",
                            system_content=system_content
                        )
                        db_session.add(new_dataset)
                        db_session.commit()
                        db_session.refresh(new_dataset)
                        for content_item in relevant_contents:
                             dataset_content = DatasetContent(
                                 dataset_id=new_dataset.id,
                                 content_id=content_item.id
                             )
                             db_session.add(dataset_content)
                        db_session.commit()

                        try:
                            from celery_app import celery_app
                            logger.info(f"Lancement de la tâche de génération pour le dataset {new_dataset.id}")
                            celery_app.send_task(
                                "generate_dataset", 
                                args=[new_dataset.id], 
                                queue='dataset_generation'
                            )
                            api_key = db_session.query(ApiKey).filter(
                                ApiKey.user_id == current_user.id,
                                ApiKey.provider == provider
                            ).first()
                            if api_key:
                                fine_tuning = FineTuning(
                                    dataset_id=new_dataset.id,
                                    name=f"Fine-tuning de {dataset_name}",
                                    description="Fine-tuning d'onboarding (crédits gratuits déjà utilisés)", # Description ajustée
                                    model=model,
                                    provider=provider,
                                    status="pending",
                                    hyperparameters={"n_epochs": 3}
                                )
                                db_session.add(fine_tuning)
                                db_session.commit()
                                logger.info(f"Fine-tuning {fine_tuning.id} créé en attente pour le dataset {new_dataset.id}")
                            else:
                                logger.warning(f"L'utilisateur {current_user.id} n'a pas de clé API pour le provider {provider}, fine-tuning non créé.")
                        except Exception as task_error:
                            logger.error(f"Erreur lors du lancement de la tâche de génération ou création fine-tuning: {str(task_error)}")
                    else:
                         logger.warning(f"Aucun contenu pertinent trouvé pour créer le dataset pour le projet {project.id} (crédits déjà reçus).")
                else:
                    logger.warning(f"Aucun projet trouvé pour l'utilisateur {current_user.id} (crédits déjà reçus).")
                
                # Retourner succès, mais sans indiquer free_processing
                return {
                    "status": "success",
                    "free_processing": False, # Indiquer que ce n'est pas le traitement gratuit initial
                    "redirect_url": f"{settings.FRONTEND_URL}/dashboard?onboarding_completed=true"
                }

            except Exception as e:
                logger.error(f"Erreur lors du traitement standard (crédits déjà reçus): {str(e)}", exc_info=True)
                db_session.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Erreur interne lors du traitement standard: {str(e)}"
                )
            finally:
                db_session.close()

        # Cas 3: > 10k caractères (payant)
        else: # character_count > 10000
            logger.info(f"Nombre de caractères ({character_count}) supérieur au quota gratuit. Redirection vers Stripe.")
            billable_characters = max(0, character_count - 10000)
            amount_in_cents = max(60, round(billable_characters * 0.000365 * 100))
            logger.info(f"Facturation de {billable_characters} caractères pour ${amount_in_cents/100:.2f}")

            # Logique Stripe (existante et correcte)
            metadata = {
                "payment_type": "onboarding_characters", 
                "user_id": str(current_user.id),
                "character_count": str(character_count),
                "free_characters": "10000",
                "billable_characters": str(billable_characters)
            }
            if pending_transcriptions:
                transcription_ids = []
                for item in pending_transcriptions:
                    item_id = None
                    if isinstance(item, dict) and "id" in item:
                        item_id = item["id"]
                    elif isinstance(item, (int, str)):
                        try:
                           item_id = int(item)
                        except ValueError:
                            pass
                    if item_id:
                        transcription_ids.append(str(item_id))
                if transcription_ids:
                    metadata["pending_transcription_ids"] = ",".join(transcription_ids)
                    metadata["has_pending_transcriptions"] = "true"
                    logger.info(f"Stockage des IDs {transcription_ids} pour traitement webhook")
            
            try:
                checkout_session = stripe.checkout.Session.create(
                    payment_method_types=["card"],
                    line_items=[
                        {
                            "price_data": {
                                "currency": "usd",
                                "product_data": {
                                    "name": f"FinTune Onboarding - {character_count} caractères",
                                    "description": f"{billable_characters} caractères facturables (10k gratuits)"
                                },
                                "unit_amount": amount_in_cents, 
                            },
                            "quantity": 1,
                        },
                    ],
                    mode="payment",
                    success_url=f"{settings.FRONTEND_URL}/dashboard?payment_success=true&onboarding_completed=true",
                    cancel_url=f"{settings.FRONTEND_URL}/onboarding?payment_cancel=true", 
                    client_reference_id=str(current_user.id),
                    metadata=metadata
                )
                return {"checkout_url": checkout_session.url}
            except stripe.error.StripeError as e:
                logger.error(f"Erreur Stripe lors de la création de la session: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Erreur de communication avec Stripe: {str(e)}"
                )

    except Exception as e:
        logger.error(f"Erreur inattendue dans create_onboarding_session: {str(e)}", exc_info=True)
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
        # Invalid payload
        logger.error(f"Webhook error: Invalid payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        logger.error(f"Webhook error: Invalid signature: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception as e:
        logger.error(f"Webhook error on construction: {e}")
        raise HTTPException(status_code=400, detail="Webhook construction error")

    # Gérer l'événement checkout.session.completed
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        metadata = session.get("metadata", {})
        payment_type = metadata.get("payment_type")
        payment_intent_id = session.get("payment_intent")
        amount_total = session.get("amount_total", 0) # Montant en cents

        logger.info(f"Webhook: checkout.session.completed pour type: {payment_type}")

        db: Session = SessionLocal()
        try:
            if payment_type == "fine_tuning_job":
                logger.info("Webhook: Traitement paiement pour fine_tuning_job")
                # Mettre à jour le paiement si nécessaire
                payment_id = metadata.get("payment_id") # Assurez-vous que payment_id est dans les métadonnées
                if payment_id:
                     payment = db.query(Payment).filter(Payment.id == int(payment_id)).first()
                     if payment:
                         payment.status = "completed"
                         payment.stripe_payment_intent_id = payment_intent_id
                         db.commit()
                         logger.info(f"Webhook: Paiement {payment_id} mis à jour.")
                # Appeler la logique de création et lancement
                await handle_fine_tuning_job_payment(db, event)

            elif payment_type == "character_credits":
                logger.info("Webhook: Traitement paiement pour character_credits")
                await stripe_service.handle_character_purchase(db, event)
            
            elif payment_type == "onboarding_characters":
                 logger.info("Webhook: Traitement paiement pour onboarding_characters")
                 await stripe_service.handle_onboarding_payment(db, event)
            
            else:
                logger.warning(f"Webhook: Type de paiement non géré: {payment_type}")

        except Exception as e:
            logger.error(f"Webhook: Erreur interne lors du traitement de checkout.session.completed: {e}", exc_info=True)
            # Ne pas renvoyer 500 à Stripe, sinon il réessaiera
        finally:
            db.close()
            
    elif event['type'] == 'payment_intent.succeeded':
        # Optionnel : gérer d'autres événements si nécessaire
        payment_intent = event['data']['object']
        logger.info(f"Webhook: PaymentIntent {payment_intent['id']} succeeded.")
        
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        logger.warning(f"Webhook: PaymentIntent {payment_intent['id']} failed.")
        # Mettre à jour le statut du paiement dans votre DB si nécessaire

    else:
        logger.info(f"Webhook: Événement non géré reçu: {event['type']}")

        return {"status": "success"}
    
async def handle_fine_tuning_job_payment(db: Session, event: Dict[str, Any]):
    """
    Gère un paiement réussi pour un fine-tuning job spécifique.
    Crée le Dataset, le FineTuning, lance les transcriptions et la génération.
    """
    session = event["data"]["object"]
    metadata = session.get("metadata", {})
    user_id = int(metadata.get("user_id"))
    project_id = int(metadata.get("project_id"))
    content_ids_json = metadata.get("content_ids", "[]")
    config_json = metadata.get("config", "{}")
    payment_intent_id = session.get("payment_intent")
    amount_received = session.get("amount_total", 0) # Montant en cents

    if not all([user_id, project_id, content_ids_json, config_json]):
        logger.error(f"Webhook: Métadonnées manquantes pour fine_tuning_job. User: {user_id}, Project: {project_id}")
        return

    try:
        content_ids = json.loads(content_ids_json)
        config_dict = json.loads(config_json)
        config = FineTuningJobConfig(**config_dict) # Valider avec Pydantic
    except (json.JSONDecodeError, TypeError) as e:
        logger.error(f"Webhook: Erreur de parsing des métadonnées JSON: {e}")
        return

    logger.info(f"Webhook: Traitement paiement pour User {user_id}, Projet {project_id}, Contenus: {content_ids}")

    try:
        # 1. Ajouter les crédits (si on a un système de crédit)
        # Note: Ici on pourrait aussi juste valider que le paiement est reçu.
        # Pour l'instant, on assume que le paiement couvre exactement le coût.
        
        # 2. Créer Dataset & FineTuning
        from app.models.dataset import Dataset, DatasetContent
        from app.models.fine_tuning import FineTuning
        from app.models.content import Content
        from app.tasks.content_processing import transcribe_youtube_video
        from celery_app import celery_app
        import datetime
        
        # Générer noms par défaut
        project_name = db.query(Project).filter(Project.id == project_id).first().name or f"proj{project_id}"
        dataset_name = config.dataset_name or f"Dataset_{project_name.replace(' ','_')}_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
        job_name = config.job_name or f"FineTune_{project_name.replace(' ','_')}_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"

        # Créer le dataset
        new_dataset = Dataset(
            name=dataset_name,
            project_id=project_id,
            description=f"Dataset pour fine-tuning job (payé)",
            model=config.model,
            status="pending",
            system_content=config.system_prompt
        )
        db.add(new_dataset)
        db.commit()
        db.refresh(new_dataset)
        logger.info(f"Webhook: Dataset {new_dataset.id} créé.")

        # Associer les contenus
        pending_transcriptions = []
        contents = db.query(Content).filter(Content.id.in_(content_ids)).all()
        for content in contents:
            db.add(DatasetContent(dataset_id=new_dataset.id, content_id=content.id))
            if content.type == 'youtube' and content.status != 'completed':
                pending_transcriptions.append(content.id)
        db.commit()
        logger.info(f"Webhook: {len(content_ids)} contenus associés au dataset {new_dataset.id}.")

        # Créer le fine-tuning
        new_fine_tuning = FineTuning(
            dataset_id=new_dataset.id,
            name=job_name,
            description=f"Job (payé) pour projet {project_id}",
            model=config.model,
            provider=config.provider,
            status="pending",
            hyperparameters=config.hyperparameters
        )
        db.add(new_fine_tuning)
        db.commit()
        db.refresh(new_fine_tuning)
        logger.info(f"Webhook: FineTuning {new_fine_tuning.id} créé.")

        # 3. Lancer les tâches
        if pending_transcriptions:
            logger.info(f"Webhook: Lancement de {len(pending_transcriptions)} transcriptions YouTube.")
            for content_id in pending_transcriptions:
                try:
                    task = transcribe_youtube_video.delay(content_id)
                    content_obj = db.query(Content).get(content_id)
                    if content_obj:
                        content_obj.task_id = task.id
                        content_obj.status = 'processing'
                        db.commit()
                except Exception as e:
                    logger.error(f"Webhook: Erreur lancement transcription pour content {content_id}: {e}")
        
        logger.info(f"Webhook: Lancement de la génération pour dataset {new_dataset.id}")
        celery_app.send_task("generate_dataset", args=[new_dataset.id], queue='dataset_generation')
        logger.info(f"Webhook: Traitement du paiement pour fine_tuning_job terminé.")

    except Exception as e:
        logger.error(f"Webhook: Erreur lors du traitement du paiement fine_tuning_job: {e}", exc_info=True)
        # Il faudrait idéalement avoir un mécanisme pour notifier ou réessayer

# Supprimer ou commenter l'ancienne fonction si elle n'est plus utilisée
# async def handle_subscription_payment(session: Dict[str, Any]):
#     pass 