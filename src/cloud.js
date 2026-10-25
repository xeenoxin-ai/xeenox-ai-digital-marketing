// Shared EasyWay data in Firebase Firestore: jam reports, anonymous speed
// samples, reviews and places users add. Everything here is optional: with no
// Firebase config every call quietly returns nothing and the app keeps
// working on-device.
//
// Firebase is loaded on first use (separate bundle chunk), users are signed
// in anonymously (no account, no personal data), and "near me" queries use
// geohash ranges (geofire-common).

import { geohashForLocation, geohashQueryBounds, distanceBetween } from 'geofire-common';
import { firebaseConfig } from './firebase-config.js';

// Local testing against the Firebase Emulator: build with VITE_FIREBASE_EMULATOR=host
// (e.g. "localhost"); uses a demo project that never touches the internet.
const EMULATOR = import.meta.env?.VITE_FIREBASE_EMULATOR || '';
const CONFIG = EMULATOR ? { projectId: 'demo-easyway', apiKey: 'demo-key', authDomain: 'demo-easyway.firebaseapp.com' } : firebaseConfig;

export const cloudEnabled = () => Boolean(CONFIG);

const JAM_SLOT_MIN = 60; // jams live for an hour
const SPEED_SLOT_MIN = 10; // speeds count for 10-20 minutes
export const slotOf = (ms, minutes) => Math.floor(ms / 60000 / minutes);

let ready = null;

function connect() {
  ready ??= (async () => {
    const [{ initializeApp }, fs, auth] = await Promise.all([
      import('firebase/app'),
      import('firebase/firestore/lite'),
      import('firebase/auth'),
    ]);
    const app = initializeApp(CONFIG);
    const db = fs.getFirestore(app);
    const a = auth.getAuth(app);
    if (EMULATOR) {
      fs.connectFirestoreEmulator(db, EMULATOR, 8080);
      auth.connectAuthEmulator(a, `http://${EMULATOR}:9099`, { disableWarnings: true });
    }
    const { user } = await auth.signInAnonymously(a);
    return { db, fs, uid: user.uid };
  })();
  ready.catch(() => {
    ready = null; // offline or not set up yet: try again next time
  });
  return ready;
}

async function withCloud(fn, fallback) {
  if (!cloudEnabled()) return fallback;
  try {
    return await fn(await connect());
  } catch {
    return fallback;
  }
}

// Documents within radius of center, from the given time slots.
async function nearbyDocs({ db, fs }, collectionName, center, radiusM, slots) {
  const bounds = geohashQueryBounds(center, radiusM);
  const snaps = await Promise.all(
    bounds.map(([start, end]) => {
      const parts = [fs.collection(db, collectionName)];
      if (slots) parts.push(fs.where('slot', 'in', slots));
      parts.push(fs.orderBy('geohash'), fs.startAt(start), fs.endAt(end), fs.limit(500));
      return fs.getDocs(fs.query(...parts));
    }),
  );
  return snaps.flatMap((s) => s.docs.map((d) => ({ id: d.id, ...d.data() })));
}

// ---------- Jams ----------

export function shareJam([lat, lon]) {
  return withCloud(async ({ db, fs, uid }) => {
    await fs.addDoc(fs.collection(db, 'jams'), {
      lat, lon,
      geohash: geohashForLocation([lat, lon]),
      slot: slotOf(Date.now(), JAM_SLOT_MIN),
      createdAt: fs.serverTimestamp(),
      uid,
    });
    return true;
  }, false);
}

// Jams reported by anyone in the last hour, within radiusM.
export function recentJams(center, radiusM = 15000) {
  return withCloud(async (c) => {
    const now = Date.now();
    const s = slotOf(now, JAM_SLOT_MIN);
    const docs = await nearbyDocs(c, 'jams', center, radiusM, [s, s - 1]);
    return docs
      .filter((d) => now - (d.createdAt?.toMillis?.() ?? now) < 60 * 60000)
      .filter((d) => distanceBetween([d.lat, d.lon], center) * 1000 <= radiusM)
      .map((d) => ({ lat: d.lat, lon: d.lon }));
  }, []);
}

// ---------- Crowd traffic speeds ----------

export function shareSpeed([lat, lon], kmh) {
  return withCloud(async ({ db, fs }) => {
    await fs.addDoc(fs.collection(db, 'speeds'), {
      geohash: geohashForLocation([lat, lon]),
      slot: slotOf(Date.now(), SPEED_SLOT_MIN),
      speed: Math.round(Math.min(200, Math.max(0, kmh)) * 10) / 10,
      createdAt: fs.serverTimestamp(),
    });
    return true;
  }, false);
}

// Group recent speed samples into ~150 m cells (geohash 7) and return cells
// where traffic is crawling: average under 15 km/h from at least 2 samples.
export function summariseSpeeds(samples, { slowKmh = 15, minSamples = 2 } = {}) {
  const cells = new Map();
  for (const s of samples) {
    const key = s.geohash.slice(0, 7);
    const c = cells.get(key) || { sum: 0, n: 0, geohash: key };
    c.sum += s.speed;
    c.n++;
    cells.set(key, c);
  }
  return [...cells.values()]
    .map((c) => ({ geohash: c.geohash, speed: c.sum / c.n, samples: c.n }))
    .filter((c) => c.samples >= minSamples && c.speed < slowKmh);
}

export function slowRoads(center, radiusM = 15000) {
  return withCloud(async (c) => {
    const s = slotOf(Date.now(), SPEED_SLOT_MIN);
    const docs = await nearbyDocs(c, 'speeds', center, radiusM, [s, s - 1]);
    return summariseSpeeds(docs).map((cell) => ({ ...cell, ...decodeGeohash(cell.geohash) }));
  }, []);
}

// Centre of a geohash cell.
export function decodeGeohash(hash) {
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let even = true;
  const lat = [-90, 90], lon = [-180, 180];
  for (const ch of hash) {
    const bits = BASE32.indexOf(ch);
    for (let b = 4; b >= 0; b--) {
      const range = even ? lon : lat;
      const mid = (range[0] + range[1]) / 2;
      if ((bits >> b) & 1) range[0] = mid;
      else range[1] = mid;
      even = !even;
    }
  }
  return { lat: (lat[0] + lat[1]) / 2, lon: (lon[0] + lon[1]) / 2 };
}

// ---------- Reviews ----------

// Stable key for a place: its OpenStreetMap id, else its rounded position.
export function placeKey(p) {
  if (p.userAdded && p.id) return `u${p.id.replace(/^u\//, '')}`;
  if (p.osmId) return `${String(p.osmType || 'n')[0].toLowerCase()}${p.osmId}`;
  return `ll${p.lat.toFixed(5)},${p.lon.toFixed(5)}`;
}

export function reviewsFor(key) {
  return withCloud(async ({ db, fs, uid }) => {
    const snap = await fs.getDocs(fs.query(
      fs.collection(db, 'reviews'),
      fs.where('placeKey', '==', key),
      fs.orderBy('createdAt', 'desc'),
      fs.limit(50),
    ));
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data(), mine: d.data().uid === uid }));
    const count = items.length;
    const avg = count ? items.reduce((a, r) => a + r.rating, 0) / count : 0;
    return { count, avg, items };
  }, { count: 0, avg: 0, items: [] });
}

export function saveReview(key, placeName, rating, text) {
  return withCloud(async ({ db, fs, uid }) => {
    await fs.setDoc(fs.doc(db, 'reviews', `${key}_${uid}`), {
      placeKey: key,
      placeName: placeName.slice(0, 120),
      rating,
      text: text.trim().slice(0, 500),
      createdAt: fs.serverTimestamp(),
      uid,
    });
    return true;
  }, false);
}

// ---------- Places users add ----------

export function saveUserPlace([lat, lon], { name, category, phone, details }) {
  return withCloud(async ({ db, fs, uid }) => {
    const data = { name: name.trim().slice(0, 120), lat, lon, geohash: geohashForLocation([lat, lon]), createdAt: fs.serverTimestamp(), uid };
    if (category?.trim()) data.category = category.trim().slice(0, 60);
    if (phone?.trim()) data.phone = phone.trim().slice(0, 30);
    if (details?.trim()) data.details = details.trim().slice(0, 300);
    const ref = await fs.addDoc(fs.collection(db, 'userPlaces'), data);
    return ref.id;
  }, null);
}

// Places users added near center; with q, only names containing it.
export function userPlacesNear(center, radiusM = 25000, q = '') {
  return withCloud(async (c) => {
    const needle = q.trim().toLowerCase();
    const docs = await nearbyDocs(c, 'userPlaces', center, radiusM);
    return docs
      .filter((d) => !needle || d.name.toLowerCase().includes(needle) || (d.category || '').toLowerCase().includes(needle))
      .map((d) => ({
        id: `u/${d.id}`,
        lat: d.lat,
        lon: d.lon,
        name: d.name,
        kind: d.category || 'Added by EasyWay users',
        phone: d.phone || '',
        hours: '',
        address: d.details || '',
        userAdded: true,
        distance: distanceBetween([d.lat, d.lon], center) * 1000,
      }))
      .filter((p) => p.distance <= radiusM);
  }, []);
}
