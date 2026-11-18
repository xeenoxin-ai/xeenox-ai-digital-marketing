// Public "Subscribe now" page: a professional UPI checkout for any plan.
// Scan the QR (amount filled in, 3-minute timer), enter the UPI reference,
// then we activate the plan for the buyer's BillX login email.
import './app.css';
import './landing.css';
import { PLANS } from './plans.js';
import { SITE } from './site.js';
import { cloudEnabled } from './cloud/config.js';
import { whatsappLink, confirmationText } from './pay-details.js';
import { openCheckout } from './views/checkout.js';
import { publicPayDetails } from './public-pay.js';

const root = document.getElementById('pay');
const q = new URLSearchParams(location.search);
const plan = PLANS[q.get('plan')] ? q.get('plan') : 'starter';
const period = q.get('period') === 'yearly' ? 'yearly' : 'monthly';

root.innerHTML = '<div class="co co-inline co-loading"><div class="co-spinner" aria-label="Loading"></div></div>';

publicPayDetails().then((details) => {
  root.innerHTML = '<div id="checkout"></div>';
  openCheckout({
    host: root.querySelector('#checkout'),
    publicPage: true,
    logo: 'logo.svg',
    plan,
    period,
    details,
    signupUrl: cloudEnabled() ? 'app/#/signup' : 'app/',
    onSubmit: async (req) => {
      // Tell BillX Solutions right away on WhatsApp; activation follows the bank check.
      const link = whatsappLink(confirmationText(req));
      if (link) window.open(link, '_blank', 'noopener');
    },
  });
  root.insertAdjacentHTML('beforeend', `<p class="pay-help">Need a GST invoice or have a question? <a href="${whatsappLink('Hi, I have a question about paying for BillX.')}" target="_blank" rel="noopener">WhatsApp ${SITE.company}</a> · <a href="./">Back to BillX</a></p>`);
});
