// lib/analytics.ts — first-party visitor analytics, shown in Admin → Visitors.
// Runs only after the visitor accepts analytics cookies (src/lib/consent.ts); nothing is stored
// or sent before that. One record per browser per day, updated as the visitor browses.
import { addDoc, arrayUnion, collection, doc, increment, serverTimestamp, updateDoc } from 'firebase/firestore/lite';
import { db } from './firebase';
import { getConsent } from './consent';

const VISITOR_ID_KEY = 'sj_vid';
const MAX_PAGES = 60;

const today = () => new Date().toISOString().slice(0, 10);
const visitKey = () => `sj_visit:${window.location.hostname}:${today()}`;
const legacyDailyKey = () => `starlink_visitor_logged:${window.location.hostname}:${today()}`;

const hasAnalyticsConsent = () => Boolean(getConsent()?.analytics);
const isAdminPath = () => window.location.pathname.startsWith('/aEgZjaHJvbWUyBggAEEUYOdIBCDUzMTRqMGo3') || window.location.pathname.startsWith('/admin');

const store = {
  get: (k: string) => {
    try {
      return window.localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      window.localStorage.setItem(k, v);
    } catch {
      // storage blocked
    }
  },
};

/** Random, anonymous id for this browser (created only after consent). */
const visitorId = () => {
  let id = store.get(VISITOR_ID_KEY);
  if (!id) {
    id = (crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`).slice(0, 40);
    store.set(VISITOR_ID_KEY, id);
  }
  return id;
};

// Pages/events that happen before today's record exists are queued and included when it is created.
let visitDocId: string | null = null;
let creating = false;
const pending = { pages: [] as string[], products: [] as string[], whatsappClicks: 0 };

const currentPage = () => (window.location.pathname + window.location.search).slice(0, 300);

/** Browser family, device class and OS from the user agent (no fingerprinting). */
const deviceInfo = () => {
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? 'Edge'
    : /OPR\/|Opera/.test(ua) ? 'Opera'
    : /SamsungBrowser/.test(ua) ? 'Samsung Internet'
    : /Chrome|CriOS/.test(ua) ? 'Chrome'
    : /Firefox|FxiOS/.test(ua) ? 'Firefox'
    : /Safari/.test(ua) ? 'Safari'
    : 'Other';
  const device = /iPad|Tablet/.test(ua) ? 'Tablet' : /Mobile|Android|iPhone/.test(ua) ? 'Mobile' : 'Desktop';
  // iPhone and Android user agents also mention "Mac OS X" / "Linux", so check them first.
  const os = /Windows/.test(ua) ? 'Windows'
    : /Android/.test(ua) ? 'Android'
    : /iPhone|iPad|iPod/.test(ua) ? 'iOS'
    : /Mac/.test(ua) ? 'MacOS'
    : /CrOS/.test(ua) ? 'ChromeOS'
    : /Linux/.test(ua) ? 'Linux'
    : 'Other';
  return { browser, device, os };
};

const trafficSource = () => {
  const params = new URLSearchParams(window.location.search);
  const pick = (k: string) => params.get(k)?.slice(0, 100) || null;
  return { utmSource: pick('utm_source'), utmMedium: pick('utm_medium'), utmCampaign: pick('utm_campaign') };
};

export const logVisitor = async (grantedLocation: boolean = false, coords?: GeolocationCoordinates) => {
  if (isAdminPath() || !hasAnalyticsConsent()) return;
  visitDocId = visitDocId ?? store.get(visitKey());
  if (visitDocId || creating || store.get(legacyDailyKey()) === 'true') return;
  creating = true;

  try {
    let ipData: Record<string, string | undefined> = {};
    try {
      const ipResponse = await fetch('https://ipapi.co/json/');
      ipData = await ipResponse.json();
    } catch {
      // location lookup is optional
    }

    const userAgent = navigator.userAgent;
    const { browser, device, os } = deviceInfo();
    const consent = getConsent();
    const pages = Array.from(new Set([currentPage(), ...pending.pages])).slice(0, MAX_PAGES);

    const logData: Record<string, unknown> = {
      hostname: window.location.hostname,
      origin: window.location.origin,
      referrer: document.referrer || null,

      ip: ipData.ip || 'unknown',
      country: ipData.country_name || null,
      region: ipData.region || null,
      city: ipData.city || null,
      postal: ipData.postal || null,
      org: ipData.org?.slice(0, 120) || null,
      timezone: ipData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || null,

      userAgent,
      browser,
      device,
      os,
      language: (navigator.language || '').slice(0, 20) || null,
      screen: `${window.screen.width}x${window.screen.height}`,

      visitorId: visitorId(),
      consentId: consent?.id || null,
      consentMarketing: Boolean(consent?.marketing),
      ...trafficSource(),

      page: currentPage(),
      pages,
      pageviews: pages.length,
      products: Array.from(new Set(pending.products)).slice(0, MAX_PAGES),
      whatsappClicks: pending.whatsappClicks,
      timestamp: serverTimestamp(),
      lastSeen: serverTimestamp(),
      grantedLocation,
    };

    if (grantedLocation && coords) {
      logData.latitude = coords.latitude;
      logData.longitude = coords.longitude;
      logData.accuracy = coords.accuracy;
    }

    // If the published rules predate org/consentId, retry without them rather than lose the visit.
    const ref = await addDoc(collection(db, 'visitors'), logData).catch(() => {
      const { org: _org, consentId: _consentId, ...legacy } = logData;
      return addDoc(collection(db, 'visitors'), legacy);
    });
    visitDocId = ref.id;
    store.set(visitKey(), ref.id);
    pending.pages = [];
    pending.products = [];
    pending.whatsappClicks = 0;
  } catch (err) {
    if (import.meta.env.DEV) console.warn('Failed to log visitor', err);
  } finally {
    creating = false;
  }
};

const updateVisit = async (fields: Record<string, unknown>) => {
  if (!visitDocId) return;
  try {
    await updateDoc(doc(db, 'visitors', visitDocId), { ...fields, lastSeen: serverTimestamp() });
  } catch (err) {
    if (import.meta.env.DEV) console.warn('Failed to update visit', err);
  }
};

export const trackPageView = (path = currentPage()) => {
  if (isAdminPath() || !hasAnalyticsConsent()) return;
  visitDocId = visitDocId ?? store.get(visitKey());
  if (!visitDocId) {
    if (!pending.pages.includes(path)) pending.pages.push(path);
    return;
  }
  void updateVisit({ pages: arrayUnion(path.slice(0, 300)), pageviews: increment(1) });
};

export const trackProductView = (name: string) => {
  if (!hasAnalyticsConsent() || !name) return;
  const label = name.slice(0, 120);
  visitDocId = visitDocId ?? store.get(visitKey());
  if (!visitDocId) {
    if (!pending.products.includes(label)) pending.products.push(label);
    return;
  }
  void updateVisit({ products: arrayUnion(label) });
};

export const trackWhatsAppClick = () => {
  if (!hasAnalyticsConsent()) return;
  window.gtag?.('event', 'whatsapp_enquiry', { page_path: window.location.pathname });
  visitDocId = visitDocId ?? store.get(visitKey());
  if (!visitDocId) {
    pending.whatsappClicks += 1;
    return;
  }
  void updateVisit({ whatsappClicks: increment(1) });
};

// ---- Consent log (proof of consent; Admin → Visitors → Cookie consent) ----
// Every choice is logged with its consent id, the button used and the device/browser type.
// Only when analytics is accepted does the entry carry the visitor id that links it to the
// visit record (location, pages, pieces viewed).
export type ConsentAction = 'accept_all' | 'reject_all' | 'custom';

export const recordConsent = async (choice: { analytics: boolean; marketing: boolean; version: string; id?: string; action: ConsentAction }) => {
  if (isAdminPath()) return;
  try {
    const entry: Record<string, unknown> = {
      analytics: choice.analytics,
      marketing: choice.marketing,
      version: choice.version,
      action: choice.action,
      page: currentPage(),
      ...deviceInfo(),
      language: (navigator.language || '').slice(0, 20) || null,
      timezone: (Intl.DateTimeFormat().resolvedOptions().timeZone || '').slice(0, 60) || null,
      timestamp: serverTimestamp(),
    };
    if (choice.id) entry.consentId = choice.id;
    if (choice.analytics) entry.visitorId = visitorId();
    await addDoc(collection(db, 'consents'), entry).catch(() =>
      // Older published rules accept only the basic fields.
      addDoc(collection(db, 'consents'), {
        analytics: choice.analytics,
        marketing: choice.marketing,
        version: choice.version,
        page: currentPage(),
        timestamp: serverTimestamp(),
      }),
    );
  } catch (err) {
    if (import.meta.env.DEV) console.warn('Failed to record consent', err);
  }
};
