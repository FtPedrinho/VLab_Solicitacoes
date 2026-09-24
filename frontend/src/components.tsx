import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, ClipboardList, Plus, Search, X } from 'lucide-react';
import { api } from './api';
import {
  CATEGORIES,
  labels,
  PRIORITIES,
  type Solicitation,
  type SolicitationInput,
  type Status,
  type Summary as SummaryData,
  validateSolicitationInput,
} from './types';

export function Badge({ value }: { value: string }) {
  return <span className={`badge badge-${value.toLowerCase()}`}>{labels[value] ?? value}</span>;
}

export function Loading() {
  return <div className="state"><div className="spinner" aria-label="Carregando" /><span>Carregando solicitações...</span></div>;
}

export function Summary({ summary }: { summary: SummaryData | null }) {
  const stats = summary
    ? { total: summary.total, abertas: summary.total - summary.by_status.CONCLUIDA - summary.by_status.CANCELADA, urgentes: summary.by_priority.URGENTE, concluidas: summary.by_status.CONCLUIDA }
    : { total: 0, abertas: 0, urgentes: 0, concluidas: 0 };

  return <section aria-label="Resumo" className="summary">{[['Total', stats.total, 'summary-blue'], ['Em andamento', stats.abertas, 'summary-orange'], ['Urgentes', stats.urgentes, 'summary-red'], ['Concluídas', stats.concluidas, 'summary-green']].map(([title, value, style]) => <div className={`summary-card ${style}`} key={String(title)}><span>{title}</span><strong>{value}</strong></div>)}</section>;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
}

export function SolicitationForm({ onSaved, onCancel }: { onSaved: (item: Solicitation) => void; onCancel: () => void }) {
  const [form, setForm] = useState<SolicitationInput>({ nome_solicitante: '', categoria: 'CONSULTA', prioridade: 'MEDIA', descricao: '', justificativa_prioridade: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const update = (key: keyof SolicitationInput, value: string) => setForm(current => ({ ...current, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    const validationError = validateSolicitationInput(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    try {
      onSaved(await api.create(form));
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return <div className="panel form-panel"><div className="panel-header"><div><p className="eyebrow">Nova solicitação</p><h2>Registrar atendimento</h2></div><button className="icon-button" onClick={onCancel} aria-label="Fechar formulário"><X size={20} /></button></div><form onSubmit={submit} className="form-grid">{error && <div className="alert error full">{error}</div>}<label>Nome do solicitante<input value={form.nome_solicitante} onChange={event => update('nome_solicitante', event.target.value)} required minLength={2} maxLength={150} /></label><label>Categoria<select value={form.categoria} onChange={event => update('categoria', event.target.value as SolicitationInput['categoria'])}>{CATEGORIES.map(value => <option key={value} value={value}>{labels[value]}</option>)}</select></label><label>Prioridade<select value={form.prioridade} onChange={event => update('prioridade', event.target.value as SolicitationInput['prioridade'])}>{PRIORITIES.map(value => <option key={value} value={value}>{labels[value]}</option>)}</select></label><label className="full">Descrição<textarea value={form.descricao} onChange={event => update('descricao', event.target.value)} required minLength={10} maxLength={2000} rows={5} /></label>{form.prioridade === 'URGENTE' && <label className="full">Justificativa da urgência<textarea value={form.justificativa_prioridade} onChange={event => update('justificativa_prioridade', event.target.value)} required rows={3} /></label>}<div className="actions full"><button type="button" className="button secondary" onClick={onCancel}>Cancelar</button><button className="button primary" disabled={saving}>{saving ? 'Salvando...' : 'Criar solicitação'}</button></div></form></div>;
}

export function SolicitationDetail({ item, onBack, onUpdated }: { item: Solicitation; onBack: () => void; onUpdated: (item: Solicitation) => void }) {
  const [status, setStatus] = useState<Status>(item.status);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const next: Status[] = item.status === 'RECEBIDA' ? ['EM_ANALISE', 'CANCELADA'] : item.status === 'EM_ANALISE' ? ['AGENDADA', 'CANCELADA'] : item.status === 'AGENDADA' ? ['CONCLUIDA', 'CANCELADA'] : [];

  async function change(value: Status) {
    setSaving(true);
    setError('');
    try {
      const updated = await api.updateStatus(item.id, value);
      setStatus(updated.status);
      onUpdated(updated);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return <main className="content"><button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Voltar para solicitações</button><div className="panel detail"><div className="detail-top"><div><p className="eyebrow">{item.protocolo}</p><h2>{item.nome_solicitante}</h2></div><Badge value={status} /></div>{error && <div className="alert error">{error}</div>}<dl className="detail-grid"><div><dt>Categoria</dt><dd><Badge value={item.categoria} /></dd></div><div><dt>Prioridade</dt><dd><Badge value={item.prioridade} /></dd></div><div><dt>Criada em</dt><dd>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.data_criacao))}</dd></div><div><dt>Atualizada em</dt><dd>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.data_atualizacao))}</dd></div></dl><div className="description"><h3>Descrição</h3><p>{item.descricao}</p></div>{item.justificativa_prioridade && <div className="description"><h3>Justificativa da prioridade</h3><p>{item.justificativa_prioridade}</p></div>}{next.length > 0 && <div className="status-action"><label htmlFor="new-status">Atualizar status</label><select id="new-status" value={status} disabled={saving} onChange={event => void change(event.target.value as Status)}>{[status, ...next].map(value => <option key={value} value={value}>{labels[value]}</option>)}</select><small>A alteração é validada pelas regras do atendimento.</small></div>}</div></main>;
}

export function Shell({ children }: { children: ReactNode }) {
  return <div className="app"><header><div className="brand"><span className="brand-mark">V</span><span>V-Lab <small>ATENDIMENTO</small></span></div><div className="header-note">Gestão de solicitações</div></header>{children}</div>;
}

export { ClipboardList, Plus, Search };
