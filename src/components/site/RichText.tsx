import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

interface RichTextProps {
  /** Already-sanitized HTML from the CMS. */
  html: string;
  className?: string;
}

// The page title is the one <h1>. Editors use H1 for section headings inside articles —
// measured, up to 20 per page — so any H1 in CMS content renders as an H2. Mirrors
// DEMOTE_H1 in scripts/seo-data.mjs, which pre-renders the same articles.
const DEMOTE_H1 = /<(\/?)h1(\b[^>]*)>/gi;

// Renders CMS article HTML. Images whose URL no longer works are hidden instead of
// showing the browser's broken-image icon and alt text.
const RichText = ({ html: rawHtml, className }: RichTextProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const html = useMemo(() => rawHtml.replace(DEMOTE_H1, "<$1h2$2>"), [rawHtml]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const hide = (img: HTMLImageElement) => {
      img.style.display = "none";
    };
    const cleanups: Array<() => void> = [];
    root.querySelectorAll("img").forEach((img) => {
      if (!img.getAttribute("loading")) img.loading = "lazy";
      img.decoding = "async";
      if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) {
        hide(img);
        return;
      }
      const onError = () => hide(img);
      img.addEventListener("error", onError);
      cleanups.push(() => img.removeEventListener("error", onError));
    });
    return () => cleanups.forEach((fn) => fn());
  }, [html]);

  return <div ref={ref} className={cn("rich-text", className)} dangerouslySetInnerHTML={{ __html: html }} />;
};

export default RichText;
