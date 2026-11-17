// One Firebase app for BillX (loaded only when cloud mode is configured).
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import {
  initializeFirestore, connectFirestoreEmulator, persistentLocalCache, persistentMultipleTabManager, memoryLocalCache,
} from 'firebase/firestore';
import { firebaseConfig, emulatorHost } from './config.js';

let fb = null;

export function firebase() {
  if (fb) return fb;
  const app = initializeApp(firebaseConfig, 'billx');
  const auth = getAuth(app);
  let cache;
  try {
    cache = persistentLocalCache({ tabManager: persistentMultipleTabManager() });
  } catch {
    cache = memoryLocalCache();
  }
  const db = initializeFirestore(app, { localCache: emulatorHost ? memoryLocalCache() : cache, ignoreUndefinedProperties: true });
  if (emulatorHost) {
    connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, emulatorHost, 8080);
  }
  fb = { app, auth, db };
  return fb;
}
