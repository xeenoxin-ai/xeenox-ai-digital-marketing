// Overpass API client (OpenStreetMap data) with endpoint fallback and an in-memory cache.

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

// Give up on a slow mirror and try the next one (Overpass's own query limit is 25 s).
const TIMEOUT_MS = 20000;

const cache = new Map();

export async function overpass(query) {
  if (cache.has(query)) return cache.get(query);
  let lastErr;
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`Overpass ${res.status}`);
      const json = await res.json();
      cache.set(query, json.elements || []);
      return json.elements || [];
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

// Coordinates of a node, or the centre of a way/relation fetched with `out center`.
export function elementLatLon(el) {
  if (el.lat != null) return [el.lat, el.lon];
  if (el.center) return [el.center.lat, el.center.lon];
  return null;
}
