import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './styles.css';

import { findRoutes } from './routing.js';
import { fetchFeatures, buildHotspots, scoreRoute, describeHotspot, getReports, addReport } from './traffic.js';
import { findWorkshops, NEEDS } from './workshops.js';
import { interpret, routeTip } from './ai.js';
import { searchPlaces, reverse } from './geocode.js';
import { getSettings, saveSettings } from './storage.js';
import { bboxOf, formatDistance, formatDuration } from './geo.js';

const PALAKKAD = [10.7867, 76.6548];
const $ = (id) => document.getElementById(id);

const state = {
  here: null, // device location
  from: null, // null = use device location
  to: null,
  routes: [],
  selected: 0,
  settings: getSettings(),
};

// ---------- Map ----------

const map = L.map('map', { zoomControl: false }).setView(PALAKKAD, 13);
L.control.zoom({ position: 'bottomleft' }).addTo(map);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

const hotspotLayer = L.layerGroup().addTo(map);
const routeLayer = L.layerGroup().addTo(map);
const workshopLayer = L.layerGroup().addTo(map);
const pinIcon = (cls, text = '') => L.divIcon({ className: `pin ${cls}`, html: text, iconSize: [22, 22] });
let hereMarker = null;
let toMarker = null;

function toast(msg, ms = 3500) {
  const el = $('toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => (el.hidden = true), ms);
}

// ---------- Location ----------

function locate({ fly = true } = {}) {
  if (!navigator.geolocation) {
    toast('Location not available, showing Palakkad.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      state.here = [pos.coords.latitude, pos.coords.longitude];
      if (!hereMarker) hereMarker = L.marker(state.here, { icon: pinIcon('pin-here') }).addTo(map);
      else hereMarker.setLatLng(state.here);
      if (fly) map.setView(state.here, 15);
    },
    () => toast('Could not get your location. Allow location access, or type a start point.'),
    { enableHighAccuracy: true, timeout: 10000 },
  );
}

function origin() {
  if (state.from) return state.from.latlng;
  if (state.here) return state.here;
  const c = map.getCenter();
  return [c.lat, c.lng];
}

// ---------- Traffic hotspots ----------

let hotspotTimer;
let hotspots = [];

async function hotspotsFor(bbox) {
  const features = await fetchFeatures(bbox);
  for (const r of getReports()) features.push({ lat: r.lat, lon: r.lon, type: 'report' });
  return buildHotspots(features);
}

function drawHotspots(list) {
  hotspotLayer.clearLayers();
  if (!$('showHotspots').checked) return;
  const colour = { high: '#dc2626', medium: '#f97316', low: '#eab308' };
  for (const h of list) {
    L.circle([h.lat, h.lon], {
      radius: 120 + h.score * 15,
      color: colour[h.level],
      fillColor: colour[h.level],
      fillOpacity: 0.35,
      weight: 1,
    })
      .bindPopup(`<strong>${h.level === 'high' ? 'Heavy' : h.level === 'medium' ? 'Moderate' : 'Light'} traffic expected</strong><br>${describeHotspot(h)}`)
      .addTo(hotspotLayer);
  }
}

function refreshHotspots() {
  clearTimeout(hotspotTimer);
  hotspotTimer = setTimeout(async () => {
    if (!$('showHotspots').checked || map.getZoom() < 12) return drawHotspots([]);
    const b = map.getBounds();
    try {
      hotspots = await hotspotsFor([b.getSouth(), b.getWest(), b.getNorth(), b.getEast()]);
      drawHotspots(hotspots);
    } catch {
      toast('Traffic data is busy, retrying when you move the map.');
    }
  }, 700);
}

map.on('moveend', refreshHotspots);
$('showHotspots').addEventListener('change', refreshHotspots);

$('reportBtn').addEventListener('click', () => {
  const c = map.getCenter();
  addReport(c.lat, c.lng);
  toast('Jam reported at the map centre. Routes will avoid it for 1 hour.');
  refreshHotspots();
});

// ---------- Routing ----------

async function routeHotspots(routes) {
  const pts = routes.flatMap((r) => r.line);
  const [s, w, n, e] = bboxOf(pts, 0.01);
  // Overpass struggles with huge boxes; for long trips score the city ends,
  // which is where queues form.
  if ((n - s) * (e - w) <= 0.25) return hotspotsFor([s, w, n, e]);
  const ends = [routes[0].line[0], routes[0].line.at(-1)];
  const parts = await Promise.all(ends.map(([lat, lon]) => hotspotsFor([lat - 0.12, lon - 0.12, lat + 0.12, lon + 0.12])));
  return parts.flat();
}

// Rank routes by drive time plus predicted traffic delay, then draw them.
// spots = null means traffic is not known (yet), so no route is called clear.
function showRanked(routes, spots) {
  state.trafficKnown = spots !== null;
  const fastest = routes.reduce((a, b) => (b.duration < a.duration ? b : a));
  state.routes = routes
    .map((r) => {
      const s = scoreRoute(r.line, spots || []);
      return {
        ...r,
        delay: s.delay,
        hotspots: s.hotspots,
        total: r.duration + s.delay,
        label: r.local ? 'Local road' : r === fastest ? 'Main road' : 'Alternative',
      };
    })
    .sort((a, b) => a.total - b.total);
  state.selected = 0;
  drawRoutes();
  renderRoutes();
}

// Bumped on every request so a slow, older answer never overwrites a newer one.
planRoute.latest = 0;

async function planRoute() {
  if (!state.to) {
    toast('Choose a destination first.');
    $('toInput').focus();
    return;
  }
  const from = origin();
  const avoidTolls = $('avoidTolls').checked;
  openSheet('routesSheet');
  $('routesList').innerHTML = '<p class="status">Finding the easiest way…</p>';
  $('aiTip').hidden = true;

  const request = ++planRoute.latest;
  try {
    const { routes, tollFallback } = await findRoutes(from, state.to.latlng, { avoidTolls });
    if (request !== planRoute.latest) return;
    if (tollFallback) toast('No toll-free road found for this trip; showing normal routes.', 5000);

    // Show routes straight away, then re-rank once traffic data arrives:
    // the traffic servers can take several seconds when busy.
    showRanked(routes, null);
    $('aiTip').textContent = '🤖 Checking traffic on these routes…';
    $('aiTip').hidden = false;

    let spots;
    try {
      spots = await routeHotspots(routes);
    } catch {
      if (request !== planRoute.latest) return;
      $('aiTip').textContent = '🤖 Traffic data is busy right now, so routes are ranked by drive time only.';
      return;
    }
    if (request !== planRoute.latest) return;
    showRanked(routes, spots);
    const tip = routeTip(state.routes);
    $('aiTip').textContent = `🤖 ${tip}`;
    $('aiTip').hidden = !tip;
  } catch (err) {
    $('routesList').innerHTML = `<p class="status error">Could not find a route: ${escapeHtml(err.message)}</p>`;
  }
}

function drawRoutes() {
  routeLayer.clearLayers();
  state.routes.forEach((r, i) => {
    if (i === state.selected) return;
    L.polyline(r.line, { color: '#94a3b8', weight: 6, opacity: 0.8 })
      .on('click', () => selectRoute(i))
      .addTo(routeLayer);
  });
  const sel = state.routes[state.selected];
  if (!sel) return;
  L.polyline(sel.line, { color: '#1d4ed8', weight: 8 }).addTo(routeLayer);
  for (const h of sel.hotspots) {
    L.circleMarker([h.lat, h.lon], { radius: 6, color: '#fff', weight: 2, fillColor: '#dc2626', fillOpacity: 1 })
      .bindPopup(describeHotspot(h))
      .addTo(routeLayer);
  }
  map.fitBounds(L.latLngBounds(sel.line), { padding: [40, 40] });
}

function selectRoute(i) {
  state.selected = i;
  drawRoutes();
  renderRoutes();
}

function googleMapsLink(r) {
  // Hand the chosen line to Google Maps for voice turn-by-turn, pinned with
  // two waypoints so it follows our route instead of its own.
  const p = (x) => `${x[0].toFixed(5)},${x[1].toFixed(5)}`;
  const n = r.line.length;
  const params = new URLSearchParams({
    api: '1',
    origin: p(r.line[0]),
    destination: p(r.line[n - 1]),
    waypoints: [r.line[Math.floor(n / 3)], r.line[Math.floor((2 * n) / 3)]].map(p).join('|'),
    travelmode: 'driving',
  });
  return `https://www.google.com/maps/dir/?${params}`;
}

function renderRoutes() {
  $('routesList').innerHTML = '';
  state.routes.forEach((r, i) => {
    const card = document.createElement('div');
    card.className = `route-card${i === state.selected ? ' selected' : ''}`;
    const badges = [
      i === 0 ? '<span class="badge good">Recommended</span>' : '',
      r.hasToll ? '<span class="badge warn">Toll</span>' : r.hasToll === false ? '<span class="badge">No toll</span>' : '',
      r.hotspots.length ? `<span class="badge bad">${r.hotspots.length} traffic spot${r.hotspots.length > 1 ? 's' : ''}</span>`
        : state.trafficKnown ? '<span class="badge good">Clear</span>' : '',
    ].join('');
    card.innerHTML = `
      <div class="route-main">
        <div>
          <div class="route-time">${formatDuration(r.total)}</div>
          <div class="route-sub">${r.label} · ${formatDistance(r.distance)}${r.delay > 60 ? ` · +${formatDuration(r.delay)} traffic` : ''}</div>
          ${r.via.length ? `<div class="route-sub">via ${escapeHtml(r.via.join(', '))}</div>` : ''}
        </div>
        <a class="btn small" target="_blank" rel="noopener" href="${googleMapsLink(r)}">Start ↗</a>
      </div>
      <div class="badges">${badges}</div>`;
    card.addEventListener('click', (e) => {
      if (!e.target.closest('a')) selectRoute(i);
    });
    $('routesList').appendChild(card);
  });
}

function setDestination(latlng, label) {
  state.to = { latlng, label };
  $('toInput').value = label;
  if (toMarker) toMarker.setLatLng(latlng);
  else toMarker = L.marker(latlng, { icon: pinIcon('pin-to') }).addTo(map);
}

map.on('click', async (e) => {
  const latlng = [e.latlng.lat, e.latlng.lng];
  setDestination(latlng, 'Dropped pin');
  planRoute();
  const name = await reverse(latlng).catch(() => null);
  if (name && state.to?.latlng === latlng) {
    state.to.label = name;
    $('toInput').value = name;
  }
});

$('goBtn').addEventListener('click', planRoute);
$('avoidTolls').addEventListener('change', () => state.to && planRoute());
$('locateBtn').addEventListener('click', () => {
  state.from = null;
  $('fromInput').value = '';
  locate();
});
$('swapBtn').addEventListener('click', () => {
  if (!state.to) return;
  const oldFrom = state.from || (state.here && { latlng: state.here, label: 'My location' });
  if (!oldFrom) return;
  state.from = state.to;
  $('fromInput').value = state.to.label;
  setDestination(oldFrom.latlng, oldFrom.label);
  planRoute();
});

// ---------- Place search ----------

let activeInput = null;
let searchTimer;

function wireSearch(input, onPick) {
  input.addEventListener('input', () => {
    activeInput = input;
    clearTimeout(searchTimer);
    const q = input.value.trim();
    if (q.length < 3) return ($('suggestions').hidden = true);
    searchTimer = setTimeout(async () => {
      try {
        const results = await searchPlaces(q, state.here || [map.getCenter().lat, map.getCenter().lng]);
        if (activeInput !== input) return;
        showSuggestions(results, onPick);
      } catch {
        /* keep typing; next keystroke retries */
      }
    }, 1000);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = $('suggestions').querySelector('li');
      if (first) first.click();
    }
  });
}

function showSuggestions(results, onPick) {
  const ul = $('suggestions');
  ul.innerHTML = '';
  if (!results.length) {
    ul.hidden = true;
    return;
  }
  for (const r of results) {
    const li = document.createElement('li');
    li.textContent = r.name;
    li.title = r.full;
    li.addEventListener('click', () => {
      ul.hidden = true;
      onPick({ latlng: [r.lat, r.lon], label: r.name });
    });
    ul.appendChild(li);
  }
  ul.hidden = false;
}

wireSearch($('toInput'), (place) => {
  setDestination(place.latlng, place.label);
  planRoute();
});
wireSearch($('fromInput'), (place) => {
  state.from = place;
  $('fromInput').value = place.label;
  if (state.to) planRoute();
});

// ---------- Breakdown / workshops ----------

const needGrid = $('needGrid');
for (const [key, n] of Object.entries(NEEDS)) {
  const b = document.createElement('button');
  b.className = 'need';
  b.dataset.need = key;
  b.innerHTML = `<span>${n.icon}</span>${n.label}`;
  b.addEventListener('click', () => showWorkshops(key));
  needGrid.appendChild(b);
}

function selectedVehicle() {
  return document.querySelector('input[name="vehicle"]:checked').value;
}

async function showWorkshops(need, vehicle) {
  if (vehicle) document.querySelector(`input[name="vehicle"][value="${vehicle}"]`).checked = true;
  openSheet('sosSheet');
  needGrid.querySelectorAll('.need').forEach((b) => b.classList.toggle('active', b.dataset.need === need));
  const here = state.here || origin();
  $('workshopStatus').textContent = `Searching nearby ${NEEDS[need].label.toLowerCase()}…`;
  $('workshopList').innerHTML = '';
  workshopLayer.clearLayers();
  try {
    const { places, radius } = await findWorkshops(need, selectedVehicle(), here);
    if (!places.length) {
      $('workshopStatus').textContent = 'Nothing mapped within 20 km. Call 112 or the highway helpline 1033.';
      return;
    }
    $('workshopStatus').textContent = `${places.length} found within ${radius / 1000} km, nearest first.`;
    for (const p of places) {
      L.marker([p.lat, p.lon], { icon: pinIcon('pin-shop', NEEDS[need].icon) })
        .bindPopup(`<strong>${escapeHtml(p.name)}</strong><br>${formatDistance(p.distance)}`)
        .addTo(workshopLayer);
      const row = document.createElement('div');
      row.className = 'shop';
      row.innerHTML = `
        <div class="shop-info">
          <strong>${escapeHtml(p.name)}</strong>
          <div class="route-sub">${formatDistance(p.distance)}${p.address ? ` · ${escapeHtml(p.address)}` : ''}</div>
          ${p.hours ? `<div class="route-sub">🕒 ${escapeHtml(p.hours)}</div>` : ''}
        </div>
        <div class="shop-actions">
          ${p.phone ? `<a class="btn small" href="tel:${escapeHtml(p.phone.split(/[;,]/)[0].replace(/\s/g, ''))}">Call</a>` : ''}
          <button class="btn small primary">Go</button>
        </div>`;
      row.querySelector('button').addEventListener('click', () => {
        closeSheet('sosSheet');
        setDestination([p.lat, p.lon], p.name);
        planRoute();
      });
      $('workshopList').appendChild(row);
    }
    map.fitBounds(L.latLngBounds([here, ...places.slice(0, 5).map((p) => [p.lat, p.lon])]), { padding: [40, 40] });
  } catch {
    $('workshopStatus').textContent = 'Search service is busy. Try again in a moment, or call 112.';
  }
}

$('sosBtn').addEventListener('click', () => {
  openSheet('sosSheet');
  if (!state.here) locate({ fly: false });
});

// ---------- AI assistant ----------

function say(who, text) {
  const div = document.createElement('div');
  div.className = `msg ${who}`;
  div.textContent = text;
  $('chatLog').appendChild(div);
  $('chatLog').scrollTop = $('chatLog').scrollHeight;
}

function updateAiMode() {
  $('aiMode').textContent = state.settings.useOllama ? `· Ollama (${state.settings.ollamaModel})` : '· on-device';
}

$('aiBtn').addEventListener('click', () => {
  openSheet('aiSheet');
  if (!$('chatLog').children.length) say('bot', 'Hi! Ask me for a route, toll-free roads, traffic, or help if your vehicle breaks down.');
  $('chatInput').focus();
});

$('chatForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = $('chatInput').value.trim();
  if (!text) return;
  $('chatInput').value = '';
  say('user', text);
  const context = [
    state.to && `destination: ${state.to.label}`,
    `avoid tolls: ${$('avoidTolls').checked}`,
    state.routes.length && `best route: ${formatDuration(state.routes[0].total)}, ${state.routes[0].hotspots.length} hotspots`,
  ].filter(Boolean).join('; ');
  const action = await interpret(text, state.settings, context);
  if (action.reply) say('bot', action.reply);
  await runAction(action);
});

async function runAction({ intent, params }) {
  switch (intent) {
    case 'route': {
      if (typeof params.avoidTolls === 'boolean') $('avoidTolls').checked = params.avoidTolls;
      const results = await searchPlaces(params.destination || '', state.here).catch(() => []);
      if (!results.length) return say('bot', `I couldn't find "${params.destination}". Try a nearby landmark.`);
      setDestination([results[0].lat, results[0].lon], results[0].name);
      closeSheet('aiSheet');
      return planRoute();
    }
    case 'breakdown':
      return showWorkshops(NEEDS[params.need] ? params.need : 'mechanic', params.vehicle || undefined);
    case 'avoid_tolls':
      $('avoidTolls').checked = params.on !== false;
      if (state.to) planRoute();
      return;
    case 'hotspots':
      $('showHotspots').checked = true;
      closeSheet('aiSheet');
      return refreshHotspots();
    case 'report_jam':
      return $('reportBtn').click();
    default:
  }
}

// ---------- Settings & sheets ----------

const form = $('settingsForm');
$('settingsBtn').addEventListener('click', () => {
  for (const [k, v] of Object.entries(state.settings)) {
    const el = form.elements[k];
    if (!el) continue;
    if (el.type === 'checkbox') el.checked = v;
    else el.value = v;
  }
  openSheet('settingsSheet');
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  state.settings = {
    useOllama: form.elements.useOllama.checked,
    ollamaUrl: form.elements.ollamaUrl.value.trim() || 'http://localhost:11434',
    ollamaModel: form.elements.ollamaModel.value.trim() || 'llama3.2',
  };
  saveSettings(state.settings);
  updateAiMode();
  closeSheet('settingsSheet');
  toast('Settings saved.');
});

const SHEETS = ['routesSheet', 'sosSheet', 'aiSheet', 'settingsSheet'];
function openSheet(id) {
  for (const s of SHEETS) $(s).hidden = s !== id;
  placeFabs();
}
function closeSheet(id) {
  $(id).hidden = true;
  placeFabs();
}

// On phones the sheets cover the bottom of the screen; lift the action
// buttons above whichever sheet is open so Breakdown is always reachable.
function placeFabs() {
  const open = SHEETS.map($).find((s) => !s.hidden);
  const narrow = !matchMedia('(min-width: 900px)').matches;
  const fabs = document.querySelector('.fab-stack');
  fabs.style.bottom = open && narrow ? `${open.getBoundingClientRect().height + 20}px` : '';
  fabs.classList.toggle('lifted', Boolean(open && narrow));
}
const sheetObserver = new ResizeObserver(placeFabs);
for (const s of SHEETS) sheetObserver.observe($(s));
addEventListener('resize', placeFabs);
document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => closeSheet(b.dataset.close)));
document.addEventListener('click', (e) => {
  if (!e.target.closest('#planner')) $('suggestions').hidden = true;
});

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// ---------- Install as an app ----------

// Inside the Android app (Capacitor) the files are already on the phone.
const isNativeApp = Boolean(window.Capacitor?.isNativePlatform?.());

if ('serviceWorker' in navigator && import.meta.env.PROD && !isNativeApp) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// Chrome/Android offer an install prompt; surface it as a button.
let installPrompt = null;
addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installPrompt = e;
  $('installBtn').hidden = false;
});
$('installBtn').addEventListener('click', async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  $('installBtn').hidden = true;
});
addEventListener('appinstalled', () => toast('TMap installed. Open it from your home screen.'));

updateAiMode();
locate();
refreshHotspots();
