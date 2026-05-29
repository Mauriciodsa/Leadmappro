import { useState } from 'react';
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { supabase } from '../services/supabase';
import Logo from '../components/Logo';

export default function Register({ onRegister }: { onRegister: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else setSuccess(true);
  }

  return (
    <Box sx={{ minHeight: '100svh', display: 'grid', placeItems: 'center', p: 2 }}>
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
        <Box sx={{ mb: 3 }}>
          <Logo />
        </Box>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddIcon color="primary" /> Criar conta
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Cadastre seu acesso ao LeadMap Pro.
        </Typography>

        <Box component="form" onSubmit={handleRegister} sx={{ display: 'grid', gap: 2, mt: 3 }}>
          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Cadastro realizado. Verifique seu e-mail.</Alert>}
          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </Box>
        <Button onClick={onRegister} sx={{ mt: 2 }} fullWidth>
          Já tem conta? Entrar
        </Button>
      </Paper>
    </Box>
  );
}
