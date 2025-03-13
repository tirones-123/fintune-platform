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

3. Assurez-vous que la bibliothèque Redis est correctement installée dans le conteneur worker :
   ```bash
   docker-compose exec worker pip install redis
   ```

4. Ajoutez la dépendance Redis au fichier requirements.txt :
   ```bash
   echo 'redis>=5.2.0' >> backend/requirements.txt
   ```

5. Redémarrez le worker :
   ```bash
   docker-compose restart worker
   ```

### 4.4 Problèmes avec l'onboarding

Si l'onboarding ne fonctionne pas correctement :

1. Vérifiez que le service contentService est correctement importé dans le fichier OnboardingPage.js :
   ```bash
   grep -n "import.*contentService" frontend/src/pages/OnboardingPage.js
   ```

2. Si contentService n'est pas importé, ajoutez-le à la liste des importations :
   ```bash
   sed -i 's/import { projectService, datasetService, fineTuningService, apiKeyService } from/import { projectService, contentService, datasetService, fineTuningService, apiKeyService } from/' frontend/src/pages/OnboardingPage.js
   ```

3. Reconstruisez et redémarrez le frontend :
   ```bash
   docker-compose build frontend
   docker-compose up -d frontend
   ```

### 4.5 Problèmes avec Nginx

Vérifiez les logs d'erreur Nginx :

```bash
tail -f /var/log/nginx/error.log
```

Si vous rencontrez des erreurs 502 Bad Gateway, vérifiez que la configuration Nginx pointe vers les bons ports :

```bash
# Pour le frontend
sed -i 's/proxy_pass http:\/\/localhost:80;/proxy_pass http:\/\/localhost:8081;/' /etc/nginx/sites-available/finetuner.io.conf

# Pour l'API
sed -i 's/proxy_pass http:\/\/localhost:8080;/proxy_pass http:\/\/localhost:8000;/' /etc/nginx/sites-available/api.finetuner.io.conf

# Redémarrez Nginx
systemctl restart nginx
```

### 4.6 Problèmes CORS (Cross-Origin Resource Sharing)

Si vous rencontrez des erreurs CORS comme celle-ci :
```
Access to XMLHttpRequest at 'https://api.finetuner.io/api/auth/register' from origin 'https://finetuner.io' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

Plusieurs solutions sont possibles :

#### 4.6.1 Configuration du backend FastAPI

1. Vérifiez et mettez à jour la configuration CORS dans le fichier backend/app/core/config.py :
   ```bash
   nano /opt/fintune/backend/app/core/config.py
   ```

   Assurez-vous que la liste BACKEND_CORS_ORIGINS inclut tous les domaines nécessaires :
   ```python
   BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "https://finetuner.io", "https://api.finetuner.io"]
   ```

2. Vérifiez également le fichier .env du backend :
   ```bash
   nano /opt/fintune/backend/.env
   ```

   Mettez à jour la variable BACKEND_CORS_ORIGINS :
   ```
   BACKEND_CORS_ORIGINS=http://localhost:3000,https://finetuner.io,https://api.finetuner.io
   ```

3. Redémarrez le service backend :
   ```bash
   docker-compose restart api
   ```

#### 4.6.2 Configuration Nginx pour gérer les en-têtes CORS

Modifiez la configuration Nginx pour le service API :

```bash
nano /etc/nginx/sites-available/api.finetuner.io.conf
```

Ajoutez les en-têtes CORS suivants :

```nginx
server {
    listen 443 ssl;
    server_name api.finetuner.io;

    # Configuration SSL (certbot l'ajoutera automatiquement)
    
    # Configuration des en-têtes CORS
    add_header 'Access-Control-Allow-Origin' 'https://finetuner.io' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE, PATCH' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    add_header 'Access-Control-Max-Age' 1728000 always;

    # Gestion des requêtes OPTIONS (preflight)
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://finetuner.io' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE, PATCH' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Max-Age' 1728000 always;
        add_header 'Content-Type' 'text/plain; charset=utf-8' always;
        add_header 'Content-Length' 0 always;
        return 204;
    }

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Redémarrez Nginx après les modifications :
```bash
nginx -t  # Vérifier la configuration
systemctl restart nginx
```

### 4.7 Problèmes courants du Frontend

#### 4.7.1 Erreur "enqueueSnackbar is not defined"

Si vous rencontrez cette erreur dans les logs du frontend :

1. Vérifiez l'importation de enqueueSnackbar dans le fichier concerné (par exemple, NewFineTuningPage.js) :
   ```bash
   nano /opt/fintune/frontend/src/pages/NewFineTuningPage.js
   ```

2. Assurez-vous que `enqueueSnackbar` est correctement importé de `notistack` :
   ```javascript
   import { useSnackbar, enqueueSnackbar } from 'notistack';
   ```

3. Remplacez toute utilisation de `snackbar.enqueueSnackbar` par `enqueueSnackbar` :
   ```bash
   # Chercher toutes les occurrences
   grep -r "snackbar.enqueueSnackbar" /opt/fintune/frontend/src/
   
   # Remplacer dans tous les fichiers
   find /opt/fintune/frontend/src/ -type f -name "*.js" -exec sed -i 's/snackbar.enqueueSnackbar/enqueueSnackbar/g' {} \;
   ```

4. Reconstruisez et redémarrez le frontend :
   ```bash
   docker-compose build frontend
   docker-compose up -d frontend
   ```

#### 4.7.2 Erreurs ESLint lors du build

Si le build échoue en raison d'erreurs ESLint :

1. Vous pouvez configurer le build pour ignorer les erreurs ESLint en modifiant le fichier package.json :
   ```bash
   nano /opt/fintune/frontend/package.json
   ```

2. Modifiez le script de build pour ajouter DISABLE_ESLINT_PLUGIN=true :
   ```json
   "scripts": {
     "build": "DISABLE_ESLINT_PLUGIN=true react-scripts build",
   }
   ```

3. Reconstruisez le frontend :
   ```bash
   docker-compose build frontend
   docker-compose up -d frontend
   ```

#### 4.7.3 Problèmes d'affichage ou styles manquants

Si certains éléments UI ne s'affichent pas correctement :

1. Vérifiez les importations de style dans le fichier index.js :
   ```bash
   nano /opt/fintune/frontend/src/index.js
   ```

2. Assurez-vous que les styles MUI et autres bibliothèques sont correctement importés :
   ```javascript
   import '@mui/material/styles';
   import './index.css';
   ```

3. Vérifiez que les dépendances sont correctement installées :
   ```bash
   docker-compose exec frontend npm list @mui/material
   docker-compose exec frontend npm list @emotion/react
   docker-compose exec frontend npm list @emotion/styled
   ```

4. Si nécessaire, installez les dépendances manquantes :
   ```bash
   docker-compose exec frontend npm install @mui/material @emotion/react @emotion/styled
   ```

5. Reconstruisez le frontend :
   ```bash
   docker-compose build frontend
   docker-compose up -d frontend
   ```

### 4.8 Problèmes avec le build du Frontend et Node.js

Si vous rencontrez des erreurs lors du build du frontend liées à l'option `--openssl-legacy-provider` :

#### 4.8.1 Erreur "node: --openssl-legacy-provider is not allowed in NODE_OPTIONS"

Cette erreur se produit lorsque la version de Node.js utilisée dans le conteneur n'est pas compatible avec l'option `--openssl-legacy-provider`. Voici comment résoudre ce problème :

1. Modifier le fichier package.json pour supprimer l'option `--openssl-legacy-provider` :
   ```bash
   cd /opt/fintune/frontend
   cp package.json package.json.backup
   sed -i 's/NODE_OPTIONS=--openssl-legacy-provider //g' package.json
   ```

2. Vérifier que les modifications ont été appliquées :
   ```bash
   grep -A 5 "scripts" package.json
   ```

3. Reconstruire le conteneur frontend sans utiliser le cache :
   ```bash
   cd /opt/fintune
   docker-compose build --no-cache frontend
   ```

4. Redémarrer le conteneur frontend :
   ```bash
   docker-compose up -d frontend
   ```

#### 4.8.2 Utiliser une version spécifique de Node.js

Si vous préférez conserver l'option `--openssl-legacy-provider`, vous pouvez modifier le Dockerfile pour utiliser une version de Node.js compatible :

1. Modifier le Dockerfile du frontend :
   ```bash
   cd /opt/fintune/frontend
   cp Dockerfile Dockerfile.backup
   ```

2. Remplacer la première ligne du Dockerfile :
   ```
   # Remplacer
   FROM node:16-alpine as build
   
   # Par
   FROM node:14-alpine as build
   ```

3. Reconstruire le conteneur frontend :
   ```bash
   cd /opt/fintune
   docker-compose build --no-cache frontend
   docker-compose up -d frontend
   ```

#### 4.8.3 Problèmes avec les modifications via FTP

Si vous modifiez des fichiers via FTP et que les changements ne sont pas visibles dans l'application :

1. Vérifier que les fichiers ont bien été modifiés sur le serveur :
   ```bash
   ls -la /opt/fintune/frontend/src
   ```

2. Reconstruire et redémarrer le conteneur frontend :
   ```bash
   cd /opt/fintune
   docker-compose build frontend
   docker-compose up -d frontend
   ```

3. Si les modifications concernent uniquement des fichiers statiques (HTML, CSS, images), vous pouvez les copier directement dans le conteneur sans reconstruire l'image :
   ```bash
   docker cp /opt/fintune/frontend/build/. fintune-frontend-1:/usr/share/nginx/html/
   docker exec fintune-frontend-1 chown -R nginx:nginx /usr/share/nginx/html
   docker restart fintune-frontend-1
   ```

### 4.9 Optimisation du processus de développement

Pour faciliter le développement et éviter de reconstruire l'image Docker à chaque modification :

1. Créer un Dockerfile.dev pour le développement :
   ```bash
   cat > /opt/fintune/frontend/Dockerfile.dev << 'EOL'
   FROM node:16-alpine

   WORKDIR /app

   COPY package*.json ./

   RUN npm install

   COPY . .

   EXPOSE 3000

   CMD ["npm", "start"]
   EOL
   ```

2. Ajouter un service de développement dans docker-compose.yml :
   ```yaml
   # Service de développement frontend
   frontend-dev:
     build:
       context: ./frontend
       dockerfile: Dockerfile.dev
     ports:
       - "3001:3000"
     volumes:
       - ./frontend:/app
       - /app/node_modules
     environment:
       - REACT_APP_API_URL=${REACT_APP_API_URL}
     networks:
       - fintune-network
   ```

3. Lancer le service de développement :
   ```bash
   docker-compose up -d frontend-dev
   ```

4. Accéder à l'application de développement à l'adresse http://localhost:3001

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

Annexes :

Annexe A : Vérification de Celery
Pour vérifier que Celery fonctionne correctement, vous pouvez exécuter une tâche de test :

# Accéder au conteneur API
docker-compose exec api bash

# Lancer une tâche de test depuis l'interpréteur Python
python -c "from celery_app import add_numbers; result = add_numbers.delay(4, 4); print(f'Task ID: {result.id}')"

# Vérifier le statut de la tâche
python -c "from celery_app import app; result = app.AsyncResult('task_id_from_above'); print(f'Task status: {result.status}, Result: {result.result}')"
"
Vous devriez voir la tâche passer à l'état "SUCCESS" et afficher le résultat "8".

Annexe B : Configuration du fichier celery_app.py
Voici le contenu minimal requis pour le fichier celery_app.py à placer dans le répertoire /opt/fintune/backend/ :
import os
from celery import Celery
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Configurer Celery
app = Celery(
    'fintune',
    broker=os.getenv('REDIS_URL', 'redis://redis:6379/0'),
    backend=os.getenv('REDIS_URL', 'redis://redis:6379/0')
)

# Configuration supplémentaire
app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

# Exemple de tâche simple pour tester
@app.task
def add_numbers(x, y):
    return x + y

# Si ce fichier est exécuté directement
if __name__ == '__main__':
    app.start()

Annexe C : Fichiers de Configuration Nginx 
server {
    listen 80;
    server_name finetuner.io www.finetuner.io;

    location / {
        proxy_pass http://localhost:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
Après avoir obtenu les certificats SSL avec Certbot, le fichier sera automatiquement mis à jour.

C.2 Configuration pour api.finetuner.io (Backend API)
server {
    listen 80;
    server_name api.finetuner.io;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /flower/ {
        rewrite ^/flower/(.*)$ /$1 break;
        proxy_pass http://localhost:5555;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
Après avoir obtenu les certificats SSL avec Certbot, le fichier sera automatiquement mis à jour.