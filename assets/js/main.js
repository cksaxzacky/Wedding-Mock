/* =========================================================
   main.js · language toggle, countdown, mobile nav, gallery lightbox
   ========================================================= */

(function () {
  'use strict';

  const STORAGE_KEY = 'wedding.lang';
  const DEFAULT_LANG = 'th';

  /* ---------- i18n ---------- */
  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  function setLang(lang) {
    if (!window.I18N[lang]) return;
    localStorage.setItem(STORAGE_KEY, lang);
    applyLang(lang);
  }

  function applyLang(lang) {
    const dict = window.I18N[lang] || {};
    document.documentElement.setAttribute('lang', lang);

    // Translate elements that have data-i18n
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] === undefined) return;
      // <title> / <meta content="..."> handled separately
      if (el.tagName === 'TITLE') {
        document.title = dict[key];
      } else if (el.tagName === 'META') {
        el.setAttribute('content', dict[key]);
      } else {
        el.textContent = dict[key];
      }
    });

    // Update lang toggle visual state
    document.querySelectorAll('.lang-toggle [data-lang]').forEach((el) => {
      el.classList.toggle('active', el.getAttribute('data-lang') === lang);
    });
  }

  function initLangToggle() {
    const btn = document.getElementById('langToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const current = getLang();
      setLang(current === 'th' ? 'en' : 'th');
    });
  }

  /* ---------- Countdown ---------- */
  function initCountdown() {
    const cd = document.getElementById('countdown');
    if (!cd) return;
    const target = new Date(cd.getAttribute('data-target')).getTime();
    if (Number.isNaN(target)) return;

    const elD = document.getElementById('cd-days');
    const elH = document.getElementById('cd-hours');
    const elM = document.getElementById('cd-mins');
    const elS = document.getElementById('cd-secs');

    function tick() {
      const now = Date.now();
      let diff = Math.max(0, target - now);
      const d = Math.floor(diff / 86400000); diff -= d * 86400000;
      const h = Math.floor(diff / 3600000);  diff -= h * 3600000;
      const m = Math.floor(diff / 60000);    diff -= m * 60000;
      const s = Math.floor(diff / 1000);
      elD.textContent = String(d).padStart(2, '0');
      elH.textContent = String(h).padStart(2, '0');
      elM.textContent = String(m).padStart(2, '0');
      elS.textContent = String(s).padStart(2, '0');
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Mobile nav ---------- */
  function initMobileNav() {
    const burger = document.getElementById('navBurger');
    const nav = document.querySelector('.site-nav');
    if (!burger || !nav) return;
    burger.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => nav.classList.remove('open'))
    );
  }

  /* ---------- Gallery lightbox ---------- */
  function initLightbox() {
    const grid = document.getElementById('galleryGrid');
    const box = document.getElementById('lightbox');
    if (!grid || !box) return;

    const imgEl = document.getElementById('lightboxImg');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');

    const images = Array.from(grid.querySelectorAll('img'));
    let idx = 0;

    function open(i) {
      idx = i;
      imgEl.src = images[idx].src;
      imgEl.alt = images[idx].alt || '';
      box.classList.add('open');
      box.setAttribute('aria-hidden', 'false');
    }
    function close() {
      box.classList.remove('open');
      box.setAttribute('aria-hidden', 'true');
      imgEl.src = '';
    }
    function show(delta) {
      idx = (idx + delta + images.length) % images.length;
      imgEl.src = images[idx].src;
      imgEl.alt = images[idx].alt || '';
    }

    images.forEach((img, i) => img.addEventListener('click', () => open(i)));
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', () => show(-1));
    nextBtn.addEventListener('click', () => show(1));
    box.addEventListener('click', (e) => { if (e.target === box) close(); });
    document.addEventListener('keydown', (e) => {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(-1);
      else if (e.key === 'ArrowRight') show(1);
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    applyLang(getLang());
    initLangToggle();
    initCountdown();
    initMobileNav();
    initLightbox();
  });
})();
