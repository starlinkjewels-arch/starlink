import { useEffect, useMemo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadGlobalData, selectContentHydrated, selectContentStatus, selectGlobalData } from "@/store/contentSlice";
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
import { preloadAssets } from "@/lib/preload";
import { pingSitemapOncePerDay } from "@/lib/seo";
import GlobalLoader from "@/components/GlobalLoader";

const queryClient = new QueryClient();

const AppContent = () => {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectGlobalData);
  const status = useAppSelector(selectContentStatus);
  const hydrated = useAppSelector(selectContentHydrated);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (status === "idle" && !hydrated) {
      dispatch(loadGlobalData());
    }
  }, [dispatch, hydrated, status]);

  const showLoader = status === "loading" && !hydrated;


  useEffect(() => {
    const timer = setTimeout(() => {
      requestLocationAndLog();
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Collect important images to preload (banners are most critical)
  const assetUrls = useMemo(() => {
    const productImages = data.products.flatMap((p) => [p.image, ...(p.images || [])]);
    const blogImages = data.blogs.flatMap((b) => [b.image, b.thumbnail || ""]);
    const officeFlags = data.offices.map((o) => o.flagImage || "");

    return [
      ...data.banners.map((b) => b.image),
      ...data.categories.map((c) => c.image),
      ...data.featuredCollection.map((f) => f.image),
      ...data.galleryItems.map((g) => g.image),
      ...productImages,
      ...blogImages,
      ...officeFlags,
    ].filter(Boolean);
  }, [
    data.banners,
    data.categories,
    data.featuredCollection,
    data.galleryItems,
    data.products,
    data.blogs,
    data.offices,
  ]);

  useEffect(() => {
    if (status === "succeeded" || hydrated) {
      preloadAssets(assetUrls);
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
        <Route path="/contact" element={<Contact />} />
        <Route path="/aEgZjaHJvbWUyBggAEEUYOdIBCDUzMTRqMGo3" element={<Admin />} />
        <Route path="/buying-guide" element={<BuyingGuidePage />} />
        <Route path="/buying-guide/:slug" element={<BuyingGuidePage />} />
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
