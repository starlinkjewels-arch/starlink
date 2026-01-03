import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  structuredData?: object;
}

const SEOHead = ({
  title,
  description,
  keywords = 'diamond jewelry, gold rings, silver necklaces, engagement rings, wedding bands, luxury jewelry, lab grown diamonds, natural diamonds, certified jewelry, custom jewelry, fine jewelry, jewelry store, online jewelry, diamond earrings, gold bracelets, precious stones, gemstone jewelry, platinum jewelry, bridal jewelry, anniversary gifts, GIA certified diamonds, IGI certified diamonds, solitaire rings, diamond pendants, gold chains, pearl jewelry, ruby rings, sapphire jewelry, emerald rings, tennis bracelets, eternity bands, promise rings, cocktail rings, statement necklaces, hoop earrings, stud earrings, drop earrings, charm bracelets, cuff bracelets, bangles, anklets, body jewelry, mens jewelry, womens jewelry, unisex jewelry, vintage jewelry, antique jewelry, contemporary jewelry, minimalist jewelry, bohemian jewelry, luxury watches',
  canonicalUrl,
  ogImage = '/og-image.jpg',
  ogType = 'website',
  structuredData,
}: SEOHeadProps) => {
  const siteName = 'Starlink Jewels';
  const fullTitle = `${title} | ${siteName}`;
  const baseUrl = 'https://starlinkjewels.com';
  
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    name: siteName,
    description: 'Premium diamond and gold jewelry store offering certified lab-grown and natural diamonds, engagement rings, wedding bands, and custom jewelry designs.',
    url: 'https://starlinkjewels.com',
    logo: 'https://starlinkjewels.com/logo.png',
    priceRange: '$$$',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
    },
    sameAs: [
      'https://instagram.com/starlinkjewels',
      'https://facebook.com/starlinkjewels',
      'https://pinterest.com/starlinkjewels',
    ],
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="language" content="English" />
      <meta name="author" content={siteName} />
      <meta name="publisher" content={siteName} />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <meta httpEquiv="content-language" content="en" />
      <meta name="geo.region" content="IN-GJ" />
      <meta name="geo.placename" content="Surat" />
      <meta name="geo.position" content="21.1702;72.8311" />
      <meta name="ICBM" content="21.1702, 72.8311" />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Alternate Languages */}
      <link rel="alternate" hrefLang="en" href={canonicalUrl || baseUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl || baseUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content="en_US" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@starlinkjewels" />
      <meta name="twitter:creator" content="@starlinkjewels" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* Pinterest */}
      <meta name="pinterest-rich-pin" content="true" />
      
      {/* Apple */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      
      {/* Microsoft */}
      <meta name="msapplication-TileColor" content="#1a1a1a" />
      <meta name="theme-color" content="#1a1a1a" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
    </Helmet>
  );
};

export default SEOHead;
