// "Continue with Google" (OAuth 2.0 authorization-code flow, OpenID Connect).
// Settings: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (Cloudflare secrets).
// Google Cloud Console → APIs & Services → Credentials → OAuth client ID
// (Web application), with this authorized redirect URI:
//   <APP origin>/api/auth/google/callback

export const googleReady = (env) => !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

export function authUrl({ clientId, redirectUri, state }) {
  const q = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
    access_type: 'online',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
}

/** Exchanges the code for tokens and returns the verified Google profile. */
export async function exchangeCode({ code, clientId, clientSecret, redirectUri }, fetchFn = fetch) {
  const res = await fetchFn('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.id_token) throw new Error(body.error_description || body.error || `Google sign-in failed (${res.status})`);
  return profileFromIdToken(body.id_token, clientId);
}

/**
 * The ID token came straight from Google over TLS in the code exchange, so
 * its claims are trusted without checking the signature (OpenID Connect Core
 * 3.1.3.7); we still check who it was issued for and that it is fresh.
 */
export function profileFromIdToken(idToken, clientId, now = Date.now()) {
  const part = String(idToken).split('.')[1];
  if (!part) throw new Error('Bad ID token');
  const json = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(part.replaceAll('-', '+').replaceAll('_', '/')), (c) => c.charCodeAt(0))));
  if (!['https://accounts.google.com', 'accounts.google.com'].includes(json.iss)) throw new Error('Token not from Google');
  if (json.aud !== clientId) throw new Error('Token is for another app');
  if (!json.exp || json.exp * 1000 < now) throw new Error('Token expired');
  if (!json.email || json.email_verified === false || json.email_verified === 'false') throw new Error('Google account email is not verified');
  return { email: String(json.email).toLowerCase(), name: json.name || json.email.split('@')[0], sub: json.sub };
}
