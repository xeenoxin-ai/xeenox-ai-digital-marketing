// Cloud settings for the paid BillX service.
//
// Leave firebaseConfig as null and BillX runs as the free, on-device version
// (no login, data in this browser only). Fill it in to switch on accounts,
// cloud sync, staff logins, the free trial and paid plans.
//
// Paste the object from Firebase console → Project settings → Your apps → Web app.
// These values are public identifiers, not secrets; billx/firestore.rules
// decides who can read and write. They can also come from build-time
// environment variables (VITE_BILLX_FIREBASE as JSON), e.g. on Cloudflare Pages.

const fromEnv = (name) => {
  try {
    return import.meta.env[name] || '';
  } catch {
    return '';
  }
};

function envJSON(name) {
  const raw = fromEnv(name);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { console.warn(`${name} is not valid JSON`); return null; }
}

// Either paste the config object here instead of null…
const PASTED_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCasT6S2zgt8A1JiyLTrhdFzGzniVPq2FA',
  authDomain: 'billx-3a14f.firebaseapp.com',
  projectId: 'billx-3a14f',
  storageBucket: 'billx-3a14f.firebasestorage.app',
  messagingSenderId: '228246376059',
  appId: '1:228246376059:web:05cc10fe58c514303adcde',
};
// …or set VITE_BILLX_FIREBASE when building.
export const firebaseConfig = envJSON('VITE_BILLX_FIREBASE') || PASTED_FIREBASE_CONFIG;

// Razorpay *Key ID* (public, starts with rzp_live_ or rzp_test_). The secret goes
// only into the server settings (Cloudflare), never here.
export const razorpayKeyId = fromEnv('VITE_RAZORPAY_KEY_ID') || '';

// Set to "127.0.0.1" to use the local Firebase emulators while developing.
export const emulatorHost = fromEnv('VITE_BILLX_EMULATOR') || '';

// Where the payment API lives (same site by default).
export const apiBase = fromEnv('VITE_BILLX_API') || '/api';

export const cloudEnabled = () => !!(firebaseConfig && firebaseConfig.projectId);
