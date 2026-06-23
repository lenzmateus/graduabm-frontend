/* PBM Components — sidebar/bottombar dinâmicos. Fonte única da navegação.
   Uso:
     <aside id="pbm-sidebar"></aside>
     <nav id="pbm-bottombar"></nav>
     <script src="/js/pbm-components.js"></script>
     <script>PBM.Layout.mount();</script>
   Item ativo detectado pelo pathname; override via mount({active:'flashcards'}). */
(function () {
  'use strict';
  window.PBM = window.PBM || {};

  const ICONS = {
    dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    editais: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>',
    estudar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    ciclo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    erros: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="9" y1="8" x2="15" y2="14"/><line x1="15" y1="8" x2="9" y2="14"/></svg>',
    simulados: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    qap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    ranking: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="18 20 18 10"/><polyline points="12 20 12 4"/><polyline points="6 20 6 14"/></svg>',
    flashcards: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
    podcasts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
    videoaulas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
    conta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
  };

  const ACTIVE_MAP = {
    '/dashboard': 'dashboard',
    '/editais': 'editais',
    '/area-estudos': 'estudar',
    '/selecao-legislacao': 'estudar',
    '/questoes': 'estudar',
    '/ciclo-estudos': 'ciclo',
    '/simulados': 'simulados',
    '/simulado-prova': 'simulados',
    '/simulado-mensal': 'qap',
    '/simulado-mensal-ranking': 'qap',
    '/flashcards': 'flashcards',
    '/podcast': 'podcasts',
    '/videoaula': 'videoaulas',
    '/pbm-patentes.html': 'ranking',
    '/ranking': 'ranking',
    '/conta': 'conta'
  };

  function detectActive() {
    const p = (window.location.pathname || '').replace(/\/$/, '');
    return ACTIVE_MAP[p] || ACTIVE_MAP[p + '/'] || null;
  }

  function sidebarHTML(active) {
    const item = (id, href, label, extra) => {
      const cls = 'nav-item' + (active === id ? ' ativo' : '');
      return `<a class="${cls}" href="${href}"${extra || ''}>${ICONS[id]}${label}</a>`;
    };
    return `
      <div class="sidebar-logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--vermelho)" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        <a href="/dashboard" class="logo-text">Protocolo Bravo Mike</a>
      </div>

      <div class="sidebar-usuario">
        <div class="usuario-nome" id="sidebar-nome">Carregando…</div>
        <div class="usuario-status">
          <span class="status-dot"></span>
          <span id="sidebar-status-txt">ALUNO PRO</span>
        </div>
        <div class="theme-switcher" role="group" aria-label="Tema da plataforma">
          <button type="button" class="theme-btn" data-theme="light" aria-label="Modo claro" title="Modo claro">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
          </button>
          <button type="button" class="theme-btn" data-theme="system" aria-label="Usar tema do sistema" title="Tema do sistema">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 18v3"/></svg>
          </button>
          <button type="button" class="theme-btn" data-theme="dark" aria-label="Modo escuro" title="Modo escuro">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </button>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-label">Menu</div>
        ${item('dashboard', '/dashboard', 'Dashboard')}
        ${item('editais', '/editais', 'Editais')}
        ${item('estudar', '/area-estudos', 'Papirar')}
        ${item('ciclo', '/ciclo-estudos', 'Ciclo de Estudos')}
        <a class="nav-item${active === 'erros' ? ' ativo' : ''}" href="#" id="nav-erros" data-pbm-erros>
          ${ICONS.erros}
          Caderno de Erros
          <span class="nav-badge-revisao" id="badge-erros-nav"></span>
        </a>
        ${item('simulados', '/simulados', 'Simulados Oficiais')}
        <div class="nav-item nav-missao locked" id="nav-missao-fds">
          ${ICONS.qap}
          <span class="nav-missao-label">PROTOCOLO QAP</span>
          <span class="nav-missao-timer" id="missao-timer" style="display:none">--:--:--</span>
          <div class="nav-missao-tooltip" id="missao-tooltip"></div>
        </div>
        ${item('ranking', '/pbm-patentes.html', 'Carreira')}
        ${item('flashcards', '/flashcards', 'Flashcards')}
        ${item('podcasts', '/podcast', 'Podcasts')}
        ${item('videoaulas', '/videoaula', 'Videoaulas')}
        ${item('conta', '/conta', 'Minha Conta')}
      </nav>

      <div class="sidebar-footer">
        <a href="/regras" style="display:block;font-size:11px;color:#555;text-decoration:none;margin-bottom:8px;">Regras &amp; Informações</a>
        <button type="button" id="btn-tour-sidebar" style="display:block;width:100%;background:transparent;border:none;color:#444;font-size:11px;font-family:'Inter',sans-serif;cursor:pointer;text-align:left;padding:0;margin-bottom:8px;">? Tutorial desta página</button>
        <button class="btn-sair" id="btn-sair">Encerrar sessão</button>
      </div>
    `;
  }

  function bottombarHTML(active) {
    const link = (id, href, label) => {
      const cls = active === id ? ' class="ativo"' : '';
      return `<a${cls} href="${href}">${ICONS[id]}${label}</a>`;
    };
    return `
      ${link('dashboard', '/dashboard', 'Início')}
      ${link('editais', '/editais', 'Editais')}
      ${link('estudar', '/area-estudos', 'Estudar')}
      ${link('simulados', '/simulados', 'Simulados')}
      ${link('qap', '/simulado-mensal', 'QAP')}
      ${link('flashcards', '/flashcards', 'Cards')}
      ${link('ranking', '/pbm-patentes.html', 'Carreira')}
    `;
  }

  function populateUsuario() {
    const nomeEl = document.getElementById('sidebar-nome');
    const statusEl = document.getElementById('sidebar-status-txt');
    if (!nomeEl) return;
    let user = null;
    try { user = (PBM.getUsuario && PBM.getUsuario()) || null; } catch (_) {}
    if (user) {
      nomeEl.textContent = user.nome || user.email || 'Aluno';
      if (statusEl) {
        const curso = (user.curso || '').toUpperCase();
        statusEl.textContent = curso ? `ALUNO PRO · ${curso}` : 'ALUNO PRO';
      }
    } else {
      nomeEl.textContent = 'Aluno';
    }
  }

  function bindOnce(el, ev, fn) {
    if (!el || el.dataset.pbmWired === ev) return;
    el.dataset.pbmWired = ev;
    el.addEventListener(ev, fn);
  }

  function wireLogout() {
    function sair() {
      try { PBM.Auth && PBM.Auth.logout && PBM.Auth.logout(); } catch (_) {}
      window.location.href = '/login';
    }
    document.querySelectorAll('#btn-sair, #btn-logout-top').forEach(b => bindOnce(b, 'click', sair));
  }

  function wireTour() {
    bindOnce(document.getElementById('btn-tour-sidebar'), 'click', () => {
      if (window.PBMTour && typeof window.PBMTour.start === 'function') window.PBMTour.start();
    });
  }

  // Caderno de Erros: sessionStorage flag dispara modo "revisão de erros"
  // em /questoes (questões já erradas, sem duplicatas, excluindo as já acertadas).
  function wireErros() {
    bindOnce(document.querySelector('[data-pbm-erros]'), 'click', function (e) {
      e.preventDefault();
      sessionStorage.setItem('pbm_revisao_erros', '1');
      sessionStorage.removeItem('pbm_ciclo_bloco');
      window.location.href = '/questoes';
    });
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function formatCountdown(ms) {
    const diff = Math.max(0, ms);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return d > 0 ? d + 'd ' + pad(h) + ':' + pad(m) : pad(h) + ':' + pad(m) + ':' + pad(s);
  }

  // Driver de countdown reutilizável: re-renderiza apenas quando o texto muda
  // e pausa quando a aba fica oculta. Retorna função de cancelamento.
  function startCountdown(getEl, targetTs) {
    let lastText = null;
    let intervalId = null;
    function tick() {
      const el = getEl();
      if (!el) return;
      const txt = formatCountdown(targetTs - Date.now());
      if (txt !== lastText) {
        el.textContent = txt;
        lastText = txt;
      }
    }
    function start() {
      if (intervalId) return;
      tick();
      intervalId = setInterval(tick, 1000);
    }
    function stop() {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
    }
    function onVis() { document.hidden ? stop() : start(); }
    document.addEventListener('visibilitychange', onVis);
    start();
    return function cancel() {
      stop();
      document.removeEventListener('visibilitychange', onVis);
    };
  }

  const MISSAO_RENDERERS = {
    active(el) {
      const a = document.createElement('a');
      a.className = 'nav-item nav-missao active';
      a.href = '/simulado-mensal';
      a.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg><span class="nav-missao-label">PROTOCOLO QAP</span><span class="nav-missao-badge">ABERTA</span>';
      el.replaceWith(a);
    },
    encerrado(el, status) {
      const a = document.createElement('a');
      a.className = 'nav-item nav-missao encerrado';
      a.href = '/simulado-mensal-ranking?id=' + status.ultimo.id;
      a.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg><span class="nav-missao-label">PROTOCOLO QAP</span><span class="nav-missao-ranking-badge">RANKING →</span>';
      el.replaceWith(a);
    },
    locked(el, status) {
      const abertura = new Date(status.proximo.abertura);
      const encerramento = new Date(status.proximo.encerramento);
      const fmt = d => d.toLocaleString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
      const tip = document.getElementById('missao-tooltip');
      if (tip) tip.textContent = 'Abre ' + fmt(abertura) + ' · Fecha ' + fmt(encerramento) + ' BRT';
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => abrirModalAgendado(abertura, encerramento, fmt));
      const timerEl = document.getElementById('missao-timer');
      if (timerEl) timerEl.style.display = '';
      startCountdown(() => document.getElementById('missao-timer'), abertura.getTime());
    }
  };

  async function initMissaoFDS() {
    const el = document.getElementById('nav-missao-fds');
    if (!el) return;
    if (!(window.PBM && PBM.MissaoFDS && PBM.MissaoFDS.status)) return;
    // Admin acessando página de aluno (ex: /ranking em modo admin) não tem
    // sessão de aluno — não chamar endpoints que exigem JWT de aluno.
    if (PBM.isAdmin && PBM.isAdmin()) return;
    let status;
    try { status = await PBM.MissaoFDS.status(); } catch (_) { return; }
    if (!status || !status.estado) return;
    const renderer = MISSAO_RENDERERS[status.estado];
    if (renderer && (status.estado !== 'encerrado' || status.ultimo)) {
      renderer(el, status);
      return;
    }
    el.style.cursor = 'pointer';
    el.addEventListener('click', abrirModalSemEvento);
  }

  function openOverlay({ bodyHTML, onMount }) {
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:9999;display:flex;align-items:center;justify-content:center;';
    ov.innerHTML = bodyHTML;
    document.body.appendChild(ov);
    let onMountCleanup = null;
    function close() {
      try { onMountCleanup && onMountCleanup(); } catch (_) {}
      ov.remove();
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    const closeBtn = ov.querySelector('#missao-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (onMount) onMountCleanup = onMount(ov);
    return close;
  }

  function modalHeader(label) {
    return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:1.25rem;border-bottom:1px solid #222;padding-bottom:.75rem;">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
      '<span style="font-family:\'IBM Plex Mono\',monospace;font-size:10px;color:#555;letter-spacing:.12em;">' + label + '</span>' +
    '</div>';
  }

  function modalCloseBtn() {
    return '<button type="button" id="missao-modal-close" style="margin-top:1rem;width:100%;background:none;border:1px solid #2A2A2A;color:#555;padding:7px;border-radius:6px;cursor:pointer;font-size:12px;font-family:\'IBM Plex Mono\',monospace;letter-spacing:.06em;">FECHAR</button>';
  }

  function abrirModalAgendado(abertura, encerramento, fmt) {
    const body =
      '<div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:12px;padding:1.5rem 1.75rem;max-width:320px;width:90%;">' +
        modalHeader('PROTOCOLO QAP — BLOQUEADO') +
        '<div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.35rem;">Abertura</div>' +
        '<div style="font-size:14px;color:#CCC;margin-bottom:1rem;">' + fmt(abertura) + ' BRT</div>' +
        '<div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.35rem;">Encerramento</div>' +
        '<div style="font-size:14px;color:#CCC;margin-bottom:1.25rem;">' + fmt(encerramento) + ' BRT</div>' +
        '<div style="text-align:center;background:#111;border-radius:8px;padding:.75rem;margin-bottom:1.25rem;">' +
          '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:9px;color:#444;letter-spacing:.1em;margin-bottom:.4rem;">ABRE EM</div>' +
          '<div id="missao-modal-timer" style="font-family:\'IBM Plex Mono\',monospace;font-size:24px;color:var(--brand-primary);letter-spacing:.04em;"></div>' +
        '</div>' +
        modalCloseBtn() +
      '</div>';
    openOverlay({
      bodyHTML: body,
      onMount: () => startCountdown(() => document.getElementById('missao-modal-timer'), abertura.getTime())
    });
  }

  function abrirModalSemEvento() {
    const body =
      '<div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:12px;padding:1.5rem 1.75rem;max-width:320px;width:90%;">' +
        modalHeader('PROTOCOLO QAP') +
        '<div style="text-align:center;padding:1rem 0;">' +
          '<div style="font-size:13px;color:#666;line-height:1.7;">Nenhuma missão agendada<br>no momento.<br><br>Fique atento — a próxima<br>será anunciada em breve.</div>' +
        '</div>' +
        modalCloseBtn() +
      '</div>';
    openOverlay({ bodyHTML: body });
  }

  /* ── Banner global de vencimento (≤7 dias) ──
     Vive no topo do <main> e some via sessionStorage. Não renderiza em /conta
     (página de destino do CTA) nem em modo admin-preview. Busca dias_restantes
     do endpoint /api/auth/assinatura para sobreviver a cache de sessionStorage
     defasado. */
  const BANNER_DISMISS_KEY = 'pbm_banner_dismissed_v1';

  function bannerVencimentoHTML(diasRestantes) {
    const txt = diasRestantes <= 0
      ? 'Seu acesso vence hoje.'
      : (diasRestantes === 1
          ? 'Seu acesso vence amanhã.'
          : 'Seu acesso vence em ' + diasRestantes + ' dias.');
    return (
      '<div class="banner-vencimento" role="status" style="' +
        'display:flex;align-items:center;gap:12px;padding:10px 16px;' +
        'background:rgba(241,188,28,0.10);border:1px solid rgba(241,188,28,0.35);' +
        'border-radius:8px;color:#F6D67B;font-size:13px;line-height:1.4;' +
        'margin:0 0 16px 0;font-family:Inter,sans-serif;">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
        '<span style="flex:1;"><strong style="font-weight:600;">' + txt + '</strong> Renove agora para não perder o acesso.</span>' +
        '<a href="/conta" style="background:#C0270F;color:#fff;text-decoration:none;font-size:12px;font-weight:600;padding:7px 14px;border-radius:6px;white-space:nowrap;">Ir para Minha Conta</a>' +
        '<button type="button" id="pbm-banner-dismiss" aria-label="Dispensar aviso" style="background:none;border:none;color:#F6D67B;cursor:pointer;padding:4px;display:flex;opacity:0.7;">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
      '</div>'
    );
  }

  async function renderBannerVencimento() {
    if (sessionStorage.getItem(BANNER_DISMISS_KEY) === '1') return;
    const aqui = (window.location.pathname || '').replace(/\/$/, '');
    if (aqui === '/conta') return; // CTA leva pra /conta, redundante lá
    if (!(window.PBM && PBM.Auth && PBM.Auth.estaLogado && PBM.Auth.estaLogado())) return;
    if (PBM.isAdmin && PBM.isAdmin()) return;

    let dados;
    try { dados = await PBM.Auth.assinatura(); } catch (_) { return; }
    if (!dados || dados.status !== 'ativa') return;
    if (dados.deletado_em) return;
    const d = typeof dados.dias_restantes === 'number' ? dados.dias_restantes : null;
    if (d === null || d > 7 || d < 0) return;

    const main = document.querySelector('.main .conteudo') || document.querySelector('.main') || document.body;
    if (!main || document.getElementById('pbm-banner-vencimento-wrap')) return;
    const wrap = document.createElement('div');
    wrap.id = 'pbm-banner-vencimento-wrap';
    wrap.innerHTML = bannerVencimentoHTML(d);
    main.insertBefore(wrap, main.firstChild);

    const dismiss = document.getElementById('pbm-banner-dismiss');
    if (dismiss) dismiss.addEventListener('click', () => {
      try { sessionStorage.setItem(BANNER_DISMISS_KEY, '1'); } catch (_) {}
      wrap.remove();
    });
  }

  PBM.Layout = {
    mount(opts) {
      const active = (opts && opts.active) || detectActive();

      const sidebar = document.getElementById('pbm-sidebar');
      if (sidebar) {
        sidebar.classList.add('sidebar');
        sidebar.innerHTML = sidebarHTML(active);
      }

      const bottombar = document.getElementById('pbm-bottombar');
      if (bottombar) {
        bottombar.classList.add('bottombar');
        bottombar.innerHTML = bottombarHTML(active);
      }

      populateUsuario();
      wireLogout();
      wireTour();
      wireErros();
      initMissaoFDS();
      renderBannerVencimento();
      try { PBM.Theme && PBM.Theme.updateUISelector(); } catch (e) {}
    },
    refreshUsuario: populateUsuario
  };

  /* ── TOAST — Sistema global de feedback ──────────────────────
     Uso:
       PBM.Toast.show('Copiado!', 'success')
       PBM.Toast.show('Falha ao salvar. Tente novamente.', 'error')
       PBM.Toast.show('Processando...', 'info', 5000)
       PBM.Toast.show('Atenção!', 'warning')

     Tipos: 'success' | 'error' | 'info' | 'warning'
     Duração padrão: 3000ms. Passa 0 para manter até fechar.
  ─────────────────────────────────────────────────────────────── */
  const TOAST_ICONS = {
    success: '<svg class="pbm-toast__icon" viewBox="0 0 24 24" fill="none" stroke="var(--success-fg)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    error:   '<svg class="pbm-toast__icon" viewBox="0 0 24 24" fill="none" stroke="var(--danger-fg)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info:    '<svg class="pbm-toast__icon" viewBox="0 0 24 24" fill="none" stroke="var(--info-fg)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    warning: '<svg class="pbm-toast__icon" viewBox="0 0 24 24" fill="none" stroke="var(--warning-fg)" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  };

  function getToastContainer() {
    let c = document.getElementById('pbm-toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'pbm-toast-container';
      document.body.appendChild(c);
    }
    return c;
  }

  PBM.Toast = {
    show(msg, type = 'info', duration = 3000) {
      const container = getToastContainer();
      const el = document.createElement('div');
      el.className = `pbm-toast pbm-toast--${type} pbm-toast--entering`;
      el.innerHTML = (TOAST_ICONS[type] || TOAST_ICONS.info) +
        `<span class="pbm-toast__msg">${msg}</span>`;
      container.appendChild(el);

      // Trigger enter animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => el.classList.remove('pbm-toast--entering'));
      });

      function dismiss() {
        el.classList.add('pbm-toast--leaving');
        setTimeout(() => el.remove(), 300);
      }

      el.addEventListener('click', dismiss);
      if (duration > 0) setTimeout(dismiss, duration);
      return dismiss;
    },
    success(msg, duration) { return this.show(msg, 'success', duration); },
    error(msg, duration)   { return this.show(msg, 'error', duration); },
    info(msg, duration)    { return this.show(msg, 'info', duration); },
    warning(msg, duration) { return this.show(msg, 'warning', duration); },
  };

  /* ── INSÍGNIAS DE PATENTE ─────────────────────────────────────
     Fonte ÚNICA do desenho das 13 insígnias (Recruta → Coronel).
     Consumida pela página de Patentes, pelo Dashboard e pela
     Celebração de promoção. Antes vivia duplicada em cada página. */
  PBM.obterInsigniaSVG = function (nivel, curso) {
    const isCba = (curso === 'cba');
    const accent = isCba ? '#60A5FA' : '#F87171';
    const accent2 = isCba ? 'var(--info-fg)' : 'var(--brand-primary)';
    const n = Math.max(1, Math.min(13, Number(nivel) || 1));

    const defs = `
      <defs>
        <linearGradient id="ins-bronze" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F2C9A0"/><stop offset="55%" stop-color="#C77F3E"/><stop offset="100%" stop-color="#8A4B1A"/>
        </linearGradient>
        <linearGradient id="ins-silver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF"/><stop offset="55%" stop-color="#CFD6DE"/><stop offset="100%" stop-color="#8B97A4"/>
        </linearGradient>
        <linearGradient id="ins-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFF0A6"/><stop offset="55%" stop-color="#FBC73B"/><stop offset="100%" stop-color="#D98A12"/>
        </linearGradient>
        <linearGradient id="ins-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}"/><stop offset="100%" stop-color="${accent2}"/>
        </linearGradient>
        <filter id="ins-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>`;

    const BR = 'url(#ins-bronze)', AG = 'url(#ins-silver)', OU = 'url(#ins-gold)', AC = 'url(#ins-accent)';
    const chevron = (y, cor, sw) => `<polyline points="16,${y} 32,${y + 11} 48,${y}" stroke="${cor}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    const arco = (y, cor, sw) => `<path d="M17,${y} Q32,${y - 8} 47,${y}" stroke="${cor}" stroke-width="${sw}" stroke-linecap="round" fill="none"/>`;
    const estrela = (cx, cy, r, fill) => {
      let p = '';
      for (let i = 0; i < 5; i++) {
        const ao = -Math.PI / 2 + i * 2 * Math.PI / 5;
        const ai = ao + Math.PI / 5;
        p += `${(cx + r * Math.cos(ao)).toFixed(1)},${(cy + r * Math.sin(ao)).toFixed(1)} `;
        p += `${(cx + r * 0.42 * Math.cos(ai)).toFixed(1)},${(cy + r * 0.42 * Math.sin(ai)).toFixed(1)} `;
      }
      return `<polygon points="${p.trim()}" fill="${fill}"/>`;
    };
    const wrap = (inner, size) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" style="overflow:visible;">${defs}<g filter="url(#ins-glow)">${inner}</g></svg>`;

    // ── PRAÇAS (bronze) — Recruta tem chama própria; Soldado/Cabo, galões. ──
    if (n === 1) return wrap(                                                              // Recruta — escudo (ponto de partida)
      `<path d="M32,12 L48,18 L48,33 C48,43 41,50 32,53 C23,50 16,43 16,33 L16,18 Z" fill="${BR}"/>` +
      `<path d="M32,18 L43,22 L43,33 C43,40 38,45 32,47 C26,45 21,40 21,33 L21,22 Z" fill="none" stroke="${AC}" stroke-width="1.8" opacity="0.9"/>`, 46);
    if (n === 2) return wrap(chevron(33, BR, 5.5), 46);                                   // Soldado — 1 galão
    if (n === 3) return wrap(chevron(26, BR, 5.5) + chevron(34, BR, 5.5), 46);            // Cabo — 2 galões

    // ── GRADUADOS (prata) — 3 galões + arcos (rockers). ──
    if (n === 4) return wrap(chevron(16, AG, 4.6) + chevron(23, AG, 4.6) + chevron(30, AG, 4.6) + arco(46, AG, 3.6), 46);
    if (n === 5) return wrap(chevron(14, AG, 4.6) + chevron(21, AG, 4.6) + chevron(28, AG, 4.6) + arco(44, AG, 3.4) + arco(51, AG, 3.4), 46);
    if (n === 6) return wrap(chevron(13, AG, 4.4) + chevron(19, AG, 4.4) + chevron(25, AG, 4.4) + arco(41, AG, 3.2) + arco(47, AG, 3.2) + arco(53, AG, 3.2), 46);
    // Subtenente (prata) — galões + losango dourado central (sem arcos): topo da carreira de praça.
    if (n === 7) return wrap(chevron(18, AG, 4.6) + chevron(25, AG, 4.6) + `<polygon points="32,33 40,43 32,53 24,43" fill="${OU}"/>`, 46);

    // ── OFICIAIS SUBALTERNOS (ouro) — estrelas dentro de moldura-escudo. ──
    const escudo = `<path d="M14,12 L32,6 L50,12 L46,45 L32,55 L18,45 Z" stroke="${AC}" stroke-width="2.4" fill="none" opacity="0.8"/>`;
    if (n === 8) return wrap(escudo + estrela(32, 30, 9.5, OU), 48);                       // 2º Tenente
    if (n === 9) return wrap(escudo + estrela(32, 23, 7.5, OU) + estrela(32, 39, 7.5, OU), 48); // 1º Tenente
    if (n === 10) return wrap(escudo + estrela(32, 20, 6.8, OU) + estrela(24, 35, 6.8, OU) + estrela(40, 35, 6.8, OU), 48); // Capitão

    // ── OFICIAIS SUPERIORES (ouro) — sabre + bastão cruzados, ramo de louro e estrelas. ──
    const sabre =
      `<line x1="18" y1="50" x2="46" y2="26" stroke="${AG}" stroke-width="2.6" stroke-linecap="round"/>` +
      `<line x1="46" y1="50" x2="18" y2="26" stroke="${AG}" stroke-width="2.6" stroke-linecap="round"/>` +
      `<circle cx="18" cy="50" r="2.4" fill="${OU}"/><circle cx="46" cy="50" r="2.4" fill="${OU}"/>`;
    const ramo =
      `<path d="M23,53 Q13,43 19,30" stroke="${OU}" stroke-width="2" fill="none" opacity="0.85"/>` +
      `<path d="M41,53 Q51,43 45,30" stroke="${OU}" stroke-width="2" fill="none" opacity="0.85"/>`;
    if (n === 11) return wrap(ramo + sabre + estrela(32, 16, 7, OU), 50);                  // Major
    if (n === 12) return wrap(ramo + sabre + estrela(24, 16, 6, OU) + estrela(40, 16, 6, OU), 50); // Tenente-Coronel
    return wrap(ramo + sabre + estrela(32, 12, 5.6, OU) + estrela(22, 19, 5.6, OU) + estrela(42, 19, 5.6, OU), 50); // Coronel
  };

  /* ── CELEBRAÇÃO DE PROMOÇÃO ───────────────────────────────────
     Overlay de comemoração quando o aluno sobe de patente (estilo
     "passou de fase"). Disparada ao vivo pelas telas que creditam XP,
     lendo o campo `promocao` da resposta da API (dono: carreira.js,
     ADR-0012). Uso:
       PBM.Celebracao.promocao({ nivel, patente, insignia })
     `patente` é o objeto `promocao` devolvido pelo backend; null/ausente
     não faz nada. Sem dependências externas — confete em <canvas>. */
  const PALETA_CONFETE = ['#FFE259', '#FFA751', '#C0270F', '#F8F6F2', '#85B7EB'];
  let celebracaoAberta = false;

  function reduzMovimento() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function dispararConfete(canvas, onFim) {
    const ctx = canvas.getContext('2d');
    let raf = null;
    let parado = false;
    const dpr = window.devicePixelRatio || 1;

    function ajustar() {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    }
    ajustar();

    const N = Math.min(160, Math.round(canvas.clientWidth / 6));
    const particulas = [];
    for (let i = 0; i < N; i++) {
      particulas.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 2.4 * dpr,
        vy: (1.5 + Math.random() * 3) * dpr,
        size: (4 + Math.random() * 5) * dpr,
        cor: PALETA_CONFETE[(Math.random() * PALETA_CONFETE.length) | 0],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        forma: Math.random() > 0.5 ? 'ret' : 'circ',
      });
    }

    const inicio = performance.now();
    const DURACAO = 4200;

    function frame(t) {
      if (parado) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const decorrido = t - inicio;
      let vivas = 0;
      for (const p of particulas) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04 * dpr;
        p.rot += p.vr;
        // depois da metade do tempo, esvanece deixando cair
        const alpha = decorrido > DURACAO ? Math.max(0, 1 - (decorrido - DURACAO) / 800) : 1;
        if (p.y < canvas.height + 20 && alpha > 0) vivas++;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.cor;
        if (p.forma === 'ret') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      if (vivas === 0 && decorrido > DURACAO) {
        if (typeof onFim === 'function') onFim();
        return;
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return function parar() {
      parado = true;
      if (raf) cancelAnimationFrame(raf);
    };
  }

  PBM.Celebracao = {
    promocao(patente, opts = {}) {
      if (!patente || !patente.patente) return;
      // Evita empilhar dois overlays (ex: duas subidas no mesmo fluxo).
      const existente = document.getElementById('pbm-celebracao');
      if (existente) existente.remove();
      celebracaoAberta = true;

      const usuario = (typeof PBM.getUsuario === 'function' ? PBM.getUsuario() : null) || {};
      const curso = opts.curso || usuario.curso || 'ctsp';
      const nivel = patente.nivel || 1;
      const insignia = PBM.obterInsigniaSVG(nivel, curso);
      const semMov = reduzMovimento();

      const overlay = document.createElement('div');
      overlay.id = 'pbm-celebracao';
      overlay.className = 'pbm-celebracao' + (semMov ? ' pbm-celebracao--still' : '');
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Promoção de patente');
      overlay.innerHTML = `
        <canvas class="pbm-celebracao__confete" aria-hidden="true"></canvas>
        <div class="pbm-celebracao__card">
          <img class="pbm-celebracao__emblema" src="/images/emblem-pbm.png" alt="" aria-hidden="true">
          <span class="pbm-celebracao__kicker">Promoção de patente</span>
          <div class="pbm-celebracao__insignia">${insignia}</div>
          <h2 class="pbm-celebracao__patente">${patente.patente}</h2>
          <span class="pbm-celebracao__nivel">Nível ${String(nivel).padStart(2, '0')}</span>
          <p class="pbm-celebracao__sub">Sua constância foi reconhecida. O próximo posto exige mais.</p>
          <button type="button" class="pbm-celebracao__btn">Continuar</button>
        </div>
      `;
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      let pararConfete = null;
      let fechado = false;
      function fechar() {
        if (fechado) return;
        fechado = true;
        celebracaoAberta = false;
        if (pararConfete) pararConfete();
        document.removeEventListener('keydown', onKey);
        overlay.classList.add('pbm-celebracao--leaving');
        document.body.style.overflow = '';
        setTimeout(() => overlay.remove(), 320);
      }
      function onKey(e) { if (e.key === 'Escape') fechar(); }

      overlay.querySelector('.pbm-celebracao__btn').addEventListener('click', fechar);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) fechar(); });
      document.addEventListener('keydown', onKey);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => overlay.classList.add('pbm-celebracao--show'));
      });

      if (!semMov) {
        const canvas = overlay.querySelector('.pbm-celebracao__confete');
        pararConfete = dispararConfete(canvas);
      }

      // Auto-fecha: mais tempo se houver animação a apreciar.
      setTimeout(fechar, semMov ? 4500 : 6500);
      return fechar;
    },
  };

  /* ── SKELETON HELPERS ────────────────────────────────────────
     Uso:
       PBM.Skeleton.statGrid('stats-grid', 3)   // renderiza N skeleton cards
       PBM.Skeleton.sessoes('sessoes-list', 4)   // renderiza N skeleton items
       PBM.Skeleton.clear('stats-grid')          // remove skeletons do container
  ─────────────────────────────────────────────────────────────── */
  PBM.Skeleton = {
    statCard() {
      return `<div class="skeleton-stat-card">
        <div class="skeleton skeleton--stat"></div>
        <div class="skeleton skeleton--text-sm" style="margin-top:6px;"></div>
      </div>`;
    },
    sessaoItem() {
      return `<div class="skeleton-sessao">
        <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
          <div class="skeleton skeleton--text" style="width:55%;"></div>
          <div class="skeleton skeleton--text-sm" style="width:35%;"></div>
        </div>
        <div style="display:flex;gap:8px;">
          <div class="skeleton skeleton--text-sm" style="width:52px;border-radius:20px;"></div>
          <div class="skeleton skeleton--text-sm" style="width:52px;border-radius:20px;"></div>
        </div>
      </div>`;
    },
    statGrid(containerId, count = 3) {
      const el = document.getElementById(containerId);
      if (!el) return;
      el.innerHTML = Array(count).fill(this.statCard()).join('');
    },
    sessoes(containerId, count = 4) {
      const el = document.getElementById(containerId);
      if (!el) return;
      el.innerHTML = Array(count).fill(this.sessaoItem()).join('');
    },
    genericCard() {
      return `<div class="skeleton-stat-card" style="height:80px;margin-bottom:12px;border-radius:10px;">
        <div class="skeleton skeleton--text" style="width:40%;margin-bottom:10px;"></div>
        <div class="skeleton skeleton--text-sm" style="width:70%;"></div>
      </div>`;
    },
    generic(containerId, count = 3) {
      const el = document.getElementById(containerId);
      if (!el) return;
      el.innerHTML = Array(count).fill(this.genericCard()).join('');
    },
    clear(containerId) {
      const el = document.getElementById(containerId);
      if (el) el.innerHTML = '';
    },
  };

})();

