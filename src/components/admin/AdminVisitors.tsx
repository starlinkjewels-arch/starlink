import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, orderBy, deleteDoc, doc, limit } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MapPin, MapPinOff, Globe, Calendar, Clock, Monitor, ExternalLink, Trash2, RefreshCw, Download, MessageCircle, Eye, Bot } from "lucide-react";
import ConsentLog from "./ConsentLog";
import VisitorDetailsDialog from "./VisitorDetailsDialog";
import { dayOf, downloadCsv, isLikelyBot, sourceOf, type ConsentRecord, type Visitor } from "./visitorData";

const topCounts = (values: string[], n = 6) => {
  const map = new Map<string, number>();
  values.filter(Boolean).forEach((v) => map.set(v, (map.get(v) || 0) + 1));
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
};

const AdminVisitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [filterMode, setFilterMode] = useState<"single" | "range">("single");
  const [singleDate, setSingleDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [openVisitor, setOpenVisitor] = useState<Visitor | null>(null);
  const [hideBots, setHideBots] = useState(false);
  const { toast } = useToast();

  const currentHost = useMemo(() => window.location.hostname, []);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      // No Firestore composite index required: fetch recent visitors and filter client-side.
      const q = query(collection(db, "visitors"), orderBy("timestamp", "desc"), limit(1000));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      } as Visitor));

      // Show only visitors that were logged from THIS website host
      const filtered = data.filter((v) => (v.hostname || null) === currentHost);

      setVisitors(filtered);
      setSelectedIds([]);

      try {
        const consentSnap = await getDocs(query(collection(db, "consents"), orderBy("timestamp", "desc"), limit(2000)));
        setConsents(consentSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as ConsentRecord));
      } catch {
        setConsents([]);
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to fetch visitors", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const inDateRange = useMemo(() => (day: string) => {
    if (!day) return false;
    if (filterMode === "single") return !singleDate || day === singleDate;
    if (fromDate && day < fromDate) return false;
    if (toDate && day > toDate) return false;
    return true;
  }, [filterMode, singleDate, fromDate, toDate]);

  const botCount = useMemo(() => visitors.filter((v) => inDateRange(dayOf(v.timestamp)) && isLikelyBot(v)).length, [visitors, inDateRange]);

  const filteredVisitors = useMemo(
    () => visitors.filter((v) => inDateRange(dayOf(v.timestamp)) && !(hideBots && isLikelyBot(v))),
    [visitors, inDateRange, hideBots],
  );

  const filteredConsents = useMemo(() => consents.filter((c) => inDateRange(dayOf(c.timestamp))), [consents, inDateRange]);

  // All visit records per browser (newest first): links consent entries and returning visits.
  const visitsById = useMemo(() => {
    const map = new Map<string, Visitor[]>();
    visitors.forEach((v) => {
      if (!v.visitorId) return;
      map.set(v.visitorId, [...(map.get(v.visitorId) || []), v]);
    });
    return map;
  }, [visitors]);

  const total = filteredVisitors.length;
  const allowed = filteredVisitors.filter((v) => v.grantedLocation).length;

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => filteredVisitors.some((visitor) => visitor.id === id)));
  }, [filteredVisitors]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredVisitors.map(v => v.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    
    setDeleting(true);
    try {
      await Promise.all(selectedIds.map(id => deleteDoc(doc(db, "visitors", id))));
      toast({ title: "Deleted", description: `${selectedIds.length} visitor(s) removed` });
      fetchVisitors();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to delete visitors", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteOne = async (id: string) => {
    try {
      await deleteDoc(doc(db, "visitors", id));
      toast({ title: "Deleted", description: "Visitor removed" });
      setVisitors(prev => prev.filter(v => v.id !== id));
      setSelectedIds(prev => prev.filter(i => i !== id));
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const handleClearFilters = () => {
    setSingleDate("");
    setFromDate("");
    setToDate("");
    setFilterMode("single");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Visitor Analytics</h2>
          <p className="text-sm text-muted-foreground">Real unique visitors from your website</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchVisitors}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Date Filter</CardTitle>
          <CardDescription>View visitors for a single day or a custom date range</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={filterMode === "single" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMode("single")}
            >
              Single Date
            </Button>
            <Button
              type="button"
              variant={filterMode === "range" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMode("range")}
            >
              Date Range
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear Filter
            </Button>
          </div>

          {filterMode === "single" ? (
            <div className="max-w-xs space-y-2">
              <Label htmlFor="visitor-single-date">Select Date</Label>
              <Input
                id="visitor-single-date"
                type="date"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="visitor-from-date">From Date</Label>
                <Input
                  id="visitor-from-date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitor-to-date">To Date</Label>
                <Input
                  id="visitor-to-date"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Showing {filteredVisitors.length} of {visitors.length} visitors and {filteredConsents.length} of {consents.length} cookie choices
          </p>
          {botCount > 0 && (
            <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
              <Checkbox checked={hideBots} onCheckedChange={(c) => setHideBots(Boolean(c))} />
              Hide {botCount} likely bot / crawler visit{botCount === 1 ? "" : "s"} (cloud servers, automated browsers)
            </label>
          )}
        </CardContent>
      </Card>

      <ConsentLog consents={filteredConsents} visitsById={visitsById} onOpenVisitor={setOpenVisitor} />

      {/* Insights for the selected dates */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Top pages", rows: topCounts(filteredVisitors.flatMap((v) => v.pages?.length ? v.pages : [v.page])) },
          { title: "Most viewed pieces", rows: topCounts(filteredVisitors.flatMap((v) => v.products || [])) },
          { title: "Traffic sources", rows: topCounts(filteredVisitors.map(sourceOf)) },
          { title: "Countries", rows: topCounts(filteredVisitors.map((v) => v.country || "Unknown")) },
        ].map((box) => (
          <Card key={box.title}>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm">{box.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 pb-4">
              {box.rows.length === 0 ? (
                <p className="text-xs text-muted-foreground">No data yet</p>
              ) : (
                box.rows.map(([label, count]) => (
                  <div key={label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate" title={label}>{label}</span>
                    <span className="shrink-0 font-semibold tabular-nums">{count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {filteredVisitors.reduce((n, v) => n + (v.pageviews || 1), 0)} page views</span>
        <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> {filteredVisitors.reduce((n, v) => n + (v.whatsappClicks || 0), 0)} WhatsApp enquiry clicks</span>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => {
            downloadCsv(
              `starlink-visitors-${format(new Date(), "yyyy-MM-dd")}.csv`,
              ["Date", "Country", "Region", "City", "ZIP", "Time zone", "IP", "Network", "Device", "Browser", "OS", "Screen", "Language", "Source", "Referrer", "Landing page", "Pages viewed", "Page views", "Products viewed", "WhatsApp clicks", "Marketing consent", "Visits from this browser", "Possible bot", "Visitor ID", "Consent ID"],
              filteredVisitors.map((v) => [
                v.timestamp?.toDate ? format(v.timestamp.toDate(), "yyyy-MM-dd HH:mm") : "",
                v.country, v.region, v.city, v.postal, v.timezone, v.ip, v.org, v.device, v.browser, v.os, v.screen, v.language, sourceOf(v), v.referrer, v.page,
                (v.pages || []).join(" | "), v.pageviews ?? 1, (v.products || []).join(" | "), v.whatsappClicks ?? 0,
                v.consentMarketing ? "Yes" : "No", v.visitorId ? visitsById.get(v.visitorId)?.length ?? 1 : 1, isLikelyBot(v) ? "Yes" : "No", v.visitorId, v.consentId,
              ]),
            );
          }}
        >
          <Download className="h-4 w-4 mr-2" /> Export visitors CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Visitors</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-xs font-medium text-green-600">Location Allowed</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold text-green-600">{allowed}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-xs font-medium text-red-600">Location Denied</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold text-red-600">{total - allowed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">{total > 0 ? Math.round((allowed / total) * 100) : 0}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDeleteSelected}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
            Clear Selection
          </Button>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Visitor Details</CardTitle>
          <CardDescription>Visitors who accepted analytics cookies. Click a row for full details: pages, pieces viewed, device, other visits and cookie choices.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedIds.length === filteredVisitors.length && filteredVisitors.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="min-w-[140px]">Date & Time</TableHead>
                  <TableHead className="min-w-[180px]">Location</TableHead>
                  <TableHead className="min-w-[120px]">IP Address</TableHead>
                  <TableHead className="min-w-[150px]">Device Info</TableHead>
                  <TableHead className="min-w-[200px]">Activity</TableHead>
                  <TableHead className="min-w-[120px] text-center">GPS Location</TableHead>
                  <TableHead className="w-20">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisitors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      No visitors found for the selected date filter
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVisitors.map((v) => (
                    <TableRow key={v.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setOpenVisitor(v)}>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={selectedIds.includes(v.id)}
                          onCheckedChange={(checked) => handleSelectOne(v.id, !!checked)}
                        />
                      </TableCell>
                      
                      {/* Date & Time */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-sm font-medium">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {v.timestamp?.toDate ? format(v.timestamp.toDate(), "dd MMM yyyy") : "—"}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {v.timestamp?.toDate ? format(v.timestamp.toDate(), "hh:mm:ss a") : "—"}
                          </div>
                          {v.visitorId && (visitsById.get(v.visitorId)?.length ?? 0) > 1 && (
                            <Badge variant="outline" className="mt-1 border-blue-200 bg-blue-50 text-[10px] text-blue-700 dark:bg-blue-950/30">
                              Returning · {visitsById.get(v.visitorId)!.length} visits
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Location */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-sm font-medium">
                            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                            {v.city || "Unknown"}{v.country ? `, ${v.country}` : ""}
                          </div>
                          {v.region && (
                            <div className="text-xs text-muted-foreground pl-5">{v.region}</div>
                          )}
                          {v.postal && (
                            <div className="text-xs text-muted-foreground pl-5">ZIP: {v.postal}</div>
                          )}
                          {v.timezone && (
                            <div className="text-xs text-muted-foreground pl-5">{v.timezone}</div>
                          )}
                        </div>
                      </TableCell>

                      {/* IP */}
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{v.ip || "—"}</code>
                      </TableCell>

                      {/* Device Info */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-sm">
                            <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium">{v.device || "Unknown"}</span>
                          </div>
                          <div className="text-xs text-muted-foreground pl-5">
                            {v.browser || "—"} • {v.os || "—"}
                          </div>
                          {isLikelyBot(v) && (
                            <Badge variant="outline" className="ml-5 mt-1 border-amber-200 bg-amber-50 text-[10px] text-amber-700 dark:bg-amber-950/30">
                              <Bot className="mr-1 h-3 w-3" /> Likely bot
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Activity */}
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <code className="bg-muted px-2 py-0.5 rounded">{v.page || "/"}</code>
                          <div className="text-muted-foreground">
                            {v.pageviews ?? 1} page{(v.pageviews ?? 1) === 1 ? "" : "s"} · {v.whatsappClicks ?? 0} WhatsApp · {sourceOf(v)}
                          </div>
                          {v.products && v.products.length > 0 && (
                            <div className="max-w-[260px] truncate text-muted-foreground" title={v.products.join(", ")}>
                              Viewed: {v.products.slice(0, 2).join(", ")}{v.products.length > 2 ? ` +${v.products.length - 2}` : ""}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* GPS Location */}
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        {v.grantedLocation && v.latitude && v.longitude ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs h-7">
                                <MapPin className="h-3 w-3 mr-1" />
                                View Map
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Precise Visitor Location</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-3">
                                <div className="w-full h-[400px] rounded-lg overflow-hidden border">
                                  <iframe
                                    title="Visitor Location"
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${v.longitude! - 0.01},${v.latitude! - 0.01},${v.longitude! + 0.01},${v.latitude! + 0.01}&layer=mapnik&marker=${v.latitude},${v.longitude}`}
                                  />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm">
                                  <div>
                                    <span className="font-medium">Coordinates:</span>{" "}
                                    <code>{v.latitude!.toFixed(6)}, {v.longitude!.toFixed(6)}</code>
                                    {v.accuracy && <span className="text-muted-foreground ml-2">±{v.accuracy.toFixed(0)}m</span>}
                                  </div>
                                  <a
                                    href={`https://www.google.com/maps?q=${v.latitude},${v.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline inline-flex items-center gap-1"
                                  >
                                    Google Maps <ExternalLink className="h-3 w-3" />
                                  </a>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-200">
                            <MapPinOff className="h-3 w-3 mr-1" />
                            Denied
                          </Badge>
                        )}
                      </TableCell>

                      {/* Details / delete */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="View details" onClick={() => setOpenVisitor(v)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteOne(v.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <VisitorDetailsDialog visitor={openVisitor} visitors={visitors} consents={consents} onOpenChange={(open) => !open && setOpenVisitor(null)} />
    </div>
  );
};

export default AdminVisitors;
