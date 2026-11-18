// Business insights: today's report (day close) and "is my business growing?".
// Pure functions over [{ d, t }] rows (document + computed totals). Tested in Node.

const isSale = (d) => d.type === 'invoice' && !['draft', 'cancelled'].includes(d.status);
const METHOD_KEYS = { cash: 'Cash', upi: 'UPI', card: 'Card' };
const methodKey = (m) => METHOD_KEYS[String(m || '').toLowerCase()] || (/upi|gpay|phonepe|paytm/i.test(m || '') ? 'UPI' : /card/i.test(m || '') ? 'Card' : /cash/i.test(m || '') ? 'Cash' : 'Other');
const r2 = (n) => Math.round(n * 100) / 100;

function topItems(rows, limit = 5) {
  const map = new Map();
  for (const { d } of rows) {
    for (const l of d.items || []) {
      if (!l.name) continue;
      const k = l.name.trim().toLowerCase();
      const cur = map.get(k) || { name: l.name.trim(), qty: 0, amount: 0 };
      cur.qty += Number(l.qty) || 0;
      cur.amount += (Number(l.qty) || 0) * (Number(l.rate) || 0);
      map.set(k, cur);
    }
  }
  return [...map.values()].sort((a, b) => b.amount - a.amount || b.qty - a.qty).slice(0, limit).map((x) => ({ ...x, amount: r2(x.amount) }));
}

/** Everything a shop owner wants at closing time for one date (YYYY-MM-DD). */
export function daySummary(rows, date) {
  const sales = rows.filter(({ d }) => isSale(d) && d.date === date);
  const byMethod = { Cash: 0, UPI: 0, Card: 0, Other: 0 };
  let collected = 0;
  for (const { d } of rows) {
    if (d.type !== 'invoice' || d.status === 'cancelled') continue;
    for (const p of d.payments || []) {
      if (p.date !== date) continue;
      const a = Number(p.amount) || 0;
      byMethod[methodKey(p.method)] += a;
      collected += a;
    }
  }
  const billed = sales.reduce((a, r) => a + (r.t.payable ?? r.t.total ?? 0), 0);
  const unpaid = sales.reduce((a, r) => a + Math.max(0, r.t.balance || 0), 0);
  return {
    date, bills: sales.length, billed: r2(billed), collected: r2(collected), unpaid: r2(unpaid),
    avg: sales.length ? r2(billed / sales.length) : 0,
    byMethod: Object.fromEntries(Object.entries(byMethod).map(([k, v]) => [k, r2(v)])),
    topItems: topItems(sales, 5),
  };
}

const ym = (iso) => iso.slice(0, 7);
const dayOf = (iso) => Number(iso.slice(8, 10));
const daysInMonth = (iso) => new Date(Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)), 0)).getUTCDate();
const prevMonth = (iso) => { const d = new Date(Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 2, 1)); return d.toISOString().slice(0, 7); };
const addDaysIso = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);

/**
 * "Is my business growing?": this month so far vs the same days last month,
 * best day, top items and customers, billing streak, projection, next milestone.
 */
export function growth(rows, today, goal = 0) {
  const sales = rows.filter(({ d }) => isSale(d));
  const month = ym(today);
  const last = prevMonth(today);
  const upTo = dayOf(today);
  const amt = (r) => r.t.payable ?? r.t.total ?? 0;
  const thisRows = sales.filter(({ d }) => ym(d.date) === month && d.date <= today);
  const lastRows = sales.filter(({ d }) => ym(d.date) === last && dayOf(d.date) <= upTo);
  const thisMonth = thisRows.reduce((a, r) => a + amt(r), 0);
  const lastSame = lastRows.reduce((a, r) => a + amt(r), 0);
  const pct = lastSame > 0 ? Math.round(((thisMonth - lastSame) / lastSame) * 100) : null;

  const byDay = new Map();
  for (const r of thisRows) byDay.set(r.d.date, (byDay.get(r.d.date) || 0) + amt(r));
  let bestDay = null;
  for (const [date, total] of byDay) if (!bestDay || total > bestDay.total) bestDay = { date, total: r2(total) };

  const cust = new Map();
  for (const r of thisRows) {
    const name = (r.d.client && r.d.client.name) || '';
    if (!name || name === 'Customer') continue;
    const cur = cust.get(name.toLowerCase()) || { name, amount: 0, bills: 0 };
    cur.amount += amt(r); cur.bills += 1;
    cust.set(name.toLowerCase(), cur);
  }

  let streak = 0;
  const days = new Set(sales.map(({ d }) => d.date));
  for (let day = today; days.has(day); day = addDaysIso(day, -1)) streak++;

  const total = sales.length;
  const steps = [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
  const next = steps.find((x) => x > total) || total + 10000;
  const prev = [...steps].reverse().find((x) => x <= total) || 0;

  const projected = upTo ? (thisMonth / upTo) * daysInMonth(today) : 0;
  return {
    thisMonth: r2(thisMonth), lastSame: r2(lastSame), pct, bills: thisRows.length, bestDay,
    topItems: topItems(thisRows, 5),
    topCustomers: [...cust.values()].sort((a, b) => b.amount - a.amount).slice(0, 5).map((c) => ({ ...c, amount: r2(c.amount) })),
    streak, totalBills: total, milestone: { reached: prev, next, progress: next > prev ? (total - prev) / (next - prev) : 1 },
    projected: r2(projected),
    goal: goal > 0 ? { target: goal, progress: Math.min(1, thisMonth / goal), onTrack: projected >= goal } : null,
  };
}
