import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Typography,
  useScrollTrigger,
  Slide,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { motion } from 'framer-motion';
import ThemeToggle from '../common/ThemeToggle';

// Animation pour le logo
const logoVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    }
  },
};

// Animation pour les liens
const navItemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i) => ({ 
    opacity: 1, 
    y: 0,
    transition: { 
      delay: 0.1 + i * 0.1,
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    }
  }),
};

// Fonction pour cacher la navbar lors du défilement vers le bas
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Liens de navigation
  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Comment ça marche', path: '/#how-it-works' },
    { name: 'Avantages', path: '/#benefits' },
    { name: 'Tarifs', path: '/#pricing' },
  ];

  // Gérer l'ouverture/fermeture du menu mobile
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Détecter le défilement pour changer l'apparence de la navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Contenu du menu mobile
  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <Typography
          variant="h5"
          component={RouterLink}
          to="/"
          sx={{
            fontWeight: 800,
            textDecoration: 'none',
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
      </Box>
      <List>
        {navLinks.map((link) => (
          <ListItem key={link.name} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={link.path}
              onClick={handleDrawerToggle}
              sx={{
                py: 1.5,
                '&:hover': {
                  backgroundColor: (theme) => 
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ListItemText 
                primary={link.name} 
                primaryTypographyProps={{ 
                  fontWeight: 600,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          component={RouterLink}
          to="/login"
          variant="outlined"
          fullWidth
          sx={{ 
            py: 1.2,
            borderRadius: 3,
            borderWidth: 2,
            fontWeight: 600,
          }}
        >
          Se connecter
        </Button>
        <Button
          component={RouterLink}
          to="/register"
          variant="contained"
          fullWidth
          sx={{ 
            py: 1.2,
            borderRadius: 3,
            fontWeight: 600,
          }}
        >
          S'inscrire
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <HideOnScroll>
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            backgroundColor: scrolled 
              ? (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(15, 23, 42, 0.8)'
                : 'rgba(255, 255, 255, 0.8)'
              : 'transparent',
            backdropFilter: scrolled ? 'blur(10px)' : 'none',
            boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none',
            borderBottom: scrolled ? '1px solid' : 'none',
            borderColor: 'divider',
            transition: 'all 0.3s ease',
          }}
        >
          <Container maxWidth="lg">
            <Toolbar disableGutters sx={{ height: 70 }}>
              {/* Logo */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={logoVariants}
              >
                <Typography
                  variant="h5"
                  component={RouterLink}
                  to="/"
                  sx={{
                    mr: 4,
                    fontWeight: 800,
                    textDecoration: 'none',
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
              </motion.div>

              {/* Menu mobile */}
              {isMobile && (
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <ThemeToggle />
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="end"
                    onClick={handleDrawerToggle}
                    sx={{ ml: 1 }}
                  >
                    <MenuIcon />
                  </IconButton>
                </Box>
              )}

              {/* Menu desktop */}
              {!isMobile && (
                <>
                  <Box sx={{ flexGrow: 1, display: 'flex' }}>
                    {navLinks.map((link, index) => (
                      <motion.div
                        key={link.name}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={navItemVariants}
                      >
                        <Button
                          component={RouterLink}
                          to={link.path}
                          sx={{
                            mx: 1,
                            color: 'text.primary',
                            fontWeight: 600,
                            '&:hover': {
                              backgroundColor: 'transparent',
                              color: 'primary.main',
                            },
                          }}
                        >
                          {link.name}
                        </Button>
                      </motion.div>
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ThemeToggle />
                    <motion.div
                      custom={4}
                      initial="hidden"
                      animate="visible"
                      variants={navItemVariants}
                    >
                      <Button
                        component={RouterLink}
                        to="/login"
                        sx={{
                          mx: 1,
                          color: 'text.primary',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: 'transparent',
                            color: 'primary.main',
                          },
                        }}
                      >
                        Se connecter
                      </Button>
                    </motion.div>
                    <motion.div
                      custom={5}
                      initial="hidden"
                      animate="visible"
                      variants={navItemVariants}
                    >
                      <Button
                        component={RouterLink}
                        to="/register"
                        variant="contained"
                        sx={{
                          ml: 1,
                          px: 3,
                          py: 1,
                          borderRadius: 3,
                          fontWeight: 600,
                          boxShadow: (theme) => 
                            theme.palette.mode === 'dark'
                              ? '0 4px 12px rgba(59, 130, 246, 0.3)'
                              : '0 4px 12px rgba(59, 130, 246, 0.2)',
                        }}
                      >
                        S'inscrire
                      </Button>
                    </motion.div>
                  </Box>
                </>
              )}
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>

      {/* Drawer pour le menu mobile */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Espace pour compenser la hauteur de la navbar */}
      <Toolbar />
    </>
  );
};

export default Navbar; 