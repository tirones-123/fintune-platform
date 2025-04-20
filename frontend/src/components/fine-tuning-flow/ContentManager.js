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


const ContentManager = ({ projectId, onContentChange, initialContentIds = [], onProcessingStatusChange }) => {
  const { enqueueSnackbar } = useSnackbar();
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
        enqueueSnackbar("Erreur lors du chargement des contenus du projet", { variant: 'error' });
      } finally {
        setLoadingProjectContent(false);
      }
    };
    loadProjectContents();
  }, [projectId, enqueueSnackbar]);

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

  }, [selectedContentIds, projectContents, newlyAddedFiles, newlyAddedYouTube, newlyAddedWebsites, onContentChange, onProcessingStatusChange]);

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
    enqueueSnackbar("Fichier retiré de la sélection", { variant: 'info' });
  };

  const handleAddYouTubeUrl = async () => {
    if (!youtubeUrl.trim() || youtubeUploading) return;
    setYoutubeUploading(true);
    setYoutubeUploadError(null);

    const youtubeLinkRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = youtubeUrl.match(youtubeLinkRegex);
    const videoId = match && match[1];

    if (!videoId) {
      setYoutubeUploadError("URL YouTube invalide.");
      setYoutubeUploading(false);
      return;
    }

    try {
      const options = {
        method: 'GET',
        url: 'https://youtube-media-downloader.p.rapidapi.com/v2/video/details',
        params: { videoId: videoId },
        headers: {
          'X-RapidAPI-Key': '9144fffaabmsh319ba65e73a3d86p164f35jsn097fa4509ee8', // Utiliser une variable d'env !
          'X-RapidAPI-Host': 'youtube-media-downloader.p.rapidapi.com'
        }
      };
      const rapidApiResponse = await axios.request(options);
      const videoInfo = rapidApiResponse.data;
      const videoTitle = videoInfo.title || `Vidéo YouTube - ${Date.now()}`;
      const durationSeconds = parseInt(videoInfo.lengthSeconds) || 600;
      const durationMinutes = Math.round(durationSeconds / 60);
      const estimatedCharacters = Math.round((durationSeconds / 60) * 400);

      const urlContent = {
        project_id: projectId,
        url: youtubeUrl,
        name: videoTitle,
        type: 'youtube',
        description: `Vidéo en attente. Durée: ${durationMinutes} min.`,
        // Ajouter l'estimation aux métadonnées pour le calcul du coût
        content_metadata: { estimated_characters: estimatedCharacters }
      };

      const response = await contentService.addUrl(urlContent);
      const newYouTubeVideo = {
        ...response,
        estimated_characters: estimatedCharacters,
        status: 'awaiting_transcription' // Statut spécifique
      };

      newlyAddedYouTubeRef.current.push(newYouTubeVideo);
      setNewlyAddedYouTube([...newlyAddedYouTubeRef.current]);
      setSelectedContentIds(prev => new Set(prev).add(newYouTubeVideo.id)); // Sélectionner auto
      setYoutubeUrl('');
      enqueueSnackbar(`Vidéo YouTube ajoutée (${estimatedCharacters} car. estimés)`, { variant: 'success' });

    } catch (error) {
      console.error('Erreur ajout URL YouTube:', error);
      setYoutubeUploadError("Erreur lors de la récupération des détails de la vidéo.");
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
    enqueueSnackbar("Vidéo YouTube retirée", { variant: 'info' });
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
        enqueueSnackbar(`Site web ajouté (${characterCount} caractères)`, { variant: 'success' });
  
      } catch (error) {
        console.error('Erreur scraping URL:', error);
        setScrapeError(error.message || 'Erreur lors du scraping');
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
      enqueueSnackbar("Site web retiré", { variant: 'info' });
    };

  // --- Fonction de rafraîchissement pour les contenus --- 
  const refreshContentStatus = useCallback(async (contentId) => {
    try {
      const updatedContent = await contentService.getById(contentId);
      // Mettre à jour l'état approprié
      setProjectContents(prev => prev.map(c => c.id === contentId ? updatedContent : c));
      setNewlyAddedFiles(prev => prev.map(c => c.id === contentId ? updatedContent : c));
      setNewlyAddedYouTube(prev => prev.map(c => c.id === contentId ? updatedContent : c));
      setNewlyAddedWebsites(prev => prev.map(c => c.id === contentId ? updatedContent : c));
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
      <Typography variant="h6" gutterBottom>Sélectionner ou Ajouter du Contenu</Typography>
      
      {/* Section pour ajouter du contenu - Ordre modifié */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* 1. Upload Fichiers (prend toute la largeur sur petit écran) */}
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>1. Ajouter des Fichiers</Typography>
            <FileUpload projectId={projectId} onSuccess={handleFileUploadSuccess} />
          </Paper>
        </Grid>
        
        {/* 2. Ajouter URL YouTube */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>2. Ajouter une Vidéo YouTube</Typography>
            <TextField
              label="URL YouTube"
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
              {youtubeUploading ? <CircularProgress size={20} /> : "Ajouter Vidéo"}
            </Button>
          </Paper>
        </Grid>
        
        {/* 3. Ajouter URL Web */}
        <Grid item xs={12} md={6}>
           <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>3. Ajouter un Site Web</Typography>
             <TextField
              label="URL Site Web"
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
              {scrapeLoading ? <CircularProgress size={20} /> : "Extraire Contenu"}
            </Button>
             <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                Extrait le contenu textuel principal de la page.
            </Typography>
           </Paper>
        </Grid>
      </Grid>

      {/* Liste des contenus (existants + nouveaux) */}
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Contenus disponibles pour ce Fine-tuning</Typography>
      {isProcessing && ( // Afficher une alerte globale si quelque chose est en traitement
        <Alert severity="info" sx={{ mb: 2 }}>
          Traitement de certains contenus en cours... Le bouton 'Suivant' sera activé lorsque tout sera prêt.
        </Alert>
      )}
      {loadingProjectContent ? (
        <CircularProgress />
      ) : allContent.length === 0 ? (
        <Typography>Aucun contenu disponible ou ajouté.</Typography>
      ) : (
        <List component={Paper} dense>
          {allContent.map((content) => {
            const isProcessingContent = content.status !== 'completed' && content.status !== 'error';
            return (
              <ListItem key={content.id} divider>
                <ListItemIcon sx={{ minWidth: 35 }}>
                  <Tooltip title={`Type: ${content.type}`}> 
                   {getContentIcon(content.type)}
                  </Tooltip>
                </ListItemIcon>
                <ListItemText 
                  primary={content.name} 
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       {isProcessingContent ? (
                        <Chip 
                          label={content.status || 'En attente'}
                          size="small"
                          color="warning"
                          icon={<CircularProgress size={14} color="inherit" />} 
                          sx={{ mr: 1 }}
                        />
                      ) : (
                         <Typography variant="caption" sx={{ color: content.status === 'error' ? 'error.main' : 'text.secondary' }}>
                           {`Statut: ${content.status}`}
                         </Typography>
                      )}
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                         {` | Caractères: ${content.content_metadata?.character_count?.toLocaleString() || content.estimated_characters?.toLocaleString() || (isProcessingContent ? 'Calcul...' : 'N/A')}`}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center' }}>
                   {/* Afficher le bouton de suppression uniquement pour les nouveaux contenus */}
                   {(newlyAddedFiles.some(f => f.id === content.id) || 
                     newlyAddedYouTube.some(v => v.id === content.id) || 
                     newlyAddedWebsites.some(w => w.id === content.id)) && (
                       <IconButton edge="end" onClick={() => {
                           if (newlyAddedFiles.some(f => f.id === content.id)) handleDeleteNewlyAddedFile(content.id);
                           if (newlyAddedYouTube.some(v => v.id === content.id)) handleDeleteNewlyAddedYouTube(content.id);
                           if (newlyAddedWebsites.some(w => w.id === content.id)) handleDeleteNewlyAddedWebsite(content.id);
                       }} size="small" title="Retirer">
                           <DeleteIcon fontSize="small"/>
                       </IconButton>
                   )}
                   <FormControlLabel
                    control={
                        <Checkbox
                            edge="end"
                            onChange={(e) => handleSelectionChange(e, content.id)}
                            checked={selectedContentIds.has(content.id)}
                            disabled={content.status === 'error' || content.status === 'processing'} // Désactiver si en erreur ou en traitement
                        />
                    }
                    labelPlacement="start"
                    label="Inclure"
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