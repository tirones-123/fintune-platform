# Documentation de l'API Backend - FinTune Platform

## Introduction

Cette documentation présente l'API RESTful du backend de FinTune Platform, une plateforme pour automatiser la création de datasets de fine-tuning pour les modèles de langage. L'API est développée avec FastAPI et permet de gérer les projets, contenus, datasets, fine-tunings et abonnements.

## Base URL

```
http://localhost:8000/api
# ou https://api.finetuner.io pour la production
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

**Corps de la requête (form-data)**
```
username=user@example.com
password=password123
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
  "company": "Updated Company",
  "has_completed_onboarding": true // Peut être mis à jour ici
}
```

**Réponse**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Updated",
  "is_active": true,
  "company": "Updated Company",
  "has_completed_onboarding": true,
  "created_at": "2023-03-10T12:00:00"
}
```

### Clés API

Les clés API sont nécessaires pour utiliser les services de fine-tuning des providers externes.

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

**Providers supportés**: `openai`, `anthropic`, `mistral`

**Note**: La clé API est requise avant de pouvoir lancer un fine-tuning avec le provider correspondant.

#### Vérifier une clé API

```
POST /users/verify-api-key
```

Vérifie la validité d'une clé API auprès du fournisseur.

**Corps de la requête**
```json
{
  "provider": "openai",
  "key": "sk_xxxxxxxxxxxxxxxx"
}
```

**Réponse**
```json
{
  "valid": true,
  "credits": 100, // Peut être null si non applicable
  "message": "Clé API valide"
}
```

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

**Réponse** (Exemple)
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
    "status": "completed",
    "content_metadata": {
        "original_name": "doc.pdf",
        "character_count": 15476,
        "is_exact_count": true,
        "page_count": 5
    },
    "created_at": "2023-03-10T12:00:00",
    "updated_at": "2023-03-10T12:00:00"
  }
]
```

**Notes sur `content_metadata`** :
- Ce champ JSON contient des informations supplémentaires sur le contenu.
- Pour les fichiers uploadés, il contiendra `original_name`.
- Après traitement par les tâches Celery, il devrait contenir `character_count` (le nombre de caractères extraits) et `is_exact_count: true`.
- Pour les PDF, il peut contenir `page_count`.
- Pour YouTube, il peut contenir `duration_seconds`, `transcription_source`, etc.

### Créer un contenu (URL)

```
POST /contents/url
```

Ajoute un contenu à partir d'une URL (ex: YouTube, page web).

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

**Note pour le type `website`**: Le frontend doit scraper le contenu et l'envoyer dans le champ `description`. Le backend devrait idéalement calculer la longueur de cette `description` et la stocker dans `content_metadata` (ex: `{"character_count": ..., "is_exact_count": true}`) pour persistance.
**Note pour le type `youtube`**: Le backend reçoit l'URL, obtient la durée pour une estimation initiale (via RapidAPI details), et crée l'enregistrement avec un statut comme `processing` ou `awaiting_transcription`. La transcription réelle est effectuée par une tâche Celery en arrière-plan.

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
  "status": "processing", // ou "completed" si type=website
  "content_metadata": {"original_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
  "created_at": "2023-03-10T12:00:00",
  "updated_at": "2023-03-10T12:00:00"
}
```

### Télécharger un fichier

```
POST /contents/upload
```

Télécharge un fichier (PDF, TXT, DOCX) et crée un nouveau contenu.

**Corps de la requête (multipart/form-data)**
- `file`: Le fichier à télécharger
- `project_id`: ID du projet
- `name`: Nom du contenu
- `description` (optionnel): Description du contenu
- `file_type`: Type de fichier (ex: `pdf`, `text`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`)

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
  "content_metadata": {"original_name": "document.pdf"},
  "created_at": "2023-03-10T12:00:00",
  "updated_at": "2023-03-10T12:00:00"
}
```

### Récupérer un contenu spécifique

```
GET /contents/{content_id}
```

Récupère les détails d'un contenu spécifique. L'API s'assure de retourner les données les plus fraîches.

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
  "status": "completed",
  "content_metadata": {
      "original_name": "doc.pdf",
      "character_count": 15476,
      "is_exact_count": true,
      "page_count": 5
  },
  "created_at": "2023-03-10T12:00:00",
  "updated_at": "2023-03-10T12:00:00"
}
```

### Mettre à jour un contenu

```
PUT /contents/{content_id}
```

Met à jour les champs principaux d'un contenu existant.

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
  "status": "completed",
  "content_metadata": {
      "original_name": "doc.pdf",
      "character_count": 15476,
      "is_exact_count": true,
      "page_count": 5
  },
  "created_at": "2023-03-10T12:00:00",
  "updated_at": "2023-03-10T13:00:00"
}
```

### Mettre à jour les métadonnées d'un contenu

```
PUT /contents/{content_id}/metadata
```

Met à jour le champ `content_metadata` d'un contenu. Utile pour les workers Celery.

**Corps de la requête**
```json
{
  "character_count": 16000,
  "is_exact_count": true
}
```

**Réponse** : L'objet `ContentResponse` mis à jour.

### Supprimer un contenu

```
DELETE /contents/{content_id}
```

Supprime un contenu existant et son fichier associé (si applicable).

**Réponse**
```
204 No Content
```

### Télécharger le fichier d'un contenu

```
GET /contents/{content_id}/download
```

Télécharge le fichier physique associé à un contenu (si celui-ci est basé sur un fichier).

**Paramètres URL**
- `content_id` (int): ID du contenu dont on veut télécharger le fichier.

**Réponse**
- `200 OK`: Renvoie le fichier (`FileResponse`). Le navigateur déclenche le téléchargement.
- `400 Bad Request`: Le contenu n'a pas de fichier associé (ex: type URL).
- `404 Not Found`: Contenu non trouvé, ou fichier physique non trouvé sur le serveur.

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
    "system_content": "You are a helpful assistant.",
    "created_at": "2023-03-10T12:00:00",
    "updated_at": "2023-03-10T12:30:00"
  }
]
```

### Créer un nouveau dataset

```
POST /datasets
```

Crée un nouveau dataset et lance la tâche de génération des paires Q/A.

**Corps de la requête**
```json
{
  "project_id": 1,
  "name": "Nouveau dataset",
  "description": "Description du nouveau dataset",
  "model": "gpt-3.5-turbo",
  "content_ids": [1, 2],
  "system_content": "Tu es un assistant spécialisé dans..."
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
  "status": "pending", // ou "processing" si la tâche démarre immédiatement
  "pairs_count": 0,
  "size": 0,
  "system_content": "Tu es un assistant spécialisé dans...",
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
  "system_content": "You are a helpful assistant.",
  "created_at": "2023-03-10T12:00:00",
  "updated_at": "2023-03-10T12:30:00"
}
```

### Récupérer un dataset avec ses paires

```
GET /datasets/{dataset_id}/pairs
```

Récupère un dataset avec ses paires question-réponse.

**Réponse** (`DatasetWithPairs`)
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
  "system_content": "You are a helpful assistant.",
  "created_at": "2023-03-10T12:00:00",
  "updated_at": "2023-03-10T12:30:00",
  "pairs": [
    {
      "id": 1,
      "dataset_id": 1,
      "question": "Comment ça va?",
      "answer": "Je vais bien, merci de demander!",
      "pair_metadata": {"source": "content_1", "chunk_id": 3},
      "created_at": "2023-03-10T12:20:00"
    },
    {
      "id": 2,
      "dataset_id": 1,
      "question": "Quel est votre produit?",
      "answer": "Notre produit est une plateforme de fine-tuning pour modèles de langage.",
      "pair_metadata": {"source": "content_1", "chunk_id": 5},
      "created_at": "2023-03-10T12:20:00"
    }
  ]
}
```

### Mettre à jour un dataset

```
PUT /datasets/{dataset_id}
```

Met à jour les champs principaux d'un dataset existant.

**Corps de la requête**
```json
{
  "name": "Dataset renommé",
  "description": "Description mise à jour"
}
```

**Réponse** (`DatasetResponse`)

### Mettre à jour le System Content d'un dataset

```
PUT /datasets/{dataset_id}/system-content
```

Met à jour uniquement le `system_content` d'un dataset.

**Corps de la requête**
```json
{
  "system_content": "Nouveau prompt système..."
}
```

**Réponse** (`DatasetResponse`)

### Supprimer un dataset

```
DELETE /datasets/{dataset_id}
```

Supprime un dataset existant et ses paires associées.

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
  "pair_metadata": {"source": "manual"}
}
```

**Réponse** (`DatasetPairResponse`)

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
      "pair_metadata": {"source": "manual"}
    },
    {
      "question": "Comment fonctionne le fine-tuning?",
      "answer": "Le fine-tuning fonctionne en réentraînant un modèle pré-entraîné sur un dataset spécifique à votre cas d'usage.",
      "pair_metadata": {"source": "manual"}
    }
  ]
}
```

**Réponse** (`DatasetResponse` mis à jour avec le nouveau `pairs_count`)

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
    "external_id": "ftjob-...",
    "fine_tuned_model": null, // Sera rempli quand terminé
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

- `fine_tuned_model`: ID du modèle final retourné par le provider (ex: `ft:gpt-3.5-turbo:...`)
- `progress`: Pourcentage de progression du fine-tuning (0-100)
- `external_id`: Identifiant du job chez le provider (OpenAI, Anthropic, Mistral)
- `metrics`: Statistiques d'entraînement retournées par le provider
- `completed_at`: Date de fin du fine-tuning (uniquement pour les statuts "completed", "cancelled" ou "error")

**Statuts possibles:**
- `pending`: Créé, mais pas encore lancé (en attente de génération du dataset ou de paiement)
- `queued`: Prêt à être lancé ou en attente chez le provider
- `preparing`: Traitement des données chez le provider
- `training`: L'entraînement est en cours
- `completed`: L'entraînement est terminé avec succès
- `cancelled`: L'entraînement a été annulé par l'utilisateur ou le système
- `error`: Une erreur s'est produite

### Créer un nouveau fine-tuning

```
POST /fine-tunings
```

Crée un nouveau job de fine-tuning à partir d'un dataset existant.
**Note**: Préférer l'endpoint `/fine-tuning-jobs` pour un workflow complet.

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
  "fine_tuned_model": null,
  "error_message": null,
  "created_at": "2023-03-10T13:00:00",
  "updated_at": "2023-03-10T13:00:00"
}
```

### Récupérer un fine-tuning spécifique

```
GET /fine-tunings/{fine_tuning_id}
```

Récupère les détails d'un fine-tuning spécifique.

**Réponse** (`FineTuningResponse`)

### Mettre à jour un fine-tuning

```
PUT /fine-tunings/{fine_tuning_id}
```

Met à jour les champs modifiables (name, description) d'un fine-tuning.

**Corps de la requête**
```json
{
  "name": "Fine-tuning renommé",
  "description": "Description mise à jour"
}
```

**Réponse** (`FineTuningResponse`)

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

Annule un job de fine-tuning en cours (si le provider le supporte).

**Corps de la requête**
```json
{
  "reason": "Coût trop élevé"
}
```

**Réponse** (`FineTuningResponse` avec statut `cancelled`)

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
  "content_ids": [12, 15],
  "dataset_name": "Mon Dataset Onboarding",
  "system_content": "Tu es un assistant utile.",
  "provider": "openai",
  "model": "gpt-3.5-turbo"
}
```

**Logique de traitement**
- Déduit correctement le quota gratuit (jusqu'à 10 000 caractères, une seule fois) et crée une transaction négative pour l'utilisation gratuite.
- Calcule le coût si > 10k caractères.
- Si coût > seuil Stripe, crée une session de paiement.
- Si gratuit ou coût < seuil, lance directement les transcriptions/création dataset/fine-tuning.

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
    - Récupère les informations nécessaires depuis les `metadata`.
    - Marque l'utilisateur comme ayant reçu les crédits gratuits (si applicable).
    - **Met à jour `user.has_completed_onboarding = True` si `payment_type` est `"onboarding_characters"`.**
    - Crée les entrées `Dataset` et `FineTuning` dans la base de données.
    - Lance les tâches Celery nécessaires (transcription, génération de dataset).
- Si `payment_type` est `"character_credits"`, ajoute les crédits achetés à l'utilisateur.
- **IMPORTANT**: Le webhook doit toujours retourner un statut `200 OK` à Stripe.

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
2. **Préparation des contenus**
3. **Lancement du Fine-tuning Job** via `POST /fine-tuning-jobs` (gère coût/paiement/lancement tâches)
4. **Suivi du Progrès** via `GET /fine-tunings/{fine_tuning_id}`
5. **Test du modèle** via `POST /fine-tunings/{fine_tuning_id}/test`

## Endpoint : Création de Fine-Tuning Job

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

## Endpoint : Tester un Modèle Fine-tuné

```
POST /fine-tunings/{fine_tuning_id}/test
```

Permet d'envoyer un prompt à un modèle fine-tuné spécifique (qui doit avoir le statut "completed" et un `fine_tuned_model` ID) et d'obtenir sa réponse.

**Paramètres URL**
- `fine_tuning_id` (int): ID du fine-tuning à tester

**Corps de la requête**
```json
{
  "prompt": "Quelle est la procédure pour... ?"
}
```

**Logique interne**
- L'endpoint récupère les détails du `FineTuning`.
- Il vérifie que le statut est `completed` et que `fine_tuned_model` existe.
- Il récupère le `system_content` associé au `Dataset` lié.
- Il récupère la clé API de l'utilisateur pour le `provider` concerné.
- Il appelle la méthode `generate_completion` du provider en lui passant :
  - `model=fine_tuning.fine_tuned_model` (l'ID du modèle FT)
  - `prompt=request_data.prompt`
  - `system_prompt=dataset.system_content`

**Réponse**
```json
{
  "response": "La procédure est la suivante : ... (réponse du modèle fine-tuné)"
}
```

**Codes d'erreur possibles**
- `404 Not Found`: Fine-tuning non trouvé ou non autorisé
- `400 Bad Request`: Modèle non complété, ID `fine_tuned_model` manquant, ou erreur lors de l'appel à l'API du fournisseur

## Endpoints Helpers

### Générer System Content

```
POST /helpers/generate-system-content
```

Génère un system prompt optimisé basé sur l'objectif de l'assistant.

**Corps de la requête**
```json
{
  "purpose": "Un assistant expert en droit du travail..."
}
```

**Réponse**
```json
{
  "system_content": "You are a helpful assistant specialized in labor law...",
  "fine_tuning_category": "Professional Expertise",
  "min_characters_recommended": 50000
}
```

### Générer Complétion

```
POST /helpers/generate-completion
```

Génère une réponse à partir d'un modèle (standard ou fine-tuné) et d'un prompt.
Utilisé par le Playground.

**Corps de la requête**
```json
{
  "model_id": "ft:gpt-3.5-turbo:...", // ID du modèle OpenAI
  "prompt": "Quel est le processus?",
  "system_message": "Tu es un assistant..."
}
```

**Réponse**
```json
{
  "response": "Le processus est le suivant..."
}
```

### Scraper une URL Web

```
POST /helpers/scrape-web
```

Extrait le contenu textuel principal d'une page web.

**Corps de la requête**
```json
{
  "url": "https://example.com/article"
}
```

**Réponse**
```json
{
  "title": "Titre de l'article",
  "paragraphs": [
    "Paragraphe 1...",
    "Paragraphe 2..."
  ]
}
```

### Transcription de vidéos YouTube

```
POST /helpers/video-transcript
```

Extrait la transcription d'une vidéo YouTube.
**Note**: Le traitement asynchrone est préférable et géré via les tâches Celery internes.

**Corps de la requête**
```json
{
  "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Réponse (synchrone)**
```json
{
  "transcript": "Texte de la transcription...",
  "source": "youtube_transcript_api" // ou autre source
}
```

## Notifications

### Récupérer les notifications

```
GET /notifications
```

Récupère les notifications pour l'utilisateur courant.

**Paramètres de requête**
- `skip` (integer, optional): number of items to skip, default 0
- `limit` (integer, optional): maximum items to return, default 20
- `unread_only` (boolean, optional): if true, only return unread notifications

**Réponse**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "message": "Fine-tuning 'Mon Job' terminé avec succès.",
    "type": "success",
    "is_read": false,
    "created_at": "2023-03-11T10:00:00",
    "related_id": 5,
    "related_type": "fine_tuning"
  }
]
```

### Marquer comme lues

```
PUT /notifications/{notification_id}/read
```

Marque une notification spécifique comme lue.

**Paramètres URL**
- `notification_id` (int): ID de la notification à marquer.

**Réponse**
- `200 OK`: Notification mise à jour (`NotificationResponse`).
- `404 Not Found`: Notification non trouvée pour cet utilisateur.

```json
{
  "message": "Notifications marked as read"
}
```

### Marquer tout comme lu

```
PUT /notifications/read-all
```

Marque toutes les notifications de l'utilisateur comme lues.

**Réponse**
- `204 No Content`: Succès.
```json
{
  "message": "All notifications marked as read"
}
```

**Note:** Clicking the notifications icon on the frontend now automatically calls this endpoint to mark all notifications as read when opening the popover.
