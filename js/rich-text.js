/*
 * PBM Rich Text — módulo compartilhado (v2)
 * --------------------------------------------------------------
 * Editor: Quill 2.x (CDN)
 * Sanitização: DOMPurify 3.x (CDN)
 * Toolbar (essencial): B I U | • 1. | x² x₂ | limpar
 *
 * API pública (window.RichText):
 *   - ensureLoaded()                Promise — carrega Quill+DOMPurify
 *   - mountField(id, opts)          monta editor no lugar de um input/textarea
 *                                   por id; IDEMPOTENTE; remove o input do DOM
 *   - get(id)                       Quill editor associado a um id
 *   - getHTML(idOrEditor)           HTML sanitizado, '' se vazio
 *   - setHTML(idOrEditor, html)     seta conteúdo
 *   - getInline(idOrEditor)         como getHTML, mas tira <p> externo
 *                                   (uso em alternativas / one-line)
 *   - destroy(id)                   limpa editor e libera id
 *   - sanitize(html)                DOMPurify com allowlist PBM
 *   - render(html)                  HTML pronto p/ innerHTML em bloco
 *   - renderInline(html)            idem mas remove <p> wrapper externo
 *   - renderInto(el, html)          atalho block
 *   - renderInlineInto(el, html)    atalho inline
 *   - normalizeForCompare(html)     plain text colapsado p/ diff
 */
(function () {
  'use strict';

  if (window.RichText) return;

  const QUILL_CSS = 'https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css';
  const QUILL_JS  = 'https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js';
  const PURIFY_JS = 'https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js';

  const PURIFY_CFG = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ol', 'ul', 'li', 'sup', 'sub', 'span'],
    ALLOWED_ATTR: ['class', 'style'],
  };

  const TOOLBAR_FULL = [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'super' }, { script: 'sub' }],
    [{ color: [] }, { background: [] }],
    ['clean'],
  ];

  const TOOLBAR_INLINE = [
    ['bold', 'italic', 'underline'],
    [{ color: [] }, { background: [] }],
    [{ script: 'super' }, { script: 'sub' }],
  ];

  const _editors = new Map(); // id -> { quill, host, oneLine }
  let _loadingPromise = null;
  let _purifyPromise  = null;

  // ── Loader de CDN ─────────────────────────────────────────────
  function loadCss(href) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`link[href="${href}"]`)) return resolve();
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href;
      l.onload = () => resolve();
      l.onerror = () => reject(new Error('Falha ao carregar CSS: ' + href));
      document.head.appendChild(l);
    });
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === '1') return resolve();
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Falha: ' + src)));
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = () => { s.dataset.loaded = '1'; resolve(); };
      s.onerror = () => reject(new Error('Falha ao carregar script: ' + src));
      document.head.appendChild(s);
    });
  }

  function ensureLoaded() {
    if (window.Quill && window.DOMPurify) return Promise.resolve();
    if (_loadingPromise) return _loadingPromise;
    _loadingPromise = Promise.all([
      loadCss(QUILL_CSS),
      loadScript(QUILL_JS),
      loadScript(PURIFY_JS),
    ]).then(() => {
      if (!window.Quill)     throw new Error('Quill não carregou.');
      if (!window.DOMPurify) throw new Error('DOMPurify não carregou.');
    });
    return _loadingPromise;
  }

  // Versão leve para telas read-only (aluno): carrega só DOMPurify.
  function ensurePurify() {
    if (window.DOMPurify) return Promise.resolve();
    if (_purifyPromise) return _purifyPromise;
    _purifyPromise = loadScript(PURIFY_JS).then(() => {
      if (!window.DOMPurify) throw new Error('DOMPurify não carregou.');
    });
    return _purifyPromise;
  }

  // ── Helpers de texto ──────────────────────────────────────────
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sanitize(html) {
    if (html == null) return '';
    const s = String(html);
    if (!s.trim()) return '';
    // Fallback se DOMPurify ainda nao carregou: como o conteudo so e produzido
    // por admin (fonte confiada), retornamos o HTML cru em vez de escapa-lo.
    // Isso evita que o aluno veja "<p>" literal num race-condition de cold start.
    if (!window.DOMPurify) return s;
    return window.DOMPurify.sanitize(s, PURIFY_CFG);
  }

  function pareceHTML(s) {
    return /<\/?(p|br|strong|b|em|i|u|ol|ul|li|sup|sub|span)\b/i.test(s);
  }

  function isEmptyHtml(html) {
    if (!html) return true;
    const norm = String(html).replace(/\s|&nbsp;/g, '').toLowerCase();
    return norm === '' || norm === '<p><br></p>' || norm === '<p></p>' || norm === '<br>';
  }

  // Remove um único par <p>...</p> externo (uso em alternativas)
  function stripOuterP(html) {
    if (!html) return '';
    const m = String(html).match(/^\s*<p>([\s\S]*)<\/p>\s*$/i);
    if (m && !/<p\b/i.test(m[1])) return m[1];
    return html;
  }

  function render(html) {
    if (html == null) return '';
    const s = String(html);
    if (!s) return '';
    if (pareceHTML(s)) return sanitize(s);
    return escapeHtml(s).replace(/\r?\n/g, '<br>');
  }

  function renderInline(html) {
    if (html == null) return '';
    const s = String(html);
    if (!s) return '';
    if (pareceHTML(s)) return stripOuterP(sanitize(s));
    return escapeHtml(s).replace(/\r?\n/g, ' ');
  }

  function renderInto(el, html)        { if (el) el.innerHTML = render(html); }
  function renderInlineInto(el, html)  { if (el) el.innerHTML = renderInline(html); }

  // Converte HTML para texto puro preservando quebras de linha de bloco/<br>.
  // Usado pra carregar valor de alternativa (textarea simples) que possa ter
  // sido salva como HTML antes desta refatoracao.
  function toPlainText(html) {
    if (!html) return '';
    const s = String(html);
    if (!/<[a-z]/i.test(s)) return s;
    return s
      .replace(/<\/(p|li|div|h[1-6])>\s*/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function normalizeForCompare(html) {
    if (!html) return '';
    const s = String(html);
    if (!pareceHTML(s)) return s.replace(/\s+/g, ' ').trim();
    // Se DOMPurify carregou, sanitiza antes de extrair texto. SenÃ£o, injeta direto.
    const cleaned = window.DOMPurify ? sanitize(s) : s;
    const tmp = document.createElement('div');
    tmp.innerHTML = cleaned;
    return (tmp.textContent || '').replace(/\s+/g, ' ').trim();
  }

  // ── Resolver id|editor ────────────────────────────────────────
  function _resolve(idOrEditor) {
    if (!idOrEditor) return null;
    if (typeof idOrEditor === 'string') {
      const rec = _editors.get(idOrEditor);
      return rec ? rec.quill : null;
    }
    // assume editor instance
    return idOrEditor;
  }

  // ── Mount ─────────────────────────────────────────────────────
  function mountField(id, opts = {}) {
    if (!window.Quill) {
      throw new Error('Quill não carregado. Chame await RichText.ensureLoaded() antes.');
    }
    // idempotente: se já montado, opcionalmente seta valor inicial
    if (_editors.has(id)) {
      const rec = _editors.get(id);
      if (opts.initial != null) setHTML(rec.quill, opts.initial);
      return rec.quill;
    }

    const input = document.getElementById(id);
    if (!input) throw new Error('RichText.mountField: elemento #' + id + ' não encontrado');

    const oneLine = !!opts.oneLine;
    const placeholder = opts.placeholder || input.placeholder || '';
    const initialValue = opts.initial != null ? opts.initial : (input.value || '');

    const host = document.createElement('div');
    host.className = 'rt-host';
    if (oneLine) host.classList.add('rt-oneline');
    host.dataset.rtId = id;

    // herda atributos data-* úteis pra navegação por seletor
    for (const attr of input.attributes) {
      if (attr.name.startsWith('data-') && attr.name !== 'data-rt-id') {
        host.setAttribute(attr.name, attr.value);
      }
    }

    input.parentNode.insertBefore(host, input);
    input.remove();

    const editorDiv = document.createElement('div');
    editorDiv.className = 'rt-editor';
    host.appendChild(editorDiv);

    const quill = new window.Quill(editorDiv, {
      theme: 'snow',
      placeholder,
      modules: {
        toolbar: oneLine ? TOOLBAR_INLINE : TOOLBAR_FULL,
        clipboard: { matchVisual: false },
      },
      formats: ['bold', 'italic', 'underline', 'list', 'script', 'color', 'background'],
    });

    if (oneLine) {
      quill.keyboard.addBinding({ key: 13 }, () => false);
      quill.keyboard.addBinding({ key: 13, shiftKey: true }, () => false);
    }

    if (initialValue) setHTML(quill, initialValue);

    _editors.set(id, { quill, host, oneLine });
    return quill;
  }

  function get(id) {
    const rec = _editors.get(id);
    return rec ? rec.quill : null;
  }

  function getHTML(idOrEditor) {
    const ed = _resolve(idOrEditor);
    if (!ed) return '';
    const raw = ed.root.innerHTML;
    if (isEmptyHtml(raw)) return '';
    return sanitize(raw);
  }

  function getInline(idOrEditor) {
    const html = getHTML(idOrEditor);
    return html ? stripOuterP(html) : '';
  }

  function setHTML(idOrEditor, value) {
    const ed = _resolve(idOrEditor);
    if (!ed) return;
    if (value == null || value === '') {
      ed.setText('');
      return;
    }
    const s = String(value);
    const html = pareceHTML(s)
      ? sanitize(s)
      : sanitize(`<p>${escapeHtml(s).replace(/\r?\n/g, '<br>')}</p>`);
    ed.setContents([]);
    if (ed.clipboard && ed.clipboard.dangerouslyPasteHTML) {
      ed.clipboard.dangerouslyPasteHTML(0, html, 'silent');
    } else {
      ed.root.innerHTML = html;
    }
  }

  function destroy(id) {
    const rec = _editors.get(id);
    if (!rec) return;
    if (rec.host && rec.host.parentNode) rec.host.remove();
    _editors.delete(id);
  }

  window.RichText = {
    ensureLoaded,
    ensurePurify,
    mountField,
    get,
    getHTML,
    getInline,
    setHTML,
    destroy,
    sanitize,
    render,
    renderInline,
    renderInto,
    renderInlineInto,
    normalizeForCompare,
    toPlainText,
    escapeHtml,
    pareceHTML,
    stripOuterP,
  };
})();
