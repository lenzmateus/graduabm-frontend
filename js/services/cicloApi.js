// PBM.CicloApi — fachada para endpoints do Ciclo de Estudos (redesign AT-first)
// Delega para PBM.Ciclo (em api.js). Mantém o nome legado para compat.
(function () {
  'use strict';
  if (!window.PBM) {
    console.warn('[cicloApi] PBM não inicializado; carregue /js/api.js antes deste arquivo.');
    return;
  }

  window.PBM.CicloApi = {
    get:                 (...a) => window.PBM.Ciclo.get(...a),
    gerar:               (...a) => window.PBM.Ciclo.gerar(...a),
    atualizar:           (...a) => window.PBM.Ciclo.atualizar(...a),
    excluir:             (...a) => window.PBM.Ciclo.excluir(...a),
    iniciarBloco:        (...a) => window.PBM.Ciclo.iniciarBloco(...a),
    concluirBloco:       (...a) => window.PBM.Ciclo.concluirBloco(...a),
    pularBloco:          (...a) => window.PBM.Ciclo.pularBloco(...a),
    registrarTempo:      (...a) => window.PBM.Ciclo.registrarTempo(...a),
    proficiencia:        (...a) => window.PBM.Ciclo.proficiencia(...a),
    salvarProficiencia:  (...a) => window.PBM.Ciclo.salvarProficiencia(...a),
    dificuldades:        (...a) => window.PBM.Ciclo.dificuldades(...a),
    salvarDificuldade:   (...a) => window.PBM.Ciclo.salvarDificuldade(...a),

    // Histórico (mantém compat)
    historico: {
      resumo:             (dias) => window.PBM.Historico.resumo(dias),
      porLegislacao:      (id)   => window.PBM.Historico.porLegislacao(id),
      revisoesPendentes:  ()     => window.PBM.Historico.revisoesPendentes(),
    },
  };
})();
