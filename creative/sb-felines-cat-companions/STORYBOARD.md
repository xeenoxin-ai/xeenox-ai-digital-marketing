# SB Felines — "Why Cats Make Great Companions"

**Format:** 30 s · 9:16 vertical · 1080×1920 · 30 fps · H.264 MP4 (Instagram Reels / Facebook Reels / YouTube Shorts / WhatsApp Status)
**Style:** warm, playful, premium. Deep cocoa-black backgrounds, SB Felines gold (`#F4CB3E`), cream cat silhouettes with a soft gold glow, drifting bokeh.
**Type:** Poppins ExtraBold (headlines), Fraunces Italic in gold (accent words), Poppins Medium (sub-lines). Headlines are 116–140 px and sub-lines 54 px on a 1080 px canvas, all cream or gold on near-black, so they read easily on a phone.
**Safe zone:** all text sits between y = 300 and y = 1320, clear of the Reels caption and button area at the bottom.
**Audio:** an original upbeat ukulele-pop track (120 BPM, D major) with whooshes on each transition and soft pops as text lands. The Malayalam voiceover below is optional.

---

## Scene breakdown

| # | Time | On-screen text | Visual direction | Transition out |
|---|------|----------------|------------------|----------------|
| 1 | **0:00–0:04** Hook | **Why cats make** / *great companions* | Fade up from black. A cream sitting-cat silhouette springs up from the bottom with a bounce. Tail swishes, one ear twitches, head tilts, a quick blink. Gold sparkles twinkle around it. Small SB Felines logo at the top. | **Gold iris**: a glowing gold ring opens from the centre and reveals Scene 2 (0:03.7–0:04.3) |
| 2 | **0:04–0:10.5** Benefit 01 | badge **01** · **Cozy** / *company* · "A warm, quiet presence / to come home to" | A cat curled up asleep on a round amber cushion, gently breathing. Gold "z"s drift up. A small crescent moon sways on a thread, warm amber glow. The number badge spins in, then the headline lines rise in one after another. | **Soft push**: slides left with motion blur (0:10.2–0:10.8) |
| 3 | **0:10.5–0:17** Benefit 02 | badge **02** · **Playful** / *moments* · "Little chases, big smiles" | A pink yarn ball rolls in from the right. The cat crouches with a butt-wiggle, pounces in an arc and lands by the ball, which bounces away in a burst of gold sparkles. The cat stays in a playful crouch, tail flicking. | **Zoom-dissolve**: Scene 3 blurs and zooms in while Scene 4 settles in (0:16.7–0:17.3) |
| 4 | **0:17–0:23.5** Benefit 03 | badge **03** · **Affection,** / *their way* · "Independent spirits / who choose you" | A cat trots in from the left in profile, slows down and turns to sit facing camera. Head tilt, a slow blink, and blush and gold hearts float up on both sides. | **Gold iris** opening onto the logo (0:23.2–0:23.8) |
| 5 | **0:23.5–0:30** CTA / end card | **Find your feline friend** / *with SB Felines.* | The full SB Felines logo scales in with a gold glow, and a light shimmer sweeps across it. The CTA lines rise in, a hand-drawn gold underline draws under "with SB Felines.", and a trail of paw prints trots across the bottom. The end card holds for about 3 s while the music rings out. | Music fades out (end) |

### Why these three benefits
None of them makes a health claim. Each one describes an everyday experience of living with a cat:
1. **Cozy company:** a warm presence at home.
2. **Playful moments:** fun and play.
3. **Affection, their way:** cats are independent and show affection on their own terms.

The video makes no claims about stress, blood pressure, allergies, mental health or anything medical.

---

## Optional voiceover — Malayalam (≈ 28 s, warm and friendly, smiling tone)

| Time | Malayalam | Transliteration | English meaning |
|------|-----------|-----------------|-----------------|
| 0:00–0:04 | പൂച്ചകൾ എന്തുകൊണ്ട് മികച്ച കൂട്ടുകാരാകുന്നു? | Poochakal enthukondu mikacha koottukaaraakunnu? | Why do cats make great companions? |
| 0:04–0:10 | വീട്ടിലെത്തുമ്പോൾ കാത്തിരിക്കുന്ന, ശാന്തവും ഊഷ്മളവുമായ ഒരു കൂട്ട്. | Veettiletthumbol kaatthirikkunna, shaanthavum ooshmalavumaaya oru koottu. | A calm, warm companion waiting when you get home. |
| 0:10–0:17 | ദിവസവും ചിരിപ്പിക്കുന്ന കുസൃതി നിമിഷങ്ങൾ. | Divasavum chirippikkunna kusruthi nimishangal. | Playful moments that make you smile every day. |
| 0:17–0:23 | സ്വതന്ത്രരാണ്, എങ്കിലും സ്നേഹം അവരുടേതായ രീതിയിൽ. | Swathantharaanu, enkilum sneham avarudethaaya reethiyil. | Independent, yet affectionate in their own way. |
| 0:23–0:30 | നിങ്ങളുടെ പൂച്ചക്കൂട്ടുകാരനെ കണ്ടെത്തൂ — SB Felines-നൊപ്പം. | Ningalude poochakkoottukaarane kandetthoo — SB Felines-noppam. | Find your feline friend — with SB Felines. |

**English VO alternative:** "Why do cats make great companions? … A warm, quiet presence to come home to. … Playful moments that make you smile. … Independent spirits, who still choose you. … Find your feline friend — with SB Felines."

**VO mixing tip:** keep the music around −20 to −22 LUFS under the voice (about −12 dB of ducking), with the voice at −14 LUFS overall. Each line starts about 0.3 s after its scene's transition.

---

## Files

| File | What it is |
|------|------------|
| `sb-felines-cat-companions-30s.mp4` | Final video with music, ready to post |
| `index.html` | Source animation. Open `index.html?play` in Chrome to preview it live. |
| `render.cjs` | Frame-accurate exporter (Playwright → ffmpeg) |
| `music.py` | Generates the original music bed and SFX (numpy, royalty-free) |
| `logo.png`, `fonts/` | Brand logo (transparent) and OFL-licensed fonts |

### Rebuild
```bash
NODE_PATH=$(npm root -g) node render.cjs video silent.mp4
python3 music.py music.wav
ffmpeg -i silent.mp4 -i music.wav -vf "noise=alls=3:allf=t" -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -af loudnorm=I=-14:TP=-1.5 -shortest -movflags +faststart sb-felines-cat-companions-30s.mp4
```

To add a recorded voiceover `vo.wav`, mix it over the music with ducking:
```bash
ffmpeg -i silent.mp4 -i music.wav -i vo.wav -filter_complex "[1:a][2:a]sidechaincompress=threshold=0.05:ratio=8:attack=20:release=300[m];[m][2:a]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest sb-felines-cat-companions-30s-vo.mp4
```
