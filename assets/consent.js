// Analytics consent for studio.ryst.in.
// Google Analytics is not loaded at all until the visitor accepts here; the
// gtag block in each page's <head> only queues a denied consent default. The choice is kept on this device (localStorage 'ryst_consent') and
// can be changed any time from the "Cookie choices" link in the footer.
// Essential storage (this choice, a draft booking on the device) needs no
// consent and is not affected.
(function () {
  var KEY = 'ryst_consent';
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  var GA = 'G-G00HG2N31H';
  function apply(v) {
    if (typeof gtag === 'function') gtag('consent', 'update', { analytics_storage: v === 'granted' ? 'granted' : 'denied' });
    // The Google script is only ever fetched once analytics is accepted.
    if (v === 'granted' && !document.getElementById('rystGtag')) {
      var sc = document.createElement('script'); sc.id = 'rystGtag'; sc.async = true;
      sc.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA; document.head.appendChild(sc);
    }
  }
  var css = '#rystConsent{position:fixed;left:16px;right:16px;bottom:16px;z-index:9000;max-width:440px;margin:0 auto 0 0;background:#1e1a17;color:#ede6d9;padding:18px 20px;font:16px/1.5 "Newsreader",Georgia,serif;box-shadow:0 12px 32px -12px rgba(0,0,0,.6)}'
    + '#rystConsent p{margin:0 0 12px}#rystConsent a{color:#ede6d9}'
    + '#rystConsent .row{display:flex;gap:8px;flex-wrap:wrap}'
    + '#rystConsent button{font:inherit;font-weight:500;min-height:44px;padding:0 18px;border:0;cursor:pointer;background:#2a2522;color:#ede6d9}'
    + '#rystConsent button.ok{background:#f8a61f;color:#171310}'
    + '#rystConsent button:active{transform:scale(.97)}'
    + '@media (min-width:600px){#rystConsent{left:24px;bottom:24px}}';
  function show() {
    if (document.getElementById('rystConsent')) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var box = document.createElement('div');
    box.id = 'rystConsent'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Analytics consent');
    box.innerHTML = '<p>We’d like to use Google Analytics to see how this site is used. No advertising cookies, nothing until you say so. <a href="/privacy-policy/">Privacy policy</a></p>'
      + '<div class="row"><button type="button" class="ok" data-c="granted">Accept analytics</button><button type="button" data-c="denied">Essential only</button></div>';
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-c]'); if (!b) return;
      set(b.dataset.c); apply(b.dataset.c); box.remove();
    });
    document.body.appendChild(box);
  }
  window.rystConsentOpen = function (e) { if (e) e.preventDefault(); show(); };
  document.addEventListener('click', function (e) { var a = e.target.closest('[data-consent-open]'); if (a) { e.preventDefault(); show(); } });
  var v = get();
  if (v === 'granted' || v === 'denied') apply(v); else show();
})();
