import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Typography,
  useTheme,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';

const pricingOptions = [
  {
    title: 'Gratuit',
    price: 0,
    description: 'Parfait pour débuter et tester la plateforme',
    features: [
      '1 000 tokens de génération',
      '1 projet',
      '5 MB de stockage',
      'Accès aux modèles de base',
    ],
    buttonText: 'Commencer gratuitement',
    buttonVariant: 'outlined',
  },
  {
    title: 'Pro',
    price: 29,
    description: 'Pour les professionnels et les petites équipes',
    features: [
      '50 000 tokens de génération',
      'Projets illimités',
      '100 MB de stockage',
      'Accès à tous les modèles',
      'Support prioritaire',
    ],
    buttonText: 'Commencer l\'essai gratuit',
    buttonVariant: 'contained',
    highlighted: true,
  },
  {
    title: 'Entreprise',
    price: 99,
    description: 'Pour les grandes équipes et les besoins avancés',
    features: [
      'Tokens de génération illimités',
      'Projets illimités',
      'Stockage illimité',
      'Accès à tous les modèles',
      'Support dédié',
      'API personnalisée',
      'Déploiement sur site disponible',
    ],
    buttonText: 'Contacter les ventes',
    buttonVariant: 'outlined',
  },
];

const Pricing = () => {
  const theme = useTheme();
  const [annual, setAnnual] = useState(true);
  const navigate = useNavigate();

  const handleBillingChange = () => {
    setAnnual(!annual);
  };

  return (
    <Box
      sx={{
        py: 8,
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography
            component="h2"
            variant="h3"
            color="text.primary"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Tarifs transparents
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            Choisissez le plan qui correspond à vos besoins
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mt: 4,
            }}
          >
            <Typography variant="subtitle1" color={annual ? 'text.secondary' : 'text.primary'}>
              Mensuel
            </Typography>
            <Switch
              checked={annual}
              onChange={handleBillingChange}
              color="primary"
              sx={{ mx: 2 }}
            />
            <Typography variant="subtitle1" color={annual ? 'text.primary' : 'text.secondary'}>
              Annuel <Box component="span" sx={{ color: 'success.main', fontWeight: 'bold' }}>(-20%)</Box>
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={4} alignItems="flex-start">
          {pricingOptions.map((tier) => (
            <Grid
              item
              key={tier.title}
              xs={12}
              sm={6}
              md={4}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  ...(tier.highlighted && {
                    transform: 'scale(1.05)',
                    border: `2px solid ${theme.palette.primary.main}`,
                    boxShadow: theme.shadows[10],
                  }),
                  '&:hover': {
                    transform: tier.highlighted ? 'scale(1.08)' : 'scale(1.03)',
                    boxShadow: theme.shadows[10],
                  },
                }}
              >
                <CardHeader
                  title={tier.title}
                  titleTypographyProps={{ align: 'center', variant: 'h4', fontWeight: 600 }}
                  subheaderTypographyProps={{ align: 'center' }}
                  sx={{
                    backgroundColor: tier.highlighted ? 'primary.lighter' : 'background.default',
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'baseline',
                      mb: 2,
                    }}
                  >
                    <Typography component="h3" variant="h2" color="text.primary">
                      {tier.price === 0 ? 'Gratuit' : `${tier.price}€`}
                    </Typography>
                    {tier.price > 0 && (
                      <Typography variant="h6" color="text.secondary">
                        /{annual ? 'an' : 'mois'}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="subtitle1" align="center" sx={{ fontStyle: 'italic', mb: 2 }}>
                    {tier.description}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List dense sx={{ py: 0 }}>
                    {tier.features.map((feature) => (
                      <ListItem key={feature} sx={{ py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button
                    fullWidth
                    variant={tier.buttonVariant}
                    color="primary"
                    sx={{ maxWidth: 200 }}
                    onClick={() => navigate('/register')}
                  >
                    {tier.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Tous les prix sont hors taxes. Vous pouvez également opter pour notre modèle de tarification à l'usage.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            0,05€ par MB de contenu traité • 0,10€ par chunk de dataset généré • 0,01€ par étape de fine-tuning
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Pricing; 