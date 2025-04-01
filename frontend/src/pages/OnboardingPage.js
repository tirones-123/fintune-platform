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
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/common/PageTransition';
import { 
  subscriptionService, 
  projectService, 
  contentService, 
  datasetService, 
  fineTuningService,
  apiKeyService,
  api,
} from '../services/apiService';
import { useSnackbar } from 'notistack';
import FileUpload from '../components/common/FileUpload';
import HelpIcon from '@mui/icons-material/Help';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import UploadStatusCard from '../components/content/UploadStatusCard';

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
  const [datasetName] = useState("Dataset par défaut");
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
          
          // Créer un point d'entrée spécifique pour l'onboarding qui prend en compte les caractères déjà utilisés
          console.log("Tentative de création d'une session de paiement spécifique avec les caractères");
          const session = await api.post('/api/checkout/create-onboarding-session', {
            character_count: characterCount
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
    
    // Pour les URLs (estimation plus conservatrice)
    uploadedUrls.forEach(url => {
      if (url.content_metadata && url.content_metadata.character_count) {
        totalEstimate += parseInt(url.content_metadata.character_count);
      } else {
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
      console.log(`Fichier ${file.id} (${file.name}):`, file);
      if (file.content_metadata && file.content_metadata.character_count) {
        const fileChars = parseInt(file.content_metadata.character_count);
        console.log(`  → Caractères: ${fileChars}`);
        actualCount += fileChars;
      } else if (file.status === 'completed') {
        // Si le fichier est traité mais n'a pas de métadonnées de comptage
        console.log(`  → Pas de métadonnées de caractères mais statut completed`);
        hasAllCounts = false;
      } else {
        console.log(`  → Statut: ${file.status}, pas de comptage disponible`);
      }
    });
    
    // De même pour les URLs
    uploadedUrls.forEach(url => {
      console.log(`URL ${url.id} (${url.name}):`, url);
      if (url.content_metadata && url.content_metadata.character_count) {
        const urlChars = parseInt(url.content_metadata.character_count);
        console.log(`  → Caractères: ${urlChars}`);
        actualCount += urlChars;
      } else if (url.status === 'completed') {
        console.log(`  → Pas de métadonnées de caractères mais statut completed`);
        hasAllCounts = false;
      } else {
        console.log(`  → Statut: ${url.status}, pas de comptage disponible`);
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
                Importer du contenu
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
                Estimation
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {isEstimated ? (
                      <>Caractères estimés: <strong>{estimateCharacterCount().toLocaleString()}</strong></>
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
            </Paper>
            
            {/* Utilisation du composant FileUpload au lieu du code personnalisé */}
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
            
            {/* Liste des fichiers uploadés */}
            {uploadedFiles.length > 0 && (
              <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Fichiers importés ({uploadedFiles.length})
                </Typography>
                {uploadedFiles.map((file) => (
                  <UploadStatusCard 
                    key={file.id}
                    content={file}
                    onDelete={() => handleDeleteContent(file, 'file')}
                    showDetailedStats={true}
                    usageType={useCase}
                    onMetadataUpdate={(updatedContent) => {
                      // Mettre à jour l'élément dans la liste des fichiers
                      setUploadedFiles(prev => 
                        prev.map(item => item.id === updatedContent.id ? updatedContent : item)
                      );
                      // Recalculer le comptage réel
                      calculateActualCharacterCount();
                    }}
                  />
                ))}
              </Paper>
            )}
            
            {/* Liste des URLs ajoutées */}
            {uploadedUrls.length > 0 && (
              <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  URLs importées ({uploadedUrls.length})
                </Typography>
                {uploadedUrls.map((url) => (
                  <UploadStatusCard 
                    key={url.id}
                    content={url}
                    onDelete={() => handleDeleteContent(url, 'url')}
                    showDetailedStats={true}
                    usageType={useCase}
                    onMetadataUpdate={(updatedContent) => {
                      // Mettre à jour l'élément dans la liste des URLs
                      setUploadedUrls(prev => 
                        prev.map(item => item.id === updatedContent.id ? updatedContent : item)
                      );
                      // Recalculer le comptage réel
                      calculateActualCharacterCount();
                    }}
                  />
                ))}
              </Paper>
            )}
            
            {uploadError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {uploadError}
              </Alert>
            )}
          </Box>
        );
      
      case 2: // Fine-tuning
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  backgroundColor: 'warning.main',
                  mr: 2,
                }}
              >
                <PsychologyIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Fine-tuner un modèle
              </Typography>
            </Box>
            
            <Typography variant="body1" paragraph>
              Choisissez le fournisseur et le modèle que vous souhaitez fine-tuner.
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Vous devez disposer de crédits auprès du service d'IA choisi pour lancer le fine-tuning.
                Vérifiez votre compte {provider} avant de continuer.
              </Typography>
            </Alert>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Fournisseur</InputLabel>
              <Select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                label="Fournisseur"
              >
                <MenuItem value="openai">OpenAI</MenuItem>
                <MenuItem value="anthropic">Anthropic</MenuItem>
                <MenuItem value="mistral">Mistral AI</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Modèle</InputLabel>
              <Select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                label="Modèle"
              >
                {providerModels[provider].map((model) => (
                  <MenuItem key={model.id} value={model.id}>
                    {model.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Typography variant="body1" paragraph>
              Entrez votre clé API {provider} pour permettre le fine-tuning de votre modèle.
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label={`Clé API ${provider}`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                type="password"
                placeholder={provider === 'openai' ? "sk-..." : provider === 'anthropic' ? "sk-ant-..." : "Votre clé API"}
                sx={{ mb: 2 }}
                error={!!apiKeyError}
              />
              <FormHelperText>
                {apiKeyError ? (
                  <Typography color="error">{apiKeyError}</Typography>
                ) : (
                  `Cette clé est nécessaire pour lancer le fine-tuning de votre modèle ${provider}. Elle sera stockée de manière sécurisée.`
                )}
              </FormHelperText>
            </FormControl>
            
            {fineTuningError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {fineTuningError}
              </Alert>
            )}
          </Box>
        );
      
      case 3: // Terminé
        return (
          <Box sx={{ textAlign: 'center' }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  backgroundColor: processingFineTuning ? 'primary.main' : 'success.main',
                  margin: '0 auto 24px',
                  boxShadow: processingFineTuning 
                    ? '0 8px 24px rgba(59, 130, 246, 0.3)'
                    : '0 8px 24px rgba(16, 185, 129, 0.3)',
                }}
              >
                {processingFineTuning ? (
                  <CircularProgress color="inherit" thickness={5} />
                ) : (
                  <CheckCircleIcon sx={{ fontSize: 60 }} />
                )}
              </Avatar>
            </motion.div>
            
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              {processingFineTuning 
                ? "Fine-tuning en cours..." 
                : "Félicitations !"}
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
              {processingFineTuning 
                ? "Votre modèle est en cours de fine-tuning. Ce processus peut prendre plusieurs heures. Vous pouvez consulter l'état d'avancement sur votre compte OpenAI."
                : "Vous avez terminé l'onboarding et votre modèle sera prêt après son entraînement. Vous disposez de 10 000 caractères gratuits pour démarrer."}
            </Typography>
            
            {/* Ajout d'informations sur le nouveau système de pricing */}
            <Box sx={{ 
              textAlign: 'left', 
              maxWidth: 600, 
              mx: 'auto', 
              mb: 4, 
              p: 3, 
              bgcolor: 'background.default', 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="h6" gutterBottom>
                Facturation à l'usage
              </Typography>
              
              <Typography variant="body2" paragraph>
                Notre plateforme utilise désormais un modèle de facturation à l'usage basé sur le nombre de caractères utilisés pour le fine-tuning :
              </Typography>
              
              <Box component="ul" sx={{ pl: 2 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>10 000 caractères gratuits</strong> pour tout nouvel utilisateur
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>0,000365 $ par caractère</strong> au-delà du forfait gratuit
                  </Typography>
                </Box>
                <Box component="li">
                  <Typography variant="body2">
                    Achetez des caractères supplémentaires en fonction de vos besoins
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                Note : Les caractères sont comptés dans les questions, réponses et instructions système de votre dataset.
              </Typography>
            </Box>
            
            {completionError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {completionError}
              </Alert>
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {processingFineTuning ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Nous préparons votre accès à la plateforme...
                </Typography>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  onClick={completeOnboarding}
                  disabled={isCompleting}
                  sx={{ px: 4, py: 1.5, borderRadius: 3 }}
                >
                  {isCompleting ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                      Traitement en cours...
                    </>
                  ) : (
                    'Accéder au dashboard'
                  )}
                </Button>
              )}
            </motion.div>
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