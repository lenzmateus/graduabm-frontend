/**
 * Protocolo Bravo Mike — Tour Universal Guiado
 * Suporta múltiplas páginas com steps independentes e persistência granular.
 *
 * Persistência: a marcação "tour já visto" vive PRIMÁRIAMENTE no backend
 * (users.tours_completados via /api/auth/tours/completar), com cache em
 * localStorage para evitar flicker. Isto resolve o reaparecimento do tour
 * a cada login em mobile (iOS Safari ITP, PWA, navegador privado, etc.).
 *
 * API pública: PBMTour.init() | PBMTour.start() | PBMTour.reset()
 */
(function () {
  const VERSION = 'v3';

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
          target: 'a[href="/simulado-mensal"]',
          title: 'Protocolo QAP',
          body: 'Evento periódico com ranking ao vivo entre todos os alunos. Encare uma prova completa contra o tempo e veja sua colocação em tempo real.',
          position: 'right',
        },
        {
          target: 'a[href="/flashcards"]',
          title: 'Flashcards inteligentes',
          body: 'Cartões diários gerados por IA com repetição espaçada (SRS). Memorize os pontos críticos de cada legislação sem esforço.',
          position: 'right',
        },
        {
          target: 'a[href="/ranking"]',
          title: 'Ranking geral',
          body: 'Veja sua posição entre todos os alunos, separado por curso (CTSP/CBA), e acompanhe o pódio dos top performers.',
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

    '/simulado-prova': {
      key: 'simulado-prova',
      welcomeTitle: 'Ambiente de Prova',
      welcomeBody: 'Você está no modo prova fechado. Antes do cronômetro acelerar, conheça os 4 elementos essenciais.',
      steps: [
        {
          target: '#timer',
          title: 'Cronômetro de 4 horas',
          body: 'Conta regressivo. Nos últimos 5 minutos pisca em vermelho e, ao zerar, o que estiver no Cartão Resposta é entregue automaticamente.',
          position: 'bottom',
        },
        {
          target: '#q-enunciado',
          title: 'Sem feedback imediato',
          body: 'A alternativa marcada fica apenas destacada — não indica se está certa ou errada. Você só verá o gabarito após entregar.',
          position: 'bottom',
        },
        {
          target: '.btn-toggle-nav',
          title: 'Navegação livre',
          body: 'Abra o mapa para pular para qualquer questão. Você pode marcar, voltar e revisar como quiser dentro das 4 horas.',
          position: 'bottom',
        },
        {
          target: '.btn-finalizar',
          title: 'Cartão Resposta oficial',
          body: 'Atenção: só o que você preencher no Cartão Resposta oficial conta para a nota. Rascunho sem cartão marcado = questão em branco.',
          position: 'bottom',
        },
      ],
    },

    '/simulado-mensal': {
      key: 'simulado-mensal',
      welcomeTitle: 'Protocolo QAP',
      welcomeBody: 'Evento periódico de simulado completo com ranking ao vivo. Veja como funciona antes de participar.',
      steps: [
        {
          target: '#lobby-status-card',
          title: 'Janela única',
          body: 'O Protocolo QAP fica disponível por um período limitado (geralmente fim de semana). Você só pode participar uma vez por evento — leia o status antes de entrar.',
          position: 'top',
        },
        {
          target: '#lobby-status-card',
          title: 'Cronômetro real',
          body: 'Ao iniciar, 4 horas começam a correr. Se o tempo do evento encerrar antes, sua participação é entregue automaticamente.',
          position: 'top',
        },
        {
          target: '#lobby-status-card',
          title: 'Ranking ao vivo',
          body: 'Sua nota entra no ranking público assim que você entrega. Você poderá comparar-se com todos os alunos do seu curso em tempo real.',
          position: 'top',
        },
      ],
    },

    '/ranking': {
      key: 'ranking',
      welcomeTitle: 'Ranking Geral',
      welcomeBody: 'Veja sua posição entre todos os alunos. Você pode filtrar por curso e por critério de ordenação.',
      steps: [
        {
          target: '#stats-strip',
          title: 'Visão geral da plataforma',
          body: 'Quantos alunos estão competindo, total de questões resolvidas, taxa média de acerto e horas de estudo acumuladas.',
          position: 'bottom',
        },
        {
          target: '#tabs-curso',
          title: 'Filtre por curso',
          body: 'Veja o ranking geral, somente CTSP ou somente CBA. O ranking é separado para garantir comparação justa dentro do seu edital.',
          position: 'bottom',
        },
        {
          target: '#podio',
          title: 'Pódio dos líderes',
          body: 'Top 3 do critério selecionado. Subir para o pódio rende reconhecimento entre os concorrentes — e dá uma boa pista de quanto falta na sua preparação.',
          position: 'top',
        },
        {
          target: '#minha-pos',
          title: 'Sua posição',
          body: 'Card fixo com seus números: colocação, total de questões, taxa de acerto, tempo de estudo e pontuação geral.',
          position: 'top',
        },
      ],
    },

    '/ciclo-estudos': {
      key: 'ciclo-estudos',
      welcomeTitle: 'Ciclo de Estudos',
      welcomeBody: 'Aqui o sistema monta seu plano de estudo automaticamente a partir do nível que você declarar em cada área. Vamos ver como funciona.',
      steps: [
        {
          target: '#horas-totais',
          title: 'Horas totais do ciclo',
          body: 'Defina quantas horas o ciclo inteiro deve durar (entre 1h e 50h). O sistema distribui essas horas entre as áreas seguindo o peso do edital e o seu nível declarado.',
          position: 'bottom',
        },
        {
          target: '#at-grid',
          title: 'Auto-declaração por área',
          body: 'Marque seu nível de 1 (zero) a 5 (domino) em cada AT. Áreas com nível baixo ganham mais tempo e legislações novas primeiro. Você pode revisar isso a qualquer momento.',
          position: 'top',
        },
        {
          target: '#btn-gerar',
          title: 'Gerar ciclo',
          body: 'Clique para o sistema escolher as legislações e a ordem dos blocos. Cada bloco é um pomodoro sugestivo de 60 min focado numa AT + legislação.',
          position: 'top',
        },
        {
          target: '.hero-ciclo',
          title: 'Próximo bloco',
          body: 'Quando o ciclo está ativo, este é o bloco que vem agora. Inicie o pomodoro para estudar a legislação e em seguida responder questões focadas.',
          position: 'bottom',
        },
        {
          target: '.anel-progresso',
          title: 'Progresso do ciclo',
          body: 'O anel mostra quantos blocos você já concluiu. Ao zerar todos, o ciclo reinicia automaticamente e contabiliza uma rodada completa.',
          position: 'left',
        },
        {
          target: '#proximos-lista',
          title: 'Lista de blocos',
          body: 'Veja todos os blocos do ciclo na ordem em que serão executados. Pular um bloco o move para o fim da fila sem registrá-lo como concluído.',
          position: 'top',
        },
        {
          target: 'a[href="/minhas-dificuldades"]',
          title: 'Minhas Dificuldades',
          body: 'Marque legislações específicas como alta ou baixa dificuldade para influenciar a ordem dentro de cada AT no próximo ciclo gerado.',
          position: 'right',
        },
      ],
    },

    '/minhas-dificuldades': {
      key: 'minhas-dificuldades',
      welcomeTitle: 'Minhas Dificuldades',
      welcomeBody: 'Aqui você ajusta o peso de cada legislação no seu próximo ciclo de estudos. Tudo que você marca aqui só entra em vigor quando gerar um novo ciclo.',
      steps: [
        {
          target: '.stats-bar',
          title: 'Visão geral das marcações',
          body: 'Acompanhe quantas legislações você marcou como alta, baixa, ou deixou neutras. As neutras seguem a ordem padrão (menos-tocada primeiro).',
          position: 'bottom',
        },
        {
          target: '.toolbar',
          title: 'Buscar e filtrar',
          body: 'Procure por nome ou filtre só as alta/baixa/sem marcação. Útil para revisar rapidamente o que você já classificou.',
          position: 'bottom',
        },
        {
          target: '.leg-item',
          title: 'Marcar alta, neutra ou baixa',
          body: '↑ Alta puxa a legislação para o início da AT no próximo ciclo. ↓ Baixa empurra para o fim. Neutro deixa o sistema decidir pela menos-tocada.',
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

  /* ── PERSISTÊNCIA (backend + cache local) ── */
  const API_URL = 'https://graduabm-backend-production.up.railway.app';

  function getUser() {
    try { return JSON.parse(sessionStorage.getItem('usuario')); }
    catch { return null; }
  }

  function getToken() {
    return sessionStorage.getItem('token') || null;
  }

  function cacheKey(pageKey) {
    const u = getUser();
    const uid = u && u.id ? u.id : 'anon';
    return `pbm_tour_${pageKey}_${VERSION}_${uid}`;
  }

  // Verdade: array de chaves em sessionStorage.usuario.tours_completados.
  // localStorage[cacheKey] é só cache para evitar flicker entre páginas.
  function tourJaVisto(pageKey) {
    const u = getUser();
    if (u && Array.isArray(u.tours_completados) && u.tours_completados.includes(pageKey)) {
      return true;
    }
    try { return !!localStorage.getItem(cacheKey(pageKey)); } catch { return false; }
  }

  function shouldShow(pageKey) {
    return !tourJaVisto(pageKey);
  }

  function markDone(pageKey) {
    // Cache local imediato (evita reaparecimento durante a sessão)
    try { localStorage.setItem(cacheKey(pageKey), '1'); } catch {}

    // Atualiza sessionStorage.usuario para refletir o novo estado já neste tab
    const u = getUser();
    if (u) {
      const arr = Array.isArray(u.tours_completados) ? u.tours_completados : [];
      if (!arr.includes(pageKey)) {
        arr.push(pageKey);
        u.tours_completados = arr;
        try { sessionStorage.setItem('usuario', JSON.stringify(u)); } catch {}
      }
    }

    // Persiste no backend (fire-and-forget)
    const token = getToken();
    if (!token) return; // sem token = preview admin ou não-logado, fica só local
    try {
      fetch(`${API_URL}/api/auth/tours/completar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tour: pageKey }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }

  function resetAll() {
    // limpa cache local
    Object.values(TOUR_CONFIG).forEach(cfg => {
      try { localStorage.removeItem(cacheKey(cfg.key)); } catch {}
    });
    // backend
    const token = getToken();
    if (token) {
      try {
        fetch(`${API_URL}/api/auth/tours/resetar`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        }).then(() => {
          const u = getUser();
          if (u) { u.tours_completados = []; sessionStorage.setItem('usuario', JSON.stringify(u)); }
        }).catch(() => {});
      } catch {}
    } else {
      const u = getUser();
      if (u) { u.tours_completados = []; try { sessionStorage.setItem('usuario', JSON.stringify(u)); } catch {} }
    }
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
        box-shadow: 0 0 0 9999px var(--tour-spotlight, rgba(0,0,0,0.75));
        transition: all 0.35s cubic-bezier(.4,0,.2,1);
        pointer-events: none;
        border: 2px solid rgba(192,39,15,0.7);
      }
      #pbm-tour-tooltip {
        position: absolute;
        background: var(--bg-secundario);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 1.25rem 1.5rem;
        width: 300px;
        max-width: calc(100vw - 32px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.7);
        transition: all 0.3s cubic-bezier(.4,0,.2,1);
        z-index: 99999;
      }
      #pbm-tour-tooltip::before {
        content: '';
        position: absolute;
        width: 10px; height: 10px;
        background: var(--bg-secundario);
        border: 1px solid var(--border-color);
        transform: rotate(45deg);
      }
      #pbm-tour-tooltip.arrow-bottom::before { bottom:-6px;left:24px;border-top:none;border-left:none; }
      #pbm-tour-tooltip.arrow-top::before { top:-6px;left:24px;border-bottom:none;border-right:none; }
      #pbm-tour-tooltip.arrow-right::before { left:-6px;top:24px;border-bottom:none;border-left:none;transform:rotate(-45deg); }
      #pbm-tour-tooltip.arrow-left::before { right:-6px;top:24px;border-top:none;border-right:none;transform:rotate(45deg); }
      #pbm-tour-tooltip.arrow-none::before { display:none; }
      .pbm-tour-step { font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--brand-primary);margin-bottom:8px; }
      .pbm-tour-title { font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.04em;color:var(--texto-principal);margin-bottom:8px;line-height:1.2; }
      .pbm-tour-body { font-family:'Inter',sans-serif;font-size:13px;color:var(--texto-suporte);line-height:1.6;margin-bottom:1.25rem; }
      .pbm-tour-actions { display:flex;align-items:center;gap:8px;justify-content:flex-end;flex-wrap:wrap; }
      .pbm-tour-skip { margin-right:auto;background:none;border:none;color:var(--texto-suporte);font-size:12px;font-family:'Inter',sans-serif;cursor:pointer;padding:0;transition:color .15s;opacity:.7; }
      .pbm-tour-skip:hover { color:var(--texto-suporte);opacity:1; }
      .pbm-tour-btn { background:transparent;border:1px solid var(--border-color);color:var(--texto-suporte);border-radius:6px;padding:6px 14px;font-size:12px;font-family:'Inter',sans-serif;cursor:pointer;transition:all .15s; }
      .pbm-tour-btn:hover { border-color:var(--texto-suporte);color:var(--texto-principal); }
      .pbm-tour-btn-next { background:var(--brand-primary);border-color:var(--brand-primary);color:var(--brand-on-primary); }
      .pbm-tour-btn-next:hover { background:var(--brand-primary-hover);border-color:var(--brand-primary-hover); }
      .pbm-tour-dots { display:flex;gap:5px;align-items:center;margin-right:8px; }
      .pbm-tour-dot { width:5px;height:5px;border-radius:50%;background:var(--border-color);transition:background .2s; }
      .pbm-tour-dot.active { background:var(--brand-primary); }
      #pbm-tour-modal-center {
        display:none;position:fixed;inset:0;z-index:99998;
        align-items:center;justify-content:center;
        background:var(--tour-modal-bg, rgba(0,0,0,0.82));
        padding:16px;
      }
      #pbm-tour-modal-center.visible { display:flex; }
      .pbm-modal-box { background:var(--bg-secundario);border:1px solid var(--border-color);border-radius:16px;padding:2.5rem 2rem;max-width:400px;width:100%;text-align:center; }
      .pbm-modal-icon { width:56px;height:56px;border-radius:50%;background:rgba(192,39,15,.12);border:1px solid rgba(192,39,15,.25);display:inline-flex;align-items:center;justify-content:center;margin-bottom:1.25rem; }
      .pbm-modal-box h2 { font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:.04em;color:var(--texto-principal);margin-bottom:10px; }
      .pbm-modal-box p { font-family:'Inter',sans-serif;font-size:14px;color:var(--texto-suporte);line-height:1.65;margin-bottom:1.75rem; }
      .pbm-modal-actions { display:flex;gap:10px;justify-content:center;flex-wrap:wrap; }
      .pbm-modal-btn-skip { background:transparent;border:1px solid var(--border-color);color:var(--texto-suporte);border-radius:8px;padding:10px 20px;font-size:13px;font-family:'Inter',sans-serif;cursor:pointer;transition:all .15s;opacity:.75; }
      .pbm-modal-btn-skip:hover { border-color:var(--texto-suporte);color:var(--texto-suporte);opacity:1; }
      .pbm-modal-btn-start { background:var(--brand-primary);border:1px solid var(--brand-primary);color:var(--brand-on-primary);border-radius:8px;padding:10px 24px;font-size:13px;font-weight:600;font-family:'Inter',sans-serif;cursor:pointer;transition:all .15s; }
      .pbm-modal-btn-start:hover { background:var(--brand-primary-hover);border-color:var(--brand-primary-hover); }
      :root.light-mode { --tour-spotlight: rgba(0,0,0,0.45); --tour-modal-bg: rgba(0,0,0,0.55); }

      @media (max-width: 540px) {
        #pbm-tour-tooltip { width: calc(100vw - 32px); padding: 1rem 1.1rem; }
        .pbm-tour-title { font-size: 18px; }
        .pbm-tour-body { font-size: 12.5px; }
        .pbm-tour-btn { padding: 7px 12px; font-size: 12px; }
        .pbm-modal-box { padding: 2rem 1.4rem; }
        .pbm-modal-box h2 { font-size: 24px; }
      }
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

    // Marca como visto assim que abre — evita re-disparar se o usuário recarrega
    markDone(config.key);
    modalCenter.classList.add('visible');
  }

  function updateDots(idx) {
    if (!overlay) return;
    overlay.querySelectorAll('.pbm-tour-dot').forEach(d => {
      d.classList.toggle('active', parseInt(d.dataset.i) === idx);
    });
  }

  function isVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    return true;
  }

  function showStep(idx) {
    if (!activeConfig) return;
    const step = activeConfig.steps[idx];
    if (!step) { destroy(); return; }

    // Sincroniza estado global ANTES de qualquer recursão — evita
    // dessincronia entre o que está visível e o que o "Próximo →" avança.
    currentStep = idx;

    overlay.classList.add('active');
    stepEl.textContent = `Passo ${idx + 1} de ${activeConfig.steps.length}`;
    titleEl.textContent = step.title;
    bodyEl.textContent = step.body;
    updateDots(idx);

    btnPrev.style.display = idx === 0 ? 'none' : '';
    btnNext.textContent = idx >= activeConfig.steps.length - 1 ? 'Concluir ✓' : 'Próximo →';

    const el = step.target ? document.querySelector(step.target) : null;
    if (!el || !isVisible(el)) { showStep(idx + 1); return; }

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Aguarda o scroll estabilizar antes de posicionar o spotlight —
    // o setTimeout fixo de 320ms falhava em páginas longas, mobile com
    // address bar dinâmica, ou layouts que recompõem após scroll.
    let lastTop = null;
    let stableFrames = 0;
    let elapsed = 0;
    const stepRef = step;
    function settle() {
      // Aborta se o tour mudou de step durante a espera
      if (currentStep !== idx || activeConfig?.steps[idx] !== stepRef) return;

      const rect = el.getBoundingClientRect();
      if (lastTop !== null && Math.abs(rect.top - lastTop) < 0.5) {
        stableFrames++;
      } else {
        stableFrames = 0;
      }
      lastTop = rect.top;
      elapsed += 16;

      // Renderiza quando estabilizar (3 frames consecutivos) ou no timeout (700ms)
      if (stableFrames >= 3 || elapsed >= 700) {
        const pad = 8;
        spotlight.style.cssText = `left:${rect.left - pad}px;top:${rect.top - pad}px;width:${rect.width + pad * 2}px;height:${rect.height + pad * 2}px;display:block;`;
        positionTooltip(rect, step.position || 'bottom');
        return;
      }
      requestAnimationFrame(settle);
    }
    requestAnimationFrame(settle);
  }

  function positionTooltip(rect, pos) {
    const vw = window.innerWidth, vh = window.innerHeight;
    const TW = Math.min(300, vw - 32);
    const TH = 220, GAP = 16;
    tooltip.className = 'arrow-none';

    if (!rect) {
      tooltip.style.cssText = `left:${Math.max(16, (vw - TW) / 2)}px;top:${Math.max(16, (vh - TH) / 2)}px;`;
      return;
    }

    /* mobile: forçar centralizado se viewport estreito */
    if (vw < 540) {
      const top = (rect.bottom + GAP + TH + 16 < vh)
        ? rect.bottom + GAP
        : Math.max(16, rect.top - TH - GAP);
      tooltip.style.cssText = `left:${Math.max(16, (vw - TW) / 2)}px;top:${Math.min(top, vh - TH - 16)}px;`;
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
      buildDOM(config); // markDone é chamado dentro
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
      resetAll();
    },
  };
})();
