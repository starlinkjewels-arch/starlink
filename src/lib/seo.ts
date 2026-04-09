export const SITE = {
  name: "Starlink Jewels",
  url: "https://www.starlinkjewels.com",
  ogImage: "https://www.starlinkjewels.com/icon.png",
  phonePrimary: "+91 9967381180",
  phoneWhatsApp: "+91 9967381180",
  email: "info@starlinkjewels.com",
  areaServed: ["US", "CA", "AU", "DE", "GB", "IN"],
  addressIndia: {
    country: "IN",
    region: "Gujarat",
    locality: "Surat",
  },
  addressUsa: {
    street: "55 John St",
    locality: "East Rutherford",
    region: "NJ",
    postalCode: "07073",
    country: "US",
  },
  sameAs: [
    "https://instagram.com/starlinkjewels",
    "https://facebook.com/starlinkjewels",
    "https://pinterest.com/starlinkjewels",
  ],
  keywords: [
    "lab grown diamond jewelry",
    "natural diamond engagement rings",
    "custom diamond jewelry",
    "eternity ring lab grown diamonds",
    "diamond necklace online India",
    "wholesale lab grown diamonds Surat",
    "certified lab grown diamond rings",
    "14KT gold diamond earrings",
    "luxury diamond wedding bands",
    "buy natural and lab grown diamonds online",
    "diamond jewelry",
    "gold jewelry",
    "engagement rings",
    "wedding bands",
    "GIA certified",
    "IGI certified",
    "worldwide shipping jewelry",
    "diamond jewelry USA",
    "diamond jewelry Canada",
    "diamond jewelry Australia",
    "diamond jewelry Germany",
  ],
};

export const buildKeywords = (extra?: string) => {
  const base = SITE.keywords.join(", ");
  return extra ? `${extra}, ${base}` : base;
};

export const pingSitemapOncePerDay = () => {
  if (typeof window === "undefined") return;
  if (import.meta.env.MODE !== "production") return;

  const key = "sitemap_ping_last";
  const today = new Date().toISOString().slice(0, 10);
  const last = window.localStorage.getItem(key);
  if (last === today) return;

  const sitemapUrl = `${SITE.url}/sitemap.xml`;
  const targets = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  ];

  targets.forEach((url) => {
    fetch(url, { method: "GET", mode: "no-cors", keepalive: true }).catch(() => {});
  });

  window.localStorage.setItem(key, today);
};

export const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

export const buildMetaDescriptionFromHtml = (html: string, max = 160) => {
  const text = stripHtml(html);
  if (!text) return "";
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 60 ? lastSpace : max).trim()}...`;
};

export const buildMetaTitleForCategory = (categoryName: string) => {
  return `${categoryName} Jewelry | Premium Diamond & Gold | ${SITE.name}`;
};

export const buildMetaDescriptionForCategory = (categoryName: string, desc?: string) => {
  if (desc && desc.trim().length > 40) return desc.trim();
  return `Explore premium ${categoryName.toLowerCase()} jewelry at ${SITE.name}. Certified lab-grown and natural diamonds with worldwide delivery to USA, Canada, Australia, and Germany.`;
};

export const buildMetaTitleForProduct = (productName: string) => {
  return `${productName} | ${SITE.name}`;
};

export const buildMetaDescriptionForProduct = (productName: string, categoryName?: string) => {
  const categoryText = categoryName ? ` in ${categoryName}` : "";
  return `Discover ${productName}${categoryText} at ${SITE.name}. Certified lab-grown and natural diamonds with worldwide delivery to USA, Canada, Australia, and Germany.`;
};

export const parsePrice = (price?: string): number | null => {
  if (!price) return null;
  const normalized = price
    .toString()
    .replace(/[, ]/g, "")
    .replace(/[^\d.]/g, "");
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) && value > 0 ? value : null;
};

export const buildOffer = (url: string, price?: string) => {
  const numericPrice = parsePrice(price);
  return {
    "@type": "Offer",
    availability: "https://schema.org/InStock",
    url,
    ...(numericPrice ? { price: numericPrice, priceCurrency: "USD" } : {}),
  };
};

export const buildMetaTitleForBlog = (title: string) => {
  return `${title} | ${SITE.name} Blog`;
};

export const buildMetaDescriptionForBlog = (html: string) => {
  return buildMetaDescriptionFromHtml(html, 165);
};

export const buildFaqForCategory = (categoryName: string) => [
  {
    question: `Are ${categoryName} diamonds certified?`,
    answer: "Yes. We offer certified lab-grown and natural diamonds with trusted grading standards.",
  },
  {
    question: `Can I customize ${categoryName} designs?`,
    answer: "Yes. We offer custom design and manufacturing for select categories and styles.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes. We provide international shipping with secure packaging for select regions.",
  },
];

export const buildFaqForProduct = (productName: string, categoryName?: string) => [
  {
    question: `Is ${productName} certified?`,
    answer: "Yes. We provide certification for lab-grown and natural diamonds where applicable.",
  },
  {
    question: `Can ${productName} be customized?`,
    answer: "Yes. Contact us for custom sizing, metal options, or design adjustments.",
  },
  {
    question: `What is the delivery time for ${categoryName || "this item"}?`,
    answer: "We offer secure, insured shipping with delivery timelines based on your region.",
  },
];
