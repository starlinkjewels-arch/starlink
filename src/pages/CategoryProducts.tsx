import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import MiniHeader from '@/components/MiniHeader';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ProductDialog from '@/components/ProductDialog';
import SEOHead from '@/components/SEOHead';
import {
  buildFaqForCategory,
  buildFaqForProduct,
  buildMetaDescriptionForCategory,
  buildMetaDescriptionForProduct,
  buildMetaTitleForCategory,
  buildMetaTitleForProduct,
} from '@/lib/seo';
import { useAppSelector } from "@/store/hooks";
import { selectContentHydrated, selectContentStatus, selectGlobalData } from "@/store/contentSlice";
import { Product } from "@/lib/storage";
import { Button } from '@/components/ui/button';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
const CategoryProducts = () => {
  const { id } = useParams<{ id: string }>();
  const { categories, promoHeader, products } = useAppSelector(selectGlobalData);
  const status = useAppSelector(selectContentStatus);
  const hydrated = useAppSelector(selectContentHydrated);
  const isReady = status === "succeeded" || hydrated;
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchParams, setSearchParams] = useSearchParams();
  const hasPromo = promoHeader?.enabled && promoHeader?.text;
  const promoHeight = hasPromo ? 40 : 0;
  const paddingTop = promoHeight + 80 + 52 + 24;
  const category = useMemo(
    () => categories.find((c) => c.id === id) ?? null,
    [categories, id]
  );

  const productsForCategory = useMemo(
    () => products.filter((p) => p.categoryId === id),
    [products, id]
  );

  const getProductTime = (item: Product): number => {
    if (!item) return 0;
    
    // Check createdAt field
    if (item.createdAt) {
      if (typeof item.createdAt === 'object' && item.createdAt !== null && 'seconds' in item.createdAt) {
        return item.createdAt.seconds * 1000;
      } else if (typeof item.createdAt === 'number') {
        return item.createdAt;
      } else if (typeof item.createdAt === 'string') {
        const date = new Date(item.createdAt);
        return isNaN(date.getTime()) ? 0 : date.getTime();
      }
    }
    
    // Fallback: extract timestamp from id
    if (item.id && typeof item.id === 'string') {
      const idParts = item.id.split('_');
      if (idParts.length > 1) {
        const timestamp = parseInt(idParts[idParts.length - 1], 10);
        if (!isNaN(timestamp) && timestamp > 0) {
          return timestamp;
        }
      }
    }
    
    return 0;
  };

  const sortProducts = (productsToSort: Product[], sortOption: string): Product[] => {
    const result = [...productsToSort];

    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => {
          const priceA = parseFloat(String(a.price || 0));
          const priceB = parseFloat(String(b.price || 0));
          return priceA - priceB;
        });
        break;
      case 'price-high':
        result.sort((a, b) => {
          const priceA = parseFloat(String(a.price || 0));
          const priceB = parseFloat(String(b.price || 0));
          return priceB - priceA;
        });
        break;
      case 'oldest':
        result.sort((a, b) => {
          const timeA = getProductTime(a);
          const timeB = getProductTime(b);
          return timeA - timeB;
        });
        break;
      case 'newest':
      default:
        result.sort((a, b) => {
          const timeA = getProductTime(a);
          const timeB = getProductTime(b);
          return timeB - timeA;
        });
        break;
    }

    return result;
  };

  useEffect(() => {
    if (!productsForCategory || productsForCategory.length === 0) {
      setFilteredProducts([]);
      return;
    }

    const sorted = sortProducts(productsForCategory, sortBy);
    setFilteredProducts(sorted);
  }, [productsForCategory, sortBy]);
  useEffect(() => {
    if (productsForCategory.length > 0) {
      const prodId = searchParams.get('product');
      if (prodId) {
        const prod = productsForCategory.find(p => p.id === prodId);
        if (prod) {
          setSelectedProduct(prod);
          setIsDialogOpen(true);
        }
      }
    }
  }, [productsForCategory, searchParams]);
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
    setSearchParams({ product: product.id });
  };
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSearchParams({});
    }
  };
  const baseStructuredData = category ? {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} - Starlink Jewels`,
    description: category.description || `Shop our ${category.name} collection`,
    url: `https://www.starlinkjewels.com/category/${id}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: filteredProducts.length,
      itemListElement: filteredProducts.slice(0, 20).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: p.name,
          image: (p.images && p.images.length > 0) ? p.images : [p.image],
          description: p.description || `${p.name} from Starlink Jewels`,
          sku: p.id,
          category: category.name,
          brand: {
            '@type': 'Brand',
            name: 'Starlink Jewels',
          },
          offers: {
            '@type': 'Offer',
            price: String(p.price || '').replace(/[^\d.]/g, '') || undefined,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: `https://www.starlinkjewels.com/category/${id}?product=${p.id}`,
          },
        },
      })),
    },
  } : undefined;

  const activeProduct = selectedProduct;
  const productStructuredData =
    category && activeProduct
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: activeProduct.name,
          image:
            activeProduct.images && activeProduct.images.length > 0
              ? activeProduct.images
              : [activeProduct.image],
          description: activeProduct.description || `${activeProduct.name} from Starlink Jewels`,
          sku: activeProduct.id,
          category: category.name,
          brand: {
            '@type': 'Brand',
            name: 'Starlink Jewels',
          },
          offers: {
            '@type': 'Offer',
            price: String(activeProduct.price || '').replace(/[^\d.]/g, '') || undefined,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: `https://www.starlinkjewels.com/category/${id}?product=${activeProduct.id}`,
          },
        }
      : undefined;

  const structuredData = [
    ...(baseStructuredData ? [baseStructuredData] : []),
    ...(productStructuredData ? [productStructuredData] : []),
  ];

  const seoTitle = category
    ? activeProduct
      ? (activeProduct.metaTitle || buildMetaTitleForProduct(activeProduct.name))
      : (category.metaTitle || buildMetaTitleForCategory(category.name))
    : 'Category';

  const seoDescription = category
    ? activeProduct
      ? (activeProduct.metaDescription || buildMetaDescriptionForProduct(activeProduct.name, category.name))
      : (category.metaDescription || buildMetaDescriptionForCategory(category.name, category.description))
    : 'Category';

  const seoFaqItems = category
    ? activeProduct
      ? (activeProduct.seoFaq && activeProduct.seoFaq.length > 0 ? activeProduct.seoFaq : buildFaqForProduct(activeProduct.name, category.name))
      : (category.seoFaq && category.seoFaq.length > 0 ? category.seoFaq : buildFaqForCategory(category.name))
    : undefined;

  const relatedCategories = useMemo(
    () => categories.filter((c) => c.id !== id).slice(0, 6),
    [categories, id]
  );

  const faqItems = category ? [
    {
      question: `Are ${category.name} diamonds certified?`,
      answer:
        "Yes. We offer certified lab-grown and natural diamonds with trusted grading standards.",
    },
    {
      question: `Can I customize ${category.name} designs?`,
      answer:
        "Yes. We offer custom design and manufacturing for select categories and styles.",
    },
    {
      question: "Do you ship internationally?",
      answer:
        "Yes. We provide international shipping with secure packaging for select regions.",
    },
  ] : [
    {
      question: "Are your diamonds certified?",
      answer:
        "Yes. We offer certified lab-grown and natural diamonds with trusted grading standards.",
    },
  ];
  if (!category && !isReady) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="Loading Category"
          description="Loading category details."
          canonicalUrl={`https://www.starlinkjewels.com/category/${id}`}
        />
        <Header promoHeader={promoHeader} />
        <MiniHeader categories={categories} promoHeight={promoHeight} />
        <main className="flex-1 container mx-auto px-4 py-12" style={{ paddingTop: `${paddingTop}px` }}>
          <div className="mb-8">
            <div className="h-10 w-64 bg-muted rounded-md animate-pulse mb-3" />
            <div className="h-4 w-96 bg-muted/70 rounded-md animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="Category Not Found"
          description="The requested category could not be found."
          canonicalUrl={`https://www.starlinkjewels.com/category/${id}`}
        />
        <Header promoHeader={promoHeader} />
        <MiniHeader categories={categories} promoHeight={promoHeight} />
        <main className="flex-1 container mx-auto px-4 py-12" style={{ paddingTop: `${paddingTop}px` }}>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
            <Link to="/categories">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Categories
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={`${category.name.toLowerCase()}, ${category.name.toLowerCase()} jewelry, diamond ${category.name.toLowerCase()}, gold ${category.name.toLowerCase()}, luxury ${category.name.toLowerCase()}`}
        canonicalUrl={`https://www.starlinkjewels.com/category/${id}${activeProduct ? `?product=${activeProduct.id}` : ''}`}
        structuredData={structuredData}
        breadcrumbs={[
          { name: "Home", url: "https://www.starlinkjewels.com" },
          { name: "Categories", url: "https://www.starlinkjewels.com/categories" },
          { name: category.name, url: `https://www.starlinkjewels.com/category/${id}` },
        ]}
        faqItems={seoFaqItems || faqItems}
      />
      <Header promoHeader={promoHeader} />
      <MiniHeader categories={categories} promoHeight={promoHeight} />
      <main className="flex-1 container mx-auto px-4 py-12" style={{ paddingTop: `${paddingTop}px` }}>
        <Link to="/categories">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        </Link>
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
          <p className="text-lg text-muted-foreground">{category.description}</p>
        </div>
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 p-4 bg-muted/30 rounded-lg border">
          {/* <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-2xl font-bold text-foreground">{filteredProducts.length}</span>
            <span className="text-sm">Product{filteredProducts.length !== 1 ? 's' : ''} Found</span>
          </div> */}

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Sort by:</span>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px] bg-background border-2 hover:border-primary transition-colors shadow-sm">
                <SelectValue placeholder="Select sorting" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                {/* <SelectItem value="oldest">Oldest First</SelectItem> */}
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">No products in this category yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Check back soon for new arrivals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product)}
              />
            ))}
          </div>
        )}

        {relatedCategories.length > 0 && (
          <section className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Explore More Collections</h2>
              <p className="text-base text-muted-foreground">Browse other popular jewelry categories</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {relatedCategories.map((c) => (
                <Link
                  key={c.id}
                  to={`/category/${c.id}`}
                  className="group rounded-xl border bg-card/50 hover:bg-card transition-all p-3 text-center"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <span className="text-sm font-semibold block">Shop {c.name} Jewelry</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <ProductDialog
        product={selectedProduct}
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        catId={id}
      />
      <Footer />
    </div>
  );
};
export default CategoryProducts;
