/*
 * HAND — IBC 2024 video player (click-to-play facade)
 * Used by: hand-id.org/ (homepage section) and hand-id.org/ibc-2024
 *
 * Nothing loads until the visitor clicks. On click it tries the
 * self-hosted MP4 (data-mp4, served from Netlify's CDN — no ads, no
 * "more videos" wall). If that file is missing or fails, it falls back
 * to a privacy-enhanced youtube-nocookie.com embed (data-yt), so the
 * page works before and after the MP4 is uploaded to /media/.
 *
 * Markup:
 *   <div class="ibc-player" data-mp4="/media/hand-ibc2024-720p.mp4"
 *        data-yt="196N7OTp9As" data-loc="home" data-title="...">
 *     <button class="ibc-facade" type="button" aria-label="Play video">
 *       <img src="/media/hand-ibc2024-poster.jpg" alt="...">
 *       <span class="ibc-play" aria-hidden="true">&#9654;</span>
 *       <span class="ibc-dur">1:33</span>
 *     </button>
 *   </div>
 */
(function () {
  var YT_THUMB = function (id) { return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'; };

  function track(el, how) {
    try { if (window.gtag) window.gtag('event', 'ibc_video_play', { location: el.getAttribute('data-loc') || '', source: how }); } catch (e) {}
  }

  function toYouTube(el) {
    if (el.__ibcYT) return;
    el.__ibcYT = true;
    var id = el.getAttribute('data-yt');
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
    f.title = el.getAttribute('data-title') || 'Video';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.setAttribute('allowfullscreen', '');
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    el.innerHTML = '';
    el.appendChild(f);
    track(el, 'youtube');
  }

  function play(el) {
    var mp4 = el.getAttribute('data-mp4');
    if (!mp4) return toYouTube(el);
    var img = el.querySelector('.ibc-facade img');
    var v = document.createElement('video');
    v.controls = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.preload = 'auto';
    if (img && img.currentSrc) v.poster = img.currentSrc;
    var s = document.createElement('source');
    s.src = mp4;
    s.type = 'video/mp4';
    s.addEventListener('error', function () { toYouTube(el); });
    v.addEventListener('error', function () { toYouTube(el); });
    v.appendChild(s);
    el.innerHTML = '';
    el.appendChild(v);
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* autoplay blocked: controls remain */ });
    track(el, 'self-hosted');
  }

  function mount(el) {
    var btn = el.querySelector('.ibc-facade');
    var img = btn && btn.querySelector('img');
    if (img) {
      img.addEventListener('error', function onErr() {
        img.removeEventListener('error', onErr);
        img.src = YT_THUMB(el.getAttribute('data-yt'));
      });
      if (img.complete && img.naturalWidth === 0) img.src = YT_THUMB(el.getAttribute('data-yt'));
    }
    if (btn) btn.addEventListener('click', function () { play(el); });
  }

  function init() { document.querySelectorAll('.ibc-player').forEach(mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
