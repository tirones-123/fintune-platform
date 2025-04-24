import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  CircularProgress,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import YouTubeIcon from '@mui/icons-material/YouTube';
import DescriptionIcon from '@mui/icons-material/Description';
import WebIcon from '@mui/icons-material/Web';
import { contentService } from '../services/apiService';
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

const ContentsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedContentId, setSelectedContentId] = useState(null);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const data = await contentService.getAll();
        setContents(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des contenus:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, []);

  const handleMenuOpen = (event, contentId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedContentId(contentId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedContentId(null);
  };

  const handleDelete = async () => {
    if (!selectedContentId) return;

    try {
      await contentService.delete(selectedContentId);
      setContents(contents.filter(content => content.id !== selectedContentId));
    } catch (error) {
      console.error('Erreur lors de la suppression du contenu:', error);
    }
    handleMenuClose();
  };

  const getStatusLabel = (status) => {
    return t(`contentManager.status.${status}`, status);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'warning';
      case 'processed':
        return 'success';
      case 'failed':
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'youtube':
        return <YouTubeIcon />;
      case 'pdf':
        return <DescriptionIcon />;
      case 'text':
        return <DescriptionIcon />;
      case 'website':
        return <WebIcon />;
      default:
        return <CloudUploadIcon />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
          {t('contentsPage.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/dashboard/content/upload')}
          sx={{ borderRadius: 2 }}
        >
          {t('contentsPage.newContentButton')}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      ) : contents.length > 0 ? (
        <Grid container spacing={3} component={motion.div} variants={containerVariants}>
          {contents.map((content) => (
            <Grid item xs={12} sm={6} md={4} key={content.id} component={motion.div} variants={itemVariants}>
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          mr: 2,
                        }}
                      >
                        {getIcon(content.type)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {content.name}
                        </Typography>
                        <Chip 
                          label={getStatusLabel(content.status)} 
                          color={getStatusColor(content.status)} 
                          size="small" 
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleMenuOpen(e, content.id)}
                      aria-label={t('common.options')}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  {content.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {content.description}
                    </Typography>
                  )}

                  {(content.status === 'error' || content.status === 'failed') && content.error_message && (
                    <Typography variant="body2" color="error.main" sx={{ mb: 2 }}>
                      {t('common.errorLabel', { error: content.error_message })}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      {t('contentsPage.addedOn', { date: formatDate(content.created_at) })}
                    </Typography>
                    <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                      {content.type}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Button 
                    fullWidth 
                    onClick={() => navigate(`/dashboard/content/${content.id}`)}
                    sx={{ borderRadius: 2 }}
                  >
                    {t('contentsPage.viewDetailsButton')}
                  </Button>
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
          <CloudUploadIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {t('contentsPage.noContent.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            {t('contentsPage.noContent.description')}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/dashboard/content/upload')}
            sx={{ borderRadius: 2 }}
          >
            {t('contentsPage.noContent.addButton')}
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
          if (selectedContentId) {
            navigate(`/dashboard/content/${selectedContentId}`);
          }
        }}>
          {t('contentsPage.menu.viewDetails')}
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          {t('common.delete')}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ContentsPage; 