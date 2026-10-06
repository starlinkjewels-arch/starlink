/**
 * Concentric radii — DESIGN.md §4.2.
 *
 * Nested corners must stay concentric with their container: an inner radius is
 * always the outer radius minus the padding between them, never a hand-picked
 * number. Anything nested inside a rounded surface derives its radius here.
 */

/** Minimum inner radius (Apple): below this, corners read as square. */
export const MIN_RADIUS = 8;

/**
 * inner = outer - padding, floored at `min`.
 *
 * @param outer   container radius in px
 * @param padding gap between container edge and child edge, in px
 */
export function inner(outer: number, padding: number, min = MIN_RADIUS): number {
  return Math.max(outer - padding, min);
}

/** Container radii from the token table (DESIGN.md §4.2), in px. */
export const radius = {
  /** sheets, dialogs, large menus */
  panel: 28,
  /** product / content card */
  card: 24,
  /** section nested inside a panel */
  section: 20,
  /** base control radius — matches --radius (0.875rem) */
  control: 14,
  /** capsule */
  pill: 9999,
} as const;

/** `border-radius` string for a child, derived from its container. */
export function innerRadius(outer: number, padding: number, min = MIN_RADIUS): string {
  return `${inner(outer, padding, min)}px`;
}

/**
 * Inline style for a concentric child. Use when a child sits inside a rounded
 * container and must not be given a literal radius.
 *
 *   <div style={concentric(radius.panel, 16)} />
 */
export function concentric(outer: number, padding: number, min = MIN_RADIUS) {
  return { borderRadius: innerRadius(outer, padding, min) };
}
