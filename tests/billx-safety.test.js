import { test } from 'node:test';
import assert from 'node:assert/strict';
import { backupDue, backupName } from '../billx/src/safety.js';

const now = Date.parse('2026-11-17T10:00:00Z');
const daysAgo = (d) => new Date(now - d * 86400000).toISOString();

test('backup reminder rules', () => {
  assert.equal(backupDue({ docCount: 0, now }), false, 'nothing to back up');
  assert.equal(backupDue({ docCount: 2, now }), false, 'too early to nag a new user');
  assert.equal(backupDue({ docCount: 3, now }), true, 'never backed up');
  assert.equal(backupDue({ docCount: 50, lastBackup: daysAgo(3), now }), false);
  assert.equal(backupDue({ docCount: 50, lastBackup: daysAgo(8), now }), true);
  assert.equal(backupDue({ docCount: 50, lastBackup: daysAgo(8), snoozeUntil: daysAgo(-0.5), now }), false, 'snoozed');
  assert.equal(backupDue({ docCount: 50, lastBackup: daysAgo(8), snoozeUntil: daysAgo(1), now }), true, 'snooze over');
});

test('backup file name', () => {
  assert.match(backupName('Annapoorna Hotel & Café'), /^billx-backup-annapoorna-hotel-caf-\d{4}-\d{2}-\d{2}\.json$/);
  assert.match(backupName(''), /^billx-backup-business-/);
});
