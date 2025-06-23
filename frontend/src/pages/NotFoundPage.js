import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  useTheme,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/common/PageTransition';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import SEOHead from '../components/common/SEOHead';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFoundPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const suggestions = [
    {
      title: 'Retour à l\'accueil',
      description: 'Découvrir FineTuner et ses fonctionnalités',
      icon: <HomeIcon />,
      path: '/',
      color: '#667eea'
    },
    {
      title: 'Centre d\'aide',
      description: 'Trouver des réponses à vos questions',
      icon: <ContactSupportIcon />,
      path: '/help',
      color: '#f093fb'
    },
    {
      title: 'Connexion',
      description: 'Accéder à votre tableau de bord',
      icon: <SearchIcon />,
      path: '/login',
      color: '#4facfe'
    }
  ];

  return (
    <PageTransition>
      <SEOHead 
        title="Page non trouvée - 404 | FineTuner"
        description="La page que vous recherchez n'existe pas. Retournez à l'accueil ou explorez nos fonctionnalités de fine-tuning d'IA."
        keywords="404, page non trouvée, erreur, finetuner"
        canonicalUrl="https://finetuner.io/404"
      />
      
      <Navbar />
      
      <Box sx={{ 
        minHeight: '100vh',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        pt: 10,
        pb: 6
      }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box textAlign="center" mb={6}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ErrorOutlineIcon 
                  sx={{ 
                    fontSize: 120, 
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 3
                  }} 
                />
              </motion.div>
              
              <Typography 
                variant="h1" 
                sx={{ 
                  fontSize: { xs: '4rem', md: '6rem' },
                  fontWeight: 800,
                  color: 'white',
                  mb: 2,
                  textShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}
              >
                404
              </Typography>
              
              <Typography 
                variant="h4" 
                sx={{ 
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.9)',
                  mb: 3
                }}
              >
                Oups ! Page non trouvée
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  fontSize: '1.1rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  maxWidth: '600px',
                  mx: 'auto',
                  mb: 4
                }}
              >
                La page que vous recherchez semble avoir été déplacée, supprimée ou n'existe pas. 
                Pas de souci, explorons ensemble d'autres options !
              </Typography>

              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                justifyContent="center"
                mb={6}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate(-1)}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: 'primary.main',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    '&:hover': {
                      backgroundColor: 'white',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Retour
                </Button>
                
                <Button
                  component={RouterLink}
                  to="/"
                  variant="outlined"
                  size="large"
                  startIcon={<HomeIcon />}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    color: 'white',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Accueil
                </Button>
              </Stack>
            </Box>

            <Grid container spacing={3} justifyContent="center">
              {suggestions.map((suggestion, index) => (
                <Grid item xs={12} sm={6} md={4} key={suggestion.title}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  >
                    <Card
                      component={RouterLink}
                      to={suggestion.path}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 3,
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${suggestion.color} 0%, ${suggestion.color}88 100%)`,
                            mb: 2
                          }}
                        >
                          {React.cloneElement(suggestion.icon, { 
                            sx: { fontSize: 28, color: 'white' } 
                          })}
                        </Box>
                        
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            color: 'text.primary',
                            mb: 1
                          }}
                        >
                          {suggestion.title}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.secondary',
                            lineHeight: 1.5
                          }}
                        >
                          {suggestion.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>
      
      <Footer />
    </PageTransition>
  );
};

export default NotFoundPage; 