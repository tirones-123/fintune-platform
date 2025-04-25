import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Stack,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FolderIcon from '@mui/icons-material/Folder';
import { useTranslation } from 'react-i18next';
import { projectService, contentService, datasetService, fineTuningService } from '../services/apiService';

// Fonction helper pour déterminer le statut agrégé et la couleur
const getProjectAggregateStatus = (projectId, projectStatuses, t) => {
  const statusInfo = projectStatuses[projectId];
  if (!statusInfo) return { text: t('projectsPage.status.active'), color: 'default', progress: null };

  switch (statusInfo.status) {
    case 'transcribing': return { text: t('projectsPage.status.transcribing'), color: 'info', progress: null };
    case 'generating_dataset': return { text: t('projectsPage.status.generatingDataset'), color: 'info', progress: null };
    case 'preparing_finetune': return { text: t('projectsPage.status.preparingFinetune'), color: 'warning', progress: null };
    case 'training_finetune': return { text: t('projectsPage.status.trainingFinetune', { progress: statusInfo.progress?.toFixed(0) ?? 0 }), color: 'warning', progress: statusInfo.progress };
    case 'error': return { text: t('projectsPage.status.error'), color: 'error', progress: null };
    default: return { text: t('projectsPage.status.active'), color: 'success', progress: null };
  }
};

const ProjectsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectStatuses, setProjectStatuses] = useState({});

  // Fonction pour récupérer les statuts détaillés d'un projet
  const fetchProjectDetails = useCallback(async (projectId) => {
    try {
      // 1. Récupérer les datasets et contenus du projet
      const [contents, datasets] = await Promise.all([
        contentService.getByProjectId(projectId),
        datasetService.getByProjectId(projectId)
      ]);

      // 2. Récupérer TOUS les fine-tunings et filtrer ceux de ce projet
      const allFineTunings = await fineTuningService.getAll();
      const projectFineTunings = allFineTunings.filter(ft => 
          datasets.some(ds => ds.id === ft.dataset_id)
      );

      // 3. Appliquer la même logique exacte que FineTuningDetailPage :
      // Vérifier d'abord si un dataset est en cours de génération (PLUS HAUTE PRIORITÉ)
      const processingDataset = datasets.find(d => d.status === 'processing');
      if (processingDataset) {
        return { status: 'generating_dataset', progress: null };
      }

      // Vérifier ensuite si un contenu est en cours de traitement
      const processingContent = contents.find(c => c.status === 'processing');
      if (processingContent) {
        return { status: 'transcribing', progress: null };
      }

      // Vérifier ensuite si un fine-tuning est en cours de training
      const trainingFineTuning = projectFineTunings.find(ft => ft.status === 'training');
      if (trainingFineTuning) {
        return { 
          status: 'training_finetune', 
          progress: trainingFineTuning.progress || 0
        };
      }

      // Vérifier ensuite si un fine-tuning est en préparation
      const preparingFineTuning = projectFineTunings.find(
        ft => ft.status === 'preparing' || ft.status === 'queued' || ft.status === 'pending'
      );
      if (preparingFineTuning) {
        return { status: 'preparing_finetune', progress: null };
      }

      // Vérifier ensuite les erreurs
      if (
        projectFineTunings.some(ft => ft.status === 'error') ||
        datasets.some(d => d.status === 'error') ||
        contents.some(c => c.status === 'error')
      ) {
        return { status: 'error', progress: null };
      }

      // Par défaut, projet actif
      return { status: 'idle', progress: null };

    } catch (err) {
      console.error(`Error fetching details/status for project ${projectId}:`, err);
      return { status: 'error', progress: null }; 
    }
  }, []);

  // Fonction pour mettre à jour tous les statuts
  const updateAllProjectStatuses = useCallback(async (currentProjects) => {
    if (!currentProjects || currentProjects.length === 0) return;
    console.log('Updating project statuses...');
    const statusPromises = currentProjects.map(p => fetchProjectDetails(p.id));
    const statuses = await Promise.all(statusPromises);
    const newStatuses = {};
    currentProjects.forEach((p, index) => {
      newStatuses[p.id] = statuses[index];
    });
    setProjectStatuses(newStatuses);
  }, [fetchProjectDetails]);

  // Fonction initiale pour récupérer les projets
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedProjects = await projectService.getAll();
      setProjects(fetchedProjects);
      updateAllProjectStatuses(fetchedProjects);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(t('projectsPage.errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [updateAllProjectStatuses, t]);

  useEffect(() => {
    fetchProjects();
    const intervalId = setInterval(() => {
        setProjects(currentProjects => {
             updateAllProjectStatuses(currentProjects);
             return currentProjects;
        });
    }, 15000);

    return () => clearInterval(intervalId);
  }, [fetchProjects, updateAllProjectStatuses]);

  // Gestion du menu contextuel
  const handleMenuOpen = (event, project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  // Actions sur les projets
  const handleViewProject = (projectId) => {
    navigate(`/dashboard/projects/${projectId}`);
    handleMenuClose();
  };

  const handleAddContent = (projectId) => {
    navigate(`/dashboard/content/upload/${projectId}`);
    handleMenuClose();
  };

  const handleCreateDataset = (projectId) => {
    navigate(`/dashboard/datasets/new/${projectId}`);
    handleMenuClose();
  };

  const handleDeleteProject = async (projectId) => {
    try {
      console.log('Suppression du projet:', projectId);
      
      // Supprimer le projet via l'API
      await projectService.delete(projectId);
      
      // Mettre à jour l'état local pour refléter la suppression
      setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(t('projectsPage.errors.deleteFailed'));
    }
    handleMenuClose();
  };

  // Formatage de la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('projectsPage.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('projectsPage.subtitle')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/dashboard/projects/new')}
        >
          {t('projectsPage.newProjectButton')}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : projects.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <FolderIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t('projectsPage.noProjects.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('projectsPage.noProjects.description')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/dashboard/projects/new')}
            >
              {t('projectsPage.noProjects.createButton')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => {
            const { text: statusText, color: statusColor, progress } = getProjectAggregateStatus(project.id, projectStatuses, t);
            
            return (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                    borderColor: 'primary.main'
                  },
                  cursor: 'pointer',
                }}
                onClick={() => handleViewProject(project.id)}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                       <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                         <FolderIcon />
                       </Avatar>
                      <Typography variant="h6" component="h2" noWrap sx={{ maxWidth: 200 }}>
                        {project.name}
                      </Typography>
                    </Stack>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, project);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1, minHeight: 40 }}>
                    {project.description || t('projectsPage.noDescription')}
                  </Typography>
                  
                   <Box sx={{ mt: 'auto', pt: 1.5, borderTop: `1px dashed ${theme.palette.divider}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: progress !== null ? 1 : 0 }}>
                      <Chip 
                        label={statusText}
                        size="small" 
                        color={statusColor}
                        variant={statusColor === 'default' || statusColor === 'success' ? 'outlined' : 'filled'}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {t('projectsPage.modifiedOn', { date: formatDate(project.updated_at || project.created_at) })}
                      </Typography>
                    </Box>
                     {progress !== null && (
                        <LinearProgress 
                            variant="determinate" 
                            value={progress} 
                            color="warning"
                            sx={{ height: 6, borderRadius: 3, mt: 1 }}
                        />
                     )}
                   </Box>
                </CardContent>
              </Card>
            </Grid>
            );
          })}
        </Grid>
      )}

      {/* Menu contextuel pour les projets */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedProject && handleViewProject(selectedProject.id)}>
          {t('projectsPage.menu.viewDetails')}
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => selectedProject && handleDeleteProject(selectedProject.id)}
          sx={{ color: 'error.main' }}
        >
          {t('common.delete')}
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default ProjectsPage;