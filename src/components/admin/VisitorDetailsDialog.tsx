import { useEffect, useState, type ReactNode } from "react";
import { Bot, Cookie, ExternalLink, Gem, Globe, History, MapPin, MessageCircle, Monitor, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CONSENT_LABELS, consentAction, fmtDate, isLikelyBot, sourceOf, type ConsentRecord, type Visitor } from "./visitorData";

interface Props {
  visitor: Visitor | null;
  /** Every visit record, used to show this browser's other days. */
  visitors: Visitor[];
  consents: ConsentRecord[];
  onOpenChange: (open: boolean) => void;
}

const Section = ({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) => (
  <section className="rounded-xl border p-4">
    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
      <span className="text-muted-foreground">{icon}</span>
      {title}
    </h3>
    {children}
  </section>
);

const Facts = ({ rows }: { rows: [string, ReactNode][] }) => (
  <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[130px_1fr]">
    {rows
      .filter(([, value]) => value !== null && value !== undefined && value !== "")
      .map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-xs text-muted-foreground sm:pt-0.5">{label}</dt>
          <dd className="min-w-0 break-words">{value}</dd>
        </div>
      ))}
  </dl>
);

const Mono = ({ children }: { children: ReactNode }) => <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{children}</code>;

// Everything recorded for one visitor who accepted analytics: the visit, where from, device,
// pages and pieces viewed, their other visits and their cookie choices.
const VisitorDetailsDialog = ({ visitor, visitors, consents, onOpenChange }: Props) => {
  const [current, setCurrent] = useState<Visitor | null>(visitor);
  // Keep the last visitor while the dialog animates closed.
  useEffect(() => {
    if (visitor) setCurrent(visitor);
  }, [visitor]);

  const v = current;
  const visits = v?.visitorId
    ? visitors.filter((x) => x.visitorId === v.visitorId).sort((a, b) => (b.timestamp?.toDate().getTime() ?? 0) - (a.timestamp?.toDate().getTime() ?? 0))
    : v
      ? [v]
      : [];
  const choices = v
    ? consents.filter((c) => (v.visitorId && c.visitorId === v.visitorId) || (v.consentId && c.consentId === v.consentId))
    : [];
  const allProducts = Array.from(new Set(visits.flatMap((x) => x.products || [])));

  return (
    <Dialog open={Boolean(visitor)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
        {v && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-muted-foreground" />
                {[v.city, v.country].filter(Boolean).join(", ") || "Unknown location"}
              </DialogTitle>
              <DialogDescription>
                Visit on {fmtDate(v.timestamp)}
                {v.lastSeen && ` · last active ${fmtDate(v.lastSeen, "hh:mm a")}`}
              </DialogDescription>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="outline" className={visits.length > 1 ? "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/30" : ""}>
                  {visits.length > 1 ? `Returning visitor · ${visits.length} visits` : "First visit"}
                </Badge>
                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 dark:bg-green-950/30">Analytics accepted</Badge>
                <Badge variant="outline">{v.consentMarketing ? "Marketing accepted" : "Marketing declined"}</Badge>
                {v.grantedLocation && <Badge variant="outline">Shared device location</Badge>}
                {isLikelyBot(v) && (
                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30">
                    <Bot className="mr-1 h-3 w-3" /> Possible bot / crawler
                  </Badge>
                )}
              </div>
            </DialogHeader>

            <div className="grid gap-4">
              <Section icon={<Route className="h-4 w-4" />} title={`Pages visited (${v.pages?.length || 1})`}>
                <ol className="space-y-1.5 text-sm">
                  {(v.pages?.length ? v.pages : [v.page]).map((p, i) => (
                    <li key={`${p}-${i}`} className="flex items-start gap-2">
                      <span className="mt-0.5 w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{i + 1}.</span>
                      <a href={p} target="_blank" rel="noopener noreferrer" className="min-w-0 break-all hover:underline">
                        {p}
                      </a>
                      {i === 0 && <Badge variant="secondary" className="shrink-0 text-[10px]">Landing</Badge>}
                    </li>
                  ))}
                </ol>
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>{v.pageviews ?? 1} page views</span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" /> {v.whatsappClicks ?? 0} WhatsApp enquiry click{(v.whatsappClicks ?? 0) === 1 ? "" : "s"}
                  </span>
                </p>
              </Section>

              {allProducts.length > 0 && (
                <Section icon={<Gem className="h-4 w-4" />} title={`Pieces viewed (${allProducts.length})`}>
                  <div className="flex flex-wrap gap-1.5">
                    {allProducts.map((p) => (
                      <Badge key={p} variant="secondary" className="font-normal">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </Section>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <Section icon={<MapPin className="h-4 w-4" />} title="Location & network">
                  <Facts
                    rows={[
                      ["City", [v.city, v.region].filter(Boolean).join(", ")],
                      ["Country", v.country],
                      ["ZIP / postal", v.postal],
                      ["Time zone", v.timezone],
                      ["IP address", v.ip && <Mono>{v.ip}</Mono>],
                      ["Network", v.org],
                      [
                        "Device location",
                        v.grantedLocation && v.latitude && v.longitude ? (
                          <a
                            href={`https://www.google.com/maps?q=${v.latitude},${v.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            Open map <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          "Not shared"
                        ),
                      ],
                    ]}
                  />
                </Section>

                <Section icon={<Monitor className="h-4 w-4" />} title="Device & browser">
                  <Facts
                    rows={[
                      ["Device", v.device],
                      ["Browser", v.browser],
                      ["System", v.os],
                      ["Screen", v.screen],
                      ["Language", v.language],
                      ["Source", sourceOf(v)],
                      ["Referrer", v.referrer && <span className="break-all">{v.referrer}</span>],
                      ["Campaign", v.utmCampaign],
                    ]}
                  />
                  {v.userAgent && <p className="mt-3 break-all font-mono text-[11px] leading-relaxed text-muted-foreground">{v.userAgent}</p>}
                </Section>
              </div>

              {visits.length > 1 && (
                <Section icon={<History className="h-4 w-4" />} title="All visits from this browser">
                  <ul className="divide-y text-sm">
                    {visits.map((x) => (
                      <li key={x.id}>
                        <button
                          type="button"
                          onClick={() => setCurrent(x)}
                          className={cn("flex w-full items-center justify-between gap-3 py-2 text-left hover:text-primary", x.id === v.id && "font-semibold text-primary")}
                        >
                          <span>{fmtDate(x.timestamp)}</span>
                          <span className="text-xs text-muted-foreground">
                            {x.pageviews ?? 1} pages · {x.products?.length ?? 0} pieces · {x.whatsappClicks ?? 0} WhatsApp
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              <Section icon={<Cookie className="h-4 w-4" />} title="Cookie choices">
                {choices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chosen before consent logging linked choices to visits.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {choices.map((c) => {
                      const a = CONSENT_LABELS[consentAction(c)];
                      return (
                        <li key={c.id} className="flex flex-wrap items-center gap-2">
                          <span className="text-muted-foreground">{fmtDate(c.timestamp)}</span>
                          <Badge variant="outline" className={a.className}>{a.label}</Badge>
                          <span className="text-xs text-muted-foreground">
                            Analytics {c.analytics ? "on" : "off"} · Marketing {c.marketing ? "on" : "off"}
                            {c.page && ` · on ${c.page}`}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {v.visitorId && <span>Visitor ID <Mono>{v.visitorId}</Mono></span>}
                  {v.consentId && <span>Consent ID <Mono>{v.consentId}</Mono></span>}
                </div>
              </Section>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VisitorDetailsDialog;
