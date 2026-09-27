import { useEffect, useRef, useState } from "react";
import { Gem, Pause, Play, Rotate3d } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { SITE } from "@/lib/seo";
import { cn } from "@/lib/utils";

const VIDEO_SRC = "/videos/craftsmanship.mp4";
const POSTER_SRC = "/videos/craftsmanship-poster.webp";

// Where each process step starts in the workshop film (seconds), matched to what is on screen:
// sketching & stones, CAD print and wax models, casting & setting, finishing.
const STEP_STARTS = [0, 6, 15, 20];

interface CraftStoryProps {
  consultHref: string;
}

// Bespoke / savoir-faire section: the workshop film in an arched window, driving an editorial 4-chapter list.
const CraftStory = ({ consultHref }: CraftStoryProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const durationRef = useRef(22.9);
  const userPausedRef = useRef(false);
  const visibleRef = useRef(false);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loadVideo, setLoadVideo] = useState(false);

  const stepAt = (t: number) => STEP_STARTS.reduce((acc, start, i) => (t >= start ? i : acc), 0);

  // Paints every step's progress for time t directly on the DOM (called every frame while playing).
  const paint = (t: number) => {
    const current = stepAt(t);
    STEP_STARTS.forEach((start, i) => {
      const end = STEP_STARTS[i + 1] ?? durationRef.current;
      const p = i < current ? 1 : i > current ? 0 : Math.min(1, Math.max(0, (t - start) / (end - start)));
      const transform = `scaleX(${p})`;
      const fill = fillRefs.current[i];
      if (fill) fill.style.transform = transform;
    });
    setActive((prev) => (prev === current ? prev : current));
  };

  const reduceMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Attach the film well before the section scrolls in, so it has buffered by the time it is seen.
  useEffect(() => {
    const node = cardRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setLoadVideo(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: "1000px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Play while on screen, pause when scrolled away (saves battery and data).
  useEffect(() => {
    const node = cardRef.current;
    if (!node || !loadVideo || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        visibleRef.current = entry.isIntersecting;
        if (!video) return;
        if (entry.isIntersecting) {
          if (!userPausedRef.current && !reduceMotion && video.paused) video.play().catch(() => {});
        } else if (!video.paused) {
          video.pause();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadVideo, reduceMotion]);

  // Smooth progress while playing, without re-rendering the section each frame.
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const tick = () => {
      const video = videoRef.current;
      if (video) paint(video.currentTime);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  // iOS Safari only autoplays when the muted *attribute* is present, and React sets just the property.
  // Mark the element muted before the source is attached, then start as soon as it can play.
  const attachVideo = (el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute("muted", "");
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");
  };

  const startIfVisible = (video: HTMLVideoElement) => {
    if (visibleRef.current && !userPausedRef.current && !reduceMotion && video.paused) video.play().catch(() => {});
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPausedRef.current = false;
      video.play().catch(() => {});
    } else {
      userPausedRef.current = true;
      video.pause();
    }
  };

  const jumpTo = (i: number) => {
    const video = videoRef.current;
    paint(STEP_STARTS[i]);
    if (!video) return;
    video.currentTime = STEP_STARTS[i] + 0.05;
    if (video.paused && !userPausedRef.current) video.play().catch(() => {});
  };

  return (
    <section className="relative isolate overflow-hidden bg-[#0b0b0d] py-16 text-white md:py-24">
      {/* Warm gold glow + fine grain, like a jeweller's display case */}
      <div className="pointer-events-none absolute -left-40 top-1/4 -z-10 h-[520px] w-[520px] rounded-full bg-gold/20 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 -z-10 h-[420px] w-[420px] rounded-full bg-brand/25 blur-[140px]" />
      <div className="pattern-lattice pointer-events-none absolute inset-0 -z-10 opacity-[0.06]" />

      <div className="container-wide grid items-center gap-12 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-20 xl:gap-28">
        {/* Arched film window */}
        <div ref={cardRef} className="relative mx-auto w-full max-w-[360px] lg:max-w-[420px]">
          <div className="relative aspect-[3/4.6] overflow-hidden rounded-b-[2rem] rounded-t-[999px] border border-gold/30 bg-black shadow-[0_60px_120px_-40px_rgba(201,164,92,0.35)]">
            <video
              ref={attachVideo}
              src={loadVideo ? VIDEO_SRC : undefined}
              poster={POSTER_SRC}
              muted
              loop
              playsInline
              autoPlay={!reduceMotion}
              preload={loadVideo ? "auto" : "none"}
              disablePictureInPicture
              className="h-full w-full object-cover"
              aria-label="Inside the Starlink Jewels workshop: sketching, CAD, casting, stone setting and finishing"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onLoadedMetadata={(e) => {
                durationRef.current = e.currentTarget.duration || 22.9;
              }}
              onSeeked={(e) => paint(e.currentTarget.currentTime)}
              onCanPlay={(e) => startIfVisible(e.currentTarget)}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            {/* inner hairline frame */}
            <div className="pointer-events-none absolute inset-3 rounded-b-[1.5rem] rounded-t-[999px] border border-white/15" />

            {/* current step caption */}
            <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-3">
              <div key={active} className="min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">Chapter {BRAND.process[active]?.step}</p>
                <p className="mt-1 font-serif text-2xl italic leading-tight">{BRAND.process[active]?.title}</p>
              </div>
              <button
                type="button"
                onClick={togglePlay}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition hover:bg-white hover:text-black"
                aria-label={playing ? "Pause video" : "Play video"}
              >
                {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 translate-x-px fill-current" />}
              </button>
            </div>
          </div>

          {/* Rotating seal overlapping the arch */}
          <div className="absolute -right-1 top-10 h-24 w-24 sm:-right-8 sm:h-28 sm:w-28 md:h-32 md:w-32" aria-hidden>
            <svg viewBox="0 0 120 120" className="h-full w-full animate-[spin_24s_linear_infinite]">
              <defs>
                <path id="craft-seal" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
              </defs>
              <circle cx="60" cy="60" r="58" fill="#0b0b0d" stroke="hsl(var(--gold))" strokeOpacity="0.5" />
              <text fill="hsl(var(--gold))" fontSize="10.5" letterSpacing="3.2" fontWeight="600">
                <textPath href="#craft-seal">HANDCRAFTED IN SURAT • SINCE 2011 •</textPath>
              </text>
            </svg>
            <span className="absolute inset-0 m-auto flex h-10 w-10 items-center justify-center rounded-full bg-gold text-[#0b0b0d]">
              <Gem className="h-5 w-5" strokeWidth={1.8} />
            </span>
          </div>
        </div>

        {/* Editorial copy + chapters */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Savoir-faire · Bespoke</p>
          <h2 className="mt-5 font-display text-[2.6rem] font-semibold leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            From sketch
            <br />
            to <span className="font-serif font-normal italic text-gold">sparkle.</span>
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/65 md:text-lg">
            Every Starlink piece passes through the hands of our Surat artisans. Watch one come to life, then design your own.
          </p>

          <ol className="mt-10 border-t border-white/10">
            {BRAND.process.map((step, i) => {
              const isActive = i === active;
              return (
                <li key={step.step} className="relative border-b border-white/10">
                  <button
                    type="button"
                    onClick={() => jumpTo(i)}
                    aria-current={isActive ? "step" : undefined}
                    className="group grid w-full grid-cols-[3.25rem_1fr] items-start gap-x-4 py-5 text-left md:grid-cols-[4.5rem_1fr] md:py-6"
                  >
                    <span
                      className={cn(
                        "font-serif text-4xl italic leading-none transition-colors duration-500 md:text-5xl",
                        isActive ? "text-gold" : "text-white/20 group-hover:text-white/40"
                      )}
                    >
                      {step.step}
                    </span>
                    <span>
                      <span className={cn("block font-display text-lg font-semibold tracking-tight transition-colors md:text-xl", isActive ? "text-white" : "text-white/55")}>
                        {step.title}
                      </span>
                      <span
                        className={cn(
                          "grid transition-all duration-500",
                          isActive ? "mt-1.5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        )}
                      >
                        <span className="overflow-hidden text-sm leading-relaxed text-white/60">{step.text}</span>
                      </span>
                    </span>
                  </button>
                  {/* gold progress hairline */}
                  <span className="pointer-events-none absolute inset-x-0 -bottom-px h-px">
                    <span
                      ref={(el) => (fillRefs.current[i] = el)}
                      className="block h-full origin-left bg-gold will-change-transform"
                      style={{ transform: "scaleX(0)" }}
                    />
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="mt-10 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
            <Button asChild size="xl" className="bg-gold px-3 text-[13px] text-[#0b0b0d] hover:bg-gold/90 sm:px-7 sm:text-[15px]">
              <a href={SITE.ringBuilder.url} target="_blank" rel="noopener" title={SITE.ringBuilder.title}>
                <Gem /> {SITE.ringBuilder.label}
              </a>
            </Button>
            <Button asChild variant="outline-light" size="xl" className="px-3 text-[13px] sm:px-7 sm:text-[15px]">
              <a href={SITE.viewer360.url} target="_blank" rel="noopener" title={SITE.viewer360.title}>
                <Rotate3d /> {SITE.viewer360.label}
              </a>
            </Button>
          </div>
          <a
            href={consultHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/75 underline-offset-4 hover:text-white hover:underline"
          >
            <FaWhatsapp className="h-4 w-4 text-[#6ee7a0]" /> Or talk to a designer on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};

export default CraftStory;
