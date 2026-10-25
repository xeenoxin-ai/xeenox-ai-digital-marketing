// Turn-by-turn navigation logic (no DOM, no map): where am I on the route,
// what is the next turn, when to speak, and am I off the route.
// Points are [lat, lon]; distances in metres.

import { haversine, pointToSegment } from './geo.js';

// ---------- Maneuver kinds ----------

// Valhalla maneuver type → arrow kind.
const VALHALLA_KIND = {
  1: 'depart', 2: 'depart', 3: 'depart',
  4: 'arrive', 5: 'arrive', 6: 'arrive',
  9: 'slight-right', 18: 'slight-right', 20: 'slight-right', 23: 'slight-right',
  10: 'right', 11: 'sharp-right',
  12: 'uturn', 13: 'uturn',
  14: 'sharp-left', 15: 'left',
  16: 'slight-left', 19: 'slight-left', 21: 'slight-left', 24: 'slight-left',
  25: 'merge', 37: 'merge', 38: 'merge',
  26: 'roundabout', 27: 'roundabout',
};

export function valhallaKind(type) {
  return VALHALLA_KIND[type] || 'straight';
}

const MODIFIER_KIND = {
  uturn: 'uturn',
  'sharp right': 'sharp-right',
  right: 'right',
  'slight right': 'slight-right',
  straight: 'straight',
  'slight left': 'slight-left',
  left: 'left',
  'sharp left': 'sharp-left',
};

const ORDINAL = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];

// OSRM step → { kind, text } (OSRM has no instruction text, so we write it).
export function osrmInstruction(step) {
  const { type, modifier, exit } = step.maneuver;
  const name = step.name || step.ref || '';
  const onto = name ? ` onto ${name}` : '';
  const side = modifier?.includes('left') ? 'left' : 'right';
  const turn = modifier && modifier !== 'straight' ? `turn ${modifier}` : 'continue straight';
  const cap = (s) => s[0].toUpperCase() + s.slice(1);

  if (type === 'depart') return { kind: 'depart', text: `Head ${name ? `along ${name}` : 'off'}.` };
  if (type === 'arrive') return { kind: 'arrive', text: 'You have arrived at your destination.' };
  if (/roundabout|rotary/.test(type)) {
    const nth = exit ? `the ${ORDINAL[exit - 1] || `${exit}th`} exit` : 'the exit';
    return { kind: 'roundabout', text: `At the roundabout, take ${nth}${onto}.` };
  }
  const kind = MODIFIER_KIND[modifier] || 'straight';
  if (type === 'merge') return { kind: 'merge', text: `Merge${onto}.` };
  if (type === 'fork') return { kind, text: `Keep ${side} at the fork${onto}.` };
  if (type === 'off ramp') return { kind, text: `Take the exit on the ${side}${onto}.` };
  if (type === 'on ramp') return { kind, text: `Take the ramp on the ${side}${onto}.` };
  if (type === 'end of road') return { kind, text: `At the end of the road, ${turn}${onto}.` };
  if (type === 'new name' || type === 'continue') return { kind, text: `Continue${onto}.` };
  return { kind, text: `${cap(turn)}${onto}.` };
}

// ---------- Route preparation ----------

// Turn a route (line + raw maneuvers from routing.js) into a navigation plan:
// cumulative distance along the line and each maneuver's position on it.
export function prepareNav(route) {
  const { line } = route;
  const cum = [0];
  for (let i = 1; i < line.length; i++) cum.push(cum[i - 1] + haversine(line[i - 1], line[i]));
  const total = cum[cum.length - 1];

  let searchFrom = 0;
  const maneuvers = (route.maneuvers || []).map((m, id) => {
    let index = m.index;
    if (index == null) {
      // OSRM gives a location, not a shape index: find it, moving forward only.
      index = nearestIndex(line, m.location, searchFrom);
      searchFrom = index;
    }
    index = Math.min(index, line.length - 1);
    return { ...m, id, index, along: cum[index] };
  });
  return { line, cum, total, maneuvers, duration: route.total ?? route.duration };
}

function nearestIndex(line, p, from) {
  let best = from, bestD = Infinity;
  for (let i = from; i < line.length; i++) {
    const d = haversine(line[i], p);
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

// ---------- Position on route ----------

// Snap a GPS fix to the route. `hint` is the previous segment index, so we
// search near it first (fast, and avoids jumping to a parallel part of the
// route); if that fails we search the whole route.
export function locateOnRoute(nav, pos, hint = 0) {
  const { line, cum } = nav;
  const scan = (from, to) => {
    let best = { seg: from, dist: Infinity };
    for (let i = Math.max(1, from); i <= Math.min(line.length - 1, to); i++) {
      const d = pointToSegment(pos, line[i - 1], line[i]);
      if (d < best.dist) best = { seg: i, dist: d };
    }
    return best;
  };
  let best = scan(hint - 5, hint + 300);
  if (best.dist > 60) {
    const all = scan(1, line.length - 1);
    if (all.dist < best.dist) best = all;
  }
  const a = line[best.seg - 1], b = line[best.seg];
  const segLen = haversine(a, b);
  const fromA = segLen ? Math.min(segLen, Math.sqrt(Math.max(0, haversine(a, pos) ** 2 - best.dist ** 2))) : 0;
  return {
    segment: best.seg,
    offRoute: best.dist,
    along: cum[best.seg - 1] + fromA,
    bearing: bearing(a, b),
  };
}

export function bearing(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const y = Math.sin(toRad(b[1] - a[1])) * Math.cos(toRad(b[0]));
  const x = Math.cos(toRad(a[0])) * Math.sin(toRad(b[0])) -
    Math.sin(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.cos(toRad(b[1] - a[1]));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// Next maneuver ahead of `along`, the one after it, and what is left.
export function progress(nav, along) {
  const ahead = nav.maneuvers.filter((m) => m.along > along + 3 && m.kind !== 'depart');
  const next = ahead[0] || nav.maneuvers[nav.maneuvers.length - 1];
  const remaining = Math.max(0, nav.total - along);
  return {
    next,
    then: ahead[1] || null,
    toNext: next ? Math.max(0, next.along - along) : remaining,
    remaining,
    remainingTime: nav.total ? (nav.duration * remaining) / nav.total : 0,
  };
}

// ---------- Voice ----------

// Which announcement is due for the next maneuver: 'far' (about 500 m out),
// 'near' (just before the turn) or null. `spoken` remembers what was said.
export function dueAnnouncement(next, toNext, spoken) {
  if (!next) return null;
  const key = (stage) => `${next.id}:${stage}`;
  // Arrival itself is announced by the drive session, so only warn ahead of it.
  if (toNext <= 120 && next.kind !== 'arrive' && !spoken.has(key('near'))) return 'near';
  if (toNext <= 600 && toNext > 250 && !spoken.has(key('far')) && !spoken.has(key('near'))) return 'far';
  return null;
}

export function spokenDistance(m) {
  if (m >= 1000) {
    const km = Math.round(m / 100) / 10;
    return `${km} kilometre${km === 1 ? '' : 's'}`;
  }
  return `${Math.max(50, Math.round(m / 50) * 50)} metres`;
}

export function announcementText(next, toNext, stage) {
  const text = next.verbal || next.text;
  if (stage === 'far') return `In ${spokenDistance(toNext)}, ${lowerFirst(text)}`;
  return text;
}

const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);

// ---------- Off route ----------

// GPS error allowance: never stricter than 40 m, wider when accuracy is poor.
export function isOffRoute(offRoute, accuracy = 0) {
  return offRoute > Math.max(40, Math.min(accuracy, 100) * 1.5);
}
