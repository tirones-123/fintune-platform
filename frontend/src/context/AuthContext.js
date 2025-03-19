import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/apiService';

// État initial
const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  subscription: null,
};

// Actions
const ActionType = {
  INITIALIZE: 'INITIALIZE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REGISTER: 'REGISTER',
  UPDATE_USER: 'UPDATE_USER',
  UPDATE_SUBSCRIPTION: 'UPDATE_SUBSCRIPTION',
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
        subscription: action.payload.subscription,
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
        subscription: null,
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
    case ActionType.UPDATE_SUBSCRIPTION:
      return {
        ...state,
        subscription: action.payload.subscription,
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
        // Vérifier si l'utilisateur est authentifié
        if (authService.isAuthenticated()) {
          try {
            // Récupérer le profil utilisateur depuis l'API
            const user = await authService.getProfile();
            
            // Récupérer l'abonnement de l'utilisateur
            let subscription = null;
            try {
              subscription = await authService.getSubscription();
            } catch (subscriptionError) {
              console.error('Error fetching subscription:', subscriptionError);
              // Ne pas lancer d'erreur, simplement laisser subscription à null
              // C'est normal pour un nouvel utilisateur de ne pas avoir d'abonnement
            }

            dispatch({
              type: ActionType.INITIALIZE,
              payload: {
                isAuthenticated: true,
                user,
                subscription,
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
                subscription: null,
              },
            });
          }
        } else {
          dispatch({
            type: ActionType.INITIALIZE,
            payload: {
              isAuthenticated: false,
              user: null,
              subscription: null,
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
            subscription: null,
          },
        });
      }
    };

    initialize();
  }, []);

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

  // Mise à jour de l'abonnement
  const updateSubscription = async () => {
    try {
      const subscription = await authService.getSubscription();
      
      dispatch({
        type: ActionType.UPDATE_SUBSCRIPTION,
        payload: {
          subscription, // Peut être null si pas d'abonnement
        },
      });
      
      return subscription;
    } catch (error) {
      console.error('Update subscription error:', error);
      // Ne pas propager l'erreur, simplement retourner null
      dispatch({
        type: ActionType.UPDATE_SUBSCRIPTION,
        payload: {
          subscription: null,
        },
      });
      return null;
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
        updateSubscription,
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