// Intimacy for Couples — single-page app.
// Same-phone play works offline. Long-distance play connects two phones through the
// backend (worker/index.js): game messages relay through a room, voice and video go
// phone-to-phone with WebRTC.
import * as C from './content.js';
import { poseSvg } from './poses.js';

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
    future: [], bucket: {}, customBucket: [], game: null, paused: false, talk: {}, turnons: { A: [], B: [] }, requests: {},
  };
}
function defaultLocal() {
  return { setup: false, myName: '', pin: '', role: 'A', swiper: 'A', api: '', chat: [], unread: 0, me: null, partner: null, liked: {} };
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
  for (const k of ['desire', 'pos', 'hidden', 'bucket', 'meetup', 'players', 'talk', 'turnons', 'requests']) if (typeof sh[k] !== 'object' || sh[k] === null) sh[k] = defaultShared()[k];
  for (const k of ['plan', 'future', 'customBucket']) if (!Array.isArray(sh[k])) sh[k] = [];
  if (!Array.isArray(sh.meetup.bring)) sh.meetup.bring = [];
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
  const m = $('#modal');
  m.innerHTML = `<div class="sheet">${html}</div>`;
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
  if (!net.host) send({ t: 'hello', name: S.local.myName || S.shared.players.A.name });
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
      S.shared.players.B = { name: String(m.name || 'Partner').slice(0, 30) };
      if (S.local.myName) S.shared.players.A = { name: S.local.myName };
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
  { id: 'tod', name: 'Truth or Dare', icon: '🎭', desc: 'The classic, with 4 heat levels' },
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
];
const gameName = (id) => GAMES.find((g) => g.id === id)?.name || 'a game';

function openGame(id) {
  ui.tab = 'games'; ui.game = id;
  if (['desire', 'talk', 'tips', 'learn'].includes(id)) { ui.guide = null; return render(); }
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
  tabs.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('active', b.dataset.tab === ui.tab));
  const badge = tabs.querySelector('[data-tab="us"] .badge');
  if (ui.tab === 'us' && ui.usTab === 'connect') S.local.unread = 0;
  badge.textContent = S.local.unread || ''; badge.hidden = !S.local.unread;
  if (ui.tab === 'community' && !ui.comm.data && !ui.comm.loading) loadCommunity();
  const v = { home: homeView, games: gamesView, positions: positionsView, community: communityView, us: usView }[ui.tab] || homeView;
  view.innerHTML = v();
  $('#pause-btn').hidden = ui.tab !== 'games' || !ui.game || ['learn', 'tips'].includes(ui.game);
  renderPause();
  tick();
}

function setupView() {
  return `<section class="setup">
    <div class="hero"><div class="logo-big">💗</div><h1>Intimacy <span>for Couples</span></h1>
    <p class="muted">The game that brings you closer — truth or dare, desire match, positions, date plans and live video, for two.</p></div>
    <form class="card" data-form="setup">
      <label>Your name<input name="me" maxlength="30" required placeholder="e.g. Arjun" value="${esc(S.local.myName)}"></label>
      <label>Your partner's name<input name="partner" maxlength="30" required placeholder="e.g. Meera"></label>
      <label>Starting heat</label>
      <div class="heat-pick">${C.HEAT.map((h) => `<label class="heat-opt"><input type="radio" name="heat" value="${h.level}" ${h.level === 2 ? 'checked' : ''}><span>${h.icon}<b>${h.name}</b><small>${h.hint}</small></span></label>`).join('')}</div>
      <label>Safe word <small class="muted">— say it or tap 🛑 and everything pauses</small><input name="safe" maxlength="20" value="Pineapple"></label>
      <label class="check"><input type="checkbox" name="adult" required> We are both 18+ and everything here is by mutual consent.</label>
      <button class="btn big">Start playing 💞</button>
    </form>
    <p class="muted small center">Private by design: no account, no server storage. Your data stays on your phone; live play goes directly phone-to-phone.</p>
  </section>`;
}

function homeView() {
  const sh = S.shared, mu = sh.meetup || {};
  const both = Object.values(sh.pos || {}).filter((p) => p.A === 'want' && p.B === 'want').length;
  const matches = desireMatches().length;
  const bucketAll = C.BUCKET.length + (sh.customBucket || []).length;
  const bucketDone = Object.values(sh.bucket || {}).filter((b) => b?.done).length;
  const spark = C.DAILY_SPARK[Math.floor(Date.now() / 864e5) % C.DAILY_SPARK.length];
  return `<section>
    ${coupleHeader()}
    <div class="card status ${online() ? 'live' : ''}">
      ${online() ? `<div><b>🟢 Live with ${nm(other(S.local.role))}</b><p class="muted small">Games, plans and chat sync instantly.</p></div>
        <div class="row"><button class="btn sm" data-a="call" data-video="1">📹 Video</button><button class="btn sm ghost" data-a="call" data-video="0">📞 Voice</button></div>`
        : `<div><b>Together or miles apart?</b><p class="muted small">Play on one phone now, or connect two phones for long-distance play with video.</p></div>
        <button class="btn sm" data-a="us" data-sub="connect">Connect 💌</button>`}
    </div>
    <div class="card meetup-card" data-a="plan" data-sub="meetup">
      <div class="muted small">Next meet-up</div>
      ${mu.when ? `<div class="count" data-countdown="${esc(mu.when)}">${countdown(mu.when)}</div>
        <div class="small">${esc(new Date(mu.when).toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }))}${mu.place ? ' · ' + esc(mu.place) : ''}</div>`
        : '<div class="count dim">Not planned yet</div><div class="small">Tap to set a date, place and tonight\'s positions →</div>'}
    </div>
    <div class="stats">
      <div><b>🔥 ${num(sh.streak?.count)}</b><span>day streak</span></div>
      <div><b>${num(sh.points?.A)} · ${num(sh.points?.B)}</b><span>love points</span></div>
      <div><b>💞 ${matches}</b><span>desire matches</span></div>
      <div><b>✨ ${both}</b><span>positions you both want</span></div>
    </div>
    ${wishCard()}
    <div class="card spark"><div class="muted small">Today's spark</div><p>${esc(spark)}</p></div>
    <div class="card talkhome" data-a="game" data-id="talk">${(() => { const sc = talkScores(), l = talkLeader(); return `<div class="row between"><b>🔥 Hot Chat · Hot Score</b><span class="small">${l === 'A' || l === 'B' ? `👑 ${nm(l)}` : l === 'tie' ? 'Tied!' : 'Start talking →'}</span></div>
      <div class="small muted">${nm('A')} ${sc.A.score} · ${nm('B')} ${sc.B.score} — every 🔥 from your partner is +10</div>`; })()}</div>
    <h3>Play now</h3>
    <div class="grid">${GAMES.slice(0, 4).map(gameTile).join('')}</div>
    <h3>Learn together</h3>
    <div class="hscroll">${C.LEARN.map((g) => `<button class="guide-chip" data-a="openGuide" data-id="${g.id}"><span>${g.icon}</span>${esc(g.title)}</button>`).join('')}</div>
    <div class="card community-teaser" data-a="tab" data-tab="community"><div class="row between"><b>🔥 Community</b><span class="small">Hot topics →</span></div>
      <div class="small muted">Real couples share experiences, anonymously. Read, like, and share yours.</div></div>
    <div class="card" data-a="game" data-id="tips"><div class="muted small">📚 Tip of the day</div><p class="small">${esc(tipOfDay())}</p></div>
    <div class="card"><div class="muted small">Bucket list</div>
      <div class="bar"><i style="width:${bucketAll ? Math.round((bucketDone / bucketAll) * 100) : 0}%"></i></div>
      <div class="small">${bucketDone} of ${bucketAll} hot experiences done <a href="#" data-a="us" data-sub="bucket">Open →</a></div></div>
  </section>`;
}
const gameTile = (g) => `<button class="tile" data-a="game" data-id="${g.id}"><span class="ico">${g.icon}</span><b>${g.name}</b><small>${g.desc}</small></button>`;

function gamesView() {
  if (!ui.game) {
    return `<section><h2>Games</h2><p class="muted">Heat is ${heatInfo(S.shared.heat).icon} <b>${heatInfo(S.shared.heat).name}</b>. Cards up to this heat appear. <a href="#" data-a="heat">Change</a></p>
      <div class="grid">${GAMES.map(gameTile).join('')}</div></section>`;
  }
  const back = ui.game === 'learn' && ui.guide ? '<button class="back" data-a="guide" data-id="">‹ Guides</button>' : `<button class="back" data-a="back">‹ Play</button>`;
  const fn = { tod: todView, talk: talkView, tips: tipsView, learn: learnView, desire: desireView, dice: diceView, dates: datesView, never: neverView, rather: ratherView, hotseat: hotseatView, fantasy: fantasyView }[ui.game];
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
    ${next ? `<div class="playcard heat${next.heat} swipe"><div class="pc-top"><span>WOULD YOU…</span><span>${heatInfo(next.heat).icon}</span></div><p>${esc(next.text)}</p></div>
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

function positionsView() {
  const sh = S.shared, r = me();
  const list = C.POSITIONS.filter((p) => {
    const v = sh.pos?.[p.id] || {};
    return ui.posFilter === 'both' ? v.A === 'want' && v.B === 'want' : ui.posFilter === 'tried' ? v.tried : ui.posFilter === 'new' ? !v[r] : true;
  });
  const plan = (sh.plan || []).map((id) => C.POSITIONS.find((p) => p.id === id)).filter(Boolean);
  const dots = (n, c) => c.repeat(n) + '<i>' + c.repeat(3 - n) + '</i>';
  return `<section><h2>Position Planner</h2>${swiperBar()}
    <div class="card plan"><div class="row between"><b>🌙 Tonight's playlist</b><button class="btn sm" data-a="surprise">🎲 Surprise us</button></div>
      ${plan.length ? `<div class="playlist">${plan.map((p, i) => `<div class="pl-item"><span class="pl-n">${i + 1}</span>${poseSvg(p.id, 'pose mini-pose')}<span>${esc(p.name)}</span><button class="mini" data-a="planToggle" data-id="${p.id}">✕</button></div>`).join('')}</div>` : '<p class="muted small">Add positions with ＋ to plan your next night together.</p>'}</div>
    <div class="chips">${[['all', 'All'], ['both', '✨ Both want'], ['new', 'Not voted'], ['tried', '✓ Tried']].map(([k, l]) => `<button class="chip ${ui.posFilter === k ? 'on' : ''}" data-a="posFilter" data-f="${k}">${l}</button>`).join('')}</div>
    <div class="positions">${list.map((p) => {
      const v = sh.pos?.[p.id] || {}, both = v.A === 'want' && v.B === 'want', inPlan = (sh.plan || []).includes(p.id);
      return `<div class="pos ${both ? 'match' : ''}"><div class="pose-wrap">${poseSvg(p.id)}</div><div class="row between"><b>${esc(p.name)}</b>${both ? '<span class="tag">✨ Both want</span>' : ''}${v.tried ? '<span class="tag ok">✓ Tried</span>' : ''}</div>
        <p class="small">${esc(p.desc)}</p>
        <div class="meters"><span>Difficulty ${dots(p.diff, '●')}</span><span>Intimacy ${dots(p.intimacy, '♥')}</span><span>Energy ${dots(p.energy, '⚡')}</span></div>
        <div class="row"><button class="chip ${v[r] === 'want' ? 'on' : ''}" data-a="posVote" data-id="${p.id}" data-v="want">👍 Want</button>
        <button class="chip ${v[r] === 'no' ? 'on' : ''}" data-a="posVote" data-id="${p.id}" data-v="no">👎 Pass</button>
        <button class="chip ${v.tried ? 'on' : ''}" data-a="posTried" data-id="${p.id}">✓ Tried</button>
        <button class="chip ${inPlan ? 'on' : ''}" data-a="planToggle" data-id="${p.id}">${inPlan ? '✓ In plan' : '＋ Plan'}</button></div></div>`;
    }).join('') || '<p class="muted">Nothing here yet.</p>'}</div>
    <p class="muted small">Your partner only sees "Both want" — a pass stays private. Communicate, go slow, stop anytime.</p></section>`;
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
    <div class="row between"><b>💌 Tonight's wish</b><button class="btn sm" data-a="wishOpen">Send a wish</button></div>
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
        <div class="row between"><button class="chip ${liked ? 'on' : ''}" data-a="storyLike" data-id="${num(x.id)}">🔥 ${num(x.likes)}</button><button class="mini" data-a="storyReport" data-id="${num(x.id)}">⚑ Report</button></div></article>`; }).join('') || `<div class="card center"><p><b>No stories here yet.</b></p><p class="muted small">Be the first couple to share — tap ✍️ Share yours.</p></div>`}</div></section>`;
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
      <label>App lock PIN <small class="muted">(4–8 digits, blank = off)</small><input name="pin" inputmode="numeric" pattern="[0-9]{4,8}" maxlength="8" placeholder="${S.local.pin ? '•••• (set)' : 'Off'}"></label>
      <button class="btn">Save settings</button>
    </form>
    <div class="row"><button class="btn ghost sm" data-a="export">⬇ Backup</button><label class="btn ghost sm">⬆ Restore<input type="file" accept="application/json" data-a="import" hidden></label><button class="btn ghost sm" data-a="unhide">Unhide cards</button><button class="btn danger sm" data-a="reset">Erase everything</button></div>
    <p class="muted small">🔒 No email, no phone number, no tracking. Games, answers and chats stay on your phones — the server only passes live messages between you and never stores them. Voice and video go directly phone-to-phone. Press Esc or 🙈 to hide the app instantly. <a href="/privacy/">Privacy</a></p></section>`;
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
  document.querySelectorAll('[data-countdown]').forEach((el) => { if (el.dataset.countdown) el.textContent = countdown(el.dataset.countdown); });
  document.querySelectorAll('[data-timer]').forEach((el) => {
    const end = Number(el.dataset.timer);
    if (!end) return;
    const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    el.textContent = left;
    el.classList.toggle('low', left <= 10);
    if (left === 0 && !el._done) { el._done = true; hotseatOver(); }
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
  tab: (el) => { ui.tab = el.dataset.tab; if (ui.tab !== 'games') ui.game = null; if (ui.tab === 'community') ui.comm.data = null; render(); window.scrollTo(0, 0); },
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
  wishOpen: () => modal(`<h3>💌 Send a wish</h3><p class="muted small">${nm(other(me()))} gets it instantly and can say yes.</p>
    <div class="chips wrap">${C.REQUESTS.map((q) => `<button class="chip" data-a="wishSend" data-t="${esc(q)}">${esc(q)}</button>`).join('')}</div>
    <form class="row" data-form="wish"><input name="t" maxlength="120" placeholder="Or write your own wish…" required><button class="btn sm">Send</button></form>
    <button class="btn ghost wide" data-a="close">Close</button>`),
  wishSend: (el) => sendWish(el.dataset.t),
  wishReply: (el) => { const p = other(me()); if (!S.shared.requests?.[p]) return; set(['requests', p, 'reply'], el.dataset.v); if (el.dataset.v === 'yes') floatEmoji('😘'); },
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
  setHeat: (el) => { closeModal(); set(['heat'], Number(el.dataset.h)); toast(`Heat: ${heatInfo(Number(el.dataset.h)).icon} ${heatInfo(Number(el.dataset.h)).name}`); },
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
      S.shared.players = { A: { name: d.me.trim() }, B: { name: d.partner.trim() } };
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
readHash();
render();
if (S.local.setup && S.local.me) openInbox();
if (S.local.setup && S.local.partner) connectPartner();
showLock();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('./sw.js').catch(() => {});
