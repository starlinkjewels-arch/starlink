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
}: SEOHeadProps) => {
  const siteName = SITE.name;
  const fullTitle = `${title} | ${siteName}`;
  const baseUrl = SITE.url;
  const pageUrl = canonicalUrl || baseUrl;
  const metaKeywords = keywords || buildKeywords();

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    "@id": `${baseUrl}/#jewelry-store`,
    name: siteName,
    description:
      "Premium diamond and gold jewelry store offering certified lab-grown and natural diamonds, engagement rings, wedding bands, and custom jewelry designs.",
    url: baseUrl,
    logo: SITE.ogImage,
    image: SITE.ogImage,
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      addressCountry: SITE.addressIndia.country,
      addressRegion: SITE.addressIndia.region,
      addressLocality: SITE.addressIndia.locality,
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
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: SITE.phonePrimary,
        contactType: "sales",
        areaServed: SITE.areaServed,
        availableLanguage: ["English"],
      },
      {
        "@type": "ContactPoint",
        telephone: SITE.phoneWhatsApp,
        contactType: "customer support",
        areaServed: SITE.areaServed,
        availableLanguage: ["English"],
      },
    ],
    areaServed: SITE.areaServed,
    sameAs: [...SITE.sameAs],
  };

  const webSiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    name: siteName,
    url: baseUrl,
    publisher: {
      "@id": `${baseUrl}/#jewelry-store`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/categories?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const webPageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    name: fullTitle,
    description,
    url: pageUrl,
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: baseUrl,
    },
    publisher: {
      "@id": `${baseUrl}/#jewelry-store`,
    },
  };

  const breadcrumbStructuredData =
    breadcrumbs && breadcrumbs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "@id": `${pageUrl}#breadcrumb`,
          itemListElement: breadcrumbs.map((b, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            name: b.name,
            item: b.url,
          })),
        }
      : null;

  const faqStructuredData =
    faqItems && faqItems.length > 0
      ? {
          "@context": "https://schema.org",
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
        }
      : null;

  const structuredList: object[] = [
    defaultStructuredData,
    webSiteStructuredData,
    webPageStructuredData,
  ];

  if (breadcrumbStructuredData) structuredList.push(breadcrumbStructuredData);
  if (faqStructuredData) structuredList.push(faqStructuredData);

  if (structuredData) {
    if (Array.isArray(structuredData)) {
      structuredList.push(...structuredData);
    } else {
      structuredList.push(structuredData);
    }
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={metaKeywords} />
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
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
      <meta
        property="og:image"
        content={ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`}
      />
      <meta
        property="og:image:secure_url"
        content={ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`}
      />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
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
      <meta
        name="twitter:image"
        content={ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`}
      />
      <meta name="twitter:image:alt" content={title} />

      <meta name="pinterest-rich-pin" content="true" />

      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />

      <meta name="msapplication-TileColor" content="#1a1a1a" />
      <meta name="theme-color" content="#1a1a1a" />

      {structuredList.map((schema, idx) => (
        <script key={idx} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
