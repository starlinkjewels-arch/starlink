import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Gem, Truck, PencilRuler, ShieldCheck, Star, Quote } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import SiteLayout from '@/components/site/SiteLayout';
import SectionHeading from '@/components/site/SectionHeading';
import Reveal from '@/components/site/Reveal';
import VideoReels from '@/components/site/VideoReels';
import BannerCarousel from '@/components/BannerCarousel';
import ProductCard from '@/components/ProductCard';
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
import { stripHtml } from '@/lib/seo';
import { whatsappLink } from '@/lib/whatsapp';
import { BRAND } from '@/lib/brand';
import { DIAMOND_SHAPES } from '@/lib/search';
import DiamondShapeIcon from '@/components/site/DiamondShapeIcon';
import Marquee from '@/components/site/Marquee';
import CountUp from '@/components/site/CountUp';
import Parallax from '@/components/site/Parallax';
import craftEarrings from '@/assets/craft/craft-1.jpg';
import craftBracelet from '@/assets/craft/craft-2.jpg';
import craftBand from '@/assets/craft/craft-3.jpg';
import craftFancy from '@/assets/craft/craft-4.jpg';

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

const Index = () => {
  const dispatch = useAppDispatch();
  const { banners, categories, products, featuredCollection, galleryItems, blogs, videos, testimonials, contactInfo } =
    useAppSelector(selectGlobalData);
  const productsLoaded = useAppSelector(selectProductsLoaded);
  const productsStatus = useAppSelector(selectProductsStatus);
  const blogsLoaded = useAppSelector(selectBlogsLoaded);
  const blogsStatus = useAppSelector(selectBlogsStatus);

  // Products and blogs load after first paint so the hero stays fast.
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

      {/* 2. Promise strip */}
      <section className="container-wide">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {BRAND.promises.map((item, i) => {
            const Icon = promiseIcons[i % promiseIcons.length];
            return (
              <Reveal key={item.title} delay={i * 80} className="group flex flex-col gap-4 rounded-3xl border p-5 transition-colors hover:bg-secondary md:p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary transition-colors group-hover:bg-background">
                  <Icon className="h-5 w-5 text-brand" strokeWidth={1.7} />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">{item.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 2b. Kinetic ribbon */}
      <Marquee items={['Lab-grown', 'Natural', 'IGI certified', 'Made to order', 'Handcrafted in Surat', 'Shipped worldwide']} className="mt-10 border-y md:mt-16" />

      {/* 3. Shop by category — bento grid */}
      {orderedCategories.length > 0 && (
        <section className="section">
          <div className="container-wide">
            <SectionHeading
              eyebrow="Shop by collection"
              title={<>Find the piece that <em className="accent">feels like you</em></>}
              action={{ label: 'View all collections', to: '/categories' }}
            />
            <div className="grid auto-rows-[190px] grid-cols-2 gap-3 sm:auto-rows-[240px] lg:auto-rows-[260px] lg:grid-cols-4 lg:gap-4">
              {orderedCategories.slice(0, 8).map((category, i) => (
                <Reveal
                  key={category.id}
                  delay={(i % 4) * 80}
                  className={i === 0 ? 'col-span-2 row-span-2' : i === 1 ? 'col-span-2' : ''}
                >
                  <Link to={`/category/${category.id}`} className="group relative block h-full overflow-hidden rounded-3xl bg-secondary">
                    <img
                      src={category.image}
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
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-neutral-900 transition-transform duration-500 group-hover:rotate-45">
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

      {/* 3b. Shop by shape */}
      <section className="pb-16 md:pb-28">
        <div className="container-wide">
          <SectionHeading eyebrow="Shop by shape" title={<>Every cut, <em className="accent">perfected</em></>} align="center" className="!mb-10" />
          <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-5 sm:px-0 lg:grid-cols-10">
            {DIAMOND_SHAPES.map((shape, i) => (
              <Reveal key={shape} delay={(i % 5) * 50} className="shrink-0">
                <Link
                  to={`/search?q=${encodeURIComponent(shape)}`}
                  className="group flex w-24 flex-col items-center gap-3 rounded-3xl bg-secondary px-2 py-6 transition-all duration-500 hover:-translate-y-1.5 hover:bg-primary hover:text-primary-foreground hover:shadow-xl sm:w-auto"
                >
                  <DiamondShapeIcon shape={shape} className="h-11 w-11 text-brand transition-all duration-700 group-hover:rotate-[360deg] group-hover:text-white" />
                  <span className="text-xs font-semibold">{shape}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. New arrivals */}
      {newArrivals.length > 0 && (
        <section className="section bg-secondary">
          <div className="container-wide">
            <SectionHeading
              eyebrow="Just in"
              title={<>New <em className="accent">arrivals</em></>}
              description="Freshly finished in our Surat workshop, certified and ready to make yours."
              action={{ label: 'Shop all', to: '/categories' }}
            />
            <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12 lg:overflow-visible lg:px-0">
              {newArrivals.map((product, i) => (
                <Reveal key={product.id} delay={(i % 4) * 90} className="w-[64vw] max-w-[300px] shrink-0 snap-start lg:w-auto lg:max-w-none">
                  <ProductCard product={product} categoryName={categoryNameById.get(getProductCategoryIds(product)[0])} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Shoppable video reels */}
      {videos.length > 0 && (
        <section className="section overflow-hidden">
          <div className="container-wide">
            <SectionHeading
              eyebrow="Watch & shop"
              title={<>See the sparkle <em className="accent">in motion</em></>}
              description="Photos can't capture fire and brilliance. Tap a video to see each piece up close and enquire instantly."
            />
            <VideoReels videos={videos} products={products} />
          </div>
        </section>
      )}

      {/* 6. Curated edit (featured collection) */}
      {featuredCollection.length > 0 && (
        <section className="section">
          <div className="container-wide">
            <SectionHeading eyebrow="The edit" title={<>Curated by <em className="accent">our designers</em></>} align="center" />
            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
              {featuredCollection.slice(0, 5).map((item, i) => (
                <Reveal
                  key={item.id}
                  delay={(i % 3) * 90}
                  className={i === 0 ? 'h-full md:row-span-2' : 'h-full'}
                >
                  <figure className="group relative h-full overflow-hidden rounded-3xl bg-muted">
                    <img
                      src={item.image}
                      alt={item.title}
                      className={`h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105 ${i === 0 ? 'aspect-[4/5] md:aspect-auto' : 'aspect-[16/10]'}`}
                      loading="lazy"
                      decoding="async"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                      <h3 className="font-display text-2xl md:text-3xl">{item.title}</h3>
                      {item.description && <p className="mt-1 line-clamp-2 max-w-md text-sm text-white/80">{item.description}</p>}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Lab-grown vs natural education */}
      <section className="section bg-secondary">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Know your diamond"
            title={<>Lab-grown or natural? <em className="accent">Both, beautifully.</em></>}
            description="Chemically and optically identical, certified to the same standards. The choice is about what matters to you."
            align="center"
          />
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: 'Lab-Grown Diamonds',
                image: craftBracelet,
                points: ['Identical fire & brilliance', 'IGI certified', 'Larger stones for your budget', 'Lower environmental footprint'],
              },
              {
                title: 'Natural Diamonds',
                image: craftBand,
                points: ['Formed over billions of years', 'GIA / IGI certified', 'Rare & heirloom value', 'Responsibly sourced'],
              },
            ].map((card, i) => (
              <Reveal key={card.title} delay={i * 120} className="group grid overflow-hidden rounded-3xl border bg-card sm:grid-cols-2">
                <div className="aspect-square overflow-hidden sm:aspect-auto">
                  <img src={card.image} alt={card.title} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" loading="lazy" decoding="async" />
                </div>
                <div className="flex flex-col justify-center p-7 md:p-9">
                  <h3 className="heading-md">{card.title}</h3>
                  <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
                    {card.points.map((point) => (
                      <li key={point} className="flex items-center gap-2.5">
                        <span className="h-1 w-1 rounded-full bg-brand" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Link to="/buying-guide" className="link-underline mt-7 self-start">
                    Read the buying guide <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Brand story */}
      <section className="section">
        <div className="container-wide grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="relative">
            <Parallax speed={30}>
              <div className="aspect-[4/5] overflow-hidden rounded-[2rem]">
                <img src={craftEarrings} alt="Rose-cut diamond earrings handcrafted by Starlink Jewels" className="h-full w-full scale-110 object-cover" loading="lazy" decoding="async" />
              </div>
            </Parallax>
            <Parallax speed={-60} className="absolute -bottom-8 -right-4 hidden w-2/5 sm:block lg:-right-10">
              <div className="overflow-hidden rounded-3xl border-8 border-background shadow-2xl">
                <img src={craftFancy} alt="Fancy colored diamond bracelet" className="aspect-square h-full w-full object-cover" loading="lazy" decoding="async" />
              </div>
            </Parallax>
          </Reveal>
          <Reveal delay={120}>
            <p className="eyebrow mb-4">Our story</p>
            <h2 className="heading-lg text-balance">Crafted in Surat, the <em className="accent">diamond capital</em> of the world.</h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
              Since 2011, Starlink Jewels has combined traditional craftsmanship with modern design. From ethically sourced diamonds to
              hand-finished settings, every piece is made to order, certified, and shipped insured to clients in over 30 countries.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {['In-house CAD design, casting, setting and polishing', 'IGI & GIA certified lab-grown and natural diamonds', 'Trusted by jewelers and private clients worldwide'].map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
                    <ShieldCheck className="h-3 w-3" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <Button asChild size="xl" className="mt-10 rounded-full">
              <Link to="/about">Discover our story</Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* 8b. Stats band */}
      <section className="container-wide pb-16 md:pb-28">
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {BRAND.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80} className="flex flex-col-reverse justify-between gap-5 rounded-3xl bg-secondary p-6 md:p-7">
              <dt className="text-sm text-muted-foreground">{stat.label}</dt>
              <dd className="whitespace-nowrap font-display text-3xl font-semibold tracking-tight md:text-4xl xl:text-5xl">
                <CountUp value={stat.value} />
              </dd>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* 9. Testimonials */}
      {testimonials.length > 0 && (
        <section className="section bg-secondary">
          <div className="container-wide">
            <SectionHeading eyebrow="Client love" title={<>Worn and loved <em className="accent">worldwide</em></>} align="center" />
            <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
              {testimonials.map((t, i) => (
                <Reveal
                  key={t.id}
                  delay={(i % 3) * 90}
                  className="flex w-[85vw] max-w-[420px] shrink-0 snap-start flex-col rounded-3xl border bg-card p-8 lg:w-[calc((100%-2.5rem)/3)] lg:max-w-none"
                >
                  <Quote className="h-7 w-7 text-brand/40" strokeWidth={1.2} />
                  <p className="mt-5 flex-1 font-display text-xl leading-relaxed md:text-[22px]">
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

      {/* 10. Gallery preview */}
      {galleryItems.length > 0 && (
        <section className="section">
          <div className="container-wide">
            <SectionHeading eyebrow="Gallery" title={<>From our <em className="accent">atelier</em></>} action={{ label: 'View full gallery', to: '/gallery' }} />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2 md:gap-4">
              {galleryItems.slice(0, 5).map((item, i) => (
                <Reveal key={item.id} delay={(i % 4) * 70} className={i === 0 ? 'col-span-2 row-span-2' : ''}>
                  <Link to="/gallery" className="group block h-full overflow-hidden rounded-3xl bg-muted">
                    <img
                      src={item.image}
                      alt={item.description || 'Starlink Jewels gallery'}
                      className="aspect-square h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 11. Journal */}
      {latestBlogs.length > 0 && (
        <section className="section bg-secondary">
          <div className="container-wide">
            <SectionHeading eyebrow="The journal" title={<>Guides, stories &amp; <em className="accent">trends</em></>} action={{ label: 'Read the journal', to: '/blog' }} />
            <div className="grid gap-8 md:grid-cols-3">
              {latestBlogs.map((blog, i) => (
                <Reveal key={blog.id} delay={i * 90}>
                  <Link to={`/blog/${blog.id}`} className="group block">
                    <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
                      <img
                        src={blog.thumbnail || blog.image}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <time dateTime={blog.date} className="mt-5 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </time>
                    <h3 className="mt-2 font-display text-2xl leading-snug transition-colors group-hover:text-brand">{blog.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{stripHtml(blog.content)}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 12. Custom design CTA */}
      <section className="section">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Bespoke service"
            title={<>From your idea to a <em className="accent">certified heirloom</em></>}
            description="Share a sketch, a photo or just an idea. Our designers guide you from CAD render to the finished piece."
            align="center"
          />
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BRAND.process.map((step, i) => (
              <Reveal as="li" key={step.step} delay={i * 90} className="relative rounded-3xl bg-secondary p-7 transition-shadow hover:shadow-[0_20px_40px_-24px_rgba(15,27,51,0.4)]">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy font-display text-xl text-gold">{step.step}</span>
                <h3 className="mt-5 font-sans text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </Reveal>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild variant="whatsapp" size="xl" className="rounded-full">
              <a href={consultHref} target="_blank" rel="noopener noreferrer">
                Start your design on WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" size="xl" className="rounded-full">
              <Link to="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Index;
