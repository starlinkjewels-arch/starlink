/**
 * Segmented control — DESIGN.md §6.2.
 *
 * The ONE way this product shows "selected". Category tabs, sort, filter chips,
 * diamond shape and metal pickers all use this, so selection looks and moves the
 * same everywhere: a tonal pill that slides between segments on `spring.select`.
 *
 * The pill is a single shared element (`layoutId`), so motion animates it between
 * segments rather than cross-fading two boxes.
 */
import { useCallback, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { LayoutGroup, motion } from "motion/react";
import { useMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type SegmentedItem<T extends string = string> = {
  value: T;
  label: ReactNode;
  /** Optional leading icon — monochrome, it inherits colour. */
  icon?: ReactNode;
  /**
   * Accessible name, used when the visible label is an icon or is abbreviated
   * ("A–Z" → "Name A to Z"). Replaces the accessible name; it is not read in
   * addition to the visible label.
   */
  srLabel?: string;
};

type SegmentedProps<T extends string = string> = {
  items: SegmentedItem<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** Accessible name for the whole group, e.g. "Sort products". */
  label: string;
  /** `glass` floats as chrome; `plain` sits in the content layer (filter rows). */
  variant?: "glass" | "plain";
  size?: "sm" | "md";
  className?: string;
};

export function Segmented<T extends string = string>({
  items,
  value,
  onValueChange,
  label,
  variant = "glass",
  size = "md",
  className,
}: SegmentedProps<T>) {
  const m = useMotion();
  const groupId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // Arrow keys move selection (roving tabindex): only the selected segment is
  // tabbable, so the control is one stop in the page's tab order.
  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
      const last = items.length - 1;
      let next: number | null = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = index === last ? 0 : index + 1;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = index === 0 ? last : index - 1;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = last;
      if (next === null) return;
      e.preventDefault();
      onValueChange(items[next].value);
      refs.current[next]?.focus();
    },
    [items, onValueChange],
  );

  const pad = size === "sm" ? "p-0.5" : "p-1";
  const seg = size === "sm" ? "h-9 px-3 text-xs" : "h-11 px-4 text-sm";

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1 rounded-full",
        pad,
        variant === "glass" ? "glass" : "bg-surface-container",
        className,
      )}
    >
      <LayoutGroup id={groupId}>
        {items.map((item, i) => {
          const selected = item.value === value;
          return (
            <button
              key={item.value}
              ref={(el) => (refs.current[i] = el)}
              type="button"
              role="tab"
              aria-selected={selected}
              // srLabel replaces the accessible name rather than appending to it, so a
              // segment reading "Newest" is not announced as "Newest Newest first".
              aria-label={item.srLabel}
              tabIndex={selected ? 0 : -1}
              onClick={() => onValueChange(item.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "relative inline-flex min-w-[44px] items-center justify-center gap-2 rounded-full font-medium",
                "transition-colors duration-150 outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                seg,
                selected ? "text-brand-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {/* The sliding pill. One element for the whole group.
                  It must NOT use a negative z-index: `position: relative` with
                  `z-index: auto` creates no stacking context, so -z-10 would drop the
                  pill behind the track's own background and make it invisible.
                  Instead the pill sits at the default level and the content is lifted. */}
              {selected && (
                <motion.span
                  layoutId={`segmented-pill-${groupId}`}
                  className="absolute inset-0 rounded-full bg-brand"
                  transition={m.select}
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-2">
                {item.icon}
                {item.label}
              </span>
            </button>
          );
        })}
      </LayoutGroup>
    </div>
  );
}

export default Segmented;
