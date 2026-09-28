import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES, CONTACT_METHODS, LEAD_TYPES, submitLead, type ContactMethod, type LeadType } from "@/lib/leads";
import { whatsappLink } from "@/lib/whatsapp";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalData } from "@/store/contentSlice";
import { cn } from "@/lib/utils";

interface EnquiryFormProps {
  defaultType?: LeadType;
  product?: { id: string; name: string; url: string };
  className?: string;
  onDone?: () => void;
}

// Quote / consultation request. Autocomplete attributes let the browser fill name, email, phone,
// country and city in one tap. A hidden "company" field catches bots.
const EnquiryForm = ({ defaultType = "Quote for a piece", product, className, onDone }: EnquiryFormProps) => {
  const { contactInfo } = useAppSelector(selectGlobalData);
  const [type, setType] = useState<LeadType>(defaultType);
  const [contactMethod, setContactMethod] = useState<ContactMethod>("WhatsApp");
  const [country, setCountry] = useState("");
  const [agree, setAgree] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ name: string; summary: string } | null>(null);
  const [startedAt] = useState(() => Date.now());

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (k: string) => String(form.get(k) ?? "").trim();
    if (get("company")) return; // bot
    if (Date.now() - startedAt < 2500) return; // submitted faster than a person can type
    if (!agree) {
      setError("Please agree to be contacted about your enquiry.");
      return;
    }
    setError(null);
    setSending(true);
    const input = {
      type,
      name: get("name"),
      email: get("email"),
      phone: get("phone"),
      country: country || get("country-text"),
      city: get("city"),
      contactMethod,
      preferredTime: get("preferredTime"),
      message: get("message"),
      ...(product ? { productId: product.id, productName: product.name, productUrl: product.url } : {}),
    };
    try {
      await submitLead(input);
      const summary = [
        "Hello Starlink Jewels 👋",
        `I've just sent a request on your website (${type.toLowerCase()}).`,
        product ? `*${product.name}*\n${product.url}` : "",
        `Name: ${input.name}${input.country ? ` · ${input.country}` : ""}`,
        "Thank you!",
      ]
        .filter(Boolean)
        .join("\n\n");
      setSent({ name: input.name.split(" ")[0] || input.name, summary });
    } catch {
      setError("Sorry, we couldn't send your request. Please try again or message us on WhatsApp.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className={cn("py-6 text-center", className)}>
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
        <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight">Thank you, {sent.name}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Your request is with our team. We will reply by {contactMethod === "Phone call" ? "phone" : contactMethod} as soon as possible.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="whatsapp">
            <a href={whatsappLink(sent.summary, contactInfo?.whatsapp)} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp /> Also message us on WhatsApp
            </a>
          </Button>
          {onDone && (
            <Button variant="outline" onClick={onDone}>
              Close
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", className)} noValidate={false}>
      {product && (
        <p className="rounded-2xl bg-secondary px-4 py-3 text-sm">
          About: <span className="font-semibold">{product.name}</span>
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>I'd like</Label>
          <div className="flex flex-wrap gap-2">
            {LEAD_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                aria-pressed={type === t}
                className={cn("rounded-full border px-3.5 py-1.5 text-sm transition-colors", type === t ? "border-brand bg-brand text-white" : "hover:border-foreground")}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lead-name">Full name *</Label>
          <Input id="lead-name" name="name" autoComplete="name" required maxLength={80} className="h-11 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-email">Email *</Label>
          <Input id="lead-email" name="email" type="email" autoComplete="email" inputMode="email" required maxLength={120} className="h-11 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-phone">Phone / WhatsApp</Label>
          <Input id="lead-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={40} placeholder="+1 201 555 0123" className="h-11 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-country">Country *</Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger id="lead-country" className="h-11 rounded-xl" aria-label="Country">
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Lets browser autofill supply the country too; the select above wins if both are set. */}
          <input name="country-text" autoComplete="country-name" tabIndex={-1} aria-hidden className="sr-only" onChange={(e) => !country && COUNTRIES.includes(e.target.value) && setCountry(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-city">City</Label>
          <Input id="lead-city" name="city" autoComplete="address-level2" maxLength={80} className="h-11 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-time">{type === "Video consultation" ? "Preferred date & time *" : "Best time to reach you"}</Label>
          <Input
            id="lead-time"
            name="preferredTime"
            type={type === "Video consultation" ? "datetime-local" : "text"}
            required={type === "Video consultation"}
            maxLength={40}
            placeholder={type === "Video consultation" ? undefined : "e.g. weekdays after 6pm"}
            className="h-11 rounded-xl"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>Reply by</Label>
          <div className="flex flex-wrap gap-2">
            {CONTACT_METHODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setContactMethod(m)}
                aria-pressed={contactMethod === m}
                className={cn("rounded-full border px-3.5 py-1.5 text-sm transition-colors", contactMethod === m ? "border-foreground bg-foreground text-background" : "hover:border-foreground")}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="lead-message">Your message</Label>
          <Textarea
            id="lead-message"
            name="message"
            rows={4}
            maxLength={2000}
            placeholder={type === "Custom design" ? "Tell us about your idea: stone, shape, metal, budget, occasion…" : "Size, metal, questions, anything we should know…"}
            className="rounded-xl"
          />
        </div>
      </div>

      {/* Honeypot: hidden from people, filled by bots */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <label className="flex items-start gap-3 text-sm text-muted-foreground">
        <Checkbox checked={agree} onCheckedChange={(v) => setAgree(Boolean(v))} className="mt-0.5" aria-label="Agree to be contacted" />
        <span>
          I agree that Starlink Jewels may contact me about this enquiry. See our{" "}
          <Link to="/privacy-policy" className="text-brand underline-offset-4 hover:underline">
            privacy policy
          </Link>
          .
        </span>
      </label>

      {error && <p className="text-sm text-rose-600" role="alert">{error}</p>}

      <Button type="submit" size="xl" className="w-full" disabled={sending || !country}>
        {sending ? <Loader2 className="animate-spin" /> : "Send request"}
      </Button>
      {!country && <p className="text-center text-xs text-muted-foreground">Select your country to continue.</p>}
    </form>
  );
};

export default EnquiryForm;
