import React, { useState, useEffect, useRef } from 'react';
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
  IconButton,
  Link,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  LinearProgress,
} from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import YouTubeIcon from '@mui/icons-material/YouTube';
import DatasetIcon from '@mui/icons-material/Dataset';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import { useSnackbar } from 'notistack';
import { projectService, contentService, datasetService, fineTuningService } from '../services/apiService';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [contents, setContents] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [fineTunings, setFineTunings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [contentAnchorEl, setContentAnchorEl] = useState(null);
  const [datasetAnchorEl, setDatasetAnchorEl] = useState(null);
  const [fineTuningAnchorEl, setFineTuningAnchorEl] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [selectedFineTuning, setSelectedFineTuning] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef(null);

  const { enqueueSnackbar } = useSnackbar();

  // Fonction pour récupérer les données du projet
  const fetchProjectData = async () => {
    setLoading(true);
    try {
      // Récupérer le projet depuis l'API
      const projectData = await projectService.getById(projectId);
      setProject(projectData);
      
      // Récupérer les contenus du projet
      const contentsData = await contentService.getByProjectId(projectId);
      setContents(contentsData);
      
      // Récupérer les datasets du projet
      const datasetsData = await datasetService.getByProjectId(projectId);
      setDatasets(datasetsData);
      
      // Récupérer les fine-tunings du projet
      try {
        const fineTuningsData = await Promise.all(
          datasetsData.map(async (dataset) => {
            try {
              const fineTunings = await fineTuningService.getByDatasetId(dataset.id);
              return fineTunings.map(ft => ({
                ...ft,
                dataset_name: dataset.name,
                dataset: dataset
              }));
            } catch (error) {
              console.error(`Erreur lors de la récupération des fine-tunings pour le dataset ${dataset.id}:`, error);
              return [];
            }
          })
        );
        
        // Aplatir le tableau de tableaux et trier par date de création (ordre décroissant)
        const allFineTunings = fineTuningsData
          .flat()
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        setFineTunings(allFineTunings);
      } catch (error) {
        console.error("Erreur lors de la récupération des fine-tunings:", error);
      }
      
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

  // Fonction pour mettre à jour un fine-tuning spécifique dans l'état
  const updateFineTuningState = (updatedFineTuning) => {
    setFineTunings(prev => 
      prev.map(ft => 
        ft.id === updatedFineTuning.id ? { ...ft, ...updatedFineTuning } : ft
      )
    );
  };

  // Polling pour les statuts des fine-tunings
  useEffect(() => {
    const pollStatuses = async () => {
      const trainingJobs = fineTunings.filter(ft => [
        'training', 'queued', 'preparing'
      ].includes(ft.status));

      if (trainingJobs.length === 0) {
        if (pollingIntervalRef.current) {
          console.log("Arrêt du polling: Aucun job en cours.");
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          setIsPolling(false);
        }
        return;
      }

      if (!isPolling) setIsPolling(true);
      console.log(`Polling ${trainingJobs.length} fine-tuning jobs...`);

      for (const job of trainingJobs) {
        try {
          const updatedJob = await fineTuningService.getById(job.id);
          updateFineTuningState(updatedJob); 
          // Arrêter le polling pour ce job s'il est terminé
          if (['completed', 'failed', 'cancelled'].includes(updatedJob.status)) {
             console.log(`Job ${job.id} terminé (${updatedJob.status}), arrêt du polling pour ce job.`);
          }
        } catch (error) {
          console.error(`Erreur polling job ${job.id}:`, error);
          // Optionnel: marquer le job comme potentiellement en erreur dans l'UI
        }
      }
    };

    // Démarrer le polling seulement si fineTunings a été chargé et contient des jobs
    if (fineTunings.length > 0 && !pollingIntervalRef.current) {
        const initialTrainingJobs = fineTunings.filter(ft => [
            'training', 'queued', 'preparing'
        ].includes(ft.status));
        
        if (initialTrainingJobs.length > 0) {
             console.log("Démarrage du polling des fine-tunings...");
             pollingIntervalRef.current = setInterval(pollStatuses, 30000); // Poll toutes les 30 secondes
             pollStatuses(); // Appel immédiat
        }
    }

    // Nettoyer l'intervalle au démontage
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fineTunings, isPolling]); // Dépend de fineTunings pour redémarrer si la liste change

  // Gestion des onglets
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Gestion des menus contextuels
  const handleContentMenuOpen = (event, content) => {
    setContentAnchorEl(event.currentTarget);
    setSelectedContent(content);
  };

  const handleContentMenuClose = () => {
    setContentAnchorEl(null);
    setSelectedContent(null);
  };

  const handleDatasetMenuOpen = (event, dataset) => {
    setDatasetAnchorEl(event.currentTarget);
    setSelectedDataset(dataset);
  };

  const handleDatasetMenuClose = () => {
    setDatasetAnchorEl(null);
    setSelectedDataset(null);
  };

  // Nouveau gestionnaire pour le menu des fine-tunings
  const handleFineTuningMenuOpen = (event, fineTuning) => {
    setFineTuningAnchorEl(event.currentTarget);
    setSelectedFineTuning(fineTuning);
  };

  const handleFineTuningMenuClose = () => {
    setFineTuningAnchorEl(null);
    setSelectedFineTuning(null);
  };

  // Actions sur les contenus
  const handleViewContent = (contentId) => {
    navigate(`/dashboard/content/${contentId}`);
    handleContentMenuClose();
  };

  const handleDeleteContent = async (contentId) => {
    try {
      console.log('Suppression du contenu:', contentId);
      
      // Demander confirmation avant suppression
      if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) {
        return;
      }
      
      // Supprimer le contenu via l'API
      await contentService.delete(contentId);
      
      // Mettre à jour l'état local pour refléter la suppression
      setContents(prevContents => prevContents.filter(content => content.id !== contentId));
      
      enqueueSnackbar('Contenu supprimé avec succès', { variant: 'success' });
    } catch (err) {
      console.error('Error deleting content:', err);
      enqueueSnackbar('Erreur lors de la suppression du contenu', { variant: 'error' });
    }
    handleContentMenuClose();
  };

  // Actions sur les datasets
  const handleViewDataset = (datasetId) => {
    navigate(`/dashboard/datasets/${datasetId}`);
    handleDatasetMenuClose();
  };

  const handleFineTuneDataset = (datasetId) => {
    navigate(`/dashboard/fine-tuning/new/${datasetId}`);
    handleDatasetMenuClose();
  };

  const handleDeleteDataset = async (datasetId) => {
    try {
      console.log('Suppression du dataset:', datasetId);
      
      // Supprimer le dataset via l'API
      await datasetService.delete(datasetId);
      
      // Mettre à jour l'état local pour refléter la suppression
      setDatasets(prevDatasets => prevDatasets.filter(dataset => dataset.id !== datasetId));
      
      enqueueSnackbar('Dataset supprimé avec succès', { variant: 'success' });
    } catch (err) {
      console.error('Error deleting dataset:', err);
      setError('Impossible de supprimer le dataset. Veuillez réessayer.');
      enqueueSnackbar('Erreur lors de la suppression du dataset', { variant: 'error' });
    }
    handleDatasetMenuClose();
  };

  // Actions sur les fine-tunings
  const handleViewFineTuning = (fineTuningId) => {
    navigate(`/dashboard/fine-tuning/${fineTuningId}`);
    handleFineTuningMenuClose();
  };

  const handleChatWithFineTuning = (fineTuningId) => {
    navigate(`/dashboard/chat/${fineTuningId}`);
    handleFineTuningMenuClose();
  };

  // Modifier handleDownloadDataset pour utiliser le service
  const handleDownloadDataset = async (datasetId) => {
    if (!datasetId) return;
    
    handleDatasetMenuClose(); // Fermer le menu
    handleFineTuningMenuClose(); // Fermer aussi l'autre menu si ouvert
    enqueueSnackbar("Préparation du téléchargement...", { variant: 'info' });

    try {
      // Appeler le service pour obtenir le blob et le nom de fichier
      const { blob, filename } = await datasetService.downloadDataset(datasetId, 'openai'); // ou provider dynamique

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
      
      // Ne pas afficher de notif succès ici, le navigateur gère le téléchargement

    } catch (error) {
      console.error('Erreur lors du téléchargement du dataset:', error);
      enqueueSnackbar(`Erreur téléchargement: ${error.message}`, { variant: 'error' });
    }
  };

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
      case 'processed':
      case 'ready':
      case 'completed':
        return 'success';
      case 'processing':
      case 'generating':
      case 'training':
      case 'queued':
      case 'preparing':
        return 'warning';
      case 'error':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'processed':
        return 'Traité';
      case 'processing':
        return 'En traitement';
      case 'ready':
        return 'Prêt';
      case 'generating':
        return 'En génération';
      case 'error':
        return 'Erreur';
      case 'queued':
        return 'En attente';
      case 'preparing':
        return 'En préparation';
      case 'training':
        return 'En entraînement';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  // Fonction pour mettre à jour le projet
  const handleUpdateProject = async () => {
    try {
      // Mettre à jour le projet via l'API
      const updatedProject = await projectService.update(projectId, {
        name: editName,
        description: editDescription,
      });
      
      setProject(updatedProject);
      setEditDialogOpen(false);
      enqueueSnackbar('Projet mis à jour avec succès', { variant: 'success' });
    } catch (err) {
      console.error('Error updating project:', err);
      enqueueSnackbar('Erreur lors de la mise à jour du projet', { variant: 'error' });
    }
  };

  // Fonction pour supprimer le projet
  const handleDeleteProject = async () => {
    try {
      // Supprimer le projet via l'API
      await projectService.delete(projectId);
      
      setDeleteDialogOpen(false);
      enqueueSnackbar('Projet supprimé avec succès', { variant: 'success' });
      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting project:', err);
      enqueueSnackbar('Erreur lors de la suppression du projet', { variant: 'error' });
    }
  };

  // Ajouter cette fonction pour le téléchargement des contenus
  const handleDownloadContent = async (content) => {
    if (!content.file_path) {
      enqueueSnackbar('Ce contenu ne peut pas être téléchargé (pas un fichier)', { variant: 'warning' });
      return;
    }
    
    handleContentMenuClose(); // Fermer le menu si ouvert
    enqueueSnackbar("Préparation du téléchargement...", { variant: 'info' });
    
    try {
      // Utiliser le nouveau service
      const { blob, filename } = await contentService.downloadContent(content.id);

      // Créer une URL objet pour le blob
      const url = window.URL.createObjectURL(blob);
      
      // Créer un lien temporaire
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename); // Utiliser le nom de fichier extrait
      
      // Ajouter au DOM, cliquer, puis supprimer
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      // Libérer l'URL objet
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erreur lors du téléchargement du contenu:', error);
      enqueueSnackbar(`Erreur téléchargement: ${error.message}`, { variant: 'error' });
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
          Projets
        </Link>
        <Typography color="text.primary">
          {loading ? 'Chargement...' : project?.name}
        </Typography>
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
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h4" gutterBottom>
                    {project.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {project.description || 'Aucune description'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Créé le {formatDate(project.created_at)}
                    </Typography>
                    <Chip 
                      label={project.status === 'active' ? 'Actif' : 'Archivé'} 
                      size="small"
                      color={project.status === 'active' ? 'success' : 'default'}
                    />
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setEditName(project.name);
                    setEditDescription(project.description || '');
                    setEditDialogOpen(true);
                  }}
                >
                  Modifier
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* --- NOUVEAU BOUTON PRINCIPAL --- */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Button 
              variant="contained" 
              size="large"
              startIcon={<PsychologyIcon />}
              onClick={() => navigate(`/dashboard/projects/${projectId}/new-fine-tuning`)}
              sx={{ py: 1.5, px: 4, borderRadius: 3 }}
            >
              ✨ Lancer un nouveau Fine-tuning
            </Button>
          </Box>
          {/* --- FIN NOUVEAU BOUTON PRINCIPAL --- */}

          <Box sx={{ mb: 4 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="project tabs">
              <Tab label="Contenus" id="tab-0" />
              <Tab label="Finetune" id="tab-1" />
            </Tabs>
          </Box>

          <Box role="tabpanel" hidden={tabValue !== 0}>
            {tabValue === 0 && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5">
                    Contenus ({contents.length})
                  </Typography>
                </Box>

                {contents.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <TextSnippetIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Aucun contenu
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                       Utilisez le bouton "Lancer un nouveau Fine-tuning" ci-dessus pour ajouter du contenu.
                    </Typography>
                  </Paper>
                ) : (
                  <List component={Paper}>
                    {contents.map((content) => (
                      <React.Fragment key={content.id}>
                        <ListItem 
                          sx={{ py: 2 }}
                        >
                          <ListItemIcon>
                            {getContentIcon(content.type)}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {content.name}
                                <Chip 
                                  label={getStatusLabel(content.status)} 
                                  size="small"
                                  color={getStatusColor(content.status)}
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" component="span" color="text.secondary">
                                  {content.description || 'Aucune description'}
                                </Typography>
                                {content.status === 'error' && content.error_message && (
                                  <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                                    Erreur: {content.error_message}
                                  </Typography>
                                )}
                                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Type: {content.type.toUpperCase()}
                                  </Typography>
                                  {content.size > 0 && (
                                    <Typography variant="caption" color="text.secondary">
                                      Taille: {formatSize(content.size)}
                                    </Typography>
                                  )}
                                  <Typography variant="caption" color="text.secondary">
                                    Ajouté le: {formatDate(content.created_at)}
                                  </Typography>
                                </Box>
                              </>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Box sx={{ display: 'flex' }}>
                              {content.file_path && (
                                <IconButton 
                                  edge="end" 
                                  onClick={() => handleDownloadContent(content)}
                                  title="Télécharger"
                                >
                                  <DownloadIcon />
                                </IconButton>
                              )}
                              <IconButton 
                                edge="end" 
                                onClick={() => handleDeleteContent(content.id)}
                                title="Supprimer"
                                sx={{ ml: 1 }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </>
            )}
          </Box>

          <Box role="tabpanel" hidden={tabValue !== 1}>
            {tabValue === 1 && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5">
                    Fine-tunings ({fineTunings.length})
                  </Typography>
                </Box>

                {fineTunings.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <PsychologyIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Aucun fine-tuning
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                       Utilisez le bouton "Lancer un nouveau Fine-tuning" ci-dessus pour commencer.
                    </Typography>
                  </Paper>
                ) : (
                  <>
                    {/* Liste des fine-tunings */}
                    <List component={Paper}>
                      {fineTunings.map((fineTuning) => (
                        <React.Fragment key={fineTuning.id}>
                          <ListItem 
                            button 
                            onClick={() => handleViewFineTuning(fineTuning.id)}
                            sx={{ py: 2 }}
                          >
                            <ListItemIcon>
                              <PsychologyIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {fineTuning.name}
                                  <Chip 
                                    label={getStatusLabel(fineTuning.status)} 
                                    size="small"
                                    color={getStatusColor(fineTuning.status)}
                                    sx={{ ml: 1 }}
                                  />
                                </Box>
                              }
                              secondary={
                                <>
                                  {/* Afficher la barre de progression si en cours */}
                                  {['training', 'preparing'].includes(fineTuning.status) && fineTuning.progress !== undefined && (
                                      <Box sx={{ width: '100%', my: 0.5 }}>
                                          <LinearProgress variant="determinate" value={fineTuning.progress} />
                                          <Typography variant="caption" sx={{ float: 'right' }}>{fineTuning.progress.toFixed(0)}%</Typography>
                                      </Box>
                                  )}
                                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Modèle: {fineTuning.model}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Provider: {fineTuning.provider}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Créé le: {formatDate(fineTuning.created_at)}
                                    </Typography>
                                  </Box>
                                </>
                              }
                            />
                            <ListItemSecondaryAction>
                              {fineTuning.status === 'completed' && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleChatWithFineTuning(fineTuning.id);
                                  }}
                                  sx={{ mr: 1 }}
                                >
                                  Tester
                                </Button>
                              )}
                              <IconButton
                                edge="end"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFineTuningMenuOpen(e, fineTuning);
                                }}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  </>
                )}
              </>
            )}
          </Box>
        </>
      )}

      {/* Menu contextuel pour les contenus */}
      <Menu
        anchorEl={contentAnchorEl}
        open={Boolean(contentAnchorEl)}
        onClose={handleContentMenuClose}
      >
        <MenuItem onClick={() => handleViewContent(selectedContent?.id)}>
          Voir les détails
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => handleDeleteContent(selectedContent?.id)}
          sx={{ color: 'error.main' }}
        >
          Supprimer
        </MenuItem>
      </Menu>

      {/* Menu contextuel pour les datasets */}
      <Menu
        anchorEl={datasetAnchorEl}
        open={Boolean(datasetAnchorEl)}
        onClose={handleDatasetMenuClose}
      >
        <MenuItem onClick={() => handleViewDataset(selectedDataset?.id)}>
          Voir les détails
        </MenuItem>
        {selectedDataset?.status === 'ready' && (
          <MenuItem onClick={() => handleFineTuneDataset(selectedDataset?.id)}>
            Fine-tuner ce dataset
          </MenuItem>
        )}
        <MenuItem onClick={() => handleDownloadDataset(selectedDataset?.id)}>
          Télécharger le dataset
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => handleDeleteDataset(selectedDataset?.id)}
          sx={{ color: 'error.main' }}
        >
          Supprimer
        </MenuItem>
      </Menu>
      
      {/* Menu contextuel pour les fine-tunings */}
      <Menu
        anchorEl={fineTuningAnchorEl}
        open={Boolean(fineTuningAnchorEl)}
        onClose={handleFineTuningMenuClose}
      >
        <MenuItem onClick={() => handleViewFineTuning(selectedFineTuning?.id)}>
          Voir les détails
        </MenuItem>
        {selectedFineTuning?.status === 'completed' && (
          <MenuItem onClick={() => handleChatWithFineTuning(selectedFineTuning?.id)}>
            Tester le modèle
          </MenuItem>
        )}
        {selectedFineTuning?.dataset && (
          <MenuItem onClick={() => handleDownloadDataset(selectedFineTuning.dataset.id)}>
            Télécharger le dataset
          </MenuItem>
        )}
      </Menu>

      {/* Dialogue de modification du projet */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Modifier le projet"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Nom"
              type="text"
              fullWidth
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <TextField
              margin="dense"
              id="description"
              label="Description"
              type="text"
              fullWidth
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleUpdateProject}>Modifier</Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de suppression du projet */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Supprimer le projet"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer ce projet ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDeleteProject} color="error">Supprimer</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectDetailPage; 