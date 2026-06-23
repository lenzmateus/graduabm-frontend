/* ============================================================
   AudioMp3 — converte um arquivo de áudio (wav/m4a/aac/…) para mp3 NO NAVEGADOR,
   usando Web Audio (decode) + lamejs (encode). Carregar DEPOIS de js/vendor/lame.min.js.

   Por que no navegador: o arquivo pesado (wav do NotebookLM) nunca viaja — só o
   mp3 pequeno sobe. Decodifica → downmix p/ mono (fala) → mp3 128 kbps.

   Uso:
     const { file, duracao } = await AudioMp3.paraMp3(arquivoWav, {
       onProgress: (p) => {}   // p de 0 a 1
     });
   ============================================================ */
(function () {
  'use strict';

  const FRAME = 1152;          // tamanho de frame do MP3
  const YIELD_A_CADA = 100;    // cede o thread a cada N frames (mantém a UI viva)

  function f32ParaInt16Mono(buffer) {
    const len = buffer.length;
    const c0 = buffer.getChannelData(0);
    const c1 = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : null;
    const pcm = new Int16Array(len);
    for (let i = 0; i < len; i++) {
      let s = c1 ? (c0[i] + c1[i]) * 0.5 : c0[i];
      if (s > 1) s = 1; else if (s < -1) s = -1;
      pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return pcm;
  }

  async function paraMp3(arquivo, opts = {}) {
    const { kbps = 128, onProgress } = opts;
    if (typeof lamejs === 'undefined' || !lamejs.Mp3Encoder) {
      throw new Error('Codificador mp3 não carregou.');
    }

    const arrayBuffer = await arquivo.arrayBuffer();
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    let audioBuf;
    try {
      audioBuf = await ctx.decodeAudioData(arrayBuffer);
    } finally {
      if (ctx.close) ctx.close();
    }

    const sampleRate = audioBuf.sampleRate;     // 44100/48000 (decodeAudioData reamostra p/ o contexto)
    const pcm = f32ParaInt16Mono(audioBuf);
    const total = pcm.length;

    const enc = new lamejs.Mp3Encoder(1, sampleRate, kbps);
    const partes = [];
    let frames = 0;
    for (let i = 0; i < total; i += FRAME) {
      const bloco = enc.encodeBuffer(pcm.subarray(i, i + FRAME));
      if (bloco.length) partes.push(bloco);
      if (++frames % YIELD_A_CADA === 0) {
        if (onProgress) onProgress(Math.min(0.99, i / total));
        await new Promise((r) => setTimeout(r)); // não trava a aba
      }
    }
    const fim = enc.flush();
    if (fim.length) partes.push(fim);
    if (onProgress) onProgress(1);

    const blob = new Blob(partes, { type: 'audio/mpeg' });
    const nome = arquivo.name.replace(/\.[^.]+$/, '') + '.mp3';
    return { file: new File([blob], nome, { type: 'audio/mpeg' }), duracao: audioBuf.duration };
  }

  window.AudioMp3 = { paraMp3 };
})();
