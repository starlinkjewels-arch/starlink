import type { Category, Product } from "./storage";
import { getProductCategoryIds } from "./storage";
import { stripHtml } from "./seo";

export interface SearchResult {
  product: Product;
  score: number;
}

const normalize = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, " ");

// Lightweight client-side search over the product catalogue: every query word must match
// somewhere; matches in the name weigh more than category or description matches.
export const searchProducts = (products: Product[], categories: Category[], query: string, limit?: number): SearchResult[] => {
  const words = normalize(query).split(/\s+/).filter((w) => w.length > 1);
  if (words.length === 0) return [];

  const categoryNames = new Map(categories.map((c) => [c.id, normalize(c.name)]));

  const results: SearchResult[] = [];
  for (const product of products) {
    const name = normalize(product.name);
    const cats = getProductCategoryIds(product).map((id) => categoryNames.get(id) || "").join(" ");
    const description = normalize(stripHtml(product.description || ""));

    let score = 0;
    let matchedAll = true;
    for (const word of words) {
      const stem = word.replace(/s$/, "");
      if (name.includes(stem)) score += name.startsWith(stem) ? 6 : 4;
      else if (cats.includes(stem)) score += 3;
      else if (description.includes(stem)) score += 1;
      else {
        matchedAll = false;
        break;
      }
    }
    if (matchedAll) results.push({ product, score });
  }

  results.sort((a, b) => b.score - a.score);
  return typeof limit === "number" ? results.slice(0, limit) : results;
};

export const searchCategories = (categories: Category[], query: string) => {
  const q = normalize(query).trim();
  if (q.length < 2) return [];
  return categories.filter((c) => normalize(c.name).includes(q.replace(/s$/, "")));
};

export const DIAMOND_SHAPES = ["Round", "Oval", "Emerald", "Pear", "Marquise", "Cushion", "Princess", "Radiant", "Heart", "Asscher"] as const;
export type DiamondShape = (typeof DIAMOND_SHAPES)[number];
