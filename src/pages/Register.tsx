import { useState } from 'react';
import { Alert, Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { supabase } from '../services/supabase';
import Logo from '../components/Logo';

type AccountType = 'empresa' | 'usuario';

export default function Register({ onRegister }: { onRegister: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('empresa');
  const [companyName, setCompanyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (accountType === 'empresa' && !companyName.trim()) {
      setLoading(false);
      setError('Informe o nome da empresa para criar a conta principal.');
      return;
    }

    if (accountType === 'usuario' && !inviteCode.trim()) {
      setLoading(false);
      setError('Informe o codigo ou link de convite enviado pela empresa.');
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          account_type: accountType,
          company_name: companyName.trim(),
          invite_code: inviteCode.trim(),
        },
      },
    });

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
          maxWidth: 520,
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
          A primeira conta deve ser da empresa. Usuarios internos entram por convite da empresa.
        </Typography>

        <Box component="form" onSubmit={handleRegister} sx={{ display: 'grid', gap: 2, mt: 3 }}>
          <TextField select label="Tipo de cadastro" value={accountType} onChange={(e) => setAccountType(e.target.value as AccountType)} fullWidth>
            <MenuItem value="empresa">Empresa / administrador</MenuItem>
            <MenuItem value="usuario">Usuario / funcionario convidado</MenuItem>
          </TextField>
          {accountType === 'empresa' ? (
            <TextField
              label="Nome da empresa"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              fullWidth
              required
            />
          ) : (
            <TextField
              label="Codigo ou link de convite"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              fullWidth
              required
              placeholder="Cole o convite enviado pela empresa"
            />
          )}
          <TextField label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
          <TextField label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth required />
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Cadastro realizado. Verifique seu e-mail e depois faca login.</Alert>}
          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </Box>
        <Button onClick={onRegister} sx={{ mt: 2 }} fullWidth>
          Ja tem conta? Entrar
        </Button>
      </Paper>
    </Box>
  );
}
