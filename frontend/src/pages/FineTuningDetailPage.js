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
  LinearProgress,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
} from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DatasetIcon from '@mui/icons-material/Dataset';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatIcon from '@mui/icons-material/Chat';
import DownloadIcon from '@mui/icons-material/Download';
import { useSnackbar } from 'notistack';
import { projectService, datasetService, fineTuningService } from '../services/apiService';

const FineTuningDetailPage = () => {
  const { fineTuningId } = useParams();
  const navigate = useNavigate();
  const [fineTuning, setFineTuning] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testPrompt, setTestPrompt] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [testError, setTestError] = useState(null);
  const [testing, setTesting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Fonction pour récupérer les données du fine-tuning
  const fetchFineTuningData = async () => {
    setLoading(true);
    try {
      // Récupérer le fine-tuning depuis l'API
      const fineTuningData = await fineTuningService.getById(fineTuningId);
      setFineTuning(fineTuningData);
      
      // Récupérer le dataset associé
      const datasetData = await datasetService.getById(fineTuningData.dataset_id);
      setDataset(datasetData);
      
      // Récupérer le projet associé
      const projectData = await projectService.getById(datasetData.project_id);
      setProject(projectData);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching fine-tuning data:', err);
      setError('Impossible de récupérer les données du fine-tuning. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFineTuningData();
    
    // Mettre en place un intervalle pour rafraîchir les données toutes les 10 secondes
    // si le fine-tuning est en cours
    const refreshInterval = setInterval(() => {
      if (fineTuning && (fineTuning.status === 'training' || fineTuning.status === 'queued' || fineTuning.status === 'preparing')) {
        fetchFineTuningData();
      } else {
        clearInterval(refreshInterval);
      }
    }, 10000);
    
    return () => clearInterval(refreshInterval);
  }, [fineTuningId, fineTuning?.status]);

  // Formatage de la date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'queued':
      case 'preparing':
      case 'training':
        return 'primary';
      case 'completed':
        return 'success';
      case 'failed':
      case 'cancelled':
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'queued':
        return 'En attente';
      case 'preparing':
        return 'En préparation';
      case 'training':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      case 'failed':
      case 'error':
        return 'Échoué';
      default:
        return 'Inconnu';
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'queued':
      case 'preparing':
      case 'training':
        return <CircularProgress size={16} />;
      case 'completed':
        return <CheckCircleIcon fontSize="small" />;
      case 'cancelled':
      case 'failed':
      case 'error':
        return <ErrorIcon fontSize="small" />;
      default:
        return null;
    }
  };

  // Fonction pour annuler le fine-tuning
  const handleCancelFineTuning = async () => {
    try {
      // Annuler le fine-tuning via l'API
      await fineTuningService.cancel(fineTuningId);
      
      // Mettre à jour les données
      fetchFineTuningData();
      enqueueSnackbar('Fine-tuning annulé avec succès', { variant: 'success' });
    } catch (err) {
      console.error('Error canceling fine-tuning:', err);
      enqueueSnackbar('Erreur lors de l\'annulation du fine-tuning', { variant: 'error' });
    }
  };

  // Fonction pour tester le modèle
  const handleTestModel = async () => {
    if (!testPrompt.trim()) {
      setTestError('Veuillez entrer un prompt de test');
      return;
    }
    
    setTesting(true);
    setTestError(null);
    
    try {
      // Tester le modèle via l'API
      const response = await fineTuningService.testModel(fineTuningId, testPrompt);
      setTestResponse(response.completion);
    } catch (err) {
      console.error('Error testing model:', err);
      setTestError(err.message || 'Erreur lors du test du modèle');
    } finally {
      setTesting(false);
    }
  };

  // Fonction pour supprimer le fine-tuning
  const handleDeleteFineTuning = async () => {
    try {
      // Supprimer le fine-tuning via l'API
      await fineTuningService.delete(fineTuningId);
      
      enqueueSnackbar('Fine-tuning supprimé avec succès', { variant: 'success' });
      navigate(`/dashboard/projects/${project.id}`);
    } catch (err) {
      console.error('Error deleting fine-tuning:', err);
      enqueueSnackbar('Erreur lors de la suppression du fine-tuning', { variant: 'error' });
    }
  };

  // Fonction pour télécharger le dataset
  const handleDownloadDataset = (datasetId) => {
    try {
      // Construire l'URL pour télécharger le dataset
      const downloadUrl = `${process.env.REACT_APP_API_URL}/api/datasets/${datasetId}/export`;
      
      // Ouvrir l'URL dans un nouvel onglet
      window.open(downloadUrl, '_blank');
      
      enqueueSnackbar('Téléchargement du dataset commencé', { variant: 'success' });
    } catch (error) {
      console.error('Erreur lors du téléchargement du dataset:', error);
      enqueueSnackbar('Erreur lors du téléchargement du dataset', { variant: 'error' });
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
          <Link component={RouterLink} to={`/dashboard/projects/${project.id}`} color="inherit">
            {project.name}
          </Link>
        )}
        <Typography color="text.primary">Fine-tuning</Typography>
      </Breadcrumbs>

      {loading ? (
        <CircularProgress sx={{ display: 'block', margin: '40px auto' }} />
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
      ) : fineTuning ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                {fineTuning.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {fineTuning.description || 'Aucune description'}
              </Typography>
            </Box>
            
            {/* Actions pour le fine-tuning */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {dataset && (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownloadDataset(dataset.id)}
                >
                  Télécharger le dataset
                </Button>
              )}
              
              {fineTuning.status === 'training' && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<StopIcon />}
                  onClick={handleCancelFineTuning}
                >
                  Annuler
                </Button>
              )}
              
              {fineTuning.status === 'completed' && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ChatIcon />}
                  onClick={() => navigate(`/dashboard/chat/${fineTuning.id}`)}
                >
                  Tester le modèle
                </Button>
              )}
            </Box>
          </Box>

          {/* Afficher la progression si en cours */}
          {fineTuning.status === 'training' && fineTuning.progress && (
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                  Progression: {Math.round(fineTuning.progress)}%
                </Typography>
                <CircularProgress size={20} />
              </Box>
              <LinearProgress variant="determinate" value={fineTuning.progress} color="primary" sx={{ height: 8, borderRadius: 4 }} />
            </Box>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Informations sur le fine-tuning
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Statut" 
                      secondary={
                        <Chip 
                          label={getStatusLabel(fineTuning.status)} 
                          color={getStatusColor(fineTuning.status)}
                          size="small"
                          icon={getStatusIcon(fineTuning.status)}
                          sx={{ mt: 1 }}
                        />
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText primary="Modèle" secondary={fineTuning.model} />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText primary="Provider" secondary={fineTuning.provider} />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText primary="Créé le" secondary={formatDate(fineTuning.created_at)} />
                  </ListItem>
                  {fineTuning.completed_at && (
                    <>
                      <Divider component="li" />
                      <ListItem>
                        <ListItemText primary="Terminé le" secondary={formatDate(fineTuning.completed_at)} />
                      </ListItem>
                    </>
                  )}
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" gutterBottom>
                    Dataset associé
                  </Typography>
                  {dataset && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadDataset(dataset.id)}
                      size="small"
                    >
                      Télécharger
                    </Button>
                  )}
                </Box>
                
                {dataset ? (
                  <List>
                    <ListItem>
                      <ListItemText primary="Nom" secondary={dataset.name} />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText primary="Description" secondary={dataset.description || 'Aucune description'} />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText primary="Nombre de paires" secondary={dataset.pairs_count || 0} />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText primary="Taille" secondary={dataset.size ? formatSize(dataset.size) : 'N/A'} />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText primary="Créé le" secondary={formatDate(dataset.created_at)} />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText 
                        primary="System Prompt" 
                        secondary={
                          <Paper variant="outlined" sx={{ p: 1, mt: 1, bgcolor: 'background.default' }}>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                              {dataset.system_content || "You are a helpful assistant."}
                            </Typography>
                          </Paper>
                        } 
                      />
                    </ListItem>
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Information du dataset non disponible
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Section de test du modèle */}
          {fineTuning.status === 'completed' && (
            <Card sx={{ mt: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tester le modèle
                </Typography>
                
                <TextField
                  fullWidth
                  label="Prompt de test"
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  multiline
                  rows={3}
                  variant="outlined"
                  sx={{ mb: 2 }}
                  error={!!testError}
                  helperText={testError}
                />
                
                <Button
                  variant="contained"
                  onClick={handleTestModel}
                  disabled={testing || !testPrompt.trim()}
                  startIcon={testing ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                  sx={{ mb: 2 }}
                >
                  {testing ? 'Test en cours...' : 'Tester'}
                </Button>
                
                {testResponse && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Réponse du modèle:
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {testResponse}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions supplémentaires */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/dashboard/projects/${project.id}`)}
            >
              Retour au projet
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteFineTuning}
            >
              Supprimer ce fine-tuning
            </Button>
          </Box>
        </>
      ) : (
        <Alert severity="info">Aucune information trouvée pour ce fine-tuning.</Alert>
      )}
    </Container>
  );
};

export default FineTuningDetailPage; 