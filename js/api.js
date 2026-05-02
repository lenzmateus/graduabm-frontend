const API_URL = 'https://graduabm-backend-production.up.railway.app';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();

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
    async cadastrar({ nome, email, senha }) {
      const data = await request('/api/auth/cadastro', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha }),
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
  },

  Progresso: {
    desempenho() {
      return request('/api/progresso/desempenho');
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
};
