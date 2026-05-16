/* Aplica .light-mode no <html> ANTES de qualquer CSS pintar.
   Inclua este script no <head>, antes do primeiro <link rel="stylesheet">.
   Páginas que devem ficar dark-only (landing/login/cadastro) declaram
   <meta name="pbm-force-dark" content="1"> e o boot ignora a preferência. */
(function () {
  try {
    if (document.querySelector('meta[name="pbm-force-dark"]')) {
      document.documentElement.classList.remove('light-mode');
      return;
    }
    var p = localStorage.getItem('pbm-theme') || 'dark';
    var isLight = p === 'light' || (p === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches);
    if (isLight) document.documentElement.classList.add('light-mode');
  } catch (e) { /* localStorage indisponível */ }
})();
