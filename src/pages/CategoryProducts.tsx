import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, LayoutGrid, Grid3X3 } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import SiteLayout from '@/components/site/SiteLayout';
import CollectionHero from '@/components/site/CollectionHero';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/site/ProductFilters';
import { EMPTY_FILTERS, filtersFromParams, getProductAttributes, matchesFilters, writeFiltersToParams, type ProductFilterState } from '@/lib/productAttributes';
import { DIAMOND_SHAPES } from '@/lib/search';
import { SHAPE_INFO, SUBCOLLECTION_MIN, collectionTakesShapes, isRealSubCollection, shapeFromSlug, shapeSlug } from '@/lib/subcollections';
import { Button } from '@/components/ui/button';
import {
  CATEGORY_FILLER,
  SITE,
  buildFaqForCategory,
  buildMetaDescriptionForCategory,
  buildMetaTitleForCategory,
  fitDescription,
  fitTitle,
  stripHtml,
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
import { cn } from '@/lib/utils';
import CdnImage from '@/components/site/CdnImage';
import { Segmented } from '@/components/ui/segmented';
import { Cascade } from '@/components/ui/cascade';
import { categoryPath, categoryUrl, findCategoryByParam, productUrl } from '@/lib/urls';

type SortOption = 'newest' | 'oldest' | 'name';

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 3xl:grid-cols-5">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i}>
        <div className="aspect-[4/5] skeleton rounded-md" />
        <div className="mt-4 h-5 w-3/4 skeleton rounded" />
        <div className="mt-2 h-4 w-1/2 skeleton rounded" />
      </div>
    ))}
  </div>
);

const CategoryProducts = () => {
  // /category/:id, or a shape sub-collection /category/:id/:shape (e.g. /category/rings/oval).
  const { id: param, shape: shapeParam } = useParams<{ id: string; shape?: string }>();
  const shape = shapeFromSlug(shapeParam);
  const dispatch = useAppDispatch();
  const { categories, products } = useAppSelector(selectGlobalData);
  const status = useAppSelector(selectContentStatus);
  const hydrated = useAppSelector(selectContentHydrated);
  const productsLoaded = useAppSelector(selectProductsLoaded);
  const productsStatus = useAppSelector(selectProductsStatus);
  const isReady = status === 'succeeded' || hydrated;
  const productsReady = productsLoaded || productsStatus === 'succeeded' || productsStatus === 'failed';

  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [dense, setDense] = useState(false);
  // The cascade runs once, on the grid's first paint. Re-sorts, filter changes and
  // later inserts must not re-animate (DESIGN.md §5.3 D).
  const firstPaint = useRef(true);
  useEffect(() => {
    if (productsReady) {
      const t = setTimeout(() => { firstPaint.current = false; }, 600);
      return () => clearTimeout(t);
    }
  }, [productsReady]);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // The URL segment is a slug (/category/eternity-bands) or a legacy id (/category/1764824647332).
  const category = useMemo(() => findCategoryByParam(categories, param) ?? null, [categories, param]);
  const id = category?.id ?? param;
  const canonicalPath = category ? categoryPath(category) : null;
  // Keep the shape segment through the legacy-id redirect, or /category/<id>/oval would
  // quietly land on the whole collection.
  const shapeSuffix = shape ? `/${shapeSlug(shape)}` : '';
  useEffect(() => {
    if (canonicalPath && param && canonicalPath !== `/category/${param}`) navigate(`${canonicalPath}${shapeSuffix}${window.location.search}`, { replace: true });
  }, [canonicalPath, param, navigate, shapeSuffix]);
  // A second segment that is not a diamond shape is not a page: go to the collection.
  useEffect(() => {
    if (shapeParam && !shape && canonicalPath) navigate(canonicalPath, { replace: true });
  }, [shapeParam, shape, canonicalPath, navigate]);
  const relatedCategories = useMemo(() => categories.filter((c) => c.id !== id).slice(0, 6), [categories, id]);

  const sortedProducts = useMemo(() => {
    const list = products.filter((p) => productHasCategory(p, id || ''));
    if (sortBy === 'name') return list.sort((a, b) => a.name.localeCompare(b.name));
    return list.sort((a, b) => (sortBy === 'oldest' ? getProductTime(a) - getProductTime(b) : getProductTime(b) - getProductTime(a)));
  }, [products, id, sortBy]);

  // On a shape page the collection IS that shape's pieces; the remaining filters (metal,
  // carat, lab/natural) still narrow within it.
  const baseProducts = useMemo(
    () => (shape ? sortedProducts.filter((p) => getProductAttributes(p).shapes.includes(shape)) : sortedProducts),
    [sortedProducts, shape],
  );

  // Shape pages that clear the bar for this collection — linked from the collection and
  // from each other. Same rule as the pre-render (src/lib/subcollections.ts).
  const shapeLinks = useMemo(() => {
    if (!category || !collectionTakesShapes(category.name)) return [];
    return DIAMOND_SHAPES.map((s) => ({
      shape: s,
      count: sortedProducts.filter((p) => getProductAttributes(p).shapes.includes(s)).length,
    })).filter((l) => l.count >= SUBCOLLECTION_MIN);
  }, [category, sortedProducts]);

  // Filters live in the URL (?shape=oval&metal=rose) so a filtered view can be shared.
  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams]);
  const setFilters = (next: ProductFilterState) => setSearchParams(writeFiltersToParams(searchParams, next), { replace: true });
  const visibleProducts = useMemo(() => baseProducts.filter((p) => matchesFilters(p, filters)), [baseProducts, filters]);

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
    const fromProducts = baseProducts.map((p) => firstImage(p)).filter((url): url is string => Boolean(url) && !isVideoUrl(url));
    const unique = Array.from(new Set(fromProducts)).slice(0, 3);
    return unique.length > 0 ? unique : category?.image ? [category.image] : [];
  }, [baseProducts, category?.image]);

  const collectionUrl = category ? categoryUrl(category) : `${SITE.url}/category/${param}`;
  // A shape page is its own collection URL; everything below describes whichever page this is.
  const baseUrl = shape ? `${collectionUrl}/${shapeSlug(shape)}` : collectionUrl;
  const shapeHeading = shape && category ? `${shape} Diamond ${category.name}` : null;
  // Indexable only when it is a real page — same rule as the pre-render. A thin shape view
  // stays usable but is noindex (it is never pre-rendered or linked, so only a typed URL
  // or a shared filter reaches it).
  const shapeIsReal = Boolean(shape && category && isRealSubCollection(category.name, baseProducts.length));

  const structuredData = category
    ? [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': `${baseUrl}#collectionpage`,
          name: `${shapeHeading ?? category.name} - Starlink Jewels`,
          description: (shape && SHAPE_INFO[shape]) || category.description || `Shop our ${category.name} collection`,
          url: baseUrl,
          mainEntityOfPage: baseUrl,
          mainEntity: {
            '@type': 'ItemList',
            '@id': `${baseUrl}#itemlist`,
            numberOfItems: baseProducts.length,
            itemListElement: baseProducts.slice(0, 20).map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'Product',
                '@id': `${productUrl(p)}#product`,
                name: p.name,
                image: p.images && p.images.length > 0 ? p.images : [p.image],
                url: productUrl(p),
                description: stripHtml(p.description || '') || `${p.name} from Starlink Jewels`,
                sku: p.id,
                category: category.name,
                brand: { '@type': 'Brand', name: SITE.name },
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
          noIndex={!stillLoading}
        />
        {stillLoading ? (
          <div className="container-wide py-16">
            <div className="mb-10 h-14 w-72 skeleton rounded" />
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
      {shape && shapeHeading ? (
        // Shape page — title, description and breadcrumbs mirror scripts/seo-data.mjs so
        // the head React renders matches the pre-rendered one crawlers read first.
        <SEOHead
          title={fitTitle([`${shapeHeading} – Lab-Grown & Natural`, `${shapeHeading} – Certified`, shapeHeading])}
          description={fitDescription(
            `Shop ${baseProducts.length} ${shape.toLowerCase()} diamond ${category.name.toLowerCase()} at ${SITE.name}. ${SHAPE_INFO[shape]}`,
            CATEGORY_FILLER,
          )}
          keywords={`${shape.toLowerCase()} diamond ${category.name.toLowerCase()}, ${shape.toLowerCase()} cut ${category.name.toLowerCase()}`}
          // Self-canonical even when thin. noindex already keeps it out; pointing the
          // canonical at the collection as well sends the mixed signal Google advises
          // against ("this duplicates X" and "drop this" at once).
          canonicalUrl={baseUrl}
          noIndex={!shapeIsReal}
          followLinks
          structuredData={structuredData}
          breadcrumbs={[
            { name: 'Home', url: 'https://starlinkjewels.com' },
            { name: 'Collections', url: 'https://starlinkjewels.com/categories' },
            { name: category.name, url: collectionUrl },
            { name: shapeHeading, url: baseUrl },
          ]}
        />
      ) : (
        <SEOHead
          title={category.metaTitle || buildMetaTitleForCategory(category.name)}
          description={category.metaDescription || buildMetaDescriptionForCategory(category.name, category.description)}
          keywords={`${category.name.toLowerCase()}, ${category.name.toLowerCase()} jewelry, diamond ${category.name.toLowerCase()}, lab grown diamond ${category.name.toLowerCase()}, luxury ${category.name.toLowerCase()}`}
          canonicalUrl={baseUrl}
          structuredData={structuredData}
          breadcrumbs={[
            { name: 'Home', url: 'https://starlinkjewels.com' },
            { name: 'Collections', url: 'https://starlinkjewels.com/categories' },
            { name: category.name, url: baseUrl },
          ]}
          faqItems={category.seoFaq?.length ? category.seoFaq : buildFaqForCategory(category.name)}
        />
      )}

      <CollectionHero
        eyebrow={shape ? `${shape} cut` : 'Collection'}
        title={shapeHeading ?? category.name}
        accent={shape ? undefined : 'collection'}
        description={shape ? SHAPE_INFO[shape] : category.description}
        breadcrumbs={
          shape && shapeHeading
            ? [{ name: 'Home', to: '/' }, { name: 'Collections', to: '/categories' }, { name: category.name, to: categoryPath(category) }, { name: shapeHeading }]
            : [{ name: 'Home', to: '/' }, { name: 'Collections', to: '/categories' }, { name: category.name }]
        }
        images={heroImages}
      />

      {shapeLinks.length > 0 && (
        // Real links, so crawlers can reach the shape pages from the collection (and the
        // shape pages from each other). Mirrors the pre-rendered "Shop by shape" nav.
        <nav aria-label="Shop by shape" className="container-wide pt-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Shop by shape</p>
          <ul className="flex flex-wrap gap-2">
            {shape && (
              <li>
                <Link
                  to={categoryPath(category)}
                  className="inline-flex h-10 items-center rounded-full border border-border px-4 text-sm font-medium transition-colors hover:border-foreground"
                >
                  All {category.name.toLowerCase()}
                </Link>
              </li>
            )}
            {shapeLinks.map((l) => {
              const active = l.shape === shape;
              return (
                <li key={l.shape}>
                  <Link
                    to={`${categoryPath(category)}/${shapeSlug(l.shape)}`}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors',
                      active ? 'border-brand bg-brand text-brand-foreground' : 'border-border hover:border-foreground',
                    )}
                  >
                    {l.shape}
                    <span className={cn('tabular-nums text-xs', active ? 'opacity-80' : 'text-muted-foreground')}>{l.count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <section className="container-wide py-10 md:py-14">
        {productsReady && baseProducts.length > 0 && (
          <ProductFilters
            products={baseProducts}
            value={filters}
            onChange={setFilters}
            resultCount={visibleProducts.length}
            trailing={
              <>
                {/* Sort is single-select, so it uses the shared selection pill rather
                    than a dropdown (DESIGN.md §2 rule 9). Labels are shortened to fit
                    three segments on one row; the accessible names stay explicit. */}
                <Segmented
                  label="Sort products"
                  variant="plain"
                  size="sm"
                  value={sortBy}
                  onValueChange={(v) => setSortBy(v as SortOption)}
                  items={[
                    { value: 'newest', label: 'Newest', srLabel: 'Newest first' },
                    { value: 'oldest', label: 'Oldest', srLabel: 'Oldest first' },
                    { value: 'name', label: 'A–Z', srLabel: 'Name A to Z' },
                  ]}
                />
                {/* One selection language (DESIGN.md §2 rule 9 / §6.2): density uses the
                    same sliding pill as every other single-select in the product. */}
                <Segmented
                  className="hidden lg:inline-flex"
                  label="Grid density"
                  variant="plain"
                  size="sm"
                  value={dense ? 'compact' : 'large'}
                  onValueChange={(v) => setDense(v === 'compact')}
                  items={[
                    { value: 'large', label: '', srLabel: 'Larger grid', icon: <LayoutGrid className="h-4 w-4" /> },
                    { value: 'compact', label: '', srLabel: 'Compact grid', icon: <Grid3X3 className="h-4 w-4" /> },
                  ]}
                />
              </>
            }
          />
        )}

        {!productsReady ? (
          <ProductGridSkeleton />
        ) : baseProducts.length === 0 ? (
          <div className="rounded-md border border-dashed py-20 text-center">
            <p className="font-display text-2xl">New pieces are on their way</p>
            <p className="mt-2 text-sm text-muted-foreground">Check back soon, or ask us about custom designs in this style.</p>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed py-20 text-center">
            <p className="font-display text-2xl">No pieces match these filters</p>
            <p className="mt-2 text-sm text-muted-foreground">Try removing a filter, or ask us to make this exact combination for you.</p>
            <Button variant="outline" className="mt-6" onClick={() => setFilters(EMPTY_FILTERS)}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className={cn('grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6 lg:gap-y-14', dense ? 'lg:grid-cols-4 xl:grid-cols-5 3xl:grid-cols-6' : 'lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5')}>
            {visibleProducts.map((product, i) => (
              <Cascade key={product.id} index={i} enabled={firstPaint.current}>
                <ProductCard product={product} priority={i < 4} />
              </Cascade>
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
                <Link key={c.id} to={categoryPath(c)} className="group block">
                  <div className="aspect-square overflow-hidden rounded-md bg-muted">
                    <CdnImage src={c.image} cdn={{ width: 400, quality: 82 }} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
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
