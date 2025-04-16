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
- **Nouveauté**: Utilisation de refs React pour le suivi fiable des données:
  - `youtubeVideosRef`: Référence pour les vidéos YouTube (synchronisation immédiate)
  - `webSitesRef`: Référence pour les sites web scrapés
  - `totalCharCountRef`: Référence pour le compteur total de caractères

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
  - `FileUpload`: Upload direct de fichiers (PDF, DOC, TXT, etc.)
  - `handleAddYouTubeUrl()`: Ajout de vidéos YouTube. La transcription réelle se fait **en arrière-plan après cette étape** (gratuit) ou **après le paiement** (payant), initiée par le backend.
  - `handleScrapeUrl()`: Extraction de contenu de sites web.
- **Amélioration**: Synchronisation robuste du comptage des caractères avec `forceSyncCharacterCount`.
- Le système estime (`estimateCharacterCount()`) et/ou compte les caractères (`calculateActualCharacterCount()`).
- Une barre de progression visuelle indique la qualité du dataset.

### 4. Fine-tuning du modèle
- Configuration du modèle et du fournisseur.
- Ajout et **validation** de la clé API via `saveApiKey()`. Le popover d\'aide (?) a été mis à jour avec des informations détaillées.
- La création du dataset et le lancement du fine-tuning sont maintenant gérés **à l\'étape de finalisation** par l\'endpoint `/api/checkout/create-onboarding-session`.

### 5. Finalisation
- Appel à l\'endpoint `/api/checkout/create-onboarding-session` avec les détails (compte de caractères, ID des contenus YouTube, config du modèle, etc.).
- **Logique Côté Backend**:
  - Vérifie si l\'utilisateur est éligible aux **crédits gratuits (10 000 caractères, une seule fois)** en regardant le compte et le flag `user.has_received_free_credits`.
  - **Si gratuit (première fois)**: Le backend ajoute les crédits, marque le flag utilisateur, lance les transcriptions YouTube, crée le `Dataset` et le `FineTuning` en attente, et lance la tâche de génération du dataset. L\'API retourne `{ \"status\": \"success\", \"free_processing\": true, \"redirect_url\": \"...dashboard?onboarding_completed=true\" }`.
  - **Si gratuit (déjà reçu ou montant faible)**: Le backend lance les transcriptions, crée le `Dataset`/`FineTuning` et la tâche de génération, mais n\'ajoute pas de crédits. L\'API retourne `{ \"status\": \"success\", \"free_processing\": false, \"redirect_url\": \"...dashboard?onboarding_completed=true\" }`.
  - **Si paiement requis**: L\'API retourne `{ \"checkout_url\": \"...\" }`. Après paiement réussi, le **webhook Stripe** côté backend déclenche la création du `Dataset`/`FineTuning` et le lancement des tâches.
- **Côté Frontend**:
  - Si une `checkout_url` est reçue, redirige vers Stripe.
  - Si une `redirect_url` est reçue, redirige vers le Dashboard (avec `?onboarding_completed=true`).
- Une fois redirigé vers le Dashboard avec `?onboarding_completed=true`, une **modale de bienvenue** s\'affiche une seule fois pour expliquer la suite.
- La mise à jour du statut utilisateur (`has_completed_onboarding: true`) est maintenant gérée par le backend (implicitement après le premier job lancé ou explicitement si nécessaire).

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
// Montant minimum pour Stripe en EUR (équivalent à environ 0,50€)
const MIN_STRIPE_AMOUNT_EUR = 0.50;

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
- **Amélioration**: Affichage des erreurs sous le bouton "Terminer" pour une meilleure visibilité
- **Amélioration**: Messages d'erreur spécifiques pour les problèmes courants (ex: montant Stripe trop faible)

## Points d'attention pour la maintenance
1. La transcription YouTube est lancée par le backend (onboarding gratuit) ou le webhook (onboarding payant).
2. Le processus de création dataset/fine-tuning est lancé par le backend (gratuit) ou le webhook (payant).
3. Les estimations de caractères pour YouTube sont utilisées avant la redirection Stripe, le compte réel après transcription.
4. L\'utilisation de `forceSyncCharacterCount` est essentielle pour la fiabilité du compteur.

## Flux de navigation
- Progression linéaire.
- Validation de la clé API à l\'étape 3.
- L\'étape 4 (Finalisation) appelle l\'API et gère la redirection soit vers Stripe, soit vers le Dashboard (`/dashboard?onboarding_completed=true`).

## Composants connexes
- `FileUpload`: Gestion de l'upload des fichiers (importé ligne ~58, utilisé lignes ~1400-1430)
- `PageTransition`: Animations entre pages (importé ligne ~57, utilisé lignes ~1725-1775)
- `UploadStatusCard`: Affichage du statut des uploads (importé ligne ~60)

## API et endpoints utilisés
- `/api/helpers/generate-system-content`: Génération du system prompt (lignes ~185-190)
- `/api/checkout/create-onboarding-session`: Création session de paiement ou traitement gratuit (lignes ~620-635)
- Services divers: `projectService`, `contentService`, `datasetService`, etc. (importés lignes ~48-55)
- API externe: YouTube Media Downloader via RapidAPI (lignes ~860-875)

## Optimisations potentielles
- Rafraîchissement conditionnel des données (actuellement des timers fixes) (lignes ~760-820)
- Gestion plus granulaire des erreurs API
- Optimisation des estimations de caractères pour plus de précision 
- Support de fallback amélioré en cas d'échec de l'API RapidAPI
- Amélioration de l'interface utilisateur pour les caractères en dessous du seuil de facturation 