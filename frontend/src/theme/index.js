import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Palette de couleurs
const PRIMARY = {
  lighter: '#E3F2FD',
  light: '#90CAF9',
  main: '#2196F3',
  dark: '#1565C0',
  darker: '#0D47A1',
  contrastText: '#FFFFFF',
};

const SECONDARY = {
  lighter: '#E8F5E9',
  light: '#81C784',
  main: '#4CAF50',
  dark: '#2E7D32',
  darker: '#1B5E20',
  contrastText: '#FFFFFF',
};

const ACCENT = {
  lighter: '#FFF8E1',
  light: '#FFD54F',
  main: '#FFC107',
  dark: '#FFA000',
  darker: '#FF6F00',
  contrastText: '#212121',
};

const GREY = {
  0: '#FFFFFF',
  100: '#F9FAFB',
  200: '#F4F6F8',
  300: '#DFE3E8',
  400: '#C4CDD5',
  500: '#919EAB',
  600: '#637381',
  700: '#454F5B',
  800: '#212B36',
  900: '#161C24',
  500_8: 'rgba(145, 158, 171, 0.08)',
  500_12: 'rgba(145, 158, 171, 0.12)',
  500_16: 'rgba(145, 158, 171, 0.16)',
  500_24: 'rgba(145, 158, 171, 0.24)',
  500_32: 'rgba(145, 158, 171, 0.32)',
  500_48: 'rgba(145, 158, 171, 0.48)',
  500_56: 'rgba(145, 158, 171, 0.56)',
  500_80: 'rgba(145, 158, 171, 0.8)',
};

const ERROR = {
  lighter: '#FFE9E9',
  light: '#FF8A8A',
  main: '#FF3B3B',
  dark: '#D32F2F',
  darker: '#B71C1C',
  contrastText: '#FFFFFF',
};

const WARNING = {
  lighter: '#FFF8E1',
  light: '#FFD54F',
  main: '#FFC107',
  dark: '#FFA000',
  darker: '#FF6F00',
  contrastText: '#212121',
};

const INFO = {
  lighter: '#E1F5FE',
  light: '#4FC3F7',
  main: '#03A9F4',
  dark: '#0288D1',
  darker: '#01579B',
  contrastText: '#FFFFFF',
};

const SUCCESS = {
  lighter: '#E8F5E9',
  light: '#81C784',
  main: '#4CAF50',
  dark: '#2E7D32',
  darker: '#1B5E20',
  contrastText: '#FFFFFF',
};

// Créer le thème de base
let theme = createTheme({
  palette: {
    common: { black: '#000000', white: '#FFFFFF' },
    primary: PRIMARY,
    secondary: SECONDARY,
    accent: ACCENT,
    error: ERROR,
    warning: WARNING,
    info: INFO,
    success: SUCCESS,
    grey: GREY,
    divider: GREY[500_24],
    text: {
      primary: GREY[800],
      secondary: GREY[600],
      disabled: GREY[500],
    },
    background: {
      paper: '#FFFFFF',
      default: '#F9FAFB',
      neutral: GREY[200],
    },
    action: {
      active: GREY[600],
      hover: GREY[500_8],
      selected: GREY[500_16],
      disabled: GREY[500_80],
      disabledBackground: GREY[500_24],
      focus: GREY[500_24],
      hoverOpacity: 0.08,
      disabledOpacity: 0.48,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 700,
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 700,
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      lineHeight: 1.6,
    },
    subtitle1: {
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontWeight: 500,
      lineHeight: 1.6,
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      lineHeight: 1.6,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(145, 158, 171, 0.16)',
    '0px 4px 8px rgba(145, 158, 171, 0.16)',
    '0px 8px 16px rgba(145, 158, 171, 0.16)',
    '0px 12px 24px rgba(145, 158, 171, 0.16)',
    '0px 16px 32px rgba(145, 158, 171, 0.16)',
    '0px 20px 40px rgba(145, 158, 171, 0.16)',
    '0px 24px 48px rgba(145, 158, 171, 0.16)',
    '0px 28px 56px rgba(145, 158, 171, 0.16)',
    '0px 32px 64px rgba(145, 158, 171, 0.16)',
    '0px 36px 72px rgba(145, 158, 171, 0.16)',
    '0px 40px 80px rgba(145, 158, 171, 0.16)',
    '0px 44px 88px rgba(145, 158, 171, 0.16)',
    '0px 48px 96px rgba(145, 158, 171, 0.16)',
    '0px 52px 104px rgba(145, 158, 171, 0.16)',
    '0px 56px 112px rgba(145, 158, 171, 0.16)',
    '0px 60px 120px rgba(145, 158, 171, 0.16)',
    '0px 64px 128px rgba(145, 158, 171, 0.16)',
    '0px 68px 136px rgba(145, 158, 171, 0.16)',
    '0px 72px 144px rgba(145, 158, 171, 0.16)',
    '0px 76px 152px rgba(145, 158, 171, 0.16)',
    '0px 80px 160px rgba(145, 158, 171, 0.16)',
    '0px 84px 168px rgba(145, 158, 171, 0.16)',
    '0px 88px 176px rgba(145, 158, 171, 0.16)',
    '0px 92px 184px rgba(145, 158, 171, 0.16)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        sizeLarge: {
          height: 48,
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: PRIMARY.dark,
          },
        },
        outlinedPrimary: {
          border: `1px solid ${PRIMARY.main}`,
          '&:hover': {
            backgroundColor: PRIMARY.lighter,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(145, 158, 171, 0.08)',
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: GREY[700],
          backgroundColor: GREY[200],
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

// Rendre les polices responsives
theme = responsiveFontSizes(theme);

export default theme; 