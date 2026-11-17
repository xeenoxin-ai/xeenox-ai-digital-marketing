// Design studio: pick a template, colours, fonts, paper, what to show,
// and rename every label. Live preview on a real (or sample) document.

import { settings, persist, flush, all, newDoc, DEFAULT_LABELS, DEFAULT_SHOW, DOC_TYPES } from '../store.js';
import { starterItems, sectorOf, sampleValue } from '../industries.js';
import { TEMPLATES, FONTS, PAPERS } from '../templates.js';
import { icon, esc, $, $$, toast, mountPreview, options, field, readImage, printDocs } from '../ui.js';
import { setPage } from '../router.js';

const SWATCHES = ['#2563eb', '#0f766e', '#16a34a', '#ea580c', '#b91c1c', '#db2777', '#7c3aed', '#0369a1', '#334155', '#111827', '#a16207', '#be123c'];

const SHOW_LABELS = {
  logo: 'Logo', business: 'Business details', contact: 'Phone / email / website', placeOfSupply: 'Place of supply',
  dueDate: 'Due date', hsn: 'HSN/SAC column', unit: 'Units with quantity', discountCol: 'Discount column (when used)',
  taxCol: 'Tax % column', shipTo: 'Ship-to address', words: 'Amount in words', taxSummary: 'GST summary table',
  bank: 'Bank details', qr: 'UPI QR code', notes: 'Notes', terms: 'Terms', signature: 'Signature block',
  footer: 'Footer / thank-you line', stamp: 'PAID / OVERDUE stamp',
};

function sampleDoc() {
  const s = settings();
  const recent = all('docs').find((d) => d.type === 'invoice') || all('docs')[0];
  if (recent) return JSON.parse(JSON.stringify(recent));
  const d = newDoc('invoice');
  d.number = d.number || 'INV-0001';
  const sec = sectorOf(s);
  d.client = { name: `Sample ${s.clientLabel || 'Customer'}`, company: '', phone: '+91 90000 00000', address: 'MG Road', city: 'Kochi', state: '32', pincode: '682001', extra: Object.fromEntries(sec.clientFields.map((f) => [f.key, sampleValue(f)])) };
  d.fields = Object.fromEntries(sec.fields.map((f) => [f.key, sampleValue(f, 0, d.date)]));
  d.items = starterItems(s.industry).slice(0, 4).map((it, i) => ({ ...it, qty: i + 1, rate: it.rate || 400, discount: 0 }));
  d.status = 'sent';
  return d;
}

export function designView(main) {
  const s = settings();
  const D = s.design;
  D.show = { ...DEFAULT_SHOW, ...D.show };
  D.labels = D.labels || {};
  D.customFields = D.customFields || [];
  const doc = sampleDoc();
  setPage('Invoice design studio', `<button class="btn" id="printSample">${icon('print')}<span class="hide-sm"> Test print</span></button>`);

  main.innerHTML = `
  <div class="editor design">
    <div class="editor-form">
      <section class="card">
        <h3>Template</h3>
        <div class="tpl-grid">${TEMPLATES.map((t) => `<button type="button" class="tpl${t.id === D.template ? ' on' : ''}" data-tpl="${t.id}">
          <div class="tpl-thumb" data-thumb="${t.id}"></div><b>${esc(t.name)}</b><small>${esc(t.note)}</small></button>`).join('')}</div>
      </section>

      <section class="card">
        <h3>Brand & layout</h3>
        <div class="swatches">${SWATCHES.map((c) => `<button type="button" class="sw${c === D.accent ? ' on' : ''}" data-sw="${c}" style="background:${c}" aria-label="Colour ${c}"></button>`).join('')}
          <label class="sw-pick" title="Custom colour"><input type="color" id="accent" value="${esc(D.accent)}"></label></div>
        <div class="grid g3">
          ${field('Font', `<select data-d="font">${options(Object.entries(FONTS).map(([k, f]) => [k, f.name]), D.font)}</select>`)}
          ${field('Paper', `<select data-d="paper">${options(Object.entries(PAPERS).map(([k, p]) => [k, p.name]), D.paper)}</select>`)}
          ${field('Header alignment', `<select data-d="align">${options([['left', 'Left'], ['center', 'Centre'], ['right', 'Right']], D.align)}</select>`)}
          ${field('Spacing', `<select data-d="density">${options([['compact', 'Compact'], ['normal', 'Normal'], ['roomy', 'Roomy']], D.density)}</select>`)}
          <label class="check"><input type="checkbox" data-d="groupByCategory" ${D.groupByCategory ? 'checked' : ''}> Group lines by category with sub-totals</label>
        </div>
        <div class="grid g2">
          <div class="upload">
            <span>Logo</span>
            <div class="upload-box">${s.business.logo ? `<img src="${esc(s.business.logo)}" alt="Logo">` : '<span class="muted">No logo</span>'}</div>
            <div class="row-gap"><label class="btn">${icon('upload')} Upload<input type="file" accept="image/*" data-img="logo" hidden></label>${s.business.logo ? '<button type="button" class="btn ghost" data-clear="logo">Remove</button>' : ''}</div>
          </div>
          <div class="upload">
            <span>Signature / seal</span>
            <div class="upload-box">${s.business.signature ? `<img src="${esc(s.business.signature)}" alt="Signature">` : '<span class="muted">No signature</span>'}</div>
            <div class="row-gap"><label class="btn">${icon('upload')} Upload<input type="file" accept="image/*" data-img="signature" hidden></label>${s.business.signature ? '<button type="button" class="btn ghost" data-clear="signature">Remove</button>' : ''}</div>
          </div>
        </div>
      </section>

      <section class="card">
        <h3>Show on the document</h3>
        <div class="toggles">${Object.entries(SHOW_LABELS).map(([k, l]) => `<label class="check"><input type="checkbox" data-show="${k}" ${D.show[k] ? 'checked' : ''}> ${esc(l)}</label>`).join('')}</div>
      </section>

      <section class="card">
        <h3>Document titles</h3>
        <div class="grid g3">${Object.entries(DOC_TYPES).map(([k, t]) => field(t.name, `<input data-title="${k}" value="${esc(s.docTitles[k] || t.title)}">`)).join('')}</div>
      </section>

      <section class="card">
        <h3>Rename any label <small>leave blank for the default</small></h3>
        <div class="grid g3">${Object.entries(DEFAULT_LABELS).map(([k, v]) => field(v, `<input data-label="${k}" value="${esc(D.labels[k] || '')}" placeholder="${esc(v)}">`)).join('')}</div>
      </section>

      <section class="card">
        <h3>Default extra fields <small>added to every new document</small></h3>
        <div id="dcf"></div>
        <button type="button" class="btn ghost" id="addDcf">${icon('plus')} Add field</button>
        ${field('Footer text', `<input id="footer" value="${esc(s.footer || '')}" placeholder="e.g. This is a computer-generated invoice">`)}
      </section>
    </div>
    <aside class="editor-preview">
      <div class="preview-bar"><span>Preview</span><span class="muted">${all('docs').length ? 'your latest invoice' : 'sample data'}</span></div>
      <div id="preview"></div>
    </aside>
  </div>`;

  const root = main.firstElementChild;
  const pv = $('#preview', main);
  const thumbs = () => $$('[data-thumb]', main).forEach((el) => mountPreview(el, { ...doc, template: el.dataset.thumb, accent: '' }, s, { maxScale: 0.3 }));
  const refresh = (all = false) => {
    persist();
    mountPreview(pv, { ...doc, template: '', accent: '' }, s);
    if (all) thumbs();
  };
  refresh(true);

  const renderDcf = () => {
    $('#dcf', main).innerHTML = D.customFields.map((f, j) => `<div class="cf" data-j="${j}">
      <input data-dcf="label" placeholder="Label" value="${esc(f.label)}"><input data-dcf="value" placeholder="Default value" value="${esc(f.value || '')}">
      <button type="button" class="icon-btn danger" data-dcfdel aria-label="Remove">${icon('trash', 16)}</button></div>`).join('') || '<p class="muted">e.g. "E-way bill No.", "Vehicle No.", "Delivery date".</p>';
  };
  renderDcf();

  root.addEventListener('click', async (e) => {
    const tpl = e.target.closest('[data-tpl]');
    if (tpl) {
      D.template = tpl.dataset.tpl;
      if (D.template === 'thermal') D.paper = '80mm';
      else if (['80mm', '58mm'].includes(D.paper)) D.paper = 'A4';
      $('[data-d="paper"]', main).value = D.paper;
      $$('.tpl', main).forEach((b) => b.classList.toggle('on', b === tpl));
      refresh();
      return;
    }
    const sw = e.target.closest('[data-sw]');
    if (sw) {
      D.accent = sw.dataset.sw;
      $('#accent', main).value = D.accent;
      $$('.sw', main).forEach((b) => b.classList.toggle('on', b === sw));
      refresh(true);
      return;
    }
    const clr = e.target.closest('[data-clear]');
    if (clr) {
      s.business[clr.dataset.clear] = '';
      flush();
      designView(main);
      return;
    }
    if (e.target.closest('#addDcf')) { D.customFields.push({ label: '', value: '' }); renderDcf(); return; }
    if (e.target.closest('[data-dcfdel]')) { D.customFields.splice(+e.target.closest('.cf').dataset.j, 1); renderDcf(); persist(); }
  });

  root.addEventListener('input', (e) => {
    const el = e.target;
    if (el.id === 'accent') { D.accent = el.value; $$('.sw', main).forEach((b) => b.classList.remove('on')); refresh(); }
    else if (el.dataset.label) { if (el.value.trim()) D.labels[el.dataset.label] = el.value; else delete D.labels[el.dataset.label]; refresh(); }
    else if (el.dataset.title) { s.docTitles[el.dataset.title] = el.value; if (el.dataset.title === doc.type) doc.title = el.value; refresh(); }
    else if (el.dataset.dcf) { D.customFields[+el.closest('.cf').dataset.j][el.dataset.dcf] = el.value; persist(); }
    else if (el.id === 'footer') { s.footer = el.value; refresh(); }
  });

  root.addEventListener('change', async (e) => {
    const el = e.target;
    if (el.dataset.d) {
      D[el.dataset.d] = el.type === 'checkbox' ? el.checked : el.value;
      if (el.dataset.d === 'paper' && ['80mm', '58mm'].includes(el.value)) D.template = 'thermal';
      if (el.dataset.d === 'paper' && !['80mm', '58mm'].includes(el.value) && D.template === 'thermal') D.template = 'modern';
      $$('.tpl', main).forEach((b) => b.classList.toggle('on', b.dataset.tpl === D.template));
      refresh(el.dataset.d === 'font');
    } else if (el.dataset.show) {
      D.show[el.dataset.show] = el.checked;
      refresh();
    } else if (el.dataset.img) {
      try {
        s.business[el.dataset.img] = await readImage(el.files[0], el.dataset.img === 'logo' ? 480 : 360);
        if (!flush()) toast('Image too large for browser storage', 'err');
        designView(main);
      } catch (err) { toast(err.message, 'err'); }
    }
  });

  $('#printSample').addEventListener('click', () => printDocs([{ ...doc, template: '', accent: '' }], s));
}
