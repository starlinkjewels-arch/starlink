import { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from '@/components/Header';
import MiniHeader from '@/components/MiniHeader';
import Footer from '@/components/Footer';
import BannerCarousel from '@/components/BannerCarousel';
import SEOHead from '@/components/SEOHead';
import ServicesSection from '@/components/ServicesSection';
import BlogDialog from '@/components/BlogDialog';
import { useGlobalData } from '@/hooks/useGlobalData';
import { Button } from '@/components/ui/button';
import { Truck, Gift, ShieldCheck, Quote, Star, Award, Sparkles, BadgeCheck } from 'lucide-react';
import { BlogPost } from '@/lib/storage';

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const {
    banners,
    categories,
    featuredCollection,
    galleryItems,
    blogs,
    instagramPosts,
    testimonials,
    promoHeader,
    contactInfo
  } = useGlobalData();

  const animationRef = useRef<gsap.Context | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [isBlogDialogOpen, setIsBlogDialogOpen] = useState(false);

  const sortedBlogs = useMemo(
    () => [...blogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [blogs]
  );

  const handleBlogClick = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setIsBlogDialogOpen(true);
  };

  const hasPromo = promoHeader?.enabled && promoHeader?.text;
  const promoHeight = hasPromo ? 40 : 0;
  const paddingTop = promoHeight + 80 + 52 + 12;

  useEffect(() => {
    if (animationRef.current) {
      animationRef.current.revert();
    }

    animationRef.current = gsap.context(() => {
      gsap.from('.hero-title', {
        scrollTrigger: { trigger: '.hero-title', start: 'top 85%', once: true },
        y: 60, opacity: 0, duration: 1, ease: 'power3.out',
      });

      gsap.from('.category-card', {
        scrollTrigger: { trigger: '.categories-section', start: 'top 80%', once: true },
        y: 80, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'power2.out',
      });

      gsap.from('.feature-card', {
        scrollTrigger: { trigger: '.features-section', start: 'top 75%', once: true },
        y: 60, opacity: 0, stagger: 0.15, duration: 0.9, ease: 'power3.out',
      });
    });

    return () => { animationRef.current?.revert(); };
  }, [categories.length, sortedBlogs.length]);

  const aboutFeatures = [
    { 
      icon: Truck, 
      title: 'Express Worldwide Delivery', 
      description: 'Fast, Insured Delivery Worldwide',
      stats: '30+ Countries',
      highlight: 'Fully Insured'
    },
    { 
      icon: Gift, 
      title: 'Complimentary Global Shipping', 
      description: 'Free Shipping With Luxury Packaging',
      stats: 'Orders $500+',
      highlight: 'Premium Packaging'
    },
    { 
      icon: ShieldCheck, 
      title: 'Certified & Secure Payments', 
      description: 'Encrypted Payments With Safest Portal',
      stats: '100% Secure',
      highlight: 'Bank-Level Security'
    },
    { 
      icon: Award, 
      title: 'Authenticity Guaranteed', 
      description: 'Certified Jewelry With Lifetime Guarantee',
      stats: 'GIA / IGI Certified',
      highlight: 'Lifetime Guarantee'
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Premium Diamond & Gold Jewelry | Lab Grown & Natural Diamonds | Starlink Jewels"
        description="Shop certified lab-grown and natural diamond jewelry at Starlink Jewels. Explore GIA certified engagement rings, wedding bands, necklaces, earrings & bracelets. Free worldwide shipping. Best prices guaranteed."
        keywords="diamond jewelry, gold rings, engagement rings, wedding bands, lab grown diamonds, natural diamonds, certified jewelry, luxury jewelry store, GIA certified diamonds, platinum rings, solitaire rings, diamond necklaces, gold earrings, diamond bracelets, custom jewelry design, wholesale diamond jewelry, buy diamonds online, best diamond jewelry store, affordable diamond rings, diamond jewelry Mumbai India"
        canonicalUrl="https://starlinkjewels.com"
      />

      <Header promoHeader={promoHeader} />
      <MiniHeader categories={categories} promoHeight={promoHeight} />

      <main className="flex-1" style={{ paddingTop: `${paddingTop}px` }}>
        {/* Hero Banner */}
        <section className="w-full px-4 md:px-6 mb-16 md:mb-20">
          <BannerCarousel banners={banners} />
        </section>

        {/* About Section */}
        <section className="about-section container mx-auto px-4 mb-16 md:mb-20">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Crafting Excellence Since 2011</h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Starlink Jewels Is a Premier Destination for Luxury Jewelry, Combining Traditional Craftsmanship with Contemporary Design. from Ethically Sourced Diamonds to Handcrafted Settings, Every Piece Tells a Unique Story.
            </p>
          </div>

          <div className="text-center mt-8">
            <Link to="/about"><Button size="lg" variant="outline">Read More</Button></Link>
          </div>
        </section>

        {/* Categories Section */}
        {categories.length > 0 && (
          <section className="categories-section container mx-auto px-4 mb-20">
            <div className="text-center mb-12">
              <h2 className="hero-title text-4xl md:text-5xl font-bold mb-4">Explore Our Collections</h2>
              <p className="text-lg text-muted-foreground">Discover jewelry for every occasion</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.slice(0, 6).map((category) => (
                <Link key={category.id} to={`/category/${category.id}`} className="category-card group">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-3 bg-muted">
                    <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  </div>
                  <h3 className="font-semibold text-center group-hover:text-primary transition-colors">{category.name}</h3>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link to="/categories"><Button size="lg" className="luxury-gradient">View All Categories</Button></Link>
            </div>
          </section>
        )}

        {/* Featured Collection */}
        {featuredCollection.length > 0 && (
          <section className="mb-16 md:mb-20 overflow-hidden">
            <div className="text-center mb-8 md:mb-12 px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">Featured Collection</h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground">Handpicked treasures for the discerning</p>
            </div>
            <div className="flex gap-3 sm:gap-4 animate-[scroll_25s_linear_infinite] sm:animate-[scroll_18s_linear_infinite] hover:pause pl-4">
              {[...featuredCollection, ...featuredCollection].map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex-shrink-0 w-[280px] sm:w-72 md:w-80 rounded-xl sm:rounded-2xl overflow-hidden bg-card border border-border shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="w-full h-[280px] sm:h-72 md:h-80 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-bold mb-1 line-clamp-1">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Enhanced Features Section with Premium Background */}
        <section className="features-section py-20 md:py-28 mb-16 md:mb-20 relative overflow-hidden bg-gradient-to-br from-muted/40 via-background to-muted/30">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-primary/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 md:mb-20">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-6 shadow-lg backdrop-blur-sm">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <span className="text-sm font-bold text-primary uppercase tracking-wider">Our Best Service for You</span>
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                Excellence in Every Detail
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover the Unparalleled Benefits that Make Us the Preferred Choice for Discerning Jewelry Enthusiasts Worldwide
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-[1400px] mx-auto mb-5">
              {aboutFeatures.map((feature, index) => (
                <div 
                  key={index} 
                  className="feature-card group relative"
                >
                  <div className="h-full p-7 md:p-9 rounded-3xl bg-card/90 backdrop-blur-md border-2 border-border/50 hover:border-primary/40 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden">
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-primary/10 transition-all duration-700 pointer-events-none" />
                    
                    {/* Decorative corner accents */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
                    
                    <div className="relative z-10">
                      {/* Icon with animated ring */}
                      <div className="mb-6 relative">
                        <div className="relative inline-block">
                          {/* Outer animated ring */}
                          <div className="absolute inset-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-primary/20 group-hover:scale-110 transition-transform duration-500 blur-sm" />
                          
                          {/* Main icon container */}
                          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl">
                            <feature.icon className="h-10 w-10 md:h-12 md:w-12 text-primary drop-shadow-lg" />
                          </div>
                        </div>
                        
                        {/* Stats badge with glow effect */}
                        <div className="absolute -top-3 -right-3 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-bold shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                          <span className="relative z-10">{feature.stats}</span>
                          <div className="absolute inset-0 bg-primary/50 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="font-bold text-xl md:text-2xl mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </h3>
                      
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed ">
                        {feature.description}
                      </p>

                      {/* Highlight badge with icon */}
                      {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 mt-auto group-hover:bg-primary/15 group-hover:border-primary/40 transition-all duration-300 shadow-md">
                        <BadgeCheck className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-xs font-bold text-primary uppercase tracking-wide">{feature.highlight}</span>
                      </div> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust indicators with enhanced styling */}
            <div className="mt-20 pt-16 border-t-2 border-border/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-5xl mx-auto">
                <div className="text-center group cursor-default">
                  <div className="mb-3 relative inline-block">
                    <div className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-br from-primary via-primary to-primary/70 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                      10+
                    </div>
                    <div className="absolute inset-0 blur-xl bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="text-sm md:text-base font-semibold text-muted-foreground uppercase tracking-wider">Years of Excellence</div>
                </div>
                
                <div className="text-center group cursor-default">
                  <div className="mb-3 relative inline-block">
                    <div className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-br from-primary via-primary to-primary/70 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                      12K+
                    </div>
                    <div className="absolute inset-0 blur-xl bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="text-sm md:text-base font-semibold text-muted-foreground uppercase tracking-wider">Happy Customers</div>
                </div>
                
                <div className="text-center group cursor-default">
                  <div className="mb-3 relative inline-block">
                    <div className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-br from-primary via-primary to-primary/70 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                      30+
                    </div>
                    <div className="absolute inset-0 blur-xl bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="text-sm md:text-base font-semibold text-muted-foreground uppercase tracking-wider">Countries Served</div>
                </div>
                
                <div className="text-center group cursor-default">
                  <div className="mb-3 relative inline-block">
                    <div className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-br from-primary via-primary to-primary/70 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                      100%
                    </div>
                    <div className="absolute inset-0 blur-xl bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="text-sm md:text-base font-semibold text-muted-foreground uppercase tracking-wider">Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery */}
        {galleryItems.length > 0 && (
          <section className="mb-16 md:mb-20 overflow-hidden">
            <div className="text-center mb-8 md:mb-12 px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">Gallery Showcase</h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground">Exquisite moments captured in time</p>
            </div>
            <div className="flex gap-3 sm:gap-4 animate-[scroll_20s_linear_infinite] sm:animate-[scroll_15s_linear_infinite] hover:pause pl-4">
              {[...galleryItems, ...galleryItems].map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex-shrink-0 w-[260px] sm:w-72 md:w-80 h-[260px] sm:h-72 md:h-80 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                  <img src={item.image} alt={item.description || 'Gallery'} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" loading="lazy" />
                </div>
              ))}
            </div>
            <div className="text-center mt-6 md:mt-8 px-4">
              <Link to="/gallery"><Button size="lg" variant="outline">View Full Gallery</Button></Link>
            </div>
          </section>
        )}

        {/* Blog Section */}
        {sortedBlogs.length > 0 && (
          <section className="blog-section container mx-auto px-4 mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Latest Stories</h2>
              <p className="text-lg text-muted-foreground">Insights from the world of luxury jewelry</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {sortedBlogs.slice(0, 3).map((blog) => {
                const plainText = blog.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
                return (
                  <article
                    key={blog.id}
                    className="group cursor-pointer hover-lift rounded-2xl overflow-hidden bg-card border border-border shadow-lg"
                    onClick={() => handleBlogClick(blog)}
                  >
                    <div className="aspect-video overflow-hidden bg-muted">
                      <img src={blog.thumbnail || blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                    </div>
                    <div className="p-6">
                      <time className="text-sm text-muted-foreground mb-2 block">{new Date(blog.date).toLocaleDateString()}</time>
                      <h3 className="font-semibold text-xl mb-3 group-hover:text-primary transition-colors">{blog.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">{plainText}</p>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="text-center mt-8">
              <Link to="/blog"><Button size="lg" variant="outline">Read More Articles</Button></Link>
            </div>
          </section>
        )}

        {/* Instagram Posts */}
        {instagramPosts.length > 0 && (
          <section className="mb-16 md:mb-20 overflow-hidden">
            <div className="px-4">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">Follow Our Journey</h2>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground">Connect with us on Instagram</p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4 animate-[scroll_25s_linear_infinite] sm:animate-[scroll_20s_linear_infinite] hover:pause pl-4">
              {[...instagramPosts.slice(0, 10), ...instagramPosts.slice(0, 10)].map((post, index) => {
                const getEmbedUrl = (url: string) => {
                  const postMatch = url.match(/instagram\.com\/(p|reel)\/([^/?]+)/);
                  return postMatch ? `https://www.instagram.com/${postMatch[1]}/${postMatch[2]}/embed/` : null;
                };
                const embedUrl = getEmbedUrl(post.url);
                return (
                  <div
                    key={`${post.id}-${index}`}
                    onClick={() => window.open(post.url, '_blank')}
                    className="flex-shrink-0 w-[280px] sm:w-72 md:w-80 h-[320px] sm:h-[350px] rounded-xl sm:rounded-2xl overflow-hidden hover-lift bg-background border border-border shadow-lg cursor-pointer"
                  >
                    {embedUrl ? (
                      <iframe src={embedUrl} className="w-full h-full" frameBorder="0" scrolling="no" title={`Instagram post ${post.id}`} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">Instagram Post</div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section className="mb-16 md:mb-20 overflow-hidden">
            <div className="text-center mb-8 md:mb-12 px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">What Our Customers Say</h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground">Real experiences from our valued customers</p>
            </div>
            <div className="flex gap-4 sm:gap-6 animate-[scroll_25s_linear_infinite] sm:animate-[scroll_18s_linear_infinite] hover:pause pl-4">
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <div key={`${testimonial.id}-${index}`} className="flex-shrink-0 w-[300px] sm:w-80 md:w-96 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-card border border-border shadow-lg">
                  <Quote className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary/30 mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-foreground/90 mb-3 sm:mb-4 line-clamp-4">{testimonial.text}</p>
                  <div className="flex items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-border">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-base sm:text-lg font-bold text-primary">{testimonial.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm sm:text-base">{testimonial.name}</h4>
                      <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className={`h-3 w-3 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Services Section */}
        <ServicesSection />
      </main>

      <Footer />

      <BlogDialog
        blog={selectedBlog}
        isOpen={isBlogDialogOpen}
        onClose={() => setIsBlogDialogOpen(false)}
        whatsappNumber={contactInfo?.whatsapp}
      />
    </div>
  );
};

export default Index;