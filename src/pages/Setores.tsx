import { useMemo, useState } from 'react';
import { Box, Button, IconButton, Paper, TextField, Typography } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PageShell from '../components/PageShell';
import { type SectorOption, newId, readSectors, writeSectors } from '../services/localStore';

export default function Setores() {
  const [sectors, setSectors] = useState<SectorOption[]>(() => readSectors());
  const [clientOption, setClientOption] = useState('1');

  const selectedSector = useMemo(
    () => sectors.find((sector) => sector.option.trim() === clientOption.trim()),
    [clientOption, sectors],
  );

  function persistSectors(nextSectors: SectorOption[]) {
    setSectors(nextSectors);
    writeSectors(nextSectors);
  }

  function addSector() {
    persistSectors([
      ...sectors,
      {
        id: newId('sector'),
        option: String(sectors.length + 1),
        name: 'Novo setor',
        summary: 'Descreva quando este setor deve ser usado.',
        response: 'Mensagem enviada ao cliente quando esta opção for escolhida.',
      },
    ]);
  }

  function updateSector(id: string, patch: Partial<SectorOption>) {
    persistSectors(sectors.map((sector) => (sector.id === id ? { ...sector, ...patch } : sector)));
  }

  function removeSector(id: string) {
    persistSectors(sectors.filter((sector) => sector.id !== id));
  }

  const menuText = sectors.map((sector) => `${sector.option} - ${sector.name}`).join('\n');

  return (
    <PageShell
      title="Setores"
      subtitle="Cadastre opções de atendimento que o cliente poderá escolher ao entrar em contato."
      icon={<BusinessIcon />}
      action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={addSector}>
          Novo setor
        </Button>
      }
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1fr 420px' }, gap: 2.5 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
          <Typography variant="h6">Opções cadastradas</Typography>
          <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
            {sectors.map((sector) => (
              <Box key={sector.id} sx={{ p: 2, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)', background: '#f8fafc' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '90px 1fr auto' }, gap: 1.5 }}>
                  <TextField label="Opção" value={sector.option} onChange={(e) => updateSector(sector.id, { option: e.target.value })} />
                  <TextField label="Setor" value={sector.name} onChange={(e) => updateSector(sector.id, { name: e.target.value })} />
                  <IconButton color="error" onClick={() => removeSector(sector.id)} aria-label="Excluir setor">
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <TextField
                  label="Resumo interno"
                  value={sector.summary}
                  onChange={(e) => updateSector(sector.id, { summary: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ mt: 1.5 }}
                />
                <TextField
                  label="Resposta para o cliente"
                  value={sector.response}
                  onChange={(e) => updateSector(sector.id, { response: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ mt: 1.5 }}
                />
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
          <Typography variant="h6">Prévia do atendimento</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Mensagem que pode ser usada quando o cliente chamar pelo WhatsApp, chat ou formulário.
          </Typography>
          <Box sx={{ p: 2, borderRadius: '8px', background: '#eef7f5', mt: 2, whiteSpace: 'pre-line' }}>
            Olá! Escolha uma opção de atendimento:
            {'\n'}
            {menuText || 'Nenhum setor cadastrado.'}
          </Box>
          <TextField
            label="Cliente digitou"
            value={clientOption}
            onChange={(e) => setClientOption(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
          <Box sx={{ p: 2, borderRadius: '8px', background: '#fff', border: '1px solid rgba(24, 33, 47, 0.08)', mt: 2 }}>
            <Typography sx={{ fontWeight: 900 }}>{selectedSector ? selectedSector.name : 'Opção não encontrada'}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {selectedSector ? selectedSector.response : 'Peça para o cliente escolher uma das opções cadastradas.'}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </PageShell>
  );
}
