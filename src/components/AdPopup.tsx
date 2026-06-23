import { useEffect, useState } from 'react';
import { getAd, type Ad } from '@/lib/storage';
import { X } from 'lucide-react';

const AD_LS_KEY = 'starlink_ad_closed_at';
const COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours
const DELAY_MS = 5000; // 5 seconds

const AdPopup = () => {
  const [ad, setAd] = useState<Ad | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check cooldown before even fetching
    try {
      const closedAt = localStorage.getItem(AD_LS_KEY);
      if (closedAt && Date.now() - Number(closedAt) < COOLDOWN_MS) return;
    } catch {
      // ignore
    }

    getAd().then((data) => {
      if (!data || !data.enabled || !data.image) return;
      setAd(data);
      // Preload image immediately during the delay so it shows instantly when popup opens
      const preload = new Image();
      preload.src = data.image;
      const timer = setTimeout(() => setVisible(true), DELAY_MS);
      return () => clearTimeout(timer);
    });
  }, []);

  const handleClose = () => {
    setVisible(false);
    try {
      localStorage.setItem(AD_LS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  };

  if (!visible || !ad) return null;

  const imgEl = (
    <img
      src={ad.image}
      alt="Advertisement"
      className="max-w-[92vw] max-h-[92vh] w-auto h-auto object-contain rounded-xl shadow-2xl"
      style={{ display: 'block' }}
    />
  );

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleClose}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors shadow-lg"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      <div onClick={(e) => e.stopPropagation()}>
        {ad.link ? (
          <a href={ad.link} target="_blank" rel="noopener noreferrer" onClick={handleClose}>
            {imgEl}
          </a>
        ) : (
          imgEl
        )}
      </div>
    </div>
  );
};

export default AdPopup;
