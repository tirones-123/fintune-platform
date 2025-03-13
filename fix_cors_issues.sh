#!/bin/bash

# Script pour résoudre les problèmes de CORS dans l'application FinTune
# Ce script doit être exécuté sur le serveur VPS

# Configuration
DEPLOY_DIR="/opt/fintune"
BACKEND_DIR="${DEPLOY_DIR}/backend"
CONFIG_PY="${BACKEND_DIR}/app/core/config.py"
ENV_FILE="${BACKEND_DIR}/.env"
NGINX_CONF_DIR="/etc/nginx/conf.d"
FRONTEND_DOMAIN="finetuner.io"
API_DOMAIN="api.finetuner.io"

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
  print_error "Exemple: sudo ./fix_cors_issues.sh"
  exit 1
fi

# Vérifier si les fichiers existent
if [ ! -f "$CONFIG_PY" ]; then
  print_error "Le fichier $CONFIG_PY n'existe pas."
  print_error "Veuillez vérifier le chemin du fichier config.py."
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  print_error "Le fichier $ENV_FILE n'existe pas."
  print_error "Veuillez vérifier le chemin du fichier .env."
  exit 1
fi

# Créer des sauvegardes des fichiers
print_message "Création de sauvegardes des fichiers..."
cp "$CONFIG_PY" "${CONFIG_PY}.backup.$(date +%Y%m%d%H%M%S)"
cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d%H%M%S)"

# Mettre à jour le fichier config.py
print_message "Mise à jour du fichier config.py..."
if grep -q "BACKEND_CORS_ORIGINS" "$CONFIG_PY"; then
  # Vérifier si l'URL de l'API est déjà dans la liste des origines CORS
  if ! grep -q "https://${API_DOMAIN}" "$CONFIG_PY"; then
    # Ajouter l'URL de l'API à la liste des origines CORS
    sed -i "s/BACKEND_CORS_ORIGINS: List\[AnyHttpUrl\] = \[/BACKEND_CORS_ORIGINS: List\[AnyHttpUrl\] = \[\"https:\/\/${API_DOMAIN}\", /g" "$CONFIG_PY"
    print_message "URL de l'API ajoutée à la liste des origines CORS dans config.py."
  else
    print_warning "L'URL de l'API est déjà dans la liste des origines CORS dans config.py."
  fi
else
  print_error "La variable BACKEND_CORS_ORIGINS n'a pas été trouvée dans config.py."
  print_error "Veuillez vérifier le fichier config.py manuellement."
  exit 1
fi

# Mettre à jour le fichier .env
print_message "Mise à jour du fichier .env..."
if grep -q "BACKEND_CORS_ORIGINS" "$ENV_FILE"; then
  # Vérifier si l'URL de l'API est déjà dans la liste des origines CORS
  if ! grep -q "https://${API_DOMAIN}" "$ENV_FILE"; then
    # Ajouter l'URL de l'API à la liste des origines CORS
    sed -i "s/BACKEND_CORS_ORIGINS=/BACKEND_CORS_ORIGINS=https:\/\/${API_DOMAIN},/g" "$ENV_FILE"
    print_message "URL de l'API ajoutée à la liste des origines CORS dans .env."
  else
    print_warning "L'URL de l'API est déjà dans la liste des origines CORS dans .env."
  fi
else
  print_warning "La variable BACKEND_CORS_ORIGINS n'a pas été trouvée dans .env."
  print_message "Ajout de la variable BACKEND_CORS_ORIGINS dans .env..."
  echo "BACKEND_CORS_ORIGINS=https://${API_DOMAIN},https://${FRONTEND_DOMAIN}" >> "$ENV_FILE"
  print_message "Variable BACKEND_CORS_ORIGINS ajoutée dans .env."
fi

# Configurer Nginx pour CORS
print_message "Configuration de Nginx pour CORS..."

# Créer le fichier de configuration CORS pour l'API
print_message "Création du fichier de configuration CORS pour l'API..."
cat > "${NGINX_CONF_DIR}/api.${API_DOMAIN}.conf" << EOL
server {
    listen 80;
    server_name ${API_DOMAIN};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name ${API_DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${API_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${API_DOMAIN}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # CORS headers
    add_header 'Access-Control-Allow-Origin' 'https://${FRONTEND_DOMAIN}' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE, PATCH' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;

    # Handle preflight requests
    if (\$request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://${FRONTEND_DOMAIN}' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE, PATCH' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain charset=UTF-8';
        add_header 'Content-Length' 0;
        return 204;
    }

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOL

# Vérifier la configuration Nginx
print_message "Vérification de la configuration Nginx..."
nginx -t

# Si la configuration est valide, recharger Nginx (au lieu de redémarrer)
if [ $? -eq 0 ]; then
  print_message "Configuration Nginx valide. Rechargement de Nginx..."
  systemctl reload nginx
  print_message "Nginx rechargé avec succès."
else
  print_error "La configuration Nginx n'est pas valide."
  print_error "Veuillez vérifier la configuration manuellement."
  exit 1
fi

# Redémarrer le backend
print_message "Redémarrage du backend..."
if systemctl is-active --quiet fintune-backend.service; then
  systemctl restart fintune-backend.service
  print_message "Service backend redémarré avec succès."
else
  print_warning "Le service fintune-backend.service n'est pas actif."
  print_message "Redémarrage du backend avec Docker Compose..."
  cd "$DEPLOY_DIR" || exit 1
  docker-compose restart api
  print_message "Backend redémarré avec succès."
fi

print_message "La configuration CORS a été mise à jour avec succès."
print_message "Veuillez vérifier que les problèmes de CORS ont été résolus en accédant à l'application."
print_message "Si vous rencontrez toujours des problèmes, veuillez consulter les logs du backend :"
print_message "docker-compose logs api"
print_message "ou"
print_message "journalctl -u fintune-backend.service" 