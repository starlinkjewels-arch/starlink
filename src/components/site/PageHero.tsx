import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Crumb {
  name: string;
  to?: string;
}

interface PageHeroProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: Crumb[];
  image?: string;
  children?: ReactNode;
  className?: string;
}

// Header block for inner pages: a rounded panel inset from the page edges.
// With an image it becomes a photo banner, otherwise a soft grey panel.
const PageHero = ({ eyebrow, title, description, breadcrumbs, image, children, className }: PageHeroProps) => {
  const onImage = Boolean(image);

  const crumbs = breadcrumbs && breadcrumbs.length > 0 && (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className={cn("flex flex-wrap items-center gap-1.5 text-xs", onImage ? "text-white/75" : "text-muted-foreground")}>
        {breadcrumbs.map((crumb, i) => (
          <li key={`${crumb.name}-${i}`} className="flex items-center gap-1.5">
            {crumb.to ? (
              <Link to={crumb.to} className="underline-offset-4 hover:underline">
                {crumb.name}
              </Link>
            ) : (
              <span aria-current="page" className={onImage ? "text-white" : "font-medium text-foreground"}>
                {crumb.name}
              </span>
            )}
            {i < breadcrumbs.length - 1 && <ChevronRight className="h-3 w-3 opacity-60" />}
          </li>
        ))}
      </ol>
    </nav>
  );

  const content = (
    <div className="relative animate-in fade-in slide-in-from-bottom-3 duration-1000">
      {crumbs}
      {eyebrow && <p className={cn("eyebrow mb-4", onImage && "!text-white/85")}>{eyebrow}</p>}
      <h1 className="heading-xl max-w-4xl text-balance">{title}</h1>
      {description && (
        <p className={cn("mt-6 max-w-2xl text-base leading-relaxed md:text-lg", onImage ? "text-white/85" : "text-muted-foreground")}>{description}</p>
      )}
      {children}
    </div>
  );

  if (image) {
    return (
      <section className={cn("container-wide pt-4", className)}>
        <div className="clip-reveal relative isolate flex min-h-[46vh] flex-col justify-end overflow-hidden rounded-[2rem] px-6 py-12 text-white md:min-h-[56vh] md:px-14 md:py-16">
          <img src={image} alt="" className="animate-hero-zoom absolute inset-0 -z-10 h-full w-full object-cover" loading="eager" decoding="async" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
          {content}
        </div>
      </section>
    );
  }

  return (
    <section className={cn("container-wide pt-4", className)}>
      <div className="relative overflow-hidden rounded-[2rem] bg-secondary px-6 py-12 md:px-14 md:py-20">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
        {content}
      </div>
    </section>
  );
};

export default PageHero;
