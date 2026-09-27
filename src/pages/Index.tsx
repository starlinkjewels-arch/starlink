import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Gem, Truck, PencilRuler, ShieldCheck, Star, Quote, Rotate3d } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import SEOHead from '@/components/SEOHead';
import SiteLayout from '@/components/site/SiteLayout';
import SectionHeading from '@/components/site/SectionHeading';
import Reveal from '@/components/site/Reveal';
import VideoReels from '@/components/site/VideoReels';
import BannerCarousel from '@/components/BannerCarousel';
import ProductCard from '@/components/ProductCard';
import CountUp from '@/components/site/CountUp';
import CdnImage from '@/components/site/CdnImage';
import Marquee from '@/components/site/Marquee';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadBlogs,
  loadProducts,
  selectBlogsLoaded,
  selectBlogsStatus,
  selectGlobalData,
  selectProductsLoaded,
  selectProductsStatus,
} from '@/store/contentSlice';
import { orderCategoriesWithCustomFirst, getProductCategoryIds } from '@/lib/storage';
import { getProductTime } from '@/lib/media';
import { BRAND } from '@/lib/brand';
import { SITE, stripHtml } from '@/lib/seo';
import { whatsappLink } from '@/lib/whatsapp';
import { DIAMOND_SHAPES } from '@/lib/search';
import DiamondShapeIcon from '@/components/site/DiamondShapeIcon';
import craftEarrings from '@/assets/craft/craft-1.jpg';
import craftBracelet from '@/assets/craft/craft-2.jpg';
import craftBand from '@/assets/craft/craft-3.jpg';

const promiseIcons = [ShieldCheck, Truck, PencilRuler, Gem];

const faqItems = [
  {
    question: 'Do you offer both lab-grown and natural diamonds?',
    answer: 'Yes. Starlink Jewels offers certified lab-grown diamonds and natural diamonds with authenticated grading and quality checks.',
  },
  {
    question: 'Can I customize an engagement ring or jewelry design?',
    answer: 'Yes. We provide custom design and manufacturing for engagement rings, wedding bands, and fine jewelry to match your preferences.',
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Yes. We ship globally with secure packaging and insured delivery options for select regions.',
  },
];

// Home page: each section earns its place by helping a visitor shop, design, learn or trust.
// Hero > collections > shapes > new arrivals > design your own > videos > lab vs natural >
// why Starlink > reviews > journal > trust bar. Gallery and guides live on their own pages.
const Index = () => {
  const dispatch = useAppDispatch();
  const { banners, categories, products, videos, testimonials, blogs, contactInfo } = useAppSelector(selectGlobalData);
  const productsLoaded = useAppSelector(selectProductsLoaded);
  const productsStatus = useAppSelector(selectProductsStatus);
  const blogsLoaded = useAppSelector(selectBlogsLoaded);
  const blogsStatus = useAppSelector(selectBlogsStatus);

  // Products load after first paint so the hero stays fast.
  useEffect(() => {
    if (productsLoaded || productsStatus !== 'idle') return;
    const id = window.setTimeout(() => dispatch(loadProducts()), 900);
    return () => window.clearTimeout(id);
  }, [dispatch, productsLoaded, productsStatus]);

  useEffect(() => {
    if (blogsLoaded || blogsStatus !== 'idle') return;
    const id = window.setTimeout(() => dispatch(loadBlogs()), 1800);
    return () => window.clearTimeout(id);
  }, [blogsLoaded, blogsStatus, dispatch]);

  const orderedCategories = useMemo(() => orderCategoriesWithCustomFirst(categories), [categories]);
  const categoryNameById = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const newArrivals = useMemo(
    () => [...products].sort((a, b) => getProductTime(b) - getProductTime(a)).slice(0, 8),
    [products]
  );
  const latestBlogs = useMemo(
    () => [...blogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3),
    [blogs]
  );
  const consultHref = whatsappLink("Hi Starlink Jewels! I'd like to design a custom piece.", contactInfo?.whatsapp);

  return (
    <SiteLayout>
      <SEOHead
        title="Premium Diamond & Gold Jewelry | Lab Grown & Natural Diamonds"
        description="Shop certified lab-grown and natural diamond jewelry at Starlink Jewels. Explore IGI & GIA certified engagement rings, wedding bands, necklaces, earrings & bracelets, handcrafted in Surat with insured worldwide shipping."
        keywords="diamond jewelry, lab grown diamonds, natural diamonds, engagement rings, wedding bands, certified jewelry, IGI certified, GIA certified, diamond necklaces, diamond earrings, tennis bracelets, custom jewelry design, wholesale diamond jewelry Surat"
        canonicalUrl="https://starlinkjewels.com"
        faqItems={faqItems}
      />

      {/* 1. Hero */}
      <BannerCarousel banners={banners} whatsappNumber={contactInfo?.whatsapp} />

      {/* 2. Kinetic ribbon */}
      <Marquee items={['Lab-grown', 'Natural', 'IGI certified', 'Made to order', 'Handcrafted in Surat', 'Shipped worldwide']} className="mt-8 border-y md:mt-12" />

      {/* 3. Shop by collection — bento grid */}
      {orderedCategories.length > 0 && (
        <section className="section">
          <div className="container-wide">
            <SectionHeading
              eyebrow="Shop by collection"
              title={<>Find the piece that <em className="accent">feels like you</em></>}
              action={{ label: 'View all', to: '/categories' }}
            />
            <div className="grid auto-rows-[170px] grid-cols-2 gap-3 sm:auto-rows-[240px] lg:auto-rows-[260px] lg:grid-cols-4 lg:gap-4">
              {orderedCategories.slice(0, 8).map((category, i) => (
                <Reveal
                  key={category.id}
                  delay={(i % 4) * 80}
                  // Phones show six tiles (big, wide, four small); desktop fills a full 4-column bento with eight.
                  className={i === 0 ? 'col-span-2 row-span-2' : i === 1 ? 'col-span-2' : i >= 6 ? 'hidden lg:block' : ''}
                >
                  <Link to={`/category/${category.id}`} className="group relative block h-full overflow-hidden rounded-3xl bg-secondary">
                    <CdnImage
                      src={category.image}
                      cdn={{ width: i === 0 ? 1000 : 600, quality: 82 }}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white md:p-6">
                      <div>
                        {i === 0 && <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">Featured</p>}
                        <h3 className={i === 0 ? 'font-display text-3xl font-semibold tracking-tight md:text-5xl' : 'font-display text-lg font-semibold tracking-tight md:text-2xl'}>
                          {category.name}
                        </h3>
                      </div>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-neutral-900 transition-transform duration-500 group-hover:rotate-45 md:h-10 md:w-10">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Shop by shape */}
      <section className="pb-16 md:pb-24">
        <div className="container-wide">
          <SectionHeading eyebrow="Shop by shape" title={<>Every cut, <em className="accent">perfected</em></>} />
          <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-5 sm:px-0 lg:grid-cols-10">
            {DIAMOND_SHAPES.map((shape) => (
              <Link
                key={shape}
                to={`/search?q=${encodeURIComponent(shape)}`}
                className="group flex w-[88px] shrink-0 snap-start flex-col items-center gap-2.5 rounded-2xl border bg-background px-2 py-4 transition-colors hover:border-brand hover:bg-brand-light sm:w-auto md:py-5"
              >
                <DiamondShapeIcon shape={shape} className="h-9 w-9 text-brand transition-transform duration-500 group-hover:scale-110 md:h-10 md:w-10" />
                <span className="text-xs font-semibold">{shape}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. New arrivals */}
      {newArrivals.length > 0 && (
        <section className="section bg-secondary">
          <div className="container-wide">
            <SectionHeading
              eyebrow="Just in"
              title={<>New <em className="accent">arrivals</em></>}
              action={{ label: 'Shop all', to: '/categories' }}
            />
            <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 sm:-mx-6 sm:scroll-px-6 sm:gap-5 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12 lg:overflow-visible lg:px-0">
              {newArrivals.map((product, i) => (
                <Reveal key={product.id} delay={(i % 4) * 90} className="w-[62vw] max-w-[300px] shrink-0 snap-start lg:w-auto lg:max-w-none">
                  <ProductCard product={product} categoryName={categoryNameById.get(getProductCategoryIds(product)[0])} swipeable={false} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Design your own: ring builder, 360° viewer and bespoke consultation */}
      <section className="section">
        <div className="container-wide">
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f1f3d] via-[#17305f] to-brand px-6 py-10 text-white md:px-14 md:py-16">
            <div className="pattern-lattice pointer-events-none absolute inset-0 -z-10 opacity-20" />
            <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
              <div>
                <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/70" /> Bespoke
                </p>
                <h2 className="heading-lg text-balance">
                  Design a ring that&rsquo;s <em className="accent text-white">only yours</em>
                </h2>
                <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75 md:text-lg">
                  Choose your diamond, setting and metal in our Ring Builder, inspect every angle in 360°, or share an idea and our designers will create it.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild variant="light" size="xl">
                    <a href={SITE.ringBuilder.url} target="_blank" rel="noopener" title={SITE.ringBuilder.title}>
                      <Gem /> {SITE.ringBuilder.label}
                    </a>
                  </Button>
                  <Button asChild variant="outline-light" size="xl">
                    <a href={SITE.viewer360.url} target="_blank" rel="noopener" title={SITE.viewer360.title}>
                      <Rotate3d /> {SITE.viewer360.label}
                    </a>
                  </Button>
                </div>
                <a href={consultHref} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/85 underline-offset-4 hover:text-white hover:underline">
                  <FaWhatsapp className="h-4 w-4 text-[#6ee7a0]" /> Or talk to a designer on WhatsApp
                </a>
              </div>
              <ol className="grid grid-cols-2 gap-3">
                {BRAND.process.map((step) => (
                  <li key={step.step} className="rounded-2xl border border-white/15 bg-white/[0.06] p-4 backdrop-blur md:p-5">
                    <span className="font-display text-sm font-semibold text-white/60">{step.step}</span>
                    <h3 className="mt-2 font-sans text-sm font-semibold md:text-base">{step.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-white/65 md:text-[13px]">{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Shoppable video reels */}
      {videos.length > 0 && (
        <section className="section overflow-hidden">
          <div className="container-wide">
            <SectionHeading eyebrow="Watch & shop" title={<>See the sparkle <em className="accent">in motion</em></>} />
            <VideoReels videos={videos} products={products} />
          </div>
        </section>
      )}

      {/* 8. Lab-grown vs natural */}
      <section className="section bg-secondary">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Know your diamond"
            title={<>Lab-grown or natural? <em className="accent">Both, beautifully.</em></>}
            action={{ label: 'Buying guide', to: '/buying-guide' }}
          />
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            {[
              { title: 'Lab-grown diamonds', image: craftBracelet, points: ['Identical fire & brilliance', 'IGI certified', 'Larger stones for your budget', 'Lower environmental footprint'] },
              { title: 'Natural diamonds', image: craftBand, points: ['Formed over billions of years', 'GIA / IGI certified', 'Rare & heirloom value', 'Responsibly sourced'] },
            ].map((card) => (
              <div key={card.title} className="grid grid-cols-[112px_1fr] overflow-hidden rounded-3xl border bg-card sm:grid-cols-[1fr_1.2fr]">
                <img src={card.image} alt={card.title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                <div className="p-5 md:p-8">
                  <h3 className="font-display text-xl font-semibold tracking-tight md:text-2xl">{card.title}</h3>
                  <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground md:mt-4 md:space-y-2">
                    {card.points.map((point) => (
                      <li key={point} className="flex items-center gap-2.5">
                        <span className="h-1 w-1 shrink-0 rounded-full bg-brand" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Why Starlink: brand story + key numbers in one block */}
      <section className="section">
        <div className="container-wide grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div className="aspect-[4/3] overflow-hidden rounded-[2rem] lg:aspect-[4/5]">
              <img
                src={craftEarrings}
                alt="Diamond earrings handcrafted by Starlink Jewels in Surat"
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <p className="eyebrow mb-4">Why Starlink</p>
            <h2 className="heading-lg text-balance">
              Crafted in Surat, the <em className="accent">diamond capital</em> of the world.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              Every piece is designed in-house, set by master artisans, certified by IGI or GIA and shipped insured to your door.
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-3">
              {BRAND.stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse gap-1 rounded-2xl bg-secondary p-4 md:p-5">
                  <dt className="text-xs text-muted-foreground md:text-sm">{stat.label}</dt>
                  <dd className="whitespace-nowrap font-display text-2xl font-semibold tracking-tight md:text-3xl">
                    <CountUp value={stat.value} />
                  </dd>
                </div>
              ))}
            </dl>
            <Button asChild size="lg" variant="outline" className="mt-8 rounded-full">
              <Link to="/about">
                Our story <ArrowRight />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* 10. Testimonials */}
      {testimonials.length > 0 && (
        <section className="section bg-secondary">
          <div className="container-wide">
            <SectionHeading eyebrow="Client love" title={<>Worn and loved <em className="accent">worldwide</em></>} align="center" />
            <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 sm:-mx-6 sm:scroll-px-6 sm:gap-5 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0">
              {testimonials.map((t, i) => (
                <Reveal
                  key={t.id}
                  delay={(i % 3) * 90}
                  className="flex w-[82vw] max-w-[420px] shrink-0 snap-start flex-col rounded-3xl border bg-card p-6 md:p-8 lg:w-[calc((100%-2.5rem)/3)] lg:max-w-none"
                >
                  <Quote className="h-6 w-6 text-brand/40" strokeWidth={1.2} />
                  <p className="mt-4 flex-1 font-display text-lg leading-relaxed md:text-[22px]">
                    “{t.text.trim().replace(/^["“”'‘’]+|["“”'‘’]+$/g, '')}”
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t pt-5">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <div className="flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className={`h-3.5 w-3.5 ${s < t.rating ? 'fill-brand text-brand' : 'text-border'}`} />
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* 11. Journal */}
      {latestBlogs.length > 0 && (
        <section className="section !pb-0">
          <div className="container-wide">
            <SectionHeading eyebrow="The journal" title={<>Guides &amp; <em className="accent">stories</em></>} action={{ label: 'Read the journal', to: '/blog' }} />
            <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0">
              {latestBlogs.map((blog) => (
                <Link key={blog.id} to={`/blog/${blog.id}`} className="group block w-[78vw] max-w-[340px] shrink-0 snap-start md:w-auto md:max-w-none">
                  <div className="aspect-[16/10] overflow-hidden rounded-3xl bg-muted">
                    <CdnImage
                      src={blog.thumbnail || blog.image}
                      cdn={{ width: 700, quality: 82 }}
                      alt={blog.title}
                      className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <time dateTime={blog.date} className="mt-4 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </time>
                  <h3 className="mt-2 line-clamp-2 font-display text-lg leading-snug transition-colors group-hover:text-brand md:text-xl">{blog.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{stripHtml(blog.content)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 12. Trust bar — closes the page just above the footer */}
      <section className="container-wide pb-16 pt-10 md:pb-24 md:pt-16">
        <ul className="grid grid-cols-2 divide-border rounded-3xl border lg:grid-cols-4 lg:divide-x">
          {BRAND.promises.map((item, i) => {
            const Icon = promiseIcons[i % promiseIcons.length];
            return (
              <li
                key={item.title}
                className={`flex items-center gap-3 p-4 md:gap-4 md:p-6 ${i < 2 ? 'border-b lg:border-b-0' : ''} ${i % 2 === 0 ? 'border-r lg:border-r-0' : ''}`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary md:h-11 md:w-11">
                  <Icon className="h-5 w-5 text-brand" strokeWidth={1.7} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-sm font-semibold leading-tight tracking-tight md:text-base">{item.title}</h3>
                  <p className="mt-0.5 hidden text-[13px] leading-snug text-muted-foreground md:block">{item.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </SiteLayout>
  );
};

export default Index;
