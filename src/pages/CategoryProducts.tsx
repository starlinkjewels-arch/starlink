import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, LayoutGrid, Grid3X3 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import SEOHead from '@/components/SEOHead';
import SiteLayout from '@/components/site/SiteLayout';
import CollectionHero from '@/components/site/CollectionHero';
import Reveal from '@/components/site/Reveal';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  buildFaqForCategory,
  buildOffer,
  buildMetaDescriptionForCategory,
  buildMetaTitleForCategory,
  SITE,
} from '@/lib/seo';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadProducts,
  selectContentHydrated,
  selectContentStatus,
  selectGlobalData,
  selectProductsLoaded,
  selectProductsStatus,
} from '@/store/contentSlice';
import { productHasCategory } from '@/lib/storage';
import { firstImage, getProductTime, isVideoUrl } from '@/lib/media';
import { whatsappLink } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

type SortOption = 'newest' | 'oldest' | 'name';

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i}>
        <div className="aspect-[4/5] animate-pulse rounded-md bg-muted" />
        <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    ))}
  </div>
);

const CategoryProducts = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { categories, products, contactInfo } = useAppSelector(selectGlobalData);
  const status = useAppSelector(selectContentStatus);
  const hydrated = useAppSelector(selectContentHydrated);
  const productsLoaded = useAppSelector(selectProductsLoaded);
  const productsStatus = useAppSelector(selectProductsStatus);
  const isReady = status === 'succeeded' || hydrated;
  const productsReady = productsLoaded || productsStatus === 'succeeded' || productsStatus === 'failed';

  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [dense, setDense] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const category = useMemo(() => categories.find((c) => c.id === id) ?? null, [categories, id]);
  const relatedCategories = useMemo(() => categories.filter((c) => c.id !== id).slice(0, 6), [categories, id]);

  const sortedProducts = useMemo(() => {
    const list = products.filter((p) => productHasCategory(p, id || ''));
    if (sortBy === 'name') return list.sort((a, b) => a.name.localeCompare(b.name));
    return list.sort((a, b) => (sortBy === 'oldest' ? getProductTime(a) - getProductTime(b) : getProductTime(b) - getProductTime(a)));
  }, [products, id, sortBy]);

  useEffect(() => {
    if (!productsLoaded && productsStatus === 'idle') dispatch(loadProducts());
  }, [dispatch, productsLoaded, productsStatus]);

  // Old quick-view links (/category/:id?product=:productId) now go straight to the product page.
  const legacyProductId = searchParams.get('product');
  useEffect(() => {
    if (legacyProductId) navigate(`/product/${legacyProductId}`, { replace: true });
  }, [legacyProductId, navigate]);

  // Hero collage: the collection's newest pieces, falling back to the category image.
  const heroImages = useMemo(() => {
    const fromProducts = sortedProducts.map((p) => firstImage(p)).filter((url): url is string => Boolean(url) && !isVideoUrl(url));
    const unique = Array.from(new Set(fromProducts)).slice(0, 3);
    return unique.length > 0 ? unique : category?.image ? [category.image] : [];
  }, [sortedProducts, category?.image]);

  const baseUrl = `https://www.starlinkjewels.com/category/${id}`;

  const structuredData = category
    ? [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': `${baseUrl}#collectionpage`,
          name: `${category.name} - Starlink Jewels`,
          description: category.description || `Shop our ${category.name} collection`,
          url: baseUrl,
          mainEntityOfPage: baseUrl,
          mainEntity: {
            '@type': 'ItemList',
            '@id': `${baseUrl}#itemlist`,
            numberOfItems: sortedProducts.length,
            itemListElement: sortedProducts.slice(0, 20).map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'Product',
                '@id': `https://www.starlinkjewels.com/product/${p.id}#product`,
                name: p.name,
                image: p.images && p.images.length > 0 ? p.images : [p.image],
                description: p.description || `${p.name} from Starlink Jewels`,
                sku: p.id,
                category: category.name,
                brand: { '@type': 'Brand', name: 'Starlink Jewels' },
                offers: buildOffer(`https://www.starlinkjewels.com/product/${p.id}`, p.price),
              },
            })),
          },
        },
      ]
    : undefined;

  if (!category) {
    const stillLoading = !isReady;
    return (
      <SiteLayout>
        <SEOHead
          title={stillLoading ? 'Loading Collection' : 'Collection Not Found'}
          description="Explore Starlink Jewels collections of certified lab-grown and natural diamond jewelry."
          canonicalUrl={baseUrl}
        />
        {stillLoading ? (
          <div className="container-wide py-16">
            <div className="mb-10 h-14 w-72 animate-pulse rounded bg-muted" />
            <ProductGridSkeleton />
          </div>
        ) : (
          <div className="container-wide py-28 text-center">
            <h1 className="heading-lg">Collection not found</h1>
            <p className="mt-4 text-muted-foreground">It may have been renamed or removed.</p>
            <Button asChild size="xl" className="mt-8">
              <Link to="/categories">Browse all collections</Link>
            </Button>
          </div>
        )}
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <SEOHead
        title={category.metaTitle || buildMetaTitleForCategory(category.name)}
        description={category.metaDescription || buildMetaDescriptionForCategory(category.name, category.description)}
        keywords={`${category.name.toLowerCase()}, ${category.name.toLowerCase()} jewelry, diamond ${category.name.toLowerCase()}, lab grown diamond ${category.name.toLowerCase()}, luxury ${category.name.toLowerCase()}`}
        canonicalUrl={baseUrl}
        structuredData={structuredData}
        breadcrumbs={[
          { name: 'Home', url: 'https://www.starlinkjewels.com' },
          { name: 'Collections', url: 'https://www.starlinkjewels.com/categories' },
          { name: category.name, url: baseUrl },
        ]}
        faqItems={category.seoFaq?.length ? category.seoFaq : buildFaqForCategory(category.name)}
      />

      <CollectionHero
        eyebrow="Collection"
        title={category.name}
        accent="collection"
        description={category.description}
        breadcrumbs={[{ name: 'Home', to: '/' }, { name: 'Collections', to: '/categories' }, { name: category.name }]}
        images={heroImages}
        chips={[...(productsReady ? [`${sortedProducts.length} ${sortedProducts.length === 1 ? 'piece' : 'pieces'}`] : []), 'IGI & GIA certified', 'Made to order']}
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild size="xl">
            <a href={whatsappLink(`Hi Starlink Jewels! I'm interested in your ${category.name} collection.`, contactInfo?.whatsapp)} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp /> Ask an expert
            </a>
          </Button>
          <Button asChild size="xl" variant="outline" className="bg-background/60">
            <a href={SITE.ringBuilder.url} target="_blank" rel="noopener" title={SITE.ringBuilder.title}>
              Design your own <ArrowUpRight />
            </a>
          </Button>
        </div>
      </CollectionHero>

      {/* Category pills for quick switching */}
      {categories.length > 1 && (
        <div className="border-b">
          <div className="container-wide scrollbar-hide flex gap-2 overflow-x-auto py-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/category/${c.id}`}
                className={cn(
                  'shrink-0 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] transition-colors',
                  c.id === id ? 'border-foreground bg-foreground text-background' : 'hover:border-foreground'
                )}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <section className="container-wide py-10 md:py-14">
        <div className="mb-8 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {productsReady ? `${sortedProducts.length} ${sortedProducts.length === 1 ? 'piece' : 'pieces'}` : 'Loading pieces…'}
          </p>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="h-10 w-[160px] text-sm" aria-label="Sort products">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="name">Name A–Z</SelectItem>
              </SelectContent>
            </Select>
            <div className="hidden overflow-hidden rounded-md border lg:flex">
              <button
                type="button"
                onClick={() => setDense(false)}
                className={cn('flex h-10 w-10 items-center justify-center', !dense && 'bg-foreground text-background')}
                aria-label="Larger grid"
                aria-pressed={!dense}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDense(true)}
                className={cn('flex h-10 w-10 items-center justify-center', dense && 'bg-foreground text-background')}
                aria-label="Compact grid"
                aria-pressed={dense}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {!productsReady ? (
          <ProductGridSkeleton />
        ) : sortedProducts.length === 0 ? (
          <div className="rounded-md border border-dashed py-20 text-center">
            <p className="font-display text-2xl">New pieces are on their way</p>
            <p className="mt-2 text-sm text-muted-foreground">Check back soon, or ask us about custom designs in this style.</p>
          </div>
        ) : (
          <div className={cn('grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6 lg:gap-y-14', dense ? 'lg:grid-cols-4 xl:grid-cols-5' : 'lg:grid-cols-3 xl:grid-cols-4')}>
            {sortedProducts.map((product, i) => (
              <Reveal key={product.id} delay={(i % 4) * 60}>
                <ProductCard product={product} priority={i < 4} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {relatedCategories.length > 0 && (
        <section className="border-t bg-secondary/40 py-16 md:py-20">
          <div className="container-wide">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-3">Keep exploring</p>
                <h2 className="heading-md">More collections</h2>
              </div>
              <Link to="/categories" className="link-underline shrink-0">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {relatedCategories.map((c) => (
                <Link key={c.id} to={`/category/${c.id}`} className="group block">
                  <div className="aspect-square overflow-hidden rounded-md bg-muted">
                    <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
                  </div>
                  <p className="mt-3 text-sm font-medium group-hover:text-brand">{c.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </SiteLayout>
  );
};

export default CategoryProducts;
