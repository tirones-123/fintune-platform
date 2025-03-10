import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { contentService, projectService } from '../../services/localStorageService';

const FileUpload = ({ projectId }) => {
  const navigate = useNavigate();
  const [uploadType, setUploadType] = useState('file');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [contentName, setContentName] = useState('');
  const [contentDescription, setContentDescription] = useState('');

  // Configuration des types de fichiers acceptés
  const acceptedFileTypes = {
    'text/plain': ['.txt'],
    'application/pdf': ['.pdf'],
    'text/markdown': ['.md'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  };

  // Configuration du dropzone
  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles: 5,
    maxSize: 10485760, // 10MB
  });

  // Fonction pour obtenir l'icône en fonction du type de fichier
  const getFileIcon = (file) => {
    if (file.type === 'application/pdf') {
      return <PictureAsPdfIcon color="primary" />;
    } else if (file.type === 'text/plain' || file.type === 'text/markdown') {
      return <TextSnippetIcon color="primary" />;
    } else {
      return <InsertDriveFileIcon color="primary" />;
    }
  };

  // Fonction pour gérer l'upload
  const handleUpload = async () => {
    if (uploadType === 'file' && files.length === 0) {
      setError('Veuillez sélectionner au moins un fichier.');
      return;
    }

    if (uploadType === 'youtube' && !youtubeUrl) {
      setError('Veuillez entrer une URL YouTube valide.');
      return;
    }

    if (!contentName) {
      setError('Veuillez donner un nom à votre contenu.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Création du contenu dans le localStorage
      const newContent = {
        name: contentName,
        description: contentDescription,
        project_id: projectId,
        type: uploadType === 'file' ? (files[0]?.type.includes('pdf') ? 'pdf' : 'text') : 'youtube',
        size: uploadType === 'file' ? files.reduce((total, file) => total + file.size, 0) : 0,
        status: 'processed',
        url: uploadType === 'youtube' ? youtubeUrl : null,
        files: uploadType === 'file' ? files.map(f => f.name) : null,
      };
      
      console.log('Création du contenu:', newContent);
      
      // Simuler un délai pour montrer le chargement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sauvegarder le contenu
      const savedContent = contentService.save(newContent);
      console.log('Contenu créé:', savedContent);
      
      // Mettre à jour le compteur de contenus dans le projet
      const project = projectService.getById(projectId);
      if (project) {
        const updatedProject = {
          ...project,
          content_count: (project.content_count || 0) + 1
        };
        projectService.save(updatedProject);
      }

      setSuccess(true);
      setLoading(false);
      
      // Redirection après 1 seconde
      setTimeout(() => {
        navigate(`/dashboard/projects/${projectId}`);
      }, 1000);
    } catch (err) {
      console.error('Error uploading content:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'upload.');
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Importer du contenu
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Importez des fichiers texte, PDF, ou des vidéos YouTube pour créer votre dataset de fine-tuning.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Nom du contenu"
            value={contentName}
            onChange={(e) => setContentName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description (optionnelle)"
            value={contentDescription}
            onChange={(e) => setContentDescription(e.target.value)}
            multiline
            rows={2}
          />
        </Box>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Type d{"'"}import</InputLabel>
          <Select
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
            label="Type d'import"
          >
            <MenuItem value="file">Fichier (TXT, PDF, MD, DOCX)</MenuItem>
            <MenuItem value="youtube">Lien YouTube</MenuItem>
          </Select>
        </FormControl>

        {uploadType === 'file' ? (
          <Box sx={{ mb: 3 }}>
            <Paper
              {...getRootProps()}
              sx={{
                p: 3,
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'divider',
                borderRadius: 2,
                bgcolor: 'background.default',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.lighter',
                },
              }}
            >
              <input {...getInputProps()} />
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Glissez-déposez vos fichiers ici
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ou cliquez pour sélectionner des fichiers
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Formats acceptés: TXT, PDF, MD, DOCX (max 10MB)
              </Typography>
            </Paper>

            {files.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Fichiers sélectionnés:
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {files.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      {getFileIcon(file)}
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="body2">{file.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(file.size / 1024).toFixed(2)} KB
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="URL YouTube"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              InputProps={{
                startAdornment: <YouTubeIcon color="error" sx={{ mr: 1 }} />,
              }}
            />
            <FormHelperText>
              Nous extrairons automatiquement la transcription de la vidéo.
            </FormHelperText>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Contenu importé avec succès! Redirection en cours...
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Importation en cours...' : 'Importer le contenu'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FileUpload; 