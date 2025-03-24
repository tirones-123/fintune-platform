# Déclarer uniquement les modèles qui existent réellement
from app.models.user import User
# from app.models.api_key import ApiKey  # Commentez ou supprimez si n'existe pas
# from app.models.subscription import Subscription  # Commentez ou supprimez si n'existe pas
from app.models.project import Project
from app.models.content import Content
from app.models.dataset import Dataset, DatasetContent, DatasetPair
from app.models.fine_tuning import FineTuning 