import { test } from 'node:test';
import assert from 'node:assert/strict';

import { haversine, distanceToPolyline, perpendicularOffset } from '../src/geo.js';
import { timeFactor, buildHotspots, scoreRoute } from '../src/traffic.js';
import { ruleEngine, routeTip } from '../src/ai.js';

test('haversine: Palakkad to Coimbatore is about 42 km in a straight line', () => {
  const d = haversine([10.7867, 76.6548], [11.0168, 76.9558]);
  assert.ok(d > 40000 && d < 45000, `got ${d}`);
});

test('distanceToPolyline measures to the nearest segment', () => {
  const line = [[10, 76], [10, 76.01]];
  const d = distanceToPolyline([10.001, 76.005], line);
  assert.ok(Math.abs(d - 111) < 3, `got ${d}`);
});

test('perpendicularOffset moves away from the line', () => {
  const a = [10, 76], b = [10, 76.1];
  const p = perpendicularOffset(a, b, 0.2);
  assert.ok(p[0] > 10, 'left of an eastward line is north');
  assert.ok(Math.abs(p[1] - 76.05) < 1e-9);
});

test('timeFactor: signals heavier at 9am than 2am, schools quiet on Sunday', () => {
  const mon9 = new Date(2026, 9, 26, 9, 0);
  const mon2 = new Date(2026, 9, 26, 2, 0);
  const sun9 = new Date(2026, 9, 25, 9, 0);
  assert.equal(timeFactor('traffic_signals', mon9), 1);
  assert.ok(timeFactor('traffic_signals', mon2) < 0.5);
  assert.ok(timeFactor('school', sun9) < 0.5);
});

test('buildHotspots clusters nearby features and grades them', () => {
  const date = new Date(2026, 9, 26, 9, 0);
  const features = [
    { lat: 10.7867, lon: 76.6548, type: 'level_crossing' },
    { lat: 10.7868, lon: 76.6549, type: 'traffic_signals' },
    { lat: 10.7869, lon: 76.6550, type: 'report' },
    { lat: 10.9, lon: 76.9, type: 'traffic_signals' }, // lone signal below threshold
  ];
  const spots = buildHotspots(features, { date });
  assert.equal(spots.length, 1);
  assert.equal(spots[0].level, 'high');
});

test('scoreRoute only counts hotspots near the line', () => {
  const line = [[10.78, 76.65], [10.79, 76.65]];
  const near = { lat: 10.785, lon: 76.6505, score: 4 };
  const far = { lat: 10.785, lon: 76.70, score: 10 };
  const s = scoreRoute(line, [near, far]);
  assert.equal(s.hotspots.length, 1);
  assert.equal(s.delay, 100);
});

test('ruleEngine understands routes, tolls and breakdowns', () => {
  const r = ruleEngine('route to Coimbatore avoiding tolls');
  assert.equal(r.intent, 'route');
  assert.equal(r.params.destination, 'coimbatore');
  assert.equal(r.params.avoidTolls, true);

  const b = ruleEngine('my bike tyre is punctured');
  assert.equal(b.intent, 'breakdown');
  assert.equal(b.params.need, 'puncture');
  assert.equal(b.params.vehicle, 'bike');

  assert.equal(ruleEngine('go to a petrol pump').params.need, 'fuel');
  assert.equal(ruleEngine('car not starting').params.need, 'battery');
  assert.equal(ruleEngine('avoid tolls').intent, 'avoid_tolls');
  assert.equal(ruleEngine('show traffic').intent, 'hotspots');
  assert.equal(ruleEngine('report jam here').intent, 'report_jam');
  assert.equal(ruleEngine('hello').intent, 'help');
});

test('routeTip recommends the local road when it beats the main road', () => {
  const main = { label: 'Main road', duration: 1200, total: 1800, hotspots: [{}, {}] };
  const local = { label: 'Local road', duration: 1300, total: 1350, hotspots: [] };
  const tip = routeTip([local, main], new Date(2026, 9, 26, 13, 0));
  assert.match(tip, /local road/);
  assert.match(tip, /8 min/);
});
