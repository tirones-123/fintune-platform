import React from 'react';
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

  // Projets fictifs pour la démo
  const projects = [
    { 
      id: 1, 
      name: 'Documentation produit', 
      updatedAt: '2023-03-07T10:30:00Z', 
      contentCount: 3, 
      datasetCount: 1,
      progress: 75,
      status: 'En cours',
    },
    { 
      id: 2, 
      name: 'Blog articles', 
      updatedAt: '2023-03-06T14:20:00Z', 
      contentCount: 5, 
      datasetCount: 2,
      progress: 100,
      status: 'Terminé',
    },
    { 
      id: 3, 
      name: 'Support client', 
      updatedAt: '2023-03-05T09:15:00Z', 
      contentCount: 8, 
      datasetCount: 3,
      progress: 30,
      status: 'En cours',
    },
  ];

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
                  Mis à jour le {formatDate(project.updatedAt)}
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
          
          <Button
            variant="outlined"
            fullWidth
            startIcon={<AddIcon />}
            onClick={() => navigate('/dashboard/projects/new')}
            sx={{ mt: 3, borderRadius: 3, py: 1.2 }}
          >
            Nouveau projet
          </Button>
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

  // Modèles fictifs pour la démo
  const models = [
    { 
      id: 1, 
      name: 'Support client v1', 
      provider: 'OpenAI',
      model: 'GPT-3.5 Turbo',
      createdAt: '2023-03-05T09:15:00Z',
      status: 'Actif',
    },
    { 
      id: 2, 
      name: 'FAQ Produit', 
      provider: 'Anthropic',
      model: 'Claude 2',
      createdAt: '2023-03-02T14:20:00Z',
      status: 'Actif',
    },
  ];

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
          
          {models.length > 0 ? (
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
                    Créé le {formatDate(model.createdAt)}
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
          Bonjour, {user?.name || 'John'}
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
            value={5}
            icon={AddIcon}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Contenus"
            value={24}
            icon={CloudUploadIcon}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Datasets"
            value={12}
            icon={DatasetIcon}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Crédit"
            value={user?.creditBalance || 100}
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