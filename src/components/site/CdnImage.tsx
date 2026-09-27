import { useState, type ImgHTMLAttributes } from "react";
import { cdnImg, type CdnOptions } from "@/lib/imageUrl";
import { cn } from "@/lib/utils";

interface CdnImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  /** Resize options for the image CDN (Firebase Storage images only). */
  cdn?: CdnOptions;
}

// URLs already fetched this session: show them instantly on remount (no fade, no placeholder flash).
const seen = new Set<string>();

// Firebase Storage originals are often several MB. Serve a resized WebP through the image CDN,
// fall back to the original if the CDN can't fetch it, and fade in once decoded.
const CdnImage = ({ src, cdn, className, onLoad, onError, ...rest }: CdnImageProps) => {
  const optimized = cdnImg(src, cdn);
  const [useOriginal, setUseOriginal] = useState(false);
  const url = useOriginal ? src : optimized;
  const [loaded, setLoaded] = useState(() => seen.has(url));

  return (
    <img
      {...rest}
      src={url}
      className={cn("transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0", className)}
      onLoad={(e) => {
        seen.add(url);
        setLoaded(true);
        onLoad?.(e);
      }}
      onError={(e) => {
        if (!useOriginal && optimized !== src) {
          setUseOriginal(true);
          return;
        }
        setLoaded(true);
        onError?.(e);
      }}
    />
  );
};

export default CdnImage;
