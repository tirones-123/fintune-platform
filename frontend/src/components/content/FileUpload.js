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
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { contentService, projectService } from '../../services/apiService';
import { useTranslation } from 'react-i18next';

const FileUpload = ({ projectId, onSuccess }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
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
    maxSize: 100 * 1024 * 1024, // Augmentation à 100MB
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
      setError(t('content.fileUpload.error.noFileSelected'));
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      const uploadPromises = files.map(async (file) => {
        const response = await contentService.uploadFile(projectId, file, {
          name: file.name,
          file_type: file.type.includes('pdf') ? 'pdf' : 'text',
        });
        if (onSuccess) {
          onSuccess(response);
        }
        return { name: file.name };
      });

      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads = results.filter(r => r.status === 'fulfilled');
      const failedUploads = results.filter(r => r.status === 'rejected');

      if (successfulUploads.length > 0) {
        enqueueSnackbar(t('content.fileUpload.snackbar.uploadSuccessMultiple', { count: successfulUploads.length }), { variant: 'success' });
      }

      if (failedUploads.length > 0) {
         const failedNames = failedUploads.map((f, idx) => files[results.findIndex(r => r === f)].name).join(', ');
         const errorMsg = t('content.fileUpload.error.someFailed', { names: failedNames });
         setError(errorMsg);
         enqueueSnackbar(errorMsg, { variant: 'error' });
      }
      
      setFiles([]);
      
      if (!onSuccess && failedUploads.length === 0) {
        navigate(`/dashboard/projects/${projectId}`);
      }
    } catch (err) {
      console.error('Error uploading files:', err);
      const errorMsg = err.message || t('content.fileUpload.error.genericUpload');
      setError(errorMsg);
      enqueueSnackbar(errorMsg, { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  // Fonction pour gérer l'envoi du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleUploadFiles();
  };

  return (
    <Card>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h5" gutterBottom>
            {t('content.fileUpload.title')}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            {t('content.fileUpload.description')}
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            {t('content.fileUpload.importTitle')}
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
              {isDragActive ? t('content.fileUpload.dropzone.dragActive') : t('content.fileUpload.dropzone.prompt')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('content.fileUpload.dropzone.select')}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              {t('content.fileUpload.dropzone.acceptedFormats')}
            </Typography>
          </Paper>

          {files.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('content.fileUpload.selectedFilesTitle')}:
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
                      }} aria-label={t('common.delete')}>
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
          
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              type="submit"
              disabled={uploading || files.length === 0}
              startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {uploading ? t('content.fileUpload.buttonUploading') : t('content.fileUpload.buttonAdd')}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FileUpload; 