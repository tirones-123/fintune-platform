#!/bin/bash

# Script pour déployer les corrections sur le serveur

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_message() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si le script est exécuté en tant que root
if [ "$EUID" -ne 0 ]; then
  print_error "Ce script doit être exécuté en tant que root ou avec sudo"
  print_error "Exemple: sudo ./deploy_fix.sh"
  exit 1
fi

# Configuration
DEPLOY_DIR="/opt/fintune"
FRONTEND_DIR="${DEPLOY_DIR}/frontend"
BACKEND_DIR="${DEPLOY_DIR}/backend"
NGINX_CONF_DIR="/etc/nginx/conf.d"
API_DOMAIN="api.finetuner.io"
FRONTEND_DOMAIN="finetuner.io"

# Vérifier si les répertoires existent
if [ ! -d "$FRONTEND_DIR" ]; then
  print_error "Le répertoire $FRONTEND_DIR n'existe pas."
  exit 1
fi

if [ ! -d "$BACKEND_DIR" ]; then
  print_error "Le répertoire $BACKEND_DIR n'existe pas."
  exit 1
fi

# Mettre à jour le fichier OnboardingPage.js
print_message "Mise à jour du fichier OnboardingPage.js..."
cat > ${FRONTEND_DIR}/src/pages/OnboardingPage.js.new << 'EOL'
// Insérer ici le contenu complet du fichier OnboardingPage.js mis à jour
EOL

if [ -f "${FRONTEND_DIR}/src/pages/OnboardingPage.js.new" ]; then
  mv ${FRONTEND_DIR}/src/pages/OnboardingPage.js.new ${FRONTEND_DIR}/src/pages/OnboardingPage.js
  print_message "Fichier OnboardingPage.js mis à jour avec succès."
else
  print_error "Échec de la mise à jour du fichier OnboardingPage.js."
fi

# Mettre à jour le fichier apiService.js
print_message "Mise à jour du fichier apiService.js..."
cat > ${FRONTEND_DIR}/src/services/apiService.js.new << 'EOL'
// Insérer ici le contenu complet du fichier apiService.js mis à jour
EOL

if [ -f "${FRONTEND_DIR}/src/services/apiService.js.new" ]; then
  mv ${FRONTEND_DIR}/src/services/apiService.js.new ${FRONTEND_DIR}/src/services/apiService.js
  print_message "Fichier apiService.js mis à jour avec succès."
else
  print_error "Échec de la mise à jour du fichier apiService.js."
fi

# Mettre à jour la configuration nginx pour l'API
print_message "Mise à jour de la configuration nginx pour l'API..."
cat > ${NGINX_CONF_DIR}/${API_DOMAIN}.conf << 'EOL'
server {
    server_name api.finetuner.io;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://finetuner.io' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE, PATCH' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;

        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://finetuner.io' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE, PATCH' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/api.finetuner.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.finetuner.io/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    listen 80;
    server_name api.finetuner.io;
    
    # Simple redirect to HTTPS
    return 301 https://$host$request_uri;
}
EOL

# Vérifier la configuration nginx
print_message "Vérification de la configuration nginx..."
nginx -t

# Si la configuration est valide, recharger nginx
if [ $? -eq 0 ]; then
  print_message "Configuration nginx valide. Rechargement de nginx..."
  systemctl reload nginx
  print_message "Nginx rechargé avec succès."
else
  print_error "La configuration nginx n'est pas valide. Veuillez corriger les erreurs avant de recharger nginx."
fi

# Reconstruire le frontend
print_message "Reconstruction du frontend..."
cd ${FRONTEND_DIR}
npm run build

# Redémarrer les services
print_message "Redémarrage des services..."
systemctl restart fintune-backend
systemctl restart fintune-frontend

print_message "Déploiement terminé avec succès." 