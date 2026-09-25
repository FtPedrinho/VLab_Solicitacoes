import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, ClipboardList, LogOut, Plus, Search, X } from 'lucide-react';
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

export function Login({ onLogin, onRegister }: { onLogin: (email: string, password: string) => Promise<void>; onRegister: (name: string, email: string, password: string, role: 'admin' | 'atendente' | 'solicitante') => Promise<void> }) {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'atendente' | 'solicitante'>('solicitante');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setSaving(true);
    try {
      if (mode === 'login') await onLogin(email, password);
      else await onRegister(name, email, password, role);
    } catch (cause) { setError(errorMessage(cause)); } finally { setSaving(false); }
  }
  return <div className="app auth-page"><main className="panel login-panel" aria-labelledby="login-title"><div className="brand"><span className="brand-mark">V</span><span>V-Lab <small>ATENDIMENTO</small></span></div><p className="eyebrow">{mode === 'login' ? 'Acesso seguro' : 'Nova conta'}</p><h1 id="login-title">{mode === 'login' ? 'Entrar no painel' : 'Criar conta'}</h1><p className="muted">{mode === 'login' ? 'Use suas credenciais para gerenciar solicitações.' : 'Selecione o perfil da conta para a demonstração.'}</p>{error && <div className="alert error" role="alert" tabIndex={-1}>{error}</div>}<form onSubmit={submit} className="form-grid">{mode === 'register' && <label className="full">Nome<input value={name} onChange={event => setName(event.target.value)} required minLength={2} autoComplete="name" /></label>}<label>E-mail<input type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="username" /></label><label>Senha<input type="password" value={password} onChange={event => setPassword(event.target.value)} required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>{mode === 'register' && <label className="full">Perfil<select value={role} onChange={event => setRole(event.target.value as typeof role)}><option value="solicitante">Paciente/usuário</option><option value="atendente">Atendente</option><option value="admin">Administrador</option></select></label>}<button className="button primary full" disabled={saving}>{saving ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta e entrar'}</button></form>{mode === 'login' ? <p className="muted login-hint">Demonstração: test@example.com / password</p> : <p className="muted login-hint">Escolha um perfil fictício para testar as permissões.</p>}<button className="button secondary full" type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'Criar nova conta' : 'Já tenho uma conta'}</button></main></div>;
}

export function Badge({ value }: { value: string }) {
  return <span className={`badge badge-${value.toLowerCase()}`}>{labels[value] ?? value}</span>;
}

export function Loading() {
  return <div className="state" role="status" aria-live="polite" aria-busy="true"><div className="spinner" aria-hidden="true" /><span>Carregando solicitações...</span></div>;
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
  const nameRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => { nameRef.current?.focus(); }, []);
  const update = (key: keyof SolicitationInput, value: string) => setForm(current => ({ ...current, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    const validationError = validateSolicitationInput(form);
    if (validationError) {
      setError(validationError);
      requestAnimationFrame(() => errorRef.current?.focus());
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

  return <div className="panel form-panel"><div className="panel-header"><div><p className="eyebrow">Nova solicitação</p><h2 id="form-title">Registrar atendimento</h2></div><button className="icon-button" onClick={onCancel} aria-label="Fechar formulário"><X size={20} aria-hidden="true" /></button></div><form onSubmit={submit} className="form-grid" aria-labelledby="form-title" aria-busy={saving}>{error && <div ref={errorRef} className="alert error full" role="alert" tabIndex={-1}>{error}</div>}<label>Nome do solicitante<input ref={nameRef} value={form.nome_solicitante} onChange={event => update('nome_solicitante', event.target.value)} required minLength={2} maxLength={150} /></label><label>Categoria<select value={form.categoria} onChange={event => update('categoria', event.target.value as SolicitationInput['categoria'])}>{CATEGORIES.map(value => <option key={value} value={value}>{labels[value]}</option>)}</select></label><label>Prioridade<select value={form.prioridade} onChange={event => update('prioridade', event.target.value as SolicitationInput['prioridade'])}>{PRIORITIES.map(value => <option key={value} value={value}>{labels[value]}</option>)}</select></label><label className="full">Descrição<textarea value={form.descricao} onChange={event => update('descricao', event.target.value)} required minLength={10} maxLength={2000} rows={5} /></label>{form.prioridade === 'URGENTE' && <label className="full">Justificativa da urgência<textarea value={form.justificativa_prioridade} onChange={event => update('justificativa_prioridade', event.target.value)} required rows={3} /></label>}<div className="actions full"><button type="button" className="button secondary" onClick={onCancel}>Cancelar</button><button className="button primary" disabled={saving}>{saving ? 'Salvando...' : 'Criar solicitação'}</button></div></form></div>;
}

export function SolicitationDetail({ item, feedback, onBack, onUpdated }: { item: Solicitation; feedback?: string; onBack: () => void; onUpdated: (item: Solicitation) => void }) {
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

  return <main className="content"><button className="back-link" onClick={onBack}><ArrowLeft size={16} aria-hidden="true" /> Voltar para solicitações</button><div className="panel detail"><div className="detail-top"><div><p className="eyebrow">{item.protocolo}</p><h2>{item.nome_solicitante}</h2></div><Badge value={status} /></div>{feedback && <div className="alert success" role="status" aria-live="polite">{feedback}</div>}{error && <div className="alert error" role="alert">{error}</div>}<dl className="detail-grid"><div><dt>Categoria</dt><dd><Badge value={item.categoria} /></dd></div><div><dt>Prioridade</dt><dd><Badge value={item.prioridade} /></dd></div><div><dt>Criada em</dt><dd>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.data_criacao))}</dd></div><div><dt>Atualizada em</dt><dd>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.data_atualizacao))}</dd></div></dl><div className="description"><h3>Descrição</h3><p>{item.descricao}</p></div>{item.justificativa_prioridade && <div className="description"><h3>Justificativa da prioridade</h3><p>{item.justificativa_prioridade}</p></div>}{next.length > 0 && <div className="status-action"><label htmlFor="new-status">Atualizar status</label><select id="new-status" value={status} disabled={saving} aria-busy={saving} onChange={event => void change(event.target.value as Status)}>{[status, ...next].map(value => <option key={value} value={value}>{labels[value]}</option>)}</select><small>A alteração é validada pelas regras do atendimento.</small></div>}</div></main>;
}

export function Shell({ children, user, onLogout }: { children: ReactNode; user: { name: string; role: string }; onLogout: () => void }) {
  return <div className="app"><header><div className="brand"><span className="brand-mark">V</span><span>V-Lab <small>ATENDIMENTO</small></span></div><div className="header-actions"><span className="header-note">{user.name} · {user.role}</span><button className="icon-button" onClick={onLogout} aria-label="Sair"><LogOut size={18} aria-hidden="true" /></button></div></header>{children}</div>;
}

export { ClipboardList, Plus, Search };
