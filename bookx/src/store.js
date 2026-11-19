// Local-first store: everything lives in this browser (localStorage).
// JSON backup / restore from Settings. No account or server needed.

import { preset, PALETTE, DEFAULT_TEMPLATES } from './presets.js';
import { ymd, addDays, toMin } from './logic.js';

const KEY = 'bookx-v1';
const mem = new Map();
const ls = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return mem.get(k) ?? null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { mem.set(k, v); } },
  del: (k) => { try { localStorage.removeItem(k); } catch { mem.delete(k); } },
};

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export function defaultSettings(type = 'salon') {
  const p = preset(type);
  return {
    type,
    mode: p.mode,
    business: { name: '', phone: '', address: '', email: '' },
    labels: { ...p.labels },
    hours: p.hours.map((h) => ({ ...h })),
    closedDates: [],
    step: 15,
    buffer: 0,
    capacity: p.capacity || 4,
    currency: '₹',
    countryCode: '91',
    lapsedDays: 90,
    revisitWindow: 7,
    occasionLead: 7,
    reminderDays: 1,
    loyalty: { enabled: true, every: 6, reward: type === 'bakery' ? 'a free pastry box' : 'your next visit at 50% off' },
    redeemed: {},
    reviewLink: '',
    booking: { note: '', leadMin: 60 },
    templates: { ...DEFAULT_TEMPLATES },
  };
}

export function fromPreset(type, business = {}) {
  const p = preset(type);
  const settings = { ...defaultSettings(type), business: { ...defaultSettings(type).business, ...business } };
  return {
    v: 1,
    settings,
    services: p.services.map((s) => ({ id: uid(), ...s })),
    staff: p.staff.map((name, i) => ({ id: uid(), name, color: PALETTE[i % PALETTE.length], days: null, from: '', to: '' })),
    customers: [],
    appts: [],
  };
}

let data = null;

export function load() {
  if (data) return data;
  try { data = JSON.parse(ls.get(KEY) || 'null'); } catch { data = null; }
  if (data) data = migrate(data);
  return data;
}
export const isSetUp = () => !!load();
export const db = () => load();
export function save() { if (data) ls.set(KEY, JSON.stringify(data)); }
export function replaceAll(next) { data = migrate(next); save(); }
export function reset() { data = null; ls.del(KEY); }

function migrate(d) {
  const base = defaultSettings(d.settings?.type || 'other');
  d.settings = { ...base, ...d.settings, labels: { ...base.labels, ...d.settings?.labels }, templates: { ...base.templates, ...d.settings?.templates }, loyalty: { ...base.loyalty, ...d.settings?.loyalty }, booking: { ...base.booking, ...d.settings?.booking } };
  for (const k of ['services', 'staff', 'customers', 'appts']) if (!Array.isArray(d[k])) d[k] = [];
  return d;
}

export const settings = () => load().settings;
export const all = (k) => load()[k];
export const get = (k, id) => load()[k].find((x) => x.id === id);

export function upsert(k, obj) {
  const list = load()[k];
  const i = list.findIndex((x) => x.id === obj.id);
  if (!obj.id) obj.id = uid();
  obj.updatedAt = Date.now();
  if (i >= 0) list[i] = obj;
  else { obj.createdAt ||= Date.now(); list.push(obj); }
  save();
  return obj;
}
export function remove(k, id) {
  const d = load();
  d[k] = d[k].filter((x) => x.id !== id);
  save();
}
export function patch(k, id, fields) {
  const o = get(k, id);
  if (!o) return null;
  Object.assign(o, fields, { updatedAt: Date.now() });
  save();
  return o;
}

export function setSettings(fn) { fn(load().settings); save(); }

/** Mark a reminder as sent so lists show "Sent today". */
export function markSent(customerId, key, date = ymd()) {
  const c = get('customers', customerId);
  if (!c) return;
  c.sent = { ...(c.sent || {}), [key]: date };
  save();
}

// ---------- sample data so a new user can try everything ----------

const NAMES = ['Anjali Menon', 'Rahul Nair', 'Fathima Rasheed', 'Arjun Krishnan', 'Lakshmi Pillai', 'Vishnu Das', 'Sneha Varghese', 'Mohammed Ashiq', 'Divya Raj', 'Kiran Kumar', 'Meera Suresh', 'Aditya Shenoy', 'Nisha Thomas', 'Sajith Babu'];

export function addSampleData(today = ymd()) {
  const d = load();
  const rnd = mulberry(7);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const svc = d.services.filter((s) => !s.hidden);
  if (!svc.length) return;
  const win = (date) => d.settings.hours[new Date(`${date}T00:00:00Z`).getUTCDay()];
  const customers = NAMES.map((name, i) => ({
    id: uid(), name, phone: `98${String(47000000 + i * 137911).padStart(8, '0')}`,
    birthday: i % 4 === 0 ? addDays(today, 3 + i).slice(5) : '', notes: '', tags: [], sample: true, createdAt: Date.now(),
  }));
  d.customers.push(...customers);
  const order = d.settings.mode === 'orders';
  // History: each customer visited 1–6 times over the last ~5 months.
  customers.forEach((c, ci) => {
    const visits = 1 + (ci % 6);
    let date = addDays(today, -(150 - ci * 5));
    const fav = svc[ci % svc.length];
    for (let v = 0; v < visits; v++) {
      const h = win(date);
      if (h?.open) {
        const s = rnd() < 0.7 ? fav : pick(svc);
        const start = Math.round(((toMin(h.from) + 60 + Math.floor(rnd() * 5) * 60) / 15)) * 15;
        d.appts.push(sampleAppt(d, c, s, date, start, rnd() < 0.08 ? 'noshow' : 'done', order));
      }
      date = addDays(date, (fav.revisitDays || 30) + Math.floor(rnd() * 10) - 3);
      if (date >= today) break;
    }
  });
  // Today and the next few days.
  for (let k = 0; k < 10; k++) {
    const date = addDays(today, Math.floor(k / 3));
    const h = win(date);
    if (!h?.open) continue;
    const s = pick(svc);
    const start = toMin(h.from) + 30 + (k % 3) * 90;
    d.appts.push(sampleAppt(d, customers[(k * 3) % customers.length], s, date, start, k % 2 ? 'confirmed' : 'booked', order));
  }
  save();
}

function sampleAppt(d, c, s, date, start, status, order) {
  const staff = d.staff.length ? d.staff[Math.floor(start / 30) % d.staff.length] : null;
  return {
    id: uid(), kind: order ? 'order' : 'appointment', customerId: c.id, date, start,
    duration: order ? 0 : s.duration || 30, staffId: staff?.id || '',
    serviceIds: order ? [] : [s.id], items: order ? [{ serviceId: s.id, name: s.name, qty: 1, price: s.price }] : [],
    price: null, status, notes: '', source: 'sample', sample: true, createdAt: Date.now(),
  };
}

export function clearSampleData() {
  const d = load();
  d.customers = d.customers.filter((c) => !c.sample);
  d.appts = d.appts.filter((a) => !a.sample);
  save();
}
export const hasSampleData = () => load().customers.some((c) => c.sample);

function mulberry(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
