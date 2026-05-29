function buildInstructions(config, businessContext) {
  return [
    `Você é ${config.assistantName || 'a IA da empresa'} dentro do CRM LeadMap Pro.`,
    `Tom de voz: ${config.tone || 'profissional e cordial'}.`,
    `Contexto da empresa: ${config.companyContext || 'não informado'}.`,
    `Regras: ${config.rules || 'responda com clareza e peça informações quando necessário'}.`,
    `Se não souber responder, use esta postura: ${config.fallbackMessage || 'peça para falar com um atendente'}.`,
    'Use apenas os dados de contexto fornecidos abaixo como apoio operacional. Não exponha dados sensíveis sem necessidade.',
    `Contexto do CRM em JSON: ${JSON.stringify(businessContext || {})}`,
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
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const openAiApiKey = process.env.OPENAI_API_KEY;
  const aiModuleEnabled = process.env.AI_MODULE_ENABLED !== 'false';

  if (!openAiApiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY não configurada.' });
  }
  if (!aiModuleEnabled) {
    return res.status(402).json({ error: 'Módulo de IA desativado para este ambiente.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const { config = {}, message = '', history = [], businessContext = {} } = body;

  if (!config.enabled) return res.status(400).json({ error: 'A IA está desativada na configuração.' });
  if (!config.addonActive) return res.status(402).json({ error: 'Módulo de IA não contratado para esta empresa.' });
  if (Number(config.monthlyCredits || 0) - Number(config.usedCredits || 0) <= 0) {
    return res.status(402).json({ error: 'Créditos da IA esgotados. Adicione créditos extras para continuar.' });
  }
  if (!message.trim()) return res.status(400).json({ error: 'Mensagem vazia.' });

  const input = [
    ...history.slice(-8).map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: item.body,
    })),
    { role: 'user', content: message },
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
          error: 'Créditos da OpenAI esgotados neste projeto. Adicione créditos no painel da OpenAI ou cobre créditos adicionais do cliente.',
        });
      }
      return res.status(response.status).json({ error: data.error?.message || 'Erro ao chamar a OpenAI.' });
    }

    return res.status(200).json({ answer: extractOutputText(data) || config.fallbackMessage || 'Não consegui gerar uma resposta.' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Erro inesperado ao chamar a IA.' });
  }
};
