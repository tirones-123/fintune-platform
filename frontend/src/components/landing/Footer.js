import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  useTheme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

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

  // Liens du footer
  const footerLinks = [
    {
      title: 'Produit',
      links: [
        { name: 'Fonctionnalités', path: '/#how-it-works' },
        { name: 'Tarifs', path: '/#pricing' },
        { name: 'Témoignages', path: '/#testimonials' },
        { name: 'FAQ', path: '/faq' },
      ],
    },
    {
      title: 'Ressources',
      links: [
        { name: 'Documentation', path: '/docs' },
        { name: 'Tutoriels', path: '/tutorials' },
        { name: 'Blog', path: '/blog' },
        { name: 'API', path: '/api' },
      ],
    },
    {
      title: 'Entreprise',
      links: [
        { name: 'À propos', path: '/about' },
        { name: 'Carrières', path: '/careers' },
        { name: 'Contact', path: '/contact' },
        { name: 'Partenaires', path: '/partners' },
      ],
    },
    {
      title: 'Légal',
      links: [
        { name: 'Conditions d\'utilisation', path: '/terms' },
        { name: 'Politique de confidentialité', path: '/privacy' },
        { name: 'Cookies', path: '/cookies' },
        { name: 'Mentions légales', path: '/legal' },
      ],
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        py: 8,
        backgroundColor: 'background.paper',
        position: 'relative',
        overflow: 'hidden',
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
              ? 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, rgba(0, 0, 0, 0) 50%)'
              : 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.05) 0%, rgba(255, 255, 255, 0) 50%)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <Grid container spacing={4}>
            {/* Logo et description */}
            <Grid item xs={12} md={4}>
              <motion.div variants={itemVariants}>
                <Typography
                  variant="h5"
                  component={RouterLink}
                  to="/"
                  sx={{
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'inline-block',
                    mb: 2,
                    background: (theme) => 
                      theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.accent.main} 100%)`
                        : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.accent.main} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  FinTune
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 300 }}>
                  Simplifiez le fine-tuning de vos modèles d'IA et créez des assistants personnalisés en quelques clics.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    component="a"
                    href="https://twitter.com/fintune"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: '#1DA1F2',
                        backgroundColor: (theme) => 
                          theme.palette.mode === 'dark'
                            ? 'rgba(29, 161, 242, 0.1)'
                            : 'rgba(29, 161, 242, 0.1)',
                      },
                    }}
                  >
                    <TwitterIcon />
                  </IconButton>
                  <IconButton
                    component="a"
                    href="https://linkedin.com/company/fintune"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: '#0A66C2',
                        backgroundColor: (theme) => 
                          theme.palette.mode === 'dark'
                            ? 'rgba(10, 102, 194, 0.1)'
                            : 'rgba(10, 102, 194, 0.1)',
                      },
                    }}
                  >
                    <LinkedInIcon />
                  </IconButton>
                  <IconButton
                    component="a"
                    href="https://github.com/fintune"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: (theme) => 
                          theme.palette.mode === 'dark'
                            ? '#ffffff'
                            : '#24292e',
                        backgroundColor: (theme) => 
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(36, 41, 46, 0.1)',
                      },
                    }}
                  >
                    <GitHubIcon />
                  </IconButton>
                  <IconButton
                    component="a"
                    href="https://facebook.com/fintune"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: '#1877F2',
                        backgroundColor: (theme) => 
                          theme.palette.mode === 'dark'
                            ? 'rgba(24, 119, 242, 0.1)'
                            : 'rgba(24, 119, 242, 0.1)',
                      },
                    }}
                  >
                    <FacebookIcon />
                  </IconButton>
                </Box>
              </motion.div>
            </Grid>

            {/* Liens */}
            {footerLinks.map((section, index) => (
              <Grid item xs={6} sm={3} md={2} key={section.title}>
                <motion.div variants={itemVariants} custom={index}>
                  <Typography
                    variant="subtitle1"
                    color="text.primary"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    {section.title}
                  </Typography>
                  <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                    {section.links.map((link) => (
                      <Box component="li" key={link.name} sx={{ mb: 1 }}>
                        <Link
                          component={RouterLink}
                          to={link.path}
                          underline="hover"
                          color="text.secondary"
                          sx={{
                            display: 'inline-block',
                            fontSize: '0.875rem',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              color: 'primary.main',
                              transform: 'translateX(3px)',
                            },
                          }}
                        >
                          {link.name}
                        </Link>
                      </Box>
                    ))}
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Copyright */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'center', sm: 'flex-start' },
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © {currentYear} FinTune. Tous droits réservés.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: { xs: 2, sm: 3 },
              }}
            >
              <Link
                component={RouterLink}
                to="/terms"
                underline="hover"
                color="text.secondary"
                variant="body2"
              >
                Conditions d'utilisation
              </Link>
              <Link
                component={RouterLink}
                to="/privacy"
                underline="hover"
                color="text.secondary"
                variant="body2"
              >
                Politique de confidentialité
              </Link>
              <Link
                component={RouterLink}
                to="/cookies"
                underline="hover"
                color="text.secondary"
                variant="body2"
              >
                Cookies
              </Link>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Footer; 