import React, { useState, useEffect } from 'react';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputLabel,
  Link,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Slider,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Chip,
} from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DatasetIcon from '@mui/icons-material/Dataset';
import PsychologyIcon from '@mui/icons-material/Psychology';
import axios from 'axios';
import { projectService, datasetService, fineTuningService, apiKeyService } from '../services/localStorageService';

const NewFineTuningPage = () => {
  const { datasetId } = useParams();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [epochs, setEpochs] = useState(3);
  const [learningRate, setLearningRate] = useState(0.0001);
  const [nameError, setNameError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modèles disponibles par fournisseur
  const providerModels = {
    openai: [
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      { id: 'gpt-4', name: 'GPT-4 (Nécessite un accès spécial)' },
    ],
    anthropic: [
      { id: 'claude-2', name: 'Claude 2' },
      { id: 'claude-instant', name: 'Claude Instant' },
    ],
    mistral: [
      { id: 'mistral-7b', name: 'Mistral 7B' },
      { id: 'mistral-8x7b', name: 'Mistral 8x7B' },
    ],
  };

  // Fonction pour récupérer les données du dataset
  const fetchDatasetData = async () => {
    setLoading(true);
    try {
      console.log('Chargement des données du dataset depuis localStorage:', datasetId);
      
      // Simuler un délai pour montrer le chargement
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Récupérer le dataset
      const dataset = datasetService.getById(datasetId);
      if (!dataset) {
        setError('Dataset non trouvé');
        setLoading(false);
        return;
      }
      setDataset(dataset);

      // Récupérer le projet associé
      const project = projectService.getById(dataset.project_id);
      setProject(project);

      // Initialisation du nom du fine-tuning
      setName(`${project.name} - Fine-tuning`);

      setError(null);
    } catch (err) {
      console.error('Error fetching dataset data:', err);
      setError('Impossible de récupérer les données du dataset. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasetData();
  }, [datasetId]);

  // Gestion du changement de fournisseur
  const handleProviderChange = (e) => {
    const newProvider = e.target.value;
    setProvider(newProvider);
    // Réinitialiser le modèle au premier modèle disponible pour ce fournisseur
    setModel(providerModels[newProvider][0].id);
  };

  // Vérifier si la clé API est configurée
  const isApiKeyConfigured = (provider) => {
    return apiKeyService.hasKey(provider);
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      setNameError('Le nom du fine-tuning est requis');
      return;
    }
    
    // Vérifier si la clé API est configurée
    if (!isApiKeyConfigured(provider)) {
      setError(`Veuillez configurer votre clé API ${provider} dans les paramètres avant de lancer un fine-tuning.`);
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Création du fine-tuning dans le localStorage
      const newFineTuning = {
        name,
        description,
        dataset_id: datasetId,
        project_id: dataset.project_id,
        provider,
        model,
        parameters: {
          epochs,
          learning_rate: learningRate,
        },
        status: 'training',
        progress: 0,
        created_at: new Date().toISOString(),
        metrics: {
          training_loss: 0,
          validation_loss: 0,
        },
      };
      
      console.log('Création du fine-tuning:', newFineTuning);
      
      // Simuler un délai pour montrer le chargement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sauvegarder le fine-tuning
      const savedFineTuning = fineTuningService.save(newFineTuning);
      console.log('Fine-tuning créé:', savedFineTuning);
      
      // Redirection vers la page du fine-tuning créé
      navigate(`/dashboard/fine-tuning/${savedFineTuning.id}`);
    } catch (err) {
      console.error('Error creating fine-tuning:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la création du fine-tuning.');
      setSubmitting(false);
    }
  };

  // Formatage de la taille
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link component={RouterLink} to="/dashboard" color="inherit">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/dashboard/projects" color="inherit">
          Projets
        </Link>
        {project && (
          <Link component={RouterLink} to={`/dashboard/projects/${project.id}`} color="inherit">
            {project.name}
          </Link>
        )}
        {dataset && (
          <Link component={RouterLink} to={`/dashboard/datasets/${dataset.id}`} color="inherit">
            {dataset.name}
          </Link>
        )}
        <Typography color="text.primary">Nouveau fine-tuning</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Créer un nouveau fine-tuning
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Fine-tunez un modèle de langage avec votre dataset pour créer un assistant personnalisé.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dataset sélectionné
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DatasetIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  {dataset.name}
                </Typography>
                <Chip 
                  label="Prêt" 
                  size="small"
                  color="success"
                  sx={{ ml: 1 }}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                {dataset.description || 'Aucune description'}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {dataset.pairs_count} paires Q/R
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Taille: {formatSize(dataset.size)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations générales
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <TextField
                  label="Nom du fine-tuning"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value.trim()) {
                      setNameError('');
                    }
                  }}
                  error={!!nameError}
                  helperText={nameError}
                  required
                  placeholder="Ex: Assistant commercial v1..."
                />
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <TextField
                  label="Description (optionnelle)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={2}
                  placeholder="Décrivez l'objectif de ce fine-tuning..."
                />
              </FormControl>
            </CardContent>
          </Card>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Modèle et fournisseur
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Fournisseur</InputLabel>
                <Select
                  value={provider}
                  onChange={handleProviderChange}
                  label="Fournisseur"
                >
                  <MenuItem value="openai">OpenAI {!isApiKeyConfigured('openai') && <Chip size="small" color="error" label="Clé API manquante" sx={{ ml: 1 }} />}</MenuItem>
                  <MenuItem value="anthropic">Anthropic {!isApiKeyConfigured('anthropic') && <Chip size="small" color="error" label="Clé API manquante" sx={{ ml: 1 }} />}</MenuItem>
                  <MenuItem value="mistral">Mistral AI {!isApiKeyConfigured('mistral') && <Chip size="small" color="error" label="Clé API manquante" sx={{ ml: 1 }} />}</MenuItem>
                </Select>
                <FormHelperText>
                  {isApiKeyConfigured(provider) 
                    ? 'Sélectionnez le fournisseur du modèle que vous souhaitez fine-tuner.' 
                    : <span style={{ color: '#d32f2f' }}>Veuillez configurer votre clé API {provider} dans les <Link component={RouterLink} to="/dashboard/settings">paramètres</Link>.</span>}
                </FormHelperText>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Modèle</InputLabel>
                <Select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  label="Modèle"
                >
                  {providerModels[provider].map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  Sélectionnez le modèle de base à fine-tuner.
                </FormHelperText>
              </FormControl>
            </CardContent>
          </Card>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Paramètres avancés
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>
                  Nombre d{"'"}époques: {epochs}
                </Typography>
                <Slider
                  value={epochs}
                  onChange={(e, newValue) => setEpochs(newValue)}
                  min={1}
                  max={5}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                />
                <FormHelperText>
                  Nombre de fois que le modèle parcourt l{"'"}ensemble du dataset pendant l{"'"}entraînement.
                </FormHelperText>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>
                  Taux d{"'"}apprentissage: {learningRate}
                </Typography>
                <Slider
                  value={learningRate}
                  onChange={(e, newValue) => setLearningRate(newValue)}
                  min={0.00001}
                  max={0.001}
                  step={0.00001}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => value.toFixed(5)}
                />
                <FormHelperText>
                  Contrôle la vitesse à laquelle le modèle apprend. Une valeur plus faible est généralement plus stable.
                </FormHelperText>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estimation des coûts
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1">
                  Coût estimé du fine-tuning:
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {provider === 'openai' ? '$10-15' : provider === 'anthropic' ? '$15-20' : '$5-10'}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Cette estimation est basée sur la taille de votre dataset, le modèle choisi et les paramètres de fine-tuning.
                Le coût réel peut varier en fonction de la durée de l{"'"}entraînement et d{"'"}autres facteurs.
              </Typography>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/dashboard/datasets/${datasetId}`)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              {submitting ? 'Lancement en cours...' : 'Lancer le fine-tuning'}
            </Button>
          </Box>
        </form>
      )}
    </Container>
  );
};

export default NewFineTuningPage; 