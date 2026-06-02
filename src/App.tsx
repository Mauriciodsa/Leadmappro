import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, CssBaseline, IconButton, Paper, Stack, ThemeProvider, Tooltip, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import MapIcon from '@mui/icons-material/Map';
import SettingsIcon from '@mui/icons-material/Settings';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CalculateIcon from '@mui/icons-material/Calculate';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import InventoryIcon from '@mui/icons-material/Inventory';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LaunchIcon from '@mui/icons-material/Launch';
import { isSupabaseConfigured, missingSupabaseEnv, supabase } from './services/supabase';
import { readCompanyProfile } from './services/localStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Setores from './pages/Setores';
import Chat from './pages/Chat';
import Mapa from './pages/Mapa';
import Whatsapp from './pages/Whatsapp';
import Settings from './pages/Settings';
import CompanySettings from './pages/CompanySettings';
import Financeiro from './pages/Financeiro';
import Catalogo from './pages/Catalogo';
import Orcamentos from './pages/Orcamentos';
import Backup from './pages/Backup';
import EmpresaIA from './pages/EmpresaIA';
import Sidebar, { drawerWidth } from './components/Sidebar';
import { theme } from './theme';

const mobileMenu = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'Clientes', icon: <GroupIcon />, path: '/clientes' },
  { label: 'Mapa', icon: <MapIcon />, path: '/mapa' },
  { label: 'WhatsApp', icon: <WhatsAppIcon />, path: '/whatsapp' },
  { label: 'Catálogo', icon: <InventoryIcon />, path: '/catalogo' },
  { label: 'Orçamentos', icon: <RequestQuoteIcon />, path: '/orcamentos' },
  { label: 'Financeiro', icon: <CalculateIcon />, path: '/financeiro' },
  { label: 'IA', icon: <SmartToyIcon />, path: '/ia' },
  { label: 'Ajustes', icon: <SettingsIcon />, path: '/settings' },
];

function MainApp() {
  const [logged, setLogged] = useState<boolean | null>(() => (isSupabaseConfigured ? null : false));
  const [salesUrl, setSalesUrl] = useState(() => readCompanyProfile().sales_url || import.meta.env.VITE_SALES_URL || '');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const updateSalesUrl = () => setSalesUrl(readCompanyProfile().sales_url || import.meta.env.VITE_SALES_URL || '');
    window.addEventListener('storage', updateSalesUrl);
    window.addEventListener('focus', updateSalesUrl);
    return () => {
      window.removeEventListener('storage', updateSalesUrl);
      window.removeEventListener('focus', updateSalesUrl);
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setLogged(!!session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLogged(!!session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (logged === null) {
    return (
      <Box sx={{ minHeight: '100svh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <Box sx={{ minHeight: '100svh', display: 'grid', placeItems: 'center', px: 2 }}>
        <Stack
          spacing={2}
          sx={{
            width: '100%',
            maxWidth: 520,
            p: 3,
            border: '1px solid rgba(24, 33, 47, 0.12)',
            borderRadius: '8px',
            background: '#ffffff',
          }}
        >
          <Typography variant="h5" component="h1">
            Configuracao do Supabase pendente
          </Typography>
          <Typography color="text.secondary">
            Adicione estas variaveis de ambiente na Vercel e publique novamente:
          </Typography>
          <Box component="pre" sx={{ m: 0, p: 2, borderRadius: '8px', background: '#f4f7f6', overflowX: 'auto' }}>
            {missingSupabaseEnv.join('\n')}
          </Box>
          <Button variant="contained" href="https://vercel.com/dashboard" target="_blank" rel="noreferrer">
            Abrir Vercel
          </Button>
        </Stack>
      </Box>
    );
  }

  if (!logged) return <Login onLogin={() => setLogged(true)} />;

  async function handleLogout() {
    await supabase.auth.signOut();
    setLogged(false);
    navigate('/');
  }

  return (
    <Box sx={{ minHeight: '100svh', display: 'flex', background: 'transparent' }}>
      <Sidebar currentPath={location.pathname} onNavigate={navigate} onLogout={handleLogout} />
      <Box
        component="main"
        sx={{
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: 0, md: `${drawerWidth}px` },
          minHeight: '100svh',
          pb: { xs: 9, md: 0 },
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/setores" element={<Setores />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/mapa" element={<Mapa />} />
          <Route path="/whatsapp" element={<Whatsapp />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/orcamentos" element={<Orcamentos />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/ia" element={<EmpresaIA />} />
          <Route path="/backup" element={<Backup />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/company" element={<CompanySettings />} />
        </Routes>
      </Box>

      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          left: 12,
          right: 12,
          bottom: 12,
          zIndex: 1200,
          display: { xs: 'flex', md: 'none' },
          justifyContent: 'flex-start',
          gap: 0.5,
          overflowX: 'auto',
          p: 0.75,
          borderRadius: '8px',
          border: '1px solid rgba(24, 33, 47, 0.08)',
        }}
      >
        {mobileMenu.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Tooltip title={item.label} key={item.path}>
              <IconButton
                color={active ? 'primary' : 'default'}
                onClick={() => navigate(item.path)}
                sx={{
                  width: 46,
                  minWidth: 46,
                  height: 46,
                  borderRadius: '8px',
                  background: active ? 'rgba(0, 127, 115, 0.12)' : 'transparent',
                }}
              >
                {item.icon}
              </IconButton>
            </Tooltip>
          );
        })}
        {salesUrl && (
          <Tooltip title="Pagina de vendas" key="sales-link">
            <IconButton
              color="secondary"
              component="a"
              href={salesUrl}
              target="_blank"
              rel="noreferrer"
              sx={{
                width: 46,
                minWidth: 46,
                height: 46,
                borderRadius: '8px',
              }}
            >
              <LaunchIcon />
            </IconButton>
          </Tooltip>
        )}
      </Paper>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <MainApp />
      </Router>
    </ThemeProvider>
  );
}

export default App;
