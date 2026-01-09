'use client';

import { useEffect } from 'react';

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

  useEffect(() => {
    // Update document meta tags dynamically
    document.title = fullTitle;
    
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      let element = document.querySelector(
        isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`
      );
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Primary Meta Tags
    setMetaTag('title', fullTitle);
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    setMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('language', 'English');
    setMetaTag('author', siteName);
    setMetaTag('publisher', siteName);
    setMetaTag('revisit-after', '7 days');
    setMetaTag('distribution', 'global');
    setMetaTag('rating', 'general');
    setMetaTag('geo.region', 'IN-GJ');
    setMetaTag('geo.placename', 'Surat');
    setMetaTag('geo.position', '21.1702;72.8311');
    setMetaTag('ICBM', '21.1702, 72.8311');

    // Open Graph / Facebook
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:site_name', siteName, true);
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`, true);
    setMetaTag('og:image:width', '1200', true);
    setMetaTag('og:image:height', '630', true);
    setMetaTag('og:image:alt', title, true);
    setMetaTag('og:locale', 'en_US', true);

    // Twitter
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:site', '@starlinkjewels');
    setMetaTag('twitter:creator', '@starlinkjewels');
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`);
    setMetaTag('twitter:image:alt', title);

    // Structured Data
    const scriptTag = (document.getElementById('structured-data') || document.createElement('script')) as HTMLScriptElement;
    scriptTag.id = 'structured-data';
    scriptTag.type = 'application/ld+json';
    scriptTag.textContent = JSON.stringify(structuredData || defaultStructuredData);
    if (!document.getElementById('structured-data')) {
      document.head.appendChild(scriptTag);
    }

    // Canonical URL
    if (canonicalUrl) {
      setMetaTag('og:url', canonicalUrl, true);
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', canonicalUrl);
    }
  }, [title, description, canonicalUrl, ogImage, ogType, structuredData]);

  return null;
};

export default SEOHead;
