import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, MessageCircle, Plane } from "lucide-react";
import logo from "@/assets/starlink-logo-full.png";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalData } from "@/store/contentSlice";
import { orderCategoriesWithCustomFirst } from "@/lib/storage";
import { whatsappLink } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import Zelle from "@/assets/paylogo/Zelle_(payment_service)-Logo.wine.png";
import Venmo from "@/assets/paylogo/Venmo-Logo.wine.png";
import GooglePay from "@/assets/paylogo/Google_Pay-Logo.wine.png";
import Bank from "@/assets/paylogo/Wells_Fargo-Logo.wine.png";
import Visa from "@/assets/paylogo/Visa_Inc.-Logo.wine.png";
import GIA from "@/assets/paylogo/GIA_Logo.png";
import IGI from "@/assets/paylogo/igi logo.webp";
import Rapaport from "@/assets/paylogo/Rapaport-header-20250120083212-20250210092659-20250227142926-20250310094122.svg";
import SDA from "@/assets/paylogo/sda-web.png";
import Bourse from "@/assets/paylogo/sdb-web.png";
import { categoryPath } from "@/lib/urls";
import { openCookieSettings } from "@/lib/consent";
import { enquiry } from "@/lib/enquiry";

const paymentMethods = [
  { name: "Visa", logo: Visa },
  { name: "Zelle", logo: Zelle },
  { name: "Venmo", logo: Venmo },
  { name: "Google Pay", logo: GooglePay },
  { name: "Bank Wire", logo: Bank },
];

const trustedBadges = [
  { name: "GIA", logo: GIA },
  { name: "IGI", logo: IGI },
  { name: "Rapaport", logo: Rapaport },
  { name: "Surat Diamond Association", logo: SDA },
  { name: "Surat Diamond Bourse", logo: Bourse },
  { name: "Surat Jewellery Manufacturers Association", logo: "https://sjma.in/cdn/shop/files/SJMA_Logo.png?v=1755163553&width=210" },
];

const companyLinks = [
  { name: "About Us", to: "/about" },
  { name: "Gallery", to: "/gallery" },
  { name: "Journal", to: "/blog" },
  { name: "Buying Guide", to: "/buying-guide" },
  { name: "Contact", to: "/contact" },
];

const careLinks = [
  { name: "Shipping & delivery", to: "/shipping-policy" },
  { name: "Returns & exchanges", to: "/returns-policy" },
  { name: "Warranty & care", to: "/warranty" },
  { name: "Ring size guide", to: "/ring-size-guide" },
  { name: "Wishlist", to: "/wishlist" },
  { name: "Terms & conditions", to: "/terms-and-conditions" },
];

const Footer = () => {
  const { contactInfo, categories } = useAppSelector(selectGlobalData);
  const collections = useMemo(() => orderCategoriesWithCustomFirst(categories).slice(0, 7), [categories]);

  const socials = [
    { href: contactInfo?.instagram, label: "Instagram", icon: Instagram },
    { href: contactInfo?.facebook, label: "Facebook", icon: Facebook },
    { href: contactInfo?.twitter, label: "Twitter", icon: Twitter },
  ].filter((s) => Boolean(s.href));

  const consultHref = whatsappLink(enquiry.consultation(), contactInfo?.whatsapp);

  return (
    <footer className="mt-auto">
      {/* Trust row: badge logos read best on white */}
      <div className="border-t bg-background">
        <div className="container-wide flex flex-col items-center gap-6 py-8 lg:flex-row lg:justify-between">
          <div className="text-center lg:text-left">
            <p className="eyebrow">Certified &amp; trusted</p>
            <p className="mt-1 font-display text-2xl">Trusted across the diamond industry</p>
          </div>
          <ul className="flex flex-wrap items-center justify-center gap-3">
            {trustedBadges.map((badge) => (
              <li key={badge.name} className="flex h-16 w-28 items-center justify-center rounded-lg border bg-white px-3 shadow-sm">
                <img src={badge.logo} alt={badge.name} title={badge.name} className="max-h-11 w-auto max-w-full object-contain" loading="lazy" decoding="async" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative isolate overflow-hidden rounded-t-[2rem] bg-secondary text-foreground">
        <div className="pointer-events-none absolute -left-40 top-0 -z-10 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />

        {/* Consultation strip */}
        <div className="border-b border-border">
          <div className="container-wide flex flex-col items-start gap-6 py-10 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="heading-md">Design something that's <em className="accent">only yours.</em></p>
              <p className="mt-2 text-sm text-muted-foreground">Free design consultation with CAD previews, on WhatsApp or live video.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="whatsapp" size="xl" className="rounded-full">
                <a href={consultHref} target="_blank" rel="noopener noreferrer">
                  <MessageCircle /> Chat on WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" size="xl" className="bg-transparent">
                <Link to="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="container-wide grid grid-cols-2 gap-x-6 gap-y-12 py-14 md:grid-cols-3 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1.2fr]">
          <div className="col-span-2 space-y-5 md:col-span-3 lg:col-span-1">
            <img src={logo} alt="Starlink Jewels" className="h-20 w-auto dark:brightness-150" loading="lazy" decoding="async" />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Lab-grown and natural diamond jewelry, designed and handcrafted in Surat since 2011 and delivered insured worldwide.
            </p>
            {socials.length > 0 && (
              <div className="flex gap-2">
                {socials.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/15 transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Collections</h3>
            <ul className="space-y-3 text-sm">
              {collections.map((c) => (
                <li key={c.id}>
                  <Link to={categoryPath(c)} className="text-muted-foreground transition-colors hover:text-foreground">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/categories" className="font-semibold text-foreground hover:text-brand">
                  View all
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/ring-builder" title="3D Ring Builder – design your own engagement ring" className="font-semibold text-brand transition-colors hover:text-foreground">
                  3D Ring Builder
                </Link>
              </li>
              <li>
                <Link to="/3d-jewelry-viewer" title="3D Jewelry Viewer – real-time photorealistic rendering" className="font-semibold text-brand transition-colors hover:text-foreground">
                  3D Jewelry Viewer
                </Link>
              </li>
              {companyLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-muted-foreground transition-colors hover:text-foreground">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mb-4 mt-8 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-foreground">We ship to</h3>
            <p className="inline-flex items-center gap-2.5 rounded-full border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm">
              <Plane className="h-4 w-4 text-brand" /> Worldwide
              <span className="font-normal text-muted-foreground">· fully insured</span>
            </p>
          </div>

          <div>
            <h3 className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Customer care</h3>
            <ul className="space-y-3 text-sm">
              {careLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-muted-foreground transition-colors hover:text-foreground">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h3 className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Get in touch</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              {contactInfo?.address && (
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span>{contactInfo.address}</span>
                </li>
              )}
              {contactInfo?.phone && (
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <a href={`tel:${contactInfo.phone}`} className="hover:text-foreground">
                    {contactInfo.phone}
                  </a>
                </li>
              )}
              {contactInfo?.email && (
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <a href={`mailto:${contactInfo.email}`} className="break-all hover:text-foreground">
                    {contactInfo.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-border">
          <div className="container-wide flex flex-col items-center gap-5 py-6 md:flex-row md:justify-between">
            <div className="flex flex-col items-center gap-2 md:items-start">
              <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Starlink Jewels. All rights reserved.</p>
              <p className="flex items-center gap-4 text-xs">
                <Link to="/privacy-policy" className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                  Privacy &amp; cookie policy
                </Link>
                <button type="button" onClick={openCookieSettings} className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                  Cookie settings
                </button>
              </p>
            </div>
            <div className="flex flex-col items-center gap-2.5 md:items-end">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">We accept</p>
              <ul className="flex flex-wrap items-center justify-center gap-2.5 md:justify-end" aria-label="Accepted payment methods">
                {paymentMethods.map((m) => (
                  <li key={m.name} className="flex h-12 w-[92px] items-center justify-center rounded-xl border bg-white px-3 shadow-sm md:h-14 md:w-28">
                    <img src={m.logo} alt={m.name} title={m.name} className="max-h-7 w-auto max-w-full object-contain md:max-h-8" loading="lazy" decoding="async" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
