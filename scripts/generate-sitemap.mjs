// Writes public/sitemap.xml (+ sitemap-index.xml) from the live catalogue.
// Run daily by .github/workflows/sitemap.yml; the build (scripts/prerender.mjs) also writes a fresh
// copy into dist/. Page list and URLs come from scripts/seo-data.mjs so both stay identical.

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { buildRoutes, buildSitemapIndexXml, buildSitemapXml, fetchCatalog } from "./seo-data.mjs";

const run = async () => {
  const routes = buildRoutes(await fetchCatalog());
  const unique = routes.filter((r, i) => routes.findIndex((x) => x.path === r.path) === i);
  // noindex routes stay out of everything below. buildSitemapXml filters them itself;
  // the IndexNow list must too, or the workflow asks Bing every day to crawl pages we
  // have told it not to index.
  const indexable = unique.filter((r) => !r.noindex);
  const publicDir = resolve(dirname(fileURLToPath(import.meta.url)), "..", "public");
  await writeFile(resolve(publicDir, "sitemap.xml"), buildSitemapXml(unique), "utf8");
  await writeFile(resolve(publicDir, "sitemap-index.xml"), buildSitemapIndexXml(), "utf8");
  // One URL per line, used by the workflow to notify IndexNow (Bing, Yandex, Seznam, Naver).
  await writeFile(resolve(publicDir, "..", "sitemap-urls.txt"), indexable.map((r) => r.url).join("\n") + "\n", "utf8");
  console.log(
    `Sitemap generated with ${indexable.length} URLs (including image tags)` +
      (unique.length > indexable.length ? `; ${unique.length - indexable.length} noindex route(s) excluded.` : "."),
  );
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to generate sitemap:", err);
    process.exit(1);
  });
