/*
 * PBM Rich Text - modulo compartilhado (v2)
 * --------------------------------------------------------------
 * Editor: Quill 2.x (CDN)
 * Sanitizacao: DOMPurify 3.x (CDN)
 * Toolbar: B I U | listas | sub/sup | cor texto | cor fundo | limpar
 *
 * API publica (window.RichText):
 *   - ensureLoaded()                Promise - carrega Quill+DOMPurify
 *   - ensurePurify()                Promise - so DOMPurify (telas read-only)
 *   - mountField(id, opts)          monta editor no lugar de um input/textarea
 *                                   por id; IDEMPOTENTE; remove o input do DOM
 *   - get(id)                       Quill editor associado a um id
 *   - getHTML(idOrEditor)           HTML sanitizado, '' se vazio
 *   - setHTML(idOrEditor, html)     seta conteudo
 *   - getInline(idOrEditor)         como getHTML, mas tira <p> externo
 *   - destroy(id)                   limpa editor e libera id
 *   - sanitize(html)                DOMPurify com allowlist PBM
 *   - render(html)                  HTML pronto p/ innerHTML em bloco
 *   - renderInline(html)            idem mas remove <p> wrapper externo
 *   - renderInto(el, html)          atalho block
 *   - renderInlineInto(el, html)    atalho inline
 *   - toPlainText(html)             extrai texto puro preservando quebras
 *   - normalizeForCompare(html)     plain text colapsado p/ diff
 */
(function () {
  'use strict';

  if (window.RichText) return;

  const QUILL_CSS = 'https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css';
  const QUILL_JS  = 'https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js';
  const PURIFY_JS = 'https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js';

  const PURIFY_CFG = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ol', 'ul', 'li', 'sup', 'sub', 'span', 'img'],
    ALLOWED_ATTR: ['class', 'style', 'src', 'alt'],
  };

  // Whitelist de origens permitidas para <img src="..."> dentro do comentario/justificativa.
  // Aceita apenas URLs do Supabase Storage do projeto (mesmos buckets que ja servem imagens de questao).
  const IMG_SRC_REGEX = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\//i;
  let _purifyHookInstalado = false;
  function instalarHookImg() {
    if (_purifyHookInstalado || !window.DOMPurify) return;
    window.DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
      if (node.nodeName === 'IMG' && data.attrName === 'src') {
        if (!IMG_SRC_REGEX.test(String(data.attrValue || ''))) data.keepAttr = false;
      }
    });
    _purifyHookInstalado = true;
  }

  // Sem destaque alem do vermelho vivo do brand. Texto padrao herda do tema
  // (preto no light, branco no dark) automaticamente.
  const PALETA_TEXTO = ['#C0270F'];

  const TOOLBAR_FULL = [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'super' }, { script: 'sub' }],
    [{ color: PALETA_TEXTO }],
    ['image'],
    ['clean'],
  ];

  const TOOLBAR_INLINE = [
    ['bold', 'italic', 'underline'],
    [{ color: PALETA_TEXTO }],
    [{ script: 'super' }, { script: 'sub' }],
  ];

  const _editors = new Map();
  let _loadingPromise = null;
  let _purifyPromise  = null;

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
      if (!window.Quill)     throw new Error('Quill nao carregou.');
      if (!window.DOMPurify) throw new Error('DOMPurify nao carregou.');
      instalarHookImg();
    });
    return _loadingPromise;
  }

  function ensurePurify() {
    if (window.DOMPurify) { instalarHookImg(); return Promise.resolve(); }
    if (_purifyPromise) return _purifyPromise;
    _purifyPromise = loadScript(PURIFY_JS).then(() => {
      if (!window.DOMPurify) throw new Error('DOMPurify nao carregou.');
      instalarHookImg();
    });
    return _purifyPromise;
  }

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
    // Fallback se DOMPurify nao carregou: conteudo vem de admin (trusted),
    // entao retorna HTML cru em vez de escapar - evita "<p>" literal num
    // race condition de cold start.
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

  // Converte HTML em texto puro preservando quebras de bloco/<br>.
  // Usado pra carregar alternativa (textarea simples) que possa ter sido
  // salva como HTML antes desta refatoracao.
  function toPlainText(html) {
    if (!html) return '';
    const s = String(html);
    if (!/<[a-z]/i.test(s)) return s;
    return s
      .replace(/<\/(p|li|div|h[1-6])>\s*/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<li[^>]*>/gi, '* ')
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
    const cleaned = window.DOMPurify ? sanitize(s) : s;
    const tmp = document.createElement('div');
    tmp.innerHTML = cleaned;
    return (tmp.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function _resolve(idOrEditor) {
    if (!idOrEditor) return null;
    if (typeof idOrEditor === 'string') {
      const rec = _editors.get(idOrEditor);
      return rec ? rec.quill : null;
    }
    return idOrEditor;
  }

  function mountField(id, opts = {}) {
    if (!window.Quill) {
      throw new Error('Quill nao carregado. Chame await RichText.ensureLoaded() antes.');
    }
    if (_editors.has(id)) {
      const rec = _editors.get(id);
      if (opts.initial != null) setHTML(rec.quill, opts.initial);
      return rec.quill;
    }

    const input = document.getElementById(id);
    if (!input) throw new Error('RichText.mountField: elemento #' + id + ' nao encontrado');

    const oneLine = !!opts.oneLine;
    const placeholder = opts.placeholder || input.placeholder || '';
    const initialValue = opts.initial != null ? opts.initial : (input.value || '');

    const host = document.createElement('div');
    host.className = 'rt-host';
    if (oneLine) host.classList.add('rt-oneline');
    host.dataset.rtId = id;

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
      formats: ['bold', 'italic', 'underline', 'list', 'script', 'color', 'image'],
    });

    if (oneLine) {
      quill.keyboard.addBinding({ key: 13 }, () => false);
      quill.keyboard.addBinding({ key: 13, shiftKey: true }, () => false);
    }

    // Handler customizado de imagem: faz upload via callback (que retorna {ok,url,erro})
    // antes de inserir o <img> — evita base64 inline gigante no banco.
    if (!oneLine && typeof opts.imageUploader === 'function') {
      const tb = quill.getModule('toolbar');
      tb.addHandler('image', () => {
        const file = document.createElement('input');
        file.type = 'file';
        file.accept = 'image/jpeg,image/png,image/webp';
        file.onchange = async () => {
          const f = file.files && file.files[0];
          if (!f) return;
          const range = quill.getSelection(true);
          try {
            const r = await opts.imageUploader(f);
            if (!r || !r.ok || !r.url) {
              alert('Falha ao enviar imagem: ' + ((r && r.erro) || 'erro desconhecido'));
              return;
            }
            quill.insertEmbed(range.index, 'image', r.url, 'user');
            quill.setSelection(range.index + 1, 0, 'user');
          } catch (err) {
            alert('Falha ao enviar imagem: ' + (err && err.message || err));
          }
        };
        file.click();
      });
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
    toPlainText,
    normalizeForCompare,
    escapeHtml,
    pareceHTML,
    stripOuterP,
  };
})();
