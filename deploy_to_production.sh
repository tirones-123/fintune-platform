#!/bin/bash

# Script pour déployer les modifications en production
echo "Début du processus de déploiement en production..."

# 1. Commit et push des modifications
echo "Commit et push des modifications..."
git add .
git commit -m "mise à jour"
git push origin main

# 2. Connexion au serveur et déploiement
echo "Connexion au serveur et déploiement..."
ssh root@82.29.173.71 << 'EOF'
  echo "Mise à jour du code source..."
  cd /fintune-platform
  git pull origin main
  
  echo "Arrêt des conteneurs..."
  docker-compose down
  
  echo "Reconstruction des images..."
  docker-compose build --no-cache
  
  echo "Démarrage des services..."
  docker-compose up -d
  
  echo "Vérification des services..."
  docker-compose ps
EOF

echo "Déploiement en production terminé avec succès." 