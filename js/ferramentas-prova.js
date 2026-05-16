/* PBM — Ferramentas de Prova (Marca-texto, Lápis, Borracha, Tesoura)
 * API:
 *   PBMFerramentas.init({
 *     containerSelector:     '.questao-container',   // recebe o canvas overlay
 *     enunciadoSelector:     '#q-enunciado',         // alvo de seleção/restore
 *     altsContainerSelector: '#alts-lista',          // varrido para tesouras
 *     altTextoSelector:      '.alt-texto'            // sub-elemento de texto da alt
 *   });
 *   PBMFerramentas.onQuestaoChange(q.id);             // chamar após cada render
 */
(function () {
  if (window.PBMFerramentas) return;

  const STORAGE_PREFIX = 'pbm_ferramentas_q_';
  const MODES = {
    NONE: null,
    MARCA: 'marca',       // marca-texto (seleção/arrastar)
    LAPIS: 'lapis',       // desenho livre (canvas, tipo Paint)
    BORRACHA: 'borracha', // apaga marca-texto E desenho
  };

  const state = {
    config: null,
    mode: MODES.NONE,
    activeQuestaoId: null,
    canvas: null,
    ctx: null,
    drawing: false,
    erasing: false,
    lastX: 0,
    lastY: 0,
    resizeRaf: 0,
    restoring: false,
    justWrapped: false,
    strokes: [],           // array de { points:[{x,y}], color, width }
    currentStroke: null,
    history: [],           // pilha de snapshots para undo
    resizeObs: null,
  };

  const LAPIS_STYLE = { color: 'rgba(110, 170, 255, 0.95)', width: 2.2 };
  const HISTORY_MAX = 30;

  // ───── Ícones SVG ──────────────────────────────────────────────────────
  const ICONS = {
    marca:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l-6 6v3h3l6-6"/><path d="M22 12l-4.5 4.5L11 10l4.5-4.5z"/><path d="M15 5l4 4"/></svg>',
    lapis:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>',
    borracha: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6 6h12"/><path d="M21 11L11 1 1 11l10 10"/></svg>',
    tesoura:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>',
    undo:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 8"/></svg>',
  };

  // ───── Estilos ─────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('pbm-ferramentas-css')) return;
    const css = `
      .pbm-hl-marca { background: rgba(255, 213, 79, 0.45); color: inherit; border-radius: 2px; padding: 0 1px; }

      .pbm-canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 50; display: block; }
      .pbm-canvas.is-active {
        pointer-events: auto !important;
        cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14'><circle cx='7' cy='7' r='3' fill='%236EAAFF' stroke='%23000' stroke-width='1'/></svg>") 7 7, crosshair;
      }

      /* Quando marca-texto ativo: força seleção de texto mesmo em elementos com user-select:none */
      body.pbm-tool-marca [data-pbm-zone],
      body.pbm-tool-marca [data-pbm-zone] *,
      body.pbm-tool-marca [data-pbm-zone] .alt,
      body.pbm-tool-marca [data-pbm-zone] .alt * {
        user-select: text !important;
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        cursor: text !important;
      }
      body.pbm-tool-marca .alt-tesoura,
      body.pbm-tool-marca .alt-tesoura * { cursor: pointer !important; }
      body.pbm-tool-borracha [data-pbm-zone],
      body.pbm-tool-borracha [data-pbm-zone] * {
        cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='22' height='16'><rect x='1' y='1' width='20' height='14' rx='2' fill='%23F4A6A6' stroke='%23111' stroke-width='1.2'/><rect x='1' y='1' width='7' height='14' rx='2' fill='%23FFFFFF' stroke='%23111' stroke-width='1.2'/></svg>") 4 8, cell !important;
        user-select: none !important;
      }

      /* Alternativas */
      .alt { position: relative; }
      .alt-eliminada { opacity: 0.55; }
      .alt-eliminada .alt-texto,
      .alt-eliminada > span {
        text-decoration: line-through;
        text-decoration-color: rgba(255, 90, 70, 0.9);
        text-decoration-thickness: 2.5px;
      }
      .alt-tesoura {
        position: absolute; top: 8px; right: 10px;
        width: 28px; height: 28px;
        display: flex; align-items: center; justify-content: center;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 6px;
        color: #c9c9c9; cursor: pointer;
        opacity: 0.75;
        transition: opacity 0.12s, background 0.12s, color 0.12s, border-color 0.12s;
        z-index: 6;
      }
      .alt:hover .alt-tesoura { opacity: 1; }
      .alt-tesoura:hover { background: rgba(192,39,15,0.22); color: #fff; border-color: rgba(192,39,15,0.5); }
      .alt-eliminada .alt-tesoura {
        background: rgba(192,39,15,0.32); color: #fff;
        border-color: rgba(192,39,15,0.6); opacity: 1;
      }
      .alt-tesoura svg { width: 15px; height: 15px; pointer-events: none; }

      /* Barra lateral fixa no canto direito (sidebar) */
      .pbm-fe-toolbar {
        position: fixed; right: 0; top: 22%;
        z-index: 9998;
        background: rgba(20,20,20,0.96);
        border: 1px solid rgba(255,255,255,0.08);
        border-right: none;
        border-radius: 10px 0 0 10px;
        padding: 6px;
        display: flex; flex-direction: column; gap: 4px;
        box-shadow: -6px 0 24px rgba(0,0,0,0.5);
        font-family: 'Inter', system-ui, sans-serif;
        user-select: none;
        backdrop-filter: blur(6px);
      }
      .pbm-fe-btn {
        position: relative;
        width: 38px; height: 38px;
        display: flex; align-items: center; justify-content: center;
        padding: 0;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 8px;
        color: #d4d4d4;
        cursor: pointer;
        transition: background 0.12s, border-color 0.12s, color 0.12s;
      }
      .pbm-fe-btn:hover { background: rgba(255,255,255,0.07); color: #fff; }
      .pbm-fe-btn.is-active {
        background: rgba(192,39,15,0.25);
        border-color: rgba(192,39,15,0.65);
        color: #fff;
      }
      .pbm-fe-btn svg { width: 18px; height: 18px; pointer-events: none; }
      .pbm-fe-btn::after {
        content: attr(data-tooltip);
        position: absolute;
        right: calc(100% + 10px); top: 50%; transform: translateY(-50%);
        padding: 5px 9px;
        background: rgba(0,0,0,0.92);
        color: #fff; font-size: 11px;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 4px;
        white-space: nowrap;
        opacity: 0; pointer-events: none;
        transition: opacity 0.12s;
      }
      .pbm-fe-btn:hover::after { opacity: 1; }
      .pbm-fe-btn[disabled] { opacity: 0.35; cursor: default; pointer-events: none; }
      .pbm-fe-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 4px 4px; }

      @media (max-width: 720px) {
        .pbm-fe-toolbar { top: auto; bottom: 96px; }
      }

      /* ── LIGHT MODE ── superfícies claras + texto escuro */
      :root.light-mode .pbm-fe-toolbar {
        background: rgba(255,255,255,0.98);
        border-color: rgba(15,20,30,0.10);
        box-shadow: -6px 0 24px rgba(15,20,30,0.10);
      }
      :root.light-mode .pbm-fe-btn { color: #343A40; }
      :root.light-mode .pbm-fe-btn:hover { background: rgba(15,20,30,0.06); color: #1B1F23; }
      :root.light-mode .pbm-fe-btn.is-active {
        background: rgba(154,31,12,0.10);
        border-color: rgba(154,31,12,0.45);
        color: #8B1A08;
      }
      :root.light-mode .pbm-fe-btn::after {
        background: rgba(27,31,35,0.92);
        color: #fff;
        border-color: rgba(15,20,30,0.10);
      }
      :root.light-mode .pbm-fe-divider { background: rgba(15,20,30,0.08); }

      :root.light-mode .alt-tesoura {
        background: rgba(15,20,30,0.04);
        border-color: rgba(15,20,30,0.12);
        color: #5A6470;
      }
      :root.light-mode .alt-tesoura:hover {
        background: rgba(154,31,12,0.10);
        border-color: rgba(154,31,12,0.45);
        color: #8B1A08;
      }
      :root.light-mode .alt-eliminada .alt-tesoura {
        background: rgba(154,31,12,0.18);
        border-color: rgba(154,31,12,0.55);
        color: #8B1A08;
      }
    `;
    const style = document.createElement('style');
    style.id = 'pbm-ferramentas-css';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ───── Toolbar lateral fixa ────────────────────────────────────────────
  function injectToolbar() {
    if (document.querySelector('.pbm-fe-toolbar')) return;
    const tb = document.createElement('div');
    tb.className = 'pbm-fe-toolbar';
    tb.innerHTML = `
      <button class="pbm-fe-btn" type="button" data-mode="${MODES.MARCA}"    data-tooltip="Marca-texto (arraste)">${ICONS.marca}</button>
      <button class="pbm-fe-btn" type="button" data-mode="${MODES.LAPIS}"    data-tooltip="Caneta (desenho livre)">${ICONS.lapis}</button>
      <button class="pbm-fe-btn" type="button" data-mode="${MODES.BORRACHA}" data-tooltip="Borracha (toque para apagar)">${ICONS.borracha}</button>
      <div class="pbm-fe-divider"></div>
      <button class="pbm-fe-btn" type="button" data-action="undo" data-tooltip="Desfazer (Ctrl+Z)">${ICONS.undo}</button>
    `;
    document.body.appendChild(tb);

    tb.querySelectorAll('.pbm-fe-btn[data-mode]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        setMode(btn.dataset.mode);
      });
    });
    const undoBtn = tb.querySelector('.pbm-fe-btn[data-action="undo"]');
    if (undoBtn) {
      undoBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        undo();
      });
    }
  }

  function setMode(mode) {
    state.mode = (state.mode === mode) ? MODES.NONE : mode;
    document.querySelectorAll('.pbm-fe-btn').forEach(b => {
      b.classList.toggle('is-active', b.dataset.mode === state.mode);
    });
    // Body class para cursores e indicação visual
    Object.values(MODES).forEach(m => { if (m) document.body.classList.remove('pbm-tool-' + m); });
    if (state.mode) document.body.classList.add('pbm-tool-' + state.mode);
    // Garante canvas se modo precisar dele e recalcula dimensões
    // (zoom do ajustador de fonte pode ter mudado desde o último resize).
    if (state.mode === MODES.LAPIS || state.mode === MODES.BORRACHA) {
      ensureCanvas();
      resizeCanvas(false);
    }
    updateCanvasMode();
  }

  // ───── Canvas overlay ──────────────────────────────────────────────────
  function ensureCanvas() {
    if (!state.config) return null;
    const container = document.querySelector(state.config.containerSelector);
    if (!container) return null;
    if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
    if (state.canvas && state.canvas.parentElement === container) return state.canvas;
    const c = document.createElement('canvas');
    c.className = 'pbm-canvas';
    container.appendChild(c);
    state.canvas = c;
    state.ctx = c.getContext('2d');
    resizeCanvas(true);
    bindCanvasEvents(c);
    // Observa mudanças de tamanho do container (ex.: 0x0 → visível)
    if (window.ResizeObserver && !state.resizeObs) {
      state.resizeObs = new ResizeObserver(() => {
        cancelAnimationFrame(state.resizeRaf);
        state.resizeRaf = requestAnimationFrame(() => resizeCanvas(false));
      });
      state.resizeObs.observe(container);
    }
    return c;
  }

  function resizeCanvas(skipRestore) {
    if (!state.canvas) return;
    // Inline width/height interagem mal com `zoom` (legacy CSS) aplicado no <html>:
    // o valor px é reinterpretado no espaço pré-zoom, deixando o canvas maior
    // que o pai. Sem inline, o CSS (.pbm-canvas: inset:0; 100%/100%) garante
    // que o canvas tem o MESMO tamanho visual do pai.
    state.canvas.style.width = '';
    state.canvas.style.height = '';
    // getBoundingClientRect retorna no mesmo sistema de coords que clientX/Y,
    // então buffer e pos() ficam consistentes mesmo com zoom em ancestral.
    const rect = state.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const bw = Math.max(1, Math.floor(rect.width  * dpr));
    const bh = Math.max(1, Math.floor(rect.height * dpr));
    const sizeChanged = (state.canvas.width !== bw || state.canvas.height !== bh);
    if (sizeChanged) {
      // Reatribuir width/height limpa o buffer; só faz isso quando precisa.
      state.canvas.width = bw;
      state.canvas.height = bh;
    }
    state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (sizeChanged && !skipRestore) redrawAllStrokes();
  }

  function updateCanvasMode() {
    if (!state.canvas) return;
    // Canvas captura eventos apenas no modo LÁPIS. Borracha é tratada via document.
    state.canvas.classList.toggle('is-active', state.mode === MODES.LAPIS);
    state.canvas.classList.toggle('eraser-active', false);
  }

  function bindCanvasEvents(c) {
    c.addEventListener('pointerdown', e => {
      if (state.mode !== MODES.LAPIS) return;
      // Zoom da fonte pode ter mudado desde o último resize; idempotente.
      resizeCanvas(false);
      pushHistory();
      state.drawing = true;
      const p = pos(e, c);
      state.currentStroke = { points: [{ x: p.x, y: p.y }], color: LAPIS_STYLE.color, width: LAPIS_STYLE.width };
      try { c.setPointerCapture(e.pointerId); } catch (_) {}
    });
    c.addEventListener('pointermove', e => {
      if (!state.drawing || !state.currentStroke) return;
      const p = pos(e, c);
      const pts = state.currentStroke.points;
      const prev = pts[pts.length - 1];
      pts.push({ x: p.x, y: p.y });
      drawSegment(prev.x, prev.y, p.x, p.y, state.currentStroke);
    });
    const finish = e => {
      if (!state.drawing) return;
      state.drawing = false;
      try { c.releasePointerCapture(e.pointerId); } catch (_) {}
      if (state.currentStroke && state.currentStroke.points.length > 0) {
        state.strokes.push(state.currentStroke);
      }
      state.currentStroke = null;
      saveEstado();
    };
    c.addEventListener('pointerup', finish);
    c.addEventListener('pointercancel', finish);
  }

  // Coords do canvas no MESMO sistema que clientX/Y e getBoundingClientRect
  // (viewport CSS px). Evita offsetX/clientWidth porque, com `zoom` em
  // ancestral, o Chrome relata esses dois em sistemas diferentes.
  function pos(e, c) {
    const rect = c.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function drawSegment(x1, y1, x2, y2, stroke) {
    const ctx = state.ctx;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function redrawAllStrokes() {
    if (!state.canvas || !state.ctx) return;
    clearCanvas();
    state.strokes.forEach(s => {
      if (!s.points || s.points.length === 0) return;
      const ctx = state.ctx;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y);
      if (s.points.length === 1) ctx.lineTo(s.points[0].x + 0.1, s.points[0].y + 0.1);
      ctx.stroke();
    });
  }

  function clearCanvas() {
    if (!state.canvas || !state.ctx) return;
    state.ctx.save();
    state.ctx.setTransform(1, 0, 0, 1, 0, 0);
    state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
    state.ctx.restore();
    const dpr = window.devicePixelRatio || 1;
    state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function findStrokeIndexAt(cx, cy) {
    // Procura traço mais recente cuja distância ao ponto seja menor que tolerância
    for (let i = state.strokes.length - 1; i >= 0; i--) {
      const s = state.strokes[i];
      const tol = (s.width || 2) + 8;
      for (let j = 0; j < s.points.length; j++) {
        const p = s.points[j];
        const dx = p.x - cx, dy = p.y - cy;
        if (dx * dx + dy * dy <= tol * tol) return i;
        // Também checa segmentos entre pontos
        if (j + 1 < s.points.length) {
          const p2 = s.points[j + 1];
          if (pointToSegmentDist(cx, cy, p.x, p.y, p2.x, p2.y) <= tol) return i;
        }
      }
    }
    return -1;
  }

  function pointToSegmentDist(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) {
      const ex = px - x1, ey = py - y1;
      return Math.sqrt(ex * ex + ey * ey);
    }
    let t = ((px - x1) * dx + (py - y1) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const ix = x1 + t * dx, iy = y1 + t * dy;
    const ex = px - ix, ey = py - iy;
    return Math.sqrt(ex * ex + ey * ey);
  }

  // ───── Marca/Lápis reta (seleção de texto) ─────────────────────────────
  function isInTargetZone(node) {
    if (!state.config) return false;
    const enun = document.querySelector(state.config.enunciadoSelector);
    const alts = document.querySelector(state.config.altsContainerSelector);
    const el = node && node.nodeType === 1 ? node : (node && node.parentElement);
    if (!el) return false;
    if (enun && enun.contains(el)) return true;
    if (alts && alts.contains(el)) return true;
    return false;
  }

  // Encontra todos os nós de texto dentro de um range
  function textNodesInRange(range) {
    const root = range.commonAncestorContainer;
    const result = [];
    const startNode = range.startContainer;
    const endNode = range.endContainer;
    if (startNode === endNode && startNode.nodeType === 3) return [startNode];

    const walker = document.createTreeWalker(
      root.nodeType === 1 ? root : root.parentNode,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(n) {
          if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          if (!range.intersectsNode(n)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    let n;
    while ((n = walker.nextNode())) result.push(n);
    return result;
  }

  // Aplica highlight em CADA text node interceptado pelo range, individualmente.
  // Isso evita extrair conteúdos entre elementos (que quebrava as alternativas).
  function aplicarHighlightAoRange(range) {
    if (!range || range.collapsed) return false;
    if (!isInTargetZone(range.startContainer) && !isInTargetZone(range.endContainer)) return false;

    const nodes = textNodesInRange(range);
    let appliedAny = false;
    nodes.forEach(node => {
      if (!isInTargetZone(node)) return;
      const start = node === range.startContainer ? range.startOffset : 0;
      const end   = node === range.endContainer   ? range.endOffset   : node.nodeValue.length;
      if (end <= start) return;
      const text = node.nodeValue.substring(start, end);
      if (!text.trim()) return;

      // Divide o nó: [antes][selecionado][depois]
      const middle = (start === 0) ? node : node.splitText(start);
      if (end - start < middle.nodeValue.length) middle.splitText(end - start);

      const span = document.createElement('span');
      span.className = 'pbm-hl-marca';
      middle.parentNode.insertBefore(span, middle);
      span.appendChild(middle);
      appliedAny = true;
    });
    return appliedAny;
  }

  function handleSelectionEnd(e) {
    if (state.mode !== MODES.MARCA) return;
    if (e && e.target && e.target.closest('.pbm-fe-toolbar, .alt-tesoura')) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed || !sel.toString().trim()) return;

    pushHistory();
    const applied = aplicarHighlightAoRange(sel.getRangeAt(0));
    sel.removeAllRanges();

    if (!applied) {
      state.history.pop(); // não houve mudança — descarta histórico
      return;
    }
    state.justWrapped = true;
    setTimeout(() => { state.justWrapped = false; }, 0);
    saveEstado();
  }

  // Bloqueia o click acidental na alternativa logo após uma marcação
  function handleAltClickBlock(e) {
    if (!state.justWrapped) return;
    if (e.target.closest('.alt-tesoura, .pbm-fe-toolbar')) return;
    const alt = e.target.closest('.alt');
    if (!alt) return;
    e.stopPropagation();
    e.preventDefault();
    state.justWrapped = false;
  }

  // ───── Borracha (toque/arrasta — apaga traço inteiro ou span inteiro) ──
  function eraseAt(clientX, clientY) {
    let changed = false;
    // 1) Span de marca-texto sob o cursor → remove inteiro
    const el = document.elementFromPoint(clientX, clientY);
    if (el) {
      const sp = el.closest('.pbm-hl-marca');
      if (sp && sp.closest('[data-pbm-zone]')) {
        const parent = sp.parentNode;
        while (sp.firstChild) parent.insertBefore(sp.firstChild, sp);
        parent.removeChild(sp);
        parent.normalize();
        changed = true;
      }
    }
    // 2) Traço do lápis sob o cursor → remove o traço inteiro
    if (state.canvas) {
      const rect = state.canvas.getBoundingClientRect();
      const cx = clientX - rect.left;
      const cy = clientY - rect.top;
      if (cx >= 0 && cy >= 0 && cx <= rect.width && cy <= rect.height) {
        let idx = findStrokeIndexAt(cx, cy);
        // Pode haver vários sobrepostos — apaga todos sob o ponto
        while (idx >= 0) {
          state.strokes.splice(idx, 1);
          changed = true;
          idx = findStrokeIndexAt(cx, cy);
        }
        if (changed) redrawAllStrokes();
      }
    }
    return changed;
  }

  function handleBorrachaDown(e) {
    if (state.mode !== MODES.BORRACHA) return;
    if (e.target.closest('.pbm-fe-toolbar, .alt-tesoura')) return;
    e.preventDefault();
    pushHistory();
    state.erasing = true;
    state._eraseChanged = eraseAt(e.clientX, e.clientY);
  }
  function handleBorrachaMove(e) {
    if (!state.erasing) return;
    if (eraseAt(e.clientX, e.clientY)) state._eraseChanged = true;
  }
  function handleBorrachaUp() {
    if (!state.erasing) return;
    state.erasing = false;
    if (state._eraseChanged) saveEstado();
    else state.history.pop(); // nada foi apagado — descarta histórico
    state._eraseChanged = false;
  }

  // ───── Tesoura ─────────────────────────────────────────────────────────
  function injetarTesouras() {
    if (!state.config) return;
    const altsBox = document.querySelector(state.config.altsContainerSelector);
    if (!altsBox) return;
    altsBox.querySelectorAll('.alt').forEach((alt, idx) => {
      // Identifica a letra de forma estável
      const letra = (alt.dataset.originalLetra
        || (alt.querySelector('.alt-letra')?.textContent || '').trim()
        || String.fromCharCode(65 + idx)).toUpperCase();
      alt.dataset.pbmLetra = letra;
      if (alt.querySelector('.alt-tesoura')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'alt-tesoura';
      btn.title = 'Eliminar alternativa';
      btn.innerHTML = ICONS.tesoura;
      btn.addEventListener('click', e => {
        e.stopPropagation();
        e.preventDefault();
        pushHistory();
        alt.classList.toggle('alt-eliminada');
        saveEstado();
      });
      alt.appendChild(btn);
    });
  }

  // ───── Undo / histórico ────────────────────────────────────────────────
  function snapshotEstado() {
    const cfg = state.config;
    const snap = { enunciadoHTML: '', altsHTML: {}, eliminadas: [], strokes: [] };
    if (!cfg) return snap;
    const enun = document.querySelector(cfg.enunciadoSelector);
    if (enun) snap.enunciadoHTML = enun.innerHTML;
    const altsBox = document.querySelector(cfg.altsContainerSelector);
    if (altsBox) {
      altsBox.querySelectorAll('.alt').forEach(alt => {
        const letra = alt.dataset.pbmLetra;
        if (!letra) return;
        const textoEl = alt.querySelector(cfg.altTextoSelector);
        if (textoEl) snap.altsHTML[letra] = textoEl.innerHTML;
        if (alt.classList.contains('alt-eliminada')) snap.eliminadas.push(letra);
      });
    }
    snap.strokes = state.strokes.map(s => ({ color: s.color, width: s.width, points: s.points.slice() }));
    return snap;
  }

  function pushHistory() {
    state.history.push(snapshotEstado());
    if (state.history.length > HISTORY_MAX) state.history.shift();
    refreshUndoBtn();
  }

  function refreshUndoBtn() {
    const btn = document.querySelector('.pbm-fe-btn[data-action="undo"]');
    if (!btn) return;
    if (state.history.length === 0) btn.setAttribute('disabled', '');
    else btn.removeAttribute('disabled');
  }

  function aplicarSnapshot(snap) {
    state.restoring = true;
    try {
      const cfg = state.config;
      const enun = document.querySelector(cfg.enunciadoSelector);
      if (enun) enun.innerHTML = snap.enunciadoHTML || '';
      const altsBox = document.querySelector(cfg.altsContainerSelector);
      if (altsBox) {
        altsBox.querySelectorAll('.alt').forEach(alt => {
          const letra = alt.dataset.pbmLetra;
          if (!letra) return;
          const textoEl = alt.querySelector(cfg.altTextoSelector);
          if (textoEl && snap.altsHTML && snap.altsHTML[letra] != null) textoEl.innerHTML = snap.altsHTML[letra];
          alt.classList.toggle('alt-eliminada', (snap.eliminadas || []).includes(letra));
        });
      }
      state.strokes = (snap.strokes || []).map(s => ({ color: s.color, width: s.width, points: s.points.slice() }));
      redrawAllStrokes();
    } finally {
      state.restoring = false;
    }
  }

  function undo() {
    if (state.history.length === 0) return;
    const snap = state.history.pop();
    aplicarSnapshot(snap);
    saveEstado();
    refreshUndoBtn();
  }

  // ───── Persistência ────────────────────────────────────────────────────
  function key(qId) { return STORAGE_PREFIX + qId; }

  function saveEstado() {
    if (!state.activeQuestaoId || state.restoring) return;
    const snap = snapshotEstado();
    try { sessionStorage.setItem(key(state.activeQuestaoId), JSON.stringify(snap)); } catch (_) {}
  }

  function restaurarEstado(qId) {
    state.restoring = true;
    try {
      ensureCanvas();
      // Reseta estado in-memory
      state.strokes = [];
      state.history = [];
      clearCanvas();

      let data = null;
      try { data = JSON.parse(sessionStorage.getItem(key(qId)) || 'null'); } catch (_) {}
      if (!data) { refreshUndoBtn(); return; }

      const cfg = state.config;
      const enun = document.querySelector(cfg.enunciadoSelector);
      if (enun && data.enunciadoHTML && data.enunciadoHTML.includes('pbm-hl-')) {
        enun.innerHTML = data.enunciadoHTML;
      }

      const altsBox = document.querySelector(cfg.altsContainerSelector);
      if (altsBox && data.altsHTML) {
        altsBox.querySelectorAll('.alt').forEach(alt => {
          const letra = alt.dataset.pbmLetra;
          if (!letra) return;
          const textoEl = alt.querySelector(cfg.altTextoSelector);
          const html = data.altsHTML[letra];
          if (textoEl && html && html.includes('pbm-hl-')) textoEl.innerHTML = html;
          alt.classList.toggle('alt-eliminada', (data.eliminadas || []).includes(letra));
        });
      }

      if (Array.isArray(data.strokes)) {
        state.strokes = data.strokes.map(s => ({ color: s.color, width: s.width, points: s.points.slice() }));
        redrawAllStrokes();
      }
      refreshUndoBtn();
    } finally {
      state.restoring = false;
    }
  }

  // ───── Limpeza (escopo de sessão de estudo) ────────────────────────────
  // Marcações/rabiscos são temporários: cada nova entrada na tela (init) começa do zero.
  function clearAllSavedState() {
    try {
      const toRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.indexOf(STORAGE_PREFIX) === 0) toRemove.push(k);
      }
      toRemove.forEach(k => sessionStorage.removeItem(k));
    } catch (_) {}
    state.strokes = [];
    state.history = [];
    state.currentStroke = null;
    clearCanvas();
    refreshUndoBtn();
  }

  // ───── API pública ─────────────────────────────────────────────────────
  function markZones() {
    if (!state.config) return;
    const enun = document.querySelector(state.config.enunciadoSelector);
    const alts = document.querySelector(state.config.altsContainerSelector);
    if (enun && !enun.hasAttribute('data-pbm-zone')) enun.setAttribute('data-pbm-zone', 'enunciado');
    if (alts && !alts.hasAttribute('data-pbm-zone')) alts.setAttribute('data-pbm-zone', 'alts');
  }

  function init(config) {
    if (state.config) return; // idempotente
    state.config = Object.assign({
      containerSelector:     '.questao-container',
      enunciadoSelector:     '#q-enunciado',
      altsContainerSelector: '#alts-lista',
      altTextoSelector:      '.alt-texto',
    }, config || {});

    injectStyles();
    injectToolbar();
    markZones();
    // Cada montagem da tela = nova sessão de estudo. Apaga rabiscos/marcações da sessão anterior.
    clearAllSavedState();

    document.addEventListener('mouseup',     handleSelectionEnd);
    document.addEventListener('touchend',    handleSelectionEnd);
    document.addEventListener('click',       handleAltClickBlock, true);

    document.addEventListener('pointerdown', handleBorrachaDown);
    document.addEventListener('pointermove', handleBorrachaMove);
    document.addEventListener('pointerup',   handleBorrachaUp);
    document.addEventListener('pointercancel', handleBorrachaUp);

    window.addEventListener('resize', () => {
      cancelAnimationFrame(state.resizeRaf);
      state.resizeRaf = requestAnimationFrame(() => resizeCanvas(false));
    });

    // Atalho Ctrl+Z / Cmd+Z para desfazer
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        const tag = (e.target && e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        e.preventDefault();
        undo();
      }
    });

    refreshUndoBtn();
  }

  function onQuestaoChange(questaoId) {
    if (!state.config) return;
    const newId = questaoId == null ? null : String(questaoId);
    if (state.activeQuestaoId && state.activeQuestaoId !== newId) {
      saveEstado();
    }
    state.activeQuestaoId = newId;
    markZones();
    injetarTesouras();
    if (newId) restaurarEstado(newId);
    updateCanvasMode();
  }

  window.PBMFerramentas = { init, onQuestaoChange, clearAll: clearAllSavedState, _state: state };
})();
