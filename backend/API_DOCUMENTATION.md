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
  "has_received_free_credits": false,
  "created_at": "2023-03-10T12:00:00",
  "free_characters_remaining": 5000,
  "total_characters_used": 5000
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
    "character_count": 25000,
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

### Créer une session de paiement (Onboarding)

```
POST /checkout/create-onboarding-session
```

Crée une session de paiement Stripe ou lance le traitement gratuit pour finaliser l'onboarding.

**Corps de la requête**
```json
{
  "character_count": 15000,
  "pending_transcriptions": [{"id": 12}, {"id": 15}],
  "dataset_name": "Mon Dataset Onboarding",
  "system_content": "Tu es un assistant utile.",
  "provider": "openai",
  "model": "gpt-3.5-turbo"
}
```

**Logique de traitement**
1. Vérifie si `character_count <= 10000` ET si l'utilisateur (`current_user`) n'a pas encore reçu les crédits gratuits (`has_received_free_credits == False`).
    * Si oui : Ajoute les crédits gratuits, marque l'utilisateur comme les ayant reçus (`has_received_free_credits = True`), lance les transcriptions et la création du dataset/fine-tuning en arrière-plan.
2. Vérifie si `character_count <= 10000` MAIS l'utilisateur a déjà reçu les crédits gratuits.
    * Si oui : Lance les transcriptions et la création du dataset/fine-tuning, mais n'ajoute pas de crédits.
3. Si `character_count > 10000`:
    * Calcule le nombre de caractères facturables (`billable_characters = character_count - 10000`).
    * Calcule le montant en cents (`amount_cents`).
    * Si `amount_cents` est inférieur au seuil Stripe (ex: 60 cents), traite comme le cas 2 (gratuit, sans ajout de crédits).
    * Sinon, crée une session de paiement Stripe avec les informations nécessaires dans les `metadata` (user\_id, project\_id, dataset\_name, provider, model, content\_ids, etc.) pour que le webhook puisse lancer le traitement après paiement.

**Réponse (Traitement gratuit)**
```json
{
  "status": "success",
  "free_processing": true,
  "redirect_url": "{FRONTEND_URL}/dashboard?onboarding_completed=true"
}
```

**Réponse (Paiement requis)**
```json
{
  "checkout_url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

### Webhook Stripe

```
POST /checkout/webhook
```

Gère les événements de webhook de Stripe (ex: `checkout.session.completed`).

**Détails d'implémentation importants**
- Vérifie le `payment_type` dans les `metadata` de la session Stripe.
- Si `payment_type` est `"onboarding_characters"` ou `"fine_tuning_job"`, le webhook:
    - Récupère les informations nécessaires (user\_id, project\_id, content\_ids, config, etc.) depuis les `metadata`.
    - Marque l'utilisateur comme ayant reçu les crédits gratuits (si applicable et non déjà fait).
    - Crée les entrées `Dataset` et `FineTuning` dans la base de données.
    - Lance les tâches Celery nécessaires (transcription, génération de dataset).
- Si `payment_type` est `"character_credits"`, ajoute les crédits achetés à l'utilisateur.
- **IMPORTANT**: Le webhook doit toujours retourner un statut `200 OK` à Stripe (ex: `{"status": "success"}`) si la signature est valide, même si le traitement interne échoue, pour éviter les rejeux. Les erreurs de traitement doivent être gérées via les logs.

## Gestion des caractères

La plateforme utilise désormais un système de facturation basé sur le nombre de caractères pour les datasets et le fine-tuning. Chaque utilisateur dispose initialement d'un quota gratuit.

### Obtenir les statistiques d'utilisation

```
GET /characters/usage-stats
```

Récupère les statistiques d'utilisation des caractères pour l'utilisateur courant.

**Réponse**
```json
{
  "free_characters_remaining": 5000,
  "total_characters_used": 5000,
  "total_characters_purchased": 1000
}
```

### Obtenir les informations de tarification

```
GET /characters/pricing
```

Récupère les informations de tarification des caractères.

**Réponse**
```json
{
  "price_per_character": 0.000365,
  "free_characters": 10000
}
```

### Récupérer l'historique des transactions

```
GET /characters/transactions
```

Récupère l'historique des transactions de caractères pour l'utilisateur courant.

**Paramètres de requête**
- `limit`: Nombre maximum de transactions à retourner (défaut: 100)
- `offset`: Nombre de transactions à sauter pour la pagination (défaut: 0)

**Réponse**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "amount": 1000,
    "description": "Achat de 1000 caractères",
    "dataset_id": null,
    "payment_id": 123,
    "price_per_character": 0.000365,
    "total_price": 0.365,
    "created_at": "2023-03-10T12:00:00"
  },
  {
    "id": 2,
    "user_id": 1,
    "amount": -500,
    "description": "Utilisation de 500 caractères pour le dataset 'Mon dataset'",
    "dataset_id": 5,
    "payment_id": null,
    "price_per_character": 0.000365,
    "total_price": 0.1825,
    "created_at": "2023-03-15T14:30:00"
  }
]
```

**Note**: Les montants positifs représentent des achats, les montants négatifs représentent des utilisations.

### Acheter des crédits de caractères

```
POST /characters/purchase
```

Permet d'acheter des crédits de caractères supplémentaires.

**Corps de la requête**
```json
{
  "character_count": 10000
}
```

**Réponse**
```json
{
  "id": 3,
  "user_id": 1,
  "amount": 10000,
  "description": "Achat en attente de 10000 caractères",
  "dataset_id": null,
  "payment_id": 124,
  "price_per_character": 0.000365,
  "total_price": 3.65,
  "checkout_url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

### Évaluation de la qualité des données

```
POST /characters/quality-assessment
```

Évalue la qualité des données en fonction du nombre de caractères et du type d'usage.

**Corps de la requête**
```json
{
  "character_count": 5000,
  "usage_type": "customer_support"
}
```

**Réponse**
```json
{
  "character_count": 5000,
  "usage_type": "customer_support",
  "score": 0.37,
  "suggestions": [
    "Votre jeu de données pourrait être amélioré. Ajoutez plus de contenu pour de meilleurs résultats.",
    "Incluez des exemples plus variés pour couvrir différents aspects de votre domaine."
  ]
}
```

**Types d'usage supportés**
- `customer_support`: Support client
- `sales`: Ventes
- `marketing`: Marketing
- `technical`: Documentation technique
- `legal`: Textes juridiques
- `medical`: Textes médicaux
- `generic`: Usage général

## Workflow de Fine-tuning

Le processus de fine-tuning suit les étapes suivantes :

1. **Configuration de la clé API**
   - L'utilisateur doit d'abord configurer sa clé API pour le provider souhaité via l'endpoint `/users/me/api-keys`

2. **Préparation des contenus**
   - Upload/ajout via les endpoints `/contents/...`

3. **Lancement du Fine-tuning Job**
   - via l'endpoint **`/fine-tuning-jobs`** (voir ci-dessous)
     * Le système calcule le coût basé sur les caractères des contenus sélectionnés
     * Si le coût est nul (quota gratuit non utilisé ou montant trop faible), le système crée le `Dataset`, le `FineTuning` et lance les tâches (transcription, génération)
     * Si un paiement est requis, l'API retourne une URL Stripe. Après paiement, le webhook Stripe déclenche la création du `Dataset`, du `FineTuning` et le lancement des tâches

4. **Suivi du Progrès**
   - via `GET /fine-tunings/{fine_tuning_id}` ou `GET /datasets/{dataset_id}`

5. **Test du modèle**
   - via l'endpoint `/fine-tunings/{fine_tuning_id}/test` (voir ci-dessous)

## Nouvel Endpoint : Création de Fine-Tuning Job

```
POST /fine-tuning-jobs
```

Crée et lance un nouveau job de fine-tuning complet (Dataset + FineTuning) à partir d'un projet et de contenus sélectionnés. Gère la logique de coût et de paiement.

**Corps de la requête** (`CreateFineTuningJobRequest`)
```json
{
  "project_id": 1,
  "content_ids": [10, 12, 15],
  "config": {
    "provider": "openai",
    "model": "gpt-3.5-turbo-0125",
    "hyperparameters": {"n_epochs": 3},
    "system_prompt": "Assistant spécialisé en...",
    "job_name": "Mon Job de Test",
    "dataset_name": "Dataset pour Job Test"
  }
}
```

**Logique de traitement**
- Calcule le nombre total de caractères des `content_ids`
- Appelle `character_service.handle_fine_tuning_cost` en passant l'utilisateur pour vérifier `has_received_free_credits`
- **Si paiement requis** : Retourne une réponse avec `status: "pending_payment"` et `checkout_url`
- **Si traitement gratuit** :
    - Vérifie si les crédits gratuits doivent être appliqués (première fois)
    - Si oui, ajoute les crédits via `CharacterService` et marque `user.has_received_free_credits = True`
    - Crée le `Dataset` et le `FineTuning`
    - Lance les tâches Celery (`transcribe_youtube_video` si besoin, `generate_dataset`)
    - Retourne une réponse avec `status: "processing_started"`, `redirect_url`, `fine_tuning_id`, `dataset_id`

**Réponse** (`FineTuningJobResponse`)
```json
// Si paiement requis
{
  "status": "pending_payment",
  "message": "Paiement requis pour lancer le fine-tuning.",
  "checkout_url": "https://checkout.stripe.com/pay/cs_test_...",
  "redirect_url": null,
  "fine_tuning_id": null,
  "dataset_id": null
}

// Si traitement gratuit lancé
{
  "status": "processing_started",
  "message": "Le processus de fine-tuning a été lancé.",
  "checkout_url": null,
  "redirect_url": "{FRONTEND_URL}/dashboard/projects/1?tab=finetune",
  "fine_tuning_id": 5,
  "dataset_id": 10
}
```

## Nouvel Endpoint : Tester un Modèle Fine-tuné

```
POST /fine-tunings/{fine_tuning_id}/test
```

Permet d'envoyer un prompt à un modèle fine-tuné spécifique (qui doit avoir le statut "completed") et d'obtenir sa réponse. Utilisé par le Playground.

**Paramètres URL**
- `fine_tuning_id` (int): ID du fine-tuning à tester

**Corps de la requête**
```json
{
  "prompt": "Quelle est la procédure pour... ?"
}
```

**Réponse**
```json
{
  "response": "La procédure est la suivante : ... (réponse du modèle fine-tuné)"
}
```

**Codes d'erreur possibles**
- `404 Not Found`: Fine-tuning non trouvé ou non autorisé
- `400 Bad Request`: Modèle non complété ou erreur lors de l'appel à l'API du fournisseur

### Transcription de vidéos YouTube

```
POST /helpers/video-transcript
```

Extrait la transcription d'une vidéo YouTube en utilisant soit les sous-titres intégrés, soit en transcrivant l'audio avec Whisper.

**Corps de la requête**
```json
{
  "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "async_process": false,
  "content_id": null
}
```

**Paramètres:**
- `video_url`: URL de la vidéo YouTube (obligatoire)
- `async_process`: Booléen indiquant si le traitement doit être asynchrone (facultatif, par défaut: false)
- `content_id`: ID du contenu dans la base de données (obligatoire si async_process=true)

**Réponse (mode synchrone)**
```json
{
  "transcript": "Texte de la transcription...",
  "source": "youtube_transcript_api"
}
```

**Réponse (mode asynchrone)**
```json
{
  "task_id": "a1b2c3d4e5f6",
  "status": "processing",
  "message": "La transcription a été lancée en arrière-plan",
  "check_endpoint": "/api/helpers/transcript-status/a1b2c3d4e5f6"
}
```

**Notes:**
1. En mode synchrone, la réponse est immédiate mais peut être plus lente pour les longues vidéos
2. En mode asynchrone, la transcription est traitée en arrière-plan, et il faut vérifier l'état avec l'endpoint `/helpers/transcript-status/{task_id}`
3. Le mode asynchrone nécessite maintenant un `content_id` valide, qui fait référence à un contenu existant dans la base de données
4. **Important**: Les tâches Celery internes (`transcribe_youtube_video`) sont maintenant appelées avec `content_id` comme argument principal pour récupérer l'URL et mettre à jour le bon objet `Content`.

# ... (Reste du fichier inchangé) ... 