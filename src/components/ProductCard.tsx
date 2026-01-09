import { useState } from 'react';
import { Product } from '@/lib/storage';
import WhatsAppButton from './WhatsAppButton';
import { Images, Play } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const [showSecondImage, setShowSecondImage] = useState(false);

  const media = product.images && product.images.length > 0 ? product.images : [product.image];
  const hasMultiple = media.length > 1;
  
  // Show first image by default, second image on hover (if available)
  const displayMedia = showSecondImage && hasMultiple ? media[1] : media[0];

  // Detect if media is video
  const getMediaType = (url: string): 'image' | 'video' => {
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv)$/i;
    return videoExtensions.test(url) || url.includes('video') ? 'video' : 'image';
  };

  const currentMediaType = getMediaType(displayMedia);

  return (
    <div 
      onClick={onClick}
      onMouseEnter={() => setShowSecondImage(true)}
      onMouseLeave={() => setShowSecondImage(false)}
      className="group relative bg-card rounded-xl overflow-hidden border border-border/50 hover:border-border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {currentMediaType === 'video' ? (
          <div className="relative w-full h-full">
            <video
              src={displayMedia}
              className="w-full h-full object-cover transition-opacity duration-500"
              autoPlay={showSecondImage}
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
            src={displayMedia}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            loading="lazy"
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
        
        {/* Price and Button Container */}
        <div className="space-y-4 mt-auto">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-primary">
              ${product.price.replace(/[^0-9.]/g, '')}
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              USD
            </span>
          </div>
          
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