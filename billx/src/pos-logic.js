// Quick Bill (fast counter billing) logic. Pure functions, tested in Node.

const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Items matching a search: exact code first, then names that start with the
 * text, then words that start with it, then anywhere. Popular items win ties.
 */
export function matchItems(query, items, limit = 60) {
  const q = norm(query);
  if (!q) return [];
  const scored = [];
  for (const it of items) {
    const name = norm(it.name);
    const code = norm(it.code);
    let score = 0;
    if (code && code === q) score = 100;
    else if (name === q) score = 90;
    else if (name.startsWith(q)) score = 70;
    else if (name.split(/[\s\-/(]+/).some((w) => w.startsWith(q))) score = 50;
    else if (code && code.startsWith(q)) score = 40;
    else if (name.includes(q) || norm(it.category).includes(q)) score = 20;
    if (score) scored.push({ it, score: score + Math.min(Number(it.sold) || 0, 999) / 1000 });
  }
  return scored.sort((a, b) => b.score - a.score || a.it.name.localeCompare(b.it.name)).slice(0, limit).map((x) => x.it);
}

/**
 * Parse the quick-entry box:
 *   "12"        → item with code 12, qty 1
 *   "3*12" "3x12" "3 x dosa" → qty 3 of the best match
 *   "dosa"      → best match, qty 1
 *   "12*3"      → also qty 3 when the left side is a code and the right is a small number
 */
export function parseQuickEntry(text, items) {
  const raw = String(text || '').trim();
  if (!raw) return null;
  let qty = 1;
  let query = raw;
  const m = raw.match(/^(\d+(?:\.\d+)?)\s*[x*×]\s*(.+)$/i);
  if (m) { qty = parseFloat(m[1]); query = m[2]; } else {
    const r = raw.match(/^(.+?)\s*[x*×]\s*(\d+(?:\.\d+)?)$/i);
    if (r) { qty = parseFloat(r[2]); query = r[1]; }
  }
  const hits = matchItems(query, items, 1);
  if (!hits.length || !(qty > 0)) return null;
  return { item: hits[0], qty };
}

/** Add an item to the order's lines, merging with an existing line for the same item. */
export function addLine(lines, item, qty = 1, taxOn = true) {
  const i = lines.findIndex((l) => l.itemId && l.itemId === item.id);
  if (i >= 0) {
    const next = [...lines];
    next[i] = { ...next[i], qty: round3((Number(next[i].qty) || 0) + qty) };
    return next;
  }
  return [...lines, {
    itemId: item.id, name: item.name, description: '', hsn: item.hsn || '', qty, unit: item.unit || '',
    rate: Number(item.rate) || 0, discount: 0, tax: taxOn ? Number(item.tax) || 0 : 0, category: item.category || '',
  }];
}

/** Change a line's quantity; at 0 or below the line is removed. */
export function setQty(lines, index, qty) {
  const q = round3(qty);
  if (!(q > 0)) return lines.filter((_, i) => i !== index);
  return lines.map((l, i) => (i === index ? { ...l, qty: q } : l));
}

const round3 = (n) => Math.round((Number(n) || 0) * 1000) / 1000;

/** Categories in menu order (first appearance), for the category tabs. */
export function categoriesOf(items) {
  const seen = [];
  for (const it of items) if (it.category && !seen.includes(it.category)) seen.push(it.category);
  return seen;
}

/** Items for the grid: "popular" sorts by how often each was sold, otherwise by code then name. */
export function gridItems(items, tab) {
  const byCode = (a, b) => (codeNum(a) - codeNum(b)) || a.name.localeCompare(b.name);
  if (tab === 'popular') return [...items].sort((a, b) => (Number(b.sold) || 0) - (Number(a.sold) || 0) || byCode(a, b));
  if (tab === 'all') return [...items].sort(byCode);
  return items.filter((it) => it.category === tab).sort(byCode);
}
const codeNum = (it) => (it.code && /^\d+$/.test(it.code) ? Number(it.code) : 1e9);

/** Kitchen order ticket (no prices) as HTML for an 80 mm printer. */
export function kotHTML({ number, table, slotLabel = 'Table', lines, note = '', time = new Date() }) {
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const t = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return `<div class="kot">
    <div class="kot-h">KITCHEN ORDER</div>
    <div class="kot-meta"><b>${table ? `${esc(slotLabel)} ${esc(table)}` : 'Takeaway'}</b><span>${esc(number)} · ${t}</span></div>
    <table>${lines.map((l) => `<tr><td class="q">${esc(l.qty)}</td><td>${esc(l.name)}</td></tr>`).join('')}</table>
    ${note ? `<div class="kot-note">Note: ${esc(note)}</div>` : ''}
  </div>`;
}

/* ---------------- bulk item import ---------------- */

export function splitCSVLine(line, sep) {
  const out = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === sep) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

const HEADER_KEYS = {
  name: ['name', 'item', 'item name', 'product', 'dish', 'service', 'particulars'],
  rate: ['price', 'rate', 'amount', 'mrp', 'cost', 'selling price'],
  category: ['category', 'group', 'section', 'type'],
  tax: ['gst', 'gst %', 'gst%', 'tax', 'tax %', 'tax%'],
  code: ['code', 'item code', 'short code', 'sku', 'barcode', 'no', 'no.', 'sl', 'sl no'],
  unit: ['unit', 'uom'],
  hsn: ['hsn', 'sac', 'hsn/sac', 'hsn code'],
};

/**
 * Parse pasted text or a CSV file into items. Accepts commas, tabs (copied
 * from Excel) or semicolons. With a header row the columns can be in any
 * order; without one the order is: name, price, category, GST %, code, unit.
 * Lines like "Masala dosa - 90" or "Masala dosa 90" also work.
 */
export function parseItemList(text, { defaultTax = 0 } = {}) {
  const lines = String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { items: [], skipped: 0 };
  const sep = lines[0].includes('\t') ? '\t' : lines[0].includes(';') && !lines[0].includes(',') ? ';' : ',';
  let cols = ['name', 'rate', 'category', 'tax', 'code', 'unit'];
  const first = splitCSVLine(lines[0], sep).map((c) => c.toLowerCase());
  let start = 0;
  if (first.some((c) => HEADER_KEYS.name.includes(c)) && first.some((c) => [...HEADER_KEYS.rate, ...HEADER_KEYS.category].includes(c))) {
    cols = first.map((c) => Object.keys(HEADER_KEYS).find((k) => HEADER_KEYS[k].includes(c)) || '');
    start = 1;
  }
  const items = [];
  let skipped = 0;
  for (const line of lines.slice(start)) {
    let cells = splitCSVLine(line, sep);
    if (cells.length === 1) {
      const m = line.match(/^(.*?)[\s\-–:=₹]+(?:rs\.?\s*)?(\d+(?:\.\d+)?)\s*$/i);
      cells = m ? [m[1], m[2]] : [line];
    }
    const rec = {};
    cols.forEach((k, i) => { if (k && cells[i] !== undefined) rec[k] = cells[i]; });
    const name = (rec.name || '').replace(/^"|"$/g, '').trim();
    const rate = parseFloat(String(rec.rate || '').replace(/[₹,\s]|rs\.?/gi, ''));
    if (!name || !(rate >= 0) || Number.isNaN(rate)) { skipped++; continue; }
    const tax = rec.tax !== undefined && rec.tax !== '' ? parseFloat(String(rec.tax).replace('%', '')) : defaultTax;
    items.push({
      name, rate, category: (rec.category || '').trim(), tax: Number.isFinite(tax) ? tax : defaultTax,
      code: (rec.code || '').trim(), unit: (rec.unit || '').trim(), hsn: (rec.hsn || '').trim(), description: '',
    });
  }
  return { items, skipped };
}
