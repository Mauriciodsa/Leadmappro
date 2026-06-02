import { createTheme } from '@mui/material/styles';

export type LeadMapThemeMode = 'claro' | 'escuro' | 'interativo' | 'ia' | 'moderno' | 'futurista';

export const themeLabels: Record<LeadMapThemeMode, string> = {
  claro: 'Tema claro',
  escuro: 'Tema escuro',
  interativo: 'Tema interativo',
  ia: 'Tema estilo IA',
  moderno: 'Tema moderno',
  futurista: 'Tema futurista',
};

export const themeModes = Object.keys(themeLabels) as LeadMapThemeMode[];

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
  },
  escuro: {
    mode: 'dark' as const,
    primary: '#2dd4bf',
    primaryDark: '#0f766e',
    primaryLight: '#7dd3fc',
    secondary: '#facc15',
    background: '#101828',
    paper: '#182230',
    text: '#f8fafc',
    muted: '#cbd5e1',
  },
  interativo: {
    mode: 'light' as const,
    primary: '#0ea5e9',
    primaryDark: '#0369a1',
    primaryLight: '#38bdf8',
    secondary: '#16a34a',
    background: '#f2f8fb',
    paper: '#ffffff',
    text: '#102033',
    muted: '#5b6878',
  },
  ia: {
    mode: 'dark' as const,
    primary: '#22d3ee',
    primaryDark: '#0891b2',
    primaryLight: '#a5f3fc',
    secondary: '#a78bfa',
    background: '#09111f',
    paper: '#111827',
    text: '#f8fbff',
    muted: '#b7c4d7',
  },
  moderno: {
    mode: 'light' as const,
    primary: '#111827',
    primaryDark: '#030712',
    primaryLight: '#4b5563',
    secondary: '#0f766e',
    background: '#f5f7fa',
    paper: '#ffffff',
    text: '#111827',
    muted: '#667085',
  },
  futurista: {
    mode: 'dark' as const,
    primary: '#00e5ff',
    primaryDark: '#00a6c7',
    primaryLight: '#67e8f9',
    secondary: '#ffb703',
    background: '#081018',
    paper: '#111b25',
    text: '#eefcff',
    muted: '#a8bdca',
  },
};

export function readThemeMode(): LeadMapThemeMode {
  const stored = localStorage.getItem('leadmap:theme-mode') as LeadMapThemeMode | null;
  return stored && themeModes.includes(stored) ? stored : 'claro';
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
            border: selected.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(24, 33, 47, 0.08)',
            boxShadow: selected.mode === 'dark' ? '0 12px 32px rgba(0, 0, 0, 0.26)' : '0 12px 32px rgba(24, 33, 47, 0.08)',
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
}

export const theme = buildTheme('claro');
