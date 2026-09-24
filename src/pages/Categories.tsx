import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import SiteLayout from '@/components/site/SiteLayout';
import CollectionHero from '@/components/site/CollectionHero';
import { Button } from '@/components/ui/button';
import { FaWhatsapp } from 'react-icons/fa';
import Reveal from '@/components/site/Reveal';
import { useAppSelector } from '@/store/hooks';
import { selectContentHydrated, selectGlobalData } from '@/store/contentSlice';
import { orderCategoriesWithCustomFirst } from '@/lib/storage';
import { whatsappLink } from '@/lib/whatsapp';
import { SITE } from '@/lib/seo';

const faqItems = [
  {
    question: 'What jewelry categories do you offer?',
    answer: 'We offer engagement rings, wedding bands, necklaces, earrings, bracelets, and custom diamond jewelry collections.',
  },
  {
    question: 'Are your diamonds certified?',
    answer: 'Yes. We provide certified lab-grown and natural diamonds with trusted grading standards.',
  },
  {
    question: 'Can I request a custom design?',
    answer: 'Yes. Our team can create custom designs, matching sets, and bespoke jewelry.',
  },
];

const Categories = () => {
  const { categories, contactInfo } = useAppSelector(selectGlobalData);
  const hydrated = useAppSelector(selectContentHydrated);
  const ordered = useMemo(() => orderCategoriesWithCustomFirst(categories), [categories]);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://starlinkjewels.com/categories#collectionpage',
    name: 'Jewelry Collections - Premium Diamond & Gold Jewelry | Starlink Jewels',
    description: 'Explore our premium jewelry collections featuring certified lab-grown and natural diamonds: rings, necklaces, earrings, and bracelets.',
    url: 'https://starlinkjewels.com/categories',
    mainEntityOfPage: 'https://starlinkjewels.com/categories',
    mainEntity: {
      '@type': 'ItemList',
      '@id': 'https://starlinkjewels.com/categories#itemlist',
      itemListElement: ordered.map((cat, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://starlinkjewels.com/category/${cat.id}`,
        name: cat.name,
      })),
    },
  };

  return (
    <SiteLayout>
      <SEOHead
        title="Jewelry Collections - Diamond Rings, Necklaces, Earrings & Bracelets"
        description="Explore our curated jewelry collections. Shop certified lab-grown and natural diamond rings, necklaces, earrings and bracelets, handcrafted in Surat with insured worldwide shipping."
        keywords="jewelry collections, diamond rings collection, diamond necklaces, diamond earrings, bracelets, engagement rings, wedding bands, solitaire rings, tennis bracelets, custom jewelry"
        canonicalUrl="https://starlinkjewels.com/categories"
        structuredData={structuredData}
        breadcrumbs={[
          { name: 'Home', url: 'https://starlinkjewels.com' },
          { name: 'Collections', url: 'https://starlinkjewels.com/categories' },
        ]}
        faqItems={faqItems}
      />

      <CollectionHero
        eyebrow="Collections"
        title="Our"
        accent="collections"
        description="From everyday diamonds to one-of-a-kind statement pieces, explore our curated categories of fine jewelry."
        breadcrumbs={[{ name: 'Home', to: '/' }, { name: 'Collections' }]}
        images={ordered.map((c) => c.image).slice(0, 3)}
        chips={[...(ordered.length > 0 ? [`${ordered.length} collections`] : []), 'IGI & GIA certified', 'Insured worldwide shipping']}
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="whatsapp" size="xl">
            <a href={whatsappLink("Hi Starlink Jewels! I'd like help choosing a piece from your collections.", contactInfo?.whatsapp)} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp /> Ask an expert
            </a>
          </Button>
          <Button asChild variant="outline" size="xl" className="bg-background/60">
            <a href={SITE.ringBuilder.url} target="_blank" rel="noopener" title={SITE.ringBuilder.title}>
              Design your ring <ArrowUpRight />
            </a>
          </Button>
        </div>
      </CollectionHero>

      <section className="section">
        <div className="container-wide">
          {ordered.length === 0 ? (
            hydrated ? (
              <p className="py-20 text-center text-muted-foreground">No collections available yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-muted" />
                ))}
              </div>
            )
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
              {ordered.map((category, i) => (
                <Reveal key={category.id} delay={(i % 3) * 90}>
                  <Link to={`/category/${category.id}`} className="group block">
                    <div className="glint relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted sm:rounded-3xl">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        loading={i < 3 ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                      <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/95 shadow transition-all duration-300 sm:bottom-4 sm:right-4 sm:h-11 sm:w-11 lg:opacity-0 lg:group-hover:opacity-100">
                        <ArrowUpRight className="h-5 w-5" />
                      </span>
                    </div>
                    <h2 className="mt-3 font-display text-lg leading-tight transition-colors group-hover:text-brand sm:mt-5 sm:text-3xl">{category.name}</h2>
                    {category.description && (
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:mt-2 sm:text-sm">{category.description}</p>
                    )}
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export default Categories;
