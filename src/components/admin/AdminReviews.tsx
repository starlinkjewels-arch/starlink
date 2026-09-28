import { useEffect, useMemo, useState } from "react";
import { collection, deleteDoc, doc, getDocs, limit, orderBy, query, updateDoc } from "firebase/firestore/lite";
import { format } from "date-fns";
import { toast } from "sonner";
import { BadgeCheck, Check, EyeOff, RefreshCw, Star, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import type { Review } from "@/lib/reviews";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = Review["status"];
const TABS: (Status | "all")[] = ["pending", "approved", "rejected", "all"];

// Moderation for product reviews. Only approved reviews appear on product pages and in Google
// structured data; "Verified buyer" should only be ticked for a confirmed order.
const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Status | "all">("pending");

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "reviews"), orderBy("createdAt", "desc"), limit(1000)));
      setReviews(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Review, "id">) })));
    } catch (err) {
      console.error(err);
      toast.error("Could not load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => ({ pending: 0, approved: 0, rejected: 0, ...Object.fromEntries(["pending", "approved", "rejected"].map((s) => [s, reviews.filter((r) => r.status === s).length])) }), [reviews]);
  const shown = tab === "all" ? reviews : reviews.filter((r) => r.status === tab);

  const update = async (r: Review, patch: Partial<Pick<Review, "status" | "verified">>) => {
    setReviews((prev) => prev.map((x) => (x.id === r.id ? { ...x, ...patch } : x)));
    try {
      await updateDoc(doc(db, "reviews", r.id), patch);
    } catch {
      toast.error("Could not update the review");
      load();
    }
  };

  const remove = async (r: Review) => {
    if (!window.confirm(`Delete the review by ${r.name}? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, "reviews", r.id));
      setReviews((prev) => prev.filter((x) => x.id !== r.id));
    } catch {
      toast.error("Could not delete");
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Reviews</h2>
          <p className="text-sm text-muted-foreground">Approve genuine reviews to show them on the product page (and as stars in Google).</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn("rounded-full border px-3.5 py-1.5 text-sm capitalize", tab === t ? "border-gray-900 bg-gray-900 text-white" : "hover:border-gray-400")}
          >
            {t} <span className="ml-1 opacity-70">{t === "all" ? reviews.length : counts[t]}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">No reviews here.</p>
      ) : (
        <ul className="space-y-4">
          {shown.map((r) => (
            <li key={r.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn("h-4 w-4", i < r.rating ? "fill-amber-400 text-amber-400" : "text-gray-300")} />
                      ))}
                    </span>
                    <Badge variant="outline" className="capitalize">{r.status}</Badge>
                    {r.verified && <Badge className="bg-green-600"><BadgeCheck className="mr-1 h-3 w-3" /> Verified</Badge>}
                  </div>
                  {r.title && <p className="mt-2 font-semibold">{r.title}</p>}
                </div>
                <a href={`/product/${r.productId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-700 hover:underline">
                  {r.productName}
                </a>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{r.text}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {r.name}
                {r.country && ` · ${r.country}`}
                {r.email && ` · ${r.email}`}
                {r.createdAt?.toDate && ` · ${format(r.createdAt.toDate(), "dd MMM yyyy")}`}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {r.status !== "approved" && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => update(r, { status: "approved" })}>
                    <Check className="mr-1.5 h-4 w-4" /> Approve
                  </Button>
                )}
                {r.status !== "rejected" && (
                  <Button size="sm" variant="outline" onClick={() => update(r, { status: "rejected" })}>
                    <EyeOff className="mr-1.5 h-4 w-4" /> {r.status === "approved" ? "Hide" : "Reject"}
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => update(r, { verified: !r.verified })}>
                  <BadgeCheck className="mr-1.5 h-4 w-4" /> {r.verified ? "Remove verified" : "Mark verified buyer"}
                </Button>
                <Button size="sm" variant="ghost" className="ml-auto text-muted-foreground hover:text-destructive" onClick={() => remove(r)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminReviews;
