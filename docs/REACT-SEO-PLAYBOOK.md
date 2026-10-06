# ⚛️ React SEO Playbook: Organic Traffic System

**Purpose:** take any React project from "invisible to Google" to "earning daily organic traffic".
**Written for:** an AI coding agent (e.g. Claude Code) working in the project, and the developer who owns it.
**Version:** 1.0 · October 2026

---

## 🤖 Instructions for the AI Agent (read first)

You are implementing production-grade SEO in this React project. Follow this file **in order**.

1. **Do Phase 0 (Audit) first.** Don't change code before you know the framework, routing, rendering mode and hosting.
2. **Report the audit to the owner** using the template in Phase 0.4 and **wait for approval** before any big change (framework migration, routing change, rendering change, URL changes).
3. **Ask the owner for business inputs** (Phase 0.3). Never invent the brand, domain, business facts or keywords.
4. Implement phases 1 → 6. **Small, reviewable steps.** After each phase, run the **verification commands** for that phase and report the results honestly (pass or fail, with output).
5. **Never break existing URLs.** If a URL must change, add a **301 redirect** from old to new.
6. **Follow the Rules (Part A).** No cloaking, no fake content, no tricks.
7. Keep a log in `docs/SEO-LOG.md`: date, what changed, why, verification result.

---

## Part A: Rules (never break)

| ❌ Never | ✅ Always |
|---------|----------|
| **Cloaking**: different content for bots vs users | Same HTML content for everyone |
| Hidden text, keyword stuffing | Natural writing for humans |
| Thousands of thin auto-generated pages | Every page has unique value ("scaled content abuse" is a Google spam policy) |
| Fake reviews / ratings in schema | Schema only with real, visible data |
| Buying links, link schemes | Earning links with useful content and PR |
| Copying content from other sites | Original content |
| Changing URLs without redirects | 301 redirect every changed URL |
| `noindex` on important pages by accident | Check robots meta on every template |

---

## Part B: Why React Needs Special SEO Work

```
CLIENT-SIDE REACT (default Vite / old CRA SPA)
  Server sends:  <div id="root"></div>  + big JS bundle
  Google:        must download + run JS to see content → slower, sometimes incomplete indexing
  Bing, social previews (WhatsApp, Facebook, X, LinkedIn), many AI crawlers:
                 often DON'T run JS → see an EMPTY page ❌

SERVER-RENDERED / PRE-RENDERED REACT (Next.js, React Router framework mode, SSG)
  Server sends:  full HTML with title, meta, headings, text, links ✅
  Every crawler sees everything immediately ✅  Faster LCP ✅
```

> **Core rule:** every page that should rank must deliver its **title, meta tags, main content and links in the initial HTML response**.

---

## Phase 0: Audit

### 0.1 Detect the stack
```bash
cat package.json                                  # framework + versions
ls; ls src app pages public 2>/dev/null           # structure
grep -rn "createBrowserRouter\|BrowserRouter\|HashRouter\|createHashRouter" src 2>/dev/null
grep -rn "react-helmet\|<title>\|generateMetadata\|export const metadata\|export function meta" src app 2>/dev/null | head
ls vercel.json netlify.toml _redirects firebase.json 2>/dev/null   # hosting
cat public/robots.txt 2>/dev/null; ls public/sitemap*.xml 2>/dev/null
```

### 0.2 Classify the project

| Detected | Rendering | SEO starting point |
|----------|-----------|--------------------|
| `next` (App Router: `app/`) | SSR/SSG ✅ | Strong. Go to **Path A** |
| `next` (Pages Router: `pages/`) | SSR/SSG ✅ | Strong. Path A (Pages Router notes) |
| `react-router` v7 with `react-router.config.ts` (framework mode) / Remix | SSR or prerender ✅ | Strong. **Path B** |
| `astro` / `gatsby` | Static ✅ | Strong. Apply Phases 2–6 |
| `vite` + `react-router-dom` / `react-router` (library mode) | Client-only ⚠️ | Weak. **Path C** |
| `react-scripts` (Create React App) | Client-only ⚠️, **CRA is deprecated (Feb 2025)** | Weak. Migrate (**Path C**) |
| `HashRouter` / URLs with `#/` | ❌ Google ignores everything after `#` | **Must change** to real paths |

### 0.3 Ask the owner (don't guess)
1. Production **domain** (with or without `www`)? Trailing slash preference?
2. **Brand name**, one-line description, logo file, social profile URLs
3. **Who are the users** and what do they search for? Top 10–30 target keywords (or permission to research)
4. **Business type** (SaaS, blog, e-commerce, local business, portfolio...), which decides the schema types
5. **Languages / countries** targeted
6. Can we **migrate framework/rendering** if needed? (Phase 1)
7. Access to **Google Search Console** + analytics?

### 0.4 Audit report template (send to owner)
```markdown
## SEO Audit: <project>
- Framework / version:
- Routing: (browser / hash) · number of routes:
- Rendering: (SSR / SSG / client-only)
- Hosting:
- Initial HTML contains content?  (yes / no, with evidence: curl output)
- Per-page title/meta?  · Canonical?  · OG tags?
- robots.txt?  · sitemap.xml?  · Structured data?
- Real 404 status for unknown URLs?  (curl -I result)
- Lighthouse mobile: Performance __ / SEO __ / Accessibility __
- 🔴 Critical issues:
- 🟡 Important issues:
- ✅ Recommended path: A / B / C (+ reason)
- Questions for owner:
```

### 0.5 Prove what crawlers see
```bash
npm run build
# Serve the production build (pick what fits): npx serve dist  |  npm run start  |  npx vite preview
curl -s http://localhost:PORT/some-page | grep -iE "<title>|name=\"description\"|rel=\"canonical\"|<h1"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:PORT/this-page-does-not-exist   # must be 404
```
If `<title>`, the description and `<h1>` are missing from the curl output → **the page is invisible to most crawlers.**

---

## Phase 1: Rendering Strategy (the most important decision)

```
                   Does the page need to rank in search?
                         │                    │
                        NO                   YES
                         │                    │
           (dashboard, app, login)     Does content change per request / very often?
           client-only is fine,             │                    │
           add noindex                     NO                   YES
                                            │                    │
                                     STATIC / PRERENDER       SSR (server render)
                                     (SSG, ISR)
```

### Path A: Next.js (recommended for new projects)
Already SEO-capable. Make sure:
- Pages that must rank are **Server Components** (no `'use client'` at the page level; keep client components small).
- Use **`generateStaticParams`** for known dynamic routes (blog posts, products) → static HTML.
- Use the **Metadata API** (Phase 2), `app/sitemap.ts`, `app/robots.ts`.
- Unknown items → call `notFound()` (real 404).

### Path B: React Router v7 framework mode / Remix
- Use the route `meta` export for tags (Phase 2).
- Enable SSR, **or** prerender static routes:
```ts
// react-router.config.ts
import type { Config } from "@react-router/dev/config";
export default {
  ssr: true,                                    // or false for fully static
  async prerender() {
    const posts = await getAllPostSlugs();      // your data source
    return ["/", "/about", "/pricing", ...posts.map((s) => `/blog/${s}`)];
  },
} satisfies Config;
```

### Path C: Client-only SPA (Vite SPA / CRA)
Options, best first. **Get owner approval before starting.**

| Option | Effort | Result |
|--------|--------|--------|
| **C1. Migrate to Next.js** (App Router) | Medium–High | ✅ Best long-term SEO + performance |
| **C2. Move to React Router v7 framework mode** (keeps Vite + React Router knowledge) | Medium | ✅ SSR or prerender |
| **C3. Prerender at build time** (build step outputs HTML for every public route) | Low–Medium | ✅ Good for marketing/blog pages with known URLs |
| **C4. Keep the SPA + client meta tags only** | Low | ⚠️ Weak: OK for Google eventually, bad for social, Bing and AI crawlers. **Last resort** |

**Hybrid pattern (very common and effective):** keep the app (dashboard, logged-in area) as an SPA, and build the **public marketing site + blog + landing pages** with Next.js or Astro on the same domain (`/`, `/blog`, `/features`), with the app at `/app` or `app.domain.com`.

> ⚠️ "Dynamic rendering" (serving prerendered HTML only to bots) is described by Google as a workaround, not a long-term solution. Prefer SSR/SSG for everyone.

**Phase 1 verification:** the Phase 0.5 curl shows the title, description, H1 and body text for every public route.

---

## Phase 2: Metadata Per Page

Every indexable URL needs: a unique `<title>`, `meta description`, `canonical`, Open Graph + Twitter tags, the correct `robots` value and `lang` on `<html>`.

### 2.1 Central site config
```ts
// src/seo/site.ts
export const site = {
  name: "Brand",
  url: "https://www.example.com",          // production origin, NO trailing slash
  description: "One-sentence value proposition with the main keyword.",
  locale: "en_US",
  twitter: "@brand",
  logo: "/logo-512.png",
  ogImage: "/og-default.png",               // 1200x630
  sameAs: ["https://www.instagram.com/brand", "https://www.linkedin.com/company/brand"],
} as const;

export const absoluteUrl = (path = "/") => new URL(path, site.url).toString();
```

### 2.2 Next.js (App Router)
```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { site } from "@/seo/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}: Main keyword phrase`, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: { type: "website", siteName: site.name, locale: site.locale, images: [site.ogImage] },
  twitter: { card: "summary_large_image", site: site.twitter },
  alternates: { canonical: "/" },
};
```
```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.seoTitle ?? post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { type: "article", publishedTime: post.publishedAt, modifiedTime: post.updatedAt,
                 images: [post.coverImage] },
  };
}

export async function generateStaticParams() {
  return (await getAllPosts()).map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();                     // real 404 status
  return <article>{/* H1 + content */}</article>;
}
```

### 2.3 React Router v7 / Remix
```tsx
// app/routes/blog.$slug.tsx
import type { Route } from "./+types/blog.$slug";
import { site, absoluteUrl } from "~/seo/site";

export function meta({ data }: Route.MetaArgs) {
  if (!data) return [{ title: `Not found | ${site.name}` }, { name: "robots", content: "noindex" }];
  const url = absoluteUrl(`/blog/${data.post.slug}`);
  return [
    { title: `${data.post.title} | ${site.name}` },
    { name: "description", content: data.post.excerpt },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "article" },
    { property: "og:title", content: data.post.title },
    { property: "og:description", content: data.post.excerpt },
    { property: "og:url", content: url },
    { property: "og:image", content: absoluteUrl(data.post.coverImage) },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}
```

### 2.4 Plain React 19 (SPA / prerender): native metadata
React 19 hoists `<title>`, `<meta>` and `<link>` rendered anywhere into `<head>`. (React 18 → use `react-helmet-async`.)
```tsx
// src/seo/Seo.tsx
import { site, absoluteUrl } from "./site";

type SeoProps = { title: string; description: string; path: string; image?: string;
                  type?: "website" | "article"; noindex?: boolean };

export function Seo({ title, description, path, image = site.ogImage, type = "website", noindex }: SeoProps) {
  const url = absoluteUrl(path);
  const fullTitle = title.includes(site.name) ? title : `${title} | ${site.name}`;
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, follow" />}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={absoluteUrl(image)} />
      <meta name="twitter:card" content="summary_large_image" />
    </>
  );
}
```

### 2.5 Writing formulas
| Element | Rule | Example |
|---------|------|---------|
| Title | ≤ 60 chars, primary keyword first, brand last | `Invoice Generator for Freelancers: Free \| Brand` |
| Description | 140–155 chars: what + benefit + CTA | `Create professional invoices in 30 seconds. Free templates, PDF export, no signup. Start now.` |
| URL | lowercase, hyphens, short, keyword | `/tools/invoice-generator` |
| H1 | exactly one, matches the intent of the title | `Free Invoice Generator for Freelancers` |
| Canonical | absolute URL, one consistent form (https, www-or-not, slash-or-not) | `https://www.example.com/tools/invoice-generator` |

**Phase 2 verification:** curl 3+ routes → each has a unique title/description and a correct canonical. Paste a URL into a social preview checker (e.g. opengraph.xyz).

---

## Phase 3: Crawling & Indexing

### 3.1 Routing & links
- Real paths (`/pricing`), **never** `#/pricing`.
- Navigation uses real links: `<Link to>` / `<a href>`. **Never** `<div onClick={navigate}>` for navigation (crawlers follow `href` only).
- Important content must not require a click, scroll or login to load. Lazy-loaded tabs/accordions: render the content in the HTML and hide it with CSS if needed.
- Infinite scroll → also provide paginated URLs (`/blog?page=2` or `/blog/page/2`) with real links.

### 3.2 robots.txt
```ts
// Next.js: app/robots.ts
import type { MetadataRoute } from "next";
import { site } from "@/seo/site";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/app/", "/admin/", "/*?*sort="] }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
```
```txt
# Vite/static: public/robots.txt
User-agent: *
Allow: /
Disallow: /app/
Disallow: /admin/

Sitemap: https://www.example.com/sitemap.xml
```
> ⚠️ `robots.txt` blocks **crawling**, not indexing. To keep a page out of Google, use `<meta name="robots" content="noindex">` and do **not** block it in robots.txt (Google must crawl it to see the noindex).

**AI search crawlers** (GPTBot, ClaudeBot, PerplexityBot, Google-Extended...): decide with the owner whether to allow them. Being citable in AI answers can bring traffic. Google AI Overviews use the normal Google index, so standard SEO applies.

### 3.3 sitemap.xml
```ts
// Next.js: app/sitemap.ts
import type { MetadataRoute } from "next";
import { site } from "@/seo/site";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  return [
    { url: site.url, lastModified: new Date() },
    { url: `${site.url}/pricing` },
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: new Date(p.updatedAt) })),
  ];
}
```
```js
// Vite/static: scripts/generate-sitemap.mjs  →  add to package.json: "postbuild": "node scripts/generate-sitemap.mjs"
import { writeFileSync } from "node:fs";
const SITE = "https://www.example.com";
const staticRoutes = ["/", "/about", "/pricing", "/blog"];
const posts = []; // load slugs from your content folder / API
const urls = [...staticRoutes, ...posts.map((s) => `/blog/${s}`)];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>`).join("\n")}
</urlset>`;
writeFileSync("dist/sitemap.xml", xml);
console.log(`sitemap.xml: ${urls.length} URLs`);
```
Only include **canonical, indexable, 200-status** URLs. No redirects, no noindex pages.

### 3.4 Status codes & redirects
| Situation | Must return |
|-----------|-------------|
| Page exists | `200` |
| Page doesn't exist | **`404`** (an SPA returning 200 for everything = "soft 404") |
| Moved permanently | **`301`** to the new URL |
| `http://` / non-canonical host / slash variant | `301` to the canonical form |

SPA fallback hosting (`/* → /index.html 200`) makes every unknown URL return 200. Fix it with SSR/prerender (a real 404 page), or at minimum render `<meta name="robots" content="noindex">` on the client-side 404 route.

**Phase 3 verification:**
```bash
curl -s https://DOMAIN/robots.txt
curl -s https://DOMAIN/sitemap.xml | head -20
curl -s -o /dev/null -w "%{http_code}\n" https://DOMAIN/definitely-not-a-page   # expect 404
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://DOMAIN/           # expect 301 → https canonical
```

---

## Phase 4: Structured Data (JSON-LD)

```tsx
// src/seo/JsonLd.tsx
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
  );
}
```
```ts
// src/seo/schema.ts
import { site, absoluteUrl } from "./site";

export const organizationSchema = () => ({
  "@context": "https://schema.org", "@type": "Organization",
  name: site.name, url: site.url, logo: absoluteUrl(site.logo), sameAs: site.sameAs,
});

export const websiteSchema = () => ({
  "@context": "https://schema.org", "@type": "WebSite", name: site.name, url: site.url,
});

export const breadcrumbSchema = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path),
  })),
});

export const articleSchema = (p: { title: string; description: string; path: string; image: string;
  published: string; modified: string; author: string }) => ({
  "@context": "https://schema.org", "@type": "BlogPosting",
  headline: p.title, description: p.description, image: [absoluteUrl(p.image)],
  datePublished: p.published, dateModified: p.modified,
  author: { "@type": "Person", name: p.author },
  publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: absoluteUrl(site.logo) } },
  mainEntityOfPage: absoluteUrl(p.path),
});
```

| Business type | Schema to add |
|---------------|---------------|
| Every site | Organization + WebSite (homepage), BreadcrumbList (inner pages) |
| Blog / content | BlogPosting / Article |
| SaaS / app / tool | SoftwareApplication (offers, operatingSystem, applicationCategory) |
| E-commerce | Product + Offer (+ AggregateRating **only from real reviews**) |
| Local business | LocalBusiness (address, geo, openingHours, telephone) |
| Courses / events / jobs | Course / Event / JobPosting |
| FAQ sections | FAQPage is OK, but Google shows FAQ rich results only for government/health sites (since 2023) |

**Phase 4 verification:** Google Rich Results Test + Schema Markup Validator for each page type → 0 errors.

---

## Phase 5: Performance (Core Web Vitals)

| Metric | Good (mobile, 75th percentile) |
|--------|-------------------------------|
| **LCP** | < 2.5 s |
| **INP** | < 200 ms |
| **CLS** | < 0.1 |

**Checklist:**
- [ ] **Route-level code splitting**: `React.lazy()` / framework defaults; the homepage bundle stays small
- [ ] **LCP image**: not lazy, `fetchPriority="high"`, correct size, AVIF/WebP (`next/image` with `priority` in Next.js)
- [ ] All other images: `loading="lazy"`, **explicit `width` + `height`** (prevents CLS), responsive `srcSet`/`sizes`
- [ ] Fonts: self-hosted (`next/font` or `@fontsource`), `font-display: swap`, preload only the main font
- [ ] No layout shift from banners, cookie bars, late-loading ads/embeds: reserve their space
- [ ] Third-party scripts (analytics, chat, pixels): load after interaction or `defer` / Next `<Script strategy="lazyOnload">`
- [ ] INP: no long tasks on click; `useTransition` for heavy state updates; debounce inputs; virtualize long lists
- [ ] Analyze the bundle (`npx vite-bundle-visualizer` / `@next/bundle-analyzer`) and remove heavy unused deps
- [ ] Compression (brotli/gzip) + long cache headers for hashed assets (hosts usually do this)

**Phase 5 verification:**
```bash
npx lighthouse https://DOMAIN/ --preset=perf --form-factor=mobile --only-categories=performance,seo,accessibility --output=json --output-path=./lighthouse.json
```
Targets: Performance ≥ 90, SEO = 100, Accessibility ≥ 90. Also check PageSpeed Insights (field data) after launch.

---

## Phase 6: Content & Site Architecture (where traffic actually comes from)

Technical SEO makes pages **eligible**. **Content** makes them **rank**.

### 6.1 Keyword → page mapping
| Intent | Example search | Page type |
|--------|----------------|-----------|
| Do / use | "free invoice generator" | Tool / feature landing page |
| Buy / compare | "best X for freelancers", "X vs Y" | Comparison page |
| Learn | "how to write an invoice" | Blog guide |
| Brand | "brand pricing", "brand reviews" | Pricing / reviews page |
| Local | "service near me" | Location page + Google Business Profile |

**One primary keyword per page.** Two pages never target the same keyword.

### 6.2 Architecture
```
/                         ← brand + main keyword
├── /features/<feature>   ← one page per feature/use case (buying intent)
├── /use-cases/<audience> ← "X for freelancers", "X for agencies"
├── /compare/<a-vs-b>     ← honest comparisons
├── /blog/<slug>          ← guides (learning intent) → link to features
├── /tools/<tool>         ← free mini-tools (great for links + traffic)
├── /pricing  /about  /contact
```
- Every important page ≤ 3 clicks from home; breadcrumbs on inner pages.
- Each new page: **≥ 3 internal links in**, 2–5 links out, descriptive anchor text.

### 6.3 Page content template
```
H1 = primary keyword (human-readable)
First 2–3 sentences: directly answer / state the value
Visual proof: screenshot, demo, example, original image
H2 sections: complete coverage (how it works, benefits, examples, FAQ)
Real experience / data / numbers (E-E-A-T)
Clear CTA
Author + updated date (for articles)
Internal links to related pages
```

### 6.4 Content in the codebase (developer-friendly)
- Blog in **MDX** (`content/blog/*.mdx`) with frontmatter: `title, description, slug, date, updated, author, image, keywords`.
- Frontmatter feeds metadata, the sitemap, schema and the RSS feed automatically.
- AI can draft; **a human adds real experience and checks the facts** before publishing.

### 6.5 Programmatic SEO (use carefully)
Templated pages at scale (e.g. `/convert/<a>-to-<b>`) work **only if each page has unique, useful data**. Thin template pages = spam risk ("scaled content abuse"). Start with 20–50 high-quality pages, measure, then expand.

---

## Phase 7: Launch & Monitoring

### 7.1 Launch checklist
- [ ] All Phase 0.5 / 2 / 3 / 4 / 5 verifications pass
- [ ] HTTPS + one canonical host (www or not), others 301
- [ ] Google Search Console: verify (DNS preferred) → submit `sitemap.xml` → URL Inspection on homepage + top pages → Request indexing
- [ ] Bing Webmaster Tools (import from Search Console)
- [ ] Analytics (GA4 or a privacy-friendly alternative) with conversion events
- [ ] Favicon + `apple-touch-icon` + `manifest.webmanifest`
- [ ] Custom 404 page with links/search (returns 404 status)
- [ ] No `noindex` on production pages (check staging settings didn't leak!)
- [ ] Staging/preview deployments are **noindex** (or password-protected)

### 7.2 The weekly loop (forever)
```
FIND keywords → CHECK top-10 intent → CREATE a better page → OPTIMIZE (Phases 2–4)
→ PROMOTE (social, communities, email, partners) → MEASURE (Search Console, 4–8 weeks)
→ IMPROVE pages at position 8–20 + low-CTR titles → REPEAT ↺
```

### 7.3 KPIs
| KPI | Source | Goal |
|-----|--------|------|
| Indexed pages | Search Console → Pages | All important pages indexed |
| Impressions / clicks | Search Console → Performance | Growing every month |
| Avg. position per target keyword | Search Console | Moving into the top 10 |
| CTR | Search Console | Low CTR at a good position → rewrite title/description |
| Core Web Vitals | Search Console → CWV | All "Good" |
| Organic sign-ups / sales | Analytics | 🎯 The number that matters |
| Referring domains | Search Console → Links | Slowly growing |

**Realistic timeline:** months 1–2 indexing + first impressions → months 3–4 long-tail rankings → month 6+ steady daily traffic **if the loop runs every week**.

---

## 📁 Recommended SEO File Structure

```
src/seo/
├── site.ts          ← brand, domain, defaults (single source of truth)
├── Seo.tsx          ← per-page meta (SPA / React 19) — or use the framework Metadata API
├── JsonLd.tsx       ← JSON-LD renderer
└── schema.ts        ← schema builders
content/blog/*.mdx   ← articles with frontmatter
scripts/
├── generate-sitemap.mjs   (non-Next projects)
└── check-seo.mjs          (optional: crawl build output, assert title/description/h1/canonical per page)
public/
├── robots.txt             (non-Next projects)
├── og-default.png         (1200×630)
├── logo-512.png
└── favicon.ico / icon.svg / apple-touch-icon.png
docs/
├── REACT-SEO-PLAYBOOK.md  ← this file
└── SEO-LOG.md             ← agent's change log
```

---

## ✅ Definition of Done (agent's final check)

- [ ] Every public route: unique title + description + canonical + OG, present in the **initial HTML**
- [ ] Exactly one H1 per page; logical H2/H3
- [ ] Real links (`<a href>`) for all navigation
- [ ] `robots.txt` + `sitemap.xml` live and correct
- [ ] Unknown URL → **404 status**; changed URLs → **301**
- [ ] Structured data valid (0 errors) for each page type
- [ ] Lighthouse mobile: Perf ≥ 90 · SEO 100 · A11y ≥ 90
- [ ] Images: alt text, width/height, lazy (except LCP), modern formats
- [ ] Search Console verified + sitemap submitted (owner action)
- [ ] `docs/SEO-LOG.md` updated with everything changed + verification output
- [ ] Owner got a short summary: what was done, what's left, what they need to do

---

## 💬 How to Start in a New Project

Copy this file to `docs/REACT-SEO-PLAYBOOK.md` in the React project, then tell the AI agent:

> **"Read `docs/REACT-SEO-PLAYBOOK.md` and follow it. Start with Phase 0: audit this project and send me the audit report. Don't make big changes before I approve."**

Optional: add this line to the project's `CLAUDE.md` so every session follows it:
```markdown
- SEO: follow docs/REACT-SEO-PLAYBOOK.md for any page, route, metadata or content change.
```

---
_Reusable playbook. Update the version and date when you improve it._
