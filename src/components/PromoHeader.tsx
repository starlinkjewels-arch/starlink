'use client';

import { useGlobalData } from '@/hooks/useGlobalData';

export default function PromoHeader() {
  const { promoHeader } = useGlobalData();

  if (!promoHeader?.enabled || !promoHeader?.text) {
    return null;
  }

  return (
    <div className="bg-primary text-primary-foreground text-center py-2.5 px-4 text-sm font-medium animate-pulse">
      {promoHeader.text}
    </div>
  );
}
