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
  // Nouvel état pour suivre les échecs consécutifs
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  // Référence pour stocker le délai actuel
  const currentDelayRef = useRef(60000); // 60 secondes par défaut

  // Fonction pour charger les notifications
  const fetchNotifications = async () => {
    // Ne pas mettre setLoading ici pour un polling silencieux
    try {
      const data = await notificationService.getNotifications(20); // Limite à 20
      const newNotifications = data || [];
      
      // Vérifier s'il y a de nouvelles notifications non lues
      const currentUnreadCount = newNotifications.filter(n => !n.is_read).length;
      const previousUnreadCount = totalUnread; // Utiliser l'état précédent
      
      setNotifications(newNotifications);
      setTotalUnread(currentUnreadCount);

      // Réinitialiser le compteur d'échecs et le délai après un succès
      if (consecutiveFailures > 0) {
        setConsecutiveFailures(0);
        currentDelayRef.current = 60000; // Réinitialiser à 60 secondes
        console.log("Connexion rétablie, polling réinitialisé à 60 secondes");
      }

      // Déclencher l'événement si de nouvelles notifications de succès FT sont arrivées
      if (currentUnreadCount > previousUnreadCount) {
          const hasNewCompletedFT = newNotifications.some(n => 
              !n.is_read && 
              n.type === 'success' && 
              n.related_type === 'fine_tuning' &&
              n.message.includes('terminé avec succès') // Condition plus spécifique
          );

          if (hasNewCompletedFT) {
              console.log("Notification de fine-tuning terminé détectée, déclenchement de l'événement.");
              window.dispatchEvent(new CustomEvent('finetuningUpdate'));
          }
      }

    } catch (error) {
      console.error("Erreur chargement notifications:", error);
      
      // Incrémenter le compteur d'échecs consécutifs
      const newFailureCount = consecutiveFailures + 1;
      setConsecutiveFailures(newFailureCount);
      
      // Calculer le nouveau délai avec backoff exponentiel (max 5 minutes)
      // Formula: min(baseDelay * 2^failures, maxDelay)
      const baseDelay = 60000; // 60 secondes
      const maxDelay = 300000; // 5 minutes
      const newDelay = Math.min(baseDelay * Math.pow(1.5, newFailureCount), maxDelay);
      currentDelayRef.current = newDelay;
      
      console.log(`Échec #${newFailureCount} de chargement des notifications. Prochain essai dans ${newDelay/1000} secondes.`);
    }
    
    // Planifier la prochaine vérification selon le délai actuel (avec backoff si échec)
    pollingIntervalRef.current = setTimeout(fetchNotifications, currentDelayRef.current);
  };

  // Polling des notifications avec backoff exponentiel
  useEffect(() => {
    fetchNotifications(); // Charger au montage
    
    // Nettoyage à la désinscription
    return () => {
      if (pollingIntervalRef.current) {
        clearTimeout(pollingIntervalRef.current);
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
            <IconButton 
              onClick={handleOpenUserMenu} 
              sx={{
                ml: 1,
                p: { xs: 1, sm: 0.75 },
                '& .MuiAvatar-root': {
                  width: { xs: 42, sm: 38 },
                  height: { xs: 42, sm: 38 },
                }
              }}
            >
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