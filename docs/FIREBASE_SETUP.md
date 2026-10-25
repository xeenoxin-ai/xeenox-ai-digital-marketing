# Switching on EasyWay's shared database (Firebase, free)

About 5 minutes, all in the browser. Free Spark plan: no card needed.

1. **Create the project**
   Go to <https://console.firebase.google.com> → **Create a project** → name it `easyway` →
   turn **off** Google Analytics (not needed) → **Create project**.

2. **Add the web app and copy its config**
   On the project home page click the **`</>`** (Web) icon → nickname `EasyWay web` → **Register app**.
   Firebase shows `const firebaseConfig = { apiKey: "...", authDomain: "...", projectId: "...", ... }`.
   Copy that whole block. These values are public identifiers, not passwords; the security rules protect the data.

3. **Turn on anonymous sign-in**
   **Build → Authentication → Get started → Sign-in method → Anonymous → Enable → Save**.

4. **Create the database**
   **Build → Firestore Database → Create database** → location **asia-south1 (Mumbai)** →
   **Start in production mode** → **Create**.

5. **Paste the security rules**
   Firestore → **Rules** tab → replace everything with the contents of [`firestore.rules`](../firestore.rules) → **Publish**.

6. **Allow the website to sign in**
   **Authentication → Settings → Authorized domains → Add domain** → `easyway-maps.vercel.app`
   (also `xeenoxin-ai.github.io` for the mirror).

7. **Send the config to your developer** (or paste it into `src/firebase-config.js`
   as `export const firebaseConfig = { ... };`) and redeploy.

The first time the app runs a query that needs an index, Firestore's error log contains a
one-click "create index" link; the needed indexes are also listed in `firestore.indexes.json`
(`firebase deploy --only firestore` creates rules and indexes in one go).

## Free plan limits (Spark)
- 50,000 document reads and 20,000 writes per day, 1 GiB stored.
- Roughly: a navigating driver writes about 7 speed samples per km, so 20,000 writes a day
  covers around 2,500 km of shared driving per day. Upgrade to the pay-as-you-go plan only
  when you outgrow this.

## Recommended next
- **App Check** (Firebase → App Check, reCAPTCHA Enterprise for web, Play Integrity for
  Android) so only the real EasyWay app can write.
- A **TTL policy** on `jams.createdAt` and `speeds.createdAt` (Firestore → TTL) to delete old
  rows automatically and keep storage tiny.
