import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ChevronRight, Ruler } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import SiteLayout from '@/components/site/SiteLayout';
import Reveal from '@/components/site/Reveal';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import ProductCard from '@/components/ProductCard';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadProducts,
  selectContentHydrated,
  selectContentStatus,
  selectGlobalData,
  selectProductsLoaded,
  selectProductsStatus,
} from '@/store/contentSlice';
import { SITE, buildFaqForProduct, buildMetaDescriptionForProduct, buildMetaTitleForProduct, sanitizeMetaField, stripHtml } from '@/lib/seo';
import { getProductCategoryIds, productHasCategory } from '@/lib/storage';
import { getProductTime, isVideoUrl } from '@/lib/media';
import { trackProductView } from '@/lib/analytics';
import { recordRecentlyViewed, useRecentlyViewed } from '@/lib/wishlist';
import { useProductReviews } from '@/lib/reviews';
import ProductReviews, { Stars } from '@/components/product/ProductReviews';
import { categoryPath, categoryUrl, findProductByParam, productPath, productUrl } from '@/lib/urls';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { categories, products } = useAppSelector(selectGlobalData);
  const status = useAppSelector(selectContentStatus);
  const hydrated = useAppSelector(selectContentHydrated);
  const productsLoaded = useAppSelector(selectProductsLoaded);
  const productsStatus = useAppSelector(selectProductsStatus);
  const isReady = status === 'succeeded' || hydrated;
  const productsReady = productsLoaded || productsStatus === 'succeeded' || productsStatus === 'failed';

  const product = useMemo(() => findProductByParam(products, id) || null, [products, id]);
  const productCategoryIds = useMemo(() => (product ? getProductCategoryIds(product) : []), [product]);
  const category = useMemo(() => categories.find((c) => productCategoryIds.includes(c.id)) || null, [categories, productCategoryIds]);
  const media = useMemo(
    () => (product ? (product.images && product.images.length > 0 ? product.images : [product.image]).filter(Boolean) : []),
    [product]
  );
  const related = useMemo(() => {
    if (!product || !category) return [];
    return products
      .filter((p) => p.id !== product.id && productHasCategory(p, category.id))
      .sort((a, b) => getProductTime(b) - getProductTime(a))
      .slice(0, 4);
  }, [products, product, category]);

  useEffect(() => {
    if (!productsLoaded && productsStatus === 'idle') dispatch(loadProducts());
  }, [dispatch, productsLoaded, productsStatus]);

  // Old id-only links (/product/123) move to the keyword URL (/product/oval-halo-ring-123).
  const canonicalPath = product ? productPath(product) : null;
  useEffect(() => {
    if (canonicalPath && id && canonicalPath !== `/product/${id}`) navigate(canonicalPath, { replace: true });
  }, [canonicalPath, id, navigate]);

  const pageUrl = product ? productUrl(product) : `${SITE.url}/product/${id}`;

  useEffect(() => {
    if (!product) return;
    trackProductView(product.name);
    recordRecentlyViewed(product.id);
  }, [product]);

  const { reviews, average, count: reviewCount } = useProductReviews(product?.id);

  // "Recently viewed" row: other pieces this visitor opened (stored in this browser only).
  const recentIds = useRecentlyViewed();
  const recentlyViewed = useMemo(
    () => recentIds.filter((rid) => rid !== product?.id).map((rid) => products.find((p) => p.id === rid)).filter((p): p is (typeof products)[number] => Boolean(p)).slice(0, 4),
    [recentIds, products, product?.id]
  );

  if (!product) {
    const loading = !isReady || !productsReady;
    return (
      <SiteLayout>
        <SEOHead title={loading ? 'Loading Product' : 'Product Not Found'} description="Certified lab-grown and natural diamond jewelry by Starlink Jewels." canonicalUrl={pageUrl} noIndex={!loading} />
        {loading ? (
          <div className="container-wide grid gap-10 py-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div className="aspect-square animate-pulse rounded-md bg-muted" />
            <div className="space-y-4">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-12 w-full animate-pulse rounded bg-muted" />
              <div className="h-40 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
        ) : (
          <div className="container-wide py-28 text-center">
            <h1 className="heading-lg">This piece is no longer available</h1>
            <p className="mt-4 text-muted-foreground">Explore our collections or ask us to recreate something similar.</p>
            <Button asChild size="xl" className="mt-8">
              <Link to="/categories">Browse collections</Link>
            </Button>
          </div>
        )}
      </SiteLayout>
    );
  }

  const images = media.filter((url) => !isVideoUrl(url));
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${pageUrl}#product`,
    name: product.name,
    url: pageUrl,
    image: images.length > 0 ? images : undefined,
    description: stripHtml(product.description || '') || `${product.name} from Starlink Jewels`,
    sku: product.id,
    category: category?.name,
    mainEntityOfPage: pageUrl,
    brand: { '@type': 'Brand', name: SITE.name },
    manufacturer: { '@id': `${SITE.url}/#jewelry-store` },
    // No Offer/price: the page shows "Price on request" and Google requires structured data to match
    // what visitors see. Add an Offer here only if prices become visible on the page.
    // Ratings only from approved customer reviews shown on this page.
    ...(reviewCount > 0
      ? {
          aggregateRating: { '@type': 'AggregateRating', ratingValue: average.toFixed(1), reviewCount, bestRating: 5, worstRating: 1 },
          review: reviews.slice(0, 5).map((r) => ({
            '@type': 'Review',
            reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
            author: { '@type': 'Person', name: r.name },
            ...(r.createdAt?.toDate ? { datePublished: r.createdAt.toDate().toISOString().slice(0, 10) } : {}),
            ...(r.title ? { name: r.title } : {}),
            reviewBody: r.text,
          })),
        }
      : {}),
  };

  return (
    <SiteLayout hideFloatingWhatsApp>
      <SEOHead
        title={sanitizeMetaField(product.metaTitle) || buildMetaTitleForProduct(product.name, category?.name)}
        description={sanitizeMetaField(product.metaDescription, 30) || buildMetaDescriptionForProduct(product.name, category?.name, product.description)}
        canonicalUrl={pageUrl}
        ogImage={images[0]}
        ogType="product"
        structuredData={structuredData}
        breadcrumbs={[
          { name: 'Home', url: 'https://starlinkjewels.com' },
          { name: 'Collections', url: 'https://starlinkjewels.com/categories' },
          ...(category ? [{ name: category.name, url: categoryUrl(category) }] : []),
          { name: product.name, url: pageUrl },
        ]}
        faqItems={product.seoFaq && product.seoFaq.length > 0 ? product.seoFaq : buildFaqForProduct(product.name, category?.name)}
      />

      <div className="container-wide pb-16 pt-4 md:pb-24 md:pt-6">
        <nav aria-label="Breadcrumb" className="mb-4 md:mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Home</Link></li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li><Link to="/categories" className="hover:text-foreground">Collections</Link></li>
            {category && (
              <>
                <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
                <li><Link to={categoryPath(category)} className="hover:text-foreground">{category.name}</Link></li>
              </>
            )}
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li className="line-clamp-1 text-foreground" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <ProductGallery media={media} name={product.name} layout="side" className="min-w-0 lg:sticky lg:top-36" />

          <div className="min-w-0">
            {category && <p className="eyebrow mb-3">{category.name}</p>}
            <h1 className="font-display text-[1.75rem] leading-tight text-balance break-words sm:text-3xl lg:text-[40px]">{product.name}</h1>
            {reviewCount > 0 && (
              <a href="#reviews" className="mt-2 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <Stars value={average} /> {average.toFixed(1)} · {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </a>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-b pb-6">
              <span className="text-lg font-semibold text-brand">Price on request</span>
              <span className="text-xs text-muted-foreground">Made to order · Certified diamonds · Insured delivery</span>
              {category && /ring|band/i.test(category.name) && (
                <Link to="/ring-size-guide" className="flex items-center gap-1.5 text-xs font-semibold text-brand underline-offset-4 hover:underline">
                  <Ruler className="h-3.5 w-3.5" /> Find your ring size
                </Link>
              )}
            </div>
            <div className="mt-6">
              <ProductInfo product={product} />
            </div>
          </div>
        </div>
      </div>

      <ProductReviews productId={product.id} productName={product.name} reviews={reviews} average={average} />

      {related.length > 0 && category && (
        <section className="border-t bg-secondary/40 py-16 md:py-20">
          <div className="container-wide">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-3">You may also like</p>
                <h2 className="heading-md">More from {category.name}</h2>
              </div>
              <Link to={categoryPath(category)} className="link-underline shrink-0">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={i * 70}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container-wide">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-3">Your history</p>
                <h2 className="heading-md">Recently viewed</h2>
              </div>
              <Link to="/wishlist" className="link-underline shrink-0">
                Wishlist <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
              {recentlyViewed.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mobile sticky enquiry bar */}
      {/* Glass chrome (DESIGN.md §4.1). The enquiry button is the single tinted
          control on this screen - nothing else here competes for prominence. */}
      <div className="glass fixed inset-x-0 bottom-0 z-40 border-t border-border/80 p-3 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm font-medium">{product.name}</p>
            <p className="text-xs font-semibold text-brand">Price on request</p>
          </div>
          <WhatsAppButton product={product} variant="whatsapp" size="default" label="Enquire" className="shrink-0 rounded-full px-5" />
        </div>
      </div>
      <div className="h-20 lg:hidden" aria-hidden />
    </SiteLayout>
  );
};

export default ProductDetail;
