import { Suspense, lazy, useEffect, useMemo, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  loadDeferredData,
  loadGlobalData,
  selectContentHydrated,
  selectContentStatus,
  selectDeferredLoaded,
  selectDeferredStatus,
  selectGlobalData,
} from "@/store/contentSlice";
import Index from "./pages/Index";
import ScrollToTop from "./components/ScrollToTop";
import { requestLocationAndLog } from '@/lib/locationPermission';
import { getConsent, onConsentChange, type ConsentState } from '@/lib/consent';
import { preloadCritical, preloadImages } from "@/lib/preload";
import GlobalLoader from "@/components/GlobalLoader";
import AdPopup from "@/components/AdPopup";
import { SiteShell } from "@/components/site/SiteLayout";

// Home stays in the main bundle for the fastest first paint; everything else loads on demand,
// and public pages are also prefetched in the background once the site is idle (see below), so
// tapping a menu link doesn't wait on a download.
const pageLoaders = {
  about: () => import("./pages/About"),
  categories: () => import("./pages/Categories"),
  categoryProducts: () => import("./pages/CategoryProducts"),
  productDetail: () => import("./pages/ProductDetail"),
  gallery: () => import("./pages/Gallery"),
  blog: () => import("./pages/Blog"),
  blogDetail: () => import("./pages/BlogDetail"),
  contact: () => import("./pages/Contact"),
  buyingGuide: () => import("./pages/BuyingGuide"),
  countryLanding: () => import("./pages/CountryLanding"),
  search: () => import("./pages/Search"),
  notFound: () => import("./pages/NotFound"),
  designTool: () => import("./pages/DesignToolPage"),
  privacy: () => import("./pages/PrivacyPolicy"),
  wishlist: () => import("./pages/Wishlist"),
  policy: () => import("./pages/PolicyPage"),
  ringSize: () => import("./pages/RingSizeGuide"),
};

const About = lazy(pageLoaders.about);
const Categories = lazy(pageLoaders.categories);
const CategoryProducts = lazy(pageLoaders.categoryProducts);
const ProductDetail = lazy(pageLoaders.productDetail);
const Gallery = lazy(pageLoaders.gallery);
const Blog = lazy(pageLoaders.blog);
const BlogDetail = lazy(pageLoaders.blogDetail);
const Contact = lazy(pageLoaders.contact);
const Admin = lazy(() => import("./pages/Admin"));
const BuyingGuidePage = lazy(pageLoaders.buyingGuide);
const CountryLanding = lazy(pageLoaders.countryLanding);
const SearchPage = lazy(pageLoaders.search);
const NotFound = lazy(pageLoaders.notFound);
const DesignToolPage = lazy(pageLoaders.designTool);
const PrivacyPolicy = lazy(pageLoaders.privacy);
const Wishlist = lazy(pageLoaders.wishlist);
const PolicyPage = lazy(pageLoaders.policy);
const RingSizeGuide = lazy(pageLoaders.ringSize);

// Fetch the page bundles one at a time while the browser is idle (skipped on data-saver connections).
const prefetchPages = () => {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "")) return;
  const queue = Object.values(pageLoaders);
  const idle = (cb: () => void) =>
    typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(cb, { timeout: 3000 }) : window.setTimeout(cb, 300);
  const next = () => {
    const load = queue.shift();
    if (!load) return;
    load().catch(() => {}).finally(() => idle(next));
  };
  idle(next);
};

const DEFERRED_LOAD_DELAY_MS = 1200;
const MAX_LOAD_RETRIES = 3;

const ADMIN_PATH = "/aEgZjaHJvbWUyBggAEEUYOdIBCDUzMTRqMGo3";

const AppContent = () => {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectGlobalData);
  const status = useAppSelector(selectContentStatus);
  const hydrated = useAppSelector(selectContentHydrated);
  const deferredLoaded = useAppSelector(selectDeferredLoaded);
  const deferredStatus = useAppSelector(selectDeferredStatus);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAdminRoute = location.pathname.startsWith(ADMIN_PATH);

  useEffect(() => {
    if (!isAdminRoute && status === "idle" && !hydrated) {
      dispatch(loadGlobalData());
    }
  }, [dispatch, hydrated, isAdminRoute, status]);

  // If the first load fails (network blip, rules being republished), retry with backoff.
  const retryCount = useRef(0);
  useEffect(() => {
    if (isAdminRoute || status !== "failed" || retryCount.current >= MAX_LOAD_RETRIES) return;
    const delay = 2000 * 2 ** retryCount.current;
    retryCount.current += 1;
    const id = window.setTimeout(() => dispatch(loadGlobalData({ force: true })), delay);
    return () => window.clearTimeout(id);
  }, [dispatch, isAdminRoute, status]);

  useEffect(() => {
    if (isAdminRoute || !hydrated || status !== "succeeded" || deferredLoaded || deferredStatus !== "idle") {
      return;
    }

    let timeoutId: number | null = null;
    let idleId: number | null = null;

    const startDeferredLoad = () => {
      dispatch(loadDeferredData());
    };

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(
        () => {
          timeoutId = window.setTimeout(startDeferredLoad, DEFERRED_LOAD_DELAY_MS);
        },
        { timeout: 2000 }
      );
    } else {
      timeoutId = window.setTimeout(startDeferredLoad, DEFERRED_LOAD_DELAY_MS);
    }

    return () => {
      if (idleId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [deferredLoaded, deferredStatus, dispatch, hydrated, isAdminRoute, status]);

  useEffect(() => {
    if (isAdminRoute) return;
    const id = window.setTimeout(prefetchPages, 3500);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showLoader = !isAdminRoute && !isHomePage && status === "loading" && !hydrated;


  // Visitor logging runs only with analytics consent (cookie banner), never on the admin panel.
  useEffect(() => {
    let timer = 0;
    const start = (state: ConsentState | null) => {
      if (!state?.analytics || window.location.pathname.startsWith(ADMIN_PATH)) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => requestLocationAndLog(), 1500);
    };
    start(getConsent());
    const off = onConsentChange(start);
    return () => {
      off();
      window.clearTimeout(timer);
    };
  }, []);

  // Collect ALL critical images to preload so the service-worker cache is warm
  // on first render and subsequent navigations are instant.
  const assetUrls = useMemo(() => {
    const take = (arr: string[], n: number) => arr.filter(Boolean).slice(0, n);
    if (isAdminRoute) return [];
    return [
      // Banners — highest priority (LCP on home page)
      ...take(data.banners.map((b) => b.image), 3),
      // Category thumbnails — first row only
      ...take(data.categories.map((c) => c.image), 4),
      // Featured collection — first few products
      ...take((data.featuredCollection ?? []).map((p: { thumbnail?: string; image?: string }) => p.thumbnail || p.image || ''), 3),
      // Blog thumbnails — first few
      ...take(data.blogs.map((b: { thumbnail?: string; image?: string }) => b.thumbnail || b.image || ''), 3),
    ];
  }, [
    data.banners,
    data.categories,
    data.featuredCollection,
    data.blogs,
    isAdminRoute,
  ]);

  useEffect(() => {
    if (status === "succeeded" || hydrated) {
      // Banners = LCP images → preload at high priority with hero sizing (1600px WebP)
      const bannerUrls = (data.banners ?? []).map((b: { image?: string }) => b.image ?? '').filter(Boolean);
      preloadCritical(bannerUrls, 1600);

      // Everything else → standard priority (800px WebP thumbnails)
      const rest = assetUrls.filter((u) => !bannerUrls.includes(u));
      preloadImages(rest, 800);
    }
  }, [assetUrls, data.banners, hydrated, status]);

  const routes = (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/category/:id" element={<CategoryProducts />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:id" element={<BlogDetail />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/search" element={<SearchPage />} />
    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    <Route path="/wishlist" element={<Wishlist />} />
    <Route path="/ring-size-guide" element={<RingSizeGuide />} />
    <Route path="/shipping-policy" element={<PolicyPage policy="shipping" />} />
    <Route path="/returns-policy" element={<PolicyPage policy="returns" />} />
    <Route path="/warranty" element={<PolicyPage policy="warranty" />} />
    <Route path="/terms-and-conditions" element={<PolicyPage policy="terms" />} />
    <Route path="/ring-builder" element={<DesignToolPage tool="ringBuilder" />} />
    <Route path="/3d-jewelry-viewer" element={<DesignToolPage tool="viewer" />} />
      <Route path={ADMIN_PATH} element={<Admin />} />
      <Route path="/buying-guide" element={<BuyingGuidePage />} />
      <Route path="/buying-guide/:slug" element={<BuyingGuidePage />} />
      <Route path="/usa" element={<CountryLanding />} />
      <Route path="/canada" element={<CountryLanding />} />
      <Route path="/australia" element={<CountryLanding />} />
      <Route path="/germany" element={<CountryLanding />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  return (
    <>
      <GlobalLoader isLoading={showLoader} />
      {!isAdminRoute && <AdPopup />}
      <ScrollToTop />
      {isAdminRoute ? (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>{routes}</Suspense>
      ) : (
        // Header, footer and floating buttons stay mounted; only the page content swaps.
        <SiteShell>
          <Suspense fallback={<div className="min-h-[70vh]" />}>{routes}</Suspense>
        </SiteShell>
      )}
    </>
  );
};

const App = () => {
  return (
    <HelmetProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
