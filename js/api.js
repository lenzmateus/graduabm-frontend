const API_URL = 'https://graduabm-backend-production.up.railway.app';

async function request(path, options = {}) {
  const token = sessionStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: options.signal || AbortSignal.timeout(15000),
    });
  } catch (err) {
    if (err.name === 'TimeoutError') throw { status: 0, erro: 'Servidor demorou muito para responder. Tente novamente.' };
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
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    window.location.href = '/login';
    throw new Error('Sessão encerrada');
  }

  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

const PBM = {
  getUsuario() {
    try { return JSON.parse(sessionStorage.getItem('usuario')); }
    catch { return null; }
  },

  isAdmin() {
    return sessionStorage.getItem('pbm_admin') === '1';
  },

  isGestor() {
    return sessionStorage.getItem('pbm_gestor') === '1';
  },

  isStaff() {
    return PBM.isAdmin() || PBM.isGestor();
  },

  async protegerRota() {
    if (PBM.isAdmin()) return;

    if (!PBM.Auth.estaLogado()) {
      window.location.href = '/login';
      return;
    }
    try {
      const data = await request('/api/auth/me');
      if (data.usuario) sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
      if (!data.usuario?.ativo) {
        window.location.href = '/login';
      }
    } catch {
      sessionStorage.clear();
      window.location.href = '/login';
    }
  },

  Auth: {
    estaLogado() {
      return !!sessionStorage.getItem('token');
    },
    usuarioAtivo() {
      const u = PBM.getUsuario();
      return u?.ativo === true;
    },
    async login({ email, senha }) {
      const data = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      });
      if (data.token) sessionStorage.setItem('token', data.token);
      if (data.usuario) sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
      return data;
    },
    async cadastrar({ nome, email, senha, curso, nickname }) {
      const data = await request('/api/auth/cadastro', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha, curso, nickname: nickname || undefined }),
      });
      if (data.token) sessionStorage.setItem('token', data.token);
      if (data.usuario) sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
      return data;
    },
    logout() {
      sessionStorage.clear();
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
    listar(curso = '') {
      return request('/api/ranking' + (curso ? `?curso=${curso}` : ''));
    },
    simulados(curso = '') {
      return request('/api/ranking/simulados' + (curso ? `?curso=${curso}` : ''));
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
        return request('/api/sessoes/' + id + '/respostas', { method: 'POST', body: JSON.stringify(body), keepalive: true });
      },
      encerrar(id) {
        return request('/api/sessoes/' + id + '/encerrar', { method: 'PATCH', keepalive: true });
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

  Gestor: {
    getToken() {
      return sessionStorage.getItem('pbm_gestor_token') || '';
    },
    logout() {
      ['pbm_gestor','pbm_gestor_token','pbm_gestor_nome','pbm_gestor_email'].forEach(k => sessionStorage.removeItem(k));
      window.location.href = '/gestor-login';
    },
    query(path, prefer, method, body) {
      return fetch(API_URL + '/api/gestor/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PBM.Gestor.getToken()}`,
        },
        body: JSON.stringify({ path, method: method || 'GET', body: body || undefined, prefer: prefer || null }),
      }).then(r => r.json());
    },
  },

  Admin: {
    _authHeader() {
      const jwt = sessionStorage.getItem('pbm_admin_jwt') || '';
      return { 'Authorization': `Bearer ${jwt}` };
    },
    assinaturas: {
      stats() {
        return request('/api/admin/assinaturas/stats', { headers: PBM.Admin._authHeader() });
      },
      listar(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return request('/api/admin/assinaturas' + (qs ? '?' + qs : ''), { headers: PBM.Admin._authHeader() });
      },
      gerenciar(userId, body) {
        return request(`/api/admin/assinaturas/${userId}`, { method: 'PATCH', body: JSON.stringify(body), headers: PBM.Admin._authHeader() });
      },
      logs(userId) {
        return request(`/api/admin/assinaturas/${userId}/logs`, { headers: PBM.Admin._authHeader() });
      },
      excluir(userId) {
        return request(`/api/admin/assinaturas/${userId}`, { method: 'DELETE', headers: PBM.Admin._authHeader() });
      },
    },
    cupons: {
      listar() {
        return request('/api/admin/cupons', { headers: PBM.Admin._authHeader() });
      },
      criar(body) {
        return request('/api/admin/cupons', { method: 'POST', body: JSON.stringify(body), headers: PBM.Admin._authHeader() });
      },
      editar(id, body) {
        return request(`/api/admin/cupons/${id}`, { method: 'PATCH', body: JSON.stringify(body), headers: PBM.Admin._authHeader() });
      },
      desativar(id) {
        return request(`/api/admin/cupons/${id}`, { method: 'DELETE', headers: PBM.Admin._authHeader() });
      },
      excluir(id) {
        return request(`/api/admin/cupons/${id}/excluir`, { method: 'DELETE', headers: PBM.Admin._authHeader() });
      },
    },
  },

  Cupons: {
    validar(codigo) {
      return request('/api/cupons/validar', { method: 'POST', body: JSON.stringify({ codigo }) });
    },
    aplicar(codigo) {
      return request('/api/cupons/aplicar', { method: 'POST', body: JSON.stringify({ codigo }) });
    },
  },

  MissaoFDS: {
    async status() {
      const [ativoRes, proximoRes] = await Promise.allSettled([
        PBM.SimuladoMensal.ativo(),
        PBM.SimuladoMensal.proximo(),
      ]);
      const ativo = ativoRes.status === 'fulfilled' ? ativoRes.value : null;
      const proximo = proximoRes.status === 'fulfilled' ? proximoRes.value : null;

      if (ativo && ativo.id) return { estado: 'active', simulado: ativo };
      if (proximo && proximo.abertura) return { estado: 'locked', proximo };

      try {
        const lista = await PBM.SimuladoMensal.listar();
        const ultimo = Array.isArray(lista) ? lista.find(s => s.status === 'encerrado') : null;
        return { estado: 'encerrado', ultimo: ultimo || null };
      } catch {
        return { estado: 'encerrado', ultimo: null };
      }
    },
  },

  SimuladoMensal: {
    listar() {
      return request('/api/simulados-mensais');
    },
    ativo() {
      return request('/api/simulados-mensais/ativo');
    },
    proximo() {
      return request('/api/simulados-mensais/proximo');
    },
    questoes(id) {
      return request(`/api/simulados-mensais/${id}/questoes`);
    },
    participar(id) {
      return request(`/api/simulados-mensais/${id}/participar`, { method: 'POST' });
    },
    entregar(id, respostas_cartao) {
      return request(`/api/simulados-mensais/${id}/entregar`, {
        method: 'PATCH',
        body: JSON.stringify({ respostas_cartao }),
      });
    },
    ranking(id) {
      return request(`/api/simulados-mensais/${id}/ranking`);
    },
    gabarito(id) {
      return request(`/api/simulados-mensais/${id}/gabarito`);
    },
    estatisticas(id) {
      return request(`/api/simulados-mensais/${id}/estatisticas`);
    },
    minhaParticipacao(id) {
      return request(`/api/simulados-mensais/${id}/minha-participacao`);
    },
  },
};

window.PBM = PBM;
