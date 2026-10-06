// Post-build: writes a static HTML file for every public page so search engines, AI crawlers and link
// previews get the real title, description, canonical, structured data and content without running JS.
// React replaces the pre-rendered content on load (main.tsx removes the [data-prerender] head tags,
// react-helmet-async then manages them as usual).
//
// Output (with vercel.json "cleanUrls": true, /product/x is served from product/x.html):
//   dist/index.html                home page
//   dist/<path>.html               every other route
//   dist/200.html                  generic app shell, the SPA fallback for routes not pre-rendered
//   dist/sitemap.xml, sitemap-index.xml, llms.txt
//
// If Firestore can't be reached the build still succeeds and the site works as a plain SPA.

import { existsSync, readdirSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, buildLlmsTxt, buildRoutes, buildSitemapIndexXml, buildSitemapXml, categoryPath, esc, fetchCatalog, productPath } from "./seo-data.mjs";

const dist = resolve(dirname(fileURLToPath(import.meta.url)), "..", "dist");

// Generic tags in index.html that each page replaces with its own.
const GENERIC_HEAD_TAGS =
  /<title>[\s\S]*?<\/title>|<meta\s+(?:name|property)="(?:title|description|keywords|og:(?:type|title|description|image|image:secure_url|image:alt|url)|twitter:(?:title|description|image|image:alt|url))"[\s\S]*?>\s*/g;

const STYLE = `<style data-prerender>
.prerender{font-family:Inter,system-ui,-apple-system,sans-serif;color:#1c1917;max-width:1200px;margin:0 auto;padding:16px 20px 48px;line-height:1.6}
.prerender a{color:#2b59a8;text-decoration:none}.prerender a:hover{text-decoration:underline}
.pr-header{display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;padding:12px 0 20px;border-bottom:1px solid #eee;margin-bottom:24px}
.pr-logo{font-weight:700;font-size:20px;color:#1f3f7a!important;margin-right:auto}
.pr-header nav,.pr-footer nav{display:flex;flex-wrap:wrap;gap:8px 16px;font-size:14px}
.pr-crumbs{font-size:13px;color:#666;margin-bottom:12px}
.prerender h1{font-size:clamp(28px,5vw,48px);line-height:1.1;margin:8px 0 16px}
.prerender h2{font-size:22px;margin:32px 0 12px}
.prerender img{max-width:100%;height:auto;border-radius:16px}
.pr-grid{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px}
.pr-grid li a{display:flex;flex-direction:column;gap:6px;color:#1c1917}.pr-grid small{display:block;color:#777;font-size:12px}
.pr-links{padding-left:18px}.pr-footer{margin-top:48px;padding-top:20px;border-top:1px solid #eee;font-size:14px;color:#666}
</style>`;

const jsonLdTag = (graph) =>
  `<script type="application/ld+json" data-prerender>${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`;

const headFor = (r) => {
  const image = r.ogImage && /^https?:/.test(r.ogImage) ? r.ogImage : DEFAULT_OG_IMAGE;
  const tags = [
    `<title data-prerender>${esc(r.fullTitle)}</title>`,
    `<meta name="description" content="${esc(r.description)}" data-prerender>`,
    `<link rel="canonical" href="${esc(r.url)}" data-prerender>`,
    `<meta property="og:type" content="${esc(r.ogType || "website")}" data-prerender>`,
    `<meta property="og:title" content="${esc(r.fullTitle)}" data-prerender>`,
    `<meta property="og:description" content="${esc(r.description)}" data-prerender>`,
    `<meta property="og:url" content="${esc(r.url)}" data-prerender>`,
    `<meta property="og:image" content="${esc(image)}" data-prerender>`,
    `<meta property="og:image:alt" content="${esc(r.title)}" data-prerender>`,
    `<meta name="twitter:title" content="${esc(r.fullTitle)}" data-prerender>`,
    `<meta name="twitter:description" content="${esc(r.description)}" data-prerender>`,
    `<meta name="twitter:image" content="${esc(image)}" data-prerender>`,
  ];
  if (r.jsonLd && r.jsonLd.length) tags.push(jsonLdTag(r.jsonLd.filter(Boolean)));
  tags.push(STYLE);
  return tags.join("\n  ");
};

const render = (template, r) =>
  template
    .replace(GENERIC_HEAD_TAGS, "")
    .replace("</head>", `  ${headFor(r)}\n</head>`)
    .replace('<div id="root"></div>', `<div id="root">${r.body}</div>`);

// Old id-only URLs (/product/123, /category/123) that Google may already have indexed: an instant
// meta refresh + canonical, which Google treats as a permanent redirect to the keyword URL.
const redirectHtml = (to) =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Redirecting…</title><link rel="canonical" href="${esc(SITE_URL + to)}"><meta http-equiv="refresh" content="0; url=${esc(to)}"><meta name="robots" content="noindex, follow"></head><body><a href="${esc(to)}">Continue</a><script>location.replace(${JSON.stringify(to)} + location.search + location.hash)</script></body></html>`;

const outputPath = (path) => (path === "/" ? resolve(dist, "index.html") : resolve(dist, `${path.replace(/^\//, "")}.html`));

// Only the latin subsets of the two families actually used above the fold. Preloading
// more would compete for bandwidth with the LCP image.
const PRELOAD_FONTS = [/^inter-latin-wght-normal-.*\.woff2$/, /^inter-tight-latin-wght-normal-.*\.woff2$/];

const injectFontPreloads = (html) => {
  let assets = [];
  try {
    assets = readdirSync(resolve(dist, "assets"));
  } catch {
    return html;
  }
  const links = PRELOAD_FONTS.map((re) => assets.find((f) => re.test(f)))
    .filter(Boolean)
    .map((f) => `<link rel="preload" as="font" type="font/woff2" href="/assets/${f}" crossorigin>`)
    .join("");
  if (!links) {
    console.warn("[prerender] No variable font files found to preload — check the @fontsource imports.");
    return html;
  }
  return html.includes("<head>") ? html.replace("<head>", `<head>${links}`) : html;
};

// Swap the robots directive in a shell. The index.html shipped by Vite carries
// "index, follow, ..." for the real pages; the SPA fallback and 404 need the opposite.
const withRobots = (html, value) =>
  html.includes('name="robots"')
    ? html.replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i, `<meta name="robots" content="${value}">`)
    : html.replace(/<\/head>/i, `<meta name="robots" content="${value}"></head>`);

const run = async () => {
  // A previous run leaves the pristine shell in 200.html (index.html is then the pre-rendered home page).
  const shellFile = existsSync(resolve(dist, "200.html")) ? "200.html" : "index.html";
  let template = await readFile(resolve(dist, shellFile), "utf8");
  if (!template.includes('<div id="root"></div>')) throw new Error('dist/index.html has no empty <div id="root"></div>');

  // Preload the two latin variable fonts.
  //
  // Self-hosting removed a 951 ms render-blocking request, but it also meant the
  // fonts arrived *after* first paint and swapped in, which measured as CLS 0.332.
  // Preloading them puts the fetch in flight with the CSS, so text paints in the
  // real font and nothing reflows. Vite hashes the filenames, so they are resolved
  // from the build output here rather than hard-coded in index.html.
  template = injectFontPreloads(template);

  // The untouched shell is the SPA fallback (vercel.json rewrites unknown routes to /200 (cleanUrls serves 200.html)).
  //
  // It must be noindex. Every route that should rank gets its own pre-rendered file
  // below, with its own index,follow. The shell is only ever served for URLs that
  // were NOT pre-rendered: a brand-new product awaiting the next build, /search,
  // /wishlist, or a bad id. None of those should enter the index, and a crawler
  // that doesn't run JS never sees the client-side noindex that NotFound sets.
  const noindexShell = withRobots(template, "noindex, follow");
  await writeFile(resolve(dist, "200.html"), noindexShell, "utf8");

  // A real 404 document. Vercel serves dist/404.html with a 404 status for any path
  // that matches no file and no rewrite, which is what makes unknown URLs return 404
  // instead of a soft 200.
  await writeFile(resolve(dist, "404.html"), noindexShell, "utf8");

  let data;
  try {
    data = await fetchCatalog();
  } catch (err) {
    console.warn(`[prerender] Skipped: could not load catalogue from Firestore (${err.message}). Site will run as a plain SPA.`);
    return;
  }

  const routes = buildRoutes(data);
  const seen = new Set();
  for (const r of routes) {
    if (seen.has(r.path)) continue; // two products/categories resolving to the same URL: first wins
    seen.add(r.path);
    const file = outputPath(r.path);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, render(template, r), "utf8");
  }

  let redirects = 0;
  const legacy = [
    ...data.products.map((p) => [`/product/${p.id}`, productPath(p)]),
    ...data.categories.map((c) => [`/category/${c.id}`, categoryPath(c)]),
  ];
  for (const [from, to] of legacy) {
    if (from === to || seen.has(from)) continue;
    const file = outputPath(from);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, redirectHtml(to), "utf8");
    redirects++;
  }

  await writeFile(resolve(dist, "sitemap.xml"), buildSitemapXml(routes.filter((r, i) => routes.findIndex((x) => x.path === r.path) === i)), "utf8");
  await writeFile(resolve(dist, "sitemap-index.xml"), buildSitemapIndexXml(), "utf8");
  await writeFile(resolve(dist, "llms.txt"), buildLlmsTxt(data), "utf8");

  console.log(`[prerender] ${seen.size} pages + ${redirects} legacy-URL redirects written for ${SITE_NAME} (${SITE_URL}); sitemap.xml, sitemap-index.xml and llms.txt updated.`);
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    // Never fail the deploy because of pre-rendering; the SPA still works without it.
    console.warn(`[prerender] Failed, continuing without static pages: ${err.stack || err.message}`);
    process.exit(0);
  });
