import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Alert,
  Paper,
  useTheme,
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '../../context/AuthContext';

// Plans disponibles
const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    description: 'Idéal pour les débutants',
    features: [
      '50 000 tokens de génération',
      '3 projets maximum',
      '100 MB de stockage',
      'Support par email',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    description: 'Pour les professionnels',
    features: [
      'Tokens de génération illimités',
      'Projets illimités',
      '1 GB de stockage',
      'Support prioritaire',
      'API personnalisée',
    ],
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    description: 'Pour les équipes',
    features: [
      'Tokens de génération illimités',
      'Projets illimités',
      'Stockage illimité',
      'Support dédié',
      'API personnalisée',
      'Déploiement sur site disponible',
    ],
  },
];

const StripePaymentForm = ({ onSuccess, isTrial = false }) => {
  const theme = useTheme();
  const { updateSubscription, startTrial } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Formater le numéro de carte
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Formater la date d'expiration
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return value;
  };

  // Gérer le changement de plan
  const handlePlanChange = (event) => {
    setSelectedPlan(event.target.value);
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation simple
    if (!cardName.trim()) {
      setError('Le nom sur la carte est requis');
      return;
    }
    
    if (cardNumber.replace(/\s+/g, '').length < 16) {
      setError('Numéro de carte invalide');
      return;
    }
    
    if (expiryDate.length < 5) {
      setError('Date d\'expiration invalide');
      return;
    }
    
    if (cvv.length < 3) {
      setError('CVV invalide');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Simuler un délai pour montrer le chargement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simuler un ID de méthode de paiement
      const paymentMethodId = `pm_${Date.now()}`;
      
      // Mettre à jour l'abonnement ou démarrer un essai
      if (isTrial) {
        await startTrial(paymentMethodId);
      } else {
        await updateSubscription(selectedPlan, paymentMethodId);
      }
      
      setSuccess(true);
      
      // Appeler le callback de succès après un court délai
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (err) {
      console.error('Payment error:', err);
      setError('Une erreur est survenue lors du traitement du paiement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {success ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          {isTrial 
            ? 'Votre essai gratuit a été activé avec succès ! Votre carte sera débitée automatiquement à la fin de la période d\'essai, sauf si vous annulez avant.'
            : 'Paiement traité avec succès ! Votre abonnement est maintenant actif.'}
        </Alert>
      ) : (
        <form onSubmit={handleSubmit}>
          {!isTrial && (
            <>
              <Typography variant="h6" gutterBottom>
                Choisissez votre plan
              </Typography>
              
              <FormControl component="fieldset" sx={{ width: '100%', mb: 4 }}>
                <RadioGroup
                  value={selectedPlan}
                  onChange={handlePlanChange}
                >
                  <Grid container spacing={2}>
                    {plans.map((plan) => (
                      <Grid item xs={12} md={4} key={plan.id}>
                        <Paper
                          elevation={plan.recommended ? 3 : 1}
                          sx={{
                            p: 2,
                            border: plan.recommended ? `2px solid ${theme.palette.primary.main}` : 'none',
                            position: 'relative',
                            height: '100%',
                          }}
                        >
                          {plan.recommended && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: -12,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                px: 2,
                                py: 0.5,
                                borderRadius: 1,
                              }}
                            >
                              Recommandé
                            </Box>
                          )}
                          
                          <FormControlLabel
                            value={plan.id}
                            control={<Radio />}
                            label={
                              <Box>
                                <Typography variant="h6" component="div">
                                  {plan.name}
                                </Typography>
                                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', my: 1 }}>
                                  {plan.price}€<Typography component="span" variant="body2">/mois</Typography>
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  {plan.description}
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                                  {plan.features.map((feature, index) => (
                                    <Typography component="li" variant="body2" key={index} sx={{ mb: 0.5 }}>
                                      {feature}
                                    </Typography>
                                  ))}
                                </Box>
                              </Box>
                            }
                            sx={{
                              alignItems: 'flex-start',
                              m: 0,
                              width: '100%',
                            }}
                          />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </RadioGroup>
              </FormControl>
            </>
          )}
          
          <Typography variant="h6" gutterBottom>
            {isTrial ? 'Informations de paiement pour l\'essai gratuit' : 'Informations de paiement'}
          </Typography>
          
          {isTrial && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Votre carte ne sera pas débitée aujourd'hui. Nous la conservons uniquement pour activer votre abonnement à la fin de la période d'essai de 7 jours, sauf si vous annulez avant.
            </Alert>
          )}
          
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Nom sur la carte"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Numéro de carte"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    fullWidth
                    required
                    inputProps={{ maxLength: 19 }}
                    placeholder="1234 5678 9012 3456"
                    InputProps={{
                      startAdornment: <CreditCardIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    label="Date d'expiration"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    fullWidth
                    required
                    inputProps={{ maxLength: 5 }}
                    placeholder="MM/YY"
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    label="CVV"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    fullWidth
                    required
                    inputProps={{ maxLength: 4 }}
                    type="password"
                    placeholder="123"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <LockIcon sx={{ mr: 1, color: 'success.main' }} />
            <Typography variant="body2" color="text.secondary">
              Paiement sécurisé avec Stripe. Vos informations de paiement sont protégées.
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading
              ? 'Traitement en cours...'
              : isTrial
                ? 'Démarrer l\'essai gratuit'
                : `Payer ${plans.find(p => p.id === selectedPlan)?.price || 0}€ par mois`}
          </Button>
        </form>
      )}
    </Box>
  );
};

export default StripePaymentForm; 