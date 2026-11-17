// Public payment page: pick a plan, pay BillX Corp by UPI or bank transfer,
// then send the payment reference on WhatsApp.
import './app.css';
import './landing.css';
import { PLANS } from './plans.js';
import { SITE } from './site.js';
import { esc, icon, options, field } from './ui.js';
import {
  payDetailsHTML, bindCopy, whatsappLink, confirmationText, payAmount, rupees,
} from './pay-details.js';

const root = document.getElementById('pay');
const q = new URLSearchParams(location.search);
let plan = PLANS[q.get('plan')] ? q.get('plan') : 'business';
let period = q.get('period') === 'yearly' ? 'yearly' : 'monthly';

function render() {
  root.innerHTML = `
    <h1>Buy BillX</h1>
    <p class="muted">Pay ${esc(SITE.company)} directly. Then send us the payment reference and we activate your plan, usually within a few hours.</p>
    <div class="grid g2 pay-pick">
      ${field('Plan', `<select id="plan">${options(Object.entries(PLANS).map(([k, p]) => [k, `${p.name}: ${rupees(payAmount(k, period))}/${period === 'yearly' ? 'year' : 'month'}`]), plan)}</select>`)}
      ${field('Billing', `<select id="period">${options([['monthly', 'Monthly'], ['yearly', 'Yearly (2 months free)']], period)}</select>`)}
    </div>
    <h2>1. Pay</h2>
    ${payDetailsHTML(plan, period)}
    <h2>2. Send us the payment reference</h2>
    <form id="confirm" class="card">
      <div class="grid g2">
        ${field('UPI / bank reference (UTR) *', '<input name="utr" required minlength="6" placeholder="12-digit UTR from your payment app">')}
        ${field('Paid by', `<select name="method">${options([['UPI', 'UPI / GPay / PhonePe'], ['Bank transfer', 'Bank transfer']], 'UPI')}</select>`)}
        ${field('Your name *', '<input name="name" required autocomplete="name">')}
        ${field('Business name', '<input name="business">')}
        ${field('Phone / WhatsApp *', '<input name="phone" required type="tel" autocomplete="tel">')}
        ${field('Email for your BillX login', '<input name="email" type="email" autocomplete="email">')}
      </div>
      <button class="btn primary big">${icon('whatsapp')} Send on WhatsApp</button>
      <p class="muted small">Already signed up? You can also submit the reference inside BillX → Subscription & team, and it activates as soon as we confirm the money arrived.</p>
    </form>
    <p class="muted small">Need a GST invoice or have a question? <a href="${esc(whatsappLink('Hi, I have a question about paying for BillX.'))}" target="_blank" rel="noopener">WhatsApp us</a>.</p>`;
  root.querySelector('#plan').onchange = (e) => { plan = e.target.value; render(); };
  root.querySelector('#period').onchange = (e) => { period = e.target.value; render(); };
  root.querySelector('#confirm').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target));
    window.open(whatsappLink(confirmationText({ plan, period, ...fd })), '_blank', 'noopener');
  });
}
bindCopy(root);
render();
