/**
 * First-load cascade — DESIGN.md §5.3 D.
 *
 * When a grid first fills, its leading items rise and fade in one after another,
 * capped at 8 so a long grid never crawls.
 *
 * Deliberately NOT a scroll reveal. `Reveal.tsx` records that scroll-triggered
 * entrance animation was removed at the client's request; this fires once, when the
 * grid first mounts, and never again — not on scroll, not on re-sort, not on filter
 * changes. Items beyond the cap, and every later insert, appear with no animation.
 *
 * To remove it entirely: drop the <Cascade> wrapper in CategoryProducts.tsx.
 */
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { easeEmphasized, useMotion } from "@/lib/motion";

export function Cascade({
  index,
  enabled = true,
  children,
  className,
}: {
  index: number;
  /** False once the first paint is done, so later renders do not re-animate. */
  enabled?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const m = useMotion();

  // Reduce Motion collapses the cascade to a single fade (§5.4) — handled by the
  // parent rendering children directly, so nothing animates at all here.
  if (!enabled || m.reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: m.cascade(index), duration: 0.2, ease: easeEmphasized }}
    >
      {children}
    </motion.div>
  );
}

export default Cascade;
