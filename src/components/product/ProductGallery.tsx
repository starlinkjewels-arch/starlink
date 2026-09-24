import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { isVideoUrl } from '@/lib/media';
import { preloadMedia } from '@/lib/preload';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  media: string[];
  name: string;
  className?: string;
  /** "stacked" puts thumbnails under the image, "side" puts them in a vertical rail on desktop. */
  layout?: 'stacked' | 'side';
}

const ProductGallery = ({ media, name, className, layout = 'stacked' }: ProductGalleryProps) => {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const count = media.length;
  const current = media[Math.min(index, count - 1)];
  const currentIsVideo = isVideoUrl(current);

  useEffect(() => {
    setIndex(0);
  }, [media]);

  useEffect(() => {
    setLoaded(false);
    const next = media[(index + 1) % count];
    if (next && !isVideoUrl(next)) preloadMedia([next]);
  }, [index, media, count]);

  const go = (delta: number) => setIndex((prev) => (prev + delta + count) % count);

  if (count === 0) {
    return <div className={cn('aspect-square rounded-2xl bg-muted md:rounded-3xl', className)} />;
  }

  const thumbs = count > 1 && (
    <div
      className={cn(
        'scrollbar-hide flex min-w-0 gap-2 overflow-x-auto',
        layout === 'side' ? 'lg:order-first lg:max-h-[640px] lg:w-20 lg:flex-col lg:overflow-y-auto lg:overflow-x-visible' : 'mt-3'
      )}
    >
      {media.map((url, i) => (
        <button
          key={`${url}-${i}`}
          type="button"
          onClick={() => setIndex(i)}
          className={cn(
            'relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all lg:w-20',
            i === index ? 'border-foreground' : 'border-transparent opacity-60 hover:opacity-100'
          )}
          aria-label={`Show media ${i + 1}`}
          aria-current={i === index}
        >
          {isVideoUrl(url) ? (
            <span className="flex h-full w-full items-center justify-center bg-neutral-900 text-white">
              <Play className="h-4 w-4 fill-current" />
            </span>
          ) : (
            <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className={cn(layout === 'side' ? 'flex flex-col gap-3 lg:flex-row lg:items-start' : '', 'self-start', className)}>
      <div
        className="relative w-full min-w-0 flex-1 overflow-hidden rounded-2xl bg-muted md:rounded-3xl"
        onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStartX.current === null || count < 2) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchStartX.current = null;
        }}
      >
        <div className="relative aspect-square">
          {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
          {currentIsVideo ? (
            <video
              key={current}
              src={current}
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              controls
              onLoadedData={() => setLoaded(true)}
            />
          ) : (
            <img
              key={current}
              src={current}
              alt={`${name}${count > 1 ? ` – view ${index + 1}` : ''}`}
              className="h-full w-full object-cover animate-in fade-in duration-500"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onLoad={() => setLoaded(true)}
              draggable={false}
            />
          )}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-md backdrop-blur transition hover:bg-background"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-md backdrop-blur transition hover:bg-background"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium tabular-nums backdrop-blur">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>
      {thumbs}
    </div>
  );
};

export default ProductGallery;
