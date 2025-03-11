import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Palette de couleurs futuriste
const PRIMARY = {
  lighter: '#E0F7FF',
  light: '#80E0FF',
  main: '#3B82F6', // Bleu vif
  dark: '#2563EB',
  darker: '#1D4ED8',
  contrastText: '#FFFFFF',
};

const SECONDARY = {
  lighter: '#F0FDFA',
  light: '#5EEAD4',
  main: '#10B981', // Vert émeraude
  dark: '#059669',
  darker: '#047857',
  contrastText: '#FFFFFF',
};

const ACCENT = {
  lighter: '#FDF2F8',
  light: '#F9A8D4',
  main: '#EC4899', // Rose vif
  dark: '#DB2777',
  darker: '#BE185D',
  contrastText: '#FFFFFF',
};

// Palette de couleurs pour le mode sombre
const DARK_PRIMARY = {
  lighter: '#1E293B', // Slate 800
  light: '#4B70C4',
  main: '#60A5FA', // Bleu plus clair pour le mode sombre
  dark: '#93C5FD',
  darker: '#BFDBFE',
  contrastText: '#0F172A',
};

const DARK_SECONDARY = {
  lighter: '#064E3B', // Emerald 900
  light: '#34D399',
  main: '#10B981', // Vert émeraude
  dark: '#6EE7B7',
  darker: '#A7F3D0',
  contrastText: '#0F172A',
};

const DARK_ACCENT = {
  lighter: '#831843', // Pink 900
  light: '#F472B6',
  main: '#EC4899', // Rose vif
  dark: '#F9A8D4',
  darker: '#FBCFE8',
  contrastText: '#0F172A',
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

// Palette de gris pour le mode sombre
const DARK_GREY = {
  0: '#0F172A', // Slate 900
  100: '#1E293B', // Slate 800
  200: '#334155', // Slate 700
  300: '#475569', // Slate 600
  400: '#64748B', // Slate 500
  500: '#94A3B8', // Slate 400
  600: '#CBD5E1', // Slate 300
  700: '#E2E8F0', // Slate 200
  800: '#F1F5F9', // Slate 100
  900: '#F8FAFC', // Slate 50
  500_8: 'rgba(148, 163, 184, 0.08)',
  500_12: 'rgba(148, 163, 184, 0.12)',
  500_16: 'rgba(148, 163, 184, 0.16)',
  500_24: 'rgba(148, 163, 184, 0.24)',
  500_32: 'rgba(148, 163, 184, 0.32)',
  500_48: 'rgba(148, 163, 184, 0.48)',
  500_56: 'rgba(148, 163, 184, 0.56)',
  500_80: 'rgba(148, 163, 184, 0.8)',
};

const ERROR = {
  lighter: '#FFE9E9',
  light: '#FF8A8A',
  main: '#EF4444', // Rouge vif
  dark: '#DC2626',
  darker: '#B91C1C',
  contrastText: '#FFFFFF',
};

const WARNING = {
  lighter: '#FFF7ED',
  light: '#FDBA74',
  main: '#F59E0B', // Orange vif
  dark: '#D97706',
  darker: '#B45309',
  contrastText: '#FFFFFF',
};

const INFO = {
  lighter: '#EFF6FF',
  light: '#93C5FD',
  main: '#3B82F6', // Bleu vif
  dark: '#2563EB',
  darker: '#1D4ED8',
  contrastText: '#FFFFFF',
};

const SUCCESS = {
  lighter: '#ECFDF5',
  light: '#6EE7B7',
  main: '#10B981', // Vert émeraude
  dark: '#059669',
  darker: '#047857',
  contrastText: '#FFFFFF',
};

// Créer le thème de base
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Palette pour le mode clair
          common: { black: '#000000', white: '#FFFFFF' },
          primary: PRIMARY,
          secondary: SECONDARY,
          accent: ACCENT,
          error: ERROR,
          warning: WARNING,
          info: INFO,
          success: SUCCESS,
          grey: GREY,
          divider: 'rgba(194, 224, 255, 0.08)',
          text: {
            primary: '#1E293B', // Slate 800
            secondary: '#64748B', // Slate 500
            disabled: GREY[500],
          },
          background: {
            paper: '#FFFFFF',
            default: '#F8FAFF', // Légère teinte bleue
            neutral: '#F1F5F9', // Slate 100
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
        }
      : {
          // Palette pour le mode sombre
          common: { black: '#000000', white: '#FFFFFF' },
          primary: DARK_PRIMARY,
          secondary: DARK_SECONDARY,
          accent: DARK_ACCENT,
          error: ERROR,
          warning: WARNING,
          info: INFO,
          success: SUCCESS,
          grey: DARK_GREY,
          divider: 'rgba(148, 163, 184, 0.12)',
          text: {
            primary: '#E2E8F0', // Slate 200
            secondary: '#94A3B8', // Slate 400
            disabled: DARK_GREY[500],
          },
          background: {
            paper: '#1E293B', // Slate 800
            default: '#0F172A', // Slate 900
            neutral: '#334155', // Slate 700
          },
          action: {
            active: DARK_GREY[600],
            hover: DARK_GREY[500_8],
            selected: DARK_GREY[500_16],
            disabled: DARK_GREY[500_80],
            disabledBackground: DARK_GREY[500_24],
            focus: DARK_GREY[500_24],
            hoverOpacity: 0.12,
            disabledOpacity: 0.48,
          },
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontWeight: 700,
      lineHeight: 1.2,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      lineHeight: 1.3,
      fontSize: '2rem',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 700,
      lineHeight: 1.4,
      fontSize: '1.5rem',
      letterSpacing: 0,
    },
    h4: {
      fontWeight: 700,
      lineHeight: 1.4,
      fontSize: '1.25rem',
    },
    h5: {
      fontWeight: 600,
      lineHeight: 1.5,
      fontSize: '1.125rem',
    },
    h6: {
      fontWeight: 600,
      lineHeight: 1.6,
      fontSize: '1rem',
    },
    subtitle1: {
      fontWeight: 500,
      lineHeight: 1.5,
      fontSize: '1rem',
    },
    subtitle2: {
      fontWeight: 500,
      lineHeight: 1.6,
      fontSize: '0.875rem',
    },
    body1: {
      lineHeight: 1.6,
      fontSize: '1rem',
    },
    body2: {
      lineHeight: 1.6,
      fontSize: '0.875rem',
    },
    button: {
      fontWeight: 600,
      lineHeight: 1.6,
      fontSize: '0.875rem',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.2)',
    '0px 4px 8px rgba(0, 0, 0, 0.2)',
    '0px 8px 16px rgba(0, 0, 0, 0.2)',
    '0px 12px 24px rgba(0, 0, 0, 0.2)',
    '0px 16px 32px rgba(0, 0, 0, 0.2)',
    '0px 20px 40px rgba(0, 0, 0, 0.2)',
    '0px 24px 48px rgba(0, 0, 0, 0.2)',
    '0px 28px 56px rgba(0, 0, 0, 0.2)',
    '0px 32px 64px rgba(0, 0, 0, 0.2)',
    '0px 36px 72px rgba(0, 0, 0, 0.2)',
    '0px 40px 80px rgba(0, 0, 0, 0.2)',
    '0px 44px 88px rgba(0, 0, 0, 0.2)',
    '0px 48px 96px rgba(0, 0, 0, 0.2)',
    '0px 52px 104px rgba(0, 0, 0, 0.2)',
    '0px 56px 112px rgba(0, 0, 0, 0.2)',
    '0px 60px 120px rgba(0, 0, 0, 0.2)',
    '0px 64px 128px rgba(0, 0, 0, 0.2)',
    '0px 68px 136px rgba(0, 0, 0, 0.2)',
    '0px 72px 144px rgba(0, 0, 0, 0.2)',
    '0px 76px 152px rgba(0, 0, 0, 0.2)',
    '0px 80px 160px rgba(0, 0, 0, 0.2)',
    '0px 84px 168px rgba(0, 0, 0, 0.2)',
    '0px 88px 176px rgba(0, 0, 0, 0.2)',
    '0px 92px 184px rgba(0, 0, 0, 0.2)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
        },
        html: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100%',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
        },
        body: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100%',
        },
        '#root': {
          width: '100%',
          height: '100%',
        },
        input: {
          '&[type=number]': {
            MozAppearance: 'textfield',
            '&::-webkit-outer-spin-button': {
              margin: 0,
              WebkitAppearance: 'none',
            },
            '&::-webkit-inner-spin-button': {
              margin: 0,
              WebkitAppearance: 'none',
            },
          },
        },
        img: {
          display: 'block',
          maxWidth: '100%',
        },
        a: {
          textDecoration: 'none',
          color: 'inherit',
        },
        '.MuiContainer-root': {
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 16px 0 rgba(0,0,0,0.2)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
        sizeLarge: {
          height: 52,
          fontSize: '1rem',
        },
        containedPrimary: {
          background: (theme) => 
            theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${DARK_PRIMARY.main} 0%, ${DARK_PRIMARY.dark} 100%)`
              : `linear-gradient(135deg, ${PRIMARY.main} 0%, ${PRIMARY.dark} 100%)`,
          '&:hover': {
            background: (theme) => 
              theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${DARK_PRIMARY.dark} 0%, ${DARK_PRIMARY.darker} 100%)`
                : `linear-gradient(135deg, ${PRIMARY.dark} 0%, ${PRIMARY.darker} 100%)`,
          },
        },
        containedSecondary: {
          background: (theme) => 
            theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${DARK_SECONDARY.main} 0%, ${DARK_SECONDARY.dark} 100%)`
              : `linear-gradient(135deg, ${SECONDARY.main} 0%, ${SECONDARY.dark} 100%)`,
          '&:hover': {
            background: (theme) => 
              theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${DARK_SECONDARY.dark} 0%, ${DARK_SECONDARY.darker} 100%)`
                : `linear-gradient(135deg, ${SECONDARY.dark} 0%, ${SECONDARY.darker} 100%)`,
          },
        },
        outlinedPrimary: {
          border: (theme) => `1px solid ${theme.palette.primary.main}`,
          '&:hover': {
            backgroundColor: (theme) => theme.palette.primary.lighter,
            borderColor: (theme) => theme.palette.primary.dark,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: (theme) => 
            theme.palette.mode === 'dark'
              ? '0 8px 24px rgba(0, 0, 0, 0.3)'
              : '0 8px 24px rgba(0, 0, 0, 0.05)',
          borderRadius: 16,
          position: 'relative',
          zIndex: 0,
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(8px)',
          backgroundColor: (theme) => 
            theme.palette.mode === 'dark'
              ? 'rgba(30, 41, 59, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: (theme) => 
              theme.palette.mode === 'dark'
                ? '0 12px 32px rgba(0, 0, 0, 0.4)'
                : '0 12px 32px rgba(0, 0, 0, 0.1)',
          },
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
          borderRadius: 16,
          backdropFilter: 'blur(8px)',
          backgroundColor: (theme) => 
            theme.palette.mode === 'dark'
              ? 'rgba(30, 41, 59, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
        },
        elevation1: {
          boxShadow: (theme) => 
            theme.palette.mode === 'dark'
              ? '0 2px 12px rgba(0, 0, 0, 0.2)'
              : '0 2px 12px rgba(0, 0, 0, 0.05)',
        },
        elevation4: {
          boxShadow: (theme) => 
            theme.palette.mode === 'dark'
              ? '0 8px 24px rgba(0, 0, 0, 0.3)'
              : '0 8px 24px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: (theme) => theme.palette.text.primary,
          backgroundColor: (theme) => 
            theme.palette.mode === 'dark'
              ? theme.palette.grey[100]
              : theme.palette.grey[200],
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&.Mui-focused': {
              boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.lighter}`,
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '&.Mui-focused': {
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.lighter}`,
          },
          '&:hover': {
            borderColor: (theme) => theme.palette.primary.main,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: (theme) => 
            theme.palette.mode === 'dark'
              ? '0 2px 12px rgba(0, 0, 0, 0.2)'
              : '0 2px 12px rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(8px)',
          backgroundColor: (theme) => 
            theme.palette.mode === 'dark'
              ? 'rgba(15, 23, 42, 0.8)'
              : 'rgba(255, 255, 255, 0.9)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backdropFilter: 'blur(8px)',
          backgroundColor: (theme) => 
            theme.palette.mode === 'dark'
              ? 'rgba(15, 23, 42, 0.9)'
              : 'rgba(255, 255, 255, 0.9)',
          borderRight: (theme) => 
            theme.palette.mode === 'dark'
              ? '1px solid rgba(148, 163, 184, 0.12)'
              : '1px solid rgba(194, 224, 255, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: (theme) => 
            theme.palette.mode === 'dark'
              ? '0 2px 8px rgba(0, 0, 0, 0.3)'
              : '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            backgroundColor: (theme) => 
              theme.palette.mode === 'dark'
                ? 'rgba(96, 165, 250, 0.16)'
                : 'rgba(59, 130, 246, 0.08)',
            '&:hover': {
              backgroundColor: (theme) => 
                theme.palette.mode === 'dark'
                  ? 'rgba(96, 165, 250, 0.24)'
                  : 'rgba(59, 130, 246, 0.16)',
            },
          },
          '&:hover': {
            backgroundColor: (theme) => 
              theme.palette.mode === 'dark'
                ? 'rgba(148, 163, 184, 0.08)'
                : 'rgba(145, 158, 171, 0.08)',
            transform: 'translateX(4px)',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: (theme) => 
            theme.palette.mode === 'dark'
              ? 'rgba(148, 163, 184, 0.12)'
              : 'rgba(194, 224, 255, 0.08)',
        },
      },
    },
  },
});

// Créer le thème avec le mode sombre par défaut
let theme = createTheme(getDesignTokens('dark'));

// Rendre les polices responsives
theme = responsiveFontSizes(theme);

export default theme;
export { getDesignTokens }; 