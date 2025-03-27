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
} from '../services/apiService';
import { useSnackbar } from 'notistack';

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
  'Importer du contenu',
  'Fine-tuner un modèle',
  'Terminé'
];

// Fonction utilitaire pour détecter le type de fichier
const detectFileType = (file) => {
  const extension = file.name.split('.').pop().toLowerCase();
  
  if (['pdf'].includes(extension)) return 'pdf';
  if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) return 'text';
  
  return 'text'; // Par défaut
};

const OnboardingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);
  
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

  // Ajouter cette fonction pour gérer l'upload de fichier
  const handleFileUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    setUploadError(null);
    
    try {
      // Vérifier si le projet a été créé
      if (!createdProject) {
        throw new Error("Le projet n'a pas encore été créé. Veuillez réessayer.");
      }
      
      for (const file of selectedFiles) {
        const fileType = detectFileType(file);
        
        // Appel API pour uploader le fichier
        const response = await contentService.uploadFile(
          createdProject.id,
          file,
          {
            name: file.name,
            file_type: fileType
          }
        );
        
        setUploadedFiles(prev => [...prev, response]);
        enqueueSnackbar(`Fichier "${file.name}" uploadé avec succès`, { variant: 'success' });
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setUploadError(error.message || "Erreur lors de l'upload du fichier");
      enqueueSnackbar(`Erreur: ${error.message || "Échec de l'upload"}`, { variant: 'error' });
    } finally {
      setUploading(false);
      // Réinitialiser l'input file pour permettre de sélectionner à nouveau les mêmes fichiers
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Fonction pour ajouter une URL
  const handleAddUrl = async () => {
    if (!newUrl || !newUrlName) {
      setUploadError("L'URL et le nom sont requis");
      return;
    }
    
    setUploading(true);
    setUploadError(null);
    
    try {
      // Vérifier si le projet a été créé
      if (!createdProject) {
        throw new Error("Le projet n'a pas encore été créé. Veuillez réessayer.");
      }
      
      // Déterminer le type de contenu basé sur l'URL
      let contentType = 'website';
      if (newUrl.includes('youtube.com') || newUrl.includes('youtu.be')) {
        contentType = 'youtube';
      }
      
      const urlContent = {
        project_id: createdProject.id,
        name: newUrlName,
        url: newUrl,
        type: contentType
      };
      
      // Appel API pour ajouter l'URL
      const response = await contentService.addUrl(urlContent);
      
      setUploadedUrls(prev => [...prev, response]);
      setNewUrl('');
      setNewUrlName('');
      enqueueSnackbar('URL ajoutée avec succès', { variant: 'success' });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'URL:', error);
      setUploadError(error.message || "Erreur lors de l'ajout de l'URL");
      enqueueSnackbar(`Erreur: ${error.message || "Échec de l'ajout d'URL"}`, { variant: 'error' });
    } finally {
      setUploading(false);
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
        description: `Dataset généré automatiquement pendant l'onboarding`
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
      case 0: // Après étape import de contenu
        // Vérifier s'il y a du contenu
        if (uploadedFiles.length === 0 && uploadedUrls.length === 0) {
          setUploadError("Veuillez ajouter au moins un fichier ou une URL");
          return;
        }
        break;
      
      case 1: // Après étape fine-tuning
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
      // 1. Créer le dataset s'il n'existe pas encore
      if (!createdDataset) {
        const datasetSuccess = await createDataset();
        if (!datasetSuccess) {
          throw new Error("Échec de la création du dataset");
        }
        
        // Attendre que le dataset soit prêt
        let retries = 0;
        const maxRetries = 20; // Maximum 60 secondes d'attente (20 × 3s)
        
        while (retries < maxRetries && !datasetReady) {
          await new Promise(resolve => setTimeout(resolve, 3000)); // Attendre 3 secondes
          // Vérifier si createdDataset existe toujours avant d'appeler checkDatasetStatus
          if (!createdDataset) {
            throw new Error("Le dataset n'est plus accessible");
          }
          const isReady = await checkDatasetStatus(createdDataset.id);
          if (isReady) break;
          retries++;
        }
        
        if (!datasetReady) {
          throw new Error("Le dataset n'est pas prêt après le délai d'attente");
        }
      }
      
      // 2. Lancer le fine-tuning
      if (!createdFineTuning) {
        const fineTuningSuccess = await createFineTuning();
        if (!fineTuningSuccess) {
          throw new Error("Échec du lancement du fine-tuning");
        }
      }
      
      // 3. Mettre à jour le profil utilisateur
      const payload = {
        email: user.email,
        name: user.name,
        is_active: user.is_active,
        has_completed_onboarding: true,
      };

      console.log("Mise à jour de l'utilisateur avec payload:", payload);
      const updatedUser = await updateUser(payload);
      console.log("Résultat de la mise à jour:", updatedUser);
      
      // 4. Redirection vers la page de paiement si nécessaire
      if (updatedUser && updatedUser.has_completed_onboarding) {
        try {
          console.log("Tentative de création d'une session de paiement pour le plan 'starter'");
          const session = await subscriptionService.createCheckoutSession('starter');
          console.log("Session de paiement créée avec succès:", session);
          
          if (session && session.url) {
            console.log("Redirection vers:", session.url);
            window.location.href = session.url;
          } else {
            console.error("URL de redirection non reçue dans la session:", session);
            setCompletionError("Erreur de redirection: URL de paiement non disponible");
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
        }
      } else {
        console.error("La mise à jour de l'état d'onboarding a échoué. Données reçues:", JSON.stringify(updatedUser, null, 2));
        setCompletionError("L'état d'onboarding n'a pas pu être mis à jour correctement");
      }
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      setCompletionError(error.message || "Erreur lors de la finalisation");
      setProcessingFineTuning(false);
      if (error.message === 'Not authenticated') {
        navigate('/login');
      }
    } finally {
      setIsCompleting(false);
    }
  };

  // Contenu des étapes
  const getStepContent = (step) => {
    switch (step) {
      case 0: // Import de contenu
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
            
            <Typography variant="body1" paragraph>
              Ajoutez vos fichiers et/ou URLs qui serviront de base pour fine-tuner votre modèle.
            </Typography>
            
            {/* Zone de drag & drop pour les fichiers */}
            <Box
              sx={{
                border: '2px dashed',
                borderColor: uploadError ? 'error.main' : 'divider',
                borderRadius: 3,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: 'background.paper',
                '&:hover': {
                  borderColor: uploadError ? 'error.main' : 'primary.main',
                  backgroundColor: (theme) => 
                    theme.palette.mode === 'dark'
                      ? 'rgba(96, 165, 250, 0.05)'
                      : 'rgba(59, 130, 246, 0.05)',
                },
                mb: 3,
              }}
              onClick={() => !uploading && fileInputRef.current.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                accept=".pdf,.txt,.doc,.docx"
                multiple
              />
              
              {uploading ? (
                <CircularProgress size={48} sx={{ mb: 2 }} />
              ) : (
                <CloudUploadIcon sx={{ fontSize: 48, color: uploadError ? 'error.main' : 'text.secondary', mb: 2 }} />
              )}
              
              <Typography variant="body1" gutterBottom>
                {uploading 
                  ? 'Upload en cours...' 
                  : 'Glissez-déposez vos fichiers ici'}
              </Typography>
              
              {!uploading && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    ou
                  </Typography>
                  <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    component="span"
                  >
                    Parcourir
                  </Button>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Formats acceptés: PDF, TXT, DOC, DOCX
                  </Typography>
                </>
              )}
            </Box>
            
            {/* Liste des fichiers uploadés */}
            {uploadedFiles.length > 0 && (
              <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Fichiers importés ({uploadedFiles.length})
                </Typography>
                <List dense>
                  {uploadedFiles.map((file) => (
                    <ListItem key={file.id}>
                      <ListItemIcon>
                        <DescriptionIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={file.name} 
                        secondary={`Type: ${file.type || 'Inconnu'}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleDeleteContent(file, 'file')}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
            
            {/* Section pour ajouter des URLs */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Ajouter une URL
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Nom du contenu"
                  value={newUrlName}
                  onChange={(e) => setNewUrlName(e.target.value)}
                  placeholder="ex: Documentation produit, Vidéo tutoriel..."
                  disabled={uploading}
                />
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    label="URL"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://..."
                    disabled={uploading}
                  />
                  
                  <Button
                    variant="contained"
                    onClick={handleAddUrl}
                    disabled={uploading || !newUrl || !newUrlName}
                    startIcon={uploading ? <CircularProgress size={20} /> : <InsertLinkIcon />}
                  >
                    Ajouter
                  </Button>
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Vous pouvez ajouter des liens vers des sites web ou des vidéos YouTube
                </Typography>
              </Box>
            </Paper>
            
            {/* Liste des URLs ajoutées */}
            {uploadedUrls.length > 0 && (
              <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  URLs importées ({uploadedUrls.length})
                </Typography>
                <List dense>
                  {uploadedUrls.map((url) => (
                    <ListItem key={url.id}>
                      <ListItemIcon>
                        <InsertLinkIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={url.name} 
                        secondary={url.url}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleDeleteContent(url, 'url')}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
            
            {uploadError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {uploadError}
              </Alert>
            )}
          </Box>
        );
      
      case 1: // Fine-tuning
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
      
      case 2: // Terminé
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
                : "Vous avez terminé l'onboarding et votre modèle est maintenant en cours d'entraînement sur les serveurs OpenAI. Vous pouvez accéder au tableau de bord pour suivre son évolution."}
            </Typography>
            
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