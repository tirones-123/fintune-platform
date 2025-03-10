import React, { useState, useEffect } from 'react';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Link,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DatasetIcon from '@mui/icons-material/Dataset';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import YouTubeIcon from '@mui/icons-material/YouTube';
import axios from 'axios';
import { projectService, contentService, datasetService } from '../services/localStorageService';

const DatasetDetailPage = () => {
  const { datasetId } = useParams();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState(null);
  const [project, setProject] = useState(null);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      
      // Récupérer les contenus utilisés dans le dataset
      if (dataset.content_ids && dataset.content_ids.length > 0) {
        const datasetContents = [];
        for (const contentId of dataset.content_ids) {
          const content = contentService.getById(contentId);
          if (content) {
            datasetContents.push(content);
          }
        }
        setContents(datasetContents);
      }

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

  // Formatage de la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Formatage de la taille
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'generating':
        return 'primary';
      case 'ready':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'generating':
        return 'En cours de génération';
      case 'ready':
        return 'Prêt';
      case 'failed':
        return 'Échec';
      default:
        return 'Inconnu';
    }
  };

  // Lancer un fine-tuning avec ce dataset
  const handleStartFineTuning = () => {
    navigate(`/dashboard/fine-tuning/new/${datasetId}`);
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
        <Typography color="text.primary">Dataset</Typography>
      </Breadcrumbs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                {dataset.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {dataset.description || 'Aucune description'}
              </Typography>
            </Box>
            <Box>
              {dataset.status === 'ready' && (
                <Button
                  variant="contained"
                  startIcon={<PsychologyIcon />}
                  onClick={handleStartFineTuning}
                >
                  Lancer un fine-tuning
                </Button>
              )}
            </Box>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Informations générales
                    </Typography>
                    <Chip
                      label={getStatusLabel(dataset.status)}
                      color={getStatusColor(dataset.status)}
                    />
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Créé le
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(dataset.created_at)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Nombre de paires
                      </Typography>
                      <Typography variant="body1">
                        {dataset.pairs_count}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Taille
                      </Typography>
                      <Typography variant="body1">
                        {formatSize(dataset.size)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Méthode de génération
                      </Typography>
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {dataset.generation_method === 'auto' ? 'Automatique' : 'Manuelle'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contenus utilisés
                  </Typography>
                  
                  <List>
                    {contents.map((content) => (
                      <ListItem key={content.id} divider>
                        <ListItemIcon>
                          {getContentIcon(content.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={content.name}
                          secondary={content.description || 'Aucune description'}
                        />
                        <ListItemSecondaryAction>
                          <Typography variant="body2" color="text.secondary">
                            {formatSize(content.size)}
                          </Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Paramètres de génération
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Taille des chunks
                      </Typography>
                      <Typography variant="body1">
                        {dataset.chunk_size} caractères
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Chevauchement
                      </Typography>
                      <Typography variant="body1">
                        {dataset.overlap} caractères
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Exemples de paires
                  </Typography>
                  
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Question:
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Quels sont les avantages de votre solution par rapport à la concurrence ?
                    </Typography>
                    <Typography variant="subtitle2" color="secondary" gutterBottom>
                      Réponse:
                    </Typography>
                    <Typography variant="body2">
                      Notre solution se distingue par trois avantages majeurs : une interface intuitive qui ne nécessite aucune formation, une intégration facile avec vos outils existants, et un prix compétitif sans frais cachés. Contrairement à nos concurrents, nous offrons également un support client 24/7 inclus dans tous nos forfaits.
                    </Typography>
                  </Paper>
                  
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Question:
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Comment puis-je contacter le service client ?
                    </Typography>
                    <Typography variant="subtitle2" color="secondary" gutterBottom>
                      Réponse:
                    </Typography>
                    <Typography variant="body2">
                      Vous pouvez contacter notre service client par téléphone au 01 23 45 67 89 du lundi au vendredi de 9h à 18h, par email à support@example.com, ou via le chat en direct sur notre site web. Pour les clients Premium, une ligne dédiée est disponible 24/7.
                    </Typography>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default DatasetDetailPage; 