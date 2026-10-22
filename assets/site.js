// Public-site behaviour shared by every page.
(function () {
  // Compact header on scroll (the homepage's overlay nav runs its own toggle).
  var nav = document.querySelector('.nav:not(.nav-overlay)');
  if (nav) {
    var on = function () { nav.classList.toggle('scrolled', window.scrollY > 24); };
    document.addEventListener('scroll', on, { passive: true });
    on();
  }

  // Scroll reveal for inner pages (the homepage uses GSAP for this): each
  // group's parts rise in once, heading first, staggered ~70ms, with a strong
  // ease-out. Content is only hidden once we know we can animate it, so a
  // script failure never leaves anything invisible.
  if (document.querySelector('.nav-overlay')) return;
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var groups = [
    '.hero.small .inner > *', '.hero-fig',
    '.section-head > *', '.split > *', '.zones > *', '.usefor > *', '.plist > *',
    '.price-tables > *', '.price-note', '.faq-list > *', '.gallery-grid > *',
    '.booking-grid > *', '.info-grid > *', '.cta-band > *', '.legal > *'
  ];
  var els = [];
  groups.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el, i) { el._rvDelay = Math.min(i, 6) * 70; els.push(el); });
  });
  var vh = window.innerHeight;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; io.unobserve(el);
      el.classList.remove('rv');
      el.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }],
        { duration: 700, delay: el._rvDelay, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' });
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (el) {
    if (!el.getClientRects().length) return;               // not displayed (yet): never hide it
    var top = el.getBoundingClientRect().top;
    if (top < vh * 0.92 && !el.closest('.hero')) return;   // already on screen: leave it be
    el.classList.add('rv'); io.observe(el);
  });
})();
