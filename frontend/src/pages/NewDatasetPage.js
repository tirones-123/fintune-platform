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
} from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import YouTubeIcon from '@mui/icons-material/YouTube';
import axios from 'axios';
import { projectService, contentService, datasetService } from '../services/localStorageService';

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

  // Fonction pour récupérer les données du projet et ses contenus
  const fetchProjectData = async () => {
    setLoading(true);
    try {
      console.log('Chargement des données du projet depuis localStorage:', projectId);
      
      // Simuler un délai pour montrer le chargement
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Récupérer le projet
      const project = projectService.getById(projectId);
      if (!project) {
        setError('Projet non trouvé');
        setLoading(false);
        return;
      }
      setProject(project);
      
      // Récupérer les contenus du projet
      const projectContents = contentService.getByProjectId(projectId);
      
      // Filtrer les contenus traités uniquement
      const processedContents = projectContents.filter(
        content => content.status === 'processed'
      );
      
      setContents(processedContents);
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

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    let isValid = true;
    
    if (!name.trim()) {
      setNameError('Le nom du dataset est requis');
      isValid = false;
    }
    
    if (selectedContents.length === 0) {
      setContentError('Veuillez sélectionner au moins un contenu');
      isValid = false;
    }
    
    if (!isValid) return;
    
    setSubmitting(true);
    
    try {
      // Création du dataset dans le localStorage
      const newDataset = {
        name,
        description,
        project_id: projectId,
        content_ids: selectedContents,
        generation_method: generationMethod,
        chunk_size: chunkSize,
        overlap,
        pairs_count: pairsCount,
      };
      
      console.log('Création du dataset:', newDataset);
      
      // Simuler un délai pour montrer le chargement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sauvegarder le dataset
      const savedDataset = datasetService.save(newDataset);
      console.log('Dataset créé:', savedDataset);
      
      // Mettre à jour le compteur de datasets dans le projet
      const project = projectService.getById(projectId);
      if (project) {
        const updatedProject = {
          ...project,
          dataset_count: (project.dataset_count || 0) + 1
        };
        projectService.save(updatedProject);
      }
      
      // Redirection vers la page du dataset créé
      navigate(`/dashboard/datasets/${savedDataset.id}`);
    } catch (err) {
      console.error('Error creating dataset:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la création du dataset.');
      setSubmitting(false);
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
        <form onSubmit={handleSubmit}>
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
                      Taille des chunks (caractères): {chunkSize}
                    </Typography>
                    <Slider
                      value={chunkSize}
                      onChange={(e, newValue) => setChunkSize(newValue)}
                      min={500}
                      max={2000}
                      step={100}
                      valueLabelDisplay="auto"
                    />
                    <FormHelperText>
                      Détermine la taille des segments de texte qui seront traités.
                    </FormHelperText>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography gutterBottom>
                      Chevauchement (caractères): {overlap}
                    </Typography>
                    <Slider
                      value={overlap}
                      onChange={(e, newValue) => setOverlap(newValue)}
                      min={0}
                      max={500}
                      step={50}
                      valueLabelDisplay="auto"
                    />
                    <FormHelperText>
                      Détermine le chevauchement entre les segments pour maintenir le contexte.
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
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              {submitting ? 'Création en cours...' : 'Créer le dataset'}
            </Button>
          </Box>
        </form>
      )}
    </Container>
  );
};

export default NewDatasetPage; 