// Pure booking logic (no DOM): dates, free slots, repeat-visit reminders,
// loyalty, customer stats, reports and message templates.

export const pad = (n) => String(n).padStart(2, '0');
export const ymd = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parts = (s) => s.split('-').map(Number);
export const parseYmd = (s) => { const [y, m, d] = parts(s); return new Date(y, m - 1, d); };
const utc = (s) => { const [y, m, d] = parts(s); return Date.UTC(y, m - 1, d); };
export const addDays = (s, n) => { const d = new Date(utc(s) + n * 86400000); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; };
export const daysBetween = (a, b) => Math.round((utc(b) - utc(a)) / 86400000);
export const weekday = (s) => new Date(utc(s)).getUTCDay();

export const toMin = (hhmm) => {
  if (typeof hhmm === 'number') return hhmm;
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || '').trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};
export const toHHMM = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
export function fmtTime(min) {
  if (min == null) return '';
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`;
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export function fmtDate(s, { weekday: wd = true, year = false } = {}) {
  if (!s) return '';
  const [y, m, d] = parts(s);
  return `${wd ? `${DAYS[weekday(s)]}, ` : ''}${d} ${MONTHS[m - 1]}${year ? ` ${y}` : ''}`;
}
/** "Today", "Tomorrow", "Yesterday" or the date. */
export function relDate(s, today) {
  const n = daysBetween(today, s);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  return fmtDate(s, { year: s.slice(0, 4) !== today.slice(0, 4) });
}
export const ago = (days) => (days <= 0 ? 'today' : days === 1 ? 'yesterday' : days < 60 ? `${days} days ago` : `${Math.round(days / 30)} months ago`);

export const overlaps = (a1, a2, b1, b2) => a1 < b2 && b1 < a2;

// Bookings that hold their time. No-shows in the future are unlikely; cancelled never hold.
export const ACTIVE = new Set(['booked', 'confirmed', 'arrived', 'done']);
export const UPCOMING = new Set(['booked', 'confirmed']);
export const STATUS = {
  booked: { name: 'Booked', tone: 'blue' },
  confirmed: { name: 'Confirmed', tone: 'teal' },
  arrived: { name: 'Arrived', tone: 'amber' },
  done: { name: 'Done', tone: 'green' },
  noshow: { name: 'No-show', tone: 'red' },
  cancelled: { name: 'Cancelled', tone: 'grey' },
};

export const endOf = (a) => a.start + (a.duration || 0);

/** Opening window for a date, or null when closed. Breaks come back separately. */
export function dayWindow(settings, date) {
  if ((settings.closedDates || []).includes(date)) return null;
  const h = settings.hours?.[weekday(date)];
  if (!h || !h.open) return null;
  const from = toMin(h.from);
  const to = toMin(h.to);
  if (from == null || to == null || to <= from) return null;
  const bf = toMin(h.breakFrom);
  const bt = toMin(h.breakTo);
  return { from, to, breaks: bf != null && bt != null && bt > bf ? [[bf, bt]] : [] };
}

export const worksOn = (staff, date) => !staff.days || staff.days.includes(weekday(date));

/**
 * Free start times on a date.
 * Appointment mode: a slot is free for a staff member when the whole service
 * (plus buffer) fits inside their hours, avoids the break and every booking they hold.
 * Order mode: a pickup slot is free while it holds fewer than `capacity` orders.
 * Returns [{ start, staffIds }] (staffIds empty in order mode or with no staff).
 */
export function freeSlots({ settings, date, duration = 30, staff = [], appts = [], staffId = '', nowMin = null, ignoreId = null }) {
  const win = dayWindow(settings, date);
  if (!win) return [];
  const step = Math.max(5, Number(settings.step) || 15);
  const buffer = Math.max(0, Number(settings.buffer) || 0);
  const day = appts.filter((a) => a.date === date && ACTIVE.has(a.status) && (ignoreId == null || a.id !== ignoreId));
  const inBreak = (s, e) => win.breaks.some(([b1, b2]) => overlaps(s, e, b1, b2));
  const out = [];

  if (settings.mode === 'orders') {
    const cap = Math.max(1, Number(settings.capacity) || 1);
    for (let t = win.from; t + step <= win.to; t += step) {
      if (nowMin != null && t <= nowMin) continue;
      if (inBreak(t, t + step)) continue;
      const n = day.filter((a) => a.start >= t && a.start < t + step).length;
      if (n < cap) out.push({ start: t, staffIds: [], left: cap - n });
    }
    return out;
  }

  const len = Math.max(step, Number(duration) || step);
  const team = staff.filter((s) => !s.off && worksOn(s, date) && (!staffId || s.id === staffId));
  // No staff set up: the business itself is one chair.
  const people = staff.length ? team : [{ id: '' }];
  for (let t = win.from; t + len <= win.to; t += step) {
    if (nowMin != null && t <= nowMin) continue;
    if (inBreak(t, t + len)) continue;
    const free = [];
    for (const p of people) {
      const from = toMin(p.from) ?? win.from;
      const to = toMin(p.to) ?? win.to;
      if (t < from || t + len > to) continue;
      const clash = day.some((a) => (a.staffId || '') === p.id && overlaps(t, t + len + buffer, a.start, endOf(a) + buffer));
      if (!clash) free.push(p.id);
    }
    if (free.length) out.push({ start: t, staffIds: free.filter(Boolean) });
  }
  return out;
}

/** Bookings on the same staff member that overlap this one (for warnings when a time is forced). */
export function clashes(appt, appts) {
  return appts.filter((a) => a.id !== appt.id && a.date === appt.date && ACTIVE.has(a.status)
    && (a.staffId || '') === (appt.staffId || '') && a.kind !== 'order' && appt.kind !== 'order'
    && overlaps(appt.start, endOf(appt), a.start, endOf(a)));
}

/** Total of a booking: services (or order lines) minus discount. */
export function bookingTotal(appt, services = []) {
  let sum = 0;
  if (appt.items?.length) for (const it of appt.items) sum += (Number(it.price) || 0) * (Number(it.qty) || 0);
  else for (const id of appt.serviceIds || []) sum += Number(services.find((s) => s.id === id)?.price) || 0;
  return Math.max(0, sum - (Number(appt.discount) || 0));
}
export const priceOf = (appt, services) => (appt.price != null && appt.price !== '' ? Number(appt.price) : bookingTotal(appt, services));

export function durationOf(serviceIds, services, fallback = 30) {
  const d = serviceIds.reduce((n, id) => n + (Number(services.find((s) => s.id === id)?.duration) || 0), 0);
  return d || fallback;
}

export const serviceIdsOf = (a) => (a.items?.length ? a.items.map((i) => i.serviceId).filter(Boolean) : a.serviceIds || []);

/** Next token number for walk-ins on a date. */
export const nextToken = (appts, date) => 1 + appts.filter((a) => a.date === date).reduce((m, a) => Math.max(m, Number(a.token) || 0), 0);

// ---------- customers ----------

export function customerStats(customerId, appts, services, settings = {}) {
  const mine = appts.filter((a) => a.customerId === customerId);
  const done = mine.filter((a) => a.status === 'done').sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start);
  const spent = done.reduce((n, a) => n + priceOf(a, services), 0);
  const count = {};
  for (const a of done) for (const id of serviceIdsOf(a)) count[id] = (count[id] || 0) + 1;
  const fav = Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  let gaps = 0;
  for (let i = 1; i < done.length; i++) gaps += daysBetween(done[i - 1].date, done[i].date);
  const every = Number(settings.loyalty?.every) || 0;
  const stamps = settings.loyalty?.enabled && every ? done.length - (Number(settings.redeemed?.[customerId]) || 0) * every : 0;
  return {
    visits: done.length,
    spent,
    firstVisit: done[0]?.date || '',
    lastVisit: done.at(-1)?.date || '',
    avgGap: done.length > 1 ? Math.round(gaps / (done.length - 1)) : 0,
    noShows: mine.filter((a) => a.status === 'noshow').length,
    cancelled: mine.filter((a) => a.status === 'cancelled').length,
    favouriteServiceId: fav,
    stamps: Math.max(0, stamps),
    rewardReady: every > 0 && stamps >= every,
  };
}

/** Segment a customer for the list filters. */
export function segment(stats, upcoming, today, lapsedDays = 90) {
  if (!stats.visits) return upcoming ? 'new' : 'lead';
  const since = daysBetween(stats.lastVisit, today);
  if (!upcoming && since >= lapsedDays) return 'lapsed';
  if (stats.visits >= 4) return 'regular';
  return 'active';
}

export function upcomingFor(customerId, appts, today) {
  return appts.filter((a) => a.customerId === customerId && UPCOMING.has(a.status) && a.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start);
}

/**
 * Repeat-visit list: for every customer and every service with a revisit gap,
 * the last completed visit + gap = due date. Hidden when a future booking exists,
 * the customer opted out, or it is snoozed. Shows items due within `window` days
 * and up to `maxOverdue` days late (older ones are "lapsed" instead).
 */
export function revisitsDue({ customers, appts, services, today, window = 7, maxOverdue = 120 }) {
  const gap = new Map(services.filter((s) => Number(s.revisitDays) > 0).map((s) => [s.id, Number(s.revisitDays)]));
  const last = new Map();
  for (const a of appts) {
    if (a.status !== 'done') continue;
    for (const sid of serviceIdsOf(a)) {
      if (!gap.has(sid)) continue;
      const k = `${a.customerId}|${sid}`;
      if (!last.has(k) || last.get(k) < a.date) last.set(k, a.date);
    }
  }
  const hasFuture = new Set(appts.filter((a) => UPCOMING.has(a.status) && a.date >= today).map((a) => a.customerId));
  const byId = new Map(customers.map((c) => [c.id, c]));
  const out = [];
  for (const [k, lastDate] of last) {
    const [cid, sid] = k.split('|');
    const c = byId.get(cid);
    if (!c || c.optOut || hasFuture.has(cid)) continue;
    if (c.snoozeUntil && c.snoozeUntil > today) continue;
    const due = addDays(lastDate, gap.get(sid));
    const daysLeft = daysBetween(today, due);
    if (daysLeft > window || -daysLeft > maxOverdue) continue;
    const key = `rv:${sid}:${lastDate}`;
    out.push({ customer: c, serviceId: sid, lastDate, due, daysLeft, key, sentOn: c.sent?.[key] || '', status: daysLeft < 0 ? 'overdue' : daysLeft === 0 ? 'today' : 'soon' });
  }
  // One row per customer: the most urgent service.
  const best = new Map();
  for (const r of out.sort((a, b) => a.daysLeft - b.daysLeft)) if (!best.has(r.customer.id)) best.set(r.customer.id, r);
  return [...best.values()];
}

/** Customers who stopped coming: last visit at least `days` ago and nothing booked. */
export function lapsed({ customers, appts, today, days = 90 }) {
  const lastVisit = new Map();
  for (const a of appts) if (a.status === 'done' && (!lastVisit.has(a.customerId) || lastVisit.get(a.customerId) < a.date)) lastVisit.set(a.customerId, a.date);
  const hasFuture = new Set(appts.filter((a) => UPCOMING.has(a.status) && a.date >= today).map((a) => a.customerId));
  return customers.filter((c) => !c.optOut && lastVisit.has(c.id) && !hasFuture.has(c.id) && !(c.snoozeUntil > today))
    .map((c) => {
      const since = daysBetween(lastVisit.get(c.id), today);
      const key = `wb:${lastVisit.get(c.id)}`;
      return { customer: c, lastDate: lastVisit.get(c.id), days: since, key, sentOn: c.sent?.[key] || '' };
    })
    .filter((r) => r.days >= days)
    .sort((a, b) => a.days - b.days);
}

/** Next date (YYYY-MM-DD) an annual MM-DD (or YYYY-MM-DD) falls on, from today. */
export function nextAnnual(mmdd, today) {
  const md = String(mmdd || '').slice(-5);
  if (!/^\d{2}-\d{2}$/.test(md)) return '';
  const y = Number(today.slice(0, 4));
  const fix = (yy) => (md === '02-29' && !(yy % 4 === 0 && (yy % 100 !== 0 || yy % 400 === 0)) ? `${yy}-02-28` : `${yy}-${md}`);
  const thisYear = fix(y);
  return thisYear >= today ? thisYear : fix(y + 1);
}

/** Birthdays, anniversaries and other yearly dates within `lead` days. */
export function occasionsDue({ customers, today, lead = 7 }) {
  const out = [];
  for (const c of customers) {
    if (c.optOut) continue;
    const list = [...(c.birthday ? [{ label: 'birthday', date: c.birthday }] : []), ...(c.anniversary ? [{ label: 'anniversary', date: c.anniversary }] : []), ...(c.occasions || [])];
    for (const o of list) {
      const on = nextAnnual(o.date, today);
      if (!on) continue;
      const daysLeft = daysBetween(today, on);
      if (daysLeft > lead) continue;
      const key = `oc:${o.label}:${on}`;
      out.push({ customer: c, label: o.label, on, daysLeft, key, sentOn: c.sent?.[key] || '' });
    }
  }
  return out.sort((a, b) => a.daysLeft - b.daysLeft);
}

/** Bookings to remind: upcoming ones from tomorrow up to `days` ahead (and today's later ones). */
export function remindersDue({ appts, customers, today, days = 1 }) {
  const byId = new Map(customers.map((c) => [c.id, c]));
  const until = addDays(today, days);
  return appts.filter((a) => UPCOMING.has(a.status) && a.date > today && a.date <= until)
    .sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start)
    .map((a) => ({ appt: a, customer: byId.get(a.customerId), key: `rm:${a.id}`, sentOn: a.remindedOn || '' }))
    .filter((r) => r.customer);
}

// ---------- reports ----------

export function report({ appts, customers, services, staff = [], from, to }) {
  const inRange = appts.filter((a) => a.date >= from && a.date <= to);
  const done = inRange.filter((a) => a.status === 'done');
  const revenue = done.reduce((n, a) => n + priceOf(a, services), 0);
  const advance = inRange.filter((a) => a.status !== 'cancelled').reduce((n, a) => n + (Number(a.advance) || 0), 0);
  const days = daysBetween(from, to) + 1;
  const byDay = [];
  for (let i = 0; i < days; i++) {
    const d = addDays(from, i);
    const list = done.filter((a) => a.date === d);
    byDay.push({ date: d, visits: list.length, revenue: list.reduce((n, a) => n + priceOf(a, services), 0) });
  }
  const svc = new Map();
  for (const a of done) {
    for (const sid of serviceIdsOf(a)) {
      const s = svc.get(sid) || { id: sid, count: 0 };
      s.count += a.items?.length ? Number(a.items.find((i) => i.serviceId === sid)?.qty) || 1 : 1;
      svc.set(sid, s);
    }
  }
  const byStaff = staff.map((s) => {
    const list = done.filter((a) => a.staffId === s.id);
    return { id: s.id, name: s.name, visits: list.length, revenue: list.reduce((n, a) => n + priceOf(a, services), 0) };
  });
  const hours = Array(24).fill(0);
  for (const a of done) hours[Math.floor(a.start / 60) % 24]++;
  // Repeat rate: of the customers served in range, how many have 2+ completed visits ever.
  const allDone = appts.filter((a) => a.status === 'done');
  const visitsEver = new Map();
  for (const a of allDone) visitsEver.set(a.customerId, (visitsEver.get(a.customerId) || 0) + 1);
  const firstEver = new Map();
  for (const a of allDone) if (!firstEver.has(a.customerId) || firstEver.get(a.customerId) > a.date) firstEver.set(a.customerId, a.date);
  const served = new Set(done.map((a) => a.customerId));
  const repeat = [...served].filter((id) => visitsEver.get(id) >= 2).length;
  const fresh = [...served].filter((id) => firstEver.get(id) >= from).length;
  const closed = inRange.filter((a) => ['done', 'noshow'].includes(a.status)).length;
  return {
    bookings: inRange.filter((a) => a.status !== 'cancelled').length,
    visits: done.length,
    revenue,
    advance,
    avgTicket: done.length ? Math.round(revenue / done.length) : 0,
    noShows: inRange.filter((a) => a.status === 'noshow').length,
    noShowRate: closed ? inRange.filter((a) => a.status === 'noshow').length / closed : 0,
    cancelled: inRange.filter((a) => a.status === 'cancelled').length,
    customersServed: served.size,
    newCustomers: fresh,
    repeatCustomers: repeat,
    repeatRate: served.size ? repeat / served.size : 0,
    onlineBookings: inRange.filter((a) => a.source === 'link').length,
    byDay,
    topServices: [...svc.values()].sort((a, b) => b.count - a.count).map((s) => ({ ...s, name: services.find((x) => x.id === s.id)?.name || 'Removed service' })),
    byStaff,
    hours,
    totalCustomers: customers.length,
  };
}

// ---------- messages ----------

export const fill = (tpl, vars) => String(tpl || '')
  .replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k] ?? '') : m))
  .replace(/ {2,}/g, ' ').replace(/ +([.,!?])/g, '$1').trim();

/** Digits for wa.me: 10-digit local numbers get the country code. */
export function waNumber(phone, cc = '91') {
  let d = String(phone || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  if (d.length <= 10) d = `${String(cc).replace(/\D/g, '')}${d}`;
  return d;
}
export const waLink = (phone, text, cc) => {
  const n = waNumber(phone, cc);
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
};
export const smsLink = (phone, text) => `sms:${String(phone || '').replace(/[^\d+]/g, '')}?body=${encodeURIComponent(text)}`;

/** A calendar file for one booking (customer's "Add to calendar"). */
export function icsEvent({ uid, title, date, start, duration, location = '', description = '' }) {
  const dt = (min) => `${date.replaceAll('-', '')}T${pad(Math.floor(min / 60))}${pad(min % 60)}00`;
  const escI = (s) => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BookX//EN', 'BEGIN:VEVENT', `UID:${uid}@bookx`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`, `DTSTART:${dt(start)}`, `DTEND:${dt(start + (duration || 30))}`,
    `SUMMARY:${escI(title)}`, location && `LOCATION:${escI(location)}`, description && `DESCRIPTION:${escI(description)}`,
    'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', `DESCRIPTION:${escI(title)}`, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR']
    .filter(Boolean).join('\r\n');
}

/** Search customers by name or phone digits. */
export function findCustomers(q, customers) {
  const s = String(q || '').trim().toLowerCase();
  if (!s) return customers;
  const digits = s.replace(/\D/g, '');
  return customers.filter((c) => c.name.toLowerCase().includes(s) || (digits.length >= 3 && String(c.phone || '').replace(/\D/g, '').includes(digits)));
}

export const samePhone = (a, b) => {
  const x = String(a || '').replace(/\D/g, '').slice(-10);
  return x.length >= 6 && x === String(b || '').replace(/\D/g, '').slice(-10);
};
