import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Moon, Sun, ChevronDown, ArrowRight, Search, Phone, Mail, Gem, Sparkles, Rotate3d } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import HeaderSearch from "@/components/site/HeaderSearch";
import DiamondShapeIcon from "@/components/site/DiamondShapeIcon";
import DesignToolsMenu from "@/components/site/DesignToolsMenu";
import logo from "@/assets/starlink-logo-horizontal.png";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadProducts, selectGlobalData, selectProductsLoaded, selectProductsStatus } from "@/store/contentSlice";
import { orderCategoriesWithCustomFirst, isCustomJewelryCategory, productHasCategory, type Category } from "@/lib/storage";
import { firstImage, getProductTime } from "@/lib/media";
import { DIAMOND_SHAPES } from "@/lib/search";
import { SITE } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const DEFAULT_ANNOUNCEMENTS = [
  "Complimentary insured worldwide shipping on orders over $500",
  "IGI & GIA certified lab-grown and natural diamonds",
  "Custom designs made to order — chat with our experts",
];

const utilityLinks = [
  { name: "About", path: "/about" },
  { name: "Gallery", path: "/gallery" },
  { name: "Journal", path: "/blog" },
  { name: "Contact", path: "/contact" },
];

const MENU_SHAPES = DIAMOND_SHAPES.slice(0, 6);
// Remaining collections stay reachable through "All Jewelry" so the nav row never overflows.
const NAV_CATEGORY_LIMIT = 7;
const ALL = "__all__";

const AnnouncementTicker = ({ messages }: { messages: string[] }) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (messages.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % messages.length), 4500);
    return () => window.clearInterval(id);
  }, [messages.length]);

  return (
    <p key={index} className="flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-1 duration-500">
      <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-200" aria-hidden />
      <span className="truncate">{messages[index % messages.length]}</span>
    </p>
  );
};

const Header = () => {
  const dispatch = useAppDispatch();
  const { categories, products, promoHeader, contactInfo } = useAppSelector(selectGlobalData);
  const productsLoaded = useAppSelector(selectProductsLoaded);
  const productsStatus = useAppSelector(selectProductsStatus);
  const { resolvedTheme, setTheme } = useTheme();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const orderedCategories = useMemo(() => orderCategoriesWithCustomFirst(categories), [categories]);
  const announcements = useMemo(
    () => (promoHeader?.enabled && promoHeader.text ? [promoHeader.text, ...DEFAULT_ANNOUNCEMENTS] : DEFAULT_ANNOUNCEMENTS),
    [promoHeader?.enabled, promoHeader?.text]
  );
  const phone = contactInfo?.phone || SITE.phonePrimary;
  const email = contactInfo?.email || SITE.email;
  const consultLink = whatsappLink("Hi Starlink Jewels! I'd like to book a consultation.", contactInfo?.whatsapp);
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setActiveMenu(null);
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  const openMenu = (key: string) => {
    setActiveMenu(key);
    // Mega menus preview real pieces, so fetch the catalogue on first hover.
    if (!productsLoaded && productsStatus === "idle") dispatch(loadProducts());
  };

  const activeCategory: Category | undefined = activeMenu && activeMenu !== ALL ? categories.find((c) => c.id === activeMenu) : undefined;
  const menuProducts = useMemo(() => {
    if (!activeCategory) return [];
    return products
      .filter((p) => productHasCategory(p, activeCategory.id))
      .sort((a, b) => getProductTime(b) - getProductTime(a))
      .slice(0, 4);
  }, [activeCategory, products]);

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");
  const isActivePath = (path: string) => location.pathname === path;

  return (
    <>
      {/* Tier 1: utility bar */}
      {/* Sapphire gradient taken from the logo blue, with a slow light shimmer. */}
      <div className="bar-shine relative overflow-hidden bg-gradient-to-r from-[#17305f] via-brand to-[#17305f] text-white dark:from-[#0c1a36] dark:via-[#1d3b78] dark:to-[#0c1a36]">
        <div className="container-wide relative grid h-10 grid-cols-1 items-center gap-6 text-[11px] font-medium uppercase tracking-[0.12em] lg:grid-cols-[1fr_minmax(0,1.4fr)_1fr]">
          <div className="hidden items-center gap-5 normal-case tracking-normal text-white/85 lg:flex">
            <a href={`tel:${phone}`} className="flex items-center gap-2 text-xs transition-colors hover:text-white">
              <Phone className="h-3.5 w-3.5 text-amber-200" /> {phone}
            </a>
            <a href={consultLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs transition-colors hover:text-white">
              <FaWhatsapp className="h-3.5 w-3.5 text-[#6ee7a0]" /> WhatsApp us
            </a>
            <a href={`mailto:${email}`} className="hidden items-center gap-2 text-xs transition-colors hover:text-white 2xl:flex">
              <Mail className="h-3.5 w-3.5 text-amber-200" /> {email}
            </a>
          </div>
          <div className="min-w-0 overflow-hidden">
            <AnnouncementTicker messages={announcements} />
          </div>
          <nav className="hidden items-center justify-end gap-6 lg:flex" aria-label="Company">
            {utilityLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "relative py-1 transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-current after:transition-transform after:duration-300 hover:text-white",
                  isActivePath(link.path) ? "text-white after:scale-x-100" : "text-white/75 after:scale-x-0 hover:after:scale-x-100"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 border-b bg-background/95 backdrop-blur-xl transition-shadow duration-300",
          (isScrolled || activeMenu) && "shadow-[0_8px_30px_-12px_rgba(15,27,51,0.25)]"
        )}
        onMouseLeave={() => setActiveMenu(null)}
      >
        {/* Tier 2: search · logo · actions */}
        <div className={cn("container-wide grid grid-cols-[1fr_auto_1fr] items-center gap-4 transition-[height] duration-300", isScrolled ? "h-16" : "h-20")}>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="-ml-2 lg:hidden" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
            <HeaderSearch className="hidden w-full max-w-[320px] lg:block" />
          </div>

          <Link to="/" className="flex items-center justify-center" aria-label="Starlink Jewels home">
            <img
              src={logo}
              alt="Starlink Jewels - Lab Grown & Natural Diamond Jewelry"
              className={cn("w-auto transition-all duration-300 dark:brightness-150", isScrolled ? "h-9" : "h-10 md:h-12")}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </Link>

          <div className="flex items-center justify-end gap-1 lg:gap-3">
            <a
              href={consultLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2.5 rounded-full px-3 py-1.5 transition-colors hover:bg-secondary xl:flex"
            >
              <FaWhatsapp className="h-6 w-6 text-whatsapp" />
              <span className="leading-tight">
                <span className="block text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Need help?</span>
                <span className="block text-sm font-semibold">Chat with an expert</span>
              </span>
            </a>
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle dark mode" className="hidden sm:inline-flex">
              {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </Button>
            <DesignToolsMenu className="hidden md:block" />
            <Button asChild variant="ghost" size="icon" className="-mr-2 md:hidden" aria-label="Chat on WhatsApp">
              <a href={consultLink} target="_blank" rel="noopener noreferrer">
                <FaWhatsapp className="h-5 w-5 text-whatsapp" />
              </a>
            </Button>
          </div>
        </div>

        {/* Tier 3: category navigation (desktop) */}
        <nav className="hidden border-t lg:block" aria-label="Shop">
          <div className="scrollbar-hide overflow-x-auto">
            <ul className="mx-auto flex w-max items-center px-6">
              <li>
                <button
                  type="button"
                  onMouseEnter={() => openMenu(ALL)}
                  onClick={() => (activeMenu === ALL ? setActiveMenu(null) : openMenu(ALL))}
                  aria-expanded={activeMenu === ALL}
                  className={cn(
                    "flex h-12 items-center gap-1.5 px-4 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors",
                    activeMenu === ALL ? "text-brand" : "text-foreground hover:text-brand"
                  )}
                >
                  All Jewelry <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", activeMenu === ALL && "rotate-180")} />
                </button>
              </li>
              {orderedCategories.slice(0, NAV_CATEGORY_LIMIT).map((category) => {
                const active = activeMenu === category.id || location.pathname === `/category/${category.id}`;
                const highlight = isCustomJewelryCategory(category);
                return (
                  <li key={category.id}>
                    <Link
                      to={`/category/${category.id}`}
                      onMouseEnter={() => openMenu(category.id)}
                      className={cn(
                        "relative flex h-12 items-center gap-1.5 whitespace-nowrap px-3.5 text-[12px] font-medium uppercase tracking-[0.12em] transition-colors",
                        active ? "text-brand" : "text-foreground/80 hover:text-brand"
                      )}
                    >
                      {highlight && <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />}
                      {category.name}
                      <span className={cn("absolute inset-x-3.5 bottom-0 h-0.5 origin-left bg-brand transition-transform duration-300", active ? "scale-x-100" : "scale-x-0")} />
                    </Link>
                  </li>
                );
              })}
              <li className="ml-2 border-l pl-2">
                <Link
                  to="/buying-guide"
                  onMouseEnter={() => setActiveMenu(null)}
                  className={cn(
                    "flex h-12 items-center whitespace-nowrap px-4 text-[12px] font-medium uppercase tracking-[0.14em] transition-colors",
                    location.pathname.startsWith("/buying-guide") ? "text-brand" : "text-foreground/80 hover:text-brand"
                  )}
                >
                  Diamond Guide
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Mega menu */}
        <div
          className={cn(
            "absolute inset-x-0 top-full hidden border-b border-t bg-background shadow-[0_30px_50px_-30px_rgba(15,27,51,0.45)] transition-all duration-200 lg:block",
            activeMenu ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-1 opacity-0"
          )}
        >
          {activeMenu === ALL ? (
            <div className="container-wide grid grid-cols-[1fr_300px] gap-12 py-10">
              <div>
                <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Shop by collection</p>
                <div className="grid grid-cols-4 gap-5">
                  {orderedCategories.slice(0, 8).map((category) => (
                    <Link key={category.id} to={`/category/${category.id}`} className="group flex items-center gap-3">
                      <span className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                        <img src={category.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                      </span>
                      <span className="text-sm font-medium group-hover:text-brand">{category.name}</span>
                    </Link>
                  ))}
                </div>
                <Link to="/categories" className="link-underline mt-8">
                  View all collections <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <ShapeColumn />
            </div>
          ) : activeCategory ? (
            <div className="container-wide grid grid-cols-[260px_1fr_300px] gap-10 py-10">
              <div>
                <p className="eyebrow mb-3">Collection</p>
                <p className="font-display text-3xl leading-tight">{activeCategory.name}</p>
                {activeCategory.description && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{activeCategory.description}</p>}
                <Button asChild className="mt-6 rounded-full" size="sm">
                  <Link to={`/category/${activeCategory.id}`}>
                    Shop {activeCategory.name} <ArrowRight />
                  </Link>
                </Button>
              </div>
              <div>
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Latest pieces</p>
                {menuProducts.length > 0 ? (
                  <div className="grid grid-cols-4 gap-4">
                    {menuProducts.map((product) => (
                      <Link key={product.id} to={`/product/${product.id}`} className="group block">
                        <span className="block aspect-square overflow-hidden rounded-md bg-muted">
                          <img src={firstImage(product)} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                        </span>
                        <span className="mt-2 line-clamp-2 text-xs font-medium leading-snug group-hover:text-brand">{product.name}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <span key={i} className="aspect-square animate-pulse rounded-md bg-muted" />
                    ))}
                  </div>
                )}
              </div>
              <ShapeColumn />
            </div>
          ) : null}
        </div>
      </header>

      {/* Mobile search */}
      <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
        <SheetContent side="top" className="max-h-[90vh] overflow-y-auto p-5 pt-12">
          <SheetTitle className="sr-only">Search</SheetTitle>
          <HeaderSearch variant="panel" autoFocus onNavigate={() => setSearchOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Mobile menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="flex w-[88vw] max-w-sm flex-col gap-0 overflow-y-auto p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="border-b px-5 py-5">
            <img src={logo} alt="Starlink Jewels" className="h-9 w-auto dark:brightness-150" />
          </div>
          <div className="border-b px-5 py-4">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(true);
              }}
              className="flex h-11 w-full items-center gap-3 rounded-full border px-4 text-sm text-muted-foreground"
            >
              <Search className="h-4 w-4" /> Search jewelry…
            </button>
          </div>
          <div className="px-5 py-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Shop</p>
            <ul className="divide-y">
              {orderedCategories.map((category) => (
                <li key={category.id}>
                  <Link to={`/category/${category.id}`} className="flex items-center gap-3 py-3">
                    <img src={category.image} alt="" className="h-11 w-11 rounded-md object-cover" loading="lazy" />
                    <span className="flex-1 text-[15px] font-medium">{category.name}</span>
                    {isCustomJewelryCategory(category) && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-gold">In stock</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t px-5 py-5">
            {[
              { ...SITE.ringBuilder, icon: Gem },
              { ...SITE.viewer360, icon: Rotate3d },
            ].map(({ url, label, title, icon: Icon }) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener"
                title={title}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#17305f] via-brand to-[#17305f] px-3 py-3 text-sm font-semibold text-white"
              >
                <Icon className="h-4 w-4" /> {label}
              </a>
            ))}
            {[{ name: "Home", path: "/" }, { name: "Diamond Guide", path: "/buying-guide" }, ...utilityLinks].map((link) => (
              <Link key={link.path} to={link.path} className="rounded-md bg-secondary/70 px-3 py-2.5 text-sm font-medium">
                {link.name}
              </Link>
            ))}
          </div>
          <div className="mt-auto space-y-3 border-t bg-navy px-5 py-6 text-navy-foreground">
            <a href={`tel:${phone}`} className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gold" /> {phone}
            </a>
            <Button asChild variant="whatsapp" size="xl" className="w-full">
              <a href={consultLink} target="_blank" rel="noopener noreferrer">
                <FaWhatsapp /> Chat on WhatsApp
              </a>
            </Button>
            <button type="button" onClick={toggleTheme} className="flex w-full items-center justify-center gap-2 py-1 text-xs uppercase tracking-[0.14em] text-navy-foreground/70">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} {isDark ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

const ShapeColumn = () => (
  <div className="border-l pl-10">
    <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Shop by shape</p>
    <div className="grid grid-cols-3 gap-3">
      {MENU_SHAPES.map((shape) => (
        <Link
          key={shape}
          to={`/search?q=${encodeURIComponent(shape)}`}
          className="group flex flex-col items-center gap-1.5 rounded-md py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <DiamondShapeIcon shape={shape} className="h-9 w-9 text-foreground/70 transition-colors group-hover:text-brand" />
          {shape}
        </Link>
      ))}
    </div>
  </div>
);

export default Header;
