# xeenox-ai-digital-marketing
First Fully AI-Powered Digital Marketing Agency in Palakkad

## EasyWay (v0.1)

**Live: https://easyway-maps.vercel.app** (mirror: https://xeenoxin-ai.github.io/xeenox-ai-digital-marketing/)

A Google-Maps-style web app focused on the parts that matter on Indian roads:

| Feature | How it works |
| --- | --- |
| **Traffic hotspots** | Red / orange / yellow circles where queues form. Predicted on-device from OpenStreetMap features (signals, railway gates, bus stands, markets, schools, malls), weighted by time of day, plus jams users report. |
| **Easiest local route** | Gets the routing engine's alternatives plus "local road" detours, then ranks them by *drive time + predicted traffic delay*, so a slightly longer local road wins when the main road is jammed. |
| **Turn-by-turn navigation** | **Start** navigates inside EasyWay: live GPS follow, turn banner, spoken directions (phone's own text-to-speech), ETA, automatic reroute when you leave the route, and every 2 minutes a fresh check for an easier way that switches you when it saves ≥ 2 min. |
| **Avoid tolls** | Hard toll exclusion via the Valhalla engine. Every route is tagged *Toll* / *No toll*; if no toll-free road exists you are told. |
| **Breakdown help** | Red **Breakdown** button → pick Car / Bike / Truck and the need (mechanic, puncture, battery, fuel, EV charging, towing) → nearest places with distance, hours, **Call** and **Go**. One-tap 112 and 1033 (highway helpline). |
| **Shop search & place pages** | Type any shop name or type ("ice cream", "Joy Ice Creams"): nearby OpenStreetMap places by name, brand or type plus towns and addresses, nearest first. Place page with photo (when mapped), Open now / Closed, address, phone, website, cuisine, takeaway/delivery/UPI, Directions, Call, Website, Share link. "Add a missing place" sends a public OpenStreetMap note so mappers add it. |
| **Nearby places** | Chips under the search box (Hospitals, Petrol, Food, ATM, Pharmacy, Hotels, Police, Grocery, EV, Toilets, Parking, Bus stand, Railway, Worship) scan OpenStreetMap around you, nearest first, with Call and Go. Tap any place on the map for its name, type, hours, phone and Directions. |
| **Local AI assistant** | Type naturally: "find hospital near me", "nearest ATM", "my bike tyre is punctured", "route to Coimbatore avoiding tolls", "report jam here". Runs a built-in on-device engine; optionally uses a local LLM through [Ollama](https://ollama.com). Nothing is sent to a cloud AI. |

### 100% free

No payments, no ads, no sign-up, no API keys. Every data source is free and open:

| Data | Source |
| --- | --- |
| Map | OpenStreetMap |
| Routes, toll avoidance | Valhalla (main), OSRM (backup) |
| Traffic hotspots, workshops | OpenStreetMap via Overpass (3 free mirrors) |
| Place search | Nominatim (main), Photon (backup) |
| AI assistant | On-device; optional Ollama (free, runs on your own computer) |
| Hosting | Vercel (free Hobby plan) and GitHub Pages |

The public servers are shared and have fair-use limits. If the app grows to many
thousands of users a day, run the same free, open-source software (Valhalla,
Overpass, Nominatim) on your own server; the software stays free, only the server
hosting costs money.

We use open data instead of reverse-engineering Google Maps: Google's private APIs
are against their Terms of Service and break without notice.

### Install on your phone (free)

1. Open the app link in Chrome (Android) or Safari (iPhone).
2. Android: tap **Install app** at the top (or menu ⋮ → *Install app*).
   iPhone: tap Share → *Add to Home Screen*.
3. Open **EasyWay** from the home screen like any other app.

### Android app (Google Play)

The `android/` folder is a Capacitor wrapper around the same web app (app id
`com.xeenox.easyway`). Store listing text, graphics and release steps are in
[`store/PLAY_STORE.md`](store/PLAY_STORE.md). All graphics are rendered from `public/logo.svg` by
`node scripts/make-icons.mjs` (needs Playwright).

```bash
npm run build && npx cap sync android
cd android && ./gradlew bundleRelease   # needs Android SDK + android/keystore.properties
```

### Shared database (Firebase, free Spark plan)

Shared jam reports, anonymous crowd speeds (live "slow traffic"), ratings & reviews,
and places added in the app live in **Cloud Firestore**. It's off until
`src/firebase-config.js` has your web config; without it the app works on-device.
Security is in [`firestore.rules`](firestore.rules): reads are public, writes need
an anonymous sign-in, and each write is validated (fields, sizes, server time,
owner). Indexes are in `firestore.indexes.json`.

```bash
npm run test:rules   # security-rules tests on the Firebase Emulator
npm run emulators    # local Firestore + Auth; build with VITE_FIREBASE_EMULATOR=127.0.0.1
```

Setup steps: [`docs/FIREBASE_SETUP.md`](docs/FIREBASE_SETUP.md).

### Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # logic tests
npm run build    # production build in dist/ (deployed to GitHub Pages from main)
vercel deploy --prod   # publish to https://easyway-maps.vercel.app (project: easyway)
```

### Optional: local LLM

```bash
ollama pull llama3.2
OLLAMA_ORIGINS="*" ollama serve   # allow the browser app to call it
```

Then in the app: Settings → tick "Use local LLM (Ollama)". If Ollama is not running,
the assistant falls back to the built-in engine automatically.

### Code map

- `src/main.js` – map, UI wiring
- `src/traffic.js` – hotspot prediction, jam reports, route traffic scoring
- `src/routing.js` – Valhalla/OSRM routing, toll handling, local detours, turn instructions
- `src/navigation.js` – turn-by-turn logic (snap to route, next turn, voice timing, off-route)
- `src/drive.js` – live navigation session (GPS, banner, voice, reroute, easier-way checks)
- `src/places.js` – nearby places by category, name/type search, tap-a-place lookup
- `src/hours.js` – opening hours → "Open now · closes 9 PM"
- `src/osmnotes.js` – "Add a missing place" (OpenStreetMap notes)
- `src/workshops.js` – breakdown service search
- `src/ai.js` – on-device assistant + Ollama bridge
- `android/` – Android app (Capacitor), `store/` – Play Store listing
- `src/cloud.js` – shared database (jams, speeds, reviews, added places); `firestore.rules`
- `src/geocode.js` (Nominatim + Photon), `src/overpass.js`, `src/geo.js`, `src/storage.js` – helpers

### Next steps (ideas)

- Learn real congestion from users' trip speeds (crowd-sourced traffic)
- Workshop ratings, verified partner garages, live mechanic booking
- Android app (Capacitor) with offline maps
