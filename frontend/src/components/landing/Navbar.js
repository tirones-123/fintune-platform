import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useScrollTrigger,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Fonction pour détecter le défilement et changer l'apparence de la navbar
function ElevationScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
    sx: {
      backgroundColor: trigger ? 'background.paper' : 'transparent',
      color: trigger ? 'text.primary' : 'white',
      transition: 'all 0.3s',
      boxShadow: trigger ? '0px 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
    },
  });
}

const navItems = [
  { name: 'Accueil', path: '/' },
  { name: 'Fonctionnalités', path: '/#features' },
  { name: 'Tarifs', path: '/#pricing' },
  { name: 'Contact', path: '/#contact' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  // Détecter le défilement pour changer l'apparence des boutons
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" component="div">
          FinTune
        </Typography>
        <IconButton color="inherit">
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton
              sx={{ textAlign: 'center' }}
              onClick={() => navigate(item.path)}
            >
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
        {isAuthenticated ? (
          <>
            <ListItem disablePadding>
              <ListItemButton
                sx={{ textAlign: 'center' }}
                onClick={() => navigate('/dashboard')}
              >
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                sx={{ textAlign: 'center' }}
                onClick={logout}
              >
                <ListItemText primary="Déconnexion" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton
                sx={{ textAlign: 'center' }}
                onClick={() => navigate('/login')}
              >
                <ListItemText primary="Connexion" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                sx={{ textAlign: 'center', bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                onClick={() => navigate('/register')}
              >
                <ListItemText primary="S'inscrire" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <ElevationScroll>
        <AppBar position="fixed">
          <Container maxWidth="lg">
            <Toolbar sx={{ px: { xs: 0 } }}>
              <Typography
                variant="h5"
                component="div"
                sx={{
                  flexGrow: 1,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onClick={() => navigate('/')}
              >
                FinTune
              </Typography>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                {navItems.map((item) => (
                  <Button
                    key={item.name}
                    sx={{
                      color: 'inherit',
                      mx: 1,
                      '&:hover': {
                        backgroundColor: isScrolled ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                    onClick={() => navigate(item.path)}
                  >
                    {item.name}
                  </Button>
                ))}
                {isAuthenticated ? (
                  <>
                    <Button
                      sx={{
                        color: 'inherit',
                        mx: 1,
                        '&:hover': {
                          backgroundColor: isScrolled ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                      onClick={() => navigate('/dashboard')}
                    >
                      Dashboard
                    </Button>
                    <Button
                      sx={{
                        color: 'inherit',
                        mx: 1,
                        '&:hover': {
                          backgroundColor: isScrolled ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                      onClick={logout}
                    >
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      sx={{
                        color: 'inherit',
                        mx: 1,
                        '&:hover': {
                          backgroundColor: isScrolled ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                      onClick={() => navigate('/login')}
                    >
                      Connexion
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      sx={{ ml: 2 }}
                      onClick={() => navigate('/register')}
                    >
                      S'inscrire
                    </Button>
                  </>
                )}
              </Box>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{ display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            </Toolbar>
          </Container>
        </AppBar>
      </ElevationScroll>
      <Box component="nav">
        <Drawer
          anchor="right"
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Toolbar /> {/* Placeholder pour l'espace occupé par la navbar */}
    </Box>
  );
};

export default Navbar; 