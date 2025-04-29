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
import { useTranslation } from 'react-i18next';

const FineTuningDetailPage = () => {
  const { fineTuningId } = useParams();
  const navigate = useNavigate();
  const [fineTuning, setFineTuning] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

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
      setError(t('fineTuningDetail.error.fetchData'));
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
    if (!dateString) return t('common.notAvailable');
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
    if (bytes === 0) return t('common.sizeBytesZero');
    const k = 1024;
    const sizes = [t('common.sizeUnitBytes'), t('common.sizeUnitKB'), t('common.sizeUnitMB'), t('common.sizeUnitGB')];
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
      case 'preparing':
      case 'training':
      case 'completed':
      case 'cancelled':
      case 'error':
      case 'failed':
        return t(`common.status.${status}`) || status;
      default:
        return status || t('common.unknown');
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
      case 'error':
      case 'cancelled':
      case 'failed':
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
      enqueueSnackbar(t('fineTuningDetail.snackbar.cancelSuccess'), { variant: 'success' });
    } catch (err) {
      console.error('Error canceling fine-tuning:', err);
      enqueueSnackbar(t('fineTuningDetail.snackbar.cancelError'), { variant: 'error' });
    }
  };

  // Fonction pour supprimer le fine-tuning
  const handleDeleteFineTuning = async () => {
    try {
      // Supprimer le fine-tuning via l'API
      await fineTuningService.delete(fineTuningId);
      
      enqueueSnackbar(t('fineTuningDetail.snackbar.deleteSuccess'), { variant: 'success' });
      navigate(`/dashboard/projects/${project.id}`);
    } catch (err) {
      console.error('Error deleting fine-tuning:', err);
      enqueueSnackbar(t('fineTuningDetail.snackbar.deleteError'), { variant: 'error' });
    }
  };

  // Modifier handleDownloadDataset pour utiliser le service API
  const handleDownloadDataset = async (datasetId) => {
    if (!datasetId) {
        enqueueSnackbar(t('fineTuningDetail.snackbar.missingDatasetId'), { variant: 'error' });
        return;
    }
    
    enqueueSnackbar(t('fineTuningDetail.snackbar.downloadPreparing'), { variant: 'info' });
    
    try {
      // Utiliser le service API pour obtenir le blob
      const { blob, filename } = await datasetService.downloadDataset(datasetId, fineTuning?.provider || 'openai');

      // Créer une URL objet pour le blob
      const url = window.URL.createObjectURL(blob);
      
      // Créer un lien temporaire
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      
      // Ajouter au DOM, cliquer, puis supprimer
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      // Libérer l'URL objet
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erreur lors du téléchargement du dataset:', error);
      enqueueSnackbar(t('fineTuningDetail.snackbar.downloadError', { message: error.message }), { variant: 'error' });
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
          {t('fineTuningDetail.breadcrumb.dashboard')}
        </Link>
        <Link component={RouterLink} to="/dashboard/projects" color="inherit">
          {t('fineTuningDetail.breadcrumb.projects')}
        </Link>
        {project && (
          <Link component={RouterLink} to={`/dashboard/projects/${project.id}`} color="inherit">
            {project.name}
          </Link>
        )}
        <Typography color="text.primary">{t('fineTuningDetail.breadcrumb.fineTuning')}</Typography>
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
                {fineTuning.description || t('fineTuningDetail.noDescription')}
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
                  {t('fineTuningDetail.button.downloadDataset')}
                </Button>
              )}
              
              {fineTuning.status === 'training' && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<StopIcon />}
                  onClick={handleCancelFineTuning}
                >
                  {t('common.cancel')}
                </Button>
              )}
              
              {fineTuning.status === 'completed' && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ChatIcon />}
                  onClick={() => navigate(`/dashboard/chat/${fineTuning.id}`)}
                >
                  {t('fineTuningDetail.button.testModel')}
                </Button>
              )}
            </Box>
          </Box>

          {/* Afficher la progression si en cours */}
          {fineTuning.status === 'training' && fineTuning.progress && (
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                  {t('fineTuningDetail.progressLabel', { progress: Math.round(fineTuning.progress) })}
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
                  {t('fineTuningDetail.infoCard.title')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary={t('common.statusLabel')} 
                      secondary={
                        fineTuning.status === 'pending' && dataset?.status === 'processing' ? (
                          <Chip 
                            label={t('fineTuningDetail.status.generatingDataset')} 
                            color="info"
                            size="small"
                            icon={<DatasetIcon fontSize="inherit" sx={{ mr: 0.5}}/>}
                            sx={{ mt: 1 }}
                          />
                        ) : (
                          <Chip 
                            label={getStatusLabel(fineTuning.status)} 
                            color={getStatusColor(fineTuning.status)}
                            size="small"
                            icon={getStatusIcon(fineTuning.status)}
                            sx={{ mt: 1 }}
                          />
                        )
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText primary={t('fineTuningDetail.infoCard.modelLabel')} secondary={fineTuning.model} />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText primary={t('fineTuningDetail.infoCard.providerLabel')} secondary={fineTuning.provider} />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText primary={t('fineTuningDetail.infoCard.createdLabel')} secondary={formatDate(fineTuning.created_at)} />
                  </ListItem>
                  {fineTuning.completed_at && (
                    <>
                      <Divider component="li" />
                      <ListItem>
                        <ListItemText primary={t('fineTuningDetail.infoCard.completedLabel')} secondary={formatDate(fineTuning.completed_at)} />
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
                    {t('fineTuningDetail.datasetCard.title')}
                  </Typography>
                  {dataset && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadDataset(dataset.id)}
                      size="small"
                    >
                      {t('fineTuningDetail.button.download')}
                    </Button>
                  )}
                </Box>
                
                {dataset ? (
                  <List>
                    <ListItem>
                      <ListItemText primary={t('fineTuningDetail.datasetCard.nameLabel')} secondary={dataset.name} />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText primary={t('fineTuningDetail.datasetCard.descriptionLabel')} secondary={dataset.description || t('fineTuningDetail.noDescription')} />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText primary={t('fineTuningDetail.datasetCard.pairsLabel')} secondary={dataset.pairs_count || 0} />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText primary={t('fineTuningDetail.datasetCard.sizeLabel')} secondary={dataset.size ? formatSize(dataset.size) : t('common.notAvailable')} />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText primary={t('fineTuningDetail.infoCard.createdLabel')} secondary={formatDate(dataset.created_at)} />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText 
                        primary={t('fineTuningDetail.datasetCard.systemPromptLabel')} 
                        secondary={
                          <Paper variant="outlined" sx={{ p: 1, mt: 1, bgcolor: 'background.default' }}>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                              {dataset.system_content || t('common.defaultSystemPrompt')}
                            </Typography>
                          </Paper>
                        } 
                      />
                    </ListItem>
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t('fineTuningDetail.datasetCard.noInfo')}
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Actions supplémentaires */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/dashboard/projects/${project.id}`)}
            >
              {t('fineTuningDetail.button.backToProject')}
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteFineTuning}
            >
              {t('fineTuningDetail.button.deleteFineTuning')}
            </Button>
          </Box>
        </>
      ) : (
        <Alert severity="info">{t('fineTuningDetail.noInfoFound')}</Alert>
      )}
    </Container>
  );
};

export default FineTuningDetailPage; 