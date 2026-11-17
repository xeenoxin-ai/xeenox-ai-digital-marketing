// BillX payment API. Each handler takes a Request and the server settings
// (env) and returns a Response. Wired to Cloudflare Pages Functions in
// /functions/api/*. Dependencies can be injected for tests.
import { PLANS } from '../src/plans.js';
import { verifyIdToken } from './firebase-auth.js';
import { Firestore } from './firestore.js';
import { Razorpay, checkoutSignatureOk, webhookSignatureOk } from './razorpay.js';

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
const fail = (status, error) => json({ error }, status);
const PERIODS = ['monthly', 'yearly'];

function deps(env, injected = {}) {
  return {
    db: injected.db || new Firestore(env),
    rzp: injected.rzp || new Razorpay(env),
    verify: injected.verify || ((token) => verifyIdToken(token, env.FIREBASE_PROJECT_ID, { emulator: !!env.FIREBASE_AUTH_EMULATOR_HOST })),
    now: injected.now || (() => Date.now()),
  };
}

/** Signed-in account owner, or a Response explaining why not. */
async function ownerOf(request, d) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  let claims;
  try { claims = await d.verify(token); } catch (e) { return fail(401, e.message); }
  const user = await d.db.get(`users/${claims.uid}`);
  if (!user) return fail(403, 'No BillX account for this sign-in');
  const account = await d.db.get(`accounts/${user.accountId}`);
  if (!account) return fail(404, 'Account not found');
  if (account.ownerUid !== claims.uid) return fail(403, 'Only the account owner can manage the subscription');
  return { claims, accountId: user.accountId, account };
}

/** Account fields for a Razorpay subscription in a paying state. */
function paidFields(sub, account, now) {
  const notes = sub.notes || {};
  const plan = PLANS[notes.plan] ? notes.plan : account.plan;
  const period = PERIODS.includes(notes.period) ? notes.period : account.period || 'monthly';
  const fallback = now + (period === 'yearly' ? 366 : 31) * 86400000;
  const end = sub.current_end ? sub.current_end * 1000 : fallback;
  const prev = account.paidUntil instanceof Date ? account.paidUntil.getTime() : 0;
  return {
    status: 'active',
    plan,
    period,
    paidUntil: new Date(Math.max(end, account.subscriptionId === sub.id ? prev : 0)),
    subscriptionId: sub.id,
    subscriptionCreatedAt: sub.created_at || 0,
    maxUsers: PLANS[plan].users,
    maxBusinesses: PLANS[plan].businesses,
    cancelAtPeriodEnd: false,
    manual: false,
  };
}

export async function handleSubscribe(request, env, injected) {
  const d = deps(env, injected);
  const who = await ownerOf(request, d);
  if (who instanceof Response) return who;
  let body = {};
  try { body = await request.json(); } catch { /* empty */ }
  const { plan, period } = body;
  if (!PLANS[plan] || !PERIODS.includes(period)) return fail(400, 'Choose a valid plan');
  const planId = env[`RZP_PLAN_${plan.toUpperCase()}_${period.toUpperCase()}`];
  if (!planId) return fail(500, `Razorpay plan for ${plan} ${period} is not set up on the server`);
  try {
    const sub = await d.rzp.createSubscription({
      planId, period, notes: { accountId: who.accountId, plan, period, email: who.claims.email || '' },
    });
    return json({ subscriptionId: sub.id, keyId: env.RAZORPAY_KEY_ID });
  } catch (e) {
    return fail(502, e.message);
  }
}

export async function handleVerify(request, env, injected) {
  const d = deps(env, injected);
  const who = await ownerOf(request, d);
  if (who instanceof Response) return who;
  let b = {};
  try { b = await request.json(); } catch { /* empty */ }
  const ok = await checkoutSignatureOk({
    paymentId: b.razorpay_payment_id, subscriptionId: b.razorpay_subscription_id, signature: b.razorpay_signature,
  }, env.RAZORPAY_KEY_SECRET);
  if (!ok) return fail(400, 'Payment could not be verified');
  const sub = await d.rzp.getSubscription(b.razorpay_subscription_id);
  if (!sub.notes || sub.notes.accountId !== who.accountId) return fail(403, 'This payment belongs to another account');
  const old = who.account.subscriptionId;
  const fields = paidFields(sub, who.account, d.now());
  await d.db.update(`accounts/${who.accountId}`, fields);
  // Switching plan: stop the previous subscription so it is not charged again.
  if (old && old !== sub.id) {
    try { await d.rzp.cancelSubscription(old, false); } catch { /* already ended */ }
  }
  return json({ ok: true, plan: fields.plan, paidUntil: fields.paidUntil.toISOString() });
}

export async function handleCancel(request, env, injected) {
  const d = deps(env, injected);
  const who = await ownerOf(request, d);
  if (who instanceof Response) return who;
  if (!who.account.subscriptionId) return fail(400, 'No active subscription');
  try {
    await d.rzp.cancelSubscription(who.account.subscriptionId, true);
  } catch (e) {
    return fail(502, e.message);
  }
  await d.db.update(`accounts/${who.accountId}`, { cancelAtPeriodEnd: true });
  return json({ ok: true });
}

const STATUS_BY_EVENT = {
  'subscription.pending': 'past_due',
  'subscription.halted': 'halted',
  'subscription.paused': 'past_due',
  'subscription.cancelled': 'cancelled',
  'subscription.completed': 'cancelled',
};
const PAID_EVENTS = ['subscription.activated', 'subscription.charged', 'subscription.resumed'];

export async function handleWebhook(request, env, injected) {
  const d = deps(env, injected);
  const raw = await request.text();
  if (!(await webhookSignatureOk(raw, request.headers.get('x-razorpay-signature'), env.RAZORPAY_WEBHOOK_SECRET))) {
    return fail(400, 'Bad signature');
  }
  let event;
  try { event = JSON.parse(raw); } catch { return fail(400, 'Bad JSON'); }
  const sub = event.payload && event.payload.subscription && event.payload.subscription.entity;
  const accountId = sub && sub.notes && sub.notes.accountId;
  if (!sub || !accountId) return json({ ok: true, ignored: 'not a BillX subscription' });
  const account = await d.db.get(`accounts/${accountId}`);
  if (!account) return json({ ok: true, ignored: 'unknown account' });

  if (PAID_EVENTS.includes(event.event)) {
    const older = account.subscriptionId && account.subscriptionId !== sub.id
      && (sub.created_at || 0) < (account.subscriptionCreatedAt || 0);
    if (older) return json({ ok: true, ignored: 'old subscription' });
    await d.db.update(`accounts/${accountId}`, paidFields(sub, account, d.now()));
    return json({ ok: true });
  }
  const status = STATUS_BY_EVENT[event.event];
  if (!status) return json({ ok: true, ignored: event.event });
  // Events about an old subscription (after a plan switch) must not touch the new one.
  if (account.subscriptionId && account.subscriptionId !== sub.id) return json({ ok: true, ignored: 'old subscription' });
  await d.db.update(`accounts/${accountId}`, { status });
  return json({ ok: true });
}
