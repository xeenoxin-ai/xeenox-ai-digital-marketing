// Quick Bill: fast counter billing for crowded shops, restaurants, hotels,
// salons and more. Tap items (or type a name / code and press Enter), pick a
// table if you use them, then one tap to take payment and print.

import {
  all, settings, newDoc, saveDoc, upsert, persist, flush, today,
} from '../store.js';
import { posDefaults } from '../industries.js';
import { upiLink } from '../calc.js';
import { qrSvg } from '../qr.js';
import {
  icon, esc, $, $$, toast, modal, confirmBox, printDocs, printHTML, options, field,
} from '../ui.js';
import { totalsOf, money } from '../helpers.js';
import { setPage, navigate } from '../router.js';
import {
  matchItems, parseQuickEntry, addLine, setQty, categoriesOf, gridItems, kotHTML,
} from '../pos-logic.js';

const KOT_CSS = `<style>.kot{width:72mm;padding:3mm;font:12pt 'JetBrains Mono',ui-monospace,monospace;color:#000}
.kot-h{text-align:center;font-weight:800;border-bottom:1px dashed #000;padding-bottom:2mm;margin-bottom:2mm}
.kot-meta{display:flex;justify-content:space-between;margin-bottom:2mm}.kot table{width:100%;border-collapse:collapse}
.kot td{padding:1mm 0;vertical-align:top}.kot td.q{width:12mm;font-weight:800;font-size:14pt}.kot-note{border-top:1px dashed #000;margin-top:2mm;padding-top:2mm}</style>`;

/** Quick Bill settings for this business (with defaults for its type). */
export function posSettings(s = settings()) {
  const d = posDefaults(s.industry);
  return {
    slot: d.slot, tables: d.tables, autoPrint: true,
    receipt: ['restaurant', 'bakery', 'grocery', 'retail', 'pharmacy'].includes(s.industry) ? 'thermal' : 'design',
    showCodes: true,
    ...(s.pos || {}),
  };
}

const hue = (str) => [...String(str || '')].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 210);

export function quickBillView(main) {
  const s = settings();
  let P = posSettings(s);
  const taxOn = s.taxMode !== 'none';
  let tab = all('items').some((i) => Number(i.sold) > 0) ? 'popular' : 'all';
  let search = '';
  let order = fresh('');

  function fresh(table) {
    const d = newDoc('invoice');
    Object.assign(d, {
      pos: true, items: [], terms: '', notes: '', dueDate: d.date, fields: { ...(table ? { table } : {}) }, client: null, clientId: '',
    });
    return d;
  }
  const openOrders = () => all('docs').filter((d) => d.pos && d.status === 'draft');
  const orderFor = (table) => openOrders().find((d) => (d.fields || {}).table === String(table));

  setPage('Quick Bill', `
    <button class="btn" id="qbHeld" title="Open orders">${icon('pause')}<span class="hide-sm"> Open orders</span> <b id="qbHeldN"></b></button>
    <button class="icon-btn" id="qbSettings" title="Quick Bill settings" aria-label="Quick Bill settings">${icon('settings')}</button>`);

  main.innerHTML = `
  <div class="qb">
    <section class="qb-menu">
      <div class="qb-search">${icon('search', 18)}<input id="qbq" autocomplete="off" spellcheck="false" placeholder="Type item name or code, press Enter"><kbd>/</kbd></div>
      <div class="qb-tabs" id="qbTabs" role="tablist"></div>
      <div class="qb-grid" id="qbGrid"></div>
    </section>
    <aside class="qb-order" id="qbOrder">
      <div class="qb-order-head">
        <div class="qb-order-title"><b id="qbTitle"></b><small id="qbNumber"></small></div>
        <button class="icon-btn qb-close" id="qbClose" aria-label="Back to menu">${icon('x')}</button>
      </div>
      <div class="qb-slots" id="qbSlots"></div>
      <input class="qb-cust" id="qbCust" placeholder="Customer name or phone (optional)" autocomplete="off">
      <div class="qb-lines" id="qbLines"></div>
      <div class="qb-totals" id="qbTotals"></div>
      <div class="qb-actions">
        <div class="qb-row3">
          <button class="btn" id="qbHold" title="Hold order (F4)">${icon('pause', 16)} Hold</button>
          <button class="btn" id="qbKot" title="Print kitchen ticket">${icon('chef', 16)} KOT</button>
          <button class="btn danger-text" id="qbClear" title="Clear">${icon('trash', 16)}</button>
        </div>
        <div class="qb-pay">
          <button class="btn qb-paybtn cash" data-pay="Cash"><span>Cash</span><kbd>F8</kbd></button>
          <button class="btn qb-paybtn upi" data-pay="UPI"><span>UPI</span><kbd>F9</kbd></button>
          <button class="btn qb-paybtn card" data-pay="Card"><span>Card</span><kbd>F10</kbd></button>
        </div>
      </div>
    </aside>
    <button class="qb-mobilebar" id="qbBar"><span id="qbBarCount">0 items</span><b id="qbBarTotal">${money(0)}</b><span>View order ›</span></button>
  </div>`;

  const root = main.firstElementChild;
  const q = $('#qbq', root);

  /* ---------- rendering ---------- */

  function renderTabs() {
    const cats = categoriesOf(gridItems(all('items'), 'all'));
    const tabs = [['popular', 'Popular'], ['all', 'All'], ...cats.map((c) => [c, c])];
    $('#qbTabs', root).innerHTML = tabs.map(([k, l]) => `<button role="tab" class="${k === tab && !search ? 'on' : ''}" data-tab="${esc(k)}" ${k !== 'popular' && k !== 'all' ? `style="--h:${hue(k)}"` : ''}>${esc(l)}</button>`).join('');
  }

  function renderGrid() {
    const items = all('items');
    const list = search ? matchItems(search, items, 120) : gridItems(items, tab);
    const inOrder = Object.fromEntries(order.items.map((l) => [l.itemId, l.qty]));
    if (!items.length) {
      $('#qbGrid', root).innerHTML = `<div class="qb-empty">${icon('box', 40)}<p>Add your menu or products once, then bill with one tap.</p>
        <div class="row-gap wrap"><a class="btn primary" href="#/items?import=1">${icon('upload')} Import 100 items at once</a><a class="btn" href="#/items">${icon('plus')} Add items</a></div></div>`;
      return;
    }
    $('#qbGrid', root).innerHTML = list.map((it) => `<button class="qb-tile${inOrder[it.id] ? ' in' : ''}" data-id="${it.id}" style="--h:${hue(it.category)}">
        ${P.showCodes && it.code ? `<span class="qb-code">${esc(it.code)}</span>` : ''}
        ${inOrder[it.id] ? `<span class="qb-badge">${inOrder[it.id]}</span>` : ''}
        <span class="qb-name">${esc(it.name)}</span><span class="qb-price">${money(it.rate)}</span></button>`).join('')
      || `<div class="qb-empty"><p>No item matches "${esc(search)}".</p></div>`;
  }

  function renderSlots() {
    const el = $('#qbSlots', root);
    if (!P.slot || !(P.tables > 0)) { el.hidden = true; return; }
    el.hidden = false;
    const busy = Object.fromEntries(openOrders().map((d) => [(d.fields || {}).table, totalsOf(d).payable]));
    const cur = (order.fields || {}).table || '';
    const slots = Array.from({ length: P.tables }, (_, i) => String(i + 1));
    el.innerHTML = `<button class="qb-slot${!cur ? ' on' : ''}" data-slot="">${P.slot === 'Table' ? 'Takeaway' : 'Walk-in'}</button>${slots.map((n) => `<button class="qb-slot${cur === n ? ' on' : ''}${busy[n] !== undefined ? ' busy' : ''}" data-slot="${n}" title="${esc(P.slot)} ${n}${busy[n] !== undefined ? ` · ${money(busy[n])}` : ''}">${esc(P.slot.charAt(0))}${n}</button>`).join('')}`;
  }

  function renderOrder() {
    const t = totalsOf(order, s);
    const table = (order.fields || {}).table;
    $('#qbTitle', root).textContent = table ? `${P.slot} ${table}` : (P.slot === 'Table' ? 'Takeaway' : 'New bill');
    $('#qbNumber', root).textContent = order.id ? `${order.number} · held` : order.number;
    $('#qbLines', root).innerHTML = order.items.length ? order.items.map((l, i) => `<div class="qb-line" data-i="${i}">
        <div class="qb-line-name"><b>${esc(l.name)}</b><small>${money(l.rate)}${l.tax ? ` · ${l.tax}% GST` : ''}</small></div>
        <div class="qb-qty"><button class="icon-btn" data-dq="-1" aria-label="One less">${icon('minus', 16)}</button><input value="${esc(l.qty)}" inputmode="decimal" data-setq aria-label="Quantity"><button class="icon-btn" data-dq="1" aria-label="One more">${icon('plus', 16)}</button></div>
        <b class="qb-line-amt">${money(l.qty * l.rate)}</b></div>`).join('')
      : '<p class="qb-hint">Tap items, or type a name or code and press <kbd>Enter</kbd>.<br><small>Tip: <b>3*12</b> adds 3 of item 12 · <kbd>F8</kbd> Cash · <kbd>F9</kbd> UPI · <kbd>F4</kbd> Hold</small></p>';
    const count = order.items.reduce((a, l) => a + (Number(l.qty) || 0), 0);
    $('#qbTotals', root).innerHTML = `${t.totalTax ? `<div><span>Sub total</span><span>${money(t.taxable)}</span></div><div><span>GST</span><span>${money(t.totalTax)}</span></div>` : ''}
      ${t.roundOff ? `<div><span>Round off</span><span>${money(t.roundOff)}</span></div>` : ''}
      <div class="qb-grand"><span>${count} item${count === 1 ? '' : 's'}</span><b>${money(t.payable)}</b></div>`;
    $('#qbBarCount', root).textContent = `${count} item${count === 1 ? '' : 's'}`;
    $('#qbBarTotal', root).textContent = money(t.payable);
    root.classList.toggle('has-items', count > 0);
    const n = openOrders().length;
    $('#qbHeldN').textContent = n ? n : '';
  }

  const renderAll = () => { renderTabs(); renderGrid(); renderSlots(); renderOrder(); };
  renderAll();
  setTimeout(() => q.focus(), 50);

  /* ---------- actions ---------- */

  function add(item, qty = 1) {
    order.items = addLine(order.items, item, qty, taxOn);
    if (order.id) saveDoc(order);
    renderGrid();
    renderOrder();
    const tile = $(`.qb-tile[data-id="${item.id}"]`, root);
    if (tile) { tile.classList.remove('pop'); void tile.offsetWidth; tile.classList.add('pop'); }
  }

  function changeQty(i, qty) {
    order.items = setQty(order.items, i, qty);
    if (order.id) saveDoc(order);
    renderGrid();
    renderOrder();
  }

  function attachCustomer() {
    const v = $('#qbCust', root).value.trim();
    if (!v) { order.client = null; order.clientId = ''; return; }
    const digits = v.replace(/\D/g, '');
    const c = all('clients').find((x) => (digits.length >= 6 && String(x.phone || '').replace(/\D/g, '').endsWith(digits.slice(-10)))
      || x.name.toLowerCase() === v.toLowerCase());
    if (c) { order.clientId = c.id; order.client = { id: c.id, name: c.name, phone: c.phone, extra: {} }; } else {
      order.clientId = '';
      order.client = digits.length >= 6 ? { name: 'Customer', phone: v, extra: {} } : { name: v, extra: {} };
    }
  }

  function hold(silent = false) {
    if (!order.items.length) { if (!silent) toast('Nothing to hold yet', 'err'); return false; }
    attachCustomer();
    order.status = 'draft';
    saveDoc(order);
    flush();
    if (!silent) toast(`Held: ${(order.fields || {}).table ? `${P.slot} ${order.fields.table}` : order.number}`);
    return true;
  }

  function load(table) {
    const existing = table ? orderFor(table) : null;
    order = existing ? JSON.parse(JSON.stringify(existing)) : fresh(table);
    $('#qbCust', root).value = order.client ? (order.client.phone && order.client.name === 'Customer' ? order.client.phone : order.client.name) : '';
    renderAll();
  }

  function pickSlot(table) {
    const cur = (order.fields || {}).table || '';
    if (table === cur) return;
    if (!order.id && order.items.length) {
      const target = table ? orderFor(table) : null;
      if (!target) { order.fields = { ...order.fields, table }; if (!table) delete order.fields.table; renderSlots(); renderOrder(); return; }
      // Add these items to the table's open order.
      let lines = target.items;
      for (const l of order.items) lines = addLine(lines, { id: l.itemId, name: l.name, rate: l.rate, tax: l.tax, unit: l.unit, hsn: l.hsn, category: l.category }, l.qty, taxOn);
      target.items = lines;
      saveDoc(target);
      toast(`Added to ${P.slot} ${table}`);
      load(table);
      return;
    }
    if (order.id && order.items.length) hold(true);
    load(table);
  }

  function finish(method, ref = '') {
    attachCustomer();
    const t = totalsOf(order, s);
    order.status = 'sent';
    order.payments = [{ id: Date.now().toString(36), date: today(), amount: t.payable, method, ref }];
    order.dueDate = order.date;
    order.template = P.receipt === 'design' ? '' : 'thermal';
    const saved = saveDoc(order);
    // Most-sold items float to the top of "Popular".
    const sold = {};
    for (const l of saved.items) if (l.itemId) sold[l.itemId] = (sold[l.itemId] || 0) + (Number(l.qty) || 0);
    for (const it of all('items')) if (sold[it.id]) upsert('items', { ...it, sold: (Number(it.sold) || 0) + sold[it.id] });
    flush();
    if (P.autoPrint) printDocs([saved], P.receipt === 'thermal58' ? { ...s, design: { ...s.design, paper: '58mm' } } : s);
    toast(`${saved.number} · ${money(t.payable)} · ${method}`);
    order = fresh('');
    $('#qbCust', root).value = '';
    search = '';
    q.value = '';
    root.classList.remove('show-order');
    renderAll();
    q.focus();
  }

  function pay(method) {
    if (!order.items.length) { toast('Add items first', 'err'); return; }
    const t = totalsOf(order, s);
    if (method !== 'UPI') { finish(method); return; }
    const upi = s.business.upiId ? upiLink({ upiId: s.business.upiId, payee: s.business.name, amount: t.payable, note: order.number }) : '';
    const m = modal({
      title: `UPI · ${money(t.payable)}`, submit: 'Payment received', cancel: 'Back',
      body: upi ? `<div class="qb-upi">${qrSvg(upi, { size: 260 })}<p>Customer scans with GPay, PhonePe, Paytm or any UPI app.</p><b>${money(t.payable)}</b></div>`
        : '<p>Add your UPI ID in <a href="#/settings">Settings → Getting paid</a> to show a scan-to-pay QR here. You can still record this as a UPI payment.</p>',
      onSubmit: (fd) => { finish('UPI', fd.get('ref') || ''); },
    });
    m.el.querySelector('.modal-body').insertAdjacentHTML('beforeend', field('UPI reference (optional)', '<input name="ref" placeholder="Last 4–12 digits of UTR">'));
  }

  function kot() {
    if (!order.items.length) { toast('Add items first', 'err'); return; }
    if (!order.id) hold(true);
    printHTML(KOT_CSS + kotHTML({ number: order.number, table: (order.fields || {}).table, slotLabel: P.slot || 'Table', lines: order.items, note: order.notes }));
    renderOrder();
  }

  async function clearOrder() {
    if (!order.items.length) return;
    if (order.id) {
      if (!(await confirmBox('Cancel this order?', `${order.number} will be marked cancelled.`, 'Cancel order'))) return;
      order.status = 'cancelled';
      saveDoc(order);
      flush();
    } else if (!(await confirmBox('Clear the bill?', 'All items in this bill will be removed.', 'Clear'))) return;
    order = fresh('');
    $('#qbCust', root).value = '';
    renderAll();
    q.focus();
  }

  function openHeld() {
    const list = openOrders();
    const mm = modal({
      title: `Open orders (${list.length})`, submit: '', cancel: 'Close',
      body: list.length ? `<div class="ws-list">${list.map((d) => `<button type="button" class="ws-item" data-open="${d.id}"><b>${(d.fields || {}).table ? `${esc(P.slot || 'Table')} ${esc(d.fields.table)}` : esc(d.number)}</b><small>${esc(d.number)} · ${d.items.length} lines · ${money(totalsOf(d).payable)}</small></button>`).join('')}</div>` : '<p class="muted">No held orders.</p>',
    });
    mm.el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-open]');
      if (!b) return;
      if (order.id && order.items.length) hold(true);
      const d = list.find((x) => x.id === b.dataset.open);
      order = JSON.parse(JSON.stringify(d));
      mm.close();
      renderAll();
    });
  }

  function openSettings() {
    modal({
      title: 'Quick Bill settings',
      body: `<div class="grid g2">
        ${field('Bill by', `<select name="slot">${options([['', 'No tables (counter billing)'], ['Table', 'Table'], ['Room', 'Room'], ['Chair', 'Chair'], ['Counter', 'Counter'], ['Seat', 'Seat']], P.slot)}</select>`)}
        ${field('How many', `<input name="tables" type="number" min="0" max="200" value="${P.tables}">`)}
        ${field('Receipt', `<select name="receipt">${options([['thermal', 'Thermal printer 80 mm'], ['thermal58', 'Thermal printer 58 mm'], ['design', 'My invoice design (A4)']], P.receipt)}</select>`)}
        <label class="check"><input type="checkbox" name="autoPrint" ${P.autoPrint ? 'checked' : ''}> Print the bill automatically after payment</label>
        <label class="check"><input type="checkbox" name="showCodes" ${P.showCodes ? 'checked' : ''}> Show item codes on tiles</label>
      </div>
      <p class="muted small">Give items short codes in Items (e.g. 12) to bill by typing the code and pressing Enter. A barcode scanner works the same way.</p>`,
      onSubmit: (fd) => {
        s.pos = {
          slot: fd.get('slot'), tables: Math.max(0, Math.min(200, parseInt(fd.get('tables'), 10) || 0)),
          receipt: fd.get('receipt'), autoPrint: fd.has('autoPrint'), showCodes: fd.has('showCodes'),
        };
        persist();
        P = posSettings(s);
        renderAll();
        toast('Saved');
      },
    });
  }

  /* ---------- events ---------- */

  q.addEventListener('input', () => { search = q.value.trim(); renderTabs(); renderGrid(); });
  q.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const hit = parseQuickEntry(q.value, all('items'));
      if (hit) { add(hit.item, hit.qty); q.value = ''; search = ''; renderTabs(); renderGrid(); } else if (q.value.trim()) toast(`No item "${q.value.trim()}"`, 'err');
    } else if (e.key === 'Escape') { q.value = ''; search = ''; renderTabs(); renderGrid(); }
  });
  root.addEventListener('click', (e) => {
    const tile = e.target.closest('.qb-tile');
    if (tile) { const it = all('items').find((x) => x.id === tile.dataset.id); if (it) add(it); return; }
    const tb = e.target.closest('[data-tab]');
    if (tb) { tab = tb.dataset.tab; search = ''; q.value = ''; renderTabs(); renderGrid(); return; }
    const sl = e.target.closest('[data-slot]');
    if (sl) { pickSlot(sl.dataset.slot); return; }
    const dq = e.target.closest('[data-dq]');
    if (dq) { const i = +dq.closest('.qb-line').dataset.i; changeQty(i, (Number(order.items[i].qty) || 0) + Number(dq.dataset.dq)); return; }
    const pb = e.target.closest('[data-pay]');
    if (pb) { pay(pb.dataset.pay); return; }
    if (e.target.closest('#qbHold')) { if (hold()) { order = fresh(''); renderAll(); q.focus(); } return; }
    if (e.target.closest('#qbKot')) { kot(); return; }
    if (e.target.closest('#qbClear')) { clearOrder(); return; }
    if (e.target.closest('#qbBar')) { root.classList.add('show-order'); return; }
    if (e.target.closest('#qbClose')) { root.classList.remove('show-order'); }
  });
  root.addEventListener('change', (e) => {
    if (e.target.matches('[data-setq]')) changeQty(+e.target.closest('.qb-line').dataset.i, parseFloat(e.target.value));
  });
  $('#qbHeld').addEventListener('click', openHeld);
  $('#qbSettings').addEventListener('click', openSettings);

  const keys = (e) => {
    if (!root.isConnected) { window.removeEventListener('keydown', keys); return; }
    if (document.querySelector('dialog[open]')) return;
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement && document.activeElement.tagName) && document.activeElement !== q;
    if (e.key === 'F8') { e.preventDefault(); pay('Cash'); } else if (e.key === 'F9') { e.preventDefault(); pay('UPI'); } else if (e.key === 'F10') { e.preventDefault(); pay('Card'); } else if (e.key === 'F4') { e.preventDefault(); if (hold()) { order = fresh(''); renderAll(); } } else if ((e.key === '/' || e.key === 'F2') && !typing && document.activeElement !== q) { e.preventDefault(); q.focus(); }
  };
  window.addEventListener('keydown', keys);
  void navigate;
}
