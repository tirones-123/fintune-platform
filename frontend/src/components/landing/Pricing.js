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
import { useTranslation } from 'react-i18next';

const Pricing = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [annual, setAnnual] = useState(true);
  const navigate = useNavigate();

  const pricingOptions = [
    {
      title: t('pricing.free.title'),
      price: 0,
      description: t('pricing.free.description'),
      features: [
        t('pricing.free.features.tokens', { count: '1,000' }),
        t('pricing.free.features.projects', { count: 1 }),
        t('pricing.free.features.storage'),
        t('pricing.free.features.models'),
      ],
      buttonText: t('pricing.free.buttonText'),
      buttonVariant: 'outlined',
    },
    {
      title: t('pricing.pro.title'),
      price: 29,
      description: t('pricing.pro.description'),
      features: [
        t('pricing.pro.features.tokens', { count: '50,000' }),
        t('pricing.pro.features.projects'),
        t('pricing.pro.features.storage'),
        t('pricing.pro.features.models'),
        t('pricing.pro.features.support'),
      ],
      buttonText: t('pricing.pro.buttonText'),
      buttonVariant: 'contained',
      highlighted: true,
    },
    {
      title: t('pricing.enterprise.title'),
      price: 99,
      description: t('pricing.enterprise.description'),
      features: [
        t('pricing.enterprise.features.tokens'),
        t('pricing.enterprise.features.projects'),
        t('pricing.enterprise.features.storage'),
        t('pricing.enterprise.features.models'),
        t('pricing.enterprise.features.support'),
        t('pricing.enterprise.features.api'),
        t('pricing.enterprise.features.deployment'),
      ],
      buttonText: t('pricing.enterprise.buttonText'),
      buttonVariant: 'outlined',
    },
  ];

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
            {t('pricing.mainTitle')}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            {t('pricing.subtitle')}
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
              {t('pricing.billing.monthly')}
            </Typography>
            <Switch
              checked={annual}
              onChange={handleBillingChange}
              color="primary"
              sx={{ mx: 2 }}
            />
            <Typography variant="subtitle1" color={annual ? 'text.primary' : 'text.secondary'}>
              {t('pricing.billing.annual')} <Box component="span" sx={{ color: 'success.main', fontWeight: 'bold' }}>{t('pricing.billing.discount')}</Box>
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
                      {tier.price === 0 ? t('common.free') : `${tier.price}€`}
                    </Typography>
                    {tier.price > 0 && (
                      <Typography variant="h6" color="text.secondary">
                        /{annual ? t('common.yearShort') : t('common.monthShort')}
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
            {t('pricing.footer.taxNote')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('pricing.footer.usageBasedNote')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Pricing; 