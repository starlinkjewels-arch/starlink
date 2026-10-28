import { useState } from "react";

/**
 * True when this visit should avoid heavy media (autoplaying video).
 *
 * Triggers on a phone-sized viewport, an explicit Save-Data header, a slow effective
 * connection, or Reduce Motion (an autoplaying loop is motion the user asked not to see).
 *
 * Computed synchronously on the first render, NOT in an effect. An earlier version
 * started at `false` and corrected itself after mount — which meant the first render
 * mounted the <video> and started the download, and any mount-only effect reading this
 * value saw `false` and attached its loader. On a phone, the one case this exists for,
 * the video was fetched anyway. The app mounts with createRoot (no SSR hydration), so
 * `window` is always available here.
 *
 * Deliberately not re-evaluated on resize: swapping a playing video for a poster
 * mid-session is worse than either choice on its own.
 */
export function useLightMedia(): boolean {
  const [light] = useState(detectLightMedia);
  return light;
}

export function detectLightMedia(): boolean {
  if (typeof window === "undefined") return false;

  const narrow = window.matchMedia?.("(max-width: 768px)").matches ?? false;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  // navigator.connection is absent from some typings and from Safari entirely.
  const conn = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;
  const saveData = conn?.saveData === true;
  const slow = /(^|-)(2g|slow-2g)$/.test(conn?.effectiveType ?? "");

  return narrow || reduced || saveData || slow;
}

export default useLightMedia;
