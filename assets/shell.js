/* Studio RYST staff app shell. Every staff page includes assets/shell.css +
   this file and marks itself with <body data-shell="<page id>">. The shell
   draws the left sidebar (laptop), the drawer + bottom tabs (phone), shows
   only the modules the signed-in user has (GET /me), and covers a page the
   user hasn't been given. Pages that need to mount later (login.html's
   schedule view) use data-shell="manual" and call RystShell.mount(). */
(function () {
  if (window.RystShell) return;
  var PROXY = 'https://ryst-quss.onrender.com/studio';
  var ICONS = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/>',
    check: '<path d="M9 11.5l2.5 2.5L20 5.5"/><path d="M20 12.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    funnel: '<path d="M3 4.5h18l-7 8.2v5.8l-4 2v-7.8z"/>',
    camera: '<path d="M22 18.5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2h3.5l2-3h5l2 3H20a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="3.8"/>',
    users: '<path d="M16 20.5v-1.8a3.7 3.7 0 0 0-3.7-3.7H6.2a3.7 3.7 0 0 0-3.7 3.7v1.8"/><circle cx="9.2" cy="7.5" r="3.7"/><path d="M21.5 20.5v-1.8a3.7 3.7 0 0 0-2.8-3.6M15.6 3.9a3.7 3.7 0 0 1 0 7.2"/>',
    chart: '<path d="M3.5 3.5v17h17"/><path d="M7.5 15l4-4.2 3 3 5.5-6.3"/>',
    star: '<path d="M12 2.8l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.6l-5.8 3 1.1-6.4-4.7-4.6 6.5-.9z"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M19.3 14.9a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1h-.2a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
    tv: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    globe: '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5a14.5 14.5 0 0 1 0 19M12 2.5a14.5 14.5 0 0 0 0 19"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    receipt: '<path d="M5 2.5h14v19l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    wallet: '<path d="M20 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-1.5"/><path d="M21 9.5h-5a2.5 2.5 0 0 0 0 5h5z"/>',
    menu: '<path d="M4 6.5h16M4 12h16M4 17.5h16"/>',
    left: '<path d="M15 18l-6-6 6-6"/>',
    right: '<path d="M9 18l6-6-6-6"/>'
  };
  function icon(n, s) { s = s || 18; return '<svg class="rs-ic" viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[n] || '') + '</svg>'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // Modules match the ids the proxy uses (MODULE_IDS). Dashboard is everyone's.
  var NAV = [
    { title: 'Overview', items: [{ id: 'dashboard', label: 'Dashboard', href: 'dashboard.html', icon: 'grid' }] },
    { title: 'Operations', items: [
      { id: 'schedule', label: 'Schedule', href: 'login.html?view=schedule', icon: 'calendar', mod: 'schedule' },
      { id: 'tasks', label: 'Daily tasks', href: 'daily-tasks.html', icon: 'check', mod: 'tasks' },
      { id: 'quotes', label: 'Quotes', href: 'quote.html', icon: 'file', mod: 'quotes' },
      { id: 'pipeline', label: 'Leads & pipeline', href: 'pipeline.html', icon: 'funnel', mod: 'pipeline' },
      { id: 'equipment', label: 'Equipment', href: 'equipment.html', icon: 'camera', mod: 'equipment' }] },
    { title: 'Crew & expenses', items: [
      { id: 'crew', label: 'Crew', href: 'freelancers.html#crew', icon: 'users', mod: 'crew' },
      { id: 'crewinv', label: 'Crew invoices', href: 'freelancers.html#invoices', icon: 'receipt', mod: 'crew' },
      { id: 'expenses', label: 'Expenses', href: 'expenses.html', icon: 'wallet', mod: 'expenses' }] },
    { title: 'Insights', items: [
      { id: 'growth', label: 'Growth report', href: 'report.html', icon: 'chart', mod: 'growth' },
      { id: 'reviews', label: 'Reviews', href: 'reviews.html', icon: 'star', mod: 'reviews' }] },
    { title: 'Admin', items: [{ id: 'settings', label: 'Settings', href: 'settings.html', icon: 'gear', admin: true }] },
    { title: 'Links', items: [
      { id: 'tv', label: 'TV display', href: 'https://signage.ryst.in/', icon: 'tv', ext: true },
      { id: 'site', label: 'Website', href: 'https://studio.ryst.in/', icon: 'globe', ext: true }] }
  ];
  var TABS = ['dashboard', 'schedule', 'tasks', 'quotes'];
  var ALL_MODS = ['schedule', 'tasks', 'quotes', 'pipeline', 'equipment', 'crew', 'expenses', 'growth', 'reviews'];

  function token() { try { return localStorage.getItem('ryst_proxy_token') || ''; } catch (e) { return ''; } }
  function claims() {
    try {
      var p = (token().split('.')[0] || '').replace(/-/g, '+').replace(/_/g, '/');
      p += '='.repeat((4 - p.length % 4) % 4);
      return JSON.parse(atob(p)) || {};
    } catch (e) { return {}; }
  }
  var me = (function () {
    var c = claims(), role = c.role || localStorage.getItem('ryst_user_role') || 'coordinator';
    var base = { email: c.email || localStorage.getItem('ryst_user_email') || '', role: role, name: '', modules: ALL_MODS.slice() };
    try { var cached = JSON.parse(sessionStorage.getItem('rs_me') || 'null'); if (cached && cached.t === token().slice(-16)) return Object.assign(base, cached.me); } catch (e) {}
    return base;
  })();
  function allowed(item) {
    if (item.admin) return me.role === 'admin';
    return !item.mod || me.role === 'admin' || me.modules.indexOf(item.mod) >= 0;
  }
  function findItem(id) { for (var g = 0; g < NAV.length; g++) for (var i = 0; i < NAV[g].items.length; i++) if (NAV[g].items[i].id === id) return NAV[g].items[i]; return null; }

  var page = '', mounted = false, side, tabs;
  function navHTML() {
    return NAV.map(function (g) {
      var items = g.items.filter(allowed);
      if (!items.length) return '';
      return '<div class="rs-group"><div class="rs-gt">' + esc(g.title) + '</div>' + items.map(function (it) {
        return '<a class="rs-item' + (it.id === page ? ' on' : '') + '" href="' + esc(it.href) + '"' + (it.ext ? ' target="_blank" rel="noopener"' : '') + ' title="' + esc(it.label) + '"' + (it.id === page ? ' aria-current="page"' : '') + '>' + icon(it.icon) + '<span>' + esc(it.label) + '</span>' + (it.ext ? '<span class="rs-ext">↗</span>' : '') + '</a>';
      }).join('') + '</div>';
    }).join('');
  }
  function render() {
    var who = me.name || (me.email || '').split('@')[0] || 'Signed in';
    side.innerHTML =
      '<a class="rs-brand" href="dashboard.html" title="Dashboard"><img src="assets/logo-300.png" alt=""><span><b>Studio RYST</b><small>Control panel</small></span></a>' +
      '<nav class="rs-nav" aria-label="Main">' + navHTML() + '</nav>' +
      '<div class="rs-foot"><div class="rs-user" title="' + esc(me.email) + '"><div class="rs-av">' + esc(who.slice(0, 1)) + '</div><div class="rs-who"><b>' + esc(who) + '</b><small>' + esc(me.role) + '</small></div></div>' +
      '<div class="rs-btnrow"><button class="rs-fbtn" type="button" data-rs="logout" title="Log out">' + icon('logout', 16) + '<span>Log out</span></button>' +
      '<button class="rs-fbtn rs-collapse" type="button" data-rs="collapse" title="Collapse sidebar">' + icon(document.documentElement.classList.contains('rs-collapsed') ? 'right' : 'left', 16) + '</button></div></div>';
    tabs.innerHTML = TABS.map(findItem).filter(function (it) { return it && allowed(it); }).map(function (it) {
      return '<a class="rs-tab' + (it.id === page ? ' on' : '') + '" href="' + esc(it.href) + '">' + icon(it.icon, 21) + '<span>' + esc(it.label.split(' ')[0]) + '</span></a>';
    }).join('') + '<button class="rs-tab" type="button" data-rs="menu">' + icon('menu', 21) + '<span>More</span></button>';
    guard();
  }
  // Cover a page this user hasn't been given (the proxy also refuses the data
  // for modules it can enforce).
  function guard() {
    var it = findItem(page), old = document.getElementById('rsBlock');
    var ok = !it || allowed(it) || it.admin;   // admin pages show their own "Admins only" screen
    if (ok) { if (old) old.remove(); return; }
    if (old) return;
    var b = document.createElement('div'); b.id = 'rsBlock'; b.className = 'rs-block';
    b.innerHTML = '<div style="font-size:40px">🔒</div><b>No access to ' + esc(it.label) + '</b><p>Your account hasn’t been given this module. Ask an admin to turn it on in Settings → User Access.</p><a href="dashboard.html">Go to dashboard</a>';
    document.body.appendChild(b);
  }
  function setCollapsed(on, remember) {
    document.documentElement.classList.toggle('rs-collapsed', on);
    if (remember) try { localStorage.setItem('rs_collapsed', on ? '1' : '0'); } catch (e) {}
    if (mounted) render();
  }
  function logout() {
    ['ryst_proxy_token', 'ryst_user_email', 'ryst_user_role'].forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
    try { sessionStorage.removeItem('rs_me'); } catch (e) {}
    location.href = 'login.html';
  }
  function refreshMe() {
    var t = token(); if (!t) return;
    fetch(PROXY + '/me', { headers: { 'X-Token': t } }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !Array.isArray(d.modules)) return;
      me = Object.assign(me, { email: d.email || me.email, role: d.role || me.role, name: d.name || '', modules: d.modules });
      try { sessionStorage.setItem('rs_me', JSON.stringify({ t: t.slice(-16), me: { name: me.name, modules: me.modules, role: me.role, email: me.email } })); } catch (e) {}
      if (mounted) render();
      document.dispatchEvent(new CustomEvent('rs:me', { detail: me }));
    }).catch(function () {});
  }

  function mount(opts) {
    if (mounted) return;
    opts = opts || {};
    page = opts.page || document.body.getAttribute('data-shell') || '';
    mounted = true;
    var stored = null; try { stored = localStorage.getItem('rs_collapsed'); } catch (e) {}
    document.documentElement.classList.toggle('rs-collapsed', stored === '1' || (stored === null && window.innerWidth <= 1180 && window.innerWidth > 900));
    document.documentElement.classList.add('rs-on');
    side = document.createElement('aside'); side.className = 'rs-side'; side.setAttribute('aria-label', 'Studio RYST navigation');
    tabs = document.createElement('nav'); tabs.className = 'rs-tabs'; tabs.setAttribute('aria-label', 'Quick navigation');
    var back = document.createElement('div'); back.className = 'rs-backdrop';
    document.body.insertBefore(side, document.body.firstChild);
    document.body.appendChild(back); document.body.appendChild(tabs);
    if (opts.title) {
      var into = (opts.into && document.querySelector(opts.into)) || document.body;
      var h = document.createElement('header'); h.className = 'rs-pagehead';
      h.innerHTML = '<h1>' + esc(opts.title) + '</h1>' + (opts.sub ? '<p>' + esc(opts.sub) + '</p>' : '');
      into.insertBefore(h, into.firstChild);
    }
    render();
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-rs]');
      if (b) {
        var a = b.getAttribute('data-rs');
        if (a === 'logout') logout();
        if (a === 'collapse') setCollapsed(!document.documentElement.classList.contains('rs-collapsed'), true);
        if (a === 'menu') document.documentElement.classList.add('rs-open');
        return;
      }
      if (e.target === back) document.documentElement.classList.remove('rs-open');
      if (e.target.closest && e.target.closest('.rs-side .rs-item')) document.documentElement.classList.remove('rs-open');
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') document.documentElement.classList.remove('rs-open'); });
    refreshMe();
  }
  function setPage(id) { if (page === id) return; page = id; if (mounted) render(); }
  window.RystShell = { mount: mount, setPage: setPage, me: function () { return me; }, allowed: function (mod) { return me.role === 'admin' || me.modules.indexOf(mod) >= 0; }, modules: ALL_MODS.slice() };
  function auto() { var p = document.body && document.body.getAttribute('data-shell'); if (p && p !== 'manual') mount(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto); else auto();
})();
