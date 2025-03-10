import React, { createContext, useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

  // Configuration d'Axios
  axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Intercepteur pour ajouter le token aux requêtes
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Initialisation de l'authentification
  useEffect(() => {
    const initialize = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');

        if (accessToken) {
          // Dans un environnement réel, vous feriez une requête pour vérifier le token
          // et récupérer les informations de l'utilisateur
          // Pour l'instant, nous simulons un utilisateur connecté
          const user = {
            id: '1',
            email: 'user@example.com',
            name: 'John Doe',
            creditBalance: 100,
          };

          dispatch({
            type: ActionType.INITIALIZE,
            payload: {
              isAuthenticated: true,
              user,
            },
          });
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
        console.error(err);
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
  }, []);

  // Connexion
  const login = async (email, password) => {
    // Dans un environnement réel, vous feriez une requête à votre API
    // Pour l'instant, nous simulons une connexion réussie
    const accessToken = 'fake-access-token';
    localStorage.setItem('accessToken', accessToken);

    const user = {
      id: '1',
      email,
      name: 'John Doe',
      creditBalance: 100,
    };

    dispatch({
      type: ActionType.LOGIN,
      payload: {
        user,
      },
    });
  };

  // Inscription
  const register = async (email, password, name) => {
    // Dans un environnement réel, vous feriez une requête à votre API
    // Pour l'instant, nous simulons une inscription réussie
    const accessToken = 'fake-access-token';
    localStorage.setItem('accessToken', accessToken);

    const user = {
      id: '1',
      email,
      name,
      creditBalance: 0,
    };

    dispatch({
      type: ActionType.REGISTER,
      payload: {
        user,
      },
    });
  };

  // Déconnexion
  const logout = () => {
    localStorage.removeItem('accessToken');
    dispatch({ type: ActionType.LOGOUT });
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
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