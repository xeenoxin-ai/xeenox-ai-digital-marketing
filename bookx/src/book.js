// Public booking page. Everything it needs is in the link's #fragment;
// the request goes to the business on WhatsApp.
import './app.css';
import { decode, payloadSettings, payloadAppts, requestPayload, encode } from './codec.js';
import { freeSlots, fmtDate, fmtTime, addDays, daysBetween, dayWindow, ymd, waLink, icsEvent, durationOf, weekday } from './logic.js';
import { PRESETS } from './presets.js';
import { esc, icon, $, $$, download, toast } from './ui.js';

const app = $('#app');
let P;
const st = { serviceIds: [], qty: {}, staffId: '', date: '', start: null, name: '', phone: '', note: '', delivery: '' };

function money(n) { return `${P.cur || '₹'}${(Number(n) || 0).toLocaleString('en-IN')}`; }
const orders = () => P.m === 'orders';

async function boot() {
  try {
    P = await decode(location.hash.slice(1));
    if (!P?.b) throw new Error('empty');
  } catch {
    app.innerHTML = `<div class="bk-card"><h1>Link not complete</h1><p>Please ask the business to send their booking link again.</p></div>`;
    return;
  }
  document.title = `Book · ${P.b.name}`;
  try { const saved = JSON.parse(localStorage.getItem('bookx-me') || '{}'); st.name = saved.name || ''; st.phone = saved.phone || ''; } catch { /* private mode */ }
  render();
}

function days() {
  const t = ymd();
  const until = addDays(P.gen, P.days || 30);
  const out = [];
  for (let d = t; d <= until && out.length < 21; d = addDays(d, 1)) out.push(d);
  return out;
}

function slotsFor(date) {
  const s = payloadSettings(P);
  const isToday = date === ymd();
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes() + (Number(P.lead) || 0);
  const services = P.sv.map((x) => ({ id: x.id, duration: x.d }));
  return freeSlots({ settings: s, date, duration: durationOf(st.serviceIds, services, (s.step || 15) * 2), staff: P.sf, appts: payloadAppts(P), staffId: st.staffId, nowMin: isToday ? nowMin : null });
}

function total() {
  if (orders()) return P.sv.reduce((n, x) => n + (st.qty[x.id] || 0) * (Number(x.p) || 0), 0);
  return st.serviceIds.reduce((n, id) => n + (Number(P.sv.find((x) => x.id === id)?.p) || 0), 0);
}
const picked = () => (orders() ? P.sv.filter((x) => st.qty[x.id] > 0) : P.sv.filter((x) => st.serviceIds.includes(x.id)));
const whatText = () => (orders() ? picked().map((x) => `${st.qty[x.id]}× ${x.n}`).join(', ') : picked().map((x) => x.n).join(' + '));

function render() {
  const icon2 = PRESETS[P.b.type]?.icon || '🗓️';
  const cats = [...new Set(P.sv.map((x) => x.c || ''))];
  const ds = days();
  if (!st.date || !ds.includes(st.date)) st.date = ds.find((d) => dayWindow(payloadSettings(P), d)) || ds[0];
  const ready = (orders() ? picked().length : st.serviceIds.length) > 0;
  const slots = ready ? slotsFor(st.date) : [];
  if (st.start != null && !slots.some((x) => x.start === st.start)) st.start = null;
  const stale = daysBetween(P.gen, ymd()) > 7;
  app.innerHTML = `
  <header class="bk-head"><span class="bk-logo">${icon2}</span><div><h1>${esc(P.b.name)}</h1>${P.b.address ? `<p>${esc(P.b.address)}</p>` : ''}</div>${P.b.phone ? `<a class="icon-btn" href="tel:${esc(P.b.phone)}" aria-label="Call">${icon('phone')}</a>` : ''}</header>
  ${P.b.about ? `<p class="bk-note">${esc(P.b.about)}</p>` : ''}
  <section class="bk-card"><h2><span>1</span> ${orders() ? 'What would you like?' : 'Choose a service'}</h2>
    ${orders()
      ? `<div class="items">${P.sv.map((x) => `<div class="item-row" data-sid="${x.id}"><span><b>${esc(x.n)}</b><small>${money(x.p)}</small></span><span class="stepper"><button class="icon-btn" data-dec aria-label="Less">−</button><output>${st.qty[x.id] || 0}</output><button class="icon-btn" data-inc aria-label="More">+</button></span></div>`).join('')}</div>`
      : cats.map((c) => `${cats.length > 1 ? `<div class="cat">${esc(c || 'Other')}</div>` : ''}<div class="chips">${P.sv.filter((x) => (x.c || '') === c).map((x) => `<label class="pick"><input type="checkbox" value="${x.id}" ${st.serviceIds.includes(x.id) ? 'checked' : ''}><span>${esc(x.n)}<small>${x.d ? `${x.d} min · ` : ''}${money(x.p)}</small></span></label>`).join('')}</div>`).join('')}
  </section>
  ${!orders() && P.sf.length > 1 ? `<section class="bk-card"><h2><span>2</span> With whom?</h2><div class="chips">
    ${[{ id: '', n: 'Anyone available' }, ...P.sf].map((x) => `<label class="pick"><input type="radio" name="sf" value="${x.id}" ${x.id === st.staffId ? 'checked' : ''}><span>${esc(x.n)}</span></label>`).join('')}</div></section>` : ''}
  <section class="bk-card"><h2><span>${!orders() && P.sf.length > 1 ? 3 : 2}</span> ${orders() ? 'Pickup day & time' : 'Pick a day & time'}</h2>
    <div class="dates">${ds.map((d) => { const open = !!dayWindow(payloadSettings(P), d); return `<button class="date ${d === st.date ? 'on' : ''}" data-d="${d}" ${open ? '' : 'disabled'}><small>${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][weekday(d)]}</small><b>${Number(d.slice(8))}</b><small>${fmtDate(d, { weekday: false }).split(' ')[1]}</small></button>`; }).join('')}</div>
    ${!ready ? `<p class="muted">${orders() ? 'Add an item first.' : 'Choose a service first.'}</p>` : slots.length
      ? `<div class="slots">${slots.map((x) => `<button class="slot ${x.start === st.start ? 'on' : ''}" data-t="${x.start}">${fmtTime(x.start)}</button>`).join('')}</div>`
      : `<p class="muted">No free times on ${esc(fmtDate(st.date))}. Try another day.</p>`}
    ${stale ? '<p class="muted small">Times are from a while ago; the business will confirm.</p>' : ''}
  </section>
  <section class="bk-card"><h2><span>${!orders() && P.sf.length > 1 ? 4 : 3}</span> Your details</h2>
    <form id="me" class="form"><div class="grid2"><label>Name<input name="name" required autocomplete="name" value="${esc(st.name)}"></label><label>Mobile (WhatsApp)<input name="phone" type="tel" required autocomplete="tel" inputmode="tel" value="${esc(st.phone)}"></label></div>
    ${orders() ? `<label>Delivery address (leave empty to pick up)<input name="delivery" value="${esc(st.delivery)}"></label>` : ''}
    <label>${orders() ? 'Notes (message on cake, flavour, design…)' : 'Anything we should know?'}<textarea name="note" rows="2">${esc(st.note)}</textarea></label>
    <div class="bk-sum">${ready ? `<span>${esc(whatText())}${st.start != null ? `<br><b>${esc(fmtDate(st.date))}, ${fmtTime(st.start)}</b>` : ''}</span><b>${money(total())}</b>` : '<span class="muted">Nothing chosen yet</span>'}</div>
    <button class="btn wa big block" ${ready && st.start != null ? '' : 'disabled'}>${icon('whatsapp')} Send booking request</button>
    <p class="muted small center">WhatsApp opens with your request. ${esc(P.b.name)} confirms it in the chat.</p></form>
  </section>
  <p class="bk-foot">Free booking page by Book<b>X</b></p>`;
  wire();
}

function wire() {
  $$('.pick input[type=checkbox]').forEach((cb) => { cb.onchange = () => { st.serviceIds = $$('.pick input[type=checkbox]:checked').map((x) => x.value); keep(render); }; });
  $$('input[name=sf]').forEach((r) => { r.onchange = () => { st.staffId = r.value; keep(render); }; });
  $$('.item-row').forEach((row) => {
    const id = row.dataset.sid;
    $('[data-inc]', row).onclick = () => { st.qty[id] = (st.qty[id] || 0) + 1; keep(render); };
    $('[data-dec]', row).onclick = () => { st.qty[id] = Math.max(0, (st.qty[id] || 0) - 1); keep(render); };
  });
  $$('[data-d]').forEach((b) => { b.onclick = () => { st.date = b.dataset.d; keep(render); }; });
  $$('[data-t]').forEach((b) => { b.onclick = () => { st.start = Number(b.dataset.t); keep(render); $('#me [name=name]').scrollIntoView({ behavior: 'smooth', block: 'center' }); }; });
  const f = $('#me');
  for (const k of ['name', 'phone', 'note', 'delivery']) if (f[k]) f[k].oninput = () => { st[k] = f[k].value; };
  f.onsubmit = async (e) => {
    e.preventDefault();
    if (String(st.phone).replace(/\D/g, '').length < 10) return toast('Please enter a 10-digit mobile number.', 'bad');
    try { localStorage.setItem('bookx-me', JSON.stringify({ name: st.name, phone: st.phone })); } catch { /* ignore */ }
    const token = await encode(requestPayload({
      name: st.name.trim(), phone: st.phone.trim(), serviceIds: orders() ? [] : st.serviceIds,
      items: orders() ? picked().map((x) => ({ serviceId: x.id, qty: st.qty[x.id] })) : [],
      staffId: st.staffId, date: st.date, start: st.start, note: st.note.trim(), delivery: st.delivery.trim(),
    }));
    const who = st.staffId ? P.sf.find((x) => x.id === st.staffId)?.n : '';
    const text = [`New ${(P.l?.booking || 'booking').toLowerCase()} request`, `Name: ${st.name.trim()}`, `Phone: ${st.phone.trim()}`,
      `${orders() ? 'Order' : 'Service'}: ${whatText()}`, who && `With: ${who}`, `${orders() ? 'Pickup' : 'When'}: ${fmtDate(st.date)}, ${fmtTime(st.start)}`,
      st.delivery.trim() && `Deliver to: ${st.delivery.trim()}`, st.note.trim() && `Note: ${st.note.trim()}`, `Total: ${money(total())}`,
      '', `Add to BookX: ${P.app}#/import?r=${token}`].filter((x) => x !== '' && x != null && x !== false).join('\n').replace('\nAdd to', '\n\nAdd to');
    location.href = waLink(P.b.phone, text, P.cc);
    setTimeout(sent, 600);
  };
}

function sent() {
  const dur = orders() ? 15 : durationOf(st.serviceIds, P.sv.map((x) => ({ id: x.id, duration: x.d })), 30);
  app.innerHTML = `<section class="bk-card center"><div class="bk-done">${icon('check', 36)}</div><h1>Request ready</h1>
    <p>Press <b>send</b> in WhatsApp. ${esc(P.b.name)} will confirm your ${esc((P.l?.booking || 'booking').toLowerCase())} for<br><b>${esc(fmtDate(st.date))} at ${fmtTime(st.start)}</b>.</p>
    <div class="row center"><button class="btn" id="ics">${icon('calendar', 16)} Add to my calendar</button><button class="btn" id="again">Book something else</button></div></section>
    <p class="bk-foot">Free booking page by Book<b>X</b></p>`;
  $('#ics').onclick = () => download('booking.ics', icsEvent({ uid: `${st.date}-${st.start}-${Date.now()}`, title: `${whatText()} at ${P.b.name}`, date: st.date, start: st.start, duration: dur, location: P.b.address || '', description: 'Waiting for confirmation on WhatsApp.' }), 'text/calendar');
  $('#again').onclick = () => { st.start = null; render(); scrollTo(0, 0); };
}

// Re-render without losing the scroll position.
function keep(fn) { const y = scrollY; fn(); scrollTo(0, y); }

addEventListener('hashchange', boot);
boot();
