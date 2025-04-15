import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  CircularProgress,
  Paper,
  Chip,
  Alert,
  FormHelperText,
  FormControl,
  Avatar
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { useSnackbar } from 'notistack';

// Ce composant gère la définition de l'objectif et la génération du system prompt
const SystemPromptGenerator = ({ onSystemPromptGenerated }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [assistantPurpose, setAssistantPurpose] = useState('');
  const [systemContent, setSystemContent] = useState('');
  const [generatingSystemContent, setGeneratingSystemContent] = useState(false);
  const [systemContentError, setSystemContentError] = useState(null);
  const [fineTuningCategory, setFineTuningCategory] = useState('');
  const [minCharactersRecommended, setMinCharactersRecommended] = useState(0);

  // Fonction pour générer le system content (similaire à OnboardingPage)
  const generateSystemContent = async () => {
    if (!assistantPurpose.trim()) {
      setSystemContentError("Veuillez décrire le but de votre assistant.");
      return;
    }
    setGeneratingSystemContent(true);
    setSystemContentError(null);
    try {
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
        throw new Error(errorData.detail || "Erreur génération system content");
      }
      const data = await response.json();
      
      setSystemContent(data.system_content);
      setFineTuningCategory(data.fine_tuning_category);
      setMinCharactersRecommended(data.min_characters_recommended);
      
      // Informer le composant parent
      onSystemPromptGenerated({
          system_prompt: data.system_content,
          fine_tuning_category: data.fine_tuning_category,
          min_characters_recommended: data.min_characters_recommended
      });
      
      enqueueSnackbar('System prompt généré avec succès', { variant: 'success' });
    } catch (error) {
      console.error('Erreur génération system content:', error);
      setSystemContentError(error.message || "Erreur inconnue.");
      enqueueSnackbar(`Erreur: ${error.message || "Échec génération"}`, { variant: 'error' });
    } finally {
      setGeneratingSystemContent(false);
    }
  };

  return (
    <Box>
       <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'success.light', mr: 1.5 }}><PsychologyIcon /></Avatar>
              <Typography variant="h6">Définir l'Assistant</Typography>
       </Box>
       <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Décrivez l'objectif de votre assistant IA. Cela nous aidera à générer un "System Prompt" initial 
            et à estimer la quantité de données recommandée.
       </Typography>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <TextField
          label="Objectif de l'assistant"
          value={assistantPurpose}
          onChange={(e) => setAssistantPurpose(e.target.value)}
          multiline
          rows={4}
          placeholder="Exemple: Un chatbot pour répondre aux questions fréquentes sur nos produits, avec un ton amical et informel."
          error={!!systemContentError}
          helperText={systemContentError}
        />
        <FormHelperText>
          Soyez précis sur le domaine, le ton, et les capacités souhaitées.
        </FormHelperText>
      </FormControl>

      <Button
        variant="contained"
        onClick={generateSystemContent}
        disabled={generatingSystemContent || !assistantPurpose.trim()}
        startIcon={generatingSystemContent ? <CircularProgress size={20} /> : null}
        sx={{ mb: 2 }}
      >
        {generatingSystemContent ? 'Génération...' : systemContent ? 'Regénérer' : 'Générer System Prompt'}
      </Button>

      {systemContent && (
        <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>System Prompt Suggéré :</Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
            {systemContent}
          </Typography>
          {fineTuningCategory && (
            <Chip label={`Catégorie: ${fineTuningCategory}`} size="small" sx={{ mt: 1, mr: 1 }} />
          )}
          {minCharactersRecommended > 0 && (
            <Chip label={`Recommandé: ${minCharactersRecommended.toLocaleString()} car.`} size="small" sx={{ mt: 1 }} color="info"/>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default SystemPromptGenerator;
