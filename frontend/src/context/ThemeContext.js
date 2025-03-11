import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { getDesignTokens } from '../theme';

// Créer le contexte
const ThemeContext = createContext({
  mode: 'dark',
  toggleColorMode: () => {},
});

// Hook personnalisé pour utiliser le contexte
export const useTheme = () => useContext(ThemeContext);

// Fournisseur du contexte
export const ThemeProvider = ({ children }) => {
  // Récupérer le mode de thème depuis le localStorage ou utiliser 'dark' par défaut
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'dark';
  });

  // Créer le thème en fonction du mode
  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  // Fonction pour basculer entre les modes clair et sombre
  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  // Mettre à jour le thème lorsque le mode change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  // Valeur du contexte
  const value = {
    mode,
    toggleColorMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 