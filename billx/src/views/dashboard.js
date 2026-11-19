// Dashboard and first-run setup.

import {
  settings, setIndustry, loadSample, flush, persist, DOC_TYPES, all, today, workspaces, removeWorkspace, activeWorkspace,
} from '../store.js';
import { sectorPickerHTML, bindSectorPicker } from './sector-picker.js';
import { STATES, CURRENCIES } from '../calc.js';
import { INDUSTRIES } from '../industries.js';
import { fmtDate } from '../templates.js';
import { icon, esc, $, $$, badge, options, field, avatar, toast, modal } from '../ui.js';
import { money, docsWithTotals, clientLabel } from '../helpers.js';
import { navigate, setPage } from '../router.js';
import { collectionList, dueRepeats, REPEAT_EVERY } from '../collect.js';
import { growth } from '../insights.js';
import { inviteCardHTML, bindInvite } from './invite.js';
import { sendReminder, remindedLabel, createFromRepeat } from './remind.js';
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
  const todays = inv.filter((r) => r.d.date === t0);
  const collectedToday = inv.reduce((a, r) => a + (r.d.payments || []).filter((p) => p.date === t0).reduce((x, p) => x + Number(p.amount || 0), 0), 0);
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayLabel = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

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
      <rect x="${i * bw + bw * 0.18}" y="${H - 20 - h1}" width="${bw * 0.3}" height="${h1}" rx="6" class="c-billed" fill="url(#gBilled)"/>
      <rect x="${i * bw + bw * 0.52}" y="${H - 20 - h2}" width="${bw * 0.3}" height="${h2}" rx="6" class="c-paid" fill="url(#gPaid)"/>
      <text x="${i * bw + bw / 2}" y="${H - 4}" text-anchor="middle">${label}</text></g>`;
  }).join('');

  const recent = docsWithTotals().slice(0, 8);
  const empty = !all('docs').length;
  const chase = collectionList(inv, t0);
  const chaseRows = [...chase.overdue, ...chase.today, ...chase.soon];
  const repeats = dueRepeats(all('docs'), t0);
  const g = growth(rows, t0, Number(s.goal) || 0);
  const maxItem = Math.max(1, ...g.topItems.map((x) => x.amount));
  const chip = (r) => (r.daysLate ? `<span class="due-chip late">${r.daysLate} day${r.daysLate === 1 ? '' : 's'} late</span>` : r.daysLeft ? `<span class="due-chip soon">due in ${r.daysLeft} day${r.daysLeft === 1 ? '' : 's'}</span>` : '<span class="due-chip today">due today</span>');

  const inv1 = esc((s.docTitles.invoice || 'Invoice').toLowerCase());
  main.innerHTML = `
    <section class="dash-hero">
      <div class="dash-hero-main">
        <p class="dash-date">${esc(todayLabel)}</p>
        <h2>${greet}, ${esc(s.business.name)}</h2>
        ${empty ? `<p class="dash-sub">Create your first ${inv1} in under a minute. Your logo, UPI QR and design are applied automatically.</p>`
    : `<div class="dash-today"><div><span>Today's sales</span><b>${money(sum(todays, (r) => r.t.total))}</b><small>${todays.length} bill${todays.length === 1 ? '' : 's'}</small></div>
          <div><span>Collected today</span><b>${money(collectedToday)}</b><small>Cash, UPI &amp; card</small></div></div>`}
      </div>
      <nav class="dash-actions" aria-label="Quick actions">
        <a href="#/pos" class="da da-pos">${icon('zap', 22)}<b>Quick Bill</b><small>Fast counter billing</small></a>
        <a href="#/new/invoice" class="da">${icon('file', 22)}<b>New ${inv1}</b><small>Full GST invoice</small></a>
        <a href="#/clients" class="da">${icon('users', 22)}<b>${esc(clientLabel())}s</b><small>Add &amp; manage</small></a>
        <a href="${all('items').length > 5 ? '#/items' : '#/items?import=1'}" class="da">${icon('box', 22)}<b>Items</b><small>${all('items').length} saved</small></a>
      </nav>
    </section>
    ${empty ? `<div class="row-gap wrap dash-setup"><a class="btn" href="#/settings">${icon('settings')} Complete business profile</a><a class="btn" href="#/design">${icon('palette')} Choose a design</a></div>` : ''}
    ${repeats.length ? `<section class="card repeat-due">
      <div class="row-between"><div><h3>${icon('refresh', 18)} ${repeats.length} repeating bill${repeats.length === 1 ? '' : 's'} to create</h3>
        <p class="muted small">${repeats.slice(0, 3).map((d) => `${esc(d.client ? d.client.name : d.number)} (${esc(REPEAT_EVERY[d.repeat.every].toLowerCase())})`).join(', ')}${repeats.length > 3 ? '…' : ''}</p></div>
        <button class="btn primary" id="createRepeats">${icon('plus')} Create ${repeats.length === 1 ? 'it' : 'all'} now</button></div>
    </section>` : ''}
    <div class="kpis">
      <div class="kpi"><i class="kpi-ic">${icon('trend', 18)}</i><span>Billed this month</span><b>${money(sum(thisMonth, (r) => r.t.total))}</b><small>${thisMonth.length} ${esc((thisMonth.length === 1 ? DOC_TYPES.invoice.name : DOC_TYPES.invoice.plural).toLowerCase())}</small></div>
      <div class="kpi good"><i class="kpi-ic">${icon('cash', 18)}</i><span>Received this month</span><b>${money(collectedMonth)}</b><small>Payments recorded</small></div>
      <div class="kpi warn"><i class="kpi-ic">${icon('clock', 18)}</i><span>Outstanding</span><b>${money(outstanding)}</b><small>${inv.filter((r) => r.t.balance > 0.004).length} unpaid</small></div>
      <a class="kpi bad" href="#/docs/invoice?status=overdue"><i class="kpi-ic">${icon('alert', 18)}</i><span>Overdue</span><b>${money(sum(overdue, (r) => r.t.balance))}</b><small>${overdue.length} ${overdue.length === 1 ? 'invoice' : 'invoices'}</small></a>
      <a class="kpi" href="#/docs/quote?status=awaiting"><i class="kpi-ic">${icon('file', 18)}</i><span>Open quotes</span><b>${money(sum(openQuotes, (r) => r.t.total))}</b><small>${openQuotes.length} waiting</small></a>
    </div>
    <div class="two-col">
      <section class="card">
        <div class="row-between"><h3>Last 6 months</h3><span class="legend"><i></i> Billed <i class="paid"></i> Received</span></div>
        <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Billed and received per month"><defs>
          <linearGradient id="gBilled" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6d4cff"/><stop offset="1" stop-color="#2457f5"/></linearGradient>
          <linearGradient id="gPaid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34d399"/><stop offset="1" stop-color="#059669"/></linearGradient></defs>${bars}</svg>
      </section>
      <section class="card getpaid">
        <div class="row-between"><h3>Get paid</h3>${chaseRows.length ? `<span class="muted small">${money(chase.total)} to collect</span>` : ''}</div>
        ${chaseRows.length ? `<div class="gp-sum">
            <span class="gp-pill late"><b>${chase.overdue.length}</b> overdue</span><span class="gp-pill today"><b>${chase.today.length}</b> due today</span><span class="gp-pill soon"><b>${chase.soon.length}</b> due soon</span>
          </div>
          ${chaseRows.slice(0, 6).map((r) => `<div class="gp-row">
            <a class="who" href="#/doc/${r.d.id}">${avatar(r.d.client ? r.d.client.name : '?')}<span><b>${esc(r.d.client ? r.d.client.name : '—')}</b><small>${esc(r.d.number)} · ${chip(r)}${r.lastReminded ? ` · ${esc(remindedLabel(r.d))}` : ''}</small></span></a>
            <span class="gp-amt">${money(r.t.balance)}</span>
            <button class="btn gp-remind" data-remind="${r.d.id}" title="Send WhatsApp reminder">${icon('whatsapp', 16)}<span class="hide-sm"> Remind</span></button>
          </div>`).join('')}
          ${chaseRows.length > 6 ? `<a class="see-all" href="#/docs/invoice?status=overdue">All ${chaseRows.length} bills to collect ${icon('arrow', 14)}</a>` : ''}`
    : `<div class="dash-empty">${icon('check', 28)}<p>All paid up. Nothing overdue or due this week.</p></div>`}
      </section>
    </div>
    ${!empty ? `<section class="card growth">
      <div class="row-between"><h3>${icon('trend', 18)} Your growth</h3><button class="btn ghost" id="setGoal">${icon('star', 16)} ${g.goal ? 'Change goal' : 'Set monthly goal'}</button></div>
      <div class="gr-grid">
        <div class="gr-main">
          <span>This month so far</span><b>${money(g.thisMonth)}</b>
          ${g.pct === null ? '<em class="flat">First month in BillX. Keep billing!</em>'
    : `<em class="${g.pct >= 0 ? 'up' : 'down'}">${g.pct >= 0 ? '▲' : '▼'} ${Math.abs(g.pct)}% vs the same days last month</em>`}
          <small>On pace for <b>${money(g.projected)}</b> this month · ${g.bills} bill${g.bills === 1 ? '' : 's'}</small>
        </div>
        <div class="gr-goal">
          ${g.goal ? `<span>Monthly goal</span>
            <div class="gr-ring" style="--p:${Math.round(g.goal.progress * 100)}"><b>${Math.round(g.goal.progress * 100)}%</b></div>
            <small>${money(g.thisMonth)} of ${money(g.goal.target)} · <b class="${g.goal.onTrack ? 'ok' : 'behind'}">${g.goal.onTrack ? 'On track' : 'Push a little more'}</b></small>`
    : `<span>Monthly goal</span><p>Set a sales target and watch it fill up every day.</p><button class="btn primary" data-goal>${icon('star', 16)} Set a goal</button>`}
        </div>
        <div class="gr-badges">
          <div><i>${icon('zap', 18)}</i><span><b>${g.streak}-day</b> billing streak</span></div>
          <div><i>${icon('star', 18)}</i><span>Best day: <b>${g.bestDay ? money(g.bestDay.total) : '—'}</b>${g.bestDay ? ` <small>(${fmtDate(g.bestDay.date)})</small>` : ''}</span></div>
          <div class="gr-mile"><i>${icon('check', 18)}</i><span><b>${g.totalBills}</b> bills made · next milestone <b>${g.milestone.next}</b><em><u style="width:${Math.round(g.milestone.progress * 100)}%"></u></em></span></div>
        </div>
      </div>
      <div class="gr-lists">
        <div><h4>Best sellers this month</h4>${g.topItems.length ? g.topItems.map((x) => `<div class="gr-row"><span>${esc(x.name)}</span><i><u style="width:${(x.amount / maxItem) * 100}%"></u></i><b>${money(x.amount)}</b></div>`).join('') : '<p class="muted small">Your best sellers will show here.</p>'}</div>
        <div><h4>Top customers this month</h4>${g.topCustomers.length ? g.topCustomers.map((c) => `<div class="gr-row cust"><span class="who">${avatar(c.name)}<span>${esc(c.name)}<small>${c.bills} bill${c.bills === 1 ? '' : 's'}</small></span></span><b>${money(c.amount)}</b></div>`).join('') : '<p class="muted small">Add the customer name on bills to see who buys the most.</p>'}</div>
      </div>
    </section>` : ''}
    ${!empty && document.body.dataset.account ? inviteCardHTML(document.body.dataset.account, s.business.name, true) : ''}
    <section class="card">
      <div class="row-between"><h3>Recent documents</h3><a href="#/docs/all" class="see-all">See all ${icon('arrow', 14)}</a></div>
      ${recent.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Number</th><th>${esc(clientLabel())}</th><th>Date</th><th class="num">Amount</th><th>Status</th></tr></thead>
      <tbody>${recent.map(({ d, t, status }) => `<tr class="link" data-id="${d.id}"><td><b>${esc(d.number)}</b><div class="sub">${esc(DOC_TYPES[d.type].name)}</div></td>
        <td><span class="who">${avatar(d.client ? d.client.name : '?')}<span>${esc(d.client ? d.client.name : '—')}</span></span></td><td>${fmtDate(d.date)}</td><td class="num"><b>${money(t.payable)}</b></td><td>${badge(status)}</td></tr>`).join('')}</tbody></table></div>`
    : `<div class="dash-empty">${icon('file', 28)}<p>No documents yet. Your bills will show here.</p><a class="btn primary" href="#/pos">${icon('zap')} Make a bill now</a></div>`}
    </section>`;
  $$('tr.link', main).forEach((tr) => tr.addEventListener('click', () => navigate(`#/doc/${tr.dataset.id}`)));
  bindInvite(main);
  $$('[data-remind]', main).forEach((b) => b.addEventListener('click', async () => {
    const d = all('docs').find((x) => x.id === b.dataset.remind);
    if (d) { await sendReminder(d); dashboardView(main); }
  }));
  const goalBtn = $('#setGoal', main) || null;
  const openGoal = () => modal({
    title: 'Monthly sales goal', submit: 'Save goal',
    body: `<p class="muted">How much do you want to sell this month? BillX shows your progress every day and tells you if you are on track.</p>
      ${field('Goal (₹ per month)', `<input name="goal" inputmode="numeric" value="${esc(s.goal || '')}" placeholder="e.g. 200000">`)}
      <p class="muted small">Last month you billed ${money(g.lastSame)} by this date${g.projected ? `; you are on pace for ${money(g.projected)} this month` : ''}.</p>`,
    onSubmit: (fd) => {
      s.goal = Math.max(0, parseFloat(String(fd.get('goal')).replace(/[₹,\s]/g, '')) || 0);
      persist();
      flush();
      toast(s.goal ? `Goal set: ${money(s.goal)} a month` : 'Goal removed');
      dashboardView(main);
    },
  });
  if (goalBtn) goalBtn.addEventListener('click', openGoal);
  $$('[data-goal]', main).forEach((b) => b.addEventListener('click', openGoal));
  const cr = $('#createRepeats', main);
  if (cr) cr.addEventListener('click', () => {
    const made = repeats.flatMap((d) => createFromRepeat(d));
    toast(`${made.length} bill${made.length === 1 ? '' : 's'} created: ${made.map((d) => d.number).join(', ')}`);
    dashboardView(main);
  });
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
    <div class="ob-step"><span>1</span><h2>Your business</h2></div>
    <div class="grid g3">
      ${field('Business name', `<input name="name" placeholder="e.g. Sunrise Traders" value="${s.business.name === 'Your Business Name' ? '' : esc(s.business.name)}" autocomplete="organization">`)}
      ${field('State', `<select name="state">${options(STATES.map(([c, n]) => [c, n]), s.business.state)}</select>`)}
      ${field('Currency', `<select name="currency">${options(Object.keys(CURRENCIES).map((c) => [c, `${c} (${CURRENCIES[c].symbol})`]), s.currency)}</select>`)}
      ${field('Your UPI ID (optional)', `<input name="upi" placeholder="e.g. yourshop@okaxis" value="${esc(s.business.upiId || '')}" autocomplete="off">`, 'span2')}
    </div>
    <p class="muted small ob-upi-note">With a UPI ID every bill shows a scan-to-pay QR with the exact amount, and money goes straight to your bank. You can add it later in Settings.</p>
    <div class="ob-step"><span>2</span><h2>What kind of business?</h2></div>
    ${sectorPickerHTML(s.industry || 'general')}
    <div class="ob-bar">
      <p class="sp-info" id="spInfo">${sectorSummary(s.industry || 'general')}</p>
      <div class="row-gap wrap ob-actions">
        ${others.length ? `<button type="button" class="btn ghost" id="obCancel">Cancel</button>` : ''}
        <button class="btn" value="sample">${icon('eye')}<span class="hide-sm"> Explore with</span> sample data</button>
        <button class="btn primary" value="start">${icon('check')} Start billing</button>
      </div>
    </div>
  </form>`;
  const form = $('#ob', main);
  // Always start at the top (the browser would restore the old scroll position after a reload).
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  requestAnimationFrame(() => window.scrollTo(0, 0));
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
    const upi = String(fd.get('upi') || '').trim();
    if (/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upi)) s.business.upiId = upi;
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
