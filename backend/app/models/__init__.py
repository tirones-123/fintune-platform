# Importer les modèles dans le bon ordre de dépendance
from app.models.user import User
from app.models.project import Project
from app.models.content import Content
from app.models.dataset import Dataset, DatasetContent, DatasetPair
from app.models.fine_tuning import FineTuning 