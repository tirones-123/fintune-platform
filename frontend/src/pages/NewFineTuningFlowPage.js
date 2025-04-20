import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import PageTransition from '../components/common/PageTransition';
import ContentManager from '../components/fine-tuning-flow/ContentManager';
import ConfigManager from '../components/fine-tuning-flow/ConfigManager';
import CharacterEstimator from '../components/fine-tuning-flow/CharacterEstimator';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { projectService, api } from '../services/apiService'; // Importer api pour l'endpoint
import SystemPromptGenerator from '../components/fine-tuning-flow/SystemPromptGenerator';

// Copier/Coller depuis ConfigManager ou OnboardingPage
const providerModels = {
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o (Modèle le plus performant et récent)', apiId: 'gpt-4o-2024-08-06' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Bon rapport qualité/prix)', apiId: 'gpt-4o-mini-2024-07-18' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Économique, bonne performance)', apiId: 'gpt-3.5-turbo-0125' },
  ],
  anthropic: [],
};

const steps = ['Définir l\'Assistant', 'Ajouter/Sélectionner Contenu', 'Configurer Modèle & Clé API', 'Lancer le Job'];

const NewFineTuningFlowPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [activeStep, setActiveStep] = useState(0);
  const [project, setProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);

  // États gérés par les sous-composants
  const [selectedContentIds, setSelectedContentIds] = useState([]);
  const [fineTuningConfig, setFineTuningConfig] = useState({});
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [isContentProcessing, setIsContentProcessing] = useState(false);
  
  // Nouveaux états pour l'étape 0
  const [systemPrompt, setSystemPrompt] = useState('');
  const [minCharactersRecommended, setMinCharactersRecommended] = useState(0);

  // État pour le lancement
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState(null);

  // Charger les détails du projet
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await projectService.getById(projectId);
        setProject(data);
      } catch (err) {
        enqueueSnackbar("Erreur chargement projet", { variant: 'error' });
        navigate('/dashboard'); // Rediriger si projet non trouvé
      } finally {
        setLoadingProject(false);
      }
    };
    fetchProject();
  }, [projectId, navigate, enqueueSnackbar]);

  // Callbacks pour remonter l'état
  const handleContentChange = useCallback((ids) => setSelectedContentIds(ids), []);
  const handleConfigChange = useCallback((config) => {
      setFineTuningConfig(prev => ({ 
          ...prev, 
          provider: config.provider, 
          model: config.model 
        }));
    }, []);
  const handleApiKeyValidation = useCallback((isValid) => setIsApiKeyValid(isValid), []);
  const handleCharacterCountChange = useCallback((count) => setCharacterCount(count), []);
  const handleProcessingStatusChange = useCallback((isProcessing) => setIsContentProcessing(isProcessing), []);
  
  // Callback pour la nouvelle étape 0
  const handleSystemPromptGenerated = useCallback((data) => {
      setSystemPrompt(data.system_prompt);
      setMinCharactersRecommended(data.min_characters_recommended);
      setFineTuningConfig(prev => ({ ...prev, system_prompt: data.system_prompt }));
    }, []);

  // Mettre à jour la logique de navigation entre étapes
  const handleNext = () => {
    if (activeStep === 0 && !systemPrompt) { 
         enqueueSnackbar("Veuillez générer un System Prompt.", { variant: 'warning' });
         return;
       }
    if (activeStep === 1 && selectedContentIds.length === 0) { 
      enqueueSnackbar("Veuillez sélectionner au moins un contenu.", { variant: 'warning' });
      return;
    }
    if (activeStep === 1 && isContentProcessing) {
        enqueueSnackbar("Veuillez attendre la fin du traitement des contenus.", { variant: 'warning' });
        return;
    }
    if (activeStep === 2 && !isApiKeyValid) { 
        enqueueSnackbar("Veuillez valider votre clé API avant de continuer.", { variant: 'warning' });
        return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Mettre à jour handleLaunchJob pour utiliser le systemPrompt de l'état
  const handleLaunchJob = async () => {
    setIsLaunching(true);
    setLaunchError(null);

    const payload = {
        project_id: parseInt(projectId),
        content_ids: selectedContentIds,
        config: {
            provider: fineTuningConfig.provider,
            model: fineTuningConfig.model, 
            system_prompt: systemPrompt,
            job_name: `FineTune_${project?.name || 'Projet'}_${Date.now()}`
        }
    };
    
     // Trouver l'apiId correspondant au modèle sélectionné
     const providerModelsList = providerModels[fineTuningConfig.provider] || [];
     const selectedModelDetails = providerModelsList.find(m => m.id === fineTuningConfig.model);
     if (selectedModelDetails?.apiId) {
         payload.config.model = selectedModelDetails.apiId; 
     } else {
         // Si apiId non trouvé, on utilise l'id comme fallback (peut échouer côté OpenAI)
         payload.config.model = fineTuningConfig.model;
         console.warn(`apiId non trouvé pour le modèle ${fineTuningConfig.model}, utilisation de l'id.`);
     }

    try {
        console.log("Envoi de la requête de lancement:", payload);
        const response = await api.post('/api/fine-tuning-jobs', payload);
        console.log("Réponse de l'API:", response.data);

        if (response.data.status === "pending_payment" && response.data.checkout_url) {
            enqueueSnackbar("Paiement requis. Redirection vers Stripe...", { variant: 'info' });
            window.location.href = response.data.checkout_url;
        } else if (response.data.status === "processing_started" && response.data.redirect_url) {
            enqueueSnackbar("Fine-tuning lancé avec succès !", { variant: 'success' });
            // Utiliser navigate pour la redirection relative
            const relativeRedirectUrl = response.data.redirect_url.replace(process.env.REACT_APP_FRONTEND_URL || '', ''); // Obtenir le chemin relatif
            navigate(relativeRedirectUrl || '/dashboard'); // Naviguer
        } else {
             throw new Error(response.data.message || "Réponse inattendue de l'API");
        }

    } catch (error) {
        console.error("Erreur lancement fine-tuning job:", error);
        const errorMsg = error.response?.data?.detail || error.message || "Erreur inconnue";
        setLaunchError(errorMsg);
        enqueueSnackbar(`Erreur: ${errorMsg}`, { variant: 'error' });
    } finally {
        setIsLaunching(false);
    }
  };

  // Mettre à jour le rendu des étapes
  const getStepComponent = (step) => {
    switch (step) {
      case 0: 
        return <SystemPromptGenerator onSystemPromptGenerated={handleSystemPromptGenerated} />;
      case 1:
        return (
            <>
                <ContentManager 
                    projectId={projectId} 
                    onContentChange={handleContentChange} 
                    onProcessingStatusChange={handleProcessingStatusChange}
                />
                 {selectedContentIds.length > 0 && (
                    <CharacterEstimator 
                        selectedContentIds={selectedContentIds} 
                        onCharacterCountChange={handleCharacterCountChange}
                        minCharactersRecommended={minCharactersRecommended}
                    />
                 )}
            </>
        );
      case 2: 
        return (
          <ConfigManager 
            onConfigChange={handleConfigChange} 
            onApiKeyValidation={handleApiKeyValidation} 
          />
        );
      case 3: 
        return (
            <Box>
                <Typography variant="h6" gutterBottom>Récapitulatif et Lancement</Typography>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography><strong>Projet:</strong> {project?.name}</Typography>
                    <Typography><strong>Contenus sélectionnés:</strong> {selectedContentIds.length}</Typography>
                    <Typography><strong>Caractères estimés/comptés:</strong> {characterCount.toLocaleString()}</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography><strong>Fournisseur:</strong> {fineTuningConfig.provider}</Typography>
                    <Typography><strong>Modèle:</strong> {fineTuningConfig.model}</Typography>
                    <Typography><strong>System Prompt:</strong> {systemPrompt || "(Par défaut)"}</Typography>
                </Paper>
                 <CharacterEstimator 
                    selectedContentIds={selectedContentIds} 
                    minCharactersRecommended={minCharactersRecommended}
                 />
                {launchError && <Alert severity="error" sx={{ mb: 2 }}>{launchError}</Alert>}
                <Button 
                    variant="contained" 
                    size="large"
                    onClick={handleLaunchJob}
                    disabled={isLaunching}
                    startIcon={isLaunching ? <CircularProgress size={20} color="inherit" /> : <PsychologyIcon />}
                >
                   {isLaunching ? 'Lancement en cours...' : 'Lancer le Fine-tuning'}
                </Button>
            </Box>
        );
      default:
        return 'Étape inconnue';
    }
  };

  if (loadingProject) {
    return <CircularProgress />;
  }

  return (
    <PageTransition>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Nouveau Fine-tuning pour "{project?.name}"
        </Typography>
        
        <Paper sx={{ p: { xs: 2, md: 4 } }}>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
                {steps.map((label) => (
                <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                </Step>
                ))}
            </Stepper>

            <Box sx={{ minHeight: 300, mb: 4 }}>
                 {getStepComponent(activeStep)}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                >
                    Précédent
                </Button>
                {activeStep < steps.length - 1 ? (
                    <Button 
                        variant="contained" 
                        onClick={handleNext}
                        disabled={
                            (activeStep === 0 && !systemPrompt) ||
                            (activeStep === 1 && (selectedContentIds.length === 0 || isContentProcessing)) || 
                            (activeStep === 2 && !isApiKeyValid) 
                        } 
                    >
                        Suivant
                    </Button>
                ) : null}
             </Box>
        </Paper>
      </Container>
    </PageTransition>
  );
};

export default NewFineTuningFlowPage; 