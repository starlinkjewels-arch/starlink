/**
 * Press feedback — DESIGN.md §5.3 A.
 *
 * Glass is elastic, content is calm, so the two get different feedback:
 *
 *   glass   — scales to 0.96 on press and releases with one soft bounce, while a
 *             radial glow spreads from the pointer ("illuminates from within")
 *   content — a flat 6% pressed overlay, no scale, no bounce
 *
 * Under Reduce Motion the scale and the glow are dropped and the overlay carries
 * the feedback on its own, so call sites never branch.
 */
import { forwardRef, useCallback, type ElementType, type PointerEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { useMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Tracks the pointer inside an element and publishes it as `--px` / `--py`, which
 * `.press-glow` uses as the origin of the glow. Returns nothing when motion is
 * reduced, so no listeners are attached at all.
 */
export function usePressOrigin(enabled = true) {
  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (!enabled) return;
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--px", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--py", `${((e.clientY - r.top) / r.height) * 100}%`);
    },
    [enabled],
  );
  return enabled ? { onPointerDown } : {};
}

/**
 * Motion components are created once at module scope. Calling `motion.create()`
 * during render would return a new component type on every render, which makes
 * React unmount and remount the whole subtree each time.
 */
const MOTION_TAGS = {
  button: motion.button,
  a: motion.a,
  div: motion.div,
  span: motion.span,
  li: motion.li,
} as const;

type PressableTag = keyof typeof MOTION_TAGS;

type PressableProps = {
  children: ReactNode;
  className?: string;
  /** `glass` = chrome (scale + glow). `content` = cards and rows (overlay only). */
  surface?: "glass" | "content";
  as?: PressableTag;
  disabled?: boolean;
  [key: string]: unknown;
};

/**
 * A control with the house press feedback. Use for glass chrome; pass
 * `surface="content"` for cards and rows, which must not bounce.
 */
export const Pressable = forwardRef<HTMLElement, PressableProps>(
  ({ children, className, surface = "glass", as, disabled, ...rest }, ref) => {
    const m = useMotion();
    const isGlass = surface === "glass";
    const origin = usePressOrigin(isGlass && !m.reduced && !disabled);

    // `as` widens to unknown through the index signature, so narrow it back here.
    const Comp = MOTION_TAGS[(as as PressableTag) ?? "button"] as ElementType;

    return (
      <Comp
        ref={ref}
        disabled={disabled}
        className={cn(
          "relative isolate outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isGlass && !m.reduced && "press-glow",
          !isGlass && "press-overlay",
          className,
        )}
        // Content never bounces; glass scales only when motion is allowed.
        whileTap={disabled || !isGlass || m.reduced ? undefined : { scale: m.press.scale }}
        whileHover={disabled || m.reduced ? undefined : isGlass ? { scale: 1.02 } : undefined}
        transition={m.press.transition}
        {...origin}
        {...rest}
      >
        {children}
      </Comp>
    );
  },
);
Pressable.displayName = "Pressable";

export default Pressable;
