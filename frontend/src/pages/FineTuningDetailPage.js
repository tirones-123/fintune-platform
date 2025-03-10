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
} from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DatasetIcon from '@mui/icons-material/Dataset';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import axios from 'axios';
import { projectService, datasetService, fineTuningService } from '../services/localStorageService';

const FineTuningDetailPage = () => {
  const { fineTuningId } = useParams();
  const navigate = useNavigate();
  const [fineTuning, setFineTuning] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour récupérer les données du fine-tuning
  const fetchFineTuningData = async () => {
    setLoading(true);
    try {
      console.log('Chargement des données du fine-tuning depuis localStorage:', fineTuningId);
      
      // Simuler un délai pour montrer le chargement
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Récupérer le fine-tuning
      const fineTuning = fineTuningService.getById(fineTuningId);
      if (!fineTuning) {
        setError('Fine-tuning non trouvé');
        setLoading(false);
        return;
      }
      setFineTuning(fineTuning);
      
      // Récupérer le dataset associé
      const dataset = datasetService.getById(fineTuning.dataset_id);
      setDataset(dataset);
      
      // Récupérer le projet associé
      const project = projectService.getById(fineTuning.project_id);
      setProject(project);

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
    
    // Simuler des mises à jour de progression toutes les 5 secondes
    const progressInterval = setInterval(() => {
      setFineTuning(prev => {
        if (!prev || prev.status !== 'training' || prev.progress >= 100) {
          clearInterval(progressInterval);
          return prev;
        }
        
        const newProgress = Math.min(prev.progress + 5, 100);
        const newStatus = newProgress === 100 ? 'completed' : 'training';
        const newCompletedAt = newProgress === 100 ? new Date().toISOString() : null;
        
        // Mettre à jour le fine-tuning dans le localStorage
        const updatedFineTuning = {
          ...prev,
          progress: newProgress,
          status: newStatus,
          completed_at: newCompletedAt,
        };
        
        fineTuningService.save(updatedFineTuning);
        
        return updatedFineTuning;
      });
    }, 5000);
    
    return () => clearInterval(progressInterval);
  }, [fineTuningId]);

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
      case 'training':
        return 'primary';
      case 'completed':
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
      case 'training':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'failed':
        return 'Échoué';
      default:
        return 'Inconnu';
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'training':
        return <CircularProgress size={16} />;
      case 'completed':
        return <CheckCircleIcon fontSize="small" />;
      case 'failed':
        return <ErrorIcon fontSize="small" />;
      default:
        return null;
    }
  };

  // Simuler l'arrêt du fine-tuning
  const handleStopFineTuning = async () => {
    try {
      console.log('Arrêt du fine-tuning:', fineTuningId);
      
      // Simuler un délai
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mettre à jour l'état local et le localStorage
      const updatedFineTuning = {
        ...fineTuning,
        status: 'completed',
        progress: 100,
        completed_at: new Date().toISOString(),
      };
      
      fineTuningService.save(updatedFineTuning);
      setFineTuning(updatedFineTuning);
    } catch (err) {
      console.error('Error stopping fine-tuning:', err);
      setError('Impossible d\'arrêter le fine-tuning. Veuillez réessayer.');
    }
  };

  // Simuler le test du modèle
  const handleTestModel = () => {
    navigate(`/dashboard/chat/${fineTuningId}`);
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
        <Typography color="text.primary">Fine-tuning</Typography>
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
                {fineTuning.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {fineTuning.description || 'Aucune description'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {fineTuning.status === 'training' && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={handleStopFineTuning}
                >
                  Arrêter
                </Button>
              )}
              {fineTuning.status === 'completed' && (
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleTestModel}
                >
                  Tester le modèle
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
                      Statut du fine-tuning
                    </Typography>
                    <Chip
                      icon={getStatusIcon(fineTuning.status)}
                      label={getStatusLabel(fineTuning.status)}
                      color={getStatusColor(fineTuning.status)}
                    />
                  </Box>
                  
                  {fineTuning.status === 'training' && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          Progression
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {fineTuning.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={fineTuning.progress} 
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
                  )}
                  
                  {fineTuning.error_message && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {fineTuning.error_message}
                    </Alert>
                  )}
                  
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Démarré le
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(fineTuning.created_at)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Terminé le
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(fineTuning.completed_at)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Fournisseur
                      </Typography>
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {fineTuning.provider}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Modèle
                      </Typography>
                      <Typography variant="body1">
                        {fineTuning.model}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              {fineTuning.status === 'completed' && fineTuning.metrics && (
                <Card sx={{ mb: 4 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Métriques d'entraînement
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Perte d'entraînement
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {fineTuning.metrics.training_loss.toFixed(4)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Perte de validation
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {fineTuning.metrics.validation_loss.toFixed(4)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Dataset utilisé
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DatasetIcon color="secondary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">
                      {dataset.name}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {dataset.description || 'Aucune description'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {dataset.pairs_count} paires Q/R
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Taille: {formatSize(dataset.size)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Paramètres d'entraînement
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Nombre d'époques
                      </Typography>
                      <Typography variant="body1">
                        {fineTuning.parameters.epochs}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Taux d'apprentissage
                      </Typography>
                      <Typography variant="body1">
                        {fineTuning.parameters.learning_rate}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default FineTuningDetailPage; 