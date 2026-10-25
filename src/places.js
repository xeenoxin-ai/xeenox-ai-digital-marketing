// Nearby places from OpenStreetMap (free, open data): hospitals, fuel, food,
// ATMs and more. Used by the category chips, the assistant and breakdown help.

import { overpass, elementLatLon } from './overpass.js';
import { haversine } from './geo.js';

// Each category: chip label, icon name (icons.js), OSM tag filters, and the
// name to show when a place has none.
export const CATEGORIES = {
  hospital: { label: 'Hospitals', icon: 'hospital', filters: ['amenity=hospital', 'amenity=clinic', 'healthcare=hospital', 'healthcare=clinic', 'amenity=doctors'], unnamed: 'Hospital / clinic' },
  pharmacy: { label: 'Pharmacy', icon: 'pharmacy', filters: ['amenity=pharmacy', 'healthcare=pharmacy', 'shop=chemist'], unnamed: 'Medical shop' },
  fuel: { label: 'Petrol', icon: 'fuel', filters: ['amenity=fuel'], unnamed: 'Fuel station' },
  food: { label: 'Food', icon: 'food', filters: ['amenity=restaurant', 'amenity=fast_food', 'amenity=cafe', 'amenity=food_court'], unnamed: 'Restaurant' },
  atm: { label: 'ATM', icon: 'atm', filters: ['amenity=atm', 'amenity=bank'], unnamed: 'ATM / bank' },
  stay: { label: 'Hotels', icon: 'stay', filters: ['tourism=hotel', 'tourism=guest_house', 'tourism=hostel', 'tourism=motel'], unnamed: 'Lodge' },
  police: { label: 'Police', icon: 'police', filters: ['amenity=police'], unnamed: 'Police station' },
  ev: { label: 'EV charging', icon: 'ev', filters: ['amenity=charging_station'], unnamed: 'EV charger' },
  grocery: { label: 'Grocery', icon: 'grocery', filters: ['shop=supermarket', 'shop=convenience', 'shop=grocery'], unnamed: 'Shop' },
  toilet: { label: 'Toilets', icon: 'toilet', filters: ['amenity=toilets'], unnamed: 'Public toilet' },
  parking: { label: 'Parking', icon: 'parking', filters: ['amenity=parking'], unnamed: 'Parking' },
  bus: { label: 'Bus stand', icon: 'bus', filters: ['amenity=bus_station'], unnamed: 'Bus stand' },
  train: { label: 'Railway', icon: 'train', filters: ['railway=station'], unnamed: 'Railway station' },
  worship: { label: 'Worship', icon: 'worship', filters: ['amenity=place_of_worship'], unnamed: 'Place of worship' },
};

export function nearbyQuery(filters, [lat, lon], radius, limit = 100) {
  const around = `(around:${radius},${lat.toFixed(5)},${lon.toFixed(5)})`;
  const parts = [...new Set(filters)].map((f) => {
    const [k, v] = f.split('=');
    return `  nw["${k}"="${v}"]${around};`;
  });
  return `[out:json][timeout:25];\n(\n${parts.join('\n')}\n);\nout center ${limit};`;
}

export function toPlace(el, here, unnamed) {
  const p = elementLatLon(el);
  if (!p) return null;
  const t = el.tags || {};
  return {
    id: `${el.type}/${el.id}`,
    lat: p[0],
    lon: p[1],
    name: t.name || t['name:en'] || t.brand || t.operator || unnamed,
    phone: t.phone || t['contact:phone'] || t['contact:mobile'] || '',
    hours: t.opening_hours || '',
    address: [t['addr:housenumber'], t['addr:street'], t['addr:city']].filter(Boolean).join(', '),
    emergency: t.emergency === 'yes',
    distance: haversine(here, p),
  };
}

// Search outwards (2 → 5 → 15 km) until something is found; nearest first.
export async function searchNearby(filters, here, { unnamed = 'Place', radii = [2000, 5000, 15000], max = 30 } = {}) {
  for (const radius of radii) {
    const els = await overpass(nearbyQuery(filters, here, radius));
    const places = els
      .map((el) => toPlace(el, here, typeof unnamed === 'function' ? unnamed(el.tags || {}) : unnamed))
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance);
    if (places.length) return { places: places.slice(0, max), radius };
  }
  return { places: [], radius: radii[radii.length - 1] };
}

export function findPlaces(category, here) {
  const c = CATEGORIES[category];
  return searchNearby(c.filters, here, { unnamed: c.unnamed });
}

// The named place the user tapped on the map, if there is one within ~40 m.
const TAPPABLE = ['amenity', 'shop', 'tourism', 'healthcare', 'office', 'leisure', 'craft', 'historic', 'railway'];

export async function placeAt(latlng) {
  const [lat, lon] = latlng;
  const around = `(around:40,${lat.toFixed(5)},${lon.toFixed(5)})`;
  const parts = TAPPABLE.map((k) => `  nw["name"]["${k}"]${around};`).join('\n');
  const els = await overpass(`[out:json][timeout:15];\n(\n${parts}\n);\nout center 20;`);
  const places = els.map((el) => {
    const place = toPlace(el, latlng, '');
    if (!place) return null;
    const t = el.tags || {};
    const key = TAPPABLE.find((k) => t[k]);
    return { ...place, kind: prettyKind(t[key]) };
  }).filter(Boolean);
  places.sort((a, b) => a.distance - b.distance);
  return places[0] || null;
}

// "fast_food" → "Fast food"; "yes" carries no meaning, so drop it.
export function prettyKind(v) {
  if (!v || v === 'yes') return '';
  const s = v.replace(/_/g, ' ');
  return s[0].toUpperCase() + s.slice(1);
}
