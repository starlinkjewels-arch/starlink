import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Product } from '@/lib/storage';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import WhatsAppButton from './WhatsAppButton';
import { X, ChevronLeft, ChevronRight, Truck, Shield, Zap, Play, Pause, Volume2, VolumeX } from 'lucide-react';
interface ProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
interface MediaItem {
  url: string;
  type: 'image' | 'video';
}
const ProductDialog = ({ product, open, onOpenChange }: ProductDialogProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [mainLoaded, setMainLoaded] = useState(false);
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const shouldAutoplay = open;
  const getMediaType = (url: string): 'image' | 'video' => {
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv)/i;
    return videoExtensions.test(url) ||
           url.toLowerCase().includes('video') ||
           url.toLowerCase().includes('.mp4') ||
           url.toLowerCase().includes('vid-') ||
           url.toLowerCase().includes('mov') ? 'video' : 'image';
  };
  const posterImage = useMemo(() => {
    const images = (product?.images || []).filter((url) => getMediaType(url) === 'image');
    return images[0] || product?.image || '';
  }, [product]);
  const getVideoMimeType = (url: string): string | undefined => {
    const lower = url.toLowerCase();
    if (lower.endsWith('.webm')) return 'video/webm';
    if (lower.endsWith('.ogg') || lower.endsWith('.ogv')) return 'video/ogg';
    if (lower.endsWith('.mp4') || lower.endsWith('.m4v') || lower.endsWith('.mov')) return 'video/mp4';
    return undefined;
  };
  const allMediaUrls = product?.images?.length > 0 ? product.images : product?.image ? [product.image] : [];
  const media: MediaItem[] = allMediaUrls.map(url => ({
    url,
    type: getMediaType(url)
  }));
  const hasMultiple = media.length > 1;
  const clampedIndex = media.length > 0 ? Math.min(selectedIndex, media.length - 1) : 0;
  const currentMedia = media.length > 0 ? media[clampedIndex] : null;
  useEffect(() => {
    setMainLoaded(false);
    setIsPlaying(false);
  }, [selectedIndex, open]);
  // Reset when dialog opens
  useEffect(() => {
    if (!open) return;
    setSelectedIndex(0);
    setIsPlaying(false);
    setIsMuted(true);
  }, [open]);
  useEffect(() => {
    if (!open && mainVideoRef.current) {
      mainVideoRef.current.pause();
      mainVideoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [open]);
  useEffect(() => {
    if (mainVideoRef.current) {
      mainVideoRef.current.pause();
      mainVideoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [selectedIndex]);
  const handleVideoCanPlay = useCallback(() => {
    setMainLoaded(true);
    if (!shouldAutoplay || !mainVideoRef.current) return;
    mainVideoRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [shouldAutoplay]);
  useEffect(() => {
    if (!open) return;
    if (currentMedia?.type !== 'video') return;
    const video = mainVideoRef.current;
    if (!video) return;
    // Kick autoplay on open or media change
    const id = window.setTimeout(() => {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }, 0);
    return () => window.clearTimeout(id);
  }, [open, currentMedia?.type, currentMedia?.url]);
  useEffect(() => {
    if (!open) return;
    if (currentMedia?.type !== 'video') return;
    // Warm the cache for faster first frame
    const preloader = document.createElement('video');
    preloader.preload = 'auto';
    preloader.muted = true;
    preloader.src = currentMedia.url;
    return () => {
      preloader.src = '';
    };
  }, [open, currentMedia?.type, currentMedia?.url]);
  if (!product || media.length === 0) return null;
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
  const renderMedia = (item: MediaItem | null, isThumbnail: boolean = false, index?: number) => {
    if (!item) return null;
    if (item.type === 'video') {
      if (isThumbnail) {
        return (
          <div className="relative w-full h-full bg-black/40 flex items-center justify-center">
            <Play className="h-4 w-4 text-white" fill="white" />
          </div>
        );
      }
      return (
        <div className="relative w-full h-full">
          <video
            ref={mainVideoRef}
            className="w-full h-full object-contain"
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            autoPlay={shouldAutoplay}
            src={item.url}
            poster={posterImage || undefined}
            onLoadedMetadata={() => setMainLoaded(true)}
            onLoadedData={() => setMainLoaded(true)}
            onCanPlay={handleVideoCanPlay}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
   
    return (
      <img
        src={item.url}
        alt={isThumbnail ? `Thumbnail ${index}` : product.name}
        className={`${isThumbnail ? 'w-full h-full object-cover' : 'max-w-full max-h-full object-contain'}`}
        draggable={false}
        loading={isThumbnail ? 'lazy' : 'eager'}
        decoding="async"
        fetchpriority={!isThumbnail ? 'high' : 'low'}
        onLoad={() => !isThumbnail && setMainLoaded(true)}
      />
    );
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 w-[96vw] max-w-[420px] sm:max-w-[680px] lg:max-w-5xl h-[94vh] sm:h-[82vh] lg:h-[78vh] max-h-[820px] flex flex-col bg-white dark:bg-zinc-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <DialogDescription className="sr-only">
          Product details, gallery, and actions
        </DialogDescription>
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
              {!mainLoaded && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}
              {renderMedia(currentMedia)}
            </div>
            {currentMedia?.type === 'video' && (
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
            {currentMedia?.type === 'video' && (
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
          <div className="px-5 py-6 pb-32 space-y-6">
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
              {product.name}
            </h1>
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
          <div className="relative bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 w-[54%] flex flex-col shrink-0 border-r border-zinc-200 dark:border-zinc-800">
            <div className="flex-1 flex items-center justify-center p-6 min-h-0">
              {!mainLoaded && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}
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
            {currentMedia?.type === 'video' && (
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
            <div className="p-6 xl:p-8 space-y-6">
              <h1 className="text-xl xl:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                {product.name}
              </h1>
              <div className="pb-5 border-b border-zinc-200 dark:border-zinc-800" />
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
              <div className="pt-4">
                <WhatsAppButton
                  product={product}
                  className="w-full h-12 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 shadow-2xl">
          <WhatsAppButton
            product={product}
            className="w-full h-12 text-sm font-semibold rounded-xl shadow-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default ProductDialog;
