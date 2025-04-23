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

const FileUpload = ({ projectId, onSuccess, hideUrlInput = false }) => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
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
    maxFiles: 10,
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
      setError('Veuillez sélectionner au moins un fichier');
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

  // Fonction pour gérer l'envoi du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Si des fichiers sont sélectionnés, les télécharger
    if (files.length > 0) {
      await handleUploadFiles();
    } else {
      setError('Veuillez sélectionner au moins un fichier');
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
    if (content.status === 'completed' && content.content_metadata && content.content_metadata.character_count) {
      // Si le contenu est traité et que le comptage existe, afficher le nombre exact
      const count = parseInt(content.content_metadata.character_count);
      if (count > 1000000) {
        return `${(count / 1000000).toFixed(2)} M car`;
      } else if (count > 1000) {
        return `${(count / 1000).toFixed(1)} K car`;
      }
      return `${count} car`;
    } else if (content.status === 'error') {
      return 'Erreur';
    } else {
      return '...';
    }
  };

  // Fonction pour vérifier l'état des contenus et actualiser si nécessaire
  useEffect(() => {
    // Vérifier si des contenus sont en traitement et les mettre à jour périodiquement
    const processingContents = uploadedContents.filter(content => 
      // Tout contenu qui n'est pas explicitement completed ou error doit être vérifié
      content.status !== 'completed' && content.status !== 'error'
    );
    
    if (processingContents.length > 0) {
      const intervalId = setInterval(() => {
        processingContents.forEach(content => {
          contentService.getById(content.id)
            .then(updatedContent => {
              console.log(`Vérification du statut du contenu ${content.id}: ${updatedContent.status}`);
              console.log(`Métadonnées du contenu: `, updatedContent.content_metadata);
              
              // Mettre à jour le contenu dans la liste
              setUploadedContents(prev => 
                prev.map(item => item.id === updatedContent.id ? updatedContent : item)
              );
              
              // Notifier l'utilisateur si le contenu est terminé ou en erreur
              if (updatedContent.status === 'completed' && content.status !== 'completed') {
                const charCount = updatedContent.content_metadata?.character_count 
                  ? parseInt(updatedContent.content_metadata.character_count).toLocaleString() 
                  : "inconnu";
                enqueueSnackbar(`"${updatedContent.name}" traité : ${charCount} caractères`, { variant: 'success' });
                
                // Informer le parent (si onSuccess est fourni) de la mise à jour
                if (onSuccess) {
                  onSuccess(updatedContent);
                }
              } else if (updatedContent.status === 'error' && content.status !== 'error') {
                enqueueSnackbar(`Erreur lors du traitement de "${updatedContent.name}"`, { variant: 'error' });
              }
            })
            .catch(err => console.error(`Erreur lors de la vérification du contenu ${content.id}:`, err));
        });
      }, 2000); // Vérifier toutes les 2 secondes pour une expérience plus réactive
      
      return () => clearInterval(intervalId);
    }
  }, [uploadedContents, enqueueSnackbar, onSuccess]);

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
              Formats acceptés: TXT, PDF, DOCX (max 100MB)
            </Typography>
          </Paper>
          
          {/* Affichage compact des fichiers uploadés */}
          {uploadedContents.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
              {uploadedContents.map((content) => (
                <Chip
                  key={content.id}
                  icon={getContentIcon(content)}
                  label={`${content.name.length > 20 ? content.name.substring(0, 18) + '...' : content.name} (${formatCharCount(content)})`}
                  sx={{ mb: 1, maxWidth: '100%' }}
                  color={content.status === 'completed' ? 'success' : content.status === 'error' ? 'error' : 'default'}
                  onDelete={() => handleDeleteContent(content.id)}
                />
              ))}
            </Stack>
          )}
          
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