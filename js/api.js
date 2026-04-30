const API_URL = 'https://graduabm-backend-production.up.railway.app';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

const api = {
  auth: {
    cadastro: (body) => request('/api/auth/cadastro', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request('/api/auth/me'),
  },
  questoes: {
    listar: (params = {}) => request('/api/questoes?' + new URLSearchParams(params)),
    legislacoes: () => request('/api/questoes/legislacoes'),
    erros: () => request('/api/questoes/erros'),
  },
  sessoes: {
    criar: (body) => request('/api/sessoes', { method: 'POST', body: JSON.stringify(body) }),
    responder: (id, body) => request(`/api/sessoes/${id}/respostas`, { method: 'POST', body: JSON.stringify(body) }),
    encerrar: (id) => request(`/api/sessoes/${id}/encerrar`, { method: 'PATCH' }),
  },
  progresso: {
    desempenho: () => request('/api/progresso/desempenho'),
    errosPorLegislacao: () => request('/api/progresso/erros-por-legislacao'),
    sessoesRecentes: () => request('/api/progresso/sessoes-recentes'),
    evolucaoSemanal: () => request('/api/progresso/evolucao-semanal'),
  },
};
