import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import SiteLayout from '@/components/site/SiteLayout';
import PageHero from '@/components/site/PageHero';
import Reveal from '@/components/site/Reveal';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { selectDeferredLoaded, selectGlobalData } from '@/store/contentSlice';
import { openWhatsApp, whatsappLink } from '@/lib/whatsapp';
import { FaWhatsapp } from 'react-icons/fa';

const faqItems = [
  {
    question: 'What is shown in the Starlink Jewels gallery?',
    answer: 'Our gallery showcases premium diamond and gold jewelry, including rings, earrings, necklaces, and bracelets.',
  },
  {
    question: 'Can I request a similar design from the gallery?',
    answer: 'Yes. You can contact us on WhatsApp to request similar or customized designs.',
  },
  {
    question: 'Are gallery items available for international shipping?',
    answer: 'Yes. We ship worldwide with secure packaging for select regions.',
  },
];

const Gallery = () => {
  const { galleryItems, contactInfo } = useAppSelector(selectGlobalData);
  const deferredLoaded = useAppSelector(selectDeferredLoaded);
  const [selected, setSelected] = useState<number | null>(null);
  const count = galleryItems.length;

  const go = useCallback((delta: number) => {
    setSelected((prev) => (prev === null ? prev : (prev + delta + count) % count));
  }, [count]);

  useEffect(() => {
    if (selected === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'Escape') setSelected(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [selected, go]);

  const current = selected !== null ? galleryItems[selected] : null;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    '@id': 'https://starlinkjewels.com/gallery#imagegallery',
    name: 'Starlink Jewels Gallery - Diamond & Gold Jewelry Collection',
    description: 'Browse our collection of certified diamond jewelry, engagement rings, necklaces, and luxury pieces.',
    url: 'https://starlinkjewels.com/gallery',
    image: galleryItems.slice(0, 10).map((item) => item.image),
    numberOfItems: count,
    mainEntityOfPage: 'https://starlinkjewels.com/gallery',
  };

  return (
    <SiteLayout>
      <SEOHead
        title="Jewelry Gallery - Diamond & Gold Collection Photos"
        description="Browse our gallery of certified diamond jewelry. View engagement rings, necklaces, earrings and bracelets handcrafted by Starlink Jewels."
        keywords="jewelry gallery, diamond jewelry photos, engagement ring photos, luxury jewelry collection, diamond necklace gallery, jewelry design gallery, real jewelry photos"
        canonicalUrl="https://starlinkjewels.com/gallery"
        structuredData={structuredData}
        breadcrumbs={[
          { name: 'Home', url: 'https://starlinkjewels.com' },
          { name: 'Gallery', url: 'https://starlinkjewels.com/gallery' },
        ]}
        faqItems={faqItems}
      />

      <PageHero
        eyebrow="Gallery"
        title="From our atelier"
        description="A look at pieces we've designed and handcrafted. See something you love? We can create it for you."
        breadcrumbs={[{ name: 'Home', to: '/' }, { name: 'Gallery' }]}
      />

      <section className="section">
        <div className="container-wide">
          {count === 0 ? (
            deferredLoaded ? (
              <div className="py-20 text-center">
                <p className="font-display text-2xl">Gallery coming soon</p>
                <p className="mt-2 text-muted-foreground">We're curating an exceptional collection for you.</p>
              </div>
            ) : (
              <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={`mb-4 animate-pulse rounded-md bg-muted ${i % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'}`} />
                ))}
              </div>
            )
          ) : (
            <div className="columns-2 gap-3 md:columns-3 md:gap-4 lg:columns-4">
              {galleryItems.map((item, i) => (
                <Reveal key={item.id} delay={(i % 4) * 60} className="mb-3 break-inside-avoid md:mb-4">
                  <button type="button" onClick={() => setSelected(i)} className="group relative block w-full overflow-hidden rounded-md bg-muted text-left">
                    <img
                      src={item.image}
                      alt={item.description || 'Starlink Jewels piece'}
                      className="w-full transition-transform duration-1000 group-hover:scale-105"
                      loading={i < 4 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                    <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {item.description && <span className="line-clamp-2 text-sm text-white">{item.description}</span>}
                      <Expand className="ml-auto h-4 w-4 shrink-0 text-white" />
                    </span>
                  </button>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t bg-secondary/40">
        <div className="container-wide flex flex-col items-center gap-6 py-16 text-center md:py-20">
          <p className="eyebrow">Bespoke</p>
          <h2 className="heading-lg max-w-2xl text-balance">Seen something you love? Let's make it yours.</h2>
          <Button asChild variant="whatsapp" size="xl">
            <a href={whatsappLink("Hi Starlink Jewels! I saw a piece in your gallery and I'd like to know more.", contactInfo?.whatsapp)} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp /> Chat with our designers
            </a>
          </Button>
        </div>
      </section>

      {current &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-label="Image viewer">
            <div className="flex items-center justify-between p-4 text-white">
              <span className="text-sm tabular-nums text-white/70">
                {(selected ?? 0) + 1} / {count}
              </span>
              <button type="button" onClick={() => setSelected(null)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4" onClick={() => setSelected(null)}>
              <img
                key={current.id}
                src={current.image}
                alt={current.description || 'Starlink Jewels piece'}
                className="max-h-full max-w-full rounded object-contain animate-in fade-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              />
              {count > 1 && (
                <>
                  <button type="button" onClick={(e) => { e.stopPropagation(); go(-1); }} className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Previous">
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); go(1); }} className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Next">
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
            <div className="flex flex-col items-center gap-4 p-6 text-center">
              {current.description && <p className="max-w-2xl text-white/85">{current.description}</p>}
              <Button
                variant="whatsapp"
                size="xl"
                onClick={() =>
                  openWhatsApp(`Hi Starlink Jewels! I'm interested in this piece from your gallery:\n\n${current.image}`, contactInfo?.whatsapp)
                }
              >
                <FaWhatsapp /> Enquire about this piece
              </Button>
            </div>
          </div>,
          document.body
        )}
    </SiteLayout>
  );
};

export default Gallery;
