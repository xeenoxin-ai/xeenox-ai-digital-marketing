// Live turn-by-turn driving inside EasyWay.
//
// Follows the phone's GPS along the chosen route, shows and speaks every turn,
// reroutes when the driver leaves the route, and every two minutes looks for
// an easier way from where the car is now (fresh routes + traffic), switching
// automatically when one saves real time.

import L from 'leaflet';
import {
  prepareNav, locateOnRoute, progress, dueAnnouncement, announcementText, isOffRoute,
} from './navigation.js';
import { icon } from './icons.js';
import { speak, keepScreenOn, isMuted, setMuted } from './device.js';
import { haversine, formatDistance, formatDuration } from './geo.js';

const RECHECK_MS = 2 * 60 * 1000;
const MIN_SAVING_S = 120; // switch only if the new way saves at least 2 minutes...
const MIN_SAVING_SHARE = 0.08; // ...and at least 8% of the remaining time
const OFF_ROUTE_FIXES = 3; // consecutive fixes off the line before rerouting

const $ = (id) => document.getElementById(id);

// `planner.bestRoutes(from, to, { avoidTolls })` resolves to routes ranked
// easiest first (each with line, maneuvers, total seconds incl. traffic).
export function createDrive(map, planner) {
  const doneLine = L.polyline([], { color: '#94a3b8', weight: 8, opacity: 0.9 });
  const aheadLine = L.polyline([], { color: '#2563eb', weight: 9 });
  const carIcon = L.divIcon({ className: 'car-marker', html: '<div class="car-arrow"></div>', iconSize: [34, 34] });
  const car = L.marker([0, 0], { icon: carIcon, zIndexOffset: 1000, interactive: false });

  let s = null; // the active session

  function show(id, on) {
    $(id).hidden = !on;
  }

  function setBanner(kind, dist, text) {
    $('navIcon').innerHTML = icon(kind, 40, 2.5);
    $('navDist').textContent = dist;
    $('navText').textContent = text;
  }

  function setRoute(route, { announce } = {}) {
    s.route = route;
    s.nav = prepareNav(route);
    s.hint = 0;
    s.spoken = new Set();
    s.offCount = 0;
    aheadLine.setLatLngs(route.line);
    doneLine.setLatLngs([]);
    if (announce) speak(announce);
  }

  async function start(route, dest, { avoidTolls, here }) {
    stop({ silent: true });
    s = { dest, avoidTolls, follow: true, rerouting: false, arrived: false, lastPos: here || null };
    document.body.classList.add('navigating');
    show('navBanner', true);
    show('navBar', true);
    $('navMute').innerHTML = icon(isMuted() ? 'mute' : 'sound', 22);
    doneLine.addTo(map);
    aheadLine.addTo(map);
    keepScreenOn(true);

    const first = route.maneuvers?.[0];
    setRoute(route, { announce: `Starting route to ${dest.label}. ${first?.verbal || first?.text || ''}` });
    setBanner(first?.kind || 'depart', '', first?.text || 'Head to the route');
    updateBottom(progress(s.nav, 0));

    s.watch = navigator.geolocation.watchPosition(onFix, onGpsError, {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 20000,
    });
    s.timer = setInterval(checkEasierWay, RECHECK_MS);

    // Planned from somewhere else? Start from where the car actually is.
    if (here && haversine(here, route.line[0]) > 150) reroute('Starting from your location.');
  }

  function stop({ silent } = {}) {
    if (!s) return;
    navigator.geolocation.clearWatch(s.watch);
    clearInterval(s.timer);
    s = null;
    map.removeLayer(doneLine);
    map.removeLayer(aheadLine);
    map.removeLayer(car);
    document.body.classList.remove('navigating');
    show('navBanner', false);
    show('navBar', false);
    show('navThen', false);
    show('navRecenter', false);
    keepScreenOn(false);
    if (!silent) planner.onExit?.();
  }

  function onGpsError() {
    if (s && !s.lastFix) setBanner('depart', '', 'Waiting for GPS… turn on location.');
  }

  function onFix(position) {
    if (!s || s.arrived) return;
    const { latitude, longitude, accuracy, heading } = position.coords;
    s.gps = { p: [latitude, longitude], accuracy, heading };
    s.lastPos = s.gps.p;
    s.lastFix = Date.now();
    update();
  }

  // Redraw everything for the latest GPS fix on the current route.
  function update() {
    if (!s || s.arrived || !s.gps) return;
    const { p, accuracy, heading } = s.gps;
    const loc = locateOnRoute(s.nav, p, s.hint);
    const off = isOffRoute(loc.offRoute, accuracy);
    s.offCount = off ? s.offCount + 1 : 0;
    if (!off) s.hint = loc.segment;
    if (s.offCount >= OFF_ROUTE_FIXES && !s.rerouting) {
      reroute('Rerouting.');
    }

    // Car marker: on the line when on route (steadier), raw GPS when off it.
    const shown = off ? p : pointAt(loc);
    const dir = off && Number.isFinite(heading) ? heading : loc.bearing;
    car.setLatLng(shown).addTo(map);
    car.getElement()?.querySelector('.car-arrow')?.style.setProperty('--heading', `${dir}deg`);
    if (!off) {
      doneLine.setLatLngs([...s.nav.line.slice(0, loc.segment), shown]);
      aheadLine.setLatLngs([shown, ...s.nav.line.slice(loc.segment)]);
    }
    if (s.follow) map.setView(shown, Math.max(map.getZoom(), 16), { animate: true });
    if (s.rerouting) return;

    const prog = progress(s.nav, loc.along);
    if (prog.remaining < 35 || haversine(p, s.dest.latlng) < 40) return arrive();

    const next = prog.next;
    updateBottom(prog);
    if (!next) return setBanner('straight', formatDistance(prog.remaining), 'Follow the highlighted route');
    setBanner(next.kind, formatDistance(prog.toNext), next.text);
    const then = prog.then && prog.then.along - next.along < 300 ? prog.then : null;
    show('navThen', Boolean(then));
    if (then) $('navThen').innerHTML = `Then ${icon(then.kind, 18)}`;

    const stage = dueAnnouncement(next, prog.toNext, s.spoken);
    if (stage) {
      s.spoken.add(`${next.id}:${stage}`);
      speak(announcementText(next, prog.toNext, stage));
    }
  }

  function pointAt(loc) {
    const { line, cum } = s.nav;
    const a = line[loc.segment - 1], b = line[loc.segment];
    const segLen = cum[loc.segment] - cum[loc.segment - 1];
    const t = segLen ? (loc.along - cum[loc.segment - 1]) / segLen : 0;
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }

  function updateBottom(prog) {
    const eta = new Date(Date.now() + prog.remainingTime * 1000);
    $('navEta').textContent = eta.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    $('navRemain').textContent = `${formatDuration(prog.remainingTime)} · ${formatDistance(prog.remaining)}`;
  }

  function arrive() {
    s.arrived = true;
    setBanner('arrive', '', `You have arrived at ${s.dest.label}`);
    show('navThen', false);
    $('navRemain').textContent = 'Arrived';
    speak('You have arrived at your destination.');
    navigator.geolocation.clearWatch(s.watch);
    clearInterval(s.timer);
    keepScreenOn(false);
  }

  async function reroute(message) {
    if (!s || !s.lastPos) return;
    const session = s;
    s.rerouting = true;
    setBanner('route', '', 'Finding the easiest way from here…');
    speak(message);
    try {
      const [best] = await planner.bestRoutes(s.lastPos, s.dest.latlng, { avoidTolls: s.avoidTolls });
      if (s !== session) return;
      if (best) setRoute(best);
      s.rerouting = false;
      update();
    } catch {
      planner.toast('No signal for routing. Retrying…');
      setTimeout(() => s === session && reroute(''), 15000);
    } finally {
      if (s === session) s.rerouting = false;
    }
  }

  // The "always the easiest way" check: fresh routes and traffic from here.
  async function checkEasierWay() {
    if (!s || s.rerouting || s.arrived || !s.lastPos) return;
    const session = s;
    const loc = locateOnRoute(s.nav, s.lastPos, s.hint);
    const current = progress(s.nav, loc.along).remainingTime;
    let best;
    try {
      [best] = await planner.bestRoutes(s.lastPos, s.dest.latlng, { avoidTolls: s.avoidTolls });
    } catch {
      return; // try again next round
    }
    if (s !== session || !best || s.rerouting) return;
    const saving = current - best.total;
    if (saving >= MIN_SAVING_S && saving >= current * MIN_SAVING_SHARE) {
      const min = Math.round(saving / 60);
      planner.toast(`Easier way found: saves ${min} min. Switching.`, 6000);
      setRoute(best, { announce: `Found an easier way. It saves ${min} minutes.` });
      update();
    }
  }

  // Wire the navigation controls once.
  map.on('dragstart', () => {
    if (!s) return;
    s.follow = false;
    show('navRecenter', true);
  });
  $('navRecenter').addEventListener('click', () => {
    if (!s) return;
    s.follow = true;
    show('navRecenter', false);
    if (s.lastPos) map.setView(s.lastPos, 17);
  });
  $('navMute').addEventListener('click', () => {
    setMuted(!isMuted());
    $('navMute').innerHTML = icon(isMuted() ? 'mute' : 'sound', 22);
  });
  $('navExit').addEventListener('click', () => stop());

  return {
    start,
    stop,
    get active() {
      return Boolean(s);
    },
    get position() {
      return s?.lastPos || null;
    },
    // A jam was just reported: look for a way around it now.
    recheckNow: () => checkEasierWay(),
  };
}
