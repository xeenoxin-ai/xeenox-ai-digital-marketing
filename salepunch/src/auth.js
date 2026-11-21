// Password hashing (PBKDF2-SHA256) and signed session tokens (HMAC-SHA256).
// Web Crypto only, so it runs on Cloudflare Workers and Node 20+.
import { sameSecret } from './util.js';

const enc = new TextEncoder();
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
const unb64u = (s) => Uint8Array.from(atob(s.replaceAll('-', '+').replaceAll('_', '/')), (c) => c.charCodeAt(0));
const ITER = 100000; // Workers cap PBKDF2 at 100k iterations

async function pbkdf2(password, salt, iter) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, key, 256);
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${ITER}$${b64u(salt)}$${b64u(await pbkdf2(password, salt, ITER))}`;
}

export async function verifyPassword(password, stored) {
  const [kind, iter, salt, hash] = String(stored || '').split('$');
  if (kind !== 'pbkdf2' || !hash) return false;
  return sameSecret(b64u(await pbkdf2(password, unb64u(salt), Number(iter))), hash);
}

async function hmacKey(secret) {
  if (!secret || secret.length < 16) throw new Error('SESSION_SECRET must be set (16+ characters)');
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

/** Token = base64url(payload).base64url(hmac). Payload {uid, exp}. */
export async function signSession(uid, secret, now = Date.now(), days = 14) {
  const body = b64u(enc.encode(JSON.stringify({ uid, exp: now + days * 86400000 })));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(body));
  return `${body}.${b64u(sig)}`;
}

export async function readSession(token, secret, now = Date.now()) {
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig) return null;
  try {
    if (!(await crypto.subtle.verify('HMAC', await hmacKey(secret), unb64u(sig), enc.encode(body)))) return null;
    const p = JSON.parse(new TextDecoder().decode(unb64u(body)));
    return p.exp > now ? p : null;
  } catch { return null; }
}

export function requestToken(request) {
  const m = (request.headers.get('cookie') || '').match(/(?:^|;\s*)sp_session=([^;]+)/);
  if (m) return m[1];
  return (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '') || null;
}

export const sessionCookie = (token, maxAgeSec = 14 * 86400) =>
  `sp_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSec}`;
