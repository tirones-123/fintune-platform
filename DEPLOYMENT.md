# Guide de déploiement de FinTune sur Hostinger

Ce guide vous explique comment déployer l'application FinTune sur un hébergement Hostinger.

## Prérequis

- Un compte Hostinger avec un plan d'hébergement web
- Un nom de domaine configuré
- Accès FTP à votre hébergement
- Node.js et npm installés sur votre machine locale

## Étape 1 : Préparation du projet

1. Assurez-vous que toutes les fonctionnalités sont implémentées et testées localement
2. Mettez à jour les variables d'environnement dans le fichier `.env.production`
3. Vérifiez que le script de build optimisé est configuré dans `package.json`

## Étape 2 : Construction du build de production

```bash
# Naviguer vers le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Créer un build optimisé pour la production
npm run build:prod
```

Cela créera un dossier `build` contenant tous les fichiers statiques optimisés pour la production.

## Étape 3 : Création du fichier .htaccess

Créez un fichier `.htaccess` dans le dossier `build` avec le contenu suivant :

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

Ce fichier est nécessaire pour que les routes React fonctionnent correctement sur un serveur Apache.

## Étape 4 : Configuration de l'hébergement Hostinger

1. Connectez-vous à votre compte Hostinger
2. Accédez au panneau de contrôle hPanel
3. Sélectionnez votre domaine
4. Assurez-vous que PHP est activé (même si nous n'utilisons pas PHP, c'est souvent nécessaire pour le serveur Apache)
5. Activez HTTPS pour votre domaine si ce n'est pas déjà fait

## Étape 5 : Déploiement des fichiers

### Option 1 : Utilisation du gestionnaire de fichiers Hostinger

1. Dans le panneau hPanel, accédez à "Gestionnaire de fichiers"
2. Naviguez vers le dossier `public_html`
3. Supprimez tous les fichiers existants (sauvegardez-les si nécessaire)
4. Téléchargez tous les fichiers du dossier `build` vers le dossier `public_html`

### Option 2 : Utilisation d'un client FTP

1. Utilisez un client FTP comme FileZilla
2. Connectez-vous à votre serveur FTP avec les informations fournies par Hostinger
3. Naviguez vers le dossier `public_html`
4. Supprimez tous les fichiers existants (sauvegardez-les si nécessaire)
5. Téléchargez tous les fichiers du dossier `build` vers le dossier `public_html`

### Option 3 : Utilisation du script de déploiement automatisé

1. Modifiez le fichier `deploy.sh` avec vos informations FTP :
   ```bash
   FTP_HOST="ftp.votredomaine.com"
   FTP_USER="votre-nom-utilisateur"
   FTP_PASS="votre-mot-de-passe"
   REMOTE_DIR="/public_html"
   ```

2. Exécutez le script de déploiement :
   ```bash
   ./deploy.sh
   ```

## Étape 6 : Vérification du déploiement

1. Accédez à votre site web à l'adresse `https://votredomaine.com`
2. Vérifiez que toutes les pages se chargent correctement
3. Testez les fonctionnalités principales :
   - Création de projet
   - Upload de fichiers
   - Création de dataset
   - Fine-tuning de modèle
   - Test du modèle fine-tuné

## Étape 7 : Configuration du backend (si nécessaire)

Si vous souhaitez déployer un backend pour votre application, vous devrez :

1. Créer un sous-domaine pour l'API (par exemple, `api.votredomaine.com`)
2. Configurer un serveur Python avec FastAPI
3. Mettre à jour la variable `REACT_APP_API_URL` dans `.env.production` pour pointer vers votre API

## Dépannage

### Les routes ne fonctionnent pas correctement

Si vous rencontrez des erreurs 404 lorsque vous actualisez une page ou accédez directement à une URL, vérifiez que :

1. Le fichier `.htaccess` est correctement configuré
2. Le module `mod_rewrite` est activé sur votre serveur Apache

### Problèmes de CORS

Si vous avez des problèmes de CORS lors de l'appel à votre API, assurez-vous que :

1. Votre API autorise les requêtes depuis votre domaine
2. Vous utilisez HTTPS pour le frontend et le backend

### Problèmes de performance

Si votre application est lente à charger :

1. Vérifiez que le build de production a été créé avec `npm run build:prod`
2. Activez la compression gzip sur votre serveur Apache
3. Utilisez un CDN pour les ressources statiques

## Ressources supplémentaires

- [Documentation Hostinger](https://www.hostinger.fr/tutoriels)
- [Guide de déploiement React](https://create-react-app.dev/docs/deployment/)
- [Configuration Apache pour React Router](https://create-react-app.dev/docs/deployment/#apache) 