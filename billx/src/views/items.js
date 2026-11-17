// Item / service catalogue with inline editing.

import { all, upsert, remove, settings, flush } from '../store.js';
import { starterItems, industry } from '../industries.js';
import { icon, esc, $, $$, toast, confirmBox } from '../ui.js';
import { money } from '../helpers.js';
import { setPage } from '../router.js';

export function itemsView(main) {
  const s = settings();
  setPage('Items & services', `
    <button class="btn" id="addStarter">${icon('download')}<span class="hide-sm"> ${esc(industry(s.industry).name)} starter list</span></button>
    <button class="btn primary" id="addItem">${icon('plus')} New item</button>`);

  const render = () => {
    const list = all('items');
    const cats = [...new Set(list.map((i) => i.category).filter(Boolean))];
    main.innerHTML = `
      <div class="toolbar"><div class="search">${icon('search', 16)}<input id="q" type="search" placeholder="Filter items"></div>
      <span class="muted">${list.length} items · edit any cell, changes save automatically</span></div>
      ${list.length ? `<div class="table-wrap"><table class="table edit-table" id="itemsTable">
        <thead><tr><th>Name</th><th>Description</th><th>Category</th><th>HSN/SAC</th><th>Unit</th><th class="num">Rate</th><th class="num">Tax %</th><th></th></tr></thead>
        <tbody>${list.map((i) => `<tr data-id="${i.id}" data-s="${esc(`${i.name} ${i.category} ${i.hsn}`.toLowerCase())}">
          <td><input data-k="name" value="${esc(i.name)}"></td>
          <td><input data-k="description" value="${esc(i.description || '')}"></td>
          <td><input data-k="category" list="icats" value="${esc(i.category || '')}"></td>
          <td><input data-k="hsn" value="${esc(i.hsn || '')}" size="8"></td>
          <td><input data-k="unit" value="${esc(i.unit || '')}" size="6"></td>
          <td class="num"><input data-k="rate" data-num type="number" step="any" value="${esc(i.rate)}"></td>
          <td class="num"><input data-k="tax" data-num type="number" step="any" value="${esc(i.tax)}" size="4"></td>
          <td><button class="icon-btn danger" data-del aria-label="Delete">${icon('trash', 16)}</button></td></tr>`).join('')}</tbody></table></div>
        <datalist id="icats">${cats.map((c) => `<option value="${esc(c)}">`).join('')}</datalist>`
    : `<div class="empty">${icon('box', 40)}<p>Save the products and services you bill often. Picking one on a bill fills rate, tax and HSN.</p></div>`}`;
    const q = $('#q', main);
    q.addEventListener('input', () => $$('#itemsTable tbody tr', main).forEach((tr) => { tr.hidden = !tr.dataset.s.includes(q.value.toLowerCase()); }));
    const table = $('#itemsTable', main);
    if (!table) return;
    table.addEventListener('change', (e) => {
      const el = e.target;
      const tr = el.closest('tr');
      const it = all('items').find((x) => x.id === tr.dataset.id);
      if (!it || !el.dataset.k) return;
      it[el.dataset.k] = el.dataset.num !== undefined ? parseFloat(el.value) || 0 : el.value.trim();
      upsert('items', it);
      flush();
      toast(`Saved · ${it.name} ${money(it.rate)}`);
    });
    table.addEventListener('click', async (e) => {
      if (!e.target.closest('[data-del]')) return;
      const tr = e.target.closest('tr');
      if (await confirmBox('Delete item?', 'It will be removed from the catalogue. Bills that used it are not changed.')) {
        remove('items', tr.dataset.id);
        flush();
        render();
      }
    });
  };
  render();

  $('#addItem').addEventListener('click', () => {
    upsert('items', { name: 'New item', description: '', category: '', hsn: '', unit: 'pcs', rate: 0, tax: s.taxMode === 'none' ? 0 : s.defaultTax });
    flush();
    render();
    const first = $('#itemsTable tbody tr input', main);
    if (first) { first.focus(); first.select(); }
  });
  $('#addStarter').addEventListener('click', () => {
    const have = new Set(all('items').map((i) => i.name.toLowerCase()));
    let n = 0;
    for (const it of starterItems(s.industry)) if (!have.has(it.name.toLowerCase())) { upsert('items', it); n++; }
    flush();
    toast(n ? `Added ${n} items` : 'Starter items are already in your list');
    render();
  });
}
