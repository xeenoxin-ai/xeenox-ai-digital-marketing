// Legal pages (terms, privacy, refunds, contact) filled from site.js.
// These are a starting draft: have them reviewed before you rely on them.
import './app.css';
import './landing.css';
import { SITE } from './site.js';
import { PLANS, TRIAL_DAYS } from './plans.js';
import { esc } from './ui.js';

const S = Object.fromEntries(Object.entries(SITE).map(([k, v]) => [k, typeof v === 'string' ? esc(v) : v]));
const where = [S.address, S.city].filter(Boolean).join(', ');
const contact = [S.email && `Email: <a href="mailto:${S.email}">${S.email}</a>`, S.whatsapp && `WhatsApp: <a href="https://wa.me/${S.whatsapp}">+${S.whatsapp}</a>`, where && `Address: ${where}`]
  .filter(Boolean).map((x) => `<li>${x}</li>`).join('') || '<li>Contact details will be published here.</li>';
const updated = 'November 2026';

const PAGES = {
  terms: ['Terms of Service', `
    <p>These terms apply to ${S.product}, an online billing and invoicing service provided by ${S.company} ("we", "us"). By creating an account you agree to them.</p>
    <h2>1. The service</h2><p>${S.product} lets you create invoices, quotations, receipts and reports and share them with your customers. You are responsible for the accuracy of the information you enter, including tax rates, GSTIN and amounts, and for complying with tax laws that apply to your business.</p>
    <h2>2. Accounts</h2><p>You must give accurate details and keep your password safe. You are responsible for activity under your account and the staff you invite.</p>
    <h2>3. Trial, plans and payment</h2><p>New accounts get a ${TRIAL_DAYS}-day free trial. After that a paid plan is needed to keep creating documents. Plans are billed monthly or yearly in advance through our payment partner Razorpay, plus GST. Prices are shown on our pricing page and may change with 30 days' notice.</p>
    <h2>4. If you stop paying</h2><p>If a payment fails or you cancel, your account becomes read-only at the end of the paid period. Your data is kept for at least 90 days so you can view and download it or subscribe again.</p>
    <h2>5. Your data</h2><p>You own your data. We process it only to provide the service, as described in our Privacy Policy. You can export it any time.</p>
    <h2>6. Acceptable use</h2><p>Do not use ${S.product} for unlawful activity, fake invoices, or to send spam, and do not try to break or overload the service.</p>
    <h2>7. Availability and liability</h2><p>We work to keep ${S.product} available and backed up, but it is provided "as is". To the extent the law allows, our total liability is limited to the fees you paid in the 3 months before the claim.</p>
    <h2>8. Ending the service</h2><p>You can cancel any time. We may suspend accounts that break these terms, after notice where reasonable.</p>
    <h2>9. Law</h2><p>These terms are governed by the laws of India. Courts at ${S.city.split(',')[0]} have jurisdiction.</p>
    <h2>Contact</h2><ul>${contact}</ul>`],
  privacy: ['Privacy Policy', `
    <p>This policy explains how ${S.company} handles personal data in ${S.product}, in line with India's Digital Personal Data Protection Act, 2023.</p>
    <h2>What we collect</h2><ul><li>Your account details: name, email, business details.</li><li>Data you enter: customers, items, invoices and payments. For hospitals and clinics this can include patient details; you are the data fiduciary for your customers' data and we process it on your behalf.</li><li>Payment status from Razorpay. We never see or store full card or bank details.</li></ul>
    <h2>How we use it</h2><p>Only to run ${S.product}: storing and syncing your documents, billing your subscription, support, and service emails. We do not sell your data or use it for advertising.</p>
    <h2>Where it is stored</h2><p>In Google Cloud (Firebase), encrypted in transit and at rest. Access is limited to you, the staff you invite, and us when needed for support or security.</p>
    <h2>Sharing</h2><p>With service providers who help run ${S.product} (Google Cloud, Cloudflare, Razorpay), and when the law requires it.</p>
    <h2>Retention</h2><p>We keep your data while your account exists and for up to 90 days after you close it, unless the law requires longer (for example tax records).</p>
    <h2>Your rights</h2><p>You can access, correct, export or delete your data. Write to us and we will respond within 30 days.</p>
    <h2>Contact / Grievance officer</h2><ul>${contact}</ul>`],
  refund: ['Refund & Cancellation Policy', `
    <h2>Free trial</h2><p>Every account starts with a ${TRIAL_DAYS}-day free trial. No payment is taken during the trial.</p>
    <h2>Cancellation</h2><p>Cancel any time from Settings → Subscription, or by writing to us. Cancellation stops future renewals. You keep access until the end of the period you have paid for.</p>
    <h2>Refunds</h2><p>Monthly plans are not refunded for partly used months. Yearly plans can be refunded in full within 7 days of the first yearly payment. If you were charged by mistake (for example a duplicate payment), we refund the extra amount in full.</p>
    <p>Approved refunds go back to the original payment method within 5–7 working days through Razorpay.</p>
    <h2>Plans</h2><ul>${Object.values(PLANS).map((p) => `<li>${esc(p.name)}: ₹${p.monthly}/month or ₹${p.yearly}/year, plus GST</li>`).join('')}</ul>
    <h2>Contact</h2><ul>${contact}</ul>`],
  contact: ['Contact us', `
    <p>${S.product} is made and supported by <b>${S.company}</b>, ${S.city}.</p><ul>${contact}</ul>
    <p>Support hours: Monday to Saturday, 9:30 am to 6:30 pm IST.</p>`],
};

const root = document.getElementById('legal');
const [title, body] = PAGES[root.dataset.page] || PAGES.contact;
document.title = `${title} · ${SITE.product}`;
root.innerHTML = `${SITE.legalReviewed ? '' : '<p class="draft">Draft: these terms are a starting template and are being reviewed.</p>'}
  <h1>${title}</h1><p class="l-small">Last updated: ${updated}</p>${body}`;
