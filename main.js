(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Intro animation starts once fonts are ready (or after a short fallback).
  var started = false;
  function start() { if (!started) { started = true; root.classList.add('loaded'); } }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { requestAnimationFrame(start); });
  setTimeout(start, 900);

  // Year
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // ---------- Theme ----------
  var themeBtn = document.querySelector('.theme-toggle');
  var themeLabel = document.querySelector('.theme-label');
  function currentTheme() {
    return root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  function syncLabel() { if (themeLabel) themeLabel.textContent = currentTheme() === 'dark' ? 'Light' : 'Dark'; }
  syncLabel();
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncLabel();
  });

  // ---------- Mobile menu ----------
  var menu = document.getElementById('menu');
  var menuBtn = document.querySelector('.menu-toggle');
  function setMenu(open) {
    if (!menu) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
    document.querySelector('.site-header').classList.toggle('menu-open', open);
    if (open) { menu.hidden = false; requestAnimationFrame(function () { menu.classList.add('open'); }); }
    else { menu.classList.remove('open'); setTimeout(function () { if (!menu.classList.contains('open')) menu.hidden = true; }, 600); }
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
  if (menu) menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuBtn && menuBtn.getAttribute('aria-expanded') === 'true') setMenu(false); });

  // ---------- Copy email ----------
  var toast = document.querySelector('.toast');
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
  }
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var text = b.getAttribute('data-copy');
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { showToast('Email copied'); }, function () { showToast(text); });
      else showToast(text);
    });
  });

  // ---------- Scroll-linked: progress bar, header, timeline, parallax ----------
  var header = document.querySelector('.site-header');
  var rail = document.querySelector('.rail');
  var bar = document.querySelector('.progress span');
  var dark = document.querySelector('.panel-dark');
  var timeline = document.querySelector('.timeline');
  var roles = document.querySelectorAll('.role');
  var contours = document.querySelectorAll('.contours');
  var ticking = false;

  function onScroll() {
    ticking = false;
    var sy = window.scrollY, vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    if (bar) bar.style.setProperty('--p', max > 0 ? (sy / max).toFixed(4) : 0);

    header.classList.toggle('scrolled', sy > 8);
    header.classList.toggle('compact', sy > vh * 0.6);

    if (dark) {
      var r = dark.getBoundingClientRect();
      var onDark = r.top < 40 && r.bottom > 40;
      header.classList.toggle('on-dark', onDark);
      if (rail) rail.classList.toggle('on-dark', r.top < vh / 2 && r.bottom > vh / 2);
    }

    if (timeline) {
      var t = timeline.getBoundingClientRect();
      var mark = vh * 0.55;
      var p = Math.min(1, Math.max(0, (mark - t.top) / t.height));
      timeline.style.setProperty('--tl', p.toFixed(4));
      roles.forEach(function (el) {
        el.classList.toggle('lit', el.getBoundingClientRect().top + 48 < mark);
      });
    }

    if (!reduce) contours.forEach(function (c) {
      var pr = c.parentElement.getBoundingClientRect();
      c.style.setProperty('--py', (pr.top * -0.12).toFixed(1) + 'px');
    });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal, .section-title, .figures, .footer-name').forEach(function (el) { el.classList.add('in'); });
    return;
  }

  // ---------- Count-up numbers ----------
  function countUp(el) {
    var to = parseFloat(el.getAttribute('data-to'));
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    if (reduce) { el.textContent = to.toFixed(dec); return; }
    var t0 = null, dur = 1400;
    function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      el.textContent = (to * e).toFixed(dec);
      if (k < 1) requestAnimationFrame(step);
    }
    el.textContent = (0).toFixed(dec);
    requestAnimationFrame(step);
  }

  // ---------- Reveal on view ----------
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      el.classList.add('in');
      el.querySelectorAll('.count').forEach(countUp);
      if (el.matches('.reveal') && el.querySelector('.words')) {
        el.querySelectorAll('.words li').forEach(function (li, i) { li.style.transitionDelay = (0.15 + i * 0.045) + 's'; });
      }
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  document.querySelectorAll('.reveal, .section-title, .figures, .footer-name').forEach(function (el) { io.observe(el); });

  // ---------- Active section for nav + rail ----------
  var navLinks = {};
  document.querySelectorAll('.nav a, .rail a').forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    (navLinks[id] = navLinks[id] || []).push(a);
  });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      Object.keys(navLinks).forEach(function (k) { navLinks[k].forEach(function (a) { a.classList.remove('active'); }); });
      (navLinks[e.target.id] || []).forEach(function (a) { a.classList.add('active'); });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });
})();
