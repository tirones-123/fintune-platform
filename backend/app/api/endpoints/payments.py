from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
import stripe
from datetime import datetime
import logging
from pydantic import BaseModel

from app.core.security import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.models.subscription import Subscription
from app.services.stripe_service import stripe_service
from app.services.character_service import CharacterService

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
        
        # Vérifier si on est dans la limite gratuite
        if character_count <= 10000:  # Les 10 000 premiers caractères sont gratuits
            logger.info(f"Nombre de caractères ({character_count}) dans la limite gratuite")
            
            # Ajouter les caractères gratuitement
            db_session = next(get_db())
            try:
                # Initialiser le service de caractères
                character_service = CharacterService()
                
                # Ajouter les caractères
                success = character_service.add_character_credits(
                    db=db_session,
                    user_id=current_user.id,
                    character_count=character_count,
                    payment_id=None  # Pas de paiement associé pour les caractères gratuits
                )
                
                if success:
                    logger.info(f"Ajout gratuit de {character_count} caractères réussi")
                    
                    # Si des transcriptions sont en attente, démarrer le traitement
                    if pending_transcriptions:
                        logger.info(f"Traitement de {len(pending_transcriptions)} transcriptions en attente")
                        
                        # Traiter chaque transcription
                        for content_id in pending_transcriptions:
                            # Vérifier si content_id est un entier ou un dictionnaire
                            if isinstance(content_id, dict) and "id" in content_id:
                                content_id = content_id["id"]
                            
                            if content_id:
                                # Récupérer le contenu
                                from app.models.content import Content
                                content = db_session.query(Content).filter(Content.id == content_id).first()
                                
                                if content and content.type == 'youtube' and content.url:
                                    # Mettre à jour le statut
                                    content.status = 'processing'
                                    db_session.commit()
                                    
                                    # Lancer la tâche de transcription
                                    try:
                                        from celery_app import celery_app
                                        from app.tasks.content_processing import transcribe_youtube_video
                                        
                                        # Lancer la tâche avec content_id
                                        task = transcribe_youtube_video.delay(content_id)
                                        content.task_id = task.id
                                        db_session.commit()
                                        
                                        logger.info(f"Tâche de transcription lancée pour le contenu {content_id}, ID de tâche: {task.id}")
                                    except Exception as task_error:
                                        logger.error(f"Erreur lors du lancement de la transcription: {str(task_error)}")
                    
                    # Récupérer les paramètres pour le dataset/fine-tuning depuis la requête ou utiliser des valeurs par défaut
                    from app.models.project import Project
                    from app.models.content import Content
                    from app.models.dataset import Dataset, DatasetContent
                    from app.models.fine_tuning import FineTuning
                    from app.models.api_key import ApiKey
                    
                    # Extraire les données supplémentaires de l'onboarding si disponibles
                    dataset_name = request.dataset_name if hasattr(request, 'dataset_name') else "Dataset d'onboarding"
                    system_content = request.system_content if hasattr(request, 'system_content') else "You are a helpful assistant."
                    provider = request.provider if hasattr(request, 'provider') else "openai"
                    model = request.model if hasattr(request, 'model') else "gpt-3.5-turbo"
                    
                    # Trouver le projet par défaut de l'utilisateur
                    project = db_session.query(Project).filter(Project.user_id == current_user.id).order_by(Project.created_at.desc()).first()
                    
                    if project:
                        # Récupérer tous les contenus de l'utilisateur pour ce projet
                        contents = db_session.query(Content).filter(
                            Content.project_id == project.id,
                            Content.status.in_(["completed", "processing"])
                        ).all()
                        
                        if contents:
                            # Créer un nouveau dataset
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
                            
                            # Associer les contenus au dataset
                            for content in contents:
                                dataset_content = DatasetContent(
                                    dataset_id=new_dataset.id,
                                    content_id=content.id
                                )
                                db_session.add(dataset_content)
                            
                            db_session.commit()
                            
                            # Lancer la tâche de génération du dataset
                            try:
                                from celery_app import celery_app
                                logger.info(f"Lancement de la tâche de génération pour le dataset {new_dataset.id}")
                                
                                # Envoyer la tâche à Celery
                                celery_app.send_task(
                                    "generate_dataset", 
                                    args=[new_dataset.id], 
                                    queue='dataset_generation'
                                )
                                
                                # Vérifier si l'utilisateur a une clé API pour le provider
                                api_key = db_session.query(ApiKey).filter(
                                    ApiKey.user_id == current_user.id,
                                    ApiKey.provider == provider
                                ).first()
                                
                                if api_key:
                                    # Créer le fine-tuning en attente
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
                                    logger.warning(f"L'utilisateur {current_user.id} n'a pas de clé API pour le provider {provider}")
                            
                            except Exception as task_error:
                                logger.error(f"Erreur lors du lancement de la tâche de génération: {str(task_error)}")
                    
                    # Retourner l'URL avec le signal
                    return {
                        "status": "success",
                        "free_processing": True,
                        "redirect_url": f"{settings.FRONTEND_URL}/dashboard?onboarding_completed=true"
                    }
                else:
                    logger.error(f"Échec de l'ajout gratuit de {character_count} caractères")
            except Exception as e:
                logger.error(f"Erreur lors de l'ajout gratuit de caractères: {str(e)}")
                db_session.rollback()
            finally:
                db_session.close()
        
        # Calcul du montant à facturer (uniquement les caractères au-delà de 10 000)
        billable_characters = max(0, character_count - 10000)
        # Prix par caractère: 0.000365$
        amount_in_cents = max(50, round(billable_characters * 0.000365 * 100))  # Minimum 50 cents (0.50$)
        
        logger.info(f"Facturation de {billable_characters} caractères à ${amount_in_cents/100}")
        
        # Juste après le calcul de amount_in_cents
        if amount_in_cents < 60:  # Si moins de 60 cents USD
            logger.info(f"Montant trop faible pour Stripe (${amount_in_cents/100}), traitement gratuit")
            # Utiliser le même code que pour les caractères gratuits
            # Ajouter les caractères gratuitement
            db_session = next(get_db())
            try:
                # Initialiser le service de caractères
                character_service = CharacterService()
                
                # Ajouter les caractères
                success = character_service.add_character_credits(
                    db=db_session,
                    user_id=current_user.id,
                    character_count=character_count,
                    payment_id=None  # Pas de paiement associé
                )
                
                if success and pending_transcriptions:
                    logger.info(f"Traitement de {len(pending_transcriptions)} transcriptions en attente")
                    
                    # Traiter chaque transcription
                    for content_id in pending_transcriptions:
                        # Vérifier si content_id est un entier ou un dictionnaire
                        if isinstance(content_id, dict) and "id" in content_id:
                            content_id = content_id["id"]
                        
                        if content_id:
                            # Récupérer le contenu
                            from app.models.content import Content
                            content = db_session.query(Content).filter(Content.id == content_id).first()
                            
                            if content and content.type == 'youtube' and content.url:
                                # Mettre à jour le statut
                                content.status = 'processing'
                                db_session.commit()
                                
                                # Lancer la tâche de transcription
                                try:
                                    from celery_app import celery_app
                                    from app.tasks.content_processing import transcribe_youtube_video
                                    
                                    # Lancer la tâche avec content_id
                                    task = transcribe_youtube_video.delay(content_id)
                                    content.task_id = task.id
                                    db_session.commit()
                                    
                                    logger.info(f"Tâche de transcription lancée pour le contenu {content_id}, ID de tâche: {task.id}")
                                except Exception as task_error:
                                    logger.error(f"Erreur lors du lancement de la transcription: {str(task_error)}")
                
            except Exception as e:
                logger.error(f"Erreur dans le traitement gratuit pour montant trop faible: {str(e)}")
                db_session.rollback()
            
            # Renvoyer une réponse compatible avec le frontend, incluant le signal
            return {
                "status": "success", 
                "free_processing": True,
                "redirect_url": f"{settings.FRONTEND_URL}/dashboard?onboarding_completed=true"
            }
        
        # Métadonnées pour la session Stripe
        metadata = {
            "payment_type": "onboarding_characters", 
            "user_id": str(current_user.id),
            "character_count": str(character_count),
            "free_characters": "10000",
            "billable_characters": str(billable_characters)
        }
        
        # Ajouter les informations sur les transcriptions en attente s'il y en a
        if pending_transcriptions:
            # Limiter la taille des métadonnées Stripe en ne stockant que les IDs des transcriptions
            transcription_ids = [str(trans["id"]) for trans in pending_transcriptions]
            metadata["pending_transcription_ids"] = ",".join(transcription_ids)
            metadata["has_pending_transcriptions"] = "true"
            
            # Stocker les détails complets dans une table temporaire ou un cache pour traitement ultérieur
            # par le webhook
            logger.info(f"Stockage des détails de {len(pending_transcriptions)} transcriptions pour traitement webhook")
            # TODO: Implémenter le stockage des détails de transcription
        
        # Créer une session de paiement pour les caractères facturables
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": f"Fine-tuning - {character_count} caractères",
                            "description": f"Onboarding avec {billable_characters} caractères facturables (10 000 caractères gratuits inclus)"
                        },
                        "unit_amount": amount_in_cents,  # Montant en cents
                    },
                    "quantity": 1,
                },
            ],
            mode="payment",
            success_url=f"{settings.FRONTEND_URL}/dashboard?payment_success=true",
            cancel_url=f"{settings.FRONTEND_URL}/dashboard?payment_cancel=true",
            client_reference_id=str(current_user.id),
            metadata=metadata
        )
        
        return {"checkout_url": checkout_session.url}
    
    except Exception as e:
        logger.error(f"Erreur lors de la création de la session d'onboarding: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de la session de paiement pour l'onboarding: {str(e)}"
        )

@router.post("/create-checkout-session")
async def create_checkout_session(
    current_user: User = Depends(get_current_user)
):
    """
    Créer une session de paiement pour un abonnement.
    """
    try:
        # Créer une session de paiement avec Stripe
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price": settings.STRIPE_PRICE_ID,
                    "quantity": 1,
                },
            ],
            mode="payment",  # Paiement unique au lieu d'abonnement
            success_url=f"{settings.FRONTEND_URL}/dashboard?payment_success=true",
            cancel_url=f"{settings.FRONTEND_URL}/dashboard?payment_cancel=true",
            client_reference_id=str(current_user.id),
            metadata={"payment_type": "character_credits", "user_id": str(current_user.id)}
        )
        
        return {"checkout_url": checkout_session.url}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de la session de paiement: {str(e)}"
        )

@router.post("/create-checkout-session/{plan_id}")
async def create_plan_checkout_session(
    plan_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Créer une session de paiement pour un plan d'abonnement spécifique (compatibilité)
    ou rediriger vers le nouvel achat à l'usage
    """
    try:
        # Mapper l'ancien système d'abonnement au nouveau système à l'usage
        # Dans la nouvelle version, tous les plans redirigent vers l'achat de caractères
        
        # Déterminer le nombre de caractères offerts en fonction du plan
        character_credit_mapping = {
            "starter": 100000,  # 100k caractères = 36.5$
            "pro": 500000,      # 500k caractères = 182.5$
            "enterprise": 2000000  # 2M caractères = 730$
        }
        
        # Si plan inconnu, utiliser starter par défaut
        character_count = character_credit_mapping.get(plan_id.lower(), 100000)
        
        # Calculer le montant en cents (arrondi au cent le plus proche)
        # Prix = (nombre de caractères * 0,000365$) * 100 cents (arrondi)
        amount_in_cents = max(0, round((character_count * 0.000365) * 100))
        
        # Si montant gratuit (0), rediriger directement vers le dashboard
        if amount_in_cents == 0:
            # Créer une transaction de caractères sans paiement
            db = get_db()
            db_session = next(db)
            try:
                # Ajouter directement des caractères au compte
                character_service = CharacterService()
                character_service.add_character_credits(
                    db=db_session,
                    user_id=current_user.id,
                    character_count=character_count,
                    payment_id=None  # Pas de paiement associé
                )
                db_session.commit()
            except Exception as e:
                db_session.rollback()
                logger.error(f"Erreur lors de l'ajout de caractères gratuits: {str(e)}")
            finally:
                db_session.close()
                
            # Retourner l'URL du dashboard directement
            return {"checkout_url": f"{settings.FRONTEND_URL}/dashboard?payment_success=true"}
        
        # Créer une session de paiement pour l'achat de caractères
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": f"Crédits de caractères ({character_count:,} caractères)",
                            "description": f"Achat de {character_count:,} caractères pour le fine-tuning de modèles IA"
                        },
                        "unit_amount": amount_in_cents,  # Montant en cents
                    },
                    "quantity": 1,
                },
            ],
            mode="payment",
            success_url=f"{settings.FRONTEND_URL}/dashboard?payment_success=true",
            cancel_url=f"{settings.FRONTEND_URL}/dashboard?payment_cancel=true",
            client_reference_id=str(current_user.id),
            metadata={
                "payment_type": "character_credits", 
                "user_id": str(current_user.id),
                "original_plan": plan_id,
                "character_count": str(character_count)
            }
        )
        
        return {"checkout_url": checkout_session.url}
    
    except Exception as e:
        logger.error(f"Erreur lors de la création de la session de paiement: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de la session de paiement: {str(e)}"
        )

@router.post("/customer-portal")
async def customer_portal(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Rediriger l'utilisateur vers le portail client Stripe.
    """
    try:
        # Récupérer le customer_id Stripe de l'utilisateur depuis la base de données
        stripe_customer_id = None
        
        # Si l'utilisateur a un abonnement
        if current_user.subscription and current_user.subscription.stripe_customer_id:
            stripe_customer_id = current_user.subscription.stripe_customer_id
        
        if not stripe_customer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="L'utilisateur n'a pas d'identifiant client Stripe"
            )
        
        # Créer une session pour le portail client
        session = stripe.billing_portal.Session.create(
            customer=stripe_customer_id,
            return_url=f"{settings.FRONTEND_URL}/dashboard",
        )
        
        return {"url": session.url}
    
    except HTTPException as e:
        raise e
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de la session du portail client: {str(e)}"
        )

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Webhook pour gérer les événements de Stripe.
    """
    # Récupérer le corps de la requête
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        # Vérifier la signature de Stripe
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
        
        # Gérer l'événement
        if event["type"] == "checkout.session.completed":
            # Paiement réussi
            session = event["data"]["object"]
            
            # Vérifier le type de paiement
            metadata = session.get("metadata", {})
            payment_type = metadata.get("payment_type")
            
            if payment_type in ["character_credits", "onboarding_characters"]:
                # Traiter l'achat de caractères ou l'onboarding
                logger.info(f"Traitement d'un paiement de type {payment_type}")
                await stripe_service.handle_payment_success(event)
            else:
                # Traiter l'abonnement (ancien système)
                logger.info("Traitement d'un paiement d'abonnement")
                await handle_subscription_payment(session)
        
        # Répondre avec un statut 200 pour indiquer que l'événement a été reçu
        return {"status": "success"}
    
    except Exception as e:
        # En cas d'erreur, journaliser l'erreur et renvoyer un statut 400
        logging.error(f"Erreur lors du traitement du webhook Stripe: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erreur lors du traitement du webhook: {str(e)}"
        )

async def handle_subscription_payment(session: Dict[str, Any]):
    """
    Gérer un paiement d'abonnement réussi.
    """
    # Implémentation existante pour gérer les abonnements
    # À adapter en fonction des besoins spécifiques
    pass 