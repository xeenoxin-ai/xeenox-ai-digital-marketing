// Who sells BillX: shown on the website, payment page, legal pages and in SEO data.
export const SITE = {
  product: 'BillX',
  company: 'BillX Solutions',
  city: 'Palakkad, Kerala, India',
  // Full public address of the site, no trailing slash. Used for SEO (canonical
  // links, sitemap, social previews). Change it when you connect your own domain.
  url: 'https://billxsolutions.pages.dev',
  // WhatsApp for support and payment confirmations: digits only, with 91.
  whatsapp: '919074580473',
  // Support email shown on the site. Empty hides it.
  email: '',
  // Registered address for invoices and legal pages (Razorpay checks this).
  address: '',
  // GSTIN of BillX Solutions. Empty = not GST-registered: prices are shown with no GST added.
  gstin: '',
  // Set true after you (or your lawyer/CA) have read and approved the legal pages.
  legalReviewed: false,
  // Google Search Console "HTML tag" verification code (content="…" value only).
  googleVerification: '',

  // Name customers pay to. The bank account, UPI ID and GPay number are PRIVATE:
  // they are never stored in this code or shown on the public website. Customers
  // get them on WhatsApp, or (with accounts switched on) inside the app after
  // signing in, from the details you save in the admin page (Firestore).
  pay: {
    payee: 'BillX Solutions',
  },
};

/** Footer for WhatsApp bills sent by shops ("Billed with BillX"). */
export const brandTag = () => `\n\n— Billed with ${SITE.product} · ${SITE.url.replace(/^https?:\/\//, '')}`;
