import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import MiniHeader from "@/components/MiniHeader";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalData } from "@/store/contentSlice";
import { Button } from "@/components/ui/button";

type CountryConfig = {
  name: string;
  slug: string;
  locale: string;
  headline: string;
  description: string;
  shippingText: string;
  keywords: string;
};

const COUNTRIES: CountryConfig[] = [
  {
    name: "United States",
    slug: "usa",
    locale: "en-US",
    headline: "Diamond Jewelry Delivered Across the USA",
    description:
      "Shop certified lab-grown and natural diamond jewelry from Starlink Jewels with secure worldwide delivery to the United States. Custom designs, premium craftsmanship, and WhatsApp support.",
    shippingText:
      "Fast, insured international shipping to all US states with secure packaging and tracking.",
    keywords:
      "diamond jewelry USA, lab grown diamonds USA, engagement rings USA, luxury jewelry USA, diamond necklace USA",
  },
  {
    name: "Canada",
    slug: "canada",
    locale: "en-CA",
    headline: "Luxury Jewelry Delivery Across Canada",
    description:
      "Discover premium diamond and gold jewelry with worldwide delivery to Canada. Certified lab-grown and natural diamonds with custom design options.",
    shippingText:
      "Secure international shipping to all Canadian provinces with tracking and insurance.",
    keywords:
      "diamond jewelry Canada, lab grown diamonds Canada, engagement rings Canada, luxury jewelry Canada",
  },
  {
    name: "Australia",
    slug: "australia",
    locale: "en-AU",
    headline: "Premium Diamond Jewelry for Australia",
    description:
      "Shop certified diamond jewelry and custom designs delivered to Australia. Ethical lab-grown and natural diamonds with expert craftsmanship.",
    shippingText:
      "Tracked, insured shipping to all Australian states and territories.",
    keywords:
      "diamond jewelry Australia, lab grown diamonds Australia, engagement rings Australia, luxury jewelry Australia",
  },
  {
    name: "Germany",
    slug: "germany",
    locale: "en-DE",
    headline: "Certified Diamond Jewelry Delivered to Germany",
    description:
      "Explore Starlink Jewels luxury diamond collections with secure delivery to Germany. Lab-grown and natural diamonds, custom jewelry, and expert support.",
    shippingText:
      "Reliable international shipping to Germany with secure packaging and tracking.",
    keywords:
      "diamond jewelry Germany, lab grown diamonds Germany, engagement rings Germany, luxury jewelry Germany",
  },
];

const CountryLanding = () => {
  const { country } = useParams<{ country: string }>();
  const { categories, promoHeader } = useAppSelector(selectGlobalData);
  const hasPromo = promoHeader?.enabled && promoHeader?.text;
  const promoHeight = hasPromo ? 40 : 0;
  const paddingTop = promoHeight + 80 + 52 + 12;

  const config = useMemo(
    () => COUNTRIES.find((c) => c.slug === country) ?? null,
    [country]
  );

  if (!config) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="Country Page Not Found"
          description="The requested country page could not be found."
          canonicalUrl={`https://www.starlinkjewels.com/${country || ""}`}
        />
        <Header promoHeader={promoHeader} />
        <MiniHeader categories={categories} promoHeight={promoHeight} />
        <main className="flex-1 container mx-auto px-4 py-16" style={{ paddingTop: `${paddingTop}px` }}>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={`${config.name} Diamond Jewelry Shipping`}
        description={config.description}
        keywords={config.keywords}
        canonicalUrl={`https://www.starlinkjewels.com/${config.slug}`}
      />

      <Header promoHeader={promoHeader} />
      <MiniHeader categories={categories} promoHeight={promoHeight} />

      <main className="flex-1 container mx-auto px-4 py-12" style={{ paddingTop: `${paddingTop}px` }}>
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{config.headline}</h1>
          <p className="text-lg text-muted-foreground">{config.description}</p>
        </div>

        <div className="max-w-3xl mx-auto grid gap-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Shipping to {config.name}</h2>
            <p className="text-muted-foreground">{config.shippingText}</p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Why Starlink Jewels</h2>
            <ul className="text-muted-foreground space-y-2">
              <li>Certified lab-grown and natural diamonds.</li>
              <li>Custom design and manufacturing support.</li>
              <li>Secure worldwide shipping with tracking.</li>
              <li>WhatsApp support for quick inquiries.</li>
            </ul>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm text-center">
            <h2 className="text-xl font-semibold mb-2">Explore Our Collections</h2>
            <p className="text-muted-foreground mb-4">
              Browse engagement rings, wedding bands, necklaces, earrings, and more.
            </p>
            <Link to="/categories">
              <Button size="lg">View Collections</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CountryLanding;
