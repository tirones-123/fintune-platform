#!/bin/bash

# Script de déploiement pour FinTune Platform

# Configuration
FRONTEND_DIR="./frontend"
BUILD_DIR="$FRONTEND_DIR/build"
FTP_HOST="ftp.yourdomain.com"
FTP_USER="your-ftp-username"
FTP_PASS="your-ftp-password"
REMOTE_DIR="/public_html"

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
  
  if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé. Veuillez l'installer avant de continuer."
    exit 1
  fi
  
  if ! command -v lftp &> /dev/null; then
    print_warning "lftp n'est pas installé. Il est recommandé pour le déploiement FTP."
    print_warning "Installez-le avec 'brew install lftp' sur macOS ou 'apt-get install lftp' sur Linux."
  fi
}

# Construire l'application frontend
build_frontend() {
  print_message "Construction de l'application frontend..."
  
  cd $FRONTEND_DIR
  
  # Installer les dépendances
  print_message "Installation des dépendances..."
  npm install
  
  # Construire l'application
  print_message "Création du build de production..."
  npm run build:prod
  
  if [ ! -d "build" ]; then
    print_error "La construction a échoué. Le dossier 'build' n'existe pas."
    exit 1
  fi
  
  print_message "Construction terminée avec succès."
  cd ..
}

# Créer le fichier .htaccess
create_htaccess() {
  print_message "Création du fichier .htaccess..."
  
  cat > "$BUILD_DIR/.htaccess" << EOL
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
EOL

  print_message "Fichier .htaccess créé avec succès."
}

# Déployer sur Hostinger via FTP
deploy_to_hostinger() {
  print_message "Déploiement sur Hostinger..."
  
  if command -v lftp &> /dev/null; then
    print_message "Utilisation de lftp pour le déploiement..."
    
    lftp -c "
      set ftp:ssl-allow no;
      open $FTP_HOST;
      user $FTP_USER $FTP_PASS;
      mirror -R $BUILD_DIR $REMOTE_DIR;
      bye
    "
    
    print_message "Déploiement terminé avec succès."
  else
    print_warning "lftp n'est pas installé. Veuillez télécharger manuellement le contenu du dossier 'build' vers votre hébergement."
    print_warning "Vous pouvez utiliser un client FTP comme FileZilla pour cela."
  fi
}

# Exécution principale
main() {
  print_message "Début du déploiement de FinTune Platform..."
  
  check_dependencies
  build_frontend
  create_htaccess
  
  # Demander confirmation avant le déploiement
  read -p "Voulez-vous déployer sur Hostinger maintenant? (o/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Oo]$ ]]; then
    deploy_to_hostinger
  else
    print_message "Déploiement annulé. Vous pouvez déployer manuellement le contenu du dossier 'build'."
  fi
  
  print_message "Processus de déploiement terminé."
}

# Exécuter le script
main 