import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { getDesignTokens } from '../theme';

// Créer le contexte
const ThemeContext = createContext({
  mode: 'dark',
  // La fonction toggleColorMode n'est plus nécessaire
  // toggleColorMode: () => {},\
});

// Hook personnalisé pour utiliser le contexte
export const useTheme = () => useContext(ThemeContext);

// Fournisseur du contexte
export const ThemeProvider = ({ children }) => {
  // Forcer le mode à 'dark'
  const [mode, setMode] = useState('dark');

  // Créer le thème en fonction du mode (toujours dark)
  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  // La fonction toggleColorMode est supprimée
  // const toggleColorMode = () => {\
  //   setMode((prevMode) => {\
  //     const newMode = prevMode === 'light' ? 'dark' : 'light';\
  //     localStorage.setItem('themeMode', newMode);\
  //     return newMode;\
  //   });\
  // };\

  // Mettre à jour le thème lorsque le mode change (ne devrait pas changer)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    // Retirer le localStorage car le thème est fixe
    // localStorage.setItem('themeMode', mode); \
  }, [mode]);

  // Valeur du contexte (sans toggleColorMode)
  const value = {
    mode,
    // toggleColorMode,\
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 