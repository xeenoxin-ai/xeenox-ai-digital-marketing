// SB Felines — "Healthy vs Unhealthy food for cats" 30s 9:16 motion graphic.
// Deterministic: render(t) draws the frame at time t (seconds).
const W = 1080, H = 1920;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const IMG = {};

window.loadEmojis = async (map) => {
  for (const [k, url] of Object.entries(map)) {
    const im = new Image();
    im.src = url;
    await im.decode();
    const oc = document.createElement('canvas');
    oc.width = oc.height = 720;
    oc.getContext('2d').drawImage(im, 0, 0, 720, 720);
    IMG[k] = oc;
  }
};

// ---------- easing / helpers ----------
const C = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const P = (t, a, d) => C((t - a) / d);
const L = (a, b, x) => a + (b - a) * x;
const eOC = x => 1 - Math.pow(1 - C(x), 3);
const eIOC = x => { x = C(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const eOB = (x, s = 1.9) => { x = C(x); return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
const eOE = x => { x = C(x); return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * 2.0944) + 1; };
const DISPLAY = '"Inter Display", Inter, sans-serif';
const BODY = 'Inter, sans-serif';
const YEL = '#FFC93C', GRN = '#22C55E', RED = '#FF4D5E', PINK = '#FF5FA2';

function emoji(k, x, y, s, o = {}) {
  const { rot = 0, a = 1, sx = 1, sy = 1, shadow = true } = o;
  if (s <= 0.5 || a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= C(a);
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx, sy);
  if (shadow) { ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = s * .08; ctx.shadowOffsetY = s * .05; }
  ctx.drawImage(IMG[k], -s / 2, -s / 2, s, s);
  ctx.restore();
}

function font(size, weight = 900, fam = DISPLAY) { return `${weight} ${size}px ${fam}`; }

function text(str, x, y, o = {}) {
  const { size = 80, weight = 900, fam = DISPLAY, color = '#fff', align = 'center', a = 1,
    shadow = true, maxW = 0, rot = 0, sc = 1, stroke = null, sw = 0 } = o;
  if (a <= 0 || sc <= 0) return;
  ctx.save();
  ctx.globalAlpha *= C(a);
  let s = size;
  ctx.font = font(s, weight, fam);
  if (maxW) { const w = ctx.measureText(str).width; if (w > maxW) { s = s * maxW / w; ctx.font = font(s, weight, fam); } }
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.textAlign = align; ctx.textBaseline = 'middle';
  if (shadow) { ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6; }
  if (stroke) { ctx.lineJoin = 'round'; ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.strokeText(str, 0, 0); }
  ctx.fillStyle = color; ctx.fillText(str, 0, 0);
  ctx.restore();
}

// Letter-by-letter drop-in. colors: per-letter color function.
function letters(str, cx, y, t, t0, o = {}) {
  const { size = 140, stagger = .045, dur = .5, colorAt = () => '#fff', a = 1 } = o;
  ctx.save();
  ctx.font = font(size);
  const widths = [...str].map(ch => ctx.measureText(ch).width);
  const total = widths.reduce((p, q) => p + q, 0);
  let x = cx - total / 2;
  [...str].forEach((ch, i) => {
    const p = P(t, t0 + i * stagger, dur);
    if (p > 0 && ch !== ' ') {
      const yy = y - (1 - eOB(p, 2.4)) * 140;
      text(ch, x + widths[i] / 2, yy, { size, color: colorAt(i), a: Math.min(1, p * 3) * a, sc: L(.4, 1, eOB(p)) });
    }
    x += widths[i];
  });
  ctx.restore();
}

function wrap(str, maxW, size, weight = 600, fam = BODY) {
  ctx.save(); ctx.font = font(size, weight, fam);
  const words = str.split(' '); const lines = []; let cur = '';
  for (const w of words) {
    const tryL = cur ? cur + ' ' + w : w;
    if (ctx.measureText(tryL).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tryL;
  }
  if (cur) lines.push(cur);
  ctx.restore(); return lines;
}

function rrect(x, y, w, h, r, fill, o = {}) {
  ctx.save();
  if (o.shadow !== false) { ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; }
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
  if (o.stroke) { ctx.shadowColor = 'transparent'; ctx.lineWidth = o.sw || 4; ctx.strokeStyle = o.stroke; ctx.stroke(); }
  ctx.restore();
}

function pill(label, cx, cy, o = {}) {
  const { size = 44, bg = YEL, color = '#1b0f36', padX = 36, h = size * 1.75, a = 1, sc = 1, icon = null } = o;
  if (a <= 0 || sc <= 0) return;
  ctx.save(); ctx.globalAlpha *= C(a);
  ctx.font = font(size, 800);
  const iw = icon ? size * 1.25 : 0;
  const w = ctx.measureText(label).width + padX * 2 + iw;
  ctx.translate(cx, cy); ctx.scale(sc, sc);
  rrect(-w / 2, -h / 2, w, h, h / 2, bg);
  if (icon) emoji(icon, -w / 2 + padX + iw / 2 - 6, 0, size * 1.15, { shadow: false });
  text(label, iw / 2, 2, { size, weight: 800, color, shadow: false });
  ctx.restore();
}

// beat pulse (120 bpm), drums from t=4
const beat = t => t < 4 ? 0 : Math.exp(-((t % .5)) * 9);

// ---------- background ----------
const PAWS = Array.from({ length: 16 }, (_, i) => ({
  x: (i * 397 + 120) % W, y0: (i * 811) % (H + 300), s: 70 + (i * 37) % 60, r: ((i * 53) % 100) / 100 - .5, v: 35 + (i * 17) % 40
}));
function background(t) {
  const g = ctx.createLinearGradient(0, 0, W * .3, H);
  g.addColorStop(0, '#34186b'); g.addColorStop(.55, '#1d0e45'); g.addColorStop(1, '#0f0828');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const b = beat(t);
  const blobs = [
    { c: '255,95,162', x: 180, y: 300, r: 620, f: .41 },
    { c: '108,92,255', x: 920, y: 1050, r: 720, f: .33 },
    { c: '34,211,166', x: 200, y: 1700, r: 560, f: .27 },
  ];
  blobs.forEach((bl, i) => {
    const x = bl.x + Math.sin(t * bl.f + i) * 140, y = bl.y + Math.cos(t * bl.f * 1.3 + i * 2) * 160;
    const rg = ctx.createRadialGradient(x, y, 0, x, y, bl.r * (1 + b * .04));
    rg.addColorStop(0, `rgba(${bl.c},${.30 + b * .06})`); rg.addColorStop(1, `rgba(${bl.c},0)`);
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  });
  PAWS.forEach(p => {
    const y = ((p.y0 - t * p.v) % (H + 300) + H + 300) % (H + 300) - 150;
    emoji('1f43e', p.x, y, p.s, { rot: p.r + Math.sin(t + p.x) * .1, a: .07, shadow: false });
  });
}

// ---------- transitions ----------
const CUTS = [4, 7, 11, 15, 19, 23, 26];
function wipe(t) {
  CUTS.forEach((T, i) => {
    const p = P(t, T - .3, .6);
    if (p <= 0 || p >= 1) return;
    const e = eIOC(p);
    const skew = 600, bw = W + skew + 300;
    const cols = [[PINK, YEL], [YEL, '#22D3A6'], ['#22D3A6', '#7C5CFF']][i % 3];
    [[cols[0], -160], [cols[1], 0]].forEach(([col, off]) => {
      const x0 = L(-bw, W + skew, e) + off;
      ctx.beginPath();
      ctx.moveTo(x0, 0); ctx.lineTo(x0 + bw, 0); ctx.lineTo(x0 + bw - skew, H); ctx.lineTo(x0 - skew, H);
      ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    });
  });
}

// ---------- scenes ----------
function intro(t) {
  // paw trail
  for (let i = 0; i < 6; i++) {
    const p = P(t, .05 + i * .12, .25);
    const x = 140 + i * 160, y = 1820 - i * 90 + (i % 2) * 50;
    emoji('1f43e', x, y, 110 * eOB(p), { rot: -.5, a: p * (1 - P(t, 3.2, .6)) * .9 });
  }
  // glow plate + cat
  const pg = eOE(P(t, .25, 1.1));
  const cy = 700;
  ctx.save();
  const rg = ctx.createRadialGradient(540, cy, 0, 540, cy, 360 * pg);
  rg.addColorStop(0, 'rgba(255,201,60,.55)'); rg.addColorStop(.6, 'rgba(255,95,162,.18)'); rg.addColorStop(1, 'rgba(255,95,162,0)');
  ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(540, cy, 250 * pg, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fill();
  ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(255,201,60,.8)'; ctx.stroke(); ctx.restore();
  const pc = eOE(P(t, .4, 1.1));
  emoji('1f63a', 540, cy + Math.sin(t * 3) * 10, 360 * pc, { rot: Math.sin(t * 2.2) * .06 });
  // sparkles
  [[300, 470, .9], [800, 520, 1.2], [770, 900, 1.5]].forEach(([x, y, d]) => {
    const p = P(t, d, .5);
    emoji('2728', x, y, 90 * eOB(p) * (1 + .1 * Math.sin(t * 6 + x)), { a: p });
  });
  // logo
  letters('SB FELINES', 540, 1100, t, 1.0, { size: 150, colorAt: i => i < 2 ? YEL : '#fff' });
  pill('Cat Nutrition Guide', 540, 1260, { icon: '1f43e', a: P(t, 1.7, .3), sc: eOB(P(t, 1.7, .45)), size: 46 });
  // question
  const q1 = P(t, 2.3, .45), q2 = P(t, 2.55, .45);
  text('Is your cat', 540, 1490 + (1 - eOC(q1)) * 80, { size: 104, a: q1 });
  const sc = eOB(q2);
  if (q2 > 0) {
    ctx.save(); ctx.translate(540, 1625 + (1 - eOC(q2)) * 80); ctx.rotate(-.03); ctx.scale(sc, sc);
    ctx.font = font(112); const w = ctx.measureText('eating RIGHT?').width;
    rrect(-w / 2 - 34, -78, w + 68, 156, 34, YEL);
    text('eating RIGHT?', 0, 4, { size: 112, color: '#1b0f36', shadow: false });
    ctx.restore();
  }
}

function title(t) {
  const u = t - 4;
  const ph = eOB(P(u, .1, .55));
  text('HEALTHY', L(-700, 540, ph), 660, { size: 190, color: GRN, rot: -.05, stroke: '#0b3d20', sw: 14 });
  emoji('1f41f', 900, 470, 190 * eOE(P(u, .45, .9)), { rot: .2 + Math.sin(t * 3) * .1 });
  const pv = eOE(P(u, .45, 1));
  const vb = 1 + beat(t) * .08;
  if (pv > 0) {
    ctx.save(); ctx.translate(540, 950); ctx.rotate((1 - pv) * -3); ctx.scale(pv * vb, pv * vb);
    ctx.beginPath(); ctx.arc(0, 0, 140, 0, Math.PI * 2); ctx.fillStyle = YEL;
    ctx.shadowColor = 'rgba(255,201,60,.6)'; ctx.shadowBlur = 60; ctx.fill();
    text('VS', 0, 6, { size: 130, color: '#1b0f36', shadow: false });
    ctx.restore();
  }
  const pu = eOB(P(u, .7, .55));
  text('UNHEALTHY', L(1700, 540, pu), 1240, { size: 168, color: RED, rot: -.05, stroke: '#4a0a14', sw: 14 });
  emoji('1f36b', 190, 1440, 190 * eOE(P(u, 1.0, .9)), { rot: -.3 + Math.sin(t * 3) * .1 });
  const ps = P(u, 1.3, .5);
  text('What to feed', 540, 1560 + (1 - eOC(ps)) * 60, { size: 76, a: ps, weight: 800 });
  text('& what to AVOID', 540, 1660 + (1 - eOC(ps)) * 60, { size: 76, a: ps, weight: 800, color: YEL });
}

const ROUNDS = [
  { good: { em: [['1f41f', 0, 0, 300]], name: ['Cooked', 'Fish'], desc: 'Plain & boneless. Packed with protein + omega-3.' },
    bad: { em: [['1f9c5', -45, -30, 250], ['1f9c4', 75, 70, 190]], name: ['Onion &', 'Garlic'], desc: 'Even small amounts damage red blood cells.' } },
  { good: { em: [['1f357', 0, 0, 300]], name: ['Boiled', 'Chicken'], desc: 'Skinless, boneless lean protein cats love.' },
    bad: { em: [['1f36b', 0, 0, 290]], name: ['Chocolate'], desc: 'Contains theobromine – toxic to cats.' } },
  { good: { em: [['1f4a7', 0, 0, 290]], name: ['Fresh', 'Water'], desc: 'Keeps kidneys & urinary tract healthy.' },
    bad: { em: [['1f95b', 0, 0, 290]], name: ["Cow's", 'Milk'], desc: 'Most adult cats are lactose intolerant.' } },
  { good: { em: [['1f373', 0, 0, 300]], name: ['Cooked', 'Egg'], desc: 'Fully cooked – easy, complete protein.' },
    bad: { em: [['1f347', 0, 0, 290]], name: ['Grapes &', 'Raisins'], desc: 'Can cause kidney damage. Keep away!' } },
];

function card(kind, d, x0, y0, u, tIn, t) {
  const good = kind === 'good';
  const p = eOB(P(u, tIn, .55), 1.4);
  if (p <= 0) return;
  let dx = good ? L(-1150, 0, p) : L(1150, 0, p);
  if (!good) { const s = P(u, tIn + 1.0, .45); if (s > 0 && s < 1) dx += Math.sin(s * 40) * 18 * (1 - s); }
  const x = x0 + dx, y = y0, w = 960, h = 690;
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  if (good) { g.addColorStop(0, '#2BD883'); g.addColorStop(1, '#0E8F55'); } else { g.addColorStop(0, '#FF6B6B'); g.addColorStop(1, '#C3123A'); }
  rrect(x, y, w, h, 64, g, { stroke: 'rgba(255,255,255,.35)', sw: 5 });
  // inner light
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 64); ctx.clip();
  ctx.beginPath(); ctx.arc(x + 260, y + 420, 250, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fill();
  ctx.restore();
  // label pill
  pill(good ? 'HEALTHY' : 'AVOID', x + (good ? 215 : 185), y + 82, { size: 46, bg: '#fff', color: good ? '#0E8F55' : '#C3123A', icon: good ? '2705' : '1f6ab' });
  // food emoji
  const pe = eOE(P(u, tIn + .3, .9));
  const bob = Math.sin(t * 4 + (good ? 0 : 1.5)) * 10;
  d.em.forEach(([k, ex, ey, es], i) => emoji(k, x + 265 + ex, y + 410 + ey + bob, es * eOE(P(u, tIn + .3 + i * .12, .9)), { rot: Math.sin(t * 2.5 + i) * .08 }));
  if (!good) {
    const pb = P(u, tIn + 1.0, .35);
    emoji('1f6ab', x + 265, y + 410, 380 * L(1.8, 1, eOB(pb)), { a: pb * .92 });
  }
  // texts
  const pt = eOC(P(u, tIn + .45, .5));
  const tx = x + 520 + (1 - pt) * 60;
  const ny = y + (d.name.length > 1 ? 250 : 300);
  d.name.forEach((ln, i) => text(ln, tx, ny + i * 92, { size: 88, align: 'left', a: pt, maxW: 410 }));
  const dl = wrap(d.desc, 400, 40, 600);
  const dy = ny + d.name.length * 92 + 20;
  dl.forEach((ln, i) => text(ln, tx, dy + i * 52, { size: 40, weight: 600, fam: BODY, align: 'left', a: pt, color: 'rgba(255,255,255,.95)', shadow: false }));
  // stamp
  const ps = P(u, tIn + (good ? .95 : 1.0), .4);
  if (ps > 0) {
    const s = L(2.6, 1, eOB(ps));
    emoji(good ? '2705' : '274c', x + w - 110, y + 110, 150 * s, { rot: -.25, a: Math.min(1, ps * 2.5) });
  }
}

function round(t, T, i) {
  const u = t - T, d = ROUNDS[i];
  pill(`TIP ${i + 1} OF 4`, 540, 150, { size: 42, a: P(u, 0, .3), sc: eOB(P(u, 0, .45)), bg: 'rgba(255,255,255,.14)', color: '#fff' });
  card('good', d.good, 60, 240, u, .05, t);
  const pv = eOE(P(u, .8, .8)), vb = 1 + beat(t) * .08;
  card('bad', d.bad, 60, 1000, u, .9, t);
  if (pv > 0) {
    ctx.save(); ctx.translate(540, 965); ctx.scale(pv * vb, pv * vb); ctx.rotate((1 - pv) * 2);
    ctx.beginPath(); ctx.arc(0, 0, 86, 0, Math.PI * 2); ctx.fillStyle = YEL; ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 30; ctx.fill();
    ctx.lineWidth = 10; ctx.strokeStyle = '#1b0f36'; ctx.stroke();
    text('VS', 0, 5, { size: 76, color: '#1b0f36', shadow: false });
    ctx.restore();
  }
  // watermark
  emoji('1f43e', 340, 1810, 56, { a: .85, shadow: false });
  text('SB FELINES', 560, 1812, { size: 50, weight: 900, color: 'rgba(255,255,255,.85)', shadow: false });
}

function happy(t) {
  const u = t - 23;
  const pc = eOE(P(u, .05, 1.1));
  // heart burst
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2 + .2, p = P(u, .25 + (i % 3) * .08, 1.6);
    if (p <= 0) continue;
    const r = L(120, 520 + (i % 4) * 40, eOC(p));
    emoji(i % 3 ? '1f496' : '2764', 540 + Math.cos(a) * r, 760 + Math.sin(a) * r * .9, (70 + (i % 3) * 20) * eOB(Math.min(1, p * 4)), { a: 1 - P(p, .6, .4), rot: Math.sin(a) * .4 });
  }
  const rg = ctx.createRadialGradient(540, 760, 0, 540, 760, 380 * pc);
  rg.addColorStop(0, 'rgba(255,201,60,.5)'); rg.addColorStop(1, 'rgba(255,95,162,0)');
  ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  emoji('1f63b', 540, 760 + Math.sin(t * 3.5) * 14, 460 * pc, { rot: Math.sin(t * 2.4) * .07 });
  const p1 = P(u, .5, .5), p2 = P(u, .8, .5);
  text('Healthy Food', 540, 1210, { size: 132, color: '#4ADE80', a: p1, sc: eOB(p1), stroke: '#0b3d20', sw: 12 });
  text('= Happy Cat!', 540, 1360, { size: 132, color: YEL, a: p2, sc: eOB(p2), stroke: '#5a3a00', sw: 12 });
  const p3 = P(u, 1.3, .5);
  text('Feed smart. Love more.', 540, 1540 + (1 - eOC(p3)) * 50, { size: 64, weight: 700, a: p3 });
  emoji('1f43e', 540, 1660, 90 * eOB(P(u, 1.6, .45)), { a: P(u, 1.6, .3) });
}

function endcard(t) {
  const u = t - 26;
  const fadeOut = 1 - P(t, 29.55, .45);
  ctx.save(); ctx.globalAlpha = fadeOut;
  emoji('1f431', 540, 230 + Math.sin(t * 3) * 8, 190 * eOE(P(u, .05, 1)), { rot: Math.sin(t * 2) * .06 });
  letters('SB FELINES', 540, 420, t, 26.2, { size: 140, stagger: .035, colorAt: i => i < 2 ? YEL : '#fff' });
  const pv = P(u, .7, .4);
  pill('VISIT US TODAY!', 540, 560, { size: 50, a: pv, sc: eOB(pv) * (1 + beat(t) * .05), bg: PINK, color: '#fff' });

  const cards = [
    { y: 670, h: 430, icon: '1f4cd', label: 'ADDRESS', lines: ['GN-21, USHUS 40/908, Gandhinagar,', 'Pallipuram PO, Palakkad-Shoranur Rd,', 'Chakanthara, Palakkad,', 'Keralam 678006'], size: 42, d: .9 },
    { y: 1130, h: 230, icon: '1f4de', label: 'CALL US', lines: ['087145 62875'], size: 84, d: 1.15, big: true },
    { y: 1390, h: 230, icon: '1f559', label: 'OPEN ALL DAYS', lines: ['10 AM – 6 PM'], size: 84, d: 1.4, big: true },
  ];
  cards.forEach(c => {
    const p = eOB(P(u, c.d, .55), 1.3);
    if (p <= 0) return;
    const yy = c.y + (1 - p) * 220;
    ctx.save(); ctx.globalAlpha *= C(p * 1.5);
    rrect(60, yy, 960, c.h, 48, 'rgba(255,255,255,.11)', { stroke: 'rgba(255,255,255,.28)', sw: 3 });
    const pulse = c.big ? 1 + beat(t) * .03 : 1;
    emoji(c.icon, 160, yy + (c.big ? c.h / 2 : 95), 110 * pulse, {});
    text(c.label, 250, yy + (c.big ? 62 : 70), { size: 38, weight: 800, fam: BODY, color: YEL, align: 'left', shadow: false });
    c.lines.forEach((ln, i) => {
      if (c.big) text(ln, 250, yy + 148, { size: c.size, align: 'left', sc: pulse, maxW: 720 });
      else text(ln, 250, yy + 140 + i * 66, { size: c.size, weight: 600, fam: BODY, align: 'left', maxW: 730, shadow: false });
    });
    ctx.restore();
  });
  const pf = P(u, 1.9, .5);
  text('Healthy food. Happy cats.', 540, 1730 + (1 - eOC(pf)) * 40, { size: 62, weight: 800, a: pf });
  for (let i = 0; i < 5; i++) emoji('1f43e', 300 + i * 120, 1835, 60 * eOB(P(u, 2.1 + i * .08, .3)), { a: .8, rot: -.4 });
  ctx.restore();
  if (fadeOut < 1) { ctx.fillStyle = `rgba(10,5,25,${1 - fadeOut})`; ctx.fillRect(0, 0, W, H); }
}

window.render = (t) => {
  ctx.clearRect(0, 0, W, H);
  background(t);
  if (t < 4) intro(t);
  else if (t < 7) title(t);
  else if (t < 23) round(t, 7 + Math.floor((t - 7) / 4) * 4, Math.floor((t - 7) / 4));
  else if (t < 26) happy(t);
  else endcard(t);
  wipe(t);
};
