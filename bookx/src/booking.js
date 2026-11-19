// New / edit booking form and the booking detail sheet.
import { settings, all, get, upsert, remove, patch, markSent, setSettings, save } from './store.js';
import { freeSlots, clashes, durationOf, bookingTotal, priceOf, fmtTime, fmtDate, toMin, toHHMM, findCustomers, samePhone, nextToken, STATUS, customerStats, ymd } from './logic.js';
import { esc, icon, modal, toast, confirmBox, $, $$ } from './ui.js';
import { L, isOrders, money, whatOf, statusChip, message, waBtn, callBtn, customerOf, staffOf, today, nowMin } from './common.js';

let refresh = () => {};
export const onChange = (fn) => { refresh = fn; };

/**
 * Booking form. opts: { appt, date, start, staffId, customerId, walkin, prefill }
 */
export function openBooking(opts = {}) {
  const s = settings();
  const orders = isOrders();
  const editing = opts.appt ? structuredClone(opts.appt) : null;
  const services = all('services').filter((x) => !x.hidden || editing?.serviceIds?.includes(x.id));
  const staff = all('staff').filter((x) => !x.off);
  const st = {
    customerId: editing?.customerId || opts.customerId || '',
    serviceIds: editing?.serviceIds ? [...editing.serviceIds] : [...(opts.prefill?.serviceIds || [])],
    qty: Object.fromEntries((editing?.items || opts.prefill?.items || []).map((i) => [i.serviceId, i.qty])),
    staffId: editing?.staffId ?? opts.staffId ?? '',
    date: editing?.date || opts.date || today(),
    start: editing?.start ?? opts.start ?? null,
    custom: false,
  };
  const pre = opts.prefill || {};
  const cats = [...new Set(services.map((x) => x.category || ''))];

  const svcPicker = orders
    ? `<div class="items">${services.map((x) => `<div class="item-row" data-sid="${x.id}"><span><b>${esc(x.name)}</b><small>${money(x.price)}</small></span>
        <span class="stepper"><button type="button" class="icon-btn" data-dec>−</button><input type="number" min="0" inputmode="numeric" value="${st.qty[x.id] || 0}" aria-label="Quantity of ${esc(x.name)}"><button type="button" class="icon-btn" data-inc>+</button></span></div>`).join('')}</div>`
    : cats.map((c) => `${cats.length > 1 ? `<div class="cat">${esc(c || 'Other')}</div>` : ''}<div class="chips">${services.filter((x) => (x.category || '') === c).map((x) => `<label class="pick"><input type="checkbox" value="${x.id}" ${st.serviceIds.includes(x.id) ? 'checked' : ''}><span>${esc(x.name)}<small>${x.duration ? `${x.duration} min · ` : ''}${money(x.price)}</small></span></label>`).join('')}</div>`).join('');

  const title = editing ? `Edit ${L().booking.toLowerCase()}` : opts.walkin ? 'Walk-in' : `New ${L().booking.toLowerCase()}`;
  const m = modal(title, `<form id="bk" class="form" autocomplete="off">
    <fieldset><legend>${esc(L().customer)}</legend>
      <div id="custPicked"></div>
      <div id="custFind">
        <div class="grid2"><label>Name<input name="name" value="${esc(pre.name || '')}" placeholder="Search or type a new name" required></label>
        <label>Phone<input name="phone" type="tel" inputmode="tel" value="${esc(pre.phone || '')}" placeholder="10-digit mobile"></label></div>
        <div id="custMatches" class="matches"></div>
      </div>
    </fieldset>
    <fieldset><legend>${orders ? 'Items' : 'Services'}</legend>${svcPicker || '<p class="muted">Add services first (Services page).</p>'}</fieldset>
    <fieldset><legend>${orders ? 'Pickup' : 'When'}</legend>
      <div class="grid2">
        <label>Date<input type="date" name="date" value="${st.date}" required></label>
        ${!orders && staff.length ? `<label>${esc(L().staff)}<select name="staffId"><option value="">Any available</option>${staff.map((x) => `<option value="${x.id}" ${x.id === st.staffId ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>` : ''}
      </div>
      <div id="slots" class="slots"></div>
      <label class="inline"><input type="checkbox" id="customTime"> Pick any time (ignore free slots)</label>
      <div id="customWrap" hidden><label>Time<input type="time" name="time" step="300"></label></div>
      <p id="clash" class="warn" hidden></p>
    </fieldset>
    <fieldset><legend>Details</legend>
      <div class="grid3">
        ${orders ? '' : `<label>Minutes<input type="number" name="duration" min="5" step="5" value="${editing?.duration || ''}"></label>`}
        <label>Price<input type="number" name="price" min="0" step="1" value="${editing?.price ?? ''}" placeholder="auto"></label>
        <label>Advance paid<input type="number" name="advance" min="0" step="1" value="${editing?.advance || ''}"></label>
      </div>
      ${orders ? `<label>Delivery address (leave empty for pickup)<input name="delivery" value="${esc(editing?.delivery || pre.delivery || '')}"></label>` : ''}
      <label>${orders ? 'Notes (message on cake, flavour, design…)' : 'Notes'}<textarea name="notes" rows="2">${esc(editing?.notes || pre.note || '')}</textarea></label>
      ${editing ? `<label>Status<select name="status">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${k === editing.status ? 'selected' : ''}>${v.name}</option>`).join('')}</select></label>` : ''}
    </fieldset>
    <div class="sticky-foot"><span id="sum" class="sum"></span><button type="button" class="btn" data-close>Cancel</button><button class="btn primary">${editing ? 'Save' : opts.walkin ? 'Add walk-in' : 'Book'}</button></div>
  </form>`, { wide: true });
  const f = $('#bk', m.el);

  // ----- customer -----
  const showCustomer = () => {
    const c = st.customerId && customerOf(st.customerId);
    $('#custFind', f).hidden = !!c;
    f.name.required = !c;
    $('#custPicked', f).innerHTML = c ? `<div class="picked"><span class="av">${esc(c.name[0] || '?')}</span><span><b>${esc(c.name)}</b><small>${esc(c.phone || 'No phone')}</small></span><button type="button" class="btn small" id="custChange">Change</button></div>` : '';
    if (c) $('#custChange', f).onclick = () => { st.customerId = ''; showCustomer(); f.name.focus(); };
  };
  const matches = () => {
    const q = f.name.value || f.phone.value;
    const list = q.trim().length >= 2 ? findCustomers(f.name.value.trim().length >= 2 ? f.name.value : f.phone.value, all('customers')).slice(0, 5) : [];
    const byPhone = f.phone.value.replace(/\D/g, '').length >= 10 && all('customers').find((c) => samePhone(c.phone, f.phone.value));
    const show = byPhone && !list.includes(byPhone) ? [byPhone, ...list] : list;
    $('#custMatches', f).innerHTML = show.map((c) => `<button type="button" data-cid="${c.id}">${esc(c.name)} <small>${esc(c.phone || '')}</small></button>`).join('');
  };
  f.name.oninput = matches;
  f.phone.oninput = matches;
  $('#custMatches', f).onclick = (e) => { const b = e.target.closest('[data-cid]'); if (b) { st.customerId = b.dataset.cid; showCustomer(); } };
  showCustomer();
  if (!st.customerId && (pre.name || pre.phone)) matches();

  // ----- services / items -----
  const selected = () => (orders
    ? services.filter((x) => st.qty[x.id] > 0).map((x) => ({ serviceId: x.id, name: x.name, qty: st.qty[x.id], price: Number(x.price) || 0 }))
    : st.serviceIds);
  const duration = () => (orders ? 0 : Number(f.duration?.value) || durationOf(st.serviceIds, services, s.step * 2));
  if (orders) {
    $$('.item-row', f).forEach((row) => {
      const inp = $('input', row);
      const set = (v) => { inp.value = Math.max(0, v); st.qty[row.dataset.sid] = Number(inp.value); update(); };
      $('[data-inc]', row).onclick = () => set(Number(inp.value) + 1);
      $('[data-dec]', row).onclick = () => set(Number(inp.value) - 1);
      inp.oninput = () => set(Number(inp.value) || 0);
    });
  } else {
    $$('.pick input', f).forEach((cb) => { cb.onchange = () => { st.serviceIds = $$('.pick input:checked', f).map((x) => x.value); if (f.duration) f.duration.placeholder = durationOf(st.serviceIds, services, s.step * 2); update(); }; });
    if (f.duration) f.duration.placeholder = durationOf(st.serviceIds, services, s.step * 2);
  }

  // ----- time -----
  const draft = () => ({ id: editing?.id, kind: orders ? 'order' : 'appointment', date: f.date.value, start: st.start, duration: duration(), staffId: f.staffId?.value || '' });
  function renderSlots() {
    st.date = f.date.value;
    const list = freeSlots({ settings: s, date: st.date, duration: duration(), staff, appts: all('appts'), staffId: f.staffId?.value || '', nowMin: st.date === today() ? nowMin() - (opts.walkin ? s.step : 0) : null, ignoreId: editing?.id });
    const el = $('#slots', f);
    if (st.custom) { el.innerHTML = ''; return; }
    if (!list.length) {
      el.innerHTML = `<p class="muted">No free ${orders ? 'pickup slots' : 'times'} on ${esc(fmtDate(st.date))}. Try another date or pick any time.</p>`;
      if (st.start != null && !list.some((x) => x.start === st.start)) st.start = editing && editing.date === st.date ? st.start : null;
      return;
    }
    if (st.start != null && !list.some((x) => x.start === st.start) && !(editing && editing.date === st.date && editing.start === st.start)) st.start = null;
    const groups = [['Morning', 0, 720], ['Afternoon', 720, 1020], ['Evening', 1020, 1440]];
    el.innerHTML = groups.map(([name, a, b]) => {
      const xs = list.filter((x) => x.start >= a && x.start < b);
      return xs.length ? `<div class="slot-group"><small>${name}</small><div>${xs.map((x) => `<button type="button" class="slot ${x.start === st.start ? 'on' : ''}" data-t="${x.start}" title="${x.left ? `${x.left} left` : x.staffIds.map((id) => staffOf(id)?.name).join(', ')}">${fmtTime(x.start)}</button>`).join('')}</div></div>` : '';
    }).join('');
    if (editing && editing.date === st.date && !list.some((x) => x.start === editing.start)) {
      el.insertAdjacentHTML('afterbegin', `<p class="small">Current time: <button type="button" class="slot ${st.start === editing.start ? 'on' : ''}" data-t="${editing.start}">${fmtTime(editing.start)}</button></p>`);
    }
  }
  $('#slots', f).onclick = (e) => {
    const b = e.target.closest('[data-t]');
    if (!b) return;
    st.start = Number(b.dataset.t);
    $$('.slot', f).forEach((x) => x.classList.toggle('on', x === b));
    update(false);
  };
  $('#customTime', f).onchange = (e) => {
    st.custom = e.target.checked;
    $('#customWrap', f).hidden = !st.custom;
    if (st.custom) { f.time.value = st.start != null ? toHHMM(st.start) : ''; f.time.focus(); }
    renderSlots();
    update(false);
  };
  f.date.onchange = () => update();
  if (f.staffId) f.staffId.onchange = () => update();
  if (f.duration) f.duration.oninput = () => update();
  if (f.time) f.time.oninput = () => { st.start = toMin(f.time.value); update(false); };
  f.price.oninput = () => update(false);

  function update(slots = true) {
    if (slots) renderSlots();
    const total = f.price.value !== '' ? Number(f.price.value) : bookingTotal({ items: orders ? selected() : [], serviceIds: orders ? [] : st.serviceIds }, services);
    $('#sum', f).innerHTML = `${st.start != null ? `${esc(fmtDate(f.date.value))}, ${fmtTime(st.start)} · ` : ''}<b>${money(total)}</b>`;
    const c = st.start != null && !orders ? clashes({ ...draft(), staffId: draft().staffId || pickStaff() || '' }, all('appts')) : [];
    $('#clash', f).hidden = !c.length;
    if (c.length) $('#clash', f).textContent = `Overlaps with ${c.map((a) => `${customerOf(a.customerId)?.name || 'a booking'} at ${fmtTime(a.start)}`).join(', ')}.`;
  }
  function pickStaff() {
    if (orders || !staff.length) return '';
    if (f.staffId?.value) return f.staffId.value;
    const free = freeSlots({ settings: s, date: f.date.value, duration: duration(), staff, appts: all('appts'), ignoreId: editing?.id }).find((x) => x.start === st.start);
    return free?.staffIds[0] || editing?.staffId || staff[0].id;
  }
  if (opts.walkin && st.start == null) {
    const n = nowMin();
    st.start = Math.floor(n / 5) * 5;
    st.custom = true;
    $('#customTime', f).checked = true;
    $('#customWrap', f).hidden = false;
    f.time.value = toHHMM(st.start);
  }
  update();

  f.onsubmit = (e) => {
    e.preventDefault();
    const items = orders ? selected() : [];
    if (orders ? !items.length : !st.serviceIds.length) return toast(orders ? 'Add at least one item.' : 'Pick at least one service.', 'bad');
    if (st.start == null) return toast(`Pick a ${orders ? 'pickup ' : ''}time.`, 'bad');
    let customer = st.customerId && customerOf(st.customerId);
    if (!customer) {
      const name = f.name.value.trim();
      if (!name) return toast('Enter a name.', 'bad');
      const phone = f.phone.value.trim();
      customer = (phone && all('customers').find((c) => samePhone(c.phone, phone))) || upsert('customers', { name, phone, notes: '', tags: [] });
    }
    const a = {
      ...(editing || { status: opts.walkin ? 'arrived' : 'booked', source: opts.source || (opts.walkin ? 'walkin' : 'app') }),
      kind: orders ? 'order' : 'appointment',
      customerId: customer.id,
      date: f.date.value,
      start: st.start,
      duration: duration(),
      staffId: pickStaff(),
      serviceIds: orders ? [] : st.serviceIds,
      items,
      price: f.price.value === '' ? null : Number(f.price.value),
      advance: Number(f.advance.value) || 0,
      notes: f.notes.value.trim(),
      delivery: f.delivery?.value.trim() || '',
    };
    if (editing) a.status = f.status.value;
    if (opts.walkin) a.token = nextToken(all('appts'), a.date);
    if (editing && (editing.date !== a.date || editing.start !== a.start)) a.remindedOn = '';
    upsert('appts', a);
    m.close();
    opts.onSaved?.(a);
    refresh();
    if (!editing && !opts.walkin && customer.phone) {
      afterBook(a, customer);
    } else toast(editing ? 'Saved' : `Token ${a.token || ''} added`.trim());
  };
}

function afterBook(a, customer) {
  const text = message(isOrders() ? 'order' : 'confirm', customer, a);
  const m = modal('Booked ✓', `<p><b>${esc(customer.name)}</b> · ${esc(whatOf(a))}<br>${esc(fmtDate(a.date))} at ${fmtTime(a.start)}</p>
    <p class="muted small">Send the confirmation so it sits in their WhatsApp chat:</p>
    <pre class="msg">${esc(text)}</pre>
    <div class="row end"><button class="btn" data-close>Skip</button>${waBtn(customer, text, { label: 'Send confirmation', cls: 'primary' })}</div>`);
  $('a.wa', m.el)?.addEventListener('click', () => setTimeout(m.close, 200));
}

/** Detail sheet with quick status actions. */
export function openAppt(id) {
  const a = get('appts', id);
  if (!a) return;
  const c = customerOf(a.customerId);
  const s = settings();
  const st = c ? customerStats(c.id, all('appts'), all('services'), s) : null;
  const price = priceOf(a, all('services'));
  const actions = [
    ['confirmed', 'Confirm', ['booked']],
    ['arrived', isOrders() ? 'Ready' : 'Arrived', ['booked', 'confirmed']],
    ['done', isOrders() ? 'Picked up' : 'Done', ['booked', 'confirmed', 'arrived']],
    ['noshow', 'No-show', ['booked', 'confirmed']],
    ['cancelled', 'Cancel', ['booked', 'confirmed', 'arrived']],
    ['booked', 'Re-open', ['done', 'noshow', 'cancelled']],
  ].filter(([, , from]) => from.includes(a.status));
  const reminder = message(isOrders() ? 'order' : 'reminder', c, a);
  const m = modal(`${L().booking} · ${fmtDate(a.date)}`, `<div class="detail">
    <div class="picked"><span class="av">${esc(c?.name?.[0] || '?')}</span><span><a href="#/customer/${c?.id}" data-close><b>${esc(c?.name || 'Unknown')}</b></a><small>${esc(c?.phone || '')}${st ? ` · ${st.visits} visit${st.visits === 1 ? '' : 's'}` : ''}</small></span>${callBtn(c)}</div>
    <dl class="kv">
      <dt>When</dt><dd>${esc(fmtDate(a.date, { year: true }))}, ${fmtTime(a.start)}${a.duration ? ` – ${fmtTime(a.start + a.duration)}` : ''}${a.token ? ` · Token <b>${a.token}</b>` : ''}</dd>
      <dt>${isOrders() ? 'Items' : 'Service'}</dt><dd>${esc(whatOf(a))}</dd>
      ${a.staffId ? `<dt>${esc(L().staff)}</dt><dd>${esc(staffOf(a.staffId)?.name || '')}</dd>` : ''}
      <dt>Amount</dt><dd>${money(price)}${a.advance ? ` · advance ${money(a.advance)} · balance <b>${money(Math.max(0, price - a.advance))}</b>` : ''}</dd>
      ${a.delivery ? `<dt>Delivery</dt><dd>${esc(a.delivery)}</dd>` : ''}
      ${a.notes ? `<dt>Notes</dt><dd>${esc(a.notes)}</dd>` : ''}
      <dt>Status</dt><dd>${statusChip(a.status)} ${a.source === 'link' ? '<span class="chip violet">Online</span>' : ''} ${a.remindedOn ? `<span class="muted small">Reminded ${esc(fmtDate(a.remindedOn, { weekday: false }))}</span>` : ''}</dd>
    </dl>
    ${st?.rewardReady ? `<p class="reward">${icon('gift', 16)} Loyalty reward ready: <b>${esc(s.loyalty.reward)}</b> <button class="btn small" id="redeem">Mark used</button></p>` : ''}
    <div class="actions">${actions.map(([k, label]) => `<button class="btn ${k === 'done' ? 'primary' : k === 'cancelled' || k === 'noshow' ? 'ghost-bad' : ''}" data-status="${k}">${label}</button>`).join('')}</div>
    <div class="actions">${['booked', 'confirmed'].includes(a.status) ? waBtn(c, reminder, { label: 'Send reminder', sent: 'reminder' }) : ''}${a.status === 'done' ? waBtn(c, message('thanks', c, a), { label: 'Send thank-you' }) : ''}
      <button class="btn" id="apEdit">${icon('edit', 16)} Edit / reschedule</button>
      <button class="btn" id="apAgain">${icon('repeat', 16)} Book again</button>
      <button class="icon-btn" id="apDel" aria-label="Delete">${icon('trash', 16)}</button></div>
  </div>`);
  $$('[data-status]', m.el).forEach((b) => {
    b.onclick = () => {
      patch('appts', a.id, { status: b.dataset.status, ...(b.dataset.status === 'done' && a.date > ymd() ? { date: ymd() } : {}) });
      m.close();
      refresh();
      if (b.dataset.status === 'done' && c?.phone) {
        const t = message('thanks', c, get('appts', a.id));
        toastAction(`${isOrders() ? 'Picked up' : 'Done'} ✓`, waBtn(c, t, { label: 'Send thank-you' }));
      } else toast(STATUS[b.dataset.status].name);
    };
  });
  $('[data-sent="reminder"]', m.el)?.addEventListener('click', () => { patch('appts', a.id, { remindedOn: ymd() }); setTimeout(refresh, 100); });
  $('#redeem', m.el)?.addEventListener('click', () => {
    setSettings((x) => { x.redeemed = { ...x.redeemed, [c.id]: (Number(x.redeemed?.[c.id]) || 0) + 1 }; });
    toast('Reward marked as used');
    m.close();
    refresh();
  });
  $('#apEdit', m.el).onclick = () => { m.close(); openBooking({ appt: a }); };
  $('#apAgain', m.el).onclick = () => { m.close(); openBooking({ customerId: a.customerId, staffId: a.staffId, prefill: { serviceIds: a.serviceIds, items: a.items } }); };
  $('#apDel', m.el).onclick = async () => {
    if (!(await confirmBox(`Delete this ${L().booking.toLowerCase()}? Use Cancel instead to keep history.`, { ok: 'Delete', danger: true }))) return;
    remove('appts', a.id);
    m.close();
    refresh();
  };
}

function toastAction(text, html) {
  const m = modal(text, `<div class="row end"><button class="btn" data-close>Close</button>${html}</div>`);
  $('a.wa', m.el)?.addEventListener('click', () => setTimeout(m.close, 200));
}

