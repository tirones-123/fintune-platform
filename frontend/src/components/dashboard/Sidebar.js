import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Button,
  Tooltip,
  alpha,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DatasetIcon from '@mui/icons-material/Dataset';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 280;

// Animation pour les éléments de la liste
const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

const menuItems = [
  { name: 'Dashboard', icon: DashboardIcon, path: '/dashboard', description: 'Vue d\'ensemble' },
  { name: 'Projets', icon: FolderIcon, path: '/dashboard/projects', description: 'Gérer vos projets' },
  { name: 'Contenu', icon: CloudUploadIcon, path: '/dashboard/content', description: 'Vos documents importés' },
  { name: 'Datasets', icon: DatasetIcon, path: '/dashboard/datasets', description: 'Paires question-réponse' },
  { name: 'Fine-tuning', icon: PsychologyIcon, path: '/dashboard/fine-tuning', description: 'Modèles entraînés' },
  { name: 'Analyse', icon: BarChartIcon, path: '/dashboard/analytics', description: 'Statistiques et métriques' },
];

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Logo */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 800,
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

      <Divider />

      {/* Bouton Nouveau projet */}
      <Box sx={{ p: 3 }}>
        <Button
          component={motion.button}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          variant="contained"
          fullWidth
          startIcon={<AddIcon />}
          onClick={() => navigate('/dashboard/projects/new')}
          sx={{ 
            py: 1.2,
            borderRadius: 3,
            boxShadow: (theme) => 
              theme.palette.mode === 'dark'
                ? '0 8px 16px rgba(0, 0, 0, 0.3)'
                : '0 8px 16px rgba(59, 130, 246, 0.2)',
          }}
        >
          Nouveau projet
        </Button>
      </Box>

      {/* Menu principal */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2 }}>
        <List>
          {menuItems.map((item, index) => {
            const isSelected = location.pathname === item.path || 
                              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            
            return (
              <motion.div
                key={item.name}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={itemVariants}
              >
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <Tooltip title={item.description} placement="right" arrow>
                    <ListItemButton
                      onClick={() => navigate(item.path)}
                      selected={isSelected}
                      sx={{
                        borderRadius: 3,
                        py: 1.2,
                        transition: 'all 0.3s ease',
                        '&.Mui-selected': {
                          backgroundColor: (theme) => 
                            theme.palette.mode === 'dark'
                              ? alpha(theme.palette.primary.main, 0.2)
                              : alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: (theme) => 
                              theme.palette.mode === 'dark'
                                ? alpha(theme.palette.primary.main, 0.3)
                                : alpha(theme.palette.primary.main, 0.2),
                          },
                          '& .MuiListItemIcon-root': {
                            color: 'primary.main',
                          },
                        },
                        '&:hover': {
                          backgroundColor: (theme) => 
                            theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.05)'
                              : 'rgba(0, 0, 0, 0.04)',
                          transform: 'translateX(5px)',
                        },
                      }}
                    >
                      <ListItemIcon 
                        sx={{ 
                          minWidth: 40,
                          color: isSelected ? 'primary.main' : 'text.secondary',
                        }}
                      >
                        <item.icon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.name} 
                        primaryTypographyProps={{ 
                          fontWeight: isSelected ? 600 : 400,
                        }}
                      />
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              </motion.div>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ mt: 2 }} />

      {/* Paramètres et déconnexion */}
      <Box sx={{ p: 2 }}>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => navigate('/dashboard/settings')}
            selected={location.pathname === '/dashboard/settings'}
            sx={{
              borderRadius: 3,
              py: 1.2,
              transition: 'all 0.3s ease',
              '&.Mui-selected': {
                backgroundColor: (theme) => 
                  theme.palette.mode === 'dark'
                    ? alpha(theme.palette.primary.main, 0.2)
                    : alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Paramètres" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            onClick={logout}
            sx={{
              borderRadius: 3,
              py: 1.2,
              color: 'text.secondary',
              '&:hover': {
                color: 'error.main',
                '& .MuiListItemIcon-root': {
                  color: 'error.main',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Déconnexion" />
          </ListItemButton>
        </ListItem>
      </Box>

      {/* Version */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          FinTune Platform v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
            bgcolor: 'background.default',
            zIndex: (theme) => theme.zIndex.drawer,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar; 