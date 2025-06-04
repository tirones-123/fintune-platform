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
  Menu,
  MenuItem,
  Divider,
  Chip,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { pageCategories } from '../../utils/pageRegistry';

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

// Fonction utilitaire pour le défilement
const handleScrollToSection = (sectionPath) => {
  if (!sectionPath) return;

  let id = sectionPath;
  if (id.startsWith('/#')) {
    id = id.slice(2);
  } else if (id.startsWith('#')) {
    id = id.slice(1);
  }

  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

// Composant pour menu déroulant
const DropdownMenu = ({ category, categoryKey, anchorEl, onClose, onNavigate }) => {
  const theme = useTheme();
  
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        elevation: 8,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
          mt: 1.5,
          minWidth: 340,
          maxWidth: 420,
          '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 20,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
          },
        },
      }}
      transformOrigin={{ horizontal: 'left', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: category.color,
          }}
        >
          <span>{category.icon}</span>
          {category.label}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {category.description}
        </Typography>
      </Box>
      
      {category.pages.map((page, index) => (
        <MenuItem
          key={page.path}
          onClick={() => {
            onNavigate(page.path);
            onClose();
          }}
          sx={{
            py: 1.5,
            px: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            '&:hover': {
              backgroundColor: `${category.color}15`,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Typography variant="body1" sx={{ fontWeight: 600, flexGrow: 1 }}>
              {page.title}
            </Typography>
            {page.tag && (
              <Chip 
                label={page.tag} 
                size="small" 
                sx={{ 
                  height: 20, 
                  fontSize: '0.7rem',
                  bgcolor: category.color,
                  color: 'white',
                  fontWeight: 600,
                }} 
              />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {page.description}
          </Typography>
        </MenuItem>
      ))}
      
      <Divider sx={{ my: 1 }} />
      <MenuItem
        onClick={() => {
          onNavigate(`/${categoryKey}`);
          onClose();
        }}
        sx={{ 
          py: 1, 
          justifyContent: 'center',
          color: category.color,
          fontWeight: 600,
        }}
      >
        View All {category.label} →
      </MenuItem>
    </Menu>
  );
};

const Navbar = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [anchorEls, setAnchorEls] = useState({});

  // Gérer l'ouverture/fermeture du menu mobile
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Gérer les menus déroulants
  const handleDropdownOpen = (event, categoryKey) => {
    setAnchorEls(prev => ({
      ...prev,
      [categoryKey]: event.currentTarget,
    }));
  };

  const handleDropdownClose = (categoryKey) => {
    setAnchorEls(prev => ({
      ...prev,
      [categoryKey]: null,
    }));
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  // Détecter le défilement
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
    <Box sx={{ width: 350, pt: 2 }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <Typography
          variant="h5"
          component={RouterLink}
          to="/"
          sx={{
            fontWeight: 800,
            textDecoration: 'none',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.accent?.main || theme.palette.secondary.main} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          FineTuner
        </Typography>
      </Box>
      
      <List>
        {/* Catégories de pages */}
        {Object.entries(pageCategories).map(([categoryKey, category]) => (
          <Box key={categoryKey}>
            <ListItem sx={{ py: 1 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontSize: '1.1rem' }}>{category.icon}</span>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: category.color }}>
                      {category.label}
                    </Typography>
                  </Box>
                }
                secondary={`${category.pages.length} available`}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItem>
            {category.pages.map((page) => (
              <ListItem key={page.path} disablePadding sx={{ pl: 3 }}>
                <ListItemButton
                  onClick={() => {
                    navigate(page.path);
                    handleDrawerToggle();
                  }}
                  sx={{ py: 1, borderRadius: 1, mx: 1 }}
                >
                  <ListItemText
                    primary={page.title}
                    secondary={page.description}
                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                  {page.tag && (
                    <Chip 
                      label={page.tag} 
                      size="small" 
                      sx={{ 
                        height: 18, 
                        fontSize: '0.65rem',
                        bgcolor: category.color,
                        color: 'white',
                        ml: 1,
                      }} 
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </Box>
        ))}
      </List>
      
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          component={RouterLink}
          to="/login"
          variant="outlined"
          fullWidth
          sx={{ py: 1.2, borderRadius: 3, fontWeight: 600 }}
        >
          {t('navbar.login')}
        </Button>
        <Button
          component={RouterLink}
          to="/register"
          variant="contained"
          fullWidth
          sx={{ py: 1.2, borderRadius: 3, fontWeight: 600 }}
        >
          {t('navbar.register')}
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
              ? theme.palette.mode === 'dark' 
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
          <Container maxWidth="xl">
            <Toolbar disableGutters sx={{ height: 70 }}>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={logoVariants}
              >
                <Box 
                  component={RouterLink} 
                  to="/"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    textDecoration: 'none',
                    mr: 4,
                  }}
                >
                  <Box 
                    component="img" 
                    src="/assets/images/logo_sans_texte.png" 
                    alt={t('navbar.logoAlt')}
                    sx={{ height: 32, mr: 1.5 }}
                  />
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      textDecoration: 'none',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.accent?.main || theme.palette.secondary.main} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    FineTuner
                  </Typography>
                </Box>
              </motion.div>

              {isMobile && (
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton
                    color="inherit"
                    aria-label={t('navbar.openDrawerAriaLabel')}
                    edge="end"
                    onClick={handleDrawerToggle}
                    sx={{ ml: 1, p: 1.5 }}
                  >
                    <MenuIcon />
                  </IconButton>
                </Box>
              )}

              {!isMobile && (
                <>
                  <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                    {/* Menus déroulants pour les catégories */}
                    {Object.entries(pageCategories).map(([categoryKey, category], index) => (
                      <motion.div
                        key={categoryKey}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={navItemVariants}
                      >
                        <Button
                          onClick={(event) => handleDropdownOpen(event, categoryKey)}
                          endIcon={<ExpandMoreIcon />}
                          sx={{
                            mx: 0.5,
                            px: 2,
                            color: 'text.primary',
                            fontWeight: 600,
                            borderRadius: 2,
                            '&:hover': {
                              backgroundColor: `${category.color}15`,
                              color: category.color,
                            },
                          }}
                        >
                          {category.label}
                        </Button>
                        <DropdownMenu
                          category={category}
                          categoryKey={categoryKey}
                          anchorEl={anchorEls[categoryKey]}
                          onClose={() => handleDropdownClose(categoryKey)}
                          onNavigate={handleNavigate}
                        />
                      </motion.div>
                    ))}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                        {t('navbar.login')}
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
                          boxShadow: theme.palette.mode === 'dark'
                            ? '0 4px 12px rgba(59, 130, 246, 0.3)'
                            : '0 4px 12px rgba(59, 130, 246, 0.2)',
                        }}
                      >
                        {t('navbar.register')}
                      </Button>
                    </motion.div>
                  </Box>
                </>
              )}
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 350,
          },
        }}
      >
        {drawer}
      </Drawer>

      <Toolbar />
    </>
  );
};

export default Navbar; 