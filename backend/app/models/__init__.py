# Déclarer l'ordre d'importation correct pour éviter les erreurs circulaires
from app.models.user import User
from app.models.api_key import ApiKey  # Assurez-vous que ce fichier existe 
from app.models.subscription import Subscription  # Assurez-vous que ce fichier existe
from app.models.project import Project
from app.models.content import Content
from app.models.dataset import Dataset, DatasetContent, DatasetPair
from app.models.fine_tuning import FineTuning 