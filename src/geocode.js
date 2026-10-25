// Place search via OpenStreetMap Nominatim, biased towards the user's area.
// Nominatim's policy allows ~1 request/second, so callers debounce.

const NOMINATIM = 'https://nominatim.openstreetmap.org';

export async function searchPlaces(q, near) {
  const params = new URLSearchParams({ q, format: 'jsonv2', limit: '6', countrycodes: 'in' });
  if (near) {
    const [lat, lon] = near;
    const d = 1.5; // ~150 km preference box, not a hard limit
    params.set('viewbox', `${lon - d},${lat + d},${lon + d},${lat - d}`);
  }
  const res = await fetch(`${NOMINATIM}/search?${params}`, { headers: { 'Accept-Language': 'en' } });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const rows = await res.json();
  return rows.map((r) => ({
    name: r.display_name.split(',').slice(0, 3).join(','),
    full: r.display_name,
    lat: Number(r.lat),
    lon: Number(r.lon),
  }));
}

export async function reverse([lat, lon]) {
  const params = new URLSearchParams({ lat, lon, format: 'jsonv2', zoom: '16' });
  const res = await fetch(`${NOMINATIM}/reverse?${params}`, { headers: { 'Accept-Language': 'en' } });
  if (!res.ok) return null;
  const r = await res.json();
  return r.display_name ? r.display_name.split(',').slice(0, 2).join(',') : null;
}
