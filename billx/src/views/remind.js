// Get paid on time and never miss a bill:
//  - one-tap WhatsApp payment reminders (with the private pay link)
//  - repeating bills (every week / month / quarter / year)

import {
  settings, upsert, flush, today, get, saveDoc, duplicateDoc, DOC_TYPES,
} from '../store.js';
import { encodePortal, portalPayload } from '../portal-codec.js';
import { addDays } from '../calc.js';
import { fmtDate } from '../templates.js';
import {
  reminderText, nextDate, daysBetween, REPEAT_EVERY,
} from '../collect.js';
import { totalsOf, money } from '../helpers.js';
import { esc, modal, toast, options, field } from '../ui.js';

async function payLink(doc) {
  const cl = doc.client || {};
  const client = cl.id ? (get('clients', cl.id) || cl) : cl;
  const token = await encodePortal(portalPayload(settings(), client, [doc]));
  return `${new URL('../portal.html', location.href.split('#')[0]).href}#${token}`;
}

export const waNumber = (phone) => {
  const p = String(phone || '').replace(/\D/g, '');
  return p.length === 10 ? `91${p}` : p;
};

/** Open WhatsApp with a ready reminder for this bill and note that it was sent. */
export async function sendReminder(doc) {
  // Open the window now (inside the click) so pop-up blockers allow it.
  const win = window.open('about:blank', '_blank');
  const s = settings();
  const t = totalsOf(doc);
  const cl = doc.client || {};
  let link = '';
  try { link = await payLink(doc); } catch { /* still send without the link */ }
  const text = reminderText({
    name: cl.name || '', business: s.business.name, docTitle: doc.title || DOC_TYPES[doc.type].title, number: doc.number,
    amount: money(Math.max(t.balance, 0)), due: doc.dueDate || doc.date, today: today(), link, upiId: s.business.upiId || '',
  });
  const url = `https://wa.me/${waNumber(cl.phone)}?text=${encodeURIComponent(text)}`;
  if (win) win.location.href = url; else window.open(url, '_blank', 'noopener');
  doc.reminders = [...(doc.reminders || []), { date: today(), via: 'whatsapp' }];
  upsert('docs', doc);
  flush();
  toast(`Reminder ready for ${cl.name || doc.number}`);
}

export const remindedLabel = (doc) => {
  const last = ((doc.reminders || []).slice(-1)[0] || {}).date;
  if (!last) return '';
  const n = daysBetween(last, today());
  return n <= 0 ? 'Reminded today' : `Reminded ${n} day${n === 1 ? '' : 's'} ago`;
};

/* ---------------- repeating bills ---------------- */

/** Create every bill that is due from a repeating template (catching up missed periods). */
export function createFromRepeat(tpl) {
  const created = [];
  const gap = tpl.dueDate && tpl.date ? Math.max(0, daysBetween(tpl.date, tpl.dueDate)) : Number(settings().dueDays) || 0;
  let guard = 0;
  while (tpl.repeat && tpl.repeat.active && tpl.repeat.next <= today() && guard++ < 24) {
    const copy = duplicateDoc(tpl);
    Object.assign(copy, {
      date: tpl.repeat.next, dueDate: addDays(tpl.repeat.next, gap), status: 'sent', repeat: null, repeatOf: tpl.id, reminders: [],
    });
    created.push(saveDoc(copy));
    tpl.repeat.next = nextDate(tpl.repeat.next, tpl.repeat.every);
  }
  upsert('docs', tpl);
  flush();
  return created;
}

export function repeatDialog(doc, done) {
  const r = doc.repeat || {};
  const every = r.every || 'month';
  modal({
    title: r.active ? 'Repeating bill' : 'Repeat this bill',
    submit: 'Save',
    body: `<p class="muted">BillX reminds you on the dashboard when the next bill is due and creates it in one tap, with the same ${esc(((doc.client || {}).name) || 'customer')}, items and amounts. Good for rent, school or tuition fees, gym, AMC and monthly services.</p>
      <div class="grid g2">
        ${field('Repeat', `<select name="every">${options(Object.entries(REPEAT_EVERY), every)}</select>`)}
        ${field('Next bill on', `<input type="date" name="next" value="${esc(r.next || nextDate(doc.date, every))}" required>`)}
      </div>
      ${r.active ? '<label class="check"><input type="checkbox" name="stop"> Stop repeating this bill</label>' : ''}`,
    onSubmit: (fd) => {
      if (fd.has('stop')) doc.repeat = { ...r, active: false };
      else doc.repeat = { every: fd.get('every'), next: fd.get('next'), active: true };
      upsert('docs', doc);
      flush();
      toast(doc.repeat.active ? `Repeats ${REPEAT_EVERY[doc.repeat.every].toLowerCase()} · next ${fmtDate(doc.repeat.next)}` : 'Repeating stopped');
      if (done) done();
    },
  });
  const sel = document.querySelector('dialog[open] select[name=every]');
  const next = document.querySelector('dialog[open] input[name=next]');
  if (sel && next && !r.next) sel.addEventListener('change', () => { next.value = nextDate(doc.date, sel.value); });
}
