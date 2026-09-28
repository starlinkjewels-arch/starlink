// Cookie consent: the visitor's choice, stored first-party (cookie + localStorage), applied to
// Google Analytics via Consent Mode v2 and to our own visitor analytics (src/lib/analytics.ts).
// Nothing optional runs until the visitor has chosen. index.html reads the same cookie before GA
// loads, so a returning visitor's choice applies from the first hit.

export const CONSENT_VERSION = "2026-09";
const COOKIE = "sj_consent";
const MAX_AGE_DAYS = 180; // re-ask after six months

export interface ConsentState {
  /** Our first-party visitor analytics + Google Analytics measurement. */
  analytics: boolean;
  /** Google advertising features (remarketing, ad personalisation). */
  marketing: boolean;
  version: string;
  updatedAt: number;
}

type Listener = (state: ConsentState | null) => void;
const listeners = new Set<Listener>();

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const readCookie = (): string | null => {
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE}=`));
  return match ? decodeURIComponent(match.slice(COOKIE.length + 1)) : null;
};

export const getConsent = (): ConsentState | null => {
  try {
    const raw = readCookie() ?? window.localStorage.getItem(COOKIE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    // A new policy version, or a choice older than MAX_AGE_DAYS, asks again.
    if (parsed.version !== CONSENT_VERSION) return null;
    if (Date.now() - parsed.updatedAt > MAX_AGE_DAYS * 864e5) return null;
    return parsed;
  } catch {
    return null;
  }
};

const applyToGoogle = (state: ConsentState) => {
  const grant = (on: boolean) => (on ? "granted" : "denied");
  window.gtag?.("consent", "update", {
    analytics_storage: grant(state.analytics),
    ad_storage: grant(state.marketing),
    ad_user_data: grant(state.marketing),
    ad_personalization: grant(state.marketing),
  });
};

export const setConsent = (choice: Pick<ConsentState, "analytics" | "marketing">): ConsentState => {
  const state: ConsentState = { ...choice, version: CONSENT_VERSION, updatedAt: Date.now() };
  const value = JSON.stringify(state);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE}=${encodeURIComponent(value)}; Max-Age=${MAX_AGE_DAYS * 86400}; Path=/; SameSite=Lax${secure}`;
  try {
    window.localStorage.setItem(COOKIE, value);
  } catch {
    // storage blocked: the cookie still holds the choice
  }
  applyToGoogle(state);
  if (!state.analytics) clearAnalyticsStorage();
  listeners.forEach((fn) => fn(state));
  return state;
};

export const onConsentChange = (fn: Listener) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

/** Opens the cookie settings panel (footer "Cookie settings" link, privacy page button). */
export const openCookieSettings = () => window.dispatchEvent(new Event("sj:open-cookie-settings"));

// When analytics consent is withdrawn, remove what analytics stored in this browser.
const clearAnalyticsStorage = () => {
  try {
    Object.keys(window.localStorage)
      .filter((k) => k === "sj_vid" || k.startsWith("sj_visit:") || k.startsWith("starlink_visitor_logged"))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // ignore
  }
  const host = window.location.hostname.replace(/^www\./, "");
  document.cookie
    .split("; ")
    .map((c) => c.split("=")[0])
    .filter((name) => name === "_ga" || name.startsWith("_ga_") || name === "_gid")
    .forEach((name) => {
      for (const domain of ["", `; Domain=${host}`, `; Domain=.${host}`]) {
        document.cookie = `${name}=; Max-Age=0; Path=/${domain}`;
      }
    });
};
