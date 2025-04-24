import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const LoadingScreen = ({ message }) => {
  const { t } = useTranslation();
  const displayMessage = message || t('common.loading');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100%',
        backgroundColor: 'background.default',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 800,
              mb: 4,
              background: (theme) => 
                theme.palette.mode === 'dark'
                  ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.accent.main} 100%)`
                  : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.accent.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            FineTuner
          </Typography>
          
          <CircularProgress 
            size={60} 
            thickness={4} 
            sx={{ mb: 3 }} 
          />
          
          <Typography variant="body1" color="text.secondary">
            {displayMessage}
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
};

export default LoadingScreen; 