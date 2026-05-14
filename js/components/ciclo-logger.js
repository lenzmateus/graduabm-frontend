// PBM.CicloLogger — registro manual de tempo de estudo.
// avaliacao ∈ {'facil','medio','dificil'} dispara SRS V1 no backend.
(function () {
  'use strict';

  const AVALIACOES = ['facil', 'medio', 'dificil'];

  function validar({ blocoId, duracaoMin, dataEstudo, avaliacao }) {
    if (!blocoId) return 'Escolha um bloco';
    const dur = Number(duracaoMin);
    if (!Number.isFinite(dur) || dur < 1 || dur > 600) return 'Duração inválida (1 a 600 min)';
    const hoje = new Date().toISOString().slice(0, 10);
    if (dataEstudo) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dataEstudo)) return 'Data inválida';
      if (dataEstudo > hoje) return 'Data não pode ser no futuro';
    }
    if (avaliacao && !AVALIACOES.includes(avaliacao)) return 'Avaliação inválida';
    return null;
  }

  const api = {
    async registrar({ blocoId, duracaoMin, dataEstudo, avaliacao }) {
      const err = validar({ blocoId, duracaoMin, dataEstudo, avaliacao });
      if (err) throw new Error(err);

      const body = {
        duracao_minutos: Math.round(Number(duracaoMin)),
        origem: 'manual',
      };
      if (dataEstudo) body.data_estudo = dataEstudo;
      if (avaliacao)  body.avaliacao_srs = avaliacao;

      return window.PBM.Ciclo.registrarTempo(blocoId, body);
    },

    async registrarPomodoro({ blocoId, duracaoMin, avaliacao }) {
      const err = validar({ blocoId, duracaoMin, avaliacao });
      if (err) throw new Error(err);

      const body = {
        duracao_minutos: Math.round(Number(duracaoMin)),
        origem: 'pomodoro',
      };
      if (avaliacao) body.avaliacao_srs = avaliacao;

      return window.PBM.Ciclo.registrarTempo(blocoId, body);
    },
  };

  window.PBM = window.PBM || {};
  window.PBM.CicloLogger = api;
})();
