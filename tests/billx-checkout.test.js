import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validUtr } from '../billx/src/views/checkout.js';

test('UPI reference (UTR) validation', () => {
  assert.equal(validUtr('412345678901'), true);
  assert.equal(validUtr('4123 4567 8901'), true, 'spaces are ignored');
  assert.equal(validUtr('T2611171234ABCD'), true, 'Paytm-style alphanumeric');
  assert.equal(validUtr('12345'), false, 'too short');
  assert.equal(validUtr(''), false);
  assert.equal(validUtr('abc@def!'), false);
});
