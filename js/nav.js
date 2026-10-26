/* hand-id.org — top-nav dropdowns (Oct 26, 2026).
   Hover/focus opens on desktop (CSS); this adds click/tap toggling, outside-click and Escape to close,
   and aria-expanded state. The mobile menu groups are plain lists and need no script. */
(function () {
  var dds = document.querySelectorAll('.nav-links .dd');
  function closeAll(except) {
    dds.forEach(function (dd) {
      if (dd === except) return;
      dd.classList.remove('open');
      var b = dd.querySelector('.dd-btn'); if (b) b.setAttribute('aria-expanded', 'false');
    });
  }
  dds.forEach(function (dd) {
    var btn = dd.querySelector('.dd-btn');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var open = !dd.classList.contains('open');
      closeAll(dd);
      dd.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    dd.addEventListener('mouseleave', function () {
      dd.classList.remove('open'); btn.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.nav-links .dd')) closeAll(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
})();
