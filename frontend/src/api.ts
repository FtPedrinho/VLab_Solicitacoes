import type { AuthUser, Paginated, Solicitation, SolicitationInput, Status, Summary, UserRole } from './types';
const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://127.0.0.1:8000/api/v1';
const TOKEN_KEY = 'vlab.auth.token';
export const getToken = () => window.localStorage.getItem(TOKEN_KEY);
export const clearToken = () => window.localStorage.removeItem(TOKEN_KEY);
async function request<T>(path:string, init?:RequestInit):Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${base}${path}`, { ...init, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as {message?:string; errors?:Record<string,string[]>};
    const error = new Error(body.message ?? 'Não foi possível concluir a operação.');
    (error as Error & {errors?:Record<string,string[]>; status?:number}).errors = body.errors;
    (error as Error & {status?:number}).status = response.status;
    throw error;
  }
  return response.json() as Promise<T>;
}
export const api = {
  login: async (email:string, password:string) => {
    const result = await request<{token:string; user:AuthUser}>('/auth/login', { method:'POST', body:JSON.stringify({ email, password }) });
    window.localStorage.setItem(TOKEN_KEY, result.token);
    return result.user;
  },
  register: async (input:{name:string; email:string; password:string; role:UserRole}) => {
    const result = await request<{token:string; user:AuthUser}>('/auth/register', { method:'POST', body:JSON.stringify(input) });
    window.localStorage.setItem(TOKEN_KEY, result.token);
    return result.user;
  },
  me: () => request<AuthUser>('/auth/me'),
  logout: async () => { try { await request<{message:string}>('/auth/logout', { method:'POST' }); } finally { clearToken(); } },
  list: (params:Record<string,string|number>) => request<Paginated<Solicitation>>(`/solicitacoes?${new URLSearchParams(Object.entries(params).map(([k,v]) => [k,String(v)]))}`),
  summary: () => request<Summary>('/solicitacoes/resumo'),
  get: (id:number) => request<Solicitation>(`/solicitacoes/${id}`),
  create: (input:SolicitationInput) => request<Solicitation>('/solicitacoes',{method:'POST',body:JSON.stringify(input)}),
  updateStatus: (id:number,status:Status) => request<Solicitation>(`/solicitacoes/${id}/status`,{method:'PATCH',body:JSON.stringify({status})}),
};
