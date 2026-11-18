// Clients / patients / guests: list, profile, statement and portal link.

import { all, get, upsert, remove, settings, flush, DOC_TYPES } from '../store.js';
import { STATES } from '../calc.js';
import { sectorOf } from '../industries.js';
import { fmtDate } from '../templates.js';
import { icon, esc, $, $$, toast, confirmBox, badge, options, field, copyText, printDocs, modal, avatar } from '../ui.js';
import { portalLink } from './documents.js';
import { money, clientLabel, clientBalance, docsWithTotals } from '../helpers.js';
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

export function listView(main, params, query) {
  const label = clientLabel();
  const q = (query.get('q') || '').toLowerCase();
  const firstF = sectorOf(settings()).clientFields[0];
  setPage(`${label}s`, `<a class="btn primary" href="#/client/new">${icon('plus')} New ${esc(label.toLowerCase())}</a>`);
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
    : `<div class="empty">${icon('users', 40)}<p>No ${esc(label.toLowerCase())}s yet.</p><a class="btn primary" href="#/client/new">${icon('plus')} Add ${esc(label.toLowerCase())}</a></div>`}`;
  let t;
  $('#q', main).addEventListener('input', (e) => {
    clearTimeout(t);
    t = setTimeout(() => {
      navigate(`#/clients${e.target.value ? `?q=${encodeURIComponent(e.target.value)}` : ''}`, { replace: true });
      const el = $('#q'); el.focus(); el.setSelectionRange(el.value.length, el.value.length);
    }, 250);
  });
  $$('tr.link', main).forEach((tr) => tr.addEventListener('click', () => navigate(`#/client/${tr.dataset.id}`)));
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
