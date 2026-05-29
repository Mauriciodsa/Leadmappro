import { useMemo, useState } from 'react';
import { Alert, Box, Button, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import LockIcon from '@mui/icons-material/Lock';
import SendIcon from '@mui/icons-material/Send';
import DownloadIcon from '@mui/icons-material/Download';
import PageShell from '../components/PageShell';
import { validateAdminCode } from '../services/security';
import { type ChatMessage, newId, readMessages, writeMessages } from '../services/localStore';

const rooms = ['Administração', 'Equipe comercial', 'Suporte'];

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function Chat() {
  const [code, setCode] = useState('');
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('leadmap:chat-unlocked') === 'true');
  const [error, setError] = useState('');
  const [room, setRoom] = useState(rooms[0]);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => readMessages());

  const roomMessages = useMemo(() => messages.filter((message) => message.room === room), [messages, room]);

  async function handleUnlock() {
    const valid = await validateAdminCode(code);
    if (!valid) {
      setError('Código inválido.');
      return;
    }
    sessionStorage.setItem('leadmap:chat-unlocked', 'true');
    setUnlocked(true);
    setError('');
  }

  function persistMessages(nextMessages: ChatMessage[]) {
    setMessages(nextMessages);
    writeMessages(nextMessages);
  }

  function sendMessage() {
    if (!draft.trim()) return;
    const message: ChatMessage = {
      id: newId('msg'),
      room,
      author: 'Você',
      body: draft.trim(),
      direction: 'sent',
      createdAt: new Date().toISOString(),
    };
    persistMessages([...messages, message]);
    setDraft('');
  }

  return (
    <PageShell
      title="Chat interno"
      subtitle="Conversa interna em estilo WhatsApp, com backup local exportável."
      icon={<ChatIcon />}
      action={
        unlocked && (
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => downloadJson('backup-conversas-leadmap.json', messages)}>
            Backup das conversas
          </Button>
        )
      }
    >
      {!unlocked ? (
        <Paper elevation={0} sx={{ p: 3, maxWidth: 540, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
          <LockIcon color="primary" sx={{ fontSize: 38 }} />
          <Typography variant="h6" sx={{ mt: 1 }}>
            Acesso protegido
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, mb: 2 }}>
            Todo acesso exige login. Para abrir o chat administrativo, digite o código configurado na empresa.
          </Typography>
          <TextField
            label="Código administrativo"
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            fullWidth
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleUnlock();
            }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleUnlock}>
            Liberar chat
          </Button>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)', overflow: 'hidden' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '280px 1fr' }, height: { xs: 650, lg: 620 } }}>
            <Box sx={{ borderRight: { lg: '1px solid rgba(24, 33, 47, 0.08)' }, background: '#f8fafc', p: 2 }}>
              {rooms.map((item) => {
                const active = item === room;
                return (
                  <Box
                    key={item}
                    onClick={() => setRoom(item)}
                    sx={{
                      p: 1.5,
                      borderRadius: '8px',
                      mb: 1,
                      cursor: 'pointer',
                      background: active ? '#e8f5f2' : 'transparent',
                    }}
                  >
                    <Typography sx={{ fontWeight: 800 }}>{item}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {messages.filter((message) => message.room === item).length} mensagens
                    </Typography>
                  </Box>
                );
              })}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', background: '#eef7f5' }}>
              <Box sx={{ p: 2, background: '#fff', borderBottom: '1px solid rgba(24, 33, 47, 0.08)' }}>
                <Typography sx={{ fontWeight: 900 }}>{room}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Conversa interna protegida por autenticação
                </Typography>
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {roomMessages.map((message) => {
                  const sent = message.direction === 'sent';
                  return (
                    <Box key={message.id} sx={{ alignSelf: sent ? 'flex-end' : 'flex-start', maxWidth: '78%' }}>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 1,
                          borderRadius: '8px',
                          background: sent ? '#d8fdd2' : '#fff',
                          boxShadow: '0 4px 14px rgba(24, 33, 47, 0.08)',
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                          {message.author}
                        </Typography>
                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{message.body}</Typography>
                        <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', color: 'text.secondary', mt: 0.5 }}>
                          {new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
              <Box sx={{ p: 2, background: '#fff', borderTop: '1px solid rgba(24, 33, 47, 0.08)' }}>
                <TextField
                  placeholder="Digite uma mensagem"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  fullWidth
                  multiline
                  maxRows={4}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton color="primary" onClick={sendMessage} aria-label="Enviar mensagem">
                            <SendIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Paper>
      )}
    </PageShell>
  );
}
