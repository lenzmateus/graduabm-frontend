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
      signal: options.signal || (AbortSignal.timeout ? AbortSignal.timeout(15000) : undefined),
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

  if (res.status === 401) {
    if (data.erro && data.erro.includes('Sessão encerrada')) {
      sessionStorage.setItem('pbm_session_msg', data.erro);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('usuario');
      const loginRedir = PBM?.isAdmin?.() ? '/admin-login' : '/login';
      window.location.href = loginRedir;
      throw new Error('Sessão encerrada');
    }
    if (PBM?.isAdmin?.()) {
      const adminJwt = sessionStorage.getItem('pbm_admin_jwt');
      if (adminJwt && options.headers?.['Authorization'] === `Bearer ${adminJwt}`) {
        PBM.Admin.logout();
      }
      throw { status: 401, ...data };
    }
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

  isStaff() {
    return PBM.isAdmin();
  },

  async protegerRota() {
    if (PBM.isAdmin()) return;

    if (!PBM.Auth.estaLogado()) {
      window.location.href = '/login';
      return;
    }
    try {
      const data = await PBM.Auth.me();
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
    async cadastrar({ nome, email, senha, curso, nickname, trial_token, ref }) {
      const data = await request('/api/auth/cadastro', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha, curso, nickname: nickname || undefined, trial_token: trial_token || undefined, ref: ref || undefined }),
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
    async me() {
      return request('/api/auth/me');
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
      legislacoes(curso, area) {
        const p = new URLSearchParams();
        if (curso) p.set('curso', curso);
        if (area) p.set('area', area);
        const qs = p.toString();
        return request('/api/questoes/legislacoes' + (qs ? '?' + qs : ''));
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
      revisar(id, qualidade) {
        return request(`/api/flashcards/${id}/revisar`, {
          method: 'POST',
          body: JSON.stringify({ qualidade }),
        });
      },
    },
  },

  Admin: {
    _authHeader() {
      const jwt = sessionStorage.getItem('pbm_admin_jwt') || '';
      return { 'Authorization': `Bearer ${jwt}` };
    },
    protegerRota() {
      if (sessionStorage.getItem('pbm_admin') !== '1' || !sessionStorage.getItem('pbm_admin_jwt')) {
        window.location.href = '/admin-login';
      }
    },
    logout() {
      ['pbm_admin', 'pbm_admin_ts', 'pbm_admin_jwt', 'pbm_admin_role', 'pbm_admin_nome', 'pbm_admin_email']
        .forEach(k => sessionStorage.removeItem(k));
      sessionStorage.removeItem('usuario');
      sessionStorage.removeItem('token');
      window.location.href = '/admin-login';
    },
    req(path, opts = {}) {
      const signal = opts.signal || (AbortSignal.timeout ? AbortSignal.timeout(60000) : undefined);
      return request(path, { ...opts, signal, headers: { ...PBM.Admin._authHeader(), ...(opts.headers || {}) } });
    },
    Auth: {
      async login({ email, senha }) {
        const data = await request('/api/admin/auth/login', {
          method: 'POST', body: JSON.stringify({ email, senha }),
        });
        if (data.token) {
          sessionStorage.setItem('pbm_admin', '1');
          sessionStorage.setItem('pbm_admin_jwt', data.token);
          sessionStorage.setItem('pbm_admin_role', data.admin.role);
          sessionStorage.setItem('pbm_admin_nome', data.admin.nome);
          sessionStorage.setItem('pbm_admin_email', data.admin.email);
        }
        return data;
      },
      esqueciSenha({ email }) {
        return request('/api/admin/auth/esqueci-senha', { method: 'POST', body: JSON.stringify({ email }) });
      },
      redefinirSenha({ token, nova_senha }) {
        return request('/api/admin/auth/redefinir-senha', { method: 'POST', body: JSON.stringify({ token, nova_senha }) });
      },
      validarConvite(token) {
        return request('/api/admin/auth/validar-convite?token=' + encodeURIComponent(token));
      },
      cadastrar({ email, nome, senha, token_convite }) {
        return request('/api/admin/auth/cadastrar', { method: 'POST', body: JSON.stringify({ email, nome, senha, token_convite }) });
      },
    },
    stats() {
      return PBM.Admin.req('/api/admin/stats');
    },
    async query(path, prefer, method, body) {
      const res = await fetch(API_URL + '/api/admin/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...PBM.Admin._authHeader() },
        body: JSON.stringify({ path, method: method || 'GET', body: body || undefined, prefer: prefer || null }),
      });
      if (res.status === 401) { PBM.Admin.logout(); return { ok: false, status: 401, data: null, contentRange: null }; }
      const text = await res.text();
      const contentRange = res.headers.get('Content-Range');
      return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : null, contentRange };
    },
    usuarios: {
      zerarProgresso(id) {
        return PBM.Admin.req(`/api/admin/usuarios/${id}/zerar-progresso`, { method: 'POST' });
      },
    },
    admins: {
      listar() { return PBM.Admin.req('/api/admin/admins'); },
      excluir(id) { return PBM.Admin.req(`/api/admin/admins/${id}`, { method: 'DELETE' }); },
      convidar(body) { return PBM.Admin.req('/api/admin/admins/convidar', { method: 'POST', body: JSON.stringify(body) }); },
    },
    simuladosMensais: {
      listar() { return PBM.Admin.req('/api/simulados-mensais/admin/listar'); },
      atualizar(id, body) { return PBM.Admin.req(`/api/simulados-mensais/admin/${id}`, { method: 'PATCH', body: JSON.stringify(body) }); },
      gerar(body) { return PBM.Admin.req('/api/simulados-mensais/admin/gerar', { method: 'POST', body: JSON.stringify(body) }); },
      criar(body) { return PBM.Admin.req('/api/simulados-mensais/admin/criar', { method: 'POST', body: JSON.stringify(body) }); },
      statusGeracao() { return PBM.Admin.req('/api/simulados-mensais/admin/status-geracao'); },
      questoesDisponiveis(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return PBM.Admin.req('/api/simulados-mensais/admin/questoes-disponiveis' + (qs ? '?' + qs : ''));
      },
      questoes(id) { return PBM.Admin.req(`/api/simulados-mensais/admin/${id}/questoes`); },
      adicionarQuestoes(id, ids) { return PBM.Admin.req(`/api/simulados-mensais/admin/${id}/questoes`, { method: 'POST', body: JSON.stringify({ questao_ids: ids }) }); },
      removerQuestao(id, questaoId) { return PBM.Admin.req(`/api/simulados-mensais/admin/${id}/questoes/${questaoId}`, { method: 'DELETE' }); },
      incorporar(id) { return PBM.Admin.req(`/api/simulados-mensais/admin/${id}/incorporar`, { method: 'POST' }); },
      ranking(id) { return PBM.Admin.req(`/api/simulados-mensais/admin/${id}/ranking`); },
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
    convites: {
      listar() {
        return request('/api/admin/convites', { headers: PBM.Admin._authHeader() });
      },
      criar(body) {
        return request('/api/admin/convites', { method: 'POST', body: JSON.stringify(body), headers: PBM.Admin._authHeader() });
      },
      editar(id, body) {
        return request(`/api/admin/convites/${id}`, { method: 'PATCH', body: JSON.stringify(body), headers: PBM.Admin._authHeader() });
      },
      excluir(id) {
        return request(`/api/admin/convites/${id}`, { method: 'DELETE', headers: PBM.Admin._authHeader() });
      },
    },
    indicacoes: {
      listar() { return PBM.Admin.req('/api/admin/indicacoes'); },
    },
    denuncias: {
      resumo() { return PBM.Admin.req('/api/admin/denuncias/resumo'); },
    },
    automatizar: {
      gerarQuestoes(area = 'todas', quantidade = 1) { return PBM.Admin.req('/api/admin/automatizar/gerar-questoes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ area, quantidade }) }); },
      gerarFlashcard() { return PBM.Admin.req('/api/admin/automatizar/gerar-flashcard', { method: 'POST' }); },
      cronLogs()       { return PBM.Admin.req('/api/admin/cron-logs'); },
    },
    aprovacoes: {
      resumo() { return PBM.Admin.req('/api/admin/aprovacoes/resumo'); },
      questoesIa: {
        listar()         { return PBM.Admin.req('/api/admin/aprovacoes/questoes-ia'); },
        aprovar(id, obs) { return PBM.Admin.req(`/api/admin/aprovacoes/questoes-ia/${id}/aprovar`, { method: 'POST', body: JSON.stringify({ observacao: obs }) }); },
        rejeitar(id, obs){ return PBM.Admin.req(`/api/admin/aprovacoes/questoes-ia/${id}/rejeitar`, { method: 'POST', body: JSON.stringify({ observacao: obs }) }); },
        editar(id, body) { return PBM.Admin.req(`/api/admin/aprovacoes/questoes-ia/${id}`, { method: 'PATCH', body: JSON.stringify(body) }); },
      },
      flashcards: {
        listar()         { return PBM.Admin.req('/api/admin/aprovacoes/flashcards'); },
        aprovar(id)      { return PBM.Admin.req(`/api/admin/aprovacoes/flashcards/${id}/aprovar`, { method: 'POST' }); },
        rejeitar(id, obs){ return PBM.Admin.req(`/api/admin/aprovacoes/flashcards/${id}/rejeitar`, { method: 'POST', body: JSON.stringify({ observacao: obs }) }); },
        editar(id, body) { return PBM.Admin.req(`/api/admin/aprovacoes/flashcards/${id}`, { method: 'PATCH', body: JSON.stringify(body) }); },
      },
      instagram: {
        listar()           { return PBM.Admin.req('/api/admin/aprovacoes/instagram'); },
        gerar(area)        { return PBM.Admin.req('/api/admin/aprovacoes/instagram/gerar', { method: 'POST', body: JSON.stringify({ area: area || null }) }); },
        publicar(id, opts) { return PBM.Admin.req(`/api/admin/aprovacoes/instagram/${id}/publicar`, { method: 'POST', ...(opts || {}) }); },
        rejeitar(id, obs)  { return PBM.Admin.req(`/api/admin/aprovacoes/instagram/${id}/rejeitar`, { method: 'POST', body: JSON.stringify({ observacao: obs }) }); },
        editar(id, caption){ return PBM.Admin.req(`/api/admin/aprovacoes/instagram/${id}`, { method: 'PATCH', body: JSON.stringify({ caption }) }); },
      },
      simulados: {
        listar()         { return PBM.Admin.req('/api/admin/aprovacoes/simulados-mensais'); },
        aprovar(id)      { return PBM.Admin.req(`/api/admin/aprovacoes/simulados-mensais/${id}/aprovar`, { method: 'POST' }); },
        rejeitar(id, obs){ return PBM.Admin.req(`/api/admin/aprovacoes/simulados-mensais/${id}/rejeitar`, { method: 'POST', body: JSON.stringify({ observacao: obs }) }); },
        editar(id, body) { return PBM.Admin.req(`/api/admin/aprovacoes/simulados-mensais/${id}`, { method: 'PATCH', body: JSON.stringify(body) }); },
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

  ConvitesTrial: {
    validar(token) {
      return request('/api/convites/validar?token=' + encodeURIComponent(token));
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

  Indicacoes: {
    meuLink() {
      return request('/api/indicacoes/meu-link');
    },
    historico() {
      return request('/api/indicacoes/historico');
    },
  },

  Notificacoes: {
    vapidPublicKey() {
      return request('/api/notificacoes/vapid-public-key');
    },
    obterPreferencias() {
      return request('/api/notificacoes/preferencias');
    },
    subscribe(subscription) {
      const sub = subscription.toJSON();
      return request('/api/notificacoes/push/subscribe', {
        method: 'POST',
        body: JSON.stringify({ endpoint: sub.endpoint, keys: sub.keys }),
      });
    },
    unsubscribe() {
      return request('/api/notificacoes/push/unsubscribe', { method: 'DELETE' });
    },
    salvarPreferencias(prefs) {
      return request('/api/notificacoes/preferencias', {
        method: 'PATCH',
        body: JSON.stringify(prefs),
      });
    },
    testarPush() {
      return request('/api/notificacoes/push/testar', { method: 'POST' });
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
