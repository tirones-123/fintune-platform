import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    TextField,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    LinearProgress,
    Alert,
    Paper,
    Link as MuiLink,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useDropzone } from 'react-dropzone';
import { useSnackbar } from 'notistack';
import { contentService } from '../../services/apiService';

// Styled component for the Dropzone
const DropzoneContainer = styled(Paper)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'border .24s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

const FileUpload = ({ 
  projectId,
  onSuccess, 
  hideUrlInput = false, // Keep this prop
  label = "Déposez vos fichiers ici ou cliquez pour sélectionner", 
  description = "Attachez autant de fichiers que vous le souhaitez (PDF, TXT, DOCX)",
  maxSize = 50 * 1024 * 1024 // 50MB par défaut
}) => {
  const [files, setFiles] = useState([]); // State for files being processed/uploaded
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // onDrop handler for react-dropzone
  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    setUploadError(null);
    setUploadProgress({}); // Reset progress
    setFiles(acceptedFiles.map(file => ({ file, status: 'uploading', progress: 0, id: null, name: file.name })));

    const uploadPromises = acceptedFiles.map(async (file, index) => {
      try {
        const response = await contentService.uploadFile(projectId, file, {
          name: file.name,
          file_type: file.type.split('/')[1] || 'unknown', // Extract subtype or default
        }, (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, [index]: percentCompleted }));
          setFiles(prevFiles => prevFiles.map((f, i) => i === index ? { ...f, progress: percentCompleted } : f));
        });
        
        setFiles(prevFiles => prevFiles.map((f, i) => i === index ? { ...f, status: 'success', id: response.id } : f));
        if(onSuccess) onSuccess(response); // Notify parent on individual success
        return { success: true, id: response.id, name: file.name };
      } catch (error) {
        console.error("Upload error for", file.name, error);
        setFiles(prevFiles => prevFiles.map((f, i) => i === index ? { ...f, status: 'error', error: error.message } : f));
        setUploadError(error.message || 'Erreur lors de l\'upload');
        enqueueSnackbar(`Erreur upload ${file.name}: ${error.message}`, { variant: 'error' });
        return { success: false, name: file.name };
      }
    });

    await Promise.all(uploadPromises);
    setUploading(false);

  }, [projectId, enqueueSnackbar, onSuccess]);

  // Configuration for react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt', '.md'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  // Function to remove a file before/after upload (client-side only for this component)
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setUploadProgress(prev => {
        const newProgress = {...prev};
        delete newProgress[index];
        return newProgress;
    });
  };

  return (
    <Box>
      {/* --- Dropzone Section --- */}
      <DropzoneContainer {...getRootProps()} elevation={0}>
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        {isDragActive ? (
          <Typography>Déposez les fichiers ici...</Typography>
        ) : (
          <>
            <Typography>{label}</Typography>
            <Typography variant="caption" color="text.secondary">{description}</Typography>
          </>
        )}
      </DropzoneContainer>
      
      {/* --- URL Input Section (Conditionally Rendered/Removed) --- */}
      {/* {!hideUrlInput && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <TextField 
              label="Ou ajouter une URL (YouTube, Web...)" 
              variant="outlined" 
              size="small" 
              fullWidth 
            />
            <Button variant="contained" startIcon={<AddIcon />}>
              Ajouter
            </Button>
          </Box>
      )} */}

      {/* --- Upload Status/List --- */}
      {files.length > 0 && (
        <List dense sx={{ mt: 2 }}>
          {files.map((fileWrapper, index) => (
            <ListItem 
              key={index} 
              divider
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => removeFile(index)} size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemIcon sx={{minWidth: 32}}>
                 {fileWrapper.status === 'success' ? <CheckCircleIcon color="success" fontSize="small" /> : 
                  fileWrapper.status === 'error' ? <ErrorIcon color="error" fontSize="small" /> : 
                  <LinearProgress variant="determinate" value={fileWrapper.progress} sx={{ width: '70%' }} />}
              </ListItemIcon>
              <ListItemText
                primary={fileWrapper.name}
                secondary={
                  fileWrapper.status === 'uploading' ? 
                  null : 
                  fileWrapper.status === 'error' ? 
                  <Typography variant="caption" color="error">{fileWrapper.error || 'Échec'}</Typography> : 
                  <Typography variant="caption" color="success">Upload terminé</Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default FileUpload; 