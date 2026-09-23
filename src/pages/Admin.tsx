// src/pages/Admin.tsx
import { Suspense, lazy, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { LogOut, LayoutDashboard, Image, Tag, Package, Sparkles, Newspaper, Film, Phone, Building2, Users, Megaphone, MessageSquareQuote, Loader2, Eye, EyeOff } from 'lucide-react';

const AdminBanners = lazy(() => import('@/components/admin/AdminBanners'));
const AdminCategories = lazy(() => import('@/components/admin/AdminCategories'));
const AdminProducts = lazy(() => import('@/components/admin/AdminProducts'));
const AdminGallery = lazy(() => import('@/components/admin/AdminGallery'));
const AdminFeaturedCollection = lazy(() => import('@/components/admin/AdminFeaturedCollection'));
const AdminContact = lazy(() => import('@/components/admin/AdminContact'));
const AdminOffices = lazy(() => import('@/components/admin/AdminOffices'));
const AdminBlogs = lazy(() => import('@/components/admin/AdminBlogs'));
const AdminVideos = lazy(() => import('@/components/admin/AdminVideos'));
const AdminVisitors = lazy(() => import('@/components/admin/AdminVisitors'));
const AdminPromoHeader = lazy(() => import('@/components/admin/AdminPromoHeader'));
const AdminTestimonials = lazy(() => import('@/components/admin/AdminTestimonials'));
import { toast } from 'sonner';
const AdminBuyingGuides = lazy(() => import('@/components/admin/AdminBuyingGuides'));
import { BookOpen } from 'lucide-react';

const SectionFallback = () => (
  <div className="flex items-center justify-center min-h-[360px] text-sm text-muted-foreground">
    Loading section...
  </div>
);

// Human-readable messages for the Firebase Auth errors an admin is likely to hit.
const authErrorMessage = (error: unknown) => {
  const code = error instanceof FirebaseError ? error.code : '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Incorrect email or password';
    case 'auth/user-disabled':
      return 'This admin account has been disabled';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled in Firebase';
    default:
      return 'Could not sign in. Please try again';
  }
};

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [activeTab, setActiveTab] = useState('banners');
  const navigate = useNavigate();

  // Firebase keeps the session in the browser, so a signed-in admin stays signed in across reloads.
  // Only accounts listed in Firestore admins/{uid} get in; this matches firestore.rules / storage.rules.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setCheckingSession(false);
        return;
      }
      try {
        const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
        if (adminDoc.exists()) {
          setUser(currentUser);
        } else {
          await signOut(auth);
          setUser(null);
          toast.error('This account does not have admin access');
        }
      } catch {
        await signOut(auth);
        setUser(null);
        toast.error('Could not verify admin access. Please try again');
      } finally {
        setCheckingSession(false);
      }
    });
    return unsubscribe;
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setPassword('');
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error('Enter your admin email first');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      toast.success('Password reset email sent. Check your inbox.');
    } catch (error) {
      toast.error(authErrorMessage(error));
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setEmail('');
    setPassword('');
    navigate('/');
    toast('Logged out successfully');
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center">
              <LayoutDashboard className="h-9 w-9 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-light tracking-wider">STARLINK JEWELS</CardTitle>
              <CardDescription className="text-base mt-2">Admin Dashboard</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@starlinkjewels.com"
                  className="h-12"
                  autoComplete="username"
                  required
                  disabled={isSigningIn}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-base">Password</Label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-gray-500 hover:text-gray-900 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••"
                    className="h-12 pr-12"
                    autoComplete="current-password"
                    required
                    disabled={isSigningIn}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full h-12 bg-black hover:bg-gray-800 text-white" disabled={isSigningIn}>
                {isSigningIn ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Access Admin Panel'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderTab = (key: string, content: ReactNode) => (
    <TabsContent value={key}>
      {activeTab === key && (
        <Suspense fallback={<SectionFallback />}>
          {content}
        </Suspense>
      )}
    </TabsContent>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-full mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-black rounded-lg flex items-center justify-center">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-light tracking-wider text-gray-900">STARLINK JEWELS</h1>
              <p className="text-sm text-gray-500 -mt-0.5">Admin Control Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-500 sm:inline">{user.email}</span>
            <Button variant="ghost" onClick={handleLogout} className="text-gray-600 hover:text-gray-900">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Clean Professional Tab Bar */}
          <ScrollArea className="w-full whitespace-nowrap mb-10">
            <TabsList className="inline-flex h-14 rounded-xl bg-gray-100 p-2 gap-1">
              <TabsTrigger value="promo" className="rounded-lg px-5 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Megaphone className="h-4 w-4 mr-2" /> Promo
              </TabsTrigger>
              <TabsTrigger value="banners" className="rounded-lg px-5 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Image className="h-4 w-4 mr-2" /> Banners
              </TabsTrigger>
              <TabsTrigger value="categories" className="rounded-lg px-5 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Tag className="h-4 w-4 mr-2" /> Categories
              </TabsTrigger>
              <TabsTrigger value="products" className="rounded-lg px-5 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Package className="h-4 w-4 mr-2" /> Products
              </TabsTrigger>
              <TabsTrigger value="gallery" className="rounded-lg px-5 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Image className="h-4 w-4 mr-2" /> Gallery
              </TabsTrigger>
              <TabsTrigger value="featured" className="rounded-lg px-5 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Sparkles className="h-4 w-4 mr-2" /> Featured
              </TabsTrigger>
              <TabsTrigger value="testimonials" className="rounded-lg px-5 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <MessageSquareQuote className="h-4 w-4 mr-2" /> Testimonials
              </TabsTrigger>
              <TabsTrigger value="blogs" className="rounded-lg px-5 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Newspaper className="h-4 w-4 mr-2" /> Blogs
              </TabsTrigger>
              <TabsTrigger value="videos" className="rounded-lg px-5 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Film className="h-4 w-4 mr-2" /> Videos
              </TabsTrigger>
              <TabsTrigger value="contact" className="rounded-lg px-5 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Phone className="h-4 w-4 mr-2" /> Contact
              </TabsTrigger>
              <TabsTrigger value="offices" className="rounded-lg px-5 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Building2 className="h-4 w-4 mr-2" /> Offices
              </TabsTrigger>
              <TabsTrigger value="visitors" className="rounded-lg px-5 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Users className="h-4 w-4 mr-2" /> Visitors
              </TabsTrigger>
              <TabsTrigger value="buying-guides" className="rounded-lg px-5 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
  <BookOpen className="h-4 w-4 mr-2" /> Buying Guides
</TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Clean Content Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[600px]">
            {renderTab("promo", <AdminPromoHeader />)}
            {renderTab("banners", <AdminBanners />)}
            {renderTab("categories", <AdminCategories />)}
            {renderTab("products", <AdminProducts />)}
            {renderTab("gallery", <AdminGallery />)}
            {renderTab("featured", <AdminFeaturedCollection />)}
            {renderTab("testimonials", <AdminTestimonials />)}
            {renderTab("blogs", <AdminBlogs />)}
            {renderTab("videos", <AdminVideos />)}
            {renderTab("contact", <AdminContact />)}
            {renderTab("offices", <AdminOffices />)}
            {renderTab("visitors", <AdminVisitors />)}
            {renderTab("buying-guides", <AdminBuyingGuides />)}
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
