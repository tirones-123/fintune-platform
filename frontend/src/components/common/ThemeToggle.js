import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { mode, toggleColorMode } = useTheme();

  return (
    <Tooltip title={mode === 'dark' ? 'Mode clair' : 'Mode sombre'}>
      <IconButton
        onClick={toggleColorMode}
        color="inherit"
        aria-label="toggle theme"
        sx={{
          p: 1,
          borderRadius: '50%',
          backgroundColor: (theme) => 
            theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.05)',
          '&:hover': {
            backgroundColor: (theme) => 
              theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: mode === 'dark' ? 0 : 180 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {mode === 'dark' ? (
            <LightModeIcon sx={{ color: 'primary.main' }} />
          ) : (
            <DarkModeIcon sx={{ color: 'primary.main' }} />
          )}
        </motion.div>
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle; 