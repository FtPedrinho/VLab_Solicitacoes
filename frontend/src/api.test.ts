import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';

describe('cliente HTTP da API', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('monta a listagem com filtros e paginação', async () => {
    const response = { data: [], current_page: 2, last_page: 2, per_page: 15, total: 0 };
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(response), { status: 200 }));

    await expect(api.list({ page: 2, status: 'EM_ANALISE' })).resolves.toEqual(response);

    expect(fetchMock.mock.calls[0][0]).toContain('/solicitacoes?page=2&status=EM_ANALISE');
    expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get('Accept')).toBe('application/json');
  });

  it('converte erros HTTP em erro consumível pela interface', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'Solicitação não encontrada.' }), { status: 404 }));

    await expect(api.get(999999)).rejects.toThrow('Solicitação não encontrada.');
  });

  it('persiste login e envia Bearer nas requisições protegidas', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: 'abc123', user: { id: 1, name: 'Teste', email: 'test@example.com', role: 'atendente' } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 1, name: 'Teste', email: 'test@example.com', role: 'atendente' }), { status: 200 }));
    await api.login('test@example.com', 'password');
    await api.me();
    expect(localStorage.getItem('vlab.auth.token')).toBe('abc123');
    expect(new Headers(fetchMock.mock.calls[1][1]?.headers).get('Authorization')).toBe('Bearer abc123');
  });

  it('remove o token mesmo quando logout falha', async () => {
    localStorage.setItem('vlab.auth.token', 'abc123');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 500 }));
    await expect(api.logout()).rejects.toThrow();
    expect(localStorage.getItem('vlab.auth.token')).toBeNull();
  });

  it('cria conta, persiste o token e retorna o perfil escolhido', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      token: 'new-token',
      user: { id: 2, name: 'Nova Pessoa', email: 'nova@example.com', role: 'solicitante' },
    }), { status: 201 }));

    await expect(api.register({
      name: 'Nova Pessoa',
      email: 'nova@example.com',
      password: 'secret123',
      role: 'solicitante',
    })).resolves.toMatchObject({ role: 'solicitante' });
    expect(localStorage.getItem('vlab.auth.token')).toBe('new-token');
  });
});
