import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  useTheme,
  Avatar,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  FormHelperText,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  AlertTitle,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FolderIcon from '@mui/icons-material/Folder';
import DatasetIcon from '@mui/icons-material/Dataset';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StarsIcon from '@mui/icons-material/Stars';
import YouTubeIcon from '@mui/icons-material/YouTube';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/common/PageTransition';
import {
  subscriptionService,
  projectService,
  contentService,
  datasetService,
  fineTuningService,
  apiKeyService,
  videoService,
  api,
  scrapingService,
  checkoutService,
  userService
} from '../services/apiService';
import { useSnackbar } from 'notistack';
import FileUpload from '../components/common/FileUpload';
import HelpIcon from '@mui/icons-material/Help';
import UploadStatusCard from '../components/content/UploadStatusCard';
import { toast } from 'react-hot-toast';
import axios from 'axios';
// Import pour la popup d'aide
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Link from '@mui/material/Link';
import { useTranslation, Trans } from 'react-i18next'; // Import useTranslation and Trans

// Variantes d'animation pour les étapes
const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    }
  }
};

// Étapes de l'onboarding - Already translated using t() in previous steps
// The function call needs to happen inside the component or where t is available
// const steps = [
//   t('onboarding.steps.define'),
//   t('onboarding.steps.import'),
//   t('onboarding.steps.finetune'),
//   t('onboarding.steps.completed')
// ];

// Prix par caractère
const PRICE_PER_CHARACTER = 0.000365;
// Quota gratuit (caractères gratuits)
const FREE_CHARACTER_QUOTA = 10000;
// Montant minimum pour Stripe en EUR (équivalent à environ 0,50€)
const MIN_STRIPE_AMOUNT_EUR = 0.50;

// Intervalles de référence par type d'usage (min, optimal, max)
const USAGE_THRESHOLDS = {
  legal: { min: 5000, optimal: 30000, max: 100000 },
  customer_service: { min: 5000, optimal: 50000, max: 200000 },
  knowledge_base: { min: 10000, optimal: 100000, max: 500000 },
  education: { min: 8000, optimal: 80000, max: 300000 },
  other: { min: 5000, optimal: 30000, max: 100000 }
};

// Descriptions des niveaux de qualité - Will be initialized inside component with t()
// const QUALITY_DESCRIPTIONS = {
//   insufficient: "Données insuffisantes: Le modèle aura du mal à générer des réponses cohérentes.",
//   minimal: "Qualité minimale: Réponses basiques avec contexte limité.",
//   good: "Bonne qualité: Réponses précises et bien contextualisées.",
//   optimal: "Qualité optimale: Réponses détaillées et très personnalisées.",
//   excessive: "Données au-delà de l'optimal: Les bénéfices supplémentaires peuvent diminuer."
// };

// Couleurs pour les niveaux de qualité
const QUALITY_COLORS = {
  insufficient: "#f44336", // Rouge
  minimal: "#ff9800",      // Orange
  good: "#4caf50",         // Vert
  optimal: "#2196f3",      // Bleu
  excessive: "#9e9e9e"     // Gris
};

const OnboardingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation(); // Initialize useTranslation

  // Initialize steps array here where t is available
  const steps = [
    t('onboarding.steps.define'),
    t('onboarding.steps.import'),
    t('onboarding.steps.finetune'),
    t('onboarding.steps.completed')
  ];

  // Initialize quality descriptions here
  const QUALITY_DESCRIPTIONS = {
    insufficient: t('onboarding.qualityDescription.insufficient'),
    minimal: t('onboarding.qualityDescription.minimal'),
    good: t('onboarding.qualityDescription.good'),
    optimal: t('onboarding.qualityDescription.optimal'),
    excessive: t('onboarding.qualityDescription.excessive')
  };

  const [activeStep, setActiveStep] = useState(0);

  // Ajouter des refs pour stocker les données réelles sans dépendre de l'état React
  const youtubeVideosRef = useRef([]);
  const webSitesRef = useRef([]);
  const totalCharCountRef = useRef(0);

  // État pour le system content
  const [assistantPurpose, setAssistantPurpose] = useState('');
  const [systemContent, setSystemContent] = useState('');
  const [generatingSystemContent, setGeneratingSystemContent] = useState(false);
  const [systemContentError, setSystemContentError] = useState(null);
  const [fineTuningCategory, setFineTuningCategory] = useState('');
  const [minCharactersRecommended, setMinCharactersRecommended] = useState(0);

  // Données du projet (créé automatiquement) - Initialize with t()
  const [projectName] = useState(t('onboarding.defaultProjectName'));
  const [projectDescription] = useState(t('onboarding.defaultProjectDescription'));
  const [createdProject, setCreatedProject] = useState(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectError, setProjectError] = useState(null);

  // Données du contenu
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newUrlName, setNewUrlName] = useState('');
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = React.useRef(null);

  // Ajout de l'état pour le comptage réel des caractères
  const [actualCharacterCount, setActualCharacterCount] = useState(0);
  const [isEstimated, setIsEstimated] = useState(true);

  // Données du dataset (créé automatiquement) - Initialize with t()
  const [datasetName, setDatasetName] = useState(t('onboarding.defaultDatasetName'));
  const [creatingDataset, setCreatingDataset] = useState(false);
  const [createdDataset, setCreatedDataset] = useState(null);
  const [datasetError, setDatasetError] = useState(null);
  const [datasetLoading, setDatasetLoading] = useState(false);
  const [datasetReady, setDatasetReady] = useState(false);

  // Données du fine-tuning
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-4o');
  const [creatingFineTuning, setCreatingFineTuning] = useState(false);
  const [createdFineTuning, setCreatedFineTuning] = useState(null);
  const [fineTuningError, setFineTuningError] = useState(null);

  // Modèles disponibles par fournisseur
  const providerModels = {
    openai: [
      { id: 'gpt-4o', name: 'GPT-4o (Modèle le plus performant et récent)', apiId: 'gpt-4o-2024-08-06' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Bon rapport qualité/prix)', apiId: 'gpt-4o-mini-2024-07-18' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Économique, bonne performance)', apiId: 'gpt-3.5-turbo-0125' },
      { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini (Version compacte de GPT-4.1)', apiId: 'gpt-4.1-mini-2025-04-14' },
      { id: 'gpt-4.1', name: 'GPT-4.1 (Haute performance, plus coûteux)', apiId: 'gpt-4.1-2025-04-14' },
    ],
    anthropic: [
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet (Coming soon)' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (Coming soon)' },
    ],
  };

  // Clé API pour le fine-tuning
  const [apiKey, setApiKey] = useState('');
  const [savingApiKey, setSavingApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(null);

  // Ajout d'un état pour gérer la soumission du formulaire de finalisation
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState(null);
  const [processingFineTuning, setProcessingFineTuning] = useState(false);

  // Définition du cas d'utilisation (useCase)
  const [useCase, setUseCase] = useState('other');

  // Nouveaux états pour les vidéos YouTube
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [uploadedYouTube, setUploadedYouTube] = useState([]);
  const [youtubeUploadError, setYoutubeUploadError] = useState(null);
  const [youtubeUploading, setYoutubeUploading] = useState(false);

  // Nouveaux états pour les sites web
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [uploadedWeb, setUploadedWeb] = useState([]);
  const [scrapeError, setScrapeError] = useState(null);
  const [scrapeLoading, setScrapeLoading] = useState(false);

  // Ajouter un état pour gérer la popup d'aide
  const [apiHelpOpen, setApiHelpOpen] = useState(false);

  // Créer automatiquement un projet au chargement de la page
  useEffect(() => {
    const createDefaultProject = async () => {
      if (!createdProject && !creatingProject) {
        await createProject();
      }
    };
    
    createDefaultProject();
  }, []);

  // Fonction pour créer un projet
  const createProject = async () => {
    setCreatingProject(true);
    setProjectError(null);
    
    try {
      const projectData = {
        name: projectName, // Already using translated state
        description: projectDescription // Already using translated state
      };
      
      // Appel API pour créer le projet
      const response = await projectService.create(projectData);
      
      setCreatedProject(response);
      return true;
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      const defaultError = t('onboarding.error.projectCreateFailedDefault');
      setProjectError(error.message || defaultError);
      enqueueSnackbar(t('onboarding.error.projectCreateFailed', { error: error.message || defaultError }), { variant: 'error' });
      return false;
    } finally {
      setCreatingProject(false);
    }
  };

  // Fonction pour générer le system content à partir de l'entrée utilisateur
  const generateSystemContent = async () => {
    if (!assistantPurpose.trim()) {
      setSystemContentError(t('systemPromptGenerator.error.purposeRequired'));
      return false;
    }
    
    setGeneratingSystemContent(true);
    setSystemContentError(null);
    
    try {
      // Ici nous allons faire une requête à l'API pour générer le system content
      // Cette API sera implémentée dans le backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/helpers/generate-system-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fintune_accessToken')}`
        },
        body: JSON.stringify({ purpose: assistantPurpose })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || t('onboarding.step0.error.generateGeneric')); // Translate fallback error
      }
      
      const data = await response.json();
      setSystemContent(data.system_content);
      setFineTuningCategory(data.fine_tuning_category);
      setMinCharactersRecommended(data.min_characters_recommended);
      
      // Mettre à jour le useCase en fonction de la catégorie (pour les seuils d'évaluation)
      let mappedUseCase = 'other';
      if (data.fine_tuning_category === 'Conversational Style (Character)') {
        mappedUseCase = 'customer_service';
      } else if (data.fine_tuning_category === 'Task-specific Assistant') {
        mappedUseCase = 'customer_service';
      } else if (data.fine_tuning_category === 'Professional Expertise (lawyer, doctor, etc.)') {
        mappedUseCase = 'legal';
      } else if (data.fine_tuning_category === 'Translation / Specialized Rewriting') {
        mappedUseCase = 'knowledge_base';
      } else if (data.fine_tuning_category === 'Enterprise Chatbot (Internal Knowledge)') {
        mappedUseCase = 'knowledge_base';
      }
      setUseCase(mappedUseCase);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la génération du system content:', error);
      const defaultError = t('onboarding.step0.error.generateGeneric');
      setSystemContentError(error.message || defaultError);
      enqueueSnackbar(t('onboarding.step0.error.generateFailed', { error: error.message || defaultError }), { variant: 'error' });
      return false;
    } finally {
      setGeneratingSystemContent(false);
    }
  };

  // Fonction pour supprimer un contenu
  const handleDeleteContent = async (content, type) => {
    try {
      await contentService.delete(content.id);
      
      if (type === 'file') {
        setUploadedFiles(prev => prev.filter(file => file.id !== content.id));
      } else {
        setUploadedUrls(prev => prev.filter(url => url.id !== content.id));
      }
      
      enqueueSnackbar(t('onboarding.snackbar.contentDeleteSuccess'), { variant: 'success' }); // Key was incorrect, corrected
    } catch (error) {
      console.error('Erreur lors de la suppression du contenu:', error);
      const defaultError = t('onboarding.snackbar.contentDeleteErrorDefault');
      enqueueSnackbar(t('onboarding.snackbar.contentDeleteError', { error: error.message || defaultError }), { variant: 'error' });
    }
  };

  // Fonction pour ajouter une clé API
  const saveApiKey = async () => {
    if (!apiKey) {
      setApiKeyError(t('configManager.error.apiKeyRequired'));
      return false;
    }
    
    setSavingApiKey(true);
    setApiKeyError(null);
    
    try {
      // Vérifier d'abord la validité de la clé
      const verificationResponse = await api.post('/api/users/verify-api-key', {
        provider,
        key: apiKey
      });
      
      const { valid, credits, message } = verificationResponse.data;
      
      if (!valid) {
        setApiKeyError(message || t('configManager.error.invalidApiKey'));
        return false;
      }
      
      if (credits === 0) {
        setApiKeyError(t('configManager.error.noCredits'));
        return false;
      }
      
      // Si tout est OK, sauvegarder la clé
      await apiKeyService.addKey(provider, apiKey);
      
      setApiKeySaved(true);
      return true;
    } catch (error) {
      console.error('Erreur lors de la validation de la clé API:', error);
      
      // Messages d'erreur spécifiques selon le type d'erreur
      if (error.response) {
        setApiKeyError(error.response.data?.detail || t('configManager.error.validationFailed'));
      } else {
        setApiKeyError(t('onboarding.step2.error.connectionError'));
      }
      
      const defaultError = t('configManager.error.validationFailed');
      enqueueSnackbar(t('onboarding.step2.snackbar.apiKeyValidationError', { error: error.message || defaultError }), { variant: 'error' });
      return false;
    } finally {
      setSavingApiKey(false);
    }
  };
  
  // Fonction pour créer un dataset
  const createDataset = async () => {
    if (!createdProject) {
      setDatasetError(t('onboarding.step2.error.projectNotCreated'));
      return false;
    }
    
    const allContents = [...uploadedFiles, ...uploadedUrls, ...uploadedYouTube, ...uploadedWeb];
    if (allContents.length === 0) {
      setDatasetError(t('newFineTuning.warnings.contentRequired'));
      return false;
    }
    
    setCreatingDataset(true);
    setDatasetError(null);
    
    try {
      const datasetData = {
        name: datasetName, // Already translated state
        project_id: createdProject.id,
        content_ids: allContents.map(content => content.id),
        model: 'gpt-3.5-turbo',
        description: t('onboarding.defaultDatasetDescription'),
        system_content: systemContent || t('common.defaultSystemPrompt')
      };
      
      // Appel API pour créer le dataset
      const response = await datasetService.create(datasetData);
      
      setCreatedDataset(response);
      return true;
      
      // Commencer à vérifier si le dataset est prêt
      setDatasetLoading(true);
      setTimeout(() => checkDatasetStatus(response.id), 2000);
      
    } catch (error) {
      console.error('Erreur lors de la création du dataset:', error);
      const defaultError = t('onboarding.step2.error.datasetCreationFailed');
      setDatasetError(error.message || defaultError);
      enqueueSnackbar(t('onboarding.step2.snackbar.datasetCreateError', { error: error.message || defaultError }), { variant: 'error' });
      return false;
    } finally {
      setCreatingDataset(false);
    }
  };
  
  // Fonction pour vérifier l'état du dataset
  const checkDatasetStatus = async (datasetId) => {
    if (!datasetId) {
      console.error("ID du dataset manquant");
      setDatasetLoading(false);
      return false;
    }

    try {
      const dataset = await datasetService.getById(datasetId);
      console.log(`Vérification du statut du dataset ${datasetId}: ${dataset.status}`);
      
      if (dataset.status === "ready") {
        setDatasetReady(true);
        setDatasetLoading(false);
        enqueueSnackbar(t('onboarding.step2.snackbar.datasetReady'), { variant: 'success' });

        // Lancer automatiquement le fine-tuning si le dataset est prêt et qu'aucun fine-tuning n'existe
        if (!createdFineTuning) {
          console.log("Dataset prêt, lancement automatique du fine-tuning...");
          try {
            await createFineTuning();
          } catch (error) {
            console.error("Erreur lors du lancement automatique du fine-tuning:", error);
          }
        }
        
        return true;
      } else if (dataset.status === "error") {
        setDatasetLoading(false);
        setDatasetError(t('onboarding.step2.error.datasetGenerationFailed', { error: dataset.error_message || t('common.unknownError') }));
        return false;
      } else {
        // Continuer la vérification si le dataset est toujours en traitement
        setTimeout(() => checkDatasetStatus(datasetId), 3000); // Vérifier toutes les 3 secondes
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du statut du dataset:", error);
      setDatasetLoading(false);
      return false;
    }
  };
  
  // Fonction pour créer un fine-tuning
  const createFineTuning = async () => {
    if (!createdDataset) {
      setFineTuningError(t('onboarding.step2.error.datasetNotCreated'));
      return false;
    }
    
    setCreatingFineTuning(true);
    setFineTuningError(null);
    
    try {
      // Trouver l'apiId correspondant au modèle sélectionné
      const selectedModel = providerModels[provider].find(m => m.id === model);
      const apiModelId = selectedModel?.apiId || model;
      
      const fineTuningData = {
        name: t('onboarding.defaultFineTuningName', { datasetName: datasetName }), // Use translation
        dataset_id: createdDataset.id,
        model: apiModelId,
        provider: provider,
        hyperparameters: {
          n_epochs: 3
        }
      };
      
      // Appel API pour créer le fine-tuning
      const response = await fineTuningService.create(fineTuningData);
      
      setCreatedFineTuning(response);
      return true;
    } catch (error) {
      console.error('Erreur lors de la création du fine-tuning:', error);
      const defaultError = t('newFineTuning.errors.launchFailedDefault');
      setFineTuningError(error.message || defaultError);
      enqueueSnackbar(t('newFineTuning.errors.launchFailed', { error: error.message || defaultError }), { variant: 'error' });
      return false;
    } finally {
      setCreatingFineTuning(false);
    }
  };

  // Fonction pour traiter l'étape suivante
  const handleNext = async () => {
    window.scrollTo(0, 0); // Scroll vers le haut
    
    // Calculer l'état de traitement pour l'étape 1
    const allCurrentContentForCheck = [...uploadedFiles, ...uploadedUrls, ...uploadedYouTube, ...uploadedWeb];
    const isProcessingCheck = allCurrentContentForCheck.some(
        content => 
            !(content.type === 'youtube' && content.status === 'awaiting_transcription') &&
            content.status !== 'completed' && 
            content.status !== 'error'
    );

    switch (activeStep) {
      case 0: // Après étape définition de l'assistant
        if (!assistantPurpose.trim()) {
          enqueueSnackbar(t('systemPromptGenerator.error.purposeRequired'), { variant: 'warning' });
          return;
        }
        // Ne plus utiliser isLoadingNext ici
        setGeneratingSystemContent(true); 
        const success = await generateSystemContent(); 
        setGeneratingSystemContent(false);
        if (!success) {
          return; // Ne pas passer à l'étape suivante si la génération échoue
        }
        // Passer à l'étape suivante ICI, après succès
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        return; // Important: Sortir du switch et de la fonction ici
      
      case 1: // Après étape import de contenu
        const hasAnyContent = uploadedFiles.length > 0 || uploadedUrls.length > 0 || uploadedYouTube.length > 0 || uploadedWeb.length > 0;
        if (!hasAnyContent) {
          enqueueSnackbar(t('newFineTuning.warnings.contentRequired'), { variant: 'warning' });
          return;
        }
        if (isProcessingCheck) { 
            enqueueSnackbar(t('newFineTuning.warnings.contentProcessing'), { variant: 'warning' });
            return;
        }
        break; // On continue vers setActiveStep à la fin
      
      case 2: // Après étape fine-tuning
        setIsCompleting(true); 
        const apiKeySuccess = await saveApiKey();
        if (!apiKeySuccess) {
            setIsCompleting(false);
            // Ne plus utiliser isLoadingNext
            return;
        }
        await completeOnboarding(); 
        return; // Sortir car completeOnboarding gère la redirection
    }
    
    // Passer à l'étape suivante pour les cas qui n'ont pas fait return (ex: case 1)
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Fonction pour revenir à l'étape précédente
  const handleBack = () => {
    window.scrollTo(0, 0); // Scroll vers le haut
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Fonction pour finaliser l'onboarding et lancer le fine-tuning
  const completeOnboarding = async () => {
    setProcessingFineTuning(true);
    setCompletionError(null);

    try {
      // Mise à jour du profil utilisateur
      const userProfilePayload = {
        name: user.name,
        company: user.company
      };
      
      await userService.updateUserProfile(userProfilePayload);
      
      // Trouver l'apiId correspondant au modèle sélectionné
      const selectedModel = providerModels[provider].find(m => m.id === model);
      const apiModelId = selectedModel?.apiId || model;
      
      // Rassembler TOUS les IDs de contenu
      const allContentIds = [
        ...uploadedFiles.map(file => file.id),
        ...uploadedUrls.map(url => url.id),
        ...youtubeVideosRef.current.map(video => video.id), // Utiliser la ref
        ...webSitesRef.current.map(site => site.id)        // Utiliser la ref
      ].filter(id => id != null); // Filtrer les IDs potentiellement null

      console.log("Envoi des IDs de contenu à createOnboardingSession:", allContentIds);

      // Création de la session de paiement Stripe
      const response = await checkoutService.createOnboardingSession({
        character_count: actualCharacterCount,
        content_ids: allContentIds, // <--- NOUVELLE LIGNE: Utiliser la liste complète
        dataset_name: datasetName,
        provider: provider,
        model: apiModelId,
        system_content: systemContent,
        description_payment: t('onboarding.paymentDescription', {
          provider: provider === 'openai' ? 'OpenAI' : 'Anthropic',
          model: model,
          count: actualCharacterCount.toLocaleString(),
          freeCount: FREE_CHARACTER_QUOTA.toLocaleString()
        })
      });

      console.log("Réponse de l'API session:", response);

      // Cas 1: Redirection vers Stripe pour paiement via payment_url
      if (response.payment_url) {
        window.location.href = response.payment_url;
        return;
      }
      
      // Cas 1 bis: Redirection via checkout_url (format actuel du backend)
      if (response.checkout_url) {
        window.location.href = response.checkout_url;
        return;
      }
      
      // Cas 2: Traitement gratuit avec redirection spécifiée
      if (response.redirect_url) {
        window.location.href = response.redirect_url;
        return;
      }
      
      // Cas 3: Traitement gratuit sans redirection spécifiée
      if (response.free_processing === true || (response.status && response.status === "success")) {
        // Le backend a marqué l'utilisateur comme ayant terminé l'onboarding.
        // On redirige simplement vers le dashboard.
        // L'AuthContext rechargera l'utilisateur avec le bon statut.
        
        // Afficher une notification de succès
        enqueueSnackbar(t('onboarding.snackbar.completionSuccess'), { variant: 'success' });
        
        // Rediriger vers le dashboard après un court délai pour que la notification soit visible
        setTimeout(() => {
          window.location.href = '/dashboard?onboarding_completed=true';
        }, 500); // Délai réduit
        return;
      }
      
      // Si on arrive ici, c'est un cas non géré
      throw new Error(t('onboarding.error.unexpectedResponse'));
    } catch (error) {
      console.error("Erreur lors de la finalisation de l'onboarding:", error);
      const defaultError = t('onboarding.error.completionGeneric');
      setCompletionError(error.message || defaultError);
      enqueueSnackbar(t('onboarding.snackbar.completionError', { error: error.message || defaultError }), { variant: 'error' });
    } finally {
      setProcessingFineTuning(false);
    }
  };

  // Fonction pour estimer le nombre de caractères
  const estimateCharacterCount = () => {
    // Si pas de fichiers ni URLs, retourner 0
    if (uploadedFiles.length === 0 && uploadedUrls.length === 0 && 
        youtubeVideosRef.current.length === 0 && webSitesRef.current.length === 0) {
      return 0;
    }
    
    // Calcul plus précis basé sur les fichiers réels
    let totalEstimate = 0;
    
    // Pour les fichiers
    uploadedFiles.forEach(file => {
      // Vérifier si le fichier a un comptage réel dans ses métadonnées
      if (file.content_metadata && file.content_metadata.character_count) {
        totalEstimate += parseInt(file.content_metadata.character_count);
      } else {
        // Estimation basée sur le type de fichier et sa taille
        if (file.size) {
          // En moyenne, 1 byte ≈ 0.5 caractères pour du texte
          const bytesToCharRatio = 0.5;
          totalEstimate += file.size * bytesToCharRatio;
        } else {
          // Fallback si la taille n'est pas disponible
          totalEstimate += 5000; // Estimation par défaut
        }
      }
    });
    
    // Pour les URLs
    uploadedUrls.forEach(url => {
      // Si nous avons déjà un comptage dans les métadonnées, l'utiliser
      if (url.content_metadata && url.content_metadata.character_count) {
        totalEstimate += parseInt(url.content_metadata.character_count);
      } else {
        // Pour les autres URLs
        totalEstimate += 3000; // Estimation moyenne par URL
      }
    });
    
    // Pour les vidéos YouTube - utiliser la ref au lieu de l'état
    youtubeVideosRef.current.forEach(video => {
      if (video.estimated_characters) {
        totalEstimate += parseInt(video.estimated_characters);
      } else {
        // Si pas d'estimation disponible, utiliser une valeur par défaut
        totalEstimate += 4000; // ~10 minutes estimées
      }
    });
    
    // Pour les sites web scrapés - utiliser la ref au lieu de l'état
    webSitesRef.current.forEach(site => {
      if (site.character_count) {
        totalEstimate += parseInt(site.character_count);
      }
    });
    
    return Math.round(totalEstimate);
  };
  
  // Fonction pour calculer le nombre réel de caractères basé sur les métadonnées
  const calculateActualCharacterCount = () => {
    let actualCount = 0;
    let hasAllCounts = true;
    
    console.log("CALCUL DU COMPTE RÉEL DE CARACTÈRES...");
    console.log("- Fichiers:", uploadedFiles);
    console.log("- URLs:", uploadedUrls);
    console.log("- YouTube Ref:", youtubeVideosRef.current);
    console.log("- Web Ref:", webSitesRef.current);
    
    // Compter les caractères des fichiers dont les métadonnées sont disponibles
    uploadedFiles.forEach(file => {
      console.log(`  -> Fichier ID: ${file.id}, Nom: ${file.name}, Statut: ${file.status}`);
      if (file.content_metadata && file.content_metadata.character_count) {
        const fileChars = parseInt(file.content_metadata.character_count);
        console.log(`     Compte exact trouvé: ${fileChars}`);
        actualCount += fileChars;
      } else if (file.status === 'completed') {
        console.log(`     ANOMALIE: Statut completed mais pas de character_count !`);
        hasAllCounts = false;
      } else {
        console.log(`     Statut: ${file.status}, pas de compte exact disponible.`);
        hasAllCounts = false;
      }
    });
    
    // De même pour les URLs
    uploadedUrls.forEach(url => {
        console.log(`  -> URL ID: ${url.id}, Nom: ${url.name}, Statut: ${url.status}`);
        if (url.content_metadata && url.content_metadata.character_count) {
            const urlChars = parseInt(url.content_metadata.character_count);
            console.log(`     Compte exact trouvé: ${urlChars}`);
            actualCount += urlChars;
        } else if (url.status === 'completed') {
            console.log(`     ANOMALIE: Statut completed mais pas de character_count !`);
            hasAllCounts = false;
        } else {
            console.log(`     Statut: ${url.status}, pas de compte exact disponible.`);
            hasAllCounts = false;
        }
    });
    
    // Process YouTube videos
    youtubeVideosRef.current.forEach(video => {
        console.log(`  -> YouTube ID: ${video.id}, Nom: ${video.name}, Statut: ${video.status}`);
        if (video.estimated_characters) {
            const ytChars = parseInt(video.estimated_characters);
            console.log(`     Caractères estimés: ${ytChars}`);
            actualCount += ytChars;
        } else {
            console.log(`     Pas d'estimation disponible.`);
            hasAllCounts = false;
        }
    });
    
    // Process scraped websites
    webSitesRef.current.forEach(site => {
        console.log(`  -> Site Web ID: ${site.id}, Nom: ${site.name}, Statut: ${site.status}`);
        if (site.character_count) {
            const webChars = parseInt(site.character_count);
            console.log(`     Compte exact trouvé: ${webChars}`);
            actualCount += webChars;
        } else {
            console.log(`     Pas de compte exact disponible.`);
            hasAllCounts = false;
        }
    });
    
    console.log(`TOTAL FINAL CALCULÉ: ${actualCount}`);
    console.log(`EST-CE ESTIMÉ ? ${!hasAllCounts || (uploadedFiles.length === 0 && uploadedUrls.length === 0 && youtubeVideosRef.current.length === 0 && webSitesRef.current.length === 0)}`);
    
    // Mettre à jour l'état et la référence
    setActualCharacterCount(actualCount);
    totalCharCountRef.current = actualCount;
    setIsEstimated(!hasAllCounts || (uploadedFiles.length === 0 && uploadedUrls.length === 0 && youtubeVideosRef.current.length === 0 && webSitesRef.current.length === 0));
    
    return actualCount;
  };
  
  // Effet pour vérifier périodiquement le statut (garder pour màj visuelle)
  useEffect(() => {
    console.log("Effet déclenché - Vérification statut uploads");
    
    calculateActualCharacterCount(); // Recalcul initial ou après ajout/suppression
    
    const allCurrentContent = [...uploadedFiles, ...uploadedUrls, ...uploadedYouTube, ...uploadedWeb];
    const processingItems = allCurrentContent.filter(
      content => content.status !== 'completed' && content.status !== 'error'
    );
    
    if (processingItems.length > 0) {
      const intervalId = setInterval(() => {
        processingItems.forEach(content => {
            if (content.id) { 
                console.log(`POLLING: Vérification du statut pour contenu ID ${content.id}`);
                contentService.getById(content.id)
                    .then(updatedContent => {
                         console.log(`   -> Données reçues pour ${content.id}:`, updatedContent);
                         console.log("STRUCTURE DE updatedContent :", JSON.stringify(updatedContent, null, 2)); // <-- AJOUT DU LOG
                         // Mise à jour de l'état approprié 
                         if (updatedContent.file_path) {
                            console.log(`      Mise à jour de uploadedFiles pour ID ${content.id}`);
                            setUploadedFiles(prev => {
                                const newState = prev.map(f => f.id === updatedContent.id ? updatedContent : f);
                                console.log(`      ÉTAT uploadedFiles APRÈS MISE À JOUR pour ID ${updatedContent.id}:`, JSON.stringify(newState, null, 2)); // <-- Log de l'état mis à jour
                                return newState;
                            });
                         } else if (updatedContent.url && updatedContent.type === 'youtube') {
                            console.log(`      Mise à jour de uploadedYouTube pour ID ${content.id}`);
                            setUploadedYouTube(prev => prev.map(v => v.id === updatedContent.id ? {...v, ...updatedContent} : v)); 
                         } else if (updatedContent.url && updatedContent.type === 'website') {
                            console.log(`      Mise à jour de uploadedWeb pour ID ${content.id}`);
                            setUploadedWeb(prev => prev.map(w => w.id === updatedContent.id ? {...w, ...updatedContent} : w));
                         } else if (updatedContent.url) {
                            console.log(`      Mise à jour de uploadedUrls pour ID ${content.id}`);
                            setUploadedUrls(prev => prev.map(u => u.id === updatedContent.id ? updatedContent : u));
                         }
                    })
                    .catch(err => console.error(`POLLING: Erreur lors du rafraîchissement du contenu ${content.id}:`, err));
            }
        });
      }, 5000); 
      
      return () => clearInterval(intervalId);
    }
  }, [uploadedFiles, uploadedUrls, uploadedYouTube, uploadedWeb]); 

  // Rafraîchir régulièrement le comptage des caractères et ajouter une dépendance explicite
  // pour les objets uploadedYouTube et uploadedWeb
  useEffect(() => {
    console.log("Effet déclenché - État des uploads actualisé");
    
    // Recalcul forcé à chaque changement des tableaux uploadedYouTube et uploadedWeb
    calculateActualCharacterCount();
    
    const allCurrentContent = [...uploadedFiles, ...uploadedUrls, ...uploadedYouTube, ...uploadedWeb];
    const hasProcessingContent = allCurrentContent.some(
      content => content.status !== 'completed' && content.status !== 'error'
    );

    // Mettre à jour l'état de traitement
    // setIsContentProcessing(hasProcessingContent);
    
    if (hasProcessingContent) {
      const intervalId = setInterval(() => {
        // Rafraîchir seulement les contenus en traitement
        allCurrentContent.forEach(content => {
            if (content.status !== 'completed' && content.status !== 'error' && content.id) {
                contentService.getById(content.id)
                    .then(updatedContent => {
                         // Mise à jour de l'état approprié
                         if (updatedContent.file_path) {
                            setUploadedFiles(prev => prev.map(f => f.id === updatedContent.id ? updatedContent : f));
                         } else if (updatedContent.url && updatedContent.type === 'youtube') {
                            setUploadedYouTube(prev => prev.map(v => v.id === updatedContent.id ? {...v, ...updatedContent} : v)); // Fusionner pour garder les estimations
                         } else if (updatedContent.url && updatedContent.type === 'website') {
                            setUploadedWeb(prev => prev.map(w => w.id === updatedContent.id ? {...w, ...updatedContent} : w));
                         } else if (updatedContent.url) {
                            setUploadedUrls(prev => prev.map(u => u.id === updatedContent.id ? updatedContent : u));
                         }
                         // Le recalcul se fera via la dépendance sur les états
                    })
                    .catch(err => console.error(`Erreur lors du rafraîchissement du contenu ${content.id}:`, err));
            }
        });
      }, 5000);  // Rafraîchir toutes les 5 secondes
      
      return () => clearInterval(intervalId);
    }
  }, [uploadedFiles, uploadedUrls, uploadedYouTube, uploadedWeb]); // Dépendance explicite sur tous les tableaux

  // Calculer le niveau de qualité basé sur le nombre de caractères et le type d'usage
  const getQualityLevel = (characterCount, usageType = 'other') => {
    const thresholds = USAGE_THRESHOLDS[usageType] || USAGE_THRESHOLDS.other;
    
    if (characterCount < thresholds.min) return 'insufficient';
    if (characterCount < thresholds.min * 2) return 'minimal';
    if (characterCount < thresholds.optimal) return 'good';
    if (characterCount <= thresholds.max) return 'optimal';
    return 'excessive';
  };

  // Calculer la progression de qualité (0-100) en fonction du type d'usage
  const getQualityProgress = (characterCount, usageType = 'other') => {
    const thresholds = USAGE_THRESHOLDS[usageType] || USAGE_THRESHOLDS.other;
    
    if (characterCount <= 0) return 0;
    if (characterCount >= thresholds.max) return 100;
    
    // Progression progressive par segments
    if (characterCount < thresholds.min) {
      // Segment 0% - 30%
      return (characterCount / thresholds.min) * 30;
    } else if (characterCount < thresholds.optimal) {
      // Segment 30% - 70%
      return 30 + ((characterCount - thresholds.min) / (thresholds.optimal - thresholds.min)) * 40;
    } else {
      // Segment 70% - 100%
      return 70 + ((characterCount - thresholds.optimal) / (thresholds.max - thresholds.optimal)) * 30;
    }
  };

  // Calculer le coût estimé
  const getEstimatedCost = (characterCount) => {
    // Soustraire le quota gratuit
    const billableCharacters = Math.max(0, characterCount - FREE_CHARACTER_QUOTA);
    return billableCharacters * PRICE_PER_CHARACTER;
  };

  // Fonction pour calculer la progression sur la barre multi-paliers
  const calculateProgressValue = (currentCount, minRecommended) => {
    // Si aucune recommandation, retourner 0
    if (!minRecommended) return 0;
    
    // Définir les paliers
    const freeCredits = 10000;
    const maxRecommended = minRecommended * 4;
    
    // Calculer les pourcentages pour chaque segment de la barre
    // Segment 1: 0 à 10k (25% de la barre)
    // Segment 2: 10k au minimum recommandé (25% de la barre)
    // Segment 3: minimum recommandé à 4x le minimum (50% de la barre)
    
    let progressValue = 0;
    
    if (currentCount <= freeCredits) {
      // Premier segment (0-10k)
      progressValue = (currentCount / freeCredits) * 25;
    } else if (currentCount <= minRecommended) {
      // Deuxième segment (10k-min recommandé)
      progressValue = 25 + ((currentCount - freeCredits) / (minRecommended - freeCredits)) * 25;
    } else if (currentCount <= maxRecommended) {
      // Troisième segment (min recommandé-4x min recommandé)
      progressValue = 50 + ((currentCount - minRecommended) / (maxRecommended - minRecommended)) * 50;
    } else {
      // Au-delà de 4x le minimum recommandé
      progressValue = 100;
    }
    
    // Garantir que la valeur est entre 0 et 100
    return Math.max(0, Math.min(100, progressValue));
  };

  // Ajouter une nouvelle fonction pour forcer la synchronisation du nombre de caractères
  // Cette fonction ne dépend pas des états React mais calcule directement 
  // depuis les tableaux fournis
  const forceSyncCharacterCount = (files, urls, youtube, web) => {
    let totalCount = 0;
    
    // Compter les fichiers
    files.forEach(file => {
      if (file.content_metadata && file.content_metadata.character_count) {
        totalCount += parseInt(file.content_metadata.character_count);
      } else if (file.size) {
        // Estimation basée sur la taille
        totalCount += file.size * 0.5;
      } else {
        totalCount += 5000; // Valeur par défaut
      }
    });
    
    // Compter les URLs
    urls.forEach(url => {
      if (url.content_metadata && url.content_metadata.character_count) {
        totalCount += parseInt(url.content_metadata.character_count);
      } else {
        totalCount += 3000; // Valeur par défaut
      }
    });
    
    // Compter les vidéos YouTube
    youtube.forEach(video => {
      if (video.estimated_characters) {
        totalCount += parseInt(video.estimated_characters);
      } else {
        totalCount += 4000; // Valeur par défaut pour 10 minutes
      }
    });
    
    // Compter les sites web
    web.forEach(site => {
      if (site.character_count) {
        totalCount += parseInt(site.character_count);
      }
    });
    
    console.log("FORÇAGE DE SYNCHRONISATION DU COMPTEUR DE CARACTÈRES:", totalCount);
    console.log("- Fichiers:", files.length, "URLs:", urls.length, "YouTube:", youtube.length, "Web:", web.length);
    
    // Mettre à jour directement les états sans passer par des fonctions de mise à jour
    setActualCharacterCount(totalCount);
    setIsEstimated(true); // On considère toujours que c'est estimé pour être sûr
    
    return totalCount;
  };

  // Fonction modifiée pour traiter les URL YouTube avec synchronisation robuste
  const handleAddYouTubeUrl = async () => {
    if (!youtubeUrl.trim() || youtubeUploading) return;
    if (!createdProject) {
      setYoutubeUploadError(t('onboarding.step2.error.projectNotCreated'));
      return;
    }
    
    setYoutubeUploading(true);
    setYoutubeUploadError(null);
    
    // Extraire l'ID de la vidéo YouTube
    const youtubeLinkRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = youtubeUrl.match(youtubeLinkRegex);
    const videoId = match && match[1];
    
    if (!videoId) {
      setYoutubeUploadError(t('contentManager.error.invalidYoutubeUrl'));
      setYoutubeUploading(false);
      return;
    }
    
    try {
      // --- NOUVELLE LOGIQUE AVEC FALLBACK ---
      let videoInfo = null;
      let primaryError = null;

      // --- Essai API Primaire (youtube-media-downloader) ---
      try {
        console.log("Trying Primary API (youtube-media-downloader) for", videoId);
        const optionsPrimary = {
          method: 'GET',
          url: 'https://youtube-media-downloader.p.rapidapi.com/v2/video/details',
          params: { videoId: videoId },
          headers: {
            'X-RapidAPI-Key': '9144fffaabmsh319ba65e73a3d86p164f35jsn097fa4509ee8',
            'X-RapidAPI-Host': 'youtube-media-downloader.p.rapidapi.com'
          }
        };
        const rapidApiResponse = await axios.request(optionsPrimary);
        console.log("Primary API Response:", rapidApiResponse.data);
        if (rapidApiResponse.data && (rapidApiResponse.data.lengthSeconds || rapidApiResponse.data.length_seconds)) {
            videoInfo = rapidApiResponse.data; // Garder la structure originale si succès
            // Assurer la cohérence du champ de durée
            if (!videoInfo.lengthSeconds && videoInfo.length_seconds) {
                videoInfo.lengthSeconds = videoInfo.length_seconds;
            }
        } else {
             throw new Error("Primary API response missing duration.");
        }
      } catch (err) {
        console.warn("Primary API Failed:", err.message);
        primaryError = err; // Stocker l'erreur primaire

        // --- Essai API Secondaire (youtube-v2) ---
        console.log("Trying Secondary API (youtube-v2) for", videoId);
        try {
          const optionsSecondary = {
            method: 'GET',
            url: 'https://youtube-v2.p.rapidapi.com/video/details',
            params: { video_id: videoId }, // Note: paramètre 'video_id'
            headers: {
              'x-rapidapi-key': '9144fffaabmsh319ba65e73a3d86p164f35jsn097fa4509ee8',
              'x-rapidapi-host': 'youtube-v2.p.rapidapi.com'
            }
          };
          const secondaryResponse = await axios.request(optionsSecondary);
          console.log("Secondary API Response:", secondaryResponse.data);
          const secondaryData = secondaryResponse.data;
          if (secondaryData && secondaryData.video_length) {
            // Mapper les champs pour une structure cohérente
            videoInfo = {
              title: secondaryData.title || t('onboarding.video.defaultTitle', { timestamp: new Date().toLocaleString() }),
              lengthSeconds: secondaryData.video_length // 'video_length' contient la durée
              // On peut ajouter d'autres champs si nécessaire
            };
            console.log("Secondary API Success, mapped data:", videoInfo);
          } else {
            throw new Error("Secondary API response missing video_length.");
          }
        } catch (secondaryError) {
          console.error("Secondary API Failed:", secondaryError.message);
          // Si l'API secondaire échoue aussi, on garde l'erreur primaire ou on combine
          primaryError = new Error(`Primary API failed (${primaryError.message || 'Unknown error'}) and Secondary API failed (${secondaryError.message || 'Unknown error'}).`);
        }
      }

      // --- Traitement du résultat ou de l'erreur finale ---
      if (videoInfo && videoInfo.lengthSeconds) {
        const videoTitle = videoInfo.title || t('onboarding.video.defaultTitle', { timestamp: new Date().toLocaleString() });
        const durationSeconds = parseInt(videoInfo.lengthSeconds); // Assurer que c'est un nombre
        const durationMinutes = Math.round(durationSeconds / 60);
        const estimatedCharacters = Math.round((durationSeconds / 60) * 400);
        console.log('Duration:', durationSeconds, 's; Estimated Chars:', estimatedCharacters);

        // --- Créer l'enregistrement Content côté backend (inchangé) ---
        const urlContentPayload = {
          project_id: createdProject.id,
          url: youtubeUrl,
          name: videoTitle,
          type: 'youtube',
          description: t('onboarding.video.pendingDescription', { duration: durationMinutes })
        };
        const backendResponse = await contentService.addUrl(urlContentPayload);
        console.log("Réponse Backend (Création Contenu):", backendResponse);

        // --- Mettre à jour l'état frontend (inchangé) ---
        const newYouTubeVideo = {
          ...backendResponse,
          url: youtubeUrl,
          source: `Durée: ${durationMinutes} min (estimation)`,
          estimated_characters: estimatedCharacters,
          status: backendResponse.status || 'awaiting_transcription' // Utiliser awaiting_transcription si fourni par backend
        };
        youtubeVideosRef.current.push(newYouTubeVideo);
        setUploadedYouTube([...youtubeVideosRef.current]);
        totalCharCountRef.current += estimatedCharacters;
        setActualCharacterCount(totalCharCountRef.current);
        setIsEstimated(true);
        setYoutubeUrl('');
        console.log("AJOUT VIDÉO YOUTUBE (ESTIMATION) - ÉTAT ACTUEL:", {
          nouvelleVideo: newYouTubeVideo,
          totalYouTube: youtubeVideosRef.current.length,
          characCount: totalCharCountRef.current
        });

      } else {
        // Les deux APIs ont échoué ou n'ont pas retourné de durée
        throw primaryError || new Error(t('contentManager.error.youtubeDurationFailed'));
      }

    } catch (error) {
      // Gérer l'erreur finale (si les deux APIs échouent ou autre erreur)
      console.error('Erreur finale ajout URL YouTube:', error);
      let errorMessage = t('contentManager.error.youtubeAddFailed');
      if (error.response) {
         errorMessage = t('chatPage.error.apiError', { message: error.response.data?.detail || error.response.data?.message || error.message });
      } else if (error.message) {
         if (error.message === t('contentManager.error.youtubeDurationFailed')) {
            errorMessage = error.message;
         } else {
            errorMessage = t('common.errorLabel', { error: error.message });
         }
      }
      setYoutubeUploadError(errorMessage);
    } finally {
      setYoutubeUploading(false);
    }
  };

  // Fonction pour scraper une URL Web - mise à jour avec le même style robuste
  const handleScrapeUrl = async () => {
    if (!scrapeUrl.trim() || scrapeLoading) return;
    if (!createdProject) {
      setScrapeError(t('onboarding.step2.error.projectNotCreated'));
      return;
    }
    
    setScrapeLoading(true);
    setScrapeError(null);
    
    try {
      // Effectuer le scraping immédiatement
      const scrapedData = await scrapingService.scrapeWeb(scrapeUrl);
      
      // Calculer le nombre de caractères du contenu scrapé
      const scrapedText = scrapedData.paragraphs ? scrapedData.paragraphs.join(" ") : "";
      const characterCount = scrapedText.length;
      
      // Créer le contenu avec le texte scrapé
      const urlContent = {
        project_id: createdProject.id,
        url: scrapeUrl,
        name: scrapedData.title || t('onboarding.web.defaultTitle', { timestamp: new Date().toLocaleString() }),
        type: 'website',
        description: scrapedText
      };
      
      // Ajouter l'URL avec le contenu scrapé
      const response = await contentService.addUrl(urlContent);
      
      // Créer l'objet du site web
      const newWebSite = {
        ...response,
        url: scrapeUrl,
        scraped: scrapedData,
        character_count: characterCount,
        status: 'completed'
      };
      
      // MÉTHODE FIABLE : Mettre à jour à la fois l'état React et la référence
      // 1. Ajouter à la référence (synchrône, toujours fiable)
      webSitesRef.current.push(newWebSite);
      
      // 2. Mettre à jour l'état React (peut être asynchrone, moins fiable)
      setUploadedWeb([...webSitesRef.current]);
      
      // 3. Mettre à jour directement le compteur de référence
      totalCharCountRef.current += characterCount;
      
      // 4. Mettre à jour l'état visible du compteur
      setActualCharacterCount(totalCharCountRef.current);
      
      // Réinitialiser le champ
      setScrapeUrl('');
      
      // Log détaillé pour le débogage
      console.log("AJOUT SITE WEB - ÉTAT ACTUEL:", {
        nouveauSite: newWebSite,
        totalSites: webSitesRef.current.length,
        characCount: totalCharCountRef.current
      });
      
    } catch (error) {
      console.error('Erreur lors du scraping de l\'URL Web:', error);
      setScrapeError(error.message || t('contentManager.error.scrapeFailed'));
    } finally {
      setScrapeLoading(false);
    }
  };

  // Fonction améliorée pour supprimer une vidéo YouTube
  const handleDeleteYouTube = (videoId) => {
    // Trouver la vidéo pour connaître ses caractères estimés
    const videoIndex = youtubeVideosRef.current.findIndex(v => v.id === videoId);
    if (videoIndex === -1) return;
    
    const video = youtubeVideosRef.current[videoIndex];
    const charactersToRemove = video.estimated_characters || 4000;
    
    // Supprimer d'abord de l'API
    contentService.delete(videoId)
      .then(() => {
        // 1. Supprimer de la référence
        youtubeVideosRef.current.splice(videoIndex, 1);
        
        // 2. Mettre à jour l'état React
        setUploadedYouTube([...youtubeVideosRef.current]);
        
        // 3. Mettre à jour le compteur de référence
        totalCharCountRef.current = Math.max(0, totalCharCountRef.current - charactersToRemove);
        
        // 4. Mettre à jour l'état visible du compteur
        setActualCharacterCount(totalCharCountRef.current);
        
        // Log détaillé pour le débogage
        console.log("SUPPRESSION VIDÉO YOUTUBE - ÉTAT ACTUEL:", {
          videoId,
          charactersToRemove,
          remainingYouTube: youtubeVideosRef.current.length,
          characCount: totalCharCountRef.current
        });
        
        // Notification
        enqueueSnackbar(t('contentManager.snackbar.youtubeRemoved'), { variant: 'success' });
      })
      .catch(err => {
        console.error("Erreur lors de la suppression de la vidéo YouTube:", err);
        enqueueSnackbar(t('onboarding.step1.snackbar.youtubeDeleteError'), { variant: 'error' }); // Key was incorrect, corrected
      });
  };

  // Fonction améliorée pour supprimer un site web
  const handleDeleteWeb = (siteId) => {
    // Trouver le site pour connaître son nombre de caractères
    const siteIndex = webSitesRef.current.findIndex(s => s.id === siteId);
    if (siteIndex === -1) return;
    
    const site = webSitesRef.current[siteIndex];
    const charactersToRemove = site.character_count || 0;
    
    // Supprimer d'abord de l'API
    contentService.delete(siteId)
      .then(() => {
        // 1. Supprimer de la référence
        webSitesRef.current.splice(siteIndex, 1);
        
        // 2. Mettre à jour l'état React
        setUploadedWeb([...webSitesRef.current]);
        
        // 3. Mettre à jour le compteur de référence
        totalCharCountRef.current = Math.max(0, totalCharCountRef.current - charactersToRemove);
        
        // 4. Mettre à jour l'état visible du compteur
        setActualCharacterCount(totalCharCountRef.current);
        
        // Log détaillé pour le débogage
        console.log("SUPPRESSION SITE WEB - ÉTAT ACTUEL:", {
          siteId,
          charactersToRemove,
          remainingSites: webSitesRef.current.length,
          characCount: totalCharCountRef.current
        });
        
        // Notification
        enqueueSnackbar(t('contentManager.snackbar.websiteRemoved'), { variant: 'success' });
      })
      .catch(err => {
        console.error("Erreur lors de la suppression du site web:", err);
        enqueueSnackbar(t('onboarding.step1.snackbar.webDeleteError'), { variant: 'error' }); // Key was incorrect, corrected
      });
  };

  // Contenu des étapes
  const getStepContent = (step) => {
    // Calculer l'état de traitement pour l'affichage de l'alerte
    const isCurrentlyProcessing = [...uploadedFiles, ...uploadedUrls, ...uploadedYouTube, ...uploadedWeb].some(
        content => content.status !== 'completed' && content.status !== 'error'
    );
    
    switch (step) {
      case 0: // Définition de l'assistant
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                {t('onboarding.step0.infoAlert')}
              </Typography>
            </Alert>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label={t('onboarding.step0.purposeLabel')}
                value={assistantPurpose}
                onChange={(e) => setAssistantPurpose(e.target.value)}
                multiline
                rows={5}
                placeholder={t('onboarding.step0.purposePlaceholder')}
                error={!!systemContentError}
                helperText={systemContentError || t('onboarding.step0.purposeHelper')} // Show helper or error
                inputProps={{ maxLength: 1000 }}
              />
              {/* Remove redundant helper text if error is shown in helperText */}
              {/* <FormHelperText>
                {t('onboarding.step0.purposeHelper')}
              </FormHelperText> */}
            </FormControl>
          </Box>
        );
      
      case 1: // Import de contenu
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              {/* Use dangerouslySetInnerHTML for the line breaks in the translation key */}
              <Typography variant="body2" dangerouslySetInnerHTML={{ __html: t('onboarding.step1.infoAlert').replace(/\\n/g, '<br />') }} />
            </Alert>

            <Paper
              elevation={0}
              sx={{
                p: 2, 
                mb: 3, 
                border: '1px solid', 
                borderColor: 'divider', 
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              {/* --- MODIFICATION : Logique d'affichage améliorée --- */}
              {(() => {
                const isProcessingAnyContent = [...uploadedFiles, ...uploadedUrls, ...uploadedYouTube, ...uploadedWeb].some(c => c.status === 'processing');
                const hasAnyContent = uploadedFiles.length > 0 || uploadedUrls.length > 0 || uploadedYouTube.length > 0 || uploadedWeb.length > 0;
                const totalFiles = uploadedFiles.length + uploadedUrls.length + uploadedYouTube.length + uploadedWeb.length;
                const completedFiles = [...uploadedFiles, ...uploadedUrls, ...uploadedYouTube, ...uploadedWeb].filter(c => c.status === 'completed' || c.status === 'awaiting_transcription').length;

                let titleText = "";
                if (isProcessingAnyContent) {
                  titleText = t('onboarding.step1.status.processing');
                } else if (!isEstimated && hasAnyContent) {
                  titleText = t('onboarding.step1.status.exactCount');
                } else if (hasAnyContent) {
                  titleText = t('onboarding.step1.status.estimatedCount');
                } else {
                  titleText = t('onboarding.step1.status.noContent');
                }

                let countText = "";
                if (isProcessingAnyContent) {
                  countText = <Box sx={{ display: 'flex', alignItems: 'center' }}><CircularProgress size={16} sx={{ mr: 1 }} />{t('common.calculating')}</Box>;
                } else if (!isEstimated && actualCharacterCount > 0) {
                  // Use Trans component for embedded <strong>
                  countText = <Trans i18nKey="onboarding.step1.charsCounted" values={{ count: actualCharacterCount.toLocaleString() }} components={{ strong: <strong /> }} />;
                } else if (hasAnyContent && isEstimated) {
                   if (actualCharacterCount > 0) {
                    // Use Trans component for embedded <strong>
                    countText = <Trans i18nKey="onboarding.step1.charsEstimated" values={{ estimated: estimateCharacterCount().toLocaleString(), counted: actualCharacterCount.toLocaleString() }} components={{ strong: <strong /> }} />;
                   } else {
                    // Use Trans component for embedded <strong>
                    countText = <Trans i18nKey="onboarding.step1.charsEstimated" values={{ estimated: estimateCharacterCount().toLocaleString(), counted: '0' }} components={{ strong: <strong /> }} />; // Fallback counted
                   }
                } else {
                  // Use Trans component for embedded <strong>
                  countText = <Trans i18nKey="onboarding.step1.charsEstimatedZero" components={{ strong: <strong /> }} />;
                }

                let costText = "";
                if (isProcessingAnyContent) {
                    costText = t('common.calculating');
                } else if (!isEstimated && actualCharacterCount <= FREE_CHARACTER_QUOTA) {
                    costText = t('common.free');
                } else if (!isEstimated && actualCharacterCount > FREE_CHARACTER_QUOTA) {
                    // Use translation for cost format if needed, assuming $ for now
                    costText = t('onboarding.step1.cost', { cost: getEstimatedCost(actualCharacterCount).toFixed(2) });
                } else if (estimateCharacterCount() <= FREE_CHARACTER_QUOTA) {
                    costText = t('onboarding.step1.costFreeEstimate');
                } else {
                    // Use translation for cost estimate format if needed, assuming ~$ for now
                    costText = t('onboarding.step1.costEstimate', { cost: getEstimatedCost(estimateCharacterCount()).toFixed(2) });
                }

                return (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {titleText}
                      {hasAnyContent && ` (${completedFiles}/${totalFiles} ${t('onboarding.step1.filesProcessed')})`}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {countText}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                           {/* Use Trans component for embedded <strong> */}
                          <Trans i18nKey="characterEstimator.estimatedCostLabel" components={{ strong: <strong /> }} />: <strong>{costText}</strong>
                        </Typography>
                      </Box>
                    </Box>
                  </>
                );
              })()}
              {/* --- FIN MODIFICATION --- */}

              {/* Comparaison avec le minimum recommandé */}
              {minCharactersRecommended > 0 && (
                <Box sx={{ mt: 1, width: '100%', maxWidth: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium" color="text.primary">
                      {t('onboarding.step1.progressTitle')}
                    </Typography>
                    <Typography variant="body2" color="primary.main" fontWeight="medium">
                      {t('onboarding.step1.progressChars', { count: (isEstimated ? estimateCharacterCount() : actualCharacterCount).toLocaleString() })}
                    </Typography>
                  </Box>

                  {/* Barre de progression simple et sans erreur */}
                  <Box sx={{ mt: 3, mb: 3, position: 'relative', height: 48 }}>
                    {/* Barre principale */}
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateProgressValue(isEstimated ? estimateCharacterCount() : actualCharacterCount, minCharactersRecommended)}
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        backgroundColor: 'rgba(0, 0, 0, 0.09)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'primary.main',
                          boxShadow: '0 0 8px rgba(25, 118, 210, 0.5)',
                          transition: 'transform 0.8s ease-in-out'
                        }
                      }}
                    />
                    
                    {/* 10K */}
                    <Box sx={{ position: 'absolute', left: '25%', top: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateX(-50%)' }}>
                      <Box sx={{ width: 2, height: 12, bgcolor: 'grey.400' }} />
                      <Tooltip title={t('onboarding.step1.tooltip.freeCredits')} arrow placement="top">
                        <Box>
                          <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                            {t('onboarding.step1.progressLabel.free')}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                    
                    {/* Min */}
                    <Box sx={{ position: 'absolute', left: '50%', top: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateX(-50%)' }}>
                      <Box sx={{ width: 2, height: 12, bgcolor: 'warning.main' }} />
                      <Tooltip title={t('onboarding.step1.tooltip.minRecommended')} arrow placement="top">
                        <Box>
                          <Typography variant="caption" sx={{ mt: 0.5, color: 'warning.main', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            {t('onboarding.step1.progressLabel.min', { count: minCharactersRecommended ? minCharactersRecommended.toLocaleString() : '0' })}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                    
                    {/* Optimal */}
                    <Box sx={{ position: 'absolute', left: `${Math.min(95, 50 + (4 - 1) * (50 / 3))}%`, top: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateX(-50%)' }}>
                      <Box sx={{ width: 2, height: 12, bgcolor: 'primary.main' }} />
                      <Tooltip title={t('onboarding.step1.tooltip.optimal')} arrow placement="top">
                        <Box>
                          <Typography variant="caption" sx={{ mt: 0.5, color: 'primary.main', fontWeight: 'medium', whiteSpace: 'nowrap' }}>
                            {t('onboarding.step1.progressLabel.optimal', { count: minCharactersRecommended ? (minCharactersRecommended * 4).toLocaleString() : '0' })}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                    
                    {/* Marqueurs intermédiaires */}
                    {minCharactersRecommended > 0 && [1.5, 2, 3].map((multiplier, index) => {
                      const leftPosition = Math.min(95, 50 + (multiplier - 1) * (50 / 3));
                      const charCount = Math.round(minCharactersRecommended * multiplier);
                      
                      return (
                        <Box key={index} sx={{ position: 'absolute', left: `${leftPosition}%`, top: 14, transform: 'translateX(-50%)' }}>
                          <Box sx={{ width: 1, height: 8, bgcolor: 'grey.300' }} />
                          {index === 1 && ( // Afficher uniquement pour 2x
                            <Tooltip title={t('onboarding.step1.tooltip.intermediate')} arrow placement="top">
                              <Typography variant="caption" sx={{
                                position: 'absolute',
                                mt: 1,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                color: 'text.secondary',
                                whiteSpace: 'nowrap',
                                fontSize: '0.7rem',
                                opacity: 0.8
                              }}>
                                {t('onboarding.step1.progressLabel.intermediateValue', { count: charCount.toLocaleString() })}
                              </Typography>
                            </Tooltip>
                          )}
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Messages d'état - Use Trans component */}
                  {minCharactersRecommended > 0 && (isEstimated ? estimateCharacterCount() : actualCharacterCount) < minCharactersRecommended && (
                    <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                      <Trans
                        i18nKey="onboarding.step1.warning.missingChars"
                        values={{ count: (minCharactersRecommended - (isEstimated ? estimateCharacterCount() : actualCharacterCount)).toLocaleString() }}
                        components={{ 0: <InfoOutlinedIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />, 1: <strong /> }}
                      />
                    </Typography>
                  )}
                  {minCharactersRecommended > 0 && (isEstimated ? estimateCharacterCount() : actualCharacterCount) >= minRecommended &&
                    (isEstimated ? estimateCharacterCount() : actualCharacterCount) < minCharactersRecommended * 4 && (
                      <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                         <Trans i18nKey="onboarding.step1.success.minReached" components={{ 0: <CheckCircleIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} /> }} />
                      </Typography>
                    )}
                  {minCharactersRecommended > 0 && (isEstimated ? estimateCharacterCount() : actualCharacterCount) >= minRecommended && (
                    <Typography variant="caption" color={(isEstimated ? estimateCharacterCount() : actualCharacterCount) >= minCharactersRecommended * 4 ? 'primary.main' : 'text.secondary'} sx={{ display: 'block', mt: 0.5 }}>
                      {(isEstimated ? estimateCharacterCount() : actualCharacterCount) >= minCharactersRecommended * 4 ? (
                        <Trans i18nKey="onboarding.step1.info.excellent" components={{ 0: <StarsIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} /> }} />
                      ) : (
                        t('onboarding.step1.info.addMore')
                      )}
                    </Typography>
                  )}

                  {isEstimated && [...uploadedFiles, ...uploadedUrls, ...uploadedYouTube, ...uploadedWeb].some(c => c.status !== 'completed' && c.status !== 'error' && c.status !== 'awaiting_transcription') && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        {t('onboarding.step1.info.processingUpdate')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Le composant FileUpload affiche déjà les fichiers sous forme de chips */}
              {createdProject && (
                <Box sx={{ mb: 1 }}>
                  <FileUpload 
                    projectId={createdProject.id} 
                    hideUrlInput={true} 
                    onSuccess={(uploadedContent, actionInfo) => { // Ajouter actionInfo
                      if (uploadedContent) {
                        console.log("Nouveau contenu uploadé:", uploadedContent);
                        
                        // Si c'est un fichier
                        if (uploadedContent.file_path) {
                          setUploadedFiles(prev => {
                            const exists = prev.find(f => f.id === uploadedContent.id);
                            if (exists) {
                              return prev.map(f => f.id === uploadedContent.id ? uploadedContent : f);
                            }
                            return [...prev, uploadedContent];
                          });
                          enqueueSnackbar(t('fileUpload.snackbar.uploadSuccess', { fileName: uploadedContent.name }), { variant: 'success' });
                        } 
                        // Si c'est une URL
                        else if (uploadedContent.url) {
                          setUploadedUrls(prev => {
                            const exists = prev.find(u => u.id === uploadedContent.id);
                            if (exists) {
                              return prev.map(u => u.id === uploadedContent.id ? uploadedContent : u);
                            }
                            return [...prev, uploadedContent];
                          });
                          enqueueSnackbar(t('onboarding.step1.snackbar.urlAdded'), { variant: 'success' });
                        }
                        
                        // Forcer la récupération des métadonnées après un délai
                        setTimeout(() => {
                          contentService.getById(uploadedContent.id)
                            .then(updatedContent => {
                              console.log("Contenu mis à jour après délai:", updatedContent);
                              console.log("STRUCTURE DE updatedContent (onSuccess) :", JSON.stringify(updatedContent, null, 2)); // Log ajouté ici aussi
                              
                              if (updatedContent.file_path) {
                                setUploadedFiles(prev => 
                                  prev.map(f => f.id === updatedContent.id ? updatedContent : f)
                                );
                              } else if (updatedContent.url) {
                                setUploadedUrls(prev => 
                                  prev.map(u => u.id === updatedContent.id ? updatedContent : u)
                                );
                              }
                              
                              // Pas besoin de recalculer ici, le useEffect s'en charge
                            })
                            .catch(err => console.error("Erreur lors de la mise à jour du contenu:", err));
                        }, 3000); // Réduit délai à 3s
                      } 
                      // --- AJOUT : Gérer le cas de la suppression ---
                      else if (actionInfo && actionInfo.action === 'delete') {
                           console.log(`Suppression détectée pour ID ${actionInfo.id} via onSuccess`);
                           // Mettre à jour l'état uploadedFiles en retirant l'élément supprimé
                           setUploadedFiles(prev => prev.filter(f => f.id !== actionInfo.id));
                           // Le useEffect dépendant de [uploadedFiles] déclenchera calculateActualCharacterCount
                      }
                      // --- FIN AJOUT ---
                    }}
                  />
                </Box>
              )}

              {/* Ajout du module pour les vidéos YouTube */}
              <Box sx={{ mb: 2, p: 2, border: '1px dashed', borderColor: 'grey.300', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('contentManager.addYoutubeTitle')}
                </Typography>
                <TextField
                  label={t('contentManager.youtubeUrlLabel')}
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  fullWidth
                  placeholder={t('onboarding.step1.youtube.placeholder')}
                  InputProps={{ startAdornment: <YouTubeIcon color="error" sx={{ mr: 1 }} /> }}
                  error={!!youtubeUploadError}
                  helperText={youtubeUploadError}
                />
                <Button
                  variant="contained"
                  onClick={handleAddYouTubeUrl}
                  disabled={youtubeUploading || !youtubeUrl.trim()}
                  sx={{ mt: 2, width: { xs: '100%', sm: 'auto' } }}
                >
                  {youtubeUploading ? <CircularProgress size={20} /> : t('contentManager.addVideoButton')}
                </Button>
              </Box>

              {/* Affichage des vidéos YouTube ajoutées */}
              {uploadedYouTube.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>{t('onboarding.step1.youtube.listTitle')}</Typography>
                  {uploadedYouTube.map(video => (
                    <Box key={video.id} sx={{ display: 'flex', alignItems: 'center', p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                      <YouTubeIcon color="error" sx={{ mr: 2 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1">{video.name}</Typography>
                        {video.status === 'awaiting_transcription' ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              {t('onboarding.step1.youtube.estimatedChars', { count: video.estimated_characters?.toLocaleString() || '4000' })}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            {t('onboarding.step1.youtube.transcriptionStatus', { status: video.source || t('common.status.completed') })}
                          </Typography>
                        )}
                      </Box>
                      <IconButton
                        onClick={() => handleDeleteYouTube(video.id)}
                        sx={{
                          p: { xs: 1.5, sm: 1 },
                          '& svg': { fontSize: { xs: 24, sm: 20 } }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Module pour scraping d'URL Web */}
              <Box sx={{ mb: 3, p: 2, border: '1px dashed', borderColor: 'grey.300', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('contentManager.addWebsiteTitle')}
                </Typography>
                <TextField
                  label={t('contentManager.websiteUrlLabel')}
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  fullWidth
                  placeholder={t('onboarding.step1.web.placeholder')}
                  InputProps={{ startAdornment: <InsertLinkIcon sx={{ mr: 1 }} /> }}
                  error={!!scrapeError}
                  helperText={scrapeError}
                />
                <Button
                  variant="contained"
                  onClick={handleScrapeUrl}
                  disabled={scrapeLoading || !scrapeUrl.trim()}
                  sx={{ mt: 2 }}
                >
                  {scrapeLoading ? <CircularProgress size={20} /> : t('onboarding.step1.web.addButton')}
                </Button>
              </Box>

              {uploadedWeb.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>{t('onboarding.step1.web.listTitle')}</Typography>
                  {uploadedWeb.map(item => (
                    <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                      <InsertLinkIcon sx={{ mr: 2 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1">{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('onboarding.step1.web.charsCount', { count: item.character_count?.toLocaleString() || '0' })}
                        </Typography>
                      </Box>
                      <IconButton onClick={() => handleDeleteWeb(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              {uploadError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {uploadError}
                </Alert>
              )}
            </Paper>
          </Box>
        );
      
      case 2: // Fine-tuning du modèle
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                {t('configManager.infoAlert')}
              </Typography>
            </Alert>

            <Typography variant="body1" paragraph>
              {t('onboarding.step2.configureTitle')}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="provider-select-label">{t('configManager.providerLabel')}</InputLabel>
                <Select
                  labelId="provider-select-label"
                  value={provider}
                  onChange={(e) => {
                    const newProvider = e.target.value;
                    setProvider(newProvider);
                    // Sélectionner automatiquement le premier modèle du nouveau fournisseur
                    if (providerModels[newProvider] && providerModels[newProvider].length > 0) {
                      setModel(providerModels[newProvider][0].id);
                    }
                  }}
                  label={t('configManager.providerLabel')}
                  disabled={createdDataset !== null}
                >
                  <MenuItem value="openai">{t('onboarding.step2.provider.openai')}</MenuItem>
                  <MenuItem value="anthropic" disabled>{t('onboarding.step2.provider.anthropicComingSoon')}</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel id="model-select-label">{t('configManager.modelLabel')}</InputLabel>
                <Select
                  labelId="model-select-label"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  label={t('configManager.modelLabel')}
                  disabled={createdDataset !== null}
                >
                  {provider && providerModels[provider] && providerModels[provider].map((modelOption) => (
                    <MenuItem
                      key={modelOption.id}
                      value={modelOption.id}
                      disabled={modelOption.name.includes("Coming soon")} // Check based on original name prop
                    >
                      {/* Use t() with default value from original name */}
                      {t(`onboarding.step2.models.${provider}.${modelOption.id}`, modelOption.name)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ mt: 3 }}>
                <TextField
                  label={t('configManager.apiKeyLabel', { providerName: provider === 'openai' ? 'OpenAI' : 'Anthropic' })}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  fullWidth
                  type="password"
                  margin="normal"
                  placeholder={t('configManager.apiKeyPlaceholder', { providerName: provider === 'openai' ? 'OpenAI' : 'Anthropic' })}
                  error={!!apiKeyError}
                  helperText={apiKeyError}
                  disabled={apiKeySaved}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setApiHelpOpen(true)}
                        edge="end"
                        aria-label={t('configManager.apiKeyHelpAriaLabel')}
                      >
                        <HelpOutlineIcon />
                      </IconButton>
                    ),
                  }}
                />
              </Box>

              {!apiKeySaved && (
                <Button
                  variant="outlined"
                  onClick={saveApiKey}
                  disabled={!apiKey || savingApiKey}
                  sx={{ mt: 2 }}
                >
                  {savingApiKey ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                  {t('onboarding.step2.validateApiKeyButton')}
                </Button>
              )}
            </Box>

            {apiKeySaved && (
              <Alert severity="success" sx={{ mt: 2, mb: 3, py: 0.5, fontSize: '0.9rem' }}>
                {t('onboarding.step2.apiKeyValidatedMessage')}
              </Alert>
            )}

            {createdDataset && (
              <Box sx={{ mt: 3 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <AlertTitle>{t('onboarding.step2.datasetCreatedTitle')}</AlertTitle>
                  {/* Use Trans for embedded <strong> tags */}
                  <Typography component="div" variant="body2">
                    <Trans i18nKey="onboarding.step2.datasetInfo.name" values={{ name: createdDataset.name }} components={{ 0: <strong /> }} />
                    <br />
                    <Trans i18nKey="onboarding.step2.datasetInfo.id" values={{ id: createdDataset.id }} components={{ 0: <strong /> }} />
                    <br />
                    <Trans i18nKey="onboarding.step2.datasetInfo.status" values={{ status: t(datasetReady ? 'common.status.ready' : 'common.status.preparing') }} components={{ 0: <strong /> }} />
                  </Typography>
                  {!datasetReady && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      <Typography variant="caption">
                        {t('onboarding.step2.datasetProcessingText')}
                      </Typography>
                    </Box>
                  )}
                </Alert>

                {datasetReady && !createdFineTuning && (
                  <Button
                    variant="contained"
                    onClick={createFineTuning}
                    disabled={creatingFineTuning}
                    sx={{ mt: 2 }}
                  >
                    {creatingFineTuning ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                    {t('datasetDetail.startFinetuningButton')}
                  </Button>
                )}

                {createdFineTuning && (
                  <Alert severity="success" sx={{ mt: 3 }}>
                    <AlertTitle>{t('newFineTuning.snackbar.launchSuccess')}</AlertTitle>
                     {/* Use Trans for embedded <strong> tags */}
                     <Typography component="div" variant="body2">
                        <Trans i18nKey="onboarding.step2.finetuningInfo.name" values={{ name: createdFineTuning.name }} components={{ 0: <strong /> }} />
                        <br />
                        <Trans i18nKey="onboarding.step2.finetuningInfo.id" values={{ id: createdFineTuning.id }} components={{ 0: <strong /> }} />
                        <br />
                        {/* Ensure status key exists in common.status */}
                        <Trans i18nKey="onboarding.step2.finetuningInfo.status" values={{ status: t(createdFineTuning.status ? `common.status.${createdFineTuning.status.toLowerCase()}` : 'common.status.pending') }} components={{ 0: <strong /> }} />
                     </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                      {t('onboarding.step2.finetuningProcessingText')}
                    </Typography>
                  </Alert>
                )}

                {fineTuningError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {fineTuningError}
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        );

      default:
        return t('common.unknownStep'); // Use translation for default case
    }
  };

  return (
    <PageTransition>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: 'background.default',
          py: 6,
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              backgroundColor: 'background.paper',
              boxShadow: (theme) => 
                theme.palette.mode === 'dark'
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                  : '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Stepper - Translate labels */}
            {activeStep < steps.length - 1 && (
              <Stepper
                activeStep={activeStep}
                alternativeLabel
                sx={{ mb: 5 }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>{/* Label is already translated via steps array */}
                  </Step>
                ))}
              </Stepper>
            )}

            {/* Contenu de l'étape - Already translated */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={stepVariants}
              >
                {getStepContent(activeStep)}
              </motion.div>
            </AnimatePresence>

            {/* Boutons de navigation - Translate button texts */}
            {activeStep < steps.length - 1 && (
              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                mt: 5,
                gap: { xs: 2, sm: 0 }
              }}>
                <Button
                  onClick={handleBack}
                  startIcon={<ArrowBackIcon />}
                  sx={{ borderRadius: 3 }}
                  disabled={activeStep === 0 || uploading || creatingProject || savingApiKey || isCompleting ||
                            ([...uploadedFiles, ...uploadedUrls, ...uploadedYouTube, ...uploadedWeb].some(c => c.status !== 'completed' && c.status !== 'error'))}
                >
                  {t('common.backButton')}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                    endIcon={activeStep === steps.length - 2 ? null : <ArrowForwardIcon />}
                    startIcon={
                        (activeStep === 0 && generatingSystemContent) || (activeStep === 2 && isCompleting)
                        ? <CircularProgress size={20} color="inherit" />
                        : null
                    }
                  sx={{ borderRadius: 3 }}
                    disabled={
                      uploading ||
                      creatingProject ||
                      savingApiKey ||
                      isCompleting ||
                      generatingSystemContent || // Désactiver pendant la génération auto
                      (activeStep === 1 && [...uploadedFiles, ...uploadedUrls, ...uploadedYouTube, ...uploadedWeb].some(c =>
                        !(c.type === 'youtube' && c.status === 'awaiting_transcription') &&
                        c.status !== 'completed' &&
                        c.status !== 'error'
                      )) ||
                      (activeStep === 2 && !apiKeySaved)
                    }
                >
                    {activeStep === steps.length - 2
                      ? (isCompleting ? t('payment.processingButton') : t('onboarding.finishButton'))
                      : t('common.nextButton')}
                </Button>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
      {/* Popup d'aide pour la clé API - Translate dialog content */}
      <Dialog
        open={apiHelpOpen}
        onClose={() => setApiHelpOpen(false)}
        maxWidth="md"
      >
        <DialogTitle>
          {t('configManager.apiKeyHelpDialog.title', { providerName: provider === 'openai' ? 'OpenAI' : 'Anthropic' })}
          <IconButton
            aria-label={t('common.close')} // Translate aria-label
            onClick={() => setApiHelpOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>
            {t('configManager.apiKeyHelpDialog.whyTitle')}
          </Typography>
          <Typography paragraph>
            {/* Use translation key for paragraph */}
            {t('onboarding.apiKeyHelpDialog.whyPara1', { providerName: provider === 'openai' ? 'OpenAI' : 'Anthropic' })}
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
              {/* Use translation key for list item */}
              <ListItemText primary={t('onboarding.apiKeyHelpDialog.whyItem1')} />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
              {/* Use translation key for list item */}
              <ListItemText primary={t('onboarding.apiKeyHelpDialog.whyItem2')} />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
              {/* Use translation key for list item */}
              <ListItemText primary={t('onboarding.apiKeyHelpDialog.whyItem3')} />
            </ListItem>
          </List>

          {provider === 'openai' && (
            <>
              <Typography variant="h6" gutterBottom>
                {/* Use translation key for title */}
                {t('onboarding.apiKeyHelpDialog.whereOpenAITitle')}
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><Typography variant="body2" color="primary">1</Typography></ListItemIcon>
                  <ListItemText
                    primary={t('configManager.apiKeyHelpDialog.whereOpenAI1')}
                    secondary={<Link href="https://platform.openai.com/login" target="_blank" rel="noopener">https://platform.openai.com/login</Link>}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Typography variant="body2" color="primary">2</Typography></ListItemIcon>
                  <ListItemText
                    primary={t('configManager.apiKeyHelpDialog.whereOpenAI2')}
                    secondary={t('configManager.apiKeyHelpDialog.whereOpenAI2Secondary')} // Added separate key for secondary text
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Typography variant="body2" color="primary">3</Typography></ListItemIcon>
                  <ListItemText
                    primary={t('configManager.apiKeyHelpDialog.whereOpenAI3')}
                    secondary={t('configManager.apiKeyHelpDialog.whereOpenAI3Secondary')}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Typography variant="body2" color="primary">4</Typography></ListItemIcon>
                  <ListItemText
                    primary={t('configManager.apiKeyHelpDialog.whereOpenAICredits')}
                    secondary={
                        <Trans
                          i18nKey="configManager.apiKeyHelpDialog.whereOpenAICreditsBillingLink"
                          components={{ 0: <Link href="https://platform.openai.com/account/billing/overview" target="_blank" rel="noopener" /> }}
                        />
                    }
                  />
                </ListItem>
              </List>
            </>
          )}

          <Alert severity="warning" sx={{ mt: 2 }}>
            <AlertTitle>{t('common.important')}</AlertTitle>
            {/* Use translation key for security paragraph */}
            {t('onboarding.apiKeyHelpDialog.securityPara')}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApiHelpOpen(false)}>{t('common.close')}</Button>
          {provider === 'openai' && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                window.open('https://platform.openai.com/api-keys', '_blank');
              }}
            >
              {/* Use translation key for button */}
              {t('onboarding.apiKeyHelpDialog.goToOpenAIButton')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </PageTransition>
  );
};

export default OnboardingPage; 