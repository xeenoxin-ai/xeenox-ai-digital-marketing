// Refer & earn: every account has an invite link (…/?ref=CODE). The code is
// remembered in the browser when a visitor arrives, and saved on their new
// account as `referredBy`. When the new shop pays, the admin gives both
// shops one month free.

import { SITE } from './site.js';

const KEY = 'billx-ref';
const KEEP_DAYS = 60;

/** Referral code for an account: the first 10 characters of its id. */
export const refCode = (accountId) => String(accountId || '').slice(0, 10);
export const validRef = (code) => /^[A-Za-z0-9]{6,40}$/.test(String(code || ''));

/** Remember ?ref=CODE from the current address (landing, pay page or app). */
export function captureRef(href = typeof location !== 'undefined' ? location.href : '', store = safeStorage()) {
  const m = String(href).match(/[?&]ref=([A-Za-z0-9]{6,40})/);
  if (m && store) store.setItem(KEY, JSON.stringify({ code: m[1], at: Date.now() }));
  return m ? m[1] : '';
}

/** The remembered referral code, if it is recent. */
export function storedRef(store = safeStorage(), now = Date.now()) {
  try {
    const v = JSON.parse(store.getItem(KEY));
    return v && validRef(v.code) && now - v.at < KEEP_DAYS * 86400000 ? v.code : '';
  } catch { return ''; }
}

export const refLink = (accountId) => `${SITE.url.replace(/\/$/, '')}/?ref=${refCode(accountId)}`;

export const inviteText = (accountId, business = '') => [
  `I use BillX for billing${business ? ` at ${business}` : ''}: GST bills in seconds, UPI QR on every bill, WhatsApp reminders and today's sales report.`,
  `Try it free for 7 days. If you subscribe, we both get 1 month free:`,
  refLink(accountId),
].join('\n');

function safeStorage() {
  try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch { return null; }
}
