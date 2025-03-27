import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SaveIcon from '@mui/icons-material/Save';
import KeyIcon from '@mui/icons-material/Key';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import { useSnackbar } from 'notistack';
import { apiKeyService } from '../services/apiService';

const SettingsPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [mistralKey, setMistralKey] = useState('');
  const [hasOpenaiKey, setHasOpenaiKey] = useState(false);
  const [hasAnthropicKey, setHasAnthropicKey] = useState(false);
  const [hasMistralKey, setHasMistralKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showMistralKey, setShowMistralKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingKey, setSavingKey] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Charger les clés API au chargement de la page
  useEffect(() => {
    const fetchApiKeys = async () => {
      setLoading(true);
      try {
        const apiKeys = await apiKeyService.getKeys();
        
        // Initialiser l'état pour chaque provider
        apiKeys.forEach(apiKey => {
          if (apiKey.provider === 'openai') {
            setHasOpenaiKey(true);
            // Masquer la valeur réelle de la clé
            setOpenaiKey('•'.repeat(16));
          } else if (apiKey.provider === 'anthropic') {
            setHasAnthropicKey(true);
            setAnthropicKey('•'.repeat(16));
          } else if (apiKey.provider === 'mistral') {
            setHasMistralKey(true);
            setMistralKey('•'.repeat(16));
          }
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching API keys:', err);
        setError('Impossible de récupérer vos clés API');
        enqueueSnackbar('Erreur lors de la récupération des clés API', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchApiKeys();
  }, [enqueueSnackbar]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSaveApiKey = async (provider, key, setStateHasKey) => {
    if (!key || (key.includes('•') && key.length === 16)) {
      // Ne pas enregistrer si c'est la clé masquée existante
      return;
    }
    
    setSavingKey(true);
    try {
      // Enregistrer la clé via l'API
      await apiKeyService.addKey(provider, key);
      
      // Mettre à jour l'état pour indiquer que la clé existe
      setStateHasKey(true);
      
      enqueueSnackbar(`Clé API ${provider} enregistrée avec succès`, { variant: 'success' });
    } catch (err) {
      console.error(`Error saving ${provider} API key:`, err);
      enqueueSnackbar(`Erreur lors de l'enregistrement de la clé API ${provider}`, { variant: 'error' });
    } finally {
      setSavingKey(false);
    }
  };

  const handleSaveOpenaiKey = () => {
    handleSaveApiKey('openai', openaiKey, setHasOpenaiKey);
  };

  const handleSaveAnthropicKey = () => {
    handleSaveApiKey('anthropic', anthropicKey, setHasAnthropicKey);
  };

  const handleSaveMistralKey = () => {
    handleSaveApiKey('mistral', mistralKey, setHasMistralKey);
  };

  const handleDeleteApiKey = async (provider) => {
    try {
      await apiKeyService.deleteKey(provider);
      
      // Réinitialiser l'état correspondant
      if (provider === 'openai') {
        setHasOpenaiKey(false);
        setOpenaiKey('');
      } else if (provider === 'anthropic') {
        setHasAnthropicKey(false);
        setAnthropicKey('');
      } else if (provider === 'mistral') {
        setHasMistralKey(false);
        setMistralKey('');
      }
      
      enqueueSnackbar(`Clé API ${provider} supprimée avec succès`, { variant: 'success' });
    } catch (err) {
      console.error(`Error deleting ${provider} API key:`, err);
      enqueueSnackbar(`Erreur lors de la suppression de la clé API ${provider}`, { variant: 'error' });
    }
  };

  // Gérer les champs de saisie de clé API
  const handleKeyChange = (setValue, hasKey) => (e) => {
    const value = e.target.value;
    
    // Si on avait déjà une clé (masquée) et qu'on commence à taper, effacer la valeur masquée
    if (hasKey && value !== '•'.repeat(16)) {
      setValue(value.replace(/•/g, ''));
    } else {
      setValue(value);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Paramètres
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configurez votre compte et vos préférences
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
          <Tab icon={<KeyIcon />} label="Clés API" />
          <Tab icon={<AccountCircleIcon />} label="Profil" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<SecurityIcon />} label="Sécurité" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Les clés API sont nécessaires pour utiliser les services de fine-tuning. Vos clés sont stockées de manière sécurisée.
            </Alert>
          </Grid>
          
          {loading ? (
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Grid>
          ) : error ? (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          ) : (
            <>
              {/* OpenAI API Key */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      OpenAI API
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Utilisée pour fine-tuner les modèles GPT-3.5 et GPT-4. Obtenez votre clé sur <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com</a>.
                    </Typography>
                    
                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                      <InputLabel htmlFor="openai-api-key">Clé API OpenAI</InputLabel>
                      <OutlinedInput
                        id="openai-api-key"
                        type={showOpenaiKey ? 'text' : 'password'}
                        value={openaiKey}
                        onChange={handleKeyChange(setOpenaiKey, hasOpenaiKey)}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                              edge="end"
                            >
                              {showOpenaiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Clé API OpenAI"
                        placeholder="sk-..."
                      />
                      <FormHelperText>
                        {hasOpenaiKey ? 'Clé API déjà configurée. Entrez une nouvelle clé pour la remplacer.' : 'Commence par "sk-"'}
                      </FormHelperText>
                    </FormControl>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveOpenaiKey}
                        disabled={!openaiKey || savingKey || (hasOpenaiKey && openaiKey === '•'.repeat(16))}
                      >
                        {savingKey ? <CircularProgress size={24} /> : 'Sauvegarder'}
                      </Button>
                      
                      {hasOpenaiKey && (
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteApiKey('openai')}
                          disabled={savingKey}
                        >
                          Supprimer
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Anthropic API Key */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Anthropic API
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Utilisée pour fine-tuner les modèles Claude. Obtenez votre clé sur <a href="https://console.anthropic.com/account/keys" target="_blank" rel="noopener noreferrer">console.anthropic.com</a>.
                    </Typography>
                    
                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                      <InputLabel htmlFor="anthropic-api-key">Clé API Anthropic</InputLabel>
                      <OutlinedInput
                        id="anthropic-api-key"
                        type={showAnthropicKey ? 'text' : 'password'}
                        value={anthropicKey}
                        onChange={handleKeyChange(setAnthropicKey, hasAnthropicKey)}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                              edge="end"
                            >
                              {showAnthropicKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Clé API Anthropic"
                        placeholder="sk-ant-..."
                      />
                      <FormHelperText>
                        {hasAnthropicKey ? 'Clé API déjà configurée. Entrez une nouvelle clé pour la remplacer.' : 'Commence par "sk-ant-"'}
                      </FormHelperText>
                    </FormControl>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveAnthropicKey}
                        disabled={!anthropicKey || savingKey || (hasAnthropicKey && anthropicKey === '•'.repeat(16))}
                      >
                        {savingKey ? <CircularProgress size={24} /> : 'Sauvegarder'}
                      </Button>
                      
                      {hasAnthropicKey && (
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteApiKey('anthropic')}
                          disabled={savingKey}
                        >
                          Supprimer
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Mistral API Key */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Mistral AI API
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Utilisée pour fine-tuner les modèles Mistral. Obtenez votre clé sur <a href="https://console.mistral.ai/api-keys/" target="_blank" rel="noopener noreferrer">console.mistral.ai</a>.
                    </Typography>
                    
                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                      <InputLabel htmlFor="mistral-api-key">Clé API Mistral</InputLabel>
                      <OutlinedInput
                        id="mistral-api-key"
                        type={showMistralKey ? 'text' : 'password'}
                        value={mistralKey}
                        onChange={handleKeyChange(setMistralKey, hasMistralKey)}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowMistralKey(!showMistralKey)}
                              edge="end"
                            >
                              {showMistralKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Clé API Mistral"
                      />
                      <FormHelperText>
                        {hasMistralKey ? 'Clé API déjà configurée. Entrez une nouvelle clé pour la remplacer.' : ''}
                      </FormHelperText>
                    </FormControl>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveMistralKey}
                        disabled={!mistralKey || savingKey || (hasMistralKey && mistralKey === '•'.repeat(16))}
                      >
                        {savingKey ? <CircularProgress size={24} /> : 'Sauvegarder'}
                      </Button>
                      
                      {hasMistralKey && (
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteApiKey('mistral')}
                          disabled={savingKey}
                        >
                          Supprimer
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      )}
      {tabValue === 1 && (
        <Typography variant="h6">Paramètres du profil</Typography>
      )}
      {tabValue === 2 && (
        <Typography variant="h6">Paramètres des notifications</Typography>
      )}
      {tabValue === 3 && (
        <Typography variant="h6">Paramètres de sécurité</Typography>
      )}
    </Container>
  );
};

export default SettingsPage; 