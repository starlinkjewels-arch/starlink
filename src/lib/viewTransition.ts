/**
 * Container transform — DESIGN.md §5.3 E.
 *
 * A product opens by growing out of the card that was tapped, rather than the page
 * swapping underneath. On the web that is the View Transitions API: the browser
 * snapshots before and after, and morphs any pair of elements that share a
 * `view-transition-name`.
 *
 * The catch is that a name must be unique in the document at snapshot time, so the
 * name cannot simply be stamped on every card in the grid. It is applied to the one
 * card being opened, synchronously in its click handler (before the navigation
 * starts the transition), and cleared once the transition finishes.
 *
 * Browsers without the API just navigate; React Router falls back cleanly.
 */

import { useCallback } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import type { MouseEvent } from "react";

export const PRODUCT_HERO = "product-hero";

export const supportsViewTransitions = () =>
  typeof document !== "undefined" && "startViewTransition" in document;

let tagged: HTMLElement | null = null;

/** Clears the name from whichever element currently holds it. */
export function clearProductHero() {
  if (tagged) {
    tagged.style.removeProperty("view-transition-name");
    tagged = null;
  }
}

/**
 * Names `el` as the shared element for the next navigation. Call synchronously
 * from the click handler on the card being opened.
 */
export function tagProductHero(el: HTMLElement | null) {
  if (!el || !supportsViewTransitions()) return;
  // Reduce Motion: no morph at all, the destination simply appears.
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  clearProductHero();
  el.style.setProperty("view-transition-name", PRODUCT_HERO);
  tagged = el;
}

/**
 * Names the destination image on the product page so the browser has something to
 * morph into, then releases it. Returns a cleanup for useEffect.
 */
export function receiveProductHero(el: HTMLElement | null) {
  if (!el || !supportsViewTransitions()) return () => {};
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return () => {};
  el.style.setProperty("view-transition-name", PRODUCT_HERO);
  // Release the name once the transition settles, so a later navigation (or a
  // second product) is free to claim it.
  const release = window.setTimeout(() => el.style.removeProperty("view-transition-name"), 600);
  return () => {
    window.clearTimeout(release);
    el.style.removeProperty("view-transition-name");
  };
}

/**
 * Click handler for a link that should open with the container transform.
 *
 * React Router's own `viewTransition` prop only works with a data router
 * (`createBrowserRouter` + `RouterProvider`). This app uses `<BrowserRouter>`,
 * where that prop is silently ignored — verified: `startViewTransition` was never
 * called. So the transition is driven here instead.
 *
 * `flushSync` matters: the View Transitions API snapshots the DOM when the
 * callback returns, so React has to have committed the new route by then.
 */
export function useProductTransition(href: string, sharedEl?: () => HTMLElement | null) {
  const navigate = useNavigate();

  return useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      // Let the browser handle anything that isn't a plain left click, so
      // open-in-new-tab and friends keep working.
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!supportsViewTransitions()) return;
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

      e.preventDefault();
      tagProductHero(sharedEl?.() ?? null);
      (document as Document & {
        startViewTransition: (cb: () => void) => { finished: Promise<void> };
      }).startViewTransition(() => {
        flushSync(() => navigate(href));
      });
    },
    [href, navigate, sharedEl],
  );
}
