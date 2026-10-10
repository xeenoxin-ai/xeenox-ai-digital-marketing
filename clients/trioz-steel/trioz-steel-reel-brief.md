# Trioz Steel: Website Analysis and 30-Second Vertical Reel Brief

**Client:** Trioz Steel Windows & Doors (Trioz Engineering), Kadampazhipuram, Palakkad, Kerala
**Source:** [www.triozsteel.com](https://www.triozsteel.com), every page, analysed 10 October 2026
**Deliverable:** 30 s, 9:16 motion graphics reel for Instagram Reels, TikTok and Stories
**Rendered cut:** [`reel/trioz-steel-reel-30s-9x16.mp4`](reel/trioz-steel-reel-30s-9x16.mp4) (1080 × 1920, 30 fps, H.264, with an original soundtrack). Storyboard: [`reel/storyboard.jpg`](reel/storyboard.jpg)

> No prices appear anywhere in this package: not in the analysis, the script, the on-screen text or the rendered video.

---

## Part 1: Website analysis

### 1.1 What was reviewed

The site is a single-page React app built with Hostinger's AI website builder. A plain fetch returns an empty shell, so every route was rendered in headless Chromium and all the visible text, image alt text and product imagery were captured.

| Page | Route | What it carries |
|---|---|---|
| Home | `/` | Hero positioning, four feature pillars, proof stats, range overview (four range cards), Google reviews, free-site-measurement CTA |
| Products | `/products` | Full catalogue: 4 Trioz collections with 90 coded models, material specification, Petra Steel section with downloadable catalogue PDF, additional fabrication services |
| About Us | `/about` | Workshop story, "Made here, not imported" argument, quality and finish process, "Why choose Trioz" list |
| Contact Us | `/contact` | Phone and WhatsApp (075107 27419), email (sales@triozsteel.in), address, opening hours, map |
| Petra catalogue | `/Trioz-Petra-Steel-Doors-Brochure.pdf` | 62-page PDF with 60 door pages covering 23 PTR model numbers |

All 90 Trioz product photos and the full Petra catalogue were reviewed by eye, so the design notes below describe what is actually pictured, not just the alt text.

### 1.2 Brand presentation

**Positioning line:** *"Made here, not imported."* Every page comes back to it. Trioz presents itself as the **local manufacturer**: steel is "cut, welded, primed and powder-coated in our own Kadampazhipuram unit", site-measured, and "installed by the people who built it".

**Brand pillars (Home feature cards)**
1. **Rust-proof & weatherproof:** zinc-primed, 60-micron powder-coated profiles "that shrug off Kerala monsoons and coastal salt"
2. **High-security locking:** multipoint mortise locks, anti-lift hinges, concealed bolts
3. **Custom sizes & designs:** every opening site-measured; grilles, glazing bars and finishes matched to the elevation
4. **Built to last:** mitre-welded, ground-flush joints, 10-year structural assurance

**Proof points shown on the site**

| Proof point | Where it appears |
|---|---|
| 4.8★ Google rating from 23 reviews | Home, About, Contact, footer |
| 500+ installations across Palakkad | Home ("openings fabricated and fitted" on About) |
| 10-year structural assurance | Home, About |
| 60-micron powder coat | Home, About |
| 100% locally made in Kadampazhipuram | Home |

**Craft story (About):** sections are checked for gauge before cutting. Corners are mitred, welded and ground flush "so the joint disappears". Frames are degreased, phosphated, zinc-primed and oven-cured.

**Tone of voice:** plain-spoken, practical, proudly local. It favours specifics like gauge, microns and lead time in days over superlatives. The one superlative is the hero headline, "The Best Steel Windows & Doors in Palakkad".

**Visual identity (taken from the site's CSS and assets)**

| Token | Hex | Use on site |
|---|---|---|
| Navy | `#1B2A3A` | Primary text, dark sections, hero overlay |
| Deep navy | `#12202E` | Darkest backgrounds |
| Brass / gold | `#C9922E` | Kickers, CTAs, icons, star ratings |
| Cream | `#F3EFE8` | Light section backgrounds |
| Paper | `#FBFAF7` | Cards |
| Slate | `#6B7785` | Secondary text |
| Logo red | ≈ `#E52A2A` | Logo bracket mark only (white "TRIOZ" wordmark) |

Typography is **Sora** (headings) and **Inter** (body). Layouts use rounded cards, pill buttons, uppercase letter-spaced kickers and a navy hero over a dark architectural photograph.

### 1.3 Product architecture

The site describes **"Two brands from one workshop floor"**:

```
Trioz Steel Windows & Doors
├── Brand 01 · TRIOZ STEEL: everyday steel, made to your opening
│   ├── Trioz Single Doors     TRD-R011 → TRD-R028   18 models
│   ├── Trioz Main Doors       TRD-M111 → TRD-M139   29 models
│   ├── Trioz Windows          TRW-01   → TRW-37     37 models
│   └── Trioz Door Frames      TRDF-01  → TRDF-06     6 models
│                                                    ─────────
│                                                    90 coded models
├── Brand 02 · PETRA STEEL: architectural steel (catalogue PDF, 23 PTR model numbers)
└── Also fabricated: sliding systems, casement & fixed windows, grille safety doors, railings
```

### 1.4 Collection-by-collection findings

#### Trioz Single Doors: 18 models (TRD-R011 to TRD-R028)
- **Format:** single leaf, standard **90 × 210 cm**, powder-coated steel, made to order.
- **Design variety, from the site's own descriptions and photos:**
  - *Wood-look finishes:* mahogany panelled (R011), walnut with vertical inset panel (R012), teak louvre-and-groove (R014), red-brown horizontal panels (R027), mahogany with vertical glass insets (R026)
  - *Solid colours:* charcoal, copper-brown, blue-grey, dark blue
  - *Surface patterns:* fluted (R015, R021, R023), horizontal grooves (R017), geometric panels (R022), four-panel (R016), minimalist (R018)
  - *Feature details:* louvre panels (R014, R019), side glass panel (R020), square glass insets (R024), ornate charcoal with gold accents (R025), vertical grille with lower panels (R028)
- **Emphasis:** variety of looks in one practical standard size.

#### Trioz Main Doors: 29 models (TRD-M111 to TRD-M139)
- **Format:** double door, double panel, **120 × 210 cm**. Primer-finished and delivered to site.
- **Standard hardware on every model:** bullet-type lock, 4 tower bolts, eye lens (door viewer), stainless steel accessories.
- **Material specification:** TATA Galvano **1.5 mm (16 gauge)** sheet for door frames, TATA Galvano **0.9 mm (20 gauge) double sheet** for door panels, epoxy primer finish.
- **Design variety seen in the photos:** golden-oak, teak and walnut wood-grain looks; slate-grey and navy flat finishes. Patterns include steel-strip inlays, square glass/mirror studs, louvred side panels, fluted and grooved leaves, traditional Kerala-style carved panels with brass fittings (M118, M137) and glazed upper lights (M135).
- **Note on the site:** "Door glass not included" sits with this collection.
- **Emphasis:** security hardware and gauge, presented as a complete main-entrance package.

#### Trioz Windows: 37 models (TRW-01 to TRW-37)
- **Format:** **made to order**, site-measured, powder-coated.
- **Named style families:** ventilator, louvered, sliding, casement, arched and designer.
- **Design variety seen in the photos:** louvred shutters, multi-bay casements, grilles (straight bar, geometric and diamond/criss-cross), sunburst-arched tops (TRW-09), full arched units (TRW-21), a circular designer window (TRW-37) and corner/bay units (TRW-32). Finishes range from teak wood-grain to slate-grey and charcoal.
- **Emphasis:** the widest design range on the site, all built to the customer's opening.

#### Trioz Door Frames: 6 models (TRDF-01 to TRDF-06)
- **Format:** made to order, site-measured, powder-coated.
- **Finish range:** charcoal grey, copper brown with welded corners, dark navy blue, teak wood-grain, matte black with mitred corners, grey with reinforcement plates.
- **Emphasis:** "Heavy-duty… durable, rust-proof and made for a precise fit."

#### Petra Steel: the architectural range (Brand 02)
- **Site copy:** "Pivot doors, heritage frames, slim-sight-line sliding systems and internal glass partitions with hand-finished surfaces." Bullets: slim 25 mm sight lines; hand-finished patina and matte textures; made to measure in Kadampazhipuram.
- **Catalogue PDF content:** 60 steel door designs across 23 PTR model numbers (PTR 11-A/B, 20, 21, 30, 45, 55, 60, 66, 75, 88, 99, 100, 101, 110, 115, 189, 201, 220, 400, 500, 700, 800). Widths run from 880 mm to 1800 mm. Looks include carved woodgrain, sunburst medallions, copper-inlay chevrons on textured black, matte black flush leaves, mahogany geometric panels and glazed side lights.

#### Additional fabrication
Sliding systems, casement and fixed windows, grille safety doors and railings, "all in the same zinc-primed, powder-coated steel, measured on site and installed by our own team."

### 1.5 Key takeaways for the creative

1. **Range is the story.** 90 coded models across four Trioz collections, plus a separate architectural brand. That count is concrete, accurate and short enough to work as a hook.
2. **"Made here, not imported"** is the brand's most distinctive line and should land early.
3. **Each collection has a single clear proof:**
   - Single Doors: design variety at one size
   - Main Doors: security hardware and TATA gauge
   - Windows: six style families, all made to order
   - Frames: six finishes
4. **The Kerala climate is the functional benefit:** rust-proof, 60-micron coat, monsoon-ready.
5. **Trust proof is strong for a local brand:** 4.8★ from 23 reviews, 500+ installations, 10-year assurance.

### 1.6 Accuracy flags (check with the client before paid promotion)

| # | Observation | How the reel handles it |
|---|---|---|
| 1 | **Petra copy vs. catalogue.** The site describes Petra as pivot doors, sliding systems and glass partitions "made to measure in Kadampazhipuram". The PDF shows Petra-branded steel security doors and points to petradoors.com, with distribution across six states. This suggests Petra may be a partner brand rather than in-house. | The reel only claims what fits both: **Petra Steel, architectural steel, hand-finished textures, full catalogue online**. It does not say "made in Kadampazhipuram" or "25 mm sight lines" over Petra imagery. |
| 2 | The image labelled "Petra Steel heritage glass partition…" actually shows the Petra logo. | Not used. Petra visuals come from the catalogue PDF. |
| 3 | Window models are not labelled by style, so it is unknown which TRW is "sliding" or "ventilator". | Window photos and style names are shown **separately**; the reel never pairs a photo with a style it may not be. |
| 4 | Main doors are listed as **primer-finished**, while other collections are powder-coated. | Powder coating is claimed only for single doors and the general process, never for main doors. |
| 5 | "Door glass not included" applies to main doors. | Glazed main-door models are left out of the main-door sequence. |
| 6 | Review count and installation numbers will change over time. | Reconfirm before each re-use. They are current as of 10 Oct 2026. |

---

## Part 2: Motion graphics brief

### 2.1 Concept: "90 models. One workshop."

**Insight from the analysis:** buyers in Palakkad think steel means a limited, imported, one-size choice. Trioz's site shows the opposite: a large catalogue of designs, all fabricated and fitted by one local workshop.

**Idea:** open on the count to show the scale of the range (**90 models**), then pin it to the brand truth (**One Palakkad workshop. Made here, not imported.**). From there, walk through the collections one per beat, each carrying its single proof point, and close on the brand lock-up and URL.

**Viewer takeaway:** *"Trioz makes far more designs than I expected, and they're made locally."*

### 2.2 Format and technical spec

| Spec | Value |
|---|---|
| Duration | 30.0 s |
| Aspect / resolution | 9:16, 1080 × 1920 |
| Frame rate | 30 fps (900 frames) |
| Codec | H.264 High, yuv420p, `+faststart`; AAC 192 kbps stereo soundtrack at −14 LUFS (see 2.7) |
| Platforms | Instagram Reels and Stories, TikTok, YouTube Shorts, Facebook Reels |
| Sound-off design | All meaning is carried by on-screen text; no voiceover needed. The music adds energy but nothing depends on it |
| Safe zones | Critical text kept between **y = 260 and y = 1540**. The top 250 px (handle and progress bar) and bottom 380 px (caption and CTA overlay) stay clear, with ≥ 60 px side margins. |

### 2.3 Visual direction

**Palette.** The site palette is used as-is (section 1.2), and dark and light scenes alternate to set the rhythm:

| Scenes | Background |
|---|---|
| Hook, Main Doors, Frames, Close | Navy / deep navy |
| Single Doors, Windows, Proof | Cream |
| Petra | Near-black, to mark the second brand |
| All scenes | Brass is the only accent: kickers, frame lines, highlighted chips, URL pill |

**Typography (at 1080 px wide)**

| Role | Font | Size |
|---|---|---|
| Hero numbers | Sora 800 | 300 px |
| Headlines | Sora 800 | 112–140 px |
| Sub-heads | Sora 600–700 | 44–88 px |
| Kickers | Inter 600 | 30 px, uppercase, +0.22 em tracking |
| Body, chips, specs | Inter 500–600 | ≥ 32 px (nothing below 22 px; model-code tags only) |

Every text block is short enough to read in its time on screen: about 3 words per second at most.

**Motion language (steel and architecture)**
- **Frame-draw:** a brass rectangle draws itself stroke by stroke, like a steel frame being welded. It opens the hook and frames the logo at the close.
- **Push through the doorway:** the camera zooms through the hook's door frame into the workshop.
- **Brushed-steel wipe:** a skewed, brass-edged steel panel sweeps across at each collection change, like a shutter sliding.
- **Door-swing reveal:** main doors open on their hinges (3D rotateY) to reveal the next model.
- **Parallax columns:** three columns of single doors drift at different speeds, showing volume.
- **Spark line:** a glowing brass weld line traces under the process steps.
- **Count-ups and chip pops:** numbers climb, and feature chips scale in with a slight overshoot.
- **Easing:** quintic/cubic ease-outs on entrances; nothing linear except the parallax drift.

**Imagery.** Only the client's own product photos from triozsteel.com and its Petra catalogue are used. Every product card carries its real model code (TRD-R015, TRW-09, etc.) to reinforce catalogue depth.

### 2.4 Shot-by-shot script

| # | Time | Beat | Visual and motion | On-screen text | Sound cue |
|---|---|---|---|---|---|
| 1 | 0.0–3.0 | **HOOK** | Brass frame draws in 0.7 s; 14 product photos flicker-cut inside it (single, main, window). The counter climbs 0 → 90. At 2.55 s the camera pushes through the doorway. | MADE HERE, NOT IMPORTED · **90** · door, window & frame models · **One Palakkad workshop.** | A-minor drone and riser; impact as "90" lands (1.5 s); 16th-note ticks and a second riser into the 3.0 s hit |
| 2 | 3.0–5.5 | **Made here** | Workshop welding shot with slow Ken Burns; brass weld line sweeps with glow; four process steps tick in. | KADAMPAZHIPURAM · PALAKKAD · **Made here. Not imported.** · 01 Cut · 02 Welded · 03 Primed · 04 Powder-coated | Groove starts on the 3.0 s downbeat (kick, bass, pad); weld crackle under the spark line; tick per step |
| 3 | 5.5–10.0 | **Single Doors** | Steel wipe in. Three parallax columns of single doors with model tags; five feature chips pop in. | 01 · TRIOZ SINGLE DOORS · **18 designs** · 90 × 210 cm · powder-coated steel · Panelled · Fluted · Louvred · Glass insets · Gold accents | Steel-shutter whoosh into an impact on the 5.5 s cut; claps enter; soft tick per chip |
| 4 | 10.0–14.5 | **Main Doors** | Steel wipe in. A large main-door card swings open on its hinges six times (M111 → M130), and the model tag updates. A spec list counts in, then the material panel. | 02 · TRIOZ MAIN DOORS · **29 double doors** · Double door · double panel · 120 × 210 cm · 1 Bullet-type lock · 2 4 tower bolts · 3 Eye lens viewer · 4 SS accessories · MATERIAL SPECIFICATION: TATA Galvano 1.5 mm frame, 0.9 mm double-sheet panels | Whoosh and impact on 10.0 s; 16th hats and a ping-pong arpeggio enter; door-latch clunk as each door closes |
| 5 | 14.5–19.0 | **Windows** | Steel wipe in. A 3 × 3 mosaic of window models springs in from the centre and floats gently. Six style chips appear and light brass in sequence. | 03 · TRIOZ WINDOWS · **37 designs** · Made to order · site-measured · Ventilator · Louvred · Sliding · Casement · Arched · Designer | Whoosh and impact on 14.5 s; full groove; tick as each style chip lights |
| 6 | 19.0–21.5 | **Door Frames** | Steel wipe in. Frame photos cycle through six finishes; the matching swatch lights up. | 04 · TRIOZ DOOR FRAMES · **6 finishes** · Heavy-duty · rust-proof · precise fit · Charcoal grey · Copper brown · Navy blue · Teak wood-grain · Matte black · Grey | Whoosh and impact on 19.0 s; tick on each finish change |
| 7 | 21.5–24.5 | **Petra Steel** | Mood shifts to near-black. The PETRA wordmark rises and the STEEL tracking tightens; three catalogue doors (PTR 700, PTR 88, PTR 800) fan out and float. | BRAND 02 · ARCHITECTURAL STEEL · **PETRA** · STEEL · Hand-finished textures · Full catalogue online | Drop on 21.5 s: drums out, deep boom, dark Dm → E pad, heartbeat kicks, reverse swell into 24.5 s |
| 8 | 24.5–26.8 | **Proof** | Cream. Four stat tiles rise and count up. | RUST-PROOF & WEATHERPROOF · **Built for the Kerala monsoon.** · 60 micron Powder-coat thickness · 10 yr Structural assurance · 4.8★ From 23 Google reviews · 500+ Installations in Palakkad | Build on 24.5 s: kick returns, accelerating clap roll, rising bass line and riser, a short gap before the hit |
| 9 | 26.8–30.0 | **Brand close** | A brass frame draws around the logo; the logo un-blurs in; the line fades up; the URL pill pops; holds for 1.4 s for loop and readability. | TRIOZ · STEEL WINDOWS & DOORS (logo) · **Made here in Palakkad. Never imported.** · **www.triozsteel.com** | Final impact on 27.0 s as the frame draws; A-minor add9 chord rings out; chime as the URL lands (28.1 s); fade to silence at 30 s |

**Pacing check**
- **Hook (0–3 s):** a moving number, a moving door and the brand truth, all before the first cut.
- **Showcase (3–24.5 s):** five collections in about 21 s, each 2.5–4.5 s, so attention resets roughly every 4 s.
- **Brand moment (24.5–30 s):** proof, then name and URL, on screen for the last 2.2 s.

### 2.5 Every on-screen claim, traced to the website

| On-screen claim | Source on triozsteel.com |
|---|---|
| Made here, not imported / Never imported | Home hero kicker; footer: "Made here in Palakkad, never imported." |
| 90 door, window & frame models | Products: 18 TRD-R + 29 TRD-M + 37 TRW + 6 TRDF codes |
| Kadampazhipuram · Palakkad; Cut · Welded · Primed · Powder-coated | Home hero: "Cut, welded, primed and powder-coated in our own Kadampazhipuram unit" |
| 18 designs · 90 × 210 cm · powder-coated steel | Products › Trioz Single Doors |
| Panelled · Fluted · Louvred · Glass insets · Gold accents | Products › single-door image descriptions (e.g. R011 "panelled", R015 "fluted", R014 "louvre", R024 "glass insets", R025 "gold accents") |
| 29 double doors · double door · double panel · 120 × 210 cm | Products › Trioz Main Doors |
| Bullet-type lock · 4 tower bolts · Eye lens viewer · SS accessories | Products › Trioz Main Doors spec line |
| TATA Galvano 1.5 mm frame / 0.9 mm double-sheet panels | Products › Material specification |
| 37 designs · made to order · site-measured | Products › Trioz Windows (TRW-01 to TRW-37, "Size: Made to Order"); Home › Trioz Windows |
| Ventilator · Louvred · Sliding · Casement · Arched · Designer | Home and Products › Trioz Windows description |
| 6 finishes · heavy-duty · rust-proof · precise fit | Products › Trioz Door Frames (TRDF-01 to TRDF-06 finishes); Home › Trioz Door Frame card |
| Petra · Brand 02 · Architectural steel | Products: "Brand 02 — Petra Steel"; Home: "Architectural steel" |
| Hand-finished textures | Products › Petra: "Hand-finished patina and matte textures" |
| Full catalogue online | Products › "Download Petra Steel Catalogue (PDF)" |
| Rust-proof & weatherproof | Home feature card title |
| Built for the Kerala monsoon | Home: "shrug off Kerala monsoons"; About: "survives a Kerala monsoon"; Products: "Steel built for Kerala" |
| 60 micron powder-coat thickness | About stat; Home feature card |
| 10 yr structural assurance | Home and About stats |
| 4.8★ from 23 Google reviews | Home, About, Contact |
| 500+ installations in Palakkad | Home: "500+ Installations across Palakkad" |
| www.triozsteel.com | Site URL |

### 2.6 Copy for the post (no prices)

**Caption**
> **90 steel designs. One workshop. Made here, not imported.** 🔩
>
> From fluted single doors to double main doors with bullet locks, from arched windows to teak-finish frames, every Trioz piece is cut, welded, primed and powder-coated in our own unit in Kadampazhipuram, Palakkad.
>
> 🚪 18 single door designs
> 🚪 29 double main doors
> 🪟 37 made-to-order window designs
> 🔲 6 door frame finishes
> ✨ Plus the Petra Steel architectural range
>
> Rust-proof steel built for Kerala monsoons, backed by a 10-year structural assurance. ⭐ 4.8 on Google (23 reviews)
>
> 📍 Kolliyani Road, Kadampazhipuram, Palakkad
> 📞 Call / WhatsApp: 075107 27419
> 🌐 www.triozsteel.com

**Hashtags:** #TriozSteel #SteelDoors #SteelWindows #MainDoor #SteelMainDoor #DoorDesign #WindowDesign #KeralaHomes #KeralaHomeDesign #HomeDesignKerala #Palakkad #PalakkadHomes #Kerala #MadeInKerala #NewHomeKerala #HomeConstruction #InteriorDesignKerala #PetraSteel

**Short version**
> 90 steel door, window & frame designs, all made in one workshop in Palakkad. Rust-proof, made to measure, never imported. 🔩
> 📞 075107 27419 · 🌐 www.triozsteel.com
> #TriozSteel #SteelDoors #SteelWindows #KeralaHomes #Palakkad

**Cover frame:** 1.9 s (the "90 / One Palakkad workshop" frame) or 29.5 s (the logo and URL lock-up).

### 2.7 Audio direction

The rendered video includes an **original soundtrack composed for this edit** (`reel/music.py` → `reel/assets/music.m4a`). It is synthesised from scratch in code: no samples and no stock library, so it is royalty-free to post and boost.

- **Style:** industrial-minimal electronic in A minor at **120 BPM**. At that tempo the scene cuts at **3.0 / 5.5 / 10.0 / 14.5 / 19.0 / 21.5 / 24.5 s** fall exactly on the beat, so every cut lands on a downbeat.
- **Shape:**

  | Time | Section | What happens |
  |---|---|---|
  | 0–3 s | Intro | Drone and riser |
  | 3–21.5 s | Groove | Am–F–C–G progression; layers build from 10 s with 16th hats and an arpeggio |
  | 21.5–24.5 s | Petra drop | Drums out, deep boom, dark pad |
  | 24.5–27 s | Build | Clap roll and rising bass |
  | 27–30 s | Close | Logo impact, ring-out and chime, ending in silence |
- **Sound design locked to picture:**
  - Impact on the "90" landing and on each cut
  - Steel-shutter whoosh on every wipe
  - Weld crackle under the spark line
  - Door-latch clunk as each main door closes
  - Soft ticks on chips and finish changes
  - Chime as the URL lands
- **Mastering:** −14 LUFS integrated with a −2.3 dB true peak, which matches Instagram and TikTok normalisation, so the platforms won't turn it down or squash it.
- **Swapping audio:** to use trending in-app audio instead, mute the original sound when posting or replace the track in the editor. The picture is cut to 120 BPM, so most 120/60 BPM tracks will sit on the cuts.
- **Voiceover:** none required. If a Malayalam or English VO is wanted later, keep it to the on-screen lines and do not add claims beyond section 2.5.

### 2.8 Compliance checklist

- [x] No prices, offers or cost language in the analysis, script, captions or on-screen text
- [x] Every on-screen claim traced to a page on triozsteel.com (section 2.5)
- [x] Product imagery is the client's own site and catalogue photography, and model codes match the site
- [x] Petra claims limited to what both the site and the catalogue support (see 1.6, item 1)
- [x] Text inside platform safe zones; minimum body size ≥ 32 px at 1080 px wide
- [x] Brand palette, fonts and logo match triozsteel.com
- [ ] Client sign-off on Petra positioning and current review and installation counts

---

## Part 3: Production files

```
clients/trioz-steel/
├── trioz-steel-reel-brief.md          ← this document
└── reel/
    ├── trioz-steel-reel-30s-9x16.mp4  ← final render (30 s, 1080×1920, 30 fps)
    ├── storyboard.jpg                 ← 10 key frames
    ├── index.html                     ← animation source (time-driven HTML/CSS)
    ├── render.mjs                     ← frame capture + ffmpeg encode (muxes the soundtrack)
    ├── music.py                       ← soundtrack composer and mastering (numpy + ffmpeg)
    └── assets/                        ← product photos, logo, Petra pages, Sora/Inter fonts, music.m4a
```

**Preview live:** `node reel/render.mjs --serve`, then open http://localhost:8642/index.html (loops in real time).

**Re-render:** `python3 reel/music.py` (only if the music changes), then `node reel/render.mjs` (needs Playwright with Chromium, and ffmpeg). Every frame is a pure function of time (`window.seek(t)`), so renders are frame-exact and repeatable.

**Edit copy or timing:** scene windows are in `SC` and cut points in `WIPES` in `index.html`. Each scene's text is plain HTML at the top of the file.

**Review stills:** `node reel/render.mjs --stills 1.9,12,29.5`
