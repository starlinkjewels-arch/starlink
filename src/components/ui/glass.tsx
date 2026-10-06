/**
 * Glass surface — DESIGN.md §4.1 / §6.1.
 *
 * The only way to put glass on screen. Components never reach for `backdrop-blur-*`
 * utilities: the recipe (fill, blur tier, rim, shadow) and all three accessibility
 * fallbacks live in the `.glass` / `.glass-lg` classes in index.css.
 *
 * Size changes the material: `sm` for bars, action bars and toasts; `lg` for menus,
 * popovers, sheets and dialogs.
 */
import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type GlassProps = HTMLAttributes<HTMLDivElement> & {
  /** `sm` = bars and small chrome, `lg` = panels, sheets, menus. */
  size?: "sm" | "lg";
  /**
   * The one tinted control on this surface. Tint is `--brand` and must carry
   * meaning (the primary action) — never decoration. Max one per glass surface.
   */
  tinted?: boolean;
  as?: ElementType;
};

export const Glass = forwardRef<HTMLDivElement, GlassProps>(
  ({ size = "sm", tinted = false, as, className, children, ...rest }, ref) => {
    const Comp = (as ?? "div") as ElementType;
    return (
      <Comp
        ref={ref}
        className={cn(size === "lg" ? "glass-lg" : "glass", tinted && "glass-tinted", className)}
        {...rest}
      >
        {children}
      </Comp>
    );
  },
);
Glass.displayName = "Glass";

/**
 * A capsule group of glass controls (DESIGN.md §6.1).
 *
 * Adjacent controls share ONE glass shape, one shadow and one blur pass — grouping
 * neighbours is both the Apple rule and the cheap option, since each blurred area
 * costs a sampling pass. Children get no background of their own; only the
 * selection pill is filled.
 *
 * Height 52 = 44 child + 2x4 padding, which keeps the corners concentric.
 */
export const GlassGroup = forwardRef<HTMLDivElement, Omit<GlassProps, "size">>(
  ({ className, children, ...rest }, ref) => (
    <Glass
      ref={ref}
      size="sm"
      className={cn("flex items-center gap-1 rounded-full p-1", className)}
      {...rest}
    >
      {children}
    </Glass>
  ),
);
GlassGroup.displayName = "GlassGroup";

export default Glass;
