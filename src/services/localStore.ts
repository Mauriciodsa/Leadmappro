export type ClienteLocal = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  empresa: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude: string;
  longitude: string;
  origem: string;
  status: string;
  equipamentos: string;
  nossoCliente: boolean;
  lembreteSetor: string;
  lembreteTexto: string;
  lembreteData: string;
  observacoes: string;
};

export type SectorOption = {
  id: string;
  option: string;
  name: string;
  summary: string;
  response: string;
};

export type BankRate = {
  id: string;
  label: string;
  installments: number;
  percent: number;
  fixedFee: number;
};

export type FinanceCalculation = {
  id: string;
  netValue: number;
  gross: number;
  totalFee: number;
  installment: number;
  rateLabel: string;
  createdAt: string;
};

export type Product = {
  id: string;
  name: string;
  code: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  siteUrl: string;
  imageUrls: string[];
};

export type Quote = {
  id: string;
  client: string;
  product: string;
  exchangeConditions: string;
  paymentMethod: string;
  deadline: string;
  warranty: string;
  notes: string;
  total: number;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  room: string;
  author: string;
  body: string;
  direction: 'sent' | 'received';
  createdAt: string;
};

export type AiConfig = {
  enabled: boolean;
  addonActive: boolean;
  model: string;
  assistantName: string;
  tone: string;
  companyContext: string;
  rules: string;
  fallbackMessage: string;
  monthlyCredits: number;
  usedCredits: number;
  extraCreditPrice: number;
  planNote: string;
};

export type AiChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  body: string;
  createdAt: string;
};

export type CompanyProfile = {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cnpj: string;
  logo_url: string;
  sales_url: string;
};

export const emptyCompanyProfile: CompanyProfile = {
  nome: '',
  email: '',
  telefone: '',
  endereco: '',
  cnpj: '',
  logo_url: '',
  sales_url: '',
};

export const emptyCliente: ClienteLocal = {
  id: '',
  nome: '',
  email: '',
  telefone: '',
  documento: '',
  empresa: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
  latitude: '',
  longitude: '',
  origem: '',
  status: 'Lead',
  equipamentos: '',
  nossoCliente: false,
  lembreteSetor: '',
  lembreteTexto: '',
  lembreteData: '',
  observacoes: '',
};

const defaultSectors: SectorOption[] = [
  {
    id: 'comercial',
    option: '1',
    name: 'Comercial',
    summary: 'Novas vendas, propostas e negociação.',
    response: 'Você será direcionado para o Comercial. Informe seu nome e o que deseja contratar.',
  },
  {
    id: 'suporte',
    option: '2',
    name: 'Suporte',
    summary: 'Ajuda técnica e acompanhamento de solicitações.',
    response: 'Você será direcionado para o Suporte. Descreva o problema e envie seu melhor contato.',
  },
  {
    id: 'financeiro',
    option: '3',
    name: 'Financeiro',
    summary: 'Pagamentos, boletos, notas e contratos.',
    response: 'Você será direcionado para o Financeiro. Informe CPF/CNPJ e o assunto.',
  },
];

const defaultRates: BankRate[] = [
  { id: 'debit', label: 'Débito', installments: 1, percent: 1.79, fixedFee: 0 },
  { id: 'credit-1', label: 'Crédito à vista', installments: 1, percent: 3.49, fixedFee: 0 },
  { id: 'credit-6', label: 'Crédito 6x', installments: 6, percent: 8.99, fixedFee: 0 },
  { id: 'credit-12', label: 'Crédito 12x', installments: 12, percent: 14.99, fixedFee: 0 },
];

const defaultProducts: Product[] = [
  {
    id: 'crm-setup',
    name: 'Implantação CRM',
    code: 'CRM-001',
    category: 'Serviço',
    price: 1500,
    description: 'Configuração inicial, cadastro de setores e treinamento básico.',
    imageUrl: '',
    siteUrl: '',
    imageUrls: [],
  },
  {
    id: 'support-plan',
    name: 'Plano de suporte',
    code: 'SUP-001',
    category: 'Recorrente',
    price: 299,
    description: 'Acompanhamento mensal e ajustes operacionais.',
    imageUrl: '',
    siteUrl: '',
    imageUrls: [],
  },
];

const defaultMessages: ChatMessage[] = [
  {
    id: 'welcome',
    room: 'Administração',
    author: 'Sistema',
    body: 'Chat interno pronto. As conversas ficam salvas localmente e podem ser exportadas em Backup.',
    direction: 'received',
    createdAt: new Date().toISOString(),
  },
];

const defaultAiConfig: AiConfig = {
  enabled: false,
  addonActive: false,
  model: 'gpt-4o-mini',
  assistantName: 'Assistente LeadMap',
  tone: 'Profissional, objetivo e cordial',
  companyContext:
    'A empresa usa o LeadMap Pro para organizar clientes, setores, WhatsApp, orçamentos, catálogo e acompanhamento comercial.',
  rules:
    'Responda em português do Brasil. Seja claro, educado e direto. Não invente preços, prazos ou políticas. Quando faltar informação, peça os dados necessários antes de concluir.',
  fallbackMessage: 'Não tenho essa informação com segurança. Posso encaminhar para um atendente da empresa.',
  monthlyCredits: 1000,
  usedCredits: 0,
  extraCreditPrice: 0.15,
  planNote: 'IA vendida como adicional. Ative apenas para clientes que contrataram créditos.',
};

export function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStore<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function readClientes() {
  return readStore<ClienteLocal[]>('leadmap:clientes', []).map(normalizeCliente);
}

export function writeClientes(clientes: ClienteLocal[]) {
  writeStore('leadmap:clientes', clientes.map(normalizeCliente));
}

export function readSectors() {
  return readStore<SectorOption[]>('leadmap:sectors', defaultSectors);
}

export function writeSectors(sectors: SectorOption[]) {
  writeStore('leadmap:sectors', sectors);
}

export function readRates() {
  return readStore<BankRate[]>('leadmap:bank-rates', defaultRates);
}

export function writeRates(rates: BankRate[]) {
  writeStore('leadmap:bank-rates', rates);
}

export function readFinanceHistory() {
  return readStore<FinanceCalculation[]>('leadmap:finance-history', []);
}

export function writeFinanceHistory(history: FinanceCalculation[]) {
  writeStore('leadmap:finance-history', history.slice(0, 20));
}

export function readProducts() {
  return readStore<Product[]>('leadmap:products', defaultProducts).map(normalizeProduct);
}

export function writeProducts(products: Product[]) {
  writeStore('leadmap:products', products.map(normalizeProduct));
}

export function readQuotes() {
  return readStore<Quote[]>('leadmap:quotes', []);
}

export function writeQuotes(quotes: Quote[]) {
  writeStore('leadmap:quotes', quotes);
}

export function readMessages() {
  return readStore<ChatMessage[]>('leadmap:chat-messages', defaultMessages);
}

export function writeMessages(messages: ChatMessage[]) {
  writeStore('leadmap:chat-messages', messages);
}

export function readAiConfig() {
  return readStore<AiConfig>('leadmap:ai-config', defaultAiConfig);
}

export function writeAiConfig(config: AiConfig) {
  writeStore('leadmap:ai-config', config);
}

export function readAiMessages() {
  return readStore<AiChatMessage[]>('leadmap:ai-messages', []);
}

export function writeAiMessages(messages: AiChatMessage[]) {
  writeStore('leadmap:ai-messages', messages);
}

export function readCompanyProfile() {
  return readStore<CompanyProfile>('leadmap:company', emptyCompanyProfile);
}

export function writeCompanyProfile(company: CompanyProfile) {
  writeStore('leadmap:company', company);
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function normalizeCliente(cliente: Partial<ClienteLocal>): ClienteLocal {
  return { ...emptyCliente, ...cliente, id: cliente.id || newId('cliente') };
}

export function normalizeProduct(product: Partial<Product>): Product {
  const imageUrls = Array.isArray(product.imageUrls) ? product.imageUrls.filter(Boolean).slice(0, 10) : [];
  const legacyImage = product.imageUrl && !imageUrls.includes(product.imageUrl) ? [product.imageUrl] : [];
  return {
    id: product.id || newId('product'),
    name: product.name || '',
    code: product.code || '',
    category: product.category || '',
    price: Number(product.price || 0),
    description: product.description || '',
    imageUrl: product.imageUrl || imageUrls[0] || '',
    siteUrl: product.siteUrl || '',
    imageUrls: [...legacyImage, ...imageUrls].slice(0, 10),
  };
}
