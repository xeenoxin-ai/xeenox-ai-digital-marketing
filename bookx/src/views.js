// Today, Calendar and Reminders.
import { settings, all, patch, markSent } from './store.js';
import { fmtDate, fmtTime, relDate, addDays, daysBetween, dayWindow, priceOf, revisitsDue, lapsed, occasionsDue, remindersDue, UPCOMING, ago, weekday, DAY_NAMES, endOf } from './logic.js';
import { esc, icon, $, $$, toast } from './ui.js';
import { L, isOrders, money, whatOf, statusChip, message, waBtn, callBtn, customerOf, staffOf, svc, today, nowMin, empty } from './common.js';
import { openBooking, openAppt } from './booking.js';

const sortAppts = (xs) => xs.sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start);
const staffColor = (id) => staffOf(id)?.color || 'var(--brand)';

function apptRow(a, { showDate = false, quick = true } = {}) {
  const c = customerOf(a.customerId);
  const late = a.date === today() && UPCOMING.has(a.status) && a.start + 10 < nowMin();
  const next = { booked: 'arrived', confirmed: 'arrived', arrived: 'done' }[a.status];
  return `<li class="appt s-${a.status} ${late ? 'late' : ''}" data-appt="${a.id}" style="--c:${staffColor(a.staffId)}">
    <span class="when"><b>${fmtTime(a.start)}</b>${showDate ? `<small>${esc(relDate(a.date, today()))}</small>` : a.duration ? `<small>${a.duration} min</small>` : ''}</span>
    <span class="who"><b>${esc(c?.name || 'Unknown')}${a.token ? ` <span class="token">#${a.token}</span>` : ''}</b><small>${esc(whatOf(a))}${a.staffId ? ` · ${esc(staffOf(a.staffId)?.name || '')}` : ''}${a.notes ? ` · ${esc(a.notes.slice(0, 40))}` : ''}</small></span>
    <span class="end">${late ? '<span class="chip red">Late</span>' : statusChip(a.status)}${quick && next ? `<button class="btn small" data-next="${next}" data-id="${a.id}">${next === 'done' ? (isOrders() ? 'Picked up' : 'Done') : isOrders() ? 'Ready' : 'Arrived'}</button>` : ''}</span>
  </li>`;
}

function wireRows(root, rerender) {
  root.addEventListener('click', (e) => {
    const q = e.target.closest('[data-next]');
    if (q) {
      e.stopPropagation();
      patch('appts', q.dataset.id, { status: q.dataset.next });
      toast(q.dataset.next === 'done' ? 'Done ✓' : 'Checked in');
      rerender();
      return;
    }
    if (e.target.closest('a,button,input,select')) return;
    const row = e.target.closest('[data-appt]');
    if (row) openAppt(row.dataset.appt);
  });
}

// ---------------- Today ----------------

export function todayView(main, rerender) {
  const t = today();
  const s = settings();
  const appts = all('appts');
  const list = sortAppts(appts.filter((a) => a.date === t && a.status !== 'cancelled'));
  const upcoming = sortAppts(appts.filter((a) => a.date > t && a.date <= addDays(t, 6) && UPCOMING.has(a.status)));
  const done = list.filter((a) => a.status === 'done');
  const expected = list.filter((a) => a.status !== 'noshow').reduce((n, a) => n + priceOf(a, all('services')), 0);
  const todo = reminderGroups();
  const pending = todo.reduce((n, g) => n + g.rows.filter((r) => !r.sentOn).length, 0);
  const win = dayWindow(s, t);
  const tips = [
    !s.business.phone && ['Add your WhatsApp number', 'Customers send booking requests to it.', '#/settings'],
    !all('customers').length && ['Add your first booking', 'Or try the sample data from Settings.', ''],
    !s.booking.shared && ['Share your booking link', 'Put it on Instagram, Google and WhatsApp status.', '#/share'],
  ].filter(Boolean);

  main.innerHTML = `
  <section class="hello">
    <div><h2>${esc(fmtDate(t, { year: true }))}</h2><p class="muted">${win ? `Open ${fmtTime(win.from)} – ${fmtTime(win.to)}` : 'Closed today'}${s.business.name ? ` · ${esc(s.business.name)}` : ''}</p></div>
    <div class="row"><button class="btn" id="walkin">${icon('walk', 16)} Walk-in</button><button class="btn primary" id="newB">${icon('plus', 16)} New ${esc(L().booking.toLowerCase())}</button></div>
  </section>
  <section class="kpis">
    <div class="kpi"><small>Today</small><b>${list.length}</b><span>${esc(L().booking.toLowerCase())}s</span></div>
    <div class="kpi"><small>${isOrders() ? 'Picked up' : 'Done'}</small><b>${done.length}</b><span>of ${list.length}</span></div>
    <div class="kpi"><small>Expected</small><b>${money(expected)}</b><span>today</span></div>
    <a class="kpi link" href="#/reminders"><small>To send</small><b>${pending}</b><span>reminders ›</span></a>
  </section>
  ${tips.length ? `<section class="tips">${tips.map(([h, p, href]) => `<a class="tip" href="${href || '#/'}" ${href ? '' : 'data-new'}><b>${esc(h)}</b><span>${esc(p)}</span></a>`).join('')}</section>` : ''}
  <div class="cols">
    <section class="card">
      <header class="card-h"><h3>Today's ${esc(isOrders() ? 'orders' : 'schedule')}</h3><a href="#/calendar">Calendar ›</a></header>
      ${list.length ? `<ul class="appts" id="todayList">${list.map((a) => apptRow(a)).join('')}</ul>` : empty(`No ${L().booking.toLowerCase()}s today`, win ? 'Add one, or share your booking link.' : 'Enjoy the day off.')}
      ${upcoming.length ? `<h4 class="sub">Next 6 days</h4><ul class="appts" id="nextList">${upcoming.slice(0, 12).map((a) => apptRow(a, { showDate: true, quick: false })).join('')}</ul>` : ''}
    </section>
    <section class="card">
      <header class="card-h"><h3>Bring them back</h3><a href="#/reminders">All ›</a></header>
      ${todo.some((g) => g.rows.length) ? todo.filter((g) => g.rows.length).map((g) => `<h4 class="sub">${esc(g.title)} <span class="count">${g.rows.length}</span></h4><ul class="rem">${g.rows.slice(0, 3).map(g.row).join('')}</ul>`).join('') : empty('All caught up', 'Repeat-visit reminders show up here when customers are due.')}
    </section>
  </div>`;
  $('#newB').onclick = () => openBooking();
  $('#walkin').onclick = () => openBooking({ walkin: true });
  $$('[data-new]').forEach((x) => { x.onclick = (e) => { e.preventDefault(); openBooking(); }; });
  wireRows(main, rerender);
  wireReminders(main, rerender);
}

// ---------------- Calendar ----------------

const PX = 1.4; // pixels per minute

export function calendarView(main, rerender, q) {
  const date = q.get('d') || today();
  const view = q.get('v') || (innerWidth < 700 ? 'day' : 'day');
  const s = settings();
  const nav = (d, v = view) => `#/calendar?d=${d}&v=${v}`;
  const step = view === 'week' ? 7 : 1;
  const head = `<section class="cal-head">
    <div class="row"><a class="icon-btn" href="${nav(addDays(date, -step))}" aria-label="Previous">${icon('left')}</a>
    <input type="date" id="calDate" value="${date}" aria-label="Date"><a class="icon-btn" href="${nav(addDays(date, step))}" aria-label="Next">${icon('right')}</a>
    <a class="btn small" href="${nav(today())}">Today</a></div>
    <div class="row"><div class="seg"><a href="${nav(date, 'day')}" class="${view === 'day' ? 'on' : ''}">Day</a><a href="${nav(date, 'week')}" class="${view === 'week' ? 'on' : ''}">Week</a><a href="${nav(date, 'list')}" class="${view === 'list' ? 'on' : ''}">List</a></div>
    <button class="btn primary" id="calNew">${icon('plus', 16)} New</button></div></section>`;

  let body = '';
  const appts = all('appts').filter((a) => a.status !== 'cancelled');
  if (view === 'week') {
    const startD = addDays(date, -((weekday(date) + 6) % 7)); // Monday
    body = `<div class="week">${Array.from({ length: 7 }, (_, i) => {
      const d = addDays(startD, i);
      const xs = sortAppts(appts.filter((a) => a.date === d));
      const closed = !dayWindow(s, d);
      return `<div class="wday ${d === today() ? 'is-today' : ''} ${closed ? 'closed' : ''}"><a class="wd-h" href="${nav(d, 'day')}"><b>${DAY_NAMES[weekday(d)].slice(0, 3)}</b> ${Number(d.slice(8))}<small>${xs.length ? `${xs.length}` : closed ? 'closed' : ''}</small></a>
        <ul>${xs.map((a) => `<li data-appt="${a.id}" class="s-${a.status}" style="--c:${staffColor(a.staffId)}"><b>${fmtTime(a.start)}</b> ${esc(customerOf(a.customerId)?.name || '')}<small>${esc(whatOf(a))}</small></li>`).join('')}</ul>
        <button class="add" data-add="${d}" aria-label="Add on ${esc(fmtDate(d))}">+</button></div>`;
    }).join('')}</div>`;
  } else if (view === 'list') {
    const xs = sortAppts(appts.filter((a) => a.date >= date && a.date <= addDays(date, 30)));
    body = xs.length ? `<section class="card"><ul class="appts">${xs.map((a) => apptRow(a, { showDate: true, quick: false })).join('')}</ul></section>` : empty('Nothing booked in the next 30 days');
  } else {
    const win = dayWindow(s, date);
    const xs = sortAppts(appts.filter((a) => a.date === date));
    const from = Math.min(win?.from ?? 540, ...xs.map((a) => a.start));
    const to = Math.max(win?.to ?? 1080, ...xs.map((a) => endOf(a) || a.start + 30));
    const top = Math.floor(from / 60) * 60;
    const bottom = Math.ceil(to / 60) * 60;
    const orders = isOrders();
    const staff = orders ? [] : all('staff').filter((x) => !x.off || xs.some((a) => a.staffId === x.id));
    const cols = staff.length ? staff : [{ id: '', name: orders ? 'Pickups' : s.business.name || 'Bookings' }];
    const hoursCol = Array.from({ length: (bottom - top) / 60 }, (_, i) => `<div class="hr" style="top:${i * 60 * PX}px">${fmtTime(top + i * 60).replace(':00', '')}</div>`).join('');
    const shade = (win ? [[top, win.from], [win.to, bottom], ...win.breaks] : [[top, bottom]]).filter(([a, b]) => b > a)
      .map(([a, b]) => `<div class="off" style="top:${(a - top) * PX}px;height:${(b - a) * PX}px"></div>`).join('');
    const nowLine = date === today() && nowMin() >= top && nowMin() <= bottom ? `<div class="now" style="top:${(nowMin() - top) * PX}px"></div>` : '';
    // In order mode, stack orders in the same slot side by side.
    const block = (a, i, n) => {
      const h = Math.max(orders ? 26 : 24, (a.duration || 20) * PX - 2);
      return `<div class="blk s-${a.status}" data-appt="${a.id}" style="top:${(a.start - top) * PX}px;height:${h}px;--c:${staffColor(a.staffId)};${n > 1 ? `left:${(i / n) * 100}%;width:${100 / n}%` : ''}">
        <b>${fmtTime(a.start)} ${esc(customerOf(a.customerId)?.name || '')}</b><small>${esc(whatOf(a))}</small></div>`;
    };
    body = `${!win ? `<p class="banner">Closed on ${esc(fmtDate(date))}. You can still add a ${esc(L().booking.toLowerCase())}.</p>` : ''}
    <div class="day-grid" style="--cols:${cols.length}">
      <div class="dg-head"><span></span>${cols.map((c) => `<span style="--c:${c.color || 'var(--brand)'}">${esc(c.name)}</span>`).join('')}</div>
      <div class="dg-body" style="height:${(bottom - top) * PX}px"><div class="hours">${hoursCol}</div>
      ${cols.map((c) => {
        const mine = xs.filter((a) => (staff.length ? a.staffId === c.id : true));
        const placed = mine.map((a) => {
          const group = orders ? mine.filter((b) => Math.floor(b.start / (s.step || 15)) === Math.floor(a.start / (s.step || 15))) : mine.filter((b) => b.start < endOf(a) && a.start < endOf(b));
          return block(a, group.indexOf(a), group.length);
        }).join('');
        return `<div class="col" data-staff="${c.id}" data-top="${top}">${shade}${Array.from({ length: (bottom - top) / 60 }, (_, i) => `<div class="line" style="top:${i * 60 * PX}px"></div>`).join('')}${placed}${nowLine}</div>`;
      }).join('')}</div></div>
      <p class="muted small">Tap an empty space to book that time. Tap a booking to change it.</p>`;
  }
  main.innerHTML = head + body;
  $('#calDate').onchange = (e) => { if (e.target.value) location.hash = nav(e.target.value); };
  $('#calNew').onclick = () => openBooking({ date });
  main.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]');
    if (add) return openBooking({ date: add.dataset.add });
    const blk = e.target.closest('[data-appt]');
    if (blk) return openAppt(blk.dataset.appt);
    const col = e.target.closest('.col');
    if (col && !e.target.closest('.blk')) {
      const y = e.clientY - col.getBoundingClientRect().top;
      const st = s.step || 15;
      const start = Number(col.dataset.top) + Math.floor(y / PX / st) * st;
      openBooking({ date, start, staffId: col.dataset.staff || '' });
    }
  });
  if (date === today()) setTimeout(() => $('.now')?.scrollIntoView({ block: 'center' }), 50);
}

// ---------------- Reminders ----------------

function reminderGroups() {
  const s = settings();
  const t = today();
  const customers = all('customers');
  const appts = all('appts');
  const services = all('services');
  const row = (r, title, detail, text, { book = true, snooze = true } = {}) => `<li class="rem-row" data-cid="${r.customer.id}">
    <span class="who"><a href="#/customer/${r.customer.id}"><b>${esc(r.customer.name)}</b></a><small>${detail}</small></span>
    <span class="end">${r.sentOn ? `<span class="chip green">Sent ${esc(relDate(r.sentOn, t).toLowerCase())}</span>` : ''}
      ${waBtn(r.customer, text, { label: r.sentOn ? 'Again' : title, sent: r.key, cls: r.sentOn ? '' : 'primary' })}
      ${book ? `<button class="btn small" data-book="${r.customer.id}" data-sid="${r.serviceId || ''}">Book</button>` : ''}
      ${snooze ? `<button class="icon-btn" data-snooze="${r.customer.id}" title="Hide for 2 weeks" aria-label="Snooze">${icon('moon', 16)}</button>` : ''}</span></li>`;
  const tomorrow = remindersDue({ appts, customers, today: t, days: Number(s.reminderDays) || 1 });
  const rv = revisitsDue({ customers, appts, services, today: t, window: Number(s.revisitWindow) || 7 });
  const oc = occasionsDue({ customers, today: t, lead: Number(s.occasionLead) || 7 });
  const lp = lapsed({ customers, appts, today: t, days: Number(s.lapsedDays) || 90 });
  return [
    { id: 'tomorrow', title: `${L().booking} reminders`, help: 'Upcoming bookings. A reminder the day before cuts no-shows.', rows: tomorrow.map((r) => ({ ...r, sentOn: r.appt.remindedOn || '' })),
      row: (r) => row(r, 'Remind', `${esc(relDate(r.appt.date, t))} ${fmtTime(r.appt.start)} · ${esc(whatOf(r.appt))}`, message(isOrders() ? 'order' : 'reminder', r.customer, r.appt), { book: false, snooze: false }).replace(`data-sent="${r.key}"`, `data-sent="${r.key}" data-appt-rem="${r.appt.id}"`) },
    { id: 'revisit', title: 'Due for a repeat visit', help: 'Last visit + the service’s repeat gap. Rows hide once they book.', rows: rv,
      row: (r) => row(r, 'Invite', `${esc(svc(r.serviceId)?.name || '')} · last ${esc(fmtDate(r.lastDate, { weekday: false }))} · ${r.daysLeft < 0 ? `<b class="bad">${-r.daysLeft} days overdue</b>` : r.daysLeft === 0 ? '<b>due today</b>' : `due in ${r.daysLeft} days`}`, message('revisit', r.customer, null, { service: svc(r.serviceId)?.name || '', last: fmtDate(r.lastDate, { weekday: false }) })) },
    { id: 'occasion', title: 'Birthdays & occasions', help: 'Wish them and offer a slot or an order.', rows: oc,
      row: (r) => row(r, 'Wish', `${esc(r.label)} · ${r.daysLeft === 0 ? '<b>today</b>' : `${esc(fmtDate(r.on))} (in ${r.daysLeft} days)`}`, message('occasion', r.customer, null, { occasion: r.label, date: fmtDate(r.on, { weekday: false }) })) },
    { id: 'winback', title: 'Win back', help: `No visit for ${s.lapsedDays} days and nothing booked.`, rows: lp,
      row: (r) => row(r, 'Message', `last visit ${esc(ago(r.days))}`, message('winback', r.customer, null, { days: r.days })) },
  ];
}

function wireReminders(root, rerender) {
  root.addEventListener('click', (e) => {
    const sent = e.target.closest('[data-sent]');
    if (sent) {
      const row = sent.closest('[data-cid]');
      if (sent.dataset.apptRem) patch('appts', sent.dataset.apptRem, { remindedOn: today() });
      else if (row) markSent(row.dataset.cid, sent.dataset.sent);
      setTimeout(rerender, 300);
      return;
    }
    const book = e.target.closest('[data-book]');
    if (book) {
      const sid = book.dataset.sid;
      openBooking({ customerId: book.dataset.book, prefill: sid ? (isOrders() ? { items: [{ serviceId: sid, qty: 1 }] } : { serviceIds: [sid] }) : {} });
      return;
    }
    const sn = e.target.closest('[data-snooze]');
    if (sn) {
      patch('customers', sn.dataset.snooze, { snoozeUntil: addDays(today(), 14) });
      toast('Hidden for 2 weeks');
      rerender();
    }
  });
}

export function remindersView(main, rerender) {
  const groups = reminderGroups();
  main.innerHTML = `<p class="lead">Tap a green button: WhatsApp opens with the message ready. Press send, come back, and tap the next one. Rows are marked as sent.</p>
  <nav class="tabs">${groups.map((g) => `<a href="#rem-${g.id}">${esc(g.title)} <span class="count">${g.rows.filter((r) => !r.sentOn).length}</span></a>`).join('')}</nav>
  ${groups.map((g) => `<section class="card" id="rem-${g.id}"><header class="card-h"><h3>${esc(g.title)}</h3><span class="count">${g.rows.length}</span></header><p class="muted small">${esc(g.help)}</p>
    ${g.rows.length ? `<ul class="rem">${g.rows.map(g.row).join('')}</ul>` : empty('Nothing here right now')}</section>`).join('')}
  <p class="muted small">Change the messages in Settings → Messages. Repeat gaps are set per service.</p>`;
  $$('.tabs a').forEach((a) => { a.onclick = (e) => { e.preventDefault(); $(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' }); }; });
  wireReminders(main, rerender);
}
