import React, { useState, useEffect } from 'react';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Link,
  Radio,
  RadioGroup,
  Slider,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Grid,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import YouTubeIcon from '@mui/icons-material/YouTube';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useSnackbar } from 'notistack';
import { projectService, contentService, datasetService } from '../services/apiService';

const NewDatasetPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedContents, setSelectedContents] = useState([]);
  const [generationMethod, setGenerationMethod] = useState('auto');
  const [chunkSize, setChunkSize] = useState(1000);
  const [overlap, setOverlap] = useState(200);
  const [pairsCount, setPairsCount] = useState(100);
  const [nameError, setNameError] = useState('');
  const [contentError, setContentError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const { enqueueSnackbar } = useSnackbar();

  // Fonction pour récupérer les données du projet et ses contenus
  const fetchProjectData = async () => {
    setLoading(true);
    try {
      // Récupérer le projet depuis l'API
      const projectData = await projectService.getById(projectId);
      setProject(projectData);
      
      // Récupérer les contenus du projet
      const contentsData = await contentService.getByProjectId(projectId);
      setContents(contentsData);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching project data:', err);
      setError('Impossible de récupérer les données du projet. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  // Gestion des contenus sélectionnés
  const handleContentToggle = (contentId) => {
    setSelectedContents(prev => {
      if (prev.includes(contentId)) {
        return prev.filter(id => id !== contentId);
      } else {
        return [...prev, contentId];
      }
    });
    
    setContentError('');
  };

  const handleSelectAllContents = () => {
    if (selectedContents.length === contents.length) {
      setSelectedContents([]);
    } else {
      setSelectedContents(contents.map(content => content.id));
    }
    
    setContentError('');
  };

  // Obtenir l'icône en fonction du type de contenu
  const getContentIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <PictureAsPdfIcon color="error" />;
      case 'text':
        return <TextSnippetIcon color="primary" />;
      case 'youtube':
        return <YouTubeIcon color="error" />;
      default:
        return <TextSnippetIcon />;
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

  // Fonction pour créer le dataset
  const handleCreateDataset = async () => {
    // Validation
    if (!name.trim()) {
      setError('Le nom du dataset est requis');
      return;
    }
    
    if (selectedContents.length === 0) {
      setError('Veuillez sélectionner au moins un contenu');
      return;
    }
    
    setCreating(true);
    setError(null);
    
    try {
      // Créer le dataset via l'API
      const newDataset = await datasetService.create({
        name,
        description,
        project_id: projectId,
        content_ids: selectedContents,
        model: selectedModel,
      });
      
      enqueueSnackbar('Dataset créé avec succès', { variant: 'success' });
      navigate(`/dashboard/datasets/${newDataset.id}`);
    } catch (err) {
      console.error('Error creating dataset:', err);
      setError(err.message || 'Erreur lors de la création du dataset');
      setCreating(false);
    }
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
          <Link component={RouterLink} to={`/dashboard/projects/${projectId}`} color="inherit">
            {project.name}
          </Link>
        )}
        <Typography color="text.primary">Nouveau dataset</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Créer un nouveau dataset
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Générez un dataset de paires question-réponse à partir de vos contenus pour fine-tuner un modèle.
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
      ) : contents.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <TextSnippetIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Aucun contenu disponible
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Vous devez d{"'"}abord ajouter et traiter du contenu avant de pouvoir créer un dataset.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(`/dashboard/content/upload/${projectId}`)}
          >
            Ajouter du contenu
          </Button>
        </Paper>
      ) : (
        <form onSubmit={handleCreateDataset}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations générales
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <TextField
                  label="Nom du dataset"
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
                  placeholder="Ex: Dataset principal, Dataset de test..."
                />
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <TextField
                  label="Description (optionnelle)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={2}
                  placeholder="Décrivez l'objectif de ce dataset..."
                />
              </FormControl>
            </CardContent>
          </Card>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Sélection des contenus
                </Typography>
                <Button 
                  variant="text" 
                  onClick={handleSelectAllContents}
                >
                  {selectedContents.length === contents.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                </Button>
              </Box>
              
              {contentError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {contentError}
                </Alert>
              )}
              
              <List component={Paper} sx={{ mb: 3 }}>
                {contents.map((content) => (
                  <React.Fragment key={content.id}>
                    <ListItem>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={selectedContents.includes(content.id)}
                          onChange={() => handleContentToggle(content.id)}
                        />
                      </ListItemIcon>
                      <ListItemIcon>
                        {getContentIcon(content.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={content.name}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Type: {content.type.toUpperCase()}
                            </Typography>
                            {content.size > 0 && (
                              <Typography variant="caption" color="text.secondary">
                                Taille: {formatSize(content.size)}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Chip 
                          label="Traité" 
                          size="small"
                          color="success"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Paramètres de génération
              </Typography>
              
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel component="legend">Méthode de génération</FormLabel>
                <RadioGroup
                  value={generationMethod}
                  onChange={(e) => setGenerationMethod(e.target.value)}
                >
                  <FormControlLabel 
                    value="auto" 
                    control={<Radio />} 
                    label="Automatique (recommandé)" 
                  />
                  <FormControlLabel 
                    value="manual" 
                    control={<Radio />} 
                    label="Paramètres personnalisés" 
                  />
                </RadioGroup>
              </FormControl>
              
              {generationMethod === 'manual' && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography gutterBottom>
                      Taille des chunks: 3000 caractères (fixe)
                    </Typography>
                    <FormHelperText>
                      Les contenus seront divisés en segments de 3000 caractères pour un traitement optimal.
                    </FormHelperText>
                  </Box>
                </>
              )}
              
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>
                  Nombre de paires Q/R à générer: {pairsCount}
                </Typography>
                <Slider
                  value={pairsCount}
                  onChange={(e, newValue) => setPairsCount(newValue)}
                  min={50}
                  max={500}
                  step={50}
                  valueLabelDisplay="auto"
                />
                <FormHelperText>
                  Plus le nombre est élevé, plus le dataset sera complet, mais le temps de génération sera plus long.
                </FormHelperText>
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/dashboard/projects/${projectId}`)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={creating}
              startIcon={creating ? <CircularProgress size={20} /> : null}
            >
              {creating ? 'Création en cours...' : 'Créer le dataset'}
            </Button>
          </Box>
        </form>
      )}
    </Container>
  );
};

export default NewDatasetPage; 