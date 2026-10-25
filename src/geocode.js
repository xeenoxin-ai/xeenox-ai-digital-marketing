// Place search on free OpenStreetMap geocoders, biased towards the user's area:
// Nominatim first, Photon (komoot) as the backup when Nominatim is busy.
// Nominatim's policy allows ~1 request/second, so callers debounce.

const NOMINATIM = 'https://nominatim.openstreetmap.org';
const PHOTON = 'https://photon.komoot.io';

async function nominatimSearch(q, near) {
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
    osmType: r.osm_type,
    osmId: r.osm_id,
    category: r.category,
    type: r.type,
  }));
}

async function photonSearch(q, near) {
  const params = new URLSearchParams({ q, limit: '6', lang: 'en' });
  if (near) {
    params.set('lat', near[0]);
    params.set('lon', near[1]);
  }
  const res = await fetch(`${PHOTON}/api/?${params}`);
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const json = await res.json();
  return json.features
    .filter((f) => !f.properties.countrycode || f.properties.countrycode === 'IN')
    .map((f) => {
      const p = f.properties;
      const parts = [p.name, p.street, p.city || p.county, p.state].filter(Boolean);
      return {
        name: parts.slice(0, 3).join(', '),
        full: parts.join(', '),
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        osmType: p.osm_type,
        osmId: p.osm_id,
        category: p.osm_key,
        type: p.osm_value,
      };
    });
}

export async function searchPlaces(q, near) {
  try {
    const rows = await nominatimSearch(q, near);
    if (rows.length) return rows;
  } catch {
    /* fall through to the backup */
  }
  return photonSearch(q, near);
}

export async function reverse([lat, lon]) {
  const params = new URLSearchParams({ lat, lon, format: 'jsonv2', zoom: '16' });
  const res = await fetch(`${NOMINATIM}/reverse?${params}`, { headers: { 'Accept-Language': 'en' } });
  if (!res.ok) return null;
  const r = await res.json();
  return r.display_name ? r.display_name.split(',').slice(0, 2).join(',') : null;
}
