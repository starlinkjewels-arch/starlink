import { useEffect, useRef, useState } from "react";

// Animates the leading number in a value like "30+" or "12K+" when it scrolls into view.
// Values without a leading number ("IGI · GIA") render unchanged.
const CountUp = ({ value, duration = 1600 }: { value: string; duration?: number }) => {
  // Years ("2011") read wrong when counted up, so only animate quantities.
  const isYear = /^(19|20)\d{2}$/.test(value);
  const match = isYear ? null : value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  const target = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : "";
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(match ? 0 : null);

  useEffect(() => {
    if (!match || !ref.current) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      setDisplay(target);
      return;
    }
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(Math.round(target * eased));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return <span ref={ref}>{match ? `${display}${suffix}` : value}</span>;
};

export default CountUp;
