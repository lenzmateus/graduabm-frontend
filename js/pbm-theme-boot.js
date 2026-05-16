/* Aplica .light-mode no <html> ANTES de qualquer CSS pintar.
   Inclua este script no <head>, antes do primeiro <link rel="stylesheet">. */
(function () {
  try {
    var p = localStorage.getItem('pbm-theme') || 'dark';
    var isLight = p === 'light' || (p === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches);
    if (isLight) document.documentElement.classList.add('light-mode');
  } catch (e) { /* localStorage indisponível */ }
})();
