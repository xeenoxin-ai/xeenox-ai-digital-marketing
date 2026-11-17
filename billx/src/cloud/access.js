// Who may change data: the same rules Firestore enforces (billx/firestore.rules),
// mirrored here so the app can explain them. Pure functions, tested in Node.

import { TRIAL_DAYS, planLimits } from '../plans.js';

export const GRACE_DAYS = 3;
const DAY = 86400000;

const ms = (t) => {
  if (!t) return 0;
  if (typeof t === 'number') return t;
  if (t instanceof Date) return t.getTime();
  if (typeof t.toMillis === 'function') return t.toMillis();
  if (typeof t.seconds === 'number') return t.seconds * 1000;
  const n = Date.parse(t);
  return Number.isFinite(n) ? n : 0;
};

/**
 * state: 'trial' | 'active' | 'grace' (payment late, still open) | 'expired'
 * daysLeft: whole days until access ends.
 */
export function accessInfo(account, now = Date.now()) {
  if (!account) return { state: 'expired', canWrite: false, daysLeft: 0, until: 0 };
  const paidUntil = ms(account.paidUntil);
  if (paidUntil && ['active', 'cancelled', 'past_due', 'halted'].includes(account.status)) {
    if (now < paidUntil) return { state: 'active', canWrite: true, until: paidUntil, daysLeft: Math.ceil((paidUntil - now) / DAY) };
    if (now < paidUntil + GRACE_DAYS * DAY) return { state: 'grace', canWrite: true, until: paidUntil + GRACE_DAYS * DAY, daysLeft: Math.ceil((paidUntil + GRACE_DAYS * DAY - now) / DAY) };
  }
  const trialEnd = ms(account.createdAt) + TRIAL_DAYS * DAY;
  if (account.status === 'trial' && now < trialEnd) return { state: 'trial', canWrite: true, until: trialEnd, daysLeft: Math.ceil((trialEnd - now) / DAY) };
  return { state: 'expired', canWrite: false, daysLeft: 0, until: Math.max(paidUntil, trialEnd) };
}

/** Limits for an account: plan limits once paid, Business-level during the trial. */
export function limitsOf(account) {
  if (account && account.maxUsers && account.maxBusinesses) return { users: account.maxUsers, businesses: account.maxBusinesses };
  return { users: planLimits('business').users, businesses: planLimits('business').businesses };
}

export const isOwner = (account, uid) => !!account && account.ownerUid === uid;
