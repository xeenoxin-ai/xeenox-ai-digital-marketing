// Marketing page: sectors, live design samples and pricing from the same
// data the app uses.
import './app.css';
import './invoice.css';
import './landing.css';
import { PLANS, TRIAL_DAYS, GST_RATE, plansIn } from './plans.js';
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

let period = 'monthly';
let segment = 'small';
function renderPlans() {
  document.getElementById('plans').innerHTML = plansIn(segment).map(([k, p]) => `
    <div class="l-plan${p.popular ? ' popular' : ''}">
      ${p.popular ? '<span class="l-badge">Most popular</span>' : ''}
      <h3>${esc(p.name)}</h3>
      <p class="l-for">${esc(p.for)}</p>
      <div class="l-price">${money(period === 'yearly' ? p.yearly : p.monthly)}<small>/${period === 'yearly' ? 'year' : 'month'}</small></div>
      ${period === 'yearly' ? `<p class="l-save">${money(p.yearly / 12)}/month, billed yearly</p>` : '<p class="l-save">&nbsp;</p>'}
      <ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      <a class="btn ${p.popular ? 'primary' : 'dark'} block l-sub-btn" href="pay.html?plan=${k}&period=${period}">Subscribe now</a>
      <a class="l-paynow" href="app/#/signup?plan=${k}&period=${period}">${cloudEnabled() ? `or try free for ${TRIAL_DAYS} days` : 'or start free'}</a>
    </div>`).join('');
}
renderPlans();
document.querySelectorAll('.l-toggle button').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('.l-toggle button').forEach((x) => x.classList.toggle('on', x === b));
  period = b.dataset.period;
  renderPlans();
}));
document.querySelectorAll('.l-seg button').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('.l-seg button').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', String(x === b)); });
  segment = b.dataset.seg;
  renderPlans();
}));
if (GST_RATE) document.getElementById('priceNote').append(' Prices exclude 18% GST.');

// Product tour tabs
const tabs = [...document.querySelectorAll('.l-tabs [data-tab]')];
tabs.forEach((t) => t.addEventListener('click', () => {
  tabs.forEach((x) => { const on = x === t; x.classList.toggle('on', on); x.setAttribute('aria-selected', String(on)); });
  document.querySelectorAll('.l-tour-pane').forEach((p) => { p.hidden = p.id !== t.dataset.tab; });
}));

// WhatsApp: floating button and "Talk to us"
if (SITE.whatsapp) {
  const link = (msg) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;
  const wa = document.getElementById('waFloat');
  wa.href = link('Hi BillX Solutions, I want to know more about BillX.');
  wa.hidden = false;
  const demo = document.getElementById('demoBtn');
  demo.href = link('Hi BillX Solutions, I would like a demo of BillX for my business.');
  demo.target = '_blank';
  demo.rel = 'noopener';
}
