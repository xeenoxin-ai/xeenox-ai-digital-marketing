// Searchable, grouped picker of business types (sectors).
import { groupedIndustries, INDUSTRIES } from '../industries.js';
import { icon, esc, $$ } from '../ui.js';

export function sectorPickerHTML(selected, name = 'industry') {
  const count = Object.keys(INDUSTRIES).length;
  return `<div class="sector-picker">
    <div class="search sp-search">${icon('search', 16)}<input type="search" data-sp-q placeholder="Search ${count} business types: salon, garage, school, jewellery, transport…" aria-label="Search business types"></div>
    ${groupedIndustries().map(([g, list]) => `<div class="sp-group">
      <h4>${esc(g)}</h4>
      <div class="ind-grid">${list.map(([k, v]) => {
    const words = [v.name, g, v.clientLabel, v.docTitle, ...v.items.map((i) => i[0]), ...v.fields.map((f) => f.label), ...v.clientFields.map((f) => f.label), ...v.itemCols.map((f) => f.label)].join(' ').toLowerCase();
    return `<label class="ind${k === selected ? ' on' : ''}" data-s="${esc(words)}"><input type="radio" name="${name}" value="${k}" ${k === selected ? 'checked' : ''}>
        <b>${esc(v.name)}</b><small>${esc(v.clientLabel)}s · ${esc(v.docTitle)}</small></label>`;
  }).join('')}</div></div>`).join('')}
    <p class="muted small sp-none" hidden>No match. Pick <b>Custom (build your own)</b> and add your own fields.</p>
  </div>`;
}

export function bindSectorPicker(root, onPick) {
  const q = root.querySelector('[data-sp-q]');
  q.addEventListener('input', () => {
    const v = q.value.trim().toLowerCase();
    let shown = 0;
    $$('.sp-group', root).forEach((g) => {
      let n = 0;
      $$('.ind', g).forEach((card) => {
        const hit = !v || v.split(/\s+/).every((w) => card.dataset.s.includes(w));
        card.hidden = !hit;
        if (hit) n++;
      });
      g.hidden = !n;
      shown += n;
    });
    root.querySelector('.sp-none').hidden = shown > 0;
  });
  q.addEventListener('keydown', (e) => { if (e.key === 'Enter') e.preventDefault(); });
  root.addEventListener('change', (e) => {
    if (!e.target.matches('.ind input')) return;
    $$('.ind', root).forEach((l) => l.classList.toggle('on', l.contains(e.target)));
    if (onPick) onPick(e.target.value);
  });
}
