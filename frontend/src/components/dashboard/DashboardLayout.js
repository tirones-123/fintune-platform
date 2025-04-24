import React, { useState } from 'react';
import { Box, Toolbar, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, DialogContentText } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import PageTransition from '../common/PageTransition';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CelebrationIcon from '@mui/icons-material/Celebration';

const drawerWidth = 280;

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // --- Welcome modal après onboarding ---
  const { user } = useAuth();
  const location = useLocation();
  const STORAGE_PREFIX = process.env.REACT_APP_STORAGE_PREFIX || 'fintune_';
  const welcomeModalSeenKey = `${STORAGE_PREFIX}hasSeenOnboardingWelcome`;
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  React.useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const onboardingCompleted = queryParams.get('onboarding_completed') === 'true';
    const hasSeenModal = localStorage.getItem(welcomeModalSeenKey);

    if (onboardingCompleted && !hasSeenModal) {
      setShowWelcomeModal(true);
    }
  }, [location.search, welcomeModalSeenKey]);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem(welcomeModalSeenKey, 'true');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: 0, md: `${drawerWidth}px` },
          overflowX: 'hidden',
        }}
      >
        {/* Header */}
        <Header onDrawerToggle={handleDrawerToggle} />
        
        {/* Content */}
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            pt: { xs: 10, sm: 11, md: 12 }, // Plus d'espace en haut pour compenser le header fixe
            width: '100%',
          }}
        >
          <PageTransition>
            <Outlet />
          </PageTransition>
        </Box>
      </Box>

      {/* Welcome modal */}
      <Dialog
        open={showWelcomeModal}
        onClose={handleCloseWelcomeModal}
        aria-labelledby="welcome-dialog-title"
        aria-describedby="welcome-dialog-description"
      >
        <DialogTitle
          id="welcome-dialog-title"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            pb: 0,
          }}
        >
          <CelebrationIcon color="primary" />
          <Typography variant="h6" component="span" fontWeight={700}>
            Bienvenue sur FineTuner Platform&nbsp;!
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <DialogContentText id="welcome-dialog-description" component="div" sx={{ whiteSpace: 'normal' }}>
            Votre premier fine-tuning est maintenant en cours de traitement&nbsp;!<br /><br />
            Voici quelques points importants&nbsp;:
            <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
              <li>Le processus peut prendre de quelques minutes à plusieurs heures selon la taille de votre dataset.</li>
              <li>Vous pouvez suivre la progression dans l'onglet <strong>Fine-Tunings</strong>.</li>
              <li>Vous pouvez également consulter le statut directement sur le tableau de bord OpenAI.</li>
            </ul>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, pr: 3 }}>
          <Button variant="contained" onClick={handleCloseWelcomeModal} autoFocus>
            Compris&nbsp;!
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardLayout; 