// Helpers shared by the views, bound to the current business.
import { settings, all, get } from './store.js';
import { fmtDate, fmtTime, fill, waLink, priceOf, STATUS, serviceIdsOf, customerStats, ymd } from './logic.js';
import { esc, icon } from './ui.js';

export const L = () => settings().labels;
export const isOrders = () => settings().mode === 'orders';
export const today = () => ymd();
export const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };

export function money(n) {
  const v = Number(n) || 0;
  return `${settings().currency || '₹'}${v.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export const svc = (id) => get('services', id);
export const staffOf = (id) => get('staff', id);
export const customerOf = (id) => get('customers', id);

/** "Haircut + Beard trim" or "2× Birthday cake, 1× Puffs". */
export function whatOf(a) {
  if (a.items?.length) return a.items.map((i) => `${i.qty}× ${i.name || svc(i.serviceId)?.name || 'Item'}`).join(', ');
  return serviceIdsOf(a).map((id) => svc(id)?.name).filter(Boolean).join(' + ') || L().booking;
}

export const statusChip = (s) => `<span class="chip ${STATUS[s]?.tone || ''}">${esc(STATUS[s]?.name || s)}</span>`;

/** Values for message templates about one booking / customer. */
export function vars(customer, a = null, extra = {}) {
  const s = settings();
  const st = customer ? customerStats(customer.id, all('appts'), all('services'), s) : null;
  const every = Number(s.loyalty?.every) || 0;
  let loyalty = '';
  if (s.loyalty?.enabled && every && st) {
    const left = every - st.stamps;
    loyalty = st.rewardReady ? `You have earned ${s.loyalty.reward}!` : `${left} more visit${left === 1 ? '' : 's'} to earn ${s.loyalty.reward}.`;
  }
  return {
    name: (customer?.name || '').split(' ')[0] || 'there',
    fullname: customer?.name || '',
    business: s.business.name || 'us',
    phone: s.business.phone || '',
    booking: L().booking.toLowerCase(),
    date: a ? fmtDate(a.date) : '',
    time: a ? fmtTime(a.start) : '',
    service: a ? whatOf(a) : '',
    items: a ? whatOf(a) : '',
    total: a ? money(priceOf(a, all('services'))) : '',
    advance: a ? money(a.advance || 0) : '',
    staff: a?.staffId ? staffOf(a.staffId)?.name || '' : '',
    review: s.reviewLink || '',
    link: s.booking?.shortLink || '',
    loyalty,
    ...extra,
  };
}

export const message = (key, customer, a, extra) => fill(settings().templates[key], vars(customer, a, extra));

export function waHref(customer, text) {
  return waLink(customer?.phone || '', text, settings().countryCode);
}

/** WhatsApp button; `data-sent` lets the caller record that it was sent. */
export const waBtn = (customer, text, { label = 'WhatsApp', cls = '', sent = '' } = {}) =>
  customer?.phone
    ? `<a class="btn wa ${cls}" href="${esc(waHref(customer, text))}" target="_blank" rel="noopener" ${sent ? `data-sent="${esc(sent)}"` : ''}>${icon('whatsapp', 16)} ${esc(label)}</a>`
    : `<span class="muted small">No phone</span>`;

export const callBtn = (customer) => (customer?.phone ? `<a class="icon-btn" href="tel:${esc(customer.phone)}" aria-label="Call">${icon('phone', 16)}</a>` : '');

export const empty = (title, text = '', action = '') => `<div class="empty"><h3>${esc(title)}</h3>${text ? `<p>${esc(text)}</p>` : ''}${action}</div>`;
