import React, { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { fineTuningService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/common/PageTransition';

function PlaygroundPage() {
  const theme = useTheme();
  const { user } = useAuth();
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loadingModels, setLoadingModels] = useState(true);
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [error, setError] = useState('');

  // Charger les modèles fine-tunés complétés
  useEffect(() => {
    const fetchModels = async () => {
      setLoadingModels(true);
      setError('');
      try {
        const allFineTunings = await fineTuningService.getAll();
        // Filtrer pour ne garder que les modèles complétés
        const completedModels = allFineTunings.filter(ft => ft.status === 'completed');
        setModels(completedModels);
        if (completedModels.length > 0) {
          // Pré-sélectionner le premier modèle par défaut
          setSelectedModel(completedModels[0].id); 
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des modèles fine-tunés:", err);
        setError('Impossible de charger les modèles fine-tunés.');
        setModels([]);
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModels();
  }, []);

  // Gérer l'envoi du prompt
  const handleSendPrompt = async () => {
    if (!selectedModel || !prompt.trim()) {
      setError('Veuillez sélectionner un modèle et entrer un prompt.');
      return;
    }
    setLoadingResponse(true);
    setResponse('');
    setError('');
    try {
      const result = await fineTuningService.testModel(selectedModel, prompt);
      // Assumer que la réponse est dans result.response ou un champ similaire
      setResponse(result?.response || JSON.stringify(result, null, 2)); 
    } catch (err) {
      console.error("Erreur lors du test du modèle:", err);
      setError(err.message || 'Une erreur est survenue lors de la communication avec le modèle.');
      setResponse('');
    } finally {
      setLoadingResponse(false);
    }
  };

  return (
    <PageTransition>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          Playground IA
        </Typography>

        {loadingModels ? (
          <CircularProgress />
        ) : error && models.length === 0 ? (
           <Alert severity="error">{error}</Alert>
        ) : models.length === 0 ? (
           <Alert severity="info">Vous n'avez aucun modèle fine-tuné complété à tester pour le moment.</Alert>
        ) : (
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="model-select-label">Choisir un modèle fine-tuné</InputLabel>
              <Select
                labelId="model-select-label"
                id="model-select"
                value={selectedModel}
                label="Choisir un modèle fine-tuné"
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {models.map((model) => (
                  <MenuItem key={model.id} value={model.id}>
                    {model.name} ({model.provider}/{model.model}) - ID: {model.external_id || 'N/A'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              label="Votre Prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Entrez votre texte ici pour interagir avec le modèle sélectionné..."
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Button
                variant="contained"
                endIcon={loadingResponse ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                onClick={handleSendPrompt}
                disabled={loadingResponse || !selectedModel || !prompt.trim()}
              >
                Envoyer
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}

            {response && (
              <Box>
                <Typography variant="h6" gutterBottom>Réponse du modèle :</Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
                    borderRadius: 1,
                    whiteSpace: 'pre-wrap', // Conserve les sauts de ligne et espaces
                    wordWrap: 'break-word', // Coupe les mots longs
                    maxHeight: '400px', // Limite la hauteur
                    overflowY: 'auto' // Ajoute une scrollbar si nécessaire
                  }}
                >
                  {response}
                </Paper>
              </Box>
            )}
          </Paper>
        )}
      </Container>
    </PageTransition>
  );
}

export default PlaygroundPage; 