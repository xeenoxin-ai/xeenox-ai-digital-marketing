import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  prepareNav, locateOnRoute, progress, dueAnnouncement, announcementText, isOffRoute,
  osrmInstruction, valhallaKind, spokenDistance,
} from '../src/navigation.js';

// An L-shaped route: ~1.1 km east, then ~1.1 km north, with a left turn at the corner.
const line = [
  [10.0, 76.0], [10.0, 76.005], [10.0, 76.01],
  [10.005, 76.01], [10.01, 76.01],
];
const route = {
  line,
  duration: 300,
  maneuvers: [
    { index: 0, kind: 'depart', text: 'Drive east.' },
    { index: 2, kind: 'left', text: 'Turn left onto Market Road.', verbal: 'Turn left onto Market Road.' },
    { index: 4, kind: 'arrive', text: 'You have arrived.' },
  ],
};

test('prepareNav measures the route and places maneuvers on it', () => {
  const nav = prepareNav(route);
  assert.ok(Math.abs(nav.total - 2201) < 15, `total ${nav.total}`);
  assert.ok(Math.abs(nav.maneuvers[1].along - 1096) < 10, `turn at ${nav.maneuvers[1].along}`);
});

test('locateOnRoute snaps a GPS fix and reports distance off the line', () => {
  const nav = prepareNav(route);
  const loc = locateOnRoute(nav, [10.0002, 76.0075], 0); // ~22 m north of the first leg
  assert.equal(loc.segment, 2);
  assert.ok(Math.abs(loc.along - 822) < 10, `along ${loc.along}`);
  assert.ok(loc.offRoute > 15 && loc.offRoute < 30, `off ${loc.offRoute}`);
  assert.ok(Math.abs(loc.bearing - 90) < 1, 'heading east');
});

test('progress gives the next turn, the distance to it and time left', () => {
  const nav = prepareNav(route);
  const p = progress(nav, 822);
  assert.equal(p.next.kind, 'left');
  assert.ok(Math.abs(p.toNext - 274) < 10, `toNext ${p.toNext}`);
  assert.ok(Math.abs(p.remainingTime - 188) < 5, `time ${p.remainingTime}`);
  const after = progress(nav, 1500);
  assert.equal(after.next.kind, 'arrive');
});

test('voice: one far and one near announcement per turn', () => {
  const next = { id: 1, text: 'Turn left onto Market Road.' };
  const spoken = new Set();
  assert.equal(dueAnnouncement(next, 900, spoken), null);
  assert.equal(dueAnnouncement(next, 500, spoken), 'far');
  spoken.add('1:far');
  assert.equal(dueAnnouncement(next, 400, spoken), null);
  assert.equal(dueAnnouncement(next, 100, spoken), 'near');
  spoken.add('1:near');
  assert.equal(dueAnnouncement(next, 50, spoken), null);
  assert.equal(announcementText(next, 480, 'far'), 'In 500 metres, turn left onto Market Road.');
  assert.equal(spokenDistance(1250), '1.3 kilometres');
  // The destination gets the early warning only; arrival is spoken separately.
  assert.equal(dueAnnouncement({ id: 9, kind: 'arrive', text: 'Arrived.' }, 80, new Set()), null);
});

test('off route only beyond the GPS error allowance', () => {
  assert.equal(isOffRoute(30, 10), false);
  assert.equal(isOffRoute(55, 10), true);
  assert.equal(isOffRoute(55, 50), false); // poor accuracy widens the allowance
});

test('OSRM steps become spoken instructions', () => {
  const step = (type, modifier, name, exit) => ({ name, maneuver: { type, modifier, exit } });
  assert.deepEqual(osrmInstruction(step('turn', 'left', 'MG Road')), { kind: 'left', text: 'Turn left onto MG Road.' });
  assert.equal(osrmInstruction(step('roundabout', 'right', 'NH544', 2)).text, 'At the roundabout, take the second exit onto NH544.');
  assert.equal(osrmInstruction(step('fork', 'slight right', '')).text, 'Keep right at the fork.');
  assert.equal(osrmInstruction(step('arrive', null, '')).kind, 'arrive');
  assert.equal(valhallaKind(15), 'left');
  assert.equal(valhallaKind(26), 'roundabout');
});

test('OSRM maneuver locations are placed on the line in order', () => {
  const nav = prepareNav({
    line,
    duration: 300,
    maneuvers: [
      { location: [10.0, 76.0], kind: 'depart', text: 'Head off.' },
      { location: [10.00001, 76.01], kind: 'left', text: 'Turn left.' },
      { location: [10.01, 76.01], kind: 'arrive', text: 'Arrived.' },
    ],
  });
  assert.deepEqual(nav.maneuvers.map((m) => m.index), [0, 2, 4]);
});
