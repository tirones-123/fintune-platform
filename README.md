# FinTune Platform

FinTune est une plateforme complète pour créer, gérer et déployer des modèles d'IA fine-tunés à partir de vos propres données.

## Fonctionnalités

- 🚀 **Création de projets** : Organisez vos données et modèles par projet
- 📄 **Gestion de contenu** : Importez des fichiers texte, PDF et vidéos YouTube
- 📊 **Création de datasets** : Générez des datasets de fine-tuning à partir de vos contenus
- 🧠 **Fine-tuning de modèles** : Fine-tunez des modèles OpenAI, Anthropic et Mistral AI
- 💬 **Interface de chat** : Testez vos modèles fine-tunés via une interface de chat
- ⚙️ **Gestion des clés API** : Configurez vos clés API pour les différents fournisseurs

## Architecture

Le projet est divisé en deux parties principales :

- **Frontend** : Application React avec Material-UI
- **Backend** : API FastAPI (à implémenter)

## Prérequis

- Node.js (v14+)
- npm ou yarn
- Python 3.8+ (pour le backend)

## Installation

### Frontend

```bash
# Cloner le dépôt
git clone https://github.com/votre-username/fintune-platform.git
cd fintune-platform/frontend

# Installer les dépendances
npm install

# Démarrer l'application en mode développement
npm start
```

### Backend (à implémenter)

```bash
# Naviguer vers le dossier backend
cd ../backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows : venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Démarrer le serveur
uvicorn main:app --reload
```

## Configuration

### Variables d'environnement

Le frontend utilise des variables d'environnement pour la configuration. Créez un fichier `.env` à la racine du dossier frontend avec les variables suivantes :

```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=development
REACT_APP_STORAGE_PREFIX=fintune_
```

Pour la production, créez un fichier `.env.production` avec les valeurs appropriées.

### Clés API

Pour utiliser les fonctionnalités de fine-tuning, vous devez configurer vos clés API dans l'application :

1. Obtenez vos clés API auprès des fournisseurs :
   - [OpenAI](https://platform.openai.com/api-keys)
   - [Anthropic](https://console.anthropic.com/account/keys)
   - [Mistral AI](https://console.mistral.ai/api-keys/)

2. Configurez-les dans l'application via la page Paramètres.

## Déploiement sur Hostinger

### Préparation du build

```bash
# Créer un build optimisé pour la production
npm run build:prod
```

### Déploiement sur Hostinger

1. Connectez-vous à votre compte Hostinger
2. Accédez à l'hébergement web
3. Utilisez le gestionnaire de fichiers ou FTP pour télécharger le contenu du dossier `build` vers le répertoire public de votre hébergement (généralement `public_html`)

### Configuration du serveur

Pour que les routes React fonctionnent correctement, vous devez configurer la redirection des URL vers `index.html`. Créez un fichier `.htaccess` à la racine de votre hébergement avec le contenu suivant :

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

## Développement futur

Voici quelques fonctionnalités prévues pour les versions futures :

- Authentification et gestion des utilisateurs
- Intégration avec d'autres fournisseurs d'IA
- Analyse avancée des performances des modèles
- API pour intégrer les modèles fine-tunés dans d'autres applications
- Interface d'administration

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Contact

Pour toute question ou suggestion, n'hésitez pas à nous contacter à contact@fintune.ai