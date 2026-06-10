import { useEffect, useRef, useState, type VideoHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// Module-level cache — survives React Router navigations for the entire browser session
const loadedVideoCache = new Set<string>();

interface OptimizedVideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  wrapperClassName?: string;
  skeletonClassName?: string;
  overlay?: React.ReactNode;
}

export function OptimizedVideo({
  src,
  className,
  wrapperClassName,
  skeletonClassName,
  overlay,
  ...rest
}: OptimizedVideoProps) {
  const isCached = loadedVideoCache.has(src);
  const [loaded, setLoaded] = useState(isCached);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!src) return;
    if (loadedVideoCache.has(src)) {
      setLoaded(true);
      return;
    }
    setLoaded(false);
  }, [src]);

  const handleReady = () => {
    loadedVideoCache.add(src);
    setLoaded(true);
  };

  return (
    <div className={cn('relative overflow-hidden', wrapperClassName)}>
      {!loaded && (
        <div
          className={cn(
            'absolute inset-0 animate-pulse bg-zinc-200 dark:bg-zinc-800',
            skeletonClassName
          )}
        />
      )}

      <video
        {...rest}
        ref={videoRef}
        src={src}
        preload={isCached ? 'auto' : 'metadata'}
        className={cn(
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onCanPlay={handleReady}
        onLoadedData={handleReady}
      />

      {overlay && loaded && (
        <div className="absolute inset-0">{overlay}</div>
      )}
    </div>
  );
}

export default OptimizedVideo;
