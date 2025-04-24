import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  FormHelperText
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';
import { api, apiKeyService, userService } from '../../services/apiService';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';

const ConfigManager = ({ initialConfig = {}, onConfigChange, onApiKeyValidation }) => {
  const { t } = useTranslation();

  // Définir providerModels ici pour accéder à t()
  const providerModels = {
    openai: [
      { id: 'gpt-4o', name: t('configManager.models.openai.gpt-4o'), apiId: 'gpt-4o-2024-08-06' },
      { id: 'gpt-4o-mini', name: t('configManager.models.openai.gpt-4o-mini'), apiId: 'gpt-4o-mini-2024-07-18' },
      { id: 'gpt-3.5-turbo', name: t('configManager.models.openai.gpt-3.5-turbo'), apiId: 'gpt-3.5-turbo-0125' },
    ],
    anthropic: [], // Garder vide pour l'instant
  };

  const [provider, setProvider] = useState(initialConfig.provider || 'openai');
  // Sélectionner le premier modèle *traduit* si le modèle initial n'est pas défini ou invalide
  const [model, setModel] = useState(() => {
      const initialModelId = initialConfig.model;
      const availableModels = providerModels[provider] || [];
      if (initialModelId && availableModels.some(m => m.id === initialModelId)) {
          return initialModelId;
      }
      return availableModels.length > 0 ? availableModels[0].id : '';
  });
  const [systemPrompt, setSystemPrompt] = useState(initialConfig.system_prompt || '');
  const [apiKey, setApiKey] = useState(''); // La clé n'est pas stockée dans initialConfig
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(null);
  const [savingApiKey, setSavingApiKey] = useState(false);
  const [apiHelpOpen, setApiHelpOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Récupérer les clés API existantes au montage
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const keys = await apiKeyService.getKeys();
        const currentProviderKey = keys.find(k => k.provider === provider);
        if (currentProviderKey) {
          setApiKey(currentProviderKey.key);
          setApiKeySaved(true); // Si une clé existe, on la considère validée initialement
          onApiKeyValidation(true);
        } else {
          setApiKey('');
          setApiKeySaved(false);
          onApiKeyValidation(false);
        }
      } catch (error) {
        console.error("Erreur chargement clés API", error);
        onApiKeyValidation(false);
      }
    };
    fetchKeys();
  }, [provider, onApiKeyValidation]);

  // Informer le parent des changements de config (sauf clé API)
  useEffect(() => {
    onConfigChange({
      provider,
      model,
      system_prompt: systemPrompt,
      // Ne pas inclure la clé API ici, elle est gérée séparément
    });
  }, [provider, model, systemPrompt, onConfigChange]);

  const handleProviderChange = (e) => {
    const newProvider = e.target.value;
    setProvider(newProvider);
    // Sélectionner le premier modèle du nouveau fournisseur
    const availableModels = providerModels[newProvider] || [];
    setModel(availableModels.length > 0 ? availableModels[0].id : '');
    setApiKey('');
    setApiKeySaved(false);
    setApiKeyError(null);
  };

  const handleSaveApiKey = async () => {
    if (!apiKey) {
      setApiKeyError(t('configManager.error.apiKeyRequired'));
      onApiKeyValidation(false);
      return;
    }
    setSavingApiKey(true);
    setApiKeyError(null);
    try {
      const verificationResponse = await userService.verifyApiKey(provider, apiKey);
      const { valid, credits, message } = verificationResponse;

      if (!valid) {
        setApiKeyError(message || t('configManager.error.invalidApiKey'));
        onApiKeyValidation(false);
        return;
      }
      if (credits === 0) {
        setApiKeyError(t('configManager.error.noCredits'));
        onApiKeyValidation(false); 
        return;
      }

      await apiKeyService.addKey(provider, apiKey);
      setApiKeySaved(true);
      onApiKeyValidation(true); 
      enqueueSnackbar(t('configManager.snackbar.apiKeyValidated'), { variant: 'success' });
    } catch (error) {
      console.error('Erreur validation clé API:', error);
      setApiKeyError(error.response?.data?.detail || error.message || t('configManager.error.validationFailed'));
      onApiKeyValidation(false);
    } finally {
      setSavingApiKey(false);
    }
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          {t('configManager.infoAlert')}
        </Typography>
      </Alert>
      
      <FormControl fullWidth margin="normal">
        <InputLabel id="provider-select-label">{t('configManager.providerLabel')}</InputLabel>
        <Select
          labelId="provider-select-label"
          value={provider}
          onChange={handleProviderChange}
          label={t('configManager.providerLabel')}
        >
          <MenuItem value="openai">OpenAI</MenuItem>
          {/* <MenuItem value="anthropic" disabled>Anthropic (Bientôt)</MenuItem> */}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel id="model-select-label">{t('configManager.modelLabel')}</InputLabel>
        <Select
          labelId="model-select-label"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          label={t('configManager.modelLabel')}
          disabled={!provider}
        >
          {provider && providerModels[provider] ? (
            providerModels[provider].map((modelOption) => (
              <MenuItem 
                key={modelOption.id} 
                value={modelOption.id}
                disabled={modelOption.name.includes("Coming soon")}
              >
                {modelOption.name}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>{t('configManager.selectProviderFirst')}</MenuItem>
          )}
        </Select>
        <FormHelperText>{t('configManager.modelHelperText')}</FormHelperText>
      </FormControl>

      <Box sx={{ mt: 2 }}>
        <TextField
          label={t('configManager.apiKeyLabel', { providerName: provider === 'openai' ? 'OpenAI' : 'Anthropic' })}
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            setApiKeySaved(false); // Si la clé change, elle n'est plus considérée comme sauvée/validée
            onApiKeyValidation(false);
          }}
          fullWidth
          type="password"
          margin="normal"
          placeholder={t('configManager.apiKeyPlaceholder', { providerName: provider === 'openai' ? 'OpenAI' : 'Anthropic' })}
          error={!!apiKeyError}
          helperText={apiKeyError}
          disabled={!provider}
          InputProps={{
            endAdornment: (
              <IconButton 
                onClick={() => setApiHelpOpen(true)} 
                edge="end"
                aria-label={t('configManager.apiKeyHelpAriaLabel')}
                title={t('configManager.apiKeyHelpTooltip')}
              >
                <HelpOutlineIcon />
              </IconButton>
            ),
          }}
        />
        {!apiKeySaved ? (
          <Button
            variant="outlined"
            onClick={handleSaveApiKey}
            disabled={!apiKey || savingApiKey}
            sx={{ mt: 1 }}
          >
            {savingApiKey ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            {t('configManager.validateApiKeyButton')}
          </Button>
        ) : (
           <Alert severity="success" sx={{ mt: 1 }}>{t('configManager.apiKeyValidatedMessage')}</Alert>
        )}
      </Box>

      {/* Popup d'aide pour la clé API (copié de OnboardingPage) */}
       <Dialog open={apiHelpOpen} onClose={() => setApiHelpOpen(false)} maxWidth="md">
         <DialogTitle>
           {t('configManager.apiKeyHelpDialog.title', { providerName: provider === 'openai' ? 'OpenAI' : 'Anthropic' })}
           <IconButton aria-label={t('common.close')} onClick={() => setApiHelpOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
             <CloseIcon />
           </IconButton>
         </DialogTitle>
         <DialogContent dividers>
           {/* Contenu copié depuis OnboardingPage */}
           <Typography variant="h6" gutterBottom>
             {t('configManager.apiKeyHelpDialog.whyTitle')}
           </Typography>
           <Typography paragraph>
             {t('configManager.apiKeyHelpDialog.whyPara1', { providerName: provider === 'openai' ? 'OpenAI' : 'Anthropic' })}
           </Typography>
           <Typography paragraph>
             {t('configManager.apiKeyHelpDialog.whyPara2')}
           </Typography>
           <List dense>
             <ListItem>
               {/* Remplacer par des icônes Material UI standard si UploadFileIcon etc. ne sont pas importées */}
               <ListItemIcon sx={{ minWidth: 30 }}><CloudUploadIcon fontSize="small" /></ListItemIcon>
               <ListItemText primary={t('configManager.apiKeyHelpDialog.whyItem1')} />
             </ListItem>
             <ListItem>
               <ListItemIcon sx={{ minWidth: 30 }}><PlayCircleOutlineIcon fontSize="small" /></ListItemIcon>
               <ListItemText primary={t('configManager.apiKeyHelpDialog.whyItem2')} />
             </ListItem>
             <ListItem>
               <ListItemIcon sx={{ minWidth: 30 }}><DownloadIcon fontSize="small" /></ListItemIcon>
               <ListItemText primary={t('configManager.apiKeyHelpDialog.whyItem3')} />
             </ListItem>
           </List>
           <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
             {t('configManager.apiKeyHelpDialog.whereTitle')}
           </Typography>
           {provider === 'openai' && (
             <>
               <Typography paragraph>
                 {t('configManager.apiKeyHelpDialog.whereOpenAI1')}
               </Typography>
               <Typography paragraph>
                  {t('configManager.apiKeyHelpDialog.whereOpenAI2')}
               </Typography>
               <Alert severity="warning" sx={{ mb: 2 }}>
                 <AlertTitle>{t('common.important')}</AlertTitle>
                  {t('configManager.apiKeyHelpDialog.whereOpenAICredits')} <Link href="https://platform.openai.com/account/billing/overview" target="_blank" rel="noopener noreferrer">{t('configManager.apiKeyHelpDialog.billingLink')}</Link>.
               </Alert>
             </>
           )}
           {provider === 'anthropic' && (
              <Typography paragraph>
                 Connectez-vous à votre compte Anthropic et allez dans les paramètres pour générer une clé API. Copiez-la ici. (Instructions spécifiques à venir si l'intégration est activée)
               </Typography>
           )}
           <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
             {t('configManager.apiKeyHelpDialog.securityTitle')}
           </Typography>
           <Typography paragraph>
             {t('configManager.apiKeyHelpDialog.securityPara')}
           </Typography>
         </DialogContent>
         <DialogActions>
           <Button onClick={() => setApiHelpOpen(false)}>{t('common.close')}</Button>
           {/* Boutons spécifiques au provider */}
           {provider === 'openai' && (
             <Button href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer">
               {t('configManager.apiKeyHelpDialog.goToOpenAIKeys')}
             </Button>
           )}
            {provider === 'anthropic' && (
             <Button href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" disabled>
               Aller aux clés Anthropic (Bientôt)
             </Button>
           )}
         </DialogActions>
       </Dialog>
    </Box>
  );
};

export default ConfigManager;
