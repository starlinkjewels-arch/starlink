import { useMemo, useRef, useState } from 'react';
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

interface ProductCardProps {
  product: Product;
  /** When given, the card opens a quick view instead of navigating. */
  onClick?: () => void;
  categoryName?: string;
  className?: string;
  priority?: boolean;
}

const NEW_WINDOW_MS = 45 * 24 * 60 * 60 * 1000;

const ProductCard = ({ product, onClick, categoryName, className, priority = false }: ProductCardProps) => {
  const { contactInfo } = useAppSelector(selectGlobalData);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

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

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null || images.length < 2) return;
    const delta = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    if (Math.abs(delta) > 30) {
      setIndex((prev) => (delta < 0 ? (prev + 1) % images.length : (prev - 1 + images.length) % images.length));
    }
    touchStartX.current = null;
  };

  const href = `/product/${product.id}`;
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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="glint relative aspect-square overflow-hidden rounded-3xl bg-secondary transition-shadow duration-500 group-hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.35)]" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {primaryIsVideo ? (
          <video src={primary} className="h-full w-full object-cover" muted loop playsInline autoPlay={hovered} preload="metadata" />
        ) : (
          <>
            <img
              src={primary}
              alt={product.name}
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 group-hover:scale-[1.04]',
                hovered && secondary ? 'md:opacity-0' : 'opacity-100'
              )}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={priority ? 'high' : 'low'}
            />
            {secondary && (
              <img
                src={secondary}
                alt=""
                aria-hidden
                className={cn('absolute inset-0 hidden h-full w-full object-cover transition-opacity duration-700 md:block', hovered ? 'opacity-100' : 'opacity-0')}
                loading="lazy"
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

        {images.length > 1 && (
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
          <span className="text-sm font-medium text-muted-foreground">Price on request</span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Certified
          </span>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
