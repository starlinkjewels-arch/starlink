import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Heart, Link2, Trash2 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'sonner';
import SEOHead from '@/components/SEOHead';
import SiteLayout from '@/components/site/SiteLayout';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadProducts, selectGlobalData, selectProductsLoaded, selectProductsStatus } from '@/store/contentSlice';
import { addManyToWishlist, clearWishlist, useRecentlyViewed, useWishlist } from '@/lib/wishlist';
import { whatsappLink } from '@/lib/whatsapp';
import { enquiry } from '@/lib/enquiry';
import { categoryPath } from '@/lib/urls';
import { SITE } from '@/lib/seo';
import type { Product } from '@/lib/storage';

const byIds = (ids: string[], products: Product[]) => ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));

// Saved pieces (this browser), plus shared lists opened from a link (/wishlist?items=id,id).
const Wishlist = () => {
  const dispatch = useAppDispatch();
  const { products, categories, contactInfo } = useAppSelector(selectGlobalData);
  const productsLoaded = useAppSelector(selectProductsLoaded);
  const productsStatus = useAppSelector(selectProductsStatus);
  const savedIds = useWishlist();
  const recentIds = useRecentlyViewed();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!productsLoaded && productsStatus === 'idle') dispatch(loadProducts());
  }, [dispatch, productsLoaded, productsStatus]);

  const sharedIds = useMemo(() => (searchParams.get('items') || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 50), [searchParams]);
  const isShared = sharedIds.length > 0;
  const items = useMemo(() => byIds(isShared ? sharedIds : savedIds, products), [isShared, sharedIds, savedIds, products]);
  const recent = useMemo(() => byIds(recentIds, products).filter((p) => !items.some((i) => i.id === p.id)).slice(0, 4), [recentIds, products, items]);
  const loading = !productsLoaded && productsStatus !== 'failed';

  const shareList = async () => {
    const url = `${SITE.url}/wishlist?items=${items.map((p) => p.id).join(',')}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My Starlink Jewels wishlist', text: `${items.length} pieces I love at Starlink Jewels`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success('Wishlist link copied', { description: 'Send it to anyone. It opens your saved pieces.' });
    } catch {
      // share sheet dismissed
    }
  };

  const saveShared = () => {
    addManyToWishlist(items.map((p) => p.id));
    toast.success(`${items.length} ${items.length === 1 ? 'piece' : 'pieces'} saved to your wishlist`);
    setSearchParams({}, { replace: true });
  };

  return (
    <SiteLayout>
      <SEOHead title="Your Wishlist" description="Pieces you have saved at Starlink Jewels." canonicalUrl={`${SITE.url}/wishlist`} noIndex />

      <section className="container-wide py-10 md:py-14">
        <div className="flex flex-col gap-6 border-b pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-3">{isShared ? 'Shared with you' : 'Saved pieces'}</p>
            <h1 className="heading-lg">{isShared ? 'A wishlist for you' : 'Your wishlist'}</h1>
            <p className="mt-3 text-muted-foreground">
              {loading ? 'Loading…' : `${items.length} ${items.length === 1 ? 'piece' : 'pieces'}`}
              {!isShared && ' · saved on this device'}
            </p>
          </div>

          {items.length > 0 && (
            <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
              {isShared ? (
                <Button size="lg" className="col-span-2" onClick={saveShared}>
                  <Heart /> Save all to my wishlist
                </Button>
              ) : (
                <>
                  <Button asChild variant="whatsapp" size="lg" className="col-span-2 sm:col-span-1">
                    <a href={whatsappLink(enquiry.wishlist(items), contactInfo?.whatsapp)} target="_blank" rel="noopener noreferrer">
                      <FaWhatsapp /> Enquire about {items.length === 1 ? 'this piece' : 'all'}
                    </a>
                  </Button>
                  <Button variant="outline" size="lg" onClick={shareList}>
                    <Link2 /> Share list
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => {
                      clearWishlist();
                      toast('Wishlist cleared');
                    }}
                  >
                    <Trash2 /> Clear
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-3xl bg-muted" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mx-auto max-w-md py-20 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/30">
              <Heart className="h-7 w-7" />
            </span>
            <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight">{isShared ? 'These pieces are no longer available' : 'Nothing saved yet'}</h2>
            <p className="mt-2 text-muted-foreground">Tap the heart on any piece to keep it here, compare later and share it with someone special.</p>
            <Button asChild size="lg" className="mt-8">
              <Link to="/categories">
                Explore collections <ArrowRight />
              </Link>
            </Button>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {categories.slice(0, 5).map((c) => (
                <Link key={c.id} to={categoryPath(c)} className="rounded-full border px-4 py-2 text-sm hover:border-brand hover:text-brand">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 3xl:grid-cols-5">
            {items.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        )}
      </section>

      {recent.length > 0 && (
        <section className="border-t bg-secondary/40 py-16 md:py-20">
          <div className="container-wide">
            <p className="eyebrow mb-3">Your history</p>
            <h2 className="heading-md mb-10">Recently viewed</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
              {recent.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
};

export default Wishlist;
