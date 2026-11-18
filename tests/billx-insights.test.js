import { test } from 'node:test';
import assert from 'node:assert/strict';
import { daySummary, growth } from '../billx/src/insights.js';

const bill = (date, payable, { status = 'sent', items = [], payments = [], client = null, balance = 0 } = {}) => ({
  d: { type: 'invoice', status, date, items, payments, client }, t: { payable, total: payable, balance },
});

test('day summary: bills, cash / UPI / card split, top items', () => {
  const rows = [
    bill('2026-11-18', 504, { items: [{ name: 'Sweets assorted', qty: 1, rate: 480 }], payments: [{ date: '2026-11-18', amount: 504, method: 'UPI' }] }),
    bill('2026-11-18', 650, { items: [{ name: 'Black forest cake 1 kg', qty: 1, rate: 650 }], payments: [{ date: '2026-11-18', amount: 650, method: 'Cash' }] }),
    bill('2026-11-18', 960, { items: [{ name: 'Sweets assorted', qty: 2, rate: 480 }], payments: [{ date: '2026-11-18', amount: 500, method: 'Card' }], balance: 460 }),
    bill('2026-11-18', 99, { status: 'cancelled' }),
    bill('2026-11-17', 300, { payments: [{ date: '2026-11-18', amount: 300, method: 'GPay' }] }),
  ];
  const s = daySummary(rows, '2026-11-18');
  assert.equal(s.bills, 3);
  assert.equal(s.billed, 2114);
  assert.equal(s.collected, 1954);
  assert.deepEqual(s.byMethod, { Cash: 650, UPI: 804, Card: 500, Other: 0 });
  assert.equal(s.unpaid, 460);
  assert.equal(s.avg, 704.67);
  assert.deepEqual(s.topItems.map((x) => [x.name, x.qty]), [['Sweets assorted', 3], ['Black forest cake 1 kg', 1]]);
});

test('growth: vs same days last month, best day, streak, milestone, goal', () => {
  const rows = [
    bill('2026-10-05', 1000), bill('2026-10-17', 1000), bill('2026-10-25', 5000),
    bill('2026-11-02', 1500, { client: { name: 'Ravi' } }), bill('2026-11-16', 700, { client: { name: 'Anu' } }),
    bill('2026-11-17', 400, { client: { name: 'Ravi' } }), bill('2026-11-18', 400), bill('2026-11-18', 100, { status: 'draft' }),
  ];
  const g = growth(rows, '2026-11-18', 10000);
  assert.equal(g.thisMonth, 3000);
  assert.equal(g.lastSame, 2000);
  assert.equal(g.pct, 50);
  assert.deepEqual(g.bestDay, { date: '2026-11-02', total: 1500 });
  assert.equal(g.streak, 3);
  assert.deepEqual(g.topCustomers.map((c) => [c.name, c.amount, c.bills]), [['Ravi', 1900, 2], ['Anu', 700, 1]]);
  assert.equal(g.totalBills, 7);
  assert.equal(g.milestone.next, 10);
  assert.equal(g.projected, 5000);
  assert.equal(g.goal.progress, 0.3);
  assert.equal(g.goal.onTrack, false);
  assert.equal(growth([], '2026-11-18').pct, null, 'no comparison without last month');
});
