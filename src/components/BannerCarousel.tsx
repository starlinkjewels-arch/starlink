import { useEffect, useState, memo, useCallback } from 'react';
import { Banner } from '@/lib/storage';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { preloadMedia } from '@/lib/preload';
import heroFallback from '@/assets/hero-banner-1.jpg';

interface BannerCarouselProps {
  banners?: Banner[];
}

const BannerCarousel = memo(({ banners = [] }: BannerCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedIndexes, setLoadedIndexes] = useState<Set<number>>(new Set());
  const [fallbackImage, setFallbackImage] = useState<string | null>(heroFallback);

  const markLoaded = useCallback((index: number) => {
    setLoadedIndexes((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  useEffect(() => {
    setLoadedIndexes(new Set());
  }, [banners.length]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const cached = window.localStorage.getItem('starlink_hero_fallback');
      if (cached) setFallbackImage(cached);
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const first = banners[0];
    if (!first || first.mediaType === 'video') return;
    try {
      window.localStorage.setItem('starlink_hero_fallback', first.image);
      setFallbackImage(first.image);
    } catch {
      // ignore storage errors
    }
  }, [banners]);

  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    if (!banners[0] || banners[0].mediaType === 'video') return;
    const img = new Image();
    img.src = banners[0].image;
    img.onload = () => markLoaded(0);
  }, [banners, markLoaded]);

  useEffect(() => {
    if (banners.length === 0) return;
    const nextIndex = (currentIndex + 1) % banners.length;
    const urls = [banners[currentIndex]?.image, banners[nextIndex]?.image].filter(Boolean) as string[];
    preloadMedia(urls);
  }, [banners, currentIndex]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (banners.length === 0) {
    return (
      <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] min-h-[400px] max-h-[800px] bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center overflow-hidden rounded-lg border border-border/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.1),transparent_50%)]" />
        <div className="text-center px-4 sm:px-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground mb-4 md:mb-6 tracking-tight">
            Welcome to Starlink Jewels
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-muted-foreground font-light">
            Discover Premium Luxury Jewelry
          </p>
        </div>
      </div>
    );
  }

  const nextIndex = banners.length > 0 ? (currentIndex + 1) % banners.length : 0;
  const prevIndex = banners.length > 0 ? (currentIndex - 1 + banners.length) % banners.length : 0;
  const visibleIndexes = new Set([currentIndex, nextIndex, prevIndex]);

  return (
    <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] min-h-[400px] max-h-[800px] overflow-hidden w-full shadow-2xl rounded-lg border border-border/20 bg-muted">
      {fallbackImage && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            loadedIndexes.has(currentIndex) ? "opacity-0" : "opacity-100"
          }`}
        >
          <img
            src={fallbackImage}
            alt="Hero background"
            className="w-full h-full object-cover scale-105 blur-sm opacity-40"
            loading="eager"
            decoding="async"
          />
        </div>
      )}
      {banners.map((banner, index) => {
        if (!visibleIndexes.has(index)) return null;
        return (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-110 z-0'
          }`}
        >
          {index === currentIndex && !loadedIndexes.has(index) && !fallbackImage && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          {banner.mediaType === 'video' ? (
            <video
              src={banner.image}
              className="w-full h-full object-cover"
              autoPlay={index === currentIndex}
              muted
              loop
              playsInline
              preload="metadata"
              poster={fallbackImage || undefined}
              onLoadedData={() => markLoaded(index)}
            />
          ) : (
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover transition-opacity duration-500"
              loading={index === currentIndex ? 'eager' : 'lazy'}
              decoding="async"
              fetchpriority={index === currentIndex ? 'high' : 'auto'}
              sizes="100vw"
              onLoad={() => markLoaded(index)}
            />
          )}
          
          {/* Overlay gradients for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24">
              <div className="max-w-4xl">
                <div className="mb-3 sm:mb-4 md:mb-6 overflow-hidden">
                  <h2 className={`text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight tracking-tight transition-all duration-1000 ${
                    index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                  }`} style={{ transitionDelay: '200ms', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                    {banner.title}
                  </h2>
                </div>
                <div className="mb-4 sm:mb-6 md:mb-8 overflow-hidden">
                  <p className={`text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/95 font-light max-w-2xl leading-relaxed transition-all duration-1000 ${
                    index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                  }`} style={{ transitionDelay: '400ms', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                    {banner.description}
                  </p>
                </div>
                <div className={`transition-all duration-1000 ${
                  index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                }`} style={{ transitionDelay: '600ms' }}>
                  <Button 
                    size="lg" 
                    className="text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 rounded-full bg-white text-primary hover:bg-white/90 shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    Explore Collection
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        );
      })}

      {banners.length > 1 && (
        <>
          <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-20">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1 sm:h-1.5 md:h-2 rounded-full transition-all duration-500 ${
                  index === currentIndex 
                    ? 'bg-white w-8 sm:w-10 md:w-12 lg:w-16 shadow-lg' 
                    : 'bg-white/40 w-1 sm:w-1.5 md:w-2 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
});

BannerCarousel.displayName = 'BannerCarousel';

export default BannerCarousel;
