import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import MoneyIcon from '@mui/icons-material/Money';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { characterService } from '../../services/apiService';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

const CharacterCounter = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [pricingInfo, setPricingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(10000);
  const [purchaseInProgress, setPurchaseInProgress] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Charger les statistiques et les informations de prix
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, pricingData] = await Promise.all([
          characterService.getUsageStats(),
          characterService.getPricingInfo()
        ]);
        setStats(statsData);
        setPricingInfo(pricingData);
        setError(null);
      } catch (error) {
        console.error('Error fetching character data:', error);
        const errorMessage = error.message || t('characterCounter.error.loading');
        setError(errorMessage);
        enqueueSnackbar(t('characterCounter.snackbar.loadError'), { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [enqueueSnackbar, t]);

  // Calculer le prix de l'achat
  const calculatePrice = () => {
    if (!pricingInfo) return 0;
    return (purchaseAmount * pricingInfo.price_per_character).toFixed(2);
  };

  // Gérer l'achat de caractères
  const handlePurchase = async () => {
    setPurchaseInProgress(true);
    try {
      await characterService.purchaseCredits(purchaseAmount);
      enqueueSnackbar(t('characterCounter.snackbar.purchaseSuccess'), { variant: 'success' });
      setOpenDialog(false);
      
      // Rafraîchir les stats
      const statsData = await characterService.getUsageStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error purchasing characters:', error);
      enqueueSnackbar(t('characterCounter.snackbar.purchaseError', { error: error.message }), { variant: 'error' });
    } finally {
      setPurchaseInProgress(false);
    }
  };

  // Si en cours de chargement, afficher un indicateur
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('characterCounter.availableTitle')}
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  // Si erreur, afficher un message
  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="error">
            {t('common.errorLabel', { error: error })}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Si les données sont chargées, afficher les statistiques
  if (stats && pricingInfo) {
    return (
      <>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {t('characterCounter.availableTitle')}
              </Typography>
              <Button 
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
                onClick={() => setOpenDialog(true)}
              >
                {t('characterCounter.buyButton')}
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('characterCounter.freeRemainingLabel')}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TextFieldsIcon color="primary" sx={{ mr: 1 }} />
                    {stats.free_characters_remaining.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('characterCounter.totalUsedLabel')}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TextFieldsIcon color="secondary" sx={{ mr: 1 }} />
                    {stats.total_characters_used.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('characterCounter.pricePerCharLabel')}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MoneyIcon color="success" sx={{ mr: 1 }} />
                    ${pricingInfo.price_per_character.toFixed(6)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('characterCounter.freeUsageLabel')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LinearProgress 
                  variant="determinate" 
                  value={100 - (stats.free_characters_remaining / pricingInfo.free_characters * 100)}
                  sx={{ flex: 1, mr: 2, height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {Math.round(100 - (stats.free_characters_remaining / pricingInfo.free_characters * 100))}%
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Dialogue d'achat de caractères */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('characterCounter.dialog.title')}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" paragraph sx={{ mb: 3 }}>
              {t('characterCounter.dialog.description', { count: pricingInfo.free_characters.toLocaleString() })}
            </Typography>
            
            <TextField
              label={t('characterCounter.dialog.amountLabel')}
              type="number"
              fullWidth
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(Math.max(1000, parseInt(e.target.value) || 0))}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TextFieldsIcon />
                  </InputAdornment>
                ),
              }}
              helperText={t('characterCounter.dialog.amountHelper')}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body1">
                {t('characterCounter.dialog.pricePerCharLabel')}:
              </Typography>
              <Typography variant="body1">
                ${pricingInfo.price_per_character.toFixed(6)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {t('characterCounter.dialog.totalLabel')}:
              </Typography>
              <Chip 
                icon={<MoneyIcon />} 
                label={`$${calculatePrice()}`} 
                color="primary"
                sx={{ fontWeight: 'bold', fontSize: '1.1rem', height: 'auto', py: 1 }}
              />
            </Box>
            
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              variant="contained" 
              onClick={handlePurchase}
              disabled={purchaseInProgress || purchaseAmount < 1000}
              startIcon={purchaseInProgress ? null : <ShoppingCartIcon />}
            >
              {purchaseInProgress ? t('characterCounter.dialog.processingButton') : t('characterCounter.dialog.buyButton')}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  return null;
};

export default CharacterCounter; 