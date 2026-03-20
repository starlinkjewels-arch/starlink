import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from 'react-router-dom';
import { BuyingGuide } from "@/lib/buyingGuides";
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import MiniHeader from '@/components/MiniHeader';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { useAppSelector } from "@/store/hooks";
import { selectContentHydrated, selectContentStatus, selectGlobalData } from "@/store/contentSlice";

const BuyingGuidePage = () => {
  const { categories, promoHeader, buyingGuides } = useAppSelector(selectGlobalData);
  const status = useAppSelector(selectContentStatus);
  const hydrated = useAppSelector(selectContentHydrated);
  const isReady = status === "succeeded" || hydrated;
  const [guides, setGuides] = useState<BuyingGuide[]>([]);
  const [selected, setSelected] = useState<BuyingGuide | null>(null);
  const { slug } = useParams<{ slug?: string }>();

  const hasPromo = promoHeader?.enabled && promoHeader?.text;
  const promoHeight = hasPromo ? 40 : 0;
  const paddingTop = promoHeight + 80 + 52 + 12 + 26;

  const publishedGuides = useMemo(
    () => buyingGuides.filter((g) => g.published).sort((a, b) => (a.order || 0) - (b.order || 0)),
    [buyingGuides]
  );

  useEffect(() => {
    setGuides(publishedGuides);
    if (slug) {
      const found = publishedGuides.find((g) => g.slug === slug);
      setSelected(found || publishedGuides[0] || null);
    } else if (publishedGuides.length > 0) {
      setSelected(publishedGuides[0]);
    }
  }, [publishedGuides, slug]);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: selected?.title || 'Jewelry Buying Guide',
    description: 'Expert advice to help you make the perfect jewelry choice.',
  };

  const faqItems = [
    {
      question: "What are Starlink Jewels buying guides?",
      answer:
        "They are expert guides covering diamond quality, ring styles, certifications, and purchase tips.",
    },
    {
      question: "Do the guides cover lab-grown and natural diamonds?",
      answer:
        "Yes. The guides explain both lab-grown and natural options to help you choose confidently.",
    },
    {
      question: "Can I request a custom recommendation?",
      answer:
        "Yes. Contact us for personalized advice based on your budget and preferences.",
    },
  ];

  if (guides.length === 0 && !isReady) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="Jewelry Buying Guide"
          description="Learn how to buy jewelry like a pro."
          keywords="jewelry buying guide, diamond buying guide, lab grown diamond guide, engagement ring guide, jewelry education"
          canonicalUrl="https://www.starlinkjewels.com/buying-guide"
          breadcrumbs={[
            { name: "Home", url: "https://www.starlinkjewels.com" },
            { name: "Buying Guide", url: "https://www.starlinkjewels.com/buying-guide" },
          ]}
          faqItems={faqItems}
        />
        <Header promoHeader={promoHeader} />
        <MiniHeader categories={categories} promoHeight={promoHeight} />
        <main className="flex-1 container mx-auto px-4 py-12" style={{ paddingTop: `${paddingTop}px` }}>
          <div className="text-center mb-12">
            <div className="h-12 w-72 bg-muted rounded-md mx-auto animate-pulse mb-4" />
            <div className="h-5 w-96 bg-muted/70 rounded-md mx-auto animate-pulse" />
          </div>
          <div className="grid lg:grid-cols-4 gap-10">
            <div className="lg:col-span-1">
              <div className="h-80 bg-muted rounded-2xl animate-pulse" />
            </div>
            <div className="lg:col-span-3">
              <div className="h-[420px] bg-muted rounded-2xl animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (guides.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="Jewelry Buying Guide"
          description="Learn how to buy jewelry like a pro."
          keywords="jewelry buying guide, diamond buying guide, lab grown diamond guide, engagement ring guide, jewelry education"
          canonicalUrl="https://www.starlinkjewels.com/buying-guide"
          breadcrumbs={[
            { name: "Home", url: "https://www.starlinkjewels.com" },
            { name: "Buying Guide", url: "https://www.starlinkjewels.com/buying-guide" },
          ]}
          faqItems={faqItems}
        />
        <Header promoHeader={promoHeader} />
        <MiniHeader categories={categories} promoHeight={promoHeight} />
        <main className="flex-1 flex items-center justify-center py-20" style={{ paddingTop: `${paddingTop}px` }}>
          <div className="text-center">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
            <p className="text-xl text-muted-foreground">No buying guides available yet.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={selected ? `${selected.title} - Buying Guide` : 'Jewelry Buying Guide'}
        description={selected ? `Learn about ${selected.title}.` : 'Comprehensive jewelry buying guides.'}
        keywords="jewelry buying guide, diamond 4cs"
        canonicalUrl={`https://www.starlinkjewels.com/buying-guide${slug ? `/${slug}` : ''}`}
        structuredData={structuredData}
        breadcrumbs={[
          { name: "Home", url: "https://www.starlinkjewels.com" },
          { name: "Buying Guide", url: "https://www.starlinkjewels.com/buying-guide" },
          ...(selected ? [{ name: selected.title, url: `https://www.starlinkjewels.com/buying-guide/${selected.slug}` }] : []),
        ]}
        faqItems={faqItems}
      />

      <Header promoHeader={promoHeader} />
      <MiniHeader categories={categories} promoHeight={promoHeight} />

      <main className="flex-1 container mx-auto px-4 py-12" style={{ paddingTop: `${paddingTop}px` }}>
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Jewelry Buying Guide</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Expert advice to help you make the perfect choice</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-10">
          <aside className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-card rounded-2xl shadow-sm border p-6 sticky top-24">
              <h2 className="font-bold text-xl mb-6 flex items-center gap-3"><BookOpen className="h-6 w-6" />All Guides</h2>
              <nav className="space-y-2">
                {guides.map((guide) => (
                  <Link key={guide.id} to={`/buying-guide/${guide.slug}`} className={`block p-4 rounded-xl transition-all duration-300 border ${selected?.id === guide.id ? 'bg-primary text-primary-foreground border-primary shadow-md font-medium' : 'hover:bg-muted border-transparent'}`}>
                    {guide.title}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          <article className="lg:col-span-3 order-1 lg:order-2">
            {selected ? (
              <div className="bg-card rounded-2xl shadow-sm border overflow-hidden">
                {selected.image && <img src={selected.image} alt={selected.title} className="w-full h-96 md:h-[500px] object-cover" loading="lazy" />}
                <div className="p-8 md:p-12">
                  <h2 className="text-4xl md:text-5xl font-bold mb-8">{selected.title}</h2>
                  <div className="prose prose-lg max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: selected.content }} />
                  <div className="mt-16 pt-10 border-t border-border">
                    <Button asChild variant="outline" size="lg"><Link to="/buying-guide"><ArrowLeft className="h-5 w-5 mr-2" />Back to All Guides</Link></Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-card rounded-2xl border"><p className="text-xl text-muted-foreground">Select a guide from the sidebar</p></div>
            )}
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BuyingGuidePage;
