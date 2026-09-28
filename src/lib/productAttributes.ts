// Filterable product attributes (diamond shape, lab-grown/natural, metal, carat weight).
// Values set in the admin always win; otherwise they are read from the product name and
// description with deliberately strict patterns, so a filter never shows a wrong piece
// (e.g. "heart" only counts as "heart-shaped / heart cut / heart diamond").
import type { Product } from "./storage";
import { stripHtml } from "./seo";
import { DIAMOND_SHAPES, type DiamondShape } from "./search";

export type DiamondType = "lab" | "natural";
export type MetalColour = "white" | "yellow" | "rose" | "platinum";
export type CaratBand = "under-1" | "1-2" | "2-3" | "3-5" | "5-plus";

export interface ProductAttributes {
  shapes: DiamondShape[];
  diamondTypes: DiamondType[];
  metals: MetalColour[];
  carat: number | null;
  caratBand: CaratBand | null;
}

export const DIAMOND_TYPE_LABELS: Record<DiamondType, string> = { lab: "Lab-grown", natural: "Natural" };
export const METAL_LABELS: Record<MetalColour, string> = { white: "White gold", yellow: "Yellow gold", rose: "Rose gold", platinum: "Platinum" };
export const CARAT_BANDS: { value: CaratBand; label: string; min: number; max: number }[] = [
  { value: "under-1", label: "Under 1 ct", min: 0, max: 1 },
  { value: "1-2", label: "1 – 2 ct", min: 1, max: 2 },
  { value: "2-3", label: "2 – 3 ct", min: 2, max: 3 },
  { value: "3-5", label: "3 – 5 ct", min: 3, max: 5 },
  { value: "5-plus", label: "5 ct +", min: 5, max: Infinity },
];

const SHAPE_WORDS: Record<DiamondShape, string> = {
  Round: "round",
  Oval: "oval",
  Emerald: "emerald",
  Pear: "pear",
  Marquise: "marquise",
  Cushion: "cushion",
  Princess: "princess",
  Radiant: "radiant",
  Heart: "heart",
  Asscher: "asscher",
};

const detectShapes = (name: string, description: string): DiamondShape[] => {
  const found = new Set<DiamondShape>();
  for (const shape of DIAMOND_SHAPES) {
    const w = SHAPE_WORDS[shape];
    // In the name, the shape word on its own is reliable ("Oval Halo Ring").
    const inName = new RegExp(`\\b${w}\\b`, "i").test(name) && !(shape === "Heart" && /\bheart(s)?\s+(pendant|locket)\b/i.test(name) && !/diamond/i.test(name));
    // In the description, require "<shape>-cut / cut / shape(d) / brilliant / diamond(s)".
    const inText = new RegExp(`\\b${w}[- ]?(cut|shape|shaped|brilliant|diamonds?|lab[- ]grown)\\b`, "i").test(description);
    if (inName || inText) found.add(shape);
  }
  // "Emerald" in a name can also be the green gemstone: keep it only if a cut is described somewhere.
  if (found.has("Emerald") && /\bemeralds?\b(?![- ]?(cut|shape))/i.test(name) && !/emerald[- ]?(cut|shape)/i.test(description + " " + name)) {
    found.delete("Emerald");
  }
  return DIAMOND_SHAPES.filter((s) => found.has(s));
};

const detectDiamondTypes = (text: string): DiamondType[] => {
  const types: DiamondType[] = [];
  if (/\blab[- ]?(grown|created)\b|\blab diamonds?\b|\bLGD\b|\bCVD\b|\bHPHT\b/i.test(text)) types.push("lab");
  if (/\bnatural (white )?diamonds?\b|\b(earth[- ])?mined diamonds?\b/i.test(text)) types.push("natural");
  return types;
};

const detectMetals = (text: string): MetalColour[] => {
  const metals: MetalColour[] = [];
  if (/\bwhite gold\b/i.test(text)) metals.push("white");
  if (/\byellow gold\b/i.test(text)) metals.push("yellow");
  if (/\brose gold\b/i.test(text)) metals.push("rose");
  if (/\bplatinum\b(?![- ]?plat)/i.test(text)) metals.push("platinum");
  return metals;
};

const CARAT_RE = /(\d{1,2}(?:\.\d{1,2})?)\s?(?:ct|cts|cttw|tcw|carats?)\b/gi;

const detectCarat = (name: string, description: string): number | null => {
  const inName = [...name.matchAll(CARAT_RE)].map((m) => parseFloat(m[1]));
  if (inName.length) return inName[0];
  // Prefer the total weight ("totaling 5.07 ct") when a description lists several stones.
  const total = description.match(/total(?:l?ing|\s+weight)?[^.\d]{0,20}(\d{1,2}(?:\.\d{1,2})?)\s?(?:ct|cts|cttw|tcw|carats?)\b/i);
  if (total) return parseFloat(total[1]);
  const first = [...description.matchAll(CARAT_RE)].map((m) => parseFloat(m[1]));
  return first.length ? first[0] : null;
};

export const caratBandOf = (carat: number | null): CaratBand | null => {
  if (carat === null || !Number.isFinite(carat) || carat <= 0 || carat > 500) return null;
  return CARAT_BANDS.find((b) => carat >= b.min && carat < b.max)?.value ?? null;
};

const cache = new WeakMap<Product, ProductAttributes>();

export const getProductAttributes = (product: Product): ProductAttributes => {
  const hit = cache.get(product);
  if (hit) return hit;
  const name = product.name || "";
  const description = stripHtml(product.description || "");
  const text = `${name} ${description}`;

  const shapes = product.shapes?.length ? (product.shapes.filter((s) => (DIAMOND_SHAPES as readonly string[]).includes(s)) as DiamondShape[]) : detectShapes(name, description);
  const diamondTypes = product.diamondTypes?.length ? product.diamondTypes : detectDiamondTypes(text);
  const metals = product.metals?.length ? product.metals : detectMetals(text);
  const carat = typeof product.caratWeight === "number" && product.caratWeight > 0 ? product.caratWeight : detectCarat(name, description);

  const attrs: ProductAttributes = { shapes, diamondTypes, metals, carat, caratBand: caratBandOf(carat) };
  cache.set(product, attrs);
  return attrs;
};

// ---- Filtering (values within a group are OR, groups are AND) ----

export interface ProductFilterState {
  shapes: DiamondShape[];
  diamondTypes: DiamondType[];
  metals: MetalColour[];
  carats: CaratBand[];
}

export const EMPTY_FILTERS: ProductFilterState = { shapes: [], diamondTypes: [], metals: [], carats: [] };

export const countActiveFilters = (f: ProductFilterState) => f.shapes.length + f.diamondTypes.length + f.metals.length + f.carats.length;

export const matchesFilters = (product: Product, f: ProductFilterState) => {
  const a = getProductAttributes(product);
  if (f.shapes.length && !f.shapes.some((s) => a.shapes.includes(s))) return false;
  if (f.diamondTypes.length && !f.diamondTypes.some((t) => a.diamondTypes.includes(t))) return false;
  if (f.metals.length && !f.metals.some((m) => a.metals.includes(m))) return false;
  if (f.carats.length && !(a.caratBand && f.carats.includes(a.caratBand))) return false;
  return true;
};

// URL <-> filter state (?shape=oval,pear&diamond=lab&metal=rose&carat=1-2): shareable, and the
// page canonical stays the unfiltered collection URL.
const parseList = <T extends string>(value: string | null, allowed: readonly T[]) =>
  (value || "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .map((v) => allowed.find((a) => a.toLowerCase() === v))
    .filter((v): v is T => Boolean(v));

export const filtersFromParams = (params: URLSearchParams): ProductFilterState => ({
  shapes: parseList(params.get("shape"), DIAMOND_SHAPES),
  diamondTypes: parseList(params.get("diamond"), ["lab", "natural"] as const),
  metals: parseList(params.get("metal"), ["white", "yellow", "rose", "platinum"] as const),
  carats: parseList(params.get("carat"), CARAT_BANDS.map((b) => b.value)),
});

export const writeFiltersToParams = (params: URLSearchParams, f: ProductFilterState) => {
  const next = new URLSearchParams(params);
  const set = (key: string, values: string[]) => (values.length ? next.set(key, values.map((v) => v.toLowerCase()).join(",")) : next.delete(key));
  set("shape", f.shapes);
  set("diamond", f.diamondTypes);
  set("metal", f.metals);
  set("carat", f.carats);
  return next;
};
