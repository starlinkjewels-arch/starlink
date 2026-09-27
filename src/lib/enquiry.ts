// Every pre-filled WhatsApp message the site sends, in one consistent, professional format.
// Rules: greet, say what the customer wants in one line, name the piece in *bold* (WhatsApp formatting)
// with a clean starlinkjewels.com link (WhatsApp shows it as a preview card with the photo), then one
// clear question. Never include raw image/storage URLs.

import { SITE } from "@/lib/seo";
import { productUrl } from "@/lib/urls";

type ProductLike = { id: string; name: string };
type GalleryLike = { id: string; description?: string };
type ArticleLike = { id: string; title: string };

const GREETING = "Hello Starlink Jewels 👋";
const THANKS = "Thank you!";

const compose = (...blocks: (string | false | undefined)[]) => blocks.filter(Boolean).join("\n\n");
// Bold title line kept short: long captions are cut at a word boundary.
const shortTitle = (text: string, max = 70) => {
  const t = text.trim().replace(/\s+/g, " ").replace(/[.\s]+$/, "");
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 40)).replace(/[,;:\s]+$/, "")}…`;
};
const piece = (name: string, url: string) => `*${shortTitle(name)}*\n${url}`;

export const galleryPieceUrl = (item: GalleryLike) => `${SITE.url}/gallery?piece=${encodeURIComponent(item.id)}`;

export const enquiry = {
  /** Main "Enquire" button on product cards and the product page. */
  product: (p: ProductLike) =>
    compose(
      GREETING,
      "I'd like to know more about this piece:",
      piece(p.name, productUrl(p)),
      "Could you please share the price, availability and customisation options?",
      THANKS
    ),

  /** Product page: see the piece live before ordering. */
  videoCall: (p: ProductLike) =>
    compose(GREETING, "I'd like a live video call to see this piece before ordering:", piece(p.name, productUrl(p)), "When would be a good time?", THANKS),

  certificate: (p: ProductLike) =>
    compose(GREETING, "Could you share the diamond certificate details for this piece?", piece(p.name, productUrl(p)), THANKS),

  delivery: (p: ProductLike) =>
    compose(GREETING, "Could you tell me the delivery time to my country for this piece?", piece(p.name, productUrl(p)), THANKS),

  customise: (p: ProductLike) =>
    compose(GREETING, "I'd like to customise this design (metal, size or stone):", piece(p.name, productUrl(p)), "Could we discuss the options?", THANKS),

  /** A photo in the gallery lightbox. */
  galleryPiece: (item: GalleryLike) =>
    compose(
      GREETING,
      "I saw this piece in your gallery and would love something similar:",
      piece(item.description?.trim() || "Gallery piece", galleryPieceUrl(item)),
      "Could you share the price and how long it would take to make?",
      THANKS
    ),

  gallery: () => compose(GREETING, "I've been browsing your gallery and would like something similar made for me.", `${SITE.url}/gallery`, THANKS),

  article: (a: ArticleLike) =>
    compose(GREETING, "I just read this on your journal:", piece(a.title, `${SITE.url}/blog/${a.id}`), "I'd like some advice on choosing the right piece.", THANKS),

  diamondAdvice: () => compose(GREETING, "I need some help choosing a diamond. Could one of your experts guide me?", THANKS),

  consultation: () => compose(GREETING, "I'd like to book a free design consultation with your team.", THANKS),

  customDesign: () => compose(GREETING, "I'd like to design a custom piece of jewelry. Could we discuss my idea?", THANKS),

  /** Floating button: includes the page the visitor is on so the team has context. */
  general: (pageUrl?: string) =>
    compose(GREETING, "I'm browsing your website and have a question.", pageUrl && pageUrl !== SITE.url && `Page: ${pageUrl}`, THANKS),
};
