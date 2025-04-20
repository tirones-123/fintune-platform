import stripe
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
import logging

from app.core.config import settings
from app.db.session import SessionLocal  # Importer SessionLocal au lieu de get_db
from app.models.user import User
from app.models.payment import Payment, CharacterTransaction
from app.services.character_service import CharacterService
from app.models.content import Content  # Ajouter l'import pour le modèle Content

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

logger = logging.getLogger(__name__)

class StripeService:
    """Service pour gérer les interactions avec l'API Stripe."""
    
    async def create_checkout_session(
        self, 
        amount: int, 
        user_id: int, 
        metadata: Dict[str, Any] = None,
        line_item_name: str = "Achat de Crédits", # Nom par défaut
        line_item_description: Optional[str] = None # Description optionnelle
    ):
        """
        Créer une session de paiement Stripe.
        
        Args:
            amount: Montant en cents (USD)
            user_id: ID de l'utilisateur
            metadata: Métadonnées supplémentaires pour la session
            line_item_name: Nom de l'article affiché sur Stripe
            line_item_description: Description de l'article affiché sur Stripe
        
        Returns:
            Le lien de la session de paiement
        """
        try:
            # Préparer les métadonnées
            session_metadata = {"user_id": str(user_id)}
            if metadata:
                session_metadata.update(metadata)
            
            # --- MODIFICATION : Utiliser price_data au lieu de price ID ---
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[
                    {
                        "price_data": {
                            "currency": "usd",
                            "product_data": {
                                "name": line_item_name, # Utiliser le nom passé en argument
                                "description": line_item_description, # Utiliser la description passée
                            },
                            "unit_amount": amount, # Montant en cents
                        },
                        "quantity": 1,
                    },
                ],
                # --- FIN MODIFICATION ---
                mode="payment",
                success_url=f"{settings.FRONTEND_URL}/dashboard?payment_success=true",
                cancel_url=f"{settings.FRONTEND_URL}/dashboard?payment_cancel=true",
                client_reference_id=str(user_id),
                metadata=session_metadata,
            )
            
            return checkout_session.url
        
        except Exception as e:
            logger.error(f"Erreur lors de la création de la session de paiement: {str(e)}")
            raise e
    
    async def handle_payment_success(self, event: Dict[str, Any]):
        """
        Gérer un paiement réussi pour l'achat de caractères.
        
        Args:
            event: Événement Stripe
        """
        try:
            # Extraire les informations de la session
            session = event["data"]["object"]
            user_id = int(session.get("client_reference_id", 0))
            metadata = session.get("metadata", {})
            
            # Vérifier si c'est un paiement pour des caractères
            payment_type = metadata.get("payment_type")
            if payment_type not in ["character_credits", "onboarding_characters"]:
                logger.warning(f"Type de paiement non pris en charge: {payment_type}")
                return
            
            # Extraire les détails du paiement
            payment_intent_id = session.get("payment_intent")
            amount = session.get("amount_total", 0)
            
            # Obtenir le nombre de caractères acheté
            character_count = metadata.get("character_count", 0)
            if not character_count:
                # Calculer le nombre de caractères basé sur le montant
                # Prix par caractère: 0.000365 $ (multiplier par 100 pour les cents)
                character_count = int(amount / (0.000365 * 100))
            
            # Pour les paiements d'onboarding, le character_count inclut déjà les caractères gratuits
            # mais nous avons seulement facturé les caractères payants
            if payment_type == "onboarding_characters":
                logger.info(f"Traitement d'un paiement d'onboarding avec {character_count} caractères")
                # Aucun ajustement nécessaire car le character_count est le total, incluant les caractères gratuits
            
            # Créer un nouvel enregistrement de paiement en utilisant une session manuelle
            db = SessionLocal()
            try:
                # Enregistrer le paiement
                payment = Payment(
                    user_id=user_id,
                    amount=amount / 100,  # Convertir les cents en dollars
                    currency="USD",
                    status="succeeded",
                    payment_intent_id=payment_intent_id,
                    description=f"Achat de {character_count} caractères"
                )
                db.add(payment)
                db.commit()
                db.refresh(payment)
                
                # Ajouter des caractères au compte de l'utilisateur
                character_service = CharacterService()
                character_service.add_character_credits(
                    db=db,
                    user_id=user_id,
                    character_count=int(character_count),
                    payment_id=payment.id
                )
                
                logger.info(f"Paiement réussi pour l'utilisateur {user_id}: {character_count} caractères ajoutés")
                
                # Vérifier si des transcriptions YouTube sont en attente de traitement
                has_pending_transcriptions = metadata.get("has_pending_transcriptions") == "true"
                
                if has_pending_transcriptions:
                    # Récupérer les IDs des transcriptions en attente
                    pending_transcription_ids_str = metadata.get("pending_transcription_ids", "")
                    if pending_transcription_ids_str:
                        pending_transcription_ids = [int(id_str) for id_str in pending_transcription_ids_str.split(",") if id_str.strip()]
                        
                        if pending_transcription_ids:
                            logger.info(f"Traitement de {len(pending_transcription_ids)} transcriptions en attente")
                            
                            # Traiter chaque transcription en attente
                            for content_id in pending_transcription_ids:
                                await self._process_pending_transcription(content_id, db)
                
                # ===== NOUVELLE FONCTIONNALITÉ: CRÉATION AUTOMATIQUE DU DATASET ET FINE-TUNING =====
                # Vérifier s'il s'agit d'un paiement d'onboarding pour décider de créer le dataset
                if payment_type == "onboarding_characters":
                    # Récupérer les paramètres supplémentaires pour la création du dataset
                    dataset_name = metadata.get("dataset_name", "Dataset d'onboarding")
                    provider = metadata.get("provider", "openai")
                    model = metadata.get("model", "gpt-3.5-turbo")
                    system_content = metadata.get("system_content", "You are a helpful assistant.")
                    
                    # Récupérer l'utilisateur pour obtenir son projet par défaut créé pendant l'onboarding
                    from app.models.user import User
                    from app.models.project import Project
                    from app.models.content import Content
                    from app.models.dataset import Dataset, DatasetContent
                    
                    # Trouver le projet par défaut de l'utilisateur (celui créé pendant l'onboarding)
                    user = db.query(User).filter(User.id == user_id).first()
                    project = db.query(Project).filter(Project.user_id == user_id).order_by(Project.created_at.desc()).first()
                    
                    if not project:
                        logger.error(f"Aucun projet trouvé pour l'utilisateur {user_id} lors de l'onboarding")
                        return
                    
                    # Récupérer tous les contenus de l'utilisateur pour ce projet
                    contents = db.query(Content).filter(
                        Content.project_id == project.id,
                        Content.status.in_(["completed", "awaiting_transcription"])  # Inclure les vidéos en attente
                    ).all()
                    
                    if not contents:
                        logger.warning(f"Aucun contenu trouvé pour le projet {project.id} de l'utilisateur {user_id}")
                        return
                    
                    # Créer un nouveau dataset
                    new_dataset = Dataset(
                        name=dataset_name,
                        project_id=project.id,
                        description="Dataset généré automatiquement après l'onboarding",
                        model=model,
                        status="pending",
                        system_content=system_content
                    )
                    db.add(new_dataset)
                    db.commit()
                    db.refresh(new_dataset)
                    
                    # Associer les contenus au dataset
                    for content in contents:
                        dataset_content = DatasetContent(
                            dataset_id=new_dataset.id,
                            content_id=content.id
                        )
                        db.add(dataset_content)
                    
                    db.commit()
                    
                    # Lancer la tâche de génération du dataset de manière asynchrone
                    try:
                        from celery_app import celery_app
                        logger.info(f"Lancement de la tâche de génération pour le dataset {new_dataset.id}")
                        
                        # Envoyer la tâche à Celery
                        celery_app.send_task(
                            "generate_dataset", 
                            args=[new_dataset.id], 
                            queue='dataset_generation'
                        )
                        
                        # Une fois le dataset créé, le worker déclenchera automatiquement 
                        # le fine-tuning via le callbacks
                        logger.info(f"Tâche de génération de dataset envoyée pour {new_dataset.id}")
                        
                        # Créer une entrée de fine-tuning en attente, qui sera mise à jour 
                        # une fois le dataset généré
                        from app.models.fine_tuning import FineTuning
                        
                        # Vérifier d'abord si l'utilisateur a une clé API pour le provider
                        from app.models.api_key import ApiKey
                        api_key = db.query(ApiKey).filter(
                            ApiKey.user_id == user_id,
                            ApiKey.provider == provider
                        ).first()
                        
                        if api_key:
                            # Créer le fine-tuning en attente
                            fine_tuning = FineTuning(
                                dataset_id=new_dataset.id,
                                name=f"Fine-tuning de {dataset_name}",
                                description="Fine-tuning généré automatiquement après l'onboarding",
                                model=model,
                                provider=provider,
                                status="pending",  # Sera mis à jour une fois le dataset prêt
                                hyperparameters={"n_epochs": 3}  # Valeur par défaut
                            )
                            db.add(fine_tuning)
                            db.commit()
                            
                            logger.info(f"Fine-tuning {fine_tuning.id} créé en attente pour le dataset {new_dataset.id}")
                        else:
                            logger.warning(f"L'utilisateur {user_id} n'a pas de clé API pour le provider {provider}")
                    
                    except Exception as task_error:
                        logger.error(f"Erreur lors du lancement de la tâche de génération: {str(task_error)}")
                    
            except Exception as db_error:
                db.rollback()
                logger.error(f"Erreur de base de données: {str(db_error)}")
            finally:
                db.close()
        
        except Exception as e:
            logger.error(f"Erreur lors du traitement du paiement: {str(e)}")
            raise e
    
    async def _process_pending_transcription(self, content_id: int, db: Session):
        """
        Traiter une transcription YouTube en attente.
        
        Args:
            content_id: ID du contenu à transcrire
            db: Session de base de données
        """
        try:
            # Récupérer le contenu
            content = db.query(Content).filter(Content.id == content_id).first()
            
            if not content:
                logger.warning(f"Contenu non trouvé pour l'ID {content_id}")
                return
            
            # Vérifier si le contenu est en attente de transcription et contient une URL YouTube
            if content.type != 'youtube' or not content.url:
                logger.warning(f"Le contenu {content_id} n'est pas une vidéo YouTube ou ne contient pas d'URL")
                return
            
            logger.info(f"Lancement de la transcription pour le contenu {content_id}: {content.url}")
            
            # Mettre à jour le statut du contenu
            content.status = 'processing'
            db.commit()
            
            # Lancer la tâche de transcription asynchrone
            # Note: Cela nécessite d'importer correctement les tâches Celery
            try:
                from celery_app import celery_app
                from app.tasks.content_processing import transcribe_youtube_video
                
                # Lancer la tâche avec content_id au lieu de l'URL
                task = transcribe_youtube_video.delay(content_id)
                
                # Mettre à jour le contenu avec l'ID de la tâche
                content.task_id = task.id
                db.commit()
                
                logger.info(f"Tâche de transcription lancée pour le contenu {content_id}, ID de tâche: {task.id}")
            except ImportError:
                logger.error("Impossible d'importer les modules Celery requis")
                content.status = 'error'
                content.error_message = "Erreur lors du lancement de la tâche de transcription"
                db.commit()
            except Exception as task_error:
                logger.error(f"Erreur lors du lancement de la tâche de transcription: {str(task_error)}")
                content.status = 'error'
                content.error_message = str(task_error)
                db.commit()
        
        except Exception as e:
            logger.error(f"Erreur lors du traitement de la transcription en attente {content_id}: {str(e)}")
            # Ne pas propager l'erreur pour ne pas bloquer le traitement des autres transcriptions

# Créer une instance du service pour l'importation
stripe_service = StripeService() 