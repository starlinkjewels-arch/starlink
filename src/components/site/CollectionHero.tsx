import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import KineticHeading from "@/components/site/KineticHeading";
import { cn } from "@/lib/utils";
import { cdnImg } from "@/lib/imageUrl";
import craft1 from "@/assets/craft/craft-1.jpg";
import craft2 from "@/assets/craft/craft-2.jpg";
import craft3 from "@/assets/craft/craft-3.jpg";
import craft4 from "@/assets/craft/craft-4.jpg";

interface Crumb {
  name: string;
  to?: string;
}

interface CollectionHeroProps {
  eyebrow?: string;
  title: string;
  /** Italic serif word(s) appended after the title, e.g. "collection". */
  accent?: string;
  description?: ReactNode;
  breadcrumbs?: Crumb[];
  /** Up to 3 image URLs shown as a floating collage; gaps are filled with atelier photography. */
  images?: string[];
  chips?: string[];
  children?: ReactNode;
}

const FALLBACK_IMAGES = [craft2, craft1, craft4, craft3];

// Card positions for the floating collage (large centre card + two satellites).
const CARD_STYLES = [
  "left-[16%] top-[10%] z-20 w-[56%] rotate-[-4deg]",
  "right-[2%] top-[4%] z-10 w-[36%] rotate-[6deg]",
  "right-[8%] bottom-[4%] z-30 w-[40%] rotate-[3deg]",
];

// Mobile: a fanned hand of three cards, centre card on top.
const MOBILE_CARD_STYLES = [
  "left-1/2 top-2 z-20 w-[46%] -translate-x-1/2",
  "left-[4%] top-8 z-10 w-[38%] -rotate-[8deg]",
  "right-[4%] top-8 z-10 w-[38%] rotate-[8deg]",
];

// A collage photo: served resized through the image CDN and faded in once loaded,
// over a soft placeholder so slow connections never see an empty white card.
const HeroImg = ({ src, onFail }: { src: string; onFail: () => void }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="aspect-square w-full bg-gradient-to-br from-secondary to-brand-light">
      <img
        src={cdnImg(src, { width: 800, height: 800, quality: 85 })}
        alt=""
        className={cn("h-full w-full object-cover transition-opacity duration-700", loaded ? "opacity-100" : "opacity-0")}
        loading="eager"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={onFail}
      />
    </div>
  );
};

// A large diamond outline that slowly rotates behind the collage.
const DiamondOutline = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={cn("absolute inset-0 m-auto animate-[spin_60s_linear_infinite] text-brand/15", className)} fill="none" stroke="currentColor" strokeWidth="0.6" aria-hidden>
    <path d="M100 8 L192 100 L100 192 L8 100 Z" />
    <path d="M100 38 L162 100 L100 162 L38 100 Z" />
    <path d="M8 100 H192 M100 8 V192 M54 54 L146 146 M146 54 L54 146" />
    <circle cx="100" cy="100" r="46" />
  </svg>
);

const CollectionHero = ({ eyebrow, title, accent, description, breadcrumbs, images = [], chips, children }: CollectionHeroProps) => {
  // Images that fail to load (deleted uploads, bad URLs) drop out and a fallback photo takes their slot.
  const [failed, setFailed] = useState<string[]>([]);
  const markFailed = (src: string) => setFailed((prev) => (prev.includes(src) ? prev : [...prev, src]));
  const own = Array.from(new Set(images.filter((src) => src && !failed.includes(src))));
  const collage = [...own, ...FALLBACK_IMAGES.filter((src) => !own.includes(src))].slice(0, 3);
  // Long titles (e.g. country landing headlines) step down a size so they don't fill the whole panel.
  const isLong = title.length + (accent?.length ?? 0) > 28;

  return (
    <section className="container-wide pt-3 md:pt-4">
      <div className="relative isolate grid overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-light via-secondary to-secondary md:rounded-[2rem] lg:grid-cols-[1.05fr_1fr]">
        {/* soft glow blobs */}
        <div className="pointer-events-none absolute -left-24 -top-24 -z-10 h-80 w-80 rounded-full bg-brand/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-1/3 -z-10 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />

        <div className="relative min-w-0 px-5 pb-6 pt-8 sm:px-8 md:px-14 md:py-16 lg:py-20">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-6 md:mb-8">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                {breadcrumbs.map((crumb, i) => (
                  <li key={`${crumb.name}-${i}`} className="flex min-w-0 items-center gap-1.5">
                    {crumb.to ? (
                      <Link to={crumb.to} className="underline-offset-4 hover:underline">
                        {crumb.name}
                      </Link>
                    ) : (
                      <span aria-current="page" className="truncate font-medium text-foreground">
                        {crumb.name}
                      </span>
                    )}
                    {i < breadcrumbs.length - 1 && <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {eyebrow && <p className="eyebrow mb-4 md:mb-5">{eyebrow}</p>}
          <KineticHeading
            className={cn(isLong ? "heading-lg" : "heading-xl", "text-balance break-words")}
            parts={[{ text: title }, ...(accent ? [{ text: accent, accent: true, breakBefore: true }] : [])]}
          />
          {description && (
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground animate-in fade-in slide-in-from-bottom-2 fill-mode-both delay-500 duration-1000 md:mt-6 md:text-lg">
              {description}
            </p>
          )}

          {chips && chips.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2 animate-in fade-in fill-mode-both delay-700 duration-1000 md:mt-8">
              {chips.map((chip) => (
                <li key={chip} className="rounded-full border border-foreground/10 bg-background/70 px-3.5 py-1.5 text-[11px] font-semibold backdrop-blur md:px-4 md:py-2 md:text-xs">
                  {chip}
                </li>
              ))}
            </ul>
          )}

          {children && <div className="mt-7 animate-in fade-in slide-in-from-bottom-2 fill-mode-both delay-1000 duration-1000 md:mt-8">{children}</div>}
        </div>

        {/* Floating collage */}
        <div className="relative hidden min-h-[420px] lg:block">
          <DiamondOutline className="h-[92%] w-[92%]" />
          {collage.map((src, i) => (
            // Three wrappers so rotation, floating and the entrance animation don't override each other's transform.
            <div key={`${src}-${i}`} className={cn("absolute", CARD_STYLES[i])}>
              <div className="animate-float" style={{ animationDelay: `${i * 1.2}s` }}>
                <div
                  className="overflow-hidden rounded-3xl border-[6px] border-background bg-background shadow-[0_30px_60px_-24px_rgba(15,27,51,0.45)] animate-in fade-in zoom-in-90 fill-mode-both duration-1000"
                  style={{ animationDelay: `${300 + i * 200}ms` }}
                >
                  <HeroImg src={src} onFail={() => markFailed(src)} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile / tablet: fanned cards */}
        <div className="relative mx-auto h-[210px] w-full max-w-[420px] sm:h-[260px] lg:hidden" aria-hidden>
          <DiamondOutline className="h-[120%] w-[120%] -translate-y-4" />
          {collage.map((src, i) => (
            <div key={`${src}-m-${i}`} className={cn("absolute", MOBILE_CARD_STYLES[i])}>
              <div className="animate-float" style={{ animationDelay: `${i * 1.2}s` }}>
                <div
                  className="overflow-hidden rounded-2xl border-4 border-background bg-background shadow-[0_20px_40px_-18px_rgba(15,27,51,0.5)] animate-in fade-in zoom-in-90 fill-mode-both duration-1000"
                  style={{ animationDelay: `${200 + i * 150}ms` }}
                >
                  <HeroImg src={src} onFail={() => markFailed(src)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionHero;
