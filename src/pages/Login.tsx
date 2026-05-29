import { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Divider, Paper, TextField, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { supabase } from '../services/supabase';
import Register from './Register';
import Logo from '../components/Logo';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) onLogin();
    });
  }, [onLogin]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else onLogin();
  }

  if (showRegister) return <Register onRegister={() => setShowRegister(false)} />;

  return (
    <Box
      sx={{
        minHeight: '100svh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
        background:
          'linear-gradient(135deg, rgba(0, 127, 115, 0.96) 0%, rgba(47, 95, 152, 0.96) 100%)',
      }}
    >
      <Box
        sx={{
          color: '#fff',
          p: { xs: 3, md: 6 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: { xs: 300, md: '100svh' },
        }}
      >
        <Logo size="large" light />
        <Box sx={{ maxWidth: 620, py: { xs: 5, md: 8 } }}>
          <Typography variant="h4" sx={{ fontSize: { xs: 34, md: 54 }, lineHeight: 1.02, color: '#fff' }}>
            CRM pronto para vender, atender e acompanhar cada lead.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, color: 'rgba(255,255,255,0.82)', maxWidth: 560 }}>
            Uma base simples para gerenciar clientes, setores, conversas, rotas e dados da empresa com visual profissional.
          </Typography>
          <Box sx={{ display: 'grid', gap: 1.5, mt: 4 }}>
            {['Clientes centralizados', 'Atendimento por WhatsApp', 'Mapa para organizar visitas'].map((item) => (
              <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 20, color: '#b8fff2' }} />
                <Typography>{item}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.68)' }}>
          LeadMap Pro - 2026
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', placeItems: 'center', p: { xs: 2, md: 6 }, background: '#eef3f7' }}>
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 460,
            p: { xs: 3, sm: 4 },
            borderRadius: '8px',
            border: '1px solid rgba(24, 33, 47, 0.08)',
            boxShadow: '0 28px 72px rgba(24, 33, 47, 0.14)',
          }}
        >
          <Typography variant="h5">Entrar na conta</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Acesse o painel comercial do LeadMap Pro.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Box component="form" onSubmit={handleLogin} sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              placeholder="seu@email.com"
            />
            <TextField
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              placeholder="Digite sua senha"
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Button type="submit" variant="contained" size="large" endIcon={!loading && <ArrowForwardIcon />} disabled={loading}>
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Entrar'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Button onClick={() => setShowRegister(true)} fullWidth variant="outlined" size="large">
            Criar nova conta
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}
