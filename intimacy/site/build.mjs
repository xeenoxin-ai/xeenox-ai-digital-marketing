// Builds the public website into intimacy/dist:
//   /            landing page
//   /play/       the game (app/)
//   /<guide>/    SEO guide pages generated from the same card decks the game uses
//   sitemap.xml, robots.txt, privacy, terms, 404
// Usage: SITE_URL=https://intimacycouple.com node intimacy/site/build.mjs
import { mkdirSync, rmSync, readFileSync, writeFileSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as C from '../app/content.js';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = join(ROOT, 'dist');
export const SITE_URL = (process.env.SITE_URL || 'https://intimacycouple.xeenox-in.workers.dev').replace(/\/$/, '');
const BRAND = 'Intimacy for Couples';
const TODAY = new Date().toISOString().slice(0, 10);

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const heatName = (h) => `${C.HEAT[h - 1].icon} ${C.HEAT[h - 1].name}`;
const byHeat = (arr, h) => arr.filter((x) => x[0] === h).map((x) => x[x.length - 1]);

// ---------- page shell ----------
function page({ path, title, description, h1, intro, body, faq = [], adult = false, schema = [], crumbs = true }) {
  const url = SITE_URL + path;
  const ld = [
    ...schema,
    crumbs && path !== '/' ? { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
      { '@type': 'ListItem', position: 2, name: h1, item: url },
    ] } : null,
    faq.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) } : null,
  ].filter(Boolean);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
${adult ? '<meta name="rating" content="adult">\n' : ''}<meta name="theme-color" content="#16060f">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE_URL}/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/play/icon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/site.css">
${ld.map((x) => `<script type="application/ld+json">${JSON.stringify(x)}</script>`).join('\n')}
</head>
<body>
<header class="nav"><a class="logo" href="/">💗 <b>Intimacy</b> for Couples</a><a class="cta sm" href="/play/">Play free</a></header>
<main>
${crumbs && path !== '/' ? `<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> › <span>${esc(h1)}</span></nav>` : ''}
<h1>${h1}</h1>
${intro ? `<p class="lead">${intro}</p>` : ''}
${body}
${faq.length ? `<section><h2>Frequently asked questions</h2>${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>` : ''}
<section class="band"><h2>Play it together — free</h2><p>Truth or dare, desire match, spicy talk, sex dice, a position planner and date plans in one private app. Same phone or miles apart with live video.</p><a class="cta" href="/play/">Start playing 💞</a></section>
${related(path)}
</main>
<footer><p><b>${BRAND}</b> is for consenting adults 18+. No sign-up, no tracking; your games stay on your phones.</p>
<p><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="/play/">Play</a> · A Xeenox product</p></footer>
</body>
</html>`;
}

const GUIDES = [];
function related(path) {
  const links = GUIDES.filter((g) => g.path !== path);
  return `<section><h2>More for couples</h2><ul class="related">${links.map((g) => `<li><a href="${g.path}">${esc(g.h1)}</a></li>`).join('')}</ul></section>`;
}
const cardList = (items) => `<ol class="cards">${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>`;

// ---------- guide pages ----------
GUIDES.push({
  path: '/truth-or-dare-for-couples/',
  title: 'Truth or Dare for Couples: 100+ Spicy Questions & Dares (18+)',
  description: 'The best truth or dare questions for couples — sweet, flirty, spicy and wild. 100+ truths and dares to play in bed, on a date or over video call.',
  h1: 'Truth or Dare for Couples',
  intro: `${C.TRUTHS.length} truths and ${C.DARES.length} dares, sorted from sweet to wild, so you can turn the heat up together. Read them here or play them in the free app, where turns, points and skips are handled for you.`,
  adult: true,
  body: `<section><h2>How to play truth or dare as a couple</h2>
<ol><li><b>Pick a heat level together.</b> Start lower than you think — you can always turn it up.</li>
<li><b>Agree on a safe word.</b> If either of you says it, the game pauses. No questions asked.</li>
<li><b>Take turns.</b> Choose truth or dare. Skipping is always allowed — this is about fun, not pressure.</li>
<li><b>Keep score if you like.</b> In the app, a truth is +5 and a dare is +10 love points.</li></ol></section>
${[1, 2, 3, 4].map((h) => `<section><h2>${heatName(h)} truths</h2>${cardList(byHeat(C.TRUTHS, h))}<h2>${heatName(h)} dares</h2>${cardList(byHeat(C.DARES, h))}</section>`).join('')}`,
  faq: [
    ['How do you play truth or dare as a couple?', 'Take turns choosing truth (answer a question honestly) or dare (do a challenge). Pick a heat level you are both comfortable with, agree a safe word, and remember either of you can skip any card.'],
    ['Can we play truth or dare over video call?', 'Yes. In Intimacy for Couples, connect two phones with your Love Numbers and the same card appears on both screens while you are on a video or voice call.'],
    ['Is this game free?', 'Yes, the game is free to play in your browser with no sign-up.'],
  ],
});

GUIDES.push({
  path: '/sex-positions-for-couples/',
  title: `${C.POSITIONS.length} Sex Positions for Couples (With Difficulty & Intimacy Ratings)`,
  description: `${C.POSITIONS.length} sex positions explained simply, with difficulty, intimacy and energy ratings. Find positions you both want and plan your next night together.`,
  h1: 'Sex Positions for Couples',
  intro: `Every position below is explained in plain, non-graphic language with three ratings: how hard it is, how intimate it feels, and how much energy it takes. In the app you each mark Want or Pass in private — only the ones you <b>both</b> want are revealed.`,
  adult: true,
  body: `<section><h2>Before you try something new</h2><ul>
<li>Talk first and agree you can stop or switch at any moment.</li>
<li>Pillows help almost every position: under hips, knees or stomach.</li>
<li>Use lube, go slow with deeper positions, and stretch before athletic ones.</li></ul></section>
<section><h2>All positions</h2><div class="pos">${C.POSITIONS.map((p) => `<article><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p><p class="meter">Difficulty ${'●'.repeat(p.diff)}${'○'.repeat(3 - p.diff)} · Intimacy ${'♥'.repeat(p.intimacy)}${'♡'.repeat(3 - p.intimacy)} · Energy ${'⚡'.repeat(p.energy)}</p></article>`).join('')}</div></section>
<section><h2>Most intimate positions</h2>${cardList(C.POSITIONS.filter((p) => p.intimacy === 3).map((p) => p.name))}</section>
<section><h2>Easy positions for beginners</h2>${cardList(C.POSITIONS.filter((p) => p.diff === 1).map((p) => p.name))}</section>`,
  faq: [
    ['What is the most intimate sex position?', 'Face-to-face positions such as the Lotus, Missionary Plus, the Slow Grind and Tantric Breath are rated most intimate because of eye contact and full-body closeness.'],
    ['How do we choose positions without awkwardness?', 'Use a private Want/Pass vote. In Intimacy for Couples each partner votes on their own phone and only positions you both want are shown, so nobody feels rejected.'],
    ['What if a position hurts?', 'Stop and switch. Pain is a signal, not something to push through. If pain keeps happening, talk to a doctor.'],
  ],
});

GUIDES.push({
  path: '/sex-tips-for-couples/',
  title: 'Sex Tips for Couples: Communication, Foreplay, Long Distance & More',
  description: 'Practical, judgement-free sex tips for couples: how to talk about sex, better foreplay, more pleasure, long-distance intimacy, health and aftercare.',
  h1: 'Sex Tips for Couples',
  intro: 'Short, practical tips that actually help — written for every kind of couple. Great sex is mostly great communication, so that is where we start.',
  adult: true,
  body: C.TIPS.map((c) => `<section><h2>${c.icon} ${esc(c.cat)}</h2>${cardList(c.items)}</section>`).join('') + '<p class="note">General wellness information, not medical advice.</p>',
  faq: [
    ['How can couples talk about sex more easily?', 'Talk outside the bedroom, start with praise ("I love it when you…"), and use tools like a private yes/no/maybe list so you discover shared desires without pressure.'],
    ['How do long-distance couples stay intimate?', 'Scheduled video dates, voice notes, playing couple games together on a call, and countdowns to the next meet-up keep desire and connection alive.'],
  ],
});

GUIDES.push({
  path: '/couple-games-online/',
  title: 'Couple Games Online: Free Romantic & Spicy Games for Two',
  description: 'Free online couple games: truth or dare, spicy talk, desire match, sex dice, never have I ever, would you rather and more. Play on one phone or two.',
  h1: 'Couple Games Online',
  intro: 'Ten games built for two people who like each other a lot. Play on one phone, or connect two phones anywhere in the world.',
  body: `<section><h2>The games</h2><div class="pos">${[
    ['🎭 Truth or Dare', `${C.TRUTHS.length + C.DARES.length} cards across four heat levels, with turns and love points.`],
    ['🗣️ Spicy Talk', 'Write what you are thinking about each other. Every 🔥 from your partner is +10 points — find out who the bigger talker is.'],
    ['💞 Desire Match', 'Swipe yes, maybe or no in private. Only things you both want are revealed.'],
    ['🎲 Sexy Dice', 'Roll an action, a body spot and a time.'],
    ['🌙 Naughty Date Dares', 'Missions for at home, a night out or long distance.'],
    ['🙈 Never Have I Ever', 'Answer in secret, reveal together.'],
    ['⚖️ Would You Rather', 'Matching answers score for both of you.'],
    ['⏱️ Hot Seat', '60 seconds of rapid-fire questions.'],
    ['✨ Fantasy Builder', 'Setting, roles, mood and a rule — spin your scenario.'],
    ['📚 Sex Tips', 'Short, practical advice for better intimacy.'],
  ].map(([t, d]) => `<article><h3>${t}</h3><p>${d}</p></article>`).join('')}</div></section>
<section><h2>Why couples love it</h2><ul><li>No sign-up, no email, no phone number.</li><li>Heat levels from sweet to wild — either partner can turn it down.</li><li>A safe word and pause button on every game.</li><li>Live video and voice calls built in for long distance.</li></ul></section>`,
  faq: [['Can we play couple games on two different phones?', 'Yes. Swap Love Numbers once and your phones reconnect automatically every time, with synced games, chat and video calls.']],
});

GUIDES.push({
  path: '/long-distance-relationship-games/',
  title: 'Long Distance Relationship Games to Play Over Video Call',
  description: 'Games for long distance couples to play over video call: synced truth or dare, spicy talk, desire match and date missions — free, with built-in video chat.',
  h1: 'Long Distance Relationship Games',
  intro: 'Miles apart should not mean nothing to do on a call. Connect two phones with Love Numbers and play the same game at the same time, with a video or voice call running.',
  body: `<section><h2>How it works</h2><ol><li>Open the app on both phones. Each of you gets an 8-digit Love Number.</li><li>One of you enters the other's number; the other taps Accept.</li><li>From then on your phones reconnect automatically — start a video call and play.</li></ol></section>
<section><h2>Long-distance date missions</h2>${cardList(C.DATE_DARES.filter((d) => d[1] === 'ldr').map((d) => d[2]))}</section>
<section><h2>Tips for long-distance intimacy</h2>${cardList(C.TIPS.find((t) => t.cat === 'Long distance').items)}</section>`,
  faq: [['Is the video call private?', 'Video and voice go directly between your two phones using WebRTC encryption. Nothing is recorded or stored on our server.']],
});

GUIDES.push({
  path: '/never-have-i-ever-for-couples/',
  title: 'Never Have I Ever for Couples: Flirty & Dirty Questions',
  description: 'Never have I ever questions for couples, from cute to dirty. Play in secret and reveal together in the free app.',
  h1: 'Never Have I Ever for Couples',
  intro: 'Both of you answer in secret, then the answers reveal together — the best way to learn new things about each other.',
  adult: true,
  body: [1, 2, 3, 4].map((h) => `<section><h2>${heatName(h)}</h2>${cardList(byHeat(C.NEVER, h))}</section>`).join(''),
});

GUIDES.push({
  path: '/would-you-rather-for-couples/',
  title: 'Would You Rather Questions for Couples (Romantic to Spicy)',
  description: 'Would you rather questions for couples — romantic, flirty and spicy. Pick in secret; matching answers score points.',
  h1: 'Would You Rather for Couples',
  intro: 'Pick in secret, reveal together. Matching answers score for both of you.',
  adult: true,
  body: [1, 2, 3, 4].map((h) => `<section><h2>${heatName(h)}</h2>${cardList(byHeat(C.RATHER, h))}</section>`).join(''),
});

GUIDES.push({
  path: '/date-night-ideas/',
  title: 'Date Night Ideas for Couples: Romantic, Spicy & At-Home',
  description: 'Date night ideas for couples — at home, going out or long distance — plus naughty date dares to make the night unforgettable.',
  h1: 'Date Night Ideas for Couples',
  intro: 'Romantic, playful and steamy date ideas, each with a mission to make it memorable. Plan it with a countdown in the app.',
  adult: true,
  body: [['home', '🏠 At home'], ['out', '🌃 Going out'], ['ldr', '📱 Long distance']].map(([k, l]) => `<section><h2>${l}</h2>${cardList(C.DATE_DARES.filter((d) => d[1] === k).map((d) => d[2]))}</section>`).join('')
    + `<section><h2>Bucket list for couples</h2>${cardList(C.BUCKET.map((b) => b[1]))}</section>`,
});

GUIDES.push({
  path: '/questions-for-couples/',
  title: 'Deep Questions for Couples: Love, Future & Intimacy',
  description: 'Questions for couples to get closer: romantic questions, flirty questions and future-planning questions about home, money, travel and family.',
  h1: 'Questions for Couples',
  intro: 'From "when did you know?" to "where do we want to live?" — questions that bring you closer.',
  body: `<section><h2>💗 Romantic questions</h2>${cardList(byHeat(C.TRUTHS, 1))}</section>
<section><h2>💋 Flirty questions</h2>${cardList(byHeat(C.TRUTHS, 2))}</section>
<section><h2>🔮 Future-planning questions</h2>${cardList(C.FUTURE_PROMPTS)}</section>`,
});

// ---------- landing ----------
function landing() {
  const games = ['🎭 Truth or Dare', '🗣️ Spicy Talk', '💞 Desire Match', '🎲 Sexy Dice', '🌙 Date Dares', '🙈 Never Have I Ever', '⚖️ Would You Rather', '⏱️ Hot Seat', '✨ Fantasy Builder', '📚 Sex Tips'];
  return page({
    path: '/',
    title: 'Intimacy for Couples — Spicy Couple Games, Truth or Dare & Date Planner',
    description: 'The private game for couples: truth or dare, spicy talk, desire match, sex positions planner, date nights and live video calls for long distance. Free, 18+.',
    h1: 'Get closer. Play together. 💞',
    intro: 'Intimacy for Couples is a free, private game for two: flirty and spicy games, a sex-position planner, meet-up countdowns and future plans — on one phone or across the world with live video.',
    crumbs: false,
    schema: [
      { '@context': 'https://schema.org', '@type': 'WebSite', name: BRAND, url: SITE_URL + '/' },
      { '@context': 'https://schema.org', '@type': 'Organization', name: 'Xeenox', logo: SITE_URL + '/play/icon.svg' },
      { '@context': 'https://schema.org', '@type': 'WebApplication', name: BRAND, url: SITE_URL + '/play/', applicationCategory: 'GameApplication', operatingSystem: 'Any (web browser)', isFamilyFriendly: false, contentRating: '18+',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }, description: 'Couple games, desire match, position planner, date plans and live video calls for couples.' },
    ],
    body: `<p><a class="cta" href="/play/">Play free — no sign-up</a></p>
<section class="features">
<article><h3>🎲 10 couple games</h3><p>${games.join(' · ')}</p></article>
<article><h3>🌡️ 4 heat levels</h3><p>Sweet, Flirty, Spicy and Wild. Either partner can turn it down any time.</p></article>
<article><h3>🗣️ Spicy Talk scores</h3><p>Every message your partner loves earns you points. Who is the bigger talker?</p></article>
<article><h3>🌙 Position planner</h3><p>${C.POSITIONS.length} positions with private Want/Pass votes. Only mutual matches show.</p></article>
<article><h3>📅 Meet-up planner</h3><p>Countdown, plans, outfit, checklist and tonight's playlist — straight into your calendar.</p></article>
<article><h3>📹 Video & voice</h3><p>Long distance? Swap Love Numbers once and play live with built-in calls.</p></article>
<article><h3>🔮 Future & bucket list</h3><p>Plan travel, home, money and family — and tick off hot experiences together.</p></article>
<article><h3>🔒 Private by design</h3><p>No email or phone number. A safe word, PIN lock and one-tap hide.</p></article>
</section>
<section><h2>How it works</h2><ol><li>Open <a href="/play/">the game</a> and enter your names.</li><li>Play on one phone — or share your Love Number and connect two phones.</li><li>Play, plan your next night together, and keep your streak alive.</li></ol></section>
<section><h2>Guides</h2><ul class="related">${GUIDES.map((g) => `<li><a href="${g.path}">${esc(g.h1)}</a></li>`).join('')}</ul></section>`,
    faq: [
      ['Is Intimacy for Couples free?', 'Yes. All games are free to play in your web browser with no sign-up.'],
      ['Do we need to create an account?', 'No. There is no email, password or phone number. To play on two phones you just exchange an 8-digit Love Number generated by the app.'],
      ['Is it private?', 'Your games, answers and chats stay on your own phones. The server only passes live messages between your two phones and never stores them. Video and voice go directly phone-to-phone.'],
      ['Who is it for?', 'Consenting adult couples (18+) of every kind — the wording is gender-neutral.'],
    ],
  });
}

function legal(path, h1, html) {
  return page({ path, title: `${h1} — ${BRAND}`, description: `${h1} for ${BRAND}.`, h1, body: html });
}

// ---------- write ----------
function write(path, html) {
  const dir = join(OUT, path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}
function copyDir(src, dst, transform) {
  mkdirSync(dst, { recursive: true });
  for (const f of readdirSync(src, { withFileTypes: true })) {
    const s = join(src, f.name), d = join(dst, f.name);
    if (f.isDirectory()) copyDir(s, d, transform);
    else if (/\.(html|js|webmanifest|css)$/.test(f.name)) writeFileSync(d, transform(readFileSync(s, 'utf8')));
    else copyFileSync(s, d);
  }
}

// Embed every built file into worker/site.generated.js so one Worker serves the whole site.
const TYPES = { html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', js: 'text/javascript; charset=utf-8', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', json: 'application/json', webmanifest: 'application/manifest+json', xml: 'application/xml; charset=utf-8', txt: 'text/plain; charset=utf-8' };
function bundle() {
  const files = {};
  const walk = (dir, rel) => {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, f.name), r = rel + '/' + f.name;
      if (f.isDirectory()) { walk(abs, r); continue; }
      const ext = f.name.split('.').pop();
      if (!TYPES[ext]) continue;
      const binary = ext === 'png' || ext === 'jpg';
      files[r] = { type: TYPES[ext], b64: binary, body: binary ? readFileSync(abs).toString('base64') : readFileSync(abs, 'utf8') };
    }
  };
  walk(OUT, '');
  writeFileSync(join(ROOT, 'worker', 'site.generated.js'), '// Generated by site/build.mjs — do not edit.\nexport default ' + JSON.stringify(files) + ';\n');
}

export function build() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  copyDir(join(ROOT, 'app'), join(OUT, 'play'), (t) => t.replaceAll('https://intimacycouple.com', SITE_URL));
  copyFileSync(join(ROOT, 'site', 'site.css'), join(OUT, 'site.css'));
  if (existsSync(join(ROOT, 'site', 'og.jpg'))) copyFileSync(join(ROOT, 'site', 'og.jpg'), join(OUT, 'og.jpg'));
  write('/', landing());
  for (const g of GUIDES) write(g.path, page(g));
  write('/privacy/', legal('/privacy/', 'Privacy Policy', `
<p>Last updated ${TODAY}.</p>
<h2>What we collect</h2><ul>
<li><b>Nothing to play on one phone.</b> Names, answers, votes, plans and chats are saved only in your browser's storage on your device.</li>
<li><b>Love Number (optional).</b> To connect two phones we store a random 8-digit number, the first name you entered, a hashed secret key, and which numbers are paired. No email, phone number, location or contacts.</li></ul>
<h2>Live play</h2><p>Game moves and chat messages pass through our server only to reach your partner's phone in real time; they are not stored or logged. Voice and video calls go directly between your phones using WebRTC encryption (or through an encrypted relay if your network requires it).</p>
<h2>No ads, no tracking</h2><p>We use no advertising, analytics cookies or third-party trackers.</p>
<h2>Deleting your data</h2><p>Use Connect → Erase everything in the app. To also delete your Love Number from our server, unpair first, then erase; or contact us.</p>
<h2>Age</h2><p>This service is only for adults 18 and over.</p>
<h2>Contact</h2><p>Xeenox, Palakkad, Kerala, India.</p>`));
  write('/terms/', legal('/terms/', 'Terms of Use', `
<p>Last updated ${TODAY}.</p>
<ul><li>You must be 18 or older and use the service only with a consenting adult partner.</li>
<li>Everything in the game is optional. Consent can be withdrawn at any time; respect your partner's "no" and safe word.</li>
<li>Do not share intimate images or messages of anyone without their explicit consent. Doing so may be a crime.</li>
<li>Tips are general information, not medical advice.</li>
<li>The service is provided "as is", free of charge, without warranties. We may change or stop it at any time.</li>
<li>Do not misuse the service: no harassment, spam, or attempts to access other people's rooms or numbers.</li></ul>`));
  writeFileSync(join(OUT, '404.html'), page({ path: '/404', title: `Page not found — ${BRAND}`, description: 'Page not found.', h1: 'Lost? 💔', intro: 'That page does not exist. Try the game or one of the guides below.', body: '', crumbs: false }).replace('<link rel="canonical"', '<meta name="robots" content="noindex">\n<link rel="x-canonical"'));
  const urls = ['/', ...GUIDES.map((g) => g.path), '/privacy/', '/terms/'];
  writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc><lastmod>${TODAY}</lastmod><priority>${u === '/' ? '1.0' : u === '/privacy/' || u === '/terms/' ? '0.3' : '0.8'}</priority></url>`).join('\n')}\n</urlset>\n`);
  writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  bundle();
  return { pages: urls.length, out: OUT };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(build());
