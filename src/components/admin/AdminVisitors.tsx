import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, orderBy, deleteDoc, doc, limit } from "firebase/firestore";
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
import { useToast } from "@/hooks/use-toast";
import { MapPin, MapPinOff, Globe, Calendar, Clock, Monitor, ExternalLink, Trash2, RefreshCw } from "lucide-react";

interface Visitor {
  id: string;
  hostname?: string | null;
  origin?: string | null;
  referrer?: string | null;

  ip: string;
  country: string | null;
  region: string | null;
  city: string | null;
  postal: string | null;
  timezone: string | null;
  userAgent: string;
  browser: string;
  device: string;
  os: string;
  page: string;
  timestamp: { toDate(): Date };
  grantedLocation: boolean;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
}

const AdminVisitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
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

  const total = visitors.length;
  const allowed = visitors.filter((v) => v.grantedLocation).length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(visitors.map(v => v.id));
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
          <CardDescription>Complete information for each visitor</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedIds.length === visitors.length && visitors.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="min-w-[140px]">Date & Time</TableHead>
                  <TableHead className="min-w-[180px]">Location</TableHead>
                  <TableHead className="min-w-[120px]">IP Address</TableHead>
                  <TableHead className="min-w-[150px]">Device Info</TableHead>
                  <TableHead className="min-w-[100px]">Page</TableHead>
                  <TableHead className="min-w-[120px] text-center">GPS Location</TableHead>
                  <TableHead className="w-12">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      No visitors recorded yet
                    </TableCell>
                  </TableRow>
                ) : (
                  visitors.map((v) => (
                    <TableRow key={v.id} className="hover:bg-muted/30">
                      <TableCell>
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
                        </div>
                      </TableCell>

                      {/* Page */}
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{v.page || "/"}</code>
                      </TableCell>

                      {/* GPS Location */}
                      <TableCell className="text-center">
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

                      {/* Delete */}
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteOne(v.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVisitors;
