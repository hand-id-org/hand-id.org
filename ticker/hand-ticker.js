/*
 * HAND Registry Live Ticker — shared script
 * Hosted once at: https://hand-id.org/ticker/hand-ticker.js
 * Referenced by:  hand-id.org, humandigital.tech, handfound.org
 *
 * Reads the live object count from the Netlify proxy function
 * (netlify/functions/get-ticker-data.js, also hosted on hand-id.org)
 * and animates any element on the page tagged with [data-hand-ticker]
 * from its static fallback value up to the live count.
 *
 * Because this file is shared, updating it once updates the ticker
 * behavior on all three sites simultaneously — no per-site edits needed
 * for future tuning (refresh interval, animation, formatting, etc).
 *
 * Usage — three modes, chosen per element via data-hand-ticker:
 *
 *   data-hand-ticker="k"
 *     Replaces the element's full text with "272K+" / "1.2M+" style.
 *     Use on elements where the whole string is one visual unit.
 *
 *   data-hand-ticker="k-num"
 *     Replaces only the numeric portion (e.g. the "145" inside
 *     <em>145</em>K+). Looks for a sibling element with class
 *     "tick-suffix" and updates its K+/M+ label too. Use this when
 *     the number and suffix are styled differently (e.g. two-tone
 *     color treatment) and must stay in separate DOM nodes.
 *
 *   data-hand-ticker="exact"
 *     Replaces the element's full text with the exact, comma-formatted
 *     number (e.g. "272,007"). Use in editorial/citation contexts
 *     where precision reads as more credible than a rounded shorthand.
 *
 * Every mode seeds its start-of-animation value from data-count (if
 * present) or from the element's existing static text, so the page
 * never flashes "0" before the live figure loads — it always counts
 * up from whatever fallback number was hardcoded in the HTML.
 */
(function () {
  var ENDPOINT = 'https://hand-id.org/.netlify/functions/get-ticker-data';
  var REFRESH_MS = 120000; // 2 minutes
  var ANIMATE_MS = 1200;

  function easeOutCubic(p) {
    return 1 - Math.pow(1 - p, 3);
  }

  // Formats a raw count into { num, suffix } for K+/M+ shorthand modes.
  // Automatically promotes to M+ once the registry crosses 1,000,000 —
  // no manual site edits needed when that milestone hits.
  function kLabel(n) {
    if (n >= 1000000) {
      var m = n / 1000000;
      var numStr = m >= 10 ? String(Math.round(m)) : m.toFixed(1).replace(/\.0$/, '');
      return { num: numStr, suffix: 'M+' };
    }
    return { num: String(Math.floor(n / 1000)), suffix: 'K+' };
  }

  function parseSeed(el, mode) {
    var dc = el.getAttribute('data-count');
    if (dc) {
      var n = parseFloat(dc);
      if (!isNaN(n)) return mode === 'exact' ? n : n * 1000;
    }
    var digits = (el.textContent || '').replace(/[^0-9.]/g, '');
    if (digits) {
      var parsed = parseFloat(digits);
      if (!isNaN(parsed)) return mode === 'exact' ? parsed : parsed * 1000;
    }
    return null;
  }

  function animateNumber(from, to, onFrame, onDone, duration) {
    var t0 = performance.now();
    function frame(now) {
      var p = Math.min((now - t0) / duration, 1);
      var val = from + (to - from) * easeOutCubic(p);
      onFrame(val);
      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        onDone();
      }
    }
    requestAnimationFrame(frame);
  }

  function applyTotal(total) {
    var targets = document.querySelectorAll('[data-hand-ticker]');
    targets.forEach(function (el) {
      var mode = el.getAttribute('data-hand-ticker');
      var start = el.__handSeeded ? el.__handLastValue : parseSeed(el, mode);
      if (start === null || start === undefined) start = Math.max(0, total - 5000);

      if (start === total && el.__handSeeded) return; // nothing changed since last poll

      if (mode === 'exact') {
        animateNumber(start, total, function (val) {
          el.textContent = Math.round(val).toLocaleString();
        }, function () {
          el.textContent = total.toLocaleString();
        }, ANIMATE_MS);
      } else if (mode === 'k-num') {
        var suffixEl = el.parentElement ? el.parentElement.querySelector('.tick-suffix') : null;
        animateNumber(start, total, function (val) {
          var label = kLabel(Math.round(val));
          el.textContent = label.num;
          if (suffixEl) suffixEl.textContent = label.suffix;
        }, function () {
          var label = kLabel(total);
          el.textContent = label.num;
          if (suffixEl) suffixEl.textContent = label.suffix;
        }, ANIMATE_MS);
      } else { // 'k' default
        animateNumber(start, total, function (val) {
          var label = kLabel(Math.round(val));
          el.textContent = label.num + label.suffix;
        }, function () {
          var label = kLabel(total);
          el.textContent = label.num + label.suffix;
        }, ANIMATE_MS);
      }

      el.__handSeeded = true;
      el.__handLastValue = total;
    });
  }

  function fetchAndApply() {
    fetch(ENDPOINT, { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('Ticker endpoint returned ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (typeof data.total === 'number' && data.total > 0) {
          applyTotal(data.total);
        }
      })
      .catch(function (err) {
        // Fail silently in the UI — static fallback text already in the
        // HTML stays visible. Log for debugging only.
        console.error('HAND ticker: could not fetch live count, showing static fallback.', err);
      });
  }

  function init() {
    if (!document.querySelector('[data-hand-ticker]')) return; // nothing to do on this page
    fetchAndApply();
    setInterval(fetchAndApply, REFRESH_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
