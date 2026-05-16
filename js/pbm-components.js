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
        <a href="/" class="logo-text">Protocolo Bravo Mike</a>
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
        ${item('ranking', '/ranking', 'Ranking')}
        ${item('flashcards', '/flashcards', 'Flashcards')}
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
      ${link('ranking', '/ranking', 'Ranking')}
    `;
  }

  function populateUsuario() {
    const nomeEl = document.getElementById('sidebar-nome');
    const statusEl = document.getElementById('sidebar-status-txt');
    if (!nomeEl) return;
    let user = null;
    try { user = (PBM.getUsuario && PBM.getUsuario()) || null; } catch (_) {}
    if (user) {
      nomeEl.textContent = user.nickname || user.nome || user.email || 'Aluno';
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
})();
