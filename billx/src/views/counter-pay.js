// Counter payments for shops: UPI QR (with one-time UPI setup right here),
// a full-screen "show to customer" QR, Quick QR for any amount, the
// "Paid ✓ → next bill" confirmation, and Today's report (day close).

import {
  settings, persist, flush, newDoc, saveDoc, today,
} from '../store.js';
import { upiLink } from '../calc.js';
import { qrSvg } from '../qr.js';
import {
  icon, esc, $, modal, toast, printHTML, copyText,
} from '../ui.js';
import { money, docsWithTotals } from '../helpers.js';
import { daySummary } from '../insights.js';
import { billLink, waNumber } from './remind.js';
import { brandTag } from '../site.js';

const validUpi = (v) => /^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(String(v || '').trim());

/** One-time UPI setup form; resolves true once a UPI ID is saved. */
function upiSetupHTML(s) {
  return `<div class="cp-setup">
    <div class="cp-setup-ic">${icon('zap', 22)}</div>
    <h3>Turn on scan-to-pay in 10 seconds</h3>
    <p class="muted">Enter your shop's UPI ID once. Every bill then shows a QR with the exact amount; your customer scans with GPay, PhonePe or Paytm and the money comes straight to your bank.</p>
    <label class="fld"><span>Your UPI ID</span><input name="setupUpi" placeholder="e.g. suryasweets@okaxis" autocomplete="off" value="${esc(s.business.upiId || '')}"></label>
    <p class="muted small">Find it in your UPI app: GPay → tap your photo → <b>UPI ID</b>. PhonePe → profile → <b>UPI ID</b>.</p>
    <p class="cp-err" id="cpErr" role="alert"></p>
    <button type="button" class="btn primary block cp-save">${icon('check')} Save &amp; show QR</button>
  </div>`;
}

function qrPanelHTML(s, amount, note) {
  const link = upiLink({ upiId: s.business.upiId, payee: s.business.name, amount, note });
  return `<div class="cp-qr">
    <div class="cp-amount"><span>Amount</span><b>${money(amount)}</b></div>
    <div class="cp-qrbox">${qrSvg(link, { size: 260 })}</div>
    <p class="cp-to">Paying <b>${esc(s.business.name)}</b> · ${esc(s.business.upiId)}</p>
    <div class="cp-apps"><span>GPay</span><span>PhonePe</span><span>Paytm</span><span>BHIM</span></div>
    <div class="row-gap wrap cp-tools">
      <button type="button" class="btn" data-cp="full">${icon('eye', 16)} Show to customer</button>
      <button type="button" class="btn" data-cp="copy">${icon('copy', 16)} Copy UPI ID</button>
      <button type="button" class="btn ghost" data-cp="change">Change UPI ID</button>
    </div>
    <label class="fld cp-ref"><span>UPI reference (optional)</span><input name="ref" placeholder="Last 4–12 digits of UTR" autocomplete="off"></label>
  </div>`;
}

/** Big QR on a dark screen: turn the phone / monitor towards the customer. */
export function customerScreen(amount, note) {
  const s = settings();
  const link = upiLink({ upiId: s.business.upiId, payee: s.business.name, amount, note });
  // A modal <dialog> sits in the top layer, above the payment popup.
  const el = document.createElement('dialog');
  el.className = 'cp-full';
  el.innerHTML = `<div class="cp-full-in">
    <p class="cp-full-biz">${esc(s.business.name)}</p>
    <b class="cp-full-amt">${money(amount)}</b>
    <div class="cp-full-qr">${qrSvg(link, { size: 340 })}</div>
    <p>Scan with any UPI app · GPay · PhonePe · Paytm · BHIM</p>
    <button type="button" class="btn">${icon('x', 16)} Close</button></div>`;
  document.body.append(el);
  const close = () => { el.close(); el.remove(); };
  el.addEventListener('click', (e) => { if (e.target === el || e.target.closest('button')) close(); });
  el.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  el.showModal();
}

/**
 * UPI payment dialog. Without a UPI ID it first offers a one-time setup.
 * onReceived(ref) is called when the cashier taps "Payment received".
 */
export function upiPayDialog({ amount, note = '', title = '', onReceived }) {
  const s = settings();
  const m = modal({
    title: title || `UPI · ${money(amount)}`, submit: 'Payment received', cancel: 'Back', wide: true,
    body: '<div class="cp-body"></div>',
    onSubmit: (fd) => {
      if (!s.business.upiId && !validUpi(fd.get('setupUpi'))) { toast('Add your UPI ID first, or tap Back and choose Cash', 'err'); return false; }
      onReceived(fd.get('ref') || '');
      return true;
    },
  });
  const body = $('.cp-body', m.el);
  const draw = (setup = !s.business.upiId) => {
    body.innerHTML = setup ? upiSetupHTML(s) : qrPanelHTML(s, amount, note);
    m.el.classList.toggle('cp-setup-mode', setup);
    const inp = body.querySelector('input[name=setupUpi]');
    if (inp) setTimeout(() => inp.focus(), 30);
  };
  draw();
  body.addEventListener('click', async (e) => {
    if (e.target.closest('.cp-save')) {
      const v = String(body.querySelector('input[name=setupUpi]').value || '').trim();
      if (!validUpi(v)) { $('#cpErr', body).textContent = 'That does not look like a UPI ID. It looks like name@bank, e.g. suryasweets@okaxis'; return; }
      s.business.upiId = v;
      persist();
      flush();
      toast('UPI saved. Your bills now show a scan-to-pay QR.');
      draw(false);
      return;
    }
    const b = e.target.closest('[data-cp]');
    if (!b) return;
    if (b.dataset.cp === 'full') customerScreen(amount, note);
    if (b.dataset.cp === 'copy' && (await copyText(s.business.upiId))) toast('UPI ID copied');
    if (b.dataset.cp === 'change') draw(true);
  });
  body.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.name === 'setupUpi') { e.preventDefault(); body.querySelector('.cp-save').click(); }
  });
  return m;
}

/** Quick QR: collect any amount (no items), saved as a paid bill. */
export function quickQrDialog(onSaved) {
  const m = modal({
    title: 'Quick QR · collect any amount', submit: '', cancel: 'Close',
    body: `<div class="cp-quick">
      <label class="fld"><span>Amount (₹)</span><input name="amt" class="cp-amt-in" inputmode="decimal" placeholder="0" autocomplete="off"></label>
      <label class="fld"><span>For (optional)</span><input name="note" placeholder="e.g. Advance for cake order" autocomplete="off"></label>
      <button type="button" class="btn primary block cp-go">${icon('zap')} Show QR</button>
    </div>`,
  });
  const amt = $('input[name=amt]', m.el);
  setTimeout(() => amt.focus(), 30);
  const go = () => {
    const amount = Math.round((parseFloat(String(amt.value).replace(/[₹,\s]/g, '')) || 0) * 100) / 100;
    if (!(amount > 0)) { toast('Enter the amount', 'err'); amt.focus(); return; }
    const note = String($('input[name=note]', m.el).value || '').trim();
    m.close();
    upiPayDialog({
      amount, note: note || 'Payment', title: `Quick QR · ${money(amount)}`,
      onReceived: (ref) => {
        const d = newDoc('invoice');
        Object.assign(d, {
          pos: true, status: 'sent', dueDate: d.date, client: null, clientId: '', terms: '', notes: '', template: 'thermal',
          items: [{ name: note || 'Counter payment', description: '', hsn: '', qty: 1, unit: '', rate: amount, discount: 0, tax: 0, category: '' }],
          payments: [{ id: Date.now().toString(36), date: today(), amount, method: 'UPI', ref }],
        });
        const saved = saveDoc(d);
        flush();
        onSaved(saved, amount);
      },
    });
  };
  m.el.querySelector('.cp-go').addEventListener('click', go);
  amt.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
}

/** "Paid ✓" card after each bill: next bill is already open; WhatsApp or print the receipt. */
export function paidFlash(host, { doc, amount, method, phone, onPrint }) {
  host.querySelector('.qb-paid')?.remove();
  const el = document.createElement('div');
  el.className = 'qb-paid';
  el.innerHTML = `<div class="qb-paid-ic">${icon('check', 22)}</div>
    <div class="qb-paid-txt"><b>Paid ${money(amount)}</b><small>${esc(doc.number)} · ${esc(method)} · next bill ready</small></div>
    <div class="qb-paid-act">
      <button type="button" class="btn" data-pf="wa" title="Send bill on WhatsApp">${icon('whatsapp', 16)}<span class="hide-sm"> Bill</span></button>
      <button type="button" class="btn" data-pf="print" title="Print again">${icon('print', 16)}</button>
      <button type="button" class="icon-btn" data-pf="x" aria-label="Dismiss">${icon('x', 16)}</button>
    </div>`;
  const head = host.querySelector('.qb-order-head');
  if (head) head.after(el); else host.prepend(el);
  const timer = setTimeout(() => el.classList.add('out'), 9000);
  const kill = () => { clearTimeout(timer); el.remove(); };
  el.addEventListener('animationend', (e) => { if (e.animationName === 'qbout') el.remove(); });
  el.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-pf]');
    if (!b) return;
    if (b.dataset.pf === 'x') kill();
    if (b.dataset.pf === 'print') onPrint();
    if (b.dataset.pf === 'wa') {
      const win = window.open('about:blank', '_blank');
      let link = '';
      try { link = await billLink(doc); } catch { /* send without link */ }
      const s = settings();
      const text = `Thank you for shopping at ${s.business.name}!\nYour bill ${doc.number}: ${money(amount)} (paid by ${method}).${link ? `\nView / download: ${link}` : ''}${brandTag()}`;
      const url = `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(text)}`;
      if (win) win.location.href = url; else window.open(url, '_blank', 'noopener');
      kill();
    }
  });
}

const DAY_CSS = `<style>.dayr{width:72mm;padding:3mm;font:10.5pt 'JetBrains Mono',ui-monospace,monospace;color:#000}
.dayr h3{text-align:center;margin:0 0 1mm;font-size:12pt}.dayr .c{text-align:center}.dayr hr{border:0;border-top:1px dashed #000;margin:2mm 0}
.dayr .r{display:flex;justify-content:space-between}.dayr .big{font-size:13pt;font-weight:800}</style>`;

/** Today's report: what was billed and collected, split by Cash / UPI / Card. */
export function todayDialog(date = today()) {
  const s = settings();
  const sum = daySummary(docsWithTotals(), date);
  const max = Math.max(1, ...Object.values(sum.byMethod));
  const nice = new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const bars = ['Cash', 'UPI', 'Card', 'Other'].filter((k) => k !== 'Other' || sum.byMethod.Other)
    .map((k) => `<div class="td-bar"><span>${k}</span><i><b class="m-${k.toLowerCase()}" style="width:${(sum.byMethod[k] / max) * 100}%"></b></i><strong>${money(sum.byMethod[k])}</strong></div>`).join('');
  const m = modal({
    title: `Today · ${nice}`, submit: '', cancel: 'Close', wide: true,
    body: `<div class="td">
      <div class="td-hero"><div><span>Collected today</span><b>${money(sum.collected)}</b></div>
        <div><span>Bills</span><b>${sum.bills}</b></div><div><span>Average bill</span><b>${money(sum.avg)}</b></div>
        <div><span>Billed</span><b>${money(sum.billed)}</b></div></div>
      <h4>Money received</h4>${bars}
      ${sum.unpaid > 0.004 ? `<p class="td-warn">${icon('alert', 16)} ${money(sum.unpaid)} of today's bills is still unpaid.</p>` : ''}
      <h4>Best sellers today</h4>
      ${sum.topItems.length ? `<ol class="td-top">${sum.topItems.map((x) => `<li><span>${esc(x.name)}</span><small>${x.qty} sold</small><b>${money(x.amount)}</b></li>`).join('')}</ol>` : '<p class="muted">No bills yet today.</p>'}
      <div class="row-gap wrap td-act">
        <button type="button" class="btn primary" data-td="print">${icon('print', 16)} Print day report</button>
        <button type="button" class="btn" data-td="wa">${icon('whatsapp', 16)} Send to my WhatsApp</button>
      </div>
    </div>`,
  });
  const text = [`${s.business.name} · ${nice}`, `Bills: ${sum.bills}`, `Billed: ${money(sum.billed)}`, `Collected: ${money(sum.collected)}`,
    `  Cash ${money(sum.byMethod.Cash)} · UPI ${money(sum.byMethod.UPI)} · Card ${money(sum.byMethod.Card)}`,
    sum.unpaid > 0.004 ? `Unpaid: ${money(sum.unpaid)}` : '', sum.topItems.length ? `Top: ${sum.topItems.slice(0, 3).map((x) => `${x.name} ×${x.qty}`).join(', ')}` : ''].filter(Boolean).join('\n');
  m.el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-td]');
    if (!b) return;
    if (b.dataset.td === 'print') {
      printHTML(`${DAY_CSS}<div class="dayr"><h3>${esc(s.business.name)}</h3><p class="c">DAY REPORT · ${esc(date)}</p><hr>
        <div class="r"><span>Bills</span><span>${sum.bills}</span></div><div class="r"><span>Billed</span><span>${money(sum.billed)}</span></div>
        <div class="r"><span>Average</span><span>${money(sum.avg)}</span></div><hr>
        ${['Cash', 'UPI', 'Card', 'Other'].map((k) => `<div class="r"><span>${k}</span><span>${money(sum.byMethod[k])}</span></div>`).join('')}
        <hr><div class="r big"><span>COLLECTED</span><span>${money(sum.collected)}</span></div>
        ${sum.unpaid > 0.004 ? `<div class="r"><span>Unpaid</span><span>${money(sum.unpaid)}</span></div>` : ''}<hr>
        ${sum.topItems.map((x) => `<div class="r"><span>${esc(x.name)} ×${x.qty}</span><span>${money(x.amount)}</span></div>`).join('')}</div>`);
    }
    if (b.dataset.td === 'wa') window.open(`https://wa.me/${waNumber(s.business.phone)}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });
}

/** Small "Today ₹X · N bills" label for the Quick Bill header. */
export function todayChip() {
  const sum = daySummary(docsWithTotals(), today());
  return `${icon('trend', 16)}<span class="hide-sm"> Today</span> <b>${money(sum.collected)}</b>`;
}

