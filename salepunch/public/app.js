// SalePunch dashboard (no build step). Hash routes: #/dashboard, #/calls,
// #/calls/<id>, #/leads, #/upload, #/reports/<day>, #/team, #/settings, #/guide.
const $app = document.getElementById('app');
const SKILL_LABELS = {
  opening: 'Opening & greeting', discovery: 'Questions / need discovery', pitch: 'Product pitch',
  objection_handling: 'Objection handling', closing: 'Closing & next step', tone: 'Tone & politeness', listening: 'Listening',
};
const OUTCOME_LABEL = { converted: 'Converted', interested: 'Interested', follow_up: 'Follow-up', not_interested: 'Not interested', no_conversation: 'No conversation' };
const LEAD_STATUSES = ['new', 'contacted', 'interested', 'follow_up', 'won', 'lost'];
const STATUS_LABEL = { new: 'New', contacted: 'Contacted', interested: 'Interested', follow_up: 'Follow-up', won: 'Won', lost: 'Lost' };
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
const when = (ms) => new Date(ms).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
const band = (pct) => (pct == null ? '' : pct >= 70 ? 'hi' : pct >= 45 ? 'mid' : 'lo');
const score = (v, max = 100) => (v == null ? '<span class="muted">–</span>' : `<span class="score ${band((v / max) * 100)}">${v}</span>`);
const outcomePill = (c) => {
  if (c.status && c.status !== 'completed') return `<span class="pill">${esc(CALL_STATUS[c.status] || c.status)}</span>`;
  if (c.processing === 'error') return '<span class="pill error">Analysis failed</span>';
  if (c.processing !== 'done') return '<span class="pill info">Analysing…</span>';
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
  ['Workspace'], ['dashboard', 'Dashboard', 'grid'], ['leads', 'Leads', 'users'], ['calls', 'Calls', 'phone'], ['upload', 'Add a call', 'upload'],
  ['Insights'], ['reports', 'Daily reports', 'file'], ['team', 'Team', 'team'], ['settings', 'Settings', 'cog', true], ['guide', 'How it works', 'book'],
];
function shell(active, content) {
  $app.innerHTML = `<div class="layout">
    <nav class="side">
      <div class="brand"><img src="logo.svg" alt=""><div>SalePunch<small>Call intelligence</small></div></div>
      ${NAV.filter(([, , , m]) => !m || isManager()).map(([k, l, i]) => (l ? `<a href="#/${k}" class="${k === active ? 'on' : ''}" title="${l}">${ic(i)}<span class="lbl">${l}</span></a>` : `<div class="sec">${k}</div>`)).join('')}
      <div class="me">${avatar(me.user.name)}<div><b>${esc(me.user.name)}</b><span>${esc(me.user.role)}${me.company ? ' · ' + esc(me.company) : ''}</span></div>
        <button id="logout" title="Sign out" aria-label="Sign out">${ic('logout')}</button></div>
    </nav>
    <main id="main">${content}</main></div>`;
  document.getElementById('logout').onclick = async () => { await api('/api/logout', { method: 'POST' }); me = null; render(); };
}
const setMain = (html) => { document.getElementById('main').innerHTML = html; };
const dayNav = (base, day) => `<div class="seg"><a href="#/${base}/${addDays(day, -1)}" aria-label="Previous day">${ic('left')}</a><input type="date" id="day" value="${day}"><a href="#/${base}/${addDays(day, 1)}" aria-label="Next day">${ic('right')}</a></div>`;

// ------------------------------------------------------------ auth
function authShell(inner) {
  $app.innerHTML = `<div class="auth-wrap">
    <section class="auth-hero">
      <div class="brand"><img src="logo.svg" alt="">SalePunch</div>
      <div><h1>Hear every sales call. <em>Know who's converting.</em></h1>
        <p>Every call your team makes is recorded, written out from hello to goodbye, and scored by AI, so you know what was said and who is closing.</p>
        <ul><li><span>${ic('mic')}</span>Calls recorded through your company number</li>
          <li><span>${ic('brain')}</span>AI scores selling skills and conversion chance</li>
          <li><span>${ic('chart')}</span>Daily reports and coaching for every agent</li>
          <li><span>${ic('users')}</span>Built-in CRM that connects to your lead forms</li></ul></div>
      <div class="foot">© ${new Date().getFullYear()} SalePunch</div>
    </section>
    <section class="auth-form"><div>${inner}</div></section></div>`;
}
async function authView() {
  const st = await api('/api/status', { quiet: true });
  if (st.needsSetup) {
    authShell(`<h2>Set up your workspace</h2><p class="muted">Create the admin account. You can add your agents next.</p>
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
  authShell(`<h2>Welcome back</h2><p class="muted">Sign in to your SalePunch workspace.</p>
    <form id="f"><label>Email<input name="email" type="email" autocomplete="username" required></label>
    <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
    <button class="primary">Sign in</button></form>`);
  document.getElementById('f').onsubmit = async (e) => {
    e.preventDefault();
    try { await api('/api/login', { method: 'POST', body: form(e.target), quiet: true }); render(); } catch (err) { toast(err.message); }
  };
}

// ------------------------------------------------------------ dashboard
function setupNotices() {
  let h = '';
  if (!me.telephony) h += `<div class="notice">${ic('phone')}<div>The <b>Call</b> button turns on once Exotel is connected. Until then, add calls with <a href="#/upload">Add a call</a>. <a href="#/guide">How it works</a></div></div>`;
  if (!me.ai) h += `<div class="notice">${ic('brain')}<div>AI analysis isn't connected (no Claude API key), so calls only get a rough keyword estimate.</div></div>`;
  return h;
}
async function dashboardView(arg) {
  const day = arg || me.today;
  shell('dashboard', loading());
  const d = await api(`/api/dashboard?from=${day}`);
  const t = d.team;
  const pipe = Object.fromEntries(d.pipeline.map((p) => [p.status, p.n]));
  const pipeTotal = LEAD_STATUSES.reduce((s, k) => s + (pipe[k] || 0), 0);
  const hello = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
  setMain(`
    <div class="head"><div><h1>${hello}, ${esc(me.user.name.split(' ')[0])}</h1><div class="muted">${isManager() ? 'Your team' : 'Your calls'} · ${new Date(day + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div></div>
      ${dayNav('dashboard', day)}</div>
    ${setupNotices()}
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
          <div class="bar" style="height:12px;display:flex;margin-bottom:14px">${LEAD_STATUSES.map((s) => pipe[s] ? `<i style="width:${(pipe[s] / pipeTotal) * 100}%;border-radius:0;background:var(--${{ new: 'violet', contacted: 'warn', interested: 'info', follow_up: 'warn', won: 'good', lost: 'bad' }[s]})"></i>` : '').join('')}</div>
          <div class="row">${LEAD_STATUSES.map((s) => `<a class="pill ${s}" href="#/leads?status=${s}">${STATUS_LABEL[s]} ${pipe[s] || 0}</a>`).join('')}</div>
          ${d.follow_ups_due ? `<p style="margin:14px 0 0"><a class="btn" href="#/leads?due=1">${ic('calendar')} ${d.follow_ups_due} follow-up${d.follow_ups_due > 1 ? 's' : ''} due today</a></p>` : ''}</div>
      </div>
    </div>`);
  document.getElementById('day').onchange = (e) => { location.hash = `#/dashboard/${e.target.value}`; };
  bindRowLinks();
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
  const a = c.analysis;
  const keys = new Map((a?.key_moments || []).map((m) => [m.segment, m.note]));
  const chat = (c.transcript || []).map((s, i) => `<div class="msg ${s.speaker === 'agent' ? 'agent' : ''} ${keys.has(i) ? 'key' : ''}">
      <span class="t">${s.speaker === 'agent' ? esc(c.agent_name || 'Agent') : esc(c.lead_name || 'Lead')} · ${c.has_audio ? `<button class="link" data-seek="${s.start}">${ic('clock')} ${dur(s.start)}</button>` : dur(s.start)}</span>${esc(s.text)}
      ${keys.has(i) ? `<span class="note">★ ${esc(keys.get(i))}</span>` : ''}</div>`).join('');
  const li = (icon, x) => `<li>${ic(icon)}<span>${esc(x)}</span></li>`;
  setMain(`<div class="head"><div><a href="#/calls" class="crumb">${ic('left')} Calls</a><h1>${esc(c.lead_name || c.lead_phone || 'Call')}</h1>
      <div class="row muted">${avatar(c.agent_name, true)} ${esc(c.agent_name || '')} · ${when(c.started_at)} · ${dur(c.duration_sec)}${c.language ? ' · ' + esc(c.language) : ''} ${outcomePill(c)}</div></div>
      <div class="row">${c.lead_id ? `<a class="btn" href="#/calls?lead=${c.lead_id}&from=2000-01-01">All calls with this lead</a>` : ''}
      ${isManager() ? '<button id="re">Re-analyse</button>' : ''}</div></div>
    ${c.processing === 'error' ? `<div class="flag">${ic('alert')}<div>Analysis failed: ${esc(c.error)}</div></div>` : ''}
    ${c.processing !== 'done' && c.processing !== 'error' && c.status === 'completed' ? `<div class="notice">${ic('clock')}<div>This call is being transcribed and analysed. It usually takes about a minute. <a href="javascript:location.reload()">Refresh</a></div></div>` : ''}
    ${a ? `<div class="panel"><div class="grid g4">
      ${ring(a.overall_score, 'Sales skill', 'Score out of 100')}
      ${ring(a.conversion_chance, 'Chance to convert', `${a.conversion_chance}% likely to buy`)}
      ${ring(a.script_adherence.score, 'Script followed', `${a.script_adherence.missed.length} step${a.script_adherence.missed.length === 1 ? '' : 's'} missed`)}
      ${ring(a.talk_ratio, 'Agent talk share', a.talk_ratio > 65 ? 'Talking too much; listen more' : a.talk_ratio < 30 ? 'Agent too quiet' : 'Good balance')}
    </div></div>` : ''}
    <div class="grid g-side">
      <div>
        ${c.has_audio ? `<div class="player"><h3>Call recording</h3><audio id="aud" controls preload="none" src="/api/calls/${c.id}/audio"></audio></div>` : ''}
        <div class="panel"><h2>${ic('mic')} Conversation, hello to goodbye</h2>${chat ? `<div class="chat">${chat}</div>` : empty('mic', 'No transcript yet', 'It appears here once the call is processed.')}</div>
      </div>
      <div>${a ? `
        ${a.red_flags.map((f) => `<div class="flag">${ic('flag')}<div>${esc(f)}</div></div>`).join('')}
        <div class="panel"><h3>AI summary</h3><p style="margin-top:0;font-size:15px">${esc(a.summary)}</p>
          ${a.lead_intent ? `<p><b>What the lead wants:</b> ${esc(a.lead_intent)}</p>` : ''}
          ${a.next_action ? `<div class="notice" style="margin:0;background:var(--info-soft);color:var(--info)">${ic('calendar')}<div><b>Next step:</b> ${esc(a.next_action)}${a.follow_up_date ? ` (by ${esc(a.follow_up_date)})` : ''}</div></div>` : ''}
          ${a.engine === 'keywords' ? '<p class="small muted">Keyword estimate. Connect Claude for a full analysis.</p>' : ''}</div>
        <div class="panel"><h3>Sales skills</h3>${Object.keys(SKILL_LABELS).map((k) => skillRow(k, a.skills[k])).join('')}</div>
        ${a.objections.length ? `<div class="panel"><h3>Objections from the lead</h3>${a.objections.map((o) => `<div style="margin-bottom:12px"><div class="row" style="justify-content:space-between"><b>“${esc(o.objection)}”</b><span class="pill ${o.handled_well ? 'good' : 'bad'}">${o.handled_well ? 'Handled' : 'Not handled'}</span></div><div class="small muted">Agent's reply: ${esc(o.agent_response || '—')}</div></div>`).join('')}</div>` : ''}
        <div class="panel"><h3>Script check</h3><div class="grid g2"><div><b class="small">Done</b><ul class="clean small" style="margin-top:8px">${a.script_adherence.followed.map((x) => li('check', x)).join('') || '<li class="muted">–</li>'}</ul></div>
          <div><b class="small">Missed</b><ul class="clean small" style="margin-top:8px">${a.script_adherence.missed.map((x) => li('x', x)).join('') || '<li class="muted">Nothing missed</li>'}</ul></div></div></div>
        ${a.strengths.length || a.improvements.length ? `<div class="panel"><h3>Coaching</h3>${a.strengths.length ? `<b class="small" style="color:var(--good)">Did well</b><ul class="clean small" style="margin:8px 0 14px">${a.strengths.map((x) => li('star', x)).join('')}</ul>` : ''}
          ${a.improvements.length ? `<b class="small" style="color:var(--brand-2)">Improve next time</b><ul class="clean small" style="margin-top:8px">${a.improvements.map((x) => li('trend', x)).join('')}</ul>` : ''}</div>` : ''}` : ''}
      </div></div>`);
  document.querySelectorAll('[data-seek]').forEach((b) => { b.onclick = () => { const au = document.getElementById('aud'); au.currentTime = Number(b.dataset.seek); au.play(); }; });
  const re = document.getElementById('re');
  if (re) re.onclick = async () => { await api(`/api/calls/${c.id}/reprocess`, { method: 'POST' }); toast('Re-analysing. Refresh in a minute.'); };
}

// ------------------------------------------------------------ live call tracker
let liveTimer = null;
function liveCall(callId, leadName) {
  const el = document.getElementById('live');
  const started = Date.now();
  clearInterval(liveTimer);
  const draw = (c) => {
    const st = c?.status || 'dialing', pr = c?.processing || 'pending';
    const fail = ['no_answer', 'busy', 'failed'].includes(st);
    const done = pr === 'done';
    const step = (on, ok, text) => `<div class="${ok ? 'ok' : on ? 'on' : ''}">${ic(ok ? 'check' : 'clock')}${text}</div>`;
    const ended = st !== 'dialing';
    el.className = `show ${done ? 'done' : ''} ${fail ? 'fail' : ''}`;
    el.innerHTML = `<div class="top"><div class="pulse">${ic('phone')}</div><div><b>${esc(leadName)}</b><div class="small" style="color:var(--side-muted)">${
      fail ? esc(CALL_STATUS[st] || st) : done ? 'Call analysed' : ended ? 'Call ended, processing' : 'Answer your phone. SalePunch connects the lead'}</div></div>
      <button class="x" aria-label="Close">${ic('x')}</button></div>
      ${fail ? '' : `<div class="steps">${step(!ended, ended, 'Your phone rings, then the lead is connected')}${step(ended && pr === 'pending', ended && pr !== 'pending', 'Recording saved')}
        ${step(pr === 'transcribing', ['analyzing', 'done'].includes(pr), 'Writing out the conversation')}${step(pr === 'analyzing', done, 'AI scoring the call')}</div>`}
      ${done ? `<a class="btn primary" style="width:100%;justify-content:center;margin-top:10px" href="#/calls/${callId}">Open call report</a>` : ''}`;
    el.querySelector('.x').onclick = () => { el.className = ''; clearInterval(liveTimer); };
    if (done || fail || pr === 'error') clearInterval(liveTimer);
  };
  draw(null);
  liveTimer = setInterval(async () => {
    if (Date.now() - started > 75 * 60000) return clearInterval(liveTimer);
    try { draw((await api(`/api/calls/${callId}`)).call); } catch { /* keep polling */ }
  }, 4000);
}

// ------------------------------------------------------------ leads
async function leadsView(_, q) {
  shell('leads', loading());
  const p = new URLSearchParams();
  for (const k of ['status', 'q', 'due', 'owner']) if (q.get(k)) p.set(k, q.get(k));
  const [{ leads }, { users }] = await Promise.all([api('/api/leads?' + p), api('/api/users')]);
  const agentOpts = (sel) => `<option value="">Unassigned</option>${users.filter((u) => u.active).map((u) => `<option value="${u.id}" ${sel === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}`;
  setMain(`<div class="head"><div><h1>Leads</h1><div class="muted">${leads.length} lead${leads.length === 1 ? '' : 's'}${q.get('due') ? ' · follow-ups due' : ''} · tap <b>Call</b> to start a recorded call</div></div>
      <div class="row"><button id="imp">${ic('upload')} Import CSV</button><button class="primary" id="add">${ic('plus')} Add lead</button></div></div>
    ${!me.telephony ? setupNotices() : ''}
    <form class="row panel" id="flt" style="padding:14px"><input name="q" placeholder="Search name, phone, email" value="${esc(q.get('q') || '')}" style="flex:1;min-width:180px">
      <select name="status"><option value="">All statuses</option>${LEAD_STATUSES.map((s) => `<option value="${s}" ${q.get('status') === s ? 'selected' : ''}>${STATUS_LABEL[s]}</option>`).join('')}</select>
      ${isManager() ? `<select name="owner"><option value="">All agents</option>${users.map((u) => `<option value="${u.id}" ${q.get('owner') === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select>` : ''}
      <label class="row" style="margin:0"><input type="checkbox" name="due" value="1" ${q.get('due') ? 'checked' : ''} style="width:auto"> Due today</label><button class="primary">${ic('search')} Search</button></form>
    <div class="panel flush scroll">${leads.length ? `<table><tr><th>Lead</th><th>Status</th>${isManager() ? '<th>Agent</th>' : ''}<th>Source</th><th>Follow-up</th><th class="n">Calls</th><th></th></tr>
      ${leads.map((l) => `<tr data-id="${l.id}"><td><div class="who">${avatar(l.name, true)}<div>${esc(l.name)}<span>${esc(l.phone)}${l.notes ? ' · ' + esc(l.notes.slice(0, 60)) : ''}</span></div></div></td>
        <td><select data-f="status" style="width:auto">${LEAD_STATUSES.map((s) => `<option value="${s}" ${l.status === s ? 'selected' : ''}>${STATUS_LABEL[s]}</option>`).join('')}</select></td>
        ${isManager() ? `<td><select data-f="owner_id" style="width:auto">${agentOpts(l.owner_id)}</select></td>` : ''}
        <td class="small">${esc(l.source || '')}</td><td><input type="date" data-f="next_follow_up" value="${esc(l.next_follow_up || '')}" style="width:auto"></td>
        <td class="n">${l.call_count ? `<a href="#/calls?lead=${l.id}&from=2000-01-01">${l.call_count}</a>` : '<span class="muted">0</span>'}</td>
        <td class="n"><button class="call" data-call="${l.id}" data-name="${esc(l.name)}" ${me.telephony ? '' : 'disabled title="Connect telephony first"'}>${ic('phone')} Call</button></td></tr>`).join('')}</table>`
      : empty('users', 'No leads yet', 'Add a lead, import a CSV, or connect your lead forms in Settings.')}</div>
    <dialog id="dlg"></dialog>`);
  document.getElementById('flt').onsubmit = (e) => { e.preventDefault(); location.hash = '#/leads?' + new URLSearchParams(Object.entries(form(e.target)).filter(([, v]) => v)); };
  document.querySelectorAll('tr[data-id] [data-f]').forEach((el) => {
    el.onchange = async () => {
      try { await api(`/api/leads/${el.closest('tr').dataset.id}`, { method: 'PATCH', body: { [el.dataset.f]: el.value } }); toast('Saved'); } catch (e) { toast(e.message); }
    };
  });
  document.querySelectorAll('[data-call]').forEach((b) => {
    b.onclick = async () => {
      b.disabled = true;
      try { const r = await api('/api/calls/dial', { method: 'POST', body: { lead_id: b.dataset.call } }); liveCall(r.id, b.dataset.name); } catch (e) { toast(e.message); }
      setTimeout(() => { b.disabled = false; }, 8000);
    };
  });
  const dlg = document.getElementById('dlg');
  document.getElementById('add').onclick = () => {
    dlg.innerHTML = `<h2>Add lead</h2><form id="lf"><label>Name<input name="name" required></label><label>Phone<input name="phone" required placeholder="98xxxxxxxx"></label>
      <label>Email<input name="email" type="email"></label><label>Source<input name="source" placeholder="Meta ad, website, referral…"></label>
      ${isManager() ? `<label>Agent<select name="owner_id">${agentOpts('')}</select></label>` : ''}<label>Notes<textarea name="notes" style="min-height:60px"></textarea></label>
      <div class="row" style="justify-content:flex-end"><button type="button" onclick="this.closest('dialog').close()">Cancel</button><button class="primary">Save lead</button></div></form>`;
    dlg.showModal();
    document.getElementById('lf').onsubmit = async (e) => {
      e.preventDefault();
      try { await api('/api/leads', { method: 'POST', body: form(e.target) }); dlg.close(); route(); } catch (err) { toast(err.message); }
    };
  };
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
      ${isManager() ? `<button class="primary" id="add">${ic('plus')} Add agent</button>` : ''}</div>
    <div class="panel flush scroll"><table><tr><th>Agent</th><th>Mobile</th><th>Role</th><th>Status</th><th></th></tr>
      ${users.map((u) => `<tr><td><div class="who">${avatar(u.name, true)}<div>${esc(u.name)}<span>${esc(u.email)}</span></div></div></td><td class="small">${esc(u.phone || '—')}${u.phone ? '' : ' <span class="pill warn">needed to call</span>'}</td>
        <td><span class="pill plain">${esc(u.role)}</span></td><td>${u.active ? '<span class="pill good">Active</span>' : '<span class="pill">Off</span>'}</td><td class="n"><button data-edit="${u.id}">Edit</button></td></tr>`).join('')}</table></div>
    <dialog id="dlg"></dialog>`);
  const dlg = document.getElementById('dlg');
  const open = (u) => {
    const self = u && u.id === me.user.id;
    dlg.innerHTML = `<h2>${u ? 'Edit ' + esc(u.name) : 'Add agent'}</h2><form id="uf">
      <label>Name<input name="name" value="${esc(u?.name || '')}" required></label>
      ${u ? '' : '<label>Email (used to sign in)<input name="email" type="email" required></label>'}
      <label>Mobile (rings when they tap Call)<input name="phone" value="${esc(u?.phone || '')}" placeholder="98xxxxxxxx"></label>
      ${isManager() && !self ? `<label>Role<select name="role">${['agent', 'manager', 'admin'].map((r) => `<option ${u?.role === r ? 'selected' : ''}>${r}</option>`).join('')}</select></label>` : ''}
      ${u && isManager() && !self ? `<label class="row"><input type="checkbox" name="active" ${u.active ? 'checked' : ''} style="width:auto"> Active (can sign in)</label>` : ''}
      <label>${u ? 'New password (leave blank to keep)' : 'Password (8+ characters)'}<input name="password" type="password" ${u ? '' : 'required minlength="8"'}></label>
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
    <div class="grid g3" style="margin-bottom:18px">${conn(s.telephony, 'Exotel calling', 'Not connected: the Call button is off')}${conn(s.ai, 'Claude AI analysis', 'Not connected: keyword estimate only')}${conn(!!s.lead_webhook, 'Lead webhook', 'Set LEADS_WEBHOOK_KEY')}</div>
    <form id="sf">
    <div class="panel"><h2>Your sales script</h2><p class="small muted" style="margin-top:-6px">The AI checks every call against this. Write it the way you train new agents, step by step.</p>
      <label>Company name<input name="company" value="${esc(v.company)}"></label>
      <label>What you sell (products, prices, offers, common questions)<textarea name="product">${esc(v.product)}</textarea></label>
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
  setMain(`<div class="head"><div><h1>How SalePunch works</h1><div class="muted">From tapping Call to a scored call report, in about a minute.</div></div></div>
    <div class="panel"><h2>What happens on every call</h2><div class="flow">
      <div><div class="ic">${ic('users')}</div><b>Agent taps Call</b><p>On the lead's row in <a href="#/leads">Leads</a>.</p></div>
      <div><div class="ic">${ic('phone')}</div><b>Agent's phone rings</b><p>The agent answers. SalePunch then rings the lead, who sees your company number.</p></div>
      <div><div class="ic">${ic('mic')}</div><b>Whole call recorded</b><p>Both voices are recorded from "hello" to hang-up, on your company line.</p></div>
      <div><div class="ic">${ic('brain')}</div><b>AI listens</b><p>The recording becomes a written conversation and the AI scores it.</p></div>
      <div><div class="ic">${ic('chart')}</div><b>Report ready</b><p>Outcome, chance to convert, skills, objections and next step appear in Calls.</p></div>
    </div></div>
    <div class="grid g2">
      <div class="panel"><h2>${ic('phone')} For agents: how to call a lead</h2><ol class="steps-list">
        <li><div><b>Open Leads</b><p>Your assigned leads are listed, with follow-ups due today at the top of the filter.</p></div></li>
        <li><div><b>Tap the green Call button</b><p>Don't dial from your phone's keypad. Calls made that way aren't recorded.</p></div></li>
        <li><div><b>Answer your phone</b><p>It rings within a few seconds from the company number. Pick up and wait a moment while the lead is connected.</p></div></li>
        <li><div><b>Talk normally</b><p>Follow the script. A live card on screen shows the call's progress.</p></div></li>
        <li><div><b>Hang up</b><p>About a minute later, the full conversation and your scores appear. Tap <i>Open call report</i>.</p></div></li>
        <li><div><b>Set the follow-up</b><p>The AI fills in the next step and date. Check it on the lead.</p></div></li></ol></div>
      <div class="panel"><h2>${ic('chart')} For managers: what you see</h2><ul class="clean">
        <li>${ic('mic')}<span><b>Every conversation:</b> play the recording or read it like a chat. Tap a timestamp to jump to that moment.</span></li>
        <li>${ic('target')}<span><b>Converting or not:</b> each call is marked Converted, Interested, Follow-up or Not interested, with the lead's % chance to buy.</span></li>
        <li>${ic('star')}<span><b>Sales skills:</b> opening, questions, pitch, objection handling, closing, tone and listening, each scored out of 10.</span></li>
        <li>${ic('check')}<span><b>Script check:</b> which steps of your script were followed or skipped.</span></li>
        <li>${ic('flag')}<span><b>Red flags:</b> rudeness, false promises, wrong prices, upset leads.</span></li>
        <li>${ic('trophy')}<span><b>Leaderboard:</b> calls, talk time, conversions and conversion % per agent per day.</span></li>
        <li>${ic('file')}<span><b>Daily report:</b> 9 pm summary with a coaching note for each agent, sent to Slack or WhatsApp if you like.</span></li></ul></div>
    </div>
    <div class="panel"><h2>${ic('shield')} Questions</h2>
      <details><summary>How does SalePunch catch the conversation?</summary><p>The call doesn't go directly from the agent's SIM to the lead. It goes through your company phone line (Exotel). Exotel connects both people and records both sides of the call. When the call ends, it sends the recording to SalePunch. SalePunch turns the speech into text, works out which lines are the agent's and which are the lead's, and has the AI analyse the call.</p></details>
      <details><summary>What if an agent calls from their own phone dialer?</summary><p>Those calls can't be recorded automatically. Upload the phone's own call recording on <a href="#/upload">Add a call</a>, or paste what was said. To get every call, ask agents to always use the Call button. You can see who calls through SalePunch and who doesn't on the leaderboard.</p></details>
      <details><summary>Which languages work?</summary><p>English, Malayalam, Hindi, Tamil and mixed speech. The summary and coaching are always in simple English.</p></details>
      <details><summary>Does the lead know the call is recorded?</summary><p>You should tell them. Set a short Exotel greeting such as "This call may be recorded for quality". Indian law (DPDP Act 2023) expects you to inform people and to keep recordings only as long as needed.</p></details>
      <details><summary>What do I need to connect?</summary><p>1) An Exotel account with a company number (ExoPhone), for the Call button. 2) A Claude API key, for the AI analysis. 3) Optionally, your CRM or lead forms through the webhook in Settings. Each agent also needs their mobile number on the Team page.</p></details>
    </div>`);
}

// ------------------------------------------------------------ router
const VIEWS = { dashboard: dashboardView, calls: callsView, leads: leadsView, upload: uploadView, reports: reportsView, team: teamView, settings: settingsView, guide: guideView };
async function route() {
  const [path, qs] = location.hash.replace(/^#\/?/, '').split('?');
  const [name, arg] = path.split('/');
  const q = new URLSearchParams(qs || '');
  try {
    if (name === 'calls' && arg) return await callView(arg);
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
