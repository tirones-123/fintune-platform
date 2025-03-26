import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Avatar,
  Stack,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import BarChartIcon from '@mui/icons-material/BarChart';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import PublicIcon from '@mui/icons-material/Public';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import FileCopyIcon from '@mui/icons-material/FileCopy';
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

const AnalyticsPage = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    projectCount: 0,
    contentCount: 0,
    datasetCount: 0,
    fineTuningCount: 0,
    completedFineTuningCount: 0,
    totalTokensUsed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Récupérer les statistiques
        const [projects, contents, datasets, fineTunings] = await Promise.all([
          projectService.getAll(),
          contentService.getAll(),
          datasetService.getAll(),
          fineTuningService.getAll()
        ]);

        // Calculer les statistiques avancées
        const completedFineTunings = fineTunings.filter(ft => ft.status === 'completed');
        
        // Dans un vrai système, vous récupéreriez ces données depuis l'API
        // Pour l'exemple, calculons une valeur fictive raisonnable
        const totalTokensUsed = datasets.reduce((total, dataset) => {
          return total + (dataset.size ? Math.floor(dataset.size / 4) : 0);
        }, 0);

        setStats({
          projectCount: projects.length,
          contentCount: contents.length,
          datasetCount: datasets.length,
          fineTuningCount: fineTunings.length,
          completedFineTuningCount: completedFineTunings.length,
          totalTokensUsed: totalTokensUsed
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
          Analyse
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Vue d'ensemble des statistiques et métriques de votre compte.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {/* Statistiques principales */}
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Projets"
                value={stats.projectCount}
                icon={FileCopyIcon}
                color={theme.palette.primary.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Contenus"
                value={stats.contentCount}
                icon={DataUsageIcon}
                color={theme.palette.info.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Datasets"
                value={stats.datasetCount}
                icon={PublicIcon}
                color={theme.palette.warning.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Fine-tunings"
                value={stats.fineTuningCount}
                icon={BarChartIcon}
                color={theme.palette.success.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Modèles actifs"
                value={stats.completedFineTuningCount}
                icon={TrendingUpIcon}
                color={theme.palette.accent?.main || theme.palette.purple?.main || '#8b5cf6'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Tokens utilisés"
                value={stats.totalTokensUsed}
                icon={PeopleIcon}
                color="#f97316"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 5 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              Informations détaillées
            </Typography>
            
            <Card sx={{ borderRadius: 4, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Activité récente
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Les données d'activité détaillées ne sont pas encore disponibles. Cette fonctionnalité sera implémentée prochainement.
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Utilisation du crédit
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Les données d'utilisation du crédit ne sont pas encore disponibles. Cette fonctionnalité sera implémentée prochainement.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </>
      )}
    </Box>
  );
};

export default AnalyticsPage; 