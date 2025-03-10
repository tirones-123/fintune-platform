import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
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
  FormHelperText,
  CircularProgress,
  Paper,
  Divider,
  Alert,
  styled,
  useTheme,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../context/AuthContext';
import { projectService, datasetService, fineTuningService, apiKeyService } from '../services/localStorageService';
import StripePaymentForm from '../components/payment/StripePaymentForm';

// Composant pour le téléchargement de fichiers stylisé
const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

// Étapes de l'onboarding
const steps = [
  'Configuration du compte',
  'Téléchargement de contenu',
  'Création du dataset',
  'Fine-tuning du modèle',
  'Paiement',
  'Essai du modèle'
];

const OnboardingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, updateUser, subscription } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  
  // Données du projet
  const [projectName, setProjectName] = useState("Mon premier projet");
  const [projectDescription, setProjectDescription] = useState("Projet créé pendant l'onboarding");
  
  // Données du contenu
  const [contentFile, setContentFile] = useState(null);
  const [contentType, setContentType] = useState('text');
  const [contentName, setContentName] = useState('');
  
  // Données du dataset
  const [datasetName, setDatasetName] = useState("Mon premier dataset");
  const [datasetDescription, setDatasetDescription] = useState("Dataset créé pendant l'onboarding");
  
  // Données du fine-tuning
  const [fineTuningName, setFineTuningName] = useState("Mon premier modèle");
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [apiKey, setApiKey] = useState('');
  
  // IDs créés pendant le processus
  const [projectId, setProjectId] = useState(null);
  const [contentId, setContentId] = useState(null);
  const [datasetId, setDatasetId] = useState(null);
  const [fineTuningId, setFineTuningId] = useState(null);
  
  // Modèles disponibles par fournisseur
  const providerModels = {
    openai: [
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      { id: 'gpt-4', name: 'GPT-4 (Nécessite un accès spécial)' },
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

  // Gérer le changement d'étape
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Créer un projet
  const createProject = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simuler un délai pour montrer le chargement
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Créer le projet dans le localStorage
      const newProject = {
        name: projectName,
        description: projectDescription,
        content_count: 0,
        dataset_count: 0
      };
      
      const savedProject = projectService.save(newProject);
      setProjectId(savedProject.id);
      
      handleNext();
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Une erreur est survenue lors de la création du projet.');
    } finally {
      setLoading(false);
    }
  };

  // Télécharger du contenu
  const uploadContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simuler un délai pour montrer le chargement
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Créer le contenu dans le localStorage
      const newContent = {
        name: contentName || 'Document exemple',
        type: contentType,
        project_id: projectId,
        size: Math.floor(Math.random() * 1000000) + 100000, // Taille simulée
        status: 'processed',
        created_at: new Date().toISOString(),
      };
      
      const savedContent = contentService.save(newContent);
      setContentId(savedContent.id);
      
      // Mettre à jour le compteur de contenu du projet
      const project = projectService.getById(projectId);
      project.content_count = (project.content_count || 0) + 1;
      projectService.save(project);
      
      handleNext();
    } catch (err) {
      console.error('Error uploading content:', err);
      setError('Une erreur est survenue lors du téléchargement du contenu.');
    } finally {
      setLoading(false);
    }
  };

  // Créer un dataset
  const createDataset = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simuler un délai pour montrer le chargement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Créer le dataset dans le localStorage
      const newDataset = {
        name: datasetName,
        description: datasetDescription,
        project_id: projectId,
        content_ids: [contentId],
        pairs_count: Math.floor(Math.random() * 100) + 50, // Nombre aléatoire entre 50 et 150
        size: Math.floor(Math.random() * 500000) + 100000, // Taille simulée
        status: 'ready',
        created_at: new Date().toISOString(),
      };
      
      const savedDataset = datasetService.save(newDataset);
      setDatasetId(savedDataset.id);
      
      // Mettre à jour le compteur de datasets du projet
      const project = projectService.getById(projectId);
      project.dataset_count = (project.dataset_count || 0) + 1;
      projectService.save(project);
      
      handleNext();
    } catch (err) {
      console.error('Error creating dataset:', err);
      setError('Une erreur est survenue lors de la création du dataset.');
    } finally {
      setLoading(false);
    }
  };

  // Lancer le fine-tuning
  const startFineTuning = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Sauvegarder la clé API
      if (apiKey) {
        apiKeyService.saveKey(provider, apiKey);
      }
      
      // Simuler un délai pour montrer le chargement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Créer le fine-tuning dans le localStorage
      const newFineTuning = {
        name: fineTuningName,
        dataset_id: datasetId,
        provider: provider,
        model: model,
        status: 'training',
        progress: 0,
        created_at: new Date().toISOString(),
      };
      
      const savedFineTuning = fineTuningService.save(newFineTuning);
      setFineTuningId(savedFineTuning.id);
      
      // Simuler la progression du fine-tuning
      simulateTrainingProgress(savedFineTuning.id);
      
      handleNext();
    } catch (err) {
      console.error('Error starting fine-tuning:', err);
      setError('Une erreur est survenue lors du lancement du fine-tuning.');
    } finally {
      setLoading(false);
    }
  };

  // Simuler la progression du fine-tuning
  const simulateTrainingProgress = (id) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Mettre à jour le statut du fine-tuning
        const fineTuning = fineTuningService.getById(id);
        fineTuning.status = 'completed';
        fineTuning.completed_at = new Date().toISOString();
        fineTuningService.save(fineTuning);
        
        setSuccess(true);
      }
      
      fineTuningService.updateProgress(id, progress);
    }, 1500);
  };

  // Terminer l'onboarding
  const completeOnboarding = () => {
    // Mettre à jour le statut d'onboarding de l'utilisateur
    if (updateUser) {
      updateUser({ ...user, hasCompletedOnboarding: true });
    }
    
    // Rediriger vers le dashboard
    navigate('/dashboard');
  };

  // Gérer le succès du paiement
  const handlePaymentSuccess = () => {
    setPaymentComplete(true);
    handleNext();
  };

  // Contenu des étapes
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Bienvenue sur FinTune Platform !
            </Typography>
            <Typography variant="body1" paragraph>
              Nous allons vous guider à travers la création de votre premier modèle fine-tuné en quelques étapes simples.
            </Typography>
            <Typography variant="body1" paragraph>
              Commençons par créer votre premier projet.
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Nom du projet"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                placeholder="Ex: Assistant commercial, FAQ automatique..."
              />
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Description (optionnelle)"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                multiline
                rows={2}
                placeholder="Décrivez l'objectif de ce projet..."
              />
            </FormControl>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Téléchargez votre contenu
            </Typography>
            <Typography variant="body1" paragraph>
              Téléchargez un document qui servira de base pour fine-tuner votre modèle.
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Type de contenu</InputLabel>
              <Select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                label="Type de contenu"
              >
                <MenuItem value="text">Texte</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="youtube">Vidéo YouTube</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Nom du document"
                value={contentName}
                onChange={(e) => setContentName(e.target.value)}
                placeholder="Ex: Manuel d'utilisation, FAQ..."
              />
            </FormControl>
            
            <UploadBox
              onClick={() => setContentFile('example.txt')}
              sx={{ mb: 3 }}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="body1" gutterBottom>
                Cliquez pour télécharger un fichier
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {contentFile ? `Fichier sélectionné: ${contentFile}` : 'Formats supportés: TXT, PDF, DOCX, URL YouTube'}
              </Typography>
            </UploadBox>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Pour cet exemple, nous utiliserons un document pré-configuré.
            </Alert>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Création du dataset d'entraînement
            </Typography>
            <Typography variant="body1" paragraph>
              Nous allons maintenant créer un dataset à partir de votre contenu pour entraîner le modèle.
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Nom du dataset"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                required
              />
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Description (optionnelle)"
                value={datasetDescription}
                onChange={(e) => setDatasetDescription(e.target.value)}
                multiline
                rows={2}
              />
            </FormControl>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Notre système va automatiquement générer des paires question-réponse à partir de votre contenu pour créer un dataset de qualité.
            </Alert>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configuration du fine-tuning
            </Typography>
            <Typography variant="body1" paragraph>
              Configurez les paramètres pour fine-tuner votre modèle d'IA.
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Important : Le fine-tuning est effectué sur votre compte
              </Typography>
              <Typography variant="body2">
                Le processus de fine-tuning sera exécuté directement sur votre compte {provider === 'openai' ? 'OpenAI' : provider === 'anthropic' ? 'Anthropic' : 'Mistral AI'}, 
                en utilisant votre propre clé API. Cela vous garantit la propriété complète de votre modèle fine-tuné.
              </Typography>
            </Alert>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Nom du modèle"
                value={fineTuningName}
                onChange={(e) => setFineTuningName(e.target.value)}
                required
              />
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Fournisseur</InputLabel>
              <Select
                value={provider}
                onChange={(e) => {
                  setProvider(e.target.value);
                  setModel(providerModels[e.target.value][0].id);
                }}
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
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label={`Clé API ${provider === 'openai' ? 'OpenAI' : provider === 'anthropic' ? 'Anthropic' : 'Mistral AI'}`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                type="password"
                placeholder={`Entrez votre clé API ${provider === 'openai' ? 'OpenAI' : provider === 'anthropic' ? 'Anthropic' : 'Mistral AI'}`}
                required
              />
              <FormHelperText>
                Vous pouvez obtenir votre clé API sur{' '}
                {provider === 'openai' ? (
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com/api-keys</a>
                ) : provider === 'anthropic' ? (
                  <a href="https://console.anthropic.com/account/keys" target="_blank" rel="noopener noreferrer">console.anthropic.com/account/keys</a>
                ) : (
                  <a href="https://console.mistral.ai/api-keys/" target="_blank" rel="noopener noreferrer">console.mistral.ai/api-keys/</a>
                )}
              </FormHelperText>
            </FormControl>
            
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.neutral' }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Coûts estimés :</strong> Le fine-tuning sur {provider === 'openai' ? 'OpenAI' : provider === 'anthropic' ? 'Anthropic' : 'Mistral AI'} pour un dataset de cette taille coûtera environ {provider === 'openai' ? '5-15$' : provider === 'anthropic' ? '10-20$' : '3-10$'} selon la complexité du modèle.
              </Typography>
            </Paper>
          </Box>
        );
      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Démarrez votre essai gratuit
            </Typography>
            <Typography variant="body1" paragraph>
              Pour continuer et lancer votre premier fine-tuning, veuillez démarrer votre essai gratuit de 7 jours.
            </Typography>
            <Typography variant="body1" paragraph>
              Vous ne serez pas débité aujourd'hui. Votre abonnement commencera automatiquement à la fin de la période d'essai.
            </Typography>
            
            <StripePaymentForm onSuccess={handlePaymentSuccess} isTrial={true} />
          </Box>
        );
      case 5:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Votre modèle est en cours d'entraînement
            </Typography>
            
            {!success ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                  <Typography variant="body1">
                    Entraînement en cours... Cela peut prendre quelques minutes.
                  </Typography>
                </Box>
                
                <Alert severity="info" sx={{ mb: 3 }}>
                  Pendant que votre modèle s'entraîne, vous pouvez explorer les fonctionnalités de FinTune Platform.
                </Alert>
              </>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 28, mr: 2 }} />
                  <Typography variant="body1">
                    Félicitations ! Votre modèle a été fine-tuné avec succès.
                  </Typography>
                </Box>
                
                <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <Typography variant="h6" gutterBottom>
                    Modèle prêt à l'emploi
                  </Typography>
                  <Typography variant="body1">
                    Votre modèle "{fineTuningName}" est maintenant disponible pour être utilisé dans vos applications.
                  </Typography>
                </Paper>
                
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => navigate(`/dashboard/chat/${fineTuningId}`)}
                  sx={{ mb: 2 }}
                >
                  Essayer mon modèle maintenant
                </Button>
              </>
            )}
          </Box>
        );
      default:
        return 'Étape inconnue';
    }
  };

  // Actions pour chaque étape
  const handleStepAction = () => {
    switch (activeStep) {
      case 0:
        createProject();
        break;
      case 1:
        uploadContent();
        break;
      case 2:
        createDataset();
        break;
      case 3:
        startFineTuning();
        break;
      case 4:
        // L'action est gérée par le formulaire de paiement
        break;
      case 5:
        completeOnboarding();
        break;
      default:
        handleNext();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="md" sx={{ py: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Créez votre premier modèle IA
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Suivez ces étapes simples pour fine-tuner votre premier modèle d'IA
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Card sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 4, flexGrow: 1 }}>
              {getStepContent(activeStep)}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={activeStep === 0 || loading || activeStep === 4}
                onClick={handleBack}
                variant="outlined"
              >
                Retour
              </Button>
              {activeStep !== 4 && (
                <Button
                  variant="contained"
                  onClick={handleStepAction}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {activeStep === steps.length - 1
                    ? 'Terminer'
                    : loading
                    ? 'Traitement en cours...'
                    : 'Continuer'}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default OnboardingPage; 