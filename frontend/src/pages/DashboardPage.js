import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme,
  Avatar,
  Stack,
  Divider,
  IconButton,
  LinearProgress,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DatasetIcon from '@mui/icons-material/Dataset';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BarChartIcon from '@mui/icons-material/BarChart';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CountUp from 'react-countup';
import { projectService, contentService, datasetService, fineTuningService } from '../services/apiService';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Composant pour les statistiques
const StatCard = ({ title, value, icon: Icon, color, suffix = '', prefix = '' }) => {
  const theme = useTheme();

  return (
    <motion.div variants={itemVariants}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: (theme) => 
              theme.palette.mode === 'dark'
                ? '0 10px 30px rgba(0, 0, 0, 0.3)'
                : '0 10px 30px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                {prefix}
                <CountUp end={value} duration={2} separator="," />
                {suffix}
              </Typography>
            </Box>
            <Avatar
              sx={{
                backgroundColor: color,
                width: 56,
                height: 56,
                boxShadow: `0 8px 16px ${color}40`,
              }}
            >
              <Icon sx={{ fontSize: 28, color: 'white' }} />
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Composant pour les projets récents
const RecentProjects = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getAll();
        // Trier par date de mise à jour (les plus récents d'abord)
        const sortedProjects = data.sort((a, b) => 
          new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
        ).slice(0, 3); // Prendre les 3 plus récents
        
        // Pour chaque projet, récupérer les contenus et datasets associés
        const projectsWithCounts = await Promise.all(sortedProjects.map(async (project) => {
          try {
            const contents = await contentService.getByProjectId(project.id);
            const datasets = await datasetService.getByProjectId(project.id);
            
            // Calculer la progression du projet (simple exemple)
            const progress = datasets.length > 0 ? 100 : (contents.length > 0 ? 50 : 25);
            const status = progress === 100 ? 'Terminé' : 'En cours';
            
            return {
              ...project,
              contentCount: contents.length,
              datasetCount: datasets.length,
              progress,
              status
            };
          } catch (error) {
            console.error(`Erreur lors de la récupération des détails pour le projet ${project.id}:`, error);
            return {
              ...project,
              contentCount: 0,
              datasetCount: 0,
              progress: 0,
              status: 'En cours'
            };
          }
        }));
        
        setProjects(projectsWithCounts);
      } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Terminé':
        return theme.palette.success.main;
      case 'En cours':
        return theme.palette.warning.main;
      default:
        return theme.palette.info.main;
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <Card sx={{ borderRadius: 4, height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Projets récents</Typography>
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/dashboard/projects')}
              sx={{ fontWeight: 600 }}
            >
              Voir tous
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : projects.length > 0 ? (
            <Stack spacing={2}>
              {projects.map((project) => (
                <Box
                  key={project.id}
                  component={motion.div}
                  whileHover={{ x: 5 }}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    },
                  }}
                  onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {project.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label={project.status} 
                        size="small" 
                        sx={{ 
                          backgroundColor: `${getStatusColor(project.status)}20`,
                          color: getStatusColor(project.status),
                          fontWeight: 600,
                          mr: 1,
                        }} 
                      />
                      <IconButton size="small">
                        <MoreHorizIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Mis à jour le {formatDate(project.updated_at || project.created_at)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                      {project.contentCount} contenus
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {project.datasetCount} datasets
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Progression
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {project.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.progress} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          backgroundColor: getStatusColor(project.status),
                        }
                      }} 
                    />
                  </Box>
                </Box>
              ))}
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Vous n'avez pas encore de projets
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/dashboard/projects/new')}
                startIcon={<AddIcon />}
              >
                Créer un projet
              </Button>
            </Box>
          )}
          
          {projects.length > 0 && (
            <Button
              variant="outlined"
              fullWidth
              startIcon={<AddIcon />}
              onClick={() => navigate('/dashboard/projects/new')}
              sx={{ mt: 3, borderRadius: 3, py: 1.2 }}
            >
              Nouveau projet
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Composant pour les actions rapides
const QuickActions = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const actions = [
    {
      title: 'Importer du contenu',
      description: 'Ajouter du texte, PDF ou lien YouTube',
      icon: CloudUploadIcon,
      color: theme.palette.primary.main,
      path: '/dashboard/content/upload',
    },
    {
      title: 'Créer un dataset',
      description: 'Générer des paires question-réponse',
      icon: DatasetIcon,
      color: theme.palette.success.main,
      path: '/dashboard/datasets/new',
    },
    {
      title: 'Lancer un fine-tuning',
      description: 'Entraîner un modèle personnalisé',
      icon: PsychologyIcon,
      color: theme.palette.warning.main,
      path: '/dashboard/fine-tuning/new',
    },
    {
      title: 'Voir les analyses',
      description: 'Consulter les statistiques d\'utilisation',
      icon: BarChartIcon,
      color: theme.palette.info.main,
      path: '/dashboard/analytics',
    },
  ];

  return (
    <motion.div variants={itemVariants}>
      <Card sx={{ borderRadius: 4, height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>Actions rapides</Typography>
          
          <Grid container spacing={2}>
            {actions.map((action) => (
              <Grid item xs={12} sm={6} key={action.title}>
                <Box
                  component={motion.div}
                  whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
                  whileTap={{ y: 0 }}
                  sx={{
                    p: 2.5,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      borderColor: action.color,
                    },
                  }}
                  onClick={() => navigate(action.path)}
                >
                  <Avatar
                    sx={{
                      backgroundColor: `${action.color}20`,
                      color: action.color,
                      width: 48,
                      height: 48,
                      mb: 2,
                    }}
                  >
                    <action.icon />
                  </Avatar>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Composant pour les modèles récents
const RecentModels = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await fineTuningService.getAll();
        // Trier par date de création (les plus récents d'abord)
        const sortedModels = data
          .filter(model => model.status === 'completed')
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3); // Prendre les 3 plus récents
        
        setModels(sortedModels.map(model => ({
          ...model,
          status: 'Actif' // Simplification pour l'affichage
        })));
      } catch (error) {
        console.error('Erreur lors de la récupération des modèles:', error);
        setModels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <motion.div variants={itemVariants}>
      <Card sx={{ borderRadius: 4, height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Modèles récents</Typography>
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/dashboard/fine-tuning')}
              sx={{ fontWeight: 600 }}
            >
              Voir tous
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : models.length > 0 ? (
            <Stack spacing={2}>
              {models.map((model) => (
                <Box
                  key={model.id}
                  component={motion.div}
                  whileHover={{ x: 5 }}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    },
                  }}
                  onClick={() => navigate(`/dashboard/fine-tuning/${model.id}`)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {model.name}
                    </Typography>
                    <Chip 
                      label={model.status} 
                      size="small" 
                      sx={{ 
                        backgroundColor: theme.palette.success.main + '20',
                        color: theme.palette.success.main,
                        fontWeight: 600,
                      }} 
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {model.provider} • {model.model}
                    </Typography>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    Créé le {formatDate(model.created_at)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Vous n'avez pas encore de modèles fine-tunés
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/dashboard/fine-tuning/new')}
                startIcon={<PsychologyIcon />}
              >
                Créer un modèle
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const DashboardPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    projectCount: 0,
    contentCount: 0,
    datasetCount: 0,
    creditBalance: user?.creditBalance || 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Récupérer les statistiques
        const [projects, contents, datasets] = await Promise.all([
          projectService.getAll(),
          contentService.getAll(),
          datasetService.getAll()
        ]);

        setStats({
          projectCount: projects.length,
          contentCount: contents.length,
          datasetCount: datasets.length,
          creditBalance: user?.creditBalance || 0
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <Box 
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{ flexGrow: 1, maxWidth: '100%' }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Bonjour, {user?.name || 'utilisateur'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Voici un aperçu de votre activité et de vos projets récents.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Statistiques */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Projets"
            value={loading ? 0 : stats.projectCount}
            icon={AddIcon}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Contenus"
            value={loading ? 0 : stats.contentCount}
            icon={CloudUploadIcon}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Datasets"
            value={loading ? 0 : stats.datasetCount}
            icon={DatasetIcon}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Crédit"
            value={stats.creditBalance}
            icon={BarChartIcon}
            color={theme.palette.warning.main}
            prefix="€"
          />
        </Grid>

        {/* Actions rapides */}
        <Grid item xs={12} md={6} lg={4}>
          <QuickActions />
        </Grid>

        {/* Projets récents */}
        <Grid item xs={12} md={6} lg={4}>
          <RecentProjects />
        </Grid>

        {/* Modèles récents */}
        <Grid item xs={12} lg={4}>
          <RecentModels />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage; 