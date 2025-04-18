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
  alpha,
  Stack,
  Button,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  React.useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

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

  // Définition des couleurs pour les icônes de réseaux sociaux avec effet néon
  const socialIcons = [
    { Icon: TwitterIcon, href: "https://twitter.com/fintune", color: "#1DA1F2", label: "Twitter" },
    { Icon: LinkedInIcon, href: "https://linkedin.com/company/fintune", color: "#0A66C2", label: "LinkedIn" },
    { Icon: GitHubIcon, href: "https://github.com/fintune", color: theme.palette.mode === 'dark' ? '#ffffff' : '#24292e', label: "GitHub" },
    { Icon: FacebookIcon, href: "https://facebook.com/fintune", color: "#1877F2", label: "Facebook" },
  ];

  return (
    <Box
      component="footer"
      ref={ref}
      sx={{
        pt: 12,
        pb: 6,
        backgroundColor: 'background.default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Futuristic grid pattern background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23${theme.palette.mode === 'dark' ? 'ffffff' : '000000'}' stroke-width='0.5'%3E%3Cpath d='M0 0h60v60H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          zIndex: 0,
        }}
      />

      {/* Wave separator on top */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          overflow: 'hidden',
          lineHeight: 0,
          transform: 'rotate(180deg)',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={{
            position: 'relative',
            display: 'block',
            width: 'calc(100% + 1.3px)',
            height: '50px',
            fill: theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5'
          }}
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
          ></path>
        </svg>
      </Box>

      {/* Glowing orbs background effect */}
      <Box
        component={motion.div}
        animate={{
          y: [0, -10, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: { xs: 150, md: 300 },
          height: { xs: 150, md: 300 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(121, 40, 202, 0.08) 0%, rgba(121, 40, 202, 0) 70%)',
          filter: 'blur(40px)',
          zIndex: 0,
        }}
      />

      <Box
        component={motion.div}
        animate={{
          y: [0, 10, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: 'reverse',
          delay: 1,
        }}
        sx={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: { xs: 100, md: 200 },
          height: { xs: 100, md: 200 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 198, 255, 0.08) 0%, rgba(0, 198, 255, 0) 70%)',
          filter: 'blur(40px)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial="hidden"
          animate={controls}
          variants={containerVariants}
        >
          {/* Newsletter section */}
          <Box 
            sx={{ 
              mb: 8,
              p: 4,
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? `linear-gradient(135deg, ${alpha('#0c0434', 0.8)}, ${alpha('#221b5b', 0.8)})`
                  : `linear-gradient(135deg, ${alpha(theme.palette.primary.lighter, 0.8)}, ${alpha(theme.palette.secondary.lighter, 0.8)})`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.1)}`,
            }}
          >
            {/* Animated gradient accent */}
            <Box
              component={motion.div}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0.1,
                background: 'linear-gradient(45deg, #7928CA, #00C6FF, #7928CA)',
                backgroundSize: '200% 200%',
                zIndex: 0,
              }}
            />

            <Grid container spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
              <Grid item xs={12} md={7}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700,
                  mb: 2,
                  fontFamily: "'Orbitron', sans-serif",
                }}>
                  Restez à la pointe de l'IA
                </Typography>
                <Typography variant="body1" sx={{ mb: 0, color: 'text.secondary' }}>
                  Abonnez-vous à notre newsletter pour recevoir les dernières actualités, conseils et mises à jour.
                </Typography>
              </Grid>
              <Grid item xs={12} md={5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Box sx={{ 
                    flex: 1,
                    backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.2), 
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    height: 50,
                    width: '100%',
                  }}>
                  </Box>
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      bgcolor: 'background.paper',
                      color: 'primary.main',
                      height: 50,
                      borderRadius: 2,
                      px: 3,
                      fontWeight: 600,
                      boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.common.black, 0.1)}`,
                      '&:hover': {
                        bgcolor: 'background.paper',
                        boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.common.black, 0.15)}`,
                      }
                    }}
                  >
                    S'abonner
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>

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
                    background: 'linear-gradient(135deg, #7928CA, #00C6FF)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: "'Orbitron', sans-serif",
                  }}
                >
                  FinTune
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 320, lineHeight: 1.7 }}>
                  Transformez vos contenus en IA fine-tunée en quelques clics. La technologie d'IA la plus simple et la plus puissante pour créer votre assistant sur-mesure.
                </Typography>
                
                {/* Social media icons with neon effect */}
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {socialIcons.map((social, index) => (
                    <IconButton
                      key={social.label}
                      component="a"
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      sx={{
                        color: 'text.secondary',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        '&:hover': {
                          color: social.color,
                          transform: 'translateY(-3px)',
                          '&::after': {
                            opacity: 0.7,
                            transform: 'scale(1.3)',
                          }
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderRadius: '50%',
                          background: alpha(social.color, 0.2),
                          opacity: 0,
                          transition: 'all 0.3s ease',
                          zIndex: -1,
                        }
                      }}
                    >
                      <social.Icon />
                    </IconButton>
                  ))}
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
                    sx={{ 
                      fontWeight: 700, 
                      mb: 3,
                      position: 'relative',
                      display: 'inline-block',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: '60%',
                        height: '2px',
                        bottom: -8,
                        left: 0,
                        background: 'linear-gradient(90deg, #7928CA, transparent)',
                      }
                    }}
                  >
                    {section.title}
                  </Typography>
                  <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                    {section.links.map((link) => (
                      <Box component="li" key={link.name} sx={{ mb: 2 }}>
                        <Link
                          component={RouterLink}
                          to={link.path}
                          underline="none"
                          color="text.secondary"
                          sx={{
                            display: 'inline-block',
                            fontSize: '0.875rem',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            '&:hover': {
                              color: 'primary.main',
                              transform: 'translateX(5px)',
                              '&::before': {
                                opacity: 1,
                                width: '1rem',
                              }
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              width: '0.5rem',
                              height: '1px',
                              opacity: 0,
                              background: 'primary.main',
                              left: -15,
                              top: '50%',
                              transition: 'all 0.3s ease',
                            }
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

          <Divider sx={{ 
            my: 6, 
            opacity: 0.1,
            background: 'linear-gradient(90deg, transparent, #7928CA, #00C6FF, transparent)',
            height: '1px',
          }} />

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
                sx={{
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                  }
                }}
              >
                Conditions d'utilisation
              </Link>
              <Link
                component={RouterLink}
                to="/privacy"
                underline="hover"
                color="text.secondary"
                variant="body2"
                sx={{
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                  }
                }}
              >
                Politique de confidentialité
              </Link>
              <Link
                component={RouterLink}
                to="/cookies"
                underline="hover"
                color="text.secondary"
                variant="body2"
                sx={{
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                  }
                }}
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