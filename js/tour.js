/**
 * Protocolo Bravo Mike — Tour Universal Guiado
 * Suporta múltiplas páginas com steps independentes e persistência granular.
 * API pública: PBMTour.init() | PBMTour.start() | PBMTour.reset()
 */
(function () {
  const VERSION = 'v2';

  const TOUR_CONFIG = {
    '/dashboard': {
      key: 'dashboard',
      welcomeTitle: 'Bem-vindo ao Protocolo Bravo Mike!',
      welcomeBody: 'Sua plataforma de preparação para o concurso. Vamos te mostrar os principais recursos em menos de 2 minutos?',
      steps: [
        {
          target: '#stats-grid',
          title: 'Seu painel de desempenho',
          body: 'Acompanhe em tempo real quantas questões já respondeu, sua taxa de acerto e as sessões concluídas.',
          position: 'bottom',
        },
        {
          target: '.chart-section',
          title: 'Evolução semanal',
          body: 'Este gráfico mostra como sua taxa de acerto e volume de estudo evoluem semana a semana. Estude e ele se preenche automaticamente.',
          position: 'top',
        },
        {
          target: 'a[href="/area-estudos"]',
          title: 'Modo Estudo',
          body: 'Escolha uma área temática (AT1–AT5), selecione legislações e inicie uma sessão com feedback imediato por questão.',
          position: 'right',
        },
        {
          target: 'a[href="/simulados"]',
          title: 'Simulados Oficiais',
          body: 'Ambiente de prova fechado: 4 horas de cronômetro, sem gabarito imediato e com Cartão Resposta. Treine como na prova real.',
          position: 'right',
        },
        {
          target: '.btn-iniciar',
          title: 'Comece agora!',
          body: 'Tudo pronto. Inicie sua primeira sessão de estudos, Combatente!',
          position: 'top',
        },
      ],
    },

    '/area-estudos': {
      key: 'area-estudos',
      welcomeTitle: 'Escolha seu curso e área',
      welcomeBody: 'Este é o ponto de partida do Modo Estudo. Vamos ver como selecionar o curso e as áreas temáticas.',
      steps: [
        {
          target: '.curso-seletor',
          title: 'Selecione o curso',
          body: 'Escolha entre CTSP (60 questões, Sargentos) e CBA (40 questões, Tenentes). A plataforma se adapta automaticamente ao edital do seu curso.',
          position: 'bottom',
        },
        {
          target: '#stats-row',
          title: 'Seu progresso por curso',
          body: 'Veja quantas questões já respondeu e a taxa de acerto acumulada no curso selecionado.',
          position: 'top',
        },
        {
          target: '#areas-lista',
          title: 'Áreas Temáticas (AT1–AT5)',
          body: 'Cada card representa uma área temática do edital. Clique em qualquer área para selecionar as legislações e iniciar o estudo.',
          position: 'top',
        },
      ],
    },

    '/selecao-legislacao': {
      key: 'selecao-legislacao',
      welcomeTitle: 'Selecione as legislações',
      welcomeBody: 'Aqui você escolhe exatamente o que estudar e como filtrar as questões. Vamos ver cada opção.',
      steps: [
        {
          target: '#conteudo-legislacoes',
          title: 'Legislações disponíveis',
          body: 'Marque uma ou várias legislações. Quanto mais específico, mais focado será seu treino. Você pode selecionar tudo de uma vez.',
          position: 'top',
        },
        {
          target: '#filtro-opts',
          title: 'Filtro de questões',
          body: 'Escolha entre: Todas, Inéditas (que você ainda não respondeu) ou Erradas (para reforçar seus pontos fracos).',
          position: 'top',
        },
        {
          target: '#resumo-num',
          title: 'Quantidade e cobertura',
          body: 'O número indica quantas questões serão geradas. O indicador de cobertura mostra que % do conteúdo você está exercitando.',
          position: 'bottom',
        },
        {
          target: '#btn-iniciar',
          title: 'Iniciar sessão',
          body: 'Quando tudo estiver configurado, clique aqui para começar. As questões aparecem com feedback imediato após cada resposta.',
          position: 'top',
        },
      ],
    },

    '/questoes': {
      key: 'questoes',
      welcomeTitle: 'Modo Estudo — Resolução de Questões',
      welcomeBody: 'Este é o ambiente de estudo com feedback imediato. Veja como usar cada recurso.',
      steps: [
        {
          target: '#hdr-nav-toggle',
          title: 'Mapa de questões',
          body: 'Clique no número central para abrir o mapa e navegar diretamente para qualquer questão da sessão.',
          position: 'bottom',
        },
        {
          target: '#timer-display',
          title: 'Cronômetro',
          body: 'Registra o tempo gasto na sessão. Use como referência para calibrar seu ritmo durante os estudos.',
          position: 'bottom',
        },
        {
          target: '#enunciado',
          title: 'Enunciado da questão',
          body: 'Leia com atenção. As questões são baseadas nas legislações que você selecionou.',
          position: 'bottom',
        },
        {
          target: '#alternativas',
          title: 'Alternativas',
          body: 'Clique para selecionar a alternativa. Após confirmar, a correta ficará verde e a errada vermelha — junto com a justificativa.',
          position: 'top',
        },
        {
          target: '#btn-acao',
          title: 'Confirmar resposta',
          body: 'Após selecionar uma alternativa, clique aqui para ver o gabarito e a justificativa fundamentada.',
          position: 'top',
        },
      ],
    },

    '/simulados': {
      key: 'simulados',
      welcomeTitle: 'Simulados Oficiais',
      welcomeBody: 'Aqui você treina no formato exato da prova. Algumas regras importantes para conhecer antes de começar.',
      steps: [
        {
          target: '.curso-seletor',
          title: 'Escolha o curso',
          body: 'CTSP gera 60 questões distribuídas pelas 5 áreas do edital. CBA gera 40 questões com sua própria distribuição.',
          position: 'bottom',
        },
        {
          target: '.simulado-regras',
          title: 'Regras do simulado',
          body: 'Leia com atenção: sem feedback imediato, navegação livre entre questões e gabarito somente pelo Cartão Resposta oficial.',
          position: 'top',
        },
        {
          target: '.btn-iniciar',
          title: 'Iniciar simulado',
          body: 'O cronômetro de 4 horas começa imediatamente. Ao encerrar, você vê aproveitamento por área e gabarito comparativo.',
          position: 'top',
        },
      ],
    },

    '/flashcards': {
      key: 'flashcards',
      welcomeTitle: 'Flashcards de Memorização',
      welcomeBody: 'Cartões gerados por IA para revisar os conceitos-chave de cada área. Veja como usar.',
      steps: [
        {
          target: '#filtro-area',
          title: 'Filtrar por área',
          body: 'Escolha uma área temática específica ou veja todos os flashcards do dia.',
          position: 'bottom',
        },
        {
          target: '#card-scene',
          title: 'Clique para revelar',
          body: 'O frente do card traz o conceito ou a pergunta. Clique para virar e ver a resposta completa.',
          position: 'top',
        },
        {
          target: '#seta-fc-dir',
          title: 'Navegar entre cards',
          body: 'Use as setas para avançar ou voltar. O progresso é exibido na barra superior.',
          position: 'left',
        },
      ],
    },
  };

  /* ── UTILS ── */
  function getPageKey() {
    const path = window.location.pathname;
    return TOUR_CONFIG[path] ? TOUR_CONFIG[path].key : null;
  }

  function storageKey(pageKey) {
    try {
      const u = JSON.parse(localStorage.getItem('usuario'));
      const uid = u && u.id ? u.id : 'default';
      return `pbm_tour_${pageKey}_${VERSION}_${uid}`;
    } catch { return `pbm_tour_${pageKey}_${VERSION}_default`; }
  }

  function shouldShow(pageKey) {
    try { return !localStorage.getItem(storageKey(pageKey)); } catch { return false; }
  }

  function markDone(pageKey) {
    try { localStorage.setItem(storageKey(pageKey), '1'); } catch {}
  }

  /* ── STATE ── */
  let currentStep = 0;
  let activeConfig = null;
  let overlay, spotlight, tooltip, stepEl, titleEl, bodyEl, btnPrev, btnNext, btnSkip;

  /* ── DOM ── */
  function buildCSS() {
    if (document.getElementById('pbm-tour-style')) return;
    const style = document.createElement('style');
    style.id = 'pbm-tour-style';
    style.textContent = `
      #pbm-tour-overlay {
        position: fixed; inset: 0; z-index: 99990;
        pointer-events: none;
      }
      #pbm-tour-overlay.active { pointer-events: auto; }
      #pbm-tour-spotlight {
        position: absolute;
        border-radius: 10px;
        box-shadow: 0 0 0 9999px rgba(0,0,0,0.75);
        transition: all 0.35s cubic-bezier(.4,0,.2,1);
        pointer-events: none;
        border: 2px solid rgba(192,39,15,0.7);
      }
      #pbm-tour-tooltip {
        position: absolute;
        background: #1A1A1A;
        border: 1px solid #2A2A2A;
        border-radius: 12px;
        padding: 1.25rem 1.5rem;
        width: 300px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.7);
        transition: all 0.3s cubic-bezier(.4,0,.2,1);
        z-index: 99999;
      }
      #pbm-tour-tooltip::before {
        content: '';
        position: absolute;
        width: 10px; height: 10px;
        background: #1A1A1A;
        border: 1px solid #2A2A2A;
        transform: rotate(45deg);
      }
      #pbm-tour-tooltip.arrow-bottom::before { bottom:-6px;left:24px;border-top:none;border-left:none; }
      #pbm-tour-tooltip.arrow-top::before { top:-6px;left:24px;border-bottom:none;border-right:none; }
      #pbm-tour-tooltip.arrow-right::before { left:-6px;top:24px;border-bottom:none;border-left:none;transform:rotate(-45deg); }
      #pbm-tour-tooltip.arrow-left::before { right:-6px;top:24px;border-top:none;border-right:none;transform:rotate(45deg); }
      #pbm-tour-tooltip.arrow-none::before { display:none; }
      .pbm-tour-step { font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#C0270F;margin-bottom:8px; }
      .pbm-tour-title { font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.04em;color:#F8F6F2;margin-bottom:8px;line-height:1.2; }
      .pbm-tour-body { font-family:'Inter',sans-serif;font-size:13px;color:#888;line-height:1.6;margin-bottom:1.25rem; }
      .pbm-tour-actions { display:flex;align-items:center;gap:8px;justify-content:flex-end; }
      .pbm-tour-skip { margin-right:auto;background:none;border:none;color:#555;font-size:12px;font-family:'Inter',sans-serif;cursor:pointer;padding:0;transition:color .15s; }
      .pbm-tour-skip:hover { color:#888; }
      .pbm-tour-btn { background:transparent;border:1px solid #333;color:#888;border-radius:6px;padding:6px 14px;font-size:12px;font-family:'Inter',sans-serif;cursor:pointer;transition:all .15s; }
      .pbm-tour-btn:hover { border-color:#555;color:#F8F6F2; }
      .pbm-tour-btn-next { background:#C0270F;border-color:#C0270F;color:#fff; }
      .pbm-tour-btn-next:hover { background:#8B1A08;border-color:#8B1A08; }
      .pbm-tour-dots { display:flex;gap:5px;align-items:center;margin-right:8px; }
      .pbm-tour-dot { width:5px;height:5px;border-radius:50%;background:#333;transition:background .2s; }
      .pbm-tour-dot.active { background:#C0270F; }
      #pbm-tour-modal-center {
        display:none;position:fixed;inset:0;z-index:99998;
        align-items:center;justify-content:center;
        background:rgba(0,0,0,0.82);
      }
      #pbm-tour-modal-center.visible { display:flex; }
      .pbm-modal-box { background:#1A1A1A;border:1px solid #2A2A2A;border-radius:16px;padding:2.5rem 2rem;max-width:400px;width:90%;text-align:center; }
      .pbm-modal-icon { width:56px;height:56px;border-radius:50%;background:rgba(192,39,15,.12);border:1px solid rgba(192,39,15,.25);display:inline-flex;align-items:center;justify-content:center;margin-bottom:1.25rem; }
      .pbm-modal-box h2 { font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:.04em;color:#F8F6F2;margin-bottom:10px; }
      .pbm-modal-box p { font-family:'Inter',sans-serif;font-size:14px;color:#888;line-height:1.65;margin-bottom:1.75rem; }
      .pbm-modal-actions { display:flex;gap:10px;justify-content:center; }
      .pbm-modal-btn-skip { background:transparent;border:1px solid #333;color:#555;border-radius:8px;padding:10px 20px;font-size:13px;font-family:'Inter',sans-serif;cursor:pointer;transition:all .15s; }
      .pbm-modal-btn-skip:hover { border-color:#555;color:#888; }
      .pbm-modal-btn-start { background:#C0270F;border:1px solid #C0270F;color:#fff;border-radius:8px;padding:10px 24px;font-size:13px;font-weight:600;font-family:'Inter',sans-serif;cursor:pointer;transition:all .15s; }
      .pbm-modal-btn-start:hover { background:#8B1A08;border-color:#8B1A08; }
    `;
    document.head.appendChild(style);
  }

  function buildDOM(config) {
    buildCSS();

    /* modal de boas-vindas */
    const modalCenter = document.createElement('div');
    modalCenter.id = 'pbm-tour-modal-center';
    modalCenter.innerHTML = `
      <div class="pbm-modal-box">
        <div class="pbm-modal-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C0270F" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <h2>${config.welcomeTitle}</h2>
        <p>${config.welcomeBody}</p>
        <div class="pbm-modal-actions">
          <button class="pbm-modal-btn-skip" id="pbm-skip-modal">Pular</button>
          <button class="pbm-modal-btn-start" id="pbm-start-tour">Iniciar tour ›</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalCenter);

    /* overlay + spotlight + tooltip */
    overlay = document.createElement('div');
    overlay.id = 'pbm-tour-overlay';
    overlay.innerHTML = `
      <div id="pbm-tour-spotlight"></div>
      <div id="pbm-tour-tooltip">
        <div class="pbm-tour-step" id="pbm-step-label"></div>
        <div class="pbm-tour-title" id="pbm-step-title"></div>
        <div class="pbm-tour-body" id="pbm-step-body"></div>
        <div class="pbm-tour-actions">
          <button class="pbm-tour-skip" id="pbm-btn-skip">Pular tour</button>
          <div class="pbm-tour-dots" id="pbm-dots"></div>
          <button class="pbm-tour-btn" id="pbm-btn-prev">← Voltar</button>
          <button class="pbm-tour-btn pbm-tour-btn-next" id="pbm-btn-next">Próximo →</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    spotlight = overlay.querySelector('#pbm-tour-spotlight');
    tooltip   = overlay.querySelector('#pbm-tour-tooltip');
    stepEl    = overlay.querySelector('#pbm-step-label');
    titleEl   = overlay.querySelector('#pbm-step-title');
    bodyEl    = overlay.querySelector('#pbm-step-body');
    btnPrev   = overlay.querySelector('#pbm-btn-prev');
    btnNext   = overlay.querySelector('#pbm-btn-next');
    btnSkip   = overlay.querySelector('#pbm-btn-skip');

    const dotsEl = overlay.querySelector('#pbm-dots');
    config.steps.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'pbm-tour-dot';
      d.dataset.i = i;
      dotsEl.appendChild(d);
    });

    document.getElementById('pbm-skip-modal').addEventListener('click', destroy);
    document.getElementById('pbm-start-tour').addEventListener('click', () => {
      modalCenter.classList.remove('visible');
      currentStep = 0;
      showStep(0);
    });
    btnSkip.addEventListener('click', destroy);
    btnPrev.addEventListener('click', () => { if (currentStep > 0) { currentStep--; showStep(currentStep); } });
    btnNext.addEventListener('click', () => {
      currentStep++;
      if (currentStep >= config.steps.length) { destroy(); return; }
      showStep(currentStep);
    });

    markDone(config.key);
    modalCenter.classList.add('visible');
  }

  function updateDots(idx) {
    if (!overlay) return;
    overlay.querySelectorAll('.pbm-tour-dot').forEach(d => {
      d.classList.toggle('active', parseInt(d.dataset.i) === idx);
    });
  }

  function showStep(idx) {
    if (!activeConfig) return;
    const step = activeConfig.steps[idx];
    if (!step) { destroy(); return; }

    overlay.classList.add('active');
    stepEl.textContent = `Passo ${idx + 1} de ${activeConfig.steps.length}`;
    titleEl.textContent = step.title;
    bodyEl.textContent = step.body;
    updateDots(idx);

    btnPrev.style.display = idx === 0 ? 'none' : '';
    btnNext.textContent = idx >= activeConfig.steps.length - 1 ? 'Concluir ✓' : 'Próximo →';

    const el = step.target ? document.querySelector(step.target) : null;
    if (!el) { showStep(idx + 1); return; }

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const pad = 8;
      spotlight.style.cssText = `left:${rect.left - pad}px;top:${rect.top - pad}px;width:${rect.width + pad * 2}px;height:${rect.height + pad * 2}px;display:block;`;
      positionTooltip(rect, step.position || 'bottom');
    }, 320);
  }

  function positionTooltip(rect, pos) {
    const TW = 300, TH = 220, GAP = 16;
    const vw = window.innerWidth, vh = window.innerHeight;
    tooltip.className = 'arrow-none';

    if (!rect) {
      tooltip.style.cssText = `left:${Math.max(16, (vw - TW) / 2)}px;top:${Math.max(16, (vh - TH) / 2)}px;`;
      return;
    }

    /* mobile: forçar centralizado se viewport estreito */
    if (vw < 480) {
      tooltip.style.cssText = `left:${Math.max(16, (vw - TW) / 2)}px;top:${Math.min(rect.bottom + GAP, vh - TH - 16)}px;`;
      return;
    }

    let left, top;
    if (pos === 'bottom') {
      left = Math.min(rect.left, vw - TW - 16);
      top  = rect.bottom + GAP;
      if (top + TH > vh) { top = rect.top - TH - GAP; tooltip.className = 'arrow-bottom'; }
      else { tooltip.className = 'arrow-top'; }
    } else if (pos === 'top') {
      left = Math.min(rect.left, vw - TW - 16);
      top  = rect.top - TH - GAP;
      if (top < 0) { top = rect.bottom + GAP; tooltip.className = 'arrow-top'; }
      else { tooltip.className = 'arrow-bottom'; }
    } else if (pos === 'right') {
      left = rect.right + GAP;
      top  = rect.top;
      if (left + TW > vw) { left = rect.left - TW - GAP; tooltip.className = 'arrow-left'; }
      else { tooltip.className = 'arrow-right'; }
    } else if (pos === 'left') {
      left = rect.left - TW - GAP;
      top  = rect.top;
      if (left < 0) { left = rect.right + GAP; tooltip.className = 'arrow-right'; }
      else { tooltip.className = 'arrow-left'; }
    }

    left = Math.max(16, Math.min(left, vw - TW - 16));
    top  = Math.max(16, Math.min(top, vh - TH - 16));
    tooltip.style.cssText = `left:${left}px;top:${top}px;`;
  }

  function destroy() {
    const modal = document.getElementById('pbm-tour-modal-center');
    if (modal) modal.remove();
    if (overlay) { overlay.remove(); overlay = null; }
    activeConfig = null;
    currentStep = 0;
  }

  function launch(config, force) {
    if (overlay) destroy(); // limpa run anterior
    activeConfig = config;
    if (force || shouldShow(config.key)) {
      markDone(config.key);
      buildDOM(config);
    }
  }

  /* ── API PÚBLICA ── */
  window.PBMTour = {
    init() {
      const path = window.location.pathname;
      const config = TOUR_CONFIG[path];
      if (!config) return;
      if (!shouldShow(config.key)) return;
      setTimeout(() => launch(config, false), 700);
    },

    start() {
      const path = window.location.pathname;
      const config = TOUR_CONFIG[path];
      if (!config) return;
      setTimeout(() => launch(config, true), 100);
    },

    reset() {
      Object.values(TOUR_CONFIG).forEach(cfg => {
        try {
          const u = JSON.parse(localStorage.getItem('usuario'));
          const uid = u && u.id ? u.id : 'default';
          localStorage.removeItem(`pbm_tour_${cfg.key}_${VERSION}_${uid}`);
        } catch {}
      });
    },
  };
})();
