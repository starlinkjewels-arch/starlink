export const SITE = {
  name: "Starlink Jewels",
  url: "https://starlinkjewels.com",
  ogImage: "https://starlinkjewels.com/icon.png",
  phonePrimary: "+1 (201) 554-4824",
  phoneWhatsApp: "+1 (201) 554-4824",
  email: "info@starlinkjewels.com",
  ringBuilder: {
    url: "https://ringbuilder.starlinkjewels.com/",
    label: "Ring Builder",
    description: "Design your own diamond ring",
    title: "Custom Engagement Ring Builder – Design Your Own Diamond Ring | Starlink Jewels",
  },
  viewer360: {
    url: "https://360.starlinkjewels.com/",
    label: "360° View",
    description: "Explore our jewelry from every angle",
    title: "360° Diamond Jewelry Viewer – See Every Angle in HD | Starlink Jewels",
  },
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

// Quote-aware tag matcher: attribute values pasted from other apps (e.g. ChatGPT) can contain ">" characters.
const TAG_PATTERN = /<\/?[a-zA-Z!][^>"']*(?:(?:"[^"]*"|'[^']*')[^>"']*)*>/g;

const decodeEntities = (value: string) =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");

// Parsing full article HTML is expensive and pages call this on every render, so results are cached.
const stripCache = new Map<string, string>();
const STRIP_CACHE_MAX = 400;

export const stripHtml = (html: string) => {
  if (!html) return "";
  const cached = stripCache.get(html);
  if (cached !== undefined) return cached;
  const result = stripHtmlUncached(html);
  if (stripCache.size >= STRIP_CACHE_MAX) stripCache.delete(stripCache.keys().next().value as string);
  stripCache.set(html, result);
  return result;
};

const stripHtmlUncached = (html: string) => {
  let text = html;
  if (typeof DOMParser !== "undefined") {
    // Let the browser parse real markup, then strip any escaped markup that was pasted as text.
    text = new DOMParser().parseFromString(html, "text/html").body.textContent || "";
  } else {
    text = decodeEntities(text.replace(TAG_PATTERN, " "));
  }
  return text.replace(TAG_PATTERN, " ").replace(/\s+/g, " ").trim();
};

export const cleanRichTextHtml = (html: string) => {
  if (!html) return "";

  return html
    .replace(/&nbsp;/gi, " ")
    .replace(/<li>(?:\s|&nbsp;|<br\s*\/?>|<\/?p>)*<\/li>/gi, "")
    .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "")
    .replace(/<div>(?:\s|&nbsp;|<br\s*\/?>)*<\/div>/gi, "")
    .replace(/(?:<br\s*\/?>\s*){3,}/gi, "<br><br>")
    .replace(/<(ul|ol)>\s*<\/\1>/gi, "")
    .trim();
};

// Bullets and emoji pasted into product text read badly in search snippets.
const SNIPPET_NOISE = /[●•▪◆◇■□✓✔✨🌀-🫿]/gu;

export const buildMetaDescriptionFromHtml = (html: string, max = 160) => {
  const text = stripHtml(html).replace(SNIPPET_NOISE, " ").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 60 ? lastSpace : max).trim()}...`;
};

// Title/description builders are mirrored in scripts/seo-data.mjs (pre-rendered pages); keep them in sync.
/**
 * Short plain-text preview for cards. Never render the whole stripped article inside a line-clamp:
 * the browser still lays out every hidden word (a Journal visit froze phones for seconds).
 */
export const excerpt = (html: string, max = 220) => buildMetaDescriptionFromHtml(html, max);

/**
 * SERP budgets. Google truncates titles around 60 characters and descriptions
 * around 155; anything past that is written for nobody.
 */
export const MAX_TITLE = 60;
export const DESC_MIN = 140;
export const DESC_MAX = 155;

const BRAND_SUFFIX = ` | ${SITE.name}`;

/**
 * Picks the richest title variant that still fits MAX_TITLE *including* the brand,
 * so the keyword leads and the brand survives. Variants run longest to shortest.
 */
export const fitTitle = (variants: string[]): string => {
  for (const v of variants) {
    const full = `${v}${BRAND_SUFFIX}`;
    if (full.length <= MAX_TITLE) return full;
  }
  // Nothing fits with the brand: keep the full name and drop the suffix rather
  // than ellipsizing a real product or article name.
  return variants[variants.length - 1];
};

/** Trims to the last whole word within max. */
const clampWords = (text: string, max: number) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
};

/**
 * Keeps a description inside the 140-155 window: pads a too-short one with a real
 * selling clause rather than leaving half a line, and word-trims a too-long one.
 */
export const fitDescription = (primary: string, filler: string): string => {
  const base = primary.trim().replace(/\s+/g, " ");
  if (base.length >= DESC_MIN) return clampWords(base, DESC_MAX);
  const joined = `${base.replace(/[.\s]+$/, "")}. ${filler}`.trim();
  return clampWords(joined, DESC_MAX);
};

const CATEGORY_FILLER = "Certified lab-grown & natural diamonds, handcrafted in Surat, with free insured worldwide delivery.";
const PRODUCT_FILLER = "Certified diamonds, made to order in Surat, with free insured worldwide delivery.";

export const buildMetaTitleForCategory = (categoryName: string) =>
  fitTitle([
    `Buy ${categoryName} Online – Lab-Grown & Natural Diamonds`,
    `${categoryName} – Lab-Grown & Natural Diamonds`,
    `${categoryName} – Certified Diamond Jewelry`,
    `Buy ${categoryName} Online`,
    categoryName,
  ]);

export const buildMetaDescriptionForCategory = (categoryName: string, desc?: string) => {
  const own = desc && desc.trim().length > 40 ? stripHtml(desc) : "";
  return fitDescription(own || `Shop certified ${categoryName.toLowerCase()} at ${SITE.name}.`, CATEGORY_FILLER);
};

export const buildMetaTitleForProduct = (productName: string, categoryName?: string) =>
  fitTitle(categoryName ? [`${productName} – ${categoryName}`, productName] : [productName]);

export const buildMetaDescriptionForProduct = (productName: string, categoryName?: string, descriptionHtml?: string) => {
  const text = stripHtml(descriptionHtml || "");
  const categoryText = categoryName ? ` in ${categoryName}` : "";
  return fitDescription(
    text.length > 60 ? text : `Discover ${productName}${categoryText} at ${SITE.name}.`,
    PRODUCT_FILLER,
  );
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

/** Returns value only if it's long enough to be a real meta title/description, otherwise '' */
export const sanitizeMetaField = (value: string | undefined | null, minLength = 15): string => {
  if (!value) return '';
  const trimmed = value.trim();
  return trimmed.length >= minLength ? trimmed : '';
};

export const buildMetaTitleForBlog = (title: string) => {
  return title;
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
