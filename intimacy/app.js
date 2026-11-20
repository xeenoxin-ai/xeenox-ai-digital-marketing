// Intimacy for Couples — single-page app.
// Same-phone play works offline. Long-distance play uses WebRTC (PeerJS) peer-to-peer:
// game state, chat, voice and video go directly between the two phones.
import * as C from './content.js';

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
    future: [], bucket: {}, customBucket: [], game: null, paused: false,
  };
}
function defaultLocal() {
  return { setup: false, myName: '', pin: '', role: 'A', swiper: 'A', signal: '', turn: '', chat: [], unread: 0 };
}
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw) return { shared: { ...defaultShared(), ...raw.shared }, local: { ...defaultLocal(), ...raw.local } };
  } catch { /* fresh start */ }
  return { shared: defaultShared(), local: defaultLocal() };
}
const S = load();

const ui = { tab: 'home', game: null, planTab: 'meetup', posFilter: 'all', place: 'home', idea: null, locked: !!S.local.pin, hidden: false };
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
const online = () => !!(conn && conn.open);
const me = () => (online() ? S.local.role : S.local.swiper);
const canAct = (r) => !online() || r === S.local.role;
const heatInfo = (h) => C.HEAT[h - 1] || C.HEAT[1];
const num = (x) => (Number.isFinite(Number(x)) ? Number(x) : 0);
// Values from the partner's phone are data: coerce anything rendered as a number.
function sanitize() {
  const sh = S.shared;
  sh.heat = Math.min(4, Math.max(1, Math.round(num(sh.heat)) || 2));
  sh.points = { A: num(sh.points?.A), B: num(sh.points?.B) };
  sh.streak = { count: num(sh.streak?.count), last: String(sh.streak?.last || '') };
  for (const k of ['desire', 'pos', 'hidden', 'bucket', 'meetup', 'players']) if (typeof sh[k] !== 'object' || sh[k] === null) sh[k] = defaultShared()[k];
  for (const k of ['plan', 'future', 'customBucket']) if (!Array.isArray(sh[k])) sh[k] = [];
  if (!Array.isArray(sh.meetup.bring)) sh.meetup.bring = [];
  for (const r of ['A', 'B']) if (!sh.players[r] || typeof sh.players[r] !== 'object') sh.players[r] = { name: r === 'A' ? 'Player 1' : 'Player 2' };
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

// ---------- networking (PeerJS / WebRTC) ----------
let peer = null, conn = null;
const net = { status: 'offline', code: '', host: false };

function peerOpts() {
  const o = { debug: 1, config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] } };
  const sig = new URLSearchParams(location.search).get('signal') || S.local.signal;
  if (sig) {
    try {
      const u = new URL(sig.includes('://') ? sig : 'http://' + sig);
      o.host = u.hostname; o.secure = u.protocol === 'https:';
      o.port = Number(u.port) || (o.secure ? 443 : 80);
      o.path = u.pathname || '/';
    } catch { /* ignore bad value */ }
  }
  if (S.local.turn) { try { const t = JSON.parse(S.local.turn); o.config.iceServers.push(...(Array.isArray(t) ? t : [t])); } catch { /* ignore */ } }
  return o;
}
function newCode() {
  const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => rnd(A)).join('');
}
function teardown() {
  endCall(false);
  try { conn?.close(); } catch { /* */ }
  try { peer?.destroy(); } catch { /* */ }
  peer = null; conn = null; net.status = 'offline'; net.code = ''; net.host = false;
}
function peerErrors(p) {
  p.on('error', (err) => {
    const t = err?.type;
    if (t === 'unavailable-id') { toast('That room code is busy — creating a new one'); teardown(); createRoom(); return; }
    if (t === 'peer-unavailable') toast('Room not found. Check the code and that your partner\'s room is open.');
    else if (t === 'network' || t === 'server-error' || t === 'socket-error') toast('Can\'t reach the connection server. Check your internet.');
    else if (t === 'browser-incompatible') toast('This browser does not support live play. Try Chrome or Safari.');
    else toast('Connection problem: ' + (t || 'unknown'));
    if (!online()) { net.status = net.host && p.open ? 'waiting' : 'offline'; render(); }
  });
  p.on('disconnected', () => { if (!p.destroyed) setTimeout(() => { try { p.reconnect(); } catch { /* */ } }, 1500); });
  p.on('call', onIncomingCall);
}
function createRoom() {
  if (typeof Peer === 'undefined') return toast('Live play failed to load. Refresh the page.');
  teardown();
  net.code = newCode(); net.host = true; net.status = 'starting'; render();
  peer = new Peer(ROOM_PREFIX + net.code, peerOpts());
  peerErrors(peer);
  peer.on('open', () => { net.status = 'waiting'; render(); });
  peer.on('connection', (c) => { if (online()) { c.on('open', () => c.close()); return; } wireConn(c); });
}
function joinRoom(code) {
  code = String(code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== 6) return toast('Enter the 6-character room code');
  if (typeof Peer === 'undefined') return toast('Live play failed to load. Refresh the page.');
  teardown();
  net.code = code; net.host = false; net.status = 'joining'; render();
  peer = new Peer(peerOpts());
  peerErrors(peer);
  peer.on('open', () => wireConn(peer.connect(ROOM_PREFIX + code, { reliable: true })));
}
function wireConn(c) {
  conn = c;
  c.on('open', () => {
    net.status = 'connected';
    if (!net.host) send({ t: 'hello', name: S.local.myName || S.shared.players.A.name });
    toast('Partner connected 💞'); render();
  });
  c.on('data', onData);
  c.on('close', () => {
    if (conn === c) conn = null;
    endCall(false);
    net.status = net.host && peer && !peer.destroyed ? 'waiting' : 'offline';
    toast('Partner disconnected'); render();
  });
}
function send(msg) { if (online()) { try { conn.send(msg); } catch { /* */ } } }

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
      softRender();
      break;
    }
    case 'chat': {
      const text = String(m.text || '').slice(0, 1000);
      S.local.chat.push({ from: other(S.local.role), text, ts: Date.now() });
      S.local.chat = S.local.chat.slice(-200);
      if (ui.tab !== 'connect') { S.local.unread++; toast(`💬 ${nm(other(S.local.role))}: ${text.slice(0, 60)}`); }
      save(); softRender();
      break;
    }
    case 'react': if (typeof m.e === 'string' && m.e.length <= 8) floatEmoji(m.e); break;
    case 'hangup': endCall(false); break;
    case 'decline': toast('Call declined'); endCall(false); break;
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

// ---------- voice & video calls ----------
let call = null, localStream = null, callStart = 0, callTimer = null;
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
  wireCall(peer.call(conn.peer, localStream, { metadata: { video } }), video);
}
function onIncomingCall(c) {
  const video = !!c.metadata?.video;
  modal(`<h3>${video ? '📹 Video' : '📞 Voice'} call</h3><p>${nm(other(S.local.role))} is calling you…</p>
    <div class="row"><button class="btn ghost" data-a="declineCall">Decline</button><button class="btn" data-a="acceptCall">Answer</button></div>`);
  pendingCall = c;
}
let pendingCall = null;
async function acceptCall() {
  const c = pendingCall; pendingCall = null; closeModal();
  if (!c) return;
  const video = !!c.metadata?.video;
  localStream = await getMedia(video);
  if (!localStream) { c.close(); send({ t: 'decline' }); return; }
  c.answer(localStream);
  wireCall(c, video);
}
function wireCall(c, video) {
  call = c;
  const box = $('#call');
  box.hidden = false; box.className = video ? 'video' : 'voice';
  $('#local-video').srcObject = video ? localStream : null;
  $('#call-name').textContent = S.shared.players[other(S.local.role)]?.name || 'Partner';
  $('#call-status').textContent = 'Connecting…';
  c.on('stream', (rs) => {
    const v = $('#remote-video'); v.srcObject = rs; v.play?.().catch(() => {});
    callStart = Date.now();
    clearInterval(callTimer);
    callTimer = setInterval(() => { $('#call-status').textContent = '● ' + fmtDur(Date.now() - callStart); }, 1000);
  });
  c.on('close', () => endCall(false));
  c.on('error', () => endCall(false));
  updateCallButtons();
}
const fmtDur = (ms) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
function endCall(notify = true) {
  if (notify) send({ t: 'hangup' });
  try { call?.close(); } catch { /* */ }
  localStream?.getTracks().forEach((t) => t.stop());
  call = null; localStream = null; clearInterval(callTimer);
  const box = $('#call'); if (box) { box.hidden = true; $('#remote-video').srcObject = null; $('#local-video').srcObject = null; }
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
  { id: 'desire', name: 'Desire Match', icon: '💞', desc: 'Swipe privately — only mutual yeses show' },
  { id: 'dice', name: 'Sexy Dice', icon: '🎲', desc: 'Roll an action, a spot and a time' },
  { id: 'dates', name: 'Naughty Date Dares', icon: '🌙', desc: 'Missions for home, out, or long distance' },
  { id: 'never', name: 'Never Have I Ever', icon: '🙈', desc: 'Confess together, reveal together' },
  { id: 'rather', name: 'Would You Rather', icon: '⚖️', desc: 'Pick in secret — match for points' },
  { id: 'hotseat', name: 'Hot Seat', icon: '⏱️', desc: '60 seconds of rapid-fire questions' },
  { id: 'fantasy', name: 'Fantasy Builder', icon: '✨', desc: 'Build tonight\'s scenario together' },
];
const gameName = (id) => GAMES.find((g) => g.id === id)?.name || 'a game';

function openGame(id) {
  ui.tab = 'games'; ui.game = id;
  if (id === 'desire') return render();
  const g = S.shared.game?.kind === id ? S.shared.game : { kind: id, turn: 'A', card: null };
  if (S.shared.game?.kind !== id) set(['game'], g); else render();
}
const G = () => S.shared.game || {};
function setGame(patch) { set(['game'], { ...G(), ...patch }); }

function nextTurn() { setGame({ turn: other(G().turn || 'A'), card: null, ans: {}, roll: null }); }

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
  tabs.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('active', b.dataset.tab === ui.tab));
  const badge = tabs.querySelector('[data-tab="connect"] .badge');
  if (ui.tab === 'connect') S.local.unread = 0;
  badge.textContent = S.local.unread || ''; badge.hidden = !S.local.unread;
  const v = { home: homeView, games: gamesView, positions: positionsView, plans: plansView, connect: connectView }[ui.tab] || homeView;
  view.innerHTML = v();
  $('#pause-btn').hidden = ui.tab !== 'games' || !ui.game;
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
    <div class="couple"><span>${nm('A')}</span><b class="heart">❤</b><span>${nm('B')}</span></div>
    <div class="card status ${online() ? 'live' : ''}">
      ${online() ? `<div><b>🟢 Live with ${nm(other(S.local.role))}</b><p class="muted small">Games, plans and chat sync instantly.</p></div>
        <div class="row"><button class="btn sm" data-a="call" data-video="1">📹 Video</button><button class="btn sm ghost" data-a="call" data-video="0">📞 Voice</button></div>`
        : `<div><b>Together or miles apart?</b><p class="muted small">Play on one phone now, or connect two phones for long-distance play with video.</p></div>
        <button class="btn sm" data-a="tab" data-tab="connect">Connect 💌</button>`}
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
    <div class="card spark"><div class="muted small">Today's spark</div><p>${esc(spark)}</p></div>
    <h3>Play now</h3>
    <div class="grid">${GAMES.slice(0, 4).map(gameTile).join('')}</div>
    <div class="card"><div class="muted small">Bucket list</div>
      <div class="bar"><i style="width:${bucketAll ? Math.round((bucketDone / bucketAll) * 100) : 0}%"></i></div>
      <div class="small">${bucketDone} of ${bucketAll} hot experiences done <a href="#" data-a="plan" data-sub="bucket">Open →</a></div></div>
  </section>`;
}
const gameTile = (g) => `<button class="tile" data-a="game" data-id="${g.id}"><span class="ico">${g.icon}</span><b>${g.name}</b><small>${g.desc}</small></button>`;

function gamesView() {
  if (!ui.game) {
    return `<section><h2>Games</h2><p class="muted">Heat is ${heatInfo(S.shared.heat).icon} <b>${heatInfo(S.shared.heat).name}</b>. Cards up to this heat appear. <a href="#" data-a="heat">Change</a></p>
      <div class="grid">${GAMES.map(gameTile).join('')}</div></section>`;
  }
  const back = `<button class="back" data-a="back">‹ Games</button>`;
  const fn = { tod: todView, desire: desireView, dice: diceView, dates: datesView, never: neverView, rather: ratherView, hotseat: hotseatView, fantasy: fantasyView }[ui.game];
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
  const g = G(), t = g.turn || 'A', card = g.card;
  return `<h2>🎭 Truth or Dare</h2>${turnBar()}
    <p class="center"><b>${nm(t)}</b>, ${card ? (card.type === 'truth' ? 'answer honestly 👇' : 'your dare 👇') : 'truth or dare?'}</p>
    ${card ? cardHtml(card, card.type === 'truth' ? 'TRUTH' : 'DARE') + `
      <div class="row"><button class="btn" data-a="todDone">${card.type === 'truth' ? 'Answered +5' : 'Done +10'}</button>
      <button class="btn ghost" data-a="todSkip">Skip</button><button class="btn ghost" data-a="hide" data-id="${esc(card.id)}" title="Never show again">🚫</button></div>`
    : `<div class="row big-choices"><button class="choice truth" data-a="tod" data-type="truth">Truth</button><button class="choice dare" data-a="tod" data-type="dare">Dare</button></div>
       <button class="btn ghost wide" data-a="tod" data-type="random">🎲 Surprise me</button>`}
    <p class="muted small center">Skipping is always free. 🚫 removes a card for good.</p>`;
}

function desireItems() { return C.DESIRES.map((d, i) => ({ id: 'X' + i, heat: d[0], text: d[1] })).filter((d) => d.heat <= S.shared.heat); }
function desireMatches() {
  const A = S.shared.desire?.A || {}, B = S.shared.desire?.B || {};
  return C.DESIRES.map((d, i) => ({ id: 'X' + i, text: d[1], a: A['X' + i], b: B['X' + i] }))
    .filter((x) => (x.a === 'yes' || x.a === 'maybe') && (x.b === 'yes' || x.b === 'maybe'));
}
function swiperBar() {
  if (online()) return `<p class="muted small center">You are voting as <b>${nm(S.local.role)}</b>. Your partner votes on their phone.</p>`;
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
  if (sh.heat < 3) {
    return `<section><h2>Positions</h2><div class="card center"><p>🔒 The position planner unlocks at <b>🌶️ Spicy</b> heat.</p>
      <button class="btn" data-a="setHeat" data-h="3">Turn up to Spicy</button></div></section>`;
  }
  const list = C.POSITIONS.filter((p) => p.heat <= sh.heat).filter((p) => {
    const v = sh.pos?.[p.id] || {};
    return ui.posFilter === 'both' ? v.A === 'want' && v.B === 'want' : ui.posFilter === 'tried' ? v.tried : ui.posFilter === 'new' ? !v[r] : true;
  });
  const plan = (sh.plan || []).map((id) => C.POSITIONS.find((p) => p.id === id)).filter(Boolean);
  const dots = (n, c) => c.repeat(n) + '<i>' + c.repeat(3 - n) + '</i>';
  return `<section><h2>Position Planner</h2>${swiperBar()}
    <div class="card plan"><div class="row between"><b>🌙 Tonight's playlist</b><button class="btn sm" data-a="surprise">🎲 Surprise us</button></div>
      ${plan.length ? `<ol>${plan.map((p) => `<li>${esc(p.name)} <button class="mini" data-a="planToggle" data-id="${p.id}">✕</button></li>`).join('')}</ol>` : '<p class="muted small">Add positions with ＋ to plan your next night together.</p>'}</div>
    <div class="chips">${[['all', 'All'], ['both', '✨ Both want'], ['new', 'Not voted'], ['tried', '✓ Tried']].map(([k, l]) => `<button class="chip ${ui.posFilter === k ? 'on' : ''}" data-a="posFilter" data-f="${k}">${l}</button>`).join('')}</div>
    <div class="positions">${list.map((p) => {
      const v = sh.pos?.[p.id] || {}, both = v.A === 'want' && v.B === 'want', inPlan = (sh.plan || []).includes(p.id);
      return `<div class="pos ${both ? 'match' : ''}"><div class="row between"><b>${esc(p.name)}</b>${both ? '<span class="tag">✨ Both want</span>' : ''}${v.tried ? '<span class="tag ok">✓ Tried</span>' : ''}</div>
        <p class="small">${esc(p.desc)}</p>
        <div class="meters"><span>Difficulty ${dots(p.diff, '●')}</span><span>Intimacy ${dots(p.intimacy, '♥')}</span><span>Energy ${dots(p.energy, '⚡')}</span></div>
        <div class="row"><button class="chip ${v[r] === 'want' ? 'on' : ''}" data-a="posVote" data-id="${p.id}" data-v="want">👍 Want</button>
        <button class="chip ${v[r] === 'no' ? 'on' : ''}" data-a="posVote" data-id="${p.id}" data-v="no">👎 Pass</button>
        <button class="chip ${v.tried ? 'on' : ''}" data-a="posTried" data-id="${p.id}">✓ Tried</button>
        <button class="chip ${inPlan ? 'on' : ''}" data-a="planToggle" data-id="${p.id}">${inPlan ? '✓ In plan' : '＋ Plan'}</button></div></div>`;
    }).join('') || '<p class="muted">Nothing here yet.</p>'}</div>
    <p class="muted small">Your partner only sees "Both want" — a pass stays private. Communicate, go slow, stop anytime.</p></section>`;
}

function plansView() {
  const subs = [['meetup', '📅 Meet-up'], ['dates', '🍷 Date ideas'], ['future', '🔮 Future'], ['bucket', '🔥 Bucket list']];
  const fn = { meetup: meetupView, dates: ideasView, future: futureView, bucket: bucketView }[ui.planTab];
  return `<section><h2>Plans</h2><div class="chips">${subs.map(([k, l]) => `<button class="chip ${ui.planTab === k ? 'on' : ''}" data-a="plan" data-sub="${k}">${l}</button>`).join('')}</div>${fn()}</section>`;
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
  const st = { offline: 'Not connected', starting: 'Opening room…', waiting: 'Waiting for your partner…', joining: 'Joining…', connected: 'Connected' }[online() ? 'connected' : net.status] || net.status;
  return `<section><h2>Connect</h2>
    <div class="card status ${online() ? 'live' : ''}"><div><b>${online() ? '🟢' : net.status === 'offline' ? '⚪' : '🟡'} ${st}</b>${online() ? `<p class="small muted">Live with ${nm(other(S.local.role))}. Everything syncs.</p>` : ''}</div>
      ${net.status !== 'offline' || online() ? '<button class="btn sm ghost" data-a="leave">Leave</button>' : ''}</div>
    ${online() ? `
      <div class="row call-row"><button class="btn big" data-a="call" data-video="1">📹 Video call</button><button class="btn big ghost" data-a="call" data-video="0">📞 Voice call</button></div>
      <div class="react-row">${['❤️', '😘', '🔥', '😈', '🥵', '💦'].map((e) => `<button class="mini big" data-a="react" data-e="${e}">${e}</button>`).join('')}</div>
      <div class="card chat"><div class="msgs" id="msgs">${S.local.chat.map((c) => `<div class="msg ${c.from === S.local.role ? 'mine' : ''}">${esc(c.text)}</div>`).join('') || '<p class="muted small center">Say something sweet… or naughty.</p>'}</div>
      <form class="row" data-form="chat"><input name="m" maxlength="1000" autocomplete="off" placeholder="Message ${nm(other(S.local.role))}"><button class="btn sm">Send</button></form></div>`
    : net.host && net.code ? `
      <div class="card center"><div class="muted small">Your room code</div><div class="code">${esc(net.code)}</div>
      <p class="small">Send this to your partner. They tap <b>Join</b> and enter it.</p>
      <div class="row center"><button class="btn sm" data-a="share" data-link="${esc(link)}">📤 Share invite</button><button class="btn sm ghost" data-a="copy" data-link="${esc(link)}">Copy link</button></div></div>`
    : `
      <div class="card"><b>Long distance? Play live.</b><p class="small muted">One of you creates a room, the other joins with the code. Then you get synced games, chat, voice and video calls.</p>
      <button class="btn wide" data-a="create">💌 Create a room</button>
      <form class="row" data-form="join"><input name="code" maxlength="6" placeholder="Room code" value="${esc(ui.joinCode || '')}" style="text-transform:uppercase"><button class="btn ghost">Join</button></form></div>`}
    <h3>Settings</h3>
    <form class="card" data-form="settings">
      <div class="row"><label>Player 1<input name="a" maxlength="30" value="${esc(S.shared.players.A.name)}"></label><label>Player 2<input name="b" maxlength="30" value="${esc(S.shared.players.B.name)}"></label></div>
      <label>Safe word<input name="safe" maxlength="20" value="${esc(S.shared.safeWord)}"></label>
      <label>App lock PIN <small class="muted">(4–8 digits, blank = off)</small><input name="pin" inputmode="numeric" pattern="[0-9]{4,8}" maxlength="8" placeholder="${S.local.pin ? '•••• (set)' : 'Off'}"></label>
      <details><summary class="small">Advanced: own connection server</summary>
        <label>Signaling server (PeerJS) <small class="muted">blank = free public server</small><input name="signal" placeholder="https://peer.yourdomain.com" value="${esc(S.local.signal)}"></label>
        <label>TURN server JSON <small class="muted">for strict mobile networks</small><input name="turn" placeholder='{"urls":"turn:turn.example.com:3478","username":"u","credential":"p"}' value="${esc(S.local.turn)}"></label></details>
      <button class="btn">Save settings</button>
    </form>
    <div class="row"><button class="btn ghost sm" data-a="export">⬇ Backup</button><label class="btn ghost sm">⬆ Restore<input type="file" accept="application/json" data-a="import" hidden></label><button class="btn ghost sm" data-a="unhide">Unhide cards</button><button class="btn danger sm" data-a="reset">Erase everything</button></div>
    <p class="muted small">🔒 No accounts, no tracking. Data lives on this phone. Live play is peer-to-peer and encrypted by WebRTC; a public server only introduces the two phones. Press Esc or 🙈 to hide the app instantly.</p></section>`;
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
  tab: (el) => { ui.tab = el.dataset.tab; if (ui.tab !== 'games') ui.game = null; render(); window.scrollTo(0, 0); },
  game: (el) => openGame(el.dataset.id),
  back: () => { ui.game = null; render(); },
  plan: (el) => { ui.tab = 'plans'; ui.planTab = el.dataset.sub; render(); },
  heat: () => modal(`<h3>Choose the heat</h3><div class="heat-pick">${C.HEAT.map((h) => `<button class="heat-opt btnlike ${S.shared.heat === h.level ? 'on' : ''}" data-a="setHeat" data-h="${h.level}"><span>${h.icon}<b>${h.name}</b><small>${h.hint}</small></span></button>`).join('')}</div><p class="muted small">Both of you see the same heat. Anyone can turn it down anytime.</p><button class="btn ghost wide" data-a="close">Close</button>`),
  setHeat: (el) => { closeModal(); set(['heat'], Number(el.dataset.h)); toast(`Heat: ${heatInfo(Number(el.dataset.h)).icon} ${heatInfo(Number(el.dataset.h)).name}`); },
  close: closeModal,
  tod: (el) => todDraw(el.dataset.type),
  todDone: () => { const g = G(); addPoints(g.turn || 'A', g.card?.type === 'truth' ? 5 : 10); floatEmoji(g.card?.type === 'truth' ? '💬' : '🔥'); nextTurn(); },
  todSkip: () => nextTurn(),
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
    const both = C.POSITIONS.filter((p) => p.heat <= S.shared.heat && S.shared.pos?.[p.id]?.A === 'want' && S.shared.pos?.[p.id]?.B === 'want');
    const pool = both.length ? both : C.POSITIONS.filter((p) => p.heat <= S.shared.heat && S.shared.pos?.[p.id]?.A !== 'no' && S.shared.pos?.[p.id]?.B !== 'no');
    if (!pool.length) return toast('Vote on some positions first');
    const p = rnd(pool);
    modal(`<div class="center"><div class="muted small">${both.length ? 'From the ones you both want' : 'Something new'}</div><h2>${esc(p.name)}</h2><p>${esc(p.desc)}</p>
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
  leave: () => { teardown(); render(); },
  share: async (el) => {
    const url = el.dataset.link;
    if (navigator.share) { try { await navigator.share({ title: 'Intimacy for Couples', text: `Join me 💞 Room code: ${net.code}`, url }); return; } catch { /* cancelled */ } }
    A.copy(el);
  },
  copy: async (el) => { try { await navigator.clipboard.writeText(el.dataset.link); toast('Invite link copied'); } catch { prompt('Copy this link', el.dataset.link); } },
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
      save(); ui.tab = ui.joinCode ? 'connect' : 'home'; render();
      if (ui.joinCode) joinRoom(ui.joinCode);
      break;
    case 'join': ui.joinCode = d.code; joinRoom(d.code); break;
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
      S.local.signal = d.signal.trim(); S.local.turn = d.turn.trim();
      save(); toast('Saved'); render();
      break;
    }
  }
});
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
showLock();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('./sw.js').catch(() => {});
