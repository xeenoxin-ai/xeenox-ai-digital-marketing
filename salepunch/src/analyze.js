// Call analysis: turns a transcript into speaker-labelled turns, an outcome,
// a conversion chance, sales-skill scores, objections and script adherence.
// Uses Claude when ANTHROPIC_API_KEY is set; otherwise a simple keyword
// heuristic so the app still works end to end in a demo.
import Anthropic from '@anthropic-ai/sdk';
import { clampInt } from './util.js';

import { OUTCOMES, SKILLS } from './constants.js';

export { OUTCOMES, SKILLS };

const str = { type: 'string' };
const strList = { type: 'array', items: str };
const obj = (properties) => ({ type: 'object', additionalProperties: false, properties, required: Object.keys(properties) });

export const ANALYSIS_SCHEMA = obj({
  speakers: { type: 'array', description: 'One entry per numbered segment, in order', items: { type: 'string', enum: ['agent', 'lead'] } },
  language: str,
  summary: str,
  outcome: { type: 'string', enum: OUTCOMES },
  conversion_chance: { type: 'integer' },
  lead_intent: str,
  sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'] },
  skills: obj(Object.fromEntries(SKILLS.map((k) => [k, { type: 'integer' }]))),
  overall_score: { type: 'integer' },
  script_adherence: obj({ score: { type: 'integer' }, followed: strList, missed: strList }),
  objections: { type: 'array', items: obj({ objection: str, agent_response: str, handled_well: { type: 'boolean' } }) },
  strengths: strList,
  improvements: strList,
  red_flags: strList,
  next_action: str,
  follow_up_date: str,
  key_moments: { type: 'array', items: obj({ segment: { type: 'integer' }, note: str }) },
});

const SYSTEM = `You are SalePunch, a sales-call quality analyst for an Indian business. You read the transcript of one phone call between a company sales agent and a lead, and you judge it the way an experienced, fair sales manager would.

The transcript comes from speech-to-text, so expect mistakes, missing punctuation and a mix of English, Malayalam, Hindi or Tamil. Work out who is speaking from what is said: the agent introduces the company, pitches and asks for the next step; the lead asks prices, raises doubts and answers questions.

Scoring rules:
- skills: 0-10 each. 5 is average, 8+ is genuinely good, below 4 needs coaching. Score a skill 0 only if the call gave the agent the chance and they did not use it at all.
- overall_score: 0-100, your overall judgement of the agent's selling on this call (not of the lead).
- conversion_chance: 0-100, how likely this lead is to buy, based on what the lead actually said.
- outcome: "converted" only if the lead clearly agreed to buy, pay, book or visit. "interested" if positive but no commitment. "follow_up" if a callback or later decision was agreed. "not_interested" if the lead declined. "no_conversation" for voicemail, wrong number, silence or a call too short to judge.
- script_adherence: compare against the company script when one is given; list the steps followed and missed. With no script, judge against a standard sales call (greet, introduce, discover needs, pitch, handle objections, close).
- red_flags: rudeness, false promises, wrong prices, pressure tactics, sharing private data, or the lead being upset. Empty if none.
- follow_up_date: YYYY-MM-DD if a date was agreed, else "".
- key_moments: up to 6 segment numbers worth a manager listening to, with a short note.
- improvements: specific, practical coaching points the agent can use on the next call.

Write summary, notes and coaching in clear simple English, even when the call was in another language.`;

/** Numbered segment list the model labels by index. */
export function formatSegments(segments) {
  return segments.map((s, i) => `[${i}] ${fmtTime(s.start)} ${s.text.trim()}`).join('\n');
}
const fmtTime = (sec) => {
  const t = Math.max(0, Math.floor(Number(sec) || 0));
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

export function buildPrompt({ segments, script, product, lead, agentName, durationSec }) {
  return [
    product ? `<company_and_product>\n${product}\n</company_and_product>` : '',
    script ? `<company_sales_script>\n${script}\n</company_sales_script>` : '<company_sales_script>(none given)</company_sales_script>',
    `<call_details>\nAgent: ${agentName || 'unknown'}\nLead: ${lead?.name || 'unknown'} (status before call: ${lead?.status || 'unknown'})\nDuration: ${fmtTime(durationSec)}\n</call_details>`,
    `<transcript>\n${formatSegments(segments)}\n</transcript>`,
    'Analyse this call. Return one speaker label per numbered segment, in order.',
  ].filter(Boolean).join('\n\n');
}

/** Clamp and fill a raw analysis so the rest of the app can trust its shape. */
export function normalizeAnalysis(raw, segmentCount) {
  const a = raw && typeof raw === 'object' ? raw : {};
  const list = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()) : []);
  const skills = Object.fromEntries(SKILLS.map((k) => [k, clampInt(a.skills?.[k], 0, 10)]));
  const speakers = Array.from({ length: segmentCount }, (_, i) => (a.speakers?.[i] === 'lead' ? 'lead' : a.speakers?.[i] === 'agent' ? 'agent' : i % 2 ? 'lead' : 'agent'));
  const date = /^\d{4}-\d{2}-\d{2}$/.test(a.follow_up_date || '') ? a.follow_up_date : '';
  return {
    speakers,
    language: String(a.language || ''),
    summary: String(a.summary || ''),
    outcome: OUTCOMES.includes(a.outcome) ? a.outcome : 'no_conversation',
    conversion_chance: clampInt(a.conversion_chance, 0, 100),
    lead_intent: String(a.lead_intent || ''),
    sentiment: ['positive', 'neutral', 'negative'].includes(a.sentiment) ? a.sentiment : 'neutral',
    skills,
    overall_score: clampInt(a.overall_score, 0, 100),
    script_adherence: {
      score: clampInt(a.script_adherence?.score, 0, 100),
      followed: list(a.script_adherence?.followed),
      missed: list(a.script_adherence?.missed),
    },
    objections: (Array.isArray(a.objections) ? a.objections : [])
      .filter((o) => o && o.objection)
      .map((o) => ({ objection: String(o.objection), agent_response: String(o.agent_response || ''), handled_well: !!o.handled_well })),
    strengths: list(a.strengths),
    improvements: list(a.improvements),
    red_flags: list(a.red_flags),
    next_action: String(a.next_action || ''),
    follow_up_date: date,
    key_moments: (Array.isArray(a.key_moments) ? a.key_moments : [])
      .filter((m) => Number.isInteger(m?.segment) && m.segment >= 0 && m.segment < segmentCount)
      .slice(0, 6)
      .map((m) => ({ segment: m.segment, note: String(m.note || '') })),
  };
}

/** Agent vs lead share of spoken words, 0-100 for the agent. */
export function talkRatio(segments, speakers) {
  let agent = 0, total = 0;
  segments.forEach((s, i) => {
    const w = s.text.trim().split(/\s+/).filter(Boolean).length;
    total += w;
    if (speakers[i] === 'agent') agent += w;
  });
  return total ? Math.round((agent / total) * 100) : 0;
}

export async function analyzeWithClaude(input, env, client) {
  client ||= new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const response = await client.beta.messages.create({
    model: env.CLAUDE_MODEL || 'claude-opus-5-5',
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: ANALYSIS_SCHEMA } },
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: buildPrompt(input) }],
  });
  if (response.stop_reason === 'refusal') throw new Error('The AI declined to analyse this call');
  if (response.stop_reason === 'max_tokens') throw new Error('Analysis was cut off (call too long)');
  const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  return normalizeAnalysis(JSON.parse(text), input.segments.length);
}

// --- Keyword fallback (no API key) ------------------------------------------
const WORDS = {
  converted: /\b(book(ed)? it|confirm(ed)?|send (me )?the (payment|link)|i('ll| will) (pay|take it|buy)|done deal|let'?s go ahead)\b/i,
  interested: /\b(interested|sounds good|tell me more|send (me )?(details|brochure|quotation)|how much|price)\b/i,
  follow: /\b(call (me )?(back|later|tomorrow)|next week|think about it|discuss with)\b/i,
  no: /\b(not interested|don'?t call|no thanks|wrong number|already (bought|have))\b/i,
  objection: /\b(expensive|costly|budget|discount|not sure|competitor|cheaper|too much)\b/i,
  greet: /\b(hello|hi|good (morning|afternoon|evening)|namaskaram|namaste)\b/i,
  question: /\?/,
};

export function heuristicAnalysis({ segments, durationSec }) {
  const speakers = segments.map((s, i) => (/^\s*(lead|customer)\s*:/i.test(s.text) ? 'lead' : /^\s*agent\s*:/i.test(s.text) ? 'agent' : s.speaker || (i % 2 ? 'lead' : 'agent')));
  const all = segments.map((s) => s.text).join(' ');
  const leadText = segments.filter((_, i) => speakers[i] === 'lead').map((s) => s.text).join(' ');
  const agentText = segments.filter((_, i) => speakers[i] === 'agent').map((s) => s.text).join(' ');
  let outcome = 'no_conversation';
  if (segments.length >= 2 && (durationSec || 60) >= 15) {
    outcome = WORDS.no.test(leadText) ? 'not_interested' : WORDS.converted.test(leadText) ? 'converted'
      : WORDS.follow.test(all) ? 'follow_up' : WORDS.interested.test(leadText) ? 'interested' : 'follow_up';
  }
  const chance = { converted: 95, interested: 60, follow_up: 40, not_interested: 5, no_conversation: 0 }[outcome];
  const questions = (agentText.match(/\?/g) || []).length;
  const skills = {
    opening: WORDS.greet.test(segments.slice(0, 3).map((s) => s.text).join(' ')) ? 7 : 3,
    discovery: Math.min(10, 3 + questions * 2),
    pitch: agentText.split(/\s+/).length > 40 ? 6 : 4,
    objection_handling: WORDS.objection.test(leadText) ? 5 : 6,
    closing: WORDS.converted.test(all) || WORDS.follow.test(all) ? 7 : 3,
    tone: 6,
    listening: 5,
  };
  const overall = Math.round((Object.values(skills).reduce((a, b) => a + b, 0) / (SKILLS.length * 10)) * 100);
  return normalizeAnalysis({
    speakers,
    summary: 'Keyword estimate only. Add an ANTHROPIC_API_KEY for a full AI analysis of this call.',
    outcome,
    conversion_chance: chance,
    sentiment: outcome === 'not_interested' ? 'negative' : outcome === 'no_conversation' ? 'neutral' : 'positive',
    skills,
    overall_score: overall,
    script_adherence: { score: overall, followed: [], missed: [] },
    objections: WORDS.objection.test(leadText) ? [{ objection: 'Price / timing concern raised', agent_response: '', handled_well: false }] : [],
    improvements: questions < 2 ? ['Ask more questions to understand the lead\'s needs before pitching.'] : [],
    next_action: outcome === 'follow_up' ? 'Call the lead back as agreed.' : '',
  }, segments.length);
}

export async function analyzeCall(input, env, client) {
  if (!input.segments.length) return normalizeAnalysis({ outcome: 'no_conversation', summary: 'No speech was found in the recording.' }, 0);
  if (env.ANTHROPIC_API_KEY || client) return { ...(await analyzeWithClaude(input, env, client)), engine: 'claude' };
  return { ...heuristicAnalysis(input), engine: 'keywords' };
}

/** Short end-of-day coaching note for one agent from their call summaries. */
export async function coachingNote({ agentName, stats, calls }, env, client) {
  if (!env.ANTHROPIC_API_KEY && !client) return '';
  client ||= new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const lines = calls.slice(0, 40).map((c, i) =>
    `${i + 1}. outcome=${c.outcome} score=${c.skill_score} chance=${c.conversion_chance}% — ${c.summary} | improve: ${(c.improvements || []).join('; ')}`);
  const response = await client.beta.messages.create({
    model: env.CLAUDE_MODEL || 'claude-opus-5-5',
    max_tokens: 4000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low' },
    system: 'You are a supportive, direct sales coach. Write a short end-of-day note (under 120 words, plain text, no markdown headings) for one sales agent: one thing they did well today, the two most important things to fix tomorrow with an example line they could say, and one lead to prioritise. Use simple English.',
    messages: [{ role: 'user', content: `Agent: ${agentName}\nToday's numbers: ${JSON.stringify(stats)}\nCalls:\n${lines.join('\n')}` }],
  });
  if (response.stop_reason === 'refusal') return '';
  return response.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
}
