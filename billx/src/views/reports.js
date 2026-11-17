// Reports: sales, collections, GST summary, ageing, top clients, CSV export.

import { settings, today, DOC_TYPES } from '../store.js';
import { daysOverdue, addDays } from '../calc.js';
import { icon, esc, $, download } from '../ui.js';
import { money, docsWithTotals, toCSV, clientLabel } from '../helpers.js';
import { navigate, setPage } from '../router.js';

function periods() {
  const t = today();
  const [y, m] = t.split('-').map(Number);
  const ym = (yy, mm) => `${yy}-${String(mm).padStart(2, '0')}`;
  const lastDay = (yy, mm) => new Date(Date.UTC(yy, mm, 0)).toISOString().slice(0, 10);
  const pm = m === 1 ? [y - 1, 12] : [y, m - 1];
  const fyStart = m >= 4 ? y : y - 1;
  return {
    month: ['This month', `${ym(y, m)}-01`, lastDay(y, m)],
    last: ['Last month', `${ym(...pm)}-01`, lastDay(...pm)],
    q: ['Last 90 days', addDays(t, -89), t],
    fy: [`FY ${fyStart}-${String(fyStart + 1).slice(2)}`, `${fyStart}-04-01`, `${fyStart + 1}-03-31`],
    pfy: [`FY ${fyStart - 1}-${String(fyStart).slice(2)}`, `${fyStart - 1}-04-01`, `${fyStart}-03-31`],
    all: ['All time', '0000-01-01', '9999-12-31'],
  };
}

export function reportsView(main, params, query) {
  const P = periods();
  const key = query.get('p') || 'fy';
  const [label, from, to] = key === 'custom' ? ['Custom', query.get('from') || today(), query.get('to') || today()] : P[key] || P.fy;
  setPage('Reports', `<button class="btn" id="csv">${icon('download')}<span class="hide-sm"> Export CSV</span></button>`);

  const inRange = (d) => d.date >= from && d.date <= to;
  const rows = docsWithTotals((d) => inRange(d) && d.status !== 'cancelled' && d.status !== 'draft');
  const inv = rows.filter((r) => r.d.type === 'invoice');
  const credits = rows.filter((r) => r.d.type === 'credit');
  const sum = (list, f) => list.reduce((s, r) => s + f(r), 0);
  const sales = sum(inv, (r) => r.t.total);
  const tax = sum(inv, (r) => r.t.totalTax);
  const received = sum(inv, (r) => r.t.paid);
  const insurance = sum(inv, (r) => r.t.insurance);
  const creditTotal = sum(credits, (r) => r.t.total);
  const outstanding = sum(inv, (r) => Math.max(r.t.balance, 0));

  // Monthly
  const months = new Map();
  for (const r of inv) {
    const k = r.d.date.slice(0, 7);
    const m = months.get(k) || { n: 0, taxable: 0, tax: 0, total: 0, paid: 0 };
    m.n++; m.taxable += r.t.taxable; m.tax += r.t.totalTax; m.total += r.t.total; m.paid += r.t.paid;
    months.set(k, m);
  }
  const monthRows = [...months.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const maxM = Math.max(1, ...monthRows.map(([, m]) => m.total));

  // GST by rate
  const gst = new Map();
  for (const r of inv) for (const x of r.t.taxes) {
    const g = gst.get(x.rate) || { taxable: 0, cgst: 0, sgst: 0, igst: 0 };
    g.taxable += x.taxable; g.cgst += x.cgst || 0; g.sgst += x.sgst || 0; g.igst += x.igst || (settings().taxMode !== 'gst' ? x.amount : 0);
    gst.set(x.rate, g);
  }
  const exempt = sum(inv, (r) => r.t.taxable - r.t.taxes.reduce((s, x) => s + x.taxable, 0));

  // Ageing (all open invoices, regardless of period)
  const open = docsWithTotals((d) => d.type === 'invoice' && d.status !== 'cancelled' && d.status !== 'draft').filter((r) => r.t.balance > 0.004);
  const buckets = [['Not due', 0, 0], ['1-30 days', 1, 30], ['31-60 days', 31, 60], ['61-90 days', 61, 90], ['90+ days', 91, 1e9]].map(([l, a, b]) => {
    const list = open.filter((r) => { const d = daysOverdue(r.d); return d >= a && d <= b; });
    return { l, n: list.length, amt: sum(list, (r) => r.t.balance) };
  });

  // Top clients
  const byClient = new Map();
  for (const r of inv) {
    const k = (r.d.client && r.d.client.name) || '—';
    const c = byClient.get(k) || { total: 0, paid: 0, n: 0, id: r.d.clientId };
    c.total += r.t.total; c.paid += r.t.paid; c.n++;
    byClient.set(k, c);
  }
  const top = [...byClient.entries()].sort((a, b) => b[1].total - a[1].total).slice(0, 10);

  main.innerHTML = `
    <div class="toolbar">
      <div class="chips">${Object.entries(P).map(([k, [l]]) => `<a class="chip${k === key ? ' on' : ''}" href="#/reports?p=${k}">${esc(l)}</a>`).join('')}</div>
      <form class="row-gap" id="custom"><input type="date" name="from" value="${esc(from > '0001' ? from : '')}"><span>to</span><input type="date" name="to" value="${esc(to < '9999' ? to : '')}"><button class="btn">Apply</button></form>
    </div>
    <p class="muted">${esc(label)}${key !== 'all' ? ` · ${esc(from)} to ${esc(to)}` : ''} · issued invoices only</p>
    <div class="kpis">
      <div class="kpi"><span>Invoiced</span><b>${money(sales)}</b><small>${inv.length} invoices</small></div>
      <div class="kpi"><span>Tax collected</span><b>${money(tax)}</b></div>
      <div class="kpi good"><span>Received</span><b>${money(received)}</b></div>
      ${insurance ? `<div class="kpi"><span>Insurance / TPA share</span><b>${money(insurance)}</b></div>` : ''}
      ${creditTotal ? `<div class="kpi"><span>Credit notes</span><b>${money(creditTotal)}</b></div>` : ''}
      <div class="kpi warn"><span>Outstanding</span><b>${money(outstanding)}</b></div>
    </div>
    <div class="two-col">
      <section class="card">
        <h3>Month by month</h3>
        ${monthRows.length ? `<div class="bars">${monthRows.map(([k, m]) => `<div class="bar-row"><span>${esc(k)}</span><div class="bar"><i style="width:${(m.total / maxM) * 100}%"></i><i class="paid" style="width:${(m.paid / maxM) * 100}%"></i></div><b>${money(m.total)}</b></div>`).join('')}</div>
        <p class="legend"><i></i> Invoiced <i class="paid"></i> Received</p>
        <div class="table-wrap"><table class="table"><thead><tr><th>Month</th><th class="num">Invoices</th><th class="num">Taxable</th><th class="num">Tax</th><th class="num">Total</th><th class="num">Received</th></tr></thead>
        <tbody>${monthRows.map(([k, m]) => `<tr><td>${esc(k)}</td><td class="num">${m.n}</td><td class="num">${money(m.taxable)}</td><td class="num">${money(m.tax)}</td><td class="num">${money(m.total)}</td><td class="num">${money(m.paid)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No invoices in this period.</p>'}
      </section>
      <section class="card">
        <h3>GST summary <small>for GSTR-1 / 3B</small></h3>
        <div class="table-wrap"><table class="table"><thead><tr><th>Rate</th><th class="num">Taxable</th><th class="num">CGST</th><th class="num">SGST</th><th class="num">IGST</th></tr></thead>
        <tbody>${[...gst.entries()].sort((a, b) => a[0] - b[0]).map(([rate, g]) => `<tr><td>${rate}%</td><td class="num">${money(g.taxable)}</td><td class="num">${money(g.cgst)}</td><td class="num">${money(g.sgst)}</td><td class="num">${money(g.igst)}</td></tr>`).join('')}
        ${exempt > 0.004 ? `<tr><td>Nil / exempt</td><td class="num">${money(exempt)}</td><td class="num">–</td><td class="num">–</td><td class="num">–</td></tr>` : ''}</tbody></table></div>
        <h3>Receivables ageing <small>all open invoices</small></h3>
        <div class="table-wrap"><table class="table"><tbody>${buckets.map((b) => `<tr><td>${b.l}</td><td class="num">${b.n}</td><td class="num">${money(b.amt)}</td></tr>`).join('')}</tbody></table></div>
        <h3>Top ${esc(clientLabel().toLowerCase())}s</h3>
        <div class="table-wrap"><table class="table"><tbody>${top.map(([name, c]) => `<tr${c.id ? ` class="link" data-client="${c.id}"` : ''}><td>${esc(name)}</td><td class="num">${c.n}</td><td class="num">${money(c.total)}</td></tr>`).join('') || '<tr><td class="muted">No data</td></tr>'}</tbody></table></div>
      </section>
    </div>`;

  $('#custom', main).addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    navigate(`#/reports?p=custom&from=${fd.get('from') || today()}&to=${fd.get('to') || today()}`);
  });
  main.querySelectorAll('[data-client]').forEach((tr) => tr.addEventListener('click', () => navigate(`#/client/${tr.dataset.client}`)));
  $('#csv').addEventListener('click', () => {
    const all = docsWithTotals((d) => inRange(d));
    const head = ['Type', 'Number', 'Date', 'Due date', 'Status', clientLabel(), 'Company', 'GSTIN', 'Place of supply', 'Taxable', 'CGST', 'SGST', 'IGST', 'Total tax', 'Total', 'Insurance', 'Paid', 'Balance'];
    const lines = all.map(({ d, t, status }) => [
      DOC_TYPES[d.type].name, d.number, d.date, d.dueDate, status, d.client && d.client.name, d.client && d.client.company, d.client && d.client.gstin, d.placeOfSupply,
      t.taxable, t.taxes.reduce((s, x) => s + (x.cgst || 0), 0).toFixed(2), t.taxes.reduce((s, x) => s + (x.sgst || 0), 0).toFixed(2), t.taxes.reduce((s, x) => s + (x.igst || 0), 0).toFixed(2),
      t.totalTax, t.total, t.insurance, t.paid, t.balance,
    ]);
    download(`documents-${from > '0001' ? from : 'all'}-to-${to < '9999' ? to : today()}.csv`, toCSV([head, ...lines]), 'text/csv');
  });
}
