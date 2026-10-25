# xeenox-ai-digital-marketing
First Fully AI-Powered Digital Marketing Agency in Palakkad

## Xeenox Route (v0.1)

A Google-Maps-style web app focused on the parts that matter on Indian roads:

| Feature | How it works |
| --- | --- |
| **Traffic hotspots** | Red / orange / yellow circles where queues form. Predicted on-device from OpenStreetMap features (signals, railway gates, bus stands, markets, schools, malls), weighted by time of day, plus jams users report. Add a free TomTom key in Settings for a live traffic overlay. |
| **Easiest local route** | Gets the routing engine's alternatives plus "local road" detours, then ranks them by *drive time + predicted traffic delay*, so a slightly longer local road wins when the main road is jammed. **Start ↗** opens the chosen route in Google Maps for voice navigation. |
| **Avoid tolls** | Hard toll exclusion via the Valhalla engine. Every route is tagged *Toll* / *No toll*; if no toll-free road exists you are told. |
| **Breakdown help** | Red **Breakdown** button → pick Car / Bike / Truck and the need (mechanic, puncture, battery, fuel, EV charging, towing) → nearest places with distance, hours, **Call** and **Go**. One-tap 112 and 1033 (highway helpline). |
| **Local AI assistant** | Type naturally: "my bike tyre is punctured", "route to Coimbatore avoiding tolls", "report jam here". Runs a built-in on-device engine; optionally uses a local LLM through [Ollama](https://ollama.com). Nothing is sent to a cloud AI. |

Built on open data (OpenStreetMap, OSRM, Valhalla, Overpass, Nominatim) instead of
reverse-engineering Google Maps: Google's private APIs are against their Terms of
Service and break without notice.

### Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # logic tests
npm run build    # production build in dist/ (deployed to GitHub Pages from main)
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
- `src/routing.js` – Valhalla/OSRM routing, toll handling, local detours
- `src/workshops.js` – breakdown service search
- `src/ai.js` – on-device assistant + Ollama bridge
- `src/geocode.js`, `src/overpass.js`, `src/geo.js`, `src/storage.js` – helpers

### Next steps (ideas)

- Learn real congestion from users' trip speeds (crowd-sourced traffic)
- Own turn-by-turn voice navigation (no Google Maps hand-off)
- Workshop ratings, verified partner garages, live mechanic booking
- Android app (Capacitor) with offline maps
