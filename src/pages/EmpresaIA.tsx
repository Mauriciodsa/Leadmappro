import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import PageShell from '../components/PageShell';
import {
  type AiChatMessage,
  type AiConfig,
  newId,
  readAiConfig,
  readAiMessages,
  readClientes,
  readProducts,
  readQuotes,
  readSectors,
  writeAiConfig,
  writeAiMessages,
} from '../services/localStore';

const apiBaseUrl = import.meta.env.VITE_API_URL || window.location.origin.replace(':5173', ':3333');

export default function EmpresaIA() {
  const [config, setConfig] = useState<AiConfig>(() => readAiConfig());
  const [messages, setMessages] = useState<AiChatMessage[]>(() => readAiMessages());
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const remainingCredits = Math.max(config.monthlyCredits - config.usedCredits, 0);
  const aiReady = config.enabled && config.addonActive && remainingCredits > 0;

  const businessContext = useMemo(
    () => ({
      setores: readSectors(),
      produtos: readProducts(),
      clientes: readClientes().slice(0, 20),
      orcamentos: readQuotes().slice(0, 20),
    }),
    [],
  );

  function persistMessages(nextMessages: AiChatMessage[]) {
    setMessages(nextMessages);
    writeAiMessages(nextMessages);
  }

  function handleSave() {
    writeAiConfig(config);
    setNotice('Configuração comercial da IA salva.');
    setTimeout(() => setNotice(''), 2500);
  }

  async function sendMessage() {
    if (!draft.trim() || loading) return;
    if (!config.addonActive) {
      setError('Módulo de IA não contratado para esta empresa. Ative o adicional quando vender créditos ao cliente.');
      return;
    }
    if (remainingCredits <= 0) {
      setError('Créditos da IA esgotados. Adicione créditos extras para continuar usando.');
      return;
    }
    setError('');
    const userMessage: AiChatMessage = {
      id: newId('ai-user'),
      role: 'user',
      body: draft.trim(),
      createdAt: new Date().toISOString(),
    };
    const nextMessages = [...messages, userMessage];
    persistMessages(nextMessages);
    setDraft('');
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          message: userMessage.body,
          history: nextMessages.slice(-8),
          businessContext,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao consultar a IA.');

      const estimatedCredits = Math.max(1, Math.ceil((userMessage.body.length + String(data.answer || '').length) / 500));
      const updatedConfig = { ...config, usedCredits: config.usedCredits + estimatedCredits };
      setConfig(updatedConfig);
      writeAiConfig(updatedConfig);
      persistMessages([
        ...nextMessages,
        {
          id: newId('ai-assistant'),
          role: 'assistant',
          body: data.answer || config.fallbackMessage,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao consultar a IA.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title="IA da empresa"
      subtitle="Configure uma assistente para responder conforme o contexto, tom e regras da sua empresa."
      icon={<SmartToyIcon />}
      action={
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
          Salvar IA
        </Button>
      }
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1fr 460px' }, gap: 2.5 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography variant="h6">Módulo comercial da IA</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Ative somente para empresas que contrataram o adicional de créditos.
              </Typography>
            </Box>
            <Switch checked={config.enabled} onChange={(e) => setConfig({ ...config, enabled: e.target.checked })} />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mt: 2 }}>
            <TextField
              select
              label="Status comercial"
              value={config.addonActive ? 'active' : 'inactive'}
              onChange={(e) => setConfig({ ...config, addonActive: e.target.value === 'active' })}
              fullWidth
            >
              <MenuItem value="inactive">Não contratado</MenuItem>
              <MenuItem value="active">Contratado</MenuItem>
            </TextField>
            <TextField
              label="Créditos mensais"
              type="number"
              value={config.monthlyCredits || ''}
              placeholder="0"
              onFocus={(e) => e.target.select()}
              onChange={(e) => setConfig({ ...config, monthlyCredits: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Créditos usados"
              type="number"
              value={config.usedCredits || ''}
              placeholder="0"
              onFocus={(e) => e.target.select()}
              onChange={(e) => setConfig({ ...config, usedCredits: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="R$ por crédito extra"
              type="number"
              value={config.extraCreditPrice || ''}
              placeholder="0,00"
              onFocus={(e) => e.target.select()}
              onChange={(e) => setConfig({ ...config, extraCreditPrice: Number(e.target.value) })}
              fullWidth
            />
          </Box>

          <Alert severity={aiReady ? 'success' : 'warning'} sx={{ mt: 2 }}>
            {aiReady
              ? `IA pronta para uso. Saldo estimado: ${remainingCredits} créditos.`
              : 'IA em modo comercial: ative o módulo contratado e mantenha saldo de créditos para liberar respostas.'}
          </Alert>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 220px' }, gap: 2, mt: 2 }}>
            <TextField
              label="Nome da IA"
              value={config.assistantName}
              onChange={(e) => setConfig({ ...config, assistantName: e.target.value })}
              fullWidth
            />
            <TextField select label="Modelo" value={config.model} onChange={(e) => setConfig({ ...config, model: e.target.value })} fullWidth>
              <MenuItem value="gpt-4o-mini">gpt-4o-mini</MenuItem>
              <MenuItem value="gpt-4o">gpt-4o</MenuItem>
              <MenuItem value="gpt-5.1">gpt-5.1</MenuItem>
            </TextField>
          </Box>

          <TextField
            label="Tom de voz"
            value={config.tone}
            onChange={(e) => setConfig({ ...config, tone: e.target.value })}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            label="Contexto da empresa"
            value={config.companyContext}
            onChange={(e) => setConfig({ ...config, companyContext: e.target.value })}
            fullWidth
            multiline
            rows={5}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Regras de atendimento"
            value={config.rules}
            onChange={(e) => setConfig({ ...config, rules: e.target.value })}
            fullWidth
            multiline
            rows={5}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Mensagem quando não souber responder"
            value={config.fallbackMessage}
            onChange={(e) => setConfig({ ...config, fallbackMessage: e.target.value })}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            label="Observação comercial do plano"
            value={config.planNote}
            onChange={(e) => setConfig({ ...config, planNote: e.target.value })}
            fullWidth
            multiline
            rows={2}
            sx={{ mt: 2 }}
          />
          {notice && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {notice}
            </Alert>
          )}
        </Paper>

        <Paper elevation={0} sx={{ borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)', overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(24, 33, 47, 0.08)', background: '#fff' }}>
            <Typography sx={{ fontWeight: 900 }}>Teste da IA</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Use para validar respostas antes de vender ou liberar para clientes.
            </Typography>
          </Box>
          <Box sx={{ height: 460, overflow: 'auto', p: 2, background: '#eef7f5', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {messages.length === 0 && (
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mt: 6 }}>
                Faça uma pergunta para testar a configuração.
              </Typography>
            )}
            {messages.map((message) => {
              const user = message.role === 'user';
              return (
                <Box key={message.id} sx={{ alignSelf: user ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <Box sx={{ p: 1.25, borderRadius: '8px', background: user ? '#d8fdd2' : '#fff', boxShadow: '0 4px 14px rgba(24, 33, 47, 0.08)' }}>
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{message.body}</Typography>
                  </Box>
                </Box>
              );
            })}
            {loading && <CircularProgress size={22} sx={{ alignSelf: 'center', mt: 1 }} />}
          </Box>
          <Box sx={{ p: 2, background: '#fff' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 1.5 }}>
                {error}
              </Alert>
            )}
            <TextField
              placeholder="Pergunte algo para a IA"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              fullWidth
              multiline
              maxRows={4}
              disabled={!config.enabled || loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button variant="contained" startIcon={<SendIcon />} onClick={sendMessage} disabled={!aiReady || loading} sx={{ mt: 1.5 }}>
              Enviar
            </Button>
          </Box>
        </Paper>
      </Box>
    </PageShell>
  );
}
