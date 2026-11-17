// Pure billing maths: line amounts, discounts, GST split (CGST/SGST vs IGST),
// round-off, insurance share, payments, status and amount in words.
// No DOM access here so it runs in Node tests too.

export const STATES = [
  ['01', 'Jammu and Kashmir'], ['02', 'Himachal Pradesh'], ['03', 'Punjab'], ['04', 'Chandigarh'],
  ['05', 'Uttarakhand'], ['06', 'Haryana'], ['07', 'Delhi'], ['08', 'Rajasthan'], ['09', 'Uttar Pradesh'],
  ['10', 'Bihar'], ['11', 'Sikkim'], ['12', 'Arunachal Pradesh'], ['13', 'Nagaland'], ['14', 'Manipur'],
  ['15', 'Mizoram'], ['16', 'Tripura'], ['17', 'Meghalaya'], ['18', 'Assam'], ['19', 'West Bengal'],
  ['20', 'Jharkhand'], ['21', 'Odisha'], ['22', 'Chhattisgarh'], ['23', 'Madhya Pradesh'], ['24', 'Gujarat'],
  ['26', 'Dadra and Nagar Haveli and Daman and Diu'], ['27', 'Maharashtra'], ['29', 'Karnataka'], ['30', 'Goa'],
  ['31', 'Lakshadweep'], ['32', 'Kerala'], ['33', 'Tamil Nadu'], ['34', 'Puducherry'],
  ['35', 'Andaman and Nicobar Islands'], ['36', 'Telangana'], ['37', 'Andhra Pradesh'], ['38', 'Ladakh'],
  ['97', 'Other Territory'], ['96', 'Outside India (export)'],
];

export const stateName = (code) => (STATES.find(([c]) => c === code) || [, ''])[1];

const num = (v) => {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

/** Round to 2 decimals without binary drift (1.005 -> 1.01). */
export const r2 = (n) => Math.round((num(n) + Number.EPSILON) * 100) / 100;

/** Gross and taxable value of one line before any document discount. */
export function lineValues(item) {
  const gross = num(item.qty) * num(item.rate);
  const discount = gross * Math.min(Math.max(num(item.discount), 0), 100) / 100;
  return { gross: r2(gross), discount: r2(discount), net: r2(gross - discount) };
}

/**
 * Totals for a document.
 * opts.sellerState: seller's 2-digit GST state code.
 * opts.taxMode: 'gst' (CGST+SGST / IGST), 'simple' (one "Tax" line per rate) or 'none'.
 * opts.roundOff: round the grand total to the nearest whole unit.
 * opts.taxInclusive: line rates already include tax.
 */
export function computeTotals(doc, opts = {}) {
  const taxMode = opts.taxMode || 'gst';
  const items = (doc.items || []).filter((i) => i && (i.name || num(i.rate) || num(i.qty)));
  const lines = items.map((it) => ({ ...lineValues(it), tax: taxMode === 'none' ? 0 : num(it.tax) }));

  const gross = r2(lines.reduce((s, l) => s + l.gross, 0));
  const lineDiscount = r2(lines.reduce((s, l) => s + l.discount, 0));
  const afterLine = r2(gross - lineDiscount);

  // Document-level discount, shared out across lines in proportion to their value.
  const d = doc.discount || {};
  let docDiscount = d.type === 'flat' ? num(d.value) : afterLine * Math.min(Math.max(num(d.value), 0), 100) / 100;
  docDiscount = r2(Math.min(Math.max(docDiscount, 0), afterLine));
  const share = afterLine > 0 ? docDiscount / afterLine : 0;

  const inclusive = !!opts.taxInclusive;
  const groups = new Map();
  let taxable = 0;
  for (const l of lines) {
    const value = l.net * (1 - share);
    const base = inclusive && l.tax ? value / (1 + l.tax / 100) : value;
    taxable += base;
    if (!l.tax) continue;
    const g = groups.get(l.tax) || { rate: l.tax, taxable: 0 };
    g.taxable += base;
    groups.set(l.tax, g);
  }
  taxable = r2(taxable);

  const interState = !!(opts.sellerState && doc.placeOfSupply && opts.sellerState !== doc.placeOfSupply);
  const taxes = [...groups.values()].sort((a, b) => a.rate - b.rate).map((g) => {
    const amount = r2(g.taxable * g.rate / 100);
    const row = { rate: g.rate, taxable: r2(g.taxable), amount };
    if (taxMode === 'gst') {
      if (interState) Object.assign(row, { igst: amount, cgst: 0, sgst: 0 });
      else {
        const half = r2(amount / 2);
        Object.assign(row, { cgst: half, sgst: r2(amount - half), igst: 0 });
      }
    }
    return row;
  });
  const totalTax = r2(taxes.reduce((s, t) => s + t.amount, 0));

  const shipping = r2(num(doc.shipping));
  const adjustment = r2(num(doc.adjustment));
  const beforeRound = r2(taxable + totalTax + shipping + adjustment);
  const total = opts.roundOff ? Math.round(beforeRound) : beforeRound;
  const roundOff = r2(total - beforeRound);

  // Hospital / insurance style: part of the bill is covered by an insurer or TPA.
  const insurance = r2(Math.min(Math.max(num(doc.insurance), 0), Math.max(total, 0)));
  const payable = r2(total - insurance);

  const paid = r2(num(doc.advance) + (doc.payments || []).reduce((s, p) => s + num(p.amount), 0));
  const balance = r2(payable - paid);

  return {
    lines, gross, lineDiscount, docDiscount, discountTotal: r2(lineDiscount + docDiscount),
    taxable, taxes, totalTax, interState, shipping, adjustment, roundOff, total,
    insurance, payable, paid, balance,
  };
}

/** Status shown to people: stored status refined by payments and the due date. */
export function docStatus(doc, totals, today = new Date().toISOString().slice(0, 10)) {
  const s = doc.status || 'draft';
  if (s === 'cancelled') return 'cancelled';
  if (doc.type === 'quote' || doc.type === 'proforma') {
    if (doc.convertedTo) return 'converted';
    if (['accepted', 'declined'].includes(s)) return s;
    if (s === 'sent' && doc.dueDate && doc.dueDate < today) return 'expired';
    return s === 'sent' ? 'awaiting' : s;
  }
  if (doc.type === 'credit' || doc.type === 'receipt') return s === 'draft' ? 'draft' : 'issued';
  if (totals.payable > 0 && totals.balance <= 0.004) return 'paid';
  if (s === 'draft') return 'draft';
  if (totals.paid > 0) return doc.dueDate && doc.dueDate < today ? 'overdue' : 'partial';
  if (doc.dueDate && doc.dueDate < today) return 'overdue';
  return 'sent';
}

/** Days past due (0 when not due yet). */
export function daysOverdue(doc, today = new Date().toISOString().slice(0, 10)) {
  if (!doc.dueDate || doc.dueDate >= today) return 0;
  return Math.round((Date.parse(today) - Date.parse(doc.dueDate)) / 86400000);
}

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven',
  'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function below100(n) {
  return n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ''}`;
}
function below1000(n) {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  return [h ? `${ONES[h]} Hundred` : '', rest ? below100(rest) : ''].filter(Boolean).join(' ');
}

/** Whole number in words, Indian (lakh/crore) or international (million/billion) grouping. */
export function intToWords(n, system = 'indian') {
  n = Math.floor(Math.abs(n));
  if (n === 0) return 'Zero';
  const parts = [];
  if (system === 'indian') {
    const crore = Math.floor(n / 1e7);
    n %= 1e7;
    if (crore) parts.push(`${intToWords(crore, 'indian')} Crore`);
    const lakh = Math.floor(n / 1e5);
    n %= 1e5;
    if (lakh) parts.push(`${below100(lakh)} Lakh`);
    const thousand = Math.floor(n / 1000);
    n %= 1000;
    if (thousand) parts.push(`${below100(thousand)} Thousand`);
    if (n) parts.push(below1000(n));
  } else {
    const scales = [[1e9, 'Billion'], [1e6, 'Million'], [1e3, 'Thousand']];
    for (const [v, name] of scales) {
      const q = Math.floor(n / v);
      n %= v;
      if (q) parts.push(`${below1000(q)} ${name}`);
    }
    if (n) parts.push(below1000(n));
  }
  return parts.join(' ');
}

export const CURRENCIES = {
  INR: { symbol: '₹', major: 'Rupees', minor: 'Paise', locale: 'en-IN', words: 'indian' },
  USD: { symbol: '$', major: 'Dollars', minor: 'Cents', locale: 'en-US', words: 'intl' },
  EUR: { symbol: '€', major: 'Euros', minor: 'Cents', locale: 'en-IE', words: 'intl' },
  GBP: { symbol: '£', major: 'Pounds', minor: 'Pence', locale: 'en-GB', words: 'intl' },
  AED: { symbol: 'AED', major: 'Dirhams', minor: 'Fils', locale: 'en-AE', words: 'intl' },
  SAR: { symbol: 'SAR', major: 'Riyals', minor: 'Halalas', locale: 'en-SA', words: 'intl' },
  QAR: { symbol: 'QAR', major: 'Riyals', minor: 'Dirhams', locale: 'en-QA', words: 'intl' },
  OMR: { symbol: 'OMR', major: 'Rials', minor: 'Baisa', locale: 'en-OM', words: 'intl' },
  SGD: { symbol: 'S$', major: 'Dollars', minor: 'Cents', locale: 'en-SG', words: 'intl' },
  AUD: { symbol: 'A$', major: 'Dollars', minor: 'Cents', locale: 'en-AU', words: 'intl' },
  CAD: { symbol: 'C$', major: 'Dollars', minor: 'Cents', locale: 'en-CA', words: 'intl' },
  LKR: { symbol: 'Rs', major: 'Rupees', minor: 'Cents', locale: 'en-LK', words: 'intl' },
};

export function amountInWords(amount, currency = 'INR') {
  const c = CURRENCIES[currency] || CURRENCIES.INR;
  const neg = amount < 0;
  const v = Math.abs(r2(amount));
  const whole = Math.floor(v);
  const minor = Math.round((v - whole) * 100);
  let s = `${c.major} ${intToWords(whole, c.words)}`;
  if (minor) s += ` and ${intToWords(minor, c.words)} ${c.minor}`;
  return `${neg ? 'Minus ' : ''}${s} Only`;
}

export function formatMoney(amount, currency = 'INR', withSymbol = true) {
  const c = CURRENCIES[currency] || CURRENCIES.INR;
  const s = num(amount).toLocaleString(c.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (!withSymbol) return s;
  const sym = c.symbol;
  const neg = s.startsWith('-');
  const body = neg ? s.slice(1) : s;
  return `${neg ? '-' : ''}${sym}${sym.length > 1 ? ' ' : ''}${body}`;
}

/** Document number from a numbering rule: prefix + zero-padded sequence + suffix. */
export function formatNumber(rule, seq) {
  const year = new Date().getFullYear();
  const fy = new Date().getMonth() >= 3 ? `${year}-${String(year + 1).slice(2)}` : `${year - 1}-${String(year).slice(2)}`;
  const fill = (s) => String(s || '').replaceAll('{YYYY}', String(year)).replaceAll('{FY}', fy);
  return `${fill(rule.prefix)}${String(seq).padStart(rule.pad || 1, '0')}${fill(rule.suffix)}`;
}

/** UPI deep link (works with GPay, PhonePe, Paytm, BHIM). */
export function upiLink({ upiId, payee, amount, note }) {
  if (!upiId) return '';
  const p = new URLSearchParams({ pa: upiId, pn: payee || '', cu: 'INR' });
  if (amount > 0) p.set('am', r2(amount).toFixed(2));
  if (note) p.set('tn', note.slice(0, 80));
  return `upi://pay?${p.toString().replaceAll('+', '%20')}`;
}

export function addDays(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + num(days));
  return d.toISOString().slice(0, 10);
}
