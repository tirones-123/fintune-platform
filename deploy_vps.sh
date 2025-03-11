#!/bin/bash

# Script de déploiement pour FinTune Platform sur VPS
# Ce script doit être exécuté depuis votre machine locale

# Configuration
VPS_USER="root"
VPS_HOST="82.29.173.71"
DEPLOY_DIR="/opt/fintune"
BACKUP_DIR="/opt/backups/fintune"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

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

# Vérifier si les outils nécessaires sont installés
check_dependencies() {
  print_message "Vérification des dépendances..."
  
  if ! command -v ssh &> /dev/null; then
    print_error "ssh n'est pas installé. Veuillez l'installer avant de continuer."
    exit 1
  fi
  
  if ! command -v rsync &> /dev/null; then
    print_error "rsync n'est pas installé. Veuillez l'installer avant de continuer."
    exit 1
  fi
}

# Créer une sauvegarde sur le VPS
create_backup() {
  print_message "Création d'une sauvegarde sur le VPS..."
  
  ssh ${VPS_USER}@${VPS_HOST} << EOF
    # Créer le répertoire de sauvegarde s'il n'existe pas
    mkdir -p ${BACKUP_DIR}
    
    # Vérifier si le répertoire de déploiement existe
    if [ -d "${DEPLOY_DIR}" ]; then
      # Créer une sauvegarde
      tar -czf ${BACKUP_DIR}/fintune_backup_${TIMESTAMP}.tar.gz -C $(dirname ${DEPLOY_DIR}) $(basename ${DEPLOY_DIR})
      echo "Sauvegarde créée : ${BACKUP_DIR}/fintune_backup_${TIMESTAMP}.tar.gz"
    else
      echo "Le répertoire ${DEPLOY_DIR} n'existe pas encore, aucune sauvegarde nécessaire."
    fi
EOF
}

# Synchroniser les fichiers avec le VPS
sync_files() {
  print_message "Synchronisation des fichiers avec le VPS..."
  
  # Créer le répertoire de déploiement s'il n'existe pas
  ssh ${VPS_USER}@${VPS_HOST} "mkdir -p ${DEPLOY_DIR}"
  
  # Synchroniser les fichiers
  rsync -avz --exclude 'node_modules' --exclude 'venv' --exclude '.git' \
    --exclude '.DS_Store' --exclude '__pycache__' \
    ./ ${VPS_USER}@${VPS_HOST}:${DEPLOY_DIR}/
  
  print_message "Synchronisation terminée."
}

# Déployer l'application sur le VPS
deploy_app() {
  print_message "Déploiement de l'application sur le VPS..."
  
  ssh ${VPS_USER}@${VPS_HOST} << EOF
    cd ${DEPLOY_DIR}
    
    # Arrêter les conteneurs existants
    docker-compose down
    
    # Augmenter le timeout pour Docker Compose
    export COMPOSE_HTTP_TIMEOUT=300
    
    # Ajouter de la mémoire swap si nécessaire
    if [ ! -f /swapfile ]; then
      fallocate -l 2G /swapfile
      chmod 600 /swapfile
      mkswap /swapfile
      swapon /swapfile
      echo '/swapfile none swap sw 0 0' >> /etc/fstab
      echo "Swap ajouté pour améliorer les performances de build"
    fi
    
    # Construire les images une par une
    echo "Construction de l'image API..."
    docker-compose build api
    
    echo "Construction de l'image Worker..."
    docker-compose build worker
    
    echo "Construction de l'image Frontend..."
    docker-compose build frontend
    
    # Démarrer les conteneurs
    docker-compose up -d
    
    # Vérifier l'état des conteneurs
    docker-compose ps
    
    # Afficher les logs des conteneurs
    docker-compose logs --tail=20
EOF
}

# Configurer Nginx sur le VPS
configure_nginx() {
  print_message "Configuration de Nginx sur le VPS..."
  
  ssh ${VPS_USER}@${VPS_HOST} << EOF
    # Copier les fichiers de configuration Nginx
    cp ${DEPLOY_DIR}/finetuner.io.conf /etc/nginx/sites-available/
    cp ${DEPLOY_DIR}/api.finetuner.io.conf /etc/nginx/sites-available/
    
    # Créer des liens symboliques si nécessaire
    ln -sf /etc/nginx/sites-available/finetuner.io.conf /etc/nginx/sites-enabled/
    ln -sf /etc/nginx/sites-available/api.finetuner.io.conf /etc/nginx/sites-enabled/
    
    # Vérifier la configuration Nginx
    nginx -t
    
    # Redémarrer Nginx
    systemctl restart nginx
EOF
}

# Exécution principale
main() {
  print_message "Début du déploiement de FinTune Platform sur VPS..."
  
  check_dependencies
  create_backup
  sync_files
  deploy_app
  configure_nginx
  
  print_message "Déploiement terminé avec succès !"
  print_message "Votre application est accessible à l'adresse https://finetuner.io"
}

# Exécuter le script
main 