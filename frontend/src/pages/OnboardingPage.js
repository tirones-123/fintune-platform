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
  scrapingService
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

// Étapes de l'onboarding
const steps = [
  'Définir votre assistant',
  'Importer du contenu',
  'Fine-tuner un modèle',
  'Terminé'
];

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

// Descriptions des niveaux de qualité
const QUALITY_DESCRIPTIONS = {
  insufficient: "Données insuffisantes: Le modèle aura du mal à générer des réponses cohérentes.",
  minimal: "Qualité minimale: Réponses basiques avec contexte limité.",
  good: "Bonne qualité: Réponses précises et bien contextualisées.",
  optimal: "Qualité optimale: Réponses détaillées et très personnalisées.",
  excessive: "Données au-delà de l'optimal: Les bénéfices supplémentaires peuvent diminuer."
};

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
  
  // Données du projet (créé automatiquement)
  const [projectName] = useState("Mon premier projet");
  const [projectDescription] = useState("Projet créé pendant l'onboarding");
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
  
  // Données du dataset (créé automatiquement)
  const [datasetName, setDatasetName] = useState("Dataset par défaut");
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
      { id: 'gpt-4o', name: 'GPT-4o (Modèle le plus performant et récent)' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Bon rapport qualité/prix)' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Économique, bonne performance)' },
      { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini (Version compacte de GPT-4.1)' },
      { id: 'gpt-4.1', name: 'GPT-4.1 (Haute performance, plus coûteux)' },
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
        name: projectName,
        description: projectDescription
      };
      
      // Appel API pour créer le projet
      const response = await projectService.create(projectData);
      
      setCreatedProject(response);
      enqueueSnackbar('Projet créé automatiquement', { variant: 'success' });
      return true;
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      setProjectError(error.message || "Erreur lors de la création du projet");
      enqueueSnackbar(`Erreur: ${error.message || "Échec de la création du projet"}`, { variant: 'error' });
      return false;
    } finally {
      setCreatingProject(false);
    }
  };

  // Fonction pour générer le system content à partir de l'entrée utilisateur
  const generateSystemContent = async () => {
    if (!assistantPurpose.trim()) {
      setSystemContentError("Veuillez décrire le but de votre assistant");
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
        throw new Error(errorData.detail || "Erreur lors de la génération du system content");
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
      
      enqueueSnackbar('System content généré avec succès', { variant: 'success' });
      return true;
    } catch (error) {
      console.error('Erreur lors de la génération du system content:', error);
      setSystemContentError(error.message || "Erreur lors de la génération du system content");
      enqueueSnackbar(`Erreur: ${error.message || "Échec de la génération du system content"}`, { variant: 'error' });
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
      
      enqueueSnackbar('Contenu supprimé avec succès', { variant: 'success' });
    } catch (error) {
      console.error('Erreur lors de la suppression du contenu:', error);
      enqueueSnackbar(`Erreur: ${error.message || "Échec de la suppression"}`, { variant: 'error' });
    }
  };

  // Fonction pour ajouter une clé API
  const saveApiKey = async () => {
    if (!apiKey) {
      setApiKeyError("Une clé API est requise pour le fine-tuning");
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
        setApiKeyError(message || "La clé API n'est pas valide");
        return false;
      }
      
      if (credits === 0) {
        setApiKeyError("Votre compte ne dispose pas de crédits suffisants pour le fine-tuning. Veuillez recharger votre compte API.");
        return false;
      }
      
      // Si tout est OK, sauvegarder la clé
      await apiKeyService.addKey(provider, apiKey);
      
      setApiKeySaved(true);
      enqueueSnackbar('Clé API validée avec succès', { variant: 'success' });
      return true;
    } catch (error) {
      console.error('Erreur lors de la validation de la clé API:', error);
      
      // Messages d'erreur spécifiques selon le type d'erreur
      if (error.response) {
        setApiKeyError(error.response.data?.detail || "Erreur lors de la vérification de la clé API");
      } else {
        setApiKeyError("Erreur de connexion. Veuillez réessayer.");
      }
      
      enqueueSnackbar(`Erreur: ${error.message || "Échec de la validation de la clé API"}`, { variant: 'error' });
      return false;
    } finally {
      setSavingApiKey(false);
    }
  };
  
  // Fonction pour créer un dataset
  const createDataset = async () => {
    if (!createdProject) {
      setDatasetError("Le projet n'a pas encore été créé");
      return false;
    }
    
    const allContents = [...uploadedFiles, ...uploadedUrls, ...uploadedYouTube, ...uploadedWeb];
    if (allContents.length === 0) {
      setDatasetError("Veuillez d'abord ajouter du contenu");
      return false;
    }
    
    setCreatingDataset(true);
    setDatasetError(null);
    
    try {
      const datasetData = {
        name: datasetName,
        project_id: createdProject.id,
        content_ids: allContents.map(content => content.id),
        model: 'gpt-3.5-turbo',
        description: `Dataset généré automatiquement pendant l'onboarding`,
        system_content: systemContent || "You are a helpful assistant."
      };
      
      // Appel API pour créer le dataset
      const response = await datasetService.create(datasetData);
      
      setCreatedDataset(response);
      enqueueSnackbar('Dataset créé avec succès', { variant: 'success' });
      
      // Commencer à vérifier si le dataset est prêt
      setDatasetLoading(true);
      setTimeout(() => checkDatasetStatus(response.id), 2000);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la création du dataset:', error);
      setDatasetError(error.message || "Erreur lors de la création du dataset");
      enqueueSnackbar(`Erreur: ${error.message || "Échec de la création du dataset"}`, { variant: 'error' });
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
        enqueueSnackbar('Dataset prêt pour le fine-tuning', { variant: 'success' });

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
        setDatasetError(`Erreur lors de la génération du dataset: ${dataset.error_message || 'Erreur inconnue'}`);
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
      setFineTuningError("Veuillez d'abord créer un dataset");
      return false;
    }
    
    setCreatingFineTuning(true);
    setFineTuningError(null);
    
    try {
      const fineTuningData = {
        name: `Fine-tuning de ${datasetName}`,
        dataset_id: createdDataset.id,
        model: model,
        provider: provider,
        hyperparameters: {
          n_epochs: 3
        }
      };
      
      // Appel API pour créer le fine-tuning
      const response = await fineTuningService.create(fineTuningData);
      
      setCreatedFineTuning(response);
      enqueueSnackbar('Fine-tuning lancé avec succès', { variant: 'success' });
      return true;
    } catch (error) {
      console.error('Erreur lors de la création du fine-tuning:', error);
      setFineTuningError(error.message || "Erreur lors de la création du fine-tuning");
      enqueueSnackbar(`Erreur: ${error.message || "Échec du lancement du fine-tuning"}`, { variant: 'error' });
      return false;
    } finally {
      setCreatingFineTuning(false);
    }
  };

  // Fonction pour traiter l'étape suivante
  const handleNext = async () => {
    // Vérifier s'il y a des actions à effectuer selon l'étape
    switch (activeStep) {
      case 0: // Après étape définition de l'assistant
        // Générer le system content si ce n'est pas déjà fait
        if (!systemContent) {
          const success = await generateSystemContent();
          if (!success) return;
        }
        break;
      
      case 1: // Après étape import de contenu
        // Vérifier s'il y a du contenu
        if (uploadedFiles.length === 0 && uploadedUrls.length === 0 && uploadedYouTube.length === 0 && uploadedWeb.length === 0) {
          setUploadError("Veuillez ajouter au moins un fichier, une vidéo YouTube ou une URL web");
          return;
        }
        break;
      
      case 2: // Après étape fine-tuning
        // Vérifier d'abord la clé API
        const apiKeySuccess = await saveApiKey();
        if (!apiKeySuccess) return;
        
        // Lancer completeOnboarding pour rediriger vers Stripe
        await completeOnboarding();
        // Ne pas continuer après completeOnboarding car l'utilisateur est redirigé vers Stripe
        return;
    }
    
    // Si tout s'est bien passé, avancer à l'étape suivante
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Fonction pour revenir à l'étape précédente
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Fonction pour finaliser l'onboarding et lancer le fine-tuning
  const completeOnboarding = async () => {
    setIsCompleting(true);
    setCompletionError(null);
    setProcessingFineTuning(true);
    
    // Déclaration des variables en dehors des blocs pour qu'elles soient accessibles partout
    let characterCount = 0;
    let pendingTranscriptions = [];
    
    try {
      // 1. Mettre à jour le profil utilisateur immédiatement
      const payload = {
        email: user.email,
        name: user.name,
        is_active: user.is_active,
        has_completed_onboarding: true,
      };

      console.log("Mise à jour de l'utilisateur avec payload:", payload);
      const updatedUser = await updateUser(payload);
      console.log("Résultat de la mise à jour:", updatedUser);
      
      // 2. Redirection vers la page de paiement ou traitement gratuit
      if (updatedUser && updatedUser.has_completed_onboarding) {
        try {
          // Récupérer le nombre de caractères (réel ou estimé)
          characterCount = isEstimated ? estimateCharacterCount() : actualCharacterCount;
          console.log(`Nombre de caractères à facturer: ${characterCount}`);
          
          // Sauvegarder la liste des vidéos YouTube en attente de transcription complète
          pendingTranscriptions = uploadedYouTube
            .filter(c => c.status === 'awaiting_transcription')
            .map(c => ({
              id: c.id, 
              url: c.url,
              video_id: c.metadata?.video_id || c.video_id,
              estimated_characters: c.estimated_characters
            }));
          
          // Calculer le prix en USD pour afficher des informations à l'utilisateur
          const billableCharacters = Math.max(0, characterCount - FREE_CHARACTER_QUOTA);
          const priceUSD = billableCharacters * PRICE_PER_CHARACTER;
          const estimatedPriceEUR = priceUSD * 0.93; // Conversion approximative USD -> EUR
          
          console.log(`Prix estimé: $${priceUSD.toFixed(2)} (~ €${estimatedPriceEUR.toFixed(2)})`);
          
          // Informer l'utilisateur si le traitement sera gratuit
          if (billableCharacters === 0 || estimatedPriceEUR < MIN_STRIPE_AMOUNT_EUR) {
            console.log(`Montant trop faible (${estimatedPriceEUR.toFixed(2)}€ < ${MIN_STRIPE_AMOUNT_EUR}€), sera traité gratuitement`);
            
            // On peut faire un toast de notification mais on continue le processus standard
            // car le backend gère déjà automatiquement les cas gratuits
            enqueueSnackbar("Votre contenu est en-dessous du seuil de facturation et sera traité gratuitement!", 
              { variant: 'success', autoHideDuration: 3000 });
          }
          
          // Appeler l'endpoint standard - le backend gèrera automatiquement
          // si c'est gratuit (< 10,000 caractères) ou si le montant est trop petit pour Stripe
          console.log("Création de la session d'onboarding");
          const session = await api.post('/api/checkout/create-onboarding-session', {
            character_count: characterCount,
            pending_transcriptions: pendingTranscriptions,
            dataset_name: datasetName,
            provider: provider,
            model: model,
            system_content: systemContent
          });
          console.log("Session créée avec succès:", session.data);
          
          // Si l'URL contient "dashboard", c'est que le backend a décidé que c'était gratuit
          // et nous a directement redirigé vers le tableau de bord
          if (session.data && session.data.checkout_url && session.data.checkout_url.includes('/dashboard')) {
            console.log("Traitement gratuit détecté, redirection vers le dashboard");
            enqueueSnackbar("Votre assistant est en cours de création!", { variant: 'success' });
            window.location.href = session.data.checkout_url;
          } 
          // Sinon c'est une redirection vers la page de paiement Stripe
          else if (session.data && session.data.checkout_url) {
            console.log("Redirection vers la page de paiement Stripe:", session.data.checkout_url);
            window.location.href = session.data.checkout_url;
          } 
          else {
            console.error("URL de redirection non reçue dans la session:", session.data);
            setCompletionError("Erreur de redirection: URL non disponible");
            setProcessingFineTuning(false);
            setIsCompleting(false);
          }
        } catch (checkoutError) {
          console.error('Erreur lors de la création de la session:', checkoutError);
          if (checkoutError.response) {
            console.error('Détails de la réponse d\'erreur:', {
              status: checkoutError.response.status,
              data: checkoutError.response.data,
              headers: checkoutError.response.headers
            });
            
            // Si l'erreur est "amount_too_small", informer l'utilisateur
            if (checkoutError.response.data && 
                checkoutError.response.data.detail && 
                checkoutError.response.data.detail.includes("amount_too_small")) {
              
              setCompletionError("Le montant est trop faible pour être traité par Stripe. Veuillez ajouter plus de contenu ou contacter le support.");
            } else {
              setCompletionError(`Erreur lors de la création de la session: ${checkoutError.message}`);
            }
          } else {
            setCompletionError(`Erreur de connexion: ${checkoutError.message}`);
          }
          setProcessingFineTuning(false);
          setIsCompleting(false);
        }
      } else {
        console.error("La mise à jour de l'état d'onboarding a échoué. Données reçues:", JSON.stringify(updatedUser, null, 2));
        setCompletionError("L'état d'onboarding n'a pas pu être mis à jour correctement");
        setProcessingFineTuning(false);
        setIsCompleting(false);
      }
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      setCompletionError(error.message || "Erreur lors de la finalisation");
      setProcessingFineTuning(false);
      setIsCompleting(false);
      if (error.message === 'Not authenticated') {
        navigate('/login');
      }
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
        totalEstimate += 1500; // ~10 minutes estimées
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
    
    console.log("Calcul du nombre réel de caractères...");
    console.log("Fichiers:", uploadedFiles);
    console.log("URLs:", uploadedUrls);
    console.log("YouTube Ref:", youtubeVideosRef.current);
    console.log("Web Ref:", webSitesRef.current);
    
    // Compter les caractères des fichiers dont les métadonnées sont disponibles
    uploadedFiles.forEach(file => {
      console.log(`Fichier ${file.id} (${file.name}) - status: ${file.status}, métadonnées:`, file.content_metadata);
      if (file.content_metadata && file.content_metadata.character_count) {
        const fileChars = parseInt(file.content_metadata.character_count);
        console.log(`  → Caractères exacts: ${fileChars}`);
        actualCount += fileChars;
      } else if (file.status === 'completed') {
        // Si le fichier est marqué comme traité mais n'a pas de métadonnées de comptage, c'est anormal
        console.log(`  → ANOMALIE: Statut completed mais pas de métadonnées de caractères`);
        hasAllCounts = false;
      } else {
        console.log(`  → Statut: ${file.status}, pas de comptage disponible`);
        // Forcer un rafraîchissement du fichier pour tenter d'obtenir les données à jour
        if (file.status !== 'error') {
          setTimeout(() => {
            contentService.getById(file.id)
              .then(updatedFile => {
                console.log(`Rafraîchissement des données pour ${file.id}:`, updatedFile);
                setUploadedFiles(prev => 
                  prev.map(f => f.id === updatedFile.id ? updatedFile : f)
                );
                // Recalculer après mise à jour
                setTimeout(() => calculateActualCharacterCount(), 500);
              })
              .catch(err => console.error(`Erreur lors du rafraîchissement du fichier ${file.id}:`, err));
          }, 1000);
        }
        hasAllCounts = false;
      }
    });
    
    // De même pour les URLs
    uploadedUrls.forEach(url => {
      console.log(`URL ${url.id} (${url.name}) - status: ${url.status}, métadonnées:`, url.content_metadata);
      
      // Cas 1: Si les métadonnées contiennent directement le nombre de caractères
      if (url.content_metadata && url.content_metadata.character_count) {
        const urlChars = parseInt(url.content_metadata.character_count);
        console.log(`  → Caractères exacts: ${urlChars}`);
        actualCount += urlChars;
      } 
      // Cas 2: Pour les vidéos YouTube avec durée connue mais sans comptage direct
      else if ((url.type === 'youtube' || url.url?.includes('youtube.com') || url.url?.includes('youtu.be'))) {
        // Calcul basé sur 900 caractères par minute
        const durationMinutes = parseInt(url.content_metadata?.duration_seconds || 0) / 60;
        const youtubeChars = Math.round(durationMinutes * 900);
        console.log(`  → YouTube complété: ${durationMinutes.toFixed(1)} minutes = ${youtubeChars} caractères (900 car/min)`);
        actualCount += youtubeChars;
      }
      // Cas 3: Contenu "completed" mais sans métadonnées
      else if (url.status === 'completed') {
        console.log(`  → ANOMALIE: Statut completed mais pas de métadonnées de caractères`);
        hasAllCounts = false;
      } 
      // Cas 4: Contenu en cours de traitement ou en erreur
      else {
        console.log(`  → Statut: ${url.status}, pas de comptage disponible`);
        // Forcer un rafraîchissement de l'URL pour tenter d'obtenir les données à jour
        if (url.status !== 'error') {
          setTimeout(() => {
            contentService.getById(url.id)
              .then(updatedUrl => {
                console.log(`Rafraîchissement des données pour ${url.id}:`, updatedUrl);
                setUploadedUrls(prev => 
                  prev.map(u => u.id === updatedUrl.id ? updatedUrl : u)
                );
                // Recalculer après mise à jour
                setTimeout(() => calculateActualCharacterCount(), 500);
              })
              .catch(err => console.error(`Erreur lors du rafraîchissement de l'URL ${url.id}:`, err));
          }, 1000);
        }
        hasAllCounts = false;
      }
    });
    
    // Process YouTube videos - utiliser la référence directe plutôt que l'état
    youtubeVideosRef.current.forEach(video => {
      console.log(`Vidéo YouTube ${video.id} (${video.name}) - status: ${video.status}, caractères estimés:`, video.estimated_characters);
      if (video.estimated_characters) {
        const ytChars = parseInt(video.estimated_characters);
        console.log(`  → Caractères estimés YouTube: ${ytChars}`);
        actualCount += ytChars;
      } else if (video.status === 'awaiting_transcription') {
        // Estimation par défaut pour les vidéos en attente sans estimation
        const defaultEstimate = 1500; // ~10 minutes par défaut
        console.log(`  → Pas d'estimation, utilisation de la valeur par défaut: ${defaultEstimate}`);
        actualCount += defaultEstimate;
        hasAllCounts = false;
      } else {
        console.log(`  → Statut: ${video.status}, pas de comptage disponible`);
        hasAllCounts = false;
      }
    });
    
    // Process scraped websites - utiliser la référence directe plutôt que l'état
    webSitesRef.current.forEach(site => {
      console.log(`Site web ${site.id} (${site.name}) - status: ${site.status}, métadonnées:`, site);
      if (site.character_count) {
        const webChars = parseInt(site.character_count);
        console.log(`  → Caractères exacts site web: ${webChars}`);
        actualCount += webChars;
      } else {
        console.log(`  → Statut: ${site.status}, pas de comptage disponible`);
        hasAllCounts = false;
      }
    });
    
    console.log(`Total de caractères: ${actualCount}`);
    console.log(`Est estimé: ${!hasAllCounts || (uploadedFiles.length === 0 && uploadedUrls.length === 0 && youtubeVideosRef.current.length === 0 && webSitesRef.current.length === 0)}`);
    
    // Mettre à jour l'état et la référence
    setActualCharacterCount(actualCount);
    totalCharCountRef.current = actualCount;
    setIsEstimated(!hasAllCounts || (uploadedFiles.length === 0 && uploadedUrls.length === 0 && youtubeVideosRef.current.length === 0 && webSitesRef.current.length === 0));
    
    return actualCount;
  };
  
  // Mettre à jour le comptage réel chaque fois que les fichiers ou URLs changent
  useEffect(() => {
    calculateActualCharacterCount();
  }, []);  // On le fait seulement au chargement initial, puis les rafraîchissements sont gérés dans la fonction

  // Rafraîchir régulièrement le comptage des caractères et ajouter une dépendance explicite
  // pour les objets uploadedYouTube et uploadedWeb
  useEffect(() => {
    console.log("Effet déclenché - État des uploads actualisé");
    
    // Recalcul forcé à chaque changement des tableaux uploadedYouTube et uploadedWeb
    calculateActualCharacterCount();
    
    // Vérifier s'il y a des fichiers ou URLs en cours de traitement
    const hasProcessingContent = [...uploadedFiles, ...uploadedUrls, ...uploadedYouTube, ...uploadedWeb].some(
      content => content.status !== 'completed' && content.status !== 'error' && content.status !== 'awaiting_transcription'
    );
    
    if (hasProcessingContent) {
      const intervalId = setInterval(() => {
        calculateActualCharacterCount();
      }, 5000);  // Rafraîchir toutes les 5 secondes
      
      return () => clearInterval(intervalId);
    }
  }, [uploadedFiles, uploadedUrls, uploadedYouTube, uploadedWeb]);  // Dépendance explicite sur tous les tableaux

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
        totalCount += 1500; // Valeur par défaut pour 10 minutes
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
      setYoutubeUploadError("Veuillez d'abord créer un projet");
      return;
    }
    
    setYoutubeUploading(true);
    setYoutubeUploadError(null);
    
    // Extraire l'ID de la vidéo YouTube (déplacé en dehors du try/catch)
    const youtubeLinkRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = youtubeUrl.match(youtubeLinkRegex);
    const videoId = match && match[1];
    
    if (!videoId) {
      setYoutubeUploadError("URL YouTube invalide. Veuillez fournir une URL valide.");
      setYoutubeUploading(false);
      return;
    }
    
    try {
      // Récupérer les informations réelles de la vidéo via RapidAPI
      console.log("Récupération des détails de la vidéo via RapidAPI pour", videoId);
      
      const options = {
        method: 'GET',
        url: 'https://youtube-media-downloader.p.rapidapi.com/v2/video/details',
        params: {
          videoId: videoId
        },
        headers: {
          // Clé RapidAPI mise à jour avec une nouvelle clé (optionnel)
          'X-RapidAPI-Key': '9144fffaabmsh319ba65e73a3d86p164f35jsn097fa4509ee8',
          'X-RapidAPI-Host': 'youtube-media-downloader.p.rapidapi.com'
        }
      };
      
      const rapidApiResponse = await axios.request(options);
      console.log("Réponse RapidAPI:", rapidApiResponse.data);
      
      // Extraire les informations utiles
      const videoInfo = rapidApiResponse.data;
      const videoTitle = videoInfo.title || `Vidéo YouTube - ${new Date().toLocaleString()}`;
      const durationSeconds = parseInt(videoInfo.lengthSeconds) || parseInt(videoInfo.length_seconds) || 600; // Fallback à 10 minutes si non disponible
      const durationMinutes = Math.round(durationSeconds / 60);
      
      // Calculer le nombre de caractères (150 caractères par minute)
      const estimatedCharacters = Math.round((durationSeconds / 60) * 150);
      console.log('Calculated duration:', durationSeconds, 'seconds; Estimated characters:', estimatedCharacters);
      
      // Créer l'objet au format attendu par le backend
      const urlContent = {
        project_id: createdProject.id,
        url: youtubeUrl,
        name: videoTitle,
        type: 'youtube',
        description: `Vidéo YouTube en attente de transcription. Durée: ${durationMinutes} minutes.`
      };
      
      // Ajouter l'URL avec le format attendu par le backend
      const response = await contentService.addUrl(urlContent);
      
      // Créer le nouvel objet de vidéo YouTube
      const newYouTubeVideo = {
        ...response,
        url: youtubeUrl,
        source: `Durée réelle: ${durationMinutes} min`,
        estimated_characters: estimatedCharacters,
        status: 'awaiting_transcription'
      };
      
      // MÉTHODE FIABLE : Mettre à jour à la fois l'état React et la référence
      // 1. Ajouter à la référence (synchrône, toujours fiable)
      youtubeVideosRef.current.push(newYouTubeVideo);
      
      // 2. Mettre à jour l'état React (peut être asynchrone, moins fiable)
      setUploadedYouTube([...youtubeVideosRef.current]);
      
      // 3. Mettre à jour directement le compteur de référence
      totalCharCountRef.current += estimatedCharacters;
      
      // 4. Mettre à jour l'état visible du compteur
      setActualCharacterCount(totalCharCountRef.current);
      
      // Réinitialiser le champ
      setYoutubeUrl('');
      
      // Log détaillé pour le débogage
      console.log("AJOUT VIDÉO YOUTUBE - ÉTAT ACTUEL:", {
        nouvelleVideo: newYouTubeVideo,
        totalYouTube: youtubeVideosRef.current.length,
        characCount: totalCharCountRef.current
      });
      
      enqueueSnackbar(`URL YouTube ajoutée: "${videoTitle}" (~${estimatedCharacters} caractères basés sur ${durationMinutes} min)`, { variant: 'success' });
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'URL YouTube:', error);
      // Fallback à l'estimation fixe en cas d'erreur avec RapidAPI
      try {
        // Si RapidAPI a échoué, on utilise une estimation fixe comme solution de secours
        const estimatedDuration = 600; // 10 minutes par défaut
        const durationMinutes = Math.round(estimatedDuration / 60);
        const estimatedCharacters = Math.round((estimatedDuration / 60) * 150);
        
        console.log("Utilisation d'une estimation fixe car RapidAPI a échoué");
        
        const urlContent = {
          project_id: createdProject.id,
          url: youtubeUrl,
          name: `Vidéo YouTube - ${new Date().toLocaleString()}`,
          type: 'youtube',
          description: `Vidéo YouTube en attente de transcription. Durée estimée: ${durationMinutes} minutes.`
        };
        
        const response = await contentService.addUrl(urlContent);
        
        // Créer le nouvel objet de vidéo YouTube
        const newYouTubeVideo = {
          ...response,
          url: youtubeUrl,
          source: `Durée estimée: ${durationMinutes} min`,
          estimated_characters: estimatedCharacters,
          status: 'awaiting_transcription'
        };
        
        // MÉTHODE FIABLE : Mettre à jour à la fois l'état React et la référence
        // 1. Ajouter à la référence (synchrône, toujours fiable)
        youtubeVideosRef.current.push(newYouTubeVideo);
        
        // 2. Mettre à jour l'état React (peut être asynchrone, moins fiable)
        setUploadedYouTube([...youtubeVideosRef.current]);
        
        // 3. Mettre à jour directement le compteur de référence
        totalCharCountRef.current += estimatedCharacters;
        
        // 4. Mettre à jour l'état visible du compteur
        setActualCharacterCount(totalCharCountRef.current);
        
        // Réinitialiser le champ
        setYoutubeUrl('');
        
        // Log détaillé pour le débogage
        console.log("AJOUT VIDÉO YOUTUBE (FALLBACK) - ÉTAT ACTUEL:", {
          nouvelleVideo: newYouTubeVideo,
          totalYouTube: youtubeVideosRef.current.length,
          characCount: totalCharCountRef.current
        });
        
        enqueueSnackbar(`URL YouTube ajoutée avec durée estimée (~${estimatedCharacters} caractères)`, { variant: 'success' });
        
      } catch (fallbackError) {
        console.error('Erreur lors du fallback:', fallbackError);
        setYoutubeUploadError("Erreur lors de l'ajout de l'URL YouTube, même avec estimation par défaut");
      }
    } finally {
      setYoutubeUploading(false);
    }
  };

  // Fonction pour scraper une URL Web - mise à jour avec le même style robuste
  const handleScrapeUrl = async () => {
    if (!scrapeUrl.trim() || scrapeLoading) return;
    if (!createdProject) {
      setScrapeError("Veuillez d'abord créer un projet");
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
        name: scrapedData.title || `Contenu web - ${new Date().toLocaleString()}`,
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
      
      enqueueSnackbar(`URL Web ajoutée (${characterCount} caractères)`, { variant: 'success' });
      
    } catch (error) {
      console.error('Erreur lors du scraping de l\'URL Web:', error);
      setScrapeError(error.message || 'Erreur lors du scraping de l\'URL Web');
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
    const charactersToRemove = video.estimated_characters || 1500;
    
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
        enqueueSnackbar("Vidéo YouTube supprimée avec succès", { variant: 'success' });
      })
      .catch(err => {
        console.error("Erreur lors de la suppression de la vidéo YouTube:", err);
        enqueueSnackbar("Erreur lors de la suppression de la vidéo", { variant: 'error' });
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
        enqueueSnackbar("Site web supprimé avec succès", { variant: 'success' });
      })
      .catch(err => {
        console.error("Erreur lors de la suppression du site web:", err);
        enqueueSnackbar("Erreur lors de la suppression du site", { variant: 'error' });
      });
  };

  // Contenu des étapes
  const getStepContent = (step) => {
    switch (step) {
      case 0: // Définition de l'assistant
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  backgroundColor: 'success.main',
                  mr: 2,
                }}
              >
                <PsychologyIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Définir votre assistant
              </Typography>
            </Box>
            
            <Typography variant="body1" paragraph>
              Décrivez l'objectif et le comportement de l'assistant que vous souhaitez fine-tuner.
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Cette description sera utilisée pour générer un "system prompt" optimisé que votre modèle 
                utilisera comme base de personnalité et de connaissances.
              </Typography>
            </Alert>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Objectif de votre assistant"
                value={assistantPurpose}
                onChange={(e) => setAssistantPurpose(e.target.value)}
                multiline
                rows={4}
                placeholder="Exemple : Un assistant spécialisé dans les énergies renouvelables qui peut expliquer les technologies solaires et éoliennes avec des termes simples. Il doit être capable de répondre aux questions sur les coûts, l'installation et la rentabilité."
                error={!!systemContentError}
                helperText={systemContentError}
              />
              <FormHelperText>
                Soyez précis sur le domaine d'expertise, le ton à adopter et les capacités souhaitées.
              </FormHelperText>
            </FormControl>
            
            {systemContent && (
              <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  System Prompt généré
                </Typography>
                <Typography variant="body2" sx={{ 
                  p: 2, 
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  fontFamily: 'monospace'
                }}>
                  {systemContent}
                </Typography>
                
                {fineTuningCategory && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Catégorie de fine-tuning détectée
                    </Typography>
                    <Chip 
                      label={fineTuningCategory} 
                      color="primary" 
                      variant="outlined" 
                      sx={{ mr: 1 }}
                    />
                  </Box>
                )}
                
                {minCharactersRecommended > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Recommandation
                    </Typography>
                    <Alert severity="info" sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        Pour ce type d'assistant, nous recommandons un minimum de <strong>{minCharactersRecommended.toLocaleString()}</strong> caractères dans votre dataset d'entraînement.
                      </Typography>
                    </Alert>
                  </Box>
                )}
              </Paper>
            )}
            
            <Button
              variant="contained"
              onClick={generateSystemContent}
              disabled={generatingSystemContent || !assistantPurpose.trim()}
              startIcon={generatingSystemContent ? <CircularProgress size={20} /> : null}
              sx={{ mt: 2 }}
            >
              {generatingSystemContent ? 'Génération en cours...' : systemContent ? 'Regénérer' : 'Générer le system prompt'}
            </Button>
          </Box>
        );
      
      case 1: // Import de contenu
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  backgroundColor: 'info.main',
                  mr: 2,
                }}
              >
                <CloudUploadIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Contenu d'entraînement
              </Typography>
            </Box>
            
            {/* Estimation des caractères et du coût - version simplifiée */}
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
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {isEstimated ? "Estimation du nombre de caractères dans vos contenus" : "Comptage exact des caractères"}
                {(uploadedFiles.length > 0 || uploadedUrls.length > 0 || uploadedYouTube.length > 0 || uploadedWeb.length > 0) ? 
                  ` (${[...uploadedFiles, ...uploadedUrls, ...uploadedYouTube, ...uploadedWeb].filter(c => c.status === 'completed' || c.status === 'awaiting_transcription').length}/${uploadedFiles.length + uploadedUrls.length + uploadedYouTube.length + uploadedWeb.length} fichiers traités)` 
                  : ""}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {isEstimated ? (
                      <>Caractères estimés: <strong>{estimateCharacterCount().toLocaleString()}</strong> 
                        {actualCharacterCount > 0 && <>(dont {actualCharacterCount.toLocaleString()} comptés)</>}
                      </>
                    ) : (
                      <>Caractères comptés: <strong>{actualCharacterCount.toLocaleString()}</strong></>
                    )}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Coût estimé: <strong>{(isEstimated ? estimateCharacterCount() : actualCharacterCount) <= FREE_CHARACTER_QUOTA ? 'Gratuit' : `$${getEstimatedCost(isEstimated ? estimateCharacterCount() : actualCharacterCount).toFixed(2)}`}</strong>
                  </Typography>
                </Box>
              </Box>
              
              {/* Comparaison avec le minimum recommandé */}
              {minCharactersRecommended > 0 && (
                <Box sx={{ mt: 1, width: '100%', maxWidth: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium" color="text.primary">
                      Progression de votre dataset
                    </Typography>
                    <Typography variant="body2" color="primary.main" fontWeight="medium">
                      {(isEstimated ? estimateCharacterCount() : actualCharacterCount).toLocaleString()} caractères
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
                      <Tooltip title="Crédits gratuits inclus" arrow placement="top">
                        <Box>
                          <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                            10 000 car.
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                    
                    {/* Min */}
                    <Box sx={{ position: 'absolute', left: '50%', top: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateX(-50%)' }}>
                      <Box sx={{ width: 2, height: 12, bgcolor: 'warning.main' }} />
                      <Tooltip title="Minimum recommandé pour votre objectif d'entraînement" arrow placement="top">
                        <Box>
                          <Typography variant="caption" sx={{ mt: 0.5, color: 'warning.main', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            Min: {minCharactersRecommended ? minCharactersRecommended.toLocaleString() : '0'}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                    
                    {/* Optimal */}
                    <Box sx={{ position: 'absolute', left: `${Math.min(95, 50 + (4 - 1) * (50 / 3))}%`, top: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateX(-50%)' }}>
                      <Box sx={{ width: 2, height: 12, bgcolor: 'primary.main' }} />
                      <Tooltip title="Niveau optimal pour des résultats de qualité supérieure" arrow placement="top">
                        <Box>
                          <Typography variant="caption" sx={{ mt: 0.5, color: 'primary.main', fontWeight: 'medium', whiteSpace: 'nowrap' }}>
                            Optimal: {minCharactersRecommended ? (minCharactersRecommended * 4).toLocaleString() : '0'}
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
                            <Tooltip title={`Niveau intermédiaire`} arrow placement="top">
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
                                {charCount.toLocaleString()}
                              </Typography>
                            </Tooltip>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                
                  {/* Messages d'état */}
                  {minCharactersRecommended > 0 && (isEstimated ? estimateCharacterCount() : actualCharacterCount) < minCharactersRecommended && (
                    <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                      <InfoOutlinedIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      Il vous manque <strong>{(minCharactersRecommended - (isEstimated ? estimateCharacterCount() : actualCharacterCount)).toLocaleString()}</strong> caractères pour atteindre le minimum recommandé pour votre objectif d'entraînement.
                    </Typography>
                  )}
                  {minCharactersRecommended > 0 && (isEstimated ? estimateCharacterCount() : actualCharacterCount) >= minCharactersRecommended && 
                    (isEstimated ? estimateCharacterCount() : actualCharacterCount) < minCharactersRecommended * 4 && (
                      <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                        <CheckCircleIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        Vous avez atteint le minimum recommandé pour cette catégorie d'assistant.
                      </Typography>
                    )}
                  {minCharactersRecommended > 0 && (isEstimated ? estimateCharacterCount() : actualCharacterCount) >= minCharactersRecommended && (
                    <Typography variant="caption" color={(isEstimated ? estimateCharacterCount() : actualCharacterCount) >= minCharactersRecommended * 4 ? 'primary.main' : 'text.secondary'} sx={{ display: 'block', mt: 0.5 }}>
                      {(isEstimated ? estimateCharacterCount() : actualCharacterCount) >= minCharactersRecommended * 4 ? (
                        <>
                          <StarsIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          Excellent! Votre dataset a dépassé la taille optimale pour des résultats de qualité supérieure.
                        </>
                      ) : (
                        <>Plus vous ajoutez de contenu (jusqu'à {minCharactersRecommended ? (minCharactersRecommended * 4).toLocaleString() : '0'} caractères), meilleure sera la qualité du fine-tuning.</>
                      )}
                    </Typography>
                  )}
                  
                  {isEstimated && [...uploadedFiles, ...uploadedUrls, ...uploadedYouTube, ...uploadedWeb].some(c => c.status !== 'completed' && c.status !== 'error' && c.status !== 'awaiting_transcription') && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        Traitement des fichiers en cours, le comptage sera mis à jour automatiquement
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
              
              {/* Le composant FileUpload affiche déjà les fichiers sous forme de chips */}
              {createdProject && (
                <Box sx={{ mb: 3 }}>
                  <FileUpload 
                    projectId={createdProject.id} 
                    hideUrlInput={true} 
                    onSuccess={(uploadedContent) => {
                      if (uploadedContent) {
                        console.log("Nouveau contenu uploadé:", uploadedContent);
                        
                        // Si c'est un fichier
                        if (uploadedContent.file_path) {
                          setUploadedFiles(prev => {
                            // Vérifier si le fichier existe déjà (mise à jour)
                            const exists = prev.find(f => f.id === uploadedContent.id);
                            if (exists) {
                              return prev.map(f => f.id === uploadedContent.id ? uploadedContent : f);
                            }
                            // Sinon ajouter le nouveau fichier
                            return [...prev, uploadedContent];
                          });
                          enqueueSnackbar(`Fichier "${uploadedContent.name}" uploadé avec succès`, { variant: 'success' });
                        } 
                        // Si c'est une URL
                        else if (uploadedContent.url) {
                          setUploadedUrls(prev => {
                            // Vérifier si l'URL existe déjà (mise à jour)
                            const exists = prev.find(u => u.id === uploadedContent.id);
                            if (exists) {
                              return prev.map(u => u.id === uploadedContent.id ? uploadedContent : u);
                            }
                            // Sinon ajouter la nouvelle URL
                            return [...prev, uploadedContent];
                          });
                          enqueueSnackbar('URL ajoutée avec succès', { variant: 'success' });
                        }
                        
                        // Forcer la récupération des métadonnées après un délai pour laisser le temps au traitement
                        setTimeout(() => {
                          contentService.getById(uploadedContent.id)
                            .then(updatedContent => {
                              console.log("Contenu mis à jour après délai:", updatedContent);
                              
                              if (updatedContent.file_path) {
                                setUploadedFiles(prev => 
                                  prev.map(f => f.id === updatedContent.id ? updatedContent : f)
                                );
                              } else if (updatedContent.url) {
                                setUploadedUrls(prev => 
                                  prev.map(u => u.id === updatedContent.id ? updatedContent : u)
                                );
                              }
                              
                              // Recalculer le comptage de caractères
                              calculateActualCharacterCount();
                            })
                            .catch(err => console.error("Erreur lors de la mise à jour du contenu:", err));
                        }, 5000); // Attendre 5 secondes pour le traitement initial
                      }
                    }}
                  />
                </Box>
              )}
              
              {/* Ajout du module pour les vidéos YouTube */}
              <Box sx={{ mb: 3, p: 2, border: '1px dashed', borderColor: 'grey.300', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Ajouter une vidéo YouTube
                </Typography>
                <TextField
                  label="URL de la vidéo YouTube"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  fullWidth
                  placeholder="Entrez l'URL"
                  InputProps={{ startAdornment: <YouTubeIcon color="error" sx={{ mr: 1 }} /> }}
                  error={!!youtubeUploadError}
                  helperText={youtubeUploadError}
                />
                <Button
                  variant="contained"
                  onClick={handleAddYouTubeUrl}
                  disabled={youtubeUploading || !youtubeUrl.trim()}
                  sx={{ mt: 2 }}
                >
                  {youtubeUploading ? <CircularProgress size={20} /> : "Ajouter la vidéo"}
                </Button>
                
                {/* Information sur le traitement asynchrone */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Notre système traite les vidéos en arrière-plan et prend en charge des vidéos allant jusqu'à 5 heures. 
                    Le temps de traitement dépend de la longueur de la vidéo. Vous pouvez continuer à utiliser l'application pendant ce temps.
                  </Typography>
                </Box>
              </Box>

              {/* Affichage des vidéos YouTube ajoutées */}
              {uploadedYouTube.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Vidéos YouTube ajoutées :</Typography>
                  {uploadedYouTube.map(video => (
                    <Box key={video.id} sx={{ display: 'flex', alignItems: 'center', p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                      <YouTubeIcon color="error" sx={{ mr: 2 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1">{video.name}</Typography>
                        {video.status === 'awaiting_transcription' ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              ~{video.estimated_characters?.toLocaleString() || '1500'} caractères estimés (transcription après paiement)
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Transcription: {video.source || 'terminée'}
                          </Typography>
                        )}
                      </Box>
                      <IconButton onClick={() => handleDeleteYouTube(video.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
              
              {/* Module pour scraping d'URL Web */}
              <Box sx={{ mb: 3, p: 2, border: '1px dashed', borderColor: 'grey.300', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Ajouter une URL Web
                </Typography>
                <TextField
                  label="URL du site"
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  fullWidth
                  placeholder="Entrez l'URL du site"
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
                  {scrapeLoading ? <CircularProgress size={20} /> : "Ajouter le site"}
                </Button>
              </Box>

              {uploadedWeb.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Sites Web ajoutés :</Typography>
                  {uploadedWeb.map(item => (
                    <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                      <InsertLinkIcon sx={{ mr: 2 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1">{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.character_count?.toLocaleString() || '0'} caractères
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  backgroundColor: 'secondary.main',
                  mr: 2,
                }}
              >
                <SettingsSuggestIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Fine-tuning de votre modèle
              </Typography>
            </Box>
            
            <Typography variant="body1" paragraph>
              Configurez votre modèle pour le fine-tuning.
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="provider-select-label">Fournisseur</InputLabel>
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
                  label="Fournisseur"
                  disabled={createdDataset !== null}
                >
                  <MenuItem value="openai">OpenAI</MenuItem>
                  <MenuItem value="anthropic">Anthropic</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="model-select-label">Modèle</InputLabel>
                <Select
                  labelId="model-select-label"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  label="Modèle"
                  disabled={createdDataset !== null}
                >
                  {provider && providerModels[provider] && providerModels[provider].map((modelOption) => (
                    <MenuItem 
                      key={modelOption.id} 
                      value={modelOption.id}
                      disabled={modelOption.name.includes("Coming soon")}
                    >
                      {modelOption.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ mt: 3 }}>
                <TextField
                  label={`Clé API ${provider === 'openai' ? 'OpenAI' : 'Anthropic'}`}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  fullWidth
                  type="password"
                  margin="normal"
                  placeholder={`Entrez votre clé API ${provider === 'openai' ? 'OpenAI' : 'Anthropic'}`}
                  error={!!apiKeyError}
                  helperText={apiKeyError}
                  disabled={apiKeySaved}
                  InputProps={{
                    endAdornment: (
                      <IconButton 
                        onClick={() => setApiHelpOpen(true)} 
                        edge="end"
                        aria-label="aide sur les clés API"
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
                  Valider la clé API
                </Button>
              )}
            </Box>
            
            {apiKeySaved && (
              <Alert severity="success" sx={{ mt: 2, mb: 3 }}>
                <AlertTitle>Clé API validée</AlertTitle>
                <Typography variant="body2">
                  Votre clé API a été validée avec succès. Cliquez sur "Suivant" pour continuer.
                </Typography>
              </Alert>
            )}
            
            {createdDataset && (
              <Box sx={{ mt: 3 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <AlertTitle>Dataset créé avec succès</AlertTitle>
                  <Typography variant="body2">
                    <strong>Nom:</strong> {createdDataset.name}<br />
                    <strong>ID:</strong> {createdDataset.id}<br />
                    <strong>Status:</strong> {datasetReady ? "Prêt" : "En préparation..."}
                  </Typography>
                  {!datasetReady && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      <Typography variant="caption">
                        Le dataset est en cours de préparation. Cette étape peut prendre quelques minutes...
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
                    Lancer le fine-tuning
                  </Button>
                )}
                
                {createdFineTuning && (
                  <Alert severity="success" sx={{ mt: 3 }}>
                    <AlertTitle>Fine-tuning lancé avec succès!</AlertTitle>
                    <Typography variant="body2">
                      <strong>Nom:</strong> {createdFineTuning.name}<br />
                      <strong>ID:</strong> {createdFineTuning.id}<br />
                      <strong>Statut:</strong> {createdFineTuning.status || "En attente"}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                      Le fine-tuning est en cours de traitement et peut prendre plusieurs heures. Vous pouvez passer à l'étape suivante.
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
        return 'Étape inconnue';
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
            {/* Stepper - seulement visible sur les étapes intermédiaires */}
            {activeStep < steps.length - 1 && (
              <Stepper 
                activeStep={activeStep} 
                alternativeLabel
                sx={{ mb: 5 }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            )}
            
            {/* Contenu de l'étape */}
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
            
            {/* Boutons de navigation - seulement visibles sur les étapes intermédiaires */}
            {activeStep < steps.length - 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5 }}>
                <Button
                  onClick={handleBack}
                  startIcon={<ArrowBackIcon />}
                  sx={{ borderRadius: 3 }}
                  disabled={activeStep === 0 || uploading || creatingProject || savingApiKey || isCompleting}
                >
                  Retour
                </Button>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  {completionError && activeStep === 2 && (
                    <Typography variant="caption" color="error" sx={{ mb: 1 }}>
                      {completionError}
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={activeStep === steps.length - 2 ? null : <ArrowForwardIcon />}
                    startIcon={activeStep === steps.length - 2 && isCompleting ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{ borderRadius: 3 }}
                    disabled={uploading || creatingProject || savingApiKey || isCompleting || 
                      (activeStep === 2 && !apiKeySaved)} // Désactiver si l'API key n'est pas validée
                  >
                    {activeStep === steps.length - 2 ? (isCompleting ? 'Traitement en cours...' : 'Terminer') : 'Suivant'}
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
      {/* Popup d'aide pour la clé API */}
      <Dialog 
        open={apiHelpOpen} 
        onClose={() => setApiHelpOpen(false)}
        maxWidth="md"
      >
        <DialogTitle>
          Comment obtenir votre clé API {provider === 'openai' ? 'OpenAI' : 'Anthropic'}
          <IconButton
            aria-label="fermer"
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
            Pourquoi avons-nous besoin de votre clé API ?
          </Typography>
          <Typography paragraph>
            Pour réaliser le fine-tuning de votre modèle, nous devons accéder à l'API {provider === 'openai' ? 'OpenAI' : 'Anthropic'} en utilisant votre propre clé. 
            Cela permet de:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
              <ListItemText primary="Créer un modèle fine-tuné personnalisé qui vous appartient" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
              <ListItemText primary="Garantir la confidentialité de vos données" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
              <ListItemText primary="Vous permettre d'utiliser ce modèle dans vos propres applications" />
            </ListItem>
          </List>
          
          {provider === 'openai' && (
            <>
              <Typography variant="h6" gutterBottom>
                Comment obtenir votre clé API OpenAI
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><Typography variant="body2" color="primary">1</Typography></ListItemIcon>
                  <ListItemText 
                    primary="Connectez-vous à votre compte OpenAI" 
                    secondary={<Link href="https://platform.openai.com/login" target="_blank" rel="noopener">https://platform.openai.com/login</Link>}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Typography variant="body2" color="primary">2</Typography></ListItemIcon>
                  <ListItemText 
                    primary="Allez dans 'API Keys'" 
                    secondary="Cliquez sur votre profil en haut à droite, puis sélectionnez 'View API keys'"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Typography variant="body2" color="primary">3</Typography></ListItemIcon>
                  <ListItemText 
                    primary="Créez une nouvelle clé API" 
                    secondary="Cliquez sur 'Create new secret key', donnez-lui un nom et copiez la clé générée"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Typography variant="body2" color="primary">4</Typography></ListItemIcon>
                  <ListItemText 
                    primary="Assurez-vous d'avoir des crédits disponibles" 
                    secondary="Vérifiez votre solde sous 'Billing' pour vous assurer que vous avez des crédits pour le fine-tuning"
                  />
                </ListItem>
              </List>
            </>
          )}
          
          <Alert severity="warning" sx={{ mt: 2 }}>
            <AlertTitle>Important</AlertTitle>
            Nous ne stockons jamais votre clé API en clair. Elle est chiffrée dans notre base de données et utilisée uniquement pour les opérations de fine-tuning que vous initiez.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApiHelpOpen(false)}>Fermer</Button>
          {provider === 'openai' && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => {
                window.open('https://platform.openai.com/api-keys', '_blank');
              }}
            >
              Accéder à OpenAI
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </PageTransition>
  );
};

export default OnboardingPage; 