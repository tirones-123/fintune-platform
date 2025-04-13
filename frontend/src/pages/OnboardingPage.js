import React, { useState, useEffect } from 'react';
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
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [creatingFineTuning, setCreatingFineTuning] = useState(false);
  const [createdFineTuning, setCreatedFineTuning] = useState(null);
  const [fineTuningError, setFineTuningError] = useState(null);
  
  // Modèles disponibles par fournisseur
  const providerModels = {
    openai: [
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      { id: 'gpt-4', name: 'GPT-4' },
    ],
    anthropic: [
      { id: 'claude-2', name: 'Claude 2' },
      { id: 'claude-instant', name: 'Claude Instant' },
    ],
    mistral: [
      { id: 'mistral-7b', name: 'Mistral 7B' },
      { id: 'mistral-8x7b', name: 'Mistral 8x7B' },
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
      // Appel API pour sauvegarder la clé API
      await apiKeyService.addKey(provider, apiKey);
      
      setApiKeySaved(true);
      enqueueSnackbar('Clé API enregistrée avec succès', { variant: 'success' });
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la clé API:', error);
      setApiKeyError(error.message || "Erreur lors de l'enregistrement de la clé API");
      enqueueSnackbar(`Erreur: ${error.message || "Échec de l'enregistrement de la clé API"}`, { variant: 'error' });
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
    
    const allContents = [...uploadedFiles, ...uploadedUrls];
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
        if (uploadedFiles.length === 0 && uploadedUrls.length === 0) {
          setUploadError("Veuillez ajouter au moins un fichier ou une URL");
          return;
        }
        break;
      
      case 2: // Après étape fine-tuning
        // Vérifier d'abord la clé API
        const apiKeySuccess = await saveApiKey();
        if (!apiKeySuccess) return;
        break;
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
    
    try {
      // 1. Commencer la création du dataset en arrière-plan si nécessaire
      let datasetCreationStarted = false;
      
      if (!createdDataset) {
        console.log("Aucun dataset existant, démarrage de la création en arrière-plan...");
        // Lancer la création du dataset sans attendre
        createDataset().then(success => {
          if (success && createdDataset) {
            console.log(`Dataset créé avec succès en arrière-plan, ID: ${createdDataset.id}`);
            // Le timer dans createDataset s'occupera de vérifier quand il est prêt
            // et lancera le fine-tuning automatiquement lorsqu'il sera prêt
          } else {
            console.error("Échec de la création du dataset en arrière-plan");
          }
        }).catch(error => {
          console.error("Erreur lors de la création du dataset en arrière-plan:", error);
        });
        
        datasetCreationStarted = true;
      } else {
        console.log(`Dataset déjà existant, ID: ${createdDataset.id}, prêt: ${datasetReady}`);
        
        // Si le dataset existe mais n'est pas prêt, on continue de vérifier en arrière-plan
        if (!datasetReady && createdDataset.id) {
          console.log("Dataset existant mais pas encore prêt, vérification en arrière-plan...");
          checkDatasetStatus(createdDataset.id);
        }
        
        // Si le dataset est prêt mais qu'aucun fine-tuning n'a été lancé, on le lance en arrière-plan
        if (datasetReady && !createdFineTuning) {
          console.log("Dataset prêt, lancement du fine-tuning en arrière-plan...");
          createFineTuning().catch(error => {
            console.error("Erreur lors du lancement du fine-tuning en arrière-plan:", error);
          });
        }
      }
      
      // 2. Mettre à jour le profil utilisateur immédiatement
      const payload = {
        email: user.email,
        name: user.name,
        is_active: user.is_active,
        has_completed_onboarding: true,
      };

      console.log("Mise à jour de l'utilisateur avec payload:", payload);
      const updatedUser = await updateUser(payload);
      console.log("Résultat de la mise à jour:", updatedUser);
      
      // 3. Redirection vers la page de paiement immédiatement
      if (updatedUser && updatedUser.has_completed_onboarding) {
        try {
          // Récupérer le nombre de caractères (réel ou estimé)
          const characterCount = isEstimated ? estimateCharacterCount() : actualCharacterCount;
          console.log(`Nombre de caractères à facturer: ${characterCount}`);
          
          // Sauvegarder la liste des vidéos YouTube en attente de transcription complète
          const pendingTranscriptions = uploadedYouTube
            .filter(c => c.status === 'awaiting_transcription')
            .map(c => ({
              id: c.id, 
              url: c.url,
              video_id: c.metadata?.video_id || c.video_id,
              estimated_characters: c.estimated_characters
            }));
          
          // Créer un point d'entrée spécifique pour l'onboarding qui prend en compte les caractères déjà utilisés
          console.log("Tentative de création d'une session de paiement spécifique avec les caractères");
          const session = await api.post('/api/checkout/create-onboarding-session', {
            character_count: characterCount,
            pending_transcriptions: pendingTranscriptions // Ajouter les vidéos en attente de transcription
          });
          console.log("Session de paiement créée avec succès:", session.data);
          
          if (session.data && session.data.checkout_url) {
            console.log("Redirection vers:", session.data.checkout_url);
            window.location.href = session.data.checkout_url;
          } else {
            console.error("URL de redirection non reçue dans la session:", session.data);
            setCompletionError("Erreur de redirection: URL de paiement non disponible");
            setProcessingFineTuning(false);
          }
        } catch (checkoutError) {
          console.error('Erreur lors de la création de la session de paiement:', checkoutError);
          if (checkoutError.response) {
            console.error('Détails de la réponse d\'erreur:', {
              status: checkoutError.response.status,
              data: checkoutError.response.data,
              headers: checkoutError.response.headers
            });
          }
          setCompletionError(`Erreur lors de la redirection vers la page de paiement: ${checkoutError.message}`);
          setProcessingFineTuning(false);
        }
      } else {
        console.error("La mise à jour de l'état d'onboarding a échoué. Données reçues:", JSON.stringify(updatedUser, null, 2));
        setCompletionError("L'état d'onboarding n'a pas pu être mis à jour correctement");
        setProcessingFineTuning(false);
      }
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      setCompletionError(error.message || "Erreur lors de la finalisation");
      setProcessingFineTuning(false);
      if (error.message === 'Not authenticated') {
        navigate('/login');
      }
    } finally {
      // Ne pas désactiver isCompleting car nous allons être redirigés
    }
  };

  // Fonction pour estimer le nombre de caractères
  const estimateCharacterCount = () => {
    // Si pas de fichiers ni URLs, retourner 0
    if (uploadedFiles.length === 0 && uploadedUrls.length === 0) {
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
    
    // Pour les URLs (estimation plus spécifique)
    uploadedUrls.forEach(url => {
      // Si nous avons déjà un comptage dans les métadonnées, l'utiliser
      if (url.content_metadata && url.content_metadata.character_count) {
        totalEstimate += parseInt(url.content_metadata.character_count);
      } 
      // Traitement spécial pour les vidéos YouTube
      else if ((url.type === 'youtube' || url.url?.includes('youtube.com') || url.url?.includes('youtu.be'))) {
        // Si les métadonnées contiennent la durée de la vidéo
        if (url.content_metadata && url.content_metadata.duration_seconds) {
          // Estimation de 900 caractères par minute
          const durationMinutes = parseInt(url.content_metadata.duration_seconds) / 60;
          const youtubeEstimate = Math.round(durationMinutes * 900);
          console.log(`Estimation YouTube pour ${url.name}: ${durationMinutes.toFixed(1)} minutes = ${youtubeEstimate} caractères`);
          totalEstimate += youtubeEstimate;
        } else {
          // Si pas de durée disponible, estimation moyenne pour une vidéo YouTube
          totalEstimate += 10000; // Estimation moyenne pour une vidéo YouTube (≈11 minutes)
          console.log(`Durée de vidéo YouTube non disponible pour ${url.name}, estimation par défaut: 10000 caractères`);
        }
      } else {
        // Pour les autres URLs
        totalEstimate += 3000; // Estimation moyenne par URL
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
      else if ((url.type === 'youtube' || url.url?.includes('youtube.com') || url.url?.includes('youtu.be')) && 
               url.content_metadata && url.content_metadata.duration_seconds && url.status === 'completed') {
        // Calcul basé sur 900 caractères par minute
        const durationMinutes = parseInt(url.content_metadata.duration_seconds) / 60;
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
    
    console.log(`Total de caractères: ${actualCount}`);
    console.log(`Est estimé: ${!hasAllCounts || (uploadedFiles.length === 0 && uploadedUrls.length === 0)}`);
    
    setActualCharacterCount(actualCount);
    setIsEstimated(!hasAllCounts || (uploadedFiles.length === 0 && uploadedUrls.length === 0));
    
    return actualCount;
  };
  
  // Mettre à jour le comptage réel chaque fois que les fichiers ou URLs changent
  useEffect(() => {
    calculateActualCharacterCount();
  }, []);  // On le fait seulement au chargement initial, puis les rafraîchissements sont gérés dans la fonction

  // Rafraîchir régulièrement le comptage des caractères
  useEffect(() => {
    // Vérifier s'il y a des fichiers ou URLs en cours de traitement
    const hasProcessingContent = [...uploadedFiles, ...uploadedUrls].some(
      content => content.status !== 'completed' && content.status !== 'error'
    );
    
    if (hasProcessingContent) {
      const intervalId = setInterval(() => {
        calculateActualCharacterCount();
      }, 5000);  // Rafraîchir toutes les 5 secondes
      
      return () => clearInterval(intervalId);
    }
  }, [uploadedFiles, uploadedUrls]);

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

  // Fonction modifiée pour traiter les URL YouTube
  const handleAddYouTubeUrl = async () => {
    if (!youtubeUrl.trim() || youtubeUploading) return;
    if (!createdProject) {
      setYoutubeUploadError("Veuillez d'abord créer un projet");
      return;
    }
    
    setYoutubeUploading(true);
    setYoutubeUploadError(null);
    
    try {
      // Extraire l'ID de la vidéo YouTube
      const youtubeLinkRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
      const match = youtubeUrl.match(youtubeLinkRegex);
      const videoId = match && match[1];
      
      if (!videoId) {
        setYoutubeUploadError("URL YouTube invalide. Veuillez fournir une URL valide.");
        return;
      }

      // Récupérer les métadonnées de la vidéo pour obtenir la durée réelle
      const metadataResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/helpers/youtube-metadata?video_id=${videoId}`);
      const { duration_seconds, title } = metadataResponse.data;
      
      // Calculer le nombre de caractères en fonction de la durée réelle (150 caractères par minute)
      const estimatedCharacters = Math.round((duration_seconds / 60) * 150);
      
      // Créer l'objet au format attendu par le backend
      const urlContent = {
        project_id: createdProject.id,
        url: youtubeUrl,
        name: title || `Vidéo YouTube - ${new Date().toLocaleString()}`,
        type: 'youtube',
        description: `Vidéo YouTube en attente de transcription. Durée: ${Math.round(duration_seconds / 60)} minutes.`
      };
      
      // Ajouter l'URL avec le format attendu par le backend
      const response = await contentService.addUrl(urlContent);
      
      // Mettre à jour le comptage total des caractères avec l'estimation
      setActualCharacterCount(prev => prev + estimatedCharacters);
      
      // Ajouter à la liste des fichiers uploadés
      setUploadedYouTube(prev => [...prev, {
        ...response,
        url: youtubeUrl,
        source: `Durée: ${Math.round(duration_seconds / 60)} min`,
        estimated_characters: estimatedCharacters,
        status: 'awaiting_transcription'
      }]);

      setYoutubeUrl('');
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'URL YouTube:", error);
      setYoutubeUploadError(`Erreur lors de l'ajout de l'URL YouTube: ${error.message || JSON.stringify(error)}`);
    } finally {
      setYoutubeUploading(false);
    }
  };

  // Fonction pour scraper une URL Web - effectuée immédiatement
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
        content_type: 'web_content',
        scraped_content: scrapedText,
        content_metadata: {
          character_count: characterCount,
          url: scrapeUrl,
          title: scrapedData.title || "Sans titre"
        }
      };
      
      // Ajouter l'URL avec le contenu scrapé
      const response = await contentService.addUrl(urlContent);
      
      // Mettre à jour le comptage total des caractères
      setActualCharacterCount(prev => prev + characterCount);
      
      // Ajouter à la liste des URLs web
      setUploadedWeb(prev => [...prev, {
        ...response,
        url: scrapeUrl,
        scraped: scrapedData,
        character_count: characterCount,
        status: 'completed'
      }]);
      
      // Réinitialiser le champ
      setScrapeUrl('');
      enqueueSnackbar(`URL Web ajoutée (${characterCount} caractères)`, { variant: 'success' });
      
    } catch (error) {
      console.error('Erreur lors du scraping de l\'URL Web:', error);
      setScrapeError(error.message || 'Erreur lors du scraping de l\'URL Web');
    } finally {
      setScrapeLoading(false);
    }
  };

  // Remplace la fonction de polling qui n'est plus nécessaire
  const startTranscriptionPolling = () => {
    // Cette fonction n'est plus utilisée car les transcriptions sont lancées après paiement
    console.log("Le polling des transcriptions n'est plus nécessaire, les transcriptions sont lancées après paiement");
    return null;
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
                {uploadedFiles.length > 0 || uploadedUrls.length > 0 ? 
                  ` (${[...uploadedFiles, ...uploadedUrls].filter(c => c.status === 'completed').length}/${uploadedFiles.length + uploadedUrls.length} fichiers traités)` 
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
                            Min: {minCharactersRecommended.toLocaleString()}
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
                            Optimal: {(minCharactersRecommended * 4).toLocaleString()}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                    
                    {/* Marqueurs intermédiaires */}
                    {[1.5, 2, 3].map((multiplier, index) => {
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
                  {(isEstimated ? estimateCharacterCount() : actualCharacterCount) < minCharactersRecommended && (
                    <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                      <InfoOutlinedIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      Il vous manque <strong>{(minCharactersRecommended - (isEstimated ? estimateCharacterCount() : actualCharacterCount)).toLocaleString()}</strong> caractères pour atteindre le minimum recommandé pour votre objectif d'entraînement.
                    </Typography>
                  )}
                  {(isEstimated ? estimateCharacterCount() : actualCharacterCount) >= minCharactersRecommended && 
                    (isEstimated ? estimateCharacterCount() : actualCharacterCount) < minCharactersRecommended * 4 && (
                      <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                        <CheckCircleIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        Vous avez atteint le minimum recommandé pour cette catégorie d'assistant.
                      </Typography>
                    )}
                  {(isEstimated ? estimateCharacterCount() : actualCharacterCount) >= minCharactersRecommended && (
                    <Typography variant="caption" color={(isEstimated ? estimateCharacterCount() : actualCharacterCount) >= minCharactersRecommended * 4 ? 'primary.main' : 'text.secondary'} sx={{ display: 'block', mt: 0.5 }}>
                      {(isEstimated ? estimateCharacterCount() : actualCharacterCount) >= minCharactersRecommended * 4 ? (
                        <>
                          <StarsIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          Excellent! Votre dataset a dépassé la taille optimale pour des résultats de qualité supérieure.
                        </>
                      ) : (
                        <>Plus vous ajoutez de contenu (jusqu'à {(minCharactersRecommended * 4).toLocaleString()} caractères), meilleure sera la qualité du fine-tuning.</>
                      )}
                    </Typography>
                  )}
                  
                  {isEstimated && [...uploadedFiles, ...uploadedUrls].some(c => c.status !== 'completed' && c.status !== 'error') && (
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
                        <Typography variant="body1">{video.url}</Typography>
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
                      <IconButton onClick={() => {
                        setUploadedYouTube(prev => prev.filter(v => v.id !== video.id));
                        // Si la vidéo a des caractères estimés, les soustraire du total
                        if (video.estimated_characters) {
                          setActualCharacterCount(prev => Math.max(0, prev - video.estimated_characters));
                        }
                      }}>
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
                        <Typography variant="body1">{item.url}</Typography>
                        {item.scraped && item.scraped.title && (
                          <Typography variant="caption" color="text.secondary">
                            Titre : {item.scraped.title}
                          </Typography>
                        )}
                        {item.scraped && item.scraped.paragraphs && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {item.scraped.paragraphs.slice(0,2).join(" ")}
                          </Typography>
                        )}
                      </Box>
                      <IconButton onClick={() => setUploadedWeb(prev => prev.filter(v => v.id !== item.id))}>
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
              <TextField
                label="Nom du dataset"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="Mon dataset de fine-tuning"
                disabled={createdDataset !== null}
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="provider-select-label">Fournisseur</InputLabel>
                <Select
                  labelId="provider-select-label"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
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
                  {provider === 'openai' && (
                    <>
                      <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                      <MenuItem value="gpt-4">GPT-4</MenuItem>
                    </>
                  )}
                  {provider === 'anthropic' && (
                    <>
                      <MenuItem value="claude-3-haiku-20240307">Claude 3 Haiku</MenuItem>
                      <MenuItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</MenuItem>
                    </>
                  )}
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
                Votre clé API a été validée avec succès.
              </Alert>
            )}
            
            {apiKeySaved && !createdDataset && (
              <Button
                variant="contained"
                onClick={createDataset}
                disabled={creatingDataset || !datasetName}
                sx={{ mt: 2 }}
              >
                {creatingDataset ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                Créer le dataset et lancer le fine-tuning
              </Button>
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
                  disabled={activeStep === 0 || uploading || creatingProject}
                >
                  Retour
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ borderRadius: 3 }}
                  disabled={uploading || creatingProject}
                >
                  {activeStep === steps.length - 2 ? 'Terminer' : 'Suivant'}
                </Button>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </PageTransition>
  );
};

export default OnboardingPage; 