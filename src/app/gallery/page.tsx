'use client';

import type { Metadata } from 'next';
import Gallery from '@/pages/Gallery';

export const metadata: Metadata = {
  title: 'Jewelry Gallery | Diamond & Gold Collections | Starlink Jewels',
  description: 'Browse our stunning gallery of premium diamond and gold jewelry collections. See our handcrafted pieces, engagement rings, wedding bands, and luxury accessories.',
  keywords: 'jewelry gallery, diamond gallery, jewelry photos, jewelry showcase, premium jewelry collections, handcrafted jewelry, luxury jewelry gallery, diamond jewelry photos',
  alternates: {
    canonical: 'https://starlinkjewels.com/gallery',
  },
  openGraph: {
    type: 'website',
    url: 'https://starlinkjewels.com/gallery',
    title: 'Jewelry Gallery | Starlink Jewels',
    description: 'Explore our beautiful collection of premium diamond and gold jewelry pieces.',
  },
};

export default function GalleryPage() {
  return <Gallery />;
}
