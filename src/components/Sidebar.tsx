import { useEffect, useState, type ReactElement } from 'react';
import { Box, Button, Divider, Drawer, List, ListItemButton, ListItemIcon, Toolbar, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import ChatIcon from '@mui/icons-material/Chat';
import BusinessIcon from '@mui/icons-material/Business';
import MapIcon from '@mui/icons-material/Map';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CalculateIcon from '@mui/icons-material/Calculate';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import InventoryIcon from '@mui/icons-material/Inventory';
import BackupIcon from '@mui/icons-material/Backup';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SettingsIcon from '@mui/icons-material/Settings';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LogoutIcon from '@mui/icons-material/Logout';
import LaunchIcon from '@mui/icons-material/Launch';
import Logo from './Logo';
import { readCompanyProfile } from '../services/localStore';

export const drawerWidth = 264;

const mainMenu = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Clientes', icon: <GroupIcon />, path: '/clientes' },
  { text: 'Setores', icon: <BusinessIcon />, path: '/setores' },
  { text: 'Chat', icon: <ChatIcon />, path: '/chat' },
  { text: 'Mapa', icon: <MapIcon />, path: '/mapa' },
  { text: 'WhatsApp', icon: <WhatsAppIcon />, path: '/whatsapp' },
  { text: 'Catálogo', icon: <InventoryIcon />, path: '/catalogo' },
  { text: 'Orçamentos', icon: <RequestQuoteIcon />, path: '/orcamentos' },
  { text: 'Financeiro', icon: <CalculateIcon />, path: '/financeiro' },
  { text: 'IA da empresa', icon: <SmartToyIcon />, path: '/ia' },
  { text: 'Backup', icon: <BackupIcon />, path: '/backup' },
];

const settingsMenu = [
  { text: 'Minhas configs', icon: <SettingsIcon />, path: '/settings' },
  { text: 'Empresa', icon: <StorefrontIcon />, path: '/company' },
];

type SidebarProps = {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
};

export default function Sidebar({ currentPath, onNavigate, onLogout }: SidebarProps) {
  const [salesUrl, setSalesUrl] = useState(() => readCompanyProfile().sales_url || import.meta.env.VITE_SALES_URL || '');

  useEffect(() => {
    const updateSalesUrl = () => setSalesUrl(readCompanyProfile().sales_url || import.meta.env.VITE_SALES_URL || '');
    window.addEventListener('storage', updateSalesUrl);
    window.addEventListener('focus', updateSalesUrl);
    return () => {
      window.removeEventListener('storage', updateSalesUrl);
      window.removeEventListener('focus', updateSalesUrl);
    };
  }, []);

  const renderItem = (item: { text: string; icon: ReactElement; path: string }) => {
    const active = currentPath === item.path;

    return (
      <ListItemButton
        key={item.text}
        selected={active}
        onClick={() => onNavigate(item.path)}
        sx={{
          borderRadius: '8px',
          mb: 0.5,
          py: 0.8,
          color: active ? 'primary.dark' : 'text.secondary',
          transition: 'background 180ms ease, color 180ms ease, transform 180ms ease',
          '&.Mui-selected': {
            color: 'primary.dark',
            background: 'rgba(0, 127, 115, 0.12)',
          },
          '&:hover': {
            background: active ? 'rgba(0, 127, 115, 0.14)' : 'rgba(47, 95, 152, 0.08)',
            transform: 'translateX(3px)',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{item.icon}</ListItemIcon>
        <Typography sx={{ fontSize: 14, fontWeight: active ? 800 : 650 }}>{item.text}</Typography>
      </ListItemButton>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(24, 33, 47, 0.08)',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(16px)',
        },
      }}
    >
      <Toolbar sx={{ minHeight: 78, px: 2.5 }}>
        <Logo />
      </Toolbar>

      <Box sx={{ px: 1.5, pb: 2, display: 'flex', flexDirection: 'column', height: 'calc(100% - 78px)', overflow: 'auto' }}>
        <Typography variant="caption" sx={{ px: 1, mb: 1, color: 'text.secondary', fontWeight: 800 }}>
          PRINCIPAL
        </Typography>
        <List sx={{ p: 0 }}>{mainMenu.map(renderItem)}</List>

        <Button
          fullWidth
          variant="contained"
          color="secondary"
          startIcon={<LaunchIcon />}
          href={salesUrl || undefined}
          target="_blank"
          rel="noreferrer"
          disabled={!salesUrl}
          sx={{ mt: 1.5 }}
        >
          Pagina de vendas
        </Button>

        <Divider sx={{ my: 2 }} />

        <Typography variant="caption" sx={{ px: 1, mb: 1, color: 'text.secondary', fontWeight: 800 }}>
          AJUSTES
        </Typography>
        <List sx={{ p: 0 }}>{settingsMenu.map(renderItem)}</List>

        <Box sx={{ mt: 2, p: 1.5, borderRadius: '8px', background: 'rgba(47, 95, 152, 0.08)' }}>
          <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Acesso protegido
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
            Todo usuário precisa entrar ou criar cadastro.
          </Typography>
          <Button fullWidth variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={onLogout} sx={{ mt: 1.5 }}>
            Sair
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
