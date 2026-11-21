// Speech to text with Cloudflare Workers AI (Whisper large v3 turbo). It
// handles English, Hindi, Malayalam, Tamil and mixed speech, and returns
// time-stamped segments. Speakers are labelled later by the analysis step.

export const WHISPER = '@cf/openai/whisper-large-v3-turbo';

function toBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

/** Returns {language, segments:[{start, end, text}]}. */
export async function transcribe(bytes, env, { language } = {}) {
  if (!env.AI) throw new Error('Workers AI binding "AI" is missing (see wrangler.toml)');
  const input = { audio: toBase64(bytes), vad_filter: true };
  if (language) input.language = language;
  const out = await env.AI.run(WHISPER, input);
  const segments = (out.segments || [])
    .map((s) => ({ start: Number(s.start) || 0, end: Number(s.end) || 0, text: String(s.text || '').trim() }))
    .filter((s) => s.text);
  if (!segments.length && out.text) segments.push({ start: 0, end: 0, text: String(out.text).trim() });
  return { language: out.transcription_info?.language || language || '', segments };
}

/**
 * A pasted transcript (for calls recorded elsewhere). Lines like
 * "Agent: hello" / "Lead: hi" keep their speaker; other lines alternate.
 */
export function parseTextTranscript(text) {
  return String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((line, i) => {
    const m = line.match(/^(agent|sales|me|lead|customer|client)\s*[:\-]\s*(.*)$/i);
    const speaker = m ? (/^(agent|sales|me)$/i.test(m[1]) ? 'agent' : 'lead') : undefined;
    return { start: i * 5, end: i * 5 + 5, text: m ? m[2] : line, speaker };
  }).filter((s) => s.text);
}
