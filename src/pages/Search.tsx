import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { Helmet } from "react-helmet-async";
import SiteLayout from "@/components/site/SiteLayout";
import ProductCard from "@/components/ProductCard";
import DiamondShapeIcon from "@/components/site/DiamondShapeIcon";
import Reveal from "@/components/site/Reveal";
import { POPULAR_SEARCHES } from "@/components/site/HeaderSearch";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadProducts, selectGlobalData, selectProductsLoaded, selectProductsStatus } from "@/store/contentSlice";
import { DIAMOND_SHAPES, searchProducts } from "@/lib/search";
import { getProductCategoryIds } from "@/lib/storage";
import { cn } from "@/lib/utils";

const SearchPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const query = (params.get("q") || "").trim();
  const { products, categories } = useAppSelector(selectGlobalData);
  const productsLoaded = useAppSelector(selectProductsLoaded);
  const productsStatus = useAppSelector(selectProductsStatus);
  const [input, setInput] = useState(query);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!productsLoaded && productsStatus === "idle") dispatch(loadProducts());
  }, [dispatch, productsLoaded, productsStatus]);

  useEffect(() => {
    setInput(query);
    setCategoryFilter(null);
  }, [query]);

  const results = useMemo(() => searchProducts(products, categories, query).map((r) => r.product), [products, categories, query]);
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    results.forEach((p) => getProductCategoryIds(p).forEach((id) => counts.set(id, (counts.get(id) || 0) + 1)));
    return categories.filter((c) => counts.has(c.id)).map((c) => ({ category: c, count: counts.get(c.id) || 0 }));
  }, [results, categories]);
  const visible = categoryFilter ? results.filter((p) => getProductCategoryIds(p).includes(categoryFilter)) : results;
  const categoryName = (p: (typeof results)[number]) => categories.find((c) => c.id === getProductCategoryIds(p)[0])?.name;
  const loading = !productsLoaded && productsStatus !== "failed";

  const submit = (value: string) => {
    const v = value.trim();
    if (v) navigate(`/search?q=${encodeURIComponent(v)}`);
  };

  return (
    <SiteLayout>
      <Helmet>
        <title>{query ? `Search: ${query}` : "Search"} | Starlink Jewels</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <section className="container-wide pt-4">
        <div className="relative overflow-hidden rounded-[2rem] bg-secondary px-6 py-12 md:px-14 md:py-16">
          <p className="eyebrow mb-4">Search</p>
          <h1 className="heading-lg text-balance">{query ? <>Results for <em className="accent">“{query}”</em></> : "What are you looking for?"}</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="relative mt-8 max-w-2xl"
          >
            <SearchIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Try “oval ring” or “tennis bracelet”"
              className="h-14 w-full rounded-full border-0 bg-background pl-14 pr-32 text-base text-foreground shadow-sm outline-none ring-2 ring-transparent focus:ring-brand/40"
              aria-label="Search jewelry"
            />
            <button type="submit" className="absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="container-wide py-10 md:py-14">
        {!query ? (
          <EmptyState onPick={submit} />
        ) : loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[4/5] animate-pulse rounded-md bg-muted" />
                <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-display text-3xl">No pieces found for “{query}”</p>
            <p className="mt-2 text-muted-foreground">Check the spelling, or browse by shape and collection below.</p>
            <div className="mt-10">
              <EmptyState onPick={submit} />
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-wrap items-center gap-2">
              <span className="mr-2 text-sm text-muted-foreground">
                {visible.length} {visible.length === 1 ? "piece" : "pieces"}
              </span>
              {categoryCounts.length > 1 && (
                <>
                  <FilterChip active={!categoryFilter} onClick={() => setCategoryFilter(null)}>
                    All
                  </FilterChip>
                  {categoryCounts.map(({ category, count }) => (
                    <FilterChip key={category.id} active={categoryFilter === category.id} onClick={() => setCategoryFilter(category.id)}>
                      {category.name} <span className="opacity-60">({count})</span>
                    </FilterChip>
                  ))}
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
              {visible.map((product, i) => (
                <Reveal key={product.id} delay={(i % 4) * 60}>
                  <ProductCard product={product} categoryName={categoryName(product)} priority={i < 4} />
                </Reveal>
              ))}
            </div>
          </>
        )}
      </section>
    </SiteLayout>
  );
};

const FilterChip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-[0.1em] transition-colors",
      active ? "border-navy bg-navy text-navy-foreground" : "hover:border-navy"
    )}
  >
    {children}
  </button>
);

const EmptyState = ({ onPick }: { onPick: (q: string) => void }) => {
  const { categories } = useAppSelector(selectGlobalData);
  return (
    <div className="space-y-12">
      <div>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Shop by shape</p>
        <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
          {DIAMOND_SHAPES.map((shape) => (
            <button key={shape} type="button" onClick={() => onPick(shape)} className="group flex flex-col items-center gap-2 rounded-md border py-4 text-xs transition-colors hover:border-navy">
              <DiamondShapeIcon shape={shape} className="h-10 w-10 text-foreground/70 group-hover:text-brand" />
              {shape}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Popular searches</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SEARCHES.map((term) => (
            <button key={term} type="button" onClick={() => onPick(term)} className="rounded-full border px-4 py-2 text-sm hover:border-navy hover:bg-navy hover:text-navy-foreground">
              {term}
            </button>
          ))}
        </div>
      </div>
      {categories.length > 0 && (
        <div>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Collections</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {categories.slice(0, 6).map((c) => (
              <Link key={c.id} to={`/category/${c.id}`} className="group block">
                <div className="aspect-square overflow-hidden rounded-md bg-muted">
                  <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                </div>
                <p className="mt-2 text-sm font-medium group-hover:text-brand">{c.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
