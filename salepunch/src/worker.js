// SalePunch — sales call monitoring. Cloudflare Worker: API + dashboard.
import { hashPassword, readSession, readToken, requestToken, sessionCookie, signSession, signToken, verifyPassword } from './auth.js';
import { authUrl, exchangeCode, googleReady } from './google.js';
import { LEAD_STATUSES, STATUS_LABELS } from './constants.js';
import { mapIncomingLead, nextAssignee, toCsv } from './crm.js';
import { dailyReport, enqueueCall, getSettings, processCall, retryStuck, today } from './pipeline.js';
import { liveCoachTip } from './analyze.js';
import { fakeAI } from './devfake.js';
import { productivity, salesLeaks } from './insights.js';
import { serveStatic } from './static.js';
import { teamStats } from './stats.js';
import { exotelDial, exotelReady, parseExotelCallback } from './telephony.js';
import { audioResponse, loadRecording, saveRecording } from './storage.js';
import { parseTextTranscript, transcribeAndTranslate } from './transcribe.js';
import { dayOf, fail, json, newId, normalizePhone, parseCsv, safeJson, sameSecret } from './util.js';

const MANAGERS = ['admin', 'manager'];
const isManager = (u) => MANAGERS.includes(u.role);
const publicUser = ({ pass_hash, ...u }) => u;
const SETTING_KEYS = ['company', 'product', 'script', 'crm_webhook_url', 'report_webhook_url', 'daily_call_target', 'call_mode', 'auto_assign'];
const MAX_UPLOAD = 25 * 1024 * 1024;

async function currentUser(request, env) {
  const s = await readSession(requestToken(request), env.SESSION_SECRET);
  if (!s) return null;
  const u = await env.DB.prepare('SELECT * FROM users WHERE id = ? AND active = 1').bind(s.uid).first();
  return u ? publicUser(u) : null;
}

const body = async (request) => { try { return await request.json(); } catch { return {}; } };
const origin = (request, env) => env.APP_URL || new URL(request.url).origin;

// ---------------------------------------------------------------- routes
const routes = [];
const route = (method, pattern, handler, opts = {}) => {
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
  routes.push({ method, re, keys, handler, ...opts });
};

// --- setup & auth
route('GET', '/api/status', async (req, env) => {
  const n = await env.DB.prepare('SELECT COUNT(*) AS n FROM users').first();
  return json({ needsSetup: !n.n, telephony: exotelReady(env), ai: !!(env.ANTHROPIC_API_KEY || env.AI), ai_engine: env.ANTHROPIC_API_KEY ? 'claude' : env.AI ? 'workers-ai' : '', google: googleReady(env) });
}, { public: true });

route('POST', '/api/setup', async (req, env) => {
  const n = await env.DB.prepare('SELECT COUNT(*) AS n FROM users').first();
  if (n.n) return fail(409, 'Already set up');
  const b = await body(req);
  if (!b.name || !b.email || String(b.password || '').length < 8) return fail(400, 'Name, email and an 8+ character password are needed');
  const id = newId();
  await env.DB.prepare('INSERT INTO users (id, name, email, phone, role, pass_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(id, b.name.trim(), b.email.trim().toLowerCase(), normalizePhone(b.phone), 'admin', await hashPassword(b.password), Date.now()).run();
  if (b.company) await env.DB.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').bind('company', String(b.company)).run();
  return json({ ok: true }, 200, { 'set-cookie': sessionCookie(await signSession(id, env.SESSION_SECRET)) });
}, { public: true });

route('POST', '/api/login', async (req, env) => {
  const b = await body(req);
  const u = await env.DB.prepare('SELECT * FROM users WHERE email = ? AND active = 1').bind(String(b.email || '').trim().toLowerCase()).first();
  if (!u || !(await verifyPassword(String(b.password || ''), u.pass_hash))) return fail(401, 'Wrong email or password');
  return json({ user: publicUser(u) }, 200, { 'set-cookie': sessionCookie(await signSession(u.id, env.SESSION_SECRET)) });
}, { public: true });

// --- Continue with Google
const OAUTH_COOKIE = 'sp_oauth';
const redirectTo = (location, cookies = []) => {
  const h = new Headers({ location, 'cache-control': 'no-store' });
  for (const c of cookies) h.append('set-cookie', c);
  return new Response(null, { status: 302, headers: h });
};
const loginError = (code) => redirectTo(`/app?login_error=${encodeURIComponent(code)}`, [`${OAUTH_COOKIE}=; Path=/api/auth/google; HttpOnly; Secure; SameSite=Lax; Max-Age=0`]);
const googleRedirectUri = (req, env) => `${origin(req, env)}/api/auth/google/callback`;

route('GET', '/api/auth/google/start', async (req, env, { url }) => {
  if (!googleReady(env)) return loginError('google_off');
  const nonce = crypto.randomUUID();
  const state = await signToken('oauth', { n: nonce, app: url.searchParams.get('app') === '1' }, env.SESSION_SECRET, 10 * 60000);
  return redirectTo(authUrl({ clientId: env.GOOGLE_CLIENT_ID, redirectUri: googleRedirectUri(req, env), state }),
    [`${OAUTH_COOKIE}=${nonce}; Path=/api/auth/google; HttpOnly; Secure; SameSite=Lax; Max-Age=600`]);
}, { public: true });

route('GET', '/api/auth/google/callback', async (req, env, { url }) => {
  if (!googleReady(env)) return loginError('google_off');
  if (url.searchParams.get('error')) return loginError('cancelled');
  const st = await readToken('oauth', url.searchParams.get('state'), env.SESSION_SECRET);
  const nonce = ((req.headers.get('cookie') || '').match(/(?:^|;\s*)sp_oauth=([^;]+)/) || [])[1];
  if (!st || !nonce || !sameSecret(st.n, nonce)) return loginError('expired');
  let profile;
  try {
    profile = await exchangeCode({ code: url.searchParams.get('code') || '', clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET, redirectUri: googleRedirectUri(req, env) });
  } catch (e) {
    console.log('google exchange failed', e.message);
    return loginError('google_failed');
  }
  let user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(profile.email).first();
  if (!user) {
    const n = await env.DB.prepare('SELECT COUNT(*) AS n FROM users').first();
    if (n.n) return loginError('not_invited');
    // Brand-new workspace: the first Google sign-in becomes the admin.
    const id = newId();
    await env.DB.prepare("INSERT INTO users (id, name, email, role, pass_hash, created_at) VALUES (?, ?, ?, 'admin', '!google-only', ?)")
      .bind(id, profile.name, profile.email, Date.now()).run();
    user = { id, active: 1 };
  }
  if (!user.active) return loginError('disabled');
  const clear = `${OAUTH_COOKIE}=; Path=/api/auth/google; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
  if (st.app) {
    // Started in the Android app: hand the login back to the app (Google
    // doesn't allow its sign-in page inside an app's built-in browser).
    const t = await signToken('handoff', { uid: user.id }, env.SESSION_SECRET, 2 * 60000);
    const link = `salepunch://login?t=${encodeURIComponent(t)}`;
    const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SalePunch</title>
<body style="font:16px system-ui;background:#0d1020;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center">
<div><p>Signed in. Returning to the SalePunch app…</p><p><a href="${link}" style="display:inline-block;background:#ff4d1a;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:700">Open SalePunch app</a></p></div>
<script>location.href=${JSON.stringify(link)}</script></body>`;
    return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'set-cookie': clear } });
  }
  return redirectTo('/app', [sessionCookie(await signSession(user.id, env.SESSION_SECRET)), clear]);
}, { public: true });

// The Android app opens this in its own web view with the hand-off token.
route('GET', '/api/auth/google/app-exchange', async (req, env, { url }) => {
  const t = await readToken('handoff', url.searchParams.get('t'), env.SESSION_SECRET);
  if (!t) return loginError('expired');
  const u = await env.DB.prepare('SELECT id FROM users WHERE id = ? AND active = 1').bind(t.uid).first();
  if (!u) return loginError('disabled');
  return redirectTo('/app', [sessionCookie(await signSession(u.id, env.SESSION_SECRET))]);
}, { public: true });

route('POST', '/api/logout', async () => json({ ok: true }, 200, { 'set-cookie': sessionCookie('', 0) }), { public: true });

route('GET', '/api/me', async (req, env, { user }) => {
  const s = await getSettings(env.DB);
  const callMode = s.call_mode === 'exotel' && exotelReady(env) ? 'exotel' : 'sim';
  const phone_online = await phoneOnline(env, user.id);
  // Did this agent's last answered phone call arrive without a recording? (auto-record is off)
  const last = await env.DB.prepare("SELECT recording_key, recording_url, processing, error FROM calls WHERE agent_id = ? AND provider = 'sim' AND status = 'completed' ORDER BY started_at DESC LIMIT 1").bind(user.id).first();
  const recording_missing = !!last && last.processing === 'skipped' && !last.recording_key && !last.recording_url && /recording/i.test(last.error || '');
  return json({ user, company: s.company || '', telephony: exotelReady(env), call_mode: callMode, phone_online, recording_missing, ai: !!(env.ANTHROPIC_API_KEY || env.AI), ai_engine: env.ANTHROPIC_API_KEY ? 'claude' : env.AI ? 'workers-ai' : '', today: today(env), android_app: env.ANDROID_APP_URL || '/download/salepunch.apk' });
});

// --- team
route('GET', '/api/users', async (req, env, { user }) => {
  const sql = isManager(user) ? 'SELECT * FROM users ORDER BY active DESC, name' : 'SELECT * FROM users WHERE id = ?';
  const st = env.DB.prepare(sql);
  const { results } = await (isManager(user) ? st : st.bind(user.id)).all();
  return json({ users: results.map(publicUser) });
});

route('POST', '/api/users', async (req, env) => {
  const b = await body(req);
  if (!b.name || !b.email) return fail(400, 'Name and email are needed');
  if (b.password && String(b.password).length < 8) return fail(400, 'Password must be 8+ characters (or leave it empty for Google sign-in only)');
  const role = ['admin', 'manager', 'agent'].includes(b.role) ? b.role : 'agent';
  try {
    await env.DB.prepare('INSERT INTO users (id, name, email, phone, role, pass_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(newId(), b.name.trim(), b.email.trim().toLowerCase(), normalizePhone(b.phone), role, b.password ? await hashPassword(b.password) : '!google-only', Date.now()).run();
  } catch { return fail(409, 'That email is already used'); }
  return json({ ok: true });
}, { manager: true });

route('PATCH', '/api/users/:id', async (req, env, { params, user }) => {
  const b = await body(req);
  const self = params.id === user.id;
  if (!isManager(user) && !self) return fail(403, 'Managers only');
  if (!isManager(user) || self) { delete b.role; delete b.active; } // nobody changes their own role
  if (user.role !== 'admin' && b.role === 'admin') return fail(403, 'Only an admin can create admins');
  const sets = [], vals = [];
  if (b.name) { sets.push('name = ?'); vals.push(b.name.trim()); }
  if (b.phone !== undefined) { sets.push('phone = ?'); vals.push(normalizePhone(b.phone)); }
  if (['admin', 'manager', 'agent'].includes(b.role)) { sets.push('role = ?'); vals.push(b.role); }
  if (b.active !== undefined) { sets.push('active = ?'); vals.push(b.active ? 1 : 0); }
  if (b.password) {
    if (String(b.password).length < 8) return fail(400, 'Password must be 8+ characters');
    sets.push('pass_hash = ?'); vals.push(await hashPassword(b.password));
  }
  if (!sets.length) return fail(400, 'Nothing to change');
  await env.DB.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).bind(...vals, params.id).run();
  return json({ ok: true });
});

// --- leads (built-in CRM)
route('GET', '/api/leads', async (req, env, { user, url }) => {
  const where = [], vals = [];
  if (!isManager(user)) { where.push('l.owner_id = ?'); vals.push(user.id); }
  else if (url.searchParams.get('owner')) { where.push('l.owner_id = ?'); vals.push(url.searchParams.get('owner')); }
  const status = url.searchParams.get('status');
  if (status) { where.push('l.status = ?'); vals.push(status); }
  const q = (url.searchParams.get('q') || '').trim().slice(0, 40).replace(/[%_]/g, '');
  if (q) { where.push('(l.name LIKE ? OR l.phone LIKE ? OR l.email LIKE ? OR l.company LIKE ? OR l.tags LIKE ?)'); vals.push(...Array(5).fill(`%${q}%`)); }
  const tag = (url.searchParams.get('tag') || '').trim().slice(0, 40).replace(/[%_]/g, '');
  if (tag) { where.push("(',' || REPLACE(l.tags, ', ', ',') || ',') LIKE ?"); vals.push(`%,${tag},%`); }
  if (url.searchParams.get('due') === '1') { where.push("l.next_follow_up IS NOT NULL AND l.next_follow_up <= ? AND l.status NOT IN ('won','lost')"); vals.push(today(env)); }
  const sql = `SELECT l.*, u.name AS owner_name,
      (SELECT COUNT(*) FROM calls c WHERE c.lead_id = l.id) AS call_count,
      (SELECT MAX(started_at) FROM calls c WHERE c.lead_id = l.id) AS last_call_at
    FROM leads l LEFT JOIN users u ON u.id = l.owner_id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY l.updated_at DESC LIMIT 500`;
  const { results } = await env.DB.prepare(sql).bind(...vals).all();
  return json({ leads: results });
});

const cleanTags = (t) => [...new Set(String(t || '').split(',').map((x) => x.trim().toLowerCase().slice(0, 30)).filter(Boolean))].slice(0, 12).join(', ') || null;
const money = (v) => { const n = Math.round(Number(String(v ?? '').replace(/[^\d.]/g, ''))); return Number.isFinite(n) && n > 0 ? Math.min(n, 1e12) : null; };
const isoDate = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? String(v) : null);

async function logActivity(env, leadId, userId, kind, text) {
  await env.DB.prepare('INSERT INTO activities (id, lead_id, user_id, kind, text, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(newId(), leadId, userId || null, kind, String(text).slice(0, 300), Date.now()).run();
}

/** Round-robin owner for a lead that arrives without one (Settings → Assign new leads). */
async function autoOwner(env) {
  const s = await getSettings(env.DB);
  if (s.auto_assign !== 'round_robin') return null;
  const { results } = await env.DB.prepare("SELECT id FROM users WHERE active = 1 AND role = 'agent' ORDER BY created_at, id").all();
  const next = nextAssignee(results, s.rr_last);
  if (!next) return null;
  await env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('rr_last', ?)").bind(next.id).run();
  return next.id;
}

async function insertLead(env, l, ownerId, byUser = null) {
  const now = Date.now();
  const existing = await env.DB.prepare('SELECT id FROM leads WHERE phone = ?').bind(l.phone).first();
  if (existing) return { id: existing.id, duplicate: true };
  const id = newId();
  const owner = ownerId || (await autoOwner(env));
  await env.DB.prepare(`INSERT INTO leads (id, name, phone, email, source, status, owner_id, notes, external_id, created_at, updated_at, company, city, deal_value, expected_close, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, String(l.name).slice(0, 120), l.phone, l.email || null, l.source || null, LEAD_STATUSES.includes(l.status) ? l.status : 'new', owner || null,
      l.notes || null, l.external_id || null, now, now, l.company || null, l.city || null, money(l.deal_value), isoDate(l.expected_close), cleanTags(l.tags)).run();
  await logActivity(env, id, byUser, 'created', `Lead added${l.source ? ` from ${l.source}` : ''}${owner && !ownerId ? ' and assigned automatically' : ''}`);
  return { id };
}

route('POST', '/api/leads', async (req, env, { user }) => {
  const b = await body(req);
  const phone = normalizePhone(b.phone);
  if (!b.name || !phone) return fail(400, 'Name and phone are needed');
  const owner = isManager(user) ? b.owner_id || null : user.id;
  const r = await insertLead(env, { ...b, phone }, owner, user.id);
  return r.duplicate ? fail(409, 'A lead with this phone number already exists') : json(r);
});

route('POST', '/api/leads/import', async (req, env, { user }) => {
  const b = await body(req);
  const rows = parseCsv(String(b.csv || ''));
  const users = (await env.DB.prepare('SELECT id, email FROM users').all()).results;
  let added = 0, skipped = 0;
  for (const row of rows) {
    const l = mapIncomingLead(row);
    if (!l) { skipped++; continue; }
    const owner = isManager(user) ? users.find((u) => u.email === l.owner_email)?.id || b.owner_id || null : user.id;
    const r = await insertLead(env, l, owner, user.id);
    r.duplicate ? skipped++ : added++;
  }
  return json({ added, skipped });
});

route('PATCH', '/api/leads/:id', async (req, env, { params, user }) => {
  const lead = await env.DB.prepare('SELECT * FROM leads WHERE id = ?').bind(params.id).first();
  if (!lead || (!isManager(user) && lead.owner_id !== user.id)) return fail(404, 'Lead not found');
  const b = await body(req);
  const sets = [], vals = [], log = [];
  for (const k of ['name', 'email', 'source', 'notes', 'company', 'city']) if (b[k] !== undefined) { sets.push(`${k} = ?`); vals.push(String(b[k] || '').trim().slice(0, k === 'notes' ? 4000 : 200) || null); }
  if (b.name !== undefined && !String(b.name).trim()) return fail(400, 'Name is needed');
  for (const k of ['next_follow_up', 'expected_close']) if (b[k] !== undefined) { sets.push(`${k} = ?`); vals.push(isoDate(b[k])); }
  if (b.phone !== undefined) {
    const phone = normalizePhone(b.phone);
    if (!phone) return fail(400, 'Phone is needed');
    const dup = await env.DB.prepare('SELECT id FROM leads WHERE phone = ? AND id != ?').bind(phone, lead.id).first();
    if (dup) return fail(409, 'Another lead already has this phone number');
    sets.push('phone = ?'); vals.push(phone);
  }
  if (b.tags !== undefined) { sets.push('tags = ?'); vals.push(cleanTags(b.tags)); }
  if (b.deal_value !== undefined) {
    const v = money(b.deal_value);
    sets.push('deal_value = ?'); vals.push(v);
    if (v !== lead.deal_value) log.push(['value', v ? `Deal value set to ₹${v.toLocaleString('en-IN')}` : 'Deal value cleared']);
  }
  if (LEAD_STATUSES.includes(b.status) && b.status !== lead.status) {
    sets.push('status = ?'); vals.push(b.status);
    log.push(['status', `Stage: ${STATUS_LABELS[lead.status] || lead.status} → ${STATUS_LABELS[b.status]}`]);
  }
  if (b.owner_id !== undefined && isManager(user) && (b.owner_id || null) !== lead.owner_id) {
    const o = b.owner_id ? await env.DB.prepare('SELECT name FROM users WHERE id = ?').bind(b.owner_id).first() : null;
    if (b.owner_id && !o) return fail(400, 'Unknown agent');
    sets.push('owner_id = ?'); vals.push(b.owner_id || null);
    log.push(['owner', o ? `Assigned to ${o.name}` : 'Unassigned']);
  }
  if (!sets.length) return fail(400, 'Nothing to change');
  await env.DB.prepare(`UPDATE leads SET ${sets.join(', ')}, updated_at = ? WHERE id = ?`).bind(...vals, Date.now(), params.id).run();
  for (const [kind, text] of log) await logActivity(env, lead.id, user.id, kind, text);
  return json({ ok: true });
});

route('DELETE', '/api/leads/:id', async (req, env, { params }) => {
  await env.DB.batch([
    env.DB.prepare('UPDATE calls SET lead_id = NULL WHERE lead_id = ?').bind(params.id),
    env.DB.prepare('DELETE FROM notes WHERE lead_id = ?').bind(params.id),
    env.DB.prepare('DELETE FROM tasks WHERE lead_id = ?').bind(params.id),
    env.DB.prepare('DELETE FROM activities WHERE lead_id = ?').bind(params.id),
    env.DB.prepare('DELETE FROM leads WHERE id = ?').bind(params.id),
  ]);
  return json({ ok: true });
}, { manager: true });

// --- CRM: lead page, notes, tasks, pipeline, export
async function visibleLead(env, user, id) {
  const l = await env.DB.prepare('SELECT l.*, u.name AS owner_name FROM leads l LEFT JOIN users u ON u.id = l.owner_id WHERE l.id = ?').bind(id).first();
  return l && (isManager(user) || l.owner_id === user.id) ? l : null;
}

route('GET', '/api/leads/export', async (req, env, { user }) => {
  const st = env.DB.prepare(`SELECT l.*, u.name AS owner_name, (SELECT COUNT(*) FROM calls c WHERE c.lead_id = l.id) AS call_count
    FROM leads l LEFT JOIN users u ON u.id = l.owner_id ${isManager(user) ? '' : 'WHERE l.owner_id = ?'} ORDER BY l.created_at DESC`);
  const { results } = await (isManager(user) ? st : st.bind(user.id)).all();
  const day = (ms) => (ms ? dayOf(ms, env.TIMEZONE) : '');
  const csv = toCsv(results, [['name', 'Name'], ['phone', 'Phone'], ['email', 'Email'], ['company', 'Company'], ['city', 'City'],
    [(r) => STATUS_LABELS[r.status] || r.status, 'Stage'], ['deal_value', 'Deal value (INR)'], ['expected_close', 'Expected close'],
    ['owner_name', 'Agent'], ['source', 'Source'], ['tags', 'Tags'], ['next_follow_up', 'Next follow-up'], ['call_count', 'Calls'],
    [(r) => day(r.created_at), 'Created'], ['notes', 'Notes']]);
  return new Response(csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="salepunch-leads-${today(env)}.csv"`, 'cache-control': 'no-store' } });
});

route('GET', '/api/leads/:id', async (req, env, { user, params }) => {
  const lead = await visibleLead(env, user, params.id);
  if (!lead) return fail(404, 'Lead not found');
  const [calls, notes, tasks, acts] = await Promise.all([
    env.DB.prepare(`SELECT c.id, c.agent_id, c.status, c.processing, c.started_at, c.duration_sec, c.outcome, c.conversion_chance, c.skill_score,
        json_extract(c.analysis, '$.summary') AS summary, json_extract(c.analysis, '$.next_action') AS next_action, u.name AS agent_name
      FROM calls c LEFT JOIN users u ON u.id = c.agent_id WHERE c.lead_id = ? ORDER BY c.started_at DESC LIMIT 200`).bind(lead.id).all(),
    env.DB.prepare('SELECT n.*, u.name AS user_name FROM notes n LEFT JOIN users u ON u.id = n.user_id WHERE n.lead_id = ? ORDER BY n.created_at DESC LIMIT 200').bind(lead.id).all(),
    env.DB.prepare('SELECT t.*, u.name AS user_name FROM tasks t LEFT JOIN users u ON u.id = t.user_id WHERE t.lead_id = ? ORDER BY t.done, t.due_at LIMIT 200').bind(lead.id).all(),
    env.DB.prepare('SELECT a.*, u.name AS user_name FROM activities a LEFT JOIN users u ON u.id = a.user_id WHERE a.lead_id = ? ORDER BY a.created_at DESC LIMIT 200').bind(lead.id).all(),
  ]);
  return json({ lead, calls: calls.results, notes: notes.results, tasks: tasks.results, activities: acts.results });
});

route('POST', '/api/leads/:id/notes', async (req, env, { user, params }) => {
  const lead = await visibleLead(env, user, params.id);
  if (!lead) return fail(404, 'Lead not found');
  const text = String((await body(req)).body || '').trim().slice(0, 4000);
  if (!text) return fail(400, 'Write something first');
  const id = newId();
  await env.DB.prepare('INSERT INTO notes (id, lead_id, user_id, body, created_at) VALUES (?, ?, ?, ?, ?)').bind(id, lead.id, user.id, text, Date.now()).run();
  await env.DB.prepare('UPDATE leads SET updated_at = ? WHERE id = ?').bind(Date.now(), lead.id).run();
  return json({ id });
});

route('DELETE', '/api/notes/:id', async (req, env, { user, params }) => {
  const n = await env.DB.prepare('SELECT * FROM notes WHERE id = ?').bind(params.id).first();
  if (!n || (n.user_id !== user.id && !isManager(user))) return fail(404, 'Note not found');
  await env.DB.prepare('DELETE FROM notes WHERE id = ?').bind(n.id).run();
  return json({ ok: true });
});

const dueOk = (v) => (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(String(v || '')) ? String(v) : null);

route('GET', '/api/tasks', async (req, env, { user, url }) => {
  const where = [], vals = [];
  const who = url.searchParams.get('user');
  if (!isManager(user)) { where.push('t.user_id = ?'); vals.push(user.id); }
  else if (who && who !== 'all') { where.push('t.user_id = ?'); vals.push(who === 'me' ? user.id : who); }
  else if (!who) { where.push('t.user_id = ?'); vals.push(user.id); }
  const done = url.searchParams.get('done');
  if (done === '0' || done === '1') { where.push('t.done = ?'); vals.push(Number(done)); }
  const { results } = await env.DB.prepare(`SELECT t.*, u.name AS user_name, l.name AS lead_name, l.phone AS lead_phone
    FROM tasks t LEFT JOIN users u ON u.id = t.user_id LEFT JOIN leads l ON l.id = t.lead_id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY t.done, (t.due_at IS NULL), t.due_at, t.created_at LIMIT 500`).bind(...vals).all();
  return json({ tasks: results });
});

route('POST', '/api/tasks', async (req, env, { user }) => {
  const b = await body(req);
  const title = String(b.title || '').trim().slice(0, 200);
  if (!title) return fail(400, 'Give the task a title');
  if (b.lead_id && !(await visibleLead(env, user, b.lead_id))) return fail(404, 'Lead not found');
  const assignee = isManager(user) && b.user_id ? b.user_id : user.id;
  if (!(await env.DB.prepare('SELECT id FROM users WHERE id = ? AND active = 1').bind(assignee).first())) return fail(400, 'Unknown agent');
  const id = newId();
  await env.DB.prepare('INSERT INTO tasks (id, lead_id, user_id, title, due_at, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(id, b.lead_id || null, assignee, title, dueOk(b.due_at), user.id, Date.now()).run();
  return json({ id });
});

route('PATCH', '/api/tasks/:id', async (req, env, { user, params }) => {
  const t = await env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(params.id).first();
  if (!t || (t.user_id !== user.id && !isManager(user))) return fail(404, 'Task not found');
  const b = await body(req);
  const sets = [], vals = [];
  if (b.title !== undefined) { const v = String(b.title).trim().slice(0, 200); if (!v) return fail(400, 'Title is needed'); sets.push('title = ?'); vals.push(v); }
  if (b.due_at !== undefined) { sets.push('due_at = ?'); vals.push(dueOk(b.due_at)); }
  if (b.done !== undefined) { sets.push('done = ?', 'done_at = ?'); vals.push(b.done ? 1 : 0, b.done ? Date.now() : null); }
  if (!sets.length) return fail(400, 'Nothing to change');
  await env.DB.prepare(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`).bind(...vals, t.id).run();
  if (b.done && !t.done && t.lead_id) await logActivity(env, t.lead_id, user.id, 'task', `Task done: ${t.title}`);
  return json({ ok: true });
});

route('DELETE', '/api/tasks/:id', async (req, env, { user, params }) => {
  const t = await env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(params.id).first();
  if (!t || (t.user_id !== user.id && t.created_by !== user.id && !isManager(user))) return fail(404, 'Task not found');
  await env.DB.prepare('DELETE FROM tasks WHERE id = ?').bind(t.id).run();
  return json({ ok: true });
});

route('GET', '/api/pipeline', async (req, env, { user, url }) => {
  const where = [], vals = [];
  if (!isManager(user)) { where.push('l.owner_id = ?'); vals.push(user.id); }
  else if (url.searchParams.get('owner')) { where.push('l.owner_id = ?'); vals.push(url.searchParams.get('owner')); }
  const { results } = await env.DB.prepare(`SELECT l.id, l.name, l.phone, l.company, l.status, l.deal_value, l.expected_close, l.next_follow_up, l.tags, l.owner_id, l.updated_at, u.name AS owner_name
    FROM leads l LEFT JOIN users u ON u.id = l.owner_id ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY l.updated_at DESC LIMIT 2000`).bind(...vals).all();
  const stages = LEAD_STATUSES.map((s) => {
    const items = results.filter((l) => l.status === s);
    return { key: s, label: STATUS_LABELS[s], count: items.length, value: items.reduce((n, l) => n + (l.deal_value || 0), 0), leads: items.slice(0, 200) };
  });
  const open = results.filter((l) => !['won', 'lost'].includes(l.status));
  return json({ stages, open_value: open.reduce((n, l) => n + (l.deal_value || 0), 0), won_value: stages.find((s) => s.key === 'won').value });
});

// --- calls
route('POST', '/api/calls/dial', async (req, env, { user }) => {
  if (!exotelReady(env)) return fail(400, 'Telephony is not connected yet. Add your Exotel settings (see README).');
  if (!user.phone) return fail(400, 'Add your mobile number to your profile first, so the call can ring you.');
  const b = await body(req);
  const lead = await env.DB.prepare('SELECT * FROM leads WHERE id = ?').bind(b.lead_id || '').first();
  if (!lead || (!isManager(user) && lead.owner_id !== user.id)) return fail(404, 'Lead not found');
  const id = newId(), now = Date.now();
  await env.DB.prepare("INSERT INTO calls (id, agent_id, lead_id, lead_phone, provider, status, started_at, day) VALUES (?, ?, ?, ?, 'exotel', 'dialing', ?, ?)")
    .bind(id, user.id, lead.id, lead.phone, now, today(env, now)).run();
  try {
    const sid = await exotelDial({ agentPhone: user.phone, leadPhone: lead.phone, callId: id, callbackUrl: `${origin(req, env)}/hooks/exotel?key=${encodeURIComponent(env.WEBHOOK_SECRET || '')}` }, env);
    await env.DB.prepare('UPDATE calls SET provider_call_id = ? WHERE id = ?').bind(sid, id).run();
    if (!lead.owner_id) await env.DB.prepare('UPDATE leads SET owner_id = ? WHERE id = ?').bind(user.id, lead.id).run();
    return json({ id, message: 'Your phone will ring now. Pick up and SalePunch connects the lead.' });
  } catch (e) {
    await env.DB.prepare("UPDATE calls SET status = 'failed', processing = 'skipped', error = ? WHERE id = ?").bind(e.message, id).run();
    return fail(502, e.message);
  }
});

// SIM calling: the agent's own phone places the call (SalePunch Android app,
// or the phone dialer from a browser). The phone's built-in recorder saves the
// call and the app uploads it to /api/calls/:id/finish when the call ends.
route('POST', '/api/calls/sim', async (req, env, { user }) => {
  const b = await body(req);
  const lead = await env.DB.prepare('SELECT * FROM leads WHERE id = ?').bind(b.lead_id || '').first();
  if (!lead || (!isManager(user) && lead.owner_id !== user.id)) return fail(404, 'Lead not found');
  const id = newId(), now = Date.now();
  // via "phone": clicked on a computer, so hand the call to the agent's phone app.
  const toPhone = b.via === 'phone';
  if (toPhone && !(await phoneOnline(env, user.id, now))) {
    return fail(409, 'Your phone is not connected. Open the SalePunch app on your phone and stay signed in, then click Call again.');
  }
  await env.DB.prepare("INSERT INTO calls (id, agent_id, lead_id, lead_phone, provider, status, started_at, day) VALUES (?, ?, ?, ?, 'sim', ?, ?, ?)")
    .bind(id, user.id, lead.id, lead.phone, toPhone ? 'queued' : 'dialing', now, today(env, now)).run();
  if (!lead.owner_id) await env.DB.prepare('UPDATE leads SET owner_id = ? WHERE id = ?').bind(user.id, lead.id).run();
  return json({ id, phone: lead.phone, name: lead.name, queued: toPhone });
});

const PHONE_ONLINE_MS = 30000;
async function phoneOnline(env, userId, now = Date.now()) {
  const d = await env.DB.prepare('SELECT seen_at FROM devices WHERE user_id = ?').bind(userId).first();
  return !!d && now - d.seen_at < PHONE_ONLINE_MS;
}

route('GET', '/api/phone/status', async (req, env, { user }) => json({ online: await phoneOnline(env, user.id) }));

// The phone app asks every few seconds: "anything for me to dial?"
route('POST', '/api/phone/next', async (req, env, { user }) => {
  const now = Date.now();
  const b = await body(req);
  await env.DB.prepare('INSERT INTO devices (user_id, seen_at, app_version) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET seen_at = excluded.seen_at, app_version = excluded.app_version')
    .bind(user.id, now, String(b.version || '').slice(0, 20)).run();
  await env.DB.prepare("UPDATE calls SET status = 'failed', processing = 'skipped', error = 'The phone did not pick up this call in time' WHERE agent_id = ? AND status = 'queued' AND started_at < ?")
    .bind(user.id, now - 90000).run();
  if (b.busy === true) return json({ call: null }); // on a call right now: just check in
  const c = await env.DB.prepare(`SELECT c.id, c.lead_phone, l.name AS lead_name FROM calls c LEFT JOIN leads l ON l.id = c.lead_id
    WHERE c.agent_id = ? AND c.status = 'queued' ORDER BY c.started_at LIMIT 1`).bind(user.id).first();
  if (!c) return json({ call: null });
  const claimed = await env.DB.prepare("UPDATE calls SET status = 'dialing', started_at = ? WHERE id = ? AND status = 'queued'").bind(now, c.id).run();
  if (!claimed.meta?.changes) return json({ call: null });
  return json({ call: { id: c.id, phone: c.lead_phone, name: c.lead_name || '' } });
});

const SIM_STATUS = ['completed', 'no_answer', 'busy', 'failed'];
route('POST', '/api/calls/:id/finish', async (req, env, { user, params, ctx }) => {
  const call = await env.DB.prepare('SELECT * FROM calls WHERE id = ?').bind(params.id).first();
  if (!call || (call.agent_id !== user.id && !isManager(user))) return fail(404, 'Call not found');
  if (call.provider === 'exotel') return fail(400, 'This call is tracked by the phone line');
  const form = await req.formData();
  const file = form.get('audio');
  const hasAudio = !!(file && typeof file === 'object' && file.size);
  if (hasAudio && file.size > MAX_UPLOAD) return fail(413, 'Recording is too large (25 MB max)');
  const status = SIM_STATUS.includes(String(form.get('status'))) ? String(form.get('status')) : (hasAudio ? 'completed' : call.status === 'dialing' ? 'completed' : call.status);
  const duration = Math.max(0, Math.round(Number(form.get('duration_sec')) || 0)) || call.duration_sec || 0;
  const startedAt = Date.parse(String(form.get('started_at') || '')) || call.started_at;
  // A call listened to live on the computer already has a better, speaker-labelled
  // transcript: keep it, and only fill in the call result (and audio if missing).
  const live = await env.DB.prepare('SELECT 1 AS x FROM live_segments WHERE call_id = ? LIMIT 1').bind(call.id).first();
  if (live) {
    const key = hasAudio && !call.recording_key ? await saveRecording(env, call, new Uint8Array(await file.arrayBuffer()), file.type || 'audio/mp4', file.name) : null;
    await env.DB.prepare('UPDATE calls SET status = ?, duration_sec = MAX(duration_sec, ?), started_at = ?, recording_key = COALESCE(recording_key, ?) WHERE id = ?')
      .bind(status, duration, startedAt, key, call.id).run();
    return json({ ok: true, status, recording: hasAudio, live: true });
  }
  let key = null;
  if (hasAudio) key = await saveRecording(env, call, new Uint8Array(await file.arrayBuffer()), file.type || 'audio/mp4', file.name);
  const processing = hasAudio ? 'pending' : 'skipped';
  const note = !hasAudio && status === 'completed' ? 'No recording found on the phone. Turn on automatic call recording in the phone dialer (see How it works).' : null;
  await env.DB.prepare('UPDATE calls SET status = ?, duration_sec = ?, started_at = ?, recording_key = COALESCE(?, recording_key), processing = ?, error = ?, transcript = CASE WHEN ? THEN NULL ELSE transcript END WHERE id = ?')
    .bind(status, duration, startedAt, key, processing, note, hasAudio ? 1 : 0, call.id).run();
  if (call.lead_id) await env.DB.prepare("UPDATE leads SET status = CASE WHEN status = 'new' THEN 'contacted' ELSE status END, updated_at = ? WHERE id = ?").bind(Date.now(), call.lead_id).run();
  if (hasAudio) await enqueueCall(env, call.id, ctx);
  return json({ ok: true, status, recording: hasAudio });
});

// --- Live calls: the computer listens to both sides and the AI coaches during the call
const JUNK = /^(thank you\.?|thanks for watching.*|you\.?|bye\.?|\.+|music|\[.*\]|\(.*\))$/i;
async function ownLiveCall(env, user, id) {
  const c = await env.DB.prepare('SELECT * FROM calls WHERE id = ?').bind(id).first();
  return c && c.agent_id === user.id && c.provider !== 'exotel' ? c : null;
}

route('POST', '/api/calls/:id/live-chunk', async (req, env, { user, params }) => {
  const call = await ownLiveCall(env, user, params.id);
  if (!call) return fail(404, 'Call not found');
  const form = await req.formData();
  const file = form.get('audio');
  const speaker = ['lead', 'mixed'].includes(form.get('speaker')) ? form.get('speaker') : 'agent'; // mixed = one mic hears both
  const start = Math.max(0, Number(form.get('start')) || 0);
  if (!file || typeof file !== 'object' || !file.size) return fail(400, 'No audio');
  if (file.size > 3 * 1024 * 1024) return fail(413, 'Audio piece too large');
  const t = await transcribeAndTranslate(new Uint8Array(await file.arrayBuffer()), env, { language: env.CALL_LANGUAGE || undefined });
  const text = t.original.map((x) => x.text).join(' ').trim();
  if (!text || JUNK.test(text)) return json({ text: '' });
  const en = t.translated ? t.segments.map((x) => x.text).join(' ').trim() : null;
  const r = await env.DB.prepare('INSERT INTO live_segments (call_id, start, speaker, text, en, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(call.id, start, speaker, text.slice(0, 4000), en ? en.slice(0, 4000) : null, Date.now()).run();
  return json({ id: r.meta?.last_row_id, speaker, start, text, en, language: t.language });
});

route('POST', '/api/calls/:id/live-coach', async (req, env, { user, params }) => {
  const call = await ownLiveCall(env, user, params.id);
  if (!call) return fail(404, 'Call not found');
  if (!env.AI) return json({ tip: null });
  const { results } = await env.DB.prepare("SELECT id, speaker, text, en FROM live_segments WHERE call_id = ? ORDER BY start DESC, id DESC LIMIT 30").bind(call.id).all();
  const lines = results.reverse().filter((r) => r.speaker !== 'coach').map((r) => ({ speaker: r.speaker, text: r.en || r.text }));
  if (lines.length < (lines.some((l) => l.speaker === 'mixed') ? 1 : 2)) return json({ tip: null });
  const lastCoach = results.filter((r) => r.speaker === 'coach').at(-1);
  const s = await getSettings(env.DB);
  let tip = null;
  try { tip = await liveCoachTip({ lines, product: s.product, script: s.script }, env); } catch (e) { console.log('coach failed', e.message); }
  if (!tip || (lastCoach && lastCoach.text === tip.tip)) return json({ tip: null });
  const r = await env.DB.prepare("INSERT INTO live_segments (call_id, start, speaker, text, en, created_at) VALUES (?, (SELECT COALESCE(MAX(start), 0) FROM live_segments WHERE call_id = ?), 'coach', ?, ?, ?)")
    .bind(call.id, call.id, tip.tip, tip.kind, Date.now()).run();
  return json({ tip: { id: r.meta?.last_row_id, text: tip.tip, kind: tip.kind } });
});

route('GET', '/api/calls/:id/live', async (req, env, { user, params, url }) => {
  const c = await env.DB.prepare('SELECT id, agent_id, status, processing FROM calls WHERE id = ?').bind(params.id).first();
  if (!c || (c.agent_id !== user.id && !isManager(user))) return fail(404, 'Call not found');
  const after = Number(url.searchParams.get('after')) || 0;
  const { results } = await env.DB.prepare('SELECT id, start, speaker, text, en FROM live_segments WHERE call_id = ? AND id > ? ORDER BY id LIMIT 500').bind(c.id, after).all();
  return json({ status: c.status, processing: c.processing, segments: results });
});

route('POST', '/api/calls/:id/live-finish', async (req, env, { user, params, ctx }) => {
  const call = await ownLiveCall(env, user, params.id);
  if (!call) return fail(404, 'Call not found');
  const form = await req.formData();
  const file = form.get('recording');
  const duration = Math.max(0, Math.round(Number(form.get('duration_sec')) || 0));
  const { results } = await env.DB.prepare("SELECT start, speaker, text, en FROM live_segments WHERE call_id = ? AND speaker != 'coach' ORDER BY start, id").bind(call.id).all();
  let key = call.recording_key;
  if (file && typeof file === 'object' && file.size && file.size <= MAX_UPLOAD) {
    key = await saveRecording(env, call, new Uint8Array(await file.arrayBuffer()), file.type || 'audio/webm', file.name || 'call.webm');
  }
  if (!results.length) {
    await env.DB.prepare("UPDATE calls SET status = CASE WHEN status IN ('dialing','queued') THEN 'completed' ELSE status END, duration_sec = MAX(duration_sec, ?), recording_key = ? WHERE id = ?")
      .bind(duration, key || null, call.id).run();
    if (key) await enqueueCall(env, call.id, ctx); // nothing heard live: analyse the recording instead
    return json({ ok: true, segments: 0 });
  }
  const segments = results.map((r, i) => ({ start: r.start, end: results[i + 1]?.start ?? r.start + 5, text: r.en || r.text, speaker: r.speaker }));
  const translated = results.some((r) => r.en);
  const who = (sp) => (sp === 'agent' ? 'Agent: ' : sp === 'lead' ? 'Lead: ' : '');
  const seed = translated ? JSON.stringify({ original: { language: 'detected', text: results.map((r) => who(r.speaker) + r.text).join('\n').slice(0, 20000) } }) : null;
  await env.DB.prepare(`UPDATE calls SET status = CASE WHEN status IN ('dialing','queued') THEN 'completed' ELSE status END, duration_sec = MAX(duration_sec, ?),
      recording_key = ?, transcript = ?, analysis = ?, processing = 'pending', error = NULL WHERE id = ?`)
    .bind(duration, key || null, JSON.stringify(segments), seed, call.id).run();
  if (call.lead_id) await env.DB.prepare("UPDATE leads SET status = CASE WHEN status = 'new' THEN 'contacted' ELSE status END, updated_at = ? WHERE id = ?").bind(Date.now(), call.lead_id).run();
  await enqueueCall(env, call.id, ctx);
  return json({ ok: true, segments: segments.length });
});

// Calls happening right now (for the "Live now" strip).
route('GET', '/api/calls/live', async (req, env, { user }) => {
  const st = env.DB.prepare(`SELECT c.id, c.agent_id, c.provider, c.started_at, u.name AS agent_name, l.name AS lead_name, c.lead_phone
    FROM calls c LEFT JOIN users u ON u.id = c.agent_id LEFT JOIN leads l ON l.id = c.lead_id
    WHERE c.status = 'dialing' AND c.started_at > ? ${isManager(user) ? '' : 'AND c.agent_id = ?'} ORDER BY c.started_at DESC`);
  const since = Date.now() - 60 * 60000;
  const { results } = await (isManager(user) ? st.bind(since) : st.bind(since, user.id)).all();
  return json({ calls: results });
});

route('POST', '/api/calls/upload', async (req, env, { user, ctx }) => {
  const form = await req.formData();
  const file = form.get('audio');
  const text = String(form.get('transcript') || '');
  if (!(file && file.size) && !text.trim()) return fail(400, 'Attach a recording or paste the transcript');
  if (file && file.size > MAX_UPLOAD) return fail(413, 'Recording is too large (25 MB max)');
  const agentId = isManager(user) && form.get('agent_id') ? String(form.get('agent_id')) : user.id;
  let leadId = String(form.get('lead_id') || '') || null;
  const phone = normalizePhone(form.get('lead_phone'));
  if (!leadId && phone) leadId = (await env.DB.prepare('SELECT id FROM leads WHERE phone = ?').bind(phone).first())?.id || null;
  const when = Date.parse(String(form.get('started_at') || '')) || Date.now();
  const id = newId();
  const day = dayOf(when, env.TIMEZONE || 'Asia/Kolkata');
  let key = null;
  if (file && file.size) key = await saveRecording(env, { id, day }, new Uint8Array(await file.arrayBuffer()), file.type || 'audio/mpeg', file.name);
  await env.DB.prepare("INSERT INTO calls (id, agent_id, lead_id, lead_phone, provider, status, started_at, duration_sec, recording_key, day, transcript) VALUES (?, ?, ?, ?, 'upload', 'completed', ?, ?, ?, ?, ?)")
    .bind(id, agentId, leadId, phone || null, when, Math.max(0, Number(form.get('duration_sec')) || 0), key, day, key ? null : JSON.stringify(parseTextTranscript(text))).run();
  await enqueueCall(env, id, ctx);
  return json({ id });
});

function callFilters(user, url) {
  const where = [], vals = [];
  if (!isManager(user)) { where.push('c.agent_id = ?'); vals.push(user.id); }
  else if (url.searchParams.get('agent')) { where.push('c.agent_id = ?'); vals.push(url.searchParams.get('agent')); }
  const from = url.searchParams.get('from'), to = url.searchParams.get('to');
  if (from) { where.push('c.day >= ?'); vals.push(from); }
  if (to) { where.push('c.day <= ?'); vals.push(to); }
  if (url.searchParams.get('outcome')) { where.push('c.outcome = ?'); vals.push(url.searchParams.get('outcome')); }
  if (url.searchParams.get('lead')) { where.push('c.lead_id = ?'); vals.push(url.searchParams.get('lead')); }
  return { where: where.length ? 'WHERE ' + where.join(' AND ') : '', vals };
}

route('GET', '/api/calls', async (req, env, { user, url }) => {
  const { where, vals } = callFilters(user, url);
  const { results } = await env.DB.prepare(`SELECT c.id, c.agent_id, c.lead_id, c.lead_phone, c.provider, c.status, c.processing, c.error,
      c.started_at, c.duration_sec, c.outcome, c.conversion_chance, c.skill_score, c.day, c.language,
      json_extract(c.analysis, '$.summary') AS summary, json_extract(c.analysis, '$.red_flags') AS red_flags,
      u.name AS agent_name, l.name AS lead_name
    FROM calls c LEFT JOIN users u ON u.id = c.agent_id LEFT JOIN leads l ON l.id = c.lead_id
    ${where} ORDER BY c.started_at DESC LIMIT 300`).bind(...vals).all();
  return json({ calls: results.map((c) => ({ ...c, red_flags: safeJson(c.red_flags, []) })) });
});

async function visibleCall(env, user, id) {
  const c = await env.DB.prepare(`SELECT c.*, u.name AS agent_name, l.name AS lead_name, l.status AS lead_status
    FROM calls c LEFT JOIN users u ON u.id = c.agent_id LEFT JOIN leads l ON l.id = c.lead_id WHERE c.id = ?`).bind(id).first();
  return c && (isManager(user) || c.agent_id === user.id) ? c : null;
}

route('GET', '/api/calls/:id', async (req, env, { user, params }) => {
  const c = await visibleCall(env, user, params.id);
  if (!c) return fail(404, 'Call not found');
  const { recording_url, ...rest } = c;
  return json({ call: { ...rest, has_audio: !!(c.recording_key || recording_url), transcript: safeJson(c.transcript, []), analysis: safeJson(c.analysis, null) } });
});

route('GET', '/api/calls/:id/audio', async (req, env, { user, params }) => {
  const c = await visibleCall(env, user, params.id);
  if (!c) return fail(404, 'Call not found');
  const rec = await loadRecording(env, c);
  if (!rec) return fail(404, 'No recording stored');
  return audioResponse(rec.bytes, rec.type, req.headers.get('range'));
});

route('POST', '/api/calls/:id/reprocess', async (req, env, { user, params, ctx }) => {
  const c = await visibleCall(env, user, params.id);
  if (!c) return fail(404, 'Call not found');
  // Keep a pasted transcript; recordings are transcribed again.
  if (c.recording_key || c.recording_url) await env.DB.prepare('UPDATE calls SET transcript = NULL WHERE id = ?').bind(c.id).run();
  await env.DB.prepare("UPDATE calls SET processing = 'pending', error = NULL WHERE id = ?").bind(c.id).run();
  await enqueueCall(env, c.id, ctx);
  return json({ ok: true });
}, { manager: true });

// --- dashboard & reports
route('GET', '/api/dashboard', async (req, env, { user, url }) => {
  const from = url.searchParams.get('from') || today(env);
  const to = url.searchParams.get('to') || from;
  const agentsSql = isManager(user) ? 'SELECT id, name FROM users WHERE active = 1 ORDER BY name' : 'SELECT id, name FROM users WHERE id = ?';
  const ust = env.DB.prepare(agentsSql);
  const { results: users } = await (isManager(user) ? ust : ust.bind(user.id)).all();
  const st = env.DB.prepare(`SELECT agent_id, status, processing, duration_sec, outcome, conversion_chance, skill_score, analysis FROM calls
    WHERE day >= ? AND day <= ? ${isManager(user) ? '' : 'AND agent_id = ?'}`);
  const { results: calls } = await (isManager(user) ? st.bind(from, to) : st.bind(from, to, user.id)).all();
  const leadSt = env.DB.prepare(`SELECT status, COUNT(*) AS n FROM leads ${isManager(user) ? '' : 'WHERE owner_id = ?'} GROUP BY status`);
  const { results: pipeline } = await (isManager(user) ? leadSt : leadSt.bind(user.id)).all();
  const due = await env.DB.prepare(`SELECT COUNT(*) AS n FROM leads WHERE next_follow_up <= ? AND status NOT IN ('won','lost') ${isManager(user) ? '' : 'AND owner_id = ?'}`)
    .bind(...(isManager(user) ? [today(env)] : [today(env), user.id])).first();
  const stats = teamStats(calls, users);
  // Hide agents with no calls in the range from the leaderboard noise, but keep them listed last.
  return json({ from, to, ...stats, pipeline, follow_ups_due: due.n });
});

route('GET', '/api/leaks', async (req, env, { user, url }) => {
  const to = url.searchParams.get('to') || today(env);
  const from = url.searchParams.get('from') || dayOf(Date.parse(to + 'T12:00:00Z') - 29 * 86400000, env.TIMEZONE);
  const startMs = Date.parse(from + 'T00:00:00+05:30'), endMs = Date.parse(to + 'T23:59:59+05:30');
  const mgr = isManager(user);
  const leadSt = env.DB.prepare(`SELECT id, name, phone, status, owner_id, source, created_at, next_follow_up FROM leads
    WHERE created_at >= ? AND created_at <= ? ${mgr ? '' : 'AND owner_id = ?'}`);
  const { results: leads } = await (mgr ? leadSt.bind(startMs, endMs) : leadSt.bind(startMs, endMs, user.id)).all();
  const callSt = env.DB.prepare(`SELECT c.id, c.lead_id, c.agent_id, c.status, c.outcome, c.started_at, c.duration_sec, c.processing, c.skill_score, c.analysis, l.name AS lead_name
    FROM calls c LEFT JOIN leads l ON l.id = c.lead_id WHERE c.started_at >= ? ${mgr ? '' : 'AND c.agent_id = ?'}`);
  const { results: calls } = await (mgr ? callSt.bind(startMs) : callSt.bind(startMs, user.id)).all();
  const ust = env.DB.prepare(mgr ? 'SELECT id, name FROM users WHERE active = 1' : 'SELECT id, name FROM users WHERE id = ?');
  const { results: users } = await (mgr ? ust : ust.bind(user.id)).all();
  return json({ from, to, ...salesLeaks({ leads, calls, users, today: today(env) }) });
});

route('GET', '/api/productivity', async (req, env, { user, url }) => {
  const day = url.searchParams.get('day') || today(env);
  const mgr = isManager(user);
  const st = env.DB.prepare(`SELECT agent_id, status, outcome, started_at, duration_sec FROM calls WHERE day = ? ${mgr ? '' : 'AND agent_id = ?'}`);
  const { results: calls } = await (mgr ? st.bind(day) : st.bind(day, user.id)).all();
  const ust = env.DB.prepare(mgr ? 'SELECT id, name FROM users WHERE active = 1' : 'SELECT id, name FROM users WHERE id = ?');
  const { results: users } = await (mgr ? ust : ust.bind(user.id)).all();
  const target = Number((await getSettings(env.DB)).daily_call_target) || 60;
  return json({ day, ...productivity({ calls, users, target }) });
});

// Public enquiry form on the home page: becomes a lead in this workspace.
route('POST', '/api/enquiry', async (req, env) => {
  const b = await body(req);
  if (b.website) return json({ ok: true }); // honeypot: bots fill hidden fields
  const phone = normalizePhone(b.phone);
  const name = String(b.name || '').trim().slice(0, 80);
  if (!name || phone.length < 11) return fail(400, 'Please enter your name and a valid phone number');
  const plan = ['starter', 'growth', 'pro'].includes(b.plan) ? b.plan : 'demo';
  const notes = [b.company && `Company: ${String(b.company).slice(0, 80)}`, b.team && `Team size: ${String(b.team).slice(0, 20)}`, b.message && String(b.message).slice(0, 500)].filter(Boolean).join(' · ');
  const r = await insertLead(env, { name, phone, email: String(b.email || '').slice(0, 120), source: `Website · ${plan} plan`, notes, status: 'new' }, null);
  return json({ ok: true, duplicate: !!r.duplicate });
}, { public: true });

route('GET', '/api/reports', async (req, env, { user, url }) => {
  const day = url.searchParams.get('day') || today(env);
  const st = env.DB.prepare(`SELECT r.*, u.name AS agent_name FROM reports r JOIN users u ON u.id = r.agent_id WHERE r.day = ? ${isManager(user) ? '' : 'AND r.agent_id = ?'} ORDER BY u.name`);
  const { results } = await (isManager(user) ? st.bind(day) : st.bind(day, user.id)).all();
  return json({ day, reports: results.map((r) => ({ ...r, stats: safeJson(r.stats, {}) })) });
});

route('POST', '/api/reports/run', async (req, env, { url }) => {
  const n = await dailyReport(env, url.searchParams.get('day') || today(env));
  return json({ agents: n });
}, { manager: true });

// --- settings
route('GET', '/api/settings', async (req, env) => {
  const s = await getSettings(env.DB);
  const base = env.APP_URL || origin(req, env);
  return json({
    settings: Object.fromEntries(SETTING_KEYS.map((k) => [k, s[k] || ''])),
    lead_webhook: env.LEADS_WEBHOOK_KEY ? `${base}/hooks/leads?key=${env.LEADS_WEBHOOK_KEY}` : '',
    telephony: exotelReady(env), ai: !!(env.ANTHROPIC_API_KEY || env.AI), ai_engine: env.ANTHROPIC_API_KEY ? 'claude' : env.AI ? 'workers-ai' : '',
  });
}, { manager: true });

route('PUT', '/api/settings', async (req, env) => {
  const b = await body(req);
  for (const k of SETTING_KEYS) {
    if (b[k] === undefined) continue;
    const v = String(b[k]).slice(0, 20000);
    if (k.endsWith('_url') && v && !/^https:\/\//.test(v)) return fail(400, `${k} must start with https://`);
    await env.DB.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').bind(k, v).run();
  }
  return json({ ok: true });
}, { manager: true });

// --- webhooks (no login; protected by secret key)
route('POST', '/hooks/exotel', async (req, env, { url, ctx }) => {
  if (!sameSecret(url.searchParams.get('key'), env.WEBHOOK_SECRET)) return fail(403, 'Bad key');
  const cb = await parseExotelCallback(req);
  let call = cb.callId ? await env.DB.prepare('SELECT * FROM calls WHERE id = ?').bind(cb.callId).first() : null;
  if (!call && cb.providerCallId) call = await env.DB.prepare("SELECT * FROM calls WHERE provider = 'exotel' AND provider_call_id = ?").bind(cb.providerCallId).first();
  if (!call) return json({ ok: true, ignored: 'unknown call' });
  const done = cb.status === 'completed' && cb.recordingUrl;
  await env.DB.prepare('UPDATE calls SET status = ?, duration_sec = ?, recording_url = ?, provider_call_id = COALESCE(provider_call_id, ?), started_at = COALESCE(?, started_at), processing = ? WHERE id = ?')
    .bind(cb.status, cb.durationSec, cb.recordingUrl || null, cb.providerCallId || null, cb.startedAt, done ? 'pending' : 'skipped', call.id).run();
  if (done) await enqueueCall(env, call.id, ctx);
  else if (call.lead_id) await env.DB.prepare("UPDATE leads SET status = CASE WHEN status = 'new' THEN 'contacted' ELSE status END, updated_at = ? WHERE id = ?").bind(Date.now(), call.lead_id).run();
  return json({ ok: true });
}, { public: true });

route('POST', '/hooks/leads', async (req, env, { url }) => {
  if (!sameSecret(url.searchParams.get('key'), env.LEADS_WEBHOOK_KEY)) return fail(403, 'Bad key');
  const b = await body(req);
  const list = Array.isArray(b) ? b : Array.isArray(b.leads) ? b.leads : [b];
  const users = (await env.DB.prepare('SELECT id, email FROM users WHERE active = 1').all()).results;
  const out = [];
  for (const raw of list.slice(0, 200)) {
    const l = mapIncomingLead(raw);
    if (!l) { out.push({ error: 'no phone number' }); continue; }
    out.push(await insertLead(env, l, users.find((u) => u.email === l.owner_email)?.id || null));
  }
  return json({ results: out });
}, { public: true });

// ---------------------------------------------------------------- entry
export default {
  async fetch(request, env, ctx) {
    if (env.FAKE_AI === '1' && !env.AI) env = { ...env, AI: fakeAI }; // local development only
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/') && !url.pathname.startsWith('/hooks/')) {
      return env.ASSETS ? env.ASSETS.fetch(request) : serveStatic(url.pathname, url.search);
    }
    const r = routes.find((x) => x.method === request.method && x.re.test(url.pathname));
    if (!r) return fail(404, 'Not found');
    const m = url.pathname.match(r.re);
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
    try {
      let user = null;
      if (!r.public) {
        user = await currentUser(request, env);
        if (!user) return fail(401, 'Please sign in');
        if (r.manager && !isManager(user)) return fail(403, 'Managers only');
        // Simple CSRF guard for cookie auth: writes must come from our own page.
        if (request.method !== 'GET' && request.headers.get('x-salepunch') !== '1') return fail(403, 'Missing request header');
      }
      return await r.handler(request, env, { user, params, url, ctx });
    } catch (e) {
      console.log('request failed', url.pathname, e.stack || e.message);
      return fail(500, e.message || 'Server error');
    }
  },

  // Processing queue: one call per message, up to 15 minutes each, retried on failure.
  async queue(batch, env) {
    if (env.FAKE_AI === '1' && !env.AI) env = { ...env, AI: fakeAI };
    for (const msg of batch.messages) {
      try { await processCall(env, msg.body.id); msg.ack(); }
      catch (e) { console.log('queue job failed', e.message); msg.retry({ delaySeconds: 30 }); }
    }
  },

  async scheduled(event, env, ctx) {
    // Hourly: retry stuck calls. At 21:00 India time: daily report.
    ctx.waitUntil(retryStuck(env));
    const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: env.TIMEZONE || 'Asia/Kolkata', hour: '2-digit', hour12: false }).format(new Date(event.scheduledTime)));
    if (hour === Number(env.REPORT_HOUR || 21)) ctx.waitUntil(dailyReport(env, today(env, event.scheduledTime)));
  },
};
