'use client';

import type { Metadata } from 'next';
import About from '@/pages/About';

export const metadata: Metadata = {
  title: 'About Starlink Jewels | 11+ Years of Diamond Jewelry Excellence | GIA Certified',
  description: 'Learn about Starlink Jewels - 11+ years of premium diamond and gold jewelry craftsmanship. Master artisans, ethical sourcing, 12K+ satisfied customers worldwide, GIA certified partner.',
  keywords: 'about starlink jewels, jewelry brand history, luxury jewelry heritage, diamond craftsmanship, GIA certified jeweler, ethical diamond sourcing, jewelry makers, premium jewelry brand, jewelry company, expert jewelry craftsmen',
  alternates: {
    canonical: 'https://starlinkjewels.com/about',
  },
  openGraph: {
    type: 'website',
    url: 'https://starlinkjewels.com/about',
    title: 'About Starlink Jewels | Premium Jewelry Excellence',
    description: 'Discover our 11+ year heritage of crafting exceptional diamond and gold jewelry with master artisans and ethical practices.',
  },
};

export default function AboutPage() {
  return <About />;
}
