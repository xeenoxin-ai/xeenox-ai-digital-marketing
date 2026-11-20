// Intimacy for Couples — single-page app.
// Same-phone play works offline. Long-distance play connects two phones through the
// backend (worker/index.js): game messages relay through a room, voice and video go
// phone-to-phone with WebRTC.
import * as C from './content.js';
import { poseSvg, poseKind } from './poses.js';

const KEY = 'ifc.v1';
const ROOM_PREFIX = 'intimacy4c-';
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const localDate = (d = new Date()) => d.toLocaleDateString('en-CA');
const uid = () => Math.random().toString(36).slice(2, 10);

// ---------- state ----------
function defaultShared() {
  return {
    players: { A: { name: 'You' }, B: { name: 'Partner' } },
    heat: 2, safeWord: 'Pineapple',
    points: { A: 0, B: 0 }, streak: { count: 0, last: '' },
    hidden: {}, desire: { A: {}, B: {} }, pos: {}, plan: [],
    meetup: { when: '', place: '', vibe: '', outfit: '', notes: '', bring: [] },
    future: [], bucket: {}, customBucket: [], game: null, paused: false, talk: {}, turnons: { A: [], B: [] }, requests: {}, fantasies: {}, fantasyReact: {}, program: null, tonight: null, diary: {},
  };
}
function defaultLocal() {
  return { setup: false, myName: '', pin: '', role: 'A', swiper: 'A', api: '', chat: [], unread: 0, me: null, partner: null, liked: {}, fantasyDraft: {}, fx: true };
}
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw) return { shared: { ...defaultShared(), ...raw.shared }, local: { ...defaultLocal(), ...raw.local } };
  } catch { /* fresh start */ }
  return { shared: defaultShared(), local: defaultLocal() };
}
const S = load();

const ui = { tab: 'home', game: null, usTab: 'profile', planTab: 'meetup', comm: { sort: 'trending', topic: '', data: null, mine: null, compose: false }, posFilter: 'all', place: 'home', idea: null, locked: !!S.local.pin, hidden: false };
let saveTimer;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* storage full or blocked */ } }, 120);
}

// ---------- shared-state sync ----------
const SYNC_KEYS = new Set(Object.keys(defaultShared()));
const BAD = new Set(['__proto__', 'prototype', 'constructor']);
function validPath(p) {
  return Array.isArray(p) && p.length > 0 && p.length < 6 && SYNC_KEYS.has(p[0])
    && p.every((k) => (typeof k === 'string' || typeof k === 'number') && !BAD.has(String(k)));
}
function applyPath(p, v) {
  let o = S.shared;
  for (let i = 0; i < p.length - 1; i++) {
    if (typeof o[p[i]] !== 'object' || o[p[i]] === null) o[p[i]] = {};
    o = o[p[i]];
  }
  const last = p[p.length - 1];
  if (v === undefined || v === null) { if (p.length === 1) o[last] = null; else delete o[last]; } else o[last] = v;
}
function set(p, v, opts = {}) {
  applyPath(p, v);
  save();
  send({ t: 'path', p, v: v ?? null });
  if (!opts.quiet) render();
}

// ---------- helpers ----------
const nm = (r) => esc(S.shared.players[r]?.name || (r === 'A' ? 'Player 1' : 'Player 2'));
const other = (r) => (r === 'A' ? 'B' : 'A');
const online = () => !!ws && net.peers > 0;
const me = () => (online() ? S.local.role : S.local.swiper);
const canAct = (r) => !online() || r === S.local.role;
const heatInfo = (h) => C.HEAT[h - 1] || C.HEAT[1];
const MOODS = ['😈 In the mood', '🔥 Thinking of you', '🫦 Tease me', '🥰 Cuddly', '💭 Missing you', '😴 Tired tonight'];
const num = (x) => (Number.isFinite(Number(x)) ? Number(x) : 0);
// Values from the partner's phone are data: coerce anything rendered as a number.
function sanitize() {
  const sh = S.shared;
  sh.heat = Math.min(5, Math.max(1, Math.round(num(sh.heat)) || 2));
  sh.points = { A: num(sh.points?.A), B: num(sh.points?.B) };
  sh.streak = { count: num(sh.streak?.count), last: String(sh.streak?.last || '') };
  for (const k of ['desire', 'pos', 'hidden', 'bucket', 'meetup', 'players', 'talk', 'turnons', 'requests', 'fantasies', 'fantasyReact', 'diary']) if (typeof sh[k] !== 'object' || sh[k] === null) sh[k] = defaultShared()[k];
  for (const k of ['plan', 'future', 'customBucket']) if (!Array.isArray(sh[k])) sh[k] = [];
  if (!Array.isArray(sh.meetup.bring)) sh.meetup.bring = [];
  if (sh.tonight && !(typeof sh.tonight === 'object' && (sh.tonight.from === 'A' || sh.tonight.from === 'B'))) sh.tonight = null;
  if (sh.tonight && sh.tonight.reply && !['yes', 'later', 'no'].includes(sh.tonight.reply)) sh.tonight.reply = null;
  if (sh.program && !(typeof sh.program === 'object' && C.PROGRAMS.some((x) => x.id === sh.program.id))) sh.program = null;
  if (sh.program && (typeof sh.program.done !== 'object' || !sh.program.done)) sh.program.done = {};
  for (const r of ['A', 'B']) {
    const f = sh.fantasies[r];
    if (f === undefined) continue;
    if (!f || typeof f !== 'object') { delete sh.fantasies[r]; continue; }
    const picks = {};
    for (const c of C.FANTASY_LAB) { const v = f.picks?.[c.id]; if (Array.isArray(v)) picks[c.id] = v.filter((x) => typeof x === 'string' && x.length <= 60).slice(0, 14); }
    sh.fantasies[r] = { picks, text: typeof f.text === 'string' ? f.text.slice(0, 1500) : '', ts: num(f.ts) };
    if (sh.fantasyReact[r] !== undefined && !['yes', 'talk', 'someday'].includes(sh.fantasyReact[r])) delete sh.fantasyReact[r];
  }
  for (const r of ['A', 'B']) {
    const t = sh.turnons[r];
    sh.turnons[r] = Array.isArray(t) ? t.filter((x) => typeof x === 'string' && x.length <= 40).slice(0, 30) : [];
    const q = sh.requests[r];
    if (q !== undefined && !(q && typeof q === 'object' && typeof q.text === 'string' && q.text.length <= 120)) delete sh.requests[r];
  }
  for (const r of ['A', 'B']) {
    if (!sh.players[r] || typeof sh.players[r] !== 'object') sh.players[r] = { name: r === 'A' ? 'Player 1' : 'Player 2' };
    const pl = sh.players[r];
    if (pl.photo !== undefined && !(typeof pl.photo === 'string' && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(pl.photo) && pl.photo.length < 120000)) delete pl.photo;
    if (pl.mood !== undefined && !MOODS.includes(pl.mood)) delete pl.mood;
    if (pl.g !== undefined && !['m', 'f', 'x'].includes(pl.g)) delete pl.g;
  }
}

function bumpStreak() {
  const t = localDate();
  const st = S.shared.streak || { count: 0, last: '' };
  if (st.last === t) return;
  const y = localDate(new Date(Date.now() - 864e5));
  set(['streak'], { count: st.last === y ? st.count + 1 : 1, last: t }, { quiet: true });
}
function addPoints(r, n) { set(['points', r], (S.shared.points[r] || 0) + n, { quiet: true }); bumpStreak(); }

const recent = [];
function draw(pool, prefix, filter) {
  const heat = S.shared.heat;
  const items = pool.map((c, i) => ({ id: prefix + i, heat: c[0], c }))
    .filter((x) => x.heat <= heat && !S.shared.hidden[x.id] && (!filter || filter(x.c)));
  if (!items.length) return null;
  const top = items.filter((x) => x.heat === heat);
  const from = top.length && Math.random() < 0.7 ? top : items;
  const fresh = from.filter((x) => !recent.includes(x.id));
  const x = rnd(fresh.length ? fresh : from);
  recent.push(x.id); if (recent.length > 20) recent.shift();
  return { id: x.id, heat: x.heat, text: x.c[x.c.length - 1], place: x.c.length > 2 ? x.c[1] : undefined };
}

function toast(msg, ms = 2600) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), ms);
}
function floatEmoji(e) {
  for (let i = 0; i < 8; i++) {
    const s = document.createElement('span');
    s.className = 'float'; s.textContent = e;
    s.style.left = 10 + Math.random() * 80 + 'vw';
    s.style.animationDelay = i * 0.12 + 's';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 3200);
  }
}
function modal(html) {
  const m = $('#modal'), still = !m.hidden;
  m.innerHTML = `<div class="sheet${still ? ' still' : ''}">${html}</div>`;
  m.hidden = false;
}
function closeModal() { $('#modal').hidden = true; $('#modal').innerHTML = ''; }

function countdown(when) {
  if (!when) return '';
  const ms = new Date(when).getTime() - Date.now();
  if (isNaN(ms)) return '';
  if (ms <= 0) return 'It\'s time 💞';
  const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
  return `${d ? d + 'd ' : ''}${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

// ---------- networking (own backend: WebSocket rooms + WebRTC calls) ----------
// Two ways to connect:
//   * Love Number: each phone gets an 8-digit number. Enter your partner's number once,
//     they accept, and from then on both phones reconnect automatically.
//   * Quick room code: 6 letters, no sign-up, for a one-off session.
const API = (new URLSearchParams(location.search).get('api') || S.local.api || '').replace(/\/$/, '') || location.origin;
const WS_BASE = API.replace(/^http/, 'ws');
let ws = null, inbox = null;
const net = { status: 'offline', code: '', host: false, room: '', peers: 0 };

async function post(path, data) {
  const r = await fetch(API + '/api' + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Network problem — try again');
  return d;
}
const authBody = (x = {}) => ({ n: S.local.me?.number, t: S.local.me?.token, ...x });
const fmtNum = (n) => String(n || '').replace(/(\d{4})(\d{4})/, '$1 $2');

async function ensureNumber() {
  if (S.local.me?.number) return S.local.me;
  const d = await post('/register', { name: S.local.myName || S.shared.players.A.name });
  S.local.me = { number: d.number, token: d.token }; save();
  return S.local.me;
}

// A self-healing WebSocket to one room.
function openSocket(room, handlers) {
  let sock = null, closed = false, tries = 0, pingT;
  const q = new URLSearchParams({ room });
  if (S.local.me?.number && !room.startsWith('code:')) { q.set('n', S.local.me.number); q.set('t', S.local.me.token); }
  const connect = () => {
    sock = new WebSocket(`${WS_BASE}/api/ws?${q}`);
    sock.onopen = () => { tries = 0; clearInterval(pingT); pingT = setInterval(() => { try { sock.send('ping'); } catch { /* */ } }, 25000); handlers.open?.(); };
    sock.onmessage = (e) => { if (e.data === 'pong') return; try { handlers.message(JSON.parse(e.data)); } catch { /* ignore junk */ } };
    sock.onclose = (e) => {
      clearInterval(pingT); handlers.close?.(e);
      if (closed) return;
      if (e.code === 1006 && tries > 6) { handlers.fail?.(); return; }
      setTimeout(connect, Math.min(15000, 800 * 2 ** tries++));
    };
  };
  connect();
  return {
    send: (m) => { if (sock?.readyState === 1) sock.send(JSON.stringify(m)); },
    close: () => { closed = true; clearInterval(pingT); try { sock?.close(); } catch { /* */ } },
  };
}

function teardown() {
  endCall(false);
  ws?.close(); ws = null;
  Object.assign(net, { status: 'offline', code: '', host: false, room: '', peers: 0 });
}
function joinRelay(room, host) {
  teardown();
  Object.assign(net, { room, host, status: 'joining', peers: 0 });
  S.local.role = host ? 'A' : 'B';
  render();
  ws = openSocket(room, {
    open: () => { if (!net.peers) net.status = 'waiting'; render(); },
    message: onRelay,
    close: () => { if (net.peers) { net.peers = 0; toast('Connection lost — reconnecting…'); } net.status = 'joining'; render(); },
    fail: () => { toast('Can\'t reach the server. Check your internet.'); net.status = 'offline'; render(); },
  });
}
function onRelay(m) {
  switch (m.t) {
    case '_welcome':
      net.status = 'waiting'; net.peers = m.peers.length;
      if (net.peers) partnerArrived();
      render(); return;
    case '_join': net.peers++; partnerArrived(); return;
    case '_leave':
      net.peers = Math.max(0, net.peers - 1);
      if (!net.peers) { endCall(false); net.status = 'waiting'; toast('Partner went offline'); render(); }
      return;
    default: onData(m);
  }
}
function partnerArrived() {
  net.status = 'connected';
  if (!net.host) send({ t: 'hello', name: S.local.myName || S.shared.players.A.name, g: S.local.myG });
  toast('Partner connected 💞'); render();
}

function createRoom() {
  net.code = newCode();
  joinRelay('code:' + net.code, true);
  net.code = net.room.slice(5);
}
function joinRoom(code) {
  code = String(code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== 6) return toast('Enter the 6-character room code');
  joinRelay('code:' + code, false);
  net.code = code;
}
function newCode() {
  const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => rnd(A)).join('');
}

// Love Number pairing
function pairRoomName(a, b) { return a < b ? `pair:${a}-${b}` : `pair:${b}-${a}`; }
function connectPartner() {
  const me = S.local.me, p = S.local.partner;
  if (!me?.number || !p?.number) return;
  joinRelay(pairRoomName(me.number, p.number), me.number < p.number);
}
function openInbox() {
  if (inbox || !S.local.me?.number) return;
  inbox = openSocket('inbox:' + S.local.me.number, {
    message: (m) => {
      if (m.t === 'ring') showRing(m.from, m.name);
      if (m.t === 'accepted') paired(m.by, m.name);
    },
  });
  post('/requests', authBody()).then((d) => { const r = d.requests?.[0]; if (r && !S.local.partner) showRing(r.from, r.name); }).catch(() => {});
}
function showRing(from, name) {
  modal(`<div class="center"><div class="logo-big">💌</div><h3>${esc(name)} wants to connect</h3>
    <p class="muted">Love Number ${esc(fmtNum(from))}. Accept only if this is your partner.</p>
    <div class="row center"><button class="btn ghost" data-a="ringNo" data-from="${esc(from)}">Decline</button><button class="btn" data-a="ringYes" data-from="${esc(from)}">Accept 💞</button></div></div>`);
}
function paired(number, name) {
  S.local.partner = { number: String(number), name: String(name || 'Partner').slice(0, 30) }; save();
  closeModal(); toast(`💞 Paired with ${S.local.partner.name}`);
  connectPartner();
}
async function ringPartner(to) {
  try {
    await ensureNumber(); openInbox();
    const d = await post('/ring', authBody({ to: String(to).replace(/\D/g, '') }));
    if (d.paired) { paired(String(to).replace(/\D/g, ''), S.shared.players.B.name); return; }
    toast(d.delivered ? 'Request sent — waiting for your partner to accept 💌' : 'Request sent. Your partner will see it when they open the app.', 4000);
    ui.ringing = true; render();
  } catch (e) { toast(e.message, 4000); }
}

function send(msg) { if (online()) ws.send(msg); }

function onData(m) {
  if (!m || typeof m !== 'object') return;
  switch (m.t) {
    case 'hello':
      if (!net.host) return;
      S.local.role = 'A';
      S.shared.players.B = { ...(S.shared.players.B || {}), name: String(m.name || 'Partner').slice(0, 30), ...(['m', 'f', 'x'].includes(m.g) ? { g: m.g } : {}) };
      if (S.local.myName) S.shared.players.A = { ...(S.shared.players.A || {}), name: S.local.myName, ...(S.local.myG ? { g: S.local.myG } : {}) };
      save(); send({ t: 'state', shared: S.shared }); render();
      break;
    case 'state':
      if (net.host || !m.shared || typeof m.shared !== 'object') return;
      S.shared = { ...defaultShared(), ...JSON.parse(JSON.stringify(m.shared)) };
      for (const k of Object.keys(S.shared)) if (!SYNC_KEYS.has(k)) delete S.shared[k];
      sanitize(); S.local.role = 'B'; save(); render();
      break;
    case 'path': {
      if (!validPath(m.p)) return;
      const prevKind = S.shared.game?.kind;
      applyPath(m.p, m.v); sanitize(); save();
      if (m.p[0] === 'game' && m.p.length === 1 && m.v?.kind && m.v.kind !== prevKind) {
        ui.tab = 'games'; ui.game = m.v.kind; toast(`${nm(other(S.local.role))} opened ${gameName(m.v.kind)}`);
      }
      if (m.p[0] === 'paused') renderPause();
      if (m.p[0] === 'tonight' && m.p.length === 1 && m.v?.from) { toast(`🔥 ${nm(m.v.from)} wants you tonight…`, 5000); floatEmoji('🔥'); }
      if (m.p[0] === 'tonight' && m.p[1] === 'reply' && m.v) toast({ yes: '😏 They said YES to tonight!', later: '⏰ Later…', no: '😴 Not tonight' }[m.v] || '', 5000);
      if (m.p[0] === 'requests' && m.p.length === 2 && m.v?.text) toast(`💌 ${nm(m.p[1])} sent you a wish: ${String(m.v.text).slice(0, 60)}`, 5000);
      if (m.p[0] === 'requests' && m.p[2] === 'reply' && m.v) toast(m.v === 'yes' ? `😘 ${nm(other(m.p[1]))} said YES to your wish!` : `🙈 ${nm(other(m.p[1]))} said maybe…`, 5000);
      softRender();
      break;
    }
    case 'chat': {
      const text = String(m.text || '').slice(0, 1000);
      S.local.chat.push({ from: other(S.local.role), text, ts: Date.now() });
      S.local.chat = S.local.chat.slice(-200);
      if (!(ui.tab === 'us' && ui.usTab === 'connect')) { S.local.unread++; toast(`💬 ${nm(other(S.local.role))}: ${text.slice(0, 60)}`); }
      save(); softRender();
      break;
    }
    case 'react': if (typeof m.e === 'string' && m.e.length <= 8) floatEmoji(m.e); break;
    case 'photo': {
      if (typeof m.data !== 'string' || !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(m.data) || m.data.length > 500000) return;
      const id = String(m.id || uid()).slice(0, 20);
      photoInbox.push({ id, data: m.data, dare: String(m.dare || '').slice(0, 200), once: !!m.once });
      toast(`📸 ${nm(other(S.local.role))} sent you a photo — open it on Home`, 5000); floatEmoji('📸'); softRender();
      break;
    }
    case 'photoSeen': case 'photoReact': {
      const x = photoSent.find((p) => p.id === m.id); if (!x) return;
      if (m.t === 'photoSeen') x.seen = true; else if (typeof m.e === 'string' && m.e.length <= 8) { x.react = m.e; x.seen = true; toast(`${m.e} ${nm(other(S.local.role))} reacted to your photo`); floatEmoji(m.e); }
      softRender();
      break;
    }
    case 'call': case 'call-ok': case 'rtc': case 'decline': case 'busy': case 'hangup': onCallMsg(m); break;
  }
}
// Do not wipe what someone is typing when the partner's update arrives.
let pendingRender = false;
function softRender() {
  const a = document.activeElement;
  if (a && $('#view').contains(a) && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) { pendingRender = true; return; }
  render();
}
document.addEventListener('focusout', () => setTimeout(() => { if (pendingRender) { pendingRender = false; softRender(); } }, 50));

// ---------- voice & video calls (WebRTC, signalled through the room) ----------
let call = null, localStream = null, callStart = 0, callTimer = null, pendingCall = null, iceCache = null, ringTimer = null;
async function iceServers() {
  if (iceCache) return iceCache;
  try { const r = await fetch(API + '/api/ice'); iceCache = (await r.json()).iceServers; } catch { iceCache = [{ urls: 'stun:stun.l.google.com:19302' }]; }
  return iceCache;
}
async function getMedia(video) {
  if (!navigator.mediaDevices?.getUserMedia) { toast('Calls need HTTPS and a modern browser'); return null; }
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
      video: video ? { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } : false,
    });
  } catch { toast('Allow microphone' + (video ? ' and camera' : '') + ' access to call'); return null; }
}
async function startCall(video) {
  if (!online()) { toast('Connect with your partner first'); ui.tab = 'connect'; render(); return; }
  if (call) return;
  localStream = await getMedia(video);
  if (!localStream) return;
  call = { video, caller: true, pc: null, queue: [] };
  showCallUI('Calling…');
  send({ t: 'call', video });
  ringTimer = setTimeout(() => { if (call && !callStart) { toast('No answer'); endCall(true); } }, 45000);
}
function onCallMsg(m) {
  if (m.t === 'call') {
    if (call || pendingCall) { send({ t: 'busy' }); return; }
    pendingCall = { video: !!m.video };
    modal(`<div class="center"><div class="logo-big">${m.video ? '📹' : '📞'}</div><h3>${nm(other(S.local.role))} is calling…</h3><p class="muted">${m.video ? 'Video' : 'Voice'} call</p>
      <div class="row center"><button class="btn ghost" data-a="declineCall">Decline</button><button class="btn" data-a="acceptCall">Answer</button></div></div>`);
    return;
  }
  if (m.t === 'call-ok' && call?.caller) { makeOffer(); return; }
  if (m.t === 'rtc' && call) { onRtc(m); return; }
  if (m.t === 'decline') { toast('Call declined'); endCall(false); }
  if (m.t === 'busy') { toast('Your partner is busy'); endCall(false); }
  if (m.t === 'hangup') { if (pendingCall) { pendingCall = null; closeModal(); } endCall(false); }
}
async function acceptCall() {
  const p = pendingCall; pendingCall = null; closeModal();
  if (!p) return;
  localStream = await getMedia(p.video);
  if (!localStream) { send({ t: 'decline' }); return; }
  call = { video: p.video, caller: false, pc: null, queue: [] };
  showCallUI('Connecting…');
  await makePc();
  send({ t: 'call-ok' });
}
async function makePc() {
  const pc = new RTCPeerConnection({ iceServers: await iceServers() });
  call.pc = pc;
  localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));
  pc.onicecandidate = (e) => { if (e.candidate) send({ t: 'rtc', ice: e.candidate.toJSON() }); };
  pc.ontrack = (e) => {
    const v = $('#remote-video');
    if (v.srcObject !== e.streams[0]) { v.srcObject = e.streams[0]; v.play?.().catch(() => {}); }
    if (!callStart) {
      callStart = Date.now(); clearTimeout(ringTimer);
      callTimer = setInterval(() => { $('#call-status').textContent = '● ' + fmtDur(Date.now() - callStart); }, 1000);
    }
  };
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'failed') { toast('Call could not connect on this network'); endCall(true); }
  };
  return pc;
}
async function makeOffer() {
  const pc = await makePc();
  await pc.setLocalDescription(await pc.createOffer());
  send({ t: 'rtc', sdp: pc.localDescription.toJSON() });
}
async function onRtc(m) {
  const pc = call.pc;
  if (!pc) return;
  try {
    if (m.sdp) {
      await pc.setRemoteDescription(m.sdp);
      if (m.sdp.type === 'offer') { await pc.setLocalDescription(await pc.createAnswer()); send({ t: 'rtc', sdp: pc.localDescription.toJSON() }); }
      for (const c of call.queue.splice(0)) await pc.addIceCandidate(c).catch(() => {});
    } else if (m.ice) {
      if (pc.remoteDescription) await pc.addIceCandidate(m.ice).catch(() => {}); else call.queue.push(m.ice);
    }
  } catch { /* bad signalling message */ }
}
function showCallUI(status) {
  const box = $('#call');
  box.hidden = false; box.className = call.video ? 'video' : 'voice';
  $('#local-video').srcObject = call.video ? localStream : null;
  $('#call-name').textContent = S.shared.players[other(S.local.role)]?.name || 'Partner';
  $('#call-status').textContent = status;
  updateCallButtons();
}
const fmtDur = (ms) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
function endCall(notify = true) {
  if (notify && call) send({ t: 'hangup' });
  try { call?.pc?.close(); } catch { /* */ }
  localStream?.getTracks().forEach((t) => t.stop());
  call = null; localStream = null; callStart = 0; clearInterval(callTimer); clearTimeout(ringTimer);
  const box = $('#call'); if (box) { box.hidden = true; $('#remote-video').srcObject = null; $('#local-video').srcObject = null; box.classList.remove('mini'); }
}
function toggleTrack(kind) {
  const tr = localStream?.getTracks().filter((t) => t.kind === kind);
  if (!tr?.length) return;
  tr.forEach((t) => (t.enabled = !t.enabled));
  updateCallButtons();
}
function updateCallButtons() {
  const a = localStream?.getAudioTracks()[0], v = localStream?.getVideoTracks()[0];
  $('#btn-mute').textContent = a && !a.enabled ? '🔇' : '🎙️';
  $('#btn-cam').textContent = v && !v.enabled ? '🚫' : '📷';
  $('#btn-cam').hidden = !v;
}

// ---------- games ----------
const GAMES = [
  { id: 'tod', name: 'Truth or Dare', icon: '🎭', desc: 'The classic, with 5 heat levels up to X-Rated' },
  { id: 'talk', name: 'Hot Chat', icon: '🔥', desc: 'Sexy messages — every 🔥 from your partner raises your Hot Score' },
  { id: 'desire', name: 'Desire Match', icon: '💞', desc: 'Swipe privately — only mutual yeses show' },
  { id: 'dice', name: 'Sexy Dice', icon: '🎲', desc: 'Roll an action, a spot and a time' },
  { id: 'dates', name: 'Naughty Date Dares', icon: '🌙', desc: 'Missions for home, out, or long distance' },
  { id: 'never', name: 'Never Have I Ever', icon: '🙈', desc: 'Confess together, reveal together' },
  { id: 'rather', name: 'Would You Rather', icon: '⚖️', desc: 'Pick in secret — match for points' },
  { id: 'hotseat', name: 'Hot Seat', icon: '⏱️', desc: '60 seconds of rapid-fire questions' },
  { id: 'fantasy', name: 'Fantasy Builder', icon: '✨', desc: 'Build tonight\'s scenario together' },
  { id: 'learn', name: 'Sex Guides', icon: '📖', desc: 'What men & women love, toys, pleasing your partner' },
  { id: 'tips', name: 'Sex Tips', icon: '📚', desc: 'Better intimacy, health & long distance' },
  { id: 'community', name: 'Community', icon: '💬', desc: 'Real couples share hot experiences' },
  { id: 'stories', name: 'Hot Stories', icon: '📖', desc: 'First times, proposals, steamy nights' },
  { id: 'roulette', name: 'Sex Roulette', icon: '🎰', desc: 'Spin a position, a spot, a speed and a time' },
  { id: 'marathon', name: 'Position Marathon', icon: '⏱️', desc: 'A new position every few minutes — follow the timer' },
  { id: 'roleplay', name: 'Role-play Scripts', icon: '🎭', desc: '8 ready scenes with lines for both of you' },
  { id: 'diary', name: 'Sex Diary', icon: '📓', desc: 'Log your nights — see your stats' },
  { id: 'photo', name: 'Spicy Photo Dares', icon: '📸', desc: 'Dare each other to send a teasing photo' },
  { id: 'challenge', name: 'Hot Challenges', icon: '🏆', desc: 'Timed challenges & the 7-Day Heat Challenge' },
];
const gameName = (id) => GAMES.find((g) => g.id === id)?.name || 'a game';
const PLAY_SECTIONS = [
  ['In the bedroom', ['roulette', 'marathon', 'roleplay', 'diary']],
  ['Games for two', ['tod', 'challenge', 'photo', 'never', 'rather', 'hotseat', 'dice']],
  ['Talk & tease', ['talk', 'desire', 'fantasy', 'dates']],
  ['Stories & learn', ['stories', 'community', 'learn', 'tips']],
];

function openGame(id) {
  if (id === 'community') { ui.tab = 'community'; ui.comm.data = null; return render(); }
  if (id === 'lab') { ui.tab = 'fantasy'; return render(); }
  ui.tab = 'games'; ui.game = id;
  if (['desire', 'talk', 'tips', 'learn', 'stories', 'roleplay', 'diary'].includes(id)) { ui.guide = null; ui.story = null; return render(); }
  const g = S.shared.game?.kind === id ? S.shared.game : { kind: id, turn: 'A', card: null };
  if (S.shared.game?.kind !== id) set(['game'], g); else render();
}
const G = () => S.shared.game || {};
function setGame(patch) { set(['game'], { ...G(), ...patch }); }

function nextTurn() { setGame({ turn: other(G().turn || 'A'), card: null, ans: {}, roll: null, answer: null, loved: false, done: false }); }

function todDraw(type) {
  const kind = type === 'random' ? (Math.random() < 0.5 ? 'truth' : 'dare') : type;
  const card = kind === 'truth' ? draw(C.TRUTHS, 'T') : draw(C.DARES, 'D');
  if (!card) return toast('No cards left at this heat — raise the heat or reset hidden cards');
  setGame({ card: { ...card, type: kind } });
}

// ---------- rendering ----------
function render() {
  document.body.dataset.heat = S.shared.heat;
  const view = $('#view');
  $('#heat-chip').innerHTML = `${heatInfo(S.shared.heat).icon} ${heatInfo(S.shared.heat).name}`;
  $('#net-dot').className = 'dot ' + (online() ? 'on' : net.status === 'waiting' || net.status === 'joining' || net.status === 'starting' ? 'wait' : '');
  $('#net-dot').title = online() ? 'Partner connected' : net.status;
  const tabs = $('#tabs');
  if (!S.local.setup) { tabs.hidden = true; view.innerHTML = setupView(); return; }
  tabs.hidden = false;
  if (ui.tab === 'connect') { ui.tab = 'us'; ui.usTab = 'connect'; }
  if (ui.tab === 'plans') { ui.tab = 'us'; ui.usTab = ui.planTab; }
  tabs.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('active', b.dataset.tab === (ui.tab === 'community' ? 'home' : ui.tab)));
  const badge = tabs.querySelector('[data-tab="us"] .badge');
  if (ui.tab === 'us' && ui.usTab === 'connect') S.local.unread = 0;
  badge.textContent = S.local.unread || ''; badge.hidden = !S.local.unread;
  if (ui.tab === 'community' && !ui.comm.data && !ui.comm.loading) loadCommunity();
  const v = { home: homeView, games: gamesView, positions: positionsView, fantasy: labView, community: communityView, us: usView }[ui.tab] || homeView;
  view.innerHTML = v();
  $('#pause-btn').hidden = ui.tab !== 'games' || !ui.game || ['learn', 'tips', 'stories'].includes(ui.game);
  renderPause();
  ambience();
  const pd = $('#modal .pos-detail'); if (pd && !$('#modal').hidden) $('#modal .sheet').innerHTML = posDetail(pd.dataset.pos);
  tick();
}

const G_LABEL = { m: '👨 Man', f: '👩 Woman', x: '✨ Other' };
const genderRadios = (name, cur) => `<span class="gseg">${['m', 'f', 'x'].map((g) => `<label><input type="radio" name="${name}" value="${g}" ${cur === g ? 'checked' : ''}><span>${G_LABEL[g]}</span></label>`).join('')}</span>`;
const gOf = (r) => S.shared.players[r]?.g;
const pron = (r) => (gOf(r) === 'f' ? 'her' : gOf(r) === 'm' ? 'him' : 'them');

function setupView() {
  return `<section class="setup">
    <div class="hero"><div class="logo-big">💗</div><h1>Intimacy <span>for Couples</span></h1>
    <p class="muted">The game that brings you closer — truth or dare, desire match, positions, date plans and live video, for two.</p></div>
    <form class="card" data-form="setup">
      <label>Your name<input name="me" maxlength="30" required placeholder="e.g. Arjun" value="${esc(S.local.myName)}"></label>
      <label>Your partner's name<input name="partner" maxlength="30" required placeholder="e.g. Meera"></label>
      <div class="gpick"><div><small>I am</small>${genderRadios('meG', S.local.myG || 'm')}</div><div><small>My partner is</small>${genderRadios('ptG', S.local.myG === 'f' ? 'm' : 'f')}</div></div>
      <label>Starting heat</label>
      <div class="heat-pick">${C.HEAT.map((h) => `<label class="heat-opt"><input type="radio" name="heat" value="${h.level}" ${h.level === 2 ? 'checked' : ''}><span>${h.icon}<b>${h.name}</b><small>${h.hint}</small></span></label>`).join('')}</div>
      <label>Safe word <small class="muted">— say it or tap 🛑 and everything pauses</small><input name="safe" maxlength="20" value="Pineapple"></label>
      <label class="check"><input type="checkbox" name="adult" required> We are both 18+ and everything here is by mutual consent.</label>
      <button class="btn big">Start playing 💞</button>
    </form>
    <p class="muted small center">Private by design: no account, no server storage. Your data stays on your phone; live play goes directly phone-to-phone.</p>
  </section>`;
}

function tonightBlock() {
  const t = S.shared.tonight, mine = me();
  const fresh = t && Date.now() - num(t.ts) < 18 * 36e5;
  if (fresh && t.from !== mine) {
    return `<div class="tonight-in"><b>🔥 ${nm(t.from)} wants you tonight</b>${t.reply ? `<small>You said: ${{ yes: '😏 Yes', later: '⏰ Later', no: '😴 Not tonight' }[t.reply]}</small>`
      : canAct(mine) ? `<div class="row center"><button class="btn sm" data-a="tonightReply" data-v="yes">😏 Yes</button><button class="btn sm ghost" data-a="tonightReply" data-v="later">⏰ Later</button><button class="btn sm ghost" data-a="tonightReply" data-v="no">😴 Not tonight</button></div>` : ''}</div>`;
  }
  if (fresh && t.from === mine) return `<div class="tonight-in"><small>You asked "Tonight?" — ${t.reply ? { yes: '😏 they said YES', later: '⏰ later', no: '😴 not tonight' }[t.reply] : 'waiting…'}</small></div>`;
  return `<button class="tonight-btn" data-a="tonightAsk">🔥 Tonight?</button>`;
}

function heroCard() {
  const mine = me(), partner = other(mine), pm = S.shared.players[partner]?.mood;
  return `<div class="hero-card">
    <div class="hero-top"><span class="live-chip ${online() ? 'on' : ''}">${online() ? '● Live' : '○ Offline'}</span><button class="icon-pill" data-a="us" data-sub="profile">Edit</button></div>
    <div class="pair" data-a="us" data-sub="profile">${avatar('A', 'av-lg')}<span class="heart-badge">❤</span>${avatar('B', 'av-lg')}</div>
    <div class="names">${nm('A')} <span>&</span> ${nm('B')}</div>
    ${pm ? `<div class="mood-pill">${nm(partner)} is <b>${esc(pm)}</b></div>` : ''}
    ${tonightBlock()}
    <div class="hero-actions">${online()
      ? '<button class="btn" data-a="call" data-video="1">📹 Video</button><button class="btn ghost" data-a="call" data-video="0">📞 Voice</button><button class="btn ghost" data-a="us" data-sub="connect">💬 Chat</button>'
      : '<button class="btn" data-a="us" data-sub="connect">💌 Connect partner</button>'}</div>
  </div>`;
}
const QUICK = [
  ['roulette', 'Sex Roulette', '🎰', 'g-roulette'], ['tod', 'Truth or Dare', '🎭', 'g-tod'], ['photo', 'Photo Dares', '📸', 'g-photo'],
  ['marathon', 'Marathon', '⏱️', 'g-marathon'], ['challenge', 'Challenges', '🏆', 'g-challenge'], ['positions', 'Positions', '🌙', 'g-pos'],
];
function homeView() {
  const sh = S.shared, mu = sh.meetup || {};
  const both = Object.values(sh.pos || {}).filter((p) => p.A === 'want' && p.B === 'want').length;
  const sc = talkScores();
  return `<section class="home">
    ${heroCard()}
    ${photoInbox.length ? `<button class="card photo-alert" data-a="photoView" data-id="${esc(photoInbox[0].id)}"><b>📸 ${nm(other(me()))} sent you ${photoInbox.length === 1 ? 'a photo' : photoInbox.length + ' photos'}</b><small>Tap to open — ${photoInbox[0].once ? 'view once 🔥' : 'blurred until you tap'}</small></button>` : ''}
    ${wishCard()}
    <div class="sec-head"><h3>Play tonight</h3><button class="link" data-a="tab" data-tab="games">See all</button></div>
    <div class="quick">${QUICK.map(([id, name, ico, cls]) => `<button class="qtile ${cls}" ${id === 'positions' ? 'data-a="tab" data-tab="positions"' : `data-a="game" data-id="${id}"`}><span>${ico}</span><b>${name}</b></button>`).join('')}</div>
    <div class="card meetup-card" data-a="us" data-sub="meetup">
      <div class="row between"><span class="eyebrow">Next meet-up</span><span class="small">${mu.place ? esc(mu.place) : ''}</span></div>
      ${mu.when ? `<div class="count" data-countdown="${esc(mu.when)}">${countdown(mu.when)}</div><div class="small muted">${esc(new Date(mu.when).toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }))}</div>`
        : '<div class="count dim">Plan your next night</div><div class="small muted">Date, place, outfit and tonight\'s positions →</div>'}
    </div>
    <div class="stats">
      <div><b>${num(sh.streak?.count)}</b><span>🔥 Streak</span></div>
      <div><b>${sc.A.score + sc.B.score}</b><span>Hot Score</span></div>
      <div><b>${desireMatches().length}</b><span>💞 Matches</span></div>
      <div><b>${both}</b><span>✨ Positions</span></div>
    </div>
    <div class="sec-head"><h3>Explore</h3></div>
    <div class="explore">
      <button class="ex-row" data-a="game" data-id="stories"><span class="ex-ico g-stories">📖</span><span><b>Hot stories</b><small>First times, proposals & steamy nights</small></span><i>›</i></button>
      <button class="ex-row" data-a="game" data-id="learn"><span class="ex-ico g-learn">📖</span><span><b>Sex guides</b><small>Foreplay, oral, dirty talk, what he & she love</small></span><i>›</i></button>
      <button class="ex-row" data-a="tab" data-tab="community"><span class="ex-ico g-comm">💬</span><span><b>Community</b><small>Hot topics & real couples' stories</small></span><i>›</i></button>
      <button class="ex-row" data-a="us" data-sub="bucket"><span class="ex-ico g-bucket">🔥</span><span><b>Bucket list</b><small>Hot experiences to tick off together</small></span><i>›</i></button>
      <button class="ex-row" data-a="us" data-sub="future"><span class="ex-ico g-future">🔮</span><span><b>Our future</b><small>Travel, home, family & dreams</small></span><i>›</i></button>
    </div>
    <div class="card tip" data-a="game" data-id="tips"><span class="eyebrow">Tip of the day</span><p>${esc(tipOfDay())}</p></div>
    <div class="card share-card"><b>💞 Know a couple who'd love this?</b><small>Share the app — it's free and private.</small>
      <div class="row"><button class="btn sm" data-a="shareApp">📤 Share with a couple</button>${installEvt ? '<button class="btn sm ghost" data-a="install">📲 Install app</button>' : ''}</div></div>
  </section>`;
}
const gameTile = (g) => `<button class="tile g-${g.id}" data-a="game" data-id="${g.id}"><span class="ico">${g.icon}</span><b>${g.name}</b><small>${g.desc}</small></button>`;

function gamesView() {
  if (!ui.game) {
    return `<section><div class="page-head"><h2>Play</h2><button class="heat-btn" data-a="heat">${heatInfo(S.shared.heat).icon} ${heatInfo(S.shared.heat).name}</button></div>
      ${PLAY_SECTIONS.map(([title, ids]) => `<h3>${title}</h3><div class="grid">${ids.map((id) => GAMES.find((g) => g.id === id)).filter(Boolean).map(gameTile).join('')}</div>`).join('')}</section>`;
  }
  const back = ui.game === 'stories' && ui.story ? '<button class="back" data-a="storyOpen" data-id="">‹ Stories</button>' : ui.game === 'learn' && ui.guide ? '<button class="back" data-a="guide" data-id="">‹ Guides</button>' : `<button class="back" data-a="back">‹ Play</button>`;
  const fn = { roulette: rouletteView, marathon: marathonView, roleplay: roleplayView, diary: diaryView, photo: photoView, challenge: challengeView, tod: todView, talk: talkView, tips: tipsView, learn: learnView, stories: storiesView, desire: desireView, dice: diceView, dates: datesView, never: neverView, rather: ratherView, hotseat: hotseatView, fantasy: fantasyView }[ui.game];
  return `<section>${back}${fn ? fn() : ''}</section>`;
}

function turnBar() {
  const t = G().turn || 'A';
  return `<div class="turn"><span class="${t === 'A' ? 'on' : ''}">${nm('A')} · ${num(S.shared.points.A)}</span><span class="${t === 'B' ? 'on' : ''}">${nm('B')} · ${num(S.shared.points.B)}</span></div>`;
}
function cardHtml(card, label) {
  return `<div class="playcard heat${num(card.heat)}"><div class="pc-top"><span>${label}</span><span>${heatInfo(num(card.heat)).icon}</span></div><p>${esc(card.text)}</p></div>`;
}

function todView() {
  const g = G(), t = g.turn || 'A', o = other(t), card = g.card, ans = g.answer;
  const truth = card?.type === 'truth';
  let body;
  if (!card) {
    body = `<div class="row big-choices"><button class="choice truth" data-a="tod" data-type="truth">Truth</button><button class="choice dare" data-a="tod" data-type="dare">Dare</button></div>
      <button class="btn ghost wide" data-a="tod" data-type="random">🎲 Surprise me</button>
      ${canAct(o) ? `<details class="card ask-own" ${ui.askOpen ? 'open' : ''}><summary>✍️ ${nm(o)}, ask ${nm(t)} your own question</summary>
        <form data-form="todAsk"><div class="seg"><label><input type="radio" name="type" value="truth" checked> Truth</label><label><input type="radio" name="type" value="dare"> Dare</label></div>
        <textarea name="q" rows="2" maxlength="300" required placeholder="Ask anything… or dare them to do something 😈"></textarea><button class="btn wide">Send to ${nm(t)}</button></form></details>` : ''}`;
  } else {
    const answerBox = canAct(t)
      ? `<form class="card reply" data-form="todAnswer"><textarea name="a" rows="3" maxlength="1000" required placeholder="${truth ? `Type your honest answer for ${nm(o)}…` : `Tell ${nm(o)} how it went (optional)…`}"></textarea>
         <button class="btn wide">${truth ? 'Send answer 💬 +5' : 'Send 🔥'}</button></form>`
      : `<p class="center muted small">⏳ Waiting for ${nm(t)} to ${truth ? 'answer' : 'do the dare'}…</p>`;
    const answered = ans ? `<div class="answer-bubble"><small>${nm(t)} ${truth ? 'answered' : 'said'}:</small><p>${esc(ans.text)}</p>
        ${canAct(o) ? `<button class="chip ${g.loved ? 'on' : ''}" data-a="todLove" ${g.loved ? 'disabled' : ''}>${g.loved ? `🔥 You loved this (+5 for ${nm(t)})` : '🔥 Love this answer (+5)'}</button>` : g.loved ? `<span class="small">🔥 ${nm(o)} loved your answer!</span>` : ''}</div>` : '';
    body = cardHtml(card, card.custom ? `${truth ? 'TRUTH' : 'DARE'} FROM ${nm(o).toUpperCase()}` : truth ? 'TRUTH' : 'DARE') + answered
      + (!ans && (truth || canAct(t)) ? answerBox : '')
      + `<div class="row">${!truth && !g.done ? `<button class="btn" data-a="todDone">Dare done +10</button>` : ''}
        <button class="btn ${ans || g.done ? '' : 'ghost'}" data-a="todNext">${ans || g.done ? `Next: ${nm(o)}'s turn →` : 'Skip'}</button>
        ${card.custom ? '' : `<button class="btn ghost" data-a="hide" data-id="${esc(card.id)}" title="Never show again">🚫</button>`}</div>`;
  }
  return `<h2>🎭 Truth or Dare</h2>${turnBar()}
    <p class="center"><b>${nm(t)}</b>, ${card ? (truth ? 'answer honestly 👇' : 'your dare 👇') : 'truth or dare?'}</p>
    ${body}
    <p class="muted small center">Skipping is always free. 🚫 removes a card for good.</p>`;
}

function desireItems() { return C.DESIRES.map((d, i) => ({ id: 'X' + i, heat: d[0], text: d[1] })).filter((d) => d.heat <= S.shared.heat); }
function desireMatches() {
  const A = S.shared.desire?.A || {}, B = S.shared.desire?.B || {};
  return C.DESIRES.map((d, i) => ({ id: 'X' + i, text: d[1], a: A['X' + i], b: B['X' + i] }))
    .filter((x) => (x.a === 'yes' || x.a === 'maybe') && (x.b === 'yes' || x.b === 'maybe'));
}
function swiperBar() {
  if (online()) return `<p class="muted small center">You are playing as <b>${nm(S.local.role)}</b>. Your partner plays on their phone.</p>`;
  return `<div class="swiper">Voting: ${['A', 'B'].map((r) => `<button class="chip ${S.local.swiper === r ? 'on' : ''}" data-a="swiper" data-r="${r}">${nm(r)}</button>`).join('')}<small class="muted">Pass the phone · no peeking 🙈</small></div>`;
}
function desireView() {
  const r = me(), votes = S.shared.desire?.[r] || {};
  const items = desireItems(), next = items.find((d) => !votes[d.id]);
  const done = items.filter((d) => votes[d.id]).length;
  const m = desireMatches();
  return `<h2>💞 Desire Match</h2>${swiperBar()}
    <div class="bar"><i style="width:${items.length ? (done / items.length) * 100 : 0}%"></i></div><p class="small muted center">${done}/${items.length} answered by ${nm(r)}</p>
    ${next ? `<div class="swipe-stage"><div class="playcard heat${next.heat} swipe-card" data-swipe="desire" data-id="${next.id}"><span class="stamp like">YES</span><span class="stamp nope">NO</span><div class="pc-top"><span>WOULD YOU…</span><span>${heatInfo(next.heat).icon}</span></div><p>${esc(next.text)}</p><small class="muted">Swipe right for yes, left for no</small></div></div>
      <div class="row votes"><button class="vote no" data-a="desire" data-id="${next.id}" data-v="no">❌<small>No</small></button>
      <button class="vote maybe" data-a="desire" data-id="${next.id}" data-v="maybe">🤔<small>Maybe</small></button>
      <button class="vote yes" data-a="desire" data-id="${next.id}" data-v="yes">💚<small>Yes</small></button></div>`
    : `<div class="card center"><b>All answered! 🎉</b><p class="muted small">Raise the heat to unlock more, or wait for your partner.</p></div>`}
    <h3>Your matches (${m.length})</h3>
    <p class="muted small">Only things you <b>both</b> said yes or maybe to appear. A "no" is never revealed.</p>
    <div class="list">${m.map((x) => `<div class="li"><span>${esc(x.text)}</span><span class="tag">${x.a === 'yes' && x.b === 'yes' ? '💚 Both yes' : '🤔 Worth a chat'}</span></div>`).join('') || '<p class="muted small">No matches yet — keep swiping!</p>'}</div>
    <button class="btn ghost sm" data-a="desireReset">Redo my answers</button>`;
}

function talkScores() {
  const sc = { A: { sent: 0, likes: 0 }, B: { sent: 0, likes: 0 } };
  for (const m of Object.values(S.shared.talk || {})) {
    if (!m || !sc[m.from]) continue;
    sc[m.from].sent++;
    if (m.likes && typeof m.likes === 'object' && m.likes[other(m.from)]) sc[m.from].likes++;
  }
  for (const r of ['A', 'B']) sc[r].score = sc[r].likes * 10 + sc[r].sent * 2;
  return sc;
}
function talkLeader() {
  const sc = talkScores();
  if (!sc.A.score && !sc.B.score) return null;
  return sc.A.score === sc.B.score ? 'tie' : sc.A.score > sc.B.score ? 'A' : 'B';
}
function talkView() {
  const r = me(), sc = talkScores(), lead = talkLeader();
  const msgs = Object.entries(S.shared.talk || {}).filter(([, m]) => m && typeof m.text === 'string' && (m.from === 'A' || m.from === 'B'))
    .sort((a, b) => num(b[1].ts) - num(a[1].ts));
  const starters = C.TALK_STARTERS.filter((x) => x[0] <= S.shared.heat);
  return `<h2>🔥 Hot Chat</h2>
    <p class="muted small">Talk hot. Every 🔥 your partner gives your message = <b>+10 Hot Score</b>, every message = +2. Who's the hottest talker?</p>
    <div class="talkboard">${['A', 'B'].map((x) => `<div class="${lead === x ? 'lead' : ''}">${lead === x ? '<span class="crown">👑</span>' : ''}<b>${nm(x)}</b>${avatar(x, 'av-sm')}<div class="big-score">${sc[x].score}</div><small>Hot Score</small><br><small>${sc[x].sent} messages · ${sc[x].likes} 🔥</small></div>`).join('')}</div>
    ${lead && lead !== 'tie' ? `<p class="center small"><b>${nm(lead)}</b> is the Hottest Talker 👑 — ${nm(other(lead))}, your move.</p>` : ''}
    ${swiperBar()}
    <div class="chips">${starters.map((x) => `<button class="chip" data-a="starter" data-t="${esc(x[1])}">${esc(x[1])}</button>`).join('')}</div>
    <form class="card" data-form="talk"><textarea name="m" rows="3" maxlength="500" required placeholder="${nm(r)}, tell ${nm(other(r))} what's on your mind…">${esc(ui.talkDraft || '')}</textarea>
      <div class="row between"><small class="muted">Writing as ${nm(r)}</small><button class="btn">Send 🔥</button></div></form>
    <div class="talkfeed">${msgs.map(([id, m]) => {
      const liked = m.likes && m.likes[other(m.from)];
      const canLike = m.from !== r && (online() ? r === S.local.role : true);
      return `<div class="tmsg ${m.from === r ? 'mine' : ''}"><small>${nm(m.from)}</small><p>${esc(m.text)}</p>
        <div class="row between"><span class="small muted">${liked ? `🔥 ${nm(other(m.from))} loved this` : ''}</span>${canLike ? `<button class="chip ${liked ? 'on' : ''}" data-a="talkLike" data-id="${esc(id)}">${liked ? '🔥 Loved' : '🔥 Love it'}</button>` : ''}</div></div>`;
    }).join('') || '<p class="muted small center">No messages yet. Pick a starter above 👆</p>'}</div>`;
}
function tipsView() {
  const cat = C.TIPS.find((c) => c.cat === ui.tipCat) || C.TIPS[0];
  return `<h2>📚 Sex Tips for Couples</h2>
    <div class="card spark"><div class="muted small">Tip of the day</div><p>${esc(tipOfDay())}</p></div>
    <div class="chips">${C.TIPS.map((c) => `<button class="chip ${c === cat ? 'on' : ''}" data-a="tipCat" data-c="${esc(c.cat)}">${c.icon} ${esc(c.cat)}</button>`).join('')}</div>
    <div class="list">${cat.items.map((t) => `<div class="li">${cat.icon} ${esc(t)}</div>`).join('')}</div>
    <p class="muted small">General wellness information, not medical advice. If something hurts or worries you, see a doctor.</p>`;
}
function tipOfDay() {
  const all = C.TIPS.flatMap((c) => c.items);
  return all[(Math.floor(Date.now() / 864e5) * 7) % all.length];
}

function diceView() {
  const g = G(), t = g.turn || 'A', r = g.roll;
  return `<h2>🎲 Sexy Dice</h2>${turnBar()}
    <p class="center"><b>${nm(t)}</b> rolls, then does it to <b>${nm(other(t))}</b></p>
    <div class="dice ${r ? 'rolled' : ''}" data-key="${r?.n || 0}">
      <div class="die">${r ? esc(r.a) : '?'}</div><div class="die">${r ? esc(r.p) : '?'}</div><div class="die">${r ? esc(r.d) : '?'}</div>
    </div>
    ${r ? `<p class="center big-line">${esc(r.a)} ${nm(other(t))}'s <b>${esc(r.p.toLowerCase())}</b> for ${esc(r.d)}</p>
      <div class="row"><button class="btn" data-a="diceDone">Done +5 → next turn</button><button class="btn ghost" data-a="diceRoll">Re-roll</button></div>`
    : '<button class="btn big wide" data-a="diceRoll">Roll the dice</button>'}`;
}

function datesView() {
  const g = G(), card = g.card;
  const places = [['home', '🏠 At home'], ['out', '🌃 Going out'], ['ldr', '📱 Long distance']];
  return `<h2>🌙 Naughty Date Dares</h2>
    <div class="chips">${places.map(([k, l]) => `<button class="chip ${ui.place === k ? 'on' : ''}" data-a="place" data-p="${k}">${l}</button>`).join('')}</div>
    ${card ? cardHtml(card, 'DATE MISSION') : '<div class="playcard empty"><p>Draw a mission for your next date.</p></div>'}
    <div class="row"><button class="btn" data-a="dateDraw">${card ? 'Another mission' : 'Draw a mission'}</button>
    ${card ? '<button class="btn ghost" data-a="dateSave">📌 Add to meet-up</button>' : ''}</div>`;
}

function answerRow(r, ans, opts) {
  if (bothIn(ans)) return '';
  const mine = online() && r === S.local.role;
  if (ans?.[r] !== undefined && !mine) return `<div class="ans"><b>${nm(r)}</b><span class="tag ok">✓ Locked in</span></div>`;
  if (!canAct(r)) return `<div class="ans"><b>${nm(r)}</b><span class="muted small">thinking…</span></div>`;
  return `<div class="ans"><b>${nm(r)}</b>${opts.map(([v, l]) => `<button class="chip ${ans?.[r] === v ? 'on' : ''}" data-a="ans" data-r="${r}" data-v="${v}">${esc(l)}</button>`).join('')}</div>`;
}
const bothIn = (ans) => !!ans && ans.A !== undefined && ans.B !== undefined;
const NH_OPTS = [['have', '🙋 I have'], ['never', '😇 Never']];

function neverView() {
  const g = G(), card = g.card, ans = g.ans || {};
  const reveal = bothIn(ans);
  let result = '';
  if (reveal) {
    const a = ans.A === 'have', b = ans.B === 'have';
    result = a && b ? '🔥 You both have! Tell the story.' : !a && !b ? '😇 Neither of you… yet. Add it to the bucket list?' : `👀 Only ${nm(a ? 'A' : 'B')} has. Spill the details!`;
  }
  return `<h2>🙈 Never Have I Ever</h2>
    ${card ? cardHtml(card, 'NEVER HAVE I EVER') + answerRow('A', ans, NH_OPTS) + answerRow('B', ans, NH_OPTS) : '<div class="playcard empty"><p>Draw a card. Both answer in secret, then it reveals.</p></div>'}
    ${reveal ? `<div class="card center reveal">${nm('A')}: ${ans.A === 'have' ? '🙋' : '😇'} · ${nm('B')}: ${ans.B === 'have' ? '🙋' : '😇'}<p>${result}</p></div>` : ''}
    <div class="row"><button class="btn" data-a="cardDraw" data-pool="never">${card ? 'Next card' : 'Draw a card'}</button>${card ? `<button class="btn ghost" data-a="hide" data-id="${esc(card.id)}">🚫</button>` : ''}</div>`;
}

const WYR_OPTS = [['0', '⬅ First'], ['1', 'Second ➡']];
function ratherView() {
  const g = G(), card = g.card, ans = g.ans || {};
  const [l, rt] = card ? String(card.text).replace(/\?$/, '').split(' — or ') : ['', ''];
  const reveal = bothIn(ans);
  return `<h2>⚖️ Would You Rather</h2>
    ${card ? `<div class="playcard heat${num(card.heat)}"><div class="pc-top"><span>WOULD YOU RATHER</span><span>${heatInfo(num(card.heat)).icon}</span></div>
      <div class="wyr"><div>${esc(l)}</div><b>or</b><div>${esc(rt)}</div></div></div>
      ${answerRow('A', ans, WYR_OPTS)}${answerRow('B', ans, WYR_OPTS)}
      ${reveal ? `<div class="card center reveal">${ans.A === ans.B ? `💞 Match! You both picked "${esc(ans.A === '0' ? l : rt)}". +5 each` : `😏 ${nm('A')} picked "${esc(ans.A === '0' ? l : rt)}", ${nm('B')} picked "${esc(ans.B === '0' ? l : rt)}". Defend your choice!`}</div>` : ''}`
    : '<div class="playcard empty"><p>Both pick in secret. Same answer = +5 each.</p></div>'}
    <div class="row"><button class="btn" data-a="cardDraw" data-pool="rather">${card ? 'Next' : 'Start'}</button>${card ? `<button class="btn ghost" data-a="hide" data-id="${esc(card.id)}">🚫</button>` : ''}</div>`;
}

function hotseatView() {
  const g = G(), seat = g.turn || 'A', running = g.endsAt && g.endsAt > Date.now();
  const over = g.endsAt && !running;
  return `<h2>⏱️ Hot Seat</h2>${turnBar()}
    <p class="center"><b>${nm(seat)}</b> is in the hot seat. Answer fast — no thinking!</p>
    <div class="timer" ${running ? `data-timer="${num(g.endsAt)}"` : ''}>${running ? Math.ceil((g.endsAt - Date.now()) / 1000) : over ? '0' : '60'}</div>
    ${running && g.card ? cardHtml(g.card, `QUESTION ${num(g.count) + 1}`) + '<button class="btn big wide" data-a="hsNext">Answered → next</button>' : ''}
    ${over ? `<div class="card center reveal"><b>${nm(seat)}</b> answered <b>${num(g.count)}</b> questions! +${num(g.count) * 2} points</div><button class="btn wide" data-a="hsSwap">${nm(other(seat))}'s turn</button>` : ''}
    ${!g.endsAt ? '<button class="btn big wide" data-a="hsStart">Start 60 seconds</button>' : ''}`;
}

function fantasyView() {
  const f = G().fantasy;
  return `<h2>✨ Fantasy Builder</h2><p class="muted">Spin a scenario, swap any part you don't like, then lock it in.</p>
    ${f ? `<div class="fantasy">${[['setting', '📍 Setting'], ['roles', '🎭 You are'], ['mood', '🌡️ Mood'], ['rule', '📜 The rule']].map(([k, l]) => `<div class="fz"><small>${l}</small><b>${esc(f[k])}</b><button class="mini" data-a="fzSwap" data-k="${k}">↻</button></div>`).join('')}</div>
      <div class="row"><button class="btn" data-a="fzNew">Spin again</button><button class="btn ghost" data-a="fzSave">📌 Save to meet-up</button></div>`
    : '<button class="btn big wide" data-a="fzNew">Build our fantasy</button>'}
    <p class="muted small center">Safe word: <b>${esc(S.shared.safeWord)}</b> — always ends the scene.</p>`;
}

const dots = (n, c) => c.repeat(n) + '<i>' + c.repeat(3 - n) + '</i>';
function posBadge(p) {
  const v = S.shared.pos?.[p.id] || {}, r = me();
  if (v.A === 'want' && v.B === 'want') return '<span class="ribbon gold">✨ Both want</span>';
  if (v.tried) return '<span class="ribbon">✓ Tried</span>';
  if (v[r] === 'want') return '<span class="ribbon">👍 You want</span>';
  return '';
}
function positionsView() {
  const sh = S.shared, r = me();
  if (ui.posSwipe) return posSwipeView();
  const list = C.POSITIONS.filter((p) => {
    const v = sh.pos?.[p.id] || {};
    return ui.posFilter === 'both' ? v.A === 'want' && v.B === 'want' : ui.posFilter === 'tried' ? v.tried : ui.posFilter === 'new' ? !v[r] : ui.posFilter === 'easy' ? p.diff === 1 : ui.posFilter === 'intimate' ? p.intimacy === 3 : true;
  });
  const plan = (sh.plan || []).map((id) => C.POSITIONS.find((p) => p.id === id)).filter(Boolean);
  return `<section><div class="page-head"><h2>Positions</h2><button class="btn sm" data-a="posSwipe">💘 Swipe mode</button></div>
    ${swiperBar()}
    ${plan.length ? `<div class="card plan"><div class="row between"><b>🌙 Tonight's playlist</b><button class="btn sm ghost" data-a="surprise">🎲 Surprise</button></div>
      <div class="playlist">${plan.map((p, i) => `<div class="pl-item" data-a="posOpen" data-id="${p.id}"><span class="pl-n">${i + 1}</span>${poseSvg(p.id, 'pose mini-pose')}<span>${esc(p.name)}</span><button class="mini" data-a="planToggle" data-id="${p.id}">✕</button></div>`).join('')}</div></div>`
      : '<button class="card plan-empty" data-a="surprise"><b>🎲 Surprise us</b><small>Pick a random position you both want — or tap any card to learn how.</small></button>'}
    <div class="chips">${[['all', 'All'], ['both', '✨ Both want'], ['new', 'New for me'], ['easy', 'Easy'], ['intimate', '♥ Intimate'], ['tried', '✓ Tried']].map(([k, l]) => `<button class="chip ${ui.posFilter === k ? 'on' : ''}" data-a="posFilter" data-f="${k}">${l}</button>`).join('')}</div>
    <div class="pgrid">${list.map((p) => `<button class="pcard" data-a="posOpen" data-id="${p.id}">${posBadge(p)}${poseSvg(p.id)}<span class="pc-name"><b>${esc(p.name)}</b><small>${'🔥'.repeat(p.heat - 2)} · ${['Easy', 'Medium', 'Hard'][p.diff - 1]}</small></span></button>`).join('') || '<p class="muted">Nothing here yet.</p>'}</div>
    <p class="muted small center">Tap a position for step-by-step how-to. Your partner only sees "Both want" — a pass stays private.</p></section>`;
}
function posDetail(id) {
  const p = C.POSITIONS.find((x) => x.id === id); if (!p) return '';
  const v = S.shared.pos?.[p.id] || {}, r = me(), inPlan = (S.shared.plan || []).includes(p.id);
  const steps = C.HOWTO[poseKind(p.id)] || [];
  return `<div class="pos-detail" data-pos="${p.id}">
    <div class="pd-art">${poseSvg(p.id, 'pose', true)}<span class="pd-hint">▶ how it moves</span></div>
    <h2>${esc(p.name)}</h2>
    <div class="meters"><span>Difficulty ${dots(p.diff, '●')}</span><span>Intimacy ${dots(p.intimacy, '♥')}</span><span>Energy ${dots(p.energy, '⚡')}</span></div>
    <p>${esc(p.desc)}</p>
    <h3>How to do it</h3><ol class="steps">${steps.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
    <div class="vote-bar">
      <button class="vbtn no ${v[r] === 'no' ? 'on' : ''}" data-a="posVote" data-id="${p.id}" data-v="no">✕<small>Pass</small></button>
      <button class="vbtn plan ${inPlan ? 'on' : ''}" data-a="planToggle" data-id="${p.id}">★<small>${inPlan ? 'In plan' : 'Tonight'}</small></button>
      <button class="vbtn tried ${v.tried ? 'on' : ''}" data-a="posTried" data-id="${p.id}">✓<small>Tried</small></button>
      <button class="vbtn yes ${v[r] === 'want' ? 'on' : ''}" data-a="posVote" data-id="${p.id}" data-v="want">♥<small>Want</small></button>
    </div>
    <button class="btn ghost wide" data-a="close">Close</button></div>`;
}
function posSwipeView() {
  const r = me(), next = C.POSITIONS.find((p) => !S.shared.pos?.[p.id]?.[r]);
  const done = C.POSITIONS.filter((p) => S.shared.pos?.[p.id]?.[r]).length;
  return `<section><div class="page-head"><h2>Swipe positions</h2><button class="btn sm ghost" data-a="posSwipe">Done</button></div>
    ${swiperBar()}
    <div class="bar"><i style="width:${(done / C.POSITIONS.length) * 100}%"></i></div><p class="small muted center">${done} / ${C.POSITIONS.length} · swipe right = want, left = pass</p>
    ${next ? `<div class="swipe-stage"><div class="swipe-card" data-swipe="pos" data-id="${next.id}">
        <span class="stamp like">WANT</span><span class="stamp nope">PASS</span>
        <div class="sc-art">${poseSvg(next.id)}</div>
        <div class="sc-body"><b>${esc(next.name)}</b><p>${esc(next.desc)}</p><button class="link" data-a="posOpen" data-id="${next.id}">How to do it ›</button></div></div></div>
      <div class="votes"><button class="vote no" data-a="posVote" data-id="${next.id}" data-v="no">✕</button><button class="vote star" data-a="planToggle" data-id="${next.id}">★</button><button class="vote yes" data-a="posVote" data-id="${next.id}" data-v="want">♥</button></div>`
    : '<div class="card center"><b>All swiped! 🎉</b><p class="muted small">Check "Both want" to see your matches.</p><button class="btn" data-a="posSwipe">See matches</button></div>'}</section>`;
}

// ---------- Sex roulette ----------
function beep() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)(), o = ac.createOscillator(), g = ac.createGain();
    o.frequency.value = 880; g.gain.setValueAtTime(0.0001, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.25, ac.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.5);
    o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.55);
  } catch { /* no audio */ }
  try { navigator.vibrate?.(200); } catch { /* */ }
}
function pickPositions(n) {
  const sh = S.shared, want = (p) => sh.pos?.[p.id]?.A === 'want' && sh.pos?.[p.id]?.B === 'want';
  const notNo = (p) => sh.pos?.[p.id]?.A !== 'no' && sh.pos?.[p.id]?.B !== 'no';
  const plan = (sh.plan || []).map((id) => C.POSITIONS.find((p) => p.id === id)).filter(Boolean);
  const pool = [...plan, ...C.POSITIONS.filter((p) => want(p) && !plan.includes(p)), ...C.POSITIONS.filter((p) => notNo(p) && !want(p) && !plan.includes(p)).sort(() => Math.random() - 0.5)];
  return pool.slice(0, n).map((p) => p.id);
}
function rouletteView() {
  const g = G(), sp = g.spin, p = sp && C.POSITIONS.find((x) => x.id === sp.pos);
  const running = g.endsAt && g.endsAt > Date.now();
  return `<h2>🎰 Sex Roulette</h2><p class="muted small">Spin for a position, a spot to focus on, a speed and a time. Positions you both want come up more often.</p>
    ${p ? `<div class="roulette-card ${g.n ? 'spun' : ''}" data-k="${num(sp.n)}">
      <div class="pd-art">${poseSvg(p.id, 'pose', true)}</div>
      <div class="rc-grid"><div><small>Position</small><b>${esc(p.name)}</b></div><div><small>Focus on</small><b>${esc(sp.spot)}</b></div><div><small>Speed</small><b>${esc(sp.speed)}</b></div><div><small>Extra</small><b>${esc(sp.extra)}</b></div></div>
      <div class="timer small-timer" ${running ? `data-timer="${num(g.endsAt)}" data-fmt="mmss" data-roulette="1"` : ''}>${running ? fmtDur(g.endsAt - Date.now()) : fmtDur(num(sp.secs) * 1000)}</div></div>`
    : '<div class="playcard empty"><p>Tap spin to start. Turn on auto-spin and the app keeps you switching all night.</p></div>'}
    <div class="row"><button class="btn big" data-a="rouSpin">🎰 ${p ? 'Spin again' : 'Spin'}</button>${p && !running ? '<button class="btn ghost" data-a="rouStart">▶ Start timer</button>' : ''}${p ? `<button class="btn ghost sm" data-a="posOpen" data-id="${p.id}">How to</button>` : ''}</div>
    <label class="check small"><input type="checkbox" data-rou-auto ${g.auto ? 'checked' : ''}> Auto-spin when the timer ends</label>`;
}

// ---------- Position marathon ----------
function marathonView() {
  const g = G();
  if (!g.list?.length || !g.startAt) {
    return `<h2>⏱️ Position Marathon</h2><p class="muted small">The app picks positions — your tonight's playlist first, then ones you both want — and switches you to the next one with a chime.</p>
      <div class="card"><b>How many positions?</b><div class="chips">${[4, 6, 8, 10].map((n) => `<button class="chip ${(ui.mN || 6) === n ? 'on' : ''}" data-a="mSet" data-k="mN" data-v="${n}">${n}</button>`).join('')}</div>
      <b>Minutes each</b><div class="chips">${[1, 2, 3, 5].map((n) => `<button class="chip ${(ui.mMin || 2) === n ? 'on' : ''}" data-a="mSet" data-k="mMin" data-v="${n}">${n} min</button>`).join('')}</div></div>
      <button class="btn big wide" data-a="mStart">▶ Start marathon</button>`;
  }
  const per = num(g.interval) * 1000, idx = Math.floor((Date.now() - num(g.startAt)) / per);
  if (idx >= g.list.length) return `<h2>⏱️ Position Marathon</h2><div class="card center reveal"><div class="big-emoji">🏆</div><b>Marathon complete — ${g.list.length} positions!</b><p class="muted small">Log it in your Sex Diary?</p><div class="row center"><button class="btn" data-a="game" data-id="diary">📓 Log it</button><button class="btn ghost" data-a="mStop">New marathon</button></div></div>`;
  const cur = C.POSITIONS.find((x) => x.id === g.list[idx]), next = C.POSITIONS.find((x) => x.id === g.list[idx + 1]);
  const left = per - ((Date.now() - num(g.startAt)) % per);
  return `<h2>⏱️ Position ${idx + 1} of ${g.list.length}</h2>
    <div class="marathon"><div class="pd-art">${poseSvg(cur.id, 'pose', true)}</div><b class="m-name">${esc(cur.name)}</b>
      <div class="timer small-timer" data-mleft>${fmtDur(left)}</div>
      <div class="bar"><i style="width:${(idx / g.list.length) * 100}%"></i></div>
      ${next ? `<p class="small muted">Next: <b>${esc(next.name)}</b></p>` : '<p class="small muted">Last one — make it count 🔥</p>'}</div>
    <div class="row"><button class="btn ghost" data-a="posOpen" data-id="${cur.id}">How to</button><button class="btn ghost" data-a="mSkip">Skip ›</button><button class="btn ghost" data-a="mStop">Stop</button></div>`;
}

// ---------- Role-play ----------
function roleplayView() {
  const rp = C.ROLEPLAYS.find((x) => x.id === ui.rp);
  if (rp) return `<button class="back" data-a="rpOpen" data-id="">‹ All scenes</button>
    <div class="reader-head g-roleplay"><span class="eyebrow">${rp.icon} Role-play · ${heatInfo(rp.heat).icon} ${heatInfo(rp.heat).name}</span><h2>${esc(rp.title)}</h2></div>
    <div class="card"><h3>The scene</h3><p>${esc(rp.setup)}</p></div>
    <div class="card"><h3>${nm('A')} plays</h3><p>${esc(rp.roleA)}</p><h3>${nm('B')} plays</h3><p>${esc(rp.roleB)}</p></div>
    <div class="card"><h3>Opening lines</h3>${rp.lines.map((l) => `<p class="rp-line">${esc(l.replace(/^A:/, nm('A') + ':').replace(/^B:/, nm('B') + ':'))}</p>`).join('')}</div>
    <div class="card"><h3>How it goes</h3><ol class="steps">${rp.beats.map((b) => `<li>${esc(b)}</li>`).join('')}</ol></div>
    <p class="muted small center">Safe word: <b>${esc(S.shared.safeWord)}</b> — it ends the scene instantly, no questions.</p>
    <button class="btn wide" data-a="rpSend" data-id="${rp.id}">💌 Ask ${nm(other(me()))} to play this tonight</button>`;
  const vis = C.ROLEPLAYS.filter((x) => x.heat <= Math.max(3, S.shared.heat));
  return `<h2>🎭 Role-play Scripts</h2><p class="muted small">Ready scenes with roles and opening lines for both of you. Pick one, set the stage, stay in character.</p>
    <div class="story-list">${vis.map((x) => `<button class="story-card g-roleplay" data-a="rpOpen" data-id="${x.id}"><span class="eyebrow">${x.icon} ${heatInfo(x.heat).name}</span><b>${esc(x.title)}</b><small>${esc(x.setup)}</small></button>`).join('')}</div>
    ${vis.length < C.ROLEPLAYS.length ? `<button class="card locked" data-a="heat"><b>🔒 ${C.ROLEPLAYS.length - vis.length} hotter scenes</b><small>Turn up the heat to unlock.</small></button>` : ''}`;
}

// ---------- Sex diary ----------
function diaryEntries() { return Object.entries(S.shared.diary || {}).filter(([, e]) => e && typeof e === 'object').sort((a, b) => num(b[1].ts) - num(a[1].ts)); }
function diaryView() {
  const list = diaryEntries(), now = new Date();
  const month = list.filter(([, e]) => { const d = new Date(num(e.ts)); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  const avg = list.length ? (list.reduce((a, [, e]) => a + num(e.rating), 0) / list.length).toFixed(1) : '–';
  const count = (key) => { const m = {}; for (const [, e] of list) for (const v of [].concat(e[key] || [])) m[v] = (m[v] || 0) + 1; return Object.entries(m).sort((a, b) => b[1] - a[1])[0]?.[0]; };
  const topPos = C.POSITIONS.find((p) => p.id === count('pos'));
  const last = list[0] ? Math.floor((Date.now() - num(list[0][1].ts)) / 864e5) : null;
  const f = ui.diary || { place: 'Bed', pos: [], rating: 4 };
  return `<h2>📓 Sex Diary</h2><p class="muted small">Your private log — both of you see it. Nobody else ever does.</p>
    <div class="stats"><div><b>${month.length}</b><span>this month</span></div><div><b>${list.length}</b><span>all time</span></div><div><b>${avg}</b><span>avg 🔥</span></div><div><b>${last === null ? '–' : last === 0 ? 'Today' : last + 'd'}</b><span>last time</span></div></div>
    ${topPos ? `<div class="card"><span class="eyebrow">Your favourite position</span><div class="row">${poseSvg(topPos.id, 'pose mini-pose')}<b>${esc(topPos.name)}</b></div>${count('place') ? `<small class="muted">Favourite place: <b>${esc(count('place'))}</b></small>` : ''}</div>` : ''}
    <form class="card" data-form="diary"><b>➕ Log tonight</b>
      <div class="muted small">Where</div><div class="chips wrap">${C.DIARY_PLACES.map((pl) => `<button type="button" class="chip ${f.place === pl ? 'on' : ''}" data-a="dSet" data-k="place" data-v="${esc(pl)}">${esc(pl)}</button>`).join('')}</div>
      <div class="muted small">Positions</div><div class="chips wrap">${f.pos.map((id) => `<button type="button" class="chip on" data-a="dPos" data-id="${id}">${esc(C.POSITIONS.find((p) => p.id === id)?.name || id)} ✕</button>`).join('')}</div>
      <select data-dpos><option value="">+ Add a position…</option>${C.POSITIONS.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select>
      <div class="muted small">How hot was it?</div><div class="flames">${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="${n <= f.rating ? 'on' : ''}" data-a="dSet" data-k="rating" data-v="${n}">🔥</button>`).join('')}</div>
      <label class="check small"><input type="checkbox" name="both" ${f.both === false ? '' : 'checked'}> We both finished 😮‍💨</label>
      <textarea name="note" rows="2" maxlength="300" placeholder="Notes for next time…"></textarea>
      <button class="btn wide">Save to diary</button></form>
    <h3>History</h3><div class="list">${list.slice(0, 30).map(([id, e]) => `<div class="li diary-li"><span><b>${new Date(num(e.ts)).toLocaleDateString([], { day: 'numeric', month: 'short' })}</b> · ${esc(e.place || '')} · ${'🔥'.repeat(Math.min(5, num(e.rating)))}${e.both ? ' · 😮‍💨' : ''}<br><small class="muted">${[].concat(e.pos || []).map((pid) => esc(C.POSITIONS.find((p) => p.id === pid)?.name || '')).filter(Boolean).join(', ')}${e.note ? ' — ' + esc(e.note) : ''}</small></span><button class="mini" data-a="dDel" data-id="${esc(id)}">✕</button></div>`).join('') || '<p class="muted small">No entries yet. Tonight could be the first 😉</p>'}</div>`;
}

// ---------- Spicy photo dares ----------
// Photos are shrunk on the phone and sent straight to the partner's open app.
// They are kept only in memory (gone when the app closes) and never saved on our server.
const photoInbox = [];
const photoSent = [];
async function shrinkPhoto(file) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  let q = 0.82, url = c.toDataURL('image/jpeg', q);
  while (url.length > 420000 && q > 0.35) { q -= 0.08; url = c.toDataURL('image/jpeg', q); }
  if (url.length > 420000) { const c2 = document.createElement('canvas'); c2.width = c.width / 2; c2.height = c.height / 2; c2.getContext('2d').drawImage(c, 0, 0, c2.width, c2.height); url = c2.toDataURL('image/jpeg', 0.75); }
  return url;
}
function photoView() {
  const g = G(), t = g.turn || 'A', o = other(t), card = g.card;
  const live = online();
  return `<h2>📸 Spicy Photo Dares</h2>${turnBar()}
    <p class="center"><b>${nm(o)}</b> dares <b>${nm(t)}</b>:</p>
    ${card ? cardHtml(card, 'PHOTO DARE') : '<div class="playcard empty"><p>Draw a photo dare. The photo goes only to your partner — never saved on our server.</p></div>'}
    ${card && canAct(t) ? (live
      ? `<label class="btn big wide photo-btn">📷 Take or choose photo<input type="file" accept="image/*" data-a="photoPick" hidden></label>
         <label class="check small center-check"><input type="checkbox" data-photo-once ${ui.photoOnce === false ? '' : 'checked'}> View once (disappears after ${nm(o)} sees it)</label>`
      : `<p class="muted small center">Playing on one phone? Show ${nm(o)} for real 😉 — or connect two phones to send photos.</p><button class="btn wide" data-a="photoDone">Done it! +10</button>`) : ''}
    ${card && !canAct(t) ? `<p class="center muted small">⏳ Waiting for ${nm(t)}'s photo…</p>` : ''}
    <div class="row"><button class="btn ${card ? 'ghost' : ''}" data-a="photoDraw">${card ? 'Another dare' : 'Draw a dare'}</button>${card ? `<button class="btn ghost" data-a="todNext">Next: ${nm(o)}'s turn →</button>` : ''}</div>
    ${photoSent.length ? `<h3>Sent</h3><div class="list">${photoSent.slice(-5).reverse().map((x) => `<div class="li"><span>${esc(x.dare.slice(0, 40))}…</span><span class="tag ${x.seen ? 'ok' : ''}">${x.react ? x.react + ' ' : ''}${x.seen ? 'Seen' : 'Delivered'}</span></div>`).join('')}</div>` : ''}
    ${photoInbox.length ? `<h3>Received</h3><div class="list">${photoInbox.map((x) => `<button class="li" data-a="photoView" data-id="${esc(x.id)}"><span>📸 ${esc(x.dare.slice(0, 40))}…</span><span class="tag">${x.once ? 'View once' : 'Open'}</span></button>`).join('')}</div>` : ''}
    <p class="muted small center">🔒 Only send what you're both comfortable with. Screenshots can't be blocked — trust each other.</p>`;
}
function openPhoto(id) {
  const x = photoInbox.find((p) => p.id === id); if (!x) return;
  modal(`<div class="photo-viewer"><small class="eyebrow">${esc(x.dare)}</small>
    <div class="pv-frame blurred" data-a="photoReveal"><img src="${esc(x.data)}" alt=""><span class="pv-tap">Tap to reveal 🔥</span></div>
    <div class="react-row3"><button class="rbtn" data-a="photoReact" data-id="${esc(id)}" data-e="🔥">🔥<small>Hot +15</small></button><button class="rbtn" data-a="photoReact" data-id="${esc(id)}" data-e="😍">😍<small>Love it</small></button><button class="rbtn" data-a="photoReact" data-id="${esc(id)}" data-e="🥵">🥵<small>Come here</small></button></div>
    <button class="btn ghost wide" data-a="photoClose" data-id="${esc(id)}">${x.once ? 'Close — photo disappears' : 'Close'}</button></div>`);
}

// ---------- Hot challenges ----------
function challengeView() {
  const g = G(), tab = ui.chTab || 'quick';
  const head = `<h2>🏆 Hot Challenges</h2><div class="seg"><button class="${tab === 'quick' ? 'on' : ''}" data-a="chTab" data-t="quick">⏱️ Quick challenge</button><button class="${tab === 'program' ? 'on' : ''}" data-a="chTab" data-t="program">📅 7-Day</button></div>`;
  if (tab === 'program') {
    const pr = S.shared.program, prog = pr && C.PROGRAMS.find((x) => x.id === pr.id);
    if (!prog) return head + `<p class="muted small">Do one task a day together. Tick it off on either phone — it syncs.</p>` + C.PROGRAMS.map((x) => `<button class="card program-card" data-a="progStart" data-id="${x.id}"><b>${x.icon} ${x.name}</b><small>${esc(x.days[0])}</small><span class="btn sm">Start</span></button>`).join('');
    const done = Object.keys(pr.done || {}).length;
    return head + `<div class="card"><div class="row between"><b>${prog.icon} ${prog.name}</b><span class="tag">${done}/7</span></div><div class="bar"><i style="width:${(done / 7) * 100}%"></i></div></div>
      <div class="list">${prog.days.map((d, i) => `<label class="li check day ${pr.done?.[i] ? 'done' : ''}"><input type="checkbox" data-a="progDay" data-i="${i}" ${pr.done?.[i] ? 'checked' : ''}><span>${esc(d)}</span></label>`).join('')}</div>
      ${done === 7 ? '<div class="card center reveal"><b>🏆 Challenge complete!</b><p class="small muted">You two are on fire. Start another?</p></div>' : ''}
      <button class="btn ghost wide" data-a="progQuit">${done === 7 ? 'Choose another challenge' : 'Quit challenge'}</button>`;
  }
  const running = g.endsAt && g.endsAt > Date.now(), over = g.endsAt && !running;
  return head + `${g.card ? `<div class="playcard heat${num(g.card.heat)} challenge-card"><div class="pc-top"><span>CHALLENGE · ${Math.round(num(g.card.secs) / 60) || 1} MIN</span><span>${heatInfo(num(g.card.heat)).icon}</span></div><p>${esc(g.card.text)}</p>
      ${running || over ? `<div class="timer small-timer" ${running ? `data-timer="${num(g.endsAt)}" data-fmt="mmss"` : ''}>${running ? fmtDur(g.endsAt - Date.now()) : "Time's up!"}</div>` : ''}</div>` : '<div class="playcard empty"><p>Draw a challenge, start the timer, and go. Complete it for +20 each.</p></div>'}
    <div class="row">${g.card && !g.endsAt ? '<button class="btn" data-a="chStart">▶ Start timer</button>' : ''}
      ${g.card ? '<button class="btn" data-a="chDone">We did it! +20</button>' : ''}
      <button class="btn ghost" data-a="chDraw">${g.card ? 'Another' : 'Draw a challenge'}</button></div>`;
}

// ---------- Stories ----------
function storiesView() {
  if (ui.story) {
    const st = C.STORIES.find((x) => x.id === ui.story);
    if (st) {
      const cat = C.STORY_CATS.find((c) => c.id === st.cat);
      return `<article class="reader"><div class="reader-head g-st-${st.cat}"><span class="eyebrow">${cat.icon} ${cat.name} · ${st.mins} min read</span><h2>${esc(st.title)}</h2><span class="tag">${heatInfo(st.heat).icon} ${heatInfo(st.heat).name}</span></div>
        ${st.body.map((para) => `<p>${esc(para)}</p>`).join('')}
        <p class="small muted center">— Intimacy Originals · a story written for couples, not a real event —</p>
        <div class="row"><button class="btn" data-a="storyAsk" data-id="${st.id}">💬 Ask ${nm(other(me()))} about it</button><button class="btn ghost" data-a="storyShare" data-t="${st.cat === 'proposal' ? 'proposal' : st.cat === 'first' ? 'first' : 'wild'}">✍️ Share your real one</button></div></article>`;
    }
  }
  const cat = ui.storyCat || 'all';
  const all = C.STORIES.filter((x) => cat === 'all' || x.cat === cat);
  const visible = all.filter((x) => x.heat <= S.shared.heat), locked = all.length - visible.length;
  return `<div class="page-head"><h2>Hot Stories</h2></div>
    <p class="muted small">Intimacy Originals — short romantic and steamy stories written for couples. Read them together, then share your own real story in the Community.</p>
    <div class="chips">${C.STORY_CATS.map((c) => `<button class="chip ${cat === c.id ? 'on' : ''}" data-a="storyCat" data-c="${c.id}">${c.icon} ${c.name}</button>`).join('')}</div>
    <div class="story-list">${visible.map((x) => { const c = C.STORY_CATS.find((k) => k.id === x.cat); return `<button class="story-card g-st-${x.cat}" data-a="storyOpen" data-id="${x.id}">
      <span class="eyebrow">${c.icon} ${c.name} · ${x.mins} min</span><b>${esc(x.title)}</b><small>${esc(x.body[0].slice(0, 110))}…</small><span class="sc-heat">${heatInfo(x.heat).icon}</span></button>`; }).join('')}</div>
    ${locked ? `<button class="card locked" data-a="heat"><b>🔒 ${locked} hotter ${locked === 1 ? 'story' : 'stories'}</b><small>Turn the heat up to read them.</small></button>` : ''}
    <button class="card community-cta" data-a="tab" data-tab="community"><b>💬 Real stories from real couples</b><small>Read first-time and proposal stories shared by couples — or share yours.</small></button>`;
}

// ---------- Fantasy Lab ----------
function draftFor(r) {
  S.local.fantasyDraft = S.local.fantasyDraft || {};
  if (!S.local.fantasyDraft[r]) S.local.fantasyDraft[r] = S.shared.fantasies?.[r] ? JSON.parse(JSON.stringify(S.shared.fantasies[r])) : { picks: {}, text: '' };
  return S.local.fantasyDraft[r];
}
function fantasyStory(f) {
  return C.FANTASY_LAB.filter((c) => f.picks?.[c.id]?.length).map((c) => `<div class="fs-row"><span>${c.icon}</span><div><small>${esc(c.q)}</small><b>${f.picks[c.id].map(esc).join(' · ')}</b></div></div>`).join('')
    + (f.text ? `<blockquote>“${esc(f.text)}”</blockquote>` : '');
}
function labView() {
  const r = me(), p = other(r), tab = ui.labTab || 'mine';
  const head = `<div class="page-head"><h2>Fantasy Lab</h2><button class="heat-btn" data-a="heat">${heatInfo(S.shared.heat).icon} ${heatInfo(S.shared.heat).name}</button></div>
    <p class="muted small">Build your dream night in private. Reveal it when you're ready — then talk, match and make it real.</p>
    ${swiperBar()}
    <div class="seg three"><button class="${tab === 'mine' ? 'on' : ''}" data-a="labTab" data-t="mine">My fantasy</button><button class="${tab === 'theirs' ? 'on' : ''}" data-a="labTab" data-t="theirs">${nm(p)}'s</button><button class="${tab === 'talk' ? 'on' : ''}" data-a="labTab" data-t="talk">Talk</button></div>`;
  if (tab === 'mine') {
    const d = draftFor(r), revealed = S.shared.fantasies?.[r];
    return `<section>${head}
      ${C.FANTASY_LAB.map((c) => `<div class="card lab-q"><div class="lq-head"><span>${c.icon}</span><b>${c.q}</b>${c.multi ? '<small>pick any</small>' : ''}</div>
        <div class="chips wrap">${c.opts.map((o) => `<button class="chip ${(d.picks[c.id] || []).includes(o) ? 'on' : ''}" data-a="labPick" data-c="${c.id}" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div></div>`).join('')}
      <div class="card"><div class="lq-head"><span>📝</span><b>My dream, in my own words</b></div>
        <textarea data-lab-text rows="4" maxlength="1500" placeholder="Describe it slowly… what happens first, what you want, how it ends.">${esc(d.text || '')}</textarea></div>
      <button class="btn big wide" data-a="labReveal">${revealed ? 'Update my revealed fantasy 🔥' : `Reveal to ${nm(p)} 🔥`}</button>
      <p class="muted small center">${revealed ? `✓ ${nm(p)} can see your fantasy.` : `Private until you tap reveal — ${nm(p)} sees nothing before that.`}</p></section>`;
  }
  if (tab === 'theirs') {
    const f = S.shared.fantasies?.[p], mineF = S.shared.fantasies?.[r];
    if (!f) return `<section>${head}<div class="card center empty-state"><div class="big-emoji">🔒</div><b>${nm(p)} hasn't revealed a fantasy yet</b><p class="muted small">Build yours first — or send a wish to tempt them.</p><button class="btn" data-a="labTab" data-t="mine">Build mine</button></div></section>`;
    const matches = mineF ? C.FANTASY_LAB.flatMap((c) => (f.picks?.[c.id] || []).filter((o) => (mineF.picks?.[c.id] || []).includes(o)).map((o) => `${c.icon} ${o}`)) : [];
    const react = S.shared.fantasyReact?.[r];
    return `<section>${head}
      <div class="card fantasy-story"><div class="row">${avatar(p, 'av-sm')}<b>${nm(p)}'s dream night</b></div>${fantasyStory(f)}</div>
      ${matches.length ? `<div class="card match-card"><b>💞 You both want</b><div class="chips wrap">${matches.map((m) => `<span class="chip on">${esc(m)}</span>`).join('')}</div></div>` : ''}
      ${canAct(r) ? `<div class="react-row3"><button class="rbtn ${react === 'yes' ? 'on' : ''}" data-a="labReact" data-v="yes">🔥<small>Let's do it</small></button><button class="rbtn ${react === 'talk' ? 'on' : ''}" data-a="labReact" data-v="talk">💬<small>Let's talk</small></button><button class="rbtn ${react === 'someday' ? 'on' : ''}" data-a="labReact" data-v="someday">⏳<small>Someday</small></button></div>` : ''}
      <div class="row"><button class="btn" data-a="labPlan">📅 Plan it for our meet-up</button><button class="btn ghost" data-a="labTab" data-t="talk">💬 Talk about it</button></div></section>`;
  }
  const pool = C.FANTASY_TALK.filter((x) => x[0] <= Math.max(3, S.shared.heat));
  const q = pool[(ui.labQ || 0) % pool.length];
  const myF = S.shared.fantasies?.[r], theirReact = S.shared.fantasyReact?.[p];
  return `<section>${head}
    ${myF && theirReact ? `<div class="card match-card">${nm(p)} reacted to your fantasy: <b>${{ yes: '🔥 Let\'s do it!', talk: '💬 Let\'s talk', someday: '⏳ Someday' }[theirReact]}</b></div>` : ''}
    <div class="playcard heat${q[0]}"><div class="pc-top"><span>FANTASY TALK</span><span>${heatInfo(q[0]).icon}</span></div><p>${esc(q[1])}</p></div>
    <div class="row"><button class="btn" data-a="labAnswer" data-q="${esc(q[1])}">Answer in Hot Chat 🔥</button><button class="btn ghost" data-a="labNext">Next question</button></div>
    <p class="muted small center">Answer out loud on a call, or write it in Hot Chat — your partner can 🔥 it.</p></section>`;
}

function usView() {
  const subs = [['profile', '💑 Profile'], ['connect', '💌 Connect'], ['meetup', '📅 Meet-up'], ['dates', '🍷 Date ideas'], ['future', '🔮 Future'], ['bucket', '🔥 Bucket list']];
  const fn = { profile: profileView, connect: connectView, meetup: meetupView, dates: ideasView, future: futureView, bucket: bucketView }[ui.usTab] || profileView;
  return `<section><div class="chips sticky-chips">${subs.map(([k, l]) => `<button class="chip ${ui.usTab === k ? 'on' : ''}" data-a="us" data-sub="${k}">${l}${k === 'connect' && S.local.unread ? ' •' : ''}</button>`).join('')}</div>${ui.usTab === 'connect' ? fn() : `<div>${fn()}</div>`}</section>`;
}

function avatar(r, cls = '') {
  const p = S.shared.players[r] || {};
  if (p.photo) return `<span class="avatar ${cls}"><img src="${esc(p.photo)}" alt=""></span>`;
  return `<span class="avatar ${cls} initial i${r}">${esc((p.name || '?').trim().charAt(0).toUpperCase() || '?')}</span>`;
}
function coupleHeader() {
  const mine = me(), partner = other(mine), pm = S.shared.players[partner]?.mood;
  return `<div class="couple-hero" data-a="us" data-sub="profile">
    <div class="pair">${avatar('A', 'av-lg')}<span class="heart-badge">❤</span>${avatar('B', 'av-lg')}</div>
    <div class="names">${nm('A')} <span>&</span> ${nm('B')}</div>
    ${pm ? `<div class="mood-pill">${nm(partner)} is <b>${esc(pm)}</b></div>` : '<div class="mood-pill dim">Tap to add your photos & mood</div>'}
  </div>`;
}
function wishCard() {
  const mine = me(), partner = other(mine), sh = S.shared;
  const toMe = sh.requests?.[partner], fromMe = sh.requests?.[mine];
  const pt = (sh.turnons?.[partner] || []).slice(0, 6);
  return `<div class="card wish">
    <div class="row between"><b>💌 Tonight's wish</b><span class="row" style="margin:0;gap:6px"><button class="btn sm ghost" data-a="dressOpen">👗 Dress me</button><button class="btn sm" data-a="wishOpen">Send a wish</button></span></div>
    ${toMe ? `<div class="wish-in"><small>${nm(partner)} wishes:</small><p>${esc(toMe.text)}</p>
      ${toMe.reply ? `<span class="tag ok">${toMe.reply === 'yes' ? '😘 You said yes' : '🙈 You said maybe'}</span>` : canAct(mine) ? `<div class="row"><button class="btn sm" data-a="wishReply" data-v="yes">😘 Yes, tonight</button><button class="btn sm ghost" data-a="wishReply" data-v="maybe">🙈 Maybe</button></div>` : ''}</div>` : ''}
    ${fromMe ? `<p class="small muted">You wished: <b>${esc(fromMe.text)}</b> — ${fromMe.reply === 'yes' ? '😘 they said YES' : fromMe.reply === 'maybe' ? '🙈 maybe…' : 'waiting…'}</p>` : ''}
    ${pt.length ? `<div class="small muted">${nm(partner)}'s turn-ons</div><div class="chips wrap">${pt.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>` : `<p class="small muted">Add your turn-ons in Us → Profile so ${nm(partner)} knows what drives you wild.</p>`}
  </div>`;
}

function profileView() {
  const card = (r) => {
    const p = S.shared.players[r] || {}, editable = canAct(r);
    return `<div class="card profile-card">
      <div class="row">${avatar(r, 'av-xl')}<div><b class="pname">${nm(r)}</b>${p.mood ? `<div class="mood-pill">${esc(p.mood)}</div>` : ''}
        ${editable ? `<div class="row"><label class="btn sm">📷 ${p.photo ? 'Change' : 'Add'} photo<input type="file" accept="image/*" data-a="photo" data-r="${r}" hidden></label>${p.photo ? `<button class="btn sm ghost" data-a="photoDel" data-r="${r}">Remove</button>` : ''}</div>` : '<p class="small muted">Edited on their phone</p>'}</div></div>
      ${editable ? `<div class="muted small">I am</div><div class="chips">${['m', 'f', 'x'].map((g) => `<button class="chip ${p.g === g ? 'on' : ''}" data-a="gender" data-r="${r}" data-g="${g}">${G_LABEL[g]}</button>`).join('')}</div>` : ''}
      ${editable ? `<div class="muted small">Mood right now</div><div class="chips wrap">${MOODS.map((m) => `<button class="chip ${p.mood === m ? 'on' : ''}" data-a="mood" data-r="${r}" data-m="${esc(m)}">${esc(m)}</button>`).join('')}</div>` : ''}
      ${(() => { const mineT = S.shared.turnons?.[r] || []; const all = [...new Set([...C.TURN_ONS, ...mineT])];
        return editable ? `<div class="muted small">🔥 My turn-ons <small>(${nm(other(r))} can see these)</small></div><div class="chips wrap">${all.map((t) => `<button class="chip ${mineT.includes(t) ? 'on' : ''}" data-a="turnon" data-r="${r}" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>
          <form class="row" data-form="turnon" data-r="${r}"><input name="t" maxlength="40" placeholder="Add your own turn-on…"><button class="btn sm">Add</button></form>`
          : mineT.length ? `<div class="muted small">🔥 ${nm(r)}'s turn-ons</div><div class="chips wrap">${mineT.map((t) => `<span class="chip on">${esc(t)}</span>`).join('')}</div>` : ''; })()}
    </div>`;
  };
  const sc = talkScores();
  return `<h2>Our profile</h2>
    ${card(online() ? S.local.role : 'A')}${card(online() ? other(S.local.role) : 'B')}
    <div class="stats">
      <div><b>🔥 ${num(S.shared.streak?.count)}</b><span>day streak</span></div>
      <div><b>${num(S.shared.points?.A) + num(S.shared.points?.B)}</b><span>love points</span></div>
      <div><b>${sc.A.score + sc.B.score}</b><span>Hot Score</span></div>
      <div><b>💞 ${desireMatches().length}</b><span>matches</span></div>
    </div>
    <p class="muted small">🔒 Photos are shrunk on your phone and shared only with your partner's phone. They are never uploaded to our server.</p>`;
}

function learnView() {
  if (ui.guide) {
    const g = C.LEARN.find((x) => x.id === ui.guide);
    if (g) return `<div class="guide"><div class="guide-head"><span>${g.icon}</span><h2>${esc(g.title)}</h2><p class="muted">${esc(g.intro)}</p></div>
      ${g.sections.map(([h, items]) => `<div class="card"><h3>${esc(h)}</h3><ul class="ticks">${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`).join('')}
      <div class="row"><button class="btn" data-a="game" data-id="desire">💞 Find out together in Desire Match</button><button class="btn ghost" data-a="tab" data-tab="positions">🌙 Positions</button></div>
      <p class="muted small">Every person is different. The best guide is your partner — ask, listen and enjoy.</p></div>`;
  }
  return `<h2>📖 Sex Guides</h2><p class="muted">Short, honest guides to make sex better for both of you.</p>
    <div class="guide-list">${C.LEARN.map((g) => `<button class="guide-card" data-a="guide" data-id="${g.id}"><span class="gi">${g.icon}</span><b>${esc(g.title)}</b><small>${esc(g.intro)}</small></button>`).join('')}
    <button class="guide-card" data-a="game" data-id="tips"><span class="gi">📚</span><b>Sex tips for couples</b><small>34 quick tips: talk, foreplay, pleasure, long distance, health, aftercare.</small></button></div>`;
}

// ---------- community ----------
const ago = (t) => { const m = Math.floor((Date.now() - t) / 6e4); return m < 1 ? 'now' : m < 60 ? m + 'm' : m < 1440 ? Math.floor(m / 60) + 'h' : Math.floor(m / 1440) + 'd'; };
async function loadComments(id) {
  try { const r = await fetch(`${API}/api/community/comments?id=${id}`); ui.cm = { id, list: (await r.json()).comments || [] }; } catch { ui.cm = { id, list: [], error: true }; }
  if (ui.tab === 'community') softRender();
}
function commentThread(id) {
  const c = ui.cm?.id === id ? ui.cm : null;
  return `<div class="thread">${!c ? '<p class="muted small">Loading…</p>' : c.list.map((m) => `<div class="cm"><b>${esc(m.handle)}</b> <small class="muted">${ago(m.created)}</small><p>${esc(m.text)}</p><button class="mini" data-a="cmReport" data-cid="${num(m.id)}">⚑</button></div>`).join('') || '<p class="muted small">No comments yet — be the first.</p>'}
    <form class="row" data-form="comment" data-id="${id}"><input name="handle" maxlength="24" placeholder="Nickname" value="${esc(S.local.cmHandle || '')}" style="max-width:110px"><input name="text" maxlength="500" placeholder="Write a comment…" required><button class="btn sm">Send</button></form></div>`;
}

async function loadCommunity() {
  ui.comm.loading = true;
  try {
    const q = new URLSearchParams({ sort: ui.comm.sort }); if (ui.comm.topic) q.set('topic', ui.comm.topic);
    const r = await fetch(`${API}/api/community?${q}`);
    ui.comm.data = await r.json();
  } catch { ui.comm.data = { stories: [], topics: [], error: true }; }
  ui.comm.loading = false;
  if (S.local.me) post('/community/mine', authBody()).then((d) => { ui.comm.mine = d.stories; if (ui.tab === 'community') softRender(); }).catch(() => {});
  if (ui.tab === 'community') softRender();
}
function communityView() {
  const d = ui.comm.data || { stories: [], topics: [] };
  const topicName = (id) => C.HOT_TOPICS.find((t) => t.id === id);
  const counts = Object.fromEntries((d.topics || []).map((t) => [t.topic, num(t.c) + num(t.l)]));
  const topics = [...C.HOT_TOPICS].sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0));
  const mine = (ui.comm.mine || []).filter((x) => x.status !== 'live');
  return `<section><div class="comm-head"><h2>🔥 Community</h2><button class="btn sm" data-a="compose">✍️ Share yours</button></div>
    <p class="muted small">Real couples, real experiences — anonymous and reviewed before they go live. 18+ only.</p>
    <h3>Hot topics this week</h3>
    <div class="chips wrap"><button class="chip ${!ui.comm.topic ? 'on' : ''}" data-a="topic" data-t="">All</button>${topics.map((t, i) => `<button class="chip ${ui.comm.topic === t.id ? 'on' : ''}" data-a="topic" data-t="${t.id}">${i < 3 && counts[t.id] ? '📈 ' : ''}${t.icon} ${t.name}</button>`).join('')}</div>
    ${ui.comm.compose ? `<form class="card compose" data-form="story">
      <b>Share your experience</b>
      <div class="row"><select name="topic">${C.HOT_TOPICS.map((t) => `<option value="${t.id}" ${ui.comm.topic === t.id ? 'selected' : ''}>${t.icon} ${t.name}</option>`).join('')}</select>
      <input name="handle" maxlength="24" placeholder="Nickname (not your real name)" required></div>
      <textarea name="text" rows="5" minlength="30" maxlength="2000" required placeholder="What happened, what you loved, what you learned…"></textarea>
      <ul class="rules small muted"><li>Only consenting adults (18+). Never real names.</li><li>No phone numbers, links, social handles or offers.</li><li>Every story is reviewed before it is published.</li></ul>
      <label class="check small"><input type="checkbox" required> I agree to the community rules.</label>
      <div class="row"><button class="btn">Send for review</button><button type="button" class="btn ghost" data-a="compose">Cancel</button></div></form>` : ''}
    ${mine.length ? `<div class="card"><b>Your stories</b>${mine.map((x) => `<div class="li"><span>${esc(String(x.text).slice(0, 70))}…</span><span class="tag">${x.status === 'pending' ? '⏳ In review' : '✕ Not approved'}</span></div>`).join('')}</div>` : ''}
    <div class="seg"><button class="${ui.comm.sort === 'trending' ? 'on' : ''}" data-a="sort" data-s="trending">📈 Trending</button><button class="${ui.comm.sort === 'new' ? 'on' : ''}" data-a="sort" data-s="new">🆕 New</button></div>
    <div class="feed">${ui.comm.loading && !ui.comm.data ? '<p class="muted center">Loading…</p>' : d.error ? '<p class="muted center">Can\'t load right now. Check your internet.</p>'
      : (d.stories || []).map((x) => { const t = topicName(x.topic); const liked = S.local.liked?.[x.id]; return `<article class="story">
        <div class="row between"><span class="story-meta"><b>${esc(x.handle)}</b> · ${ago(x.created)}</span>${t ? `<span class="tag">${t.icon} ${t.name}</span>` : ''}</div>
        <p>${esc(x.text)}</p>
        <div class="row between"><span class="row" style="margin:0;gap:6px"><button class="chip ${liked ? 'on' : ''}" data-a="storyLike" data-id="${num(x.id)}">🔥 ${num(x.likes)}</button><button class="chip ${ui.openCm === num(x.id) ? 'on' : ''}" data-a="cmToggle" data-id="${num(x.id)}">💬 ${num(x.comments)}</button></span><button class="mini" data-a="storyReport" data-id="${num(x.id)}">⚑ Report</button></div>
        ${ui.openCm === num(x.id) ? commentThread(num(x.id)) : ''}</article>`; }).join('') || `<div class="card center"><p><b>No stories here yet.</b></p><p class="muted small">Be the first couple to share — tap ✍️ Share yours.</p></div>`}</div></section>`;
}

function meetupView() {
  const mu = S.shared.meetup || {}, plan = (S.shared.plan || []).map((id) => C.POSITIONS.find((p) => p.id === id)).filter(Boolean);
  return `<div class="card center"><div class="muted small">Countdown</div><div class="count" data-countdown="${esc(mu.when || '')}">${mu.when ? countdown(mu.when) : '—'}</div></div>
    <form class="card" data-form="meetup">
      <label>When<input type="datetime-local" name="when" value="${esc(mu.when || '')}"></label>
      <label>Where<input name="place" maxlength="80" placeholder="Your place, a hotel, the airport…" value="${esc(mu.place || '')}"></label>
      <label>Vibe<select name="vibe">${['', ...C.DATE_IDEAS.vibe].map((v) => `<option ${mu.vibe === v ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label>
      <label>Outfit / dress code<input name="outfit" maxlength="80" placeholder="Something red… or nothing" value="${esc(mu.outfit || '')}"></label>
      <label>Plan & secret notes<textarea name="notes" rows="4" maxlength="2000" placeholder="Dinner first, then…">${esc(mu.notes || '')}</textarea></label>
    </form>
    <div class="card"><b>🎒 Things to bring</b>
      <div class="list">${(mu.bring || []).map((b, i) => `<label class="li check"><input type="checkbox" data-a="bring" data-i="${i}" ${b.done ? 'checked' : ''}><span>${esc(b.text)}</span><button class="mini" data-a="bringDel" data-i="${i}">✕</button></label>`).join('')}</div>
      <form class="row" data-form="bring"><input name="t" maxlength="60" placeholder="Candles, oil, that outfit…"><button class="btn sm">Add</button></form></div>
    <div class="card"><b>🌙 Positions for this meet-up</b>${plan.length ? `<ol>${plan.map((p) => `<li>${esc(p.name)}</li>`).join('')}</ol>` : '<p class="muted small">Pick some in the Positions tab.</p>'}</div>
    <div class="row"><button class="btn" data-a="ics" ${mu.when ? '' : 'disabled'}>📆 Add to calendar</button><button class="btn ghost" data-a="tab" data-tab="positions">Plan positions →</button></div>`;
}

function ideasView() {
  const i = ui.idea;
  return `<div class="card center">${i ? `<div class="muted small">Your date</div><p class="big-line">A <b>${esc(i.vibe.toLowerCase())}</b> date <b>${esc(i.place)}</b>, where <b>${esc(i.twist)}</b>.</p>
    ${i.dare ? `<p class="small">🌙 Mission: ${esc(i.dare)}</p>` : ''}` : '<p>Stuck for ideas? Generate a date in one tap.</p>'}
    <div class="row center"><button class="btn" data-a="idea">✨ ${i ? 'Another' : 'Generate a date'}</button>${i ? '<button class="btn ghost" data-a="ideaSave">📌 Use for meet-up</button>' : ''}</div></div>
    <button class="btn ghost wide" data-a="game" data-id="dates">More missions in Naughty Date Dares →</button>`;
}

function futureView() {
  const list = S.shared.future || [];
  const prompt = C.FUTURE_PROMPTS[Math.floor(Date.now() / 864e5) % C.FUTURE_PROMPTS.length];
  const groups = [['year', 'This year'], ['mid', '1–3 years'], ['long', '5+ years']];
  return `<div class="card spark"><div class="muted small">Talk about tonight</div><p>${esc(prompt)}</p></div>
    <form class="card" data-form="future"><b>Add a dream or goal</b>
      <div class="row"><select name="cat">${C.FUTURE_CATS.map((c) => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}</select>
      <select name="hz">${groups.map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></div>
      <div class="row"><input name="text" maxlength="120" required placeholder="Trip to Bali, our own flat, a puppy…"><button class="btn sm">Add</button></div></form>
    ${groups.map(([k, l]) => {
      const items = list.filter((f) => f.hz === k);
      return `<h3>${l}</h3><div class="list">${items.map((f) => `<label class="li check"><input type="checkbox" data-a="futureDone" data-id="${esc(f.id)}" ${f.done ? 'checked' : ''}><span class="${f.done ? 'strike' : ''}">${C.FUTURE_CATS.find((c) => c.id === f.cat)?.icon || '❤️'} ${esc(f.text)}</span><button class="mini" data-a="futureDel" data-id="${esc(f.id)}">✕</button></label>`).join('') || '<p class="muted small">Nothing yet.</p>'}</div>`;
    }).join('')}`;
}

function bucketView() {
  const b = S.shared.bucket || {};
  const items = [...C.BUCKET.map((x, i) => ({ id: 'B' + i, heat: x[0], text: x[1] })), ...(S.shared.customBucket || []).map((x) => ({ id: x.id, heat: 0, text: x.text }))]
    .filter((x) => x.heat <= S.shared.heat);
  const done = items.filter((x) => b[x.id]?.done).length;
  return `<div class="card"><b>🔥 Hot experiences</b><div class="bar"><i style="width:${items.length ? (done / items.length) * 100 : 0}%"></i></div><small class="muted">${done} / ${items.length} done</small></div>
    <div class="list">${items.map((x) => `<label class="li check"><input type="checkbox" data-a="bucket" data-id="${esc(x.id)}" ${b[x.id]?.done ? 'checked' : ''}><span class="${b[x.id]?.done ? 'strike' : ''}">${x.heat ? heatInfo(x.heat).icon : '⭐'} ${esc(x.text)}</span>${b[x.id]?.date ? `<small class="muted">${esc(b[x.id].date)}</small>` : ''}</label>`).join('')}</div>
    <form class="row" data-form="bucket"><input name="t" maxlength="100" required placeholder="Add your own experience…"><button class="btn sm">Add</button></form>`;
}

function connectView() {
  const link = net.code ? `${location.origin}${location.pathname}#join=${net.code}` : '';
  const st = { offline: 'Not connected', joining: 'Connecting…', waiting: 'Waiting for your partner…', connected: 'Connected' }[online() ? 'connected' : net.status] || net.status;
  const me = S.local.me, p = S.local.partner;
  if (!me && !ui.numberAsked) { ui.numberAsked = true; ensureNumber().then(() => { openInbox(); softRender(); }).catch(() => softRender()); }
  const numLink = me ? `${location.origin}${location.pathname}#love=${me.number}` : '';
  return `<section><h2>Connect</h2>
    <div class="card status ${online() ? 'live' : ''}"><div><b>${online() ? '🟢' : net.status === 'offline' ? '⚪' : '🟡'} ${st}</b>${online() ? `<p class="small muted">Live with ${nm(other(S.local.role))}. Everything syncs.</p>` : net.room.startsWith('pair:') ? '<p class="small muted">You\'ll connect as soon as your partner opens the app.</p>' : ''}</div>
      ${net.status !== 'offline' || online() ? '<button class="btn sm ghost" data-a="leave">Leave</button>' : ''}</div>
    ${online() ? `
      <div class="row call-row"><button class="btn big" data-a="call" data-video="1">📹 Video call</button><button class="btn big ghost" data-a="call" data-video="0">📞 Voice call</button></div>
      <div class="react-row">${['❤️', '😘', '🔥', '😈', '🥵', '💦'].map((e) => `<button class="mini big" data-a="react" data-e="${e}">${e}</button>`).join('')}</div>
      <div class="card chat"><div class="msgs" id="msgs">${S.local.chat.map((c) => `<div class="msg ${c.from === S.local.role ? 'mine' : ''}">${esc(c.text)}</div>`).join('') || '<p class="muted small center">Say something sweet… or naughty.</p>'}</div>
      <form class="row" data-form="chat"><input name="m" maxlength="1000" autocomplete="off" placeholder="Message ${nm(other(S.local.role))}"><button class="btn sm">Send</button></form></div>` : ''}
    <div class="card love">
      <b>💞 Love Number</b>
      ${p ? `<p>Paired with <b>${esc(p.name)}</b> · ${esc(fmtNum(p.number))}</p><p class="small muted">Your phones reconnect automatically whenever you both open the app.</p>
        <div class="row">${net.room.startsWith('pair:') ? '' : '<button class="btn sm" data-a="reconnect">Reconnect</button>'}<button class="btn sm ghost" data-a="unpair">Unpair</button></div>`
      : `<p class="small muted">Like a phone number for your relationship. Give yours to your partner, or enter theirs. Connect once — reconnect forever.</p>
        <div class="muted small">Your Love Number</div>
        ${me ? `<div class="code num">${esc(fmtNum(me.number))}</div><div class="row"><button class="btn sm" data-a="share" data-link="${esc(numLink)}" data-text="Connect with me on Intimacy for Couples 💞 My Love Number: ${esc(fmtNum(me.number))}">📤 Share my number</button><button class="btn sm ghost" data-a="copy" data-link="${esc(me.number)}">Copy</button></div>`
          : '<div class="row"><button class="btn sm" data-a="getNumber">Get my Love Number</button></div>'}
        <form class="row" data-form="ring"><input name="to" inputmode="numeric" maxlength="9" placeholder="Partner's Love Number" value="${esc(ui.ringTo || '')}"><button class="btn">Connect</button></form>
        ${ui.ringing ? '<p class="small muted">💌 Request sent. It shows on your partner\'s phone — they tap Accept.</p>' : ''}`}
    </div>
    ${online() || p ? '' : net.host && net.code ? `
      <div class="card center"><div class="muted small">Quick room code</div><div class="code">${esc(net.code)}</div>
      <p class="small">Send this to your partner. They tap <b>Join</b> and enter it.</p>
      <div class="row center"><button class="btn sm" data-a="share" data-link="${esc(link)}" data-text="Join me on Intimacy for Couples 💞 Room code: ${esc(net.code)}">📤 Share invite</button><button class="btn sm ghost" data-a="copy" data-link="${esc(link)}">Copy link</button></div></div>`
    : `
      <div class="card"><b>⚡ Quick room</b><p class="small muted">No number needed — one of you creates a room, the other joins with the code. Good for a one-off session.</p>
      <button class="btn ghost wide" data-a="create">Create a room</button>
      <form class="row" data-form="join"><input name="code" maxlength="6" placeholder="Room code" value="${esc(ui.joinCode || '')}" style="text-transform:uppercase"><button class="btn ghost">Join</button></form></div>`}
    <h3>Settings</h3>
    <form class="card" data-form="settings">
      <div class="row"><label>Player 1<input name="a" maxlength="30" value="${esc(S.shared.players.A.name)}"></label><label>Player 2<input name="b" maxlength="30" value="${esc(S.shared.players.B.name)}"></label></div>
      <label>Safe word<input name="safe" maxlength="20" value="${esc(S.shared.safeWord)}"></label>
      <label class="check"><input type="checkbox" name="fx" ${S.local.fx === false ? '' : 'checked'}> Steamy effects (floating embers & hearts)</label>
      <label>App lock PIN <small class="muted">(4–8 digits, blank = off)</small><input name="pin" inputmode="numeric" pattern="[0-9]{4,8}" maxlength="8" placeholder="${S.local.pin ? '•••• (set)' : 'Off'}"></label>
      <button class="btn">Save settings</button>
    </form>
    <div class="row"><button class="btn ghost sm" data-a="export">⬇ Backup</button><label class="btn ghost sm">⬆ Restore<input type="file" accept="application/json" data-a="import" hidden></label><button class="btn ghost sm" data-a="unhide">Unhide cards</button><button class="btn danger sm" data-a="reset">Erase everything</button></div>
    <p class="muted small">🔒 No email, no phone number, no tracking. Games, answers and chats stay on your phones — the server only passes live messages between you and never stores them. Voice and video go directly phone-to-phone. Press Esc or 🙈 to hide the app instantly. <a href="/privacy/">Privacy</a></p></section>`;
}

// Steamy ambience: floating embers / hearts behind the app, more as the heat rises.
let ambHeat = -1;
function ambience() {
  const box = $('#ambience'); if (!box) return;
  const h = S.local.fx === false ? 0 : S.shared.heat;
  if (h === ambHeat) return; ambHeat = h;
  const n = [0, 5, 7, 10, 14, 18][h] || 0;
  box.innerHTML = Array.from({ length: n }, (_, i) => {
    const heart = h <= 2 || i % 4 === 0;
    return `<span class="${heart ? 'amb-heart' : 'ember'}" style="left:${Math.round(Math.random() * 100)}%;animation-duration:${(8 + Math.random() * 10).toFixed(1)}s;animation-delay:-${(Math.random() * 14).toFixed(1)}s;--s:${(0.5 + Math.random() * 0.9).toFixed(2)}">${heart ? '♥' : ''}</span>`;
  }).join('');
}

function renderPause() {
  const p = $('#pause');
  if (!S.shared.paused) { p.hidden = true; return; }
  p.hidden = false;
  p.innerHTML = `<div class="sheet center"><div class="logo-big">🛑</div><h2>Paused</h2>
    <p>The safe word <b>${esc(S.shared.safeWord)}</b> was called. Everything stops — no questions, no pressure.</p>
    <div class="list">${C.AFTERCARE.map((a) => `<div class="li">💗 ${esc(a)}</div>`).join('')}</div>
    <div class="row center"><button class="btn" data-a="resume">We're good — continue</button><button class="btn ghost" data-a="softer">Lower the heat</button></div></div>`;
}

// live countdowns and timers
function tick() {
  if (ui.tab === 'games' && ui.game === 'marathon') {
    const g = G();
    if (g.list?.length && g.startAt) {
      const per = num(g.interval) * 1000, el = $('[data-mleft]'), idx = Math.floor((Date.now() - num(g.startAt)) / per);
      if (ui.mIdx !== undefined && idx !== ui.mIdx) { ui.mIdx = idx; beep(); render(); return; }
      ui.mIdx = idx;
      if (el) el.textContent = fmtDur(per - ((Date.now() - num(g.startAt)) % per));
    }
  }
  document.querySelectorAll('[data-countdown]').forEach((el) => { if (el.dataset.countdown) el.textContent = countdown(el.dataset.countdown); });
  document.querySelectorAll('[data-timer]').forEach((el) => {
    const end = Number(el.dataset.timer);
    if (!end) return;
    const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    el.textContent = el.dataset.fmt === 'mmss' ? (left ? fmtDur(left * 1000) : "Time's up!") : left;
    el.classList.toggle('low', left <= 10);
    if (left === 0 && !el._done) { el._done = true; if (el.dataset.roulette) { beep(); if (G().auto && (!online() || S.local.role === 'A')) A.rouSpin(null, null, true); else render(); } else if (el.dataset.fmt === 'mmss') { floatEmoji('🏆'); render(); } else hotseatOver(); }
  });
}
setInterval(tick, 1000);
function hotseatOver() {
  const g = G();
  if (g.kind !== 'hotseat' || g.scored) { render(); return; }
  // Only the device whose player was in the seat (or the single device) scores, so points aren't doubled.
  if (!online() || S.local.role === g.turn) { addPoints(g.turn, (g.count || 0) * 2); setGame({ scored: true, card: null }); } else render();
}

// ---------- actions ----------
const A = {
  tab: (el) => { const same = ui.tab === el.dataset.tab; ui.tab = el.dataset.tab; if (ui.tab !== 'games' || same) { ui.game = null; ui.posSwipe = false; ui.rp = null; ui.story = null; } if (ui.tab === 'community') ui.comm.data = null; render(); window.scrollTo(0, 0); },
  game: (el) => openGame(el.dataset.id),
  back: () => { ui.game = null; render(); },
  plan: (el) => { ui.tab = 'us'; ui.usTab = el.dataset.sub; render(); window.scrollTo(0, 0); },
  us: (el) => { ui.tab = 'us'; ui.usTab = el.dataset.sub; ui.game = null; render(); window.scrollTo(0, 0); },
  guide: (el) => { ui.guide = el.dataset.id || null; render(); window.scrollTo(0, 0); },
  openGuide: (el) => { ui.tab = 'games'; ui.game = 'learn'; ui.guide = el.dataset.id; render(); window.scrollTo(0, 0); },
  mood: (el) => { const r = el.dataset.r; if (!canAct(r)) return; const cur = S.shared.players[r]?.mood; set(['players', r, 'mood'], cur === el.dataset.m ? null : el.dataset.m); },
  photoDel: (el) => { if (canAct(el.dataset.r)) set(['players', el.dataset.r, 'photo'], null); },
  turnon: (el) => {
    const r = el.dataset.r; if (!canAct(r)) return;
    const cur = [...(S.shared.turnons?.[r] || [])], t = el.dataset.t, i = cur.indexOf(t);
    if (i >= 0) cur.splice(i, 1); else cur.push(t);
    set(['turnons', r], cur.slice(0, 30));
  },
  wishOpen: () => { const tg = gOf(other(me())); const wants = tg === 'f' ? C.WANTS_FROM_HER : tg === 'm' ? C.WANTS_FROM_HIM : [...C.WANTS_FROM_HER, ...C.WANTS_FROM_HIM]; return modal(`<h3>💌 What you want from ${nm(other(me()))}</h3><p class="muted small">${nm(other(me()))} gets it instantly and can say yes.</p>
    <div class="chips wrap">${wants.map((q) => `<button class="chip" data-a="wishSend" data-t="${esc(q)}">${esc(q)}</button>`).join('')}</div>
    <div class="muted small" style="margin-top:6px">More ideas</div>
    <div class="chips wrap">${C.REQUESTS.map((q) => `<button class="chip" data-a="wishSend" data-t="${esc(q)}">${esc(q)}</button>`).join('')}</div>
    <form class="row" data-form="wish"><input name="t" maxlength="120" placeholder="Or write your own wish…" required><button class="btn sm">Send</button></form>
    <button class="btn ghost wide" data-a="close">Close</button>`); },
  wishSend: (el) => sendWish(el.dataset.t),
  wishReply: (el) => { const p = other(me()); if (!S.shared.requests?.[p]) return; set(['requests', p, 'reply'], el.dataset.v); if (el.dataset.v === 'yes') floatEmoji('😘'); },
  posOpen: (el, e) => { if (e?.target?.closest('[data-a="planToggle"]') && el.dataset.a === 'posOpen') return; modal(posDetail(el.dataset.id)); },
  tonightAsk: () => { set(['tonight'], { from: me(), ts: Date.now(), reply: null }); floatEmoji('🔥'); toast(`🔥 Sent "Tonight?" to ${S.shared.players[other(me())]?.name || 'your partner'}`); },
  tonightReply: (el) => { if (!S.shared.tonight) return; set(['tonight', 'reply'], el.dataset.v); if (el.dataset.v === 'yes') floatEmoji('😏'); },
  rouSpin: (el, e, auto) => {
    const id = pickPositions(12)[Math.floor(Math.random() * Math.min(12, C.POSITIONS.length))] || 'p1';
    const spin = { pos: id, spot: rnd(C.DICE_PLACE), speed: rnd(C.ROULETTE_SPEED), extra: rnd(C.ROULETTE_EXTRA), secs: rnd([60, 90, 120, 180]), n: Date.now() };
    setGame({ spin, endsAt: auto ? Date.now() + spin.secs * 1000 : 0 }); beep();
  },
  rouStart: () => { const g = G(); if (g.spin) setGame({ endsAt: Date.now() + num(g.spin.secs) * 1000 }); },
  mSet: (el) => { ui[el.dataset.k] = Number(el.dataset.v); render(); },
  mStart: () => { const list = pickPositions(ui.mN || 6); setGame({ list, interval: (ui.mMin || 2) * 60, startAt: Date.now() }); ui.mIdx = 0; beep(); },
  mSkip: () => { const g = G(); const per = num(g.interval) * 1000, idx = Math.floor((Date.now() - num(g.startAt)) / per); setGame({ startAt: Date.now() - (idx + 1) * per }); },
  mStop: () => setGame({ list: [], startAt: 0 }),
  rpOpen: (el) => { ui.rp = el.dataset.id || null; render(); window.scrollTo(0, 0); },
  rpSend: (el) => { const rp = C.ROLEPLAYS.find((x) => x.id === el.dataset.id); sendWish(`Role-play tonight: ${rp.title} ${rp.icon}`); },
  dSet: (el) => { ui.diary = ui.diary || { place: 'Bed', pos: [], rating: 4 }; ui.diary[el.dataset.k] = el.dataset.k === 'rating' ? Number(el.dataset.v) : el.dataset.v; render(); },
  dPos: (el) => { ui.diary.pos = ui.diary.pos.filter((x) => x !== el.dataset.id); render(); },
  dDel: (el) => { if (confirm('Delete this entry?')) set(['diary', el.dataset.id], null); },
  cmToggle: (el) => { const id = Number(el.dataset.id); ui.openCm = ui.openCm === id ? null : id; if (ui.openCm) loadComments(id); else render(); },
  cmReport: async (el) => { if (!confirm('Report this comment?')) return; try { await ensureNumber(); await post('/community/comment-report', authBody({ cid: Number(el.dataset.cid) })); toast('Thanks — reported'); } catch (e) { toast(e.message); } },
  photoDraw: () => { const c = draw(C.PHOTO_DARES, 'F'); if (!c) return toast('Raise the heat for more dares'); setGame({ card: c, answer: null, done: false }); },
  photoDone: () => { const g = G(); if (g.done) return; addPoints(g.turn || 'A', 10); floatEmoji('📸'); setGame({ done: true }); },
  photoView: (el) => openPhoto(el.dataset.id),
  photoReveal: (el) => { el.classList.remove('blurred'); const t = el.querySelector('.pv-tap'); if (t) t.remove(); const id = $('#modal [data-a=photoClose]')?.dataset.id; if (id) send({ t: 'photoSeen', id }); },
  photoReact: (el) => { const x = photoInbox.find((p) => p.id === el.dataset.id); if (!x || x.reacted) return; x.reacted = true; send({ t: 'photoReact', id: x.id, e: el.dataset.e }); if (el.dataset.e === '🔥') addPoints(other(S.local.role), 15); floatEmoji(el.dataset.e); el.classList.add('on'); },
  photoClose: (el) => { const i = photoInbox.findIndex((p) => p.id === el.dataset.id); if (i >= 0 && photoInbox[i].once) photoInbox.splice(i, 1); closeModal(); render(); },
  chTab: (el) => { ui.chTab = el.dataset.t; render(); },
  chDraw: () => { const pool = C.CHALLENGES.map((c) => [c[0], c[1], c[2]]); const c = draw(pool.map((x) => [x[0], x[1] + '|' + x[2]]), 'C'); if (!c) return; const [text, secs] = c.text.split('|'); setGame({ card: { id: c.id, heat: c.heat, text, secs: Number(secs) }, endsAt: 0 }); },
  chStart: () => { const g = G(); if (!g.card) return; setGame({ endsAt: Date.now() + num(g.card.secs) * 1000 }); },
  chDone: () => { addPoints('A', 20); addPoints('B', 20); floatEmoji('🏆'); toast('🏆 Challenge complete! +20 each'); setGame({ card: null, endsAt: 0 }); },
  progStart: (el) => { set(['program'], { id: el.dataset.id, start: localDate(), done: {} }); floatEmoji('🔥'); },
  progDay: (el) => { set(['program', 'done', el.dataset.i], el.checked ? true : null); if (el.checked) { addPoints(me(), 10); floatEmoji('🔥'); } },
  progQuit: () => { if (confirm('Leave this challenge?')) set(['program'], null); },
  dressOpen: () => {
    const tgt = other(me()), tg = gOf(tgt);
    const cats = C.OUTFITS.filter((c) => !tg || tg === 'x' || c.for === tg);
    ui.dress = ui.dress || { cat: cats[0].id, picks: [] };
    const d = ui.dress, cat = cats.find((c) => c.id === d.cat) || cats[0];
    modal(`<h3>${tg === 'm' ? '🕴️' : '👗'} Dress ${nm(tgt)} for tonight</h3><p class="muted small">Choose what you want ${pron(tgt)} wearing — it arrives as a wish ${pron(tgt)} can say yes to.</p>
      <div class="chips">${cats.map((c) => `<button class="chip ${c.id === d.cat ? 'on' : ''}" data-a="dressCat" data-c="${c.id}">${c.icon} ${c.name}</button>`).join('')}</div>
      <div class="chips wrap">${cat.opts.map((o) => `<button class="chip ${d.picks.includes(o) ? 'on' : ''}" data-a="dressPick" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div>
      <div class="muted small" style="margin-top:8px">${tg === 'm' ? '🧔 Grooming & scent' : '💄 Makeup, hair & grooming'}</div>
      <div class="chips wrap">${C.MAKEUP.filter((o) => { const male = ['Fresh shave', 'Light stubble', 'Cologne I love']; return tg === 'm' ? male.includes(o) : tg === 'f' ? !male.includes(o) : true; }).map((o) => `<button class="chip ${d.picks.includes(o) ? 'on' : ''}" data-a="dressPick" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div>
      <button class="btn wide" data-a="dressSend" ${d.picks.length ? '' : 'disabled'}>Send: ${d.picks.length ? esc(d.picks.join(' + ')) : 'pick something'} 💌</button>
      <button class="btn ghost wide" data-a="close">Close</button>`);
  },
  dressCat: (el) => { ui.dress.cat = el.dataset.c; A.dressOpen(); },
  dressPick: (el) => { const d = ui.dress, o = el.dataset.o; d.picks = d.picks.includes(o) ? d.picks.filter((x) => x !== o) : [...d.picks, o].slice(-4); A.dressOpen(); },
  dressSend: () => { const d = ui.dress; if (!d?.picks.length) return; sendWish(`Wear tonight: ${d.picks.join(' + ')} ${gOf(other(me())) === 'm' ? '🕴️' : '👗'}`); ui.dress = null; },
  gender: (el) => { const r = el.dataset.r; if (!canAct(r)) return; if (r === me()) S.local.myG = el.dataset.g; ui.dress = null; set(['players', r, 'g'], el.dataset.g); },
  shareApp: async () => {
    const url = location.origin + '/?ref=share';
    const text = 'We found the hottest game for couples 🔥 Truth or dare, fantasies, positions & more — free and private. Try it with your partner:';
    if (navigator.share) { try { await navigator.share({ title: 'Intimacy for Couples', text, url }); return; } catch { /* cancelled */ } }
    window.open('https://wa.me/?text=' + encodeURIComponent(text + ' ' + url), '_blank', 'noopener');
  },
  install: async () => { if (!installEvt) return; installEvt.prompt(); try { await installEvt.userChoice; } catch { /* */ } installEvt = null; render(); },
  storyCat: (el) => { ui.storyCat = el.dataset.c; render(); },
  storyOpen: (el) => { ui.tab = 'games'; ui.game = 'stories'; ui.story = el.dataset.id || null; render(); window.scrollTo(0, 0); },
  storyAsk: (el) => { const st = C.STORIES.find((x) => x.id === el.dataset.id); ui.talkDraft = `Just read "${st.title}"… what part would you want to do with me? `; openGame('talk'); },
  storyShare: (el) => { ui.tab = 'community'; ui.comm.topic = el.dataset.t; ui.comm.compose = true; ui.comm.data = null; render(); window.scrollTo(0, 0); },
  posSwipe: () => { ui.posSwipe = !ui.posSwipe; render(); window.scrollTo(0, 0); },
  labTab: (el) => { ui.labTab = el.dataset.t; render(); window.scrollTo(0, 0); },
  labPick: (el) => {
    const r = me(), d = draftFor(r), c = C.FANTASY_LAB.find((x) => x.id === el.dataset.c); if (!c) return;
    const cur = d.picks[c.id] || [], o = el.dataset.o;
    d.picks[c.id] = c.multi ? (cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o]) : (cur.includes(o) ? [] : [o]);
    save(); render();
  },
  labReveal: () => {
    const r = me(), d = draftFor(r), ta = $('[data-lab-text]'); if (ta) d.text = ta.value.slice(0, 1500);
    if (!Object.values(d.picks).some((v) => v.length) && !d.text.trim()) return toast('Pick a few things first 😉');
    set(['fantasies', r], { picks: d.picks, text: d.text, ts: Date.now() }); save();
    toast(`✨ Fantasy revealed to ${S.shared.players[other(r)]?.name || 'your partner'}`); floatEmoji('✨');
  },
  labReact: (el) => { set(['fantasyReact', me()], el.dataset.v); if (el.dataset.v === 'yes') floatEmoji('🔥'); },
  labPlan: () => {
    const f = S.shared.fantasies?.[other(me())]; if (!f) return;
    const line = C.FANTASY_LAB.filter((c) => f.picks?.[c.id]?.length).map((c) => f.picks[c.id].join(', ')).join(' · ');
    appendNote(`✨ ${S.shared.players[other(me())]?.name || 'Partner'}'s fantasy: ${line}`);
  },
  labNext: () => { ui.labQ = (ui.labQ || 0) + 1; render(); },
  labAnswer: (el) => { ui.talkDraft = el.dataset.q + '\n'; openGame('talk'); },
  compose: () => { ui.comm.compose = !ui.comm.compose; render(); },
  topic: (el) => { ui.comm.topic = el.dataset.t; ui.comm.data = null; render(); },
  sort: (el) => { ui.comm.sort = el.dataset.s; ui.comm.data = null; render(); },
  storyLike: async (el) => {
    try {
      await ensureNumber();
      const id = Number(el.dataset.id), d = await post('/community/like', authBody({ id }));
      S.local.liked = S.local.liked || {}; if (d.liked) S.local.liked[id] = 1; else delete S.local.liked[id]; save();
      const st = ui.comm.data?.stories?.find((x) => x.id === id); if (st) st.likes = num(st.likes) + (d.liked ? 1 : -1);
      if (d.liked) floatEmoji('🔥'); render();
    } catch (e) { toast(e.message); }
  },
  storyReport: async (el) => {
    if (!confirm('Report this story? It will be hidden for review if others report it too.')) return;
    try { await ensureNumber(); await post('/community/report', authBody({ id: Number(el.dataset.id) })); toast('Thanks — reported'); } catch (e) { toast(e.message); }
  },
  heat: () => modal(`<h3>Choose the heat</h3><div class="heat-pick">${C.HEAT.map((h) => `<button class="heat-opt btnlike ${S.shared.heat === h.level ? 'on' : ''}" data-a="setHeat" data-h="${h.level}"><span>${h.icon}<b>${h.name}</b><small>${h.hint}</small></span></button>`).join('')}</div><p class="muted small">Both of you see the same heat. Anyone can turn it down anytime.</p><button class="btn ghost wide" data-a="close">Close</button>`),
  setHeat: (el) => { closeModal(); document.body.classList.remove('heat-flash'); void document.body.offsetWidth; document.body.classList.add('heat-flash'); setTimeout(() => document.body.classList.remove('heat-flash'), 900); set(['heat'], Number(el.dataset.h)); toast(`Heat: ${heatInfo(Number(el.dataset.h)).icon} ${heatInfo(Number(el.dataset.h)).name}`); },
  close: closeModal,
  tod: (el) => todDraw(el.dataset.type),
  todDone: () => { const g = G(); if (g.done) return; addPoints(g.turn || 'A', 10); floatEmoji('🔥'); setGame({ done: true }); },
  todNext: () => nextTurn(),
  todSkip: () => nextTurn(),
  todLove: () => { const g = G(); if (g.loved || !g.answer || !canAct(other(g.turn || 'A'))) return; addPoints(g.turn || 'A', 5); floatEmoji('🔥'); setGame({ loved: true }); },
  hide: (el) => { set(['hidden', el.dataset.id], true, { quiet: true }); toast('Card removed for good'); setGame({ card: null, ans: {} }); },
  unhide: () => { set(['hidden'], {}); toast('All hidden cards are back'); },
  swiper: (el) => { S.local.swiper = el.dataset.r; save(); render(); },
  desire: (el) => {
    const r = me(); set(['desire', r, el.dataset.id], el.dataset.v, { quiet: true });
    render();
    const o = S.shared.desire?.[other(r)]?.[el.dataset.id];
    if ((el.dataset.v === 'yes' || el.dataset.v === 'maybe') && (o === 'yes' || o === 'maybe')) { toast('💞 It\'s a match!'); floatEmoji('💞'); }
    bumpStreak();
  },
  desireReset: () => { if (confirm('Clear your Desire Match answers?')) set(['desire', me()], {}); },
  diceRoll: () => setGame({ roll: { a: rnd(C.DICE_ACTION), p: rnd(C.DICE_PLACE), d: rnd(C.DICE_TIME), n: Date.now() } }),
  diceDone: () => { addPoints(G().turn || 'A', 5); nextTurn(); },
  place: (el) => { ui.place = el.dataset.p; setGame({ card: null }); },
  dateDraw: () => { const c = draw(C.DATE_DARES, 'M', (x) => x[1] === ui.place); if (!c) return toast('Raise the heat for more missions'); setGame({ card: c }); },
  dateSave: () => appendNote('🌙 Mission: ' + G().card?.text),
  cardDraw: (el) => {
    const c = el.dataset.pool === 'never' ? draw(C.NEVER, 'N') : draw(C.RATHER, 'R');
    if (!c) return toast('No more cards at this heat');
    setGame({ card: c, ans: {} });
  },
  ans: (el) => {
    const r = el.dataset.r; if (!canAct(r)) return;
    const ans = { ...(G().ans || {}), [r]: el.dataset.v };
    setGame({ ans });
    if (bothIn(ans) && G().kind === 'rather' && ans.A === ans.B && (!online() || S.local.role === 'A')) { addPoints('A', 5); addPoints('B', 5); floatEmoji('💞'); }
  },
  hsStart: () => setGame({ endsAt: Date.now() + 60000, count: 0, scored: false, card: draw(C.HOTSEAT, 'H') }),
  hsNext: () => setGame({ count: (G().count || 0) + 1, card: draw(C.HOTSEAT, 'H') }),
  hsSwap: () => setGame({ turn: other(G().turn || 'A'), endsAt: 0, count: 0, card: null, scored: false }),
  fzNew: () => setGame({ fantasy: Object.fromEntries(Object.entries(C.FANTASY).map(([k, v]) => [k, rnd(v)])) }),
  fzSwap: (el) => { const f = { ...G().fantasy }; const k = el.dataset.k; const opts = C.FANTASY[k].filter((x) => x !== f[k]); f[k] = rnd(opts); setGame({ fantasy: f }); },
  fzSave: () => { const f = G().fantasy; appendNote(`✨ Fantasy: ${f.setting}, as ${f.roles}, ${f.mood}. Rule: ${f.rule}.`); },
  starter: (el) => { ui.talkDraft = el.dataset.t + ' '; render(); const t = $('form[data-form="talk"] textarea'); t?.focus(); t?.setSelectionRange(t.value.length, t.value.length); },
  tipCat: (el) => { ui.tipCat = el.dataset.c; render(); },
  talkLike: (el) => {
    const id = el.dataset.id, m = S.shared.talk?.[id]; if (!m) return;
    const r = me(); if (m.from === r) return;
    const on = !(m.likes && m.likes[r]);
    set(['talk', id, 'likes', r], on ? 1 : null, { quiet: true });
    if (on) { addPoints(m.from, 10); floatEmoji('🔥'); toast(`+10 for ${S.shared.players[m.from]?.name || 'your partner'} 🔥`); }
    render();
  },
  posFilter: (el) => { ui.posFilter = el.dataset.f; render(); },
  posVote: (el) => {
    const r = me(), id = el.dataset.id, cur = S.shared.pos?.[id]?.[r];
    set(['pos', id, r], cur === el.dataset.v ? null : el.dataset.v);
    const v = S.shared.pos?.[id] || {};
    if (v.A === 'want' && v.B === 'want' && el.dataset.v === 'want') { toast('✨ You both want this one!'); floatEmoji('✨'); }
  },
  posTried: (el) => { const id = el.dataset.id; set(['pos', id, 'tried'], !S.shared.pos?.[id]?.tried); },
  planToggle: (el) => {
    const id = el.dataset.id, plan = [...(S.shared.plan || [])];
    const i = plan.indexOf(id); if (i >= 0) plan.splice(i, 1); else plan.push(id);
    set(['plan'], plan);
  },
  planAdd: (el) => { closeModal(); if (!(S.shared.plan || []).includes(el.dataset.id)) set(['plan'], [...(S.shared.plan || []), el.dataset.id]); toast('Added to tonight\'s playlist 🌙'); },
  surprise: () => {
    const both = C.POSITIONS.filter((p) => S.shared.pos?.[p.id]?.A === 'want' && S.shared.pos?.[p.id]?.B === 'want');
    const pool = both.length ? both : C.POSITIONS.filter((p) => S.shared.pos?.[p.id]?.A !== 'no' && S.shared.pos?.[p.id]?.B !== 'no');
    if (!pool.length) return toast('Vote on some positions first');
    const p = rnd(pool);
    modal(`<div class="center"><div class="muted small">${both.length ? 'From the ones you both want' : 'Something new'}</div><div class="pose-wrap">${poseSvg(p.id)}</div><h2>${esc(p.name)}</h2><p>${esc(p.desc)}</p>
      <div class="row center"><button class="btn" data-a="planAdd" data-id="${p.id}">＋ Add to plan</button><button class="btn ghost" data-a="surprise">Another</button></div><button class="btn ghost wide" data-a="close">Close</button></div>`);
  },
  bring: (el) => { const b = [...(S.shared.meetup.bring || [])]; b[el.dataset.i] = { ...b[el.dataset.i], done: el.checked }; set(['meetup', 'bring'], b); },
  bringDel: (el, e) => { e.preventDefault(); const b = [...(S.shared.meetup.bring || [])]; b.splice(Number(el.dataset.i), 1); set(['meetup', 'bring'], b); },
  ics: () => downloadIcs(),
  idea: () => { const vibe = rnd(C.DATE_IDEAS.vibe), place = rnd(C.DATE_IDEAS.place); ui.idea = { vibe, place, twist: rnd(C.DATE_IDEAS.twist), dare: draw(C.DATE_DARES, 'M', (x) => (place === 'on video call' ? x[1] === 'ldr' : x[1] !== 'ldr'))?.text }; render(); },
  ideaSave: () => { const i = ui.idea; set(['meetup', 'vibe'], i.vibe, { quiet: true }); appendNote(`🍷 Date: ${i.vibe} date ${i.place}, where ${i.twist}.${i.dare ? ' Mission: ' + i.dare : ''}`); },
  futureDone: (el) => set(['future'], (S.shared.future || []).map((f) => (f.id === el.dataset.id ? { ...f, done: el.checked } : f))),
  futureDel: (el, e) => { e.preventDefault(); set(['future'], (S.shared.future || []).filter((f) => f.id !== el.dataset.id)); },
  bucket: (el) => { set(['bucket', el.dataset.id], el.checked ? { done: true, date: localDate() } : null); if (el.checked) { floatEmoji('🔥'); bumpStreak(); } },
  create: () => createRoom(),
  getNumber: () => ensureNumber().then(() => { openInbox(); render(); }).catch((e) => toast(e.message)),
  ringYes: async (el) => {
    try { const d = await post('/accept', authBody({ from: el.dataset.from })); paired(d.partner.number, d.partner.name); } catch (e) { toast(e.message); closeModal(); }
  },
  ringNo: (el) => { post('/decline', authBody({ from: el.dataset.from })).catch(() => {}); closeModal(); },
  reconnect: () => connectPartner(),
  unpair: async () => {
    if (!confirm('Unpair from your partner? You can connect again any time with their Love Number.')) return;
    const p = S.local.partner; S.local.partner = null; save(); teardown();
    post('/unpair', authBody({ partner: p.number })).catch(() => {}); render();
  },
  leave: () => { teardown(); render(); },
  share: async (el) => {
    const url = el.dataset.link;
    if (navigator.share) { try { await navigator.share({ title: 'Intimacy for Couples', text: el.dataset.text || 'Join me 💞', url }); return; } catch { /* cancelled */ } }
    A.copy(el);
  },
  copy: async (el) => { try { await navigator.clipboard.writeText(el.dataset.link); toast('Copied'); } catch { prompt('Copy this link', el.dataset.link); } },
  call: (el) => startCall(el.dataset.video === '1'),
  acceptCall: () => acceptCall(),
  declineCall: () => { try { pendingCall?.close(); } catch { /* */ } pendingCall = null; send({ t: 'decline' }); closeModal(); },
  endCall: () => endCall(true),
  mute: () => toggleTrack('audio'),
  cam: () => toggleTrack('video'),
  mini: () => $('#call').classList.toggle('mini'),
  react: (el) => { send({ t: 'react', e: el.dataset.e }); floatEmoji(el.dataset.e); },
  pause: () => set(['paused'], true),
  resume: () => set(['paused'], false),
  softer: () => { set(['heat'], Math.max(1, S.shared.heat - 1), { quiet: true }); set(['paused'], false); },
  hideApp: () => hideApp(),
  export: () => {
    const blob = new Blob([JSON.stringify(S.shared, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'notes-backup.json'; a.click(); URL.revokeObjectURL(a.href);
  },
  reset: () => { if (confirm('Erase all games, plans and settings on this phone?')) { teardown(); localStorage.removeItem(KEY); location.hash = ''; location.reload(); } },
};

function appendNote(line) {
  const n = S.shared.meetup?.notes || '';
  set(['meetup', 'notes'], (n ? n + '\n' : '') + line, { quiet: true });
  toast('📌 Added to your meet-up plan');
}

function downloadIcs() {
  const mu = S.shared.meetup; if (!mu.when) return;
  const start = new Date(mu.when), end = new Date(start.getTime() + 3 * 36e5);
  const f = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const clean = (s) => String(s || '').replace(/[\\,;]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//IntimacyForCouples//EN', 'BEGIN:VEVENT', `UID:${uid()}@ifc`, `DTSTAMP:${f(new Date())}`,
    `DTSTART:${f(start)}`, `DTEND:${f(end)}`, 'SUMMARY:❤ Date night', `LOCATION:${clean(mu.place)}`, 'DESCRIPTION:Our plans are in the app 😉',
    'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:Date night in 2 hours ❤', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'date-night.ics'; a.click();
}

// Discreet mode: a plain notes screen. Double-tap its title to return.
function hideApp() {
  ui.hidden = true; $('#hide-screen').hidden = false; document.title = 'Notes';
  if (call) { localStream?.getTracks().forEach((t) => { if (t.kind === 'video') t.enabled = false; }); updateCallButtons(); }
}
function unhideApp() {
  if (S.local.pin) { ui.locked = true; showLock(); }
  ui.hidden = false; $('#hide-screen').hidden = true; document.title = 'Intimacy for Couples';
}
function showLock() {
  const l = $('#lock'); l.hidden = !ui.locked;
  if (ui.locked) { l.querySelector('input').value = ''; setTimeout(() => l.querySelector('input').focus(), 50); }
}

// ---------- events ----------
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-a]');
  if (!el || el.disabled) return;
  if (el.tagName === 'INPUT') return; // checkboxes handled on change
  const fn = A[el.dataset.a]; if (!fn) return;
  if (el.tagName === 'A') e.preventDefault();
  fn(el, e);
});
document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.matches('input[type=checkbox][data-a]')) { A[el.dataset.a]?.(el, e); return; }
  if (el.matches('input[type=file][data-a="import"]')) { importFile(el.files[0]); return; }
  if (el.matches('input[type=file][data-a="photo"]')) { setPhoto(el.dataset.r, el.files[0]); return; }
  if (el.matches('input[data-photo-once]')) { ui.photoOnce = el.checked; return; }
  if (el.matches('select[data-dpos]')) { ui.diary = ui.diary || { place: 'Bed', pos: [], rating: 4 }; if (el.value && !ui.diary.pos.includes(el.value)) ui.diary.pos.push(el.value); render(); return; }
  if (el.matches('input[data-rou-auto]')) { setGame({ auto: el.checked }); return; }
  if (el.matches('input[type=file][data-a="photoPick"]')) {
    const file = el.files[0]; if (!file || !online()) return;
    toast('Sending… 📸');
    shrinkPhoto(file).then((data) => {
      const g = G(), id = Date.now().toString(36) + uid().slice(0, 4), once = ui.photoOnce !== false;
      send({ t: 'photo', id, data, dare: g.card?.text || '', once });
      photoSent.push({ id, dare: g.card?.text || 'Photo', seen: false });
      if (!g.done) { addPoints(g.turn || 'A', 10); setGame({ done: true }); }
      toast(`🔥 Sent to ${S.shared.players[other(S.local.role)]?.name || 'your partner'}`); floatEmoji('📸'); render();
    }).catch(() => toast('Could not read that photo — try another'));
    return;
  }
  const f = el.closest('form[data-form="meetup"]');
  if (f && el.name) set(['meetup', el.name], el.value, { quiet: el.name !== 'when' });
});
document.addEventListener('submit', (e) => {
  const f = e.target.closest('form[data-form]'); if (!f) return;
  e.preventDefault();
  const d = Object.fromEntries(new FormData(f));
  switch (f.dataset.form) {
    case 'setup':
      S.local.setup = true; S.local.myName = d.me.trim(); S.local.swiper = 'A';
      S.local.myG = ['m', 'f', 'x'].includes(d.meG) ? d.meG : 'x';
      S.shared.players = { A: { name: d.me.trim(), g: S.local.myG }, B: { name: d.partner.trim(), g: ['m', 'f', 'x'].includes(d.ptG) ? d.ptG : 'x' } };
      S.shared.heat = Number(d.heat) || 2; S.shared.safeWord = d.safe.trim() || 'Pineapple';
      save(); ui.tab = ui.joinCode || ui.ringTo ? 'connect' : 'home'; render();
      if (ui.joinCode) joinRoom(ui.joinCode);
      break;
    case 'talk': {
      const text = (d.m || '').trim(); if (!text) return;
      const id = Date.now().toString(36) + uid().slice(0, 4);
      set(['talk', id], { from: me(), text: text.slice(0, 500), ts: Date.now(), likes: {} }, { quiet: true });
      const all = Object.entries(S.shared.talk || {}).sort((a, b) => num(a[1]?.ts) - num(b[1]?.ts));
      if (all.length > 150) set(['talk', all[0][0]], null, { quiet: true });
      ui.talkDraft = ''; addPoints(me(), 2); render();
      break;
    }
    case 'story': {
      const btn = f.querySelector('button'); btn.disabled = true;
      ensureNumber().then(() => post('/community/post', authBody({ topic: d.topic, handle: d.handle, text: d.text })))
        .then(() => { ui.comm.compose = false; toast('💌 Sent! It appears after a quick review.', 4000); loadCommunity(); })
        .catch((e) => { toast(e.message, 5000); btn.disabled = false; });
      break;
    }
    case 'todAnswer': {
      const text = (d.a || '').trim(); const g = G(); if (!text || !g.card || !canAct(g.turn || 'A')) return;
      if (g.card.type === 'truth') addPoints(g.turn || 'A', 5);
      setGame({ answer: { text: text.slice(0, 1000) } }); floatEmoji('💬');
      break;
    }
    case 'todAsk': {
      const q = (d.q || '').trim(); if (!q) return;
      ui.askOpen = false;
      setGame({ card: { id: 'custom', custom: true, heat: S.shared.heat, type: d.type === 'dare' ? 'dare' : 'truth', text: q.slice(0, 300) }, answer: null, loved: false, done: false });
      break;
    }
    case 'wish': sendWish(d.t); break;
    case 'turnon': {
      const r = f.dataset.r, t = (d.t || '').trim().slice(0, 40); if (!t || !canAct(r)) return;
      const cur = S.shared.turnons?.[r] || []; if (!cur.includes(t)) set(['turnons', r], [...cur, t].slice(0, 30));
      break;
    }
    case 'diary': {
      const f2 = ui.diary || { place: 'Bed', pos: [], rating: 4 };
      const id = Date.now().toString(36) + uid().slice(0, 3);
      set(['diary', id], { ts: Date.now(), place: f2.place, pos: f2.pos.slice(0, 12), rating: f2.rating, both: d.both === 'on', note: (d.note || '').trim().slice(0, 300), by: me() });
      ui.diary = null; floatEmoji('📓'); toast('Saved to your diary 🔥'); bumpStreak();
      break;
    }
    case 'comment': {
      const text = (d.text || '').trim(); if (!text) return; const btn = f.querySelector('button'); btn.disabled = true;
      S.local.cmHandle = (d.handle || '').trim().slice(0, 24); save();
      ensureNumber().then(() => post('/community/comment', authBody({ id: Number(f.dataset.id), text, handle: d.handle || S.local.myName || 'Anonymous' })))
        .then(() => { loadComments(Number(f.dataset.id)); const st = ui.comm.data?.stories?.find((x) => x.id === Number(f.dataset.id)); if (st) st.comments = num(st.comments) + 1; })
        .catch((e) => { toast(e.message, 4000); btn.disabled = false; });
      break;
    }
    case 'join': ui.joinCode = d.code; joinRoom(d.code); break;
    case 'ring': ui.ringTo = d.to; ringPartner(d.to); break;
    case 'chat': {
      const text = (d.m || '').trim(); if (!text || !online()) return;
      send({ t: 'chat', text }); S.local.chat.push({ from: S.local.role, text, ts: Date.now() }); S.local.chat = S.local.chat.slice(-200); save(); render();
      setTimeout(() => { const m = $('#msgs'); if (m) m.scrollTop = m.scrollHeight; $('form[data-form="chat"] input')?.focus(); }, 0);
      break;
    }
    case 'bring': if (d.t.trim()) set(['meetup', 'bring'], [...(S.shared.meetup.bring || []), { text: d.t.trim(), done: false }]); break;
    case 'future': set(['future'], [...(S.shared.future || []), { id: uid(), cat: d.cat, hz: d.hz, text: d.text.trim(), done: false }]); break;
    case 'bucket': set(['customBucket'], [...(S.shared.customBucket || []), { id: 'C' + uid(), text: d.t.trim() }]); break;
    case 'settings': {
      if (d.a.trim()) set(['players', 'A'], { name: d.a.trim() }, { quiet: true });
      if (d.b.trim()) set(['players', 'B'], { name: d.b.trim() }, { quiet: true });
      if (online()) S.local.myName = (S.local.role === 'A' ? d.a : d.b).trim() || S.local.myName; else S.local.myName = d.a.trim() || S.local.myName;
      if (d.safe.trim()) set(['safeWord'], d.safe.trim(), { quiet: true });
      if (/^\d{4,8}$/.test(d.pin)) { S.local.pin = d.pin; toast('PIN lock on'); } else if (d.pin === '' && S.local.pin && confirm('Turn off the PIN lock?')) S.local.pin = '';
      S.local.fx = d.fx === 'on'; ambHeat = -1;
      if (S.local.me) post('/name', authBody({ name: S.local.myName })).catch(() => {});
      save(); toast('Saved'); render();
      break;
    }
  }
});
// Shrink a photo on the phone (square, 320px JPEG) before it is shared with the partner.
async function setPhoto(r, file) {
  if (!file || !canAct(r)) return;
  try {
    const bmp = await createImageBitmap(file);
    const side = Math.min(bmp.width, bmp.height), size = 320;
    const c = document.createElement('canvas'); c.width = c.height = size;
    c.getContext('2d').drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, size, size);
    let q = 0.82, url = c.toDataURL('image/jpeg', q);
    while (url.length > 90000 && q > 0.4) { q -= 0.1; url = c.toDataURL('image/jpeg', q); }
    set(['players', r, 'photo'], url); toast('Photo updated 💗');
  } catch { toast('Could not read that photo — try another'); }
}

function sendWish(text) {
  text = String(text || '').trim().slice(0, 120); if (!text) return;
  closeModal(); set(['requests', me()], { text, ts: Date.now(), reply: null });
  toast(`💌 Wish sent to ${S.shared.players[other(me())]?.name || 'your partner'}`); floatEmoji('💌');
}

function importFile(file) {
  if (!file) return;
  file.text().then((t) => {
    const data = JSON.parse(t);
    if (!data || typeof data !== 'object' || !data.players) throw new Error('bad file');
    S.shared = { ...defaultShared(), ...data };
    for (const k of Object.keys(S.shared)) if (!SYNC_KEYS.has(k)) delete S.shared[k];
    sanitize(); save(); if (net.host) send({ t: 'state', shared: S.shared }); toast('Backup restored'); render();
  }).catch(() => toast('That file is not a valid backup'));
}

// Tinder-style swipe cards: drag right = yes / want, left = no / pass.
let drag = null;
document.addEventListener('pointerdown', (e) => {
  const c = e.target.closest('[data-swipe]');
  if (!c || e.target.closest('button, a, input, textarea')) return;
  drag = { c, x: e.clientX, y: e.clientY, dx: 0, id: e.pointerId };
  c.style.transition = 'none';
});
document.addEventListener('pointermove', (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  drag.dx = e.clientX - drag.x;
  if (Math.abs(drag.dx) > 6) { try { drag.c.setPointerCapture(e.pointerId); } catch { /* */ } }
  drag.c.style.transform = `translateX(${drag.dx}px) rotate(${drag.dx / 16}deg)`;
  drag.c.classList.toggle('to-like', drag.dx > 50); drag.c.classList.toggle('to-nope', drag.dx < -50);
});
const endDrag = (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  const { c, dx } = drag; drag = null;
  c.style.transition = 'transform .3s ease';
  if (Math.abs(dx) < 100) { c.style.transform = ''; c.classList.remove('to-like', 'to-nope'); return; }
  const right = dx > 0;
  c.style.transform = `translateX(${right ? 600 : -600}px) rotate(${right ? 30 : -30}deg)`;
  setTimeout(() => {
    if (c.dataset.swipe === 'desire') A.desire({ dataset: { id: c.dataset.id, v: right ? 'yes' : 'no' } });
    if (c.dataset.swipe === 'pos') { set(['pos', c.dataset.id, me()], right ? 'want' : 'no'); const v = S.shared.pos?.[c.dataset.id] || {}; if (right && v.A === 'want' && v.B === 'want') { toast('✨ It\'s a match — you both want this!'); floatEmoji('💘'); } }
  }, 220);
};
document.addEventListener('pointerup', endDrag);
document.addEventListener('pointercancel', endDrag);
document.addEventListener('input', (e) => {
  if (e.target.matches('[data-lab-text]')) { draftFor(me()).text = e.target.value.slice(0, 1500); save(); }
});

document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !ui.hidden && S.local.setup) hideApp(); });
$('#hide-title').addEventListener('dblclick', unhideApp);
let lastTap = 0;
$('#hide-title').addEventListener('touchend', () => { const n = Date.now(); if (n - lastTap < 400) unhideApp(); lastTap = n; });
$('#lock form').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = e.target.querySelector('input').value;
  if (v === S.local.pin) { ui.locked = false; showLock(); render(); } else { toast('Wrong PIN'); e.target.querySelector('input').value = ''; }
});

// invite links: #join=CODE
function readHash() {
  const love = location.hash.match(/love=(\d{8})/);
  if (love) { ui.ringTo = love[1]; ui.tab = 'connect'; history.replaceState(null, '', location.pathname + location.search); if (S.local.setup) render(); return; }
  const m = location.hash.match(/join=([A-Za-z0-9]{6})/);
  if (!m) return;
  ui.joinCode = m[1].toUpperCase(); history.replaceState(null, '', location.pathname + location.search);
  if (S.local.setup) { ui.tab = 'connect'; render(); if (!ui.locked) joinRoom(ui.joinCode); }
}
window.addEventListener('hashchange', readHash);
window.addEventListener('beforeunload', () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* */ } });

sanitize();
let installEvt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; if (ui.tab === 'home') softRender(); });
readHash();
render();
if (S.local.setup && S.local.me) openInbox();
if (S.local.setup && S.local.partner) connectPartner();
showLock();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('./sw.js').catch(() => {});
