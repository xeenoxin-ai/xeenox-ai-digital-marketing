// SalePunch dashboard (no build step). Hash routes: #/dashboard, #/calls,
// #/calls/<id>, #/leads, #/upload, #/reports/<day>, #/team, #/settings, #/guide.
const $app = document.getElementById('app');
const SKILL_LABELS = {
  opening: 'Opening & greeting', discovery: 'Questions / need discovery', pitch: 'Product pitch',
  objection_handling: 'Objection handling', closing: 'Closing & next step', tone: 'Tone & politeness', listening: 'Listening',
};
const OUTCOME_LABEL = { converted: 'Converted', interested: 'Interested', follow_up: 'Follow-up', not_interested: 'Not interested', no_conversation: 'No conversation' };
const LEAD_STATUSES = ['new', 'contacted', 'follow_up', 'interested', 'proposal', 'negotiation', 'won', 'lost'];
const STATUS_LABEL = { new: 'New', contacted: 'Contacted', follow_up: 'Follow-up', interested: 'Interested', proposal: 'Proposal sent', negotiation: 'Negotiation', won: 'Won', lost: 'Lost' };
const STAGE_COLOR = { new: 'violet', contacted: 'warn', follow_up: 'warn', interested: 'info', proposal: 'info', negotiation: 'violet', won: 'good', lost: 'bad' };
const inr = (n) => (n ? '₹' + Number(n).toLocaleString('en-IN') : '');
const tagChips = (t) => String(t || '').split(',').map((x) => x.trim()).filter(Boolean).map((x) => `<a class="pill plain" href="#/leads?tag=${encodeURIComponent(x)}">#${esc(x)}</a>`).join(' ');
const CALL_STATUS = { dialing: 'Dialing…', no_answer: 'No answer', busy: 'Busy', failed: 'Failed' };
let me = null;

// ------------------------------------------------------------ icons (stroke paths, 24px grid)
const P = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  team: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  cog: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.7V17c0 .6-.5 1-1 1.2C7.8 18.8 7 20.2 7 22M14 14.7V17c0 .6.5 1 1 1.2 1.2.6 2 2 2 3.8M18 2H6v7a6 6 0 0 0 12 0z"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
  trend: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  check: '<path d="M20 6 9 17l-5-5"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
  left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
  brain: '<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 16V9M12 16V5M17 16v-4"/>',
  alert: '<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3zM12 9v4M12 17h.01"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  leak: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
};
const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ''}</svg>`;

// ------------------------------------------------------------ helpers
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isManager = () => ['admin', 'manager'].includes(me?.user?.role);
const initials = (n) => String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
const avatar = (n, sm) => `<i class="avatar ${sm ? 'sm' : ''}">${esc(initials(n))}</i>`;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 3800);
}
async function api(path, opts = {}) {
  const init = { method: opts.method || 'GET', headers: { 'x-salepunch': '1' }, credentials: 'same-origin' };
  if (opts.form) init.body = opts.form;
  else if (opts.body !== undefined) { init.body = JSON.stringify(opts.body); init.headers['content-type'] = 'application/json'; }
  const res = await fetch(path, init);
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !opts.quiet) { me = null; render(); }
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}
const dur = (s) => { s = Math.round(s || 0); return s >= 3600 ? `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const mins = (s) => { const m = Math.round((s || 0) / 60); return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`; };
const TZ = 'Asia/Kolkata';
const when = (ms) => new Date(ms).toLocaleString('en-IN', { timeZone: TZ, day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
const band = (pct) => (pct == null ? '' : pct >= 70 ? 'hi' : pct >= 45 ? 'mid' : 'lo');
const score = (v, max = 100) => (v == null ? '<span class="muted">–</span>' : `<span class="score ${band((v / max) * 100)}">${v}</span>`);
const outcomePill = (c) => {
  if (c.status && c.status !== 'completed') return `<span class="pill">${esc(CALL_STATUS[c.status] || c.status)}</span>`;
  if (c.processing === 'error') return '<span class="pill error">Analysis failed</span>';
  if (c.processing === 'skipped') return `<span class="pill warn" title="${esc(c.error || 'This call has no recording to analyse')}">No recording</span>`;
  if (c.processing === 'analyzing' && c.outcome) return `<span class="pill ${esc(c.outcome)}">${esc(OUTCOME_LABEL[c.outcome] || c.outcome)}</span> <span class="small muted">refining…</span>`;
  if (c.processing !== 'done') return `<span class="pill info">${c.processing === 'transcribing' ? 'Writing out…' : 'Analysing…'}</span>`;
  return `<span class="pill ${esc(c.outcome)}">${esc(OUTCOME_LABEL[c.outcome] || c.outcome)}</span>`;
};
const addDays = (day, n) => { const d = new Date(day + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const form = (el) => Object.fromEntries(new FormData(el).entries());
const tile = (icon, v, l, tone = '', hero = false) => `<div class="tile ${hero ? 'hero' : ''}"><div class="ic ${tone}">${ic(icon)}</div><div class="v">${v}</div><div class="l">${l}</div></div>`;
const ring = (v, label, sub, max = 100) => {
  const pct = v == null ? 0 : Math.max(0, Math.min(1, v / max));
  const color = { hi: '#12a150', mid: '#e29a12', lo: '#e0352b' }[band(pct * 100)] || '#ff5a1f';
  const C = 2 * Math.PI * 40;
  return `<div class="gauge"><div class="ring"><svg viewBox="0 0 96 96"><circle class="bg" cx="48" cy="48" r="40" fill="none" stroke-width="9"/>
    <circle class="fg" cx="48" cy="48" r="40" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"/></svg>
    <b>${v == null ? '–' : v}</b></div><div><div class="t">${label}</div><div class="l">${sub}</div></div></div>`;
};
const loading = () => '<div class="grid g4"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div><br><div class="skeleton" style="height:320px"></div>';
const empty = (icon, title, text) => `<div class="empty">${ic(icon)}<div style="font-weight:700;color:var(--ink);margin-bottom:4px">${title}</div><div>${text}</div></div>`;

// ------------------------------------------------------------ shell
const NAV = [
  ['Workspace'], ['dashboard', 'Dashboard', 'grid'], ['leads', 'Leads', 'users'], ['pipeline', 'Pipeline', 'trend'], ['tasks', 'Tasks', 'check'], ['calls', 'Calls', 'phone'], ['upload', 'Add a call', 'upload'],
  ['Insights'], ['leaks', 'Sales leaks', 'leak'], ['productivity', 'Productivity', 'zap'], ['reports', 'Daily reports', 'file'], ['team', 'Team', 'team'], ['settings', 'Settings', 'cog', true], ['guide', 'How it works', 'book'],
];
function shell(active, content) {
  $app.innerHTML = `<div class="layout">
    <nav class="side">
      <div class="brand"><img src="/logo.svg" alt=""><div>SalePunch<small>Call intelligence</small></div></div>
      ${NAV.filter(([, , , m]) => !m || isManager()).map(([k, l, i]) => (l ? `<a href="#/${k}" class="${k === active ? 'on' : ''}" title="${l}">${ic(i)}<span class="lbl">${l}</span></a>` : `<div class="sec">${k}</div>`)).join('')}
      <div class="me">${avatar(me.user.name)}<div><b>${esc(me.user.name)}</b><span>${esc(me.user.role)}${me.company ? ' · ' + esc(me.company) : ''}</span></div>
        <button id="logout" title="Sign out" aria-label="Sign out">${ic('logout')}</button></div>
    </nav>
    <div class="content"><header class="topbar">
      <form id="gsearch" role="search">${ic('search')}<input name="q" placeholder="Search leads, phones, companies…" aria-label="Search leads"><span class="kbd">/</span></form>
      <span class="sp"></span><span class="date">${new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
      ${phoneBadge()}
      <button class="icon-btn" id="themeBtn" title="Switch light / dark">${ic(isDark() ? 'sun' : 'moon')}</button>
      <a class="btn primary" href="#/leads?new=1">${ic('plus')} <span class="lbl-sm">New lead</span></a></header>
    <main id="main">${content}</main></div></div>`;
  document.getElementById('logout').onclick = async () => { await api('/api/logout', { method: 'POST' }); me = null; render(); };
  document.getElementById('gsearch').onsubmit = (e) => { e.preventDefault(); const v = e.target.q.value.trim(); location.hash = '#/leads' + (v ? '?q=' + encodeURIComponent(v) : ''); };
  document.getElementById('themeBtn').onclick = (e) => { setTheme(isDark() ? 'light' : 'dark'); e.currentTarget.innerHTML = ic(isDark() ? 'sun' : 'moon'); };
}
function isDark() {
  const t = document.documentElement.dataset.theme;
  return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
}
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('sp_theme', t); } catch { /* private mode */ }
}
try { const t = localStorage.getItem('sp_theme'); if (t) document.documentElement.dataset.theme = t; } catch { /* ignore */ }
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) { const i = document.querySelector('#gsearch input'); if (i) { e.preventDefault(); i.focus(); } }
});
const setMain = (html) => { document.getElementById('main').innerHTML = html; };
const dayNav = (base, day) => `<div class="seg"><a href="#/${base}/${addDays(day, -1)}" aria-label="Previous day">${ic('left')}</a><input type="date" id="day" value="${day}"><a href="#/${base}/${addDays(day, 1)}" aria-label="Next day">${ic('right')}</a></div>`;

// ------------------------------------------------------------ auth
function authShell(inner) {
  $app.innerHTML = `<div class="auth-wrap">
    <section class="auth-hero">
      <a class="brand" href="/" style="text-decoration:none"><img src="/logo.svg" alt="">SalePunch</a>
      <div><h1>Hear every sales call. <em>Know who's converting.</em></h1>
        <p>Every call your team makes is recorded, written out from hello to goodbye, and scored by AI, so you know what was said and who is closing.</p>
        <ul><li><span>${ic('mic')}</span>Calls from your own SIMs, recorded automatically</li>
          <li><span>${ic('brain')}</span>AI scores selling skills and conversion chance</li>
          <li><span>${ic('chart')}</span>Daily reports and coaching for every agent</li>
          <li><span>${ic('users')}</span>Built-in CRM that connects to your lead forms</li></ul></div>
      <div class="foot">© ${new Date().getFullYear()} SalePunch</div>
    </section>
    <section class="auth-form"><div>${inner}</div></section></div>`;
}
const LOGIN_ERRORS = {
  not_invited: "This Google account isn't part of the workspace yet. Ask your admin to add your email on the Team page, then try again.",
  disabled: 'Your account is switched off. Ask your admin.',
  cancelled: 'Google sign-in was cancelled.',
  expired: 'The sign-in took too long. Please try again.',
  google_failed: "Google sign-in didn't work. Please try again.",
  google_off: "Google sign-in isn't set up yet. Use your email and password.",
};
const GOOGLE_G = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
const googleButton = (label) => `<a class="btn" href="/api/auth/google/start${PHONE ? '?app=1' : ''}" style="width:100%;justify-content:center;padding:12px;margin-bottom:6px">${GOOGLE_G} ${label}</a>
  <div class="row" style="gap:12px;margin:14px 0;color:var(--muted);font-size:13px"><span style="flex:1;height:1px;background:var(--line)"></span>or<span style="flex:1;height:1px;background:var(--line)"></span></div>`;
function loginErrorNotice() {
  const code = new URLSearchParams(location.search).get('login_error');
  if (!code) return '';
  history.replaceState(null, '', location.pathname + location.hash);
  return `<div class="flag">${ic('alert')}<div>${esc(LOGIN_ERRORS[code] || 'Sign-in failed. Please try again.')}</div></div>`;
}
async function authView() {
  const st = await api('/api/status', { quiet: true });
  const err = loginErrorNotice();
  if (st.needsSetup) {
    authShell(`<h2>Set up your workspace</h2><p class="muted">Create the admin account. You can add your agents next.</p>${err}
      ${st.google ? googleButton('Sign up with Google') : ''}
      <form id="f"><label>Company name<input name="company" required></label><label>Your name<input name="name" required></label>
      <label>Email<input name="email" type="email" required></label><label>Your mobile (rings when you call)<input name="phone" placeholder="98xxxxxxxx"></label>
      <label>Password<input name="password" type="password" minlength="8" required placeholder="8+ characters"></label>
      <button class="primary">Create workspace</button></form>`);
    document.getElementById('f').onsubmit = async (e) => {
      e.preventDefault();
      try { await api('/api/setup', { method: 'POST', body: form(e.target) }); location.hash = '#/guide'; render(); } catch (err) { toast(err.message); }
    };
    return;
  }
  authShell(`<h2>Welcome back</h2><p class="muted">Sign in to your SalePunch workspace.</p>${err}
    ${st.google ? googleButton('Continue with Google') : ''}
    <form id="f"><label>Email<input name="email" type="email" autocomplete="username" required></label>
    <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
    <button class="primary">Sign in</button></form>`);
  document.getElementById('f').onsubmit = async (e) => {
    e.preventDefault();
    try { await api('/api/login', { method: 'POST', body: form(e.target), quiet: true }); render(); } catch (err) { toast(err.message); }
  };
}

// ------------------------------------------------------------ dashboard
const ON_PHONE = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
const simNotice = () => (PHONE || me.call_mode !== 'sim' ? '' : ON_PHONE
  ? `<div class="notice">${ic('phone')}<div>Calls go out from your own SIM. For <b>automatic recording</b>, use the <b>SalePunch phone app</b> instead of the browser. <a href="#/guide">How it works</a></div></div>`
  : `<div class="notice" style="background:var(--info-soft);color:var(--info)">${ic('phone')}<div>Click <b>Call</b> here and <b>your phone dials the lead</b> from its SIM. The call is recorded and uploaded automatically. Keep the <b>SalePunch app</b> open and signed in on your phone. <a href="#/guide">How it works</a></div></div>`);
const phoneBadge = () => (PHONE || ON_PHONE || me.call_mode !== 'sim' ? '' : `<span class="pill ${me.phone_online ? 'good' : ''}" id="phoneBadge" title="The SalePunch app on your phone">${me.phone_online ? 'Phone connected' : 'Phone not connected'}</span>`);
async function refreshPhoneBadge() {
  const el = document.getElementById('phoneBadge');
  if (!el) return;
  try { me.phone_online = (await api('/api/phone/status')).online; } catch { return; }
  el.className = `pill ${me.phone_online ? 'good' : ''}`;
  el.textContent = me.phone_online ? 'Phone connected' : 'Phone not connected';
}
setInterval(refreshPhoneBadge, 10000);
const recNotice = () => (me.recording_missing && me.call_mode === 'sim' ? `<div class="flag" style="align-items:center">${ic('mic')}<div style="flex:1"><b>Your last call arrived without a recording.</b> Turn on <b>automatic call recording</b> in your phone's dialer so every call is recorded and scored.
  ${PHONE ? '' : 'Steps for each phone brand are in <a href="#/guide">How it works</a>.'}</div>${PHONE && PHONE.openRecorderSettings ? '<button class="primary" id="recFix">Turn on auto-record</button>' : ''}</div>` : '');
function bindRecFix() {
  const b = document.getElementById('recFix');
  if (b) b.onclick = () => { PHONE.openRecorderSettings(); toast('Choose Call recording → Record all calls automatically'); };
}
function setupNotices() {
  let h = recNotice() + simNotice();
  if (!me.ai) h += `<div class="notice">${ic('brain')}<div>AI analysis isn't connected (no Claude API key), so calls only get a rough keyword estimate.</div></div>`;
  return h;
}
async function dashboardView(arg) {
  const day = arg || me.today;
  shell('dashboard', loading());
  const [d, live, myTasks] = await Promise.all([api(`/api/dashboard?from=${day}`), day === me.today ? api('/api/calls/live').then((x) => x.calls).catch(() => []) : [],
    api('/api/tasks?user=me&done=0').then((x) => x.tasks).catch(() => [])]);
  const dueNow = myTasks.filter((t) => t.due_at && t.due_at.slice(0, 10) <= me.today);
  const t = d.team;
  const pipe = Object.fromEntries(d.pipeline.map((p) => [p.status, p.n]));
  const pipeTotal = LEAD_STATUSES.reduce((s, k) => s + (pipe[k] || 0), 0);
  const hello = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
  setMain(`
    <div class="head"><div><h1>${hello}, ${esc(me.user.name.split(' ')[0])}</h1><div class="muted">${isManager() ? 'Your team' : 'Your calls'} · ${new Date(day + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div></div>
      ${dayNav('dashboard', day)}</div>
    ${setupNotices()}
    ${live.length ? `<div class="panel" style="padding:14px 18px"><div class="row" style="gap:12px"><span class="pill bad" style="background:var(--good-soft);color:var(--good)">LIVE NOW</span>
      ${live.map((c) => `<a class="row" style="gap:8px;color:inherit;text-decoration:none" href="#/calls/${c.id}" title="Watch live">${avatar(c.agent_name, true)}<span><b>${esc(c.agent_name || '')}</b> <span class="muted">on a call with</span> <b>${esc(c.lead_name || c.lead_phone || 'a lead')}</b> <span class="muted small">· ${Math.max(0, Math.round((Date.now() - c.started_at) / 60000))} min · watch live →</span></span></a>`).join('')}</div></div>` : ''}
    ${dueNow.length ? `<div class="panel" style="padding:16px 18px"><div class="row" style="justify-content:space-between;margin-bottom:6px"><h2 style="margin:0">${ic('check')} Your tasks for today · ${dueNow.length}</h2><a href="#/tasks" class="small">All tasks →</a></div>
      <ul class="clean" id="dashTasks">${dueNow.slice(0, 5).map((t) => taskRow(t, { showLead: true })).join('')}</ul></div>` : ''}
    <div class="grid g4">
      ${tile('trophy', `${t.converted} <small>${t.conversion_pct}%</small>`, 'Converted · of connected calls', '', true)}
      ${tile('phone', `${t.connected}<small> / ${t.dialed}</small>`, `Connected / dialed · ${mins(t.talk_time_sec)} talk`, 'good')}
      ${tile('star', t.avg_skill_score ?? '–', 'Avg sales-skill score /100', 'violet')}
      ${tile('target', `${t.avg_conversion_chance ?? '–'}${t.avg_conversion_chance != null ? '<small>%</small>' : ''}`, 'Avg chance to convert', 'info')}
    </div><br>
    <div class="grid g4">
      ${tile('trend', t.interested, 'Interested leads', 'info')}
      ${tile('calendar', t.follow_up, 'Follow-ups agreed', 'warn')}
      ${tile('clock', dur(t.avg_call_sec), 'Avg call length', 'good')}
      ${tile('flag', t.red_flags, 'Red flags to review', t.red_flags ? 'bad' : 'good')}
    </div><br>
    ${isManager() ? `<div class="panel flush"><h2>Agent leaderboard</h2><div class="scroll"><table>
      <tr><th>#</th><th>Agent</th><th class="n">Dialed</th><th class="n">Connected</th><th class="n">Talk</th><th class="n">Converted</th><th class="n">Conv. %</th><th class="n">Skill</th><th class="n">Chance</th><th>Needs work on</th><th class="n">Flags</th></tr>
      ${d.agents.map((a, i) => {
        const weak = Object.entries(a.skills).filter(([, v]) => v != null).sort((x, y) => x[1] - y[1])[0];
        return `<tr class="click" data-href="#/calls?agent=${a.agent_id}&from=${day}&to=${day}"><td class="muted">${i + 1}</td><td><div class="who">${avatar(a.name, true)}${esc(a.name)}</div></td><td class="n">${a.dialed}</td><td class="n">${a.connected}</td>
          <td class="n">${mins(a.talk_time_sec)}</td><td class="n"><b>${a.converted}</b></td><td class="n">${a.conversion_pct}%</td><td class="n">${score(a.avg_skill_score)}</td>
          <td class="n">${a.avg_conversion_chance ?? '–'}${a.avg_conversion_chance != null ? '%' : ''}</td><td class="small">${weak ? `${esc(SKILL_LABELS[weak[0]])} <span class="muted">${weak[1]}/10</span>` : '<span class="muted">–</span>'}</td>
          <td class="n">${a.red_flags ? `<span class="pill bad">${a.red_flags}</span>` : '<span class="muted">0</span>'}</td></tr>`;
      }).join('')}</table></div></div>` : ''}
    <div class="grid g-side">
      <div class="panel"><h2>Sales skills <span class="muted small">· team average /10</span></h2>${Object.keys(SKILL_LABELS).map((k) => skillRow(k, t.skills[k])).join('')}</div>
      <div>
        <div class="panel"><h2>Top objections from leads</h2>${t.top_objections.length ? `<ul class="clean">${t.top_objections.map((o) => `<li>${ic('alert')}<span style="flex:1">${esc(o.objection)}</span><span class="pill plain">× ${o.count}</span></li>`).join('')}</ul>` : '<p class="muted" style="margin:0">No objections recorded for this day.</p>'}</div>
        <div class="panel"><h2>Lead pipeline</h2>
          <div class="bar" style="height:12px;display:flex;margin-bottom:14px">${LEAD_STATUSES.map((s) => pipe[s] ? `<i style="width:${(pipe[s] / pipeTotal) * 100}%;border-radius:0;background:var(--${STAGE_COLOR[s]})"></i>` : '').join('')}</div>
          <div class="row">${LEAD_STATUSES.map((s) => `<a class="pill ${s}" href="#/leads?status=${s}">${STATUS_LABEL[s]} ${pipe[s] || 0}</a>`).join('')}</div>
          ${d.follow_ups_due ? `<p style="margin:14px 0 0"><a class="btn" href="#/leads?due=1">${ic('calendar')} ${d.follow_ups_due} follow-up${d.follow_ups_due > 1 ? 's' : ''} due today</a></p>` : ''}</div>
      </div>
    </div>`);
  document.getElementById('day').onchange = (e) => { location.hash = `#/dashboard/${e.target.value}`; };
  bindRowLinks();
  bindRecFix();
  const dt = document.getElementById('dashTasks');
  if (dt) bindTasks(dt, () => dashboardView(arg));
}
const skillRow = (k, v) => `<div class="skill"><span>${esc(SKILL_LABELS[k])}</span><div class="bar ${band((v || 0) * 10)}"><i style="width:${(v || 0) * 10}%"></i></div>${score(v, 10)}</div>`;
function bindRowLinks() { document.querySelectorAll('tr[data-href]').forEach((tr) => { tr.onclick = () => { location.hash = tr.dataset.href; }; }); }

// ------------------------------------------------------------ calls
async function callsView(_, q) {
  shell('calls', loading());
  const from = q.get('from') || addDays(me.today, -6), to = q.get('to') || me.today;
  const params = new URLSearchParams({ from, to });
  for (const k of ['agent', 'outcome', 'lead']) if (q.get(k)) params.set(k, q.get(k));
  const [{ calls }, { users }] = await Promise.all([api('/api/calls?' + params), api('/api/users')]);
  setMain(`<div class="head"><div><h1>Calls</h1><div class="muted">${calls.length} call${calls.length === 1 ? '' : 's'} · every call recorded and scored</div></div></div>
    <form class="row panel" id="flt" style="padding:14px"><input type="date" name="from" value="${from}"><span class="muted">to</span><input type="date" name="to" value="${to}">
      ${isManager() ? `<select name="agent"><option value="">All agents</option>${users.map((u) => `<option value="${u.id}" ${q.get('agent') === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select>` : ''}
      <select name="outcome"><option value="">All results</option>${Object.entries(OUTCOME_LABEL).map(([k, l]) => `<option value="${k}" ${q.get('outcome') === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <button class="primary">${ic('search')} Filter</button></form>
    <div class="panel flush scroll">${calls.length ? `<table><tr><th>When</th><th>Agent</th><th>Lead</th><th class="n">Length</th><th>Result</th><th class="n">Skill</th><th class="n">Chance</th><th>Summary</th></tr>
      ${calls.map((c) => `<tr class="click" data-href="#/calls/${c.id}"><td class="small" style="white-space:nowrap">${when(c.started_at)}</td><td><div class="who">${avatar(c.agent_name, true)}${esc(c.agent_name || '')}</div></td>
        <td><b>${esc(c.lead_name || c.lead_phone || '–')}</b></td><td class="n">${dur(c.duration_sec)}</td><td>${outcomePill(c)}${c.red_flags?.length ? ` <span class="pill bad" title="Red flag">${ic('flag')}</span>` : ''}</td>
        <td class="n">${score(c.skill_score)}</td><td class="n">${c.conversion_chance != null ? c.conversion_chance + '%' : '–'}</td>
        <td class="small muted" style="max-width:340px">${esc((c.summary || c.error || '').slice(0, 130))}</td></tr>`).join('')}</table>` : empty('phone', 'No calls in this range', 'Calls appear here a minute after they end.')}</div>`);
  document.getElementById('flt').onsubmit = (e) => {
    e.preventDefault();
    location.hash = '#/calls?' + new URLSearchParams(Object.entries(form(e.target)).filter(([, v]) => v));
  };
  bindRowLinks();
}

async function callView(id) {
  shell('calls', loading());
  const { call: c } = await api(`/api/calls/${id}`);
  const raw = c.analysis;
  const q = raw && raw.quick ? raw : null; // quick verdict while the full analysis runs
  const a = raw && !raw.quick ? raw : null;
  const orig = raw?.original;
  const keys = new Map((a?.key_moments || []).map((m) => [m.segment, m.note]));
  const chat = (c.transcript || []).map((s, i) => `<div class="msg ${s.speaker === 'agent' ? 'agent' : ''} ${keys.has(i) ? 'key' : ''}">
      <span class="t">${s.speaker === 'agent' ? esc(c.agent_name || 'Agent') : esc(c.lead_name || 'Lead')} · ${c.has_audio ? `<button class="link" data-seek="${s.start}">${ic('clock')} ${dur(s.start)}</button>` : dur(s.start)}</span>${esc(s.text)}
      ${keys.has(i) ? `<span class="note">★ ${esc(keys.get(i))}</span>` : ''}</div>`).join('');
  const li = (icon, x) => `<li>${ic(icon)}<span>${esc(x)}</span></li>`;
  setMain(`<div class="head"><div><a href="#/calls" class="crumb">${ic('left')} Calls</a><h1>${esc(c.lead_name || c.lead_phone || 'Call')}</h1>
      <div class="row muted">${avatar(c.agent_name, true)} ${esc(c.agent_name || '')} · ${when(c.started_at)} · ${dur(c.duration_sec)}${c.language ? ' · ' + esc(c.language) : ''} ${outcomePill(c)}</div></div>
      <div class="row">${c.lead_id ? `<a class="btn" href="#/lead/${c.lead_id}">${ic('users')} Open lead</a>` : ''}
      ${isManager() ? '<button id="re">Re-analyse</button>' : ''}</div></div>
    ${c.processing === 'error' ? `<div class="flag">${ic('alert')}<div>Analysis failed: ${esc(c.error)}</div></div>` : ''}
    ${c.processing === 'skipped' && c.status === 'completed' ? `<div class="notice">${ic('mic')}<div><b>No recording reached SalePunch for this call</b>, so there is nothing to analyse. ${esc(c.error || '')} Check that automatic call recording is on in the phone's dialer (How it works), or attach the recording on Add a call.</div></div>` : ''}
    ${['pending', 'transcribing', 'analyzing'].includes(c.processing) && c.status === 'completed' ? `<div class="notice" style="background:var(--info-soft);color:var(--info)">${ic('clock')}<div><b>${c.processing === 'analyzing' ? 'AI is scoring the call…' : c.processing === 'transcribing' ? 'Writing out the conversation…' : 'Getting the recording…'}</b> This page updates by itself, usually within 30 seconds.</div></div>` : ''}
    ${q ? `<div class="panel" style="border-color:var(--info)"><div class="row" style="justify-content:space-between;margin-bottom:8px"><h3 style="margin:0;color:var(--info)">${ic('zap')} Quick AI result</h3><span class="pill info">Full analysis finishing…</span></div>
      <div class="grid g3" style="margin-bottom:10px">${ring(q.conversion_chance, 'Chance to convert', `${q.conversion_chance}% likely to buy`)}<div><div class="small muted">Result</div><div style="margin-top:6px">${outcomePill({ status: 'completed', processing: 'done', outcome: q.outcome })}</div></div><div><div class="small muted">Mood</div><b style="text-transform:capitalize">${esc(q.sentiment)}</b></div></div>
      <p style="margin:0">${esc(q.summary)}</p>${q.next_action ? `<p class="small" style="margin:6px 0 0"><b>Next step:</b> ${esc(q.next_action)}</p>` : ''}</div>` : ''}
    ${a ? `<div class="panel"><div class="grid g4">
      ${ring(a.overall_score, 'Sales skill', 'Score out of 100')}
      ${ring(a.conversion_chance, 'Chance to convert', `${a.conversion_chance}% likely to buy`)}
      ${ring(a.script_adherence.score, 'Script followed', `${a.script_adherence.missed.length} step${a.script_adherence.missed.length === 1 ? '' : 's'} missed`)}
      ${ring(a.talk_ratio, 'Agent talk share', a.talk_ratio > 65 ? 'Talking too much; listen more' : a.talk_ratio < 30 ? 'Agent too quiet' : 'Good balance')}
    </div></div>` : ''}
    <div class="grid g-side">
      <div>
        ${c.has_audio ? `<div class="player"><h3>Call recording</h3><audio id="aud" controls preload="none" src="/api/calls/${c.id}/audio"></audio></div>` : ''}
        <div class="panel"><h2>${ic('mic')} Conversation, hello to goodbye${orig ? ' <span class="pill info plain" style="margin-left:6px">Translated to English</span>' : ''}</h2>${chat ? `<div class="chat">${chat}</div>` : empty('mic', 'No transcript yet', 'It appears here once the call is processed.')}
          ${orig ? `<details style="margin-top:12px"><summary>Original language (${esc(orig.language || 'detected')})</summary><p style="white-space:pre-wrap">${esc(orig.text)}</p></details>` : ''}</div>
      </div>
      <div>${a ? `
        ${a.red_flags.map((f) => `<div class="flag">${ic('flag')}<div>${esc(f)}</div></div>`).join('')}
        <div class="panel"><h3>AI summary</h3><p style="margin-top:0;font-size:15px">${esc(a.summary)}</p>
          ${a.lead_intent ? `<p><b>What the lead wants:</b> ${esc(a.lead_intent)}</p>` : ''}
          ${a.next_action ? `<div class="notice" style="margin:0;background:var(--info-soft);color:var(--info)">${ic('calendar')}<div><b>Next step:</b> ${esc(a.next_action)}${a.follow_up_date ? ` (by ${esc(a.follow_up_date)})` : ''}</div></div>` : ''}
          <p class="small muted" style="margin-bottom:0">${a.engine === 'keywords' ? 'Keyword estimate only (AI was unavailable for this call). Use Re-analyse to try again.' : a.engine === 'workers-ai' ? 'Analysed by free AI (Llama 3.3 on Cloudflare).' : 'Analysed by Claude AI.'}</p></div>
        <div class="panel"><h3>Sales skills</h3>${Object.keys(SKILL_LABELS).map((k) => skillRow(k, a.skills[k])).join('')}</div>
        ${a.objections.length ? `<div class="panel"><h3>Objections from the lead</h3>${a.objections.map((o) => `<div style="margin-bottom:12px"><div class="row" style="justify-content:space-between"><b>“${esc(o.objection)}”</b><span class="pill ${o.handled_well ? 'good' : 'bad'}">${o.handled_well ? 'Handled' : 'Not handled'}</span></div><div class="small muted">Agent's reply: ${esc(o.agent_response || '—')}</div></div>`).join('')}</div>` : ''}
        <div class="panel"><h3>Script check</h3><div class="grid g2"><div><b class="small">Done</b><ul class="clean small" style="margin-top:8px">${a.script_adherence.followed.map((x) => li('check', x)).join('') || '<li class="muted">–</li>'}</ul></div>
          <div><b class="small">Missed</b><ul class="clean small" style="margin-top:8px">${a.script_adherence.missed.map((x) => li('x', x)).join('') || '<li class="muted">Nothing missed</li>'}</ul></div></div></div>
        ${a.strengths.length || a.improvements.length ? `<div class="panel"><h3>Coaching</h3>${a.strengths.length ? `<b class="small" style="color:var(--good)">Did well</b><ul class="clean small" style="margin:8px 0 14px">${a.strengths.map((x) => li('star', x)).join('')}</ul>` : ''}
          ${a.improvements.length ? `<b class="small" style="color:var(--brand-2)">Improve next time</b><ul class="clean small" style="margin-top:8px">${a.improvements.map((x) => li('trend', x)).join('')}</ul>` : ''}</div>` : ''}` : ''}
      </div></div>`);
  document.querySelectorAll('[data-seek]').forEach((b) => { b.onclick = () => { const au = document.getElementById('aud'); au.currentTime = Number(b.dataset.seek); au.play(); }; });
  const re = document.getElementById('re');
  if (re) re.onclick = async () => { await api(`/api/calls/${c.id}/reprocess`, { method: 'POST' }); toast('Re-analysing…'); callView(id); };
  // Call still going on: show what is being said, live (managers and the agent).
  if (['dialing', 'queued'].includes(c.status)) {
    const chatPanel = document.querySelector('#main .chat')?.closest('.panel') || document.querySelector('#main .panel');
    if (chatPanel) {
      chatPanel.innerHTML = `<h2>${ic('mic')} Live now <span class="pill bad plain" style="margin-left:6px">● on call</span></h2><div class="lp-tip" id="cvTip" hidden></div><div class="chat" id="cvLive"><p class="small muted">Waiting for the first words… (the agent must click Start listening)</p></div>`;
      let after = 0;
      const here = location.hash;
      const tick = async () => {
        if (location.hash !== here) return;
        try {
          const r = await api(`/api/calls/${c.id}/live?after=${after}`);
          const box = document.getElementById('cvLive');
          for (const sgm of r.segments) {
            after = Math.max(after, sgm.id);
            if (sgm.speaker === 'coach') { const t = document.getElementById('cvTip'); t.hidden = false; t.className = 'lp-tip ' + (sgm.en === 'warning' ? 'warn' : ''); t.innerHTML = `${ic('zap')}<div><b>AI coach</b><br>${esc(sgm.text)}</div>`; continue; }
            if (box.querySelector('p.muted')) box.innerHTML = '';
            box.insertAdjacentHTML('beforeend', `<div class="msg ${sgm.speaker === 'agent' ? 'agent' : ''}"><span class="t">${sgm.speaker === 'agent' ? esc(c.agent_name || 'Agent') : sgm.speaker === 'lead' ? esc(c.lead_name || 'Lead') : 'Call'} · ${dur(sgm.start)}</span>${esc(sgm.text)}${sgm.en ? `<span class="note" style="color:var(--muted)">${esc(sgm.en)}</span>` : ''}</div>`);
            box.scrollTop = box.scrollHeight;
          }
          if (!['dialing', 'queued'].includes(r.status)) return void setTimeout(() => location.hash === here && callView(id), 2000);
        } catch { /* keep polling */ }
        setTimeout(tick, 3000);
      };
      tick();
    }
  }
  // Keep refreshing while the call is being processed, so the report shows up by itself.
  if (['pending', 'transcribing', 'analyzing'].includes(c.processing) && c.status === 'completed') {
    const here = location.hash;
    setTimeout(() => { if (location.hash === here) callView(id).catch(() => {}); }, 3000);
  }
}

// ------------------------------------------------------------ live call tracker
let liveTimer = null;
function liveCall(callId, leadName, sim = false) { // sim: true (this phone) or 'phone' (sent to the agent's phone)
  const el = document.getElementById('live');
  const started = Date.now();
  clearInterval(liveTimer);
  const draw = (c) => {
    const st = c?.status || (sim === 'phone' ? 'queued' : 'dialing'), pr = c?.processing || 'pending';
    const fail = ['no_answer', 'busy', 'failed'].includes(st);
    const done = pr === 'done';
    const step = (on, ok, text) => `<div class="${ok ? 'ok' : on ? 'on' : ''}">${ic(ok ? 'check' : 'clock')}${text}</div>`;
    const ended = st !== 'dialing' && st !== 'queued';
    el.className = `show ${done ? 'done' : ''} ${fail ? 'fail' : ''}`;
    el.innerHTML = `<div class="top"><div class="pulse">${ic('phone')}</div><div><b>${esc(leadName)}</b><div class="small" style="color:var(--side-muted)">${
      fail ? esc(CALL_STATUS[st] || st) : done ? 'Call analysed' : pr === 'skipped' ? esc(c?.error || 'Call saved, no recording') : ended ? 'Call ended, processing' : st === 'queued' ? 'Sent to your phone. It dials in a few seconds…' : sim === 'phone' ? 'Your phone is calling the lead…' : sim ? 'Calling from your SIM…' : 'Answer your phone. SalePunch connects the lead'}</div></div>
      <button class="x" aria-label="Close">${ic('x')}</button></div>
      ${fail ? '' : `<div class="steps">${(sim === 'phone' ? step(st === 'queued', st !== 'queued', 'Sent to your phone') : '') + step(!ended && st !== 'queued', ended, sim ? 'Your phone calls the lead from its SIM' : 'Your phone rings, then the lead is connected')}${step(ended && pr === 'pending', ended && pr !== 'pending', 'Recording saved')}
        ${step(pr === 'transcribing', ['analyzing', 'done'].includes(pr), 'Writing out the conversation')}${step(pr === 'analyzing', done, 'AI scoring the call')}</div>`}
      ${done ? `<a class="btn primary" style="width:100%;justify-content:center;margin-top:10px" href="#/calls/${callId}">Open call report</a>` : ''}`;
    el.querySelector('.x').onclick = () => { el.className = ''; clearInterval(liveTimer); };
    if (done || fail || pr === 'error' || pr === 'skipped') clearInterval(liveTimer);
  };
  draw(null);
  liveCall.poll = async () => { try { draw((await api(`/api/calls/${callId}`)).call); } catch { /* keep polling */ } };
  liveTimer = setInterval(async () => {
    if (Date.now() - started > 75 * 60000) return clearInterval(liveTimer);
    try { draw((await api(`/api/calls/${callId}`)).call); } catch { /* keep polling */ }
  }, 3000);
}


// ------------------------------------------------------------ calling
// Three ways to call, picked automatically:
//  1. SalePunch Android app (window.SalePunchPhone): dials from the agent's SIM,
//     then uploads the phone's own call recording when the call ends.
//  2. Exotel cloud line (call_mode "exotel"): rings the agent, then the lead.
//  3. Plain browser: opens the phone dialer (tel:) and asks how the call went.
const PHONE = window.SalePunchPhone || null;
async function startCall(leadId, name, how) {
  // On a computer, ask how to call: talk here (internet call) or ring their mobile from the phone.
  if (!how && !PHONE && !ON_PHONE && !(me.call_mode === 'exotel' && me.telephony)) return chooseCall(leadId, name);
  if (how === 'web') return startWebCall(leadId, name);
  if (me.call_mode === 'exotel' && me.telephony) {
    const r = await api('/api/calls/dial', { method: 'POST', body: { lead_id: leadId } });
    return liveCall(r.id, name);
  }
  if (!PHONE && !ON_PHONE) { // on a computer: the agent's phone app dials
    let r;
    try { r = await api('/api/calls/sim', { method: 'POST', body: { lead_id: leadId, via: 'phone' } }); }
    catch (e) { refreshPhoneBadge(); return phoneHelp(e.message); }
    liveCall(r.id, name, 'phone');
    if (navigator.mediaDevices?.getUserMedia) openLivePanel(r.id, name);
    return;
  }
  const r = await api('/api/calls/sim', { method: 'POST', body: { lead_id: leadId } });
  if (PHONE) {
    if (PHONE.ready && !PHONE.ready()) { PHONE.askPermissions && PHONE.askPermissions(); toast('Allow Phone, Call logs and Music & audio, then tap Call again.'); return; }
    PHONE.call(r.id, r.phone);
    return liveCall(r.id, name, true);
  }
  try { sessionStorage.setItem('sp_pending', JSON.stringify({ id: r.id, name, t: Date.now() })); } catch { /* private mode */ }
  location.href = 'tel:' + r.phone;
  setTimeout(() => askCallResult(r.id, name, Date.now()), 1500);
}
function chooseCall(leadId, name) {
  let dlg = document.getElementById('choosedlg');
  if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 'choosedlg'; document.body.appendChild(dlg); }
  dlg.innerHTML = `<h2>Call ${esc(name)}</h2>
    <button class="choice" id="chWeb"><span class="ic" style="background:var(--grad);color:#fff">${ic('mic')}</span><span><b>Talk on this computer</b><span class="small muted">Internet call. You use your headset here, and ${esc(name.split(' ')[0])} joins from a WhatsApp link on their phone. SalePunch hears both of you live.</span></span></button>
    <button class="choice" id="chPhone"><span class="ic" style="background:var(--good-soft);color:var(--good)">${ic('phone')}</span><span><b>Ring their mobile from my phone</b><span class="small muted">Your phone dials their number from its SIM. You talk on the phone. Here SalePunch hears only you, unless Phone Link plays the call on this computer.</span></span></button>
    <div class="row" style="justify-content:flex-end;margin-top:8px"><button type="button" id="chCancel">Cancel</button></div>`;
  dlg.showModal();
  const go = (how) => { dlg.close(); startCall(leadId, name, how).catch((e) => toast(e.message)); };
  dlg.querySelector('#chWeb').onclick = () => go('web');
  dlg.querySelector('#chPhone').onclick = () => go('phone');
  dlg.querySelector('#chCancel').onclick = () => dlg.close();
}
function phoneHelp(msg) {
  let dlg = document.getElementById('phonedlg');
  if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 'phonedlg'; document.body.appendChild(dlg); }
  dlg.innerHTML = `<h2>${ic('phone')} Connect your phone first</h2><p>${esc(msg)}</p><ol class="steps-list">
    <li><div><b>Open the SalePunch app on your Android phone</b><p>No app yet? On your phone, open <b>${esc(location.origin)}/download</b> and install it. Sign in with the same email as here. A "Ready for calls" notification shows it's connected.</p></div></li>
    <li><div><b>Keep it running</b><p>You can lock the phone. If calls stop arriving, set the app's battery use to "Unrestricted" (the app asks once).</p></div></li>
    <li><div><b>Click Call again</b><p>Your phone dials the lead within a few seconds.</p></div></li></ol>
    <div class="row" style="justify-content:flex-end"><a class="btn" href="#/guide" onclick="this.closest('dialog').close()">How it works</a><button class="primary" onclick="this.closest('dialog').close()">OK</button></div>`;
  dlg.showModal();
}
// The Android app calls this when it has uploaded the result.
window.salepunchCallDone = () => {
  if (liveCall.poll) liveCall.poll();
  setTimeout(async () => { try { me = await api('/api/me'); } catch { /* ignore */ } }, 1500);
};

let asking = false;
function askCallResult(id, name, t) {
  if (asking && document.getElementById('calldlg')?.open) return; asking = true;
  let dlg = document.getElementById('calldlg');
  if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 'calldlg'; document.body.appendChild(dlg); }
  if (dlg.open) return;
  const away = Math.max(0, Math.round((Date.now() - t) / 60000));
  dlg.innerHTML = `<h2>How did the call with ${esc(name)} go?</h2><p class="small muted" style="margin-top:-6px">Calls from a browser can't be recorded automatically. For automatic recording, use the SalePunch Android app.</p>
    <form id="cr"><div class="row" style="margin-bottom:14px">${[['completed', 'Spoke to them'], ['no_answer', 'No answer'], ['busy', 'Busy / cut']].map(([v, l], i) => `<label class="row" style="margin:0;font-weight:600"><input type="radio" name="status" value="${v}" ${i ? '' : 'checked'} style="width:auto"> ${l}</label>`).join('')}</div>
    <label>Call length (minutes)<input type="number" name="minutes" min="0" step="0.5" value="${away}" style="max-width:140px"></label>
    <label>Recording from your phone (optional)<input type="file" name="audio" accept="audio/*,.m4a,.amr,.mp3,.wav,.ogg"></label>
    <div class="row" style="justify-content:flex-end"><button type="button" id="crSkip">Later</button><button class="primary">Save call</button></div></form>`;
  dlg.showModal();
  const done = () => { asking = false; try { sessionStorage.removeItem('sp_pending'); } catch { /* ignore */ } dlg.close(); };
  dlg.querySelector('#crSkip').onclick = done;
  dlg.querySelector('#cr').onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    fd.set('duration_sec', String(Math.round(Number(fd.get('minutes') || 0) * 60))); fd.delete('minutes');
    if (!(fd.get('audio') && fd.get('audio').size)) fd.delete('audio');
    try { await api(`/api/calls/${id}/finish`, { method: 'POST', form: fd }); done(); toast('Call saved'); liveCall(id, name, true); } catch (err) { toast(err.message); }
  };
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible' || PHONE) return;
  try {
    const p = JSON.parse(sessionStorage.getItem('sp_pending') || 'null');
    if (p && Date.now() - p.t > 3000) askCallResult(p.id, p.name, p.t);
  } catch { /* ignore */ }
});


// ------------------------------------------------------------ live listening (computer)
// While a phone call is on, the computer listens to both sides:
//  - "You": the headset microphone
//  - "Lead": the computer's sound (Windows Phone Link plays the call on the PC;
//    Chrome/Edge capture it when sharing the screen with "Share system audio").
// Every few seconds each side is written out (and translated) on the server, an
// AI coach suggests the next line, and at the end the report is built from it.
const LIVE_CHUNK_SEC = 5;
function wavBlob(samples, rate) {
  const buf = new ArrayBuffer(44 + samples.length * 2), v = new DataView(buf);
  const w = (o, str) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + samples.length * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) { const x = Math.max(-1, Math.min(1, samples[i])); v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7fff, true); }
  return new Blob([buf], { type: 'audio/wav' });
}
const rms = (a) => { let t = 0; for (let i = 0; i < a.length; i++) t += a[i] * a[i]; return Math.sqrt(t / (a.length || 1)); };

class LiveListener {
  constructor(callId, ui) { this.callId = callId; this.ui = ui; this.tracks = []; this.queue = Promise.resolve(); this.lastCoach = 0; this.stopped = false; }
  async start({ systemAudio, streams }) {
    this.ctx = new AudioContext({ sampleRate: 16000 });
    this.t0 = performance.now();
    if (streams) { // internet call: both sides are already separate streams
      this.streams = [streams.agent];
      this.addTrack(streams.agent, 'agent');
      this.addTrack(streams.lead, 'lead');
      systemAudio = false;
    } else {
    const mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    this.streams = [mic];
    this.addTrack(mic, systemAudio ? 'agent' : 'mixed'); // mic only: it hears both people
    }
    if (systemAudio) {
      const disp = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, systemAudio: 'include' });
      disp.getVideoTracks().forEach((t) => t.stop()); // only the sound is needed
      if (!disp.getAudioTracks().length) { disp.getTracks().forEach((t) => t.stop()); throw new Error('No sound was shared. Choose "Entire screen" and switch on "Share system audio".'); }
      this.streams.push(disp);
      this.addTrack(new MediaStream(disp.getAudioTracks()), 'lead');
    }
    // Whole-call recording, kept inside SalePunch.
    this.dest = this.ctx.createMediaStreamDestination();
    this.tracks.forEach((t) => t.src.connect(this.dest));
    this.chunks = [];
    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'].find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m));
    if (mime) { this.rec = new MediaRecorder(this.dest.stream, { mimeType: mime, audioBitsPerSecond: 32000 }); this.rec.ondataavailable = (e) => e.data.size && this.chunks.push(e.data); this.rec.start(5000); }
    this.timer = setInterval(() => this.flush(false), LIVE_CHUNK_SEC * 1000);
  }
  addTrack(stream, speaker) {
    const src = this.ctx.createMediaStreamSource(stream);
    const proc = this.ctx.createScriptProcessor(4096, 1, 1);
    const mute = this.ctx.createGain(); mute.gain.value = 0;
    const track = { speaker, src, proc, buf: [], startAt: 0, level: 0 };
    proc.onaudioprocess = (e) => {
      const d = e.inputBuffer.getChannelData(0);
      if (!track.buf.length) track.startAt = (performance.now() - this.t0) / 1000 - d.length / 16000;
      track.buf.push(new Float32Array(d));
      track.level = Math.max(rms(d), track.level * 0.85);
      this.ui.level(speaker, track.level);
    };
    src.connect(proc); proc.connect(mute); mute.connect(this.ctx.destination);
    this.tracks.push(track);
  }
  flush(final) {
    for (const t of this.tracks) {
      if (!t.buf.length) continue;
      const n = t.buf.reduce((k, b) => k + b.length, 0), all = new Float32Array(n);
      let o = 0; for (const b of t.buf) { all.set(b, o); o += b.length; }
      t.buf = [];
      if (rms(all) < (t.speaker === 'lead' ? 0.004 : 0.008) || n < 16000 * 0.6) continue; // silence: nothing to send
      const fd = new FormData();
      fd.set('audio', wavBlob(all, 16000), 'chunk.wav'); fd.set('speaker', t.speaker); fd.set('start', String(Math.max(0, t.startAt).toFixed(2)));
      this.queue = this.queue.then(() => api(`/api/calls/${this.callId}/live-chunk`, { method: 'POST', form: fd })
        .then((r) => { if (r.text) { this.ui.line(r); if (r.speaker !== 'agent' && !final) this.coach(); } })
        .catch((e) => this.ui.warn(e.message)));
    }
  }
  coach() {
    if (Date.now() - this.lastCoach < 12000) return;
    this.lastCoach = Date.now();
    api(`/api/calls/${this.callId}/live-coach`, { method: 'POST', body: {} }).then((r) => r.tip && this.ui.tip(r.tip)).catch(() => {});
  }
  async stop() {
    if (this.stopped) return; this.stopped = true;
    clearInterval(this.timer);
    this.flush(true);
    await this.queue;
    const blob = await new Promise((res) => {
      if (!this.rec || this.rec.state === 'inactive') return res(null);
      this.rec.onstop = () => res(new Blob(this.chunks, { type: this.rec.mimeType }));
      this.rec.stop();
    });
    this.streams.forEach((st) => st.getTracks().forEach((t) => t.stop()));
    this.ctx.close().catch(() => {});
    const fd = new FormData();
    if (blob && blob.size) fd.set('recording', blob, 'call.webm');
    fd.set('duration_sec', String(Math.round((performance.now() - this.t0) / 1000)));
    return api(`/api/calls/${this.callId}/live-finish`, { method: 'POST', form: fd });
  }
}

let activeLive = null;
function openLivePanel(callId, leadName) {
  let el = document.getElementById('livepanel');
  if (!el) { el = document.createElement('aside'); el.id = 'livepanel'; document.body.appendChild(el); }
  const canSystem = !!navigator.mediaDevices?.getDisplayMedia;
  el.className = 'show';
  document.body.classList.add('lp-open');
  el.innerHTML = `<header><div><b>${esc(leadName)}</b><div class="small" id="lpStatus">Ready to listen</div></div><span class="lp-timer" id="lpTimer">0:00</span><button class="x" id="lpClose" aria-label="Close">${ic('x')}</button></header>
    <div id="lpSetup" class="lp-setup">
      <p><b>Listen &amp; coach this call live</b> on this computer.</p>
      <ol class="small"><li>Use <b>Phone Link</b> (Windows) so the call plays in your headset. <a href="#/guide" id="lpHow">How to set up</a></li>
        <li>Click <b>Start listening</b>, choose <b>Entire screen</b> and switch on <b>Share system audio</b>. That lets SalePunch hear the lead.</li></ol>
      <button class="primary" id="lpStart" style="width:100%;justify-content:center">${ic('mic')} Start listening</button>
      ${canSystem ? `<button class="link small" id="lpMicOnly" style="margin-top:10px">Phone on speaker next to the computer? Listen with the microphone only</button>` : ''}
    </div>
    <div id="lpLive" hidden>
      <div class="lp-meters"><div><span>You</span><i><b id="mAgent"></b></i></div><div><span>Lead</span><i><b id="mLead"></b></i></div></div>
      <div class="lp-tip" id="lpTip" hidden></div>
      <div class="lp-lines" id="lpLines"><p class="small muted">Listening… what each side says appears here every few seconds.</p></div>
      <button class="primary" id="lpEnd" style="width:100%;justify-content:center">${ic('check')} End &amp; analyse</button>
    </div>`;
  const $ = (id) => el.querySelector('#' + id);
  let timer = null, poll = null;
  const ui = {
    level: (sp, v) => { const b = $(sp === 'lead' ? 'mLead' : 'mAgent'); if (b) b.style.width = Math.min(100, v * 600) + '%'; },
    line: (r) => {
      const box = $('lpLines'); if (box.querySelector('p.muted')) box.innerHTML = '';
      box.insertAdjacentHTML('beforeend', `<div class="msg ${r.speaker === 'agent' ? 'agent' : ''}"><span class="t">${r.speaker === 'agent' ? 'You' : r.speaker === 'lead' ? esc(leadName) : 'Call'}</span>${esc(r.text)}${r.en ? `<span class="note" style="color:var(--muted)">${esc(r.en)}</span>` : ''}</div>`);
      box.scrollTop = box.scrollHeight;
    },
    tip: (t) => { const b = $('lpTip'); b.hidden = false; b.className = 'lp-tip ' + (t.kind === 'warning' ? 'warn' : ''); b.innerHTML = `${ic(t.kind === 'warning' ? 'alert' : 'zap')}<div><b>${t.kind === 'warning' ? 'Careful' : 'AI coach'}</b><br>${esc(t.text)}</div>`; },
    warn: (m) => { $('lpStatus').textContent = m; },
  };
  const finish = async () => {
    if (!activeLive) return;
    const l = activeLive; activeLive = null;
    clearInterval(timer); clearInterval(poll);
    $('lpEnd').disabled = true; $('lpStatus').textContent = 'Saving and analysing…';
    try { await l.stop(); el.className = ''; document.body.classList.remove('lp-open'); location.hash = `#/calls/${callId}`; toast('Call saved. The report appears in a few seconds.'); }
    catch (e) { $('lpStatus').textContent = e.message; $('lpEnd').disabled = false; }
  };
  const start = async (systemAudio) => {
    try {
      activeLive = new LiveListener(callId, ui);
      await activeLive.start({ systemAudio });
      $('lpSetup').hidden = true; $('lpLive').hidden = false;
      $('lpStatus').textContent = systemAudio ? 'Listening to you and the lead' : 'Listening through the microphone';
      const t0 = Date.now();
      timer = setInterval(() => { const sec = Math.round((Date.now() - t0) / 1000); $('lpTimer').textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; }, 1000);
      // Stop by itself when the phone reports the call has ended.
      poll = setInterval(async () => { try { const r = await api(`/api/calls/${callId}/live?after=999999999`); if (!['dialing', 'queued'].includes(r.status)) setTimeout(finish, 2500); } catch { /* keep going */ } }, 4000);
      // Hearing you but never the lead? The call is playing on the phone, not this computer.
      if (systemAudio) {
        let leadPeak = 0;
        const origLevel = ui.level;
        ui.level = (sp, v) => { if (sp === 'lead') leadPeak = Math.max(leadPeak, v); origLevel(sp, v); };
        setTimeout(() => {
          if (!activeLive || leadPeak > 0.01) return;
          const t = $('lpTip'); t.hidden = false; t.className = 'lp-tip warn';
          t.innerHTML = `${ic('alert')}<div><b>SalePunch can't hear the lead.</b><br>This call is playing on your phone, not on this computer. To talk and listen here, end this call and use <b>Talk on this computer</b> (internet call), or set up Phone Link.</div>`;
        }, 20000);
      }
    } catch (e) {
      activeLive = null;
      toast(e.name === 'NotAllowedError' ? 'Permission was not given. Allow the microphone (and screen sound) to listen live.' : e.message);
    }
  };
  $('lpStart').onclick = () => start(canSystem);
  const mo = $('lpMicOnly'); if (mo) mo.onclick = () => start(false);
  $('lpEnd').onclick = finish;
  $('lpClose').onclick = () => { if (activeLive && !confirm('Stop listening? What was heard so far is saved and analysed.')) return; if (activeLive) finish(); else { el.className = ''; document.body.classList.remove('lp-open'); } };
}
window.addEventListener('beforeunload', (e) => { if (activeLive) { e.preventDefault(); e.returnValue = ''; } });


// ------------------------------------------------------------ internet call (WebRTC)
// The agent talks on the computer; the lead joins from a link in their phone's
// browser. No phone line: SalePunch hears both voices directly.
let activeWeb = null;
async function startWebCall(leadId, leadName) {
  if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) return toast('This browser cannot make internet calls. Use Chrome or Edge.');
  let mic;
  try { mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); }
  catch { return toast('Allow the microphone to make internet calls.'); }
  let r;
  try { r = await api('/api/calls/web', { method: 'POST', body: { lead_id: leadId } }); } catch (e) { mic.getTracks().forEach((t) => t.stop()); return toast(e.message); }
  const msg = `Hi ${leadName.split(' ')[0]}, this is ${me.user.name} from ${r.company}. Tap this link to talk to me now (free internet call, no charges): ${r.link}`;
  let el = document.getElementById('livepanel');
  if (!el) { el = document.createElement('aside'); el.id = 'livepanel'; document.body.appendChild(el); }
  el.className = 'show'; document.body.classList.add('lp-open');
  el.innerHTML = `<header><div><b>${esc(leadName)}</b><div class="small" id="lpStatus">Waiting for ${esc(leadName.split(' ')[0])} to join…</div></div><span class="lp-timer" id="lpTimer" style="background:var(--side-2)">0:00</span><button class="x" id="lpClose" aria-label="End">${ic('x')}</button></header>
    <div class="lp-setup" id="lpInvite">
      <p><b>Send the call link to ${esc(leadName)}</b>. When they tap it and press <b>Join call</b>, you are connected. Talk on your headset.</p>
      <a class="btn primary" style="width:100%;justify-content:center;background:linear-gradient(135deg,#25d366,#128c4a)" target="_blank" rel="noopener" href="${waLink(r.phone, msg)}">Send on WhatsApp</a>
      <div class="row" style="margin-top:10px;flex-wrap:nowrap"><input readonly value="${esc(r.link)}" id="lpLink" style="flex:1;min-width:0"><button id="lpCopy">Copy</button></div>
      <p class="small muted" id="lpLeadState" style="margin-top:12px">Link not opened yet.</p>
      <button class="link small" id="lpCancel" style="color:var(--bad)">Cancel call</button>
    </div>
    <div id="lpLive" hidden>
      <div class="lp-meters"><div><span>You</span><i><b id="mAgent"></b></i></div><div><span>Lead</span><i><b id="mLead"></b></i></div></div>
      <div class="row"><button id="lpMute">${ic('mic')} Mute</button></div>
      <div class="lp-tip" id="lpTip" hidden></div>
      <div class="lp-lines" id="lpLines"><p class="small muted">Connected. What each side says appears here every few seconds.</p></div>
      <button class="primary" id="lpEnd" style="width:100%;justify-content:center;background:#e0352b">${ic('phone')} Hang up &amp; analyse</button>
    </div>
    <audio id="lpRemote" autoplay></audio>`;
  const $ = (id) => el.querySelector('#' + id);
  const ui = {
    level: (sp, v) => { const b = $(sp === 'lead' ? 'mLead' : 'mAgent'); if (b) b.style.width = Math.min(100, v * 600) + '%'; },
    line: (x) => {
      const box = $('lpLines'); if (box.querySelector('p.muted')) box.innerHTML = '';
      box.insertAdjacentHTML('beforeend', `<div class="msg ${x.speaker === 'agent' ? 'agent' : ''}"><span class="t">${x.speaker === 'agent' ? 'You' : esc(leadName)}</span>${esc(x.text)}${x.en ? `<span class="note" style="color:var(--muted)">${esc(x.en)}</span>` : ''}</div>`);
      box.scrollTop = box.scrollHeight;
    },
    tip: (t) => { const b = $('lpTip'); b.hidden = false; b.className = 'lp-tip ' + (t.kind === 'warning' ? 'warn' : ''); b.innerHTML = `${ic(t.kind === 'warning' ? 'alert' : 'zap')}<div><b>${t.kind === 'warning' ? 'Careful' : 'AI coach'}</b><br>${esc(t.text)}</div>`; },
    warn: (m) => { $('lpStatus').textContent = m; },
  };
  const pc = new RTCPeerConnection({ iceServers: r.ice });
  mic.getTracks().forEach((t) => pc.addTrack(t, mic));
  let listener = null, timer = null, poll = null, done = false, connectedAt = 0;
  const finish = async (why) => {
    if (done) return; done = true;
    clearInterval(timer); clearInterval(poll);
    $('lpStatus').textContent = connectedAt ? 'Saving and analysing…' : (why || 'Call cancelled');
    try { await api(`/api/calls/${r.id}/web-end`, { method: 'POST', body: {} }); } catch { /* ignore */ }
    try { if (listener) await listener.stop(); } catch (e) { toast(e.message); }
    try { pc.close(); } catch { /* ignore */ }
    mic.getTracks().forEach((t) => t.stop());
    activeWeb = null; activeLive = null;
    el.className = ''; document.body.classList.remove('lp-open');
    if (connectedAt) { location.hash = `#/calls/${r.id}`; toast('Call saved. The report appears in a few seconds.'); } else toast(why || 'Call cancelled');
  };
  activeWeb = { finish };
  pc.ontrack = async (e) => {
    const remote = e.streams[0];
    const a = $('lpRemote'); a.srcObject = remote; a.play().catch(() => {});
    if (listener) return;
    listener = new LiveListener(r.id, ui); activeLive = listener;
    try { await listener.start({ streams: { agent: mic, lead: remote } }); } catch (err) { toast(err.message); }
  };
  pc.onconnectionstatechange = () => {
    const st = pc.connectionState;
    if (st === 'connected' && !connectedAt) {
      connectedAt = Date.now();
      $('lpInvite').hidden = true; $('lpLive').hidden = false; $('lpTimer').style.background = '';
      $('lpStatus').textContent = 'On call · listening to both sides';
      timer = setInterval(() => { const sec = Math.round((Date.now() - connectedAt) / 1000); $('lpTimer').textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; }, 1000);
    }
    if (st === 'failed') finish('The connection failed. Try again, or ask the lead to switch between Wi-Fi and mobile data.');
    if (st === 'disconnected' && connectedAt) setTimeout(() => pc.connectionState === 'disconnected' && finish(), 6000);
  };
  // Offer with all network routes included (no trickle), then wait for the lead.
  await pc.setLocalDescription(await pc.createOffer({ offerToReceiveAudio: true }));
  await new Promise((res) => { if (pc.iceGatheringState === 'complete') return res(); pc.addEventListener('icegatheringstatechange', () => pc.iceGatheringState === 'complete' && res()); setTimeout(res, 4000); });
  await api(`/api/calls/${r.id}/web-offer`, { method: 'POST', body: { sdp: pc.localDescription.sdp } });
  const states = { invited: 'Link not opened yet.', opened: `${leadName.split(' ')[0]} opened the link…`, joined: 'Joining…', left: `${leadName.split(' ')[0]} left the call.` };
  poll = setInterval(async () => {
    try {
      const w = await api(`/api/calls/${r.id}/web`);
      if ($('lpLeadState')) $('lpLeadState').textContent = states[w.lead_state] || '';
      if (w.answer && !pc.currentRemoteDescription) await pc.setRemoteDescription({ type: 'answer', sdp: w.answer });
      if (w.lead_state === 'left' && connectedAt) finish();
    } catch { /* keep waiting */ }
  }, 1500);
  $('lpCopy').onclick = () => { navigator.clipboard?.writeText(r.link).then(() => toast('Link copied')).catch(() => { $('lpLink').select(); }); };
  $('lpCancel').onclick = () => finish('Call cancelled');
  $('lpEnd').onclick = () => finish();
  $('lpClose').onclick = () => { if (connectedAt && !confirm('Hang up this call?')) return; finish(connectedAt ? undefined : 'Call cancelled'); };
  $('lpMute').onclick = () => { const on = mic.getAudioTracks()[0].enabled; mic.getAudioTracks().forEach((t) => { t.enabled = !on; }); $('lpMute').innerHTML = `${ic('mic')} ${on ? 'Unmute' : 'Mute'}`; };
}

// ------------------------------------------------------------ leads
async function leadsView(_, q) {
  shell('leads', loading());
  const p = new URLSearchParams();
  for (const k of ['status', 'q', 'due', 'owner', 'tag']) if (q.get(k)) p.set(k, q.get(k));
  const [{ leads }, { users }] = await Promise.all([api('/api/leads?' + p), api('/api/users')]);
  const agentOpts = (sel) => `<option value="">Unassigned</option>${users.filter((u) => u.active).map((u) => `<option value="${u.id}" ${sel === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}`;
  setMain(`<div class="head"><div><h1>Leads</h1><div class="muted">${leads.length} lead${leads.length === 1 ? '' : 's'}${q.get('due') ? ' · follow-ups due' : ''} · tap <b>Call</b> to start a recorded call</div></div>
      <div class="row"><a class="btn" href="/api/leads/export">${ic('file')} Export</a><button id="imp">${ic('upload')} Import CSV</button><button class="primary" id="add">${ic('plus')} Add lead</button></div></div>
    ${recNotice()}${simNotice()}
    <form class="row panel" id="flt" style="padding:14px"><input name="q" placeholder="Search name, phone, email, company, tag" value="${esc(q.get('q') || '')}" style="flex:1;min-width:180px">${q.get('tag') ? `<input type="hidden" name="tag" value="${esc(q.get('tag'))}"><a class="pill" href="#/leads">#${esc(q.get('tag'))} ✕</a>` : ''}
      <select name="status"><option value="">All statuses</option>${LEAD_STATUSES.map((s) => `<option value="${s}" ${q.get('status') === s ? 'selected' : ''}>${STATUS_LABEL[s]}</option>`).join('')}</select>
      ${isManager() ? `<select name="owner"><option value="">All agents</option>${users.map((u) => `<option value="${u.id}" ${q.get('owner') === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select>` : ''}
      <label class="row" style="margin:0"><input type="checkbox" name="due" value="1" ${q.get('due') ? 'checked' : ''} style="width:auto"> Due today</label><button class="primary">${ic('search')} Search</button></form>
    <div class="panel flush scroll">${leads.length ? `<table><tr><th>Lead</th><th>Stage</th>${isManager() ? '<th>Agent</th>' : ''}<th class="n">Value</th><th>Source</th><th>Follow-up</th><th class="n">Calls</th><th></th></tr>
      ${leads.map((l) => `<tr data-id="${l.id}"><td><div class="who">${avatar(l.name, true)}<div style="flex:1"><a href="#/lead/${l.id}" style="color:inherit">${esc(l.name)}</a><span>${esc(l.phone)}${l.company ? ' · ' + esc(l.company) : ''}</span>${l.tags ? `<div style="margin-top:4px">${tagChips(l.tags)}</div>` : ''}</div><button class="call call-m" data-call="${l.id}" data-name="${esc(l.name)}">${ic('phone')}</button></div></td>
        <td><select data-f="status" style="width:auto">${LEAD_STATUSES.map((s) => `<option value="${s}" ${l.status === s ? 'selected' : ''}>${STATUS_LABEL[s]}</option>`).join('')}</select></td>
        ${isManager() ? `<td><select data-f="owner_id" style="width:auto">${agentOpts(l.owner_id)}</select></td>` : ''}
        <td class="n small">${inr(l.deal_value) || '<span class="muted">–</span>'}</td><td class="small">${esc(l.source || '')}</td><td><input type="date" data-f="next_follow_up" value="${esc(l.next_follow_up || '')}" style="width:auto"></td>
        <td class="n">${l.call_count ? `<a href="#/calls?lead=${l.id}&from=2000-01-01">${l.call_count}</a>` : '<span class="muted">0</span>'}</td>
        <td class="n call-col"><div class="row" style="justify-content:flex-end;flex-wrap:nowrap"><button class="btn" data-webcall="${l.id}" data-name="${esc(l.name)}" title="Internet call: talk on this computer, the lead joins from a link">${ic('mic')}</button><button class="call" data-call="${l.id}" data-name="${esc(l.name)}">${ic('phone')} Call</button></div></td></tr>`).join('')}</table>`
      : empty('users', 'No leads yet', 'Add a lead, import a CSV, or connect your lead forms in Settings.')}</div>
    <dialog id="dlg"></dialog>`);
  document.getElementById('flt').onsubmit = (e) => { e.preventDefault(); location.hash = '#/leads?' + new URLSearchParams(Object.entries(form(e.target)).filter(([, v]) => v)); };
  bindRecFix();
  document.querySelectorAll('tr[data-id] [data-f]').forEach((el) => {
    el.onchange = async () => {
      try { await api(`/api/leads/${el.closest('tr').dataset.id}`, { method: 'PATCH', body: { [el.dataset.f]: el.value } }); toast('Saved'); } catch (e) { toast(e.message); }
    };
  });
  document.querySelectorAll('[data-webcall]').forEach((b) => { b.onclick = () => startWebCall(b.dataset.webcall, b.dataset.name); });
  document.querySelectorAll('[data-call]').forEach((b) => {
    b.onclick = async () => {
      b.disabled = true;
      try { await startCall(b.dataset.call, b.dataset.name); } catch (e) { toast(e.message); }
      setTimeout(() => { b.disabled = false; }, 8000);
    };
  });
  const dlg = document.getElementById('dlg');
  document.getElementById('add').onclick = () => {
    dlg.innerHTML = `<h2>Add lead</h2><form id="lf"><label>Name<input name="name" required></label><label>Phone<input name="phone" required placeholder="98xxxxxxxx"></label>
      <label>Email<input name="email" type="email"></label>
      <div class="grid g2" style="gap:12px"><label>Company<input name="company"></label><label>Deal value (₹)<input name="deal_value" inputmode="numeric" placeholder="25000"></label></div>
      <label>Source<input name="source" placeholder="Meta ad, website, referral…"></label><label>Tags (comma separated)<input name="tags" placeholder="hot, swift, palakkad"></label>
      ${isManager() ? `<label>Agent<select name="owner_id">${agentOpts('')}</select></label>` : ''}<label>Notes<textarea name="notes" style="min-height:60px"></textarea></label>
      <div class="row" style="justify-content:flex-end"><button type="button" onclick="this.closest('dialog').close()">Cancel</button><button class="primary">Save lead</button></div></form>`;
    dlg.showModal();
    document.getElementById('lf').onsubmit = async (e) => {
      e.preventDefault();
      try { const r = await api('/api/leads', { method: 'POST', body: form(e.target) }); dlg.close(); location.hash = `#/lead/${r.id}`; } catch (err) { toast(err.message); }
    };
  };
  if (q.get('new')) { history.replaceState(null, '', location.pathname + '#/leads'); document.getElementById('add').click(); }
  document.getElementById('imp').onclick = () => {
    dlg.innerHTML = `<h2>Import leads (CSV)</h2><p class="small muted">The first row is the header. A <b>phone</b> column is required. <b>name, email, source, notes, owner</b> (agent email) and <b>status</b> are optional. Exports from Meta Lead Ads, Google Sheets, Zoho and HubSpot work.</p>
      <form id="cf"><input type="file" name="file" accept=".csv,text/csv" required><br><br>${isManager() ? `<label>Give unassigned leads to<select name="owner_id">${agentOpts('')}</select></label>` : ''}
      <div class="row" style="justify-content:flex-end"><button type="button" onclick="this.closest('dialog').close()">Cancel</button><button class="primary">Import</button></div></form>`;
    dlg.showModal();
    document.getElementById('cf').onsubmit = async (e) => {
      e.preventDefault();
      const f = e.target.file.files[0];
      try {
        const r = await api('/api/leads/import', { method: 'POST', body: { csv: await f.text(), owner_id: e.target.owner_id?.value || null } });
        dlg.close(); toast(`Imported ${r.added}, skipped ${r.skipped} (duplicates or no phone)`); route();
      } catch (err) { toast(err.message); }
    };
  };
}

// ------------------------------------------------------------ upload
async function uploadView() {
  shell('upload', loading());
  const [{ leads }, { users }] = await Promise.all([api('/api/leads'), api('/api/users')]);
  setMain(`<div class="head"><div><h1>Add a call</h1><div class="muted">For calls made from a normal phone dialer: upload the phone's recording, or paste what was said.</div></div></div>
    <div class="grid g-side"><form class="panel" id="uf">
      <label>Lead<select name="lead_id"><option value="">Not in the list</option>${leads.map((l) => `<option value="${l.id}">${esc(l.name)} · ${esc(l.phone)}</option>`).join('')}</select></label>
      <label>Or lead phone number<input name="lead_phone" placeholder="98xxxxxxxx"></label>
      ${isManager() ? `<label>Agent<select name="agent_id">${users.map((u) => `<option value="${u.id}" ${u.id === me.user.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select></label>` : ''}
      <div class="grid g2"><label>Call time<input type="datetime-local" name="started_at"></label><label>Length in seconds (optional)<input type="number" name="duration_sec" min="0"></label></div>
      <label>Recording (mp3, m4a, wav, ogg · up to 25 MB)<input type="file" name="audio" accept="audio/*,.m4a,.amr,.mp3,.wav,.ogg"></label>
      <label>Or paste the conversation<textarea name="transcript" placeholder="Agent: Hello, this is Anu from Xeenox…&#10;Lead: Yes, tell me…"></textarea></label>
      <button class="primary" id="ub">${ic('upload')} Upload and analyse</button></form>
      <div class="panel"><h2>Where do I find the recording?</h2><ol class="steps-list">
        <li><div><b>Turn on call recording</b><p>Most Android phones (Samsung, Xiaomi, OnePlus, Google Phone) have <i>Settings → Call recording → Record calls automatically</i>.</p></div></li>
        <li><div><b>Find the file</b><p>Open the phone's <i>Files</i> app and look in <i>Recordings</i> or <i>Call</i>.</p></div></li>
        <li><div><b>Upload it here</b><p>Pick the lead and choose the file. The transcript and score appear in about a minute.</p></div></li></ol>
        <p class="small muted">The easiest way is the <b>Call</b> button on the Leads page, which records automatically. See <a href="#/guide">How it works</a>.</p></div></div>`);
  document.getElementById('uf').onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (fd.get('started_at')) fd.set('started_at', new Date(fd.get('started_at')).toISOString());
    document.getElementById('ub').disabled = true;
    try { const r = await api('/api/calls/upload', { method: 'POST', form: fd }); toast('Uploaded. Analysis takes about a minute.'); location.hash = `#/calls/${r.id}`; }
    catch (err) { toast(err.message); document.getElementById('ub').disabled = false; }
  };
}

// ------------------------------------------------------------ reports
async function reportsView(arg) {
  const day = arg || me.today;
  shell('reports', loading());
  const { reports } = await api(`/api/reports?day=${day}`);
  setMain(`<div class="head"><div><h1>Daily reports</h1><div class="muted">Built every evening at 9 pm for each agent, with an AI coaching note.</div></div>
      <div class="row">${dayNav('reports', day)}${isManager() ? `<button id="run">${ic('chart')} Build now</button>` : ''}</div></div>
    ${reports.length ? `<div class="grid g2">${reports.map((r) => `<div class="panel"><div class="head" style="margin-bottom:14px;align-items:center"><div class="who">${avatar(r.agent_name)}<div style="font-size:16px">${esc(r.agent_name)}<span>${r.stats.dialed} calls · ${mins(r.stats.talk_time_sec)} talk</span></div></div>
      <a href="#/calls?agent=${r.agent_id}&from=${day}&to=${day}" class="small">See calls →</a></div>
      <div class="grid g3" style="gap:10px;margin-bottom:14px">${[['Converted', `${r.stats.converted} · ${r.stats.conversion_pct}%`], ['Connected', r.stats.connected], ['Skill', `${r.stats.avg_skill_score ?? '–'}/100`], ['Follow-ups', r.stats.follow_up], ['Interested', r.stats.interested], ['Red flags', r.stats.red_flags]]
        .map(([l, v]) => `<div style="background:var(--panel-2);border:1px solid var(--line);border-radius:12px;padding:10px 12px"><div class="small muted">${l}</div><b style="font-size:17px">${v}</b></div>`).join('')}</div>
      ${r.coaching ? `<div style="background:var(--brand-soft);border-radius:12px;padding:14px"><h3 style="color:var(--brand-2);margin-bottom:6px">${ic('brain')} Coaching note</h3><div style="white-space:pre-wrap">${esc(r.coaching)}</div></div>` : ''}</div>`).join('')}</div>`
      : `<div class="panel">${empty('file', 'No report for this day yet', 'Reports are built at the end of each working day.')}</div>`}`);
  document.getElementById('day').onchange = (e) => { location.hash = `#/reports/${e.target.value}`; };
  const run = document.getElementById('run');
  if (run) run.onclick = async () => { run.disabled = true; try { await api(`/api/reports/run?day=${day}`, { method: 'POST' }); route(); } catch (e) { toast(e.message); run.disabled = false; } };
}

// ------------------------------------------------------------ team
async function teamView() {
  shell('team', loading());
  const { users } = await api('/api/users');
  setMain(`<div class="head"><div><h1>Team</h1><div class="muted">Each agent's mobile is the phone that rings when they tap Call.</div></div>
      <div class="row"><a class="btn" href="/download/salepunch.apk">${ic('upload')} Download Android app</a>${isManager() ? `<button class="primary" id="add">${ic('plus')} Add agent</button>` : ''}</div></div>
    <div class="notice" style="background:var(--info-soft);color:var(--info)">${ic('phone')}<div>Send agents this link to install the phone app: <b>${esc(location.origin)}/download</b>. They open it on their Android phone, tap the downloaded file and allow "Install unknown apps" once.</div></div>
    <div class="panel flush scroll"><table><tr><th>Agent</th><th>Mobile</th><th>Role</th><th>Status</th><th></th></tr>
      ${users.map((u) => `<tr><td><div class="who">${avatar(u.name, true)}<div>${esc(u.name)}<span>${esc(u.email)}</span></div></div></td><td class="small">${esc(u.phone || '—')}${u.phone ? '' : ' <span class="pill warn">needed to call</span>'}</td>
        <td><span class="pill plain">${esc(u.role)}</span></td><td>${u.active ? '<span class="pill good">Active</span>' : '<span class="pill">Off</span>'}</td><td class="n"><button data-edit="${u.id}">Edit</button></td></tr>`).join('')}</table></div>
    <dialog id="dlg"></dialog>`);
  const dlg = document.getElementById('dlg');
  const open = (u) => {
    const self = u && u.id === me.user.id;
    dlg.innerHTML = `<h2>${u ? 'Edit ' + esc(u.name) : 'Add agent'}</h2><form id="uf">
      <label>Name<input name="name" value="${esc(u?.name || '')}" required></label>
      ${u ? '' : '<label>Email (used to sign in: their Gmail / Google Workspace address for Google sign-in)<input name="email" type="email" required></label>'}
      <label>Mobile (rings when they tap Call)<input name="phone" value="${esc(u?.phone || '')}" placeholder="98xxxxxxxx"></label>
      ${isManager() && !self ? `<label>Role<select name="role">${['agent', 'manager', 'admin'].map((r) => `<option ${u?.role === r ? 'selected' : ''}>${r}</option>`).join('')}</select></label>` : ''}
      ${u && isManager() && !self ? `<label class="row"><input type="checkbox" name="active" ${u.active ? 'checked' : ''} style="width:auto"> Active (can sign in)</label>` : ''}
      <label>${u ? 'New password (leave blank to keep)' : 'Password (optional: leave blank if they sign in with Google)'}<input name="password" type="password" minlength="8"></label>
      <div class="row" style="justify-content:flex-end"><button type="button" onclick="this.closest('dialog').close()">Cancel</button><button class="primary">Save</button></div></form>`;
    dlg.showModal();
    document.getElementById('uf').onsubmit = async (e) => {
      e.preventDefault();
      const b = form(e.target);
      if (u && isManager() && !self) b.active = !!e.target.active?.checked;
      if (!b.password) delete b.password;
      try {
        await api(u ? `/api/users/${u.id}` : '/api/users', { method: u ? 'PATCH' : 'POST', body: b });
        dlg.close(); if (self) me = await api('/api/me'); route();
      } catch (err) { toast(err.message); }
    };
  };
  const add = document.getElementById('add');
  if (add) add.onclick = () => open(null);
  document.querySelectorAll('[data-edit]').forEach((b) => { b.onclick = () => open(users.find((x) => x.id === b.dataset.edit)); });
}

// ------------------------------------------------------------ settings
async function settingsView() {
  shell('settings', loading());
  const s = await api('/api/settings');
  const v = s.settings;
  const conn = (ok, name, text) => `<div class="tile" style="box-shadow:none"><div class="ic ${ok ? 'good' : 'bad'}">${ic(ok ? 'check' : 'x')}</div><div style="font-weight:700">${name}</div><div class="l">${ok ? 'Connected' : text}</div></div>`;
  setMain(`<div class="head"><div><h1>Settings</h1><div class="muted">Your script, product details and connections.</div></div></div>
    <div class="grid g3" style="margin-bottom:18px">${conn(s.telephony, 'Exotel calling', 'Not connected: the Call button is off')}${conn(s.ai, s.ai_engine === 'claude' ? 'AI analysis: Claude' : 'AI analysis: free (Llama 3.3)', 'Not connected: keyword estimate only')}${conn(!!s.lead_webhook, 'Lead webhook', 'Set LEADS_WEBHOOK_KEY')}</div>
    <form id="sf">
    <div class="panel"><h2>Your sales script</h2><p class="small muted" style="margin-top:-6px">The AI checks every call against this. Write it the way you train new agents, step by step.</p>
      <label>Company name<input name="company" value="${esc(v.company)}"></label>
      <label>What you sell (products, prices, offers, common questions)<textarea name="product">${esc(v.product)}</textarea></label>
      <label>How agents call<select name="call_mode" style="max-width:420px">
        <option value="sim" ${me.call_mode !== 'exotel' ? 'selected' : ''}>Agent's own SIM (SalePunch Android app)</option>
        <option value="exotel" ${me.call_mode === 'exotel' ? 'selected' : ''} ${s.telephony ? '' : 'disabled'}>Company cloud line (Exotel)${s.telephony ? '' : ': not connected'}</option></select></label>
      <label>Assign new leads<select name="auto_assign" style="max-width:420px">
        <option value="" ${v.auto_assign !== 'round_robin' ? 'selected' : ''}>Leave unassigned (manager assigns)</option>
        <option value="round_robin" ${v.auto_assign === 'round_robin' ? 'selected' : ''}>Automatically, in turn to each agent (round-robin)</option></select></label>
      <label>Daily call target per agent (used on Productivity)<input name="daily_call_target" type="number" min="1" max="1000" value="${esc(v.daily_call_target || 60)}" style="max-width:160px"></label>
      <label>Sales script<textarea name="script" style="min-height:220px" placeholder="1. Greet: 'Good morning, this is <name> from <company>…'&#10;2. Confirm you are speaking to the right person&#10;3. Ask what they are looking for&#10;4. …">${esc(v.script)}</textarea></label></div>
    <div class="panel"><h2>${ic('link')} CRM connection</h2>
      <p class="small"><b>Leads in:</b> send new leads from website forms, Meta Lead Ads (through Zapier, Make or Pabbly), Zoho or HubSpot to this webhook as JSON with name, phone, email, source and owner:</p>
      ${s.lead_webhook ? `<input readonly value="${esc(s.lead_webhook)}" onclick="this.select()">` : '<div class="notice">Set the LEADS_WEBHOOK_KEY secret to turn this on.</div>'}
      <label style="margin-top:16px">Results out: CRM webhook URL (gets the outcome, summary, score and follow-up date after every call)<input name="crm_webhook_url" value="${esc(v.crm_webhook_url)}" placeholder="https://hooks.zapier.com/…"></label>
      <label>Daily report webhook (Slack, Google Chat, or Zapier to WhatsApp/email)<input name="report_webhook_url" value="${esc(v.report_webhook_url)}" placeholder="https://hooks.slack.com/…"></label></div>
    <button class="primary">${ic('check')} Save settings</button></form>`);
  document.getElementById('sf').onsubmit = async (e) => {
    e.preventDefault();
    try { await api('/api/settings', { method: 'PUT', body: form(e.target) }); me = await api('/api/me'); toast('Settings saved'); } catch (err) { toast(err.message); }
  };
}

// ------------------------------------------------------------ guide
function guideView() {
  shell('guide', '');
  const exo = me.call_mode === 'exotel';
  setMain(`<div class="head"><div><h1>How SalePunch works</h1><div class="muted">From tapping Call to a scored call report, in about a minute.</div></div>
      ${me.android_app ? `<a class="btn primary" href="${esc(me.android_app)}">${ic('upload')} Download the Android app</a>` : ''}</div>
    ${PHONE ? `<div class="notice" style="background:var(--good-soft);color:var(--good)">${ic('check')}<div>You're using the <b>SalePunch phone app</b>. Calls go out from your SIM and recordings upload automatically.
      ${PHONE.ready && !PHONE.ready() ? ' <button class="link" id="perm">Allow phone permissions</button>' : ''} <button class="link" id="recset">Open call-recording settings</button></div></div>` : ''}
    <div class="panel"><h2>What happens on every call</h2><div class="flow">
      <div><div class="ic">${ic('users')}</div><b>Agent taps Call</b><p>On the lead in <a href="#/leads">Leads</a>, inside the SalePunch phone app.</p></div>
      <div><div class="ic">${ic('phone')}</div><b>${exo ? 'Company line connects' : 'SIM dials the lead'}</b><p>${exo ? 'The agent\'s phone rings, then the lead. The lead sees your company number.' : 'The app dials straight away from the company SIM in the agent\'s phone. No typing the number.'}</p></div>
      <div><div class="ic">${ic('mic')}</div><b>Call recorded automatically</b><p>${exo ? 'The company line records both voices.' : 'The phone\'s own call recorder records both voices, hello to goodbye.'}</p></div>
      <div><div class="ic">${ic('upload')}</div><b>Uploaded on hang-up</b><p>${exo ? 'The line sends the recording to SalePunch.' : 'The app reads the call length from the call log, finds the recording and uploads it.'}</p></div>
      <div><div class="ic">${ic('brain')}</div><b>AI report ready</b><p>Conversation, outcome, chance to convert, skills and next step appear in Calls.</p></div>
    </div></div>
    <div class="grid g2">
      <div class="panel"><h2>${ic('phone')} One-time phone setup (each agent)</h2><ol class="steps-list">
        <li><div><b>Install the SalePunch app</b><p>Your admin shares the APK file. Open it and allow "install unknown apps" for that one install.</p></div></li>
        <li><div><b>Sign in</b><p>Use the same email and password as on the website.</p></div></li>
        <li><div><b>Allow the permissions</b><p><b>Phone</b> (to dial), <b>Call logs</b> (to read the call length) and <b>Music & audio</b> (to find the recording).</p></div></li>
        <li><div><b>Turn on automatic call recording</b> in the phone's own dialer:<p>
          <b>Samsung:</b> Phone → ⋮ → Settings → Record calls → Auto record calls → All calls.<br>
          <b>Xiaomi / Redmi / POCO:</b> Phone → Settings → Call recording → Record calls automatically → All numbers.<br>
          <b>Google Phone</b> (Pixel, Motorola, Nokia, many others in India): Phone → Settings → Call recording → "Numbers not in your contacts" → Always record.<br>
          <b>OnePlus / OPPO / Realme / Vivo:</b> Phone → Settings → Call recording → Auto-record → All calls.</p></div></li>
        <li><div><b>Make a test call</b><p>Call a colleague from Leads, then check the call appears in Calls with its recording.</p></div></li></ol></div>
      <div class="panel"><h2>${ic('users')} For agents: every call</h2><ol class="steps-list">
        <li><div><b>Open Leads, in the app or on your computer</b><p>Follow-ups due today are under "Due today". On a computer, check that the Leads page says <b>Phone connected</b>.</p></div></li>
        <li><div><b>Tap or click the green Call button</b><p>Your phone dials the lead from its SIM straight away, even when you click on the computer and the phone is locked. Never dial from the keypad: those calls aren't tracked.</p></div></li>
        <li><div><b>Talk normally</b><p>Follow the script. The phone records the call.</p></div></li>
        <li><div><b>Hang up and come back to the app</b><p>The recording uploads by itself. About a minute later your scores and coaching appear.</p></div></li>
        <li><div><b>Check the follow-up</b><p>The AI fills in the next step and date on the lead.</p></div></li></ol>
        <h3 style="margin-top:18px">Managers see</h3><ul class="clean small">
        <li>${ic('mic')}<span>Every conversation, as audio and as a chat</span></li><li>${ic('target')}<span>Converted or not, with the chance to buy</span></li>
        <li>${ic('leak')}<span>Where sales leak, in <a href="#/leaks">Sales leaks</a></span></li><li>${ic('zap')}<span>Who is on a call right now, and each agent's day, in <a href="#/productivity">Productivity</a></span></li></ul></div>
    </div>
    <div class="panel"><h2>${ic('mic')} Internet call: no phone at all</h2>
      <div class="grid g2"><ol class="steps-list">
        <li><div><b>Click the microphone button</b><p>Next to <b>Call</b> on a lead, or <b>Internet call</b> on the lead's page.</p></div></li>
        <li><div><b>Send the link</b><p>Tap <b>Send on WhatsApp</b>. The lead gets "Tap this link to talk to me now".</p></div></li>
        <li><div><b>The lead taps Join call</b><p>It opens in their phone's browser, with no app to install, over mobile data or Wi-Fi.</p></div></li>
        <li><div><b>Talk on your headset</b><p>SalePunch hears both of you directly: live transcript, AI coach tips, recording and the full report when you hang up.</p></div></li></ol>
      <p class="small muted">Use this for leads who are on WhatsApp or online. To ring a normal mobile number from the computer, a licensed calling line (Exotel) is needed; until then use <b>Call</b>, which dials from your phone.</p></div></div>
    <div class="panel"><h2>${ic('mic')} Talk through your computer headset, with live AI coaching</h2>
      <div class="grid g2"><ol class="steps-list">
        <li><div><b>Link your Android phone to Windows</b><p>On the PC open <b>Phone Link</b> (built into Windows 10/11). On the phone install <b>Link to Windows</b>, scan the QR code, and allow <b>Calls</b> (it pairs over Bluetooth).</p></div></li>
        <li><div><b>Plug in your headset on the computer</b><p>Phone Link plays the call through the PC, so you talk and listen on the headset.</p></div></li>
        <li><div><b>Click Call in SalePunch</b><p>Your phone dials the lead from its SIM; the call shows in Phone Link on the PC.</p></div></li>
        <li><div><b>Click Start listening</b><p>Choose <b>Entire screen</b> and switch on <b>Share system audio</b>. SalePunch now hears you (microphone) and the lead (PC sound).</p></div></li></ol>
      <div><p><b>During the call</b> you see what both of you say every few seconds, translated to English if needed, plus <b>AI coach</b> tips for your next line. Managers can watch any call live from <b>Live now</b> on the Dashboard.</p>
        <p><b>When the call ends</b> the full report is ready in seconds, built from the live conversation, with the recording saved inside SalePunch.</p>
        <p class="small muted">Works in Chrome or Edge on Windows. Without Phone Link, put the phone on speaker next to the computer and choose "Listen with the microphone only".</p></div></div></div>
    <div class="panel"><h2>${ic('shield')} Questions</h2>
      <details><summary>How does SalePunch catch the conversation?</summary><p>Android doesn't let ordinary apps record calls, but the phone's own dialer can. So SalePunch works like TeleCRM, Callyzer or Salestrail. The SalePunch app dials the lead from the agent's SIM, and the phone's built-in recorder records both voices. When the call ends, the app reads the call log (length, answered or not) and uploads the newest call recording. SalePunch then writes out the conversation, separates the agent's and the lead's lines, and the AI scores it.</p></details>
      <details><summary>Can managers listen to the call while it is happening?</summary><p>Not with SIM calling: the recording is uploaded the moment the call ends. Managers can see who is on a call right now in the "Live now" strip on the Dashboard. To listen in live, use a company cloud line (Exotel), which Settings supports as the other calling mode.</p></details>
      <details><summary>What if a phone has no automatic call recorder?</summary><p>The call is still logged (time, length, answered) but without audio or AI analysis, and shows "No recording found". Most Samsung, Xiaomi, Vivo, OPPO, Realme and OnePlus phones sold in India have one, and so does the Google Phone app in India. iPhones can't record calls automatically.</p></details>
      <details><summary>Can agents use the website in a phone browser instead of the app?</summary><p>Yes. Tapping Call opens the phone dialer with the number filled in. When the agent comes back, SalePunch asks how the call went and lets them attach the recording. Only the app does all of this automatically.</p></details>
      <details><summary>Which languages work?</summary><p>English, Malayalam, Hindi, Tamil and mixed speech. Summaries and coaching are always in simple English.</p></details>
      <details><summary>Does the lead know the call is recorded?</summary><p>Some phones announce the recording to both sides. Either way, tell leads early in the call ("this call is recorded for quality"). Indian law (DPDP Act 2023) expects you to inform people and to keep recordings only as long as needed.</p></details>
    </div>`);
  const perm = document.getElementById('perm');
  if (perm) perm.onclick = () => PHONE.askPermissions();
  const rs = document.getElementById('recset');
  if (rs) rs.onclick = () => PHONE.openRecorderSettings && PHONE.openRecorderSettings();
}

// ------------------------------------------------------------ sales leaks
const LEAK_ICON = { never_called: 'users', slow_first_call: 'clock', missed_follow_ups: 'calendar', not_retried: 'phone', no_close: 'target', objections: 'alert', early_hangup: 'zap', red_flags: 'flag' };
async function leaksView(_, q) {
  shell('leaks', loading());
  const to = q.get('to') || me.today, from = q.get('from') || addDays(to, -29);
  const d = await api(`/api/leaks?from=${from}&to=${to}`);
  const top = d.funnel[0].count || 1;
  const lostTotal = d.leaks.reduce((s, l) => s + l.count, 0);
  const leadLink = (i) => i.call_id ? `#/calls/${i.call_id}` : `#/leads?q=${encodeURIComponent(i.phone || i.name)}`;
  const agentName = Object.fromEntries(d.by_agent.map((a) => [a.agent_id, a.name]));
  setMain(`<div class="head"><div><h1>Where you're losing sales</h1><div class="muted">Leads received ${new Date(from + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${new Date(to + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, and every call made on them</div></div>
      <form class="row" id="rng"><input type="date" name="from" value="${from}"><span class="muted">to</span><input type="date" name="to" value="${to}"><button>Apply</button></form></div>
    <div class="grid g4">
      ${tile('leak', lostTotal, 'Leaks found (leads & calls)', '', true)}
      ${tile('alert', d.leads_at_risk, 'Open leads at risk right now', 'bad')}
      ${tile('clock', d.avg_first_call_hours == null ? '–' : `${d.avg_first_call_hours}<small> h</small>`, 'Avg time to first call', d.avg_first_call_hours > 1 ? 'warn' : 'good')}
      ${tile('trophy', `${d.funnel.at(-1).count}<small> / ${d.funnel[0].count}</small>`, `Leads won · ${d.funnel.at(-1).pct_of_leads}%`, 'good')}
    </div><br>
    <div class="grid g-side">
      <div class="panel"><h2>${ic('chart')} Sales funnel</h2>
        ${d.funnel.map((f, i) => `<div style="margin-bottom:14px"><div class="row" style="justify-content:space-between;margin-bottom:6px"><span>${esc(f.label)}</span><span><b>${f.count}</b> <span class="muted small">${f.pct_of_leads}%</span></span></div>
          <div class="bar" style="height:14px"><i style="width:${(f.count / top) * 100}%"></i></div>
          ${i && f.drop_from_prev ? `<div class="small" style="color:var(--bad);font-weight:600;margin-top:4px">−${f.drop_from_prev} lost at this step</div>` : ''}</div>`).join('')}
        ${d.funnel[0].count ? '' : '<p class="muted">No leads in this date range yet.</p>'}</div>
      <div>
        <div class="panel"><h2>${ic('x')} Why leads said no</h2>${d.lost_reasons.length ? `<ul class="clean">${d.lost_reasons.map((r) => `<li>${ic('alert')}<span style="flex:1">${esc(r.text)}</span><span class="pill plain">× ${r.count}</span></li>`).join('')}</ul>` : '<p class="muted" style="margin:0">No "not interested" calls analysed yet.</p>'}</div>
        <div class="panel"><h2>${ic('file')} Script steps most often skipped</h2>${d.missed_steps.length ? `<ul class="clean">${d.missed_steps.map((r) => `<li>${ic('x')}<span style="flex:1">${esc(r.text)}</span><span class="pill plain">× ${r.count}</span></li>`).join('')}</ul>` : '<p class="muted" style="margin:0">Nothing yet. Add your script in Settings so calls are checked against it.</p>'}
          ${d.weakest_skills.length ? `<h3 style="margin-top:18px">Weakest team skills</h3>${d.weakest_skills.map((w) => skillRow(w.skill, w.avg)).join('')}` : ''}</div>
      </div>
    </div>
    <h2 style="margin:8px 0 14px">${ic('leak')} The leaks, biggest first</h2>
    ${d.leaks.length ? d.leaks.map((l) => `<div class="panel leakcard"><div class="row" style="justify-content:space-between;align-items:flex-start;flex-wrap:nowrap">
        <div class="row" style="align-items:flex-start;flex-wrap:nowrap;gap:14px"><div class="tile" style="padding:0;border:0;box-shadow:none;background:none"><div class="ic ${l.severity === 'high' ? 'bad' : 'warn'}" style="margin:0">${ic(LEAK_ICON[l.key] || 'alert')}</div></div>
          <div><div style="font-weight:700;font-size:16px">${esc(l.title)} <span class="pill ${l.severity === 'high' ? 'bad' : 'warn'}">${l.severity === 'high' ? 'High impact' : 'Medium'}</span></div>
          <div class="muted small" style="margin:4px 0 8px">${esc(l.why)}</div><div class="small"><b>Fix:</b> ${esc(l.action)}</div></div></div>
        <div style="text-align:right;flex:none"><div style="font-size:30px;font-weight:800;letter-spacing:-.03em;color:var(--bad)">${l.count}</div><button class="link small" data-tog>Show ${l.items.length < l.count ? 'first ' + l.items.length : 'all'}</button></div></div>
      <div class="scroll" hidden style="margin-top:14px"><table><tr><th>Lead</th><th>Detail</th>${isManager() ? '<th>Agent</th>' : ''}<th></th></tr>
        ${l.items.map((i) => `<tr><td><b>${esc(i.name)}</b>${i.phone ? `<div class="small muted">${esc(i.phone)}</div>` : ''}</td><td class="small">${esc(i.note || '')}</td>${isManager() ? `<td class="small">${esc(agentName[i.owner_id] || (i.owner_id ? '' : 'Unassigned'))}</td>` : ''}<td class="n"><a class="btn" href="${leadLink(i)}">${i.call_id ? 'Open call' : 'Open lead'}</a></td></tr>`).join('')}</table></div></div>`).join('')
      : `<div class="panel">${empty('check', 'No leaks found', 'Every lead in this range was called, followed up and handled. Nice work.')}</div>`}
    <div class="grid g2">
      ${isManager() ? `<div class="panel flush"><h2>Leaks by agent</h2><div class="scroll"><table><tr><th>Agent</th><th class="n">Leads</th><th class="n">Won</th><th class="n">Conv. %</th><th class="n">Leaks</th><th>Biggest leak</th></tr>
        ${d.by_agent.map((a) => { const big = Object.entries(a.leaks).sort((x, y) => y[1] - x[1])[0]; const L = d.leaks.find((l) => l.key === big?.[0]);
          return `<tr><td><div class="who">${avatar(a.name, true)}${esc(a.name)}</div></td><td class="n">${a.leads}</td><td class="n">${a.won}</td><td class="n">${a.conversion_pct}%</td><td class="n"><b style="color:${a.total_leaks ? 'var(--bad)' : 'inherit'}">${a.total_leaks}</b></td><td class="small">${big && big[1] ? `${esc(L?.title || big[0])} (${big[1]})` : '<span class="muted">–</span>'}</td></tr>`; }).join('') || '<tr><td colspan="6" class="muted">No data yet</td></tr>'}</table></div></div>` : ''}
      <div class="panel flush"><h2>Lead sources: which convert?</h2><div class="scroll"><table><tr><th>Source</th><th class="n">Leads</th><th class="n">Won</th><th class="n">Lost</th><th class="n">Conv. %</th></tr>
        ${d.by_source.map((s2) => `<tr><td>${esc(s2.source)}</td><td class="n">${s2.leads}</td><td class="n">${s2.won}</td><td class="n">${s2.lost}</td><td class="n"><b>${s2.conversion_pct}%</b></td></tr>`).join('') || '<tr><td colspan="5" class="muted">No leads yet</td></tr>'}</table></div></div>
    </div>`);
  document.getElementById('rng').onsubmit = (e) => { e.preventDefault(); location.hash = '#/leaks?' + new URLSearchParams(form(e.target)); };
  document.querySelectorAll('[data-tog]').forEach((b) => { b.onclick = () => { const t = b.closest('.leakcard').querySelector('.scroll'); t.hidden = !t.hidden; b.textContent = t.hidden ? 'Show' : 'Hide'; }; });
}

// ------------------------------------------------------------ productivity
async function productivityView(arg) {
  const day = arg || me.today;
  shell('productivity', loading());
  const d = await api(`/api/productivity?day=${day}`);
  const time = (ms) => (ms ? new Date(ms).toLocaleTimeString('en-IN', { timeZone: TZ, hour: 'numeric', minute: '2-digit' }) : '–');
  const tot = d.agents.reduce((a, x) => ({ calls: a.calls + x.calls, talk: a.talk + x.talk_time_sec, conn: a.conn + x.connected }), { calls: 0, talk: 0, conn: 0 });
  const HRS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 am – 8 pm
  const maxH = Math.max(1, ...d.agents.flatMap((a) => HRS.map((h) => a.hours[h])));
  const hourLbl = (h) => `${h % 12 || 12}${h < 12 ? 'a' : 'p'}`;
  setMain(`<div class="head"><div><h1>Productivity</h1><div class="muted">What each agent did, hour by hour · target ${d.target} calls/day</div></div>${dayNav('productivity', day)}</div>
    <div class="grid g4">
      ${tile('phone', tot.calls, 'Calls made today', '', true)}
      ${tile('check', `${tot.conn}<small> · ${tot.calls ? Math.round((tot.conn / tot.calls) * 100) : 0}%</small>`, 'Connected (spoke to lead)', 'good')}
      ${tile('clock', mins(tot.talk), 'Total talk time', 'info')}
      ${tile('zap', d.best_hours[0] ? `${hourLbl(d.best_hours[0].hour)}–${hourLbl(d.best_hours[0].hour + 1)}` : '–', d.best_hours[0] ? `Best hour to call · ${d.best_hours[0].connect_pct}% pick up` : 'Best hour to call (needs more calls)', 'violet')}
    </div><br>
    <div class="panel flush"><h2>Agents today</h2><div class="scroll"><table>
      <tr><th>Agent</th><th>Target</th><th class="n">Calls</th><th class="n">Connected</th><th class="n">Talk</th><th class="n">Converted</th><th>First call</th><th>Last call</th><th class="n">Calls / hr</th><th class="n">Longest break</th></tr>
      ${d.agents.map((a) => `<tr class="click" data-href="#/calls?agent=${a.agent_id}&from=${day}&to=${day}"><td><div class="who">${avatar(a.name, true)}${esc(a.name)}</div></td>
        <td style="min-width:140px"><div class="bar ${band(a.target_pct)}"><i style="width:${Math.min(100, a.target_pct)}%"></i></div><span class="small muted">${a.calls}/${a.target} · ${a.target_pct}%</span></td>
        <td class="n"><b>${a.calls}</b></td><td class="n">${a.connected} <span class="muted small">${a.connect_pct}%</span></td><td class="n">${mins(a.talk_time_sec)}</td><td class="n">${a.converted}</td>
        <td class="small">${time(a.first_call)}</td><td class="small">${time(a.last_call)}</td><td class="n">${a.calls ? a.calls_per_hour : '–'}</td>
        <td class="n">${a.calls > 1 ? `<span class="${a.longest_gap_min > 60 ? 'pill warn' : ''}">${a.longest_gap_min} min</span>` : '–'}</td></tr>`).join('')}</table></div></div>
    <div class="panel"><h2>${ic('chart')} Calls by hour</h2><div class="scroll"><table class="heat"><tr><th>Agent</th>${HRS.map((h) => `<th class="n">${hourLbl(h)}</th>`).join('')}</tr>
      ${d.agents.map((a) => `<tr><td style="white-space:nowrap">${esc(a.name)}</td>${HRS.map((h) => { const n = a.hours[h]; return `<td class="n" style="background:${n ? `rgba(255,90,31,${0.12 + (n / maxH) * 0.75})` : 'transparent'};color:${n / maxH > 0.55 ? '#fff' : 'inherit'};font-weight:${n ? 700 : 400}">${n || ''}</td>`; }).join('')}</tr>`).join('')}</table></div>
      <p class="small muted" style="margin:12px 0 0">Empty hours in the working day mean no calls were made. Breaks over 60 minutes are highlighted in the table above.</p></div>
    ${d.hours.length ? `<div class="panel"><h2>${ic('target')} When leads pick up</h2><div class="row" style="align-items:flex-end;gap:6px;height:160px">
      ${d.hours.map((h) => `<div style="flex:1;min-width:26px;text-align:center"><div class="small" style="font-weight:700">${h.connect_pct}%</div><div style="height:${Math.max(4, h.connect_pct)}px;max-height:110px;background:var(--grad);border-radius:6px 6px 0 0;margin:4px 0"></div><div class="small muted">${hourLbl(h.hour)}</div></div>`).join('')}</div>
      <p class="small muted" style="margin:10px 0 0">Share of calls answered, by hour of the day. Call your hottest leads in the best hours.</p></div>` : ''}`);
  document.getElementById('day').onchange = (e) => { location.hash = `#/productivity/${e.target.value}`; };
  bindRowLinks();
}


// ------------------------------------------------------------ CRM: lead page, pipeline, tasks
const nowIST = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM in India time
const dueLabel = (d, done = false) => {
  if (!d) return '<span class="muted">No date</span>';
  const [date, time] = d.split('T');
  const t = time ? ' ' + new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : '';
  const label = date === me.today ? 'Today' : date === addDays(me.today, 1) ? 'Tomorrow' : new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const late = !done && (time ? d : date + 'T23:59') < nowIST();
  return `<span class="${late ? 'score lo' : ''}">${label}${t}${late ? ' · overdue' : ''}</span>`;
};
const waLink = (phone, text = '') => `https://wa.me/${String(phone || '').replace(/\D/g, '')}${text ? '?text=' + encodeURIComponent(text) : ''}`;

function taskRow(t, { showLead = false } = {}) {
  return `<li class="task" data-task="${t.id}" style="display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--line)">
    <input type="checkbox" data-done ${t.done ? 'checked' : ''} style="width:20px;height:20px;margin-top:2px;flex:none" aria-label="Done">
    <div style="flex:1;min-width:0"><div style="${t.done ? 'text-decoration:line-through;color:var(--muted)' : 'font-weight:600'}">${esc(t.title)}</div>
      <div class="small muted">${dueLabel(t.due_at, t.done)}${showLead && t.lead_id ? ` · <a href="#/lead/${t.lead_id}">${esc(t.lead_name || 'Lead')}</a>` : ''}${isManager() && t.user_name ? ` · ${esc(t.user_name)}` : ''}</div></div>
    <button class="link small" data-del title="Delete task">${ic('x')}</button></li>`;
}
function bindTasks(root, after) {
  root.querySelectorAll('[data-task]').forEach((li) => {
    li.querySelector('[data-done]').onchange = async (e) => {
      try { await api(`/api/tasks/${li.dataset.task}`, { method: 'PATCH', body: { done: e.target.checked } }); toast(e.target.checked ? 'Task done' : 'Task reopened'); after(); } catch (err) { toast(err.message); }
    };
    li.querySelector('[data-del]').onclick = async () => {
      if (!confirm('Delete this task?')) return;
      try { await api(`/api/tasks/${li.dataset.task}`, { method: 'DELETE' }); after(); } catch (err) { toast(err.message); }
    };
  });
}
function taskForm(users, leadId = '') {
  return `<form class="taskform" style="display:grid;gap:8px;margin-top:12px"><input name="title" placeholder="New task, e.g. Send quotation on WhatsApp" required maxlength="200">
    <div class="row"><input type="datetime-local" name="due_at" style="flex:1;min-width:170px" value="${nowIST().slice(0, 11)}17:00">
    ${isManager() ? `<select name="user_id" style="flex:1;min-width:140px">${users.filter((u) => u.active).map((u) => `<option value="${u.id}" ${u.id === me.user.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select>` : ''}
    <input type="hidden" name="lead_id" value="${esc(leadId)}"><button class="primary">${ic('plus')} Add</button></div></form>`;
}
function bindTaskForm(root, after) {
  const f = root.querySelector('.taskform');
  if (!f) return;
  f.onsubmit = async (e) => {
    e.preventDefault();
    const b = form(f);
    if (!b.lead_id) delete b.lead_id;
    try { await api('/api/tasks', { method: 'POST', body: b }); toast('Task added'); after(); } catch (err) { toast(err.message); }
  };
}

async function leadView(id) {
  shell('leads', loading());
  const [d, { users }] = await Promise.all([api(`/api/leads/${id}`), api('/api/users')]);
  const l = d.lead;
  const agentOpts = `<option value="">Unassigned</option>${users.filter((u) => u.active || u.id === l.owner_id).map((u) => `<option value="${u.id}" ${l.owner_id === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}`;
  const events = [
    ...d.calls.map((c) => ({ t: c.started_at, html: `<div class="tl"><span class="tl-ic" style="background:var(--good-soft);color:var(--good)">${ic('phone')}</span><div style="flex:1;min-width:0">
      <div class="row" style="justify-content:space-between"><b>Call · ${esc(c.agent_name || '')}</b>${outcomePill(c)}</div>
      <div class="small muted">${when(c.started_at)} · ${dur(c.duration_sec)}${c.skill_score != null ? ` · skill ${c.skill_score}/100` : ''}${c.conversion_chance != null ? ` · ${c.conversion_chance}% chance` : ''}</div>
      ${c.summary ? `<div class="small" style="margin-top:4px">${esc(c.summary)}</div>` : ''}${c.next_action ? `<div class="small" style="margin-top:4px"><b>Next:</b> ${esc(c.next_action)}</div>` : ''}
      <a class="small" href="#/calls/${c.id}">Open call report →</a></div></div>` })),
    ...d.notes.map((n) => ({ t: n.created_at, html: `<div class="tl"><span class="tl-ic" style="background:var(--warn-soft);color:var(--warn)">${ic('file')}</span><div style="flex:1;min-width:0">
      <div class="row" style="justify-content:space-between"><b>Note · ${esc(n.user_name || '')}</b>${n.user_id === me.user.id || isManager() ? `<button class="link small" data-delnote="${n.id}">Delete</button>` : ''}</div>
      <div class="small muted">${when(n.created_at)}</div><div style="white-space:pre-wrap;margin-top:4px">${esc(n.body)}</div></div></div>` })),
    ...d.activities.map((a) => ({ t: a.created_at, html: `<div class="tl"><span class="tl-ic" style="background:var(--lead);color:var(--muted)">${ic(a.kind === 'status' ? 'trend' : a.kind === 'owner' ? 'users' : a.kind === 'task' ? 'check' : 'clock')}</span><div style="flex:1">
      <div class="small">${esc(a.text)}${a.user_name ? ` <span class="muted">· ${esc(a.user_name)}</span>` : ''}</div><div class="small muted">${when(a.created_at)}</div></div></div>` })),
  ].sort((a, b) => b.t - a.t);
  const field = (name, label, value, type = 'text', extra = '') => `<label>${label}<input name="${name}" type="${type}" value="${esc(value ?? '')}" ${extra}></label>`;
  setMain(`<div class="head"><div><a href="#/leads" class="crumb">${ic('left')} Leads</a><h1>${esc(l.name)}</h1>
      <div class="row muted"><span class="pill ${esc(l.status)}">${esc(STATUS_LABEL[l.status] || l.status)}</span>${l.company ? `<span>${esc(l.company)}</span>·` : ''}<span>${esc(l.phone)}</span>
        ${l.deal_value ? `· <b style="color:var(--ink)">${inr(l.deal_value)}</b>` : ''}${l.owner_name ? `· ${avatar(l.owner_name, true)} ${esc(l.owner_name)}` : ''}</div>
      ${l.tags ? `<div style="margin-top:8px">${tagChips(l.tags)}</div>` : ''}</div>
      <div class="row"><button class="call" id="callBtn">${ic('phone')} Call</button>${ON_PHONE ? '' : `<button class="btn" id="webCallBtn" title="Talk on this computer; the lead joins from a link">${ic('mic')} Internet call</button>`}
        <a class="btn" target="_blank" rel="noopener" href="${waLink(l.phone, `Hi ${l.name.split(' ')[0]}, `)}">WhatsApp</a>
        ${l.email ? `<a class="btn" href="mailto:${esc(l.email)}">Email</a>` : ''}</div></div>
    ${recNotice()}
    <div class="grid g4" style="margin-bottom:18px">
      ${tile('phone', d.calls.length, 'Calls with this lead', 'good')}
      ${tile('target', d.calls.find((c) => c.conversion_chance != null)?.conversion_chance != null ? d.calls.find((c) => c.conversion_chance != null).conversion_chance + '<small>%</small>' : '–', 'Latest chance to buy', 'info')}
      ${tile('calendar', l.next_follow_up ? new Date(l.next_follow_up + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '–', 'Next follow-up', l.next_follow_up && l.next_follow_up < me.today ? 'bad' : 'warn')}
      ${tile('trophy', inr(l.deal_value) || '–', l.expected_close ? `Deal · close by ${l.expected_close}` : 'Deal value', 'violet')}
    </div>
    <div class="grid g-side">
      <div>
        <div class="panel"><h2>${ic('clock')} Timeline</h2>
          <form id="noteF"><textarea name="body" placeholder="Add a note: what was discussed, what they need…" style="min-height:80px" required></textarea>
            <div class="row" style="justify-content:flex-end;margin-top:8px"><button class="primary">${ic('plus')} Add note</button></div></form>
          <div class="timeline" style="margin-top:14px">${events.length ? events.map((e) => e.html).join('') : '<p class="muted">Nothing yet. Calls, notes and changes appear here.</p>'}</div></div>
      </div>
      <div>
        <div class="panel"><h2>${ic('check')} Tasks</h2><ul class="clean" id="taskList">${d.tasks.length ? d.tasks.map((t) => taskRow(t)).join('') : '<li class="muted small">No tasks for this lead.</li>'}</ul>${taskForm(users, l.id)}</div>
        <form class="panel" id="leadF"><h2>${ic('users')} Details</h2>
          <div class="grid g2" style="gap:0 12px">${field('name', 'Name', l.name, 'text', 'required')}${field('phone', 'Phone', l.phone, 'tel', 'required')}
          ${field('email', 'Email', l.email, 'email')}${field('company', 'Company', l.company)}
          <label>Stage<select name="status">${LEAD_STATUSES.map((s2) => `<option value="${s2}" ${l.status === s2 ? 'selected' : ''}>${STATUS_LABEL[s2]}</option>`).join('')}</select></label>
          ${isManager() ? `<label>Agent<select name="owner_id">${agentOpts}</select></label>` : field('city', 'City', l.city)}
          ${field('deal_value', 'Deal value (₹)', l.deal_value || '', 'text', 'inputmode="numeric"')}${field('expected_close', 'Expected close', l.expected_close, 'date')}
          ${field('next_follow_up', 'Next follow-up', l.next_follow_up, 'date')}${isManager() ? field('city', 'City', l.city) : field('source', 'Source', l.source)}</div>
          ${isManager() ? field('source', 'Source', l.source) : ''}${field('tags', 'Tags (comma separated)', l.tags)}
          <label>Notes about this lead<textarea name="notes" style="min-height:70px">${esc(l.notes || '')}</textarea></label>
          <div class="row" style="justify-content:space-between">${isManager() ? '<button type="button" class="link small" id="delLead" style="color:var(--bad)">Delete lead</button>' : '<span></span>'}<button class="primary">${ic('check')} Save</button></div></form>
      </div>
    </div>`);
  const reload = () => leadView(id);
  document.getElementById('callBtn').onclick = async () => { try { await startCall(l.id, l.name); } catch (e) { toast(e.message); } };
  const wcb = document.getElementById('webCallBtn');
  if (wcb) wcb.onclick = () => startWebCall(l.id, l.name);
  document.getElementById('noteF').onsubmit = async (e) => {
    e.preventDefault();
    try { await api(`/api/leads/${id}/notes`, { method: 'POST', body: form(e.target) }); reload(); } catch (err) { toast(err.message); }
  };
  document.querySelectorAll('[data-delnote]').forEach((b) => { b.onclick = async () => { if (!confirm('Delete this note?')) return; try { await api(`/api/notes/${b.dataset.delnote}`, { method: 'DELETE' }); reload(); } catch (err) { toast(err.message); } }; });
  document.getElementById('leadF').onsubmit = async (e) => {
    e.preventDefault();
    try { await api(`/api/leads/${id}`, { method: 'PATCH', body: form(e.target) }); toast('Saved'); reload(); } catch (err) { toast(err.message); }
  };
  const del = document.getElementById('delLead');
  if (del) del.onclick = async () => {
    if (!confirm(`Delete ${l.name}? Their calls stay in Calls, but notes and tasks are removed.`)) return;
    try { await api(`/api/leads/${id}`, { method: 'DELETE' }); toast('Lead deleted'); location.hash = '#/leads'; } catch (err) { toast(err.message); }
  };
  bindTasks(document.getElementById('main'), reload);
  bindTaskForm(document.getElementById('main'), reload);
  bindRecFix();
}

async function pipelineView(_, q) {
  shell('pipeline', loading());
  const owner = q.get('owner') || '';
  const [d, { users }] = await Promise.all([api('/api/pipeline' + (owner ? `?owner=${owner}` : '')), api('/api/users')]);
  setMain(`<div class="head"><div><h1>Pipeline</h1><div class="muted">Open deals worth <b style="color:var(--ink)">${inr(d.open_value) || '₹0'}</b> · won ${inr(d.won_value) || '₹0'} · drag a card to change its stage</div></div>
      <div class="row">${isManager() ? `<select id="own"><option value="">All agents</option>${users.map((u) => `<option value="${u.id}" ${owner === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select>` : ''}<a class="btn" href="#/leads">${ic('users')} List view</a></div></div>
    <div class="board">${d.stages.map((st) => `<section class="col" data-stage="${st.key}">
      <header><span class="pill ${st.key}">${esc(st.label)}</span><span class="small muted">${st.count}${st.value ? ' · ' + inr(st.value) : ''}</span></header>
      <div class="cards">${st.leads.map((l) => `<article class="card" draggable="true" data-id="${l.id}" data-stage="${st.key}">
        <a href="#/lead/${l.id}" style="color:inherit;text-decoration:none"><b>${esc(l.name)}</b>${l.company ? `<div class="small muted">${esc(l.company)}</div>` : ''}</a>
        <div class="row small" style="justify-content:space-between;margin-top:6px">${l.deal_value ? `<b>${inr(l.deal_value)}</b>` : '<span class="muted">No value</span>'}${l.owner_name ? `<span class="muted">${esc(l.owner_name.split(' ')[0])}</span>` : ''}</div>
        ${l.next_follow_up ? `<div class="small" style="margin-top:4px">${ic('calendar')} ${l.next_follow_up < me.today ? `<span class="score lo">${esc(l.next_follow_up)}</span>` : esc(l.next_follow_up)}</div>` : ''}
        <select class="mv small" aria-label="Move to stage">${LEAD_STATUSES.map((s2) => `<option value="${s2}" ${s2 === st.key ? 'selected' : ''}>${STATUS_LABEL[s2]}</option>`).join('')}</select></article>`).join('') || '<div class="small muted empty-col">No leads</div>'}
        ${st.count > st.leads.length ? `<a class="small" href="#/leads?status=${st.key}">+${st.count - st.leads.length} more</a>` : ''}</div></section>`).join('')}</div>`);
  const own = document.getElementById('own');
  if (own) own.onchange = () => { location.hash = '#/pipeline' + (own.value ? `?owner=${own.value}` : ''); };
  const move = async (leadId, stage) => {
    try { await api(`/api/leads/${leadId}`, { method: 'PATCH', body: { status: stage } }); toast(`Moved to ${STATUS_LABEL[stage]}`); } catch (e) { toast(e.message); }
    pipelineView(_, q);
  };
  document.querySelectorAll('.card').forEach((c) => {
    c.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', c.dataset.id); c.classList.add('drag'); });
    c.addEventListener('dragend', () => c.classList.remove('drag'));
    c.querySelector('.mv').onchange = (e) => move(c.dataset.id, e.target.value);
  });
  document.querySelectorAll('.col').forEach((col) => {
    col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('over'); });
    col.addEventListener('dragleave', () => col.classList.remove('over'));
    col.addEventListener('drop', (e) => {
      e.preventDefault(); col.classList.remove('over');
      const leadId = e.dataTransfer.getData('text/plain');
      const card = document.querySelector(`.card[data-id="${leadId}"]`);
      if (leadId && card && card.dataset.stage !== col.dataset.stage) move(leadId, col.dataset.stage);
    });
  });
}

async function tasksView(_, q) {
  shell('tasks', loading());
  const who = q.get('user') || 'me';
  const [{ tasks }, { users }] = await Promise.all([api(`/api/tasks?user=${encodeURIComponent(who)}`), api('/api/users')]);
  const now = nowIST(), today = me.today;
  const open = tasks.filter((t) => !t.done), done = tasks.filter((t) => t.done).slice(0, 30);
  const due = (t) => t.due_at ? (t.due_at.length === 10 ? t.due_at + 'T23:59' : t.due_at) : null;
  const groups = [
    ['Overdue', open.filter((t) => due(t) && due(t) < now)],
    ['Today', open.filter((t) => due(t) && due(t) >= now && t.due_at.slice(0, 10) === today)],
    ['Upcoming', open.filter((t) => due(t) && t.due_at.slice(0, 10) > today)],
    ['No date', open.filter((t) => !t.due_at)],
  ];
  setMain(`<div class="head"><div><h1>Tasks</h1><div class="muted">${open.length} open · calls to make, quotes to send, visits to fix</div></div>
      ${isManager() ? `<div class="seg" style="padding:3px">${[['me', 'Mine'], ['all', 'Everyone']].concat(users.filter((u) => u.id !== me.user.id).map((u) => [u.id, u.name.split(' ')[0]])).map(([k, l]) => `<a href="#/tasks?user=${k}" style="${who === k ? 'background:var(--brand-soft);color:var(--brand-2);font-weight:700' : ''}">${esc(l)}</a>`).join('')}</div>` : ''}</div>
    <div class="grid g-side">
      <div class="panel">${groups.map(([label, list]) => list.length ? `<h3 style="margin-top:6px;color:${label === 'Overdue' ? 'var(--bad)' : 'var(--muted)'}">${label} · ${list.length}</h3><ul class="clean">${list.map((t) => taskRow(t, { showLead: true })).join('')}</ul>` : '').join('') || empty('check', 'All clear', 'No open tasks. Add one on the right, or from any lead.')}</div>
      <div><div class="panel"><h2>${ic('plus')} New task</h2>${taskForm(users)}</div>
        ${done.length ? `<div class="panel"><h3>Recently done</h3><ul class="clean">${done.map((t) => taskRow(t, { showLead: true })).join('')}</ul></div>` : ''}</div>
    </div>`);
  const reload = () => tasksView(_, q);
  bindTasks(document.getElementById('main'), reload);
  bindTaskForm(document.getElementById('main'), reload);
}

// ------------------------------------------------------------ router
const VIEWS = { pipeline: pipelineView, tasks: tasksView, leaks: leaksView, productivity: productivityView, dashboard: dashboardView, calls: callsView, leads: leadsView, upload: uploadView, reports: reportsView, team: teamView, settings: settingsView, guide: guideView };
async function route() {
  const [path, qs] = location.hash.replace(/^#\/?/, '').split('?');
  const [name, arg] = path.split('/');
  const q = new URLSearchParams(qs || '');
  try {
    if (name === 'calls' && arg) return await callView(arg);
    if (name === 'lead' && arg) return await leadView(arg);
    await (VIEWS[name] || dashboardView)(arg, q);
    window.scrollTo(0, 0);
  } catch (e) {
    if (me) setMain(`<div class="flag">${ic('alert')}<div>${esc(e.message)}</div></div>`);
  }
}
async function render() {
  if (!me) {
    try { me = await api('/api/me', { quiet: true }); } catch { return authView(); }
  }
  route();
}
window.addEventListener('hashchange', () => me && route());
render();
