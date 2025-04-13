# Documentation: OnboardingPage.js

## Vue d'ensemble
`OnboardingPage.js` est un composant de flux d'intégration (onboarding) qui guide les nouveaux utilisateurs à travers le processus de configuration de leur premier assistant IA via fine-tuning. Ce composant est essentiel pour l'expérience utilisateur initiale et comprend plusieurs étapes progressives.

## Structure du composant

### Étapes de l'onboarding
```javascript
// Lignes ~70-75
const steps = [
  'Définir votre assistant',
  'Importer du contenu',
  'Fine-tuner un modèle',
  'Terminé'
];
```

### États et hooks principaux
- `activeStep`: Gère la progression à travers les étapes (ligne ~93)
- `useAuth()`: Fournit les données utilisateur et fonctions de mise à jour (ligne ~94)
- `useSnackbar()`: Gère les notifications système (ligne ~95)
- De nombreux états pour gérer les différentes phases de l'onboarding:
  - `projectName`, `createdProject`: Données du projet (lignes ~103-107)
  - `systemContent`, `assistantPurpose`: Définition de l'assistant (lignes ~96-100)
  - `uploadedFiles`, `uploadedUrls`: Contenu d'entraînement (lignes ~110-111)
  - `uploadedYouTube`, `uploadedWeb`: Sources de contenu supplémentaires (lignes ~132-133)
  - `datasetName`, `createdDataset`: Données du dataset (lignes ~119-123)
  - `provider`, `model`, `apiKey`: Configuration du fine-tuning (lignes ~126-129)

## Dépendances et services

### Importations principales
```javascript
// Lignes ~2-60
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
- Au chargement de la page, un projet est automatiquement créé via `projectService.create()` (lignes ~140-147)
- La méthode `createProject()` est appelée dans un `useEffect()` initial (lignes ~140-147)

### 2. Définition de l'assistant
- L'utilisateur saisit l'objectif de son assistant
- La méthode `generateSystemContent()` envoie cette description à l'API (lignes ~174-214)
- L'API génère un "system prompt" optimisé et détermine la catégorie de fine-tuning

### 3. Import de contenu
- Plusieurs méthodes d'import sont disponibles:
  - `FileUpload`: Upload direct de fichiers (PDF, DOC, TXT, etc.) (lignes ~1400-1430)
  - `handleAddYouTubeUrl()`: Ajout de vidéos YouTube pour transcription (lignes ~850-950)
  - `handleScrapeUrl()`: Extraction de contenu de sites web (lignes ~960-1010)
- Le système estime et/ou compte les caractères avec `estimateCharacterCount()` (lignes ~710-750) et `calculateActualCharacterCount()` (lignes ~760-820)
- Une barre de progression visuelle indique la qualité du dataset en fonction du cas d'utilisation (lignes ~1300-1370)

### 4. Fine-tuning du modèle
- Configuration du modèle et du fournisseur (lignes ~1550-1650)
- Ajout de la clé API via `saveApiKey()` (lignes ~215-240)
- Création du dataset avec `createDataset()` (lignes ~440-490)
- Lancement du fine-tuning avec `createFineTuning()` (lignes ~540-570)
- Vérification périodique du statut avec `checkDatasetStatus()` (lignes ~500-530)

### 5. Finalisation
- Mise à jour du statut utilisateur (`has_completed_onboarding: true`) (lignes ~580-610)
- Création d'une session de paiement avec les informations du dataset (lignes ~620-650)
- Redirection vers la page de paiement (lignes ~640-650)

## Calculs et logique métier

### Estimation des caractères
- Différentes méthodes selon le type de contenu:
  - Fichiers: Basé sur la taille ou les métadonnées (lignes ~720-730)
  - URLs: Comptage fixe ou contenu extrait (lignes ~730-740)
  - Vidéos YouTube: Estimation basée sur la durée (~150 caractères/minute) (lignes ~880-890)
  - Sites web: Comptage du contenu extrait (lignes ~970-980)

### Évaluation de la qualité
```javascript
// Lignes ~76-85
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
// Lignes ~86-90
// Prix par caractère
const PRICE_PER_CHARACTER = 0.000365;
// Quota gratuit (caractères gratuits)
const FREE_CHARACTER_QUOTA = 10000;

// Méthode de calcul (ligne ~695-700)
const getEstimatedCost = (characterCount) => {
  const billableCharacters = Math.max(0, characterCount - FREE_CHARACTER_QUOTA);
  return billableCharacters * PRICE_PER_CHARACTER;
};
```

## Gestion des animations et transitions
- Utilisation de `framer-motion` pour les animations entre étapes
- Définition de variantes d'animation pour un effet de glissement
```javascript
// Lignes ~62-72
const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }
};
```

## Gestion des erreurs
- Vérifications null/undefined pour `minCharactersRecommended` et autres valeurs (lignes ~1330-1370)
- Gestion des erreurs API avec feedback via `enqueueSnackbar` (présent tout au long du code)
- Utilisation de try/catch dans toutes les opérations asynchrones (ex: lignes ~175-213)

## Points d'attention pour la maintenance
1. Les vidéos YouTube nécessitent une transcription post-paiement (lignes ~850-950)
2. Le processus de création du dataset et fine-tuning peut continuer en arrière-plan (lignes ~590-620)
3. Plusieurs timers et intervalles sont utilisés pour vérifier les statuts (lignes ~500-530, ~760-820)
4. Les estimations de caractères varient selon les types de contenu (lignes ~710-750)

## Flux de navigation
- Progression linéaire à travers les étapes via `handleNext()` (lignes ~650-680) et `handleBack()` (lignes ~690-700)
- Certaines étapes requièrent des validations (ex: présence de contenu, clé API valide) (lignes ~650-680)
- Redirection finale vers la page de paiement après mise à jour du profil utilisateur (lignes ~640-650)

## Composants connexes
- `FileUpload`: Gestion de l'upload des fichiers (importé ligne ~58, utilisé lignes ~1400-1430)
- `PageTransition`: Animations entre pages (importé ligne ~57, utilisé lignes ~1725-1775)
- `UploadStatusCard`: Affichage du statut des uploads (importé ligne ~60)

## API et endpoints utilisés
- `/api/helpers/generate-system-content`: Génération du system prompt (lignes ~185-190)
- `/api/checkout/create-onboarding-session`: Création session de paiement (lignes ~620-635)
- Services divers: `projectService`, `contentService`, `datasetService`, etc. (importés lignes ~48-55)
- API externe: YouTube Media Downloader via RapidAPI (lignes ~860-875)

## Optimisations potentielles
- Rafraîchissement conditionnel des données (actuellement des timers fixes) (lignes ~760-820)
- Gestion plus granulaire des erreurs API
- Optimisation des estimations de caractères pour plus de précision 