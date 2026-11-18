// Checkout: a focused UPI payment flow, used inside the app (as a full-screen
// dialog) and on the public "Subscribe now" page (inline).
// 1. Pay: scan the QR (amount pre-filled) or tap "Pay with UPI app" on a phone,
//    with a 3-minute timer like a payment gateway.
// 2. Confirm: enter the UPI reference (UTR) so we can match the payment
//    (+ name, phone and email on the public page).
// 3. Done: the plan switches on as soon as BillX Solutions confirms it.
// The UPI ID comes from Firestore at runtime, never from the code.

import { PLANS, GST_RATE, priceOf, SEGMENTS, plansIn } from '../plans.js';
import { payAmount, rupees, whatsappLink, confirmationText, detailsRequestText } from '../pay-details.js';
import { SITE } from '../site.js';
import { upiLink } from '../calc.js';
import { qrSvg } from '../qr.js';
import { icon, esc, copyText, toast } from '../ui.js';

const APPS = [['GPay', '#1a73e8'], ['PhonePe', '#5f259f'], ['Paytm', '#00b9f1'], ['BHIM', '#f47920'], ['Any UPI app', '#475569']];
export const PAY_WINDOW = 180; // seconds

const cleanUtr = (v) => String(v || '').replace(/[\s-]/g, '');
export const validUtr = (v) => /^[A-Za-z0-9]{6,30}$/.test(cleanUtr(v));
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/**
 * openCheckout({ plan, period, details, email, onSubmit, host, publicPage, logo, signupUrl })
 * onSubmit({ plan, period, amount, utr, method, name, phone, email, business }) saves / sends the request.
 * host: render inline into this element instead of a dialog.
 * publicPage: let the buyer change plan, and ask for name, phone and email.
 */
export function openCheckout({
  plan, period = 'monthly', details = null, email = '', onSubmit, host = null, publicPage = false, logo = '../logo.svg', signupUrl = '',
}) {
  let step = 'pay';
  let utr = '';
  let contact = { name: '', phone: '', email, business: '' };
  let left = PAY_WINDOW;
  let timer = null;
  const d = details || {};
  const inline = !!host;
  const box = inline ? host : document.createElement('dialog');
  box.classList.add('co');
  if (inline) box.classList.add('co-inline');
  box.setAttribute('aria-label', 'Checkout');
  if (!inline) document.body.append(box);

  const stopTimer = () => { clearInterval(timer); timer = null; };
  const close = () => { stopTimer(); if (!inline) { box.close(); box.remove(); } };
  if (!inline) box.addEventListener('cancel', (e) => { e.preventDefault(); close(); });

  const tick = () => {
    left = Math.max(0, left - 1);
    const el = box.querySelector('#coTime');
    if (el) el.textContent = mmss(left);
    const bar = box.querySelector('.co-timer i');
    if (bar) bar.style.width = `${(left / PAY_WINDOW) * 100}%`;
    if (!left) { stopTimer(); render(); }
  };
  const startTimer = () => { stopTimer(); if (step === 'pay' && d.upiId && left > 0) timer = setInterval(tick, 1000); };

  const planPicker = () => `<label class="co-pick"><span>Plan</span><select data-plan>${Object.entries(SEGMENTS).map(([k, g]) => `<optgroup label="${esc(g.name)}">${plansIn(k).map(([pk, p]) => `<option value="${pk}" ${pk === plan ? 'selected' : ''}>${esc(p.name)}: ${rupees(p.monthly)}/month</option>`).join('')}</optgroup>`).join('')}</select></label>`;

  const summary = () => {
    const p = PLANS[plan];
    const amount = payAmount(plan, period);
    const save = PLANS[plan].monthly * 12 - PLANS[plan].yearly;
    const locked = step !== 'pay' ? 'disabled' : '';
    return `<aside class="co-sum">
      <div class="co-brand"><img src="${esc(logo)}" alt="" width="28" height="28"><span>Bill<b>X</b></span><small>by ${esc(SITE.company)}</small></div>
      <p class="co-eyebrow">Your order · ${esc(SEGMENTS[p.segment].name)}</p>
      <h2 class="co-plan">${esc(p.name)} plan</h2>
      <p class="co-for">${esc(p.for)}</p>
      ${publicPage && step === 'pay' ? planPicker() : ''}
      <div class="co-seg" role="group" aria-label="Billing period">
        <button type="button" data-per="monthly" class="${period === 'monthly' ? 'on' : ''}" ${locked}>Monthly</button>
        <button type="button" data-per="yearly" class="${period === 'yearly' ? 'on' : ''}" ${locked}>Yearly <em>Save ${rupees(save)}</em></button>
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
    if (!left) {
      return `<h1>Time's up</h1>
        <p class="co-sub">The 3-minute payment window has ended. If you have already paid, continue and enter the reference number. Otherwise start again.</p>
        <button type="button" class="btn primary co-cta" data-restart>${icon('refresh', 16)} Show the QR again</button>
        <button type="button" class="btn ghost co-next" data-go="confirm">I've already paid ${icon('arrow', 16)}</button>`;
    }
    return `<h1>Scan &amp; pay <span class="co-amt">${rupees(amount)}</span></h1>
      <p class="co-sub">Open any UPI app and scan. The amount is filled in for you.</p>
      <div class="co-timer" role="timer" aria-live="off"><span>${icon('clock', 15)} Complete payment in <b id="coTime">${mmss(left)}</b></span><i style="width:${(left / PAY_WINDOW) * 100}%"></i></div>
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
        <div class="co-help">${icon('eye', 16)}<div><b>Where to find it?</b> Open the payment in your UPI app. In GPay it's <b>UPI transaction ID</b>, in PhonePe <b>UTR</b>, in Paytm <b>UPI Ref. No.</b> (usually 12 digits).</div></div>
        ${publicPage ? `<div class="co-contact">
          <label><span>Your name *</span><input name="name" value="${esc(contact.name)}" autocomplete="name" required></label>
          <label><span>Phone / WhatsApp *</span><input name="phone" value="${esc(contact.phone)}" type="tel" autocomplete="tel" required></label>
          <label><span>Email for your BillX login *</span><input name="email" value="${esc(contact.email)}" type="email" autocomplete="email" required></label>
          <label><span>Business name</span><input name="business" value="${esc(contact.business)}" autocomplete="organization"></label>
        </div>` : ''}
        <p class="co-err" id="coErr" role="alert"></p>
        <button class="btn primary co-cta" id="coSubmit">${icon('lock', 16)} Submit payment</button>
        <button type="button" class="btn ghost co-back" data-go="pay">${icon('back', 16)} Back to payment</button>
      </form>`;

  const doneStep = () => {
    const wa = whatsappLink(confirmationText({ plan, period, utr, method: 'UPI', ...contact }));
    return `<div class="co-done">
        <div class="co-tick">${icon('check', 40)}</div>
        <h1>Payment submitted</h1>
        <p class="co-sub">Thank you! We're verifying your ${rupees(payAmount(plan, period))} payment (ref. <b>${esc(utr)}</b>). Your <b>${esc(PLANS[plan].name)}</b> plan switches on as soon as it's confirmed${publicPage ? ` for <b>${esc(contact.email)}</b>` : ''}.</p>
        ${wa ? `<a class="btn co-wa" href="${esc(wa)}" target="_blank" rel="noopener">${icon('whatsapp')} Send on WhatsApp for faster activation</a>` : ''}
        ${publicPage && signupUrl ? `<a class="btn primary co-cta" href="${esc(signupUrl)}">${icon('arrow', 16)} Create your BillX account (${esc(contact.email)})</a>`
    : `<button type="button" class="btn primary co-cta" data-close>Back to BillX</button>`}
      </div>`;
  };

  const render = () => {
    box.innerHTML = `<div class="co-wrap">
      ${summary()}
      <section class="co-main">
        <header class="co-head">${steps()}${inline ? '' : `<button type="button" class="icon-btn co-x" data-close aria-label="Close">${icon('x')}</button>`}</header>
        <div class="co-body">${step === 'pay' ? payStep() : step === 'confirm' ? confirmStep() : doneStep()}</div>
        <footer class="co-foot">${icon('lock', 14)} Secure checkout · ${esc(SITE.company)}, ${esc(SITE.city)}</footer>
      </section></div>`;
    const input = box.querySelector('input[name=utr]');
    if (input) setTimeout(() => input.focus(), 30);
    if (step === 'pay') { if (!timer) startTimer(); } else stopTimer();
  };

  box.addEventListener('click', async (e) => {
    if (e.target.closest('[data-close]')) { close(); return; }
    if (e.target.closest('[data-restart]')) { left = PAY_WINDOW; render(); startTimer(); return; }
    const per = e.target.closest('[data-per]');
    if (per && !per.disabled) { period = per.dataset.per; render(); return; }
    const go = e.target.closest('[data-go]');
    if (go) {
      if (step === 'confirm') contact = { ...contact, ...Object.fromEntries(['name', 'phone', 'email', 'business'].map((k) => [k, (box.querySelector(`[name=${k}]`) || {}).value ?? contact[k]])) };
      step = go.dataset.go;
      if (step === 'pay' && !left) left = PAY_WINDOW;
      render();
      return;
    }
    const cp = e.target.closest('[data-copy]');
    if (cp && (await copyText(cp.dataset.copy))) toast('UPI ID copied');
  });
  box.addEventListener('change', (e) => {
    if (e.target.matches('[data-plan]')) { plan = e.target.value; render(); }
  });
  box.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('#coSubmit');
    const fd = new FormData(form);
    utr = cleanUtr(fd.get('utr'));
    const err = form.querySelector('#coErr');
    if (!validUtr(utr)) { err.textContent = 'Please enter the reference number from your UPI app (6 to 30 letters or numbers).'; return; }
    if (publicPage) {
      contact = { name: String(fd.get('name') || '').trim(), phone: String(fd.get('phone') || '').trim(), email: String(fd.get('email') || '').trim(), business: String(fd.get('business') || '').trim() };
      if (!contact.name || contact.phone.replace(/\D/g, '').length < 10 || !/^\S+@\S+\.\S+$/.test(contact.email)) {
        err.textContent = 'Please enter your name, a 10-digit phone number and the email you will use to sign in to BillX.';
        return;
      }
    }
    btn.disabled = true;
    btn.innerHTML = 'Submitting…';
    try {
      await onSubmit({ plan, period, amount: payAmount(plan, period), utr, method: 'UPI', ...contact });
      step = 'done';
      render();
    } catch (ex) {
      err.textContent = ex.message || 'Could not submit. Check your connection and try again.';
      btn.disabled = false;
      btn.innerHTML = `${icon('lock', 16)} Submit payment`;
    }
  });

  render();
  if (!inline) {
    box.showModal();
    // Open at the top (the browser would otherwise focus, and scroll to, the period toggle).
    const main = box.querySelector('.co-main');
    main.tabIndex = -1;
    main.focus({ preventScroll: true });
    box.querySelector('.co-wrap').scrollTop = 0;
  }
  return { close };
}
