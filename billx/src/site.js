// Who sells BillX: shown on the website, payment page, legal pages and in SEO data.
export const SITE = {
  product: 'BillX',
  company: 'BillX Solutions',
  owner: 'Sudarshan M P',
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

  // Where customers send money.
  pay: {
    payee: 'BillX Solutions',
    // GPay / PhonePe / Paytm number customers can pay to.
    gpay: '9074580473',
    // Exact UPI ID (VPA), e.g. name@okaxis, shown in GPay → Profile. Enables the scan-to-pay QR.
    upiId: '',
    bank: {
      accountName: 'Sudarshan M P',
      accountNo: '38623416046',
      bankName: '',
      branch: 'Kongad',
      ifsc: '',
    },
  },
};
