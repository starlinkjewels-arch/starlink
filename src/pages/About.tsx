import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import SiteLayout from '@/components/site/SiteLayout';
import PageHero from '@/components/site/PageHero';
import SectionHeading from '@/components/site/SectionHeading';
import Reveal from '@/components/site/Reveal';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { selectGlobalData } from '@/store/contentSlice';
import { BRAND } from '@/lib/brand';
import { whatsappLink } from '@/lib/whatsapp';
import craftEarrings from '@/assets/craft/craft-1.jpg';
import craftBracelet from '@/assets/craft/craft-2.jpg';
import craftBand from '@/assets/craft/craft-3.jpg';
import craftFancy from '@/assets/craft/craft-4.jpg';

const values = [
  { title: 'Excellence', text: 'We never compromise on quality, ensuring every piece meets our exacting standards.' },
  { title: 'Integrity', text: 'Transparency and honesty in all our dealings, from sourcing to customer service.' },
  { title: 'Passion', text: 'Every creation is infused with dedication to the art of jewelry making.' },
  { title: 'Responsibility', text: 'Committed to ethical sourcing and environmentally responsible practices.' },
];

const expertise = [
  { title: 'Master artisans', text: 'Our skilled craftsmen bring decades of experience to every setting and polish.' },
  { title: 'Timeless design', text: 'Pieces that transcend trends, offering elegance that lasts a lifetime.' },
  { title: 'Certified quality', text: 'Lab-grown and natural diamonds certified by IGI and GIA.' },
  { title: 'Rare gemstones', text: 'Access to fine diamonds and fancy-colored stones from trusted sources worldwide.' },
];

const faqItems = [
  {
    question: 'How long has Starlink Jewels been in business?',
    answer: 'Starlink Jewels has been designing, manufacturing and exporting diamond and gold jewelry since 2011.',
  },
  {
    question: 'Do you offer certified diamonds?',
    answer: 'Yes. We offer certified lab-grown and natural diamonds with trusted grading standards.',
  },
  {
    question: 'Do you serve international clients?',
    answer: 'Yes. We serve clients globally with secure delivery and customer support.',
  },
];

const About = () => {
  const { contactInfo } = useAppSelector(selectGlobalData);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': 'https://www.starlinkjewels.com/about#aboutpage',
    name: 'About Starlink Jewels - Diamond Jewelry Manufacturer Since 2011',
    description: 'Starlink Jewels is a Surat-based manufacturer of lab-grown and natural diamond jewelry, crafting made-to-order pieces since 2011.',
    url: 'https://www.starlinkjewels.com/about',
    mainEntityOfPage: 'https://www.starlinkjewels.com/about',
    mainEntity: {
      '@type': 'Organization',
      '@id': 'https://www.starlinkjewels.com/#jewelry-store',
      name: 'Starlink Jewels',
      foundingDate: String(BRAND.founded),
      areaServed: 'Worldwide',
      knowsAbout: ['Diamond Jewelry', 'Gold Jewelry', 'Custom Jewelry Design', 'Lab Grown Diamonds'],
    },
  };

  return (
    <SiteLayout>
      <SEOHead
        title="About Us - Diamond Jewelry Manufacturer Since 2011"
        description="Discover Starlink Jewels: crafting certified lab-grown and natural diamond jewelry in Surat since 2011. Master craftsmanship, ethical sourcing and made-to-order pieces for clients worldwide."
        keywords="about starlink jewels, diamond jewelry manufacturer, jewelry brand story, lab grown diamond manufacturer Surat, custom jewelry makers, wholesale jewelry supplier, ethical diamond sourcing"
        canonicalUrl="https://www.starlinkjewels.com/about"
        structuredData={structuredData}
        breadcrumbs={[
          { name: 'Home', url: 'https://www.starlinkjewels.com' },
          { name: 'About', url: 'https://www.starlinkjewels.com/about' },
        ]}
        faqItems={faqItems}
      />

      <PageHero
        image={craftBracelet}
        eyebrow={`Est. ${BRAND.founded}`}
        title="Crafting dreams into reality"
        description="For over a decade, Starlink Jewels has transformed precious metals and diamonds into timeless pieces that celebrate life's most precious moments."
        breadcrumbs={[{ name: 'Home', to: '/' }, { name: 'About' }]}
      />

      {/* Story */}
      <section className="section">
        <div className="container-wide grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="eyebrow mb-4">Our journey</p>
            <h2 className="heading-lg text-balance">A modern manufacturer with a legacy of craft</h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              <p>
                Starlink Jewels is a modern fine jewelry manufacturer and supplier specialising in both lab-grown and natural diamond
                jewelry. With a strong focus on craftsmanship, ethical sourcing and precision, we create timeless designs that blend luxury
                with everyday wearability. Every piece is made to order, ensuring superior quality, attention to detail and complete
                customisation.
              </p>
              <p>
                We proudly serve jewelers and buyers worldwide, offering reliable production, competitive pricing and consistent quality.
                From concept and CAD design to final polishing and secure worldwide delivery, we manage the entire process in-house,
                giving our clients confidence, transparency and peace of mind.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-4">
            {[craftEarrings, craftBand, craftFancy, craftBracelet].map((src, i) => (
              <Reveal key={src} delay={i * 90} className={i % 2 === 1 ? 'mt-10' : ''}>
                <div className="aspect-[4/5] overflow-hidden rounded-md bg-muted">
                  <img src={src} alt="Diamond jewelry handcrafted by Starlink Jewels" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-secondary/40">
        <dl className="container-wide grid grid-cols-2 gap-y-10 py-14 md:grid-cols-4">
          {BRAND.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80} className="flex flex-col-reverse text-center">
              <dt className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">{stat.label}</dt>
              <dd className="font-display text-4xl md:text-5xl">{stat.value}</dd>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* Vision & mission */}
      <section className="section">
        <div className="container-wide grid gap-12 md:grid-cols-2 md:gap-16">
          <Reveal className="border-t pt-8">
            <p className="eyebrow mb-4">Our vision</p>
            <p className="font-display text-2xl leading-snug md:text-3xl">
              To become a globally trusted jewelry manufacturing partner, known for innovation, ethical diamonds and exceptional
              craftsmanship, while setting new standards in quality and design.
            </p>
          </Reveal>
          <Reveal delay={120} className="border-t pt-8">
            <p className="eyebrow mb-4">Our mission</p>
            <p className="font-display text-2xl leading-snug md:text-3xl">
              To deliver finely crafted diamond jewelry that meets international standards, supports sustainable practices, and helps our
              partners grow, combining advanced technology, skilled artistry and honest pricing.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Process */}
      <section className="section bg-neutral-950 text-neutral-100">
        <div className="container-wide">
          <SectionHeading
            eyebrow="How we work"
            title={<span className="text-neutral-100">From idea to heirloom</span>}
            description={<span className="text-neutral-400">A transparent, collaborative process managed entirely in-house.</span>}
            className="[&_.eyebrow]:!text-neutral-400"
          />
          <ol className="grid gap-px overflow-hidden rounded-md bg-neutral-800 sm:grid-cols-2 lg:grid-cols-4">
            {BRAND.process.map((step, i) => (
              <Reveal as="li" key={step.step} delay={i * 90} className="bg-neutral-950 p-8">
                <span className="font-display text-5xl text-neutral-700">{step.step}</span>
                <h3 className="mt-6 font-sans text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Values & expertise */}
      <section className="section">
        <div className="container-wide grid gap-16 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="What we stand for" title="Our values" className="!mb-8" />
            <ul className="divide-y border-y">
              {values.map((v, i) => (
                <Reveal as="li" key={v.title} delay={i * 70} className="grid grid-cols-[48px_1fr] gap-4 py-6">
                  <span className="font-display text-2xl text-brand">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="font-sans text-base font-semibold">{v.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading eyebrow="Why Starlink" title="Why clients choose us" className="!mb-8" />
            <ul className="divide-y border-y">
              {expertise.map((e, i) => (
                <Reveal as="li" key={e.title} delay={i * 70} className="grid grid-cols-[48px_1fr] gap-4 py-6">
                  <span className="font-display text-2xl text-brand">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="font-sans text-base font-semibold">{e.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{e.text}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-secondary/40">
        <div className="container-wide flex flex-col items-center py-20 text-center md:py-24">
          <p className="eyebrow mb-4">Begin your journey</p>
          <h2 className="heading-lg max-w-2xl text-balance">Discover the piece that tells your story</h2>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="xl">
              <Link to="/categories">Browse collections</Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <a href={whatsappLink("Hi Starlink Jewels! I'd like to schedule a consultation.", contactInfo?.whatsapp)} target="_blank" rel="noopener noreferrer">
                Schedule a consultation
              </a>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default About;
