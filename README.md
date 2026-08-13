# Globlish Translator

A two-way English ⇄ Globlish translator: a static frontend (deploy on
GitHub Pages) backed by a Cloudflare Worker (deploy with Wrangler) that
does the actual translation and remembers newly-invented words in
Workers KV, so they translate the same way for every visitor forever.

```
globlish-translator/
├── frontend/          static site → GitHub Pages
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── config.js      ← point this at your Worker URL
└── worker/             API → Cloudflare Workers
    ├── wrangler.toml
    └── src/
        ├── index.js       (routes / CORS)
        ├── grammar.js      (translation engine)
        ├── dictionary.js   (built-in word list + grammar rules)
        └── wordgen.js      (new-word generator + KV persistence)
```

## How translation works

- **Known words** are looked up in `dictionary.js`, which encodes the
  full Globlish grammar guide: SVO order, noun-then-adjective order,
  `nor` negation, `ka` questions, `da/vu/ri` tense particles, `-z`
  plurals, `-um` possession, word reduplication for emphasis, and the
  `-toop` "totally failed to X" suffix.
- **Unknown words** (a name, a slang term, anything not in the
  dictionary) are run through a deterministic word generator
  (`wordgen.js`). It hashes the English root and uses that hash to
  seed a random pick from Globlish-style syllable pieces (onsets like
  `gl-`, `bl-`, `zr-`, vowels, and codas like `-orp`, `-ump`), so the
  same word tends to generate the same way even before it's ever been
  saved.
- The **first time** a new word is generated, it's written to a
  Cloudflare KV namespace under both an `en:` and `gl:` key. Every
  translation after that — from any visitor — reads the same pair back
  out of KV, so the invented word is permanent and works in both
  directions (English → Globlish and Globlish → English).
- You can also manually teach a word pair via the "Teach Globlish a
  word" panel on the site (calls `POST /api/define`), which is handy
  for fixing a generated word you don't like.

This is a rule-based translator, not a full NLP system — it handles
common sentence patterns well (statements, negation, yes/no questions,
past/future/continuous tense, plurals, possession) but won't get every
possible English sentence perfectly. Treat mistranslations as part of
the Globlish charm.

## 1. Deploy the Worker (backend)

You need a free Cloudflare account.

```bash
cd worker
npm install -g wrangler   # if you don't already have it
wrangler login

# Create the KV namespace that stores invented words
wrangler kv namespace create GLOBLISH_KV
```

Copy the `id` that command prints into `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "GLOBLISH_KV"
id = "PASTE_YOUR_ID_HERE"
```

Then deploy:

```bash
wrangler deploy
```

Wrangler will print your Worker's URL, something like:

```
https://globlish-translator.your-subdomain.workers.dev
```

Test it:

```bash
curl -X POST https://globlish-translator.your-subdomain.workers.dev/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"I understand the weird thing.","direction":"en2gl"}'
```

## 2. Point the frontend at your Worker

Edit `frontend/config.js`:

```js
const GLOBLISH_WORKER_URL = "https://globlish-translator.your-subdomain.workers.dev";
```

## 3. Deploy the frontend to GitHub Pages

1. Push this whole folder to a GitHub repo.
2. In the repo settings, go to **Pages**.
3. Set the source to the branch you pushed, and the folder to
   `/frontend` (or move the contents of `frontend/` to the repo root /
   a `docs/` folder — whatever your Pages setup expects).
4. Save. GitHub will give you a URL like
   `https://your-username.github.io/globlish-translator/`.

That's it — the site is static HTML/CSS/JS with no build step, so
GitHub Pages can serve it directly.

## 4. (Optional) Local development

You can serve the frontend locally with any static file server, e.g.:

```bash
cd frontend
python3 -m http.server 8080
```

and run the Worker locally with:

```bash
cd worker
wrangler dev
```

then point `config.js` at `http://localhost:8787` while testing.

## Notes / known limitations

- Globlish intentionally reuses a few written forms (`da` = both "the"
  and the past-tense marker; `gloop` = both "good" and the number 8).
  The engine resolves these using simple context rules; treat any
  remaining oddities as part of the language's charm.
- Grammar handling covers common sentence shapes (statements,
  negation, yes/no questions, the four/five core tenses, plurals,
  possession) — very unusual sentence structures may not translate
  perfectly.
- The `/api/define` endpoint is open (no auth), so anyone with your
  Worker URL can add/overwrite word pairs. Fine for a fun project; add
  a shared-secret header check in `index.js` if you want to lock it
  down.
