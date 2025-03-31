import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FileIcon from '@mui/icons-material/InsertDriveFile';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import WebIcon from '@mui/icons-material/Web';
import YouTubeIcon from '@mui/icons-material/YouTube';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';

// Prix par caractère
const PRICE_PER_CHARACTER = 0.000365;

const UploadStatusCard = ({ content, onDelete, showDetailedStats = false }) => {
  // Fonction pour obtenir l'icône en fonction du type de contenu
  const getContentIcon = () => {
    switch (content.type) {
      case 'pdf':
        return <PictureAsPdfIcon color="primary" />;
      case 'text':
      case 'doc':
      case 'docx':
        return <DescriptionIcon color="primary" />;
      case 'website':
        return <WebIcon color="primary" />;
      case 'youtube':
        return <YouTubeIcon sx={{ color: '#FF0000' }} />;
      default:
        return <FileIcon color="primary" />;
    }
  };

  // Fonction pour obtenir le chip de statut
  const getStatusChip = () => {
    const status = content.status || 'pending';
    
    switch (status) {
      case 'completed':
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="Prêt"
            size="small"
            color="success"
            variant="outlined"
          />
        );
      case 'failed':
        return (
          <Chip
            icon={<ErrorIcon />}
            label="Échec"
            size="small"
            color="error"
            variant="outlined"
          />
        );
      case 'processing':
        return (
          <Chip
            icon={<HourglassTopIcon />}
            label="En cours"
            size="small"
            color="primary"
            variant="outlined"
          />
        );
      default:
        return (
          <Chip
            icon={<HourglassTopIcon />}
            label="En attente"
            size="small"
            color="default"
            variant="outlined"
          />
        );
    }
  };

  // Vérifier si les métadonnées contiennent le nombre de caractères
  const hasCharacterCount = content.metadata && content.metadata.character_count;
  
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <Box mr={2}>{getContentIcon()}</Box>
            <Box>
              <Typography variant="subtitle2" noWrap sx={{ maxWidth: 200 }}>
                {content.name || 'Sans titre'}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" noWrap>
                {content.url ? content.url : (content.filename || '')}
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={1} alignItems="center">
            {getStatusChip()}
            
            {onDelete && (
              <Tooltip title="Supprimer">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete(content.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>
        
        {content.status === 'processing' && (
          <Box mt={1}>
            <LinearProgress />
          </Box>
        )}
        
        {/* Affichage des statistiques détaillées */}
        {showDetailedStats && hasCharacterCount && content.status === 'completed' && (
          <Box mt={1.5} p={1} bgcolor="background.paper" borderRadius={1} border="1px solid" borderColor="divider">
            <Typography variant="body2" color="text.secondary">
              <strong>{parseInt(content.metadata.character_count).toLocaleString()} caractères</strong>
              {' • '}
              <Tooltip title="Coût calculé au tarif de 0,000365$ par caractère">
                <span>
                  Coût: ${(content.metadata.character_count * PRICE_PER_CHARACTER).toFixed(4)}
                </span>
              </Tooltip>
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadStatusCard; 