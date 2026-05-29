import { useEffect, useState } from 'react';
import { Alert, Avatar, Box, Button, Card, CardContent, CircularProgress, Paper, Snackbar, TextField, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import BusinessIcon from '@mui/icons-material/Business';
import KeyIcon from '@mui/icons-material/Key';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '../services/supabase';
import PageShell from '../components/PageShell';
import Logo from '../components/Logo';
import { emptyCompanyProfile, readCompanyProfile, writeCompanyProfile, type CompanyProfile } from '../services/localStore';
import { saveAdminCode } from '../services/security';
import { imageFileToDataUrl } from '../services/imageUpload';

interface CompanySettingsData extends CompanyProfile {
  id?: string;
}

const emptyCompany: CompanySettingsData = {
  ...emptyCompanyProfile,
};

export default function CompanySettings() {
  const [company, setCompany] = useState<CompanySettingsData>(() => ({ ...emptyCompany, ...readCompanyProfile() }));
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadCompanySettings() {
      const { data } = await supabase.from('empresa').select('*').limit(1).single();
      if (!active) return;
      if (data) setCompany({ ...emptyCompany, ...readCompanyProfile(), ...data });
      setLoading(false);
    }

    loadCompanySettings();
    return () => {
      active = false;
    };
  }, []);

  async function handleLogoChange(file?: File) {
    if (!file) return;

    try {
      const logoUrl = await imageFileToDataUrl(file);
      setCompany((current) => ({ ...current, logo_url: logoUrl }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Nao foi possivel carregar a imagem.');
    }
  }

  async function handleSave() {
    setSaving(true);
    writeCompanyProfile(company);
    if (adminCode.trim()) {
      await saveAdminCode(adminCode);
    }

    const payload = { ...company };
    const { error } = company.id
      ? await supabase.from('empresa').update(payload).eq('id', company.id)
      : await supabase.from('empresa').insert([payload]);

    setSaving(false);
    setMessage(error ? 'Salvo localmente. Verifique colunas/permissoes no Supabase para salvar no banco.' : 'Configuracoes salvas com sucesso.');
    setTimeout(() => setMessage(''), 4000);
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100svh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageShell
      title="Empresa"
      subtitle="Ajuste identidade, dados comerciais, logo, pagina de vendas e codigo administrativo de seguranca."
      icon={<BusinessIcon />}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 360px' }, gap: 2.5 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
          <Typography variant="h6">Dados da empresa</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mt: 2 }}>
            <TextField
              label="Nome da empresa"
              value={company.nome}
              onChange={(e) => setCompany({ ...company, nome: e.target.value })}
              fullWidth
            />
            <TextField label="CNPJ" value={company.cnpj} onChange={(e) => setCompany({ ...company, cnpj: e.target.value })} fullWidth />
            <TextField
              label="E-mail"
              type="email"
              value={company.email}
              onChange={(e) => setCompany({ ...company, email: e.target.value })}
              fullWidth
            />
            <TextField label="Telefone" value={company.telefone} onChange={(e) => setCompany({ ...company, telefone: e.target.value })} fullWidth />
            <TextField
              label="Endereco"
              value={company.endereco}
              onChange={(e) => setCompany({ ...company, endereco: e.target.value })}
              fullWidth
              multiline
              rows={3}
              sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' } }}
            />
            <TextField
              label="Link da pagina de vendas"
              value={company.sales_url}
              onChange={(e) => setCompany({ ...company, sales_url: e.target.value })}
              fullWidth
              placeholder="https://sua-pagina-de-vendas.com"
              sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' } }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
            <Button variant="outlined" component="label" startIcon={<PhotoCameraIcon />}>
              Adicionar logo/foto
              <input hidden accept="image/*" type="file" onChange={(e) => handleLogoChange(e.target.files?.[0])} />
            </Button>
            {company.logo_url && (
              <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setCompany({ ...company, logo_url: '' })}>
                Remover imagem
              </Button>
            )}
          </Box>

          <Box sx={{ mt: 3, p: 2, borderRadius: '8px', background: '#f8fafc', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <KeyIcon color="primary" /> Codigo do administrador
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75, mb: 2 }}>
              Este codigo libera a visualizacao administrativa do chat na interface. Para seguranca real, aplique as politicas RLS do arquivo SQL.
            </Typography>
            <TextField
              label="Novo codigo de acesso"
              type="password"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              fullWidth
              placeholder="Defina um codigo forte"
            />
          </Box>

          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving} sx={{ mt: 3 }}>
            {saving ? 'Salvando...' : 'Salvar configuracoes'}
          </Button>
        </Paper>

        <Card sx={{ borderRadius: '8px' }}>
          <CardContent>
            <Box sx={{ p: 2, borderRadius: '8px', background: '#f6f8fb', mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={company.logo_url || undefined} variant="rounded" sx={{ width: 70, height: 70, bgcolor: 'primary.main' }}>
                {company.nome.charAt(0) || 'L'}
              </Avatar>
              <Logo />
            </Box>
            <Typography variant="h6">Previa comercial</Typography>
            <Box sx={{ display: 'grid', gap: 1.5, mt: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                  Nome
                </Typography>
                <Typography>{company.nome || 'LeadMap Pro'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                  CNPJ
                </Typography>
                <Typography>{company.cnpj || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                  E-mail
                </Typography>
                <Typography sx={{ wordBreak: 'break-word' }}>{company.email || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                  Pagina de vendas
                </Typography>
                <Typography sx={{ wordBreak: 'break-word' }}>{company.sales_url || '-'}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Snackbar open={!!message} autoHideDuration={4000} onClose={() => setMessage('')}>
        <Alert severity={message.startsWith('Salvo localmente') || message.startsWith('Nao') ? 'warning' : 'success'}>{message}</Alert>
      </Snackbar>
    </PageShell>
  );
}
