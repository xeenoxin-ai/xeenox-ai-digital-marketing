// Services, team, reports, settings, booking link, request import and first-run setup.
import QRCode from 'qrcode';
import { settings, all, get, upsert, remove, setSettings, db, replaceAll, reset, fromPreset, addSampleData, clearSampleData, hasSampleData, save, uid } from './store.js';
import { report, fmtDate, fmtTime, addDays, DAY_NAMES, priceOf, freeSlots, durationOf, samePhone, ymd, toMin } from './logic.js';
import { PRESETS, PALETTE, DEFAULT_TEMPLATES, preset } from './presets.js';
import { bookingPayload, encode, decode, readRequest } from './codec.js';
import { esc, icon, modal, toast, confirmBox, download, copyText, $, $$ } from './ui.js';
import { L, isOrders, money, whatOf, today, empty, waHref, customerOf } from './common.js';
import { openBooking } from './booking.js';

// ---------------- Services ----------------

export function servicesView(main, rerender) {
  const orders = isOrders();
  const list = all('services');
  const cats = [...new Set(list.map((s) => s.category || ''))];
  main.innerHTML = `<p class="lead">${orders ? 'Products customers can order.' : 'What customers can book.'} <b>Repeat after</b> is how many days until the customer should come back; BookX reminds you when it is due.</p>
  <div class="row end"><button class="btn primary" id="sAdd">${icon('plus', 16)} Add ${orders ? 'product' : 'service'}</button></div>
  ${list.length ? cats.map((c) => `<section class="card"><header class="card-h"><h3>${esc(c || 'Other')}</h3></header><table class="tbl"><thead><tr><th>Name</th>${orders ? '' : '<th>Minutes</th>'}<th>Price</th><th>Repeat after</th><th></th></tr></thead><tbody>
    ${list.filter((s) => (s.category || '') === c).map((s) => `<tr data-id="${s.id}" class="${s.hidden ? 'dim' : ''}"><td><b>${esc(s.name)}</b>${s.hidden ? ' <span class="chip">Hidden online</span>' : ''}</td>${orders ? '' : `<td>${s.duration || '—'}</td>`}<td>${money(s.price)}</td><td>${s.revisitDays ? `${s.revisitDays} days` : '<span class="muted">—</span>'}</td><td class="r"><button class="icon-btn" data-edit="${s.id}" aria-label="Edit">${icon('edit', 16)}</button></td></tr>`).join('')}
    </tbody></table></section>`).join('') : empty('No services yet')}`;
  $('#sAdd').onclick = () => serviceForm(null, rerender);
  $$('[data-edit]', main).forEach((b) => { b.onclick = () => serviceForm(get('services', b.dataset.edit), rerender); });
  $$('tr[data-id]', main).forEach((r) => { r.ondblclick = () => serviceForm(get('services', r.dataset.id), rerender); });
}

function serviceForm(s, done) {
  const orders = isOrders();
  const x = s || { name: '', category: '', duration: orders ? 0 : 30, price: 0, revisitDays: 0 };
  const cats = [...new Set(all('services').map((v) => v.category).filter(Boolean))];
  const m = modal(s ? 'Edit' : `Add ${orders ? 'product' : 'service'}`, `<form class="form" id="sf">
    <label>Name<input name="name" required value="${esc(x.name)}"></label>
    <div class="grid2"><label>Category<input name="category" list="cats" value="${esc(x.category || '')}"><datalist id="cats">${cats.map((c) => `<option value="${esc(c)}">`).join('')}</datalist></label>
    <label>Price<input type="number" name="price" min="0" step="1" value="${x.price}"></label></div>
    <div class="grid2">${orders ? '' : `<label>Minutes<input type="number" name="duration" min="5" step="5" value="${x.duration}" required></label>`}
    <label>Repeat after (days)<input type="number" name="revisitDays" min="0" step="1" value="${x.revisitDays || 0}"><small>0 = no reminder. Haircut ~30, facial ~30, dental cleaning ~180, birthday cake 365.</small></label></div>
    <label class="inline"><input type="checkbox" name="hidden" ${x.hidden ? 'checked' : ''}> Hide from the online booking page</label>
    <div class="row end">${s ? '<button type="button" class="btn ghost-bad" id="sDel">Delete</button>' : ''}<span class="grow"></span><button type="button" class="btn" data-close>Cancel</button><button class="btn primary">Save</button></div></form>`);
  const f = $('#sf', m.el);
  f.onsubmit = (e) => {
    e.preventDefault();
    upsert('services', { ...x, name: f.name.value.trim(), category: f.category.value.trim(), price: Number(f.price.value) || 0, duration: orders ? 0 : Number(f.duration.value) || 30, revisitDays: Number(f.revisitDays.value) || 0, hidden: f.hidden.checked });
    m.close();
    done();
  };
  $('#sDel', m.el)?.addEventListener('click', async () => {
    if (!(await confirmBox(`Delete ${x.name}? Past bookings keep their price; tip: hide it instead.`, { ok: 'Delete', danger: true }))) return;
    remove('services', x.id);
    m.close();
    done();
  });
}

// ---------------- Team ----------------

export function staffView(main, rerender) {
  const list = all('staff');
  main.innerHTML = `<p class="lead">Each ${esc(L().staff.toLowerCase())} has their own column in the calendar, so two people can be booked at the same time. Leave hours empty to use the business hours.</p>
  <div class="row end"><button class="btn primary" id="tAdd">${icon('plus', 16)} Add ${esc(L().staff.toLowerCase())}</button></div>
  ${list.length ? `<ul class="people">${list.map((x) => `<li><a href="#" data-edit="${x.id}"><span class="av" style="background:${x.color}">${esc(x.name[0] || '?')}</span>
    <span class="who"><b>${esc(x.name)}</b><small>${x.days ? x.days.map((d) => DAY_NAMES[d].slice(0, 3)).join(', ') : 'Every open day'}${x.from || x.to ? ` · ${esc(x.from || 'open')}–${esc(x.to || 'close')}` : ''}</small></span>
    ${x.off ? '<span class="chip">Inactive</span>' : ''}</a></li>`).join('')}</ul>` : empty(`No ${L().staff.toLowerCase()}s`, 'Without anyone here, the business is booked as one chair.')}`;
  $('#tAdd').onclick = () => staffForm(null, rerender);
  $$('[data-edit]', main).forEach((b) => { b.onclick = (e) => { e.preventDefault(); staffForm(get('staff', b.dataset.edit), rerender); }; });
}

function staffForm(s, done) {
  const x = s || { name: '', color: PALETTE[all('staff').length % PALETTE.length], days: null, from: '', to: '' };
  const days = x.days || [0, 1, 2, 3, 4, 5, 6];
  const m = modal(s ? `Edit ${L().staff.toLowerCase()}` : `Add ${L().staff.toLowerCase()}`, `<form class="form" id="tf">
    <div class="grid2"><label>Name<input name="name" required value="${esc(x.name)}"></label><label>Colour<input type="color" name="color" value="${x.color}"></label></div>
    <div class="days">${DAY_NAMES.map((d, i) => `<label class="pick"><input type="checkbox" name="d" value="${i}" ${days.includes(i) ? 'checked' : ''}><span>${d.slice(0, 3)}</span></label>`).join('')}</div>
    <div class="grid2"><label>Starts<input type="time" name="from" value="${esc(x.from || '')}"></label><label>Ends<input type="time" name="to" value="${esc(x.to || '')}"></label></div>
    <label class="inline"><input type="checkbox" name="off" ${x.off ? 'checked' : ''}> Inactive (on leave / left)</label>
    <div class="row end">${s ? '<button type="button" class="btn ghost-bad" id="tDel">Delete</button>' : ''}<span class="grow"></span><button type="button" class="btn" data-close>Cancel</button><button class="btn primary">Save</button></div></form>`);
  const f = $('#tf', m.el);
  f.onsubmit = (e) => {
    e.preventDefault();
    const picked = $$('input[name=d]:checked', f).map((i) => Number(i.value));
    upsert('staff', { ...x, name: f.name.value.trim(), color: f.color.value, days: picked.length === 7 ? null : picked, from: f.from.value, to: f.to.value, off: f.off.checked });
    m.close();
    done();
  };
  $('#tDel', m.el)?.addEventListener('click', async () => {
    if (!(await confirmBox(`Delete ${x.name}? Their bookings stay but become unassigned.`, { ok: 'Delete', danger: true }))) return;
    remove('staff', x.id);
    for (const a of all('appts')) if (a.staffId === x.id) a.staffId = '';
    save();
    m.close();
    done();
  });
}

// ---------------- Reports ----------------

export function reportsView(main, rerender, q) {
  const days = Number(q.get('r')) || 30;
  const to = today();
  const from = addDays(to, -(days - 1));
  const r = report({ appts: all('appts'), customers: all('customers'), services: all('services'), staff: all('staff'), from, to });
  const prev = report({ appts: all('appts'), customers: all('customers'), services: all('services'), staff: all('staff'), from: addDays(from, -days), to: addDays(from, -1) });
  const pct = (v) => `${Math.round(v * 100)}%`;
  const delta = (a, b) => (b ? `<em class="${a >= b ? 'up' : 'down'}">${a >= b ? '▲' : '▼'} ${Math.abs(Math.round(((a - b) / b) * 100))}%</em>` : '');
  const bucket = days > 60 ? 7 : 1;
  const bars = [];
  for (let i = 0; i < r.byDay.length; i += bucket) {
    const xs = r.byDay.slice(i, i + bucket);
    bars.push({ date: xs[0].date, revenue: xs.reduce((n, d) => n + d.revenue, 0), visits: xs.reduce((n, d) => n + d.visits, 0) });
  }
  const maxBar = Math.max(1, ...bars.map((b) => b.revenue));
  const maxHour = Math.max(1, ...r.hours);
  const openHours = r.hours.map((n, h) => ({ n, h })).filter((x) => x.n > 0 || (x.h >= 8 && x.h <= 21));
  main.innerHTML = `<section class="toolbar"><div class="seg">${[7, 30, 90, 365].map((d) => `<a href="#/reports?r=${d}" class="${d === days ? 'on' : ''}">${d === 365 ? '1 year' : `${d} days`}</a>`).join('')}</div>
    <span class="muted small">${esc(fmtDate(from, { year: true }))} – ${esc(fmtDate(to, { year: true }))}</span><span class="grow"></span><button class="btn" id="rExport">${icon('download', 16)} Bookings CSV</button></section>
  <section class="kpis">
    <div class="kpi"><small>Revenue</small><b>${money(r.revenue)}</b>${delta(r.revenue, prev.revenue)}</div>
    <div class="kpi"><small>${isOrders() ? 'Orders done' : 'Visits'}</small><b>${r.visits}</b>${delta(r.visits, prev.visits)}</div>
    <div class="kpi"><small>Avg. ticket</small><b>${money(r.avgTicket)}</b></div>
    <div class="kpi"><small>Repeat ${esc(L().customers.toLowerCase())}</small><b>${pct(r.repeatRate)}</b><span>${r.repeatCustomers} of ${r.customersServed}</span></div>
    <div class="kpi"><small>New ${esc(L().customers.toLowerCase())}</small><b>${r.newCustomers}</b></div>
    <div class="kpi"><small>No-shows</small><b>${pct(r.noShowRate)}</b><span>${r.noShows} · ${r.cancelled} cancelled</span></div>
    <div class="kpi"><small>Online bookings</small><b>${r.onlineBookings}</b><span>via your link</span></div>
    ${r.advance ? `<div class="kpi"><small>Advance taken</small><b>${money(r.advance)}</b></div>` : ''}
  </section>
  <section class="card"><header class="card-h"><h3>Revenue ${bucket > 1 ? 'by week' : 'by day'}</h3></header>
    <div class="bars">${bars.map((b) => `<div class="bar" title="${esc(fmtDate(b.date))}: ${money(b.revenue)}, ${b.visits} visits"><i style="height:${(b.revenue / maxBar) * 100}%"></i><small>${bars.length <= 31 ? Number(b.date.slice(8)) : ''}</small></div>`).join('')}</div></section>
  <div class="cols">
    <section class="card"><header class="card-h"><h3>Top ${isOrders() ? 'products' : 'services'}</h3></header>
      ${r.topServices.length ? `<table class="tbl"><tbody>${r.topServices.slice(0, 10).map((s) => `<tr><td>${esc(s.name)}</td><td class="r"><b>${s.count}</b></td></tr>`).join('')}</tbody></table>` : empty('No data yet')}</section>
    <section class="card"><header class="card-h"><h3>Busiest hours</h3></header>
      <div class="hbars">${openHours.map(({ n, h }) => `<div><small>${fmtTime(h * 60).replace(':00', '')}</small><i style="width:${(n / maxHour) * 100}%"></i><b>${n || ''}</b></div>`).join('')}</div></section>
    ${r.byStaff.length ? `<section class="card"><header class="card-h"><h3>By ${esc(L().staff.toLowerCase())}</h3></header><table class="tbl"><thead><tr><th></th><th class="r">Visits</th><th class="r">Revenue</th></tr></thead><tbody>${r.byStaff.map((s) => `<tr><td>${esc(s.name)}</td><td class="r">${s.visits}</td><td class="r">${money(s.revenue)}</td></tr>`).join('')}</tbody></table></section>` : ''}
  </div>`;
  $('#rExport').onclick = () => {
    const cell = (v) => { const x = String(v ?? ''); return /[",\n]/.test(x) ? `"${x.replaceAll('"', '""')}"` : x; };
    const rows = all('appts').filter((a) => a.date >= from && a.date <= to).sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start)
      .map((a) => [a.date, fmtTime(a.start), customerOf(a.customerId)?.name, customerOf(a.customerId)?.phone, whatOf(a), get('staff', a.staffId)?.name || '', a.status, priceOf(a, all('services')), a.advance || 0, a.source || '', a.notes]);
    download(`bookx-bookings-${from}-to-${to}.csv`, [['Date', 'Time', 'Name', 'Phone', 'What', L().staff, 'Status', 'Amount', 'Advance', 'Source', 'Notes'], ...rows].map((x) => x.map(cell).join(',')).join('\n'), 'text/csv');
  };
}

// ---------------- Booking link ----------------

const pageUrl = (file) => { const u = new URL(file, location.href); u.hash = ''; u.search = ''; return u.toString(); };

export async function buildBookingLink() {
  const p = bookingPayload(db(), { today: today(), days: 30, appUrl: pageUrl('./') });
  return `${pageUrl('book.html')}#${await encode(p)}`;
}

export async function shareView(main) {
  const s = settings();
  main.innerHTML = `<p class="lead">Your own booking page. Customers pick a ${isOrders() ? 'product and pickup time' : 'service, person and free time'}, then send the request to your WhatsApp. You confirm it with one tap.</p>
  ${!s.business.phone ? `<p class="banner">Add your WhatsApp number in <a href="#/settings">Settings</a> first: requests are sent to it.</p>` : ''}
  <div class="cols"><section class="card"><header class="card-h"><h3>Your link</h3></header>
    <textarea id="lnk" rows="3" readonly class="mono">Making your link…</textarea>
    <div class="row"><button class="btn primary" id="lCopy">${icon('copy', 16)} Copy link</button><a class="btn wa" id="lWa" target="_blank" rel="noopener">${icon('whatsapp', 16)} Share on WhatsApp</a><a class="btn" id="lOpen" target="_blank" rel="noopener">Open page</a></div>
    <label>Short link for messages (optional)<input id="short" placeholder="e.g. https://bit.ly/glow-salon" value="${esc(s.booking.shortLink || '')}"><small>Shorten the link with any free link shortener and paste it here. It is used as {link} in reminder messages.</small></label>
    <p class="muted small">The link carries your services, hours and the times already booked for the next 30 days (no customer names). Copy a fresh link every week or after a busy day so it shows the latest free times. Every request still comes to you to confirm, so nothing can be double-booked.</p>
  </section>
  <section class="card center"><header class="card-h"><h3>QR code for your counter</h3></header><img id="qr" alt="QR code of the booking link" width="240" height="240"><p class="muted small">Print it for the reception desk, packaging or a standee.</p><button class="btn" id="qrDl">${icon('download', 16)} Download QR</button></section></div>`;
  const link = await buildBookingLink();
  $('#lnk').value = link;
  $('#lOpen').href = link;
  $('#lWa').href = `https://wa.me/?text=${encodeURIComponent(`Book your ${L().booking.toLowerCase()} at ${s.business.name || 'our place'}: ${s.booking.shortLink || link}`)}`;
  const qr = await QRCode.toDataURL(s.booking.shortLink || link, { width: 480, margin: 1, errorCorrectionLevel: 'L' }).catch(() => '');
  $('#qr').src = qr;
  const mark = () => setSettings((x) => { x.booking.shared = true; });
  $('#lCopy').onclick = async () => { if (await copyText(link)) { toast('Link copied'); mark(); } };
  $('#lWa').addEventListener('click', mark);
  $('#qrDl').onclick = () => { const a = document.createElement('a'); a.href = qr; a.download = 'booking-qr.png'; a.click(); mark(); };
  $('#short').onchange = (e) => { setSettings((x) => { x.booking.shortLink = e.target.value.trim(); }); toast('Saved'); shareView(main); };
}

// ---------------- Booking request import ----------------

export async function importView(main, rerender, q) {
  let r;
  try { r = readRequest(await decode(q.get('r'))); } catch { main.innerHTML = empty('This request link is broken', 'Ask the customer to send it again.', '<a class="btn" href="#/">Home</a>'); return; }
  const services = all('services');
  const orders = isOrders();
  const known = all('customers').find((c) => samePhone(c.phone, r.phone));
  const what = orders ? r.items.map((i) => `${i.qty}× ${services.find((s) => s.id === i.serviceId)?.name || 'Unknown item'}`).join(', ') : r.serviceIds.map((id) => services.find((s) => s.id === id)?.name || 'Unknown service').join(' + ');
  const duration = durationOf(r.serviceIds, services);
  const stillFree = r.date && r.start != null && freeSlots({ settings: settings(), date: r.date, duration, staff: all('staff'), appts: all('appts'), staffId: r.staffId }).some((x) => x.start === r.start);
  const dupe = all('appts').find((a) => a.reqAt && a.reqAt === r.at);
  main.innerHTML = `<section class="card narrow"><header class="card-h"><h3>Booking request</h3>${r.at ? `<span class="muted small">sent ${esc(new Date(r.at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }))}</span>` : ''}</header>
    <dl class="kv"><dt>Name</dt><dd><b>${esc(r.name)}</b> ${known ? `<span class="chip green">Existing · <a href="#/customer/${known.id}">${esc(known.name)}</a></span>` : '<span class="chip blue">New</span>'}</dd>
    <dt>Phone</dt><dd>${esc(r.phone)}</dd><dt>${orders ? 'Items' : 'Service'}</dt><dd>${esc(what)}</dd>
    ${r.staffId ? `<dt>${esc(L().staff)}</dt><dd>${esc(get('staff', r.staffId)?.name || 'Any')}</dd>` : ''}
    <dt>When</dt><dd>${r.date ? `${esc(fmtDate(r.date, { year: true }))}, ${fmtTime(r.start)}` : 'Not chosen'} ${r.date ? (stillFree ? '<span class="chip green">Free</span>' : '<span class="chip red">No longer free</span>') : ''}</dd>
    ${r.delivery ? `<dt>Delivery</dt><dd>${esc(r.delivery)}</dd>` : ''}${r.note ? `<dt>Note</dt><dd>${esc(r.note)}</dd>` : ''}</dl>
    ${dupe ? `<p class="banner">Already booked from this request. <a href="#/calendar?d=${dupe.date}">Open calendar</a></p>` : ''}
    <div class="row end"><a class="btn wa" target="_blank" rel="noopener" href="${esc(waHref({ phone: r.phone }, `Hi ${r.name.split(' ')[0]}, sorry, ${r.date ? `${fmtDate(r.date)} at ${fmtTime(r.start)} is not available` : 'that time is not available'}. Could you pick another time? ${settings().booking.shortLink || ''}`.trim()))}">${icon('whatsapp', 16)} Suggest another time</a>
    <button class="btn primary" id="accept">${icon('check', 16)} Review & book</button></div></section>`;
  $('#accept').onclick = () => openBooking({
    customerId: known?.id || '', date: r.date || today(), start: r.start, staffId: r.staffId, source: 'link',
    prefill: { name: r.name, phone: r.phone, serviceIds: r.serviceIds, items: r.items, note: r.note, delivery: r.delivery },
    onSaved: (a) => { a.reqAt = r.at; if (!orders) a.status = 'confirmed'; upsert('appts', a); setTimeout(() => { location.hash = '#/'; }, 50); },
  });
}

// ---------------- Settings ----------------

export function settingsView(main, rerender) {
  const s = settings();
  const t = s.templates;
  const vars = '{name} {business} {booking} {service} {date} {time} {staff} {link} {review} {loyalty} {items} {total} {advance} {last} {days} {occasion}';
  main.innerHTML = `<form id="st" class="form settings">
  <section class="card"><header class="card-h"><h3>Business</h3></header>
    <div class="grid2"><label>Business name<input name="bname" value="${esc(s.business.name)}" required></label><label>WhatsApp number<input name="bphone" type="tel" value="${esc(s.business.phone)}" placeholder="10-digit mobile"><small>Booking requests are sent here.</small></label></div>
    <div class="grid2"><label>Address<input name="baddress" value="${esc(s.business.address)}"></label><label>Google review link<input name="review" value="${esc(s.reviewLink)}" placeholder="https://g.page/r/…/review"></label></div>
    <div class="grid3"><label>Business type<select name="type">${Object.entries(PRESETS).map(([k, p]) => `<option value="${k}" ${k === s.type ? 'selected' : ''}>${p.icon} ${esc(p.name)}</option>`).join('')}</select></label>
    <label>Currency<input name="currency" value="${esc(s.currency)}" maxlength="4"></label><label>Country code<input name="cc" value="${esc(s.countryCode)}" maxlength="4" inputmode="numeric"></label></div>
    <label>Note on the booking page<input name="bnote" value="${esc(s.booking.note || '')}" placeholder="e.g. Free parking. Please come 5 minutes early."></label>
  </section>
  <section class="card"><header class="card-h"><h3>Opening hours</h3></header>
    <table class="tbl hours"><thead><tr><th>Day</th><th>Open</th><th>From</th><th>To</th><th>Break from</th><th>Break to</th></tr></thead><tbody>
    ${s.hours.map((h, i) => `<tr><td>${DAY_NAMES[i].slice(0, 3)}</td><td><input type="checkbox" name="h${i}open" ${h.open ? 'checked' : ''} aria-label="${DAY_NAMES[i]} open"></td>
      <td><input type="time" name="h${i}from" value="${esc(h.from || '')}"></td><td><input type="time" name="h${i}to" value="${esc(h.to || '')}"></td>
      <td><input type="time" name="h${i}bf" value="${esc(h.breakFrom || '')}"></td><td><input type="time" name="h${i}bt" value="${esc(h.breakTo || '')}"></td></tr>`).join('')}</tbody></table>
    <label>Holidays / closed dates<input name="closed" value="${esc((s.closedDates || []).join(', '))}" placeholder="2026-12-25, 2027-01-01"></label>
  </section>
  <section class="card"><header class="card-h"><h3>Booking rules</h3></header>
    <div class="grid3"><label>Time slots every (min)<select name="step">${[5, 10, 15, 20, 30, 60].map((n) => `<option ${n === Number(s.step) ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
    ${isOrders() ? `<label>Orders per pickup slot<input type="number" name="capacity" min="1" value="${s.capacity}"></label>` : `<label>Gap between bookings (min)<input type="number" name="buffer" min="0" step="5" value="${s.buffer}"></label>`}
    <label>Online: minimum notice (min)<input type="number" name="lead" min="0" step="15" value="${s.booking.leadMin ?? 60}"></label></div>
  </section>
  <section class="card"><header class="card-h"><h3>Reminders & loyalty</h3></header>
    <div class="grid2"><label>Booking reminders: days ahead<input type="number" name="remDays" min="1" max="7" value="${s.reminderDays}"></label>
    <label>Show repeat visits due within (days)<input type="number" name="rvWin" min="0" max="60" value="${s.revisitWindow}"></label>
    <label>Birthday / anniversary: days before<input type="number" name="ocLead" min="0" max="30" value="${s.occasionLead}"></label>
    <label>Win back after no visit for (days)<input type="number" name="lapsed" min="14" value="${s.lapsedDays}"></label></div>
    <div class="grid3"><label class="inline"><input type="checkbox" name="loy" ${s.loyalty.enabled ? 'checked' : ''}> Loyalty card</label>
    <label>Reward every … visits<input type="number" name="loyEvery" min="2" max="50" value="${s.loyalty.every}"></label><label>Reward<input name="loyReward" value="${esc(s.loyalty.reward)}"></label></div>
  </section>
  <section class="card"><header class="card-h"><h3>Words</h3></header>
    <div class="grid2">${[['customer', 'One customer'], ['customers', 'Many customers'], ['staff', 'Staff member'], ['booking', 'Booking']].map(([k, label]) => `<label>${label}<input name="l_${k}" value="${esc(s.labels[k])}"></label>`).join('')}</div>
  </section>
  <section class="card"><header class="card-h"><h3>Messages</h3><button type="button" class="btn small" id="tplReset">Reset to default</button></header>
    <p class="muted small">You can use: ${esc(vars)}</p>
    ${[['confirm', 'Booking confirmed'], ['reminder', 'Reminder before the visit'], ['order', 'Order confirmed (orders)'], ['thanks', 'Thank-you after the visit'], ['revisit', 'Repeat visit due'], ['occasion', 'Birthday / occasion'], ['winback', 'Win back']].map(([k, label]) => `<label>${label}<textarea name="t_${k}" rows="2">${esc(t[k])}</textarea></label>`).join('')}
  </section>
  <div class="sticky-foot"><span class="grow muted small">Saved in this browser only.</span><button class="btn primary">Save settings</button></div>
  </form>
  <section class="card"><header class="card-h"><h3>Your data</h3></header>
    <p class="muted small">Everything is stored in this browser on this device. Download a backup regularly, and restore it on a new phone or computer.</p>
    <div class="row"><button class="btn" id="bk">${icon('download', 16)} Download backup</button><label class="btn">${icon('upload', 16)} Restore backup<input type="file" id="rs" accept="application/json,.json" hidden></label>
    ${hasSampleData() ? '<button class="btn" id="noSample">Remove sample data</button>' : '<button class="btn" id="sample">Add sample data</button>'}
    <button class="btn" id="paste">Paste a booking request</button><button class="btn ghost-bad" id="wipe">Erase everything</button></div>
  </section>`;
  const f = $('#st');
  f.type.onchange = () => {
    const p = preset(f.type.value);
    for (const k of ['customer', 'customers', 'staff', 'booking']) f[`l_${k}`].value = p.labels[k];
  };
  $('#tplReset').onclick = () => { for (const k of Object.keys(DEFAULT_TEMPLATES)) if (f[`t_${k}`]) f[`t_${k}`].value = DEFAULT_TEMPLATES[k]; };
  f.onsubmit = (e) => {
    e.preventDefault();
    setSettings((x) => {
      x.business = { ...x.business, name: f.bname.value.trim(), phone: f.bphone.value.trim(), address: f.baddress.value.trim() };
      x.reviewLink = f.review.value.trim();
      if (x.type !== f.type.value) { x.type = f.type.value; x.mode = preset(x.type).mode; }
      x.currency = f.currency.value.trim() || '₹';
      x.countryCode = f.cc.value.replace(/\D/g, '') || '91';
      x.booking = { ...x.booking, note: f.bnote.value.trim(), leadMin: Number(f.lead.value) || 0 };
      x.hours = x.hours.map((h, i) => ({ open: f[`h${i}open`].checked, from: f[`h${i}from`].value, to: f[`h${i}to`].value, breakFrom: f[`h${i}bf`].value, breakTo: f[`h${i}bt`].value }));
      x.closedDates = f.closed.value.split(/[\s,]+/).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
      x.step = Number(f.step.value) || 15;
      if (f.capacity) x.capacity = Math.max(1, Number(f.capacity.value) || 1);
      if (f.buffer) x.buffer = Math.max(0, Number(f.buffer.value) || 0);
      x.reminderDays = Number(f.remDays.value) || 1;
      x.revisitWindow = Number(f.rvWin.value) || 0;
      x.occasionLead = Number(f.ocLead.value) || 0;
      x.lapsedDays = Number(f.lapsed.value) || 90;
      x.loyalty = { enabled: f.loy.checked, every: Number(f.loyEvery.value) || 6, reward: f.loyReward.value.trim() };
      for (const k of ['customer', 'customers', 'staff', 'booking']) x.labels[k] = f[`l_${k}`].value.trim() || preset(x.type).labels[k];
      for (const k of Object.keys(DEFAULT_TEMPLATES)) if (f[`t_${k}`]) x.templates[k] = f[`t_${k}`].value.trim();
    });
    toast('Settings saved');
    rerender(true);
  };
  $('#bk').onclick = () => download(`bookx-backup-${ymd()}.json`, JSON.stringify(db(), null, 1));
  $('#rs').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const d = JSON.parse(await file.text());
      if (!d.settings || !Array.isArray(d.appts)) throw new Error('bad');
      if (!(await confirmBox(`Replace everything here with this backup (${d.customers?.length || 0} customers, ${d.appts.length} bookings)?`, { ok: 'Restore' }))) return;
      replaceAll(d);
      toast('Backup restored');
      rerender(true);
    } catch { toast('That file is not a BookX backup.', 'bad'); }
  };
  $('#sample')?.addEventListener('click', () => { addSampleData(); toast('Sample data added'); rerender(true); });
  $('#noSample')?.addEventListener('click', () => { clearSampleData(); toast('Sample data removed'); rerender(true); });
  $('#paste').onclick = () => {
    const m = modal('Paste a booking request', `<form class="form" id="pf"><label>Paste the whole WhatsApp message or the link<textarea name="t" rows="4" required></textarea></label><div class="row end"><button class="btn primary">Open</button></div></form>`);
    $('#pf', m.el).onsubmit = (e) => {
      e.preventDefault();
      const match = /[#&?]r=([zj][\w-]+)/.exec(e.target.t.value);
      if (!match) return toast('No booking request found in that text.', 'bad');
      m.close();
      location.hash = `#/import?r=${match[1]}`;
    };
  };
  $('#wipe').onclick = async () => {
    if (!(await confirmBox('Erase all customers, bookings and settings from this browser? Download a backup first.', { ok: 'Erase everything', danger: true }))) return;
    reset();
    location.hash = '#/';
    location.reload();
  };
}

// ---------------- First run ----------------

export function setupView(main, done) {
  const groups = [...new Set(Object.values(PRESETS).map((p) => p.group))];
  main.innerHTML = `<section class="setup">
    <div class="setup-h"><img src="./icon.svg" alt="" width="56" height="56"><h1>Welcome to Book<b>X</b></h1><p>Bookings, reminders and repeat visits for your business. Free, and your data stays on this device.</p></div>
    <form id="su" class="form">
      <h3>1. What kind of business?</h3>
      ${groups.map((g) => `<div class="cat">${esc(g)}</div><div class="types">${Object.entries(PRESETS).filter(([, p]) => p.group === g).map(([k, p]) => `<label class="type"><input type="radio" name="type" value="${k}" ${k === 'salon' ? 'checked' : ''}><span><i>${p.icon}</i>${esc(p.name)}</span></label>`).join('')}</div>`).join('')}
      <h3>2. About you</h3>
      <div class="grid2"><label>Business name<input name="name" required placeholder="e.g. Glow Unisex Salon"></label><label>WhatsApp number<input name="phone" type="tel" placeholder="10-digit mobile"></label></div>
      <label class="inline"><input type="checkbox" name="sample" checked> Add sample ${'customers'} and bookings so I can try it (remove any time in Settings)</label>
      <button class="btn primary big">Start</button>
      <p class="muted small">We set up typical services, prices, hours and repeat gaps for your type. Change all of it later.</p>
    </form></section>`;
  $('#su').onsubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    replaceAll(fromPreset(f.type.value, { name: f.name.value.trim(), phone: f.phone.value.trim() }));
    if (f.sample.checked) addSampleData();
    done();
  };
}

