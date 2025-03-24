from sqlalchemy.orm import Session
from loguru import logger

from app.db.session import SessionLocal
from app.models.dataset import Dataset

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
            # S'il a des pairs, le marquer comme "ready"
            pairs_count = len(dataset.pairs) if hasattr(dataset, "pairs") else 0
            
            if pairs_count > 0:
                dataset.status = "ready"
                dataset.pairs_count = pairs_count
                logger.info(f"Dataset {dataset.id} réparé avec {pairs_count} pairs")
            else:
                # Sinon, le marquer comme prêt mais vide
                dataset.status = "ready"
                dataset.pairs_count = 0
                dataset.error_message = "Aucune paire n'a pu être générée"
                logger.info(f"Dataset {dataset.id} marqué comme prêt (vide)")
        
        db.commit()
        logger.info(f"{count} datasets réparés avec succès")
        
    except Exception as e:
        logger.error(f"Erreur lors de la réparation des datasets: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_stuck_datasets() 