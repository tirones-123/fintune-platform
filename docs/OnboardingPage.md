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
- `activeStep`: Gère la progression à travers les étapes.
- `useAuth()`: Fournit les données utilisateur et fonctions de mise à jour.
- `useSnackbar()`: Gère les notifications système.
- De nombreux états pour gérer les différentes phases de l'onboarding:
  - `assistantPurpose`, `systemContent`, `fineTuningCategory`, `minCharactersRecommended`: Définition de l'assistant.
  - `projectName`, `createdProject`: Données du projet (créé automatiquement).
  - `uploadedFiles`, `uploadedUrls`: Contenu d'entraînement (fichiers, URLs).
  - `uploadedYouTube`, `youtubeUrl`, `youtubeUploading`, `youtubeUploadError`: Contenu YouTube.
  - `uploadedWeb`, `scrapeUrl`, `scrapeLoading`, `scrapeError`: Contenu Web scrapé.
  - `datasetName`, `createdDataset`: Données du dataset (utilisé dans la logique de finalisation).
  - `provider`, `model`, `apiKey`, `apiKeySaved`, `apiKeyError`, `apiHelpOpen`: Configuration du fine-tuning et de la clé API.
  - `actualCharacterCount`, `isEstimated`: Suivi du nombre de caractères (réel ou estimé).
  - `useCase`: Détermine les seuils de qualité.
  - `isCompleting`, `completionError`: État de la finalisation.
- **Amélioration**: Utilisation de refs React pour le suivi fiable des données:
  - `youtubeVideosRef`: Référence pour les vidéos YouTube (synchronisation immédiate).
  - `webSitesRef`: Référence pour les sites web scrapés.
  - `totalCharCountRef`: Référence pour le compteur total de caractères (synchronisé avec `actualCharacterCount`).

## Dépendances et services

### Importations principales
```javascript
// Composants UI (MUI, framer-motion, react-hot-toast)
import { Box, Button, Container, Stepper, ... } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Dialog from '@mui/material/Dialog'; // Pour la popup d'aide API

// Services API (via apiService.js)
import { 
  subscriptionService, projectService, contentService, 
  datasetService, fineTuningService, apiKeyService,
  videoService, api, scrapingService, 
  checkoutService, userService // Ajout de checkoutService et userService
} from '../services/apiService';

// Autres composants
import FileUpload from '../components/common/FileUpload';
import PageTransition from '../components/common/PageTransition';
import UploadStatusCard from '../components/content/UploadStatusCard';

// Autres librairies
import axios from 'axios'; // Pour l'appel à RapidAPI
```

## Flux de données et fonctionnalités

### 1. Création automatique du projet
- Au chargement de la page, un projet est automatiquement créé via `projectService.create()` dans un `useEffect()` initial.
- Le nom par défaut est "Mon premier projet".

### 2. Définition de l'assistant
- L'utilisateur saisit l'objectif de son assistant (`assistantPurpose`).
- La méthode `generateSystemContent()` envoie cette description à l'endpoint `/api/helpers/generate-system-content`.
- L'API génère un "system prompt" optimisé (`systemContent`), détermine la catégorie de fine-tuning (`fineTuningCategory`), et recommande un nombre minimum de caractères (`minCharactersRecommended`). Le `useCase` est également défini pour l'évaluation de la qualité.

### 3. Import de contenu
- Plusieurs méthodes d'import sont disponibles:
  - `FileUpload`: Upload direct de fichiers (PDF, DOC, TXT, etc.). Gère l'ajout et la suppression via `onSuccess` callback.
  - `handleAddYouTubeUrl()`: Ajoute une vidéo YouTube.
    - Extrait l'ID de la vidéo.
    - **Appelle l'API externe RapidAPI (youtube-media-downloader) pour obtenir le titre et la durée.**
    - Calcule une **estimation** de caractères basée sur la durée (environ 400 caractères/minute).
    - Appelle `contentService.addUrl()` pour enregistrer l'URL côté backend avec le type 'youtube'.
    - La transcription réelle se fait **en arrière-plan après cette étape** (gratuit) ou **après le paiement** (payant), initiée par le backend. L'état initial est `awaiting_transcription`.
    - Utilise `youtubeVideosRef` pour un suivi fiable.
  - `handleScrapeUrl()`: Extrait le contenu d'un site web.
    - Appelle `scrapingService.scrapeWeb()` pour obtenir le texte et le titre.
    - Appelle `contentService.addUrl()` pour enregistrer l'URL et le contenu scrapé côté backend avec le type 'website'.
    - Utilise `webSitesRef` pour un suivi fiable.
- **Suppression**:
  - Les fichiers peuvent être supprimés via le composant `FileUpload`.
  - Les vidéos YouTube sont supprimées via `handleDeleteYouTube()`, qui appelle `contentService.delete()`.
  - Les sites web sont supprimés via `handleDeleteWeb()`, qui appelle `contentService.delete()`.
- **Comptage des caractères**:
  - `calculateActualCharacterCount()` calcule le total en utilisant `character_count` des métadonnées si disponibles, sinon utilise les estimations (pour YouTube) ou un fallback. Met à jour `actualCharacterCount` et `totalCharCountRef`.
  - `estimateCharacterCount()` fournit une estimation globale basée sur les métadonnées disponibles et des estimations pour les contenus sans compte exact.
  - Un `useEffect` interroge `contentService.getById()` pour mettre à jour le statut et les métadonnées des contenus en cours de traitement.
- **Barre de progression**:
  - `calculateProgressValue()` détermine la progression (0-100) sur une échelle à plusieurs paliers (0, 10k gratuits, min recommandé, optimal=4x min).
  - L'interface utilisateur affiche la progression, le nombre de caractères (estimé ou compté), et le coût estimé.

### 4. Fine-tuning du modèle
- **Configuration**: Sélection du fournisseur (`provider` : openai, anthropic) et du modèle (`model`).
- **Clé API**:
  - L'utilisateur saisit sa clé API (`apiKey`).
  - `saveApiKey()` est appelée pour valider la clé:
    - Appel à l'endpoint `/api/users/verify-api-key` pour vérifier la validité de la clé et les crédits disponibles chez le fournisseur.
    - Si valide et crédits suffisants, appel à `apiKeyService.addKey()` pour sauvegarder la clé (chiffrée côté backend).
  - Une **popup d'aide (`Dialog`)** explique comment obtenir une clé API.
- La création du dataset et le lancement du fine-tuning sont gérés **à l'étape de finalisation** par l'endpoint `/api/checkout/create-onboarding-session`. (Les fonctions `createDataset` et `createFineTuning` dans le code JS ne semblent pas être utilisées dans le flux principal final).

### 5. Finalisation
- Déclenchée par le bouton "Terminer" après la validation de la clé API.
- La fonction `completeOnboarding()` est appelée:
  - Mise à jour optionnelle du profil utilisateur via `userService.updateUserProfile()`.
  - Rassemblement des IDs de **tous** les contenus ajoutés (fichiers, URLs, YouTube via ref, Web via ref).
  - Appel à `checkoutService.createOnboardingSession()` (endpoint `/api/checkout/create-onboarding-session`) avec les détails:
    - `character_count`: Le nombre total de caractères (`actualCharacterCount`).
    - `content_ids`: La liste des IDs de tous les contenus.
    - `dataset_name`: Nom du dataset (par défaut).
    - `provider`, `model`: Configuration du modèle.
    - `system_content`: Le prompt système généré.
- **Logique Côté Backend (gérée par l'API `/api/checkout/create-onboarding-session`)**:
  - Vérifie l'éligibilité aux crédits gratuits (10 000 caractères, une seule fois) via `user.has_received_free_credits`.
  - **Si gratuit (première fois)**: Ajoute les crédits, marque le flag utilisateur, lance les transcriptions/scraping si nécessaire, crée `Dataset` et `FineTuning` (statut initial), lance la tâche de génération du dataset. Retourne `{ "status": "success", "free_processing": true, "redirect_url": "...dashboard?onboarding_completed=true" }`.
  - **Si gratuit (déjà reçu ou montant faible)**: Idem mais sans ajouter de crédits. Retourne `{ "status": "success", "free_processing": false, "redirect_url": "...dashboard?onboarding_completed=true" }`.
  - **Si paiement requis**: Crée une session Stripe. Retourne `{ "checkout_url": "..." }`. Après paiement réussi, le **webhook Stripe** côté backend déclenche la création `Dataset`/`FineTuning` et le lancement des tâches.
- **Côté Frontend (dans `completeOnboarding`)**:
  - Si une `checkout_url` (ou `payment_url`) est reçue, redirige vers Stripe.
  - Si une `redirect_url` est reçue, redirige vers le Dashboard (avec `?onboarding_completed=true`).
  - Si `free_processing: true` est reçu sans `redirect_url`, redirige vers le Dashboard (avec `?onboarding_completed=true`).
- Une fois redirigé vers le Dashboard avec `?onboarding_completed=true`, une **modale de bienvenue** s'affiche (logique gérée dans le Dashboard).
- La mise à jour du statut utilisateur (`has_completed_onboarding: true`) est gérée par le backend.

## Calculs et logique métier

### Estimation des caractères
- Différentes méthodes selon le type de contenu:
  - Fichiers: Utilise `content_metadata.character_count` si disponible, sinon estimation basée sur la taille (`size * 0.5`).
  - URLs: Utilise `content_metadata.character_count` si disponible, sinon fallback (~3000).
  - Vidéos YouTube: Estimation basée sur la durée obtenue via RapidAPI (environ **400** caractères/minute).
  - Sites web: Utilise `character_count` du contenu scrapé stocké dans la ref.
- L'état `isEstimated` indique si le compte affiché est basé uniquement sur des données exactes ou inclut des estimations.

### Évaluation de la qualité / Barre de progression
```javascript
// Intervalles de référence par type d'usage (min, optimal, max)
const USAGE_THRESHOLDS = {
  legal: { min: 5000, optimal: 30000, max: 100000 },
  // ... autres catégories
  other: { min: 5000, optimal: 30000, max: 100000 }
};

// Fonction de calcul de la progression pour la barre (0-100)
const calculateProgressValue = (currentCount, minRecommended) => {
  // Logique basée sur paliers: 0-10k (25%), 10k-min (25%), min-optimal(4x min) (50%)
};
```
- La barre de progression visuelle utilise `calculateProgressValue` et affiche des marqueurs pour 10k, min recommandé, et optimal.

### Calcul des coûts
```javascript
// Prix par caractère
const PRICE_PER_CHARACTER = 0.000365;
// Quota gratuit (caractères gratuits)
const FREE_CHARACTER_QUOTA = 10000;
// Montant minimum pour Stripe en EUR
const MIN_STRIPE_AMOUNT_EUR = 0.50;

// Méthode de calcul
const getEstimatedCost = (characterCount) => {
  const billableCharacters = Math.max(0, characterCount - FREE_CHARACTER_QUOTA);
  return billableCharacters * PRICE_PER_CHARACTER;
};
```
- Le coût affiché est basé sur `actualCharacterCount` si `isEstimated` est false, sinon sur `estimateCharacterCount()`.

## Gestion des animations et transitions
- Utilisation de `framer-motion` (`motion.div`, `AnimatePresence`) pour les animations entre étapes.
- Définition de variantes d'animation (`stepVariants`) pour un effet de glissement horizontal.

## Gestion des erreurs
- Vérifications pour les champs vides (ex: `assistantPurpose`).
- Gestion des erreurs API avec feedback via `enqueueSnackbar` et états dédiés (ex: `systemContentError`, `apiKeyError`, `completionError`).
- Utilisation de `try/catch` dans toutes les opérations asynchrones.
- Messages d'erreur spécifiques pour les problèmes courants (ex: clé API invalide, crédits insuffisants, URL invalide).
- Affichage des erreurs contextuelles (ex: sous les champs de saisie, sous le bouton "Terminer").

## Points d'attention pour la maintenance
1. La logique de création du dataset et du fine-tuning est centralisée dans l'endpoint backend `/api/checkout/create-onboarding-session` et déclenchée soit directement (gratuit) soit via webhook Stripe (payant).
2. La transcription YouTube et le scraping web (si applicable) sont lancés par le backend après l'appel initial ou via webhook.
3. Les estimations de caractères (surtout pour YouTube via RapidAPI) sont cruciales pour l'affichage avant la finalisation. Le compte réel est utilisé par le backend.
4. L'utilisation des `refs` (`youtubeVideosRef`, `webSitesRef`, `totalCharCountRef`) couplée aux états React (`uploadedYouTube`, `uploadedWeb`, `actualCharacterCount`) assure la robustesse du suivi des contenus et des caractères.

## Flux de navigation
- Progression linéaire via les boutons "Suivant" et "Retour".
- Validation de la clé API à l'étape 3 (`handleNext` appelle `saveApiKey`).
- L'étape 4 (Finalisation) est déclenchée par `handleNext` à l'étape 3, qui appelle `completeOnboarding`. Celui-ci gère la redirection soit vers Stripe, soit vers le Dashboard (`/dashboard?onboarding_completed=true`).

## Composants connexes
- `FileUpload`: Gestion de l'upload et de la suppression des fichiers.
- `PageTransition`: Animations entre pages.
- `UploadStatusCard`: (Importé mais semble peu utilisé directement, la logique d'affichage est dans `OnboardingPage`).
- `Dialog` (MUI): Utilisé pour la popup d'aide de la clé API.

## API et endpoints utilisés
- **Internes (via `apiService` ou `fetch`)**:
  - `/api/helpers/generate-system-content`: Génération du system prompt.
  - `/api/users/verify-api-key`: Validation de la clé API fournisseur.
  - `/api/checkout/create-onboarding-session`: Finalisation de l'onboarding (crédits, paiement, lancement jobs).
  - `projectService.create`: Création du projet initial.
  - `contentService.addUrl`, `contentService.delete`, `contentService.getById`: Gestion des contenus (URL, YouTube, Web).
  - `apiKeyService.addKey`: Sauvegarde de la clé API validée.
  - `scrapingService.scrapeWeb`: Scraping de contenu web.
  - `userService.updateUserProfile`: Mise à jour du profil utilisateur (nom, compagnie).
  - `videoService` (importé mais non utilisé directement dans ce fichier).
  - `datasetService`, `fineTuningService` (importés mais la création est déléguée au backend via checkout).
- **Externes**:
  - `youtube-media-downloader.p.rapidapi.com`: API RapidAPI pour obtenir les détails des vidéos YouTube (utilisée dans `handleAddYouTubeUrl` via `axios`).

## Optimisations potentielles
- Amélioration de la précision des estimations de caractères restantes.
- Gestion plus fine des états d'erreur et de chargement par contenu.
- Fallback plus robuste si l'API RapidAPI échoue.
- Interface utilisateur plus claire lorsque le coût est inférieur au minimum Stripe.
