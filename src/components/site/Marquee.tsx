import { cn } from "@/lib/utils";

// Infinite scrolling ribbon of large words separated by diamond glyphs. Pauses on hover.
const Marquee = ({ items, className }: { items: string[]; className?: string }) => {
  const row = (
    <div className="flex shrink-0 items-center" aria-hidden>
      {items.map((item) => (
        <span key={item} className="flex items-center">
          <span className="px-6 font-display text-4xl font-semibold tracking-tight md:px-10 md:text-6xl">{item}</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-brand md:h-7 md:w-7" fill="currentColor">
            <path d="M12 2 22 12 12 22 2 12Z" />
          </svg>
        </span>
      ))}
    </div>
  );

  return (
    <div className={cn("group overflow-hidden py-8 md:py-12", className)} role="presentation">
      <div className="animate-marquee whitespace-nowrap group-hover:pause">
        {row}
        {row}
      </div>
    </div>
  );
};

export default Marquee;
