/**
 * GraduaBM — Tour guiado de primeiro acesso
 * Ativa uma vez por conta (chave: graduabm_tour_[userId])
 * Exibe um spotlight progressivo sobre os elementos principais do dashboard.
 */
(function() {
  const TOUR_KEY_PREFIX = 'graduabm_tour_v1_';

  const STEPS = [
    {
      target: null,
      title: 'Bem-vindo ao GraduaBM!',
      body: 'Esta plataforma foi criada para turbinar sua preparação para o CBMRS. Em menos de 2 minutos vamos te mostrar os principais recursos.',
      position: 'center',
    },
    {
      target: '#stats-grid',
      title: 'Seu painel de desempenho',
      body: 'Aqui você acompanha em tempo real quantas questões já respondeu, sua taxa de acerto e as sessões concluídas.',
      position: 'bottom',
    },
    {
      target: '.chart-section',
      title: 'Evolução semanal',
      body: 'Este gráfico mostra como sua taxa de acerto e volume de estudo evoluem semana a semana. Comece a estudar e ele se preenche automaticamente.',
      position: 'top',
    },
    {
      target: 'a[href="/area-estudos"]',
      title: 'Modo Estudo',
      body: 'Clique aqui para escolher uma área temática (AT1–AT5), selecionar legislações específicas e iniciar uma sessão de questões com feedback imediato.',
      position: 'right',
    },
    {
      target: 'a[href="/simulados"]',
      title: 'Simulados Oficiais',
      body: 'Treine no formato real da prova: 4 horas de cronômetro, sem gabarito imediato e com Cartão Resposta. Preparação completa para o dia D.',
      position: 'right',
    },
    {
      target: '.btn-iniciar',
      title: 'Comece agora!',
      body: 'Tudo pronto. Inicie sua primeira sessão de estudos e bons estudos, Combatente!',
      position: 'top',
    },
  ];

  let currentStep = 0;
  let overlay, spotlight, tooltip, stepEl, titleEl, bodyEl, btnPrev, btnNext, btnSkip;

  function getTourKey() {
    try {
      const u = JSON.parse(localStorage.getItem('usuario'));
      return TOUR_KEY_PREFIX + (u && u.id ? u.id : 'default');
    } catch { return TOUR_KEY_PREFIX + 'default'; }
  }

  function shouldShow() {
    return !localStorage.getItem(getTourKey());
  }

  function markDone() {
    try { localStorage.setItem(getTourKey(), '1'); } catch {}
  }

  /* ── CRIAÇÃO DO DOM ── */
  function buildDOM() {
    const css = `
      #gbm-tour-overlay {
        position: fixed; inset: 0; z-index: 99990;
        pointer-events: none;
      }
      #gbm-tour-overlay.active { pointer-events: auto; }

      /* fundo escurecido com buraco no spotlight */
      #gbm-tour-bg {
        position: absolute; inset: 0;
        background: rgba(0,0,0,0.72);
        transition: opacity 0.3s;
      }
      #gbm-tour-spotlight {
        position: absolute;
        border-radius: 10px;
        box-shadow: 0 0 0 9999px rgba(0,0,0,0.72);
        transition: all 0.35s cubic-bezier(.4,0,.2,1);
        pointer-events: none;
        border: 2px solid rgba(192,39,15,0.6);
      }
      #gbm-tour-spotlight.center-mode {
        display: none;
      }

      /* tooltip */
      #gbm-tour-tooltip {
        position: absolute;
        background: #1A1A1A;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 1.25rem 1.5rem;
        width: 300px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.6);
        transition: all 0.3s cubic-bezier(.4,0,.2,1);
        z-index: 99999;
      }
      #gbm-tour-tooltip::before {
        content: '';
        position: absolute;
        width: 10px; height: 10px;
        background: #1A1A1A;
        border: 1px solid #333;
        transform: rotate(45deg);
      }
      #gbm-tour-tooltip.arrow-bottom::before {
        bottom: -6px; left: 24px;
        border-top: none; border-left: none;
      }
      #gbm-tour-tooltip.arrow-top::before {
        top: -6px; left: 24px;
        border-bottom: none; border-right: none;
      }
      #gbm-tour-tooltip.arrow-right::before {
        left: -6px; top: 24px;
        border-bottom: none; border-left: none;
        transform: rotate(-45deg);
      }
      #gbm-tour-tooltip.arrow-none::before { display: none; }

      .gbm-tour-step {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 9px; letter-spacing: 0.1em;
        text-transform: uppercase; color: #C0270F;
        margin-bottom: 8px;
      }
      .gbm-tour-title {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 20px; letter-spacing: 0.04em;
        color: #F8F6F2; margin-bottom: 8px; line-height: 1.2;
      }
      .gbm-tour-body {
        font-family: 'IBM Plex Sans', sans-serif;
        font-size: 13px; color: #888; line-height: 1.6;
        margin-bottom: 1.25rem;
      }
      .gbm-tour-actions {
        display: flex; align-items: center; gap: 8px;
        justify-content: flex-end;
      }
      .gbm-tour-skip {
        margin-right: auto;
        background: none; border: none;
        color: #555; font-size: 12px;
        font-family: 'IBM Plex Sans', sans-serif;
        cursor: pointer; padding: 0; transition: color 0.15s;
      }
      .gbm-tour-skip:hover { color: #888; }
      .gbm-tour-btn {
        background: transparent;
        border: 1px solid #333;
        color: #888; border-radius: 6px;
        padding: 6px 14px; font-size: 12px;
        font-family: 'IBM Plex Sans', sans-serif;
        cursor: pointer; transition: all 0.15s;
      }
      .gbm-tour-btn:hover { border-color: #555; color: #F8F6F2; }
      .gbm-tour-btn-next {
        background: #C0270F; border-color: #C0270F; color: #fff;
      }
      .gbm-tour-btn-next:hover { background: #8B1A08; border-color: #8B1A08; color: #fff; }
      .gbm-tour-dots {
        display: flex; gap: 5px; align-items: center;
        margin-right: 8px;
      }
      .gbm-tour-dot {
        width: 5px; height: 5px; border-radius: 50%;
        background: #333; transition: background 0.2s;
      }
      .gbm-tour-dot.active { background: #C0270F; }

      /* modal central (step 0) */
      #gbm-tour-modal-center {
        display: none;
        position: fixed; inset: 0; z-index: 99998;
        align-items: center; justify-content: center;
        background: rgba(0,0,0,0.8);
      }
      #gbm-tour-modal-center.visible {
        display: flex;
      }
      .gbm-modal-box {
        background: #1A1A1A;
        border: 1px solid #333;
        border-radius: 16px;
        padding: 2.5rem 2rem;
        max-width: 400px;
        width: 90%;
        text-align: center;
      }
      .gbm-modal-icon {
        width: 56px; height: 56px;
        border-radius: 50%;
        background: rgba(192,39,15,0.12);
        border: 1px solid rgba(192,39,15,0.25);
        display: inline-flex; align-items: center; justify-content: center;
        margin-bottom: 1.25rem;
      }
      .gbm-modal-box h2 {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 28px; letter-spacing: 0.04em;
        color: #F8F6F2; margin-bottom: 10px;
      }
      .gbm-modal-box p {
        font-family: 'IBM Plex Sans', sans-serif;
        font-size: 14px; color: #888; line-height: 1.65;
        margin-bottom: 1.75rem;
      }
      .gbm-modal-actions {
        display: flex; gap: 10px; justify-content: center;
      }
      .gbm-modal-btn-skip {
        background: transparent; border: 1px solid #333;
        color: #555; border-radius: 8px;
        padding: 10px 20px; font-size: 13px;
        font-family: 'IBM Plex Sans', sans-serif;
        cursor: pointer; transition: all 0.15s;
      }
      .gbm-modal-btn-skip:hover { border-color: #555; color: #888; }
      .gbm-modal-btn-start {
        background: #C0270F; border: 1px solid #C0270F;
        color: #fff; border-radius: 8px;
        padding: 10px 24px; font-size: 13px; font-weight: 600;
        font-family: 'IBM Plex Sans', sans-serif;
        cursor: pointer; transition: all 0.15s;
      }
      .gbm-modal-btn-start:hover { background: #8B1A08; border-color: #8B1A08; }
    `;

    const styleTag = document.createElement('style');
    styleTag.textContent = css;
    document.head.appendChild(styleTag);

    /* modal de boas-vindas (step 0) */
    const modalCenter = document.createElement('div');
    modalCenter.id = 'gbm-tour-modal-center';
    modalCenter.innerHTML = `
      <div class="gbm-modal-box">
        <div class="gbm-modal-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C0270F" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <h2>Bem-vindo ao GraduaBM!</h2>
        <p>Sua plataforma de preparação para o CBMRS. Vamos te mostrar os principais recursos em menos de 2 minutos?</p>
        <div class="gbm-modal-actions">
          <button class="gbm-modal-btn-skip" id="gbm-skip-modal">Pular tour</button>
          <button class="gbm-modal-btn-start" id="gbm-start-tour">Iniciar tour ›</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalCenter);

    /* overlay + spotlight + tooltip */
    overlay = document.createElement('div');
    overlay.id = 'gbm-tour-overlay';
    overlay.innerHTML = `
      <div id="gbm-tour-bg"></div>
      <div id="gbm-tour-spotlight"></div>
      <div id="gbm-tour-tooltip">
        <div class="gbm-tour-step" id="gbm-step-label"></div>
        <div class="gbm-tour-title" id="gbm-step-title"></div>
        <div class="gbm-tour-body" id="gbm-step-body"></div>
        <div class="gbm-tour-actions">
          <button class="gbm-tour-skip" id="gbm-btn-skip">Pular tour</button>
          <div class="gbm-tour-dots" id="gbm-dots"></div>
          <button class="gbm-tour-btn" id="gbm-btn-prev">← Voltar</button>
          <button class="gbm-tour-btn gbm-tour-btn-next" id="gbm-btn-next">Próximo →</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    spotlight = overlay.querySelector('#gbm-tour-spotlight');
    tooltip   = overlay.querySelector('#gbm-tour-tooltip');
    stepEl    = overlay.querySelector('#gbm-step-label');
    titleEl   = overlay.querySelector('#gbm-step-title');
    bodyEl    = overlay.querySelector('#gbm-step-body');
    btnPrev   = overlay.querySelector('#gbm-btn-prev');
    btnNext   = overlay.querySelector('#gbm-btn-next');
    btnSkip   = overlay.querySelector('#gbm-btn-skip');

    /* dots */
    const dots = overlay.querySelector('#gbm-dots');
    STEPS.slice(1).forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'gbm-tour-dot';
      d.dataset.i = i + 1;
      dots.appendChild(d);
    });

    /* eventos */
    document.getElementById('gbm-skip-modal').addEventListener('click', destroy);
    document.getElementById('gbm-start-tour').addEventListener('click', () => {
      modalCenter.classList.remove('visible');
      currentStep = 1;
      showStep(currentStep);
    });
    btnSkip.addEventListener('click', destroy);
    btnPrev.addEventListener('click', () => { if (currentStep > 1) { currentStep--; showStep(currentStep); } });
    btnNext.addEventListener('click', () => {
      currentStep++;
      if (currentStep >= STEPS.length) { destroy(); return; }
      showStep(currentStep);
    });

    /* mostrar modal de boas-vindas */
    modalCenter.classList.add('visible');
  }

  function updateDots(step) {
    overlay.querySelectorAll('.gbm-tour-dot').forEach(d => {
      d.classList.toggle('active', parseInt(d.dataset.i) === step);
    });
  }

  function showStep(idx) {
    const step = STEPS[idx];
    if (!step) { destroy(); return; }

    overlay.classList.add('active');
    stepEl.textContent = `Passo ${idx} de ${STEPS.length - 1}`;
    titleEl.textContent = step.title;
    bodyEl.textContent = step.body;
    updateDots(idx);

    btnPrev.style.display = idx <= 1 ? 'none' : '';
    btnNext.textContent = idx >= STEPS.length - 1 ? 'Concluir ✓' : 'Próximo →';

    if (!step.target) {
      spotlight.style.display = 'none';
      positionTooltip(null, 'center');
      return;
    }

    const el = document.querySelector(step.target);
    if (!el) { showStep(idx + 1); return; }

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const pad = 8;
      spotlight.style.display = '';
      spotlight.style.left   = (rect.left   - pad) + 'px';
      spotlight.style.top    = (rect.top    - pad) + 'px';
      spotlight.style.width  = (rect.width  + pad * 2) + 'px';
      spotlight.style.height = (rect.height + pad * 2) + 'px';
      positionTooltip(rect, step.position);
    }, 320);
  }

  function positionTooltip(rect, pos) {
    const TW = 300, TH = 200, GAP = 16;
    const vw = window.innerWidth, vh = window.innerHeight;

    tooltip.className = 'arrow-none';

    if (!rect || pos === 'center') {
      tooltip.style.left = Math.max(16, (vw - TW) / 2) + 'px';
      tooltip.style.top  = Math.max(16, (vh - TH) / 2) + 'px';
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
      if (left + TW > vw) { left = rect.left - TW - GAP; }
      tooltip.className = 'arrow-right';
    }

    left = Math.max(16, Math.min(left, vw - TW - 16));
    top  = Math.max(16, Math.min(top, vh - TH - 16));

    tooltip.style.left = left + 'px';
    tooltip.style.top  = top  + 'px';
  }

  function destroy() {
    markDone();
    const modal = document.getElementById('gbm-tour-modal-center');
    if (modal) modal.remove();
    if (overlay) overlay.remove();
  }

  /* ── INICIAR ── */
  function init() {
    if (!shouldShow()) return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', buildDOM);
    } else {
      setTimeout(buildDOM, 600);
    }
  }

  init();
})();
