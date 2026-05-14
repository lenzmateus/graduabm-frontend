// PBM.CicloPomodoro — timer Pomodoro resistente a F5/sleep.
// Verdade do timer = (inicio_ts, duracao_min) em localStorage; o setInterval
// só re-renderiza UI. O restante de segundos sempre vem de Date.now() para
// evitar drift.
(function () {
  'use strict';

  const STORAGE_KEY = 'pbm_ciclo_pomodoro';
  const DUR_MIN = 1;
  const DUR_MAX = 180;
  const DUR_DEFAULT = 25;

  function lerEstado() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj !== 'object') return null;
      return obj;
    } catch { return null; }
  }

  function gravarEstado(obj) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch {}
  }

  function limparEstado() {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  function calcRestanteSeg({ inicio_ts, duracao_min, rodando, pausado_em }) {
    const totalSeg = duracao_min * 60;
    if (!rodando) {
      if (pausado_em && inicio_ts) {
        const decorrido = Math.floor((pausado_em - inicio_ts) / 1000);
        return Math.max(0, totalSeg - decorrido);
      }
      return totalSeg;
    }
    if (!inicio_ts) return totalSeg;
    const decorrido = Math.floor((Date.now() - inicio_ts) / 1000);
    return Math.max(0, totalSeg - decorrido);
  }

  function fmtTimer(seg) {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  let ctx = {
    ui: null,
    callbacks: null,
    intervalId: null,
    blocoAtual: null,
    visListener: null,
    lastTexto: null,
  };

  function setText(el, txt) {
    if (el && el.textContent !== txt) el.textContent = txt;
  }

  // Re-renderiza apenas o que muda por segundo. Botões de duração / disabled
  // ficam em refreshControles, chamado quando rodando/duracao mudam.
  function pintarUI(stOverride) {
    const st = stOverride || lerEstado();
    if (!ctx.ui) return;
    if (!st) {
      setText(ctx.ui.displayEl, '00:00');
      setText(ctx.ui.stateEl, 'Pronto');
      setText(ctx.ui.btnLabelEl, 'INICIAR');
      ctx.lastTexto = null;
      return;
    }
    const restante = calcRestanteSeg(st);
    if (ctx.ui.displayEl) {
      setText(ctx.ui.displayEl, fmtTimer(restante));
      ctx.ui.displayEl.classList.toggle('alerta', restante <= 60 && st.rodando);
    }
    const decorrido = restante < st.duracao_min * 60;
    setText(ctx.ui.stateEl, st.rodando ? 'Em foco' : (decorrido ? 'Pausado' : 'Pronto'));
    setText(ctx.ui.btnLabelEl, st.rodando ? 'PAUSAR' : (decorrido ? 'CONTINUAR' : 'INICIAR'));
  }

  function refreshControles() {
    if (!ctx.ui) return;
    const st = lerEstado();
    (ctx.ui.durButtons || []).forEach((b) => {
      b.classList.toggle('ativo', !!st && Number(b.dataset.dur) === st.duracao_min);
      b.disabled = !!(st && st.rodando);
    });
  }

  function pararInterval() {
    if (ctx.intervalId) { clearInterval(ctx.intervalId); ctx.intervalId = null; }
  }

  function ligarInterval() {
    pararInterval();
    ctx.intervalId = setInterval(() => {
      const st = lerEstado();
      if (!st || !st.rodando) { pararInterval(); pintarUI(st); refreshControles(); return; }
      pintarUI(st);
      if (calcRestanteSeg(st) <= 0) {
        pararInterval();
        concluirInternal().catch((e) => console.warn('[pomodoro] erro concluir', e));
      }
    }, 1000);
  }

  function aoMudarVisibilidade() {
    if (document.hidden) {
      pararInterval();
      return;
    }
    const st = lerEstado();
    if (!st) return;
    pintarUI(st);
    if (st.rodando) {
      if (calcRestanteSeg(st) <= 0) {
        concluirInternal().catch(() => {});
      } else {
        ligarInterval();
      }
    }
  }

  async function concluirInternal() {
    const st = lerEstado();
    if (!st) return;
    const duracao = st.duracao_min;
    const blocoId = st.blocoId;
    limparEstado();
    if (ctx.ui.stateEl) ctx.ui.stateEl.textContent = 'Sessão completa! Registrando…';
    if (ctx.ui.btnLabelEl) ctx.ui.btnLabelEl.textContent = 'INICIAR';
    refreshControles();
    try {
      if (ctx.callbacks?.registrarSessao) {
        await ctx.callbacks.registrarSessao(blocoId, duracao);
      }
      if (ctx.callbacks?.aoCompletar) ctx.callbacks.aoCompletar(blocoId, duracao);
    } catch (e) {
      console.warn('[pomodoro] erro registrarSessao', e);
      if (ctx.ui.stateEl) ctx.ui.stateEl.textContent = 'Erro ao registrar — tente novamente';
    }
    pintarUI();
  }

  const api = {
    attach({ ui, callbacks }) {
      ctx.ui = ui || {};
      ctx.callbacks = callbacks || {};
      (ctx.ui.durButtons || []).forEach((b) => {
        b.addEventListener('click', (e) => {
          const dur = Number(e.currentTarget.dataset.dur);
          if (Number.isFinite(dur) && dur > 0) api.selecionarDuracao(dur);
        });
      });
      if (!ctx.visListener) {
        ctx.visListener = aoMudarVisibilidade;
        document.addEventListener('visibilitychange', ctx.visListener);
      }
      pintarUI();
      refreshControles();
    },

    preparar(bloco, duracaoMinPadrao) {
      ctx.blocoAtual = bloco;
      const st = lerEstado();
      if (st && st.blocoId === bloco.id) {
        pintarUI(st);
        refreshControles();
        if (st.rodando) ligarInterval();
        return;
      }
      const duracao = Number(duracaoMinPadrao) > 0 ? Number(duracaoMinPadrao) : DUR_DEFAULT;
      gravarEstado({
        blocoId: bloco.id,
        duracao_min: duracao,
        inicio_ts: null,
        rodando: false,
        pausado_em: null,
      });
      pintarUI();
      refreshControles();
    },

    iniciar() {
      const st = lerEstado();
      if (!st) return;
      const agora = Date.now();
      let inicio_ts = agora;
      if (st.pausado_em && st.inicio_ts) {
        inicio_ts = agora - (st.pausado_em - st.inicio_ts);
      }
      const next = { ...st, rodando: true, inicio_ts, pausado_em: null };
      gravarEstado(next);
      if (ctx.callbacks?.aoIniciar) {
        try { ctx.callbacks.aoIniciar(st.blocoId); } catch (e) { console.warn(e); }
      }
      pintarUI(next);
      refreshControles();
      ligarInterval();
    },

    pausar() {
      const st = lerEstado();
      if (!st || !st.rodando) return;
      pararInterval();
      const next = { ...st, rodando: false, pausado_em: Date.now() };
      gravarEstado(next);
      pintarUI(next);
      refreshControles();
    },

    toggle() {
      const st = lerEstado();
      if (!st) return;
      if (st.rodando) api.pausar(); else api.iniciar();
    },

    concluir() {
      pararInterval();
      return concluirInternal();
    },

    selecionarDuracao(min) {
      const st = lerEstado();
      if (st && st.rodando) return;
      const blocoId = st?.blocoId || ctx.blocoAtual?.id;
      if (!blocoId) return;
      gravarEstado({
        blocoId,
        duracao_min: Math.max(DUR_MIN, Math.min(DUR_MAX, Math.round(min))),
        inicio_ts: null,
        rodando: false,
        pausado_em: null,
      });
      pintarUI();
      refreshControles();
    },

    restaurar() {
      const st = lerEstado();
      if (!st) return null;
      pintarUI(st);
      refreshControles();
      if (st.rodando && calcRestanteSeg(st) <= 0) {
        concluirInternal().catch(() => {});
        return st;
      }
      if (st.rodando) ligarInterval();
      return st;
    },

    estado() {
      const st = lerEstado();
      if (!st) return null;
      return {
        blocoId: st.blocoId,
        duracaoMin: st.duracao_min,
        restanteSeg: calcRestanteSeg(st),
        rodando: !!st.rodando,
      };
    },

    limpar() {
      pararInterval();
      limparEstado();
      pintarUI();
      refreshControles();
    },
  };

  window.PBM = window.PBM || {};
  window.PBM.CicloPomodoro = api;
})();
