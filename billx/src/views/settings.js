// Business profile, industry, tax, numbering, backup and reset.

import {
  settings, flush, persist, setIndustry, exportJSON, importJSON, resetAll, loadSample, DOC_TYPES, peekNumber,
} from '../store.js';
import { STATES, CURRENCIES } from '../calc.js';
import { INDUSTRIES } from '../industries.js';
import { icon, esc, $, toast, confirmBox, options, field, readImage, download } from '../ui.js';
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
      <h3>Business type</h3>
      <p class="muted">Sets the fields on each bill (for hospitals: UHID, IP/OP no., consultant, ward, admission/discharge, insurance share), labels, starter items, default tax and design.</p>
      <div class="ind-grid">${Object.entries(INDUSTRIES).map(([k, v]) => `<label class="ind${k === s.industry ? ' on' : ''}"><input type="radio" name="industry" value="${k}" ${k === s.industry ? 'checked' : ''}><b>${esc(v.name)}</b><small>${esc(v.clientLabel)} · ${esc(v.docTitle)}</small></label>`).join('')}</div>
      ${field('What do you call your customers?', `<input name="clientLabel" value="${esc(s.clientLabel)}">`)}
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
    <div class="row-gap wrap">
      <button class="btn" id="exp">${icon('download')} Download backup</button>
      <label class="btn">${icon('upload')} Restore backup<input type="file" id="imp" accept="application/json,.json" hidden></label>
      <button class="btn" id="sample">${icon('refresh')} Add sample data</button>
      <button class="btn danger-text" id="reset">${icon('trash')} Erase everything</button>
    </div>
  </section>`;

  const form = $('#setForm', main);
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
    if (el.name === 'industry') {
      main.querySelectorAll('.ind').forEach((l) => l.classList.toggle('on', l.contains(el)));
      form.elements.clientLabel.value = INDUSTRIES[el.value].clientLabel;
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
    if (newInd && newInd !== s.industry) {
      const ok = await confirmBox(`Switch to ${INDUSTRIES[newInd].name}?`, 'Labels, fields, default tax and the default design change to suit it, and its starter items are added. Your existing documents are kept.', 'Switch');
      if (ok) setIndustry(newInd);
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
      clientLabel: fd.get('clientLabel') || s.clientLabel,
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

  $('#exp', main).addEventListener('click', () => download(`billing-backup-${new Date().toISOString().slice(0, 10)}.json`, exportJSON()));
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
  $('#reset', main).addEventListener('click', async () => {
    if (await confirmBox('Erase everything?', 'All documents, clients, items and settings in this browser are deleted. Download a backup first if you need it.', 'Erase')) {
      resetAll();
      location.hash = '#/';
      location.reload();
    }
  });
}
