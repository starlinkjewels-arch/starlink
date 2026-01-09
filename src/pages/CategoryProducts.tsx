import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import ProductDialog from '@/components/ProductDialog';
import SEOHead from '@/components/SEOHead';
import { useGlobalData } from '@/hooks/useGlobalData';
import { getCategoryById, getProductsByCategory, Product, Category } from '@/lib/storage';
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
  const { categories, promoHeader } = useGlobalData();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>('newest');

  const hasPromo = promoHeader?.enabled && promoHeader?.text;
  const promoHeight = hasPromo ? 40 : 0;
  const paddingTop = promoHeight + 80 + 52 + 24;

  useEffect(() => {
    if (id) {
      getCategoryById(id).then((cat) => {
        setCategory(cat || null);
      });
      getProductsByCategory(id).then(setProducts);
    }
  }, [id]);

  useEffect(() => {
    if (!products || products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    let sorted = [...products];
    
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => {
          const priceA = parseFloat(String(a.price || 0));
          const priceB = parseFloat(String(b.price || 0));
          return priceA - priceB;
        });
        break;
      case 'price-high':
        sorted.sort((a, b) => {
          const priceA = parseFloat(String(a.price || 0));
          const priceB = parseFloat(String(b.price || 0));
          return priceB - priceA;
        });
        break;
      case 'oldest':
        sorted.sort((a, b) => {
          // Use id as fallback if createdAt doesn't exist
          const getTime = (item: Product) => {
            if (item.createdAt) {
              return new Date(item.createdAt).getTime();
            }
            // Extract timestamp from id if it exists (format: cat_timestamp)
            const idParts = item.id?.split('_');
            if (idParts && idParts.length > 1) {
              const timestamp = parseInt(idParts[idParts.length - 1]);
              if (!isNaN(timestamp)) return timestamp;
            }
            return 0;
          };
          return getTime(a) - getTime(b);
        });
        break;
      case 'newest':
      default:
        sorted.sort((a, b) => {
          // Use id as fallback if createdAt doesn't exist
          const getTime = (item: Product) => {
            if (item.createdAt) {
              return new Date(item.createdAt).getTime();
            }
            // Extract timestamp from id if it exists (format: cat_timestamp)
            const idParts = item.id?.split('_');
            if (idParts && idParts.length > 1) {
              const timestamp = parseInt(idParts[idParts.length - 1]);
              if (!isNaN(timestamp)) return timestamp;
            }
            return 0;
          };
          return getTime(b) - getTime(a);
        });
        break;
    }
    
    setFilteredProducts(sorted);
  }, [products, sortBy]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const structuredData = category ? {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} - Starlink Jewels`,
    description: category.description || `Shop our ${category.name} collection`,
    url: `https://starlinkjewels.com/category/${id}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: filteredProducts.length,
      itemListElement: filteredProducts.slice(0, 10).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: p.name,
          image: p.images?.[0] || p.image,
          description: p.description,
        },
      })),
    },
  } : undefined;

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead 
          title="Category Not Found"
          description="The requested category could not be found."
          canonicalUrl={`https://starlinkjewels.com/category/${id}`}
        />
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
            <Link href="/categories">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Categories
              </Button>
            </Link>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={`${category.name} - Premium Jewelry Collection`}
        description={category.description || `Explore our premium ${category.name} collection. Shop certified diamonds, gold, and luxury jewelry.`}
        keywords={`${category.name.toLowerCase()}, ${category.name.toLowerCase()} jewelry, diamond ${category.name.toLowerCase()}, gold ${category.name.toLowerCase()}, luxury ${category.name.toLowerCase()}`}
        canonicalUrl={`https://starlinkjewels.com/category/${id}`}
        structuredData={structuredData}
      />


        <Link href="/categories">
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
                <SelectItem value="oldest">Oldest First</SelectItem>
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

      <ProductDialog
        product={selectedProduct}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

    </div>
  );
};

export default CategoryProducts;
