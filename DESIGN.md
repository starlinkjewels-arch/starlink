# Starlink Jewels — Design System

Liquid Glass adapted to this codebase: a floating glass chrome layer over a calm, solid content
layer, expressed through semantic colour roles so light, dark and high-contrast all come from one
set of tokens.

> **Value tags.** **(Apple)** = from Apple's published guidance, keep the rule.
> **(default)** = starting value, tunable. **(project)** = decided for this codebase.

---

## A. Project facts

| Item | Value |
|---|---|
| Product | **Starlink Jewels** — diamond & gold jewellery storefront (catalogue, product detail, enquiry-led; no checkout) |
| Profile (§1) | **Content & marketing site**, with the PDP treated as the one dense screen |
| Platform and toolkit | Web — React 18 + Vite 5 + TypeScript, Tailwind 3, shadcn/ui on Radix, react-router 6 |
| Theme source of truth | `src/index.css` (CSS custom properties) + `tailwind.config.ts` |
| Input | Pointer + keyboard on desktop, touch on mobile |
| Hardware floor and blur tier | Mobile Safari / mid-range Android → **Tier A behind `@supports`**, Tier B fallback |
| Data liveness | User-driven (Firestore reads via react-query / redux). No pushed live updates on the storefront |
| Accessibility target | WCAG 2.2 AA (4.5:1 body), existing a11y widget must keep working |
| Progress file | `DESIGN_PROGRESS.md` |

**Already in place** (do not rebuild): light/dark token sets, `html.a11y-contrast` and
`html.a11y-readable` modes driven by `src/components/site/AccessibilityWidget.tsx`, a
`prefers-reduced-motion` block in `src/index.css`, `.container-wide`, `.heading-*`, `.eyebrow`,
`Reveal.tsx`, `KineticHeading.tsx`.

**Scope.** This document governs the **public storefront**. The admin panel
(`src/components/admin/**`, `src/pages/Admin.tsx`) is a Productivity-profile surface and is **out of
scope** for now — see decision 5.

---

## 1. Profile: Content & marketing site

| Setting | Value |
|---|---|
| Glass budget on screen | **2** (3 on mobile PDP — see decision 1) |
| Motion intensity | Medium; scroll-linked reveals allowed once per section |
| Bounce (release damping) | 0.7 |
| Body text | 16–18px, min 12px |
| Contrast target | 4.5:1 |
| Touch / click target | 44px |
| Default blur tier | A via `backdrop-filter` behind `@supports` |
| First load | Server-prerendered (`scripts/prerender.mjs`) — no skeleton flash on static routes; skeletons only for Firestore-driven lists |

---

## 2. Core rules

1. **Two layers.** *Content* (product cards, rows, galleries, rich text, KPIs) uses solid tonal
   surfaces. *Glass* (header, PDP action bar, filter popovers, sheets, menus, toasts) floats above.
   Never glass in the content layer. (Apple)
2. **Use glass sparingly** — only the most important functional chrome. Respect the budget. (Apple)
3. **No glass on glass.** Controls inside the header use fills, not a second blur.
4. **Regular glass by default.** *Clear* glass only over photography (hero, banner carousel) with a
   ~35% dimming layer. Never mix Regular and Clear on one screen. (Apple)
5. **Glass has no colour of its own.** Labels and icons on glass are `onSurface` /
   `onSurfaceVariant`. **Tint only to convey meaning** — and in this codebase the tint is
   `--brand` (sapphire), never `--primary` (which is ink). One tinted control per glass surface.
6. **Non-interactive items stay off glass.** Counts, badges and the announcement text are plain
   text in or beside the bar, not pills that look pressable. (Apple)
7. **Concentric corners.** inner = outer − padding, min 8px. (Apple)
8. **No solid bar backgrounds, no dividers.** One scroll edge effect per scrolling pane: *hard*
   under the sticky header, *soft* elsewhere. (Apple)
9. **One selection language.** Category tabs, filter chips, shape pickers, metal pickers and sort
   all show "selected" with the same sliding pill and the same spring. (Apple)
10. **Motion is feedback for what the user did.** Glass controls are springy; content is calm.
11. **Morph, don't pop.** A surface opened by a control grows out of that control. (Apple)
12. **Accessible by construction.** Every glass surface ships its Reduce Transparency, Increase
    Contrast and Reduce Motion paths at the same time as its normal path.
13. **Never colour alone.** Every status pairs colour with text or an icon.

---

## 3. Layer map

| Surface | File | Layer | Treatment |
|---|---|---|---|
| Site header | `src/components/Header.tsx` | **Glass** (small) | Replaces today's `bg-background/95 backdrop-blur-xl`; capsule groups, plain-text brand, hard scroll edge |
| Announcement bar | `src/components/Header.tsx` | Content | Tonal band above the glass header; keeps `.bar-shine` |
| Mega / nav menu | `src/components/Header.tsx`, `src/components/site/DesignToolsMenu.tsx` | **Glass** (large) | Morphs from its trigger (§5.3 F) |
| Header search | `src/components/site/HeaderSearch.tsx` | **Glass** (large) | Morphs from the search button |
| Mobile nav drawer | `src/components/ui/sheet.tsx` consumer in `Header.tsx` | **Glass** (large) | Slides from trailing edge, inset 16 |
| Product card | `src/components/product/*`, grids in `CategoryProducts.tsx` | Content | `surfaceContainerHigh`, radius 24, hairline, **no elevation**; keeps `.glint` |
| Product gallery | `src/components/product/ProductGallery.tsx` | Content + **Clear glass** controls | Arrows/counter are clear glass over photography with dimming |
| PDP sticky action bar (mobile) | `src/pages/ProductDetail.tsx:253` | **Glass** (small), tinted | The one tinted control on that screen |
| Filters & sort | `src/components/site/ProductFilters.tsx` | **Glass** (large) | Popover morphs from chip; mobile sheet |
| Filter chips / shape & metal pickers | `src/components/site/ProductFilters.tsx`, `DiamondShapeIcon.tsx` | Content → selection pill | Single-select → `SegmentedControl` (§6.2) |
| Status / stock / badge chips | product components | Content | Tonal wash + icon, not pressable |
| Dialogs & enquiry form | `src/components/ui/dialog.tsx`, `site/EnquiryForm.tsx` | **Glass** (large) | Over 45% scrim; inner sections tonal |
| Toasts | `src/components/ui/toast.tsx` | **Glass** (small) | Rise and fade, don't stack |
| Floating WhatsApp | `src/components/site/SiteLayout.tsx` | **Glass** (small) → see decision 1 | Currently a 3rd glass surface |
| Cookie banner | `src/components/site/CookieBanner.tsx` | **Glass** (large) | Transient; already hides under scroll lock |
| Footer | `src/components/Footer.tsx` | Content | Tonal, keeps `.pattern-lattice` |

---

## 4. Material tokens

### 4.1 The glass recipe

Two tiers. **Tier B must look right on its own**; Tier A is an enhancement behind `@supports`.

| Layer | **Tier B** (no blur) | **Tier A** (`backdrop-filter`) |
|---|---|---|
| Backdrop | none | `blur(24px)` small / `blur(32px)` large **(default)** |
| Fill | `surfaceContainerHigh` @ 88% small / 97% large **(default)** | `surface` @ 62% small / 76% large **(default)** |
| Rim highlight | 1px gradient stroke, top-left white 35% light / 14% dark → 0% bottom-right **(default)** | same |
| Shadow | `0 6px 16px -6px` small / `0 12px 32px -12px` large, tint 18% light / 40% dark **(default)** | same |
| Content on glass | `onSurface`, `onSurfaceVariant`, monochrome icons | same |

```css
@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) { /* Tier A */ }
```

Rules:
- **Group neighbours.** Adjacent glass controls share **one** glass shape, one shadow, one blur
  pass. Large `backdrop-filter` areas are expensive on mobile Safari — keep them to chrome.
- **Size changes material.** Small for header/action bar/toasts; large for menus, sheets, dialogs.
- **Tinted glass** = fill blended 35% toward `--brand`, content `onBrandContainer` **(default)**.
- **Identity (off).** Under Reduce Transparency: opaque `surfaceContainerHigh` + 1px
  `outlineVariant`, no blur, no rim.

### 4.2 Shape — concentric radii

**inner = outer − padding, min 8px.** Never hard-code an inner radius; derive it (§10.4).
Today `--radius: 0.875rem` (14px) is the shadcn base and stays as the control radius.

| Container | Radius **(default)** | Padding | Inner (derived) |
|---|---|---|---|
| Sheets, dialogs, large menus | 28 | 14–18 | 10–14 → children ≥ 8 |
| Product card | 24 | 16 | 8 |
| Section inside a panel | 20 | 12–14 | 8 |
| Glass capsule group (header) | capsule | 4–6 | capsule |
| Chips, badges | capsule | — | — |

### 4.3 Colour

Semantic roles only; no raw hex in components. **New tokens to add** to `src/index.css` — the
existing shadcn roles stay and are aliased, so nothing already built breaks.

| Role | Maps to / add |
|---|---|
| `surface` | existing `--background` |
| `surfaceContainerLow` / `Container` / `High` / `Highest` | **add** — a 4-step tonal ramp; `--secondary` (240 11% 96%) becomes `surfaceContainer` |
| `onSurface` / `onSurfaceVariant` | existing `--foreground` / `--muted-foreground` |
| `outline` / `outlineVariant` | existing `--input` / `--border` |
| **tint** | existing `--brand` (sapphire 219 59% 41%) — **not** `--primary`, which is ink |
| `error` | existing `--destructive` |
| Status `success` / `caution` / `info` | **add** (only `--destructive`, `--gold`, `--whatsapp` exist today) |

Rules:
- **Chrome is neutral.** Status hues belong to content only.
- **Prominence budget:** 1 tinted control per glass surface, at most 2 on screen. (Apple)
- **Contrast:** ≥ 4.5:1 body, ≥ 3:1 large/bold. Add `readable(fg, bg, min)` (§10.8).
- Light, dark and high-contrast variants for every role — high-contrast extends the existing
  `html.a11y-contrast` block rather than replacing it.

### 4.4 Type and spacing

- Keeps `Inter` / `Inter Tight` / `Cormorant Garamond` and the existing `.heading-*` scale.
- Body 16–18px, min 12px. No light weights below 20px.
- **Numbers** that change or align (prices, carat, counts): `font-variant-numeric: tabular-nums`.
  Already used in `ProductGallery.tsx`; make it a token-level utility.
- Touch targets ≥ 44px. **Spacing scale:** 4, 8, 12, 16, 20, 24, 32, 48 only.
- Bars: max 3 groups, 10–12px between groups, one primary action trailing. (Apple)

---

## 5. Motion

### 5.1 Principles

- **Glass is elastic; content is calm.**
- **Morph, don't pop** — surfaces grow from the control that opened them. (Apple)
- **Materialize, don't fade** — glass appears by ramping rim, shadow, opacity and blur with a small
  scale, not alpha alone. (Apple)
- **Interruptible**; never block input while a spring settles.
- **No loops near 0.2 Hz.** (Apple) The WhatsApp `animate-ping` at 2.4s is fine.

### 5.2 Tokens **(default)**

One module owns these (§10.2). No durations or spring numbers in screens.

| Token | Use | Stiffness / damping |
|---|---|---|
| `spring.press` | press-in to 0.96 | 1500 / 1.0 |
| `spring.release` | release, one soft bounce | 400 / 0.7 |
| `spring.select` | selection pill slide + stretch | 500 / 0.78 |
| `spring.morph` | menus, sheets, popovers | 380 / 0.82 |
| `spring.settle` | Reduce Motion replacement | 800 / 1.0 |

| Token | Use | Value |
|---|---|---|
| `dur.micro` | tint, colour, icon swaps | 120ms |
| `dur.short` | fade-through | 200ms |
| `dur.medium` | route change, sheet in | 300ms |
| `dur.long` | container transform | 380ms |
| `stagger` | first-load cascade | 18ms/item, cap 8 |
| `ease.emphasized` | — | `cubic-bezier(0.2, 0, 0, 1)` |

**Without a JS animation library** (decision 2) springs are expressed as CSS `linear()` curves
generated once into `src/index.css`; `SegmentedControl` and morphs use CSS transitions with those
curves. With `motion`, use `type: "spring"` directly.

### 5.3 Catalogue (patterns this product actually has)

- **A. Pressing a glass control** — down: scale 0.96 `spring.press` + radial white glow 18% over
  220ms; up: `spring.release`, glow out 160ms. Pointer: hover fill +4% `onSurface`, focus ring 2px
  `--ring` offset 2. Content cards don't bounce: 6% `onSurface` pressed overlay only.
- **B. Category / filter switching** — selection pill slides on `spring.select`, stretching up to
  12% mid-slide. Grid cross-fades `dur.short`, then cascades the first visible cards. Keeps scroll
  position per view.
- **C. Route change** — fade-through `dur.short` (shared-axis X only between sibling category
  pages). Respects the prerendered first paint.
- **D. First load & lists** — skeletons for Firestore-driven grids (shimmer 1.2s,
  `surfaceContainerHighest` ↔ `surfaceContainer`), then fade-through + cascade. Recycled or
  lazily-loaded cards never animate in. Existing `Reveal.tsx` becomes the one scroll-reveal.
- **E. Opening a product** — container transform from card to PDP, `dur.long`; glass thickens
  during the morph. Close reverses into the card, or dematerializes if offscreen.
- **F. Menus, popovers, filters** — scale from 0.6 at the source to 1.0 on `spring.morph`; radius
  capsule → panel; content fades in after 60ms. (Apple)
- **G. Sheets & dialogs** — scrim 45% `dur.short`; surface materializes from source (0.92 → 1,
  `spring.morph`). Side sheets slide from trailing edge, inset 16. Errors: 360ms decaying shake +
  error flash.
- **H. Scroll edges** — **hard** under the sticky header (hairline fades in at 120ms once content
  scrolls under); **soft** 24px gradient under the PDP action bar. One per pane.
- **I. Toasts** — rise 12px and fade `dur.short`. Replace, don't stack.

### 5.4 Reduce Motion

| Normal | Reduced |
|---|---|
| Springs with bounce | `spring.settle` |
| Press scale + glow | Pressed overlay only |
| Shared-axis / slide | Fade-through `dur.short` |
| Container transform | Cross-fade at destination |
| Cascade / stagger | Single fade |
| Scroll-linked reveals | Content visible immediately |
| Blur ramp | No blur animation |
| Shake | Error text only |

The existing `@media (prefers-reduced-motion: reduce)` block in `src/index.css` already disables
`.reveal`, `.word-mask`, `.clip-reveal`, marquee, float, `.bar-shine`, hero zoom — extend it, don't
duplicate it.

---

## 6. Components

### 6.1 Glass capsule group
Height 52, inner padding 4, capsule; children 44 tall (44 + 2×4 = 52, concentric). Background from
§4.1 small. Children have no background except the selection pill. Groups separated by 10–12. Never
nested.

### 6.2 Selection pill — the only way to show "selected"
One capsule behind the segments, tonal `--brand` fill, selected label on-brand, `dur.micro`. Motion
per §5.3 B. Used by **every** single-select control: category tabs, sort, filter chips, diamond
shape and metal pickers. Exposes `aria-selected`; arrow keys move selection.

### 6.3 Content card / row
`surfaceContainerHigh`, radius 24, 1px `outlineVariant`, **no elevation**. Selected: 2px `--brand`
ring. Keeps the `.glint` hover sweep.

### 6.4 Large glass panel
§4.1 large recipe, radius 28. Inner sections tonal `surfaceContainer`, concentric radius. Modal:
45% scrim. Parallel (desktop filters): no scrim.

### 6.5 Status chip vs action chip
**Status** (in stock, certified, new): content layer, tonal wash + icon, not pressable.
**Action** (filter, shape): inside a glass group, uses the selection pill, pressable.

---

## 7. Layout

- **Edge-to-edge:** content scrolls under the floating header, which sits inset 16 from the edges on
  desktop. Pad content by the chrome height so nothing rests under glass at rest. (Apple)
- **Hierarchy by layout, not boxes:** drop borders and dividers whose only job is separation.
- **Breakpoints:** existing Tailwind scale plus `3xl: 1800px`, `4xl: 2200px`. Keep `.container-wide`
  and its max-width steps — the wide-monitor work from commit `6de5815` stays.
- On expanded widths filters open as a **side panel** (parallel, no scrim); on compact as a **sheet**
  (modal).

---

## 8. Accessibility modes (web)

| Mode | Detection | Effect |
|---|---|---|
| **Reduce transparency** | `prefers-reduced-transparency: reduce` + a toggle in the existing a11y widget (browser support is partial) | Glass → identity: opaque + outline, no blur, no rim |
| **Increase contrast** | `prefers-contrast: more` + existing `html.a11y-contrast` | High-contrast palette, opaque glass, 1.5px `onSurface` outline on glass and chips, no tinted glass |
| **Reduce motion** | `prefers-reduced-motion: reduce` | §5.4 |
| **Large text** | `rem` units, 200% zoom | Layouts reflow; no clipped labels |

Also required: labels on every icon-only control (the header has several), visible keyboard focus,
logical focus order, a non-gesture alternative for the gallery swipe, and a polite live region for
filter-result counts (not per card).

---

## 9. Platform notes — Web

- Tokens as CSS custom properties on `:root`, redefined under `.dark`, `prefers-contrast: more` and
  `html.a11y-contrast`.
- Glass as **one** `.glass` / `.glass--large` class (plus a `tinted` modifier), not 24 scattered
  `backdrop-blur` utilities — those get migrated in (§10.3).
- `backdrop-filter` always inside `@supports`, always with `-webkit-` prefix.
- Motion through one module reading `prefers-reduced-motion` once.
- Mind GPU cost of large `backdrop-filter` areas on mobile Safari — chrome only.

---

## 10. Building blocks (build these first)

| # | Block | Responsibility | Location |
|---|---|---|---|
| 1 | **Tokens** | Role colours, the `surfaceContainer` ramp, status colours, radii, spacing, motion values | `src/index.css` + `tailwind.config.ts` |
| 2 | **Motion** | Springs/durations from §5.2 as `linear()` curves + helpers; reads Reduce Motion once | `src/lib/motion.ts` *(new)* |
| 3 | **Glass surface** | §4.1 recipe, small/large/tinted, identity fallback, Tier A behind `@supports` | `src/index.css` (`.glass`) + `src/components/ui/glass.tsx` *(new)* |
| 4 | **Concentric** | `inner(outer, padding, min = 8)` + shape helper | `src/lib/shape.ts` *(new)* |
| 5 | **Segmented control** | Glass capsule + selection pill (§6.2), pointer + keyboard, one `onSelected` | `src/components/ui/segmented.tsx` *(new)* |
| 6 | **Scroll edge** | Soft/hard edge for a pane under floating chrome (`IntersectionObserver` sentinel) | `src/components/ui/scroll-edge.tsx` *(new)* |
| 7 | **Skeleton** | Shimmer placeholders for product grids | `src/components/ui/skeleton.tsx` *(exists — extend)* |
| 8 | **Readable** | `readable(fg, bg, min)` contrast check for computed colours | `src/lib/contrast.ts` *(new)* |

---

## 11. Don'ts — checklist for every UI diff

- [ ] No glass on content: product cards, grids, rich text, status chips, footer.
- [ ] No glass on glass.
- [ ] No more than one tinted control per glass surface; tint is `--brand`, never decoration.
- [ ] No status colours on chrome; no colour as the only signal.
- [ ] No bounce on content; no pure alpha fade for glass appearing.
- [ ] No scroll edge where nothing floats; never soft and hard on one pane.
- [ ] No hard-coded radii, colours, durations or springs in screens.
- [ ] No new `backdrop-blur-*` utility in a component — use `.glass`.
- [ ] No glass surface without its Reduce Transparency, Increase Contrast and Reduce Motion paths.
- [ ] No refraction shaders or motion-sensor highlights — the rim gradient is the specular cue.

---

## 12. Decisions — **answered 2026-10-06**

| # | Decision | Answer |
|---|---|---|
| 1 | Glass budget on the PDP | **Demote WhatsApp to a solid pill.** Done — `SiteLayout.tsx`. The sticky enquiry bar is the one tinted control on that screen |
| 2 | Motion library | **Add `motion`** (v14, `motion/react`). Tree-shaken: only pulled into chunks that use it |
| 3 | Blur tier | **Tier A behind `@supports`**, Tier B as the base so it looks right with no blur |
| 4 | Rule 6 — non-interactive items off glass | **Applied.** Wishlist count is monochrome, gallery counter moved to the content layer |
| 5 | Admin panel | **Out of scope.** Storefront only; admin keeps its current look |
| 6 | Dark mode | Tokens maintained, no new toggle this pass (the header already has one) |
| 7 | Branch | Working on **`design-system`** |

---

## 13. Sources

- Apple, Liquid Glass: <https://developer.apple.com/documentation/technologyoverviews/liquid-glass>,
  <https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass>
- Apple HIG: materials, colour, motion, layout, typography, accessibility
- WWDC25 219 *Meet Liquid Glass*, 356 *Get to know the new design system*
- Material 3 colour roles, motion, shape — <https://m3.material.io>
- WCAG 2.2 — <https://www.w3.org/TR/WCAG22/>
