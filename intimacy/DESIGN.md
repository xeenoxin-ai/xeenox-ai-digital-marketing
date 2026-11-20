# Intimacy for Couples — Game Design

A private, 18+ game for couples. One app for the things couples actually do together:
flirting, playing, planning the next meet-up, planning the future, and staying close
when they're apart.

Run it: open `intimacy/index.html` over HTTPS (or `localhost`). There's no build step.

---

## 1. Couple trends for 2026–2027 and how the game responds

This analysis comes from patterns in couple apps, dating culture and sexual-wellness
products. No paid market data was used. Treat the points as design bets to check with
real users, not as statistics.

| # | Trend | What it means for couples | Feature that answers it |
|---|-------|---------------------------|-------------------------|
| 1 | **Long-distance and hybrid relationships are normal.** Remote work, study abroad and jobs in other cities (Gulf, Bangalore, Europe for Indian couples) mean many couples spend weeks apart. | They want to *do* things together on a call, not only talk. | **Live rooms**: two phones connect peer-to-peer, every game syncs, plus **video call, voice call, chat and reactions** inside the game. Mission decks have a "Long distance" mode. |
| 2 | **Consent-first is mainstream.** Gen Z and younger millennials expect consent to be part of the design. | Spicy content only works if both people feel safe saying no. | A **safe word** set at setup and a 🛑 button on every game that pauses *both* phones and shows aftercare. **Skip is always free.** 🚫 hides a card forever. **Heat levels** can be turned down by either partner. |
| 3 | **"Desire matching" instead of awkward asking.** Yes/No/Maybe lists from sex therapy have gone viral. | People want to find shared fantasies without risking rejection. | **Desire Match**: each partner swipes privately, and only *mutual* yes/maybe shows. A "no" is never revealed. Positions use the same rule: "Both want ✨" only. |
| 4 | **Gamified relationship rituals.** Streaks, daily prompts and couple quizzes (as in Paired and Agapé) keep couples coming back. | Small daily habits matter more than big gestures. | **Daily spark**, a **day streak 🔥**, **love points**, a bucket-list progress bar, and a daily future-planning prompt. |
| 5 | **Intentional dating and planned intimacy.** Busy couples schedule date nights. In 2026–27, "planned spontaneity" is seen as romantic, not boring. | They plan the next meet-up, and the anticipation is part of the fun. | **Next meet-up** planner: live countdown, place, vibe, dress code, secret notes, a checklist of things to bring, a positions playlist and **calendar export (.ics)**. |
| 6 | **Sexual wellness without shame.** Toys, education and "pleasure literacy" are now mainstream retail. | Couples want to explore new things, with guidance that's tasteful rather than porn-like. | **Position Planner**: 22 positions with plain, non-graphic descriptions, plus difficulty, intimacy and energy meters. Want/Pass/Tried tracking, a "Tonight's playlist" and "Surprise us". Locked below Spicy heat. |
| 7 | **Privacy anxiety.** Leaks, shared phones, family members picking up your phone (very real in India). | No account, no cloud copy, and a fast way to hide the app. | **No sign-up, no server database.** Data stays on the phone. Live play is end-to-end WebRTC. **🙈 / Esc instantly shows a fake "Notes" screen** and turns the camera off. **PIN lock.** Discreet backup filename. |
| 8 | **Future-building as intimacy.** Couples talk money, housing, kids and travel earlier and more openly. | Shared goals bring couples closer, not only sex. | **Future board**: dreams by category (Travel, Home, Money, Family, Career, Us) and horizon (this year, 1–3 years, 5+ years). Daily "talk about tonight" prompts. |
| 9 | **Experiences over things.** A "core memory" culture. | Couples collect firsts. | **Hot experiences bucket list** from sweet to wild, dated when done, and you can add your own. |
| 10 | **Inclusive by default.** | Every couple should see themselves in the game. | All copy is gender-neutral ("you / your partner"), and both names are customisable. |

## 2. Core loop

```
Open app → Daily spark + countdown to next meet-up
   → Play (Truth or Dare / Dice / Desire Match …) → earn love points, keep streak
   → Discoveries feed the planner (matches, positions you both want, missions, fantasies)
   → Plan the next meet-up (positions playlist, notes, calendar)
   → Meet / video call → tick bucket list → repeat
```

Everything you discover in a game can be **📌 saved to the meet-up plan**, so play turns
into plans, and plans give you a reason to come back.

## 3. Heat system

| Level | Name | Unlocks |
|-------|------|---------|
| 1 | 🌸 Sweet | Romance, memories, connection |
| 2 | 💋 Flirty | Kissing, teasing, flirty dares |
| 3 | 🌶️ Spicy | Clothes optional, the position planner |
| 4 | 😈 Wild | Fantasies, control games, toys, role-play |

Cards come from the chosen heat 70% of the time and from lower heats 30% of the time,
so the mood builds. Both phones always share the same heat. Lowering it is one tap,
including from the pause screen.

## 4. Games (8)

1. **Truth or Dare** — turns, +5 for a truth, +10 for a dare, free skip, hide forever.
2. **Desire Match** — private Yes/Maybe/No swipes, mutual matches only.
3. **Sexy Dice** — action × body spot × duration.
4. **Naughty Date Dares** — missions for home, going out, or long distance. Save to the meet-up.
5. **Never Have I Ever** — both answer secretly, then reveal together.
6. **Would You Rather** — secret picks. Matching picks = +5 each.
7. **Hot Seat** — 60-second rapid fire, 2 points per answer.
8. **Fantasy Builder** — setting, roles, mood and rule. Re-roll any part, then save to the plan.

## 5. Multiplayer

- **Same phone**: pass and play. Private screens (Desire Match, positions) have a "who is
  voting" switch with a "no peeking" reminder.
- **Two phones**: one partner taps *Create a room* and shares the 6-letter code or invite
  link. The other partner joins. The phones connect directly with WebRTC (PeerJS). Game
  state, chat, reactions, the pause signal, voice and video all travel over that link.
  When one partner opens a game, the other phone follows.
- The room creator's board is the shared copy. Changes are sent as small path updates,
  so both partners can vote at the same time without overwriting each other.
- Values from the partner's phone are treated as untrusted. Text is HTML-escaped, numbers
  are converted to numbers, and only known keys are accepted.

## 6. Production checklist (before a public launch)

- **Signaling server**: the default is the free public PeerJS server. For reliability, run
  your own (`npx peerjs --port 9000`, or deploy the `peer` npm package) and enter it under
  Connect → Advanced, or pass `?signal=https://your-server` in the URL.
- **TURN server**: about 10–20% of mobile networks block direct peer-to-peer connections.
  Add a TURN server (coturn, Cloudflare Calls TURN or Twilio) under Connect → Advanced so
  calls connect everywhere.
- **Hosting**: any static HTTPS host (Vercel, Netlify, Cloudflare Pages). Camera and
  microphone access needs HTTPS.
- **App stores**: Google Play and the App Store allow sexual-wellness and couples apps but
  ban explicit sexual content. Keep the copy suggestive, not graphic (as it is now), mark
  the app 18+/Mature, and add a privacy policy. A store build can wrap this folder with
  Capacitor, which the repo already uses for EasyWay.
- **Legal**: add an age confirmation (done), terms, a privacy policy, and a grievance
  officer for Indian IT Rules if the app collects any data later.

## 7. Monetisation ideas

- **Free**: Sweet and Flirty decks, 2 games, same-phone play.
- **Premium (₹199/month or ₹999/year per couple, one purchase unlocks both phones)**:
  Spicy and Wild decks, all games, live rooms with video, the position planner, unlimited
  bucket and future items.
- **Seasonal packs**: Valentine's, Honeymoon, Anniversary, Monsoon nights, Long-distance survival.
- **Affiliate links (opt-in)**: wellness products, hotel staycations, date experiences.

## 8. Roadmap

- Couple quiz ("How well do you know me") with a synced score.
- Shared photo memory wall (end-to-end encrypted).
- Push reminders before meet-ups (requires a native wrapper).
- Hindi and Malayalam card decks.
- AI-generated personalised dares based on Desire Match results (on-device or opt-in).
