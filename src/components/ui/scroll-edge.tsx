/**
 * Scroll edge effect — DESIGN.md §5.3 H.
 *
 * Where content scrolls under floating glass there is no solid bar background and
 * no divider; the edge itself does the separating. One per pane, and only where
 * something actually floats.
 *
 *   hard — pinned headers and tables: a hairline fades in once content is underneath
 *   soft — everything else: a short gradient from the pane colour to transparent
 *
 * `useScrolledUnder` drives the hard variant: a zero-height sentinel at the top of
 * the pane, watched with IntersectionObserver, so nothing runs on scroll.
 */
import { useEffect, useRef, useState, type RefObject } from "react";
import { cn } from "@/lib/utils";

/**
 * True once the page has scrolled past the sentinel, i.e. content is under the
 * floating chrome. Attach the returned ref to an element at the very top of the pane.
 */
export function useScrolledUnder<T extends HTMLElement = HTMLDivElement>(): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [under, setUnder] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setUnder(!entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, under];
}

/** Zero-height marker to place at the top of a scrolling pane. */
export function ScrollSentinel({ innerRef }: { innerRef: RefObject<HTMLDivElement> }) {
  return <div ref={innerRef} aria-hidden className="h-px w-full" />;
}

/**
 * Soft edge: a gradient that fades the pane colour out beneath floating chrome.
 * Render as the last child of a `relative` pane.
 */
export function SoftScrollEdge({
  side = "bottom",
  className,
}: {
  side?: "top" | "bottom";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 z-20 h-6",
        side === "top"
          ? "top-0 bg-gradient-to-b from-background to-transparent"
          : "bottom-0 bg-gradient-to-t from-background to-transparent",
        className,
      )}
    />
  );
}

/**
 * Hard edge: the hairline a pinned header grows once content scrolls under it.
 * Spread onto the header element.
 */
export function hardEdgeClass(under: boolean): string {
  return cn(
    "transition-[box-shadow,border-color] duration-[120ms]",
    under ? "border-b border-border/80" : "border-b border-transparent",
  );
}
