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

---

## 2026-10-28 — Phase 5: hero image, duplicate downloads, phone video

### How this was measured

A fresh, isolated Chrome browser context at a phone viewport (390×844, DPR 2): empty
HTTP cache, no service worker, but caching **enabled** so a URL requested twice on
the same page is reused as it would be for a real visitor. Two earlier methods gave
wrong answers and are recorded so nobody repeats them:

- **Reusing a browser profile** reported the homepage film as not loading on phones.
  The site's service worker was serving it, which hid the download.
- **Disabling the cache** made every repeat of an *identical* URL look like a second
  download, inflating duplicates.

### What was wrong

1. **Every image in the pre-rendered HTML was a raw Firebase URL.** The browser began
   fetching them while parsing, then React replaced the page and requested the CDN
   versions — so each was downloaded twice. 11 raw images, 1,224 KiB.
2. **The app-wide preloader requested URLs nothing displayed.** It preloaded every
   banner at `w=1600` (`fetchpriority=high`) and thumbnails at `w=800`, on every route,
   while banners rendered the raw URL and product cards a `600×600` crop. Each banner
   ended up downloaded three times (CDN 1600, raw, CDN 800).
3. **The 1,959 KiB craftsmanship film loaded on phones on first visit** — a third of
   the page. The section's 1000px `rootMargin` reaches it almost immediately on a short
   viewport.

### What changed

- `src/lib/imageUrl.ts` — `cdnSrcSet()` and `HERO_*` constants (480/768/1024/1440,
  `sizes="(min-width: 1024px) 50vw, 100vw"`).
- `scripts/seo-data.mjs` — a byte-identical mirror of `cdnImg`/`cdnSrcSet`, **verified
  identical** against the TypeScript original. Pre-rendered body images now use the
  exact presets the components request (`CARD_CDN`, `SLIDE_CDN`, blog `w=1600`), so
  the browser reuses one response instead of fetching twice. Banners are now read in
  `fetchCatalog`, in the same order as `getBanners()`.
- `scripts/prerender.mjs` — the homepage `<head>` preloads the first banner with
  `imagesrcset`/`imagesizes`/`fetchpriority="high"`, so the LCP fetch starts at HTML
  parse time, before any JavaScript or Firestore read.
- `BannerCarousel.tsx` — renders the same srcset; the next slide is warmed with an
  `Image` carrying the same srcset/sizes, replacing a fixed-800px warm that never matched.
- `App.tsx` — removed the app-wide preloader.
- `useLightMedia` + `CraftStory.tsx` — phones, Save-Data, slow links and Reduce Motion
  keep the film's poster and never fetch the film. Desktop is unchanged.

### Results — phone, first visit

| | Production | This build |
|---|---|---|
| **Total** | 5,647 KiB | **2,010 KiB (−64%)** |
| Images | 2,664 KiB | 988 KiB |
| Video | 1,959 KiB | **0** |
| Bytes wasted on duplicate downloads | 665 KiB | **0** |
| Raw un-resized Firebase images | 11 | **0** |

Desktop still loads the film (1,958 KiB), as intended.

### Bugs caught in my own changes during verification

- **`useLightMedia` started `false` and corrected itself after mount**, so the first
  render mounted the `<video>` and `CraftStory`'s mount-only effect read `false` — the
  phone guard would have done nothing on phones. Caught by an eslint
  `exhaustive-deps` warning. Now computed synchronously on first render.
- **The hero had lost its outage protection.** It used to load straight from Firebase;
  after this change it depended on wsrv.nl with no fallback. Added `onError` → drop the
  srcset and load the original, and **verified by blocking wsrv.nl entirely**: the hero
  still renders, served from Firebase.

### ⚠️ Not verified

- A headless `--virtual-time-budget` screenshot showed a broken hero on phones. It is an
  artifact: virtual time fast-forwards the carousel's autoplay to a lazy, re-keyed slide
  and captures it mid-load. Real-time screenshots of both production and this build
  render correctly, and both report every banner image loaded.
- LCP in seconds is still unmeasured — lab timing on this machine varied 8× between
  identical runs. Bytes and request counts above are deterministic; timings are not.

---

## 2026-10-28 — Phase 6: shape sub-collections, country pages, one H1, one robots meta

### Research input

Strategy was cross-checked with Gemini (search grounding was quota-blocked on the
free-tier key, so its input was reasoning, not fresh search). Its useful calls were
verified against the real catalogue and live HTML before acting on any of them:

| Gemini said | Measured | Outcome |
|---|---|---|
| Country pages are doorway risk; hreflang is the wrong tool | `/usa` vs `/canada`: 97% shared vocabulary, 12/13 long sentences identical | **Acted on** |
| `llms.txt` has no evidenced ranking effect | Consistent with what is known | Left as is, no further investment |
| Build 25–35 sub-collections | Only **13** shape × collection combos have ≥ 6 pieces; metal and lab/natural are detectable on < 40% of products | **Built 13**, not 35 — the rest would be scaled thin content |
| Product pages are near-duplicates | Median 502 visible words, 59/60 unique titles, 0 duplicate descriptions | **Rejected** — they are substantial pages |

### Shape sub-collections — 13 new indexable pages

`/category/<collection>/<shape>`, e.g. `/category/rings/oval`. Built only where a shape has
**≥ 6 pieces** in a jewellery-type collection (Custom, Ready to Ship and Cuban excluded).

```
rings/round 30   rings/marquise 11   rings/oval 9    rings/pear 9   rings/heart 8   rings/emerald 6
pendants/round 16   necklaces/round 14   earrings/round 11   earrings/pear 9
bracelets/round 9   bracelets/emerald 8   eternity-bands/round 6
```

Each has a keyword-led title (≤ 60), a 140–155 char description, one H1, a factual
gemological description of the cut (no business claims), the real product count,
`CollectionPage` + `ItemList` + `BreadcrumbList` schema, and a self-canonical. Parent
collections link to them through a crawlable "Shop by shape" nav (rendered by both the
pre-render and the app — React replaces the static DOM, so without the app's copy those
links would vanish for users and JS-rendering crawlers). A shape view below the bar still
works but is noindex and never linked or pre-rendered.

**Crawler/user parity, proven:** a pre-rendered collection must list exactly what the app
shows, or crawlers and users see different content. The pre-render's shape detection was
run against the app's — the app's half in real Chrome, because the app strips HTML with
`DOMParser` — on all 192 products: **192/192 identical**.

That test found **a live bug in the app**: `DOMParser`'s `textContent` joins adjacent block
elements with no space, so `<h2>…Princess Cut</h2><h2>Metal:` became "Princess CutMetal",
and a genuinely princess-cut product was missing from the live Princess filter.
`stripHtml` now breaks after block closes first.

### Country pages → noindex, follow

Not rewritten with country detail: duties, delivery times and local certification are
business facts I do not have. Kept live for visitors and ads; out of the index and sitemap.
Two places would have quietly undone it and were fixed: `buildSitemapXml` now filters
noindex itself (the daily sitemap workflow calls it too), and `sitemap-urls.txt` — submitted
to IndexNow daily — no longer includes them.

### Exactly one H1 per page — all 251 pages

- Every page had **two**: `index.html`'s `<noscript>` fallback carried its own `<h1>`, and the
  template is copied into every page. Demoted it; also dropped the country links from it.
- Five articles had **up to 20**, because editors use H1 for section headings. CMS content
  now renders H1 as H2, in both the pre-render (`safeArticleHtml`) and the app (`RichText`).

### Exactly one robots meta per page

Every page carried **two** robots metas: the template's (unmarked, so `main.tsx` never
removed it) plus Helmet's. Where they disagreed — a thin shape page said `index` and
`noindex` at once — the signals conflicted. On noindex pages, `googlebot`/`bingbot` also
still said `index`. The pre-render now marks all three `data-prerender` and keeps them
consistent; after hydration there is exactly one directive per page. Thin shape pages are
noindex with a **self**-canonical (noindex + a canonical to another URL is a mixed signal).

**Behaviour change worth knowing:** a brand-new product served by the SPA fallback before
the next build is now indexable by JS-rendering crawlers immediately, instead of being held
at `noindex` by the conflicting static tag. Bad URLs remain noindex via `NotFound`. This
supersedes the earlier note that new products "stay soft" until rebuilt.

### Verification

| Check | Result |
|---|---|
| `tsc` / eslint on changed files | clean |
| Pages built | 251 + 201 legacy redirects |
| Sitemap | 234 → **247** (−4 country, +13 shape) |
| Shape detection parity, pre-render vs app (real Chrome) | **192/192** |
| Pages with exactly one real H1 | **251/251** (2 empty SPA shells have none, by design) |
| Robots metas after hydration | **exactly 1** on every page type tested |
| `/category/rings/oval` in the app | correct H1, title, canonical, 9 products, active nav |
| Invalid shape (`/category/rings/not-a-shape`) | redirects to `/category/rings` |
