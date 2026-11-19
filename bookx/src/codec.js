// Links without a server. The booking page link carries the business, its
// services, hours and busy times in the #fragment; a customer's booking
// request travels back the same way inside a WhatsApp message. Fragments
// never reach any web server.

const b64url = (bytes) => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
};
const fromB64url = (str) => {
  const s = atob(str.replaceAll('-', '+').replaceAll('_', '/'));
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
};
async function pipe(bytes, stream) {
  const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await res.arrayBuffer());
}

export async function encode(payload) {
  const json = new TextEncoder().encode(JSON.stringify(payload));
  if (typeof CompressionStream === 'function') return `z${b64url(await pipe(json, new CompressionStream('deflate-raw')))}`;
  return `j${b64url(json)}`;
}

export async function decode(token) {
  const t = String(token || '').trim();
  let bytes = fromB64url(t.slice(1));
  if (t[0] === 'z') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
  else if (t[0] !== 'j') throw new Error('Unknown link format');
  return JSON.parse(new TextDecoder().decode(bytes));
}

/** What the public booking page may see: no customer names, only busy times. */
export function bookingPayload(data, { today, days = 30, appUrl = '' }) {
  const s = data.settings;
  const until = new Date(Date.parse(`${today}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);
  const busy = {};
  for (const a of data.appts) {
    if (a.date < today || a.date > until || !['booked', 'confirmed', 'arrived', 'done'].includes(a.status)) continue;
    (busy[a.date] ||= []).push([a.start, a.duration || 0, a.staffId || '']);
  }
  return {
    v: 1,
    gen: today,
    days,
    app: appUrl,
    b: { name: s.business.name, phone: s.business.phone, address: s.business.address, type: s.type, about: s.booking?.note || '' },
    l: s.labels,
    m: s.mode,
    cc: s.countryCode,
    cur: s.currency,
    st: s.step, bf: s.buffer, cap: s.capacity, lead: s.booking?.leadMin ?? 60,
    h: s.hours,
    cd: (s.closedDates || []).filter((d) => d >= today),
    sv: data.services.filter((x) => !x.hidden).map((x) => ({ id: x.id, n: x.name, d: x.duration, p: x.price, c: x.category || '' })),
    sf: data.staff.filter((x) => !x.off).map((x) => ({ id: x.id, n: x.name, days: x.days, from: x.from || '', to: x.to || '' })),
    busy,
  };
}

/** Settings-like object the slot finder understands, rebuilt from a booking payload. */
export const payloadSettings = (p) => ({ mode: p.m, step: p.st, buffer: p.bf, capacity: p.cap, hours: p.h, closedDates: p.cd });
export const payloadAppts = (p) => Object.entries(p.busy || {}).flatMap(([date, list]) =>
  list.map(([start, duration, staffId], i) => ({ id: `b${date}${i}`, date, start, duration, staffId, status: 'booked', kind: p.m === 'orders' ? 'order' : 'appointment' })));

/** A customer's request, compact. */
export const requestPayload = ({ name, phone, serviceIds = [], items = [], staffId = '', date, start, note = '', delivery = '' }) =>
  ({ v: 1, n: name, p: phone, s: serviceIds, i: items.map((x) => [x.serviceId, x.qty]), sf: staffId, d: date, t: start, no: note, dl: delivery, at: Date.now() });

export const readRequest = (r) => ({
  name: String(r.n || '').slice(0, 80), phone: String(r.p || '').slice(0, 20),
  serviceIds: Array.isArray(r.s) ? r.s.map(String) : [],
  items: Array.isArray(r.i) ? r.i.map(([serviceId, qty]) => ({ serviceId: String(serviceId), qty: Math.max(1, Math.min(999, Number(qty) || 1)) })) : [],
  staffId: String(r.sf || ''), date: /^\d{4}-\d{2}-\d{2}$/.test(r.d) ? r.d : '', start: Number.isFinite(r.t) ? r.t : null,
  note: String(r.no || '').slice(0, 500), delivery: String(r.dl || '').slice(0, 300), at: Number(r.at) || 0,
});
