'use client';

import type { Metadata } from 'next';
import Categories from '@/pages/Categories';

export const metadata: Metadata = {
  title: 'Diamond Jewelry Categories | Engagement Rings, Necklaces, Earrings | Starlink Jewels',
  description: 'Explore our extensive collection of diamond and gold jewelry categories. Find engagement rings, wedding bands, necklaces, earrings, bracelets, and more. GIA certified. Free shipping worldwide.',
  keywords: 'jewelry categories, diamond rings, gold necklaces, diamond earrings, wedding jewelry, engagement rings, diamond bracelets, jewelry collection, luxury jewelry categories, certified diamonds',
  alternates: {
    canonical: 'https://starlinkjewels.com/categories',
  },
  openGraph: {
    type: 'website',
    url: 'https://starlinkjewels.com/categories',
    title: 'Browse Jewelry Categories | Starlink Jewels',
    description: 'Shop premium diamond and gold jewelry across multiple categories - rings, necklaces, earrings, bracelets and more.',
  },
};

export default function CategoriesPage() {
  return <Categories />;
}
