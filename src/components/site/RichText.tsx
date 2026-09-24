import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface RichTextProps {
  /** Already-sanitized HTML from the CMS. */
  html: string;
  className?: string;
}

// Renders CMS article HTML. Images whose URL no longer works are hidden instead of
// showing the browser's broken-image icon and alt text.
const RichText = ({ html, className }: RichTextProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

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
