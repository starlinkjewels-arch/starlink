import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpen, ArrowRight, ArrowLeft } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import SiteLayout from '@/components/site/SiteLayout';
import PageHero from '@/components/site/PageHero';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { selectDeferredLoaded, selectDeferredStatus, selectGlobalData } from '@/store/contentSlice';
import { buildMetaDescriptionFromHtml } from '@/lib/seo';
import { sanitizeHtml } from '@/lib/sanitize';
import { whatsappLink } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

const defaultFaqItems = [
  {
    question: 'What are Starlink Jewels buying guides?',
    answer: 'They are expert guides covering diamond quality, ring styles, certifications, and purchase tips.',
  },
  {
    question: 'Do the guides cover lab-grown and natural diamonds?',
    answer: 'Yes. The guides explain both lab-grown and natural options to help you choose confidently.',
  },
  {
    question: 'Can I request a custom recommendation?',
    answer: 'Yes. Contact us for personalized advice based on your budget and preferences.',
  },
];

const BuyingGuidePage = () => {
  const { buyingGuides, contactInfo } = useAppSelector(selectGlobalData);
  const deferredLoaded = useAppSelector(selectDeferredLoaded);
  const deferredStatus = useAppSelector(selectDeferredStatus);
  const { slug } = useParams<{ slug?: string }>();

  const guides = useMemo(
    () => buyingGuides.filter((g) => g.published).sort((a, b) => (a.order || 0) - (b.order || 0)),
    [buyingGuides]
  );
  const selected = useMemo(() => (slug ? guides.find((g) => g.slug === slug) : guides[0]) || guides[0] || null, [guides, slug]);
  const selectedIndex = selected ? guides.findIndex((g) => g.id === selected.id) : -1;
  const nextGuide = selectedIndex >= 0 ? guides[selectedIndex + 1] : undefined;
  const prevGuide = selectedIndex > 0 ? guides[selectedIndex - 1] : undefined;

  const content = useMemo(() => sanitizeHtml(selected?.content || '', { stripInlineStyles: true }), [selected?.content]);
  const loading = guides.length === 0 && !deferredLoaded && deferredStatus !== 'failed';
  const canonical = `https://starlinkjewels.com/buying-guide${slug ? `/${slug}` : ''}`;

  return (
    <SiteLayout>
      <SEOHead
        title={selected ? selected.metaTitle || `${selected.title} - Buying Guide` : 'Jewelry Buying Guide'}
        description={
          selected
            ? selected.metaDescription || buildMetaDescriptionFromHtml(selected.content, 160)
            : 'Expert guides to help you choose lab-grown and natural diamond jewelry with confidence.'
        }
        keywords="jewelry buying guide, diamond buying guide, diamond 4cs, lab grown diamond guide, engagement ring guide, jewelry education"
        canonicalUrl={canonical}
        ogImage={selected?.image || undefined}
        structuredData={
          selected
            ? {
                '@context': 'https://schema.org',
                '@type': 'Article',
                '@id': `${canonical}#article`,
                headline: selected.title,
                image: selected.image || undefined,
                description: buildMetaDescriptionFromHtml(selected.content, 160),
                mainEntityOfPage: canonical,
                author: { '@type': 'Organization', name: 'Starlink Jewels' },
                publisher: { '@type': 'Organization', name: 'Starlink Jewels' },
              }
            : undefined
        }
        breadcrumbs={[
          { name: 'Home', url: 'https://starlinkjewels.com' },
          { name: 'Buying Guide', url: 'https://starlinkjewels.com/buying-guide' },
          ...(selected ? [{ name: selected.title, url: `https://starlinkjewels.com/buying-guide/${selected.slug}` }] : []),
        ]}
        faqItems={selected?.seoFaq?.length ? selected.seoFaq : defaultFaqItems}
      />

      <PageHero
        eyebrow="Buying guide"
        title="Buy with confidence"
        description="Everything you need to know about diamonds, settings and certification, explained simply."
        breadcrumbs={[{ name: 'Home', to: '/' }, { name: 'Buying Guide' }]}
      />

      <section className="container-wide py-12 md:py-16">
        {loading ? (
          <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
            <div className="h-72 animate-pulse rounded-md bg-muted" />
            <div className="h-[480px] animate-pulse rounded-md bg-muted" />
          </div>
        ) : guides.length === 0 || !selected ? (
          <div className="py-20 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" strokeWidth={1.2} />
            <p className="mt-4 font-display text-2xl">Guides are coming soon</p>
            <p className="mt-2 text-muted-foreground">In the meantime, our experts are happy to answer your questions.</p>
            <Button asChild variant="whatsapp" size="xl" className="mt-8">
              <a href={whatsappLink('Hi Starlink Jewels! I need help choosing a diamond.', contactInfo?.whatsapp)} target="_blank" rel="noopener noreferrer">
                Ask an expert
              </a>
            </Button>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-16">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <p className="eyebrow mb-4 hidden lg:block">All guides</p>
              <nav className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0" aria-label="Buying guides">
                {guides.map((guide, i) => {
                  const active = guide.id === selected.id;
                  return (
                    <Link
                      key={guide.id}
                      to={`/buying-guide/${guide.slug}`}
                      className={cn(
                        'shrink-0 rounded-full border px-4 py-2 text-sm transition-colors lg:flex lg:gap-3 lg:rounded-none lg:border-0 lg:border-l-2 lg:px-4 lg:py-3',
                        active
                          ? 'border-foreground bg-foreground text-background lg:border-l-brand lg:bg-transparent lg:font-semibold lg:text-foreground'
                          : 'text-muted-foreground hover:text-foreground lg:border-l-border'
                      )}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className="hidden tabular-nums text-muted-foreground lg:inline">{String(i + 1).padStart(2, '0')}</span>
                      {guide.title}
                    </Link>
                  );
                })}
              </nav>
            </aside>

            <article className="min-w-0">
              {selected.image && (
                <div className="mb-10 aspect-[16/9] overflow-hidden rounded-md bg-muted">
                  <img src={selected.image} alt={selected.title} className="h-full w-full object-cover" loading="eager" decoding="async" fetchPriority="high" />
                </div>
              )}
              <div className="mx-auto max-w-3xl">
                <h2 className="heading-lg text-balance">{selected.title}</h2>
                <div className="rich-text mt-8 md:prose-lg" dangerouslySetInnerHTML={{ __html: content }} />

                <div className="mt-16 grid gap-4 border-t pt-8 sm:grid-cols-2">
                  {prevGuide ? (
                    <Link to={`/buying-guide/${prevGuide.slug}`} className="group rounded-md border p-5 transition-colors hover:border-foreground">
                      <span className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        <ArrowLeft className="h-3.5 w-3.5" /> Previous
                      </span>
                      <span className="mt-2 block font-display text-xl">{prevGuide.title}</span>
                    </Link>
                  ) : (
                    <span />
                  )}
                  {nextGuide && (
                    <Link to={`/buying-guide/${nextGuide.slug}`} className="group rounded-md border p-5 text-right transition-colors hover:border-foreground">
                      <span className="flex items-center justify-end gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        Next <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                      <span className="mt-2 block font-display text-xl">{nextGuide.title}</span>
                    </Link>
                  )}
                </div>
              </div>
            </article>
          </div>
        )}
      </section>
    </SiteLayout>
  );
};

export default BuyingGuidePage;
