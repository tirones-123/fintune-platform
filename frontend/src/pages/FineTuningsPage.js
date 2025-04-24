import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  LinearProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DatasetIcon from '@mui/icons-material/Dataset';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChatIcon from '@mui/icons-material/Chat';
import { fineTuningService } from '../services/apiService';
import { useTranslation } from 'react-i18next';

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

const FineTuningsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [fineTunings, setFineTunings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedFineTuningId, setSelectedFineTuningId] = useState(null);

  useEffect(() => {
    const fetchFineTunings = async () => {
      try {
        const data = await fineTuningService.getAll();
        setFineTunings(data);
      } catch (error) {
        console.error(t('fineTuningsPage.error.fetch'), error);
      } finally {
        setLoading(false);
      }
    };

    fetchFineTunings();
  }, [t]);

  const handleMenuOpen = (event, fineTuningId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedFineTuningId(fineTuningId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedFineTuningId(null);
  };

  const handleDelete = async () => {
    if (!selectedFineTuningId) return;

    try {
      await fineTuningService.delete(selectedFineTuningId);
      setFineTunings(fineTunings.filter(fineTuning => fineTuning.id !== selectedFineTuningId));
    } catch (error) {
      console.error(t('fineTuningsPage.error.delete'), error);
    }
    handleMenuClose();
  };

  const handleCancel = async () => {
    if (!selectedFineTuningId) return;

    try {
      await fineTuningService.cancel(selectedFineTuningId, { reason: t('fineTuningsPage.cancelReason') });
      const data = await fineTuningService.getAll();
      setFineTunings(data);
    } catch (error) {
      console.error(t('fineTuningsPage.error.cancel'), error);
    }
    handleMenuClose();
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'queued':
        return t('fineTuningsPage.status.queued');
      case 'preparing':
        return t('fineTuningsPage.status.preparing');
      case 'training':
        return t('fineTuningsPage.status.training');
      case 'completed':
        return t('fineTuningsPage.status.completed');
      case 'cancelled':
        return t('fineTuningsPage.status.cancelled');
      case 'error':
        return t('fineTuningsPage.status.error');
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'queued':
      case 'preparing':
        return 'info';
      case 'training':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'default';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('common.na');
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isInProgress = (status) => {
    return ['queued', 'preparing', 'training'].includes(status);
  };

  return (
    <Box 
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{ flexGrow: 1, maxWidth: '100%' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          {t('fineTuningsPage.title')}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DatasetIcon />}
            onClick={() => navigate('/dashboard/datasets')}
            sx={{ borderRadius: 2, mr: 2 }}
          >
            {t('fineTuningsPage.datasetsButton')}
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      ) : fineTunings.length > 0 ? (
        <Grid container spacing={3} component={motion.div} variants={containerVariants}>
          {fineTunings.map((fineTuning) => (
            <Grid item xs={12} sm={6} md={4} key={fineTuning.id} component={motion.div} variants={itemVariants}>
              <Card 
                sx={{ 
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {fineTuning.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label={getStatusLabel(fineTuning.status)} 
                        color={getStatusColor(fineTuning.status)} 
                        size="small" 
                        sx={{ mr: 1 }}
                      />
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleMenuOpen(e, fineTuning.id)}
                        aria-label={t('common.options')}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {fineTuning.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {fineTuning.description}
                    </Typography>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {t('fineTuningsPage.modelLabel')}: {fineTuning.model}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize', mb: 0.5 }}>
                      {t('fineTuningsPage.providerLabel')}: {fineTuning.provider}
                    </Typography>
                  </Box>

                  {isInProgress(fineTuning.status) && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {t('common.progress')}
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                          {fineTuning.progress || 0}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={fineTuning.progress || 0} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                        }} 
                      />
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {t('common.createdOn')}: {formatDate(fineTuning.created_at)}
                    </Typography>
                    {fineTuning.completed_at && (
                      <Typography variant="caption" color="text.secondary">
                        {t('common.completedOn')}: {formatDate(fineTuning.completed_at)}
                      </Typography>
                    )}
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Button 
                        fullWidth 
                        onClick={() => navigate(`/dashboard/fine-tuning/${fineTuning.id}`)}
                        sx={{ borderRadius: 2 }}
                      >
                        {t('common.details')}
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button 
                        fullWidth 
                        variant="contained"
                        startIcon={<ChatIcon />}
                        onClick={() => navigate(`/dashboard/chat/${fineTuning.id}`)}
                        sx={{ borderRadius: 2 }}
                        disabled={fineTuning.status !== 'completed'}
                      >
                        {t('common.chat')}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            px: 3,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          }}
        >
          <PsychologyIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {t('fineTuningsPage.noFineTunings.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            {t('fineTuningsPage.noFineTunings.description')}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<DatasetIcon />}
            onClick={() => navigate('/dashboard/datasets')}
            sx={{ borderRadius: 2 }}
          >
            {t('fineTuningsPage.noFineTunings.viewDatasetsButton')}
          </Button>
        </Box>
      )}

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          if (selectedFineTuningId) {
            navigate(`/dashboard/fine-tuning/${selectedFineTuningId}`);
          }
        }}>
          {t('common.viewDetails')}
        </MenuItem>
        {fineTunings.find(ft => ft.id === selectedFineTuningId)?.status === 'completed' && (
          <MenuItem onClick={() => {
            handleMenuClose();
            if (selectedFineTuningId) {
              navigate(`/dashboard/chat/${selectedFineTuningId}`);
            }
          }}>
            {t('fineTuningsPage.menu.chatWithModel')}
          </MenuItem>
        )}
        {isInProgress(fineTunings.find(ft => ft.id === selectedFineTuningId)?.status) && (
          <MenuItem onClick={handleCancel} sx={{ color: 'warning.main' }}>
            {t('fineTuningsPage.menu.cancelTraining')}
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          {t('common.delete')}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default FineTuningsPage; 