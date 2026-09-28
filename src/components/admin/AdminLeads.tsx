import { useEffect, useMemo, useState } from "react";
import { collection, deleteDoc, doc, getDocs, limit, orderBy, query, updateDoc } from "firebase/firestore/lite";
import { format } from "date-fns";
import { toast } from "sonner";
import { Download, ExternalLink, Mail, Phone, RefreshCw, Trash2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { db } from "@/lib/firebase";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/lib/leads";
import { whatsappLink } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<LeadStatus, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  contacted: "bg-amber-50 text-amber-700 border-amber-200",
  quoted: "bg-violet-50 text-violet-700 border-violet-200",
  won: "bg-green-50 text-green-700 border-green-200",
  lost: "bg-gray-100 text-gray-600 border-gray-200",
};

const csvCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

// Quote / consultation requests sent from the website's forms.
const AdminLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "leads"), orderBy("createdAt", "desc"), limit(1000)));
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Lead, "id">) }));
      setLeads(list);
      setNotes(Object.fromEntries(list.map((l) => [l.id, l.notes ?? ""])));
    } catch (err) {
      console.error(err);
      toast.error("Could not load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => Object.fromEntries(LEAD_STATUSES.map((s) => [s, leads.filter((l) => (l.status ?? "new") === s).length])) as Record<LeadStatus, number>, [leads]);
  const shown = filter === "all" ? leads : leads.filter((l) => (l.status ?? "new") === filter);

  const setStatus = async (lead: Lead, status: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    try {
      await updateDoc(doc(db, "leads", lead.id), { status });
    } catch {
      toast.error("Could not update status");
      load();
    }
  };

  const saveNotes = async (lead: Lead) => {
    try {
      await updateDoc(doc(db, "leads", lead.id), { notes: (notes[lead.id] ?? "").slice(0, 2000) });
      toast.success("Notes saved");
    } catch {
      toast.error("Could not save notes");
    }
  };

  const remove = async (lead: Lead) => {
    if (!window.confirm(`Delete the enquiry from ${lead.name}? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, "leads", lead.id));
      setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    } catch {
      toast.error("Could not delete");
    }
  };

  const exportCsv = () => {
    const header = ["Date", "Status", "Type", "Name", "Email", "Phone", "Country", "City", "Reply by", "Preferred time", "Product", "Product URL", "Message", "Notes", "Page"];
    const rows = shown.map((l) => [
      l.createdAt?.toDate ? format(l.createdAt.toDate(), "yyyy-MM-dd HH:mm") : "",
      l.status, l.type, l.name, l.email, l.phone, l.country, l.city, l.contactMethod, l.preferredTime, l.productName, l.productUrl, l.message, notes[l.id] ?? l.notes, l.page,
    ]);
    const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `starlink-leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Leads</h2>
          <p className="text-sm text-muted-foreground">Quote and consultation requests from the website forms.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={shown.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", ...LEAD_STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn("rounded-full border px-3.5 py-1.5 text-sm capitalize", filter === s ? "border-gray-900 bg-gray-900 text-white" : "hover:border-gray-400")}
          >
            {s} <span className="ml-1 opacity-70">{s === "all" ? leads.length : counts[s]}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">No enquiries here yet.</p>
      ) : (
        <ul className="space-y-4">
          {shown.map((l) => {
            const status = (l.status ?? "new") as LeadStatus;
            const phoneDigits = (l.phone || "").replace(/[^\d+]/g, "");
            return (
              <li key={l.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-semibold">{l.name || "—"}</span>
                      <Badge variant="outline" className={cn("capitalize", STATUS_STYLE[status])}>{status}</Badge>
                      <Badge variant="outline">{l.type}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {l.createdAt?.toDate ? format(l.createdAt.toDate(), "dd MMM yyyy, hh:mm a") : ""}
                      {l.country && ` · ${l.city ? `${l.city}, ` : ""}${l.country}`} · Reply by {l.contactMethod}
                      {l.preferredTime && ` · ${l.preferredTime.replace("T", " ")}`}
                    </p>
                  </div>
                  <Select value={status} onValueChange={(v) => setStatus(l, v as LeadStatus)}>
                    <SelectTrigger className="h-9 w-[140px] capitalize"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {l.productName && (
                  <a href={l.productUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-sm font-medium hover:bg-gray-100">
                    {l.productName} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {l.message && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{l.message}</p>}

                <div className="mt-4 flex flex-wrap gap-2">
                  {phoneDigits && (
                    <Button asChild size="sm" className="bg-[#25D366] text-white hover:bg-[#1faa53]">
                      <a href={whatsappLink(`Hello ${l.name.split(" ")[0]}, thank you for your enquiry with Starlink Jewels${l.productName ? ` about the ${l.productName}` : ""}.`, phoneDigits)} target="_blank" rel="noopener noreferrer">
                        <FaWhatsapp className="mr-1.5 h-4 w-4" /> WhatsApp
                      </a>
                    </Button>
                  )}
                  {l.email && (
                    <Button asChild size="sm" variant="outline">
                      <a href={`mailto:${l.email}?subject=${encodeURIComponent(`Your enquiry with Starlink Jewels${l.productName ? ` – ${l.productName}` : ""}`)}`}>
                        <Mail className="mr-1.5 h-4 w-4" /> {l.email}
                      </a>
                    </Button>
                  )}
                  {phoneDigits && (
                    <Button asChild size="sm" variant="outline">
                      <a href={`tel:${phoneDigits}`}>
                        <Phone className="mr-1.5 h-4 w-4" /> {l.phone}
                      </a>
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="ml-auto text-muted-foreground hover:text-destructive" onClick={() => remove(l)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 flex gap-2">
                  <Textarea
                    value={notes[l.id] ?? ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [l.id]: e.target.value }))}
                    placeholder="Private notes (quote sent, follow-up date…)"
                    rows={2}
                    className="text-sm"
                  />
                  <Button size="sm" variant="outline" className="self-end" onClick={() => saveNotes(l)} disabled={(notes[l.id] ?? "") === (l.notes ?? "")}>
                    Save
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AdminLeads;
