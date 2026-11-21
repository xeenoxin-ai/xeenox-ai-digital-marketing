// Small helpers shared by the SalePunch worker.

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...headers } });
export const fail = (status, error) => json({ error }, status);

export const newId = () => crypto.randomUUID().replaceAll('-', '').slice(0, 20);

/** YYYY-MM-DD for a timestamp in the business time zone (default India). */
export function dayOf(ms, tz = 'Asia/Kolkata') {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));
}

/** Indian-style phone normalisation: 10-digit mobiles get +91. */
export function normalizePhone(raw, defaultCountry = '91') {
  const s = String(raw || '').trim();
  let d = s.replace(/\D/g, '');
  if (!d) return '';
  if (s.startsWith('+')) return '+' + d;
  if (d.startsWith('00')) return '+' + d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  if (d.length === 10) return `+${defaultCountry}${d}`;
  return '+' + d;
}

/** Minimal CSV parser (quoted fields, commas and newlines inside quotes). */
export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((f) => f.trim() !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim() !== '')) rows.push(row);
  if (!rows.length) return [];
  const head = rows[0].map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()])));
}

export const clampInt = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(v) || 0)));

export function safeJson(text, fallback = null) {
  try { return text ? JSON.parse(text) : fallback; } catch { return fallback; }
}

/** Constant-time string compare for secrets. */
export function sameSecret(a, b) {
  a = String(a || ''); b = String(b || '');
  if (!a || !b || a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}
