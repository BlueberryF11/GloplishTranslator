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

import { translateToGloblish, translateToEnglish } from "./grammar.js";
import { defineWordPair } from "./wordgen.js";

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
