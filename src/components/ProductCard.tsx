import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent, TouchEvent } from 'react';
import { Product } from '@/lib/storage';
import WhatsAppButton from './WhatsAppButton';
import { Images, Play } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const media = product.images && product.images.length > 0 ? product.images : [product.image];
  const hasMultiple = media.length > 1;
  
  const isCoarsePointer = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(pointer: coarse)').matches;
  }, []);

  const displayMedia = media[currentIndex] || media[0];

  // Detect if media is video
  const getMediaType = (url: string): 'image' | 'video' => {
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv)$/i;
    return videoExtensions.test(url) || url.includes('video') ? 'video' : 'image';
  };

  const currentMediaType = getMediaType(displayMedia);
  const hasVideo = media.some(url => getMediaType(url) === 'video');

  useEffect(() => {
    setCurrentIndex(0);
    setIsHovered(false);
  }, [product.id]);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!isCoarsePointer) return;
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (!isCoarsePointer || touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const deltaX = endX - touchStartX.current;
    const threshold = 30;
    if (Math.abs(deltaX) >= threshold && hasMultiple) {
      setAutoPlay(false);
      if (deltaX < 0) {
        setCurrentIndex((prev) => (prev + 1) % media.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
      }
    }
    touchStartX.current = null;
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hasMultiple) {
      setCurrentIndex(1);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div 
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative bg-card rounded-xl overflow-hidden border border-border/50 hover:border-border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full cursor-pointer"
    >
      {/* Image Container */}
      <div
        className="relative aspect-square overflow-hidden bg-muted"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {currentMediaType === 'video' ? (
          <div className="relative w-full h-full">
            <video
              key={`${displayMedia}-${currentIndex}`}
              src={displayMedia}
              className="w-full h-full object-cover transition-opacity duration-900 animate-fade-swap animate-kenburns-soft"
              autoPlay={isHovered}
              loop
              muted
              playsInline
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
              <div className="bg-white/95 dark:bg-zinc-800/95 rounded-full p-3 shadow-lg">
                <Play className="h-6 w-6 text-zinc-700 dark:text-zinc-300" fill="currentColor" />
              </div>
            </div>
          </div>
        ) : (
          <img
            key={`${displayMedia}-${currentIndex}`}
            src={displayMedia}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-900 group-hover:scale-110 animate-fade-swap animate-kenburns-soft"
            loading="lazy"
            decoding="async"
            fetchpriority="low"
          />
        )}
        
        {/* Media Count Badge */}
        {hasMultiple && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-background/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium shadow-lg border border-border/50">
            <Images className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold">{media.length}</span>
          </div>
        )}

        {/* Video Badge */}
        {/* {hasVideo && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            VIDEO
          </div>
        )} */}
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 lg:p-6">
        {/* Product Name */}
        <h3 className="font-semibold text-base sm:text-lg lg:text-xl mb-2 line-clamp-2 min-h-[3rem] text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        {/* Description */}
        <div className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-2 flex-1 prose prose-sm max-w-none dark:prose-invert">
          {product.description ? (
            <div 
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          ) : null}
        </div>
        
        {/* Button Container */}
        <div className="space-y-4 mt-auto">
          {/* WhatsApp Button */}
          <div onClick={(e) => e.stopPropagation()}>
            <WhatsAppButton product={product} className="w-full" />
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductCard;
