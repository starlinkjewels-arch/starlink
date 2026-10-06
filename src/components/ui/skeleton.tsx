import { cn } from "@/lib/utils";

/**
 * Loading placeholder — DESIGN.md §5.3 D.
 *
 * The animation lives in the `.skeleton` class so the tonal values come from the
 * surface ramp and the Reduce Motion path is defined in one place, rather than
 * each skeleton pulsing its own opacity.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton rounded-md", className)} {...props} />;
}

export { Skeleton };
