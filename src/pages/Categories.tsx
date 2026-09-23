import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import SiteLayout from '@/components/site/SiteLayout';
import PageHero from '@/components/site/PageHero';
import Reveal from '@/components/site/Reveal';
import { useAppSelector } from '@/store/hooks';
import { selectContentHydrated, selectGlobalData } from '@/store/contentSlice';
import { orderCategoriesWithCustomFirst } from '@/lib/storage';

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
  const { categories } = useAppSelector(selectGlobalData);
  const hydrated = useAppSelector(selectContentHydrated);
  const ordered = useMemo(() => orderCategoriesWithCustomFirst(categories), [categories]);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://www.starlinkjewels.com/categories#collectionpage',
    name: 'Jewelry Collections - Premium Diamond & Gold Jewelry | Starlink Jewels',
    description: 'Explore our premium jewelry collections featuring certified lab-grown and natural diamonds: rings, necklaces, earrings, and bracelets.',
    url: 'https://www.starlinkjewels.com/categories',
    mainEntityOfPage: 'https://www.starlinkjewels.com/categories',
    mainEntity: {
      '@type': 'ItemList',
      '@id': 'https://www.starlinkjewels.com/categories#itemlist',
      itemListElement: ordered.map((cat, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://www.starlinkjewels.com/category/${cat.id}`,
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
        canonicalUrl="https://www.starlinkjewels.com/categories"
        structuredData={structuredData}
        breadcrumbs={[
          { name: 'Home', url: 'https://www.starlinkjewels.com' },
          { name: 'Collections', url: 'https://www.starlinkjewels.com/categories' },
        ]}
        faqItems={faqItems}
      />

      <PageHero
        eyebrow="Collections"
        title="Our collections"
        description="From everyday diamonds to one-of-a-kind statement pieces, explore our curated categories of fine jewelry."
        breadcrumbs={[{ name: 'Home', to: '/' }, { name: 'Collections' }]}
      />

      <section className="section">
        <div className="container-wide">
          {ordered.length === 0 ? (
            hydrated ? (
              <p className="py-20 text-center text-muted-foreground">No collections available yet.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] animate-pulse rounded-md bg-muted" />
                ))}
              </div>
            )
          ) : (
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {ordered.map((category, i) => (
                <Reveal key={category.id} delay={(i % 3) * 90}>
                  <Link to={`/category/${category.id}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        loading={i < 3 ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                      <span className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-background/95 opacity-0 shadow transition-all duration-300 group-hover:opacity-100">
                        <ArrowUpRight className="h-5 w-5" />
                      </span>
                    </div>
                    <h2 className="mt-5 font-display text-3xl transition-colors group-hover:text-brand">{category.name}</h2>
                    {category.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{category.description}</p>
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
