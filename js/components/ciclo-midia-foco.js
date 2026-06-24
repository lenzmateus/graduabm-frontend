// PBM.CicloMidiaFoco — mídia da legislação embutida na tela de foco do Ciclo.
// Toca o podcast (áudio) e a videoaula (YouTube IFrame Player API) da legislação
// do bloco em estudo, medindo o TEMPO REAL reproduzido (relógio, não posição) e
// creditando ao Balde via /tempo (ADR-0047). Expõe `minutosCreditados()` para o
// Pomodoro DEDUZIR ao registrar a sessão — o tempo entra no balde uma vez só.
(function () {
  'use strict';

  var creditadoMin = 0;          // minutos já creditados ao balde nesta sessão (p/ dedução)
  var onCredito = null;          // callback(totalMin) p/ a UI
  var pod = { lista: [], atual: null, seg: 0, base: null, audio: null, ultimo: 0 };
  var vid = { lista: [], atual: null, atualItem: null, seg: 0, base: null, ytId: '', player: null, tick: null };
  var ytApiPronta = false, ytPendente = null, ytApiSolicitada = false;

  function $(id) { return document.getElementById(id); }
  function desligarFundo() { try { if (window.PBMPomo) PBMPomo.setAudio('off'); } catch (_) {} }

  // Nomenclatura padrão por TIPO de mídia: podcast = "Episódio N", videoaula =
  // "Aula N", numerado pela ordem da série (a legislação já está no topo da tela).
  function fmt(s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

  // ── Medição de relógio (espelha os players standalone) ──────────────────────
  function pulsar(s) { if (s.base != null) { s.seg += (Date.now() - s.base) / 1000; s.base = Date.now(); } }
  function aplicarCredito(r) {
    if (r && r.creditado && r.minutos > 0) { creditadoMin += r.minutos; if (onCredito) onCredito(creditadoMin); }
  }
  function enviarPod() {
    pulsar(pod);
    if (!pod.atual) return;
    var n = Math.floor(pod.seg); if (n <= 0) return; pod.seg -= n;
    PBM.Podcasts.tempo(pod.atual.id, { segundos: n }).then(aplicarCredito).catch(function () {});
  }
  function enviarVid() {
    pulsar(vid);
    if (!vid.atual) return;
    var n = Math.floor(vid.seg); if (n <= 0) return; vid.seg -= n;
    PBM.Videoaulas.tempo(vid.atual.id, { segundos: n, youtube_id: vid.ytId || '' }).then(aplicarCredito).catch(function () {});
  }

  // ── Podcast (áudio nativo) ──────────────────────────────────────────────────
  // Player de áudio custom minimalista (o nativo destoa do dark do site).
  function montarAudio() {
    if (pod.audio) return pod.audio;
    var a = $('fm-audio'); if (!a) return null;
    pod.audio = a;
    var play = $('fm-play'), track = $('fm-track'), fill = $('fm-fill'), time = $('fm-time');
    function pintar() {
      var d = a.duration || 0, r = d ? Math.min(1, a.currentTime / d) : 0;
      if (fill) fill.style.width = (r * 100) + '%';
      if (time) time.textContent = fmt(a.currentTime);
    }
    function icone(tocando) { if (play) { play.textContent = tocando ? '⏸' : '▶'; play.setAttribute('aria-label', tocando ? 'Pausar' : 'Tocar'); } }
    if (play) play.addEventListener('click', function () { if (a.paused) a.play().catch(function () {}); else a.pause(); });
    if (track) track.addEventListener('click', function (e) {
      var rect = track.getBoundingClientRect(), r = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      if (a.duration) { a.currentTime = r * a.duration; pintar(); }
    });
    a.addEventListener('play', function () { pod.base = Date.now(); icone(true); pararVideo(); desligarFundo(); });
    a.addEventListener('pause', function () { pulsar(pod); pod.base = null; enviarPod(); icone(false); });
    a.addEventListener('ended', function () {
      pulsar(pod); pod.base = null; enviarPod(); icone(false);
      if (pod.atual) { // ouviu até o fim → marca como ouvido
        pod.atual._concluido = true;
        setConcluidoUI('fm-podcast-lista', pod.atual.id, true);
        PBM.Podcasts.salvarProgresso(pod.atual.id, { posicao_segundos: 0, concluido: true }).catch(function () {});
      }
    });
    a.addEventListener('timeupdate', function () {
      pintar();
      var t = Date.now(); if (t - pod.ultimo > 10000) { pod.ultimo = t; enviarPod(); }
    });
    return a;
  }
  function tocarPodcast(p) {
    enviarPod(); pod.seg = 0; pod.base = null; pod.atual = p;
    marcarAtivo('fm-podcast-lista', p.id);
    var player = $('fm-player'); if (player) player.hidden = false;
    var fill = $('fm-fill'); if (fill) fill.style.width = '0%';
    var ag = $('fm-podcast-agora'); if (ag) ag.textContent = p._rotulo || 'Aula';
    var a = montarAudio(); if (!a) return;
    PBM.Podcasts.stream(p.id).then(function (s) {
      a.src = s.url; a.play().catch(function () {});
    }).catch(function () { if (ag) ag.textContent = 'Falha ao carregar o áudio. Tente novamente.'; });
  }

  // ── Videoaula (YouTube IFrame Player API) ───────────────────────────────────
  function carregarYtApi() {
    if (ytApiPronta || ytApiSolicitada) return;
    ytApiSolicitada = true;
    window.onYouTubeIframeAPIReady = function () {
      ytApiPronta = true;
      if (ytPendente) { var it = ytPendente; ytPendente = null; criarPlayer(it); }
    };
    var s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  }
  function pararVideoTick() { if (vid.tick) { clearInterval(vid.tick); vid.tick = null; } }
  function pararVideo() {
    pararVideoTick(); pulsar(vid); vid.base = null; enviarVid();
    if (vid.player) { try { vid.player.destroy(); } catch (_) {} vid.player = null; }
    var palco = $('fm-video-palco'); if (palco) palco.innerHTML = '';
  }
  function onState(e) {
    var YTS = window.YT && YT.PlayerState; if (!YTS) return;
    if (e.data === YTS.PLAYING) { vid.base = Date.now(); if (!vid.tick) vid.tick = setInterval(enviarVid, 5000); }
    else if (e.data === YTS.PAUSED || e.data === YTS.ENDED) {
      pulsar(vid); vid.base = null; pararVideoTick(); enviarVid();
      if (e.data === YTS.ENDED && vid.atualItem) { // assistiu até o fim → marca como visto
        vid.atualItem._concluido = true;
        setConcluidoUI('fm-video-lista', vid.atualItem.key, true);
        PBM.Videoaulas.salvarProgresso(vid.atualItem.videoaulaId, { concluido: true, youtube_id: vid.atualItem.ytChave || '' }).catch(function () {});
      }
    }
    else { pulsar(vid); vid.base = null; }
  }
  function criarPlayer(item) {
    var palco = $('fm-video-palco'); if (!palco) return;
    palco.innerHTML = '<div id="fm-yt-host"></div>';
    var vars = { rel: 0, modestbranding: 1, autoplay: 1, enablejsapi: 1, origin: location.origin, playsinline: 1 };
    var opts = { width: '100%', height: '100%', playerVars: vars, events: { onStateChange: onState } };
    if (item.playlistId) { vars.listType = 'playlist'; vars.list = item.playlistId; if (item.videoId) opts.videoId = item.videoId; }
    else { opts.videoId = item.videoId; }
    vid.player = new YT.Player('fm-yt-host', opts);
  }
  function tocarVideo(item) {
    if (pod.audio) { try { pod.audio.pause(); } catch (_) {} }
    desligarFundo();
    enviarVid(); vid.seg = 0; vid.base = null;
    vid.atual = { id: item.videoaulaId }; vid.ytId = item.ytChave || ''; vid.atualItem = item;
    marcarAtivo('fm-video-lista', item.key);
    if (ytApiPronta) criarPlayer(item); else { ytPendente = item; carregarYtApi(); }
  }

  // ── Render das listas ───────────────────────────────────────────────────────
  function marcarAtivo(listaId, key) {
    var lista = $(listaId); if (!lista) return;
    lista.querySelectorAll('.fm-item').forEach(function (b) { b.classList.toggle('ativo', b.dataset.key === String(key)); });
  }
  function setConcluidoUI(listaId, key, val) {
    var lista = $(listaId); if (!lista) return;
    var rows = lista.querySelectorAll('.fm-item');
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].dataset.key === String(key)) {
        rows[i].classList.toggle('concluido', !!val);
        if (val) rows[i].classList.remove('andamento');
        break;
      }
    }
  }
  // Item da lista: botão de tocar (esquerda) + botão de marcar visto/ouvido
  // (direita). O estado (concluído / em andamento) vem da API; o aluno também
  // pode alternar à mão. Auto-marca ao terminar de ouvir/assistir.
  function criarItem(o) {
    var row = document.createElement('div');
    row.className = 'fm-item' + (o.concluido ? ' concluido' : '') + (o.emAndamento ? ' andamento' : '');
    row.dataset.key = String(o.key);
    var sel = document.createElement('button');
    sel.type = 'button'; sel.className = 'fm-sel';
    var ic = document.createElement('span'); ic.className = 'fm-ic';
    var lb = document.createElement('span'); lb.className = 'fm-lb'; lb.textContent = o.label;
    sel.append(ic, lb);
    sel.addEventListener('click', o.onTocar);
    row.appendChild(sel);
    var chk = document.createElement('button');
    chk.type = 'button'; chk.className = 'fm-chk';
    chk.setAttribute('aria-label', 'Marcar como visto/ouvido');
    chk.addEventListener('click', function (e) { e.stopPropagation(); o.onToggle(row); });
    row.appendChild(chk);
    return row;
  }
  function renderPodcasts() {
    var lista = $('fm-podcast-lista'); if (!lista) return;
    lista.innerHTML = '';
    pod.lista.forEach(function (p, i) {
      p._rotulo = 'Aula ' + (i + 1);
      p._concluido = !!p.concluido;
      lista.appendChild(criarItem({
        key: p.id, label: p._rotulo, concluido: p._concluido,
        emAndamento: !p._concluido && p.posicao_segundos > 0,
        onTocar: function () { tocarPodcast(p); },
        onToggle: function (row) { togglePodcast(p, row); },
      }));
    });
  }
  function togglePodcast(p, row) {
    var novo = !p._concluido; p._concluido = novo;
    row.classList.toggle('concluido', novo); row.classList.remove('andamento');
    PBM.Podcasts.salvarProgresso(p.id, { posicao_segundos: p.posicao_segundos || 0, concluido: novo })
      .catch(function () { p._concluido = !novo; row.classList.toggle('concluido', !novo); });
  }
  function linhasVideo(v) {
    if (v.videos && v.videos.length) {
      return v.videos.map(function (x) {
        return { key: v.id + ':' + x.youtube_id, videoaulaId: v.id, videoId: x.youtube_id, playlistId: v.youtube_playlist_id, ytChave: x.youtube_id, concluido: !!x.concluido };
      });
    }
    if (v.youtube_playlist_id) return [{ key: v.id, playlistCompleta: true, videoaulaId: v.id, videoId: null, playlistId: v.youtube_playlist_id, ytChave: '', concluido: !!v.concluido }];
    return [{ key: v.id, videoaulaId: v.id, videoId: v.youtube_id, playlistId: null, ytChave: '', concluido: !!v.concluido }];
  }
  function renderVideos() {
    var lista = $('fm-video-lista'); if (!lista) return;
    lista.innerHTML = '';
    var n = 0;
    vid.lista.forEach(function (v) {
      linhasVideo(v).forEach(function (item) {
        item.label = item.playlistCompleta ? 'Playlist completa' : ('Aula ' + (++n));
        item._concluido = !!item.concluido;
        lista.appendChild(criarItem({
          key: item.key, label: item.label, concluido: item._concluido, emAndamento: false,
          onTocar: function () { tocarVideo(item); },
          onToggle: function (row) { toggleVideo(item, row); },
        }));
      });
    });
  }
  function toggleVideo(item, row) {
    var novo = !item._concluido; item._concluido = novo;
    row.classList.toggle('concluido', novo);
    PBM.Videoaulas.salvarProgresso(item.videoaulaId, { concluido: novo, youtube_id: item.ytChave || '' })
      .catch(function () { item._concluido = !novo; row.classList.toggle('concluido', !novo); });
  }

  // ── API pública ─────────────────────────────────────────────────────────────
  function reset() {
    pararTudo();
    creditadoMin = 0; onCredito = null;
    pod = { lista: [], atual: null, seg: 0, base: null, audio: null, ultimo: 0 };
    vid = { lista: [], atual: null, seg: 0, base: null, ytId: '', player: null, tick: null };
  }
  function pararTudo() {
    if (pod.audio) { try { pod.audio.pause(); } catch (_) {} enviarPod(); }
    pararVideo();
  }
  // Pausa a mídia (sem destruir) para o sinal do Pomodoro sobrepor no fim da fase.
  function pausarMidia() {
    if (pod.audio) { try { pod.audio.pause(); } catch (_) {} }
    if (vid.player && vid.player.pauseVideo) { try { vid.player.pauseVideo(); } catch (_) {} }
  }
  async function carregar(bloco, opts) {
    reset();
    onCredito = (opts && opts.onCredito) || null;
    var painel = $('pomo-midia'); if (!painel) return false;
    painel.style.display = 'none';
    var player = $('fm-player'); if (player) player.hidden = true;
    var leg = bloco.legislacao_id;
    try { pod.lista = (await PBM.Podcasts.listar(leg)) || []; } catch (_) { pod.lista = []; }
    try { vid.lista = (await PBM.Videoaulas.listar(leg)) || []; } catch (_) { vid.lista = []; }
    var temPod = pod.lista.length > 0, temVid = vid.lista.length > 0;
    if (!temPod && !temVid) return false; // sem mídia: painel fica oculto
    renderPodcasts(); renderVideos();
    // Habilita só as abas com conteúdo; abre a primeira disponível.
    var tabPod = painel.querySelector('[data-fmtab="podcast"]');
    var tabVid = painel.querySelector('[data-fmtab="video"]');
    if (tabPod) tabPod.style.display = temPod ? '' : 'none';
    if (tabVid) tabVid.style.display = temVid ? '' : 'none';
    selecionarAba(temPod ? 'podcast' : 'video');
    painel.style.display = '';
    return true;
  }
  function selecionarAba(qual) {
    var painel = $('pomo-midia'); if (!painel) return;
    painel.querySelectorAll('.pomo-midia-tab').forEach(function (b) { b.classList.toggle('ativo', b.dataset.fmtab === qual); });
    var pp = $('fm-podcast-pane'), vp = $('fm-video-pane');
    if (pp) pp.style.display = qual === 'podcast' ? '' : 'none';
    if (vp) vp.style.display = qual === 'video' ? '' : 'none';
  }

  function wireTabs() {
    var painel = $('pomo-midia'); if (!painel || painel.dataset.wired) return;
    painel.dataset.wired = '1';
    painel.querySelectorAll('.pomo-midia-tab').forEach(function (b) {
      b.addEventListener('click', function () { selecionarAba(b.dataset.fmtab); });
    });
  }
  if (document.readyState !== 'loading') wireTabs();
  else document.addEventListener('DOMContentLoaded', wireTabs);

  window.PBM = window.PBM || {};
  window.PBM.CicloMidiaFoco = {
    carregar: carregar,
    pararTudo: pararTudo,
    pausarMidia: pausarMidia,
    reset: reset,
    minutosCreditados: function () { return creditadoMin; },
  };
})();
