import { useCallback, useEffect, useRef, useState } from "react";
import { Accessibility, AArrowDown, AArrowUp, Contrast, Type, Volume2, Square, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface A11ySettings {
  textScale: number;
  highContrast: boolean;
  readableFont: boolean;
}

const STORAGE_KEY = "starlink_a11y";
const DEFAULTS: A11ySettings = { textScale: 100, highContrast: false, readableFont: false };
const MIN_SCALE = 80;
const MAX_SCALE = 150;
const SCALE_STEP = 10;
const READABLE_FONT_HREF = "https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap";

const loadSettings = (): A11ySettings => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
};

const ensureReadableFont = () => {
  if (document.getElementById("a11y-readable-font")) return;
  const link = document.createElement("link");
  link.id = "a11y-readable-font";
  link.rel = "stylesheet";
  link.href = READABLE_FONT_HREF;
  document.head.appendChild(link);
};

// Floating accessibility panel: text size, high contrast, readable font and read-aloud.
// Settings persist per browser and apply site-wide through classes on <html>.
const AccessibilityWidget = () => {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<A11ySettings>(() => (typeof window === "undefined" ? DEFAULTS : loadSettings()));
  const [speaking, setSpeaking] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

  // Apply settings to the document and remember them.
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = settings.textScale === 100 ? "" : `${settings.textScale}%`;
    root.classList.toggle("a11y-contrast", settings.highContrast);
    root.classList.toggle("a11y-readable", settings.readableFont);
    if (settings.readableFont) ensureReadableFont();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // storage unavailable (private mode); settings still apply for this visit
    }
  }, [settings]);

  const stopSpeaking = useCallback(() => {
    if (canSpeak) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [canSpeak]);

  // Stop reading when the widget unmounts (e.g. navigating away).
  useEffect(() => stopSpeaking, [stopSpeaking]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const update = (patch: Partial<A11ySettings>) => setSettings((prev) => ({ ...prev, ...patch }));

  const toggleSpeech = () => {
    if (!canSpeak) return;
    if (speaking) {
      stopSpeaking();
      return;
    }
    const text = (document.querySelector("main") as HTMLElement | null)?.innerText.replace(/\s+/g, " ").trim();
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 12000));
    utterance.lang = document.documentElement.lang || "en";
    utterance.rate = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const reset = () => {
    stopSpeaking();
    setSettings(DEFAULTS);
  };

  const isModified = settings.textScale !== 100 || settings.highContrast || settings.readableFont || speaking;

  return (
    <div ref={panelRef} className="fixed left-0 top-1/2 z-[60] -translate-y-1/2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="a11y-panel"
        aria-label="Accessibility options"
        className={cn(
          "flex flex-col items-center gap-2 rounded-r-2xl bg-gradient-to-b from-brand to-[#17305f] px-2.5 py-4 text-white shadow-[0_8px_20px_-8px_rgba(43,89,168,0.6)] transition-all hover:pl-4",
          open && "pl-4"
        )}
      >
        <Accessibility className="h-5 w-5" />
        <span className="text-[10px] font-bold tracking-[0.2em] [writing-mode:vertical-rl] rotate-180">A11Y</span>
      </button>

      {open && (
        <div
          id="a11y-panel"
          role="dialog"
          aria-label="Accessibility options"
          className="absolute left-14 top-1/2 w-[272px] -translate-y-1/2 rounded-3xl border bg-background/95 p-5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl animate-in fade-in slide-in-from-left-2 duration-200"
        >
          <div className="mb-5 flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-semibold text-brand">
              <Accessibility className="h-4 w-4" /> Accessibility
            </p>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Close accessibility options">
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Text size</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => update({ textScale: Math.max(MIN_SCALE, settings.textScale - SCALE_STEP) })}
              disabled={settings.textScale <= MIN_SCALE}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition hover:bg-secondary disabled:opacity-40"
              aria-label="Decrease text size"
            >
              <AArrowDown className="h-4 w-4" /> A−
            </button>
            <button
              type="button"
              onClick={() => update({ textScale: Math.min(MAX_SCALE, settings.textScale + SCALE_STEP) })}
              disabled={settings.textScale >= MAX_SCALE}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition hover:bg-secondary disabled:opacity-40"
              aria-label="Increase text size"
            >
              <AArrowUp className="h-4 w-4" /> A+
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground" aria-live="polite">
            {settings.textScale}%
          </p>

          <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Display</p>
          <div className="space-y-2">
            <ToggleRow icon={Contrast} label="High contrast" active={settings.highContrast} onClick={() => update({ highContrast: !settings.highContrast })} />
            <ToggleRow icon={Type} label="Dyslexia-friendly font" active={settings.readableFont} onClick={() => update({ readableFont: !settings.readableFont })} />
          </div>

          {canSpeak && (
            <>
              <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Audio</p>
              <ToggleRow icon={speaking ? Square : Volume2} label={speaking ? "Stop reading" : "Listen to page"} active={speaking} onClick={toggleSpeech} />
            </>
          )}

          <button
            type="button"
            onClick={reset}
            disabled={!isModified}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-medium text-muted-foreground transition hover:bg-secondary disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" /> Reset all
          </button>
        </div>
      )}
    </div>
  );
};

const ToggleRow = ({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Contrast;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "flex h-11 w-full items-center gap-3 rounded-xl border px-3.5 text-sm font-medium transition",
      active ? "border-brand bg-brand-light text-brand" : "hover:bg-secondary"
    )}
  >
    <Icon className="h-4 w-4" />
    {label}
    <span className={cn("ml-auto h-2 w-2 rounded-full", active ? "bg-brand" : "bg-border")} aria-hidden />
  </button>
);

export default AccessibilityWidget;
