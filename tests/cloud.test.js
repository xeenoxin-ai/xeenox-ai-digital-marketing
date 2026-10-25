import { test } from 'node:test';
import assert from 'node:assert/strict';
import { geohashForLocation } from 'geofire-common';

import { summariseSpeeds, decodeGeohash, placeKey, slotOf, cloudEnabled } from '../src/cloud.js';

test('cloud stays off until a Firebase config is added', () => {
  assert.equal(cloudEnabled(), false);
});

test('slow roads: average speed per ~150 m cell, at least 2 samples', () => {
  const at = (lat, lon, speed) => ({ geohash: geohashForLocation([lat, lon]), speed });
  const cells = summariseSpeeds([
    at(10.7867, 76.6548, 6), at(10.78672, 76.65482, 10), // crawling, 2 samples
    at(10.80, 76.70, 5), // only one sample: not enough
    at(10.75, 76.60, 40), at(10.75001, 76.60001, 50), // moving fine
  ]);
  assert.equal(cells.length, 1);
  assert.equal(cells[0].speed, 8);
  const c = decodeGeohash(cells[0].geohash);
  assert.ok(Math.abs(c.lat - 10.7867) < 0.002 && Math.abs(c.lon - 76.6548) < 0.002);
});

test('place keys and time slots', () => {
  assert.equal(placeKey({ osmType: 'node', osmId: 5001 }), 'n5001');
  assert.equal(placeKey({ osmType: 'W', osmId: 7 }), 'w7');
  assert.equal(placeKey({ lat: 10.123456, lon: 76.654321 }), 'll10.12346,76.65432');
  assert.equal(slotOf(60 * 60000 * 5 + 1, 60), 5);
});
