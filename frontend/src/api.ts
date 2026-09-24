import type { Paginated, Solicitation, SolicitationInput, Status, Summary } from './types';
const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:8000/api/v1';
async function request<T>(path:string, init?:RequestInit):Promise<T> { const response = await fetch(`${base}${path}`, { headers:{'Content-Type':'application/json', Accept:'application/json'}, ...init }); if (!response.ok) { const body = await response.json().catch(() => ({})) as {message?:string; errors?:Record<string,string[]>}; const error = new Error(body.message ?? 'Não foi possível concluir a operação.'); (error as Error & {errors?:Record<string,string[]>}).errors = body.errors; throw error; } return response.json() as Promise<T>; }
export const api = {
  list: (params:Record<string,string|number>) => request<Paginated<Solicitation>>(`/solicitacoes?${new URLSearchParams(Object.entries(params).map(([k,v]) => [k,String(v)]))}`),
  summary: () => request<Summary>('/solicitacoes/resumo'),
  get: (id:number) => request<Solicitation>(`/solicitacoes/${id}`),
  create: (input:SolicitationInput) => request<Solicitation>('/solicitacoes',{method:'POST',body:JSON.stringify(input)}),
  updateStatus: (id:number,status:Status) => request<Solicitation>(`/solicitacoes/${id}/status`,{method:'PATCH',body:JSON.stringify({status})}),
};
