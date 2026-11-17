// "Pay BillX Solutions" box.
// Bank / UPI details are private: they are passed in at runtime (from Firestore,
// only to signed-in customers) and never stored in this code. Without them the
// box asks the customer to get the details on WhatsApp.
import { SITE } from './site.js';
import { PLANS, withTax, priceOf, GST_RATE } from './plans.js';
import { upiLink, formatMoney } from './calc.js';
import { qrSvg } from './qr.js';
import { esc, icon, copyText, toast } from './ui.js';

export const rupees = (n) => formatMoney(n, 'INR').replace(/\.00$/, '');

export function payAmount(plan, period) {
  return withTax(priceOf(plan, period));
}

export function whatsappLink(text) {
  return SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}` : '';
}

export const detailsRequestText = (plan, period) => `Hello ${SITE.company}, I want to buy BillX ${PLANS[plan].name} (${period}) for ${rupees(payAmount(plan, period))}. Please send the payment details.`;

/**
 * details: { payee, upiId } or null. Only UPI is shown; bank details are never displayed.
 */
export function payDetailsHTML(plan, period, details = null) {
  const amount = payAmount(plan, period);
  const head = `<div class="pd-amount"><span>Amount to pay</span><b>${rupees(amount)}</b><small>${esc(PLANS[plan].name)} plan, ${period === 'yearly' ? '1 year' : '1 month'}${GST_RATE ? ' incl. 18% GST' : ''}</small></div>`;
  const d = details || {};
  if (!d.upiId) {
    const wa = whatsappLink(detailsRequestText(plan, period));
    return `<div class="pay-details">${head}
      <section class="pd-box pd-private">
        <h4>Pay ${esc(SITE.company)} by UPI, GPay or bank transfer</h4>
        <p class="muted">For your security we share our UPI and bank details personally. Tap below and we'll send them on WhatsApp right away.</p>
        ${wa ? `<a class="btn primary block" href="${esc(wa)}" target="_blank" rel="noopener">${icon('whatsapp')} Get payment details on WhatsApp</a>` : ''}
      </section>
    </div>`;
  }
  const payee = d.payee || SITE.pay.payee;
  const note = `BillX ${PLANS[plan].name} ${period}`;
  const upi = d.upiId ? upiLink({ upiId: d.upiId, payee, amount, note }) : '';
  const row = (label, value, copy = true) => (value ? `<div class="pd-row"><span>${esc(label)}</span><b>${esc(value)}</b>${copy ? `<button type="button" class="icon-btn" data-copy="${esc(value)}" aria-label="Copy ${esc(label)}">${icon('copy', 16)}</button>` : ''}</div>` : '');
  // UPI only: bank account details are never shown to customers.
  return `<div class="pay-details">${head}
    <section class="pd-box">
      <h4>Pay by UPI · GPay · PhonePe · Paytm</h4>
      ${upi ? `<div class="pd-qr">${qrSvg(upi, { size: 190 })}</div><a class="btn primary block" href="${esc(upi)}">${icon('cash')} Pay ${rupees(amount)} in UPI app</a>` : ''}
      ${row('Pay to', payee, false)}
      ${row('UPI ID', d.upiId)}
    </section>
  </div>`;
}

export function bindCopy(root) {
  root.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-copy]');
    if (b && (await copyText(b.dataset.copy))) toast('Copied');
  });
}

export function confirmationText({ plan, period, utr, name, business, phone, email, method }) {
  return [
    `Hello ${SITE.company}, I have paid for BillX.`,
    `Plan: ${PLANS[plan].name} (${period})`,
    `Amount: ${rupees(payAmount(plan, period))}`,
    `Paid by: ${method || 'UPI'}`,
    `Reference / UTR: ${utr}`,
    name && `Name: ${name}`,
    business && `Business: ${business}`,
    phone && `Phone: ${phone}`,
    email && `BillX login email: ${email}`,
  ].filter(Boolean).join('\n');
}
