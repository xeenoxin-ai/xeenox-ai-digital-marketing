// Documents: list, editor (form + live preview) and the document page
// (preview, payments, share, convert, print).

import {
  DOC_TYPES, all, get, settings, newDoc, saveDoc, upsert, remove, duplicateDoc, clientSnapshot, today, flush,
} from '../store.js';
import { STATES, lineValues, upiLink } from '../calc.js';
import { sectorOf } from '../industries.js';
import { TEMPLATES, fmtDate } from '../templates.js';
import { encodePortal, portalPayload } from '../portal-codec.js';
import {
  icon, esc, $, $$, toast, modal, confirmBox, mountPreview, printDocs, badge, options, field, copyText, STATUS_LABEL, avatar,
} from '../ui.js';
import { totalsOf, statusOf, money, clientLabel, docsWithTotals } from '../helpers.js';
import { clientFormHTML, readClientForm } from './clients.js';
import { sendReminder, remindedLabel, repeatDialog } from './remind.js';
import { REPEAT_EVERY } from '../collect.js';
import { navigate, setDirty, setPage } from '../router.js';

/* ------------------------------------------------------------------ list */

const STATUS_FILTERS = ['all', 'draft', 'sent', 'partial', 'overdue', 'paid', 'awaiting', 'accepted', 'cancelled'];

export function listView(main, params, query) {
  const type = params.type || 'all';
  const status = query.get('status') || 'all';
  const q = (query.get('q') || '').toLowerCase();
  setPage(type === 'all' ? 'All documents' : DOC_TYPES[type].plural, `
    <a class="btn primary" href="#/new/${type === 'all' ? 'invoice' : type}">${icon('plus')} New ${type === 'all' ? 'invoice' : DOC_TYPES[type].name.toLowerCase()}</a>`);

  const rows = docsWithTotals((d) => (type === 'all' || d.type === type))
    .filter((r) => status === 'all' || r.status === status || (status === 'sent' && r.status === 'sent'))
    .filter((r) => !q || [r.d.number, r.d.client && r.d.client.name, r.d.client && r.d.client.company, r.d.reference]
      .some((v) => String(v || '').toLowerCase().includes(q)));

  const sum = rows.reduce((a, r) => (r.status === 'cancelled' ? a : { total: a.total + r.t.payable, due: a.due + (r.d.type === 'invoice' ? Math.max(r.t.balance, 0) : 0) }), { total: 0, due: 0 });
  const tabs = [['all', 'All'], ...Object.entries(DOC_TYPES).map(([k, v]) => [k, v.plural])];

  main.innerHTML = `
    <div class="tabs" role="tablist">${tabs.map(([k, l]) => `<a role="tab" class="tab${k === type ? ' on' : ''}" href="#/docs/${k}">${esc(l)}</a>`).join('')}</div>
    <div class="toolbar">
      <div class="search">${icon('search', 16)}<input id="q" type="search" placeholder="Search number, ${esc(clientLabel().toLowerCase())}, reference" value="${esc(q)}"></div>
      <div class="chips">${STATUS_FILTERS.map((s) => `<button class="chip${s === status ? ' on' : ''}" data-status="${s}">${s === 'all' ? 'All' : STATUS_LABEL[s]}</button>`).join('')}</div>
    </div>
    <div class="sumline">${rows.length} document${rows.length === 1 ? '' : 's'} · Total <b>${money(sum.total)}</b> · Outstanding <b>${money(sum.due)}</b></div>
    ${rows.length ? `<div class="table-wrap"><table class="table">
      <thead><tr><th>Number</th><th>${esc(clientLabel())}</th><th>Date</th><th>Due</th><th class="num">Amount</th><th class="num">Balance</th><th>Status</th></tr></thead>
      <tbody>${rows.map(({ d, t, status: st }) => `
        <tr class="link" data-id="${d.id}">
          <td><b>${esc(d.number)}</b><div class="sub">${esc(DOC_TYPES[d.type].name)}</div></td>
          <td><span class="who">${avatar((d.client && d.client.name) || '?')}<span>${esc((d.client && d.client.name) || '—')}${d.client && d.client.company && d.client.company !== d.client.name ? `<div class="sub">${esc(d.client.company)}</div>` : ''}</span></span></td>
          <td>${fmtDate(d.date)}</td><td>${fmtDate(d.dueDate)}</td>
          <td class="num">${money(t.payable)}</td>
          <td class="num">${d.type === 'invoice' ? money(Math.max(t.balance, 0)) : '–'}</td>
          <td>${badge(st)}</td>
        </tr>`).join('')}</tbody></table></div>`
    : `<div class="empty">${icon('file', 40)}<p>No documents here yet.</p><a class="btn primary" href="#/new/${type === 'all' ? 'invoice' : type}">${icon('plus')} Create one</a></div>`}`;

  const go = (patch) => {
    const p = new URLSearchParams(query);
    Object.entries(patch).forEach(([k, v]) => (v && v !== 'all' ? p.set(k, v) : p.delete(k)));
    const s = p.toString();
    navigate(`#/docs/${type}${s ? `?${s}` : ''}`, { replace: true });
  };
  $$('.chip', main).forEach((b) => b.addEventListener('click', () => go({ status: b.dataset.status })));
  let t;
  $('#q', main).addEventListener('input', (e) => {
    clearTimeout(t);
    t = setTimeout(() => {
      go({ q: e.target.value.trim() });
      const el = $('#q');
      if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
    }, 250);
  });
  $$('tr.link', main).forEach((tr) => tr.addEventListener('click', () => navigate(`#/doc/${tr.dataset.id}`)));
}

/* ---------------------------------------------------------------- editor */

let pendingDraft = null;
export function openEditorWith(draft) {
  pendingDraft = draft;
  navigate(`#/new/${draft.type}?draft=1`);
}

const setPath = (obj, path, v) => {
  const keys = path.split('.');
  let o = obj;
  keys.slice(0, -1).forEach((k) => { o[k] = o[k] || {}; o = o[k]; });
  o[keys.at(-1)] = v;
};
const getPath = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);

function statusChoices(type) {
  if (type === 'quote' || type === 'proforma') return ['draft', 'sent', 'accepted', 'declined', 'cancelled'];
  if (type === 'receipt' || type === 'credit') return ['draft', 'issued', 'cancelled'];
  return ['draft', 'sent', 'cancelled'];
}
const STATUS_EDIT_LABEL = { ...STATUS_LABEL, sent: 'Sent / issued' };

export function editorView(main, params, query) {
  const s = settings();
  const ind = sectorOf(s);
  let draft;
  if (params.id) {
    const found = get('docs', params.id);
    if (!found) { main.innerHTML = '<div class="empty"><p>Document not found.</p></div>'; return; }
    draft = JSON.parse(JSON.stringify(found));
  } else if (query.get('draft') && pendingDraft) {
    draft = pendingDraft;
    pendingDraft = null;
  } else {
    draft = newDoc(params.type || 'invoice', query.get('client') || '');
  }
  const isNew = !draft.id;
  const typeName = DOC_TYPES[draft.type].name;
  setPage(`${isNew ? 'New' : 'Edit'} ${typeName.toLowerCase()}`, `
    <button class="btn" id="cancelBtn">Cancel</button>
    <button class="btn" id="printBtn" title="Print or save as PDF">${icon('print')}<span class="hide-sm"> Print</span></button>
    <button class="btn primary" id="saveBtn">${icon('check')} Save</button>`);

  const idOf = (c) => (ind.clientFields[0] && c.extra ? c.extra[ind.clientFields[0].key] : '');
  const catalogue = all('items');
  const cats = [...new Set(catalogue.map((i) => i.category).filter(Boolean))];
  const showCategory = s.design.groupByCategory || ind.itemCols.some((c) => c.key === 'category');
  const extraCols = ind.itemCols.filter((c) => c.key !== 'category');
  const taxOn = s.taxMode !== 'none';

  main.innerHTML = `
  <div class="editor">
    <form class="editor-form" id="docForm" autocomplete="off">
      <section class="card">
        <div class="grid g4">
          ${field('Document', `<select data-f="type">${options(Object.entries(DOC_TYPES).map(([k, v]) => [k, v.name]), draft.type)}</select>`)}
          ${field('Title on document', `<input data-f="title" value="${esc(draft.title)}">`)}
          ${field('Number', `<input data-f="number" value="${esc(draft.number)}" required>`)}
          ${field('Status', `<select data-f="status">${options(statusChoices(draft.type).map((k) => [k, STATUS_EDIT_LABEL[k]]), draft.status)}</select>`)}
          ${field('Date', `<input type="date" data-f="date" value="${esc(draft.date)}">`)}
          ${field(draft.type === 'quote' ? 'Valid till' : 'Due date', `<input type="date" data-f="dueDate" value="${esc(draft.dueDate)}">`)}
          ${s.taxMode === 'gst' ? field('Place of supply', `<select data-f="placeOfSupply">${options(STATES.map(([c, n]) => [c, `${c} - ${n}`]), draft.placeOfSupply)}</select>`) : ''}
          ${field('Reference / PO', `<input data-f="reference" value="${esc(draft.reference || '')}">`)}
        </div>
      </section>

      <section class="card">
        <h3>${esc(clientLabel())}</h3>
        <div class="row-gap">
          <select id="clientSel" class="grow">
            <option value="">— Select ${esc(clientLabel().toLowerCase())} —</option>
            ${options(all('clients').slice().sort((a, b) => a.name.localeCompare(b.name)).map((c) => [c.id, `${c.name}${c.company && c.company !== c.name ? ` · ${c.company}` : ''}${idOf(c) ? ` · ${idOf(c)}` : ''}`]), draft.clientId)}
          </select>
          <button type="button" class="btn" id="newClientBtn">${icon('plus')} New</button>
        </div>
        <div id="clientCard" class="client-card"></div>
      </section>

      ${ind.fields.length ? `<section class="card"><h3>Bill details</h3><div class="grid g3">
        ${ind.fields.map((f) => field(f.label, `<input ${f.type === 'date' ? 'type="date"' : ''} data-ff="${f.key}" value="${esc((draft.fields || {})[f.key] || '')}">`)).join('')}
      </div></section>` : ''}

      <section class="card">
        <h3>Items</h3>
        <div id="lines"></div>
        <div class="row-gap">
          <button type="button" class="btn" id="addLine">${icon('plus')} Add line</button>
          <button type="button" class="btn ghost" id="pickItems">${icon('box')} From catalogue</button>
        </div>
        <datalist id="catalog">${catalogue.map((i) => `<option value="${esc(i.name)}">${esc(i.category || '')} ${money(i.rate)}</option>`).join('')}</datalist>
        <datalist id="cats">${cats.map((c) => `<option value="${esc(c)}">`).join('')}</datalist>
      </section>

      <section class="card">
        <h3>Charges, discount & payments</h3>
        <div class="grid g4">
          ${field('Discount', `<div class="join"><input type="number" step="any" min="0" data-f="discount.value" data-num value="${esc(draft.discount.value)}"><select data-f="discount.type">${options([['%', '%'], ['flat', 'Flat']], draft.discount.type)}</select></div>`)}
          ${field('Shipping / other charges', `<input type="number" step="any" data-f="shipping" data-num value="${esc(draft.shipping)}">`)}
          ${field('Adjustment (+/−)', `<input type="number" step="any" data-f="adjustment" data-num value="${esc(draft.adjustment)}">`)}
          ${field('Advance received', `<input type="number" step="any" min="0" data-f="advance" data-num value="${esc(draft.advance)}">`)}
          ${ind.insurance || draft.insurance ? field(`${s.design.labels.insurance || 'Insurance / third-party share'}`, `<input type="number" step="any" min="0" data-f="insurance" data-num value="${esc(draft.insurance)}">`) : ''}
        </div>
        <div id="sumBox" class="sumbox"></div>
      </section>

      <section class="card">
        <h3>Extra fields <small>shown with the document details</small></h3>
        <div id="customFields"></div>
        <button type="button" class="btn ghost" id="addCf">${icon('plus')} Add field</button>
      </section>

      <section class="card">
        <div class="grid g2">
          ${field('Notes', `<textarea rows="3" data-f="notes">${esc(draft.notes)}</textarea>`)}
          ${field('Terms & conditions', `<textarea rows="3" data-f="terms">${esc(draft.terms)}</textarea>`)}
        </div>
      </section>

      <section class="card">
        <h3>Design for this document</h3>
        <div class="grid g3">
          ${field('Template', `<select data-f="template"><option value="">Default (${esc((TEMPLATES.find((x) => x.id === s.design.template) || TEMPLATES[0]).name)})</option>${options(TEMPLATES.map((x) => [x.id, x.name]), draft.template)}</select>`)}
          ${field('Accent colour', `<div class="join"><input type="color" data-f="accent" value="${esc(draft.accent || s.design.accent)}"><button type="button" class="btn ghost" id="resetAccent">Default</button></div>`)}
          <div class="fld"><span>&nbsp;</span><a class="btn ghost" href="#/design">${icon('palette')} Full design studio</a></div>
        </div>
      </section>
    </form>
    <aside class="editor-preview">
      <div class="preview-bar"><span>Live preview</span><span id="pvTotal"></span></div>
      <div id="preview"></div>
    </aside>
  </div>`;

  const form = $('#docForm', main);
  const pv = $('#preview', main);
  let pvTimer;
  const refresh = (now) => {
    clearTimeout(pvTimer);
    const run = () => {
      if (!form.isConnected) return; // editor already closed (e.g. saved)
      mountPreview(pv, draft, s);
      renderSum();
    };
    if (now) run(); else pvTimer = setTimeout(run, 120);
  };
  const dirty = () => { setDirty(true); refresh(); };

  function renderClient() {
    const c = draft.client;
    const box = $('#clientCard', main);
    if (!c || !c.name) { box.innerHTML = `<p class="muted">Pick a saved ${esc(clientLabel().toLowerCase())} or add a new one.</p>`; return; }
    const ex = ind.clientFields.filter((f) => c.extra && c.extra[f.key]).map((f) => `${esc(f.label)}: ${esc(c.extra[f.key])}`);
    box.innerHTML = `<b>${esc(c.name)}</b>${c.company && c.company !== c.name ? ` · ${esc(c.company)}` : ''}
      <div class="muted">${[c.phone, c.email, c.gstin && `GSTIN ${c.gstin}`, ...ex].filter(Boolean).map(esc).join(' · ')}</div>`;
  }

  function lineHTML(it, i) {
    const amt = lineValues(it).net;
    return `<div class="li" data-i="${i}">
      <div class="li-main">
        <input class="li-name" data-k="name" list="catalog" placeholder="Item or service name" value="${esc(it.name)}">
        <textarea data-k="description" rows="1" placeholder="Description (optional)">${esc(it.description || '')}</textarea>
        ${showCategory || extraCols.length ? `<div class="li-extra">
          ${showCategory ? `<label><span>Category</span><input data-k="category" list="cats" value="${esc(it.category || '')}"></label>` : ''}
          ${extraCols.map((c) => `<label><span>${esc(c.label)}</span><input data-k="${c.key}" value="${esc(it[c.key] || '')}"></label>`).join('')}
        </div>` : ''}
      </div>
      <div class="li-nums">
        ${s.design.show.hsn ? `<label><span>HSN/SAC</span><input data-k="hsn" value="${esc(it.hsn || '')}"></label>` : ''}
        <label><span>Qty</span><input type="number" step="any" data-k="qty" data-num value="${esc(it.qty)}"></label>
        <label><span>Unit</span><input data-k="unit" value="${esc(it.unit || '')}" placeholder="pcs"></label>
        <label><span>Rate</span><input type="number" step="any" data-k="rate" data-num value="${esc(it.rate)}"></label>
        <label><span>Disc %</span><input type="number" step="any" min="0" max="100" data-k="discount" data-num value="${esc(it.discount || 0)}"></label>
        ${taxOn ? `<label><span>Tax %</span><input type="number" step="any" min="0" data-k="tax" data-num value="${esc(it.tax || 0)}" list="taxrates"></label>` : ''}
        <div class="li-amt"><span>Amount</span><b>${money(amt)}</b></div>
      </div>
      <div class="li-act">
        <button type="button" class="icon-btn" data-act="up" title="Move up" aria-label="Move up">${icon('up', 16)}</button>
        <button type="button" class="icon-btn" data-act="down" title="Move down" aria-label="Move down">${icon('down', 16)}</button>
        <button type="button" class="icon-btn" data-act="save" title="Save to catalogue" aria-label="Save to catalogue">${icon('star', 16)}</button>
        <button type="button" class="icon-btn danger" data-act="del" title="Remove line" aria-label="Remove line">${icon('trash', 16)}</button>
      </div>
    </div>`;
  }

  function renderLines() {
    $('#lines', main).innerHTML = `${draft.items.map(lineHTML).join('')}
      <datalist id="taxrates">${[0, 5, 12, 18, 28].map((r) => `<option value="${r}">`).join('')}</datalist>`;
  }

  function renderCustom() {
    $('#customFields', main).innerHTML = (draft.customFields || []).map((f, j) => `
      <div class="cf" data-j="${j}">
        <input data-cf="label" placeholder="Label (e.g. Vehicle No.)" value="${esc(f.label)}">
        <input data-cf="value" placeholder="Value" value="${esc(f.value)}">
        <button type="button" class="icon-btn danger" data-cfdel aria-label="Remove">${icon('trash', 16)}</button>
      </div>`).join('') || '<p class="muted">Add any field you need: vehicle number, PO date, e-way bill, room number…</p>';
  }

  function renderSum() {
    const t = totalsOf(draft, s);
    const rows = [['Sub total', t.gross], t.discountTotal && ['Discount', -t.discountTotal], ['Tax', t.totalTax],
      t.shipping && ['Charges', t.shipping], t.adjustment && ['Adjustment', t.adjustment], t.roundOff && ['Round off', t.roundOff]].filter(Boolean);
    $('#sumBox', main).innerHTML = `${rows.map(([k, v]) => `<div><span>${k}</span><span>${money(v)}</span></div>`).join('')}
      <div class="big"><span>Total</span><span>${money(t.total)}</span></div>
      ${t.insurance ? `<div><span>Insurance</span><span>−${money(t.insurance)}</span></div><div class="big"><span>Payable</span><span>${money(t.payable)}</span></div>` : ''}
      ${t.paid ? `<div><span>Paid</span><span>−${money(t.paid)}</span></div><div class="big"><span>Balance</span><span>${money(t.balance)}</span></div>` : ''}`;
    $('#pvTotal', main).textContent = money(t.insurance ? t.payable : t.total);
    $$('.li', main).forEach((row) => {
      const it = draft.items[+row.dataset.i];
      if (it) row.querySelector('.li-amt b').textContent = money(lineValues(it).net);
    });
  }

  renderClient();
  renderLines();
  renderCustom();
  refresh(true);
  setDirty(false);

  // Header / top-level fields.
  form.addEventListener('input', (e) => {
    const el = e.target;
    const val = el.dataset.num !== undefined ? (el.value === '' ? 0 : parseFloat(el.value)) : el.value;
    if (el.dataset.f) {
      if (el.dataset.f === 'type') return;
      setPath(draft, el.dataset.f, val);
    } else if (el.dataset.ff) {
      draft.fields = draft.fields || {};
      draft.fields[el.dataset.ff] = val;
    } else if (el.dataset.k) {
      const i = +el.closest('.li').dataset.i;
      draft.items[i][el.dataset.k] = val;
    } else if (el.dataset.cf) {
      const j = +el.closest('.cf').dataset.j;
      draft.customFields[j][el.dataset.cf] = val;
    } else return;
    dirty();
  });

  form.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.f === 'type') {
      const t = el.value;
      const keepNumber = !isNew;
      draft.type = t;
      draft.title = s.docTitles[t] || DOC_TYPES[t].title;
      if (!keepNumber) draft.number = newDoc(t).number;
      if (!statusChoices(t).includes(draft.status)) draft.status = 'draft';
      setDirty(true);
      // Re-render the editor around the changed draft.
      pendingDraft = draft;
      editorView(main, { ...params, type: t }, new URLSearchParams('draft=1'));
      setDirty(true);
      return;
    }
    // Picking a catalogue item fills its rate, tax, HSN, unit and category.
    if (el.dataset.k === 'name') {
      const i = +el.closest('.li').dataset.i;
      const hit = catalogue.find((x) => x.name.toLowerCase() === el.value.trim().toLowerCase());
      if (hit) {
        const it = draft.items[i];
        Object.assign(it, { name: hit.name, rate: hit.rate, tax: taxOn ? hit.tax : 0, hsn: hit.hsn || '', unit: hit.unit || '', category: hit.category || '', description: it.description || hit.description || '' });
        renderLines();
        dirty();
        const next = $(`.li[data-i="${i}"] [data-k="qty"]`, main);
        if (next) next.focus();
      }
    }
  });

  $('#clientSel', main).addEventListener('change', (e) => {
    const c = get('clients', e.target.value);
    draft.clientId = c ? c.id : '';
    draft.client = clientSnapshot(c);
    if (c && c.state) {
      draft.placeOfSupply = c.state;
      const pos = $('[data-f="placeOfSupply"]', main);
      if (pos) pos.value = c.state;
    }
    renderClient();
    dirty();
  });

  $('#newClientBtn', main).addEventListener('click', () => {
    modal({
      title: `New ${clientLabel().toLowerCase()}`, body: clientFormHTML({}), wide: true,
      onSubmit: (fd) => {
        const c = readClientForm(fd, {});
        if (!c.name) { toast('Name is required', 'err'); return false; }
        upsert('clients', c);
        const sel = $('#clientSel', main);
        sel.insertAdjacentHTML('beforeend', `<option value="${c.id}">${esc(c.name)}</option>`);
        sel.value = c.id;
        sel.dispatchEvent(new Event('change'));
        toast(`${clientLabel()} saved`);
        return true;
      },
    });
  });

  $('#lines', main).addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const i = +b.closest('.li').dataset.i;
    const it = draft.items;
    if (b.dataset.act === 'del') {
      it.splice(i, 1);
      if (!it.length) it.push(blankLine());
    } else if (b.dataset.act === 'up' && i > 0) [it[i - 1], it[i]] = [it[i], it[i - 1]];
    else if (b.dataset.act === 'down' && i < it.length - 1) [it[i + 1], it[i]] = [it[i], it[i + 1]];
    else if (b.dataset.act === 'save') {
      const line = it[i];
      if (!line.name) return toast('Give the line a name first', 'err');
      const existing = all('items').find((x) => x.name.toLowerCase() === line.name.toLowerCase());
      upsert('items', { ...(existing || {}), name: line.name, description: line.description || '', rate: +line.rate || 0, tax: +line.tax || 0, hsn: line.hsn || '', unit: line.unit || '', category: line.category || '' });
      return toast(existing ? 'Catalogue item updated' : 'Saved to catalogue');
    }
    renderLines();
    dirty();
  });

  const blankLine = () => ({ name: '', description: '', hsn: '', qty: 1, unit: '', rate: 0, discount: 0, tax: taxOn ? s.defaultTax : 0, category: '' });
  $('#addLine', main).addEventListener('click', () => {
    draft.items.push(blankLine());
    renderLines();
    dirty();
    $(`.li[data-i="${draft.items.length - 1}"] .li-name`, main).focus();
  });

  $('#pickItems', main).addEventListener('click', () => {
    const list = all('items');
    if (!list.length) return toast('Your catalogue is empty. Add items in Items.', 'err');
    modal({
      title: 'Add from catalogue', wide: true, submit: 'Add selected',
      body: `<div class="search">${icon('search', 16)}<input id="pickQ" type="search" placeholder="Filter"></div>
        <div class="pick-list">${list.map((x) => `<label class="pick" data-name="${esc(`${x.name} ${x.category}`.toLowerCase())}"><input type="checkbox" name="pick" value="${x.id}"><span>${esc(x.name)}<small>${esc(x.category || '')}</small></span><b>${money(x.rate)}</b></label>`).join('')}</div>`,
      onSubmit: (fd) => {
        const ids = fd.getAll('pick');
        if (draft.items.length === 1 && !draft.items[0].name && !Number(draft.items[0].rate)) draft.items = [];
        for (const id of ids) {
          const x = get('items', id);
          draft.items.push({ ...blankLine(), name: x.name, description: x.description || '', rate: x.rate, tax: taxOn ? x.tax : 0, hsn: x.hsn || '', unit: x.unit || '', category: x.category || '' });
        }
        if (!draft.items.length) draft.items.push(blankLine());
        renderLines();
        dirty();
      },
    });
    $('#pickQ').addEventListener('input', (e) => {
      const v = e.target.value.toLowerCase();
      $$('.pick').forEach((p) => { p.hidden = !p.dataset.name.includes(v); });
    });
  });

  $('#addCf', main).addEventListener('click', () => {
    draft.customFields = draft.customFields || [];
    draft.customFields.push({ label: '', value: '' });
    renderCustom();
    $(`.cf[data-j="${draft.customFields.length - 1}"] input`, main).focus();
  });
  $('#customFields', main).addEventListener('click', (e) => {
    if (!e.target.closest('[data-cfdel]')) return;
    draft.customFields.splice(+e.target.closest('.cf').dataset.j, 1);
    renderCustom();
    dirty();
  });
  $('#resetAccent', main).addEventListener('click', () => {
    draft.accent = '';
    $('[data-f="accent"]', main).value = s.design.accent;
    dirty();
  });

  const save = () => {
    if (!draft.number.trim()) { toast('Number is required', 'err'); return null; }
    const clash = all('docs').find((d) => d.id !== draft.id && d.type === draft.type && d.number === draft.number.trim());
    if (clash) { toast(`${draft.number} already exists. Change the number.`, 'err'); return null; }
    draft.number = draft.number.trim();
    draft.items = draft.items.filter((i) => i.name || Number(i.rate));
    if (!draft.items.length) { toast('Add at least one item', 'err'); draft.items.push(blankLine()); renderLines(); return null; }
    const saved = saveDoc(draft);
    flush();
    setDirty(false);
    return saved;
  };
  $('#saveBtn').addEventListener('click', () => {
    const d = save();
    if (d) { toast(`${typeName} ${d.number} saved`); navigate(`#/doc/${d.id}`); }
  });
  $('#cancelBtn').addEventListener('click', () => history.length > 1 ? history.back() : navigate('#/docs/all'));
  $('#printBtn').addEventListener('click', () => printDocs([draft], s));
  form.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); $('#saveBtn').click(); }
  });
}

/* ------------------------------------------------------------ doc page */

const METHODS = ['Cash', 'UPI', 'Bank transfer', 'Card', 'Cheque', 'Insurance / TPA', 'Wallet', 'Other'];

export function docView(main, params) {
  const s = settings();
  const doc = get('docs', params.id);
  if (!doc) { main.innerHTML = '<div class="empty"><p>Document not found.</p><a class="btn" href="#/docs/all">Back to documents</a></div>'; setPage('Not found'); return; }
  const t = totalsOf(doc);
  const st = statusOf(doc, t);
  const isInv = doc.type === 'invoice' || doc.type === 'proforma';
  setPage(`${DOC_TYPES[doc.type].name} ${doc.number}`, `
    <a class="btn" href="#/edit/${doc.id}">${icon('edit')}<span class="hide-sm"> Edit</span></a>
    <button class="btn" data-a="print">${icon('print')}<span class="hide-sm"> Print / PDF</span></button>
    <button class="btn primary" data-a="share">${icon('share')}<span class="hide-sm"> Share</span></button>`);

  const cl = doc.client || {};
  main.innerHTML = `
  <div class="docpage">
    <div class="docpage-preview"><div id="preview"></div></div>
    <aside class="docpage-side">
      <section class="card">
        <div class="row-between">${badge(st)}<span class="muted">${esc(DOC_TYPES[doc.type].name)}</span></div>
        <div class="bigmoney">${money(t.payable)}</div>
        ${isInv ? `<div class="muted">Paid ${money(t.paid)} · Balance <b>${money(Math.max(t.balance, 0))}</b></div>` : ''}
        <div class="muted">${esc(cl.name || '—')}${cl.phone ? ` · ${esc(cl.phone)}` : ''}</div>
        <div class="muted">Dated ${fmtDate(doc.date)}${doc.dueDate ? ` · ${doc.type === 'quote' ? 'valid till' : 'due'} ${fmtDate(doc.dueDate)}` : ''}</div>
      </section>
      <section class="card actions">
        ${isInv && st !== 'paid' && st !== 'cancelled' ? `<button class="btn primary block" data-a="pay">${icon('cash')} Record payment</button>` : ''}
        ${doc.type === 'invoice' && t.balance > 0.004 && !['draft', 'cancelled'].includes(doc.status) ? `<button class="btn block remind-btn" data-a="remind">${icon('whatsapp')} Send payment reminder</button>${remindedLabel(doc) ? `<p class="muted small remind-note">${esc(remindedLabel(doc))} · ${(doc.reminders || []).length} reminder${(doc.reminders || []).length === 1 ? '' : 's'} sent</p>` : ''}` : ''}
        ${doc.type === 'invoice' && doc.status !== 'cancelled' && !doc.repeatOf ? `<button class="btn block" data-a="repeat">${icon('refresh')} ${doc.repeat && doc.repeat.active ? `Repeats ${esc(REPEAT_EVERY[doc.repeat.every].toLowerCase())} · next ${fmtDate(doc.repeat.next)}` : 'Repeat this bill'}</button>` : ''}
        ${doc.repeatOf && get('docs', doc.repeatOf) ? `<p class="muted small">Created from repeating bill <a href="#/doc/${doc.repeatOf}">${esc(get('docs', doc.repeatOf).number)}</a></p>` : ''}
        ${doc.status === 'draft' ? `<button class="btn block" data-a="sent">${icon('send')} Mark as sent</button>` : ''}
        ${doc.type === 'quote' || doc.type === 'proforma' ? `<button class="btn block" data-a="convert">${icon('refresh')} Convert to invoice</button>` : ''}
        ${doc.type === 'quote' && !['accepted', 'converted'].includes(st) ? `<button class="btn block" data-a="accept">${icon('check')} Mark accepted</button>` : ''}
        ${doc.type === 'invoice' ? `<button class="btn block" data-a="credit">${icon('file')} Create credit note</button>` : ''}
        ${doc.type === 'invoice' && t.paid ? `<button class="btn block" data-a="receipt">${icon('file')} Payment receipt</button>` : ''}
        <button class="btn block" data-a="dup">${icon('copy')} Duplicate</button>
        ${doc.status !== 'cancelled' ? `<button class="btn block" data-a="cancel">${icon('x')} Cancel document</button>` : `<button class="btn block" data-a="restore">${icon('refresh')} Restore</button>`}
        <button class="btn block danger-text" data-a="delete">${icon('trash')} Delete</button>
      </section>
      ${isInv ? `<section class="card">
        <h3>Payments</h3>
        ${doc.advance ? `<div class="pay-row"><span>Advance</span><b>${money(doc.advance)}</b></div>` : ''}
        ${(doc.payments || []).map((p) => `<div class="pay-row"><span>${fmtDate(p.date)} · ${esc(p.method)}${p.ref ? ` · ${esc(p.ref)}` : ''}</span><b>${money(p.amount)}</b>
          <button class="icon-btn danger" data-delpay="${p.id}" aria-label="Remove payment">${icon('trash', 14)}</button></div>`).join('') || (doc.advance ? '' : '<p class="muted">No payments yet.</p>')}
      </section>` : ''}
      ${doc.convertedFrom || doc.convertedTo ? `<section class="card muted">
        ${doc.convertedFrom && get('docs', doc.convertedFrom) ? `From <a href="#/doc/${doc.convertedFrom}">${esc(get('docs', doc.convertedFrom).number)}</a>` : ''}
        ${doc.convertedTo && get('docs', doc.convertedTo) ? `Converted to <a href="#/doc/${doc.convertedTo}">${esc(get('docs', doc.convertedTo).number)}</a>` : ''}
      </section>` : ''}
    </aside>
  </div>`;
  mountPreview($('#preview', main), doc, s);

  const commit = (msg) => { upsert('docs', doc); flush(); if (msg) toast(msg); docView(main, params); };

  const handlers = {
    print: () => printDocs([doc], s),
    share: () => shareDialog(doc, () => docView(main, params)),
    pay: () => paymentDialog(doc, t, () => commit('Payment recorded')),
    remind: async () => { await sendReminder(doc); docView(main, params); },
    repeat: () => repeatDialog(doc, () => docView(main, params)),
    sent: () => { doc.status = 'sent'; doc.sentAt = new Date().toISOString(); commit('Marked as sent'); },
    accept: () => { doc.status = 'accepted'; commit('Marked accepted'); },
    convert: () => {
      const inv = duplicateDoc(doc, 'invoice');
      inv.status = 'draft';
      inv.reference = inv.reference || doc.number;
      const saved = saveDoc(inv);
      doc.convertedTo = saved.id;
      if (doc.type === 'quote') doc.status = 'accepted';
      upsert('docs', doc);
      flush();
      toast(`Invoice ${saved.number} created`);
      navigate(`#/edit/${saved.id}`);
    },
    credit: () => {
      const cn = duplicateDoc(doc, 'credit');
      cn.status = 'issued';
      cn.reference = doc.number;
      cn.dueDate = '';
      cn.notes = `Against invoice ${doc.number} dated ${fmtDate(doc.date)}`;
      openEditorWith(cn);
    },
    receipt: () => {
      const r = duplicateDoc(doc, 'receipt');
      r.items = [{ name: `Payment against ${doc.number}`, description: (doc.payments || []).map((p) => `${fmtDate(p.date)} ${p.method} ${p.ref || ''}`).join('\n'), hsn: '', qty: 1, unit: '', rate: t.paid, discount: 0, tax: 0, category: '' }];
      Object.assign(r, { status: 'issued', reference: doc.number, dueDate: '', discount: { type: '%', value: 0 }, shipping: 0, adjustment: 0, insurance: 0, terms: '' });
      openEditorWith(r);
    },
    dup: () => openEditorWith(duplicateDoc(doc)),
    cancel: async () => { if (await confirmBox('Cancel document?', `${doc.number} stays in your records marked as cancelled.`, 'Cancel document')) { doc.status = 'cancelled'; commit('Cancelled'); } },
    restore: () => { doc.status = 'sent'; commit('Restored'); },
    delete: async () => {
      if (await confirmBox('Delete permanently?', `${doc.number} will be removed. This cannot be undone.`)) {
        remove('docs', doc.id);
        flush();
        toast('Deleted');
        navigate('#/docs/all');
      }
    },
  };
  document.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', () => handlers[b.dataset.a] && handlers[b.dataset.a]()));
  $$('[data-delpay]', main).forEach((b) => b.addEventListener('click', async () => {
    if (await confirmBox('Remove payment?', 'This payment will be removed from the document.', 'Remove')) {
      doc.payments = doc.payments.filter((p) => p.id !== b.dataset.delpay);
      commit('Payment removed');
    }
  }));
}

export function paymentDialog(doc, t, done) {
  const due = Math.max(t.balance, 0);
  modal({
    title: `Record payment · ${doc.number}`,
    body: `<div class="grid g2">
      ${field('Amount', `<input type="number" step="any" min="0" name="amount" value="${due.toFixed(2)}" required>`)}
      ${field('Date', `<input type="date" name="date" value="${today()}">`)}
      ${field('Method', `<select name="method">${options(METHODS.map((m) => [m, m]), 'UPI')}</select>`)}
      ${field('Reference / UTR / cheque no.', '<input name="ref">')}
    </div><p class="muted">Balance due: ${money(due)}</p>`,
    onSubmit: (fd) => {
      const amount = parseFloat(fd.get('amount'));
      if (!(amount > 0)) { toast('Enter an amount', 'err'); return false; }
      doc.payments = doc.payments || [];
      doc.payments.push({ id: Date.now().toString(36), date: fd.get('date') || today(), amount, method: fd.get('method'), ref: fd.get('ref') });
      if (doc.status === 'draft') doc.status = 'sent';
      done();
    },
  });
}

/** Portal link for some of one client's documents. */
export async function portalLink(client, docs) {
  const token = await encodePortal(portalPayload(settings(), client, docs));
  return `${new URL('../portal.html', location.href.split('#')[0]).href}#${token}`;
}

export function shareDialog(doc, done) {
  const s = settings();
  const cl = doc.client || {};
  const t = totalsOf(doc);
  const m = modal({
    title: `Share ${doc.number}`, submit: '', cancel: 'Close', wide: true,
    body: `<p class="muted">Your ${esc(clientLabel().toLowerCase())} opens a private page where they can view, download and pay. The document travels inside the link itself; nothing is uploaded.</p>
      <div class="share-link"><input id="shareUrl" readonly value="Preparing link…"><button class="btn" id="copyLink" type="button">${icon('copy')} Copy</button></div>
      <div class="share-btns">
        <a class="btn whatsapp" id="waBtn" target="_blank" rel="noopener">${icon('whatsapp')} WhatsApp</a>
        <a class="btn" id="mailBtn">${icon('mail')} Email</a>
        <a class="btn" id="openBtn" target="_blank" rel="noopener">${icon('globe')} Open portal</a>
        <button class="btn" id="printShare" type="button">${icon('download')} Save PDF</button>
      </div>
      ${doc.status === 'draft' ? '<label class="check"><input type="checkbox" id="markSent" checked> Mark as sent when I share</label>' : ''}`,
  });
  const root = m.el;
  portalLink(cl.id ? (get('clients', cl.id) || cl) : cl, [{ ...doc, status: doc.status === 'draft' ? 'sent' : doc.status }]).then((url) => {
    const amount = money(t.insurance ? t.payable : t.total);
    const msg = `Hello ${cl.name || ''},\n\nYour ${doc.title || DOC_TYPES[doc.type].title} ${doc.number} for ${amount} from ${s.business.name} is ready.\nView, download & pay: ${url}\n\nThank you.`;
    const phone = String(cl.phone || '').replace(/\D/g, '');
    const wa = `https://wa.me/${phone.length === 10 ? `91${phone}` : phone}?text=${encodeURIComponent(msg)}`;
    $('#shareUrl', root).value = url;
    $('#waBtn', root).href = wa;
    $('#mailBtn', root).href = `mailto:${encodeURIComponent(cl.email || '')}?subject=${encodeURIComponent(`${doc.title || DOC_TYPES[doc.type].title} ${doc.number} - ${s.business.name}`)}&body=${encodeURIComponent(msg)}`;
    $('#openBtn', root).href = url;
    if (url.length > 7000) $('#shareUrl', root).insertAdjacentHTML('afterend', '<p class="muted small">This link is long (a big logo or many lines). It still works when copied; some apps may shorten the preview.</p>');
  });
  const markSent = () => {
    const box = $('#markSent', root);
    if (box && box.checked && doc.status === 'draft') {
      doc.status = 'sent';
      doc.sentAt = new Date().toISOString();
      upsert('docs', doc);
      flush();
      done && done();
    }
  };
  $('#copyLink', root).addEventListener('click', async () => { if (await copyText($('#shareUrl', root).value)) toast('Link copied'); markSent(); });
  ['#waBtn', '#mailBtn', '#openBtn'].forEach((id) => $(id, root).addEventListener('click', markSent));
  $('#printShare', root).addEventListener('click', () => printDocs([doc], s));
}

export { upiLink };
