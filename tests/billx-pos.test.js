// Quick Bill: fast entry, order lines, kitchen tickets, bulk item import.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchItems, parseQuickEntry, addLine, setQty, categoriesOf, gridItems, kotHTML, parseItemList } from '../billx/src/pos-logic.js';
import { computeTotals } from '../billx/src/calc.js';

const menu = [
  { id: 'a', code: '1', name: 'Masala Dosa', rate: 90, tax: 5, category: 'Breakfast', sold: 40 },
  { id: 'b', code: '2', name: 'Plain Dosa', rate: 70, tax: 5, category: 'Breakfast', sold: 10 },
  { id: 'c', code: '12', name: 'Chicken Biryani', rate: 220, tax: 5, category: 'Biryani', sold: 80 },
  { id: 'd', code: '13', name: 'Veg Biryani', rate: 160, tax: 5, category: 'Biryani' },
  { id: 'e', code: '30', name: 'Filter Coffee', rate: 35, tax: 5, category: 'Beverages', sold: 120 },
];

test('search: code first, then name start, word start, anywhere', () => {
  assert.equal(matchItems('12', menu)[0].id, 'c');
  assert.equal(matchItems('masala', menu)[0].id, 'a');
  assert.deepEqual(matchItems('dosa', menu).map((i) => i.id), ['a', 'b'], 'popular first on a tie');
  assert.equal(matchItems('biry', menu)[0].id, 'c');
  assert.equal(matchItems('coffee', menu)[0].id, 'e');
  assert.equal(matchItems('zzz', menu).length, 0);
});

test('quick entry: code, qty*code, name*qty', () => {
  assert.deepEqual(parseQuickEntry('12', menu), { item: menu[2], qty: 1 });
  assert.deepEqual(parseQuickEntry('3*12', menu), { item: menu[2], qty: 3 });
  assert.deepEqual(parseQuickEntry('2x coffee', menu), { item: menu[4], qty: 2 });
  assert.deepEqual(parseQuickEntry('dosa x 4', menu), { item: menu[0], qty: 4 });
  assert.equal(parseQuickEntry('', menu), null);
  assert.equal(parseQuickEntry('nothing', menu), null);
});

test('order lines merge, change and remove; totals with GST', () => {
  let lines = addLine([], menu[0]);
  lines = addLine(lines, menu[0], 2);
  lines = addLine(lines, menu[4]);
  assert.equal(lines.length, 2);
  assert.equal(lines[0].qty, 3);
  lines = setQty(lines, 1, 0);
  assert.equal(lines.length, 1);
  const t = computeTotals({ items: lines }, { roundOff: true, sellerState: '32' });
  assert.equal(t.total, Math.round(270 * 1.05));
});

test('grid tabs and kitchen ticket', () => {
  assert.deepEqual(categoriesOf(menu), ['Breakfast', 'Biryani', 'Beverages']);
  assert.equal(gridItems(menu, 'popular')[0].id, 'e');
  assert.deepEqual(gridItems(menu, 'Biryani').map((i) => i.id), ['c', 'd']);
  const kot = kotHTML({ number: 'INV-0009', table: '4', lines: addLine([], menu[2], 2), note: 'less spicy' });
  assert.ok(kot.includes('Table 4') && kot.includes('Chicken Biryani') && kot.includes('less spicy'));
  assert.ok(!kot.includes('220'), 'kitchen ticket has no prices');
});

test('bulk import: Excel paste, CSV with header in any order, simple lines', () => {
  const excel = 'Masala Dosa\t90\tBreakfast\t5\t1\nGhee Roast\t120\tBreakfast\t5\t3';
  const a = parseItemList(excel);
  assert.equal(a.items.length, 2);
  assert.deepEqual([a.items[1].name, a.items[1].rate, a.items[1].code], ['Ghee Roast', 120, '3']);
  const csv = 'Code,Item Name,Category,Price,GST %\n101,"Chicken 65, dry",Starters,180,5\n102,Paneer Tikka,Starters,"₹ 1,250",5\n,bad row,,,';
  const b = parseItemList(csv);
  assert.equal(b.items.length, 2);
  assert.deepEqual([b.items[0].name, b.items[0].rate, b.items[0].code], ['Chicken 65, dry', 180, '101']);
  assert.equal(b.items[1].rate, 1250);
  assert.equal(b.skipped, 1);
  const plain = parseItemList('Tea - 15\nCoffee 20\nLime juice ₹30', { defaultTax: 5 });
  assert.deepEqual(plain.items.map((i) => [i.name, i.rate, i.tax]), [['Tea', 15, 5], ['Coffee', 20, 5], ['Lime juice', 30, 5]]);
});
