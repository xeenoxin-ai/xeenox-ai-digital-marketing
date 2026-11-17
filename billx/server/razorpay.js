// Razorpay Subscriptions REST API (https://razorpay.com/docs/api/payments/subscriptions/).
import { hmacSha256Hex, safeEqual } from './crypto.js';

export class Razorpay {
  constructor(env, fetchFn = fetch) {
    this.keyId = env.RAZORPAY_KEY_ID;
    this.secret = env.RAZORPAY_KEY_SECRET;
    this.fetch = fetchFn;
  }

  async call(method, path, body) {
    if (!this.keyId || !this.secret) throw new Error('Razorpay keys are not set on the server');
    const res = await this.fetch(`https://api.razorpay.com/v1${path}`, {
      method,
      headers: { authorization: `Basic ${btoa(`${this.keyId}:${this.secret}`)}`, 'content-type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data.error && data.error.description) || `Razorpay error (${res.status})`);
    return data;
  }

  createSubscription({ planId, period, notes }) {
    return this.call('POST', '/subscriptions', {
      plan_id: planId,
      total_count: period === 'yearly' ? 10 : 120,
      quantity: 1,
      customer_notify: 1,
      notes,
    });
  }

  getSubscription(id) { return this.call('GET', `/subscriptions/${encodeURIComponent(id)}`); }

  cancelSubscription(id, atCycleEnd) {
    return this.call('POST', `/subscriptions/${encodeURIComponent(id)}/cancel`, { cancel_at_cycle_end: atCycleEnd ? 1 : 0 });
  }
}

/** Checkout success: signature = HMAC_SHA256(payment_id + "|" + subscription_id, key_secret). */
export async function checkoutSignatureOk({ paymentId, subscriptionId, signature }, secret) {
  if (!paymentId || !subscriptionId || !signature) return false;
  return safeEqual(await hmacSha256Hex(secret, `${paymentId}|${subscriptionId}`), signature);
}

/** Webhook: X-Razorpay-Signature = HMAC_SHA256(raw body, webhook secret). */
export async function webhookSignatureOk(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  return safeEqual(await hmacSha256Hex(secret, rawBody), signature);
}
