import { useEffect, useRef } from 'react';
import Link from 'next/link';
import SEOHead from '@/components/SEOHead';
import { useGlobalData } from '@/hooks/useGlobalData';
import { Button } from '@/components/ui/button';
import { Award, Shield, Heart, Globe, Sparkles, Users, Clock, Target, Gem, Diamond, Crown, Zap } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import logo1 from '@/assets/2.jpg';
import logo2 from '@/assets/3.jpg';
import logo3 from '@/assets/04.jpg';
import logo4 from '@/assets/05.jpg';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const { categories, promoHeader } = useGlobalData();
  const animationRef = useRef<gsap.Context | null>(null);

  const hasPromo = promoHeader?.enabled && promoHeader?.text;
  const promoHeight = hasPromo ? 40 : 0;
  const paddingTop = promoHeight + 80 + 52;

  useEffect(() => {
    animationRef.current = gsap.context(() => {
      gsap.from('.about-hero-title', {
        scrollTrigger: { trigger: '.about-hero', start: 'top 80%', once: true },
        y: 60, opacity: 0, duration: 1, ease: 'power3.out',
      });

      gsap.from('.story-image', {
        scrollTrigger: { trigger: '.story-section', start: 'top 70%', once: true },
        scale: 0.9, opacity: 0, stagger: 0.2, duration: 0.8, ease: 'power2.out',
      });
    });

    return () => animationRef.current?.revert();
  }, []);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Starlink Jewels - Premium Diamond Jewelry Since 2011',
    description: 'Learn about Starlink Jewels - a premier luxury jewelry brand with over 29 years of excellence in diamond and gold jewelry craftsmanship.',
    url: 'https://starlinkjewels.com/about',
    mainEntity: {
      '@type': 'Organization',
      name: 'Starlink Jewels',
      foundingDate: '2011',
      numberOfEmployees: '50+',
      areaServed: 'Worldwide',
      award: 'GIA Certified Partner',
      knowsAbout: ['Diamond Jewelry', 'Gold Jewelry', 'Custom Jewelry Design', 'Lab Grown Diamonds']
    }
  };

  const coreValues = [
    { icon: Award, title: 'Excellence', description: 'We never compromise on quality, ensuring every piece meets our exacting standards.', color: 'from-amber-500/20 to-yellow-500/20' },
    { icon: Shield, title: 'Integrity', description: 'Transparency and honesty in all our dealings, from sourcing to customer service.', color: 'from-blue-500/20 to-cyan-500/20' },
    { icon: Heart, title: 'Passion', description: 'Every creation is infused with love and dedication to the art of jewelry making.', color: 'from-rose-500/20 to-pink-500/20' },
    { icon: Globe, title: 'Sustainability', description: 'Committed to ethical sourcing and environmentally responsible practices.', color: 'from-emerald-500/20 to-green-500/20' },
  ];

  const expertise = [
    { icon: Users, title: 'Master Artisans', description: 'Our team of skilled craftsmen brings decades of experience to every piece.' },
    { icon: Clock, title: 'Timeless Designs', description: 'We create pieces that transcend trends, offering elegance that lasts a lifetime.' },
    { icon: Shield, title: 'Certified Quality', description: 'All our jewelry comes with international certifications and lifetime warranty.' },
    { icon: Gem, title: 'Rare Gemstones', description: 'Access to the finest diamonds and gemstones from trusted sources worldwide.' },
  ];

  return (
    <>
      <SEOHead
        title="About Us - 11+ Years of Diamond Jewelry Excellence | Starlink Jewels"
        description="Discover Starlink Jewels - 11+ years of crafting exceptional GIA certified diamond and gold jewelry. Master craftsmanship, ethical sourcing, 50K+ happy clients worldwide. Learn our story."
        keywords="about starlink jewels, jewelry brand story, luxury jewelry heritage, diamond jewelry craftsmanship, GIA certified jeweler, ethical diamond sourcing, custom jewelry makers, best jewelry store India, diamond manufacturer, wholesale jewelry supplier"
        canonicalUrl="https://starlinkjewels.com/about"
        structuredData={structuredData}
      />
        {/* Hero Section */}
        <section className="about-hero relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-500" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
                <Crown className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Est. 2011</span>
              </div>
              <h1 className="about-hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Crafting Dreams Into Reality
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              For Over 11 Years, Starlink Jewels Has Been Transforming Precious Metals and Gems Into Timeless Masterpieces that Celebrate Life&rsquo;s Most Precious Moments.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="story-section py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 text-primary font-semibold">
                  <Diamond className="h-5 w-5" />
                  <span>Our Journey</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">A Legacy of Excellence</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full" />
                <p className="text-lg text-muted-foreground leading-relaxed">
                Founded withStarlink Jewels Is a Modern Fine Jewelry Manufacturer and Supplier, Specializing in Both Lab-Grown and Natural Diamond Jewelry. with A Strong Focus on Craftsmanship, Ethical Sourcing, and Precision, We Create Timeless Designs that Blend Luxury with Everyday Wearability. Every Piece Is Made to Order, Ensuring Superior Quality, Attention to Detail, and Complete Customization for Our Clients.

                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                We Proudly Serve Jewelers and Buyers Across the Worldwide, Offering Reliable Production, Competitive Pricing, and Consistent Quality. from Concept and Cad Design to Final Polishing and Secure Worldwide Delivery, We Manage the Entire Process In-House—giving Our Clients Confidence, Transparency, and Peace of Mind.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Fast Delivery</span>
                  </div>
                  <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Certified Quality</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  logo1,
                  logo2,
                  logo3,
                  logo4,
                ].map((src, i) => (
                  <div key={i} className={`story-image aspect-square rounded-2xl overflow-hidden shadow-xl ${i % 2 === 1 ? 'mt-8' : ''}`}>
                    <img src={src} alt="Jewelry craftsmanship" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
              
              <div className="group relative bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent p-8 sm:p-12 rounded-3xl border border-border overflow-hidden hover:border-primary/40 transition-all duration-500">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4">Our Vision</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed" style={{fontWeight:"bold"}}>
                  To Become a Globally Trusted Jewelry Manufacturing Partner, Known for Innovation, Ethical Diamonds, and Exceptional Craftsmanship, While Setting New Standards in Quality and Design for The Modern Jewelry Industry.
                  </p>
                </div>
              </div>
              <div className="group relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 sm:p-12 rounded-3xl border border-primary/20 overflow-hidden hover:border-primary/40 transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4">Our Mission</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed" style={{fontWeight:"bold"}}>
                  Our Mission Is to Deliver Finely Crafted Diamond Jewelry that Meets International Standards, Supports Sustainable Practices, and Helps Our Partners Grow Their Businesses. We Are Committed to Combining Advanced Technology, Skilled Artistry, and Honest Pricing to Create Lasting Value for Every Customer.
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Our Core Values</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">The principles that guide everything we do</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {coreValues.map((value, index) => (
                <article key={index} className={`group text-center p-8 rounded-3xl bg-gradient-to-br ${value.color} border border-border hover:shadow-2xl hover:-translate-y-2 transition-all duration-500`}>
                  <div className="w-20 h-20 rounded-2xl bg-background/80 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <value.icon className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Expertise */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Why Choose Us</h2>
              <p className="text-lg text-muted-foreground">Experience that makes the difference</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {expertise.map((item, index) => (
                <article key={index} className="group flex gap-6 p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {[
                { value: '11+', label: 'Years Experience' },
                { value: '50K+', label: 'Happy Clients' },
                { value: '30+', label: 'Countries Served' },
                { value: '10K+', label: 'Unique Designs' },
              ].map((stat, index) => (
                <div key={index} className="stat-item text-center">
                  <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm sm:text-base opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-muted/50 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Begin Your Journey With Us</h2>
              <p className="text-lg text-muted-foreground mb-8">Discover the perfect piece that tells your unique story</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/categories"><Button size="lg" className="text-lg h-14 px-8">Browse Collections</Button></Link>
                <Link href="/contact"><Button size="lg" variant="outline" className="text-lg h-14 px-8">Schedule Consultation</Button></Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  };

  export default About;