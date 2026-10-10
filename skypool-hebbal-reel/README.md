# SkyPool Fitness Studio, Hebbal: 30s vertical reel

`skypool-hebbal-reel-30s.mp4` is a 1080×1920 (9:16), 30 fps, H.264 motion-graphics promo. It has a silent AAC track so you can add licensed music inside Instagram or YouTube.

## Timeline

| Time | Scene | On screen |
|---|---|---|
| 0.0–4.0s | Intro | Logo, SKYPOOL FITNESS STUDIO, "SWIM STRONG • LIVE STRONG", swimmer with splash, "BUILD CONFIDENCE STAY FIT" badge, "Hebbal's Best Swimming Pool" |
| 4.0–9.5s | Program 1 of 3 | Regular Swimming: 1 / 3 / 6 / 12 months, ₹4,500 / ₹12,000 / ₹21,000 / ₹31,000 |
| 9.5–15.5s | Program 2 of 3 | Recharge Swimming: 10–200 hrs, with price, person access and validity for each pack |
| 15.5–19.5s | Program 3 of 3 | Training for kids and adults, weekday (WKD): 18 / 54 / 100 classes, with price and validity |
| 19.5–23.5s | Program 3 of 3 | Training for kids and adults, weekend (WKND): 18 / 54 / 100 classes, with price and validity |
| 23.5–26.5s | Perks | Expert Coaches, Safe & Hygienic, Safe & Secure, Fitness for Everyone, Flexible Schedules, plus "Swim Cap & Goggles Available" |
| 26.5–30.0s | Close | Registration fee ₹200/- + 5% GST applicable, studio name, Hebbal, Bengaluru, "Enroll Today!" |

The brand bar, the "SWIM STRONG • LIVE STRONG" footer and the "BUILD CONFIDENCE STAY FIT" badge stay on screen through every program scene. A water-wave wipe marks each scene change.

## Editing and re-rendering

All prices and text are in `reel.html`: the data arrays at the top of the `<script>` block, and the markup for each scene. To re-render:

```bash
npm install                 # installs Playwright; uses the system Chromium
npm run stills              # PNG review frames in ./stills
npm run render              # writes skypool-hebbal-reel-30s.mp4 (needs ffmpeg)
```

The swimmer and palm-leaf art in `assets/` are cut from the client's poster. `logo_blue.png` is the client's logo recoloured to the poster's navy.
