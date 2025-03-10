import React from 'react';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useAuth } from '../../context/AuthContext';

const Header = ({ handleDrawerToggle }) => {
  const theme = useTheme();
  const { user } = useAuth();

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - 280px)` },
        ml: { md: '280px' },
        boxShadow: 'none',
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" noWrap component="div">
            Dashboard
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Rechercher">
            <IconButton color="inherit" sx={{ ml: 1 }}>
              <SearchIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Aide">
            <IconButton color="inherit" sx={{ ml: 1 }}>
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton color="inherit" sx={{ ml: 1 }}>
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              ml: 2,
              display: 'flex',
              alignItems: 'center',
              borderLeft: '1px solid',
              borderColor: 'divider',
              pl: 2,
            }}
          >
            <Box sx={{ mr: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {user?.name || 'John Doe'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Solde: {user?.creditBalance || 0}€
              </Typography>
            </Box>
            <Avatar
              src="/static/images/avatar/1.jpg"
              alt={user?.name || 'User'}
              sx={{ width: 40, height: 40 }}
            />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 