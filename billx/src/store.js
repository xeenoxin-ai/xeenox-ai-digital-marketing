// Local-first data store: everything lives in this browser (localStorage),
// with JSON backup/restore. No account or server needed.

import { formatNumber, addDays } from './calc.js';
import { industry, starterItems, sectorOf, sampleValue } from './industries.js';

// Where data lives in this browser. Signed-in cloud accounts get their own
// namespace so two accounts on one computer never mix.
const LOCAL_NS = { index: 'billx-workspaces', key: (id) => (id === 'main' ? 'billx-v1' : `billx-v1:${id}`) };
let NS = LOCAL_NS;
export function useNamespace(prefix) {
  NS = prefix ? { index: `${prefix}:index`, key: (id) => `${prefix}:ws:${id}` } : LOCAL_NS;
  state = null;
}

/**
 * Cloud sync plugs in here. Local-only use leaves these empty.
 * canWrite() returning false makes the app read-only (trial ended / unpaid).
 */
export const hooks = {
  upsert: null, remove: null, replaced: null, workspaceCreated: null, workspaceRemoved: null,
  canWrite: () => true,
};
const blocked = () => {
  if (hooks.canWrite()) return false;
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('billx:readonly'));
  return true;
};

export const DOC_TYPES = {
  invoice: { name: 'Invoice', plural: 'Invoices', title: 'Tax Invoice', prefix: 'INV-' },
  quote: { name: 'Quotation', plural: 'Quotations', title: 'Quotation', prefix: 'QT-' },
  proforma: { name: 'Proforma', plural: 'Proformas', title: 'Proforma Invoice', prefix: 'PF-' },
  receipt: { name: 'Receipt', plural: 'Receipts', title: 'Payment Receipt', prefix: 'RCT-' },
  credit: { name: 'Credit note', plural: 'Credit notes', title: 'Credit Note', prefix: 'CN-' },
};

export const DEFAULT_LABELS = {
  billTo: 'Bill To',
  shipTo: 'Ship To',
  number: 'No.',
  date: 'Date',
  dueDate: 'Due Date',
  validTill: 'Valid Till',
  placeOfSupply: 'Place of Supply',
  item: 'Item & Description',
  hsn: 'HSN/SAC',
  qty: 'Qty',
  unit: 'Unit',
  rate: 'Rate',
  discount: 'Disc %',
  tax: 'GST %',
  amount: 'Amount',
  subtotal: 'Sub Total',
  discountTotal: 'Discount',
  taxable: 'Taxable Value',
  shipping: 'Shipping / Other charges',
  adjustment: 'Adjustment',
  roundOff: 'Round Off',
  total: 'Total',
  insurance: 'Covered by Insurance / TPA',
  payable: 'Net Payable',
  paid: 'Amount Paid',
  balance: 'Balance Due',
  words: 'Amount in words',
  notes: 'Notes',
  terms: 'Terms & Conditions',
  bank: 'Bank Details',
  scanToPay: 'Scan to pay (UPI)',
  signature: 'Authorised Signatory',
  thanks: 'Thank you for your business!',
};

export const DEFAULT_SHOW = {
  logo: true, signature: true, qr: true, bank: true, hsn: true, unit: true, discountCol: true,
  taxCol: true, words: true, taxSummary: true, shipTo: false, notes: true, terms: true, footer: true,
  stamp: true, business: true, contact: true, placeOfSupply: true, dueDate: true,
};

function defaultSettings(ind = 'general') {
  const p = industry(ind);
  return {
    onboarded: false,
    industry: ind,
    business: {
      name: 'Your Business Name', tagline: '', address: '', city: '', state: '32', pincode: '',
      phone: '', email: '', website: '', gstin: '', pan: '', regNo: '',
      logo: '', signature: '',
      bankName: '', accountName: '', accountNo: '', ifsc: '', branch: '', upiId: '',
    },
    currency: 'INR',
    taxMode: 'gst',
    taxInclusive: false,
    roundOff: true,
    defaultTax: p.tax,
    dueDays: 15,
    clientLabel: p.clientLabel,
    numbering: Object.fromEntries(Object.entries(DOC_TYPES).map(([k, t]) => [k, { prefix: t.prefix, suffix: '', pad: 4, next: 1 }])),
    docTitles: { ...Object.fromEntries(Object.entries(DOC_TYPES).map(([k, t]) => [k, t.title])), invoice: p.docTitle },
    notes: 'Thank you for your business.',
    terms: '1. Payment due by the due date.\n2. Goods once sold will not be taken back.\n3. Subject to local jurisdiction.',
    footer: '',
    sector: null,
    design: {
      template: p.template,
      accent: p.accent,
      font: 'inter',
      paper: p.template === 'thermal' ? '80mm' : 'A4',
      align: 'left',
      density: 'normal',
      groupByCategory: !!p.groupByCategory,
      show: industryShow(ind),
      labels: industryLabels(ind),
      customFields: [],
    },
  };
}

function industryLabels(ind) {
  const p = industry(ind);
  return { billTo: p.clientLabel === 'Client' ? 'Bill To' : `${p.clientLabel} Details`, ...(p.labels || {}) };
}

function industryShow(ind) {
  const show = { ...DEFAULT_SHOW };
  for (const k of industry(ind).hide || []) show[k] = false;
  return show;
}

let state = null;
const listeners = new Set();

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export const today = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

function blank() {
  return { settings: defaultSettings(), clients: [], items: [], docs: [] };
}

function migrate(s) {
  const base = blank();
  const out = { ...base, ...s };
  out.settings = { ...base.settings, ...s.settings };
  out.settings.business = { ...base.settings.business, ...(s.settings || {}).business };
  const d = (s.settings || {}).design || {};
  out.settings.design = { ...base.settings.design, ...d, show: { ...DEFAULT_SHOW, ...d.show }, labels: { ...d.labels } };
  out.settings.numbering = { ...base.settings.numbering, ...(s.settings || {}).numbering };
  out.settings.docTitles = { ...base.settings.docTitles, ...(s.settings || {}).docTitles };
  return out;
}

/* ---- several businesses in one app: each is a workspace with its own data ---- */

function readIndex() {
  try {
    const ix = JSON.parse(localStorage.getItem(NS.index));
    if (ix && Array.isArray(ix.list) && ix.list.length) return ix;
  } catch { /* fall through */ }
  return { active: 'main', list: [{ id: 'main', name: '' }] };
}
function writeIndex(ix) {
  try { localStorage.setItem(NS.index, JSON.stringify(ix)); } catch { /* storage unavailable */ }
}

export function workspaces() {
  const ix = readIndex();
  return ix.list.map((w) => ({ ...w, active: w.id === ix.active }));
}
export const activeWorkspace = () => readIndex().active;

/** Short summary of a stored workspace (name and sector) without loading it. */
export function workspaceInfo(id) {
  if (state && id === activeWorkspace()) return { name: state.settings.business.name, industry: state.settings.industry, onboarded: state.settings.onboarded };
  try {
    const d = JSON.parse(localStorage.getItem(NS.key(id)));
    return { name: d.settings.business.name, industry: d.settings.industry, onboarded: d.settings.onboarded };
  } catch {
    return { name: 'New business', industry: '', onboarded: false };
  }
}

export function switchWorkspace(id) {
  flush();
  const ix = readIndex();
  if (!ix.list.some((w) => w.id === id)) return;
  ix.active = id;
  writeIndex(ix);
  load();
}

export function createWorkspace() {
  if (blocked()) return null;
  flush();
  const ix = readIndex();
  const id = uid();
  ix.list.push({ id, name: 'New business' });
  ix.active = id;
  writeIndex(ix);
  load();
  if (hooks.workspaceCreated) hooks.workspaceCreated(id);
  return id;
}

export function removeWorkspace(id) {
  const ix = readIndex();
  if (ix.list.length < 2) return false;
  ix.list = ix.list.filter((w) => w.id !== id);
  try { localStorage.removeItem(NS.key(id)); } catch { /* ignore */ }
  if (ix.active === id) ix.active = ix.list[0].id;
  writeIndex(ix);
  load();
  if (hooks.workspaceRemoved) hooks.workspaceRemoved(id);
  return true;
}

export function load() {
  try {
    const raw = localStorage.getItem(NS.key(activeWorkspace()));
    state = raw ? migrate(JSON.parse(raw)) : blank();
  } catch {
    state = blank();
  }
  return state;
}

let saveTimer = null;
export function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 150);
  listeners.forEach((fn) => fn(state));
}
export function flush() {
  clearTimeout(saveTimer);
  try {
    const ix = readIndex();
    localStorage.setItem(NS.key(ix.active), JSON.stringify(state));
    const w = ix.list.find((x) => x.id === ix.active);
    if (w && w.name !== state.settings.business.name) { w.name = state.settings.business.name; writeIndex(ix); }
    return true;
  } catch (e) {
    console.warn('Could not save', e);
    window.dispatchEvent(new CustomEvent('billing:save-failed'));
    return false;
  }
}
export const onChange = (fn) => (listeners.add(fn), () => listeners.delete(fn));

export const db = () => state || load();
export const settings = () => db().settings;

export function updateSettings(patch) {
  Object.assign(db().settings, patch);
  persist();
}

export const all = (col) => db()[col];
export const get = (col, id) => db()[col].find((x) => x.id === id);

export function upsert(col, obj) {
  if (blocked()) return obj;
  const list = db()[col];
  const now = new Date().toISOString();
  if (!obj.id) {
    obj.id = uid();
    obj.createdAt = now;
    list.unshift(obj);
  } else {
    const i = list.findIndex((x) => x.id === obj.id);
    if (i === -1) list.unshift(obj);
    else list[i] = obj;
  }
  obj.updatedAt = now;
  persist();
  if (hooks.upsert) hooks.upsert(col, obj);
  return obj;
}

export function remove(col, id) {
  if (blocked()) return;
  const list = db()[col];
  const i = list.findIndex((x) => x.id === id);
  if (i >= 0) list.splice(i, 1);
  persist();
  if (hooks.remove) hooks.remove(col, id);
}

/* ---- applying changes that came from the cloud (no echo back) ---- */
const remoteListeners = new Set();
export const onRemote = (fn) => (remoteListeners.add(fn), () => remoteListeners.delete(fn));
const remoteChanged = () => { flush(); remoteListeners.forEach((fn) => fn()); };

/** Apply a record from the cloud. Returns true if anything changed. */
export function applyRemote(col, obj, { silent = false } = {}) {
  const list = db()[col];
  const i = list.findIndex((x) => x.id === obj.id);
  if (i === -1) list.unshift(obj);
  else if (JSON.stringify(list[i]) === JSON.stringify(obj)) return false;
  else if ((list[i].updatedAt || '') <= (obj.updatedAt || '')) list[i] = obj;
  else return false;
  if (!silent) remoteChanged();
  return true;
}
export function applyRemoteRemove(col, id, { silent = false } = {}) {
  const list = db()[col];
  const i = list.findIndex((x) => x.id === id);
  if (i === -1) return false;
  list.splice(i, 1);
  if (!silent) remoteChanged();
  return true;
}
export const notifyRemote = () => remoteChanged();
export function applyRemoteSettings(s) {
  const next = migrate({ settings: s }).settings;
  if (JSON.stringify(next) === JSON.stringify(db().settings)) return false;
  db().settings = next;
  remoteChanged();
  return true;
}
/** Replace the cached list of workspaces (from the cloud). */
export function setWorkspaceList(list, preferActive) {
  const ix = readIndex();
  const active = list.some((w) => w.id === preferActive) ? preferActive
    : list.some((w) => w.id === ix.active) ? ix.active : (list[0] || {}).id;
  writeIndex({ active: active || 'main', list: list.length ? list : [{ id: 'main', name: '' }] });
}
/** Store one workspace's full data in the local cache. */
export function cacheWorkspace(id, data) {
  try { localStorage.setItem(NS.key(id), JSON.stringify(migrate(data))); } catch (e) { console.warn('cache failed', e); }
}
export const snapshot = () => db();

export function peekNumber(type) {
  const rule = settings().numbering[type];
  return formatNumber(rule, rule.next);
}

/** Take the next number for a type and advance the sequence. */
export function takeNumber(type) {
  const rule = settings().numbering[type];
  const n = formatNumber(rule, rule.next);
  rule.next += 1;
  persist();
  return n;
}

export function clientSnapshot(c) {
  if (!c) return null;
  const { id, name, company, email, phone, gstin, address, city, state: st, pincode, shipAddress, extra } = c;
  return { id, name, company, email, phone, gstin, address, city, state: st, pincode, shipAddress, extra: { ...extra } };
}

export function newDoc(type = 'invoice', clientId = '') {
  const s = settings();
  const c = clientId ? get('clients', clientId) : null;
  const d = today();
  return {
    id: '',
    type,
    number: peekNumber(type),
    status: type === 'receipt' ? 'issued' : 'draft',
    title: s.docTitles[type] || DOC_TYPES[type].title,
    clientId: c ? c.id : '',
    client: clientSnapshot(c),
    date: d,
    dueDate: type === 'receipt' || type === 'credit' ? '' : addDays(d, s.dueDays),
    placeOfSupply: (c && c.state) || s.business.state,
    items: [{ name: '', description: '', hsn: '', qty: 1, unit: '', rate: 0, discount: 0, tax: s.defaultTax, category: '' }],
    discount: { type: '%', value: 0 },
    shipping: 0,
    adjustment: 0,
    insurance: 0,
    advance: 0,
    payments: [],
    fields: {},
    customFields: (s.design.customFields || []).map((f) => ({ label: f.label, value: f.value || '' })),
    notes: s.notes,
    terms: type === 'receipt' ? '' : s.terms,
    template: '',
    accent: '',
    reference: '',
  };
}

/** Save a document; new documents take their number now. */
export function saveDoc(doc) {
  if (!doc.id) {
    const rule = settings().numbering[doc.type];
    if (doc.number === formatNumber(rule, rule.next)) rule.next += 1;
  }
  return upsert('docs', doc);
}

export function duplicateDoc(doc, asType = doc.type) {
  const copy = JSON.parse(JSON.stringify(doc));
  Object.assign(copy, {
    id: '', type: asType, number: peekNumber(asType), status: 'draft', payments: [], advance: 0,
    date: today(), dueDate: addDays(today(), settings().dueDays), convertedTo: undefined, sentAt: undefined,
    title: settings().docTitles[asType] || DOC_TYPES[asType].title,
  });
  if (asType !== doc.type) copy.convertedFrom = doc.id;
  return copy;
}

export function setIndustry(ind, { resetDesign = true, addItems = true } = {}) {
  const s = settings();
  const p = industry(ind);
  s.industry = ind;
  s.clientLabel = p.clientLabel;
  s.defaultTax = p.tax;
  s.docTitles.invoice = p.docTitle;
  s.sector = null;
  if (resetDesign) {
    s.design.template = p.template;
    s.design.accent = p.accent;
    s.design.paper = p.template === 'thermal' ? '80mm' : 'A4';
    s.design.groupByCategory = !!p.groupByCategory;
    s.design.labels = industryLabels(ind);
    s.design.show = industryShow(ind);
  }
  if (addItems) {
    const have = new Set(db().items.map((i) => i.name.toLowerCase()));
    for (const it of starterItems(ind)) if (!have.has(it.name.toLowerCase())) upsert('items', it);
  }
  persist();
}

export function exportJSON() {
  flush();
  return JSON.stringify({ app: 'billx', version: 1, exportedAt: new Date().toISOString(), data: db() }, null, 2);
}

export function importJSON(text) {
  const parsed = JSON.parse(text);
  const data = parsed && parsed.data ? parsed.data : parsed;
  if (!data || !data.settings || !Array.isArray(data.docs)) throw new Error('This is not a billing backup file.');
  state = migrate(data);
  flush();
  persist();
  if (hooks.replaced) hooks.replaced();
}

export function resetAll() {
  state = blank();
  flush();
  persist();
  if (hooks.replaced) hooks.replaced();
}

/** Demo data so the app can be explored before entering real details. */
export function loadSample(ind = settings().industry || 'general') {
  const s = settings();
  setIndustry(ind);
  s.onboarded = true;
  const p = industry(ind);
  const sec = sectorOf(s);
  const short = p.name.split(/ [/(]/)[0];
  Object.assign(s.business, {
    name: p.sampleName || `Sample ${short}`,
    tagline: 'Quality you can trust',
    address: '2nd Floor, Market Road', city: 'Palakkad', state: '32', pincode: '678001',
    phone: '+91 98470 00000', email: 'billing@example.com', website: 'www.example.com',
    gstin: p.tax ? '32ABCDE1234F1Z5' : '', pan: 'ABCDE1234F',
    bankName: 'State Bank of India', accountName: p.sampleName || `Sample ${short}`, accountNo: '00000012345678', ifsc: 'SBIN0000001', branch: 'Palakkad Town',
    upiId: 'samplebusiness@upi',
  });
  const people = [['Anil Kumar', ''], ['Fathima Rahman', 'Rahman Stores'], ['Joseph Mathew', 'Global Tech Pvt Ltd']];
  const clients = people.map(([name, company], i) => upsert('clients', {
    name, company, email: `${name.split(' ')[0].toLowerCase()}@example.com`, phone: `+91 9${i}000 1234${i}`,
    gstin: i === 2 && p.tax ? '33AAACG1234K1Z2' : '', address: ['Fort Road', 'Stadium Bypass', 'Avinashi Road'][i],
    city: ['Palakkad', 'Thrissur', 'Coimbatore'][i], state: i === 2 ? '33' : '32', pincode: ['678001', '680001', '641018'][i],
    extra: Object.fromEntries(sec.clientFields.map((f) => [f.key, sampleValue(f, i)])),
  }));
  const names = new Set(starterItems(ind).map((x) => x.name));
  const catalogue = db().items.filter((it) => names.has(it.name));
  const t = today();
  const plans = [
    { c: 0, type: 'invoice', days: -40, due: -25, pay: 'full' },
    { c: 1, type: 'invoice', days: -20, due: -5, pay: 'part' },
    { c: 2, type: 'invoice', days: -3, due: 12, pay: 'none' },
    { c: 0, type: 'quote', days: -1, due: 14, pay: 'none' },
  ];
  for (const plan of plans) {
    const doc = newDoc(plan.type, clients[plan.c].id);
    doc.date = addDays(t, plan.days);
    doc.dueDate = addDays(t, plan.due);
    doc.items = catalogue.slice(plan.c, plan.c + 3).map((it, k) => ({
      name: it.name, description: '', hsn: it.hsn, qty: k === 1 ? 2 : 1, unit: it.unit, rate: it.rate || 500,
      discount: k === 0 && plan.c === 1 ? 10 : 0, tax: it.tax, category: it.category,
      ...Object.fromEntries(sec.itemCols.filter((c) => !c.hidden).map((c) => [c.key, sampleValue(c, k)])),
    }));
    if (!doc.items.length) doc.items = [{ name: 'Product or service', qty: 1, rate: 1000, tax: p.tax, discount: 0 }];
    doc.fields = Object.fromEntries(sec.fields.map((f, k) => [f.key, sampleValue(f, k, addDays(t, plan.days - (f.key.match(/admission|checkin|from/i) ? 3 : 0)))]));
    if (sec.insurance && plan.c === 1) doc.insurance = 2000;
    doc.status = 'sent';
    const total = doc.items.reduce((sum, i) => sum + i.qty * i.rate * (1 - (i.discount || 0) / 100) * (1 + (i.tax || 0) / 100), 0);
    if (plan.pay === 'full') doc.payments = [{ id: uid(), date: addDays(t, plan.days + 5), amount: Math.round(total), method: 'UPI', ref: 'UTR4021' }];
    if (plan.pay === 'part') doc.payments = [{ id: uid(), date: addDays(t, plan.days + 2), amount: Math.round(total / 3), method: 'Cash', ref: '' }];
    saveDoc(doc);
  }
  persist();
}
