// Client portal: opened from a shared link. Shows the client's statement and
// documents, lets them download/print, pay by UPI and confirm by WhatsApp/email.
import './app.css';
import './invoice.css';
import './portal.css';
import { decodePortal } from './portal-codec.js';
import { computeTotals, docStatus, formatMoney, upiLink } from './calc.js';
import { DOC_TYPES } from './store.js';
import { fmtDate } from './templates.js';
import { icon, esc, mountPreview, printDocs, badge } from './ui.js';
import { qrSvg } from './qr.js';

const root = document.getElementById('portal');

function fail(msg) {
  root.innerHTML = `<div class="portal-card empty">${icon('file', 40)}<h2>Link can't be opened</h2><p>${esc(msg)}</p><p class="muted">Ask the sender for a fresh link.</p></div>`;
}

async function start() {
  const token = location.hash.slice(1);
  if (!token) return fail('This page needs the full link you were sent.');
  let data;
  try {
    data = await decodePortal(token);
  } catch {
    return fail('The link looks incomplete or damaged. Make sure you copied all of it.');
  }
  const s = { ...data.s, numbering: {}, docTitles: data.s.docTitles || {} };
  const b = s.business || {};
  const cur = s.currency || 'INR';
  const money = (n) => formatMoney(n, cur);
  const opts = { sellerState: b.state, taxMode: s.taxMode, roundOff: s.roundOff, taxInclusive: s.taxInclusive };
  const docs = (data.d || []).map((d) => {
    const t = computeTotals(d, opts);
    return { d, t, status: docStatus(d, t) };
  }).sort((a, z) => (z.d.date || '').localeCompare(a.d.date || ''));
  const inv = docs.filter((x) => x.d.type === 'invoice' && x.status !== 'cancelled');
  const billed = inv.reduce((a, x) => a + x.t.payable, 0);
  const paid = inv.reduce((a, x) => a + x.t.paid, 0);
  const credit = docs.filter((x) => x.d.type === 'credit' && x.status !== 'cancelled').reduce((a, x) => a + x.t.total, 0);
  const due = Math.max(0, billed - paid - credit);
  const phone = String(b.phone || '').replace(/\D/g, '');
  const waNum = phone.length === 10 ? `91${phone}` : phone;
  document.title = `${b.name || 'BillX'} · ${data.c.name}`;
  if (s.design && s.design.accent) document.documentElement.style.setProperty('--brand-2', s.design.accent);

  const contactLink = (text) => (waNum
    ? `https://wa.me/${waNum}?text=${encodeURIComponent(text)}`
    : `mailto:${encodeURIComponent(b.email || '')}?subject=${encodeURIComponent(`Message from ${data.c.name}`)}&body=${encodeURIComponent(text)}`);

  const header = `<header class="portal-head">
      ${b.logo ? `<img src="${esc(b.logo)}" alt="" class="portal-logo">` : ''}
      <div><div class="portal-biz">${esc(b.name)}</div><div class="muted small">${[b.phone, b.email, b.website].filter(Boolean).map(esc).join(' · ')}</div></div>
    </header>`;

  function listPage() {
    root.innerHTML = `${header}
      <section class="portal-card">
        <p class="muted">Account statement for</p>
        <h1>${esc(data.c.name)}${data.c.company && data.c.company !== data.c.name ? ` <small>${esc(data.c.company)}</small>` : ''}</h1>
        <div class="kpis">
          <div class="kpi"><span>Total billed</span><b>${money(billed)}</b></div>
          <div class="kpi good"><span>Paid</span><b>${money(paid + credit)}</b></div>
          <div class="kpi ${due > 0.5 ? 'warn' : 'good'}"><span>Balance due</span><b>${money(due)}</b></div>
        </div>
        ${due > 0.5 && cur === 'INR' && b.upiId ? `<a class="btn primary big" href="${esc(upiLink({ upiId: b.upiId, payee: b.name, amount: due, note: `Balance ${data.c.name}` }))}">${icon('cash')} Pay ${money(due)} by UPI</a>` : ''}
        <p class="muted small">As of ${fmtDate((data.at || '').slice(0, 10))}. Payments made after that show up in the next link you receive.</p>
      </section>
      <section class="portal-card">
        <h3>Your documents</h3>
        ${docs.map(({ d, t, status }, i) => `<button class="list-row portal-doc" data-i="${i}">
          <span><b>${esc(d.title || DOC_TYPES[d.type].title)} ${esc(d.number)}</b><small>${fmtDate(d.date)}${d.dueDate && d.type === 'invoice' ? ` · due ${fmtDate(d.dueDate)}` : ''}</small></span>
          <span class="right">${money(t.payable)}${badge(status)}</span></button>`).join('') || '<p class="muted">No documents.</p>'}
      </section>
      <footer class="portal-foot">Shared privately by ${esc(b.name)}. Questions? <a href="${esc(contactLink(`Hello, I have a question about my account (${data.c.name}).`))}" target="_blank" rel="noopener">Contact us</a></footer>`;
    root.querySelectorAll('.portal-doc').forEach((el) => el.addEventListener('click', () => docPage(+el.dataset.i)));
  }

  function docPage(i) {
    const { d, t, status } = docs[i];
    const title = d.title || DOC_TYPES[d.type].title;
    const owing = d.type === 'invoice' || d.type === 'proforma' ? Math.max(0, t.balance) : 0;
    const upi = owing > 0 && cur === 'INR' && b.upiId ? upiLink({ upiId: b.upiId, payee: b.name, amount: owing, note: d.number }) : '';
    root.innerHTML = `${header}
      ${docs.length > 1 ? `<button class="btn ghost" id="back">${icon('back')} All documents</button>` : ''}
      <div class="portal-doc-page">
        <section class="portal-card portal-actions">
          <div class="row-between"><b>${esc(title)} ${esc(d.number)}</b>${badge(status)}</div>
          <div class="bigmoney">${money(owing || t.payable)}</div>
          <div class="muted small">${owing ? 'Amount due' : 'Total'}${d.dueDate && owing ? ` · due ${fmtDate(d.dueDate)}` : ''}</div>
          <button class="btn block" id="print">${icon('download')} Download PDF / Print</button>
          ${upi ? `<a class="btn primary block" href="${esc(upi)}">${icon('cash')} Pay ${money(owing)} with UPI app</a>
            <div class="portal-qr">${qrSvg(upi, { size: 150 })}<span class="muted small">On a computer? Scan with GPay, PhonePe, Paytm or any UPI app.</span></div>` : ''}
          ${owing && b.accountNo ? `<div class="muted small">Bank transfer: ${esc(b.accountName || b.name)} · A/c ${esc(b.accountNo)} · IFSC ${esc(b.ifsc || '')}</div>` : ''}
          ${owing ? `<form id="paidForm" class="paid-form"><label class="fld"><span>Paid already? Reference / UTR</span><input name="ref" placeholder="e.g. 4321 8765 1234"></label>
            <button class="btn block whatsapp">${icon(waNum ? 'whatsapp' : 'mail')} Send payment confirmation</button></form>` : ''}
          ${d.type === 'quote' && !['accepted', 'declined', 'converted'].includes(status) ? `<a class="btn primary block" target="_blank" rel="noopener" href="${esc(contactLink(`Hello, I accept quotation ${d.number} for ${money(t.payable)}. Please go ahead. - ${data.c.name}`))}">${icon('check')} Accept quotation</a>
            <a class="btn block" target="_blank" rel="noopener" href="${esc(contactLink(`Hello, about quotation ${d.number}: I'd like to discuss some changes. - ${data.c.name}`))}">${icon('edit')} Request changes</a>` : ''}
        </section>
        <section class="portal-card portal-preview"><div id="pv"></div></section>
      </div>`;
    mountPreview(document.getElementById('pv'), d, s);
    document.getElementById('print').addEventListener('click', () => printDocs([d], s));
    const back = document.getElementById('back');
    if (back) back.addEventListener('click', listPage);
    const pf = document.getElementById('paidForm');
    if (pf) pf.addEventListener('submit', (e) => {
      e.preventDefault();
      const ref = new FormData(pf).get('ref');
      window.open(contactLink(`Hello, I have paid ${money(owing)} for ${title} ${d.number}.${ref ? ` Reference/UTR: ${ref}.` : ''} - ${data.c.name}`), '_blank', 'noopener');
    });
    window.scrollTo(0, 0);
  }

  if (docs.length === 1) docPage(0); else listPage();
}

start();
window.addEventListener('hashchange', () => location.reload());
