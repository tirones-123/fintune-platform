from loguru import logger
from sqlalchemy.orm import Session
from typing import Optional, Tuple
import math

from app.models.user import User
from app.models.payment import CharacterTransaction
from app.models.dataset import Dataset

class CharacterService:
    """Service pour gérer les transactions et le pricing basé sur les caractères."""
    
    # Constantes de pricing
    COST_PER_CHARACTER = 0.000000073  # Coût de production par caractère
    PRICE_PER_CHARACTER = 0.000365    # Prix facturé à l'utilisateur
    FREE_CHARACTERS = 10000           # Nombre de caractères gratuits par utilisateur
    
    def calculate_character_count(self, text: str) -> int:
        """
        Calcule le nombre de caractères dans un texte.
        
        Args:
            text: Le texte à évaluer.
            
        Returns:
            Le nombre de caractères.
        """
        if not text:
            return 0
        return len(text)
    
    def calculate_price(self, character_count: int) -> float:
        """
        Calcule le prix pour un nombre donné de caractères.
        
        Args:
            character_count: Nombre de caractères.
            
        Returns:
            Prix en dollars.
        """
        return character_count * self.PRICE_PER_CHARACTER
    
    def process_dataset_characters(self, db: Session, user_id: int, dataset_id: int, character_count: int) -> Tuple[bool, int, float]:
        """
        Traite la consommation de caractères pour un dataset.
        
        Args:
            db: Session de base de données.
            user_id: ID de l'utilisateur.
            dataset_id: ID du dataset.
            character_count: Nombre de caractères dans le dataset.
            
        Returns:
            Tuple contenant:
            - Un booléen indiquant si la transaction a réussi
            - Le nombre de caractères payants (après déduction des caractères gratuits)
            - Le prix total
        """
        try:
            # Récupérer l'utilisateur
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                logger.error(f"Utilisateur {user_id} non trouvé")
                return False, 0, 0.0
            
            # Récupérer le dataset
            dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
            if not dataset:
                logger.error(f"Dataset {dataset_id} non trouvé")
                return False, 0, 0.0
            
            # Mettre à jour le dataset avec le nombre de caractères
            dataset.character_count = character_count
            
            # Calculer combien de caractères gratuits peuvent être utilisés
            free_chars_to_use = min(user.free_characters_remaining, character_count)
            
            # Calculer combien de caractères doivent être payants
            paid_chars = character_count - free_chars_to_use
            
            # Calculer le prix
            price = self.calculate_price(paid_chars) if paid_chars > 0 else 0.0
            
            # Mettre à jour le nombre de caractères gratuits restants
            user.free_characters_remaining -= free_chars_to_use
            user.total_characters_used += character_count
            
            # Créer une transaction pour les caractères gratuits (si utilisés)
            if free_chars_to_use > 0:
                free_transaction = CharacterTransaction(
                    user_id=user_id,
                    dataset_id=dataset_id,
                    amount=-free_chars_to_use,
                    description=f"Utilisation de {free_chars_to_use} caractères gratuits pour le dataset {dataset.name}",
                    price_per_character=0.0,
                    total_price=0.0
                )
                db.add(free_transaction)
            
            # Créer une transaction pour les caractères payants (si présents)
            if paid_chars > 0:
                paid_transaction = CharacterTransaction(
                    user_id=user_id,
                    dataset_id=dataset_id,
                    amount=-paid_chars,
                    description=f"Utilisation de {paid_chars} caractères payants pour le dataset {dataset.name}",
                    price_per_character=self.PRICE_PER_CHARACTER,
                    total_price=price
                )
                db.add(paid_transaction)
            
            db.commit()
            
            return True, paid_chars, price
            
        except Exception as e:
            logger.error(f"Erreur lors du traitement des caractères: {str(e)}")
            db.rollback()
            return False, 0, 0.0
    
    def add_character_credits(self, db: Session, user_id: int, character_count: int, payment_id: Optional[int] = None) -> bool:
        """
        Ajoute des crédits de caractères à un utilisateur.
        
        Args:
            db: Session de base de données.
            user_id: ID de l'utilisateur.
            character_count: Nombre de caractères à ajouter.
            payment_id: ID du paiement associé (facultatif).
            
        Returns:
            True si l'opération a réussi, False sinon.
        """
        try:
            # Récupérer l'utilisateur
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                logger.error(f"Utilisateur {user_id} non trouvé")
                return False
            
            # Calculer le prix total
            price = self.calculate_price(character_count)
            
            # Créer une transaction pour les caractères achetés
            transaction = CharacterTransaction(
                user_id=user_id,
                amount=character_count,
                description=f"Achat de {character_count} caractères",
                payment_id=payment_id,
                price_per_character=self.PRICE_PER_CHARACTER,
                total_price=price
            )
            db.add(transaction)
            
            # Mettre à jour le solde de caractères gratuits de l'utilisateur
            user.free_characters_remaining += character_count
            
            db.commit()
            return True
            
        except Exception as e:
            logger.error(f"Erreur lors de l'ajout de crédits de caractères: {str(e)}")
            db.rollback()
            return False
    
    def get_usage_quality_score(self, character_count: int, usage_type: str) -> float:
        """
        Calcule un score de qualité pour un usage spécifique en fonction du nombre de caractères.
        
        Args:
            character_count: Nombre de caractères.
            usage_type: Type d'usage (ex: 'customer_support', 'sales', 'generic').
            
        Returns:
            Score de qualité entre 0.0 et 1.0.
        """
        # Définir les seuils de caractères recommandés pour différents types d'usage
        thresholds = {
            'customer_support': 50000,
            'sales': 30000,
            'marketing': 40000,
            'technical': 60000,
            'legal': 80000,
            'medical': 100000,
            'generic': 20000
        }
        
        # Utiliser le seuil générique par défaut
        recommended_chars = thresholds.get(usage_type, thresholds['generic'])
        
        # Calculer le score (fonction sigmoïde)
        if character_count >= recommended_chars:
            return 1.0
        elif character_count <= 0:
            return 0.0
        else:
            # Score qui augmente rapidement jusqu'à 0.7 puis plus lentement jusqu'à 1.0
            return min(1.0, (character_count / recommended_chars) ** 0.7)
    
    def get_improvement_suggestions(self, character_count: int, usage_type: str) -> list:
        """
        Fournit des suggestions pour améliorer la qualité des données en fonction du score.
        
        Args:
            character_count: Nombre de caractères.
            usage_type: Type d'usage.
            
        Returns:
            Liste de suggestions.
        """
        score = self.get_usage_quality_score(character_count, usage_type)
        suggestions = []
        
        if score < 0.3:
            suggestions.append("Votre jeu de données est très limité. Ajoutez beaucoup plus de contenu pour obtenir des résultats satisfaisants.")
            suggestions.append("Essayez d'ajouter au moins 10 000 caractères supplémentaires.")
        elif score < 0.6:
            suggestions.append("Votre jeu de données pourrait être amélioré. Ajoutez plus de contenu pour de meilleurs résultats.")
            suggestions.append("Incluez des exemples plus variés pour couvrir différents aspects de votre domaine.")
        elif score < 0.8:
            suggestions.append("Votre jeu de données est bon, mais pourrait être encore amélioré pour des résultats optimaux.")
            suggestions.append("Ajoutez des contenus plus spécifiques à votre cas d'utilisation.")
        
        return suggestions

    async def handle_fine_tuning_cost(self, db: Session, user: User, character_count: int) -> dict:
        """
        Détermine si un paiement est nécessaire pour un job de fine-tuning,
        en fonction des caractères, des crédits restants et du statut 'has_received_free_credits' de l'utilisateur.
        
        Args:
            db: Session de base de données.
            user: L'objet User concerné.
            character_count: Nombre total de caractères pour le job.
            
        Returns:
            Un dictionnaire contenant:
            - needs_payment: bool
            - amount_usd: float (montant à payer, 0 si traitement gratuit)
            - amount_cents: int (montant à payer en cents)
            - reason: str|None (raison si gratuit: 'first_free_quota', 'already_used_quota', ou 'low_amount')
            - billable_characters: int (nombre de caractères facturables)
            - apply_free_credits: bool (Indique si l'endpoint appelant doit marquer les crédits comme reçus)
        """
        try:
            # L'utilisateur est déjà passé en argument
            # user = db.query(User).filter(User.id == user_id).first()
            # if not user:
            #     logger.error(f"Utilisateur {user.id} non trouvé pour handle_fine_tuning_cost")
            #     raise ValueError(f"User {user.id} not found")

            # Cas 1: Moins de 10k caractères ET crédits gratuits non encore reçus
            if character_count <= self.FREE_CHARACTERS and not user.has_received_free_credits:
                logger.info(f"Job pour User {user.id}: Traitement gratuit (première fois <= {self.FREE_CHARACTERS} caractères).")
                return {
                    "needs_payment": False,
                    "amount_usd": 0.0,
                    "amount_cents": 0,
                    "reason": "first_free_quota",
                    "billable_characters": 0,
                    "apply_free_credits": True # Indiquer qu'il faut marquer les crédits
                }
            
            # Cas 2: Moins de 10k caractères MAIS crédits gratuits déjà reçus
            elif character_count <= self.FREE_CHARACTERS and user.has_received_free_credits:
                logger.info(f"Job pour User {user.id}: Traitement gratuit (<= {self.FREE_CHARACTERS} caractères, quota déjà utilisé).")
                return {
                    "needs_payment": False,
                    "amount_usd": 0.0,
                    "amount_cents": 0,
                    "reason": "already_used_quota",
                    "billable_characters": 0,
                    "apply_free_credits": False # Ne pas marquer à nouveau
                }

            # Cas 3: Plus de 10k caractères
            else: # character_count > self.FREE_CHARACTERS
                # Calculer les caractères facturables (au-delà du quota gratuit)
                billable_characters = character_count - self.FREE_CHARACTERS
                amount_usd = self.calculate_price(billable_characters)
                amount_cents = max(0, round(amount_usd * 100))
                
                # Vérifier si le montant est suffisant pour Stripe
                if amount_cents < 60: # Seuil Stripe (ajuster si nécessaire)
                    logger.info(f"Job pour User {user.id}: Montant trop faible (${amount_usd:.2f}) pour {billable_characters} caractères facturables. Traitement gratuit.")
                    return {
                        "needs_payment": False, 
                        "amount_usd": amount_usd,
                        "amount_cents": amount_cents,
                        "reason": "low_amount",
                        "billable_characters": billable_characters,
                        "apply_free_credits": False # Les crédits gratuits sont déjà dépassés
                    }
                else:
                    logger.info(f"Job pour User {user.id}: Paiement requis pour {billable_characters} caractères (${amount_usd:.2f}).")
                    return {
                        "needs_payment": True, 
                        "amount_usd": amount_usd,
                        "amount_cents": int(amount_cents), 
                        "reason": None,
                        "billable_characters": billable_characters,
                        "apply_free_credits": False
                    }

        except Exception as e:
            logger.error(f"Erreur dans handle_fine_tuning_cost pour user {user.id}: {e}", exc_info=True)
            raise

# Créer une instance singleton
character_service = CharacterService() 