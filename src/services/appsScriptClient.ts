export type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  version?: string;
  modoTeste?: boolean;
  method?: string;
  timestamp?: string;
};

export type DashboardCard = {
  situacao: string;
  qtdAComprar: number;
  tipo: string;
  codigo: string;
  descricao: string;
  estoqueAtual: number;
  disponivel: number;
  reservado: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  abc3Meses: string;
  abcAnoPassado: string;
};

export type DashboardCompras = {
  total: number;
  cards: DashboardCard[];
};

export type Fornecedor = {
  codigo: string;
  nome: string;
  email: string;
  telefone: string;
  dataCotacao: string;
  ultimoEnvio: string;
  status: string;
  cidade: string;
  cnpjEmitente: string;
};

export type FornecedoresResponse = {
  total: number;
  fornecedores: Fornecedor[];
};

export type ListasBasicas = {
  status: string[];
  embalagens: string[];
};

export type CotacaoFornecedor = {
  idCotacaoFornecedor: string;
  idCotacao: string;
  codigoFornecedor: string;
  nomeFornecedor: string;
  email: string;
  quantidadeSolicitada: number;
  embalagem: string;
  status: string;
  formUrl: string;
  enviadoEm: string;
  respondidoEm: string;
  motivoReprovacao: string;
  numeroOc: string;
  observacoes: string;
};

export type Cotacao = {
  idCotacao: string;
  codigoItem: string;
  descricaoItem: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  quantidadeSugerida: number;
  quantidadeSolicitada: number;
  embalagem: string;
  status: string;
  criadoPor: string;
  criadoEm: string;
  enviadoEm: string;
  observacoes: string;
  fornecedores: CotacaoFornecedor[];
};

export type ListarCotacoesResponse = {
  total: number;
  cotacoes: Cotacao[];
};

export type FornecedorCotacaoPayload = {
  codigo: string;
  nome: string;
  email: string;
};

export type CriarCotacaoPayload = {
  codigoItem: string;
  descricaoItem: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  quantidadeSugerida: number;
  quantidadeSolicitada: number;
  embalagem: string;
  fornecedores: FornecedorCotacaoPayload[];
};

export type CriarCotacaoResponse = {
  mensagem: string;
  idCotacao: string;
  fornecedoresCriados: Array<{
    idCotacaoFornecedor: string;
    codigo: string;
    nome: string;
    email: string;
    status: string;
  }>;
};

export type EnviarCotacoesResponse = {
  mensagem: string;
  idCotacao: string;
  status: string;
  fornecedoresAtualizados: number;
  envioReal: boolean;
};

export type RetornoCotacao = {
  carimbo: string;
  produtoValidoAte: string;
  codigoItem: string;
  descricaoItem: string;
  quantidadeSolicitada: string;
  codigoCotacaoFornecedor: string;
  nomeVendedor: string;
  quantidadeFaturar: string;
  quantidadeVolumes: string;
  valorUnitario: string;
  ipi: string;
  icms: string;
  condicaoPagamento: string;
  cnpjEmitente: string;
  previsaoFaturamento: string;
  tipoFrete: string;
  codigoFornecedor: string;
  nomeFornecedor: string;
  situacao: string;
  valorReal: string;
};

export type ListarRetornosCotacaoResponse = {
  total: number;
  retornos: RetornoCotacao[];
};

export type RetornoFornecedorTipo =
  | 'aprovada'
  | 'prazo_expirado'
  | 'custo_acima'
  | 'prazo_entrega_incompativel'
  | 'validade_curta'
  | 'outros';

export type RetornarFornecedorPayload = {
  idCotacaoFornecedor: string;
  retorno: RetornoFornecedorTipo;
  numeroOc?: string;
  motivoOutros?: string;
};

export type RetornarFornecedorResponse = {
  mensagem: string;
  idCotacao: string;
  idCotacaoFornecedor: string;
  fornecedor: string;
  email: string;
  status: string;
  numeroOc: string;
  motivoReprovacao: string;
  envioReal: boolean;
};

export type StatusRecebimento =
  | "recebido"
  | "recebido_parcialmente"
  | "recebido_a_mais"
  | "devolucao_parcial"
  | "devolucao_integral";

export type AcusarRecebimentoPayload = {
  numeroOc: string;
  codigoItem: string;
  descricaoItem: string;
  quantidadePrevista: number;
  quantidadeRecebida: number;
  statusRecebimento: StatusRecebimento;
  motivo?: string;
  insumoExtra?: string;
  quantidadeExtra?: number;
  observacoes?: string;
};

export type AcusarRecebimentoResponse = {
  mensagem: string;
  idRecebimento: string;
  numeroOc: string;
  codigoItem: string;
  descricaoItem: string;
  statusRecebimento: string;
  statusOc: string;
  quantidadePrevista: number;
  quantidadeRecebida: number;
  quantidadePendente: number;
  avisarComprador: string;
};
const ENV_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined;
const ENV_TOKEN = import.meta.env.VITE_APPS_SCRIPT_TOKEN as string | undefined;

export const APPS_SCRIPT_URL_KEY = 'appsScript.url';
export const APPS_SCRIPT_TOKEN_KEY = 'appsScript.token';
export const APPS_SCRIPT_CONFIG_EVENT = 'appsScript.configChanged';

export function getAppsScriptConfig(): { url: string; token: string } {
  let url = ENV_URL || '';
  let token = ENV_TOKEN || '';
  if (typeof window !== 'undefined') {
    url = window.localStorage.getItem(APPS_SCRIPT_URL_KEY) || url;
    token = window.localStorage.getItem(APPS_SCRIPT_TOKEN_KEY) || token;
  }
  return { url, token };
}

export function setAppsScriptConfig(url: string, token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(APPS_SCRIPT_URL_KEY, url);
  window.localStorage.setItem(APPS_SCRIPT_TOKEN_KEY, token);
  window.dispatchEvent(new Event(APPS_SCRIPT_CONFIG_EVENT));
}

export function clearAppsScriptConfig() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(APPS_SCRIPT_URL_KEY);
  window.localStorage.removeItem(APPS_SCRIPT_TOKEN_KEY);
  window.dispatchEvent(new Event(APPS_SCRIPT_CONFIG_EVENT));
}

export function hasAppsScriptConfig(): boolean {
  const { url, token } = getAppsScriptConfig();
  return Boolean(url && token);
}

function getConfig() {
  const { url, token } = getAppsScriptConfig();
  if (!url) {
    throw new Error('Configure a URL do Apps Script clicando em "Configurar conexão Apps Script".');
  }
  if (!token) {
    throw new Error('Configure o token do Apps Script clicando em "Configurar conexão Apps Script".');
  }
  return { apiUrl: url, token };
}

async function request<T>(
  action: string,
  params: Record<string, string | number> = {},
): Promise<T> {
  const { apiUrl, token } = getConfig();
  const url = new URL(apiUrl);

  url.searchParams.set('action', action);
  url.searchParams.set('token', token);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  const response = await fetch(url.toString());
  const result = (await response.json()) as ApiResponse<T>;

  if (!result.ok) {
    throw new Error(result.error || 'Erro desconhecido na API do Apps Script.');
  }

  if (!result.data) {
    throw new Error('A API respondeu sem dados.');
  }

  return result.data;
}

export function getDashboardCompras(limite = 30) {
  return request<DashboardCompras>('getDashboardCompras', { limite });
}

export function getFornecedores(busca = '', limite = 30) {
  return request<FornecedoresResponse>('getFornecedores', { busca, limite });
}

export function getListasBasicas() {
  return request<ListasBasicas>('getListasBasicas');
}

export function listarCotacoes(limite = 30) {
  return request<ListarCotacoesResponse>('listarCotacoes', { limite });
}

export function listarRetornosCotacao(limite = 200) {
  return request<ListarRetornosCotacaoResponse>('listarRetornosCotacao', { limite });
}

export function criarCotacao(payload: CriarCotacaoPayload) {
  return request<CriarCotacaoResponse>('criarCotacao', {
    codigo_item: payload.codigoItem,
    descricao_item: payload.descricaoItem,
    estoque_atual: payload.estoqueAtual,
    estoque_minimo: payload.estoqueMinimo,
    estoque_maximo: payload.estoqueMaximo,
    quantidade_sugerida: payload.quantidadeSugerida,
    quantidade_solicitada: payload.quantidadeSolicitada,
    embalagem: payload.embalagem,
    fornecedores_json: JSON.stringify(payload.fornecedores),
  });
}

export function enviarCotacoes(idCotacao: string) {
  return request<EnviarCotacoesResponse>('enviarCotacoes', {
    id_cotacao: idCotacao,
  });
}

export function retornarFornecedor(payload: RetornarFornecedorPayload) {
  return request<RetornarFornecedorResponse>('retornarFornecedor', {
    id_cotacao_fornecedor: payload.idCotacaoFornecedor,
    retorno: payload.retorno,
    numero_oc: payload.numeroOc || '',
    motivo_outros: payload.motivoOutros || '',
  });
}
export function acusarRecebimento(payload: AcusarRecebimentoPayload) {
  return request<AcusarRecebimentoResponse>("acusarRecebimento", {
    numero_oc: payload.numeroOc,
    codigo_item: payload.codigoItem,
    descricao_item: payload.descricaoItem,
    quantidade_prevista: payload.quantidadePrevista,
    quantidade_recebida: payload.quantidadeRecebida,
    status_recebimento: payload.statusRecebimento,
    motivo: payload.motivo || "",
    insumo_extra: payload.insumoExtra || "",
    quantidade_extra: payload.quantidadeExtra || 0,
    criado_por: "Compras",
    observacoes: payload.observacoes || "",
  });
}
