// BillX payment server: token checks, Razorpay signatures, subscription flow.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { b64urlEncode, b64urlJSON, hmacSha256Hex, signJwtRS256, importPrivateKeyPem } from '../billx/server/crypto.js';
import { verifyIdToken, resetKeyCache } from '../billx/server/firebase-auth.js';
import { encodeFields, decodeFields } from '../billx/server/firestore.js';
import { checkoutSignatureOk, webhookSignatureOk } from '../billx/server/razorpay.js';
import { handleSubscribe, handleVerify, handleCancel, handleWebhook } from '../billx/server/handlers.js';
import { accessInfo } from '../billx/src/cloud/access.js';

const PROJECT = 'billx-test';
const now = Math.floor(Date.now() / 1000);

async function keyPair() {
  const kp = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  const jwk = { ...(await crypto.subtle.exportKey('jwk', kp.publicKey)), kid: 'k1', alg: 'RS256', use: 'sig' };
  return { kp, jwk };
}
const claims = (extra = {}) => ({ iss: `https://securetoken.google.com/${PROJECT}`, aud: PROJECT, sub: 'u1', iat: now - 10, exp: now + 3000, auth_time: now - 10, email: 'o@x.in', ...extra });
const jwksFetch = (jwk) => async () => new Response(JSON.stringify({ keys: [jwk] }), { headers: { 'cache-control': 'max-age=60' } });

test('Firebase ID tokens: valid accepted, tampered/expired/foreign rejected', async () => {
  const { kp, jwk } = await keyPair();
  resetKeyCache();
  const good = await signJwtRS256(claims(), kp.privateKey, 'k1');
  const c = await verifyIdToken(good, PROJECT, { fetchFn: jwksFetch(jwk) });
  assert.equal(c.uid, 'u1');
  const [h, , sig] = good.split('.');
  await assert.rejects(verifyIdToken(`${h}.${b64urlJSON(claims({ sub: 'attacker' }))}.${sig}`, PROJECT, { fetchFn: jwksFetch(jwk) }), /signature/);
  await assert.rejects(verifyIdToken(await signJwtRS256(claims({ exp: now - 5 }), kp.privateKey, 'k1'), PROJECT, { fetchFn: jwksFetch(jwk) }), /expired/);
  await assert.rejects(verifyIdToken(await signJwtRS256(claims({ aud: 'other' }), kp.privateKey, 'k1'), PROJECT, { fetchFn: jwksFetch(jwk) }), /another project/);
  const unsigned = `${b64urlJSON({ alg: 'none' })}.${b64urlJSON(claims())}.`;
  await assert.rejects(verifyIdToken(unsigned, PROJECT, { fetchFn: jwksFetch(jwk) }), /Unsupported/);
  assert.equal((await verifyIdToken(unsigned, PROJECT, { emulator: true })).uid, 'u1', 'emulator tokens only with the emulator flag');
});

test('service account key in PEM signs JWTs', async () => {
  const { kp } = await keyPair();
  const der = new Uint8Array(await crypto.subtle.exportKey('pkcs8', kp.privateKey));
  const pem = `-----BEGIN PRIVATE KEY-----\n${btoa(String.fromCharCode(...der)).match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----\n`;
  const token = await signJwtRS256({ a: 1 }, await importPrivateKeyPem(pem));
  const [h, p, s] = token.split('.');
  const pad = (x) => x.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - (x.length % 4)) % 4);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', kp.publicKey, Uint8Array.from(atob(pad(s)), (ch) => ch.charCodeAt(0)), new TextEncoder().encode(`${h}.${p}`));
  assert.ok(ok);
  assert.equal(b64urlEncode(new Uint8Array([251, 255])), '-_8');
});

test('Firestore value encoding round-trips', () => {
  const data = { a: 'x', n: 3, f: 1.5, b: true, z: null, d: new Date('2026-11-17T00:00:00Z'), l: ['p', 2], m: { k: 'v' } };
  assert.deepEqual(decodeFields(encodeFields(data)), data);
  assert.deepEqual(encodeFields({ n: 3 }).n, { integerValue: '3' });
});

test('Razorpay signatures', async () => {
  const sig = await hmacSha256Hex('secret', 'pay_1|sub_1');
  assert.ok(await checkoutSignatureOk({ paymentId: 'pay_1', subscriptionId: 'sub_1', signature: sig }, 'secret'));
  assert.ok(!(await checkoutSignatureOk({ paymentId: 'pay_2', subscriptionId: 'sub_1', signature: sig }, 'secret')));
  const body = '{"event":"x"}';
  assert.ok(await webhookSignatureOk(body, await hmacSha256Hex('wh', body), 'wh'));
  assert.ok(!(await webhookSignatureOk(body, await hmacSha256Hex('other', body), 'wh')));
});

/* ---------------- subscription flow with fakes ---------------- */

function fakes() {
  const docs = {
    'users/owner': { accountId: 'owner', role: 'owner' },
    'users/staff': { accountId: 'owner', role: 'staff' },
    'accounts/owner': { ownerUid: 'owner', status: 'trial', plan: null, subscriptionId: null, paidUntil: null, createdAt: new Date() },
  };
  const calls = [];
  const subs = {};
  const db = {
    get: async (p) => (docs[p] ? { ...docs[p] } : null),
    update: async (p, f) => { docs[p] = { ...docs[p], ...f }; return docs[p]; },
  };
  const rzp = {
    createSubscription: async (o) => { const id = `sub_${Object.keys(subs).length + 1}`; subs[id] = { id, notes: o.notes, created_at: now + Object.keys(subs).length, current_end: null }; calls.push(['create', o]); return subs[id]; },
    getSubscription: async (id) => subs[id],
    cancelSubscription: async (id, atEnd) => { calls.push(['cancel', id, atEnd]); return {}; },
  };
  const verify = async (t) => { if (!t) throw new Error('Missing sign-in token'); return { uid: t, email: `${t}@x.in` }; };
  return { docs, calls, subs, deps: { db, rzp, verify } };
}
const env = {
  RAZORPAY_KEY_ID: 'rzp_test_1', RAZORPAY_KEY_SECRET: 'ks', RAZORPAY_WEBHOOK_SECRET: 'wh',
  RZP_PLAN_PRO_MONTHLY: 'plan_pro_m', RZP_PLAN_STARTER_YEARLY: 'plan_st_y',
};
const req = (path, body, uid) => new Request(`https://billx.test/api/${path}`, {
  method: 'POST', headers: { 'content-type': 'application/json', ...(uid ? { authorization: `Bearer ${uid}` } : {}) }, body: JSON.stringify(body || {}),
});
const webhook = async (event, sub) => {
  const body = JSON.stringify({ event, payload: { subscription: { entity: sub } } });
  return new Request('https://billx.test/api/razorpay-webhook', { method: 'POST', headers: { 'x-razorpay-signature': await hmacSha256Hex('wh', body) }, body });
};

test('only the signed-in owner can start a subscription', async () => {
  const f = fakes();
  assert.equal((await handleSubscribe(req('subscribe', { plan: 'pro', period: 'monthly' }), env, f.deps)).status, 401);
  assert.equal((await handleSubscribe(req('subscribe', { plan: 'pro', period: 'monthly' }, 'staff'), env, f.deps)).status, 403);
  assert.equal((await handleSubscribe(req('subscribe', { plan: 'gold', period: 'monthly' }, 'owner'), env, f.deps)).status, 400);
  assert.equal((await handleSubscribe(req('subscribe', { plan: 'business', period: 'monthly' }, 'owner'), env, f.deps)).status, 500, 'missing plan id is reported');
  const res = await handleSubscribe(req('subscribe', { plan: 'pro', period: 'monthly' }, 'owner'), env, f.deps);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.keyId, 'rzp_test_1');
  assert.equal(f.calls[0][1].planId, 'plan_pro_m');
  assert.equal(f.calls[0][1].notes.accountId, 'owner');
});

test('verified checkout activates the plan; forged one does not', async () => {
  const f = fakes();
  const { subscriptionId } = await (await handleSubscribe(req('subscribe', { plan: 'pro', period: 'monthly' }, 'owner'), env, f.deps)).json();
  const forged = await handleVerify(req('verify', { razorpay_payment_id: 'pay_1', razorpay_subscription_id: subscriptionId, razorpay_signature: 'nope' }, 'owner'), env, f.deps);
  assert.equal(forged.status, 400);
  assert.equal(f.docs['accounts/owner'].status, 'trial');
  const sig = await hmacSha256Hex('ks', `pay_1|${subscriptionId}`);
  const ok = await handleVerify(req('verify', { razorpay_payment_id: 'pay_1', razorpay_subscription_id: subscriptionId, razorpay_signature: sig }, 'owner'), env, f.deps);
  assert.equal(ok.status, 200);
  const acc = f.docs['accounts/owner'];
  assert.equal(acc.status, 'active');
  assert.equal(acc.plan, 'pro');
  assert.equal(acc.maxUsers, 25);
  assert.ok(acc.paidUntil > new Date(Date.now() + 29 * 86400000));
  assert.equal(accessInfo(acc).state, 'active');
});

test('webhooks renew, mark late payments, cancel; old subscriptions are ignored', async () => {
  const f = fakes();
  const sub = { id: 'sub_9', created_at: now, notes: { accountId: 'owner', plan: 'starter', period: 'yearly' }, current_end: now + 365 * 86400 };
  const bad = new Request('https://x/api/razorpay-webhook', { method: 'POST', headers: { 'x-razorpay-signature': 'x' }, body: '{}' });
  assert.equal((await handleWebhook(bad, env, f.deps)).status, 400);
  await handleWebhook(await webhook('subscription.activated', sub), env, f.deps);
  assert.equal(f.docs['accounts/owner'].status, 'active');
  assert.equal(f.docs['accounts/owner'].plan, 'starter');
  await handleWebhook(await webhook('subscription.pending', sub), env, f.deps);
  assert.equal(f.docs['accounts/owner'].status, 'past_due');
  await handleWebhook(await webhook('subscription.charged', { ...sub, current_end: now + 730 * 86400 }), env, f.deps);
  assert.equal(f.docs['accounts/owner'].status, 'active');
  assert.equal(Math.round(f.docs['accounts/owner'].paidUntil.getTime() / 1000), now + 730 * 86400);
  // A stale event from an older subscription must not replace the current one.
  const old = { ...sub, id: 'sub_old', created_at: now - 1000 };
  await handleWebhook(await webhook('subscription.charged', old), env, f.deps);
  await handleWebhook(await webhook('subscription.cancelled', old), env, f.deps);
  assert.equal(f.docs['accounts/owner'].subscriptionId, 'sub_9');
  assert.equal(f.docs['accounts/owner'].status, 'active');
  await handleWebhook(await webhook('subscription.cancelled', sub), env, f.deps);
  assert.equal(f.docs['accounts/owner'].status, 'cancelled');
  assert.equal(accessInfo(f.docs['accounts/owner']).state, 'active', 'cancelled keeps access until the paid period ends');
  const res = await handleWebhook(await webhook('subscription.activated', { id: 's', notes: {} }), env, f.deps);
  assert.equal((await res.json()).ignored, 'not a BillX subscription');
});

test('cancel stops renewal at the end of the period', async () => {
  const f = fakes();
  f.docs['accounts/owner'].subscriptionId = 'sub_5';
  const res = await handleCancel(req('cancel', {}, 'owner'), env, f.deps);
  assert.equal(res.status, 200);
  assert.deepEqual(f.calls.at(-1), ['cancel', 'sub_5', true]);
  assert.equal(f.docs['accounts/owner'].cancelAtPeriodEnd, true);
});

test('access rules: trial, paid, grace, expired', () => {
  const day = 86400000;
  const t = Date.now();
  assert.equal(accessInfo({ status: 'trial', createdAt: new Date(t - day) }, t).state, 'trial');
  assert.equal(accessInfo({ status: 'trial', createdAt: new Date(t - 15 * day) }, t).state, 'expired');
  assert.equal(accessInfo({ status: 'active', paidUntil: new Date(t + day) }, t).state, 'active');
  assert.equal(accessInfo({ status: 'past_due', paidUntil: new Date(t - day) }, t).state, 'grace');
  assert.equal(accessInfo({ status: 'cancelled', paidUntil: new Date(t - 4 * day) }, t).state, 'expired');
  assert.equal(accessInfo({ status: 'active', paidUntil: { seconds: (t + day) / 1000 } }, t).canWrite, true);
});
