// Business profile, industry, tax, numbering, backup and reset.

import {
  settings, flush, persist, setIndustry, exportJSON, importJSON, resetAll, loadSample, DOC_TYPES, peekNumber,
  workspaces, removeWorkspace, activeWorkspace,
} from '../store.js';
import { sectorOf } from '../industries.js';
import { sectorPickerHTML, bindSectorPicker } from './sector-picker.js';
import { STATES, CURRENCIES } from '../calc.js';
import { INDUSTRIES } from '../industries.js';
import { icon, esc, $, toast, confirmBox, options, field, readImage, download } from '../ui.js';
import { lastBackup, markBackup, backupName } from '../safety.js';
import { navigate, setPage, setDirty } from '../router.js';

export function settingsView(main) {
  const s = settings();
  const b = s.business;
  setPage('Settings', '<button class="btn primary" form="setForm">Save settings</button>');
  main.innerHTML = `
  <form id="setForm" class="settings">
    <section class="card">
      <h3>Business profile</h3>
      <div class="grid g3">
        ${field('Business name *', `<input name="b.name" required value="${esc(b.name)}">`)}
        ${field('Tagline', `<input name="b.tagline" value="${esc(b.tagline)}">`)}
        ${field('Registration / licence no.', `<input name="b.regNo" value="${esc(b.regNo)}" placeholder="e.g. Clinical Est. Reg. No.">`)}
        ${field('Address', `<textarea name="b.address" rows="2">${esc(b.address)}</textarea>`, 'span2')}
        ${field('City', `<input name="b.city" value="${esc(b.city)}">`)}
        ${field('State', `<select name="b.state">${options(STATES.map(([c, n]) => [c, `${n} (${c})`]), b.state)}</select>`)}
        ${field('PIN code', `<input name="b.pincode" value="${esc(b.pincode)}">`)}
        ${field('Phone / WhatsApp', `<input name="b.phone" value="${esc(b.phone)}">`)}
        ${field('Email', `<input name="b.email" type="email" value="${esc(b.email)}">`)}
        ${field('Website', `<input name="b.website" value="${esc(b.website)}">`)}
        ${field('GSTIN', `<input name="b.gstin" value="${esc(b.gstin)}" maxlength="15" style="text-transform:uppercase">`)}
        ${field('PAN', `<input name="b.pan" value="${esc(b.pan)}" maxlength="10" style="text-transform:uppercase">`)}
      </div>
      <div class="grid g2">
        ${['logo', 'signature'].map((k) => `<div class="upload"><span>${k === 'logo' ? 'Logo' : 'Signature / seal'}</span>
          <div class="upload-box">${b[k] ? `<img src="${esc(b[k])}" alt="">` : '<span class="muted">None</span>'}</div>
          <div class="row-gap"><label class="btn">${icon('upload')} Upload<input type="file" accept="image/*" data-img="${k}" hidden></label>${b[k] ? `<button type="button" class="btn ghost" data-clear="${k}">Remove</button>` : ''}</div></div>`).join('')}
      </div>
    </section>

    <section class="card">
      <h3>Getting paid</h3>
      <div class="grid g3">
        ${field('UPI ID (for QR & pay button)', `<input name="b.upiId" value="${esc(b.upiId)}" placeholder="name@okhdfcbank">`)}
        ${field('Account name', `<input name="b.accountName" value="${esc(b.accountName)}">`)}
        ${field('Bank', `<input name="b.bankName" value="${esc(b.bankName)}">`)}
        ${field('Account number', `<input name="b.accountNo" value="${esc(b.accountNo)}">`)}
        ${field('IFSC', `<input name="b.ifsc" value="${esc(b.ifsc)}" style="text-transform:uppercase">`)}
        ${field('Branch', `<input name="b.branch" value="${esc(b.branch)}">`)}
      </div>
    </section>

    <section class="card">
      <h3>Business type <small>now: ${esc(INDUSTRIES[s.industry] ? INDUSTRIES[s.industry].name : 'General')}</small></h3>
      <p class="muted">Switching sets the labels, bill fields, starter items, default tax and design for that kind of business. Existing documents are kept.</p>
      <details class="sp-details"><summary class="btn">Change business type</summary>${sectorPickerHTML(s.industry)}</details>
      ${field('What do you call your customers?', `<input name="clientLabel" value="${esc(s.clientLabel)}" placeholder="Customer, Client, Patient, Student, Guest, Member, Tenant…">`)}
    </section>

    <section class="card" id="fieldsCard">
      <h3>Fields on your bills <small>add, rename or remove anything</small></h3>
      <div id="fieldEditor"></div>
    </section>

    <section class="card">
      <h3>Tax & money</h3>
      <div class="grid g3">
        ${field('Currency', `<select name="currency">${options(Object.keys(CURRENCIES).map((c) => [c, `${c} (${CURRENCIES[c].symbol})`]), s.currency)}</select>`)}
        ${field('Tax system', `<select name="taxMode">${options([['gst', 'India GST (CGST+SGST / IGST)'], ['simple', 'Simple tax / VAT'], ['none', 'No tax']], s.taxMode)}</select>`)}
        ${field('Default tax %', `<input name="defaultTax" type="number" step="any" min="0" value="${esc(s.defaultTax)}">`)}
        ${field('Payment due after (days)', `<input name="dueDays" type="number" min="0" value="${esc(s.dueDays)}">`)}
        <label class="check"><input type="checkbox" name="roundOff" ${s.roundOff ? 'checked' : ''}> Round total to whole number</label>
        <label class="check"><input type="checkbox" name="taxInclusive" ${s.taxInclusive ? 'checked' : ''}> Rates already include tax (MRP style)</label>
      </div>
    </section>

    <section class="card">
      <h3>Numbering <small>{YYYY} = year, {FY} = financial year, e.g. INV/{FY}/</small></h3>
      <div class="table-wrap"><table class="table edit-table"><thead><tr><th>Document</th><th>Prefix</th><th>Next no.</th><th>Digits</th><th>Suffix</th><th>Next will be</th></tr></thead>
      <tbody>${Object.entries(DOC_TYPES).map(([k, t]) => `<tr><td>${esc(t.name)}</td>
        <td><input name="n.${k}.prefix" value="${esc(s.numbering[k].prefix)}"></td>
        <td><input name="n.${k}.next" type="number" min="1" value="${esc(s.numbering[k].next)}"></td>
        <td><input name="n.${k}.pad" type="number" min="1" max="8" value="${esc(s.numbering[k].pad)}"></td>
        <td><input name="n.${k}.suffix" value="${esc(s.numbering[k].suffix)}"></td>
        <td><b>${esc(peekNumber(k))}</b></td></tr>`).join('')}</tbody></table></div>
    </section>

    <section class="card">
      <h3>Default text</h3>
      <div class="grid g2">
        ${field('Notes on new documents', `<textarea name="notes" rows="3">${esc(s.notes)}</textarea>`)}
        ${field('Terms on new documents', `<textarea name="terms" rows="3">${esc(s.terms)}</textarea>`)}
      </div>
    </section>
  </form>

  <section class="card">
    <h3>Your data</h3>
    <p class="muted">Everything is saved in this browser on this device. Download a backup regularly and keep it safe; restore it on any device.</p>
    <p class="small">${lastBackup() ? `Last backup: <b>${new Date(lastBackup()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</b>` : '<b class="danger-text">No backup downloaded yet.</b>'} · Tip: send the backup file to yourself on WhatsApp or save it to Google Drive.</p>
    <div class="row-gap wrap">
      <button class="btn" id="exp">${icon('download')} Download backup</button>
      <label class="btn">${icon('upload')} Restore backup<input type="file" id="imp" accept="application/json,.json" hidden></label>
      <button class="btn" id="sample">${icon('refresh')} Add sample data</button>
      <button class="btn danger-text" id="reset">${icon('trash')} Erase this business's data</button>
      ${workspaces().length > 1 ? `<button class="btn danger-text" id="delWs">${icon('trash')} Remove this business from BillX</button>` : ''}
    </div>
    <p class="muted small">Backups cover the business you have open (${esc(b.name)}). Switch business from the sidebar to back up the others.</p>
  </section>`;

  const form = $('#setForm', main);
  bindSectorPicker(form, (key) => { form.elements.clientLabel.value = INDUSTRIES[key].clientLabel; });

  // Editable copy of this business's fields.
  const sec = sectorOf(s);
  const ed = {
    fields: sec.fields.map((f) => ({ ...f })),
    clientFields: sec.clientFields.map((f) => ({ ...f })),
    itemCols: sec.itemCols.filter((c) => !c.hidden).map((f) => ({ ...f })),
    hiddenCols: sec.itemCols.filter((c) => c.hidden),
    insurance: sec.insurance,
  };
  const LISTS = [
    ['fields', 'Bill details', 'Shown with the number and date on every bill: e.g. Vehicle No., Room No., Project, Table, Event date.', true],
    ['clientFields', `${s.clientLabel} fields`, `Saved on each ${s.clientLabel.toLowerCase()} and printed under their name: e.g. Member ID, Age, PAN.`, false],
    ['itemCols', 'Extra item columns', 'Extra columns in the items table: e.g. Batch, Expiry, Size, Colour, Serial / IMEI, Weight.', false],
  ];
  const renderEditor = () => {
    $('#fieldEditor', main).innerHTML = `${LISTS.map(([k, title, help, typed]) => `<div class="fe-block" data-list="${k}">
      <div class="fe-head"><b>${esc(title)}</b><span class="muted small">${esc(help)}</span></div>
      ${ed[k].map((f, i) => `<div class="fe-row" data-i="${i}">
        <input data-fe="label" value="${esc(f.label)}" placeholder="Field name" aria-label="Field name">
        ${typed ? `<select data-fe="type" aria-label="Type">${options([['', 'Text'], ['date', 'Date']], f.type || '')}</select>` : ''}
        <button type="button" class="icon-btn" data-fe-move="-1" aria-label="Move up">${icon('up', 16)}</button>
        <button type="button" class="icon-btn danger" data-fe-del aria-label="Remove">${icon('trash', 16)}</button>
      </div>`).join('') || '<p class="muted small">None.</p>'}
      <button type="button" class="btn ghost" data-fe-add>${icon('plus')} Add</button>
    </div>`).join('')}
    <label class="check"><input type="checkbox" data-fe-ins ${ed.insurance ? 'checked' : ''}> Third-party share on bills (insurance / TPA / sponsor / subsidy pays part, the rest is payable)</label>`;
  };
  renderEditor();
  const feCard = $('#fieldEditor', main);
  feCard.addEventListener('input', (e) => {
    const row = e.target.closest('.fe-row');
    if (!row) return;
    const list = ed[row.closest('[data-list]').dataset.list];
    list[+row.dataset.i][e.target.dataset.fe] = e.target.value;
    setDirty(true);
  });
  feCard.addEventListener('change', (e) => {
    if (e.target.matches('[data-fe-ins]')) { ed.insurance = e.target.checked; setDirty(true); }
  });
  feCard.addEventListener('click', (e) => {
    const block = e.target.closest('[data-list]');
    if (!block) return;
    const isAdd = !!e.target.closest('[data-fe-add]');
    const list = ed[block.dataset.list];
    const row = e.target.closest('.fe-row');
    if (isAdd) list.push({ key: `f${Date.now().toString(36)}`, label: '' });
    else if (row && e.target.closest('[data-fe-del]')) list.splice(+row.dataset.i, 1);
    else if (row && e.target.closest('[data-fe-move]')) {
      const i = +row.dataset.i;
      if (i > 0) [list[i - 1], list[i]] = [list[i], list[i - 1]];
    } else return;
    setDirty(true);
    renderEditor();
    if (isAdd) {
      const inputs = feCard.querySelectorAll(`[data-list="${block.dataset.list}"] [data-fe="label"]`);
      if (inputs.length) inputs[inputs.length - 1].focus();
    }
  });

  form.addEventListener('input', () => setDirty(true));
  form.addEventListener('change', async (e) => {
    const el = e.target;
    if (el.dataset.img) {
      try {
        b[el.dataset.img] = await readImage(el.files[0], el.dataset.img === 'logo' ? 480 : 360);
        if (!flush()) toast('Image too large for browser storage', 'err');
        else toast('Image saved');
        setDirty(false);
        settingsView(main);
      } catch (err) { toast(err.message, 'err'); }
    }
  });
  form.addEventListener('click', (e) => {
    const c = e.target.closest('[data-clear]');
    if (!c) return;
    b[c.dataset.clear] = '';
    flush();
    settingsView(main);
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const newInd = fd.get('industry');
    let switched = false;
    if (newInd && newInd !== s.industry) {
      const ok = await confirmBox(`Switch to ${INDUSTRIES[newInd].name}?`, 'Labels, fields, default tax and the default design change to suit it, and its starter items are added. Your existing documents are kept.', 'Switch');
      if (ok) { setIndustry(newInd); switched = true; }
    }
    if (!switched) {
      const clean = (list) => list.filter((f) => f.label && f.label.trim()).map((f) => ({ ...f, label: f.label.trim() }));
      s.sector = {
        fields: clean(ed.fields),
        clientFields: clean(ed.clientFields),
        itemCols: [...ed.hiddenCols, ...clean(ed.itemCols)],
        insurance: ed.insurance,
      };
    }
    for (const [k, v] of fd.entries()) {
      if (k.startsWith('b.')) b[k.slice(2)] = String(v).trim();
      else if (k.startsWith('n.')) {
        const [, type, prop] = k.split('.');
        s.numbering[type][prop] = ['next', 'pad'].includes(prop) ? Math.max(1, parseInt(v, 10) || 1) : String(v);
      }
    }
    b.gstin = b.gstin.toUpperCase();
    b.pan = b.pan.toUpperCase();
    b.ifsc = b.ifsc.toUpperCase();
    Object.assign(s, {
      clientLabel: switched ? s.clientLabel : (fd.get('clientLabel') || s.clientLabel),
      currency: fd.get('currency'),
      taxMode: fd.get('taxMode'),
      defaultTax: parseFloat(fd.get('defaultTax')) || 0,
      dueDays: parseInt(fd.get('dueDays'), 10) || 0,
      roundOff: fd.has('roundOff'),
      taxInclusive: fd.has('taxInclusive'),
      notes: fd.get('notes'),
      terms: fd.get('terms'),
    });
    persist();
    flush();
    setDirty(false);
    toast('Settings saved');
    settingsView(main);
  });

  $('#exp', main).addEventListener('click', () => { download(backupName(settings().business.name), exportJSON()); markBackup(); toast('Backup saved to your Downloads'); settingsView(main); });
  $('#imp', main).addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!(await confirmBox('Restore this backup?', 'It replaces all data in this browser with the backup.', 'Restore'))) return;
    try {
      importJSON(await f.text());
      toast('Backup restored');
      navigate('#/');
    } catch (err) { toast(err.message, 'err'); }
  });
  $('#sample', main).addEventListener('click', async () => {
    if (await confirmBox('Add sample data?', 'Adds demo clients, items and documents and fills the business profile with sample details. You can edit or delete them later.', 'Add samples')) {
      loadSample(s.industry);
      flush();
      toast('Sample data added');
      navigate('#/');
    }
  });
  const delWs = $('#delWs', main);
  if (delWs) delWs.addEventListener('click', async () => {
    if (await confirmBox(`Remove ${b.name}?`, 'This business and all its documents, customers and items are deleted from this browser. Download a backup first if you need it.', 'Remove business')) {
      removeWorkspace(activeWorkspace());
      location.hash = '#/';
      location.reload();
    }
  });
  $('#reset', main).addEventListener('click', async () => {
    if (await confirmBox('Erase everything?', 'All documents, clients, items and settings in this browser are deleted. Download a backup first if you need it.', 'Erase')) {
      resetAll();
      location.hash = '#/';
      location.reload();
    }
  });
}
