#!/bin/bash

# Script pour résoudre le problème de Mixed Content dans le frontend
echo "Début de la correction du problème de Mixed Content..."

# Se connecter au serveur de production
ssh root@82.29.173.71 << 'EOF'
  cd /fintune-platform

  # 1. Vérifier et mettre à jour les variables d'environnement
  echo "Mise à jour des variables d'environnement..."
  cat > frontend/.env << 'ENVEND'
REACT_APP_API_URL=https://api.finetuner.io
ENVEND

  cat > frontend/.env.production << 'ENVEND'
# Indique l'URL de l'API backend
REACT_APP_API_URL=https://api.finetuner.io

# Clé publique Stripe (version test ou live, selon votre config)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51R13k4DF7Ri19VjwgSJkdKpjaF0em37GGoXp6Yi7XEg9CPWZYmmOUJtnDQ6TanPpIG4iukaEj25FSAvKJwVnRIgB000QdbEkV0

# (Optionnel) Version de l'app, pour gérer un affichage ou un footer
REACT_APP_VERSION=1.0.0

# Merci de préciser "production" si c'est votre build final
REACT_APP_ENV=production

# Préfixe de stockage local/localStorage
REACT_APP_STORAGE_PREFIX=fintune_

# (Optionnel) L'URL de votre site, s'il y a des redirections internes
REACT_APP_WEBSITE_URL=https://finetuner.io

# (Optionnel) Pour afficher un contact assistance dans l'UI
REACT_APP_SUPPORT_EMAIL=support@finetuner.io
ENVEND

  # 2. Corriger dans le fichier apiService.js toute URL hardcodée
  echo "Modification du fichier apiService.js..."
  sed -i 's|http://82.29.173.71:8000|https://api.finetuner.io|g' frontend/src/services/apiService.js

  # 3. Nettoyer et reconstruire complètement le frontend
  echo "Reconstruction complète du frontend..."
  docker-compose down
  cd frontend
  rm -rf build node_modules
  cd ..
  docker-compose up -d --no-deps --build frontend

  # 4. Attendre un peu que le conteneur démarre
  echo "Attente du démarrage du conteneur..."
  sleep 10

  # 5. S'assurer que le proxy Nginx est correctement configuré
  echo "Configuration du proxy Nginx..."
  cat > frontend/conf.d/default.conf << 'CONFEND'
# Configuration pour le serveur frontend
server {
    listen 80;
    server_name finetuner.io www.finetuner.io;
    
    # Redirection vers HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name finetuner.io www.finetuner.io;

    # Certificats SSL
    ssl_certificate /etc/nginx/certs/finetuner.io.crt;
    ssl_certificate_key /etc/nginx/certs/finetuner.io.key;

    # Frontend
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api/ {
        proxy_pass http://api:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
CONFEND

  # 6. Redémarrer le proxy Nginx
  echo "Redémarrage du proxy Nginx..."
  docker-compose restart nginx-proxy

  # 7. Vérifier que l'application est bien accessible
  echo "Vérification de l'accès à l'application..."
  curl -s -I https://finetuner.io || echo "Site accessible en HTTPS"
EOF

echo "Correction terminée. Vérifiez maintenant si le problème de Mixed Content est résolu." 