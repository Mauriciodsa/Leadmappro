function buildInstructions(config, businessContext) {
  return [
    `Voce e ${config.assistantName || 'a IA da empresa'} dentro do CRM LeadMap Pro.`,
    `Tom de voz: ${config.tone || 'profissional e cordial'}.`,
    `Contexto da empresa: ${config.companyContext || 'nao informado'}.`,
    `Regras: ${config.rules || 'responda com clareza e peca informacoes quando necessario'}.`,
    `Se nao souber responder, use esta postura: ${config.fallbackMessage || 'peca para falar com um atendente'}.`,
    'Use apenas os dados de contexto fornecidos abaixo como apoio operacional. Nao exponha dados sensiveis sem necessidade.',
    `Contexto do CRM em JSON: ${JSON.stringify(businessContext || {}).slice(0, 12000)}`,
  ].join('\n\n');
}

function extractOutputText(data) {
  if (typeof data.output_text === 'string') return data.output_text;
  const parts = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) parts.push(content.text);
      if (content.type === 'text' && content.text) parts.push(content.text);
    }
  }
  return parts.join('\n').trim();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Metodo nao permitido.' });
  }

  const openAiApiKey = process.env.OPENAI_API_KEY;
  const aiModuleEnabled = process.env.AI_MODULE_ENABLED !== 'false';

  if (!openAiApiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY nao configurada.' });
  }
  if (!aiModuleEnabled) {
    return res.status(402).json({ error: 'Modulo de IA desativado para este ambiente.' });
  }

  let body = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  } catch {
    return res.status(400).json({ error: 'JSON invalido.' });
  }

  const { config = {}, message = '', history = [], businessContext = {} } = body;
  const safeMessage = String(message || '').slice(0, 4000);
  const safeHistory = Array.isArray(history) ? history.slice(-8) : [];

  if (!config.enabled) return res.status(400).json({ error: 'A IA esta desativada na configuracao.' });
  if (!config.addonActive) return res.status(402).json({ error: 'Modulo de IA nao contratado para esta empresa.' });
  if (Number(config.monthlyCredits || 0) - Number(config.usedCredits || 0) <= 0) {
    return res.status(402).json({ error: 'Creditos da IA esgotados. Adicione creditos extras para continuar.' });
  }
  if (!safeMessage.trim()) return res.status(400).json({ error: 'Mensagem vazia.' });

  const input = [
    ...safeHistory.map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: String(item.body || '').slice(0, 2000),
    })),
    { role: 'user', content: safeMessage },
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model || process.env.OPENAI_MODEL || 'gpt-4o-mini',
        instructions: buildInstructions(config, businessContext),
        input,
        max_output_tokens: 800,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      if (data.error?.code === 'insufficient_quota' || /quota/i.test(data.error?.message || '')) {
        return res.status(402).json({
          error: 'Creditos da OpenAI esgotados neste projeto. Adicione creditos no painel da OpenAI ou cobre creditos adicionais do cliente.',
        });
      }
      return res.status(response.status).json({ error: data.error?.message || 'Erro ao chamar a OpenAI.' });
    }

    return res.status(200).json({ answer: extractOutputText(data) || config.fallbackMessage || 'Nao consegui gerar uma resposta.' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Erro inesperado ao chamar a IA.' });
  }
};
