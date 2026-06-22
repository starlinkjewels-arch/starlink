import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { OptimizedImage } from "@/components/OptimizedImage";
import Header from "@/components/Header";
import MiniHeader from "@/components/MiniHeader";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProductCard from "@/components/ProductCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadProducts, selectContentHydrated, selectContentStatus, selectGlobalData, selectProductsLoaded, selectProductsStatus } from "@/store/contentSlice";
import { buildFaqForProduct, buildMetaDescriptionForProduct, buildMetaTitleForProduct, buildOffer, cleanRichTextHtml } from "@/lib/seo";
import { getProductCategoryIds, productHasCategory } from "@/lib/storage";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { preloadMedia } from "@/lib/preload";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { categories, promoHeader, products } = useAppSelector(selectGlobalData);
  const status = useAppSelector(selectContentStatus);
  const hydrated = useAppSelector(selectContentHydrated);
  const productsLoaded = useAppSelector(selectProductsLoaded);
  const productsStatus = useAppSelector(selectProductsStatus);
  const isReady = status === "succeeded" || hydrated;
  const productsReady = productsLoaded || productsStatus === "succeeded" || productsStatus === "failed";

  const hasPromo = promoHeader?.enabled && promoHeader?.text;
  const promoHeight = hasPromo ? 40 : 0;
  const paddingTop = promoHeight + 80 + 52 + 24;

  const product = useMemo(() => products.find((p) => p.id === id) || null, [products, id]);
  const productCategoryIds = useMemo(() => (product ? getProductCategoryIds(product) : []), [product]);
  const category = useMemo(
    () => categories.find((c) => productCategoryIds.includes(c.id)) || null,
    [categories, productCategoryIds]
  );

  const relatedProducts = useMemo(() => {
    if (!product || !category) return [];
    return products
      .filter((p) => p.id !== product.id && productHasCategory(p, category.id))
      .slice(0, 8);
  }, [products, product, category]);

  const media = product?.images && product.images.length > 0 ? product.images : product?.image ? [product.image] : [];
  const descriptionHtml = useMemo(() => cleanRichTextHtml(product?.description || ""), [product?.description]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentMedia = media[selectedIndex] || null;
  const hasMultiple = media.length > 1;

  const getMediaType = (url: string): "image" | "video" => {
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv)$/i;
    return videoExtensions.test(url) || url.includes("video") ? "video" : "image";
  };

  useEffect(() => {
    if (!productsLoaded && productsStatus === "idle") {
      dispatch(loadProducts());
    }
  }, [dispatch, productsLoaded, productsStatus]);

  useEffect(() => {
    if (media.length === 0) return;
    const urls = [media[0], media[1]].filter(Boolean) as string[];
    preloadMedia(urls);
  }, [media]);

  const structuredData = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `https://starlinkjewels.com/product/${product.id}#product`,
        name: product.name,
        image: media.length > 0 ? media : undefined,
        description: product.description || `${product.name} from Starlink Jewels`,
        sku: product.id,
        category: category?.name,
        mainEntityOfPage: `https://starlinkjewels.com/product/${product.id}`,
        brand: {
          "@type": "Brand",
          name: "Starlink Jewels",
        },
        offers: {
          ...buildOffer(`https://starlinkjewels.com/product/${product.id}`, product.price),
        },
      }
    : undefined;

  if (!product && (!isReady || !productsReady)) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="Loading Product"
          description="Loading product details."
          canonicalUrl={`https://starlinkjewels.com/product/${id}`}
        />
        <Header promoHeader={promoHeader} />
        <MiniHeader categories={categories} promoHeight={promoHeight} />
        <main className="flex-1 container mx-auto px-4 py-12" style={{ paddingTop: `${paddingTop}px` }}>
          <div className="h-10 w-72 bg-muted rounded-md animate-pulse mb-4" />
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="aspect-square bg-muted rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-6 w-2/3 bg-muted rounded-md animate-pulse" />
              <div className="h-8 w-1/3 bg-muted rounded-md animate-pulse" />
              <div className="h-40 bg-muted rounded-md animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="Product Not Found"
          description="The requested product could not be found."
          canonicalUrl={`https://starlinkjewels.com/product/${id}`}
        />
        <Header promoHeader={promoHeader} />
        <MiniHeader categories={categories} promoHeight={promoHeight} />
        <main className="flex-1 container mx-auto px-4 py-12" style={{ paddingTop: `${paddingTop}px` }}>
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Product not found.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={product.metaTitle || buildMetaTitleForProduct(product.name)}
        description={product.metaDescription || buildMetaDescriptionForProduct(product.name, category?.name)}
        canonicalUrl={`https://starlinkjewels.com/product/${product.id}`}
        structuredData={structuredData}
        breadcrumbs={[
          { name: "Home", url: "https://starlinkjewels.com" },
          { name: "Categories", url: "https://starlinkjewels.com/categories" },
          ...(category ? [{ name: category.name, url: `https://starlinkjewels.com/category/${category.id}` }] : []),
          { name: product.name, url: `https://starlinkjewels.com/product/${product.id}` },
        ]}
        faqItems={product.seoFaq && product.seoFaq.length > 0 ? product.seoFaq : buildFaqForProduct(product.name, category?.name)}
      />

      <Header promoHeader={promoHeader} />
      <MiniHeader categories={categories} promoHeight={promoHeight} />

      <main className="flex-1 container mx-auto px-4 py-12" style={{ paddingTop: `${paddingTop}px` }}>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/categories" className="hover:text-primary transition-colors">Shop</Link>
          {category && (
            <>
              <span>/</span>
              <Link to={`/category/${category.id}`} className="hover:text-primary transition-colors">{category.name}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground line-clamp-1 max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-[5fr_7fr] gap-10 items-start">
          {/* Left — Image Gallery */}
          <div className="lg:sticky lg:top-28">
            <div className="relative w-full rounded-2xl bg-muted overflow-hidden" style={{ maxHeight: '420px', aspectRatio: '1/1' }}>
              {currentMedia && getMediaType(currentMedia) === "video" ? (
                <video src={currentMedia} className="w-full h-full object-cover" controls />
              ) : (
                currentMedia && (
                  <OptimizedImage
                    src={currentMedia}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    wrapperClassName="w-full h-full"
                  />
                )
              )}
              {hasMultiple && (
                <>
                  <button
                    onClick={() => setSelectedIndex((prev) => (prev - 1 + media.length) % media.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-zinc-800/90 shadow-lg backdrop-blur-sm border border-border/40"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedIndex((prev) => (prev + 1) % media.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-zinc-800/90 shadow-lg backdrop-blur-sm border border-border/40"
                    aria-label="Next"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {media.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedIndex(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === selectedIndex ? "w-5 bg-white" : "w-1.5 bg-white/60"}`}
                        aria-label={`Image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {hasMultiple && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {media.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIndex(i)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${selectedIndex === i ? "border-primary shadow-md scale-105" : "border-transparent opacity-70 hover:opacity-100"}`}
                  >
                    {getMediaType(item) === "video" ? (
                      <video src={item} className="w-full h-full object-cover" muted />
                    ) : (
                      <OptimizedImage
                        src={item}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-cover"
                        wrapperClassName="w-full h-full"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — Product Info */}
          <div className="flex flex-col gap-6">
            {/* Category tag */}
            {category && (
              <Link
                to={`/category/${category.id}`}
                className="inline-flex items-center w-fit gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide hover:bg-primary/20 transition-colors"
              >
                {category.name}
              </Link>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">{product.name}</h1>

            {/* Price */}
            {product.price && (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">{product.price}</span>
              </div>
            )}

            <hr className="border-border" />

            {/* Description */}
            {descriptionHtml && (
              <div
                className="prose prose-sm max-w-none text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 py-4 border-y border-border">
              <div className="flex flex-col items-center text-center gap-1">
                <span className="text-lg">💎</span>
                <span className="text-xs text-muted-foreground font-medium">GIA / IGI Certified</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <span className="text-lg">🚚</span>
                <span className="text-xs text-muted-foreground font-medium">Free Worldwide Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <span className="text-lg">✏️</span>
                <span className="text-xs text-muted-foreground font-medium">Custom Design Available</span>
              </div>
            </div>

            {/* CTA Button */}
            <WhatsAppButton product={product} className="w-full text-base py-6" />

            {/* View full category link */}
            {category && (
              <p className="text-sm text-center text-muted-foreground">
                Looking for more options?{" "}
                <Link to={`/category/${category.id}`} className="text-primary underline underline-offset-2 hover:opacity-80">
                  View all {category.name} jewelry
                </Link>
              </p>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">More from {category?.name}</h2>
              {category && (
                <Link to={`/category/${category.id}`} className="text-sm text-primary underline">
                  View all
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={() => navigate(`/product/${p.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
