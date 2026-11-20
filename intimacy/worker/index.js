// Intimacy for Couples — backend (Cloudflare Worker + Durable Objects + D1).
//
// What the server does:
//   * gives every phone a "Love Number" (8 digits) so partners connect by number
//   * pairs two numbers once both agree (request -> accept)
//   * relays live game messages and call signalling between the two phones (WebSocket rooms)
//   * hands out STUN/TURN servers for voice and video calls
// What it never does: store games, answers, chats or media. Rooms only pass messages through.

import SITE from './site.generated.js';

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
const bad = (msg, status = 400) => json({ error: msg }, status);

const NUM_RE = /^\d{8}$/;
const CODE_RE = /^[A-Z0-9]{6}$/;
const MAX_MSG = 512 * 1024; // room for two profile photos in a state sync

async function sha256(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function randomToken() {
  const a = new Uint8Array(24); crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function randomNumber() {
  const a = new Uint32Array(1); crypto.getRandomValues(a);
  return String(10000000 + (a[0] % 90000000));
}
const cleanName = (s) => String(s || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 30) || 'Partner';
const pairRoom = (a, b) => (a < b ? `pair:${a}-${b}` : `pair:${b}-${a}`);
const now = () => Date.now();

async function auth(env, n, t) {
  if (!NUM_RE.test(String(n || '')) || typeof t !== 'string' || t.length < 20) return null;
  const row = await env.DB.prepare('SELECT number, name, token_hash FROM users WHERE number = ?').bind(n).first();
  if (!row || row.token_hash !== (await sha256(t))) return null;
  return row;
}
async function body(req) { try { return await req.json(); } catch { return {}; } }
function roomStub(env, name) { return env.ROOMS.get(env.ROOMS.idFromName(name)); }
async function notify(env, number, msg) {
  const r = await roomStub(env, `inbox:${number}`).fetch('https://room/notify', { method: 'POST', body: JSON.stringify(msg) });
  return r.ok ? (await r.json()).delivered : 0;
}

async function api(req, env, url) {
  const path = url.pathname.slice(4); // strip /api
  if (path === '/health') return json({ ok: true });

  if (path === '/ice') {
    const ice = [{ urls: ['stun:stun.cloudflare.com:3478', 'stun:stun.l.google.com:19302'] }];
    // Any standard TURN provider with fixed credentials (e.g. a free ExpressTURN or Metered account):
    // set TURN_URL (comma-separated), TURN_USERNAME and TURN_CREDENTIAL as Worker secrets.
    if (env.TURN_URL && env.TURN_USERNAME && env.TURN_CREDENTIAL) {
      ice.push({ urls: env.TURN_URL.split(',').map((u) => u.trim()).filter(Boolean), username: env.TURN_USERNAME, credential: env.TURN_CREDENTIAL });
    }
    if (env.TURN_KEY_ID && env.TURN_KEY_API_TOKEN) {
      try {
        const r = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials/generate-ice-servers`, {
          method: 'POST', headers: { authorization: `Bearer ${env.TURN_KEY_API_TOKEN}`, 'content-type': 'application/json' }, body: JSON.stringify({ ttl: 86400 }),
        });
        if (r.ok) { const d = await r.json(); return json({ iceServers: d.iceServers || ice }); }
      } catch { /* fall back to STUN only */ }
    }
    return json({ iceServers: ice });
  }

  if (path === '/ws') {
    if (req.headers.get('upgrade') !== 'websocket') return bad('Expected WebSocket', 426);
    const room = url.searchParams.get('room') || '';
    const n = url.searchParams.get('n') || '';
    const t = url.searchParams.get('t') || '';
    let max = 2, who = '';
    if (room.startsWith('code:')) {
      if (!CODE_RE.test(room.slice(5))) return bad('Bad room code');
    } else if (room.startsWith('inbox:')) {
      const u = await auth(env, n, t);
      if (!u || room !== `inbox:${n}`) return bad('Not allowed', 403);
      max = 4; who = n;
    } else if (room.startsWith('pair:')) {
      const u = await auth(env, n, t);
      const m = room.match(/^pair:(\d{8})-(\d{8})$/);
      if (!u || !m || (n !== m[1] && n !== m[2])) return bad('Not allowed', 403);
      const p = await env.DB.prepare('SELECT 1 FROM pairs WHERE a = ? AND b = ?').bind(m[1], m[2]).first();
      if (!p) return bad('Not paired', 403);
      max = 4; who = n;
    } else return bad('Unknown room');
    const fwd = new URL('https://room/ws');
    fwd.searchParams.set('max', String(max));
    fwd.searchParams.set('who', who);
    return roomStub(env, room).fetch(new Request(fwd, req));
  }

  if (path === '/community' && req.method === 'GET') return communityList(env, url);

  if (req.method !== 'POST') return bad('Use POST', 405);
  const b = await body(req);

  if (path.startsWith('/admin/')) return admin(env, path, b);

  if (path === '/register') {
    const name = cleanName(b.name);
    const token = randomToken(), hash = await sha256(token);
    for (let i = 0; i < 6; i++) {
      const number = randomNumber();
      try {
        await env.DB.prepare('INSERT INTO users (number, name, token_hash, created) VALUES (?, ?, ?, ?)').bind(number, name, hash, now()).run();
        return json({ number, token });
      } catch { /* number taken, try another */ }
    }
    return bad('Try again', 503);
  }

  const me = await auth(env, b.n, b.t);
  if (!me) return bad('Not signed in', 401);

  if (path === '/name') {
    await env.DB.prepare('UPDATE users SET name = ? WHERE number = ?').bind(cleanName(b.name), me.number).run();
    return json({ ok: true });
  }

  if (path === '/ring') {
    const to = String(b.to || '').replace(/\D/g, '');
    if (!NUM_RE.test(to)) return bad('Enter your partner\'s 8-digit Love Number');
    if (to === me.number) return bad('That is your own number 😉');
    const target = await env.DB.prepare('SELECT number FROM users WHERE number = ?').bind(to).first();
    if (!target) return bad('No one has that Love Number yet. Ask your partner to open the app first.', 404);
    // Rate limits: 1 request per 20 s, 15 per hour per number.
    const recent = await env.DB.prepare('SELECT COUNT(*) AS c, MAX(created) AS last FROM requests WHERE from_n = ? AND created > ?').bind(me.number, now() - 36e5).first();
    if (recent && (recent.c >= 15 || (recent.last && now() - recent.last < 20000))) return bad('Slow down a little and try again soon', 429);
    const [a, bb] = me.number < to ? [me.number, to] : [to, me.number];
    const already = await env.DB.prepare('SELECT 1 FROM pairs WHERE a = ? AND b = ?').bind(a, bb).first();
    if (already) return json({ ok: true, paired: true, room: pairRoom(a, bb) });
    await env.DB.prepare('INSERT OR REPLACE INTO requests (from_n, to_n, created) VALUES (?, ?, ?)').bind(me.number, to, now()).run();
    const delivered = await notify(env, to, { t: 'ring', from: me.number, name: me.name });
    return json({ ok: true, delivered });
  }

  if (path === '/requests') {
    const { results } = await env.DB.prepare(
      'SELECT r.from_n AS "from", u.name FROM requests r JOIN users u ON u.number = r.from_n WHERE r.to_n = ? AND r.created > ? ORDER BY r.created DESC LIMIT 10',
    ).bind(me.number, now() - 7 * 864e5).all();
    return json({ requests: results || [] });
  }

  if (path === '/accept' || path === '/decline') {
    const from = String(b.from || '');
    if (!NUM_RE.test(from)) return bad('Bad request');
    const reqRow = await env.DB.prepare('SELECT 1 FROM requests WHERE from_n = ? AND to_n = ?').bind(from, me.number).first();
    if (!reqRow) return bad('That request has expired', 404);
    await env.DB.prepare('DELETE FROM requests WHERE from_n = ? AND to_n = ?').bind(from, me.number).run();
    if (path === '/decline') return json({ ok: true });
    const [a, bb] = me.number < from ? [me.number, from] : [from, me.number];
    await env.DB.prepare('INSERT OR IGNORE INTO pairs (a, b, created) VALUES (?, ?, ?)').bind(a, bb, now()).run();
    const fromUser = await env.DB.prepare('SELECT name FROM users WHERE number = ?').bind(from).first();
    await notify(env, from, { t: 'accepted', by: me.number, name: me.name });
    return json({ ok: true, room: pairRoom(a, bb), partner: { number: from, name: fromUser?.name || 'Partner' } });
  }

  if (path === '/unpair') {
    const p = String(b.partner || '');
    if (!NUM_RE.test(p)) return bad('Bad request');
    const [a, bb] = me.number < p ? [me.number, p] : [p, me.number];
    await env.DB.prepare('DELETE FROM pairs WHERE a = ? AND b = ?').bind(a, bb).run();
    return json({ ok: true });
  }

  if (path === '/community/post') return communityPost(env, me, b);
  if (path === '/community/like' || path === '/community/report') return communityVote(env, me, b, path.endsWith('like') ? 'like' : 'report');
  if (path === '/community/mine') {
    const { results } = await env.DB.prepare('SELECT id, topic, text, status, likes, created FROM stories WHERE n = ? ORDER BY created DESC LIMIT 20').bind(me.number).all();
    return json({ stories: results || [] });
  }

  if (path === '/delete-account') {
    await env.DB.batch([
      env.DB.prepare('DELETE FROM pairs WHERE a = ? OR b = ?').bind(me.number, me.number),
      env.DB.prepare('DELETE FROM requests WHERE from_n = ? OR to_n = ?').bind(me.number, me.number),
      env.DB.prepare('DELETE FROM stories WHERE n = ?').bind(me.number),
      env.DB.prepare('DELETE FROM story_likes WHERE n = ?').bind(me.number),
      env.DB.prepare('DELETE FROM users WHERE number = ?').bind(me.number),
    ]);
    return json({ ok: true });
  }

  return bad('Not found', 404);
}

// ---------- community ----------
const TOPICS = new Set(['first', 'wild', 'ldr', 'spark', 'toys', 'positions', 'talk', 'advice']);
// Keep the board about couples' own experiences: no contact details (solicitation), nothing involving minors.
const BLOCK_CONTACT = /(https?:\/\/|www\.|\.(com|in|net|org|me|ly)\b|@[a-z0-9_]{3,}|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|(\d[\s-]?){8,}|whats\s?app|telegram|snapchat|insta(gram)?|kik\b|onlyfans|escort)/i;
const BLOCK_MINOR = /\b(minor|under\s?age|underage|teen(ager)?s?|school\s?(girl|boy)|child|children|kid|kids|1[0-7]\s?(yo|y\/o|years?\s?old)|class\s?\d{1,2})\b/i;

async function communityList(env, url) {
  const sort = url.searchParams.get('sort') === 'new' ? 'new' : 'trending';
  const topic = url.searchParams.get('topic') || '';
  const t = now();
  const where = topic && TOPICS.has(topic) ? 'AND topic = ?' : '';
  const order = sort === 'new' ? 'created DESC' : `(likes + 1) * 1.0 / (((${t} - created) / 3600000.0 + 2) * ((${t} - created) / 3600000.0 + 2)) DESC`;
  const stmt = env.DB.prepare(`SELECT id, handle, topic, text, likes, created FROM stories WHERE status = 'live' ${where} ORDER BY ${order} LIMIT 50`);
  const { results } = await (where ? stmt.bind(topic) : stmt).all();
  const counts = await env.DB.prepare("SELECT topic, COUNT(*) AS c, SUM(likes) AS l FROM stories WHERE status = 'live' AND created > ? GROUP BY topic").bind(t - 7 * 864e5).all();
  return new Response(JSON.stringify({ stories: results || [], topics: counts.results || [] }), { headers: { ...JSON_HEADERS, 'cache-control': 'public, max-age=30' } });
}

async function communityPost(env, me, b) {
  const text = String(b.text || '').replace(/[\u0000-\u0008\u000b-\u001f]/g, '').trim();
  const handle = cleanName(b.handle).slice(0, 24);
  const topic = String(b.topic || '');
  if (!TOPICS.has(topic)) return bad('Pick a topic');
  if (text.length < 30) return bad('Tell us a little more (at least 30 characters)');
  if (text.length > 2000) return bad('Please keep it under 2000 characters');
  if (BLOCK_CONTACT.test(text) || BLOCK_CONTACT.test(handle)) return bad('No phone numbers, links, social handles or offers — this space is for sharing experiences only.');
  if (BLOCK_MINOR.test(text)) return bad('Posts must only involve consenting adults (18+).');
  const recent = await env.DB.prepare('SELECT COUNT(*) AS c FROM stories WHERE n = ? AND created > ?').bind(me.number, now() - 864e5).first();
  if (recent && recent.c >= 3) return bad('You can share up to 3 stories a day', 429);
  await env.DB.prepare("INSERT INTO stories (n, handle, topic, text, status, created) VALUES (?, ?, ?, ?, 'pending', ?)").bind(me.number, handle, topic, text, now()).run();
  return json({ ok: true, status: 'pending' });
}

async function communityVote(env, me, b, kind) {
  const id = Number(b.id);
  if (!Number.isInteger(id)) return bad('Bad request');
  const story = await env.DB.prepare("SELECT id, n FROM stories WHERE id = ? AND status = 'live'").bind(id).first();
  if (!story) return bad('Not found', 404);
  if (kind === 'like') {
    if (story.n === me.number) return bad('You cannot like your own story');
    const had = await env.DB.prepare('SELECT 1 FROM story_likes WHERE story_id = ? AND n = ?').bind(id, me.number).first();
    if (had) {
      await env.DB.batch([env.DB.prepare('DELETE FROM story_likes WHERE story_id = ? AND n = ?').bind(id, me.number), env.DB.prepare('UPDATE stories SET likes = MAX(0, likes - 1) WHERE id = ?').bind(id)]);
      return json({ ok: true, liked: false });
    }
    await env.DB.batch([env.DB.prepare('INSERT INTO story_likes (story_id, n) VALUES (?, ?)').bind(id, me.number), env.DB.prepare('UPDATE stories SET likes = likes + 1 WHERE id = ?').bind(id)]);
    return json({ ok: true, liked: true });
  }
  const r = await env.DB.prepare('INSERT OR IGNORE INTO story_reports (story_id, n) VALUES (?, ?)').bind(id, me.number).run();
  if (r.meta?.changes) {
    await env.DB.prepare('UPDATE stories SET reports = reports + 1 WHERE id = ?').bind(id).run();
    // Three reports take a story down until the admin reviews it again.
    await env.DB.prepare("UPDATE stories SET status = 'pending' WHERE id = ? AND reports >= 3").bind(id).run();
  }
  return json({ ok: true });
}

async function admin(env, path, b) {
  const key = String(b.key || '');
  if (!env.ADMIN_KEY || env.ADMIN_KEY.length < 16 || key.length !== env.ADMIN_KEY.length) return bad('Not allowed', 403);
  let diff = 0; for (let i = 0; i < key.length; i++) diff |= key.charCodeAt(i) ^ env.ADMIN_KEY.charCodeAt(i);
  if (diff) return bad('Not allowed', 403);
  if (path === '/admin/pending') {
    const { results } = await env.DB.prepare("SELECT id, handle, topic, text, reports, created FROM stories WHERE status = 'pending' ORDER BY reports DESC, created ASC LIMIT 100").all();
    const stats = await env.DB.prepare("SELECT (SELECT COUNT(*) FROM users) AS users, (SELECT COUNT(*) FROM pairs) AS couples, (SELECT COUNT(*) FROM stories WHERE status = 'live') AS live").first();
    return json({ stories: results || [], stats });
  }
  if (path === '/admin/moderate') {
    const id = Number(b.id);
    if (b.action === 'approve') await env.DB.prepare("UPDATE stories SET status = 'live', reports = 0 WHERE id = ?").bind(id).run();
    else if (b.action === 'reject') await env.DB.prepare("UPDATE stories SET status = 'rejected' WHERE id = ?").bind(id).run();
    else return bad('Unknown action');
    if (b.action === 'approve') await env.DB.prepare('DELETE FROM story_reports WHERE story_id = ?').bind(id).run();
    return json({ ok: true });
  }
  return bad('Not found', 404);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/api/')) {
      try { return await api(req, env, url); } catch (e) { return bad('Server error', 500); }
    }
    // The public address is intimacycouple.pages.dev (or your own domain): send visitors on the
    // raw workers.dev address there, so search engines see one site.
    if (env.SITE_URL && url.hostname.endsWith('.workers.dev')) return Response.redirect(env.SITE_URL + url.pathname + url.search, 301);
    return serveSite(req, url);
  },
};

// ---------- static website (bundled at build time) ----------
const SEC_HEADERS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(self), microphone=(self), geolocation=()',
};
const decoded = new Map();
function fileBody(path) {
  const f = SITE[path];
  if (!f.b64) return f.body;
  if (!decoded.has(path)) decoded.set(path, Uint8Array.from(atob(f.body), (c) => c.charCodeAt(0)));
  return decoded.get(path);
}
function serveSite(req, url) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
  let p = decodeURIComponent(url.pathname);
  if (p.endsWith('/')) p += 'index.html';
  else if (!SITE[p] && SITE[p + '/index.html']) return Response.redirect(url.origin + url.pathname + '/' + url.search, 301);
  if (p.endsWith('/index.html') && url.pathname.endsWith('/index.html')) return Response.redirect(url.origin + url.pathname.slice(0, -10) + url.search, 301);
  const f = SITE[p];
  if (!f) {
    return new Response(SITE['/404.html'].body, { status: 404, headers: { 'content-type': 'text/html; charset=utf-8', ...SEC_HEADERS } });
  }
  const html = f.type.startsWith('text/html');
  const headers = {
    'content-type': f.type,
    'cache-control': html || p.endsWith('sw.js') || p.endsWith('.js') || p.endsWith('.css') ? 'public, max-age=300, must-revalidate' : 'public, max-age=86400',
    ...SEC_HEADERS,
  };
  return new Response(req.method === 'HEAD' ? null : fileBody(p), { headers });
}

// A room relays every message from one socket to the others. Uses WebSocket hibernation,
// so idle couples cost almost nothing. Nothing is stored.
export class Room {
  constructor(state) { this.state = state; }

  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === '/notify') {
      const msg = await req.text();
      let delivered = 0;
      for (const ws of this.state.getWebSockets()) { try { ws.send(msg); delivered++; } catch { /* closed */ } }
      return new Response(JSON.stringify({ delivered }), { headers: JSON_HEADERS });
    }
    const max = Number(url.searchParams.get('max')) || 2;
    const sockets = this.state.getWebSockets();
    if (sockets.length >= max) return new Response('Room is full', { status: 409 });
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    const id = crypto.randomUUID().slice(0, 8);
    const who = url.searchParams.get('who') || '';
    this.state.acceptWebSocket(server, [id]);
    server.serializeAttachment({ id, who });
    server.send(JSON.stringify({ t: '_welcome', id, peers: sockets.map((s) => s.deserializeAttachment()) }));
    this.broadcast(server, JSON.stringify({ t: '_join', id, who }));
    return new Response(null, { status: 101, webSocket: client });
  }

  broadcast(from, msg) {
    for (const ws of this.state.getWebSockets()) {
      if (ws === from) continue;
      try { ws.send(msg); } catch { /* closed */ }
    }
  }

  webSocketMessage(ws, msg) {
    if (typeof msg !== 'string' || msg.length > MAX_MSG) return;
    if (msg === 'ping') { ws.send('pong'); return; }
    this.broadcast(ws, msg);
  }

  webSocketClose(ws) {
    const a = ws.deserializeAttachment() || {};
    this.broadcast(ws, JSON.stringify({ t: '_leave', id: a.id, who: a.who }));
    try { ws.close(); } catch { /* already closed */ }
  }

  webSocketError(ws) { this.webSocketClose(ws); }
}
