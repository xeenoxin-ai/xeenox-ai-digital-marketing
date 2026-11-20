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
  bed: '<rect x="8" y="96" width="184" height="14" rx="7" fill="url(#bed)"/><rect x="8" y="108" width="184" height="6" rx="3" fill="#000" opacity=".25"/>',
  bedLeft: '<rect x="6" y="74" width="118" height="14" rx="7" fill="url(#bed)"/><rect x="10" y="86" width="110" height="32" rx="4" fill="#000" opacity=".18"/><line x1="4" y1="119" x2="196" y2="119" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>',
  bedLow: '<rect x="6" y="84" width="66" height="12" rx="6" fill="url(#bed)"/><rect x="10" y="94" width="58" height="24" rx="4" fill="#000" opacity=".18"/><line x1="4" y1="119" x2="196" y2="119" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>',
  wall: '<rect x="50" y="4" width="10" height="115" rx="3" fill="url(#bed)" opacity=".7"/><line x1="4" y1="119" x2="196" y2="119" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>',
  chair: '<rect x="66" y="80" width="46" height="8" rx="4" fill="url(#bed)"/><rect x="64" y="40" width="7" height="48" rx="3" fill="url(#bed)" opacity=".8"/><line x1="70" y1="88" x2="68" y2="118" stroke="#d9a7bf" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/><line x1="108" y1="88" x2="110" y2="118" stroke="#d9a7bf" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/><line x1="4" y1="119" x2="196" y2="119" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>',
  floor: '<ellipse cx="100" cy="114" rx="84" ry="6" fill="url(#bed)" opacity=".8"/>',
};

const pt = (a) => `${a[0]},${a[1]}`;
function figure(f, fill, id) {
  const limb = (from, [mid, end], w) => `<polyline points="${pt(from)} ${pt(mid)} ${pt(end)}" fill="none" stroke="url(#${fill})" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<g filter="url(#soft${id})">
    ${(f.legs || []).map((l) => limb(f.p, l, 10)).join('')}
    <line x1="${f.n[0]}" y1="${f.n[1]}" x2="${f.p[0]}" y2="${f.p[1]}" stroke="url(#${fill})" stroke-width="17" stroke-linecap="round"/>
    ${(f.arms || []).map((a) => limb(f.n, a, 7)).join('')}
    <circle cx="${f.h[0]}" cy="${f.h[1]}" r="9" fill="url(#${fill})"/>
  </g>`;
}

let uid = 0;
export function poseSvg(posId, cls = 'pose') {
  const pose = P[MAP[posId]] || P.missionary;
  const id = ++uid;
  return `<svg class="${cls}" viewBox="0 0 200 125" role="img" aria-label="Pose illustration" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ga${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="200" y2="125"><stop offset="0" stop-color="#ff7aa8"/><stop offset="1" stop-color="#e0306f"/></linearGradient>
    <linearGradient id="gb${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="200" y2="125"><stop offset="0" stop-color="#b98cff"/><stop offset="1" stop-color="#6d3bd6"/></linearGradient>
    <linearGradient id="bed${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3c98b" stop-opacity=".55"/><stop offset="1" stop-color="#b9708f" stop-opacity=".35"/></linearGradient>
    <filter id="soft${id}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity=".45"/></filter>
  </defs>
  ${(PROPS[pose.prop] || '').replaceAll('url(#bed)', `url(#bed${id})`)}
  ${figure(pose.A, `ga${id}`, id)}
  ${figure(pose.B, `gb${id}`, id)}
</svg>`;
}

export const POSE_IDS = Object.keys(MAP);
