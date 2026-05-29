import { Box, Button, Card, CardContent, LinearProgress, Paper, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import ChatIcon from '@mui/icons-material/Chat';
import MapIcon from '@mui/icons-material/Map';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';

const stats = [
  { title: 'Clientes', count: '0', icon: <PeopleIcon />, color: '#007f73', path: '/clientes' },
  { title: 'Setores', count: '0', icon: <BusinessIcon />, color: '#2f5f98', path: '/setores' },
  { title: 'Mensagens', count: '0', icon: <ChatIcon />, color: '#9a6b22', path: '/chat' },
  { title: 'Rotas', count: '0', icon: <MapIcon />, color: '#4c6fff', path: '/mapa' },
];

const actions = [
  { title: 'Cadastrar cliente', description: 'Registre contatos, telefone e e-mail.', icon: <PeopleIcon />, path: '/clientes' },
  { title: 'Organizar setores', description: 'Prepare filas de atendimento e áreas internas.', icon: <BusinessIcon />, path: '/setores' },
  { title: 'Abrir WhatsApp', description: 'Inicie conversas comerciais com agilidade.', icon: <WhatsAppIcon />, path: '/whatsapp' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <PageShell
      title="Dashboard"
      subtitle="Visão geral do CRM, com atalhos para os fluxos principais de vendas e atendimento."
      icon={<TrendingUpIcon />}
      action={
        <Button variant="contained" startIcon={<PeopleIcon />} onClick={() => navigate('/clientes')}>
          Novo cliente
        </Button>
      }
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          mb: 3,
          borderRadius: '8px',
          color: '#fff',
          background: 'linear-gradient(135deg, #007f73 0%, #2f5f98 100%)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box sx={{ maxWidth: 760, position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" sx={{ color: '#fff', fontSize: { xs: 30, md: 42 }, lineHeight: 1.05 }}>
            LeadMap Pro pronto para operação
          </Typography>
          <Typography sx={{ mt: 1.5, color: 'rgba(255,255,255,0.82)' }}>
            Comece cadastrando clientes, revisando os dados da empresa e organizando os canais de atendimento.
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        {stats.map((stat) => (
          <Card key={stat.title} onClick={() => navigate(stat.path)} sx={{ cursor: 'pointer', borderRadius: '8px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" sx={{ color: stat.color, mt: 1 }}>
                    {stat.count}
                  </Typography>
                </Box>
                <Box sx={{ color: stat.color, opacity: 0.25 }}>{stat.icon}</Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={0}
                sx={{ mt: 2.5, height: 6, borderRadius: 999, background: `${stat.color}22`, '& .MuiLinearProgress-bar': { background: stat.color } }}
              />
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.25fr 0.75fr' }, gap: 2.5, mt: 3 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
          <Typography variant="h6">Ações rápidas</Typography>
          <Box sx={{ display: 'grid', gap: 1.5, mt: 2 }}>
            {actions.map((action) => (
              <Button
                key={action.title}
                onClick={() => navigate(action.path)}
                sx={{
                  justifyContent: 'flex-start',
                  p: 2,
                  border: '1px solid rgba(24, 33, 47, 0.08)',
                  color: 'text.primary',
                  textAlign: 'left',
                }}
              >
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Box sx={{ color: 'primary.main', display: 'grid', placeItems: 'center' }}>{action.icon}</Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800 }}>{action.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {action.description}
                    </Typography>
                  </Box>
                </Box>
              </Button>
            ))}
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
          <Typography variant="h6">Próximos ajustes</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Configure os dados da empresa para deixar o sistema mais pronto para apresentação comercial.
          </Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/company')}>
            Ajustar empresa
          </Button>
        </Paper>
      </Box>
    </PageShell>
  );
}
