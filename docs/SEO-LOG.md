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

---

## 2026-10-06 — Phase 5 (images) + Phase 2 (titles & descriptions)

### Images: 661 KB off the bundled assets

`src/assets/craft/*.jpg` were 1400×1400 but render at roughly 300px, which is the
~95% waste Lighthouse flagged. Resized to 800px wide and re-encoded (mozjpeg, q78,
progressive). Hero banners kept at 1920 (they are the LCP element) but re-encoded.

```
craft-1.jpg  1400 -> 800   203KB ->  58KB  (-71%)
craft-2.jpg  1400 -> 800   261KB ->  57KB  (-78%)
craft-3.jpg  1400 -> 800   138KB ->  35KB  (-74%)
craft-4.jpg  1400 -> 800   240KB ->  67KB  (-72%)
hero-banner-1.jpg  1920    137KB -> 120KB  (-12%)
hero-banner-2.jpg  1920    126KB -> 106KB  (-16%)
                           1105KB -> 444KB (-60%)
```

Extensions unchanged, so no import paths moved. Quality compared side by side at
display size — no visible difference. Source files are tracked in git, so this is
revertible.

**Not touched:** Firebase-hosted images already go through wsrv.nl (WebP, resized),
and `src/assets/{2,3,04,05}.jpg` (2.3 MB) are unreferenced and never bundled — dead
files in the repo, no runtime cost. Left alone rather than deleted unprompted.

### Titles and descriptions: SERP budgets enforced

Added `fitTitle` / `fitDescription` / `clampWords` to `src/lib/seo.ts` and mirrored
them in `scripts/seo-data.mjs` (the two were already documented as needing to stay
in sync).

- `fitTitle` picks the richest variant that fits **60 chars including the brand**,
  so the keyword leads and the brand survives.
- `fullTitle` now appends the brand **only when it fits**, instead of pushing titles
  over the limit. Applied in both the prerender and `SEOHead.tsx`.
- Titles are **never ellipsized**. Where nothing fits, the brand is dropped and the
  real name kept — a truncated product or article name looks broken, and Google
  truncates visually anyway.
- Descriptions are word-trimmed to 155 at a final choke point, so CMS-authored
  `metaDescription` values are budgeted too, not just generated ones.
- Homepage title shortened to `Lab-Grown & Natural Diamond Jewelry | Starlink Jewels`
  (53 chars). It was 61 and had lost its brand entirely.

### Verification (240 indexable pages in the build)

| Check | Before | After |
|---|---|---|
| Titles > 60 chars | 84 | **26** |
| Descriptions > 155 chars | 33 | **0** |
| Descriptions < 140 chars | 9 | 9 |

Build passes, `tsc --noEmit` clean, 238 pages + 201 legacy redirects.

### ⚠️ Remaining 26 titles and 9 descriptions are editorial, not code

They come from CMS `metaTitle` / `metaDescription` fields and long blog headlines,
which the code deliberately does not truncate. Worst offenders:

```
135 chars  blog/1776404082399
124 chars  product/luxe-bezel-set-round-diamond-riviera-necklace-1783748116101
121 chars  blog/1780745390384
109 chars  product/classic-bezel-set-round-diamond-station-necklace-1783747504490
```

These need shortening in the admin panel by someone who owns the copy.

### ⚠️ Not re-measured

Lighthouse has **not** been re-run since the image work — the previous score (18)
was measured against production. The image saving is real but its effect on LCP is
unproven until this is deployed to a preview and measured again.

---

## 2026-10-06 — Phase 5: self-hosted fonts (render-blocking)

### What changed

Measured on the build: the Google Fonts stylesheet was the single largest
render-blocking resource at **951 ms** — an external stylesheet holds up first
paint until DNS, TLS and the response all complete.

- Installed `@fontsource-variable/inter`, `@fontsource-variable/inter-tight` and
  `@fontsource/cormorant-garamond`, imported in `src/main.tsx`.
- Removed the Google Fonts `<link>` and its two preconnects from `index.html`.
- `tailwind.config.ts` font stacks now lead with the variable family names
  (`Inter Variable`, `Inter Tight Variable`), keeping the old names behind them.
- Only weights 400-700 are used anywhere in the codebase; the old request also
  pulled 300 and 800. The variable files cover the whole range in one file each.

### The regression this caused, and the fix

Self-hosting alone **made CLS worse: 0 → 0.332**. The blocking stylesheet had been
hiding the problem — with it gone, fonts arrived after first paint and swapped in,
reflowing the text.

`scripts/prerender.mjs` now injects `<link rel="preload" as="font">` for the two
latin variable files into every pre-rendered page. Vite hashes the filenames, so
they are resolved from the build output rather than hard-coded. Only the latin
subsets of the two above-the-fold families are preloaded; preloading more would
compete with the LCP image.

### Verification (local build, mobile emulation)

| | Before | Self-hosted | + preload |
|---|---|---|---|
| Render-blocking | 951 ms (fonts) + 469 ms (css) | 458 ms (css only) | **471 ms (css only)** |
| CLS | 0 | 0.332 ❌ | **0** ✅ |

Typography checked by screenshot — headline, serif italic accent and body text are
unchanged. No external font references remain in the built HTML.

### ⚠️ Still unresolved

TBT is ~2 s and the DOM is 1,339 elements; neither was addressed. LCP is dominated
by the ~2 MB homepage video and the Firebase hero imagery, which is still awaiting
an owner decision. Local Lighthouse has no network latency, so these numbers are
useful for comparing before/after but are **not** production scores.
