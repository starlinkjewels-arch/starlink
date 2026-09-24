import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, ShieldCheck, Truck, PencilRuler, MessageCircle } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import SiteLayout from '@/components/site/SiteLayout';
import CollectionHero from '@/components/site/CollectionHero';
import { FaWhatsapp } from 'react-icons/fa';
import Reveal from '@/components/site/Reveal';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { selectGlobalData } from '@/store/contentSlice';
import { orderCategoriesWithCustomFirst } from '@/lib/storage';
import { whatsappLink } from '@/lib/whatsapp';
import NotFound from './NotFound';

type CountryConfig = {
  name: string;
  slug: string;
  headline: string;
  description: string;
  shippingText: string;
  keywords: string;
};

const COUNTRIES: CountryConfig[] = [
  {
    name: 'United States',
    slug: 'usa',
    headline: 'Diamond jewelry delivered across the USA',
    description:
      'Shop certified lab-grown and natural diamond jewelry from Starlink Jewels with secure delivery to the United States. Custom designs, premium craftsmanship and WhatsApp support.',
    shippingText: 'Fast, insured international shipping to all US states with secure packaging and tracking.',
    keywords: 'diamond jewelry USA, lab grown diamonds USA, engagement rings USA, luxury jewelry USA, diamond necklace USA',
  },
  {
    name: 'Canada',
    slug: 'canada',
    headline: 'Luxury jewelry delivered across Canada',
    description:
      'Discover premium diamond and gold jewelry with delivery to Canada. Certified lab-grown and natural diamonds with custom design options.',
    shippingText: 'Secure international shipping to all Canadian provinces with tracking and insurance.',
    keywords: 'diamond jewelry Canada, lab grown diamonds Canada, engagement rings Canada, luxury jewelry Canada',
  },
  {
    name: 'Australia',
    slug: 'australia',
    headline: 'Premium diamond jewelry for Australia',
    description:
      'Shop certified diamond jewelry and custom designs delivered to Australia. Lab-grown and natural diamonds with expert craftsmanship.',
    shippingText: 'Tracked, insured shipping to all Australian states and territories.',
    keywords: 'diamond jewelry Australia, lab grown diamonds Australia, engagement rings Australia, luxury jewelry Australia',
  },
  {
    name: 'Germany',
    slug: 'germany',
    headline: 'Certified diamond jewelry delivered to Germany',
    description:
      'Explore Starlink Jewels diamond collections with secure delivery to Germany. Lab-grown and natural diamonds, custom jewelry and expert support.',
    shippingText: 'Reliable international shipping to Germany with secure packaging and tracking.',
    keywords: 'diamond jewelry Germany, lab grown diamonds Germany, engagement rings Germany, luxury jewelry Germany',
  },
];

const CountryLanding = () => {
  // Routes are static (/usa, /canada, ...), so the country comes from the path rather than a route param.
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  const config = COUNTRIES.find((c) => c.slug === slug);
  const { categories, contactInfo } = useAppSelector(selectGlobalData);
  const ordered = useMemo(() => orderCategoriesWithCustomFirst(categories).slice(0, 4), [categories]);

  if (!config) return <NotFound />;

  const benefits = [
    { icon: Truck, title: `Shipping to ${config.name}`, text: config.shippingText },
    { icon: ShieldCheck, title: 'Certified diamonds', text: 'Lab-grown and natural diamonds certified by IGI and GIA.' },
    { icon: PencilRuler, title: 'Made to order', text: 'Custom design and manufacturing with CAD approval before crafting.' },
    { icon: MessageCircle, title: 'Personal support', text: 'Chat directly with our experts on WhatsApp for quick answers.' },
  ];

  return (
    <SiteLayout>
      <SEOHead
        title={`Diamond Jewelry Shipping to ${config.name}`}
        description={config.description}
        keywords={config.keywords}
        canonicalUrl={`https://starlinkjewels.com/${config.slug}`}
        breadcrumbs={[
          { name: 'Home', url: 'https://starlinkjewels.com' },
          { name: config.name, url: `https://starlinkjewels.com/${config.slug}` },
        ]}
      />

      <CollectionHero
        eyebrow={`Delivering to ${config.name}`}
        title={config.headline}
        description={config.description}
        breadcrumbs={[{ name: 'Home', to: '/' }, { name: config.name }]}
        images={ordered.map((c) => c.image).slice(0, 3)}
        chips={[`Insured delivery to ${config.name}`, 'IGI & GIA certified', 'Made to order']}
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild size="xl">
            <Link to="/categories">Shop collections <ArrowUpRight /></Link>
          </Button>
          <Button asChild variant="whatsapp" size="xl">
            <a href={whatsappLink(`Hi Starlink Jewels! I'm in ${config.name} and would like to know more.`, contactInfo?.whatsapp)} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp /> Talk to an expert
            </a>
          </Button>
        </div>
      </CollectionHero>

      <section className="section">
        <div className="container-wide grid grid-cols-2 gap-x-5 gap-y-9 sm:gap-10 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 80}>
              <Icon className="h-7 w-7 text-brand" strokeWidth={1.4} />
              <h2 className="mt-5 font-sans text-base font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {ordered.length > 0 && (
        <section className="section border-t bg-secondary/40">
          <div className="container-wide">
            <p className="eyebrow mb-3">Popular in {config.name}</p>
            <h2 className="heading-lg mb-10">Explore our collections</h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
              {ordered.map((category) => (
                <Link key={category.id} to={`/category/${category.id}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
                    <img src={category.image} alt={category.name} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
                      <h3 className="font-display text-2xl">{category.name}</h3>
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
};

export default CountryLanding;
