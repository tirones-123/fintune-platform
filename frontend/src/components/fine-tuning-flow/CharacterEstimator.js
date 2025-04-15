import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Tooltip,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarsIcon from '@mui/icons-material/Stars';
import { contentService } from '../../services/apiService'; // Pour récupérer le contenu

// --- Constantes copiées de OnboardingPage --- 
const PRICE_PER_CHARACTER = 0.000365;
const FREE_CHARACTER_QUOTA = 10000;
const USAGE_THRESHOLDS = {
  legal: { min: 5000, optimal: 30000, max: 100000 },
  customer_service: { min: 5000, optimal: 50000, max: 200000 },
  knowledge_base: { min: 10000, optimal: 100000, max: 500000 },
  education: { min: 8000, optimal: 80000, max: 300000 },
  other: { min: 5000, optimal: 30000, max: 100000 }
};

// Calculer le coût estimé
const getEstimatedCost = (characterCount) => {
    const billableCharacters = Math.max(0, characterCount - FREE_CHARACTER_QUOTA);
    return billableCharacters * PRICE_PER_CHARACTER;
  };

// Calculer la progression sur la barre multi-paliers
const calculateProgressValue = (currentCount, minRecommended) => {
    if (!minRecommended) return 0;
    const freeCredits = 10000;
    const maxRecommended = minRecommended * 4;
    let progressValue = 0;
    
    if (currentCount <= freeCredits) {
      progressValue = (currentCount / freeCredits) * 25;
    } else if (currentCount <= minRecommended) {
      progressValue = 25 + ((currentCount - freeCredits) / (minRecommended - freeCredits)) * 25;
    } else if (currentCount <= maxRecommended) {
      progressValue = 50 + ((currentCount - minRecommended) / (maxRecommended - minRecommended)) * 50;
    } else {
      progressValue = 100;
    }
    return Math.max(0, Math.min(100, progressValue));
  };
// --- Fin Constantes copiées --- 

const CharacterEstimator = ({ selectedContentIds, onCharacterCountChange }) => {
  const [totalCharacters, setTotalCharacters] = useState(0);
  const [isEstimated, setIsEstimated] = useState(true);
  const [loading, setLoading] = useState(false);
  const [minRecommended] = useState(USAGE_THRESHOLDS.other.min); // TODO: Rendre dynamique si besoin
  const [maxRecommended] = useState(USAGE_THRESHOLDS.other.max);
  
  // Recalculer quand les contenus sélectionnés changent
  useEffect(() => {
    const calculateChars = async () => {
      if (selectedContentIds.length === 0) {
        setTotalCharacters(0);
        setIsEstimated(true);
        if (onCharacterCountChange) onCharacterCountChange(0);
        return;
      }

      setLoading(true);
      let count = 0;
      let allCountsExact = true;

      try {
        const contentDetails = await Promise.all(
          selectedContentIds.map(id => contentService.getById(id))
        );

        contentDetails.forEach(content => {
          if (content.content_metadata?.character_count && content.content_metadata?.is_exact_count) {
            count += content.content_metadata.character_count;
          } else if (content.estimated_characters) { // Pour YouTube ajouté dans le flux
            count += content.estimated_characters;
            allCountsExact = false; 
          } else if (content.type === 'website' && content.character_count) { // Pour Website ajouté dans le flux
             count += content.character_count;
          } else {
            // Fallback si pas de compte exact ou d'estimation
            count += content.size ? content.size * 0.5 : 3000; // Estimation basée sur taille ou défaut
            allCountsExact = false;
          }
        });

      } catch (error) {
        console.error("Erreur calcul caractères:", error);
        // En cas d'erreur, on peut garder l'ancien compte ou remettre à zéro?
        // Pour l'instant, on garde l'ancien mais on marque comme estimé
        allCountsExact = false;
      }

      setTotalCharacters(Math.round(count));
      setIsEstimated(!allCountsExact);
      if (onCharacterCountChange) {
         onCharacterCountChange(Math.round(count));
      }
      setLoading(false);
    };

    calculateChars();

  }, [selectedContentIds, onCharacterCountChange]);

  const estimatedCost = getEstimatedCost(totalCharacters);
  const progressValue = calculateProgressValue(totalCharacters, minRecommended);

  return (
    <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Estimation du Dataset
      </Typography>

      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {isEstimated ? 'Caractères Estimés:' : 'Caractères Comptés:'} 
                    <strong> {totalCharacters.toLocaleString()}</strong>
                </Typography>
                </Box>
                <Box>
                <Typography variant="body2" color="text.secondary">
                    Coût Estimé: 
                    <strong> {totalCharacters <= FREE_CHARACTER_QUOTA ? 'Gratuit' : `$${estimatedCost.toFixed(2)}`}</strong>
                </Typography>
                </Box>
            </Box>

            {/* Barre de progression (similaire à Onboarding) */}
            <Box sx={{ mt: 1, width: '100%' }}>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                     <Typography variant="body2" fontWeight="medium">Progression du dataset</Typography>
                     <Typography variant="body2" color="primary.main" fontWeight="medium">{totalCharacters.toLocaleString()} caractères</Typography>
                 </Box>
                 <Box sx={{ position: 'relative', height: 38, mt: 2 }}>
                     <LinearProgress 
                         variant="determinate" 
                         value={progressValue}
                         sx={{ height: 10, borderRadius: 5, '& .MuiLinearProgress-bar': { transition: 'transform .4s linear' } }}
                     />
                     {/* Seuils (simplifié) */}
                     <Tooltip title="Crédits gratuits" placement="top">
                         <Box sx={{ position: 'absolute', left: '25%', top: 12 }}><Chip label="10k" size="small" sx={{transform: 'translateX(-50%)'}} /></Box>
                     </Tooltip>
                     <Tooltip title="Minimum recommandé" placement="top">
                         <Box sx={{ position: 'absolute', left: '50%', top: 12 }}><Chip label={`Min ${minRecommended.toLocaleString()}`} size="small" color="warning" sx={{transform: 'translateX(-50%)'}} /></Box>
                     </Tooltip>
                     <Tooltip title="Optimal" placement="top">
                         <Box sx={{ position: 'absolute', left: '100%', top: 12 }}><Chip label={`Opt ${maxRecommended.toLocaleString()}`} size="small" color="primary" sx={{transform: 'translateX(-100%)'}} /></Box>
                     </Tooltip>
                 </Box>
                 {/* Messages d'aide (simplifié) */}
                 {totalCharacters < minRecommended && (
                    <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                        <InfoOutlinedIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        {(minRecommended - totalCharacters).toLocaleString()} caractères manquants pour le minimum recommandé.
                    </Typography>
                 )}
             </Box>
        </Box>
      )}
    </Paper>
  );
};

export default CharacterEstimator;
