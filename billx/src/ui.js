// Small UI toolkit: icons, toasts, modals, live invoice preview, printing.

import { renderInvoice, esc } from './templates.js';

const P = {
  dashboard: 'M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8M8 9h2',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  box: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.3 7 12 12l8.7-5M12 22V12',
  chart: 'M3 3v18h18M7 16v-4M12 16V8M17 16v-7',
  palette: 'M12 22a10 10 0 1 1 10-10c0 2.8-2.2 4-4 4h-2a2 2 0 0 0-1 3.7A1.5 1.5 0 0 1 12 22zM7.5 10.5h.01M12 7.5h.01M16.5 10.5h.01',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  plus: 'M12 5v14M5 12h14',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  edit: 'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z',
  print: 'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z',
  share: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13',
  copy: 'M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
  cash: 'M2 6h20v12H2zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M6 12h.01M18 12h.01',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4z',
  check: 'M20 6 9 17l-5-5',
  x: 'M18 6 6 18M6 6l12 12',
  up: 'M18 15l-6-6-6 6',
  down: 'M6 9l6 6 6-6',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
  globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
  whatsapp: 'M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 20l1.3-5.2A8.4 8.4 0 1 1 21 11.5z',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6',
  back: 'M19 12H5M12 19l-7-7 7-7',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z',
  menu: 'M3 12h18M3 6h18M3 18h18',
  hospital: 'M3 21h18M5 21V7l7-4 7 4v14M10 9h4M12 7v4M9 21v-4h6v4',
  refresh: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
};

export const icon = (name, size = 18) =>
  `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[name] || P.file}"/></svg>`;

export { esc };

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function toast(msg, kind = 'ok') {
  let host = $('#toasts');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toasts';
    host.setAttribute('role', 'status');
    document.body.append(host);
  }
  const el = document.createElement('div');
  el.className = `toast toast-${kind}`;
  el.textContent = msg;
  host.append(el);
  setTimeout(() => el.classList.add('out'), 2600);
  setTimeout(() => el.remove(), 3000);
}

/** Modal dialog. Returns { el, close }. onSubmit(formData) may return false to keep it open. */
export function modal({ title, body, submit = 'Save', cancel = 'Cancel', onSubmit, wide = false, danger = false }) {
  const dlg = document.createElement('dialog');
  dlg.className = `modal${wide ? ' wide' : ''}`;
  dlg.innerHTML = `<form method="dialog" class="modal-form">
    <header class="modal-head"><h2>${esc(title)}</h2><button type="button" class="icon-btn" data-close aria-label="Close">${icon('x')}</button></header>
    <div class="modal-body">${body}</div>
    <footer class="modal-foot">
      ${cancel ? `<button type="button" class="btn" data-close>${esc(cancel)}</button>` : ''}
      ${submit ? `<button type="submit" class="btn ${danger ? 'danger' : 'primary'}">${esc(submit)}</button>` : ''}
    </footer></form>`;
  document.body.append(dlg);
  const close = () => { dlg.close(); dlg.remove(); };
  dlg.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]') || e.target === dlg) close();
  });
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dlg.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!onSubmit) return close();
    const res = await onSubmit(new FormData(e.target), dlg);
    if (res !== false) close();
  });
  dlg.showModal();
  const first = dlg.querySelector('input:not([type=hidden]),select,textarea');
  if (first) first.focus();
  return { el: dlg, close };
}

export function confirmBox(title, text, okLabel = 'Delete') {
  return new Promise((resolve) => {
    let done = false;
    const m = modal({
      title, body: `<p>${esc(text)}</p>`, submit: okLabel, danger: true,
      onSubmit: () => { done = true; resolve(true); },
    });
    m.el.addEventListener('close', () => { if (!done) resolve(false); });
  });
}

const MM = 96 / 25.4;

/** Show a document as a scaled paper preview that fits its container. */
export function mountPreview(host, doc, settings, { maxScale = 1 } = {}) {
  const { html, paper } = renderInvoice(doc, settings);
  host.classList.add('preview-host');
  host.innerHTML = `<div class="paper-scaler"><div class="paper">${html}</div></div>`;
  const scaler = host.firstElementChild;
  const page = scaler.firstElementChild;
  const fit = () => {
    const w = paper.w * MM;
    const avail = host.clientWidth - 2;
    const scale = Math.min(maxScale, avail / w);
    page.style.width = `${w}px`;
    page.style.transform = `scale(${scale})`;
    scaler.style.height = `${page.offsetHeight * scale}px`;
    scaler.style.width = `${w * scale}px`;
  };
  fit();
  if (!host._ro) {
    host._ro = new ResizeObserver(() => host._fit && host._fit());
    host._ro.observe(host);
  }
  host._fit = fit;
  // Images (logo) change height after load.
  page.querySelectorAll('img').forEach((img) => img.complete || img.addEventListener('load', fit, { once: true }));
}

/** Print one or more documents (the browser's "Save as PDF" gives a PDF). */
export function printDocs(docs, settings) {
  const root = document.createElement('div');
  root.id = 'print-root';
  let pageCss = '';
  root.innerHTML = docs.map((d) => {
    const { html, paper } = renderInvoice(d, settings);
    pageCss = paper.h ? `@page { size: ${paper.w}mm ${paper.h}mm; margin: 0; }` : `@page { size: ${paper.w}mm auto; margin: 0; }`;
    return `<div class="print-page">${html}</div>`;
  }).join('');
  const style = document.createElement('style');
  style.id = 'print-page-style';
  style.textContent = pageCss;
  document.head.append(style);
  document.body.append(root);
  document.body.classList.add('printing');
  const cleanup = () => {
    document.body.classList.remove('printing');
    root.remove();
    style.remove();
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  const imgs = [...root.querySelectorAll('img')].filter((i) => !i.complete);
  Promise.all(imgs.map((i) => new Promise((r) => { i.onload = r; i.onerror = r; }))).then(() => {
    setTimeout(() => {
      window.print();
      setTimeout(() => document.body.classList.contains('printing') && cleanup(), 1000);
    }, 50);
  });
}

/** Read an image file and shrink it so it fits comfortably in local storage. */
export function readImage(file, maxSide = 480) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) return reject(new Error('Choose an image file'));
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      if (file.type === 'image/svg+xml' && file.size < 60000) return resolve(reader.result);
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, maxSide / Math.max(img.width, img.height));
        const cv = document.createElement('canvas');
        cv.width = Math.round(img.width * k);
        cv.height = Math.round(img.height * k);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        const png = cv.toDataURL('image/png');
        const jpg = cv.toDataURL('image/jpeg', 0.85);
        resolve(png.length < jpg.length * 1.6 ? png : jpg);
      };
      img.onerror = () => reject(new Error('Could not read that image'));
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export function download(name, text, type = 'application/json') {
  const blob = new Blob([text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

export const STATUS_LABEL = {
  draft: 'Draft', sent: 'Unpaid', partial: 'Partly paid', paid: 'Paid', overdue: 'Overdue', cancelled: 'Cancelled',
  awaiting: 'Awaiting reply', accepted: 'Accepted', declined: 'Declined', expired: 'Expired', converted: 'Converted', issued: 'Issued',
};
export const badge = (status) => `<span class="badge b-${status}">${STATUS_LABEL[status] || status}</span>`;

export function options(list, selected) {
  return list.map(([v, label]) => `<option value="${esc(v)}"${String(v) === String(selected) ? ' selected' : ''}>${esc(label)}</option>`).join('');
}

/** Field markup: label + input. */
export function field(label, input, cls = '') {
  return `<label class="fld ${cls}"><span>${esc(label)}</span>${input}</label>`;
}
export const input = (name, value = '', attrs = '') => `<input name="${esc(name)}" value="${esc(value)}" ${attrs}>`;
