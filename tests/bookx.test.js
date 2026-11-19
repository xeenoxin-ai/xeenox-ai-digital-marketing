// BookX: slots, repeat-visit reminders, loyalty, reports, messages, links.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addDays, daysBetween, weekday, fmtTime, toMin, freeSlots, clashes, bookingTotal, durationOf, nextToken,
  customerStats, revisitsDue, lapsed, occasionsDue, nextAnnual, remindersDue, report, fill, waNumber, icsEvent,
  findCustomers, segment, relDate,
} from '../bookx/src/logic.js';
import { encode, decode, bookingPayload, payloadSettings, payloadAppts, requestPayload, readRequest } from '../bookx/src/codec.js';
import { PRESETS } from '../bookx/src/presets.js';
import { fromPreset } from '../bookx/src/store.js';

const open = (from, to, breakFrom = '', breakTo = '') => ({ open: true, from, to, breakFrom, breakTo });
const hours = Array.from({ length: 7 }, (_, i) => (i === 0 ? { open: false } : open('09:00', '12:00', '10:00', '10:30')));
const base = { mode: 'appointments', step: 30, buffer: 0, hours, closedDates: [] };
const MON = '2026-11-16';

test('dates: add, diff, weekday, time formats', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
  assert.equal(daysBetween('2026-01-01', '2026-03-01'), 59);
  assert.equal(weekday(MON), 1);
  assert.equal(fmtTime(0), '12:00 AM');
  assert.equal(fmtTime(13 * 60 + 5), '1:05 PM');
  assert.equal(toMin('09:30'), 570);
  assert.equal(toMin('bad'), null);
  assert.equal(relDate('2026-11-17', MON), 'Tomorrow');
});

test('slots: hours, break, closed day, holidays, past times', () => {
  const s = freeSlots({ settings: base, date: MON, duration: 30 });
  assert.deepEqual(s.map((x) => fmtTime(x.start)), ['9:00 AM', '9:30 AM', '10:30 AM', '11:00 AM', '11:30 AM']);
  assert.equal(freeSlots({ settings: base, date: '2026-11-15', duration: 30 }).length, 0, 'Sunday closed');
  assert.equal(freeSlots({ settings: { ...base, closedDates: [MON] }, date: MON }).length, 0, 'holiday');
  assert.equal(freeSlots({ settings: base, date: MON, duration: 60 }).map((x) => x.start).join(), '540,630,660', 'long service avoids the break');
  assert.equal(freeSlots({ settings: base, date: MON, duration: 30, nowMin: 640 })[0].start, 660, 'no past times today');
});

test('slots: per-staff bookings, buffer, staff hours and days', () => {
  const staff = [{ id: 'a', name: 'A' }, { id: 'b', name: 'B', from: '10:30', days: [1, 2] }];
  const appts = [{ id: 'x', date: MON, start: 540, duration: 30, staffId: 'a', status: 'booked' }];
  const s = freeSlots({ settings: base, date: MON, duration: 30, staff, appts });
  assert.deepEqual(s.find((x) => x.start === 540), undefined, 'A busy, B not started yet');
  assert.deepEqual(s.find((x) => x.start === 630).staffIds, ['a', 'b']);
  assert.equal(freeSlots({ settings: base, date: '2026-11-18', duration: 30, staff, staffId: 'b' }).length, 0, 'B off Wednesday');
  const cancelled = [{ ...appts[0], status: 'cancelled' }];
  assert.ok(freeSlots({ settings: base, date: MON, staff, appts: cancelled }).find((x) => x.start === 540), 'cancelled frees time');
  const buf = freeSlots({ settings: { ...base, buffer: 15 }, date: MON, staff: [staff[0]], appts });
  assert.equal(buf.find((x) => x.start === 570), undefined, 'buffer after a booking');
  assert.ok(freeSlots({ settings: base, date: MON, staff, appts, ignoreId: 'x' }).find((x) => x.start === 540), 'rescheduling ignores itself');
});

test('slots: order mode uses pickup capacity', () => {
  const st = { ...base, mode: 'orders', capacity: 2 };
  const appts = [540, 545].map((start, i) => ({ id: `o${i}`, date: MON, start, status: 'booked', kind: 'order' }));
  const s = freeSlots({ settings: st, date: MON, appts });
  assert.equal(s.find((x) => x.start === 540), undefined, 'full');
  assert.equal(s.find((x) => x.start === 570).left, 2);
});

test('clashes, totals, durations, tokens', () => {
  const a = { id: '1', date: MON, start: 600, duration: 60, staffId: 'a', status: 'booked' };
  assert.equal(clashes({ id: '2', date: MON, start: 630, duration: 30, staffId: 'a' }, [a]).length, 1);
  assert.equal(clashes({ id: '2', date: MON, start: 660, duration: 30, staffId: 'a' }, [a]).length, 0);
  const services = [{ id: 's1', price: 300, duration: 30 }, { id: 's2', price: 150, duration: 15 }];
  assert.equal(bookingTotal({ serviceIds: ['s1', 's2'], discount: 50 }, services), 400);
  assert.equal(bookingTotal({ items: [{ price: 90, qty: 3 }] }, services), 270);
  assert.equal(durationOf(['s1', 's2'], services), 45);
  assert.equal(nextToken([{ date: MON, token: 4 }, { date: MON }], MON), 5);
});

const services = [{ id: 'cut', name: 'Haircut', price: 300, revisitDays: 30 }, { id: 'col', name: 'Colour', price: 1500, revisitDays: 45 }, { id: 'oneoff', name: 'Bridal', price: 9000, revisitDays: 0 }];
const customers = [
  { id: 'c1', name: 'Anu', phone: '9847012345' },
  { id: 'c2', name: 'Ben', phone: '+91 98470 99999' },
  { id: 'c3', name: 'Cia', phone: '9000000003', optOut: true },
  { id: 'c4', name: 'Dev', phone: '9000000004' },
];
const today = '2026-11-19';
const visit = (customerId, date, serviceIds, status = 'done', extra = {}) => ({ id: `${customerId}${date}${serviceIds}`, customerId, date, start: 600, duration: 30, serviceIds, status, ...extra });
const appts = [
  visit('c1', '2026-09-10', ['cut']),
  visit('c1', '2026-10-15', ['cut']), // due 2026-11-14, overdue 5
  visit('c2', '2026-10-01', ['col']), // due 2026-11-15
  visit('c2', '2026-11-25', ['cut'], 'booked'), // but has a future booking
  visit('c3', '2026-10-15', ['cut']), // opted out
  visit('c4', '2026-10-22', ['cut', 'oneoff']), // due 2026-11-21, in 2 days
  visit('c4', '2026-05-01', ['cut'], 'noshow'),
];

test('revisits: due dates, future bookings and opt-outs hide rows', () => {
  const r = revisitsDue({ customers, appts, services, today, window: 7 });
  assert.deepEqual(r.map((x) => [x.customer.id, x.serviceId, x.due, x.status]), [
    ['c1', 'cut', '2026-11-14', 'overdue'],
    ['c4', 'cut', '2026-11-21', 'soon'],
  ]);
  const snoozed = customers.map((c) => (c.id === 'c1' ? { ...c, snoozeUntil: '2026-11-26' } : c));
  assert.equal(revisitsDue({ customers: snoozed, appts, services, today }).length, 1);
  assert.equal(revisitsDue({ customers, appts, services, today, window: 1 }).length, 1, 'window');
});

test('lapsed customers and yearly occasions', () => {
  const l = lapsed({ customers, appts, today, days: 30 });
  assert.deepEqual(l.map((x) => [x.customer.id, x.days]), [['c1', 35]]);
  assert.equal(nextAnnual('11-25', today), '2026-11-25');
  assert.equal(nextAnnual('1990-01-02', today), '2027-01-02');
  assert.equal(nextAnnual('02-29', '2026-03-01'), '2027-02-28');
  const oc = occasionsDue({ customers: [{ id: 'z', name: 'Z', birthday: '11-22', anniversary: '12-25' }], today, lead: 7 });
  assert.deepEqual(oc.map((o) => [o.label, o.daysLeft]), [['birthday', 3]]);
});

test('booking reminders for tomorrow', () => {
  const list = remindersDue({ appts: [...appts, visit('c1', '2026-11-20', ['cut'], 'confirmed'), visit('c4', '2026-11-19', ['cut'], 'booked')], customers, today, days: 1 });
  assert.deepEqual(list.map((r) => r.customer.id), ['c1']);
});

test('customer stats, loyalty stamps, segments', () => {
  const st = customerStats('c1', appts, services, { loyalty: { enabled: true, every: 2 }, redeemed: {} });
  assert.equal(st.visits, 2);
  assert.equal(st.spent, 600);
  assert.equal(st.avgGap, 35);
  assert.equal(st.rewardReady, true);
  assert.equal(customerStats('c1', appts, services, { loyalty: { enabled: true, every: 2 }, redeemed: { c1: 1 } }).stamps, 0);
  assert.equal(customerStats('c4', appts, services).noShows, 1);
  assert.equal(segment(st, null, today, 30), 'lapsed');
  assert.equal(segment({ visits: 0 }, null, today), 'lead');
});

test('report: revenue, repeat rate, no-shows, top services', () => {
  const r = report({ appts, customers, services, from: '2026-10-01', to: '2026-11-19' });
  assert.equal(r.visits, 4);
  assert.equal(r.revenue, 300 + 1500 + 300 + 300 + 9000);
  assert.equal(r.customersServed, 4);
  assert.equal(r.repeatCustomers, 1);
  assert.equal(r.topServices[0].id, 'cut');
  assert.equal(r.byDay.length, 50);
});

test('messages: templates and WhatsApp numbers', () => {
  assert.equal(fill('Hi {name}, see you {date} .', { name: 'Anu', date: 'Mon' }), 'Hi Anu, see you Mon.');
  assert.equal(fill('Keep {unknown}', {}), 'Keep {unknown}');
  assert.equal(waNumber('98470 12345'), '919847012345');
  assert.equal(waNumber('+91 98470 12345'), '919847012345');
  assert.equal(waNumber('09847012345'), '919847012345');
  assert.equal(waNumber('4155550100', '1'), '14155550100');
  const ics = icsEvent({ uid: 'x', title: 'Haircut', date: MON, start: 570, duration: 30 });
  assert.match(ics, /DTSTART:20261116T093000/);
  assert.match(ics, /DTEND:20261116T100000/);
});

test('search by name or phone digits', () => {
  assert.deepEqual(findCustomers('anu', customers).map((c) => c.id), ['c1']);
  assert.deepEqual(findCustomers('99999', customers).map((c) => c.id), ['c2']);
});

test('presets: every type loads with hours for 7 days', () => {
  for (const type of Object.keys(PRESETS)) {
    const d = fromPreset(type, { name: 'X' });
    assert.equal(d.settings.hours.length, 7, type);
    assert.ok(d.services.length, type);
    assert.ok(d.settings.labels.customer, type);
  }
  assert.equal(fromPreset('bakery').settings.mode, 'orders');
});

test('booking link round-trip hides customers and rebuilds busy times', async () => {
  const d = fromPreset('salon', { name: 'Glow', phone: '9847000000' });
  d.customers.push({ id: 'c', name: 'Secret Name', phone: '9999999999' });
  d.appts.push({ id: 'a', customerId: 'c', date: MON, start: 600, duration: 30, staffId: d.staff[0].id, status: 'booked' });
  d.appts.push({ id: 'b', customerId: 'c', date: MON, start: 660, duration: 30, staffId: d.staff[0].id, status: 'cancelled' });
  const p = bookingPayload(d, { today: '2026-11-10' });
  const token = await encode(p);
  assert.ok(!token.includes('Secret'));
  const back = await decode(token);
  assert.ok(!JSON.stringify(back).includes('Secret Name'));
  assert.equal(back.b.name, 'Glow');
  const busy = payloadAppts(back);
  assert.equal(busy.length, 1);
  const slots = freeSlots({ settings: payloadSettings(back), date: MON, duration: 30, staff: back.sf, appts: busy, staffId: d.staff[0].id });
  assert.equal(slots.find((s) => s.start === 600), undefined);
});

test('booking request round-trip is sanitised', async () => {
  const t = await encode(requestPayload({ name: 'Anu', phone: '98470', serviceIds: ['s1'], items: [{ serviceId: 'p', qty: 2 }], date: MON, start: 600 }));
  const r = readRequest(await decode(t));
  assert.deepEqual([r.name, r.serviceIds, r.items[0].qty, r.date, r.start], ['Anu', ['s1'], 2, MON, 600]);
  assert.equal(readRequest({ d: 'nope', t: 'x', i: [['p', 99999]] }).date, '');
  assert.equal(readRequest({ i: [['p', 99999]] }).items[0].qty, 999);
});
