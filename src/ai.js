// Local AI assistant.
//
// Two engines, both on the user's device:
//  1. A built-in rule engine (always available, works offline).
//  2. An optional local LLM via Ollama (http://localhost:11434) for free-form
//     language. Its answer must be the same JSON action shape; anything else
//     falls back to the rule engine.
//
// Action shape: { intent, params, reply }
//   intent: 'nearby' | 'search' | 'breakdown' | 'route' | 'avoid_tolls' | 'hotspots' | 'report_jam' | 'help'

const NEED_WORDS = [
  ['puncture', /punct|flat|tyre|tire|tube|air\b/],
  ['battery', /battery|won'?t start|not starting|self start|jump/],
  ['fuel', /fuel|petrol|diesel|gas station|out of gas|empty tank/],
  ['ev', /\bev\b|charg|electric/],
  ['towing', /tow|crane|accident|crash|stuck/],
  ['mechanic', /mechanic|workshop|garage|repair|breakdown|broke|engine|overheat|clutch|brake|noise|smoke/],
];

// Nearby place categories (keys match places.js CATEGORIES). Order matters:
// "police station" is police, "medical shop" is a pharmacy, "bathroom" is a toilet.
const PLACE_WORDS = [
  ['police', /police|thief|stolen|robbery|theft/],
  ['pharmacy', /pharmac|medical (shop|store)|chemist|medicine|tablets?\b|drug ?store/],
  ['hospital', /hospital|clinic|doctor|ambulance|emergency room|casualty|medical college|health cent|injur|bleed|chest pain|heart attack|fever/],
  ['bus', /bus (stand|station|stop)|ksrtc/],
  ['train', /railway|train\b/],
  ['toilet', /toilet|washroom|restroom|bathroom|urinal/],
  ['parking', /parking|park (my|the) (car|bike|vehicle)/],
  ['atm', /\batm\b|\bcash\b|\bbank\b/],
  ['stay', /lodge|\bstay\b|hotel room|room for|resort|guest ?house|hostel|place to sleep/],
  ['food', /\bfood\b|restaurant|\beat\b|hungry|biryani|meals|\btea\b|coffee|\bcafe|snacks?|\bhotel\b|bakery/],
  ['grocery', /supermarket|grocer|provision|convenience store/],
  ['worship', /temple|church|mosque|masjid|\bpray/],
];

export function detectPlace(text) {
  const t = text.toLowerCase();
  for (const [category, re] of PLACE_WORDS) if (re.test(t)) return category;
  return null;
}

const PLACE_REPLY = {
  hospital: 'Scanning for hospitals and clinics near you. For an emergency, call 108 (ambulance) or 112.',
  police: 'Scanning for police stations near you. In an emergency, call 112.',
};

export function detectNeed(text) {
  const t = text.toLowerCase();
  for (const [need, re] of NEED_WORDS) if (re.test(t)) return need;
  return null;
}

export function detectVehicle(text) {
  const t = text.toLowerCase();
  if (/bike|scooter|scooty|motorcycle|two.?wheeler|activa|splendor/.test(t)) return 'bike';
  if (/truck|lorry|bus|tempo/.test(t)) return 'truck';
  if (/car|jeep|suv|four.?wheeler/.test(t)) return 'car';
  return null;
}

export function ruleEngine(text) {
  const t = text.trim().toLowerCase();
  const avoid = /avoid(ing)?\s+tolls?|no\s+tolls?|without\s+tolls?|toll.?free/.test(t);

  const routeTo = (verbs) =>
    t.match(new RegExp(`\\b(?:${verbs})\\s+(?:to\\s+)?(.+?)(?:\\s+(?:avoid(?:ing)?|without|no)\\s+tolls?.*)?$`));
  const routeAction = (m) => {
    const destination = m[1].replace(/^the\s+/, '').trim();
    return {
      intent: 'route',
      params: { destination, avoidTolls: avoid },
      reply: `Finding the easiest route to ${destination}${avoid ? ' without tolls' : ''}. I'll rank routes by predicted traffic, not just distance.`,
    };
  };

  // "hospital near me", "nearest ATM", "take me to a hospital": scan nearby.
  // A named place ("route to KIMS hospital") is a route instead.
  const place = detectPlace(t);
  const strong = routeTo('route|navigate|directions?|take me|drive');
  const named = strong && strong[1].replace(/\b(the|a|an|nearest|nearby|closest|near|me|any|some|good|to)\b/g, '').trim().split(/\s+/).length > 1;
  if (place && !named) {
    const label = place === 'atm' ? 'ATMs and banks' : place;
    return {
      intent: 'nearby',
      params: { category: place },
      reply: PLACE_REPLY[place] || `Scanning for ${label} near you…`,
    };
  }

  // "find Lulu mall near me": search that name around you.
  const near = t.match(/^(?:find|search|show|where is|where's|any|is there an?)?\s*(?:me\s+)?(?:the\s+|a\s+|an\s+)?(.+?)\s+(?:near me|nearby|near here|around me|around here|close by)\??$/);
  if (near && !detectNeed(t)) {
    return { intent: 'search', params: { query: near[1] }, reply: `Looking for "${near[1]}" near you…` };
  }

  // Explicit navigation wins; a loose "go to ..." loses to a breakdown need,
  // so "go to a petrol pump" searches for fuel instead of geocoding it.
  if (strong) return routeAction(strong);

  const need = detectNeed(t);
  const weak = need ? null : routeTo('go|reach');
  if (weak) return routeAction(weak);

  if (need) {
    const vehicle = detectVehicle(t);
    return {
      intent: 'breakdown',
      params: { need, vehicle },
      reply: `Stay safe: move to the side and switch on hazard lights. Searching for the nearest ${need === 'mechanic' ? 'mechanic' : need} help now.`,
    };
  }

  if (avoid || /toll/.test(t)) {
    const off = /allow|use|with\s+tolls?|don'?t avoid/.test(t) && !avoid;
    return {
      intent: 'avoid_tolls',
      params: { on: !off },
      reply: off ? 'Toll roads allowed again.' : 'Toll avoidance is on. Routes will skip toll roads where possible.',
    };
  }

  if (/traffic|jam|block|rush|hotspot|congest/.test(t)) {
    if (/report|here|stuck in/.test(t)) {
      return { intent: 'report_jam', params: {}, reply: 'Thanks, jam reported at the map centre. Routes will avoid it for the next hour.' };
    }
    return { intent: 'hotspots', params: {}, reply: 'Showing traffic hotspots around you. Red = heavy, orange = moderate, yellow = light.' };
  }

  return {
    intent: 'help',
    params: {},
    reply:
      'I can help with: "hospital near me", "nearest ATM", "route to Coimbatore avoiding tolls", "my bike tyre is punctured", "need petrol", "report a jam here".',
  };
}

const SYSTEM_PROMPT = `You are the in-car assistant of a navigation app in India.
Reply ONLY with JSON: {"intent": string, "params": object, "reply": string}.
intents:
- "nearby": params {"category": one of hospital|pharmacy|police|atm|food|stay|grocery|toilet|parking|bus|train|worship|fuel|ev} (user wants the nearest places of a kind)
- "search": params {"query": place name} (a named place near the user)
- "route": params {"destination": place name, "avoidTolls": boolean}
- "breakdown": params {"need": one of mechanic|puncture|battery|fuel|ev|towing, "vehicle": car|bike|truck|null}
- "avoid_tolls": params {"on": boolean}
- "hotspots": params {}
- "report_jam": params {}
- "help": params {}
"reply" is one or two short, calm sentences for the driver. For breakdowns, include one safety tip.`;

const INTENTS = new Set(['nearby', 'search', 'route', 'breakdown', 'avoid_tolls', 'hotspots', 'report_jam', 'help']);

export async function askOllama(text, { ollamaUrl, ollamaModel }, context = '') {
  const res = await fetch(`${ollamaUrl.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: ollamaModel,
      stream: false,
      format: 'json',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + (context ? `\nContext: ${context}` : '') },
        { role: 'user', content: text },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}`);
  const json = await res.json();
  const action = JSON.parse(json.message?.content || '{}');
  if (!INTENTS.has(action.intent)) throw new Error('Unrecognised LLM answer');
  action.params = action.params || {};
  action.reply = String(action.reply || '');
  return action;
}

export async function interpret(text, settings, context) {
  if (settings.useOllama) {
    try {
      return { ...(await askOllama(text, settings, context)), engine: 'ollama' };
    } catch {
      // fall through to the on-device rules
    }
  }
  return { ...ruleEngine(text), engine: 'rules' };
}

// Short route advice shown above the route list.
export function routeTip(ranked, now = new Date()) {
  if (!ranked.length) return '';
  const best = ranked[0];
  const fastest = [...ranked].sort((a, b) => a.duration - b.duration)[0];
  const h = now.getHours();
  const peak = (h >= 8 && h < 11) || (h >= 17 && h < 20);
  const parts = [];
  if (best !== fastest && fastest.total - best.total > 60) {
    const saved = Math.round((fastest.total - best.total) / 60);
    parts.push(`Take the ${best.label.toLowerCase()} route: about ${saved} min quicker than the main road once traffic is counted.`);
  } else if (best.hotspots.length === 0) {
    parts.push('Your best route is clear of known traffic hotspots.');
  } else {
    parts.push(`Best route still passes ${best.hotspots.length} hotspot${best.hotspots.length > 1 ? 's' : ''}; expect short slowdowns.`);
  }
  if (peak) parts.push('It is peak hour, so signals and railway gates are weighted heavier right now.');
  return parts.join(' ');
}
