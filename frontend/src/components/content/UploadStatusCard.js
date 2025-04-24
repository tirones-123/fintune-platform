import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress
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
import UpdateIcon from '@mui/icons-material/Update';
import { contentService } from '../../services/apiService';
import { useTranslation } from 'react-i18next';

// Prix par caractère
const PRICE_PER_CHARACTER = 0.000365;

// Intervalles de référence par type d'usage (min, optimal, max)
const USAGE_THRESHOLDS = {
  legal: { min: 5000, optimal: 30000, max: 100000 },
  customer_service: { min: 5000, optimal: 50000, max: 200000 },
  knowledge_base: { min: 10000, optimal: 100000, max: 500000 },
  education: { min: 8000, optimal: 80000, max: 300000 },
  other: { min: 5000, optimal: 30000, max: 100000 }
};

// Traductions statiques pour les niveaux de qualité (peut être mis dans JSON plus tard)
const QUALITY_DESCRIPTIONS = {
  insufficient: "Insufficient Data",
  minimal: "Minimal Quality",
  good: "Good Quality",
  optimal: "Optimal Quality",
  excessive: "Excessive Data"
};

// Couleurs pour les niveaux de qualité
const QUALITY_COLORS = {
  insufficient: "#f44336", // Rouge
  minimal: "#ff9800",      // Orange
  good: "#4caf50",         // Vert
  optimal: "#2196f3",      // Bleu
  excessive: "#9e9e9e"     // Gris
};

// Évaluer la qualité du contenu en fonction du nombre de caractères et du type d'usage
const getQualityLevel = (characterCount, usageType = 'other') => {
  const thresholds = USAGE_THRESHOLDS[usageType] || USAGE_THRESHOLDS.other;
  
  if (characterCount < thresholds.min) return 'insufficient';
  if (characterCount < thresholds.min * 2) return 'minimal';
  if (characterCount < thresholds.optimal) return 'good';
  if (characterCount <= thresholds.max) return 'optimal';
  return 'excessive';
};

// Calculer la progression de qualité (0-100) en fonction du type d'usage
const getQualityProgress = (characterCount, usageType = 'other') => {
  const thresholds = USAGE_THRESHOLDS[usageType] || USAGE_THRESHOLDS.other;
  
  if (characterCount <= 0) return 0;
  if (characterCount >= thresholds.max) return 100;
  
  // Progression progressive par segments
  if (characterCount < thresholds.min) {
    // Segment 0% - 30%
    return (characterCount / thresholds.min) * 30;
  } else if (characterCount < thresholds.optimal) {
    // Segment 30% - 70%
    return 30 + ((characterCount - thresholds.min) / (thresholds.optimal - thresholds.min)) * 40;
  } else {
    // Segment 70% - 100%
    return 70 + ((characterCount - thresholds.optimal) / (thresholds.max - thresholds.optimal)) * 30;
  }
};

const UploadStatusCard = ({ content, onDelete, showDetailedStats = false, usageType = 'other', onMetadataUpdate }) => {
  const { t } = useTranslation();
  const [contentData, setContentData] = useState(content);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pollingActive, setPollingActive] = useState(content.status === 'processing');

  // Fonction pour obtenir l'icône en fonction du type de contenu
  const getContentIcon = () => {
    switch (contentData.type) {
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

  // Fonction pour obtenir le chip de statut (traduite)
  const getStatusChip = () => {
    const status = contentData.status || 'pending';
    
    switch (status) {
      case 'completed':
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label={t('content.status.ready')}
            size="small"
            color="success"
            variant="outlined"
          />
        );
      case 'failed':
        return (
          <Chip
            icon={<ErrorIcon />}
            label={t('content.status.failed')}
            size="small"
            color="error"
            variant="outlined"
          />
        );
      case 'processing':
        return (
          <Chip
            icon={<HourglassTopIcon />}
            label={t('content.status.processing')}
            size="small"
            color="primary"
            variant="outlined"
          />
        );
      default:
        return (
          <Chip
            icon={<HourglassTopIcon />}
            label={t('content.status.pending')}
            size="small"
            color="default"
            variant="outlined"
          />
        );
    }
  };

  // Fonction pour rafraîchir les métadonnées du contenu
  const refreshMetadata = useCallback(async () => {
    if (contentData.id) {
      setIsRefreshing(true);
      try {
        const updatedContent = await contentService.getById(contentData.id);
        setContentData(updatedContent);
        
        // Si le statut a changé de 'processing' à 'completed', notifier le parent
        if (content.status === 'processing' && updatedContent.status === 'completed') {
          if (onMetadataUpdate) {
            onMetadataUpdate(updatedContent);
          }
        }
        
        // Arrêter le polling si le traitement est terminé
        if (updatedContent.status === 'completed' || updatedContent.status === 'failed') {
          setPollingActive(false);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des métadonnées:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [contentData.id, onMetadataUpdate, content.status]);

  // Effet pour le polling des métadonnées quand le fichier est en cours de traitement
  useEffect(() => {
    let pollingInterval;
    
    if (pollingActive) {
      // Vérifier les métadonnées toutes les 5 secondes
      pollingInterval = setInterval(() => {
        refreshMetadata();
      }, 5000);
    }
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingActive, refreshMetadata]);

  // Mettre à jour l'état local quand le contenu change via les props
  useEffect(() => {
    setContentData(content);
    setPollingActive(content.status === 'processing');
  }, [content]);

  // Vérifier si les métadonnées contiennent le nombre de caractères
  const hasCharacterCount = contentData.metadata && contentData.metadata.character_count;
  const characterCount = hasCharacterCount ? parseInt(contentData.metadata.character_count) : 0;
  
  // Obtenir le niveau de qualité si on a un nombre de caractères
  const qualityLevel = hasCharacterCount ? getQualityLevel(characterCount, usageType) : null;
  const qualityProgress = hasCharacterCount ? getQualityProgress(characterCount, usageType) : 0;
  
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <Box mr={2}>{getContentIcon()}</Box>
            <Box>
              <Typography variant="subtitle2" noWrap sx={{ maxWidth: 200 }}>
                {contentData.name || t('common.untitled')}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" noWrap>
                {contentData.url ? contentData.url : (contentData.filename || '')}
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={1} alignItems="center">
            {getStatusChip()}
            
            {(contentData.status === 'completed' || contentData.status === 'processing') && (
              <Tooltip title={t('content.refreshTooltip')}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={refreshMetadata}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <CircularProgress size={16} />
                  ) : (
                    <UpdateIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            )}
            
            {onDelete && (
              <Tooltip title={t('common.delete')}>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete(contentData.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>
        
        {contentData.status === 'processing' && (
          <Box mt={1}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'center' }}>
              {t('content.processingMessage')}
            </Typography>
          </Box>
        )}
        
        {showDetailedStats && contentData.status === 'completed' && (
          <Box mt={1.5} p={1.5} bgcolor="background.paper" borderRadius={1} border="1px solid" borderColor="divider">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2">
                {hasCharacterCount ? (
                  <strong>{t('content.charCountDisplay', { count: characterCount.toLocaleString() })}</strong>
                ) : (
                  <em>{t('content.countingPending')}</em>
                )}
              </Typography>
              {hasCharacterCount && (
                <Typography variant="body2" color="text.secondary">
                  <Tooltip title={t('content.costTooltip')}>
                    <span>{t('content.costLabel')}: ${(characterCount * PRICE_PER_CHARACTER).toFixed(2)}</span>
                  </Tooltip>
                </Typography>
              )}
            </Box>
            
            {hasCharacterCount && (
              <Box mt={1}>
                <LinearProgress 
                  variant="determinate" 
                  value={qualityProgress} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: QUALITY_COLORS[qualityLevel]
                    }
                  }} 
                />
                <Box display="flex" justifyContent="space-between" mt={0.5}>
                  <Typography variant="caption" color="text.secondary">{t('content.qualityLabel')}</Typography>
                  <Chip
                    label={t(`content.qualityLevel.${qualityLevel}`, QUALITY_DESCRIPTIONS[qualityLevel])}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      backgroundColor: QUALITY_COLORS[qualityLevel],
                      color: 'white'
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadStatusCard; 