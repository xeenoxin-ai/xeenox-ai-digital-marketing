import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseClientList, mergeClients, phoneKey, collectionList, reminderText, nextDate, dueRepeats, daysBetween,
} from '../billx/src/collect.js';

test('bulk customer import: headings in any order, Excel tabs, plain lines', () => {
  const csv = 'Mobile No,Customer Name,GSTIN,City,State\n+91 98470 12345,Ravi Kumar,32abcde1234f1z5,Palakkad,Kerala\n9000000002,Anu,,Thrissur,32\n,,,,';
  const { clients, skipped } = parseClientList(csv);
  assert.equal(clients.length, 2);
  assert.equal(skipped, 1);
  assert.deepEqual([clients[0].name, phoneKey(clients[0].phone), clients[0].gstin, clients[0].state, clients[0].city], ['Ravi Kumar', '9847012345', '32ABCDE1234F1Z5', '32', 'Palakkad']);
  assert.equal(clients[1].state, '32');
  const tab = parseClientList('Name\tPhone\tEmail\nSita\t9876543210\tsita@x.in');
  assert.equal(tab.clients[0].email, 'sita@x.in');
  const plain = parseClientList('Ravi 9847012345\nMeena - 98765 43210\nJust A Name');
  assert.deepEqual(plain.clients.map((c) => [c.name, phoneKey(c.phone)]), [['Ravi', '9847012345'], ['Meena', '9876543210'], ['Just A Name', '']]);
  const noHead = parseClientList('Ravi,9847012345,ravi@x.in,Ravi Stores');
  assert.equal(noHead.clients[0].company, 'Ravi Stores');
});

test('merge: same phone or same name updates instead of duplicating', () => {
  const existing = [{ id: 'a', name: 'Ravi Kumar', phone: '9847012345', email: '' }, { id: 'b', name: 'Anu', phone: '' }];
  const incoming = [
    { name: 'Ravi K', phone: '+91 98470 12345', email: 'ravi@x.in' },
    { name: 'anu', phone: '' },
    { name: 'New One', phone: '9000000003' },
    { name: 'New One again', phone: '9000000003' },
  ];
  const { add, update } = mergeClients(existing, incoming);
  assert.deepEqual(add.map((c) => c.name), ['New One']);
  assert.equal(update.length, 1);
  assert.equal(update[0].id, 'a');
  assert.equal(update[0].email, 'ravi@x.in');
  assert.equal(update[0].name, 'Ravi Kumar', 'existing name kept');
});

test('collection list groups overdue, due today and due soon', () => {
  const inv = (number, dueDate, balance, extra = {}) => ({ d: { type: 'invoice', status: 'sent', number, date: '2026-11-01', dueDate, ...extra }, t: { balance } });
  const rows = [inv('A', '2026-11-10', 500), inv('B', '2026-11-18', 200), inv('C', '2026-11-20', 100), inv('D', '2026-12-30', 50),
    inv('E', '2026-11-01', 0), inv('F', '2026-11-01', 90, { status: 'draft' }), inv('G', '2026-11-15', 70)];
  const c = collectionList(rows, '2026-11-18');
  assert.deepEqual(c.overdue.map((r) => [r.d.number, r.daysLate]), [['A', 8], ['G', 3]]);
  assert.deepEqual(c.today.map((r) => r.d.number), ['B']);
  assert.deepEqual(c.soon.map((r) => [r.d.number, r.daysLeft]), [['C', 2]]);
  assert.equal(c.total, 870);
});

test('reminder message', () => {
  const msg = reminderText({ name: 'Ravi', business: 'Annapoorna Hotel', docTitle: 'Invoice', number: 'INV-0007', amount: '₹1,250.00', due: '2026-11-10', today: '2026-11-18', link: 'https://x/portal#abc' });
  assert.match(msg, /^Hello Ravi,/);
  assert.match(msg, /INV-0007 for ₹1,250\.00 was due on 10 Nov 2026 \(8 days ago\)/);
  assert.match(msg, /https:\/\/x\/portal#abc/);
  assert.match(reminderText({ name: '', business: 'B', docTitle: 'Bill', number: '1', amount: '₹1', due: '2026-11-18', today: '2026-11-18' }), /is due today/);
  assert.equal(daysBetween('2026-11-10', '2026-11-18'), 8);
});

test('repeating bills: next dates and which are due', () => {
  assert.equal(nextDate('2026-01-31', 'month'), '2026-02-28');
  assert.equal(nextDate('2026-11-18', 'week'), '2026-11-25');
  assert.equal(nextDate('2026-11-30', 'quarter'), '2027-02-28');
  assert.equal(nextDate('2028-02-29', 'year'), '2029-02-28');
  const docs = [
    { id: 1, repeat: { active: true, every: 'month', next: '2026-11-18' } },
    { id: 2, repeat: { active: true, every: 'month', next: '2026-11-19' } },
    { id: 3, repeat: { active: false, every: 'month', next: '2026-11-01' } },
    { id: 4, repeat: { active: true, every: 'week', next: '2026-11-11' }, status: 'cancelled' },
    { id: 5, repeat: { active: true, every: 'year', next: '2026-10-01' } },
  ];
  assert.deepEqual(dueRepeats(docs, '2026-11-18').map((d) => d.id), [5, 1]);
});
