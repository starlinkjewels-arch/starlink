import { cdnImg } from './imageUrl';

const isBrowser = typeof window !== 'undefined';

// Track what we've already started preloading so we don't duplicate requests
const preloaded = new Set<string>();

/**
 * Preload a list of image URLs via the CDN (wsrv.nl WebP) immediately.
 * - Converts Firebase Storage URLs to optimized CDN URLs automatically
 * - Uses <link rel="preload"> for browser-level prioritization
 * - Falls back to Image() constructor for browsers without preload support
 */
export const preloadImages = (rawUrls: string[], cdnWidth = 800): void => {
  if (!isBrowser) return;
  const urls = Array.from(new Set(rawUrls.filter(Boolean)));
  if (urls.length === 0) return;

  urls.forEach((raw) => {
    const url = cdnImg(raw, { width: cdnWidth }); // auto-converts Firebase → wsrv.nl
    if (preloaded.has(url)) return;
    preloaded.add(url);

    // Use <link rel="preload"> — browser-level, highest priority hint
    try {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    } catch {
      // Fallback: Image() constructor
      const img = new Image();
      img.src = url;
    }
  });
};

/**
 * Preload critical (above-the-fold) images with high priority.
 * Uses fetchpriority="high" hint.
 */
export const preloadCritical = (rawUrls: string[], cdnWidth = 1600): void => {
  if (!isBrowser) return;
  const urls = Array.from(new Set(rawUrls.filter(Boolean)));
  if (urls.length === 0) return;

  urls.forEach((raw) => {
    const url = cdnImg(raw, { width: cdnWidth, quality: 85 });
    if (preloaded.has(url)) return;
    preloaded.add(url);

    try {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      link.setAttribute('fetchpriority', 'high');
      document.head.appendChild(link);
    } catch {
      const img = new Image();
      (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = 'high';
      img.src = url;
    }
  });
};

// ── Legacy exports (kept for backwards compatibility) ──────────────────────

let assetsPreloaded = false;
const mediaPreloaded = new Set<string>();

/** @deprecated Use preloadImages() instead */
export const preloadMedia = (urls: string[]): void => {
  if (!isBrowser) return;
  const unique = Array.from(new Set(urls.filter(Boolean)));
  if (unique.length === 0) return;

  unique.forEach((url) => {
    if (mediaPreloaded.has(url)) return;
    mediaPreloaded.add(url);
    // Route through CDN for WebP optimization
    const optimized = cdnImg(url, { width: 800 });
    if (!preloaded.has(optimized)) {
      preloaded.add(optimized);
      const img = new Image();
      img.src = optimized;
    }
  });
};

/** @deprecated Use preloadImages() instead */
export const preloadAssets = (urls: string[]): void => {
  if (!isBrowser || assetsPreloaded) return;
  const unique = Array.from(new Set(urls.filter(Boolean)));
  if (unique.length === 0) return;
  assetsPreloaded = true;

  const doPreload = () => preloadMedia(unique);

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(doPreload, { timeout: 1500 });
  } else {
    setTimeout(doPreload, 100);
  }
};
