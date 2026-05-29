import { useRef, useState } from 'react';
import { Alert, Box, Button, Paper, Typography } from '@mui/material';
import BackupIcon from '@mui/icons-material/Backup';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import PageShell from '../components/PageShell';

const backupKeys = [
  'leadmap:chat-messages',
  'leadmap:clientes',
  'leadmap:products',
  'leadmap:quotes',
  'leadmap:sectors',
  'leadmap:bank-rates',
  'leadmap:company',
  'leadmap:user-profile',
  'leadmap:ai-config',
  'leadmap:ai-messages',
];

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function Backup() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState('');

  function exportBackup() {
    const data = backupKeys.reduce<Record<string, unknown>>((acc, key) => {
      const raw = localStorage.getItem(key);
      acc[key] = raw ? JSON.parse(raw) : null;
      return acc;
    }, {});
    downloadJson(`backup-leadmap-${new Date().toISOString().slice(0, 10)}.json`, {
      app: 'LeadMap Pro',
      exportedAt: new Date().toISOString(),
      data,
    });
  }

  async function importBackup(file?: File) {
    if (!file) return;
    const text = await file.text();
    const parsed = JSON.parse(text) as { data?: Record<string, unknown> };
    Object.entries(parsed.data || {}).forEach(([key, value]) => {
      if (backupKeys.includes(key) && value !== null) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    });
    setMessage('Backup importado. Recarregue a página para aplicar todos os dados.');
  }

  return (
    <PageShell title="Backup" subtitle="Exporte e importe conversas, clientes, orçamentos, catálogo, setores e taxas." icon={<BackupIcon />}>
      <Paper elevation={0} sx={{ p: 3, maxWidth: 720, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
        <Typography variant="h6">Backup local</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Este backup baixa um arquivo JSON com os dados salvos no navegador. Para produção, recomendo automatizar também backups no Supabase.
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 3 }}>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={exportBackup}>
            Baixar backup
          </Button>
          <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => inputRef.current?.click()}>
            Importar backup
          </Button>
          <input ref={inputRef} hidden type="file" accept="application/json" onChange={(e) => importBackup(e.target.files?.[0])} />
        </Box>
        {message && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}
      </Paper>
    </PageShell>
  );
}
