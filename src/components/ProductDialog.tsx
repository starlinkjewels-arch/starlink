import { useState, useEffect, useRef } from 'react';
import { Product } from '@/lib/storage';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import WhatsAppButton from './WhatsAppButton';
import { X, ChevronLeft, ChevronRight, Truck, Shield, Zap, Play, Pause, Volume2, VolumeX, Share2 } from 'lucide-react';
interface ProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catId: string;
}
interface MediaItem {
  url: string;
  type: 'image' | 'video';
}
const ProductDialog = ({ product, open, onOpenChange, catId }: ProductDialogProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const getMediaType = (url: string): 'image' | 'video' => {
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv)/i;
    return videoExtensions.test(url) ||
           url.toLowerCase().includes('video') ||
           url.toLowerCase().includes('.mp4') ||
           url.toLowerCase().includes('vid-') ||
           url.toLowerCase().includes('mov') ? 'video' : 'image';
  };
  const allMediaUrls = product?.images?.length > 0 ? product.images : product?.image ? [product.image] : [];
  const media: MediaItem[] = allMediaUrls.map(url => ({
    url,
    type: getMediaType(url)
  }));
  const hasMultiple = media.length > 1;
  const currentMedia = media[selectedIndex] || null;
  // Auto-play video when media changes
  useEffect(() => {
    if (!currentMedia || currentMedia.type !== 'video' || !mainVideoRef.current || !open) return;
    mainVideoRef.current.load();
    mainVideoRef.current.play().catch(err => {
      console.log('Auto-play prevented:', err);
    });
    setIsPlaying(true);
  }, [open, selectedIndex]);
  // Reset when dialog opens
  useEffect(() => {
    if (!open) return;
    setSelectedIndex(0);
    setIsPlaying(true);
    setIsMuted(true);
  }, [open]);
  if (!product || !product.image || media.length === 0) return null;
  const next = () => {
    setSelectedIndex((prev) => (prev + 1) % media.length);
  };
 
  const prev = () => {
    setSelectedIndex((prev) => (prev - 1 + media.length) % media.length);
  };
  const handleVideoPlayPause = () => {
    if (mainVideoRef.current) {
      if (isPlaying) {
        mainVideoRef.current.pause();
      } else {
        mainVideoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  const handleMuteToggle = () => {
    if (mainVideoRef.current) {
      mainVideoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  const handleShare = async () => {
    if (!product) return;
    const shareUrl = `${window.location.origin}/category/${catId}?product=${product.id}`;
    const shareData = {
      title: product.name,
      text: `Check out this ${product.name} from Starlink Jewels! Price: $${product.price.replace(/[^0-9.]/g, '')} USD`,
      url: shareUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Product URL copied to clipboard!');
      }).catch(err => {
        console.error('Copy failed:', err);
      });
    }
  };
  const renderMedia = (item: MediaItem, isThumbnail: boolean = false, index?: number) => {
    if (item.type === 'video') {
      if (isThumbnail) {
        return (
          <div className="relative w-full h-full">
            <video
              className="w-full h-full object-cover"
              preload="metadata"
              muted
              playsInline
            >
              <source src={item.url} type="video/mp4" />
            </video>
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Play className="h-4 w-4 text-white" fill="white" />
            </div>
          </div>
        );
      } else {
        return (
          <div className="relative w-full h-full">
            <video
              ref={mainVideoRef}
              className="w-full h-full object-contain"
              loop
              muted={isMuted}
              playsInline
              preload="auto"
              autoPlay
            >
              <source src={item.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      }
    }
   
    return (
      <img
        src={item.url}
        alt={isThumbnail ? `Thumbnail ${index}` : product.name}
        className={`${isThumbnail ? 'w-full h-full object-cover' : 'max-w-full max-h-full object-contain'}`}
        draggable={false}
      />
    );
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 w-[95vw] max-w-[420px] sm:max-w-[600px] lg:max-w-4xl h-[92vh] sm:h-[80vh] lg:h-[75vh] max-h-[750px] flex flex-col bg-white dark:bg-zinc-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 h-9 w-9 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors shadow-lg"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
        </button>
        {/* MOBILE */}
        <div className="lg:hidden flex-1 overflow-y-auto">
          <div className="relative bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 aspect-square">
            <div className="w-full h-full flex items-center justify-center p-6">
              {renderMedia(currentMedia)}
            </div>
            {currentMedia.type === 'video' && (
              <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                <button
                  onClick={handleVideoPlayPause}
                  className="p-2 rounded-full bg-white/95 dark:bg-zinc-800/95 shadow-lg hover:scale-110 transition-transform"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                  ) : (
                    <Play className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                  )}
                </button>
                <button
                  onClick={handleMuteToggle}
                  className="p-2 rounded-full bg-white/95 dark:bg-zinc-800/95 shadow-lg hover:scale-110 transition-transform"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                  )}
                </button>
              </div>
            )}
            {hasMultiple && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/95 dark:bg-zinc-800/95 shadow-lg hover:scale-110 transition-transform z-10"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/95 dark:bg-zinc-800/95 shadow-lg hover:scale-110 transition-transform z-10"
                  aria-label="Next"
                >
                  <ChevronRight className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                </button>
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-md z-10">
                  {selectedIndex + 1}/{media.length}
                </div>
              </>
            )}
            {currentMedia.type === 'video' && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold shadow-lg flex items-center gap-1 z-10">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                VIDEO
              </div>
            )}
          </div>
          {hasMultiple && (
            <div className="px-4 py-3 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {media.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIndex(i)}
                    className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedIndex === i
                        ? 'border-emerald-500 scale-105 shadow-md'
                        : 'border-zinc-200 dark:border-zinc-700 opacity-60 hover:opacity-100 hover:border-emerald-300'
                    }`}
                  >
                    {renderMedia(item, true, i)}
                    {item.type === 'video' && (
                      <div className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded">
                        VIDEO
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="px-5 py-6 pb-28 space-y-5">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                ${product.price.replace(/[^0-9.]/g, '')}
              </span>
              <span className="text-sm text-zinc-500 uppercase tracking-wide">USD</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
                <Truck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-semibold text-center text-zinc-700 dark:text-zinc-300 leading-tight">Free<br/>Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] font-semibold text-center text-zinc-700 dark:text-zinc-300 leading-tight">Secure<br/>Payment</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800">
                <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="text-[10px] font-semibold text-center text-zinc-700 dark:text-zinc-300 leading-tight">Fast<br/>Delivery</span>
              </div>
            </div>
            {product.description && (
              <div
                className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}
          </div>
        </div>
        {/* DESKTOP */}
        <div className="hidden lg:flex flex-1 overflow-hidden min-h-0">
          <div className="relative bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 w-[52%] flex flex-col shrink-0 border-r border-zinc-200 dark:border-zinc-800">
            <div className="flex-1 flex items-center justify-center p-6 min-h-0">
              {renderMedia(currentMedia)}
            </div>
            {/* {currentMedia.type === 'video' && (
              <div className="absolute bottom-20 left-6 flex gap-2 z-10">
                <button
                  onClick={handleVideoPlayPause}
                  className="p-2.5 rounded-full bg-white/95 dark:bg-zinc-800/95 shadow-lg hover:scale-110 transition-transform"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                  ) : (
                    <Play className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                  )}
                </button>
                <button
                  onClick={handleMuteToggle}
                  className="p-2.5 rounded-full bg-white/95 dark:bg-zinc-800/95 shadow-lg hover:scale-110 transition-transform"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                  )}
                </button>
              </div>
            )} */}
            {hasMultiple && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/95 dark:bg-zinc-800/95 shadow-lg hover:scale-110 transition-transform z-10"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/95 dark:bg-zinc-800/95 shadow-lg hover:scale-110 transition-transform z-10"
                  aria-label="Next"
                >
                  <ChevronRight className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                </button>
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm text-sm font-medium text-zinc-700 dark:text-zinc-300 shadow-md z-10">
                  {selectedIndex + 1} / {media.length}
                </div>
              </>
            )}
            {currentMedia.type === 'video' && (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 z-10">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                VIDEO
              </div>
            )}
            {hasMultiple && (
              <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex gap-2.5 p-3 overflow-x-auto">
                  {media.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedIndex(i)}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedIndex === i
                          ? 'border-emerald-500 shadow-lg scale-105'
                          : 'border-zinc-300 dark:border-zinc-600 opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      {renderMedia(item, true, i)}
                      {item.type === 'video' && (
                        <div className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          VIDEO
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-950">
            <div className="p-6 xl:p-8 space-y-5">
              <h1 className="text-2xl xl:text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-2.5 pb-5 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-4xl xl:text-3xl font-bold bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  ${product.price.replace(/[^0-9.]/g, '')}
                </span>
                <span className="text-base text-zinc-500 uppercase tracking-wide">USD</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 hover:scale-105 transition-transform">
                  <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[9px] font-semibold text-center text-zinc-700 dark:text-zinc-300">Free Shipping</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform">
                  <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-[9px] font-semibold text-center text-zinc-700 dark:text-zinc-300">Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform">
                  <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-[9px] font-semibold text-center text-zinc-700 dark:text-zinc-300">Fast Delivery</span>
                </div>
              </div>
              {product.description && (
                <div
                  className="leading-relaxed text-zinc-600 dark:text-zinc-400 prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              )}
              <div className="pt-4 flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex-1 h-12 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
                <WhatsAppButton
                  product={product}
                  className="flex-1 h-12 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 shadow-2xl">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex-1 h-12 text-sm font-semibold rounded-xl shadow-lg"
            >
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <WhatsAppButton
              product={product}
              className="flex-1 h-12 text-sm font-semibold rounded-xl shadow-lg"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default ProductDialog;
