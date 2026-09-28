import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, ChevronRight, Gem, Rotate3d } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import SEOHead from '@/components/SEOHead';
import SiteLayout from '@/components/site/SiteLayout';
import CdnImage from '@/components/site/CdnImage';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadProducts, selectGlobalData, selectProductsLoaded, selectProductsStatus } from '@/store/contentSlice';
import { SITE } from '@/lib/seo';
import { enquiry } from '@/lib/enquiry';
import { whatsappLink } from '@/lib/whatsapp';
import { categoryPath } from '@/lib/urls';
import { firstImage, isVideoUrl } from '@/lib/media';
import { productHasCategory } from '@/lib/storage';
import tools from '@/content/designTools.json';
import craft1 from '@/assets/craft/craft-1.jpg';
import craft3 from '@/assets/craft/craft-3.jpg';
import craft4 from '@/assets/craft/craft-4.jpg';

type ToolKey = keyof typeof tools;

// Landing pages for the design tools (/ring-builder, /3d-jewelry-viewer). The tools themselves live on
// their own subdomains; these pages give search engines a strong, crawlable page on the main domain
// and send visitors on to the tool. Copy lives in src/content/designTools.json (also used by the
// pre-renderer, so what Google indexes matches what visitors see).
const DesignToolPage = ({ tool }: { tool: ToolKey }) => {
  const page = tools[tool];
  const other = tools[tool === 'ringBuilder' ? 'viewer' : 'ringBuilder'];
  const dispatch = useAppDispatch();
  const { categories, products, contactInfo } = useAppSelector(selectGlobalData);
  const productsLoaded = useAppSelector(selectProductsLoaded);
  const productsStatus = useAppSelector(selectProductsStatus);
  useEffect(() => {
    if (!productsLoaded && productsStatus === 'idle') dispatch(loadProducts());
  }, [dispatch, productsLoaded, productsStatus]);
  const pageUrl = `${SITE.url}${page.path}`;
  const ToolIcon = tool === 'ringBuilder' ? Gem : Rotate3d;

  // Visual: ring photos (Rings, then Eternity Bands) once the catalogue has loaded, atelier photos until then.
  const ringCats = categories.filter((c) => /ring|band/i.test(c.name)).map((c) => c.id);
  const ringImages = products
    .filter((p) => ringCats.some((id) => productHasCategory(p, id)))
    .map((p) => firstImage(p))
    .filter((u): u is string => Boolean(u) && !isVideoUrl(u))
    .slice(0, 3);
  const visuals = ringImages.length >= 3 ? ringImages : [craft4, craft1, craft3];

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      '@id': `${page.toolUrl}#app`,
      name: page.toolName,
      url: page.toolUrl,
      description: page.metaDescription,
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Any (web browser)',
      browserRequirements: 'Requires JavaScript and WebGL',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: page.optionGroups.map((g) => `${g.label}: ${g.items.join(', ')}`),
      publisher: { '@id': `${SITE.url}/#jewelry-store` },
      mainEntityOfPage: pageUrl,
    },
  ];

  return (
    <SiteLayout>
      <SEOHead
        title={page.metaTitle}
        description={page.metaDescription}
        keywords={page.keywords}
        canonicalUrl={pageUrl}
        structuredData={structuredData}
        faqItems={page.faq}
        breadcrumbs={[
          { name: 'Home', url: SITE.url },
          { name: page.breadcrumb, url: pageUrl },
        ]}
      />

      {/* Hero */}
      <section className="container-wide pt-3 md:pt-4">
        <div className="relative isolate grid overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#081226] via-[#0f2248] to-[#17305f] text-white md:rounded-[2rem] lg:grid-cols-[1.1fr_1fr]">
          <div className="pointer-events-none absolute -left-32 -top-32 -z-10 h-96 w-96 rounded-full bg-brand/40 blur-[120px]" />
          <div className="pattern-lattice pointer-events-none absolute inset-0 -z-10 opacity-[0.07]" />

          <div className="px-5 pb-10 pt-8 sm:px-8 md:px-12 md:py-16 lg:py-20">
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-white/60">
              <Link to="/" className="hover:text-white">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white/90">{page.breadcrumb}</span>
            </nav>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a9c4f5]">{page.eyebrow}</p>
            <h1 className="mt-4 font-display text-[2.4rem] font-semibold leading-[1] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              {page.title}{' '}
              <span className="block font-serif font-normal italic text-[#a9c4f5]">{page.accent}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">{page.intro}</p>
            <div className="mt-8 grid max-w-md grid-cols-2 gap-2.5 sm:gap-3">
              <Button asChild variant="light" size="xl" className="whitespace-nowrap px-3 text-[13px] text-brand sm:px-5 sm:text-[15px]">
                <a href={page.toolUrl} target="_blank" rel="noopener" title={page.toolName}>
                  <ToolIcon /> {tool === 'ringBuilder' ? 'Start designing' : 'Open viewer'}
                </a>
              </Button>
              <Button asChild variant="outline-light" size="xl" className="whitespace-nowrap px-3 text-[13px] sm:px-5 sm:text-[15px]">
                <a href={whatsappLink(tool === 'ringBuilder' ? enquiry.customDesign() : enquiry.diamondAdvice(), contactInfo?.whatsapp)} target="_blank" rel="noopener noreferrer">
                  <FaWhatsapp /> Ask an expert
                </a>
              </Button>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70">
              {page.trust.map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#a9c4f5]" /> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual: stacked photo cards */}
          <div className="relative mx-auto h-[260px] w-full max-w-[440px] sm:h-[320px] lg:h-auto lg:max-w-none" aria-hidden>
            {visuals.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className={[
                  'absolute overflow-hidden rounded-3xl border-4 border-white/90 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.6)]',
                  i === 0 && 'left-1/2 top-4 z-20 w-[48%] -translate-x-1/2 lg:top-[14%]',
                  i === 1 && 'left-[4%] top-12 z-10 w-[38%] -rotate-[8deg] lg:top-[22%]',
                  i === 2 && 'right-[4%] top-12 z-10 w-[38%] rotate-[8deg] lg:top-[22%]',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <CdnImage src={src} cdn={{ width: 600, height: 600, quality: 82 }} alt="" className="aspect-square w-full object-cover" loading="eager" decoding="async" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container-wide">
          <p className="eyebrow mb-3">Step by step</p>
          <h2 className="heading-lg max-w-2xl text-balance">{page.stepsTitle}</h2>
          <ol className="mt-10 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
            {page.steps.map((step, i) => (
              <li key={step.title} className="rounded-3xl border bg-card p-5 md:p-7">
                <span className="font-serif text-3xl italic text-brand md:text-4xl">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 font-display text-base font-semibold tracking-tight md:text-lg">{step.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground md:text-sm">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Options */}
      <section className="section bg-secondary">
        <div className="container-wide">
          <p className="eyebrow mb-3">{tool === 'ringBuilder' ? 'Options' : 'Technology'}</p>
          <h2 className="heading-lg max-w-2xl text-balance">{page.optionsTitle}</h2>
          <dl className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
            {page.optionGroups.map((group) => (
              <div key={group.label} className="rounded-3xl bg-background p-5 md:p-6">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{group.label}</dt>
                <dd className="mt-3 flex flex-wrap gap-2">
                  {group.items.map((item) =>
                    group.label === 'Diamond shape' ? (
                      <Link key={item} to={`/search?q=${encodeURIComponent(item)}`} className="rounded-full border px-3 py-1.5 text-sm transition-colors hover:border-brand hover:text-brand">
                        {item}
                      </Link>
                    ) : (
                      <span key={item} className="rounded-full border px-3 py-1.5 text-sm">
                        {item}
                      </span>
                    )
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Why Starlink */}
      <section className="section">
        <div className="container-wide">
          <p className="eyebrow mb-3">Why Starlink</p>
          <h2 className="heading-lg max-w-2xl text-balance">{page.featuresTitle}</h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
            {page.features.map((f) => (
              <div key={f.title} className="rounded-3xl border p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-light text-brand">
                  <Check className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ (same questions as the FAQPage structured data) */}
      <section className="section bg-secondary">
        <div className="container-wide grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-3">FAQ</p>
            <h2 className="heading-lg text-balance">Questions, answered</h2>
            <p className="mt-4 max-w-sm text-muted-foreground">Still unsure? Our experts reply personally on WhatsApp.</p>
          </div>
          <Accordion type="single" collapsible defaultValue="faq-0" className="w-full">
            {page.faq.map((item, i) => (
              <AccordionItem key={item.question} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-display text-base font-semibold tracking-tight hover:no-underline md:text-lg">{item.question}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground md:text-base">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA + related links */}
      <section className="section">
        <div className="container-wide">
          <div className="rounded-[2rem] bg-gradient-to-br from-[#0f2248] to-brand p-8 text-center text-white md:p-14">
            <h2 className="heading-lg text-balance">{page.finalTitle}</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/75">{page.finalText}</p>
            <div className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-2.5 sm:gap-3">
              <Button asChild variant="light" size="xl" className="whitespace-nowrap px-3 text-[13px] text-brand sm:px-5 sm:text-[15px]">
                <a href={page.toolUrl} target="_blank" rel="noopener" title={page.toolName}>
                  {tool === 'ringBuilder' ? 'Start designing' : 'Open viewer'} <ArrowUpRight />
                </a>
              </Button>
              <Button asChild variant="outline-light" size="xl" className="whitespace-nowrap px-3 text-[13px] sm:px-5 sm:text-[15px]">
                <Link to={other.path}>
                  {other.breadcrumb} <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>

          <nav aria-label="Related" className="mt-10 flex flex-wrap justify-center gap-2">
            {categories.slice(0, 6).map((c) => (
              <Link key={c.id} to={categoryPath(c)} className="rounded-full border px-4 py-2 text-sm transition-colors hover:border-brand hover:text-brand">
                {c.name}
              </Link>
            ))}
            <Link to="/buying-guide" className="rounded-full border px-4 py-2 text-sm transition-colors hover:border-brand hover:text-brand">
              Diamond buying guide
            </Link>
          </nav>
        </div>
      </section>
    </SiteLayout>
  );
};

export default DesignToolPage;
