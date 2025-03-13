# Guide de Dépannage pour la Plateforme FinTune

Ce guide fournit des solutions aux problèmes courants rencontrés lors du déploiement et de l'utilisation de la plateforme FinTune. Il inclut également des scripts pour automatiser la résolution de ces problèmes.

## Table des Matières

1. [Problèmes de Build du Frontend](#1-problèmes-de-build-du-frontend)
2. [Problèmes de CORS](#2-problèmes-de-cors)
3. [Environnement de Développement](#3-environnement-de-développement)
4. [Problèmes de Versioning](#4-problèmes-de-versioning)
5. [Scripts Utilitaires](#5-scripts-utilitaires)
6. [Logs et Débogage](#6-logs-et-débogage)

## 1. Problèmes de Build du Frontend

### 1.1 Erreur "node: --openssl-legacy-provider is not allowed in NODE_OPTIONS"

Cette erreur se produit lorsque la version de Node.js utilisée dans le conteneur n'est pas compatible avec l'option `--openssl-legacy-provider`. Pour résoudre ce problème, vous pouvez utiliser le script `fix_frontend_build.sh` :

```bash
sudo ./fix_frontend_build.sh
```

Ce script effectue les actions suivantes :
- Crée une sauvegarde du fichier `package.json`
- Supprime l'option `--openssl-legacy-provider` des scripts dans `package.json`
- Reconstruit le conteneur frontend sans utiliser le cache
- Redémarre le conteneur frontend

### 1.2 Modifications via FTP non visibles

Si vous modifiez des fichiers via FTP et que les changements ne sont pas visibles dans l'application, c'est parce que le frontend est une application React qui nécessite une reconstruction après modification. Pour appliquer les modifications, vous devez reconstruire le conteneur frontend :

```bash
cd /opt/fintune
docker-compose build frontend
docker-compose up -d frontend
```

Pour les fichiers statiques (HTML, CSS, images), vous pouvez les copier directement dans le conteneur sans reconstruire l'image :

```bash
docker cp /opt/fintune/frontend/build/. fintune-frontend-1:/usr/share/nginx/html/
docker exec fintune-frontend-1 chown -R nginx:nginx /usr/share/nginx/html
docker restart fintune-frontend-1
```

## 2. Problèmes de CORS

Les problèmes de CORS se produisent lorsque le frontend essaie d'accéder à l'API depuis un domaine différent. Pour résoudre ces problèmes, vous pouvez utiliser le script `fix_cors_issues.sh` :

```bash
sudo ./fix_cors_issues.sh
```

Ce script effectue les actions suivantes :
- Crée des sauvegardes des fichiers de configuration
- Met à jour la liste des origines CORS dans `config.py` et `.env`
- Configure Nginx pour gérer les en-têtes CORS
- Recharge Nginx et redémarre le backend

### 2.1 Vérification manuelle des configurations CORS

Si le script ne résout pas le problème, vérifiez manuellement les configurations :

1. Dans le fichier `backend/app/core/config.py` :
   ```python
   BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [
       "http://localhost:3000",
       "https://finetuner.io",
       "https://api.finetuner.io"
   ]
   ```

2. Dans le fichier `backend/.env` :
   ```
   BACKEND_CORS_ORIGINS=http://localhost:3000,https://finetuner.io,https://api.finetuner.io
   ```

3. Dans la configuration Nginx pour l'API (`/etc/nginx/conf.d/api.finetuner.io.conf`), assurez-vous que les en-têtes CORS sont correctement configurés.

## 3. Environnement de Développement

Pour faciliter le développement et éviter de reconstruire l'image Docker à chaque modification, vous pouvez configurer un environnement de développement avec le script `setup_dev_environment.sh` :

```bash
sudo ./setup_dev_environment.sh
```

Ce script effectue les actions suivantes :
- Crée un `Dockerfile.dev` pour le développement
- Crée un fichier `docker-compose.dev.yml` avec des services de développement
- Crée des scripts pour démarrer et arrêter l'environnement de développement

Une fois l'environnement configuré, vous pouvez le démarrer avec :

```bash
cd /opt/fintune
./start_dev_environment.sh
```

Et l'arrêter avec :

```bash
cd /opt/fintune
./stop_dev_environment.sh
```

L'environnement de développement est accessible aux adresses suivantes :
- Frontend : http://localhost:3001
- Backend : http://localhost:8001
- Documentation API : http://localhost:8001/docs

## 4. Problèmes de Versioning

### 4.1 Incompatibilité entre les versions de Node.js

Si vous rencontrez des problèmes de compatibilité avec Node.js, vérifiez la version utilisée dans le Dockerfile :

```bash
grep "FROM node" /opt/fintune/frontend/Dockerfile
```

Pour les projets utilisant l'option `--openssl-legacy-provider`, il est recommandé d'utiliser Node.js 14.x ou 16.x. Pour les projets plus récents, utilisez Node.js 16.x ou 18.x.

### 4.2 Incompatibilité entre les dépendances

Si vous rencontrez des erreurs lors de l'installation des dépendances, vérifiez les versions dans `package.json` :

```bash
cat /opt/fintune/frontend/package.json | grep "dependencies" -A 20
```

Pour résoudre les problèmes de dépendances incompatibles :

1. Créez une sauvegarde du fichier `package.json` :
   ```bash
   cp /opt/fintune/frontend/package.json /opt/fintune/frontend/package.json.backup
   ```

2. Mettez à jour les dépendances problématiques :
   ```bash
   # Exemple pour mettre à jour framer-motion
   sed -i 's/"framer-motion": "^[0-9.]*"/"framer-motion": "^12.0.0-alpha.0"/' /opt/fintune/frontend/package.json
   ```

3. Reconstruisez le conteneur frontend :
   ```bash
   cd /opt/fintune
   docker-compose build --no-cache frontend
   docker-compose up -d frontend
   ```

### 4.3 Problèmes avec les versions de Python

Si vous rencontrez des problèmes avec les versions de Python dans le backend, vérifiez la version utilisée dans le Dockerfile :

```bash
grep "FROM python" /opt/fintune/backend/Dockerfile
```

Pour les projets FastAPI, il est recommandé d'utiliser Python 3.8 ou supérieur.

## 5. Scripts Utilitaires

### 5.1 fix_frontend_build.sh

Script pour résoudre le problème de build du frontend lié à l'option `--openssl-legacy-provider`.

### 5.2 fix_cors_issues.sh

Script pour résoudre les problèmes de CORS dans l'application FinTune.

### 5.3 setup_dev_environment.sh

Script pour configurer un environnement de développement Docker.

### 5.4 start_dev_environment.sh

Script pour démarrer l'environnement de développement.

### 5.5 stop_dev_environment.sh

Script pour arrêter l'environnement de développement.

## 6. Logs et Débogage

### 6.1 Logs du Frontend

Pour consulter les logs du frontend :

```bash
docker-compose logs frontend
```

Pour suivre les logs en temps réel :

```bash
docker-compose logs -f frontend
```

### 6.2 Logs du Backend

Pour consulter les logs du backend :

```bash
docker-compose logs api
```

ou si vous utilisez systemd :

```bash
journalctl -u fintune-backend.service
```

### 6.3 Logs de Nginx

Pour consulter les logs de Nginx :

```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 6.4 Vérification des Conteneurs

Pour vérifier l'état des conteneurs :

```bash
docker-compose ps
```

Pour vérifier les détails d'un conteneur spécifique :

```bash
docker inspect fintune-frontend-1
```

### 6.5 Vérification des Ports

Pour vérifier les ports utilisés :

```bash
netstat -tulpn | grep LISTEN
```

## Conclusion

Ce guide de dépannage devrait vous aider à résoudre les problèmes courants rencontrés lors du déploiement et de l'utilisation de la plateforme FinTune. Si vous rencontrez des problèmes qui ne sont pas couverts par ce guide, veuillez consulter la documentation officielle ou contacter l'équipe de support. 