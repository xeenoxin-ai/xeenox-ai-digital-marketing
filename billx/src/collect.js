// "Get paid on time, never miss a bill": pure logic, tested in Node.
//  - bulk customer import (paste from Excel / WhatsApp, or a CSV file)
//  - which bills to chase today (overdue, due today, due soon)
//  - the WhatsApp reminder message
//  - repeating bills (monthly rent, school fees, AMC, gym…)

import { splitCSVLine } from './pos-logic.js';
import { STATES } from './calc.js';

/* ---------------- bulk customers ---------------- */

const CLIENT_KEYS = {
  name: ['name', 'customer', 'customer name', 'client', 'client name', 'party', 'party name', 'patient', 'guest', 'student', 'member', 'contact name'],
  phone: ['phone', 'mobile', 'mobile no', 'mobile number', 'phone number', 'phone no', 'contact', 'contact no', 'whatsapp', 'whatsapp no'],
  email: ['email', 'e-mail', 'email id', 'mail'],
  company: ['company', 'business', 'firm', 'organisation', 'organization', 'shop'],
  gstin: ['gstin', 'gst', 'gst no', 'gst number', 'gstin/uin'],
  address: ['address', 'billing address', 'street'],
  city: ['city', 'town', 'place'],
  state: ['state'],
  pincode: ['pincode', 'pin', 'pin code', 'zip', 'postal code'],
  notes: ['notes', 'note', 'remarks', 'remark'],
};

/** Last 10 digits of an Indian mobile number ("+91 98470-12345" → "9847012345"). */
export const phoneKey = (v) => String(v || '').replace(/\D/g, '').slice(-10);

const stateCode = (v) => {
  const t = String(v || '').trim().toLowerCase();
  if (!t) return '';
  const hit = STATES.find(([c, n]) => c === t.padStart(2, '0') || n.toLowerCase() === t);
  return hit ? hit[0] : '';
};

/**
 * Parse a customer list. Commas, tabs (copied from Excel) or semicolons.
 * With a heading row the columns can be in any order; without one the order is
 * name, phone, email, company, GSTIN, address, city. Lines like "Ravi 9847012345"
 * also work.
 */
export function parseClientList(text) {
  const lines = String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { clients: [], skipped: 0 };
  const sep = lines[0].includes('\t') ? '\t' : lines[0].includes(';') && !lines[0].includes(',') ? ';' : ',';
  let cols = ['name', 'phone', 'email', 'company', 'gstin', 'address', 'city'];
  const first = splitCSVLine(lines[0], sep).map((c) => c.toLowerCase().replace(/[.:*]/g, '').trim());
  let start = 0;
  if (first.some((c) => CLIENT_KEYS.name.includes(c))) {
    cols = first.map((c) => Object.keys(CLIENT_KEYS).find((k) => CLIENT_KEYS[k].includes(c)) || '');
    start = 1;
  }
  const clients = [];
  let skipped = 0;
  for (const line of lines.slice(start)) {
    let cells = splitCSVLine(line, sep);
    let use = cols;
    if (cells.length === 1) {
      const m = line.match(/^(.*?)[\s,:\-–]+(\+?[\d][\d\s-]{8,})$/);
      cells = m ? [m[1], m[2]] : [line];
      use = ['name', 'phone'];
    }
    const rec = {};
    use.forEach((k, i) => { if (k && cells[i] !== undefined && cells[i] !== '') rec[k] = cells[i].trim(); });
    if (!rec.name) { skipped++; continue; }
    const c = { name: rec.name, phone: '', email: '', company: '', gstin: '', address: '', city: '', state: '', pincode: '', notes: '', extra: {} };
    for (const k of ['email', 'company', 'address', 'city', 'pincode', 'notes']) if (rec[k]) c[k] = rec[k];
    if (rec.phone) c.phone = rec.phone.replace(/[^\d+\s-]/g, '').trim();
    if (rec.gstin) c.gstin = rec.gstin.toUpperCase().replace(/\s/g, '');
    if (rec.state) c.state = stateCode(rec.state);
    else if (/^\d{2}[A-Z]{5}\d{4}[A-Z][\dA-Z]Z[\dA-Z]$/.test(c.gstin)) c.state = c.gstin.slice(0, 2);
    clients.push(c);
  }
  return { clients, skipped };
}

/**
 * Split an import into new customers and updates of existing ones
 * (same phone number, or the same name when there is no phone).
 */
export function mergeClients(existing, incoming) {
  const byPhone = new Map();
  const byName = new Map();
  for (const c of existing) {
    if (phoneKey(c.phone).length === 10) byPhone.set(phoneKey(c.phone), c);
    byName.set(c.name.trim().toLowerCase(), c);
  }
  const add = [];
  const update = [];
  const seen = new Set();
  for (const c of incoming) {
    const pk = phoneKey(c.phone);
    const nk = c.name.trim().toLowerCase();
    const key = pk.length === 10 ? `p${pk}` : `n${nk}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const match = (pk.length === 10 && byPhone.get(pk)) || (!pk && byName.get(nk));
    if (match) {
      const patch = {};
      for (const [k, v] of Object.entries(c)) if (k !== 'extra' && v && !match[k]) patch[k] = v;
      if (Object.keys(patch).length) update.push({ ...match, ...patch });
    } else add.push(c);
  }
  return { add, update };
}

/* ---------------- who to chase today ---------------- */

const DAY = 86400000;
export const daysBetween = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY);

/**
 * Group unpaid invoices for follow-up.
 * rows: [{ d, t }] where t.balance is the amount still due.
 * Returns { overdue, today, soon, total } (soon = due in the next `soonDays`).
 */
export function collectionList(rows, today, soonDays = 3) {
  const out = { overdue: [], today: [], soon: [], total: 0 };
  for (const r of rows) {
    const { d, t } = r;
    if (d.type !== 'invoice' || ['draft', 'cancelled'].includes(d.status) || !(t.balance > 0.004)) continue;
    const due = d.dueDate || d.date;
    const gap = daysBetween(today, due);
    const item = { ...r, due, daysLate: Math.max(0, -gap), daysLeft: Math.max(0, gap), lastReminded: lastReminder(d) };
    if (gap < 0) out.overdue.push(item);
    else if (gap === 0) out.today.push(item);
    else if (gap <= soonDays) out.soon.push(item);
    else continue;
    out.total += t.balance;
  }
  out.overdue.sort((a, b) => b.daysLate - a.daysLate || b.t.balance - a.t.balance);
  out.soon.sort((a, b) => a.daysLeft - b.daysLeft);
  return out;
}

export const lastReminder = (d) => ((d.reminders || []).slice(-1)[0] || {}).date || '';

/** Friendly reminder text for WhatsApp / SMS / email. */
export function reminderText({ name, business, docTitle, number, amount, due, today, link, upiId }) {
  const late = daysBetween(due, today);
  const when = late > 0 ? `was due on ${fmt(due)} (${late} day${late === 1 ? '' : 's'} ago)` : late === 0 ? 'is due today' : `is due on ${fmt(due)}`;
  return [
    `Hello ${name || ''},`.replace(' ,', ','),
    '',
    `This is a friendly reminder from ${business}: ${docTitle} ${number} for ${amount} ${when}.`,
    link ? `View the bill and pay online: ${link}` : '',
    upiId ? `UPI: ${upiId}` : '',
    '',
    'Please ignore this message if you have already paid. Thank you!',
  ].join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

const fmt = (iso) => {
  const [y, m, d] = String(iso).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
};

/* ---------------- repeating bills ---------------- */

export const REPEAT_EVERY = { week: 'Every week', month: 'Every month', quarter: 'Every 3 months', year: 'Every year' };

/** The next date after `iso` for a repeat interval; month-ends stay at the month's end (31 Jan → 28/29 Feb). */
export function nextDate(iso, every) {
  const [y, m, d] = iso.split('-').map(Number);
  if (every === 'week') return new Date(Date.UTC(y, m - 1, d + 7)).toISOString().slice(0, 10);
  const add = { month: 1, quarter: 3, year: 12 }[every] || 1;
  const target = new Date(Date.UTC(y, m - 1 + add, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, last));
  return target.toISOString().slice(0, 10);
}

/** Repeating bills whose next date has come (they should be created now). */
export const dueRepeats = (docs, today) => docs.filter((d) => d.repeat && d.repeat.active && d.repeat.next && d.repeat.next <= today && d.status !== 'cancelled')
  .sort((a, b) => a.repeat.next.localeCompare(b.repeat.next));
