#!/bin/bash

# Créer un répertoire de sauvegarde pour les anciens certificats
mkdir -p frontend/certs/backup
cp frontend/certs/*.crt frontend/certs/*.key frontend/certs/backup/

# Configuration pour le certificat
COUNTRY="FR"
STATE="France"
LOCATION="Paris"
ORGANIZATION="FineTuner"
ORG_UNIT="IT"
COMMON_NAME_FRONTEND="finetuner.io"
COMMON_NAME_API="api.finetuner.io"
EMAIL="admin@finetuner.io"
DAYS_VALID=3650  # 10 ans

echo "Génération des nouveaux certificats SSL..."

# Générer un certificat pour le frontend
openssl req -x509 -nodes -days $DAYS_VALID -newkey rsa:2048 \
    -keyout frontend/certs/finetuner.io.key \
    -out frontend/certs/finetuner.io.crt \
    -subj "/C=$COUNTRY/ST=$STATE/L=$LOCATION/O=$ORGANIZATION/OU=$ORG_UNIT/CN=$COMMON_NAME_FRONTEND/emailAddress=$EMAIL"

# Générer un certificat pour l'API
openssl req -x509 -nodes -days $DAYS_VALID -newkey rsa:2048 \
    -keyout frontend/certs/api.finetuner.io.key \
    -out frontend/certs/api.finetuner.io.crt \
    -subj "/C=$COUNTRY/ST=$STATE/L=$LOCATION/O=$ORGANIZATION/OU=$ORG_UNIT/CN=$COMMON_NAME_API/emailAddress=$EMAIL"

# Afficher les informations des certificats
echo -e "\nCertificat pour finetuner.io:"
openssl x509 -in frontend/certs/finetuner.io.crt -text -noout | grep -E 'Subject:|Issuer:|Not Before:|Not After :'

echo -e "\nCertificat pour api.finetuner.io:"
openssl x509 -in frontend/certs/api.finetuner.io.crt -text -noout | grep -E 'Subject:|Issuer:|Not Before:|Not After :'

# Définir les permissions appropriées
chmod 600 frontend/certs/*.key
chmod 644 frontend/certs/*.crt

echo -e "\nLes nouveaux certificats ont été générés avec succès!"
echo "Maintenant, reconstruisez et relancez votre application avec:"
echo "docker-compose down"
echo "docker-compose build --no-cache"
echo "docker-compose up -d" 