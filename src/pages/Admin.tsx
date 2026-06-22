// src/pages/Admin.tsx
import { Suspense, lazy, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LogOut, LayoutDashboard, Image, Tag, Package, Sparkles, Newspaper,
  Instagram, Phone, Building2, Users, Megaphone, MessageSquareQuote,
  BookOpen, Menu, X, ChevronRight, Diamond, RectangleHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';

const AdminBanners         = lazy(() => import('@/components/admin/AdminBanners'));
const AdminCategories      = lazy(() => import('@/components/admin/AdminCategories'));
const AdminProducts        = lazy(() => import('@/components/admin/AdminProducts'));
const AdminGallery         = lazy(() => import('@/components/admin/AdminGallery'));
const AdminFeaturedCollection = lazy(() => import('@/components/admin/AdminFeaturedCollection'));
const AdminContact         = lazy(() => import('@/components/admin/AdminContact'));
const AdminOffices         = lazy(() => import('@/components/admin/AdminOffices'));
const AdminBlogs           = lazy(() => import('@/components/admin/AdminBlogs'));
const AdminInstagram       = lazy(() => import('@/components/admin/AdminInstagram'));
const AdminVisitors        = lazy(() => import('@/components/admin/AdminVisitors'));
const AdminPromoHeader     = lazy(() => import('@/components/admin/AdminPromoHeader'));
const AdminTestimonials    = lazy(() => import('@/components/admin/AdminTestimonials'));
const AdminBuyingGuides    = lazy(() => import('@/components/admin/AdminBuyingGuides'));
const AdminAds             = lazy(() => import('@/components/admin/AdminAds'));

const SectionFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">Loading section…</span>
    </div>
  </div>
);

type NavItem = { key: string; label: string; icon: ReactNode };
type NavGroup = { group: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    group: 'Website',
    items: [
      { key: 'promo',    label: 'Promo Banner',  icon: <Megaphone className="h-4 w-4" /> },
      { key: 'banners',  label: 'Banners',       icon: <Image className="h-4 w-4" /> },
      { key: 'ads',      label: 'Popup Ad',      icon: <RectangleHorizontal className="h-4 w-4" /> },
    ],
  },
  {
    group: 'Catalog',
    items: [
      { key: 'categories', label: 'Categories', icon: <Tag className="h-4 w-4" /> },
      { key: 'products',   label: 'Products',   icon: <Package className="h-4 w-4" /> },
      { key: 'gallery',    label: 'Gallery',    icon: <Image className="h-4 w-4" /> },
      { key: 'featured',   label: 'Featured',   icon: <Sparkles className="h-4 w-4" /> },
    ],
  },
  {
    group: 'Engage',
    items: [
      { key: 'testimonials',   label: 'Testimonials',   icon: <MessageSquareQuote className="h-4 w-4" /> },
      { key: 'blogs',          label: 'Blogs',          icon: <Newspaper className="h-4 w-4" /> },
      { key: 'instagram',      label: 'Instagram',      icon: <Instagram className="h-4 w-4" /> },
      { key: 'buying-guides',  label: 'Buying Guides',  icon: <BookOpen className="h-4 w-4" /> },
    ],
  },
  {
    group: 'Business',
    items: [
      { key: 'contact',  label: 'Contact Info', icon: <Phone className="h-4 w-4" /> },
      { key: 'offices',  label: 'Offices',      icon: <Building2 className="h-4 w-4" /> },
      { key: 'visitors', label: 'Visitors',     icon: <Users className="h-4 w-4" /> },
    ],
  },
];

const SECTION_MAP: Record<string, ReactNode> = {
  promo:          <AdminPromoHeader />,
  banners:        <AdminBanners />,
  ads:            <AdminAds />,
  categories:     <AdminCategories />,
  products:       <AdminProducts />,
  gallery:        <AdminGallery />,
  featured:       <AdminFeaturedCollection />,
  testimonials:   <AdminTestimonials />,
  blogs:          <AdminBlogs />,
  instagram:      <AdminInstagram />,
  'buying-guides': <AdminBuyingGuides />,
  contact:        <AdminContact />,
  offices:        <AdminOffices />,
  visitors:       <AdminVisitors />,
};

const LABELS: Record<string, string> = Object.fromEntries(
  NAV.flatMap((g) => g.items.map((i) => [i.key, i.label]))
);

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeKey, setActiveKey] = useState('banners');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'StarLala' && password === 'Panchkutir32') {
      setIsAuthenticated(true);
      toast.success('Welcome to Starlink Jewels Admin');
    } else {
      toast.error('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    navigate('/');
    toast('Logged out successfully');
  };

  const handleNav = (key: string) => {
    setActiveKey(key);
    setSidebarOpen(false);
  };

  // ── Login Screen ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="mx-auto w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg">
              <Diamond className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-semibold tracking-wide">Starlink Jewels</CardTitle>
              <CardDescription className="text-sm mt-1">Sign in to your admin panel</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" className="h-11" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-11" required />
              </div>
              <Button type="submit" size="lg" className="w-full h-11 bg-black hover:bg-gray-800 text-white mt-2">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={`${mobile ? 'flex' : 'hidden lg:flex'} flex-col w-64 bg-gray-900 text-white h-screen overflow-y-auto flex-shrink-0 scrollbar-thin-dark`}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-700/60">
        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
          <Diamond className="h-5 w-5 text-gray-900" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm leading-tight truncate">Starlink Jewels</p>
          <p className="text-xs text-gray-400 leading-tight">Admin Panel</p>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {NAV.map(({ group, items }) => (
          <div key={group}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-500">{group}</p>
            <div className="space-y-0.5">
              {items.map(({ key, label, icon }) => {
                const active = activeKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleNav(key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      active
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <span className={active ? 'text-gray-900' : 'text-gray-400'}>{icon}</span>
                    {label}
                    {active && <ChevronRight className="h-3.5 w-3.5 ml-auto text-gray-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-700/60">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4 text-gray-400" />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 flex">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 flex-shrink-0 z-40 shadow-sm">
          <div className="flex items-center gap-4 px-4 sm:px-6 h-16">
            {/* Hamburger (mobile) */}
            <button
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Page title */}
            <div className="flex items-center gap-2 min-w-0">
              <LayoutDashboard className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-500 hidden sm:block">Admin</span>
              <span className="text-gray-300 hidden sm:block">/</span>
              <span className="font-semibold text-gray-900 truncate">{LABELS[activeKey] ?? activeKey}</span>
            </div>

            {/* Right */}
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-700 font-medium">Live</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:flex gap-2">
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin-light">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-7 min-h-[600px]">
            <Suspense fallback={<SectionFallback />}>
              {SECTION_MAP[activeKey] ?? null}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
