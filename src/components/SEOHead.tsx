import { Helmet } from "react-helmet-async";
import { SITE, buildKeywords } from "@/lib/seo";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  structuredData?: object | object[];
  faqItems?: Array<{ question: string; answer: string }>;
  breadcrumbs?: Array<{ name: string; url: string }>;
  noIndex?: boolean;
}

const SEOHead = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = SITE.ogImage,
  ogType = "website",
  structuredData,
  faqItems,
  breadcrumbs,
  noIndex = false,
}: SEOHeadProps) => {
  const siteName = SITE.name;
  const fullTitle = `${title} | ${siteName}`;
  const baseUrl = SITE.url;
  const pageUrl = canonicalUrl || baseUrl;
  const metaKeywords = keywords || buildKeywords();
  const ogImageUrl = ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`;

  const jewelryStoreSchema = {
    "@type": "JewelryStore",
    "@id": `${baseUrl}/#jewelry-store`,
    name: siteName,
    description:
      "Premium diamond and gold jewelry store offering certified lab-grown and natural diamonds, engagement rings, wedding bands, and custom jewelry designs.",
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: SITE.ogImage,
      width: 512,
      height: 512,
    },
    image: SITE.ogImage,
    email: SITE.email,
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      addressCountry: SITE.addressIndia.country,
      addressRegion: SITE.addressIndia.region,
      addressLocality: SITE.addressIndia.locality,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "21.1702",
      longitude: "72.8311",
    },
    location: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: SITE.addressUsa.street,
        addressLocality: SITE.addressUsa.locality,
        addressRegion: SITE.addressUsa.region,
        postalCode: SITE.addressUsa.postalCode,
        addressCountry: SITE.addressUsa.country,
      },
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "19:00",
      },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: SITE.phonePrimary,
        email: SITE.email,
        contactType: "sales",
        areaServed: SITE.areaServed,
        availableLanguage: ["English"],
      },
      {
        "@type": "ContactPoint",
        telephone: SITE.phoneWhatsApp,
        contactType: "customer support",
        contactOption: "TollFree",
        areaServed: SITE.areaServed,
        availableLanguage: ["English"],
      },
    ],
    areaServed: SITE.areaServed,
    currenciesAccepted: "USD, INR, AUD, CAD, EUR, GBP",
    paymentAccepted: "Credit Card, Bank Transfer, Wire Transfer",
    sameAs: [...SITE.sameAs],
  };

  const webSiteSchema = {
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    name: siteName,
    url: baseUrl,
    publisher: {
      "@id": `${baseUrl}/#jewelry-store`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/categories?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const webPageSchema = {
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    name: fullTitle,
    description,
    url: pageUrl,
    inLanguage: "en",
    isPartOf: {
      "@id": `${baseUrl}/#website`,
    },
    publisher: {
      "@id": `${baseUrl}/#jewelry-store`,
    },
    breadcrumb: breadcrumbs && breadcrumbs.length > 0
      ? { "@id": `${pageUrl}#breadcrumb` }
      : undefined,
  };

  const graphItems: object[] = [jewelryStoreSchema, webSiteSchema, webPageSchema];

  if (breadcrumbs && breadcrumbs.length > 0) {
    graphItems.push({
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: breadcrumbs.map((b, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: b.name,
        item: b.url,
      })),
    });
  }

  if (faqItems && faqItems.length > 0) {
    graphItems.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: faqItems.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer,
        },
      })),
    });
  }

  if (structuredData) {
    if (Array.isArray(structuredData)) {
      graphItems.push(...structuredData);
    } else {
      graphItems.push(structuredData);
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graphItems,
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={metaKeywords} />
      <meta
        name="robots"
        content={
          noIndex
            ? "noindex, nofollow"
            : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        }
      />
      <meta name="googlebot" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <meta name="bingbot" content={noIndex ? "noindex, nofollow" : "index, follow"} />
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

      <link rel="canonical" href={pageUrl} />
      <link rel="alternate" hrefLang="en" href={pageUrl} />
      <link rel="alternate" hrefLang="x-default" href={pageUrl} />

      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:secure_url" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="en_GB" />
      <meta property="og:locale:alternate" content="en_CA" />
      <meta property="og:locale:alternate" content="en_AU" />
      <meta property="og:url" content={pageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@starlinkjewels" />
      <meta name="twitter:creator" content="@starlinkjewels" />
      <meta name="twitter:domain" content="www.starlinkjewels.com" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />
      <meta name="twitter:image:alt" content={title} />

      <meta name="pinterest-rich-pin" content="true" />

      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />

      <meta name="msapplication-TileColor" content="#1a1a1a" />
      <meta name="theme-color" content="#1a1a1a" />

      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default SEOHead;
