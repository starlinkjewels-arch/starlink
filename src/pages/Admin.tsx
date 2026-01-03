// src/pages/Admin.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { LogOut, LayoutDashboard, Image, Tag, Package, Sparkles, Newspaper, Instagram, Phone, Building2, Users, Megaphone, MessageSquareQuote } from 'lucide-react';

import AdminBanners from '@/components/admin/AdminBanners';
import AdminCategories from '@/components/admin/AdminCategories';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminGallery from '@/components/admin/AdminGallery';
import AdminFeaturedCollection from '@/components/admin/AdminFeaturedCollection';
import AdminContact from '@/components/admin/AdminContact';
import AdminOffices from '@/components/admin/AdminOffices';
import AdminBlogs from '@/components/admin/AdminBlogs';
import AdminInstagram from '@/components/admin/AdminInstagram';
import AdminVisitors from '@/components/admin/AdminVisitors';
import AdminPromoHeader from '@/components/admin/AdminPromoHeader';
import AdminTestimonials from '@/components/admin/AdminTestimonials';
import { toast } from 'sonner';
import AdminBuyingGuides from '@/components/admin/AdminBuyingGuides';
import { BookOpen } from 'lucide-react';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

  if (!isAuthenticated) {
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
                <Label htmlFor="username" className="text-base">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••"
                  className="h-12"
                  required
                />
              </div>
              <Button type="submit" size="lg" className="w-full h-12 bg-black hover:bg-gray-800 text-white">
                Access Admin Panel
              </Button>
            </form>
            {/* <p className="text-center text-sm text-muted-foreground">
              Use: <span className="font-mono">admin</span> / <span className="font-mono">123</span>
            </p> */}
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <Button variant="ghost" onClick={handleLogout} className="text-gray-600 hover:text-gray-900">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-full mx-auto px-6 py-8">
        <Tabs defaultValue="banners" className="w-full">
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
              <TabsTrigger value="instagram" className="rounded-lg px-5 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Instagram className="h-4 w-4 mr-2" /> Instagram
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
            <TabsContent value="promo"><AdminPromoHeader /></TabsContent>
            <TabsContent value="banners"><AdminBanners /></TabsContent>
            <TabsContent value="categories"><AdminCategories /></TabsContent>
            <TabsContent value="products"><AdminProducts /></TabsContent>
            <TabsContent value="gallery"><AdminGallery /></TabsContent>
            <TabsContent value="featured"><AdminFeaturedCollection /></TabsContent>
            <TabsContent value="testimonials"><AdminTestimonials /></TabsContent>
            <TabsContent value="blogs"><AdminBlogs /></TabsContent>
            <TabsContent value="instagram"><AdminInstagram /></TabsContent>
            <TabsContent value="contact"><AdminContact /></TabsContent>
            <TabsContent value="offices"><AdminOffices /></TabsContent>
            <TabsContent value="visitors"><AdminVisitors /></TabsContent>
            <TabsContent value="buying-guides">
  <AdminBuyingGuides />
</TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
