import { useEffect, useState } from 'react';
import { Alert, Avatar, Box, Button, Card, CardContent, Divider, MenuItem, Paper, Snackbar, TextField, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '../services/supabase';
import PageShell from '../components/PageShell';
import { readStore, writeStore } from '../services/localStore';
import { imageFileToDataUrl } from '../services/imageUpload';
import { readThemeMode, themeLabels, themeModes, writeThemeMode, type LeadMapThemeMode } from '../theme';

type ProfileForm = {
  name: string;
  phone: string;
  company_role: string;
  photo_url: string;
};

const emptyProfile: ProfileForm = { name: '', phone: '', company_role: '', photo_url: '' };

export default function Settings() {
  const [user, setUser] = useState({ email: '', id: '' });
  const [formData, setFormData] = useState<ProfileForm>(() => readStore('leadmap:user-profile', emptyProfile));
  const [themeMode, setThemeMode] = useState<LeadMapThemeMode>(() => readThemeMode());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (currentUser) {
        setUser({ email: currentUser.email || '', id: currentUser.id });
      }
    });
  }, []);

  async function handlePhotoChange(file?: File) {
    if (!file) return;

    try {
      const photoUrl = await imageFileToDataUrl(file);
      setFormData((current) => ({ ...current, photo_url: photoUrl }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Nao foi possivel carregar a imagem.');
    }
  }

  const handleSave = async () => {
    setSaving(true);
    writeStore('leadmap:user-profile', formData);
    writeThemeMode(themeMode);
    setSaving(false);
    setMessage('Alteracoes salvas com sucesso.');
  };

  return (
    <PageShell
      title="Minhas configuracoes"
      subtitle="Dados do usuario, foto de perfil, contato e preferencias basicas de acesso."
      icon={<AccountCircleIcon />}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' }, gap: 2.5 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
          <Typography variant="h6">Perfil do usuario</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mt: 2 }}>
            <TextField
              label="Nome completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Cargo/Funcao"
              value={formData.company_role}
              onChange={(e) => setFormData({ ...formData, company_role: e.target.value })}
              fullWidth
            />
            <TextField label="Telefone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} fullWidth />
            <TextField label="E-mail" type="email" value={user.email} fullWidth disabled />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
            <Button variant="outlined" component="label" startIcon={<PhotoCameraIcon />}>
              Adicionar foto do usuario
              <input hidden accept="image/*" type="file" onChange={(e) => handlePhotoChange(e.target.files?.[0])} />
            </Button>
            {formData.photo_url && (
              <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setFormData({ ...formData, photo_url: '' })}>
                Remover foto
              </Button>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />
          <Typography variant="h6">Aparencia</Typography>
          <TextField
            select
            label="Tema do sistema"
            value={themeMode}
            onChange={(e) => {
              const nextTheme = e.target.value as LeadMapThemeMode;
              setThemeMode(nextTheme);
              writeThemeMode(nextTheme);
            }}
            fullWidth
            sx={{ mt: 2 }}
          >
            {themeModes.map((mode) => (
              <MenuItem key={mode} value={mode}>
                {themeLabels[mode]}
              </MenuItem>
            ))}
          </TextField>

          <Divider sx={{ my: 3 }} />
          <Typography variant="h6">Seguranca</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75, mb: 2 }}>
            A protecao real das mensagens deve ser feita com RLS no Supabase. A interface administrativa usa codigo de acesso.
          </Typography>
          <Button variant="outlined" color="warning">
            Alterar senha
          </Button>

          <Box sx={{ mt: 3 }}>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar alteracoes'}
            </Button>
          </Box>
        </Paper>

        <Card sx={{ borderRadius: '8px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
              <Avatar
                src={formData.photo_url || undefined}
                sx={{ width: 104, height: 104, background: 'linear-gradient(135deg, #007f73 0%, #2f5f98 100%)', fontSize: 34 }}
              >
                {(formData.name || user.email || 'U').charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 900 }}>{formData.name || 'Usuario'}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', wordBreak: 'break-word' }}>
                  {user.email}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Snackbar open={!!message} autoHideDuration={4000} onClose={() => setMessage('')}>
        <Alert severity={message.startsWith('Nao') ? 'warning' : 'success'}>{message}</Alert>
      </Snackbar>
    </PageShell>
  );
}
