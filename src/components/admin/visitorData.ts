// Shared shapes and helpers for Admin → Visitors (visit records and the cookie consent log).
import { format } from "date-fns";

type Timestamp = { toDate(): Date };

export interface Visitor {
  id: string;
  hostname?: string | null;
  origin?: string | null;
  referrer?: string | null;

  ip: string;
  org?: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  postal: string | null;
  timezone: string | null;
  userAgent: string;
  browser: string;
  device: string;
  os: string;
  screen?: string | null;
  language?: string | null;
  page: string;
  timestamp: Timestamp;
  lastSeen?: Timestamp;
  grantedLocation: boolean;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  // Browsing activity (recorded after analytics consent)
  pages?: string[];
  pageviews?: number;
  products?: string[];
  whatsappClicks?: number;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  visitorId?: string;
  consentId?: string | null;
  consentMarketing?: boolean;
}

export interface ConsentRecord {
  id: string;
  analytics: boolean;
  marketing: boolean;
  version?: string;
  page?: string;
  action?: ConsentAction;
  consentId?: string;
  visitorId?: string;
  browser?: string;
  device?: string;
  os?: string;
  language?: string | null;
  timezone?: string | null;
  timestamp?: Timestamp;
}

export type ConsentAction = "accept_all" | "reject_all" | "custom";

/** Button used; older log entries (before it was stored) are inferred from the choices. */
export const consentAction = (c: ConsentRecord): ConsentAction =>
  c.action ?? (c.analytics && c.marketing ? "accept_all" : !c.analytics && !c.marketing ? "reject_all" : "custom");

export const CONSENT_LABELS: Record<ConsentAction, { label: string; className: string }> = {
  accept_all: { label: "Accepted all", className: "border-green-200 bg-green-50 text-green-700 dark:bg-green-950/30" },
  custom: { label: "Customised", className: "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30" },
  reject_all: { label: "Rejected all", className: "border-red-200 bg-red-50 text-red-700 dark:bg-red-950/30" },
};

// "Where did they come from": campaign tag first, then the referring site, else direct.
export const sourceOf = (v: Visitor) => {
  if (v.utmSource) return v.utmSource + (v.utmMedium ? ` / ${v.utmMedium}` : "");
  if (v.referrer) {
    try {
      const host = new URL(v.referrer).hostname.replace(/^www\./, "");
      if (host && host !== window.location.hostname.replace(/^www\./, "")) return host;
    } catch {
      // ignore malformed referrers
    }
  }
  return "Direct";
};

const DATACENTER = /amazon|aws|google cloud|google llc|microsoft|azure|digitalocean|ovh|hetzner|linode|akamai|cloudflare|oracle|alibaba|tencent|contabo|vultr|choopa|m247|leaseweb|datacamp|scaleway/i;
const BOT_UA = /bot|crawl|spider|headless|lighthouse|pagespeed|preview|monitor/i;

/** Cloud-server networks and automated browsers: usually crawlers or site checkers, not shoppers. */
export const isLikelyBot = (v: Visitor) =>
  BOT_UA.test(v.userAgent || "") || (v.org ? DATACENTER.test(v.org) : false) || (v.browser === "Other" && v.os === "Other");

export const fmtDate = (t?: Timestamp, pattern = "dd MMM yyyy, hh:mm a") => (t?.toDate ? format(t.toDate(), pattern) : "—");

export const dayOf = (t?: Timestamp) => (t?.toDate ? format(t.toDate(), "yyyy-MM-dd") : "");

export const csvCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export const downloadCsv = (name: string, header: string[], rows: unknown[][]) => {
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};
