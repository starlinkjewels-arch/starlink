import { cn } from "@/lib/utils";

// Infinite scrolling ribbon of large words separated by diamond glyphs. Pauses on hover.
const Marquee = ({ items, className }: { items: string[]; className?: string }) => {
  const row = (
    <div className="flex shrink-0 items-center" aria-hidden>
      {items.map((item) => (
        <span key={item} className="flex items-center">
          <span className="px-4 font-display text-xl font-semibold tracking-tight md:px-7 md:text-3xl">{item}</span>
          <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0 text-brand md:h-4 md:w-4" fill="currentColor">
            <path d="M12 2 22 12 12 22 2 12Z" />
          </svg>
        </span>
      ))}
    </div>
  );

  return (
    <div className={cn("group overflow-hidden py-4 md:py-6", className)} role="presentation">
      <div className="animate-marquee whitespace-nowrap group-hover:pause">
        {row}
        {row}
      </div>
    </div>
  );
};

export default Marquee;
