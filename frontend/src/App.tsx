import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ClipboardList, RefreshCw, Search } from 'lucide-react';
import { api, clearToken, getToken } from './api';
import { Badge, Loading, Login, Shell, SolicitationDetail, SolicitationForm, Summary } from './components';
import { CATEGORIES, labels, PRIORITIES, STATUSES, type AuthUser, type Solicitation, type Status, type Summary as SummaryData } from './types';

const formatDate = (value: string) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(Boolean(getToken()));
  const [items, setItems] = useState<Solicitation[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selected, setSelected] = useState<Solicitation | null>(null);
  const [filters, setFilters] = useState({ status: '', categoria: '', prioridade: '', q: '' });
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!getToken()) { setAuthLoading(false); return; }
    api.me().then(setUser).catch(() => clearToken()).finally(() => setAuthLoading(false));
  }, []);
  async function login(email: string, password: string) { setUser(await api.login(email, password)); }
  async function register(name: string, email: string, password: string, role: 'admin' | 'atendente' | 'solicitante') { setUser(await api.register({ name, email, password, role })); }
  async function logout() { await api.logout(); setUser(null); }

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.list({ page, per_page: 15, ...Object.fromEntries(Object.entries(filters).filter(([key, value]) => key !== 'q' && value)) });
      setItems(result.data);
      setLastPage(result.last_page);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, filters.status, filters.categoria, filters.prioridade]);

  const loadSummary = useCallback(async () => {
    try {
      setSummary(await api.summary());
    } catch (error) {
      setError(errorMessage(error));
    }
  }, []);

  useEffect(() => { if (user) void load(); }, [load, user]);
  useEffect(() => { if (user) void loadSummary(); }, [loadSummary, user]);
  if (authLoading) return <Loading />;
  if (!user) return <Login onLogin={login} onRegister={register} />;
  const visible = filters.q ? items.filter(item => [item.protocolo, item.nome_solicitante, item.descricao].join(' ').toLowerCase().includes(filters.q.toLowerCase())) : items;

  if (view === 'create') return <Shell user={user} onLogout={() => void logout()}><main className="content"><SolicitationForm onCancel={() => setView('list')} onSaved={item => { setItems([item, ...items]); setSelected(item); setFeedback(`Solicitação ${item.protocolo} criada com sucesso.`); setView('detail'); void loadSummary(); }} /></main></Shell>;
  if (view === 'detail' && selected) return <Shell user={user} onLogout={() => void logout()}><SolicitationDetail item={selected} feedback={feedback} onBack={() => { setFeedback(''); setView('list'); void load(); }} onUpdated={item => { setSelected(item); setItems(items.map(current => current.id === item.id ? item : current)); setFeedback(`Status atualizado para ${labels[item.status]}.`); void loadSummary(); }} /></Shell>;

  return <Shell user={user} onLogout={() => void logout()}><main className="content"><div className="page-heading"><div><p className="eyebrow">Painel de atendimento</p><h1>Solicitações</h1><p className="muted">Acompanhe e organize os pedidos de atendimento.</p></div><button className="button primary" onClick={() => setView('create')}>Nova solicitação</button></div><div className="sr-only" aria-live="polite">{loading ? 'Carregando solicitações.' : feedback}</div><Summary summary={summary} /><div className="panel filters" aria-label="Filtros de solicitações"><div className="search"><Search size={18} aria-hidden="true" /><input aria-label="Buscar protocolo ou solicitante" placeholder="Buscar protocolo ou solicitante..." value={filters.q} onChange={event => setFilters({ ...filters, q: event.target.value })} /></div>{(['status', 'categoria', 'prioridade'] as const).map(key => <select key={key} aria-label={`Filtrar por ${key}`} value={filters[key]} onChange={event => { setPage(1); setFilters({ ...filters, [key]: event.target.value }); }}><option value="">Todos ({key})</option>{(key === 'status' ? STATUSES : key === 'categoria' ? CATEGORIES : PRIORITIES).map(value => <option key={value} value={value}>{labels[value]}</option>)}</select>)}<button className="icon-button" onClick={() => { void load(); void loadSummary(); }} aria-label="Atualizar lista" aria-busy={loading}><RefreshCw size={18} aria-hidden="true" /></button></div>{error && <div className="alert error" role="alert">{error}<button onClick={() => void load()}>Tentar novamente</button></div>}{loading && items.length === 0 ? <Loading /> : visible.length === 0 ? <div className="state" role="status"><ClipboardList size={42} aria-hidden="true" /><h3>Nenhuma solicitação encontrada</h3><p className="muted">Ajuste os filtros ou registre um novo atendimento.</p></div> : <><div className="table-wrap" aria-busy={loading}><table><caption className="sr-only">Lista de solicitações</caption><thead><tr><th>Protocolo</th><th>Solicitante</th><th>Categoria</th><th>Prioridade</th><th>Status</th><th>Data</th></tr></thead><tbody>{visible.map(item => <tr key={item.id} onClick={() => { setSelected(item); setView('detail'); }} tabIndex={0} aria-label={`Abrir solicitação ${item.protocolo}`} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(item); setView('detail'); } }}><td className="protocol">{item.protocolo}</td><td>{item.nome_solicitante}</td><td><Badge value={item.categoria} /></td><td><Badge value={item.prioridade} /></td><td><Badge value={item.status} /></td><td className="muted">{formatDate(item.data_criacao)}</td></tr>)}</tbody></table></div><div className="pagination"><span aria-live="polite">{visible.length} de {items.length} nesta página</span><div><button className="icon-button" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Página anterior"><ChevronLeft aria-hidden="true" /></button><strong aria-current="page">{page} / {lastPage}</strong><button className="icon-button" disabled={page >= lastPage} onClick={() => setPage(page + 1)} aria-label="Próxima página"><ChevronRight aria-hidden="true" /></button></div></div></>}</main></Shell>;
}
