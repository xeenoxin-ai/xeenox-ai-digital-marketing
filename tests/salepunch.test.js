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
