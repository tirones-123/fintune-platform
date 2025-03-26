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
        console.error('Erreur lors de la récupération des datasets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, []);

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
      console.error('Erreur lors de la suppression du dataset:', error);
    }
    handleMenuClose();
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'processing':
        return 'En traitement';
      case 'ready':
        return 'Prêt';
      case 'failed':
        return 'Échec';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'warning';
      case 'ready':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
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
          Datasets
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/dashboard/projects')}
            sx={{ borderRadius: 2, mr: 2 }}
          >
            Nouveau dataset
          </Button>
          <Button
            variant="outlined"
            startIcon={<PsychologyIcon />}
            onClick={() => navigate('/dashboard/fine-tuning')}
            sx={{ borderRadius: 2 }}
          >
            Fine-tunings
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
                      Modèle: {dataset.model}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dataset.pairs_count} paires • {formatSize(dataset.size)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Créé le {formatDate(dataset.created_at)}
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
                        Voir les détails
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
                        Fine-tuner
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
            Aucun dataset disponible
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            Vous n'avez pas encore créé de dataset. Les datasets sont des ensembles de paires question-réponse utilisées pour le fine-tuning de modèles.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/dashboard/projects')}
            sx={{ borderRadius: 2 }}
          >
            Créer un dataset
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
          Voir les détails
        </MenuItem>
        {datasets.find(d => d.id === selectedDatasetId)?.status === 'ready' && (
          <MenuItem onClick={() => {
            handleMenuClose();
            if (selectedDatasetId) {
              navigate(`/dashboard/fine-tuning/new/${selectedDatasetId}`);
            }
          }}>
            Créer un fine-tuning
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          Supprimer
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DatasetsPage; 