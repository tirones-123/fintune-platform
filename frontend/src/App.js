import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AnimatePresence } from 'framer-motion';
import LoadingScreen from './components/common/LoadingScreen';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import NewProjectPage from './pages/NewProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ContentUploadPage from './pages/ContentUploadPage';
import NewDatasetPage from './pages/NewDatasetPage';
import NewFineTuningPage from './pages/NewFineTuningPage';
import FineTuningDetailPage from './pages/FineTuningDetailPage';
import ChatPage from './pages/ChatPage';
import DatasetDetailPage from './pages/DatasetDetailPage';
import SettingsPage from './pages/SettingsPage';
import OnboardingPage from './pages/OnboardingPage';

// Layouts
import DashboardLayout from './components/dashboard/DashboardLayout';

// Route protégée qui vérifie l'authentification
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) {
    return <LoadingScreen message="Vérification de l'authentification..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Route qui vérifie si l'utilisateur a complété l'onboarding
const OnboardingCheck = ({ children }) => {
  const { isAuthenticated, isInitialized, user } = useAuth();

  if (!isInitialized) {
    return <LoadingScreen message="Vérification de l'authentification..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Si l'utilisateur n'a pas complété l'onboarding, le rediriger vers l'onboarding
  if (user && !user.hasCompletedOnboarding) {
    return <Navigate to="/onboarding" />;
  }

  return children;
};

// Composant principal avec les routes
const AppRoutes = () => {
  const { isInitialized } = useAuth();

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Route d'onboarding */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Routes protégées avec vérification d'onboarding */}
        <Route
          path="/dashboard"
          element={
            <OnboardingCheck>
              <DashboardLayout />
            </OnboardingCheck>
          }
        >
          <Route index element={<DashboardPage />} />
          
          {/* Routes des projets */}
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/new" element={<NewProjectPage />} />
          <Route path="projects/:projectId" element={<ProjectDetailPage />} />
          
          {/* Routes du contenu */}
          <Route path="content/upload/:projectId" element={<ContentUploadPage />} />
          
          {/* Routes des datasets */}
          <Route path="datasets/new/:projectId" element={<NewDatasetPage />} />
          
          {/* Routes du fine-tuning */}
          <Route path="fine-tuning/new/:datasetId" element={<NewFineTuningPage />} />
          <Route path="fine-tuning/:fineTuningId" element={<FineTuningDetailPage />} />
          <Route path="chat/:fineTuningId" element={<ChatPage />} />
          
          {/* Autres routes à implémenter */}
          <Route path="content" element={<div>Liste des contenus</div>} />
          <Route path="content/:contentId" element={<div>Détail du contenu</div>} />
          <Route path="datasets" element={<div>Liste des datasets</div>} />
          <Route path="datasets/:datasetId" element={<DatasetDetailPage />} />
          <Route path="fine-tuning" element={<div>Liste des fine-tunings</div>} />
          <Route path="analytics" element={<div>Analyse</div>} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Route par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

// Application principale
const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <CssBaseline />
        <SnackbarProvider 
          maxSnack={3} 
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          autoHideDuration={3000}
        >
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App; 