# Dr Heal Pain Cure Hospital – 30s Motion Graphics Ad

Booking: **079 6928 8000** (07969288000) · **www.drheal.in** · HSR Layout, Bengaluru

## Deliverables

| File | Size | Use for |
|---|---|---|
| `DrHeal_30s_9x16.mp4` | 1080×1920, 30s, H.264 + AAC | Instagram/Facebook Reels & Stories, YouTube Shorts, WhatsApp Status |
| `DrHeal_30s_4x5.mp4` | 1080×1350, 30s, H.264 + AAC | Facebook/Instagram Feed |

In the 9:16 version, all text and the CTA stay inside the central 1080×1350 area. The Reels/Stories buttons at the top and bottom of the screen will not cover them.
The audio is an original synthesised music bed with SFX, normalised to −14 LUFS, so there are no licensing issues.

## Brand analysis (from drheal.in)
- Colours: teal `#1F86A5` (logo), orange `#F08A24` (caduceus/CTA), navy `#0B2E44`
- Core message: *"No Surgery. No Risky Procedures."* Advanced non-surgical pain treatment
- Conditions: back, neck, knee, shoulder/joint pain, sciatica, arthritis
- Trust points: 15+ years of experience, 15K+ satisfied patients, led by Dr. Rakesh H. Jayaprakash

## Storyboard

| Time | Scene |
|---|---|
| 0–3s | **Hook: the pain scale.** A 0–10 pain gauge (the scale doctors use) is on screen from the first frame. Its needle races from 1 to **10/10** with a rising alarm tone, the screen cracks with a red flash and impact, then "When pain hits 10/10, **everyday life stops.**" lands over heartbeats. The Dr Heal badge appears at 1s |
| 3–6.2s | **Kinetic panels** (0.64s each, cut on the beat): BACK PAIN, KNEE PAIN, NECK PAIN, SCIATICA (nerve pain), ARTHRITIS (joint pain), each with a body-part icon and a pulsing pain point |
| 6.2–9.3s | **Bridge**: "Pain is common." **SURGERY** gets struck through in orange, then "isn't the only answer." and "There's a better way →" |
| 9.3–13.8s | **Turn**: a teal "healing" wipe, then "NO SURGERY. NO RISKY PROCEDURES." lands with an impact sound, followed by "Advanced Non-Surgical Pain Treatment" |
| 13.8–19.8s | **Why Dr Heal?**: four benefit cards (No Surgery/No Scalpel, Root Cause, Faster Recovery, Affordable) |
| 19.8–24.3s | **Trust**: counters for 15+ Years and 15K+ Patients, the lead doctor and the HSR Layout location |
| 24.3–30s | **CTA**: logo, "Book Your Consultation Today", a pulsing **CALL NOW 079 6928 8000** button and www.drheal.in |

Why this hook: in the first 3 seconds a feed ad has to stop the scroll and show who it is for. The pain scale is instantly recognisable to anyone in pain, frame 1 already shows a full graphic rather than a fade-in, and the 10/10 crack gives a strong pattern interrupt even with the sound off.

The copy avoids "you have pain"-style wording, to stay within Meta's personal-attributes policy for health ads.

## Re-rendering / editing
Text, timings and colours are all in `source/drheal.html` (the `render(t)` function). To re-render:

```bash
cd source
python3 audio.py                                  # -> music.wav
node render.js 1920 x | ffmpeg -f image2pipe -framerate 30 -i - -c:v libx264 -crf 17 -pix_fmt yuv420p v.mp4
ffmpeg -i v.mp4 -i music.wav -c:v copy -af loudnorm=I=-14:TP=-1.5 -c:a aac -b:a 192k -shortest DrHeal_30s_9x16.mp4
```
Use `1350` instead of `1920` for the 4:5 version. `node render.js 1920 still 12.5` saves a still frame from that point in the video.
