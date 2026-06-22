import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { cdnImg } from '@/lib/imageUrl';

// Module-level cache — survives React Router navigations for the entire browser session
const loadedCache = new Set<string>();
// Keep Image refs alive to prevent browser cache eviction
const imageRefs = new Map<string, HTMLImageElement>();

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  wrapperClassName?: string;
  skeletonClassName?: string;
  /**
   * priority=true → above-the-fold / LCP image.
   * - Uses fetchPriority="high" + loading="eager"
   * - CDN width defaults to 1600 (banner / hero size)
   * - No skeleton animation (assumes fast delivery from CDN)
   */
  priority?: boolean;
  /**
   * Override the CDN width used when optimizing Firebase Storage images.
   * Defaults: priority → 1600, standard → 800
   * Set to 0 to disable CDN optimization and use the raw Firebase URL.
   */
  imgWidth?: number;
}

export function OptimizedImage({
  src,
  className,
  wrapperClassName,
  skeletonClassName,
  alt = '',
  priority = false,
  imgWidth,
  ...rest
}: OptimizedImageProps) {
  // Resolve the CDN-optimized URL automatically for Firebase Storage images
  const resolvedWidth = imgWidth !== undefined ? imgWidth : (priority ? 1600 : 800);
  const optimizedSrc = resolvedWidth > 0 ? cdnImg(src, { width: resolvedWidth }) : src;

  const isCached = loadedCache.has(optimizedSrc);
  // Priority images or already-cached images show immediately without skeleton
  const [loaded, setLoaded] = useState(isCached || priority);

  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!optimizedSrc) return;
    if (loadedCache.has(optimizedSrc)) {
      setLoaded(true);
      return;
    }

    // Priority images render eagerly — no off-screen preloader needed
    if (priority) {
      setLoaded(true);
      return;
    }

    setLoaded(false);

    // Preload off-screen so the real <img> gets an instant cache hit
    let preloader = imageRefs.get(optimizedSrc);
    if (!preloader) {
      preloader = new Image();
      imageRefs.set(optimizedSrc, preloader);
      preloader.onload = () => {
        loadedCache.add(optimizedSrc);
        setLoaded(true);
      };
      preloader.onerror = () => setLoaded(true); // show broken img rather than infinite skeleton
      preloader.src = optimizedSrc;
    } else {
      if (preloader.complete && preloader.naturalWidth > 0) {
        loadedCache.add(optimizedSrc);
        setLoaded(true);
      }
    }
  }, [optimizedSrc, priority]);

  return (
    <div className={cn('relative overflow-hidden', wrapperClassName)}>
      {/* Skeleton — hidden instantly for cached / priority images */}
      {!loaded && (
        <div
          className={cn(
            'absolute inset-0 animate-pulse bg-zinc-200 dark:bg-zinc-800',
            skeletonClassName
          )}
        />
      )}

      <img
        {...rest}
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        {...(priority ? { fetchpriority: 'high' } : {})}
        className={cn(
          priority ? '' : 'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={() => {
          loadedCache.add(optimizedSrc);
          setLoaded(true);
          if (rest.onLoad) rest.onLoad({} as React.SyntheticEvent<HTMLImageElement>);
        }}
      />
    </div>
  );
}

export default OptimizedImage;
