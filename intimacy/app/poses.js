// Stylised, non-explicit pose illustrations for the position planner.
// Two smooth mannequin figures (rose and violet) on a simple prop (bed, chair, wall).
// Each position maps to one of ~22 pose drawings. Coordinates use a 200×125 canvas.

// Figure: h = head, n = neck/shoulders, p = pelvis, legs/arms = [[knee|elbow], [foot|hand]].
const P = {
  missionary: { prop: 'bed', A: { h: [36, 86], n: [48, 88], p: [100, 89], legs: [[[118, 70], [134, 88]], [[122, 72], [140, 90]]], arms: [[[66, 76], [84, 70]]] },
    B: { h: [52, 68], n: [64, 72], p: [110, 79], legs: [[[142, 84], [176, 89]], [[144, 86], [178, 91]]], arms: [[[54, 84], [46, 90]], [[58, 84], [50, 91]]] } },
  legsUp: { prop: 'bed', A: { h: [34, 88], n: [46, 89], p: [98, 88], legs: [[[112, 62], [118, 34]], [[116, 64], [124, 36]]], arms: [[[60, 80], [76, 74]]] },
    B: { h: [70, 52], n: [82, 58], p: [118, 78], legs: [[[132, 92], [168, 92]], [[134, 92], [170, 94]]], arms: [[[70, 74], [60, 88]], [[74, 74], [64, 89]]] } },
  rider: { prop: 'bed', A: { h: [34, 88], n: [46, 89], p: [108, 89], legs: [[[140, 90], [174, 91]], [[142, 92], [176, 93]]], arms: [[[70, 78], [94, 72]]] },
    B: { h: [100, 26], n: [102, 40], p: [108, 80], legs: [[[86, 90], [112, 93]], [[90, 92], [118, 94]]], arms: [[[90, 56], [80, 72]], [[96, 58], [86, 74]]] } },
  riderLean: { prop: 'bed', A: { h: [34, 88], n: [46, 89], p: [108, 89], legs: [[[140, 90], [174, 91]], [[142, 92], [176, 93]]], arms: [[[62, 76], [80, 70]]] },
    B: { h: [52, 66], n: [64, 70], p: [108, 80], legs: [[[96, 90], [124, 93]], [[100, 92], [128, 94]]], arms: [[[50, 80], [44, 88]]] } },
  reverse: { prop: 'bed', A: { h: [34, 88], n: [46, 89], p: [104, 89], legs: [[[136, 90], [170, 91]], [[138, 92], [172, 93]]], arms: [[[78, 76], [96, 70]]] },
    B: { h: [116, 26], n: [112, 40], p: [104, 80], legs: [[[128, 90], [100, 93]], [[132, 92], [104, 94]]], arms: [[[126, 56], [134, 74]], [[122, 58], [130, 76]]] } },
  spoon: { prop: 'bed', A: { h: [42, 84], n: [54, 86], p: [102, 88], legs: [[[128, 78], [154, 90]], [[126, 82], [152, 92]]], arms: [[[70, 80], [62, 88]]] },
    B: { h: [30, 76], n: [42, 79], p: [92, 81], legs: [[[118, 71], [144, 83]], [[116, 75], [142, 85]]], arms: [[[64, 74], [84, 80]]] } },
  lotus: { prop: 'floor', A: { h: [82, 40], n: [86, 52], p: [94, 96], legs: [[[122, 100], [98, 108]], [[74, 102], [104, 110]]], arms: [[[102, 64], [118, 56]]] },
    B: { h: [120, 34], n: [116, 46], p: [106, 86], legs: [[[82, 84], [66, 100]], [[84, 88], [70, 104]]], arms: [[[100, 54], [88, 50]], [[104, 58], [90, 56]]] } },
  doggy: { prop: 'bed', A: { h: [42, 58], n: [54, 63], p: [108, 62], legs: [[[106, 92], [140, 94]], [[112, 92], [146, 94]]], arms: [[[54, 78], [52, 94]], [[60, 78], [60, 94]]] },
    B: { h: [132, 16], n: [130, 28], p: [124, 64], legs: [[[124, 92], [158, 94]], [[128, 92], [162, 94]]], arms: [[[120, 46], [112, 60]], [[124, 48], [116, 62]]] } },
  lazydog: { prop: 'bed', A: { h: [36, 87], n: [48, 89], p: [102, 90], legs: [[[134, 91], [168, 92]], [[136, 93], [170, 94]]], arms: [[[42, 80], [30, 84]]] },
    B: { h: [50, 72], n: [62, 76], p: [112, 81], legs: [[[144, 87], [178, 90]], [[146, 89], [180, 92]]], arms: [[[56, 86], [48, 90]]] } },
  edge: { prop: 'bedLeft', A: { h: [30, 66], n: [42, 67], p: [108, 68], legs: [[[130, 52], [150, 62]], [[132, 56], [152, 68]]], arms: [[[60, 58], [76, 54]]] },
    B: { h: [154, 22], n: [152, 34], p: [146, 72], legs: [[[146, 96], [140, 118]], [[152, 96], [152, 118]]], arms: [[[140, 50], [126, 60]], [[144, 52], [130, 64]]] } },
  butterfly: { prop: 'bedLeft', A: { h: [30, 66], n: [42, 67], p: [108, 68], legs: [[[132, 52], [154, 34]], [[134, 54], [158, 38]]], arms: [[[60, 58], [76, 54]]] },
    B: { h: [148, 22], n: [146, 34], p: [140, 72], legs: [[[140, 96], [134, 118]], [[146, 96], [146, 118]]], arms: [[[146, 48], [150, 38]], [[142, 50], [146, 40]]] } },
  standing: { prop: 'wall', A: { h: [72, 24], n: [72, 36], p: [76, 72], legs: [[[74, 96], [72, 118]], [[98, 72], [112, 88]]], arms: [[[86, 42], [100, 36]]] },
    B: { h: [96, 22], n: [96, 34], p: [96, 72], legs: [[[98, 96], [100, 118]], [[104, 96], [110, 118]]], arms: [[[84, 50], [74, 44]]] } },
  lifted: { prop: 'wall', A: { h: [72, 18], n: [74, 30], p: [86, 62], legs: [[[106, 60], [114, 76]], [[104, 64], [110, 80]]], arms: [[[88, 30], [104, 26]]] },
    B: { h: [104, 20], n: [104, 32], p: [100, 70], legs: [[[100, 96], [98, 118]], [[106, 96], [110, 118]]], arms: [[[90, 56], [82, 70]]] } },
  standRear: { prop: 'bedLow', A: { h: [44, 54], n: [54, 58], p: [88, 70], legs: [[[86, 96], [84, 118]], [[92, 96], [92, 118]]], arms: [[[44, 70], [34, 84]], [[48, 70], [40, 84]]] },
    B: { h: [110, 20], n: [108, 32], p: [104, 70], legs: [[[106, 96], [108, 118]], [[112, 96], [116, 118]]], arms: [[[98, 50], [90, 64]]] } },
  scissors: { prop: 'bed', A: { h: [26, 86], n: [38, 87], p: [86, 88], legs: [[[110, 82], [132, 92]], [[112, 86], [136, 93]]], arms: [[[50, 80], [40, 90]]] },
    B: { h: [174, 80], n: [162, 81], p: [116, 83], legs: [[[92, 78], [68, 87]], [[90, 82], [66, 90]]], arms: [[[150, 74], [160, 88]]] } },
  chairFacing: { prop: 'chair', A: { h: [76, 26], n: [78, 38], p: [84, 78], legs: [[[108, 80], [110, 116]], [[104, 82], [104, 116]]], arms: [[[92, 56], [106, 50]]] },
    B: { h: [106, 22], n: [104, 34], p: [98, 70], legs: [[[82, 82], [88, 116]], [[118, 82], [122, 116]]], arms: [[[94, 40], [82, 36]]] } },
  chairAway: { prop: 'chair', A: { h: [70, 28], n: [74, 40], p: [82, 78], legs: [[[106, 80], [108, 116]], [[102, 82], [102, 116]]], arms: [[[90, 64], [100, 70]]] },
    B: { h: [100, 22], n: [96, 34], p: [96, 72], legs: [[[118, 82], [124, 116]], [[114, 86], [116, 116]]], arms: [[[112, 50], [122, 62]]] } },
  bridge: { prop: 'bed', A: { h: [40, 90], n: [52, 88], p: [110, 66], legs: [[[124, 82], [128, 94]], [[130, 80], [136, 94]]], arms: [[[50, 92], [58, 95]]] },
    B: { h: [146, 18], n: [144, 30], p: [138, 66], legs: [[[146, 92], [176, 94]], [[150, 92], [180, 94]]], arms: [[[130, 50], [116, 62]]] } },
  oral69: { prop: 'bed', A: { h: [30, 88], n: [42, 89], p: [98, 89], legs: [[[122, 80], [140, 90]], [[126, 82], [146, 91]]], arms: [[[70, 80], [88, 76]]] },
    B: { h: [110, 72], n: [122, 74], p: [64, 76], legs: [[[40, 82], [18, 86]], [[42, 84], [20, 89]]], arms: [[[132, 84], [136, 92]]] } },
  throne: { prop: 'chair', A: { h: [72, 28], n: [76, 40], p: [86, 78], legs: [[[110, 74], [120, 104]], [[108, 80], [112, 116]]], arms: [[[80, 60], [74, 76]]] },
    B: { h: [114, 70], n: [126, 74], p: [148, 92], legs: [[[146, 116], [174, 118]], [[150, 116], [178, 118]]], arms: [[[118, 86], [106, 82]]] } },
  kneel: { prop: 'bed', A: { h: [84, 26], n: [84, 38], p: [86, 74], legs: [[[82, 94], [56, 95]], [[86, 94], [60, 96]]], arms: [[[98, 48], [110, 42]]] },
    B: { h: [114, 26], n: [114, 38], p: [112, 74], legs: [[[116, 94], [142, 95]], [[112, 94], [138, 96]]], arms: [[[100, 54], [90, 48]]] } },
  wheelbarrow: { prop: 'floor', A: { h: [36, 90], n: [48, 92], p: [106, 68], legs: [[[126, 64], [146, 62]], [[124, 68], [144, 66]]], arms: [[[42, 104], [40, 118]], [[50, 104], [50, 118]]] },
    B: { h: [128, 20], n: [126, 32], p: [122, 70], legs: [[[122, 96], [120, 118]], [[128, 96], [130, 118]]], arms: [[[134, 52], [138, 64]]] } },
  pretzel: { prop: 'bed', A: { h: [36, 86], n: [48, 87], p: [100, 88], legs: [[[124, 80], [150, 90]], [[122, 84], [146, 92]]], arms: [[[60, 80], [50, 90]]] },
    B: { h: [120, 22], n: [120, 34], p: [116, 70], legs: [[[110, 92], [140, 94]], [[124, 92], [154, 94]]], arms: [[[110, 50], [104, 66]]] } },
};

// Which drawing each position uses.
const MAP = {
  p1: 'missionary', p2: 'rider', p3: 'reverse', p4: 'spoon', p5: 'lotus', p6: 'doggy', p7: 'lazydog', p8: 'edge', p9: 'standing',
  p10: 'butterfly', p11: 'scissors', p12: 'chairFacing', p13: 'bridge', p14: 'riderLean', p15: 'standRear', p16: 'pretzel', p17: 'legsUp',
  p18: 'doggy', p19: 'rider', p20: 'missionary', p21: 'kneel', p22: 'oral69', p23: 'legsUp', p24: 'riderLean', p25: 'reverse', p26: 'oral69',
  p27: 'wheelbarrow', p28: 'throne', p29: 'chairFacing', p30: 'missionary', p31: 'pretzel', p32: 'edge', p33: 'spoon', p34: 'kneel',
  p35: 'doggy', p36: 'standRear', p37: 'lazydog', p38: 'chairAway', p39: 'lotus', p40: 'lotus', p41: 'legsUp', p42: 'scissors', p43: 'doggy',
  p44: 'spoon', p45: 'lifted', p46: 'standRear', p47: 'chairAway', p48: 'standRear', p49: 'reverse', p50: 'lotus', p51: 'bridge',
  p52: 'scissors', p53: 'standRear', p54: 'rider', p55: 'oral69',
};

const PROPS = {
  bed: '<rect x="6" y="94" width="188" height="16" rx="8" fill="url(#sheet{id})"/><rect x="6" y="106" width="188" height="12" rx="5" fill="#2a1420"/><ellipse cx="30" cy="92" rx="20" ry="6" fill="#f6e4e8" opacity=".9"/>',
  bedLeft: '<rect x="4" y="72" width="122" height="16" rx="8" fill="url(#sheet{id})"/><rect x="8" y="86" width="114" height="33" rx="4" fill="#2a1420"/><ellipse cx="24" cy="70" rx="16" ry="5" fill="#f6e4e8" opacity=".9"/><rect x="0" y="119" width="200" height="6" fill="#1d0e16"/>',
  bedLow: '<rect x="4" y="82" width="70" height="14" rx="7" fill="url(#sheet{id})"/><rect x="8" y="94" width="62" height="25" rx="4" fill="#2a1420"/><rect x="0" y="119" width="200" height="6" fill="#1d0e16"/>',
  wall: '<rect x="44" y="0" width="16" height="119" fill="#2a1622"/><rect x="58" y="0" width="2" height="119" fill="#000" opacity=".25"/><rect x="0" y="119" width="200" height="6" fill="#1d0e16"/>',
  chair: '<rect x="62" y="38" width="8" height="50" rx="3" fill="#5a3326"/><rect x="62" y="79" width="52" height="9" rx="4" fill="#7a4632"/><rect x="64" y="86" width="5" height="33" rx="2" fill="#5a3326"/><rect x="107" y="86" width="5" height="33" rx="2" fill="#5a3326"/><rect x="0" y="119" width="200" height="6" fill="#1d0e16"/>',
  floor: '<ellipse cx="100" cy="114" rx="88" ry="7" fill="url(#sheet{id})" opacity=".85"/><rect x="0" y="119" width="200" height="6" fill="#1d0e16"/>',
};

const SKIN = { A: ['#f6caa8', '#d99773'], B: ['#c98d66', '#93583a'] };
const HAIR = { A: '#3b1f17', B: '#17100e' };
const pt = (a) => `${a[0]},${a[1]}`;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const len = (v) => Math.hypot(v[0], v[1]) || 1;
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// Smooth tapered torso between shoulders and hips.
function torso(n, p, fill) {
  const d = sub(p, n), L = len(d), q = [-d[1] / L, d[0] / L];
  const w = (c, k) => [c[0] + q[0] * k, c[1] + q[1] * k];
  const m = lerp(n, p, 0.62);
  return `<path d="M${pt(w(n, 9.5))} Q${pt(w(m, 6.8))} ${pt(w(p, 9))} L${pt(w(p, -9))} Q${pt(w(m, -6.8))} ${pt(w(n, -9.5))} Z" fill="${fill}" stroke="${fill}" stroke-width="6" stroke-linejoin="round"/>`;
}
const seg = (a, b, w, fill) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${fill}" stroke-width="${w}" stroke-linecap="round"/>`;

function figure(f, who, id) {
  const fill = `url(#skin${who}${id})`, hair = HAIR[who];
  const head = f.h, neckBase = f.n;
  const toNeck = sub(neckBase, head), L = len(toNeck), dir = [toNeck[0] / L, toNeck[1] / L];
  const legs = (f.legs || []).map(([k, ft]) => seg(f.p, k, 13, fill) + `<circle cx="${k[0]}" cy="${k[1]}" r="5.6" fill="${fill}"/>` + seg(k, ft, 9, fill)).join('');
  const arms = (f.arms || []).map(([e, hd]) => seg(f.n, e, 7.5, fill) + seg(e, hd, 6, fill)).join('');
  // Long hair for figure A: frames the head and falls with gravity; short hair for B (cap only).
  const longHair = who === 'A'
    ? `<ellipse cx="${head[0]}" cy="${head[1] + 6}" rx="9.8" ry="11.5" fill="${hair}"/><circle cx="${head[0] - dir[0] * 1.5}" cy="${head[1] - dir[1] * 1.5}" r="10.2" fill="${hair}"/>`
    : '';
  return `<g filter="url(#soft${id})">
    ${legs}
    ${torso(f.n, f.p, fill)}
    ${seg(neckBase, head, 6.5, fill)}
    ${arms}
    ${longHair}
    <circle cx="${head[0]}" cy="${head[1]}" r="8.6" fill="${fill}"/>
    <circle cx="${head[0] - dir[0] * 1.6}" cy="${head[1] - dir[1] * 1.6}" r="8.8" fill="${hair}" clip-path="url(#cap${who}${id})"/>
  </g>`;
}

let uid = 0;
export function poseSvg(posId, cls = 'pose', animate = false) {
  const pose = P[MAP[posId]] || P.missionary;
  const id = ++uid;
  const capClip = (who, f) => { const d = sub(f.n, f.h), L = len(d); const c = [f.h[0] - (d[0] / L) * 9, f.h[1] - (d[1] / L) * 9]; return `<clipPath id="cap${who}${id}"><circle cx="${c[0]}" cy="${c[1]}" r="10"/></clipPath>`; };
  return `<svg class="${cls}${animate ? ' anim' : ''}" viewBox="0 0 200 125" role="img" aria-label="Position illustration" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="room${id}" cx=".78" cy=".12" r="1"><stop offset="0" stop-color="#6b2a3a"/><stop offset=".45" stop-color="#2c1220"/><stop offset="1" stop-color="#120810"/></radialGradient>
    <radialGradient id="lamp${id}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffcf8a" stop-opacity=".55"/><stop offset="1" stop-color="#ffcf8a" stop-opacity="0"/></radialGradient>
    <linearGradient id="sheet${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d3da"/><stop offset="1" stop-color="#b57d8e"/></linearGradient>
    <linearGradient id="skinA${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="60" y2="125"><stop offset="0" stop-color="${SKIN.A[0]}"/><stop offset="1" stop-color="${SKIN.A[1]}"/></linearGradient>
    <linearGradient id="skinB${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="60" y2="125"><stop offset="0" stop-color="${SKIN.B[0]}"/><stop offset="1" stop-color="${SKIN.B[1]}"/></linearGradient>
    <filter id="soft${id}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2.5" stdDeviation="2.2" flood-color="#000" flood-opacity=".5"/></filter>
    ${capClip('A', pose.A)}${capClip('B', pose.B)}
  </defs>
  <rect width="200" height="125" fill="url(#room${id})"/>
  <circle cx="168" cy="20" r="46" fill="url(#lamp${id})"/>
  <rect x="160" y="10" width="14" height="10" rx="3" fill="#ffd9a0" opacity=".85"/>
  ${(PROPS[pose.prop] || '').replaceAll('{id}', id)}
  <g class="figA">${figure(pose.A, 'A', id)}</g>
  <g class="figB">${figure(pose.B, 'B', id)}</g>
</svg>`;
}

export const POSE_IDS = Object.keys(MAP);
export const poseKind = (posId) => MAP[posId] || 'missionary';
