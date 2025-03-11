import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FolderIcon from '@mui/icons-material/Folder';
import { projectService } from '../services/apiService';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // Fonction pour récupérer les projets
  const fetchProjects = async () => {
    setLoading(true);
    try {
      // Récupérer les projets depuis l'API
      console.log('Chargement des projets depuis l\'API');
      
      const projects = await projectService.getAll();
      setProjects(projects);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Impossible de récupérer les projets. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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
      setError('Impossible de supprimer le projet. Veuillez réessayer.');
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
            Mes projets
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez vos projets de fine-tuning et leurs contenus associés.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/dashboard/projects/new')}
        >
          Nouveau projet
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
              Aucun projet trouvé
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Commencez par créer votre premier projet de fine-tuning.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/dashboard/projects/new')}
            >
              Créer un projet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                  cursor: 'pointer',
                }}
                onClick={() => handleViewProject(project.id)}
              >
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {project.name}
                    </Typography>
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
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                    {project.description || 'Aucune description'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip 
                      label={`${project.content_count} contenus`} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                    <Chip 
                      label={`${project.dataset_count} datasets`}
                      size="small" 
                      color="secondary" 
                      variant="outlined" 
                    />
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" display="block">
                    Créé le {formatDate(project.created_at)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Menu contextuel pour les projets */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedProject && handleViewProject(selectedProject.id)}>
          Voir les détails
        </MenuItem>
        <MenuItem onClick={() => selectedProject && handleAddContent(selectedProject.id)}>
          Ajouter du contenu
        </MenuItem>
        <MenuItem onClick={() => selectedProject && handleCreateDataset(selectedProject.id)}>
          Créer un dataset
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => selectedProject && handleDeleteProject(selectedProject.id)}
          sx={{ color: 'error.main' }}
        >
          Supprimer
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default ProjectsPage;