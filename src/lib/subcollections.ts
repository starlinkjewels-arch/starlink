/**
 * Shape sub-collections — /category/<collection>/<shape>, e.g. /category/rings/oval.
 *
 * Mirrored in scripts/seo-data.mjs, which pre-renders the same pages. The two must
 * agree on which pages exist and what they list, or crawlers and users would see
 * different content. Change the constants or the copy in both places.
 */
import { DIAMOND_SHAPES, type DiamondShape } from "./search";
import { slugify } from "./urls";

/**
 * A shape page is only a real page — and only indexable — with enough pieces to browse.
 * Below this it is a filter state, not a collection; publishing it would be scaled thin
 * content, which is a Google spam policy.
 */
export const SUBCOLLECTION_MIN = 6;

/** Collections that are not a jewellery type, so "oval <collection>" is not a real search. */
export const SUBCOLLECTION_EXCLUDE = new Set(["custom-jewelry", "cuban-collection", "ready-to-ship"]);

/** One factual line per cut — gemology, not marketing, so it holds for every piece. */
export const SHAPE_INFO: Record<DiamondShape, string> = {
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

/** URL segment → shape, case-insensitive. Returns null for anything that is not a shape. */
export const shapeFromSlug = (slug: string | undefined): DiamondShape | null =>
  (slug && DIAMOND_SHAPES.find((s) => s.toLowerCase() === slug.toLowerCase())) || null;

export const shapeSlug = (shape: DiamondShape) => shape.toLowerCase();

/** Whether a collection takes shape sub-collections at all. */
export const collectionTakesShapes = (categoryName: string) => !SUBCOLLECTION_EXCLUDE.has(slugify(categoryName));

/** A shape page is a real, indexable page. Same rule as the pre-render. */
export const isRealSubCollection = (categoryName: string, count: number) =>
  collectionTakesShapes(categoryName) && count >= SUBCOLLECTION_MIN;
