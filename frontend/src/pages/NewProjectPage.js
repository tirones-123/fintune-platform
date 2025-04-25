import React, { useState } from 'react';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  Link,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { projectService } from '../services/apiService';

const NewProjectPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nameError, setNameError] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      setNameError(t('newProject.validation.nameRequired'));
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Créer le projet via l'API
      const newProject = await projectService.create({
        name,
        description,
      });
      
      enqueueSnackbar(t('newProject.snackbar.createSuccess'), { variant: 'success' });
      navigate(`/dashboard/projects/${newProject.id}`);
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.message || t('newProject.errors.createFailed'));
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link component={RouterLink} to="/dashboard" color="inherit">
          {t('newProject.breadcrumbs.dashboard')}
        </Link>
        <Link component={RouterLink} to="/dashboard/projects" color="inherit">
          {t('newProject.breadcrumbs.projects')}
        </Link>
        <Typography color="text.primary">{t('newProject.breadcrumbs.newProject')}</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('newProject.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('newProject.subtitle')}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label={t('newProject.nameLabel')}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.trim()) {
                    setNameError('');
                  }
                }}
                error={!!nameError}
                helperText={nameError}
                required
                placeholder={t('newProject.namePlaceholder')}
              />
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label={t('newProject.descriptionLabel')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={4}
                placeholder={t('newProject.descriptionPlaceholder')}
              />
              <FormHelperText>
                {t('newProject.descriptionHelper')}
              </FormHelperText>
            </FormControl>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard/projects')}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? t('newProject.creatingButton') : t('newProject.createButton')}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default NewProjectPage; 