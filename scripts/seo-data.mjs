// Shared build-time SEO data: fetches the catalogue from Firestore and describes every public page
// (title, description, canonical, structured data and crawlable body HTML).
// Used by scripts/prerender.mjs (static HTML per route) and scripts/generate-sitemap.mjs.
//
// Keep slugify / paths / meta builders in sync with src/lib/urls.ts and src/lib/seo.ts.

import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";

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
  const [categories, products, blogs, buyingGuides] = await Promise.all([
    read("categories"),
    read("products"),
    read("blogs"),
    read("buying-guides"),
  ]);
  return {
    categories: categories.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999)),
    products,
    blogs: blogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    buyingGuides: buyingGuides.filter((g) => g.published && g.slug).sort((a, b) => (a.order || 0) - (b.order || 0)),
  };
};

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
export const safeArticleHtml = (html) =>
  String(html || "")
    .replace(/<(script|style|iframe|object|embed|form|noscript)[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|iframe|object|embed|link|meta)[^>]*\/?>/gi, "")
    .replace(/\s(on\w+|style|class|id|data-[\w-]+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"');

const meaningful = (value, min = 15) => {
  const v = String(value || "").trim();
  return v.length >= min ? v : "";
};

const fullTitle = (title) => (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`);

// Meta builders (mirror src/lib/seo.ts)
export const categoryTitle = (name) => `Buy ${name} Online – Certified Lab-Grown & Natural Diamonds`;
export const categoryDescription = (name, desc) =>
  desc && desc.trim().length > 40
    ? truncate(stripHtml(desc), 165)
    : `Shop certified ${name.toLowerCase()} at ${SITE_NAME}. GIA & IGI certified lab-grown and natural diamonds, handcrafted in Surat, with free insured worldwide delivery to the USA, Canada, Australia and Germany.`;
export const productTitle = (name, categoryName) => (categoryName ? `${name} – ${categoryName}` : name);
export const productDescription = (name, categoryName, desc) => {
  const text = stripHtml(desc);
  if (text.length > 60) return truncate(text, 165);
  return `Discover ${name}${categoryName ? ` in ${categoryName}` : ""} at ${SITE_NAME}. Certified lab-grown and natural diamonds, made to order in Surat with insured worldwide delivery.`;
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
    <nav><a href="/about">About</a><a href="/contact">Contact</a><a href="/gallery">Gallery</a><a href="/usa">USA</a><a href="/canada">Canada</a><a href="/australia">Australia</a><a href="/germany">Germany</a></nav>
  </footer>
</div>`;

const productList = (products, categoriesById) =>
  `<ul class="pr-grid">${products
    .map((p) => {
      const img = imagesOf(p)[0];
      const cat = categoriesById.get(categoryIdsOf(p)[0]);
      return `<li><a href="${productPath(p)}">${img ? `<img src="${esc(img)}" alt="${esc(p.name)}" loading="lazy" width="300" height="300">` : ""}<span>${esc(p.name)}</span></a>${cat ? `<small>${esc(cat.name)}</small>` : ""}<small>Price on request</small></li>`;
    })
    .join("")}</ul>`;

// ── Routes ────────────────────────────────────────────────────────────────

/**
 * Every public, indexable page. Each route:
 * { path, title, description, ogImage, ogType, jsonLd: object[], body, lastmod, changefreq, priority, images: [{loc,title}] }
 */
export const buildRoutes = (data) => {
  const { categories, products, blogs, buyingGuides } = data;
  const categoriesById = new Map(categories.map((c) => [c.id, c]));
  const newest = [...products].sort((a, b) => createdAt(b) - createdAt(a));
  const productsIn = (id) => newest.filter((p) => categoryIdsOf(p).includes(id));
  const home = { name: "Home", url: SITE_URL };
  const routes = [];
  const shell = (crumbs, body) => pageShell({ categories, crumbs, body });
  const categoryLinks = `<ul class="pr-links">${categories.map((c) => `<li><a href="${categoryPath(c)}">${esc(c.name)}</a>${c.description ? ` — ${esc(truncate(stripHtml(c.description), 120))}` : ""}</li>`).join("")}</ul>`;

  // Home
  routes.push({
    path: "/",
    title: "Premium Diamond & Gold Jewelry | Lab Grown & Natural Diamonds",
    description:
      "Shop certified lab-grown and natural diamond jewelry at Starlink Jewels. Explore IGI & GIA certified engagement rings, wedding bands, necklaces, earrings & bracelets, handcrafted in Surat with insured worldwide shipping.",
    changefreq: "daily",
    priority: "1.0",
    body: shell(null, `<h1>Fine diamonds, made modern.</h1>
<p>Certified lab-grown and natural diamond jewelry, handcrafted in Surat — the diamond capital of the world — and delivered insured to clients in over 30 countries.</p>
<h2>Shop by collection</h2>${categoryLinks}
<h2>New arrivals</h2>${productList(newest.slice(0, 12), categoriesById)}
<h2>Design your own ring</h2><p>Build a custom engagement ring with our <a href="https://ringbuilder.starlinkjewels.com/">Ring Builder</a> and inspect every angle in the <a href="https://360.starlinkjewels.com/">360° viewer</a>.</p>
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
  for (const [slug, name, headline, description] of countries) {
    const crumbs = [home, { name, url: `${SITE_URL}/${slug}` }];
    routes.push({ path: `/${slug}`, title: `Diamond Jewelry Shipping to ${name}`, description, priority: "0.6", changefreq: "monthly", jsonLd: [breadcrumbLd(crumbs)], body: shell(crumbs, `<h1>${esc(headline)}</h1><p>${esc(description)}</p>${categoryLinks}`) });
  }

  // Collections
  for (const c of categories) {
    const path = categoryPath(c);
    const url = `${SITE_URL}${path}`;
    const items = productsIn(c.id);
    const crumbs = [home, { name: "Collections", url: `${SITE_URL}/categories` }, { name: c.name, url }];
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
      body: shell(crumbs, `<h1>${esc(c.name)} collection</h1>${c.description ? `<p>${esc(stripHtml(c.description))}</p>` : ""}<p>${items.length} ${items.length === 1 ? "piece" : "pieces"} · IGI &amp; GIA certified · Made to order</p>${productList(items, categoriesById)}<h2>More collections</h2>${categoryLinks}`),
    });
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
        },
        breadcrumbLd(crumbs),
      ],
      body: shell(
        crumbs,
        `<article><h1>${esc(p.name)}</h1>${cat ? `<p>${esc(cat.name)}</p>` : ""}<p><strong>Price on request</strong> · Made to order · Certified diamonds · Insured delivery</p>
${imgs.slice(0, 4).map((src, i) => `<img src="${esc(src)}" alt="${esc(`${p.name}${i ? ` – view ${i + 1}` : ""}`)}" width="600" height="600"${i ? ' loading="lazy"' : ""}>`).join("")}
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
      body: shell(crumbs, `<article><h1>${esc(b.title)}</h1><p><time datetime="${esc(b.date)}">${esc(b.date)}</time></p>${b.image ? `<img src="${esc(b.image)}" alt="${esc(b.title)}">` : ""}${safeArticleHtml(b.content)}</article>`),
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

  return routes.map((r) => ({ ...r, fullTitle: fullTitle(r.title), url: `${SITE_URL}${r.path === "/" ? "" : r.path}` }));
};

// ── Sitemap ───────────────────────────────────────────────────────────────

const xmlEsc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export const buildSitemapXml = (routes) => {
  const today = new Date().toISOString().split("T")[0];
  const entries = routes.map((r) => {
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
    "- [Ring Builder](https://ringbuilder.starlinkjewels.com/): design a custom engagement ring (diamond, setting, metal)",
    "- [360° Viewer](https://360.starlinkjewels.com/): inspect jewelry from every angle",
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
