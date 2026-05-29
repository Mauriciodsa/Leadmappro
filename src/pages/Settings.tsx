import { useEffect, useState } from 'react';
import { Avatar, Box, Button, Card, CardContent, Divider, Paper, TextField, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { supabase } from '../services/supabase';
import PageShell from '../components/PageShell';
import { readStore, writeStore } from '../services/localStore';

type ProfileForm = {
  name: string;
  phone: string;
  company_role: string;
  photo_url: string;
};

const emptyProfile: ProfileForm = { name: '', phone: '', company_role: '', photo_url: '' };

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Settings() {
  const [user, setUser] = useState({ email: '', id: '' });
  const [formData, setFormData] = useState<ProfileForm>(() => readStore('leadmap:user-profile', emptyProfile));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (currentUser) {
        setUser({ email: currentUser.email || '', id: currentUser.id });
      }
    });
  }, []);

  async function handlePhotoChange(file?: File) {
    if (!file) return;
    const photoUrl = await fileToDataUrl(file);
    setFormData((current) => ({ ...current, photo_url: photoUrl }));
  }

  const handleSave = async () => {
    setSaving(true);
    writeStore('leadmap:user-profile', formData);
    setSaving(false);
  };

  return (
    <PageShell
      title="Minhas configurações"
      subtitle="Dados do usuário, foto de perfil, contato e preferências básicas de acesso."
      icon={<AccountCircleIcon />}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' }, gap: 2.5 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
          <Typography variant="h6">Perfil do usuário</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mt: 2 }}>
            <TextField
              label="Nome completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Cargo/Função"
              value={formData.company_role}
              onChange={(e) => setFormData({ ...formData, company_role: e.target.value })}
              fullWidth
            />
            <TextField label="Telefone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} fullWidth />
            <TextField label="E-mail" type="email" value={user.email} fullWidth disabled />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" component="label" startIcon={<PhotoCameraIcon />}>
              Adicionar foto do usuário
              <input hidden accept="image/*" type="file" onChange={(e) => handlePhotoChange(e.target.files?.[0])} />
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />
          <Typography variant="h6">Segurança</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75, mb: 2 }}>
            A proteção real das mensagens deve ser feita com RLS no Supabase. A interface administrativa usa código de acesso.
          </Typography>
          <Button variant="outlined" color="warning">
            Alterar senha
          </Button>

          <Box sx={{ mt: 3 }}>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
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
                <Typography sx={{ fontWeight: 900 }}>{formData.name || 'Usuário'}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', wordBreak: 'break-word' }}>
                  {user.email}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </PageShell>
  );
}
