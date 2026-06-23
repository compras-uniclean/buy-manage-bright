import { useEffect, useMemo, useState } from "react";
import {
  Cotacao,
  CotacaoFornecedor,
  DashboardCard,
  Fornecedor,
  getDashboardCompras,
  getFornecedores,
  getListasBasicas,
  ListasBasicas,
  listarCotacoes,
  criarCotacao,
  enviarCotacoes,
  retornarFornecedor,
  RetornoFornecedorTipo,
  getAppsScriptConfig,
  setAppsScriptConfig,
  hasAppsScriptConfig,
  APPS_SCRIPT_CONFIG_EVENT,
} from "../services/appsScriptClient";

type Aba = "compras" | "cotacoes" | "ordens" | "recebimento" | "historico";

type FornecedorRetornoSelecionado = {
  cotacao: Cotacao;
  fornecedor: CotacaoFornecedor;
};

export default function ComprasEstoque() {
  const [aba, setAba] = useState<Aba>("compras");
  const [cards, setCards] = useState<DashboardCard[]>([]);
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [listas, setListas] = useState<ListasBasicas | null>(null);
  const [cardSelecionado, setCardSelecionado] = useState<DashboardCard | null>(null);
  const [fornecedorRetorno, setFornecedorRetorno] = useState<FornecedorRetornoSelecionado | null>(null);
  const [cotacaoEnviando, setCotacaoEnviando] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [configurado, setConfigurado] = useState(false);

  const resumo = useMemo(() => {
    const totalComprar = cards.reduce((acc, item) => acc + item.qtdAComprar, 0);
    return {
      itensComprar: cards.length,
      totalComprar,
      cotacoesPendentes: cotacoes.filter((c) => c.status === "Criada").length,
    };
  }, [cards, cotacoes]);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro(null);
      const [dashboard, listasBasicas, cotacoesResp, fornResp] = await Promise.all([
        getDashboardCompras(500),
        getListasBasicas(),
        listarCotacoes(30),
        getFornecedores("", 200),
      ]);
      setCards(prepararCardsComprar(dashboard.cards || []));
      setListas(listasBasicas);
      setCotacoes(cotacoesResp.cotacoes);
      setFornecedores(fornResp.fornecedores.filter((f) => f.email));
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar dados.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    function syncConfig() {
      const ok = hasAppsScriptConfig();
      setConfigurado(ok);
      if (ok) {
        carregarDados();
      } else {
        setConfigOpen(true);
      }
    }
    syncConfig();
    window.addEventListener(APPS_SCRIPT_CONFIG_EVENT, syncConfig);
    return () => window.removeEventListener(APPS_SCRIPT_CONFIG_EVENT, syncConfig);
  }, []);

  async function handleCriarCotacao(payload: {
    item: DashboardCard;
    quantidadeSolicitada: number;
    embalagem: string;
    fornecedores: Fornecedor[];
  }) {
    try {
      setErro(null);
      setSucesso(null);
      const response = await criarCotacao({
        codigoItem: payload.item.codigo,
        descricaoItem: payload.item.descricao,
        estoqueAtual: payload.item.estoqueAtual,
        estoqueMinimo: payload.item.estoqueMinimo,
        estoqueMaximo: payload.item.estoqueMaximo,
        quantidadeSugerida: payload.item.qtdAComprar,
        quantidadeSolicitada: payload.quantidadeSolicitada,
        embalagem: payload.embalagem,
        fornecedores: payload.fornecedores.map((f) => ({
          codigo: f.codigo,
          nome: f.nome,
          email: f.email,
        })),
      });
      setSucesso(
        `Cotação ${response.idCotacao} criada para ${response.fornecedoresCriados.length} fornecedor(es). Nenhum e-mail foi enviado.`,
      );
      setCardSelecionado(null);
      setAba("cotacoes");
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao criar cotação.");
    }
  }

  async function handleEnviarCotacao(idCotacao: string) {
    try {
      setErro(null);
      setSucesso(null);
      setCotacaoEnviando(idCotacao);
      const response = await enviarCotacoes(idCotacao);
      setSucesso(
        `${response.idCotacao} marcada como ${response.status}. Fornecedores atualizados: ${response.fornecedoresAtualizados}. Nenhum e-mail real foi enviado.`,
      );
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao enviar cotação.");
    } finally {
      setCotacaoEnviando(null);
    }
  }

  async function handleRetornarFornecedor(payload: {
    idCotacaoFornecedor: string;
    retorno: RetornoFornecedorTipo;
    numeroOc?: string;
    motivoOutros?: string;
  }) {
    try {
      setErro(null);
      setSucesso(null);
      const response = await retornarFornecedor(payload);
      setSucesso(
        `${response.fornecedor} atualizado para ${response.status}. Nenhum e-mail real foi enviado.`,
      );
      setFornecedorRetorno(null);
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao registrar retorno.");
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>Compras e Estoque</h1>
          <p>Controle de reposição, cotações e recebimentos da Uniclean.</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="status-pill">{configurado ? "Conectado" : "Sem conexão"}</span>
          <button className="secondary-button" type="button" onClick={() => setConfigOpen(true)}>
            Configurar conexão Apps Script
          </button>
        </div>
      </header>

      {erro ? <div className="error">{erro}</div> : null}
      {sucesso ? <div className="success">{sucesso}</div> : null}

      <section className="card-grid" style={{ marginBottom: 20 }}>
        <div className="card">
          <h3>Itens para comprar</h3>
          <div className="metric-row">
            <div className="metric">
              <strong>{resumo.itensComprar}</strong>
              <span>cards encontrados</span>
            </div>
            <div className="metric">
              <strong>{resumo.totalComprar.toLocaleString("pt-BR")}</strong>
              <span>qtd. sugerida total</span>
            </div>
          </div>
        </div>
        <div className="card">
          <h3>Cotações</h3>
          <div className="metric-row">
            <div className="metric">
              <strong>{cotacoes.length}</strong>
              <span>criadas no app</span>
            </div>
            <div className="metric">
              <strong>{resumo.cotacoesPendentes}</strong>
              <span>pendentes</span>
            </div>
          </div>
        </div>
      </section>

      <nav className="tabs">
        <button className={`tab-button ${aba === "compras" ? "active" : ""}`} onClick={() => setAba("compras")}>Comprar</button>
        <button className={`tab-button ${aba === "cotacoes" ? "active" : ""}`} onClick={() => setAba("cotacoes")}>Cotações</button>
        <button className={`tab-button ${aba === "ordens" ? "active" : ""}`} onClick={() => setAba("ordens")}>Ordens de Compra</button>
        <button className={`tab-button ${aba === "recebimento" ? "active" : ""}`} onClick={() => setAba("recebimento")}>Recebimento</button>
        <button className={`tab-button ${aba === "historico" ? "active" : ""}`} onClick={() => setAba("historico")}>Histórico</button>
      </nav>

      {!configurado ? (
        <div className="notice">
          Conexão com Apps Script não configurada. Clique em <strong>Configurar conexão Apps Script</strong> para informar a URL e o token.
        </div>
      ) : null}

      {configurado && carregando ? <div className="notice">Carregando dados das planilhas...</div> : null}

      {!carregando && aba === "compras" ? (
        <Compras cards={cards} onEmitirCotacao={setCardSelecionado} />
      ) : null}
      {!carregando && aba === "cotacoes" ? (
        <Cotacoes
          cotacoes={cotacoes}
          onEnviarCotacao={handleEnviarCotacao}
          onResponderFornecedor={setFornecedorRetorno}
          cotacaoEnviando={cotacaoEnviando}
        />
      ) : null}
      {!carregando && aba === "ordens" ? (
        <div className="notice">A aba de Ordens de Compra será ligada quando a ação correspondente estiver disponível no Apps Script.</div>
      ) : null}
      {!carregando && aba === "recebimento" ? (
        <div className="notice">A aba de Recebimento será ligada quando a ação correspondente estiver disponível no Apps Script.</div>
      ) : null}
      {!carregando && aba === "historico" ? (
        <Historico cotacoes={cotacoes} />
      ) : null}

      {cardSelecionado ? (
        <EmitirCotacaoModal
          item={cardSelecionado}
          embalagens={listas?.embalagens || []}
          fornecedores={fornecedores}
          onClose={() => setCardSelecionado(null)}
          onConfirm={handleCriarCotacao}
        />
      ) : null}

      {fornecedorRetorno ? (
        <ResponderFornecedorModal
          cotacao={fornecedorRetorno.cotacao}
          fornecedor={fornecedorRetorno.fornecedor}
          onClose={() => setFornecedorRetorno(null)}
          onConfirm={handleRetornarFornecedor}
        />
      ) : null}
      {configOpen ? (
        <ConfigConexaoModal onClose={() => setConfigOpen(false)} />
      ) : null}
    </main>
  );
}

function ConfigConexaoModal({ onClose }: { onClose: () => void }) {
  const atual = getAppsScriptConfig();
  const [url, setUrl] = useState(atual.url);
  const [token, setToken] = useState(atual.token);
  const [erroModal, setErroModal] = useState<string | null>(null);

  function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const u = url.trim();
    const t = token.trim();
    if (!u) return setErroModal("Informe a URL do Apps Script.");
    if (!t) return setErroModal("Informe o token de acesso.");
    try {
      new URL(u);
    } catch {
      return setErroModal("URL inválida.");
    }
    setAppsScriptConfig(u, t);
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <h2>Configurar conexão Apps Script</h2>
            <p>Os dados ficam apenas no seu navegador (localStorage).</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar">×</button>
        </div>
        {erroModal ? <div className="error">{erroModal}</div> : null}
        <form className="form-grid" onSubmit={salvar}>
          <label className="full-width">
            URL do Apps Script
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
            />
          </label>
          <label className="full-width">
            Token de acesso
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Token configurado no Apps Script"
            />
          </label>
          <div className="notice full-width">
            Nada é enviado para servidores da Lovable. Os valores ficam salvos apenas neste navegador.
          </div>
          <div className="modal-actions full-width">
            <button className="secondary-button" type="button" onClick={onClose}>Cancelar</button>
            <button className="primary-button" type="submit">Salvar conexão</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const TIPO_ORDEM: Record<string, number> = { "01": 0, "02": 1, "00": 2, "10": 3 };
function ordemTipo(tipo: string): number {
  const chave = (tipo || "").trim().slice(0, 2);
  return TIPO_ORDEM[chave] ?? 99;
}

function Compras({ cards, onEmitirCotacao }: { cards: DashboardCard[]; onEmitirCotacao: (i: DashboardCard) => void }) {
  if (!cards.length) return <div className="notice">Nenhum item com necessidade de compra foi encontrado.</div>;
  const cardsOrdenados = [...cards].sort((a, b) => ordemTipo(a.tipo) - ordemTipo(b.tipo));
  return (
    <section className="card-grid">
      {cardsOrdenados.map((item) => (
        <article className="card" key={`${item.codigo}-${item.descricao}`}>
          <h2>{item.descricao}</h2>
          <p><strong>Código:</strong> {item.codigo}</p>
          <p><strong>Tipo:</strong> {item.tipo}</p>
          <p><strong>Situação:</strong> {item.situacao}</p>
          <div className="metric-row">
            <div className="metric"><strong>{item.qtdAComprar.toLocaleString("pt-BR")}</strong><span>qtd. a comprar</span></div>
            <div className="metric"><strong>{item.disponivel.toLocaleString("pt-BR")}</strong><span>disponível</span></div>
            <div className="metric"><strong>{item.estoqueMinimo.toLocaleString("pt-BR")}</strong><span>mínimo</span></div>
            <div className="metric"><strong>{item.estoqueMaximo.toLocaleString("pt-BR")}</strong><span>máximo</span></div>
          </div>
          <div className="card-actions">
            <button className="primary-button" type="button" onClick={() => onEmitirCotacao(item)}>Emitir cotação</button>
          </div>
        </article>
      ))}
    </section>
  );
}

function Cotacoes({
  cotacoes,
  onEnviarCotacao,
  onResponderFornecedor,
  cotacaoEnviando,
}: {
  cotacoes: Cotacao[];
  onEnviarCotacao: (id: string) => void;
  onResponderFornecedor: (p: FornecedorRetornoSelecionado) => void;
  cotacaoEnviando: string | null;
}) {
  if (!cotacoes.length) return <div className="notice">Nenhuma cotação criada pelo aplicativo até agora.</div>;
  return (
    <section className="card-grid">
      {cotacoes.map((cotacao) => {
        const podeEnviar = cotacao.status === "Criada";
        const enviandoEsta = cotacaoEnviando === cotacao.idCotacao;
        return (
          <article className="card" key={cotacao.idCotacao}>
            <h2>{cotacao.descricaoItem}</h2>
            <p><strong>ID:</strong> {cotacao.idCotacao}</p>
            <p><strong>Status:</strong> {cotacao.status}</p>
            <p><strong>Quantidade:</strong> {cotacao.quantidadeSolicitada.toLocaleString("pt-BR")}</p>
            <p><strong>Embalagem:</strong> {cotacao.embalagem}</p>
            <p><strong>Fornecedores:</strong> {cotacao.fornecedores.length}</p>
            {cotacao.fornecedores.length ? (
              <div className="supplier-list quotation-supplier-list">
                {cotacao.fornecedores.map((f) => (
                  <div className="supplier-chip" key={f.idCotacaoFornecedor}>
                    <span>{f.nomeFornecedor}</span>
                    <small>{f.status} · {f.email}</small>
                    <button type="button" onClick={() => onResponderFornecedor({ cotacao, fornecedor: f })}>Responder</button>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="card-actions">
              <button
                className="primary-button"
                type="button"
                disabled={!podeEnviar || enviandoEsta}
                onClick={() => onEnviarCotacao(cotacao.idCotacao)}
              >
                {enviandoEsta ? "Enviando..." : podeEnviar ? "Enviar cotação" : "Cotação enviada"}
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function Historico({ cotacoes }: { cotacoes: Cotacao[] }) {
  const finalizadas = cotacoes.filter((c) => c.status !== "Criada");
  if (!finalizadas.length) return <div className="notice">Nenhuma cotação finalizada no histórico ainda.</div>;
  return (
    <section className="card-grid">
      {finalizadas.map((c) => (
        <article className="card" key={c.idCotacao}>
          <h2>{c.descricaoItem}</h2>
          <p><strong>ID:</strong> {c.idCotacao}</p>
          <p><strong>Status:</strong> {c.status}</p>
          <p><strong>Criado em:</strong> {c.criadoEm}</p>
          <p><strong>Enviado em:</strong> {c.enviadoEm}</p>
        </article>
      ))}
    </section>
  );
}

function EmitirCotacaoModal({
  item,
  embalagens,
  fornecedores,
  onClose,
  onConfirm,
}: {
  item: DashboardCard;
  embalagens: string[];
  fornecedores: Fornecedor[];
  onClose: () => void;
  onConfirm: (p: { item: DashboardCard; quantidadeSolicitada: number; embalagem: string; fornecedores: Fornecedor[] }) => Promise<void>;
}) {
  const [quantidade, setQuantidade] = useState(String(item.qtdAComprar || ""));
  const [embalagem, setEmbalagem] = useState(embalagens[0] || "");
  const [fornecedorCodigo, setFornecedorCodigo] = useState("");
  const [selecionados, setSelecionados] = useState<Fornecedor[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState<string | null>(null);

  const fSelecionado = fornecedores.find((f) => f.codigo === fornecedorCodigo);

  function adicionar() {
    if (!fSelecionado) return setErroModal("Selecione um fornecedor.");
    if (selecionados.some((f) => f.codigo === fSelecionado.codigo)) return setErroModal("Fornecedor já adicionado.");
    setSelecionados((a) => [...a, fSelecionado]);
    setFornecedorCodigo("");
    setErroModal(null);
  }

  function remover(codigo: string) {
    setSelecionados((a) => a.filter((f) => f.codigo !== codigo));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = Number(quantidade.replace(",", "."));
    if (!q || q <= 0) return setErroModal("Informe uma quantidade maior que zero.");
    if (!embalagem) return setErroModal("Selecione uma embalagem.");
    if (!selecionados.length) return setErroModal("Adicione pelo menos um fornecedor.");
    try {
      setSalvando(true);
      setErroModal(null);
      await onConfirm({ item, quantidadeSolicitada: q, embalagem, fornecedores: selecionados });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <h2>Emitir cotação</h2>
            <p>{item.descricao}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar">×</button>
        </div>
        {erroModal ? <div className="error">{erroModal}</div> : null}
        <form className="form-grid" onSubmit={submit}>
          <label>
            Quantidade
            <input value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
            <small>Sugestão: {item.qtdAComprar.toLocaleString("pt-BR")}</small>
          </label>
          <label>
            Embalagem
            <select value={embalagem} onChange={(e) => setEmbalagem(e.target.value)}>
              <option value="">Selecione...</option>
              {embalagens.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label>
            Fornecedor
            <select value={fornecedorCodigo} onChange={(e) => setFornecedorCodigo(e.target.value)}>
              <option value="">Selecione...</option>
              {fornecedores.map((f) => <option key={f.codigo} value={f.codigo}>{f.nome}</option>)}
            </select>
          </label>
          <label>
            E-mail
            <input value={fSelecionado?.email || ""} readOnly placeholder="Preenchido automaticamente" />
          </label>
          <div className="full-width">
            <button className="secondary-button" type="button" onClick={adicionar}>Adicionar fornecedor</button>
          </div>
          <div className="full-width selected-suppliers">
            <strong>Fornecedores adicionados</strong>
            {selecionados.length ? (
              <div className="supplier-list">
                {selecionados.map((f) => (
                  <div className="supplier-chip" key={f.codigo}>
                    <span>{f.nome}</span>
                    <small>{f.email}</small>
                    <button type="button" onClick={() => remover(f.codigo)}>Remover</button>
                  </div>
                ))}
              </div>
            ) : <p>Nenhum fornecedor adicionado.</p>}
          </div>
          <div className="notice full-width">Apenas cria a cotação. Nenhum e-mail será enviado.</div>
          <div className="modal-actions full-width">
            <button className="secondary-button" type="button" onClick={onClose}>Cancelar</button>
            <button className="primary-button" type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Criar cotação"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResponderFornecedorModal({
  cotacao,
  fornecedor,
  onClose,
  onConfirm,
}: {
  cotacao: Cotacao;
  fornecedor: CotacaoFornecedor;
  onClose: () => void;
  onConfirm: (p: { idCotacaoFornecedor: string; retorno: RetornoFornecedorTipo; numeroOc?: string; motivoOutros?: string }) => Promise<void>;
}) {
  const [retorno, setRetorno] = useState<RetornoFornecedorTipo>("aprovada");
  const [numeroOc, setNumeroOc] = useState("");
  const [motivoOutros, setMotivoOutros] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (retorno === "aprovada" && !numeroOc.trim()) return setErroModal("Informe o número da O.C.");
    if (retorno === "outros" && !motivoOutros.trim()) return setErroModal("Informe o motivo.");
    try {
      setSalvando(true);
      setErroModal(null);
      await onConfirm({ idCotacaoFornecedor: fornecedor.idCotacaoFornecedor, retorno, numeroOc, motivoOutros });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <h2>Responder fornecedor</h2>
            <p>{fornecedor.nomeFornecedor} · {cotacao.descricaoItem}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar">×</button>
        </div>
        {erroModal ? <div className="error">{erroModal}</div> : null}
        <form className="form-grid" onSubmit={submit}>
          <label className="full-width">
            Retorno
            <select value={retorno} onChange={(e) => setRetorno(e.target.value as RetornoFornecedorTipo)}>
              <option value="aprovada">Cotação Aprovada</option>
              <option value="prazo_expirado">Reprovada - Prazo para envio expirado</option>
              <option value="custo_acima">Reprovada - Custo acima do negociado</option>
              <option value="prazo_entrega_incompativel">Reprovada - Prazo de entrega incompatível</option>
              <option value="validade_curta">Reprovada - Validade curta</option>
              <option value="outros">Reprovada - Outros motivos</option>
            </select>
          </label>
          {retorno === "aprovada" ? (
            <label className="full-width">
              Número da O.C
              <input value={numeroOc} onChange={(e) => setNumeroOc(e.target.value)} placeholder="Ex.: OC-12345" />
            </label>
          ) : null}
          {retorno === "outros" ? (
            <label className="full-width">
              Outros motivos
              <input value={motivoOutros} onChange={(e) => setMotivoOutros(e.target.value)} />
            </label>
          ) : null}
          <div className="notice full-width">Registra o retorno em modo teste. Nenhum e-mail real será enviado.</div>
          <div className="modal-actions full-width">
            <button className="secondary-button" type="button" onClick={onClose}>Cancelar</button>
            <button className="primary-button" type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Enviar resposta"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
