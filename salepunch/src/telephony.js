// Cloud telephony (Exotel, India). Click-to-call: Exotel rings the agent's
// mobile first, then connects the lead, showing the company number (ExoPhone)
// as caller ID. Exotel records the whole call and posts a status callback
// with the recording URL when the call ends.
//
// Settings (wrangler secrets / vars):
//   EXOTEL_SID, EXOTEL_API_KEY, EXOTEL_API_TOKEN, EXOTEL_CALLER_ID (your ExoPhone),
//   EXOTEL_SUBDOMAIN (api.exotel.com, or api.in.exotel.com for the Mumbai cluster)
// Docs: https://developer.exotel.com/api/make-a-call-api

export const exotelReady = (env) => !!(env.EXOTEL_SID && env.EXOTEL_API_KEY && env.EXOTEL_API_TOKEN && env.EXOTEL_CALLER_ID);

const basic = (env) => 'Basic ' + btoa(`${env.EXOTEL_API_KEY}:${env.EXOTEL_API_TOKEN}`);
const host = (env) => env.EXOTEL_SUBDOMAIN || 'api.exotel.com';

/** Starts agent -> lead call. Returns the provider call id. */
export async function exotelDial({ agentPhone, leadPhone, callId, callbackUrl }, env, fetchFn = fetch) {
  const form = new URLSearchParams({
    From: agentPhone,
    To: leadPhone,
    CallerId: env.EXOTEL_CALLER_ID,
    Record: 'true',
    RecordingChannels: 'dual', // agent and lead on separate channels
    StatusCallback: callbackUrl,
    'StatusCallbackEvents[0]': 'terminal',
    StatusCallbackContentType: 'application/json',
    CustomField: callId,
    TimeLimit: '3600',
  });
  const res = await fetchFn(`https://${host(env)}/v1/Accounts/${env.EXOTEL_SID}/Calls/connect.json`, {
    method: 'POST',
    headers: { authorization: basic(env), 'content-type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.RestException?.Message || `Exotel error ${res.status}`);
  return body?.Call?.Sid || '';
}

const STATUS = { completed: 'completed', 'no-answer': 'no_answer', busy: 'busy', failed: 'failed', canceled: 'failed' };

/** Reads an Exotel status callback (JSON or form encoded). */
export async function parseExotelCallback(request) {
  const type = request.headers.get('content-type') || '';
  let p;
  if (type.includes('json')) p = await request.json();
  else p = Object.fromEntries(new URLSearchParams(await request.text()));
  const status = String(p.Status || p.CallStatus || '').toLowerCase();
  const toMs = (t) => (t ? Date.parse(String(t).replace(' ', 'T') + (/[zZ+]/.test(String(t).slice(10)) ? '' : '+05:30')) : NaN);
  const start = toMs(p.StartTime || p.DateCreated);
  return {
    providerCallId: p.CallSid || p.Sid || '',
    callId: p.CustomField || '',
    status: STATUS[status] || (status ? 'failed' : 'completed'),
    durationSec: Number(p.ConversationDuration ?? p.DialCallDuration ?? p.Duration ?? 0) || 0,
    recordingUrl: p.RecordingUrl || '',
    startedAt: Number.isFinite(start) ? start : null,
    from: p.From || '',
    to: p.To || '',
  };
}

/** Downloads a provider recording (Exotel recordings need the API auth). */
export async function fetchRecording(url, env, fetchFn = fetch) {
  const sameProvider = /exotel/i.test(new URL(url).hostname);
  const res = await fetchFn(url, sameProvider && exotelReady(env) ? { headers: { authorization: basic(env) } } : {});
  if (!res.ok) throw new Error(`Could not download recording (${res.status})`);
  return { bytes: new Uint8Array(await res.arrayBuffer()), type: res.headers.get('content-type') || 'audio/mpeg' };
}
