import React from 'react';
import { Box, Container, Grid, Typography, Card, CardActionArea } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DatasetIcon from '@mui/icons-material/Dataset';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { useTranslation } from 'react-i18next';

const Features = () => {
  const { t } = useTranslation();

  const features = [
    {
      title: t('landing.features.importTitle'),
      description: t('landing.features.importDesc'),
      icon: <AutoAwesomeIcon fontSize="large" />
    },
    {
      title: t('landing.features.datasetTitle'),
      description: t('landing.features.datasetDesc'),
      icon: <DatasetIcon fontSize="large" />
    },
    {
      title: t('landing.features.finetuneTitle'),
      description: t('landing.features.finetuneDesc'),
      icon: <PsychologyIcon fontSize="large" />
    },
    {
      title: t('landing.features.analyticsTitle'),
      description: t('landing.features.analyticsDesc'),
      icon: <AnalyticsIcon fontSize="large" />
    }
  ];

  return (
    <Box
      sx={{
        py: 8,
        bgcolor: 'background.default'
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
            {t('landing.features.mainTitle')}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            {t('landing.features.subtitle')}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardActionArea sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', p: 3 }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography gutterBottom variant="h5" component="h3" sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Features; 