import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Cookie, Download, Eye, Monitor, Smartphone, Tablet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { CONSENT_LABELS, consentAction, downloadCsv, fmtDate, type ConsentAction, type ConsentRecord, type Visitor } from "./visitorData";

interface Props {
  consents: ConsentRecord[];
  /** Visit records keyed by visitor id (newest first), to link accepted choices to visits. */
  visitsById: Map<string, Visitor[]>;
  onOpenVisitor: (v: Visitor) => void;
}

type Filter = "all" | ConsentAction;
const PAGE = 25;

const DeviceIcon = ({ device }: { device?: string }) => {
  const Icon = device === "Mobile" ? Smartphone : device === "Tablet" ? Tablet : Monitor;
  return <Icon className="h-3.5 w-3.5 text-muted-foreground" />;
};

const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);

// Every cookie-banner decision: what was chosen, when, on which page, from what device, and
// (for people who accepted analytics) a link to what they then did on the site.
const ConsentLog = ({ consents, visitsById, onOpenVisitor }: Props) => {
  const [filter, setFilter] = useState<Filter>("all");
  const [shown, setShown] = useState(PAGE);

  const counts = useMemo(() => {
    const c = { all: consents.length, accept_all: 0, custom: 0, reject_all: 0 } as Record<Filter, number>;
    consents.forEach((x) => (c[consentAction(x)] += 1));
    return c;
  }, [consents]);

  const rows = useMemo(() => (filter === "all" ? consents : consents.filter((c) => consentAction(c) === filter)), [consents, filter]);
  const analyticsOn = consents.filter((c) => c.analytics).length;
  const marketingOn = consents.filter((c) => c.marketing).length;

  const exportCsv = () =>
    downloadCsv(
      `starlink-cookie-consents-${format(new Date(), "yyyy-MM-dd")}.csv`,
      ["Date", "Decision", "Analytics", "Marketing", "Device", "Browser", "OS", "Language", "Time zone", "Page", "Policy version", "Consent ID", "Visitor ID", "City", "Country"],
      rows.map((c) => {
        const visit = c.visitorId ? visitsById.get(c.visitorId)?.[0] : undefined;
        return [
          fmtDate(c.timestamp, "yyyy-MM-dd HH:mm"),
          CONSENT_LABELS[consentAction(c)].label,
          c.analytics ? "Yes" : "No",
          c.marketing ? "Yes" : "No",
          c.device, c.browser, c.os, c.language, c.timezone, c.page, c.version, c.consentId, c.visitorId,
          visit?.city, visit?.country,
        ];
      }),
    );

  const stats: { label: string; value: number; sub: string; tone?: string }[] = [
    { label: "Decisions", value: counts.all, sub: "cookie banner choices" },
    { label: "Accepted all", value: counts.accept_all, sub: `${pct(counts.accept_all, counts.all)}%`, tone: "text-green-600" },
    { label: "Customised", value: counts.custom, sub: `${pct(counts.custom, counts.all)}%`, tone: "text-amber-600" },
    { label: "Rejected all", value: counts.reject_all, sub: `${pct(counts.reject_all, counts.all)}%`, tone: "text-red-600" },
    { label: "Analytics on", value: analyticsOn, sub: `${pct(analyticsOn, counts.all)}% · tracked below` },
    { label: "Marketing on", value: marketingOn, sub: `${pct(marketingOn, counts.all)}% · Google Ads` },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Cookie className="h-4 w-4" /> Cookie consent log
          </CardTitle>
          <CardDescription className="mt-1.5">
            Every choice made in the cookie banner. People who accepted analytics link to their visit: location, device, pages and pieces viewed. People who rejected are not tracked.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={rows.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </CardHeader>

      <CardContent className="space-y-5 p-0">
        <div className="grid grid-cols-2 gap-4 px-6 sm:grid-cols-3 xl:grid-cols-6">
          {stats.map((s) => (
            <div key={s.label}>
              <div className={cn("text-2xl font-bold tabular-nums", s.tone)}>{s.value}</div>
              <div className="text-xs font-medium">{s.label}</div>
              <div className="text-[11px] text-muted-foreground">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 px-6">
          {(["all", "accept_all", "custom", "reject_all"] as Filter[]).map((f) => (
            <Button
              key={f}
              type="button"
              size="sm"
              variant={filter === f ? "default" : "outline"}
              className="h-8 rounded-full"
              onClick={() => {
                setFilter(f);
                setShown(PAGE);
              }}
            >
              {f === "all" ? "All" : CONSENT_LABELS[f].label} <span className="ml-1.5 opacity-70">{counts[f]}</span>
            </Button>
          ))}
        </div>

        <div className="overflow-x-auto border-t">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="min-w-[150px]">Date & time</TableHead>
                <TableHead className="min-w-[170px]">Decision</TableHead>
                <TableHead className="min-w-[160px]">Device</TableHead>
                <TableHead className="min-w-[150px]">Language · zone</TableHead>
                <TableHead className="min-w-[160px]">Chosen on</TableHead>
                <TableHead className="min-w-[200px]">Visitor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No cookie choices for the selected dates
                  </TableCell>
                </TableRow>
              ) : (
                rows.slice(0, shown).map((c) => {
                  const action = CONSENT_LABELS[consentAction(c)];
                  const visits = c.visitorId ? visitsById.get(c.visitorId) : undefined;
                  const visit = visits?.[0];
                  return (
                    <TableRow key={c.id} className={cn(visit && "cursor-pointer hover:bg-muted/30")} onClick={visit ? () => onOpenVisitor(visit) : undefined}>
                      <TableCell>
                        <div className="text-sm font-medium">{fmtDate(c.timestamp, "dd MMM yyyy")}</div>
                        <div className="text-xs text-muted-foreground">{fmtDate(c.timestamp, "hh:mm:ss a")}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={action.className}>{action.label}</Badge>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Analytics {c.analytics ? "✓" : "✗"} · Marketing {c.marketing ? "✓" : "✗"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {c.device ? (
                          <>
                            <div className="flex items-center gap-1.5 text-sm font-medium">
                              <DeviceIcon device={c.device} /> {c.device}
                            </div>
                            <div className="pl-5 text-xs text-muted-foreground">
                              {c.browser} · {c.os}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not recorded (older entry)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div>{c.language || "—"}</div>
                        <div>{c.timezone || ""}</div>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-0.5 text-xs">{c.page || "/"}</code>
                      </TableCell>
                      <TableCell>
                        {visit ? (
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 text-sm">
                              <div className="truncate font-medium">{[visit.city, visit.country].filter(Boolean).join(", ") || "Unknown location"}</div>
                              <div className="text-xs text-muted-foreground">
                                {visits!.length > 1 ? `${visits!.length} visits · ` : ""}
                                {visit.pageviews ?? 1} pages · {visit.products?.length ?? 0} pieces
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="h-7 shrink-0 text-xs">
                              <Eye className="mr-1 h-3 w-3" /> Details
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {!c.analytics ? "Not tracked (declined analytics)" : c.visitorId ? "Visit not recorded (left right away or blocked)" : "Linked visits start with new choices"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {rows.length > shown && (
          <div className="flex justify-center pb-5">
            <Button variant="outline" size="sm" onClick={() => setShown((n) => n + PAGE)}>
              Show more ({rows.length - shown} left)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsentLog;
