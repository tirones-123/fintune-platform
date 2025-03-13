#!/bin/bash

# Script pour résoudre le problème de build du frontend lié à l'option --openssl-legacy-provider
# Ce script doit être exécuté sur le serveur VPS

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
  print_error "Exemple: sudo ./fix_frontend_build.sh"
  exit 1
fi

# Vérifier si le répertoire frontend existe
if [ ! -d "$FRONTEND_DIR" ]; then
  print_error "Le répertoire $FRONTEND_DIR n'existe pas."
  print_error "Veuillez vérifier le chemin du répertoire frontend."
  exit 1
fi

# Créer une sauvegarde du fichier package.json
print_message "Création d'une sauvegarde du fichier package.json..."
BACKUP_FILE="${FRONTEND_DIR}/package.json.backup.$(date +%Y%m%d%H%M%S)"
cp "${FRONTEND_DIR}/package.json" "$BACKUP_FILE"

if [ ! -f "$BACKUP_FILE" ]; then
  print_error "Erreur lors de la création de la sauvegarde."
  exit 1
else
  print_message "Sauvegarde créée : $BACKUP_FILE"
fi

# Vérifier si l'option --openssl-legacy-provider est présente
if grep -q "NODE_OPTIONS=--openssl-legacy-provider" "${FRONTEND_DIR}/package.json"; then
  print_message "Option --openssl-legacy-provider trouvée dans package.json."
  
  # Modifier le fichier package.json pour supprimer l'option --openssl-legacy-provider
  print_message "Modification du fichier package.json pour supprimer l'option --openssl-legacy-provider..."
  sed -i 's/NODE_OPTIONS=--openssl-legacy-provider //g' "${FRONTEND_DIR}/package.json"
  
  # Vérifier que les modifications ont été appliquées
  print_message "Vérification des modifications..."
  if grep -q "NODE_OPTIONS=--openssl-legacy-provider" "${FRONTEND_DIR}/package.json"; then
    print_error "La modification n'a pas été appliquée correctement."
    print_error "Veuillez vérifier le fichier package.json manuellement."
    exit 1
  else
    print_message "Modifications appliquées avec succès."
  fi
else
  print_warning "L'option --openssl-legacy-provider n'a pas été trouvée dans package.json."
  print_message "Aucune modification n'est nécessaire."
fi

# Vérifier si le Dockerfile utilise une version compatible de Node.js
DOCKERFILE="${FRONTEND_DIR}/Dockerfile"
if [ -f "$DOCKERFILE" ]; then
  NODE_VERSION=$(grep -o "FROM node:[0-9.]*-alpine" "$DOCKERFILE" | grep -o "[0-9.]*")
  
  if [ -n "$NODE_VERSION" ]; then
    print_message "Version de Node.js dans le Dockerfile : $NODE_VERSION"
    
    # Vérifier si la version est compatible avec l'option --openssl-legacy-provider
    if [[ "$NODE_VERSION" == "17"* || "$NODE_VERSION" == "18"* || "$NODE_VERSION" == "19"* || "$NODE_VERSION" == "20"* ]]; then
      print_warning "La version de Node.js ($NODE_VERSION) n'est pas compatible avec l'option --openssl-legacy-provider."
      print_message "Recommandation : Utiliser Node.js 14.x ou 16.x pour les projets nécessitant cette option."
    fi
  else
    print_warning "Impossible de déterminer la version de Node.js dans le Dockerfile."
  fi
else
  print_warning "Le fichier Dockerfile n'a pas été trouvé."
fi

# Reconstruire le conteneur frontend
print_message "Reconstruction du conteneur frontend..."
cd "$DEPLOY_DIR" || exit 1
docker-compose build --no-cache frontend

# Vérifier si la reconstruction a réussi
if [ $? -eq 0 ]; then
  print_message "Reconstruction du conteneur frontend réussie."
else
  print_error "Erreur lors de la reconstruction du conteneur frontend."
  print_error "Restauration du fichier package.json original..."
  cp "$BACKUP_FILE" "${FRONTEND_DIR}/package.json"
  print_error "Veuillez vérifier les logs pour plus d'informations."
  exit 1
fi

# Redémarrer le conteneur frontend
print_message "Redémarrage du conteneur frontend..."
docker-compose up -d frontend

# Vérifier si le redémarrage a réussi
if [ $? -eq 0 ]; then
  print_message "Redémarrage du conteneur frontend réussi."
else
  print_error "Erreur lors du redémarrage du conteneur frontend."
  print_error "Veuillez vérifier les logs pour plus d'informations."
  exit 1
fi

print_message "Le problème de build du frontend a été résolu avec succès."
print_message "Vous pouvez maintenant accéder à l'application à l'adresse https://finetuner.io"
print_message "Si vous rencontrez toujours des problèmes, veuillez consulter les logs du conteneur frontend :"
print_message "docker-compose logs frontend" 