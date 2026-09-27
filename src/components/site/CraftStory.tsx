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

// Bespoke section: a story-style workshop film whose progress drives the 4-step process list.
const CraftStory = ({ consultHref }: CraftStoryProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const durationRef = useRef(22.9);
  const userPausedRef = useRef(false);
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
      const bar = barRefs.current[i];
      const fill = fillRefs.current[i];
      if (bar) bar.style.transform = transform;
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
    <section className="section">
      <div className="container-wide">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#0b1630] px-5 py-10 text-white sm:px-8 md:px-12 md:py-14 lg:px-14">
          {/* Ambient backdrop: the film itself, heavily blurred, behind a navy wash */}
          <img src={POSTER_SRC} alt="" aria-hidden className="pointer-events-none absolute inset-0 -z-20 h-full w-full scale-110 object-cover opacity-40 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#0b1630]/95 via-[#132a57]/90 to-brand/80" />
          <div className="pattern-lattice pointer-events-none absolute inset-0 -z-10 opacity-10" />

          <div className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,360px)_1fr] lg:gap-12 xl:gap-16">
            {/* Copy + actions */}
            <div className="lg:order-1">
              <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-white/70" /> Bespoke · made in Surat
              </p>
              <h2 className="heading-lg text-balance">
                From sketch to <em className="accent text-white">sparkle</em>
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/75 md:text-lg">
                Watch a piece come to life in our workshop. Design your own ring online, or share an idea and our artisans will craft it for you.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
                <Button asChild variant="light" size="xl" className="px-3 text-[13px] sm:px-7 sm:text-[15px]">
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
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/85 underline-offset-4 hover:text-white hover:underline"
              >
                <FaWhatsapp className="h-4 w-4 text-[#6ee7a0]" /> Or talk to a designer on WhatsApp
              </a>
            </div>

            {/* Story-style film card */}
            <div ref={cardRef} className="mx-auto w-full max-w-[340px] lg:order-2 lg:max-w-none">
              <div className="relative aspect-[9/16] max-h-[78vh] overflow-hidden rounded-[1.75rem] border border-white/15 bg-black shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
                <video
                  ref={videoRef}
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
                />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/75 to-transparent" />

                {/* Story progress bars, one per step */}
                <div className="absolute inset-x-3 top-3 flex gap-1.5">
                  {STEP_STARTS.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => jumpTo(i)}
                      className="h-1 flex-1 overflow-hidden rounded-full bg-white/25"
                      aria-label={`Jump to step ${i + 1}: ${BRAND.process[i]?.title}`}
                    >
                      <span
                        ref={(el) => (barRefs.current[i] = el)}
                        className="block h-full origin-left rounded-full bg-white will-change-transform"
                        style={{ transform: "scaleX(0)" }}
                      />
                    </button>
                  ))}
                </div>

                <span className="absolute left-3 top-7 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[11px] font-semibold backdrop-blur-md">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                  </span>
                  Inside our Surat workshop
                </span>

                {/* Current step caption */}
                <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                  <div key={active} className="min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">Step {BRAND.process[active]?.step}</p>
                    <p className="mt-0.5 font-display text-xl font-semibold leading-tight">{BRAND.process[active]?.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-lg backdrop-blur transition hover:scale-105"
                    aria-label={playing ? "Pause video" : "Play video"}
                  >
                    {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 translate-x-px fill-current" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Process timeline, synced with the film */}
            <ol className="relative grid grid-cols-2 gap-3 lg:order-3 lg:grid-cols-1 lg:gap-2">
              {BRAND.process.map((step, i) => {
                const isActive = i === active;
                return (
                  <li key={step.step}>
                    <button
                      type="button"
                      onClick={() => jumpTo(i)}
                      aria-current={isActive ? "step" : undefined}
                      className={cn(
                        "group relative h-full w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-500 md:p-5",
                        isActive ? "border-white/35 bg-white/[0.14] shadow-[0_20px_40px_-24px_rgba(0,0,0,0.6)]" : "border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.08]"
                      )}
                    >
                      {/* progress fill along the bottom edge */}
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white/10">
                        <span
                          ref={(el) => (fillRefs.current[i] = el)}
                          className="block h-full origin-left bg-white/80 will-change-transform"
                          style={{ transform: "scaleX(0)" }}
                        />
                      </span>
                      <span className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-xs font-semibold transition-colors",
                            isActive ? "bg-white text-[#0b1630]" : "bg-white/10 text-white/70"
                          )}
                        >
                          {step.step}
                        </span>
                        <span className={cn("font-sans text-sm font-semibold transition-colors md:text-base", isActive ? "text-white" : "text-white/80")}>
                          {step.title}
                        </span>
                      </span>
                      <span className={cn("mt-2 block text-xs leading-relaxed transition-colors md:text-[13px]", isActive ? "text-white/80" : "text-white/55")}>
                        {step.text}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CraftStory;
