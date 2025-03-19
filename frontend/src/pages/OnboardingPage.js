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
import { subscriptionService } from '../services/apiService';

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
  const [activeStep, setActiveStep] = useState(0);
  
  // Données du projet
  const [projectName, setProjectName] = useState("Mon premier projet");
  const [projectDescription, setProjectDescription] = useState("Projet créé pendant l'onboarding");
  
  // Données du contenu
  const [contentType, setContentType] = useState('text');
  
  // Données du dataset
  const [datasetName, setDatasetName] = useState("Mon premier dataset");
  
  // Données du fine-tuning
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-3.5-turbo');
  
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
  const fileInputRef = React.useRef(null);
  
  // Ajout d'un état pour gérer la soumission du formulaire de finalisation
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState(null);

  // Ajouter cette fonction pour gérer l'upload
  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setUploading(true);
    
    // Simuler un upload ou implémenter un vrai upload vers votre API
    try {
      // Remplacer par votre appel API réel
      // const formData = new FormData();
      // formData.append('file', selectedFile);
      // const response = await api.uploadContent(formData);
      
      // Simulation d'un délai d'upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setUploadSuccess(true);
      setUploading(false);
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setUploading(false);
    }
  };

  // Gérer le changement d'étape
  const handleNext = () => {
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
      // Mettre à jour le statut d'onboarding de l'utilisateur
      if (updateUser && user) {
        try {
          // Marquer l'onboarding comme terminé
          console.log("Mise à jour de l'utilisateur avec hasCompletedOnboarding=true", { id: user.id, email: user.email });
          const updatedUser = await updateUser({ ...user, hasCompletedOnboarding: true });
          console.log("Résultat de la mise à jour:", updatedUser);
          
          // Si la mise à jour a réussi, on vérifie que hasCompletedOnboarding est bien à true
          if (updatedUser && updatedUser.hasCompletedOnboarding) {
            // Rediriger directement vers le dashboard sans passer par l'abonnement
            console.log("Redirection vers le dashboard...");
            navigate('/dashboard');
            return;
            
            // Code commenté: passage par Stripe pour abonnement
            /*
            try {
              // Utiliser directement "starter" comme type de plan au lieu de la constante
              console.log("Tentative de création d'une session de paiement pour le plan 'starter'");
              const session = await subscriptionService.createCheckoutSession('starter');
              console.log("Session de paiement créée avec succès:", session);
              
              // Rediriger vers l'URL de checkout Stripe
              if (session && session.url) {
                console.log("Redirection vers:", session.url);
                window.location.href = session.url;
              } else {
                console.error("URL de redirection non reçue dans la session:", session);
                setCompletionError("Erreur de redirection: URL de paiement non disponible");
              }
            } catch (checkoutError) {
              console.error('Erreur lors de la création de la session de paiement:', checkoutError);
              // Log plus détaillé de l'erreur pour le débogage
              if (checkoutError.response) {
                console.error('Détails de la réponse d\'erreur:', {
                  status: checkoutError.response.status,
                  data: checkoutError.response.data,
                  headers: checkoutError.response.headers
                });
              }
              setCompletionError(`Erreur lors de la redirection vers la page de paiement: ${checkoutError.message}`);
            }
            */
          } else {
            // Si la propriété n'a pas été mise à jour malgré le succès de la requête
            console.error("La mise à jour de l'état d'onboarding a échoué. Données reçues:", JSON.stringify(updatedUser, null, 2));
            setCompletionError("L'état d'onboarding n'a pas pu être mis à jour correctement");
          }
        } catch (updateError) {
          console.error('Erreur lors de la mise à jour du profil:', updateError);
          // Log plus détaillé pour comprendre l'erreur
          if (updateError.response) {
            console.error('Détails de la réponse d\'erreur:', {
              status: updateError.response.status,
              data: updateError.response.data,
              headers: updateError.response.headers
            });
          }
          setCompletionError(updateError.message || "Erreur lors de la mise à jour du profil");
          
          // Si l'erreur est liée à l'authentification, rediriger vers la page de connexion
          if (updateError.message === 'Not authenticated') {
            navigate('/login');
          }
        }
      } else {
        // Si l'utilisateur n'est pas connecté ou si updateUser n'est pas disponible
        const errorMsg = !user ? "Utilisateur non connecté" : "Fonction de mise à jour non disponible";
        console.error(errorMsg, { user, updateUser: !!updateUser });
        setCompletionError(errorMsg);
        navigate('/login');
      }
    } catch (error) {
      console.error('Erreur globale lors de la finalisation de l\'onboarding:', error);
      setCompletionError(error.message || "Une erreur s'est produite lors de la finalisation");
    } finally {
      setIsCompleting(false);
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
              >
                <MenuItem value="text">Texte brut</MenuItem>
                <MenuItem value="pdf">Document PDF</MenuItem>
                <MenuItem value="youtube">Lien YouTube</MenuItem>
                <MenuItem value="website">Site web</MenuItem>
              </Select>
            </FormControl>
            
            <Box
              sx={{
                border: '2px dashed',
                borderColor: uploadSuccess ? 'success.main' : 'divider',
                borderRadius: 3,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: 'background.paper',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: (theme) => 
                    theme.palette.mode === 'dark'
                      ? 'rgba(96, 165, 250, 0.05)'
                      : 'rgba(59, 130, 246, 0.05)',
                },
              }}
              onClick={() => fileInputRef.current.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                accept={contentType === 'pdf' ? '.pdf' : contentType === 'text' ? '.txt,.doc,.docx' : '*'}
              />
              
              {uploading ? (
                <CircularProgress size={48} sx={{ mb: 2 }} />
              ) : uploadSuccess ? (
                <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              ) : (
                <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
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
                >
                  Retour
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ borderRadius: 3 }}
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