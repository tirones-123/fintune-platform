import React, { useState, useEffect, useCallback } from 'react';
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
import { fineTuningService, helperService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/common/PageTransition';
import ChatIcon from '@mui/icons-material/Chat';

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

  // Encapsuler fetchFineTunedModels dans useCallback
  const fetchFineTunedModels = useCallback(async () => {
    // Mettre setLoadingModels seulement si ce n'est pas un rafraîchissement silencieux ?
    // Pour l'instant, on le met toujours pour indiquer l'activité.
    setLoadingModels(true); 
    // Ne pas réinitialiser l'erreur ici pour ne pas effacer une erreur précédente pendant le refresh
    // setError(''); 
    try {
      const allFineTunings = await fineTuningService.getAll();
      const completedFineTunings = allFineTunings
        .filter(ft => ft.status === 'completed' && ft.fine_tuned_model)
        .map(ft => ({ 
            id: ft.id, 
            name: ft.name || `Fine-tune ${ft.id}`,
            externalId: ft.fine_tuned_model 
        })); 
      setFineTunedModels(completedFineTunings);
      setAllModels([...standardOpenAIModels, ...completedFineTunings]);
      // Conserver la sélection actuelle si elle existe toujours, sinon revenir au premier standard
      setSelectedModel(prev => 
         allModels.some(m => m.id === prev) ? prev : (standardOpenAIModels[0]?.id || '')
      );
    } catch (err) {
      console.error("Erreur chargement modèles fine-tunés:", err);
      // Afficher l'erreur seulement si ce n'est pas juste un refresh qui échoue
      if (loadingModels) { // Si c'était le chargement initial
          setError('Erreur chargement des modèles fine-tunés.');
      }
      // Garder la liste actuelle des modèles en cas d'erreur de refresh
    } finally {
      setLoadingModels(false);
    }
  }, [loadingModels]);

  // Charger les modèles au montage initial
  useEffect(() => {
    fetchFineTunedModels();
  }, [fetchFineTunedModels]); // Utiliser fetchFineTunedModels comme dépendance

  // Écouter l'événement pour rafraîchir la liste
  useEffect(() => {
    const handleUpdate = () => {
      console.log('Événement finetuningUpdate reçu, rafraîchissement des modèles...');
      fetchFineTunedModels(); 
    };
    
    window.addEventListener('finetuningUpdate', handleUpdate);
    
    // Nettoyer l'écouteur
    return () => {
      window.removeEventListener('finetuningUpdate', handleUpdate);
    };
  }, [fetchFineTunedModels]); // Dépendance sur la fonction useCallback

  // Gérer l'envoi du prompt
  const handleSendPrompt = async () => {
    if (!selectedModel || !prompt.trim()) {
      setError('Veuillez sélectionner un modèle et entrer un prompt.');
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
      let apiResponse;
      // Utiliser le nouvel endpoint générique pour tous les modèles
      // Il gère la distinction standard/fine-tuné côté backend
      apiResponse = await helperService.generateCompletion(
          currentModelId.toString(), // Envoyer l'ID (numérique ou string)
          currentPrompt,
          currentSystemMessage
      );
      
      // Ajouter la réponse de l'assistant à la conversation
      const newAssistantMessage = { role: 'assistant', content: apiResponse.response };
      setConversation(prev => [...prev, newAssistantMessage]);

    } catch (err) {
      console.error("Erreur lors de la génération de la complétion:", err);
      setError(err.message || 'Une erreur est survenue lors de la communication avec le modèle.');
      // Optionnel: Ajouter un message d'erreur à la conversation
      // const errorMessage = { role: 'assistant', content: `Erreur: ${err.message}` };
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
          Playground IA
        </Typography>

        <Grid container spacing={3} sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {/* Colonne de gauche: Configuration */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Configuration</Typography>
              
              <FormControl fullWidth sx={{ mb: 2.5 }}>
                <InputLabel id="model-select-label">
                  Modèle {loadingModels && <CircularProgress size={14} sx={{ ml: 1 }} />}
                </InputLabel>
                <Select
                  labelId="model-select-label"
                  value={selectedModel}
                  label="Modèle"
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={loadingModels}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 400 } } }}
                >
                  <ListSubheader>Modèles Standards (OpenAI)</ListSubheader>
                  {standardOpenAIModels.map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name}
                    </MenuItem>
                  ))}
                  {fineTunedModels.length > 0 && <ListSubheader>Vos Modèles Fine-Tunés</ListSubheader>}
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
                label="System Message"
                value={systemMessage}
                onChange={(e) => setSystemMessage(e.target.value)}
                placeholder="Décrivez le comportement souhaité..."
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
                       <Typography variant="h6">La conversation apparaîtra ici</Typography>
                     </Box>
                  )}
                  {conversation.map((msg, index) => (
                    <Box 
                      key={index} 
                      sx={{
                        mb: 1.5, 
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: msg.role === 'user' ? 'primary.light' : 'background.paper',
                        border: msg.role === 'assistant' ? `1px solid ${theme.palette.divider}` : 'none',
                        ml: msg.role === 'assistant' ? 0 : 'auto', // Aligner user à droite
                        mr: msg.role === 'user' ? 0 : 'auto', // Aligner assistant à gauche
                        maxWidth: '85%',
                        wordWrap: 'break-word'
                      }}
                    >
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          whiteSpace: 'pre-wrap', // Conserver les sauts de ligne
                          color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary'
                        }}
                       >
                         {msg.content}
                      </Typography>
                    </Box>
                  ))}
                   {loadingResponse && <CircularProgress size={24} sx={{ alignSelf: 'center' }} />}
                   {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
                </Box>

                {/* Zone de saisie */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                   <TextField
                     fullWidth
                     variant="outlined"
                     placeholder="Discutez avec votre modèle..."
                     value={prompt}
                     onChange={(e) => setPrompt(e.target.value)}
                     onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { handleSendPrompt(); e.preventDefault(); } }}
                     sx={{ mr: 1 }}
                   />
                   <Button 
                     variant="contained" 
                     onClick={handleSendPrompt} 
                     disabled={loadingResponse || !prompt.trim() || !selectedModel}
                     sx={{ height: '56px' }} // Aligner hauteur avec TextField
                   >
                     <SendIcon />
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