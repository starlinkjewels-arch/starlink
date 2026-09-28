import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CONSENT_VERSION, getConsent, setConsent } from "@/lib/consent";
import { recordConsent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  {
    key: "necessary",
    title: "Strictly necessary",
    text: "Keep the site working: your cookie choice, accessibility settings, theme and a short-lived page cache. Always on.",
    locked: true,
  },
  {
    key: "analytics",
    title: "Analytics",
    text: "Help us understand how the site is used: pages and pieces viewed, enquiry clicks, device, browser and approximate location (from your IP address, or your device location if you allow it). Uses Google Analytics and our own visit log.",
    locked: false,
  },
  {
    key: "marketing",
    title: "Marketing",
    text: "Let Google measure our ads and show you relevant Starlink ads on other sites.",
    locked: false,
  },
] as const;

// GDPR / ePrivacy-style banner: nothing optional runs until the visitor chooses, and "Reject all"
// is as easy as "Accept all". Reopened from the footer "Cookie settings" link.
const CookieBanner = () => {
  const [open, setOpen] = useState(false);
  const [customising, setCustomising] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    // Show after first paint so the banner never delays the page itself.
    const id = window.setTimeout(() => {
      if (!getConsent()) setOpen(true);
    }, 1200);
    const reopen = () => {
      const current = getConsent();
      setAnalytics(Boolean(current?.analytics));
      setMarketing(Boolean(current?.marketing));
      setCustomising(true);
      setOpen(true);
    };
    window.addEventListener("sj:open-cookie-settings", reopen);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("sj:open-cookie-settings", reopen);
    };
  }, []);

  const choose = (choice: { analytics: boolean; marketing: boolean }) => {
    setConsent(choice);
    void recordConsent({ ...choice, version: CONSENT_VERSION });
    setOpen(false);
    setCustomising(false);
  };

  if (!open) return null;

  return (
    <div
      id="cookie-banner"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-[560px] rounded-3xl border bg-background/95 p-5 shadow-[0_30px_80px_-24px_rgba(15,27,51,0.45)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500 sm:bottom-5 md:left-5 md:right-auto md:mx-0 md:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand">
          <Cookie className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="cookie-title" className="font-display text-base font-semibold tracking-tight">
            {customising ? "Cookie settings" : "We value your privacy"}
          </h2>
          {!customising && (
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              We use cookies to run the site and, with your permission, to understand how it is used and improve our ads. You can change this any time.{" "}
              <Link to="/privacy-policy" className="font-medium text-brand underline-offset-4 hover:underline">
                Privacy &amp; cookie policy
              </Link>
            </p>
          )}
        </div>
        {customising && (
          <button type="button" onClick={() => setCustomising(false)} className="rounded-full p-1 text-muted-foreground hover:bg-secondary" aria-label="Back">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {customising && (
        <ul className="mt-4 max-h-[45vh] space-y-3 overflow-y-auto pr-1">
          {CATEGORIES.map((c) => {
            const checked = c.key === "necessary" ? true : c.key === "analytics" ? analytics : marketing;
            const set = c.key === "analytics" ? setAnalytics : setMarketing;
            return (
              <li key={c.key} className="rounded-2xl border p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor={`consent-${c.key}`} className="text-sm font-semibold">
                    {c.title}
                  </label>
                  <Switch
                    id={`consent-${c.key}`}
                    checked={checked}
                    disabled={c.locked}
                    onCheckedChange={(v) => !c.locked && set(Boolean(v))}
                    aria-label={c.title}
                  />
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{c.text}</p>
              </li>
            );
          })}
        </ul>
      )}

      <div className={cn("mt-5 grid gap-2", customising ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3")}>
        {customising ? (
          <>
            <Button variant="outline" onClick={() => choose({ analytics: false, marketing: false })}>
              Reject all
            </Button>
            <Button onClick={() => choose({ analytics, marketing })}>Save choices</Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => choose({ analytics: false, marketing: false })}>
              Reject all
            </Button>
            <Button onClick={() => choose({ analytics: true, marketing: true })}>Accept all</Button>
            <Button variant="ghost" className="col-span-2 sm:col-span-1" onClick={() => setCustomising(true)}>
              Customise
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default CookieBanner;
