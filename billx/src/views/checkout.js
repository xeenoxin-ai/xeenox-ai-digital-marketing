// Checkout: a focused, full-screen UPI payment flow.
// 1. Pay: scan the QR (amount pre-filled) or tap "Pay with UPI app" on a phone.
// 2. Confirm: enter the UPI reference (UTR) so we can match the payment.
// 3. Done: plan switches on as soon as BillX Solutions confirms it.
// The UPI ID comes from Firestore at runtime (private/payment), never from code.

import { PLANS, GST_RATE, priceOf } from '../plans.js';
import { payAmount, rupees, whatsappLink, confirmationText, detailsRequestText } from '../pay-details.js';
import { SITE } from '../site.js';
import { upiLink } from '../calc.js';
import { qrSvg } from '../qr.js';
import { icon, esc, copyText, toast } from '../ui.js';

const APPS = [['GPay', '#1a73e8'], ['PhonePe', '#5f259f'], ['Paytm', '#00b9f1'], ['BHIM', '#f47920'], ['Any UPI app', '#475569']];

const cleanUtr = (v) => String(v || '').replace(/[\s-]/g, '');
export const validUtr = (v) => /^[A-Za-z0-9]{6,30}$/.test(cleanUtr(v));

/**
 * openCheckout({ plan, period, details, email, onSubmit })
 * onSubmit({ plan, period, amount, utr, method }) must save the payment request.
 */
export function openCheckout({ plan, period = 'monthly', details = null, email = '', onSubmit }) {
  let step = 'pay';
  let utr = '';
  const d = details || {};
  const dlg = document.createElement('dialog');
  dlg.className = 'co';
  dlg.setAttribute('aria-label', 'Checkout');
  document.body.append(dlg);

  const close = () => { dlg.close(); dlg.remove(); };
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });

  const summary = () => {
    const p = PLANS[plan];
    const amount = payAmount(plan, period);
    const save = PLANS[plan].monthly * 12 - PLANS[plan].yearly;
    return `<aside class="co-sum">
      <div class="co-brand"><img src="../logo.svg" alt="" width="28" height="28"><span>Bill<b>X</b></span><small>by ${esc(SITE.company)}</small></div>
      <p class="co-eyebrow">Your order</p>
      <h2 class="co-plan">${esc(p.name)} plan</h2>
      <p class="co-for">${esc(p.for)}</p>
      <div class="co-seg" role="group" aria-label="Billing period">
        <button type="button" data-per="monthly" class="${period === 'monthly' ? 'on' : ''}" ${step !== 'pay' ? 'disabled' : ''}>Monthly</button>
        <button type="button" data-per="yearly" class="${period === 'yearly' ? 'on' : ''}" ${step !== 'pay' ? 'disabled' : ''}>Yearly <em>Save ${rupees(save)}</em></button>
      </div>
      <ul class="co-feats">${p.features.map((f) => `<li>${icon('check', 16)}<span>${esc(f)}</span></li>`).join('')}</ul>
      <div class="co-lines">
        <div><span>${esc(p.name)} · ${period === 'yearly' ? '12 months' : '1 month'}</span><span>${rupees(priceOf(plan, period))}</span></div>
        ${GST_RATE ? `<div><span>GST ${GST_RATE}%</span><span>${rupees(amount - priceOf(plan, period))}</span></div>` : ''}
        <div class="co-total"><span>Total</span><b>${rupees(amount)}</b></div>
      </div>
      <p class="co-trust">${icon('shield', 16)} Paid directly to ${esc(d.payee || SITE.company)} by UPI. No card, no extra charges.</p>
    </aside>`;
  };

  const steps = () => `<ol class="co-steps">
      <li class="${step === 'pay' ? 'on' : 'done'}"><span>${step === 'pay' ? '1' : icon('check', 14)}</span>Pay</li>
      <li class="${step === 'confirm' ? 'on' : step === 'done' ? 'done' : ''}"><span>${step === 'done' ? icon('check', 14) : '2'}</span>Confirm</li>
      <li class="${step === 'done' ? 'done' : ''}"><span>${step === 'done' ? icon('check', 14) : '3'}</span>Submitted</li>
    </ol>`;

  const payStep = () => {
    const amount = payAmount(plan, period);
    if (!d.upiId) {
      const wa = whatsappLink(detailsRequestText(plan, period));
      return `<h1>Pay ${rupees(amount)}</h1>
        <p class="co-sub">Our UPI details are on their way. Tap below and we'll send them on WhatsApp right away.</p>
        ${wa ? `<a class="btn primary co-cta" href="${esc(wa)}" target="_blank" rel="noopener">${icon('whatsapp')} Get UPI details on WhatsApp</a>` : ''}
        <button type="button" class="btn ghost co-next" data-go="confirm">I've already paid ${icon('arrow', 16)}</button>`;
    }
    const link = upiLink({ upiId: d.upiId, payee: d.payee || SITE.company, amount, note: `BillX ${PLANS[plan].name} ${period}` });
    return `<h1>Scan &amp; pay <span class="co-amt">${rupees(amount)}</span></h1>
      <p class="co-sub">Open any UPI app and scan. The amount is filled in for you.</p>
      <div class="co-qrcard">
        <div class="co-qr">${qrSvg(link, { size: 220 })}</div>
        <div class="co-qrmeta"><b>${rupees(amount)}</b><small>to ${esc(d.payee || SITE.company)}</small></div>
      </div>
      <a class="btn primary co-cta co-mobile" href="${esc(link)}">${icon('phone')} Pay ${rupees(amount)} with UPI app</a>
      <div class="co-apps">${APPS.map(([n, c]) => `<span style="--c:${c}">${esc(n)}</span>`).join('')}</div>
      <div class="co-upi"><span>or pay to UPI ID</span><b>${esc(d.upiId)}</b><button type="button" class="btn" data-copy="${esc(d.upiId)}">${icon('copy', 16)} Copy</button></div>
      <button type="button" class="btn primary co-next" data-go="confirm">I've paid ${icon('arrow', 16)}</button>`;
  };

  const confirmStep = () => `<h1>Confirm your payment</h1>
      <p class="co-sub">Enter the UPI reference number so we can match your ${rupees(payAmount(plan, period))} payment.</p>
      <form class="co-form" id="coForm" novalidate>
        <label class="co-field"><span>UPI reference / UTR number</span>
          <input name="utr" value="${esc(utr)}" autocomplete="off" inputmode="text" placeholder="e.g. 412345678901" maxlength="40" required></label>
        <p class="co-err" id="coErr" role="alert"></p>
        <div class="co-help">${icon('eye', 16)}<div><b>Where to find it?</b> Open the payment in your UPI app. In GPay it's <b>UPI transaction ID</b>, in PhonePe <b>UTR</b>, in Paytm <b>UPI Ref. No.</b> (usually 12 digits).</div></div>
        <button class="btn primary co-cta" id="coSubmit">${icon('lock', 16)} Submit payment</button>
        <button type="button" class="btn ghost co-back" data-go="pay">${icon('back', 16)} Back to payment</button>
      </form>`;

  const doneStep = () => {
    const wa = whatsappLink(confirmationText({ plan, period, utr, email, method: 'UPI' }));
    return `<div class="co-done">
        <div class="co-tick">${icon('check', 40)}</div>
        <h1>Payment submitted</h1>
        <p class="co-sub">Thank you! We're verifying your ${rupees(payAmount(plan, period))} payment (ref. <b>${esc(utr)}</b>). Your <b>${esc(PLANS[plan].name)}</b> plan switches on as soon as it's confirmed, usually within a few hours. You can keep using BillX meanwhile.</p>
        ${wa ? `<a class="btn co-wa" href="${esc(wa)}" target="_blank" rel="noopener">${icon('whatsapp')} Send on WhatsApp for faster activation</a>` : ''}
        <button type="button" class="btn primary co-cta" data-close>Back to BillX</button>
      </div>`;
  };

  const render = () => {
    dlg.innerHTML = `<div class="co-wrap">
      ${summary()}
      <section class="co-main">
        <header class="co-head">${steps()}<button type="button" class="icon-btn co-x" data-close aria-label="Close">${icon('x')}</button></header>
        <div class="co-body">${step === 'pay' ? payStep() : step === 'confirm' ? confirmStep() : doneStep()}</div>
        <footer class="co-foot">${icon('lock', 14)} Secure checkout · ${esc(SITE.company)}, ${esc(SITE.city)}</footer>
      </section></div>`;
    const input = dlg.querySelector('input[name=utr]');
    if (input) setTimeout(() => input.focus(), 30);
  };

  dlg.addEventListener('click', async (e) => {
    if (e.target.closest('[data-close]')) { close(); return; }
    const per = e.target.closest('[data-per]');
    if (per && !per.disabled) { period = per.dataset.per; render(); return; }
    const go = e.target.closest('[data-go]');
    if (go) { step = go.dataset.go; render(); return; }
    const cp = e.target.closest('[data-copy]');
    if (cp && (await copyText(cp.dataset.copy))) toast('UPI ID copied');
  });
  dlg.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('#coSubmit');
    utr = cleanUtr(new FormData(form).get('utr'));
    const err = form.querySelector('#coErr');
    if (!validUtr(utr)) { err.textContent = 'Please enter the reference number from your UPI app (6 to 30 letters or numbers).'; return; }
    btn.disabled = true;
    btn.innerHTML = 'Submitting…';
    try {
      await onSubmit({ plan, period, amount: payAmount(plan, period), utr, method: 'UPI' });
      step = 'done';
      render();
    } catch (ex) {
      err.textContent = ex.message || 'Could not submit. Check your connection and try again.';
      btn.disabled = false;
      btn.innerHTML = `${icon('lock', 16)} Submit payment`;
    }
  });

  render();
  dlg.showModal();
  // Open at the top (the browser would otherwise focus, and scroll to, the period toggle).
  const main = dlg.querySelector('.co-main');
  main.tabIndex = -1;
  main.focus({ preventScroll: true });
  dlg.querySelector('.co-wrap').scrollTop = 0;
  return { close };
}
