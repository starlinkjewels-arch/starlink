import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import KineticHeading from "@/components/site/KineticHeading";
import { cn } from "@/lib/utils";

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
  /** Up to 3 image URLs shown as a floating collage. */
  images: string[];
  chips?: string[];
  children?: ReactNode;
}

// Card positions for the floating collage (large centre card + two satellites).
const CARD_STYLES = [
  "left-[16%] top-[10%] z-20 w-[56%] rotate-[-4deg]",
  "right-[2%] top-[4%] z-10 w-[36%] rotate-[6deg]",
  "right-[8%] bottom-[4%] z-30 w-[40%] rotate-[3deg]",
];

// A large diamond outline that slowly rotates behind the collage.
const DiamondOutline = () => (
  <svg viewBox="0 0 200 200" className="absolute inset-0 m-auto h-[92%] w-[92%] animate-[spin_60s_linear_infinite] text-brand/15" fill="none" stroke="currentColor" strokeWidth="0.6" aria-hidden>
    <path d="M100 8 L192 100 L100 192 L8 100 Z" />
    <path d="M100 38 L162 100 L100 162 L38 100 Z" />
    <path d="M8 100 H192 M100 8 V192 M54 54 L146 146 M146 54 L54 146" />
    <circle cx="100" cy="100" r="46" />
  </svg>
);

const CollectionHero = ({ eyebrow, title, accent, description, breadcrumbs, images, chips, children }: CollectionHeroProps) => {
  const collage = images.filter(Boolean).slice(0, 3);

  return (
    <section className="container-wide pt-4">
      <div className="relative isolate grid overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-light via-secondary to-secondary lg:grid-cols-[1.05fr_1fr]">
        {/* soft glow blobs */}
        <div className="pointer-events-none absolute -left-24 -top-24 -z-10 h-80 w-80 rounded-full bg-brand/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-1/3 -z-10 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />

        <div className="relative px-6 py-12 md:px-14 md:py-16 lg:py-20">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                {breadcrumbs.map((crumb, i) => (
                  <li key={`${crumb.name}-${i}`} className="flex items-center gap-1.5">
                    {crumb.to ? (
                      <Link to={crumb.to} className="underline-offset-4 hover:underline">
                        {crumb.name}
                      </Link>
                    ) : (
                      <span aria-current="page" className="font-medium text-foreground">
                        {crumb.name}
                      </span>
                    )}
                    {i < breadcrumbs.length - 1 && <ChevronRight className="h-3 w-3 opacity-60" />}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
          <KineticHeading
            className="heading-xl text-balance"
            parts={[{ text: title }, ...(accent ? [{ text: accent, accent: true, breakBefore: true }] : [])]}
          />
          {description && (
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground animate-in fade-in slide-in-from-bottom-2 fill-mode-both delay-500 duration-1000 md:text-lg">
              {description}
            </p>
          )}

          {chips && chips.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2 animate-in fade-in fill-mode-both delay-700 duration-1000">
              {chips.map((chip) => (
                <li key={chip} className="rounded-full border border-foreground/10 bg-background/70 px-4 py-2 text-xs font-semibold backdrop-blur">
                  {chip}
                </li>
              ))}
            </ul>
          )}

          {children && <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 fill-mode-both delay-1000 duration-1000">{children}</div>}
        </div>

        {/* Floating collage */}
        <div className="relative hidden min-h-[420px] lg:block">
          <DiamondOutline />
          {collage.map((src, i) => (
            // Three wrappers so rotation, floating and the entrance animation don't override each other's transform.
            <div key={`${src}-${i}`} className={cn("absolute", CARD_STYLES[i])}>
              <div className="animate-float" style={{ animationDelay: `${i * 1.2}s` }}>
                <div
                  className="overflow-hidden rounded-3xl border-[6px] border-background bg-background shadow-[0_30px_60px_-24px_rgba(15,27,51,0.45)] animate-in fade-in zoom-in-90 fill-mode-both duration-1000"
                  style={{ animationDelay: `${300 + i * 200}ms` }}
                >
                  <img src={src} alt="" className="aspect-square w-full object-cover" loading="eager" decoding="async" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: compact strip of images */}
        {collage.length > 0 && (
          <div className="flex gap-3 px-6 pb-8 lg:hidden">
            {collage.map((src, i) => (
              <div key={`${src}-m-${i}`} className={cn("w-1/3 overflow-hidden rounded-2xl border-4 border-background shadow-lg", i === 1 && "translate-y-3")}>
                <img src={src} alt="" className="aspect-square w-full object-cover" loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CollectionHero;
