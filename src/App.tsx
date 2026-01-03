import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import GlobalLoader from "@/components/GlobalLoader";
import { useGlobalData } from "@/hooks/useGlobalData";
import Index from "./pages/Index";
import About from "./pages/About";
import Categories from "./pages/Categories";
import CategoryProducts from "./pages/CategoryProducts";
import Gallery from "./pages/Gallery";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import BuyingGuidePage from "./pages/BuyingGuide";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import { requestLocationAndLog } from '@/lib/locationPermission';

const queryClient = new QueryClient();

const AppContent = () => {
  const { isLoading, banners, categories, featuredCollection, galleryItems } = useGlobalData();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const timer = setTimeout(() => {
      requestLocationAndLog();
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Collect important images to preload (banners are most critical)
  const imagesToPreload = [
    ...banners.map(b => b.image),
    ...categories.slice(0, 6).map(c => c.image),
    ...featuredCollection.slice(0, 4).map(f => f.image),
    ...galleryItems.slice(0, 4).map(g => g.image),
  ].filter(Boolean);

  // Only show loader on home page
  const showLoader = isLoading && isHomePage;

  return (
    <>
      <GlobalLoader isLoading={showLoader} imagesToPreload={imagesToPreload} />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:id" element={<CategoryProducts />} />
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