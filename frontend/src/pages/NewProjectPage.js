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
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import axios from 'axios';
import { projectService } from '../services/localStorageService';

const NewProjectPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nameError, setNameError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      setNameError('Le nom du projet est requis');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Création du projet:', { name, description });
      
      // Simuler un délai pour montrer le chargement
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Créer le projet dans le localStorage
      const newProject = {
        name,
        description,
        content_count: 0,
        dataset_count: 0
      };
      
      const savedProject = projectService.save(newProject);
      console.log('Projet créé:', savedProject);
      
      // Redirection vers la page du projet créé
      navigate(`/dashboard/projects/${savedProject.id}`);
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la création du projet.');
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
          Dashboard
        </Link>
        <Link component={RouterLink} to="/dashboard/projects" color="inherit">
          Projets
        </Link>
        <Typography color="text.primary">Nouveau projet</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Créer un nouveau projet
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Un projet vous permet d{"'"}organiser vos contenus et datasets pour le fine-tuning.
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Nom du projet"
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
                placeholder="Ex: Assistant commercial, FAQ automatique..."
              />
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Description (optionnelle)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={4}
                placeholder="Décrivez l'objectif de ce projet et le type de contenu que vous allez utiliser..."
              />
              <FormHelperText>
                Une bonne description vous aidera à retrouver facilement ce projet plus tard.
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
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Création en cours...' : 'Créer le projet'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default NewProjectPage; 