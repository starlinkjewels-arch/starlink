// Shared build-time SEO data: fetches the catalogue from Firestore and describes every public page
// (title, description, canonical, structured data and crawlable body HTML).
// Used by scripts/prerender.mjs (static HTML per route) and scripts/generate-sitemap.mjs.
//
// Keep slugify / paths / meta builders in sync with src/lib/urls.ts and src/lib/seo.ts.

import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import { readFileSync } from "node:fs";

// Design-tool landing page copy, shared with src/pages/DesignToolPage.tsx.
const DESIGN_TOOLS = JSON.parse(readFileSync(new URL("../src/content/designTools.json", import.meta.url), "utf8"));
const PRIVACY = JSON.parse(readFileSync(new URL("../src/content/privacyPolicy.json", import.meta.url), "utf8"));
const POLICIES = JSON.parse(readFileSync(new URL("../src/content/policies.json", import.meta.url), "utf8"));
const RING_GUIDE = JSON.parse(readFileSync(new URL("../src/content/ringSizeGuide.json", import.meta.url), "utf8"));

// Mirrors src/lib/ringSizes.ts.
const UK_LETTERS = ["F½", "G½", "H½", "I½", "J½", "K½", "L½", "M½", "N½", "O½", "P½", "Q½", "R½", "S½", "T½", "U½", "V½", "W½", "X½", "Y½", "Z½"];
const RING_SIZES = UK_LETTERS.map((uk, i) => {
  const us = 3 + i * 0.5;
  const c = 2.55 * us + 36.5;
  return { us, uk, eu: Math.round(c), india: Math.max(1, Math.round(c - 40)), diameter: (0.8128 * us + 11.63).toFixed(1), circumference: c.toFixed(1) };
});

const firebaseConfig = {
  apiKey: "AIzaSyBse5vfsARbl8k6ub9Mir6qs-CsPdaNuGU",
  authDomain: "starlinkjewels109.firebaseapp.com",
  projectId: "starlinkjewels109",
  storageBucket: "starlinkjewels109.firebasestorage.app",
  messagingSenderId: "192385163202",
  appId: "1:192385163202:web:6499e21aa7c34cd9e7c05b",
};

export const SITE_URL = "https://starlinkjewels.com";
export const SITE_NAME = "Starlink Jewels";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/icon.png`;

// ── Data ──────────────────────────────────────────────────────────────────

export const fetchCatalog = async () => {
  const db = getFirestore(initializeApp(firebaseConfig));
  const read = async (name) => {
    const snap = await getDocs(collection(db, name));
    return snap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  };
  const [categories, products, blogs, buyingGuides, reviews, banners, testimonials] = await Promise.all([
    read("categories"),
    read("products"),
    read("blogs"),
    read("buying-guides"),
    getDocs(query(collection(db, "reviews"), where("status", "==", "approved")))
      .then((snap) => snap.docs.map((d) => ({ ...d.data(), id: d.id })))
      .catch(() => []),
    // Optional: only used to preload the homepage hero. A failure here must not
    // cost the whole pre-render, so it degrades to "no preload".
    read("banners").catch(() => []),
    // Optional too: the homepage reviews section.
    read("testimonials").catch(() => []),
  ]);
  return {
    // Same ordering as getBanners() in src/lib/storage.ts, so banners[0] is the slide
    // BannerCarousel actually shows first.
    banners: banners.sort((a, b) => (a.priority || 99) - (b.priority || 99)),
    categories: categories.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999)),
    products,
    blogs: blogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    buyingGuides: buyingGuides.filter((g) => g.published && g.slug).sort((a, b) => (a.order || 0) - (b.order || 0)),
    reviews,
    testimonials,
  };
};

// ── Image CDN (mirror src/lib/imageUrl.ts — byte-identical) ─────────────────
//
// The pre-rendered HTML and the live app must request the *same* image URLs. When they
// did not, every image in the static body was fetched once raw from Firebase while the
// page parsed, then fetched again via the CDN once React rendered: measured on a phone,
// each banner downloaded twice. A browser only reuses a response (or a preload) when the
// URL matches character for character, so parameter names, order and defaults below
// follow cdnImg() exactly. Change one, change both.

const WSRV = "https://wsrv.nl/";
const isFirebaseUrl = (src) =>
  typeof src === "string" && (src.includes("firebasestorage.googleapis.com") || src.includes("storage.googleapis.com"));

export const cdnImg = (src, opts = {}) => {
  if (!src || !isFirebaseUrl(src)) return src;
  const { width = 800, height, quality = 82, fit = "cover" } = opts;
  const p = new URLSearchParams();
  p.set("url", src);
  p.set("output", "webp");
  p.set("q", String(quality));
  p.set("fit", fit);
  p.set("w", String(width));
  if (height) p.set("h", String(height));
  return `${WSRV}?${p.toString()}`;
};

export const HERO_WIDTHS = [480, 768, 1024, 1440];
export const HERO_SIZES = "(min-width: 1024px) 50vw, 100vw";
export const HERO_QUALITY = 80;
export const cdnSrcSet = (src, widths = HERO_WIDTHS, quality = HERO_QUALITY) =>
  !src || !isFirebaseUrl(src) ? undefined : widths.map((w) => `${cdnImg(src, { width: w, quality })} ${w}w`).join(", ");

// The exact presets the components request (ProductCard / ProductGallery).
export const CARD_CDN = { width: 600, height: 600, quality: 80 };
export const SLIDE_CDN = { width: 1200, height: 1200, quality: 85 };

// ── Diamond shapes (mirror src/lib/productAttributes.ts + src/lib/subcollections.ts) ──
//
// Which products count as "oval", etc. This must agree with the live app exactly, or a
// pre-rendered sub-collection lists different products to crawlers than to users.
// Verified by running both against every product in the catalogue — 192/192 identical —
// after fixing the app's stripHtml, which glued block elements together ("Princess
// CutMetal") and so missed a genuinely princess-cut piece.

export const DIAMOND_SHAPES = ["Round", "Oval", "Emerald", "Pear", "Marquise", "Cushion", "Princess", "Radiant", "Heart", "Asscher"];

const detectShapes = (name, description) => {
  const found = new Set();
  for (const shape of DIAMOND_SHAPES) {
    const w = shape.toLowerCase();
    const inName = new RegExp(`\\b${w}\\b`, "i").test(name) && !(shape === "Heart" && /\bheart(s)?\s+(pendant|locket)\b/i.test(name) && !/diamond/i.test(name));
    const inText = new RegExp(`\\b${w}[- ]?(cut|shape|shaped|brilliant|diamonds?|lab[- ]grown)\\b`, "i").test(description);
    if (inName || inText) found.add(shape);
  }
  if (found.has("Emerald") && /\bemeralds?\b(?![- ]?(cut|shape))/i.test(name) && !/emerald[- ]?(cut|shape)/i.test(description + " " + name)) found.delete("Emerald");
  return DIAMOND_SHAPES.filter((s) => found.has(s));
};

/** Shapes a product is listed under. An admin-set value always wins, as in the app. */
export const shapesOf = (p) =>
  Array.isArray(p.shapes) && p.shapes.length
    ? p.shapes.filter((s) => DIAMOND_SHAPES.includes(s))
    : detectShapes(p.name || "", stripHtml(p.description || ""));

// A shape sub-collection is only built where it is a real page rather than a filter
// state dressed up as one: enough pieces to browse, in a jewellery-type collection.
// Scaled thin pages are a Google spam policy, so the bar is deliberately conservative.
export const SUBCOLLECTION_MIN = 6;
// Collections that are not a jewellery type, so "oval <collection>" is not something
// anyone searches for.
export const SUBCOLLECTION_EXCLUDE = new Set(["custom-jewelry", "cuban-collection", "ready-to-ship"]);

// One factual line per cut — gemology, not marketing, so it is true for every piece.
export const SHAPE_INFO = {
  Round: "The round brilliant is cut with 57 or 58 facets to return as much light as possible. It is the most popular diamond shape and the classic choice for an engagement ring.",
  Oval: "An oval is an elongated brilliant cut. It keeps the sparkle of a round, looks larger than a round of the same carat weight, and lengthens the look of the hand.",
  Pear: "A pear, or teardrop, joins a rounded end to a single point. It is a brilliant cut with an elegant, elongated outline.",
  Marquise: "A marquise is a boat-shaped brilliant with two pointed ends. For its carat weight it has one of the largest face-up areas of any shape.",
  Emerald: "An emerald cut is a rectangular step cut. Its long, open facets give a hall-of-mirrors effect rather than sparkle, so it rewards high clarity.",
  Heart: "A heart is a brilliant cut with a cleft at the top and a point at the base.",
  Princess: "A princess is a square brilliant with crisp, pointed corners. It pairs a modern outline with strong sparkle.",
  Cushion: "A cushion is a square or rectangular cut with softly rounded corners and larger facets, with a vintage feel.",
  Radiant: "A radiant has the trimmed-corner outline of an emerald cut with the brilliance of a round.",
  Asscher: "An Asscher is a square step cut with cropped corners and a layered, windmill-like pattern of facets.",
};

export const shapeSlug = (shape) => shape.toLowerCase();

// ── URL helpers (mirror src/lib/urls.ts) ───────────────────────────────────

export const slugify = (value) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");

export const productPath = (p) => {
  const slug = slugify(p.name);
  return `/product/${slug ? `${slug}-` : ""}${p.id}`;
};
export const categoryPath = (c) => `/category/${slugify(c.name) || c.id}`;

// ── Text helpers ──────────────────────────────────────────────────────────

const ENTITIES = { "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&rsquo;": "’", "&lsquo;": "‘", "&ldquo;": "“", "&rdquo;": "”", "&mdash;": "—", "&ndash;": "–" };

export const stripHtml = (html) =>
  String(html || "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6])>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? " ")
    .replace(/\s+/g, " ")
    .trim();

// Bullets and emoji pasted into product text read badly in search snippets (mirrors src/lib/seo.ts).
const SNIPPET_NOISE = /[●•▪◆◇■□✓✔✨🌀-🫿]/gu;

export const truncate = (raw, max = 160) => {
  const text = String(raw).replace(SNIPPET_NOISE, " ").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 60 ? lastSpace : max).trim()}...`;
};

export const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Keeps article structure (headings, paragraphs, lists, links, images) but drops anything executable. */
// The page title is the one <h1>. Editors use H1 for section headings inside articles —
// measured, up to 20 per page — so any H1 in CMS content is rendered as an H2. Mirrors
// DEMOTE_H1 in src/components/site/RichText.tsx; the two must agree.
const DEMOTE_H1 = /<(\/?)h1(\b[^>]*)>/gi;

export const safeArticleHtml = (html) =>
  String(html || "")
    .replace(/<(script|style|iframe|object|embed|form|noscript)[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|iframe|object|embed|link|meta)[^>]*\/?>/gi, "")
    .replace(/\s(on\w+|style|class|id|data-[\w-]+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"')
    .replace(DEMOTE_H1, "<$1h2$2>");

const meaningful = (value, min = 15) => {
  const v = String(value || "").trim();
  return v.length >= min ? v : "";
};

// Append the brand only when it fits the 60-char budget. A title already at the
// limit should not be pushed over it by the suffix, and an editor-written title is
// never truncated here - Google truncates visually, and an ellipsis looks broken.
const fullTitle = (title) => {
  if (!title || title.includes(SITE_NAME)) return title;
  const full = `${title}${BRAND_SUFFIX}`;
  return full.length <= MAX_TITLE ? full : title;
};

// Meta builders (mirror src/lib/seo.ts — keep the two in sync)
//
// SERP budgets: Google truncates titles near 60 chars and descriptions near 155.
const MAX_TITLE = 60;
const DESC_MIN = 140;
const DESC_MAX = 155;
const BRAND_SUFFIX = ` | ${SITE_NAME}`;

/** Richest title variant that fits MAX_TITLE including the brand. Longest first. */
const fitTitle = (variants) => {
  for (const v of variants) {
    const full = `${v}${BRAND_SUFFIX}`;
    if (full.length <= MAX_TITLE) return full;
  }
  // Nothing fits with the brand: keep the full name and drop the suffix rather
  // than ellipsizing a real product or article name.
  return variants[variants.length - 1];
};

const clampWords = (text, max) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
};

/** Keeps a description inside 140-155: pads a short one, word-trims a long one. */
const fitDescription = (primary, filler) => {
  const base = String(primary || "").trim().replace(/\s+/g, " ");
  if (base.length >= DESC_MIN) return clampWords(base, DESC_MAX);
  return clampWords(`${base.replace(/[.\s]+$/, "")}. ${filler}`.trim(), DESC_MAX);
};

const CATEGORY_FILLER = "Certified lab-grown & natural diamonds, handcrafted in Surat, with free insured worldwide delivery.";
const PRODUCT_FILLER = "Certified diamonds, made to order in Surat, with free insured worldwide delivery.";

export const categoryTitle = (name) =>
  fitTitle([
    `Buy ${name} Online – Lab-Grown & Natural Diamonds`,
    `${name} – Lab-Grown & Natural Diamonds`,
    `${name} – Certified Diamond Jewelry`,
    `Buy ${name} Online`,
    name,
  ]);

export const categoryDescription = (name, desc) => {
  const own = desc && desc.trim().length > 40 ? stripHtml(desc) : "";
  return fitDescription(own || `Shop certified ${name.toLowerCase()} at ${SITE_NAME}.`, CATEGORY_FILLER);
};

export const productTitle = (name, categoryName) =>
  fitTitle(categoryName ? [`${name} – ${categoryName}`, name] : [name]);

export const productDescription = (name, categoryName, desc) => {
  const text = stripHtml(desc);
  return fitDescription(
    text.length > 60 ? text : `Discover ${name}${categoryName ? ` in ${categoryName}` : ""} at ${SITE_NAME}.`,
    PRODUCT_FILLER,
  );
};

const imagesOf = (p) => (Array.isArray(p.images) && p.images.length ? p.images : [p.image]).filter((u) => typeof u === "string" && u.startsWith("http") && !/\.(mp4|webm|mov)(\?|$)/i.test(u));
const categoryIdsOf = (p) => (Array.isArray(p.categoryIds) && p.categoryIds.length ? p.categoryIds : p.categoryId ? [p.categoryId] : []);
const createdAt = (p) => {
  const v = p.createdAt;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Date.parse(v) || Number(v) || 0;
  if (v && typeof v.seconds === "number") return v.seconds * 1000;
  return Number(p.id) || 0;
};
const isoDate = (ms) => (ms ? new Date(ms).toISOString().split("T")[0] : undefined);

const breadcrumbLd = (items) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((b, i) => ({ "@type": "ListItem", position: i + 1, name: b.name, item: b.url })),
});

// ── Crawlable body HTML ───────────────────────────────────────────────────

const pageShell = ({ categories, crumbs, body }) => `
<div class="prerender">
  <header class="pr-header">
    <a href="/" class="pr-logo">${esc(SITE_NAME)}</a>
    <nav aria-label="Collections">${categories.map((c) => `<a href="${categoryPath(c)}">${esc(c.name)}</a>`).join("")}<a href="/buying-guide">Diamond Guide</a><a href="/blog">Journal</a></nav>
  </header>
  ${crumbs && crumbs.length > 1 ? `<nav aria-label="Breadcrumb" class="pr-crumbs">${crumbs.map((c, i) => (i < crumbs.length - 1 ? `<a href="${c.url.replace(SITE_URL, "") || "/"}">${esc(c.name)}</a> › ` : `<span>${esc(c.name)}</span>`)).join("")}</nav>` : ""}
  <main>${body}</main>
  <footer class="pr-footer">
    <p>${esc(SITE_NAME)} — certified lab-grown and natural diamond jewelry, handcrafted in Surat, India. Insured worldwide delivery.</p>
    <nav><a href="/shipping-policy">Shipping</a><a href="/returns-policy">Returns</a><a href="/warranty">Warranty</a><a href="/ring-size-guide">Ring size guide</a><a href="/terms-and-conditions">Terms</a><a href="/privacy-policy">Privacy &amp; cookie policy</a><a href="/ring-builder">3D Ring Builder</a><a href="/3d-jewelry-viewer">3D Jewelry Viewer</a><a href="/about">About</a><a href="/contact">Contact</a><a href="/gallery">Gallery</a><a href="/usa">USA</a><a href="/canada">Canada</a><a href="/australia">Australia</a><a href="/germany">Germany</a></nav>
  </footer>
</div>`;

const productList = (products, categoriesById) =>
  `<ul class="pr-grid">${products
    .map((p) => {
      const img = imagesOf(p)[0];
      const cat = categoriesById.get(categoryIdsOf(p)[0]);
      return `<li><a href="${productPath(p)}">${img ? `<img src="${esc(cdnImg(img, CARD_CDN))}" alt="${esc(p.name)}" loading="lazy" width="300" height="300">` : ""}<span>${esc(p.name)}</span></a>${cat ? `<small>${esc(cat.name)}</small>` : ""}<small>Price on request</small></li>`;
    })
    .join("")}</ul>`;

// ── Routes ────────────────────────────────────────────────────────────────

/**
 * Every public, indexable page. Each route:
 * { path, title, description, ogImage, ogType, jsonLd: object[], body, lastmod, changefreq, priority, images: [{loc,title}] }
 */
export const buildRoutes = (data) => {
  const { categories, products, blogs, buyingGuides, reviews = [], testimonials = [] } = data;
  const categoriesById = new Map(categories.map((c) => [c.id, c]));
  const newest = [...products].sort((a, b) => createdAt(b) - createdAt(a));
  const productsIn = (id) => newest.filter((p) => categoryIdsOf(p).includes(id));
  const home = { name: "Home", url: SITE_URL };
  const routes = [];
  const shell = (crumbs, body) => pageShell({ categories, crumbs, body });
  const categoryLinks = `<ul class="pr-links">${categories.map((c) => `<li><a href="${categoryPath(c)}">${esc(c.name)}</a>${c.description ? ` — ${esc(truncate(stripHtml(c.description), 120))}` : ""}</li>`).join("")}</ul>`;

  // The homepage hero is the LCP element. Preloading it from the static <head> starts
  // the fetch while the HTML is still parsing — before React, before the Firestore read
  // that tells the app which banners exist. Only the first image banner: preloading
  // every slide would split the bandwidth the first one needs. The srcset/sizes mirror
  // BannerCarousel exactly, so the <img> it renders reuses this response.
  const hero = (data.banners || []).find((b) => b && b.image && b.mediaType !== "video");
  const heroPreload =
    hero && cdnSrcSet(hero.image)
      ? [{ href: cdnImg(hero.image, { width: 1024, quality: HERO_QUALITY }), srcset: cdnSrcSet(hero.image), sizes: HERO_SIZES }]
      : [];

  // Same reviews, in the same words, as the homepage carousel (src/components/site/TestimonialCarousel.tsx).
  // No Review/AggregateRating markup: reviews a business publishes about itself are not
  // eligible for review rich results, and marking them up anyway risks a manual action.
  // Mirrors REVIEWS_INTRO in src/lib/testimonials.ts and the rating line in src/pages/Index.tsx.
  const reviewsIntro =
    "What clients say about Starlink Jewels, in their own words. We design custom engagement rings, wedding bands and fine diamond jewelry in-house, approve every design in CAD before crafting, and have master artisans in Surat set each piece with IGI or GIA certified lab-grown and natural diamonds, then ship it insured worldwide.";
  const reviewCountries = new Set(
    testimonials.map((t) => String(t.name || "").split(/\s+[–—-]\s+/).slice(1).join(", ").split(",").pop()?.trim()).filter(Boolean)
  );
  const reviewAvg = testimonials.reduce((sum, t) => sum + (Number(t.rating) || 0), 0) / (testimonials.length || 1);
  const reviewSummary = `${reviewsIntro} Rated ${reviewAvg.toFixed(1)} out of 5${reviewCountries.size > 1 ? ` by clients in ${reviewCountries.size} countries` : ""}.`;
  const testimonialsHtml = testimonials.length
    ? `<h2>Worn and loved worldwide</h2><p>${esc(reviewSummary)}</p>${testimonials
        .map((t) => `<figure><blockquote>${esc(String(t.text || "").trim().replace(/^["“”'‘’]+|["“”'‘’]+$/g, ""))}</blockquote><figcaption>${esc(t.name)} — ${Number(t.rating) || 0} out of 5</figcaption></figure>`)
        .join("")}`
    : "";

  // Home
  routes.push({
    path: "/",
    preload: heroPreload,
    // 42 chars, so the brand still fits inside the 60-char budget — the homepage is
    // the one title that should never lose it.
    title: "Lab-Grown & Natural Diamond Jewelry",
    description:
      "Shop certified lab-grown and natural diamond jewelry at Starlink Jewels. Explore IGI & GIA certified engagement rings, wedding bands, necklaces, earrings & bracelets, handcrafted in Surat with insured worldwide shipping.",
    changefreq: "daily",
    priority: "1.0",
    body: shell(null, `<h1>Fine diamonds, made modern.</h1>
<p>Certified lab-grown and natural diamond jewelry, handcrafted in Surat — the diamond capital of the world — and delivered insured to clients in over 30 countries.</p>
<h2>Shop by collection</h2>${categoryLinks}
<h2>New arrivals</h2>${productList(newest.slice(0, 12), categoriesById)}
<h2>Design your own ring</h2><p>Build a custom engagement ring with our <a href="/ring-builder">3D Ring Builder</a> and inspect every angle in the <a href="/3d-jewelry-viewer">3D jewelry viewer</a>.</p>
${testimonialsHtml}
${blogs.length ? `<h2>From the journal</h2><ul class="pr-links">${blogs.slice(0, 3).map((b) => `<li><a href="/blog/${esc(b.id)}">${esc(b.title)}</a></li>`).join("")}</ul>` : ""}`),
  });

  // Static pages
  const staticPages = [
    ["/categories", "Jewelry Collections - Diamond Rings, Necklaces, Earrings & Bracelets", "Explore our curated jewelry collections. Shop certified lab-grown and natural diamond rings, necklaces, earrings and bracelets, handcrafted in Surat with insured worldwide shipping.", "Our collections", categoryLinks, "0.9", "weekly"],
    ["/gallery", "Jewelry Gallery - Diamond & Gold Collection Photos", "Browse our gallery of certified diamond jewelry. View engagement rings, necklaces, earrings and bracelets handcrafted by Starlink Jewels.", "From our atelier", "<p>A look at pieces we've designed and handcrafted. See something you love? We can create it for you.</p>", "0.7", "weekly"],
    ["/blog", "Jewelry Journal - Diamond Guides, Engagement Ring Tips & Trends", "Expert jewelry insights, diamond buying guides, engagement ring tips, gemstone education, and the latest fine jewelry trends from Starlink Jewels.", "Guides, stories & trends", `<ul class="pr-links">${blogs.map((b) => `<li><a href="/blog/${esc(b.id)}">${esc(b.title)}</a> — ${esc(truncate(stripHtml(b.content), 140))}</li>`).join("")}</ul>`, "0.7", "weekly"],
    ["/about", "About Us - Diamond Jewelry Manufacturer Since 2011", "Discover Starlink Jewels: crafting certified lab-grown and natural diamond jewelry in Surat since 2011. Master craftsmanship, ethical sourcing and made-to-order pieces for clients worldwide.", "Crafting dreams into reality", "<p>Starlink Jewels is a modern fine jewelry manufacturer and supplier specialising in lab-grown and natural diamond jewelry. Every piece is designed in-house, set by master artisans in Surat, certified by IGI or GIA and shipped insured worldwide.</p>", "0.6", "monthly"],
    ["/contact", "Contact Us - Diamond Jewelry Enquiries & Custom Orders", "Contact Starlink Jewels for certified diamond jewelry, custom designs, engagement rings and wholesale orders. Chat with our experts on WhatsApp.", "We'd love to hear from you", "<p>Questions about a piece, a custom design or wholesale? Our team replies personally on WhatsApp, phone or email.</p>", "0.6", "monthly"],
  ];
  for (const [path, title, description, h1, content, priority, changefreq] of staticPages) {
    const crumbs = [home, { name: h1, url: `${SITE_URL}${path}` }];
    routes.push({ path, title, description, priority, changefreq, jsonLd: [breadcrumbLd(crumbs)], body: shell(crumbs, `<h1>${esc(h1)}</h1>${content}`) });
  }

  const countries = [
    ["usa", "United States", "Diamond jewelry delivered across the USA", "Shop certified lab-grown and natural diamond jewelry from Starlink Jewels with secure delivery to the United States. Custom designs, premium craftsmanship and WhatsApp support."],
    ["canada", "Canada", "Luxury jewelry delivered across Canada", "Discover premium diamond and gold jewelry with delivery to Canada. Certified lab-grown and natural diamonds with custom design options."],
    ["australia", "Australia", "Premium diamond jewelry for Australia", "Shop certified diamond jewelry and custom designs delivered to Australia. Lab-grown and natural diamonds with expert craftsmanship."],
    ["germany", "Germany", "Certified diamond jewelry delivered to Germany", "Explore Starlink Jewels diamond collections with secure delivery to Germany. Lab-grown and natural diamonds, custom jewelry and expert support."],
  ];
  // Country pages are noindex. Measured on the live site, /usa and /canada share 97% of
  // their vocabulary and 12 of 13 long sentences word for word: four templated pages
  // that differ by a headline and one shipping line, which is what Google treats as
  // doorway pages. They stay live for visitors, links and ads, and stay out of the
  // index and the sitemap. To make them indexable again, give each one real
  // country-specific substance (duties, delivery times, local certification) and drop
  // the flag — do not just remove the flag.
  for (const [slug, name, headline, description] of countries) {
    const crumbs = [home, { name, url: `${SITE_URL}/${slug}` }];
    routes.push({ path: `/${slug}`, noindex: true, title: `Diamond Jewelry Shipping to ${name}`, description, priority: "0.6", changefreq: "monthly", jsonLd: [breadcrumbLd(crumbs)], body: shell(crumbs, `<h1>${esc(headline)}</h1><p>${esc(description)}</p>${categoryLinks}`) });
  }

  // Privacy & cookie policy
  {
    const url = `${SITE_URL}${PRIVACY.path}`;
    const crumbs = [home, { name: "Privacy & Cookie Policy", url }];
    routes.push({
      path: PRIVACY.path,
      title: PRIVACY.metaTitle,
      description: PRIVACY.metaDescription,
      priority: "0.3",
      changefreq: "yearly",
      jsonLd: [breadcrumbLd(crumbs)],
      body: shell(
        crumbs,
        `<article><h1>Privacy &amp; cookie policy</h1><p>Last updated: ${esc(PRIVACY.updated)}</p><p>${esc(PRIVACY.intro)}</p>${PRIVACY.sections
          .map(
            (s) =>
              `<h2 id="${esc(s.id)}">${esc(s.title)}</h2>${(s.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join("")}${
                s.list ? `<ul>${s.list.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : ""
              }${
                s.cookies
                  ? `<table><tr><th>Name</th><th>Type</th><th>Purpose</th><th>Duration</th></tr>${s.cookies
                      .map((c) => `<tr><td>${esc(c.name)}</td><td>${esc(c.type)}</td><td>${esc(c.purpose)}</td><td>${esc(c.duration)}</td></tr>`)
                      .join("")}</table>`
                  : ""
              }`
          )
          .join("")}</article>`
      ),
    });
  }

  // Customer-care policies
  for (const pol of Object.values(POLICIES)) {
    const url = `${SITE_URL}${pol.path}`;
    const crumbs = [home, { name: pol.title, url }];
    routes.push({
      path: pol.path,
      title: pol.metaTitle,
      description: pol.metaDescription,
      priority: "0.4",
      changefreq: "yearly",
      jsonLd: [breadcrumbLd(crumbs)],
      body: shell(
        crumbs,
        `<article><h1>${esc(pol.title)}</h1><p>${esc(pol.intro)}</p>${pol.sections
          .map((sec) => `<h2>${esc(sec.title)}</h2>${(sec.paragraphs || []).map((x) => `<p>${esc(x)}</p>`).join("")}${sec.list ? `<ul>${sec.list.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}`)
          .join("")}</article>`
      ),
    });
  }

  // Ring size guide
  {
    const url = `${SITE_URL}${RING_GUIDE.path}`;
    const crumbs = [home, { name: "Ring Size Guide", url }];
    routes.push({
      path: RING_GUIDE.path,
      title: RING_GUIDE.metaTitle,
      description: RING_GUIDE.metaDescription,
      priority: "0.8",
      changefreq: "yearly",
      jsonLd: [
        breadcrumbLd(crumbs),
        { "@type": "FAQPage", mainEntity: RING_GUIDE.faq.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
      ],
      body: shell(
        crumbs,
        `<article><h1>${esc(RING_GUIDE.title)}</h1><p>${esc(RING_GUIDE.intro)}</p>
<h2>International ring size chart</h2><table><tr><th>US / Canada</th><th>UK / Australia</th><th>EU / ISO</th><th>India / Japan</th><th>Diameter (mm)</th><th>Circumference (mm)</th></tr>${RING_SIZES.map((r) => `<tr><td>${r.us}</td><td>${esc(r.uk)}</td><td>${r.eu}</td><td>${r.india}</td><td>${r.diameter}</td><td>${r.circumference}</td></tr>`).join("")}</table>
${RING_GUIDE.methods.map((m) => `<h2>${esc(m.title)}</h2><ol>${m.steps.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>`).join("")}
<h2>Tips for a perfect fit</h2><ul>${RING_GUIDE.tips.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
<h2>Frequently asked questions</h2>${RING_GUIDE.faq.map((f) => `<h3>${esc(f.question)}</h3><p>${esc(f.answer)}</p>`).join("")}</article>`
      ),
    });
  }

  // Design-tool landing pages (ring builder, 3D viewer)
  for (const [key, t] of Object.entries(DESIGN_TOOLS)) {
    const url = `${SITE_URL}${t.path}`;
    const crumbs = [home, { name: t.breadcrumb, url }];
    const other = DESIGN_TOOLS[key === "ringBuilder" ? "viewer" : "ringBuilder"];
    routes.push({
      path: t.path,
      title: t.metaTitle,
      description: t.metaDescription,
      priority: "0.9",
      changefreq: "monthly",
      jsonLd: [
        {
          "@type": "WebApplication",
          "@id": `${t.toolUrl}#app`,
          name: t.toolName,
          url: t.toolUrl,
          description: t.metaDescription,
          applicationCategory: "DesignApplication",
          operatingSystem: "Any (web browser)",
          browserRequirements: "Requires JavaScript and WebGL",
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          featureList: t.optionGroups.map((g) => `${g.label}: ${g.items.join(", ")}`),
          publisher: { "@id": `${SITE_URL}/#jewelry-store` },
          mainEntityOfPage: url,
        },
        { "@type": "FAQPage", mainEntity: t.faq.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
        breadcrumbLd(crumbs),
      ],
      body: shell(
        crumbs,
        `<article>
<p>${esc(t.eyebrow)}</p>
<h1>${esc(t.title)} ${esc(t.accent)}</h1>
<p>${esc(t.intro)}</p>
<p><a href="${esc(t.toolUrl)}">${esc(t.cta)}</a> · ${t.trust.map(esc).join(" · ")}</p>
<h2>${esc(t.stepsTitle)}</h2>
<ol>${t.steps.map((st) => `<li><strong>${esc(st.title)}</strong> — ${esc(st.text)}</li>`).join("")}</ol>
<h2>${esc(t.optionsTitle)}</h2>
<dl>${t.optionGroups.map((g) => `<dt>${esc(g.label)}</dt><dd>${g.items.map(esc).join(", ")}</dd>`).join("")}</dl>
<h2>${esc(t.featuresTitle)}</h2>
<ul>${t.features.map((f) => `<li><strong>${esc(f.title)}</strong> — ${esc(f.text)}</li>`).join("")}</ul>
<h2>Frequently asked questions</h2>
${t.faq.map((f) => `<h3>${esc(f.question)}</h3><p>${esc(f.answer)}</p>`).join("")}
<h2>${esc(t.finalTitle)}</h2>
<p>${esc(t.finalText)} <a href="${esc(t.toolUrl)}">${esc(t.cta)}</a> · <a href="${other.path}">${esc(other.breadcrumb)}</a></p>
</article>
<h2>Shop the collections</h2>${categoryLinks}`
      ),
    });
  }

  // Shape sub-collections that clear the bar (see SUBCOLLECTION_MIN), per collection.
  const subCollectionsOf = (c) => {
    if (SUBCOLLECTION_EXCLUDE.has(slugify(c.name))) return [];
    const items = productsIn(c.id);
    return DIAMOND_SHAPES.map((shape) => ({ shape, items: items.filter((p) => shapesOf(p).includes(shape)) })).filter(
      (s) => s.items.length >= SUBCOLLECTION_MIN,
    );
  };

  // Collections
  for (const c of categories) {
    const path = categoryPath(c);
    const url = `${SITE_URL}${path}`;
    const items = productsIn(c.id);
    const crumbs = [home, { name: "Collections", url: `${SITE_URL}/categories` }, { name: c.name, url }];
    // Real links to this collection's shape pages. Crawlers only follow hrefs, so without
    // these the sub-collections would be orphans that exist only in the sitemap.
    const shapes = subCollectionsOf(c);
    const shapeNav = shapes.length
      ? `<nav aria-label="Shop by shape"><p>Shop by shape: ${shapes
          .map((s) => `<a href="${path}/${shapeSlug(s.shape)}">${esc(s.shape)} (${s.items.length})</a>`)
          .join(" · ")}</p></nav>`
      : "";
    routes.push({
      path,
      title: meaningful(c.metaTitle) || categoryTitle(c.name),
      description: meaningful(c.metaDescription, 30) || categoryDescription(c.name, c.description),
      ogImage: c.image,
      priority: "0.85",
      changefreq: "weekly",
      lastmod: isoDate(Math.max(0, ...items.map(createdAt))),
      images: c.image ? [{ loc: c.image, title: `${c.name} - ${SITE_NAME}` }] : [],
      jsonLd: [
        {
          "@type": "CollectionPage",
          "@id": `${url}#collectionpage`,
          name: `${c.name} - ${SITE_NAME}`,
          url,
          description: stripHtml(c.description) || `Shop our ${c.name} collection`,
          isPartOf: { "@id": `${SITE_URL}/#website` },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: items.length,
            itemListElement: items.slice(0, 30).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}${productPath(p)}`, name: p.name })),
          },
        },
        breadcrumbLd(crumbs),
        ...(Array.isArray(c.seoFaq) && c.seoFaq.length
          ? [{ "@type": "FAQPage", mainEntity: c.seoFaq.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) }]
          : []),
      ],
      body: shell(crumbs, `<h1>${esc(c.name)} collection</h1>${c.description ? `<p>${esc(stripHtml(c.description))}</p>` : ""}<p>${items.length} ${items.length === 1 ? "piece" : "pieces"} · IGI &amp; GIA certified · Made to order</p>${shapeNav}${productList(items, categoriesById)}<h2>More collections</h2>${categoryLinks}`),
    });

    // Shape sub-collections, e.g. /category/rings/oval
    for (const { shape, items: shaped } of shapes) {
      const subPath = `${path}/${shapeSlug(shape)}`;
      const subUrl = `${SITE_URL}${subPath}`;
      const heading = `${shape} Diamond ${c.name}`;
      const subCrumbs = [...crumbs, { name: heading, url: subUrl }];
      const intro = SHAPE_INFO[shape];
      const siblings = shapes
        .filter((s) => s.shape !== shape)
        .map((s) => `<a href="${path}/${shapeSlug(s.shape)}">${esc(s.shape)}</a>`)
        .join(" · ");
      routes.push({
        path: subPath,
        title: fitTitle([`${heading} – Lab-Grown & Natural`, `${heading} – Certified`, heading]),
        description: fitDescription(
          `Shop ${shaped.length} ${shape.toLowerCase()} diamond ${c.name.toLowerCase()} at ${SITE_NAME}. ${intro}`,
          CATEGORY_FILLER,
        ),
        ogImage: imagesOf(shaped[0])[0] || c.image,
        priority: "0.75",
        changefreq: "weekly",
        lastmod: isoDate(Math.max(0, ...shaped.map(createdAt))),
        jsonLd: [
          {
            "@type": "CollectionPage",
            "@id": `${subUrl}#collectionpage`,
            name: `${heading} - ${SITE_NAME}`,
            url: subUrl,
            description: intro,
            isPartOf: { "@id": `${SITE_URL}/#website` },
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: shaped.length,
              itemListElement: shaped.slice(0, 30).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}${productPath(p)}`, name: p.name })),
            },
          },
          breadcrumbLd(subCrumbs),
        ],
        body: shell(
          subCrumbs,
          `<h1>${esc(heading)}</h1><p>${esc(intro)}</p><p>${shaped.length} ${shaped.length === 1 ? "piece" : "pieces"} · IGI &amp; GIA certified · Made to order</p>${productList(shaped, categoriesById)}` +
            `<p><a href="${path}">All ${esc(c.name.toLowerCase())}</a>${siblings ? ` · Other shapes: ${siblings}` : ""}</p>`,
        ),
      });
    }
  }

  // Products
  for (const p of products) {
    const path = productPath(p);
    const url = `${SITE_URL}${path}`;
    const cat = categoriesById.get(categoryIdsOf(p)[0]);
    const imgs = imagesOf(p);
    const desc = stripHtml(p.description);
    const crumbs = [home, { name: "Collections", url: `${SITE_URL}/categories` }, ...(cat ? [{ name: cat.name, url: `${SITE_URL}${categoryPath(cat)}` }] : []), { name: p.name, url }];
    const related = cat ? productsIn(cat.id).filter((x) => x.id !== p.id).slice(0, 8) : [];
    routes.push({
      path,
      title: meaningful(p.metaTitle) || productTitle(p.name, cat?.name),
      description: meaningful(p.metaDescription, 30) || productDescription(p.name, cat?.name, p.description),
      ogImage: imgs[0],
      ogType: "product",
      priority: "0.75",
      changefreq: "weekly",
      lastmod: isoDate(createdAt(p)),
      images: imgs.slice(0, 5).map((loc) => ({ loc, title: `${p.name} - ${SITE_NAME}` })),
      jsonLd: [
        {
          "@type": "Product",
          "@id": `${url}#product`,
          name: p.name,
          url,
          image: imgs.length ? imgs : undefined,
          description: desc || `${p.name} from ${SITE_NAME}`,
          sku: p.id,
          category: cat?.name,
          brand: { "@type": "Brand", name: SITE_NAME },
          manufacturer: { "@id": `${SITE_URL}/#jewelry-store` },
          ...(() => {
            const own = reviews.filter((r) => r.productId === p.id && typeof r.rating === "number");
            if (!own.length) return {};
            const avg = own.reduce((n, r) => n + r.rating, 0) / own.length;
            return {
              aggregateRating: { "@type": "AggregateRating", ratingValue: avg.toFixed(1), reviewCount: own.length, bestRating: 5, worstRating: 1 },
              review: own.slice(0, 5).map((r) => ({ "@type": "Review", reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 }, author: { "@type": "Person", name: r.name }, reviewBody: r.text, ...(r.title ? { name: r.title } : {}) })),
            };
          })(),
        },
        breadcrumbLd(crumbs),
      ],
      body: shell(
        crumbs,
        `<article><h1>${esc(p.name)}</h1>${cat ? `<p>${esc(cat.name)}</p>` : ""}<p><strong>Price on request</strong> · Made to order · Certified diamonds · Insured delivery</p>
${imgs.slice(0, 4).map((src, i) => `<img src="${esc(cdnImg(src, SLIDE_CDN))}" alt="${esc(`${p.name}${i ? ` – view ${i + 1}` : ""}`)}" width="600" height="600"${i ? ' loading="lazy"' : ""}>`).join("")}
${desc ? `<h2>Product details</h2><p>${esc(desc)}</p>` : ""}
<p>Enquire on WhatsApp for availability, customisation options and delivery details.</p></article>
${related.length ? `<h2>More from ${esc(cat.name)}</h2>${productList(related, categoriesById)}` : ""}`
      ),
    });
  }

  // Journal articles
  for (const b of blogs) {
    const path = `/blog/${b.id}`;
    const url = `${SITE_URL}${path}`;
    const crumbs = [home, { name: "Journal", url: `${SITE_URL}/blog` }, { name: b.title, url }];
    const description = meaningful(b.metaDescription, 30) || truncate(stripHtml(b.content), 165);
    routes.push({
      path,
      title: meaningful(b.metaTitle) || b.title,
      description,
      ogImage: b.image,
      ogType: "article",
      priority: "0.65",
      changefreq: "monthly",
      lastmod: isoDate(Date.parse(b.date)),
      images: b.image ? [{ loc: b.image, title: b.title }] : [],
      jsonLd: [
        {
          "@type": "BlogPosting",
          "@id": `${url}#blogpost`,
          headline: b.title,
          datePublished: b.date,
          dateModified: b.date,
          image: b.image,
          description,
          author: { "@type": "Organization", "@id": `${SITE_URL}/#jewelry-store`, name: SITE_NAME, url: SITE_URL },
          publisher: { "@type": "Organization", "@id": `${SITE_URL}/#jewelry-store`, name: SITE_NAME, logo: { "@type": "ImageObject", url: DEFAULT_OG_IMAGE } },
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
        },
        breadcrumbLd(crumbs),
      ],
      body: shell(crumbs, `<article><h1>${esc(b.title)}</h1><p><time datetime="${esc(b.date)}">${esc(b.date)}</time></p>${b.image ? `<img src="${esc(cdnImg(b.image, { width: 1600, quality: 82 }))}" alt="${esc(b.title)}">` : ""}${safeArticleHtml(b.content)}</article>`),
    });
  }

  // Buying guides
  if (buyingGuides.length) {
    const guideLinks = `<ul class="pr-links">${buyingGuides.map((g) => `<li><a href="/buying-guide/${esc(g.slug)}">${esc(g.title)}</a></li>`).join("")}</ul>`;
    const crumbsIndex = [home, { name: "Buying Guide", url: `${SITE_URL}/buying-guide` }];
    routes.push({
      path: "/buying-guide",
      title: "Jewelry Buying Guide – Diamonds, 4Cs, Settings & Certification",
      description: "Expert guides to help you choose lab-grown and natural diamond jewelry with confidence: the 4Cs, diamond shapes, settings, metals and GIA / IGI certification.",
      priority: "0.7",
      changefreq: "monthly",
      jsonLd: [breadcrumbLd(crumbsIndex)],
      body: shell(crumbsIndex, `<h1>Buy with confidence</h1><p>Everything you need to know about diamonds, settings and certification, explained simply.</p>${guideLinks}`),
    });
    for (const g of buyingGuides) {
      const path = `/buying-guide/${g.slug}`;
      const url = `${SITE_URL}${path}`;
      const crumbs = [...crumbsIndex, { name: g.title, url }];
      const description = meaningful(g.metaDescription, 30) || truncate(stripHtml(g.content), 160);
      routes.push({
        path,
        title: meaningful(g.metaTitle) || `${g.title} - Buying Guide`,
        description,
        ogImage: g.image,
        ogType: "article",
        priority: "0.6",
        changefreq: "monthly",
        images: g.image ? [{ loc: g.image, title: g.title }] : [],
        jsonLd: [
          { "@type": "Article", "@id": `${url}#article`, headline: g.title, image: g.image || undefined, description, mainEntityOfPage: url, author: { "@type": "Organization", name: SITE_NAME }, publisher: { "@type": "Organization", name: SITE_NAME } },
          breadcrumbLd(crumbs),
        ],
        body: shell(crumbs, `<article><h1>${esc(g.title)}</h1>${safeArticleHtml(g.content)}</article>${guideLinks}`),
      });
    }
  }

  // Final guard. Titles and descriptions can also come straight from the CMS
  // (metaTitle / metaDescription), which bypasses the builders above, so the SERP
  // budget is enforced once here for every route regardless of source.
  // Over-long descriptions are word-trimmed; titles are only ever left alone or
  // have the brand dropped, never ellipsized.
  return routes.map((r) => ({
    ...r,
    fullTitle: fullTitle(r.title),
    description: clampWords(String(r.description || "").trim().replace(/\s+/g, " "), DESC_MAX),
    url: `${SITE_URL}${r.path === "/" ? "" : r.path}`,
  }));
};

// ── Sitemap ───────────────────────────────────────────────────────────────

const xmlEsc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export const buildSitemapXml = (routes) => {
  const today = new Date().toISOString().split("T")[0];
  // A sitemap lists canonical, indexable URLs only. The filter lives here rather than
  // at a call site because two things build this file — the pre-render and the daily
  // sitemap workflow — and both must agree, or the workflow re-adds noindex pages.
  const entries = routes.filter((r) => !r.noindex).map((r) => {
    const images = (r.images || [])
      .filter((i) => i.loc)
      .map((i) => `\n    <image:image>\n      <image:loc>${xmlEsc(i.loc)}</image:loc>${i.title ? `\n      <image:title>${xmlEsc(i.title)}</image:title>` : ""}\n    </image:image>`)
      .join("");
    return `  <url>\n    <loc>${xmlEsc(r.url || SITE_URL)}</loc>\n    <lastmod>${r.lastmod || today}</lastmod>\n    <changefreq>${r.changefreq || "weekly"}</changefreq>\n    <priority>${r.priority || "0.6"}</priority>${images}\n  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${entries.join("\n")}\n</urlset>\n`;
};

export const buildSitemapIndexXml = () => {
  const today = new Date().toISOString().split("T")[0];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${SITE_URL}/sitemap.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n</sitemapindex>\n`;
};

// ── llms.txt (a plain-text map of the site for AI assistants and answer engines) ──

export const buildLlmsTxt = (data) => {
  const { categories, blogs, buyingGuides } = data;
  const lines = [
    `# ${SITE_NAME}`,
    "",
    "> Surat (India) based manufacturer of certified lab-grown and natural diamond jewelry — engagement rings, eternity bands, bracelets, earrings, pendants, necklaces and custom designs — made to order and shipped insured worldwide (USA, Canada, Australia, Germany, UK and more). Diamonds are IGI or GIA certified. Prices are quoted on request via WhatsApp.",
    "",
    "## Collections",
    ...categories.map((c) => `- [${c.name}](${SITE_URL}${categoryPath(c)})${c.description ? `: ${truncate(stripHtml(c.description), 140)}` : ""}`),
    "",
    "## Design tools",
    `- [3D Ring Builder](${SITE_URL}/ring-builder): free online tool to design a custom engagement ring in real-time 3D (9 diamond shapes, 0.50–3.00 ct, 6 band styles, pavé/prong/channel, halo options, 14K/18K white, yellow or rose gold); app at https://ringbuilder.starlinkjewels.com/`,
    `- [3D Jewelry Viewer](${SITE_URL}/3d-jewelry-viewer): real-time photorealistic jewelry rendering in the browser (360° turntable, gold/platinum/silver finishes, diamond refraction); app at https://360.starlinkjewels.com/`,
    "",
    ...(buyingGuides.length ? ["## Buying guides", ...buyingGuides.map((g) => `- [${g.title}](${SITE_URL}/buying-guide/${g.slug})`), ""] : []),
    ...(blogs.length ? ["## Journal", ...blogs.slice(0, 20).map((b) => `- [${b.title}](${SITE_URL}/blog/${b.id})`), ""] : []),
    "## Company",
    `- [About](${SITE_URL}/about): crafting fine jewelry since 2011, in-house CAD design, casting, setting and polishing`,
    `- [Contact](${SITE_URL}/contact): WhatsApp, phone and email; offices worldwide`,
    "",
  ];
  return lines.join("\n");
};
