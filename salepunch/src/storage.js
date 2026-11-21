// Call recordings, kept inside SalePunch.
// With an R2 bucket bound as RECORDINGS, files go there. Without it, they are
// stored in the D1 database in 1 MB pieces (D1 rows hold up to 2 MB), so
// every recording stays in SalePunch even on a plan without R2.
// recording_key: "db:<mime type>" = in D1, anything else = R2 object key.
import { fetchRecording } from './telephony.js';

export const CHUNK = 1000000;

export function extFor(type, name = '') {
  const fromName = String(name).split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5);
  if (fromName && fromName !== String(name).toLowerCase()) return fromName;
  if (/wav/.test(type)) return 'wav';
  if (/ogg|opus/.test(type)) return 'ogg';
  if (/amr/.test(type)) return 'amr';
  if (/mpeg|mp3/.test(type)) return 'mp3';
  return 'm4a';
}

/** Saves the audio and returns the recording_key to store on the call. */
export async function saveRecording(env, call, bytes, type = 'audio/mpeg', name = '') {
  type = String(type || 'audio/mpeg').split(';')[0].trim() || 'audio/mpeg';
  if (env.RECORDINGS) {
    const key = `calls/${call.day}/${call.id}.${extFor(type, name)}`;
    await env.RECORDINGS.put(key, bytes, { httpMetadata: { contentType: type } });
    return key;
  }
  const stmts = [env.DB.prepare('DELETE FROM recording_chunks WHERE call_id = ?').bind(call.id)];
  for (let i = 0, seq = 0; i < bytes.length; i += CHUNK, seq++) {
    stmts.push(env.DB.prepare('INSERT INTO recording_chunks (call_id, seq, data) VALUES (?, ?, ?)').bind(call.id, seq, bytes.subarray(i, i + CHUNK)));
  }
  await env.DB.batch(stmts);
  return `db:${type}`;
}

/** Loads a call's audio as {bytes, type}, or null if there is none. */
export async function loadRecording(env, call) {
  const key = call.recording_key;
  if (key && key.startsWith('db:')) {
    const { results } = await env.DB.prepare('SELECT data FROM recording_chunks WHERE call_id = ? ORDER BY seq').bind(call.id).all();
    if (!results.length) return null;
    const parts = results.map((r) => new Uint8Array(r.data));
    const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
    let o = 0;
    for (const p of parts) { out.set(p, o); o += p.length; }
    return { bytes: out, type: key.slice(3) || 'audio/mpeg' };
  }
  if (key && env.RECORDINGS) {
    const obj = await env.RECORDINGS.get(key);
    if (obj) return { bytes: new Uint8Array(await obj.arrayBuffer()), type: obj.httpMetadata?.contentType || 'audio/mpeg' };
  }
  if (call.recording_url) return fetchRecording(call.recording_url, env);
  return null;
}

/** Audio response with Range support, so the player can jump to any moment. */
export function audioResponse(bytes, type, rangeHeader) {
  const size = bytes.length;
  const base = { 'content-type': type, 'accept-ranges': 'bytes', 'cache-control': 'private, max-age=3600' };
  const m = /^bytes=(\d*)-(\d*)$/.exec(String(rangeHeader || '').trim());
  if (!m || (m[1] === '' && m[2] === '')) return new Response(bytes, { headers: { ...base, 'content-length': String(size) } });
  let start, end;
  if (m[1] === '') { start = Math.max(0, size - Number(m[2])); end = size - 1; } // last N bytes
  else { start = Number(m[1]); end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1); }
  if (start >= size || start > end) return new Response(null, { status: 416, headers: { ...base, 'content-range': `bytes */${size}` } });
  return new Response(bytes.slice(start, end + 1), {
    status: 206,
    headers: { ...base, 'content-range': `bytes ${start}-${end}/${size}`, 'content-length': String(end - start + 1) },
  });
}
