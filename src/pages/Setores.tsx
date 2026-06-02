import { useMemo, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, TextField, Typography } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PageShell from '../components/PageShell';
import { type SectorOption, newId, readSectors, writeSectors } from '../services/localStore';
import { validateAdminCode } from '../services/security';

export default function Setores() {
  const [sectors, setSectors] = useState<SectorOption[]>(() => readSectors());
  const [clientOption, setClientOption] = useState('1');
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [unlockError, setUnlockError] = useState('');

  const selectedSector = useMemo(
    () => sectors.find((sector) => sector.option.trim() === clientOption.trim()),
    [clientOption, sectors],
  );

  function persistSectors(nextSectors: SectorOption[]) {
    if (!adminUnlocked) return;
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
        response: 'Mensagem enviada ao cliente quando esta opcao for escolhida.',
      },
    ]);
  }

  function updateSector(id: string, patch: Partial<SectorOption>) {
    persistSectors(sectors.map((sector) => (sector.id === id ? { ...sector, ...patch } : sector)));
  }

  function removeSector(id: string) {
    persistSectors(sectors.filter((sector) => sector.id !== id));
  }

  async function handleUnlock() {
    const valid = await validateAdminCode(adminCode);
    if (!valid) {
      setUnlockError('Codigo de administrador invalido.');
      return;
    }
    setAdminUnlocked(true);
    setUnlockOpen(false);
    setAdminCode('');
    setUnlockError('');
  }

  const menuText = sectors.map((sector) => `${sector.option} - ${sector.name}`).join('\n');

  return (
    <PageShell
      title="Setores"
      subtitle="Cadastre opcoes de atendimento que o cliente podera escolher ao entrar em contato."
      icon={<BusinessIcon />}
      action={
        adminUnlocked ? (
          <Button variant="contained" startIcon={<AddIcon />} onClick={addSector}>
            Novo setor
          </Button>
        ) : (
          <Button variant="contained" startIcon={<LockIcon />} onClick={() => setUnlockOpen(true)}>
            Desbloquear edicao
          </Button>
        )
      }
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1fr 420px' }, gap: 2.5 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {adminUnlocked ? <LockOpenIcon color="success" /> : <LockIcon color="warning" />} Opcoes cadastradas
          </Typography>
          {!adminUnlocked && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Alteracoes em setores, funcoes e lembretes de setor exigem codigo de administrador.
            </Alert>
          )}
          <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
            {sectors.map((sector) => (
              <Box key={sector.id} sx={{ p: 2, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)', background: '#f8fafc' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '90px 1fr auto' }, gap: 1.5 }}>
                  <TextField disabled={!adminUnlocked} label="Opcao" value={sector.option} onChange={(e) => updateSector(sector.id, { option: e.target.value })} />
                  <TextField disabled={!adminUnlocked} label="Setor" value={sector.name} onChange={(e) => updateSector(sector.id, { name: e.target.value })} />
                  <IconButton disabled={!adminUnlocked} color="error" onClick={() => removeSector(sector.id)} aria-label="Excluir setor">
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <TextField
                  disabled={!adminUnlocked}
                  label="Funcao / resumo interno"
                  value={sector.summary}
                  onChange={(e) => updateSector(sector.id, { summary: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ mt: 1.5 }}
                />
                <TextField
                  disabled={!adminUnlocked}
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
          <Typography variant="h6">Previa do atendimento</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Mensagem que pode ser usada quando o cliente chamar pelo WhatsApp, chat ou formulario.
          </Typography>
          <Box sx={{ p: 2, borderRadius: '8px', background: '#eef7f5', mt: 2, whiteSpace: 'pre-line' }}>
            Ola! Escolha uma opcao de atendimento:
            {'\n'}
            {menuText || 'Nenhum setor cadastrado.'}
          </Box>
          <TextField label="Cliente digitou" value={clientOption} onChange={(e) => setClientOption(e.target.value)} fullWidth sx={{ mt: 2 }} />
          <Box sx={{ p: 2, borderRadius: '8px', background: '#fff', border: '1px solid rgba(24, 33, 47, 0.08)', mt: 2 }}>
            <Typography sx={{ fontWeight: 900 }}>{selectedSector ? selectedSector.name : 'Opcao nao encontrada'}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {selectedSector ? selectedSector.response : 'Peca para o cliente escolher uma das opcoes cadastradas.'}
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Dialog open={unlockOpen} onClose={() => setUnlockOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Codigo de administrador</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Informe o codigo definido na aba Empresa para liberar alteracoes administrativas.
          </Typography>
          <TextField
            label="Codigo"
            type="password"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            fullWidth
            autoFocus
          />
          {unlockError && <Alert severity="error">{unlockError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setUnlockOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleUnlock}>
            Desbloquear
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}
