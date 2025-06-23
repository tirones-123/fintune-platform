import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AnimatePresence } from 'framer-motion';
import LoadingScreen from './components/common/LoadingScreen';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import NewProjectPage from './pages/NewProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
// import ContentUploadPage from './pages/ContentUploadPage'; // Supprimé
// import NewDatasetPage from './pages/NewDatasetPage'; // Supprimé
// import NewFineTuningPage from './pages/NewFineTuningPage'; // Supprimé
import FineTuningDetailPage from './pages/FineTuningDetailPage';
import ChatPage from './pages/ChatPage';
import DatasetDetailPage from './pages/DatasetDetailPage';
import SettingsPage from './pages/SettingsPage';
import OnboardingPage from './pages/OnboardingPage';
import ContentsPage from './pages/ContentsPage';
import DatasetsPage from './pages/DatasetsPage';
import FineTuningsPage from './pages/FineTuningsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NewFineTuningFlowPage from './pages/NewFineTuningFlowPage';
import PlaygroundPage from './pages/PlaygroundPage';
import HelpPage from './pages/HelpPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import SupportChatbotPage from './pages/usecases/SupportChatbotPage';
import InternalFaqPage from './pages/usecases/InternalFaqPage';
import SaasOnboardingPage from './pages/usecases/SaasOnboardingPage';
import LegalDraftingPage from './pages/usecases/LegalDraftingPage';
import BrandVoicePage from './pages/usecases/BrandVoicePage';
import SocialMediaPage from './pages/usecases/SocialMediaPage';
import InstructorVoicePage from './pages/usecases/InstructorVoicePage';
import SalesAssistantPage from './pages/usecases/SalesAssistantPage';
import FinetunerVsOpenAIPage from './pages/compare/FinetunerVsOpenAIPage';
import FinetunerVsCustomGPTPage from './pages/compare/FinetunerVsCustomGPTPage';
import FinetunerVsChatbasePage from './pages/compare/FinetunerVsChatbasePage';
import FinetunerVsBotpressPage from './pages/compare/FinetunerVsBotpressPage';
import FinetunerVsAnthropicPage from './pages/compare/FinetunerVsAnthropicPage';
import PineconeAlternativesPage from './pages/alternatives/PineconeAlternativesPage';
import WeaviateAlternativesPage from './pages/alternatives/WeaviateAlternativesPage';
import SlackIntegrationPage from './pages/integrations/SlackIntegrationPage';
import TeamsIntegrationPage from './pages/integrations/TeamsIntegrationPage';
import NotFoundPage from './pages/NotFoundPage';
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
  if (user && !(user.hasCompletedOnboarding || user.has_completed_onboarding)) {
    return <Navigate to="/onboarding" />;
  }

  return children;
};

// Composant principal avec les routes
const AppRoutes = () => {
  const { isInitialized } = useAuth();
  const navigate = useNavigate();
  
  // Vérifier les paramètres d'authentification dans l'URL (après redirection OAuth Google)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authSuccess = params.get('auth_success');
    
    if (authSuccess === 'true') {
      // Récupérer les tokens
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const userEmail = params.get('user_email');
      const userName = params.get('user_name');
      
      // Stocker les informations dans localStorage
      const storagePrefix = process.env.REACT_APP_STORAGE_PREFIX || 'fintune_';
      
      if (accessToken && refreshToken) {
        localStorage.setItem(`${storagePrefix}accessToken`, accessToken);
        localStorage.setItem(`${storagePrefix}refreshToken`, refreshToken);
        
        // Stocker les infos utilisateur
        if (userEmail && userName) {
          const user = {
            email: userEmail,
            name: userName,
          };
          localStorage.setItem(`${storagePrefix}user`, JSON.stringify(user));
        }
        
        let destination = '/dashboard';
        // Si un state_id est présent, on essaie de conserver la page courante
        if (params.get('state_id')) {
          destination = window.location.pathname || '/dashboard';
        }
        // Ne jamais rester sur la page login après authentification
        if (destination === '/login') {
          destination = '/dashboard';
        }
        
        // Rediriger sans les paramètres d'auth dans l'URL en utilisant navigate
        navigate(destination, { replace: true });
      }
    }
  }, [navigate]);

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
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/use-cases/support-chatbot" element={<SupportChatbotPage />} />
        <Route path="/use-cases/internal-faq" element={<InternalFaqPage />} />
        <Route path="/use-cases/saas-onboarding" element={<SaasOnboardingPage />} />
        <Route path="/use-cases/legal-drafting" element={<LegalDraftingPage />} />
        <Route path="/use-cases/brand-voice" element={<BrandVoicePage />} />
        <Route path="/use-cases/social-media" element={<SocialMediaPage />} />
        <Route path="/use-cases/instructor-voice" element={<InstructorVoicePage />} />
        <Route path="/use-cases/sales-assistant" element={<SalesAssistantPage />} />
        <Route path="/compare/finetuner-vs-openai" element={<FinetunerVsOpenAIPage />} />
        <Route path="/compare/finetuner-vs-customgpt" element={<FinetunerVsCustomGPTPage />} />
        <Route path="/compare/finetuner-vs-chatbase" element={<FinetunerVsChatbasePage />} />
        <Route path="/compare/finetuner-vs-botpress" element={<FinetunerVsBotpressPage />} />
        <Route path="/compare/finetuner-vs-anthropic" element={<FinetunerVsAnthropicPage />} />
        <Route path="/alternatives/pinecone" element={<PineconeAlternativesPage />} />
        <Route path="/alternatives/weaviate" element={<WeaviateAlternativesPage />} />
        <Route path="/integrations/slack" element={<SlackIntegrationPage />} />
        <Route path="/integrations/teams" element={<TeamsIntegrationPage />} />

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
          {/* Route par défaut : liste des projets */}
          <Route index element={<ProjectsPage />} />
          
          {/* Routes des projets */}
          <Route path="projects/new" element={<ProtectedRoute><NewProjectPage /></ProtectedRoute>} />
          <Route path="projects/:projectId" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
          <Route path="projects/:projectId/new-fine-tuning" element={<ProtectedRoute><NewFineTuningFlowPage /></ProtectedRoute>} />
          
          {/* Routes du contenu - Supprimées car intégrées */}
          {/* <Route path="content/upload/:projectId" element={<ContentUploadPage />} /> */}
          {/* <Route path="content/upload" element={<ContentUploadPage />} /> */}
          {/* <Route path="content/:contentId" element={<ContentUploadPage />} /> */}
          
          {/* Routes des datasets - Supprimées car intégrées */}
          {/* <Route path="datasets/new/:projectId" element={<NewDatasetPage />} /> */}
          <Route path="datasets/:datasetId" element={<DatasetDetailPage />} />
          
          {/* Routes du fine-tuning - Supprimées car intégrées */}
          {/* <Route path="fine-tuning/new/:datasetId" element={<NewFineTuningPage />} /> */}
          <Route path="fine-tuning/:fineTuningId" element={<FineTuningDetailPage />} />
          <Route path="chat/:fineTuningId" element={<ChatPage />} />
          
          {/* Autres routes */}
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="playground" element={<ProtectedRoute><PlaygroundPage /></ProtectedRoute>} />
          <Route path="help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />

          {/* Catch-all pour les routes non trouvées dans le dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Route par défaut */}
        <Route path="*" element={<NotFoundPage />} />
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
            <Suspense fallback={<LoadingScreen message="Chargement des traductions..." />}>
              <AppRoutes />
            </Suspense>
            <Toaster position="bottom-center" toastOptions={{ duration: 4000 }} />
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};


export default App; 