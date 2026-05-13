/* PBM — Tamanho de fonte ajustável pelo usuário
 * Aplica zoom no <html> e injeta controle flutuante (bottom-left).
 * Persiste em localStorage. Inclua este script no <head> (sync, sem defer)
 * para evitar flash de re-render.
 */
(function () {
  if (window.__PBM_FONT_SIZE__) return;
  window.__PBM_FONT_SIZE__ = true;

  var KEY = 'pbm_font_scale';
  var SCALES = {
    pequena: 0.92,
    normal:  1.00,
    grande:  1.12,
    extra:   1.25
  };
  var LABELS = {
    pequena: 'A− Pequena',
    normal:  'A Normal',
    grande:  'A+ Grande',
    extra:   'A++ Extra'
  };

  function getScale() {
    try {
      var s = localStorage.getItem(KEY);
      return SCALES[s] ? s : 'normal';
    } catch (_) { return 'normal'; }
  }

  function applyScale(scale) {
    var value = SCALES[scale] || 1;
    // Usa zoom no <html> — escala layout inteiro de forma consistente.
    document.documentElement.style.zoom = value;
    try { localStorage.setItem(KEY, scale); } catch (_) {}
  }

  // Aplica imediatamente (antes do paint, se o script estiver no <head>).
  applyScale(getScale());

  function injectStyles() {
    if (document.getElementById('pbm-fs-css')) return;
    var css =
      '#pbm-fs-control { position: fixed; bottom: 18px; left: 18px; z-index: 9997; font-family: "Inter", system-ui, sans-serif; }' +
      '.pbm-fs-toggle { display: inline-flex; align-items: center; gap: 6px; background: rgba(20,20,20,0.94); border: 1px solid rgba(255,255,255,0.12); color: #c9c9c9; border-radius: 20px; padding: 6px 12px 6px 10px; font-size: 12px; cursor: pointer; transition: all 0.15s; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); box-shadow: 0 4px 16px rgba(0,0,0,0.4); }' +
      '.pbm-fs-toggle:hover { color: #fff; border-color: rgba(255,255,255,0.28); }' +
      '.pbm-fs-toggle .pbm-fs-a-small { font-weight: 600; font-size: 11px; opacity: 0.7; }' +
      '.pbm-fs-toggle .pbm-fs-a-big { font-weight: 700; font-size: 15px; }' +
      '.pbm-fs-menu { position: absolute; bottom: calc(100% + 8px); left: 0; background: rgba(20,20,20,0.97); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 6px; min-width: 170px; box-shadow: 0 8px 24px rgba(0,0,0,0.55); display: flex; flex-direction: column; gap: 2px; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }' +
      '.pbm-fs-menu[hidden] { display: none; }' +
      '.pbm-fs-label { font-family: "IBM Plex Mono", monospace; font-size: 9px; color: #777; padding: 6px 10px 4px; letter-spacing: 0.1em; text-transform: uppercase; }' +
      '.pbm-fs-menu button[data-scale] { background: transparent; border: none; color: #d4d4d4; padding: 8px 12px; border-radius: 6px; font-size: 13px; cursor: pointer; text-align: left; font-family: "Inter", system-ui, sans-serif; transition: background 0.12s, color 0.12s; }' +
      '.pbm-fs-menu button[data-scale]:hover { background: rgba(255,255,255,0.06); color: #fff; }' +
      '.pbm-fs-menu button[data-scale].ativo { background: rgba(192,39,15,0.2); color: #fff; }' +
      '@media (max-width: 768px) { #pbm-fs-control { bottom: 70px; } }';
    var style = document.createElement('style');
    style.id = 'pbm-fs-css';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function injectControl() {
    if (document.getElementById('pbm-fs-control')) return;
    var current = getScale();

    var wrap = document.createElement('div');
    wrap.id = 'pbm-fs-control';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pbm-fs-toggle';
    btn.title = 'Tamanho da fonte';
    btn.setAttribute('aria-label', 'Ajustar tamanho da fonte');
    btn.innerHTML = '<span class="pbm-fs-a-small">A</span><span class="pbm-fs-a-big">A</span>';

    var menu = document.createElement('div');
    menu.className = 'pbm-fs-menu';
    menu.hidden = true;

    var label = document.createElement('div');
    label.className = 'pbm-fs-label';
    label.textContent = 'Tamanho da fonte';
    menu.appendChild(label);

    Object.keys(SCALES).forEach(function (scale) {
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.scale = scale;
      b.textContent = LABELS[scale];
      if (scale === current) b.classList.add('ativo');
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        applyScale(scale);
        menu.querySelectorAll('button[data-scale]').forEach(function (x) {
          x.classList.toggle('ativo', x.dataset.scale === scale);
        });
        menu.hidden = true;
      });
      menu.appendChild(b);
    });

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.hidden = !menu.hidden;
    });

    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) menu.hidden = true;
    });

    wrap.appendChild(btn);
    wrap.appendChild(menu);
    document.body.appendChild(wrap);
  }

  function boot() {
    injectStyles();
    injectControl();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // API pública (opcional)
  window.PBMFontSize = {
    set: applyScale,
    get: getScale,
    scales: SCALES
  };
})();
