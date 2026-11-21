import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, signSession, readSession } from '../salepunch/src/auth.js';
import { normalizePhone, parseCsv, dayOf } from '../salepunch/src/util.js';
import { analyzeCall, normalizeAnalysis, heuristicAnalysis, talkRatio, ANALYSIS_SCHEMA, buildPrompt } from '../salepunch/src/analyze.js';
import { agentStats, teamStats } from '../salepunch/src/stats.js';
import { mapIncomingLead, leadStatusAfterCall, crmEvent } from '../salepunch/src/crm.js';
import { parseExotelCallback, exotelDial } from '../salepunch/src/telephony.js';
import { parseTextTranscript } from '../salepunch/src/transcribe.js';

test('passwords hash and verify', async () => {
  const h = await hashPassword('secret-pass');
  assert.ok(await verifyPassword('secret-pass', h));
  assert.ok(!(await verifyPassword('wrong', h)));
});

test('sessions are signed and expire', async () => {
  const secret = 'x'.repeat(32);
  const t = await signSession('u1', secret, 1000, 1);
  assert.equal((await readSession(t, secret, 2000)).uid, 'u1');
  assert.equal(await readSession(t, secret, 1000 + 2 * 86400000), null);
  assert.equal(await readSession(t, 'y'.repeat(32), 2000), null);
  assert.equal(await readSession(t.slice(0, -2) + 'AA', secret, 2000), null);
});

test('Indian phone numbers normalise to +91', () => {
  assert.equal(normalizePhone('98470 12345'), '+919847012345');
  assert.equal(normalizePhone('09847012345'), '+919847012345');
  assert.equal(normalizePhone('+91-98470-12345'), '+919847012345');
  assert.equal(normalizePhone('919847012345'), '+919847012345');
  assert.equal(normalizePhone(''), '');
});

test('CSV with quotes parses', () => {
  const rows = parseCsv('Name,Phone,Notes\n"Menon, Rahul",9847012345,"said ""call later"""\n\n');
  assert.deepEqual(rows, [{ name: 'Menon, Rahul', phone: '9847012345', notes: 'said "call later"' }]);
});

test('day is computed in India time', () => {
  assert.equal(dayOf(Date.parse('2026-11-20T19:00:00Z')), '2026-11-21');
});

test('incoming leads map from Meta lead ads and loose field names', () => {
  const meta = mapIncomingLead({ id: '77', field_data: [{ name: 'full_name', values: ['Asha'] }, { name: 'phone_number', values: ['+919000000000'] }] });
  assert.equal(meta.name, 'Asha'); assert.equal(meta.phone, '+919000000000'); assert.equal(meta.external_id, '77');
  const form = mapIncomingLead({ 'First Name': 'Ravi', 'Last Name': 'K', Mobile: '9000000001', 'Lead Source': 'Website', Owner: 'Anu@X.test' });
  assert.equal(form.name, 'Ravi K'); assert.equal(form.source, 'Website'); assert.equal(form.owner_email, 'anu@x.test');
  assert.equal(mapIncomingLead({ name: 'No phone' }), null);
});

test('lead status follows the call outcome but never undoes a win', () => {
  assert.equal(leadStatusAfterCall('new', 'converted'), 'won');
  assert.equal(leadStatusAfterCall('won', 'not_interested'), 'won');
  assert.equal(leadStatusAfterCall('new', 'no_conversation'), 'contacted');
  assert.equal(leadStatusAfterCall('interested', 'no_conversation'), 'interested');
});

test('analysis is clamped and filled', () => {
  const a = normalizeAnalysis({ outcome: 'bogus', conversion_chance: 140, skills: { opening: 12, tone: -3 }, speakers: ['agent', 'x'], follow_up_date: 'Monday', key_moments: [{ segment: 9, note: 'out of range' }, { segment: 1, note: 'ok' }] }, 2);
  assert.equal(a.outcome, 'no_conversation');
  assert.equal(a.conversion_chance, 100);
  assert.equal(a.skills.opening, 10); assert.equal(a.skills.tone, 0); assert.equal(a.skills.pitch, 0);
  assert.deepEqual(a.speakers, ['agent', 'lead']);
  assert.equal(a.follow_up_date, '');
  assert.deepEqual(a.key_moments, [{ segment: 1, note: 'ok' }]);
});

test('the output schema is strict for structured outputs', () => {
  const walk = (s) => {
    if (s.type === 'object') {
      assert.equal(s.additionalProperties, false);
      assert.deepEqual(s.required.sort(), Object.keys(s.properties).sort());
      Object.values(s.properties).forEach(walk);
    }
    if (s.type === 'array') walk(s.items);
  };
  walk(ANALYSIS_SCHEMA);
});

const segs = parseTextTranscript('Agent: Hello sir, this is Anu from Xeenox. How are you?\nLead: Fine. How much is it?\nAgent: It is 3499. Shall I book it for Saturday?\nLead: Too expensive, call me back next week.');

test('pasted transcripts keep speakers', () => {
  assert.deepEqual(segs.map((s) => s.speaker), ['agent', 'lead', 'agent', 'lead']);
  assert.equal(segs[1].text, 'Fine. How much is it?');
});

test('keyword fallback gives a usable result', () => {
  const a = heuristicAnalysis({ segments: segs, durationSec: 90 });
  assert.equal(a.outcome, 'follow_up');
  assert.equal(a.objections.length, 1);
  assert.ok(a.overall_score > 0);
  assert.ok(talkRatio(segs, a.speakers) > 50);
});

test('Claude analysis sends the transcript, script and schema', async () => {
  let sent;
  const fake = {
    beta: { messages: { create: async (req) => {
      sent = req;
      return { stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify({
        speakers: ['agent', 'lead', 'agent', 'lead'], language: 'en', summary: 'Price objection; callback agreed.', outcome: 'follow_up',
        conversion_chance: 45, lead_intent: 'Wants service, price sensitive', sentiment: 'neutral',
        skills: { opening: 7, discovery: 4, pitch: 6, objection_handling: 3, closing: 6, tone: 8, listening: 6 }, overall_score: 58,
        script_adherence: { score: 60, followed: ['Greeting'], missed: ['Offer the pickup benefit'] },
        objections: [{ objection: 'Too expensive', agent_response: 'None', handled_well: false }],
        strengths: ['Friendly'], improvements: ['Answer price objections with value'], red_flags: [], next_action: 'Call back', follow_up_date: '2026-11-23',
        key_moments: [{ segment: 3, note: 'Objection' }] }) }] };
    } } },
  };
  const a = await analyzeCall({ segments: segs, script: '1. Greet 2. Offer free pickup', lead: { name: 'Rahul', status: 'new' }, agentName: 'Anu', durationSec: 90 }, {}, fake);
  assert.equal(a.engine, 'claude');
  assert.equal(a.outcome, 'follow_up');
  assert.equal(a.follow_up_date, '2026-11-23');
  assert.equal(sent.model, 'claude-opus-5-5');
  assert.equal(sent.output_config.format.type, 'json_schema');
  assert.match(sent.messages[0].content, /Offer free pickup/);
  assert.match(sent.messages[0].content, /\[3\] 00:15 Too expensive/);
});

test('Claude refusal becomes an error, not a fake result', async () => {
  const fake = { beta: { messages: { create: async () => ({ stop_reason: 'refusal', content: [] }) } } };
  await assert.rejects(analyzeCall({ segments: segs }, {}, fake), /declined/);
});

test('prompt includes product info and call details', () => {
  const p = buildPrompt({ segments: segs, product: 'Car service 3499', lead: { name: 'Rahul' }, agentName: 'Anu', durationSec: 125 });
  assert.match(p, /Car service 3499/); assert.match(p, /Duration: 02:05/); assert.match(p, /\(none given\)/);
});

const call = (o) => ({ agent_id: 'a', status: 'completed', processing: 'done', duration_sec: 120, outcome: 'interested', skill_score: 60, conversion_chance: 50, analysis: { skills: { opening: 6 }, objections: [], red_flags: [] }, ...o });

test('agent stats: conversion % is over connected calls', () => {
  const s = agentStats([
    call({ outcome: 'converted', skill_score: 80, analysis: { skills: { opening: 8 }, objections: [{ objection: 'Price' }], red_flags: ['rude'] } }),
    call({}),
    call({ status: 'no_answer', duration_sec: 0, processing: 'skipped', outcome: null, skill_score: null }),
    call({ duration_sec: 10, outcome: 'no_conversation' }),
  ]);
  assert.equal(s.dialed, 4); assert.equal(s.connected, 2); assert.equal(s.converted, 1);
  assert.equal(s.conversion_pct, 50); assert.equal(s.avg_skill_score, 70); assert.equal(s.skills.opening, 7);
  assert.equal(s.red_flags, 1); assert.deepEqual(s.top_objections, [{ objection: 'price', count: 1 }]);
});

test('team stats rank agents by conversions', () => {
  const t = teamStats([call({ agent_id: 'b', outcome: 'converted' }), call({ agent_id: 'a' })], [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }]);
  assert.deepEqual(t.agents.map((x) => x.name), ['B', 'A']);
  assert.equal(t.team.dialed, 2);
});

test('Exotel callback parses JSON and form bodies', async () => {
  const j = await parseExotelCallback(new Request('https://x/hooks', { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ CallSid: 'S1', Status: 'completed', ConversationDuration: 95, RecordingUrl: 'https://rec/1.mp3', StartTime: '2026-11-21 10:15:00', CustomField: 'c1' }) }));
  assert.deepEqual([j.callId, j.status, j.durationSec, j.recordingUrl, j.startedAt], ['c1', 'completed', 95, 'https://rec/1.mp3', Date.parse('2026-11-21T04:45:00Z')]);
  const f = await parseExotelCallback(new Request('https://x/hooks', { method: 'POST', body: new URLSearchParams({ CallSid: 'S2', Status: 'no-answer' }) }));
  assert.equal(f.status, 'no_answer');
});

test('Exotel dial sends a recorded click-to-call', async () => {
  let req;
  const sid = await exotelDial({ agentPhone: '+919000000001', leadPhone: '+919847012345', callId: 'c1', callbackUrl: 'https://app/hooks/exotel?key=k' },
    { EXOTEL_SID: 'acme', EXOTEL_API_KEY: 'k', EXOTEL_API_TOKEN: 't', EXOTEL_CALLER_ID: '04912345678' },
    async (url, init) => { req = { url, init }; return new Response(JSON.stringify({ Call: { Sid: 'S9' } })); });
  assert.equal(sid, 'S9');
  assert.equal(req.url, 'https://api.exotel.com/v1/Accounts/acme/Calls/connect.json');
  const body = new URLSearchParams(req.init.body);
  assert.equal(body.get('From'), '+919000000001'); assert.equal(body.get('To'), '+919847012345');
  assert.equal(body.get('Record'), 'true'); assert.equal(body.get('CustomField'), 'c1');
});

test('CRM event carries the outcome and follow-up', () => {
  const a = normalizeAnalysis({ outcome: 'interested', summary: 'S', follow_up_date: '2026-11-25', objections: [{ objection: 'Price' }] }, 0);
  const e = crmEvent({ call: { id: 'c1', started_at: 0, duration_sec: 60 }, lead: { id: 'l1', name: 'R', phone: '+91', status: 'interested' }, agent: { name: 'Anu', email: 'a@x' }, analysis: a, appUrl: 'https://sp' });
  assert.equal(e.outcome, 'interested'); assert.equal(e.follow_up_date, '2026-11-25'); assert.deepEqual(e.objections, ['Price']);
  assert.equal(e.call_url, 'https://sp/#/calls/c1');
});

// ---- sales leaks & productivity
import { salesLeaks, productivity } from '../salepunch/src/insights.js';

const H = 3600000, D = 24 * H, NOW = Date.parse('2026-11-21T12:00:00Z');
const lead = (id, o = {}) => ({ id, name: id, phone: '+91' + id, status: 'new', owner_id: 'a', source: 'Meta', created_at: NOW - 5 * D, next_follow_up: null, ...o });
const kall = (lead_id, o = {}) => ({ id: 'c-' + lead_id + (o.started_at || ''), lead_id, agent_id: 'a', status: 'completed', outcome: 'interested', started_at: NOW - 4 * D, duration_sec: 120, processing: 'done', skill_score: 60, analysis: { skills: { closing: 7 }, objections: [], red_flags: [], next_action: 'call back', script_adherence: { missed: [] } }, ...o });

test('sales leaks: finds each kind of leak and builds the funnel', () => {
  const leads = [
    lead('never'),                                                     // never called
    lead('slow', { status: 'contacted' }),                             // first call 4 days after creation
    lead('fu', { status: 'follow_up', next_follow_up: '2026-11-19' }), // follow-up missed
    lead('noans', { status: 'contacted' }),                            // 1 unanswered attempt, no retry
    lead('won', { status: 'won', source: 'Website' }),
    lead('fresh', { created_at: NOW - H }),                            // too new to count as never called
  ];
  const calls = [
    kall('slow', { started_at: NOW - 1 * D }),
    kall('fu', { outcome: 'follow_up', started_at: NOW - 5 * D + 10 * 60000 }),
    kall('noans', { status: 'no_answer', duration_sec: 0, outcome: null, processing: 'skipped', analysis: null, started_at: NOW - 3 * D }),
    kall('won', { outcome: 'converted', started_at: NOW - 5 * D + 5 * 60000, analysis: { skills: { closing: 9 }, objections: [{ objection: 'Price', handled_well: false }], red_flags: [], next_action: 'x', script_adherence: { missed: ['Mention warranty'] } } }),
    kall('x1', { outcome: 'not_interested', duration_sec: 30, lead_name: 'Gone', analysis: { skills: { closing: 2 }, objections: [{ objection: 'Too expensive', handled_well: false }], red_flags: ['Rude'], next_action: '', script_adherence: { missed: ['Mention warranty'] } } }),
    kall('x2', { outcome: 'interested', analysis: { skills: { closing: 3 }, objections: [], red_flags: [], next_action: '', script_adherence: { missed: [] } } }),
  ];
  const r = salesLeaks({ leads, calls, users: [{ id: 'a', name: 'Anu' }], today: '2026-11-21', now: NOW });
  const by = Object.fromEntries(r.leaks.map((l) => [l.key, l]));
  assert.deepEqual(by.never_called.items.map((i) => i.id), ['never']);
  assert.ok(by.slow_first_call.items.some((i) => i.id === 'slow'));
  assert.deepEqual(by.missed_follow_ups.items.map((i) => i.id), ['fu']);
  assert.deepEqual(by.not_retried.items.map((i) => i.id), ['noans']);
  assert.equal(by.no_close.count, 1);            // x2: interested, no next step
  assert.equal(by.objections.count, 1);          // won call's objection doesn't count, x1's does
  assert.equal(by.early_hangup.count, 1);
  assert.equal(by.red_flags.count, 1);
  assert.equal(r.leads_at_risk, 3);
  assert.deepEqual(r.funnel.map((f) => f.count), [6, 4, 3, 3, 1]);
  assert.equal(r.lost_reasons[0].text, 'too expensive');
  assert.deepEqual(r.missed_steps[0], { text: 'mention warranty', count: 2 });
  assert.equal(r.by_source.find((s) => s.source === 'Website').conversion_pct, 100);
  assert.equal(r.leaks[0].severity, 'high');
});

test('productivity: activity, gaps, target and best hour', () => {
  const at = (h, m = 0) => Date.parse(`2026-11-21T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00+05:30`);
  const calls = [
    { agent_id: 'a', status: 'completed', outcome: 'converted', started_at: at(10), duration_sec: 300 },
    { agent_id: 'a', status: 'no_answer', outcome: null, started_at: at(10, 10), duration_sec: 0 },
    { agent_id: 'a', status: 'completed', outcome: 'interested', started_at: at(12, 10), duration_sec: 60 },
    { agent_id: 'b', status: 'completed', outcome: 'interested', started_at: at(10, 30), duration_sec: 90 },
  ];
  const p = productivity({ calls, users: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], target: 4 });
  const a = p.agents.find((x) => x.agent_id === 'a');
  assert.equal(a.calls, 3); assert.equal(a.connected, 2); assert.equal(a.converted, 1);
  assert.equal(a.target_pct, 75); assert.equal(a.longest_gap_min, 120); assert.equal(a.active_hours, 2.2);
  assert.equal(a.hours[10], 2); assert.equal(a.hours[12], 1);
  assert.deepEqual(p.hours.map((h) => [h.hour, h.calls, h.connected]), [[10, 3, 2], [12, 1, 1]]);
  assert.equal(p.best_hours[0].hour, 10);
});

// ---- Google sign-in
import { profileFromIdToken, authUrl } from '../salepunch/src/google.js';
import { signToken, readToken } from '../salepunch/src/auth.js';

const fakeIdToken = (claims) => ['e30', Buffer.from(JSON.stringify(claims)).toString('base64url'), 'sig'].join('.');

test('Google ID token: accepted only for our app, fresh and verified', () => {
  const now = Date.parse('2026-11-21T10:00:00Z');
  const ok = { iss: 'https://accounts.google.com', aud: 'cid', exp: now / 1000 + 300, email: 'Anu@Gmail.com', email_verified: true, name: 'Anu', sub: '1' };
  assert.deepEqual(profileFromIdToken(fakeIdToken(ok), 'cid', now), { email: 'anu@gmail.com', name: 'Anu', sub: '1' });
  assert.throws(() => profileFromIdToken(fakeIdToken({ ...ok, aud: 'other' }), 'cid', now), /another app/);
  assert.throws(() => profileFromIdToken(fakeIdToken({ ...ok, iss: 'evil.com' }), 'cid', now), /not from Google/);
  assert.throws(() => profileFromIdToken(fakeIdToken({ ...ok, exp: now / 1000 - 1 }), 'cid', now), /expired/);
  assert.throws(() => profileFromIdToken(fakeIdToken({ ...ok, email_verified: false }), 'cid', now), /not verified/);
});

test('Google auth URL asks for email and picks an account', () => {
  const u = new URL(authUrl({ clientId: 'cid', redirectUri: 'https://x/api/auth/google/callback', state: 's' }));
  assert.equal(u.hostname, 'accounts.google.com');
  assert.equal(u.searchParams.get('scope'), 'openid email profile');
  assert.equal(u.searchParams.get('redirect_uri'), 'https://x/api/auth/google/callback');
  assert.equal(u.searchParams.get('prompt'), 'select_account');
});

test('sign-in hand-off tokens are typed and can never be used as a session', async () => {
  const secret = 'x'.repeat(32);
  const t = await signToken('handoff', { uid: 'u1' }, secret, 60000, 1000);
  assert.equal((await readToken('handoff', t, secret, 2000)).uid, 'u1');
  assert.equal(await readToken('oauth', t, secret, 2000), null);
  assert.equal(await readToken('handoff', t, secret, 1000 + 61000), null);
  assert.equal(await readSession(t, secret, 2000), null);
});

// ---- free AI (Workers AI)
import { analyzeWithWorkersAI, workersAiContent } from '../salepunch/src/analyze.js';

test('Workers AI replies are read in every shape the models use', () => {
  assert.deepEqual(workersAiContent({ response: { a: 1 } }), { a: 1 });
  assert.deepEqual(workersAiContent({ response: '```json\n{"a":2}\n```' }), { a: 2 });
  assert.deepEqual(workersAiContent({ choices: [{ message: { content: 'Here you go: {"a":3}' } }] }), { a: 3 });
});

test('free AI analysis: prompt has today, script score fixed when given out of 10', async () => {
  let req;
  const env = { AI: { run: async (model, body) => { req = { model, body }; return { response: {
    speakers: ['agent', 'lead', 'agent', 'lead'], outcome: 'follow_up', conversion_chance: 40, overall_score: 60,
    skills: { opening: 8, closing: 4 }, script_adherence: { score: 7, followed: ['/greet', '2. pitch', 'warranty'], missed: ['- ask booking'] },
    objections: [], follow_up_date: '2026-11-23', summary: 's' } }; } } };
  const a = await analyzeCall({ segments: segs, script: 'x', today: '2026-11-21', durationSec: 90 }, env);
  assert.equal(a.engine, 'workers-ai');
  assert.equal(req.model, '@cf/meta/llama-3.3-70b-instruct-fp8-fast');
  assert.match(req.body.messages[1].content, /Today: 2026-11-21 \(Saturday\)/);
  assert.equal(req.body.response_format.type, 'json_schema');
  assert.deepEqual(a.script_adherence, { score: 75, followed: ['greet', 'pitch', 'warranty'], missed: ['ask booking'] });
  assert.equal(a.follow_up_date, '2026-11-23');
});

test('free AI failure falls back to the keyword estimate', async () => {
  const env = { AI: { run: async () => { throw new Error('quota'); } } };
  const a = await analyzeCall({ segments: segs, durationSec: 90 }, env);
  assert.equal(a.engine, 'keywords');
});

// ---- CRM helpers & recording storage
import { nextAssignee, toCsv } from '../salepunch/src/crm.js';
import { audioResponse, saveRecording, loadRecording, extFor, CHUNK } from '../salepunch/src/storage.js';

test('pipeline stages only move forward after a call', () => {
  assert.equal(leadStatusAfterCall('proposal', 'interested'), 'proposal');
  assert.equal(leadStatusAfterCall('negotiation', 'follow_up'), 'negotiation');
  assert.equal(leadStatusAfterCall('contacted', 'follow_up'), 'follow_up');
  assert.equal(leadStatusAfterCall('follow_up', 'interested'), 'interested');
  assert.equal(leadStatusAfterCall('lost', 'interested'), 'interested'); // reopened
  assert.equal(leadStatusAfterCall('negotiation', 'not_interested'), 'lost');
  assert.equal(leadStatusAfterCall('proposal', 'converted'), 'won');
});

test('round-robin assignment cycles through agents', () => {
  const a = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  assert.equal(nextAssignee(a, null).id, 'a');
  assert.equal(nextAssignee(a, 'a').id, 'b');
  assert.equal(nextAssignee(a, 'c').id, 'a');
  assert.equal(nextAssignee(a, 'gone').id, 'a');
  assert.equal(nextAssignee([], 'a'), null);
});

test('CSV export quotes cells, keeps phone numbers and blocks formulas', () => {
  const csv = toCsv([{ n: 'Menon, Rahul', p: '+919847012345', x: '=HYPERLINK("evil")', q: 'say "hi"' }], [['n', 'Name'], ['p', 'Phone'], ['x', 'X'], ['q', 'Q']]);
  assert.equal(csv, '﻿Name,Phone,X,Q\r\n"Menon, Rahul",+919847012345,"\'=HYPERLINK(""evil"")","say ""hi"""\r\n');
});

function fakeD1() {
  const rows = new Map();
  const stmt = (sql, args = []) => ({
    sql, args, bind: (...a) => stmt(sql, a),
    async all() { return { results: [...rows.entries()].filter(([k]) => k.startsWith(args[0] + '#')).sort((x, y) => Number(x[0].split('#')[1]) - Number(y[0].split('#')[1])).map(([, data]) => ({ data: data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) })) }; },
  });
  return {
    rows, prepare: (sql) => stmt(sql),
    async batch(list) {
      for (const s of list) {
        if (s.sql.startsWith('DELETE')) for (const k of [...rows.keys()]) if (k.startsWith(s.args[0] + '#')) rows.delete(k);
        if (s.sql.startsWith('INSERT')) { assert.ok(s.args[2].byteLength <= 2000000, 'D1 row limit'); rows.set(`${s.args[0]}#${s.args[1]}`, new Uint8Array(s.args[2])); }
      }
    },
  };
}

test('recordings are stored inside SalePunch in pieces and read back intact', async () => {
  const DB = fakeD1();
  const audio = new Uint8Array(CHUNK * 2 + 12345).map((_, i) => (i * 7) % 256);
  const key = await saveRecording({ DB }, { id: 'c1', day: '2026-11-21' }, audio, 'audio/mp4; codecs=aac', 'call.m4a');
  assert.equal(key, 'db:audio/mp4');
  assert.equal(DB.rows.size, 3);
  const back = await loadRecording({ DB }, { id: 'c1', recording_key: key });
  assert.equal(back.type, 'audio/mp4');
  assert.deepEqual(back.bytes, audio);
  await saveRecording({ DB }, { id: 'c1', day: 'x' }, new Uint8Array(10), 'audio/mpeg'); // re-save replaces
  assert.equal(DB.rows.size, 1);
});

test('audio supports jumping (HTTP range requests)', async () => {
  const bytes = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const full = audioResponse(bytes, 'audio/mpeg', null);
  assert.equal(full.status, 200); assert.equal(full.headers.get('accept-ranges'), 'bytes');
  const part = audioResponse(bytes, 'audio/mpeg', 'bytes=2-4');
  assert.equal(part.status, 206); assert.equal(part.headers.get('content-range'), 'bytes 2-4/10');
  assert.deepEqual(new Uint8Array(await part.arrayBuffer()), new Uint8Array([2, 3, 4]));
  assert.deepEqual(new Uint8Array(await audioResponse(bytes, 'a', 'bytes=7-').arrayBuffer()), new Uint8Array([7, 8, 9]));
  assert.deepEqual(new Uint8Array(await audioResponse(bytes, 'a', 'bytes=-2').arrayBuffer()), new Uint8Array([8, 9]));
  assert.equal(audioResponse(bytes, 'a', 'bytes=20-').status, 416);
  assert.equal(extFor('audio/amr', ''), 'amr'); assert.equal(extFor('audio/mpeg', 'x.MP3'), 'mp3');
});
