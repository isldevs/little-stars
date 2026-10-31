/* global window, document */
// Synchronous, framework-independent theme bootstrap: run in <head> before styles.
(function () {
  var preference = 'system';
  try {
    var saved = JSON.parse(localStorage.getItem('little-stars:v1:theme'));
    if (saved === 'light' || saved === 'dark' || saved === 'system') preference = saved;
  } catch { /* Malformed or blocked storage falls back to the device preference. */ }
  var systemDark = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var resolved = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#1b211d' : '#fcfbf8');
})();
