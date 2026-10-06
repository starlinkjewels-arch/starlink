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

### TODO

- [ ] Filters & sort: sort `Select` → `Segmented`; filter chips → selection pill
      (`site/ProductFilters.tsx`)
- [ ] Diamond shape / metal pickers → selection pill (rule 9: one selection language)
- [ ] Product card → `surfaceContainerHigh` + hairline, confirm no elevation (§6.3)
- [ ] Container transform: product card → product page (§5.3 E), using `motion`
- [ ] Menu / popover morph from source (§5.3 F)
- [ ] Soft scroll edge under the PDP action bar (§5.3 H)
- [ ] Status chips → `success` / `caution` / `info` containers instead of ad-hoc colours
- [ ] Skeletons → tonal ramp shimmer (§5.3 D)
- [ ] Sweep remaining ad-hoc `backdrop-blur-*` in storefront components
      (`BannerCarousel.tsx`, `AdPopup.tsx`) — admin is out of scope
- [ ] Audit the 44px touch-target floor across header controls

## Verification

| Check | State |
|---|---|
| `tsc --noEmit` | **passes** |
| `npm run build` | **passes** — 238 pages prerendered |
| Home + category rendered (headless Chrome over CDP) | **passes** in light, dark, high-contrast, reduced-transparency and reduced-motion |
| Glass header | **verified** in all four display modes; hairline correctly absent at scroll 0 |
| Selection pill | **verified** after fixing a stacking-context bug (see log) |
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
