// Keyword-rich, stable URLs for products and collections (like /product/oval-halo-diamond-ring-1790401832268
// and /category/eternity-bands). Old id-only URLs keep working and redirect to these.
// scripts/prerender.mjs mirrors slugify(); keep the two in sync.

import { SITE } from "@/lib/seo";

export const slugify = (value: string): string =>
  (value || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");

type HasIdName = { id: string; name?: string };

/** `/product/<name-slug>-<id>`; the id at the end keeps it unique even when names repeat. */
export const productPath = (product: HasIdName) => {
  const slug = slugify(product.name || "");
  return `/product/${slug ? `${slug}-` : ""}${product.id}`;
};

/** `/category/<name-slug>` (falls back to the id if the name has no usable characters). */
export const categoryPath = (category: HasIdName) => `/category/${slugify(category.name || "") || category.id}`;

export const productUrl = (product: HasIdName) => `${SITE.url}${productPath(product)}`;
export const categoryUrl = (category: HasIdName) => `${SITE.url}${categoryPath(category)}`;

/** Resolves a /product/:param segment (slugged or legacy id-only) to a product. */
export const findProductByParam = <T extends HasIdName>(items: T[], param?: string): T | undefined => {
  if (!param) return undefined;
  return items.find((p) => p.id === param) ?? items.find((p) => param.endsWith(`-${p.id}`));
};

/** Resolves a /category/:param segment (slug or legacy id) to a category. */
export const findCategoryByParam = <T extends HasIdName>(items: T[], param?: string): T | undefined => {
  if (!param) return undefined;
  return items.find((c) => c.id === param) ?? items.find((c) => slugify(c.name || "") === param);
};
