// =============================================================
// GLOBLISH TRANSLATOR — single-file Cloudflare Worker
// (bundled for the Cloudflare dashboard's online editor)
// =============================================================

// dictionary.js
// Core Globlish <-> English dictionary.
// Each entry: english word -> { gl: "globlish word", pos: "noun|verb|adj|pronoun|prep|article|qword|number|adv|particle|interj" }
//
// NOTE ON AMBIGUITY: Globlish, as designed, reuses a few surface forms on
// purpose (e.g. "da" = both "the" and the past-tense marker; "wi" = both
// "we" and "with"; "gloop" = both "good" and the number 8). The grammar
// engine resolves these with position/context rules — see grammar.js.
// This is treated as a language feature, not a bug.

const DICTIONARY = {
  // ---- core vocabulary ----
  thing: { gl: "glop", pos: "noun" },
  good: { gl: "gloop", pos: "adj" },
  bad: { gl: "zorp", pos: "adj" },
  not: { gl: "nor", pos: "particle" },
  no: { gl: "nor", pos: "interj" },
  yes: { gl: "glob", pos: "interj" },
  person: { gl: "grup", pos: "noun" },
  friend: { gl: "blorp", pos: "noun" },
  weird: { gl: "zibble", pos: "adj" },
  understand: { gl: "gunder", pos: "verb" },
  dare: { gl: "deer", pos: "verb" },
  challenge: { gl: "deer", pos: "noun" },
  do: { gl: "plop", pos: "verb" },
  make: { gl: "plop", pos: "verb" },
  go: { gl: "vroop", pos: "verb" },
  see: { gl: "snerp", pos: "verb" },
  hear: { gl: "bloop", pos: "verb" },
  say: { gl: "florp", pos: "verb" },
  speak: { gl: "florp", pos: "verb" },
  know: { gl: "gronk", pos: "verb" },
  think: { gl: "wibble", pos: "verb" },
  foolish: { gl: "zorpel", pos: "adj" },
  stupid: { gl: "zorpel", pos: "adj" },
  excellent: { gl: "gloopor", pos: "adj" },
  how: { gl: "glor", pos: "qword" },
  why: { gl: "norp", pos: "qword" },
  where: { gl: "blap", pos: "qword" },
  when: { gl: "vreep", pos: "qword" },
  who: { gl: "gorp", pos: "qword" },
  what: { gl: "plorb", pos: "qword" },
  because: { gl: "frup", pos: "particle" },
  maybe: { gl: "snorp", pos: "adv" },
  very: { gl: "worp", pos: "adv" },
  really: { gl: "brrp", pos: "adv" },
  actually: { gl: "brrp", pos: "adv" },

  // ---- extended vocabulary ----
  house: { gl: "klop", pos: "noun" },
  home: { gl: "klop", pos: "noun" },
  family: { gl: "klorp", pos: "noun" },
  work: { gl: "truk", pos: "noun" },
  job: { gl: "truk", pos: "noun" },
  food: { gl: "mek", pos: "noun" },
  eat: { gl: "mekli", pos: "verb" },
  drink: { gl: "drek", pos: "verb" },
  sleep: { gl: "snuf", pos: "verb" },
  tired: { gl: "snufa", pos: "adj" },
  money: { gl: "bink", pos: "noun" },
  buy: { gl: "binkli", pos: "verb" },
  sell: { gl: "binkro", pos: "verb" },
  happy: { gl: "gloz", pos: "adj" },
  sad: { gl: "zorz", pos: "adj" },
  angry: { gl: "angz", pos: "adj" },
  afraid: { gl: "skar", pos: "adj" },
  scared: { gl: "skar", pos: "adj" },
  love: { gl: "luv", pos: "verb" },
  hate: { gl: "hayt", pos: "verb" },
  walk: { gl: "troop", pos: "verb" },
  run: { gl: "zoom", pos: "verb" },
  fly: { gl: "flim", pos: "verb" },
  swim: { gl: "swum", pos: "verb" },
  live: { gl: "kliv", pos: "verb" },
  exist: { gl: "kliv", pos: "verb" },
  die: { gl: "morz", pos: "verb" },
  big: { gl: "big", pos: "adj" },
  large: { gl: "big", pos: "adj" },
  small: { gl: "smol", pos: "adj" },
  little: { gl: "smol", pos: "adj" },
  long: { gl: "long", pos: "adj" },
  short: { gl: "kurt", pos: "adj" },
  hot: { gl: "hot", pos: "adj" },
  cold: { gl: "kold", pos: "adj" },
  wet: { gl: "wet", pos: "adj" },
  dry: { gl: "dri", pos: "adj" },
  fast: { gl: "fas", pos: "adj" },
  slow: { gl: "slo", pos: "adj" },
  heavy: { gl: "hevi", pos: "adj" },
  light: { gl: "liet", pos: "adj" },
  clean: { gl: "klin", pos: "adj" },
  messy: { gl: "mez", pos: "adj" },
  dirty: { gl: "mez", pos: "adj" },
  open: { gl: "opun", pos: "adj" },
  closed: { gl: "clos", pos: "adj" },
  strong: { gl: "stron", pos: "adj" },
  weak: { gl: "week", pos: "adj" },
  new: { gl: "new", pos: "adj" },
  old: { gl: "old", pos: "adj" },
  nice: { gl: "naz", pos: "adj" },
  kind: { gl: "naz", pos: "adj" },
  mean: { gl: "mene", pos: "adj" },
  right: { gl: "rite", pos: "adj" },
  correct: { gl: "rite", pos: "adj" },
  wrong: { gl: "rong", pos: "adj" },
  question: { gl: "kwestun", pos: "noun" },
  answer: { gl: "ansr", pos: "noun" },
  story: { gl: "storee", pos: "noun" },
  secret: { gl: "sekret", pos: "noun" },
  plan: { gl: "plan", pos: "noun" },
  time: { gl: "tim", pos: "noun" },
  place: { gl: "plaz", pos: "noun" },
  road: { gl: "rod", pos: "noun" },
  path: { gl: "rod", pos: "noun" },
  door: { gl: "duur", pos: "noun" },
  window: { gl: "windo", pos: "noun" },
  book: { gl: "buk", pos: "noun" },
  pen: { gl: "pen", pos: "noun" },
  phone: { gl: "fon", pos: "noun" },
  car: { gl: "kar", pos: "noun" },
  tree: { gl: "tre", pos: "noun" },
  flower: { gl: "flor", pos: "noun" },
  sky: { gl: "skai", pos: "noun" },
  sun: { gl: "sun", pos: "noun" },
  moon: { gl: "mun", pos: "noun" },
  star: { gl: "star", pos: "noun" },
  rain: { gl: "rein", pos: "noun" },
  snow: { gl: "snoz", pos: "noun" },
  wind: { gl: "wind", pos: "noun" },
  need: { gl: "nid", pos: "verb" },
  want: { gl: "wonz", pos: "verb" },
  help: { gl: "halp", pos: "verb" },
  be: { gl: "be", pos: "verb" },
  am: { gl: "be", pos: "verb" },
  is: { gl: "be", pos: "verb" },
  are: { gl: "be", pos: "verb" },
  was: { gl: "be", pos: "verb" },
  were: { gl: "be", pos: "verb" },

  // ---- pronouns ----
  i: { gl: "mi", pos: "pronoun" },
  me: { gl: "mi", pos: "pronoun" },
  you: { gl: "yu", pos: "pronoun" },
  he: { gl: "hi", pos: "pronoun" },
  him: { gl: "hi", pos: "pronoun" },
  she: { gl: "shi", pos: "pronoun" },
  her: { gl: "shi", pos: "pronoun" },
  it: { gl: "it", pos: "pronoun" },
  we: { gl: "wi", pos: "pronoun" },
  us: { gl: "wi", pos: "pronoun" },
  they: { gl: "de", pos: "pronoun" },
  them: { gl: "de", pos: "pronoun" },

  // ---- articles ----
  a: { gl: "a", pos: "article" },
  an: { gl: "a", pos: "article" },
  the: { gl: "da", pos: "article" },
  some: { gl: "nu", pos: "article" },

  // ---- prepositions ----
  in: { gl: "in", pos: "prep" },
  on: { gl: "on", pos: "prep" },
  under: { gl: "un", pos: "prep" },
  of: { gl: "ov", pos: "prep" },
  with: { gl: "wi", pos: "prep" },
  through: { gl: "fru", pos: "prep" },
  to: { gl: "tu", pos: "prep" },
  at: { gl: "at", pos: "prep" },
  by: { gl: "bi", pos: "prep" },
  around: { gl: "ar", pos: "prep" },

  // ---- time vocabulary ----
  now: { gl: "nu", pos: "adv" },
  then: { gl: "danu", pos: "adv" },
  yesterday: { gl: "yanu", pos: "adv" },
  today: { gl: "tanu", pos: "adv" },
  tomorrow: { gl: "vanu", pos: "adv" },
  morning: { gl: "morn", pos: "noun" },
  night: { gl: "nokt", pos: "noun" },
  moment: { gl: "tik", pos: "noun" },
  week: { gl: "wikt", pos: "noun" },
  year: { gl: "glorp", pos: "noun" },
  noon: { gl: "midu", pos: "noun" },
  evening: { gl: "duzk", pos: "noun" },
  soon: { gl: "son", pos: "adv" },
  late: { gl: "lat", pos: "adv" },
  already: { gl: "alredi", pos: "adv" },

  // ---- numbers ----
  zero: { gl: "nor", pos: "number" },
  one: { gl: "un", pos: "number" },
  two: { gl: "du", pos: "number" },
  three: { gl: "tri", pos: "number" },
  four: { gl: "glo", pos: "number" },
  five: { gl: "fim", pos: "number" },
  six: { gl: "zex", pos: "number" },
  seven: { gl: "sev", pos: "number" },
  eight: { gl: "gloop", pos: "number" },
  nine: { gl: "nuv", pos: "number" },
  ten: { gl: "dek", pos: "number" },

  // ---- greetings / interjections / slang ----
  hello: { gl: "glob", pos: "interj" },
  hi: { gl: "glob", pos: "interj" },
  bye: { gl: "glopz later", pos: "interj" },
  goodbye: { gl: "vroop well", pos: "interj" },
  dude: { gl: "broop", pos: "noun" },
  bro: { gl: "broop", pos: "noun" },
  whatever: { gl: "glop glop", pos: "interj" },
};

// Build the reverse dictionary (Globlish -> English) automatically.
// If multiple English words map to the same Globlish word, the first
// one registered wins as the "canonical" translation, but we keep a
// list of all candidates for smarter disambiguation later.
const REVERSE_DICTIONARY = {};
for (const [en, entry] of Object.entries(DICTIONARY)) {
  const key = entry.gl.toLowerCase();
  if (!REVERSE_DICTIONARY[key]) {
    REVERSE_DICTIONARY[key] = { en, pos: entry.pos, alternates: [] };
  } else {
    REVERSE_DICTIONARY[key].alternates.push(en);
  }
}

// Known multi-word English contractions, expanded before tokenizing.
const CONTRACTIONS = {
  "don't": "do not",
  "doesn't": "does not",
  "didn't": "did not",
  "isn't": "is not",
  "aren't": "are not",
  "wasn't": "was not",
  "weren't": "were not",
  "won't": "will not",
  "can't": "can not",
  "cannot": "can not",
  "i'm": "i am",
  "you're": "you are",
  "we're": "we are",
  "they're": "they are",
  "he's": "he is",
  "she's": "she is",
  "it's": "it is",
  "i've": "i have",
  "i'll": "i will",
  "you'll": "you will",
  "we'll": "we will",
  "they'll": "they will",
};

// Common irregular English verbs -> { root, tense }
const IRREGULAR_VERBS = {
  went: { root: "go", tense: "past" },
  saw: { root: "see", tense: "past" },
  had: { root: "have", tense: "past" },
  did: { root: "do", tense: "past" },
  made: { root: "make", tense: "past" },
  said: { root: "say", tense: "past" },
  knew: { root: "know", tense: "past" },
  thought: { root: "think", tense: "past" },
  heard: { root: "hear", tense: "past" },
  bought: { root: "buy", tense: "past" },
  sold: { root: "sell", tense: "past" },
  ran: { root: "run", tense: "past" },
  ate: { root: "eat", tense: "past" },
  drank: { root: "drink", tense: "past" },
  slept: { root: "sleep", tense: "past" },
  understood: { root: "understand", tense: "past" },
  was: { root: "be", tense: "past" },
  were: { root: "be", tense: "past" },
};


// ---- wordgen.js ----
// wordgen.js
// Invents new Globlish words for English words the dictionary doesn't
// know (and vice versa isn't needed, since every Globlish word that
// exists either came from the dictionary or from this generator, and
// generated words are permanently recorded in KV under both keys).
//
// The generator is DETERMINISTIC: the same English root always hashes
// to the same starting point, so even before touching KV, two people
// translating the same unknown word tend to get the same result. KV
// storage is what guarantees it *stays* the same forever, and is what
// makes reverse translation of an invented word possible at all.

// ---- Globlish phonotactics, tuned to match the existing vocabulary ----
const ONSETS = [
  "gl", "gr", "bl", "br", "pl", "pr", "vr", "kl", "kr", "fr", "dr",
  "sn", "sk", "sm", "st", "tr", "zr", "wr", "gun", "zor", "gor",
  "b", "g", "z", "v", "n", "d", "k", "t", "p", "fl", "spl",
];
const VOWELS = ["o", "u", "i", "e", "a", "oo", "ee", "ou"];
const CODAS = [
  "p", "b", "rp", "mp", "nd", "nk", "z", "rb", "lb", "mp", "nt",
  "k", "n", "m", "g", "rk", "sh", "", "", "",
];

// Small xorshift-ish string hash (FNV-1a), deterministic across runs.
function hashString(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// mulberry32 seeded PRNG — deterministic sequence from a numeric seed.
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

// Build a candidate Globlish word from an English root + attempt number.
// `attempt` lets us regenerate deterministically if the first guess
// collides with an existing word.
function buildCandidate(root, attempt) {
  const seed = hashString(root.toLowerCase() + "::" + attempt);
  const rng = mulberry32(seed);

  // Longer English roots get (slightly) more syllables, capped at 3.
  const syllables = Math.min(3, Math.max(1, Math.ceil(root.length / 4)));

  let word = "";
  for (let i = 0; i < syllables; i++) {
    word += pick(rng, ONSETS) + pick(rng, VOWELS) + pick(rng, CODAS);
  }
  // Clean up any awkward triple-letter runs from concatenation.
  word = word.replace(/(.)\1\1+/g, "$1$1");
  return word;
}

/**
 * Get (or create) the Globlish translation of an unknown English root.
 * Checks KV first so the same word always resolves the same way for
 * every user of the site; only generates + stores if truly new.
 */
async function generateOrLookupGloblish(env, root, pos = "noun") {
  const key = "en:" + root.toLowerCase();
  if (env.GLOBLISH_KV) {
    const cached = await env.GLOBLISH_KV.get(key, { type: "json" });
    if (cached) return cached.gl;
  }

  let candidate = buildCandidate(root, 0);
  if (env.GLOBLISH_KV) {
    // Avoid colliding with an existing reverse entry; try a few times.
    for (let attempt = 1; attempt <= 5; attempt++) {
      const collision = await env.GLOBLISH_KV.get("gl:" + candidate);
      if (!collision) break;
      candidate = buildCandidate(root, attempt);
    }
    await env.GLOBLISH_KV.put(key, JSON.stringify({ gl: candidate, pos }));
    await env.GLOBLISH_KV.put(
      "gl:" + candidate,
      JSON.stringify({ en: root, pos })
    );
  }
  return candidate;
}

/**
 * Look up an unknown Globlish word's English meaning. Only works for
 * words that were previously generated (and thus recorded in KV) —
 * there is no way to "reverse the hash" for a word nobody ever coined.
 */
async function lookupEnglishForGloblish(env, glWord) {
  if (!env.GLOBLISH_KV) return null;
  const entry = await env.GLOBLISH_KV.get("gl:" + glWord.toLowerCase(), {
    type: "json",
  });
  return entry; // { en, pos } or null
}

/** Manually teach the dictionary a word pair (used by the /api/define route). */
async function defineWordPair(env, enWord, glWord, pos = "noun") {
  if (!env.GLOBLISH_KV) throw new Error("KV not bound");
  enWord = enWord.toLowerCase().trim();
  glWord = glWord.toLowerCase().trim();
  await env.GLOBLISH_KV.put("en:" + enWord, JSON.stringify({ gl: glWord, pos }));
  await env.GLOBLISH_KV.put("gl:" + glWord, JSON.stringify({ en: enWord, pos }));
}


// ---- grammar.js ----
// grammar.js
// Bidirectional EN <-> Globlish translation engine.
// This is a rule-based, best-effort translator (not a full NLP parser).
// It faithfully applies every rule from the Globlish Language Guide:
// SVO order, noun+adjective order, nor-negation, ka-questions,
// da/vu/ri tense particles, -z plurals, -um possession, reduplication
// for emphasis, and -toop for "totally failed to X".



const TENSE_PARTICLE = {
  present: null,
  past: "da",
  future: "vu",
  continuous: "ri",
  "past continuous": "da-ri",
  "future continuous": "vu-ri",
};
const PARTICLE_TENSE = Object.fromEntries(
  Object.entries(TENSE_PARTICLE)
    .filter(([, v]) => v)
    .map(([k, v]) => [v, k])
);

const POSSESSIVE_PRONOUNS = {
  my: "mi", your: "yu", his: "hi", her: "shi",
  its: "it", our: "wi", their: "de",
};
const POSSESSIVE_PRONOUNS_REV = {
  mi: "my", yu: "your", hi: "his", shi: "her",
  it: "its", wi: "our", de: "their", yur: "your",
};

const ENGLISH_PAST_IRREGULAR = {
  go: "went", see: "saw", eat: "ate", drink: "drank", buy: "bought",
  sell: "sold", make: "made", say: "said", know: "knew", think: "thought",
  hear: "heard", sleep: "slept", understand: "understood", have: "had",
  do: "did", run: "ran", be: "was",
};
const GERUND_SPECIAL = { run: "running", swim: "swimming", sit: "sitting" };

const FIXED_TOOP_MEANINGS = {
  gunder: "completely fail to understand",
  plop: "completely fail at doing",
  vroop: "get completely lost",
  snerp: "completely fail to notice",
  gronk: "have absolutely no idea about",
};

const SLANG_PHRASES = {
  "nor glob": "no way",
  "glob nor": "yesn't",
  "glop glop": "whatever",
  "gloop glop": "nice thing",
  "zorp glop": "terrible thing",
};
const SLANG_PHRASES_REV = Object.fromEntries(
  [
    ["no way", "nor glob"],
    ["whatever", "glop glop"],
  ]
);

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function splitSentences(text) {
  // Keep the terminal punctuation attached so tone (?!.) survives.
  const parts = text.match(/[^.!?]+[.!?]*/g) || [text];
  return parts.map((p) => p.trim()).filter(Boolean);
}

function expandContractions(sentence) {
  let s = sentence;
  for (const [contraction, expansion] of Object.entries(CONTRACTIONS)) {
    const re = new RegExp(`\\b${contraction.replace("'", "['’]")}\\b`, "gi");
    s = s.replace(re, expansion);
  }
  return s;
}

// "running" -> "run", "making" -> "make", "sleeping" -> "sleep"
function stripGerund(word) {
  const stem = word.slice(0, -3);
  if (stem.length >= 3 && stem[stem.length - 1] === stem[stem.length - 2] &&
      !"aeiou".includes(stem[stem.length - 1])) {
    return stem.slice(0, -1); // doubled consonant: runn -> run
  }
  return stem; // sleep(ing) -> sleep as-is; "mak"+"e" tried separately
}

function toEnglishGerund(root) {
  if (GERUND_SPECIAL[root]) return GERUND_SPECIAL[root];
  if (root.endsWith("e") && !root.endsWith("ee")) return root.slice(0, -1) + "ing";
  return root + "ing";
}

// ===========================================================
// ENGLISH -> GLOBLISH
// ===========================================================

async function translateToGloblish(text, env) {
  const sentences = splitSentences(text);
  const out = [];
  for (const raw of sentences) {
    out.push(await translateSentenceToGloblish(raw, env));
  }
  return out.join(" ");
}

async function translateSentenceToGloblish(rawSentence, env) {
  const punctMatch = rawSentence.match(/[.!?]+$/);
  let punct = punctMatch ? punctMatch[0].slice(-1) : ".";
  let body = rawSentence.replace(/[.!?]+$/, "").trim();
  if (!body) return "";

  body = expandContractions(body.toLowerCase());
  // Mark possessive 's ("friend's" -> "friend __POSS__") before tokenizing.
  body = body.replace(/(\w+)'s\b/g, "$1 __POSS__");

  let isQuestion = punct === "?";
  const words = body.split(/\s+/).filter(Boolean);

  // Leading question auxiliaries.
  const QUESTION_AUX_STRIP = new Set(["do", "does", "did", "can", "would"]);
  if (words.length && QUESTION_AUX_STRIP.has(words[0])) {
    isQuestion = true;
    words.shift();
  } else if (words.length && ["is", "are", "was", "were"].includes(words[0])) {
    // "Is he good?" -> keep the be-verb but flag as question, and move
    // it after the subject so the rest of the pipeline sees normal SVO.
    isQuestion = true;
    const be = words.shift();
    // find subject (first pronoun/noun-ish word) to reinsert be after it
    words.splice(1, 0, be);
  }

  let negate = false;
  let tense = "present";

  // "X will not" / "will"
  const willNotIdx = words.findIndex((w, i) => w === "will" && words[i + 1] === "not");
  if (willNotIdx !== -1) {
    words.splice(willNotIdx, 2);
    negate = true;
    tense = "future";
  } else {
    const willIdx = words.indexOf("will");
    if (willIdx !== -1) {
      words.splice(willIdx, 1);
      tense = "future";
    }
  }

  // "do/does/did not"
  const auxNotIdx = words.findIndex(
    (w, i) => ["do", "does", "did"].includes(w) && words[i + 1] === "not"
  );
  if (auxNotIdx !== -1) {
    const aux = words[auxNotIdx];
    words.splice(auxNotIdx, 2);
    negate = true;
    if (aux === "did") tense = "past";
  }

  // standalone "not"
  const notIdx = words.indexOf("not");
  if (notIdx !== -1) {
    words.splice(notIdx, 1);
    negate = true;
  }

  // be-verb + gerund -> continuous / past continuous
  const beIdx = words.findIndex((w) => ["is", "are", "was", "were"].includes(w));
  if (beIdx !== -1 && words[beIdx + 1] && words[beIdx + 1].endsWith("ing")) {
    const be = words[beIdx];
    words.splice(beIdx, 1);
    tense = tense === "future" ? "future continuous"
      : ["was", "were"].includes(be) ? "past continuous" : "continuous";
  } else {
    // standalone gerund without a be-verb, e.g. "Going home is nice" — rare;
    // just treat a lone -ing verb as continuous.
    const gerundIdx = words.findIndex((w) => w.endsWith("ing") && w.length > 4);
    if (gerundIdx !== -1 && tense === "present") tense = "continuous";
  }

  // Resolve every remaining word into a {gl, pos, plural, possessive} token.
  const tokens = [];
  let sawVerb = false;
  for (let i = 0; i < words.length; i++) {
    let w = words[i];
    if (!w) continue;

    let possessive = false;
    if (words[i + 1] === "__poss__" || words[i + 1] === "__POSS__") {
      possessive = true;
      words[i + 1] = ""; // consume marker
    }

    if (POSSESSIVE_PRONOUNS[w]) {
      tokens.push({ gl: POSSESSIVE_PRONOUNS[w] + "-um", pos: "pronoun", raw: w });
      continue;
    }

    let plural = false;
    let lookupWord = w;
    if (!DICTIONARY[w] && /s$/.test(w) && w.length > 3) {
      const singular = w.endsWith("es") ? w.slice(0, -2) : w.slice(0, -1);
      if (DICTIONARY[singular]) {
        lookupWord = singular;
        plural = true;
      }
    }

    let entry = DICTIONARY[lookupWord];
    let tenseFromVerb = null;

    if (!entry && IRREGULAR_VERBS[w]) {
      const irr = IRREGULAR_VERBS[w];
      entry = DICTIONARY[irr.root];
      tenseFromVerb = irr.tense;
    }

    if (!entry && /ed$/.test(w) && w.length > 3) {
      const guesses = [w.slice(0, -2), w.slice(0, -1), w.slice(0, -3) + "y"];
      for (const g of guesses) {
        if (DICTIONARY[g]) {
          entry = DICTIONARY[g];
          tenseFromVerb = "past";
          break;
        }
      }
    }

    // Gerund root-stripping (e.g. "sleeping" -> "sleep", "making" -> "make").
    // The continuous/past-continuous tense flag was already set above from
    // the be-verb + -ing pattern, so here we just need the root word.
    let gerundRoot = null;
    if (!entry && /ing$/.test(w) && w.length > 4) {
      gerundRoot = stripGerund(w);
      const guesses = [gerundRoot, gerundRoot + "e", w.slice(0, -3)];
      for (const g of guesses) {
        if (DICTIONARY[g]) {
          entry = DICTIONARY[g];
          gerundRoot = null; // found in dictionary, no need to remember root
          break;
        }
      }
    }

    if (tenseFromVerb && tense === "present") tense = tenseFromVerb;

    if (entry) {
      tokens.push({ gl: entry.gl, pos: entry.pos, plural, possessive, raw: w });
      if (entry.pos === "verb") sawVerb = true;
    } else {
      // Truly unknown word -> invent it.
      const looksLikeGerund = /ing$/.test(w) && w.length > 4 && tense.includes("continuous");
      const guessedPos = looksLikeGerund || gerundRoot || (!sawVerb && i > 0 && tense === "present" && !negate)
        ? "verb"
        : "noun";
      // For an unknown gerund, generate from the ROOT so the reverse
      // translation doesn't double up "-ing" (e.g. avoids "runninging").
      const genRoot = gerundRoot || w;
      const gl = await generateOrLookupGloblish(env, genRoot, guessedPos);
      tokens.push({ gl, pos: guessedPos, plural, possessive, raw: w, generated: true });
      if (guessedPos === "verb") sawVerb = true;
    }
  }

  // Adjective-noun swap: English "adj noun" -> Globlish "noun adj".
  for (let i = 0; i < tokens.length - 1; i++) {
    if (tokens[i].pos === "adj" && tokens[i + 1].pos === "noun") {
      const tmp = tokens[i];
      tokens[i] = tokens[i + 1];
      tokens[i + 1] = tmp;
    }
  }

  // Apply plural / possessive suffixes now that word order is final.
  const words_out = tokens.map((t) => {
    let w = t.gl;
    if (t.plural) w += "z";
    if (t.possessive) w += "-um";
    return w;
  });

  // Insert nor / tense particle immediately before the main verb.
  const verbIdx = tokens.findIndex((t) => t.pos === "verb");
  const particle = TENSE_PARTICLE[tense];
  const insertAt = verbIdx === -1 ? words_out.length : verbIdx;
  const inserts = [];
  if (negate) inserts.push("nor");
  if (particle) inserts.push(particle);
  words_out.splice(insertAt, 0, ...inserts);

  if (isQuestion) words_out.unshift("ka");

  let sentence = words_out.join(" ");
  sentence = capitalize(sentence);
  const finalPunct = isQuestion ? "?" : punct === "!" ? "!" : ".";
  return sentence + finalPunct;
}

// ===========================================================
// GLOBLISH -> ENGLISH
// ===========================================================

async function translateToEnglish(text, env) {
  const sentences = splitSentences(text);
  const out = [];
  for (const raw of sentences) {
    out.push(await translateSentenceToEnglish(raw, env));
  }
  return out.join(" ");
}

async function translateSentenceToEnglish(rawSentence, env) {
  const punctMatch = rawSentence.match(/[.!?]+$/);
  let punct = punctMatch ? punctMatch[0].slice(-1) : ".";
  let body = rawSentence.replace(/[.!?]+$/, "").trim().toLowerCase();
  if (!body) return "";

  // Fixed slang phrases, checked whole first.
  for (const [phrase, meaning] of Object.entries(SLANG_PHRASES)) {
    if (body === phrase) return capitalize(meaning) + punct;
  }

  let words = body.split(/\s+/).filter(Boolean);

  let isQuestion = false;
  if (words[0] === "ka") {
    isQuestion = true;
    words.shift();
  }

  let forceful = false;
  if (words[0] === "gron") {
    forceful = true;
    words.shift();
  }

  let negate = false;
  const norIdx = words.indexOf("nor");
  if (norIdx !== -1) {
    negate = true;
    words.splice(norIdx, 1);
  }

  // Resolve tense particles: da / vu / ri / da-ri / vu-ri.
  // "da" is ambiguous with the article "the" — resolved by checking
  // whether the following word is (or resolves to) a verb.
  let tense = "present";
  const resolved = []; // {en, pos, generated}
  for (let i = 0; i < words.length; i++) {
    resolved.push(await resolveGloblishWord(env, words[i]));
  }

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w === "da-ri") { tense = "past continuous"; words[i] = null; resolved[i] = null; continue; }
    if (w === "vu-ri") { tense = "future continuous"; words[i] = null; resolved[i] = null; continue; }
    if (w === "ri") { tense = tense === "future" ? "future continuous" : "continuous"; words[i] = null; resolved[i] = null; continue; }
    if (w === "vu") { tense = tense === "continuous" ? "future continuous" : "future"; words[i] = null; resolved[i] = null; continue; }
    if (w === "da") {
      const next = resolved[i + 1];
      if (next && next.pos === "verb") {
        tense = "past";
        words[i] = null; resolved[i] = null;
        continue;
      }
      // otherwise treat as article "the" — leave it, handled in resolveGloblishWord
    }
  }

  // Compact arrays, dropping consumed particles.
  const items = [];
  for (let i = 0; i < words.length; i++) {
    if (words[i] === null) continue;
    items.push(resolved[i]);
  }

  // Collapse reduplication (emphasis): same word 2-3x in a row.
  const collapsed = [];
  for (let i = 0; i < items.length; i++) {
    if (!items[i]) continue;
    let repeatCount = 1;
    while (
      items[i + repeatCount] &&
      items[i + repeatCount].en === items[i].en &&
      items[i].en
    ) {
      repeatCount++;
    }
    if (repeatCount >= 2) {
      const intensifier = repeatCount === 2 ? "really" : "absurdly";
      collapsed.push({ ...items[i], en: `${intensifier} ${items[i].en}` });
      i += repeatCount - 1;
    } else {
      collapsed.push(items[i]);
    }
  }

  // -toop suffix: "completely fail(ed) to X"
  for (let i = 0; i < collapsed.length; i++) {
    const it = collapsed[i];
    if (it.tooped && it.rootEn) {
      it.en = (FIXED_TOOP_MEANINGS[it.rootGl] || `completely fail to ${it.rootEn}`);
    }
  }

  // Adjective-noun swap back: Globlish "noun adj" -> English "adj noun".
  for (let i = 0; i < collapsed.length - 1; i++) {
    if (collapsed[i].pos === "noun" && collapsed[i + 1].pos === "adj") {
      const tmp = collapsed[i];
      collapsed[i] = collapsed[i + 1];
      collapsed[i + 1] = tmp;
    }
  }

  // Find subject pronoun (for verb agreement) and main verb.
  const verbIdx = collapsed.findIndex((it) => it.pos === "verb");
  const subject = collapsed.slice(0, verbIdx === -1 ? 0 : verbIdx)
    .map((it) => it.en).join(" ");
  const subjectWord = collapsed[0] ? collapsed[0].raw : "";

  let sentenceWords;
  if (verbIdx === -1) {
    sentenceWords = collapsed.map((it) => it.en);
    if (negate) sentenceWords.unshift("not");
  } else {
    const verbEn = collapsed[verbIdx].en;
    const before = collapsed.slice(0, verbIdx).map((it) => it.en);
    const after = collapsed.slice(verbIdx + 1).map((it) => it.en);
    const isBe = collapsed[verbIdx].rootGl === "be" || verbEn === "be";

    let verbPhrase;
    if (isBe) {
      const beForm = conjugateBe(subjectWord, tense);
      verbPhrase = negate ? `${beForm} not` : beForm;
    } else if (tense === "past") {
      const pastForm = ENGLISH_PAST_IRREGULAR[verbEn] || verbEn + "ed";
      verbPhrase = negate ? `did not ${verbEn}` : pastForm;
    } else if (tense === "future") {
      verbPhrase = negate ? "will not " + verbEn : "will " + verbEn;
    } else if (tense === "continuous") {
      const beForm = conjugateBe(subjectWord, "present");
      verbPhrase = negate
        ? `${beForm} not ${toEnglishGerund(verbEn)}`
        : `${beForm} ${toEnglishGerund(verbEn)}`;
    } else if (tense === "past continuous") {
      const beForm = conjugateBe(subjectWord, "past");
      verbPhrase = negate
        ? `${beForm} not ${toEnglishGerund(verbEn)}`
        : `${beForm} ${toEnglishGerund(verbEn)}`;
    } else if (tense === "future continuous") {
      verbPhrase = negate
        ? `will not be ${toEnglishGerund(verbEn)}`
        : `will be ${toEnglishGerund(verbEn)}`;
    } else {
      verbPhrase = negate ? `do not ${verbEn}` : verbEn;
    }

    sentenceWords = [...before, verbPhrase, ...after];
  }

  let sentence = sentenceWords.filter(Boolean).join(" ");

  if (isQuestion) {
    // crude but effective: front the first auxiliary-like word if present,
    // else just mark with a question mark.
    sentence = sentence.replace(/^(\S+)\s+(am not|is not|are not|was not|were not|am|is|are|was|were|will|did not|do not|will not)\b/, "$2 $1");
  }

  sentence = capitalize(sentence);
  let finalPunct = isQuestion ? "?" : punct;
  if (forceful) {
    sentence = sentence.toUpperCase();
    finalPunct = "!";
  }
  return sentence + finalPunct;
}

function conjugateBe(subjectGl, tense) {
  const isPast = tense === "past" || tense === "past continuous";
  if (isPast) {
    return ["mi"].includes(subjectGl) ? "was"
      : ["yu", "wi", "yur", "de"].includes(subjectGl) ? "were"
      : "was";
  }
  return ["mi"].includes(subjectGl) ? "am"
    : ["yu", "wi", "yur", "de"].includes(subjectGl) ? "are"
    : "is";
}

// Resolve a single Globlish word (already lowercase, particles like
// nor/ka/gron/da/vu/ri handled by the caller) into English + metadata.
async function resolveGloblishWord(env, word) {
  if (word === "the" || word === "da") return { en: "the", pos: "article", raw: word };

  // possessive suffix
  if (word.endsWith("-um")) {
    const root = word.slice(0, -3);
    if (POSSESSIVE_PRONOUNS_REV[root]) {
      return { en: POSSESSIVE_PRONOUNS_REV[root], pos: "pronoun", raw: root };
    }
    const base = await resolveGloblishWord(env, root);
    return { en: `${base.en}'s`, pos: "noun", raw: root };
  }

  // -toop suffix
  if (word.endsWith("toop") && word.length > 4) {
    const root = word.slice(0, -4);
    const base = await resolveGloblishWord(env, root);
    return { en: base.en, pos: "verb", raw: root, tooped: true, rootEn: base.en, rootGl: root };
  }

  // plural -z
  if (word.endsWith("z") && word.length > 2 && !REVERSE_DICTIONARY[word]) {
    const root = word.slice(0, -1);
    const base = await resolveGloblishWord(env, root);
    if (base && !base.unknown) {
      const plEn = base.en.endsWith("s") ? base.en : base.en + "s";
      return { en: plEn, pos: base.pos, raw: root };
    }
  }

  const entry = REVERSE_DICTIONARY[word];
  if (entry) return { en: entry.en, pos: entry.pos, raw: word, rootGl: word };

  const generated = await lookupEnglishForGloblish(env, word);
  if (generated) return { en: generated.en, pos: generated.pos, raw: word, rootGl: word };

  return { en: `[${word}?]`, pos: "noun", raw: word, unknown: true };
}


// ---- index.js ----
// index.js — Cloudflare Worker entry point
//
// Routes:
//   POST /api/translate   { text: string, direction: "en2gl" | "gl2en" }
//        -> { translated: string }
//   POST /api/define      { en: string, gl: string, pos?: string }
//        -> { ok: true }   (manually teach/correct a word pair)
//   GET  /api/health       -> { ok: true }
//
// Bind a KV namespace called GLOBLISH_KV (see wrangler.toml) so that
// newly-invented words persist and stay consistent for every visitor.



const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (url.pathname === "/api/health") {
      return json({ ok: true, kvBound: !!env.GLOBLISH_KV });
    }

    if (url.pathname === "/api/translate" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON body" }, 400);
      }
      const { text, direction } = body || {};
      if (typeof text !== "string" || !text.trim()) {
        return json({ error: "Missing 'text'" }, 400);
      }
      if (direction !== "en2gl" && direction !== "gl2en") {
        return json({ error: "'direction' must be 'en2gl' or 'gl2en'" }, 400);
      }
      try {
        const translated =
          direction === "en2gl"
            ? await translateToGloblish(text, env)
            : await translateToEnglish(text, env);
        return json({ translated, direction });
      } catch (err) {
        return json({ error: "Translation failed: " + err.message }, 500);
      }
    }

    if (url.pathname === "/api/define" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON body" }, 400);
      }
      const { en, gl, pos } = body || {};
      if (!en || !gl) return json({ error: "Need both 'en' and 'gl'" }, 400);
      try {
        await defineWordPair(env, en, gl, pos || "noun");
        return json({ ok: true });
      } catch (err) {
        return json({ error: err.message }, 500);
      }
    }

    return json({ error: "Not found" }, 404);
  },
};
