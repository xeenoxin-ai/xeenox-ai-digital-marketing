// Shared app helpers bound to the current settings.
import { computeTotals, docStatus, formatMoney } from './calc.js';
import { settings, all } from './store.js';

export const totalsOf = (doc, s = settings()) =>
  computeTotals(doc, { sellerState: s.business.state, taxMode: s.taxMode, roundOff: s.roundOff, taxInclusive: s.taxInclusive });

export const statusOf = (doc, t = totalsOf(doc)) => docStatus(doc, t);

export const money = (n) => formatMoney(n, settings().currency);

export const clientLabel = () => settings().clientLabel || 'Client';

/** Documents with their totals and live status, newest first. */
export function docsWithTotals(filter = () => true) {
  return all('docs').filter(filter).map((d) => {
    const t = totalsOf(d);
    return { d, t, status: statusOf(d, t) };
  }).sort((a, b) => (b.d.date || '').localeCompare(a.d.date || '') || (b.d.number || '').localeCompare(a.d.number || ''));
}

/** Money owed on invoices (credit notes reduce it). */
export function clientBalance(clientId) {
  let billed = 0;
  let paid = 0;
  let credit = 0;
  for (const { d, t, status } of docsWithTotals((x) => x.clientId === clientId)) {
    if (status === 'cancelled' || status === 'draft') continue;
    if (d.type === 'invoice') { billed += t.payable; paid += t.paid; }
    if (d.type === 'credit') credit += t.total;
  }
  return { billed, paid, credit, outstanding: billed - paid - credit };
}

export function csvCell(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}
export const toCSV = (rows) => rows.map((r) => r.map(csvCell).join(',')).join('\n');
