#!/bin/bash

# Script pour effectuer une reconstruction propre du conteneur frontend
# Ce script doit être exécuté sur le serveur (VPS ou autre)

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

# Vérifier si le script est exécuté en tant que root ou via sudo
if [ "$EUID" -ne 0 ]; then
  print_error "Ce script doit être exécuté en tant que root ou avec sudo."
  print_error "Exemple: sudo ./fix_frontend_build.sh"
  exit 1
fi

# Vérifier si le répertoire frontend existe
if [ ! -d "$FRONTEND_DIR" ]; then
  print_error "Le répertoire $FRONTEND_DIR n'existe pas."
  print_error "Veuillez vérifier le chemin du répertoire frontend."
  exit 1
fi

print_message "Reconstruction du conteneur frontend sans cache..."
cd "$DEPLOY_DIR" || exit 1
docker-compose build --no-cache frontend

if [ $? -eq 0 ]; then
  print_message "Reconstruction du conteneur frontend réussie."
else
  print_error "Erreur lors de la reconstruction du conteneur frontend."
  exit 1
fi

print_message "Redémarrage du conteneur frontend..."
docker-compose up -d frontend

if [ $? -eq 0 ]; then
  print_message "Redémarrage du conteneur frontend réussi."
  print_message "Vous pouvez maintenant accéder à l'application (ex: https://finetuner.io)."
else
  print_error "Erreur lors du redémarrage du conteneur frontend."
  print_error "Veuillez vérifier les logs pour plus d'informations."
  exit 1
fi

print_message "Opération terminée."