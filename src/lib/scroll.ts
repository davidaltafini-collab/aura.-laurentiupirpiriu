/**
 * Pe touch, scroll-ul nu se mai face pe document, ci pe #root (vezi index.css —
 * asta ține barele browserului fixe, ca viewport-ul să nu se mai redimensioneze).
 * Deci `window.scrollTo` nu mai are efect acolo. Helper-ul scrollează ambele:
 * pe desktop contează window, pe touch contează #root, iar apelul în plus e inofensiv.
 */
export function scrollToTop() {
  document.getElementById('root')?.scrollTo({ top: 0, behavior: 'instant' });
  window.scrollTo({ top: 0, behavior: 'instant' });
}
