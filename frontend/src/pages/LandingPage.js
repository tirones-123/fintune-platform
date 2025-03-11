import React from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, Avatar, Stack, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/common/PageTransition';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DatasetIcon from '@mui/icons-material/Dataset';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ChatIcon from '@mui/icons-material/Chat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Section Hero
const Hero = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 12, md: 16 },
        pb: { xs: 10, md: 14 },
      }}
    >
      {/* Gradient background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: (theme) => 
            theme.palette.mode === 'dark'
              ? 'radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.2) 0%, rgba(0, 0, 0, 0) 50%), radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.2) 0%, rgba(0, 0, 0, 0) 50%)'
              : 'radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.1) 0%, rgba(255, 255, 255, 0) 50%), radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.1) 0%, rgba(255, 255, 255, 0) 50%)',
          zIndex: -1,
        }}
      />

      {/* Animated shapes */}
      <Box
        component={motion.div}
        animate={{
          y: [0, -10, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        sx={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: 120,
          height: 120,
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          background: (theme) => 
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%)',
          filter: 'blur(20px)',
          zIndex: -1,
        }}
      />

      <Box
        component={motion.div}
        animate={{
          y: [0, 10, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
          delay: 1,
        }}
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 180,
          height: 180,
          borderRadius: '70% 30% 30% 70% / 60% 40% 60% 40%',
          background: (theme) => 
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0.05) 100%)',
          filter: 'blur(20px)',
          zIndex: -1,
        }}
      />

      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <Typography
                  component="h1"
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', md: '3.75rem' },
                    lineHeight: 1.1,
                    background: (theme) => 
                      theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.accent.main} 100%)`
                        : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.accent.main} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 3,
                  }}
                >
                  Fine-tunez vos modèles d'IA en quelques clics
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="h5"
                  color="text.secondary"
                  paragraph
                  sx={{ 
                    mb: 4,
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    lineHeight: 1.6,
                    maxWidth: '90%'
                  }}
                >
                  Transformez vos documents en modèles d'IA personnalisés. Importez votre contenu, générez des datasets de qualité et déployez votre modèle en quelques minutes.
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 5 }}>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    size="large"
                    sx={{ 
                      py: 1.8,
                      px: 4,
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: 3,
                      boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 24px rgba(59, 130, 246, 0.4)',
                      }
                    }}
                  >
                    Commencer gratuitement
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    size="large"
                    sx={{ 
                      py: 1.8,
                      px: 4,
                      borderWidth: 2,
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: 3,
                    }}
                  >
                    Se connecter
                  </Button>
                </Stack>
              </motion.div>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    width: '80%',
                    height: '80%',
                    borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                    background: (theme) => 
                      theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${theme.palette.primary.darker}40 0%, ${theme.palette.accent.darker}40 100%)`
                        : `linear-gradient(135deg, ${theme.palette.primary.lighter} 0%, ${theme.palette.accent.lighter} 100%)`,
                    filter: 'blur(40px)',
                    zIndex: -1,
                  }
                }}
              >
                <Box
                  component="img"
                  src="/static/images/hero-illustration.svg"
                  alt="FinTune Platform Illustration"
                  sx={{
                    width: '100%',
                    maxWidth: 550,
                    height: 'auto',
                    borderRadius: 4,
                    boxShadow: (theme) => 
                      theme.palette.mode === 'dark'
                        ? '0 20px 40px rgba(0, 0, 0, 0.3)'
                        : '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid',
                    borderColor: 'divider',
                    backdropFilter: 'blur(20px)',
                    background: (theme) => 
                      theme.palette.mode === 'dark'
                        ? 'rgba(30, 41, 59, 0.5)'
                        : 'rgba(255, 255, 255, 0.5)',
                    transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg)',
                    }
                  }}
                />
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// Section Comment ça marche
const HowItWorks = () => {
  const theme = useTheme();
  
  const steps = [
    {
      icon: CloudUploadIcon,
      title: 'Importez votre contenu',
      description: 'Téléchargez vos documents (PDF, texte) ou indiquez des liens YouTube et sites web.',
      color: theme.palette.primary.main,
    },
    {
      icon: DatasetIcon,
      title: 'Générez un dataset',
      description: 'Notre IA crée automatiquement des paires question-réponse à partir de votre contenu.',
      color: theme.palette.success.main,
    },
    {
      icon: PsychologyIcon,
      title: 'Fine-tunez votre modèle',
      description: 'Entraînez un modèle personnalisé avec les données générées.',
      color: theme.palette.warning.main,
    },
    {
      icon: ChatIcon,
      title: 'Utilisez votre IA',
      description: 'Intégrez votre modèle dans vos applications ou utilisez-le directement sur notre plateforme.',
      color: theme.palette.info.main,
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'background.paper',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{ 
              fontWeight: 700,
              mb: 2,
            }}
          >
            Comment ça marche
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ 
              maxWidth: 700,
              mx: 'auto',
            }}
          >
            Un processus simple en 4 étapes pour créer votre modèle d'IA personnalisé
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {steps.map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    boxShadow: (theme) => 
                      theme.palette.mode === 'dark'
                        ? '0 8px 24px rgba(0, 0, 0, 0.2)'
                        : '0 8px 24px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: (theme) => 
                        theme.palette.mode === 'dark'
                          ? '0 16px 32px rgba(0, 0, 0, 0.3)'
                          : '0 16px 32px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, flexGrow: 1 }}>
                    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          backgroundColor: `${step.color}20`,
                          color: step.color,
                          width: 56,
                          height: 56,
                          mr: 2,
                        }}
                      >
                        <step.icon fontSize="large" />
                      </Avatar>
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{ fontWeight: 600 }}
                      >
                        Étape {index + 1}
                      </Typography>
                    </Box>
                    <Typography
                      variant="h5"
                      component="h3"
                      gutterBottom
                      sx={{ fontWeight: 600, mb: 2 }}
                    >
                      {step.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                    >
                      {step.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// Section Avantages
const Benefits = () => {
  const theme = useTheme();
  
  const benefits = [
    {
      title: 'Économisez du temps',
      description: 'Automatisez la création de datasets et le fine-tuning, sans expertise technique requise.',
    },
    {
      title: 'Réduisez les coûts',
      description: 'Optimisez vos dépenses en IA en créant des modèles spécifiques à vos besoins.',
    },
    {
      title: 'Améliorez la précision',
      description: 'Obtenez des réponses plus précises et contextuelles grâce à des modèles entraînés sur vos données.',
    },
    {
      title: 'Gardez le contrôle',
      description: 'Vos données restent privées et vous êtes propriétaire de vos modèles fine-tunés.',
    },
    {
      title: 'Intégration facile',
      description: 'Utilisez vos modèles via API ou directement sur notre plateforme.',
    },
    {
      title: 'Support multilingue',
      description: 'Créez des modèles dans plusieurs langues pour répondre à vos besoins internationaux.',
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{ 
              fontWeight: 700,
              mb: 2,
            }}
          >
            Pourquoi choisir FinTune
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ 
              maxWidth: 700,
              mx: 'auto',
            }}
          >
            Notre plateforme simplifie le fine-tuning des modèles d'IA pour tous les utilisateurs
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: (theme) => 
                        theme.palette.mode === 'dark'
                          ? '0 8px 24px rgba(0, 0, 0, 0.2)'
                          : '0 8px 24px rgba(0, 0, 0, 0.05)',
                      transform: 'translateY(-5px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircleIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{ fontWeight: 600 }}
                    >
                      {benefit.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                  >
                    {benefit.description}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// Section CTA
const CTA = () => {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'background.paper',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: (theme) => 
            theme.palette.mode === 'dark'
              ? 'radial-gradient(circle at 70% 50%, rgba(59, 130, 246, 0.15) 0%, rgba(0, 0, 0, 0) 70%)'
              : 'radial-gradient(circle at 70% 50%, rgba(59, 130, 246, 0.1) 0%, rgba(255, 255, 255, 0) 70%)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              textAlign: 'center',
              p: { xs: 4, md: 6 },
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: (theme) => 
                theme.palette.mode === 'dark'
                  ? 'rgba(30, 41, 59, 0.7)'
                  : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              boxShadow: (theme) => 
                theme.palette.mode === 'dark'
                  ? '0 16px 40px rgba(0, 0, 0, 0.3)'
                  : '0 16px 40px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography
              variant="h3"
              component="h2"
              sx={{ 
                fontWeight: 700,
                mb: 2,
              }}
            >
              Prêt à créer votre modèle d'IA ?
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ 
                mb: 4,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Commencez gratuitement et découvrez la puissance du fine-tuning personnalisé
            </Typography>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                py: 1.8,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 24px rgba(59, 130, 246, 0.4)',
                }
              }}
            >
              Commencer maintenant
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

const LandingPage = () => {
  return (
    <PageTransition>
      <Box sx={{ minHeight: '100vh' }}>
        <Navbar />
        <Hero />
        <HowItWorks />
        <Benefits />
        <CTA />
        <Footer />
      </Box>
    </PageTransition>
  );
};

export default LandingPage; 