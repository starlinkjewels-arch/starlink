import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import MiniHeader from '@/components/MiniHeader';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import BlogDialog from '@/components/BlogDialog';
import { useAppSelector } from "@/store/hooks";
import { selectGlobalData } from "@/store/contentSlice";
import { Card, CardContent } from '@/components/ui/card';
import { BlogPost } from '@/lib/storage';
import { buildMetaDescriptionForBlog, buildMetaTitleForBlog } from '@/lib/seo';

const Blog = () => {
  const { categories, blogs, promoHeader, contactInfo } = useAppSelector(selectGlobalData);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const hasPromo = promoHeader?.enabled && promoHeader?.text;
  const promoHeight = hasPromo ? 40 : 0;
  const paddingTop = promoHeight + 80 + 52 + 12 + 26;

  const sortedBlogs = useMemo(
    () => [...blogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [blogs]
  );

  // Handle URL query param to open specific blog
  useEffect(() => {
    const blogId = searchParams.get('id');
    if (blogId && blogs.length > 0) {
      const blog = blogs.find(b => b.id === blogId);
      if (blog) {
        setSelectedBlog(blog);
        setIsDialogOpen(true);
      }
    }
  }, [searchParams, blogs]);

  const handleBlogClick = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setIsDialogOpen(true);
    setSearchParams({ id: blog.id });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSearchParams({});
  };

  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Starlink Jewels Blog - Expert Jewelry Insights & Guides',
    description: 'Expert insights, trends, and comprehensive guides about luxury jewelry, diamonds, gemstones, and precious metals from Starlink Jewels.',
    url: 'https://www.starlinkjewels.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Starlink Jewels',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.starlinkjewels.com/icon.png'
      }
    },
    blogPost: sortedBlogs.slice(0, 10).map(blog => ({
      '@type': 'BlogPosting',
      headline: blog.title,
      datePublished: blog.date,
      dateModified: blog.date,
      image: blog.image,
      description: blog.content.substring(0, 160),
      author: {
        '@type': 'Organization',
        name: 'Starlink Jewels'
      }
    })),
  };

  const blogStructuredData = selectedBlog
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: selectedBlog.title,
        datePublished: selectedBlog.date,
        dateModified: selectedBlog.date,
        image: selectedBlog.image,
        description: buildMetaDescriptionForBlog(selectedBlog.content),
        author: {
          '@type': 'Organization',
          name: 'Starlink Jewels',
        },
        mainEntityOfPage: `https://www.starlinkjewels.com/blog?id=${selectedBlog.id}`,
      }
    : undefined;

  const structuredData = [
    baseStructuredData,
    ...(blogStructuredData ? [blogStructuredData] : []),
  ];

  const seoTitle = selectedBlog
    ? (selectedBlog.metaTitle || buildMetaTitleForBlog(selectedBlog.title))
    : "Jewelry Blog - Diamond Tips, Engagement Ring Guides & Luxury Trends | Starlink Jewels";

  const seoDescription = selectedBlog
    ? (selectedBlog.metaDescription || buildMetaDescriptionForBlog(selectedBlog.content))
    : "Discover expert jewelry insights, diamond buying guides, engagement ring tips, gemstone education, and the latest luxury jewelry trends from Starlink Jewels experts.";

  const defaultFaqItems = [
    {
      question: "What topics do you cover in the Starlink Jewels blog?",
      answer:
        "We cover diamond buying guides, engagement ring tips, jewelry care, gemstone education, and luxury jewelry trends.",
    },
    {
      question: "Are your blog guides suitable for lab-grown and natural diamonds?",
      answer:
        "Yes. Our guides explain both lab-grown and natural diamond options with practical buying advice.",
    },
    {
      question: "Can I request a topic?",
      answer:
        "Yes. You can contact us to request specific jewelry or diamond topics.",
    },
  ];
  const faqItems = selectedBlog?.seoFaq && selectedBlog.seoFaq.length > 0 ? selectedBlog.seoFaq : defaultFaqItems;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords="jewelry blog, diamond buying guide, engagement ring tips, jewelry trends 2024, gemstone guide, diamond education, luxury jewelry tips, how to buy diamonds, jewelry care tips, wedding ring guide, precious stones, gold jewelry guide, platinum jewelry, custom jewelry design, jewelry investment"
        canonicalUrl={`https://www.starlinkjewels.com/blog${selectedBlog ? `?id=${selectedBlog.id}` : ''}`}
        structuredData={structuredData}
        breadcrumbs={[
          { name: "Home", url: "https://www.starlinkjewels.com" },
          { name: "Blog", url: "https://www.starlinkjewels.com/blog" },
        ]}
        faqItems={faqItems}
      />

      <Header promoHeader={promoHeader} />
      <MiniHeader categories={categories} promoHeight={promoHeight} />

      <main className="flex-1 container mx-auto px-4 py-12" style={{ paddingTop: `${paddingTop}px` }}>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Jewelry Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover expert insights, diamond buying guides, and the latest trends in luxury jewelry. 
            Your trusted source for jewelry education and inspiration.
          </p>
        </div>

        {sortedBlogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">No blog posts yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedBlogs.map((blog) => (
              <article key={blog.id}>
                <Card 
                  className="overflow-hidden hover-lift group h-full cursor-pointer transition-all duration-300 hover:shadow-xl"
                  onClick={() => handleBlogClick(blog)}
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img 
                      src={blog.thumbnail || blog.image} 
                      alt={blog.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      loading="lazy" 
                    />
                  </div>
                  <CardContent className="p-4">
                    <time dateTime={blog.date} className="text-xs text-muted-foreground mb-2 block uppercase tracking-wider">
                      {new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </time>
                    <h2 className="font-semibold text-base md:text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {blog.title}
                    </h2>
                  </CardContent>
                </Card>
              </article>
            ))}
          </div>
        )}

        {categories.length > 0 && (
          <section className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Explore Jewelry Collections</h2>
              <p className="text-base text-muted-foreground">Discover categories you may love</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  className="rounded-xl border bg-card/50 p-3 text-center hover:bg-card transition-colors"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                    <img src={category.image} alt={category.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <p className="text-sm font-semibold">Shop {category.name} Jewelry</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />

      <BlogDialog
        blog={selectedBlog}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        whatsappNumber={contactInfo?.whatsapp}
      />
    </div>
  );
};

export default Blog;
