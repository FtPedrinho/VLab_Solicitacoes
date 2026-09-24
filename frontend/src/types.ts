export const STATUSES = ['RECEBIDA','EM_ANALISE','AGENDADA','CONCLUIDA','CANCELADA'] as const;
export const CATEGORIES = ['CONSULTA','EXAME','VACINACAO','OUTRO'] as const;
export const PRIORITIES = ['BAIXA','MEDIA','ALTA','URGENTE'] as const;
export type Status = typeof STATUSES[number]; export type Category = typeof CATEGORIES[number]; export type Priority = typeof PRIORITIES[number];
export interface Solicitation { id:number; protocolo:string; nome_solicitante:string; categoria:Category; prioridade:Priority; status:Status; descricao:string; justificativa_prioridade?:string|null; data_criacao:string; data_atualizacao:string }
export interface Paginated<T> { data:T[]; current_page:number; last_page:number; per_page:number; total:number }
export interface Summary { total:number; by_status:Record<Status,number>; by_category:Record<Category,number>; by_priority:Record<Priority,number> }
export interface SolicitationInput { nome_solicitante:string; categoria:Category; prioridade:Priority; descricao:string; justificativa_prioridade?:string }
export const labels:Record<string,string> = { RECEBIDA:'Recebida', EM_ANALISE:'Em análise', AGENDADA:'Agendada', CONCLUIDA:'Concluída', CANCELADA:'Cancelada', CONSULTA:'Consulta', EXAME:'Exame', VACINACAO:'Vacinação', OUTRO:'Outro', BAIXA:'Baixa', MEDIA:'Média', ALTA:'Alta', URGENTE:'Urgente' };
export function validateSolicitationInput(input: SolicitationInput): string | null {
  if (input.nome_solicitante.trim().length < 2 || input.descricao.trim().length < 10) {
    return 'Confira os campos obrigatórios e as regras de validação.';
  }

  if (input.prioridade === 'URGENTE' && !input.justificativa_prioridade?.trim()) {
    return 'Confira os campos obrigatórios e as regras de validação.';
  }

  return null;
}
