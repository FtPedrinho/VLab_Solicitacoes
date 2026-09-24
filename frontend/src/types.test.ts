import { describe, expect, it } from 'vitest';
import { CATEGORIES, PRIORITIES, STATUSES, labels, validateSolicitationInput, type SolicitationInput } from './types';

describe('contratos da solicitação', () => {
  it('mantém opções sincronizadas com os valores da API', () => {
    expect(STATUSES).toContain('EM_ANALISE');
    expect(CATEGORIES).toContain('VACINACAO');
    expect(PRIORITIES).toContain('URGENTE');
    expect(labels.EM_ANALISE).toBe('Em análise');
  });

  it('exige justificativa para prioridade urgente', () => {
    const input: SolicitationInput = {
      nome_solicitante: 'João Exemplo',
      categoria: 'EXAME',
      prioridade: 'URGENTE',
      descricao: 'Solicitação fictícia de exame.',
    };

    expect(validateSolicitationInput(input)).toContain('Confira');
    expect(validateSolicitationInput({ ...input, justificativa_prioridade: 'Necessidade fictícia.' })).toBeNull();
  });
});
