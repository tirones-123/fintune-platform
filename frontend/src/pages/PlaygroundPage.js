import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  CircularProgress,
  Paper,
  useTheme,
  Alert,
  Grid,
  Stack,
  Avatar,
  ListSubheader
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useTranslation } from 'react-i18next';
import { fineTuningService, helperService, datasetService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/common/PageTransition';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';

// Définir les modèles OpenAI standards ici
const standardOpenAIModels = [
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'gpt-3.5-turbo-0125', name: 'GPT-3.5 Turbo' },
  // Ajouter d'autres si pertinent
];

function PlaygroundPage() {
  const theme = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // États pour les modèles
  const [fineTunedModels, setFineTunedModels] = useState([]);
  const [allModels, setAllModels] = useState([...standardOpenAIModels]); // Commencer avec les standards
  const [selectedModel, setSelectedModel] = useState(standardOpenAIModels[0]?.id || ''); // Sélectionner le premier standard par défaut
  const [loadingModels, setLoadingModels] = useState(true);

  // États pour la configuration et l'interaction
  const [systemMessage, setSystemMessage] = useState('You are a helpful assistant.');
  const [prompt, setPrompt] = useState('');
  const [conversation, setConversation] = useState([]); // [{ role: 'user' | 'assistant', content: '...' }]
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [error, setError] = useState('');

  // Ref pour suivre le modèle sélectionné précédemment
  const prevSelectedModelRef = useRef();

  // Encapsuler fetchFineTunedModels dans useCallback
  const fetchFineTunedModels = useCallback(async () => {
    setLoadingModels(true); 
    try {
      const allFineTunings = await fineTuningService.getAll();
      const completedFineTunings = allFineTunings
        .filter(ft => ft.status === 'completed' && ft.fine_tuned_model)
        .map(ft => ({ 
            id: ft.fine_tuned_model,
            name: ft.name || `Fine-tune ${ft.id}`,
            internalId: ft.id,
            isFineTuned: true
        })); 
      setFineTunedModels(completedFineTunings);
      // Mettre à jour allModels ici après avoir les nouvelles données
      const updatedAllModels = [...standardOpenAIModels, ...completedFineTunings];
      console.log('Raw fine-tunings from API:', allFineTunings);
      console.log('Filtered & Mapped FineTunings:', completedFineTunings);
      console.log('Combined All Models for Dropdown:', updatedAllModels);
      setAllModels(updatedAllModels);
      
      // Conserver la sélection actuelle si elle existe toujours dans la nouvelle liste
      setSelectedModel(prev => 
         updatedAllModels.some(m => m.id === prev) ? prev : (standardOpenAIModels[0]?.id || '')
      );
    } catch (err) {
      console.error("Erreur chargement modèles fine-tunés:", err);
      // Ne pas écraser l'erreur précédente si c'est juste un refresh qui échoue
      // setError('Erreur chargement des modèles fine-tunés.'); 
    } finally {
      setLoadingModels(false);
    }
  }, [t]);

  // Charger les modèles au montage initial
  useEffect(() => {
    fetchFineTunedModels();
  }, [fetchFineTunedModels]);

  // Écouter l'événement pour rafraîchir la liste
  useEffect(() => {
    const handleUpdate = () => {
      console.log('>>> PlaygroundPage: finetuningUpdate event received!', new Date().toLocaleTimeString());
      fetchFineTunedModels();
    };
    window.addEventListener('finetuningUpdate', handleUpdate);
    return () => {
      window.removeEventListener('finetuningUpdate', handleUpdate);
    };
  }, [fetchFineTunedModels]);

  // --- MODIFICATION : Charger le system prompt via API pour les modèles FT ---
  useEffect(() => {
    const loadSystemPrompt = async () => {
      console.log(`>>> PlaygroundPage: useEffect for system prompt running. Selected Model: ${selectedModel}`, new Date().toLocaleTimeString());
      
      // Vérifier si le modèle a réellement changé
      const modelChanged = prevSelectedModelRef.current !== selectedModel;

      if (modelChanged) {
        console.log(`>>> Model changed from ${prevSelectedModelRef.current} to ${selectedModel}. Clearing conversation.`);
        setConversation([]); // Vider conversation/prompt/erreur SEULEMENT si le modèle a changé
        setPrompt(''); 
        setError('');
      } else {
        console.log(`>>> Model (${selectedModel}) did not change. Preserving conversation.`);
      }
      
      // Mettre à jour la référence pour la prochaine exécution
      prevSelectedModelRef.current = selectedModel;

      if (!selectedModel) {
        setSystemMessage('You are a helpful assistant.'); // Défaut si rien n'est sélectionné
        return;
      }

      const modelDetails = allModels.find(m => m.id === selectedModel);

      if (modelDetails?.isFineTuned && modelDetails.internalId) {
        console.log(`Modèle fine-tuné ${selectedModel} (ID interne: ${modelDetails.internalId}) sélectionné. Recherche du dataset...`);
        try {
          // 1. Récupérer les détails du fine-tuning pour obtenir dataset_id
          const ftDetails = await fineTuningService.getById(modelDetails.internalId);
          if (ftDetails && ftDetails.dataset_id) {
            console.log(`Dataset ID trouvé: ${ftDetails.dataset_id}. Récupération du dataset...`);
            // 2. Récupérer les détails du dataset
            const dsDetails = await datasetService.getById(ftDetails.dataset_id);
            const prompt = dsDetails.system_content || t('common.defaultSystemPrompt');
            setSystemMessage(prompt);
            console.log(`System prompt chargé pour ${selectedModel}:`, prompt);
          } else {
            console.warn(`Impossible de récupérer le dataset_id pour le fine-tuning ${modelDetails.internalId}`);
            setSystemMessage(t('common.defaultSystemPrompt'));
          }
        } catch (err) {
          console.error("Erreur lors de la récupération du system prompt:", err);
          setError(t('playground.errors.loadSystemPrompt'));
          setSystemMessage(t('common.defaultSystemPrompt'));
        }
      } else {
        // Modèle standard
        setSystemMessage(t('common.defaultSystemPrompt'));
        console.log(`System prompt réinitialisé pour modèle standard: ${selectedModel}`);
      }
    };

    loadSystemPrompt();

  }, [selectedModel, allModels, t]);
  // --- FIN MODIFICATION ---

  // Gérer l'envoi du prompt
  const handleSendPrompt = async () => {
    if (!selectedModel || !prompt.trim()) {
      setError(t('playground.errors.modelAndPromptRequired'));
      return;
    }
    setLoadingResponse(true);
    setError('');
    
    // Ajouter le message utilisateur à la conversation
    const newUserMessage = { role: 'user', content: prompt };
    setConversation(prev => [...prev, newUserMessage]);
    
    // Préparer l'appel API
    const currentPrompt = prompt;
    const currentSystemMessage = systemMessage;
    const currentModelId = selectedModel;
    
    // Vider le champ de prompt après envoi
    setPrompt('');

    try {
      // Construire un historique de la conversation pour donner du contexte au modèle
      const conversationWithCurrent = [...conversation, newUserMessage];
      const historyPrompt = conversationWithCurrent
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');
      const finalPrompt = `${historyPrompt}\nAssistant:`;

      // Appeler l'API avec le prompt complet
      const apiResponse = await helperService.generateCompletion(
        currentModelId,
        finalPrompt,
        currentSystemMessage
      );
      
      // Ajouter la réponse de l'assistant à la conversation
      const newAssistantMessage = { role: 'assistant', content: apiResponse.response };
      setConversation(prev => [...prev, newAssistantMessage]);

    } catch (err) {
      console.error("Erreur lors de la génération de la complétion:", err);
      setError(err.message || t('playground.errors.completionError'));
      // Optionnel: Ajouter un message d'erreur à la conversation
      // const errorMessage = { role: 'assistant', content: t('playground.errors.completionErrorUser', { error: err.message }) };
      // setConversation(prev => [...prev, errorMessage]);
    } finally {
      setLoadingResponse(false);
    }
  };

  // Rendu du composant
  return (
    <PageTransition>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          {t('playground.title')}
        </Typography>

        <Grid container spacing={3} sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {/* Colonne de gauche: Configuration */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>{t('playground.configTitle')}</Typography>
              
              <FormControl fullWidth sx={{ mb: 2.5 }}>
                <InputLabel id="model-select-label">
                  {t('playground.modelLabel')} {loadingModels && <CircularProgress size={14} sx={{ ml: 1 }} />}
                </InputLabel>
                <Select
                  labelId="model-select-label"
                  value={selectedModel}
                  label={t('playground.modelLabel')}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={loadingModels}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 400 } } }}
                >
                  <ListSubheader>{t('playground.standardModelsHeader')}</ListSubheader>
                  {standardOpenAIModels.map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name}
                    </MenuItem>
                  ))}
                  {fineTunedModels.length > 0 && <ListSubheader>{t('playground.fineTunedModelsHeader')}</ListSubheader>}
                  {fineTunedModels.map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                label={t('playground.systemMessageLabel')}
                value={systemMessage}
                onChange={(e) => setSystemMessage(e.target.value)}
                placeholder={t('playground.systemMessagePlaceholder')}
                sx={{ mb: 2.5 }}
              />
              
              {/* Espace pour futurs paramètres (temp, tokens...) */}
              {/* <Divider sx={{ my: 2 }} /> */}
              {/* <Typography variant="subtitle2" sx={{ mb: 1 }}>Paramètres</Typography> */}
              {/* ... Sliders ou inputs pour temp, max_tokens ... */}
              
              <Box sx={{ flexGrow: 1 }} /> {/* Pousse le reste en bas si nécessaire */}
            </Paper>
          </Grid>

          {/* Colonne de droite: Chat */}
          <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
             <Paper elevation={2} sx={{ p: 2, borderRadius: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Zone d'affichage de la conversation */} 
                <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, pr: 1 }}>
                  {conversation.length === 0 && (
                     <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
                       <Avatar sx={{ width: 60, height: 60, mb: 2, bgcolor: 'primary.light' }}>
                         <ChatIcon fontSize="large" />
                       </Avatar>
                       <Typography variant="h6">{t('playground.conversationPlaceholder')}</Typography>
                     </Box>
                  )}
                  {conversation.map((msg, index) => (
                    <Box 
                      key={index} 
                      sx={{
                        display: 'flex', // Ajout pour aligner avatar et bulle
                        flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                        alignItems: 'flex-start', // Aligner avatar en haut
                        gap: 1.5, // Espace entre avatar et bulle
                        mb: 2, 
                        ml: msg.role === 'assistant' ? 0 : 'auto', // Aligner user à droite
                        mr: msg.role === 'user' ? 0 : 'auto', // Aligner assistant à gauche
                        maxWidth: '85%',
                      }}
                    >
                       {/* Avatar */} 
                       <Avatar
                         sx={{
                            bgcolor: msg.role === 'user' ? 'primary.main' : 'secondary.main',
                            width: 32,
                            height: 32,
                         }}
                       >
                         {msg.role === 'user' ? <PersonIcon fontSize="small"/> : <ChatIcon fontSize="small"/>}
                       </Avatar>
                       {/* Bulle de message */} 
                       <Box
                         sx={{
                           p: 1.5,
                           borderRadius: msg.role === 'user' 
                             ? '16px 16px 4px 16px' 
                             : '16px 16px 16px 4px',
                           bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.100',
                           color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                           wordWrap: 'break-word'
                         }}
                       >
                         <Typography 
                           variant="body1" 
                           sx={{ 
                             whiteSpace: 'pre-wrap',
                           }}
                         >
                           {msg.content}
                         </Typography>
                       </Box>
                    </Box>
                  ))}
                   {loadingResponse && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2}}>
                        <CircularProgress size={24} />
                    </Box>
                   )}
                   {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
                </Box>

                {/* Zone de saisie */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                   <TextField
                     fullWidth
                     variant="outlined"
                     placeholder={t('playground.inputPlaceholder')}
                     value={prompt}
                     onChange={(e) => setPrompt(e.target.value)}
                     onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { handleSendPrompt(); e.preventDefault(); } }}
                     sx={{ mr: 1 }}
                     InputProps={{
                       sx: { borderRadius: '20px', bgcolor: 'background.paper' } 
                     }}
                   />
                   <Button 
                     variant="contained" 
                     onClick={handleSendPrompt} 
                     disabled={loadingResponse || !prompt.trim() || !selectedModel}
                     sx={{ 
                       borderRadius: '50%', // Bouton rond
                       minWidth: '56px',
                       width: '56px',
                       height: '56px',
                       p: 0,
                       boxShadow: 3,
                       '&.Mui-disabled': {
                         bgcolor: 'action.disabledBackground',
                         boxShadow: 'none',
                       }
                     }}
                   >
                    {loadingResponse ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                   </Button>
                </Box>
             </Paper>
          </Grid>
        </Grid>
      </Container>
    </PageTransition>
  );
}

export default PlaygroundPage; 