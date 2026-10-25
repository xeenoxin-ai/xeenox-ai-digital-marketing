// Routing on the OpenStreetMap road network.
//
// - The public Valhalla server is the main engine: it can avoid toll roads and
//   reports whether each route still contains a toll.
// - The public OSRM server is the fallback. Its demo server cannot exclude
//   tolls and does not reliably tag them, so OSRM routes have hasToll = null
//   (unknown) unless a toll is actually tagged. On top of the engine's own
// alternatives we try "local detour" candidates through via-points either
// side of the straight line, so the traffic scorer has genuinely different
// streets to compare.

import { perpendicularOffset, haversine } from './geo.js';
import { valhallaKind, osrmInstruction } from './navigation.js';

const OSRM = 'https://router.project-osrm.org/route/v1/driving';
const VALHALLA = 'https://valhalla1.openstreetmap.de/route';

// ---------- OSRM ----------

async function osrm(points, { alternatives }) {
  const coords = points.map(([lat, lon]) => `${lon.toFixed(6)},${lat.toFixed(6)}`).join(';');
  const params = new URLSearchParams({
    overview: 'full',
    geometries: 'geojson',
    steps: 'true',
    alternatives: alternatives ? '3' : 'false',
  });
  const res = await fetch(`${OSRM}/${coords}?${params}`);
  const json = await res.json().catch(() => ({}));
  if (json.code !== 'Ok') throw new Error(json.message || `Routing failed (${res.status})`);
  return json.routes.map(fromOsrm);
}

function fromOsrm(r) {
  const steps = r.legs.flatMap((leg) => leg.steps);
  return {
    line: r.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
    distance: r.distance,
    duration: r.duration,
    hasToll: steps.some((s) => s.intersections?.some((i) => i.classes?.includes('toll'))) || null,
    via: mainRoads(steps.map((s) => ({ name: s.name || s.ref, metres: s.distance }))),
    // Turn-by-turn: OSRM gives each turn's location; navigation.js places it on the line.
    maneuvers: steps.map((s) => ({
      location: [s.maneuver.location[1], s.maneuver.location[0]],
      ...osrmInstruction(s),
    })),
  };
}

// ---------- Valhalla ----------

async function valhalla(points, { avoidTolls, alternatives }) {
  const body = {
    locations: points.map(([lat, lon], i) => ({
      lat,
      lon,
      // Middle points are pass-through so they bend the route without a stop.
      type: i === 0 || i === points.length - 1 ? 'break' : 'through',
    })),
    costing: 'auto',
    // exclude_tolls is a hard ban; use_tolls alone is only a preference.
    costing_options: { auto: avoidTolls ? { exclude_tolls: true, use_tolls: 0 } : {} },
    directions_type: 'instructions',
    units: 'kilometers',
  };
  if (alternatives) body.alternates = 2;
  const res = await fetch(VALHALLA, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!json.trip) throw new Error(json.error || `Routing failed (${res.status})`);
  return [json.trip, ...(json.alternates || []).map((a) => a.trip)].map(fromValhalla);
}

function fromValhalla(trip) {
  const maneuvers = trip.legs.flatMap((l) => l.maneuvers || []);
  // Shape indices restart in every leg; offset them onto the joined line.
  const line = [];
  const turns = [];
  for (const leg of trip.legs) {
    const offset = line.length;
    line.push(...decodePolyline(leg.shape, 6));
    for (const m of leg.maneuvers || []) {
      turns.push({
        index: offset + m.begin_shape_index,
        kind: valhallaKind(m.type),
        text: m.instruction,
        verbal: m.verbal_pre_transition_instruction || m.instruction,
      });
    }
  }
  return {
    line,
    maneuvers: turns,
    distance: trip.summary.length * 1000,
    duration: trip.summary.time,
    hasToll: Boolean(trip.summary.has_toll),
    via: mainRoads(maneuvers.map((m) => ({ name: m.street_names?.[0], metres: m.length * 1000 }))),
  };
}

// Google-style encoded polyline; Valhalla uses precision 6.
export function decodePolyline(str, precision = 5) {
  const factor = 10 ** precision;
  const out = [];
  let lat = 0, lon = 0, i = 0;
  while (i < str.length) {
    for (const axis of [0, 1]) {
      let shift = 0, result = 0, b;
      do {
        b = str.charCodeAt(i++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const delta = result & 1 ? ~(result >> 1) : result >> 1;
      if (axis === 0) lat += delta;
      else lon += delta;
    }
    out.push([lat / factor, lon / factor]);
  }
  return out;
}

// ---------- Shared ----------

// Names of the three longest-used roads, in travel order.
function mainRoads(segments) {
  const byName = new Map();
  for (const { name, metres } of segments) {
    if (name) byName.set(name, (byName.get(name) || 0) + metres);
  }
  const top = new Set([...byName].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n]) => n));
  return [...byName.keys()].filter((n) => top.has(n));
}

// Two routes are "the same" if their lengths are within 3% and their
// midpoints are close.
function isDuplicate(a, b) {
  if (Math.abs(a.distance - b.distance) / Math.max(a.distance, b.distance) > 0.03) return false;
  const ma = a.line[Math.floor(a.line.length / 2)];
  const mb = b.line[Math.floor(b.line.length / 2)];
  return haversine(ma, mb) < 400;
}

// Valhalla first; if a toll-free route is impossible, Valhalla with tolls
// allowed (the caller flags it); OSRM if Valhalla is down.
async function engineRoute(points, opts) {
  const attempts = [() => valhalla(points, opts)];
  if (opts.avoidTolls) attempts.push(() => valhalla(points, { ...opts, avoidTolls: false }));
  attempts.push(() => osrm(points, opts));
  let firstErr;
  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (err) {
      firstErr ??= err;
    }
  }
  throw firstErr;
}

export async function findRoutes(from, to, { avoidTolls = false } = {}) {
  const main = await engineRoute([from, to], { avoidTolls, alternatives: true });
  const routes = [...main];

  if (haversine(from, to) > 1500) {
    for (const f of [0.18, -0.18]) {
      // Sequential, to stay inside the public servers' fair-use limits.
      try {
        const [r] = await engineRoute([from, perpendicularOffset(from, to, f), to], { avoidTolls, alternatives: false });
        // Skip detours that are much longer than the engine's best route.
        if (r.distance > main[0].distance * 1.35) continue;
        if (!routes.some((x) => isDuplicate(x, r))) routes.push({ ...r, local: true });
      } catch {
        /* a failed detour just means one fewer option */
      }
    }
  }

  if (!avoidTolls) return { routes, tollFallback: false };
  const tollFree = routes.filter((r) => r.hasToll === false);
  // tollFallback: every candidate still crosses a toll (none can be avoided).
  return tollFree.length ? { routes: tollFree, tollFallback: false } : { routes, tollFallback: true };
}
