# SkyPool Fitness Studio, Hebbal: 30s vertical reel

`skypool-hebbal-reel-30s.mp4` is a 1080×1920 (9:16), 30 fps, H.264 motion-graphics promo with an original soundtrack (AAC, 48 kHz stereo, normalised to about -14 LUFS for Reels and Shorts).

## Timeline

| Time | Scene | On screen |
|---|---|---|
| 0.0–4.0s | Intro | Logo, SKYPOOL FITNESS STUDIO, "SWIM STRONG • LIVE STRONG", swimmer with splash, "BUILD CONFIDENCE STAY FIT" badge, "Hebbal's Best Swimming Pool" |
| 4.0–9.5s | Program 1 of 3 | Regular Swimming: 1 / 3 / 6 / 12 months, ₹4,500 / ₹12,000 / ₹21,000 / ₹31,000 |
| 9.5–15.5s | Program 2 of 3 | Recharge Swimming: 10–200 hrs, with price, person access and validity for each pack |
| 15.5–19.5s | Program 3 of 3 | Training for kids and adults, weekday (WKD): 18 / 54 / 100 classes, with price and validity |
| 19.5–23.5s | Program 3 of 3 | Training for kids and adults, weekend (WKND): 18 / 54 / 100 classes, with price and validity |
| 23.5–26.5s | Perks | Expert Coaches, Safe & Hygienic, Safe & Secure, Fitness for Everyone, Flexible Schedules, plus "Swim Cap & Goggles Available" |
| 26.5–30.0s | Close | Registration fee ₹200/- + 5% GST applicable, studio name, Hebbal, Bengaluru, call button "ENROLL TODAY · CALL NOW 98449 90954" |

The brand bar, the "SWIM STRONG • LIVE STRONG" footer and the "BUILD CONFIDENCE STAY FIT" badge stay on screen through every program scene. A water-wave wipe marks each scene change.

## Music

`music.py` synthesises the soundtrack from scratch with numpy and scipy, using no samples or third-party audio, so it's free to use anywhere. It is upbeat tropical house at 120 BPM in D major (D–A–Bm–G):

- 0–4s: an arpeggio intro with a riser and snare build
- 4.0s: the drop hits just as the price scenes begin
- Each scene cut (9.5, 15.5, 19.5, 23.5, 26.5s) falls on a beat, with a water whoosh timed to the wave wipe
- 29s: a final chord hit that rings out

The output is `assets/music.wav`. `render.mjs` loudness-normalises it and muxes it into the MP4. To use a different track instead, replace `assets/music.wav` with any 30-second WAV.

## Editing and re-rendering

All prices and text are in `reel.html`: the data arrays at the top of the `<script>` block, and the markup for each scene. To re-render:

```bash
npm install                 # installs Playwright; uses the system Chromium
npm run stills              # PNG review frames in ./stills
npm run music               # regenerates assets/music.wav (needs python3 + numpy + scipy)
npm run render              # writes skypool-hebbal-reel-30s.mp4 (needs ffmpeg)
```

The swimmer and palm-leaf art in `assets/` are cut from the client's poster. `logo_blue.png` is the client's logo recoloured to the poster's navy.
