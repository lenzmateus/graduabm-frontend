/* ─────────────────────────────────────────────────────────────
   ANTI-FLASH DE TEMA
   Aplicar a classe .light-mode ANTES do CSS pintar evita o flash
   branco-para-preto (FOUC) na carga inicial. Executado imediato.
   ───────────────────────────────────────────────────────────── */
(function aplicarTemaImediato() {
  try {
    if (document.querySelector('meta[name="pbm-force-dark"]')) {
      document.documentElement.classList.remove('light-mode');
      return;
    }
    const pref = localStorage.getItem('pbm-theme') || 'dark';
    let isLight = false;
    if (pref === 'light') isLight = true;
    else if (pref === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches) isLight = true;
    if (isLight) document.documentElement.classList.add('light-mode');
  } catch (e) { /* localStorage indisponível: assume escuro */ }
})();

// Vazio → fetch usa caminhos relativos e cai no rewrite `/api/*` do vercel.json,
// que proxia para o Railway. Mantém o tráfego same-origin (sem preflight CORS) e
// transforma cold-starts do Railway em 504 honestos do Vercel, em vez de erros
// CORS sem headers vindos do edge.
const API_URL = '';

// Decide admin-vs-aluno a partir do JWT efetivamente enviado, não de string-match com sessionStorage.
// Decisão e racional em docs/adr/0002-handler-401-redireciona-com-opt-out.md.
function _decodeJwtPayload(authHeader) {
  if (!authHeader || typeof authHeader !== 'string') return null;
  const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  const parts = jwt.split('.');
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
    return JSON.parse(decodeURIComponent(escape(atob(b64 + pad))));
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const token = sessionStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token && !headers['Authorization']) headers['Authorization'] = `Bearer ${token}`;

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

  if (res.status === 401 && !options.silenciar401) {
    const payload = _decodeJwtPayload(headers['Authorization']);
    const isAdminReq = payload?.tipo === 'admin';
    // Detecção de admin no sessionStorage (caso o request tenha ido sem header
    // de admin, ex: sidebar de aluno chamando endpoint de aluno enquanto o admin
    // está no /ranking em modo preview).
    let temSessaoAdmin = false;
    try {
      temSessaoAdmin = sessionStorage.getItem('pbm_admin') === '1'
        && !!sessionStorage.getItem('pbm_admin_jwt');
    } catch {}

    const ehEndpointAdmin = path.startsWith('/api/admin/');
    // Fazemos logout só quando o 401 representa uma sessão real do tipo correto
    // expirando: aluno chamando endpoint de aluno OU admin chamando endpoint admin.
    // 401 de admin chamando endpoint de aluno, ou de admin com sessão admin ativa
    // chamando endpoints de aluno sem header, NÃO é sessão expirada.
    let ehLogoutSessao;
    if (isAdminReq) {
      ehLogoutSessao = ehEndpointAdmin;
    } else if (temSessaoAdmin) {
      ehLogoutSessao = false;
    } else {
      ehLogoutSessao = true;
    }

    if (ehLogoutSessao) {
      const ehSessaoEncerrada = data?.erro && String(data.erro).includes('Sessão encerrada');
      const toastMsg = ehSessaoEncerrada
        ? 'Sua sessão foi encerrada porque você fez login em outro dispositivo.'
        : 'Sessão expirada. Faça login novamente.';
      sessionStorage.setItem('pbm_session_msg', toastMsg);

      if (isAdminReq) {
        ['pbm_admin', 'pbm_admin_ts', 'pbm_admin_jwt', 'pbm_admin_role', 'pbm_admin_nome', 'pbm_admin_email']
          .forEach(k => sessionStorage.removeItem(k));
      }
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('usuario');

      window.location.href = isAdminReq ? '/admin-login' : '/login';
    }
    throw { status: 401, ...data };
  }

  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

const PBM = {
  /* ───────────────────────────────────────────────
     Tema (Escuro / Claro / Sistema)
     - Preferência persistida em localStorage('pbm-theme')
     - Reativo a mudanças do SO quando preferência == 'system'
     - Sincronizado entre abas via evento 'storage'
     - Notifica componentes via 'pbm-theme-changed'
     ─────────────────────────────────────────────── */
  Theme: {
    _started: false,
    _mediaQuery: null,
    getPreference() {
      try { return localStorage.getItem('pbm-theme') || 'dark'; }
      catch { return 'dark'; }
    },
    getEffective() {
      const pref = this.getPreference();
      if (pref === 'light') return 'light';
      if (pref === 'dark') return 'dark';
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    },
    setTheme(mode) {
      if (!['light', 'dark', 'system'].includes(mode)) return;
      try { localStorage.setItem('pbm-theme', mode); } catch (e) {}
      this.applyTheme();
      this.updateUISelector();
      this._dispatch();
    },
    applyTheme() {
      const root = document.documentElement;
      if (document.querySelector('meta[name="pbm-force-dark"]')) {
        root.classList.remove('light-mode');
        return;
      }
      const isLight = this.getEffective() === 'light';
      root.classList.toggle('light-mode', isLight);
    },
    updateUISelector() {
      const pref = this.getPreference();
      document.querySelectorAll('.theme-btn').forEach(btn => {
        const active = btn.dataset.theme === pref;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    },
    _dispatch() {
      try {
        window.dispatchEvent(new CustomEvent('pbm-theme-changed', {
          detail: { preference: this.getPreference(), effective: this.getEffective() }
        }));
      } catch (e) {}
    },
    init() {
      if (this._started) return;
      this._started = true;

      this.applyTheme();
      this.updateUISelector();

      this._mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      const onSystemChange = () => {
        if (this.getPreference() === 'system') {
          this.applyTheme();
          this._dispatch();
        }
      };
      if (this._mediaQuery.addEventListener) {
        this._mediaQuery.addEventListener('change', onSystemChange);
      } else if (this._mediaQuery.addListener) {
        this._mediaQuery.addListener(onSystemChange);
      }

      window.addEventListener('storage', (event) => {
        if (event.key !== 'pbm-theme') return;
        this.applyTheme();
        this.updateUISelector();
        this._dispatch();
      });

      document.addEventListener('click', (event) => {
        const btn = event.target && event.target.closest && event.target.closest('.theme-btn[data-theme]');
        if (!btn) return;
        event.preventDefault();
        this.setTheme(btn.dataset.theme);
      });

      requestAnimationFrame(() => document.documentElement.classList.add('tema-pronto'));
    },
  },

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

  async protegerRota(opts = {}) {
    if (PBM.isAdmin()) return;

    if (!PBM.Auth.estaLogado()) {
      window.location.href = '/login';
      return;
    }
    try {
      const data = await PBM.Auth.me();
      if (data.usuario) sessionStorage.setItem('usuario', JSON.stringify(data.usuario));

      // Conta marcada para exclusão: força /conta (única tela acessível).
      if (data.usuario?.deletado_em) {
        const aqui = (window.location.pathname || '').replace(/\/$/, '');
        if (aqui !== '/conta') {
          window.location.href = '/conta';
          return;
        }
      }

      if (!data.usuario?.ativo) {
        // Inadimplente: por padrão vai pra /conta (não mais /login).
        // {permitirInativo:true} é usado por /conta para permitir que o aluno
        // edite dados/assine sem ser ejetado.
        if (!opts.permitirInativo) {
          window.location.href = '/conta';
        }
      }
    } catch (err) {
      // /api/auth/me usa middleware estrito: retorna 403 para inativo/exclusão
      // pendente. Quando estamos em rota permissiva (ex: /conta), tratamos esses
      // sinais como "OK, deixe passar" — o cache em sessionStorage cobre os dados
      // do usuário e a página fará GET /api/auth/assinatura para status fresco.
      const codigo = err && err.codigo;
      const inativo = err?.status === 403 && codigo === 'ASSINATURA_INATIVA';
      const emExclusao = err?.status === 403 && codigo === 'CONTA_EM_EXCLUSAO';

      if (emExclusao) {
        const aqui = (window.location.pathname || '').replace(/\/$/, '');
        if (aqui !== '/conta') { window.location.href = '/conta'; return; }
        return;
      }
      if (inativo) {
        if (opts.permitirInativo) return;
        window.location.href = '/conta';
        return;
      }
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
      // silenciar401: 401 aqui é credencial inválida, não sessão expirada.
      const data = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
        silenciar401: true,
      });
      if (data.token) sessionStorage.setItem('token', data.token);
      if (data.usuario) sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
      return data;
    },
    async cadastrar({ nome, email, senha, curso, nickname, trial_token, ref }) {
      const data = await request('/api/auth/cadastro', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha, curso, nickname: nickname || undefined, trial_token: trial_token || undefined, ref: ref || undefined }),
        silenciar401: true,
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
    async atualizarMetaDiaria(meta_diaria) {
      const data = await request('/api/auth/meta-diaria', {
        method: 'PATCH',
        body: JSON.stringify({ meta_diaria }),
      });
      if (data?.ok) {
        try {
          const u = PBM.getUsuario() || {};
          u.meta_diaria = data.meta_diaria;
          sessionStorage.setItem('usuario', JSON.stringify(u));
        } catch (_) {}
      }
      return data;
    },

    /* ── Gerenciamento de conta (PRD docs/prd/gerenciamento-conta-aluno.md) ── */
    assinatura() {
      return request('/api/auth/assinatura');
    },
    async atualizarPerfil({ nome, nickname, email, senha_atual } = {}) {
      const body = {};
      if (nome !== undefined) body.nome = nome;
      if (nickname !== undefined) body.nickname = nickname;
      if (email !== undefined) body.email = email;
      if (senha_atual !== undefined) body.senha_atual = senha_atual;
      const data = await request('/api/auth/perfil', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      // Reflete imediatamente as mudanças confirmadas (nome/nickname) no cache local.
      if (data?.ok) {
        try {
          const u = PBM.getUsuario() || {};
          if (data.dados_atualizados?.nome) u.nome = data.dados_atualizados.nome;
          if (data.dados_atualizados?.nickname) u.nickname = data.dados_atualizados.nickname;
          sessionStorage.setItem('usuario', JSON.stringify(u));
        } catch (_) {}
      }
      return data;
    },
    confirmarEmail(token) {
      return request('/api/auth/confirmar-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
    },
    excluirConta(senha_atual) {
      return request('/api/auth/conta', {
        method: 'DELETE',
        body: JSON.stringify({ senha_atual }),
      });
    },
    desfazerExclusao(token) {
      return request('/api/auth/conta/desfazer-exclusao', {
        method: 'POST',
        body: JSON.stringify({ token }),
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
    },
    questoesHoje() {
      return request('/api/progresso/questoes-hoje');
    }
  },

  Ranking: {
    // Em modo admin (sessionStorage 'pbm_admin' === '1'), envia o JWT de admin
    // para que o backend devolva nome_real + email de cada aluno.
    _isAdmin() {
      try { return sessionStorage.getItem('pbm_admin') === '1' && !!sessionStorage.getItem('pbm_admin_jwt'); }
      catch { return false; }
    },
    _req(path) {
      return PBM.Ranking._isAdmin() ? PBM.Admin.req(path) : request(path);
    },
    listar(curso = '') {
      return PBM.Ranking._req('/api/ranking' + (curso ? `?curso=${curso}` : ''));
    },
    simulados(curso = '') {
      return PBM.Ranking._req('/api/ranking/simulados' + (curso ? `?curso=${curso}` : ''));
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
      minhas() {
        return request('/api/denuncias/minhas');
      },
    },
    flashcards: {
      listar(qs = '') {
        return request('/api/flashcards' + (qs ? '?' + qs : ''));
      },
      revisar(id, avaliacao) {
        return request(`/api/flashcards/${id}/revisar`, {
          method: 'POST',
          body: JSON.stringify({ avaliacao }),
        });
      },
      maestria(legislacao_id) {
        const qs = legislacao_id ? '?legislacao_id=' + encodeURIComponent(legislacao_id) : '';
        return request('/api/flashcards/maestria' + qs);
      },
      sugerir(body) {
        return request('/api/flashcards/sugerir', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      },
    },
  },

  Ciclo: {
    get() {
      return request('/api/ciclo');
    },
    // Gera (ou regenera) blocos automaticamente. Body: { horas_totais_ciclo?, pomodoro_minutos? }
    gerar(body) {
      return request('/api/ciclo/generate', {
        method: 'POST',
        body: JSON.stringify(body || {}),
      });
    },
    atualizar(body) {
      return request('/api/ciclo', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    },
    excluir() {
      return request('/api/ciclo', { method: 'DELETE' });
    },
    resetTudo() {
      return request('/api/ciclo/tudo', { method: 'DELETE' });
    },
    // Bloco lifecycle (substitui atualizarStatus do modelo antigo)
    iniciarBloco(blocoId) {
      return request('/api/ciclo/blocos/' + encodeURIComponent(blocoId) + '/iniciar', {
        method: 'POST',
      });
    },
    concluirBloco(blocoId, body, opts) {
      const qs = (opts && opts.forcar) ? '?forcar=true' : '';
      return request('/api/ciclo/blocos/' + encodeURIComponent(blocoId) + '/concluir' + qs, {
        method: 'POST',
        body: JSON.stringify(body || {}),
      });
    },
    pausar() {
      return request('/api/ciclo/pausar', { method: 'POST' });
    },
    despausar() {
      return request('/api/ciclo/despausar', { method: 'POST' });
    },
    pularBloco(blocoId, body) {
      return request('/api/ciclo/blocos/' + encodeURIComponent(blocoId) + '/pular', {
        method: 'POST',
        body: JSON.stringify(body || { duracao_minutos: 0 }),
      });
    },
    encerrarBloco(blocoId) {
      return request('/api/ciclo/blocos/' + encodeURIComponent(blocoId) + '/encerrar', {
        method: 'POST',
      });
    },
    registrarTempo(blocoId, body) {
      return request('/api/ciclo/blocos/' + encodeURIComponent(blocoId) + '/sessoes-tempo', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    relatorioBloco(blocoId) {
      return request('/api/ciclo/blocos/' + encodeURIComponent(blocoId) + '/relatorio');
    },
    // Proficiência por AT
    proficiencia() {
      return request('/api/ciclo/at-proficiencia');
    },
    salvarProficiencia(area, nivel) {
      return request('/api/ciclo/at-proficiencia', {
        method: 'PATCH',
        body: JSON.stringify({ area, nivel_proficiencia: nivel }),
      });
    },
    // Dificuldade por legislação
    dificuldades() {
      return request('/api/ciclo/legislacao-dificuldade');
    },
    salvarDificuldade(legislacaoId, nivel) {
      return request('/api/ciclo/legislacao-dificuldade', {
        method: 'PATCH',
        body: JSON.stringify({ legislacao_id: legislacaoId, nivel }),
      });
    },
    // Nota por legislação (onde parou)
    buscarNota(legislacaoId) {
      return request('/api/ciclo/legislacao-nota?legislacao_id=' + encodeURIComponent(legislacaoId));
    },
    salvarNota(legislacaoId, nota, concluido) {
      const body = { legislacao_id: legislacaoId, nota: nota || '' };
      if (concluido !== undefined) body.concluido = !!concluido;
      return request('/api/ciclo/legislacao-nota', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    },
    // Aliases de compat (preservam chamadas antigas — mapeiam para o novo)
    criar() { return this.gerar(); },
    atualizarStatus(blocoId, status) {
      if (status === 'em_andamento') return this.iniciarBloco(blocoId);
      if (status === 'concluido') return this.concluirBloco(blocoId, {});
      return Promise.resolve(null);
    },
  },

  Historico: {
    resumo(dias = 30) {
      return request('/api/historico/resumo?dias=' + encodeURIComponent(dias));
    },
    porLegislacao(id) {
      return request('/api/historico/legislacao/' + encodeURIComponent(id));
    },
    legislacoes() {
      return request('/api/historico/legislacoes');
    },
    revisoesPendentes() {
      return request('/api/historico/revisoes');
    },
  },

  Admin: {
    _authHeader() {
      const jwt = sessionStorage.getItem('pbm_admin_jwt') || '';
      return { 'Authorization': `Bearer ${jwt}` };
    },
    /* Envelope universal `{ itens, total }` (+ pagina/totalPaginas em endpoints paginados).
       Decisão e racional em docs/adr/0001-pbm-admin-envelope-normalizacao-frontend.md. */
    _normalizarLista(data, params, chave) {
      const itens = Array.isArray(data)
        ? data
        : (chave && Array.isArray(data?.[chave])) ? data[chave]
        : [];
      const total = typeof data?.total === 'number' ? data.total : itens.length;
      const out = { itens, total };
      if (params?.porPagina != null) {
        const pp = Number(params.porPagina);
        out.pagina = Number(params.pagina ?? 1);
        out.totalPaginas = pp > 0 ? Math.ceil(total / pp) : 1;
      }
      return out;
    },
    async protegerRota() {
      if (sessionStorage.getItem('pbm_admin') !== '1' || !sessionStorage.getItem('pbm_admin_jwt')) {
        window.location.href = '/admin-login';
        return;
      }
      try {
        await PBM.Admin.req('/api/admin/auth/me');
      } catch (err) {
        if (err?.status === 401) {
          PBM.Admin.logout();
          return;
        }
        console.warn('[Admin] Falha ao validar sessão:', err?.erro || err?.message || err);
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
    async uploadImagemQuestao(file) {
      try {
        const fd = new FormData();
        fd.append('imagem', file);
        const res = await fetch('/api/admin/questoes/upload-imagem', {
          method: 'POST',
          headers: PBM.Admin._authHeader(),
          body: fd,
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.url) return { ok: true, url: data.url };
        return { ok: false, erro: data.erro || 'Erro no upload.' };
      } catch {
        return { ok: false, erro: 'Erro de rede.' };
      }
    },
    async uploadMedia(file, { pasta = 'misc', id = '' } = {}) {
      try {
        const fd = new FormData();
        fd.append('arquivo', file);
        const qs = new URLSearchParams({ pasta, ...(id ? { id } : {}) });
        const res = await fetch('/api/admin/upload/media?' + qs.toString(), {
          method: 'POST',
          headers: PBM.Admin._authHeader(),
          body: fd,
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.url) return { ok: true, url: data.url, path: data.path };
        return { ok: false, erro: data.erro || 'Erro no upload.' };
      } catch {
        return { ok: false, erro: 'Erro de rede.' };
      }
    },
    flashcards: {
      listar()         { return PBM.Admin.req('/api/admin/flashcards'); },
      criar(body)      { return PBM.Admin.req('/api/admin/flashcards', { method: 'POST', body: JSON.stringify(body) }); },
      editar(id, body) { return PBM.Admin.req('/api/admin/flashcards/' + id, { method: 'PATCH', body: JSON.stringify(body) }); },
      excluir(id)      { return PBM.Admin.req('/api/admin/flashcards/' + id, { method: 'DELETE' }); },
    },
    Auth: {
      async login({ email, senha }) {
        // silenciar401: 401 aqui é credencial inválida, não sessão expirada.
        const data = await request('/api/admin/auth/login', {
          method: 'POST', body: JSON.stringify({ email, senha }), silenciar401: true,
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
      me() {
        return PBM.Admin.req('/api/admin/auth/me');
      },
    },
    stats() {
      return PBM.Admin.req('/api/admin/stats');
    },
    async query(path, prefer, method, body) {
      let res;
      try {
        res = await fetch(API_URL + '/api/admin/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...PBM.Admin._authHeader() },
          body: JSON.stringify({ path, method: method || 'GET', body: body || undefined, prefer: prefer || null }),
          signal: AbortSignal.timeout ? AbortSignal.timeout(30000) : undefined,
        });
      } catch (err) {
        const erro = err?.name === 'TimeoutError'
          ? 'Servidor demorou mais de 30s para responder.'
          : 'Falha de rede: ' + (err?.message || err?.name || 'desconhecido');
        return { ok: false, status: 0, data: { erro }, contentRange: null };
      }
      const text = await res.text();
      const contentRange = res.headers.get('Content-Range');
      let data = null;
      if (text) {
        try { data = JSON.parse(text); }
        catch { data = { erro: 'Resposta não-JSON do servidor', raw: text.slice(0, 200) }; }
      }
      // 401 só desloga quando vem do nosso auth middleware (formato {erro:"Token..."}).
      // 401 repassado de upstream (ex: Supabase {message:"Invalid JWT"}) NÃO é sessão expirada
      // — é falha do proxy, e deve voltar pro caller tratar sem deslogar.
      if (res.status === 401) {
        const ehAuthNosso = typeof data?.erro === 'string' && /token/i.test(data.erro);
        if (ehAuthNosso) { PBM.Admin.logout(); return { ok: false, status: 401, data, contentRange: null }; }
      }
      return { ok: res.ok, status: res.status, data, contentRange };
    },
    usuarios: {
      zerarProgresso(id) {
        return PBM.Admin.req(`/api/admin/usuarios/${id}/zerar-progresso`, { method: 'POST' });
      },
    },
    admins: {
      async listar() {
        const data = await PBM.Admin.req('/api/admin/admins');
        return PBM.Admin._normalizarLista(data, null, null);
      },
      excluir(id) { return PBM.Admin.req(`/api/admin/admins/${id}`, { method: 'DELETE' }); },
      convidar(body) { return PBM.Admin.req('/api/admin/admins/convidar', { method: 'POST', body: JSON.stringify(body) }); },
    },
    simuladosMensais: {
      async listar() {
        const data = await PBM.Admin.req('/api/simulados-mensais/admin/listar');
        return PBM.Admin._normalizarLista(data, null, null);
      },
      atualizar(id, body) { return PBM.Admin.req(`/api/simulados-mensais/admin/${id}`, { method: 'PATCH', body: JSON.stringify(body) }); },
      criar(body) { return PBM.Admin.req('/api/simulados-mensais/admin/criar', { method: 'POST', body: JSON.stringify(body) }); },
      questoesDisponiveis(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return PBM.Admin.req('/api/simulados-mensais/admin/questoes-disponiveis' + (qs ? '?' + qs : ''));
      },
      questoes(id) { return PBM.Admin.req(`/api/simulados-mensais/admin/${id}/questoes`); },
      adicionarQuestoes(id, ids) { return PBM.Admin.req(`/api/simulados-mensais/admin/${id}/questoes`, { method: 'POST', body: JSON.stringify({ questao_ids: ids }) }); },
      removerQuestao(id, questaoId) { return PBM.Admin.req(`/api/simulados-mensais/admin/${id}/questoes/${questaoId}`, { method: 'DELETE' }); },
      incorporar(id) { return PBM.Admin.req(`/api/simulados-mensais/admin/${id}/incorporar`, { method: 'POST' }); },
    },
    assinaturas: {
      stats() {
        return request('/api/admin/assinaturas/stats', { headers: PBM.Admin._authHeader() });
      },
      async listar(params = {}) {
        // Interface em português; tradução pra page/per_page acontece aqui.
        const wire = {};
        if (params.pagina != null) wire.page = String(params.pagina);
        if (params.porPagina != null) wire.per_page = String(params.porPagina);
        if (params.busca) wire.busca = params.busca;
        if (params.status) wire.status = params.status;
        if (params.curso) wire.curso = params.curso;
        const qs = new URLSearchParams(wire).toString();
        const data = await request('/api/admin/assinaturas' + (qs ? '?' + qs : ''), { headers: PBM.Admin._authHeader() });
        return PBM.Admin._normalizarLista(data, params, 'alunos');
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
      async listar() {
        const data = await request('/api/admin/cupons', { headers: PBM.Admin._authHeader() });
        return PBM.Admin._normalizarLista(data, null, 'cupons');
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
      async listar() {
        const data = await request('/api/admin/convites', { headers: PBM.Admin._authHeader() });
        return PBM.Admin._normalizarLista(data, null, 'convites');
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
      async listar() {
        const data = await PBM.Admin.req('/api/admin/indicacoes');
        return PBM.Admin._normalizarLista(data, null, 'indicacoes');
      },
    },
    denuncias: {
      resumo() { return PBM.Admin.req('/api/admin/denuncias/resumo'); },
      resolver(id, body) {
        return PBM.Admin.req(`/api/admin/denuncias/${id}/resolver`, {
          method: 'POST',
          body: JSON.stringify(body || {}),
        });
      },
    },
    auditoria: {
      registrar(questao_id, acao, comentario) {
        return PBM.Admin.req(`/api/admin/questoes/${questao_id}/auditar`, {
          method: 'POST',
          body: JSON.stringify({ acao, comentario: comentario || null }),
        });
      },
    },
    legislacoes: {
      async listar() {
        const data = await PBM.Admin.req('/api/admin/legislacoes');
        return PBM.Admin._normalizarLista(data, null, 'legislacoes');
      },
      salvar(id, body)   { return PBM.Admin.req('/api/admin/legislacoes/' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify(body) }); },
      removerOverride(id){ return PBM.Admin.req('/api/admin/legislacoes/' + encodeURIComponent(id) + '/override', { method: 'DELETE' }); },
    },
    automatizar: {
      gerarQuestoes(area = 'todas', quantidade = 1, curso = 'ambos') { return PBM.Admin.req('/api/admin/automatizar/gerar-questoes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ area, quantidade, curso }) }); },
      gerarFlashcard() { return PBM.Admin.req('/api/admin/automatizar/gerar-flashcard', { method: 'POST' }); },
      cronLogs()       { return PBM.Admin.req('/api/admin/cron-logs'); },
    },
    aprovacoes: {
      resumo() { return PBM.Admin.req('/api/admin/aprovacoes/resumo'); },
      questoesIa: {
        async listar() {
          const data = await PBM.Admin.req('/api/admin/aprovacoes/questoes-ia');
          return PBM.Admin._normalizarLista(data, null, null);
        },
        aprovar(id, obs) { return PBM.Admin.req(`/api/admin/aprovacoes/questoes-ia/${id}/aprovar`, { method: 'POST', body: JSON.stringify({ observacao: obs }) }); },
        rejeitar(id, obs){ return PBM.Admin.req(`/api/admin/aprovacoes/questoes-ia/${id}/rejeitar`, { method: 'POST', body: JSON.stringify({ observacao: obs }) }); },
        editar(id, body) { return PBM.Admin.req(`/api/admin/aprovacoes/questoes-ia/${id}`, { method: 'PATCH', body: JSON.stringify(body) }); },
      },
      flashcards: {
        async listar() {
          const data = await PBM.Admin.req('/api/admin/aprovacoes/flashcards');
          return PBM.Admin._normalizarLista(data, null, null);
        },
        aprovar(id)      { return PBM.Admin.req(`/api/admin/aprovacoes/flashcards/${id}/aprovar`, { method: 'POST' }); },
        rejeitar(id, obs){ return PBM.Admin.req(`/api/admin/aprovacoes/flashcards/${id}/rejeitar`, { method: 'POST', body: JSON.stringify({ observacao: obs }) }); },
        editar(id, body) { return PBM.Admin.req(`/api/admin/aprovacoes/flashcards/${id}`, { method: 'PATCH', body: JSON.stringify(body) }); },
      },
      instagram: {
        async listar() {
          const data = await PBM.Admin.req('/api/admin/aprovacoes/instagram');
          return PBM.Admin._normalizarLista(data, null, null);
        },
        gerar(area)        { return PBM.Admin.req('/api/admin/aprovacoes/instagram/gerar', { method: 'POST', body: JSON.stringify({ area: area || null }) }); },
        publicar(id, opts) { return PBM.Admin.req(`/api/admin/aprovacoes/instagram/${id}/publicar`, { method: 'POST', ...(opts || {}) }); },
        rejeitar(id, obs)  { return PBM.Admin.req(`/api/admin/aprovacoes/instagram/${id}/rejeitar`, { method: 'POST', body: JSON.stringify({ observacao: obs }) }); },
        editar(id, caption){ return PBM.Admin.req(`/api/admin/aprovacoes/instagram/${id}`, { method: 'PATCH', body: JSON.stringify({ caption }) }); },
      },
      simulados: {
        async listar() {
          const data = await PBM.Admin.req('/api/admin/aprovacoes/simulados-mensais');
          return PBM.Admin._normalizarLista(data, null, null);
        },
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

  Editais: {
    obter(curso) {
      return request('/api/editais/' + encodeURIComponent(curso));
    },
    reportarMudanca(legislacao_id, comentario) {
      return request('/api/editais/reportar-mudanca', {
        method: 'POST',
        body: JSON.stringify({ legislacao_id, comentario }),
      });
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

/* Inicializa o sistema de tema (listeners de SO, multi-aba e clique) */
try { PBM.Theme.init(); } catch (e) { console.warn('[PBM.Theme] falha ao iniciar', e); }

/* Injeção de CSS Global (Scrollbar Unificada — reage ao tema) */
(function() {
  const style = document.createElement('style');
  style.textContent = `
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: var(--bg-primario); }
    ::-webkit-scrollbar-thumb { background: var(--bg-hover); border-radius: 4px; border: 2px solid var(--bg-primario); }
    ::-webkit-scrollbar-thumb:hover { background: var(--border-color); }
    * { scrollbar-width: thin; scrollbar-color: var(--bg-hover) var(--bg-primario); }
  `;
  document.head.appendChild(style);
})();
