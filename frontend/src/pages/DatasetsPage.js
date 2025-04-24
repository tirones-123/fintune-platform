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
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DatasetIcon from '@mui/icons-material/Dataset';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { datasetService } from '../services/apiService';
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

const DatasetsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const data = await datasetService.getAll();
        setDatasets(data);
      } catch (error) {
        console.error(t('datasetsPage.error.fetch'), error);
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, [t]);

  const handleMenuOpen = (event, datasetId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedDatasetId(datasetId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedDatasetId(null);
  };

  const handleDelete = async () => {
    if (!selectedDatasetId) return;

    try {
      await datasetService.delete(selectedDatasetId);
      setDatasets(datasets.filter(dataset => dataset.id !== selectedDatasetId));
    } catch (error) {
      console.error(t('datasetsPage.error.delete'), error);
    }
    handleMenuClose();
  };

  const getStatusLabel = (status) => {
    return t(`datasetDetail.status.${status}`, status);
  };

  const getStatusColor = (status) => {
    if (status === t('datasetDetail.status.ready')) return 'success';
    if (status === t('datasetDetail.status.generating')) return 'warning';
    if (status === t('datasetDetail.status.failed')) return 'error';
    return 'default';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatSize = (size) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
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
          {t('datasetsPage.title')}
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/dashboard/projects')}
            sx={{ borderRadius: 2, mr: 2 }}
          >
            {t('datasetsPage.newDatasetButton')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<PsychologyIcon />}
            onClick={() => navigate('/dashboard/fine-tuning')}
            sx={{ borderRadius: 2 }}
          >
            {t('datasetsPage.fineTuningsButton')}
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      ) : datasets.length > 0 ? (
        <Grid container spacing={3} component={motion.div} variants={containerVariants}>
          {datasets.map((dataset) => (
            <Grid item xs={12} sm={6} md={4} key={dataset.id} component={motion.div} variants={itemVariants}>
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
                      {dataset.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label={getStatusLabel(dataset.status)} 
                        color={getStatusColor(dataset.status)} 
                        size="small" 
                        sx={{ mr: 1 }}
                      />
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleMenuOpen(e, dataset.id)}
                        aria-label={t('common.options')}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {dataset.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {dataset.description}
                    </Typography>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {t('datasetsPage.modelLabel')}: {dataset.model}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('datasetsPage.pairsAndSize', { pairs: dataset.pairs_count, size: formatSize(dataset.size) })}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      {t('common.createdOn')}: {formatDate(dataset.created_at)}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Button 
                        fullWidth 
                        onClick={() => navigate(`/dashboard/datasets/${dataset.id}`)}
                        sx={{ borderRadius: 2 }}
                      >
                        {t('common.viewDetails')}
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button 
                        fullWidth 
                        variant="contained"
                        onClick={() => navigate(`/dashboard/fine-tuning/new/${dataset.id}`)}
                        sx={{ borderRadius: 2 }}
                        disabled={dataset.status !== 'ready'}
                      >
                        {t('datasetsPage.fineTuneButton')}
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
          <DatasetIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {t('datasetsPage.noDatasets.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            {t('datasetsPage.noDatasets.description')}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/dashboard/projects')}
            sx={{ borderRadius: 2 }}
          >
            {t('datasetsPage.noDatasets.createButton')}
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
          if (selectedDatasetId) {
            navigate(`/dashboard/datasets/${selectedDatasetId}`);
          }
        }}>
          {t('common.viewDetails')}
        </MenuItem>
        {datasets.find(d => d.id === selectedDatasetId)?.status === 'ready' && (
          <MenuItem onClick={() => {
            handleMenuClose();
            if (selectedDatasetId) {
              navigate(`/dashboard/fine-tuning/new/${selectedDatasetId}`);
            }
          }}>
            {t('datasetsPage.menu.createFineTuning')}
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          {t('common.delete')}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DatasetsPage; 