import { useEffect, useState } from 'react';
import logo from '@/assets/starlink-logo-horizontal.png';
import { cn } from '@/lib/utils';

interface GlobalLoaderProps {
  isLoading: boolean;
}

const GlobalLoader = ({ isLoading }: GlobalLoaderProps) => {
  const [show, setShow] = useState(isLoading);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShow(true);
      setFadeOut(false);
      return;
    }
    setFadeOut(true);
    const timer = setTimeout(() => setShow(false), 500);
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (!show) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-background transition-opacity duration-500',
        fadeOut ? 'opacity-0' : 'opacity-100'
      )}
      role="status"
      aria-label="Loading"
    >
      <img src={logo} alt="Starlink Jewels" className="h-12 w-auto animate-pulse dark:brightness-150 sm:h-14" loading="eager" decoding="async" />
      <div className="h-px w-40 overflow-hidden bg-border">
        <div className="h-full w-1/3 animate-[loader-slide_1.4s_ease-in-out_infinite] bg-brand" />
      </div>
      <style>{`@keyframes loader-slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
    </div>
  );
};

export default GlobalLoader;
