// Plans and prices: one source for the pricing page, the app and the
// payment server. Amounts are in rupees, before GST.
// Razorpay needs a matching plan for each (plan × period); see docs/BILLX_LAUNCH.md.

export const TRIAL_DAYS = 14;

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
