from sqlalchemy.orm import Session
from loguru import logger

from app.db.session import SessionLocal

# Importer tous les modèles pour s'assurer qu'ils sont correctement chargés
from app.models import User, Project, Content, Dataset, DatasetContent, DatasetPair, FineTuning

def fix_stuck_datasets():
    """
    Répare les datasets bloqués en statut 'processing' sans avancement.
    """
    db = SessionLocal()
    try:
        # Récupérer tous les datasets bloqués
        stuck_datasets = db.query(Dataset).filter(Dataset.status == "processing").all()
        count = len(stuck_datasets)
        
        if count == 0:
            logger.info("Aucun dataset bloqué trouvé")
            return
        
        logger.info(f"Réparation de {count} datasets bloqués")
        
        # Pour chaque dataset bloqué
        for dataset in stuck_datasets:
            # Marquer comme "ready" pour permettre le fine-tuning
            dataset.status = "ready"
            
            # Compter les paires existantes s'il y en a
            pairs_count = db.query(DatasetPair).filter(DatasetPair.dataset_id == dataset.id).count()
            dataset.pairs_count = pairs_count
            
            logger.info(f"Dataset {dataset.id} marqué comme prêt avec {pairs_count} paires")
        
        db.commit()
        logger.info(f"{count} datasets réparés avec succès")
        
    except Exception as e:
        logger.error(f"Erreur lors de la réparation des datasets: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_stuck_datasets() 