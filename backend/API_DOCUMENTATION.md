# Documentation de l'API Backend - FinTune Platform

## Introduction

Cette documentation présente l'API RESTful du backend de FinTune Platform, une plateforme pour automatiser la création de datasets de fine-tuning pour les modèles de langage. L'API est développée avec FastAPI et permet de gérer les projets, contenus, datasets, fine-tunings et abonnements.

## Base URL

```
http://localhost:8000/api
```

## Authentification

L'API utilise l'authentification OAuth2 avec des jetons JWT (JSON Web Tokens). Pour accéder aux endpoints protégés, vous devez inclure un token d'accès dans l'en-tête de votre requête.

```
Authorization: Bearer <access_token>
```

### Endpoints d'authentification

#### Inscription

```
POST /auth/register
```

Crée un nouveau compte utilisateur.

**Corps de la requête**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Réponse**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "is_active": true,
  "has_completed_onboarding": false,
  "created_at": "2023-03-10T12:00:00"
}
```

#### Connexion

```
POST /auth/login
```

Authentifie un utilisateur et renvoie des jetons d'accès et de rafraîchissement.

**Corps de la requête**
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

**Réponse**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "is_active": true,
    "has_completed_onboarding": false,
    "created_at": "2023-03-10T12:00:00"
  }
}
```

#### Rafraîchissement du token

```
POST /auth/refresh-token
```

Rafraîchit un token d'accès expiré.

**Corps de la requête**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Réponse**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "is_active": true,
    "has_completed_onboarding": false,
    "created_at": "2023-03-10T12:00:00"
  }
}
```

#### Déconnexion

```
POST /auth/logout
```

Déconnecte l'utilisateur (côté client uniquement).

**Réponse**
```json
{
  "detail": "Successfully logged out"
}
```

## Gestion des utilisateurs

### Profil utilisateur

#### Obtenir le profil courant

```
GET /users/me
```

Récupère les informations du profil de l'utilisateur courant.

**Réponse**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "is_active": true,
  "has_completed_onboarding": true,
  "created_at": "2023-03-10T12:00:00"
}
```

#### Mettre à jour le profil

```
PUT /users/me
```

Met à jour les informations du profil de l'utilisateur courant.

**Corps de la requête**
```json
{
  "name": "John Updated",
  "has_completed_onboarding": true
}
```

**Réponse**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Updated",
  "is_active": true,
  "has_completed_onboarding": true,
  "created_at": "2023-03-10T12:00:00"
}
```

### Abonnement

#### Obtenir l'abonnement courant

```
GET /users/me/subscription
```

Récupère les informations de l'abonnement de l'utilisateur courant.

**Réponse**
```json
{
  "id": 1,
  "user_id": 1,
  "stripe_subscription_id": "sub_1234567890",
  "plan": "Pro",
  "status": "active",
  "current_period_start": "2023-03-10T12:00:00",
  "current_period_end": "2023-04-10T12:00:00",
  "max_projects": 10,
  "max_fine_tunings": 5,
  "created_at": "2023-03-10T12:00:00"
}
```

### Clés API

Les clés API sont nécessaires pour utiliser les services de fine-tuning. Elles sont stockées de manière sécurisée et associées au profil utilisateur.

#### Obtenir les clés API configurées

```
GET /users/me/api-keys
```

Récupère les clés API configurées pour l'utilisateur courant.

**Réponse**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "provider": "openai",
    "key": "sk_xxxxxxxxxxxxxxxx",
    "created_at": "2023-03-10T12:00:00"
  }
]
```

#### Ajouter ou mettre à jour une clé API

```
POST /users/me/api-keys
```

Ajoute une nouvelle clé API ou met à jour une clé existante pour un provider.

**Corps de la requête**
```json
{
  "provider": "openai",
  "key": "sk_xxxxxxxxxxxxxxxx"
}
```

**Providers supportés**:
- `openai`: Clés commençant par "sk-..."
- `anthropic`: Clés commençant par "sk-ant-..."
- `mistral`: Format spécifique à Mistral AI

**Note**: La clé API est requise avant de pouvoir lancer un fine-tuning avec le provider correspondant.

#### Supprimer une clé API

```
DELETE /users/me/api-keys/{provider}
```

Supprime une clé API pour un fournisseur spécifique.

**Réponse**
```
204 No Content
```

## Gestion des projets

### Récupérer tous les projets

```
GET /projects
```

Récupère tous les projets de l'utilisateur courant.

**Réponse**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Mon premier projet",
    "description": "Description du projet",
    "status": "active",
    "created_at": "2023-03-10T12:00:00",
    "updated_at": "2023-03-10T12:00:00"
  }
]
```

### Créer un nouveau projet

```
POST /projects
```

Crée un nouveau projet.

**Corps de la requête**
```json
{
  "name": "Mon nouveau projet",
  "description": "Description du nouveau projet"
}
```

**Réponse**
```json
{
  "id": 2,
  "user_id": 1,
  "name": "Mon nouveau projet",
  "description": "Description du nouveau projet",
  "status": "active",
  "created_at": "2023-03-10T12:00:00",
  "updated_at": "2023-03-10T12:00:00"
}
```

### Récupérer un projet spécifique

```
GET /projects/{project_id}
```

Récupère les détails d'un projet spécifique.

**Réponse**
```json
{
  "id": 1,
  "user_id": 1,
  "name": "Mon premier projet",
  "description": "Description du projet",
  "status": "active",
  "created_at": "2023-03-10T12:00:00",
  "updated_at": "2023-03-10T12:00:00"
}
```

### Mettre à jour un projet

```
PUT /projects/{project_id}
```

Met à jour un projet existant.

**Corps de la requête**
```json
{
  "name": "Projet renommé",
  "description": "Description mise à jour"
}
```

**Réponse**
```json
{
  "id": 1,
  "user_id": 1,
  "name": "Projet renommé",
  "description": "Description mise à jour",
  "status": "active",
  "created_at": "2023-03-10T12:00:00",
  "updated_at": "2023-03-10T13:00:00"
}
```

### Supprimer un projet

```
DELETE /projects/{project_id}
```

Supprime un projet existant.

**Réponse**
```
204 No Content
```

## Gestion des contenus

### Récupérer tous les contenus

```
GET /contents
```

Récupère tous les contenus de l'utilisateur courant.

**Paramètres de requête**
- `project_id` (optionnel): Filtrer par projet

**Réponse**
```json
[
  {
    "id": 1,
    "project_id": 1,
    "name": "Mon document",
    "description": "Description du document",
    "type": "pdf",
    "url": null,
    "file_path": "/uploads/user_1/doc.pdf",
    "size": 1024,
    "status": "processed",
    "created_at": "2023-03-10T12:00:00",
    "updated_at": "2023-03-10T12:00:00"
  }
]
```

### Créer un contenu (URL)

```
POST /contents
```

Crée un nouveau contenu à partir d'une URL.

**Corps de la requête**
```json
{
  "project_id": 1,
  "name": "Vidéo YouTube",
  "description": "Description de la vidéo",
  "type": "youtube",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Réponse**
```json
{
  "id": 2,
  "project_id": 1,
  "name": "Vidéo YouTube",
  "description": "Description de la vidéo",
  "type": "youtube",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "file_path": null,
  "size": 0,
  "status": "processing",
  "created_at": "2023-03-10T12:00:00",
  "updated_at": "2023-03-10T12:00:00"
}
```

### Télécharger un fichier

```
POST /contents/upload
```

Télécharge un fichier et crée un nouveau contenu.

**Corps de la requête (multipart/form-data)**
- `file`: Le fichier à télécharger
- `project_id`: ID du projet
- `name`: Nom du contenu
- `description` (optionnel): Description du contenu
- `file_type`: Type de fichier (pdf, text)

**Réponse**
```json
{
  "id": 3,
  "project_id": 1,
  "name": "Document PDF",
  "description": "Description du document",
  "type": "pdf",
  "url": null,
  "file_path": "/uploads/user_1/document.pdf",
  "size": 2048,
  "status": "processing",
  "created_at": "2023-03-10T12:00:00",
  "updated_at": "2023-03-10T12:00:00"
}
```

### Ajouter un contenu par URL

```
POST /contents/url
```

Ajoute un contenu à partir d'une URL.

**Corps de la requête**
```json
{
  "project_id": 1,
  "name": "Article de blog",
  "url": "https://example.com/blog-post",
  "type": "website"
}
```

**Réponse**
```json
{
  "id": 4,
  "project_id": 1,
  "name": "Article de blog",
  "description": null,
  "type": "website",
  "url": "https://example.com/blog-post",
  "file_path": null,
  "size": 0,
  "status": "processing",
  "created_at": "2023-03-10T12:00:00",
  "updated_at": "2023-03-10T12:00:00"
}
```

### Récupérer un contenu spécifique

```
GET /contents/{content_id}
```

Récupère les détails d'un contenu spécifique.

**Réponse**
```json
{
  "id": 1,
  "project_id": 1,
  "name": "Mon document",
  "description": "Description du document",
  "type": "pdf",
  "url": null,
  "file_path": "/uploads/user_1/doc.pdf",
  "size": 1024,
  "status": "processed",
  "created_at": "2023-03-10T12:00:00",
  "updated_at": "2023-03-10T12:00:00"
}
```

### Mettre à jour un contenu

```
PUT /contents/{content_id}
```

Met à jour un contenu existant.

**Corps de la requête**
```json
{
  "name": "Document renommé",
  "description": "Description mise à jour"
}
```

**Réponse**
```json
{
  "id": 1,
  "project_id": 1,
  "name": "Document renommé",
  "description": "Description mise à jour",
  "type": "pdf",
  "url": null,
  "file_path": "/uploads/user_1/doc.pdf",
  "size": 1024,
  "status": "processed",
  "created_at": "2023-03-10T12:00:00",
  "updated_at": "2023-03-10T13:00:00"
}
```

### Supprimer un contenu

```
DELETE /contents/{content_id}
```

Supprime un contenu existant.

**Réponse**
```
204 No Content
```

## Gestion des datasets

### Récupérer tous les datasets

```
GET /datasets
```

Récupère tous les datasets de l'utilisateur courant.

**Paramètres de requête**
- `project_id` (optionnel): Filtrer par projet

**Réponse**
```json
[
  {
    "id": 1,
    "project_id": 1,
    "name": "Mon dataset",
    "description": "Description du dataset",
    "model": "gpt-3.5-turbo",
    "status": "ready",
    "pairs_count": 100,
    "size": 50000,
    "created_at": "2023-03-10T12:00:00",
    "updated_at": "2023-03-10T12:30:00"
  }
]
```

### Créer un nouveau dataset

```
POST /datasets
```

Crée un nouveau dataset.

**Corps de la requête**
```json
{
  "project_id": 1,
  "name": "Nouveau dataset",
  "description": "Description du nouveau dataset",
  "model": "gpt-3.5-turbo",
  "content_ids": [1, 2]
}
```

**Réponse**
```json
{
  "id": 2,
  "project_id": 1,
  "name": "Nouveau dataset",
  "description": "Description du nouveau dataset",
  "model": "gpt-3.5-turbo",
  "status": "processing",
  "pairs_count": 0,
  "size": 0,
  "created_at": "2023-03-10T12:00:00",
  "updated_at": "2023-03-10T12:00:00"
}
```

### Récupérer un dataset spécifique

```
GET /datasets/{dataset_id}
```

Récupère les détails d'un dataset spécifique.

**Réponse**
```json
{
  "id": 1,
  "project_id": 1,
  "name": "Mon dataset",
  "description": "Description du dataset",
  "model": "gpt-3.5-turbo",
  "status": "ready",
  "pairs_count": 100,
  "size": 50000,
  "created_at": "2023-03-10T12:00:00",
  "updated_at": "2023-03-10T12:30:00"
}
```

### Récupérer un dataset avec ses paires

```
GET /datasets/{dataset_id}/pairs
```

Récupère un dataset avec ses paires question-réponse.

**Réponse**
```json
{
  "id": 1,
  "project_id": 1,
  "name": "Mon dataset",
  "description": "Description du dataset",
  "model": "gpt-3.5-turbo",
  "status": "ready",
  "pairs_count": 2,
  "size": 1000,
  "created_at": "2023-03-10T12:00:00",
  "updated_at": "2023-03-10T12:30:00",
  "pairs": [
    {
      "id": 1,
      "dataset_id": 1,
      "question": "Comment ça va?",
      "answer": "Je vais bien, merci de demander!",
      "metadata": {"source": "content_1", "chunk_id": 3},
      "created_at": "2023-03-10T12:20:00"
    },
    {
      "id": 2,
      "dataset_id": 1,
      "question": "Quel est votre produit?",
      "answer": "Notre produit est une plateforme de fine-tuning pour modèles de langage.",
      "metadata": {"source": "content_1", "chunk_id": 5},
      "created_at": "2023-03-10T12:20:00"
    }
  ]
}
```

### Mettre à jour un dataset

```
PUT /datasets/{dataset_id}
```

Met à jour un dataset existant.

**Corps de la requête**
```json
{
  "name": "Dataset renommé",
  "description": "Description mise à jour"
}
```

**Réponse**
```json
{
  "id": 1,
  "project_id": 1,
  "name": "Dataset renommé",
  "description": "Description mise à jour",
  "model": "gpt-3.5-turbo",
  "status": "ready",
  "pairs_count": 100,
  "size": 50000,
  "created_at": "2023-03-10T12:00:00",
  "updated_at": "2023-03-10T13:00:00"
}
```

### Supprimer un dataset

```
DELETE /datasets/{dataset_id}
```

Supprime un dataset existant.

**Réponse**
```
204 No Content
```

### Ajouter une paire au dataset

```
POST /datasets/{dataset_id}/pairs
```

Ajoute une nouvelle paire question-réponse à un dataset.

**Corps de la requête**
```json
{
  "question": "Qu'est-ce que le fine-tuning?",
  "answer": "Le fine-tuning est un processus qui permet d'adapter un modèle de langage pré-entraîné à des tâches spécifiques.",
  "metadata": {"source": "manual"}
}
```

**Réponse**
```json
{
  "id": 3,
  "dataset_id": 1,
  "question": "Qu'est-ce que le fine-tuning?",
  "answer": "Le fine-tuning est un processus qui permet d'adapter un modèle de langage pré-entraîné à des tâches spécifiques.",
  "metadata": {"source": "manual"},
  "created_at": "2023-03-10T13:00:00"
}
```

### Ajouter des paires en masse

```
POST /datasets/{dataset_id}/pairs/bulk
```

Ajoute plusieurs paires question-réponse à un dataset en une seule requête.

**Corps de la requête**
```json
{
  "pairs": [
    {
      "question": "Qu'est-ce que le fine-tuning?",
      "answer": "Le fine-tuning est un processus qui permet d'adapter un modèle de langage pré-entraîné à des tâches spécifiques.",
      "metadata": {"source": "manual"}
    },
    {
      "question": "Comment fonctionne le fine-tuning?",
      "answer": "Le fine-tuning fonctionne en réentraînant un modèle pré-entraîné sur un dataset spécifique à votre cas d'usage.",
      "metadata": {"source": "manual"}
    }
  ]
}
```

**Réponse**
```json
{
  "id": 1,
  "project_id": 1,
  "name": "Dataset renommé",
  "description": "Description mise à jour",
  "model": "gpt-3.5-turbo",
  "status": "ready",
  "pairs_count": 102,
  "size": 51000,
  "created_at": "2023-03-10T12:00:00",
  "updated_at": "2023-03-10T13:10:00"
}
```

### Supprimer une paire

```
DELETE /datasets/{dataset_id}/pairs/{pair_id}
```

Supprime une paire spécifique d'un dataset.

**Réponse**
```
204 No Content
```

### Exporter un dataset

```
GET /datasets/{dataset_id}/export
```

Exporte un dataset dans le format spécifié pour le fine-tuning.

**Paramètres de requête**
- `format` (optionnel): Format d'export (défaut: jsonl)
- `provider` (optionnel): Fournisseur cible (openai, anthropic, mistral) (défaut: openai)

**Réponse**
Un fichier JSONL téléchargeable contenant les paires formatées selon le fournisseur spécifié.

## Gestion des fine-tunings

### Récupérer tous les fine-tunings

```
GET /fine-tunings
```

Récupère tous les fine-tunings de l'utilisateur courant.

**Paramètres de requête**
- `dataset_id` (optionnel): Filtrer par dataset
- `project_id` (optionnel): Filtrer par projet

**Réponse**
```json
[
  {
    "id": 1,
    "dataset_id": 1,
    "name": "Mon fine-tuning",
    "description": "Description du fine-tuning",
    "model": "gpt-3.5-turbo",
    "provider": "openai",
    "status": "training",
    "progress": 45.5,
    "hyperparameters": {
      "epochs": 3,
      "learning_rate": 0.0001
    },
    "external_id": null,
    "metrics": {
      "training_loss": 0.056,
      "validation_loss": 0.062,
      "step": 500,
      "total_steps": 1000
    },
    "error_message": null,
    "created_at": "2023-03-10T12:00:00",
    "updated_at": "2023-03-10T12:30:00",
    "completed_at": null
  }
]
```

**Champs de fine-tuning supplémentaires:**

- `progress`: Pourcentage de progression du fine-tuning (0-100)
- `external_id`: Identifiant du job chez le fournisseur d'IA (OpenAI, Anthropic, Mistral)
- `metrics`: Statistiques d'entraînement retournées par le fournisseur d'IA
  - `training_loss`: Perte sur l'ensemble d'entraînement
  - `validation_loss`: Perte sur l'ensemble de validation (si disponible)
  - `step`: Étape d'entraînement actuelle
  - `total_steps`: Nombre total d'étapes prévues
- `completed_at`: Date de fin du fine-tuning (uniquement pour les statuts "completed", "cancelled" ou "error")

**Statuts possibles:**
- `queued`: Le job est en attente de démarrage
- `preparing`: Le job est en préparation (traitement des données)
- `training`: L'entraînement est en cours
- `completed`: L'entraînement est terminé avec succès
- `cancelled`: L'entraînement a été annulé par l'utilisateur
- `error`: Une erreur s'est produite pendant l'entraînement

### Créer un nouveau fine-tuning

```
POST /fine-tunings
```

Crée un nouveau job de fine-tuning.

**Corps de la requête**
```json
{
  "dataset_id": 1,
  "name": "Nouveau fine-tuning",
  "description": "Description du nouveau fine-tuning",
  "model": "gpt-3.5-turbo",
  "provider": "openai",
  "hyperparameters": {
    "n_epochs": 3  // Seul hyperparamètre actuellement supporté par OpenAI
  }
}
```

**Note importante**: Pour les fine-tunings OpenAI :
- Seul le paramètre `n_epochs` est supporté dans l'objet `hyperparameters`
- Les paramètres `learning_rate` et `batch_size` ne sont pas acceptés par l'API OpenAI

**Réponse**
```json
{
  "id": 2,
  "dataset_id": 1,
  "name": "Nouveau fine-tuning",
  "description": "Description du nouveau fine-tuning",
  "model": "gpt-3.5-turbo",
  "provider": "openai",
  "status": "queued",
  "hyperparameters": {
    "n_epochs": 3
  },
  "external_id": null,
  "error_message": null,
  "created_at": "2023-03-10T13:00:00",
  "updated_at": "2023-03-10T13:00:00"
}
```

**Traitement asynchrone**

Lorsqu'un fine-tuning est créé, le traitement est géré de manière asynchrone par des tâches Celery en arrière-plan:
1. Une tâche `start_fine_tuning` est déclenchée immédiatement après la création
2. Cette tâche communique avec l'API du provider (OpenAI, Anthropic, Mistral) 
3. Le statut et la progression sont mis à jour périodiquement dans la base de données
4. Des tâches périodiques vérifient l'état du fine-tuning auprès du provider

**Codes d'erreur possibles**
- `404 Not Found`: Dataset non trouvé ou n'appartenant pas à l'utilisateur
- `400 Bad Request`: Dataset non prêt pour le fine-tuning ou paramètres invalides
- `401 Unauthorized`: Clé API manquante pour le provider spécifié

### Récupérer un fine-tuning spécifique

```
GET /fine-tunings/{fine_tuning_id}
```

Récupère les détails d'un fine-tuning spécifique.

**Réponse**
```json
{
  "id": 1,
  "dataset_id": 1,
  "name": "Mon fine-tuning",
  "description": "Description du fine-tuning",
  "model": "gpt-3.5-turbo",
  "provider": "openai",
  "status": "training",
  "progress": 45.5,
  "hyperparameters": {
    "epochs": 3,
    "learning_rate": 0.0001
  },
  "external_id": null,
  "metrics": {
    "training_loss": 0.056,
    "validation_loss": 0.062,
    "step": 500,
    "total_steps": 1000
  },
  "error_message": null,
  "created_at": "2023-03-10T12:00:00",
  "updated_at": "2023-03-10T12:30:00",
  "completed_at": null
}
```

### Mettre à jour un fine-tuning

```
PUT /fine-tunings/{fine_tuning_id}
```

Met à jour un fine-tuning existant.

**Corps de la requête**
```json
{
  "name": "Fine-tuning renommé",
  "description": "Description mise à jour"
}
```

**Réponse**
```json
{
  "id": 1,
  "dataset_id": 1,
  "name": "Fine-tuning renommé",
  "description": "Description mise à jour",
  "model": "gpt-3.5-turbo",
  "provider": "openai",
  "status": "training",
  "progress": 45.5,
  "hyperparameters": {
    "epochs": 3,
    "learning_rate": 0.0001
  },
  "external_id": null,
  "metrics": {
    "training_loss": 0.056,
    "validation_loss": 0.062,
    "step": 500,
    "total_steps": 1000
  },
  "error_message": null,
  "created_at": "2023-03-10T12:00:00",
  "updated_at": "2023-03-10T13:00:00",
  "completed_at": null
}
```

### Supprimer un fine-tuning

```
DELETE /fine-tunings/{fine_tuning_id}
```

Supprime un fine-tuning existant.

**Réponse**
```
204 No Content
```

### Annuler un fine-tuning

```
POST /fine-tunings/{fine_tuning_id}/cancel
```

Annule un job de fine-tuning en cours.

**Corps de la requête**
```json
{
  "reason": "Coût trop élevé"
}
```

**Réponse**
```json
{
  "id": 1,
  "dataset_id": 1,
  "name": "Mon fine-tuning",
  "description": "Description du fine-tuning",
  "model": "gpt-3.5-turbo",
  "provider": "openai",
  "status": "cancelled",
  "progress": 45.5,
  "hyperparameters": {
    "epochs": 3,
    "learning_rate": 0.0001
  },
  "external_id": null,
  "metrics": {
    "training_loss": 0.056,
    "validation_loss": 0.062,
    "step": 500,
    "total_steps": 1000
  },
  "error_message": "Coût trop élevé",
  "created_at": "2023-03-10T12:00:00",
  "updated_at": "2023-03-10T13:00:00",
  "completed_at": null
}
```

## Gestion des paiements

### Créer une session de paiement

```
POST /checkout/create-checkout-session/{plan_id}
```

Crée une session Stripe pour l'abonnement.

**Paramètres**
- `plan_id`: ID du plan (starter, pro, enterprise)

**Réponse**
```json
{
  "checkout_url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

**Codes d'erreur possibles**
- `400 Bad Request`: ID de plan invalide
- `500 Internal Server Error`: Erreur lors de la création de la session Stripe (détails dans le corps de la réponse)

### Webhook Stripe

```
POST /checkout/webhook
```

Gère les événements de webhook de Stripe.

**Corps de la requête**
Un événement Stripe conforme à leur format de webhook, avec en-tête `stripe-signature`.

**Réponse**
```json
{
  "status": "success"
}
```

**Codes d'erreur possibles**
- `400 Bad Request`: Erreur de vérification de signature ou événement non reconnu

**Détails d'implémentation des webhooks Stripe**

L'endpoint `/checkout/webhook` traite les événements Stripe avec les spécificités suivantes:

1. **Vérification de la signature**: Chaque requête entrante est vérifiée à l'aide de la signature Stripe pour garantir son authenticité.

2. **Gestion de `checkout.session.completed`**: 
   - Vérifie si un ID de souscription est présent dans la session
   - Recherche une souscription existante avec cet ID
   - Si trouvé, met à jour son statut à "active" et enregistre l'ID client Stripe
   - Si non trouvé, crée une nouvelle souscription en utilisant les métadonnées de la session, notamment:
     - `user_id`: ID de l'utilisateur 
     - `plan_id`: Type de plan (starter, pro, enterprise)
     - `is_upgrade`: Booléen indiquant s'il s'agit d'une mise à niveau

3. **Gestion de `customer.subscription.updated`**:
   - Met à jour le statut de l'abonnement et les dates de période
   - Préserve les informations spécifiques à l'application (comme les limites de projets)

4. **Gestion de `customer.subscription.deleted`**:
   - Marque l'abonnement comme "canceled" sans le supprimer de la base

5. **Journalisation**: Tous les événements sont journalisés pour le débogage et l'audit

**Événements gérés par le webhook Stripe**

L'endpoint `/checkout/webhook` gère les événements Stripe suivants:

- `checkout.session.completed`: Déclenché lorsqu'une session de paiement est complétée avec succès. Crée ou met à jour l'abonnement de l'utilisateur.
  
- `customer.subscription.updated`: Déclenché lorsqu'un abonnement est modifié (changement de plan, informations de facturation, etc.). Met à jour les informations d'abonnement dans la base de données.
  
- `customer.subscription.deleted`: Déclenché lorsqu'un abonnement est supprimé. Marque l'abonnement comme "canceled" dans la base de données.

Pour chaque événement, le système vérifie l'authenticité à l'aide de la signature Stripe et met à jour la base de données en conséquence.

## Fonctionnalités auxiliaires (Helpers)

### Transcription de vidéos

```
POST /helpers/video-transcript
```

Extrait et transcrit le contenu audio d'une vidéo YouTube ou d'autres sources vidéo.

**Corps de la requête**
```json
{
  "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Réponse**
```json
{
  "status": "success",
  "transcript": "Texte complet de la transcription de la vidéo...",
  "source": "youtube_transcript_api" // ou "whisper" si la transcription a été générée par Whisper
}
```

**Codes d'erreur possibles**
- `400 Bad Request`: URL invalide ou non supportée
- `404 Not Found`: Vidéo non trouvée
- `422 Unprocessable Entity`: Impossible d'extraire les sous-titres ou l'audio
- `500 Internal Server Error`: Erreur lors du traitement de la demande

### Scraping Web

```
POST /helpers/scrape-web
```

Extrait le contenu textuel principal (titre et paragraphes) d'une page web.

**Corps de la requête**
```json
{
  "url": "https://example.com/article"
}
```

**Réponse**
```json
{
  "status": "success",
  "title": "Titre de la page",
  "content": "Contenu textuel extrait de la page web...",
  "paragraphs": [
    "Premier paragraphe...",
    "Deuxième paragraphe...",
    "..."
  ]
}
```

**Codes d'erreur possibles**
- `400 Bad Request`: URL invalide
- `404 Not Found`: Page web non trouvée
- `422 Unprocessable Entity`: Impossible d'extraire le contenu
- `500 Internal Server Error`: Erreur lors du traitement de la demande

## Formats de données

### Format JSONL pour OpenAI

```jsonl
{"messages": [{"role": "system", "content": "Vous êtes un assistant qui génère du contenu dans le style de l'auteur"}, {"role": "user", "content": "Question"}, {"role": "assistant", "content": "Réponse"}]}
```

### Format JSONL pour Anthropic

```jsonl
{"messages": [{"role": "user", "content": "Question"}, {"role": "assistant", "content": "Réponse"}]}
```

### Format JSONL pour Mistral

```jsonl
{"messages": [{"role": "user", "content": "Question"}, {"role": "assistant", "content": "Réponse"}]} 
```

## Workflow de Fine-tuning

Le processus de fine-tuning suit les étapes suivantes :

1. **Configuration de la clé API**
   - L'utilisateur doit d'abord configurer sa clé API pour le provider souhaité via l'endpoint `/users/me/api-keys`

2. **Création du Dataset**
   - Créer un dataset à partir des contenus via l'endpoint `/datasets`
   - Attendre que le status du dataset passe à "ready"

3. **Lancement du Fine-tuning**
   - Créer un job de fine-tuning via l'endpoint `/fine-tunings`
   - Le système récupère automatiquement la clé API associée au provider choisi
   - Le job passe par différents états : "queued" → "preparing" → "training" → "completed"

4. **Suivi du Progrès**
   - Utiliser l'endpoint GET `/fine-tunings/{fine_tuning_id}` pour suivre l'avancement
   - Le champ `progress` indique le pourcentage de progression (0-100)
   - Le champ `status` indique l'état actuel du job 