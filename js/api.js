const API_URL = 'https://graduabm-backend-production.up.railway.app';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch (err) {
    throw { status: 0, erro: 'Sem conexão com o servidor. Verifique sua internet.' };
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw { status: res.status, erro: `Resposta inválida do servidor (HTTP ${res.status})` };
  }

  if (res.status === 401 && data.erro && data.erro.includes('Sessão encerrada')) {
    alert(data.erro);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login';
    throw new Error('Sessão encerrada');
  }

  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

const GraduaBM = {
  getUsuario() {
    try { return JSON.parse(localStorage.getItem('usuario')); }
    catch { return null; }
  },

  isAdmin() {
    return sessionStorage.getItem('graduabm_admin') === '1';
  },

  async protegerRota() {
    if (GraduaBM.isAdmin()) return;

    if (!GraduaBM.Auth.estaLogado()) {
      window.location.href = '/login';
      return;
    }
    try {
      const data = await request('/api/auth/me');
      if (data.usuario) localStorage.setItem('usuario', JSON.stringify(data.usuario));
      if (!data.usuario?.ativo) {
        window.location.href = '/login';
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
  },

  Auth: {
    estaLogado() {
      return !!localStorage.getItem('token');
    },
    usuarioAtivo() {
      const u = GraduaBM.getUsuario();
      return u?.ativo === true;
    },
    async login({ email, senha }) {
      const data = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      });
      if (data.token) localStorage.setItem('token', data.token);
      if (data.usuario) localStorage.setItem('usuario', JSON.stringify(data.usuario));
      return data;
    },
    async cadastrar({ nome, email, senha, curso, nickname }) {
      const data = await request('/api/auth/cadastro', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha, curso, nickname: nickname || undefined }),
      });
      if (data.token) localStorage.setItem('token', data.token);
      if (data.usuario) localStorage.setItem('usuario', JSON.stringify(data.usuario));
      return data;
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    },
    async esqueciSenha({ email }) {
      return request('/api/auth/esqueci-senha', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    async redefinirSenha({ token, nova_senha }) {
      return request('/api/auth/redefinir-senha', {
        method: 'POST',
        body: JSON.stringify({ token, nova_senha }),
      });
    },
    async alterarSenha({ senha_atual, nova_senha }) {
      return request('/api/auth/alterar-senha', {
        method: 'POST',
        body: JSON.stringify({ senha_atual, nova_senha }),
      });
    },
  },

  Progresso: {
    desempenho({ curso } = {}) {
      const qs = curso ? `?curso=${encodeURIComponent(curso)}` : '';
      return request('/api/progresso/desempenho' + qs);
    },
    errosPorLegislacao() {
      return request('/api/progresso/erros-por-legislacao');
    },
    sessoesRecentes() {
      return request('/api/progresso/sessoes-recentes');
    },
    evolucaoSemanal() {
      return request('/api/progresso/evolucao-semanal');
    }
  },

  Ranking: {
    listar() {
      return request('/api/ranking');
    },
  },

  // API unificada — questões e sessões
  api: {
    questoes: {
      listar(qs) {
        return request('/api/questoes?' + qs);
      },
      simulado(curso) {
        return request(`/api/questoes/simulado?curso=${curso}`);
      },
      erros() {
        return request('/api/questoes/erros');
      },
    },
    sessoes: {
      criar(body) {
        return request('/api/sessoes', { method: 'POST', body: JSON.stringify(body) });
      },
      responder(id, body) {
        return request('/api/sessoes/' + id + '/respostas', { method: 'POST', body: JSON.stringify(body) });
      },
      encerrar(id) {
        return request('/api/sessoes/' + id + '/encerrar', { method: 'PATCH' });
      },
    },
    denuncias: {
      reportar(questao_id, comentario) {
        return request('/api/denuncias', { method: 'POST', body: JSON.stringify({ questao_id, comentario }) });
      },
    },
    flashcards: {
      listar(qs = '') {
        return request('/api/flashcards' + (qs ? '?' + qs : ''));
      },
    },
  },
};

