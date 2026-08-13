// grammar.js
// Bidirectional EN <-> Globlish translation engine.
// This is a rule-based, best-effort translator (not a full NLP parser).
// It faithfully applies every rule from the Globlish Language Guide:
// SVO order, noun+adjective order, nor-negation, ka-questions,
// da/vu/ri tense particles, -z plurals, -um possession, reduplication
// for emphasis, and -toop for "totally failed to X".

import {
  DICTIONARY,
  REVERSE_DICTIONARY,
  CONTRACTIONS,
  IRREGULAR_VERBS,
} from "./dictionary.js";
import { generateOrLookupGloblish, lookupEnglishForGloblish } from "./wordgen.js";

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

export async function translateToGloblish(text, env) {
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

export async function translateToEnglish(text, env) {
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
