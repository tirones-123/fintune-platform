# FinTune Platform

FinTune est une plateforme SaaS qui permet aux utilisateurs de créer facilement des assistants IA personnalisés en utilisant leurs propres données. La plateforme permet d'importer des contenus, de créer des datasets, et de fine-tuner des modèles de langage sans avoir besoin de compétences techniques avancées.

## Architecture

Le projet est composé de plusieurs services :

- **Frontend** : Une application React (Node.js 20) avec Material-UI, servie par Nginx
- **Backend** : Une API FastAPI (Python 3.11) qui gère la logique métier
- **Celery** : Pour les tâches asynchrones et le traitement en arrière-plan
- **Nginx** : Reverse proxy pour la gestion des requêtes HTTPS et le routage
- **PostgreSQL** : Base de données principale
- **Redis** : Pour le cache et les files d'attente Celery
- **MongoDB** : Pour le stockage de certaines données spécifiques
- **pgAdmin** : Interface d'administration de la base de données

## Prérequis

- Docker et Docker Compose
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- MongoDB

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

5. Accédez à l'application :
   - Frontend : http://localhost:3000
   - API : http://localhost:8000
   - Documentation API : http://localhost:8000/api/docs
   - pgAdmin : http://localhost:5050 (email: admin@admin.com, mot de passe: admin)

### Configuration des services Docker

Le projet utilise plusieurs conteneurs Docker configurés via `docker-compose.yml` :

#### Frontend (Node.js + Nginx)
- Build en deux étapes : Node.js pour la compilation, Nginx pour le serveur
- Ports : 3000:80 (développement), 80/443 (production)
- Volumes pour les certificats SSL et la configuration Nginx
- Configuration automatique du nom d'hôte virtuel

#### Backend (FastAPI)
- Base Python 3.11-slim
- Exposition du port 8000
- Volumes pour le code source et les uploads
- Variables d'environnement pour :
  - Base de données PostgreSQL
  - Redis
  - MongoDB
  - Clés API (OpenAI, Anthropic, Mistral)
  - Configuration Stripe
  - Celery

#### Services additionnels
- **Celery Worker** : Traitement asynchrone des tâches
- **PostgreSQL** : Base de données (port 5433)
- **Redis** : Cache et broker Celery (port 6381)
- **pgAdmin** : Interface d'administration BDD (port 5050)
- **Nginx Proxy** : Reverse proxy avec support SSL

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
- **API** : Documentation complète des endpoints API dans le fichier `/backend/API_DOCUMENTATION.md`.

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
│   ├── alembic/            # Migrations Alembic
│   ├── main.py             # Point d'entrée de l'application
│   ├── celery_app.py       # Configuration Celery
│   └── requirements.txt    # Dépendances Python
├── frontend/               # Application React
│   ├── public/             # Fichiers statiques
│   ├── src/                # Code source
│   │   ├── components/     # Composants React
│   │   ├── context/        # Contextes React
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # Services API
│   │   └── theme/          # Thème Material-UI
│   ├── nginx.conf          # Configuration Nginx
│   ├── package.json        # Dépendances Node.js
│   └── Dockerfile          # Configuration Docker
├── deploy_to_production.sh # Script de déploiement en production
├── docker-compose.yml      # Configuration Docker Compose
└── .env.example            # Modèle pour le fichier .env principal
```

## Développement

### Backend

- **Migrations** : Pour créer une nouvelle migration, utilisez Alembic :
  ```bash
  cd backend
  python create_migration.py "Description de la migration"
  ```

- **Tests** : Pour exécuter les tests :
  ```bash
  cd backend
  python run_tests.py
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
  npm run build:prod
  ```

## Déploiement en production

Pour déployer les modifications en production, utilisez le script `deploy_to_production.sh` :

```bash
./deploy_to_production.sh
```

Ce script effectue les opérations suivantes :
1. Commit et push des modifications vers le dépôt Git
2. Connexion au serveur de production
3. Mise à jour du code source (git pull)
4. Arrêt des conteneurs Docker
5. Reconstruction des images Docker
6. Démarrage des services

Alternativement, vous pouvez suivre ce processus manuellement :

```bash
# 1. Push des modifications
git add .
git commit -m "mise à jour"
git push origin main

# 2. Sur le serveur
cd /fintune-platform
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Configuration SSL/HTTPS

Le projet inclut une configuration HTTPS avec les éléments suivants :
- Certificats SSL stockés dans `frontend/certs/`
- Configuration Nginx dans `frontend/conf.d/`
- Redirection automatique HTTP vers HTTPS
- Support des noms d'hôte virtuels

## Gestion des variables d'environnement

Pour garantir la sécurité de votre application et éviter de pousser des informations sensibles sur Git, suivez ces bonnes pratiques :

### Structure des fichiers d'environnement

- `.env` : Variables d'environnement principales (racine du projet)
  - Clés API (OpenAI, Anthropic, Mistral)
  - Configuration Stripe
  - URLs des services externes
  - Paramètres de sécurité

- `backend/.env` : Variables d'environnement spécifiques au backend
  - Configuration des bases de données
  - Paramètres Celery
  - Chemins des fichiers

- `frontend/.env` : Variables d'environnement de base pour le frontend
- `frontend/.env.development` : Variables pour l'environnement de développement frontend
- `frontend/.env.production` : Variables pour l'environnement de production frontend
  - URL de l'API
  - Configuration des services tiers
  - Paramètres de build

### Bonnes pratiques

1. **Ne jamais commiter les fichiers `.env`** : Tous les fichiers `.env` sont ignorés par Git grâce au `.gitignore`.
2. **Utiliser les fichiers `.env.example`** : Ces fichiers servent de modèles et ne contiennent pas de valeurs sensibles.
3. **Documenter les variables requises** : Assurez-vous que les fichiers `.env.example` contiennent toutes les variables nécessaires avec des descriptions claires.

## Licence

Ce projet est sous licence propriétaire. Tous droits réservés.