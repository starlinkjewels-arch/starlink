import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// Module-level cache — survives React Router navigations for the entire browser session
const loadedCache = new Set<string>();
// Keep Image refs alive to prevent browser cache eviction
const imageRefs = new Map<string, HTMLImageElement>();

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  wrapperClassName?: string;
  skeletonClassName?: string;
}

export function OptimizedImage({
  src,
  className,
  wrapperClassName,
  skeletonClassName,
  alt = '',
  ...rest
}: OptimizedImageProps) {
  const isCached = loadedCache.has(src);
  const [loaded, setLoaded] = useState(isCached);

  // Keep a live Image reference so the browser doesn't evict the decoded image
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) return;
    if (loadedCache.has(src)) {
      setLoaded(true);
      return;
    }
    setLoaded(false);

    // Preload off-screen so the real <img> gets an instant cache hit
    let preloader = imageRefs.get(src);
    if (!preloader) {
      preloader = new Image();
      imageRefs.set(src, preloader);
      preloader.onload = () => {
        loadedCache.add(src);
        setLoaded(true);
      };
      preloader.onerror = () => setLoaded(true); // show broken img rather than infinite skeleton
      preloader.src = src;
    } else {
      // Preloader exists but onload may have already fired
      if (preloader.complete && preloader.naturalWidth > 0) {
        loadedCache.add(src);
        setLoaded(true);
      }
    }
  }, [src]);

  return (
    <div className={cn('relative overflow-hidden', wrapperClassName)}>
      {/* Skeleton — hidden instantly for cached images */}
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
        src={src}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={() => {
          loadedCache.add(src);
          setLoaded(true);
          if (rest.onLoad) rest.onLoad({} as React.SyntheticEvent<HTMLImageElement>);
        }}
      />
    </div>
  );
}

export default OptimizedImage;
