// Keeping free-mode data safe: ask the browser never to clear BillX's storage,
// and remind the shop to download a backup every week.

const LAST = 'billx-last-backup';
const SNOOZE = 'billx-backup-snooze';
const DAY = 86400000;

const get = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const set = (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } };

/** Pure rule (tested): a backup is due when there are bills and none was saved in `days` days. */
export function backupDue({ lastBackup, snoozeUntil, docCount, now = Date.now(), days = 7 }) {
  if (!docCount) return false;
  if (snoozeUntil && now < Date.parse(snoozeUntil)) return false;
  if (!lastBackup) return docCount >= 3;
  return now - Date.parse(lastBackup) > days * DAY;
}

export const lastBackup = () => get(LAST);
export const markBackup = () => set(LAST, new Date().toISOString());
export const snoozeBackup = (days = 1) => set(SNOOZE, new Date(Date.now() + days * DAY).toISOString());
export const isBackupDue = (docCount) => backupDue({ lastBackup: get(LAST), snoozeUntil: get(SNOOZE), docCount });

/**
 * Ask the browser to keep BillX data permanently. Without this, Chrome/Safari
 * may delete site data when the phone is low on space. Returns true if granted.
 */
export async function protectStorage() {
  try {
    if (!navigator.storage || !navigator.storage.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch { return false; }
}

export const backupName = (business) => `billx-backup-${String(business || 'business').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'business'}-${new Date().toISOString().slice(0, 10)}.json`;
