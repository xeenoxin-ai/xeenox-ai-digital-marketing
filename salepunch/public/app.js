// SalePunch dashboard (no build step). Hash routes: #/dashboard, #/calls,
// #/calls/<id>, #/leads, #/upload, #/reports/<day>, #/team, #/settings.
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

// ------------------------------------------------------------ helpers
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isManager = () => ['admin', 'manager'].includes(me?.user?.role);
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 3500);
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
const mins = (s) => `${Math.round((s || 0) / 60)} min`;
const when = (ms) => new Date(ms).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
const scoreCls = (v) => (v == null ? '' : v >= 70 ? 'hi' : v >= 45 ? 'mid' : 'lo');
const score = (v, max = 100) => (v == null ? '<span class="muted">–</span>' : `<span class="score ${scoreCls((v / max) * 100)}">${v}</span>`);
const outcomePill = (c) => {
  if (c.status && c.status !== 'completed') return `<span class="pill">${esc(CALL_STATUS[c.status] || c.status)}</span>`;
  if (c.processing === 'error') return '<span class="pill error">Analysis failed</span>';
  if (c.processing !== 'done') return '<span class="pill info">Analysing…</span>';
  return `<span class="pill ${esc(c.outcome)}">${esc(OUTCOME_LABEL[c.outcome] || c.outcome)}</span>`;
};
const addDays = (day, n) => { const d = new Date(day + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const form = (el) => Object.fromEntries(new FormData(el).entries());

// ------------------------------------------------------------ shell
const NAV = [
  ['dashboard', 'Dashboard'], ['calls', 'Calls'], ['leads', 'Leads (CRM)'], ['upload', 'Add a call'],
  ['reports', 'Daily reports'], ['team', 'Team'], ['settings', 'Settings', true],
];
function shell(active, content) {
  $app.innerHTML = `<div class="layout">
    <nav class="side">
      <div class="brand"><img src="logo.svg" alt="">SalePunch</div>
      ${NAV.filter(([, , m]) => !m || isManager()).map(([k, l]) => `<a href="#/${k}" class="${k === active ? 'on' : ''}">${l}</a>`).join('')}
      <div class="me"><b>${esc(me.user.name)}</b><br><span class="muted">${esc(me.user.role)}${me.company ? ' · ' + esc(me.company) : ''}</span><br>
        <button class="link small" id="logout">Sign out</button></div>
    </nav>
    <main id="main">${content}</main></div>`;
  document.getElementById('logout').onclick = async () => { await api('/api/logout', { method: 'POST' }); me = null; render(); };
}
const setMain = (html) => { document.getElementById('main').innerHTML = html; };

// ------------------------------------------------------------ auth
async function authView() {
  const st = await api('/api/status', { quiet: true });
  if (st.needsSetup) {
    $app.innerHTML = `<div class="auth panel"><div class="brand"><img src="logo.svg" alt="">SalePunch</div>
      <p class="muted">First time here. Create the admin account.</p>
      <form id="f"><label>Company name<input name="company" required></label><label>Your name<input name="name" required></label>
      <label>Email<input name="email" type="email" required></label><label>Your mobile (for calls)<input name="phone" placeholder="98xxxxxxxx"></label>
      <label>Password (8+ characters)<input name="password" type="password" minlength="8" required></label>
      <button class="primary" style="width:100%;justify-content:center">Create account</button></form></div>`;
    document.getElementById('f').onsubmit = async (e) => {
      e.preventDefault();
      try { await api('/api/setup', { method: 'POST', body: form(e.target) }); render(); } catch (err) { toast(err.message); }
    };
    return;
  }
  $app.innerHTML = `<div class="auth panel"><div class="brand"><img src="logo.svg" alt="">SalePunch</div>
    <form id="f"><label>Email<input name="email" type="email" autocomplete="username" required></label>
    <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
    <button class="primary" style="width:100%;justify-content:center">Sign in</button></form></div>`;
  document.getElementById('f').onsubmit = async (e) => {
    e.preventDefault();
    try { await api('/api/login', { method: 'POST', body: form(e.target), quiet: true }); render(); } catch (err) { toast(err.message); }
  };
}

// ------------------------------------------------------------ dashboard
async function dashboardView(arg) {
  const day = arg || me.today;
  shell('dashboard', '<div class="muted">Loading…</div>');
  const d = await api(`/api/dashboard?from=${day}`);
  const t = d.team;
  const pipe = Object.fromEntries(d.pipeline.map((p) => [p.status, p.n]));
  setMain(`
    <div class="head"><div><h1>${isManager() ? 'Team today' : 'My day'}</h1><div class="muted">${new Date(day + 'T12:00:00').toDateString()}</div></div>
      <div class="row"><a class="btn" href="#/dashboard/${addDays(day, -1)}">‹</a><input type="date" id="day" value="${day}"><a class="btn" href="#/dashboard/${addDays(day, 1)}">›</a></div></div>
    ${!me.telephony ? '<div class="notice">Telephony is not connected yet, so the <b>Call</b> button is off. You can still add calls with <a href="#/upload">Add a call</a>. See the README to connect Exotel.</div>' : ''}
    ${!me.ai ? '<div class="notice">AI analysis is not connected (no Claude API key), so calls get a basic keyword estimate only.</div>' : ''}
    <div class="grid g4">
      <div class="tile"><div class="v">${t.dialed}</div><div class="l">Calls dialed</div></div>
      <div class="tile"><div class="v">${t.connected}</div><div class="l">Connected · ${mins(t.talk_time_sec)} talk</div></div>
      <div class="tile"><div class="v">${t.converted} <span class="small muted">(${t.conversion_pct}%)</span></div><div class="l">Converted (of connected)</div></div>
      <div class="tile"><div class="v">${t.avg_skill_score ?? '–'}</div><div class="l">Avg sales-skill score /100</div></div>
    </div><br>
    <div class="grid g4">
      <div class="tile"><div class="v">${t.interested}</div><div class="l">Interested</div></div>
      <div class="tile"><div class="v">${t.follow_up}</div><div class="l">Follow-ups agreed</div></div>
      <div class="tile"><div class="v">${t.avg_conversion_chance ?? '–'}%</div><div class="l">Avg chance to convert</div></div>
      <div class="tile"><div class="v" style="color:${t.red_flags ? 'var(--bad)' : 'inherit'}">${t.red_flags}</div><div class="l">Red flags</div></div>
    </div><br>
    ${isManager() ? `<div class="panel"><h2>Agents</h2><div class="scroll"><table>
      <tr><th>Agent</th><th class="n">Dialed</th><th class="n">Connected</th><th class="n">Talk</th><th class="n">Converted</th><th class="n">Conv. %</th><th class="n">Skill</th><th class="n">Chance</th><th>Weakest skill</th><th class="n">Flags</th></tr>
      ${d.agents.map((a) => {
        const weak = Object.entries(a.skills).filter(([, v]) => v != null).sort((x, y) => x[1] - y[1])[0];
        return `<tr class="click" data-href="#/calls?agent=${a.agent_id}&from=${day}&to=${day}"><td><b>${esc(a.name)}</b></td><td class="n">${a.dialed}</td><td class="n">${a.connected}</td>
          <td class="n">${mins(a.talk_time_sec)}</td><td class="n">${a.converted}</td><td class="n">${a.conversion_pct}%</td><td class="n">${score(a.avg_skill_score)}</td>
          <td class="n">${a.avg_conversion_chance ?? '–'}${a.avg_conversion_chance != null ? '%' : ''}</td><td>${weak ? `${esc(SKILL_LABELS[weak[0]])} (${weak[1]}/10)` : '<span class="muted">–</span>'}</td>
          <td class="n">${a.red_flags ? `<span class="pill bad">${a.red_flags}</span>` : '0'}</td></tr>`;
      }).join('')}</table></div></div>` : ''}
    <div class="grid g2">
      <div class="panel"><h2>Sales skills (avg /10)</h2>${Object.keys(SKILL_LABELS).map((k) => skillRow(k, t.skills[k])).join('')}</div>
      <div class="panel"><h2>Top objections from leads</h2>${t.top_objections.length ? `<ul class="clean">${t.top_objections.map((o) => `<li>${esc(o.objection)} <span class="muted">× ${o.count}</span></li>`).join('')}</ul>` : '<p class="muted">None yet for this day.</p>'}
        <h2 style="margin-top:18px">Lead pipeline</h2><div class="row">${LEAD_STATUSES.map((s) => `<span class="pill ${s}">${STATUS_LABEL[s]}: ${pipe[s] || 0}</span>`).join('')}</div>
        ${d.follow_ups_due ? `<p><a href="#/leads?due=1">${d.follow_ups_due} follow-up${d.follow_ups_due > 1 ? 's' : ''} due today →</a></p>` : ''}</div>
    </div>`);
  document.getElementById('day').onchange = (e) => { location.hash = `#/dashboard/${e.target.value}`; };
  bindRowLinks();
}
const skillRow = (k, v) => `<div class="skill"><span>${esc(SKILL_LABELS[k])}</span><div class="bar"><i style="width:${(v || 0) * 10}%"></i></div>${score(v, 10)}</div>`;
function bindRowLinks() { document.querySelectorAll('tr[data-href]').forEach((tr) => { tr.onclick = () => { location.hash = tr.dataset.href; }; }); }

// ------------------------------------------------------------ calls
async function callsView(_, q) {
  shell('calls', '<div class="muted">Loading…</div>');
  const from = q.get('from') || addDays(me.today, -6), to = q.get('to') || me.today;
  const params = new URLSearchParams({ from, to });
  for (const k of ['agent', 'outcome', 'lead']) if (q.get(k)) params.set(k, q.get(k));
  const [{ calls }, { users }] = await Promise.all([api('/api/calls?' + params), api('/api/users')]);
  setMain(`<div class="head"><div><h1>Calls</h1><div class="muted">${calls.length} call${calls.length === 1 ? '' : 's'}</div></div>
    <form class="row" id="flt"><input type="date" name="from" value="${from}"><input type="date" name="to" value="${to}">
      ${isManager() ? `<select name="agent"><option value="">All agents</option>${users.map((u) => `<option value="${u.id}" ${q.get('agent') === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select>` : ''}
      <select name="outcome"><option value="">All outcomes</option>${Object.entries(OUTCOME_LABEL).map(([k, l]) => `<option value="${k}" ${q.get('outcome') === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <button>Filter</button></form></div>
    <div class="panel scroll">${calls.length ? `<table><tr><th>When</th><th>Agent</th><th>Lead</th><th class="n">Length</th><th>Result</th><th class="n">Skill</th><th class="n">Chance</th><th>Summary</th></tr>
      ${calls.map((c) => `<tr class="click" data-href="#/calls/${c.id}"><td class="small">${when(c.started_at)}</td><td>${esc(c.agent_name || '')}</td>
        <td>${esc(c.lead_name || c.lead_phone || '–')}</td><td class="n">${dur(c.duration_sec)}</td><td>${outcomePill(c)}${c.red_flags?.length ? ' <span class="pill bad">⚑</span>' : ''}</td>
        <td class="n">${score(c.skill_score)}</td><td class="n">${c.conversion_chance != null ? c.conversion_chance + '%' : '–'}</td>
        <td class="small muted">${esc((c.summary || c.error || '').slice(0, 140))}</td></tr>`).join('')}</table>` : '<p class="muted">No calls in this range.</p>'}</div>`);
  document.getElementById('flt').onsubmit = (e) => {
    e.preventDefault();
    const p = new URLSearchParams(Object.entries(form(e.target)).filter(([, v]) => v));
    location.hash = '#/calls?' + p;
  };
  bindRowLinks();
}

async function callView(id) {
  shell('calls', '<div class="muted">Loading…</div>');
  const { call: c } = await api(`/api/calls/${id}`);
  const a = c.analysis;
  const keys = new Map((a?.key_moments || []).map((m) => [m.segment, m.note]));
  const chat = (c.transcript || []).map((s, i) => `<div class="msg ${s.speaker === 'agent' ? 'agent' : ''} ${keys.has(i) ? 'key' : ''}" id="seg${i}">
      <span class="t">${s.speaker === 'agent' ? esc(c.agent_name || 'Agent') : esc(c.lead_name || 'Lead')} · ${c.has_audio ? `<button class="link" data-seek="${s.start}">${dur(s.start)}</button>` : dur(s.start)}${keys.has(i) ? ' · ★ ' + esc(keys.get(i)) : ''}</span>${esc(s.text)}</div>`).join('');
  setMain(`<div class="head"><div><a href="#/calls" class="small">← Calls</a><h1>${esc(c.lead_name || c.lead_phone || 'Call')}</h1>
      <div class="muted">${esc(c.agent_name || '')} · ${when(c.started_at)} · ${dur(c.duration_sec)}${c.language ? ' · ' + esc(c.language) : ''} · ${outcomePill(c)}</div></div>
      <div class="row">${c.lead_id ? `<a class="btn" href="#/calls?lead=${c.lead_id}&from=2000-01-01">All calls with this lead</a>` : ''}
      ${isManager() ? '<button id="re">Re-analyse</button>' : ''}</div></div>
    ${c.processing === 'error' ? `<div class="flag">Analysis failed: ${esc(c.error)}</div>` : ''}
    ${c.processing !== 'done' && c.processing !== 'error' && c.status === 'completed' ? '<div class="notice">This call is still being transcribed and analysed. Refresh in a minute.</div>' : ''}
    ${a ? `<div class="grid g4">
      <div class="tile"><div class="v">${score(a.overall_score)}</div><div class="l">Sales-skill score /100</div></div>
      <div class="tile"><div class="v">${a.conversion_chance}%</div><div class="l">Chance to convert</div></div>
      <div class="tile"><div class="v">${a.script_adherence.score}%</div><div class="l">Followed the script</div></div>
      <div class="tile"><div class="v">${a.talk_ratio ?? '–'}%</div><div class="l">Agent talk share${a.talk_ratio > 65 ? ' (too much)' : ''}</div></div></div><br>` : ''}
    <div class="grid g2">
      <div>
        ${c.has_audio ? `<div class="panel"><h3>Recording</h3><audio id="aud" controls preload="none" src="/api/calls/${c.id}/audio"></audio></div>` : ''}
        <div class="panel"><h3>Conversation (hello to end)</h3>${chat ? `<div class="chat">${chat}</div>` : '<p class="muted">No transcript yet.</p>'}</div>
      </div>
      <div>${a ? `
        ${a.red_flags.length ? a.red_flags.map((f) => `<div class="flag">⚑ ${esc(f)}</div>`).join('') : ''}
        <div class="panel"><h3>Summary</h3><p>${esc(a.summary)}</p>${a.lead_intent ? `<p><b>Lead's intent:</b> ${esc(a.lead_intent)}</p>` : ''}
          ${a.next_action ? `<p><b>Next step:</b> ${esc(a.next_action)}${a.follow_up_date ? ` (by ${esc(a.follow_up_date)})` : ''}</p>` : ''}
          ${a.engine === 'keywords' ? '<p class="small muted">Keyword estimate. Connect Claude for full analysis.</p>' : ''}</div>
        <div class="panel"><h3>Sales skills</h3>${Object.keys(SKILL_LABELS).map((k) => skillRow(k, a.skills[k])).join('')}</div>
        ${a.objections.length ? `<div class="panel"><h3>Objections</h3>${a.objections.map((o) => `<p><span class="pill ${o.handled_well ? 'good' : 'bad'}">${o.handled_well ? 'Handled' : 'Not handled'}</span> <b>${esc(o.objection)}</b><br><span class="small muted">Agent: ${esc(o.agent_response || '—')}</span></p>`).join('')}</div>` : ''}
        <div class="panel"><h3>Script check</h3><div class="grid g2"><div><b class="small">Done</b><ul class="clean small">${a.script_adherence.followed.map((x) => `<li>✓ ${esc(x)}</li>`).join('') || '<li class="muted">–</li>'}</ul></div>
          <div><b class="small">Missed</b><ul class="clean small">${a.script_adherence.missed.map((x) => `<li>✗ ${esc(x)}</li>`).join('') || '<li class="muted">Nothing missed</li>'}</ul></div></div></div>
        <div class="panel"><h3>Coaching</h3>${a.strengths.length ? `<b class="small">Did well</b><ul class="clean small">${a.strengths.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
          ${a.improvements.length ? `<b class="small">Improve</b><ul class="clean small">${a.improvements.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}</div>` : ''}
      </div></div>`);
  document.querySelectorAll('[data-seek]').forEach((b) => { b.onclick = () => { const au = document.getElementById('aud'); au.currentTime = Number(b.dataset.seek); au.play(); }; });
  const re = document.getElementById('re');
  if (re) re.onclick = async () => { await api(`/api/calls/${c.id}/reprocess`, { method: 'POST' }); toast('Re-analysing. Refresh in a minute.'); };
}

// ------------------------------------------------------------ leads
async function leadsView(_, q) {
  shell('leads', '<div class="muted">Loading…</div>');
  const p = new URLSearchParams();
  for (const k of ['status', 'q', 'due', 'owner']) if (q.get(k)) p.set(k, q.get(k));
  const [{ leads }, { users }] = await Promise.all([api('/api/leads?' + p), api('/api/users')]);
  const agentOpts = (sel) => `<option value="">Unassigned</option>${users.filter((u) => u.active).map((u) => `<option value="${u.id}" ${sel === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}`;
  setMain(`<div class="head"><div><h1>Leads</h1><div class="muted">${leads.length} lead${leads.length === 1 ? '' : 's'}${q.get('due') ? ' · follow-ups due' : ''}</div></div>
      <div class="row"><button class="primary" id="add">+ Add lead</button><button id="imp">Import CSV</button></div></div>
    <form class="row panel" id="flt"><input name="q" placeholder="Search name, phone, email" value="${esc(q.get('q') || '')}" style="flex:1;min-width:180px">
      <select name="status"><option value="">All statuses</option>${LEAD_STATUSES.map((s) => `<option value="${s}" ${q.get('status') === s ? 'selected' : ''}>${STATUS_LABEL[s]}</option>`).join('')}</select>
      ${isManager() ? `<select name="owner"><option value="">All agents</option>${users.map((u) => `<option value="${u.id}" ${q.get('owner') === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select>` : ''}
      <label class="row" style="margin:0"><input type="checkbox" name="due" value="1" ${q.get('due') ? 'checked' : ''} style="width:auto"> Due today</label><button>Search</button></form>
    <div class="panel scroll">${leads.length ? `<table><tr><th>Lead</th><th>Phone</th><th>Status</th>${isManager() ? '<th>Agent</th>' : ''}<th>Source</th><th>Follow-up</th><th class="n">Calls</th><th></th></tr>
      ${leads.map((l) => `<tr data-id="${l.id}"><td><b>${esc(l.name)}</b>${l.notes ? `<div class="small muted">${esc(l.notes.slice(0, 80))}</div>` : ''}</td><td class="small">${esc(l.phone)}</td>
        <td><select data-f="status" style="width:auto">${LEAD_STATUSES.map((s) => `<option value="${s}" ${l.status === s ? 'selected' : ''}>${STATUS_LABEL[s]}</option>`).join('')}</select></td>
        ${isManager() ? `<td><select data-f="owner_id" style="width:auto">${agentOpts(l.owner_id)}</select></td>` : ''}
        <td class="small">${esc(l.source || '')}</td><td><input type="date" data-f="next_follow_up" value="${esc(l.next_follow_up || '')}" style="width:auto"></td>
        <td class="n">${l.call_count ? `<a href="#/calls?lead=${l.id}&from=2000-01-01">${l.call_count}</a>` : 0}</td>
        <td><button class="call" data-call="${l.id}" ${me.telephony ? '' : 'disabled title="Connect telephony first"'}>📞 Call</button></td></tr>`).join('')}</table>` : '<p class="muted">No leads yet. Add one, import a CSV, or connect your CRM / lead forms in Settings.</p>'}</div>
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
      try { toast((await api('/api/calls/dial', { method: 'POST', body: { lead_id: b.dataset.call } })).message); } catch (e) { toast(e.message); }
      setTimeout(() => { b.disabled = false; }, 8000);
    };
  });
  const dlg = document.getElementById('dlg');
  document.getElementById('add').onclick = () => {
    dlg.innerHTML = `<h2>Add lead</h2><form id="lf"><label>Name<input name="name" required></label><label>Phone<input name="phone" required placeholder="98xxxxxxxx"></label>
      <label>Email<input name="email" type="email"></label><label>Source<input name="source" placeholder="Meta ad, website, referral…"></label>
      ${isManager() ? `<label>Agent<select name="owner_id">${agentOpts('')}</select></label>` : ''}<label>Notes<textarea name="notes" style="min-height:60px"></textarea></label>
      <div class="row"><button class="primary">Save</button><button type="button" onclick="this.closest('dialog').close()">Cancel</button></div></form>`;
    dlg.showModal();
    document.getElementById('lf').onsubmit = async (e) => {
      e.preventDefault();
      try { await api('/api/leads', { method: 'POST', body: form(e.target) }); dlg.close(); route(); } catch (err) { toast(err.message); }
    };
  };
  document.getElementById('imp').onclick = () => {
    dlg.innerHTML = `<h2>Import leads (CSV)</h2><p class="small muted">First row is the header. Needs a <b>phone</b> column; <b>name, email, source, notes, owner</b> (agent email) and <b>status</b> are optional. Exports from Meta Lead Ads, Google Sheets, Zoho and HubSpot work.</p>
      <form id="cf"><input type="file" name="file" accept=".csv,text/csv" required><br><br>${isManager() ? `<label>Give unassigned leads to<select name="owner_id">${agentOpts('')}</select></label>` : ''}
      <div class="row"><button class="primary">Import</button><button type="button" onclick="this.closest('dialog').close()">Cancel</button></div></form>`;
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
  shell('upload', '<div class="muted">Loading…</div>');
  const [{ leads }, { users }] = await Promise.all([api('/api/leads'), api('/api/users')]);
  setMain(`<div class="head"><div><h1>Add a call</h1><div class="muted">For calls made from a normal phone: upload the phone's call recording, or paste what was said.</div></div></div>
    <form class="panel" id="uf" style="max-width:640px">
      <label>Lead<select name="lead_id"><option value="">— not in the list —</option>${leads.map((l) => `<option value="${l.id}">${esc(l.name)} · ${esc(l.phone)}</option>`).join('')}</select></label>
      <label>Or lead phone number<input name="lead_phone" placeholder="98xxxxxxxx"></label>
      ${isManager() ? `<label>Agent<select name="agent_id">${users.map((u) => `<option value="${u.id}" ${u.id === me.user.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select></label>` : ''}
      <div class="grid g2"><label>Call time<input type="datetime-local" name="started_at"></label><label>Length in seconds (optional)<input type="number" name="duration_sec" min="0"></label></div>
      <label>Recording (mp3, m4a, wav, ogg · up to 25 MB)<input type="file" name="audio" accept="audio/*,.m4a,.amr,.mp3,.wav,.ogg"></label>
      <label>…or paste the conversation<textarea name="transcript" placeholder="Agent: Hello, this is Anu from Xeenox…&#10;Lead: Yes, tell me…"></textarea></label>
      <button class="primary" id="ub">Upload and analyse</button></form>`);
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
  const day = arg || addDays(me.today, 0);
  shell('reports', '<div class="muted">Loading…</div>');
  const { reports } = await api(`/api/reports?day=${day}`);
  setMain(`<div class="head"><div><h1>Daily reports</h1><div class="muted">Built every evening for each agent, with an AI coaching note.</div></div>
      <div class="row"><a class="btn" href="#/reports/${addDays(day, -1)}">‹</a><input type="date" id="day" value="${day}"><a class="btn" href="#/reports/${addDays(day, 1)}">›</a>
      ${isManager() ? '<button id="run">Build now</button>' : ''}</div></div>
    ${reports.length ? reports.map((r) => `<div class="panel"><div class="head" style="margin-bottom:8px"><h2 style="margin:0">${esc(r.agent_name)}</h2>
      <a href="#/calls?agent=${r.agent_id}&from=${day}&to=${day}" class="small">See calls →</a></div>
      <div class="row small">${[['Dialed', r.stats.dialed], ['Connected', r.stats.connected], ['Converted', `${r.stats.converted} (${r.stats.conversion_pct}%)`], ['Follow-ups', r.stats.follow_up], ['Talk', mins(r.stats.talk_time_sec)], ['Skill', `${r.stats.avg_skill_score ?? '–'}/100`], ['Red flags', r.stats.red_flags]].map(([l, v]) => `<span class="pill">${l}: ${v}</span>`).join('')}</div>
      ${r.coaching ? `<p style="white-space:pre-wrap">${esc(r.coaching)}</p>` : ''}</div>`).join('') : '<div class="panel muted">No report for this day yet. Reports are built at the end of each working day.</div>'}`);
  document.getElementById('day').onchange = (e) => { location.hash = `#/reports/${e.target.value}`; };
  const run = document.getElementById('run');
  if (run) run.onclick = async () => { run.disabled = true; try { await api(`/api/reports/run?day=${day}`, { method: 'POST' }); route(); } catch (e) { toast(e.message); run.disabled = false; } };
}

// ------------------------------------------------------------ team
async function teamView() {
  shell('team', '<div class="muted">Loading…</div>');
  const { users } = await api('/api/users');
  setMain(`<div class="head"><div><h1>Team</h1><div class="muted">Each agent's mobile number is the phone that rings when they press Call.</div></div>
      ${isManager() ? '<button class="primary" id="add">+ Add agent</button>' : ''}</div>
    <div class="panel scroll"><table><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Role</th><th>Status</th><th></th></tr>
      ${users.map((u) => `<tr><td><b>${esc(u.name)}</b></td><td class="small">${esc(u.email)}</td><td class="small">${esc(u.phone || '—')}</td><td>${esc(u.role)}</td>
        <td>${u.active ? '<span class="pill good">Active</span>' : '<span class="pill">Off</span>'}</td><td><button class="link" data-edit="${u.id}">Edit</button></td></tr>`).join('')}</table></div>
    <dialog id="dlg"></dialog>`);
  const dlg = document.getElementById('dlg');
  const open = (u) => {
    const self = u && u.id === me.user.id;
    dlg.innerHTML = `<h2>${u ? 'Edit ' + esc(u.name) : 'Add agent'}</h2><form id="uf">
      <label>Name<input name="name" value="${esc(u?.name || '')}" required></label>
      ${u ? '' : '<label>Email (login)<input name="email" type="email" required></label>'}
      <label>Mobile<input name="phone" value="${esc(u?.phone || '')}" placeholder="98xxxxxxxx"></label>
      ${isManager() && !self ? `<label>Role<select name="role">${['agent', 'manager', 'admin'].map((r) => `<option ${u?.role === r ? 'selected' : ''}>${r}</option>`).join('')}</select></label>` : ''}
      ${u && isManager() && !self ? `<label class="row"><input type="checkbox" name="active" ${u.active ? 'checked' : ''} style="width:auto"> Active (can sign in)</label>` : ''}
      <label>${u ? 'New password (leave blank to keep)' : 'Password (8+ characters)'}<input name="password" type="password" ${u ? '' : 'required minlength="8"'}></label>
      <div class="row"><button class="primary">Save</button><button type="button" onclick="this.closest('dialog').close()">Cancel</button></div></form>`;
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
  shell('settings', '<div class="muted">Loading…</div>');
  const s = await api('/api/settings');
  const v = s.settings;
  setMain(`<div class="head"><div><h1>Settings</h1></div></div>
    <form id="sf">
    <div class="panel"><h2>Your sales script</h2><p class="small muted">The AI checks every call against this: what the agent should say, step by step. Write it the way you train new agents.</p>
      <label>Company name<input name="company" value="${esc(v.company)}"></label>
      <label>What you sell (products, prices, offers, common questions)<textarea name="product">${esc(v.product)}</textarea></label>
      <label>Sales script<textarea name="script" style="min-height:220px" placeholder="1. Greet: 'Good morning, this is <name> from <company>…'&#10;2. Confirm you are speaking to the right person&#10;3. Ask what they are looking for&#10;4. …">${esc(v.script)}</textarea></label></div>
    <div class="panel"><h2>CRM connection</h2>
      <p class="small"><b>Leads in:</b> send new leads from your website forms, Meta Lead Ads (via Zapier, Make or Pabbly), Zoho or HubSpot to this webhook (POST JSON with name, phone, email, source, owner):</p>
      ${s.lead_webhook ? `<input readonly value="${esc(s.lead_webhook)}" onclick="this.select()">` : '<p class="notice">Set the LEADS_WEBHOOK_KEY secret to turn this on.</p>'}
      <label style="margin-top:12px">Results out: CRM webhook URL (SalePunch sends outcome, summary, score and next follow-up after every analysed call)<input name="crm_webhook_url" value="${esc(v.crm_webhook_url)}" placeholder="https://hooks.zapier.com/…"></label>
      <label>Daily report webhook (Slack / Google Chat / Zapier to WhatsApp or email)<input name="report_webhook_url" value="${esc(v.report_webhook_url)}" placeholder="https://hooks.slack.com/…"></label></div>
    <div class="panel"><h2>Connections</h2><p>Telephony (Exotel): ${s.telephony ? '<span class="pill good">Connected</span>' : '<span class="pill bad">Not set</span>'}
      &nbsp; AI analysis (Claude): ${s.ai ? '<span class="pill good">Connected</span>' : '<span class="pill bad">Not set</span>'}</p>
      <p class="small muted">These are set as server secrets. See the README for the steps.</p></div>
    <button class="primary">Save settings</button></form>`);
  document.getElementById('sf').onsubmit = async (e) => {
    e.preventDefault();
    try { await api('/api/settings', { method: 'PUT', body: form(e.target) }); me = await api('/api/me'); toast('Saved'); } catch (err) { toast(err.message); }
  };
}

// ------------------------------------------------------------ router
const VIEWS = { dashboard: dashboardView, calls: callsView, leads: leadsView, upload: uploadView, reports: reportsView, team: teamView, settings: settingsView };
async function route() {
  const [path, qs] = location.hash.replace(/^#\/?/, '').split('?');
  const [name, arg] = path.split('/');
  const q = new URLSearchParams(qs || '');
  try {
    if (name === 'calls' && arg) return await callView(arg);
    await (VIEWS[name] || dashboardView)(arg, q);
  } catch (e) {
    if (me) setMain(`<div class="flag">${esc(e.message)}</div>`);
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
