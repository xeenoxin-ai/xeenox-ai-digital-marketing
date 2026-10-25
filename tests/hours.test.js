import { test } from 'node:test';
import assert from 'node:assert/strict';

import { parseHours, openStatus } from '../src/hours.js';

// 26 Oct 2026 is a Monday.
const at = (day, h, m = 0) => new Date(2026, 9, 26 + day, h, m);

test('open now with closing time', () => {
  assert.deepEqual(openStatus('Mo-Sa 09:00-21:00', at(0, 10)), { open: true, text: 'Open now · closes 9 PM' });
  assert.deepEqual(openStatus('Mo-Sa 09:00-21:00', at(0, 22)), { open: false, text: 'Closed · opens tomorrow 9 AM' });
  assert.deepEqual(openStatus('Mo-Sa 09:00-21:00', at(0, 7, 30)), { open: false, text: 'Closed · opens 9 AM' });
});

test('day off, split shifts and per-day rules', () => {
  const h = 'Mo-Sa 10:00-13:30,16:00-20:00; Su off';
  assert.equal(openStatus(h, at(0, 14)).text, 'Closed · opens 4 PM');
  assert.equal(openStatus(h, at(0, 13)).text, 'Open now · closes 1:30 PM');
  assert.equal(openStatus(h, at(6, 11)).open, false); // Sunday
  assert.equal(openStatus('Mo-Fr 09:00-17:00; Sa 10:00-14:00', at(5, 11)).text, 'Open now · closes 2 PM');
});

test('24/7, past midnight and simple times', () => {
  assert.equal(openStatus('24/7', at(2, 3)).text, 'Open 24 hours');
  assert.equal(openStatus('18:00-02:00', at(1, 1)).text, 'Open now · closes 2 AM');
  assert.equal(openStatus('07:00-21:00', at(3, 20)).open, true);
});

test('unreadable formats return unknown instead of guessing', () => {
  assert.equal(parseHours('sunrise-sunset'), null);
  assert.deepEqual(openStatus('PH off; Mo-Fr 09:00-17:00', at(0, 10)), { open: null, text: '' });
  assert.deepEqual(openStatus('', at(0, 10)), { open: null, text: '' });
});
