import { test } from 'node:test';
import assert from 'node:assert/strict';
import { goCanonical, SITE } from '../billx/src/site.js';

test('preview links move to the main address (Google sign-in only works there)', () => {
  const host = new URL(SITE.url).hostname;
  let to = '';
  const loc = (hostname) => ({ hostname, pathname: '/app/', search: '?guest=1', hash: '#/pos', replace: (u) => { to = u; } });
  assert.equal(goCanonical(loc(`8f3a2b1c.${host}`)), true);
  assert.equal(to, `${new URL(SITE.url).origin}/app/?guest=1#/pos`);
  to = '';
  assert.equal(goCanonical(loc(host)), false);
  assert.equal(goCanonical(loc('localhost')), false);
  assert.equal(to, '');
});
