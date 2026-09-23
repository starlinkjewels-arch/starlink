import { useEffect, useState, memo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Banner } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import KineticHeading from '@/components/site/KineticHeading';
import { preloadMedia } from '@/lib/preload';
import { SITE } from '@/lib/seo';
import { cn } from '@/lib/utils';
import heroFallback from '@/assets/hero-banner-1.jpg';

interface BannerCarouselProps {
  banners?: Banner[];
  whatsappNumber?: string;
}

const SLIDE_MS = 6500;
const FALLBACK_KEY = 'starlink_hero_fallback';

const readCachedFallback = () => {
  try {
    return window.localStorage.getItem(FALLBACK_KEY) || heroFallback;
  } catch {
    return heroFallback;
  }
};

const heroStats = [
  { value: 'IGI · GIA', label: 'Certified diamonds' },
  { value: '30+', label: 'Countries served' },
  { value: '2011', label: 'Crafting since' },
];

// Split hero: kinetic headline on a soft panel + rounded media carousel (admin banners).
const BannerCarousel = memo(({ banners = [] }: BannerCarouselProps) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loaded, setLoaded] = useState<Set<number>>(new Set());
  const [fallbackImage] = useState<string>(() => (typeof window === 'undefined' ? heroFallback : readCachedFallback()));
  const touchStartX = useRef<number | null>(null);
  const count = banners.length;

  const markLoaded = useCallback((i: number) => {
    setLoaded((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
  }, []);

  const go = useCallback((delta: number) => {
    if (count === 0) return;
    setCurrent((prev) => (prev + delta + count) % count);
  }, [count]);

  useEffect(() => {
    if (current >= count) setCurrent(0);
  }, [count, current]);

  // Remember the first banner so returning visitors see it instantly while data loads.
  useEffect(() => {
    const first = banners[0];
    if (!first || first.mediaType === 'video') return;
    try {
      window.localStorage.setItem(FALLBACK_KEY, first.image);
    } catch {
      // ignore storage errors
    }
  }, [banners]);

  useEffect(() => {
    if (count < 2 || paused) return;
    const id = window.setTimeout(() => go(1), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [count, current, paused, go]);

  useEffect(() => {
    if (count === 0) return;
    const next = banners[(current + 1) % count];
    if (next && next.mediaType !== 'video') preloadMedia([next.image]);
  }, [banners, count, current]);

  const activeLoaded = loaded.has(current);
  const activeBanner = banners[current];

  return (
    <section className="container-wide pb-10 pt-4 md:pb-16 md:pt-6" aria-label="Featured collections">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr] lg:gap-5">
        {/* Copy panel */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-secondary p-7 sm:p-10 lg:min-h-[640px] lg:p-14">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
          <div className="relative">
            <p className="eyebrow animate-in fade-in duration-700">Lab-grown &amp; natural diamonds</p>
            <KineticHeading
              className="heading-xl mt-6"
              parts={[{ text: 'Fine diamonds,' }, { text: 'made', breakBefore: true }, { text: 'modern.', accent: true }]}
            />
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground animate-in fade-in slide-in-from-bottom-2 fill-mode-both delay-500 duration-1000 md:text-lg">
              Certified jewelry, handcrafted in Surat and delivered insured to clients in over 30 countries.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 animate-in fade-in slide-in-from-bottom-2 fill-mode-both delay-700 duration-1000">
              <Button asChild size="xl" className="group">
                <Link to="/categories">
                  Shop collections <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="bg-transparent">
                <a href={SITE.ringBuilder.url} target="_blank" rel="noopener" title={SITE.ringBuilder.title}>
                  Design your ring <ArrowUpRight />
                </a>
              </Button>
            </div>
          </div>

          <dl className="relative mt-12 grid grid-cols-3 gap-4 border-t border-foreground/10 pt-6 animate-in fade-in fill-mode-both delay-1000 duration-1000">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-[11px] text-muted-foreground sm:text-xs">{stat.label}</dt>
                <dd className="mt-1 font-display text-lg font-semibold tracking-tight sm:text-2xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Media panel */}
        <div
          className="clip-reveal group relative isolate min-h-[420px] overflow-hidden rounded-[2rem] bg-neutral-200 sm:min-h-[520px] lg:min-h-[640px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            touchStartX.current = null;
          }}
          aria-roledescription="carousel"
        >
          <img
            src={fallbackImage}
            alt=""
            aria-hidden
            className={cn('absolute inset-0 h-full w-full object-cover transition-opacity duration-700', count > 0 && activeLoaded ? 'opacity-0' : 'opacity-100')}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />

          {banners.map((banner, i) => {
            const isActive = i === current;
            const isNear = isActive || i === (current + 1) % count || i === (current - 1 + count) % count;
            if (!isNear) return null;
            return (
              <div
                key={banner.id}
                className={cn('absolute inset-0 transition-opacity duration-1000 ease-out', isActive ? 'z-10 opacity-100' : 'z-0 opacity-0')}
                aria-hidden={!isActive}
              >
                {banner.mediaType === 'video' ? (
                  <video
                    src={banner.image}
                    className="h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload={isActive ? 'auto' : 'metadata'}
                    poster={fallbackImage}
                    onLoadedData={() => markLoaded(i)}
                  />
                ) : (
                  <img
                    key={isActive ? `active-${current}` : banner.id}
                    src={banner.image}
                    alt={banner.title}
                    className={cn('h-full w-full object-cover', isActive && 'animate-hero-zoom')}
                    loading={isActive ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={isActive ? 'high' : 'auto'}
                    onLoad={() => markLoaded(i)}
                  />
                )}
              </div>
            );
          })}

          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

          {/* Floating glass chips */}
          <div className="animate-float absolute left-5 top-5 z-20 flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-2 text-xs font-semibold shadow-lg backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-brand" /> Handcrafted in Surat
          </div>
          <div className="animate-float absolute right-5 top-16 z-20 hidden items-center gap-2 rounded-2xl border border-white/40 bg-white/70 px-4 py-3 shadow-lg backdrop-blur-md [animation-delay:1.5s] sm:flex">
            <ShieldCheck className="h-5 w-5 text-brand" />
            <span className="leading-tight">
              <span className="block text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Every stone</span>
              <span className="block text-sm font-semibold">IGI &amp; GIA certified</span>
            </span>
          </div>

          {/* Caption + controls */}
          <div className="absolute inset-x-5 bottom-5 z-20 flex items-end justify-between gap-4">
            {activeBanner?.title ? (
              <div key={current} className="max-w-sm rounded-2xl border border-white/30 bg-black/35 px-4 py-3 text-white backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-700">
                <p className="line-clamp-2 text-sm font-semibold leading-snug">{activeBanner.title}</p>
                {count > 1 && (
                  <div className="mt-2.5 flex gap-1.5">
                    {banners.map((b, i) => (
                      <button key={b.id} type="button" onClick={() => setCurrent(i)} className="relative h-1 w-8 overflow-hidden rounded-full bg-white/30" aria-label={`Go to slide ${i + 1}`}>
                        {i === current && (
                          <span
                            key={`${current}-${paused}`}
                            className={cn('absolute inset-0 origin-left bg-white', paused ? 'scale-x-0' : 'animate-progress')}
                            style={{ animationDuration: `${SLIDE_MS}ms` }}
                          />
                        )}
                        {i < current && <span className="absolute inset-0 bg-white/70" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span />
            )}
            {count > 1 && (
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => go(-1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-md backdrop-blur transition hover:scale-105" aria-label="Previous slide">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => go(1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-md backdrop-blur transition hover:scale-105" aria-label="Next slide">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

BannerCarousel.displayName = 'BannerCarousel';

export default BannerCarousel;
