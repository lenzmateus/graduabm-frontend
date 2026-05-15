/* ============================================================
   AdminChrome — sidebar + topbar + toast + badges para páginas admin.
   Carregar DEPOIS de js/api.js. A página deve conter:
     <aside id="admin-chrome"></aside>
     <header id="admin-topbar"></header>
   e chamar AdminChrome.init({ pagina, titulo, acoes }).
   ============================================================ */
(function () {
  'use strict';

  // ---------- ÍCONES ----------
  const ICO = {
    dash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    analytics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    questao: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    legislacao: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>',
    flashcard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
    simulado: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h2m2 0h2m-6 4h2"/></svg>',
    aluno: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    relatorio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    denuncia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
    aprovacao: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    site: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  };

  // ---------- ESTRUTURA DE NAVEGAÇÃO ----------
  // Ordem fixa. Cada item tem um `key` que a página passa em init({ pagina }).
  // `badge` ('denuncias' ou 'aprovacoes') ativa polling do contador.
  const NAV = [
    { secao: 'Painel' },
    { key: 'dashboard', label: 'Dashboard', href: '/admin', icon: ICO.dash },
    { key: 'analytics', label: 'Analytics', href: '/admin-analytics', icon: ICO.analytics },

    { secao: 'Conteúdo' },
    { key: 'questoes', label: 'Questões', href: '/admin-questoes', icon: ICO.questao },
    { key: 'legislacoes', label: 'Legislações', href: '/admin-legislacoes', icon: ICO.legislacao },
    { key: 'flashcards', label: 'Flashcards', href: '/admin-flashcards', icon: ICO.flashcard },
    { key: 'simulados-mensais', label: 'Protocolos QAP', href: '/admin-simulados-mensais', icon: ICO.simulado },

    { secao: 'Alunos' },
    { key: 'assinaturas', label: 'Assinaturas', href: '/admin-assinaturas', icon: ICO.aluno },
    { key: 'relatorios', label: 'Relatórios', href: '/admin-relatorios', icon: ICO.relatorio },
    { key: 'denuncias', label: 'Relatórios de Problemas', href: '/admin-denuncias', icon: ICO.denuncia, badge: 'denuncias' },

    { secao: 'Sistema' },
    { key: 'aprovacoes', label: 'Aprovações IA', href: '/admin-aprovacoes', icon: ICO.aprovacao, badge: 'aprovacoes' },
    { key: 'site', label: 'Ver site', href: '/', target: '_blank', icon: ICO.site },
  ];

  // ---------- RENDER ----------
  function renderSidebar(paginaAtiva) {
    const linhas = NAV.map(item => {
      if (item.secao) {
        return `<div class="chrome-nav-label">${escape(item.secao)}</div>`;
      }
      const ativa = item.key === paginaAtiva ? ' ativo' : '';
      const target = item.target ? ` target="${item.target}"` : '';
      const badgeHtml = item.badge
        ? `<span class="chrome-nav-badge" data-badge="${item.badge}"></span>`
        : '';
      return `
        <a class="chrome-nav-item${ativa}" href="${item.href}"${target} data-nav-key="${item.key}">
          <span class="chrome-nav-item-left">${item.icon}<span>${escape(item.label)}</span></span>
          ${badgeHtml}
        </a>`;
    }).join('');

    const nome = sessionStorage.getItem('pbm_admin_nome') || 'Administrador';

    return `
      <div class="chrome-sidebar-logo">
        <a href="/admin" class="chrome-logo-text">Protocolo Bravo Mike</a>
        <span class="chrome-admin-chip">ADMIN</span>
      </div>
      <div class="chrome-sidebar-usuario">
        <div class="chrome-usuario-nome">${escape(nome)}</div>
        <div class="chrome-usuario-status"><span class="chrome-status-dot"></span>Sessão ativa</div>
      </div>
      <nav class="chrome-sidebar-nav">${linhas}</nav>
      <div class="chrome-sidebar-footer">
        <button class="chrome-btn-sair" type="button" data-chrome-sair>Encerrar sessão</button>
      </div>`;
  }

  function renderTopbar(titulo, acoes) {
    const acoesHtml = (acoes || []).map((acao, i) => {
      if (acao.html) return acao.html;
      const variant = acao.variant || 'outline';
      const conteudo = (acao.icon || '') + escape(acao.texto || '');
      if (acao.href) {
        const target = acao.target ? ` target="${acao.target}"` : '';
        return `<a class="chrome-topbar-acao ${variant}" href="${acao.href}"${target} data-chrome-acao="${i}">${conteudo}</a>`;
      }
      return `<button type="button" class="chrome-topbar-acao ${variant}" data-chrome-acao="${i}">${conteudo}</button>`;
    }).join('');

    return `
      <span class="chrome-topbar-titulo">${escape(titulo || '')}</span>
      <div class="chrome-topbar-dir">
        ${acoesHtml}
        <button type="button" class="chrome-btn-topbar-sair" data-chrome-sair>Encerrar sessão</button>
      </div>`;
  }

  // ---------- WIRING ----------
  function wireSair(root) {
    root.querySelectorAll('[data-chrome-sair]').forEach(btn => {
      btn.addEventListener('click', () => PBM.Admin.logout());
    });
  }

  function wireAcoes(root, acoes) {
    root.querySelectorAll('[data-chrome-acao]').forEach(el => {
      const i = Number(el.getAttribute('data-chrome-acao'));
      const acao = acoes[i];
      if (acao && typeof acao.onClick === 'function') {
        el.addEventListener('click', (e) => acao.onClick(e));
      }
    });
  }

  // ---------- BADGES ----------
  async function atualizarBadge(tipo, chamada) {
    try {
      const r = await chamada();
      const total = r?.total || 0;
      document.querySelectorAll(`[data-badge="${tipo}"]`).forEach(el => {
        if (total > 0) { el.textContent = total; el.classList.add('visivel'); }
        else { el.classList.remove('visivel'); }
      });
    } catch { /* silencioso — endpoint pode falhar */ }
  }

  async function atualizarBadges() {
    await Promise.all([
      atualizarBadge('aprovacoes', () => PBM.Admin.aprovacoes.resumo()),
      atualizarBadge('denuncias', () => PBM.Admin.denuncias.resumo()),
    ]);
  }

  // ---------- TOAST ----------
  function garantirWatermark() {
    if (document.getElementById('chrome-watermark')) return;
    const w = document.createElement('div');
    w.id = 'chrome-watermark';
    w.className = 'chrome-watermark';
    w.setAttribute('aria-hidden', 'true');
    document.body.appendChild(w);
  }

  function garantirToastContainer() {
    let c = document.getElementById('chrome-toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'chrome-toast-container';
      c.className = 'chrome-toast-container';
      document.body.appendChild(c);
    }
    return c;
  }

  const TOAST_ALIAS = { verde: 'sucesso', vermelho: 'erro', roxo: 'info' };

  function toast(msg, tipo = 'sucesso', duracao = 3200) {
    const tipoNorm = TOAST_ALIAS[tipo] || tipo || 'sucesso';
    const c = garantirToastContainer();
    const t = document.createElement('div');
    t.className = `chrome-toast ${tipoNorm}`;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => {
      t.classList.add('saindo');
      setTimeout(() => t.remove(), 220);
    }, duracao);
  }

  // ---------- UTIL ----------
  function escape(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function setTimestamp(id = 'topbar-ts', data = new Date()) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = data.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  function extrairErro(r, fallback = 'Erro desconhecido') {
    if (!r) return fallback;
    return r.data?.erro || r.data?.message || r.data?.raw || `HTTP ${r.status || '?'}` || fallback;
  }

  // Normaliza questão: aceita formato novo (alternativas[]+gabarito+comentario)
  // e formato legado (alternativa_a..e+resposta_correta+justificativa).
  // Retorna sempre o novo formato.
  const _LETRA_TO_IDX = { A: 0, B: 1, C: 2, D: 3, E: 4 };
  function normalizarQuestao(q) {
    if (!q) return { alts: [], gabarito: 0, comentario: '' };
    let alts = Array.isArray(q.alternativas) ? q.alternativas.slice() : [];
    if (alts.length === 0 || alts.every(a => !a)) {
      alts = ['a', 'b', 'c', 'd', 'e'].map(l => q[`alternativa_${l}`] || '');
    }
    let gabarito = Number.isInteger(q.gabarito) ? q.gabarito : null;
    if (gabarito == null) {
      const letra = String(q.resposta_correta || '').trim().toUpperCase();
      if (letra in _LETRA_TO_IDX) gabarito = _LETRA_TO_IDX[letra];
    }
    return {
      alts,
      gabarito: gabarito ?? 0,
      comentario: q.comentario || q.justificativa || '',
    };
  }

  // ---------- API PÚBLICA ----------
  async function init({ pagina, titulo, acoes = [] } = {}) {
    if (!window.PBM || !PBM.Admin) {
      console.error('[AdminChrome] PBM.Admin não disponível. Inclua /js/api.js antes deste script.');
      return;
    }

    // Auth guard ANTES de qualquer render — se não autenticado, redireciona.
    await PBM.Admin.protegerRota();

    const sidebarMount = document.getElementById('admin-chrome');
    const topbarMount = document.getElementById('admin-topbar');

    if (sidebarMount) {
      sidebarMount.className = 'chrome-sidebar';
      sidebarMount.innerHTML = renderSidebar(pagina);
      wireSair(sidebarMount);
    }

    if (topbarMount) {
      topbarMount.className = 'chrome-topbar';
      topbarMount.innerHTML = renderTopbar(titulo, acoes);
      wireSair(topbarMount);
      wireAcoes(topbarMount, acoes);
    }

    garantirToastContainer();
    garantirWatermark();
    atualizarBadges();
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) atualizarBadges();
    });
  }

  window.AdminChrome = { init, toast, atualizarBadges, setTimestamp, extrairErro, normalizarQuestao };
})();
