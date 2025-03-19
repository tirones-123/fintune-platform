#!/bin/bash

# Ce script corrige la configuration Nginx pour rediriger HTTPS vers l'API
ssh root@82.29.173.71 << 'EOF'
cd /fintune-platform

# Sauvegarder le fichier original
cp frontend/conf.d/api.finetuner.io.conf frontend/conf.d/api.finetuner.io.conf.bak

# Corriger la configuration Nginx
cat > frontend/conf.d/api.finetuner.io.conf << 'CONFEND'
server {
    server_name api.finetuner.io;

    location / {
        proxy_pass http://api:8000;
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
    ssl_certificate /etc/nginx/certs/api.finetuner.io.crt;
    ssl_certificate_key /etc/nginx/certs/api.finetuner.io.key;
}

server {
    listen 80;
    server_name api.finetuner.io;
    
    # Simple redirect to HTTPS
    return 301 https://$host$request_uri;
}
CONFEND

# Modifier également le frontend pour utiliser l'API en HTTP directement
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

# Redémarrer les services
echo "Redémarrage des services..."
docker-compose restart frontend nginx-proxy

echo "Configuration mise à jour! Le problème devrait être résolu."
EOF 