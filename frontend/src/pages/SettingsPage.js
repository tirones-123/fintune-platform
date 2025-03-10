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
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SaveIcon from '@mui/icons-material/Save';
import KeyIcon from '@mui/icons-material/Key';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';

// Service pour stocker les clés API
const saveApiKey = (provider, key) => {
  try {
    // Stocker la clé dans le localStorage (en production, utilisez un stockage sécurisé côté serveur)
    localStorage.setItem(`api_key_${provider}`, key);
    return true;
  } catch (error) {
    console.error('Error saving API key:', error);
    return false;
  }
};

const getApiKey = (provider) => {
  try {
    return localStorage.getItem(`api_key_${provider}`) || '';
  } catch (error) {
    console.error('Error getting API key:', error);
    return '';
  }
};

const SettingsPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [mistralKey, setMistralKey] = useState('');
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showMistralKey, setShowMistralKey] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Charger les clés API au chargement de la page
  useEffect(() => {
    setOpenaiKey(getApiKey('openai'));
    setAnthropicKey(getApiKey('anthropic'));
    setMistralKey(getApiKey('mistral'));
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSaveOpenaiKey = () => {
    if (saveApiKey('openai', openaiKey)) {
      setSnackbarMessage('Clé API OpenAI sauvegardée avec succès');
      setSnackbarSeverity('success');
    } else {
      setSnackbarMessage('Erreur lors de la sauvegarde de la clé API OpenAI');
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
  };

  const handleSaveAnthropicKey = () => {
    if (saveApiKey('anthropic', anthropicKey)) {
      setSnackbarMessage('Clé API Anthropic sauvegardée avec succès');
      setSnackbarSeverity('success');
    } else {
      setSnackbarMessage('Erreur lors de la sauvegarde de la clé API Anthropic');
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
  };

  const handleSaveMistralKey = () => {
    if (saveApiKey('mistral', mistralKey)) {
      setSnackbarMessage('Clé API Mistral sauvegardée avec succès');
      setSnackbarSeverity('success');
    } else {
      setSnackbarMessage('Erreur lors de la sauvegarde de la clé API Mistral');
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
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
              Les clés API sont nécessaires pour utiliser les services de fine-tuning. Elles sont stockées localement et ne sont jamais partagées.
            </Alert>
          </Grid>
          
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
                    onChange={(e) => setOpenaiKey(e.target.value)}
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
                    Commence par "sk-"
                  </FormHelperText>
                </FormControl>
                
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveOpenaiKey}
                  disabled={!openaiKey}
                >
                  Sauvegarder
                </Button>
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
                    onChange={(e) => setAnthropicKey(e.target.value)}
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
                    Commence par "sk-ant-"
                  </FormHelperText>
                </FormControl>
                
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveAnthropicKey}
                  disabled={!anthropicKey}
                >
                  Sauvegarder
                </Button>
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
                    onChange={(e) => setMistralKey(e.target.value)}
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
                </FormControl>
                
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveMistralKey}
                  disabled={!mistralKey}
                >
                  Sauvegarder
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Profil utilisateur
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cette fonctionnalité sera disponible prochainement.
          </Typography>
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Paramètres de notification
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cette fonctionnalité sera disponible prochainement.
          </Typography>
        </Box>
      )}

      {tabValue === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Paramètres de sécurité
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cette fonctionnalité sera disponible prochainement.
          </Typography>
        </Box>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage; 