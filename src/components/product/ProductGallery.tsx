import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import CdnImage from '@/components/site/CdnImage';
import { isVideoUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  media: string[];
  name: string;
  className?: string;
  /** "stacked" puts thumbnails under the image, "side" puts them in a vertical rail on desktop. */
  layout?: 'stacked' | 'side';
}

// 1200px covers a full-width phone at 3x and the desktop gallery column at 2x.
const SLIDE_CDN = { width: 1200, height: 1200, quality: 85 } as const;
const THUMB_CDN = { width: 160, height: 160, quality: 75 } as const;
const SWIPE_THRESHOLD = 40;

const ProductGallery = ({ media, name, className, layout = 'stacked' }: ProductGalleryProps) => {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const horizontal = useRef<boolean | null>(null);
  const count = media.length;

  useEffect(() => {
    setIndex(0);
  }, [media]);

  const go = (delta: number) => setIndex((prev) => (prev + delta + count) % count);

  if (count === 0) {
    return <div className={cn('aspect-square rounded-2xl bg-muted md:rounded-3xl', className)} />;
  }

  const onTouchStart = (e: React.TouchEvent) => {
    if (count < 2) return;
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    horizontal.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.touches[0].clientX - touchStart.current.x;
    const dy = e.touches[0].clientY - touchStart.current.y;
    // Decide once per gesture whether this is a swipe or a page scroll.
    if (horizontal.current === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      horizontal.current = Math.abs(dx) > Math.abs(dy);
    }
    if (horizontal.current) {
      setDragging(true);
      setDragX(dx);
    }
  };

  const onTouchEnd = () => {
    if (horizontal.current && Math.abs(dragX) > SWIPE_THRESHOLD) go(dragX < 0 ? 1 : -1);
    touchStart.current = null;
    horizontal.current = null;
    setDragging(false);
    setDragX(0);
  };

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
            'relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-muted transition-all lg:w-20',
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
            <CdnImage src={url} cdn={THUMB_CDN} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className={cn(layout === 'side' ? 'flex flex-col gap-3 lg:flex-row lg:items-start' : '', 'self-start', className)}>
      <div
        className="relative w-full min-w-0 flex-1 touch-pan-y overflow-hidden rounded-2xl bg-muted md:rounded-3xl"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        {/* All slides sit side by side; the track slides and follows the finger while swiping. */}
        <div
          className={cn('flex aspect-square', !dragging && 'transition-transform duration-300 ease-out')}
          style={{ transform: `translateX(calc(${-index * 100}% + ${dragX}px))` }}
        >
          {media.map((url, i) => {
            // Keep the visible slide and two either side loaded (wrapping round) so swiping never waits on the network.
            const distance = Math.min(Math.abs(i - index), count - Math.abs(i - index));
            const near = distance <= 2;
            return (
              <div key={`${url}-${i}`} className="relative h-full w-full shrink-0 bg-muted" aria-hidden={i !== index}>
                {isVideoUrl(url) ? (
                  i === index ? (
                    <video src={url} className="h-full w-full object-cover" autoPlay muted loop playsInline controls />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-neutral-900 text-white">
                      <Play className="h-8 w-8 fill-current" />
                    </span>
                  )
                ) : (
                  <CdnImage
                    src={url}
                    cdn={SLIDE_CDN}
                    alt={`${name}${count > 1 ? ` – view ${i + 1}` : ''}`}
                    className="h-full w-full select-none object-cover"
                    loading={near ? 'eager' : 'lazy'}
                    fetchPriority={i === 0 ? 'high' : 'auto'}
                    decoding="async"
                    draggable={false}
                  />
                )}
              </div>
            );
          })}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full glass transition hover:brightness-[1.04]"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full glass transition hover:brightness-[1.04]"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            {/* A count is not a control: it stays in the content layer so it cannot be
                mistaken for a button on glass (DESIGN.md §2 rule 6). */}
            <span className="absolute bottom-3 left-3 rounded-full bg-foreground/80 px-3 py-1 text-xs font-medium tabular-nums text-background">
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
