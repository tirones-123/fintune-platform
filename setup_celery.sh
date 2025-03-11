#!/bin/bash

# Script pour configurer Celery sur le serveur FinTune

# Créer le fichier celery_app.py
cat > /opt/fintune/backend/celery_app.py << 'EOL'
from celery import Celery
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get Redis URL from environment or use default
redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")

# Create Celery instance
celery_app = Celery(
    "fintune_tasks",
    broker=redis_url,
    backend=redis_url,
)

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    worker_hijack_root_logger=False,
)

# Example task
@celery_app.task
def example_task(name):
    return f"Hello {name}!"

if __name__ == "__main__":
    celery_app.start()
EOL

# Modifier le fichier main.py pour intégrer Celery
cp /opt/fintune/backend/main.py /opt/fintune/backend/main.py.backup
cat > /opt/fintune/backend/main.py << 'EOL'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from celery_app import celery_app, example_task

app = FastAPI(
    title="FinTune Platform API",
    description="API for the FinTune Platform - A SaaS for automated fine-tuning dataset generation",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint to check if the API is running."""
    return {"message": "Welcome to FinTune Platform API"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.get("/api/payments/balance")
async def get_credit_balance():
    """Mock endpoint for credit balance."""
    return {"credit_balance": 100.0}

@app.get("/api/payments/usage")
async def get_usage_records():
    """Mock endpoint for usage records."""
    return [
        {
            "id": "1",
            "usage_type": "content_processing",
            "quantity": 5.2,
            "unit_price": 0.05,
            "total_cost": 0.26,
            "description": "Processing PDF document",
            "created_at": "2023-03-07T12:00:00Z"
        },
        {
            "id": "2",
            "usage_type": "dataset_generation",
            "quantity": 10,
            "unit_price": 0.1,
            "total_cost": 1.0,
            "description": "Generating QA pairs",
            "created_at": "2023-03-07T13:00:00Z"
        }
    ]

@app.get("/api/tasks/test")
async def test_celery_task():
    """Test endpoint for Celery tasks."""
    task = example_task.delay("FinTune User")
    return {"task_id": task.id, "message": "Task started"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
EOL

# Modifier le fichier docker-compose.yml
cp /opt/fintune/docker-compose.yml /opt/fintune/docker-compose.yml.backup
sed -i 's/celery -A services.tasks.celery_app worker --loglevel=info/celery -A celery_app worker --loglevel=info/g' /opt/fintune/docker-compose.yml
sed -i 's/celery -A services.tasks.celery_app flower --port=5555/celery -A celery_app flower --port=5555/g' /opt/fintune/docker-compose.yml

# Créer le guide de déploiement
cat > /opt/fintune/DEPLOYMENT_GUIDE.md << 'EOL'
# Guide de Déploiement de FinTune Platform

Ce guide détaille les étapes nécessaires pour déployer la plateforme FinTune sur un serveur VPS.

## Prérequis

- Un serveur VPS avec Ubuntu 22.04 ou plus récent
- Un nom de domaine configuré pour pointer vers votre serveur
- Docker et Docker Compose installés sur le serveur
- Accès SSH au serveur

## 1. Préparation du Serveur

### 1.1 Connexion au Serveur

```bash
ssh root@votre_ip_serveur
```

### 1.2 Installation des Dépendances

```bash
# Mettre à jour les paquets
apt update && apt upgrade -y

# Installer Docker
apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt update
apt install -y docker-ce

# Installer Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Installer Nginx
apt install -y nginx

# Installer Certbot pour les certificats SSL
apt install -y certbot python3-certbot-nginx
```

### 1.3 Configuration du Pare-feu

```bash
# Configurer UFW
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

## 2. Déploiement de l'Application

### 2.1 Cloner le Dépôt

```bash
mkdir -p /opt
cd /opt
git clone https://github.com/votre-repo/fintune-platform.git fintune
cd fintune
```

### 2.2 Configuration des Variables d'Environnement

```bash
cp .env.example .env
nano .env
```

Remplissez toutes les variables d'environnement nécessaires.

### 2.3 Configuration de Nginx

```bash
# Copier les fichiers de configuration Nginx
cp finetuner.io.conf /etc/nginx/sites-available/
cp api.finetuner.io.conf /etc/nginx/sites-available/

# Créer des liens symboliques
ln -s /etc/nginx/sites-available/finetuner.io.conf /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/api.finetuner.io.conf /etc/nginx/sites-enabled/

# Vérifier la configuration
nginx -t

# Redémarrer Nginx
systemctl restart nginx
```

### 2.4 Obtention des Certificats SSL

```bash
certbot --nginx -d finetuner.io -d www.finetuner.io
certbot --nginx -d api.finetuner.io
```

### 2.5 Démarrage des Conteneurs Docker

```bash
cd /opt/fintune
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d
```

## 3. Vérification du Déploiement

### 3.1 Vérifier l'État des Conteneurs

```bash
docker-compose ps
```

Tous les conteneurs devraient être en état "Up".

### 3.2 Vérifier les Logs

```bash
# Logs de l'API
docker-compose logs api

# Logs du Frontend
docker-compose logs frontend

# Logs du Worker Celery
docker-compose logs worker

# Logs de Flower
docker-compose logs flower
```

### 3.3 Tester l'Accès

Ouvrez un navigateur et accédez à :
- Frontend : https://finetuner.io
- API : https://api.finetuner.io
- API Docs : https://api.finetuner.io/docs
- Flower (monitoring Celery) : https://api.finetuner.io:5555

## 4. Résolution des Problèmes Courants

### 4.1 Problème de Port

Si vous rencontrez des erreurs "address already in use", vérifiez quels processus utilisent les ports :

```bash
sudo lsof -i :80
sudo lsof -i :8000
sudo lsof -i :8081
```

### 4.2 Problèmes de Certificats SSL

Si les certificats SSL ne fonctionnent pas correctement :

```bash
certbot renew --dry-run
```

### 4.3 Problèmes avec Celery

Si le worker Celery ne démarre pas correctement :

1. Vérifiez que Redis est en cours d'exécution :
   ```bash
   docker-compose logs redis
   ```

2. Vérifiez que le fichier celery_app.py est correctement configuré.

3. Redémarrez le worker :
   ```bash
   docker-compose restart worker
   ```

### 4.4 Problèmes avec Nginx

Vérifiez les logs d'erreur Nginx :

```bash
tail -f /var/log/nginx/error.log
```

## 5. Maintenance

### 5.1 Mise à Jour de l'Application

```bash
cd /opt/fintune
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 5.2 Sauvegarde des Données

```bash
# Sauvegarde de la base de données PostgreSQL
docker-compose exec db pg_dump -U postgres -d fintune > backup_postgres_$(date +%Y%m%d).sql

# Sauvegarde de la base de données MongoDB
docker-compose exec mongo mongodump --out=/data/backup_$(date +%Y%m%d)
```

### 5.3 Renouvellement des Certificats SSL

Les certificats Let's Encrypt expirent après 90 jours. Certbot configure généralement un cron job pour les renouveler automatiquement, mais vous pouvez forcer le renouvellement :

```bash
certbot renew
```

## 6. Conclusion

Félicitations ! Votre plateforme FinTune est maintenant déployée et opérationnelle. Si vous rencontrez des problèmes, consultez les logs des conteneurs et les logs Nginx pour identifier la source du problème.
EOL

echo "Configuration de Celery terminée. Vous pouvez maintenant redémarrer les conteneurs avec :"
echo "cd /opt/fintune && docker-compose down --remove-orphans && docker-compose build --no-cache && docker-compose up -d" 