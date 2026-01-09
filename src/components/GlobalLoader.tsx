import { useEffect, useState } from 'react';
import logo from '@/assets/starlink-logo-horizontal.png';

interface GlobalLoaderProps {
  isLoading: boolean;
  imagesToPreload?: string[];
}

const GlobalLoader = ({ isLoading, imagesToPreload = [] }: GlobalLoaderProps) => {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload images and videos
  useEffect(() => {
    if (imagesToPreload.length === 0) {
      setImagesLoaded(true);
      return;
    }

    let loadedCount = 0;
    const totalAssets = imagesToPreload.length;

    const markLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalAssets) {
        setImagesLoaded(true);
      }
    };

    imagesToPreload.forEach((src) => {
      if (!src) {
        markLoaded();
        return;
      }

      // Check if it's a video
      if (src.match(/\.(mp4|webm|ogg)$/i)) {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.onloadeddata = markLoaded;
        video.onerror = markLoaded;
        video.src = src;
      } else {
        const img = new Image();
        img.onload = markLoaded;
        img.onerror = markLoaded;
        img.src = src;
      }
    });

    // Fallback timeout in case assets take too long (3 seconds max)
    const timeout = setTimeout(() => setImagesLoaded(true), 3000);
    return () => clearTimeout(timeout);
  }, [imagesToPreload]);

  useEffect(() => {
    // Only fade out when both data is loaded AND images are preloaded
    if (!isLoading && imagesLoaded) {
      setFadeOut(true);
      const timer = setTimeout(() => setShow(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, imagesLoaded]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-300" />
      </div>

      {/* Logo Container */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo with Animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-ping" />
          <img
            src={typeof logo === 'string' ? logo : (logo as any)?.src || String(logo)}
            alt="Starlink Jewels"
            className="h-16 sm:h-20 w-auto relative z-10 animate-[pulse_2s_ease-in-out_infinite]"
          />
        </div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
          </div>
          <p className="text-sm text-muted-foreground font-medium tracking-wider uppercase">
            Loading Excellence
          </p>
        </div>

        {/* Shimmer Line */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>

      {/* Diamond Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/60 rotate-45 animate-float"
            style={{
              left: `${20 + i * 12}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default GlobalLoader;
