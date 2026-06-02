import { createTheme } from '@mui/material/styles';

export type LeadMapThemeMode = 'claro' | 'escuro';

export const themeLabels: Record<LeadMapThemeMode, string> = {
  claro: 'Tema claro',
  escuro: 'Tema escuro estilo VS Code',
};

export const themeModes: LeadMapThemeMode[] = ['claro', 'escuro'];

const paletteByMode = {
  claro: {
    mode: 'light' as const,
    primary: '#007f73',
    primaryDark: '#005f56',
    primaryLight: '#33a69a',
    secondary: '#2f5f98',
    background: '#eef3f7',
    paper: '#ffffff',
    text: '#18212f',
    muted: '#667085',
    border: 'rgba(24, 33, 47, 0.08)',
    cardShadow: '0 12px 32px rgba(24, 33, 47, 0.08)',
  },
  escuro: {
    mode: 'dark' as const,
    primary: '#007acc',
    primaryDark: '#005a9e',
    primaryLight: '#4fc1ff',
    secondary: '#569cd6',
    background: '#1e1e1e',
    paper: '#252526',
    text: '#d4d4d4',
    muted: '#9cdcfe',
    border: '#3c3c3c',
    cardShadow: '0 14px 34px rgba(0, 0, 0, 0.36)',
  },
};

export function readThemeMode(): LeadMapThemeMode {
  const stored = localStorage.getItem('leadmap:theme-mode');
  return stored === 'escuro' ? 'escuro' : 'claro';
}

export function writeThemeMode(mode: LeadMapThemeMode) {
  localStorage.setItem('leadmap:theme-mode', mode);
  window.dispatchEvent(new CustomEvent('leadmap-theme-change', { detail: mode }));
}

export function buildTheme(mode: LeadMapThemeMode) {
  const selected = paletteByMode[mode];

  return createTheme({
    palette: {
      mode: selected.mode,
      primary: {
        main: selected.primary,
        dark: selected.primaryDark,
        light: selected.primaryLight,
      },
      secondary: {
        main: selected.secondary,
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
        default: selected.background,
        paper: selected.paper,
      },
      text: {
        primary: selected.text,
        secondary: selected.muted,
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
            border: `1px solid ${selected.border}`,
            boxShadow: selected.cardShadow,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderColor: selected.border,
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
}

export const theme = buildTheme('claro');
