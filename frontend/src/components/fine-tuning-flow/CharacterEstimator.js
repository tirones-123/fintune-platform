import React, { useState, useEffect, useCallback } from 'react';
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
import { useTranslation } from 'react-i18next'; // Importer

// --- Constantes copiées de OnboardingPage (PRICE_PER_CHARACTER remains static) --- 
const PRICE_PER_CHARACTER = 0.000365;

// Calculate estimated cost given a dynamic free character quota
const getEstimatedCost = (characterCount, freeCredits) => {
    const billableCharacters = Math.max(0, characterCount - freeCredits);
    return billableCharacters * PRICE_PER_CHARACTER;
  };

// Calculate progress value on multi-step bar with dynamic freeCredits
const calculateProgressValue = (currentCount, minRecommended, freeCredits) => {
  if (!minRecommended || minRecommended <= 0) return 0;

  const maxRecommended = minRecommended * 4;

  // Cas où l'utilisateur n'a plus de crédits gratuits
  if (!freeCredits || freeCredits <= 0) {
    if (currentCount <= minRecommended) {
      // 0 → 50 %
      return Math.max(0, Math.min(100, (currentCount / minRecommended) * 50));
    } else if (currentCount <= maxRecommended) {
      // 50 → 100 %
      return 50 + ((currentCount - minRecommended) / (maxRecommended - minRecommended)) * 50;
    }
    return 100;
  }

  // Cas normal avec crédits gratuits disponibles (segment 0 → 25 % réservé aux crédits)
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

const CharacterEstimator = ({ 
  selectedContentIds = [], 
  selectedContents = null, // Nouveau: contenu complet (optionnel)
  onCharacterCountChange, 
  minCharactersRecommended = 5000,
  freeCharactersRemaining // dynamic free quota
}) => {
  const { t } = useTranslation(); // Initialiser
  const [totalCharacters, setTotalCharacters] = useState(0);
  const [isEstimated, setIsEstimated] = useState(true);
  const [loading, setLoading] = useState(false);
  const minRecommended = minCharactersRecommended;
  const maxRecommended = minRecommended * 4;
  
  // Use default free quota if dynamic value is not yet loaded
  const effectiveFreeCredits = (typeof freeCharactersRemaining === 'number' && freeCharactersRemaining >= 0)
    ? freeCharactersRemaining
    : 10000;
  const hasFreeCredits = effectiveFreeCredits > 0;

  // Fonction utilitaire locale pour obtenir le nombre de caractères d'un objet Content
  const getCharCountFromContent = (content) => {
    // 1. Comptage exact
    if (content?.content_metadata?.character_count) {
      const exactFlag = !!content?.content_metadata?.is_exact_count;
      return { count: content.content_metadata.character_count, isExact: exactFlag };
    }

    // 2. Champ estimé (ajouté côté frontend pour YouTube)
    if (content?.estimated_characters) {
      return { count: content.estimated_characters, isExact: false };
    }

    // 3. Estimation basée sur durée (YouTube)
    if (content?.type === 'youtube' && content?.content_metadata?.duration_seconds) {
      const est = Math.round((content.content_metadata.duration_seconds / 60) * 400);
      return { count: est, isExact: false };
    }

    // 4. Website ajouté dans le flux avec character_count direct
    if (content?.type === 'website' && content?.character_count) {
      return { count: content.character_count, isExact: true }; // scrapé, donc exact
    }

    // 5. Estimation stockée dans content_metadata (YouTube déjà ajoutée auparavant)
    if (content?.content_metadata?.estimated_characters) {
      return { count: content.content_metadata.estimated_characters, isExact: false };
    }

    // 6. Fallback
    const fallback = content?.size ? content.size * 0.5 : 3000;
    return { count: fallback, isExact: false };
  };

  // Recalculer quand les contenus sélectionnés changent
  useEffect(() => {
    const calculateChars = async () => {
      // Gestion du cas sans sélection
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
        // S'il y a un tableau d'objets contenus fourni et qu'il couvre tous les IDs, on l'utilise directement
        let contentsToUse = null;
        if (Array.isArray(selectedContents) && selectedContents.length === selectedContentIds.length) {
          contentsToUse = selectedContents;
        }

        let contentDetails = [];

        if (contentsToUse) {
          contentDetails = contentsToUse;
        } else {
          // Fallback : utiliser les appels API existants (comportement d'origine)
          contentDetails = await Promise.all(
            selectedContentIds.map(id => contentService.getById(id))
          );
        }

        contentDetails.forEach(content => {
          const { count: charCount, isExact } = getCharCountFromContent(content);
          count += charCount;
          if (!isExact) {
            allCountsExact = false;
          }
        });

      } catch (error) {
        console.error("Erreur calcul caractères:", error);
        allCountsExact = false; // Marquer comme estimation en cas d'erreur
      }

      const finalIsEstimated = !allCountsExact;
      
      // Assurer que finalCount est un nombre valide (pas NaN)
      const validFinalCount = Number.isNaN(count) ? 0 : count;
      
      // N'appeler onCharacterCountChange que si les valeurs valides ont changé
      if (validFinalCount !== totalCharacters || finalIsEstimated !== isEstimated) {
        setTotalCharacters(validFinalCount);
        setIsEstimated(finalIsEstimated); 
        if (onCharacterCountChange) {
          onCharacterCountChange({ count: validFinalCount, isEstimated: finalIsEstimated });
        }
      }
      setLoading(false);
    };

    calculateChars();

  }, [selectedContentIds, selectedContents, onCharacterCountChange]);

  const estimatedCost = getEstimatedCost(totalCharacters, effectiveFreeCredits);
  const progressValue = calculateProgressValue(totalCharacters, minRecommended, effectiveFreeCredits);

  return (
    <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        {t('characterEstimator.title')}
      </Typography>

      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {isEstimated ? t('characterEstimator.estimatedCharsLabel') : t('characterEstimator.countedCharsLabel')}: 
                    <strong> {totalCharacters.toLocaleString()}</strong>
                </Typography>
                </Box>
                <Box>
                <Typography variant="body2" color="text.secondary">
                    {t('characterEstimator.estimatedCostLabel')}: 
                    <strong> {totalCharacters <= effectiveFreeCredits ? t('common.free') : `$${estimatedCost.toFixed(2)}`}</strong>
                </Typography>
                </Box>
            </Box>

            {/* Barre de progression (similaire à Onboarding) */}
            <Box sx={{ mt: 1, width: '100%' }}>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                     <Typography variant="body2" fontWeight="medium">{t('characterEstimator.progressTitle')}</Typography>
                     <Typography variant="body2" color="primary.main" fontWeight="medium">{t('characterEstimator.progressChars', { count: totalCharacters.toLocaleString() })}</Typography>
                 </Box>
                 <Box sx={{ position: 'relative', height: 38, mt: 2 }}>
                     <LinearProgress 
                         variant="determinate" 
                         value={progressValue}
                         sx={{ height: 10, borderRadius: 5, '& .MuiLinearProgress-bar': { transition: 'transform .4s linear' } }}
                     />
                     {/* Seuils (simplifié) */}
                     {hasFreeCredits && (
                       <Tooltip title={t('characterEstimator.tooltip.freeCredits')} placement="top">
                           <Box sx={{ position: 'absolute', left: '25%', top: 12 }}>
                             <Chip label={`${effectiveFreeCredits.toLocaleString()}`} size="small" sx={{ transform: 'translateX(-50%)' }} />
                           </Box>
                       </Tooltip>
                     )}
                     <Tooltip title={t('characterEstimator.tooltip.minRecommended')} placement="top">
                         <Box sx={{ position: 'absolute', left: '50%', top: 12 }}><Chip label={`${t('common.min')} ${minRecommended.toLocaleString()}`} size="small" color="warning" sx={{transform: 'translateX(-50%)'}} /></Box>
                     </Tooltip>
                     <Tooltip title={t('characterEstimator.tooltip.optimal')} placement="top">
                         <Box sx={{ position: 'absolute', left: '100%', top: 12 }}><Chip label={`${t('common.optimal')} ${maxRecommended.toLocaleString()}`} size="small" color="primary" sx={{transform: 'translateX(-100%)'}} /></Box>
                     </Tooltip>
                 </Box>
                 {/* Messages d'aide (simplifié) */}
                 {totalCharacters < minRecommended && (
                    <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                        <InfoOutlinedIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        {t('characterEstimator.missingCharsWarning', { count: (minRecommended - totalCharacters).toLocaleString() })}
                    </Typography>
                 )}
             </Box>
        </Box>
      )}
    </Paper>
  );
};

export default CharacterEstimator;
