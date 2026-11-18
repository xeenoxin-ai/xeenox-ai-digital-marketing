// Signed-in BillX: finds or creates the account (with its free trial),
// downloads its businesses into the local cache, and keeps both sides in
// sync. Every change made in the app is written to Firestore; changes made
// by staff on other devices arrive live.

import {
  onAuthStateChanged, signOut as fbSignOut,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, deleteDoc, collection, getDocs, onSnapshot, query, where, writeBatch,
  serverTimestamp, arrayUnion, arrayRemove, updateDoc,
} from 'firebase/firestore';
import { firebase } from './firebase.js';
import { storedRef, refCode } from '../referral.js';
import { accessInfo, limitsOf } from './access.js';
import {
  hooks, useNamespace, setWorkspaceList, cacheWorkspace, load, snapshot, settings, onChange, activeWorkspace,
  applyRemote, applyRemoteRemove, applyRemoteSettings, notifyRemote, flush,
} from '../store.js';

const COLS = ['clients', 'items', 'docs'];
const clean = (o) => JSON.parse(JSON.stringify(o));

export const session = {
  user: null, accountId: '', account: null, role: '', ready: false, error: '',
};

const emit = () => window.dispatchEvent(new CustomEvent('billx:account', { detail: session }));

const accountRef = () => doc(firebase().db, 'accounts', session.accountId);
const wsRef = (id) => doc(firebase().db, 'accounts', session.accountId, 'workspaces', id);
const colRef = (id, col) => collection(firebase().db, 'accounts', session.accountId, 'workspaces', id, col);

/** Find the account this user belongs to, joining as staff or creating one. */
async function findOrCreateAccount(user) {
  const { db } = firebase();
  const uref = doc(db, 'users', user.uid);
  const usnap = await getDoc(uref);
  if (usnap.exists()) return usnap.data().accountId;

  const email = (user.email || '').toLowerCase();
  if (email && user.emailVerified) {
    const q = query(collection(db, 'accounts'), where('memberEmails', 'array-contains', email));
    const hits = await getDocs(q);
    if (!hits.empty) {
      const accountId = hits.docs[0].id;
      await setDoc(uref, { accountId, email, role: 'staff', createdAt: serverTimestamp() });
      return accountId;
    }
  }
  await setDoc(doc(db, 'accounts', user.uid), {
    ownerUid: user.uid,
    ownerEmail: email,
    ownerName: user.displayName || '',
    createdAt: serverTimestamp(),
    status: 'trial',
    plan: null,
    period: null,
    paidUntil: null,
    subscriptionId: null,
    memberEmails: [],
    maxUsers: 3,
    maxBusinesses: 3,
    ...(storedRef() && storedRef() !== refCode(user.uid) ? { referredBy: storedRef() } : {}),
  });
  await setDoc(uref, { accountId: user.uid, email, role: 'owner', createdAt: serverTimestamp() });
  return user.uid;
}

/** Download every business of the account into the browser cache. */
async function downloadAll() {
  const wsSnap = await getDocs(collection(firebase().db, 'accounts', session.accountId, 'workspaces'));
  const list = [];
  for (const w of wsSnap.docs) {
    const data = { settings: w.data().settings || {}, clients: [], items: [], docs: [] };
    for (const col of COLS) {
      const s = await getDocs(colRef(w.id, col));
      data[col] = s.docs.map((d) => d.data()).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    }
    cacheWorkspace(w.id, data);
    list.push({ id: w.id, name: (data.settings.business || {}).name || 'Business' });
  }
  return list;
}

/** Free-version data saved on this device before signing up. */
function localFreeData() {
  try {
    const ix = JSON.parse(localStorage.getItem('billx-workspaces')) || { list: [{ id: 'main' }] };
    return ix.list.map((w) => {
      const raw = localStorage.getItem(w.id === 'main' ? 'billx-v1' : `billx-v1:${w.id}`);
      return raw ? { id: w.id, data: JSON.parse(raw) } : null;
    }).filter((x) => x && x.data.settings && x.data.settings.onboarded);
  } catch {
    return [];
  }
}

async function chunkedWrite(ops) {
  const { db } = firebase();
  for (let i = 0; i < ops.length; i += 400) {
    const batch = writeBatch(db);
    ops.slice(i, i + 400).forEach((op) => op(batch));
    await batch.commit();
  }
}

/** Upload a whole business (used for first upload, backup restore and samples). */
async function uploadWorkspace(id, data, { replace = false } = {}) {
  const ops = [(b) => b.set(wsRef(id), { settings: clean(data.settings), name: data.settings.business.name, industry: data.settings.industry, updatedAt: serverTimestamp() })];
  for (const col of COLS) {
    const keep = new Set();
    for (const rec of data[col] || []) {
      keep.add(rec.id);
      ops.push((b) => b.set(doc(colRef(id, col), rec.id), clean(rec)));
    }
    if (replace) {
      const existing = await getDocs(colRef(id, col));
      existing.docs.filter((d) => !keep.has(d.id)).forEach((d) => ops.push((b) => b.delete(d.ref)));
    }
  }
  await chunkedWrite(ops);
}

let unsubs = [];
function watchWorkspace(id) {
  unsubs.forEach((u) => u());
  unsubs = [];
  unsubs.push(onSnapshot(wsRef(id), (snap) => {
    if (snap.metadata.hasPendingWrites || !snap.exists()) return;
    const s = snap.data().settings;
    if (s) { lastPushed = JSON.stringify(s); applyRemoteSettings(s); }
  }, reportError));
  for (const col of COLS) {
    unsubs.push(onSnapshot(colRef(id, col), (snap) => {
      if (snap.metadata.hasPendingWrites) return;
      let changed = false;
      for (const ch of snap.docChanges()) {
        if (ch.type === 'removed') changed = applyRemoteRemove(col, ch.doc.id, { silent: true }) || changed;
        else changed = applyRemote(col, ch.doc.data(), { silent: true }) || changed;
      }
      if (changed) notifyRemote();
    }, reportError));
  }
}

function reportError(e) {
  console.warn('Sync error', e);
  if (e && e.code === 'permission-denied') {
    session.error = 'permission';
    emit();
  }
}

let lastPushed = '';
let settingsTimer = null;
function pushSettingsSoon() {
  clearTimeout(settingsTimer);
  settingsTimer = setTimeout(() => {
    if (!hooks.canWrite()) return;
    const s = settings();
    const json = JSON.stringify(s);
    if (json === lastPushed) return;
    lastPushed = json;
    setDoc(wsRef(activeWorkspace()), { settings: clean(s), name: s.business.name, industry: s.industry, updatedAt: serverTimestamp() }, { merge: true }).catch(reportError);
  }, 700);
}

function installHooks() {
  hooks.canWrite = () => accessInfo(session.account).canWrite;
  hooks.upsert = (col, obj) => {
    setDoc(doc(colRef(activeWorkspace(), col), obj.id), clean(obj)).catch(reportError);
    pushSettingsSoon();
  };
  hooks.remove = (col, id) => { deleteDoc(doc(colRef(activeWorkspace(), col), id)).catch(reportError); };
  hooks.replaced = () => { uploadWorkspace(activeWorkspace(), snapshot(), { replace: true }).catch(reportError); };
  hooks.workspaceCreated = (id) => { uploadWorkspace(id, snapshot()).catch(reportError); };
  hooks.workspaceRemoved = async (id) => {
    try {
      const ops = [];
      for (const col of COLS) (await getDocs(colRef(id, col))).docs.forEach((d) => ops.push((b) => b.delete(d.ref)));
      ops.push((b) => b.delete(wsRef(id)));
      await chunkedWrite(ops);
    } catch (e) { reportError(e); }
  };
  onChange(pushSettingsSoon);
}

/**
 * Start cloud mode. onSignedOut() shows the login screen; onReady() starts the app.
 */
export function startCloud({ onSignedOut, onVerify, onReady, onStatus = () => {} }) {
  const { auth } = firebase();
  let started = false;
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      if (started) { location.reload(); return; }
      onSignedOut();
      return;
    }
    if (started) return;
    // Email sign-ups confirm their address first (Google accounts already are).
    if (!user.emailVerified) { onVerify(user); return; }
    started = true;
    session.user = user;
    try {
      onStatus('Opening your account…');
      session.accountId = await findOrCreateAccount(user);
      session.role = session.accountId === user.uid ? 'owner' : 'staff';
      const accSnap = await getDoc(accountRef());
      session.account = { id: accSnap.id, ...accSnap.data() };
      onSnapshot(accountRef(), (snap) => {
        if (!snap.exists()) return;
        session.account = { id: snap.id, ...snap.data() };
        emit();
      }, reportError);

      useNamespace(`billx-cloud:${session.accountId}`);
      onStatus('Loading your bills…');
      let list = await downloadAll();
      if (!list.length && session.role === 'owner') {
        const local = localFreeData();
        if (local.length && confirm(`Found ${local.length} business${local.length > 1 ? 'es' : ''} saved on this device in the free version. Move ${local.length > 1 ? 'them' : 'it'} into your account?`)) {
          onStatus('Moving your bills into your account…');
          for (const w of local) await uploadWorkspace(w.id, w.data);
          list = await downloadAll();
        }
      }
      setWorkspaceList(list);
      load();
      lastPushed = JSON.stringify(settings());
      installHooks();
      watchWorkspace(activeWorkspace());
      if (!list.length) flush();
      session.ready = true;
      emit();
      onReady(session);
    } catch (e) {
      console.error(e);
      session.error = e.code || e.message;
      onReady(session, e);
    }
  });
}

export const signOut = () => fbSignOut(firebase().auth);

/* ---- team (owner only; rules enforce it) ---- */

export async function addMember(email) {
  const e = String(email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw new Error('Enter a valid email address');
  const acc = session.account;
  const members = acc.memberEmails || [];
  if (members.includes(e) || e === acc.ownerEmail) throw new Error('Already in your team');
  if (members.length + 1 >= limitsOf(acc).users) throw new Error(`Your plan allows ${limitsOf(acc).users} users. Upgrade to add more.`);
  await updateDoc(accountRef(), { memberEmails: arrayUnion(e) });
}

export async function removeMember(email) {
  await updateDoc(accountRef(), { memberEmails: arrayRemove(email) });
}

export const idToken = () => session.user.getIdToken();

/* ---- pay by UPI / bank transfer: the owner submits the reference, an admin approves ---- */

export async function submitPayment({ plan, period, amount, utr, method }) {
  const ref = String(utr || '').trim();
  if (ref.length < 6) throw new Error('Enter the UTR / reference number from your payment app or bank');
  await setDoc(doc(collection(firebase().db, 'paymentRequests')), {
    uid: session.user.uid,
    accountId: session.accountId,
    email: (session.user.email || '').toLowerCase(),
    plan, period, amount, utr: ref.slice(0, 40), method: method || 'UPI',
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

/** Private UPI / bank details for paying BillX (signed-in users only; set by an admin). */
export async function paymentDetails() {
  try {
    const snap = await getDoc(doc(firebase().db, 'private', 'payment'));
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

export async function myPayments() {
  const q = query(collection(firebase().db, 'paymentRequests'), where('uid', '==', session.user.uid));
  return (await getDocs(q)).docs.map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}
