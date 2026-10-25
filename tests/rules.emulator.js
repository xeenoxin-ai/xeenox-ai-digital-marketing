// Firestore security rules tests. Needs the Firebase Emulator:
//   npm run test:rules
import { test, before, after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, setDoc, addDoc, collection, getDocs, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

let env;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-easyway',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  });
});
after(() => env.cleanup());
beforeEach(() => env.clearFirestore());

const alice = () => env.authenticatedContext('alice').firestore();
const bob = () => env.authenticatedContext('bob').firestore();
const guest = () => env.unauthenticatedContext().firestore();

const jam = (uid = 'alice') => ({ lat: 10.78, lon: 76.65, geohash: 't9d2s1x0bc', slot: 493000, createdAt: serverTimestamp(), uid });

test('jams: signed-in users report, everyone reads, nobody edits', async () => {
  await assertSucceeds(addDoc(collection(alice(), 'jams'), jam()));
  await assertFails(addDoc(collection(guest(), 'jams'), jam()));
  await assertFails(addDoc(collection(alice(), 'jams'), jam('bob'))); // pretending to be someone else
  await assertFails(addDoc(collection(alice(), 'jams'), { ...jam(), lat: 123 })); // impossible latitude
  await assertFails(addDoc(collection(alice(), 'jams'), { ...jam(), extra: 'x' })); // unexpected field
  await assertFails(addDoc(collection(alice(), 'jams'), { ...jam(), createdAt: new Date(2020, 0, 1) })); // fake time
  await assertSucceeds(getDocs(collection(guest(), 'jams')));
  await setDoc(doc(alice(), 'jams', 'j1'), jam());
  await assertFails(updateDoc(doc(alice(), 'jams', 'j1'), { lat: 10 }));
  await assertFails(deleteDoc(doc(alice(), 'jams', 'j1')));
});

test('speeds: anonymous samples only, sane values', async () => {
  const s = { geohash: 't9d2s1x', slot: 2958000, speed: 12.5, createdAt: serverTimestamp() };
  await assertSucceeds(addDoc(collection(alice(), 'speeds'), s));
  await assertFails(addDoc(collection(alice(), 'speeds'), { ...s, uid: 'alice' })); // no user ids stored
  await assertFails(addDoc(collection(alice(), 'speeds'), { ...s, speed: 500 }));
  await assertFails(addDoc(collection(guest(), 'speeds'), s));
});

test('reviews: one per person per place, only the author can change it', async () => {
  const r = (uid) => ({ placeKey: 'n5001', placeName: 'Joy Ice Creams', rating: 5, text: 'Great falooda', createdAt: serverTimestamp(), uid });
  await assertSucceeds(setDoc(doc(alice(), 'reviews', 'n5001_alice'), r('alice')));
  await assertSucceeds(setDoc(doc(alice(), 'reviews', 'n5001_alice'), { ...r('alice'), rating: 4 })); // edit own
  await assertFails(setDoc(doc(alice(), 'reviews', 'n5001_bob'), r('alice'))); // wrong id
  await assertFails(setDoc(doc(bob(), 'reviews', 'n5001_alice'), r('bob'))); // someone else's
  await assertFails(setDoc(doc(alice(), 'reviews', 'n5001_alice'), { ...r('alice'), rating: 6 }));
  await assertFails(setDoc(doc(alice(), 'reviews', 'n5001_alice'), { ...r('alice'), text: 'x'.repeat(501) }));
  await assertFails(deleteDoc(doc(bob(), 'reviews', 'n5001_alice')));
  await assertSucceeds(deleteDoc(doc(alice(), 'reviews', 'n5001_alice')));
});

test('userPlaces: validated adds, owner-only delete', async () => {
  const p = { name: 'Kalpathy Mango Juice', category: 'Juice shop', lat: 10.79, lon: 76.64, geohash: 't9d2s0', createdAt: serverTimestamp(), uid: 'alice' };
  await assertSucceeds(setDoc(doc(alice(), 'userPlaces', 'p1'), p));
  await assertFails(setDoc(doc(alice(), 'userPlaces', 'p2'), { ...p, name: '' }));
  await assertFails(setDoc(doc(alice(), 'userPlaces', 'p3'), { ...p, phone: '9'.repeat(31) }));
  await assertFails(setDoc(doc(alice(), 'userPlaces', 'p4'), { ...p, verified: true }));
  await assertFails(updateDoc(doc(alice(), 'userPlaces', 'p1'), { name: 'Changed' }));
  await assertFails(deleteDoc(doc(bob(), 'userPlaces', 'p1')));
  await assertSucceeds(deleteDoc(doc(alice(), 'userPlaces', 'p1')));
});
