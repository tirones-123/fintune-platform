import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CircularProgress,
  Avatar,
  Stack,
  useTheme,
  Container,
  Paper,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CountUp from 'react-countup';
import { projectService, contentService, datasetService, fineTuningService, characterService } from '../services/apiService';
import PageTransition from '../components/common/PageTransition';

const StatCard = ({ title, value, icon: Icon, color, suffix = '', prefix = '' }) => (
  <Card sx={{ display: 'flex', alignItems: 'center', p: 2, height: '100%', borderRadius: 2 }}>
    <Avatar sx={{ bgcolor: color || 'primary.main', mr: 2, width: 48, height: 48 }}>
      <Icon />
    </Avatar>
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
        {prefix}
        <CountUp end={value} duration={1.5} separator="," />
        {suffix}
      </Typography>
      <Typography color="text.secondary">{title}</Typography>
    </Box>
  </Card>
);

const AnalyticsPage = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    projects: 0,
    datasets: 0,
    completedFineTunings: 0,
    activeJobs: 0,
    charsRemaining: 0,
    charsUsed: 0,
    contentTypes: {},
    charTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [projects, contents, datasets, fineTunings, usage, transactions] = await Promise.all([
          projectService.getAll(),
          contentService.getAll(),
          datasetService.getAll(),
          fineTuningService.getAll(),
          characterService.getUsageStats(),
          characterService.getTransactions()
        ]);

        const completedFineTunings = fineTunings.filter(ft => ft.status === 'completed').length;
        const activeJobs = fineTunings.filter(ft => ['queued', 'preparing', 'training'].includes(ft.status)).length;
        const charsRemaining = usage?.free_characters_remaining || 0;
        const charsUsed = usage?.total_characters_used || 0;
        
        const contentTypes = contents.reduce((acc, content) => {
            const type = content.type || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        setStats({
          projects: projects.length,
          datasets: datasets.length,
          completedFineTunings: completedFineTunings,
          activeJobs: activeJobs,
          charsRemaining: charsRemaining,
          charsUsed: charsUsed,
          contentTypes: contentTypes,
          charTransactions: transactions || []
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        setError('Impossible de charger les données analytiques.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <PageTransition>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          Analyses & Statistiques
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Projets Créés" value={stats.projects} icon={FolderIcon} color={theme.palette.primary.main} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Datasets Générés" value={stats.datasets} icon={DescriptionIcon} color={theme.palette.secondary.main} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Modèles Entraînés" value={stats.completedFineTunings} icon={ModelTrainingIcon} color={theme.palette.success.main} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Caractères Gratuits Restants" value={stats.charsRemaining} icon={AccountBalanceWalletIcon} color={theme.palette.info.main} />
            </Grid>
             <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Caractères Total Utilisés" value={stats.charsUsed} icon={AnalyticsIcon} color={theme.palette.warning.main} />
            </Grid>
             <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Jobs Actifs" value={stats.activeJobs} icon={PlayCircleOutlineIcon} color={theme.palette.action.active} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 300, borderRadius: 2 }}>
                <Typography variant="h6">Historique Utilisation Caractères</Typography>
                <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%'}}>
                   <Typography color="text.secondary">(Graphique bientôt disponible)</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 300, borderRadius: 2 }}>
                <Typography variant="h6">Répartition Types de Contenu</Typography>
                <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%'}}>
                   <Typography color="text.secondary">(Graphique bientôt disponible)</Typography>
                 </Box>
              </Paper>
            </Grid>

          </Grid>
        )}
      </Container>
    </PageTransition>
  );
};

export default AnalyticsPage; 