import { useMemo, useState } from 'react';
import { Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PageShell from '../components/PageShell';
import { readSectors } from '../services/localStore';

function onlyNumbers(value: string) {
  return value.replace(/\D/g, '');
}

export default function Whatsapp() {
  const sectors = useMemo(() => readSectors(), []);
  const [phone, setPhone] = useState('');
  const [sectorId, setSectorId] = useState(sectors[0]?.id || '');
  const selectedSector = sectors.find((sector) => sector.id === sectorId);
  const menuText = sectors.map((sector) => `${sector.option} - ${sector.name}`).join('\n');
  const message = `Olá! Escolha uma opção de atendimento:\n${menuText}\n\n${selectedSector ? selectedSector.response : ''}`;
  const whatsappUrl = `https://wa.me/${onlyNumbers(phone)}?text=${encodeURIComponent(message)}`;

  return (
    <PageShell title="WhatsApp" subtitle="Inicie conversas comerciais com opções de setores já cadastradas." icon={<WhatsAppIcon />}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 380px' }, gap: 3, alignItems: 'start' }}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField label="Telefone do cliente" placeholder="5511999999999" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
            <TextField select label="Setor sugerido" value={sectorId} onChange={(e) => setSectorId(e.target.value)} fullWidth>
              {sectors.map((sector) => (
                <MenuItem key={sector.id} value={sector.id}>
                  {sector.option} - {sector.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Mensagem inicial" value={message} fullWidth multiline rows={7} />
            <Button variant="contained" color="success" startIcon={<WhatsAppIcon />} href={whatsappUrl} target="_blank">
              Abrir WhatsApp
            </Button>
          </Box>
          <Box sx={{ p: 2.5, borderRadius: '8px', background: '#effaf3', border: '1px solid rgba(31, 157, 85, 0.18)' }}>
            <Typography sx={{ fontWeight: 900 }}>Fluxo profissional</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              As opções vêm da aba Setores. Você pode cadastrar resumo e resposta de cada área para padronizar o atendimento.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </PageShell>
  );
}
