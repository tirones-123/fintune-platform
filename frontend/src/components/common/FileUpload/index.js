import React, { useState, useCallback, useEffect } from 'react';
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
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LinkIcon from '@mui/icons-material/Link';
import AddIcon from '@mui/icons-material/Add';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { contentService } from '../../../services/apiService';

const FileUpload = ({ projectId, onSuccess }) => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [urls, setUrls] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Configuration des types de fichiers acceptés
  const acceptedFileTypes = {
    'text/plain': ['.txt'],
    'application/pdf': ['.pdf'],
    'text/markdown': ['.md'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/msword': ['.doc'],
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
    } else if (file.type.includes('word')) {
      return <InsertDriveFileIcon color="primary" />;
    } else {
      return <InsertDriveFileIcon color="primary" />;
    }
  };

  // Fonction pour télécharger les fichiers
  const handleUploadFiles = async () => {
    if (files.length === 0) {
      setError('Veuillez sélectionner au moins un fichier ou ajouter une URL');
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      // Télécharger chaque fichier via l'API
      for (const file of files) {
        const response = await contentService.uploadFile(projectId, file, {
          name: file.name, // Utiliser le nom du fichier comme nom du contenu
          file_type: file.type.includes('pdf') ? 'pdf' : 'text',
        });

        // Appeler le callback onSuccess si fourni
        if (onSuccess) {
          onSuccess(response);
        }
      }
      
      enqueueSnackbar('Fichiers téléchargés avec succès', { variant: 'success' });
      setFiles([]);
      
      // Rediriger vers la page du projet seulement si onSuccess n'est pas fourni
      if (!onSuccess) {
        navigate(`/dashboard/projects/${projectId}`);
      }
    } catch (err) {
      console.error('Error uploading files:', err);
      setError(err.message || 'Erreur lors du téléchargement des fichiers');
    } finally {
      setUploading(false);
    }
  };

  // Fonction pour ajouter des URLs
  const handleAddUrls = async () => {
    // Filtrer les URLs vides
    const validUrls = urls.filter(url => url.trim() !== '');
    
    if (validUrls.length === 0) {
      setError('Veuillez entrer au moins une URL valide');
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      // Ajouter chaque URL via l'API
      for (const url of validUrls) {
        const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
        
        const response = await contentService.addUrl({
          project_id: projectId,
          name: `Contenu depuis ${isYouTube ? 'YouTube' : 'URL'}`,
          url: url,
          type: isYouTube ? 'youtube' : 'website'
        });

        // Appeler le callback onSuccess si fourni
        if (onSuccess) {
          onSuccess(response);
        }
      }
      
      enqueueSnackbar('URLs ajoutées avec succès', { variant: 'success' });
      setUrls(['']);
      
      // Rediriger vers la page du projet seulement si onSuccess n'est pas fourni
      if (!onSuccess) {
        navigate(`/dashboard/projects/${projectId}`);
      }
    } catch (err) {
      console.error('Error adding URLs:', err);
      setError(err.message || 'Erreur lors de l\'ajout des URLs');
    } finally {
      setUploading(false);
    }
  };

  // Fonction pour gérer le changement d'URL
  const handleUrlChange = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  // Fonction pour ajouter un nouveau champ d'URL
  const handleAddUrlField = () => {
    setUrls([...urls, '']);
  };

  // Fonction pour supprimer un champ d'URL
  const handleRemoveUrlField = (index) => {
    if (urls.length > 1) {
      const newUrls = [...urls];
      newUrls.splice(index, 1);
      setUrls(newUrls);
    }
  };

  // Fonction pour gérer l'envoi du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Si des fichiers sont sélectionnés, les télécharger
    if (files.length > 0) {
      await handleUploadFiles();
    }
    
    // Si des URLs sont entrées, les ajouter
    const validUrls = urls.filter(url => url.trim() !== '');
    if (validUrls.length > 0) {
      await handleAddUrls();
    }
    
    // Si aucun fichier ni URL n'est fourni, afficher une erreur
    if (files.length === 0 && urls.every(url => url.trim() === '')) {
      setError('Veuillez sélectionner au moins un fichier ou ajouter une URL');
    }
  };

  return (
    <Card>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h5" gutterBottom>
            Ajouter du contenu
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Importez des fichiers ou ajoutez des liens pour créer votre dataset de fine-tuning.
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Importer des fichiers
          </Typography>
          
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
              mb: 3
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
              Formats acceptés: TXT, PDF, DOC, DOCX, MD (max 10MB)
            </Typography>
          </Paper>

          {files.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Fichiers sélectionnés:
              </Typography>
              <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                {files.map((file, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => {
                        const newFiles = [...files];
                        newFiles.splice(index, 1);
                        setFiles(newFiles);
                      }}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>{getFileIcon(file)}</ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={`${(file.size / 1024).toFixed(2)} KB`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Ajouter des liens
          </Typography>
          
          {urls.map((url, index) => (
            <Box key={index} sx={{ display: 'flex', mb: 2 }}>
              <TextField
                fullWidth
                value={url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
                placeholder="https://..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon />
                    </InputAdornment>
                  ),
                }}
              />
              {index === urls.length - 1 ? (
                <IconButton onClick={handleAddUrlField} color="primary">
                  <AddIcon />
                </IconButton>
              ) : (
                <IconButton onClick={() => handleRemoveUrlField(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}
          
          <FormHelperText>
            Ajoutez des liens vers des sites web ou des vidéos YouTube. Les transcriptions seront automatiquement extraites.
          </FormHelperText>
          
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              type="submit"
              disabled={uploading || (files.length === 0 && urls.every(url => url.trim() === ''))}
              startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {uploading ? 'Envoi en cours...' : 'Ajouter le contenu'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FileUpload; 