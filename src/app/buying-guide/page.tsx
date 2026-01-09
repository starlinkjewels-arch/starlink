'use client';

import type { Metadata } from 'next';
import BuyingGuidePage from '@/pages/BuyingGuide';

// export const metadata: Metadata = {
//   title: 'Diamond Buying Guide | How to Buy Diamonds | Starlink Jewels',
//   description: 'Complete guide to buying diamonds - learn about the 4 Cs, diamond certification, lab-grown vs natural diamonds, and how to choose the perfect diamond for your budget.',
//   keywords: 'diamond buying guide, how to buy diamonds, 4 cs of diamonds, diamond certification, lab grown diamonds, natural diamonds, diamond quality, diamond education, GIA certificate',
//   alternates: {
//     canonical: 'https://starlinkjewels.com/buying-guide',
//   },
//   openGraph: {
//     type: 'website',
//     url: 'https://starlinkjewels.com/buying-guide',
//     title: 'Diamond Buying Guide | Starlink Jewels',
//     description: 'Learn how to buy the perfect diamond - comprehensive guide covering certification, quality, pricing, and expert tips.',
//   },
// };

export default function BuyingGuidePageWrapper() {
  return <BuyingGuidePage />;
}
