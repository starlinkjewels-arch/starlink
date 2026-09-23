import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX, X, ArrowUpRight } from "lucide-react";
import type { Product, VideoPost } from "@/lib/storage";
import { isVideoUrl } from "@/lib/media";
import WhatsAppButton from "@/components/WhatsAppButton";
import { cn } from "@/lib/utils";

interface VideoReelsProps {
  videos: VideoPost[];
  products: Product[];
}

const productThumb = (product?: Product) => {
  if (!product) return undefined;
  const media = product.images && product.images.length > 0 ? product.images : [product.image];
  return media.find((url) => url && !isVideoUrl(url));
};

// One reel in the strip. Only loads/plays while it is on screen to keep the homepage light.
const ReelCard = ({ video, product, onOpen }: { video: VideoPost; product?: Product; onOpen: () => void }) => {
  const wrapperRef = useRef<HTMLButtonElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.6 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (inView) {
      el.play().catch(() => undefined);
    } else {
      el.pause();
    }
  }, [inView]);

  const thumb = productThumb(product);

  return (
    <button
      ref={wrapperRef}
      type="button"
      onClick={onOpen}
      className="group relative aspect-[9/16] w-[62vw] max-w-[300px] shrink-0 snap-start overflow-hidden rounded-lg bg-neutral-900 text-left sm:w-[260px] lg:w-[280px]"
      aria-label={video.title ? `Play video: ${video.title}` : "Play video"}
    >
      {video.poster && (
        <img src={video.poster} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
      )}
      <video
        ref={videoRef}
        src={inView ? video.url : undefined}
        poster={video.poster}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        muted
        loop
        playsInline
        preload="none"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

      <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md">
        <Play className="h-3.5 w-3.5 fill-current" />
      </span>

      <div className="absolute inset-x-0 bottom-0 space-y-3 p-4 text-white">
        {video.title && <p className="font-display text-xl leading-tight">{video.title}</p>}
        {product && (
          <div className="flex items-center gap-2.5 rounded-md bg-white/95 p-2 text-neutral-900">
            {thumb && <img src={thumb} alt="" className="h-10 w-10 shrink-0 rounded object-cover" loading="lazy" />}
            <span className="line-clamp-2 text-xs font-medium leading-snug">{product.name}</span>
          </div>
        )}
      </div>
    </button>
  );
};

interface ViewerProps {
  videos: VideoPost[];
  productsById: Map<string, Product>;
  index: number;
  onClose: () => void;
  onChange: (index: number) => void;
}

const ReelViewer = ({ videos, productsById, index, onClose, onChange }: ViewerProps) => {
  const [muted, setMuted] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const video = videos[index];
  const product = video?.productId ? productsById.get(video.productId) : undefined;
  const thumb = productThumb(product);

  const go = useCallback(
    (delta: number) => onChange((index + delta + videos.length) % videos.length),
    [index, onChange, videos.length]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") go(1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(-1);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [go, onClose]);

  if (!video) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Video viewer"
      onTouchStart={(e) => (touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        if (!touchStart.current) return;
        const dx = e.changedTouches[0].clientX - touchStart.current.x;
        const dy = e.changedTouches[0].clientY - touchStart.current.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) > 50) go(Math.abs(dy) > Math.abs(dx) ? (dy < 0 ? 1 : -1) : dx < 0 ? 1 : -1);
        touchStart.current = null;
      }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {videos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:flex"
            aria-label="Previous video"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:flex"
            aria-label="Next video"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <div className="relative h-[100dvh] w-full max-w-[min(100vw,calc(100dvh*9/16))] overflow-hidden bg-black md:h-[90dvh] md:rounded-xl">
        <video
          key={video.id}
          src={video.url}
          poster={video.poster}
          className="h-full w-full object-cover"
          autoPlay
          loop
          playsInline
          muted={muted}
          onClick={(e) => {
            const el = e.currentTarget;
            if (el.paused) el.play().catch(() => undefined);
            else el.pause();
          }}
        />

        <div className="absolute inset-x-0 top-0 flex gap-1 p-3">
          {videos.map((v, i) => (
            <span key={v.id} className={cn("h-0.5 flex-1 rounded-full", i === index ? "bg-white" : "bg-white/30")} />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="absolute left-3 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 space-y-3 p-4 pb-6 text-white">
          {video.title && <p className="font-display text-2xl leading-tight">{video.title}</p>}
          {product ? (
            <div className="space-y-2 rounded-lg bg-white p-3 text-neutral-900">
              <Link to={`/product/${product.id}`} onClick={onClose} className="flex items-center gap-3">
                {thumb && <img src={thumb} alt="" className="h-14 w-14 shrink-0 rounded object-cover" />}
                <span className="flex-1 text-sm font-medium leading-snug">{product.name}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0" />
              </Link>
              <WhatsAppButton product={product} variant="whatsapp" size="default" className="w-full" />
            </div>
          ) : (
            <Link to="/categories" onClick={onClose} className="link-underline text-white">
              Explore collections <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const VideoReels = ({ videos, products }: VideoReelsProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const scrollBy = (dir: number) => {
    const el = scrollerRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  if (videos.length === 0) return null;

  return (
    <div className="relative">
      <div ref={scrollerRef} className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        {videos.map((video, i) => (
          <ReelCard
            key={video.id}
            video={video}
            product={video.productId ? productsById.get(video.productId) : undefined}
            onOpen={() => setOpenIndex(i)}
          />
        ))}
      </div>

      {videos.length > 4 && (
        <div className="mt-6 hidden justify-end gap-2 md:flex">
          <button type="button" onClick={() => scrollBy(-1)} className="flex h-11 w-11 items-center justify-center rounded-full border hover:bg-foreground hover:text-background" aria-label="Scroll left">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => scrollBy(1)} className="flex h-11 w-11 items-center justify-center rounded-full border hover:bg-foreground hover:text-background" aria-label="Scroll right">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {openIndex !== null && (
        <ReelViewer
          videos={videos}
          productsById={productsById}
          index={openIndex}
          onChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  );
};

export default VideoReels;
