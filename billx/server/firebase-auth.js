// Verify Firebase Authentication ID tokens without the Admin SDK
// (works on Cloudflare Workers). Follows Firebase's documented checks.
import { b64urlDecode } from './crypto.js';

const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
let jwksCache = { keys: null, until: 0 };

async function publicKeys(fetchFn) {
  if (jwksCache.keys && Date.now() < jwksCache.until) return jwksCache.keys;
  const res = await fetchFn(JWKS_URL);
  if (!res.ok) throw new Error('Could not load Google public keys');
  const age = Number((res.headers.get('cache-control') || '').match(/max-age=(\d+)/)?.[1] || 3600);
  const { keys } = await res.json();
  jwksCache = { keys, until: Date.now() + age * 1000 };
  return keys;
}

export const resetKeyCache = () => { jwksCache = { keys: null, until: 0 }; };

/**
 * Returns the token's claims ({ uid, email, email_verified, ... }) or throws.
 * opts.emulator: accept unsigned Auth-emulator tokens (never set in production).
 */
export async function verifyIdToken(token, projectId, { fetchFn = fetch, emulator = false, now = Date.now() } = {}) {
  if (!token || typeof token !== 'string') throw new Error('Missing sign-in token');
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Bad token');
  const dec = (p) => JSON.parse(new TextDecoder().decode(b64urlDecode(p)));
  const header = dec(parts[0]);
  const claims = dec(parts[1]);
  const t = Math.floor(now / 1000);

  if (claims.aud !== projectId) throw new Error('Token is for another project');
  if (claims.iss !== `https://securetoken.google.com/${projectId}`) throw new Error('Token issuer is wrong');
  if (!claims.sub || typeof claims.sub !== 'string') throw new Error('Token has no user');
  if (!(claims.exp > t)) throw new Error('Sign-in expired, please sign in again');
  if (claims.iat > t + 300 || (claims.auth_time && claims.auth_time > t + 300)) throw new Error('Token from the future');

  if (emulator && header.alg === 'none') return { ...claims, uid: claims.sub };
  if (header.alg !== 'RS256' || !header.kid) throw new Error('Unsupported token');
  const jwk = (await publicKeys(fetchFn)).find((k) => k.kid === header.kid);
  if (!jwk) throw new Error('Unknown token key');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlDecode(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
  if (!ok) throw new Error('Token signature is invalid');
  return { ...claims, uid: claims.sub };
}
