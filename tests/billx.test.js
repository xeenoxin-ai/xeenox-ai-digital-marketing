import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeTotals, amountInWords, intToWords, formatMoney, formatNumber, docStatus, upiLink, lineValues, addDays,
} from '../billx/src/calc.js';
import { renderInvoice, TEMPLATES } from '../billx/src/templates.js';
import { encodePortal, decodePortal, portalPayload } from '../billx/src/portal-codec.js';
import { INDUSTRIES } from '../billx/src/industries.js';
import { DEFAULT_SHOW } from '../billx/src/store.js';

const item = (rate, qty = 1, tax = 18, discount = 0) => ({ name: 'x', rate, qty, tax, discount });

test('line values apply line discount', () => {
  assert.deepEqual(lineValues(item(100, 3, 18, 10)), { gross: 300, discount: 30, net: 270 });
});

test('intra-state GST splits into CGST and SGST', () => {
  const t = computeTotals({ items: [item(1000), item(500, 2, 5)], placeOfSupply: '32' }, { sellerState: '32' });
  assert.equal(t.taxable, 2000);
  assert.equal(t.interState, false);
  const g18 = t.taxes.find((x) => x.rate === 18);
  assert.equal(g18.cgst, 90);
  assert.equal(g18.sgst, 90);
  const g5 = t.taxes.find((x) => x.rate === 5);
  assert.equal(g5.cgst + g5.sgst, 50);
  assert.equal(t.totalTax, 230);
  assert.equal(t.total, 2230);
});

test('inter-state GST becomes IGST', () => {
  const t = computeTotals({ items: [item(1000)], placeOfSupply: '33' }, { sellerState: '32' });
  assert.equal(t.interState, true);
  assert.equal(t.taxes[0].igst, 180);
  assert.equal(t.taxes[0].cgst, 0);
});

test('document discount is shared across lines before tax', () => {
  const t = computeTotals({ items: [item(1000, 1, 18), item(1000, 1, 0)], discount: { type: '%', value: 10 } }, {});
  assert.equal(t.docDiscount, 200);
  assert.equal(t.taxable, 1800);
  assert.equal(t.totalTax, 162); // 900 * 18%
  const flat = computeTotals({ items: [item(1000, 1, 0)], discount: { type: 'flat', value: 5000 } }, {});
  assert.equal(flat.docDiscount, 1000, 'flat discount capped at the bill value');
});

test('round off, shipping, adjustment, insurance and payments', () => {
  const t = computeTotals({
    items: [item(99.5, 1, 0)], shipping: 10, adjustment: -0.2, insurance: 50, advance: 20,
    payments: [{ amount: 10 }],
  }, { roundOff: true });
  assert.equal(t.total, 109);
  assert.equal(t.roundOff, -0.3);
  assert.equal(t.payable, 59);
  assert.equal(t.paid, 30);
  assert.equal(t.balance, 29);
});

test('tax-inclusive rates back out the tax', () => {
  const t = computeTotals({ items: [item(118)] }, { taxInclusive: true });
  assert.equal(t.taxable, 100);
  assert.equal(t.totalTax, 18);
  assert.equal(t.total, 118);
});

test('no-tax mode ignores line tax', () => {
  const t = computeTotals({ items: [item(100, 1, 18)] }, { taxMode: 'none' });
  assert.equal(t.totalTax, 0);
  assert.equal(t.total, 100);
});

test('status follows payments and due date', () => {
  const doc = { type: 'invoice', status: 'sent', dueDate: '2026-01-10', items: [item(100, 1, 0)] };
  const t = (d) => computeTotals(d, {});
  assert.equal(docStatus(doc, t(doc), '2026-01-05'), 'sent');
  assert.equal(docStatus(doc, t(doc), '2026-01-11'), 'overdue');
  const part = { ...doc, payments: [{ amount: 40 }] };
  assert.equal(docStatus(part, t(part), '2026-01-05'), 'partial');
  const full = { ...doc, payments: [{ amount: 100 }] };
  assert.equal(docStatus(full, t(full), '2026-02-01'), 'paid');
  assert.equal(docStatus({ ...doc, status: 'cancelled' }, t(doc)), 'cancelled');
  assert.equal(docStatus({ ...doc, type: 'quote', dueDate: '2026-01-10' }, t(doc), '2026-02-01'), 'expired');
});

test('amount in words, Indian and international', () => {
  assert.equal(intToWords(0), 'Zero');
  assert.equal(intToWords(115), 'One Hundred Fifteen');
  assert.equal(intToWords(1234567), 'Twelve Lakh Thirty Four Thousand Five Hundred Sixty Seven');
  assert.equal(intToWords(10000000), 'One Crore');
  assert.equal(intToWords(1234567, 'intl'), 'One Million Two Hundred Thirty Four Thousand Five Hundred Sixty Seven');
  assert.equal(amountInWords(2230.5), 'Rupees Two Thousand Two Hundred Thirty and Fifty Paise Only');
  assert.equal(amountInWords(12, 'USD'), 'Dollars Twelve Only');
});

test('money and numbering format', () => {
  assert.equal(formatMoney(1234567.5), '₹12,34,567.50');
  assert.equal(formatMoney(-5, 'USD'), '-$5.00');
  assert.equal(formatNumber({ prefix: 'INV-', pad: 4, suffix: '' }, 7), 'INV-0007');
  assert.match(formatNumber({ prefix: 'INV/{FY}/', pad: 3 }, 12), /^INV\/\d{4}-\d{2}\/012$/);
  assert.equal(addDays('2026-01-30', 5), '2026-02-04');
});

test('UPI link carries payee, amount and note', () => {
  const u = upiLink({ upiId: 'shop@upi', payee: 'My Shop', amount: 1500, note: 'INV-0001' });
  assert.ok(u.startsWith('upi://pay?pa=shop%40upi'));
  assert.ok(u.includes('am=1500.00'));
  assert.ok(u.includes('pn=My%20Shop'));
  assert.equal(upiLink({ upiId: '' }), '');
});

function settingsFor(industry) {
  const p = INDUSTRIES[industry];
  return {
    industry, clientLabel: p.clientLabel, currency: 'INR', taxMode: 'gst', roundOff: true, taxInclusive: false,
    business: { name: 'Acme & <Co>', state: '32', upiId: 'acme@upi', gstin: '32ABCDE1234F1Z5', accountNo: '123' },
    docTitles: { invoice: p.docTitle }, footer: '',
    design: { template: p.template, accent: p.accent, font: 'inter', paper: 'A4', show: { ...DEFAULT_SHOW }, labels: {}, groupByCategory: !!p.groupByCategory },
  };
}

const sampleDoc = {
  type: 'invoice', number: 'INV-0001', status: 'sent', date: '2026-11-01', dueDate: '2026-11-15', placeOfSupply: '32',
  client: { name: 'Anil <script>', extra: { uhid: 'UH-1', age: '54' } },
  items: [{ name: 'Room charges', category: 'Room & Nursing', qty: 2, rate: 1500, tax: 0 }, { name: 'CBC', category: 'Laboratory', qty: 1, rate: 350, tax: 18 }],
  fields: { ipNo: 'IP-77', doctor: 'Dr. Rao' }, insurance: 1000, payments: [],
};

test('every template renders, escapes input and shows totals', () => {
  for (const t of TEMPLATES) {
    const { html } = renderInvoice({ ...sampleDoc, template: t.id }, settingsFor('hospital'));
    assert.ok(html.includes(`inv-${t.id}`), t.id);
    assert.ok(!html.includes('<script>'), `${t.id} escapes HTML`);
    assert.ok(html.includes('Anil &lt;script&gt;'), t.id);
    assert.ok(html.includes('INV-0001'), t.id);
    assert.ok(html.includes('<svg'), `${t.id} has UPI QR`);
  }
});

test('hospital bill shows patient fields, groups and insurance share', () => {
  const { html, ctx } = renderInvoice({ ...sampleDoc, template: 'medical' }, settingsFor('hospital'));
  assert.ok(html.includes('UH-1'));
  assert.ok(html.includes('IP-77'));
  assert.ok(html.includes('Laboratory total'));
  assert.ok(html.includes('Covered by Insurance'));
  assert.equal(ctx.t.total, 3413);
  assert.equal(ctx.t.payable, 2413);
});

test('portal link round-trips the client documents', async () => {
  const s = settingsFor('services');
  s.business.signature = 'data:image/png;base64,SECRET';
  const docs = [sampleDoc, { ...sampleDoc, number: 'D-1', status: 'draft' }];
  const token = await encodePortal(portalPayload(s, { name: 'Anil' }, docs));
  const back = await decodePortal(token);
  assert.equal(back.c.name, 'Anil');
  assert.equal(back.d.length, 1, 'drafts are not shared');
  assert.equal(back.d[0].number, 'INV-0001');
  assert.equal(back.s.business.signature, undefined, 'signature never leaves the device');
});

import { GROUPS, sectorOf, starterItems, sampleValue } from '../billx/src/industries.js';

test('every sector is complete and renders with its own design', () => {
  const ids = new Set(TEMPLATES.map((t) => t.id));
  const keys = Object.keys(INDUSTRIES);
  assert.ok(keys.length >= 40, `expected 40+ sectors, got ${keys.length}`);
  for (const k of keys) {
    const p = INDUSTRIES[k];
    assert.ok(GROUPS.includes(p.group), `${k} group`);
    assert.ok(ids.has(p.template), `${k} template`);
    assert.ok(p.clientLabel && p.docTitle && Array.isArray(p.fields), k);
    const s = settingsFor(k);
    const sec = sectorOf(s);
    const doc = {
      ...sampleDoc, client: { name: 'Test', extra: Object.fromEntries(sec.clientFields.map((f) => [f.key, sampleValue(f) || 'X'])) },
      fields: Object.fromEntries(sec.fields.map((f) => [f.key, sampleValue(f, 0, '2026-11-01') || 'V'])),
      items: starterItems(k).map((it) => ({ ...it, qty: 1, rate: it.rate || 100 })),
    };
    const { html } = renderInvoice(doc, s);
    assert.ok(html.includes(p.docTitle.replace('&', '&amp;')), `${k} title`);
    for (const f of sec.fields) assert.ok(html.includes(f.label.replace('&', '&amp;')) || f.type === 'date', `${k} shows ${f.label}`);
  }
});

test('a business can replace its sector fields', () => {
  const s = settingsFor('retail');
  s.sector = { fields: [{ key: 'tbl', label: 'Locker No.' }], clientFields: [{ key: 'cid', label: 'Card ID' }], itemCols: [{ key: 'sz', label: 'Size' }], insurance: true };
  const sec = sectorOf(s);
  assert.equal(sec.fields[0].label, 'Locker No.');
  assert.equal(sec.insurance, true);
  const { html } = renderInvoice({
    ...sampleDoc, template: 'modern', fields: { tbl: 'L-7' }, client: { name: 'A', extra: { cid: 'C-9' } },
    items: [{ name: 'Shoe', qty: 1, rate: 100, tax: 0, sz: '42' }],
  }, s);
  for (const v of ['Locker No.', 'L-7', 'Card ID', 'C-9', '>Size<', '>42<']) assert.ok(html.includes(v), v);
  assert.equal(sectorOf({ industry: 'retail' }).fields[0].label, 'Salesperson', 'presets stay untouched');
});
