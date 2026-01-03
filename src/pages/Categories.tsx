import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import MiniHeader from '@/components/MiniHeader';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { useGlobalData } from '@/hooks/useGlobalData';
import { Card, CardContent } from '@/components/ui/card';

const Categories = () => {
  const { categories, promoHeader } = useGlobalData();

  const hasPromo = promoHeader?.enabled && promoHeader?.text;
  const promoHeight = hasPromo ? 40 : 0;
  const paddingTop = promoHeight + 80 + 52 + 12 + 26;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Jewelry Collections - Premium Diamond & Gold Jewelry | Starlink Jewels',
    description: 'Explore our premium jewelry collections featuring GIA certified diamonds, gold, platinum rings, necklaces, earrings, and bracelets.',
    url: 'https://starlinkjewels.com/categories',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: categories.map((cat, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: cat.name,
          description: cat.description,
          image: cat.image,
          url: `https://starlinkjewels.com/category/${cat.id}`
        }
      }))
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Jewelry Collections - Diamond Rings, Gold Necklaces, Earrings & Bracelets | Starlink Jewels"
        description="Explore our curated jewelry collections. Shop premium GIA certified diamond rings, 18K gold necklaces, elegant earrings, platinum bracelets. Best prices, free shipping worldwide."
        keywords="jewelry collections, diamond rings collection, gold necklaces, diamond earrings, bracelets, engagement rings, wedding bands, solitaire rings, tennis bracelets, pearl necklaces, gemstone jewelry, ruby rings, emerald jewelry, sapphire earrings, custom jewelry"
        canonicalUrl="https://starlinkjewels.com/categories"
        structuredData={structuredData}
      />

      <Header promoHeader={promoHeader} />
      <MiniHeader categories={categories} promoHeight={promoHeight} />

      <main className="flex-1 container mx-auto px-4 py-12" style={{ paddingTop: `${paddingTop}px` }}>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Collections</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Explore our carefully curated categories of premium jewelry.</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-20"><p className="text-lg text-muted-foreground">No categories available yet.</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link key={category.id} to={`/category/${category.id}`} className="group">
                <Card className="overflow-hidden hover-lift h-full">
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  </div>
                  <CardContent className="p-6">
                    <h2 className="font-semibold text-2xl mb-2 group-hover:text-primary transition-colors">{category.name}</h2>
                    <p className="text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Categories;
