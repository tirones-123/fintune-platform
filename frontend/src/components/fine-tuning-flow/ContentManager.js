import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Paper,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Grid,
  Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import DeleteIcon from '@mui/icons-material/Delete';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { contentService, scrapingService } from '../../services/apiService';
import FileUpload from '../common/FileUpload'; // Adapter le chemin si nécessaire

// Fonction pour formater la taille des fichiers
const formatSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Fonction pour obtenir l'icône de contenu
const getContentIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return <PictureAsPdfIcon color="error" />;
      case 'text':
      case 'txt':
      case 'md':
        return <TextSnippetIcon color="primary" />;
      case 'youtube':
        return <YouTubeIcon color="error" />;
      case 'website':
          return <InsertLinkIcon color="info" />;
      default:
        return <TextSnippetIcon />;
    }
  };


const ContentManager = ({ projectId, onContentChange, initialContentIds = [], onProcessingStatusChange, onSelectedContentObjectsChange }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [projectContents, setProjectContents] = useState([]); // Contenus existants du projet
  const [newlyAddedFiles, setNewlyAddedFiles] = useState([]); // Fichiers uploadés dans ce flux
  const [newlyAddedYouTube, setNewlyAddedYouTube] = useState([]); // Vidéos ajoutées dans ce flux
  const [newlyAddedWebsites, setNewlyAddedWebsites] = useState([]); // Sites web ajoutés dans ce flux
  const [selectedContentIds, setSelectedContentIds] = useState(new Set(initialContentIds)); // IDs des contenus sélectionnés pour le job
  const [loadingProjectContent, setLoadingProjectContent] = useState(false);
  
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeUploading, setYoutubeUploading] = useState(false);
  const [youtubeUploadError, setYoutubeUploadError] = useState(null);

  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapeError, setScrapeError] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false); // Nouvel état

  // Refs pour éviter les problèmes de re-rendu avec les estimations
  const newlyAddedYouTubeRef = useRef([]);
  const newlyAddedWebsitesRef = useRef([]);

  // Charger les contenus existants du projet au montage
  useEffect(() => {
    const loadProjectContents = async () => {
      if (!projectId) return;
      setLoadingProjectContent(true);
      try {
        const contents = await contentService.getByProjectId(projectId);
        setProjectContents(contents || []);
        // Sélectionner initialement les contenus existants si `initialContentIds` est vide (ou logique à définir)
        if (initialContentIds.length === 0 && contents.length > 0) {
           // Par défaut, on pourrait sélectionner tous les contenus existants ou aucun
           // Pour l'instant, on ne sélectionne rien par défaut s'il n'y a pas d'ID initiaux
           // const initialIds = contents.map(c => c.id);
           // setSelectedContentIds(new Set(initialIds));
        }
      } catch (error) {
        enqueueSnackbar(t('contentManager.error.loadProjectContent'), { variant: 'error' });
      } finally {
        setLoadingProjectContent(false);
      }
    };
    loadProjectContents();
  }, [projectId, enqueueSnackbar, t]);

  // Mettre à jour le parent chaque fois que la sélection OU le statut de traitement changent
  useEffect(() => {
    // Créer la liste unifiée pour la vérification
    const allCurrentContent = [
      ...projectContents.filter(pc => 
        !newlyAddedFiles.some(naf => naf.id === pc.id) &&
        !newlyAddedYouTube.some(nay => nay.id === pc.id) &&
        !newlyAddedWebsites.some(naw => naw.id === pc.id)
      ),
      ...newlyAddedFiles,
      ...newlyAddedYouTube,
      ...newlyAddedWebsites
    ];

    // Vérifier si un contenu SELECTIONNE est en cours de traitement
    const isAnySelectedContentProcessing = allCurrentContent.some(content => 
      selectedContentIds.has(content.id) && 
      // Pour YouTube, on considère "awaiting_transcription" comme prêt (pas en traitement)
      !(content.type === 'youtube' && content.status === 'awaiting_transcription') &&
      content.status !== 'completed' && 
      content.status !== 'error'
    );
    
    setIsProcessing(isAnySelectedContentProcessing);
    
    // Informer le parent de l'état de traitement
    if (onProcessingStatusChange) {
      onProcessingStatusChange(isAnySelectedContentProcessing);
    }

    // Informer le parent des IDs sélectionnés
    onContentChange(Array.from(selectedContentIds));

    // Informer le parent des objets complets sélectionnés (nouvelle fonctionnalité)
    if (onSelectedContentObjectsChange) {
      const selectedObjects = allCurrentContent.filter(c => selectedContentIds.has(c.id));
      onSelectedContentObjectsChange(selectedObjects);
    }

  }, [selectedContentIds, projectContents, newlyAddedFiles, newlyAddedYouTube, newlyAddedWebsites, onContentChange, onProcessingStatusChange, onSelectedContentObjectsChange]);

  const handleSelectionChange = (event, contentId) => {
    setSelectedContentIds(prev => {
      const newSet = new Set(prev);
      if (event.target.checked) {
        newSet.add(contentId);
      } else {
        newSet.delete(contentId);
      }
      return newSet;
    });
  };

  const handleFileUploadSuccess = (uploadedContent) => {
    setNewlyAddedFiles(prev => [...prev, uploadedContent]);
    setSelectedContentIds(prev => new Set(prev).add(uploadedContent.id)); // Sélectionner automatiquement
  };

  const handleDeleteNewlyAddedFile = (fileId) => {
    // Pas besoin de supprimer via API car il n'est pas encore "finalisé"
    setNewlyAddedFiles(prev => prev.filter(file => file.id !== fileId));
    setSelectedContentIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(fileId);
      return newSet;
    });
    enqueueSnackbar(t('contentManager.snackbar.fileRemoved'), { variant: 'info' });
  };

  const handleAddYouTubeUrl = async () => {
    if (!youtubeUrl.trim() || youtubeUploading) return;
    setYoutubeUploading(true);
    setYoutubeUploadError(null);

    const youtubeLinkRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = youtubeUrl.match(youtubeLinkRegex);
    const videoId = match && match[1];

    if (!videoId) {
      setYoutubeUploadError(t('contentManager.error.invalidYoutubeUrl'));
      setYoutubeUploading(false);
      return;
    }

    try {
      // --- NOUVELLE LOGIQUE AVEC FALLBACK ---
      let videoInfo = null;
      let primaryError = null;

      // --- Essai API Primaire (youtube-media-downloader) ---
      try {
        console.log("ContentManager: Trying Primary API (youtube-media-downloader) for", videoId);
        const optionsPrimary = {
          method: 'GET',
          url: 'https://youtube-media-downloader.p.rapidapi.com/v2/video/details',
          params: { videoId: videoId },
          headers: {
            'X-RapidAPI-Key': '9144fffaabmsh319ba65e73a3d86p164f35jsn097fa4509ee8',
            'X-RapidAPI-Host': 'youtube-media-downloader.p.rapidapi.com'
          }
        };
        const rapidApiResponse = await axios.request(optionsPrimary);
        console.log("ContentManager: Primary API Response:", rapidApiResponse.data);
        if (rapidApiResponse.data && (rapidApiResponse.data.lengthSeconds || rapidApiResponse.data.length_seconds)) {
            videoInfo = rapidApiResponse.data;
            if (!videoInfo.lengthSeconds && videoInfo.length_seconds) {
                videoInfo.lengthSeconds = videoInfo.length_seconds;
            }
        } else {
            throw new Error("Primary API response missing duration.");
        }
      } catch (err) {
        console.warn("ContentManager: Primary API Failed:", err.message);
        primaryError = err;

        // --- Essai API Secondaire (youtube-v2) ---
        console.log("ContentManager: Trying Secondary API (youtube-v2) for", videoId);
        try {
          const optionsSecondary = {
            method: 'GET',
            url: 'https://youtube-v2.p.rapidapi.com/video/details',
            params: { video_id: videoId },
            headers: {
              'x-rapidapi-key': '9144fffaabmsh319ba65e73a3d86p164f35jsn097fa4509ee8',
              'x-rapidapi-host': 'youtube-v2.p.rapidapi.com'
            }
          };
          const secondaryResponse = await axios.request(optionsSecondary);
          console.log("ContentManager: Secondary API Response:", secondaryResponse.data);
          const secondaryData = secondaryResponse.data;
          if (secondaryData && secondaryData.video_length) {
            videoInfo = {
              title: secondaryData.title || `Vidéo YouTube - ${new Date().toLocaleString()}`,
              lengthSeconds: secondaryData.video_length
            };
            console.log("ContentManager: Secondary API Success, mapped data:", videoInfo);
          } else {
            throw new Error("Secondary API response missing video_length.");
          }
        } catch (secondaryError) {
          console.error("ContentManager: Secondary API Failed:", secondaryError.message);
          primaryError = new Error(`Primary API failed (${primaryError.message || 'Unknown error'}) and Secondary API failed (${secondaryError.message || 'Unknown error'}).`);
        }
      }

      // --- Traitement du résultat ou de l'erreur finale ---
      if (videoInfo && videoInfo.lengthSeconds) {
        const videoTitle = videoInfo.title || `Vidéo YouTube - ${Date.now()}`;
        const durationSeconds = parseInt(videoInfo.lengthSeconds);
        const durationMinutes = Math.round(durationSeconds / 60);
        const estimatedCharacters = Math.round((durationSeconds / 60) * 400);
        console.log('ContentManager: Duration:', durationSeconds, 's; Estimated Chars:', estimatedCharacters);

        // --- Créer l'enregistrement Content côté backend ---
        const urlContentPayload = {
          project_id: projectId,
          url: youtubeUrl,
          name: videoTitle,
          type: 'youtube',
          description: `Vidéo en attente de transcription. Durée: ${durationMinutes} min (estimation).`
        };
        const backendResponse = await contentService.addUrl(urlContentPayload);
        console.log("ContentManager: Réponse Backend (Création Contenu):", backendResponse);

        // --- Mettre à jour l'état frontend ---
        const newYouTubeVideo = {
          ...backendResponse,
          url: youtubeUrl,
          estimated_characters: estimatedCharacters,
          source: `Durée: ${durationMinutes} min (estimation)`,
          status: backendResponse.status || 'awaiting_transcription'
        };
        newlyAddedYouTubeRef.current.push(newYouTubeVideo);
        setNewlyAddedYouTube([...newlyAddedYouTubeRef.current]);
        setSelectedContentIds(prev => new Set(prev).add(newYouTubeVideo.id));
        setYoutubeUrl('');
        enqueueSnackbar(t('contentManager.snackbar.youtubeAdded', { count: estimatedCharacters.toLocaleString() }), { variant: 'success' });

      } else {
        throw primaryError || new Error(t('contentManager.error.youtubeDurationFailed'));
      }

    } catch (error) {
      console.error('ContentManager: Erreur finale ajout URL YouTube:', error);
      if (error.response) {
         setYoutubeUploadError(`${t('common.apiError')}: ${error.response.data?.message || error.response.data?.detail || error.message}`);
      } else {
         setYoutubeUploadError(`${t('common.error')}: ${error.message || t('contentManager.error.youtubeAddFailed')}`);
      }
    } finally {
      setYoutubeUploading(false);
    }
  };

  const handleDeleteNewlyAddedYouTube = (videoId) => {
    newlyAddedYouTubeRef.current = newlyAddedYouTubeRef.current.filter(v => v.id !== videoId);
    setNewlyAddedYouTube([...newlyAddedYouTubeRef.current]);
    setSelectedContentIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(videoId);
      return newSet;
    });
    enqueueSnackbar(t('contentManager.snackbar.youtubeRemoved'), { variant: 'info' });
  };
  
  const handleScrapeUrl = async () => {
      if (!scrapeUrl.trim() || scrapeLoading) return;
      setScrapeLoading(true);
      setScrapeError(null);
      try {
        const scrapedData = await scrapingService.scrapeWeb(scrapeUrl);
        const scrapedText = scrapedData.paragraphs ? scrapedData.paragraphs.join(" ") : "";
        const characterCount = scrapedText.length;
  
        const urlContent = {
          project_id: projectId,
          url: scrapeUrl,
          name: scrapedData.title || `Site Web - ${Date.now()}`,
          type: 'website',
          description: scrapedText // Le texte va ici pour être copié par le backend
        };
  
        const response = await contentService.addUrl(urlContent);
        const newWebSite = {
          ...response,
          character_count: characterCount,
          status: 'completed' // Statut immédiat car scrapé
        };
  
        newlyAddedWebsitesRef.current.push(newWebSite);
        setNewlyAddedWebsites([...newlyAddedWebsitesRef.current]);
        setSelectedContentIds(prev => new Set(prev).add(newWebSite.id)); // Sélectionner auto
        setScrapeUrl('');
        enqueueSnackbar(t('contentManager.snackbar.websiteAdded', { count: characterCount }), { variant: 'success' });
  
      } catch (error) {
        console.error('Erreur scraping URL:', error);
        setScrapeError(error.message || t('contentManager.error.scrapeFailed'));
      } finally {
        setScrapeLoading(false);
      }
    };
  
  const handleDeleteNewlyAddedWebsite = (siteId) => {
      newlyAddedWebsitesRef.current = newlyAddedWebsitesRef.current.filter(s => s.id !== siteId);
      setNewlyAddedWebsites([...newlyAddedWebsitesRef.current]);
      setSelectedContentIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(siteId);
        return newSet;
      });
      enqueueSnackbar(t('contentManager.snackbar.websiteRemoved'), { variant: 'info' });
    };

  // --- Fonction de rafraîchissement pour les contenus --- 
  const refreshContentStatus = useCallback(async (contentId) => {
    try {
      const updatedContent = await contentService.getById(contentId);
      // Mettre à jour l'état approprié
      setProjectContents(prev => prev.map(c => c.id === contentId ? updatedContent : c));
      setNewlyAddedFiles(prev => prev.map(c => c.id === contentId ? updatedContent : c));
      setNewlyAddedYouTube(prev => prev.map(c => {
        if (c.id !== contentId) return c;
        const merged = { ...c, ...updatedContent };
        if (!merged.estimated_characters && c.estimated_characters && !(merged.content_metadata?.character_count)) {
          merged.estimated_characters = c.estimated_characters;
        }
        return merged;
      }));
      setNewlyAddedWebsites(prev => prev.map(c => {
        if (c.id !== contentId) return c;
        return {
          ...c,
          ...updatedContent,
          // Conserver le character_count estimé si le backend ne le renvoie pas
          character_count: updatedContent.character_count ?? c.character_count,
        };
      }));
    } catch (error) {
      console.error(`Erreur rafraîchissement contenu ${contentId}:`, error);
    }
  }, []);

  // Effet pour vérifier périodiquement le statut des contenus en traitement
  useEffect(() => {
    const allCurrentContent = [
        ...projectContents, 
        ...newlyAddedFiles, 
        ...newlyAddedYouTube, 
        ...newlyAddedWebsites
    ];
    const processingIds = allCurrentContent
      .filter(c => c.status !== 'completed' && c.status !== 'error')
      .map(c => c.id);

    if (processingIds.length > 0) {
      const intervalId = setInterval(() => {
        processingIds.forEach(id => refreshContentStatus(id));
      }, 5000); // Vérifier toutes les 5 secondes

      return () => clearInterval(intervalId);
    }
  }, [projectContents, newlyAddedFiles, newlyAddedYouTube, newlyAddedWebsites, refreshContentStatus]);

  // Créer une liste unifiée en évitant les doublons
  const contentMap = new Map();
  
  // D'abord ajouter tous les contenus ajoutés dans ce flux car ils sont plus à jour
  [...newlyAddedFiles, ...newlyAddedYouTube, ...newlyAddedWebsites].forEach(content => {
    contentMap.set(content.id, content);
  });
  
  // Ensuite ajouter les contenus existants seulement s'ils n'ont pas déjà été ajoutés 
  projectContents.forEach(content => {
    if (!contentMap.has(content.id)) {
      contentMap.set(content.id, content);
    }
  });
  
  // Convertir le Map en array pour l'affichage
  const allContent = Array.from(contentMap.values());

  return (
    <Box>
      {/* Section pour ajouter du contenu - Ordre modifié */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* 1. Upload Fichiers (prend toute la largeur sur petit écran) */}
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>{t('contentManager.addFilesTitle')}</Typography>
            <FileUpload projectId={projectId} onSuccess={handleFileUploadSuccess} />
          </Paper>
        </Grid>
        
        {/* 2. Ajouter URL YouTube */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>{t('contentManager.addYoutubeTitle')}</Typography>
            <TextField
              label={t('contentManager.youtubeUrlLabel')}
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              fullWidth
              size="small"
              InputProps={{ startAdornment: <YouTubeIcon color="error" sx={{ mr: 1 }} /> }}
              error={!!youtubeUploadError}
              helperText={youtubeUploadError}
              sx={{ mb: 1 }}
            />
            <Button onClick={handleAddYouTubeUrl} disabled={youtubeUploading || !youtubeUrl.trim()} size="small">
              {youtubeUploading ? <CircularProgress size={20} /> : t('contentManager.addVideoButton')}
            </Button>
          </Paper>
        </Grid>
        
        {/* 3. Ajouter URL Web */}
        <Grid item xs={12} md={6}>
           <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>{t('contentManager.addWebsiteTitle')}</Typography>
             <TextField
              label={t('contentManager.websiteUrlLabel')}
              value={scrapeUrl}
              onChange={(e) => setScrapeUrl(e.target.value)}
              fullWidth
              size="small"
              InputProps={{ startAdornment: <InsertLinkIcon sx={{ mr: 1 }} /> }}
              error={!!scrapeError}
              helperText={scrapeError}
              sx={{ mb: 1 }}
            />
            <Button onClick={handleScrapeUrl} disabled={scrapeLoading || !scrapeUrl.trim()} size="small">
              {scrapeLoading ? <CircularProgress size={20} /> : t('contentManager.extractButton')}
            </Button>
             <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                {t('contentManager.extractHelperText')}
            </Typography>
           </Paper>
        </Grid>
      </Grid>

      {/* Liste des contenus (existants + nouveaux) */}
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>{t('contentManager.availableContentTitle')}</Typography>
      {isProcessing && ( // Afficher une alerte globale si quelque chose est en traitement
        <Alert severity="info" sx={{ mb: 2 }}>
          {t('contentManager.processingAlert')}
        </Alert>
      )}
      {loadingProjectContent ? (
        <CircularProgress />
      ) : allContent.length === 0 ? (
        <Typography>{t('contentManager.noContentAvailable')}</Typography>
      ) : (
        <List component={Paper} dense>
          {allContent.map((content) => {
            const isProcessingContent = content.status !== 'completed' && content.status !== 'error';
            return (
              <ListItem key={content.id} divider>
                <ListItemIcon sx={{ minWidth: 35 }}>
                  <Tooltip title={`${t('common.type')}: ${content.type}`}>
                   {getContentIcon(content.type)}
                  </Tooltip>
                </ListItemIcon>
                <ListItemText 
                  primary={content.name} 
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       {isProcessingContent ? (
                        <Chip 
                          label={content.type === 'youtube' && content.status === 'awaiting_transcription' 
                                ? t('contentManager.status.readyTranscriptionDelayed')
                                : t(`content.status.${content.status}`, content.status || t('contentManager.status.pending'))}
                          size="small"
                          color={content.type === 'youtube' && content.status === 'awaiting_transcription' ? "success" : "warning"}
                          icon={content.type === 'youtube' && content.status === 'awaiting_transcription' 
                                ? null 
                                : <CircularProgress size={14} color="inherit" />} 
                          sx={{ mr: 1 }}
                        />
                      ) : (
                         <Typography variant="caption" sx={{ color: content.status === 'error' ? 'error.main' : 'text.secondary' }}>
                           {`${t('common.status')}: ${t(`content.status.${content.status}`)}`}
                         </Typography>
                      )}
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                         {(() => {
                           // Gestion d'un éventuel content_metadata stringifié
                           let meta = content.content_metadata;
                           if (typeof meta === 'string') {
                             try { meta = JSON.parse(meta); } catch(_) { meta = null; }
                           }

                           // Priority 1: Check direct character_count property (for newly added websites during the session)
                           if (typeof content.character_count === 'number') {
                             return ` | ${t('common.characters')}: ${Number(content.character_count).toLocaleString()}`;
                           }

                           // Priority 2: Check metadata character_count (from backend)
                           if (meta?.character_count) {
                             const count = Number(meta.character_count);
                             if (!isNaN(count)) {
                               return ` | ${t('common.characters')}: ${count.toLocaleString()}${meta.is_exact_count === false ? ' (est.)' : ''}`;
                             }
                           }

                           // Priority 3: Check estimated characters (frontend calculated for YouTube initially)
                           if (content.estimated_characters) {
                              const count = Number(content.estimated_characters);
                              if (!isNaN(count)) {
                                return ` | ${t('common.characters')}: ~${count.toLocaleString()}`;
                              }
                           }

                           // Priority 4: Estimate based on YouTube duration if metadata exists
                           if (content.type === 'youtube' && meta?.duration_seconds) {
                             const estChars = Math.round((meta.duration_seconds / 60) * 400);
                             return ` | ${t('common.characters')}: ~${estChars.toLocaleString()}`;
                           }

                           // Priority 5: Fallback for website using description length (Workaround)
                           if (content.type === 'website' && content.description?.length) {
                             return ` | ${t('common.characters')}: ${Number(content.description.length).toLocaleString()}`;
                           }

                           // Fallback: Show calculating or N/A
                           return isProcessingContent ? ` | ${t('common.characters')}: ${t('common.calculating')}...` : ` | ${t('common.characters')}: N/A`;
                         })()}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center' }}>
                   {(newlyAddedFiles.some(f => f.id === content.id) || 
                     newlyAddedYouTube.some(v => v.id === content.id) || 
                     newlyAddedWebsites.some(w => w.id === content.id)) && (
                       <IconButton edge="end" onClick={() => {
                           if (newlyAddedFiles.some(f => f.id === content.id)) handleDeleteNewlyAddedFile(content.id);
                           if (newlyAddedYouTube.some(v => v.id === content.id)) handleDeleteNewlyAddedYouTube(content.id);
                           if (newlyAddedWebsites.some(w => w.id === content.id)) handleDeleteNewlyAddedWebsite(content.id);
                       }} size="small" title={t('common.remove')}>
                           <DeleteIcon fontSize="small"/>
                       </IconButton>
                   )}
                   <FormControlLabel
                    control={
                        <Checkbox
                            edge="end"
                            onChange={(e) => handleSelectionChange(e, content.id)}
                            checked={selectedContentIds.has(content.id)}
                            disabled={content.status === 'error' || 
                                    (content.status === 'processing' && 
                                     // Ne pas désactiver pour YouTube en attente de transcription
                                     !(content.type === 'youtube' && content.status === 'awaiting_transcription'))} 
                        />
                    }
                    labelPlacement="start"
                    label={t('common.include')}
                    sx={{ mr: 0, '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}
                   />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
};

export default ContentManager; 