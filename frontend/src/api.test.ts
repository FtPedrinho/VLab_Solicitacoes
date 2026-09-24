import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';

describe('cliente HTTP da API', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('monta a listagem com filtros e paginação', async () => {
    const response = { data: [], current_page: 2, last_page: 2, per_page: 15, total: 0 };
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(response), { status: 200 }));

    await expect(api.list({ page: 2, status: 'EM_ANALISE' })).resolves.toEqual(response);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/solicitacoes?page=2&status=EM_ANALISE'),
      expect.objectContaining({ headers: expect.objectContaining({ Accept: 'application/json' }) }),
    );
  });

  it('converte erros HTTP em erro consumível pela interface', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'Solicitação não encontrada.' }), { status: 404 }));

    await expect(api.get(999999)).rejects.toThrow('Solicitação não encontrada.');
  });
});
