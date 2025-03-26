import React, { useState } from 'react';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import { motion } from 'framer-motion';

const Header = ({ handleDrawerToggle }) => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotificationsMenu = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNotificationsMenu = () => {
    setAnchorElNotifications(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
  };

  const handleNavigate = (path) => {
    handleCloseUserMenu();
    navigate(path);
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{
        width: { xs: '100%', md: `calc(100% - 280px)` },
        ml: { xs: 0, md: '280px' },
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Bouton du menu mobile et logo */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              display: { xs: 'none', sm: 'block' },
              fontWeight: 700,
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

        {/* Barre de recherche */}
        <Box 
          sx={{ 
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            backgroundColor: 'background.paper',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            width: '40%',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)',
            },
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Rechercher...
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Bouton de recherche mobile */}
          <IconButton 
            color="inherit" 
            sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}
          >
            <SearchIcon />
          </IconButton>

          {/* Bouton de changement de thème */}
          <Box sx={{ mr: 1 }}>
            <ThemeToggle />
          </Box>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit" 
              onClick={handleOpenNotificationsMenu}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Menu
            sx={{ mt: '45px' }}
            id="notifications-menu"
            anchorEl={anchorElNotifications}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElNotifications)}
            onClose={handleCloseNotificationsMenu}
          >
            <MenuItem onClick={handleCloseNotificationsMenu}>
              <Typography variant="body2">Fine-tuning terminé : Modèle support client</Typography>
            </MenuItem>
            <MenuItem onClick={handleCloseNotificationsMenu}>
              <Typography variant="body2">Nouveau dataset généré : FAQ produit</Typography>
            </MenuItem>
            <MenuItem onClick={handleCloseNotificationsMenu}>
              <Typography variant="body2">Contenu traité : Documentation technique</Typography>
            </MenuItem>
          </Menu>

          {/* Menu utilisateur */}
          <Box sx={{ flexShrink: 0 }}>
            <Tooltip title="Paramètres du compte">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Avatar 
                    alt={user?.name || 'User'} 
                    src="/static/images/avatar/1.jpg"
                    sx={{ 
                      width: 40, 
                      height: 40,
                      border: '2px solid',
                      borderColor: 'primary.main',
                    }}
                  />
                </motion.div>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={() => handleNavigate('/dashboard/settings')}>
                <Typography textAlign="center">Mon compte</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Typography textAlign="center">Déconnexion</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 