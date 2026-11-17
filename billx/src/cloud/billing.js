// Paying for a plan: asks our server for a Razorpay subscription, opens
// Razorpay Checkout (UPI Autopay, card, net banking) and confirms it.
import { apiBase } from './config.js';
import { idToken } from './session.js';
import { PLANS } from '../plans.js';

async function api(path, body) {
  const res = await fetch(`${apiBase}/${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${await idToken()}` },
    body: JSON.stringify(body || {}),
  });
  let data = {};
  try { data = await res.json(); } catch { /* empty */ }
  if (!res.ok) throw new Error(data.error || `Payment server error (${res.status})`);
  return data;
}

function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = resolve;
    s.onerror = () => reject(new Error('Could not load Razorpay. Check your internet connection.'));
    document.head.append(s);
  });
}

/** Resolves when the payment is confirmed, rejects if cancelled or failed. */
export async function subscribe(plan, period, user) {
  const { subscriptionId, keyId } = await api('subscribe', { plan, period });
  await loadCheckout();
  return new Promise((resolve, reject) => {
    const rz = new window.Razorpay({
      key: keyId,
      subscription_id: subscriptionId,
      name: 'BillX',
      description: `${PLANS[plan].name} plan, ${period === 'yearly' ? 'yearly' : 'monthly'}`,
      prefill: { email: user.email || '', name: user.displayName || '' },
      theme: { color: '#2563eb' },
      handler: async (resp) => {
        try {
          resolve(await api('verify', resp));
        } catch (e) { reject(e); }
      },
      modal: { ondismiss: () => reject(new Error('Payment window closed')) },
    });
    rz.on('payment.failed', (r) => reject(new Error((r.error && r.error.description) || 'Payment failed')));
    rz.open();
  });
}

export const cancelSubscription = () => api('cancel');
