import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getBuyingGuides, BuyingGuide } from '@/lib/buyingGuides';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/SEOHead';
import { useGlobalData } from '@/hooks/useGlobalData';

const BuyingGuidePage = () => {
  const { categories, promoHeader } = useGlobalData();
  const [guides, setGuides] = useState<BuyingGuide[]>([]);
  const [selected, setSelected] = useState<BuyingGuide | null>(null);
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug as string | undefined;

  const hasPromo = promoHeader?.enabled && promoHeader?.text;
  const promoHeight = hasPromo ? 40 : 0;
  const paddingTop = promoHeight + 80 + 52 + 12 + 26;

  useEffect(() => {
    const load = async () => {
      const data = await getBuyingGuides();
      const published = data.filter(g => g.published).sort((a, b) => (a.order || 0) - (b.order || 0));
      setGuides(published);
      if (slug) {
        const found = published.find(g => g.slug === slug);
        setSelected(found || published[0] || null);
      } else if (published.length > 0) {
        setSelected(published[0]);
      }
    };
    load();
  }, [slug]);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: selected?.title || 'Jewelry Buying Guide',
    description: 'Expert advice to help you make the perfect jewelry choice.',
  };

  if (guides.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead title="Jewelry Buying Guide" description="Learn how to buy jewelry like a pro." keywords="jewelry buying guide" canonicalUrl="https://starlinkjewels.com/buying-guide" />
          <div className="text-center">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
            <p className="text-xl text-muted-foreground">No buying guides available yet.</p>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={selected ? `${selected.title} - Buying Guide` : 'Jewelry Buying Guide'}
        description={selected ? `Learn about ${selected.title}.` : 'Comprehensive jewelry buying guides.'}
        keywords="jewelry buying guide, diamond 4cs"
        canonicalUrl={`https://starlinkjewels.com/buying-guide${slug ? `/${slug}` : ''}`}
        structuredData={structuredData}
      />


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
                  <Link key={guide.id} href={`/buying-guide/${guide.slug}`} className={`block p-4 rounded-xl transition-all duration-300 border ${selected?.id === guide.id ? 'bg-primary text-primary-foreground border-primary shadow-md font-medium' : 'hover:bg-muted border-transparent'}`}>
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
                    <Button asChild variant="outline" size="lg"><Link href="/buying-guide"><ArrowLeft className="h-5 w-5 mr-2" />Back to All Guides</Link></Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-card rounded-2xl border"><p className="text-xl text-muted-foreground">Select a guide from the sidebar</p></div>
            )}
          </article>
        </div>

    </div>
  );
};

export default BuyingGuidePage;
