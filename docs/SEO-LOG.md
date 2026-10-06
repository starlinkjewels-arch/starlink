# SEO change log

Per `docs/REACT-SEO-PLAYBOOK.md`. Newest first. Every entry records what changed,
why, and how it was verified — including what could **not** be verified yet.

---

## 2026-10-06 — Phase 0 audit

Full audit reported to the owner. Summary:

| Item | Result |
|---|---|
| Framework | Vite 5.4 + React 18.3 + `react-router-dom` 6.30 (`BrowserRouter`, library mode) |
| Rendering | Client SPA **plus** a build-time prerender (`scripts/prerender.mjs`) — 238 canonical URLs |
| Initial HTML has title/description/canonical/OG/H1/JSON-LD | ✅ verified by curl on 8 live routes |
| Lighthouse mobile (production) | Performance **18** · SEO **100** · A11y **96** · Best Practices **100** |
| Unknown URL status | ❌ **200** (soft 404) |

**Recommended path: C3 — keep and harden the existing prerender.** The playbook's
table classifies Vite + react-router-dom as "client-only, weak", but that is wrong
for this project: the prerender already delivers full HTML for every public route,
which is why SEO scores 100. A framework migration would cost weeks for no SEO gain.
The real problems are a routing-config bug and page weight.

🔴 Critical: soft 404s marked indexable · mobile performance 18
🟡 Important: all titles > 60 chars · descriptions 79–228 chars · `Product` schema
has no `offers` · `www` → apex is a 307 rather than a permanent redirect

---

## 2026-10-06 — Fix: soft 404s and an indexable SPA fallback

### What changed

**`scripts/prerender.mjs`**
- The SPA fallback shell (`200.html`) is now written with `robots: noindex, follow`.
- A real `404.html` is emitted, using the same noindex shell.
- Added `withRobots()` to swap the directive without touching anything else.

**`vercel.json`**
- Replaced the catch-all rewrite `/(.*) → /200` with explicit rewrites for only the
  routes that genuinely need a client-side fallback:
  `/product/*`, `/category/*`, `/blog/*`, `/buying-guide/*`, `/search`, `/wishlist`,
  and the admin path.

### Why

The catch-all meant **every** unknown URL returned `200` and served a shell whose
initial HTML said `index, follow`. Google was being invited to index an unbounded
space of pages that do not exist. `NotFound.tsx` does set `noindex`, but only once
React runs — a crawler that doesn't execute JS never sees it.

With the rewrite narrowed, a path matching no file and no rewrite now falls through
to `404.html`, which Vercel serves with a real `404`. The routes that legitimately
need the fallback still get it, and because the shell is noindex, the remaining
soft-200 space (a brand-new product awaiting the next build, or a bad id) cannot be
indexed either. Those pages still render correctly for users.

### Verification

```
dist/200.html      robots = noindex, follow     ✅
dist/404.html      robots = noindex, follow     ✅  (and contains <div id="root">, so the SPA boots)
dist/index.html    robots = index, follow, ...  ✅  unchanged
dist/about.html    robots = index, follow, ...  ✅  unchanged
dist/category/rings.html          index, follow ✅  unchanged
dist/product/<slug>.html          index, follow ✅  unchanged
dist/category/<id>.html (legacy)  noindex, follow ✅ unchanged

240 files index,follow   (238 canonical routes + home + shell-derived)
203 files noindex        (201 legacy id→slug redirects + 200.html + 404.html)
build: ✅ 238 pages + 201 legacy redirects
```

### ⚠️ Not yet verified

The **404 status code itself cannot be confirmed locally** — `vite preview` does not
apply `vercel.json` routing. It must be re-checked against a Vercel preview
deployment before this reaches production:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://<preview>/definitely-not-a-page   # expect 404
curl -s -o /dev/null -w "%{http_code}\n" https://<preview>/product/does-not-exist  # expect 200 + noindex
curl -s -o /dev/null -w "%{http_code}\n" https://<preview>/category/rings          # expect 200 + index
curl -s -o /dev/null -w "%{http_code}\n" https://<preview>/<admin-path>            # expect 200
```

### ⚠️ Coupling introduced

The admin path is now hard-coded in `vercel.json` as well as in `src/App.tsx`
(`ADMIN_PATH`). **If that constant changes, `vercel.json` must change with it**, or
the admin route will start returning 404. It was already shipped in the client
bundle, so this adds no new exposure — but it is a footgun worth knowing about.
