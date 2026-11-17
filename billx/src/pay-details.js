// "Pay BillX Corp" box: UPI QR, GPay number and bank details with copy buttons.
// Used by the public payment page and the in-app Subscription page.
import { SITE } from './site.js';
import { PLANS, withTax, priceOf, GST_RATE } from './plans.js';
import { upiLink, formatMoney } from './calc.js';
import { qrSvg } from './qr.js';
import { esc, icon, copyText, toast } from './ui.js';

export const rupees = (n) => formatMoney(n, 'INR').replace(/\.00$/, '');

export function payAmount(plan, period) {
  return withTax(priceOf(plan, period));
}

export function payDetailsHTML(plan, period) {
  const p = SITE.pay;
  const amount = payAmount(plan, period);
  const note = `BillX ${PLANS[plan].name} ${period}`;
  const upi = p.upiId ? upiLink({ upiId: p.upiId, payee: p.payee, amount, note }) : '';
  const b = p.bank;
  const row = (label, value, copy = true) => (value ? `<div class="pd-row"><span>${esc(label)}</span><b>${esc(value)}</b>${copy ? `<button type="button" class="icon-btn" data-copy="${esc(value)}" aria-label="Copy ${esc(label)}">${icon('copy', 16)}</button>` : ''}</div>` : '');
  return `<div class="pay-details">
    <div class="pd-amount"><span>Amount to pay</span><b>${rupees(amount)}</b><small>${esc(PLANS[plan].name)} plan, ${period === 'yearly' ? '1 year' : '1 month'}${GST_RATE ? ' incl. 18% GST' : ''}</small></div>
    <div class="pd-grid">
      <section class="pd-box">
        <h4>UPI · GPay · PhonePe · Paytm</h4>
        ${upi ? `<div class="pd-qr">${qrSvg(upi, { size: 170 })}</div><a class="btn primary block" href="${esc(upi)}">${icon('cash')} Pay ${rupees(amount)} in UPI app</a>` : ''}
        ${row('Pay to name', p.payee, false)}
        ${row('GPay / UPI number', p.gpay)}
        ${row('UPI ID', p.upiId)}
        <p class="muted small">Your UPI app shows the bank account holder's name${b.accountName ? ` (${esc(b.accountName)})` : ''} when you pay.</p>
      </section>
      <section class="pd-box">
        <h4>Bank transfer (NEFT / IMPS / RTGS)</h4>
        ${row('Account name', b.accountName)}
        ${row('Account number', b.accountNo)}
        ${row('IFSC', b.ifsc)}
        ${row('Bank', b.bankName, false)}
        ${row('Branch', b.branch, false)}
        ${b.ifsc ? '' : '<p class="muted small">IFSC code: ask us on WhatsApp.</p>'}
      </section>
    </div>
  </div>`;
}

export function bindCopy(root) {
  root.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-copy]');
    if (b && (await copyText(b.dataset.copy))) toast('Copied');
  });
}

export function whatsappLink(text) {
  return SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}` : '';
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
