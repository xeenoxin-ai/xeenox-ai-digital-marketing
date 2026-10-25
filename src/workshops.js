// Breakdown help: find nearby workshops / services from OpenStreetMap.

import { searchNearby } from './places.js';

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

// Searches progressively wider (3 → 8 → 20 km) until something is found.
export function findWorkshops(need, vehicle, here) {
  return searchNearby(filtersFor(need, vehicle), here, {
    unnamed: fallbackName,
    radii: [3000, 8000, 20000],
    max: 25,
  });
}

function fallbackName(t) {
  if (t.amenity === 'fuel') return 'Fuel station';
  if (t.amenity === 'charging_station') return 'EV charger';
  if (t.shop === 'tyres') return 'Tyre shop';
  if (t.shop === 'car_parts') return 'Auto parts';
  if (t.shop?.startsWith('motorcycle')) return 'Bike workshop';
  return 'Workshop';
}
