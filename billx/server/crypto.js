// Web Crypto helpers that run on Cloudflare Workers and Node 18+.

const enc = new TextEncoder();

export function b64urlEncode(bytes) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}
export function b64urlDecode(str) {
  const pad = str.length % 4 ? '='.repeat(4 - (str.length % 4)) : '';
  const s = atob(str.replaceAll('-', '+').replaceAll('_', '/') + pad);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}
export const b64urlJSON = (obj) => b64urlEncode(enc.encode(JSON.stringify(obj)));

export async function hmacSha256Hex(secret, message) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(message)));
  return [...sig].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time string comparison. */
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function importPrivateKeyPem(pem) {
  const body = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
}

export async function signJwtRS256(payload, privateKey, kid) {
  const header = { alg: 'RS256', typ: 'JWT', ...(kid ? { kid } : {}) };
  const input = `${b64urlJSON(header)}.${b64urlJSON(payload)}`;
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, enc.encode(input));
  return `${input}.${b64urlEncode(sig)}`;
}
