// Plans and prices: one source for the pricing page, the app and the
// payment server. Amounts are in rupees, before GST.
// Razorpay needs a matching plan for each (plan × period); see docs/BILLX_LAUNCH.md.

import { SITE } from './site.js';

export const TRIAL_DAYS = 7;
/** What a trial account may use (must match billx/firestore.rules). */
export const TRIAL_LIMITS = { users: 3, businesses: 3 };

/** GST is added only when BillX Solutions has a GSTIN. */
export const GST_RATE = SITE.gstin ? 18 : 0;
export const withTax = (amount) => Math.round(amount * (100 + GST_RATE)) / 100;
export const TAX_NOTE = GST_RATE ? '+ 18% GST' : 'No hidden charges';
export const priceOf = (plan, period) => (PLANS[plan] ? (period === 'yearly' ? PLANS[plan].yearly : PLANS[plan].monthly) : 0);
export const daysOf = (period) => (period === 'yearly' ? 365 : 30);

/** Two price lists: small businesses and large businesses. */
export const SEGMENTS = {
  small: { name: 'Small business', blurb: 'Shops, home businesses, freelancers, small restaurants and clinics' },
  large: { name: 'Large business', blurb: 'Hotels, hospitals, schools, distributors and multi-branch businesses' },
};

export const PLANS = {
  starter: {
    name: 'Small',
    segment: 'small',
    monthly: 399,
    yearly: 3990,
    users: 1,
    businesses: 1,
    for: 'Shops, freelancers and home businesses',
    features: ['1 user, 1 business', 'Unlimited bills, quotes & receipts', 'Quick Bill for fast counter billing', 'Upload all your customers & items at once', 'WhatsApp payment reminders', 'GST, UPI QR, reports & cloud backup'],
  },
  growth: {
    name: 'Small Plus',
    segment: 'small',
    monthly: 799,
    yearly: 7990,
    users: 3,
    businesses: 2,
    popular: true,
    for: 'Small businesses with staff',
    features: ['3 users, 2 businesses', 'Everything in Small', 'Repeating monthly bills (rent, fees, AMC)', 'Client portal: customers view & pay online', 'Your own fields, labels & designs', 'WhatsApp support'],
  },
  business: {
    name: 'Business',
    segment: 'large',
    monthly: 1499,
    yearly: 14990,
    users: 10,
    businesses: 5,
    popular: true,
    for: 'Hotels, restaurants, distributors',
    features: ['10 users, 5 businesses', 'Everything in Small Plus', 'Tables, rooms, KOT & held orders', 'Bulk import of thousands of records', 'Overdue tracking & reminder lists', 'Priority WhatsApp support'],
  },
  pro: {
    name: 'Enterprise',
    segment: 'large',
    monthly: 3999,
    yearly: 39990,
    users: 25,
    businesses: 10,
    for: 'Hospitals, schools, multi-branch',
    features: ['25 users, 10 businesses / branches', 'Everything in Business', 'We set it up for you: logo, designs, items', 'Data moved from your old software', 'Staff training + dedicated support'],
  },
};

export const plansIn = (segment) => Object.entries(PLANS).filter(([, p]) => p.segment === segment);
export const planLimits = (plan) => PLANS[plan] || { users: TRIAL_LIMITS.users, businesses: TRIAL_LIMITS.businesses, name: 'Trial' };
