// Breakdown help: find nearby workshops / services from OpenStreetMap.

import { overpass, elementLatLon } from './overpass.js';
import { haversine } from './geo.js';

// Each need maps to OSM tag filters. `vehicle` narrows mechanic searches.
export const NEEDS = {
  mechanic: { label: 'Mechanic', icon: 'wrench' },
  puncture: { label: 'Puncture / Tyre', icon: 'tyre' },
  battery: { label: 'Battery / Parts', icon: 'battery' },
  fuel: { label: 'Fuel', icon: 'fuel' },
  ev: { label: 'EV charging', icon: 'ev' },
  towing: { label: 'Towing', icon: 'tow' },
};

function filtersFor(need, vehicle) {
  const mechanic = {
    car: ['shop=car_repair'],
    bike: ['shop=motorcycle_repair', 'shop=motorcycle'],
    truck: ['shop=car_repair', 'shop=truck_repair'],
  }[vehicle];
  switch (need) {
    case 'mechanic': return mechanic;
    case 'puncture': return ['shop=tyres', 'service:vehicle:tyres=yes', ...mechanic];
    case 'battery': return ['shop=car_parts', 'shop=batteries', 'service:vehicle:batteries=yes'];
    case 'fuel': return ['amenity=fuel'];
    case 'ev': return ['amenity=charging_station'];
    // OSM rarely tags towing; workshops usually arrange it, so include them.
    case 'towing': return ['service:vehicle:towing=yes', 'shop=truck_repair', ...mechanic];
    default: return mechanic;
  }
}

function query(filters, [lat, lon], radius) {
  const around = `(around:${radius},${lat.toFixed(5)},${lon.toFixed(5)})`;
  const parts = [...new Set(filters)].map((f) => {
    const [k, v] = f.split('=');
    return `  nw["${k}"="${v}"]${around};`;
  });
  return `[out:json][timeout:25];\n(\n${parts.join('\n')}\n);\nout center 80;`;
}

// Searches progressively wider until something is found.
export async function findWorkshops(need, vehicle, here) {
  const filters = filtersFor(need, vehicle);
  for (const radius of [3000, 8000, 20000]) {
    const els = await overpass(query(filters, here, radius));
    const places = els
      .map((el) => {
        const p = elementLatLon(el);
        if (!p) return null;
        const t = el.tags || {};
        return {
          id: `${el.type}/${el.id}`,
          lat: p[0],
          lon: p[1],
          name: t.name || t.brand || t.operator || fallbackName(t),
          phone: t.phone || t['contact:phone'] || t['contact:mobile'] || '',
          hours: t.opening_hours || '',
          address: [t['addr:street'], t['addr:city']].filter(Boolean).join(', '),
          distance: haversine(here, p),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance);
    if (places.length) return { places: places.slice(0, 25), radius };
  }
  return { places: [], radius: 20000 };
}

function fallbackName(t) {
  if (t.amenity === 'fuel') return 'Fuel station';
  if (t.amenity === 'charging_station') return 'EV charger';
  if (t.shop === 'tyres') return 'Tyre shop';
  if (t.shop === 'car_parts') return 'Auto parts';
  if (t.shop?.startsWith('motorcycle')) return 'Bike workshop';
  return 'Workshop';
}
