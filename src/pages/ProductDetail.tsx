import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
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
import { buildFaqForProduct, buildMetaDescriptionForProduct, buildMetaTitleForProduct, buildOffer, stripHtml } from '@/lib/seo';
import { getProductCategoryIds, productHasCategory } from '@/lib/storage';
import { getProductTime, isVideoUrl } from '@/lib/media';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { categories, products } = useAppSelector(selectGlobalData);
  const status = useAppSelector(selectContentStatus);
  const hydrated = useAppSelector(selectContentHydrated);
  const productsLoaded = useAppSelector(selectProductsLoaded);
  const productsStatus = useAppSelector(selectProductsStatus);
  const isReady = status === 'succeeded' || hydrated;
  const productsReady = productsLoaded || productsStatus === 'succeeded' || productsStatus === 'failed';

  const product = useMemo(() => products.find((p) => p.id === id) || null, [products, id]);
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

  const pageUrl = `https://www.starlinkjewels.com/product/${id}`;

  if (!product) {
    const loading = !isReady || !productsReady;
    return (
      <SiteLayout>
        <SEOHead title={loading ? 'Loading Product' : 'Product Not Found'} description="Certified lab-grown and natural diamond jewelry by Starlink Jewels." canonicalUrl={pageUrl} />
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
    image: images.length > 0 ? images : undefined,
    description: stripHtml(product.description || '') || `${product.name} from Starlink Jewels`,
    sku: product.id,
    category: category?.name,
    mainEntityOfPage: pageUrl,
    brand: { '@type': 'Brand', name: 'Starlink Jewels' },
    offers: buildOffer(pageUrl, product.price),
  };

  return (
    <SiteLayout hideFloatingWhatsApp>
      <SEOHead
        title={product.metaTitle || buildMetaTitleForProduct(product.name)}
        description={product.metaDescription || buildMetaDescriptionForProduct(product.name, category?.name)}
        canonicalUrl={pageUrl}
        ogImage={images[0]}
        ogType="product"
        structuredData={structuredData}
        breadcrumbs={[
          { name: 'Home', url: 'https://www.starlinkjewels.com' },
          { name: 'Collections', url: 'https://www.starlinkjewels.com/categories' },
          ...(category ? [{ name: category.name, url: `https://www.starlinkjewels.com/category/${category.id}` }] : []),
          { name: product.name, url: pageUrl },
        ]}
        faqItems={product.seoFaq && product.seoFaq.length > 0 ? product.seoFaq : buildFaqForProduct(product.name, category?.name)}
      />

      <div className="container-wide pb-16 pt-6 md:pb-24">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Home</Link></li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li><Link to="/categories" className="hover:text-foreground">Collections</Link></li>
            {category && (
              <>
                <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
                <li><Link to={`/category/${category.id}`} className="hover:text-foreground">{category.name}</Link></li>
              </>
            )}
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li className="line-clamp-1 text-foreground" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <ProductGallery media={media} name={product.name} layout="side" className="lg:sticky lg:top-36" />

          <div>
            {category && <p className="eyebrow mb-3">{category.name}</p>}
            <h1 className="font-display text-3xl leading-tight text-balance lg:text-[40px]">{product.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-b pb-6">
              <span className="text-lg font-semibold text-brand">Price on request</span>
              <span className="text-xs text-muted-foreground">Made to order · Certified diamonds · Insured delivery</span>
            </div>
            <div className="mt-6">
              <ProductInfo product={product} />
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && category && (
        <section className="border-t bg-secondary/40 py-16 md:py-20">
          <div className="container-wide">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-3">You may also like</p>
                <h2 className="heading-md">More from {category.name}</h2>
              </div>
              <Link to={`/category/${category.id}`} className="link-underline shrink-0">
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

      {/* Mobile sticky enquiry bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur-xl lg:hidden">
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
