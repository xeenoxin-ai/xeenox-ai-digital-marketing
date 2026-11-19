import { test } from 'node:test';
import assert from 'node:assert/strict';
import { captureRef, storedRef, refCode, refLink, inviteText } from '../billx/src/referral.js';

const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v) }; };

test('referral links are remembered for 60 days', () => {
  const st = mem();
  assert.equal(captureRef('https://x.dev/?ref=AbCd123456&utm=wa', st), 'AbCd123456');
  assert.equal(storedRef(st), 'AbCd123456');
  assert.equal(storedRef(st, Date.now() + 61 * 86400000), '', 'expired');
  assert.equal(captureRef('https://x.dev/?ref=bad!', mem()), '');
  assert.equal(storedRef(mem()), '');
});

test('invite link and message', () => {
  assert.equal(refCode('jepx9UT1eaYeS8yKRlpgnnquIfV2'), 'jepx9UT1ea');
  assert.match(refLink('jepx9UT1eaYeS8yKRlpgnnquIfV2'), /\/\?ref=jepx9UT1ea$/);
  assert.match(inviteText('jepx9UT1eaYeS8yKRlpgnnquIfV2', 'Surya Sweets'), /Surya Sweets[\s\S]*1 month free[\s\S]*ref=jepx9UT1ea/);
});
