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
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DatasetIcon from '@mui/icons-material/Dataset';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import YouTubeIcon from '@mui/icons-material/YouTube';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import DownloadIcon from '@mui/icons-material/Download';
import { useSnackbar } from 'notistack';
import { projectService, contentService, datasetService } from '../services/apiService';
import QualityAssessment from '../components/dashboard/QualityAssessment';
import { useTranslation } from 'react-i18next';

const DatasetDetailPage = () => {
  const { datasetId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [dataset, setDataset] = useState(null);
  const [project, setProject] = useState(null);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pairs, setPairs] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);

  // Fonction pour ouvrir le menu d'export
  const handleOpenExportMenu = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };

  // Fonction pour fermer le menu d'export
  const handleCloseExportMenu = () => {
    setExportMenuAnchor(null);
  };

  // Fonction pour exporter le dataset
  const handleExportDataset = async (provider) => {
    try {
      // Utiliser la méthode sécurisée pour télécharger le dataset
      const { blob, filename } = await datasetService.downloadDataset(datasetId, provider);
      // Créer un lien de téléchargement temporaire
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      enqueueSnackbar(t('datasetDetail.snackbar.exportStarted', { provider }), { variant: 'success' });
    } catch (error) {
      console.error('Error exporting dataset:', error);
      enqueueSnackbar(t('datasetDetail.snackbar.exportError', { provider, error: error.message || error }), { variant: 'error' });
    } finally {
      handleCloseExportMenu();
    }
  };

  // Fonction pour récupérer les données du dataset
  const fetchDatasetData = async () => {
    setLoading(true);
    try {
      // Récupérer le dataset depuis l'API
      const datasetData = await datasetService.getById(datasetId);
      setDataset(datasetData);
      
      // Récupérer le projet associé
      const projectData = await projectService.getById(datasetData.project_id);
      setProject(projectData);
      
      // Récupérer les paires question-réponse
      const pairsData = await datasetService.getPairs(datasetId);
      setPairs(pairsData);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching dataset data:', err);
      setError(t('datasetDetail.error.loadData'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasetData();
  }, [datasetId, t]);

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
    if (status === t('datasetDetail.status.generating')) return 'primary';
    if (status === t('datasetDetail.status.ready')) return 'success';
    if (status === t('datasetDetail.status.failed')) return 'error';
    return 'default';
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'generating': return t('datasetDetail.status.generating');
      case 'ready': return t('datasetDetail.status.ready');
      case 'failed': return t('datasetDetail.status.failed');
      default: return t('common.unknown');
    }
  };

  // Lancer un fine-tuning avec ce dataset
  const handleStartFineTuning = () => {
    navigate(`/dashboard/fine-tuning/new/${datasetId}`);
  };

  // Fonction pour supprimer le dataset
  const handleDeleteDataset = async () => {
    try {
      // Supprimer le dataset via l'API
      await datasetService.delete(datasetId);
      
      enqueueSnackbar(t('datasetDetail.snackbar.deleteSuccess'), { variant: 'success' });
      navigate(`/dashboard/projects/${project.id}`);
    } catch (err) {
      console.error('Error deleting dataset:', err);
      enqueueSnackbar(t('datasetDetail.snackbar.deleteError'), { variant: 'error' });
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
          {t('common.dashboard')}
        </Link>
        <Link component={RouterLink} to="/dashboard/projects" color="inherit">
          {t('sidebar.menu.projects')}
        </Link>
        {project && (
          <Link component={RouterLink} to={`/dashboard/projects/${project.id}`} color="inherit">
            {project.name}
          </Link>
        )}
        <Typography color="text.primary">{t('datasetDetail.breadcrumb')}</Typography>
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
                {dataset.description || t('common.noDescription')}
              </Typography>
            </Box>
            <Box>
              {dataset.status === 'ready' && (
                <>
                  <Button
                    variant="contained"
                    startIcon={<PsychologyIcon />}
                    onClick={handleStartFineTuning}
                    sx={{ mr: 2 }}
                  >
                    {t('datasetDetail.startFinetuningButton')}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleOpenExportMenu}
                    disabled={dataset.status !== 'ready'}
                    title={dataset.status !== 'ready' ? t('datasetDetail.exportTooltipDisabled') : undefined}
                  >
                    {t('datasetDetail.exportButton')}
                  </Button>
                  <Menu
                    anchorEl={exportMenuAnchor}
                    open={Boolean(exportMenuAnchor)}
                    onClose={handleCloseExportMenu}
                  >
                    <MenuItem onClick={() => handleExportDataset('openai')} disabled={dataset.status !== 'ready'}>
                      {t('datasetDetail.exportMenu.openai')}
                    </MenuItem>
                    <MenuItem onClick={() => handleExportDataset('anthropic')} disabled={dataset.status !== 'ready'}>
                      {t('datasetDetail.exportMenu.anthropic')}
                    </MenuItem>
                  </Menu>
                  {dataset.status !== 'ready' && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {t('datasetDetail.exportTooltipDisabled')}
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {t('datasetDetail.generalInfoTitle')}
                    </Typography>
                    <Chip
                      label={getStatusLabel(dataset.status)}
                      color={getStatusColor(dataset.status)}
                    />
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        {t('common.createdOn')}
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(dataset.created_at)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        {t('datasetDetail.pairCountLabel')}
                      </Typography>
                      <Typography variant="body1">
                        {dataset.pairs_count}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        {t('common.size')}
                      </Typography>
                      <Typography variant="body1">
                        {formatSize(dataset.size)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        {t('datasetDetail.generationMethodLabel')}
                      </Typography>
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {t(`datasetDetail.generationMethods.${dataset.generation_method}`)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('datasetDetail.usedContentTitle')}
                  </Typography>
                  
                  <List>
                    {contents.map((content) => (
                      <ListItem key={content.id} divider>
                        <ListItemIcon>
                          {getContentIcon(content.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={content.name}
                          secondary={content.description || t('common.noDescription')}
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
                    {t('datasetDetail.generationParamsTitle')}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t('datasetDetail.chunkSizeLabel')}
                      </Typography>
                      <Typography variant="body1">
                        {t('datasetDetail.chunkSizeValue')}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t('common.method')}
                      </Typography>
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {t(`datasetDetail.generationMethods.${dataset.generation_method}`)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {t('datasetDetail.systemPromptTitle')}
                    </Typography>
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      variant="outlined"
                      onClick={() => {
                        // Ouvrir la boîte de dialogue pour éditer le system content
                        const newSystemContent = prompt(
                          t('datasetDetail.editSystemPromptDialog.title'),
                          dataset.system_content || t('datasetDetail.editSystemPromptDialog.defaultValue')
                        );
                        
                        if (newSystemContent !== null && newSystemContent.trim() !== "") {
                          // Mettre à jour le system content via l'API
                          datasetService.updateSystemContent(datasetId, newSystemContent)
                            .then(() => {
                              fetchDatasetData(); // Rafraîchir les données
                              enqueueSnackbar(t('datasetDetail.snackbar.systemPromptUpdateSuccess'), { variant: 'success' });
                            })
                            .catch(error => {
                              console.error('Error updating system content:', error);
                              enqueueSnackbar(t('datasetDetail.snackbar.systemPromptUpdateError'), { variant: 'error' });
                            });
                        }
                      }}
                    >
                      {t('common.edit')}
                    </Button>
                  </Box>
                  
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                      {dataset.system_content || t('datasetDetail.editSystemPromptDialog.defaultValue')}
                    </Typography>
                  </Paper>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {t('datasetDetail.systemPromptHelperText')}
                  </Typography>
                </CardContent>
              </Card>
              
              {/* Afficher l'évaluation de la qualité si le dataset a un nombre de caractères */}
              {dataset.character_count > 0 && dataset.status === 'ready' && (
                <Card sx={{ mb: 4 }}>
                  <CardContent>
                    <QualityAssessment characterCount={dataset.character_count} />
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('datasetDetail.pairExamplesTitle')}
                  </Typography>
                  
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      {t('common.question')}:
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {t('datasetDetail.example1.question')}
                    </Typography>
                    <Typography variant="subtitle2" color="secondary" gutterBottom>
                      {t('common.answer')}:
                    </Typography>
                    <Typography variant="body2">
                      {t('datasetDetail.example1.answer')}
                    </Typography>
                  </Paper>
                  
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      {t('common.question')}:
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {t('datasetDetail.example2.question')}
                    </Typography>
                    <Typography variant="subtitle2" color="secondary" gutterBottom>
                      {t('common.answer')}:
                    </Typography>
                    <Typography variant="body2">
                      {t('datasetDetail.example2.answer')}
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