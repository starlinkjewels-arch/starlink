import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import type { Testimonial } from '@/lib/storage';
import { splitTestimonialName } from '@/lib/testimonials';
import { cn } from '@/lib/utils';

const AUTOPLAY_MS = 6000;
const SWIPE_PX = 40;

const cleanQuote = (text: string) => text.trim().replace(/^["“”'‘’]+|["“”'‘’]+$/g, '');

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

const AVATAR_TINTS = [
  'bg-brand/10 text-brand',
  'bg-rose-500/10 text-rose-700 dark:text-rose-300',
  'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  'bg-sky-500/10 text-sky-700 dark:text-sky-300',
];

const tintFor = (name: string) => AVATAR_TINTS[[...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % AVATAR_TINTS.length];

/** Signed distance from the active slide, wrapping around, so the ring has no ends. */
const offsetOf = (i: number, active: number, n: number) => {
  let d = (i - active) % n;
  if (d > n / 2) d -= n;
  if (d < -n / 2) d += n;
  return d;
};

// Google's four-colour "G", shown only on reviews an admin marked as copied from the
// Google profile (Testimonial.source), so the badge never claims a source it doesn't have.
const GoogleG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

// Centre-focused review carousel: the active card sits in front, its neighbours peek out
// blurred on either side. All cards stay in the DOM, so every review is readable text,
// not only the one on screen. Swipe on touch, arrows or keyboard elsewhere; it advances
// on its own unless the visitor is hovering, focused inside, or asked for reduced motion.
const TestimonialCarousel = ({ items }: { items: Testimonial[] }) => {
  const n = items.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragStart = useRef<number | null>(null);
  const swiped = useRef(false);

  const go = useCallback((i: number) => setActive(((i % n) + n) % n), [n]);
  const next = useCallback(() => go(active + 1), [active, go]);
  const prev = useCallback(() => go(active - 1), [active, go]);

  useEffect(() => {
    if (paused || n < 2 || prefersReducedMotion()) return;
    const id = window.setTimeout(() => {
      if (!document.hidden) next();
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [active, paused, n, next]);

  if (n === 0) return null;

  const onPointerDown = (e: PointerEvent) => {
    dragStart.current = e.clientX;
    swiped.current = false;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (dragStart.current === null) return;
    const dx = e.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(dx) < SWIPE_PX) return;
    swiped.current = true;
    if (dx < 0) next();
    else prev();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  };

  const current = splitTestimonialName(items[active].name);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Client reviews"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKeyDown}
    >
      <div
        className="-mx-4 grid touch-pan-y select-none overflow-hidden px-4 py-8 [--shift:90%] [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] sm:-mx-6 sm:px-6 sm:[--shift:74%] lg:mx-0 lg:px-0 lg:[--shift:80%]"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (dragStart.current = null)}
      >
        {items.map((t, i) => {
          const offset = offsetOf(i, active, n);
          const depth = Math.abs(offset);
          const isActive = offset === 0;
          // Cards further than one step away park just off-stage, so they slide in rather
          // than flying across the whole row.
          const pos = Math.max(-2, Math.min(2, offset));
          const { name, place } = splitTestimonialName(t.name);
          const fromGoogle = t.source === 'google';
          return (
            <figure
              key={t.id}
              aria-hidden={!isActive}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}`}
              onClick={() => {
                if (!isActive && !swiped.current) go(i);
              }}
              className={cn(
                'col-start-1 row-start-1 mx-auto flex w-[86%] max-w-[600px] flex-col rounded-[28px] border bg-card p-6 transition-[transform,opacity,filter,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:w-[64%] sm:p-9 lg:w-[46%]',
                isActive ? 'border-transparent shadow-[0_30px_70px_-34px_hsl(var(--brand)/0.55)]' : 'cursor-pointer shadow-sm',
                depth > 1 && 'pointer-events-none'
              )}
              style={{
                transform: `translateX(calc(var(--shift) * ${pos})) scale(${isActive ? 1 : 0.9})`,
                filter: isActive ? 'none' : 'blur(3px)',
                opacity: isActive ? 1 : depth === 1 ? 0.5 : 0,
                zIndex: 10 - depth,
                background: isActive
                  ? 'linear-gradient(hsl(var(--card)), hsl(var(--card))) padding-box, linear-gradient(135deg, hsl(var(--brand) / 0.7), hsl(var(--brand) / 0.12) 55%, hsl(var(--brand) / 0.45)) border-box'
                  : undefined,
              }}
            >
              <Quote className="h-7 w-7 text-brand/35" strokeWidth={1.2} aria-hidden />
              <blockquote className="mt-4 flex-1 text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl md:leading-relaxed">
                {cleanQuote(t.text)}
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-4 border-t pt-6">
                <span
                  className={cn('relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold sm:h-14 sm:w-14 sm:text-base', tintFor(name))}
                  aria-hidden
                >
                  {initials(name)}
                  {fromGoogle && (
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm ring-2 ring-card">
                      <GoogleG className="h-3.5 w-3.5" />
                    </span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-base font-semibold text-foreground sm:text-lg">{name}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex gap-0.5" role="img" aria-label={`${t.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className={cn('h-4 w-4', s < t.rating ? 'fill-amber-400 text-amber-400' : 'text-border')} />
                      ))}
                    </span>
                    {fromGoogle ? (
                      <span className="inline-flex items-center gap-1.5">
                        <GoogleG className="h-3.5 w-3.5" />
                        Google
                      </span>
                    ) : (
                      place && <span className="truncate">{place}</span>
                    )}
                  </span>
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>

      {n > 1 && (
        <div className="mt-2 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous review"
            className="flex h-14 w-14 items-center justify-center rounded-full border bg-background transition-colors hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <span className="min-w-[3.5rem] text-center text-sm tabular-nums text-muted-foreground" aria-hidden>
            {active + 1} / {n}
          </span>
          <button
            type="button"
            onClick={next}
            aria-label="Next review"
            className="flex h-14 w-14 items-center justify-center rounded-full border bg-background transition-colors hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      )}
      {/* Announce slide changes the visitor made; stay quiet while it rotates on its own. */}
      <p className="sr-only" aria-live={paused ? 'polite' : 'off'}>
        Review {active + 1} of {n}, from {current.name}
      </p>
    </div>
  );
};

export default TestimonialCarousel;
