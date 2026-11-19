// Customers list, customer profile and the customer form.
import { settings, all, get, upsert, remove, setSettings } from './store.js';
import { customerStats, upcomingFor, segment, findCustomers, fmtDate, fmtTime, daysBetween, addDays, ago, priceOf, samePhone, serviceIdsOf } from './logic.js';
import { esc, icon, modal, toast, confirmBox, download, $, $$, initials } from './ui.js';
import { L, isOrders, money, whatOf, statusChip, message, waBtn, callBtn, svc, today, empty, vars } from './common.js';
import { openBooking, openAppt } from './booking.js';

const SEGMENTS = { all: 'All', regular: 'Regulars', active: 'Active', new: 'New', lapsed: 'Lapsed', lead: 'No visit yet' };

function rows() {
  const t = today();
  const s = settings();
  const appts = all('appts');
  const services = all('services');
  return all('customers').map((c) => {
    const st = customerStats(c.id, appts, services, s);
    const next = upcomingFor(c.id, appts, t)[0] || null;
    return { c, st, next, seg: segment(st, next, t, Number(s.lapsedDays) || 90) };
  });
}

export function customersView(main, rerender, q) {
  const seg = q.get('s') || 'all';
  const term = q.get('q') || '';
  const sort = q.get('o') || 'recent';
  const list = rows();
  const counts = Object.fromEntries(Object.keys(SEGMENTS).map((k) => [k, k === 'all' ? list.length : list.filter((r) => r.seg === k).length]));
  const found = new Set(findCustomers(term, list.map((r) => r.c)).map((c) => c.id));
  let shown = list.filter((r) => found.has(r.c.id) && (seg === 'all' || r.seg === seg));
  const by = {
    recent: (a, b) => (b.st.lastVisit || b.next?.date || '').localeCompare(a.st.lastVisit || a.next?.date || ''),
    visits: (a, b) => b.st.visits - a.st.visits,
    spent: (a, b) => b.st.spent - a.st.spent,
    name: (a, b) => a.c.name.localeCompare(b.c.name),
  };
  shown = shown.sort(by[sort] || by.recent);
  const url = (k, v) => { const p = new URLSearchParams({ s: seg, q: term, o: sort }); p.set(k, v); return `#/customers?${p}`; };
  main.innerHTML = `<section class="toolbar">
    <label class="search">${icon('search', 16)}<input id="cq" type="search" placeholder="Search name or phone" value="${esc(term)}"></label>
    <select id="co" aria-label="Sort">${[['recent', 'Recent'], ['visits', 'Most visits'], ['spent', 'Top spenders'], ['name', 'Name']].map(([k, v]) => `<option value="${k}" ${k === sort ? 'selected' : ''}>${v}</option>`).join('')}</select>
    <button class="btn" id="cExport">${icon('download', 16)} CSV</button>
    <button class="btn primary" id="cAdd">${icon('plus', 16)} Add</button>
  </section>
  <nav class="seg-tabs">${Object.entries(SEGMENTS).map(([k, v]) => `<a href="${url('s', k)}" class="${k === seg ? 'on' : ''}">${v} <span>${counts[k]}</span></a>`).join('')}</nav>
  ${shown.length ? `<ul class="people">${shown.map(({ c, st, next, seg: sg }) => `<li><a href="#/customer/${c.id}">
      <span class="av">${esc(initials(c.name))}</span>
      <span class="who"><b>${esc(c.name)}</b><small>${esc(c.phone || 'No phone')}</small></span>
      <span class="meta"><span>${st.visits} visit${st.visits === 1 ? '' : 's'} · ${money(st.spent)}</span><small>${next ? `Next ${esc(fmtDate(next.date, { weekday: false }))}` : st.lastVisit ? `Last ${esc(ago(daysBetween(st.lastVisit, today())))}` : ''}</small></span>
      <span class="chip ${{ regular: 'violet', lapsed: 'red', new: 'blue', active: 'green' }[sg] || ''}">${SEGMENTS[sg]}</span></a></li>`).join('')}</ul>`
    : empty(term || seg !== 'all' ? 'No matches' : `No ${L().customers.toLowerCase()} yet`, term ? '' : `They are added automatically when you book.`)}`;
  let timer;
  $('#cq').oninput = (e) => { clearTimeout(timer); timer = setTimeout(() => { history.replaceState(null, '', url('q', e.target.value)); rerender(); $('#cq').focus(); const v = $('#cq').value; $('#cq').setSelectionRange(v.length, v.length); }, 250); };
  $('#co').onchange = (e) => { location.hash = url('o', e.target.value); };
  $('#cAdd').onclick = () => customerForm(null, (c) => { location.hash = `#/customer/${c.id}`; });
  $('#cExport').onclick = () => {
    const cell = (v) => { const x = String(v ?? ''); return /[",\n]/.test(x) ? `"${x.replaceAll('"', '""')}"` : x; };
    const csv = [['Name', 'Phone', 'Email', 'Birthday', 'Visits', 'Spent', 'First visit', 'Last visit', 'Next booking', 'Segment', 'Notes'],
      ...list.map(({ c, st, next, seg: sg }) => [c.name, c.phone, c.email, c.birthday, st.visits, st.spent, st.firstVisit, st.lastVisit, next?.date || '', SEGMENTS[sg], c.notes])]
      .map((r) => r.map(cell).join(',')).join('\n');
    download(`bookx-${L().customers.toLowerCase()}-${today()}.csv`, csv, 'text/csv');
  };
}

export function customerView(main, rerender, id) {
  const c = get('customers', id);
  if (!c) { main.innerHTML = empty('Not found', '', '<a class="btn" href="#/customers">Back</a>'); return; }
  const s = settings();
  const t = today();
  const appts = all('appts');
  const services = all('services');
  const st = customerStats(c.id, appts, services, s);
  const mine = appts.filter((a) => a.customerId === c.id).sort((a, b) => b.date.localeCompare(a.date) || b.start - a.start);
  const upcoming = upcomingFor(c.id, appts, t);
  // Next due per service with a repeat gap.
  const lastBy = {};
  for (const a of mine) if (a.status === 'done') for (const sid of serviceIdsOf(a)) if (!lastBy[sid]) lastBy[sid] = a.date;
  const dues = Object.entries(lastBy).map(([sid, last]) => ({ sid, last, gap: Number(svc(sid)?.revisitDays) || 0 })).filter((x) => x.gap)
    .map((x) => ({ ...x, due: addDays(x.last, x.gap), left: daysBetween(t, addDays(x.last, x.gap)) })).sort((a, b) => a.left - b.left);
  const every = Number(s.loyalty.every) || 0;
  const stampsShown = every ? Math.min(st.stamps, every) : 0;

  main.innerHTML = `<a class="back" href="#/customers">${icon('back', 16)} ${esc(L().customers)}</a>
  <section class="profile card">
    <div class="p-top"><span class="av lg">${esc(initials(c.name))}</span>
      <div><h2>${esc(c.name)}</h2><p class="muted">${esc(c.phone || 'No phone')}${c.email ? ` · ${esc(c.email)}` : ''}${c.birthday ? ` · 🎂 ${esc(fmtDate(`2000-${c.birthday.slice(-5)}`, { weekday: false }))}` : ''}</p>
      ${c.tags?.length ? `<p>${c.tags.map((x) => `<span class="chip">${esc(x)}</span>`).join(' ')}</p>` : ''}${c.optOut ? '<p><span class="chip red">No reminders</span></p>' : ''}</div>
      <div class="row">${callBtn(c)}${waBtn(c, `Hi ${vars(c).name}, `, { label: 'Chat' })}<button class="btn" id="pEdit">${icon('edit', 16)} Edit</button><button class="btn primary" id="pBook">${icon('plus', 16)} Book</button></div>
    </div>
    <div class="kpis small">
      <div class="kpi"><small>Visits</small><b>${st.visits}</b></div>
      <div class="kpi"><small>Spent</small><b>${money(st.spent)}</b></div>
      <div class="kpi"><small>Last visit</small><b>${st.lastVisit ? esc(fmtDate(st.lastVisit, { weekday: false })) : '—'}</b></div>
      <div class="kpi"><small>Comes every</small><b>${st.avgGap ? `${st.avgGap} days` : '—'}</b></div>
      <div class="kpi"><small>No-shows</small><b>${st.noShows}</b></div>
    </div>
    ${s.loyalty.enabled && every ? `<div class="stamps"><span>Loyalty card</span><div>${Array.from({ length: every }, (_, i) => `<i class="${i < stampsShown ? 'on' : ''}">${i < stampsShown ? '★' : i + 1}</i>`).join('')}</div>
      ${st.rewardReady ? `<b class="good">Reward ready: ${esc(s.loyalty.reward)}</b> <button class="btn small" id="pRedeem">Mark used</button>` : `<small>${every - st.stamps} more for ${esc(s.loyalty.reward)}</small>`}</div>` : ''}
    ${c.notes ? `<p class="notes">${esc(c.notes)}</p>` : ''}
  </section>
  <div class="cols">
    <section class="card"><header class="card-h"><h3>History</h3><span class="count">${mine.length}</span></header>
      ${mine.length ? `<ul class="appts">${mine.map((a) => `<li class="appt s-${a.status}" data-appt="${a.id}"><span class="when"><b>${esc(fmtDate(a.date, { weekday: false, year: a.date.slice(0, 4) !== t.slice(0, 4) }))}</b><small>${fmtTime(a.start)}</small></span><span class="who"><b>${esc(whatOf(a))}</b><small>${money(priceOf(a, services))}${a.notes ? ` · ${esc(a.notes)}` : ''}</small></span><span class="end">${statusChip(a.status)}</span></li>`).join('')}</ul>` : empty('No visits yet')}
    </section>
    <section class="card"><header class="card-h"><h3>Coming up & due</h3></header>
      ${upcoming.map((a) => `<p class="due-row" data-appt="${a.id}">${icon('calendar', 16)} <b>${esc(fmtDate(a.date))} ${fmtTime(a.start)}</b> · ${esc(whatOf(a))}</p>`).join('')}
      ${dues.map((d) => `<p class="due-row">${icon('repeat', 16)} <span><b>${esc(svc(d.sid)?.name || '')}</b> ${d.left < 0 ? `<span class="bad">${-d.left} days overdue</span>` : `due ${esc(fmtDate(d.due, { weekday: false }))}`}</span>
        ${upcoming.length ? '' : waBtn(c, message('revisit', c, null, { service: svc(d.sid)?.name || '', last: fmtDate(d.last, { weekday: false }) }), { label: 'Invite', cls: 'small' })}</p>`).join('')}
      ${!upcoming.length && !dues.length ? '<p class="muted">Nothing booked. Set a repeat gap on services to get reminders.</p>' : ''}
    </section>
  </div>
  <p class="row"><button class="btn ghost-bad" id="pDel">${icon('trash', 16)} Delete ${esc(L().customer.toLowerCase())}</button></p>`;
  $('#pEdit').onclick = () => customerForm(c, rerender);
  $('#pBook').onclick = () => openBooking({ customerId: c.id, prefill: mine[0] ? { serviceIds: mine[0].serviceIds, items: mine[0].items } : {} });
  $('#pRedeem')?.addEventListener('click', () => { setSettings((x) => { x.redeemed = { ...x.redeemed, [c.id]: (Number(x.redeemed?.[c.id]) || 0) + 1 }; }); toast('Reward marked as used'); rerender(); });
  $$('[data-appt]', main).forEach((el) => { el.onclick = () => openAppt(el.dataset.appt); });
  $('#pDel').onclick = async () => {
    const n = mine.length;
    if (!(await confirmBox(`Delete ${c.name}${n ? ` and their ${n} booking${n === 1 ? '' : 's'}` : ''}? This cannot be undone.`, { ok: 'Delete', danger: true }))) return;
    for (const a of mine) remove('appts', a.id);
    remove('customers', c.id);
    location.hash = '#/customers';
  };
}

export function customerForm(c, done) {
  const x = c || { name: '', phone: '', email: '', birthday: '', anniversary: '', notes: '', tags: [] };
  const md = (v) => (v ? `2000-${String(v).slice(-5)}` : '');
  const m = modal(c ? `Edit ${L().customer.toLowerCase()}` : `Add ${L().customer.toLowerCase()}`, `<form class="form" id="cf">
    <div class="grid2"><label>Name<input name="name" required value="${esc(x.name)}"></label><label>Phone (WhatsApp)<input name="phone" type="tel" value="${esc(x.phone || '')}"></label></div>
    <div class="grid2"><label>Birthday<input type="date" name="birthday" value="${md(x.birthday)}"><small>Year is ignored</small></label><label>Anniversary<input type="date" name="anniversary" value="${md(x.anniversary)}"></label></div>
    <div class="grid2"><label>Email<input type="email" name="email" value="${esc(x.email || '')}"></label><label>Tags (comma separated)<input name="tags" value="${esc((x.tags || []).join(', '))}" placeholder="VIP, sensitive skin"></label></div>
    <label>Notes${isOrders() ? ' (usual order, allergies…)' : ' (preferences, history, allergies…)'}<textarea name="notes" rows="3">${esc(x.notes || '')}</textarea></label>
    <label class="inline"><input type="checkbox" name="optOut" ${x.optOut ? 'checked' : ''}> Do not send reminders</label>
    <div class="row end"><button type="button" class="btn" data-close>Cancel</button><button class="btn primary">Save</button></div></form>`);
  const f = $('#cf', m.el);
  f.onsubmit = (e) => {
    e.preventDefault();
    const phone = f.phone.value.trim();
    const dup = phone && all('customers').find((o) => o.id !== x.id && samePhone(o.phone, phone));
    if (dup) return toast(`${dup.name} already has this number.`, 'bad');
    const saved = upsert('customers', {
      ...x, name: f.name.value.trim(), phone, email: f.email.value.trim(),
      birthday: f.birthday.value ? f.birthday.value.slice(5) : '', anniversary: f.anniversary.value ? f.anniversary.value.slice(5) : '',
      tags: f.tags.value.split(',').map((v) => v.trim()).filter(Boolean), notes: f.notes.value.trim(), optOut: f.optOut.checked,
    });
    m.close();
    toast('Saved');
    done?.(saved);
  };
}
