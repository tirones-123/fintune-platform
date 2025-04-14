# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Indiquer explicitement l'environnement
ENV NODE_ENV=production

# Copier uniquement les fichiers nécessaires pour l'installation des dépendances
COPY package.json package-lock.json ./

# Nettoyer le cache npm avant d'installer les dépendances
RUN npm cache clean --force && \
    npm install --no-audit --no-fund

# Copier le reste de l'application
COPY . .

# Vérifier que react-intersection-observer est bien installé
RUN npm list react-intersection-observer || npm install react-intersection-observer --save

# Construire l'application React
RUN npm run build

# Production stage
FROM nginx:alpine

# Copier le build final dans Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copier une config Nginx personnalisée si nécessaire
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose le port 80
EXPOSE 80
EXPOSE 443

# Lancer Nginx
CMD ["nginx", "-g", "daemon off;"]
