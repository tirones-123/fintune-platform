import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/apiService';

// État initial
const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

// Actions
const ActionType = {
  INITIALIZE: 'INITIALIZE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REGISTER: 'REGISTER',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer
const reducer = (state, action) => {
  switch (action.type) {
    case ActionType.INITIALIZE:
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        isInitialized: true,
        user: action.payload.user,
      };
    case ActionType.LOGIN:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case ActionType.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    case ActionType.REGISTER:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case ActionType.UPDATE_USER:
      return {
        ...state,
        user: action.payload.user,
      };
    default:
      return state;
  }
};

// Créer le contexte
const AuthContext = createContext(null);

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();

  // Initialisation de l'authentification
  useEffect(() => {
    const initialize = async () => {
      try {
        // Vérifier le signal dans l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const onboardingCompletedSignal = urlParams.get('onboarding_completed') === 'true';

        // Vérifier si l'utilisateur est authentifié
        if (authService.isAuthenticated()) {
          try {
            // Récupérer le profil utilisateur depuis l'API
            let user = await authService.getProfile();
            
            // Si le signal est présent, forcer l'état d'onboarding ET mettre à jour le backend
            if (onboardingCompletedSignal) {
              console.log("Signal d'onboarding détecté. Tentative de mise à jour du backend...");
              try {
                // Appeler PUT /api/users/me pour marquer l'onboarding comme terminé
                const updatedUser = await authService.updateProfile({
                  has_completed_onboarding: true
                });
                user = updatedUser; // Utiliser l'utilisateur mis à jour par l'API
                console.log("Backend mis à jour avec succès:", user);
                
                // Optionnel: Nettoyer l'URL après lecture et mise à jour réussie
                window.history.replaceState({}, document.title, window.location.pathname);

              } catch (updateError) {
                console.error("Échec de la mise à jour du statut d'onboarding via API:", updateError);
                // En cas d'échec de l'API, on force quand même l'état local pour débloquer l'utilisateur
                user = {
                  ...user,
                  has_completed_onboarding: true,
                  hasCompletedOnboarding: true
                };
              }
            }
            
            dispatch({
              type: ActionType.INITIALIZE,
              payload: {
                isAuthenticated: true,
                user, // Utiliser l'objet user potentiellement modifié
              },
            });
          } catch (error) {
            console.error('Error fetching user profile:', error);
            // Si la récupération du profil échoue, déconnecter l'utilisateur
            authService.logout();
            dispatch({
              type: ActionType.INITIALIZE,
              payload: {
                isAuthenticated: false,
                user: null,
              },
            });
          }
        } else {
          dispatch({
            type: ActionType.INITIALIZE,
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      } catch (err) {
        console.error('Initialization error:', err);
        dispatch({
          type: ActionType.INITIALIZE,
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };

    initialize();
  }, []); // L'effet ne dépend que du montage initial

  // Connexion
  const login = async (email, password) => {
    try {
      const user = await authService.login({ email, password });
      
      dispatch({
        type: ActionType.LOGIN,
        payload: {
          user,
        },
      });
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Inscription
  const register = async (email, password, name) => {
    try {
      const user = await authService.register({ email, password, name });
      
      dispatch({
        type: ActionType.REGISTER,
        payload: {
          user,
        },
      });
      
      // Rediriger vers l'onboarding pour les nouveaux utilisateurs
      navigate('/onboarding');
      
      return user;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  // Mise à jour de l'utilisateur
  const updateUser = async (userData) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      
      dispatch({
        type: ActionType.UPDATE_USER,
        payload: {
          user: updatedUser,
        },
      });
      
      return updatedUser;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: ActionType.LOGOUT });
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Même en cas d'erreur, on déconnecte l'utilisateur localement
      dispatch({ type: ActionType.LOGOUT });
      navigate('/login', { replace: true });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}; 