import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ClipboardList, RefreshCw, Search } from 'lucide-react';
import { api } from './api';
import { Badge, Loading, Shell, SolicitationDetail, SolicitationForm, Summary } from './components';
import { CATEGORIES, labels, PRIORITIES, STATUSES, type Solicitation, type Status, type Summary as SummaryData } from './types';

const formatDate = (value: string) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';

export default function App() {
  const [items, setItems] = useState<Solicitation[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selected, setSelected] = useState<Solicitation | null>(null);
  const [filters, setFilters] = useState({ status: '', categoria: '', prioridade: '', q: '' });

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

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { void loadSummary(); }, [loadSummary]);
  const visible = filters.q ? items.filter(item => [item.protocolo, item.nome_solicitante, item.descricao].join(' ').toLowerCase().includes(filters.q.toLowerCase())) : items;

  if (view === 'create') return <Shell><SolicitationForm onCancel={() => setView('list')} onSaved={item => { setItems([item, ...items]); setSelected(item); setView('detail'); void loadSummary(); }} /></Shell>;
  if (view === 'detail' && selected) return <Shell><SolicitationDetail item={selected} onBack={() => { setView('list'); void load(); }} onUpdated={item => { setSelected(item); setItems(items.map(current => current.id === item.id ? item : current)); void loadSummary(); }} /></Shell>;

  return <Shell><main className="content"><div className="page-heading"><div><p className="eyebrow">Painel de atendimento</p><h1>Solicitações</h1><p className="muted">Acompanhe e organize os pedidos de atendimento.</p></div><button className="button primary" onClick={() => setView('create')}>Nova solicitação</button></div><Summary summary={summary} /><div className="panel filters"><div className="search"><Search size={18} /><input placeholder="Buscar protocolo ou solicitante..." value={filters.q} onChange={event => setFilters({ ...filters, q: event.target.value })} /></div>{(['status', 'categoria', 'prioridade'] as const).map(key => <select key={key} aria-label={`Filtrar por ${key}`} value={filters[key]} onChange={event => { setPage(1); setFilters({ ...filters, [key]: event.target.value }); }}><option value="">Todos ({key})</option>{(key === 'status' ? STATUSES : key === 'categoria' ? CATEGORIES : PRIORITIES).map(value => <option key={value} value={value}>{labels[value]}</option>)}</select>)}<button className="icon-button" onClick={() => { void load(); void loadSummary(); }} aria-label="Atualizar lista"><RefreshCw size={18} /></button></div>{error && <div className="alert error">{error}<button onClick={() => void load()}>Tentar novamente</button></div>}{loading && items.length === 0 ? <Loading /> : visible.length === 0 ? <div className="state"><ClipboardList size={42} /><h3>Nenhuma solicitação encontrada</h3><p className="muted">Ajuste os filtros ou registre um novo atendimento.</p></div> : <><div className="table-wrap"><table><thead><tr><th>Protocolo</th><th>Solicitante</th><th>Categoria</th><th>Prioridade</th><th>Status</th><th>Data</th></tr></thead><tbody>{visible.map(item => <tr key={item.id} onClick={() => { setSelected(item); setView('detail'); }} tabIndex={0} onKeyDown={event => { if (event.key === 'Enter') { setSelected(item); setView('detail'); } }}><td className="protocol">{item.protocolo}</td><td>{item.nome_solicitante}</td><td><Badge value={item.categoria} /></td><td><Badge value={item.prioridade} /></td><td><Badge value={item.status} /></td><td className="muted">{formatDate(item.data_criacao)}</td></tr>)}</tbody></table></div><div className="pagination"><span>{visible.length} de {items.length} nesta página</span><div><button className="icon-button" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Página anterior"><ChevronLeft /></button><strong>{page} / {lastPage}</strong><button className="icon-button" disabled={page >= lastPage} onClick={() => setPage(page + 1)} aria-label="Próxima página"><ChevronRight /></button></div></div></>}</main></Shell>;
}
