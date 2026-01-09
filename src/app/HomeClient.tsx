'use client';

import { useEffect } from 'react';
import Index from '@/pages/Index';
import { requestLocationAndLog } from '@/lib/locationPermission';
import GlobalLoader from '@/components/GlobalLoader';
import { useGlobalData } from '@/hooks/useGlobalData';

export default function HomeClient() {
  const { isLoading, banners, categories, featuredCollection, galleryItems } = useGlobalData();

  useEffect(() => {
    const timer = setTimeout(() => {
      requestLocationAndLog();
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const imagesToPreload = [
    ...banners.map(b => b.image),
    ...categories.slice(0, 6).map(c => c.image),
    ...featuredCollection.slice(0, 4).map(f => f.image),
    ...galleryItems.slice(0, 4).map(g => g.image),
  ].filter(Boolean);

  const showLoader = isLoading;

  return (
    <>
      <GlobalLoader isLoading={showLoader} imagesToPreload={imagesToPreload} />
      <Index />
    </>
  );
}