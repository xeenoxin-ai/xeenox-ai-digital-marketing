// Minimal Firestore REST client authenticated with a Google service account
// (works on Cloudflare Workers). Service-account writes bypass security rules,
// so only the payment server uses this.
import { importPrivateKeyPem, signJwtRS256 } from './crypto.js';

export function encodeValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encodeValue) } };
  if (typeof v === 'object') return { mapValue: { fields: encodeFields(v) } };
  throw new Error(`Cannot store ${typeof v}`);
}
export const encodeFields = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined).map(([k, v]) => [k, encodeValue(v)]));

export function decodeValue(v) {
  if ('nullValue' in v) return null;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('stringValue' in v) return v.stringValue;
  if ('timestampValue' in v) return new Date(v.timestampValue);
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in v) return decodeFields(v.mapValue.fields || {});
  return undefined;
}
export const decodeFields = (fields) => Object.fromEntries(Object.entries(fields || {}).map(([k, v]) => [k, decodeValue(v)]));

export class Firestore {
  /**
   * env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT (JSON),
   * env.FIRESTORE_EMULATOR_HOST (e.g. "127.0.0.1:8080") for local testing.
   */
  constructor(env, fetchFn = fetch) {
    this.projectId = env.FIREBASE_PROJECT_ID;
    this.emulator = env.FIRESTORE_EMULATOR_HOST || '';
    this.sa = this.emulator ? null : JSON.parse(env.FIREBASE_SERVICE_ACCOUNT || '{}');
    this.fetch = fetchFn;
    this.token = { value: '', until: 0 };
    const host = this.emulator ? `http://${this.emulator}` : 'https://firestore.googleapis.com';
    this.base = `${host}/v1/projects/${this.projectId}/databases/(default)/documents`;
  }

  async authHeader() {
    if (this.emulator) return 'Bearer owner';
    if (this.token.value && Date.now() < this.token.until) return `Bearer ${this.token.value}`;
    if (!this.sa.client_email || !this.sa.private_key) throw new Error('FIREBASE_SERVICE_ACCOUNT is not set');
    const now = Math.floor(Date.now() / 1000);
    const jwt = await signJwtRS256({
      iss: this.sa.client_email, sub: this.sa.client_email, aud: 'https://oauth2.googleapis.com/token',
      scope: 'https://www.googleapis.com/auth/datastore', iat: now, exp: now + 3600,
    }, await importPrivateKeyPem(this.sa.private_key), this.sa.private_key_id);
    const res = await this.fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${jwt}`,
    });
    if (!res.ok) throw new Error(`Google sign-in for the server failed (${res.status})`);
    const data = await res.json();
    this.token = { value: data.access_token, until: Date.now() + (data.expires_in - 120) * 1000 };
    return `Bearer ${this.token.value}`;
  }

  /** Returns the document's fields, or null if it does not exist. */
  async get(path) {
    const res = await this.fetch(`${this.base}/${path}`, { headers: { authorization: await this.authHeader() } });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Database read failed (${res.status})`);
    return decodeFields((await res.json()).fields);
  }

  /** Update only the given fields of an existing document. */
  async update(path, data) {
    const mask = Object.keys(data).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
    const res = await this.fetch(`${this.base}/${path}?${mask}&currentDocument.exists=true`, {
      method: 'PATCH',
      headers: { authorization: await this.authHeader(), 'content-type': 'application/json' },
      body: JSON.stringify({ fields: encodeFields(data) }),
    });
    if (!res.ok) throw new Error(`Database write failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
    return decodeFields((await res.json()).fields);
  }
}
