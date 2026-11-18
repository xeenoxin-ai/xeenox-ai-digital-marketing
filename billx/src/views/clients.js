// Clients / patients / guests: list, profile, statement and portal link.

import { all, get, upsert, remove, settings, flush, DOC_TYPES } from '../store.js';
import { STATES } from '../calc.js';
import { sectorOf } from '../industries.js';
import { fmtDate } from '../templates.js';
import { icon, esc, $, $$, toast, confirmBox, badge, options, field, copyText, printDocs, modal, avatar, download } from '../ui.js';
import { parseClientList, mergeClients } from '../collect.js';
import { portalLink } from './documents.js';
import { money, clientLabel, clientBalance, docsWithTotals, toCSV } from '../helpers.js';
import { navigate, setPage, setDirty } from '../router.js';

export function clientFormHTML(c) {
  const s = settings();
  const ind = sectorOf(s);
  const ex = c.extra || {};
  return `<div class="grid g2">
    ${field('Name *', `<input name="name" required value="${esc(c.name || '')}">`)}
    ${field('Company / organisation', `<input name="company" value="${esc(c.company || '')}">`)}
    ${field('Phone / WhatsApp', `<input name="phone" type="tel" value="${esc(c.phone || '')}">`)}
    ${field('Email', `<input name="email" type="email" value="${esc(c.email || '')}">`)}
    ${ind.clientFields.map((f) => field(f.label, f.options
    ? `<select name="x_${f.key}">${options(f.options.map((o) => [o, o || '—']), ex[f.key] || '')}</select>`
    : `<input name="x_${f.key}" value="${esc(ex[f.key] || '')}">`)).join('')}
    ${s.taxMode !== 'none' ? field('GSTIN / Tax ID', `<input name="gstin" value="${esc(c.gstin || '')}" maxlength="15" style="text-transform:uppercase">`) : ''}
    ${field('Address', `<textarea name="address" rows="2">${esc(c.address || '')}</textarea>`, 'span2')}
    ${field('City', `<input name="city" value="${esc(c.city || '')}">`)}
    ${field('PIN code', `<input name="pincode" value="${esc(c.pincode || '')}">`)}
    ${field('State', `<select name="state">${options(STATES.map(([k, n]) => [k, n]), c.state || s.business.state)}</select>`)}
    ${field('Shipping address (if different)', `<textarea name="shipAddress" rows="2">${esc(c.shipAddress || '')}</textarea>`)}
    ${field('Private notes', `<textarea name="notes" rows="2">${esc(c.notes || '')}</textarea>`, 'span2')}
  </div>`;
}

export function readClientForm(fd, base) {
  const c = { ...base, extra: { ...(base.extra || {}) } };
  for (const [k, v] of fd.entries()) {
    if (k.startsWith('x_')) c.extra[k.slice(2)] = String(v).trim();
    else c[k] = String(v).trim();
  }
  if (c.gstin) c.gstin = c.gstin.toUpperCase();
  return c;
}

const SAMPLE_CLIENTS = `Name,Phone,Email,Company,GSTIN,City,State
Ravi Kumar,9847012345,ravi@example.com,Ravi Stores,32ABCDE1234F1Z5,Palakkad,Kerala
Anu Thomas,9000000002,,,,Thrissur,Kerala`;

function openClientImport(label, done) {
  const m = modal({
    title: `Import ${label.toLowerCase()}s`, submit: 'Import', wide: true,
    body: `<p class="muted">Upload your whole ${esc(label.toLowerCase())} list at once: copy from Excel / Google Sheets and paste here, choose a CSV file, or type lines like <code>Ravi 9847012345</code>. Thousands of rows are fine.</p>
      <div class="row-gap wrap" style="margin-bottom:8px">
        <label class="btn">${icon('upload')} Choose CSV file<input type="file" id="ciFile" accept=".csv,.txt,text/csv,text/plain" hidden></label>
        <button type="button" class="btn" id="ciSample">${icon('download')} Sample CSV</button>
      </div>
      <textarea name="text" id="ciText" rows="9" placeholder="${esc(SAMPLE_CLIENTS)}" style="width:100%;font-family:ui-monospace,monospace;font-size:13px"></textarea>
      <p class="muted small">Columns: Name and Phone, and optionally Email, Company, GSTIN, Address, City, State, Pincode, Notes, in any order when the first row has headings. People already saved (same phone number) are updated, not duplicated.</p>
      <div id="ciPreview" class="muted small"></div>`,
    onSubmit: (fd) => {
      const { clients } = parseClientList(fd.get('text'));
      if (!clients.length) { toast('Nothing to import. Each line needs at least a name.', 'err'); return false; }
      const { add, update } = mergeClients(all('clients'), clients);
      for (const c of update) upsert('clients', c);
      for (const c of [...add].reverse()) upsert('clients', c);
      flush();
      toast(`Imported: ${add.length} new${update.length ? `, ${update.length} updated` : ''}`);
      done();
      return true;
    },
  });
  const ta = $('#ciText', m.el);
  const pv = $('#ciPreview', m.el);
  const preview = () => {
    const { clients, skipped } = parseClientList(ta.value);
    if (!clients.length) { pv.textContent = ta.value.trim() ? 'No names found yet.' : ''; return; }
    const { add, update } = mergeClients(all('clients'), clients);
    pv.innerHTML = `<b>${clients.length} found</b>: ${add.length} new, ${update.length} to update${skipped ? `, ${skipped} lines skipped (no name)` : ''} · e.g. ${clients.slice(0, 3).map((c) => esc(`${c.name}${c.phone ? ` ${c.phone}` : ''}`)).join(', ')}${clients.length > 3 ? '…' : ''}`;
  };
  ta.addEventListener('input', preview);
  $('#ciFile', m.el).addEventListener('change', async (e) => { const f = e.target.files[0]; if (f) { ta.value = await f.text(); preview(); } });
  $('#ciSample', m.el).addEventListener('click', () => download('billx-customers-sample.csv', SAMPLE_CLIENTS, 'text/csv'));
  ta.focus();
}

export function listView(main, params, query) {
  const label = clientLabel();
  const q = (query.get('q') || '').toLowerCase();
  const firstF = sectorOf(settings()).clientFields[0];
  setPage(`${label}s`, `<button class="btn" id="cImport">${icon('upload')}<span class="hide-sm"> Import</span></button>
    <button class="btn" id="cExport" title="Export CSV">${icon('download')}<span class="hide-sm"> CSV</span></button>
    <a class="btn primary" href="#/client/new">${icon('plus')} New ${esc(label.toLowerCase())}</a>`);
  const list = all('clients')
    .filter((c) => !q || [c.name, c.company, c.phone, c.email, c.gstin, ...(Object.values(c.extra || {}))].some((v) => String(v || '').toLowerCase().includes(q)))
    .map((c) => ({ c, b: clientBalance(c.id) }))
    .sort((a, b) => b.b.outstanding - a.b.outstanding || a.c.name.localeCompare(b.c.name));
  main.innerHTML = `
    <div class="toolbar"><div class="search">${icon('search', 16)}<input id="q" type="search" placeholder="Search name, phone, ${firstF ? esc(firstF.label) : 'GSTIN'}" value="${esc(q)}"></div></div>
    ${list.length ? `<div class="table-wrap"><table class="table">
      <thead><tr><th>Name</th><th>Contact</th><th class="num">Billed</th><th class="num">Outstanding</th></tr></thead>
      <tbody>${list.map(({ c, b }) => `<tr class="link" data-id="${c.id}">
        <td><span class="who">${avatar(c.name)}<span><b>${esc(c.name)}</b>${c.company && c.company !== c.name ? `<div class="sub">${esc(c.company)}</div>` : ''}${firstF && c.extra && c.extra[firstF.key] ? `<div class="sub">${esc(firstF.label)}: ${esc(c.extra[firstF.key])}</div>` : ''}</span></span></td>
        <td>${esc(c.phone || '')}<div class="sub">${esc(c.email || '')}</div></td>
        <td class="num">${money(b.billed)}</td>
        <td class="num ${b.outstanding > 0.5 ? 'due' : ''}">${money(b.outstanding)}</td></tr>`).join('')}</tbody></table></div>`
    : `<div class="empty">${icon('users', 40)}<p>No ${esc(label.toLowerCase())}s yet. Add one, or upload your whole list from Excel in one go.</p>
      <div class="row-gap wrap" style="justify-content:center"><button class="btn primary" data-cimport>${icon('upload')} Import ${esc(label.toLowerCase())}s</button><a class="btn" href="#/client/new">${icon('plus')} Add one</a></div></div>`}`;
  let t;
  $('#q', main).addEventListener('input', (e) => {
    clearTimeout(t);
    t = setTimeout(() => {
      navigate(`#/clients${e.target.value ? `?q=${encodeURIComponent(e.target.value)}` : ''}`, { replace: true });
      const el = $('#q'); el.focus(); el.setSelectionRange(el.value.length, el.value.length);
    }, 250);
  });
  $$('tr.link', main).forEach((tr) => tr.addEventListener('click', () => navigate(`#/client/${tr.dataset.id}`)));
  const imp = () => openClientImport(label, () => listView(main, params, query));
  $('#cImport').addEventListener('click', imp);
  const ei = $('[data-cimport]', main);
  if (ei) ei.addEventListener('click', imp);
  $('#cExport').addEventListener('click', () => {
    const rows = [['Name', 'Phone', 'Email', 'Company', 'GSTIN', 'Address', 'City', 'State', 'Pincode', 'Notes', 'Billed', 'Outstanding'],
      ...all('clients').map((c) => { const b = clientBalance(c.id); return [c.name, c.phone || '', c.email || '', c.company || '', c.gstin || '', c.address || '', c.city || '', c.state || '', c.pincode || '', c.notes || '', b.billed, b.outstanding]; })];
    download(`billx-${label.toLowerCase()}s.csv`, toCSV(rows), 'text/csv');
  });
}

export function detailView(main, params) {
  const label = clientLabel();
  const isNew = params.id === 'new';
  const c = isNew ? {} : get('clients', params.id);
  if (!c) { main.innerHTML = '<div class="empty"><p>Not found.</p></div>'; setPage('Not found'); return; }

  if (isNew) {
    setPage(`New ${label.toLowerCase()}`, '');
    main.innerHTML = `<form class="card narrow" id="cform">${clientFormHTML(c)}
      <div class="row-gap end"><a class="btn" href="#/clients">Cancel</a><button class="btn primary">${icon('check')} Save</button></div></form>`;
    $('#cform', main).addEventListener('input', () => setDirty(true));
    $('#cform', main).addEventListener('submit', (e) => {
      e.preventDefault();
      const saved = upsert('clients', readClientForm(new FormData(e.target), {}));
      flush();
      setDirty(false);
      toast(`${label} saved`);
      navigate(`#/client/${saved.id}`);
    });
    return;
  }

  const b = clientBalance(c.id);
  const rows = docsWithTotals((d) => d.clientId === c.id);
  setPage(c.name, `
    <a class="btn" href="#/new/invoice?client=${c.id}">${icon('plus')}<span class="hide-sm"> Invoice</span></a>
    <a class="btn" href="#/new/quote?client=${c.id}">${icon('plus')}<span class="hide-sm"> Quote</span></a>
    <button class="btn primary" id="portalBtn">${icon('globe')}<span class="hide-sm"> Client portal</span></button>`);
  main.innerHTML = `
    <div class="kpis">
      <div class="kpi"><span>Billed</span><b>${money(b.billed)}</b></div>
      <div class="kpi"><span>Received</span><b>${money(b.paid)}</b></div>
      ${b.credit ? `<div class="kpi"><span>Credit notes</span><b>${money(b.credit)}</b></div>` : ''}
      <div class="kpi ${b.outstanding > 0.5 ? 'warn' : 'good'}"><span>Outstanding</span><b>${money(b.outstanding)}</b></div>
    </div>
    <div class="two-col">
      <section class="card">
        <div class="row-between"><h3>Documents</h3><button class="btn ghost" id="printStmt">${icon('print')} Print all unpaid</button></div>
        ${rows.length ? `<div class="table-wrap"><table class="table">
          <thead><tr><th>Number</th><th>Date</th><th class="num">Amount</th><th class="num">Balance</th><th>Status</th></tr></thead>
          <tbody>${rows.map(({ d, t, status }) => `<tr class="link" data-doc="${d.id}"><td><b>${esc(d.number)}</b><div class="sub">${esc(DOC_TYPES[d.type].name)}</div></td>
            <td>${fmtDate(d.date)}</td><td class="num">${money(t.payable)}</td><td class="num">${d.type === 'invoice' ? money(Math.max(t.balance, 0)) : '–'}</td><td>${badge(status)}</td></tr>`).join('')}</tbody></table></div>`
    : '<p class="muted">No documents yet.</p>'}
      </section>
      <form class="card" id="cform"><h3>Details</h3>${clientFormHTML(c)}
        <div class="row-gap end"><button type="button" class="btn danger-text" id="delC">${icon('trash')} Delete</button><button class="btn primary">${icon('check')} Save changes</button></div>
      </form>
    </div>`;

  $$('tr[data-doc]', main).forEach((tr) => tr.addEventListener('click', () => navigate(`#/doc/${tr.dataset.doc}`)));
  $('#cform', main).addEventListener('input', () => setDirty(true));
  $('#cform', main).addEventListener('submit', (e) => {
    e.preventDefault();
    upsert('clients', readClientForm(new FormData(e.target), c));
    flush();
    setDirty(false);
    toast('Saved');
    detailView(main, params);
  });
  $('#delC', main).addEventListener('click', async () => {
    if (await confirmBox(`Delete ${c.name}?`, `Their documents stay (with the ${label.toLowerCase()} details copied on them).`)) {
      remove('clients', c.id);
      flush();
      setDirty(false);
      navigate('#/clients');
    }
  });
  $('#printStmt', main).addEventListener('click', () => {
    const unpaid = rows.filter((r) => ['sent', 'partial', 'overdue'].includes(r.status)).map((r) => r.d);
    if (!unpaid.length) return toast('Nothing unpaid', 'err');
    printDocs(unpaid, settings());
  });
  $('#portalBtn').addEventListener('click', () => portalDialog(c));
}

async function portalDialog(c) {
  const docs = all('docs').filter((d) => d.clientId === c.id && d.status !== 'draft');
  const s = settings();
  const m = modal({
    title: `Client portal · ${c.name}`, submit: '', cancel: 'Close', wide: true,
    body: `<p class="muted">One private link with every issued document for ${esc(c.name)} (${docs.length}): statement, outstanding balance, view & download each bill, pay by UPI, and confirm payment or accept quotes by WhatsApp. The data travels in the link; send a fresh link after you add new bills.</p>
      <div class="share-link"><input id="pUrl" readonly value="Preparing link…"><button type="button" class="btn" id="pCopy">${icon('copy')} Copy</button></div>
      <div class="share-btns"><a class="btn whatsapp" id="pWa" target="_blank" rel="noopener">${icon('whatsapp')} WhatsApp</a>
      <a class="btn" id="pMail">${icon('mail')} Email</a><a class="btn" id="pOpen" target="_blank" rel="noopener">${icon('globe')} Open portal</a></div>`,
  });
  if (!docs.length) { $('#pUrl', m.el).value = 'Issue a document first (drafts are not shared).'; return; }
  const url = await portalLink(c, docs);
  const msg = `Hello ${c.name},\n\nYour account with ${s.business.name}: view all your bills, balance and pay online here:\n${url}\n\nThank you.`;
  const phone = String(c.phone || '').replace(/\D/g, '');
  $('#pUrl', m.el).value = url;
  $('#pWa', m.el).href = `https://wa.me/${phone.length === 10 ? `91${phone}` : phone}?text=${encodeURIComponent(msg)}`;
  $('#pMail', m.el).href = `mailto:${encodeURIComponent(c.email || '')}?subject=${encodeURIComponent(`Your account - ${s.business.name}`)}&body=${encodeURIComponent(msg)}`;
  $('#pOpen', m.el).href = url;
  $('#pCopy', m.el).addEventListener('click', async () => { if (await copyText(url)) toast('Link copied'); });
}
