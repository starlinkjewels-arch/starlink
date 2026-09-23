import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X, ArrowRight, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadProducts, selectGlobalData, selectProductsLoaded, selectProductsStatus } from "@/store/contentSlice";
import { searchCategories, searchProducts } from "@/lib/search";
import { firstImage } from "@/lib/media";
import { getProductCategoryIds } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const POPULAR_SEARCHES = ["Tennis bracelet", "Eternity band", "Oval ring", "Solitaire", "Emerald cut", "Hoop earrings"];

interface HeaderSearchProps {
  className?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
  variant?: "bar" | "panel";
}

// Search box with instant product suggestions. Loads the catalogue the first time it is focused.
const HeaderSearch = ({ className, autoFocus, onNavigate, variant = "bar" }: HeaderSearchProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { products, categories } = useAppSelector(selectGlobalData);
  const productsLoaded = useAppSelector(selectProductsLoaded);
  const productsStatus = useAppSelector(selectProductsStatus);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const ensureProducts = () => {
    if (!productsLoaded && productsStatus === "idle") dispatch(loadProducts());
  };

  useEffect(() => {
    if (autoFocus) ensureProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const trimmed = query.trim();
  const results = useMemo(() => (trimmed.length >= 2 ? searchProducts(products, categories, trimmed, 6) : []), [products, categories, trimmed]);
  const categoryHits = useMemo(() => searchCategories(categories, trimmed).slice(0, 3), [categories, trimmed]);
  const categoryName = (id?: string) => categories.find((c) => c.id === id)?.name;

  const finish = () => {
    setOpen(false);
    setQuery("");
    onNavigate?.();
  };

  const submit = (value = trimmed) => {
    if (!value) return;
    navigate(`/search?q=${encodeURIComponent(value)}`);
    finish();
  };

  const loading = !productsLoaded && productsStatus === "loading";
  const showPanel = variant === "panel" || open;

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          autoFocus={autoFocus}
          onFocus={() => {
            setOpen(true);
            ensureProducts();
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="Search rings, bracelets, shapes…"
          aria-label="Search jewelry"
          className="h-11 w-full rounded-full border border-input bg-background pl-11 pr-10 text-sm outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground" aria-label="Clear search">
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {showPanel && (
        <div
          className={cn(
            "z-50 overflow-hidden bg-popover text-popover-foreground",
            variant === "bar" ? "absolute left-0 top-full mt-2 w-[min(560px,90vw)] rounded-lg border shadow-[0_24px_48px_-16px_rgba(15,27,51,0.35)]" : "mt-4"
          )}
        >
          {trimmed.length < 2 ? (
            <div className="p-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => submit(term)}
                    className="rounded-full border px-3.5 py-1.5 text-sm transition-colors hover:border-navy hover:bg-navy hover:text-navy-foreground"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto">
              {categoryHits.length > 0 && (
                <div className="border-b p-3">
                  {categoryHits.map((c) => (
                    <Link key={c.id} to={`/category/${c.id}`} onClick={finish} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-secondary">
                      <img src={c.image} alt="" className="h-9 w-9 rounded-full object-cover" loading="lazy" />
                      <span className="text-sm">
                        Shop <strong className="font-semibold">{c.name}</strong>
                      </span>
                      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              )}

              {loading ? (
                <div className="flex items-center gap-2 p-5 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Searching the collection…
                </div>
              ) : results.length === 0 ? (
                <p className="p-5 text-sm text-muted-foreground">No pieces match “{trimmed}”. Try a shape like oval or pear.</p>
              ) : (
                <ul className="p-2">
                  {results.map(({ product }) => (
                    <li key={product.id}>
                      <Link to={`/product/${product.id}`} onClick={finish} className="flex items-center gap-3 rounded-md p-2 hover:bg-secondary">
                        <img src={firstImage(product)} alt="" className="h-14 w-14 shrink-0 rounded-md bg-muted object-cover" loading="lazy" />
                        <span className="min-w-0">
                          <span className="line-clamp-1 text-sm font-medium">{product.name}</span>
                          <span className="text-xs text-muted-foreground">{categoryName(getProductCategoryIds(product)[0])}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <button
                type="button"
                onClick={() => submit()}
                className="flex w-full items-center justify-between border-t bg-secondary/50 px-5 py-3.5 text-sm font-medium hover:bg-secondary"
              >
                See all results for “{trimmed}”
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;
