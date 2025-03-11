# FinTune Platform

FinTune est une plateforme SaaS qui permet aux utilisateurs de créer facilement des assistants IA personnalisés en utilisant leurs propres données. La plateforme permet d'importer des contenus, de créer des datasets, et de fine-tuner des modèles de langage sans avoir besoin de compétences techniques avancées.

## Architecture

Le projet est composé de deux parties principales :

- **Frontend** : Une application React qui fournit l'interface utilisateur.
- **Backend** : Une API FastAPI qui gère la logique métier et les interactions avec les services externes.

## Prérequis

- Docker et Docker Compose
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

## Installation

### Avec Docker Compose

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/votre-utilisateur/fintune-platform.git
   cd fintune-platform
   ```

2. Créez un fichier `.env` à la racine du projet en vous basant sur le fichier `.env.example`.

3. Lancez les services avec Docker Compose :
   ```bash
   docker-compose up -d
   ```

4. Accédez à l'application :
   - Frontend : http://localhost:3000
   - API : http://localhost:8000
   - Documentation API : http://localhost:8000/api/docs
   - pgAdmin : http://localhost:5050 (email: admin@fintune.io, mot de passe: admin)

### Installation manuelle

#### Backend

1. Accédez au répertoire du backend :
   ```bash
   cd backend
   ```

2. Créez un environnement virtuel et activez-le :
   ```bash
   python -m venv venv
   source venv/bin/activate  # Sur Windows : venv\Scripts\activate
   ```

3. Installez les dépendances :
   ```bash
   pip install -r requirements.txt
   ```

4. Créez un fichier `.env` en vous basant sur le fichier `.env.example`.

5. Lancez le serveur de développement :
   ```bash
   uvicorn main:app --reload
   ```

#### Frontend

1. Accédez au répertoire du frontend :
   ```bash
   cd frontend
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Créez un fichier `.env.development` en vous basant sur le fichier `.env.development.example`.

4. Lancez le serveur de développement :
   ```bash
   npm start
   ```

## Fonctionnalités

- **Authentification** : Inscription, connexion, et gestion des utilisateurs.
- **Projets** : Création et gestion de projets pour organiser les contenus.
- **Contenus** : Importation de fichiers PDF, texte, et vidéos YouTube.
- **Datasets** : Création de datasets à partir des contenus importés.
- **Fine-tuning** : Fine-tuning de modèles de langage avec les datasets créés.
- **Chat** : Interface de chat pour tester les modèles fine-tunés.
- **Abonnements** : Gestion des abonnements avec Stripe.

## Structure du projet

```
fintune-platform/
├── backend/                # API FastAPI
│   ├── app/                # Code source de l'application
│   │   ├── api/            # Endpoints API
│   │   ├── core/           # Configuration et sécurité
│   │   ├── db/             # Configuration de la base de données
│   │   ├── models/         # Modèles SQLAlchemy
│   │   ├── schemas/        # Schémas Pydantic
│   │   ├── services/       # Services métier
│   │   └── tasks/          # Tâches Celery
│   ├── migrations/         # Migrations Alembic
│   ├── main.py             # Point d'entrée de l'application
│   ├── celery_app.py       # Configuration Celery
│   └── requirements.txt    # Dépendances Python
├── frontend/               # Application React
│   ├── public/             # Fichiers statiques
│   ├── src/                # Code source
│   │   ├── assets/         # Images et ressources
│   │   ├── components/     # Composants React
│   │   ├── context/        # Contextes React
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # Services API
│   │   └── theme/          # Thème Material-UI
│   ├── package.json        # Dépendances Node.js
│   └── Dockerfile          # Configuration Docker
└── docker-compose.yml      # Configuration Docker Compose
```

## Développement

### Backend

- **Migrations** : Pour créer une nouvelle migration, utilisez Alembic :
  ```bash
  cd backend
  alembic revision --autogenerate -m "Description de la migration"
  alembic upgrade head
  ```

- **Tests** : Pour exécuter les tests :
  ```bash
  cd backend
  pytest
  ```

### Frontend

- **Tests** : Pour exécuter les tests :
  ```bash
  cd frontend
  npm test
  ```

- **Build** : Pour créer une version de production :
  ```bash
  cd frontend
  npm run build
  ```

## Déploiement

### Production

1. Mettez à jour les fichiers `.env` avec les valeurs de production.
2. Construisez et déployez les images Docker :
   ```bash
   docker-compose -f docker-compose.prod.yml build
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.