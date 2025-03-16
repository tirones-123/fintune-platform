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

2. Configurez les variables d'environnement :
   ```bash
   # Pour le fichier .env principal
   cp .env.example .env
   
   # Pour le backend
   cp backend/.env.example backend/.env
   
   # Pour le frontend
   cp frontend/.env.example frontend/.env
   cp frontend/.env.development.example frontend/.env.development
   cp frontend/.env.production.example frontend/.env.production
   ```

3. Modifiez les fichiers `.env` créés pour y ajouter vos clés API et autres informations sensibles. 
   **IMPORTANT : Ne commitez jamais ces fichiers dans Git !**

4. Lancez les services avec Docker Compose :
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

## Gestion des variables d'environnement

Pour garantir la sécurité de votre application et éviter de pousser des informations sensibles sur Git, suivez ces bonnes pratiques :

### Structure des fichiers d'environnement

- `.env` : Variables d'environnement principales (racine du projet)
- `backend/.env` : Variables d'environnement spécifiques au backend
- `frontend/.env` : Variables d'environnement de base pour le frontend
- `frontend/.env.development` : Variables pour l'environnement de développement frontend
- `frontend/.env.production` : Variables pour l'environnement de production frontend

### Bonnes pratiques

1. **Ne jamais commiter les fichiers `.env`** : Tous les fichiers `.env` sont ignorés par Git grâce au `.gitignore`.
2. **Utiliser les fichiers `.env.example`** : Ces fichiers servent de modèles et ne contiennent pas de valeurs sensibles.
3. **Documenter les variables requises** : Assurez-vous que les fichiers `.env.example` contiennent toutes les variables nécessaires avec des descriptions claires.
4. **Utiliser des valeurs par défaut sécurisées** : Pour les environnements de développement, utilisez des valeurs par défaut qui fonctionnent localement.
5. **Rotation des clés** : Changez régulièrement vos clés API et autres secrets.

### Déploiement

Lors du déploiement, configurez les variables d'environnement directement sur votre serveur ou votre plateforme d'hébergement, plutôt que de les inclure dans vos fichiers de déploiement.

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.