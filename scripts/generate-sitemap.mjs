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
  const publicDir = resolve(dirname(fileURLToPath(import.meta.url)), "..", "public");
  await writeFile(resolve(publicDir, "sitemap.xml"), buildSitemapXml(unique), "utf8");
  await writeFile(resolve(publicDir, "sitemap-index.xml"), buildSitemapIndexXml(), "utf8");
  // One URL per line, used by the workflow to notify IndexNow (Bing, Yandex, Seznam, Naver).
  await writeFile(resolve(publicDir, "..", "sitemap-urls.txt"), unique.map((r) => r.url).join("\n") + "\n", "utf8");
  console.log(`Sitemap generated with ${unique.length} URLs (including image tags).`);
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to generate sitemap:", err);
    process.exit(1);
  });
