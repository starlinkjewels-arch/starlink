import { useEffect, useMemo, useRef, useState } from 'react';
import type { TouchEvent } from 'react';
import { Link } from 'react-router-dom';
import { Play, Eye, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Product } from '@/lib/storage';
import { getProductTime, isVideoUrl } from '@/lib/media';
import { openWhatsApp } from '@/lib/whatsapp';
import { buildProductEnquiry } from '@/components/WhatsAppButton';
import { useAppSelector } from '@/store/hooks';
import { selectGlobalData } from '@/store/contentSlice';
import { cn } from '@/lib/utils';
import CdnImage from '@/components/site/CdnImage';
import { productPath } from '@/lib/urls';

// 600px WebP covers a 2-column phone grid at 3x and desktop cards at 2x.
const CARD_CDN = { width: 600, height: 600, quality: 80 } as const;

interface ProductCardProps {
  product: Product;
  /** When given, the card opens a quick view instead of navigating. */
  onClick?: () => void;
  categoryName?: string;
  className?: string;
  priority?: boolean;
  /**
   * Swipe between photos on touch. Turn off when the card sits inside a horizontally
   * scrolling row, so a sideways swipe scrolls the row instead of changing the photo.
   */
  swipeable?: boolean;
}

const NEW_WINDOW_MS = 45 * 24 * 60 * 60 * 1000;

const ProductCard = ({ product, onClick, categoryName, className, priority = false, swipeable = true }: ProductCardProps) => {
  const { contactInfo } = useAppSelector(selectGlobalData);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  // Once the card is near the viewport, neighbouring photos load so swiping/hovering is instant.
  const [armed, setArmed] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const horizontal = useRef<boolean | null>(null);

  const media = useMemo(
    () => (product.images && product.images.length > 0 ? product.images : [product.image]).filter(Boolean),
    [product.images, product.image]
  );
  const images = useMemo(() => media.filter((url) => !isVideoUrl(url)), [media]);
  const hasVideo = media.length !== images.length;
  const primary = images[index] || images[0] || media[0];
  const secondary = images[1];
  const primaryIsVideo = primary ? isVideoUrl(primary) : false;
  const createdAt = getProductTime(product);
  const isNew = createdAt > 0 && Date.now() - createdAt < NEW_WINDOW_MS;

  useEffect(() => {
    const node = cardRef.current;
    if (!node || !swipeable || images.length < 2 || armed) return;
    if (typeof IntersectionObserver === 'undefined') {
      setArmed(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArmed(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [swipeable, images.length, armed]);

  const canSwipe = swipeable && images.length > 1;

  const handleTouchStart = (e: TouchEvent) => {
    if (!canSwipe) return;
    setArmed(true);
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    horizontal.current = null;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.touches[0].clientX - touchStart.current.x;
    const dy = e.touches[0].clientY - touchStart.current.y;
    // Decide once per gesture whether the finger is swiping photos or scrolling the page.
    if (horizontal.current === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      horizontal.current = Math.abs(dx) > Math.abs(dy);
    }
    if (horizontal.current) {
      setDragging(true);
      setDragX(dx);
    }
  };

  const handleTouchEnd = () => {
    if (horizontal.current && Math.abs(dragX) > 30) {
      setIndex((prev) => (dragX < 0 ? (prev + 1) % images.length : (prev - 1 + images.length) % images.length));
    }
    touchStart.current = null;
    horizontal.current = null;
    setDragging(false);
    setDragX(0);
  };

  const href = productPath(product);
  const primaryAction = onClick ? (
    <button type="button" onClick={onClick} className="absolute inset-0 z-10" aria-label={`Quick view ${product.name}`} />
  ) : (
    <Link to={href} className="absolute inset-0 z-10" aria-label={product.name} />
  );

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col transition-transform duration-500 hover:-translate-y-1',
        className
      )}
      onMouseEnter={() => {
        setHovered(true);
        setArmed(true);
      }}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        ref={cardRef}
        className={cn(
          'glint relative aspect-square overflow-hidden rounded-3xl bg-secondary transition-shadow duration-500 group-hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.35)]',
          canSwipe && 'touch-pan-y'
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {primaryIsVideo ? (
          <video src={primary} className="h-full w-full object-cover" muted loop playsInline autoPlay={hovered} preload="metadata" />
        ) : (
          <>
            {/* Photo track: slides follow the finger on touch; neighbours are preloaded once armed. */}
            <div
              className={cn(
                'absolute inset-0 flex',
                dragging ? 'transition-opacity duration-700' : 'transition-[opacity,transform] duration-300 ease-out',
                hovered && secondary && index === 0 ? 'md:opacity-0' : 'opacity-100'
              )}
              style={{ transform: `translateX(calc(${-index * 100}% + ${dragX}px))` }}
            >
              {images.map((url, i) => {
                const near = i === index || (armed && Math.abs(i - index) <= 1);
                return (
                  <div key={`${url}-${i}`} className="relative h-full w-full shrink-0 overflow-hidden">
                    <CdnImage
                      src={url}
                      cdn={CARD_CDN}
                      alt={i === 0 ? product.name : ''}
                      aria-hidden={i !== index}
                      className="h-full w-full select-none object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      loading={near && (priority || i !== 0 || armed) ? 'eager' : 'lazy'}
                      decoding="async"
                      fetchPriority={priority && i === 0 ? 'high' : 'auto'}
                      draggable={false}
                    />
                  </div>
                );
              })}
            </div>
            {secondary && (
              <CdnImage
                src={secondary}
                cdn={CARD_CDN}
                alt=""
                aria-hidden
                className={cn('absolute inset-0 hidden h-full w-full object-cover md:block', !(hovered && index === 0) && '!opacity-0')}
                loading={armed ? 'eager' : 'lazy'}
                decoding="async"
              />
            )}
          </>
        )}

        {primaryAction}

        <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-col items-start gap-1.5">
          {isNew && <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">New</span>}
          {hasVideo && (
            <span className="flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
              <Play className="h-3 w-3 fill-current" /> Video
            </span>
          )}
        </div>

        {canSwipe && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center gap-1.5 md:hidden">
            {images.slice(0, 5).map((_, i) => (
              <span key={i} className={cn('h-1 rounded-full bg-white shadow transition-all', i === index ? 'w-4' : 'w-1 opacity-70')} />
            ))}
          </div>
        )}

        {/* Hover actions (desktop) */}
        <div className="absolute inset-x-3 bottom-3 z-20 hidden translate-y-3 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:flex">
          {onClick ? (
            <button
              type="button"
              onClick={onClick}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-background/95 text-[13px] font-semibold shadow-md backdrop-blur hover:bg-primary hover:text-primary-foreground"
            >
              <Eye className="h-4 w-4" /> Quick view
            </button>
          ) : (
            <Link
              to={href}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-background/95 text-[13px] font-semibold shadow-md backdrop-blur hover:bg-primary hover:text-primary-foreground"
            >
              View details <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => openWhatsApp(buildProductEnquiry(product), contactInfo?.whatsapp)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-whatsapp text-white shadow-md hover:brightness-110"
            aria-label={`Enquire about ${product.name} on WhatsApp`}
          >
            <FaWhatsapp className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col px-1 pt-4">
        {categoryName && <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{categoryName}</p>}
        <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug tracking-tight transition-colors group-hover:text-brand">
          {onClick ? (
            <button type="button" onClick={onClick} className="text-left">
              {product.name}
            </button>
          ) : (
            <Link to={href}>{product.name}</Link>
          )}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="whitespace-nowrap text-xs font-medium text-muted-foreground sm:text-sm">Price on request</span>
          <span className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground" title="Certified diamonds">
            <ShieldCheck className="h-3.5 w-3.5 text-brand" /> <span className="hidden sm:inline">Certified</span>
          </span>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
