// Traffic hotspot engine.
//
// The app uses only free, open data, and there is no free live-traffic feed,
// so congestion is *predicted* on-device from OpenStreetMap features that
// reliably cause queues (signals, railway level crossings, bus stands,
// markets, schools, malls), weighted by time of day, plus jam reports the
// user makes.

import { overpass, elementLatLon } from './overpass.js';
import { distanceToPolyline } from './geo.js';
import { load, save } from './storage.js';

// Base weight per feature type and when it hurts.
export const FEATURES = {
  level_crossing: { weight: 3, label: 'Railway gate' },
  traffic_signals: { weight: 1, label: 'Signal' },
  bus_station: { weight: 2, label: 'Bus stand' },
  marketplace: { weight: 2, label: 'Market' },
  school: { weight: 1.5, label: 'School' },
  mall: { weight: 1.5, label: 'Mall' },
  report: { weight: 6, label: 'Reported jam' },
};

const inRange = (h, from, to) => h >= from && h < to;

// How strongly a feature type congests at a given time (0..1).
export function timeFactor(type, date = new Date()) {
  const h = date.getHours() + date.getMinutes() / 60;
  const day = date.getDay();
  const weekend = day === 0 || day === 6;
  const peak = inRange(h, 8, 10.5) || inRange(h, 17, 20);

  switch (type) {
    case 'school':
      return !weekend && (inRange(h, 8, 9.75) || inRange(h, 15, 16.75)) ? 1 : 0.15;
    case 'mall':
      return weekend || inRange(h, 17, 22) ? 1 : 0.35;
    case 'marketplace':
      return inRange(h, 7, 12) || inRange(h, 16, 20) ? 1 : 0.4;
    case 'report':
      return 1;
    default:
      if (peak) return 1;
      if (inRange(h, 6, 22)) return 0.55;
      return 0.15;
  }
}

const REPORT_TTL_MS = 60 * 60 * 1000;

export function getReports(now = Date.now()) {
  return load('reports', []).filter((r) => now - r.t < REPORT_TTL_MS);
}

export function addReport(lat, lon) {
  const reports = getReports();
  reports.push({ lat, lon, t: Date.now() });
  save('reports', reports);
  return reports;
}

// Fetch congestion-causing features inside bbox [s, w, n, e].
export async function fetchFeatures(bbox) {
  const b = bbox.map((v) => v.toFixed(4)).join(',');
  const q = `[out:json][timeout:25];
(
  node["railway"="level_crossing"](${b});
  node["highway"="traffic_signals"](${b});
  nw["amenity"="bus_station"](${b});
  nw["amenity"="marketplace"](${b});
  nw["amenity"="school"](${b});
  nw["shop"="mall"](${b});
);
out center 1500;`;
  const els = await overpass(q);
  const out = [];
  for (const el of els) {
    const p = elementLatLon(el);
    if (!p) continue;
    const t = el.tags || {};
    const type =
      t.railway === 'level_crossing' ? 'level_crossing'
      : t.highway === 'traffic_signals' ? 'traffic_signals'
      : t.amenity === 'bus_station' ? 'bus_station'
      : t.amenity === 'marketplace' ? 'marketplace'
      : t.amenity === 'school' ? 'school'
      : t.shop === 'mall' ? 'mall'
      : null;
    if (type) out.push({ lat: p[0], lon: p[1], type });
  }
  return out;
}

// Cluster features into ~cellMetres grid cells and score each by
// sum(weight * timeFactor). Returns hotspots sorted by intensity, strongest first.
export function buildHotspots(features, { date = new Date(), cellMetres = 350, minScore = 2 } = {}) {
  const latStep = cellMetres / 111320;
  const cells = new Map();
  for (const f of features) {
    const lonStep = latStep / Math.cos((f.lat * Math.PI) / 180);
    const key = `${Math.floor(f.lat / latStep)}:${Math.floor(f.lon / lonStep)}`;
    let c = cells.get(key);
    if (!c) {
      c = { latSum: 0, lonSum: 0, n: 0, score: 0, types: {} };
      cells.set(key, c);
    }
    c.latSum += f.lat;
    c.lonSum += f.lon;
    c.n++;
    c.score += FEATURES[f.type].weight * timeFactor(f.type, date);
    c.types[f.type] = (c.types[f.type] || 0) + 1;
  }
  return [...cells.values()]
    .filter((c) => c.score >= minScore)
    .map((c) => ({
      lat: c.latSum / c.n,
      lon: c.lonSum / c.n,
      score: Math.round(c.score * 10) / 10,
      level: c.score >= 8 ? 'high' : c.score >= 4 ? 'medium' : 'low',
      types: c.types,
    }))
    .sort((a, b) => b.score - a.score);
}

export function describeHotspot(h) {
  return Object.entries(h.types)
    .map(([t, n]) => `${n} × ${FEATURES[t].label}`)
    .join(', ');
}

// Estimated extra seconds of delay per point of hotspot score on a route.
const SECONDS_PER_SCORE = 25;

// Score a route polyline ([lat, lon][]) against hotspots.
export function scoreRoute(line, hotspots, radius = 120) {
  let delay = 0;
  const hit = [];
  for (const h of hotspots) {
    if (distanceToPolyline([h.lat, h.lon], line) <= radius) {
      delay += h.score * SECONDS_PER_SCORE;
      hit.push(h);
    }
  }
  return { delay: Math.round(delay), hotspots: hit };
}
