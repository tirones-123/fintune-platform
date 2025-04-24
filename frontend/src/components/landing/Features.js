import React from 'react';
import { Box, Container, Grid, Typography, Card, CardActionArea } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DatasetIcon from '@mui/icons-material/Dataset';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AnalyticsIcon from '@mui/icons-material/Analytics';

const features = [
  {
    title: 'Importation de contenu simplifiée',
    description: "Importez facilement vos documents, articles, FAQ ou tout autre contenu textuel pour créer votre base de connaissances.",
    icon: <AutoAwesomeIcon fontSize="large" />
  },
  {
    title: 'Génération de datasets optimisés',
    description: "Transformez automatiquement votre contenu en paires question-réponse parfaitement formatées pour le fine-tuning.",
    icon: <DatasetIcon fontSize="large" />
  },
  {
    title: 'Fine-tuning en un clic',
    description: "Lancez le fine-tuning de vos modèles préférés directement depuis notre plateforme, sans code ni configuration complexe.",
    icon: <PsychologyIcon fontSize="large" />
  },
  {
    title: 'Analyse de performance',
    description: "Évaluez la qualité de vos modèles fine-tunés et identifiez les opportunités d'amélioration grâce à nos outils d'analyse.",
    icon: <AnalyticsIcon fontSize="large" />
  }
];

const Features = () => {
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
            Fonctionnalités principales
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            Découvrez comment FineTuner simplifie chaque étape du processus de fine-tuning
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