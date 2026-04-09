import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import MiniHeader from "@/components/MiniHeader";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadProducts, selectContentHydrated, selectContentStatus, selectGlobalData, selectProductsLoaded, selectProductsStatus } from "@/store/contentSlice";
import { buildFaqForProduct, buildMetaDescriptionForProduct, buildMetaTitleForProduct, buildOffer } from "@/lib/seo";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { preloadMedia } from "@/lib/preload";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
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
  const category = useMemo(
    () => categories.find((c) => c.id === product?.categoryId) || null,
    [categories, product?.categoryId]
  );

  const media = product?.images && product.images.length > 0 ? product.images : product?.image ? [product.image] : [];
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
        "@id": `https://www.starlinkjewels.com/product/${product.id}#product`,
        name: product.name,
        image: media.length > 0 ? media : undefined,
        description: product.description || `${product.name} from Starlink Jewels`,
        sku: product.id,
        category: category?.name,
        mainEntityOfPage: `https://www.starlinkjewels.com/product/${product.id}`,
        brand: {
          "@type": "Brand",
          name: "Starlink Jewels",
        },
        offers: {
          ...buildOffer(`https://www.starlinkjewels.com/product/${product.id}`, product.price),
        },
      }
    : undefined;

  if (!product && (!isReady || !productsReady)) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="Loading Product"
          description="Loading product details."
          canonicalUrl={`https://www.starlinkjewels.com/product/${id}`}
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
          canonicalUrl={`https://www.starlinkjewels.com/product/${id}`}
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
        canonicalUrl={`https://www.starlinkjewels.com/product/${product.id}`}
        structuredData={structuredData}
        breadcrumbs={[
          { name: "Home", url: "https://www.starlinkjewels.com" },
          { name: "Categories", url: "https://www.starlinkjewels.com/categories" },
          ...(category ? [{ name: category.name, url: `https://www.starlinkjewels.com/category/${category.id}` }] : []),
          { name: product.name, url: `https://www.starlinkjewels.com/product/${product.id}` },
        ]}
        faqItems={product.seoFaq && product.seoFaq.length > 0 ? product.seoFaq : buildFaqForProduct(product.name, category?.name)}
      />

      <Header promoHeader={promoHeader} />
      <MiniHeader categories={categories} promoHeight={promoHeight} />

      <main className="flex-1 container mx-auto px-4 py-12" style={{ paddingTop: `${paddingTop}px` }}>
        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <div className="relative aspect-square rounded-2xl bg-muted overflow-hidden flex items-center justify-center">
              {currentMedia && getMediaType(currentMedia) === "video" ? (
                <video src={currentMedia} className="w-full h-full object-cover" controls />
              ) : (
                currentMedia && (
                  <img
                    src={currentMedia}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                    fetchpriority="high"
                  />
                )
              )}
              {hasMultiple && (
                <>
                  <button
                    onClick={() => setSelectedIndex((prev) => (prev - 1 + media.length) % media.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-lg"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedIndex((prev) => (prev + 1) % media.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-lg"
                    aria-label="Next"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            {hasMultiple && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {media.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIndex(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedIndex === i ? "border-primary" : "border-transparent"}`}
                  >
                    {getMediaType(item) === "video" ? (
                      <video src={item} className="w-full h-full object-cover" muted />
                    ) : (
                      <img
                        src={item}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        fetchpriority="low"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
            <div className="mb-6" />
            {category && (
              <Link to={`/category/${category.id}`} className="text-sm text-primary underline">
                Shop more {category.name} jewelry
              </Link>
            )}
            {product.description && (
              <div
                className="prose prose-sm max-w-none mt-6"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}
            <div className="mt-8">
              <WhatsAppButton product={product} className="w-full" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
