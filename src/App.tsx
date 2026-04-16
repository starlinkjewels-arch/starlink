import { useEffect, useMemo } from "react";
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
import About from "./pages/About";
import Categories from "./pages/Categories";
import CategoryProducts from "./pages/CategoryProducts";
import ProductDetail from "./pages/ProductDetail";
import Gallery from "./pages/Gallery";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import BuyingGuidePage from "./pages/BuyingGuide";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import { requestLocationAndLog } from '@/lib/locationPermission';
import { preloadMedia } from "@/lib/preload";
import { pingSitemapOncePerDay } from "@/lib/seo";
import GlobalLoader from "@/components/GlobalLoader";
import CountryLanding from "./pages/CountryLanding";

const queryClient = new QueryClient();
const DEFERRED_LOAD_DELAY_MS = 1200;

const AppContent = () => {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectGlobalData);
  const status = useAppSelector(selectContentStatus);
  const hydrated = useAppSelector(selectContentHydrated);
  const deferredLoaded = useAppSelector(selectDeferredLoaded);
  const deferredStatus = useAppSelector(selectDeferredStatus);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAdminRoute = location.pathname.startsWith('/aEgZjaHJvbWUyBggAEEUYOdIBCDUzMTRqMGo3');

  useEffect(() => {
    if (!isAdminRoute && status === "idle" && !hydrated) {
      dispatch(loadGlobalData());
    }
  }, [dispatch, hydrated, isAdminRoute, status]);

  useEffect(() => {
    if (isAdminRoute || !hydrated || status !== "succeeded" || deferredLoaded || deferredStatus !== "idle") {
      return;
    }

    let timeoutId: number | null = null;
    let idleId: number | null = null;

    const startDeferredLoad = () => {
      dispatch(loadDeferredData());
    };

    if ("requestIdleCallback" in window) {
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
      requestLocationAndLog();
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Collect important images to preload (banners are most critical)
  const assetUrls = useMemo(() => {
    const take = (arr: string[], n: number) => arr.filter(Boolean).slice(0, n);
    if (isAdminRoute) return [];
    return [
      ...take(data.banners.map((b) => b.image), 1),
    ];
  }, [
    data.banners,
    isAdminRoute,
  ]);

  useEffect(() => {
    if (status === "succeeded" || hydrated) {
      preloadMedia(assetUrls);
    }
  }, [assetUrls, hydrated, status]);

  useEffect(() => {
    if (status === "succeeded" || hydrated) {
      pingSitemapOncePerDay();
    }
  }, [hydrated, status]);

  return (
    <>
      <GlobalLoader isLoading={showLoader} imagesToPreload={[]} />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:id" element={<CategoryProducts />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/aEgZjaHJvbWUyBggAEEUYOdIBCDUzMTRqMGo3" element={<Admin />} />
        <Route path="/buying-guide" element={<BuyingGuidePage />} />
        <Route path="/buying-guide/:slug" element={<BuyingGuidePage />} />
        <Route path="/usa" element={<CountryLanding />} />
        <Route path="/canada" element={<CountryLanding />} />
        <Route path="/australia" element={<CountryLanding />} />
        <Route path="/germany" element={<CountryLanding />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
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
