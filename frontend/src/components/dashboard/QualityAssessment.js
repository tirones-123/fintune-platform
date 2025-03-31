import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import { characterService } from '../../services/apiService';

const usageTypes = [
  { id: 'generic', name: 'Usage général' },
  { id: 'customer_support', name: 'Support client' },
  { id: 'sales', name: 'Ventes' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'technical', name: 'Documentation technique' },
  { id: 'legal', name: 'Contenu juridique' },
  { id: 'medical', name: 'Contenu médical' },
];

const QualityAssessment = ({ characterCount = 0 }) => {
  const [selectedUsage, setSelectedUsage] = useState('generic');
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fonction pour obtenir l'évaluation de la qualité
  const fetchAssessment = async () => {
    setLoading(true);
    try {
      const result = await characterService.assessQuality(characterCount, selectedUsage);
      setAssessment(result);
      setError(null);
    } catch (error) {
      console.error('Error assessing quality:', error);
      setError(error.message || 'Erreur lors de l\'évaluation de la qualité');
    } finally {
      setLoading(false);
    }
  };

  // Charger l'évaluation lorsque les caractères ou le type d'usage changent
  useEffect(() => {
    fetchAssessment();
  }, [characterCount, selectedUsage]);

  // Fonction pour obtenir une couleur basée sur le score
  const getScoreColor = (score) => {
    if (score >= 0.7) return 'success';
    if (score >= 0.4) return 'warning';
    return 'error';
  };

  // Fonction pour obtenir une icône basée sur le score
  const getScoreIcon = (score) => {
    if (score >= 0.7) return <CheckCircleIcon color="success" />;
    if (score >= 0.4) return <WarningIcon color="warning" />;
    return <ErrorIcon color="error" />;
  };

  // Fonction pour obtenir un libellé basé sur le score
  const getScoreLabel = (score) => {
    if (score >= 0.9) return 'Excellent';
    if (score >= 0.7) return 'Bon';
    if (score >= 0.4) return 'Moyen';
    if (score >= 0.2) return 'Faible';
    return 'Insuffisant';
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Évaluation de la qualité
        </Typography>
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Type d'utilisation</InputLabel>
          <Select
            value={selectedUsage}
            label="Type d'utilisation"
            onChange={(e) => setSelectedUsage(e.target.value)}
          >
            {usageTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : assessment ? (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1">
                Nombre de caractères: <strong>{characterCount.toLocaleString()}</strong>
              </Typography>
              <Chip 
                icon={getScoreIcon(assessment.score)} 
                label={`${getScoreLabel(assessment.score)} (${Math.round(assessment.score * 100)}%)`}
                color={getScoreColor(assessment.score)}
              />
            </Box>
            
            <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%', mb: 3 }}>
              <CircularProgress
                variant="determinate"
                value={assessment.score * 100}
                color={getScoreColor(assessment.score)}
                size={80}
                thickness={5}
                sx={{ mx: 'auto' }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                <Typography variant="h6" component="div" color="text.secondary">
                  {Math.round(assessment.score * 100)}%
                </Typography>
              </Box>
            </Box>
            
            {assessment.suggestions && assessment.suggestions.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TipsAndUpdatesIcon sx={{ mr: 1 }} color="warning" />
                    Suggestions d'amélioration
                  </Typography>
                  <List dense>
                    {assessment.suggestions.map((suggestion, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <InfoIcon color="info" />
                        </ListItemIcon>
                        <ListItemText primary={suggestion} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </>
            )}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Aucune donnée disponible pour l'évaluation.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default QualityAssessment; 