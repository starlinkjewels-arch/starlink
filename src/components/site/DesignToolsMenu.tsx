import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Gem, Rotate3d } from "lucide-react";
import { SITE } from "@/lib/seo";
import { cn } from "@/lib/utils";

const tools = [
  { ...SITE.ringBuilder, icon: Gem },
  { ...SITE.viewer360, icon: Rotate3d },
];

// Header dropdown for the external design tools (Ring Builder + 360° viewer).
// Opens on hover (desktop) or click/tap, closes on outside click, Escape or mouse leave.
const DesignToolsMenu = ({ className }: { className?: string }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<number | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  // Small delay so moving the pointer from the button into the panel doesn't close it.
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  useEffect(() => cancelClose, []);

  return (
    <div
      ref={wrapperRef}
      className={cn("relative", className)}
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#17305f] via-brand to-[#17305f] bg-[length:200%_100%] bg-left px-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_8px_20px_-8px_rgba(43,89,168,0.6)] transition-[background-position,box-shadow] duration-500 hover:bg-right hover:shadow-[0_10px_24px_-8px_rgba(43,89,168,0.8)]"
      >
        <Gem className="h-4 w-4" />
        Ring Builder / 360°
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")} />
      </button>

      <div
        role="menu"
        className={cn(
          "absolute right-0 top-full z-50 w-[300px] pt-3 transition-all duration-200",
          open ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-1 opacity-0"
        )}
      >
        <div className="overflow-hidden rounded-3xl border bg-popover p-2 shadow-[0_30px_60px_-20px_rgba(15,27,51,0.35)]">
          {tools.map(({ url, label, description, title, icon: Icon }) => (
            // Own subdomains: keep the referrer (no "noreferrer") so analytics attribute visits from the main site.
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener"
              title={title}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="group flex items-center gap-3.5 rounded-2xl p-3 transition-colors hover:bg-secondary"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-[#17305f] text-white shadow-md transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{label}</span>
                <span className="block text-xs text-muted-foreground">{description}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DesignToolsMenu;
