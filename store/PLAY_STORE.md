# EasyWay: Google Play listing and release steps

## Store listing (copy and paste)

**App name:** EasyWay

**Short description (max 80 characters):**
Beat traffic, skip tolls and find a mechanic fast. Free, no ads, no sign-up.

**Full description:**

EasyWay finds the easiest way through local roads, so you don't wait in traffic.

🚦 TRAFFIC HOTSPOTS
See where queues form: signals, railway gates, bus stands, markets and schools, weighted by time of day. Report a jam with one tap and every route avoids it for the next hour.

🧭 TURN-BY-TURN NAVIGATION
Start your ride right in EasyWay: a big turn arrow, the distance to your next turn, live arrival time and spoken directions. Miss a turn and EasyWay reroutes you straight away.

🛣️ ALWAYS THE EASIEST WAY
EasyWay compares the main road with local-road shortcuts and picks the one that is fastest once traffic is counted. While you drive it keeps checking, and switches you to an easier way when one saves time.

💸 AVOID TOLLS
Turn on Avoid tolls to get only toll-free roads. Every route is marked Toll or No toll.

🛠️ BREAKDOWN HELP
Vehicle broke down? Tap Breakdown, choose Car, Bike or Truck and what you need: mechanic, puncture/tyre, battery, fuel, EV charging or towing. See the nearest places with distance and opening hours, call them or get directions. One-tap calls to 112 and the 1033 highway helpline.

🤖 AI ASSISTANT
Just type: "my bike tyre is punctured", "route to Coimbatore avoiding tolls" or "report jam here". The assistant runs on your phone.

✅ 100% FREE
No ads. No sign-up. No subscriptions. Built on OpenStreetMap open data.

**Category:** Maps & Navigation
**Tags:** navigation, traffic, toll free, mechanic, breakdown
**Contact email:** your support email
**Privacy policy URL:** https://xeenoxin-ai.github.io/xeenox-ai-digital-marketing/privacy.html

## Graphics (in this folder)

- App icon 512×512: `play-icon-512.png`
- Feature graphic 1024×500: `feature-graphic-1024x500.png`
- Phone screenshots (at least 2): take them on your phone after installing the app

## Play Console answers

- **App or game:** App. **Free or paid:** Free.
- **Ads:** No, the app contains no ads.
- **Content rating questionnaire:** category Utility/Navigation, answer No to all violence, sexual content, gambling and similar questions.
- **Target audience:** 18 and over.
- **Data safety:**
  - Location (approximate and precise): collected, **not shared**, processed only to provide app functionality, not stored. Required for routes and nearby help; the user can deny it.
  - Other data types: none collected.
  - Data is encrypted in transit (HTTPS). Users can't request deletion because nothing is stored on a server.
- **App access:** all features are available without login.

## Release steps

1. Create a Google Play developer account at https://play.google.com/console (Google charges a one-time US$25 fee and verifies your identity).
2. **Create app** → name **EasyWay**, default language English (India), App, Free.
3. Fill in **Store listing**, **Privacy policy**, **App content** and **Data safety** with the answers above.
4. **Testing → Closed testing**: new personal developer accounts must run a closed test with at least 12 testers for 14 days before production access. Add testers' Gmail addresses.
5. **Create release** → upload `app-release.aab` → **Use Google-generated app signing key** (Play App Signing).
6. After the test period: **Production → Create release** → upload the same or newer `.aab` → **Send for review**.

## Upload key

The `.aab` is signed with your private upload key (`easyway-upload-key.jks`). Keep that file and its password backed up somewhere safe and never put them in GitHub. Every future update must be signed with the same key. If you ever lose it, Google can reset the upload key through Play Console support.

## Updating the app later

1. Raise `versionCode` (1 → 2 → 3 …) and `versionName` in `android/app/build.gradle`.
2. `npm run build && npx cap sync android`
3. `cd android && ./gradlew bundleRelease` (needs `android/keystore.properties` pointing to your key)
4. Upload `android/app/build/outputs/bundle/release/app-release.aab` as a new release.
