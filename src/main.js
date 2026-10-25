import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './styles.css';

import { findRoutes } from './routing.js';
import { fetchFeatures, buildHotspots, scoreRoute, describeHotspot, getReports, addReport } from './traffic.js';
import { findWorkshops, NEEDS } from './workshops.js';
import { CATEGORIES, findPlaces, placeAt } from './places.js';
import { interpret, routeTip } from './ai.js';
import { searchPlaces, reverse } from './geocode.js';
import { getSettings, saveSettings } from './storage.js';
import { bboxOf, formatDistance, formatDuration, haversine } from './geo.js';
import { createDrive } from './drive.js';
import { icon, hydrateIcons } from './icons.js';

hydrateIcons();

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
const pinIcon = (cls, html = '', size = 22) => L.divIcon({ className: `pin ${cls}`, html, iconSize: [size, size] });
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
  // While driving the jam is where the car is; otherwise at the map centre.
  const c = drive.active && drive.position ? drive.position : [map.getCenter().lat, map.getCenter().lng];
  addReport(c[0], c[1]);
  toast(drive.active ? 'Jam reported. Looking for a way around it…' : 'Jam reported at the map centre. Routes will avoid it for 1 hour.');
  refreshHotspots();
  if (drive.active) drive.recheckNow();
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

// Rank routes by drive time plus predicted traffic delay, easiest first.
function rankRoutes(routes, spots) {
  const fastest = routes.reduce((a, b) => (b.duration < a.duration ? b : a));
  return routes
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
}

// spots = null means traffic is not known (yet), so no route is called clear.
function showRanked(routes, spots) {
  state.trafficKnown = spots !== null;
  state.routes = rankRoutes(routes, spots);
  state.selected = 0;
  drawRoutes();
  renderRoutes();
}

// Used by live navigation to find the easiest way from wherever the car is.
async function bestRoutes(from, to, { avoidTolls }) {
  const { routes } = await findRoutes(from, to, { avoidTolls });
  const spots = await routeHotspots(routes).catch(() => []);
  return rankRoutes(routes, spots);
}

const drive = createDrive(map, {
  bestRoutes,
  toast,
  onExit: () => {
    routeLayer.clearLayers();
    if (state.routes.length) {
      drawRoutes();
      openSheet('routesSheet');
    }
  },
});

function startNavigation(i) {
  const route = state.routes[i];
  if (!navigator.geolocation) return toast('This device has no GPS, so navigation cannot start.');
  closeSheet('routesSheet');
  routeLayer.clearLayers();
  drive.start(route, state.to, { avoidTolls: $('avoidTolls').checked, here: state.here });
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
    setTip('Checking traffic on these routes…');

    let spots;
    try {
      spots = await routeHotspots(routes);
    } catch {
      if (request !== planRoute.latest) return;
      setTip('Traffic data is busy right now, so routes are ranked by drive time only.');
      return;
    }
    if (request !== planRoute.latest) return;
    showRanked(routes, spots);
    setTip(routeTip(state.routes));
  } catch (err) {
    $('routesList').innerHTML = `<p class="status error">Could not find a route: ${escapeHtml(err.message)}</p>`;
  }
}

function setTip(text) {
  $('aiTip').innerHTML = `${icon('assistant', 18)}<span>${escapeHtml(text || '')}</span>`;
  $('aiTip').hidden = !text;
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

function renderRoutes() {
  $('routesList').innerHTML = '';
  state.routes.forEach((r, i) => {
    const card = document.createElement('div');
    card.className = `route-card${i === state.selected ? ' selected' : ''}${i === 0 ? ' best' : ''}`;
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
        <button class="btn primary start">${icon('depart', 18)} Start</button>
      </div>
      <div class="badges">${badges}</div>`;
    card.addEventListener('click', (e) => {
      if (e.target.closest('.start')) startNavigation(i);
      else selectRoute(i);
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

// Tap the map: show the place there (or its address) with a Directions button.
map.on('click', async (e) => {
  if (drive.active) return;
  const latlng = [e.latlng.lat, e.latlng.lng];
  const box = document.createElement('div');
  box.className = 'place-pop';
  box.innerHTML = '<span class="route-sub">Looking up this place…</span>';
  const popup = L.popup({ minWidth: 200 }).setLatLng(e.latlng).setContent(box).openOn(map);

  const [place, address] = await Promise.all([
    placeAt(latlng).catch(() => null),
    reverse(latlng).catch(() => null),
  ]);
  if (!map.hasLayer(popup)) return; // closed meanwhile
  const target = place ? [place.lat, place.lon] : latlng;
  const title = place?.name || address || 'Dropped pin';
  box.innerHTML = `
    <strong>${escapeHtml(title)}</strong>
    ${place?.kind ? `<div class="route-sub">${escapeHtml(place.kind)}</div>` : ''}
    ${place && address ? `<div class="route-sub">${escapeHtml(address)}</div>` : ''}
    ${place?.hours ? `<div class="route-sub">${icon('clock', 12)} ${escapeHtml(place.hours)}</div>` : ''}
    <div class="pop-actions">
      <button class="btn small primary">${icon('route', 14)} Directions</button>
      ${place?.phone ? `<a class="btn small" href="tel:${escapeHtml(place.phone.split(/[;,]/)[0].replace(/\s/g, ''))}">${icon('phone', 14)} Call</a>` : ''}
    </div>`;
  box.querySelector('button').addEventListener('click', () => {
    map.closePopup(popup);
    setDestination(target, title);
    planRoute();
  });
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
  b.innerHTML = `<span class="need-icon">${icon(n.icon, 22)}</span>${n.label}`;
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
    renderPlaceList($('workshopList'), places, NEEDS[need].icon, 'sosSheet');
    map.fitBounds(L.latLngBounds([here, ...places.slice(0, 5).map((p) => [p.lat, p.lon])]), { padding: [40, 40] });
  } catch {
    $('workshopStatus').textContent = 'Search service is busy. Try again in a moment, or call 112.';
  }
}

// One list + map markers for any set of places (breakdown help or nearby search).
function renderPlaceList(listEl, places, iconName, sheetId) {
  workshopLayer.clearLayers();
  listEl.innerHTML = '';
  for (const p of places) {
    const go = () => {
      closeSheet(sheetId);
      setDestination([p.lat, p.lon], p.name);
      planRoute();
    };
    const popup = document.createElement('div');
    popup.innerHTML = `<strong>${escapeHtml(p.name)}</strong><br>${formatDistance(p.distance)}<br>`;
    const popupGo = document.createElement('button');
    popupGo.className = 'btn small primary';
    popupGo.textContent = 'Go';
    popupGo.addEventListener('click', go);
    popup.appendChild(popupGo);
    L.marker([p.lat, p.lon], { icon: pinIcon('pin-shop', icon(iconName, 14), 28) }).bindPopup(popup).addTo(workshopLayer);

    const row = document.createElement('div');
    row.className = 'shop';
    row.innerHTML = `
      <div class="shop-info">
        <strong>${escapeHtml(p.name)}</strong>
        <div class="route-sub"><span class="place-dist">${formatDistance(p.distance)}</span>${p.emergency ? ' · <span class="tag-emergency">24h emergency</span>' : ''}${p.address ? ` · ${escapeHtml(p.address)}` : ''}</div>
        ${p.hours ? `<div class="route-sub">${icon('clock', 12)} ${escapeHtml(p.hours)}</div>` : ''}
      </div>
      <div class="shop-actions">
        ${p.phone ? `<a class="btn small" href="tel:${escapeHtml(p.phone.split(/[;,]/)[0].replace(/\s/g, ''))}">${icon('phone', 14)} Call</a>` : ''}
        <button class="btn small primary">Go</button>
      </div>`;
    row.querySelector('button').addEventListener('click', go);
    listEl.appendChild(row);
  }
}

// ---------- Nearby places ----------

const CHIP_ORDER = ['hospital', 'fuel', 'food', 'atm', 'pharmacy', 'stay', 'police', 'grocery', 'ev', 'toilet', 'parking', 'bus', 'train', 'worship'];
for (const key of CHIP_ORDER) {
  const c = CATEGORIES[key];
  const b = document.createElement('button');
  b.className = `chip-btn ${key}`;
  b.dataset.category = key;
  b.innerHTML = `${icon(c.icon, 16)}${c.label}`;
  b.addEventListener('click', () => showNearby(key));
  $('chips').appendChild(b);
}

function nearbyCentre() {
  // Around the user when we know where they are, else around the map view.
  if (state.here && map.getBounds().contains(state.here)) return state.here;
  const c = map.getCenter();
  return state.here || [c.lat, c.lng];
}

async function showNearby(category) {
  const c = CATEGORIES[category];
  const here = nearbyCentre();
  document.querySelectorAll('.chip-btn').forEach((b) => b.classList.toggle('active', b.dataset.category === category));
  openSheet('placesSheet');
  $('placesTitle').textContent = `${c.label} near you`;
  $('placesStatus').textContent = `Scanning nearby ${c.label.toLowerCase()}…`;
  $('placesList').innerHTML = '';
  try {
    const { places, radius } = await findPlaces(category, here);
    if (!places.length) {
      $('placesStatus').textContent = `No ${c.label.toLowerCase()} mapped within ${radius / 1000} km.`;
      return [];
    }
    $('placesStatus').textContent = `${places.length} found within ${radius / 1000} km, nearest first.`;
    renderPlaceList($('placesList'), places, c.icon, 'placesSheet');
    map.fitBounds(L.latLngBounds([here, ...places.slice(0, 6).map((p) => [p.lat, p.lon])]), { padding: [40, 40], maxZoom: 16 });
    return places;
  } catch {
    $('placesStatus').textContent = 'The places service is busy. Try again in a moment.';
    return [];
  }
}

// A named place ("Lulu mall") around the user.
async function showSearch(query) {
  const here = nearbyCentre();
  openSheet('placesSheet');
  $('placesTitle').textContent = `"${query}" near you`;
  $('placesStatus').textContent = 'Searching…';
  $('placesList').innerHTML = '';
  const results = await searchPlaces(query, here).catch(() => []);
  const places = results
    .map((r) => ({ ...r, id: `${r.lat},${r.lon}`, phone: '', hours: '', address: r.full.split(',').slice(1, 3).join(','), distance: haversine(here, [r.lat, r.lon]) }))
    .sort((a, b) => a.distance - b.distance);
  $('placesStatus').textContent = places.length ? `${places.length} found, nearest first.` : `Nothing called "${query}" found nearby.`;
  renderPlaceList($('placesList'), places, 'search', 'placesSheet');
  if (places.length) map.fitBounds(L.latLngBounds([here, ...places.slice(0, 6).map((p) => [p.lat, p.lon])]), { padding: [40, 40], maxZoom: 16 });
  return places;
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
    case 'nearby': {
      const category = CATEGORIES[params.category] ? params.category : 'hospital';
      closeSheet('aiSheet');
      const places = await showNearby(category);
      if (places.length) {
        const top = places.slice(0, 3).map((p) => `${p.name} (${formatDistance(p.distance)})`).join(', ');
        say('bot', `Nearest: ${top}. Tap Go on any of them to start.`);
      }
      return;
    }
    case 'search':
      closeSheet('aiSheet');
      return showSearch(params.query || '');
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

const SHEETS = ['routesSheet', 'placesSheet', 'sosSheet', 'aiSheet', 'settingsSheet'];
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
  document.body.classList.toggle('sheet-open', Boolean(open));
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
addEventListener('appinstalled', () => toast('EasyWay installed. Open it from your home screen.'));

updateAiMode();
locate();
refreshHotspots();
