'use client';

import type { Metadata } from 'next';
import Blog from '@/pages/Blog';

export const metadata: Metadata = {
  title: 'Jewelry Blog | Diamond Buying Guide, Jewelry Tips & Trends | Starlink Jewels',
  description: 'Read our jewelry blog for expert tips on buying diamonds, jewelry care, latest trends, and educational articles about certified gemstones and luxury jewelry.',
  keywords: 'jewelry blog, diamond buying guide, how to buy diamonds, jewelry tips, jewelry trends, diamond education, gemstone guide, jewelry care tips, luxury jewelry news, certified diamonds',
  alternates: {
    canonical: 'https://starlinkjewels.com/blog',
  },
  openGraph: {
    type: 'website',
    url: 'https://starlinkjewels.com/blog',
    title: 'Jewelry Blog & Buying Guide | Starlink Jewels',
    description: 'Expert tips and guides on buying diamonds, jewelry trends, care tips, and gemstone education.',
  },
};

export default function BlogPage() {
  return <Blog />;
}
