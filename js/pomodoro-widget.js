// js/pomodoro-widget.js
// Pomodoro unificado: engine compartilhado + widget flutuante para uso em
// /questoes (modo simples) e /ciclo (modo classico com fases). Estado em
// sessionStorage para sobreviver à navegação entre páginas.
(function () {
  'use strict';

  // ────────────────────────────────────────────────────────────────
  // CONSTANTES
  // ────────────────────────────────────────────────────────────────
  var STORAGE_KEY = 'pomo_v2_state';
  var POSITION_KEY = 'pomo_v2_position';
  var CFG_KEY = 'pbm_pomo_cfg';

  var AUDIO_FONTES = {
    lofi: 'https://www.youtube-nocookie.com/embed/jfKfPfyJRdk?autoplay=1&modestbranding=1&rel=0',
    ruido: 'https://www.youtube-nocookie.com/embed/nMfPqeZjc2c?autoplay=1&modestbranding=1&rel=0',
    jazz: 'https://www.youtube-nocookie.com/embed/Dx5qFachd3A?autoplay=1&modestbranding=1&rel=0',
  };

  function estadoDefault() {
    return {
      modo: 'simples',              // 'simples' | 'classico'
      rodando: false,
      // SIMPLES (countdown ou livre)
      simplesPreset: '25min',       // '25min' | '45min' | '60min' | 'Livre' | 'custom'
      simplesCustomMin: 0,
      simplesMin: 25,
      simplesSeg: 0,
      simplesFimMs: 0,              // countdown
      simplesInicioMs: 0,           // livre (stopwatch)
      simplesLivre: false,
      sessoesHoje: 0,
      sessoesData: '',
      // CLASSICO (com fases)
      cfg: { focoMin: 25, pausaCurtaMin: 5, pausaLongaMin: 15, ciclosAteLonga: 4 },
      fase: 'estudando',            // 'estudando' | 'pausa-curta' | 'pausa-longa'
      faseInicioMs: 0,
      faseFimMs: 0,
      cicloIdx: 0,
      estudoMsAcumulado: 0,
      bloco: null,                  // contexto do ciclo (id, area, legislacao_*)
      // ÁUDIO
      audioEscolha: 'off',          // 'off' | 'lofi' | 'ruido' | 'jazz'
      soAudio: false,
      // UI
      uiFechado: false,
      uiMinimizado: false,
    };
  }

  // ────────────────────────────────────────────────────────────────
  // ESTADO INTERNO
  // ────────────────────────────────────────────────────────────────
  var state = estadoDefault();
  var tickInterval = null;
  var listeners = { tick: [], transicao: [], termino: [], audio: [], change: [] };
  var audioContainer = null;
  var floatingEl = null;
  var reabrirEl = null;
  var floatingMountOpts = {};
  var hookedVisibility = false;
  var hookedResize = false;
  var migrationDone = false;

  // ────────────────────────────────────────────────────────────────
  // UTILS
  // ────────────────────────────────────────────────────────────────
  function emit(evento) {
    var args = Array.prototype.slice.call(arguments, 1);
    (listeners[evento] || []).forEach(function (cb) {
      try { cb.apply(null, args); } catch (_) {}
    });
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function fmtTempo(min, seg) { return pad(Math.max(0, min)) + ':' + pad(Math.max(0, seg)); }
  function hojeStr() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function parsePresetMin(preset, custom) {
    if (preset === '25min') return 25;
    if (preset === '45min') return 45;
    if (preset === '60min') return 60;
    if (preset === 'Livre') return 0;
    if (preset === 'custom') return Math.max(1, parseInt(custom) || 25);
    var m = parseInt(preset);
    return isFinite(m) && m > 0 ? m : 25;
  }

  // ────────────────────────────────────────────────────────────────
  // PERSISTÊNCIA
  // ────────────────────────────────────────────────────────────────
  function carregar() {
    if (!migrationDone) { migrarLegacy(); migrationDone = true; }
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        state = Object.assign(estadoDefault(), saved);
        state.cfg = Object.assign(estadoDefault().cfg, saved.cfg || {});
      }
      var cfgRaw = localStorage.getItem(CFG_KEY);
      if (cfgRaw) {
        state.cfg = Object.assign(state.cfg, JSON.parse(cfgRaw));
      }
      var hoje = hojeStr();
      if (state.sessoesData !== hoje) {
        state.sessoesHoje = 0;
        state.sessoesData = hoje;
      }
    } catch (_) {
      state = estadoDefault();
      state.sessoesData = hojeStr();
    }
  }
  function salvar() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      localStorage.setItem(CFG_KEY, JSON.stringify(state.cfg));
    } catch (_) {}
  }
  function migrarLegacy() {
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
      var oldMin = sessionStorage.getItem('pom_minutos');
      if (oldMin === null) return;
      var min = parseInt(oldMin) || 25;
      var seg = parseInt(sessionStorage.getItem('pom_segundos')) || 0;
      var livre = sessionStorage.getItem('pom_livre') === '1';
      var preset = sessionStorage.getItem('pom_preset') || '25min';
      var rodando = sessionStorage.getItem('pom_rodando') === '1';
      var sessoes = parseInt(sessionStorage.getItem('pom_sessoes')) || 0;
      var ts = parseInt(sessionStorage.getItem('pom_ts'));
      var custom = parseInt(sessionStorage.getItem('pom_custom')) || 0;
      var novo = estadoDefault();
      novo.modo = 'simples';
      novo.simplesPreset = preset;
      novo.simplesCustomMin = custom;
      novo.simplesLivre = livre;
      novo.simplesMin = min; novo.simplesSeg = seg;
      novo.sessoesHoje = sessoes;
      novo.sessoesData = hojeStr();
      if (rodando && ts) {
        var elapsedMs = Date.now() - ts;
        if (livre) {
          novo.rodando = true;
          novo.simplesInicioMs = Date.now() - ((min * 60 + seg) * 1000 + elapsedMs);
        } else {
          var restanteMs = (min * 60 + seg) * 1000 - elapsedMs;
          if (restanteMs > 0) {
            novo.rodando = true;
            novo.simplesFimMs = Date.now() + restanteMs;
          } else {
            novo.simplesMin = 0; novo.simplesSeg = 0;
          }
        }
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(novo));
      ['pom_minutos', 'pom_segundos', 'pom_rodando', 'pom_livre', 'pom_sessoes',
        'pom_ts', 'pom_preset', 'pom_custom', 'pom_minimizado', 'pom_fechado',
        'pom_pos_left', 'pom_pos_top', 'pom_pos_right', 'pom_pos_bottom']
        .forEach(function (k) { sessionStorage.removeItem(k); });
    } catch (_) {}
  }

  function readPosition() {
    try { return JSON.parse(sessionStorage.getItem(POSITION_KEY) || '{}'); } catch (_) { return {}; }
  }
  function writePosition(pos) {
    try { sessionStorage.setItem(POSITION_KEY, JSON.stringify(pos || {})); } catch (_) {}
  }
  // Garante que o widget caiba no viewport atual após mount, expand, resize ou troca de monitor.
  // Usa getBoundingClientRect para funcionar tanto com ancoragem left/top quanto right/bottom —
  // necessário para o caso "expandir minimizado em tela curta" empurrar o topo do widget pra fora.
  function clampPositionToViewport(el) {
    if (!el || !el.offsetWidth) return;
    var rect = el.getBoundingClientRect();
    var overflowLeft = rect.left < 0;
    var overflowTop = rect.top < 0;
    var overflowRight = rect.right > window.innerWidth;
    var overflowBottom = rect.bottom > window.innerHeight;
    if (!overflowLeft && !overflowTop && !overflowRight && !overflowBottom) return;
    var maxLeft = Math.max(0, window.innerWidth - el.offsetWidth);
    var maxTop = Math.max(0, window.innerHeight - el.offsetHeight);
    var newLeft = Math.max(0, Math.min(maxLeft, rect.left));
    var newTop = Math.max(0, Math.min(maxTop, rect.top));
    el.style.left = newLeft + 'px';
    el.style.top = newTop + 'px';
    el.style.right = 'auto';
    el.style.bottom = 'auto';
    writePosition({
      left: newLeft + 'px',
      top: newTop + 'px',
      right: '',
      bottom: '',
    });
  }

  // ────────────────────────────────────────────────────────────────
  // TICK / TIMING
  // ────────────────────────────────────────────────────────────────
  function iniciarInterval() {
    pararInterval();
    tickInterval = setInterval(tick, 500);
    tick();
  }
  function pararInterval() {
    if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
  }
  function tick() {
    var now = Date.now();
    if (state.modo === 'classico') {
      var sec = Math.max(0, Math.ceil((state.faseFimMs - now) / 1000));
      emit('tick', { modo: 'classico', fase: state.fase, secRestantes: sec, rodando: state.rodando });
      if (state.rodando && now >= state.faseFimMs) transicionarFase();
    } else {
      if (state.simplesLivre) {
        var elapsed = Math.max(0, now - state.simplesInicioMs);
        state.simplesMin = Math.floor(elapsed / 60000);
        state.simplesSeg = Math.floor((elapsed % 60000) / 1000);
      } else if (state.rodando) {
        var rest = Math.max(0, state.simplesFimMs - now);
        state.simplesMin = Math.floor(rest / 60000);
        state.simplesSeg = Math.floor((rest % 60000) / 1000);
        if (rest === 0) terminarSimples();
      }
      emit('tick', {
        modo: 'simples',
        livre: state.simplesLivre,
        min: state.simplesMin,
        seg: state.simplesSeg,
        rodando: state.rodando,
      });
    }
  }
  function transicionarFase() {
    var now = Date.now();
    var prev = state.fase;
    if (state.fase === 'estudando') {
      state.estudoMsAcumulado += Math.max(0, now - state.faseInicioMs);
      state.cicloIdx += 1;
      var ehLonga = state.cicloIdx % state.cfg.ciclosAteLonga === 0;
      state.fase = ehLonga ? 'pausa-longa' : 'pausa-curta';
      var durMin = ehLonga ? state.cfg.pausaLongaMin : state.cfg.pausaCurtaMin;
      state.faseInicioMs = now;
      state.faseFimMs = now + durMin * 60000;
    } else {
      state.fase = 'estudando';
      state.faseInicioMs = now;
      state.faseFimMs = now + state.cfg.focoMin * 60000;
    }
    salvar();
    emit('transicao', { de: prev, para: state.fase });
    tick();
  }
  function terminarSimples() {
    state.rodando = false;
    pararInterval();
    if (!state.simplesLivre) {
      state.sessoesHoje += 1;
      state.sessoesData = hojeStr();
    }
    salvar();
    emit('termino', { modo: 'simples' });
    bipFim();
  }
  function bipFim() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = new Ctx();
      [[0, 880, 0.18], [0.25, 880, 0.18], [0.5, 1100, 0.35]].forEach(function (t) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = t[1];
        gain.gain.setValueAtTime(0.35, ctx.currentTime + t[0]);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t[0] + t[2]);
        osc.start(ctx.currentTime + t[0]);
        osc.stop(ctx.currentTime + t[0] + t[2]);
      });
    } catch (_) {}
  }

  // ────────────────────────────────────────────────────────────────
  // API: TIMER
  // ────────────────────────────────────────────────────────────────
  function iniciarClassico(cfg, bloco) {
    state.modo = 'classico';
    state.cfg = Object.assign(state.cfg, cfg || {});
    state.fase = 'estudando';
    state.cicloIdx = 0;
    state.estudoMsAcumulado = 0;
    state.faseInicioMs = Date.now();
    state.faseFimMs = state.faseInicioMs + state.cfg.focoMin * 60000;
    state.bloco = bloco || null;
    state.rodando = true;
    salvar();
    iniciarInterval();
    emit('change');
    return state;
  }
  function iniciarSimples() {
    state.modo = 'simples';
    state.rodando = true;
    if (state.simplesLivre) {
      var jaPassadoMs = (state.simplesMin * 60 + state.simplesSeg) * 1000;
      state.simplesInicioMs = Date.now() - jaPassadoMs;
    } else {
      if (state.simplesMin === 0 && state.simplesSeg === 0) {
        state.simplesMin = parsePresetMin(state.simplesPreset, state.simplesCustomMin);
        state.simplesSeg = 0;
      }
      var restMs = (state.simplesMin * 60 + state.simplesSeg) * 1000;
      state.simplesFimMs = Date.now() + restMs;
    }
    salvar();
    iniciarInterval();
    emit('change');
  }
  function pausar() {
    if (!state.rodando) return;
    state.rodando = false;
    if (state.modo === 'classico') {
      // Congela: salva quanto resta na fase atual para retomar depois
      var sec = Math.max(0, Math.ceil((state.faseFimMs - Date.now()) / 1000));
      state.faseFimMs = Date.now() + sec * 1000;
    }
    pararInterval();
    salvar();
    emit('change');
    tick();
  }
  function retomar() {
    if (state.rodando) return;
    state.rodando = true;
    if (state.modo === 'classico') {
      var sec = Math.max(0, Math.ceil((state.faseFimMs - Date.now()) / 1000));
      state.faseFimMs = Date.now() + sec * 1000;
      state.faseInicioMs = Date.now(); // reinício para o cálculo de estudoMs da fase atual
      iniciarInterval();
    } else {
      iniciarSimples();
    }
    salvar();
    emit('change');
  }
  function toggle() { state.rodando ? pausar() : retomar(); }
  function cancelar() {
    pararInterval();
    desligarAudio();
    state = estadoDefault();
    state.sessoesData = hojeStr();
    salvar();
    emit('change');
  }
  function reset() {
    if (state.rodando) pausar();
    if (state.modo === 'classico') {
      state.faseInicioMs = Date.now();
      state.faseFimMs = state.faseInicioMs + state.cfg.focoMin * 60000;
      state.fase = 'estudando';
      state.cicloIdx = 0;
      state.estudoMsAcumulado = 0;
    } else {
      state.simplesMin = state.simplesLivre ? 0 : parsePresetMin(state.simplesPreset, state.simplesCustomMin);
      state.simplesSeg = 0;
    }
    salvar();
    emit('change');
    tick();
  }
  function setSimplesPreset(preset, customMin) {
    if (state.modo === 'classico') return; // não aplica em modo classico
    if (state.rodando) pausar();
    state.simplesPreset = preset;
    if (typeof customMin === 'number') state.simplesCustomMin = customMin;
    state.simplesLivre = preset === 'Livre';
    state.simplesMin = state.simplesLivre ? 0 : parsePresetMin(preset, state.simplesCustomMin);
    state.simplesSeg = 0;
    salvar();
    emit('change');
    tick();
  }
  function setSimplesCustomMin(min) {
    min = parseInt(min);
    if (!min || min < 1) return;
    if (state.rodando) pausar();
    state.simplesPreset = 'custom';
    state.simplesCustomMin = min;
    state.simplesLivre = false;
    state.simplesMin = min;
    state.simplesSeg = 0;
    salvar();
    emit('change');
    tick();
  }

  // ────────────────────────────────────────────────────────────────
  // API: ÁUDIO
  // ────────────────────────────────────────────────────────────────
  function setAudio(escolha) {
    if (['off', 'lofi', 'ruido', 'jazz'].indexOf(escolha) < 0) return;
    state.audioEscolha = escolha;
    salvar();
    if (audioContainer) {
      if (escolha === 'off') { unmountIframeOnly(); }
      else { mountIframeOnly(escolha); }
    }
    emit('audio', { escolha: state.audioEscolha, soAudio: state.soAudio });
    emit('change');
  }
  function setSoAudio(bool) {
    state.soAudio = !!bool;
    salvar();
    if (audioContainer) audioContainer.classList.toggle('so-audio', state.soAudio);
    emit('audio', { escolha: state.audioEscolha, soAudio: state.soAudio });
    emit('change');
  }
  function mountIframeOnly(escolha) {
    if (!audioContainer) return;
    var url = AUDIO_FONTES[escolha];
    if (!url) return;
    audioContainer.innerHTML = '<iframe src="' + url + '" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
    audioContainer.classList.add('show');
    audioContainer.classList.toggle('so-audio', state.soAudio);
  }
  function unmountIframeOnly() {
    if (!audioContainer) return;
    audioContainer.innerHTML = '';
    audioContainer.classList.remove('show', 'so-audio');
  }
  function mountAudioIframe(container) {
    audioContainer = container;
    if (state.audioEscolha && state.audioEscolha !== 'off') mountIframeOnly(state.audioEscolha);
  }
  function unmountAudioIframe() {
    unmountIframeOnly();
    audioContainer = null;
  }
  function desligarAudio() {
    // Apaga som E reseta escolha
    state.audioEscolha = 'off';
    state.soAudio = false;
    salvar();
    unmountIframeOnly();
    emit('audio', { escolha: 'off', soAudio: false });
  }

  // ────────────────────────────────────────────────────────────────
  // WIDGET FLUTUANTE
  // ────────────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('pbm-pomo-styles')) return;
    var css = `
#pbm-pomo-float {
  position: fixed; bottom: 24px; right: 24px; z-index: 9999;
  background: #1A1A1A; border: 1px solid #2A2A2A; border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,.55); min-width: 260px; user-select: none;
  font-family: 'Inter', system-ui, sans-serif; color: #E5E5E5;
  transition: box-shadow .15s;
}
#pbm-pomo-float.dragging { box-shadow: 0 16px 48px rgba(0,0,0,.7); }
#pbm-pomo-float.minimizado { min-width: 0; width: auto; border-radius: 22px; background: transparent; border: none; box-shadow: 0 6px 20px rgba(0,0,0,.5); }
#pbm-pomo-float.minimizado #pbm-pomo-float-bar { border-bottom: none; border-radius: 22px; padding: 3px 4px; cursor: pointer; gap: 0; background: #1A1A1A; }
#pbm-pomo-float.minimizado #pbm-pomo-body { display: none; }
#pbm-pomo-float.minimizado #pbm-pomo-title-text { display: none; }
#pbm-pomo-float.minimizado .pbm-pomo-dot { display: none; }
#pbm-pomo-float.minimizado #pbm-pomo-apple { display: inline-block; }
#pbm-pomo-float.minimizado #pbm-pomo-actions { display: none; }

/* Tomate minimalista — modo minimizado e pílula de reabrir.
   Cor do corpo segue o estado (currentColor); folha verde é fixa. */
.pbm-pomo-apple { display: none; position: relative; width: 42px; height: 42px; color: #C0270F; line-height: 0; }
.pbm-pomo-apple.pausa-curta { color: #5C9BD9; }
.pbm-pomo-apple.pausa-longa { color: #B58AE0; }
.pbm-pomo-apple.pausado { color: #6A6A6A; }
.pbm-pomo-apple-svg { width: 100%; height: 100%; display: block; }
.pbm-pomo-apple-sm { width: 26px; height: 26px; }
.pbm-pomo-apple-sm .pbm-pomo-apple-time { display: none; }
.pbm-pomo-apple-time {
  position: absolute; left: 0; right: 0;
  top: 55%; transform: translateY(-50%); /* centro do corpo do tomate (viewBox cy=22 / 40) */
  text-align: center;
  font-family: 'IBM Plex Mono', monospace; font-weight: 700;
  font-size: 10px; color: #fff; letter-spacing: 0; line-height: 1;
  text-shadow: 0 1px 2px rgba(0,0,0,.55);
  pointer-events: none;
}

#pbm-pomo-float-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 10px 8px 14px; cursor: grab;
  border-bottom: 1px solid #2A2A2A; border-radius: 12px 12px 0 0;
}
#pbm-pomo-float-bar:active { cursor: grabbing; }
#pbm-pomo-title {
  font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .08em;
  color: #888; text-transform: uppercase;
  display: flex; align-items: center; gap: 7px; white-space: nowrap;
}
.pbm-pomo-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #2A2A2A; flex-shrink: 0; transition: background .25s;
}
.pbm-pomo-dot.rodando { background: #C0270F; }
.pbm-pomo-dot.pausa-curta { background: #5C9BD9; }
.pbm-pomo-dot.pausa-longa { background: #B58AE0; }
#pbm-pomo-actions { display: flex; gap: 2px; }
.pbm-pomo-win-btn {
  background: none; border: none; cursor: pointer;
  color: #888; padding: 3px 6px; border-radius: 5px;
  font-size: 14px; line-height: 1; transition: color .1s, background .1s;
}
.pbm-pomo-win-btn:hover { color: #fff; background: rgba(255,255,255,.07); }

#pbm-pomo-body { padding: 14px 16px 16px; }
#pbm-pomo-classico-tag {
  display: none; padding: 6px 10px; background: rgba(192,39,15,.08);
  border: 1px solid rgba(192,39,15,.25); border-radius: 6px; margin-bottom: 10px;
}
#pbm-pomo-classico-tag.show { display: block; }
.pbm-pomo-bloco-area {
  font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: .1em;
  color: #C0270F; text-transform: uppercase; font-weight: 600;
}
.pbm-pomo-bloco-leg { font-size: 12px; color: #ddd; margin-top: 2px; line-height: 1.3; }
#pbm-pomo-fase-label {
  display: none; font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; letter-spacing: .08em; color: #888; text-transform: uppercase;
  text-align: center; margin-bottom: 8px;
}
#pbm-pomo-fase-label.show { display: block; }

.pbm-pomo-wrap { display: flex; align-items: center; gap: 12px; }
.pbm-pomo-left { flex: 1; }
.pbm-pomo-right { display: flex; flex-direction: column; align-items: center; gap: 8px; }

.pbm-pomo-presets { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; }
.pbm-pomo-preset {
  background: transparent; border: 1px solid #2A2A2A; color: #888;
  border-radius: 5px; padding: 3px 8px; font-size: 11px; cursor: pointer;
  font-family: 'IBM Plex Mono', monospace; transition: all .12s;
}
.pbm-pomo-preset:hover { border-color: #555; color: #fff; }
.pbm-pomo-preset.ativo { border-color: #C0270F; color: #fff; }
.pbm-pomo-custom { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 11px; color: #888; }
.pbm-pomo-custom input[type="range"] {
  flex: 1; min-width: 80px; height: 4px; background: #2A2A2A; border-radius: 2px;
  appearance: none; -webkit-appearance: none; outline: none; cursor: pointer;
}
.pbm-pomo-custom input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none; width: 14px; height: 14px;
  background: #C0270F; border-radius: 50%; cursor: pointer;
  border: 2px solid #1A1A1A; transition: transform .1s;
}
.pbm-pomo-custom input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.15); }
.pbm-pomo-custom input[type="range"]::-moz-range-thumb {
  width: 14px; height: 14px; background: #C0270F; border-radius: 50%; cursor: pointer;
  border: 2px solid #1A1A1A;
}
.pbm-pomo-custom-val {
  font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #fff;
  min-width: 38px; text-align: right;
}
.pbm-pomo-sessoes { font-size: 11px; color: #888; font-family: 'IBM Plex Mono', monospace; }

.pbm-pomo-display {
  font-family: 'Bebas Neue', sans-serif; font-size: 40px; letter-spacing: .06em;
  color: #fff; line-height: 1; min-width: 95px; text-align: center;
}
.pbm-pomo-display.rodando { color: #C0270F; }
.pbm-pomo-display.pausa-curta { color: #5C9BD9; }
.pbm-pomo-display.pausa-longa { color: #B58AE0; }
.pbm-pomo-display.pausado { color: #888; }
.pbm-pomo-controls { display: flex; gap: 6px; }
.pbm-pomo-btn {
  background: #222; border: 1px solid #2A2A2A; color: #888; border-radius: 6px;
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .12s; flex-shrink: 0;
}
.pbm-pomo-btn:hover { border-color: #555; color: #fff; }
.pbm-pomo-btn svg { width: 12px; height: 12px; }

/* ÁUDIO */
.pbm-pomo-audio { margin-top: 14px; padding-top: 12px; border-top: 1px solid #2A2A2A; }
.pbm-pomo-audio-row { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
.pbm-pomo-audio-label { font-size: 12px; }
.pbm-pomo-audio-btn {
  background: transparent; border: 1px solid #2A2A2A; color: #888;
  border-radius: 5px; padding: 4px 9px; font-size: 11px; cursor: pointer;
  font-family: 'IBM Plex Mono', monospace; transition: all .12s;
}
.pbm-pomo-audio-btn:hover { border-color: #555; color: #fff; }
.pbm-pomo-audio-btn.ativo { background: rgba(192,39,15,.15); color: #fff; border-color: #C0270F; }
.pbm-pomo-so-audio {
  display: flex; align-items: center; gap: 6px; margin-top: 8px;
  font-size: 11px; color: #888; cursor: pointer; user-select: none;
}
.pbm-pomo-so-audio input { accent-color: #C0270F; }
.pbm-pomo-tp-btn-row {
  display: flex; gap: 6px; margin-top: 8px;
}
.pbm-pomo-tp-btn {
  flex: 1; background: transparent; border: 1px solid #2A2A2A; color: #888;
  border-radius: 5px; padding: 5px 10px; font-size: 11px; cursor: pointer;
  font-family: 'IBM Plex Mono', monospace; transition: all .12s;
  text-transform: uppercase; letter-spacing: .04em;
}
.pbm-pomo-tp-btn:hover { border-color: #555; color: #fff; }

#pbm-pomo-tela-preta {
  position: fixed; inset: 0; background: #000; z-index: 99999;
  display: none; align-items: center; justify-content: center;
  flex-direction: column; gap: 24px; cursor: pointer; user-select: none;
}
#pbm-pomo-tela-preta.ativa { display: flex; }
.pbm-pomo-tp-tempo {
  font-family: 'Bebas Neue', sans-serif; font-size: 22vw; color: #C0270F;
  letter-spacing: .08em; line-height: .9;
}
.pbm-pomo-tp-tempo.pausa-curta { color: #5C9BD9; }
.pbm-pomo-tp-tempo.pausa-longa { color: #B58AE0; }
.pbm-pomo-tp-tempo.pausado { color: #555; }
.pbm-pomo-tp-fase {
  font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #555;
  letter-spacing: .2em; text-transform: uppercase;
}
.pbm-pomo-tp-sair {
  position: absolute; bottom: 32px; font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; color: #333; letter-spacing: .15em; text-transform: uppercase;
}
.pbm-pomo-audio-frame {
  margin-top: 10px; height: 0; overflow: hidden; transition: height .25s ease;
  border-radius: 8px;
}
.pbm-pomo-audio-frame.show { height: 130px; }
.pbm-pomo-audio-frame.so-audio { height: 0 !important; visibility: hidden; }
.pbm-pomo-audio-frame iframe { width: 100%; height: 100%; border: 0; border-radius: 8px; }

#pbm-pomo-reabrir {
  position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: none;
  align-items: center; gap: 6px;
  background: #1A1A1A; border: 1px solid #2A2A2A; border-radius: 20px;
  padding: 5px 12px 5px 10px; cursor: pointer; color: #888;
  font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .06em;
  box-shadow: 0 4px 16px rgba(0,0,0,.4); transition: color .12s, border-color .12s;
  user-select: none;
}
#pbm-pomo-reabrir:hover { color: #fff; border-color: #555; }

@media (max-width: 480px) {
  /* bottom: 80 deixa o widget acima da bottombar fixa (que tem ~64-72px) */
  #pbm-pomo-float { min-width: 240px; right: 12px; bottom: 80px; }
  #pbm-pomo-reabrir { right: 12px; bottom: 80px; }
  .pbm-pomo-display { font-size: 32px; min-width: 80px; }
  .pbm-pomo-audio-btn { font-size: 10px; padding: 3px 6px; }
}
`;
    var styleEl = document.createElement('style');
    styleEl.id = 'pbm-pomo-styles';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  // Tomate minimalista — círculo vermelho com folha verde discreta e brilho.
  // Corpo usa currentColor para refletir estado (rodando/pausa/pausado).
  function appleSvg() {
    return ''
      + '<svg class="pbm-pomo-apple-svg" viewBox="0 0 40 40" aria-hidden="true">'
      +   '<circle cx="20" cy="22" r="16" fill="currentColor"/>'
      +   '<ellipse cx="14" cy="17" rx="2.8" ry="3.5" fill="rgba(255,255,255,0.20)"/>'
      +   '<path d="M20 4 C 17.5 7, 18.5 9.5, 20 9.5 C 21.5 9.5, 22.5 7, 20 4 Z" fill="#3F9D55"/>'
      + '</svg>';
  }

  function floatingHTML() {
    return ''
      + '<div id="pbm-pomo-float-bar">'
      + '  <div id="pbm-pomo-title">'
      + '    <span class="pbm-pomo-dot" id="pbm-pomo-dot"></span>'
      + '    <span id="pbm-pomo-title-text">Pomodoro</span>'
      + '    <span class="pbm-pomo-apple" id="pbm-pomo-apple">'
      + '      ' + appleSvg()
      + '      <span class="pbm-pomo-apple-time" id="pbm-pomo-time-mini">25:00</span>'
      + '    </span>'
      + '  </div>'
      + '  <div id="pbm-pomo-actions">'
      + '    <button class="pbm-pomo-win-btn" id="pbm-pomo-min-btn" title="Minimizar / Expandir">&#8722;</button>'
      + '    <button class="pbm-pomo-win-btn" id="pbm-pomo-close-btn" title="Fechar">&#215;</button>'
      + '  </div>'
      + '</div>'
      + '<div id="pbm-pomo-body">'
      + '  <div id="pbm-pomo-classico-tag">'
      + '    <div class="pbm-pomo-bloco-area" id="pbm-pomo-bloco-area"></div>'
      + '    <div class="pbm-pomo-bloco-leg" id="pbm-pomo-bloco-leg"></div>'
      + '  </div>'
      + '  <div id="pbm-pomo-fase-label">Estudando</div>'
      + '  <div class="pbm-pomo-wrap">'
      + '    <div class="pbm-pomo-left" id="pbm-pomo-left">'
      + '      <div class="pbm-pomo-presets">'
      + '        <button class="pbm-pomo-preset" data-preset="25min">25min</button>'
      + '        <button class="pbm-pomo-preset" data-preset="45min">45min</button>'
      + '        <button class="pbm-pomo-preset" data-preset="60min">60min</button>'
      + '        <button class="pbm-pomo-preset" data-preset="Livre">Livre</button>'
      + '      </div>'
      + '      <div class="pbm-pomo-custom">'
      + '        <span>Min:</span>'
      + '        <input type="range" id="pbm-pomo-custom-min" min="5" max="180" step="5" value="25">'
      + '        <span class="pbm-pomo-custom-val" id="pbm-pomo-custom-min-val">25 min</span>'
      + '      </div>'
      + '      <div class="pbm-pomo-sessoes">Sessões hoje: <span id="pbm-pomo-sessoes">0</span></div>'
      + '    </div>'
      + '    <div class="pbm-pomo-right">'
      + '      <div class="pbm-pomo-display pausado" id="pbm-pomo-display">25:00</div>'
      + '      <div class="pbm-pomo-controls">'
      + '        <button class="pbm-pomo-btn" id="pbm-pomo-play" title="Iniciar / Pausar">'
      + '          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
      + '        </button>'
      + '        <button class="pbm-pomo-btn" id="pbm-pomo-reset" title="Reiniciar">'
      + '          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>'
      + '        </button>'
      + '      </div>'
      + '    </div>'
      + '  </div>'
      + '  <div class="pbm-pomo-audio">'
      + '    <div class="pbm-pomo-audio-row">'
      + '      <span class="pbm-pomo-audio-label">🎧</span>'
      + '      <button class="pbm-pomo-audio-btn" data-audio="off">Silêncio</button>'
      + '      <button class="pbm-pomo-audio-btn" data-audio="lofi">Lo-fi</button>'
      + '      <button class="pbm-pomo-audio-btn" data-audio="ruido">Ruído</button>'
      + '      <button class="pbm-pomo-audio-btn" data-audio="jazz">Jazz</button>'
      + '    </div>'
      + '    <label class="pbm-pomo-so-audio"><input type="checkbox" id="pbm-pomo-so-audio"> Só áudio (ocultar vídeo)</label>'
      + '    <div class="pbm-pomo-audio-frame" id="pbm-pomo-audio-frame"></div>'
      + '    <div class="pbm-pomo-tp-btn-row">'
      + '      <button class="pbm-pomo-tp-btn" id="pbm-pomo-tp-btn" title="Foco total — esconde a tela inteira deixando apenas o timer">🌑 Tela preta</button>'
      + '    </div>'
      + '  </div>'
      + '</div>';
  }

  function mountFloating(opts) {
    if (floatingEl) return floatingEl;
    floatingMountOpts = opts || {};
    injectStyles();

    var el = document.createElement('div');
    el.id = 'pbm-pomo-float';
    el.innerHTML = floatingHTML();
    document.body.appendChild(el);
    floatingEl = el;

    var rab = document.createElement('button');
    rab.id = 'pbm-pomo-reabrir';
    rab.innerHTML = ''
      + '<span class="pbm-pomo-apple pbm-pomo-apple-sm" id="pbm-pomo-apple-reabrir">'
      +   appleSvg()
      + '</span> Pomodoro';
    document.body.appendChild(rab);
    reabrirEl = rab;
    rab.addEventListener('click', reabrir);

    // Áudio container
    mountAudioIframe(el.querySelector('#pbm-pomo-audio-frame'));

    wireFloatingEvents(el);

    // Posição persistida só é aplicada quando o mount NÃO força minimizado.
    // Em /questoes (mount minimizado), a pos salva veio do widget expandido em /ciclo
    // e empurrava a pílula pra um left/top que virava bug ao expandir.
    // Mount minimizado sempre começa no canto inferior direito (defaults do CSS).
    if (floatingMountOpts.minimizado !== true) {
      var pos = readPosition();
      if (pos.left) { el.style.left = pos.left; el.style.right = 'auto'; }
      if (pos.top) { el.style.top = pos.top; el.style.bottom = 'auto'; }
      if (pos.right) el.style.right = pos.right;
      if (pos.bottom) el.style.bottom = pos.bottom;
    }
    // Clamp imediato: se o viewport encolheu desde a última sessão (troca de monitor, mobile),
    // a posição salva pode ter ficado fora da tela.
    clampPositionToViewport(el);

    // UI state — opts.minimizado força minimizado neste mount sem persistir
    // (default-por-mount: ex. /questoes quer sempre começar minimizado vindo do /ciclo,
    // mas se usuário expandir, deve permanecer expandido naquela sessão).
    if (floatingMountOpts.minimizado === true) {
      state.uiMinimizado = true;
      el.classList.add('minimizado');
    } else if (state.uiMinimizado) {
      el.classList.add('minimizado');
    }
    if (state.uiFechado) {
      el.style.display = 'none';
      rab.style.display = 'flex';
    }

    // Visibility listener (mobile suspende intervalos em background)
    if (!hookedVisibility) {
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) return;
        if (state.rodando) tick();
      });
      hookedVisibility = true;
    }
    if (!hookedResize) {
      window.addEventListener('resize', function () {
        if (floatingEl) clampPositionToViewport(floatingEl);
      });
      hookedResize = true;
    }

    if (state.rodando) iniciarInterval();
    updateFloatingUI();
    return el;
  }
  function unmountFloating() {
    if (!floatingEl) return;
    unmountAudioIframe();
    floatingEl.remove();
    floatingEl = null;
    if (reabrirEl) { reabrirEl.remove(); reabrirEl = null; }
  }

  // ────────────────────────────────────────────────────────────────
  // TELA PRETA — overlay full-screen com só o timer visível
  // ────────────────────────────────────────────────────────────────
  var telaPretaEl = null;
  var telaPretaKeyHandler = null;
  var telaPretaListenersOff = [];
  function tempoAtualFormatado() {
    if (state.modo === 'classico') {
      var sec = Math.max(0, Math.ceil((state.faseFimMs - Date.now()) / 1000));
      return { texto: fmtTempo(Math.floor(sec / 60), sec % 60), fase: state.fase };
    }
    return { texto: fmtTempo(state.simplesMin, state.simplesSeg), fase: 'estudando' };
  }
  function updateTelaPreta() {
    if (!telaPretaEl) return;
    var info = tempoAtualFormatado();
    var tempoEl = telaPretaEl.querySelector('.pbm-pomo-tp-tempo');
    var faseEl = telaPretaEl.querySelector('.pbm-pomo-tp-fase');
    if (tempoEl) {
      tempoEl.textContent = info.texto;
      tempoEl.className = 'pbm-pomo-tp-tempo';
      if (!state.rodando) tempoEl.classList.add('pausado');
      else if (info.fase === 'pausa-curta') tempoEl.classList.add('pausa-curta');
      else if (info.fase === 'pausa-longa') tempoEl.classList.add('pausa-longa');
    }
    if (faseEl) {
      var label = info.fase === 'pausa-curta' ? 'Pausa curta'
                : info.fase === 'pausa-longa' ? 'Pausa longa'
                : state.rodando ? 'Estudando' : 'Pausado';
      faseEl.textContent = label;
    }
  }
  function entrarTelaPreta() {
    if (telaPretaEl) return;
    var div = document.createElement('div');
    div.id = 'pbm-pomo-tela-preta';
    div.className = 'ativa';
    div.innerHTML = ''
      + '<div class="pbm-pomo-tp-fase">Estudando</div>'
      + '<div class="pbm-pomo-tp-tempo">00:00</div>'
      + '<div class="pbm-pomo-tp-sair">Clique ou pressione ESC para sair</div>';
    document.body.appendChild(div);
    telaPretaEl = div;
    div.addEventListener('click', sairTelaPreta);
    telaPretaKeyHandler = function (e) { if (e.key === 'Escape') sairTelaPreta(); };
    document.addEventListener('keydown', telaPretaKeyHandler);
    updateTelaPreta();
    telaPretaListenersOff = [
      on('tick', updateTelaPreta),
      on('transicao', updateTelaPreta),
      on('change', updateTelaPreta),
    ];
  }
  function sairTelaPreta() {
    if (!telaPretaEl) return;
    telaPretaEl.remove();
    telaPretaEl = null;
    if (telaPretaKeyHandler) {
      document.removeEventListener('keydown', telaPretaKeyHandler);
      telaPretaKeyHandler = null;
    }
    telaPretaListenersOff.forEach(function (off) { try { off(); } catch (_) {} });
    telaPretaListenersOff = [];
  }
  function hideFloating() {
    if (floatingEl) floatingEl.style.visibility = 'hidden';
    if (reabrirEl) reabrirEl.style.visibility = 'hidden';
  }
  function showFloating() {
    if (floatingEl) floatingEl.style.visibility = '';
    if (reabrirEl) reabrirEl.style.visibility = '';
  }
  function fechar() {
    if (!floatingEl) return;
    state.uiFechado = true; salvar();
    floatingEl.style.display = 'none';
    if (reabrirEl) reabrirEl.style.display = 'flex';
  }
  function reabrir() {
    if (!floatingEl) return;
    state.uiFechado = false; salvar();
    floatingEl.style.display = '';
    if (reabrirEl) reabrirEl.style.display = 'none';
  }
  function toggleMinimizar() {
    if (!floatingEl) return;
    floatingEl.classList.toggle('minimizado');
    state.uiMinimizado = floatingEl.classList.contains('minimizado');
    if (state.uiMinimizado) {
      // Snap pro canto inferior direito ao minimizar. Limpa qualquer left/top
      // que tenha sido pinado pelo drag da forma expandida.
      floatingEl.style.left = '';
      floatingEl.style.top = '';
      floatingEl.style.right = '';
      floatingEl.style.bottom = '';
    }
    salvar();
    var doClamp = function () { if (floatingEl) clampPositionToViewport(floatingEl); };
    requestAnimationFrame(doClamp);
    setTimeout(doClamp, 80);
  }

  function updateFloatingUI() {
    if (!floatingEl) return;
    var display = floatingEl.querySelector('#pbm-pomo-display');
    var mini = floatingEl.querySelector('#pbm-pomo-time-mini');
    var dot = floatingEl.querySelector('#pbm-pomo-dot');
    var dotReabrir = document.querySelector('#pbm-pomo-dot-reabrir');
    var play = floatingEl.querySelector('#pbm-pomo-play');
    var classicoTag = floatingEl.querySelector('#pbm-pomo-classico-tag');
    var faseLabel = floatingEl.querySelector('#pbm-pomo-fase-label');
    var left = floatingEl.querySelector('#pbm-pomo-left');

    // Texto do timer
    var tempo;
    var dotClass = 'pbm-pomo-dot';
    var displayClass = 'pbm-pomo-display ' + (state.rodando ? 'rodando' : 'pausado');
    if (state.modo === 'classico') {
      var sec = Math.max(0, Math.ceil((state.faseFimMs - Date.now()) / 1000));
      tempo = fmtTempo(Math.floor(sec / 60), sec % 60);
      classicoTag.classList.add('show');
      faseLabel.classList.add('show');
      left.style.display = 'none'; // esconde presets/sessões no modo classico
      // Cor por fase
      if (state.fase === 'pausa-curta') {
        displayClass = 'pbm-pomo-display pausa-curta';
        dotClass += ' pausa-curta';
      } else if (state.fase === 'pausa-longa') {
        displayClass = 'pbm-pomo-display pausa-longa';
        dotClass += ' pausa-longa';
      } else if (state.rodando) {
        dotClass += ' rodando';
      }
      // Labels do bloco / fase
      var areaEl = floatingEl.querySelector('#pbm-pomo-bloco-area');
      var legEl = floatingEl.querySelector('#pbm-pomo-bloco-leg');
      if (state.bloco) {
        areaEl.textContent = (state.bloco.area || '') + (state.bloco.meta_minutos ? ' · ' + state.bloco.meta_minutos + ' min meta' : '');
        legEl.textContent = state.bloco.legislacao_nome || '—';
      } else {
        areaEl.textContent = 'Pomodoro do ciclo';
        legEl.textContent = '';
      }
      var minAtual = Math.ceil(sec / 60);
      if (state.fase === 'estudando') faseLabel.textContent = 'Estudando · bloco ' + (state.cicloIdx + 1) + ' · ' + minAtual + ' min';
      else if (state.fase === 'pausa-curta') faseLabel.textContent = 'Pausa curta · ' + minAtual + ' min';
      else faseLabel.textContent = 'Pausa longa · ' + minAtual + ' min';
    } else {
      tempo = fmtTempo(state.simplesMin, state.simplesSeg);
      classicoTag.classList.remove('show');
      faseLabel.classList.remove('show');
      left.style.display = '';
      if (state.rodando) dotClass += ' rodando';
    }
    display.textContent = tempo;
    display.className = displayClass;
    if (mini) mini.textContent = tempo;
    if (dot) dot.className = dotClass;

    // Apple/tomate (modo minimizado e pílula reabrir) — espelha a cor de estado do dot.
    var appleClass = 'pbm-pomo-apple';
    if (dotClass.indexOf('pausa-curta') >= 0) appleClass += ' pausa-curta';
    else if (dotClass.indexOf('pausa-longa') >= 0) appleClass += ' pausa-longa';
    else if (!state.rodando) appleClass += ' pausado';
    var apple = floatingEl.querySelector('#pbm-pomo-apple');
    if (apple) apple.className = appleClass;
    var appleReabrir = document.querySelector('#pbm-pomo-apple-reabrir');
    if (appleReabrir) appleReabrir.className = appleClass;

    // Botão play/pause
    if (play) {
      play.innerHTML = state.rodando
        ? '<svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
    }

    // Presets
    floatingEl.querySelectorAll('.pbm-pomo-preset').forEach(function (b) {
      var p = b.dataset.preset;
      b.classList.toggle('ativo', p === state.simplesPreset);
    });
    var customInput = floatingEl.querySelector('#pbm-pomo-custom-min');
    var customVal = floatingEl.querySelector('#pbm-pomo-custom-min-val');
    var minAtual = state.simplesCustomMin || parsePresetMin(state.simplesPreset);
    if (customInput && minAtual) customInput.value = minAtual;
    if (customVal && minAtual) customVal.textContent = minAtual + ' min';

    // Sessões
    var sessoesEl = floatingEl.querySelector('#pbm-pomo-sessoes');
    if (sessoesEl) sessoesEl.textContent = state.sessoesHoje;

    // Áudio
    floatingEl.querySelectorAll('.pbm-pomo-audio-btn').forEach(function (b) {
      b.classList.toggle('ativo', b.dataset.audio === state.audioEscolha);
    });
    var soAudioInput = floatingEl.querySelector('#pbm-pomo-so-audio');
    if (soAudioInput) soAudioInput.checked = !!state.soAudio;
  }

  function wireFloatingEvents(el) {
    // Botões de controle
    el.querySelector('#pbm-pomo-play').addEventListener('click', toggle);
    el.querySelector('#pbm-pomo-reset').addEventListener('click', reset);
    el.querySelector('#pbm-pomo-min-btn').addEventListener('click', toggleMinimizar);
    el.querySelector('#pbm-pomo-close-btn').addEventListener('click', fechar);

    // Presets
    el.querySelectorAll('.pbm-pomo-preset').forEach(function (b) {
      b.addEventListener('click', function () {
        setSimplesPreset(b.dataset.preset);
      });
    });
    el.querySelector('#pbm-pomo-custom-min').addEventListener('input', function (e) {
      var val = parseInt(e.target.value);
      var valEl = el.querySelector('#pbm-pomo-custom-min-val');
      if (valEl) valEl.textContent = (val || 25) + ' min';
      if (val && val >= 1) setSimplesCustomMin(val);
    });

    // Áudio
    el.querySelectorAll('.pbm-pomo-audio-btn').forEach(function (b) {
      b.addEventListener('click', function () { setAudio(b.dataset.audio); });
    });
    el.querySelector('#pbm-pomo-so-audio').addEventListener('change', function (e) {
      setSoAudio(e.target.checked);
    });

    // Tela preta — foco total ocultando tudo exceto o timer
    el.querySelector('#pbm-pomo-tp-btn').addEventListener('click', entrarTelaPreta);

    // Click-to-expand quando minimizado
    var bar = el.querySelector('#pbm-pomo-float-bar');
    bar.addEventListener('click', function (e) {
      if (pomDragged) { pomDragged = false; return; }
      if (el.classList.contains('minimizado') && !e.target.closest('#pbm-pomo-actions')) {
        toggleMinimizar();
      }
    });

    // Drag
    setupDrag(el);

    // Listeners do engine
    on('tick', updateFloatingUI);
    on('audio', updateFloatingUI);
    on('change', updateFloatingUI);
    on('transicao', function () { updateFloatingUI(); });
  }

  var pomDragged = false;
  function setupDrag(win) {
    var bar = win.querySelector('#pbm-pomo-float-bar');
    var DRAG_THRESHOLD_PX = 6; // movimento mínimo antes de virar drag — protege tap de jitter
    var startX = 0, startY = 0, dragging = false;
    var startRectLeft = 0, startRectTop = 0;
    var startMouseX = 0, startMouseY = 0;

    function persistPos() {
      writePosition({
        left: win.style.left || '',
        top: win.style.top || '',
        right: win.style.right === 'auto' ? '' : (win.style.right || ''),
        bottom: win.style.bottom === 'auto' ? '' : (win.style.bottom || ''),
      });
    }
    // Só pina em pixels após cruzar o threshold de movimento. Pinar antes faz tap
    // virar drag (sub-pixel jitter de touch) — o widget congela em coordenadas
    // que viram problema quando o usuário expande depois.
    function ensurePinnedOnce() {
      if (pomDragged) return;
      win.style.right = 'auto'; win.style.bottom = 'auto';
      win.style.left = startRectLeft + 'px'; win.style.top = startRectTop + 'px';
    }
    function passedThreshold(curX, curY) {
      var dx = curX - startMouseX, dy = curY - startMouseY;
      return (dx * dx + dy * dy) >= (DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX);
    }
    bar.addEventListener('mousedown', function (e) {
      if (e.target.closest('.pbm-pomo-win-btn')) return;
      // Drag só funciona no widget expandido. Minimizado fica fixo no canto inferior
      // direito — clicar nele só alterna pra expandido. Tentar arrastar a forma
      // minimizada (wrapper width:auto, transparente) tinha um glitch de posição
      // que jogava o ícone pra fora do viewport.
      if (win.classList.contains('minimizado')) return;
      dragging = true; pomDragged = false;
      var rect = win.getBoundingClientRect();
      startX = e.clientX - rect.left; startY = e.clientY - rect.top;
      startMouseX = e.clientX; startMouseY = e.clientY;
      startRectLeft = rect.left; startRectTop = rect.top;
      e.preventDefault();
    });
    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      if (!pomDragged && !passedThreshold(e.clientX, e.clientY)) return;
      if (!pomDragged) win.classList.add('dragging');
      ensurePinnedOnce();
      pomDragged = true;
      var nx = Math.max(0, Math.min(window.innerWidth - win.offsetWidth, e.clientX - startX));
      var ny = Math.max(0, Math.min(window.innerHeight - win.offsetHeight, e.clientY - startY));
      win.style.left = nx + 'px'; win.style.top = ny + 'px';
    });
    document.addEventListener('mouseup', function () {
      if (dragging) {
        dragging = false;
        win.classList.remove('dragging');
        if (pomDragged) persistPos();
      }
    });
    bar.addEventListener('touchstart', function (e) {
      if (e.target.closest('.pbm-pomo-win-btn')) return;
      if (win.classList.contains('minimizado')) return; // drag desabilitado no minimizado
      var t = e.touches[0];
      var rect = win.getBoundingClientRect();
      startX = t.clientX - rect.left; startY = t.clientY - rect.top;
      startMouseX = t.clientX; startMouseY = t.clientY;
      startRectLeft = rect.left; startRectTop = rect.top;
      dragging = true; pomDragged = false;
    }, { passive: true });
    document.addEventListener('touchmove', function (e) {
      if (!dragging) return;
      var t = e.touches[0];
      if (!pomDragged && !passedThreshold(t.clientX, t.clientY)) return;
      if (!pomDragged) win.classList.add('dragging');
      ensurePinnedOnce();
      pomDragged = true;
      var nx = Math.max(0, Math.min(window.innerWidth - win.offsetWidth, t.clientX - startX));
      var ny = Math.max(0, Math.min(window.innerHeight - win.offsetHeight, t.clientY - startY));
      win.style.left = nx + 'px'; win.style.top = ny + 'px';
    }, { passive: true });
    document.addEventListener('touchend', function () {
      if (dragging) {
        dragging = false;
        win.classList.remove('dragging');
        if (pomDragged) persistPos();
      }
    });
  }

  // ────────────────────────────────────────────────────────────────
  // API: EVENTOS
  // ────────────────────────────────────────────────────────────────
  function on(evento, cb) {
    if (!listeners[evento]) listeners[evento] = [];
    listeners[evento].push(cb);
    return function off() {
      listeners[evento] = listeners[evento].filter(function (x) { return x !== cb; });
    };
  }

  // ────────────────────────────────────────────────────────────────
  // BOOT
  // ────────────────────────────────────────────────────────────────
  carregar();
  // Se já estava rodando ao carregar a página, retomar o tick automaticamente
  if (state.rodando) iniciarInterval();

  // ────────────────────────────────────────────────────────────────
  // EXPORT
  // ────────────────────────────────────────────────────────────────
  window.PBMPomo = {
    // Estado
    getEstado: function () { return JSON.parse(JSON.stringify(state)); },
    estaRodando: function () { return state.rodando; },
    getModo: function () { return state.modo; },
    getFase: function () { return state.fase; },
    getSecRestantes: function () {
      if (state.modo === 'classico') return Math.max(0, Math.ceil((state.faseFimMs - Date.now()) / 1000));
      return state.simplesMin * 60 + state.simplesSeg;
    },
    getEstudoMsAcumulado: function () {
      var total = state.estudoMsAcumulado;
      if (state.modo === 'classico' && state.fase === 'estudando' && state.faseInicioMs) {
        total += Math.max(0, Date.now() - state.faseInicioMs);
      }
      return total;
    },
    getBloco: function () { return state.bloco; },
    getCfg: function () { return Object.assign({}, state.cfg); },
    getAudioEscolha: function () { return state.audioEscolha; },
    getSoAudio: function () { return state.soAudio; },

    // Timer
    iniciarClassico: iniciarClassico,
    iniciarSimples: iniciarSimples,
    pausar: pausar,
    retomar: retomar,
    toggle: toggle,
    cancelar: cancelar,
    reset: reset,
    setSimplesPreset: setSimplesPreset,
    setSimplesCustomMin: setSimplesCustomMin,
    setCfg: function (cfg) { state.cfg = Object.assign(state.cfg, cfg || {}); salvar(); emit('change'); },

    // Áudio
    setAudio: setAudio,
    setSoAudio: setSoAudio,
    mountAudioIframe: mountAudioIframe,
    unmountAudioIframe: unmountAudioIframe,

    // Widget flutuante
    mountFloating: mountFloating,
    unmountFloating: unmountFloating,
    hideFloating: hideFloating,
    showFloating: showFloating,

    // Eventos
    on: on,

    // Debug
    _state: function () { return state; },
  };
})();
