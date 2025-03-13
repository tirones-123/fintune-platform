#!/bin/bash

# Script pour configurer un environnement de développement Docker
# Ce script facilite le développement sans avoir à reconstruire l'image à chaque modification

# Configuration
DEPLOY_DIR="/opt/fintune"
FRONTEND_DIR="${DEPLOY_DIR}/frontend"

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
  print_error "Exemple: sudo ./setup_dev_environment.sh"
  exit 1
fi

# Vérifier si le répertoire frontend existe
if [ ! -d "$FRONTEND_DIR" ]; then
  print_error "Le répertoire $FRONTEND_DIR n'existe pas."
  print_error "Veuillez vérifier le chemin du répertoire frontend."
  exit 1
fi

# Créer un Dockerfile.dev pour le développement
print_message "Création du fichier Dockerfile.dev pour le développement..."
cat > "${FRONTEND_DIR}/Dockerfile.dev" << 'EOL'
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
EOL

# Vérifier si le fichier a été créé
if [ ! -f "${FRONTEND_DIR}/Dockerfile.dev" ]; then
  print_error "Erreur lors de la création du fichier Dockerfile.dev."
  exit 1
else
  print_message "Fichier Dockerfile.dev créé avec succès."
fi

# Créer un fichier docker-compose.dev.yml
print_message "Création du fichier docker-compose.dev.yml..."
cat > "${DEPLOY_DIR}/docker-compose.dev.yml" << 'EOL'
version: '3.8'

services:
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
      - REACT_APP_API_URL=${REACT_APP_API_URL:-http://localhost:8001}
    networks:
      - fintune-network

  # Service de développement backend
  api-dev:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8001:8000"
    volumes:
      - ./backend:/app
    environment:
      - POSTGRES_SERVER=${POSTGRES_SERVER:-db}
      - POSTGRES_USER=${POSTGRES_USER:-postgres}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}
      - POSTGRES_DB=${POSTGRES_DB:-fintune}
      - REDIS_URL=${REDIS_URL:-redis://redis:6379/0}
      - SECRET_KEY=${SECRET_KEY:-changethis}
      - DEBUG=True
    depends_on:
      - db
      - redis
    networks:
      - fintune-network
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  # Base de données PostgreSQL
  db:
    image: postgres:13
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=${POSTGRES_USER:-postgres}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}
      - POSTGRES_DB=${POSTGRES_DB:-fintune}
    ports:
      - "5432:5432"
    networks:
      - fintune-network

  # Redis
  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    networks:
      - fintune-network

networks:
  fintune-network:
    driver: bridge

volumes:
  postgres_data:
EOL

# Vérifier si le fichier a été créé
if [ ! -f "${DEPLOY_DIR}/docker-compose.dev.yml" ]; then
  print_error "Erreur lors de la création du fichier docker-compose.dev.yml."
  exit 1
else
  print_message "Fichier docker-compose.dev.yml créé avec succès."
fi

# Créer un script pour démarrer l'environnement de développement
print_message "Création du script start_dev_environment.sh..."
cat > "${DEPLOY_DIR}/start_dev_environment.sh" << 'EOL'
#!/bin/bash

# Script pour démarrer l'environnement de développement
cd "$(dirname "$0")"

# Arrêter les conteneurs de développement existants
docker-compose -f docker-compose.dev.yml down

# Démarrer les conteneurs de développement
docker-compose -f docker-compose.dev.yml up -d

echo "Environnement de développement démarré !"
echo "Frontend : http://localhost:3001"
echo "Backend : http://localhost:8001"
echo "Documentation API : http://localhost:8001/docs"
EOL

# Rendre le script exécutable
chmod +x "${DEPLOY_DIR}/start_dev_environment.sh"

# Vérifier si le script a été créé
if [ ! -f "${DEPLOY_DIR}/start_dev_environment.sh" ]; then
  print_error "Erreur lors de la création du script start_dev_environment.sh."
  exit 1
else
  print_message "Script start_dev_environment.sh créé avec succès."
fi

# Créer un script pour arrêter l'environnement de développement
print_message "Création du script stop_dev_environment.sh..."
cat > "${DEPLOY_DIR}/stop_dev_environment.sh" << 'EOL'
#!/bin/bash

# Script pour arrêter l'environnement de développement
cd "$(dirname "$0")"

# Arrêter les conteneurs de développement
docker-compose -f docker-compose.dev.yml down

echo "Environnement de développement arrêté !"
EOL

# Rendre le script exécutable
chmod +x "${DEPLOY_DIR}/stop_dev_environment.sh"

# Vérifier si le script a été créé
if [ ! -f "${DEPLOY_DIR}/stop_dev_environment.sh" ]; then
  print_error "Erreur lors de la création du script stop_dev_environment.sh."
  exit 1
else
  print_message "Script stop_dev_environment.sh créé avec succès."
fi

print_message "Configuration de l'environnement de développement terminée avec succès."
print_message "Pour démarrer l'environnement de développement, exécutez :"
print_message "cd ${DEPLOY_DIR} && ./start_dev_environment.sh"
print_message ""
print_message "Pour arrêter l'environnement de développement, exécutez :"
print_message "cd ${DEPLOY_DIR} && ./stop_dev_environment.sh"
print_message ""
print_message "Accès à l'environnement de développement :"
print_message "Frontend : http://localhost:3001"
print_message "Backend : http://localhost:8001"
print_message "Documentation API : http://localhost:8001/docs" 