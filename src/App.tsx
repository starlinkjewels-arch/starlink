import { Suspense, lazy, useEffect, useMemo, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import { preloadCritical, preloadImages } from "@/lib/preload";
import GlobalLoader from "@/components/GlobalLoader";
import AdPopup from "@/components/AdPopup";

// Home stays in the main bundle for the fastest first paint; everything else loads on demand.
const About = lazy(() => import("./pages/About"));
const Categories = lazy(() => import("./pages/Categories"));
const CategoryProducts = lazy(() => import("./pages/CategoryProducts"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const Contact = lazy(() => import("./pages/Contact"));
const Admin = lazy(() => import("./pages/Admin"));
const BuyingGuidePage = lazy(() => import("./pages/BuyingGuide"));
const CountryLanding = lazy(() => import("./pages/CountryLanding"));
const SearchPage = lazy(() => import("./pages/Search"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();
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

  const showLoader = !isAdminRoute && !isHomePage && status === "loading" && !hydrated;


  useEffect(() => {
    const timer = setTimeout(() => {
      // Never log (or prompt) the admin panel.
      if (window.location.pathname.startsWith(ADMIN_PATH)) return;
      requestLocationAndLog();
    }, 2500);
    return () => clearTimeout(timer);
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

  return (
    <>
      <GlobalLoader isLoading={showLoader} />
      {!isAdminRoute && <AdPopup />}
      <ScrollToTop />
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
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
        <Route path={ADMIN_PATH} element={<Admin />} />
        <Route path="/buying-guide" element={<BuyingGuidePage />} />
        <Route path="/buying-guide/:slug" element={<BuyingGuidePage />} />
        <Route path="/usa" element={<CountryLanding />} />
        <Route path="/canada" element={<CountryLanding />} />
        <Route path="/australia" element={<CountryLanding />} />
        <Route path="/germany" element={<CountryLanding />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </>
  );
};

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
