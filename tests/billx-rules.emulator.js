// BillX Firestore security rules. Needs the Firebase Emulator:
//   npm run test:billx-rules
import { test, before, after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import {
  doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, collection, query, where, serverTimestamp, Timestamp, arrayUnion,
} from 'firebase/firestore';

let env;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-billx',
    firestore: { rules: readFileSync('billx/firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  });
});
after(() => env.cleanup());
beforeEach(() => env.clearFirestore());

const owner = () => env.authenticatedContext('owner', { email: 'owner@shop.in', email_verified: true }).firestore();
const staff = (verified = true) => env.authenticatedContext('staff', { email: 'staff@shop.in', email_verified: verified }).firestore();
const stranger = () => env.authenticatedContext('eve', { email: 'eve@x.in', email_verified: true }).firestore();
const admin = () => env.authenticatedContext('boss', { email: 'boss@billx.in', email_verified: true }).firestore();
const guest = () => env.unauthenticatedContext().firestore();

const newAccount = (extra = {}) => ({
  ownerUid: 'owner', ownerEmail: 'owner@shop.in', ownerName: 'Owner', createdAt: serverTimestamp(), status: 'trial',
  plan: null, period: null, paidUntil: null, subscriptionId: null, memberEmails: [], maxUsers: 3, maxBusinesses: 3, ...extra,
});
const DAY = 86400000;
const ts = (offsetDays) => Timestamp.fromMillis(Date.now() + offsetDays * DAY);

/** Put an account straight into the database (as the server would). */
async function seedAccount(data) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'accounts', 'owner'), {
      ownerUid: 'owner', ownerEmail: 'owner@shop.in', ownerName: 'Owner', status: 'trial', plan: null, period: null,
      paidUntil: null, subscriptionId: null, memberEmails: ['staff@shop.in'], maxUsers: 3, maxBusinesses: 3, createdAt: ts(-1), ...data,
    });
    await setDoc(doc(ctx.firestore(), 'admins', 'boss'), { note: 'BillX owner' });
  });
}
const invoice = { id: 'd1', type: 'invoice', number: 'INV-0001', items: [] };
const writeDoc = (db) => setDoc(doc(db, 'accounts', 'owner', 'workspaces', 'main', 'docs', 'd1'), invoice);

test('sign-up creates only a standard 7-day trial account', async () => {
  await assertFails(setDoc(doc(owner(), 'accounts', 'owner'), newAccount({ status: 'active' })));
  await assertFails(setDoc(doc(owner(), 'accounts', 'owner'), newAccount({ paidUntil: ts(365) })));
  await assertFails(setDoc(doc(owner(), 'accounts', 'owner'), newAccount({ maxUsers: 99 })));
  await assertFails(setDoc(doc(owner(), 'accounts', 'owner'), newAccount({ createdAt: ts(30) })));
  await assertFails(setDoc(doc(stranger(), 'accounts', 'owner'), newAccount()));
  await assertSucceeds(setDoc(doc(owner(), 'accounts', 'owner'), newAccount()));
  await assertSucceeds(setDoc(doc(owner(), 'users', 'owner'), { accountId: 'owner', email: 'owner@shop.in', role: 'owner', createdAt: serverTimestamp() }));
});

test('members read and write during trial; strangers and guests never', async () => {
  await seedAccount({ createdAt: ts(-6) });
  await assertSucceeds(writeDoc(owner()));
  await assertSucceeds(writeDoc(staff()));
  await assertSucceeds(getDoc(doc(staff(), 'accounts', 'owner', 'workspaces', 'main', 'docs', 'd1')));
  await assertFails(writeDoc(staff(false)), 'unverified email is not staff');
  await assertFails(writeDoc(stranger()));
  await assertFails(getDoc(doc(stranger(), 'accounts', 'owner', 'workspaces', 'main', 'docs', 'd1')));
  await assertFails(getDoc(doc(guest(), 'accounts', 'owner')));
  await assertFails(setDoc(doc(owner(), 'accounts', 'owner', 'workspaces', 'main', 'secrets', 'x'), { id: 'x' }));
});

test('after the trial: read-only until paid', async () => {
  await seedAccount({ createdAt: ts(-8) });
  await assertFails(writeDoc(owner()));
  await assertSucceeds(getDoc(doc(owner(), 'accounts', 'owner')));
  await assertSucceeds(getDocs(collection(owner(), 'accounts', 'owner', 'workspaces', 'main', 'docs')));
});

test('paid plan writes until paidUntil + 3 days grace', async () => {
  await seedAccount({ createdAt: ts(-60), status: 'active', plan: 'pro', paidUntil: ts(10) });
  await assertSucceeds(writeDoc(owner()));
  await seedAccount({ createdAt: ts(-60), status: 'past_due', plan: 'pro', paidUntil: ts(-2) });
  await assertSucceeds(writeDoc(owner()), 'inside grace');
  await seedAccount({ createdAt: ts(-60), status: 'cancelled', plan: 'pro', paidUntil: ts(-4) });
  await assertFails(writeDoc(owner()), 'after grace');
});

test('owner cannot give themselves a plan; only admin can', async () => {
  await seedAccount({});
  await assertFails(updateDoc(doc(owner(), 'accounts', 'owner'), { status: 'active', paidUntil: ts(365) }));
  await assertFails(updateDoc(doc(owner(), 'accounts', 'owner'), { maxUsers: 50 }));
  await assertFails(updateDoc(doc(staff(), 'accounts', 'owner'), { status: 'active' }));
  await assertSucceeds(updateDoc(doc(admin(), 'accounts', 'owner'), { status: 'active', plan: 'pro', period: 'monthly', paidUntil: ts(30), maxUsers: 25, maxBusinesses: 10, manual: true }));
  await assertFails(updateDoc(doc(admin(), 'accounts', 'owner'), { ownerUid: 'boss' }));
  await assertSucceeds(getDocs(collection(admin(), 'accounts')));
  await assertFails(getDocs(collection(owner(), 'accounts')));
});

test('team: owner adds staff within the plan limit; staff cannot', async () => {
  await seedAccount({ memberEmails: [] });
  await assertSucceeds(updateDoc(doc(owner(), 'accounts', 'owner'), { memberEmails: arrayUnion('a@x.in') }));
  await assertSucceeds(updateDoc(doc(owner(), 'accounts', 'owner'), { memberEmails: arrayUnion('b@x.in') }));
  await assertFails(updateDoc(doc(owner(), 'accounts', 'owner'), { memberEmails: arrayUnion('c@x.in') }), 'owner + 3 staff > 3 users');
  await seedAccount({});
  await assertFails(updateDoc(doc(staff(), 'accounts', 'owner'), { memberEmails: arrayUnion('friend@x.in') }));
});

test('staff find and join the account that added them', async () => {
  await seedAccount({});
  const q = query(collection(staff(), 'accounts'), where('memberEmails', 'array-contains', 'staff@shop.in'));
  await assertSucceeds(getDocs(q));
  await assertFails(getDocs(query(collection(staff(false), 'accounts'), where('memberEmails', 'array-contains', 'staff@shop.in'))));
  await assertSucceeds(setDoc(doc(staff(), 'users', 'staff'), { accountId: 'owner', email: 'staff@shop.in', role: 'staff', createdAt: serverTimestamp() }));
  await assertFails(setDoc(doc(stranger(), 'users', 'eve'), { accountId: 'owner', email: 'eve@x.in', role: 'staff', createdAt: serverTimestamp() }));
  await assertFails(setDoc(doc(stranger(), 'users', 'eve'), { accountId: 'owner', email: 'eve@x.in', role: 'owner', createdAt: serverTimestamp() }));
});

test('only the owner deletes a business', async () => {
  await seedAccount({});
  await setDoc(doc(owner(), 'accounts', 'owner', 'workspaces', 'w2'), { settings: {}, name: 'B2', industry: 'retail', updatedAt: serverTimestamp() });
  await assertFails(deleteDoc(doc(staff(), 'accounts', 'owner', 'workspaces', 'w2')));
  await assertSucceeds(deleteDoc(doc(owner(), 'accounts', 'owner', 'workspaces', 'w2')));
});

test('UPI / bank payments: owner submits, only admin approves', async () => {
  await seedAccount({ memberEmails: [] });
  const req = { uid: 'owner', accountId: 'owner', email: 'owner@shop.in', plan: 'pro', period: 'monthly', amount: 3999, utr: '412345678901', method: 'UPI', status: 'pending', createdAt: serverTimestamp() };
  await assertSucceeds(setDoc(doc(owner(), 'paymentRequests', 'p1'), req));
  await assertFails(setDoc(doc(owner(), 'paymentRequests', 'p2'), { ...req, status: 'approved' }), 'cannot self-approve');
  await assertFails(setDoc(doc(owner(), 'paymentRequests', 'p3'), { ...req, utr: '12' }), 'reference too short');
  await assertFails(setDoc(doc(stranger(), 'paymentRequests', 'p4'), { ...req, uid: 'eve', accountId: 'owner' }), 'not their account');
  await assertSucceeds(getDocs(query(collection(owner(), 'paymentRequests'), where('uid', '==', 'owner'))));
  await assertFails(getDoc(doc(stranger(), 'paymentRequests', 'p1')));
  await assertFails(updateDoc(doc(owner(), 'paymentRequests', 'p1'), { status: 'approved' }));
  await assertSucceeds(updateDoc(doc(admin(), 'paymentRequests', 'p1'), { status: 'approved', reviewedAt: serverTimestamp() }));
  await assertSucceeds(getDocs(collection(admin(), 'paymentRequests')));
});

test('private payment details: verified signed-in users read, only admin writes', async () => {
  await seedAccount({});
  const details = { payee: 'Test Co', gpay: '9000000001', accountNo: '00001112223', ifsc: 'TEST0000001', updatedAt: serverTimestamp() };
  await assertFails(setDoc(doc(owner(), 'private', 'payment'), details));
  await assertSucceeds(setDoc(doc(admin(), 'private', 'payment'), details));
  await assertSucceeds(getDoc(doc(owner(), 'private', 'payment')));
  await assertFails(getDoc(doc(staff(false), 'private', 'payment')), 'unverified');
  await assertFails(getDoc(doc(guest(), 'private', 'payment')), 'not signed in');
  await assertFails(getDocs(collection(owner(), 'private')), 'cannot list');
});

test('public UPI details: anyone reads, only admin writes, no bank fields', async () => {
  await seedAccount({});
  await assertFails(setDoc(doc(owner(), 'public', 'pay'), { payee: 'Fake', upiId: 'fake@upi' }));
  await assertFails(setDoc(doc(admin(), 'public', 'pay'), { payee: 'Test Co', upiId: 'test@upi', accountNo: '00001112223' }), 'bank fields refused');
  await assertSucceeds(setDoc(doc(admin(), 'public', 'pay'), { payee: 'Test Co', upiId: 'test@upi', updatedAt: serverTimestamp() }));
  await assertSucceeds(getDoc(doc(guest(), 'public', 'pay')));
  await assertFails(getDocs(collection(guest(), 'public')), 'cannot list');
});

test('referral: new account may carry a referral code; only admin marks it rewarded', async () => {
  await assertSucceeds(setDoc(doc(owner(), 'accounts', 'owner'), newAccount({ referredBy: 'abcdef1234' })));
  await env.clearFirestore();
  await assertFails(setDoc(doc(owner(), 'accounts', 'owner'), newAccount({ referredBy: 'bad code!' })));
  await assertFails(setDoc(doc(owner(), 'accounts', 'owner'), newAccount({ referredBy: 42 })));
  await seedAccount({ referredBy: 'abcdef1234' });
  await assertFails(updateDoc(doc(owner(), 'accounts', 'owner'), { referralRewarded: true }));
  await assertSucceeds(updateDoc(doc(admin(), 'accounts', 'owner'), { referralRewarded: true, paidUntil: ts(30) }));
});
