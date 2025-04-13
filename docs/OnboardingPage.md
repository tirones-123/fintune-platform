# Documentation: OnboardingPage.js

## Vue d'ensemble
`OnboardingPage.js` est un composant de flux d'intégration (onboarding) qui guide les nouveaux utilisateurs à travers le processus de configuration de leur premier assistant IA via fine-tuning. Ce composant est essentiel pour l'expérience utilisateur initiale et comprend plusieurs étapes progressives.

## Structure du composant

### Étapes de l'onboarding
```javascript
const steps = [
  'Définir votre assistant',
  'Importer du contenu',
  'Fine-tuner un modèle',
  'Terminé'
];
```

### États et hooks principaux
- `activeStep`: Gère la progression à travers les étapes
- `useAuth()`: Fournit les données utilisateur et fonctions de mise à jour
- `useSnackbar()`: Gère les notifications système
- De nombreux états pour gérer les différentes phases de l'onboarding:
  - `projectName`, `createdProject`: Données du projet
  - `systemContent`, `assistantPurpose`: Définition de l'assistant
  - `uploadedFiles`, `uploadedUrls`: Contenu d'entraînement
  - `uploadedYouTube`, `uploadedWeb`: Sources de contenu supplémentaires
  - `datasetName`, `createdDataset`: Données du dataset
  - `provider`, `model`, `apiKey`: Configuration du fine-tuning

## Dépendances et services

### Importations principales
```javascript
// Composants UI
import { Box, Button, Container, Stepper, ... } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Services API
import { 
  subscriptionService, projectService, contentService, 
  datasetService, fineTuningService, apiKeyService,
  videoService, api, scrapingService
} from '../services/apiService';

// Autres composants
import FileUpload from '../components/common/FileUpload';
import PageTransition from '../components/common/PageTransition';
```

## Flux de données et fonctionnalités

### 1. Création automatique du projet
- Au chargement de la page, un projet est automatiquement créé via `projectService.create()`
- La méthode `createProject()` est appelée dans un `useEffect()` initial

### 2. Définition de l'assistant
- L'utilisateur saisit l'objectif de son assistant
- La méthode `generateSystemContent()` envoie cette description à l'API
- L'API génère un "system prompt" optimisé et détermine la catégorie de fine-tuning

### 3. Import de contenu
- Plusieurs méthodes d'import sont disponibles:
  - `FileUpload`: Upload direct de fichiers (PDF, DOC, TXT, etc.)
  - `handleAddYouTubeUrl()`: Ajout de vidéos YouTube pour transcription
  - `handleScrapeUrl()`: Extraction de contenu de sites web
- Le système estime et/ou compte les caractères avec `estimateCharacterCount()` et `calculateActualCharacterCount()`
- Une barre de progression visuelle indique la qualité du dataset en fonction du cas d'utilisation

### 4. Fine-tuning du modèle
- Configuration du modèle et du fournisseur
- Ajout de la clé API via `saveApiKey()`
- Création du dataset avec `createDataset()`
- Lancement du fine-tuning avec `createFineTuning()`
- Vérification périodique du statut avec `checkDatasetStatus()`

### 5. Finalisation
- Mise à jour du statut utilisateur (`has_completed_onboarding: true`)
- Création d'une session de paiement avec les informations du dataset
- Redirection vers la page de paiement

## Calculs et logique métier

### Estimation des caractères
- Différentes méthodes selon le type de contenu:
  - Fichiers: Basé sur la taille ou les métadonnées
  - URLs: Comptage fixe ou contenu extrait
  - Vidéos YouTube: Estimation basée sur la durée (~150 caractères/minute)
  - Sites web: Comptage du contenu extrait

### Évaluation de la qualité
```javascript
// Intervalles de référence par type d'usage (min, optimal, max)
const USAGE_THRESHOLDS = {
  legal: { min: 5000, optimal: 30000, max: 100000 },
  customer_service: { min: 5000, optimal: 50000, max: 200000 },
  knowledge_base: { min: 10000, optimal: 100000, max: 500000 },
  education: { min: 8000, optimal: 80000, max: 300000 },
  other: { min: 5000, optimal: 30000, max: 100000 }
};
```

### Calcul des coûts
```javascript
// Prix par caractère
const PRICE_PER_CHARACTER = 0.000365;
// Quota gratuit (caractères gratuits)
const FREE_CHARACTER_QUOTA = 10000;

// Méthode de calcul
const getEstimatedCost = (characterCount) => {
  const billableCharacters = Math.max(0, characterCount - FREE_CHARACTER_QUOTA);
  return billableCharacters * PRICE_PER_CHARACTER;
};
```

## Gestion des animations et transitions
- Utilisation de `framer-motion` pour les animations entre étapes
- Définition de variantes d'animation pour un effet de glissement
```javascript
const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }
};
```

## Gestion des erreurs
- Vérifications null/undefined pour `minCharactersRecommended` et autres valeurs
- Gestion des erreurs API avec feedback via `enqueueSnackbar`
- Utilisation de try/catch dans toutes les opérations asynchrones

## Points d'attention pour la maintenance
1. Les vidéos YouTube nécessitent une transcription post-paiement
2. Le processus de création du dataset et fine-tuning peut continuer en arrière-plan
3. Plusieurs timers et intervalles sont utilisés pour vérifier les statuts
4. Les estimations de caractères varient selon les types de contenu

## Flux de navigation
- Progression linéaire à travers les étapes via `handleNext()` et `handleBack()`
- Certaines étapes requièrent des validations (ex: présence de contenu, clé API valide)
- Redirection finale vers la page de paiement après mise à jour du profil utilisateur

## Composants connexes
- `FileUpload`: Gestion de l'upload des fichiers
- `PageTransition`: Animations entre pages
- `UploadStatusCard`: Affichage du statut des uploads

## API et endpoints utilisés
- `/api/helpers/generate-system-content`: Génération du system prompt
- `/api/checkout/create-onboarding-session`: Création session de paiement
- Services divers: `projectService`, `contentService`, `datasetService`, etc.
- API externe: YouTube Media Downloader via RapidAPI

## Optimisations potentielles
- Rafraîchissement conditionnel des données (actuellement des timers fixes)
- Gestion plus granulaire des erreurs API
- Optimisation des estimations de caractères pour plus de précision 