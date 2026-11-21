// SalePunch — sales call monitoring. Cloudflare Worker: API + dashboard.
import { hashPassword, readSession, requestToken, sessionCookie, signSession, verifyPassword } from './auth.js';
import { LEAD_STATUSES } from './constants.js';
import { mapIncomingLead } from './crm.js';
import { dailyReport, getSettings, processCall, retryStuck, today } from './pipeline.js';
import { productivity, salesLeaks } from './insights.js';
import { serveStatic } from './static.js';
import { teamStats } from './stats.js';
import { exotelDial, exotelReady, fetchRecording, parseExotelCallback } from './telephony.js';
import { parseTextTranscript } from './transcribe.js';
import { dayOf, fail, json, newId, normalizePhone, parseCsv, safeJson, sameSecret } from './util.js';

const MANAGERS = ['admin', 'manager'];
const isManager = (u) => MANAGERS.includes(u.role);
const publicUser = ({ pass_hash, ...u }) => u;
const SETTING_KEYS = ['company', 'product', 'script', 'crm_webhook_url', 'report_webhook_url', 'daily_call_target'];
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
  return json({ needsSetup: !n.n, telephony: exotelReady(env), ai: !!env.ANTHROPIC_API_KEY });
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

route('POST', '/api/logout', async () => json({ ok: true }, 200, { 'set-cookie': sessionCookie('', 0) }), { public: true });

route('GET', '/api/me', async (req, env, { user }) => {
  const s = await getSettings(env.DB);
  return json({ user, company: s.company || '', telephony: exotelReady(env), ai: !!env.ANTHROPIC_API_KEY, today: today(env) });
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
  if (!b.name || !b.email || String(b.password || '').length < 8) return fail(400, 'Name, email and an 8+ character password are needed');
  const role = ['admin', 'manager', 'agent'].includes(b.role) ? b.role : 'agent';
  try {
    await env.DB.prepare('INSERT INTO users (id, name, email, phone, role, pass_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(newId(), b.name.trim(), b.email.trim().toLowerCase(), normalizePhone(b.phone), role, await hashPassword(b.password), Date.now()).run();
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
  const q = url.searchParams.get('q');
  if (q) { where.push('(l.name LIKE ? OR l.phone LIKE ? OR l.email LIKE ?)'); vals.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  if (url.searchParams.get('due') === '1') { where.push("l.next_follow_up IS NOT NULL AND l.next_follow_up <= ? AND l.status NOT IN ('won','lost')"); vals.push(today(env)); }
  const sql = `SELECT l.*, u.name AS owner_name,
      (SELECT COUNT(*) FROM calls c WHERE c.lead_id = l.id) AS call_count,
      (SELECT MAX(started_at) FROM calls c WHERE c.lead_id = l.id) AS last_call_at
    FROM leads l LEFT JOIN users u ON u.id = l.owner_id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY l.updated_at DESC LIMIT 500`;
  const { results } = await env.DB.prepare(sql).bind(...vals).all();
  return json({ leads: results });
});

async function insertLead(env, l, ownerId) {
  const now = Date.now();
  const existing = await env.DB.prepare('SELECT id FROM leads WHERE phone = ?').bind(l.phone).first();
  if (existing) return { id: existing.id, duplicate: true };
  const id = newId();
  await env.DB.prepare('INSERT INTO leads (id, name, phone, email, source, status, owner_id, notes, external_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(id, l.name, l.phone, l.email || null, l.source || null, LEAD_STATUSES.includes(l.status) ? l.status : 'new', ownerId || null, l.notes || null, l.external_id || null, now, now).run();
  return { id };
}

route('POST', '/api/leads', async (req, env, { user }) => {
  const b = await body(req);
  const phone = normalizePhone(b.phone);
  if (!b.name || !phone) return fail(400, 'Name and phone are needed');
  const owner = isManager(user) ? b.owner_id || null : user.id;
  const r = await insertLead(env, { ...b, phone }, owner);
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
    const r = await insertLead(env, l, owner);
    r.duplicate ? skipped++ : added++;
  }
  return json({ added, skipped });
});

route('PATCH', '/api/leads/:id', async (req, env, { params, user }) => {
  const lead = await env.DB.prepare('SELECT * FROM leads WHERE id = ?').bind(params.id).first();
  if (!lead || (!isManager(user) && lead.owner_id !== user.id)) return fail(404, 'Lead not found');
  const b = await body(req);
  const sets = [], vals = [];
  for (const k of ['name', 'email', 'source', 'notes', 'next_follow_up']) if (b[k] !== undefined) { sets.push(`${k} = ?`); vals.push(b[k] || null); }
  if (b.phone !== undefined) { sets.push('phone = ?'); vals.push(normalizePhone(b.phone)); }
  if (LEAD_STATUSES.includes(b.status)) { sets.push('status = ?'); vals.push(b.status); }
  if (b.owner_id !== undefined && isManager(user)) { sets.push('owner_id = ?'); vals.push(b.owner_id || null); }
  if (!sets.length) return fail(400, 'Nothing to change');
  await env.DB.prepare(`UPDATE leads SET ${sets.join(', ')}, updated_at = ? WHERE id = ?`).bind(...vals, Date.now(), params.id).run();
  return json({ ok: true });
});

route('DELETE', '/api/leads/:id', async (req, env, { params }) => {
  await env.DB.prepare('UPDATE calls SET lead_id = NULL WHERE lead_id = ?').bind(params.id).run();
  await env.DB.prepare('DELETE FROM leads WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}, { manager: true });

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
  let key = null, audio;
  if (file && file.size) {
    if (env.RECORDINGS) {
      const ext = (file.name.split('.').pop() || 'mp3').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5);
      key = `calls/${day}/${id}.${ext}`;
      await env.RECORDINGS.put(key, file.stream(), { httpMetadata: { contentType: file.type || 'audio/mpeg' } });
    } else audio = new Uint8Array(await file.arrayBuffer()); // no storage: transcribe, don't keep
  }
  await env.DB.prepare("INSERT INTO calls (id, agent_id, lead_id, lead_phone, provider, status, started_at, duration_sec, recording_key, day) VALUES (?, ?, ?, ?, 'upload', 'completed', ?, ?, ?, ?)")
    .bind(id, agentId, leadId, phone || null, when, Math.max(0, Number(form.get('duration_sec')) || 0), key, day).run();
  ctx.waitUntil(processCall(env, id, (key || audio) ? { audio } : { textSegments: parseTextTranscript(text) }));
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
  if (c?.recording_key && env.RECORDINGS) {
    const obj = await env.RECORDINGS.get(c.recording_key);
    if (obj) return new Response(obj.body, { headers: { 'content-type': obj.httpMetadata?.contentType || 'audio/mpeg', 'cache-control': 'private, max-age=3600' } });
  }
  if (c?.recording_url) { // played straight from the telephony provider
    const rec = await fetchRecording(c.recording_url, env);
    return new Response(rec.bytes, { headers: { 'content-type': rec.type, 'cache-control': 'private, max-age=3600' } });
  }
  return fail(404, 'No recording stored');
});

route('POST', '/api/calls/:id/reprocess', async (req, env, { user, params, ctx }) => {
  const c = await visibleCall(env, user, params.id);
  if (!c) return fail(404, 'Call not found');
  // Keep a pasted transcript; recordings are transcribed again.
  if (c.recording_key || c.recording_url) await env.DB.prepare('UPDATE calls SET transcript = NULL WHERE id = ?').bind(c.id).run();
  await env.DB.prepare("UPDATE calls SET processing = 'pending', error = NULL WHERE id = ?").bind(c.id).run();
  ctx.waitUntil(processCall(env, c.id));
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
    telephony: exotelReady(env), ai: !!env.ANTHROPIC_API_KEY,
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
  if (done) ctx.waitUntil(processCall(env, call.id));
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
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/') && !url.pathname.startsWith('/hooks/')) {
      return env.ASSETS ? env.ASSETS.fetch(request) : serveStatic(url.pathname);
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

  async scheduled(event, env, ctx) {
    // Hourly: retry stuck calls. At 21:00 India time: daily report.
    ctx.waitUntil(retryStuck(env));
    const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: env.TIMEZONE || 'Asia/Kolkata', hour: '2-digit', hour12: false }).format(new Date(event.scheduledTime)));
    if (hour === Number(env.REPORT_HOUR || 21)) ctx.waitUntil(dailyReport(env, today(env, event.scheduledTime)));
  },
};
