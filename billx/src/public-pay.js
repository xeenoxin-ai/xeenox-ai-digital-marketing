// The UPI details shown on the public "Subscribe now" page.
// They live in Firestore at public/pay (payee + UPI ID only; set by the admin
// on admin.html) and are read with one small REST call, so the page does not
// need the Firebase SDK. Bank account details are never stored there.

import { firebaseConfig, emulatorHost } from './cloud/config.js';

const str = (f) => (f && typeof f.stringValue === 'string' ? f.stringValue : '');

/** { payee, upiId } or null when not set up / offline. */
export async function publicPayDetails(fetchImpl = globalThis.fetch) {
  if (!firebaseConfig || !firebaseConfig.projectId) return null;
  const base = emulatorHost ? `http://${emulatorHost}:8080` : 'https://firestore.googleapis.com';
  const url = `${base}/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/public/pay?key=${encodeURIComponent(firebaseConfig.apiKey || '')}`;
  try {
    const res = await fetchImpl(url);
    if (!res.ok) return null;
    const doc = await res.json();
    const out = { payee: str(doc.fields && doc.fields.payee), upiId: str(doc.fields && doc.fields.upiId) };
    return out.upiId ? out : null;
  } catch {
    return null;
  }
}
