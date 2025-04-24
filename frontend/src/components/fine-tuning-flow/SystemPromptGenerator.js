import React, { useState, useEffect } from 'react';
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
import { helperService } from '../../services/apiService';
import { useTranslation } from 'react-i18next';

// Ce composant gère la définition de l'objectif et la génération du system prompt
const SystemPromptGenerator = ({ onSystemPromptGenerated, initialSystemPrompt = '' }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [assistantPurpose, setAssistantPurpose] = useState('');
  const [systemContent, setSystemContent] = useState(initialSystemPrompt);
  const [generatingSystemContent, setGeneratingSystemContent] = useState(false);
  const [systemContentError, setSystemContentError] = useState(null);
  const [fineTuningCategory, setFineTuningCategory] = useState('');
  const [minCharactersRecommended, setMinCharactersRecommended] = useState(0);

  // Fonction pour générer le system content (similaire à OnboardingPage)
  const generateSystemContent = async () => {
    if (!assistantPurpose.trim()) {
      setSystemContentError(t('systemPromptGenerator.error.purposeRequired'));
      return;
    }
    setGeneratingSystemContent(true);
    setSystemContentError(null);
    try {
      const response = await helperService.generateSystemContent(assistantPurpose);
      const data = response;
      
      setSystemContent(data.system_content);
      setFineTuningCategory(data.fine_tuning_category);
      setMinCharactersRecommended(data.min_characters_recommended);
      
      // Informer le composant parent
      onSystemPromptGenerated({
          system_prompt: data.system_content,
          fine_tuning_category: data.fine_tuning_category,
          min_characters_recommended: data.min_characters_recommended
      });
      
      enqueueSnackbar(t('systemPromptGenerator.snackbar.generateSuccess'), { variant: 'success' });
    } catch (error) {
      console.error('Erreur génération system content:', error);
      const errMsg = error.message || t('systemPromptGenerator.error.genericGenerate');
      setSystemContentError(errMsg);
      enqueueSnackbar(`${t('common.error')}: ${errMsg}`, { variant: 'error' });
    } finally {
      setGeneratingSystemContent(false);
    }
  };

  // Appeler onSystemPromptGenerated quand systemContent change (utile si initialSystemPrompt est fourni)
  useEffect(() => {
      if (onSystemPromptGenerated && systemContent) {
          onSystemPromptGenerated({ system_prompt: systemContent });
      }
  }, [systemContent, onSystemPromptGenerated]);

  return (
    <Box>
       <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'success.light', mr: 1.5 }}><PsychologyIcon /></Avatar>
              <Typography variant="h6">{t('systemPromptGenerator.title')}</Typography>
       </Box>
       <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('systemPromptGenerator.description')}
       </Typography>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <TextField
          label={t('systemPromptGenerator.purposeLabel')}
          value={assistantPurpose}
          onChange={(e) => setAssistantPurpose(e.target.value)}
          multiline
          rows={4}
          placeholder={t('systemPromptGenerator.purposePlaceholder')}
          error={!!systemContentError}
          helperText={systemContentError}
        />
        <FormHelperText>
          {t('systemPromptGenerator.purposeHelper')}
        </FormHelperText>
      </FormControl>

      <Button
        variant="contained"
        onClick={generateSystemContent}
        disabled={generatingSystemContent || !assistantPurpose.trim()}
        startIcon={generatingSystemContent ? <CircularProgress size={20} /> : null}
        sx={{ mb: 2 }}
      >
        {generatingSystemContent ? t('common.generating') : systemContent ? t('common.regenerate') : t('systemPromptGenerator.generateButton')}
      </Button>

      {systemContent && (
        <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>{t('systemPromptGenerator.suggestedPromptTitle')}:</Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
            {systemContent}
          </Typography>
          {fineTuningCategory && (
            <Chip label={`${t('common.category')}: ${fineTuningCategory}`} size="small" sx={{ mt: 1, mr: 1 }} />
          )}
          {minCharactersRecommended > 0 && (
            <Chip label={`${t('common.recommended')}: ${minCharactersRecommended.toLocaleString()} car.`} size="small" sx={{ mt: 1 }} color="info"/>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default SystemPromptGenerator;
