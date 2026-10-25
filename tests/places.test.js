import { test } from 'node:test';
import assert from 'node:assert/strict';

import { CATEGORIES, nearbyQuery, toPlace, prettyKind } from '../src/places.js';
import { ruleEngine } from '../src/ai.js';

test('assistant: "near me" requests scan nearby places', () => {
  const cases = {
    'find hospital near me': 'hospital',
    'I need a hospital': 'hospital',
    'accident, need hospital': 'hospital',
    'take me to a hospital': 'hospital',
    'medical shop near me': 'pharmacy',
    'where is the police station': 'police',
    'nearest ATM': 'atm',
    'I am hungry': 'food',
    'need a room to stay': 'stay',
    'is there a temple nearby?': 'worship',
  };
  for (const [q, category] of Object.entries(cases)) {
    const r = ruleEngine(q);
    assert.equal(r.intent, 'nearby', q);
    assert.equal(r.params.category, category, q);
    assert.ok(CATEGORIES[category], `category ${category} exists`);
  }
  assert.match(ruleEngine('hospital near me').reply, /108/);
});

test('assistant: named places route or search instead of scanning', () => {
  assert.equal(ruleEngine('route to KIMS hospital').intent, 'route');
  const s = ruleEngine('find Lulu mall near me');
  assert.equal(s.intent, 'search');
  assert.equal(s.params.query, 'lulu mall');
  // Breakdown phrases still go to breakdown help.
  assert.equal(ruleEngine('my bike tyre is punctured').intent, 'breakdown');
  assert.equal(ruleEngine('go to a petrol pump').params.need, 'fuel');
});

test('nearbyQuery asks Overpass for every tag around the point', () => {
  const q = nearbyQuery(['amenity=hospital', 'amenity=clinic'], [10.78, 76.65], 2000);
  assert.match(q, /nw\["amenity"="hospital"\]\(around:2000,10\.78000,76\.65000\);/);
  assert.match(q, /nw\["amenity"="clinic"\]/);
});

test('toPlace reads name, phone, hours and distance', () => {
  const p = toPlace(
    { type: 'way', id: 7, center: { lat: 10.79, lon: 76.65 }, tags: { amenity: 'hospital', name: 'District Hospital', 'contact:phone': '+91 491 2533327', emergency: 'yes' } },
    [10.78, 76.65],
    'Hospital',
  );
  assert.equal(p.name, 'District Hospital');
  assert.equal(p.phone, '+91 491 2533327');
  assert.equal(p.emergency, true);
  assert.ok(Math.abs(p.distance - 1112) < 5);
  assert.equal(toPlace({ type: 'node', id: 1, lat: 10.78, lon: 76.65, tags: {} }, [10.78, 76.65], 'Clinic').name, 'Clinic');
});

test('prettyKind turns OSM values into labels', () => {
  assert.equal(prettyKind('fast_food'), 'Fast food');
  assert.equal(prettyKind('yes'), '');
});
