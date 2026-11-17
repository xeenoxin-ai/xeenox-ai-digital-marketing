// Invoice designs. Each template turns one document into print-ready HTML.
// All share the same building blocks (header, parties, items, totals, tax
// summary, payment, signature) and differ in layout and styling.

import { computeTotals, docStatus, amountInWords, formatMoney, stateName, upiLink, lineValues } from './calc.js';
import { industry } from './industries.js';
import { DEFAULT_LABELS, DEFAULT_SHOW, DOC_TYPES } from './store.js';
import { qrSvg } from './qr.js';

export const TEMPLATES = [
  { id: 'modern', name: 'Modern', note: 'Accent band, clean table' },
  { id: 'classic', name: 'Classic', note: 'Centered letterhead, ruled table' },
  { id: 'minimal', name: 'Minimal', note: 'Whitespace, hairlines' },
  { id: 'bold', name: 'Bold', note: 'Full colour header, big total' },
  { id: 'elegant', name: 'Elegant', note: 'Serif, centred, double rules' },
  { id: 'corporate', name: 'Corporate', note: 'Colour sidebar with details' },
  { id: 'medical', name: 'Medical', note: 'Patient box, grouped services' },
  { id: 'gst', name: 'GST Boxed', note: 'Bordered grid, Indian GST format' },
  { id: 'compact', name: 'Compact', note: 'Dense, fits long bills' },
  { id: 'thermal', name: 'Thermal 80mm', note: 'POS receipt printer' },
];

export const FONTS = {
  inter: { name: 'Inter (sans)', css: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" },
  poppins: { name: 'Poppins (geometric)', css: "'Poppins', 'Inter', system-ui, sans-serif" },
  serif: { name: 'Playfair (serif)', css: "'Playfair Display', Georgia, 'Times New Roman', serif" },
  merriweather: { name: 'Merriweather (book)', css: "'Merriweather', Georgia, serif" },
  mono: { name: 'Mono (receipt)', css: "'JetBrains Mono', ui-monospace, 'Courier New', monospace" },
  system: { name: 'System default', css: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif" },
};

export const PAPERS = {
  A4: { name: 'A4 (210 × 297 mm)', w: 210, h: 297 },
  Letter: { name: 'US Letter (8.5 × 11 in)', w: 215.9, h: 279.4 },
  A5: { name: 'A5 (148 × 210 mm)', w: 148, h: 210 },
  '80mm': { name: 'Thermal 80 mm roll', w: 80, h: 0 },
  '58mm': { name: 'Thermal 58 mm roll', w: 58, h: 0 },
};

export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nl2br = (v) => esc(v).replace(/\n/g, '<br>');

export function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return esc(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Everything a template needs, computed once. */
export function buildContext(doc, settings) {
  const s = settings;
  const ind = industry(s.industry);
  const base = s.design || {};
  const design = {
    ...base,
    template: doc.template || base.template || 'modern',
    accent: doc.accent || base.accent || '#2563eb',
    show: { ...DEFAULT_SHOW, ...base.show },
  };
  if (design.template === 'thermal' && !['80mm', '58mm'].includes(design.paper)) design.paper = '80mm';
  if (design.template !== 'thermal' && ['80mm', '58mm'].includes(design.paper)) design.paper = 'A4';
  const L = { ...DEFAULT_LABELS, ...base.labels };
  const t = computeTotals(doc, { sellerState: s.business.state, taxMode: s.taxMode, roundOff: s.roundOff, taxInclusive: s.taxInclusive });
  const status = docStatus(doc, t);
  const cur = s.currency || 'INR';
  const money = (n) => formatMoney(n, cur);
  const plain = (n) => formatMoney(n, cur, false);
  const payNow = doc.type === 'invoice' || doc.type === 'proforma' ? Math.max(t.balance, 0) : 0;
  const upi = cur === 'INR' && s.business.upiId && payNow > 0
    ? upiLink({ upiId: s.business.upiId, payee: s.business.name, amount: payNow, note: `${doc.number}` })
    : '';
  return { doc, s, b: s.business, ind, design, L, show: design.show, t, status, cur, money, plain, upi, payNow };
}

/* ---------- building blocks ---------- */

function logo(c, cls = 'inv-logo') {
  return c.b.logo && c.show.logo ? `<img class="${cls}" src="${esc(c.b.logo)}" alt="">` : '';
}

function addressLines(o) {
  const cityLine = [o.city, o.state ? stateName(o.state) : '', o.pincode].filter(Boolean).join(', ');
  return [o.address, cityLine].filter(Boolean).map(nl2br).join('<br>');
}

function bizBlock(c, { name = true } = {}) {
  const b = c.b;
  if (!c.show.business) return '';
  const contact = c.show.contact ? [b.phone, b.email, b.website].filter(Boolean).map(esc).join(' · ') : '';
  const ids = [b.gstin && `GSTIN: ${esc(b.gstin)}`, b.pan && `PAN: ${esc(b.pan)}`, b.regNo && esc(b.regNo)].filter(Boolean).join(' · ');
  return `<div class="inv-biz">
    ${name ? `<div class="inv-biz-name">${esc(b.name)}</div>` : ''}
    ${b.tagline ? `<div class="inv-tagline">${esc(b.tagline)}</div>` : ''}
    <div class="inv-biz-addr">${addressLines(b)}</div>
    ${contact ? `<div class="inv-biz-contact">${contact}</div>` : ''}
    ${ids ? `<div class="inv-biz-ids">${ids}</div>` : ''}
  </div>`;
}

function title(c) {
  return esc(c.doc.title || c.s.docTitles[c.doc.type] || DOC_TYPES[c.doc.type].title);
}

function metaPairs(c) {
  const d = c.doc;
  const L = c.L;
  const isQuote = d.type === 'quote' || d.type === 'proforma';
  const pairs = [[`${DOC_TYPES[d.type].name} ${L.number}`, esc(d.number)], [L.date, fmtDate(d.date)]];
  if (d.dueDate && c.show.dueDate) pairs.push([isQuote ? L.validTill : L.dueDate, fmtDate(d.dueDate)]);
  if (c.show.placeOfSupply && c.s.taxMode === 'gst' && d.placeOfSupply) pairs.push([L.placeOfSupply, `${esc(stateName(d.placeOfSupply))} (${esc(d.placeOfSupply)})`]);
  if (d.reference) pairs.push(['Reference', esc(d.reference)]);
  for (const f of c.ind.fields) {
    const v = (d.fields || {})[f.key];
    if (v) pairs.push([esc(f.label), f.type === 'date' ? fmtDate(v) : esc(v)]);
  }
  for (const f of d.customFields || []) if (f.label && f.value) pairs.push([esc(f.label), esc(f.value)]);
  return pairs;
}

function metaTable(c, cls = 'inv-meta') {
  return `<table class="${cls}">${metaPairs(c).map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</table>`;
}

function clientExtras(c) {
  const ex = (c.doc.client && c.doc.client.extra) || {};
  return c.ind.clientFields.filter((f) => ex[f.key]).map((f) => [esc(f.label), esc(ex[f.key])]);
}

function party(c, { heading = c.L.billTo } = {}) {
  const cl = c.doc.client;
  if (!cl || !cl.name) return `<div class="inv-party"><div class="inv-h">${esc(heading)}</div><div class="inv-muted">—</div></div>`;
  const extras = clientExtras(c).map(([k, v]) => `<span><b>${k}:</b> ${v}</span>`).join('');
  return `<div class="inv-party">
    <div class="inv-h">${esc(heading)}</div>
    <div class="inv-party-name">${esc(cl.name)}</div>
    ${cl.company && cl.company !== cl.name ? `<div>${esc(cl.company)}</div>` : ''}
    <div class="inv-party-addr">${addressLines(cl)}</div>
    ${cl.phone ? `<div>${esc(cl.phone)}</div>` : ''}
    ${cl.email ? `<div>${esc(cl.email)}</div>` : ''}
    ${cl.gstin ? `<div><b>GSTIN:</b> ${esc(cl.gstin)}</div>` : ''}
    ${extras ? `<div class="inv-party-extra">${extras}</div>` : ''}
  </div>`;
}

function shipTo(c) {
  const cl = c.doc.client;
  if (!c.show.shipTo || !cl || !cl.shipAddress) return '';
  return `<div class="inv-party"><div class="inv-h">${esc(c.L.shipTo)}</div><div class="inv-party-addr">${nl2br(cl.shipAddress)}</div></div>`;
}

function columns(c) {
  const sh = c.show;
  const taxOn = c.s.taxMode !== 'none' && sh.taxCol;
  const anyDisc = (c.doc.items || []).some((i) => Number(i.discount) > 0);
  const extra = c.ind.itemCols.filter((x) => !x.hidden);
  return [
    { k: 'sn', label: '#', cls: 'c-sn' },
    { k: 'item', label: c.L.item, cls: 'c-item' },
    ...extra.map((x) => ({ k: x.key, label: x.label, cls: 'c-x' })),
    ...(sh.hsn ? [{ k: 'hsn', label: c.L.hsn, cls: 'c-hsn' }] : []),
    { k: 'qty', label: c.L.qty, cls: 'c-num' },
    { k: 'rate', label: c.L.rate, cls: 'c-num' },
    ...(sh.discountCol && anyDisc ? [{ k: 'discount', label: c.L.discount, cls: 'c-num' }] : []),
    ...(taxOn ? [{ k: 'tax', label: c.L.tax, cls: 'c-num' }] : []),
    { k: 'amount', label: c.L.amount, cls: 'c-num c-amt' },
  ];
}

function cell(c, col, it, idx) {
  switch (col.k) {
    case 'sn': return idx;
    case 'item': return `<div class="inv-item-name">${esc(it.name)}</div>${it.description ? `<div class="inv-item-desc">${nl2br(it.description)}</div>` : ''}`;
    case 'qty': return `${esc(+it.qty || 0)}${c.show.unit && it.unit ? ` <span class="inv-unit">${esc(it.unit)}</span>` : ''}`;
    case 'rate': return c.plain(it.rate);
    case 'discount': return Number(it.discount) ? `${esc(it.discount)}%` : '–';
    case 'tax': return `${esc(+it.tax || 0)}%`;
    case 'amount': return c.plain(lineValues(it).net);
    default: return esc(it[col.k]);
  }
}

function itemsTable(c, cls = 'inv-items') {
  const cols = columns(c);
  const items = (c.doc.items || []).filter((i) => i.name || Number(i.rate));
  const head = `<thead><tr>${cols.map((col) => `<th class="${col.cls}">${esc(col.label)}</th>`).join('')}</tr></thead>`;
  const grouped = c.design.groupByCategory && items.some((i) => i.category);
  let n = 0;
  let body = '';
  if (grouped) {
    const groups = new Map();
    for (const it of items) {
      const g = it.category || 'Other';
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(it);
    }
    for (const [g, list] of groups) {
      body += `<tr class="inv-group"><td colspan="${cols.length}">${esc(g)}</td></tr>`;
      for (const it of list) {
        n++;
        body += `<tr>${cols.map((col) => `<td class="${col.cls}">${cell(c, col, it, n)}</td>`).join('')}</tr>`;
      }
      const sub = list.reduce((s, it) => s + lineValues(it).net, 0);
      body += `<tr class="inv-group-sub"><td colspan="${cols.length - 1}">${esc(g)} total</td><td class="c-num">${c.plain(sub)}</td></tr>`;
    }
  } else {
    body = items.map((it, i) => `<tr>${cols.map((col) => `<td class="${col.cls}">${cell(c, col, it, i + 1)}</td>`).join('')}</tr>`).join('');
  }
  if (!items.length) body = `<tr><td colspan="${cols.length}" class="inv-empty">No items yet</td></tr>`;
  return `<table class="${cls}">${head}<tbody>${body}</tbody></table>`;
}

function totalRows(c) {
  const t = c.t;
  const L = c.L;
  const rows = [[L.subtotal, c.money(t.gross)]];
  if (t.discountTotal) rows.push([L.discountTotal, `− ${c.money(t.discountTotal)}`]);
  if (t.totalTax || t.discountTotal) rows.push([L.taxable, c.money(t.taxable)]);
  for (const x of t.taxes) {
    if (c.s.taxMode === 'gst') {
      if (t.interState) rows.push([`IGST @ ${x.rate}%`, c.money(x.igst)]);
      else {
        rows.push([`CGST @ ${x.rate / 2}%`, c.money(x.cgst)]);
        rows.push([`SGST @ ${x.rate / 2}%`, c.money(x.sgst)]);
      }
    } else rows.push([`Tax @ ${x.rate}%`, c.money(x.amount)]);
  }
  if (t.shipping) rows.push([L.shipping, c.money(t.shipping)]);
  if (t.adjustment) rows.push([L.adjustment, c.money(t.adjustment)]);
  if (t.roundOff) rows.push([L.roundOff, c.money(t.roundOff)]);
  const out = rows.map(([k, v]) => ({ k, v }));
  out.push({ k: L.total, v: c.money(t.total), cls: 'inv-grand' });
  if (t.insurance) {
    out.push({ k: L.insurance, v: `− ${c.money(t.insurance)}` });
    out.push({ k: L.payable, v: c.money(t.payable), cls: 'inv-strong' });
  }
  const showPay = ['invoice', 'proforma'].includes(c.doc.type);
  if (showPay && t.paid) {
    out.push({ k: L.paid, v: `− ${c.money(t.paid)}` });
    out.push({ k: L.balance, v: c.money(t.balance), cls: 'inv-strong inv-balance' });
  }
  if (c.doc.type === 'receipt') out.push({ k: 'Amount Received', v: c.money(t.payable), cls: 'inv-strong' });
  return out;
}

function totals(c, cls = 'inv-totals') {
  return `<table class="${cls}">${totalRows(c).map((r) => `<tr class="${r.cls || ''}"><th>${esc(r.k)}</th><td>${r.v}</td></tr>`).join('')}</table>`;
}

function words(c) {
  if (!c.show.words) return '';
  const amt = c.t.insurance ? c.t.payable : c.t.total;
  return `<div class="inv-words"><span>${esc(c.L.words)}:</span> ${esc(amountInWords(amt, c.cur))}</div>`;
}

function taxSummary(c) {
  const t = c.t;
  if (!c.show.taxSummary || !t.taxes.length || c.s.taxMode !== 'gst') return '';
  const igst = t.interState;
  const head = igst ? '<th>IGST</th>' : '<th>CGST</th><th>SGST</th>';
  const rows = t.taxes.map((x) => `<tr><td>${x.rate}%</td><td>${c.plain(x.taxable)}</td>${igst ? `<td>${c.plain(x.igst)}</td>` : `<td>${c.plain(x.cgst)}</td><td>${c.plain(x.sgst)}</td>`}<td>${c.plain(x.amount)}</td></tr>`).join('');
  const sum = `<tr class="inv-sum"><td>Total</td><td>${c.plain(t.taxable)}</td>${igst ? `<td>${c.plain(t.totalTax)}</td>` : `<td>${c.plain(t.taxes.reduce((s, x) => s + x.cgst, 0))}</td><td>${c.plain(t.taxes.reduce((s, x) => s + x.sgst, 0))}</td>`}<td>${c.plain(t.totalTax)}</td></tr>`;
  return `<table class="inv-taxsum"><thead><tr><th>GST rate</th><th>Taxable</th>${head}<th>Total tax</th></tr></thead><tbody>${rows}${sum}</tbody></table>`;
}

function payment(c) {
  const b = c.b;
  const bank = c.show.bank && (b.accountNo || b.bankName)
    ? `<div class="inv-bank"><div class="inv-h">${esc(c.L.bank)}</div>
      ${b.accountName ? `<div><b>A/c name:</b> ${esc(b.accountName)}</div>` : ''}
      ${b.bankName ? `<div><b>Bank:</b> ${esc(b.bankName)}${b.branch ? `, ${esc(b.branch)}` : ''}</div>` : ''}
      ${b.accountNo ? `<div><b>A/c no:</b> ${esc(b.accountNo)}</div>` : ''}
      ${b.ifsc ? `<div><b>IFSC:</b> ${esc(b.ifsc)}</div>` : ''}
      ${b.upiId ? `<div><b>UPI:</b> ${esc(b.upiId)}</div>` : ''}
    </div>` : '';
  const qr = c.show.qr && c.upi
    ? `<div class="inv-qr">${qrSvg(c.upi, { size: 96 })}<div>${esc(c.L.scanToPay)}<br><b>${c.money(c.payNow)}</b></div></div>` : '';
  return bank || qr ? `<div class="inv-pay">${bank}${qr}</div>` : '';
}

function notes(c) {
  const d = c.doc;
  const n = c.show.notes && d.notes ? `<div class="inv-notes"><div class="inv-h">${esc(c.L.notes)}</div><div>${nl2br(d.notes)}</div></div>` : '';
  const tm = c.show.terms && d.terms ? `<div class="inv-terms"><div class="inv-h">${esc(c.L.terms)}</div><div>${nl2br(d.terms)}</div></div>` : '';
  return n + tm;
}

function signature(c) {
  if (!c.show.signature) return '';
  return `<div class="inv-sign">
    <div class="inv-sign-for">For ${esc(c.b.name)}</div>
    ${c.b.signature ? `<img src="${esc(c.b.signature)}" alt="">` : '<div class="inv-sign-space"></div>'}
    <div class="inv-sign-label">${esc(c.L.signature)}</div>
  </div>`;
}

function footer(c) {
  if (!c.show.footer) return '';
  const txt = [c.s.footer, c.L.thanks].filter(Boolean).map(esc).join(' · ');
  return txt ? `<div class="inv-footer">${txt}</div>` : '';
}

function stamp(c) {
  if (!c.show.stamp) return '';
  const map = { paid: 'PAID', overdue: 'OVERDUE', cancelled: 'CANCELLED', draft: 'DRAFT', accepted: 'ACCEPTED', expired: 'EXPIRED' };
  const label = map[c.status];
  return label ? `<div class="inv-stamp st-${c.status}">${label}</div>` : '';
}

function bottom(c) {
  return `<div class="inv-bottom">
    <div class="inv-bottom-left">${words(c)}${taxSummary(c)}${payment(c)}${notes(c)}</div>
    <div class="inv-bottom-right">${totals(c)}${signature(c)}</div>
  </div>`;
}

/* ---------- layouts ---------- */

const LAYOUTS = {
  modern: (c) => `
    <header class="inv-head">
      <div class="inv-head-left">${logo(c)}${bizBlock(c)}</div>
      <div class="inv-head-right"><div class="inv-title">${title(c)}</div>${metaTable(c)}</div>
    </header>
    <section class="inv-parties">${party(c)}${shipTo(c)}</section>
    ${itemsTable(c)}${bottom(c)}${footer(c)}`,

  classic: (c) => `
    <header class="inv-head inv-center">${logo(c)}${bizBlock(c)}</header>
    <div class="inv-title-bar">${title(c)}</div>
    <section class="inv-parties">${party(c)}${shipTo(c)}<div class="inv-party">${metaTable(c)}</div></section>
    ${itemsTable(c)}${bottom(c)}${footer(c)}`,

  minimal: (c) => `
    <header class="inv-head">
      <div><div class="inv-title">${title(c)}</div><div class="inv-number">${esc(c.doc.number)}</div></div>
      <div class="inv-head-right">${logo(c)}</div>
    </header>
    <section class="inv-parties three">
      ${bizBlock(c)}${party(c)}<div>${metaTable(c)}</div>
    </section>
    ${shipTo(c)}${itemsTable(c)}${bottom(c)}${footer(c)}`,

  bold: (c) => `
    <header class="inv-hero">
      <div class="inv-hero-left">${logo(c)}<div class="inv-biz-name">${esc(c.b.name)}</div>${c.b.tagline ? `<div class="inv-tagline">${esc(c.b.tagline)}</div>` : ''}</div>
      <div class="inv-hero-right"><div class="inv-title">${title(c)}</div><div class="inv-number"># ${esc(c.doc.number)}</div></div>
    </header>
    <section class="inv-strip">
      <div><span>${esc(c.L.date)}</span><b>${fmtDate(c.doc.date)}</b></div>
      ${c.doc.dueDate && c.show.dueDate ? `<div><span>${esc(c.doc.type === 'quote' ? c.L.validTill : c.L.dueDate)}</span><b>${fmtDate(c.doc.dueDate)}</b></div>` : ''}
      <div class="inv-strip-total"><span>${esc(c.t.insurance ? c.L.payable : c.L.total)}</span><b>${c.money(c.t.insurance ? c.t.payable : c.t.total)}</b></div>
    </section>
    <section class="inv-parties three">${party(c)}${bizBlock(c, { name: false })}<div>${metaTable(c)}</div></section>
    ${shipTo(c)}${itemsTable(c)}${bottom(c)}${footer(c)}`,

  elegant: (c) => `
    <header class="inv-head inv-center">${logo(c)}${bizBlock(c)}</header>
    <div class="inv-rule"></div>
    <div class="inv-title">${title(c)}</div>
    <div class="inv-rule"></div>
    <section class="inv-parties">${party(c)}${shipTo(c)}<div class="inv-party">${metaTable(c)}</div></section>
    ${itemsTable(c)}${bottom(c)}${footer(c)}`,

  corporate: (c) => `
    <div class="inv-corp">
      <aside class="inv-side">
        ${logo(c)}${bizBlock(c)}
        <div class="inv-side-sec">${party(c)}</div>
        ${shipTo(c) ? `<div class="inv-side-sec">${shipTo(c)}</div>` : ''}
        <div class="inv-side-sec">${payment(c)}</div>
      </aside>
      <main class="inv-main">
        <div class="inv-title">${title(c)}</div>
        ${metaTable(c, 'inv-meta inv-meta-grid')}
        ${itemsTable(c)}
        <div class="inv-bottom"><div class="inv-bottom-left">${words(c)}${taxSummary(c)}${notes(c)}</div>
        <div class="inv-bottom-right">${totals(c)}${signature(c)}</div></div>
        ${footer(c)}
      </main>
    </div>`,

  medical: (c) => {
    const pairs = [...clientExtras(c), ...metaPairs(c)];
    const cl = c.doc.client || {};
    return `
    <header class="inv-head">
      <div class="inv-head-left">${logo(c) || '<div class="inv-cross" aria-hidden="true"></div>'}${bizBlock(c)}</div>
      <div class="inv-head-right"><div class="inv-title">${title(c)}</div><div class="inv-number">${esc(c.doc.number)}</div></div>
    </header>
    <section class="inv-patient">
      <div class="inv-patient-name"><span>${esc(c.s.clientLabel || 'Patient')}</span><b>${esc(cl.name || '—')}</b>
        <small>${[cl.phone, addressLines(cl).replace(/<br>/g, ', ')].filter(Boolean).join(' · ')}</small></div>
      <div class="inv-patient-grid">${pairs.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>
    </section>
    ${itemsTable(c)}${bottom(c)}${footer(c)}`;
  },

  gst: (c) => `
    <div class="inv-box">
      <div class="inv-box-title">${title(c)}<span>Original for recipient</span></div>
      <div class="inv-box-row">
        <div class="inv-box-cell inv-box-biz">${logo(c)}${bizBlock(c)}</div>
        <div class="inv-box-cell">${metaTable(c)}</div>
      </div>
      <div class="inv-box-row">
        <div class="inv-box-cell">${party(c)}</div>
        <div class="inv-box-cell">${shipTo(c) || party(c, { heading: c.L.shipTo })}</div>
      </div>
      ${itemsTable(c)}
      <div class="inv-box-row">
        <div class="inv-box-cell">${words(c)}${taxSummary(c)}</div>
        <div class="inv-box-cell inv-box-tot">${totals(c)}</div>
      </div>
      <div class="inv-box-row">
        <div class="inv-box-cell">${payment(c)}${notes(c)}</div>
        <div class="inv-box-cell">${signature(c)}</div>
      </div>
    </div>${footer(c)}`,

  compact: (c) => `
    <header class="inv-head">
      <div class="inv-head-left">${logo(c)}${bizBlock(c)}</div>
      <div class="inv-head-right"><div class="inv-title">${title(c)}</div></div>
    </header>
    <section class="inv-parties">${party(c)}${shipTo(c)}<div class="inv-party">${metaTable(c, 'inv-meta inv-meta-grid')}</div></section>
    ${itemsTable(c)}${bottom(c)}${footer(c)}`,

  thermal: (c) => {
    const d = c.doc;
    const items = (d.items || []).filter((i) => i.name || Number(i.rate));
    const pairs = metaPairs(c);
    const cl = d.client;
    return `
    <div class="inv-th-head">${logo(c)}<div class="inv-biz-name">${esc(c.b.name)}</div>
      <div>${addressLines(c.b)}</div>${c.b.phone ? `<div>${esc(c.b.phone)}</div>` : ''}${c.b.gstin ? `<div>GSTIN: ${esc(c.b.gstin)}</div>` : ''}</div>
    <div class="inv-th-title">${title(c)}</div>
    <div class="inv-th-meta">${pairs.map(([k, v]) => `<div><span>${k}</span><span>${v}</span></div>`).join('')}
      ${cl && cl.name ? `<div><span>${esc(c.s.clientLabel)}</span><span>${esc(cl.name)}</span></div>` : ''}</div>
    <div class="inv-th-items">
      <div class="inv-th-row inv-th-hd"><span>${esc(c.L.item)}</span><span>${esc(c.L.amount)}</span></div>
      ${items.map((it) => `<div class="inv-th-item"><div>${esc(it.name)}</div><div class="inv-th-row"><span>${+it.qty || 0} × ${c.plain(it.rate)}${Number(it.discount) ? ` (−${it.discount}%)` : ''}</span><span>${c.plain(lineValues(it).net)}</span></div></div>`).join('')}
    </div>
    <div class="inv-th-tot">${totalRows(c).map((r) => `<div class="inv-th-row ${r.cls || ''}"><span>${esc(r.k)}</span><span>${r.v}</span></div>`).join('')}</div>
    ${c.show.qr && c.upi ? `<div class="inv-th-qr">${qrSvg(c.upi, { size: 120 })}<div>${esc(c.L.scanToPay)}</div></div>` : ''}
    ${footer(c) || `<div class="inv-footer">${esc(c.L.thanks)}</div>`}`;
  },
};

/** Render a document as HTML using its template (or the default). */
export function renderInvoice(doc, settings) {
  const c = buildContext(doc, settings);
  const tpl = LAYOUTS[c.design.template] ? c.design.template : 'modern';
  const paper = PAPERS[c.design.paper] || PAPERS.A4;
  const font = (FONTS[c.design.font] || FONTS.inter).css;
  const style = `--accent:${esc(c.design.accent)};--font:${esc(font)};--paper-w:${paper.w}mm;${paper.h ? `--paper-h:${paper.h}mm;` : ''}`;
  const cls = ['inv', `inv-${tpl}`, `align-${c.design.align || 'left'}`, `dens-${c.design.density || 'normal'}`, paper.h ? '' : 'inv-roll'].join(' ');
  return {
    html: `<div class="${cls}" style="${style}" data-paper="${esc(c.design.paper)}">${stamp(c)}${LAYOUTS[tpl](c)}</div>`,
    ctx: c,
    paper,
  };
}
