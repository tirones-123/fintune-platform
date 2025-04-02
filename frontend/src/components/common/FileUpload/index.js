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
  Chip,
  Stack,
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
import CloseIcon from '@mui/icons-material/Close';
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
  const [uploadedContents, setUploadedContents] = useState([]);

  // Configuration des types de fichiers acceptés
  const acceptedFileTypes = {
    'text/plain': ['.txt'],
    'application/pdf': ['.pdf'],
    'text/markdown': ['.md'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/msword': ['.doc'],
  };

  // Configuration du dropzone
  const onDrop = useCallback(async (acceptedFiles) => {
    setFiles(acceptedFiles);
    setError(null);
    
    // Télécharger automatiquement les fichiers dès qu'ils sont déposés
    if (acceptedFiles.length > 0) {
      setUploading(true);
      
      try {
        // Télécharger chaque fichier via l'API
        for (const file of acceptedFiles) {
          const response = await contentService.uploadFile(projectId, file, {
            name: file.name, // Utiliser le nom du fichier comme nom du contenu
            file_type: file.type.includes('pdf') ? 'pdf' : 'text',
          });

          // Ajouter le fichier uploadé à la liste des contenus
          setUploadedContents(prev => [response, ...prev]);

          // Appeler le callback onSuccess si fourni
          if (onSuccess) {
            onSuccess(response);
          }
          
          enqueueSnackbar(`Fichier "${file.name}" téléchargé avec succès`, { variant: 'success' });
        }
        
        // Vider la liste des fichiers après le téléchargement
        setFiles([]);
      } catch (err) {
        console.error('Error uploading files:', err);
        setError(err.message || 'Erreur lors du téléchargement des fichiers');
      } finally {
        setUploading(false);
      }
    }
  }, [projectId, onSuccess, enqueueSnackbar]);

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

  // Fonction pour gérer l'ajout de toutes les URLs
  const handleAddUrls = async () => {
    // Cette fonction n'est plus utilisée car on ajoute les URLs une par une
    // Cependant, on la garde pour compatibilité avec le bouton principal
    const validUrls = urls.filter(url => url.trim() !== '');
    
    if (validUrls.length === 0) {
      return;
    }
    
    for (let i = 0; i < validUrls.length; i++) {
      if (urls[i].trim() !== '') {
        await handleUrlSubmit(i);
      }
    }
  };

  // Fonction pour gérer le changement d'URL
  const handleUrlChange = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };
  
  // Fonction pour traiter une URL immédiatement
  const handleUrlSubmit = async (index) => {
    const url = urls[index].trim();
    
    if (!url) {
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
      
      const response = await contentService.addUrl({
        project_id: projectId,
        name: `Contenu depuis ${isYouTube ? 'YouTube' : 'URL'}`,
        url: url,
        type: isYouTube ? 'youtube' : 'website'
      });
      
      // Ajouter l'URL à la liste des contenus
      setUploadedContents(prev => [response, ...prev]);
      
      // Appeler le callback onSuccess si fourni
      if (onSuccess) {
        onSuccess(response);
      }
      
      enqueueSnackbar('URL ajoutée avec succès', { variant: 'success' });
      
      // Réinitialiser uniquement l'URL qui vient d'être soumise
      const newUrls = [...urls];
      newUrls[index] = '';
      setUrls(newUrls);
    } catch (err) {
      console.error('Error adding URL:', err);
      setError(err.message || 'Erreur lors de l\'ajout de l\'URL');
    } finally {
      setUploading(false);
    }
  };
  
  // Traitement de l'URL lorsqu'on appuie sur Enter
  const handleUrlKeyDown = (index, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUrlSubmit(index);
    }
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

  // Fonction pour obtenir l'icône en fonction du type de contenu
  const getContentIcon = (content) => {
    if (content.type === 'pdf') {
      return <PictureAsPdfIcon fontSize="small" />;
    } else if (content.type === 'text' || content.type === 'txt' || content.type === 'md') {
      return <TextSnippetIcon fontSize="small" />;
    } else if (content.type === 'doc' || content.type === 'docx') {
      return <InsertDriveFileIcon fontSize="small" />;
    } else if (content.type === 'youtube' || content.url?.includes('youtube')) {
      return <YouTubeIcon fontSize="small" />;
    } else if (content.url) {
      return <LinkIcon fontSize="small" />;
    } else {
      return <InsertDriveFileIcon fontSize="small" />;
    }
  };

  // Fonction pour formater le nombre de caractères
  const formatCharCount = (content) => {
    if (!content.content_metadata || !content.content_metadata.character_count) {
      return 'En traitement...';
    }
    const count = parseInt(content.content_metadata.character_count);
    if (count > 1000000) {
      return `${(count / 1000000).toFixed(2)} M car`;
    } else if (count > 1000) {
      return `${(count / 1000).toFixed(1)} K car`;
    }
    return `${count} car`;
  };

  // Fonction pour supprimer un contenu
  const handleDeleteContent = async (contentId) => {
    try {
      await contentService.delete(contentId);
      // Mettre à jour la liste des contenus uploadés
      setUploadedContents(prev => prev.filter(content => content.id !== contentId));
      
      // Notifier l'utilisateur
      enqueueSnackbar('Contenu supprimé avec succès', { variant: 'success' });
      
      // Si un callback onSuccess est fourni, l'appeler avec l'action de suppression
      if (onSuccess) {
        // Passer null comme contenu et l'id du contenu supprimé, ainsi qu'une action 'delete'
        onSuccess(null, { id: contentId, action: 'delete' });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du contenu:', error);
      enqueueSnackbar(`Erreur: ${error.message || "Échec de la suppression"}`, { variant: 'error' });
    }
  };

  return (
    <Card>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit}>
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
          
          {/* Affichage compact des fichiers uploadés */}
          {uploadedContents.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Fichiers importés ({uploadedContents.length})
              </Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {uploadedContents.map((content) => (
                  <Paper
                    key={content.id}
                    variant="outlined"
                    sx={{
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderColor: content.status === 'error' ? 'error.main' : 'divider',
                      borderRadius: 1,
                      bgcolor: content.status === 'completed' ? 'success.lighter' : content.status === 'error' ? 'error.lighter' : 'background.default',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                      <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                        {getContentIcon(content)}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '200px',
                        }}
                      >
                        {content.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={formatCharCount(content)}
                        color={content.status === 'completed' ? 'success' : content.status === 'error' ? 'error' : 'default'}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteContent(content.id)}
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          {urls.map((url, index) => (
            <Box key={index} sx={{ display: 'flex', mb: 2 }}>
              <TextField
                fullWidth
                value={url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
                onKeyDown={(e) => handleUrlKeyDown(index, e)}
                placeholder="https://..."
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => handleRemoveUrlField(index)}
                        edge="end"
                        size="small"
                      >
                        <CloseIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleUrlSubmit(index)}
                        edge="end"
                        size="small"
                        disabled={!url.trim()}
                        color="primary"
                      >
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
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
        </Box>
      </CardContent>
    </Card>
  );
};

export default FileUpload; 