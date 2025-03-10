import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DatasetIcon from '@mui/icons-material/Dataset';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BarChartIcon from '@mui/icons-material/BarChart';
import CountUp from 'react-countup';

// Composant pour les statistiques
const StatCard = ({ title, value, icon: Icon, color, suffix = '', prefix = '' }) => {
  const theme = useTheme();

  return (
    <div>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: 6,
            height: '100%',
            backgroundColor: color,
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, pl: 3 }}>
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
            <Box
              sx={{
                backgroundColor: `${color}20`,
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon sx={{ fontSize: 32, color: color }} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

// Composant pour les projets récents
const RecentProjects = () => {
  const navigate = useNavigate();

  // Projets fictifs pour la démo
  const projects = [
    { id: 1, name: 'Documentation produit', updatedAt: '2023-03-07T10:30:00Z', contentCount: 3, datasetCount: 1 },
    { id: 2, name: 'Blog articles', updatedAt: '2023-03-06T14:20:00Z', contentCount: 5, datasetCount: 2 },
    { id: 3, name: 'Support client', updatedAt: '2023-03-05T09:15:00Z', contentCount: 8, datasetCount: 3 },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader
        title="Projets récents"
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
      />
      <Divider />
      <List sx={{ p: 0 }}>
        {projects.map((project) => (
          <React.Fragment key={project.id}>
            <ListItem
              secondaryAction={
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                >
                  Voir
                </Button>
              }
              sx={{ px: 3, py: 2 }}
            >
              <ListItemText
                primary={project.name}
                secondary={
                  <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" component="span">
                      Mis à jour le {formatDate(project.updatedAt)} • {project.contentCount} contenus • {project.datasetCount} datasets
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Button
          variant="text"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/dashboard/projects/new')}
        >
          Nouveau projet
        </Button>
      </Box>
    </Card>
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
    <Card>
      <CardHeader title="Actions rapides" />
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          {actions.map((action) => (
            <Grid item xs={12} sm={6} key={action.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: action.color,
                    boxShadow: `0 4px 8px rgba(0, 0, 0, 0.1)`,
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={() => navigate(action.path)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      mr: 2,
                      backgroundColor: `${action.color}20`,
                      borderRadius: '50%',
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <action.icon sx={{ color: action.color }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

const DashboardPage = () => {
  const theme = useTheme();
  const { user } = useAuth();

  return (
    <Box sx={{ flexGrow: 1, maxWidth: '100%', px: { xs: 2, md: 0 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Bonjour, {user?.name || 'John'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Voici un aperçu de votre activité et de vos projets récents.
        </Typography>
      </Box>

      <Grid container spacing={4}>
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
        <Grid item xs={12} md={6} sx={{ mt: 2 }}>
          <QuickActions />
        </Grid>

        {/* Projets récents */}
        <Grid item xs={12} md={6} sx={{ mt: 2 }}>
          <RecentProjects />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage; 