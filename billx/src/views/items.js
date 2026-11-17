// Item / service catalogue with inline editing, short codes for fast billing,
// bulk import (paste from Excel / WhatsApp or a CSV file) and CSV export.

import { all, upsert, remove, settings, flush } from '../store.js';
import { starterItems, industry } from '../industries.js';
import { icon, esc, $, $$, toast, confirmBox, modal, download } from '../ui.js';
import { money, toCSV } from '../helpers.js';
import { setPage } from '../router.js';
import { parseItemList } from '../pos-logic.js';

const SAMPLE = `Code,Name,Price,Category,GST %,Unit
1,Masala Dosa,90,Breakfast,5,plate
2,Ghee Roast,120,Breakfast,5,plate
3,Chicken Biryani,220,Biryani,5,plate
4,Tea,15,Beverages,5,cup`;

export function itemsView(main, _params, query) {
  const s = settings();
  const defaultTax = s.taxMode === 'none' ? 0 : s.defaultTax;
  setPage('Items & services', `
    <button class="btn" id="addStarter">${icon('download')}<span class="hide-sm"> ${esc(industry(s.industry).name)} starter list</span></button>
    <button class="btn" id="importItems">${icon('upload')}<span class="hide-sm"> Import</span></button>
    <button class="btn" id="exportItems" title="Export CSV">${icon('download')}<span class="hide-sm"> CSV</span></button>
    <button class="btn primary" id="addItem">${icon('plus')} New item</button>`);

  const render = () => {
    const list = all('items');
    const cats = [...new Set(list.map((i) => i.category).filter(Boolean))];
    main.innerHTML = `
      <div class="toolbar"><div class="search">${icon('search', 16)}<input id="q" type="search" placeholder="Filter items"></div>
      <span class="muted">${list.length} items · edit any cell, changes save automatically · give items a short <b>Code</b> to bill by typing it in <a href="#/pos">Quick Bill</a></span></div>
      ${list.length ? `<div class="table-wrap"><table class="table edit-table" id="itemsTable">
        <thead><tr><th>Code</th><th>Name</th><th>Description</th><th>Category</th><th>HSN/SAC</th><th>Unit</th><th class="num">Rate</th><th class="num">Tax %</th><th></th></tr></thead>
        <tbody>${list.map((i) => `<tr data-id="${i.id}" data-s="${esc(`${i.code || ''} ${i.name} ${i.category} ${i.hsn}`.toLowerCase())}">
          <td><input data-k="code" value="${esc(i.code || '')}" size="4" placeholder="—"></td>
          <td><input data-k="name" value="${esc(i.name)}"></td>
          <td><input data-k="description" value="${esc(i.description || '')}"></td>
          <td><input data-k="category" list="icats" value="${esc(i.category || '')}"></td>
          <td><input data-k="hsn" value="${esc(i.hsn || '')}" size="8"></td>
          <td><input data-k="unit" value="${esc(i.unit || '')}" size="6"></td>
          <td class="num"><input data-k="rate" data-num type="number" step="any" value="${esc(i.rate)}"></td>
          <td class="num"><input data-k="tax" data-num type="number" step="any" value="${esc(i.tax)}" size="4"></td>
          <td><button class="icon-btn danger" data-del aria-label="Delete">${icon('trash', 16)}</button></td></tr>`).join('')}</tbody></table></div>
        <datalist id="icats">${cats.map((c) => `<option value="${esc(c)}">`).join('')}</datalist>`
    : `<div class="empty">${icon('box', 40)}<p>Save the products and services you bill often. Picking one on a bill fills rate, tax and HSN.</p>
        <div class="row-gap wrap" style="justify-content:center"><button class="btn primary" data-import>${icon('upload')} Import your full menu / price list</button></div></div>`}`;
    const q = $('#q', main);
    q.addEventListener('input', () => $$('#itemsTable tbody tr', main).forEach((tr) => { tr.hidden = !tr.dataset.s.includes(q.value.toLowerCase()); }));
    $('[data-import]', main)?.addEventListener('click', openImport);
    const table = $('#itemsTable', main);
    if (!table) return;
    table.addEventListener('change', (e) => {
      const el = e.target;
      const tr = el.closest('tr');
      const it = all('items').find((x) => x.id === tr.dataset.id);
      if (!it || !el.dataset.k) return;
      const v = el.dataset.num !== undefined ? parseFloat(el.value) || 0 : el.value.trim();
      if (el.dataset.k === 'code' && v && all('items').some((x) => x.id !== it.id && String(x.code || '').toLowerCase() === v.toLowerCase())) {
        toast(`Code ${v} is already used by another item`, 'err');
        el.value = it.code || '';
        return;
      }
      it[el.dataset.k] = v;
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

  function openImport() {
    const m = modal({
      title: 'Import items', submit: 'Import', wide: true,
      body: `<p class="muted">Paste your menu or price list — copied from Excel / Google Sheets, a CSV file, or plain lines like <code>Masala Dosa - 90</code>. Add 100+ items in one go.</p>
        <div class="row-gap wrap" style="margin-bottom:8px">
          <label class="btn">${icon('upload')} Choose CSV file<input type="file" id="impFile" accept=".csv,.txt,text/csv,text/plain" hidden></label>
          <button type="button" class="btn" id="impSample">${icon('download')} Sample CSV</button>
        </div>
        <textarea name="text" id="impText" rows="9" placeholder="${esc(SAMPLE)}" style="width:100%;font-family:ui-monospace,monospace;font-size:13px"></textarea>
        <p class="muted small">Columns: Name, Price, and optionally Category, GST %, Code, Unit, HSN — in any order when the first row has headings. Without headings: name, price, category, GST %, code, unit.</p>
        <label class="check"><input type="checkbox" name="update" checked> Update the price of items that already exist (same name)</label>
        <label class="check"><input type="checkbox" name="codes" checked> Give a number code to items without one (for typing in Quick Bill)</label>
        <div id="impPreview" class="muted small"></div>`,
      onSubmit: (fd) => {
        const { items } = parseItemList(fd.get('text'), { defaultTax });
        if (!items.length) { toast('Nothing to import — check the text', 'err'); return false; }
        const byName = new Map(all('items').map((i) => [i.name.toLowerCase(), i]));
        const usedCodes = new Set(all('items').map((i) => String(i.code || '').toLowerCase()).filter(Boolean));
        let next = Math.max(0, ...all('items').map((i) => (/^\d+$/.test(i.code || '') ? Number(i.code) : 0))) + 1;
        let updated = 0;
        const fresh = [];
        for (const it of items) {
          const ex = byName.get(it.name.toLowerCase());
          if (ex) {
            if (fd.has('update')) {
              Object.assign(ex, { rate: it.rate }, it.category ? { category: it.category } : {}, it.unit ? { unit: it.unit } : {}, it.hsn ? { hsn: it.hsn } : {});
              if (it.code && !usedCodes.has(it.code.toLowerCase())) { ex.code = it.code; usedCodes.add(it.code.toLowerCase()); }
              upsert('items', ex);
              updated++;
            }
            continue;
          }
          let code = it.code && !usedCodes.has(it.code.toLowerCase()) ? it.code : '';
          if (!code && fd.has('codes')) { while (usedCodes.has(String(next))) next++; code = String(next++); }
          if (code) usedCodes.add(code.toLowerCase());
          const obj = { ...it, code, unit: it.unit || (s.industry === 'restaurant' ? 'plate' : 'pcs') };
          fresh.push(obj);
          byName.set(obj.name.toLowerCase(), obj);
        }
        // New items go to the top of the list; add in reverse so the menu keeps its order.
        for (const obj of fresh.reverse()) upsert('items', obj);
        const added = fresh.length;
        flush();
        toast(`Imported: ${added} new${updated ? `, ${updated} updated` : ''}`);
        render();
        return true;
      },
    });
    const ta = $('#impText', m.el);
    const pv = $('#impPreview', m.el);
    const preview = () => {
      const { items, skipped } = parseItemList(ta.value, { defaultTax });
      pv.innerHTML = items.length ? `<b>${items.length} items found</b>${skipped ? ` · ${skipped} lines skipped (no price)` : ''} · e.g. ${items.slice(0, 4).map((i) => `${esc(i.name)} ${money(i.rate)}`).join(', ')}${items.length > 4 ? '…' : ''}` : (ta.value.trim() ? 'No items found yet — each line needs a name and a price.' : '');
    };
    ta.addEventListener('input', preview);
    $('#impFile', m.el).addEventListener('change', async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      ta.value = await f.text();
      preview();
    });
    $('#impSample', m.el).addEventListener('click', () => download('billx-items-sample.csv', SAMPLE, 'text/csv'));
    ta.focus();
  }

  render();
  if (query && query.get('import')) openImport();

  $('#importItems').addEventListener('click', openImport);
  $('#exportItems').addEventListener('click', () => {
    const rows = [['Code', 'Name', 'Price', 'Category', 'GST %', 'Unit', 'HSN', 'Description'],
      ...all('items').map((i) => [i.code || '', i.name, i.rate, i.category || '', i.tax, i.unit || '', i.hsn || '', i.description || ''])];
    download('billx-items.csv', toCSV(rows), 'text/csv');
  });
  $('#addItem').addEventListener('click', () => {
    upsert('items', { name: 'New item', description: '', category: '', hsn: '', unit: 'pcs', rate: 0, tax: defaultTax });
    flush();
    render();
    const first = $('#itemsTable tbody tr input[data-k="name"]', main);
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
