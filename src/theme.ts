import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007f73',
      dark: '#005f56',
      light: '#33a69a',
    },
    secondary: {
      main: '#2f5f98',
    },
    success: {
      main: '#1f9d55',
    },
    warning: {
      main: '#d97706',
    },
    error: {
      main: '#d43f3a',
    },
    background: {
      default: '#eef3f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#18212f',
      secondary: '#667085',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: 0,
    },
    h5: {
      fontWeight: 800,
      letterSpacing: 0,
    },
    h6: {
      fontWeight: 800,
      letterSpacing: 0,
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(24, 33, 47, 0.08)',
          boxShadow: '0 12px 32px rgba(24, 33, 47, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
  },
});
