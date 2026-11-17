// Marketing page: sectors, live design samples and pricing from the same
// data the app uses.
import './app.css';
import './invoice.css';
import './landing.css';
import { PLANS, TRIAL_DAYS, GST_RATE } from './plans.js';
import { SITE } from './site.js';
import { starterItems } from './industries.js';
import { DEFAULT_SHOW } from './store.js';
import { esc, mountPreview } from './ui.js';
import { formatMoney } from './calc.js';
import { cloudEnabled } from './cloud/config.js';

const money = (n) => formatMoney(n, 'INR').replace('.00', '');

const settings = (template, accent) => ({
  industry: 'retail', clientLabel: 'Customer', currency: 'INR', taxMode: 'gst', roundOff: true,
  business: { name: 'Sunrise Traders', tagline: 'Quality you can trust', address: 'Market Road', city: 'Palakkad', state: '32', pincode: '678001', phone: '+91 98470 00000', gstin: '32ABCDE1234F1Z5', upiId: 'sunrise@upi', bankName: 'State Bank of India', accountNo: '00000012345678', ifsc: 'SBIN0000001' },
  docTitles: { invoice: 'Tax Invoice' }, footer: '',
  design: { template, accent, font: 'inter', paper: template === 'thermal' ? '80mm' : 'A4', show: { ...DEFAULT_SHOW }, labels: {} },
});
const doc = {
  type: 'invoice', number: 'INV-0042', status: 'sent', date: '2026-11-17', dueDate: '2026-12-02', placeOfSupply: '32',
  client: { name: 'Ravi Menon', company: 'Menon Associates', address: 'Fort Road', city: 'Palakkad', state: '32', phone: '+91 90000 12345' },
  items: starterItems('retail').map((it, i) => ({ ...it, qty: i + 1 })).concat([{ name: 'Gift wrapping', qty: 1, rate: 50, tax: 18, unit: 'pcs' }]),
  payments: [], fields: {},
};

mountPreview(document.getElementById('heroInvoice'), { ...doc, template: 'modern' }, settings('modern', '#2563eb'));

// Links to the SEO pages: same site on the standalone build, the main site elsewhere.
const seoBase = location.pathname.includes('/billx/') ? `${SITE.url}/` : '/';
document.getElementById('allSectors').href = `${seoBase}billing-software/`;
document.getElementById('freeGen').href = `${seoBase}free-gst-invoice-generator/`;

const designs = [['classic', '#ea580c', 'Classic'], ['bold', '#db2777', 'Bold'], ['gst', '#1d4ed8', 'GST Boxed'], ['elegant', '#7c3aed', 'Elegant']];
const dHost = document.getElementById('designs');
dHost.innerHTML = designs.map(([t, , name]) => `<figure><div class="l-design" data-t="${t}"></div><figcaption>${name}</figcaption></figure>`).join('');
designs.forEach(([t, accent]) => mountPreview(dHost.querySelector(`[data-t="${t}"]`), { ...doc, template: t }, settings(t, accent), { maxScale: 0.45 }));

function renderPlans(period) {
  document.getElementById('plans').innerHTML = Object.entries(PLANS).map(([k, p]) => `
    <div class="l-plan${p.popular ? ' popular' : ''}">
      ${p.popular ? '<span class="l-badge">Most popular</span>' : ''}
      <h3>${esc(p.name)}</h3>
      <p class="l-for">${esc(p.for)}</p>
      <div class="l-price">${money(period === 'yearly' ? p.yearly : p.monthly)}<small>/${period === 'yearly' ? 'year' : 'month'}</small></div>
      ${period === 'yearly' ? `<p class="l-save">${money(p.yearly / 12)}/month, billed yearly</p>` : '<p class="l-save">&nbsp;</p>'}
      <ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      <a class="btn ${p.popular ? 'primary' : ''} block" href="app/#/signup?plan=${k}&period=${period}">${cloudEnabled() ? `Start ${TRIAL_DAYS}-day free trial` : 'Start free'}</a>
      <a class="l-paynow" href="pay.html?plan=${k}&period=${period}">or buy now: UPI / GPay / bank transfer</a>
    </div>`).join('');
}
renderPlans('monthly');
document.getElementById('priceNote').textContent = `${cloudEnabled() ? `Every plan starts with a ${TRIAL_DAYS}-day free trial.` : 'Start free and upgrade any time.'} ${GST_RATE ? 'Prices exclude 18% GST.' : 'Pay by UPI, GPay, bank transfer or card.'}`;
document.querySelectorAll('.l-toggle button').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('.l-toggle button').forEach((x) => x.classList.toggle('on', x === b));
  renderPlans(b.dataset.period);
}));

document.getElementById('footCompany').textContent = `© ${new Date().getFullYear()} ${SITE.company}, ${SITE.city}`;
const contact = [SITE.email && `<a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>`, SITE.whatsapp && `<a href="https://wa.me/${esc(SITE.whatsapp)}" target="_blank" rel="noopener">WhatsApp +${esc(SITE.whatsapp)}</a>`].filter(Boolean);
document.getElementById('contactLine').innerHTML = contact.length ? `Questions? ${contact.join(' · ')}` : '';
if (SITE.whatsapp) {
  const wa = document.getElementById('waFloat');
  wa.href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hi, I want to know more about BillX.')}`;
  wa.hidden = false;
}
