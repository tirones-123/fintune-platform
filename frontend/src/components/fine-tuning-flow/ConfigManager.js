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

// Définition des modèles disponibles (similaire à OnboardingPage)
const providerModels = {
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o (Modèle le plus performant et récent)', apiId: 'gpt-4o-2024-08-06' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Bon rapport qualité/prix)', apiId: 'gpt-4o-mini-2024-07-18' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Économique, bonne performance)', apiId: 'gpt-3.5-turbo-0125' },
    // Ajouter d'autres modèles si nécessaire
  ],
  anthropic: [
    // { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet (Coming soon)' },
    // { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (Coming soon)' },
  ],
};

const ConfigManager = ({ initialConfig = {}, onConfigChange, onApiKeyValidation }) => {
  const [provider, setProvider] = useState(initialConfig.provider || 'openai');
  const [model, setModel] = useState(initialConfig.model || 'gpt-4o');
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
    setModel(''); // Réinitialiser le modèle
    setApiKey(''); // Réinitialiser la clé API
    setApiKeySaved(false);
    setApiKeyError(null);
    // Sélectionner le premier modèle du nouveau fournisseur
    if (providerModels[newProvider] && providerModels[newProvider].length > 0) {
      setModel(providerModels[newProvider][0].id);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey) {
      setApiKeyError("Clé API requise.");
      onApiKeyValidation(false);
      return;
    }
    setSavingApiKey(true);
    setApiKeyError(null);
    try {
      const verificationResponse = await userService.verifyApiKey(provider, apiKey); // Utiliser userService
      const { valid, credits, message } = verificationResponse;

      if (!valid) {
        setApiKeyError(message || "Clé API invalide.");
        onApiKeyValidation(false);
        return;
      }
      if (credits === 0) {
        setApiKeyError("Compte API sans crédits suffisants.");
        onApiKeyValidation(false); // Valide mais pas utilisable
        return;
      }

      await apiKeyService.addKey(provider, apiKey);
      setApiKeySaved(true);
      onApiKeyValidation(true); // Informer le parent que la clé est valide
      enqueueSnackbar('Clé API validée et enregistrée', { variant: 'success' });
    } catch (error) {
      console.error('Erreur validation clé API:', error);
      setApiKeyError(error.response?.data?.detail || error.message || "Erreur validation clé API.");
      onApiKeyValidation(false);
    } finally {
      setSavingApiKey(false);
    }
  };

  return (
    <Box>
      <FormControl fullWidth margin="normal">
        <InputLabel id="provider-select-label">Fournisseur IA</InputLabel>
        <Select
          labelId="provider-select-label"
          value={provider}
          onChange={handleProviderChange}
          label="Fournisseur IA"
        >
          <MenuItem value="openai">OpenAI</MenuItem>
          {/* <MenuItem value="anthropic" disabled>Anthropic (Bientôt)</MenuItem> */}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel id="model-select-label">Modèle de base</InputLabel>
        <Select
          labelId="model-select-label"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          label="Modèle de base"
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
            <MenuItem disabled>Sélectionnez un fournisseur</MenuItem>
          )}
        </Select>
        <FormHelperText>Modèle qui sera fine-tuné avec vos données.</FormHelperText>
      </FormControl>

      <Box sx={{ mt: 2 }}>
        <TextField
          label={`Clé API ${provider === 'openai' ? 'OpenAI' : 'Anthropic'}`}
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            setApiKeySaved(false); // Si la clé change, elle n'est plus considérée comme sauvée/validée
            onApiKeyValidation(false);
          }}
          fullWidth
          type="password"
          margin="normal"
          placeholder={`Entrez votre clé API ${provider === 'openai' ? 'OpenAI' : 'Anthropic'}`}
          error={!!apiKeyError}
          helperText={apiKeyError}
          disabled={!provider}
          InputProps={{
            endAdornment: (
              <IconButton 
                onClick={() => setApiHelpOpen(true)} 
                edge="end"
                aria-label="aide clés API"
                title="Comment obtenir ma clé API ?"
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
            Valider et Enregistrer la Clé
          </Button>
        ) : (
           <Alert severity="success" sx={{ mt: 1 }}>Clé API enregistrée et validée.</Alert>
        )}
      </Box>

      {/* Popup d'aide pour la clé API (copié de OnboardingPage) */}
       <Dialog open={apiHelpOpen} onClose={() => setApiHelpOpen(false)} maxWidth="md">
         <DialogTitle>
           Comment obtenir votre clé API {provider === 'openai' ? 'OpenAI' : 'Anthropic'}
           <IconButton aria-label="fermer" onClick={() => setApiHelpOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
             <CloseIcon />
           </IconButton>
         </DialogTitle>
         <DialogContent dividers>
           {/* Contenu copié depuis OnboardingPage */}
           <Typography variant="h6" gutterBottom>
             Pourquoi avons-nous besoin de votre clé API ?
           </Typography>
           <Typography paragraph>
             Pour fine-tuner un modèle, nous devons envoyer vos données d'entraînement au fournisseur d'IA que vous avez choisi (OpenAI ou Anthropic). L'entraînement se déroule sur leur infrastructure.
           </Typography>
           <Typography paragraph>
             Votre clé API nous permet d'agir en votre nom pour :
           </Typography>
           <List dense>
             <ListItem>
               {/* Remplacer par des icônes Material UI standard si UploadFileIcon etc. ne sont pas importées */}
               <ListItemIcon sx={{ minWidth: 30 }}><CloudUploadIcon fontSize="small" /></ListItemIcon>
               <ListItemText primary="Envoyer le fichier d'entraînement" />
             </ListItem>
             <ListItem>
               <ListItemIcon sx={{ minWidth: 30 }}><PlayCircleOutlineIcon fontSize="small" /></ListItemIcon>
               <ListItemText primary="Lancer le job de fine-tuning" />
             </ListItem>
             <ListItem>
               <ListItemIcon sx={{ minWidth: 30 }}><DownloadIcon fontSize="small" /></ListItemIcon>
               <ListItemText primary="Récupérer l'identifiant du modèle fine-tuné une fois terminé" />
             </ListItem>
           </List>
           <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
             Où trouver votre clé API ?
           </Typography>
           {provider === 'openai' && (
             <>
               <Typography paragraph>
                 Connectez-vous à votre compte sur le site d'OpenAI, puis accédez à la section des clés API.
               </Typography>
               <Typography paragraph>
                 Créez une nouvelle clé secrète (elle commence généralement par "sk-..."). Copiez-la et collez-la ici.
               </Typography>
               <Alert severity="warning" sx={{ mb: 2 }}>
                 <AlertTitle>Important</AlertTitle>
                 Assurez-vous d'avoir ajouté des crédits à votre compte OpenAI, car le fine-tuning et l'utilisation des modèles sont payants. Vérifiez votre <Link href="https://platform.openai.com/account/billing/overview" target="_blank" rel="noopener noreferrer">page de facturation OpenAI</Link>.
               </Alert>
             </>
           )}
           {provider === 'anthropic' && (
              <Typography paragraph>
                 Connectez-vous à votre compte Anthropic et allez dans les paramètres pour générer une clé API. Copiez-la ici. (Instructions spécifiques à venir si l'intégration est activée)
               </Typography>
           )}
           <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
             Sécurité de votre clé
           </Typography>
           <Typography paragraph>
             Votre clé API est sensible. Nous la stockons de manière sécurisée et ne l'utilisons que pour les opérations de fine-tuning que vous lancez via notre plateforme. Elle n'est jamais exposée côté client.
           </Typography>
         </DialogContent>
         <DialogActions>
           <Button onClick={() => setApiHelpOpen(false)}>Fermer</Button>
           {/* Boutons spécifiques au provider */}
           {provider === 'openai' && (
             <Button href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer">
               Aller aux clés OpenAI
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
