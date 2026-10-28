/**
 * imageUrl.ts — CDN image optimization via wsrv.nl
 *
 * wsrv.nl is a free, Cloudflare-backed image CDN (300+ edge PoPs worldwide).
 * It fetches from Firebase Storage on first request, converts to WebP, then
 * caches the result at the nearest Cloudflare edge node for instant delivery.
 *
 * Impact: A 3 MB Firebase JPEG → ~100-200 KB WebP (15-30× smaller)
 * No account, no API key, no backend changes required.
 */

const WSRV = 'https://wsrv.nl/';

const isFirebaseUrl = (src: string) =>
  src.includes('firebasestorage.googleapis.com') ||
  src.includes('storage.googleapis.com');

export interface CdnOptions {
  /** Target width in pixels. Defaults: priority → 1600, standard → 800 */
  width?: number;
  /** Target height in pixels. Omit to preserve aspect ratio */
  height?: number;
  /** JPEG quality equivalent, 1-100. Default: 82 */
  quality?: number;
  /** Object-fit behaviour. Default: 'cover' */
  fit?: 'cover' | 'contain' | 'inside' | 'outside';
}

/**
 * Returns an optimized wsrv.nl URL for a Firebase Storage image.
 * Non-Firebase URLs are returned unchanged.
 *
 * @example
 * cdnImg(firebaseUrl, { width: 600 })
 * // → https://wsrv.nl/?url=<encoded>&w=600&output=webp&q=82&fit=cover
 */
export const cdnImg = (src: string, opts: CdnOptions = {}): string => {
  if (!src || !isFirebaseUrl(src)) return src;

  const { width = 800, height, quality = 82, fit = 'cover' } = opts;

  const p = new URLSearchParams();
  p.set('url', src);          // wsrv.nl fetches this on cache miss
  p.set('output', 'webp');    // auto-convert to WebP (best compression)
  p.set('q', String(quality));
  p.set('fit', fit);
  p.set('w', String(width));
  if (height) p.set('h', String(height));

  return `${WSRV}?${p.toString()}`;
};

/**
 * Responsive srcset over the CDN.
 *
 * Mirrored exactly in scripts/seo-data.mjs: the pre-rendered page preloads the hero
 * with this same srcset, and the browser only reuses a preload when the candidate
 * URLs match character for character. Change one, change both.
 */
export const HERO_WIDTHS = [480, 768, 1024, 1440] as const;
/** Banner card: full width on phones, half the page from lg up. */
export const HERO_SIZES = '(min-width: 1024px) 50vw, 100vw';
export const HERO_QUALITY = 80;

export const cdnSrcSet = (
  src: string,
  widths: readonly number[] = HERO_WIDTHS,
  quality: number = HERO_QUALITY,
): string | undefined => {
  if (!src || !isFirebaseUrl(src)) return undefined;
  return widths.map((w) => `${cdnImg(src, { width: w, quality })} ${w}w`).join(', ');
};

/**
 * Convenience presets — use these directly in OptimizedImage / preload calls.
 */

/** Small thumbnail: 600 × 600 WebP — for product/blog/category cards */
export const thumbUrl = (src: string) =>
  cdnImg(src, { width: 600, height: 600, quality: 80 });

/** Banner / hero image: 1600 px wide WebP — for full-width images */
export const heroUrl = (src: string) =>
  cdnImg(src, { width: 1600, quality: 85 });

/** Medium card: 900 × 900 WebP — for larger product cards */
export const cardUrl = (src: string) =>
  cdnImg(src, { width: 900, height: 900, quality: 82 });
