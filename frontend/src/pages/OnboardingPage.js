import React, { useState } from 'react';
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
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FolderIcon from '@mui/icons-material/Folder';
import DatasetIcon from '@mui/icons-material/Dataset';
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
  'Bienvenue',
  'Créer un projet',
  'Importer du contenu',
  'Générer un dataset',
  'Fine-tuner un modèle',
  'Terminé'
];

const OnboardingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);
  
  // Données du projet
  const [projectName, setProjectName] = useState("Mon premier projet");
  const [projectDescription, setProjectDescription] = useState("Projet créé pendant l'onboarding");
  const [createdProject, setCreatedProject] = useState(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectError, setProjectError] = useState(null);
  
  // Données du contenu
  const [contentType, setContentType] = useState('text');
  const [contentUrl, setContentUrl] = useState('');
  const [contentName, setContentName] = useState('');
  const [createdContent, setCreatedContent] = useState(null);
  
  // Données du dataset
  const [datasetName, setDatasetName] = useState("Mon premier dataset");
  const [creatingDataset, setCreatingDataset] = useState(false);
  const [createdDataset, setCreatedDataset] = useState(null);
  const [datasetError, setDatasetError] = useState(null);
  
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

  // Ajouter ces états pour gérer les fichiers
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = React.useRef(null);
  
  // Ajout d'un état pour gérer la soumission du formulaire de finalisation
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState(null);

  // Ajouter un nouvel état pour gérer la clé API
  const [apiKey, setApiKey] = useState('');
  const [savingApiKey, setSavingApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(null);

  // Ajouter un nouvel état
  const [datasetLoading, setDatasetLoading] = useState(false);
  const [datasetReady, setDatasetReady] = useState(false);

  // Ajouter une fonction pour sauvegarder la clé API
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

  // Ajouter cette fonction pour gérer l'upload réel via l'API
  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setUploading(true);
    setUploadError(null);
    
    try {
      // Vérifier si le projet a été créé
      if (!createdProject) {
        throw new Error("Veuillez d'abord créer un projet");
      }
      
      // Appel API réel
      const response = await contentService.uploadFile(
        createdProject.id,  // Premier paramètre: project_id
        selectedFile,       // Deuxième paramètre: le fichier lui-même
        {                   // Troisième paramètre: métadonnées (optionnel)
          name: selectedFile.name,
          file_type: contentType
        }
      );
      
      setCreatedContent(response);
      setUploadSuccess(true);
      enqueueSnackbar('Contenu uploadé avec succès', { variant: 'success' });
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setUploadError(error.message || "Erreur lors de l'upload du fichier");
      enqueueSnackbar(`Erreur: ${error.message || "Échec de l'upload"}`, { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };
  
  // Ajouter une fonction pour gérer l'ajout d'URL
  const handleUrlContent = async () => {
    if (!contentUrl || !contentName) {
      setUploadError("L'URL et le nom du contenu sont requis");
      return;
    }
    
    setUploading(true);
    setUploadError(null);
    
    try {
      // Vérifier si le projet a été créé
      if (!createdProject) {
        throw new Error("Veuillez d'abord créer un projet");
      }
      
      const urlContent = {
        project_id: createdProject.id,
        name: contentName,
        url: contentUrl,
        type: contentType
      };
      
      // Appel API réel
      const response = await contentService.addUrl(urlContent);
      
      setCreatedContent(response);
      setUploadSuccess(true);
      enqueueSnackbar('URL ajoutée avec succès', { variant: 'success' });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'URL:', error);
      setUploadError(error.message || "Erreur lors de l'ajout de l'URL");
      enqueueSnackbar(`Erreur: ${error.message || "Échec de l'ajout d'URL"}`, { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };
  
  // Fonction pour créer un projet
  const createProject = async () => {
    if (!projectName) {
      setProjectError("Le nom du projet est requis");
      return false;
    }
    
    setCreatingProject(true);
    setProjectError(null);
    
    try {
      const projectData = {
        name: projectName,
        description: projectDescription
      };
      
      // Appel API réel
      const response = await projectService.create(projectData);
      
      setCreatedProject(response);
      enqueueSnackbar('Projet créé avec succès', { variant: 'success' });
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
  
  // Fonction pour créer un dataset
  const createDataset = async () => {
    if (!datasetName) {
      setDatasetError("Le nom du dataset est requis");
      return false;
    }
    
    if (!createdContent) {
      setDatasetError("Veuillez d'abord ajouter du contenu");
      return false;
    }
    
    setCreatingDataset(true);
    setDatasetError(null);
    
    try {
      const datasetData = {
        name: datasetName,
        project_id: createdProject.id,
        content_ids: [createdContent.id],
        model: 'gpt-3.5-turbo',
        description: `Dataset généré depuis le contenu "${createdContent.name || 'importé'}" pendant l'onboarding`
      };
      
      // Ajouter des logs de débogage
      console.log("Tentative de création de dataset avec:", datasetData);
      
      // Appel API réel
      const response = await datasetService.create(datasetData);
      
      setCreatedDataset(response);
      enqueueSnackbar('Dataset créé avec succès', { variant: 'success' });
      
      // Commencer à vérifier si le dataset est prêt
      setDatasetLoading(true);
      setTimeout(() => checkDatasetStatus(response.id), 2000);
      
      return true;
    } catch (error) {
      console.error('Erreur détaillée lors de la création du dataset:', error);
      // Afficher plus de détails sur l'erreur si disponible
      if (error.response) {
        console.error("Détails de l'erreur:", {
          status: error.response.status,
          data: error.response.data
        });
      }
      setDatasetError(error.message || "Erreur lors de la création du dataset");
      enqueueSnackbar(`Erreur: ${error.message || "Échec de la création du dataset"}`, { variant: 'error' });
      return false;
    } finally {
      setCreatingDataset(false);
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
          n_epochs: 3,
          learning_rate: 0.0002,
          batch_size: 4
        }
      };
      
      // Appel API réel
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

  // Modifier la fonction handleNext pour exécuter les actions API à chaque étape
  const handleNext = async () => {
    // Vérifier s'il y a des actions à effectuer selon l'étape
    switch (activeStep) {
      case 1: // Après étape projet, créer le projet
        const projectSuccess = await createProject();
        if (!projectSuccess) return; // Ne pas avancer si échec
        break;
      
      case 2: // Après étape contenu, vérifier que le contenu est uploadé
        if (!uploadSuccess) {
          setUploadError("Veuillez d'abord uploader un contenu");
          return;
        }
        break;
      
      case 3: // Après étape dataset, créer le dataset
        if (createdDataset && datasetReady) {
          // Dataset déjà créé et prêt, on peut continuer
          break;
        }
        
        const datasetSuccess = await createDataset();
        if (!datasetSuccess) return; // Ne pas avancer si échec
        
        // Si le dataset est créé mais pas encore prêt, attendre
        if (!datasetReady) {
          enqueueSnackbar('Veuillez attendre que le dataset soit prêt', { variant: 'warning' });
          return;
        }
        break;
      
      case 4: // Après étape fine-tuning
        // Vérifier d'abord la clé API
        const apiKeySuccess = await saveApiKey();
        if (!apiKeySuccess) return;
        
        // Puis lancer le fine-tuning
        const fineTuningSuccess = await createFineTuning();
        if (!fineTuningSuccess) return;
        break;
    }
    
    // Si tout s'est bien passé, avancer à l'étape suivante
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Modifier la fonction completeOnboarding pour lancer un fine-tune
  const completeOnboarding = async () => {
    setIsCompleting(true);
    setCompletionError(null);
    
    try {
      // Créer un payload normalisé avec des clés en snake_case
      const payload = {
        email: user.email,
        name: user.name,
        is_active: user.is_active,
        has_completed_onboarding: true,  // Utiliser le nom attendu par le backend
      };

      console.log("Mise à jour de l'utilisateur avec payload:", payload);
      const updatedUser = await updateUser(payload);
      console.log("Résultat de la mise à jour:", updatedUser);
      
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
            console.error('Détails de la réponse d'erreur:', {
              status: checkoutError.response.status,
              data: checkoutError.response.data,
              headers: checkoutError.response.headers,
            });
          }
          setCompletionError(`Erreur lors de la redirection vers la page de paiement: ${checkoutError.message}`);
        }
      } else {
        console.error("La mise à jour de l'état d'onboarding a échoué. Données reçues:", JSON.stringify(updatedUser, null, 2));
        setCompletionError("L'état d'onboarding n'a pas pu être mis à jour correctement");
      }
    } catch (updateError) {
      console.error('Erreur lors de la mise à jour du profil:', updateError);
      setCompletionError(updateError.message || "Erreur lors de la mise à jour du profil");
      if (updateError.message === 'Not authenticated') {
        navigate('/login');
      }
    } finally {
      setIsCompleting(false);
    }
  };

  // Ajouter cette fonction après createDataset
  const checkDatasetStatus = async (datasetId) => {
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

  // Contenu des étapes
  const getStepContent = (step) => {
    switch (step) {
      case 0:
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
                  backgroundColor: 'primary.main',
                  margin: '0 auto 24px',
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
                }}
              >
                <PsychologyIcon sx={{ fontSize: 60 }} />
              </Avatar>
            </motion.div>
            
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Bienvenue sur FinTune Platform
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
              Nous allons vous guider à travers les étapes pour créer votre premier modèle d'IA fine-tuné.
              Ce processus prend environ 5 minutes.
            </Typography>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
                sx={{ px: 4, py: 1.5, borderRadius: 3 }}
              >
                Commencer
              </Button>
            </motion.div>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  backgroundColor: 'primary.main',
                  mr: 2,
                }}
              >
                <FolderIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Créer un projet
              </Typography>
            </Box>
            
            <Typography variant="body1" paragraph>
              Un projet regroupe vos contenus, datasets et modèles fine-tunés sur un même sujet.
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Nom du projet"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                placeholder="Ex: Assistant commercial, FAQ automatique..."
                sx={{ mb: 3 }}
              />
              
              <TextField
                label="Description (optionnelle)"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                multiline
                rows={3}
                placeholder="Décrivez l'objectif de ce projet..."
              />
            </FormControl>
            
            {projectError && (
              <Typography color="error" sx={{ mt: 2 }}>
                {projectError}
              </Typography>
            )}
          </Box>
        );
      case 2:
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
              Importez le contenu qui servira de base pour fine-tuner votre modèle.
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Type de contenu</InputLabel>
              <Select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                label="Type de contenu"
                disabled={uploading || uploadSuccess}
              >
                <MenuItem value="text">Texte brut</MenuItem>
                <MenuItem value="pdf">Document PDF</MenuItem>
                <MenuItem value="youtube">Lien YouTube</MenuItem>
                <MenuItem value="website">Site web</MenuItem>
              </Select>
            </FormControl>
            
            {/* Interface différente selon le type de contenu */}
            {(contentType === 'youtube' || contentType === 'website') ? (
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="URL"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  placeholder={contentType === 'youtube' ? "https://www.youtube.com/watch?v=..." : "https://example.com"}
                  disabled={uploading || uploadSuccess}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Nom du contenu"
                  value={contentName}
                  onChange={(e) => setContentName(e.target.value)}
                  placeholder="Nom descriptif pour ce contenu"
                  disabled={uploading || uploadSuccess}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={handleUrlContent}
                  disabled={uploading || uploadSuccess || !contentUrl || !contentName}
                  startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                >
                  {uploading ? 'Ajout en cours...' : 'Ajouter l\'URL'}
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: uploadSuccess ? 'success.main' : uploadError ? 'error.main' : 'divider',
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
                }}
                onClick={() => !uploadSuccess && !uploading && fileInputRef.current.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                  accept={contentType === 'pdf' ? '.pdf' : contentType === 'text' ? '.txt,.doc,.docx' : '*'}
                  disabled={uploading || uploadSuccess}
                />
                
                {uploading ? (
                  <CircularProgress size={48} sx={{ mb: 2 }} />
                ) : uploadSuccess ? (
                  <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                ) : (
                  <CloudUploadIcon sx={{ fontSize: 48, color: uploadError ? 'error.main' : 'text.secondary', mb: 2 }} />
                )}
                
                <Typography variant="body1" gutterBottom>
                  {uploadSuccess 
                    ? `Fichier "${file?.name}" uploadé avec succès` 
                    : uploading 
                      ? 'Upload en cours...' 
                      : 'Glissez-déposez votre fichier ici'}
                </Typography>
                
                {!uploadSuccess && !uploading && (
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
                  </>
                )}
              </Box>
            )}
            
            {uploadError && (
              <Typography color="error" sx={{ mt: 2 }}>
                {uploadError}
              </Typography>
            )}
          </Box>
        );
      case 3:
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  backgroundColor: 'success.main',
                  mr: 2,
                }}
              >
                <DatasetIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Générer un dataset
              </Typography>
            </Box>
            
            <Typography variant="body1" paragraph>
              Nous allons générer automatiquement des paires question-réponse à partir de votre contenu.
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Nom du dataset"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                required
                sx={{ mb: 3 }}
              />
            </FormControl>
            
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                mb: 3,
              }}
            >
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Options de génération
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Nombre de paires à générer</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>100</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Longueur maximale des réponses</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>500 tokens</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Modèle utilisé pour la génération</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>GPT-3.5 Turbo</Typography>
                </Box>
              </Stack>
            </Paper>
            
            {datasetError && (
              <Typography color="error" sx={{ mt: 2 }}>
                {datasetError}
              </Typography>
            )}
            
            {(creatingDataset || datasetLoading) && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  {creatingDataset 
                    ? "Création du dataset en cours..." 
                    : "Génération des paires question-réponse..."}
                </Typography>
              </Box>
            )}
            
            {createdDataset && !datasetLoading && datasetReady && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="body1">
                  Dataset généré avec succès ! Vous pouvez maintenant passer à l'étape suivante.
                </Typography>
              </Box>
            )}
          </Box>
        );
      case 4:
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
            
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                mb: 3,
              }}
            >
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Paramètres d'entraînement
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Nombre d'époques</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>3</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Learning rate</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>0.0002</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Batch size</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>4</Typography>
                </Box>
              </Stack>
            </Paper>
            
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
              <Typography color="error" sx={{ mt: 2 }}>
                {fineTuningError}
              </Typography>
            )}
            
            {creatingFineTuning && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        );
      case 5:
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
                  backgroundColor: 'success.main',
                  margin: '0 auto 24px',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 60 }} />
              </Avatar>
            </motion.div>
            
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Félicitations !
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
              Vous avez terminé l'onboarding et vous êtes prêt à utiliser FinTune Platform.
              Votre premier modèle est en cours d'entraînement et sera bientôt disponible.
            </Typography>
            
            {completionError && (
              <Typography color="error" sx={{ mb: 3 }}>
                {completionError}
              </Typography>
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
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
            {/* Stepper */}
            {activeStep > 0 && activeStep < steps.length - 1 && (
              <Stepper 
                activeStep={activeStep - 1} 
                alternativeLabel
                sx={{ mb: 5 }}
              >
                {steps.slice(1, steps.length - 1).map((label) => (
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
            
            {/* Boutons de navigation */}
            {activeStep > 0 && activeStep < steps.length - 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5 }}>
                <Button
                  onClick={handleBack}
                  startIcon={<ArrowBackIcon />}
                  sx={{ borderRadius: 3 }}
                  disabled={creatingProject || uploading || creatingDataset || creatingFineTuning}
                >
                  Retour
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={activeStep === 1 && creatingProject ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                  sx={{ borderRadius: 3 }}
                  disabled={creatingProject || uploading || creatingDataset || creatingFineTuning}
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