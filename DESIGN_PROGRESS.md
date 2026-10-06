# Design system rollout — progress

Tracks the migration described in [DESIGN.md](DESIGN.md). Branch: `design-system`.

## Status

### DONE

**Building blocks (§10)**
- [x] 1 — Tokens: tonal surface ramp (`--surface-container-*`), status roles
      (`success` / `caution` / `info`), glass variables and motion curves in
      `src/index.css`; exposed to Tailwind in `tailwind.config.ts`
- [x] 2 — Motion: `src/lib/motion.ts` — springs, durations, cascade, `useMotion()`
      with the full Reduce Motion mapping (§5.4)
- [x] 3 — Glass surface: `.glass` / `.glass-lg` / `.glass-tinted` in `src/index.css`
      (Tier B base + Tier A behind `@supports`, rim, shadow, all three a11y paths)
      and the `Glass` / `GlassGroup` components in `src/components/ui/glass.tsx`
- [x] 4 — Concentric radii: `src/lib/shape.ts`
- [x] 5 — Segmented control with the sliding selection pill:
      `src/components/ui/segmented.tsx`
- [x] 6 — Scroll edge: `src/components/ui/scroll-edge.tsx`
- [x] 8 — Contrast guard: `src/lib/contrast.ts`

**Surfaces (§3)**
- [x] Site header → glass + hard scroll edge; wishlist count made monochrome
      (`src/components/Header.tsx`)
- [x] Floating WhatsApp → solid pill, off the glass budget (`site/SiteLayout.tsx`)
- [x] PDP sticky enquiry bar → glass, enquiry button is the one tinted control
      (`src/pages/ProductDetail.tsx`)
- [x] Product gallery controls → glass; the image counter moved to the content layer
      (`product/ProductGallery.tsx`)
- [x] Overlay primitives → large glass: `dialog`, `sheet`, `popover`,
      `dropdown-menu` (2 spots), `toast`
- [x] Grid density toggle → `Segmented` (`src/pages/CategoryProducts.tsx`)
- [x] Accessibility widget: added a "Reduce transparency" toggle driving
      `html.a11y-solid` (`site/AccessibilityWidget.tsx`)

**Second pass**
- [x] Sort → `Segmented` (`CategoryProducts.tsx`); labels shortened to fit three
      segments, accessible names kept explicit via `srLabel`
- [x] `brand-foreground` token added — the pill was borrowing `--primary-foreground`
      and only reading correctly by coincidence (see log)
- [x] Soft scroll edge under the PDP action bar; its hard border removed, since a
      pane gets one edge treatment
- [x] Ad-hoc `backdrop-blur` swept from the whole storefront — **0 remaining**
      outside `.glass` (banner, product card, save button, cookie banner, a11y
      widget, craft story, video reels, index hero)
- [x] Skeletons → `.skeleton` tonal ramp class; 23 placeholders across 10 files
- [x] Enquiry form success/error → `success` / `destructive` roles
- [x] Header touch targets raised to 44px

### TODO

- [ ] Diamond shape / metal pickers → selection pill (rule 9)
- [ ] Container transform: product card → product page (§5.3 E), using `motion`
- [ ] Menu / popover morph from source (§5.3 F)
- [ ] Press feedback (§5.3 A): scale + glow on glass controls via `useMotion()`
- [ ] First-load cascade on product grids (§5.3 D)

### Deliberately not changed

- **Filter groups stay multi-select toggles.** The sliding pill is for single-select
  only — a pill can occupy one position, so it cannot express several active filters.
  Rule 9 does not apply to them.
- **Product card already complies with §6.3** — tokenized surface, no resting
  elevation. Its hover shadow is press/hover feedback, not resting elevation.
- **Amber on the announcement bar and the rose wishlist heart** are brand and
  product convention, not status colours, so they were left as-is.
- **Admin panel** — out of scope (decision 5); its `backdrop-blur` usages remain.

## Verification

| Check | State |
|---|---|
| `tsc --noEmit` | **passes** |
| `npm run build` | **passes** — 238 pages prerendered |
| Home + category rendered (headless Chrome over CDP) | **passes** in light, dark, high-contrast, reduced-transparency and reduced-motion |
| Glass header | **verified** in all four display modes; hairline correctly absent at scroll 0 |
| Selection pill | **verified** after fixing a stacking-context bug (see log) |
| Sort + density pills | **verified** in light, dark, high-contrast and solid |
| Mobile PDP action bar | partially — the gallery glass was seen, the sticky bar was covered by the cookie banner in the shot |
| Hover / press / focus states | **not checked** — static screenshots only |
| Motion (springs, pill slide, morphs) | **not checked** — needs a real browser session |

## Log

- **2026-10-06** — Phase 1 discovery, `DESIGN.md` written, decisions 1–7 answered.
  Installed `motion` v14. Built blocks 1–6 and 8. Migrated header, WhatsApp, PDP
  action bar, gallery, five overlay primitives and the density toggle. Added the
  reduce-transparency toggle.
  **Bug found and fixed during verification:** the selection pill used `-z-10`,
  which dropped it behind the track's background and made it invisible — the
  selected icon rendered white-on-grey with nothing behind it. `position: relative`
  with `z-index: auto` creates no stacking context. Fixed by keeping the pill at the
  default level and lifting the label/icon to `z-10`.

- **2026-10-06 (second pass)** — Sort moved to the shared selection pill; soft scroll
  edge added under the PDP bar; ad-hoc `backdrop-blur` swept from the storefront
  (0 remaining outside `.glass`); skeletons moved to the tonal ramp; header touch
  targets raised to 44px.
  **Second bug found during verification:** the selection pill's label used
  `--primary-foreground`, which is the on-colour for ink, not for brand. It happened
  to read correctly in both themes only because brand lightness tracks primary
  lightness per theme — a coincidence, not a rule. Added an explicit
  `--brand-foreground` token and pointed the pill at it.
  Re-verified home and category in all five modes.
