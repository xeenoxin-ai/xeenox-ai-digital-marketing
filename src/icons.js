// Inline SVG icons from Lucide (free, ISC licence), returned as markup
// strings so they drop straight into templates. Only these are bundled.

import {
  ArrowUp, ArrowUpRight, ArrowUpLeft, CornerUpRight, CornerUpLeft, Undo2, RotateCw, Merge, Flag,
  Navigation, Wrench, Disc, BatteryCharging, Fuel, Zap, Truck, Sparkles, TrafficCone, LocateFixed,
  ArrowUpDown, Settings, X, Volume2, VolumeX, Crosshair, Phone, Clock, Siren, Coins, Route,
} from 'lucide';

const ICONS = {
  straight: ArrowUp, 'slight-right': ArrowUpRight, 'slight-left': ArrowUpLeft,
  right: CornerUpRight, left: CornerUpLeft, 'sharp-right': CornerUpRight, 'sharp-left': CornerUpLeft,
  uturn: Undo2, roundabout: RotateCw, merge: Merge, arrive: Flag, depart: Navigation,
  wrench: Wrench, tyre: Disc, battery: BatteryCharging, fuel: Fuel, ev: Zap, tow: Truck,
  assistant: Sparkles, jam: TrafficCone, locate: LocateFixed, swap: ArrowUpDown, settings: Settings,
  close: X, sound: Volume2, mute: VolumeX, recenter: Crosshair, phone: Phone, clock: Clock,
  sos: Siren, toll: Coins, route: Route,
};

const esc = (v) => String(v).replace(/"/g, '&quot;');

export function icon(name, size = 20, strokeWidth = 2) {
  const node = ICONS[name] || ArrowUp;
  const children = node
    .map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${esc(v)}"`).join(' ')}/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${children}</svg>`;
}

// Fill every <i data-icon="name" data-size="20"></i> placeholder in the page.
export function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => {
    el.innerHTML = icon(el.dataset.icon, Number(el.dataset.size) || 20);
  });
}
