// PBM.CicloWizard — helpers puros (sem DOM) que espelham CicloService do backend.
// Permitem ao frontend pré-visualizar metas antes de POST /api/ciclo.
(function () {
  'use strict';

  const DISTRIBUICAO_EDITAL = {
    ctsp: { AT1: 14, AT2: 8,  AT3: 14, AT4: 12, AT5: 12, total: 60 },
    cba:  { AT1: 7,  AT2: 5,  AT3: 9,  AT4: 8,  AT5: 11, total: 40 },
  };

  const ORDEM_INTERCALADA = ['AT1', 'AT3', 'AT2', 'AT4', 'AT5'];

  function pctDaProvaPorAT(curso, area) {
    const d = DISTRIBUICAO_EDITAL[curso];
    if (!d) return 0;
    return (d[area] || 0) / d.total;
  }

  function multiplicadorPorPrioridade(p) {
    if (p === 'reforco') return 1.5;
    if (p === 'dominio') return 0.8;
    return 1.0;
  }

  function agruparPorAT(selecoes) {
    const porAT = {};
    for (const s of selecoes) {
      (porAT[s.area] ||= []).push(s);
    }
    return porAT;
  }

  // Calcula meta_minutos por legislação agrupando por AT.
  // Args:
  //   curso     'ctsp' | 'cba'
  //   horasDia  number
  //   selecoes  Array<{ legislacao_id, area, prioridade? }>
  //   porAT?    resultado de agruparPorAT (reuso interno)
  // Retorna: { [legislacao_id]: { meta_minutos, area, peso } }
  function calcularMetas({ curso, horasDia, selecoes, porAT }) {
    const grupos = porAT || agruparPorAT(selecoes);
    const result = {};
    for (const [at, legs] of Object.entries(grupos)) {
      const pct = pctDaProvaPorAT(curso, at);
      const tempoBaseAT = Number(horasDia) * 60 * pct;
      const qtd = legs.length;
      const pesos = legs.map((l) => (1 / qtd) * multiplicadorPorPrioridade(l.prioridade));
      const soma = pesos.reduce((s, p) => s + p, 0) || 1;
      legs.forEach((l, i) => {
        const pesoNorm = pesos[i] / soma;
        const meta = Math.max(10, Math.min(120, Math.round(tempoBaseAT * pesoNorm)));
        result[l.legislacao_id] = { meta_minutos: meta, area: at, peso: pesoNorm };
      });
    }
    return result;
  }

  // Monta a sequência intercalada (AT1, AT3, AT2, AT4, AT5) para o ciclo.
  // Retorna o array `blocos` no formato esperado por POST /api/ciclo.
  function montarBlocos({ curso, horasDia, selecoes }) {
    const porAT = agruparPorAT(selecoes);
    const metas = calcularMetas({ curso, horasDia, selecoes, porAT });
    const cursores = {};
    for (const at of Object.keys(porAT)) cursores[at] = 0;

    const sequencia = [];
    let restantes = selecoes.length;
    let i = 0;
    while (restantes > 0) {
      const at = ORDEM_INTERCALADA[i % ORDEM_INTERCALADA.length];
      const fila = porAT[at];
      const idx = cursores[at] || 0;
      if (fila && idx < fila.length) {
        sequencia.push(fila[idx]);
        cursores[at] = idx + 1;
        restantes--;
      }
      i++;
      if (i > selecoes.length * 10) break;
    }
    return sequencia.map((l, idx) => ({
      ordem: idx,
      area: l.area,
      legislacao_id: l.legislacao_id,
      legislacao_nome: l.legislacao_nome,
      pct_da_prova: pctDaProvaPorAT(curso, l.area),
      meta_minutos: metas[l.legislacao_id]?.meta_minutos || 30,
      prioridade: l.prioridade || null,
    }));
  }

  function validarSelecoes(selecoes) {
    if (!Array.isArray(selecoes) || selecoes.length === 0) return 'Selecione ao menos 1 legislação';
    if (selecoes.length > 50) return 'Máximo 50 legislações por ciclo';
    return null;
  }

  window.PBM = window.PBM || {};
  window.PBM.CicloWizard = {
    DISTRIBUICAO_EDITAL,
    pctDaProvaPorAT,
    multiplicadorPorPrioridade,
    calcularMetas,
    montarBlocos,
    validarSelecoes,
  };
})();
