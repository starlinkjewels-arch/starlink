import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import QueryClientWrapper from '@/components/providers/QueryClientWrapper';
import PromoHeader from '@/components/PromoHeader';
import MiniHeader from '@/components/MiniHeader';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import '@/index.css';

export const metadata: Metadata = {
  title: 'Starlink Jewels - Premium Diamond & Gold Jewelry | Lab Grown & Natural Diamonds',
  description: 'Shop certified lab-grown and natural diamond jewelry at Starlink Jewels. Explore GIA certified engagement rings, wedding bands, necklaces, earrings & bracelets. Free worldwide shipping. Best prices guaranteed.',
  keywords: 'diamond jewelry, gold rings, engagement rings, wedding bands, lab grown diamonds, natural diamonds, certified jewelry, luxury jewelry store, GIA certified diamonds, platinum rings, solitaire rings, diamond necklaces, gold earrings, diamond bracelets, custom jewelry design, wholesale diamond jewelry, buy diamonds online, best diamond jewelry store, affordable diamond rings, diamond jewelry Mumbai India',
  authors: [{ name: 'Starlink Jewels' }],
  creator: 'Starlink Jewels',
  publisher: 'Starlink Jewels',
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://starlinkjewels.com',
    title: 'Starlink Jewels - Premium Diamond & Gold Jewelry',
    description: 'Shop certified lab-grown and natural diamond jewelry at Starlink Jewels',
    images: [
      {
        url: 'https://starlinkjewels.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Starlink Jewels',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starlink Jewels - Premium Diamond & Gold Jewelry',
    description: 'Shop certified lab-grown and natural diamond jewelry at Starlink Jewels',
    creator: '@starlinkjewels',
  },
  alternates: {
    canonical: 'https://starlinkjewels.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider>
            <QueryClientWrapper>
              <div className="flex flex-col min-h-screen bg-background">
                <PromoHeader />
                <MiniHeader />
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
              <ScrollToTop />
              <Toaster />
              <Sonner />
            </QueryClientWrapper>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
