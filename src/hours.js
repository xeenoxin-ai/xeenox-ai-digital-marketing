// Read OpenStreetMap opening_hours for "Open now · closes 9 PM".
// Covers the formats almost every shop uses: "24/7", "09:00-21:00",
// "Mo-Sa 09:00-21:00; Su 10:00-13:00", "Mo,We,Fr 10:00-14:00,16:00-20:00",
// "Su off", and closing past midnight ("18:00-02:00"). Anything fancier
// (holidays, sunrise, week numbers) returns null so we don't guess wrong.

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const ORDER = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function parseDays(spec) {
  const days = new Set();
  for (const part of spec.split(',')) {
    const [a, b] = part.trim().split('-');
    if (!ORDER.includes(a) || (b && !ORDER.includes(b))) return null;
    if (!b) { days.add(a); continue; }
    let i = ORDER.indexOf(a);
    for (let n = 0; n < 7; n++) {
      days.add(ORDER[i]);
      if (ORDER[i] === b) break;
      i = (i + 1) % 7;
    }
  }
  return days;
}

const toMin = (t) => {
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

function parseTimes(spec) {
  const out = [];
  for (const part of spec.split(',')) {
    const [a, b] = part.trim().split('-');
    const from = toMin(a || ''), to = toMin(b || '');
    if (from == null || to == null) return null;
    out.push([from, to <= from ? to + 1440 : to]); // past midnight
  }
  return out;
}

// → { [day]: [[fromMin, toMin], …] } or null when we can't read it.
export function parseHours(text) {
  if (!text) return null;
  const s = text.trim();
  const all = Object.fromEntries(ORDER.map((d) => [d, []]));
  if (s === '24/7') {
    for (const d of ORDER) all[d] = [[0, 1440]];
    return all;
  }
  for (const rule of s.split(';').map((r) => r.trim()).filter(Boolean)) {
    const m = rule.match(/^((?:[A-Z][a-z](?:-[A-Z][a-z])?,?)+)?\s*(.*)$/);
    const days = m[1] ? parseDays(m[1]) : new Set(ORDER);
    if (!days) return null;
    const rest = m[2].trim();
    if (rest === 'off' || rest === 'closed') {
      for (const d of days) all[d] = [];
      continue;
    }
    const times = parseTimes(rest);
    if (!times) return null;
    for (const d of days) all[d] = times; // later rules override earlier ones
  }
  return all;
}

const clock = (min) => {
  const h = Math.floor(min / 60) % 24, m = min % 60;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''} ${ampm}`;
};

// { open: true|false|null, text } for display.
export function openStatus(text, now = new Date()) {
  const week = parseHours(text);
  if (!week) return { open: null, text: '' };
  const day = DAYS[now.getDay()];
  const yesterday = DAYS[(now.getDay() + 6) % 7];
  const min = now.getHours() * 60 + now.getMinutes();

  // Still open from a late-night slot that started yesterday?
  for (const [from, to] of week[yesterday]) {
    if (to > 1440 && min < to - 1440) return { open: true, text: `Open now · closes ${clock(to)}` };
  }
  for (const [from, to] of week[day]) {
    if (to - from >= 1440) return { open: true, text: 'Open 24 hours' };
    if (min >= from && min < to) return { open: true, text: `Open now · closes ${clock(to)}` };
  }
  const later = week[day].find(([from]) => from > min);
  if (later) return { open: false, text: `Closed · opens ${clock(later[0])}` };
  for (let i = 1; i <= 7; i++) {
    const d = DAYS[(now.getDay() + i) % 7];
    if (week[d].length) {
      return { open: false, text: `Closed · opens ${i === 1 ? 'tomorrow' : d} ${clock(week[d][0][0])}` };
    }
  }
  return { open: false, text: 'Closed' };
}
