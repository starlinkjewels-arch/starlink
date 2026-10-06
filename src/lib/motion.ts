/**
 * Motion tokens — DESIGN.md §5.2.
 *
 * The single source of springs and durations. Screens import from here; they never
 * contain their own numbers. Everything is Reduce Motion aware: `useMotion()`
 * returns the settled (bounce-free) variants when the user asks for less motion,
 * so call sites stay identical in both modes.
 */
import { useEffect, useState } from "react";
import type { Transition } from "motion/react";

/** Glass is elastic; content is calm. Bounce belongs to chrome only. */
export const spring = {
  /** press-in to 0.96 — instant, no overshoot */
  press: { type: "spring", stiffness: 1500, damping: 70 },
  /** release — one soft bounce (profile damping 0.7) */
  release: { type: "spring", stiffness: 400, damping: 28 },
  /** selection pill slide + stretch */
  select: { type: "spring", stiffness: 500, damping: 35 },
  /** panels, popovers and sheets growing from their source */
  morph: { type: "spring", stiffness: 380, damping: 32 },
  /** Reduce Motion replacement for every spring above */
  settle: { type: "spring", stiffness: 800, damping: 57 },
} satisfies Record<string, Transition>;

export const duration = {
  micro: 0.12,
  short: 0.2,
  medium: 0.3,
  long: 0.38,
} as const;

/** Material 3 emphasized easing, matching --ease-emphasized in index.css. */
export const easeEmphasized = [0.2, 0, 0, 1] as const;

/** First-load cascade: 18ms per item, capped at 8 so long grids don't crawl. */
export const STAGGER = 0.018;
export const STAGGER_CAP = 8;
export const cascadeDelay = (index: number) => Math.min(index, STAGGER_CAP) * STAGGER;

/** Content enter translation (px) — cards rise further than rows. */
export const offsetEnter = { card: 12, row: 8 } as const;

/**
 * Tracks `prefers-reduced-motion`. Read once here rather than in every component.
 * Starts from the real value so the first paint is already correct.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export type MotionTokens = {
  reduced: boolean;
  spring: typeof spring;
  duration: typeof duration;
  /** Press feedback: scale under Reduce Motion is dropped, the overlay carries it. */
  press: { scale: number; transition: Transition };
  /** Selection pill movement. */
  select: Transition;
  /** Morphing surfaces (menus, sheets, dialogs). */
  morph: Transition;
  /** Fade-through between layouts. */
  fadeThrough: Transition;
  /** Per-item cascade delay; 0 when reduced (single fade instead). */
  cascade: (index: number) => number;
};

/**
 * The hook screens use. Under Reduce Motion every spring collapses to `settle`,
 * press scaling is disabled and the cascade becomes a single fade (§5.4).
 */
export function useMotion(): MotionTokens {
  const reduced = usePrefersReducedMotion();

  return {
    reduced,
    spring,
    duration,
    press: reduced
      ? { scale: 1, transition: spring.settle }
      : { scale: 0.96, transition: spring.press },
    select: reduced ? { duration: duration.micro } : spring.select,
    morph: reduced ? { duration: duration.short, ease: easeEmphasized } : spring.morph,
    fadeThrough: { duration: duration.short, ease: easeEmphasized },
    cascade: (index: number) => (reduced ? 0 : cascadeDelay(index)),
  };
}
