# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Indiquer explicitement l'environnement
ENV NODE_ENV=production

# Copier et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste de l'application
COPY . .

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
