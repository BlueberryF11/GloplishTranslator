// wordgen.js
import { REVERSE_DICTIONARY } from "./dictionary.js";

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
export function buildCandidate(root, attempt) {
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
export async function generateOrLookupGloblish(env, root, pos = "noun") {
  const key = "en:" + root.toLowerCase();
  if (env.GLOBLISH_KV) {
    const cached = await env.GLOBLISH_KV.get(key, { type: "json" });
    if (cached) return cached.gl;
  }

  let candidate = buildCandidate(root, 0);
  // Avoid colliding with built-in words even when KV is not configured;
  // otherwise a generated word can reverse-translate as the wrong known word.
  for (let attempt = 1; REVERSE_DICTIONARY[candidate] && attempt <= 25; attempt++) {
    candidate = buildCandidate(root, attempt);
  }

  if (env.GLOBLISH_KV) {
    // Avoid colliding with existing generated/manual reverse entries too.
    for (let attempt = 1; attempt <= 25; attempt++) {
      const collision = await env.GLOBLISH_KV.get("gl:" + candidate);
      if (!collision && !REVERSE_DICTIONARY[candidate]) break;
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
export async function lookupEnglishForGloblish(env, glWord) {
  if (!env.GLOBLISH_KV) return null;
  const entry = await env.GLOBLISH_KV.get("gl:" + glWord.toLowerCase(), {
    type: "json",
  });
  return entry; // { en, pos } or null
}

/** Manually teach the dictionary a word pair (used by the /api/define route). */
export async function defineWordPair(env, enWord, glWord, pos = "noun") {
  if (!env.GLOBLISH_KV) throw new Error("KV not bound");
  enWord = enWord.toLowerCase().trim();
  glWord = glWord.toLowerCase().trim();
  await env.GLOBLISH_KV.put("en:" + enWord, JSON.stringify({ gl: glWord, pos }));
  await env.GLOBLISH_KV.put("gl:" + glWord, JSON.stringify({ en: enWord, pos }));
}
