import React, { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  useTheme,
  Stack,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';
import NotificationsPopover from './NotificationsPopover';
import { notificationService } from '../../services/notificationService';

const drawerWidth = 280;

const Header = ({ onDrawerToggle }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();

  // États pour les notifications
  const [notifications, setNotifications] = useState([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const pollingIntervalRef = useRef(null);

  // Fonction pour charger les notifications
  const fetchNotifications = async () => {
    // Ne pas mettre setLoading ici pour un polling silencieux
    try {
      const data = await notificationService.getNotifications(20); // Limite à 20
      setNotifications(data || []);
      setTotalUnread(data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
      // Gérer l'erreur discrètement
    }
  };

  // Polling des notifications
  useEffect(() => {
    fetchNotifications(); // Charger au montage
    
    pollingIntervalRef.current = setInterval(fetchNotifications, 60000); // Polling toutes les 60 secondes

    // Nettoyer l'intervalle au démontage
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Marquer une notification comme lue
  const handleMarkOneAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Mettre à jour l'état local pour refléter le changement immédiatement
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setTotalUnread(prev => Math.max(0, prev - 1)); // Décrémenter le compteur non lu
    } catch (error) {
      console.error("Erreur marquage comme lu:", error);
    }
  };

  // Marquer tout comme lu
  const handleMarkAllAsRead = async () => {
     try {
      await notificationService.markAllAsRead();
      // Mettre à jour l'état local
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setTotalUnread(0);
    } catch (error) {
      console.error("Erreur marquage tout comme lu:", error);
    }
  };

  const handleOpenUserMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
  };

  return (
    <AppBar
      position="fixed"
      color="transparent"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        backgroundColor: theme.palette.background.default,
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* Bouton menu uniquement visible sur mobile */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { xs: 'flex', sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Espace vide à gauche */}
        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* 
          <Tooltip title="Changer de thème">
            <IconButton onClick={toggleTheme} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          */}

          <NotificationsPopover
             notifications={notifications}
             totalUnread={totalUnread}
             onMarkAllAsRead={handleMarkAllAsRead}
             onMarkOneAsRead={handleMarkOneAsRead}
             isLoading={loadingNotifications}
          />

          {/* User Menu */}
          <Tooltip title="Options du compte">
            <IconButton onClick={handleOpenUserMenu} sx={{ ml: 1 }}>
              <Avatar
                alt={user?.displayName || 'User'}
                src={user?.photoURL}
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: 'primary.main',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 0 0 2px ' + theme.palette.primary.main,
                  },
                }}
              >
                {!user?.photoURL && (
                  <AccountCircleIcon fontSize="small" />
                )}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>

      {/* User Menu */}
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseUserMenu}
        PaperProps={{
          elevation: 2,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            mt: 1.5,
            minWidth: 200,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/dashboard/profile'); }}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Mon profil" />
        </MenuItem>
        <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/dashboard/settings'); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Paramètres" />
        </MenuItem>
        <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/help'); }}>
          <ListItemIcon>
            <HelpIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Aide" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText primary="Déconnexion" sx={{ color: 'error.main' }} />
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header; 