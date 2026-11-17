// Dashboard and first-run setup.

import {
  settings, setIndustry, loadSample, flush, persist, DOC_TYPES, all, today, workspaces, removeWorkspace, activeWorkspace,
} from '../store.js';
import { sectorPickerHTML, bindSectorPicker } from './sector-picker.js';
import { STATES, CURRENCIES } from '../calc.js';
import { INDUSTRIES } from '../industries.js';
import { fmtDate } from '../templates.js';
import { icon, esc, $, $$, badge, options, field } from '../ui.js';
import { money, docsWithTotals, clientLabel } from '../helpers.js';
import { navigate, setPage } from '../router.js';
import logoUrl from '../../logo.svg';

export function dashboardView(main) {
  const s = settings();
  if (!s.onboarded) return onboarding(main);
  setPage('Dashboard', `<a class="btn qb-cta" href="#/pos">${icon('zap')} Quick Bill</a>
    <a class="btn" href="#/new/quote">${icon('plus')}<span class="hide-sm"> Quote</span></a>
    <a class="btn primary" href="#/new/invoice">${icon('plus')} New ${esc((s.docTitles.invoice || 'Invoice').toLowerCase())}</a>`);

  const t0 = today();
  const month = t0.slice(0, 7);
  const rows = docsWithTotals((d) => d.status !== 'cancelled' && d.status !== 'draft');
  const inv = rows.filter((r) => r.d.type === 'invoice');
  const thisMonth = inv.filter((r) => r.d.date.startsWith(month));
  const sum = (l, f) => l.reduce((a, r) => a + f(r), 0);
  const overdue = inv.filter((r) => r.status === 'overdue');
  const outstanding = sum(inv, (r) => Math.max(r.t.balance, 0));
  const collectedMonth = inv.reduce((a, r) => a + (r.d.payments || []).filter((p) => (p.date || '').startsWith(month)).reduce((x, p) => x + Number(p.amount || 0), 0), 0);
  const openQuotes = rows.filter((r) => r.d.type === 'quote' && r.status === 'awaiting');

  // Last 6 months chart
  const months = [];
  const [y, m] = t0.split('-').map(Number);
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    months.push(d.toISOString().slice(0, 7));
  }
  const series = months.map((k) => ({
    k, billed: sum(inv.filter((r) => r.d.date.startsWith(k)), (r) => r.t.total),
    paid: inv.reduce((a, r) => a + (r.d.payments || []).filter((p) => (p.date || '').startsWith(k)).reduce((x, p) => x + Number(p.amount || 0), 0), 0),
  }));
  const max = Math.max(1, ...series.map((x) => Math.max(x.billed, x.paid)));
  const W = 560; const H = 180; const bw = W / series.length;
  const bars = series.map((x, i) => {
    const h1 = (x.billed / max) * (H - 30);
    const h2 = (x.paid / max) * (H - 30);
    const label = new Date(`${x.k}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'short' });
    return `<g><title>${label}: billed ${money(x.billed)}, received ${money(x.paid)}</title>
      <rect x="${i * bw + bw * 0.18}" y="${H - 20 - h1}" width="${bw * 0.3}" height="${h1}" rx="3" class="c-billed"/>
      <rect x="${i * bw + bw * 0.52}" y="${H - 20 - h2}" width="${bw * 0.3}" height="${h2}" rx="3" class="c-paid"/>
      <text x="${i * bw + bw / 2}" y="${H - 4}" text-anchor="middle">${label}</text></g>`;
  }).join('');

  const recent = docsWithTotals().slice(0, 8);
  const dueSoon = inv.filter((r) => ['sent', 'partial', 'overdue'].includes(r.status)).sort((a, b) => (a.d.dueDate || '').localeCompare(b.d.dueDate || '')).slice(0, 6);
  const empty = !all('docs').length;

  main.innerHTML = `
    ${empty ? `<section class="card hero">
      <h2>Welcome, ${esc(s.business.name)}</h2>
      <p>Create your first ${esc((s.docTitles.invoice || 'invoice').toLowerCase())} in under a minute. Your logo, UPI QR and design are applied automatically.</p>
      <div class="row-gap wrap"><a class="btn primary" href="#/new/invoice">${icon('plus')} Create ${esc((s.docTitles.invoice || 'invoice').toLowerCase())}</a>
      <a class="btn" href="#/settings">${icon('settings')} Complete business profile</a><a class="btn" href="#/design">${icon('palette')} Choose a design</a></div>
    </section>` : ''}
    <div class="kpis">
      <div class="kpi"><span>Billed this month</span><b>${money(sum(thisMonth, (r) => r.t.total))}</b><small>${thisMonth.length} ${esc(DOC_TYPES.invoice.plural.toLowerCase())}</small></div>
      <div class="kpi good"><span>Received this month</span><b>${money(collectedMonth)}</b></div>
      <div class="kpi warn"><span>Outstanding</span><b>${money(outstanding)}</b><small>${inv.filter((r) => r.t.balance > 0.004).length} unpaid</small></div>
      <a class="kpi bad" href="#/docs/invoice?status=overdue"><span>Overdue</span><b>${money(sum(overdue, (r) => r.t.balance))}</b><small>${overdue.length} invoices</small></a>
      <a class="kpi" href="#/docs/quote?status=awaiting"><span>Open quotes</span><b>${money(sum(openQuotes, (r) => r.t.total))}</b><small>${openQuotes.length} waiting</small></a>
    </div>
    <div class="two-col">
      <section class="card">
        <div class="row-between"><h3>Last 6 months</h3><span class="legend"><i></i> Billed <i class="paid"></i> Received</span></div>
        <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Billed and received per month">${bars}</svg>
      </section>
      <section class="card">
        <h3>Waiting for payment</h3>
        ${dueSoon.length ? dueSoon.map(({ d, t, status }) => `<a class="list-row" href="#/doc/${d.id}">
          <span><b>${esc(d.client ? d.client.name : '—')}</b><small>${esc(d.number)} · due ${fmtDate(d.dueDate)}</small></span>
          <span class="right">${money(t.balance)}${badge(status)}</span></a>`).join('') : '<p class="muted">Nothing outstanding. 🎉</p>'}
      </section>
    </div>
    <section class="card">
      <div class="row-between"><h3>Recent documents</h3><a href="#/docs/all">See all</a></div>
      ${recent.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Number</th><th>${esc(clientLabel())}</th><th>Date</th><th class="num">Amount</th><th>Status</th></tr></thead>
      <tbody>${recent.map(({ d, t, status }) => `<tr class="link" data-id="${d.id}"><td><b>${esc(d.number)}</b><div class="sub">${esc(DOC_TYPES[d.type].name)}</div></td>
        <td>${esc(d.client ? d.client.name : '—')}</td><td>${fmtDate(d.date)}</td><td class="num">${money(t.payable)}</td><td>${badge(status)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No documents yet.</p>'}
    </section>`;
  $$('tr.link', main).forEach((tr) => tr.addEventListener('click', () => navigate(`#/doc/${tr.dataset.id}`)));
}

function sectorSummary(key) {
  const p = INDUSTRIES[key];
  if (!p) return '';
  if (p.custom) return 'Start blank: add your own bill fields, customer fields and item columns in Settings → Fields on your bills.';
  const bits = [
    `${p.clientLabel}s`, p.docTitle,
    p.fields.length ? `bill fields: ${p.fields.map((f) => f.label).join(', ')}` : '',
    p.clientFields.length ? `${p.clientLabel.toLowerCase()} fields: ${p.clientFields.map((f) => f.label).join(', ')}` : '',
    p.itemCols.filter((c) => !c.hidden).length ? `item columns: ${p.itemCols.filter((c) => !c.hidden).map((c) => c.label).join(', ')}` : '',
    `${p.items.length} starter items`, `${p.tax}% tax`,
  ].filter(Boolean);
  return `<b>${esc(p.name)}</b> · ${esc(bits.join(' · '))}. You can change all of it later.`;
}

function onboarding(main) {
  const s = settings();
  const others = workspaces().filter((w) => !w.active);
  setPage('Set up BillX', '');
  document.body.classList.add('onboarding');
  main.innerHTML = `
  <form class="onboard" id="ob">
    <div class="onboard-head"><img src="${logoUrl}" alt="" width="48" height="48"><div><h1>${others.length ? 'Add a business to BillX' : 'Welcome to BillX'}</h1>
    <p>Billing &amp; invoicing for every kind of business. Pick your type and BillX prepares the fields, labels, tax, starter items and invoice design. Not listed? Choose <b>Custom</b> and build your own.</p></div></div>
    ${sectorPickerHTML(s.industry || 'general')}
    <p class="sp-info" id="spInfo">${sectorSummary(s.industry || 'general')}</p>
    <div class="grid g3">
      ${field('Business name', `<input name="name" placeholder="e.g. Sunrise Traders" value="${s.business.name === 'Your Business Name' ? '' : esc(s.business.name)}">`)}
      ${field('State', `<select name="state">${options(STATES.map(([c, n]) => [c, n]), s.business.state)}</select>`)}
      ${field('Currency', `<select name="currency">${options(Object.keys(CURRENCIES).map((c) => [c, `${c} (${CURRENCIES[c].symbol})`]), s.currency)}</select>`)}
    </div>
    <div class="row-gap wrap end">
      ${others.length ? `<button type="button" class="btn ghost" id="obCancel">Cancel</button>` : ''}
      <button class="btn" value="sample">${icon('eye')} Explore with sample data</button>
      <button class="btn primary" value="start">${icon('check')} Start billing</button>
    </div>
  </form>`;
  const form = $('#ob', main);
  bindSectorPicker(form, (key) => { $('#spInfo', form).innerHTML = sectorSummary(key); });
  const cancel = $('#obCancel', form);
  if (cancel) cancel.addEventListener('click', () => {
    removeWorkspace(activeWorkspace());
    document.body.classList.remove('onboarding');
    location.hash = '#/';
    location.reload();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const ind = fd.get('industry') || 'general';
    const sample = e.submitter && e.submitter.value === 'sample';
    if (sample) loadSample(ind);
    else setIndustry(ind);
    if (fd.get('name')) s.business.name = fd.get('name').trim();
    if (!sample) s.business.state = fd.get('state');
    s.currency = fd.get('currency');
    if (s.currency !== 'INR') s.taxMode = 'simple';
    s.onboarded = true;
    persist();
    flush();
    document.body.classList.remove('onboarding');
    location.hash = '#/';
    location.reload();
  });
}
