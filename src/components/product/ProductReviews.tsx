import { useState } from "react";
import { BadgeCheck, CheckCircle2, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { submitReview, type Review } from "@/lib/reviews";
import { cn } from "@/lib/utils";

export const Stars = ({ value, className }: { value: number; className?: string }) => (
  <span className={cn("flex items-center gap-0.5", className)} aria-label={`${value.toFixed(1)} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, i) => {
      const fill = Math.max(0, Math.min(1, value - i));
      return (
        <span key={i} className="relative inline-block h-4 w-4">
          <Star className="absolute inset-0 h-4 w-4 text-border" />
          <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          </span>
        </span>
      );
    })}
  </span>
);

interface ProductReviewsProps {
  productId: string;
  productName: string;
  reviews: Review[];
  average: number;
}

const ProductReviews = ({ productId, productName, reviews, average }: ProductReviewsProps) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [agree, setAgree] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const count = reviews.length;
  const distribution = [5, 4, 3, 2, 1].map((n) => ({ n, c: reviews.filter((r) => r.rating === n).length }));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (k: string) => String(form.get(k) ?? "").trim();
    if (get("website")) return; // bot
    if (!rating) return setError("Please choose a star rating.");
    if (get("text").length < 10) return setError("Please write at least a sentence about the piece.");
    if (!agree) return setError("Please confirm the review is your own honest experience.");
    setError(null);
    setSending(true);
    try {
      await submitReview({ productId, productName, rating, title: get("title"), text: get("text"), name: get("name"), email: get("email"), country: get("country") });
      setSent(true);
    } catch {
      setError("Sorry, we couldn't send your review. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="reviews" className="scroll-mt-28 border-t py-16 md:py-20">
      <div className="container-wide grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
        <div>
          <p className="eyebrow mb-3">Reviews</p>
          <h2 className="heading-md">Customer reviews</h2>
          {count > 0 ? (
            <div className="mt-6">
              <div className="flex items-end gap-3">
                <span className="font-display text-5xl font-semibold tracking-tight">{average.toFixed(1)}</span>
                <div className="pb-1.5">
                  <Stars value={average} />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {count} {count === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>
              <ul className="mt-5 space-y-1.5">
                {distribution.map(({ n, c }) => (
                  <li key={n} className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="w-3 tabular-nums">{n}</span>
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      <span className="block h-full rounded-full bg-amber-400" style={{ width: `${count ? (c / count) * 100 : 0}%` }} />
                    </span>
                    <span className="w-5 text-right tabular-nums">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No reviews for this piece yet. Own it? Share your experience.</p>
          )}
          <Button variant="outline" className="mt-6" onClick={() => setOpen(true)}>
            Write a review
          </Button>
        </div>

        {count > 0 && (
          <ul className="divide-y">
            {reviews.slice(0, 20).map((r) => (
              <li key={r.id} className="py-6 first:pt-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Stars value={r.rating} />
                  {r.title && <span className="font-semibold">{r.title}</span>}
                </div>
                <p className="mt-2 whitespace-pre-line leading-relaxed text-muted-foreground">{r.text}</p>
                <p className="mt-3 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{r.name}</span>
                  {r.country && <span>· {r.country}</span>}
                  {r.createdAt?.toDate && <span>· {r.createdAt.toDate().toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>}
                  {r.verified && (
                    <span className="flex items-center gap-1 font-semibold text-green-700">
                      <BadgeCheck className="h-3.5 w-3.5" /> Verified buyer
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetTitle className="font-display text-2xl">Write a review</SheetTitle>
          <p className="mt-1 text-sm text-muted-foreground">{productName}</p>
          {sent ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
              <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight">Thank you!</h3>
              <p className="mt-2 text-sm text-muted-foreground">Your review will appear here once our team has checked it.</p>
              <Button variant="outline" className="mt-6" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label>Your rating *</Label>
                <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`} aria-pressed={rating === n}>
                      <Star className={cn("h-8 w-8 transition-colors", (hover || rating) >= n ? "fill-amber-400 text-amber-400" : "text-border")} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rv-title">Headline</Label>
                <Input id="rv-title" name="title" maxLength={100} placeholder="e.g. Even more beautiful in person" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rv-text">Your review *</Label>
                <Textarea id="rv-text" name="text" rows={5} maxLength={2000} required placeholder="How does it look and feel? How was the experience with our team?" className="rounded-xl" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="rv-name">Name shown *</Label>
                  <Input id="rv-name" name="name" required maxLength={60} autoComplete="given-name" placeholder="e.g. Sarah M." className="h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rv-country">Country</Label>
                  <Input id="rv-country" name="country" maxLength={60} autoComplete="country-name" className="h-11 rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rv-email">Email * <span className="font-normal text-muted-foreground">(never shown)</span></Label>
                <Input id="rv-email" name="email" type="email" required maxLength={120} autoComplete="email" className="h-11 rounded-xl" />
              </div>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              <label className="flex items-start gap-3 text-sm text-muted-foreground">
                <Checkbox checked={agree} onCheckedChange={(v) => setAgree(Boolean(v))} className="mt-0.5" aria-label="Confirm honest review" />
                <span>
                  This is my own honest experience. My name, country and review may be shown publicly; see our{" "}
                  <Link to="/privacy-policy" className="text-brand underline-offset-4 hover:underline">privacy policy</Link>.
                </span>
              </label>
              {error && <p className="text-sm text-rose-600" role="alert">{error}</p>}
              <Button type="submit" size="xl" className="w-full" disabled={sending}>
                {sending ? <Loader2 className="animate-spin" /> : "Submit review"}
              </Button>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default ProductReviews;
