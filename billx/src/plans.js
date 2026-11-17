// Plans and prices: one source for the pricing page, the app and the
// payment server. Amounts are in rupees, before GST.
// Razorpay needs a matching plan for each (plan × period); see docs/BILLX_LAUNCH.md.

import { SITE } from './site.js';

export const TRIAL_DAYS = 14;

/** GST is added only when BillX Corp has a GSTIN. */
export const GST_RATE = SITE.gstin ? 18 : 0;
export const withTax = (amount) => Math.round(amount * (100 + GST_RATE)) / 100;
export const TAX_NOTE = GST_RATE ? '+ 18% GST' : 'No hidden charges';
export const priceOf = (plan, period) => (PLANS[plan] ? (period === 'yearly' ? PLANS[plan].yearly : PLANS[plan].monthly) : 0);
export const daysOf = (period) => (period === 'yearly' ? 365 : 30);

export const PLANS = {
  starter: {
    name: 'Starter',
    monthly: 499,
    yearly: 4990,
    users: 1,
    businesses: 1,
    for: 'Small shops and freelancers',
    features: ['1 user, 1 business', 'Unlimited bills & quotes', 'All 10 invoice designs', 'GST, UPI QR, reports', 'Cloud backup on every device'],
  },
  business: {
    name: 'Business',
    monthly: 1499,
    yearly: 14990,
    users: 3,
    businesses: 3,
    popular: true,
    for: 'Growing businesses with staff',
    features: ['3 users, 3 businesses', 'Everything in Starter', 'Client portal & WhatsApp sharing', 'Your own fields & labels', 'Email support'],
  },
  pro: {
    name: 'Pro',
    monthly: 3999,
    yearly: 39990,
    users: 25,
    businesses: 10,
    for: 'Hospitals, clinics, schools, multi-branch',
    features: ['25 users, 10 businesses / branches', 'Everything in Business', 'We set it up for you: logo, designs, items', 'Data moved from your old software', 'Staff training + priority WhatsApp support'],
  },
};

export const planLimits = (plan) => PLANS[plan] || { users: 1, businesses: 1, name: 'Trial' };
